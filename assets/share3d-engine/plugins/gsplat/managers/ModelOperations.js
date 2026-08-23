import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__core_ColorSpaceManager_js_6f3faa8f__ from "../core/ColorSpaceManager.js";
import * as __WEBPACK_EXTERNAL_MODULE__lod_GSplatWorkBuffer_js_77868f4f__ from "../lod/GSplatWorkBuffer.js";
import * as __WEBPACK_EXTERNAL_MODULE__spatial_CentersPickHandler_js_67c70937__ from "../spatial/CentersPickHandler.js";
import * as __WEBPACK_EXTERNAL_MODULE__spatial_GSplatPickManager_js_54e2b077__ from "../spatial/GSplatPickManager.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__ModelLoader_js_5bba45fb__ from "./ModelLoader.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('gsplat');
const scalarFilterDebugGlobal = globalThis;
function isScalarFilterDebugEnabled() {
    return true === scalarFilterDebugGlobal.__POTREE_GS_SCALAR_DEBUG__;
}
const SCALAR_TYPE_MAP = {
    volume: __WEBPACK_EXTERNAL_MODULE__lod_GSplatWorkBuffer_js_77868f4f__.GSplatScalarMode.Volume,
    'surface-area': __WEBPACK_EXTERNAL_MODULE__lod_GSplatWorkBuffer_js_77868f4f__.GSplatScalarMode.SurfaceArea,
    value: __WEBPACK_EXTERNAL_MODULE__lod_GSplatWorkBuffer_js_77868f4f__.GSplatScalarMode.Value
};
class ModelOperations {
    constructor(ctx){
        this.ctx = ctx;
        this.colorSpaceManager = null;
        this._tempBox = new __WEBPACK_EXTERNAL_MODULE_three__.Box3();
    }
    getBoundingBoxByNodeId(nodeId) {
        const lodEntry = this.ctx.registry.getLODByNodeId(nodeId);
        if (lodEntry) {
            this._tempBox.copy(lodEntry.boundingBox);
            lodEntry.rootNode.updateMatrixWorld(true);
            this._tempBox.applyMatrix4(lodEntry.rootNode.matrixWorld);
            return (0, __WEBPACK_EXTERNAL_MODULE__ModelLoader_js_5bba45fb__.convertBox3ToBoundingBox)(this._tempBox);
        }
        const singleEntry = this.ctx.registry.getSingleByNodeId(nodeId);
        if (singleEntry) {
            singleEntry.mesh.updateMatrixWorld(true);
            this._tempBox.setFromObject(singleEntry.mesh);
            return (0, __WEBPACK_EXTERNAL_MODULE__ModelLoader_js_5bba45fb__.convertBox3ToBoundingBox)(this._tempBox);
        }
    }
    getCombinedBoundingBox() {
        const combinedBox = new __WEBPACK_EXTERNAL_MODULE_three__.Box3();
        for (const entry of this.ctx.registry.lodGroups.values()){
            this._tempBox.copy(entry.boundingBox);
            entry.rootNode.updateMatrixWorld(true);
            this._tempBox.applyMatrix4(entry.rootNode.matrixWorld);
            combinedBox.union(this._tempBox);
        }
        for (const entry of this.ctx.registry.singleFiles.values()){
            entry.mesh.updateMatrixWorld(true);
            this._tempBox.setFromObject(entry.mesh);
            combinedBox.union(this._tempBox);
        }
        return (0, __WEBPACK_EXTERNAL_MODULE__ModelLoader_js_5bba45fb__.convertBox3ToBoundingBox)(combinedBox);
    }
    setBoxHelperVisible(visible, nodeIds) {
        const targetNodeIds = nodeIds ?? this.ctx.registry.getAllNodeIds();
        for (const nodeId of targetNodeIds){
            const lodEntry = this.ctx.registry.getLODByNodeId(nodeId);
            if (!!lodEntry) {
                if (visible) {
                    if (!lodEntry.boxHelper) {
                        this._tempBox.copy(lodEntry.boundingBox);
                        lodEntry.rootNode.updateMatrixWorld(true);
                        this._tempBox.applyMatrix4(lodEntry.rootNode.matrixWorld);
                        lodEntry.boxHelper = new __WEBPACK_EXTERNAL_MODULE_three__.Box3Helper(this._tempBox, new __WEBPACK_EXTERNAL_MODULE_three__.Color('#0A65B9'));
                        this.ctx.scene.add(lodEntry.boxHelper);
                    }
                    lodEntry.boxHelper.visible = true;
                } else if (lodEntry.boxHelper) lodEntry.boxHelper.visible = false;
            }
        }
    }
    pick(ray, camera, forceCpuPickNodeIds, options) {
        if (!this.ctx.getDirector()) return null;
        const managers = this.ctx.getAllManagers();
        if (0 === managers.length) return null;
        let shouldForceCpu = forceCpuPickNodeIds.size > 0;
        if (!shouldForceCpu) {
            for (const manager of managers)if (manager.loadingCount > 0) {
                shouldForceCpu = true;
                break;
            }
        }
        const finalOptions = shouldForceCpu ? {
            ...options,
            interactionType: 'move'
        } : {
            ...options,
            interactionType: options?.interactionType ?? 'auto'
        };
        return __WEBPACK_EXTERNAL_MODULE__spatial_GSplatPickManager_js_54e2b077__.GSplatPickManager.pick(ray, camera, this.ctx.renderer, managers, finalOptions);
    }
    pickFromScreen(screenX, screenY, camera, forceCpuPickNodeIds, options) {
        const { width, height } = this.resolvePickScreenSize(options);
        const ndcX = screenX / width * 2 - 1;
        const ndcY = 2 * -(screenY / height) + 1;
        const raycaster = new __WEBPACK_EXTERNAL_MODULE_three__.Raycaster();
        raycaster.setFromCamera(new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(ndcX, ndcY), camera);
        return this.pick(raycaster.ray, camera, forceCpuPickNodeIds, {
            ...options,
            screenX,
            screenY
        });
    }
    disposeGpuPicker() {
        __WEBPACK_EXTERNAL_MODULE__spatial_GSplatPickManager_js_54e2b077__.GSplatPickManager.disposeGpuPicker(this.ctx.renderer);
    }
    clearGpuPickerLodVersions() {
        __WEBPACK_EXTERNAL_MODULE__spatial_GSplatPickManager_js_54e2b077__.GSplatPickManager.clearAllGpuPickerLodVersions();
    }
    pickCenter(screenX, screenY, camera, options) {
        const canvas = this.ctx.renderer.domElement;
        const allSplatInfos = this.collectAllSplatInfos();
        if (0 === allSplatInfos.length) return [];
        const { width: screenWidth, height: screenHeight } = this.resolvePickScreenSize(options, {
            width: canvas.clientWidth,
            height: canvas.clientHeight
        });
        return __WEBPACK_EXTERNAL_MODULE__spatial_CentersPickHandler_js_67c70937__.CentersPickHandler.pickAtScreen(screenX, screenY, screenWidth, screenHeight, camera, allSplatInfos, options);
    }
    resolvePickScreenSize(options, fallback) {
        if (Number.isFinite(options?.screenWidth) && Number.isFinite(options?.screenHeight) && options?.screenWidth > 0 && options?.screenHeight > 0) return {
            width: options?.screenWidth,
            height: options?.screenHeight
        };
        if (fallback && fallback.width > 0 && fallback.height > 0) return fallback;
        return this.ctx.renderer.getSize(new __WEBPACK_EXTERNAL_MODULE_three__.Vector2());
    }
    pickCentersInRect(startX, startY, endX, endY, camera, maxResults = 10000) {
        const canvas = this.ctx.renderer.domElement;
        const allSplatInfos = this.collectAllSplatInfos();
        if (0 === allSplatInfos.length) return [];
        return __WEBPACK_EXTERNAL_MODULE__spatial_CentersPickHandler_js_67c70937__.CentersPickHandler.pickInRect(startX, startY, endX, endY, canvas.clientWidth, canvas.clientHeight, camera, allSplatInfos, maxResults);
    }
    collectAllSplatInfos() {
        const allSplatInfos = [];
        for (const entry of this.ctx.registry.lodGroups.values()){
            const manager = this.getGSplatManager(entry);
            if (manager) allSplatInfos.push(...manager.getActiveSplatInfos());
        }
        return allSplatInfos;
    }
    setColorAdjustment(nodeId, options) {
        const material = this.getMaterialByNodeId(nodeId);
        if (!material) {
            log.warn(`[ModelOperations] setColorAdjustment: nodeId "${nodeId}" not found`);
            return false;
        }
        material.setColorAdjustment(options);
        return true;
    }
    getColorAdjustment(nodeId) {
        const material = this.getMaterialByNodeId(nodeId);
        return material?.getColorAdjustment();
    }
    resetColorAdjustment(nodeId) {
        const material = this.getMaterialByNodeId(nodeId);
        if (!material) {
            log.warn(`[ModelOperations] resetColorAdjustment: nodeId "${nodeId}" not found`);
            return false;
        }
        material.resetColorAdjustment();
        return true;
    }
    setColorSpaceConfig(config) {
        const manager = this.ensureColorSpaceManager();
        manager.setDefaults(config);
        for (const entry of this.ctx.registry.singleFiles.values())entry.mesh.setColorSpaceManager(manager);
    }
    getColorSpaceConfig() {
        if (!this.colorSpaceManager) return;
        return {
            ...this.colorSpaceManager.getDefaults()
        };
    }
    setScalarFilter(nodeId, options) {
        const lodEntry = this.ctx.registry.getLODByNodeId(nodeId);
        if (!lodEntry) {
            log.warn(`[ModelOperations] setScalarFilter: nodeId "${nodeId}" not found or not LOD`);
            return false;
        }
        const manager = this.getGSplatManager(lodEntry);
        if (!manager) return false;
        const mode = SCALAR_TYPE_MAP[options.type] ?? __WEBPACK_EXTERNAL_MODULE__lod_GSplatWorkBuffer_js_77868f4f__.GSplatScalarMode.None;
        if (isScalarFilterDebugEnabled()) log.info(`[ModelOperations][ScalarFilter] setScalarFilter nodeId=${nodeId}, enabled=${options.enabled}, type=${options.type}, mode=${mode}, min=${options.min}, max=${options.max}`);
        manager.setScalarFilter({
            enabled: options.enabled,
            mode,
            min: options.min,
            max: options.max
        });
        return true;
    }
    clearScalarFilter(nodeId) {
        const lodEntry = this.ctx.registry.getLODByNodeId(nodeId);
        if (!lodEntry) {
            log.warn(`[ModelOperations] clearScalarFilter: nodeId "${nodeId}" not found`);
            return false;
        }
        const manager = this.getGSplatManager(lodEntry);
        if (!manager) return false;
        manager.clearScalarFilter();
        return true;
    }
    async getScalarHistogram(nodeId, options) {
        const lodEntry = this.ctx.registry.getLODByNodeId(nodeId);
        if (!lodEntry) {
            log.warn(`[ModelOperations] getScalarHistogram: nodeId "${nodeId}" not found`);
            return null;
        }
        const manager = this.getGSplatManager(lodEntry);
        if (!manager) return null;
        const mode = SCALAR_TYPE_MAP[options.type] ?? __WEBPACK_EXTERNAL_MODULE__lod_GSplatWorkBuffer_js_77868f4f__.GSplatScalarMode.None;
        if (mode === __WEBPACK_EXTERNAL_MODULE__lod_GSplatWorkBuffer_js_77868f4f__.GSplatScalarMode.None) return null;
        const result = manager.getScalarHistogram({
            mode,
            binCount: options.binCount,
            scale: options.scale,
            percentileRange: options.percentileRange
        });
        if (isScalarFilterDebugEnabled() && result) log.info(`[ModelOperations][ScalarFilter] getScalarHistogram nodeId=${nodeId}, type=${options.type}, min=${result.min}, max=${result.max}, sampleCount=${result.sampleCount}`);
        return result;
    }
    setShaderEffect(nodeId, effect) {
        const host = this.getShaderEffectHostByNodeId(nodeId);
        if (!host) {
            log.warn(`[ModelOperations] setShaderEffect: nodeId "${nodeId}" not found`);
            return false;
        }
        return host.setShaderEffect(effect);
    }
    clearShaderEffect(nodeId) {
        const host = this.getShaderEffectHostByNodeId(nodeId);
        if (!host) {
            log.warn(`[ModelOperations] clearShaderEffect: nodeId "${nodeId}" not found`);
            return false;
        }
        return host.clearShaderEffect();
    }
    restartShaderEffect(nodeId) {
        const host = this.getShaderEffectHostByNodeId(nodeId);
        if (!host) {
            log.warn(`[ModelOperations] restartShaderEffect: nodeId "${nodeId}" not found`);
            return false;
        }
        return host.restartShaderEffect();
    }
    setShaderEffectUniform(nodeId, name, value) {
        const host = this.getShaderEffectHostByNodeId(nodeId);
        if (!host) {
            log.warn(`[ModelOperations] setShaderEffectUniform: nodeId "${nodeId}" not found`);
            return false;
        }
        const effect = host.getShaderEffect?.();
        if (effect?.setUniform) return effect.setUniform(name, value);
        const material = this.getMaterialByNodeId(nodeId);
        if (!material) {
            log.warn(`[ModelOperations] setShaderEffectUniform: nodeId "${nodeId}" not found`);
            return false;
        }
        return material.setShaderEffectUniform(name, value);
    }
    setWorkBufferModifier(nodeId, modifier) {
        const lodEntry = this.ctx.registry.getLODByNodeId(nodeId);
        if (!lodEntry) {
            log.warn(`[ModelOperations] setWorkBufferModifier: nodeId "${nodeId}" not found or not LOD`);
            return false;
        }
        return lodEntry.renderMesh.setWorkBufferModifier(modifier);
    }
    setWorkBufferUpdateMode(nodeId, mode) {
        const lodEntry = this.ctx.registry.getLODByNodeId(nodeId);
        if (!lodEntry) {
            log.warn(`[ModelOperations] setWorkBufferUpdateMode: nodeId "${nodeId}" not found or not LOD`);
            return false;
        }
        return lodEntry.renderMesh.setWorkBufferUpdateMode(mode);
    }
    setSelected(nodeId, splatIndices, selected) {
        const lodEntry = this.ctx.registry.getLODByNodeId(nodeId);
        if (!lodEntry) {
            log.warn(`[ModelOperations] setSelected: nodeId "${nodeId}" not found or not LOD`);
            return false;
        }
        const manager = this.getGSplatManager(lodEntry);
        if (!manager) return false;
        for (const splatInfo of manager.getActiveSplatInfos())splatInfo.setSelected(splatIndices, selected);
        return true;
    }
    clearSelection(nodeId) {
        const lodEntry = this.ctx.registry.getLODByNodeId(nodeId);
        if (!lodEntry) return false;
        const manager = this.getGSplatManager(lodEntry);
        if (!manager) return false;
        for (const splatInfo of manager.getActiveSplatInfos())splatInfo.clearSelection();
        return true;
    }
    setCentersDisplayMode(nodeId, mode) {
        const lodEntry = this.ctx.registry.getLODByNodeId(nodeId);
        if (!lodEntry) {
            log.warn(`[ModelOperations] setCentersDisplayMode: nodeId "${nodeId}" not found or not LOD`);
            return false;
        }
        lodEntry.centersDisplayMode = mode;
        switch(mode){
            case 'gaussian-only':
                lodEntry.renderMesh.visible = true;
                lodEntry.centersPoints.visible = false;
                break;
            case 'centers-only':
                lodEntry.renderMesh.visible = false;
                lodEntry.centersPoints.visible = true;
                break;
            case 'gaussian-with-centers':
                lodEntry.renderMesh.visible = true;
                lodEntry.centersPoints.visible = true;
                lodEntry.centersPoints.renderOrder = lodEntry.renderMesh.renderOrder + 1;
                break;
        }
        return true;
    }
    getCentersDisplayMode(nodeId) {
        const lodEntry = this.ctx.registry.getLODByNodeId(nodeId);
        return lodEntry?.centersDisplayMode;
    }
    setCentersStyle(nodeId, style) {
        const lodEntry = this.ctx.registry.getLODByNodeId(nodeId);
        if (!lodEntry) {
            log.warn(`[ModelOperations] setCentersStyle: nodeId "${nodeId}" not found or not LOD`);
            return false;
        }
        if (void 0 !== style.pointSize) lodEntry.centersStyle.pointSize = style.pointSize;
        if (void 0 !== style.selectedColor) lodEntry.centersStyle.selectedColor.copy(style.selectedColor);
        if (void 0 !== style.selectedOpacity) lodEntry.centersStyle.selectedOpacity = style.selectedOpacity;
        if (void 0 !== style.unselectedColor) lodEntry.centersStyle.unselectedColor.copy(style.unselectedColor);
        if (void 0 !== style.unselectedOpacity) lodEntry.centersStyle.unselectedOpacity = style.unselectedOpacity;
        lodEntry.centersPoints.material.setStyle(style);
        return true;
    }
    getCentersStyle(nodeId) {
        const lodEntry = this.ctx.registry.getLODByNodeId(nodeId);
        if (!lodEntry) return;
        return {
            pointSize: lodEntry.centersStyle.pointSize,
            selectedColor: lodEntry.centersStyle.selectedColor.clone(),
            selectedOpacity: lodEntry.centersStyle.selectedOpacity,
            unselectedColor: lodEntry.centersStyle.unselectedColor.clone(),
            unselectedOpacity: lodEntry.centersStyle.unselectedOpacity
        };
    }
    dispose() {
        this.colorSpaceManager = null;
    }
    getShaderEffectHostByNodeId(nodeId) {
        const lodEntry = this.ctx.registry.getLODByNodeId(nodeId);
        if (lodEntry) return lodEntry.renderMesh;
        const singleEntry = this.ctx.registry.getSingleByNodeId(nodeId);
        if (singleEntry) return singleEntry.mesh;
    }
    getMaterialByNodeId(nodeId) {
        const lodEntry = this.ctx.registry.getLODByNodeId(nodeId);
        if (lodEntry) return lodEntry.renderMesh.material;
        const singleEntry = this.ctx.registry.getSingleByNodeId(nodeId);
        if (singleEntry) return singleEntry.mesh.material;
    }
    ensureColorSpaceManager() {
        if (!this.colorSpaceManager) this.colorSpaceManager = new __WEBPACK_EXTERNAL_MODULE__core_ColorSpaceManager_js_6f3faa8f__.ColorSpaceManager(this.ctx.renderer);
        return this.colorSpaceManager;
    }
    getGSplatManager(entry) {
        const director = this.ctx.getDirector();
        const camera = this.ctx.getLastCamera();
        if (!director || !camera) return;
        return director.getManager(camera, entry.layer) ?? void 0;
    }
}
export { ModelOperations };
