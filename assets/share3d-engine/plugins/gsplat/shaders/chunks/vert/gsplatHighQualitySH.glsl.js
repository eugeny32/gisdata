const gsplatHighQualitySH_glsl_rslib_entry_ = `// ============================================================
// GSplat High Quality SH - 高质量 SH 预计算查表（共享 chunk）
// gsplatColor 和 gsplatSogsColor 共用
// ============================================================

#ifdef USE_HIGH_QUALITY_SH
uniform sampler2D sh_result;   // SH 结果查找纹理（64x1024）
uniform sampler2D sh_labels;   // SH 标签纹理（splat -> palette index）

// 解包 11+11+10 位打包的 RGB 值
vec3 unpackSHRgb(vec4 v) {
  uvec4 uv = uvec4(v * 255.0);
  uint bits = (uv.x << 24u) | (uv.y << 16u) | (uv.z << 8u) | uv.w;
  uvec3 vb = (uvec3(bits) >> uvec3(21u, 10u, 0u)) & uvec3(0x7ffu, 0x7ffu, 0x3ffu);
  return vec3(vb) / vec3(2047.0, 2047.0, 1023.0);
}

// 通过查表获取高质量 SH 贡献值
vec3 lookupHighQualitySH(in SplatSource source) {
  vec4 labelSample = texelFetch(sh_labels, source.uv, 0);
  int n = int(labelSample.r * 255.0) + int(labelSample.g * 255.0) * 256;
  vec4 shSample = texelFetch(sh_result, ivec2(n % 64, n / 64), 0);
  return (unpackSHRgb(shSample) - 0.5) * 4.0;
}
#endif
`;
export { gsplatHighQualitySH_glsl_rslib_entry_ as default };
