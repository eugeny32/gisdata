import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
class SHBitPacker {
    static packRgb(r, g, b) {
        const ri = Math.round(2047 * Math.max(0, Math.min(1, r)));
        const gi = Math.round(2047 * Math.max(0, Math.min(1, g)));
        const bi = Math.round(1023 * Math.max(0, Math.min(1, b)));
        return ri << 21 | gi << 10 | bi;
    }
    static unpackRgb(packed) {
        const r = (packed >>> 21 & 0x7ff) / 2047;
        const g = (packed >>> 10 & 0x7ff) / 2047;
        const b = (0x3ff & packed) / 1023;
        return [
            r,
            g,
            b
        ];
    }
    static normalizeSH(value) {
        return 0.25 * value + 0.5;
    }
    static denormalizeSH(normalized) {
        return (normalized - 0.5) * 4.0;
    }
    static packSHArray(coefficients, count) {
        const result = new Uint32Array(count);
        for(let i = 0; i < count; i++){
            const r = SHBitPacker.normalizeSH(coefficients[3 * i + 0]);
            const g = SHBitPacker.normalizeSH(coefficients[3 * i + 1]);
            const b = SHBitPacker.normalizeSH(coefficients[3 * i + 2]);
            result[i] = SHBitPacker.packRgb(r, g, b);
        }
        return result;
    }
    static packedToRGBA8(packed) {
        return [
            packed >>> 24 & 0xff,
            packed >>> 16 & 0xff,
            packed >>> 8 & 0xff,
            0xff & packed
        ];
    }
    static rgba8ToPacked(r, g, b, a) {
        return r << 24 | g << 16 | b << 8 | a;
    }
    static createPackedSHTexture(data, width, height) {
        const packedData = new Uint8Array(width * height * 4);
        for(let i = 0; i < width * height; i++){
            const r = SHBitPacker.normalizeSH(data[4 * i + 0]);
            const g = SHBitPacker.normalizeSH(data[4 * i + 1]);
            const b = SHBitPacker.normalizeSH(data[4 * i + 2]);
            const packed = SHBitPacker.packRgb(r, g, b);
            const [pr, pg, pb, pa] = SHBitPacker.packedToRGBA8(packed);
            packedData[4 * i + 0] = pr;
            packedData[4 * i + 1] = pg;
            packedData[4 * i + 2] = pb;
            packedData[4 * i + 3] = pa;
        }
        const texture = new __WEBPACK_EXTERNAL_MODULE_three__.DataTexture(packedData, width, height, __WEBPACK_EXTERNAL_MODULE_three__.RGBAFormat, __WEBPACK_EXTERNAL_MODULE_three__.UnsignedByteType);
        texture.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        texture.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        texture.wrapS = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
        texture.wrapT = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
        texture.generateMipmaps = false;
        texture.needsUpdate = true;
        return texture;
    }
}
const shBitPackingChunk = `
// 解包 11+11+10 位打包的 RGB 值
vec3 unpackSHRgb(vec4 v) {
  uvec4 uv = uvec4(v * 255.0);
  uint bits = (uv.x << 24u) | (uv.y << 16u) | (uv.z << 8u) | uv.w;
  uvec3 vb = (uvec3(bits) >> uvec3(21u, 10u, 0u)) & uvec3(0x7ffu, 0x7ffu, 0x3ffu);
  return vec3(vb) / vec3(2047.0, 2047.0, 1023.0);
}

// 反归一化 SH 值
vec3 denormalizeSH(vec3 normalized) {
  return (normalized - 0.5) * 4.0;
}

// 从打包纹理读取 SH 系数
vec3 readPackedSH(sampler2D tex, ivec2 uv) {
  vec4 packed = texelFetch(tex, uv, 0);
  return denormalizeSH(unpackSHRgb(packed));
}
`;
export { SHBitPacker, shBitPackingChunk };
