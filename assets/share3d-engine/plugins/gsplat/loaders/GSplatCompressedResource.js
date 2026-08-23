import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__lod_GSplatResourceBase_js_74b35280__ from "../lod/GSplatResourceBase.js";
function strideCopy(target, targetStride, src, srcStride, numEntries) {
    for(let i = 0; i < numEntries; i++)for(let j = 0; j < srcStride; j++)target[i * targetStride + j] = src[i * srcStride + j];
}
class GSplatCompressedResource extends __WEBPACK_EXTERNAL_MODULE__lod_GSplatResourceBase_js_74b35280__.GSplatResourceBase {
    constructor(renderer, gsplatData){
        super(renderer, gsplatData);
        const { chunkData, chunkSize, numChunks, numSplats, vertexData, shBands } = gsplatData;
        this.chunks = new Float32Array(6 * numChunks);
        gsplatData.getChunks(this.chunks);
        const splatTextureSize = this.evalTextureSize(numSplats);
        this.packedTexture = this.createPackedTexture(splatTextureSize, vertexData);
        const chunkTextureSize = this.evalTextureSize(numChunks);
        chunkTextureSize.x *= 5;
        this.chunkTexture = this.createChunkTexture(chunkTextureSize);
        const chunkTextureData = new Float32Array(chunkTextureSize.x * chunkTextureSize.y * 4);
        strideCopy(chunkTextureData, 20, chunkData, chunkSize, numChunks);
        if (12 === chunkSize) for(let i = 0; i < numChunks; i++){
            chunkTextureData[20 * i + 15] = 1;
            chunkTextureData[20 * i + 16] = 1;
            chunkTextureData[20 * i + 17] = 1;
        }
        const imageData = this.chunkTexture.image;
        if (imageData?.data) {
            imageData.data.set(chunkTextureData);
            this.chunkTexture.needsUpdate = true;
        }
        if (shBands > 0 && gsplatData.shData0 && gsplatData.shData1 && gsplatData.shData2) {
            const size = this.evalTextureSize(numSplats);
            this.shTexture0 = this.createSHTexture(size, new Uint32Array(gsplatData.shData0.buffer));
            this.shTexture1 = this.createSHTexture(size, new Uint32Array(gsplatData.shData1.buffer));
            this.shTexture2 = this.createSHTexture(size, new Uint32Array(gsplatData.shData2.buffer));
        }
        this._onContextRestored = this.onContextRestored.bind(this);
        renderer.domElement.addEventListener('webglcontextrestored', this._onContextRestored);
    }
    destroy() {
        this.packedTexture?.dispose();
        this.chunkTexture?.dispose();
        this.shTexture0?.dispose();
        this.shTexture1?.dispose();
        this.shTexture2?.dispose();
        super.destroy();
    }
    onContextRestored() {
        const gsplatData = this.gsplatData;
        const { chunkData, chunkSize, numChunks } = gsplatData;
        const chunkTextureSize = this.evalTextureSize(numChunks);
        chunkTextureSize.x *= 5;
        const chunkTextureData = new Float32Array(chunkTextureSize.x * chunkTextureSize.y * 4);
        strideCopy(chunkTextureData, 20, chunkData, chunkSize, numChunks);
        if (12 === chunkSize) for(let i = 0; i < numChunks; i++){
            chunkTextureData[20 * i + 15] = 1;
            chunkTextureData[20 * i + 16] = 1;
            chunkTextureData[20 * i + 17] = 1;
        }
        const chunkImageData = this.chunkTexture.image;
        if (chunkImageData?.data) {
            chunkImageData.data.set(chunkTextureData);
            this.chunkTexture.needsUpdate = true;
        }
        const packedImageData = this.packedTexture.image;
        if (packedImageData?.data) {
            packedImageData.data.set(gsplatData.vertexData);
            this.packedTexture.needsUpdate = true;
        }
        if (this.shTexture0 && gsplatData.shData0) {
            const sh0ImageData = this.shTexture0.image;
            if (sh0ImageData?.data) {
                sh0ImageData.data.set(new Uint32Array(gsplatData.shData0.buffer));
                this.shTexture0.needsUpdate = true;
            }
        }
        if (this.shTexture1 && gsplatData.shData1) {
            const sh1ImageData = this.shTexture1.image;
            if (sh1ImageData?.data) {
                sh1ImageData.data.set(new Uint32Array(gsplatData.shData1.buffer));
                this.shTexture1.needsUpdate = true;
            }
        }
        if (this.shTexture2 && gsplatData.shData2) {
            const sh2ImageData = this.shTexture2.image;
            if (sh2ImageData?.data) {
                sh2ImageData.data.set(new Uint32Array(gsplatData.shData2.buffer));
                this.shTexture2.needsUpdate = true;
            }
        }
    }
    configureMaterialDefines(defines) {
        defines.set('GSPLAT_COMPRESSED_DATA', '');
        if (this.shTexture0) defines.set('SH_BANDS', '3');
    }
    configureMaterial(material) {
        this.configureMaterialDefines(new Map());
        material.uniforms.packedTexture = {
            value: this.packedTexture
        };
        material.uniforms.chunkTexture = {
            value: this.chunkTexture
        };
        if (this.shTexture0) {
            material.uniforms.shTexture0 = {
                value: this.shTexture0
            };
            material.uniforms.shTexture1 = {
                value: this.shTexture1
            };
            material.uniforms.shTexture2 = {
                value: this.shTexture2
            };
            material.defines = material.defines || {};
            material.defines.GSPLAT_COMPRESSED_DATA = '';
            material.defines.SH_BANDS = 3;
            material.needsUpdate = true;
        }
    }
    evalTextureSize(count) {
        const width = Math.ceil(Math.sqrt(count));
        const height = Math.ceil(count / width);
        return {
            x: width,
            y: height
        };
    }
    createPackedTexture(size, data) {
        return this.createTexture('packedData', __WEBPACK_EXTERNAL_MODULE_three__.RGBAIntegerFormat, __WEBPACK_EXTERNAL_MODULE_three__.UnsignedIntType, size, data);
    }
    createChunkTexture(size) {
        const dataSize = size.x * size.y * 4;
        const data = new Float32Array(dataSize);
        return this.createTexture('chunkData', __WEBPACK_EXTERNAL_MODULE_three__.RGBAFormat, __WEBPACK_EXTERNAL_MODULE_three__.FloatType, size, data);
    }
    createSHTexture(size, data) {
        return this.createTexture('shTexture', __WEBPACK_EXTERNAL_MODULE_three__.RGBAIntegerFormat, __WEBPACK_EXTERNAL_MODULE_three__.UnsignedIntType, size, data);
    }
}
export { GSplatCompressedResource };
