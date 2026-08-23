const gsplatOutput_glsl_rslib_entry_ = `// ============================================================
// GSplat Output - 输出颜色处理（ToneMapping + Gamma）
// 对标 PlayCanvas gsplatOutput.js
// ============================================================
//
// 【3DGS 颜色空间说明】
//
// 3DGS 文件中的颜色存储为球谐系数 f_dc，转换公式：
//   color = f_dc * SH_C0 + 0.5
// 结果是 Gamma 空间的颜色（范围 0-1）。
//
// PlayCanvas 官方使用 prepareOutputFromGamma 处理这些颜色。
//
// 【prepareOutputFromGamma】
//
// prepareOutputFromGamma（3DGS 应使用）：
//   输入：Gamma 空间颜色
//   - TONEMAP_NONE + GAMMA_NONE: decodeGamma() → 输出线性
//   - TONEMAP_NONE + GAMMA_SRGB: 直接输出 Gamma
//   - 有 ToneMapping: decodeGamma → toneMap → gammaCorrect
//
// 【与 Three.js 的配合 - 重要！】
//
// 我们的 GaussianSplatMaterial 继承自 ShaderMaterial，
// Three.js 不会自动注入 \`#include <colorspace_fragment>\` 和 \`linearToOutputTexel()\`。
// 因此我们必须在 shader 中自己处理颜色空间转换！
//
// ColorSpaceManager 根据 outputColorSpace 设置 GAMMA_* 宏：
// - SRGBColorSpace（默认）→ GAMMA_SRGB（shader 自己编码为 sRGB）
// - LinearSRGBColorSpace → GAMMA_NONE（输出线性，用于后处理）
// ============================================================

// 曝光 uniform
uniform float exposure;

// ============================================================
// 颜色调节 Uniforms（对标 SuperSplat）
// ============================================================
uniform float colorBrightness;   // 亮度调节 (-1 ~ 1, 默认 0)
uniform float colorTemperature;  // 色温调节 (-1 ~ 1, 默认 0)
uniform float colorContrast;     // 对比度调节 (0 ~ 2, 默认 1)
uniform float colorSaturation;   // 饱和度调节 (0 ~ 2, 默认 1)
uniform float colorOpacity;      // 不透明度调节 (0 ~ 1, 默认 1)

// ============================================================
// Gamma 校正
// ============================================================

// sRGB Gamma 解码（线性化）
vec3 decodeGamma(vec3 color) {
  return pow(color, vec3(2.2));
}

// sRGB Gamma 编码（添加 epsilon 避免 pow(0) 问题）
vec3 encodeGamma(vec3 color) {
  return pow(color + 0.0000001, vec3(1.0 / 2.2));
}

// ============================================================
// 颜色调节函数（对标 SuperSplat）
// ============================================================

// 饱和度调节（使用 ITU-R BT.709 灰度系数）
vec3 applySaturation(vec3 color, float sat) {
  vec3 grey = vec3(dot(color, vec3(0.299, 0.587, 0.114)));
  return grey + (color - grey) * sat;
}

// 色温调节（调整红蓝通道平衡）
vec3 applyTemperature(vec3 color, float temp) {
  return vec3(
    color.r * (1.0 + temp),  // 暖色增加红
    color.g,                  // 绿色不变
    color.b * (1.0 - temp)   // 暖色减少蓝
  );
}

// 亮度调节（简单偏移）
vec3 applyBrightness(vec3 color, float brightness) {
  return color + brightness;
}

// 线性对比度调节（以 0.5 为中心缩放）
vec3 applyContrast(vec3 color, float contrast) {
  return (color - 0.5) * contrast + 0.5;
}

// 综合颜色调节（按顺序应用：色温 -> 亮度 -> 对比度 -> 饱和度）
vec4 applyColorAdjustments(vec4 color) {
  vec3 rgb = color.rgb;

  // 1. 色温（影响色调）
  rgb = applyTemperature(rgb, colorTemperature);

  // 2. 亮度（影响整体明暗）
  rgb = applyBrightness(rgb, colorBrightness);

  // 3. 对比度（影响明暗对比）
  rgb = applyContrast(rgb, colorContrast);

  // 4. 饱和度（影响色彩鲜艳程度）
  rgb = applySaturation(rgb, colorSaturation);

  // 5. 不透明度（影响整体透明度）
  float alpha = color.a * colorOpacity;

  return vec4(rgb, alpha);
}

// ============================================================
// Tone Mapping 函数集
// ============================================================

// Linear Tone Mapping（仅应用曝光）
vec3 toneMapLinear(vec3 color, float exp) {
  return color * exp;
}

// ACES Tone Mapping（电影级色调映射）
// 注意：移除 clamp 以保留 HDR 能力，与 PlayCanvas 官方实现对齐
vec3 toneMapACES(vec3 color) {
  const float a = 2.51;
  const float b = 0.03;
  const float c = 2.43;
  const float d = 0.59;
  const float e = 0.14;
  return (color * (a * color + b)) / (color * (c * color + d) + e);
}

// Neutral Tone Mapping（Three.js 风格）
vec3 toneMapNeutral(vec3 color) {
  const float startCompression = 0.8 - 0.04;
  const float desaturation = 0.15;

  float x = min(color.r, min(color.g, color.b));
  float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
  color -= offset;

  float peak = max(color.r, max(color.g, color.b));
  if (peak < startCompression) return color;

  float d = 1.0 - startCompression;
  float newPeak = 1.0 - d * d / (peak + d - startCompression);
  color *= newPeak / peak;

  float g = 1.0 - 1.0 / (desaturation * (peak - newPeak) + 1.0);
  return mix(color, vec3(newPeak), g);
}

// Filmic Tone Mapping（Uncharted 2 风格）
const float FILMIC_A = 0.15;  // Shoulder Strength
const float FILMIC_B = 0.50;  // Linear Strength
const float FILMIC_C = 0.10;  // Linear Angle
const float FILMIC_D = 0.20;  // Toe Strength
const float FILMIC_E = 0.02;  // Toe Numerator
const float FILMIC_F = 0.30;  // Toe Denominator
const float FILMIC_W = 11.2;  // White Point

vec3 uncharted2Tonemap(vec3 x) {
  return ((x * (FILMIC_A * x + FILMIC_C * FILMIC_B) + FILMIC_D * FILMIC_E) /
          (x * (FILMIC_A * x + FILMIC_B) + FILMIC_D * FILMIC_F)) - vec3(FILMIC_E / FILMIC_F);
}

vec3 toneMapFilmic(vec3 color) {
  vec3 c = uncharted2Tonemap(color);
  vec3 whiteScale = vec3(1.0) / uncharted2Tonemap(vec3(FILMIC_W));
  return c * whiteScale;
}

// ============================================================
// 输出准备函数
// ============================================================

// 准备输出颜色（处理 Gamma 空间输入）
// 注意：3DGS PLY/SOG 文件中的颜色存储在 Gamma 空间
// 对标 PlayCanvas/SuperSplat 的 prepareOutputFromGamma
vec3 prepareOutputFromGamma(vec3 gammaColor) {
  #if defined(TONEMAP_NONE)
    // TONEMAP_NONE: 不应用 tone mapping
    #if defined(GAMMA_NONE)
      // 输出线性空间（由渲染器处理 gamma）
      return decodeGamma(gammaColor);
    #else
      // 直接输出 gamma 空间颜色
      return gammaColor;
    #endif
  #else
    // 应用 tone mapping：先解码到线性空间
    vec3 linearColor = decodeGamma(gammaColor);

    // Tone Mapping（在线性空间进行）
    #if defined(TONEMAP_LINEAR)
      linearColor = toneMapLinear(linearColor, exposure);
    #elif defined(TONEMAP_ACES)
      linearColor = toneMapACES(linearColor * exposure);
    #elif defined(TONEMAP_NEUTRAL)
      linearColor = toneMapNeutral(linearColor * exposure);
    #elif defined(TONEMAP_FILMIC)
      linearColor = toneMapFilmic(linearColor * exposure);
    #else
      // 默认：LINEAR
      linearColor = toneMapLinear(linearColor, exposure);
    #endif

    // Gamma 校正输出
    #if defined(GAMMA_SRGB)
      return encodeGamma(linearColor);
    #else
      // GAMMA_NONE：输出线性，由渲染器处理
      return linearColor;
    #endif
  #endif
}

`;
export { gsplatOutput_glsl_rslib_entry_ as default };
