const centersPoints_glsl_rslib_entry_ = `// ============================================================
// Centers Points - 中心点渲染顶点着色器
// 独立 pass，不复用高斯椭圆渲染路径
// ============================================================

#ifdef USE_HALF_PRECISION
  precision mediump float;
  precision mediump int;
  precision mediump usampler2D;
#else
  precision highp float;
  precision highp int;
  precision highp usampler2D;
#endif

// 数据源 uniforms
uniform float numSplats;
uniform int dataWidth;
uniform int orderWidth;
uniform highp usampler2D splatOrder;

// 中心投影 uniforms
uniform vec4 viewport_size;
uniform vec4 camera_params;
uniform vec3 cameraPositionHigh;
uniform vec3 cameraPositionLow;
uniform vec3 originToCameraHigh;
uniform vec3 originToCameraLow;

// 数据纹理（RGBA32UI：worldCenter.xyz 以 floatBitsToUint 存储）
uniform highp usampler2D transformA;

// 状态纹理
uniform sampler2D splatState;

// 中心点样式
uniform float pointSize;
uniform vec3 selectedColor;
uniform float selectedOpacity;
uniform vec3 unselectedColor;
uniform float unselectedOpacity;

// Varyings
out vec4 vColor;

#ifdef USE_LOGDEPTHBUF
  out float vFragDepth;
  out float vIsPerspective;
#endif

// 丢弃顶点的位置
const vec4 discardVec = vec4(0.0, 0.0, 2.0, 1.0);

// 标量过滤
#ifdef HAS_SCALAR_FILTER
  uniform sampler2D splatScalar;
  uniform bool scalarFilterEnabled;
  uniform vec2 scalarFilterRange;

  /** 检查 splat 是否通过标量过滤 */
  bool passScalarFilter(ivec2 uv) {
    float scalar = texelFetch(splatScalar, uv, 0).r;
    return scalar >= scalarFilterRange.x && scalar <= scalarFilterRange.y;
  }
#endif

void main() {
  uint order = uint(gl_VertexID);

  // 超出范围检查
  if (order >= uint(numSplats)) {
    gl_Position = discardVec;
    return;
  }

  // 从排序纹理获取原始 splat ID
  ivec2 orderUV = ivec2(int(order) % orderWidth, int(order) / orderWidth);
  uint id = texelFetch(splatOrder, orderUV, 0).r;

  // 计算数据纹理坐标
  ivec2 dataUV = ivec2(int(id) % dataWidth, int(id) / dataWidth);

  // 读取状态
  int splatStateValue = int(texelFetch(splatState, dataUV, 0).r * 255.0);
  // 丢弃锁定或删除的点（bit 1 = LOCKED, bit 2 = DELETED）
  if ((splatStateValue & 6) != 0) {
    gl_Position = discardVec;
    return;
  }

  // 标量过滤：在读取中心前前置过滤
  #ifdef HAS_SCALAR_FILTER
  if (scalarFilterEnabled) {
    if (!passScalarFilter(dataUV)) {
      gl_Position = discardVec;
      return;
    }
  }
  #endif

  // 读取中心位置（从 transformA 纹理，RGBA32UI 格式）
  uvec4 tA = texelFetch(transformA, dataUV, 0);
  vec3 inputCenter = uintBitsToFloat(tA.xyz);

  // RTE：计算相对于相机的位置
  vec3 originToCamera = originToCameraHigh + originToCameraLow;
  vec3 relativePos = inputCenter + originToCamera;

  // RTE 视图变换
  vec4 centerView = viewMatrix * vec4(relativePos, 0.0);
  centerView.w = 1.0;

  // 透视相机：z > 0 表示在相机后面
  if (camera_params.w != 1.0 && centerView.z > 0.0) {
    gl_Position = discardVec;
    return;
  }

  vec4 centerProj = projectionMatrix * centerView;

  // 深度裁剪
  centerProj.z = clamp(centerProj.z, -abs(centerProj.w), abs(centerProj.w));

  gl_Position = centerProj;
  gl_PointSize = pointSize;

  // 根据选中状态设置颜色（bit 0 = SELECTED）
  bool isSelected = (splatStateValue & 1) != 0;
  if (isSelected) {
    vColor = vec4(selectedColor, selectedOpacity);
  } else {
    vColor = vec4(unselectedColor, unselectedOpacity);
  }

  #ifdef USE_LOGDEPTHBUF
    vFragDepth = 1.0 + gl_Position.w;
    vIsPerspective = float(projectionMatrix[2][3] == -1.0);
  #endif
}
`;
export { centersPoints_glsl_rslib_entry_ as default };
