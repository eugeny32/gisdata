const gsplatCorner_glsl_rslib_entry_ = `// ============================================================
// GSplat Corner - 角落计算（协方差变换）
// 对标 PlayCanvas gsplatCorner.js
// ============================================================

// 从协方差计算角落偏移
// 这是 GSplat 渲染的核心算法，将 3D 协方差投影到 2D 屏幕空间
uniform float minPixelSize;

bool initCornerCov(SplatSource source, SplatCenter center, out SplatCorner corner, vec3 covA, vec3 covB) {
  // 构建 3D 协方差矩阵
  // | covA.x  covA.y  covA.z |
  // | covA.y  covB.x  covB.y |
  // | covA.z  covB.y  covB.z |
  mat3 Vrk = mat3(
    covA.x, covA.y, covA.z,
    covA.y, covB.x, covB.y,
    covA.z, covB.y, covB.z
  );

  float focal = viewport_size.x * center.projMat00;

  // 正交相机 vs 透视相机
  vec3 v = camera_params.w == 1.0 ? vec3(0.0, 0.0, 1.0) : center.view.xyz;

  // 计算 Jacobian 矩阵（投影的线性近似）
  float J1 = focal / v.z;
  vec2 J2 = -J1 / v.z * v.xy;
  mat3 J = mat3(
    J1, 0.0, J2.x,
    0.0, J1, J2.y,
    0.0, 0.0, 0.0
  );

  #ifdef GSPLAT_WORKBUFFER_DATA
    // WorkBuffer 模式：协方差已经是世界空间
    // 只需要用 viewMatrix 的旋转部分变换到视图空间
    mat3 W = transpose(mat3(viewMatrix));
  #else
    // 标准模式：协方差是模型空间，需要完整的 modelView 变换
    mat3 W = transpose(mat3(center.modelView));
  #endif

  // 变换协方差到屏幕空间
  mat3 T = W * J;
  mat3 cov = transpose(T) * Vrk * T;

  // AA 补偿计算
  #ifdef GSPLAT_AA
    float detOrig = cov[0][0] * cov[1][1] - cov[0][1] * cov[0][1];
    float detBlur = (cov[0][0] + 0.3) * (cov[1][1] + 0.3) - cov[0][1] * cov[0][1];
    corner.aaFactor = sqrt(max(detOrig / detBlur, 0.0));
  #endif

  // 添加 0.3 像素的模糊以避免锯齿
  float diagonal1 = cov[0][0] + 0.3;
  float offDiagonal = cov[0][1];
  float diagonal2 = cov[1][1] + 0.3;

  // 计算特征值（椭圆主轴长度）
  float mid = 0.5 * (diagonal1 + diagonal2);
  float radius = length(vec2((diagonal1 - diagonal2) / 2.0, offDiagonal));
  float lambda1 = mid + radius;
  float lambda2 = max(mid - radius, 0.1);

  // 使用较小的视口尺寸限制 kernel 大小
  float vmin = min(1024.0, min(viewport_size.x, viewport_size.y));

  float l1 = 2.0 * min(sqrt(2.0 * lambda1), vmin);
  float l2 = 2.0 * min(sqrt(2.0 * lambda2), vmin);

  // 过小的 splat 丢弃（小于 minPixelSize 像素）
  if (max(l1, l2) < minPixelSize) {
    return false;
  }

  vec2 c = center.proj.ww * viewport_size.zw;

  // 视锥体裁剪
  if (any(greaterThan(abs(center.proj.xy) - vec2(max(l1, l2)) * c, center.proj.ww))) {
    return false;
  }

  // 计算椭圆主轴方向
  vec2 diagonalVector = normalize(vec2(offDiagonal, lambda1 - diagonal1));
  vec2 v1 = l1 * diagonalVector;
  vec2 v2 = l2 * vec2(diagonalVector.y, -diagonalVector.x);

  // 计算角落偏移
  corner.offset = (source.cornerUV.x * v1 + source.cornerUV.y * v2) * c;
  corner.uv = source.cornerUV;

  return true;
}

// 完整的角落初始化（包含协方差读取）
bool initCorner(SplatSource source, SplatCenter center, out SplatCorner corner) {
  vec3 covA, covB;
  readCovariance(source, covA, covB);
  modifySplatCovariance(center.modelCenterOriginal, center.modelCenterModified, covA, covB);
  return initCornerCov(source, center, corner, covA, covB);
}

// Alpha 裁剪优化
void clipCorner(inout SplatCorner corner, float alpha) {
  float clip = min(1.0, sqrt(-log(1.0 / (255.0 * alpha))) / 2.0);
  corner.offset *= clip;
  corner.uv *= clip;
}
`;
export { gsplatCorner_glsl_rslib_entry_ as default };
