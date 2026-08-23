const gsplatQuatToMat3_glsl_rslib_entry_ = `// ============================================================
// GSplat QuatToMat3 - 四元数转旋转矩阵
// 对标 PlayCanvas gsplatQuatToMat3.js
// ============================================================

// PlayCanvas 实现 - 期望 vec4(w, x, y, z) 格式
mat3 quatToMat3(vec4 R) {
  vec4 R2 = R + R;
  float X = R2.x * R.w;
  vec4 Y  = R2.y * R;
  vec4 Z  = R2.z * R;
  float W = R2.w * R.w;

  return mat3(
    1.0 - Z.z - W,
          Y.z + X,
          Y.w - Z.x,
          Y.z - X,
    1.0 - Y.y - W,
          Z.w + Y.x,
          Y.w + Z.x,
          Z.w - Y.x,
    1.0 - Y.y - Z.z
  );
}

// 从 xyz 重建归一化四元数
// 假设 w >= 0，w = sqrt(1 - x² - y² - z²)
vec4 unpackRotation(vec3 packed) {
  return vec4(packed.xyz, sqrt(max(0.0, 1.0 - dot(packed, packed))));
}
`;
export { gsplatQuatToMat3_glsl_rslib_entry_ as default };
