const gsplatPacking_glsl_rslib_entry_ = `/**
 * SOGS 数据打包/解包工具函数
 * 参考 PlayCanvas gsplatPacking.js
 */

// ==================== 打包函数 ====================

/**
 * 打包 4 个 uint8 值到 uint32
 * v.xyzw → [0-255] → uint32
 */
uint pack8888(vec4 v) {
    uvec4 t = uvec4(v * 255.0) << uvec4(24u, 16u, 8u, 0u);
    return t.x | t.y | t.z | t.w;
}

/**
 * 打包 3 个 10-bit 值到 uint32
 * v.xyz → [0-1023] → uint32 (30 bits)
 */
uint pack101010(vec3 v) {
    uvec3 t = uvec3(v * 1023.0) << uvec3(20u, 10u, 0u);
    return t.x | t.y | t.z;
}

/**
 * 打包 3 个值到 uint32: 11-bit, 11-bit, 10-bit
 * v.xy → [0-2047], v.z → [0-1023] → uint32 (32 bits)
 */
uint pack111110(vec3 v) {
    uvec3 t = uvec3(v * vec3(2047.0, 2047.0, 1023.0)) << uvec3(21u, 10u, 0u);
    return t.x | t.y | t.z;
}

// ==================== 解包函数 ====================

/**
 * 解包 uint32 到 4 个 uint8 值
 * uint32 → [0-255] → v.xyzw
 */
vec4 unpack8888(uint v) {
    return vec4((uvec4(v) >> uvec4(24u, 16u, 8u, 0u)) & 0xffu) / 255.0;
}

/**
 * 解包 uint32 到 3 个 10-bit 值
 * uint32 → [0-1023] → v.xyz
 */
vec3 unpack101010(uint v) {
    return vec3((uvec3(v) >> uvec3(20u, 10u, 0u)) & 0x3ffu) / 1023.0;
}

/**
 * 解包 uint32 到 11-11-10 bits
 * uint32 → v.xy [0-2047], v.z [0-1023]
 */
vec3 unpack111110(uint v) {
    return vec3(
        (uvec3(v) >> uvec3(21u, 10u, 0u)) & uvec3(0x7ffu, 0x7ffu, 0x3ffu)
    ) / vec3(2047.0, 2047.0, 1023.0);
}

// ==================== Codebook 查找 ====================

/**
 * 使用 codebook 解析采样值
 * s: 纹理采样值 [0-1]，用作 codebook 索引
 * codebook: 256 个浮点查找表 (packed as vec4[64])
 * 返回: 相对于 codebook min/max 归一化的值 [0-1]
 */
vec3 resolveCodebook(vec3 s, vec4 codebook[64]) {
    // 将 [0-1] 映射到 [0-255] 索引
    uvec3 idx = uvec3(s * 255.0);

    // 从 codebook 查找值（64 个 vec4 = 256 个浮点）
    // 每个 vec4 存储 4 个浮点，索引 / 4 = vec4 索引，索引 % 4 = 分量索引
    vec3 v = vec3(
        codebook[idx.x >> 2u][idx.x & 3u],
        codebook[idx.y >> 2u][idx.y & 3u],
        codebook[idx.z >> 2u][idx.z & 3u]
    );

    // codebook[0].x = min, codebook[63].w = max（假设 codebook 是排序的）
    float minVal = codebook[0].x;
    float maxVal = codebook[63].w;

    return (v - minVal) / (maxVal - minVal);
}
`;
export { gsplatPacking_glsl_rslib_entry_ as default };
