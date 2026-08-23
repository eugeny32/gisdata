const gsplatSogsSH_glsl_rslib_entry_ = `// ============================================================
// GSplat SOGS SH - SOGS 格式球谐系数读取
// 对标 PlayCanvas gsplatSogsSH.js
// ============================================================

#if defined(GSPLAT_SOGS_DATA) && defined(SH_BANDS) && SH_BANDS > 0

// SOGS SH 纹理（从 SOG 文件加载）
uniform highp sampler2D packedShN;  // SH 系数调色板纹理（SH_COEFFS*64 x N, RGBA8）
uniform sampler2D sogsSH_labels;    // SH 标签纹理（splat -> palette index, RG8）

// SH 归一化范围
uniform float sogsSHN_mins;
uniform float sogsSHN_maxs;

// SH 系数数量
#include "gsplatSHCoeffsVS"

/**
 * 从 SOGS 格式读取 SH 数据
 * 参考 PlayCanvas gsplatSogsSH.js
 *
 * 数据流：
 * 1. sogsSH_labels 纹理存储每个 splat 的调色板索引（16-bit, RG 通道）
 * 2. packedShN 纹理存储调色板条目（每行 64 个条目，每条目 SH_COEFFS 个纹素）
 * 3. 每个纹素使用 11+11+10 位打包 3 个 SH 系数分量
 */
void readSHData(in SplatSource source, out vec3 sh[SH_COEFFS], out float scale) {
  // 1. 从 sogsSH_labels 提取调色板索引
  vec4 labelSample = texelFetch(sogsSH_labels, source.uv, 0);

  // 解码 16-bit 索引（存储在 RG 通道，每个 8 位）
  ivec2 t = ivec2(labelSample.rg * 255.0);
  int n = t.x + t.y * 256;

  // 2. 计算调色板在 packedShN 中的位置
  // 布局：每行 64 个调色板条目，每条目占 SH_COEFFS 个纹素
  int u = (n % 64) * SH_COEFFS;
  int v = n / 64;

  // 3. 读取并解码 SH 系数
  for (int i = 0; i < SH_COEFFS; i++) {
    // 读取打包的 RGBA8 数据
    vec4 packed = texelFetch(packedShN, ivec2(u + i, v), 0);

    // pack8888: 将 RGBA [0-1] 打包成 uint32
    uvec4 bytes = uvec4(packed * 255.0) << uvec4(24u, 16u, 8u, 0u);
    uint bits = bytes.x | bytes.y | bytes.z | bytes.w;

    // unpack111110: 解包成 11-11-10 位的归一化 vec3
    vec3 normalized = vec3(
      (uvec3(bits) >> uvec3(21u, 10u, 0u)) & uvec3(0x7ffu, 0x7ffu, 0x3ffu)
    ) / vec3(2047.0, 2047.0, 1023.0);

    // 反归一化到实际 SH 值
    sh[i] = mix(vec3(sogsSHN_mins), vec3(sogsSHN_maxs), normalized);
  }

  scale = 1.0;
}

#endif // GSPLAT_SOGS_DATA && SH_BANDS > 0
`;
export { gsplatSogsSH_glsl_rslib_entry_ as default };
