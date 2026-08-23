import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__lod_GSplatResourceBase_js_74b35280__ from "../lod/GSplatResourceBase.js";
class GSplatResource extends __WEBPACK_EXTERNAL_MODULE__lod_GSplatResourceBase_js_74b35280__.GSplatResourceBase {
    constructor(renderer, gsplatData){
        super(renderer, gsplatData), this.loggedConfigureMaterial = false;
        const numSplats = gsplatData.numSplats;
        const size = this.evalTextureSize(numSplats);
        this.colorTexture = this.createColorTexture(size);
        this.transformATexture = this.createTransformATexture(size);
        this.transformBTexture = this.createTransformBTexture(size);
        this.updateColorData(gsplatData);
        this.updateTransformData(gsplatData);
        this.shBands = gsplatData.shBands;
        if (this.shBands > 0) {
            this.sh1to3Texture = this.createSHTexture(size, __WEBPACK_EXTERNAL_MODULE_three__.RGBAIntegerFormat);
            if (this.shBands > 1) {
                this.sh4to7Texture = this.createSHTexture(size, __WEBPACK_EXTERNAL_MODULE_three__.RGBAIntegerFormat);
                if (this.shBands > 2) {
                    this.sh8to11Texture = this.createSHTexture(size, __WEBPACK_EXTERNAL_MODULE_three__.RGBAIntegerFormat);
                    this.sh12to15Texture = this.createSHTexture(size, __WEBPACK_EXTERNAL_MODULE_three__.RGBAIntegerFormat);
                } else this.sh8to11Texture = this.createSHTexture(size, __WEBPACK_EXTERNAL_MODULE_three__.RedIntegerFormat);
            }
            this.updateSHData(gsplatData);
        }
        this._onContextRestored = this.onContextRestored.bind(this);
        renderer.domElement.addEventListener('webglcontextrestored', this._onContextRestored);
    }
    destroy() {
        this.colorTexture?.dispose();
        this.transformATexture?.dispose();
        this.transformBTexture?.dispose();
        this.sh1to3Texture?.dispose();
        this.sh4to7Texture?.dispose();
        this.sh8to11Texture?.dispose();
        this.sh12to15Texture?.dispose();
        super.destroy();
    }
    onContextRestored() {
        const splatData = this.gsplatData;
        this.updateColorData(splatData);
        this.updateTransformData(splatData);
        if (this.shBands > 0) this.updateSHData(splatData);
    }
    configureMaterialDefines(defines) {
        if (this.shBands > 0) defines.set('SH_BANDS', this.shBands.toString());
    }
    configureMaterial(material) {
        const defines = material.defines || {};
        const definesMap = new Map();
        this.configureMaterialDefines(definesMap);
        definesMap.forEach((v, k)=>{
            defines[k] = v;
        });
        material.defines = defines;
        material.uniforms.splatColor.value = this.colorTexture;
        material.uniforms.transformA.value = this.transformATexture;
        material.uniforms.transformB.value = this.transformBTexture;
        if (material.uniforms.splatDataA) material.uniforms.splatDataA.value = this.transformATexture;
        if (material.uniforms.splatDataB) material.uniforms.splatDataB.value = this.transformBTexture;
        if (this.sh1to3Texture) {
            material.uniforms.splatSH_1to3.value = this.sh1to3Texture;
            if (material.uniforms.splatSH0) material.uniforms.splatSH0.value = this.sh1to3Texture;
        }
        if (this.sh4to7Texture) {
            material.uniforms.splatSH_4to7.value = this.sh4to7Texture;
            if (material.uniforms.splatSH1) material.uniforms.splatSH1.value = this.sh4to7Texture;
        }
        if (this.sh8to11Texture) {
            material.uniforms.splatSH_8to11.value = this.sh8to11Texture;
            if (material.uniforms.splatSH2) material.uniforms.splatSH2.value = this.sh8to11Texture;
        }
        if (this.shBands > 0) {
            material.defines = material.defines || {};
            material.defines.SH_BANDS = this.shBands;
        }
        material.needsUpdate = true;
        this.loggedConfigureMaterial = true;
    }
    evalTextureSize(count) {
        const width = Math.ceil(Math.sqrt(count));
        const height = Math.ceil(count / width);
        return {
            x: width,
            y: height
        };
    }
    createColorTexture(size) {
        const dataSize = size.x * size.y * 4;
        const data = new Uint16Array(dataSize);
        return this.createTexture('splatColor', __WEBPACK_EXTERNAL_MODULE_three__.RGBAFormat, __WEBPACK_EXTERNAL_MODULE_three__.HalfFloatType, size, data);
    }
    createTransformATexture(size) {
        const dataSize = size.x * size.y * 4;
        const data = new Uint32Array(dataSize);
        return this.createTexture('transformA', __WEBPACK_EXTERNAL_MODULE_three__.RGBAIntegerFormat, __WEBPACK_EXTERNAL_MODULE_three__.UnsignedIntType, size, data);
    }
    createTransformBTexture(size) {
        const dataSize = size.x * size.y * 4;
        const data = new Uint16Array(dataSize);
        return this.createTexture('transformB', __WEBPACK_EXTERNAL_MODULE_three__.RGBAFormat, __WEBPACK_EXTERNAL_MODULE_three__.HalfFloatType, size, data);
    }
    createSHTexture(size, format) {
        const channels = format === __WEBPACK_EXTERNAL_MODULE_three__.RedIntegerFormat ? 1 : 4;
        const dataSize = size.x * size.y * channels;
        const data = new Uint32Array(dataSize);
        const integerFormat = format === __WEBPACK_EXTERNAL_MODULE_three__.RedIntegerFormat ? __WEBPACK_EXTERNAL_MODULE_three__.RedIntegerFormat : __WEBPACK_EXTERNAL_MODULE_three__.RGBAIntegerFormat;
        return this.createTexture('splatSH', integerFormat, __WEBPACK_EXTERNAL_MODULE_three__.UnsignedIntType, size, data);
    }
    updateColorData(gsplatData) {
        const texture = this.colorTexture;
        const data = texture.image.data;
        const cr = gsplatData.getProp('f_dc_0');
        const cg = gsplatData.getProp('f_dc_1');
        const cb = gsplatData.getProp('f_dc_2');
        const ca = gsplatData.getProp('opacity');
        const SH_C0 = 0.28209479177387814;
        for(let i = 0; i < this.numSplats; i++){
            const r = cr[i] * SH_C0 + 0.5;
            const g = cg[i] * SH_C0 + 0.5;
            const b = cb[i] * SH_C0 + 0.5;
            const a = 1 / (1 + Math.exp(-ca[i]));
            data[4 * i + 0] = this.float2Half(r);
            data[4 * i + 1] = this.float2Half(g);
            data[4 * i + 2] = this.float2Half(b);
            data[4 * i + 3] = this.float2Half(a);
        }
        texture.needsUpdate = true;
    }
    updateTransformData(gsplatData) {
        const dataAUint = this.transformATexture.image.data;
        const dataAFloat = new Float32Array(dataAUint.buffer);
        const dataB = this.transformBTexture.image.data;
        const x = gsplatData.getProp('x');
        const y = gsplatData.getProp('y');
        const z = gsplatData.getProp('z');
        const rx = gsplatData.getProp('rot_1');
        const ry = gsplatData.getProp('rot_2');
        const rz = gsplatData.getProp('rot_3');
        const rw = gsplatData.getProp('rot_0');
        const sx = gsplatData.getProp('scale_0');
        const sy = gsplatData.getProp('scale_1');
        const sz = gsplatData.getProp('scale_2');
        for(let i = 0; i < this.numSplats; i++){
            let qx = rx[i];
            let qy = ry[i];
            let qz = rz[i];
            let qw = rw[i];
            const len = Math.sqrt(qx * qx + qy * qy + qz * qz + qw * qw);
            if (len > 0) {
                qx /= len;
                qy /= len;
                qz /= len;
                qw /= len;
            }
            if (qw < 0) {
                qx = -qx;
                qy = -qy;
                qz = -qz;
                qw = -qw;
            }
            dataAFloat[4 * i + 0] = x[i];
            dataAFloat[4 * i + 1] = y[i];
            dataAFloat[4 * i + 2] = z[i];
            const halfQx = this.float2Half(qx);
            const halfQy = this.float2Half(qy);
            dataAUint[4 * i + 3] = halfQx | halfQy << 16;
            dataB[4 * i + 0] = this.float2Half(Math.exp(sx[i]));
            dataB[4 * i + 1] = this.float2Half(Math.exp(sy[i]));
            dataB[4 * i + 2] = this.float2Half(Math.exp(sz[i]));
            dataB[4 * i + 3] = this.float2Half(qz);
        }
        this.transformATexture.needsUpdate = true;
        this.transformBTexture.needsUpdate = true;
    }
    updateSHData(gsplatData) {
        if (!this.sh1to3Texture) return;
        const sh1to3Data = this.sh1to3Texture.image.data;
        const sh4to7Data = this.sh4to7Texture?.image.data;
        const sh8to11Data = this.sh8to11Texture?.image.data;
        const sh12to15Data = this.sh12to15Texture?.image.data;
        const numCoeffsMap = {
            1: 3,
            2: 8,
            3: 15
        };
        const numCoeffs = numCoeffsMap[this.shBands];
        const src = [];
        for(let i = 0; i < 3 * numCoeffs; i++)src.push(gsplatData.getProp(`f_rest_${i}`));
        const t11 = 2047;
        const t10 = 1023;
        const float32 = new Float32Array(1);
        const uint32 = new Uint32Array(float32.buffer);
        const c = new Array(3 * numCoeffs).fill(0);
        for(let i = 0; i < gsplatData.numSplats; i++){
            for(let j = 0; j < numCoeffs; j++){
                c[3 * j + 0] = src[j][i];
                c[3 * j + 1] = src[j + numCoeffs][i];
                c[3 * j + 2] = src[j + 2 * numCoeffs][i];
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
        this.sh1to3Texture.needsUpdate = true;
        if (this.sh4to7Texture) this.sh4to7Texture.needsUpdate = true;
        if (this.sh8to11Texture) this.sh8to11Texture.needsUpdate = true;
        if (this.sh12to15Texture) this.sh12to15Texture.needsUpdate = true;
    }
    float2Half(value) {
        const buffer = new ArrayBuffer(4);
        const view = new DataView(buffer);
        view.setFloat32(0, value, true);
        const bits = view.getUint32(0, true);
        const sign = bits >> 31 & 0x1;
        let exp = bits >> 23 & 0xff;
        let frac = 0x7fffff & bits;
        if (0xff === exp) return sign << 15 | 0x7c00 | (0 !== frac ? 0x200 : 0);
        exp = exp - 127 + 15;
        if (exp <= 0) {
            if (exp < -10) return sign << 15;
            frac |= 0x800000;
            frac >>= 1 - exp;
            return sign << 15 | frac >> 13;
        }
        if (exp >= 31) return sign << 15 | 0x7c00;
        return sign << 15 | exp << 10 | frac >> 13;
    }
}
export { GSplatResource };
