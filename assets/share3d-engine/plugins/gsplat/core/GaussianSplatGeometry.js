import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__gsplatBatching_js_a3d95a56__ from "./gsplatBatching.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('gsplat:core');
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
class GaussianSplatGeometry extends __WEBPACK_EXTERNAL_MODULE_three__.InstancedBufferGeometry {
    constructor(splatData){
        super(), this.shTextures = [], this.shBands = 0, this.dataWidth = 0, this.dataHeight = 0, this.orderWidth = 0, this.orderHeight = 0, this.visibleSplatCount = 0;
        this.createQuadGeometry();
        this.setVisibleSplatCount(splatData.numSplats);
        this.shBands = splatData.shBands;
        this.createDataTextures(splatData);
        if (this.shBands > 0) this.createSHTextures(splatData);
        this.createOrderTexture(splatData.numSplats);
    }
    createQuadGeometry() {
        (0, __WEBPACK_EXTERNAL_MODULE__gsplatBatching_js_a3d95a56__.setBatchedSplatQuadGeometry)(this);
    }
    setVisibleSplatCount(count) {
        this.visibleSplatCount = Math.max(0, Math.floor(count));
        this.instanceCount = (0, __WEBPACK_EXTERNAL_MODULE__gsplatBatching_js_a3d95a56__.getGSplatBatchInstanceCount)(this.visibleSplatCount);
    }
    evalTextureSize(count) {
        const width = Math.ceil(Math.sqrt(count));
        const height = Math.ceil(count / width);
        return [
            width,
            height
        ];
    }
    createDataTextures(splatData) {
        const numSplats = splatData.numSplats;
        const [width, height] = this.evalTextureSize(numSplats);
        this.dataWidth = width;
        this.dataHeight = height;
        const x = splatData.getProp('x');
        const y = splatData.getProp('y');
        const z = splatData.getProp('z');
        const rot_0 = splatData.getProp('rot_0');
        const rot_1 = splatData.getProp('rot_1');
        const rot_2 = splatData.getProp('rot_2');
        const rot_3 = splatData.getProp('rot_3');
        const scale_0 = splatData.getProp('scale_0');
        const scale_1 = splatData.getProp('scale_1');
        const scale_2 = splatData.getProp('scale_2');
        const f_dc_0 = splatData.getProp('f_dc_0');
        const f_dc_1 = splatData.getProp('f_dc_1');
        const f_dc_2 = splatData.getProp('f_dc_2');
        const opacity = splatData.getProp('opacity');
        if (!x || !y || !z || !rot_0 || !rot_1 || !rot_2 || !rot_3) throw new Error('Missing required properties: position or rotation');
        if (!scale_0 || !scale_1 || !scale_2) throw new Error('Missing required properties: scale');
        if (!f_dc_0 || !f_dc_1 || !f_dc_2 || !opacity) throw new Error('Missing required properties: color or opacity');
        const dataA = new Uint32Array(width * height * 4);
        const dataAFloat = new Float32Array(dataA.buffer);
        for(let i = 0; i < numSplats; i++){
            const offset = 4 * i;
            dataAFloat[offset + 0] = x[i];
            dataAFloat[offset + 1] = y[i];
            dataAFloat[offset + 2] = z[i];
            let qw = rot_0[i];
            const qx = rot_1[i];
            const qy = rot_2[i];
            const qz = rot_3[i];
            const qLen = Math.sqrt(qx * qx + qy * qy + qz * qz + qw * qw);
            let rx = qx / qLen;
            let ry = qy / qLen;
            let rz = qz / qLen;
            qw /= qLen;
            if (qw < 0) {
                rx = -rx;
                ry = -ry;
                rz = -rz;
            }
            dataA[offset + 3] = float2Half(rx) | float2Half(ry) << 16;
        }
        this.dataTextureA = new __WEBPACK_EXTERNAL_MODULE_three__.DataTexture(dataA, width, height, __WEBPACK_EXTERNAL_MODULE_three__.RGBAIntegerFormat, __WEBPACK_EXTERNAL_MODULE_three__.UnsignedIntType);
        this.dataTextureA.internalFormat = 'RGBA32UI';
        this.dataTextureA.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        this.dataTextureA.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        this.dataTextureA.wrapS = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
        this.dataTextureA.wrapT = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
        this.dataTextureA.needsUpdate = true;
        const dataB = new Uint16Array(width * height * 4);
        for(let i = 0; i < numSplats; i++){
            const offset = 4 * i;
            let qw = rot_0[i];
            const qx = rot_1[i];
            const qy = rot_2[i];
            const qz = rot_3[i];
            const qLen = Math.sqrt(qx * qx + qy * qy + qz * qz + qw * qw);
            let rz = qz / qLen;
            qw /= qLen;
            if (qw < 0) rz = -rz;
            dataB[offset + 0] = float2Half(Math.exp(scale_0[i]));
            dataB[offset + 1] = float2Half(Math.exp(scale_1[i]));
            dataB[offset + 2] = float2Half(Math.exp(scale_2[i]));
            dataB[offset + 3] = float2Half(rz);
        }
        this.dataTextureB = new __WEBPACK_EXTERNAL_MODULE_three__.DataTexture(dataB, width, height, __WEBPACK_EXTERNAL_MODULE_three__.RGBAFormat, __WEBPACK_EXTERNAL_MODULE_three__.HalfFloatType);
        this.dataTextureB.internalFormat = 'RGBA16F';
        this.dataTextureB.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        this.dataTextureB.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        this.dataTextureB.wrapS = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
        this.dataTextureB.wrapT = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
        this.dataTextureB.needsUpdate = true;
        const SH_C0 = 0.28209479177387814;
        const colorData = new Uint16Array(width * height * 4);
        for(let i = 0; i < numSplats; i++){
            const offset = 4 * i;
            const r = f_dc_0[i] * SH_C0 + 0.5;
            const g = f_dc_1[i] * SH_C0 + 0.5;
            const b = f_dc_2[i] * SH_C0 + 0.5;
            const alpha = 1.0 / (1.0 + Math.exp(-opacity[i]));
            colorData[offset + 0] = float2Half(r);
            colorData[offset + 1] = float2Half(g);
            colorData[offset + 2] = float2Half(b);
            colorData[offset + 3] = float2Half(alpha);
        }
        this.colorTexture = new __WEBPACK_EXTERNAL_MODULE_three__.DataTexture(colorData, width, height, __WEBPACK_EXTERNAL_MODULE_three__.RGBAFormat, __WEBPACK_EXTERNAL_MODULE_three__.HalfFloatType);
        this.colorTexture.internalFormat = 'RGBA16F';
        this.colorTexture.colorSpace = __WEBPACK_EXTERNAL_MODULE_three__.LinearSRGBColorSpace;
        this.colorTexture.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        this.colorTexture.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        this.colorTexture.wrapS = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
        this.colorTexture.wrapT = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
        this.colorTexture.needsUpdate = true;
    }
    createOrderTexture(count) {
        const [width, height] = this.evalTextureSize(count);
        this.orderWidth = width;
        this.orderHeight = height;
        const orderData = new Uint32Array(width * height);
        for(let i = 0; i < count; i++)orderData[i] = i;
        this.orderTexture = new __WEBPACK_EXTERNAL_MODULE_three__.DataTexture(orderData, width, height, __WEBPACK_EXTERNAL_MODULE_three__.RedIntegerFormat, __WEBPACK_EXTERNAL_MODULE_three__.UnsignedIntType);
        this.orderTexture.internalFormat = 'R32UI';
        this.orderTexture.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        this.orderTexture.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        this.orderTexture.wrapS = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
        this.orderTexture.wrapT = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
        this.orderTexture.needsUpdate = true;
    }
    createSHTextures(splatData) {
        const numSplats = splatData.numSplats;
        const [width, height] = this.evalTextureSize(numSplats);
        const numCoeffsMap = {
            1: 3,
            2: 8,
            3: 15
        };
        const numCoeffs = numCoeffsMap[this.shBands];
        const src = [];
        for(let i = 0; i < 3 * numCoeffs; i++)src.push(splatData.getProp(`f_rest_${i}`));
        const t11 = 2047;
        const t10 = 1023;
        const float32 = new Float32Array(1);
        const uint32 = new Uint32Array(float32.buffer);
        const c = new Array(3 * numCoeffs).fill(0);
        const sh1to3Data = new Uint32Array(width * height * 4);
        const sh4to7Data = this.shBands > 1 ? new Uint32Array(width * height * 4) : null;
        const sh8to11Data = this.shBands > 2 ? new Uint32Array(width * height * 4) : this.shBands > 1 ? new Uint32Array(width * height) : null;
        const sh12to15Data = this.shBands > 2 ? new Uint32Array(width * height * 4) : null;
        for(let i = 0; i < numSplats; i++){
            for(let j = 0; j < numCoeffs; j++){
                c[3 * j + 0] = src[j]?.[i] ?? 0;
                c[3 * j + 1] = src[j + numCoeffs]?.[i] ?? 0;
                c[3 * j + 2] = src[j + 2 * numCoeffs]?.[i] ?? 0;
            }
            let max = Math.abs(c[0]);
            for(let j = 1; j < 3 * numCoeffs; j++)max = Math.max(max, Math.abs(c[j]));
            if (0 !== max) {
                for(let j = 0; j < numCoeffs; j++){
                    c[3 * j + 0] = Math.max(0, Math.min(t11, Math.floor((c[3 * j + 0] / max * 0.5 + 0.5) * t11 + 0.5)));
                    c[3 * j + 1] = Math.max(0, Math.min(t10, Math.floor((c[3 * j + 1] / max * 0.5 + 0.5) * t10 + 0.5)));
                    c[3 * j + 2] = Math.max(0, Math.min(t11, Math.floor((c[3 * j + 2] / max * 0.5 + 0.5) * t11 + 0.5)));
                }
                float32[0] = max;
                sh1to3Data[4 * i + 0] = uint32[0];
                sh1to3Data[4 * i + 1] = c[0] << 21 | c[1] << 11 | c[2];
                sh1to3Data[4 * i + 2] = c[3] << 21 | c[4] << 11 | c[5];
                sh1to3Data[4 * i + 3] = c[6] << 21 | c[7] << 11 | c[8];
                if (this.shBands > 1 && sh4to7Data) {
                    sh4to7Data[4 * i + 0] = c[9] << 21 | c[10] << 11 | c[11];
                    sh4to7Data[4 * i + 1] = c[12] << 21 | c[13] << 11 | c[14];
                    sh4to7Data[4 * i + 2] = c[15] << 21 | c[16] << 11 | c[17];
                    sh4to7Data[4 * i + 3] = c[18] << 21 | c[19] << 11 | c[20];
                    if (this.shBands > 2 && sh8to11Data && sh12to15Data) {
                        sh8to11Data[4 * i + 0] = c[21] << 21 | c[22] << 11 | c[23];
                        sh8to11Data[4 * i + 1] = c[24] << 21 | c[25] << 11 | c[26];
                        sh8to11Data[4 * i + 2] = c[27] << 21 | c[28] << 11 | c[29];
                        sh8to11Data[4 * i + 3] = c[30] << 21 | c[31] << 11 | c[32];
                        sh12to15Data[4 * i + 0] = c[33] << 21 | c[34] << 11 | c[35];
                        sh12to15Data[4 * i + 1] = c[36] << 21 | c[37] << 11 | c[38];
                        sh12to15Data[4 * i + 2] = c[39] << 21 | c[40] << 11 | c[41];
                        sh12to15Data[4 * i + 3] = c[42] << 21 | c[43] << 11 | c[44];
                    } else if (sh8to11Data) sh8to11Data[i] = c[21] << 21 | c[22] << 11 | c[23];
                }
            }
        }
        this.sh1to3Texture = new __WEBPACK_EXTERNAL_MODULE_three__.DataTexture(sh1to3Data, width, height, __WEBPACK_EXTERNAL_MODULE_three__.RGBAIntegerFormat, __WEBPACK_EXTERNAL_MODULE_three__.UnsignedIntType);
        this.sh1to3Texture.internalFormat = 'RGBA32UI';
        this.sh1to3Texture.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        this.sh1to3Texture.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        this.sh1to3Texture.wrapS = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
        this.sh1to3Texture.wrapT = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
        this.sh1to3Texture.needsUpdate = true;
        this.shTextures.push(this.sh1to3Texture);
        if (this.shBands > 1 && sh4to7Data) {
            this.sh4to7Texture = new __WEBPACK_EXTERNAL_MODULE_three__.DataTexture(sh4to7Data, width, height, __WEBPACK_EXTERNAL_MODULE_three__.RGBAIntegerFormat, __WEBPACK_EXTERNAL_MODULE_three__.UnsignedIntType);
            this.sh4to7Texture.internalFormat = 'RGBA32UI';
            this.sh4to7Texture.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
            this.sh4to7Texture.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
            this.sh4to7Texture.wrapS = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
            this.sh4to7Texture.wrapT = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
            this.sh4to7Texture.needsUpdate = true;
            this.shTextures.push(this.sh4to7Texture);
            if (this.shBands > 2 && sh8to11Data && sh12to15Data) {
                this.sh8to11Texture = new __WEBPACK_EXTERNAL_MODULE_three__.DataTexture(sh8to11Data, width, height, __WEBPACK_EXTERNAL_MODULE_three__.RGBAIntegerFormat, __WEBPACK_EXTERNAL_MODULE_three__.UnsignedIntType);
                this.sh8to11Texture.internalFormat = 'RGBA32UI';
                this.sh8to11Texture.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
                this.sh8to11Texture.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
                this.sh8to11Texture.wrapS = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
                this.sh8to11Texture.wrapT = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
                this.sh8to11Texture.needsUpdate = true;
                this.shTextures.push(this.sh8to11Texture);
                this.sh12to15Texture = new __WEBPACK_EXTERNAL_MODULE_three__.DataTexture(sh12to15Data, width, height, __WEBPACK_EXTERNAL_MODULE_three__.RGBAIntegerFormat, __WEBPACK_EXTERNAL_MODULE_three__.UnsignedIntType);
                this.sh12to15Texture.internalFormat = 'RGBA32UI';
                this.sh12to15Texture.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
                this.sh12to15Texture.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
                this.sh12to15Texture.wrapS = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
                this.sh12to15Texture.wrapT = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
                this.sh12to15Texture.needsUpdate = true;
                this.shTextures.push(this.sh12to15Texture);
            } else if (sh8to11Data) {
                this.sh8to11Texture = new __WEBPACK_EXTERNAL_MODULE_three__.DataTexture(sh8to11Data, width, height, __WEBPACK_EXTERNAL_MODULE_three__.RedIntegerFormat, __WEBPACK_EXTERNAL_MODULE_three__.UnsignedIntType);
                this.sh8to11Texture.internalFormat = 'R32UI';
                this.sh8to11Texture.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
                this.sh8to11Texture.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
                this.sh8to11Texture.wrapS = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
                this.sh8to11Texture.wrapT = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
                this.sh8to11Texture.needsUpdate = true;
                this.shTextures.push(this.sh8to11Texture);
            }
        }
    }
    updateOrder(sortedIndices) {
        if (sortedIndices.length !== this.visibleSplatCount) {
            log.error('Sorted indices length mismatch');
            return;
        }
        const data = this.orderTexture.image.data;
        data.set(sortedIndices);
        this.orderTexture.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        this.orderTexture.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        this.orderTexture.wrapS = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
        this.orderTexture.wrapT = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
        this.orderTexture.needsUpdate = true;
    }
    dispose() {
        this.dataTextureA?.dispose();
        this.dataTextureB?.dispose();
        this.colorTexture?.dispose();
        this.orderTexture?.dispose();
        this.sh1to3Texture?.dispose();
        this.sh4to7Texture?.dispose();
        this.sh8to11Texture?.dispose();
        this.sh12to15Texture?.dispose();
        this.shTextures = [];
        super.dispose();
    }
}
export { GaussianSplatGeometry };
