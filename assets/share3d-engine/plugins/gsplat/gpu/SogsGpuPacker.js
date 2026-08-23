import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
const SH_C0 = 0.28209479177387814;
function float2Half(value) {
    const floatView = new Float32Array(1);
    const int32View = new Int32Array(floatView.buffer);
    floatView[0] = value;
    const x = int32View[0];
    let bits = x >> 16 & 0x8000;
    let m = x >> 12 & 0x07ff;
    const e = x >> 23 & 0xff;
    if (e < 103) return bits;
    if (e > 142) {
        bits |= 0x7c00;
        bits |= (255 === e ? 0 : 1) && 0x007fffff & x;
        return bits;
    }
    if (e < 113) {
        m |= 0x0800;
        bits |= (m >> 114 - e) + (m >> 113 - e & 1);
        return bits;
    }
    bits |= e - 112 << 10 | m >> 1;
    bits += 1 & m;
    return bits;
}
class SogsGpuPacker {
    constructor(_renderer){}
    packGpuMemory(sogsData) {
        if (!sogsData.meansLow || !sogsData.meansHigh || !sogsData.quats || !sogsData.scales || !sogsData.sh0) throw new Error('[SogsGpuPacker] SOGS 数据不可用（可能处于 minimalMemory 模式）');
        const width = sogsData.textureWidth;
        const height = sogsData.textureHeight;
        return this.packCPU(sogsData, width, height);
    }
    packCPU(sogsData, width, height) {
        const numSplats = sogsData.numSplats;
        const size = width * height;
        const dataA = new Uint32Array(4 * size);
        const dataAFloat = new Float32Array(dataA.buffer);
        const dataB = new Uint16Array(4 * size);
        const colorData = new Uint16Array(4 * size);
        const meansLow = sogsData.meansLow;
        const meansHigh = sogsData.meansHigh;
        const quats = sogsData.quats;
        const scales = sogsData.scales;
        const sh0 = sogsData.sh0;
        const meta = sogsData.meta;
        for(let i = 0; i < numSplats; i++){
            const pixelOffset = 4 * i;
            const outOffset = 4 * i;
            const lowR = meansLow[pixelOffset];
            const lowG = meansLow[pixelOffset + 1];
            const lowB = meansLow[pixelOffset + 2];
            const highR = meansHigh[pixelOffset];
            const highG = meansHigh[pixelOffset + 1];
            const highB = meansHigh[pixelOffset + 2];
            const px16 = (highR << 8 | lowR) / 65535;
            const py16 = (highG << 8 | lowG) / 65535;
            const pz16 = (highB << 8 | lowB) / 65535;
            const nx = this.lerp(meta.means.mins[0], meta.means.maxs[0], px16);
            const ny = this.lerp(meta.means.mins[1], meta.means.maxs[1], py16);
            const nz = this.lerp(meta.means.mins[2], meta.means.maxs[2], pz16);
            const x = Math.sign(nx) * (Math.exp(Math.abs(nx)) - 1);
            const y = Math.sign(ny) * (Math.exp(Math.abs(ny)) - 1);
            const z = Math.sign(nz) * (Math.exp(Math.abs(nz)) - 1);
            const norm = Math.SQRT2;
            const a = (quats[pixelOffset] / 255 - 0.5) * norm;
            const b = (quats[pixelOffset + 1] / 255 - 0.5) * norm;
            const c = (quats[pixelOffset + 2] / 255 - 0.5) * norm;
            const d = Math.sqrt(Math.max(0, 1 - (a * a + b * b + c * c)));
            const mode = quats[pixelOffset + 3] - 252;
            let qx, qy, qz, qw;
            switch(mode){
                case 0:
                    qx = a;
                    qy = b;
                    qz = c;
                    qw = d;
                    break;
                case 1:
                    qx = d;
                    qy = b;
                    qz = c;
                    qw = a;
                    break;
                case 2:
                    qx = b;
                    qy = d;
                    qz = c;
                    qw = a;
                    break;
                default:
                    qx = b;
                    qy = c;
                    qz = d;
                    qw = a;
                    break;
            }
            if (qw < 0) {
                qx = -qx;
                qy = -qy;
                qz = -qz;
                qw = -qw;
            }
            let scale_0, scale_1, scale_2;
            if (2 === meta.version && meta.scales.codebook) {
                const codebook = meta.scales.codebook;
                scale_0 = codebook[scales[pixelOffset]] ?? -10;
                scale_1 = codebook[scales[pixelOffset + 1]] ?? -10;
                scale_2 = codebook[scales[pixelOffset + 2]] ?? -10;
            } else if (meta.scales.mins && meta.scales.maxs) {
                scale_0 = this.lerp(meta.scales.mins[0], meta.scales.maxs[0], scales[pixelOffset] / 255);
                scale_1 = this.lerp(meta.scales.mins[1], meta.scales.maxs[1], scales[pixelOffset + 1] / 255);
                scale_2 = this.lerp(meta.scales.mins[2], meta.scales.maxs[2], scales[pixelOffset + 2] / 255);
            } else scale_0 = scale_1 = scale_2 = -10;
            let colorR, colorG, colorB, alpha;
            if (2 === meta.version && meta.sh0.codebook) {
                const codebook = meta.sh0.codebook;
                const idx0 = sh0[pixelOffset];
                const idx1 = sh0[pixelOffset + 1];
                const idx2 = sh0[pixelOffset + 2];
                sh0[pixelOffset + 3];
                const f_dc_0 = codebook[idx0] ?? 0;
                const f_dc_1 = codebook[idx1] ?? 0;
                const f_dc_2 = codebook[idx2] ?? 0;
                colorR = Math.max(0, Math.min(1, 0.5 + f_dc_0 * SH_C0));
                colorG = Math.max(0, Math.min(1, 0.5 + f_dc_1 * SH_C0));
                colorB = Math.max(0, Math.min(1, 0.5 + f_dc_2 * SH_C0));
                alpha = sh0[pixelOffset + 3] / 255;
            } else if (meta.sh0.mins && meta.sh0.maxs) {
                const f_dc_0 = this.lerp(meta.sh0.mins[0], meta.sh0.maxs[0], sh0[pixelOffset] / 255);
                const f_dc_1 = this.lerp(meta.sh0.mins[1], meta.sh0.maxs[1], sh0[pixelOffset + 1] / 255);
                const f_dc_2 = this.lerp(meta.sh0.mins[2], meta.sh0.maxs[2], sh0[pixelOffset + 2] / 255);
                const a = this.lerp(meta.sh0.mins[3], meta.sh0.maxs[3], sh0[pixelOffset + 3] / 255);
                colorR = Math.max(0, Math.min(1, 0.5 + f_dc_0 * SH_C0));
                colorG = Math.max(0, Math.min(1, 0.5 + f_dc_1 * SH_C0));
                colorB = Math.max(0, Math.min(1, 0.5 + f_dc_2 * SH_C0));
                alpha = 1.0 / (1.0 + Math.exp(-a));
            } else {
                colorR = colorG = colorB = 0.5;
                alpha = 1.0;
            }
            dataAFloat[outOffset + 0] = x;
            dataAFloat[outOffset + 1] = y;
            dataAFloat[outOffset + 2] = z;
            dataA[outOffset + 3] = float2Half(qx) | float2Half(qy) << 16;
            dataB[outOffset + 0] = float2Half(Math.exp(scale_0));
            dataB[outOffset + 1] = float2Half(Math.exp(scale_1));
            dataB[outOffset + 2] = float2Half(Math.exp(scale_2));
            dataB[outOffset + 3] = float2Half(qz);
            colorData[outOffset + 0] = float2Half(colorR);
            colorData[outOffset + 1] = float2Half(colorG);
            colorData[outOffset + 2] = float2Half(colorB);
            colorData[outOffset + 3] = float2Half(alpha);
        }
        const dataTextureA = new __WEBPACK_EXTERNAL_MODULE_three__.DataTexture(dataA, width, height, __WEBPACK_EXTERNAL_MODULE_three__.RGBAIntegerFormat, __WEBPACK_EXTERNAL_MODULE_three__.UnsignedIntType);
        dataTextureA.internalFormat = 'RGBA32UI';
        dataTextureA.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        dataTextureA.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        dataTextureA.wrapS = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
        dataTextureA.wrapT = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
        dataTextureA.needsUpdate = true;
        const dataTextureB = new __WEBPACK_EXTERNAL_MODULE_three__.DataTexture(dataB, width, height, __WEBPACK_EXTERNAL_MODULE_three__.RGBAFormat, __WEBPACK_EXTERNAL_MODULE_three__.HalfFloatType);
        dataTextureB.internalFormat = 'RGBA16F';
        dataTextureB.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        dataTextureB.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        dataTextureB.wrapS = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
        dataTextureB.wrapT = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
        dataTextureB.needsUpdate = true;
        const colorTexture = new __WEBPACK_EXTERNAL_MODULE_three__.DataTexture(colorData, width, height, __WEBPACK_EXTERNAL_MODULE_three__.RGBAFormat, __WEBPACK_EXTERNAL_MODULE_three__.HalfFloatType);
        colorTexture.internalFormat = 'RGBA16F';
        colorTexture.colorSpace = __WEBPACK_EXTERNAL_MODULE_three__.LinearSRGBColorSpace;
        colorTexture.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        colorTexture.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        colorTexture.wrapS = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
        colorTexture.wrapT = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
        colorTexture.needsUpdate = true;
        return {
            dataTextureA,
            dataTextureB,
            colorTexture,
            width,
            height
        };
    }
    lerp(a, b, t) {
        return a * (1 - t) + b * t;
    }
    dispose() {}
}
export { SogsGpuPacker };
