const gsplatCovariance_glsl_rslib_entry_ = `// ============================================================
// GSplat Covariance - 由旋转矩阵和缩放向量计算协方差
// ============================================================

void computeCovariance(in mat3 rot, in vec3 scale, out vec3 covA, out vec3 covB) {
  mat3 M = transpose(mat3(
    scale.x * rot[0],
    scale.y * rot[1],
    scale.z * rot[2]
  ));

  covA = vec3(dot(M[0], M[0]), dot(M[0], M[1]), dot(M[0], M[2]));
  covB = vec3(dot(M[1], M[1]), dot(M[1], M[2]), dot(M[2], M[2]));
}
`;
export { gsplatCovariance_glsl_rslib_entry_ as default };
