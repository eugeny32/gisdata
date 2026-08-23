const gsplatSH_glsl_rslib_entry_ = `// ============================================================
// GSplat SH - 标准格式球谐系数读取
// 对标 PlayCanvas gsplatSH.js
// ============================================================

#if defined(SH_BANDS) && SH_BANDS > 0

// SH 纹理 Uniforms（使用 usampler2D + 11-10-11 位打包）
uniform highp usampler2D splatSH_1to3;
#if SH_BANDS > 1
uniform highp usampler2D splatSH_4to7;
uniform highp usampler2D splatSH_8to11;
#endif
#if SH_BANDS > 2
uniform highp usampler2D splatSH_12to15;
#endif

// 解包 11-10-11 位有符号格式
// 输入: 32 位无符号整数
// 输出: 3 个归一化的有符号浮点数 [-1, 1]
vec3 unpack111011s(uint bits) {
  return vec3((uvec3(bits) >> uvec3(21u, 11u, 0u)) & uvec3(0x7ffu, 0x3ffu, 0x7ffu)) / vec3(2047.0, 1023.0, 2047.0) * 2.0 - 1.0;
}

// 读取带 scale 的 SH 系数组（第一个纹理特殊处理）
// t.x 存储 scale（float），t.yzw 存储 3 个 SH 系数
void fetchScale(in uvec4 t, out float scale, out vec3 a, out vec3 b, out vec3 c) {
  scale = uintBitsToFloat(t.x);
  a = unpack111011s(t.y);
  b = unpack111011s(t.z);
  c = unpack111011s(t.w);
}

// 读取 4 个 SH 系数
void fetch4(in uvec4 t, out vec3 a, out vec3 b, out vec3 c, out vec3 d) {
  a = unpack111011s(t.x);
  b = unpack111011s(t.y);
  c = unpack111011s(t.z);
  d = unpack111011s(t.w);
}

// 读取单个 SH 系数
void fetch1(in uint t, out vec3 a) {
  a = unpack111011s(t);
}

// ============================================================
// 根据 SH_BANDS 定义不同的 readSHData
// ============================================================

#if SH_BANDS == 1
// SH Band 1: 3 个系数
void readSHData(in SplatSource source, out vec3 sh[3], out float scale) {
  fetchScale(texelFetch(splatSH_1to3, source.uv, 0), scale, sh[0], sh[1], sh[2]);
}
#elif SH_BANDS == 2
// SH Band 2: 8 个系数
void readSHData(in SplatSource source, out vec3 sh[8], out float scale) {
  fetchScale(texelFetch(splatSH_1to3, source.uv, 0), scale, sh[0], sh[1], sh[2]);
  fetch4(texelFetch(splatSH_4to7, source.uv, 0), sh[3], sh[4], sh[5], sh[6]);
  fetch1(texelFetch(splatSH_8to11, source.uv, 0).x, sh[7]);
}
#else
// SH Band 3: 15 个系数
void readSHData(in SplatSource source, out vec3 sh[15], out float scale) {
  fetchScale(texelFetch(splatSH_1to3, source.uv, 0), scale, sh[0], sh[1], sh[2]);
  fetch4(texelFetch(splatSH_4to7, source.uv, 0), sh[3], sh[4], sh[5], sh[6]);
  fetch4(texelFetch(splatSH_8to11, source.uv, 0), sh[7], sh[8], sh[9], sh[10]);
  fetch4(texelFetch(splatSH_12to15, source.uv, 0), sh[11], sh[12], sh[13], sh[14]);
}
#endif

#endif // SH_BANDS > 0
`;
export { gsplatSH_glsl_rslib_entry_ as default };
