const gsplatSHConstants_glsl_rslib_entry_ = `// ============================================================
// GSplat SH Constants - 球谐函数常数定义
// gsplatEvalSH 和 gsplatCopyToWorkBuffer 共用
// ============================================================

#if defined(SH_BANDS) && SH_BANDS > 0

const float SH_C1 = 0.4886025119029199;

#if SH_BANDS > 1
const float SH_C2_0 = 1.0925484305920792;
const float SH_C2_1 = -1.0925484305920792;
const float SH_C2_2 = 0.31539156525252005;
const float SH_C2_3 = -1.0925484305920792;
const float SH_C2_4 = 0.5462742152960396;
#endif

#if SH_BANDS > 2
const float SH_C3_0 = -0.5900435899266435;
const float SH_C3_1 = 2.890611442640554;
const float SH_C3_2 = -0.4570457994644658;
const float SH_C3_3 = 0.3731763325901154;
const float SH_C3_4 = -0.4570457994644658;
const float SH_C3_5 = 1.445305721320277;
const float SH_C3_6 = -0.5900435899266435;
#endif

#endif // SH_BANDS > 0
`;
export { gsplatSHConstants_glsl_rslib_entry_ as default };
