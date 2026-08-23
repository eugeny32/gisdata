const gsplatWorkBuffer_glsl_rslib_entry_ = `// ============================================================
// GSplat WorkBuffer - PlayCanvas-compatible transform 数据格式
// 对标 PlayCanvas gsplatWorkBuffer.js
// ============================================================
//
// WorkBuffer 默认输出格式：
// - transformA (RGBA32UI): worldCenter.xyz (floatBitsToUint) + pack(rotation.yz)
// - transformB (RG32UI): pack(rotation.w, scale.x) + pack(scale.yz)
// - splatColor (RGBA16F or RGBA8 fallback): color.rgba
//
// 特点：
// 1. 位置已经是世界空间
// 2. rotation/scale 已变换到世界空间
// 3. 最终 draw 阶段以 highp 重新计算 covariance

// Uniforms
#include "gsplatCovarianceVS"
uniform highp usampler2D transformA;  // RGBA32UI: worldCenter + rotation.yz
uniform highp usampler2D transformB;  // RG32UI: rotation.w + scale
uniform sampler2D splatColor;         // RGBA16F or RGBA8 fallback: color

// 工作变量
uint tAw;  // transformA.w 缓存

// 读取世界空间中心位置
vec3 readCenter(SplatSource source) {
  uvec4 tA = texelFetch(transformA, source.uv, 0);
  tAw = tA.w;  // 缓存 pack(rotation.yz)
  return uintBitsToFloat(tA.xyz);
}

// 读取 WorkBuffer transform 并计算世界空间协方差
void readCovariance(in SplatSource source, out vec3 covA, out vec3 covB) {
  vec2 rotYZ = unpackHalf2x16(tAw);
  uvec4 tB = texelFetch(transformB, source.uv, 0);
  vec2 rotWScaleX = unpackHalf2x16(tB.x);
  vec2 scaleYZ = unpackHalf2x16(tB.y);

  vec4 rotation = vec4(
    sqrt(max(0.0, 1.0 - dot(rotYZ, rotYZ) - rotWScaleX.x * rotWScaleX.x)),
    rotYZ.x,
    rotYZ.y,
    rotWScaleX.x
  );
  vec3 scale = vec3(rotWScaleX.y, scaleYZ);

  computeCovariance(quatToMat3(rotation), scale, covA, covB);
}

// 读取颜色
vec4 readColor(in SplatSource source) {
  return texelFetch(splatColor, source.uv, 0);
}
`;
export { gsplatWorkBuffer_glsl_rslib_entry_ as default };
