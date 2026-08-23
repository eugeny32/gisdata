const gsplatSogsData_glsl_rslib_entry_ = `// ============================================================
// GSplat SOGS Data - SOGS 压缩格式数据读取
// 对标 PlayCanvas gsplatSogsData.js
// ============================================================

// SOGS 常量
const float SOGS_NORM = 1.414213562373095;  // sqrt(2)

// SOGS 专用 Uniforms
uniform sampler2D splatMeansLow;   // means_l: 位置低 8 位
uniform sampler2D splatMeansHigh;  // means_u: 位置高 8 位
uniform sampler2D splatQuats;      // quats: 四元数 + mode
uniform sampler2D splatScales;     // scales: 缩放数据

// SOGS 元数据
uniform vec3 sogsMeans_mins;
uniform vec3 sogsMeans_maxs;

// V1 格式专用（Min-Max 线性插值）
#ifndef GSPLAT_SOGS_V2
uniform vec3 sogsScales_mins;
uniform vec3 sogsScales_maxs;
#endif

// V2 格式专用（Codebook 量化）
#ifdef GSPLAT_SOGS_V2
uniform sampler2D sogsScalesCodebook;
#endif

#include "gsplatCovarianceVS"

// 读取模型空间中心位置（16-bit 精度 + 指数反变换）
vec3 readCenter(SplatSource source) {
  vec4 low = texelFetch(splatMeansLow, source.uv, 0);
  vec4 high = texelFetch(splatMeansHigh, source.uv, 0);

  // 合并高低位（16-bit）
  vec3 normalized = vec3(
    float((int(high.r * 255.0) << 8) | int(low.r * 255.0)) / 65535.0,
    float((int(high.g * 255.0) << 8) | int(low.g * 255.0)) / 65535.0,
    float((int(high.b * 255.0) << 8) | int(low.b * 255.0)) / 65535.0
  );

  // 反量化到范围
  vec3 pos = mix(sogsMeans_mins, sogsMeans_maxs, normalized);

  // 指数反变换（PlayCanvas 特有）
  return sign(pos) * (exp(abs(pos)) - 1.0);
}

// 读取协方差（四元数 + 缩放）
void readCovariance(in SplatSource source, out vec3 covA, out vec3 covB) {
  // 1. 解码四元数（8-bit + mode）
  vec4 qdata = texelFetch(splatQuats, source.uv, 0);
  vec3 abc = (qdata.xyz - 0.5) * SOGS_NORM;
  float d = sqrt(max(0.0, 1.0 - dot(abc, abc)));

  // mode 决定四元数的四个分量中哪个是计算出来的 d
  uint mode = uint(qdata.w * 255.0) - 252u;
  vec4 quat;

  if (mode == 0u) {
    quat = vec4(d, abc);  // w=d, x=a, y=b, z=c
  } else if (mode == 1u) {
    quat = vec4(abc.x, d, abc.y, abc.z);  // w=a, x=d, y=b, z=c
  } else if (mode == 2u) {
    quat = vec4(abc.x, abc.y, d, abc.z);  // w=a, x=b, y=d, z=c
  } else {
    quat = vec4(abc, d);  // w=a, x=b, y=c, z=d
  }

  mat3 rot = quatToMat3(quat);

  // 2. 解码缩放
  vec4 sdata = texelFetch(splatScales, source.uv, 0);
  vec3 scale;

  #ifdef GSPLAT_SOGS_V2
    // V2: Codebook 查找
    scale = vec3(
      texelFetch(sogsScalesCodebook, ivec2(int(sdata.r * 255.0), 0), 0).r,
      texelFetch(sogsScalesCodebook, ivec2(int(sdata.g * 255.0), 0), 0).r,
      texelFetch(sogsScalesCodebook, ivec2(int(sdata.b * 255.0), 0), 0).r
    );
  #else
    // V1: Min-Max 线性插值
    scale = mix(sogsScales_mins, sogsScales_maxs, sdata.rgb);
  #endif

  // 缩放存储为 log 空间，需要 exp 恢复
  scale = exp(scale);

  computeCovariance(rot, scale, covA, covB);
}
`;
export { gsplatSogsData_glsl_rslib_entry_ as default };
