const gsplatData_glsl_rslib_entry_ = `// ============================================================
// GSplat Data - 标准 PLY 格式数据读取
// 对标 PlayCanvas gsplatData.js
// ============================================================

// Uniforms
uniform highp usampler2D transformA;  // RGBA32UI: 位置 + rotation.xy
uniform sampler2D transformB;         // RGBA16F: 缩放 + rotation.z

// 工作变量（跨函数传递）
uint tAw;  // transformA.w 缓存

#include "gsplatCovarianceVS"

// 读取模型空间中心位置
vec3 readCenter(SplatSource source) {
  uvec4 tA = texelFetch(transformA, source.uv, 0);
  tAw = tA.w;  // 缓存 rotation.xy（packed half2）
  return uintBitsToFloat(tA.xyz);
}

// 读取协方差矩阵
// 输出 covA, covB 为协方差矩阵上三角元素
// | covA.x  covA.y  covA.z |
// | covA.y  covB.x  covB.y |
// | covA.z  covB.y  covB.z |
void readCovariance(in SplatSource source, out vec3 covA, out vec3 covB) {
  vec4 tB = texelFetch(transformB, source.uv, 0);

  // 解包旋转：rotation.xy 从 tAw，rotation.z 从 tB.w
  vec2 rotXY = unpackHalf2x16(tAw);
  vec4 rot = unpackRotation(vec3(rotXY, tB.w)).wxyz;  // 转换为 (w,x,y,z) 格式

  mat3 R = quatToMat3(rot);
  vec3 scale = tB.xyz;

  computeCovariance(R, scale, covA, covB);
}
`;
export { gsplatData_glsl_rslib_entry_ as default };
