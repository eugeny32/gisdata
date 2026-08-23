import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__spatial_GSplatGpuPicker_js_d2c541af__ from "../spatial/GSplatGpuPicker.js";
import * as __WEBPACK_EXTERNAL_MODULE__spatial_GSplatPickManager_js_54e2b077__ from "../spatial/GSplatPickManager.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__ModelLoader_js_5bba45fb__ from "./ModelLoader.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('gsplat');
class FrameUpdater {
    constructor(ctx){
        this.ctx = ctx;
        this._lastCamera = null;
        this.forceCpuPickNodeIds = new Set();
        this.lodStabilityTracker = new Map();
        this.hiddenModelsCache = [];
        this.frameCounter = 0;
        this.logicalFrameId = 0;
        this.gpuPickerLastPreparedKey = '';
        this.gpuPickerLastSeenKey = '';
        this.gpuPickerStableFrames = 0;
        this.gpuPickerPreheatPending = false;
        this.CACHE_CHECK_INTERVAL = 1800;
        this.hiddenModelsCacheLimit = 1;
        this._firstFrameEnd = null;
        this._firstFrameStarted = false;
    }
    get lastCamera() {
        return this._lastCamera;
    }
    update(camera, frameId, frameSource) {
        if (!this._firstFrameStarted) {
            this._firstFrameStarted = true;
            this._firstFrameEnd = log.perf.time('firstFrame');
        }
        __WEBPACK_EXTERNAL_MODULE__spatial_GSplatGpuPicker_js_d2c541af__.GSplatGpuPicker.incrementFrameId();
        this._lastCamera = camera;
        camera.updateMatrixWorld(true);
        this.ctx.ensureCameraRegistered(camera);
        const director = this.ctx.getDirector();
        const composition = this.ctx.getComposition();
        if (director && composition) {
            const logicalFrameId = 'number' == typeof frameId && Number.isFinite(frameId) ? Math.floor(frameId) : ++this.logicalFrameId;
            director.update(composition, logicalFrameId, frameSource ?? this);
        }
        this.checkLODLoadingComplete();
        this.checkLODStability();
        this.tryPreheatGpuPicker(camera);
        this.frameCounter++;
        if (this.frameCounter >= this.CACHE_CHECK_INTERVAL) {
            this.frameCounter = 0;
            this.checkAndCleanHiddenModelsCache();
        }
    }
    updateShaderEffects(delta = 0) {
        for (const entry of this.ctx.registry.singleFiles.values())entry.mesh.updateShaderEffect(delta);
        for (const entry of this.ctx.registry.lodGroups.values())entry.renderMesh.updateShaderEffect(delta);
    }
    initStabilityTracker(nodeId, manager) {
        this.lodStabilityTracker.set(nodeId, {
            lastVersion: manager.sortedVersion,
            stableFrames: 0
        });
    }
    clearTracker(nodeId) {
        this.forceCpuPickNodeIds.delete(nodeId);
        this.lodStabilityTracker.delete(nodeId);
    }
    dispose() {
        this._lastCamera = null;
        this.forceCpuPickNodeIds.clear();
        this.lodStabilityTracker.clear();
        this.hiddenModelsCache.length = 0;
        this.frameCounter = 0;
        this.logicalFrameId = 0;
        this.gpuPickerLastPreparedKey = '';
        this.gpuPickerLastSeenKey = '';
        this.gpuPickerStableFrames = 0;
        this.gpuPickerPreheatPending = false;
    }
    checkLODLoadingComplete() {
        const director = this.ctx.getDirector();
        if (!director || !this._lastCamera) return;
        for (const [, entry] of this.ctx.registry.lodGroups.entries()){
            if (!entry.onLoadCompleteCallback || entry.loadCompleteCallbackFired) continue;
            const manager = director.getManager(this._lastCamera, entry.layer);
            if (!manager) continue;
            const currentLoadingCount = manager.loadingCount;
            if (void 0 === entry.lastLoadingCount) {
                if (0 === currentLoadingCount) this.fireLODLoadComplete(entry);
                else entry.lastLoadingCount = currentLoadingCount;
                continue;
            }
            if (entry.lastLoadingCount > 0 && 0 === currentLoadingCount) this.fireLODLoadComplete(entry);
            entry.lastLoadingCount = currentLoadingCount;
        }
    }
    fireLODLoadComplete(entry) {
        const result = {
            type: 'lod',
            id: entry.nodeId,
            boundingBox: (0, __WEBPACK_EXTERNAL_MODULE__ModelLoader_js_5bba45fb__.convertBox3ToBoundingBox)(entry.boundingBox),
            numSplats: entry.totalPointCount,
            environmentUrl: entry.octree.environmentUrl,
            environmentConfigured: null !== entry.octree.environmentUrl,
            _raw: entry
        };
        try {
            entry.onLoadCompleteCallback(result);
        } catch (error) {
            log.error('[FrameUpdater] onLoadComplete 回调执行出错: ' + (error instanceof Error ? error.message : String(error)));
        }
        if (this._firstFrameEnd) {
            this._firstFrameEnd();
            this._firstFrameEnd = null;
        }
        entry.loadCompleteCallbackFired = true;
        this.forceCpuPickNodeIds.delete(entry.nodeId);
    }
    checkLODStability() {
        const director = this.ctx.getDirector();
        if (!director || !this._lastCamera) return;
        for (const [nodeId, tracker] of Array.from(this.lodStabilityTracker.entries())){
            const clientId = this.ctx.registry.resolveClientId(nodeId);
            if (!clientId) {
                this.lodStabilityTracker.delete(nodeId);
                continue;
            }
            const lodEntry = this.ctx.registry.lodGroups.get(clientId);
            if (!lodEntry) {
                this.lodStabilityTracker.delete(nodeId);
                continue;
            }
            const manager = director.getManager(this._lastCamera, lodEntry.layer);
            if (!manager) continue;
            const currentVersion = manager.sortedVersion;
            const loadingCount = manager.loadingCount;
            if (currentVersion === tracker.lastVersion && 0 === loadingCount) {
                tracker.stableFrames++;
                if (tracker.stableFrames >= 60) {
                    this.forceCpuPickNodeIds.delete(nodeId);
                    this.lodStabilityTracker.delete(nodeId);
                }
            } else {
                tracker.lastVersion = currentVersion;
                tracker.stableFrames = 0;
            }
        }
    }
    tryPreheatGpuPicker(camera) {
        const director = this.ctx.getDirector();
        if (!director || !this.ctx.renderer) return;
        const allSplatInfos = [];
        let primaryManager = null;
        let combinedVersion = 0;
        for (const [, entry] of this.ctx.registry.lodGroups.entries()){
            const m = director.getManager(camera, entry.layer);
            if (!m) continue;
            const infos = m.getActiveSplatInfos();
            if (0 !== infos.length) {
                if (!primaryManager) primaryManager = m;
                allSplatInfos.push(...infos);
                combinedVersion += m.pickStateVersion;
            }
        }
        if (!primaryManager || 0 === allSplatInfos.length) return;
        const preheatKey = this.buildGpuPickerPreheatKey(camera, combinedVersion);
        if (preheatKey === this.gpuPickerLastPreparedKey) return;
        if (preheatKey !== this.gpuPickerLastSeenKey) {
            this.gpuPickerLastSeenKey = preheatKey;
            this.gpuPickerStableFrames = 0;
            return;
        }
        this.gpuPickerStableFrames++;
        if (this.gpuPickerStableFrames < 3 || this.gpuPickerPreheatPending) return;
        this.gpuPickerPreheatPending = true;
        const keySnapshot = preheatKey;
        const renderer = this.ctx.renderer;
        const cameraRef = camera;
        const managerRef = primaryManager;
        const splatInfosRef = allSplatInfos;
        setTimeout(()=>{
            this.gpuPickerPreheatPending = false;
            if (this.gpuPickerLastSeenKey !== keySnapshot) return;
            try {
                const gpuPicker = __WEBPACK_EXTERNAL_MODULE__spatial_GSplatPickManager_js_54e2b077__.GSplatPickManager.getGpuPicker(renderer);
                gpuPicker.prepare(cameraRef, managerRef, splatInfosRef);
                this.gpuPickerLastPreparedKey = keySnapshot;
                this.gpuPickerStableFrames = 0;
            } catch (error) {
                log.warn('[FrameUpdater] GPU Picker 预热失败: ' + (error instanceof Error ? error.message : String(error)));
            }
        }, 0);
    }
    buildGpuPickerPreheatKey(camera, combinedVersion) {
        camera.updateMatrixWorld(true);
        const size = this.ctx.renderer.getSize(new __WEBPACK_EXTERNAL_MODULE_three__.Vector2());
        return `${combinedVersion}|${size.x}x${size.y}|${this.serializeMatrix(camera.matrixWorld)}|${this.serializeMatrix(camera.projectionMatrix)}`;
    }
    serializeMatrix(matrix) {
        return matrix.elements.map((value)=>Math.round(1e6 * value)).join(',');
    }
    checkAndCleanHiddenModelsCache() {
        if (0 === this.hiddenModelsCache.length) return;
        while(this.hiddenModelsCache.length > this.hiddenModelsCacheLimit){
            const nodeId = this.hiddenModelsCache.shift();
            if (!nodeId) break;
            const clientId = this.ctx.registry.resolveClientId(nodeId);
            if (!clientId) continue;
            const lodEntry = this.ctx.registry.lodGroups.get(clientId);
            if (lodEntry && !lodEntry.rootNode.visible) this.ctx.removeByNodeId(nodeId);
        }
    }
}
export { FrameUpdater };
