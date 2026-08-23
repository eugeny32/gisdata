const gsplatSogsCenters_fs_rslib_entry_ = `/**
 * SOGS 中心点计算着色器
 * 从压缩的 means_l 和 means_u 纹理解压出中心点坐标
 *
 * 参考 PlayCanvas gsplatSogsCenters.js
 *
 * 输入纹理:
 * - means_l: RGBA8 (低 8 位)
 * - means_u: RGBA8 (高 8 位)
 *
 * 输出:
 * - fragColor: vec4(center.xyz, 1.0)
 */

precision highp float;
precision highp int;
precision highp sampler2D;

#include "gsplatPacking"

uniform highp sampler2D means_l;
uniform highp sampler2D means_u;

uniform highp uint numSplats;
uniform highp vec3 means_mins;
uniform highp vec3 means_maxs;

out vec4 fragColor;

void main() {
    // 获取纹理尺寸和当前像素坐标
    int w = textureSize(means_l, 0).x;
    ivec2 uv = ivec2(gl_FragCoord.xy);

    // 超出 splat 数量的像素丢弃
    if (uint(uv.x + uv.y * w) >= numSplats) {
        discard;
    }

    // 采样低 8 位和高 8 位
    vec3 l = texelFetch(means_l, uv, 0).xyz;
    vec3 u = texelFetch(means_u, uv, 0).xyz;

    // 合并为 16-bit 值 [0-65535]
    // n = (high * 256 + low) / 65535 → [0-1]
    vec3 n = (l + u * 256.0) / 257.0;

    // 反量化到原始范围
    vec3 v = mix(means_mins, means_maxs, n);

    // 指数反变换（SOGS 压缩使用的编码）
    // 原始位置 = sign(v) * (exp(|v|) - 1)
    vec3 center = sign(v) * (exp(abs(v)) - 1.0);

    // 输出到 RGBA32F RenderTarget
    fragColor = vec4(center, 1.0);
}
`;
export { gsplatSogsCenters_fs_rslib_entry_ as default };
