const centersPoints_glsl_rslib_entry_ = `// ============================================================
// Centers Points - 中心点渲染片元着色器
// 将点渲染为带边缘柔化的圆形
// ============================================================

#ifdef USE_HALF_PRECISION
  precision mediump float;
#else
  precision highp float;
#endif

in vec4 vColor;

#ifdef USE_LOGDEPTHBUF
  in float vFragDepth;
  in float vIsPerspective;
  uniform float logDepthBufFC;
#endif

out vec4 fragColor;

void main() {
  // 使用 gl_PointCoord 绘制圆形（范围 [0, 1]）
  vec2 coord = gl_PointCoord * 2.0 - 1.0;
  float dist = dot(coord, coord);

  // 丢弃圆形外的片段
  if (dist > 1.0) discard;

  // 边缘柔化（抗锯齿）
  float edgeSoftness = 0.1;
  float alpha = vColor.a * (1.0 - smoothstep(1.0 - edgeSoftness, 1.0, dist));

  // 输出颜色（预乘 alpha）
  fragColor = vec4(vColor.rgb * alpha, alpha);

  #ifdef USE_LOGDEPTHBUF
    gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2(vFragDepth) * logDepthBufFC * 0.5;
  #endif
}
`;
export { centersPoints_glsl_rslib_entry_ as default };
