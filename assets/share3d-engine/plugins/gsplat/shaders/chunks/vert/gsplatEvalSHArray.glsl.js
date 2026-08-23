const gsplatEvalSHArray_glsl_rslib_entry_ = `// ============================================================
// GSplat Eval SH Array - 数组版 SH 评估
// 适用于使用 SH_COEFFS 宏的路径
// ============================================================

#if defined(SH_BANDS) && SH_BANDS > 0

#include "gsplatSHConstantsVS"

vec3 evalSHArray(in vec3 sh[SH_COEFFS], in vec3 dir) {
  float x = dir.x;
  float y = dir.y;
  float z = dir.z;

  vec3 result = SH_C1 * (-sh[0] * y + sh[1] * z - sh[2] * x);

  #if SH_BANDS > 1
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
  #endif

  #if SH_BANDS > 2
    result +=
      sh[8]  * (SH_C3_0 * y * (3.0 * xx - yy)) +
      sh[9]  * (SH_C3_1 * xy * z) +
      sh[10] * (SH_C3_2 * y * (4.0 * zz - xx - yy)) +
      sh[11] * (SH_C3_3 * z * (2.0 * zz - 3.0 * xx - 3.0 * yy)) +
      sh[12] * (SH_C3_4 * x * (4.0 * zz - xx - yy)) +
      sh[13] * (SH_C3_5 * z * (xx - yy)) +
      sh[14] * (SH_C3_6 * x * (xx - 3.0 * yy));
  #endif

  return result;
}

#endif
`;
export { gsplatEvalSHArray_glsl_rslib_entry_ as default };
