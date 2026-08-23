const gsplatSogsColor_glsl_rslib_entry_ = `// ============================================================
// GSplat SOGS Color - SOGS 格式颜色读取
// 对标 PlayCanvas gsplatSogsColor.js
// ============================================================

const float SH_C0 = 0.28209479177387814;

// SOGS 颜色 Uniforms
uniform sampler2D splatSH0;  // sh0: DC 颜色 + 透明度

// V1 格式专用
#ifndef GSPLAT_SOGS_V2
uniform vec4 sogsSH0_mins;
uniform vec4 sogsSH0_maxs;
#endif

// V2 格式专用
#ifdef GSPLAT_SOGS_V2
uniform sampler2D sogsSH0Codebook;
#endif

// 高质量 SH 共享查表
#include "gsplatHighQualitySHVS"

// 读取颜色和透明度
vec4 readColor(in SplatSource source) {
  #ifdef USE_HIGH_QUALITY_SH
    // 高质量 SH 模式：使用预计算的 SH 查找纹理
    vec4 data = texelFetch(splatSH0, source.uv, 0);

    #ifdef GSPLAT_SOGS_V2
      // V2: Codebook 查找
      vec3 baseColor = vec3(
        texelFetch(sogsSH0Codebook, ivec2(int(data.r * 255.0), 0), 0).r,
        texelFetch(sogsSH0Codebook, ivec2(int(data.g * 255.0), 0), 0).r,
        texelFetch(sogsSH0Codebook, ivec2(int(data.b * 255.0), 0), 0).r
      );
      // 颜色已经是 SH DC 系数，需要转为 RGB
      baseColor = baseColor * SH_C0 + 0.5;
    #else
      // V1: Min-Max 线性插值（存储的是 SH DC 系数，需要转为 RGB）
      vec3 f_dc = mix(sogsSH0_mins.rgb, sogsSH0_maxs.rgb, data.rgb);
      vec3 baseColor = f_dc * SH_C0 + 0.5;
    #endif

    // 透明度
    float opacity = data.a;

    vec3 sh = lookupHighQualitySH(source);

    return vec4(baseColor + sh, opacity);
  #else
    // 标准模式：直接读取 DC 颜色
    vec4 data = texelFetch(splatSH0, source.uv, 0);

    #ifdef GSPLAT_SOGS_V2
      // V2: Codebook 查找
      vec3 color = vec3(
        texelFetch(sogsSH0Codebook, ivec2(int(data.r * 255.0), 0), 0).r,
        texelFetch(sogsSH0Codebook, ivec2(int(data.g * 255.0), 0), 0).r,
        texelFetch(sogsSH0Codebook, ivec2(int(data.b * 255.0), 0), 0).r
      );
      // 颜色已经是 SH DC 系数，需要转为 RGB
      color = color * SH_C0 + 0.5;
    #else
      // V1: Min-Max 线性插值（存储的是 SH DC 系数，需要转为 RGB）
      vec3 f_dc = mix(sogsSH0_mins.rgb, sogsSH0_maxs.rgb, data.rgb);
      vec3 color = f_dc * SH_C0 + 0.5;
    #endif

    // 透明度
    float opacity = data.a;

    return vec4(color, opacity);
  #endif
}
`;
export { gsplatSogsColor_glsl_rslib_entry_ as default };
