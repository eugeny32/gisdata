const SortWorkerCode = `
// ============================================================
// Worker 全局状态（对齐 PlayCanvas）
// ============================================================
let centers = null;              // Float32Array: [x,y,z, x,y,z, ...]
let order = null;                // Uint32Array: 排序后的索引
let distances = null;            // Uint32Array: 量化后的深度值
let countBuffer = null;          // Uint32Array: 动态大小的计数桶
let chunks = null;               // Float32Array: [cx,cy,cz,r, ...] 每个 chunk 的包围球
let mapping = null;              // Uint32Array: LOD 子集索引映射（可选）

// 相机状态
let cameraPosition = null;       // { x, y, z }
let cameraDirection = null;      // { x, y, z }
let lastCameraPosition = { x: 0, y: 0, z: 0 };
let lastCameraDirection = { x: 0, y: 0, z: 0 };
let forceUpdate = false;

// 场景包围盒
let boundMin = { x: 0, y: 0, z: 0 };
let boundMax = { x: 0, y: 0, z: 0 };

// ============================================================
// Chunk 优化：分 bin 精度分配系统
// ============================================================
const numBins = 32;
const binCount = new Array(numBins).fill(0);
const binBase = new Array(numBins).fill(0);
const binDivider = new Array(numBins).fill(0);

// ============================================================
// 二分查找工具函数（用于后方剔除）
// ============================================================
const binarySearch = (m, n, compare_fn) => {
  while (m <= n) {
    const k = (n + m) >> 1;
    const cmp = compare_fn(k);
    if (cmp > 0) {
      m = k + 1;
    } else if (cmp < 0) {
      n = k - 1;
    } else {
      return k;
    }
  }
  return ~m;
};

// ============================================================
// 核心排序函数（对齐 PlayCanvas update）
// ============================================================
const update = () => {
  if (!order || !centers || centers.length === 0 || !cameraPosition || !cameraDirection) {
    return;
  }

  const px = cameraPosition.x;
  const py = cameraPosition.y;
  const pz = cameraPosition.z;
  const dx = cameraDirection.x;
  const dy = cameraDirection.y;
  const dz = cameraDirection.z;

  // 相机阈值判断
  const epsilon = 0.001;

  if (!forceUpdate &&
      Math.abs(px - lastCameraPosition.x) < epsilon &&
      Math.abs(py - lastCameraPosition.y) < epsilon &&
      Math.abs(pz - lastCameraPosition.z) < epsilon &&
      Math.abs(dx - lastCameraDirection.x) < epsilon &&
      Math.abs(dy - lastCameraDirection.y) < epsilon &&
      Math.abs(dz - lastCameraDirection.z) < epsilon) {
    return;
  }

  forceUpdate = false;

  lastCameraPosition.x = px;
  lastCameraPosition.y = py;
  lastCameraPosition.z = pz;
  lastCameraDirection.x = dx;
  lastCameraDirection.y = dy;
  lastCameraDirection.z = dz;

  // AABB 8角距离范围计算（对齐 PlayCanvas）
  let minDist;
  let maxDist;
  for (let i = 0; i < 8; ++i) {
    const x = (i & 1 ? boundMin.x : boundMax.x);
    const y = (i & 2 ? boundMin.y : boundMax.y);
    const z = (i & 4 ? boundMin.z : boundMax.z);
    const d = x * dx + y * dy + z * dz;
    if (i === 0) {
      minDist = maxDist = d;
    } else {
      minDist = Math.min(minDist, d);
      maxDist = Math.max(maxDist, d);
    }
  }

  const numVertices = centers.length / 3;

  // 动态 bit 分配
  const compareBits = Math.max(10, Math.min(20, Math.round(Math.log2(numVertices / 4))));
  const bucketCount = 2 ** compareBits + 1;

  // 分配 distances 和 countBuffer
  if (distances?.length !== numVertices) {
    distances = new Uint32Array(numVertices);
  }

  if (!countBuffer || countBuffer.length !== bucketCount) {
    countBuffer = new Uint32Array(bucketCount);
  } else {
    countBuffer.fill(0);
  }

  const range = maxDist - minDist;

  if (range < 1e-6) {
    // 所有点在同一深度
    for (let i = 0; i < numVertices; ++i) {
      distances[i] = 0;
      countBuffer[0]++;
    }
  } else {
    // Chunk 直方图优化精度分配（对齐 PlayCanvas）
    const numChunks = chunks.length / 4;

    binCount.fill(0);
    for (let i = 0; i < numChunks; ++i) {
      const x = chunks[i * 4 + 0];
      const y = chunks[i * 4 + 1];
      const z = chunks[i * 4 + 2];
      const r = chunks[i * 4 + 3];
      const d = x * dx + y * dy + z * dz - minDist;

      const binMin = Math.max(0, Math.floor((d - r) * numBins / range));
      const binMax = Math.min(numBins, Math.ceil((d + r) * numBins / range));

      for (let j = binMin; j < binMax; ++j) {
        binCount[j]++;
      }
    }

    // 计算 bin 总数
    const binTotal = binCount.reduce((a, b) => a + b, 0);

    // 计算每个 bin 的 base 和 divider
    for (let i = 0; i < numBins; ++i) {
      binDivider[i] = (binCount[i] / binTotal * bucketCount) >>> 0;
    }
    for (let i = 0; i < numBins; ++i) {
      binBase[i] = i === 0 ? 0 : binBase[i - 1] + binDivider[i - 1];
    }

    // 计算每个 splat 的排序键
    const binRange = range / numBins;
    let ii = 0;
    for (let i = 0; i < numVertices; ++i) {
      const x = centers[ii++];
      const y = centers[ii++];
      const z = centers[ii++];
      const d = (x * dx + y * dy + z * dz - minDist) / binRange;
      const bin = d >>> 0;
      const sortKey = (binBase[bin] + binDivider[bin] * (d - bin)) >>> 0;

      distances[i] = sortKey;
      countBuffer[sortKey]++;
    }
  }

  // 累积计数
  for (let i = 1; i < bucketCount; i++) {
    countBuffer[i] += countBuffer[i - 1];
  }

  // 构建排序结果
  for (let i = 0; i < numVertices; i++) {
    const distance = distances[i];
    const destIndex = --countBuffer[distance];
    order[destIndex] = i;
  }

  // 后方剔除（对齐 PlayCanvas findZero）
  const cameraDist = px * dx + py * dy + pz * dz;
  const dist = (i) => {
    let o = order[i] * 3;
    return centers[o++] * dx + centers[o++] * dy + centers[o] * dz - cameraDist;
  };
  const findZero = () => {
    const result = binarySearch(0, numVertices - 1, i => -dist(i));
    return Math.min(numVertices, Math.abs(result));
  };

  const count = dist(numVertices - 1) >= 0 ? findZero() : numVertices;

  // 应用 Mapping（LOD 子集索引重映射）
  if (mapping) {
    for (let i = 0; i < numVertices; ++i) {
      order[i] = mapping[order[i]];
    }
  }

  // 发送结果
  self.postMessage({
    order: order.buffer,
    count
  }, [order.buffer]);

  order = null;
};

// ============================================================
// 消息处理器（对齐 PlayCanvas）
// ============================================================
self.onmessage = function(e) {
  const data = e.data;

  // 处理 order buffer
  if (data.order) {
    order = new Uint32Array(data.order);
  }

  // 初始化数据
  if (data.centers) {
    centers = new Float32Array(data.centers);
    forceUpdate = true;

    if (data.chunks) {
      // 使用预传入的 chunks（6 floats/chunk: min/max）
      const chunksSrc = new Float32Array(data.chunks);
      chunks = new Float32Array(data.chunks, 0, chunksSrc.length * 4 / 6);

      boundMin.x = chunksSrc[0];
      boundMin.y = chunksSrc[1];
      boundMin.z = chunksSrc[2];
      boundMax.x = chunksSrc[3];
      boundMax.y = chunksSrc[4];
      boundMax.z = chunksSrc[5];

      // 转换 min/max 为 center/radius
      for (let i = 0; i < chunksSrc.length / 6; ++i) {
        const mx = chunksSrc[i * 6 + 0];
        const my = chunksSrc[i * 6 + 1];
        const mz = chunksSrc[i * 6 + 2];
        const Mx = chunksSrc[i * 6 + 3];
        const My = chunksSrc[i * 6 + 4];
        const Mz = chunksSrc[i * 6 + 5];

        chunks[i * 4 + 0] = (mx + Mx) * 0.5;
        chunks[i * 4 + 1] = (my + My) * 0.5;
        chunks[i * 4 + 2] = (mz + Mz) * 0.5;
        chunks[i * 4 + 3] = Math.sqrt((Mx - mx) ** 2 + (My - my) ** 2 + (Mz - mz) ** 2) * 0.5;

        if (mx < boundMin.x) boundMin.x = mx;
        if (my < boundMin.y) boundMin.y = my;
        if (mz < boundMin.z) boundMin.z = mz;
        if (Mx > boundMax.x) boundMax.x = Mx;
        if (My > boundMax.y) boundMax.y = My;
        if (Mz > boundMax.z) boundMax.z = Mz;
      }
    } else {
      // 自动从 centers 计算 chunks（每 256 个 splat 一组）
      const numVertices = centers.length / 3;
      const numChunks = Math.ceil(numVertices / 256);

      chunks = new Float32Array(numChunks * 4);

      boundMin.x = boundMin.y = boundMin.z = Infinity;
      boundMax.x = boundMax.y = boundMax.z = -Infinity;

      let mx, my, mz, Mx, My, Mz;
      for (let c = 0; c < numChunks; ++c) {
        mx = my = mz = Infinity;
        Mx = My = Mz = -Infinity;

        const start = c * 256;
        const end = Math.min(numVertices, (c + 1) * 256);
        for (let i = start; i < end; ++i) {
          const x = centers[i * 3 + 0];
          const y = centers[i * 3 + 1];
          const z = centers[i * 3 + 2];

          const validX = Number.isFinite(x);
          const validY = Number.isFinite(y);
          const validZ = Number.isFinite(z);

          if (!validX) centers[i * 3 + 0] = 0;
          if (!validY) centers[i * 3 + 1] = 0;
          if (!validZ) centers[i * 3 + 2] = 0;
          if (!validX || !validY || !validZ) {
            continue;
          }

          if (x < mx) mx = x; else if (x > Mx) Mx = x;
          if (y < my) my = y; else if (y > My) My = y;
          if (z < mz) mz = z; else if (z > Mz) Mz = z;

          if (x < boundMin.x) boundMin.x = x; else if (x > boundMax.x) boundMax.x = x;
          if (y < boundMin.y) boundMin.y = y; else if (y > boundMax.y) boundMax.y = y;
          if (z < boundMin.z) boundMin.z = z; else if (z > boundMax.z) boundMax.z = z;
        }

        // 存储 chunk 包围球
        chunks[c * 4 + 0] = (mx + Mx) * 0.5;
        chunks[c * 4 + 1] = (my + My) * 0.5;
        chunks[c * 4 + 2] = (mz + Mz) * 0.5;
        chunks[c * 4 + 3] = Math.sqrt((Mx - mx) ** 2 + (My - my) ** 2 + (Mz - mz) ** 2) * 0.5;
      }
    }
  }

  // Mapping 更新
  if (data.hasOwnProperty('mapping')) {
    mapping = data.mapping ? new Uint32Array(data.mapping) : null;
    forceUpdate = true;
  }

  // 相机状态更新
  if (data.cameraPosition) cameraPosition = data.cameraPosition;
  if (data.cameraDirection) cameraDirection = data.cameraDirection;

  update();
};
`;
export { SortWorkerCode };
