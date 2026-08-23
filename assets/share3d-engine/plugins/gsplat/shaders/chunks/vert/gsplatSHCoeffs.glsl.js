const gsplatSHCoeffs_glsl_rslib_entry_ = `// ============================================================
// GSplat SH Coeffs - SH 系数数量定义
// 根据 SH_BANDS 宏自动选择系数数量
// ============================================================

#if defined(SH_BANDS) && SH_BANDS > 0

#if SH_BANDS == 1
  #define SH_COEFFS 3
#elif SH_BANDS == 2
  #define SH_COEFFS 8
#else
  #define SH_COEFFS 15
#endif

#endif // SH_BANDS > 0
`;
export { gsplatSHCoeffs_glsl_rslib_entry_ as default };
