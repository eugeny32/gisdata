const gsplatCenter_glsl_rslib_entry_ = `// ============================================================
// GSplat Center - 中心投影
// 对标 PlayCanvas gsplatCenter.js
// 使用 RTE (Relative-To-Eye) 技术解决大坐标精度问题
// ============================================================

// Uniforms
uniform vec4 viewport_size;   // [width, height, 1/width, 1/height]
uniform vec4 camera_params;   // [1/far, far, near, isOrtho]

// RTE：相机世界位置（高低位分解，提高精度）
// high = float32(cameraPos), low = cameraPos - high
uniform vec3 cameraPositionHigh;
uniform vec3 cameraPositionLow;

// RTE：sceneOrigin 到相机的向量（CPU 预计算双精度差值，避免大数相减精度跳变）
uniform vec3 originToCameraHigh;
uniform vec3 originToCameraLow;

// 将模型空间高斯中心投影到视图和裁剪空间
// 返回 false 表示该 splat 应被丢弃
// 使用 RTE 技术：先计算相对于相机的位置，避免大坐标精度损失
bool initCenter(vec3 inputCenter, inout SplatCenter center) {
  // RTE 高精度减法：(inputCenter - cameraHigh) - cameraLow
  // 这样可以保留更多精度，因为：
  // 1. inputCenter - cameraHigh：两个相近的大值相减，结果是小值
  // 2. 结果再减去 cameraLow（本身就是小值）
  vec3 relativePos;

  #ifdef GSPLAT_WORKBUFFER_DATA
    // WorkBuffer 模式：inputCenter 为相对 sceneOrigin 的偏移
    // originToCamera 在 CPU 端用双精度预计算，避免 GPU 大数相减精度跳变
    vec3 originToCamera = originToCameraHigh + originToCameraLow;
    relativePos = inputCenter + originToCamera;
  #else
    // 标准模式：输入是模型空间，先转到世界空间
    vec4 worldPos = modelMatrix * vec4(inputCenter, 1.0);
    vec3 t1 = worldPos.xyz - cameraPositionHigh;
    relativePos = t1 - cameraPositionLow;
  #endif

  // RTE 视图变换：使用 w=0 跳过 viewMatrix 的平移部分
  // 因为相对位置已经是以相机为原点，不需要再平移
  vec4 centerView = viewMatrix * vec4(relativePos, 0.0);
  centerView.w = 1.0;

  // 透视相机：z > 0 表示在相机后面，提前剔除
  if (camera_params.w != 1.0 && centerView.z > 0.0) {
    return false;
  }

  vec4 centerProj = projectionMatrix * centerView;

  // 深度裁剪处理：WebGL vs WebGPU 差异
  #ifdef WEBGPU
    // WebGPU: 深度范围是 [0, 1]
    centerProj.z = clamp(centerProj.z, 0.0, abs(centerProj.w));
  #else
    // WebGL: 深度范围是 [-1, 1]
    centerProj.z = clamp(centerProj.z, -abs(centerProj.w), abs(centerProj.w));
  #endif

  center.proj = centerProj;
  center.projMat00 = projectionMatrix[0][0];
  center.view = centerView.xyz;
  center.modelView = viewMatrix;  // RTE 模式下仅用于方向变换

  return true;
}
`;
export { gsplatCenter_glsl_rslib_entry_ as default };
