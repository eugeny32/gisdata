const gsplatSogsReorderMRT_fs_rslib_entry_ = `/**
 * SOGS GPU 打包 MRT Shader
 *
 * 将 SOGS 源纹理打包为紧凑的 GPU 格式
 * 参考 PlayCanvas gsplatSogsReorder.js
 *
 * 输出 (MRT):
 * - gPackedData (RGBA32UI): 打包的位置、四元数、缩放、SH labels
 * - gColor (RGBA8): 打包的 SH0 颜色
 *
 * 打包格式:
 * gPackedData.x = pack8888(meansLow.xyz, shLabels.x)
 * gPackedData.y = pack8888(meansHigh.xyz, shLabels.y)
 * gPackedData.z = pack8888(quats.xyz, alpha)
 * gPackedData.w = (pack101010(scales) << 2) | quatMode
 *
 * gColor = unpack8888(pack111110(sh0.xyz))
 */

precision highp float;
precision highp int;
precision highp sampler2D;

// 共享打包与量化辅助
#include "gsplatPacking"
#include "gsplatSogsReorderCommonPS"

// ==================== Uniforms ====================

// SOGS 源纹理
uniform highp sampler2D means_l;
uniform highp sampler2D means_u;
uniform highp sampler2D quats;
uniform highp sampler2D scales;
uniform highp sampler2D sh0;
uniform highp sampler2D sh_labels;

uniform highp uint numSplats;

// V1 格式: Min-Max 线性插值
#ifdef REORDER_V1
uniform vec3 scalesMins;
uniform vec3 scalesMaxs;
uniform vec4 sh0Mins;
uniform vec4 sh0Maxs;
#else
// V2 格式: Codebook 量化
uniform vec4 scales_codebook[64];
uniform vec4 sh0_codebook[64];
#endif

// ==================== 输出 ====================

layout(location = 0) out uvec4 gPackedData;  // RGBA32UI
layout(location = 1) out vec4 gColor;         // RGBA8

void main(void) {
    int w = int(textureSize(means_l, 0).x);
    ivec2 uv = ivec2(gl_FragCoord.xy);

    // 超出范围的 splat 丢弃
    if (uint(uv.x + uv.y * w) >= numSplats) {
        discard;
    }

    // 读取源纹理数据
    vec3 meansLSample   = texelFetch(means_l, uv, 0).xyz;
    vec3 meansUSample   = texelFetch(means_u, uv, 0).xyz;
    vec4 quatsSample    = texelFetch(quats, uv, 0);
    vec3 scalesSample   = texelFetch(scales, uv, 0).xyz;
    vec4 sh0Sample      = texelFetch(sh0, uv, 0);
    vec2 shLabelsSample = texelFetch(sh_labels, uv, 0).xy;

    // 解析数据
    uint scale;
    uint sh0Packed;
    float alpha;

    #ifdef REORDER_V1
        // V1: Min-Max 线性插值
        scale = pack101010(resolve(scalesMins, scalesMaxs, scalesSample));
        sh0Packed = pack111110(resolve(sh0Mins.xyz, sh0Maxs.xyz, sh0Sample.xyz));
        alpha = sigmoid(mix(sh0Mins.w, sh0Maxs.w, sh0Sample.w));
    #else
        // V2: Codebook 量化
        scale = pack101010(resolveCodebook(scalesSample, scales_codebook));
        sh0Packed = pack111110(resolveCodebook(sh0Sample.xyz, sh0_codebook));
        alpha = sh0Sample.w;
    #endif

    // 提取四元数模式 (252-255 → 0-3)
    uint qmode = uint(quatsSample.w * 255.0) - 252u;

    // 打包输出到 RGBA32UI
    gPackedData = uvec4(
        pack8888(vec4(meansLSample, shLabelsSample.x)),
        pack8888(vec4(meansUSample, shLabelsSample.y)),
        pack8888(vec4(quatsSample.xyz, alpha)),
        (scale << 2u) | qmode
    );

    // 打包 SH0 颜色到 RGBA8
    gColor = unpack8888(sh0Packed);
}
`;
export { gsplatSogsReorderMRT_fs_rslib_entry_ as default };
