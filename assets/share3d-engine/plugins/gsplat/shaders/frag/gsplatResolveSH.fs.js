const gsplatResolveSH_fs_rslib_entry_ = `/**
 * SH 解析 Shader
 *
 * 为给定的视角方向预计算 SH 球谐函数值
 * 结果存储在 64x1024 的 RGBA8 纹理中（11+11+10 位打包）
 *
 * 参考 PlayCanvas gsplat-resolve-sh.js
 */

precision highp float;
precision highp int;
precision highp sampler2D;

// SH 系数数量、常量和评估函数（复用共享 chunk）
#include "gsplatSHCoeffsVS"
#include "gsplatEvalSHArrayVS"

// ==================== 打包函数 ====================

// 将归一化的 3 分量值转换为 (11, 11, 10) 位范围，然后打包为 RGBA8
vec4 packRgb(vec3 v) {
  uvec3 vb = uvec3(clamp(v, vec3(0.0), vec3(1.0)) * vec3(2047.0, 2047.0, 1023.0));
  uint bits = (vb.x << 21u) | (vb.y << 10u) | vb.z;
  return vec4((uvec4(bits) >> uvec4(24u, 16u, 8u, 0u)) & uvec4(0xffu)) / vec4(255.0);
}

// ==================== Uniforms ====================

uniform vec3 dir;             // 归一化的视角方向（模型空间）
uniform sampler2D centroids;  // SH centroids 纹理
uniform float shN_mins;       // SH 系数最小值
uniform float shN_maxs;       // SH 系数最大值

// ==================== 输出 ====================

out vec4 fragColor;

void main(void) {
  #if SH_BANDS > 0
    ivec2 uv = ivec2(gl_FragCoord.xy) * ivec2(SH_COEFFS, 1);
    vec3 coefficients[SH_COEFFS];

    // 读取系数
    for (int i = 0; i < SH_COEFFS; i++) {
      vec3 s = texelFetch(centroids, ivec2(uv.x + i, uv.y), 0).xyz;
      coefficients[i] = mix(vec3(shN_mins), vec3(shN_maxs), s);
    }

    // 评估并打包
    fragColor = packRgb(evalSHArray(coefficients, dir) * 0.25 + 0.5);
  #else
    fragColor = vec4(0.5, 0.5, 0.5, 1.0);
  #endif
}
`;
export { gsplatResolveSH_fs_rslib_entry_ as default };
