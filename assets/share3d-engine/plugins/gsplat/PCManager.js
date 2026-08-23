import * as __WEBPACK_EXTERNAL_MODULE__core_GSplatSogsData_js_cf99e7ef__ from "./core/GSplatSogsData.js";
import * as __WEBPACK_EXTERNAL_MODULE__lod_GSplatDirector_js_c8e25844__ from "./lod/GSplatDirector.js";
import * as __WEBPACK_EXTERNAL_MODULE__lod_Layer_js_651e9bef__ from "./lod/Layer.js";
import * as __WEBPACK_EXTERNAL_MODULE__lod_LayerComposition_js_53962575__ from "./lod/LayerComposition.js";
import * as __WEBPACK_EXTERNAL_MODULE__managers_FrameUpdater_js_a119ff91__ from "./managers/FrameUpdater.js";
import * as __WEBPACK_EXTERNAL_MODULE__managers_ModelLoader_js_a315aedd__ from "./managers/ModelLoader.js";
import * as __WEBPACK_EXTERNAL_MODULE__managers_ModelOperations_js_1b2b9540__ from "./managers/ModelOperations.js";
import * as __WEBPACK_EXTERNAL_MODULE__managers_ModelRegistry_js_7f8ada72__ from "./managers/ModelRegistry.js";
import * as __WEBPACK_EXTERNAL_MODULE__spatial_GSplatPickManager_js_0243191c__ from "./spatial/GSplatPickManager.js";
import * as __WEBPACK_EXTERNAL_MODULE__types_ConfigTypes_js_3b3f1061__ from "./types/ConfigTypes.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_deviceBudget_js_7e08e5b5__ from "./utils/deviceBudget.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__ from "../../shared/logging/index.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__.getLoggerManager)().getLogger('gsplat');
function addLodStat(target, lod, splats, nodes = 0, files = 0) {
    if (!Number.isFinite(lod) || lod < 0) return;
    const bucket = target.get(lod) ?? {
        nodes: 0,
        splats: 0,
        files: 0
    };
    bucket.nodes += nodes;
    bucket.splats += Math.max(0, Math.floor(splats));
    bucket.files += files;
    target.set(lod, bucket);
}
function toLodLevelStats(source) {
    return Array.from(source.entries()).sort(([a], [b])=>a - b).map(([lod, bucket])=>({
            lod,
            nodes: bucket.nodes,
            splats: bucket.splats,
            ...bucket.files > 0 ? {
                files: bucket.files
            } : {}
        }));
}
class PlayCanvasGS3DManager {
    constructor(scene, renderer, config, options){
        this.director = null;
        this.composition = null;
        this.defaultLayer = null;
        this.defaultCameraComponent = null;
        this.disposed = false;
        this.eventListeners = new Map();
        this.scene = scene;
        this.renderer = renderer;
        this.rawLodConfig = {
            ...config ?? {}
        };
        const resolvedConfig = (0, __WEBPACK_EXTERNAL_MODULE__utils_deviceBudget_js_7e08e5b5__.resolveGSplatDeviceBudgetConfig)(__WEBPACK_EXTERNAL_MODULE__types_ConfigTypes_js_3b3f1061__.DEFAULT_LOD_CONFIG, this.rawLodConfig, this.renderer);
        this.lodConfig = resolvedConfig.lodConfig;
        this.deviceBudgetDiagnostics = resolvedConfig.diagnostics;
        this.registry = new __WEBPACK_EXTERNAL_MODULE__managers_ModelRegistry_js_7f8ada72__.ModelRegistry();
        this.loader = new __WEBPACK_EXTERNAL_MODULE__managers_ModelLoader_js_a315aedd__.ModelLoader({
            scene,
            renderer,
            registry: this.registry,
            director: null,
            composition: null,
            initLODSystem: ()=>this.initLODSystem(),
            getLodConfig: ()=>this.lodConfig,
            syncLodConfig: ()=>this.applyLodConfigToRuntime(),
            emit: (event, data)=>this.emit(event, data),
            addForceCpuPick: (nodeId)=>this.frameUpdater.forceCpuPickNodeIds.add(nodeId),
            removeByNodeId: (nodeId)=>this.removeByNodeId(nodeId),
            withCredentials: options?.withCredentials
        });
        this.frameUpdater = new __WEBPACK_EXTERNAL_MODULE__managers_FrameUpdater_js_a119ff91__.FrameUpdater({
            renderer,
            registry: this.registry,
            getDirector: ()=>this.director,
            getComposition: ()=>this.composition,
            ensureCameraRegistered: (camera)=>this.ensureCameraRegistered(camera),
            removeByNodeId: (nodeId)=>this.removeByNodeId(nodeId)
        });
        this.operations = new __WEBPACK_EXTERNAL_MODULE__managers_ModelOperations_js_1b2b9540__.ModelOperations({
            scene,
            renderer,
            registry: this.registry,
            getDirector: ()=>this.director,
            getLastCamera: ()=>this.frameUpdater.lastCamera,
            getAllManagers: ()=>this.getAllManagers()
        });
    }
    initLODSystem() {
        if (null !== this.director) return {
            director: this.director,
            composition: this.composition
        };
        this.director = new __WEBPACK_EXTERNAL_MODULE__lod_GSplatDirector_js_c8e25844__.GSplatDirector(this.renderer, {
            managerOptions: this.createManagerOptionsFromLodConfig()
        });
        this.director.addEventListener('manager:created', (event)=>{
            this.applyLodConfigToManager(event.manager);
        });
        this.composition = new __WEBPACK_EXTERNAL_MODULE__lod_LayerComposition_js_53962575__.LayerComposition();
        this.defaultLayer = new __WEBPACK_EXTERNAL_MODULE__lod_Layer_js_651e9bef__.Layer('default');
        this.defaultLayer.enabled = true;
        this.composition.addLayer(this.defaultLayer);
        return {
            director: this.director,
            composition: this.composition
        };
    }
    ensureCameraRegistered(camera) {
        if (!this.composition) return;
        if (!this.composition.camerasSet.has(camera)) {
            const allLayerIds = this.composition.layerList.map((layer)=>layer.id);
            const cameraComponent = new __WEBPACK_EXTERNAL_MODULE__lod_LayerComposition_js_53962575__.CameraComponent(camera, allLayerIds);
            this.composition.addCamera(cameraComponent);
            this.defaultCameraComponent = cameraComponent;
        }
    }
    dispose() {
        if (this.disposed) return;
        this.disposed = true;
        try {
            for (const nodeId of Array.from(this.registry.nodeIdToClientId.keys()))this.removeByNodeId(nodeId);
            if (this.director) {
                this.director.destroy();
                this.director = null;
            }
            if (this.composition) {
                this.composition.clearLayers();
                this.composition.clearCameras();
                this.composition = null;
            }
            this.defaultLayer = null;
            this.defaultCameraComponent = null;
            this.registry.clear();
            this.loader.dispose();
            this.disposeGpuPicker();
            this.operations.dispose();
            this.frameUpdater.dispose();
            this.eventListeners.clear();
        } finally{
            try {
                (0, __WEBPACK_EXTERNAL_MODULE__core_GSplatSogsData_js_cf99e7ef__.disposeGSplatSogsRenderResources)(this.renderer);
            } catch  {}
            this.scene = null;
            this.renderer = null;
            this.loader = null;
            this.operations = null;
            this.frameUpdater = null;
        }
    }
    async load(url, options) {
        return this.loader.load(url, options);
    }
    remove(group) {
        const nodeId = this.registry.extractNodeId(group);
        if (!nodeId) {
            log.warn('[PlayCanvasGS3DManager] remove: 无法从 group 对象中提取 nodeId');
            return false;
        }
        return this.removeByNodeId(nodeId);
    }
    removeByNodeId(nodeId) {
        const clientId = this.registry.resolveClientId(nodeId);
        if (!clientId) return false;
        const lodEntry = this.registry.lodGroups.get(clientId);
        if (lodEntry) {
            this.scene.remove(lodEntry.rootNode);
            if (lodEntry.boxHelper) this.scene.remove(lodEntry.boxHelper);
            if (lodEntry.renderMesh) lodEntry.renderMesh.dispose();
            if (lodEntry.centersPoints) lodEntry.centersPoints.dispose();
            if (this.composition) this.composition.removeLayer(lodEntry.layer);
            lodEntry.octree.destroy();
            this.registry.unregisterLOD(clientId);
            this.frameUpdater.clearTracker(nodeId);
            return true;
        }
        const singleEntry = this.registry.singleFiles.get(clientId);
        if (singleEntry) {
            if (singleEntry.mesh.parent) singleEntry.mesh.parent.remove(singleEntry.mesh);
            singleEntry.mesh.dispose();
            this.registry.unregisterSingle(clientId);
            return true;
        }
        return false;
    }
    removeByUrl(url) {
        const clientId = this.registry.urlToClientId.get(url);
        if (!clientId) return false;
        const lodEntry = this.registry.lodGroups.get(clientId);
        if (lodEntry) return this.removeByNodeId(lodEntry.nodeId);
        const singleEntry = this.registry.singleFiles.get(clientId);
        if (singleEntry) return this.removeByNodeId(singleEntry.nodeId);
        return false;
    }
    getByNodeId(nodeId) {
        return this.registry.getByNodeId(nodeId);
    }
    getByUrl(url) {
        return this.registry.getByUrl(url);
    }
    getAll() {
        return this.registry.getAll();
    }
    hasByNodeId(nodeId) {
        return this.registry.hasByNodeId(nodeId);
    }
    hasByUrl(url) {
        return this.registry.hasByUrl(url);
    }
    isLoading(url) {
        return this.registry.isLoading(url);
    }
    getAllNodeIds() {
        return this.registry.getAllNodeIds();
    }
    setNodeId(group, nodeId) {
        return this.registry.setNodeId(group, nodeId);
    }
    setVisible(nodeId, visible) {
        const clientId = this.registry.resolveClientId(nodeId);
        if (!clientId) {
            log.warn(`[PlayCanvasGS3DManager] setVisible: nodeId "${nodeId}" not found`);
            return false;
        }
        const lodEntry = this.registry.lodGroups.get(clientId);
        if (lodEntry) {
            lodEntry.rootNode.visible = visible;
            if (this.director && this.frameUpdater.lastCamera) {
                const manager = this.director.getManager(this.frameUpdater.lastCamera, lodEntry.layer);
                if (manager) {
                    const octreeInstance = manager.octreeInstances.get(lodEntry.placement);
                    if (octreeInstance) {
                        octreeInstance.visible = visible;
                        if (visible) {
                            manager.layerPlacementsDirty = true;
                            manager.framesTillFullUpdate = 0;
                            __WEBPACK_EXTERNAL_MODULE__spatial_GSplatPickManager_js_0243191c__.GSplatPickManager.clearGpuPickerLodVersion(manager);
                            this.frameUpdater.forceCpuPickNodeIds.add(nodeId);
                            this.frameUpdater.initStabilityTracker(nodeId, manager);
                        }
                    }
                }
            }
            lodEntry.layer.gsplatPlacementsDirty = true;
            if (visible) {
                const index = this.frameUpdater.hiddenModelsCache.indexOf(nodeId);
                if (-1 !== index) this.frameUpdater.hiddenModelsCache.splice(index, 1);
            } else {
                if (!this.frameUpdater.hiddenModelsCache.includes(nodeId)) this.frameUpdater.hiddenModelsCache.push(nodeId);
                this.frameUpdater.clearTracker(nodeId);
            }
            return true;
        }
        const singleEntry = this.registry.singleFiles.get(clientId);
        if (singleEntry) {
            singleEntry.mesh.visible = visible;
            return true;
        }
        return false;
    }
    setSceneOrigin(nodeId, origin) {
        const clientId = this.registry.resolveClientId(nodeId);
        if (!clientId) {
            log.warn(`[PlayCanvasGS3DManager] setSceneOrigin: nodeId "${nodeId}" not found`);
            return false;
        }
        const lodEntry = this.registry.lodGroups.get(clientId);
        if (lodEntry) {
            if (origin) {
                const originCopy = origin.clone();
                lodEntry.rootNode.__sceneOriginOverride = originCopy;
                if ('function' == typeof lodEntry.renderMesh.setSceneOriginOverride) lodEntry.renderMesh.setSceneOriginOverride(originCopy);
            } else {
                delete lodEntry.rootNode.__sceneOriginOverride;
                if ('function' == typeof lodEntry.renderMesh.setSceneOriginOverride) lodEntry.renderMesh.setSceneOriginOverride(null);
            }
            lodEntry.layer.gsplatPlacementsDirty = true;
            return true;
        }
        const singleEntry = this.registry.singleFiles.get(clientId);
        if (singleEntry) {
            singleEntry.mesh.setSceneOriginOverride(origin ?? null);
            return true;
        }
        return false;
    }
    getBoundingBoxByNodeId(nodeId) {
        return this.operations.getBoundingBoxByNodeId(nodeId);
    }
    getCombinedBoundingBox() {
        return this.operations.getCombinedBoundingBox();
    }
    setBoxHelperVisible(visible, nodeIds) {
        this.operations.setBoxHelperVisible(visible, nodeIds);
    }
    update(camera, rendererOrOptions) {
        const logicalFrame = this.resolveLogicalFrame(rendererOrOptions);
        if (logicalFrame) this.frameUpdater.update(camera, logicalFrame.id, logicalFrame.source);
        else this.frameUpdater.update(camera);
        const delta = this.resolveShaderEffectDelta(rendererOrOptions);
        if (null !== delta) this.frameUpdater.updateShaderEffects(delta);
    }
    advanceShaderEffects(delta = 0) {
        this.frameUpdater.updateShaderEffects(delta);
    }
    resolveShaderEffectDelta(rendererOrOptions) {
        if ('number' == typeof rendererOrOptions) return Number.isFinite(rendererOrOptions) ? Math.max(0, rendererOrOptions) : 0;
        if (rendererOrOptions && 'object' == typeof rendererOrOptions) {
            const options = rendererOrOptions;
            const rawDelta = 'number' == typeof options.effectDelta ? options.effectDelta : options.delta;
            if ('number' == typeof rawDelta) return Number.isFinite(rawDelta) ? Math.max(0, rawDelta) : 0;
        }
        return null;
    }
    resolveLogicalFrame(rendererOrOptions) {
        if (!rendererOrOptions || 'object' != typeof rendererOrOptions) return null;
        const options = rendererOrOptions;
        if ('number' != typeof options.logicalFrameId || !Number.isFinite(options.logicalFrameId)) return null;
        return {
            id: Math.floor(options.logicalFrameId),
            source: null !== options.logicalFrameSource && ('object' == typeof options.logicalFrameSource || 'function' == typeof options.logicalFrameSource) ? options.logicalFrameSource : this
        };
    }
    setConfig(config) {
        this.mergeRawLodConfig(config);
        this.recomputeLodConfig();
        this.applyLodConfigToRuntime();
    }
    mergeRawLodConfig(config) {
        for (const [key, value] of Object.entries(config))if (void 0 === value) delete this.rawLodConfig[key];
        else this.rawLodConfig[String(key)] = value;
    }
    recomputeLodConfig() {
        const resolvedConfig = (0, __WEBPACK_EXTERNAL_MODULE__utils_deviceBudget_js_7e08e5b5__.resolveGSplatDeviceBudgetConfig)(__WEBPACK_EXTERNAL_MODULE__types_ConfigTypes_js_3b3f1061__.DEFAULT_LOD_CONFIG, this.rawLodConfig, this.renderer);
        this.lodConfig = resolvedConfig.lodConfig;
        this.deviceBudgetDiagnostics = resolvedConfig.diagnostics;
    }
    applyLodConfigToRuntime() {
        this.loader.syncConfig();
        this.director?.setManagerOptions(this.createManagerOptionsFromLodConfig());
        for (const entry of this.registry.lodGroups.values()){
            this.applyLodConfigToPlacement(entry.placement);
            entry.placement.splatBudget = Math.max(1, Math.min(entry.totalPointCount, this.lodConfig.maxCachePoints));
            entry.layer.gsplatPlacementsDirty = true;
            if (entry.octree.assetLoader) entry.octree.assetLoader.maxConcurrentLoads = this.lodConfig.maxConcurrentLoads;
        }
        for (const manager of this.getAllManagers()){
            this.applyLodConfigToManager(manager);
            manager.params.dirty = true;
            manager.layerPlacementsDirty = true;
            manager.sortNeeded = true;
            manager.framesTillFullUpdate = 0;
        }
    }
    getConfig() {
        const config = {
            ...this.lodConfig
        };
        if (this.lodConfig.deviceBudget) config.deviceBudget = {
            ...this.lodConfig.deviceBudget
        };
        if (this.lodConfig.interactiveSortScheduler) config.interactiveSortScheduler = {
            ...this.lodConfig.interactiveSortScheduler
        };
        return config;
    }
    getDeviceBudgetDiagnostics() {
        return (0, __WEBPACK_EXTERNAL_MODULE__utils_deviceBudget_js_7e08e5b5__.cloneGSplatDeviceBudgetDiagnostics)(this.deviceBudgetDiagnostics);
    }
    getStats() {
        let visibleNodes = 0;
        let loadedNodes = 0;
        let cachedPoints = 0;
        let pendingLoads = 0;
        let activeLoads = 0;
        let requestedLoads = 0;
        let failedLoads = 0;
        let renderedSplats = 0;
        let activeSplats = 0;
        let texturePixels = 0;
        let pendingLodChanges = 0;
        let activePlacements = 0;
        let lodPresentationPending = false;
        let budgetScaleSum = 0;
        let budgetScaleCount = 0;
        let globalMaxDistance = 0;
        let adjustedBudget = 0;
        let paddingEstimate = 0;
        let rawOptimalSplats = 0;
        let budgetTextureWidth = 0;
        let cameraAspect = 0;
        const cachedResources = new Set();
        const observedOctrees = new Set();
        const loadedLods = new Map();
        const currentLods = new Map();
        const optimalLods = new Map();
        if (this.director) for (const manager of this.director.getAllManagers()){
            const managerTextureSize = manager.textureSize;
            const sortedWorldState = manager.worldStates.get(manager.sortedVersion);
            texturePixels += managerTextureSize * managerTextureSize;
            renderedSplats += manager.visibleSplatCount;
            activeSplats += sortedWorldState?.totalActiveSplats ?? 0;
            pendingLoads += manager.loadingCount;
            lodPresentationPending ||= manager.lodPresentationPending;
            const budgetDiagnostics = manager.budgetRuntimeDiagnostics;
            budgetScaleSum += budgetDiagnostics.budgetScale;
            budgetScaleCount++;
            globalMaxDistance = Math.max(globalMaxDistance, budgetDiagnostics.globalMaxDistance);
            adjustedBudget += budgetDiagnostics.adjustedBudget;
            paddingEstimate += budgetDiagnostics.paddingEstimate;
            rawOptimalSplats += budgetDiagnostics.rawOptimalSplats;
            budgetTextureWidth = Math.max(budgetTextureWidth, budgetDiagnostics.budgetTextureWidth);
            cameraAspect = budgetDiagnostics.cameraAspect || cameraAspect;
            for (const instance of manager.octreeInstances.values()){
                activeLoads += instance.activePendingLoadCount;
                activePlacements += instance.activePlacements.size;
                if (!observedOctrees.has(instance.octree)) {
                    observedOctrees.add(instance.octree);
                    const loaderStatus = instance.octree.assetLoader?.getStatus?.();
                    requestedLoads += loaderStatus?.total ?? 0;
                    failedLoads += loaderStatus?.failed ?? 0;
                }
                for(let nodeIndex = 0; nodeIndex < instance.nodeInfos.length; nodeIndex++){
                    const info = instance.nodeInfos[nodeIndex];
                    const node = instance.octree.nodes[nodeIndex];
                    if (info.currentLod >= 0) {
                        visibleNodes++;
                        addLodStat(currentLods, info.currentLod, node?.lods[info.currentLod]?.count ?? 0, 1);
                    }
                    const optimalFileIndex = info.optimalLod >= 0 ? node?.lods[info.optimalLod]?.fileIndex ?? -1 : -1;
                    const optimalResourceFailed = optimalFileIndex >= 0 && instance.octree.isFileFailed(optimalFileIndex);
                    if (info.optimalLod >= 0 && info.currentLod !== info.optimalLod && !optimalResourceFailed) pendingLodChanges++;
                    if (info.optimalLod >= 0) addLodStat(optimalLods, info.optimalLod, node?.lods[info.optimalLod]?.count ?? 0, 1);
                }
                for (const [fileIndex, resource] of instance.octree.fileResources)if (!cachedResources.has(resource)) {
                    cachedResources.add(resource);
                    cachedPoints += resource.numSplats;
                    const lod = instance.octree.files[fileIndex]?.lodLevel ?? -1;
                    addLodStat(loadedLods, lod, resource.numSplats, 0, 1);
                }
                const environmentResource = instance.octree.environmentResource;
                if (environmentResource && !cachedResources.has(environmentResource)) {
                    cachedResources.add(environmentResource);
                    cachedPoints += environmentResource.numSplats;
                }
            }
        }
        loadedNodes = cachedResources.size;
        return {
            totalGroups: this.registry.lodGroups.size + this.registry.singleFiles.size,
            visibleNodes,
            loadedNodes,
            cachedPoints,
            pendingLoads,
            activeLoads,
            cachedFiles: loadedNodes,
            requestedLoads,
            failedLoads,
            renderedSplats,
            activeSplats,
            texturePixels,
            pendingLodChanges,
            activePlacements,
            lodPresentationPending,
            loadedLods: toLodLevelStats(loadedLods),
            currentLods: toLodLevelStats(currentLods),
            optimalLods: toLodLevelStats(optimalLods),
            budgetScale: budgetScaleCount > 0 ? budgetScaleSum / budgetScaleCount : void 0,
            globalMaxDistance,
            adjustedBudget,
            paddingEstimate,
            rawOptimalSplats,
            budgetTextureWidth,
            cameraAspect
        };
    }
    on(event, callback) {
        if (!this.eventListeners.has(event)) this.eventListeners.set(event, new Set());
        this.eventListeners.get(event).add(callback);
    }
    off(event, callback) {
        const listeners = this.eventListeners.get(event);
        if (listeners) listeners.delete(callback);
    }
    emit(event, data) {
        const listeners = this.eventListeners.get(event);
        if (listeners) for (const callback of listeners)try {
            callback(data);
        } catch (error) {
            log.error(`[PlayCanvasGS3DManager] Error in ${event} listener: ` + (error instanceof Error ? error.message : String(error)));
        }
    }
    getDirector() {
        return this.director;
    }
    getComposition() {
        return this.composition;
    }
    getManager(camera, layer) {
        if (!this.director) return null;
        return this.director.getManager(camera, layer ?? this.defaultLayer);
    }
    getAllManagers() {
        if (!this.director) return [];
        return this.director.getAllManagers();
    }
    getVisualActivitySnapshot() {
        const reasons = [];
        for (const manager of this.getAllManagers()){
            const activity = manager.getVisualActivitySnapshot();
            if (activity.needsNextFrame) reasons.push(...activity.reasons);
        }
        return {
            needsNextFrame: reasons.length > 0,
            reasons: Array.from(new Set(reasons))
        };
    }
    applyLodConfigToManager(manager) {
        const params = manager.params;
        const config = this.lodConfig;
        manager.setOrderUploadSchedulerOptions(this.createOrderUploadSchedulerOptions());
        if ('number' == typeof config.maxCachePoints) params.maxCachePoints = Math.max(0, Math.floor(config.maxCachePoints));
        if ('number' == typeof config.lodUpdateDistance) params.lodUpdateDistance = Math.max(0, config.lodUpdateDistance);
        if ('number' == typeof config.lodUpdateAngle) params.lodUpdateAngle = Math.max(0, config.lodUpdateAngle);
        if ('number' == typeof config.lodBehindPenalty) params.lodBehindPenalty = Math.max(1, config.lodBehindPenalty);
        if ('number' == typeof config.lodRangeMin) params.lodRangeMin = Math.max(0, Math.floor(config.lodRangeMin));
        if ('number' == typeof config.lodRangeMax) params.lodRangeMax = Math.max(0, Math.floor(config.lodRangeMax));
        if ('number' == typeof config.lodUnderfillLimit) params.lodUnderfillLimit = Math.max(0, Math.floor(config.lodUnderfillLimit));
        if ('number' == typeof config.maxLoadsPerFrame) params.maxLoadsPerFrame = Math.max(0, Math.floor(config.maxLoadsPerFrame));
        if ('boolean' == typeof config.radialSorting) params.radialSorting = config.radialSorting;
        if ('boolean' == typeof config.sortVisibilityCompact) params.sortVisibilityCompact = config.sortVisibilityCompact;
        if ('number' == typeof config.sortVisibilityBehindMargin) params.sortVisibilityBehindMargin = config.sortVisibilityBehindMargin;
        if ('number' == typeof config.sortVisibilityRotationRefreshAngle) params.sortVisibilityRotationRefreshAngle = config.sortVisibilityRotationRefreshAngle;
        if ('boolean' == typeof config.sortVisibilityScreenCompact) params.sortVisibilityScreenCompact = config.sortVisibilityScreenCompact;
        if ('number' == typeof config.sortVisibilityScreenMargin) params.sortVisibilityScreenMargin = config.sortVisibilityScreenMargin;
        if ('number' == typeof config.worldStateUpdateInterval) params.worldStateUpdateInterval = Math.max(0, Math.floor(config.worldStateUpdateInterval));
    }
    applyLodConfigToPlacement(placement) {
        const config = this.lodConfig;
        if ('number' == typeof config.lodBaseDistance) placement.lodBaseDistance = config.lodBaseDistance;
        if ('number' == typeof config.lodMultiplier) placement.lodMultiplier = config.lodMultiplier;
    }
    createManagerOptionsFromLodConfig() {
        return {
            orderUploadScheduler: this.createOrderUploadSchedulerOptions(),
            interactiveSortScheduler: this.lodConfig.interactiveSortScheduler,
            onSortResultReady: ()=>this.emit('sortReady', {})
        };
    }
    createOrderUploadSchedulerOptions() {
        const config = this.lodConfig;
        const options = {};
        if (config.orderUploadMode) options.orderUploadMode = config.orderUploadMode;
        if ('number' == typeof config.minOrderUploadIntervalMs) options.minOrderUploadIntervalMs = config.minOrderUploadIntervalMs;
        if ('number' == typeof config.maxOrderUploadDelayMs) options.maxOrderUploadDelayMs = config.maxOrderUploadDelayMs;
        if ('number' == typeof config.maxImmediateOrderUploadBytes) options.maxImmediateOrderUploadBytes = config.maxImmediateOrderUploadBytes;
        if ('number' == typeof config.maxOrderUploadBytesPerFrame) options.maxOrderUploadBytesPerFrame = config.maxOrderUploadBytesPerFrame;
        if ('number' == typeof config.maxOrderUploadChunksPerFrame) options.maxOrderUploadChunksPerFrame = config.maxOrderUploadChunksPerFrame;
        if (config.firstOrderUploadMode) options.firstOrderUploadMode = config.firstOrderUploadMode;
        if ('boolean' == typeof config.allowFirstOrderFallback) options.allowFirstOrderFallback = config.allowFirstOrderFallback;
        if ('boolean' == typeof config.allowOrderUploadFullFallback) options.allowFullUploadFallback = config.allowOrderUploadFullFallback;
        return options;
    }
    pick(ray, camera, options) {
        return this.operations.pick(ray, camera, this.frameUpdater.forceCpuPickNodeIds, options);
    }
    pickFromScreen(screenX, screenY, camera, options) {
        return this.operations.pickFromScreen(screenX, screenY, camera, this.frameUpdater.forceCpuPickNodeIds, options);
    }
    disposeGpuPicker() {
        this.operations.disposeGpuPicker();
    }
    clearGpuPickerLodVersions() {
        this.operations.clearGpuPickerLodVersions();
    }
    setColorAdjustment(nodeId, options) {
        return this.operations.setColorAdjustment(nodeId, options);
    }
    getColorAdjustment(nodeId) {
        return this.operations.getColorAdjustment(nodeId);
    }
    resetColorAdjustment(nodeId) {
        return this.operations.resetColorAdjustment(nodeId);
    }
    setScalarFilter(nodeId, options) {
        return this.operations.setScalarFilter(nodeId, options);
    }
    clearScalarFilter(nodeId) {
        return this.operations.clearScalarFilter(nodeId);
    }
    setShaderEffect(nodeId, effect) {
        return this.operations.setShaderEffect(nodeId, effect);
    }
    clearShaderEffect(nodeId) {
        return this.operations.clearShaderEffect(nodeId);
    }
    restartShaderEffect(nodeId) {
        return this.operations.restartShaderEffect(nodeId);
    }
    setShaderEffectUniform(nodeId, name, value) {
        return this.operations.setShaderEffectUniform(nodeId, name, value);
    }
    setWorkBufferModifier(nodeId, modifier) {
        return this.operations.setWorkBufferModifier(nodeId, modifier);
    }
    setWorkBufferUpdateMode(nodeId, mode) {
        return this.operations.setWorkBufferUpdateMode(nodeId, mode);
    }
    async getScalarHistogram(nodeId, options) {
        return this.operations.getScalarHistogram(nodeId, options);
    }
    setColorSpaceConfig(config) {
        this.operations.setColorSpaceConfig(config);
    }
    getColorSpaceConfig() {
        return this.operations.getColorSpaceConfig();
    }
    setSelected(nodeId, splatIndices, selected) {
        return this.operations.setSelected(nodeId, splatIndices, selected);
    }
    clearSelection(nodeId) {
        return this.operations.clearSelection(nodeId);
    }
    pickCenter(screenX, screenY, camera, options) {
        return this.operations.pickCenter(screenX, screenY, camera, options);
    }
    pickCentersInRect(startX, startY, endX, endY, camera, maxResults = 10000) {
        return this.operations.pickCentersInRect(startX, startY, endX, endY, camera, maxResults);
    }
    setCentersDisplayMode(nodeId, mode) {
        return this.operations.setCentersDisplayMode(nodeId, mode);
    }
    getCentersDisplayMode(nodeId) {
        return this.operations.getCentersDisplayMode(nodeId);
    }
    setCentersStyle(nodeId, style) {
        return this.operations.setCentersStyle(nodeId, style);
    }
    getCentersStyle(nodeId) {
        return this.operations.getCentersStyle(nodeId);
    }
}
const PCManager_rslib_entry_ = PlayCanvasGS3DManager;
export { PlayCanvasGS3DManager, PCManager_rslib_entry_ as default };
