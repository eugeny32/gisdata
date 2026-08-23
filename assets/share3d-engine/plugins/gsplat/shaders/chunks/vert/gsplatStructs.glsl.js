const gsplatStructs_glsl_rslib_entry_ = `// ============================================================
// GSplat Structs - 结构体定义
// 对标 PlayCanvas gsplatStructs.js
// ============================================================

// 存储 splat 源数据和渲染顺序
struct SplatSource {
  uint order;         // 渲染顺序（gl_InstanceID）
  uint id;            // splat ID（从排序纹理读取）
  ivec2 uv;           // 数据纹理坐标
  vec2 cornerUV;      // 角落坐标 (-1,-1)..(1,1)
};

// 存储高斯中心的相机和裁剪空间位置
struct SplatCenter {
  vec3 view;                   // 视图空间中心
  vec4 proj;                   // 裁剪空间中心
  float projMat00;             // 投影矩阵 [0][0]
  mat4 modelView;              // 模型视图矩阵
  vec3 modelCenterOriginal;    // 修改前的模型中心
  vec3 modelCenterModified;    // 修改后的模型中心
};

// 存储当前高斯的角落偏移
struct SplatCorner {
  vec2 offset;        // 裁剪空间中心偏移
  vec2 uv;            // 角落 UV
  #ifdef GSPLAT_AA
    float aaFactor;   // 抗锯齿补偿因子
  #endif
  vec2 v;             // 预留
  float dlen;         // 预留
};
`;
export { gsplatStructs_glsl_rslib_entry_ as default };
