import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__lod_GSplatResourceBase_js_74b35280__ from "../lod/GSplatResourceBase.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_syncTextureUploadVersion_js_1de580b2__ from "../utils/syncTextureUploadVersion.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('gsplat:loader');
class GSplatSogsResource extends __WEBPACK_EXTERNAL_MODULE__lod_GSplatResourceBase_js_74b35280__.GSplatResourceBase {
    get meta() {
        return this.gsplatData.meta;
    }
    get shBands() {
        return this.gsplatData.shBands;
    }
    get numSplats() {
        return this.gsplatData.numSplats;
    }
    constructor(renderer, gsplatData){
        super(renderer, gsplatData), this.codebookTextures = [], this.loggedConfigureMaterial = false, this._gpuReady = true, this._gpuRestoreFailed = false, this._sogsDestroyed = false, this._retired = false, this._onContextLost = null, this._gpuReadyCallback = null, this._gpuRestoreFailedCallback = null, this._gpuRestorePromise = null;
        try {
            this.preuploadTextures();
            this._onContextLost = this.onContextLost.bind(this);
            renderer.domElement.addEventListener('webglcontextlost', this._onContextLost);
            this._onContextRestored = this.onContextRestored.bind(this);
            renderer.domElement.addEventListener('webglcontextrestored', this._onContextRestored);
        } catch (error) {
            if (this._onContextLost) {
                renderer.domElement.removeEventListener('webglcontextlost', this._onContextLost);
                this._onContextLost = null;
            }
            this.disposeCodebookTextures();
            super.destroy();
            throw error;
        }
    }
    destroy() {
        if (this._sogsDestroyed) return;
        this._sogsDestroyed = true;
        this._gpuReady = false;
        this._gpuReadyCallback = null;
        this._gpuRestoreFailedCallback = null;
        this.gsplatData.cancelSourceTextureRestore();
        if (this._onContextLost) {
            this.renderer.domElement.removeEventListener('webglcontextlost', this._onContextLost);
            this._onContextLost = null;
        }
        this.disposeCodebookTextures();
        this.gsplatData.destroy();
        super.destroy();
    }
    get gpuReady() {
        return this._gpuReady;
    }
    get gpuRestoreFailed() {
        return this._gpuRestoreFailed;
    }
    setGpuReadyCallback(callback) {
        this._gpuReadyCallback = callback;
    }
    setGpuRestoreFailedCallback(callback) {
        this._gpuRestoreFailedCallback = callback;
    }
    retireWhenUnused() {
        if (this._sogsDestroyed || this._retired) return;
        this._retired = true;
        this._gpuReady = false;
        this._gpuReadyCallback = null;
        this._gpuRestoreFailedCallback = null;
        this.gsplatData.cancelSourceTextureRestore();
        if (this._onContextLost) {
            this.renderer.domElement.removeEventListener('webglcontextlost', this._onContextLost);
            this._onContextLost = null;
        }
        if (this._onContextRestored) {
            this.renderer.domElement.removeEventListener('webglcontextrestored', this._onContextRestored);
            this._onContextRestored = null;
        }
        if (0 === this.refCount) this.destroy();
    }
    decRefCount() {
        super.decRefCount();
        if (this._retired && 0 === this.refCount) this.destroy();
    }
    disposeCodebookTextures() {
        for (const texture of this.codebookTextures)texture.dispose();
        this.codebookTextures = [];
    }
    onContextLost() {
        if (this._sogsDestroyed || this._retired || !this.gsplatData.sourceImagesReleased) return;
        this._gpuReady = false;
        this._gpuRestoreFailed = false;
        this.gsplatData.cancelSourceTextureRestore();
    }
    onContextRestored() {
        if (this._sogsDestroyed || this._retired) return;
        this.restoreCodebookTextureData();
        if (!this.gsplatData.sourceImagesReleased) return;
        this._gpuReady = false;
        const restore = this.restoreSourceTexturesWithRetry();
        this._gpuRestorePromise = restore;
        restore.then(()=>{
            if (this._sogsDestroyed || this._gpuRestorePromise !== restore) return;
            this.preuploadExistingTextures();
            this._gpuRestoreFailed = false;
            this._gpuReady = true;
            this._gpuReadyCallback?.();
        }).catch((error)=>{
            if (this._sogsDestroyed || error instanceof DOMException && 'AbortError' === error.name) return;
            const finalError = error instanceof Error ? error : new Error(String(error));
            this._gpuRestoreFailed = true;
            log.error(`[GSplatSogsResource] context restore failed: ${finalError.message}`);
            this._gpuRestoreFailedCallback?.(finalError);
        }).finally(()=>{
            if (this._gpuRestorePromise === restore) this._gpuRestorePromise = null;
        });
    }
    async restoreSourceTexturesWithRetry() {
        const maxAttempts = 2;
        let lastError;
        for(let attempt = 1; attempt <= maxAttempts; attempt++)try {
            await this.gsplatData.restoreSourceTextures(this.renderer);
            return;
        } catch (error) {
            if (error instanceof DOMException && 'AbortError' === error.name) throw error;
            lastError = error;
            if (attempt < maxAttempts) log.warn(`[GSplatSogsResource] context restore retry ${attempt}/${maxAttempts - 1}: ${error instanceof Error ? error.message : String(error)}`);
        }
        throw lastError instanceof Error ? lastError : new Error(String(lastError));
    }
    restoreCodebookTextureData() {
        const { meta } = this.gsplatData;
        this.codebookTextures.forEach((texture)=>{
            const name = texture.name;
            let codebook;
            if (name.includes('Scales')) codebook = meta.scales.codebook;
            else if (name.includes('SH0')) codebook = meta.sh0.codebook;
            else if (name.includes('SHN')) codebook = meta.shN?.codebook;
            if (codebook) {
                const data = new Float32Array(256);
                for(let i = 0; i < 256; i++)data[i] = codebook[i] ?? 0;
                const imageData = texture.image;
                if (imageData?.data) {
                    imageData.data.set(data);
                    texture.needsUpdate = true;
                }
            }
        });
    }
    preuploadTextures() {
        const textures = [
            this.gsplatData.means_l,
            this.gsplatData.means_u,
            this.gsplatData.quats,
            this.gsplatData.scales,
            this.gsplatData.sh0,
            this.gsplatData.sh_labels,
            this.gsplatData.sh_centroids
        ];
        const { meta } = this.gsplatData;
        if (2 === meta.version) {
            if (meta.scales.codebook) textures.push(this.createCodebookTexture('sogsScalesCodebook', meta.scales.codebook));
            if (meta.sh0.codebook) textures.push(this.createCodebookTexture('sogsSH0Codebook', meta.sh0.codebook));
            if (meta.shN?.codebook) textures.push(this.createCodebookTexture('sogsSHNCodebook', meta.shN.codebook));
        }
        for (const texture of textures)if (texture) {
            this.renderer.initTexture(texture);
            (0, __WEBPACK_EXTERNAL_MODULE__utils_syncTextureUploadVersion_js_1de580b2__.syncTextureUploadVersion)(this.renderer, texture);
        }
    }
    preuploadExistingTextures() {
        const textures = [
            this.gsplatData.means_l,
            this.gsplatData.means_u,
            this.gsplatData.quats,
            this.gsplatData.scales,
            this.gsplatData.sh0,
            this.gsplatData.sh_labels,
            this.gsplatData.sh_centroids,
            ...this.codebookTextures
        ];
        for (const texture of textures)if (texture) {
            this.renderer.initTexture(texture);
            (0, __WEBPACK_EXTERNAL_MODULE__utils_syncTextureUploadVersion_js_1de580b2__.syncTextureUploadVersion)(this.renderer, texture);
        }
    }
    configureMaterialDefines(defines) {
        defines.set('GSPLAT_SOGS_DATA', '');
        defines.set('SH_BANDS', this.gsplatData.shBands.toString());
        if (2 === this.gsplatData.meta.version) defines.set('GSPLAT_SOGS_V2', '');
    }
    configureMaterial(material) {
        const { gsplatData } = this;
        const { meta } = gsplatData;
        const toVector3 = (value)=>{
            if (value instanceof __WEBPACK_EXTERNAL_MODULE_three__.Vector3) return value.clone();
            if (Array.isArray(value)) return new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(value[0] ?? 0, value[1] ?? 0, value[2] ?? 0);
            return new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(value, value, value);
        };
        const toVector4 = (value, fallbackW)=>{
            if (value instanceof __WEBPACK_EXTERNAL_MODULE_three__.Vector4) return value.clone();
            if (Array.isArray(value)) return new __WEBPACK_EXTERNAL_MODULE_three__.Vector4(value[0] ?? 0, value[1] ?? value[0] ?? 0, value[2] ?? value[0] ?? 0, value[3] ?? fallbackW);
            return new __WEBPACK_EXTERNAL_MODULE_three__.Vector4(value, value, value, fallbackW);
        };
        const defines = new Map();
        this.configureMaterialDefines(defines);
        material.defines = material.defines || {};
        let definesChanged = false;
        if (!defines.has('GSPLAT_SOGS_V2') && 'GSPLAT_SOGS_V2' in material.defines) {
            delete material.defines.GSPLAT_SOGS_V2;
            definesChanged = true;
        }
        defines.forEach((value, key)=>{
            if (material.defines[key] !== value) {
                material.defines[key] = value;
                definesChanged = true;
            }
        });
        if (!material.uniforms) material.uniforms = {};
        material.uniforms.splatMeansLow = material.uniforms.splatMeansLow || {};
        material.uniforms.splatMeansLow.value = gsplatData.means_l;
        material.uniforms.splatMeansHigh = material.uniforms.splatMeansHigh || {};
        material.uniforms.splatMeansHigh.value = gsplatData.means_u;
        material.uniforms.splatQuats = material.uniforms.splatQuats || {};
        material.uniforms.splatQuats.value = gsplatData.quats;
        material.uniforms.splatScales = material.uniforms.splatScales || {};
        material.uniforms.splatScales.value = gsplatData.scales;
        material.uniforms.splatSH0 = material.uniforms.splatSH0 || {};
        material.uniforms.splatSH0.value = gsplatData.sh0;
        if (gsplatData.sh_labels) {
            material.uniforms.sogsSH_labels = material.uniforms.sogsSH_labels || {};
            material.uniforms.sogsSH_labels.value = gsplatData.sh_labels;
        }
        if (gsplatData.sh_centroids) {
            material.uniforms.packedShN = material.uniforms.packedShN || {};
            material.uniforms.packedShN.value = gsplatData.sh_centroids;
        }
        material.uniforms.sogsMeans_mins = material.uniforms.sogsMeans_mins || {};
        material.uniforms.sogsMeans_mins.value = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(...meta.means.mins);
        material.uniforms.sogsMeans_maxs = material.uniforms.sogsMeans_maxs || {};
        material.uniforms.sogsMeans_maxs.value = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(...meta.means.maxs);
        if (2 === meta.version) {
            if (meta.scales.codebook) {
                const codebook = meta.scales.codebook;
                material.uniforms.sogsScales_mins = material.uniforms.sogsScales_mins || {};
                material.uniforms.sogsScales_mins.value = toVector3(codebook[0]);
                material.uniforms.sogsScales_maxs = material.uniforms.sogsScales_maxs || {};
                material.uniforms.sogsScales_maxs.value = toVector3(codebook[255]);
                const scalesCodebookTexture = this.createCodebookTexture('sogsScalesCodebook', codebook);
                material.uniforms.sogsScalesCodebook = material.uniforms.sogsScalesCodebook || {};
                material.uniforms.sogsScalesCodebook.value = scalesCodebookTexture;
            }
            if (meta.sh0.codebook) {
                const codebook = meta.sh0.codebook;
                material.uniforms.sogsSH0_mins = material.uniforms.sogsSH0_mins || {};
                material.uniforms.sogsSH0_mins.value = toVector4(codebook[0], 0);
                material.uniforms.sogsSH0_maxs = material.uniforms.sogsSH0_maxs || {};
                material.uniforms.sogsSH0_maxs.value = toVector4(codebook[255], 1);
                const sh0CodebookTexture = this.createCodebookTexture('sogsSH0Codebook', codebook);
                material.uniforms.sogsSH0Codebook = material.uniforms.sogsSH0Codebook || {};
                material.uniforms.sogsSH0Codebook.value = sh0CodebookTexture;
            }
            if (meta.shN?.codebook) {
                const codebook = meta.shN.codebook;
                material.uniforms.sogsSHN_mins = material.uniforms.sogsSHN_mins || {};
                material.uniforms.sogsSHN_mins.value = codebook[0];
                material.uniforms.sogsSHN_maxs = material.uniforms.sogsSHN_maxs || {};
                material.uniforms.sogsSHN_maxs.value = codebook[255];
                const shNCodebookTexture = this.createCodebookTexture('sogsSHNCodebook', codebook);
                material.uniforms.sogsSHNCodebook = material.uniforms.sogsSHNCodebook || {};
                material.uniforms.sogsSHNCodebook.value = shNCodebookTexture;
            }
        } else {
            if (meta.scales.mins && meta.scales.maxs) {
                const scalesMins = Array.isArray(meta.scales.mins) ? Math.min(...meta.scales.mins) : meta.scales.mins;
                const scalesMaxs = Array.isArray(meta.scales.maxs) ? Math.max(...meta.scales.maxs) : meta.scales.maxs;
                material.uniforms.sogsScales_mins = material.uniforms.sogsScales_mins || {};
                material.uniforms.sogsScales_mins.value = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(scalesMins, scalesMins, scalesMins);
                material.uniforms.sogsScales_maxs = material.uniforms.sogsScales_maxs || {};
                material.uniforms.sogsScales_maxs.value = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(scalesMaxs, scalesMaxs, scalesMaxs);
            }
            if (meta.sh0.mins && meta.sh0.maxs) {
                const sh0Mins = Array.isArray(meta.sh0.mins) ? Math.min(...meta.sh0.mins.slice(0, 3)) : meta.sh0.mins;
                const sh0Maxs = Array.isArray(meta.sh0.maxs) ? Math.max(...meta.sh0.maxs.slice(0, 3)) : meta.sh0.maxs;
                material.uniforms.sogsSH0_mins = material.uniforms.sogsSH0_mins || {};
                material.uniforms.sogsSH0_mins.value = new __WEBPACK_EXTERNAL_MODULE_three__.Vector4(sh0Mins, sh0Mins, sh0Mins, 0);
                material.uniforms.sogsSH0_maxs = material.uniforms.sogsSH0_maxs || {};
                material.uniforms.sogsSH0_maxs.value = new __WEBPACK_EXTERNAL_MODULE_three__.Vector4(sh0Maxs, sh0Maxs, sh0Maxs, 1);
            }
            if (meta.shN?.mins !== void 0 && meta.shN?.maxs !== void 0) {
                material.uniforms.sogsSHN_mins = material.uniforms.sogsSHN_mins || {};
                material.uniforms.sogsSHN_mins.value = meta.shN.mins;
                material.uniforms.sogsSHN_maxs = material.uniforms.sogsSHN_maxs || {};
                material.uniforms.sogsSHN_maxs.value = meta.shN.maxs;
            }
        }
        if (definesChanged) material.needsUpdate = true;
        if (!this.loggedConfigureMaterial) this.loggedConfigureMaterial = true;
    }
    evalTextureSize(_count) {
        const width = this.gsplatData.means_l.image.width;
        const height = this.gsplatData.means_l.image.height;
        return {
            x: width,
            y: height
        };
    }
    createCodebookTexture(name, codebook) {
        const cached = this.codebookTextures.find((texture)=>texture.name === name);
        if (cached) return cached;
        const data = new Float32Array(256);
        for(let i = 0; i < 256; i++)data[i] = codebook[i] ?? 0;
        const texture = new __WEBPACK_EXTERNAL_MODULE_three__.DataTexture(data, 256, 1, __WEBPACK_EXTERNAL_MODULE_three__.RedFormat, __WEBPACK_EXTERNAL_MODULE_three__.FloatType);
        texture.name = name;
        texture.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        texture.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        texture.wrapS = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
        texture.wrapT = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
        texture.generateMipmaps = false;
        texture.needsUpdate = true;
        this.codebookTextures.push(texture);
        return texture;
    }
}
export { GSplatSogsResource };
