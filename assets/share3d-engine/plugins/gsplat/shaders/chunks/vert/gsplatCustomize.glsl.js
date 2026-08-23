const gsplatCustomize_glsl_rslib_entry_ = `// ============================================================
// GSplat Modify - PlayCanvas 风格自定义钩子函数
// 对标 PlayCanvas gsplatModifyVS，保留旧 gsplatCustomizeVS 作为内部兼容入口。
// ============================================================

// 外部特效优先实现 modifySplat* 函数。旧 modify* 函数作为兼容别名保留。

#ifndef CUSTOM_MODIFY_SPLAT_CENTER
// 修改中心位置钩子
// 用法示例：center.y += 1.0; // 上移 1 单位
void modifySplatCenter(inout vec3 center) {
  #ifdef CUSTOM_MODIFY_CENTER
    modifyCenter(center);
  #endif
  // 默认不修改
}
#endif

#ifndef CUSTOM_MODIFY_SPLAT_COVARIANCE
// 修改协方差钩子，对应 PlayCanvas modifySplatRotationScale 的 Share3DEngine 版本。
// 参数：originalCenter - 原始中心位置
//       modifiedCenter - 经过 modifySplatCenter 修改后的中心位置
//       covA, covB - 协方差矩阵上三角元素
// 用法示例：
//   gsplatApplyUniformScale(covA, covB, 2.0);  // 半径放大 2 倍，covariance 内部按 4 倍缩放
//   float size = gsplatExtractSize(covA, covB);
//   gsplatMakeRound(covA, covB, size * 0.5);   // 变成圆形 splat
//   gsplatMakeRound(covA, covB, 0.0);          // 隐藏 splat
void modifySplatCovariance(vec3 originalCenter, vec3 modifiedCenter, inout vec3 covA, inout vec3 covB) {
  #ifdef CUSTOM_MODIFY_COVARIANCE
    modifyCovariance(originalCenter, modifiedCenter, covA, covB);
  #endif
  // 默认不修改
}
#endif

#ifndef CUSTOM_MODIFY_SPLAT_COLOR
// 修改颜色钩子
// 参数：center - 当前 splat 中心位置
//       color - RGBA 颜色（xyz=RGB，w=透明度）
// 用法示例：color.rgb *= 0.5; // 变暗
void modifySplatColor(vec3 center, inout vec4 color) {
  #ifdef CUSTOM_MODIFY_COLOR
    modifyColor(center, color);
  #endif
  // 默认不修改
}
#endif

#ifndef CUSTOM_MODIFY_CENTER
void modifyCenter(inout vec3 center) {
  modifySplatCenter(center);
}
#endif

#ifndef CUSTOM_MODIFY_COVARIANCE
void modifyCovariance(vec3 originalCenter, vec3 modifiedCenter, inout vec3 covA, inout vec3 covB) {
  modifySplatCovariance(originalCenter, modifiedCenter, covA, covB);
}
#endif

#ifndef CUSTOM_MODIFY_COLOR
void modifyColor(vec3 center, inout vec4 color) {
  modifySplatColor(center, color);
}
#endif
`;
export { gsplatCustomize_glsl_rslib_entry_ as default };
