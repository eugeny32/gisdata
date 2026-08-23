import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__gsplatBatching_js_a3d95a56__ from "./gsplatBatching.js";
import * as __WEBPACK_EXTERNAL_MODULE__effects_workBufferModifier_js_820fce69__ from "../effects/workBufferModifier.js";
import * as __WEBPACK_EXTERNAL_MODULE__materials_GaussianSplatMaterial_js_9bde232b__ from "../materials/GaussianSplatMaterial.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_getRendererViewportSize_js_7c6ff589__ from "../utils/getRendererViewportSize.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_types_gsplat_js_2ba04999__ from "../../../shared/types/gsplat.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('gsplat:core');
class UnifiedLODMesh extends __WEBPACK_EXTERNAL_MODULE_three__.Mesh {
    static #_ = this._loggedNaNPosition = false;
    static #_2 = this._loggedNaNBoundingSphere = false;
    constructor(director, composition, layer, boundingBox){
        const geometry = UnifiedLODMesh.createGeometry();
        const material = new __WEBPACK_EXTERNAL_MODULE__materials_GaussianSplatMaterial_js_9bde232b__.GaussianSplatMaterial({
            depthWrite: false,
            depthTest: true,
            transparent: true
        });
        super(geometry, material), this._initialized = false, this._lastTextureSize = 0, this._tempViewportSize = new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(), this._tempCameraPos = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(), this._tempSceneOrigin = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(), this._sceneOriginOverride = null, this._shaderEffect = null, this._workBufferModifier = null, this._workBufferUpdateMode = __WEBPACK_EXTERNAL_MODULE__shared_types_gsplat_js_2ba04999__.GSPLAT_WORKBUFFER_UPDATE_AUTO, this._lastFrameId = -1, this._lastFrameHasStateTexture = false, this._frameState = {
            manager: null,
            textureSize: 0,
            visibleSplatCount: 0,
            batchInstanceCount: 0,
            viewportWidth: 0,
            viewportHeight: 0,
            mergedStateTexture: null,
            valid: false
        }, this.onBeforeRender = (renderer, _scene, camera)=>{
            const state = this.updateFrameState(renderer, camera, false);
            if (!state) {
                this.geometry.instanceCount = 0;
                return;
            }
            const manager = state.manager;
            if (false === manager.isWorkBufferRenderable) {
                this.geometry.instanceCount = 0;
                return;
            }
            this.material.setUnifiedLODTextures(manager.colorTexture, manager.splatTexture0, manager.splatTexture1, manager.orderTexture, state.textureSize);
            if (manager.isHighQualitySHActive && manager.shResultTexture) this.material.setHighQualitySHTexture(manager.shResultTexture, null);
            else this.material.setHighQualitySHTexture(null);
            const filterConfig = manager.getScalarFilterConfig();
            if (filterConfig?.enabled && manager.scalarTexture) {
                this.material.setScalarTexture(manager.scalarTexture);
                this.material.setScalarFilter(true, filterConfig.min, filterConfig.max);
            } else {
                this.material.setScalarTexture(null);
                this.material.setScalarFilter(false, 0, 1);
            }
            this.geometry.instanceCount = state.batchInstanceCount;
            this.material.setMetadata(state.visibleSplatCount, state.textureSize, state.textureSize);
            this.material.setViewport(state.viewportWidth, state.viewportHeight);
            this.material.setCameraParams(camera);
            camera.getWorldPosition(this._tempCameraPos);
            this.material.setCameraPositionWorld(this._tempCameraPos);
            if (this._sceneOriginOverride) this.material.setOriginToCamera(this._sceneOriginOverride, this._tempCameraPos);
            else {
                this._tempSceneOrigin.setFromMatrixPosition(this.matrixWorld);
                this.material.setOriginToCamera(this._tempSceneOrigin, this._tempCameraPos);
            }
            this.material.updateGammaMode(renderer);
        };
        this.director = director;
        this.composition = composition;
        this.layer = layer;
        this._boundingBox = boundingBox.clone();
        this.geometry.boundingBox = this._boundingBox.clone();
        this.updateBoundingSphereFromBox();
        this.geometry.instanceCount = 0;
        this.renderOrder = 1000;
        this.frustumCulled = false;
    }
    static createGeometry() {
        const geometry = new __WEBPACK_EXTERNAL_MODULE_three__.InstancedBufferGeometry();
        (0, __WEBPACK_EXTERNAL_MODULE__gsplatBatching_js_a3d95a56__.setBatchedSplatQuadGeometry)(geometry);
        geometry.instanceCount = 0;
        const originalCompute = geometry.computeBoundingSphere.bind(geometry);
        geometry.computeBoundingSphere = ()=>{
            const pos = geometry.getAttribute('position');
            let hasNaN = false;
            for(let i = 0; i < pos.count; i++){
                const x = pos.getX(i);
                const y = pos.getY(i);
                const z = pos.getZ(i);
                if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
                    hasNaN = true;
                    if (!UnifiedLODMesh._loggedNaNPosition) {
                        log.error(`[UnifiedLODMesh] position has NaN at i=${i} x=${x} y=${y} z=${z} (computeBoundingSphere)`);
                        UnifiedLODMesh._loggedNaNPosition = true;
                    }
                    break;
                }
            }
            originalCompute();
            const bs = geometry.boundingSphere;
            if (!bs || Number.isFinite(bs.radius) || UnifiedLODMesh._loggedNaNBoundingSphere) {
                if (!hasNaN && !UnifiedLODMesh._loggedNaNBoundingSphere && bs) UnifiedLODMesh._loggedNaNBoundingSphere = true;
            } else {
                log.error(`[UnifiedLODMesh] computeBoundingSphere produced NaN radius. center=(${bs.center.x},${bs.center.y},${bs.center.z}) radius=${bs.radius}`);
                UnifiedLODMesh._loggedNaNBoundingSphere = true;
            }
        };
        return geometry;
    }
    updateBoundingSphereFromBox() {
        if (!this.geometry.boundingSphere) this.geometry.boundingSphere = new __WEBPACK_EXTERNAL_MODULE_three__.Sphere();
        const { min, max } = this._boundingBox;
        const finite = Number.isFinite(min.x) && Number.isFinite(min.y) && Number.isFinite(min.z) && Number.isFinite(max.x) && Number.isFinite(max.y) && Number.isFinite(max.z);
        if (!finite) {
            log.error(`[UnifiedLODMesh] boundingBox has non-finite values: min=(${min.x},${min.y},${min.z}) max=(${max.x},${max.y},${max.z})`);
            this.geometry.boundingSphere.center.set(0, 0, 0);
            this.geometry.boundingSphere.radius = 0;
            return;
        }
        this._boundingBox.getBoundingSphere(this.geometry.boundingSphere);
        if (!Number.isFinite(this.geometry.boundingSphere.radius)) {
            log.error(`[UnifiedLODMesh] boundingSphere radius is NaN after update. box min=(${min.x},${min.y},${min.z}) max=(${max.x},${max.y},${max.z})`);
            this.geometry.boundingSphere.radius = 0;
        }
    }
    updateBoundingBox(boundingBox) {
        this._boundingBox.copy(boundingBox);
        if (this.geometry.boundingBox) this.geometry.boundingBox.copy(boundingBox);
        else this.geometry.boundingBox = boundingBox.clone();
        this.updateBoundingSphereFromBox();
    }
    setSceneOriginOverride(origin) {
        if (origin) {
            if (!this._sceneOriginOverride) this._sceneOriginOverride = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
            this._sceneOriginOverride.copy(origin);
            this.__sceneOriginOverride = this._sceneOriginOverride;
        } else {
            this._sceneOriginOverride = null;
            delete this.__sceneOriginOverride;
        }
    }
    updateFrameState(renderer, camera, requireStateTexture) {
        const frameId = renderer.info.render.frame;
        if (this._lastFrameId === frameId) {
            if (!this._frameState.valid) return null;
            if (requireStateTexture && !this._lastFrameHasStateTexture) {
                this._generateStateTexture();
                this._lastFrameHasStateTexture = true;
            }
            return this._frameState;
        }
        this._lastFrameId = frameId;
        this._lastFrameHasStateTexture = false;
        this._frameState.valid = false;
        this._frameState.mergedStateTexture = null;
        if (this.parent && !this.parent.visible) return null;
        if (!this.layer.enabled) return null;
        this.director.updateForRender(this.composition);
        const manager = this.director.getManager(camera, this.layer);
        if (!manager) {
            this._frameState.manager = null;
            return null;
        }
        const textureSize = manager.textureSize;
        if (0 === textureSize || 1 === textureSize) {
            this._frameState.manager = null;
            return null;
        }
        const visibleSplatCount = manager.visibleSplatCount;
        const batchInstanceCount = (0, __WEBPACK_EXTERNAL_MODULE__gsplatBatching_js_a3d95a56__.getGSplatBatchInstanceCount)(visibleSplatCount);
        const size = (0, __WEBPACK_EXTERNAL_MODULE__utils_getRendererViewportSize_js_7c6ff589__.getRendererViewportDrawingBufferSize)(renderer, this._tempViewportSize);
        this._lastTextureSize = textureSize;
        this._frameState.manager = manager;
        this._frameState.textureSize = textureSize;
        this._frameState.visibleSplatCount = visibleSplatCount;
        this._frameState.batchInstanceCount = batchInstanceCount;
        this._frameState.viewportWidth = size.x;
        this._frameState.viewportHeight = size.y;
        this._frameState.valid = true;
        if (requireStateTexture) {
            this._generateStateTexture();
            this._lastFrameHasStateTexture = true;
        }
        if (!this._initialized) this._initialized = true;
        return this._frameState;
    }
    _generateStateTexture() {
        const manager = this._frameState.manager;
        if (!manager) return;
        const workBuffer = manager.workBuffer;
        if (!workBuffer) return;
        const splats = manager.getActiveSplatInfos();
        this._frameState.mergedStateTexture = workBuffer.mergeStateTextures(splats);
    }
    getSceneOrigin(out) {
        if (this._sceneOriginOverride) return out.copy(this._sceneOriginOverride);
        return out.setFromMatrixPosition(this.matrixWorld);
    }
    get instanceCount() {
        return this.geometry.instanceCount;
    }
    get isInitialized() {
        return this._initialized;
    }
    get lastTextureSize() {
        return this._lastTextureSize;
    }
    get associatedLayer() {
        return this.layer;
    }
    collectDebugState() {
        const parts = [];
        parts.push(`visible=${this.visible}`);
        parts.push(`initialized=${this._initialized}`);
        parts.push(`instanceCount=${this.geometry.instanceCount}`);
        parts.push(`visibleSplatCount=${this._frameState.visibleSplatCount}`);
        parts.push(`batchInstanceCount=${this._frameState.batchInstanceCount}`);
        parts.push(`lastTexSize=${this._lastTextureSize}`);
        parts.push(`inScene=${null !== this.parent}`);
        parts.push(`frustumCulled=${this.frustumCulled}`);
        parts.push(`renderOrder=${this.renderOrder}`);
        parts.push(`layer.id=${this.layer.id}`);
        parts.push(`layer.enabled=${this.layer.enabled}`);
        parts.push(`layer.placements=${this.layer.gsplatPlacements.length}`);
        const mat = this.material;
        parts.push(`mat.visible=${mat.visible}`);
        parts.push(`mat.transparent=${mat.transparent}`);
        const uniforms = mat.uniforms;
        const hasColorTex = uniforms.splatColor?.value !== null;
        const hasSplat0Tex = uniforms.transformA?.value !== null;
        const hasSplat1Tex = uniforms.transformB?.value !== null;
        const hasOrderTex = uniforms.splatOrder?.value !== null;
        parts.push(`texBound=[color=${hasColorTex},splat0=${hasSplat0Tex},order=${hasOrderTex}]`);
        parts.push(`texBoundB=${hasSplat1Tex}`);
        return parts.join(', ');
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
    setWorkBufferModifier(modifier) {
        const compiled = (0, __WEBPACK_EXTERNAL_MODULE__effects_workBufferModifier_js_820fce69__.compileGSplatWorkBufferModifier)(modifier);
        const sameModifier = this._workBufferModifier?.hash === compiled?.hash && this._workBufferModifier?.code === compiled?.code;
        this._workBufferModifier = compiled;
        this.material.setWorkBufferModifier(compiled);
        this.applyWorkBufferModifierToPlacements(compiled);
        if (!sameModifier) this.markManagersWorkBufferDirty();
        return this.layer.gsplatPlacements.length > 0;
    }
    setWorkBufferUpdateMode(mode) {
        if (!UnifiedLODMesh.isWorkBufferUpdateMode(mode)) return false;
        this._workBufferUpdateMode = mode;
        for (const placement of this.layer.gsplatPlacements)placement.workBufferUpdateMode = mode;
        let appliedToManager = false;
        for (const manager of this.director.getAllManagers())for (const placement of this.layer.gsplatPlacements)appliedToManager = manager.setWorkBufferUpdateModeForPlacement(placement, mode) || appliedToManager;
        if (!appliedToManager && mode !== __WEBPACK_EXTERNAL_MODULE__shared_types_gsplat_js_2ba04999__.GSPLAT_WORKBUFFER_UPDATE_AUTO) this.markManagersWorkBufferDirty();
        return this.layer.gsplatPlacements.length > 0;
    }
    getWorkBufferUpdateMode() {
        return this._workBufferUpdateMode;
    }
    applyWorkBufferModifierToPlacements(modifier) {
        for (const placement of this.layer.gsplatPlacements)placement.workBufferModifier = modifier;
        for (const manager of this.director.getAllManagers())for (const placement of this.layer.gsplatPlacements)manager.setWorkBufferModifierForPlacement(placement, modifier);
    }
    markManagersWorkBufferDirty() {
        for (const manager of this.director.getAllManagers())manager.markWorkBufferDirty();
    }
    static isWorkBufferUpdateMode(mode) {
        return mode === __WEBPACK_EXTERNAL_MODULE__shared_types_gsplat_js_2ba04999__.GSPLAT_WORKBUFFER_UPDATE_AUTO || mode === __WEBPACK_EXTERNAL_MODULE__shared_types_gsplat_js_2ba04999__.GSPLAT_WORKBUFFER_UPDATE_ONCE || mode === __WEBPACK_EXTERNAL_MODULE__shared_types_gsplat_js_2ba04999__.GSPLAT_WORKBUFFER_UPDATE_ALWAYS;
    }
    dispose() {
        this._shaderEffect?.destroy();
        this._shaderEffect = null;
        this.geometry.dispose();
        this.material.dispose();
    }
}
export { UnifiedLODMesh };
