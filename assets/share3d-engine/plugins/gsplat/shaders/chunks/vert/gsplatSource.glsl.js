const gsplatSource_glsl_rslib_entry_ = `// ============================================================
// GSplat Source - 数据源初始化
// 对标 PlayCanvas gsplatSource.js
// ============================================================

// Uniforms
uniform float numSplats;
uniform int dataWidth;
uniform int orderWidth;
uniform highp usampler2D splatOrder;

#ifndef GSPLAT_INSTANCE_SIZE
#define GSPLAT_INSTANCE_SIZE 128
#endif

// 初始化 splat 源
// 返回 false 表示该 splat 应被丢弃
bool initSource(out SplatSource source) {
  uint perQuadOffset = uint(position.z + 0.5);
  source.order = uint(gl_InstanceID) * uint(GSPLAT_INSTANCE_SIZE) + perQuadOffset;

  // 超出范围检查
  if (source.order >= uint(numSplats)) {
    return false;
  }

  // 从排序纹理获取原始 splat ID
  ivec2 orderUV = ivec2(int(source.order) % orderWidth, int(source.order) / orderWidth);
  source.id = texelFetch(splatOrder, orderUV, 0).r;

  // 计算数据纹理坐标
  source.uv = ivec2(int(source.id) % dataWidth, int(source.id) / dataWidth);

  // 角落 UV
  source.cornerUV = uv;

  return true;
}
`;
export { gsplatSource_glsl_rslib_entry_ as default };
