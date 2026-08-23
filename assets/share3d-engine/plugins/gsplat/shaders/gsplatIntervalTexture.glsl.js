const vertexShader = `
precision highp float;

// position 和 uv 由 Three.js 自动注入
// projectionMatrix 和 modelViewMatrix 也由 Three.js 自动注入

out vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
const fragmentShader = `
precision highp float;
precision highp int;
precision highp usampler2D;

// RG32U: (start, accumulatedSum)
uniform usampler2D uIntervalsTexture;
uniform int uNumIntervals;
uniform int uTextureWidth;
uniform int uActiveSplats;

// 输出到 R32U 纹理
// WebGL2 要求输出 4 分量向量，即使纹理只使用 R 通道
layout(location = 0) out uvec4 fragColor;

ivec2 getCoordFromIndex(int index, int textureWidth) {
  return ivec2(index % textureWidth, index / textureWidth);
}

void main() {
  ivec2 coord = ivec2(gl_FragCoord.xy);
  int targetIndex = coord.y * uTextureWidth + coord.x;

  // 超出范围的像素输出 0
  if (targetIndex >= uActiveSplats) {
    fragColor = uvec4(0u);
    return;
  }

  // 动态获取区间纹理宽度（与 PlayCanvas 官方实现一致）
  int intervalsTextureWidth = textureSize(uIntervalsTexture, 0).x;

  // 二分搜索 accumulatedSum 数组 (G channel)
  int left = 0;
  int right = uNumIntervals - 1;
  int intervalIndex = 0;

  while (left <= right) {
    int mid = (left + right) / 2;

    ivec2 intervalCoord = getCoordFromIndex(mid, intervalsTextureWidth);
    uvec2 intervalData = texelFetch(uIntervalsTexture, intervalCoord, 0).rg;

    uint accumulatedSum = intervalData.g;  // G channel

    if (uint(targetIndex) < accumulatedSum) {
      intervalIndex = mid;
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }

  // 获取区间数据 (start 和 accumulatedSum)
  ivec2 intervalCoord = getCoordFromIndex(intervalIndex, intervalsTextureWidth);
  uvec2 intervalData = texelFetch(uIntervalsTexture, intervalCoord, 0).rg;

  uint intervalStart = intervalData.r;      // R channel
  uint currentAccSum = intervalData.g;      // G channel

  // 获取前一个区间的 accumulatedSum
  uint prevAccSum = 0u;
  if (intervalIndex > 0) {
    ivec2 prevCoord = getCoordFromIndex(intervalIndex - 1, intervalsTextureWidth);
    prevAccSum = texelFetch(uIntervalsTexture, prevCoord, 0).g;
  }

  // 计算原始 splat 索引
  uint offsetInInterval = uint(targetIndex) - prevAccSum;
  uint originalIndex = intervalStart + offsetInInterval;

  // 输出为 uvec4，只使用 R 分量
  fragColor = uvec4(originalIndex, 0u, 0u, 0u);
}
`;
const fragmentShaderFloat = `
precision highp float;
precision highp int;
precision highp sampler2D;

// RG32F: (start, accumulatedSum) - 使用浮点数模拟
uniform sampler2D uIntervalsTexture;
uniform int uNumIntervals;
uniform int uTextureWidth;
uniform int uActiveSplats;

in vec2 vUv;
out vec4 fragColor;

ivec2 getCoordFromIndex(int index, int textureWidth) {
  return ivec2(index % textureWidth, index / textureWidth);
}

void main() {
  ivec2 coord = ivec2(gl_FragCoord.xy);
  int targetIndex = coord.y * uTextureWidth + coord.x;

  // 超出范围的像素输出 0
  if (targetIndex >= uActiveSplats) {
    fragColor = vec4(0.0);
    return;
  }

  // 动态获取区间纹理宽度（与 PlayCanvas 官方实现一致）
  int intervalsTextureWidth = textureSize(uIntervalsTexture, 0).x;

  // 二分搜索
  int left = 0;
  int right = uNumIntervals - 1;
  int intervalIndex = 0;

  while (left <= right) {
    int mid = (left + right) / 2;

    ivec2 intervalCoord = getCoordFromIndex(mid, intervalsTextureWidth);
    vec2 intervalData = texelFetch(uIntervalsTexture, intervalCoord, 0).rg;

    float accumulatedSum = intervalData.g;

    if (float(targetIndex) < accumulatedSum) {
      intervalIndex = mid;
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }

  // 获取区间数据
  ivec2 intervalCoord = getCoordFromIndex(intervalIndex, intervalsTextureWidth);
  vec2 intervalData = texelFetch(uIntervalsTexture, intervalCoord, 0).rg;

  float intervalStart = intervalData.r;
  float currentAccSum = intervalData.g;

  // 获取前一个区间的 accumulatedSum
  float prevAccSum = 0.0;
  if (intervalIndex > 0) {
    ivec2 prevCoord = getCoordFromIndex(intervalIndex - 1, intervalsTextureWidth);
    prevAccSum = texelFetch(uIntervalsTexture, prevCoord, 0).g;
  }

  // 计算原始 splat 索引
  float offsetInInterval = float(targetIndex) - prevAccSum;
  float originalIndex = intervalStart + offsetInInterval;

  // 输出为浮点数（后续读取时转换为整数）
  fragColor = vec4(originalIndex, 0.0, 0.0, 1.0);
}
`;
export { fragmentShader, fragmentShaderFloat, vertexShader };
