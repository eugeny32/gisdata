import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__core_gsplatBatching_js_2c6b5696__ from "../core/gsplatBatching.js";
import * as __WEBPACK_EXTERNAL_MODULE__materials_GaussianSplatMaterial_js_9bde232b__ from "../materials/GaussianSplatMaterial.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('gsplat:lod');
const EMPTY_CENTERS = new Float32Array(0);
class WorkBufferRenderInfo {
    constructor(key, material, colorOnly = false){
        this.renderer = null;
        this.key = key;
        this.material = material;
        this.colorOnly = colorOnly;
    }
    destroy() {
        this.material.dispose();
        this.renderer = null;
    }
}
class GSplatResourceBase {
    static #_ = this.nextId = 0;
    static #_2 = this.INSTANCE_SIZE = __WEBPACK_EXTERNAL_MODULE__core_gsplatBatching_js_2c6b5696__.GSPLAT_INSTANCE_SIZE;
    constructor(renderer, gsplatData){
        this._destroyed = false;
        this.mesh = null;
        this.instanceIndices = null;
        this.workBufferRenderInfos = new Map();
        this._refCount = 0;
        this._onContextRestored = null;
        this.id = GSplatResourceBase.nextId++;
        this.renderer = renderer;
        this.gsplatData = gsplatData;
        const centers = gsplatData.getCenters();
        if (!centers) throw new Error('[GSplatResourceBase] Failed to get centers from gsplatData');
        this._centers = centers;
        this.aabb = new __WEBPACK_EXTERNAL_MODULE_three__.Box3();
        gsplatData.calcAabb(this.aabb);
        const mesh = GSplatResourceBase.createMesh();
        try {
            const instanceIndices = GSplatResourceBase.createInstanceIndices(this.numSplats);
            mesh.geometry.boundingBox = this.aabb.clone();
            this.mesh = mesh;
            this.instanceIndices = instanceIndices;
        } catch (error) {
            GSplatResourceBase.disposeMesh(mesh);
            throw error;
        }
    }
    destroy() {
        if (this._destroyed) return;
        this._destroyed = true;
        this._centers = EMPTY_CENTERS;
        if (this._onContextRestored) {
            this.renderer.domElement.removeEventListener('webglcontextrestored', this._onContextRestored);
            this._onContextRestored = null;
        }
        if (this.mesh) {
            GSplatResourceBase.disposeMesh(this.mesh);
            this.mesh = null;
        }
        this.instanceIndices = null;
        this.workBufferRenderInfos.forEach((info)=>info.destroy());
        this.workBufferRenderInfos.clear();
    }
    get centers() {
        return this._centers;
    }
    incRefCount() {
        this._refCount++;
    }
    decRefCount() {
        if (this._refCount <= 0) {
            this._refCount = 0;
            log.warn(`GSplatResourceBase[${this.id}]: refCount underflow prevented`);
            return;
        }
        this._refCount--;
    }
    get refCount() {
        return this._refCount;
    }
    get numSplats() {
        return this.gsplatData.numSplats;
    }
    getWorkBufferRenderInfo(useIntervals, _colorTextureFormat, colorOnly = false) {
        log.warn('[GSplatResourceBase] getWorkBufferRenderInfo called on base class! This should be overridden by subclass.');
        const defines = new Map();
        this.configureMaterialDefines(defines);
        if (useIntervals) defines.set('GSPLAT_LOD', '');
        if (colorOnly) defines.set('GSPLAT_COLOR_ONLY', '');
        const key = Array.from(defines.entries()).map(([k, v])=>`${k}=${v}`).join(';');
        let info = this.workBufferRenderInfos.get(key);
        if (!info) {
            const material = new __WEBPACK_EXTERNAL_MODULE__materials_GaussianSplatMaterial_js_9bde232b__.GaussianSplatMaterial({
                depthWrite: false,
                depthTest: true,
                transparent: true
            });
            this.configureMaterial(material);
            defines.forEach((value, key)=>{
                material.defines = material.defines || {};
                material.defines[key] = value;
            });
            material.needsUpdate = true;
            info = new WorkBufferRenderInfo(key, material, colorOnly);
            this.workBufferRenderInfos.set(key, info);
        }
        return info;
    }
    static createMesh() {
        const geometry = new __WEBPACK_EXTERNAL_MODULE_three__.BufferGeometry();
        let material = null;
        try {
            (0, __WEBPACK_EXTERNAL_MODULE__core_gsplatBatching_js_2c6b5696__.setBatchedSplatQuadGeometry)(geometry);
            material = new __WEBPACK_EXTERNAL_MODULE_three__.MeshBasicMaterial();
            return new __WEBPACK_EXTERNAL_MODULE_three__.Mesh(geometry, material);
        } catch (error) {
            geometry.dispose();
            material?.dispose();
            throw error;
        }
    }
    static disposeMesh(mesh) {
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) for (const material of mesh.material)material.dispose();
        else mesh.material.dispose();
    }
    static createInstanceIndices(splatCount) {
        const instanceSize = GSplatResourceBase.INSTANCE_SIZE;
        const numSplats = Math.ceil(splatCount / instanceSize) * instanceSize;
        const numInstances = numSplats / instanceSize;
        const indexData = new Uint32Array(numInstances);
        for(let i = 0; i < numInstances; i++)indexData[i] = i * instanceSize;
        return new __WEBPACK_EXTERNAL_MODULE_three__.InstancedBufferAttribute(indexData, 1);
    }
    createTexture(name, format, type, size, data) {
        const texture = new __WEBPACK_EXTERNAL_MODULE_three__.DataTexture(data, size.x, size.y, format, type);
        texture.name = name;
        texture.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        texture.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        texture.wrapS = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
        texture.wrapT = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
        texture.generateMipmaps = false;
        if (type === __WEBPACK_EXTERNAL_MODULE_three__.UnsignedIntType) {
            if (format === __WEBPACK_EXTERNAL_MODULE_three__.RGBAIntegerFormat) texture.internalFormat = 'RGBA32UI';
            else if (format === __WEBPACK_EXTERNAL_MODULE_three__.RGIntegerFormat) texture.internalFormat = 'RG32UI';
            else if (format === __WEBPACK_EXTERNAL_MODULE_three__.RedIntegerFormat) texture.internalFormat = 'R32UI';
        } else if (type === __WEBPACK_EXTERNAL_MODULE_three__.IntType) {
            if (format === __WEBPACK_EXTERNAL_MODULE_three__.RGBAIntegerFormat) texture.internalFormat = 'RGBA32I';
            else if (format === __WEBPACK_EXTERNAL_MODULE_three__.RGIntegerFormat) texture.internalFormat = 'RG32I';
            else if (format === __WEBPACK_EXTERNAL_MODULE_three__.RedIntegerFormat) texture.internalFormat = 'R32I';
        } else if (type === __WEBPACK_EXTERNAL_MODULE_three__.HalfFloatType) {
            if (format === __WEBPACK_EXTERNAL_MODULE_three__.RGBAFormat) texture.internalFormat = 'RGBA16F';
            else if (format === __WEBPACK_EXTERNAL_MODULE_three__.RGFormat) texture.internalFormat = 'RG16F';
            else if (format === __WEBPACK_EXTERNAL_MODULE_three__.RedFormat) texture.internalFormat = 'R16F';
        }
        texture.needsUpdate = true;
        return texture;
    }
}
export { GSplatResourceBase, WorkBufferRenderInfo };
