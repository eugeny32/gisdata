const FACE_DEFS = [
  { axis: "x", sign: 1, color: [0.85, 0.25, 0.25], pos: [0.5, 0, 0], rot: [0, 90, 0] },
  { axis: "x", sign: -1, color: [0.45, 0.12, 0.12], pos: [-0.5, 0, 0], rot: [0, -90, 0] },
  { axis: "y", sign: 1, color: [0.25, 0.75, 0.25], pos: [0, 0.5, 0], rot: [-90, 0, 0] },
  { axis: "y", sign: -1, color: [0.12, 0.4, 0.12], pos: [0, -0.5, 0], rot: [90, 0, 0] },
  { axis: "z", sign: 1, color: [0.3, 0.45, 0.85], pos: [0, 0, 0.5], rot: [0, 0, 0] },
  { axis: "z", sign: -1, color: [0.15, 0.22, 0.45], pos: [0, 0, -0.5], rot: [0, 180, 0] }
];
const GIZMO_PRESETS = {
  x1: { yaw: 90, pitch: 0 },
  "x-1": { yaw: -90, pitch: 0 },
  y1: { yaw: 0, pitch: -89.9 },
  "y-1": { yaw: 0, pitch: 89.9 },
  z1: { yaw: 0, pitch: 0 },
  "z-1": { yaw: 180, pitch: 0 }
};
function createNavCubeGizmo(pc, app) {
  const gizmoLayer = new pc.Layer({ name: "GizmoLayer" });
  app.scene.layers.push(gizmoLayer);
  const gizmoRoot = new pc.Entity("gizmoRoot");
  app.root.addChild(gizmoRoot);
  for (const f of FACE_DEFS) {
    const plane = new pc.Entity("gizmoFace_" + f.axis + f.sign);
    plane.addComponent("render", { type: "plane" });
    const mat = new pc.StandardMaterial();
    const color = new pc.Color(f.color[0], f.color[1], f.color[2]);
    mat.diffuse = color;
    mat.emissive = color;
    mat.useLighting = false;
    mat.update();
    plane.render.material = mat;
    plane.render.layers = [gizmoLayer.id];
    plane.setLocalPosition(f.pos[0] * 0.9, f.pos[1] * 0.9, f.pos[2] * 0.9);
    plane.setLocalEulerAngles(f.rot[0], f.rot[1], f.rot[2]);
    plane.setLocalScale(0.9, 1, 0.9);
    gizmoRoot.addChild(plane);
  }
  const gizmoCamera = new pc.Entity("gizmoCamera");
  gizmoCamera.addComponent("camera", {
    clearColor: new pc.Color(0, 0, 0, 0),
    clearColorBuffer: true,
    layers: [gizmoLayer.id],
    priority: 1,
    // рисуется после основной камеры — поверх неё
    rect: new pc.Vec4(0.84, 0.03, 0.14, 0.14)
  });
  app.root.addChild(gizmoCamera);
  function updateTransform(yaw, pitch) {
    const yawQ = new pc.Quat().setFromEulerAngles(0, yaw, 0);
    const pitchQ = new pc.Quat().setFromEulerAngles(pitch, 0, 0);
    const rot = yawQ.clone().mul(pitchQ);
    const offset = rot.transformVector(new pc.Vec3(0, 0, 3));
    gizmoCamera.setPosition(offset.x, offset.y, offset.z);
    gizmoCamera.lookAt(0, 0, 0);
  }
  function handlePointerDown(e, canvas) {
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    const r = gizmoCamera.camera.rect;
    const vx = r.x * cw;
    const vw = r.z * cw;
    const vyTop = (1 - r.y - r.w) * ch;
    const vh = r.w * ch;
    if (px < vx || px > vx + vw || py < vyTop || py > vyTop + vh) return null;
    const cam = gizmoCamera.camera;
    const near = cam.screenToWorld(px, py, cam.nearClip);
    const far = cam.screenToWorld(px, py, cam.farClip);
    const dir = far.clone().sub(near).normalize();
    let tMin = -Infinity;
    let tMax = Infinity;
    let hitAxis = null;
    let hitSign = 0;
    for (const axis of ["x", "y", "z"]) {
      const o = near[axis];
      const d = dir[axis];
      if (Math.abs(d) < 1e-9) {
        if (o < -0.5 || o > 0.5) return null;
        continue;
      }
      let t1 = (-0.5 - o) / d;
      let t2 = (0.5 - o) / d;
      let sign = -1;
      if (t1 > t2) {
        [t1, t2] = [t2, t1];
        sign = 1;
      }
      if (t1 > tMin) {
        tMin = t1;
        hitAxis = axis;
        hitSign = sign;
      }
      tMax = Math.min(tMax, t2);
      if (tMin > tMax) return null;
    }
    if (!hitAxis) return null;
    const preset = GIZMO_PRESETS[hitAxis + hitSign];
    return preset ? { ...preset } : null;
  }
  return { updateTransform, handlePointerDown };
}
const AXIS_FIX_ROTATION = [-0.7071, 0, 0, 0.7071];
async function loadSplatFiles(pc, app, urls, target, setDistance, updateCameraTransform, isCurrent, showProgress) {
  let fileIndex = 0;
  for (const url of urls) {
    if (!isCurrent()) return;
    fileIndex++;
    const filePrefix = urls.length > 1 ? `Файл ${fileIndex} из ${urls.length}: ` : "";
    showProgress(`${filePrefix}Загрузка модели...`, 0);
    await new Promise((resolve, reject) => {
      const asset = new pc.Asset("splat-" + fileIndex, "gsplat", { url, filename: url.split("/").pop() });
      app.assets.add(asset);
      asset.on("progress", (received, total) => {
        const pct = total ? received / total * 100 : 0;
        showProgress(`${filePrefix}Загрузка модели... ${Math.round(pct)}%`, pct);
      });
      asset.on("error", (err) => reject(new Error(String(err))));
      asset.on("load", () => {
        if (!isCurrent()) {
          resolve();
          return;
        }
        const resource = asset.resource;
        const entity = new pc.Entity("splat-" + fileIndex);
        entity.setLocalRotation(...AXIS_FIX_ROTATION);
        entity.addComponent("gsplat", { asset });
        app.root.addChild(entity);
        if (fileIndex === 1) {
          const aabb = resource && resource.aabb;
          if (resource && resource.gsplatData && typeof resource.gsplatData.calcFocalPoint === "function") {
            const focal = new pc.Vec3();
            resource.gsplatData.calcFocalPoint(focal);
            entity.getWorldTransform().transformPoint(focal, focal);
            target.copy(focal);
          } else if (aabb) {
            target.copy(aabb.center);
          }
          if (aabb) setDistance(Math.max(aabb.halfExtents.length() * 1.3, 0.5));
          updateCameraTransform();
        }
        resolve();
      });
      app.assets.load(asset);
    });
  }
}
function createPointCloudMaterial(pc, pointSizePx) {
  const material = new pc.ShaderMaterial({
    uniqueName: "GisdataLasPointCloudShader",
    attributes: { aPosition: pc.SEMANTIC_POSITION, aColor: pc.SEMANTIC_COLOR },
    vertexGLSL: `
      attribute vec3 aPosition;
      attribute vec4 aColor;
      uniform mat4 matrix_model;
      uniform mat4 matrix_viewProjection;
      uniform float uPointSize;
      varying vec4 vColor;
      void main(void) {
        vColor = aColor;
        vec4 worldPos = matrix_model * vec4(aPosition, 1.0);
        gl_Position = matrix_viewProjection * worldPos;
        gl_PointSize = uPointSize;
      }
    `,
    fragmentGLSL: `
      precision mediump float;
      varying vec4 vColor;
      void main(void) {
        gl_FragColor = vColor;
      }
    `
  });
  material.setParameter("uPointSize", pointSizePx);
  material.update();
  return material;
}
function hslToRgb(h, s, l) {
  const k = (n) => (n + h * 12) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)];
}
async function fetchWithProgress(url, onProgress) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error("HTTP " + resp.status);
  const total = Number(resp.headers.get("content-length")) || 0;
  const reader = resp.body.getReader();
  const chunks = [];
  let received = 0;
  for (; ; ) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    onProgress(received, total);
  }
  const buf = new Uint8Array(received);
  let offset = 0;
  for (const c of chunks) {
    buf.set(c, offset);
    offset += c.length;
  }
  return buf.buffer;
}
async function loadLasFiles(pc, app, urls, _target, setDistance, updateCameraTransform, isCurrent, showProgress, pointSizePx, outMaterials) {
  const { parse: parse2 } = await import("@loaders.gl/core");
  const { LASLoader } = await import("@loaders.gl/las");
  let centerOffset = null;
  let extent = 1;
  let fileIndex = 0;
  for (const url of urls) {
    if (!isCurrent()) return;
    fileIndex++;
    const filePrefix = urls.length > 1 ? `Файл ${fileIndex} из ${urls.length}: ` : "";
    const buffer = await fetchWithProgress(url, (received, total) => {
      const pct = total ? received / total * 100 : 0;
      showProgress(`${filePrefix}Загрузка LAS... ${Math.round(pct)}%`, pct);
    });
    if (!isCurrent()) return;
    showProgress(`${filePrefix}Разбор LAS...`, 100);
    const data = await parse2(buffer, LASLoader);
    if (!isCurrent()) return;
    const posAttr = data.attributes && data.attributes.POSITION;
    if (!posAttr) continue;
    const pos = posAttr.value;
    const count = pos.length / 3;
    if (!centerOffset) {
      let sumX = 0;
      let sumY = 0;
      let sumZ = 0;
      for (let i = 0; i < count; i++) {
        sumX += pos[i * 3];
        sumY += pos[i * 3 + 1];
        sumZ += pos[i * 3 + 2];
      }
      const meanX = sumX / count;
      const meanY = sumY / count;
      const meanZ = sumZ / count;
      let varX = 0;
      let varY = 0;
      let varZ = 0;
      for (let i = 0; i < count; i++) {
        varX += (pos[i * 3] - meanX) ** 2;
        varY += (pos[i * 3 + 1] - meanY) ** 2;
        varZ += (pos[i * 3 + 2] - meanZ) ** 2;
      }
      const stdX = Math.sqrt(varX / count);
      const stdY = Math.sqrt(varY / count);
      const stdZ = Math.sqrt(varZ / count);
      centerOffset = { x: meanX, y: meanY, z: meanZ };
      extent = Math.max(stdX, stdY, stdZ, 1) * 3;
      setDistance(Math.max(extent * 1.8, 0.5));
      updateCameraTransform();
    }
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = pos[i * 3] - centerOffset.x;
      positions[i * 3 + 1] = pos[i * 3 + 1] - centerOffset.y;
      positions[i * 3 + 2] = pos[i * 3 + 2] - centerOffset.z;
    }
    const colorAttr = data.attributes.COLOR_0 && data.attributes.COLOR_0.value;
    const colors = new Uint8Array(count * 4);
    let hasRealColor = false;
    if (colorAttr) {
      const size = data.attributes.COLOR_0.size || 4;
      let maxRGB = 0;
      for (let i = 0; i < count; i++) {
        const r = colorAttr[i * size];
        const g = colorAttr[i * size + 1];
        const b = colorAttr[i * size + 2];
        if (r > maxRGB) maxRGB = r;
        if (g > maxRGB) maxRGB = g;
        if (b > maxRGB) maxRGB = b;
      }
      hasRealColor = maxRGB > 0;
    }
    if (hasRealColor) {
      const size = data.attributes.COLOR_0.size || 4;
      for (let i = 0; i < count; i++) {
        colors[i * 4] = colorAttr[i * size];
        colors[i * 4 + 1] = colorAttr[i * size + 1];
        colors[i * 4 + 2] = colorAttr[i * size + 2];
        colors[i * 4 + 3] = 255;
      }
    } else {
      for (let i = 0; i < count; i++) {
        const t = Math.max(0, Math.min(1, (positions[i * 3 + 2] + extent) / (2 * extent)));
        const [r, g, b] = hslToRgb((1 - t) * 0.66, 0.8, 0.5);
        colors[i * 4] = Math.round(r * 255);
        colors[i * 4 + 1] = Math.round(g * 255);
        colors[i * 4 + 2] = Math.round(b * 255);
        colors[i * 4 + 3] = 255;
      }
    }
    const mesh = new pc.Mesh(app.graphicsDevice);
    mesh.setPositions(positions);
    mesh.setColors32(colors);
    mesh.update(pc.PRIMITIVE_POINTS, true);
    const material = createPointCloudMaterial(pc, pointSizePx);
    outMaterials.push(material);
    const meshInstance = new pc.MeshInstance(mesh, material);
    const entity = new pc.Entity("las-" + fileIndex);
    entity.setLocalRotation(...AXIS_FIX_ROTATION);
    entity.addComponent("render", { meshInstances: [meshInstance] });
    app.root.addChild(entity);
  }
}
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getAugmentedNamespace(n) {
  if (n.__esModule) return n;
  var f = n.default;
  if (typeof f == "function") {
    var a = function a2() {
      if (this instanceof a2) {
        return Reflect.construct(f, arguments, this.constructor);
      }
      return f.apply(this, arguments);
    };
    a.prototype = f.prototype;
  } else a = {};
  Object.defineProperty(a, "__esModule", { value: true });
  Object.keys(n).forEach(function(k) {
    var d = Object.getOwnPropertyDescriptor(n, k);
    Object.defineProperty(a, k, d.get ? d : {
      enumerable: true,
      get: function() {
        return n[k];
      }
    });
  });
  return a;
}
var lib = {};
var ept$1 = {};
var ept = {};
Object.defineProperty(ept, "__esModule", { value: true });
var hierarchy$1 = {};
Object.defineProperty(hierarchy$1, "__esModule", { value: true });
hierarchy$1.Hierarchy = void 0;
hierarchy$1.Hierarchy = { parse: parse$5 };
function parse$5(e) {
  return Object.entries(e).reduce((h, [keystring, pointCount]) => {
    if (pointCount === -1)
      h.pages[keystring] = {};
    else if (pointCount)
      h.nodes[keystring] = { pointCount };
    return h;
  }, { nodes: {}, pages: {} });
}
(function(exports) {
  var __createBinding2 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === void 0) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === void 0) k2 = k;
    o[k2] = m[k];
  });
  var __exportStar = commonjsGlobal && commonjsGlobal.__exportStar || function(m, exports2) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding2(exports2, m, p);
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  __exportStar(ept, exports);
  __exportStar(hierarchy$1, exports);
})(ept$1);
var copc$1 = {};
var constants$1 = {};
Object.defineProperty(constants$1, "__esModule", { value: true });
constants$1.hierarchyItemLength = constants$1.infoLength = void 0;
constants$1.infoLength = 160;
constants$1.hierarchyItemLength = 32;
var copc = {};
var las = {};
var constants = {};
Object.defineProperty(constants, "__esModule", { value: true });
constants.evlrHeaderLength = constants.vlrHeaderLength = constants.minHeaderLength = void 0;
constants.minHeaderLength = 375;
constants.vlrHeaderLength = 54;
constants.evlrHeaderLength = 60;
var dimensions = {};
var utils$1 = {};
var bigInt = {};
Object.defineProperty(bigInt, "__esModule", { value: true });
bigInt.getBigUint64 = bigInt.parseBigInt = void 0;
function parseBigInt(v) {
  if (v > BigInt(Number.MAX_SAFE_INTEGER) || v < BigInt(-Number.MAX_SAFE_INTEGER)) {
    throw new Error(`Cannot convert bigint to number: ${v}`);
  }
  return Number(v);
}
bigInt.parseBigInt = parseBigInt;
function getBigUint64(dv, byteOffset, littleEndian) {
  if (dv.getBigUint64)
    return dv.getBigUint64(byteOffset, littleEndian);
  const [h, l] = littleEndian ? [4, 0] : [0, 4];
  const wh = BigInt(dv.getUint32(byteOffset + h, littleEndian));
  const wl = BigInt(dv.getUint32(byteOffset + l, littleEndian));
  return (wh << BigInt(32)) + wl;
}
bigInt.getBigUint64 = getBigUint64;
var binary = {};
Object.defineProperty(binary, "__esModule", { value: true });
binary.toCString = binary.toDataView = binary.Binary = void 0;
binary.Binary = { toDataView, toCString };
function toDataView(buffer) {
  return new DataView(buffer.buffer, buffer.byteOffset, buffer.length);
}
binary.toDataView = toDataView;
function toCString(buffer) {
  const dv = toDataView(buffer);
  let s = "";
  for (let i = 0; i < dv.byteLength; ++i) {
    const c = dv.getInt8(i);
    if (c === 0)
      return s;
    s += String.fromCharCode(c);
  }
  return s;
}
binary.toCString = toCString;
var bounds = {};
Object.defineProperty(bounds, "__esModule", { value: true });
bounds.Bounds = void 0;
bounds.Bounds = {
  min,
  max,
  mid,
  width,
  depth,
  height,
  cube,
  step: step$1,
  stepTo,
  intersection
};
function min(b) {
  return [b[0], b[1], b[2]];
}
function max(b) {
  return [b[3], b[4], b[5]];
}
function mid([minx, miny, minz, maxx, maxy, maxz]) {
  return [
    minx + (maxx - minx) / 2,
    miny + (maxy - miny) / 2,
    minz + (maxz - minz) / 2
  ];
}
function width(bounds2) {
  return bounds2[3] - bounds2[0];
}
function depth(bounds2) {
  return bounds2[4] - bounds2[1];
}
function height(bounds2) {
  return bounds2[5] - bounds2[2];
}
function cube(bounds2) {
  const point = mid(bounds2);
  const radius = Math.max(width(bounds2), depth(bounds2), height(bounds2)) / 2;
  return [
    point[0] - radius,
    point[1] - radius,
    point[2] - radius,
    point[0] + radius,
    point[1] + radius,
    point[2] + radius
  ];
}
function step$1(bounds2, [a, b, c]) {
  const [minx, miny, minz, maxx, maxy, maxz] = bounds2;
  const [midx, midy, midz] = mid(bounds2);
  return [
    a ? midx : minx,
    b ? midy : miny,
    c ? midz : minz,
    a ? maxx : midx,
    b ? maxy : midy,
    c ? maxz : midz
  ];
}
function stepTo(bounds2, [d, x, y, z]) {
  for (let i = d - 1; i >= 0; --i) {
    bounds2 = step$1(bounds2, [x >> i & 1, y >> i & 1, z >> i & 1]);
  }
  return bounds2;
}
function intersection(a, b) {
  return [
    Math.max(a[0], b[0]),
    Math.max(a[1], b[1]),
    Math.max(a[2], b[2]),
    Math.min(a[3], b[3]),
    Math.min(a[4], b[4]),
    Math.min(a[5], b[5])
  ];
}
var dimension = {};
Object.defineProperty(dimension, "__esModule", { value: true });
dimension.Dimension = void 0;
const Type$1 = {
  int8: { type: "signed", size: 1 },
  int16: { type: "signed", size: 2 },
  int32: { type: "signed", size: 4 },
  int64: { type: "signed", size: 8 },
  uint8: { type: "unsigned", size: 1 },
  uint16: { type: "unsigned", size: 2 },
  uint32: { type: "unsigned", size: 4 },
  uint64: { type: "unsigned", size: 8 },
  float32: { type: "float", size: 4 },
  float64: { type: "float", size: 8 },
  // Aliases.
  float: { type: "float", size: 4 },
  double: { type: "float", size: 8 },
  // Minimum size of one byte, so this is a convenience for a byte.
  bool: { type: "unsigned", size: 1 },
  boolean: { type: "unsigned", size: 1 }
};
dimension.Dimension = { Type: Type$1, ctype };
function ctype({ type, size }) {
  switch (type) {
    case "signed": {
      switch (size) {
        case 1:
          return "int8";
        case 2:
          return "int16";
        case 4:
          return "int32";
        case 8:
          return "int64";
      }
    }
    case "unsigned": {
      switch (size) {
        case 1:
          return "uint8";
        case 2:
          return "uint16";
        case 4:
          return "uint32";
        case 8:
          return "uint64";
      }
    }
    case "float": {
      switch (size) {
        case 4:
          return "float";
        case 8:
          return "double";
      }
    }
  }
  throw new Error(`Invalid dimension type/size: ${type}/${size}`);
}
var getter = {};
var browserPonyfill = { exports: {} };
(function(module, exports) {
  var __global__ = typeof globalThis !== "undefined" && globalThis || typeof self !== "undefined" && self || typeof commonjsGlobal !== "undefined" && commonjsGlobal;
  var __globalThis__ = function() {
    function F() {
      this.fetch = false;
      this.DOMException = __global__.DOMException;
    }
    F.prototype = __global__;
    return new F();
  }();
  (function(globalThis2) {
    (function(exports2) {
      var g = typeof globalThis2 !== "undefined" && globalThis2 || typeof self !== "undefined" && self || // eslint-disable-next-line no-undef
      typeof commonjsGlobal !== "undefined" && commonjsGlobal || {};
      var support = {
        searchParams: "URLSearchParams" in g,
        iterable: "Symbol" in g && "iterator" in Symbol,
        blob: "FileReader" in g && "Blob" in g && function() {
          try {
            new Blob();
            return true;
          } catch (e) {
            return false;
          }
        }(),
        formData: "FormData" in g,
        arrayBuffer: "ArrayBuffer" in g
      };
      function isDataView(obj) {
        return obj && DataView.prototype.isPrototypeOf(obj);
      }
      if (support.arrayBuffer) {
        var viewClasses = [
          "[object Int8Array]",
          "[object Uint8Array]",
          "[object Uint8ClampedArray]",
          "[object Int16Array]",
          "[object Uint16Array]",
          "[object Int32Array]",
          "[object Uint32Array]",
          "[object Float32Array]",
          "[object Float64Array]"
        ];
        var isArrayBufferView = ArrayBuffer.isView || function(obj) {
          return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1;
        };
      }
      function normalizeName(name) {
        if (typeof name !== "string") {
          name = String(name);
        }
        if (/[^a-z0-9\-#$%&'*+.^_`|~!]/i.test(name) || name === "") {
          throw new TypeError('Invalid character in header field name: "' + name + '"');
        }
        return name.toLowerCase();
      }
      function normalizeValue(value) {
        if (typeof value !== "string") {
          value = String(value);
        }
        return value;
      }
      function iteratorFor(items) {
        var iterator = {
          next: function() {
            var value = items.shift();
            return { done: value === void 0, value };
          }
        };
        if (support.iterable) {
          iterator[Symbol.iterator] = function() {
            return iterator;
          };
        }
        return iterator;
      }
      function Headers(headers) {
        this.map = {};
        if (headers instanceof Headers) {
          headers.forEach(function(value, name) {
            this.append(name, value);
          }, this);
        } else if (Array.isArray(headers)) {
          headers.forEach(function(header2) {
            if (header2.length != 2) {
              throw new TypeError("Headers constructor: expected name/value pair to be length 2, found" + header2.length);
            }
            this.append(header2[0], header2[1]);
          }, this);
        } else if (headers) {
          Object.getOwnPropertyNames(headers).forEach(function(name) {
            this.append(name, headers[name]);
          }, this);
        }
      }
      Headers.prototype.append = function(name, value) {
        name = normalizeName(name);
        value = normalizeValue(value);
        var oldValue = this.map[name];
        this.map[name] = oldValue ? oldValue + ", " + value : value;
      };
      Headers.prototype["delete"] = function(name) {
        delete this.map[normalizeName(name)];
      };
      Headers.prototype.get = function(name) {
        name = normalizeName(name);
        return this.has(name) ? this.map[name] : null;
      };
      Headers.prototype.has = function(name) {
        return this.map.hasOwnProperty(normalizeName(name));
      };
      Headers.prototype.set = function(name, value) {
        this.map[normalizeName(name)] = normalizeValue(value);
      };
      Headers.prototype.forEach = function(callback, thisArg) {
        for (var name in this.map) {
          if (this.map.hasOwnProperty(name)) {
            callback.call(thisArg, this.map[name], name, this);
          }
        }
      };
      Headers.prototype.keys = function() {
        var items = [];
        this.forEach(function(value, name) {
          items.push(name);
        });
        return iteratorFor(items);
      };
      Headers.prototype.values = function() {
        var items = [];
        this.forEach(function(value) {
          items.push(value);
        });
        return iteratorFor(items);
      };
      Headers.prototype.entries = function() {
        var items = [];
        this.forEach(function(value, name) {
          items.push([name, value]);
        });
        return iteratorFor(items);
      };
      if (support.iterable) {
        Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
      }
      function consumed(body) {
        if (body._noBody) return;
        if (body.bodyUsed) {
          return Promise.reject(new TypeError("Already read"));
        }
        body.bodyUsed = true;
      }
      function fileReaderReady(reader) {
        return new Promise(function(resolve, reject) {
          reader.onload = function() {
            resolve(reader.result);
          };
          reader.onerror = function() {
            reject(reader.error);
          };
        });
      }
      function readBlobAsArrayBuffer(blob) {
        var reader = new FileReader();
        var promise = fileReaderReady(reader);
        reader.readAsArrayBuffer(blob);
        return promise;
      }
      function readBlobAsText(blob) {
        var reader = new FileReader();
        var promise = fileReaderReady(reader);
        var match = /charset=([A-Za-z0-9_-]+)/.exec(blob.type);
        var encoding = match ? match[1] : "utf-8";
        reader.readAsText(blob, encoding);
        return promise;
      }
      function readArrayBufferAsText(buf) {
        var view2 = new Uint8Array(buf);
        var chars = new Array(view2.length);
        for (var i = 0; i < view2.length; i++) {
          chars[i] = String.fromCharCode(view2[i]);
        }
        return chars.join("");
      }
      function bufferClone(buf) {
        if (buf.slice) {
          return buf.slice(0);
        } else {
          var view2 = new Uint8Array(buf.byteLength);
          view2.set(new Uint8Array(buf));
          return view2.buffer;
        }
      }
      function Body() {
        this.bodyUsed = false;
        this._initBody = function(body) {
          this.bodyUsed = this.bodyUsed;
          this._bodyInit = body;
          if (!body) {
            this._noBody = true;
            this._bodyText = "";
          } else if (typeof body === "string") {
            this._bodyText = body;
          } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
            this._bodyBlob = body;
          } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
            this._bodyFormData = body;
          } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
            this._bodyText = body.toString();
          } else if (support.arrayBuffer && support.blob && isDataView(body)) {
            this._bodyArrayBuffer = bufferClone(body.buffer);
            this._bodyInit = new Blob([this._bodyArrayBuffer]);
          } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
            this._bodyArrayBuffer = bufferClone(body);
          } else {
            this._bodyText = body = Object.prototype.toString.call(body);
          }
          if (!this.headers.get("content-type")) {
            if (typeof body === "string") {
              this.headers.set("content-type", "text/plain;charset=UTF-8");
            } else if (this._bodyBlob && this._bodyBlob.type) {
              this.headers.set("content-type", this._bodyBlob.type);
            } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
              this.headers.set("content-type", "application/x-www-form-urlencoded;charset=UTF-8");
            }
          }
        };
        if (support.blob) {
          this.blob = function() {
            var rejected = consumed(this);
            if (rejected) {
              return rejected;
            }
            if (this._bodyBlob) {
              return Promise.resolve(this._bodyBlob);
            } else if (this._bodyArrayBuffer) {
              return Promise.resolve(new Blob([this._bodyArrayBuffer]));
            } else if (this._bodyFormData) {
              throw new Error("could not read FormData body as blob");
            } else {
              return Promise.resolve(new Blob([this._bodyText]));
            }
          };
        }
        this.arrayBuffer = function() {
          if (this._bodyArrayBuffer) {
            var isConsumed = consumed(this);
            if (isConsumed) {
              return isConsumed;
            } else if (ArrayBuffer.isView(this._bodyArrayBuffer)) {
              return Promise.resolve(
                this._bodyArrayBuffer.buffer.slice(
                  this._bodyArrayBuffer.byteOffset,
                  this._bodyArrayBuffer.byteOffset + this._bodyArrayBuffer.byteLength
                )
              );
            } else {
              return Promise.resolve(this._bodyArrayBuffer);
            }
          } else if (support.blob) {
            return this.blob().then(readBlobAsArrayBuffer);
          } else {
            throw new Error("could not read as ArrayBuffer");
          }
        };
        this.text = function() {
          var rejected = consumed(this);
          if (rejected) {
            return rejected;
          }
          if (this._bodyBlob) {
            return readBlobAsText(this._bodyBlob);
          } else if (this._bodyArrayBuffer) {
            return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer));
          } else if (this._bodyFormData) {
            throw new Error("could not read FormData body as text");
          } else {
            return Promise.resolve(this._bodyText);
          }
        };
        if (support.formData) {
          this.formData = function() {
            return this.text().then(decode);
          };
        }
        this.json = function() {
          return this.text().then(JSON.parse);
        };
        return this;
      }
      var methods = ["CONNECT", "DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT", "TRACE"];
      function normalizeMethod(method) {
        var upcased = method.toUpperCase();
        return methods.indexOf(upcased) > -1 ? upcased : method;
      }
      function Request(input, options) {
        if (!(this instanceof Request)) {
          throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.');
        }
        options = options || {};
        var body = options.body;
        if (input instanceof Request) {
          if (input.bodyUsed) {
            throw new TypeError("Already read");
          }
          this.url = input.url;
          this.credentials = input.credentials;
          if (!options.headers) {
            this.headers = new Headers(input.headers);
          }
          this.method = input.method;
          this.mode = input.mode;
          this.signal = input.signal;
          if (!body && input._bodyInit != null) {
            body = input._bodyInit;
            input.bodyUsed = true;
          }
        } else {
          this.url = String(input);
        }
        this.credentials = options.credentials || this.credentials || "same-origin";
        if (options.headers || !this.headers) {
          this.headers = new Headers(options.headers);
        }
        this.method = normalizeMethod(options.method || this.method || "GET");
        this.mode = options.mode || this.mode || null;
        this.signal = options.signal || this.signal || function() {
          if ("AbortController" in g) {
            var ctrl = new AbortController();
            return ctrl.signal;
          }
        }();
        this.referrer = null;
        if ((this.method === "GET" || this.method === "HEAD") && body) {
          throw new TypeError("Body not allowed for GET or HEAD requests");
        }
        this._initBody(body);
        if (this.method === "GET" || this.method === "HEAD") {
          if (options.cache === "no-store" || options.cache === "no-cache") {
            var reParamSearch = /([?&])_=[^&]*/;
            if (reParamSearch.test(this.url)) {
              this.url = this.url.replace(reParamSearch, "$1_=" + (/* @__PURE__ */ new Date()).getTime());
            } else {
              var reQueryString = /\?/;
              this.url += (reQueryString.test(this.url) ? "&" : "?") + "_=" + (/* @__PURE__ */ new Date()).getTime();
            }
          }
        }
      }
      Request.prototype.clone = function() {
        return new Request(this, { body: this._bodyInit });
      };
      function decode(body) {
        var form = new FormData();
        body.trim().split("&").forEach(function(bytes) {
          if (bytes) {
            var split = bytes.split("=");
            var name = split.shift().replace(/\+/g, " ");
            var value = split.join("=").replace(/\+/g, " ");
            form.append(decodeURIComponent(name), decodeURIComponent(value));
          }
        });
        return form;
      }
      function parseHeaders(rawHeaders) {
        var headers = new Headers();
        var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, " ");
        preProcessedHeaders.split("\r").map(function(header2) {
          return header2.indexOf("\n") === 0 ? header2.substr(1, header2.length) : header2;
        }).forEach(function(line) {
          var parts = line.split(":");
          var key2 = parts.shift().trim();
          if (key2) {
            var value = parts.join(":").trim();
            try {
              headers.append(key2, value);
            } catch (error) {
              console.warn("Response " + error.message);
            }
          }
        });
        return headers;
      }
      Body.call(Request.prototype);
      function Response(bodyInit, options) {
        if (!(this instanceof Response)) {
          throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.');
        }
        if (!options) {
          options = {};
        }
        this.type = "default";
        this.status = options.status === void 0 ? 200 : options.status;
        if (this.status < 200 || this.status > 599) {
          throw new RangeError("Failed to construct 'Response': The status provided (0) is outside the range [200, 599].");
        }
        this.ok = this.status >= 200 && this.status < 300;
        this.statusText = options.statusText === void 0 ? "" : "" + options.statusText;
        this.headers = new Headers(options.headers);
        this.url = options.url || "";
        this._initBody(bodyInit);
      }
      Body.call(Response.prototype);
      Response.prototype.clone = function() {
        return new Response(this._bodyInit, {
          status: this.status,
          statusText: this.statusText,
          headers: new Headers(this.headers),
          url: this.url
        });
      };
      Response.error = function() {
        var response = new Response(null, { status: 200, statusText: "" });
        response.ok = false;
        response.status = 0;
        response.type = "error";
        return response;
      };
      var redirectStatuses = [301, 302, 303, 307, 308];
      Response.redirect = function(url, status) {
        if (redirectStatuses.indexOf(status) === -1) {
          throw new RangeError("Invalid status code");
        }
        return new Response(null, { status, headers: { location: url } });
      };
      exports2.DOMException = g.DOMException;
      try {
        new exports2.DOMException();
      } catch (err) {
        exports2.DOMException = function(message, name) {
          this.message = message;
          this.name = name;
          var error = Error(message);
          this.stack = error.stack;
        };
        exports2.DOMException.prototype = Object.create(Error.prototype);
        exports2.DOMException.prototype.constructor = exports2.DOMException;
      }
      function fetch2(input, init) {
        return new Promise(function(resolve, reject) {
          var request = new Request(input, init);
          if (request.signal && request.signal.aborted) {
            return reject(new exports2.DOMException("Aborted", "AbortError"));
          }
          var xhr = new XMLHttpRequest();
          function abortXhr() {
            xhr.abort();
          }
          xhr.onload = function() {
            var options = {
              statusText: xhr.statusText,
              headers: parseHeaders(xhr.getAllResponseHeaders() || "")
            };
            if (request.url.indexOf("file://") === 0 && (xhr.status < 200 || xhr.status > 599)) {
              options.status = 200;
            } else {
              options.status = xhr.status;
            }
            options.url = "responseURL" in xhr ? xhr.responseURL : options.headers.get("X-Request-URL");
            var body = "response" in xhr ? xhr.response : xhr.responseText;
            setTimeout(function() {
              resolve(new Response(body, options));
            }, 0);
          };
          xhr.onerror = function() {
            setTimeout(function() {
              reject(new TypeError("Network request failed"));
            }, 0);
          };
          xhr.ontimeout = function() {
            setTimeout(function() {
              reject(new TypeError("Network request timed out"));
            }, 0);
          };
          xhr.onabort = function() {
            setTimeout(function() {
              reject(new exports2.DOMException("Aborted", "AbortError"));
            }, 0);
          };
          function fixUrl(url) {
            try {
              return url === "" && g.location.href ? g.location.href : url;
            } catch (e) {
              return url;
            }
          }
          xhr.open(request.method, fixUrl(request.url), true);
          if (request.credentials === "include") {
            xhr.withCredentials = true;
          } else if (request.credentials === "omit") {
            xhr.withCredentials = false;
          }
          if ("responseType" in xhr) {
            if (support.blob) {
              xhr.responseType = "blob";
            } else if (support.arrayBuffer) {
              xhr.responseType = "arraybuffer";
            }
          }
          if (init && typeof init.headers === "object" && !(init.headers instanceof Headers || g.Headers && init.headers instanceof g.Headers)) {
            var names = [];
            Object.getOwnPropertyNames(init.headers).forEach(function(name) {
              names.push(normalizeName(name));
              xhr.setRequestHeader(name, normalizeValue(init.headers[name]));
            });
            request.headers.forEach(function(value, name) {
              if (names.indexOf(name) === -1) {
                xhr.setRequestHeader(name, value);
              }
            });
          } else {
            request.headers.forEach(function(value, name) {
              xhr.setRequestHeader(name, value);
            });
          }
          if (request.signal) {
            request.signal.addEventListener("abort", abortXhr);
            xhr.onreadystatechange = function() {
              if (xhr.readyState === 4) {
                request.signal.removeEventListener("abort", abortXhr);
              }
            };
          }
          xhr.send(typeof request._bodyInit === "undefined" ? null : request._bodyInit);
        });
      }
      fetch2.polyfill = true;
      if (!g.fetch) {
        g.fetch = fetch2;
        g.Headers = Headers;
        g.Request = Request;
        g.Response = Response;
      }
      exports2.Headers = Headers;
      exports2.Request = Request;
      exports2.Response = Response;
      exports2.fetch = fetch2;
      Object.defineProperty(exports2, "__esModule", { value: true });
      return exports2;
    })({});
  })(__globalThis__);
  __globalThis__.fetch.ponyfill = true;
  delete __globalThis__.fetch.polyfill;
  var ctx = __global__.fetch ? __global__ : __globalThis__;
  exports = ctx.fetch;
  exports.default = ctx.fetch;
  exports.fetch = ctx.fetch;
  exports.Headers = ctx.Headers;
  exports.Request = ctx.Request;
  exports.Response = ctx.Response;
  module.exports = exports;
})(browserPonyfill, browserPonyfill.exports);
var browserPonyfillExports = browserPonyfill.exports;
const __viteBrowserExternal = {};
const __viteBrowserExternal$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: __viteBrowserExternal
}, Symbol.toStringTag, { value: "Module" }));
const require$$1 = /* @__PURE__ */ getAugmentedNamespace(__viteBrowserExternal$1);
var __createBinding$1 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
  if (k2 === void 0) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = { enumerable: true, get: function() {
      return m[k];
    } };
  }
  Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
  if (k2 === void 0) k2 = k;
  o[k2] = m[k];
});
var __setModuleDefault$1 = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function(o, v) {
  Object.defineProperty(o, "default", { enumerable: true, value: v });
} : function(o, v) {
  o["default"] = v;
});
var __importStar$1 = commonjsGlobal && commonjsGlobal.__importStar || function(mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) {
    for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding$1(result, mod, k);
  }
  __setModuleDefault$1(result, mod);
  return result;
};
var __importDefault$1 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(getter, "__esModule", { value: true });
getter.Getter = void 0;
const cross_fetch_1 = __importDefault$1(browserPonyfillExports);
getter.Getter = { create: create$4, http: getHttpGetter, file: getFsGetter };
function create$4(arg) {
  if (typeof arg === "function")
    return arg;
  if (arg.startsWith("http://") || arg.startsWith("https://")) {
    return getHttpGetter(arg);
  }
  return getFsGetter(arg);
}
function getHttpGetter(filename) {
  return async function getter2(begin, end) {
    if (begin < 0 || end < 0 || begin > end)
      throw new Error("Invalid range");
    const response = await (0, cross_fetch_1.default)(filename, {
      headers: { Range: `bytes=${begin}-${end - 1}` }
    });
    const ab = await response.arrayBuffer();
    return new Uint8Array(ab);
  };
}
function getFsGetter(filename) {
  return async function getter2(begin, end) {
    const fs = await Promise.resolve().then(() => __importStar$1(require$$1));
    async function read(begin2 = 0, end2 = Infinity) {
      if (begin2 < 0 || end2 < 0 || begin2 > end2)
        throw new Error("Invalid range");
      await fs.promises.access(filename);
      const stream = fs.createReadStream(filename, {
        start: begin2,
        end: end2 - 1,
        autoClose: true
      });
      return drain(stream);
    }
    return read(begin, end);
  };
}
async function drain(stream) {
  return await new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
}
var key = {};
(function(exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.Key = void 0;
  exports.Key = { create: create4, parse: parse2, toString, step: step2, up, compare, depth: depth2 };
  function create4(key2, x = 0, y = 0, z = 0) {
    if (typeof key2 !== "number")
      return parse2(key2);
    return [key2, x, y, z];
  }
  function parse2(s) {
    if (typeof s !== "string")
      return s;
    const [d, x, y, z, ...rest] = s.split("-").map((s2) => parseInt(s2, 10));
    const key2 = [d, x, y, z];
    if (rest.length !== 0 || key2.some((v) => typeof v !== "number" || Number.isNaN(v))) {
      throw new Error(`Invalid key: ${s}`);
    }
    return key2;
  }
  function toString(key2) {
    if (typeof key2 === "string")
      return key2;
    return key2.join("-");
  }
  function step2(key2, [a, b, c]) {
    const [d, x, y, z] = exports.Key.create(key2);
    return [d + 1, x * 2 + a, y * 2 + b, z * 2 + c];
  }
  function up(key2, n = 1) {
    const [d, x, y, z] = exports.Key.create(key2);
    return [d - n, x >> n, y >> n, z >> n];
  }
  function compare(a, b) {
    for (let i = 0; i < a.length; ++i) {
      if (a[i] < b[i])
        return -1;
      if (a[i] > b[i])
        return 1;
    }
    return 0;
  }
  function depth2(key2) {
    return key2[0];
  }
})(key);
var scale = {};
Object.defineProperty(scale, "__esModule", { value: true });
scale.Scale = void 0;
scale.Scale = {
  apply: (v, scale2 = 1, offset = 0) => (v - offset) / scale2,
  unapply: (v, scale2 = 1, offset = 0) => v * scale2 + offset
};
var step = {};
Object.defineProperty(step, "__esModule", { value: true });
step.Step = void 0;
step.Step = { fromIndex, list };
function fromIndex(i) {
  if (i < 0 || i >= 8)
    throw new Error(`Invalid step index: ${i}`);
  const x = i >> 0 & 1 ? 1 : 0;
  const y = i >> 1 & 1 ? 1 : 0;
  const z = i >> 2 & 1 ? 1 : 0;
  return [x, y, z];
}
function list() {
  return [
    [0, 0, 0],
    [0, 0, 1],
    [0, 1, 0],
    [0, 1, 1],
    [1, 0, 0],
    [1, 0, 1],
    [1, 1, 0],
    [1, 1, 1]
  ];
}
(function(exports) {
  var __createBinding2 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === void 0) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === void 0) k2 = k;
    o[k2] = m[k];
  });
  var __exportStar = commonjsGlobal && commonjsGlobal.__exportStar || function(m, exports2) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding2(exports2, m, p);
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.Step = exports.Scale = exports.Key = exports.Getter = exports.Dimension = exports.Bounds = exports.Binary = void 0;
  __exportStar(bigInt, exports);
  var binary_1 = binary;
  Object.defineProperty(exports, "Binary", { enumerable: true, get: function() {
    return binary_1.Binary;
  } });
  var bounds_1 = bounds;
  Object.defineProperty(exports, "Bounds", { enumerable: true, get: function() {
    return bounds_1.Bounds;
  } });
  var dimension_1 = dimension;
  Object.defineProperty(exports, "Dimension", { enumerable: true, get: function() {
    return dimension_1.Dimension;
  } });
  var getter_1 = getter;
  Object.defineProperty(exports, "Getter", { enumerable: true, get: function() {
    return getter_1.Getter;
  } });
  var key_1 = key;
  Object.defineProperty(exports, "Key", { enumerable: true, get: function() {
    return key_1.Key;
  } });
  var scale_1 = scale;
  Object.defineProperty(exports, "Scale", { enumerable: true, get: function() {
    return scale_1.Scale;
  } });
  var step_1 = step;
  Object.defineProperty(exports, "Step", { enumerable: true, get: function() {
    return step_1.Step;
  } });
})(utils$1);
var extraBytes = {};
Object.defineProperty(extraBytes, "__esModule", { value: true });
extraBytes.ExtraBytes = void 0;
const utils_1$9 = utils$1;
extraBytes.ExtraBytes = { getDimension, parse: parse$4, parseOne };
const entryLength = 192;
function getDimension({ type, length: size }) {
  switch (type) {
    case "signed":
    case "unsigned":
      switch (size) {
        case 1:
        case 2:
        case 4:
        case 8:
          return { type, size };
      }
    case "float":
      switch (size) {
        case 4:
        case 8:
          return { type, size };
      }
  }
}
function parse$4(buffer) {
  if (buffer.byteLength % entryLength !== 0) {
    throw new Error(`Invalid extra bytes VLR length: ${buffer.byteLength}`);
  }
  const result = [];
  for (let offset = 0; offset < buffer.byteLength; offset += entryLength) {
    result.push(parseOne(buffer.slice(offset, offset + entryLength)));
  }
  return result;
}
function parseOne(buffer) {
  if (buffer.byteLength !== entryLength) {
    throw new Error(`Invalid extra bytes entry length: ${buffer.byteLength}`);
  }
  const dv = utils_1$9.Binary.toDataView(buffer);
  const name = utils_1$9.Binary.toCString(buffer.slice(4, 36));
  const description = utils_1$9.Binary.toCString(buffer.slice(60, 192));
  const rawtype = dv.getUint8(2);
  const rawoptions = dv.getUint8(3);
  if (rawtype >= 11) {
    throw new Error(`Invalid extra bytes "type" value: ${rawtype}`);
  }
  if (rawtype === 0) {
    const length2 = rawoptions;
    return { name, description, length: length2 };
  }
  const options = parseOptions(rawoptions);
  const dimtype = parseType(rawtype);
  if (!dimtype)
    throw new Error(`Failed to extract dimension type: ${rawtype}`);
  const { type, size: length } = dimtype;
  function extractAnyType(offset) {
    switch (type) {
      case "signed":
        return (0, utils_1$9.parseBigInt)(dv.getBigInt64(offset, true));
      case "unsigned":
        return (0, utils_1$9.parseBigInt)((0, utils_1$9.getBigUint64)(dv, offset, true));
      case "float":
        return dv.getFloat64(offset, true);
    }
  }
  const eb = { name, description, type, length };
  if (options.hasNodata)
    eb.nodata = extractAnyType(40);
  if (options.hasMin)
    eb.min = extractAnyType(64);
  if (options.hasMax)
    eb.max = extractAnyType(88);
  if (options.hasScale)
    eb.scale = dv.getFloat64(112);
  if (options.hasOffset)
    eb.offset = dv.getFloat64(136);
  return eb;
}
function parseType(typecode) {
  switch (typecode) {
    case 1:
      return utils_1$9.Dimension.Type.uint8;
    case 2:
      return utils_1$9.Dimension.Type.int8;
    case 3:
      return utils_1$9.Dimension.Type.uint16;
    case 4:
      return utils_1$9.Dimension.Type.int16;
    case 5:
      return utils_1$9.Dimension.Type.uint32;
    case 6:
      return utils_1$9.Dimension.Type.int32;
    case 7:
      return utils_1$9.Dimension.Type.uint64;
    case 8:
      return utils_1$9.Dimension.Type.int64;
    case 9:
      return utils_1$9.Dimension.Type.float32;
    case 10:
      return utils_1$9.Dimension.Type.float64;
  }
}
function parseOptions(v) {
  return {
    hasNodata: Boolean(v & 1),
    hasMin: Boolean(v >> 1 & 1),
    hasMax: Boolean(v >> 2 & 1),
    hasScale: Boolean(v >> 3 & 1),
    hasOffset: Boolean(v >> 4 & 1)
  };
}
Object.defineProperty(dimensions, "__esModule", { value: true });
dimensions.Dimensions = void 0;
const utils_1$8 = utils$1;
const extra_bytes_1 = extraBytes;
dimensions.Dimensions = { create: create$3 };
const { Type } = utils_1$8.Dimension;
const typemap = {
  X: Type.float64,
  Y: Type.float64,
  Z: Type.float64,
  Intensity: Type.uint16,
  ReturnNumber: Type.uint8,
  NumberOfReturns: Type.uint8,
  ScanDirectionFlag: Type.boolean,
  EdgeOfFlightLine: Type.boolean,
  Classification: Type.uint8,
  Synthetic: Type.boolean,
  KeyPoint: Type.boolean,
  Withheld: Type.boolean,
  Overlap: Type.boolean,
  ScanAngle: Type.float32,
  UserData: Type.uint8,
  PointSourceId: Type.uint16,
  GpsTime: Type.float64,
  Red: Type.uint16,
  Green: Type.uint16,
  Blue: Type.uint16,
  ScannerChannel: Type.uint8,
  Infrared: Type.uint16
};
function create$3(extractor2, eb = []) {
  return Object.keys(extractor2).reduce((map, name) => {
    const type = typemap[name];
    if (type)
      return { ...map, [name]: type };
    const e = eb.find((v) => v.name === name);
    const dimension2 = e && extra_bytes_1.ExtraBytes.getDimension(e);
    if (dimension2)
      return { ...map, [name]: dimension2 };
    throw new Error(`Failed to look up LAS type: ${name}`);
  }, {});
}
var extractor = {};
Object.defineProperty(extractor, "__esModule", { value: true });
extractor.Extractor = void 0;
const utils_1$7 = utils$1;
extractor.Extractor = { create: create$2 };
function getBasePointLength(pdrf) {
  switch (pdrf) {
    case 0:
      return 20;
    case 1:
      return 28;
    case 2:
      return 26;
    case 3:
      return 34;
    case 6:
      return 30;
    case 7:
      return 36;
    case 8:
      return 38;
    default:
      throw new Error(`Unsupported point data record format: ${pdrf}`);
  }
}
function createAbsoluteExtraBytesExtractor(header2, offset, { type, length }) {
  const getPointOffset = getPointOffsetGetter(header2);
  switch (type) {
    case "signed":
      switch (length) {
        case 1:
          return (dv, index) => dv.getInt8(getPointOffset(index) + offset);
        case 2:
          return (dv, index) => dv.getInt16(getPointOffset(index) + offset, true);
        case 4:
          return (dv, index) => dv.getInt32(getPointOffset(index) + offset, true);
        case 8:
          return (dv, index) => (0, utils_1$7.parseBigInt)(dv.getBigInt64(getPointOffset(index) + offset, true));
      }
    case "unsigned":
      switch (length) {
        case 1:
          return (dv, index) => dv.getUint8(getPointOffset(index) + offset);
        case 2:
          return (dv, index) => dv.getUint16(getPointOffset(index) + offset, true);
        case 4:
          return (dv, index) => dv.getUint32(getPointOffset(index) + offset, true);
        case 8:
          return (dv, index) => (0, utils_1$7.parseBigInt)((0, utils_1$7.getBigUint64)(dv, getPointOffset(index) + offset, true));
      }
    case "float":
      switch (length) {
        case 4:
          return (dv, index) => dv.getFloat32(getPointOffset(index) + offset, true);
        case 8:
          return (dv, index) => dv.getFloat64(getPointOffset(index) + offset, true);
      }
  }
}
function createExtras(header2, eb) {
  const basePointLength = getBasePointLength(header2.pointDataRecordFormat);
  let position = basePointLength;
  return eb.reduce((map, v) => {
    const offset = position;
    position += v.length;
    const absoluteExtractor = createAbsoluteExtraBytesExtractor(header2, offset, v);
    if (!absoluteExtractor)
      return map;
    const extractor2 = (dv, index) => utils_1$7.Scale.unapply(absoluteExtractor(dv, index), v.scale, v.offset);
    return { ...map, [v.name]: extractor2 };
  }, {});
}
function create$2(header2, eb = []) {
  const extras = createExtras(header2, eb);
  const core = (() => {
    const { pointDataRecordFormat: pdrf } = header2;
    switch (pdrf) {
      case 0:
        return create0(header2);
      case 1:
        return create1(header2);
      case 2:
        return create2(header2);
      case 3:
        return create3(header2);
      case 6:
        return create6(header2);
      case 7:
        return create7(header2);
      case 8:
        return create8(header2);
      default:
        throw new Error(`Unsupported point data record format: ${pdrf}`);
    }
  })();
  return { ...core, ...extras };
}
function create0(header2) {
  const { scale: scale2, offset } = header2;
  const getPointOffset = getPointOffsetGetter(header2);
  function getScanFlags(dv, index) {
    return dv.getUint8(getPointOffset(index) + 14);
  }
  function getFullClassification(dv, index) {
    return dv.getUint8(getPointOffset(index) + 15);
  }
  function getClassification(dv, index) {
    return getFullClassification(dv, index) & 31;
  }
  return {
    X: (dv, index) => utils_1$7.Scale.unapply(dv.getInt32(getPointOffset(index), true), scale2[0], offset[0]),
    Y: (dv, index) => utils_1$7.Scale.unapply(dv.getInt32(getPointOffset(index) + 4, true), scale2[1], offset[1]),
    Z: (dv, index) => utils_1$7.Scale.unapply(dv.getInt32(getPointOffset(index) + 8, true), scale2[2], offset[2]),
    Intensity: (dv, index) => dv.getUint16(getPointOffset(index) + 12, true),
    ReturnNumber: (dv, index) => getScanFlags(dv, index) & 7,
    NumberOfReturns: (dv, index) => (getScanFlags(dv, index) & 56) >> 3,
    ScanDirectionFlag: (dv, index) => (getScanFlags(dv, index) & 64) >> 6,
    EdgeOfFlightLine: (dv, index) => (getScanFlags(dv, index) & 128) >> 7,
    Classification: (dv, index) => {
      const classification = getClassification(dv, index);
      return classification === 12 ? 0 : classification;
    },
    Synthetic: (dv, index) => (getFullClassification(dv, index) & 32) >> 5,
    KeyPoint: (dv, index) => (getFullClassification(dv, index) & 64) >> 6,
    Withheld: (dv, index) => (getFullClassification(dv, index) & 128) >> 7,
    Overlap: (dv, index) => getClassification(dv, index) === 12 ? 1 : 0,
    ScanAngle: (dv, index) => dv.getInt8(getPointOffset(index) + 16),
    UserData: (dv, index) => dv.getUint8(getPointOffset(index) + 17),
    PointSourceId: (dv, index) => dv.getUint16(getPointOffset(index) + 18, true)
  };
}
function create1(header2) {
  const getPointOffset = getPointOffsetGetter(header2);
  return {
    ...create0(header2),
    GpsTime: (dv, index) => dv.getFloat64(getPointOffset(index) + 20, true)
  };
}
function create2(header2) {
  const getPointOffset = getPointOffsetGetter(header2);
  return {
    ...create0(header2),
    Red: (dv, index) => dv.getUint16(getPointOffset(index) + 20, true),
    Green: (dv, index) => dv.getUint16(getPointOffset(index) + 22, true),
    Blue: (dv, index) => dv.getUint16(getPointOffset(index) + 24, true)
  };
}
function create3(header2) {
  const getPointOffset = getPointOffsetGetter(header2);
  return {
    ...create0(header2),
    GpsTime: (dv, index) => dv.getFloat64(getPointOffset(index) + 20, true),
    Red: (dv, index) => dv.getUint16(getPointOffset(index) + 28, true),
    Green: (dv, index) => dv.getUint16(getPointOffset(index) + 30, true),
    Blue: (dv, index) => dv.getUint16(getPointOffset(index) + 32, true)
  };
}
function create6(header2) {
  const { scale: scale2, offset } = header2;
  const getPointOffset = getPointOffsetGetter(header2);
  function getFlags(dv, index) {
    return dv.getUint8(getPointOffset(index) + 15);
  }
  return {
    X: (dv, index) => utils_1$7.Scale.unapply(dv.getInt32(getPointOffset(index), true), scale2[0], offset[0]),
    Y: (dv, index) => utils_1$7.Scale.unapply(dv.getInt32(getPointOffset(index) + 4, true), scale2[1], offset[1]),
    Z: (dv, index) => utils_1$7.Scale.unapply(dv.getInt32(getPointOffset(index) + 8, true), scale2[2], offset[2]),
    Intensity: (dv, index) => dv.getUint16(getPointOffset(index) + 12, true),
    ReturnNumber: (dv, index) => dv.getUint16(getPointOffset(index) + 14, true) & 15,
    NumberOfReturns: (dv, index) => (dv.getUint16(getPointOffset(index) + 14, true) & 240) >> 4,
    Synthetic: (dv, index) => getFlags(dv, index) & 1,
    KeyPoint: (dv, index) => (getFlags(dv, index) & 2) >> 1,
    Withheld: (dv, index) => (getFlags(dv, index) & 4) >> 2,
    Overlap: (dv, index) => (getFlags(dv, index) & 8) >> 3,
    ScannerChannel: (dv, index) => (getFlags(dv, index) & 48) >> 4,
    ScanDirectionFlag: (dv, index) => (getFlags(dv, index) & 64) >> 6,
    EdgeOfFlightLine: (dv, index) => (getFlags(dv, index) & 128) >> 7,
    Classification: (dv, index) => dv.getUint8(getPointOffset(index) + 16),
    UserData: (dv, index) => dv.getUint8(getPointOffset(index) + 17),
    ScanAngle: (dv, index) => dv.getInt16(getPointOffset(index) + 18, true) * 6e-3,
    PointSourceId: (dv, index) => dv.getUint16(getPointOffset(index) + 20, true),
    GpsTime: (dv, index) => dv.getFloat64(getPointOffset(index) + 22, true)
  };
}
function create7(header2) {
  const getPointOffset = getPointOffsetGetter(header2);
  return {
    ...create6(header2),
    Red: (dv, index) => dv.getUint16(getPointOffset(index) + 30, true),
    Green: (dv, index) => dv.getUint16(getPointOffset(index) + 32, true),
    Blue: (dv, index) => dv.getUint16(getPointOffset(index) + 34, true)
  };
}
function create8(header2) {
  const getPointOffset = getPointOffsetGetter(header2);
  return {
    ...create7(header2),
    Infrared: (dv, index) => dv.getUint16(getPointOffset(index) + 36, true)
  };
}
function getPointOffsetGetter(header2) {
  const { pointDataRecordLength } = header2;
  return function getPointOffset(index) {
    return index * pointDataRecordLength;
  };
}
var header = {};
var utils = {};
Object.defineProperty(utils, "__esModule", { value: true });
utils.formatGuid = utils.parsePoint = void 0;
const utils_1$6 = utils$1;
function parsePoint(buffer) {
  const dv = utils_1$6.Binary.toDataView(buffer);
  if (dv.byteLength !== 24) {
    throw new Error(`Invalid tuple buffer length: ${dv.byteLength}`);
  }
  return [
    dv.getFloat64(0, true),
    dv.getFloat64(8, true),
    dv.getFloat64(16, true)
  ];
}
utils.parsePoint = parsePoint;
function formatGuid(buffer) {
  const dv = utils_1$6.Binary.toDataView(buffer);
  if (dv.byteLength !== 16) {
    throw new Error(`Invalid GUID buffer length: ${dv.byteLength}`);
  }
  let s = "";
  for (let i = 0; i < dv.byteLength; i += 4) {
    const c = dv.getUint32(i, true);
    s += c.toString(16).padStart(8, "0");
  }
  return [s.slice(0, 8), s.slice(8, 12), s.slice(12, 16), s.slice(16, 32)].join("-");
}
utils.formatGuid = formatGuid;
Object.defineProperty(header, "__esModule", { value: true });
header.Header = void 0;
const utils_1$5 = utils$1;
const constants_1$3 = constants;
const utils_2 = utils;
header.Header = { parse: parse$3 };
function parse$3(buffer) {
  if (buffer.byteLength < constants_1$3.minHeaderLength) {
    throw new Error(`Invalid header: must be at least ${constants_1$3.minHeaderLength} bytes`);
  }
  const dv = utils_1$5.Binary.toDataView(buffer);
  const fileSignature = utils_1$5.Binary.toCString(buffer.slice(0, 4));
  if (fileSignature !== "LASF") {
    throw new Error(`Invalid file signature: ${fileSignature}`);
  }
  const majorVersion = dv.getUint8(24);
  const minorVersion = dv.getUint8(25);
  if (majorVersion !== 1 || minorVersion !== 2 && minorVersion !== 4) {
    throw new Error(`Invalid version (only 1.2 and 1.4 supported): ${majorVersion}.${minorVersion}`);
  }
  const header2 = {
    fileSignature,
    fileSourceId: dv.getUint16(4, true),
    globalEncoding: dv.getUint16(6, true),
    projectId: (0, utils_2.formatGuid)(buffer.slice(8, 24)),
    majorVersion,
    minorVersion,
    systemIdentifier: utils_1$5.Binary.toCString(buffer.slice(26, 58)),
    generatingSoftware: utils_1$5.Binary.toCString(buffer.slice(58, 90)),
    fileCreationDayOfYear: dv.getUint16(90, true),
    fileCreationYear: dv.getUint16(92, true),
    headerLength: dv.getUint16(94, true),
    pointDataOffset: dv.getUint32(96, true),
    vlrCount: dv.getUint32(100, true),
    pointDataRecordFormat: dv.getUint8(104) & 15,
    pointDataRecordLength: dv.getUint16(105, true),
    pointCount: dv.getUint32(107, true),
    pointCountByReturn: parseLegacyNumberOfPointsByReturn(buffer.slice(111, 131)),
    scale: (0, utils_2.parsePoint)(buffer.slice(131, 155)),
    offset: (0, utils_2.parsePoint)(buffer.slice(155, 179)),
    min: [
      dv.getFloat64(187, true),
      dv.getFloat64(203, true),
      dv.getFloat64(219, true)
    ],
    max: [
      dv.getFloat64(179, true),
      dv.getFloat64(195, true),
      dv.getFloat64(211, true)
    ],
    waveformDataOffset: 0,
    evlrOffset: 0,
    evlrCount: 0
  };
  if (minorVersion == 2)
    return header2;
  return {
    ...header2,
    pointCount: (0, utils_1$5.parseBigInt)((0, utils_1$5.getBigUint64)(dv, 247, true)),
    pointCountByReturn: parseNumberOfPointsByReturn(buffer.slice(255, 375)),
    waveformDataOffset: (0, utils_1$5.parseBigInt)((0, utils_1$5.getBigUint64)(dv, 227, true)),
    evlrOffset: (0, utils_1$5.parseBigInt)((0, utils_1$5.getBigUint64)(dv, 235, true)),
    evlrCount: dv.getUint32(243, true)
  };
}
function parseNumberOfPointsByReturn(buffer) {
  const dv = utils_1$5.Binary.toDataView(buffer);
  const bigs = [];
  for (let offset = 0; offset < 15 * 8; offset += 8) {
    bigs.push((0, utils_1$5.getBigUint64)(dv, offset, true));
  }
  return bigs.map((v) => (0, utils_1$5.parseBigInt)(v));
}
function parseLegacyNumberOfPointsByReturn(buffer) {
  const dv = utils_1$5.Binary.toDataView(buffer);
  const v = [];
  for (let offset = 0; offset < 5 * 4; offset += 4) {
    v.push(dv.getUint32(offset, true));
  }
  return v;
}
var pointData = {};
var web = {};
var lazPerf = { exports: {} };
(function(module, exports) {
  var createLazPerf = (() => {
    var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;
    return function(createLazPerf2) {
      createLazPerf2 = createLazPerf2 || {};
      var Module = typeof createLazPerf2 != "undefined" ? createLazPerf2 : {};
      var readyPromiseResolve, readyPromiseReject;
      Module["ready"] = new Promise(function(resolve, reject) {
        readyPromiseResolve = resolve;
        readyPromiseReject = reject;
      });
      ["_main", "___getTypeName", "__embind_initialize_bindings", "_fflush", "onRuntimeInitialized"].forEach((prop) => {
        if (!Object.getOwnPropertyDescriptor(Module["ready"], prop)) {
          Object.defineProperty(Module["ready"], prop, { get: () => abort("You are getting " + prop + " on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js"), set: () => abort("You are setting " + prop + " on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js") });
        }
      });
      var moduleOverrides = Object.assign({}, Module);
      var thisProgram = "./this.program";
      var ENVIRONMENT_IS_WEB = true;
      if (Module["ENVIRONMENT"]) {
        throw new Error("Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)");
      }
      var scriptDirectory = "";
      function locateFile(path) {
        if (Module["locateFile"]) {
          return Module["locateFile"](path, scriptDirectory);
        }
        return scriptDirectory + path;
      }
      var readBinary;
      {
        if (typeof document != "undefined" && document.currentScript) {
          scriptDirectory = document.currentScript.src;
        }
        if (_scriptDir) {
          scriptDirectory = _scriptDir;
        }
        if (scriptDirectory.indexOf("blob:") !== 0) {
          scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1);
        } else {
          scriptDirectory = "";
        }
        if (!(typeof window == "object" || typeof importScripts == "function")) throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");
      }
      var out = Module["print"] || console.log.bind(console);
      var err = Module["printErr"] || console.warn.bind(console);
      Object.assign(Module, moduleOverrides);
      moduleOverrides = null;
      checkIncomingModuleAPI();
      if (Module["arguments"]) Module["arguments"];
      legacyModuleProp("arguments", "arguments_");
      if (Module["thisProgram"]) thisProgram = Module["thisProgram"];
      legacyModuleProp("thisProgram", "thisProgram");
      if (Module["quit"]) Module["quit"];
      legacyModuleProp("quit", "quit_");
      assert(typeof Module["memoryInitializerPrefixURL"] == "undefined", "Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead");
      assert(typeof Module["pthreadMainPrefixURL"] == "undefined", "Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead");
      assert(typeof Module["cdInitializerPrefixURL"] == "undefined", "Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead");
      assert(typeof Module["filePackagePrefixURL"] == "undefined", "Module.filePackagePrefixURL option was removed, use Module.locateFile instead");
      assert(typeof Module["read"] == "undefined", "Module.read option was removed (modify read_ in JS)");
      assert(typeof Module["readAsync"] == "undefined", "Module.readAsync option was removed (modify readAsync in JS)");
      assert(typeof Module["readBinary"] == "undefined", "Module.readBinary option was removed (modify readBinary in JS)");
      assert(typeof Module["setWindowTitle"] == "undefined", "Module.setWindowTitle option was removed (modify setWindowTitle in JS)");
      assert(typeof Module["TOTAL_MEMORY"] == "undefined", "Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY");
      legacyModuleProp("read", "read_");
      legacyModuleProp("readAsync", "readAsync");
      legacyModuleProp("readBinary", "readBinary");
      legacyModuleProp("setWindowTitle", "setWindowTitle");
      assert(true, "worker environment detected but not enabled at build time.  Add 'worker' to `-sENVIRONMENT` to enable.");
      assert(true, "node environment detected but not enabled at build time.  Add 'node' to `-sENVIRONMENT` to enable.");
      assert(true, "shell environment detected but not enabled at build time.  Add 'shell' to `-sENVIRONMENT` to enable.");
      function legacyModuleProp(prop, newName) {
        if (!Object.getOwnPropertyDescriptor(Module, prop)) {
          Object.defineProperty(Module, prop, { configurable: true, get: function() {
            abort("Module." + prop + " has been replaced with plain " + newName + " (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)");
          } });
        }
      }
      function ignoredModuleProp(prop) {
        if (Object.getOwnPropertyDescriptor(Module, prop)) {
          abort("`Module." + prop + "` was supplied but `" + prop + "` not included in INCOMING_MODULE_JS_API");
        }
      }
      function isExportedByForceFilesystem(name) {
        return name === "FS_createPath" || name === "FS_createDataFile" || name === "FS_createPreloadedFile" || name === "FS_unlink" || name === "addRunDependency" || name === "FS_createLazyFile" || name === "FS_createDevice" || name === "removeRunDependency";
      }
      function missingLibrarySymbol(sym) {
        if (typeof globalThis !== "undefined" && !Object.getOwnPropertyDescriptor(globalThis, sym)) {
          Object.defineProperty(globalThis, sym, { configurable: true, get: function() {
            var msg = "`" + sym + "` is a library symbol and not included by default; add it to your library.js __deps or to DEFAULT_LIBRARY_FUNCS_TO_INCLUDE on the command line";
            if (isExportedByForceFilesystem(sym)) {
              msg += ". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you";
            }
            warnOnce(msg);
            return void 0;
          } });
        }
      }
      function unexportedRuntimeSymbol(sym) {
        if (!Object.getOwnPropertyDescriptor(Module, sym)) {
          Object.defineProperty(Module, sym, { configurable: true, get: function() {
            var msg = "'" + sym + "' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)";
            if (isExportedByForceFilesystem(sym)) {
              msg += ". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you";
            }
            abort(msg);
          } });
        }
      }
      var wasmBinary;
      if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];
      legacyModuleProp("wasmBinary", "wasmBinary");
      Module["noExitRuntime"] || true;
      legacyModuleProp("noExitRuntime", "noExitRuntime");
      if (typeof WebAssembly != "object") {
        abort("no native wasm support detected");
      }
      var wasmMemory;
      var ABORT = false;
      function assert(condition, text) {
        if (!condition) {
          abort("Assertion failed" + (text ? ": " + text : ""));
        }
      }
      var UTF8Decoder = typeof TextDecoder != "undefined" ? new TextDecoder("utf8") : void 0;
      function UTF8ArrayToString(heapOrArray, idx, maxBytesToRead) {
        var endIdx = idx + maxBytesToRead;
        var endPtr = idx;
        while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
        if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
          return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
        }
        var str = "";
        while (idx < endPtr) {
          var u0 = heapOrArray[idx++];
          if (!(u0 & 128)) {
            str += String.fromCharCode(u0);
            continue;
          }
          var u1 = heapOrArray[idx++] & 63;
          if ((u0 & 224) == 192) {
            str += String.fromCharCode((u0 & 31) << 6 | u1);
            continue;
          }
          var u2 = heapOrArray[idx++] & 63;
          if ((u0 & 240) == 224) {
            u0 = (u0 & 15) << 12 | u1 << 6 | u2;
          } else {
            if ((u0 & 248) != 240) warnOnce("Invalid UTF-8 leading byte 0x" + u0.toString(16) + " encountered when deserializing a UTF-8 string in wasm memory to a JS string!");
            u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heapOrArray[idx++] & 63;
          }
          if (u0 < 65536) {
            str += String.fromCharCode(u0);
          } else {
            var ch = u0 - 65536;
            str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
          }
        }
        return str;
      }
      function UTF8ToString(ptr, maxBytesToRead) {
        return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
      }
      function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
        if (!(maxBytesToWrite > 0)) return 0;
        var startIdx = outIdx;
        var endIdx = outIdx + maxBytesToWrite - 1;
        for (var i = 0; i < str.length; ++i) {
          var u = str.charCodeAt(i);
          if (u >= 55296 && u <= 57343) {
            var u1 = str.charCodeAt(++i);
            u = 65536 + ((u & 1023) << 10) | u1 & 1023;
          }
          if (u <= 127) {
            if (outIdx >= endIdx) break;
            heap[outIdx++] = u;
          } else if (u <= 2047) {
            if (outIdx + 1 >= endIdx) break;
            heap[outIdx++] = 192 | u >> 6;
            heap[outIdx++] = 128 | u & 63;
          } else if (u <= 65535) {
            if (outIdx + 2 >= endIdx) break;
            heap[outIdx++] = 224 | u >> 12;
            heap[outIdx++] = 128 | u >> 6 & 63;
            heap[outIdx++] = 128 | u & 63;
          } else {
            if (outIdx + 3 >= endIdx) break;
            if (u > 1114111) warnOnce("Invalid Unicode code point 0x" + u.toString(16) + " encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF).");
            heap[outIdx++] = 240 | u >> 18;
            heap[outIdx++] = 128 | u >> 12 & 63;
            heap[outIdx++] = 128 | u >> 6 & 63;
            heap[outIdx++] = 128 | u & 63;
          }
        }
        heap[outIdx] = 0;
        return outIdx - startIdx;
      }
      function stringToUTF8(str, outPtr, maxBytesToWrite) {
        assert(typeof maxBytesToWrite == "number", "stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
        return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
      }
      function lengthBytesUTF8(str) {
        var len = 0;
        for (var i = 0; i < str.length; ++i) {
          var c = str.charCodeAt(i);
          if (c <= 127) {
            len++;
          } else if (c <= 2047) {
            len += 2;
          } else if (c >= 55296 && c <= 57343) {
            len += 4;
            ++i;
          } else {
            len += 3;
          }
        }
        return len;
      }
      var buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
      function updateGlobalBufferAndViews(buf) {
        buffer = buf;
        Module["HEAP8"] = HEAP8 = new Int8Array(buf);
        Module["HEAP16"] = HEAP16 = new Int16Array(buf);
        Module["HEAP32"] = HEAP32 = new Int32Array(buf);
        Module["HEAPU8"] = HEAPU8 = new Uint8Array(buf);
        Module["HEAPU16"] = HEAPU16 = new Uint16Array(buf);
        Module["HEAPU32"] = HEAPU32 = new Uint32Array(buf);
        Module["HEAPF32"] = HEAPF32 = new Float32Array(buf);
        Module["HEAPF64"] = HEAPF64 = new Float64Array(buf);
      }
      var TOTAL_STACK = 65536;
      if (Module["TOTAL_STACK"]) assert(TOTAL_STACK === Module["TOTAL_STACK"], "the stack size can no longer be determined at runtime");
      var INITIAL_MEMORY = Module["INITIAL_MEMORY"] || 262144;
      legacyModuleProp("INITIAL_MEMORY", "INITIAL_MEMORY");
      assert(INITIAL_MEMORY >= TOTAL_STACK, "INITIAL_MEMORY should be larger than TOTAL_STACK, was " + INITIAL_MEMORY + "! (TOTAL_STACK=" + TOTAL_STACK + ")");
      assert(typeof Int32Array != "undefined" && typeof Float64Array !== "undefined" && Int32Array.prototype.subarray != void 0 && Int32Array.prototype.set != void 0, "JS engine does not provide full typed array support");
      assert(!Module["wasmMemory"], "Use of `wasmMemory` detected.  Use -sIMPORTED_MEMORY to define wasmMemory externally");
      assert(INITIAL_MEMORY == 262144, "Detected runtime INITIAL_MEMORY setting.  Use -sIMPORTED_MEMORY to define wasmMemory dynamically");
      var wasmTable;
      function writeStackCookie() {
        var max2 = _emscripten_stack_get_end();
        assert((max2 & 3) == 0);
        HEAPU32[max2 >> 2] = 34821223;
        HEAPU32[max2 + 4 >> 2] = 2310721022;
        HEAPU32[0] = 1668509029;
      }
      function checkStackCookie() {
        if (ABORT) return;
        var max2 = _emscripten_stack_get_end();
        var cookie1 = HEAPU32[max2 >> 2];
        var cookie2 = HEAPU32[max2 + 4 >> 2];
        if (cookie1 != 34821223 || cookie2 != 2310721022) {
          abort("Stack overflow! Stack cookie has been overwritten at 0x" + max2.toString(16) + ", expected hex dwords 0x89BACDFE and 0x2135467, but received 0x" + cookie2.toString(16) + " 0x" + cookie1.toString(16));
        }
        if (HEAPU32[0] !== 1668509029) abort("Runtime error: The application has corrupted its heap memory area (address zero)!");
      }
      (function() {
        var h16 = new Int16Array(1);
        var h8 = new Int8Array(h16.buffer);
        h16[0] = 25459;
        if (h8[0] !== 115 || h8[1] !== 99) throw "Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)";
      })();
      var __ATPRERUN__ = [];
      var __ATINIT__ = [];
      var __ATPOSTRUN__ = [];
      var runtimeInitialized = false;
      function preRun() {
        if (Module["preRun"]) {
          if (typeof Module["preRun"] == "function") Module["preRun"] = [Module["preRun"]];
          while (Module["preRun"].length) {
            addOnPreRun(Module["preRun"].shift());
          }
        }
        callRuntimeCallbacks(__ATPRERUN__);
      }
      function initRuntime() {
        assert(!runtimeInitialized);
        runtimeInitialized = true;
        checkStackCookie();
        callRuntimeCallbacks(__ATINIT__);
      }
      function postRun() {
        checkStackCookie();
        if (Module["postRun"]) {
          if (typeof Module["postRun"] == "function") Module["postRun"] = [Module["postRun"]];
          while (Module["postRun"].length) {
            addOnPostRun(Module["postRun"].shift());
          }
        }
        callRuntimeCallbacks(__ATPOSTRUN__);
      }
      function addOnPreRun(cb) {
        __ATPRERUN__.unshift(cb);
      }
      function addOnInit(cb) {
        __ATINIT__.unshift(cb);
      }
      function addOnPostRun(cb) {
        __ATPOSTRUN__.unshift(cb);
      }
      assert(Math.imul, "This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
      assert(Math.fround, "This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
      assert(Math.clz32, "This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
      assert(Math.trunc, "This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
      var runDependencies = 0;
      var runDependencyWatcher = null;
      var dependenciesFulfilled = null;
      var runDependencyTracking = {};
      function addRunDependency(id) {
        runDependencies++;
        if (Module["monitorRunDependencies"]) {
          Module["monitorRunDependencies"](runDependencies);
        }
        {
          assert(!runDependencyTracking[id]);
          runDependencyTracking[id] = 1;
          if (runDependencyWatcher === null && typeof setInterval != "undefined") {
            runDependencyWatcher = setInterval(function() {
              if (ABORT) {
                clearInterval(runDependencyWatcher);
                runDependencyWatcher = null;
                return;
              }
              var shown = false;
              for (var dep in runDependencyTracking) {
                if (!shown) {
                  shown = true;
                  err("still waiting on run dependencies:");
                }
                err("dependency: " + dep);
              }
              if (shown) {
                err("(end of list)");
              }
            }, 1e4);
          }
        }
      }
      function removeRunDependency(id) {
        runDependencies--;
        if (Module["monitorRunDependencies"]) {
          Module["monitorRunDependencies"](runDependencies);
        }
        {
          assert(runDependencyTracking[id]);
          delete runDependencyTracking[id];
        }
        if (runDependencies == 0) {
          if (runDependencyWatcher !== null) {
            clearInterval(runDependencyWatcher);
            runDependencyWatcher = null;
          }
          if (dependenciesFulfilled) {
            var callback = dependenciesFulfilled;
            dependenciesFulfilled = null;
            callback();
          }
        }
      }
      function abort(what) {
        {
          if (Module["onAbort"]) {
            Module["onAbort"](what);
          }
        }
        what = "Aborted(" + what + ")";
        err(what);
        ABORT = true;
        var e = new WebAssembly.RuntimeError(what);
        readyPromiseReject(e);
        throw e;
      }
      var FS = { error: function() {
        abort("Filesystem support (FS) was not included. The problem is that you are using files from JS, but files were not used from C/C++, so filesystem support was not auto-included. You can force-include filesystem support with -sFORCE_FILESYSTEM");
      }, init: function() {
        FS.error();
      }, createDataFile: function() {
        FS.error();
      }, createPreloadedFile: function() {
        FS.error();
      }, createLazyFile: function() {
        FS.error();
      }, open: function() {
        FS.error();
      }, mkdev: function() {
        FS.error();
      }, registerDevice: function() {
        FS.error();
      }, analyzePath: function() {
        FS.error();
      }, loadFilesFromDB: function() {
        FS.error();
      }, ErrnoError: function ErrnoError() {
        FS.error();
      } };
      Module["FS_createDataFile"] = FS.createDataFile;
      Module["FS_createPreloadedFile"] = FS.createPreloadedFile;
      var dataURIPrefix = "data:application/octet-stream;base64,";
      function isDataURI(filename) {
        return filename.startsWith(dataURIPrefix);
      }
      function isFileURI(filename) {
        return filename.startsWith("file://");
      }
      function createExportWrapper(name, fixedasm) {
        return function() {
          var displayName = name;
          var asm = fixedasm;
          {
            asm = Module["asm"];
          }
          assert(runtimeInitialized, "native function `" + displayName + "` called before runtime initialization");
          if (!asm[name]) {
            assert(asm[name], "exported native function `" + displayName + "` not found");
          }
          return asm[name].apply(null, arguments);
        };
      }
      var wasmBinaryFile;
      wasmBinaryFile = "laz-perf.wasm";
      if (!isDataURI(wasmBinaryFile)) {
        wasmBinaryFile = locateFile(wasmBinaryFile);
      }
      function getBinary(file) {
        try {
          if (file == wasmBinaryFile && wasmBinary) {
            return new Uint8Array(wasmBinary);
          }
          if (readBinary) ;
          throw "both async and sync fetching of the wasm failed";
        } catch (err2) {
          abort(err2);
        }
      }
      function getBinaryPromise() {
        if (!wasmBinary && ENVIRONMENT_IS_WEB) {
          if (typeof fetch == "function") {
            return fetch(wasmBinaryFile, { credentials: "same-origin" }).then(function(response) {
              if (!response["ok"]) {
                throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
              }
              return response["arrayBuffer"]();
            }).catch(function() {
              return getBinary(wasmBinaryFile);
            });
          }
        }
        return Promise.resolve().then(function() {
          return getBinary(wasmBinaryFile);
        });
      }
      function createWasm() {
        var info2 = { "env": asmLibraryArg, "wasi_snapshot_preview1": asmLibraryArg };
        function receiveInstance(instance, module2) {
          var exports3 = instance.exports;
          Module["asm"] = exports3;
          wasmMemory = Module["asm"]["memory"];
          assert(wasmMemory, "memory not found in wasm exports");
          updateGlobalBufferAndViews(wasmMemory.buffer);
          wasmTable = Module["asm"]["__indirect_function_table"];
          assert(wasmTable, "table not found in wasm exports");
          addOnInit(Module["asm"]["__wasm_call_ctors"]);
          removeRunDependency("wasm-instantiate");
        }
        addRunDependency("wasm-instantiate");
        var trueModule = Module;
        function receiveInstantiationResult(result) {
          assert(Module === trueModule, "the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?");
          trueModule = null;
          receiveInstance(result["instance"]);
        }
        function instantiateArrayBuffer(receiver) {
          return getBinaryPromise().then(function(binary2) {
            return WebAssembly.instantiate(binary2, info2);
          }).then(function(instance) {
            return instance;
          }).then(receiver, function(reason) {
            err("failed to asynchronously prepare wasm: " + reason);
            if (isFileURI(wasmBinaryFile)) {
              err("warning: Loading from a file URI (" + wasmBinaryFile + ") is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing");
            }
            abort(reason);
          });
        }
        function instantiateAsync() {
          if (!wasmBinary && typeof WebAssembly.instantiateStreaming == "function" && !isDataURI(wasmBinaryFile) && typeof fetch == "function") {
            return fetch(wasmBinaryFile, { credentials: "same-origin" }).then(function(response) {
              var result = WebAssembly.instantiateStreaming(response, info2);
              return result.then(receiveInstantiationResult, function(reason) {
                err("wasm streaming compile failed: " + reason);
                err("falling back to ArrayBuffer instantiation");
                return instantiateArrayBuffer(receiveInstantiationResult);
              });
            });
          } else {
            return instantiateArrayBuffer(receiveInstantiationResult);
          }
        }
        if (Module["instantiateWasm"]) {
          try {
            var exports2 = Module["instantiateWasm"](info2, receiveInstance);
            return exports2;
          } catch (e) {
            err("Module.instantiateWasm callback failed with error: " + e);
            return false;
          }
        }
        instantiateAsync().catch(readyPromiseReject);
        return {};
      }
      function callRuntimeCallbacks(callbacks) {
        while (callbacks.length > 0) {
          callbacks.shift()(Module);
        }
      }
      function warnOnce(text) {
        if (!warnOnce.shown) warnOnce.shown = {};
        if (!warnOnce.shown[text]) {
          warnOnce.shown[text] = 1;
          err(text);
        }
      }
      function writeArrayToMemory(array, buffer2) {
        assert(array.length >= 0, "writeArrayToMemory array must have a length (should be an array or typed array)");
        HEAP8.set(array, buffer2);
      }
      function ___cxa_allocate_exception(size) {
        return _malloc(size + 24) + 24;
      }
      function ExceptionInfo(excPtr) {
        this.excPtr = excPtr;
        this.ptr = excPtr - 24;
        this.set_type = function(type) {
          HEAPU32[this.ptr + 4 >> 2] = type;
        };
        this.get_type = function() {
          return HEAPU32[this.ptr + 4 >> 2];
        };
        this.set_destructor = function(destructor) {
          HEAPU32[this.ptr + 8 >> 2] = destructor;
        };
        this.get_destructor = function() {
          return HEAPU32[this.ptr + 8 >> 2];
        };
        this.set_refcount = function(refcount) {
          HEAP32[this.ptr >> 2] = refcount;
        };
        this.set_caught = function(caught) {
          caught = caught ? 1 : 0;
          HEAP8[this.ptr + 12 >> 0] = caught;
        };
        this.get_caught = function() {
          return HEAP8[this.ptr + 12 >> 0] != 0;
        };
        this.set_rethrown = function(rethrown) {
          rethrown = rethrown ? 1 : 0;
          HEAP8[this.ptr + 13 >> 0] = rethrown;
        };
        this.get_rethrown = function() {
          return HEAP8[this.ptr + 13 >> 0] != 0;
        };
        this.init = function(type, destructor) {
          this.set_adjusted_ptr(0);
          this.set_type(type);
          this.set_destructor(destructor);
          this.set_refcount(0);
          this.set_caught(false);
          this.set_rethrown(false);
        };
        this.add_ref = function() {
          var value = HEAP32[this.ptr >> 2];
          HEAP32[this.ptr >> 2] = value + 1;
        };
        this.release_ref = function() {
          var prev = HEAP32[this.ptr >> 2];
          HEAP32[this.ptr >> 2] = prev - 1;
          assert(prev > 0);
          return prev === 1;
        };
        this.set_adjusted_ptr = function(adjustedPtr) {
          HEAPU32[this.ptr + 16 >> 2] = adjustedPtr;
        };
        this.get_adjusted_ptr = function() {
          return HEAPU32[this.ptr + 16 >> 2];
        };
        this.get_exception_ptr = function() {
          var isPointer = ___cxa_is_pointer_type(this.get_type());
          if (isPointer) {
            return HEAPU32[this.excPtr >> 2];
          }
          var adjusted = this.get_adjusted_ptr();
          if (adjusted !== 0) return adjusted;
          return this.excPtr;
        };
      }
      function ___cxa_throw(ptr, type, destructor) {
        var info2 = new ExceptionInfo(ptr);
        info2.init(type, destructor);
        throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -sNO_DISABLE_EXCEPTION_CATCHING or -sEXCEPTION_CATCHING_ALLOWED=[..] to catch.";
      }
      function __embind_register_bigint(primitiveType, name, size, minRange, maxRange) {
      }
      function getShiftFromSize(size) {
        switch (size) {
          case 1:
            return 0;
          case 2:
            return 1;
          case 4:
            return 2;
          case 8:
            return 3;
          default:
            throw new TypeError("Unknown type size: " + size);
        }
      }
      function embind_init_charCodes() {
        var codes = new Array(256);
        for (var i = 0; i < 256; ++i) {
          codes[i] = String.fromCharCode(i);
        }
        embind_charCodes = codes;
      }
      var embind_charCodes = void 0;
      function readLatin1String(ptr) {
        var ret = "";
        var c = ptr;
        while (HEAPU8[c]) {
          ret += embind_charCodes[HEAPU8[c++]];
        }
        return ret;
      }
      var awaitingDependencies = {};
      var registeredTypes = {};
      var typeDependencies = {};
      var char_0 = 48;
      var char_9 = 57;
      function makeLegalFunctionName(name) {
        if (void 0 === name) {
          return "_unknown";
        }
        name = name.replace(/[^a-zA-Z0-9_]/g, "$");
        var f = name.charCodeAt(0);
        if (f >= char_0 && f <= char_9) {
          return "_" + name;
        }
        return name;
      }
      function createNamedFunction(name, body) {
        name = makeLegalFunctionName(name);
        return function() {
          return body.apply(this, arguments);
        };
      }
      function extendError(baseErrorType, errorName) {
        var errorClass = createNamedFunction(errorName, function(message) {
          this.name = errorName;
          this.message = message;
          var stack = new Error(message).stack;
          if (stack !== void 0) {
            this.stack = this.toString() + "\n" + stack.replace(/^Error(:[^\n]*)?\n/, "");
          }
        });
        errorClass.prototype = Object.create(baseErrorType.prototype);
        errorClass.prototype.constructor = errorClass;
        errorClass.prototype.toString = function() {
          if (this.message === void 0) {
            return this.name;
          } else {
            return this.name + ": " + this.message;
          }
        };
        return errorClass;
      }
      var BindingError = void 0;
      function throwBindingError(message) {
        throw new BindingError(message);
      }
      var InternalError = void 0;
      function throwInternalError(message) {
        throw new InternalError(message);
      }
      function whenDependentTypesAreResolved(myTypes, dependentTypes, getTypeConverters) {
        myTypes.forEach(function(type) {
          typeDependencies[type] = dependentTypes;
        });
        function onComplete(typeConverters2) {
          var myTypeConverters = getTypeConverters(typeConverters2);
          if (myTypeConverters.length !== myTypes.length) {
            throwInternalError("Mismatched type converter count");
          }
          for (var i = 0; i < myTypes.length; ++i) {
            registerType(myTypes[i], myTypeConverters[i]);
          }
        }
        var typeConverters = new Array(dependentTypes.length);
        var unregisteredTypes = [];
        var registered = 0;
        dependentTypes.forEach((dt, i) => {
          if (registeredTypes.hasOwnProperty(dt)) {
            typeConverters[i] = registeredTypes[dt];
          } else {
            unregisteredTypes.push(dt);
            if (!awaitingDependencies.hasOwnProperty(dt)) {
              awaitingDependencies[dt] = [];
            }
            awaitingDependencies[dt].push(() => {
              typeConverters[i] = registeredTypes[dt];
              ++registered;
              if (registered === unregisteredTypes.length) {
                onComplete(typeConverters);
              }
            });
          }
        });
        if (0 === unregisteredTypes.length) {
          onComplete(typeConverters);
        }
      }
      function registerType(rawType, registeredInstance, options = {}) {
        if (!("argPackAdvance" in registeredInstance)) {
          throw new TypeError("registerType registeredInstance requires argPackAdvance");
        }
        var name = registeredInstance.name;
        if (!rawType) {
          throwBindingError('type "' + name + '" must have a positive integer typeid pointer');
        }
        if (registeredTypes.hasOwnProperty(rawType)) {
          if (options.ignoreDuplicateRegistrations) {
            return;
          } else {
            throwBindingError("Cannot register type '" + name + "' twice");
          }
        }
        registeredTypes[rawType] = registeredInstance;
        delete typeDependencies[rawType];
        if (awaitingDependencies.hasOwnProperty(rawType)) {
          var callbacks = awaitingDependencies[rawType];
          delete awaitingDependencies[rawType];
          callbacks.forEach((cb) => cb());
        }
      }
      function __embind_register_bool(rawType, name, size, trueValue, falseValue) {
        var shift = getShiftFromSize(size);
        name = readLatin1String(name);
        registerType(rawType, { name, "fromWireType": function(wt) {
          return !!wt;
        }, "toWireType": function(destructors, o) {
          return o ? trueValue : falseValue;
        }, "argPackAdvance": 8, "readValueFromPointer": function(pointer) {
          var heap;
          if (size === 1) {
            heap = HEAP8;
          } else if (size === 2) {
            heap = HEAP16;
          } else if (size === 4) {
            heap = HEAP32;
          } else {
            throw new TypeError("Unknown boolean type size: " + name);
          }
          return this["fromWireType"](heap[pointer >> shift]);
        }, destructorFunction: null });
      }
      function ClassHandle_isAliasOf(other) {
        if (!(this instanceof ClassHandle)) {
          return false;
        }
        if (!(other instanceof ClassHandle)) {
          return false;
        }
        var leftClass = this.$$.ptrType.registeredClass;
        var left = this.$$.ptr;
        var rightClass = other.$$.ptrType.registeredClass;
        var right = other.$$.ptr;
        while (leftClass.baseClass) {
          left = leftClass.upcast(left);
          leftClass = leftClass.baseClass;
        }
        while (rightClass.baseClass) {
          right = rightClass.upcast(right);
          rightClass = rightClass.baseClass;
        }
        return leftClass === rightClass && left === right;
      }
      function shallowCopyInternalPointer(o) {
        return { count: o.count, deleteScheduled: o.deleteScheduled, preservePointerOnDelete: o.preservePointerOnDelete, ptr: o.ptr, ptrType: o.ptrType, smartPtr: o.smartPtr, smartPtrType: o.smartPtrType };
      }
      function throwInstanceAlreadyDeleted(obj) {
        function getInstanceTypeName(handle) {
          return handle.$$.ptrType.registeredClass.name;
        }
        throwBindingError(getInstanceTypeName(obj) + " instance already deleted");
      }
      var finalizationRegistry = false;
      function detachFinalizer(handle) {
      }
      function runDestructor($$) {
        if ($$.smartPtr) {
          $$.smartPtrType.rawDestructor($$.smartPtr);
        } else {
          $$.ptrType.registeredClass.rawDestructor($$.ptr);
        }
      }
      function releaseClassHandle($$) {
        $$.count.value -= 1;
        var toDelete = 0 === $$.count.value;
        if (toDelete) {
          runDestructor($$);
        }
      }
      function downcastPointer(ptr, ptrClass, desiredClass) {
        if (ptrClass === desiredClass) {
          return ptr;
        }
        if (void 0 === desiredClass.baseClass) {
          return null;
        }
        var rv = downcastPointer(ptr, ptrClass, desiredClass.baseClass);
        if (rv === null) {
          return null;
        }
        return desiredClass.downcast(rv);
      }
      var registeredPointers = {};
      function getInheritedInstanceCount() {
        return Object.keys(registeredInstances).length;
      }
      function getLiveInheritedInstances() {
        var rv = [];
        for (var k in registeredInstances) {
          if (registeredInstances.hasOwnProperty(k)) {
            rv.push(registeredInstances[k]);
          }
        }
        return rv;
      }
      var deletionQueue = [];
      function flushPendingDeletes() {
        while (deletionQueue.length) {
          var obj = deletionQueue.pop();
          obj.$$.deleteScheduled = false;
          obj["delete"]();
        }
      }
      var delayFunction = void 0;
      function setDelayFunction(fn) {
        delayFunction = fn;
        if (deletionQueue.length && delayFunction) {
          delayFunction(flushPendingDeletes);
        }
      }
      function init_embind() {
        Module["getInheritedInstanceCount"] = getInheritedInstanceCount;
        Module["getLiveInheritedInstances"] = getLiveInheritedInstances;
        Module["flushPendingDeletes"] = flushPendingDeletes;
        Module["setDelayFunction"] = setDelayFunction;
      }
      var registeredInstances = {};
      function getBasestPointer(class_, ptr) {
        if (ptr === void 0) {
          throwBindingError("ptr should not be undefined");
        }
        while (class_.baseClass) {
          ptr = class_.upcast(ptr);
          class_ = class_.baseClass;
        }
        return ptr;
      }
      function getInheritedInstance(class_, ptr) {
        ptr = getBasestPointer(class_, ptr);
        return registeredInstances[ptr];
      }
      function makeClassHandle(prototype, record) {
        if (!record.ptrType || !record.ptr) {
          throwInternalError("makeClassHandle requires ptr and ptrType");
        }
        var hasSmartPtrType = !!record.smartPtrType;
        var hasSmartPtr = !!record.smartPtr;
        if (hasSmartPtrType !== hasSmartPtr) {
          throwInternalError("Both smartPtrType and smartPtr must be specified");
        }
        record.count = { value: 1 };
        return attachFinalizer(Object.create(prototype, { $$: { value: record } }));
      }
      function RegisteredPointer_fromWireType(ptr) {
        var rawPointer = this.getPointee(ptr);
        if (!rawPointer) {
          this.destructor(ptr);
          return null;
        }
        var registeredInstance = getInheritedInstance(this.registeredClass, rawPointer);
        if (void 0 !== registeredInstance) {
          if (0 === registeredInstance.$$.count.value) {
            registeredInstance.$$.ptr = rawPointer;
            registeredInstance.$$.smartPtr = ptr;
            return registeredInstance["clone"]();
          } else {
            var rv = registeredInstance["clone"]();
            this.destructor(ptr);
            return rv;
          }
        }
        function makeDefaultHandle() {
          if (this.isSmartPointer) {
            return makeClassHandle(this.registeredClass.instancePrototype, { ptrType: this.pointeeType, ptr: rawPointer, smartPtrType: this, smartPtr: ptr });
          } else {
            return makeClassHandle(this.registeredClass.instancePrototype, { ptrType: this, ptr });
          }
        }
        var actualType = this.registeredClass.getActualType(rawPointer);
        var registeredPointerRecord = registeredPointers[actualType];
        if (!registeredPointerRecord) {
          return makeDefaultHandle.call(this);
        }
        var toType;
        if (this.isConst) {
          toType = registeredPointerRecord.constPointerType;
        } else {
          toType = registeredPointerRecord.pointerType;
        }
        var dp = downcastPointer(rawPointer, this.registeredClass, toType.registeredClass);
        if (dp === null) {
          return makeDefaultHandle.call(this);
        }
        if (this.isSmartPointer) {
          return makeClassHandle(toType.registeredClass.instancePrototype, { ptrType: toType, ptr: dp, smartPtrType: this, smartPtr: ptr });
        } else {
          return makeClassHandle(toType.registeredClass.instancePrototype, { ptrType: toType, ptr: dp });
        }
      }
      function attachFinalizer(handle) {
        if ("undefined" === typeof FinalizationRegistry) {
          attachFinalizer = (handle2) => handle2;
          return handle;
        }
        finalizationRegistry = new FinalizationRegistry((info2) => {
          console.warn(info2.leakWarning.stack.replace(/^Error: /, ""));
          releaseClassHandle(info2.$$);
        });
        attachFinalizer = (handle2) => {
          var $$ = handle2.$$;
          var hasSmartPtr = !!$$.smartPtr;
          if (hasSmartPtr) {
            var info2 = { $$ };
            var cls = $$.ptrType.registeredClass;
            info2.leakWarning = new Error("Embind found a leaked C++ instance " + cls.name + " <0x" + $$.ptr.toString(16) + ">.\nWe'll free it automatically in this case, but this functionality is not reliable across various environments.\nMake sure to invoke .delete() manually once you're done with the instance instead.\nOriginally allocated");
            if ("captureStackTrace" in Error) {
              Error.captureStackTrace(info2.leakWarning, RegisteredPointer_fromWireType);
            }
            finalizationRegistry.register(handle2, info2, handle2);
          }
          return handle2;
        };
        detachFinalizer = (handle2) => finalizationRegistry.unregister(handle2);
        return attachFinalizer(handle);
      }
      function ClassHandle_clone() {
        if (!this.$$.ptr) {
          throwInstanceAlreadyDeleted(this);
        }
        if (this.$$.preservePointerOnDelete) {
          this.$$.count.value += 1;
          return this;
        } else {
          var clone = attachFinalizer(Object.create(Object.getPrototypeOf(this), { $$: { value: shallowCopyInternalPointer(this.$$) } }));
          clone.$$.count.value += 1;
          clone.$$.deleteScheduled = false;
          return clone;
        }
      }
      function ClassHandle_delete() {
        if (!this.$$.ptr) {
          throwInstanceAlreadyDeleted(this);
        }
        if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
          throwBindingError("Object already scheduled for deletion");
        }
        detachFinalizer(this);
        releaseClassHandle(this.$$);
        if (!this.$$.preservePointerOnDelete) {
          this.$$.smartPtr = void 0;
          this.$$.ptr = void 0;
        }
      }
      function ClassHandle_isDeleted() {
        return !this.$$.ptr;
      }
      function ClassHandle_deleteLater() {
        if (!this.$$.ptr) {
          throwInstanceAlreadyDeleted(this);
        }
        if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
          throwBindingError("Object already scheduled for deletion");
        }
        deletionQueue.push(this);
        if (deletionQueue.length === 1 && delayFunction) {
          delayFunction(flushPendingDeletes);
        }
        this.$$.deleteScheduled = true;
        return this;
      }
      function init_ClassHandle() {
        ClassHandle.prototype["isAliasOf"] = ClassHandle_isAliasOf;
        ClassHandle.prototype["clone"] = ClassHandle_clone;
        ClassHandle.prototype["delete"] = ClassHandle_delete;
        ClassHandle.prototype["isDeleted"] = ClassHandle_isDeleted;
        ClassHandle.prototype["deleteLater"] = ClassHandle_deleteLater;
      }
      function ClassHandle() {
      }
      function ensureOverloadTable(proto, methodName, humanName) {
        if (void 0 === proto[methodName].overloadTable) {
          var prevFunc = proto[methodName];
          proto[methodName] = function() {
            if (!proto[methodName].overloadTable.hasOwnProperty(arguments.length)) {
              throwBindingError("Function '" + humanName + "' called with an invalid number of arguments (" + arguments.length + ") - expects one of (" + proto[methodName].overloadTable + ")!");
            }
            return proto[methodName].overloadTable[arguments.length].apply(this, arguments);
          };
          proto[methodName].overloadTable = [];
          proto[methodName].overloadTable[prevFunc.argCount] = prevFunc;
        }
      }
      function exposePublicSymbol(name, value, numArguments) {
        if (Module.hasOwnProperty(name)) {
          {
            throwBindingError("Cannot register public name '" + name + "' twice");
          }
          ensureOverloadTable(Module, name, name);
          if (Module.hasOwnProperty(numArguments)) {
            throwBindingError("Cannot register multiple overloads of a function with the same number of arguments (" + numArguments + ")!");
          }
          Module[name].overloadTable[numArguments] = value;
        } else {
          Module[name] = value;
        }
      }
      function RegisteredClass(name, constructor, instancePrototype, rawDestructor, baseClass, getActualType, upcast, downcast) {
        this.name = name;
        this.constructor = constructor;
        this.instancePrototype = instancePrototype;
        this.rawDestructor = rawDestructor;
        this.baseClass = baseClass;
        this.getActualType = getActualType;
        this.upcast = upcast;
        this.downcast = downcast;
        this.pureVirtualFunctions = [];
      }
      function upcastPointer(ptr, ptrClass, desiredClass) {
        while (ptrClass !== desiredClass) {
          if (!ptrClass.upcast) {
            throwBindingError("Expected null or instance of " + desiredClass.name + ", got an instance of " + ptrClass.name);
          }
          ptr = ptrClass.upcast(ptr);
          ptrClass = ptrClass.baseClass;
        }
        return ptr;
      }
      function constNoSmartPtrRawPointerToWireType(destructors, handle) {
        if (handle === null) {
          if (this.isReference) {
            throwBindingError("null is not a valid " + this.name);
          }
          return 0;
        }
        if (!handle.$$) {
          throwBindingError('Cannot pass "' + embindRepr(handle) + '" as a ' + this.name);
        }
        if (!handle.$$.ptr) {
          throwBindingError("Cannot pass deleted object as a pointer of type " + this.name);
        }
        var handleClass = handle.$$.ptrType.registeredClass;
        var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
        return ptr;
      }
      function genericPointerToWireType(destructors, handle) {
        var ptr;
        if (handle === null) {
          if (this.isReference) {
            throwBindingError("null is not a valid " + this.name);
          }
          if (this.isSmartPointer) {
            ptr = this.rawConstructor();
            if (destructors !== null) {
              destructors.push(this.rawDestructor, ptr);
            }
            return ptr;
          } else {
            return 0;
          }
        }
        if (!handle.$$) {
          throwBindingError('Cannot pass "' + embindRepr(handle) + '" as a ' + this.name);
        }
        if (!handle.$$.ptr) {
          throwBindingError("Cannot pass deleted object as a pointer of type " + this.name);
        }
        if (!this.isConst && handle.$$.ptrType.isConst) {
          throwBindingError("Cannot convert argument of type " + (handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name) + " to parameter type " + this.name);
        }
        var handleClass = handle.$$.ptrType.registeredClass;
        ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
        if (this.isSmartPointer) {
          if (void 0 === handle.$$.smartPtr) {
            throwBindingError("Passing raw pointer to smart pointer is illegal");
          }
          switch (this.sharingPolicy) {
            case 0:
              if (handle.$$.smartPtrType === this) {
                ptr = handle.$$.smartPtr;
              } else {
                throwBindingError("Cannot convert argument of type " + (handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name) + " to parameter type " + this.name);
              }
              break;
            case 1:
              ptr = handle.$$.smartPtr;
              break;
            case 2:
              if (handle.$$.smartPtrType === this) {
                ptr = handle.$$.smartPtr;
              } else {
                var clonedHandle = handle["clone"]();
                ptr = this.rawShare(ptr, Emval.toHandle(function() {
                  clonedHandle["delete"]();
                }));
                if (destructors !== null) {
                  destructors.push(this.rawDestructor, ptr);
                }
              }
              break;
            default:
              throwBindingError("Unsupporting sharing policy");
          }
        }
        return ptr;
      }
      function nonConstNoSmartPtrRawPointerToWireType(destructors, handle) {
        if (handle === null) {
          if (this.isReference) {
            throwBindingError("null is not a valid " + this.name);
          }
          return 0;
        }
        if (!handle.$$) {
          throwBindingError('Cannot pass "' + embindRepr(handle) + '" as a ' + this.name);
        }
        if (!handle.$$.ptr) {
          throwBindingError("Cannot pass deleted object as a pointer of type " + this.name);
        }
        if (handle.$$.ptrType.isConst) {
          throwBindingError("Cannot convert argument of type " + handle.$$.ptrType.name + " to parameter type " + this.name);
        }
        var handleClass = handle.$$.ptrType.registeredClass;
        var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
        return ptr;
      }
      function simpleReadValueFromPointer(pointer) {
        return this["fromWireType"](HEAP32[pointer >> 2]);
      }
      function RegisteredPointer_getPointee(ptr) {
        if (this.rawGetPointee) {
          ptr = this.rawGetPointee(ptr);
        }
        return ptr;
      }
      function RegisteredPointer_destructor(ptr) {
        if (this.rawDestructor) {
          this.rawDestructor(ptr);
        }
      }
      function RegisteredPointer_deleteObject(handle) {
        if (handle !== null) {
          handle["delete"]();
        }
      }
      function init_RegisteredPointer() {
        RegisteredPointer.prototype.getPointee = RegisteredPointer_getPointee;
        RegisteredPointer.prototype.destructor = RegisteredPointer_destructor;
        RegisteredPointer.prototype["argPackAdvance"] = 8;
        RegisteredPointer.prototype["readValueFromPointer"] = simpleReadValueFromPointer;
        RegisteredPointer.prototype["deleteObject"] = RegisteredPointer_deleteObject;
        RegisteredPointer.prototype["fromWireType"] = RegisteredPointer_fromWireType;
      }
      function RegisteredPointer(name, registeredClass, isReference, isConst, isSmartPointer, pointeeType, sharingPolicy, rawGetPointee, rawConstructor, rawShare, rawDestructor) {
        this.name = name;
        this.registeredClass = registeredClass;
        this.isReference = isReference;
        this.isConst = isConst;
        this.isSmartPointer = isSmartPointer;
        this.pointeeType = pointeeType;
        this.sharingPolicy = sharingPolicy;
        this.rawGetPointee = rawGetPointee;
        this.rawConstructor = rawConstructor;
        this.rawShare = rawShare;
        this.rawDestructor = rawDestructor;
        if (!isSmartPointer && registeredClass.baseClass === void 0) {
          if (isConst) {
            this["toWireType"] = constNoSmartPtrRawPointerToWireType;
            this.destructorFunction = null;
          } else {
            this["toWireType"] = nonConstNoSmartPtrRawPointerToWireType;
            this.destructorFunction = null;
          }
        } else {
          this["toWireType"] = genericPointerToWireType;
        }
      }
      function replacePublicSymbol(name, value, numArguments) {
        if (!Module.hasOwnProperty(name)) {
          throwInternalError("Replacing nonexistant public symbol");
        }
        if (void 0 !== Module[name].overloadTable && void 0 !== numArguments) ;
        else {
          Module[name] = value;
          Module[name].argCount = numArguments;
        }
      }
      function dynCallLegacy(sig, ptr, args) {
        assert("dynCall_" + sig in Module, "bad function pointer type - no table for sig '" + sig + "'");
        if (args && args.length) {
          assert(args.length === sig.substring(1).replace(/j/g, "--").length);
        } else {
          assert(sig.length == 1);
        }
        var f = Module["dynCall_" + sig];
        return args && args.length ? f.apply(null, [ptr].concat(args)) : f.call(null, ptr);
      }
      var wasmTableMirror = [];
      function getWasmTableEntry(funcPtr) {
        var func = wasmTableMirror[funcPtr];
        if (!func) {
          if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
          wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
        }
        assert(wasmTable.get(funcPtr) == func, "JavaScript-side Wasm function table mirror is out of date!");
        return func;
      }
      function dynCall(sig, ptr, args) {
        if (sig.includes("j")) {
          return dynCallLegacy(sig, ptr, args);
        }
        assert(getWasmTableEntry(ptr), "missing table entry in dynCall: " + ptr);
        var rtn = getWasmTableEntry(ptr).apply(null, args);
        return rtn;
      }
      function getDynCaller(sig, ptr) {
        assert(sig.includes("j") || sig.includes("p"), "getDynCaller should only be called with i64 sigs");
        var argCache = [];
        return function() {
          argCache.length = 0;
          Object.assign(argCache, arguments);
          return dynCall(sig, ptr, argCache);
        };
      }
      function embind__requireFunction(signature, rawFunction) {
        signature = readLatin1String(signature);
        function makeDynCaller() {
          if (signature.includes("j")) {
            return getDynCaller(signature, rawFunction);
          }
          return getWasmTableEntry(rawFunction);
        }
        var fp = makeDynCaller();
        if (typeof fp != "function") {
          throwBindingError("unknown function pointer with signature " + signature + ": " + rawFunction);
        }
        return fp;
      }
      var UnboundTypeError = void 0;
      function getTypeName(type) {
        var ptr = ___getTypeName(type);
        var rv = readLatin1String(ptr);
        _free(ptr);
        return rv;
      }
      function throwUnboundTypeError(message, types) {
        var unboundTypes = [];
        var seen = {};
        function visit(type) {
          if (seen[type]) {
            return;
          }
          if (registeredTypes[type]) {
            return;
          }
          if (typeDependencies[type]) {
            typeDependencies[type].forEach(visit);
            return;
          }
          unboundTypes.push(type);
          seen[type] = true;
        }
        types.forEach(visit);
        throw new UnboundTypeError(message + ": " + unboundTypes.map(getTypeName).join([", "]));
      }
      function __embind_register_class(rawType, rawPointerType, rawConstPointerType, baseClassRawType, getActualTypeSignature, getActualType, upcastSignature, upcast, downcastSignature, downcast, name, destructorSignature, rawDestructor) {
        name = readLatin1String(name);
        getActualType = embind__requireFunction(getActualTypeSignature, getActualType);
        if (upcast) {
          upcast = embind__requireFunction(upcastSignature, upcast);
        }
        if (downcast) {
          downcast = embind__requireFunction(downcastSignature, downcast);
        }
        rawDestructor = embind__requireFunction(destructorSignature, rawDestructor);
        var legalFunctionName = makeLegalFunctionName(name);
        exposePublicSymbol(legalFunctionName, function() {
          throwUnboundTypeError("Cannot construct " + name + " due to unbound types", [baseClassRawType]);
        });
        whenDependentTypesAreResolved([rawType, rawPointerType, rawConstPointerType], baseClassRawType ? [baseClassRawType] : [], function(base) {
          base = base[0];
          var baseClass;
          var basePrototype;
          if (baseClassRawType) {
            baseClass = base.registeredClass;
            basePrototype = baseClass.instancePrototype;
          } else {
            basePrototype = ClassHandle.prototype;
          }
          var constructor = createNamedFunction(legalFunctionName, function() {
            if (Object.getPrototypeOf(this) !== instancePrototype) {
              throw new BindingError("Use 'new' to construct " + name);
            }
            if (void 0 === registeredClass.constructor_body) {
              throw new BindingError(name + " has no accessible constructor");
            }
            var body = registeredClass.constructor_body[arguments.length];
            if (void 0 === body) {
              throw new BindingError("Tried to invoke ctor of " + name + " with invalid number of parameters (" + arguments.length + ") - expected (" + Object.keys(registeredClass.constructor_body).toString() + ") parameters instead!");
            }
            return body.apply(this, arguments);
          });
          var instancePrototype = Object.create(basePrototype, { constructor: { value: constructor } });
          constructor.prototype = instancePrototype;
          var registeredClass = new RegisteredClass(name, constructor, instancePrototype, rawDestructor, baseClass, getActualType, upcast, downcast);
          var referenceConverter = new RegisteredPointer(name, registeredClass, true, false, false);
          var pointerConverter = new RegisteredPointer(name + "*", registeredClass, false, false, false);
          var constPointerConverter = new RegisteredPointer(name + " const*", registeredClass, false, true, false);
          registeredPointers[rawType] = { pointerType: pointerConverter, constPointerType: constPointerConverter };
          replacePublicSymbol(legalFunctionName, constructor);
          return [referenceConverter, pointerConverter, constPointerConverter];
        });
      }
      function heap32VectorToArray(count, firstElement) {
        var array = [];
        for (var i = 0; i < count; i++) {
          array.push(HEAPU32[firstElement + i * 4 >> 2]);
        }
        return array;
      }
      function runDestructors(destructors) {
        while (destructors.length) {
          var ptr = destructors.pop();
          var del = destructors.pop();
          del(ptr);
        }
      }
      function craftInvokerFunction(humanName, argTypes, classType, cppInvokerFunc, cppTargetFunc) {
        var argCount = argTypes.length;
        if (argCount < 2) {
          throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!");
        }
        var isClassMethodFunc = argTypes[1] !== null && classType !== null;
        var needsDestructorStack = false;
        for (var i = 1; i < argTypes.length; ++i) {
          if (argTypes[i] !== null && argTypes[i].destructorFunction === void 0) {
            needsDestructorStack = true;
            break;
          }
        }
        var returns = argTypes[0].name !== "void";
        var expectedArgCount = argCount - 2;
        var argsWired = new Array(expectedArgCount);
        var invokerFuncArgs = [];
        var destructors = [];
        return function() {
          if (arguments.length !== expectedArgCount) {
            throwBindingError("function " + humanName + " called with " + arguments.length + " arguments, expected " + expectedArgCount + " args!");
          }
          destructors.length = 0;
          var thisWired;
          invokerFuncArgs.length = isClassMethodFunc ? 2 : 1;
          invokerFuncArgs[0] = cppTargetFunc;
          if (isClassMethodFunc) {
            thisWired = argTypes[1]["toWireType"](destructors, this);
            invokerFuncArgs[1] = thisWired;
          }
          for (var i2 = 0; i2 < expectedArgCount; ++i2) {
            argsWired[i2] = argTypes[i2 + 2]["toWireType"](destructors, arguments[i2]);
            invokerFuncArgs.push(argsWired[i2]);
          }
          var rv = cppInvokerFunc.apply(null, invokerFuncArgs);
          function onDone(rv2) {
            if (needsDestructorStack) {
              runDestructors(destructors);
            } else {
              for (var i3 = isClassMethodFunc ? 1 : 2; i3 < argTypes.length; i3++) {
                var param = i3 === 1 ? thisWired : argsWired[i3 - 2];
                if (argTypes[i3].destructorFunction !== null) {
                  argTypes[i3].destructorFunction(param);
                }
              }
            }
            if (returns) {
              return argTypes[0]["fromWireType"](rv2);
            }
          }
          return onDone(rv);
        };
      }
      function __embind_register_class_constructor(rawClassType, argCount, rawArgTypesAddr, invokerSignature, invoker, rawConstructor) {
        assert(argCount > 0);
        var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
        invoker = embind__requireFunction(invokerSignature, invoker);
        whenDependentTypesAreResolved([], [rawClassType], function(classType) {
          classType = classType[0];
          var humanName = "constructor " + classType.name;
          if (void 0 === classType.registeredClass.constructor_body) {
            classType.registeredClass.constructor_body = [];
          }
          if (void 0 !== classType.registeredClass.constructor_body[argCount - 1]) {
            throw new BindingError("Cannot register multiple constructors with identical number of parameters (" + (argCount - 1) + ") for class '" + classType.name + "'! Overload resolution is currently only performed using the parameter count, not actual type info!");
          }
          classType.registeredClass.constructor_body[argCount - 1] = () => {
            throwUnboundTypeError("Cannot construct " + classType.name + " due to unbound types", rawArgTypes);
          };
          whenDependentTypesAreResolved([], rawArgTypes, function(argTypes) {
            argTypes.splice(1, 0, null);
            classType.registeredClass.constructor_body[argCount - 1] = craftInvokerFunction(humanName, argTypes, null, invoker, rawConstructor);
            return [];
          });
          return [];
        });
      }
      function __embind_register_class_function(rawClassType, methodName, argCount, rawArgTypesAddr, invokerSignature, rawInvoker, context, isPureVirtual) {
        var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
        methodName = readLatin1String(methodName);
        rawInvoker = embind__requireFunction(invokerSignature, rawInvoker);
        whenDependentTypesAreResolved([], [rawClassType], function(classType) {
          classType = classType[0];
          var humanName = classType.name + "." + methodName;
          if (methodName.startsWith("@@")) {
            methodName = Symbol[methodName.substring(2)];
          }
          if (isPureVirtual) {
            classType.registeredClass.pureVirtualFunctions.push(methodName);
          }
          function unboundTypesHandler() {
            throwUnboundTypeError("Cannot call " + humanName + " due to unbound types", rawArgTypes);
          }
          var proto = classType.registeredClass.instancePrototype;
          var method = proto[methodName];
          if (void 0 === method || void 0 === method.overloadTable && method.className !== classType.name && method.argCount === argCount - 2) {
            unboundTypesHandler.argCount = argCount - 2;
            unboundTypesHandler.className = classType.name;
            proto[methodName] = unboundTypesHandler;
          } else {
            ensureOverloadTable(proto, methodName, humanName);
            proto[methodName].overloadTable[argCount - 2] = unboundTypesHandler;
          }
          whenDependentTypesAreResolved([], rawArgTypes, function(argTypes) {
            var memberFunction = craftInvokerFunction(humanName, argTypes, classType, rawInvoker, context);
            if (void 0 === proto[methodName].overloadTable) {
              memberFunction.argCount = argCount - 2;
              proto[methodName] = memberFunction;
            } else {
              proto[methodName].overloadTable[argCount - 2] = memberFunction;
            }
            return [];
          });
          return [];
        });
      }
      var emval_free_list = [];
      var emval_handle_array = [{}, { value: void 0 }, { value: null }, { value: true }, { value: false }];
      function __emval_decref(handle) {
        if (handle > 4 && 0 === --emval_handle_array[handle].refcount) {
          emval_handle_array[handle] = void 0;
          emval_free_list.push(handle);
        }
      }
      function count_emval_handles() {
        var count = 0;
        for (var i = 5; i < emval_handle_array.length; ++i) {
          if (emval_handle_array[i] !== void 0) {
            ++count;
          }
        }
        return count;
      }
      function get_first_emval() {
        for (var i = 5; i < emval_handle_array.length; ++i) {
          if (emval_handle_array[i] !== void 0) {
            return emval_handle_array[i];
          }
        }
        return null;
      }
      function init_emval() {
        Module["count_emval_handles"] = count_emval_handles;
        Module["get_first_emval"] = get_first_emval;
      }
      var Emval = { toValue: (handle) => {
        if (!handle) {
          throwBindingError("Cannot use deleted val. handle = " + handle);
        }
        return emval_handle_array[handle].value;
      }, toHandle: (value) => {
        switch (value) {
          case void 0:
            return 1;
          case null:
            return 2;
          case true:
            return 3;
          case false:
            return 4;
          default: {
            var handle = emval_free_list.length ? emval_free_list.pop() : emval_handle_array.length;
            emval_handle_array[handle] = { refcount: 1, value };
            return handle;
          }
        }
      } };
      function __embind_register_emval(rawType, name) {
        name = readLatin1String(name);
        registerType(rawType, { name, "fromWireType": function(handle) {
          var rv = Emval.toValue(handle);
          __emval_decref(handle);
          return rv;
        }, "toWireType": function(destructors, value) {
          return Emval.toHandle(value);
        }, "argPackAdvance": 8, "readValueFromPointer": simpleReadValueFromPointer, destructorFunction: null });
      }
      function embindRepr(v) {
        if (v === null) {
          return "null";
        }
        var t = typeof v;
        if (t === "object" || t === "array" || t === "function") {
          return v.toString();
        } else {
          return "" + v;
        }
      }
      function floatReadValueFromPointer(name, shift) {
        switch (shift) {
          case 2:
            return function(pointer) {
              return this["fromWireType"](HEAPF32[pointer >> 2]);
            };
          case 3:
            return function(pointer) {
              return this["fromWireType"](HEAPF64[pointer >> 3]);
            };
          default:
            throw new TypeError("Unknown float type: " + name);
        }
      }
      function __embind_register_float(rawType, name, size) {
        var shift = getShiftFromSize(size);
        name = readLatin1String(name);
        registerType(rawType, { name, "fromWireType": function(value) {
          return value;
        }, "toWireType": function(destructors, value) {
          if (typeof value != "number" && typeof value != "boolean") {
            throw new TypeError('Cannot convert "' + embindRepr(value) + '" to ' + this.name);
          }
          return value;
        }, "argPackAdvance": 8, "readValueFromPointer": floatReadValueFromPointer(name, shift), destructorFunction: null });
      }
      function integerReadValueFromPointer(name, shift, signed) {
        switch (shift) {
          case 0:
            return signed ? function readS8FromPointer(pointer) {
              return HEAP8[pointer];
            } : function readU8FromPointer(pointer) {
              return HEAPU8[pointer];
            };
          case 1:
            return signed ? function readS16FromPointer(pointer) {
              return HEAP16[pointer >> 1];
            } : function readU16FromPointer(pointer) {
              return HEAPU16[pointer >> 1];
            };
          case 2:
            return signed ? function readS32FromPointer(pointer) {
              return HEAP32[pointer >> 2];
            } : function readU32FromPointer(pointer) {
              return HEAPU32[pointer >> 2];
            };
          default:
            throw new TypeError("Unknown integer type: " + name);
        }
      }
      function __embind_register_integer(primitiveType, name, size, minRange, maxRange) {
        name = readLatin1String(name);
        if (maxRange === -1) {
          maxRange = 4294967295;
        }
        var shift = getShiftFromSize(size);
        var fromWireType = (value) => value;
        if (minRange === 0) {
          var bitshift = 32 - 8 * size;
          fromWireType = (value) => value << bitshift >>> bitshift;
        }
        var isUnsignedType = name.includes("unsigned");
        var checkAssertions = (value, toTypeName) => {
          if (typeof value != "number" && typeof value != "boolean") {
            throw new TypeError('Cannot convert "' + embindRepr(value) + '" to ' + toTypeName);
          }
          if (value < minRange || value > maxRange) {
            throw new TypeError('Passing a number "' + embindRepr(value) + '" from JS side to C/C++ side to an argument of type "' + name + '", which is outside the valid range [' + minRange + ", " + maxRange + "]!");
          }
        };
        var toWireType;
        if (isUnsignedType) {
          toWireType = function(destructors, value) {
            checkAssertions(value, this.name);
            return value >>> 0;
          };
        } else {
          toWireType = function(destructors, value) {
            checkAssertions(value, this.name);
            return value;
          };
        }
        registerType(primitiveType, { name, "fromWireType": fromWireType, "toWireType": toWireType, "argPackAdvance": 8, "readValueFromPointer": integerReadValueFromPointer(name, shift, minRange !== 0), destructorFunction: null });
      }
      function __embind_register_memory_view(rawType, dataTypeIndex, name) {
        var typeMapping = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array];
        var TA = typeMapping[dataTypeIndex];
        function decodeMemoryView(handle) {
          handle = handle >> 2;
          var heap = HEAPU32;
          var size = heap[handle];
          var data = heap[handle + 1];
          return new TA(buffer, data, size);
        }
        name = readLatin1String(name);
        registerType(rawType, { name, "fromWireType": decodeMemoryView, "argPackAdvance": 8, "readValueFromPointer": decodeMemoryView }, { ignoreDuplicateRegistrations: true });
      }
      function __embind_register_std_string(rawType, name) {
        name = readLatin1String(name);
        var stdStringIsUTF8 = name === "std::string";
        registerType(rawType, { name, "fromWireType": function(value) {
          var length = HEAPU32[value >> 2];
          var payload = value + 4;
          var str;
          if (stdStringIsUTF8) {
            var decodeStartPtr = payload;
            for (var i = 0; i <= length; ++i) {
              var currentBytePtr = payload + i;
              if (i == length || HEAPU8[currentBytePtr] == 0) {
                var maxRead = currentBytePtr - decodeStartPtr;
                var stringSegment = UTF8ToString(decodeStartPtr, maxRead);
                if (str === void 0) {
                  str = stringSegment;
                } else {
                  str += String.fromCharCode(0);
                  str += stringSegment;
                }
                decodeStartPtr = currentBytePtr + 1;
              }
            }
          } else {
            var a = new Array(length);
            for (var i = 0; i < length; ++i) {
              a[i] = String.fromCharCode(HEAPU8[payload + i]);
            }
            str = a.join("");
          }
          _free(value);
          return str;
        }, "toWireType": function(destructors, value) {
          if (value instanceof ArrayBuffer) {
            value = new Uint8Array(value);
          }
          var length;
          var valueIsOfTypeString = typeof value == "string";
          if (!(valueIsOfTypeString || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Int8Array)) {
            throwBindingError("Cannot pass non-string to std::string");
          }
          if (stdStringIsUTF8 && valueIsOfTypeString) {
            length = lengthBytesUTF8(value);
          } else {
            length = value.length;
          }
          var base = _malloc(4 + length + 1);
          var ptr = base + 4;
          HEAPU32[base >> 2] = length;
          if (stdStringIsUTF8 && valueIsOfTypeString) {
            stringToUTF8(value, ptr, length + 1);
          } else {
            if (valueIsOfTypeString) {
              for (var i = 0; i < length; ++i) {
                var charCode = value.charCodeAt(i);
                if (charCode > 255) {
                  _free(ptr);
                  throwBindingError("String has UTF-16 code units that do not fit in 8 bits");
                }
                HEAPU8[ptr + i] = charCode;
              }
            } else {
              for (var i = 0; i < length; ++i) {
                HEAPU8[ptr + i] = value[i];
              }
            }
          }
          if (destructors !== null) {
            destructors.push(_free, base);
          }
          return base;
        }, "argPackAdvance": 8, "readValueFromPointer": simpleReadValueFromPointer, destructorFunction: function(ptr) {
          _free(ptr);
        } });
      }
      var UTF16Decoder = typeof TextDecoder != "undefined" ? new TextDecoder("utf-16le") : void 0;
      function UTF16ToString(ptr, maxBytesToRead) {
        assert(ptr % 2 == 0, "Pointer passed to UTF16ToString must be aligned to two bytes!");
        var endPtr = ptr;
        var idx = endPtr >> 1;
        var maxIdx = idx + maxBytesToRead / 2;
        while (!(idx >= maxIdx) && HEAPU16[idx]) ++idx;
        endPtr = idx << 1;
        if (endPtr - ptr > 32 && UTF16Decoder) {
          return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr));
        } else {
          var str = "";
          for (var i = 0; !(i >= maxBytesToRead / 2); ++i) {
            var codeUnit = HEAP16[ptr + i * 2 >> 1];
            if (codeUnit == 0) break;
            str += String.fromCharCode(codeUnit);
          }
          return str;
        }
      }
      function stringToUTF16(str, outPtr, maxBytesToWrite) {
        assert(outPtr % 2 == 0, "Pointer passed to stringToUTF16 must be aligned to two bytes!");
        assert(typeof maxBytesToWrite == "number", "stringToUTF16(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
        if (maxBytesToWrite === void 0) {
          maxBytesToWrite = 2147483647;
        }
        if (maxBytesToWrite < 2) return 0;
        maxBytesToWrite -= 2;
        var startPtr = outPtr;
        var numCharsToWrite = maxBytesToWrite < str.length * 2 ? maxBytesToWrite / 2 : str.length;
        for (var i = 0; i < numCharsToWrite; ++i) {
          var codeUnit = str.charCodeAt(i);
          HEAP16[outPtr >> 1] = codeUnit;
          outPtr += 2;
        }
        HEAP16[outPtr >> 1] = 0;
        return outPtr - startPtr;
      }
      function lengthBytesUTF16(str) {
        return str.length * 2;
      }
      function UTF32ToString(ptr, maxBytesToRead) {
        assert(ptr % 4 == 0, "Pointer passed to UTF32ToString must be aligned to four bytes!");
        var i = 0;
        var str = "";
        while (!(i >= maxBytesToRead / 4)) {
          var utf32 = HEAP32[ptr + i * 4 >> 2];
          if (utf32 == 0) break;
          ++i;
          if (utf32 >= 65536) {
            var ch = utf32 - 65536;
            str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
          } else {
            str += String.fromCharCode(utf32);
          }
        }
        return str;
      }
      function stringToUTF32(str, outPtr, maxBytesToWrite) {
        assert(outPtr % 4 == 0, "Pointer passed to stringToUTF32 must be aligned to four bytes!");
        assert(typeof maxBytesToWrite == "number", "stringToUTF32(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
        if (maxBytesToWrite === void 0) {
          maxBytesToWrite = 2147483647;
        }
        if (maxBytesToWrite < 4) return 0;
        var startPtr = outPtr;
        var endPtr = startPtr + maxBytesToWrite - 4;
        for (var i = 0; i < str.length; ++i) {
          var codeUnit = str.charCodeAt(i);
          if (codeUnit >= 55296 && codeUnit <= 57343) {
            var trailSurrogate = str.charCodeAt(++i);
            codeUnit = 65536 + ((codeUnit & 1023) << 10) | trailSurrogate & 1023;
          }
          HEAP32[outPtr >> 2] = codeUnit;
          outPtr += 4;
          if (outPtr + 4 > endPtr) break;
        }
        HEAP32[outPtr >> 2] = 0;
        return outPtr - startPtr;
      }
      function lengthBytesUTF32(str) {
        var len = 0;
        for (var i = 0; i < str.length; ++i) {
          var codeUnit = str.charCodeAt(i);
          if (codeUnit >= 55296 && codeUnit <= 57343) ++i;
          len += 4;
        }
        return len;
      }
      function __embind_register_std_wstring(rawType, charSize, name) {
        name = readLatin1String(name);
        var decodeString, encodeString, getHeap, lengthBytesUTF, shift;
        if (charSize === 2) {
          decodeString = UTF16ToString;
          encodeString = stringToUTF16;
          lengthBytesUTF = lengthBytesUTF16;
          getHeap = () => HEAPU16;
          shift = 1;
        } else if (charSize === 4) {
          decodeString = UTF32ToString;
          encodeString = stringToUTF32;
          lengthBytesUTF = lengthBytesUTF32;
          getHeap = () => HEAPU32;
          shift = 2;
        }
        registerType(rawType, { name, "fromWireType": function(value) {
          var length = HEAPU32[value >> 2];
          var HEAP = getHeap();
          var str;
          var decodeStartPtr = value + 4;
          for (var i = 0; i <= length; ++i) {
            var currentBytePtr = value + 4 + i * charSize;
            if (i == length || HEAP[currentBytePtr >> shift] == 0) {
              var maxReadBytes = currentBytePtr - decodeStartPtr;
              var stringSegment = decodeString(decodeStartPtr, maxReadBytes);
              if (str === void 0) {
                str = stringSegment;
              } else {
                str += String.fromCharCode(0);
                str += stringSegment;
              }
              decodeStartPtr = currentBytePtr + charSize;
            }
          }
          _free(value);
          return str;
        }, "toWireType": function(destructors, value) {
          if (!(typeof value == "string")) {
            throwBindingError("Cannot pass non-string to C++ string type " + name);
          }
          var length = lengthBytesUTF(value);
          var ptr = _malloc(4 + length + charSize);
          HEAPU32[ptr >> 2] = length >> shift;
          encodeString(value, ptr + 4, length + charSize);
          if (destructors !== null) {
            destructors.push(_free, ptr);
          }
          return ptr;
        }, "argPackAdvance": 8, "readValueFromPointer": simpleReadValueFromPointer, destructorFunction: function(ptr) {
          _free(ptr);
        } });
      }
      function __embind_register_void(rawType, name) {
        name = readLatin1String(name);
        registerType(rawType, { isVoid: true, name, "argPackAdvance": 0, "fromWireType": function() {
          return void 0;
        }, "toWireType": function(destructors, o) {
          return void 0;
        } });
      }
      function _abort() {
        abort("native code called abort()");
      }
      function _emscripten_memcpy_big(dest, src, num) {
        HEAPU8.copyWithin(dest, src, src + num);
      }
      function getHeapMax() {
        return 2147483648;
      }
      function emscripten_realloc_buffer(size) {
        try {
          wasmMemory.grow(size - buffer.byteLength + 65535 >>> 16);
          updateGlobalBufferAndViews(wasmMemory.buffer);
          return 1;
        } catch (e) {
          err("emscripten_realloc_buffer: Attempted to grow heap from " + buffer.byteLength + " bytes to " + size + " bytes, but got error: " + e);
        }
      }
      function _emscripten_resize_heap(requestedSize) {
        var oldSize = HEAPU8.length;
        requestedSize = requestedSize >>> 0;
        assert(requestedSize > oldSize);
        var maxHeapSize = getHeapMax();
        if (requestedSize > maxHeapSize) {
          err("Cannot enlarge memory, asked to go up to " + requestedSize + " bytes, but the limit is " + maxHeapSize + " bytes!");
          return false;
        }
        let alignUp = (x, multiple) => x + (multiple - x % multiple) % multiple;
        for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
          var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
          overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
          var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));
          var replacement = emscripten_realloc_buffer(newSize);
          if (replacement) {
            return true;
          }
        }
        err("Failed to grow the heap from " + oldSize + " bytes to " + newSize + " bytes, not enough memory!");
        return false;
      }
      var ENV = {};
      function getExecutableName() {
        return thisProgram || "./this.program";
      }
      function getEnvStrings() {
        if (!getEnvStrings.strings) {
          var lang = (typeof navigator == "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8";
          var env = { "USER": "web_user", "LOGNAME": "web_user", "PATH": "/", "PWD": "/", "HOME": "/home/web_user", "LANG": lang, "_": getExecutableName() };
          for (var x in ENV) {
            if (ENV[x] === void 0) delete env[x];
            else env[x] = ENV[x];
          }
          var strings = [];
          for (var x in env) {
            strings.push(x + "=" + env[x]);
          }
          getEnvStrings.strings = strings;
        }
        return getEnvStrings.strings;
      }
      function writeAsciiToMemory(str, buffer2, dontAddNull) {
        for (var i = 0; i < str.length; ++i) {
          assert(str.charCodeAt(i) === (str.charCodeAt(i) & 255));
          HEAP8[buffer2++ >> 0] = str.charCodeAt(i);
        }
        HEAP8[buffer2 >> 0] = 0;
      }
      function _environ_get(__environ, environ_buf) {
        var bufSize = 0;
        getEnvStrings().forEach(function(string, i) {
          var ptr = environ_buf + bufSize;
          HEAPU32[__environ + i * 4 >> 2] = ptr;
          writeAsciiToMemory(string, ptr);
          bufSize += string.length + 1;
        });
        return 0;
      }
      function _environ_sizes_get(penviron_count, penviron_buf_size) {
        var strings = getEnvStrings();
        HEAPU32[penviron_count >> 2] = strings.length;
        var bufSize = 0;
        strings.forEach(function(string) {
          bufSize += string.length + 1;
        });
        HEAPU32[penviron_buf_size >> 2] = bufSize;
        return 0;
      }
      function _fd_close(fd) {
        abort("fd_close called without SYSCALLS_REQUIRE_FILESYSTEM");
      }
      function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
        return 70;
      }
      var printCharBuffers = [null, [], []];
      function printChar(stream, curr) {
        var buffer2 = printCharBuffers[stream];
        assert(buffer2);
        if (curr === 0 || curr === 10) {
          (stream === 1 ? out : err)(UTF8ArrayToString(buffer2, 0));
          buffer2.length = 0;
        } else {
          buffer2.push(curr);
        }
      }
      function _fd_write(fd, iov, iovcnt, pnum) {
        var num = 0;
        for (var i = 0; i < iovcnt; i++) {
          var ptr = HEAPU32[iov >> 2];
          var len = HEAPU32[iov + 4 >> 2];
          iov += 8;
          for (var j = 0; j < len; j++) {
            printChar(fd, HEAPU8[ptr + j]);
          }
          num += len;
        }
        HEAPU32[pnum >> 2] = num;
        return 0;
      }
      function __isLeapYear(year) {
        return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
      }
      function __arraySum(array, index) {
        var sum = 0;
        for (var i = 0; i <= index; sum += array[i++]) {
        }
        return sum;
      }
      var __MONTH_DAYS_LEAP = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      var __MONTH_DAYS_REGULAR = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      function __addDays(date, days) {
        var newDate = new Date(date.getTime());
        while (days > 0) {
          var leap = __isLeapYear(newDate.getFullYear());
          var currentMonth = newDate.getMonth();
          var daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth];
          if (days > daysInCurrentMonth - newDate.getDate()) {
            days -= daysInCurrentMonth - newDate.getDate() + 1;
            newDate.setDate(1);
            if (currentMonth < 11) {
              newDate.setMonth(currentMonth + 1);
            } else {
              newDate.setMonth(0);
              newDate.setFullYear(newDate.getFullYear() + 1);
            }
          } else {
            newDate.setDate(newDate.getDate() + days);
            return newDate;
          }
        }
        return newDate;
      }
      function intArrayFromString(stringy, dontAddNull, length) {
        var len = lengthBytesUTF8(stringy) + 1;
        var u8array = new Array(len);
        stringToUTF8Array(stringy, u8array, 0, u8array.length);
        return u8array;
      }
      function _strftime(s, maxsize, format, tm) {
        var tm_zone = HEAP32[tm + 40 >> 2];
        var date = { tm_sec: HEAP32[tm >> 2], tm_min: HEAP32[tm + 4 >> 2], tm_hour: HEAP32[tm + 8 >> 2], tm_mday: HEAP32[tm + 12 >> 2], tm_mon: HEAP32[tm + 16 >> 2], tm_year: HEAP32[tm + 20 >> 2], tm_wday: HEAP32[tm + 24 >> 2], tm_yday: HEAP32[tm + 28 >> 2], tm_isdst: HEAP32[tm + 32 >> 2], tm_gmtoff: HEAP32[tm + 36 >> 2], tm_zone: tm_zone ? UTF8ToString(tm_zone) : "" };
        var pattern = UTF8ToString(format);
        var EXPANSION_RULES_1 = { "%c": "%a %b %d %H:%M:%S %Y", "%D": "%m/%d/%y", "%F": "%Y-%m-%d", "%h": "%b", "%r": "%I:%M:%S %p", "%R": "%H:%M", "%T": "%H:%M:%S", "%x": "%m/%d/%y", "%X": "%H:%M:%S", "%Ec": "%c", "%EC": "%C", "%Ex": "%m/%d/%y", "%EX": "%H:%M:%S", "%Ey": "%y", "%EY": "%Y", "%Od": "%d", "%Oe": "%e", "%OH": "%H", "%OI": "%I", "%Om": "%m", "%OM": "%M", "%OS": "%S", "%Ou": "%u", "%OU": "%U", "%OV": "%V", "%Ow": "%w", "%OW": "%W", "%Oy": "%y" };
        for (var rule in EXPANSION_RULES_1) {
          pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_1[rule]);
        }
        var WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        function leadingSomething(value, digits, character) {
          var str = typeof value == "number" ? value.toString() : value || "";
          while (str.length < digits) {
            str = character[0] + str;
          }
          return str;
        }
        function leadingNulls(value, digits) {
          return leadingSomething(value, digits, "0");
        }
        function compareByDay(date1, date2) {
          function sgn(value) {
            return value < 0 ? -1 : value > 0 ? 1 : 0;
          }
          var compare;
          if ((compare = sgn(date1.getFullYear() - date2.getFullYear())) === 0) {
            if ((compare = sgn(date1.getMonth() - date2.getMonth())) === 0) {
              compare = sgn(date1.getDate() - date2.getDate());
            }
          }
          return compare;
        }
        function getFirstWeekStartDate(janFourth) {
          switch (janFourth.getDay()) {
            case 0:
              return new Date(janFourth.getFullYear() - 1, 11, 29);
            case 1:
              return janFourth;
            case 2:
              return new Date(janFourth.getFullYear(), 0, 3);
            case 3:
              return new Date(janFourth.getFullYear(), 0, 2);
            case 4:
              return new Date(janFourth.getFullYear(), 0, 1);
            case 5:
              return new Date(janFourth.getFullYear() - 1, 11, 31);
            case 6:
              return new Date(janFourth.getFullYear() - 1, 11, 30);
          }
        }
        function getWeekBasedYear(date2) {
          var thisDate = __addDays(new Date(date2.tm_year + 1900, 0, 1), date2.tm_yday);
          var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
          var janFourthNextYear = new Date(thisDate.getFullYear() + 1, 0, 4);
          var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
          var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
          if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
            if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
              return thisDate.getFullYear() + 1;
            }
            return thisDate.getFullYear();
          }
          return thisDate.getFullYear() - 1;
        }
        var EXPANSION_RULES_2 = { "%a": function(date2) {
          return WEEKDAYS[date2.tm_wday].substring(0, 3);
        }, "%A": function(date2) {
          return WEEKDAYS[date2.tm_wday];
        }, "%b": function(date2) {
          return MONTHS[date2.tm_mon].substring(0, 3);
        }, "%B": function(date2) {
          return MONTHS[date2.tm_mon];
        }, "%C": function(date2) {
          var year = date2.tm_year + 1900;
          return leadingNulls(year / 100 | 0, 2);
        }, "%d": function(date2) {
          return leadingNulls(date2.tm_mday, 2);
        }, "%e": function(date2) {
          return leadingSomething(date2.tm_mday, 2, " ");
        }, "%g": function(date2) {
          return getWeekBasedYear(date2).toString().substring(2);
        }, "%G": function(date2) {
          return getWeekBasedYear(date2);
        }, "%H": function(date2) {
          return leadingNulls(date2.tm_hour, 2);
        }, "%I": function(date2) {
          var twelveHour = date2.tm_hour;
          if (twelveHour == 0) twelveHour = 12;
          else if (twelveHour > 12) twelveHour -= 12;
          return leadingNulls(twelveHour, 2);
        }, "%j": function(date2) {
          return leadingNulls(date2.tm_mday + __arraySum(__isLeapYear(date2.tm_year + 1900) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, date2.tm_mon - 1), 3);
        }, "%m": function(date2) {
          return leadingNulls(date2.tm_mon + 1, 2);
        }, "%M": function(date2) {
          return leadingNulls(date2.tm_min, 2);
        }, "%n": function() {
          return "\n";
        }, "%p": function(date2) {
          if (date2.tm_hour >= 0 && date2.tm_hour < 12) {
            return "AM";
          }
          return "PM";
        }, "%S": function(date2) {
          return leadingNulls(date2.tm_sec, 2);
        }, "%t": function() {
          return "	";
        }, "%u": function(date2) {
          return date2.tm_wday || 7;
        }, "%U": function(date2) {
          var days = date2.tm_yday + 7 - date2.tm_wday;
          return leadingNulls(Math.floor(days / 7), 2);
        }, "%V": function(date2) {
          var val = Math.floor((date2.tm_yday + 7 - (date2.tm_wday + 6) % 7) / 7);
          if ((date2.tm_wday + 371 - date2.tm_yday - 2) % 7 <= 2) {
            val++;
          }
          if (!val) {
            val = 52;
            var dec31 = (date2.tm_wday + 7 - date2.tm_yday - 1) % 7;
            if (dec31 == 4 || dec31 == 5 && __isLeapYear(date2.tm_year % 400 - 1)) {
              val++;
            }
          } else if (val == 53) {
            var jan1 = (date2.tm_wday + 371 - date2.tm_yday) % 7;
            if (jan1 != 4 && (jan1 != 3 || !__isLeapYear(date2.tm_year))) val = 1;
          }
          return leadingNulls(val, 2);
        }, "%w": function(date2) {
          return date2.tm_wday;
        }, "%W": function(date2) {
          var days = date2.tm_yday + 7 - (date2.tm_wday + 6) % 7;
          return leadingNulls(Math.floor(days / 7), 2);
        }, "%y": function(date2) {
          return (date2.tm_year + 1900).toString().substring(2);
        }, "%Y": function(date2) {
          return date2.tm_year + 1900;
        }, "%z": function(date2) {
          var off = date2.tm_gmtoff;
          var ahead = off >= 0;
          off = Math.abs(off) / 60;
          off = off / 60 * 100 + off % 60;
          return (ahead ? "+" : "-") + String("0000" + off).slice(-4);
        }, "%Z": function(date2) {
          return date2.tm_zone;
        }, "%%": function() {
          return "%";
        } };
        pattern = pattern.replace(/%%/g, "\0\0");
        for (var rule in EXPANSION_RULES_2) {
          if (pattern.includes(rule)) {
            pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_2[rule](date));
          }
        }
        pattern = pattern.replace(/\0\0/g, "%");
        var bytes = intArrayFromString(pattern);
        if (bytes.length > maxsize) {
          return 0;
        }
        writeArrayToMemory(bytes, s);
        return bytes.length - 1;
      }
      function _strftime_l(s, maxsize, format, tm) {
        return _strftime(s, maxsize, format, tm);
      }
      embind_init_charCodes();
      BindingError = Module["BindingError"] = extendError(Error, "BindingError");
      InternalError = Module["InternalError"] = extendError(Error, "InternalError");
      init_ClassHandle();
      init_embind();
      init_RegisteredPointer();
      UnboundTypeError = Module["UnboundTypeError"] = extendError(Error, "UnboundTypeError");
      init_emval();
      function checkIncomingModuleAPI() {
        ignoredModuleProp("fetchSettings");
      }
      var asmLibraryArg = { "__cxa_allocate_exception": ___cxa_allocate_exception, "__cxa_throw": ___cxa_throw, "_embind_register_bigint": __embind_register_bigint, "_embind_register_bool": __embind_register_bool, "_embind_register_class": __embind_register_class, "_embind_register_class_constructor": __embind_register_class_constructor, "_embind_register_class_function": __embind_register_class_function, "_embind_register_emval": __embind_register_emval, "_embind_register_float": __embind_register_float, "_embind_register_integer": __embind_register_integer, "_embind_register_memory_view": __embind_register_memory_view, "_embind_register_std_string": __embind_register_std_string, "_embind_register_std_wstring": __embind_register_std_wstring, "_embind_register_void": __embind_register_void, "abort": _abort, "emscripten_memcpy_big": _emscripten_memcpy_big, "emscripten_resize_heap": _emscripten_resize_heap, "environ_get": _environ_get, "environ_sizes_get": _environ_sizes_get, "fd_close": _fd_close, "fd_seek": _fd_seek, "fd_write": _fd_write, "strftime_l": _strftime_l };
      createWasm();
      Module["___wasm_call_ctors"] = createExportWrapper("__wasm_call_ctors");
      var _malloc = Module["_malloc"] = createExportWrapper("malloc");
      var _free = Module["_free"] = createExportWrapper("free");
      var ___getTypeName = Module["___getTypeName"] = createExportWrapper("__getTypeName");
      Module["__embind_initialize_bindings"] = createExportWrapper("_embind_initialize_bindings");
      Module["___errno_location"] = createExportWrapper("__errno_location");
      Module["_fflush"] = createExportWrapper("fflush");
      var _emscripten_stack_init = Module["_emscripten_stack_init"] = function() {
        return (_emscripten_stack_init = Module["_emscripten_stack_init"] = Module["asm"]["emscripten_stack_init"]).apply(null, arguments);
      };
      Module["_emscripten_stack_get_free"] = function() {
        return (Module["_emscripten_stack_get_free"] = Module["asm"]["emscripten_stack_get_free"]).apply(null, arguments);
      };
      Module["_emscripten_stack_get_base"] = function() {
        return (Module["_emscripten_stack_get_base"] = Module["asm"]["emscripten_stack_get_base"]).apply(null, arguments);
      };
      var _emscripten_stack_get_end = Module["_emscripten_stack_get_end"] = function() {
        return (_emscripten_stack_get_end = Module["_emscripten_stack_get_end"] = Module["asm"]["emscripten_stack_get_end"]).apply(null, arguments);
      };
      Module["stackSave"] = createExportWrapper("stackSave");
      Module["stackRestore"] = createExportWrapper("stackRestore");
      Module["stackAlloc"] = createExportWrapper("stackAlloc");
      var ___cxa_is_pointer_type = Module["___cxa_is_pointer_type"] = createExportWrapper("__cxa_is_pointer_type");
      Module["dynCall_viijii"] = createExportWrapper("dynCall_viijii");
      Module["dynCall_ji"] = createExportWrapper("dynCall_ji");
      Module["dynCall_jiji"] = createExportWrapper("dynCall_jiji");
      Module["dynCall_iiiiij"] = createExportWrapper("dynCall_iiiiij");
      Module["dynCall_iiiiijj"] = createExportWrapper("dynCall_iiiiijj");
      Module["dynCall_iiiiiijj"] = createExportWrapper("dynCall_iiiiiijj");
      var unexportedRuntimeSymbols = ["run", "UTF8ArrayToString", "UTF8ToString", "stringToUTF8Array", "stringToUTF8", "lengthBytesUTF8", "addOnPreRun", "addOnInit", "addOnPreMain", "addOnExit", "addOnPostRun", "addRunDependency", "removeRunDependency", "FS_createFolder", "FS_createPath", "FS_createDataFile", "FS_createPreloadedFile", "FS_createLazyFile", "FS_createLink", "FS_createDevice", "FS_unlink", "getLEB", "getFunctionTables", "alignFunctionTables", "registerFunctions", "prettyPrint", "getCompilerSetting", "print", "printErr", "callMain", "abort", "keepRuntimeAlive", "wasmMemory", "stackAlloc", "stackSave", "stackRestore", "getTempRet0", "setTempRet0", "writeStackCookie", "checkStackCookie", "ptrToString", "zeroMemory", "stringToNewUTF8", "exitJS", "getHeapMax", "emscripten_realloc_buffer", "ENV", "ERRNO_CODES", "ERRNO_MESSAGES", "setErrNo", "inetPton4", "inetNtop4", "inetPton6", "inetNtop6", "readSockaddr", "writeSockaddr", "DNS", "getHostByName", "Protocols", "Sockets", "getRandomDevice", "warnOnce", "traverseStack", "UNWIND_CACHE", "convertPCtoSourceLocation", "readAsmConstArgsArray", "readAsmConstArgs", "mainThreadEM_ASM", "jstoi_q", "jstoi_s", "getExecutableName", "listenOnce", "autoResumeAudioContext", "dynCallLegacy", "getDynCaller", "dynCall", "handleException", "runtimeKeepalivePush", "runtimeKeepalivePop", "callUserCallback", "maybeExit", "safeSetTimeout", "asmjsMangle", "asyncLoad", "alignMemory", "mmapAlloc", "writeI53ToI64", "writeI53ToI64Clamped", "writeI53ToI64Signaling", "writeI53ToU64Clamped", "writeI53ToU64Signaling", "readI53FromI64", "readI53FromU64", "convertI32PairToI53", "convertI32PairToI53Checked", "convertU32PairToI53", "getCFunc", "ccall", "cwrap", "uleb128Encode", "sigToWasmTypes", "convertJsFunctionToWasm", "freeTableIndexes", "functionsInTableMap", "getEmptyTableSlot", "updateTableMap", "addFunction", "removeFunction", "reallyNegative", "unSign", "strLen", "reSign", "formatString", "setValue", "getValue", "PATH", "PATH_FS", "intArrayFromString", "intArrayToString", "AsciiToString", "stringToAscii", "UTF16Decoder", "UTF16ToString", "stringToUTF16", "lengthBytesUTF16", "UTF32ToString", "stringToUTF32", "lengthBytesUTF32", "allocateUTF8", "allocateUTF8OnStack", "writeStringToMemory", "writeArrayToMemory", "writeAsciiToMemory", "SYSCALLS", "getSocketFromFD", "getSocketAddress", "JSEvents", "registerKeyEventCallback", "specialHTMLTargets", "maybeCStringToJsString", "findEventTarget", "findCanvasEventTarget", "getBoundingClientRect", "fillMouseEventData", "registerMouseEventCallback", "registerWheelEventCallback", "registerUiEventCallback", "registerFocusEventCallback", "fillDeviceOrientationEventData", "registerDeviceOrientationEventCallback", "fillDeviceMotionEventData", "registerDeviceMotionEventCallback", "screenOrientation", "fillOrientationChangeEventData", "registerOrientationChangeEventCallback", "fillFullscreenChangeEventData", "registerFullscreenChangeEventCallback", "JSEvents_requestFullscreen", "JSEvents_resizeCanvasForFullscreen", "registerRestoreOldStyle", "hideEverythingExceptGivenElement", "restoreHiddenElements", "setLetterbox", "currentFullscreenStrategy", "restoreOldWindowedStyle", "softFullscreenResizeWebGLRenderTarget", "doRequestFullscreen", "fillPointerlockChangeEventData", "registerPointerlockChangeEventCallback", "registerPointerlockErrorEventCallback", "requestPointerLock", "fillVisibilityChangeEventData", "registerVisibilityChangeEventCallback", "registerTouchEventCallback", "fillGamepadEventData", "registerGamepadEventCallback", "registerBeforeUnloadEventCallback", "fillBatteryEventData", "battery", "registerBatteryEventCallback", "setCanvasElementSize", "getCanvasElementSize", "demangle", "demangleAll", "jsStackTrace", "stackTrace", "ExitStatus", "getEnvStrings", "checkWasiClock", "flush_NO_FILESYSTEM", "dlopenMissingError", "setImmediateWrapped", "clearImmediateWrapped", "polyfillSetImmediate", "uncaughtExceptionCount", "exceptionLast", "exceptionCaught", "ExceptionInfo", "exception_addRef", "exception_decRef", "Browser", "setMainLoop", "wget", "FS", "MEMFS", "TTY", "PIPEFS", "SOCKFS", "_setNetworkCallback", "tempFixedLengthArray", "miniTempWebGLFloatBuffers", "heapObjectForWebGLType", "heapAccessShiftForWebGLHeap", "GL", "emscriptenWebGLGet", "computeUnpackAlignedImageSize", "emscriptenWebGLGetTexPixelData", "emscriptenWebGLGetUniform", "webglGetUniformLocation", "webglPrepareUniformLocationsBeforeFirstUse", "webglGetLeftBracePos", "emscriptenWebGLGetVertexAttrib", "writeGLArray", "AL", "SDL_unicode", "SDL_ttfContext", "SDL_audio", "SDL", "SDL_gfx", "GLUT", "EGL", "GLFW_Window", "GLFW", "GLEW", "IDBStore", "runAndAbortIfError", "ALLOC_NORMAL", "ALLOC_STACK", "allocate", "InternalError", "BindingError", "UnboundTypeError", "PureVirtualError", "init_embind", "throwInternalError", "throwBindingError", "throwUnboundTypeError", "ensureOverloadTable", "exposePublicSymbol", "replacePublicSymbol", "extendError", "createNamedFunction", "embindRepr", "registeredInstances", "getBasestPointer", "registerInheritedInstance", "unregisterInheritedInstance", "getInheritedInstance", "getInheritedInstanceCount", "getLiveInheritedInstances", "registeredTypes", "awaitingDependencies", "typeDependencies", "registeredPointers", "registerType", "whenDependentTypesAreResolved", "embind_charCodes", "embind_init_charCodes", "readLatin1String", "getTypeName", "heap32VectorToArray", "requireRegisteredType", "getShiftFromSize", "integerReadValueFromPointer", "enumReadValueFromPointer", "floatReadValueFromPointer", "simpleReadValueFromPointer", "runDestructors", "new_", "craftInvokerFunction", "embind__requireFunction", "tupleRegistrations", "structRegistrations", "genericPointerToWireType", "constNoSmartPtrRawPointerToWireType", "nonConstNoSmartPtrRawPointerToWireType", "init_RegisteredPointer", "RegisteredPointer", "RegisteredPointer_getPointee", "RegisteredPointer_destructor", "RegisteredPointer_deleteObject", "RegisteredPointer_fromWireType", "runDestructor", "releaseClassHandle", "finalizationRegistry", "detachFinalizer_deps", "detachFinalizer", "attachFinalizer", "makeClassHandle", "init_ClassHandle", "ClassHandle", "ClassHandle_isAliasOf", "throwInstanceAlreadyDeleted", "ClassHandle_clone", "ClassHandle_delete", "deletionQueue", "ClassHandle_isDeleted", "ClassHandle_deleteLater", "flushPendingDeletes", "delayFunction", "setDelayFunction", "RegisteredClass", "shallowCopyInternalPointer", "downcastPointer", "upcastPointer", "validateThis", "char_0", "char_9", "makeLegalFunctionName", "emval_handle_array", "emval_free_list", "emval_symbols", "init_emval", "count_emval_handles", "get_first_emval", "getStringOrSymbol", "Emval", "emval_newers", "craftEmvalAllocator", "emval_get_global", "emval_lookupTypes", "emval_allocateDestructors", "emval_methodCallers", "emval_addMethodCaller", "emval_registeredMethods"];
      unexportedRuntimeSymbols.forEach(unexportedRuntimeSymbol);
      var missingLibrarySymbols = ["ptrToString", "zeroMemory", "stringToNewUTF8", "exitJS", "setErrNo", "inetPton4", "inetNtop4", "inetPton6", "inetNtop6", "readSockaddr", "writeSockaddr", "getHostByName", "getRandomDevice", "traverseStack", "convertPCtoSourceLocation", "readAsmConstArgs", "mainThreadEM_ASM", "jstoi_q", "jstoi_s", "listenOnce", "autoResumeAudioContext", "runtimeKeepalivePush", "runtimeKeepalivePop", "callUserCallback", "maybeExit", "safeSetTimeout", "asmjsMangle", "asyncLoad", "alignMemory", "mmapAlloc", "writeI53ToI64", "writeI53ToI64Clamped", "writeI53ToI64Signaling", "writeI53ToU64Clamped", "writeI53ToU64Signaling", "readI53FromI64", "readI53FromU64", "convertI32PairToI53", "convertU32PairToI53", "reallyNegative", "unSign", "strLen", "reSign", "formatString", "getSocketFromFD", "getSocketAddress", "registerKeyEventCallback", "maybeCStringToJsString", "findEventTarget", "findCanvasEventTarget", "getBoundingClientRect", "fillMouseEventData", "registerMouseEventCallback", "registerWheelEventCallback", "registerUiEventCallback", "registerFocusEventCallback", "fillDeviceOrientationEventData", "registerDeviceOrientationEventCallback", "fillDeviceMotionEventData", "registerDeviceMotionEventCallback", "screenOrientation", "fillOrientationChangeEventData", "registerOrientationChangeEventCallback", "fillFullscreenChangeEventData", "registerFullscreenChangeEventCallback", "JSEvents_requestFullscreen", "JSEvents_resizeCanvasForFullscreen", "registerRestoreOldStyle", "hideEverythingExceptGivenElement", "restoreHiddenElements", "setLetterbox", "softFullscreenResizeWebGLRenderTarget", "doRequestFullscreen", "fillPointerlockChangeEventData", "registerPointerlockChangeEventCallback", "registerPointerlockErrorEventCallback", "requestPointerLock", "fillVisibilityChangeEventData", "registerVisibilityChangeEventCallback", "registerTouchEventCallback", "fillGamepadEventData", "registerGamepadEventCallback", "registerBeforeUnloadEventCallback", "fillBatteryEventData", "battery", "registerBatteryEventCallback", "setCanvasElementSize", "getCanvasElementSize", "checkWasiClock", "setImmediateWrapped", "clearImmediateWrapped", "polyfillSetImmediate", "exception_addRef", "exception_decRef", "setMainLoop", "_setNetworkCallback", "heapObjectForWebGLType", "heapAccessShiftForWebGLHeap", "emscriptenWebGLGet", "computeUnpackAlignedImageSize", "emscriptenWebGLGetTexPixelData", "emscriptenWebGLGetUniform", "webglGetUniformLocation", "webglPrepareUniformLocationsBeforeFirstUse", "webglGetLeftBracePos", "emscriptenWebGLGetVertexAttrib", "writeGLArray", "SDL_unicode", "SDL_ttfContext", "SDL_audio", "GLFW_Window", "runAndAbortIfError", "registerInheritedInstance", "unregisterInheritedInstance", "requireRegisteredType", "enumReadValueFromPointer", "validateThis", "getStringOrSymbol", "craftEmvalAllocator", "emval_get_global", "emval_lookupTypes", "emval_allocateDestructors", "emval_addMethodCaller"];
      missingLibrarySymbols.forEach(missingLibrarySymbol);
      var calledRun;
      dependenciesFulfilled = function runCaller() {
        if (!calledRun) run();
        if (!calledRun) dependenciesFulfilled = runCaller;
      };
      function stackCheckInit() {
        _emscripten_stack_init();
        writeStackCookie();
      }
      function run(args) {
        if (runDependencies > 0) {
          return;
        }
        stackCheckInit();
        preRun();
        if (runDependencies > 0) {
          return;
        }
        function doRun() {
          if (calledRun) return;
          calledRun = true;
          Module["calledRun"] = true;
          if (ABORT) return;
          initRuntime();
          readyPromiseResolve(Module);
          if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();
          assert(!Module["_main"], 'compiled without a main, but one is present. if you added it from JS, use Module["onRuntimeInitialized"]');
          postRun();
        }
        if (Module["setStatus"]) {
          Module["setStatus"]("Running...");
          setTimeout(function() {
            setTimeout(function() {
              Module["setStatus"]("");
            }, 1);
            doRun();
          }, 1);
        } else {
          doRun();
        }
        checkStackCookie();
      }
      if (Module["preInit"]) {
        if (typeof Module["preInit"] == "function") Module["preInit"] = [Module["preInit"]];
        while (Module["preInit"].length > 0) {
          Module["preInit"].pop()();
        }
      }
      run();
      return createLazPerf2.ready;
    };
  })();
  module.exports = createLazPerf;
})(lazPerf);
var lazPerfExports = lazPerf.exports;
var __importDefault = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(web, "__esModule", { value: true });
web.LazPerf = web.create = web.createLazPerf = void 0;
const laz_perf_js_1 = __importDefault(lazPerfExports);
web.createLazPerf = laz_perf_js_1.default;
web.create = laz_perf_js_1.default;
web.LazPerf = { create: laz_perf_js_1.default };
Object.defineProperty(pointData, "__esModule", { value: true });
pointData.decompressFile = pointData.decompressChunk = pointData.PointData = void 0;
const laz_perf_1 = web;
const header_1 = header;
pointData.PointData = { createLazPerf: laz_perf_1.createLazPerf, decompressChunk, decompressFile };
let ourLazPerfPromise = void 0;
async function getLazPerf(suppliedLazPerf) {
  if (suppliedLazPerf)
    return suppliedLazPerf;
  if (!ourLazPerfPromise)
    ourLazPerfPromise = (0, laz_perf_1.createLazPerf)();
  return ourLazPerfPromise;
}
async function decompressChunk(compressed, { pointCount, pointDataRecordFormat, pointDataRecordLength }, suppliedLazPerf) {
  const LazPerf = await getLazPerf(suppliedLazPerf);
  const outBuffer = new Uint8Array(pointCount * pointDataRecordLength);
  const blobPointer = LazPerf._malloc(compressed.byteLength);
  const dataPointer = LazPerf._malloc(pointDataRecordLength);
  const decoder = new LazPerf.ChunkDecoder();
  try {
    LazPerf.HEAPU8.set(new Uint8Array(compressed.buffer, compressed.byteOffset, compressed.byteLength), blobPointer);
    decoder.open(pointDataRecordFormat, pointDataRecordLength, blobPointer);
    for (let i = 0; i < pointCount; ++i) {
      decoder.getPoint(dataPointer);
      outBuffer.set(new Uint8Array(LazPerf.HEAPU8.buffer, dataPointer, pointDataRecordLength), i * pointDataRecordLength);
    }
  } finally {
    LazPerf._free(blobPointer);
    LazPerf._free(dataPointer);
    decoder.delete();
  }
  return outBuffer;
}
pointData.decompressChunk = decompressChunk;
async function decompressFile(file, suppliedLazPerf) {
  const LazPerf = await getLazPerf(suppliedLazPerf);
  const header2 = header_1.Header.parse(file);
  const { pointCount, pointDataRecordLength } = header2;
  const outBuffer = new Uint8Array(pointCount * pointDataRecordLength);
  const blobPointer = LazPerf._malloc(file.byteLength);
  const dataPointer = LazPerf._malloc(pointDataRecordLength);
  const reader = new LazPerf.LASZip();
  try {
    LazPerf.HEAPU8.set(new Uint8Array(file.buffer, file.byteOffset, file.byteLength), blobPointer);
    reader.open(blobPointer, file.byteLength);
    for (let i = 0; i < pointCount; ++i) {
      reader.getPoint(dataPointer);
      outBuffer.set(new Uint8Array(LazPerf.HEAPU8.buffer, dataPointer, pointDataRecordLength), i * pointDataRecordLength);
    }
  } finally {
    reader.delete();
  }
  return outBuffer;
}
pointData.decompressFile = decompressFile;
var view = {};
Object.defineProperty(view, "__esModule", { value: true });
view.View = void 0;
const utils_1$4 = utils$1;
const dimensions_1 = dimensions;
const extractor_1 = extractor;
view.View = { create: create$1 };
function create$1(buffer, header2, eb = [], include) {
  let extractors = extractor_1.Extractor.create(header2, eb);
  if (include) {
    const set = /* @__PURE__ */ new Set([...include]);
    extractors = Object.entries(extractors).reduce((extractors2, [name, getter3]) => {
      if (set.has(name))
        extractors2[name] = getter3;
      return extractors2;
    }, {});
  }
  const dimensions2 = dimensions_1.Dimensions.create(extractors, eb);
  const dv = utils_1$4.Binary.toDataView(buffer);
  const pointLength = header2.pointDataRecordLength;
  if (dv.byteLength % pointLength !== 0) {
    throw new Error(`Invalid buffer length (${dv.byteLength}) for point length ${pointLength}`);
  }
  const pointCount = dv.byteLength / header2.pointDataRecordLength;
  function getter2(name) {
    const extractor2 = extractors[name];
    if (!extractor2)
      throw new Error(`No extractor for dimension: ${name}`);
    return function(index) {
      if (index >= pointCount) {
        throw new RangeError(`View index (${index}) out of range: ${pointCount}`);
      }
      return extractor2(dv, index);
    };
  }
  return { pointCount, dimensions: dimensions2, getter: getter2 };
}
var vlr = {};
Object.defineProperty(vlr, "__esModule", { value: true });
vlr.Vlr = void 0;
const utils_1$3 = utils$1;
const constants_1$2 = constants;
vlr.Vlr = { walk, parse: parse$2, find, at, fetch: fetch$1 };
function find(vlrs, userId, recordId) {
  return vlrs.find((v) => v.userId === userId && v.recordId === recordId);
}
function at(vlrs, userId, recordId) {
  const vlr2 = find(vlrs, userId, recordId);
  if (!vlr2)
    throw new Error(`VLR not found: ${userId}/${recordId}`);
  return vlr2;
}
function fetch$1(filename, { contentOffset, contentLength }) {
  if (contentLength === 0)
    return new Uint8Array();
  const get = utils_1$3.Getter.create(filename);
  return get(contentOffset, contentOffset + contentLength);
}
async function walk(filename, header2) {
  const get = utils_1$3.Getter.create(filename);
  const vlrs = await doWalk({
    get,
    startOffset: header2.headerLength,
    count: header2.vlrCount,
    isExtended: false
  });
  const evlrs = await doWalk({
    get,
    startOffset: header2.evlrOffset,
    count: header2.evlrCount,
    isExtended: true
  });
  return [...vlrs, ...evlrs];
}
function parse$2(buffer, isExtended) {
  return (isExtended ? parseExtended : parseNormal)(buffer);
}
function parseNormal(buffer) {
  const dv = utils_1$3.Binary.toDataView(buffer);
  if (dv.byteLength !== constants_1$2.vlrHeaderLength) {
    throw new Error(`Invalid VLR header length (must be ${constants_1$2.vlrHeaderLength}): ${dv.byteLength}`);
  }
  return {
    userId: utils_1$3.Binary.toCString(buffer.slice(2, 18)),
    recordId: dv.getUint16(18, true),
    contentLength: dv.getUint16(20, true),
    description: utils_1$3.Binary.toCString(buffer.slice(22, 54)),
    isExtended: false
  };
}
function parseExtended(buffer) {
  const dv = utils_1$3.Binary.toDataView(buffer);
  if (dv.byteLength !== constants_1$2.evlrHeaderLength) {
    throw new Error(`Invalid EVLR header length (must be ${constants_1$2.evlrHeaderLength}): ${dv.byteLength}`);
  }
  return {
    userId: utils_1$3.Binary.toCString(buffer.slice(2, 18)),
    recordId: dv.getUint16(18, true),
    contentLength: (0, utils_1$3.parseBigInt)((0, utils_1$3.getBigUint64)(dv, 20, true)),
    description: utils_1$3.Binary.toCString(buffer.slice(28, 60)),
    isExtended: true
  };
}
async function doWalk({ get, startOffset, count, isExtended }) {
  const vlrs = [];
  let pos = startOffset;
  const length = isExtended ? constants_1$2.evlrHeaderLength : constants_1$2.vlrHeaderLength;
  for (let i = 0; i < count; ++i) {
    const buffer = length ? await get(pos, pos + length) : new Uint8Array();
    const { userId, recordId, contentLength, description } = parse$2(buffer, isExtended);
    vlrs.push({
      userId,
      recordId,
      contentOffset: pos + length,
      contentLength,
      description,
      isExtended
    });
    pos += length + contentLength;
  }
  return vlrs;
}
(function(exports) {
  var __createBinding2 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === void 0) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === void 0) k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault2 = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar2 = commonjsGlobal && commonjsGlobal.__importStar || function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding2(result, mod, k);
    }
    __setModuleDefault2(result, mod);
    return result;
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.Vlr = exports.View = exports.PointData = exports.Header = exports.Extractor = exports.ExtraBytes = exports.Dimensions = exports.Constants = void 0;
  exports.Constants = __importStar2(constants);
  var dimensions_12 = dimensions;
  Object.defineProperty(exports, "Dimensions", { enumerable: true, get: function() {
    return dimensions_12.Dimensions;
  } });
  var extra_bytes_12 = extraBytes;
  Object.defineProperty(exports, "ExtraBytes", { enumerable: true, get: function() {
    return extra_bytes_12.ExtraBytes;
  } });
  var extractor_12 = extractor;
  Object.defineProperty(exports, "Extractor", { enumerable: true, get: function() {
    return extractor_12.Extractor;
  } });
  var header_12 = header;
  Object.defineProperty(exports, "Header", { enumerable: true, get: function() {
    return header_12.Header;
  } });
  var point_data_1 = pointData;
  Object.defineProperty(exports, "PointData", { enumerable: true, get: function() {
    return point_data_1.PointData;
  } });
  var view_1 = view;
  Object.defineProperty(exports, "View", { enumerable: true, get: function() {
    return view_1.View;
  } });
  var vlr_1 = vlr;
  Object.defineProperty(exports, "Vlr", { enumerable: true, get: function() {
    return vlr_1.Vlr;
  } });
})(las);
var hierarchy = {};
Object.defineProperty(hierarchy, "__esModule", { value: true });
hierarchy.Hierarchy = void 0;
const utils_1$2 = utils$1;
const constants_1$1 = constants$1;
hierarchy.Hierarchy = { parse: parse$1, load };
function parse$1(buffer) {
  const dv = utils_1$2.Binary.toDataView(buffer);
  if (dv.byteLength % constants_1$1.hierarchyItemLength !== 0) {
    throw new Error(`Invalid hierarchy page length: ${dv.byteLength}`);
  }
  const nodes = {};
  const pages = {};
  for (let i = 0; i < dv.byteLength; i += constants_1$1.hierarchyItemLength) {
    const d = dv.getInt32(i + 0, true);
    const x = dv.getInt32(i + 4, true);
    const y = dv.getInt32(i + 8, true);
    const z = dv.getInt32(i + 12, true);
    const offset = (0, utils_1$2.parseBigInt)((0, utils_1$2.getBigUint64)(dv, i + 16, true));
    const length = dv.getInt32(i + 24, true);
    const pointCount = dv.getInt32(i + 28, true);
    const key2 = utils_1$2.Key.toString([d, x, y, z]);
    if (pointCount < -1) {
      throw new Error(`Invalid hierarchy point count at key: ${key2}`);
    } else if (pointCount === -1) {
      pages[key2] = {
        pageOffset: offset,
        pageLength: length
      };
    } else {
      nodes[key2] = {
        pointCount,
        pointDataOffset: offset,
        pointDataLength: length
      };
    }
  }
  return { nodes, pages };
}
async function load(filename, page) {
  const get = utils_1$2.Getter.create(filename);
  return parse$1(await get(page.pageOffset, page.pageOffset + page.pageLength));
}
var info = {};
Object.defineProperty(info, "__esModule", { value: true });
info.Info = void 0;
const utils_1$1 = utils$1;
const constants_1 = constants$1;
info.Info = { parse };
function parse(buffer) {
  const dv = utils_1$1.Binary.toDataView(buffer);
  if (dv.byteLength !== constants_1.infoLength) {
    throw new Error(`Invalid COPC info VLR length (should be ${constants_1.infoLength}): ${dv.byteLength}`);
  }
  const center = [
    dv.getFloat64(0, true),
    dv.getFloat64(8, true),
    dv.getFloat64(16, true)
  ];
  const radius = dv.getFloat64(24, true);
  return {
    cube: [
      center[0] - radius,
      center[1] - radius,
      center[2] - radius,
      center[0] + radius,
      center[1] + radius,
      center[2] + radius
    ],
    spacing: dv.getFloat64(32, true),
    rootHierarchyPage: {
      pageOffset: (0, utils_1$1.parseBigInt)((0, utils_1$1.getBigUint64)(dv, 40, true)),
      pageLength: (0, utils_1$1.parseBigInt)((0, utils_1$1.getBigUint64)(dv, 48, true))
    },
    gpsTimeRange: [dv.getFloat64(56, true), dv.getFloat64(64, true)]
  };
}
var __createBinding = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
  if (k2 === void 0) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = { enumerable: true, get: function() {
      return m[k];
    } };
  }
  Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
  if (k2 === void 0) k2 = k;
  o[k2] = m[k];
});
var __setModuleDefault = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function(o, v) {
  Object.defineProperty(o, "default", { enumerable: true, value: v });
} : function(o, v) {
  o["default"] = v;
});
var __importStar = commonjsGlobal && commonjsGlobal.__importStar || function(mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) {
    for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
  }
  __setModuleDefault(result, mod);
  return result;
};
Object.defineProperty(copc, "__esModule", { value: true });
copc.Copc = void 0;
const Las = __importStar(las);
const utils_1 = utils$1;
const hierarchy_1 = hierarchy;
const info_1 = info;
copc.Copc = {
  create,
  loadHierarchyPage,
  loadCompressedPointDataBuffer,
  loadPointDataBuffer,
  loadPointDataView
};
async function create(filename) {
  const getRemote = utils_1.Getter.create(filename);
  const length = 65536;
  const promise = getRemote(0, length);
  async function get(begin, end) {
    if (end >= length)
      return getRemote(begin, end);
    const head = await promise;
    return head.slice(begin, end);
  }
  const header2 = Las.Header.parse(await get(0, Las.Constants.minHeaderLength));
  const vlrs = await Las.Vlr.walk(get, header2);
  const infoVlr = Las.Vlr.find(vlrs, "copc", 1);
  if (!infoVlr)
    throw new Error("COPC info VLR is required");
  const info2 = info_1.Info.parse(await Las.Vlr.fetch(get, infoVlr));
  let wkt;
  const wktVlr = Las.Vlr.find(vlrs, "LASF_Projection", 2112);
  if (wktVlr && wktVlr.contentLength) {
    wkt = utils_1.Binary.toCString(await Las.Vlr.fetch(get, wktVlr));
    if (wkt === "")
      wkt = void 0;
  }
  let eb = [];
  const ebVlr = Las.Vlr.find(vlrs, "LASF_Spec", 4);
  if (ebVlr)
    eb = Las.ExtraBytes.parse(await Las.Vlr.fetch(get, ebVlr));
  return { header: header2, vlrs, info: info2, wkt, eb };
}
async function loadHierarchyPage(filename, page) {
  const get = utils_1.Getter.create(filename);
  return hierarchy_1.Hierarchy.load(get, page);
}
async function loadCompressedPointDataBuffer(filename, { pointDataOffset, pointDataLength }) {
  const get = utils_1.Getter.create(filename);
  return get(pointDataOffset, pointDataOffset + pointDataLength);
}
async function loadPointDataBuffer(filename, { pointDataRecordFormat, pointDataRecordLength }, node, lazPerf2) {
  const compressed = await loadCompressedPointDataBuffer(filename, node);
  const { pointCount } = node;
  return Las.PointData.decompressChunk(compressed, { pointCount, pointDataRecordFormat, pointDataRecordLength }, lazPerf2);
}
async function loadPointDataView(filename, copc2, node, { lazPerf: lazPerf2, include } = {}) {
  const buffer = await loadPointDataBuffer(filename, copc2.header, node, lazPerf2);
  return Las.View.create(buffer, copc2.header, copc2.eb, include);
}
(function(exports) {
  var __createBinding2 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === void 0) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === void 0) k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault2 = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar2 = commonjsGlobal && commonjsGlobal.__importStar || function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding2(result, mod, k);
    }
    __setModuleDefault2(result, mod);
    return result;
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.Info = exports.Hierarchy = exports.Copc = exports.Constants = void 0;
  exports.Constants = __importStar2(constants$1);
  var copc_1 = copc;
  Object.defineProperty(exports, "Copc", { enumerable: true, get: function() {
    return copc_1.Copc;
  } });
  var hierarchy_12 = hierarchy;
  Object.defineProperty(exports, "Hierarchy", { enumerable: true, get: function() {
    return hierarchy_12.Hierarchy;
  } });
  var info_12 = info;
  Object.defineProperty(exports, "Info", { enumerable: true, get: function() {
    return info_12.Info;
  } });
})(copc$1);
(function(exports) {
  var __createBinding2 = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === void 0) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === void 0) k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault2 = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar2 = commonjsGlobal && commonjsGlobal.__importStar || function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding2(result, mod, k);
    }
    __setModuleDefault2(result, mod);
    return result;
  };
  var __exportStar = commonjsGlobal && commonjsGlobal.__exportStar || function(m, exports2) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding2(exports2, m, p);
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.Las = exports.Ept = void 0;
  exports.Ept = __importStar2(ept$1);
  __exportStar(copc$1, exports);
  exports.Las = __importStar2(las);
  __exportStar(utils$1, exports);
})(lib);
const POINT_BUDGET = 4e6;
const WORKER_POOL_SIZE = 3;
const REFRESH_INTERVAL_MS = 300;
const SCREEN_SIZE_THRESHOLD = 0.2;
function nodeBounds(key2, cube2) {
  const [d, x, y, z] = key2;
  const cells = 2 ** d;
  const sx = (cube2[3] - cube2[0]) / cells;
  const sy = (cube2[4] - cube2[1]) / cells;
  const sz = (cube2[5] - cube2[2]) / cells;
  return [
    cube2[0] + x * sx,
    cube2[1] + y * sy,
    cube2[2] + z * sz,
    cube2[0] + (x + 1) * sx,
    cube2[1] + (y + 1) * sy,
    cube2[2] + (z + 1) * sz
  ];
}
function boundsSphere(b) {
  const cx = (b[0] + b[3]) / 2;
  const cy = (b[1] + b[4]) / 2;
  const cz = (b[2] + b[5]) / 2;
  const dx = b[3] - b[0];
  const dy = b[4] - b[1];
  const dz = b[5] - b[2];
  return { center: [cx, cy, cz], radius: Math.sqrt(dx * dx + dy * dy + dz * dz) / 2 };
}
async function loadCopcPointCloud(pc, app, url, _target, setDistance, updateCameraTransform, isCurrent, showProgress, pointSizePx, outMaterials) {
  const absoluteUrl = new URL(url, window.location.origin).toString();
  showProgress("Загрузка заголовка COPC...", 0);
  const copc2 = await lib.Copc.create(absoluteUrl);
  if (!isCurrent()) return { refresh: () => {
  }, dispose: () => {
  } };
  const cube2 = copc2.info.cube;
  const dataMin = copc2.header.min;
  const dataMax = copc2.header.max;
  const centerOffset = [
    (dataMin[0] + dataMax[0]) / 2,
    (dataMin[1] + dataMax[1]) / 2,
    (dataMin[2] + dataMax[2]) / 2
  ];
  const centeredCube = [
    cube2[0] - centerOffset[0],
    cube2[1] - centerOffset[1],
    cube2[2] - centerOffset[2],
    cube2[3] - centerOffset[0],
    cube2[4] - centerOffset[1],
    cube2[5] - centerOffset[2]
  ];
  const halfExtent = Math.max(dataMax[0] - dataMin[0], dataMax[1] - dataMin[1], dataMax[2] - dataMin[2]) / 2;
  setDistance(Math.max(halfExtent * 1.8, 0.5));
  updateCameraTransform();
  const root = new pc.Entity("copc-root");
  root.setLocalRotation(...AXIS_FIX_ROTATION);
  app.root.addChild(root);
  const material = createPointCloudMaterial(pc, pointSizePx);
  outMaterials.push(material);
  let nodes = {};
  let pages = {};
  const rootPage = await lib.Copc.loadHierarchyPage(absoluteUrl, copc2.info.rootHierarchyPage);
  nodes = { ...nodes, ...rootPage.nodes };
  pages = { ...pages, ...rootPage.pages };
  if (!isCurrent()) return { refresh: () => {
  }, dispose: () => {
  } };
  const loaded = /* @__PURE__ */ new Map();
  const pendingKeys = /* @__PURE__ */ new Set();
  let hasColorDecided = null;
  const zRange = [dataMin[2] - centerOffset[2], dataMax[2] - centerOffset[2]];
  const workers = [];
  for (let i = 0; i < WORKER_POOL_SIZE; i++) {
    const worker = new Worker(new URL(
      /* @vite-ignore */
      "/assets/viewer/assets/copcWorker-yHYaF0eo.js",
      import.meta.url
    ), { type: "module" });
    worker.onerror = (e) => console.error("COPC: ошибка воркера:", e.message || e);
    workers.push(worker);
  }
  let nextWorker = 0;
  let nextRequestId = 1;
  const pendingRequests = /* @__PURE__ */ new Map();
  function disposeNode(key2) {
    const entry = loaded.get(key2);
    if (!entry) return;
    entry.entity.destroy();
    loaded.delete(key2);
  }
  function buildEntity(key2, node, positions, colors) {
    if (!isCurrent()) return;
    const mesh = new pc.Mesh(app.graphicsDevice);
    mesh.setPositions(positions);
    mesh.setColors32(colors);
    mesh.update(pc.PRIMITIVE_POINTS, true);
    const meshInstance = new pc.MeshInstance(mesh, material);
    const entity = new pc.Entity("copc-node-" + key2);
    entity.addComponent("render", { meshInstances: [meshInstance] });
    root.addChild(entity);
    loaded.set(key2, { entity, pointCount: node.pointCount });
  }
  function requestNode(key2, node) {
    if (loaded.has(key2) || pendingKeys.has(key2)) return;
    pendingKeys.add(key2);
    const id = nextRequestId++;
    pendingRequests.set(id, { key: key2, node });
    const request = { id, url: absoluteUrl, copc: copc2, node, hasColor: hasColorDecided, zRange, centerOffset };
    workers[nextWorker].postMessage(request);
    nextWorker = (nextWorker + 1) % workers.length;
  }
  for (const worker of workers) {
    worker.onmessage = (e) => {
      const { id, positions, colors, pointCount, hasColor, error } = e.data;
      const pending = pendingRequests.get(id);
      pendingRequests.delete(id);
      if (!pending) return;
      pendingKeys.delete(pending.key);
      if (error || !positions || !colors || pointCount === void 0) {
        console.error("COPC: не удалось загрузить узел", pending.key, error);
        return;
      }
      if (hasColorDecided === null && hasColor !== void 0) hasColorDecided = hasColor;
      buildEntity(pending.key, pending.node, positions, colors);
    };
  }
  let lastRefreshAt = 0;
  let refreshInFlight = false;
  async function doRefresh(camera) {
    if (!isCurrent()) return;
    const camComp = camera.camera;
    const vp = new pc.Mat4().mul2(camComp.projectionMatrix, camComp.viewMatrix);
    const frustum = new pc.Frustum();
    frustum.setFromMat4(vp);
    const camPos = camera.getPosition();
    const screenHeight = app.graphicsDevice.height || 1;
    const fovRad = camComp.fov * Math.PI / 180;
    const selected = /* @__PURE__ */ new Set();
    let budgetUsed = 0;
    const stack = ["0-0-0-0"];
    while (stack.length) {
      const keyStr = stack.pop();
      const node = nodes[keyStr];
      const page = pages[keyStr];
      if (!node && !page) continue;
      const key2 = lib.Key.create(keyStr);
      const bounds2 = nodeBounds(key2, centeredCube);
      const sphere = boundsSphere(bounds2);
      const localCenter = new pc.Vec3(...sphere.center);
      const worldCenter = root.getWorldTransform().transformPoint(localCenter);
      const containment = frustum.containsSphere(new pc.BoundingSphere(worldCenter, sphere.radius));
      if (containment === 0) continue;
      const distance = worldCenter.distance(camPos);
      const angularSize = distance > 1e-6 ? sphere.radius / distance : Infinity;
      const screenSize = screenHeight > 0 ? angularSize / Math.tan(fovRad / 2) : 0;
      if (node) {
        selected.add(keyStr);
        budgetUsed += node.pointCount;
      }
      const wantsDescend = screenSize > SCREEN_SIZE_THRESHOLD && budgetUsed < POINT_BUDGET;
      if (!wantsDescend) continue;
      if (page && !node) {
        const subtree = await lib.Copc.loadHierarchyPage(absoluteUrl, page);
        if (!isCurrent()) return;
        nodes = { ...nodes, ...subtree.nodes };
        pages = { ...pages, ...subtree.pages };
        stack.push(keyStr);
        continue;
      }
      for (const step2 of lib.Step.list()) {
        const childKey = lib.Key.toString(lib.Key.step(key2, step2));
        if (nodes[childKey] || pages[childKey]) stack.push(childKey);
      }
    }
    let dispatchBudget = Array.from(loaded.values()).reduce((sum, n) => sum + n.pointCount, 0);
    for (const key2 of selected) {
      const node = nodes[key2];
      if (!node || loaded.has(key2)) continue;
      if (dispatchBudget + node.pointCount > POINT_BUDGET) continue;
      dispatchBudget += node.pointCount;
      requestNode(key2, node);
    }
    for (const key2 of Array.from(loaded.keys())) {
      if (!selected.has(key2)) disposeNode(key2);
    }
  }
  function refresh(camera) {
    const now = performance.now();
    if (refreshInFlight || now - lastRefreshAt < REFRESH_INTERVAL_MS) return;
    lastRefreshAt = now;
    refreshInFlight = true;
    doRefresh(camera).finally(() => {
      refreshInFlight = false;
    });
  }
  function dispose() {
    for (const worker of workers) worker.terminate();
    for (const key2 of Array.from(loaded.keys())) disposeNode(key2);
    root.destroy();
  }
  showProgress("COPC: подгрузка по области видимости...", 100);
  return { refresh, dispose };
}
const DEFAULT_CAMERA_SETTINGS = {
  fov: 45,
  nearClip: 0.05,
  farClip: 5e3,
  projection: "perspective",
  orbitSensitivity: 1,
  zoomSpeed: 1,
  moveSpeed: 5,
  pointSizePx: 2,
  edlEnabled: false,
  navigationMode: "orbit"
};
const STORAGE_KEY = "gisdata.tourViewer.cameraSettings.v1";
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_CAMERA_SETTINGS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CAMERA_SETTINGS, ...parsed };
  } catch (e) {
    return { ...DEFAULT_CAMERA_SETTINGS };
  }
}
const cameraSettings = loadFromStorage();
const listeners = [];
function onCameraSettingsChange(listener) {
  listeners.push(listener);
  return () => {
    const i = listeners.indexOf(listener);
    if (i !== -1) listeners.splice(i, 1);
  };
}
function setCameraSettings(partial) {
  Object.assign(cameraSettings, partial);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cameraSettings));
  } catch (e) {
  }
  for (const listener of listeners) listener(cameraSettings);
  return cameraSettings;
}
function getCameraSettings() {
  return cameraSettings;
}
class OrbitController {
  constructor(pc, camera, gizmo) {
    this.distance = 5;
    this.yaw = 45;
    this.pitch = -20;
    this.canvas = null;
    this.dragButton = null;
    this.lastX = 0;
    this.lastY = 0;
    this.onPointerDown = (e) => {
      if (!this.canvas) return;
      if (e.button === 0) {
        const hit = this.gizmo.handlePointerDown(e, this.canvas);
        if (hit) {
          this.yaw = hit.yaw;
          this.pitch = hit.pitch;
          this.update();
          return;
        }
      }
      if (e.button !== 0 && e.button !== 2) return;
      this.dragButton = e.button;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    };
    this.onPointerUp = () => {
      this.dragButton = null;
    };
    this.onContextMenu = (e) => {
      e.preventDefault();
    };
    this.onPointerMove = (e) => {
      if (this.dragButton === null) return;
      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      if (this.dragButton === 2) {
        this.pan(dx, dy);
      } else {
        const k = 0.3 * cameraSettings.orbitSensitivity;
        this.yaw -= dx * k;
        this.pitch = Math.max(-89, Math.min(89, this.pitch - dy * k));
      }
      this.update();
    };
    this.onWheel = (e) => {
      e.preventDefault();
      this.distance = Math.max(0.05, this.distance * (1 + e.deltaY * 1e-3 * cameraSettings.zoomSpeed));
      this.update();
    };
    this.pc = pc;
    this.camera = camera;
    this.gizmo = gizmo;
    this.target = new pc.Vec3(0, 0, 0);
  }
  /** Панорамирование правой кнопкой — двигает target (а с ним и всю
   * орбиту) в плоскости экрана камеры. Масштаб смещения привязан к
   * distance — иначе на сильном зуме панорамирование было бы либо
   * незаметным, либо слишком резким относительно видимого размера модели. */
  pan(dxPx, dyPx) {
    const k = this.distance / 500 * cameraSettings.orbitSensitivity;
    const right = this.camera.right.clone().mulScalar(-dxPx * k);
    const up = this.camera.up.clone().mulScalar(dyPx * k);
    this.target.add(right).add(up);
  }
  attach(canvas) {
    this.canvas = canvas;
    canvas.addEventListener("pointerdown", this.onPointerDown);
    window.addEventListener("pointerup", this.onPointerUp);
    window.addEventListener("pointermove", this.onPointerMove);
    canvas.addEventListener("wheel", this.onWheel, { passive: false });
    canvas.addEventListener("contextmenu", this.onContextMenu);
  }
  detach() {
    this.dragButton = null;
    if (!this.canvas) return;
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    window.removeEventListener("pointerup", this.onPointerUp);
    window.removeEventListener("pointermove", this.onPointerMove);
    this.canvas.removeEventListener("wheel", this.onWheel);
    this.canvas.removeEventListener("contextmenu", this.onContextMenu);
    this.canvas = null;
  }
  setDistance(d) {
    this.distance = d;
  }
  /** Пересчитывает позицию камеры из target/distance/yaw/pitch и двигает
   * штурвал в ту же ориентацию — единая точка входа и для пользовательского
   * драга, и для внешних вызовов (центрирование, завершение загрузки модели). */
  update() {
    const pc = this.pc;
    const yawQ = new pc.Quat().setFromEulerAngles(0, this.yaw, 0);
    const pitchQ = new pc.Quat().setFromEulerAngles(this.pitch, 0, 0);
    const rot = yawQ.clone().mul(pitchQ);
    const offset = rot.transformVector(new pc.Vec3(0, 0, this.distance));
    this.camera.setPosition(this.target.x + offset.x, this.target.y + offset.y, this.target.z + offset.z);
    this.camera.lookAt(this.target);
    this.camera.camera.orthoHeight = this.distance * 0.5;
    this.gizmo.updateTransform(this.yaw, this.pitch);
  }
}
const MOVE_KEYS = /* @__PURE__ */ new Set(["KeyW", "KeyA", "KeyS", "KeyD", "Space", "ShiftLeft", "ShiftRight"]);
class FlyController {
  // pc принимается, но не используется напрямую (camera.forward/right/up и
  // setEulerAngles — обычные методы Entity, без отдельных pc.* вызовов) —
  // параметр оставлен ради одной сигнатуры конструктора с OrbitController.
  constructor(_pc, camera, gizmo) {
    this.yaw = 0;
    this.pitch = 0;
    this.canvas = null;
    this.dragButton = null;
    this.lastX = 0;
    this.lastY = 0;
    this.pressedKeys = /* @__PURE__ */ new Set();
    this.onPointerDown = (e) => {
      if (!this.canvas) return;
      if (e.button === 0) {
        const hit = this.gizmo.handlePointerDown(e, this.canvas);
        if (hit) {
          this.yaw = hit.yaw;
          this.pitch = hit.pitch;
          this.applyRotation();
          return;
        }
      }
      if (e.button !== 0 && e.button !== 2) return;
      this.dragButton = e.button;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    };
    this.onPointerUp = () => {
      this.dragButton = null;
    };
    this.onContextMenu = (e) => {
      e.preventDefault();
    };
    this.onPointerMove = (e) => {
      if (this.dragButton === null) return;
      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      if (this.dragButton === 2) {
        const k2 = 0.01 * cameraSettings.orbitSensitivity;
        const pos = this.camera.getPosition().clone();
        pos.add(this.camera.right.clone().mulScalar(-dx * k2));
        pos.add(this.camera.up.clone().mulScalar(dy * k2));
        this.camera.setPosition(pos);
        return;
      }
      const k = 0.3 * cameraSettings.orbitSensitivity;
      this.yaw -= dx * k;
      this.pitch = Math.max(-89, Math.min(89, this.pitch - dy * k));
      this.applyRotation();
    };
    this.onKeyDown = (e) => {
      if (MOVE_KEYS.has(e.code)) this.pressedKeys.add(e.code);
    };
    this.onKeyUp = (e) => {
      this.pressedKeys.delete(e.code);
    };
    this.camera = camera;
    this.gizmo = gizmo;
  }
  attach(canvas) {
    this.canvas = canvas;
    canvas.addEventListener("pointerdown", this.onPointerDown);
    window.addEventListener("pointerup", this.onPointerUp);
    window.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    canvas.addEventListener("contextmenu", this.onContextMenu);
  }
  detach() {
    this.pressedKeys.clear();
    this.dragButton = null;
    if (!this.canvas) return;
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    window.removeEventListener("pointerup", this.onPointerUp);
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    this.canvas.removeEventListener("contextmenu", this.onContextMenu);
    this.canvas = null;
  }
  /** Перенять текущее положение/ориентацию (например, от OrbitController
   * при переключении режима или после центрирования модели) — без этого
   * полёт продолжил бы двигаться от своих старых, уже неактуальных yaw/pitch. */
  syncFrom(position, yaw, pitch) {
    this.camera.setPosition(position.x, position.y, position.z);
    this.yaw = yaw;
    this.pitch = pitch;
    this.applyRotation();
  }
  applyRotation() {
    this.camera.setEulerAngles(this.pitch, this.yaw, 0);
    this.gizmo.updateTransform(this.yaw, this.pitch);
  }
  /** Вызывается каждый кадр (app.on('update', dt)), только когда режим
   * полёта активен — см. tourViewer.ts. */
  update(dt) {
    if (this.pressedKeys.size === 0) return;
    const speed = cameraSettings.moveSpeed * dt;
    const pos = this.camera.getPosition().clone();
    if (this.pressedKeys.has("KeyW")) pos.add(this.camera.forward.clone().mulScalar(speed));
    if (this.pressedKeys.has("KeyS")) pos.add(this.camera.forward.clone().mulScalar(-speed));
    if (this.pressedKeys.has("KeyD")) pos.add(this.camera.right.clone().mulScalar(speed));
    if (this.pressedKeys.has("KeyA")) pos.add(this.camera.right.clone().mulScalar(-speed));
    if (this.pressedKeys.has("Space")) pos.add(this.camera.up.clone().mulScalar(speed));
    if (this.pressedKeys.has("ShiftLeft") || this.pressedKeys.has("ShiftRight")) pos.add(this.camera.up.clone().mulScalar(-speed));
    this.camera.setPosition(pos);
  }
}
function escapeHtml(s) {
  const div = document.createElement("div");
  div.textContent = s ?? "";
  return div.innerHTML;
}
function showViewerError(message) {
  hideViewerError();
  const body = document.querySelector("#tourViewerModal .modal-body");
  if (!body) return;
  const overlay = document.createElement("div");
  overlay.id = "tourViewerError";
  overlay.className = "position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3";
  overlay.style.zIndex = "2000";
  overlay.style.background = "rgba(0,0,0,.6)";
  overlay.innerHTML = '<div class="alert alert-danger mb-0" style="max-width: 600px;">' + escapeHtml(message) + "</div>";
  body.appendChild(overlay);
}
function hideViewerError() {
  const existing = document.getElementById("tourViewerError");
  if (existing) existing.remove();
}
let currentApp = null;
let generation = 0;
function disposeTourViewer() {
  if (!currentApp) return;
  const entry = currentApp;
  currentApp = null;
  try {
    entry.unsubscribeSettings();
    entry.detachNavigation();
    for (const handle of entry.copcHandles) handle.dispose();
    entry.resizeObserver.disconnect();
    entry.app.destroy();
  } catch (e) {
  }
}
function recenterTourCamera() {
  if (!currentApp) return;
  currentApp.recenter();
}
async function loadTourScene(urls, modelType, copcUrls = []) {
  hideViewerError();
  generation++;
  const myGeneration = generation;
  const isCurrent = () => myGeneration === generation;
  disposeTourViewer();
  const container = document.getElementById("tourViewerContainer");
  if (!container) return;
  container.innerHTML = "";
  container.style.position = "relative";
  const canvas = document.createElement("canvas");
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block";
  container.appendChild(canvas);
  const progressWrap = document.createElement("div");
  progressWrap.className = "position-absolute top-50 start-50 translate-middle p-3 rounded text-center";
  progressWrap.style.zIndex = "1050";
  progressWrap.style.background = "rgba(0,0,0,.75)";
  progressWrap.style.color = "#fff";
  progressWrap.style.width = "280px";
  progressWrap.innerHTML = '<div class="mb-2" id="tourPcProgressLabel">Загрузка...</div><div class="progress" style="height:8px;"><div class="progress-bar" id="tourPcProgressBar" style="width:0%"></div></div>';
  container.appendChild(progressWrap);
  function showProgress(text, pct) {
    if (!progressWrap.isConnected) return;
    progressWrap.querySelector("#tourPcProgressLabel").textContent = text;
    progressWrap.querySelector("#tourPcProgressBar").style.width = Math.max(0, Math.min(100, pct)) + "%";
  }
  function hideProgress() {
    progressWrap.remove();
  }
  try {
    let resizeCanvasToContainer = function() {
      app.resizeCanvas(container.clientWidth || 300, container.clientHeight || 300);
    }, applyCameraSettings = function(settings) {
      const camComp = camera.camera;
      camComp.fov = settings.fov;
      camComp.nearClip = settings.nearClip;
      camComp.farClip = settings.farClip;
      camComp.projection = settings.projection === "orthographic" ? pc.PROJECTION_ORTHOGRAPHIC : pc.PROJECTION_PERSPECTIVE;
      for (const material of lasMaterials) {
        material.setParameter("uPointSize", settings.pointSizePx);
        material.update();
      }
      setNavigationModeInternal(settings.navigationMode);
      if (activeMode === "orbit") orbit.update();
    }, syncFlyFromOrbit = function() {
      fly.syncFrom(camera.getPosition(), orbit.yaw, orbit.pitch);
    }, setNavigationModeInternal = function(mode) {
      const next = mode === "orbit" ? "orbit" : "fly";
      if (next === activeMode) return;
      if (activeMode === "orbit") orbit.detach();
      else fly.detach();
      activeMode = next;
      if (activeMode === "orbit") {
        orbit.attach(canvas);
        orbit.update();
      } else {
        syncFlyFromOrbit();
        fly.attach(canvas);
      }
    }, recenter = function() {
      orbit.update();
      if (activeMode === "fly") syncFlyFromOrbit();
    };
    const pc = await import("playcanvas");
    if (!isCurrent()) {
      hideProgress();
      return;
    }
    const app = new pc.Application(canvas, { graphicsDeviceOptions: { antialias: true } });
    app.setCanvasFillMode(pc.FILLMODE_NONE);
    app.setCanvasResolution(pc.RESOLUTION_AUTO);
    resizeCanvasToContainer();
    const resizeObserver = new ResizeObserver(resizeCanvasToContainer);
    resizeObserver.observe(container);
    const worldLayer = app.scene.layers.getLayerByName("World");
    const camera = new pc.Entity("camera");
    camera.addComponent("camera", {
      clearColor: new pc.Color(0.11, 0.12, 0.15),
      layers: [
        worldLayer.id,
        app.scene.layers.getLayerByName("Skybox").id,
        app.scene.layers.getLayerByName("Immediate").id,
        app.scene.layers.getLayerByName("UI").id
      ],
      priority: 0
    });
    app.root.addChild(camera);
    const lasMaterials = [];
    const gizmo = createNavCubeGizmo(pc, app);
    const orbit = new OrbitController(pc, camera, gizmo);
    const fly = new FlyController(pc, camera, gizmo);
    let activeMode = cameraSettings.navigationMode === "orbit" ? "orbit" : "fly";
    if (activeMode === "orbit") orbit.attach(canvas);
    else {
      syncFlyFromOrbit();
      fly.attach(canvas);
    }
    const copcHandles = [];
    app.on("update", (dt) => {
      if (activeMode === "fly") fly.update(dt);
      for (const handle of copcHandles) handle.refresh(camera);
    });
    applyCameraSettings(cameraSettings);
    const unsubscribeSettings = onCameraSettingsChange(applyCameraSettings);
    app.start();
    currentApp = {
      app,
      resizeObserver,
      recenter,
      unsubscribeSettings,
      detachNavigation: () => activeMode === "orbit" ? orbit.detach() : fly.detach(),
      copcHandles
    };
    if (modelType === "pointcloud") {
      let isFirstFile = true;
      const legacyUrls = [];
      const legacyIsFirst = [];
      for (let i = 0; i < urls.length; i++) {
        const copcUrl = copcUrls[i];
        if (copcUrl) {
          const setDistance = isFirstFile ? (d) => orbit.setDistance(d) : () => {
          };
          const updateTransform = isFirstFile ? () => orbit.update() : () => {
          };
          const handle = await loadCopcPointCloud(
            pc,
            app,
            copcUrl,
            orbit.target,
            setDistance,
            updateTransform,
            isCurrent,
            showProgress,
            cameraSettings.pointSizePx,
            lasMaterials
          );
          copcHandles.push(handle);
        } else {
          legacyUrls.push(urls[i]);
          legacyIsFirst.push(isFirstFile);
        }
        isFirstFile = false;
      }
      if (legacyUrls.length) {
        const centerThisBatch = legacyIsFirst[0] === true;
        await loadLasFiles(
          pc,
          app,
          legacyUrls,
          orbit.target,
          centerThisBatch ? (d) => orbit.setDistance(d) : () => {
          },
          centerThisBatch ? () => orbit.update() : () => {
          },
          isCurrent,
          showProgress,
          cameraSettings.pointSizePx,
          lasMaterials
        );
      }
    } else {
      await loadSplatFiles(
        pc,
        app,
        urls,
        orbit.target,
        (d) => orbit.setDistance(d),
        () => orbit.update(),
        isCurrent,
        showProgress
      );
    }
    if (isCurrent()) {
      recenter();
    }
    hideProgress();
  } catch (e) {
    hideProgress();
    showViewerError("Не удалось загрузить просмотрщик: " + String(e));
  }
}
const api = {
  load: loadTourScene,
  dispose: disposeTourViewer,
  recenter: recenterTourCamera,
  showError: showViewerError,
  hideError: hideViewerError,
  getSettings: getCameraSettings,
  setSettings: setCameraSettings
};
window.TourViewer = api;
