import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__gsplatBatching_js_a3d95a56__ from "./gsplatBatching.js";
import * as __WEBPACK_EXTERNAL_MODULE__materials_GaussianSplatMaterial_js_9bde232b__ from "../materials/GaussianSplatMaterial.js";
import * as __WEBPACK_EXTERNAL_MODULE__sorting_SplatSorter_js_06a7f42e__ from "../sorting/SplatSorter.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_getRendererViewportSize_js_7c6ff589__ from "../utils/getRendererViewportSize.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__ from "../../../shared/constants/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('gsplat:core');
class GaussianSogsGeometry extends __WEBPACK_EXTERNAL_MODULE_three__.InstancedBufferGeometry {
    constructor(numSplats){
        super(), this.visibleSplatCount = 0;
        (0, __WEBPACK_EXTERNAL_MODULE__gsplatBatching_js_a3d95a56__.setBatchedSplatQuadGeometry)(this);
        this.setVisibleSplatCount(numSplats);
        const [orderWidth, orderHeight] = this.evalTextureSize(numSplats);
        this.orderWidth = orderWidth;
        this.orderHeight = orderHeight;
        const orderData = new Uint32Array(orderWidth * orderHeight);
        for(let i = 0; i < numSplats; i++)orderData[i] = i;
        this.orderTexture = new __WEBPACK_EXTERNAL_MODULE_three__.DataTexture(orderData, orderWidth, orderHeight, __WEBPACK_EXTERNAL_MODULE_three__.RedIntegerFormat, __WEBPACK_EXTERNAL_MODULE_three__.UnsignedIntType);
        this.orderTexture.internalFormat = 'R32UI';
        this.orderTexture.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        this.orderTexture.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        this.orderTexture.wrapS = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
        this.orderTexture.wrapT = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
        this.orderTexture.needsUpdate = true;
    }
    setVisibleSplatCount(count) {
        this.visibleSplatCount = Math.max(0, Math.floor(count));
        this.instanceCount = (0, __WEBPACK_EXTERNAL_MODULE__gsplatBatching_js_a3d95a56__.getGSplatBatchInstanceCount)(this.visibleSplatCount);
    }
    updateOrder(sortedIndices) {
        if (sortedIndices.length !== this.visibleSplatCount) {
            log.error('Sorted indices length mismatch');
            return;
        }
        const data = this.orderTexture.image.data;
        data.set(sortedIndices);
        this.orderTexture.needsUpdate = true;
    }
    dispose() {
        this.orderTexture.dispose();
        super.dispose();
    }
    evalTextureSize(count) {
        const width = Math.ceil(Math.sqrt(count));
        const height = Math.ceil(count / width);
        return [
            width,
            height
        ];
    }
}
class GaussianSogsMesh extends __WEBPACK_EXTERNAL_MODULE_three__.Mesh {
    static #_ = this.SORT_POSITION_THRESHOLD = __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.GSPLAT_SORT_POSITION_THRESHOLD;
    static #_2 = this.SORT_DIRECTION_THRESHOLD = __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.GSPLAT_SORT_DIRECTION_THRESHOLD;
    constructor(splatData, options = {}){
        const geometry = new GaussianSogsGeometry(splatData.numSplats);
        const shBands = splatData.shBands;
        const effectiveEnableSH = shBands > 0 ? options.enableSH ?? true : false;
        const effectiveMaxSHBands = effectiveEnableSH ? options.maxSHBands ?? shBands : 0;
        const material = new __WEBPACK_EXTERNAL_MODULE__materials_GaussianSplatMaterial_js_9bde232b__.GaussianSplatMaterial({
            depthWrite: options.depthWrite,
            depthTest: options.depthTest,
            transparent: options.transparent,
            enableSH: effectiveEnableSH,
            maxSHBands: effectiveMaxSHBands
        });
        super(geometry, material), this.sorter = null, this.colorSpaceManager = null, this._shaderEffect = null, this.codebookTextures = [], this.centers = null, this.lastSortCameraPosition = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1 / 0, 1 / 0, 1 / 0), this.lastSortCameraDirection = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1 / 0, 1 / 0, 1 / 0), this.rteCameraPos = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(), this.rteSceneOrigin = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(), this.sceneOriginOverride = null, this.drawingBufferSize = new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(), this.boundingBoxCenter = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(), this.boundingBoxSize = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(), this.currentSortCameraDirection = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(), this.onBeforeRender = (renderer, _scene, camera)=>{
            const size = (0, __WEBPACK_EXTERNAL_MODULE__utils_getRendererViewportSize_js_7c6ff589__.getRendererViewportDrawingBufferSize)(renderer, this.drawingBufferSize);
            this.material.setViewport(size.x, size.y);
            this.material.setCameraParams(camera);
            camera.getWorldPosition(this.rteCameraPos);
            this.material.setCameraPositionWorld(this.rteCameraPos);
            if (this.sceneOriginOverride) this.material.setOriginToCamera(this.sceneOriginOverride, this.rteCameraPos);
            else {
                this.rteSceneOrigin.setFromMatrixPosition(this.matrixWorld);
                this.material.setOriginToCamera(this.rteSceneOrigin, this.rteCameraPos);
            }
            if (this.colorSpaceManager) this.colorSpaceManager.configureMaterial(this.material);
            else this.material.updateGammaMode(renderer);
            if (this.sorter && this.checkCameraChanged(camera)) this.sorter.setCamera(camera, this.matrixWorld);
        };
        this.splatData = splatData;
        this.centers = options.centers ?? null;
        this.dataWidth = Math.floor(splatData.means_l.image.width);
        this.dataHeight = Math.floor(splatData.means_l.image.height);
        material.uniforms.splatOrder.value = geometry.orderTexture;
        material.setMetadata(splatData.numSplats, this.dataWidth, geometry.orderWidth);
        material.setSogsTextures({
            meansLow: splatData.means_l,
            meansHigh: splatData.means_u,
            quats: splatData.quats,
            scales: splatData.scales,
            sh0: splatData.sh0,
            scalesCodebook: this.createCodebookTexture('sogsScalesCodebook', splatData.meta.scales.codebook),
            sh0Codebook: this.createCodebookTexture('sogsSH0Codebook', splatData.meta.sh0.codebook)
        }, splatData.meta);
        const shRange = this.getShRange();
        material.setSogsSHTextures(effectiveEnableSH ? splatData.sh_centroids ?? null : null, effectiveEnableSH ? splatData.sh_labels ?? null : null, shRange.min, shRange.max, effectiveMaxSHBands);
        if (options.customAabb) geometry.boundingBox = options.customAabb.clone();
        else {
            const aabb = new __WEBPACK_EXTERNAL_MODULE_three__.Box3();
            splatData.calcAabb(aabb);
            geometry.boundingBox = aabb;
        }
        this.updateBoundingSphereFromBox();
        if (false !== options.enableSorting && this.centers) {
            geometry.setVisibleSplatCount(0);
            this.sorter = new __WEBPACK_EXTERNAL_MODULE__sorting_SplatSorter_js_06a7f42e__.SplatSorter({
                numSplats: splatData.numSplats,
                getCenters: ()=>this.centers
            }, geometry.orderTexture, {
                ...options.sortingOptions,
                retainCentersForMapping: false,
                onSortComplete: (data)=>{
                    this.geometry.setVisibleSplatCount(data.count);
                    this.dispatchEvent({
                        type: 'sortComplete',
                        ...data
                    });
                }
            });
            this.centers = null;
        }
    }
    setColorSpaceManager(manager) {
        this.colorSpaceManager = manager;
        manager.configureMaterial(this.material);
    }
    getColorSpaceManager() {
        return this.colorSpaceManager;
    }
    updateOrder(sortedIndices) {
        this.geometry.updateOrder(sortedIndices);
    }
    setSceneOriginOverride(origin) {
        if (origin) {
            if (!this.sceneOriginOverride) this.sceneOriginOverride = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
            this.sceneOriginOverride.copy(origin);
            this.__sceneOriginOverride = this.sceneOriginOverride;
        } else {
            this.sceneOriginOverride = null;
            delete this.__sceneOriginOverride;
        }
    }
    setShaderEffect(effect) {
        if (this._shaderEffect === effect) return effect ? effect.enable(this.material) : true;
        this._shaderEffect?.disable();
        this._shaderEffect = effect;
        if (!effect) {
            this.material.clearShaderEffect();
            return true;
        }
        return effect.enable(this.material);
    }
    clearShaderEffect() {
        return this.setShaderEffect(null);
    }
    restartShaderEffect() {
        return this._shaderEffect?.restart() ?? false;
    }
    getShaderEffect() {
        return this._shaderEffect;
    }
    updateShaderEffect(delta) {
        this._shaderEffect?.update(delta);
    }
    dispose() {
        this._shaderEffect?.destroy();
        this._shaderEffect = null;
        this.sorter?.dispose();
        this.sorter = null;
        this.centers = null;
        for (const texture of this.codebookTextures)texture.dispose();
        this.codebookTextures = [];
        this.splatData.destroy();
        this.geometry.dispose();
        this.material.dispose();
    }
    createCodebookTexture(name, codebook) {
        if (!codebook) return;
        const data = new Float32Array(256);
        for(let i = 0; i < 256; i++)data[i] = codebook[i] ?? 0;
        const texture = new __WEBPACK_EXTERNAL_MODULE_three__.DataTexture(data, 256, 1, __WEBPACK_EXTERNAL_MODULE_three__.RedFormat, __WEBPACK_EXTERNAL_MODULE_three__.FloatType);
        texture.name = name;
        texture.internalFormat = 'R32F';
        texture.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        texture.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        texture.wrapS = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
        texture.wrapT = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
        texture.generateMipmaps = false;
        texture.needsUpdate = true;
        this.codebookTextures.push(texture);
        return texture;
    }
    getShRange() {
        const shN = this.splatData.meta.shN;
        if (2 === this.splatData.meta.version && shN?.codebook) return {
            min: shN.codebook[0] ?? 0,
            max: shN.codebook[255] ?? shN.codebook[shN.codebook.length - 1] ?? 1
        };
        return {
            min: shN?.mins ?? 0,
            max: shN?.maxs ?? 1
        };
    }
    updateBoundingSphereFromBox() {
        const box = this.geometry.boundingBox;
        if (!box) return;
        const center = box.getCenter(this.boundingBoxCenter);
        const size = box.getSize(this.boundingBoxSize);
        const radius = size.length() / 2;
        if (!this.geometry.boundingSphere) this.geometry.boundingSphere = new __WEBPACK_EXTERNAL_MODULE_three__.Sphere();
        this.geometry.boundingSphere.center.copy(center);
        this.geometry.boundingSphere.radius = radius;
    }
    checkCameraChanged(camera) {
        const pos = camera.position;
        const dir = camera.getWorldDirection(this.currentSortCameraDirection);
        const posDelta = pos.distanceToSquared(this.lastSortCameraPosition);
        const posThreshold = GaussianSogsMesh.SORT_POSITION_THRESHOLD * GaussianSogsMesh.SORT_POSITION_THRESHOLD;
        const dirDot = dir.dot(this.lastSortCameraDirection);
        const dirChanged = dirDot < 1.0 - GaussianSogsMesh.SORT_DIRECTION_THRESHOLD;
        if (posDelta > posThreshold || dirChanged) {
            this.lastSortCameraPosition.copy(pos);
            this.lastSortCameraDirection.copy(dir);
            return true;
        }
        return false;
    }
}
export { GaussianSogsMesh };
