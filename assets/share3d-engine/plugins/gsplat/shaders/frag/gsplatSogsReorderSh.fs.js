const gsplatSogsReorderSh_fs_rslib_entry_ = `/**
 * SOGS SH 数据重排着色器
 * 将 sh_centroids 纹理打包为紧凑的 packedShN (RGBA8)
 *
 * 参考 PlayCanvas gsplatSogsReorderSh.js
 *
 * 输入纹理:
 * - sh_centroids: RGBA8 (SH 高阶系数调色板)
 *
 * 输出:
 * - fragColor: vec4 (RGBA8)
 *
 * 打包格式:
 * 使用 pack111110 将 RGB 三个通道打包为 11-11-10 bits，
 * 然后解包回 RGBA8 格式存储
 */

precision highp float;
precision highp int;
precision highp sampler2D;

#include "gsplatPacking"

uniform highp sampler2D sh_centroids;

#ifdef REORDER_V1
    // V1 格式：直接打包采样值
#else
    // V2 格式：使用 codebook 查找
    uniform vec4 shN_codebook[64];
#endif

out vec4 fragColor;

void main() {
    ivec2 uv = ivec2(gl_FragCoord.xy);

    // 采样 SH centroids
    vec3 shNSample = texelFetch(sh_centroids, uv, 0).xyz;

    // 打包为 11-11-10 bits，然后解包为 RGBA8
    #ifdef REORDER_V1
        fragColor = unpack8888(pack111110(shNSample));
    #else
        fragColor = unpack8888(pack111110(resolveCodebook(shNSample, shN_codebook)));
    #endif
}
`;
export { gsplatSogsReorderSh_fs_rslib_entry_ as default };
