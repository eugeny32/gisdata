const gsplatHelpers_glsl_rslib_entry_ = `// ============================================================
// GSplat Helpers - 协方差辅助函数
// 对标 PlayCanvas gsplatHelpers.js
// ============================================================

// 从协方差矩阵提取 RMS 大小
// 协方差矩阵：| covA.x  covA.y  covA.z |
//            | covA.y  covB.x  covB.y |
//            | covA.z  covB.y  covB.z |
float gsplatExtractSize(vec3 covA, vec3 covB) {
  float tr = covA.x + covB.x + covB.z;  // 对角线元素之和（迹）
  return sqrt(max(tr, 0.0) / 3.0);
}

// 对协方差矩阵应用均匀缩放
void gsplatApplyUniformScale(inout vec3 covA, inout vec3 covB, float scale) {
  float s2 = scale * scale;
  covA *= s2;
  covB *= s2;
}

// 将 splat 变成球形
// size=0 可隐藏 splat（协方差变为零矩阵）
void gsplatMakeRound(inout vec3 covA, inout vec3 covB, float size) {
  float s2 = size * size;
  covA = vec3(s2, 0.0, 0.0);
  covB = vec3(s2, 0.0, s2);
}
`;
export { gsplatHelpers_glsl_rslib_entry_ as default };
