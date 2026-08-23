const gsplatColor_glsl_rslib_entry_ = `// ============================================================
// GSplat Color - 标准格式颜色读取
// 对标 PlayCanvas gsplatColor.js
// ============================================================

// Uniforms
uniform sampler2D splatColor;  // RGBA8: RGB 颜色 + 透明度

// 高质量 SH 共享查表
#include "gsplatHighQualitySHVS"

// 读取颜色和透明度
vec4 readColor(in SplatSource source) {
  vec4 baseColor = texelFetch(splatColor, source.uv, 0);

  #ifdef USE_HIGH_QUALITY_SH
    vec3 sh = lookupHighQualitySH(source);
    return vec4(baseColor.rgb + sh, baseColor.a);
  #else
    return baseColor;
  #endif
}
`;
export { gsplatColor_glsl_rslib_entry_ as default };
