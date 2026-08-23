const vertexShader = `
precision highp float;

// position 和 uv 由 Three.js 自动注入
#ifdef GSPLAT_COPY_SEGMENTS
in vec4 instanceRect;
uniform vec2 uTargetSize;
#endif

out vec2 vUv;

void main() {
  #ifdef GSPLAT_COPY_SEGMENTS
    vec2 corner = position.xy * 0.5 + 0.5;
    vec2 pixel = instanceRect.xy + corner * instanceRect.zw;
    vec2 ndc = pixel / uTargetSize * 2.0 - 1.0;
    vUv = corner;
    gl_Position = vec4(ndc, 0.0, 1.0);
  #else
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  #endif
}
`;
const fragmentShader = `
precision highp float;
precision highp int;
precision highp sampler2D;
precision highp usampler2D;

// 从顶点着色器传入
in vec2 vUv;

// MRT 输出
// 注意：根据 WebGL2 规范，整数纹理必须使用整数输出类型
#ifdef GSPLAT_SCALAR_ONLY
  // 标量模式：单通道浮点输出
  uniform int uScalarMode;
  layout(location = 0) out float fragScalar;
#else
  layout(location = 0) out vec4 fragColor0;    // 颜色纹理 (RGBA16F)
  #ifndef GSPLAT_COLOR_ONLY
  layout(location = 1) out uvec4 fragColor1;  // 几何纹理 0 (RGBA32UI)
  layout(location = 2) out uvec4 fragColor2;  // 几何纹理 1 (RG32UI，使用 uvec4 兼容)
  #endif
#endif

// ==================== Uniforms ====================

// 起始行（用于多批次渲染时的偏移）
uniform int uStartLine;

// 视口宽度（WorkBuffer 纹理宽度）
uniform int uViewportWidth;

// 激活的 splat 数量
uniform int uActiveSplats;

// LOD 调试颜色乘数（默认 vec3(1.0)）
uniform vec3 uColorMultiply;

// 模型矩阵（用于坐标变换）
uniform mat4 matrix_model;

// 视图矩阵（用于 SH 评估）
uniform mat4 matrix_view;

// ==================== 分段复制 ====================
uniform int uSegmentSourceBase;
uniform int uSegmentTargetOffset;
uniform int uSegmentCount;
uniform int uSegmentX;
uniform int uSegmentY;
uniform int uSegmentWidth;

// ==================== 源纹理 (格式分发) ====================

#ifdef GSPLAT_SOGS_DATA
  // SOGS 压缩源纹理。这里对齐 PlayCanvas GSplatSogResource：
  // 直接绑定原始 SOG 纹理，不在加载阶段生成 packedTexture。
  uniform highp sampler2D splatMeansLow;
  uniform highp sampler2D splatMeansHigh;
  uniform highp sampler2D splatQuats;
  uniform highp sampler2D splatScales;
  uniform highp sampler2D splatSH0;

  uniform vec3 sogsMeans_mins;
  uniform vec3 sogsMeans_maxs;
  uniform vec3 sogsScales_mins;
  uniform vec3 sogsScales_maxs;
  uniform vec4 sogsSH0_mins;
  uniform vec4 sogsSH0_maxs;

  #ifdef GSPLAT_SOGS_V2
    uniform highp sampler2D sogsScalesCodebook;
    uniform highp sampler2D sogsSH0Codebook;
  #endif

  #if SH_BANDS > 0
    uniform highp sampler2D packedShN;
    uniform highp sampler2D sogsSH_labels;
    uniform float sogsSHN_mins;
    uniform float sogsSHN_maxs;
    #ifdef GSPLAT_SOGS_V2
      uniform highp sampler2D sogsSHNCodebook;
    #endif

    #include "gsplatSHCoeffsVS"
  #endif

#else
  // ==================== 标准 PLY 格式 ====================
  // 纹理格式与 GaussianSplatGeometry 对应

  // 颜色纹理 (RGBA16F)
  uniform sampler2D splatColor;

  // 数据纹理 A (RGBA32UI): xyz 位置 (float32 as uint32) + rotation.xy 打包 (2 x half)
  uniform highp usampler2D splatDataA;

  // 数据纹理 B (RGBA16F): scale.xyz (half) + rotation.z (half)
  uniform sampler2D splatDataB;

  // SH 纹理（打包格式：每个纹理 5 行，每行存储 1 个系数的 RGB）
  #if SH_BANDS > 0
    uniform sampler2D splatSH0;  // 系数 0-4
    #if SH_BANDS >= 2
      uniform sampler2D splatSH1;  // 系数 5-9
    #endif
    #if SH_BANDS >= 3
      uniform sampler2D splatSH2;  // 系数 10-14
    #endif
  #endif
#endif

// ==================== 辅助函数 ====================

// 四元数转旋转矩阵（SOGS 和 PLY 路径共用）
#include "gsplatQuatToMat3VS"
#include "gsplatCovarianceVS"
#include "gsplatModifyVS"

#ifdef GSPLAT_SOGS_DATA
  // 直接解码 SOGS 数据，对齐 PlayCanvas gsplatSog shader chunks。
  const float SOGS_NORM = 1.414213562373095;  // sqrt(2)
  const float SOGS_SH_C0 = 0.28209479177387814;

  vec3 readCenter(ivec2 uv) {
    vec3 l = texelFetch(splatMeansLow, uv, 0).xyz;
    vec3 u = texelFetch(splatMeansHigh, uv, 0).xyz;
    vec3 n = (l + u * 256.0) / 257.0;
    vec3 v = mix(sogsMeans_mins, sogsMeans_maxs, n);
    return sign(v) * (exp(abs(v)) - 1.0);
  }

  vec4 readColor(ivec2 uv) {
    vec4 c = texelFetch(splatSH0, uv, 0);
    #ifdef GSPLAT_SOGS_V2
      ivec3 i = ivec3(c.xyz * 255.0 + 0.5);
      vec3 clr = vec3(
        texelFetch(sogsSH0Codebook, ivec2(i.x, 0), 0).r,
        texelFetch(sogsSH0Codebook, ivec2(i.y, 0), 0).r,
        texelFetch(sogsSH0Codebook, ivec2(i.z, 0), 0).r
      );
      float alpha = c.w;
    #else
      vec3 clr = mix(sogsSH0_mins.rgb, sogsSH0_maxs.rgb, c.rgb);
      float logitAlpha = mix(sogsSH0_mins.w, sogsSH0_maxs.w, c.w);
      float alpha = 1.0 / (1.0 + exp(-logitAlpha));
    #endif
    return vec4(vec3(0.5) + clr * SOGS_SH_C0, alpha);
  }

  void readRotationScale(ivec2 uv, out vec4 quat, out vec3 scale) {
    vec4 qdata = texelFetch(splatQuats, uv, 0);
    vec3 sdata = texelFetch(splatScales, uv, 0).xyz;

    uint qmode = uint(qdata.w * 255.0 + 0.5) - 252u;
    vec3 abc = (qdata.xyz - 0.5) * SOGS_NORM;
    float d = sqrt(max(0.0, 1.0 - dot(abc, abc)));

    quat = (qmode == 0u) ? vec4(d, abc) :
                ((qmode == 1u) ? vec4(abc.x, d, abc.yz) :
                ((qmode == 2u) ? vec4(abc.xy, d, abc.z) : vec4(abc, d)));

    #ifdef GSPLAT_SOGS_V2
      ivec3 i = ivec3(sdata * 255.0 + 0.5);
      vec3 logScale = vec3(
        texelFetch(sogsScalesCodebook, ivec2(i.x, 0), 0).r,
        texelFetch(sogsScalesCodebook, ivec2(i.y, 0), 0).r,
        texelFetch(sogsScalesCodebook, ivec2(i.z, 0), 0).r
      );
    #else
      vec3 logScale = mix(sogsScales_mins, sogsScales_maxs, sdata);
    #endif
    scale = exp(logScale);
  }

  #if SH_BANDS > 0
  void readSHData(ivec2 uv, out vec3 sh[SH_COEFFS], out float scale) {
    vec4 labels = texelFetch(sogsSH_labels, uv, 0);
    ivec2 t = ivec2(labels.rg * 255.0 + 0.5);
    int n = t.x + t.y * 256;

    int entriesPerRow = textureSize(packedShN, 0).x / SH_COEFFS;
    if (entriesPerRow <= 0) entriesPerRow = 64;

    int u = (n % entriesPerRow) * SH_COEFFS;
    int v = n / entriesPerRow;

    for (int i = 0; i < SH_COEFFS; i++) {
      vec4 packed = texelFetch(packedShN, ivec2(u + i, v), 0);
      #ifdef GSPLAT_SOGS_V2
        ivec3 idx = ivec3(packed.xyz * 255.0 + 0.5);
        sh[i] = vec3(
          texelFetch(sogsSHNCodebook, ivec2(idx.x, 0), 0).r,
          texelFetch(sogsSHNCodebook, ivec2(idx.y, 0), 0).r,
          texelFetch(sogsSHNCodebook, ivec2(idx.z, 0), 0).r
        );
      #else
        sh[i] = mix(vec3(sogsSHN_mins), vec3(sogsSHN_maxs), packed.xyz);
      #endif
    }

    scale = 1.0;
  }

  #include "gsplatEvalSHArrayVS"
  #endif // SH_BANDS > 0 (SOGS)

#else
  // ==================== 标准 PLY 格式 ====================

  /**
   * 从打包的纹理 A 读取中心位置（模型空间）
   */
  vec3 readCenter(ivec2 uv) {
    uvec4 dataA = texelFetch(splatDataA, uv, 0);
    return vec3(
      uintBitsToFloat(dataA.r),
      uintBitsToFloat(dataA.g),
      uintBitsToFloat(dataA.b)
    );
  }

  /**
   * 从颜色纹理读取颜色
   */
  vec4 readColor(ivec2 uv) {
    return texelFetch(splatColor, uv, 0);
  }

  /**
   * 从打包的纹理读取协方差（通过缩放和旋转计算）
   * 对应 PlayCanvas gsplatData.js 的 readCovariance
   */
  void readRotationScale(ivec2 uv, out vec4 quat, out vec3 scale) {
    uvec4 dataA = texelFetch(splatDataA, uv, 0);
    vec4 dataB = texelFetch(splatDataB, uv, 0);

    // 解包旋转四元数 (xyz 分量，w 通过归一化重建)
    vec2 rotXY = unpackHalf2x16(dataA.a);
    float rx = rotXY.x;
    float ry = rotXY.y;
    float rz = dataB.w;

    // 重建四元数的 w 分量（归一化约束）
    float rw = sqrt(max(0.0, 1.0 - rx * rx - ry * ry - rz * rz));

    // 转换为 (w, x, y, z) 格式并构建旋转矩阵
    quat = vec4(rw, rx, ry, rz);

    // 缩放（已经过 exp 激活）
    scale = dataB.xyz;
  }

  // ==================== PLY 格式 SH 数据读取 ====================
  #if SH_BANDS > 0
    #include "gsplatSHCoeffsVS"

    /**
     * 从 PLY 格式读取 SH 数据
     * 对应 PlayCanvas gsplatSH.js
     */
    void readSHData(ivec2 uv, out vec3 sh[SH_COEFFS], out float scale) {
      // 计算纹理高度（每个系数占 1/5 高度）
      int texHeight = textureSize(splatSH0, 0).y / 5;
      int dataX = uv.x;
      int dataY = uv.y;

      // 读取系数 0-2（L1 层）
      sh[0] = texelFetch(splatSH0, ivec2(dataX, 0 * texHeight + dataY), 0).rgb;
      sh[1] = texelFetch(splatSH0, ivec2(dataX, 1 * texHeight + dataY), 0).rgb;
      sh[2] = texelFetch(splatSH0, ivec2(dataX, 2 * texHeight + dataY), 0).rgb;

      #if SH_BANDS > 1
        // 读取系数 3-7（L2 层）
        sh[3] = texelFetch(splatSH0, ivec2(dataX, 3 * texHeight + dataY), 0).rgb;
        sh[4] = texelFetch(splatSH0, ivec2(dataX, 4 * texHeight + dataY), 0).rgb;
        sh[5] = texelFetch(splatSH1, ivec2(dataX, 0 * texHeight + dataY), 0).rgb;
        sh[6] = texelFetch(splatSH1, ivec2(dataX, 1 * texHeight + dataY), 0).rgb;
        sh[7] = texelFetch(splatSH1, ivec2(dataX, 2 * texHeight + dataY), 0).rgb;
      #endif

      #if SH_BANDS > 2
        // 读取系数 8-14（L3 层）
        sh[8]  = texelFetch(splatSH1, ivec2(dataX, 3 * texHeight + dataY), 0).rgb;
        sh[9]  = texelFetch(splatSH1, ivec2(dataX, 4 * texHeight + dataY), 0).rgb;
        sh[10] = texelFetch(splatSH2, ivec2(dataX, 0 * texHeight + dataY), 0).rgb;
        sh[11] = texelFetch(splatSH2, ivec2(dataX, 1 * texHeight + dataY), 0).rgb;
        sh[12] = texelFetch(splatSH2, ivec2(dataX, 2 * texHeight + dataY), 0).rgb;
        sh[13] = texelFetch(splatSH2, ivec2(dataX, 3 * texHeight + dataY), 0).rgb;
        sh[14] = texelFetch(splatSH2, ivec2(dataX, 4 * texHeight + dataY), 0).rgb;
      #endif

      scale = 1.0;
    }

    #include "gsplatEvalSHArrayVS"
  #endif // SH_BANDS > 0 (PLY)
#endif // !GSPLAT_SOGS_DATA

// ==================== 标量计算辅助函数 ====================
#ifdef GSPLAT_SCALAR_ONLY

/**
 * 读取 splat 缩放值（不从协方差反推）
 */
vec3 readScale(ivec2 uv) {
  #ifdef GSPLAT_SOGS_DATA
    vec3 sdata = texelFetch(splatScales, uv, 0).xyz;
    #ifdef GSPLAT_SOGS_V2
      ivec3 i = ivec3(sdata * 255.0 + 0.5);
      vec3 logScale = vec3(
        texelFetch(sogsScalesCodebook, ivec2(i.x, 0), 0).r,
        texelFetch(sogsScalesCodebook, ivec2(i.y, 0), 0).r,
        texelFetch(sogsScalesCodebook, ivec2(i.z, 0), 0).r
      );
    #else
      vec3 logScale = mix(sogsScales_mins, sogsScales_maxs, sdata);
    #endif
    return exp(logScale);
  #else
    // PLY: 从 dataB 纹理读取缩放
    vec4 dataB = texelFetch(splatDataB, uv, 0);
    return dataB.xyz;
  #endif
}

/**
 * 读取 SH0/DC 基色（不使用最终颜色）
 */
vec3 readBaseColor(ivec2 uv) {
  #ifdef GSPLAT_SOGS_DATA
    vec4 c = texelFetch(splatSH0, uv, 0);
    #ifdef GSPLAT_SOGS_V2
      ivec3 i = ivec3(c.xyz * 255.0 + 0.5);
      vec3 clr = vec3(
        texelFetch(sogsSH0Codebook, ivec2(i.x, 0), 0).r,
        texelFetch(sogsSH0Codebook, ivec2(i.y, 0), 0).r,
        texelFetch(sogsSH0Codebook, ivec2(i.z, 0), 0).r
      );
    #else
      vec3 clr = mix(sogsSH0_mins.rgb, sogsSH0_maxs.rgb, c.rgb);
    #endif
    return vec3(0.5) + clr * SOGS_SH_C0;
  #else
    // PLY: 直接从颜色纹理读取
    return texelFetch(splatColor, uv, 0).rgb;
  #endif
}

/**
 * 根据 uScalarMode 计算标量值
 */
float computeScalar(ivec2 uv) {
  if (uScalarMode == 1) {
    // 体积模式：scale.x * scale.y * scale.z
    vec3 s = readScale(uv);
    return s.x * s.y * s.z;
  } else if (uScalarMode == 2) {
    // 表面积近似：scale.x² + scale.y² + scale.z²
    vec3 s = readScale(uv);
    return s.x * s.x + s.y * s.y + s.z * s.z;
  } else if (uScalarMode == 3) {
    // 亮度模式：ITU-R BT.601 luma
    vec3 c = readBaseColor(uv);
    return 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
  }
  return 0.0;
}

#endif // GSPLAT_SCALAR_ONLY

/**
 * 将两个 float 打包为一个 uint（使用半精度）
 * 对应 PlayCanvas packHalf.js 的 packHalf2x16Safe
 */
uint packHalf2x16Safe(vec2 v) {
  return packHalf2x16(v);
}

vec4 mat3ToQuat(mat3 m) {
  float trace = m[0][0] + m[1][1] + m[2][2];
  vec4 q;

  if (trace > 0.0) {
    float s = sqrt(trace + 1.0) * 2.0;
    q = vec4(
      0.25 * s,
      (m[1][2] - m[2][1]) / s,
      (m[2][0] - m[0][2]) / s,
      (m[0][1] - m[1][0]) / s
    );
  } else if (m[0][0] > m[1][1] && m[0][0] > m[2][2]) {
    float s = sqrt(1.0 + m[0][0] - m[1][1] - m[2][2]) * 2.0;
    q = vec4(
      (m[1][2] - m[2][1]) / s,
      0.25 * s,
      (m[1][0] + m[0][1]) / s,
      (m[2][0] + m[0][2]) / s
    );
  } else if (m[1][1] > m[2][2]) {
    float s = sqrt(1.0 + m[1][1] - m[0][0] - m[2][2]) * 2.0;
    q = vec4(
      (m[2][0] - m[0][2]) / s,
      (m[1][0] + m[0][1]) / s,
      0.25 * s,
      (m[2][1] + m[1][2]) / s
    );
  } else {
    float s = sqrt(1.0 + m[2][2] - m[0][0] - m[1][1]) * 2.0;
    q = vec4(
      (m[0][1] - m[1][0]) / s,
      (m[2][0] + m[0][2]) / s,
      (m[2][1] + m[1][2]) / s,
      0.25 * s
    );
  }

  q = normalize(q);
  return q.x < 0.0 ? -q : q;
}

void transformRotationScale(in vec4 localQuat, in vec3 localScale, out vec4 worldQuat, out vec3 worldScale) {
  mat3 localRot = quatToMat3(localQuat);
  mat3 linear = mat3(matrix_model);
  // WorkBuffer transform storage follows PlayCanvas semantics. It stores only
  // rotation + per-axis scale, so model transforms must not rely on shear,
  // mirror / negative determinant, or arbitrary non-uniform scale mixed with
  // local splat rotation. The old covariance path could express those, but it
  // was removed to avoid mobile half-packed covariance precision artifacts.
  vec3 axisX = linear * (localRot[0] * localScale.x);
  vec3 axisY = linear * (localRot[1] * localScale.y);
  vec3 axisZ = linear * (localRot[2] * localScale.z);

  worldScale = vec3(length(axisX), length(axisY), length(axisZ));
  mat3 worldRot = mat3(
    axisX / max(worldScale.x, 1e-20),
    axisY / max(worldScale.y, 1e-20),
    axisZ / max(worldScale.z, 1e-20)
  );
  worldQuat = mat3ToQuat(worldRot);
}

// ==================== 主函数 ====================

void main() {
  // 1. 计算当前 copy segment 偏移；对齐 PlayCanvas 的行对齐局部绘制路径，
  // 避免为每个 splat 维护一张大型 interval remap 纹理。
  int segmentLocalX = int(gl_FragCoord.x) - uSegmentX;
  int segmentLocalY = int(gl_FragCoord.y) - uSegmentY;
  int segmentIndex = segmentLocalY * uSegmentWidth + segmentLocalX;
  int targetIndex = uSegmentTargetOffset + segmentIndex;

  // 2. 越界检查：超出范围丢弃片元（保留 MRT 中其他 splat 已写入的数据）
  if (
    segmentLocalX < 0 ||
    segmentLocalY < 0 ||
    segmentIndex < 0 ||
    segmentIndex >= uSegmentCount ||
    targetIndex < 0 ||
    targetIndex >= uActiveSplats
  ) {
    discard;
  }

  // 3. LOD 重映射：每个 segment 自带源区间起点。
  int originalIndex = uSegmentSourceBase + segmentIndex;

  // 4. 计算源纹理 UV（根据格式选择正确的纹理）
  #ifdef GSPLAT_SOGS_DATA
    int srcSize = textureSize(splatMeansLow, 0).x;
  #else
    int srcSize = textureSize(splatColor, 0).x;
  #endif
  ivec2 sourceUV = ivec2(originalIndex % srcSize, originalIndex / srcSize);

  // GSPLAT_SCALAR_ONLY 快速路径：仅计算标量值后返回
  #ifdef GSPLAT_SCALAR_ONLY
    fragScalar = computeScalar(sourceUV);
    return;
  #endif

  #ifndef GSPLAT_SCALAR_ONLY
  // 6. 读取中心位置（模型空间）
  vec3 modelCenter = readCenter(sourceUV);

  // 7. 变换到世界空间
  vec3 worldCenter = (matrix_model * vec4(modelCenter, 1.0)).xyz;
  modifySplatCenter(worldCenter);

  // 8. 读取并转换 rotation/scale，WorkBuffer 只保存 transform 语义
  vec4 localQuat;
  vec3 localScale;
  vec4 worldQuat;
  vec3 worldScale;
  readRotationScale(sourceUV, localQuat, localScale);
  transformRotationScale(localQuat, localScale, worldQuat, worldScale);

  // 10. 读取颜色
  vec4 color = readColor(sourceUV);
  vec4 baseColor = color;  // 保存基础颜色用于调试
  vec3 shContribution = vec3(0.0);

  // 11. 评估 SH（如果启用）
  #if SH_BANDS > 0
    // 计算模型空间视图方向；center 使用 WorkBuffer modifier 后的世界空间位置，
    // 保持 center-moving effect 与最终渲染路径的 SH 取向一致。
    // PlayCanvas gsplatCenter.js:
    //   mat4 modelView = matrix_view * matrix_model;
    //   vec4 centerView = modelView * vec4(modelCenter, 1.0);
    //   center.view = centerView.xyz / centerView.w;
    // PlayCanvas gsplatCopyToWorkbuffer.js:
    //   vec3 dir = normalize(center.view * mat3(center.modelView));
    mat4 modelView = matrix_view * matrix_model;
    vec4 centerViewH = matrix_view * vec4(worldCenter, 1.0);
    vec3 centerView = centerViewH.xyz / centerViewH.w;
    vec3 viewDir = normalize(centerView * mat3(modelView));

    // 读取 SH 系数并评估
    vec3 sh[SH_COEFFS];
    float shScale;
    readSHData(sourceUV, sh, shScale);
    shContribution = evalSHArray(sh, viewDir) * shScale;
    color.rgb += shContribution;
  #endif

  // 12. 应用颜色乘数（用于 LOD 调试）
  color.rgb *= uColorMultiply;
  modifySplatColor(worldCenter, color);

  // 13. 输出到 MRT（对应 PlayCanvas 第 110-126 行）
  fragColor0 = color;

  #ifndef GSPLAT_COLOR_ONLY
    fragColor1 = uvec4(
      floatBitsToUint(worldCenter.x),
      floatBitsToUint(worldCenter.y),
      floatBitsToUint(worldCenter.z),
      packHalf2x16Safe(worldQuat.yz)
    );

    fragColor2 = uvec4(
      packHalf2x16Safe(vec2(worldQuat.w, worldScale.x)),
      packHalf2x16Safe(worldScale.yz),
      0u,
      0u
    );
  #endif
  #endif // !GSPLAT_SCALAR_ONLY
}
`;
export { fragmentShader, vertexShader };
