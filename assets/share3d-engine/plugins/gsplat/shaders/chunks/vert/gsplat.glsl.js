const gsplat_glsl_rslib_entry_ = `// ============================================================
// GSplat Main - 顶点着色器主入口
// 对标 PlayCanvas gsplat.js (vert)
// ============================================================

// 精度设置
#ifdef USE_HALF_PRECISION
  precision mediump float;
  precision mediump int;
  precision mediump usampler2D;
#else
  precision highp float;
  precision highp int;
  precision highp usampler2D;
#endif

// Uniforms
uniform vec2 viewport;

// Varyings
out vec2 gaussianUV;
out vec4 gaussianColor;
out float vSplatId;       // Splat ID（用于空间抖动）

#ifdef GSPLAT_DEBUG_VARYINGS
  out float vDepth;
  out vec3 vScale;
  out vec3 vNormal;
#endif

// Pick Pass: 传递 splat 原始 ID 用于拾取
#ifdef PICK_PASS
flat out uint vPickSplatId;
#endif

#ifdef GSPLAT_AA
  out float vAAFactor;
#endif

#ifdef USE_LOGDEPTHBUF
  out float vFragDepth;
  out float vIsPerspective;
#endif

// 包含所有依赖
#include "gsplatCommonVS"

// 丢弃顶点的位置
const vec4 discardVec = vec4(0.0, 0.0, 2.0, 1.0);

// ============================================================
// 标量过滤
// ============================================================
#ifdef HAS_SCALAR_FILTER
  uniform sampler2D splatScalar;
  uniform bool scalarFilterEnabled;
  uniform vec2 scalarFilterRange;

  /** 检查 splat 是否通过标量过滤 */
  bool passScalarFilter(ivec2 uv) {
    float scalar = texelFetch(splatScalar, uv, 0).r;
    return scalar >= scalarFilterRange.x && scalar <= scalarFilterRange.y;
  }
#endif

// ============================================================
// 主函数
// ============================================================

void main() {
  // 1. 初始化源
  SplatSource source;
  if (!initSource(source)) {
    gl_Position = discardVec;
    return;
  }

  // 标量过滤：在读取中心前前置过滤
  #ifdef HAS_SCALAR_FILTER
  if (scalarFilterEnabled) {
    if (!passScalarFilter(source.uv)) {
      gl_Position = discardVec;
      return;
    }
  }
  #endif

  // Pick Pass: 传递 splat 原始 ID
  #ifdef PICK_PASS
    vPickSplatId = source.id;
  #endif

  // 2. 读取中心位置
  vec3 modelCenter = readCenter(source);

  // 3. 初始化 SplatCenter
  SplatCenter center;
  center.modelCenterOriginal = modelCenter;

  // 调用自定义钩子修改中心
  modifySplatCenter(modelCenter);
  center.modelCenterModified = modelCenter;

  if (!initCenter(modelCenter, center)) {
    gl_Position = discardVec;
    return;
  }

  // 4. 初始化角落
  SplatCorner corner;
  if (!initCorner(source, center, corner)) {
    gl_Position = discardVec;
    return;
  }

  // 5. 读取颜色
  vec4 clr = readColor(source);

  // 6. AA 补偿
  #ifdef GSPLAT_AA
    clr.a *= corner.aaFactor;
  #endif

  // 7. 评估 SH（如果启用）- 标准 SH 路径（非高质量模式）
  #if defined(SH_BANDS) && SH_BANDS > 0 && !defined(USE_HIGH_QUALITY_SH)
    // 计算模型空间视角方向
    vec3 dir = normalize(center.view * mat3(center.modelView));

    float scale = 1.0;
    #if SH_BANDS == 1
      vec3 sh[3];
      readSHData(source, sh, scale);
      vec3 shContribution = evalSH(sh, dir) * scale;
    #elif SH_BANDS == 2
      vec3 sh[8];
      readSHData(source, sh, scale);
      vec3 shContribution = evalSH(sh, dir) * scale;
    #else
      vec3 sh[15];
      readSHData(source, sh, scale);
      vec3 shContribution = evalSH(sh, dir) * scale;
    #endif
    clr.xyz += shContribution;
  #endif

  // 8. 调用自定义钩子修改颜色
  modifySplatColor(modelCenter, clr);

  // 9. 低 alpha early-out，避免对不可见 splat 继续执行 clipCorner。
  if (255.0 * clr.w <= 1.0) {
    gl_Position = discardVec;
    return;
  }

  // 10. Alpha 裁剪优化
  clipCorner(corner, clr.w);

  // 11. 计算最终位置
  gl_Position = center.proj + vec4(corner.offset, 0.0, 0.0);

  // 12. 输出到 Fragment Shader
  gaussianUV = corner.uv;

  // ============================================================
  // 颜色空间处理说明
  // ============================================================
  //
  // 【clr 的颜色空间】
  // readColor() 返回的颜色是 **Gamma 空间**：
  // - SOGS 格式: f_dc * SH_C0 + 0.5 → Gamma 空间
  // - 标准格式: 直接从 splatColor 纹理读取 → Gamma 空间
  // - SH 评估增量也在 Gamma 空间上直接相加（3DGS 标准做法）
  //
  // 【PlayCanvas 官方实现】
  // PlayCanvas gsplat.js:91 使用 prepareOutputFromGamma：
  //   gaussianColor = vec4(prepareOutputFromGamma(max(clr.xyz, 0.0)), clr.w);
  //
  // 【与 Three.js 的配合 - 重要！】
  // 我们的 GaussianSplatMaterial 继承自 ShaderMaterial，
  // Three.js 不会自动调用 linearToOutputTexel() 进行颜色空间转换。
  // 因此 ColorSpaceManager 会：
  // - renderer.outputColorSpace = SRGBColorSpace 时设置 GAMMA_SRGB
  //   → prepareOutputFromGamma 直接输出 Gamma 颜色（无需转换）
  // - renderer.outputColorSpace = LinearSRGBColorSpace 时设置 GAMMA_NONE
  //   → prepareOutputFromGamma 调用 decodeGamma() 输出线性（用于后处理）
  //
  // 【颜色调节处理顺序】
  // 1. 应用颜色调节（在 Gamma 空间进行，与 SuperSplat 一致）
  // 2. 应用 ToneMapping 和 Gamma 校正输出
  // ============================================================

  // 应用颜色调节（亮度、色温、对比度、饱和度、不透明度）
  clr = applyColorAdjustments(clr);

  gaussianColor = vec4(prepareOutputFromGamma(max(clr.xyz, 0.0)), clr.w);

  #ifdef GSPLAT_AA
    vAAFactor = corner.aaFactor;
  #endif

  // 13. 调试数据
  #ifdef GSPLAT_DEBUG_VARYINGS
    vDepth = -center.view.z;

    #if defined(GSPLAT_WORKBUFFER_DATA) || defined(GSPLAT_SOGS_DATA)
      // WorkBuffer/SOGS 直通路径没有原始 scale/rotation 数据，调试模式使用默认值。
      vScale = vec3(1.0);
      vNormal = vec3(0.0, 0.0, 1.0);
    #else
      // 读取缩放（用于调试）
      vec4 tB = texelFetch(transformB, source.uv, 0);
      vScale = tB.xyz;

      // 读取旋转计算法线
      vec2 rotXY = unpackHalf2x16(tAw);
      vec4 rot = unpackRotation(vec3(rotXY, tB.w)).wxyz;
      mat3 R = quatToMat3(rot);
      vNormal = normalize(R[2]);
    #endif
  #endif

  // 14. 对数深度缓存
  #ifdef USE_LOGDEPTHBUF
    vFragDepth = 1.0 + gl_Position.w;
    vIsPerspective = float(projectionMatrix[2][3] == -1.0);
  #endif
}
`;
export { gsplat_glsl_rslib_entry_ as default };
