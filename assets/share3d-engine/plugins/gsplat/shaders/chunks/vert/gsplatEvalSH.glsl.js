const gsplatEvalSH_glsl_rslib_entry_ = `// ============================================================
// GSplat Eval SH - 球谐函数评估
// 对标 PlayCanvas gsplatEvalSH.js
// ============================================================

#if defined(SH_BANDS) && SH_BANDS > 0

// SH 常量
#include "gsplatSHConstantsVS"

// ============================================================
// 评估 SH（根据 SH_BANDS 选择不同版本）
// ============================================================

#if SH_BANDS == 1
// SH Band 1 评估（3 个系数）
vec3 evalSH(in vec3 sh[3], in vec3 dir) {
  float x = dir.x;
  float y = dir.y;
  float z = dir.z;
  return SH_C1 * (-sh[0] * y + sh[1] * z - sh[2] * x);
}

#elif SH_BANDS == 2
// SH Band 2 评估（8 个系数）
vec3 evalSH(in vec3 sh[8], in vec3 dir) {
  float x = dir.x;
  float y = dir.y;
  float z = dir.z;

  // 1st degree
  vec3 result = SH_C1 * (-sh[0] * y + sh[1] * z - sh[2] * x);

  // 2nd degree
  float xx = x * x;
  float yy = y * y;
  float zz = z * z;
  float xy = x * y;
  float yz = y * z;
  float xz = x * z;

  result +=
    sh[3] * (SH_C2_0 * xy) +
    sh[4] * (SH_C2_1 * yz) +
    sh[5] * (SH_C2_2 * (2.0 * zz - xx - yy)) +
    sh[6] * (SH_C2_3 * xz) +
    sh[7] * (SH_C2_4 * (xx - yy));

  return result;
}

#else
// SH Band 3 评估（15 个系数）
vec3 evalSH(in vec3 sh[15], in vec3 dir) {
  float x = dir.x;
  float y = dir.y;
  float z = dir.z;

  // 1st degree
  vec3 result = SH_C1 * (-sh[0] * y + sh[1] * z - sh[2] * x);

  // 2nd degree
  float xx = x * x;
  float yy = y * y;
  float zz = z * z;
  float xy = x * y;
  float yz = y * z;
  float xz = x * z;

  result +=
    sh[3] * (SH_C2_0 * xy) +
    sh[4] * (SH_C2_1 * yz) +
    sh[5] * (SH_C2_2 * (2.0 * zz - xx - yy)) +
    sh[6] * (SH_C2_3 * xz) +
    sh[7] * (SH_C2_4 * (xx - yy));

  // 3rd degree
  result +=
    sh[8]  * (SH_C3_0 * y * (3.0 * xx - yy)) +
    sh[9]  * (SH_C3_1 * xy * z) +
    sh[10] * (SH_C3_2 * y * (4.0 * zz - xx - yy)) +
    sh[11] * (SH_C3_3 * z * (2.0 * zz - 3.0 * xx - 3.0 * yy)) +
    sh[12] * (SH_C3_4 * x * (4.0 * zz - xx - yy)) +
    sh[13] * (SH_C3_5 * z * (xx - yy)) +
    sh[14] * (SH_C3_6 * x * (xx - 3.0 * yy));

  return result;
}
#endif

#endif // SH_BANDS > 0
`;
export { gsplatEvalSH_glsl_rslib_entry_ as default };
