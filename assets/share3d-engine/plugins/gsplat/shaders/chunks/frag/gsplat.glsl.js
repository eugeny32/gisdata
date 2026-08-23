const gsplat_glsl_rslib_entry_ = `// ============================================================
// GSplat Fragment Shader - 片段着色器主入口
// 对标 PlayCanvas gsplat.js (frag)
// ============================================================

// 精度设置
#ifdef USE_HALF_PRECISION
  precision mediump float;
#else
  precision highp float;
#endif

// 从 Vertex Shader 传入
in vec2 gaussianUV;      // 椭圆局部坐标 [-1, 1]
in vec4 gaussianColor;   // RGB颜色 + opacity
in float vSplatId;       // Splat ID（用于空间抖动）

#ifdef GSPLAT_AA
  in float vAAFactor;
#endif

// 调试模式额外数据
#ifdef GSPLAT_DEBUG_VARYINGS
  in float vDepth;
  in vec3 vScale;
  in vec3 vNormal;
#endif

// Uniforms
uniform int renderMode;
uniform vec2 depthRange;

// Pick Pass: 接收 splat 原始 ID
#ifdef PICK_PASS
uniform vec4 pickId;      // 基础 ID（用于多 GSplatInfo 场景）
flat in uint vPickSplatId;  // splat 原始 ID（来自顶点着色器）
#endif

#if defined(PICK_PASS) || defined(SHADOW_PASS) || defined(PREPASS_PASS)
uniform float alphaClip;
#endif

// 时间抖动偏移（每帧由 CPU 更新）
#if defined(DITHER_BAYER8) || defined(DITHER_BLUENOISE)
uniform vec2 blueNoiseJitter;
#endif

#ifdef USE_LOGDEPTHBUF
  in float vFragDepth;
  in float vIsPerspective;
  uniform float logDepthBufFC;
#endif

out vec4 fragColor;

// Three.js 内置支持
#include <common>
#include <clipping_planes_pars_fragment>
#include <fog_pars_fragment>

// 高斯函数常量
const float EXP4 = exp(-4.0);
const float INV_EXP4 = 1.0 / (1.0 - EXP4);

// 归一化高斯函数
float normExp(float x) {
  return (exp(x * -4.0) - EXP4) * INV_EXP4;
}

// 热力图颜色映射
vec3 heatmap(float t) {
  t = clamp(t, 0.0, 1.0);
  vec3 c;
  if (t < 0.25) {
    c = mix(vec3(0.0, 0.0, 1.0), vec3(0.0, 1.0, 1.0), t * 4.0);
  } else if (t < 0.5) {
    c = mix(vec3(0.0, 1.0, 1.0), vec3(0.0, 1.0, 0.0), (t - 0.25) * 4.0);
  } else if (t < 0.75) {
    c = mix(vec3(0.0, 1.0, 0.0), vec3(1.0, 1.0, 0.0), (t - 0.5) * 4.0);
  } else {
    c = mix(vec3(1.0, 1.0, 0.0), vec3(1.0, 0.0, 0.0), (t - 0.75) * 4.0);
  }
  return c;
}

// Dithering
#ifdef DITHER_BAYER8
const float bayer8[64] = float[64](
    0.0/64.0, 32.0/64.0, 8.0/64.0, 40.0/64.0, 2.0/64.0, 34.0/64.0, 10.0/64.0, 42.0/64.0,
    48.0/64.0, 16.0/64.0, 56.0/64.0, 24.0/64.0, 50.0/64.0, 18.0/64.0, 58.0/64.0, 26.0/64.0,
    12.0/64.0, 44.0/64.0, 4.0/64.0, 36.0/64.0, 14.0/64.0, 46.0/64.0, 6.0/64.0, 38.0/64.0,
    60.0/64.0, 28.0/64.0, 52.0/64.0, 20.0/64.0, 62.0/64.0, 30.0/64.0, 54.0/64.0, 22.0/64.0,
    3.0/64.0, 35.0/64.0, 11.0/64.0, 43.0/64.0, 1.0/64.0, 33.0/64.0, 9.0/64.0, 41.0/64.0,
    51.0/64.0, 19.0/64.0, 59.0/64.0, 27.0/64.0, 49.0/64.0, 17.0/64.0, 57.0/64.0, 25.0/64.0,
    15.0/64.0, 47.0/64.0, 7.0/64.0, 39.0/64.0, 13.0/64.0, 45.0/64.0, 5.0/64.0, 37.0/64.0,
    63.0/64.0, 31.0/64.0, 55.0/64.0, 23.0/64.0, 61.0/64.0, 29.0/64.0, 53.0/64.0, 21.0/64.0
);
float getDitherThreshold() {
    // 添加空间抖动（vSplatId）和时间抖动（blueNoiseJitter）
    vec2 offset = floor(mod(gl_FragCoord.xy + blueNoiseJitter + vSplatId * 0.013, 8.0));
    ivec2 pos = ivec2(offset) & 7;
    float threshold = bayer8[pos.y * 8 + pos.x];
    // 添加 Gamma 校正：将 sRGB 空间的抖动值转换到线性空间
    return pow(threshold, 2.2);
}
#endif

#ifdef DITHER_BLUENOISE
uniform sampler2D blueNoiseTexture;
float getDitherThreshold() {
    // 修复：使用 32x32 纹理尺寸（与 PlayCanvas 一致）
    // 修复：采样 .g 通道（与 PlayCanvas 一致）
    vec2 uv = fract(gl_FragCoord.xy / 32.0 + blueNoiseJitter + vSplatId * 0.013);
    float threshold = texture(blueNoiseTexture, uv).g;
    // 添加 Gamma 校正
    return pow(threshold, 2.2);
}
#endif

void main() {
  #include <clipping_planes_fragment>

  float A = dot(gaussianUV, gaussianUV);

  // Pick Pass
  #ifdef PICK_PASS
    if (A > 1.0) discard;
    float pickAlpha = normExp(A) * gaussianColor.a;
    if (pickAlpha < alphaClip) discard;

    // 计算最终 ID = 基础 ID + splat 原始 ID
    // pickId 编码为 RGBA8，每个通道 8 位
    // 解码基础 ID
    uint baseId = uint(pickId.r * 255.0) |
                  (uint(pickId.g * 255.0) << 8u) |
                  (uint(pickId.b * 255.0) << 16u) |
                  (uint(pickId.a * 255.0) << 24u);

    // 最终 ID = 基础 ID + splat ID
    uint finalId = baseId + vPickSplatId;

    // 编码为 RGBA8 输出
    fragColor = vec4(
      float(finalId & 0xffu) / 255.0,
      float((finalId >> 8u) & 0xffu) / 255.0,
      float((finalId >> 16u) & 0xffu) / 255.0,
      float((finalId >> 24u) & 0xffu) / 255.0
    );
    #include <logdepthbuf_fragment>
    return;
  #endif

  // Shadow Pass
  #ifdef SHADOW_PASS
    if (A > 1.0) discard;
    float shadowAlpha = normExp(A) * gaussianColor.a;
    if (shadowAlpha < alphaClip) discard;
    fragColor = vec4(0.0, 0.0, 0.0, 1.0);
    #include <logdepthbuf_fragment>
    return;
  #endif

  // Prepass
  #ifdef PREPASS_PASS
    if (A > 1.0) discard;
    float prepassAlpha = normExp(A) * gaussianColor.a;
    if (prepassAlpha < alphaClip) discard;
    fragColor = vec4(0.0, 0.0, 0.0, 1.0);
    #include <logdepthbuf_fragment>
    return;
  #endif

  // Overdraw
  #ifdef GSPLAT_OVERDRAW
    if (A > 1.0) discard;
    fragColor = vec4(0.1, 0.0, 0.0, 0.1);
    #include <logdepthbuf_fragment>
    return;
  #endif

  // Render modes
  if (renderMode == 1) {
    if (length(gaussianUV) > 0.15) discard;
    fragColor = vec4(gaussianColor.rgb, 1.0);
    #include <logdepthbuf_fragment>
    #include <fog_fragment>
    return;
  }

  if (renderMode == 2) {
    if (A > 1.0) discard;
    float alpha = gaussianColor.a;
    fragColor = vec4(gaussianColor.rgb * alpha, alpha);
    #include <logdepthbuf_fragment>
    #include <fog_fragment>
    return;
  }

  #ifdef GSPLAT_DEBUG_VARYINGS
    if (renderMode == 3) {
      if (A > 1.0) discard;
      float gaussianWeight = normExp(A);
      float alpha = gaussianWeight * gaussianColor.a;
      if (alpha < 1.0 / 255.0) discard;
      float near = depthRange.x > 0.0 ? depthRange.x : 0.1;
      float far = depthRange.y > 0.0 ? depthRange.y : 100.0;
      float normalizedDepth = clamp((vDepth - near) / (far - near), 0.0, 1.0);
      fragColor = vec4(heatmap(normalizedDepth) * alpha, alpha);
      #include <logdepthbuf_fragment>
      #include <fog_fragment>
      return;
    }
  #endif

  if (renderMode == 4) {
    if (A > 1.0) discard;
    float gaussianWeight = normExp(A);
    float alpha = gaussianWeight * gaussianColor.a;
    if (alpha < 1.0 / 255.0) discard;
    fragColor = vec4(heatmap(gaussianColor.a) * alpha, alpha);
    #include <logdepthbuf_fragment>
    #include <fog_fragment>
    return;
  }

  #ifdef GSPLAT_DEBUG_VARYINGS
    if (renderMode == 5) {
      if (A > 1.0) discard;
      float gaussianWeight = normExp(A);
      float alpha = gaussianWeight * gaussianColor.a;
      if (alpha < 1.0 / 255.0) discard;
      float avgScale = (exp(vScale.x) + exp(vScale.y) + exp(vScale.z)) / 3.0;
      float normalizedScale = clamp(log(avgScale + 0.001) / 5.0 + 1.0, 0.0, 1.0);
      fragColor = vec4(heatmap(normalizedScale) * alpha, alpha);
      #include <logdepthbuf_fragment>
      #include <fog_fragment>
      return;
    }

    if (renderMode == 6) {
      if (A > 1.0) discard;
      float gaussianWeight = normExp(A);
      float alpha = gaussianWeight * gaussianColor.a;
      if (alpha < 1.0 / 255.0) discard;
      vec3 color = normalize(vNormal) * 0.5 + 0.5;
      fragColor = vec4(color * alpha, alpha);
      #include <logdepthbuf_fragment>
      #include <fog_fragment>
      return;
    }
  #endif

  // Default Gaussian rendering
  if (A > 1.0) discard;

  float alpha = normExp(A) * gaussianColor.a;

  // 1. 先过滤完全透明的片段（修复执行顺序）
  if (alpha < 1.0 / 255.0) discard;

  // 2. 再应用抖动（空间+时间+Gamma校正）
  #if !defined(DITHER_NONE)
    float threshold = getDitherThreshold();
    if (alpha < threshold) discard;
  #endif

  fragColor = vec4(gaussianColor.rgb * alpha, alpha);

  #include <logdepthbuf_fragment>
  #include <fog_fragment>
}
`;
export { gsplat_glsl_rslib_entry_ as default };
