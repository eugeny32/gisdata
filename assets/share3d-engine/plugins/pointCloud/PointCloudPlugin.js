import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__core_PointCloudOctree_js_44b9d91d__ from "./core/PointCloudOctree.js";
import * as __WEBPACK_EXTERNAL_MODULE__core_UpdateVisibility_js_5a00b8e8__ from "./core/UpdateVisibility.js";
import * as __WEBPACK_EXTERNAL_MODULE__loaders_createOctreeLoaderDeps_js_431413fb__ from "./loaders/createOctreeLoaderDeps.js";
import * as __WEBPACK_EXTERNAL_MODULE__PointCloudResidencyManager_js_48e1b7d2__ from "./PointCloudResidencyManager.js";
import * as __WEBPACK_EXTERNAL_MODULE__rendering_PotreeRenderer_js_6970b43d__ from "./rendering/PotreeRenderer.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__ from "../../shared/constants/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__ from "../../shared/logging/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_c632c149__ from "../../shared/types/assets.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_utils_index_js_83ff7f8f__ from "../../shared/utils/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__loaders_PotreeV2Loader_js_bd90c233__ from "./loaders/PotreeV2Loader.js";
import * as __WEBPACK_EXTERNAL_MODULE__PointCloudHandle_js_82f806b9__ from "./PointCloudHandle.js";
import * as __WEBPACK_EXTERNAL_MODULE__PointCloudRenderBackend_js_28c4eaf8__ from "./PointCloudRenderBackend.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__.getLoggerManager)().getLogger('pointcloud');
const diagnosticsLog = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__.getLoggerManager)().getLogger('pointcloud:diagnostics');
const memoryLog = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__.getLoggerManager)().getLogger('pointcloud:memory');
const POINTCLOUD_VISIBILITY_SLOW_MS = 8;
const RESIDENCY_SNAPSHOT_INTERVAL_MS = 15000;
const RESIDENCY_DELTA_COUNTER_KEYS = [
    'loadStartedCount',
    'initialLoadStartedCount',
    'retryStartedCount',
    'reloadStartedCount',
    'loadCompletedCount',
    'structuralCompletedCount',
    'loadFailedCount',
    'loadAbortedCount',
    'lateResultDroppedCount'
];
function createClipState(clipTask) {
    return {
        clipBoxes: [],
        clipPolygons: [],
        clipTask
    };
}
class FormatNotSupportedError extends Error {
    constructor(url){
        super(`无法加载 "${url}"：仅支持 potree-v2 (metadata.json) 格式`);
        this.name = 'FormatNotSupportedError';
        this.url = url;
    }
}
const DEFAULT_CONFIG = {
    renderStrategy: 'default',
    useEDL: false,
    edlStrength: 1.0,
    edlRadius: 1.4,
    edlOpacity: 1.0,
    useHQ: false,
    pointSize: 2,
    pointSizeType: 0,
    pointShape: 0,
    activeAttributeName: 'rgba',
    minNodeSize: 30,
    showBoundingBox: false,
    clipTask: __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.ClipTask.HIGHLIGHT,
    clipMethod: 0,
    classifications: {},
    elevationGradientRepeat: 1,
    isFlipYZ: false
};
class PointCloudPlugin {
    constructor(options = {}){
        this.name = 'pointCloud';
        this.kind = 'pointCloud';
        this.priority = 40;
        this.phases = [
            __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_c632c149__.RenderPhase.Prepare,
            __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_c632c149__.RenderPhase.MainOpaque
        ];
        this.dependencies = [
            'CameraRig',
            'RenderPipeline',
            'PickingService'
        ];
        this.provides = [
            'PointCloudService'
        ];
        this.records = new Map();
        this.pendingLoads = new Map();
        this.disposed = false;
        this.residency = null;
        this.sourceClipVolumes = [];
        this.globalClipState = createClipState(DEFAULT_CONFIG.clipTask);
        this.config = {
            ...DEFAULT_CONFIG
        };
        this.renderBackend = null;
        this.pRenderer = null;
        this.preparedFrameNumber = -1;
        this.preparedViewIds = new Set();
        this.preparedRequiredNodesByView = new Map();
        this.lastRequiredNodesByView = new Map();
        this.preparedVisibilityActivity = null;
        this.preparedVisibilityFrameNumber = -1;
        this.preparedVisibilityKeys = new Set();
        this.residencyMaintenanceFrame = -1;
        this.lastResidencySnapshotDiagnosticAt = Number.NEGATIVE_INFINITY;
        this.lastLoggedResidencySnapshot = null;
        this.transientActivityReasons = new Set();
        this.lastVisibilitySignature = '';
        this.hasActiveProfileRequests = false;
        this.lastVisibilityActivity = null;
        this.retryWakeupTimer = null;
        this.retryWakeupAt = Number.POSITIVE_INFINITY;
        this.frameEndHandler = (event)=>{
            this.endFrame(event.engineFrame.frameNumber, event.engineFrame.views.filter((view)=>view.visible).map((view)=>view.id));
        };
        this.groupIdMap = new Map();
        this.withCredentials = options.withCredentials ?? false;
        this.residencyOptions = {
            ...options.residency
        };
        const loaderDeps = (0, __WEBPACK_EXTERNAL_MODULE__loaders_createOctreeLoaderDeps_js_431413fb__.createOctreeLoaderDeps)({
            potreeInstance: {
                numNodesLoading: 0,
                maxNodesLoading: 8,
                workerPool: options.workerPool,
                workerUrl: options.workerUrl,
                workerBaseUrl: options.workerBaseUrl,
                workerMode: options.workerMode
            }
        });
        this.workerPool = loaderDeps.workerPool;
        loaderDeps.onNodeLoadStarted = (event)=>this.residency?.recordNodeLoadStarted(event);
        loaderDeps.onNodeLoadSettled = (event)=>{
            this.residency?.recordNodeLoadSettled(event);
            this._handleNodeLoadSettled(event);
        };
        this.loader = new __WEBPACK_EXTERNAL_MODULE__loaders_PotreeV2Loader_js_bd90c233__.PotreeV2Loader(loaderDeps);
    }
    onInit(context) {
        this.context = context;
        this.residency = new __WEBPACK_EXTERNAL_MODULE__PointCloudResidencyManager_js_48e1b7d2__.PointCloudResidencyManager({
            maxResidentPoints: this.residencyOptions.maxResidentPoints,
            maxCachedPoints: this.residencyOptions.maxCachedPoints,
            maxEstimatedResidentBytes: this.residencyOptions.maxEstimatedResidentBytes,
            lowWatermarkRatio: this.residencyOptions.lowWatermarkRatio
        });
        this.preparedFrameNumber = -1;
        this.preparedViewIds.clear();
        this.preparedRequiredNodesByView.clear();
        this.lastRequiredNodesByView.clear();
        this.preparedVisibilityActivity = null;
        this.preparedVisibilityFrameNumber = -1;
        this.preparedVisibilityKeys.clear();
        this.residencyMaintenanceFrame = -1;
        this.lastResidencySnapshotDiagnosticAt = Number.NEGATIVE_INFINITY;
        this.lastLoggedResidencySnapshot = null;
        this.transientActivityReasons.clear();
        this.lastVisibilitySignature = '';
        this.hasActiveProfileRequests = false;
        this.lastVisibilityActivity = null;
        this.pRenderer = new __WEBPACK_EXTERNAL_MODULE__rendering_PotreeRenderer_js_6970b43d__.PotreeRenderer(context.renderer);
        this.renderBackend = new __WEBPACK_EXTERNAL_MODULE__PointCloudRenderBackend_js_28c4eaf8__.PointCloudRenderBackend(this.pRenderer, ()=>this.config, ()=>this._getVisibleOctrees());
        context.registerService('PointCloudService', this);
        log.debug(`[PointCloudPlugin] initialized, withCredentials=${this.withCredentials}`);
    }
    onStart() {
        const pipeline = this.context.getService('RenderPipeline');
        pipeline.addRenderContributor(this);
        const picking = this.context.getService('PickingService');
        picking.addProvider(this);
        this.context.events.on('frame.end', this.frameEndHandler);
        log.debug('[PointCloudPlugin] started, renderContributor=true, pickProvider=true');
        if (this.context.hasService('ClipService')) {
            const clipService = this.context.getService('ClipService');
            this.context.disposables.track(clipService.onChanged((volumes)=>{
                this._applyClipVolumes(volumes);
                this._markVisualActivity('pointcloud.clipVolumes');
            }));
            this._applyClipVolumes(clipService.volumes ?? []);
        }
    }
    onDestroy() {
        if (this.pendingLoads.size > 0 || this.records.size > 0) log.debug(`[PointCloudPlugin] destroying, pendingLoads=${this.pendingLoads.size}, assets=${this.records.size}`);
        for (const [_id, controller] of this.pendingLoads)controller.abort();
        this.pendingLoads.clear();
        this.disposed = true;
        this.context.events.off('frame.end', this.frameEndHandler);
        this.dispose();
        if (this.renderBackend) this.renderBackend.dispose();
        if (this.residency) this.residency.dispose();
        this._logDestroySummary();
        this.residency = null;
        this.renderBackend = null;
        this.pRenderer = null;
        this.preparedFrameNumber = -1;
        this.preparedViewIds.clear();
        this.preparedRequiredNodesByView.clear();
        this.lastRequiredNodesByView.clear();
        this.preparedVisibilityActivity = null;
        this.preparedVisibilityFrameNumber = -1;
        this.preparedVisibilityKeys.clear();
        this.residencyMaintenanceFrame = -1;
        this.lastResidencySnapshotDiagnosticAt = Number.NEGATIVE_INFINITY;
        this.lastLoggedResidencySnapshot = null;
        this._clearRetryWakeup();
        this.transientActivityReasons.clear();
        this.lastVisibilitySignature = '';
        this.hasActiveProfileRequests = false;
        this.lastVisibilityActivity = null;
    }
    async load(request) {
        if (this.disposed) throw new DOMException('Load aborted', 'AbortError');
        const id = request.id ?? (0, __WEBPACK_EXTERNAL_MODULE__shared_utils_index_js_83ff7f8f__.generateId)();
        const controller = new AbortController();
        this.pendingLoads.set(id, controller);
        const loadStart = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__.getLoggerManager)().now();
        let abortHandler;
        if (request.signal) {
            if (request.signal.aborted) controller.abort();
            else {
                abortHandler = ()=>controller.abort();
                request.signal.addEventListener('abort', abortHandler, {
                    once: true
                });
            }
        }
        log.debug(`[PointCloudPlugin] load started, id=${id}, format=potree-v2, url=${request.url}`);
        try {
            if (!this.loader.canLoad(request)) throw new FormatNotSupportedError(request.url);
            const loadRequest = {
                ...request,
                withCredentials: request.withCredentials ?? this.withCredentials
            };
            const result = await this.loader.load(loadRequest, {
                signal: controller.signal,
                onProgress: (p)=>this.context.events.emit('asset.progress', {
                        id,
                        kind: this.kind,
                        progress: p,
                        loaded: p,
                        total: 1
                    })
            });
            if (this.disposed || controller.signal.aborted) {
                this._disposeLoadResult(result);
                log.debug(`[PointCloudPlugin] load aborted after result, id=${id}, url=${request.url}`);
                throw new DOMException('Load aborted', 'AbortError');
            }
            const handle = this._createHandle(id, result, loadRequest, controller);
            this.context.events.emit('asset.loaded', {
                id,
                kind: this.kind
            });
            this._markVisualActivity('pointcloud.assetLoaded', id);
            diagnosticsLog.info(`[PointCloudPlugin] load completed, id=${id}, points=${result.metadata.pointCount}, attributes=${result.metadata.attributes.attributes.length}, elapsed=${((0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__.getLoggerManager)().now() - loadStart).toFixed(1)}ms`);
            log.debug(`[PointCloudPlugin] load completed, id=${id}, points=${result.metadata.pointCount}, elapsed=${((0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__.getLoggerManager)().now() - loadStart).toFixed(1)}ms`);
            return handle;
        } catch (err) {
            if (err instanceof DOMException && 'AbortError' === err.name) log.debug(`[PointCloudPlugin] load aborted, id=${id}, url=${request.url}`);
            else {
                log.error(`[PointCloudPlugin] load failed, id=${id}, url=${request.url}, reason=${err instanceof Error ? err.message : String(err)}`);
                this.context.events.emit('asset.error', {
                    id,
                    kind: this.kind,
                    error: err instanceof Error ? err : new Error(String(err))
                });
            }
            throw err;
        } finally{
            if (request.signal && abortHandler) request.signal.removeEventListener('abort', abortHandler);
            if (this.pendingLoads.get(id) === controller) this.pendingLoads.delete(id);
            log.debug(`[PointCloudPlugin] load settled, id=${id}, pendingLoads=${this.pendingLoads.size}`);
        }
    }
    mount(handle) {
        const object3D = handle.object3D;
        if (!object3D) return;
        if (object3D instanceof __WEBPACK_EXTERNAL_MODULE_three__.Object3D) (0, __WEBPACK_EXTERNAL_MODULE__shared_utils_index_js_83ff7f8f__.setMaskRecursive)(object3D, object3D.layers.mask);
        const root = this.context.sceneGraph.getRootForKind('pointCloud');
        root.add(object3D);
        this.context.sceneBounds?.register({
            id: handle.id,
            kind: this.kind,
            object3D,
            getLocalBoundingBox: ()=>handle.boundingBox,
            getWorldBoundingBoxForFit: ()=>this._getWorldFitBoundingBox(handle),
            isVisible: ()=>handle.visible
        });
        diagnosticsLog.info(`[PointCloudPlugin] mounted, id=${handle.id}, visibleNodes=${handle.visibleNodeCount}, visiblePoints=${handle.visiblePointCount}`);
        this.context.events.emit('asset.mounted', {
            id: handle.id,
            kind: this.kind
        });
        this._markVisualActivity('pointcloud.mounted', handle.id);
        log.debug(`[PointCloudPlugin] mounted, id=${handle.id}, assets=${this.records.size}`);
    }
    unmount(id) {
        this.context.sceneBounds?.unregister(this.kind, id);
        const record = this.records.get(id);
        if (record?.handle.object3D?.parent) record.handle.object3D.parent.remove(record.handle.object3D);
        this.context.events.emit('asset.unmounted', {
            id,
            kind: this.kind
        });
        this._markVisualActivity('pointcloud.unmounted', id);
        log.debug(`[PointCloudPlugin] unmounted, id=${id}, assets=${this.records.size}`);
    }
    getAsset(id) {
        return this.records.get(id)?.handle;
    }
    getAll() {
        return Array.from(this.records.values()).map((r)=>r.handle);
    }
    setVisibility(id, visible) {
        const record = this.records.get(id);
        if (record) {
            const previousVisible = record.handle.visible;
            record.handle.visible = visible;
            this.context.events.emit('asset.visibilityChanged', {
                id,
                visible
            });
            this._markVisualActivity('pointcloud.visibility', id);
            if (previousVisible !== visible) {
                if (!visible) this._removeRequiredNodesForGeometry(record.loadResult.octreeGeometry);
                diagnosticsLog.info(`[PointCloudPlugin] visibility changed, id=${id}, visible=${visible}, previous=${previousVisible}, visibleNodes=${record.handle.visibleNodeCount}, visiblePoints=${record.handle.visiblePointCount}`);
            }
            log.debug(`[PointCloudPlugin] visibility changed, id=${id}, visible=${visible}`);
        }
    }
    getRenderActivity(context) {
        if (0 === context.renderedViewIds.length) {
            this.transientActivityReasons.clear();
            return {
                needsNextFrame: false,
                reasons: []
            };
        }
        const reasons = Array.from(this.transientActivityReasons);
        this.transientActivityReasons.clear();
        const activity = this.lastVisibilityActivity;
        if (activity) {
            if (activity.gpuUploadBacklog > 0) reasons.push('pointcloud.gpuUploadBacklog');
            if (activity.queuedForLoad > 0 || activity.loadsStarted > 0) reasons.push('pointcloud.streaming');
            if (activity.queuedWaitingForParent > 0 || activity.loadedWaitingForParent > 0) reasons.push('pointcloud.parentPending');
        }
        if (this.hasActiveProfileRequests) reasons.push('pointcloud.profileRequest');
        return {
            needsNextFrame: reasons.length > 0,
            reasons
        };
    }
    requestMemoryCleanup(reason = 'manual') {
        if (!this.residency) return;
        const before = this.residency.getSnapshot();
        const trim = this.residency.maintainBudget();
        const after = this.residency.getSnapshot();
        if (trim.removed > 0) {
            this._markVisualActivity('pointcloud.residencyTrim');
            diagnosticsLog.info(`[PointCloudPlugin] memory cleanup requested, reason=${reason}, trigger=${trim.trigger}, removed=${trim.removed}, beforeEntries=${before.residentEntries}, afterEntries=${after.residentEntries}, beforePoints=${before.residentPoints}, afterPoints=${after.residentPoints}, releasedEstimatedBytes=${trim.releasedEstimatedTotalBytes}, assets=${this.records.size}`);
        }
    }
    endFrame(frameNumber, visibleViewIds) {
        this._runResidencyMaintenance(frameNumber, visibleViewIds);
    }
    render(frame, phase, ctx) {
        this._applyClipStateToAllMaterials(this._resolveClipState(frame.viewId));
        this._prepareVisibilityForView(frame);
        this.renderBackend?.render(frame, phase, ctx);
    }
    pick(query) {
        if (!this.pRenderer || !this.context) return null;
        this._applyClipStateToAllMaterials(this._resolveClipState(query.viewId));
        this._prepareVisibilityForPick(query);
        const candidates = [];
        for (const [assetId, record] of this.records){
            if (!record.handle.visible) continue;
            if (query.assetIds && !query.assetIds.includes(assetId)) continue;
            const result = this._pickOctree(assetId, record.octree, query);
            if (result) candidates.push(result);
        }
        if (0 === candidates.length) return null;
        candidates.sort((a, b)=>a.distance - b.distance);
        return candidates[0];
    }
    unloadAsset(id) {
        const record = this.records.get(id);
        if (!record || !this.residency) return;
        const shouldLogMemory = memoryLog.isEnabled(__WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__.LogLevel.DEBUG);
        const before = shouldLogMemory ? this.residency.getSnapshot() : null;
        const summary = this.residency.unloadAsset(id);
        const after = shouldLogMemory ? this.residency.getSnapshot() : null;
        record.octree.visibleNodes = [];
        record.octree.numVisibleNodes = 0;
        record.octree.numVisiblePoints = 0;
        if (summary.removed > 0) this._markVisualActivity('pointcloud.assetUnloaded', id);
        if (before && after) memoryLog.debug(`event=pointcloud.residency.assetUnload phase=complete assetId=${id} removed=${summary.removed} releasedPoints=${summary.releasedPoints} releasedEstimatedCpuBytes=${summary.releasedEstimatedCpuBytes} releasedEstimatedGpuBytes=${summary.releasedEstimatedGpuBytes} releasedEstimatedTotalBytes=${summary.releasedEstimatedTotalBytes} beforeEntries=${before.residentEntries} afterEntries=${after.residentEntries} beforePoints=${before.residentPoints} afterPoints=${after.residentPoints} beforeEstimatedTotalBytes=${before.estimatedResidentTotalBytes} afterEstimatedTotalBytes=${after.estimatedResidentTotalBytes}`);
    }
    disposeAsset(id) {
        const pending = this.pendingLoads.get(id);
        if (pending) {
            pending.abort();
            this.pendingLoads.delete(id);
        }
        this.context.sceneBounds?.unregister(this.kind, id);
        const record = this.records.get(id);
        if (!record) return;
        const shouldLogMemory = memoryLog.isEnabled(__WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__.LogLevel.DEBUG);
        const residencyBefore = shouldLogMemory ? this.residency?.getSnapshot() : void 0;
        diagnosticsLog.info(`[PointCloudPlugin] dispose started, id=${id}, visibleNodes=${record.handle.visibleNodeCount}, visiblePoints=${record.handle.visiblePointCount}, assets=${this.records.size}`);
        this._disposeRecord(id, record);
        this.records.delete(id);
        const residencyAfter = shouldLogMemory ? this.residency?.getSnapshot() : void 0;
        this.context.events.emit('asset.disposed', {
            id,
            kind: this.kind
        });
        this._markVisualActivity('pointcloud.disposed', id);
        diagnosticsLog.info(`[PointCloudPlugin] disposed, id=${id}, assets=${this.records.size}`);
        if (residencyBefore && residencyAfter) memoryLog.debug(`event=pointcloud.residency.assetDispose phase=complete assetId=${id} removed=${Math.max(0, residencyBefore.residentEntries - residencyAfter.residentEntries)} releasedPoints=${Math.max(0, residencyBefore.residentPoints - residencyAfter.residentPoints)} releasedEstimatedTotalBytes=${Math.max(0, residencyBefore.estimatedResidentTotalBytes - residencyAfter.estimatedResidentTotalBytes)} beforeEntries=${residencyBefore.residentEntries} afterEntries=${residencyAfter.residentEntries} beforePoints=${residencyBefore.residentPoints} afterPoints=${residencyAfter.residentPoints} beforeEstimatedTotalBytes=${residencyBefore.estimatedResidentTotalBytes} afterEstimatedTotalBytes=${residencyAfter.estimatedResidentTotalBytes} assets=${this.records.size}`);
    }
    dispose(id) {
        if (void 0 !== id) this.disposeAsset(id);
        else {
            if (this.records.size > 0 || this.pendingLoads.size > 0) diagnosticsLog.info(`[PointCloudPlugin] dispose all started, assets=${this.records.size}, pendingLoads=${this.pendingLoads.size}`);
            for (const controller of this.pendingLoads.values())controller.abort();
            this.pendingLoads.clear();
            for (const assetId of Array.from(this.records.keys()))this.disposeAsset(assetId);
            this._markVisualActivity('pointcloud.disposed');
            diagnosticsLog.info('[PointCloudPlugin] disposed all assets');
        }
    }
    _logDestroySummary() {
        if (!memoryLog.isEnabled(__WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__.LogLevel.INFO)) return;
        try {
            const renderer = this.pRenderer?.getMemoryDiagnostics?.();
            const backend = this.renderBackend?.getMemoryDiagnostics?.();
            const workers = this.workerPool?.getDiagnostics?.();
            const residency = this.residency?.getSnapshot();
            memoryLog.info(`event=pointcloud.memory engineId=${this.context?.memoryDiagnosticId ?? 0} phase=plugin.destroyed scope=plugin elapsedMs=0 assets=${this.records.size} pending=${this.pendingLoads.size} residentEntries=${residency?.residentEntries ?? 0} residentPoints=${residency?.residentPoints ?? 0} estimatedResidentCpuBytes=${residency?.estimatedResidentCpuBytes ?? 0} estimatedResidentGpuBytes=${residency?.estimatedResidentGpuBytes ?? 0} estimatedResidentTotalBytes=${residency?.estimatedResidentTotalBytes ?? 0} peakResidentEntries=${residency?.peakResidentEntries ?? 0} peakResidentPoints=${residency?.peakResidentPoints ?? 0} peakEstimatedResidentCpuBytes=${residency?.peakEstimatedResidentCpuBytes ?? 0} peakEstimatedResidentGpuBytes=${residency?.peakEstimatedResidentGpuBytes ?? 0} peakEstimatedResidentTotalBytes=${residency?.peakEstimatedResidentTotalBytes ?? 0} protectedEntries=${residency?.protectedEntries ?? 0} peakProtectedEntries=${residency?.peakProtectedEntries ?? 0} trimCount=${residency?.trimCount ?? 0} trimRemovedTotal=${residency?.trimRemovedTotal ?? 0} trimReleasedPointsTotal=${residency?.trimReleasedPointsTotal ?? 0} trimReleasedEstimatedBytesTotal=${residency?.trimReleasedEstimatedBytesTotal ?? 0} trimBlockedByProtectionTotal=${residency?.trimBlockedByProtectionTotal ?? 0} assetUnloadCount=${residency?.assetUnloadCount ?? 0} assetUnloadRemovedTotal=${residency?.assetUnloadRemovedTotal ?? 0} loadStartedTotal=${residency?.loadStartedCount ?? 0} initialLoadStartedTotal=${residency?.initialLoadStartedCount ?? 0} retryStartedTotal=${residency?.retryStartedCount ?? 0} reloadStartedTotal=${residency?.reloadStartedCount ?? 0} loadCompletedTotal=${residency?.loadCompletedCount ?? 0} structuralCompletedTotal=${residency?.structuralCompletedCount ?? 0} loadFailedTotal=${residency?.loadFailedCount ?? 0} loadAbortedTotal=${residency?.loadAbortedCount ?? 0} lateResultDroppedTotal=${residency?.lateResultDroppedCount ?? 0} inFlightLoads=${residency?.inFlightLoads ?? 0} peakInFlightLoads=${residency?.peakInFlightLoads ?? 0} vaoDelta=${renderer?.liveVaoEstimate ?? 0} vboDelta=${renderer?.liveVboEstimate ?? 0} workersActive=${workers?.leasedOrCreating ?? 0} workerWaiters=${workers?.waiters ?? 0} hqDepth=${backend?.hqDepthMaterials ?? 0} hqAttribute=${backend?.hqAttributeMaterials ?? 0}`);
        } catch  {}
    }
    getConfig() {
        return {
            ...this.config
        };
    }
    setConfig(config) {
        Object.assign(this.config, config);
        this._markVisualActivity('pointcloud.config');
        if (log.isEnabled(__WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__.LogLevel.DEBUG)) {
            const keys = Object.keys(config).join(',');
            log.debug(`[PointCloudPlugin] render config updated, keys=${keys}`);
        }
        if (void 0 !== config.showBoundingBox) for (const record of this.records.values())record.octree.showBoundingBox = config.showBoundingBox;
    }
    setShowBoundingBox(id, visible) {
        const record = this.records.get(id);
        if (record) {
            record.octree.showBoundingBox = visible;
            this._markVisualActivity('pointcloud.boundingBox', id);
        }
    }
    _createHandle(id, result, request, loadController) {
        result.octreeGeometry.loadSignal = loadController.signal;
        const octree = this._createOctree(result, request);
        const handle = new __WEBPACK_EXTERNAL_MODULE__PointCloudHandle_js_82f806b9__.OctreePointCloudHandle(id, octree, request.url, (reason)=>this._markVisualActivity(reason, id));
        this.records.set(id, {
            handle,
            octree,
            loadController,
            loadResult: result
        });
        this.residency?.attachAsset(id, result.octreeGeometry);
        log.debug(`[PointCloudPlugin] handle created, id=${id}, points=${result.metadata.pointCount}, assets=${this.records.size}`);
        return handle;
    }
    _handleNodeLoadSettled(event) {
        if (this.disposed) return;
        if ('loaded' === event.status || 'structural' === event.status) {
            this._markVisualActivity('pointcloud.nodeLoaded', event.node.name);
            return;
        }
        if ('failed' === event.status) {
            this._markVisualActivity('pointcloud.nodeLoadFailed', event.node.name);
            this._scheduleRetryWakeup(event.node);
            return;
        }
        if ('late-dropped' === event.status) diagnosticsLog.debug(`event=pointcloud.nodeLoadLateDropped node=${event.node.name} state=${event.node.resourceState}`);
    }
    _scheduleRetryWakeup(node) {
        const retryAt = Number(node.retryAfter);
        if (!Number.isFinite(retryAt)) return;
        const now = globalThis.performance?.now?.() ?? Date.now();
        if (retryAt <= now) {
            this._markVisualActivity('pointcloud.retryReady', node.name);
            return;
        }
        if (retryAt >= this.retryWakeupAt) return;
        this._clearRetryWakeup();
        this.retryWakeupAt = retryAt;
        this.retryWakeupTimer = setTimeout(()=>{
            this.retryWakeupTimer = null;
            this.retryWakeupAt = Number.POSITIVE_INFINITY;
            this._markVisualActivity('pointcloud.retryReady', node.name);
        }, Math.max(0, retryAt - now));
    }
    _clearRetryWakeup() {
        if (this.retryWakeupTimer) {
            clearTimeout(this.retryWakeupTimer);
            this.retryWakeupTimer = null;
        }
        this.retryWakeupAt = Number.POSITIVE_INFINITY;
    }
    _markVisualActivity(reason, detail) {
        this.transientActivityReasons.add(reason);
        this.context?.renderInvalidation?.invalidate(reason, detail ? {
            detail
        } : void 0);
    }
    _recordVisibilityActivity(visibleOctrees, result) {
        if (!result) {
            this.hasActiveProfileRequests = false;
            this.lastVisibilityActivity = null;
            return;
        }
        const signature = visibleOctrees.map(({ handle, octree })=>{
            const nodeNames = (octree.visibleNodes ?? []).map((node)=>node.name ?? '').join(',');
            return `${handle.id}:${octree.numVisibleNodes ?? 0}:${octree.numVisiblePoints ?? 0}:${nodeNames}`;
        }).join('|');
        if (signature !== this.lastVisibilitySignature) {
            this.lastVisibilitySignature = signature;
            this.transientActivityReasons.add('pointcloud.visibilityChanged');
        }
        this.hasActiveProfileRequests = visibleOctrees.some(({ octree })=>(octree.profileRequests?.length ?? 0) > 0);
        this.lastVisibilityActivity = 'activity' in result && result.activity ? result.activity : null;
    }
    _disposeLoadResult(result) {
        result.nodeLoader?.dispose();
        result.octreeGeometry.loadSignal = void 0;
        result.octreeGeometry.dispose?.();
    }
    _disposeRecord(id, record) {
        record.loadController.abort();
        this._removeRequiredNodesForGeometry(record.loadResult.octreeGeometry);
        if (record.handle.object3D?.parent) record.handle.object3D.parent.remove(record.handle.object3D);
        this._disposeLoadResult(record.loadResult);
        record.octree.dispose?.();
        this.residency?.detachAsset(id);
    }
    _updateVisibility(visibleOctrees, camera, renderer, options) {
        if (0 === visibleOctrees.length || !this.residency) {
            this._recordVisibilityActivity([], null);
            return null;
        }
        const mgr = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__.getLoggerManager)();
        const start = mgr.isPerfEnabled() ? mgr.now() : 0;
        const result = (0, __WEBPACK_EXTERNAL_MODULE__core_UpdateVisibility_js_5a00b8e8__.updatePointClouds)(visibleOctrees.map(({ octree })=>octree), camera, renderer, this.residency, this.context.pointBudget, options.maxNodesLoading, options.viewportSize, options.progressContext);
        if (mgr.isPerfEnabled()) {
            const elapsed = mgr.now() - start;
            if (elapsed >= POINTCLOUD_VISIBILITY_SLOW_MS) mgr.writeRecord({
                level: __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__.LogLevel.DEBUG,
                namespace: 'pointcloud:visibility:perf',
                message: `slow visibility update ${elapsed.toFixed(1)}ms, assets=${visibleOctrees.length}, visibleNodes=${result?.visibleNodes.length ?? 0}, visiblePoints=${result?.numVisiblePoints ?? 0}`,
                timestamp: mgr.now()
            });
        }
        if (result && options.emitVisibilityEvents) for (const { handle, octree } of visibleOctrees)this.context.events.emit('pointcloud.visibilityUpdated', {
            id: handle.id,
            visibleNodes: octree.numVisibleNodes ?? 0,
            visiblePoints: octree.numVisiblePoints ?? 0
        });
        this._recordVisibilityActivity(visibleOctrees, result ?? null);
        return result ?? null;
    }
    _createOctree(result, request) {
        const octree = new __WEBPACK_EXTERNAL_MODULE__core_PointCloudOctree_js_44b9d91d__.PointCloudOctree(result.octreeGeometry);
        octree.name = request.name ?? request.url;
        octree.visible = true;
        octree.minimumNodePixelSize = this.config.minNodeSize;
        octree.showBoundingBox = this.config.showBoundingBox;
        octree.material.size = this.config.pointSize;
        octree.material.pointSizeType = this.config.pointSizeType;
        octree.material.shape = this.config.pointShape;
        if (this.config.activeAttributeName) octree.material.activeAttributeName = this.config.activeAttributeName;
        this._applyClipStateToMaterial(octree.material, this.globalClipState);
        octree.addEventListener?.('transformation_changed', ()=>{
            this._clearPreparedVisibility();
            this._markVisualActivity('pointcloud.transform');
        });
        return octree;
    }
    _getWorldFitBoundingBox(handle) {
        const record = this.records.get(handle.id);
        if (record) return this._getOctreeWorldFitBoundingBox(record.octree);
        return handle.boundingBox?.clone() ?? null;
    }
    _getOctreeWorldFitBoundingBox(octree) {
        const metadata = octree.pcoGeometry?.loader?.metadata;
        const positionAttribute = metadata?.attributes?.find((attribute)=>'position' === attribute.name && Array.isArray(attribute.min) && 3 === attribute.min.length && Array.isArray(attribute.max) && 3 === attribute.max.length);
        if ('function' == typeof octree.updateWorldMatrix) octree.updateWorldMatrix(true, false);
        else if ('function' == typeof octree.updateMatrixWorld) octree.updateMatrixWorld(true);
        if (positionAttribute?.min && positionAttribute.max) {
            const offset = octree.pcoGeometry?.offset ?? octree.position;
            const tight = new __WEBPACK_EXTERNAL_MODULE_three__.Box3(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(...positionAttribute.min), new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(...positionAttribute.max));
            tight.min.sub(offset);
            tight.max.sub(offset);
            return tight.applyMatrix4(octree.matrixWorld);
        }
        return octree.boundingBox?.clone().applyMatrix4(octree.matrixWorld) ?? null;
    }
    _pickOctree(assetId, octree, query) {
        const { width, height } = this._getRendererSize(query.viewport);
        if (width <= 0 || height <= 0) return null;
        const x = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.clamp(Math.round((query.ndc.x + 1) * 0.5 * width), 0, width - 1);
        const y = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.clamp(Math.round((query.ndc.y + 1) * 0.5 * height), 0, height - 1);
        const raw = octree.pick(this.context.renderer, this.pRenderer, query.camera, query.ray, {
            pickWindowSize: query.windowSize ?? __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.DEFAULT_PICK_WINDOW_SIZE,
            pickClipped: true,
            width,
            height,
            x,
            y
        });
        if (!raw || !raw.position) return null;
        const point = raw.position;
        const distance = point.distanceTo(query.ray.origin);
        return {
            assetId,
            kind: this.kind,
            point,
            distance,
            attributes: this._extractPickAttributes(raw),
            _raw: raw
        };
    }
    _extractPickAttributes(raw) {
        const attrs = {};
        if ('classification' in raw && null != raw.classification) attrs.classification = raw.classification[0] ?? raw.classification;
        if ('intensity' in raw && null != raw.intensity) attrs.intensity = raw.intensity[0] ?? raw.intensity;
        if ('rgba' in raw && null != raw.rgba) {
            const c = raw.rgba;
            attrs.rgba = [
                c[0] ?? 0,
                c[1] ?? 0,
                c[2] ?? 0,
                c[3] ?? 255
            ];
        }
        if ('return number' in raw && null != raw['return number']) attrs.returnNumber = raw['return number'][0] ?? raw['return number'];
        if ('gps-time' in raw && null != raw['gps-time']) attrs.gpsTime = raw['gps-time'][0] ?? raw['gps-time'];
        return attrs;
    }
    _getRendererSize(viewport) {
        if (viewport) return {
            width: Math.max(1, Math.round(viewport.width)),
            height: Math.max(1, Math.round(viewport.height))
        };
        const renderer = this.context.renderer;
        if ('function' == typeof renderer.getSize) {
            const size = renderer.getSize(new __WEBPACK_EXTERNAL_MODULE_three__.Vector2());
            const width = Math.max(1, Math.round(size.width ?? size.x ?? 1));
            const height = Math.max(1, Math.round(size.height ?? size.y ?? 1));
            return {
                width,
                height
            };
        }
        const width = Math.max(1, Math.round(renderer.domElement?.clientWidth ?? renderer.domElement?.width ?? 1));
        const height = Math.max(1, Math.round(renderer.domElement?.clientHeight ?? renderer.domElement?.height ?? 1));
        return {
            width,
            height
        };
    }
    _collectVisibleOctrees() {
        const visibleOctrees = [];
        for (const record of this.records.values())if (!!record.handle.visible) visibleOctrees.push({
            handle: record.handle,
            octree: record.octree
        });
        return visibleOctrees;
    }
    _removeRequiredNodesForGeometry(geometry) {
        for (const requiredNodesByView of [
            this.preparedRequiredNodesByView,
            this.lastRequiredNodesByView
        ])for (const nodes of requiredNodesByView.values())for (const node of nodes)if (node.octreeGeometry === geometry) nodes.delete(node);
    }
    _prepareVisibilityForView(frame) {
        if (!this.renderBackend || !this.residency) return;
        if (this.preparedFrameNumber !== frame.frameNumber) {
            this.preparedFrameNumber = frame.frameNumber;
            this.preparedViewIds.clear();
            this.preparedRequiredNodesByView.clear();
            this.preparedVisibilityActivity = null;
        }
        const visibleViews = this._getVisibleViews();
        const preparePerView = visibleViews.length > 1;
        if (preparePerView && this.preparedViewIds.has(frame.viewId)) return;
        const scopeKey = this._getVisibilityScopeKey(frame.viewId);
        if (this._isPreparedVisibility(frame.frameNumber, scopeKey)) return;
        const result = this._updateVisibility(this._collectVisibleOctrees(), frame.camera, frame.renderer, {
            emitVisibilityEvents: true,
            maxNodesLoading: this.context.maxNodesLoading,
            viewportSize: {
                width: frame.viewport.width,
                height: frame.viewport.height
            },
            progressContext: {
                frameNumber: frame.frameNumber,
                viewId: frame.viewId,
                visibleViewIds: visibleViews.length > 0 ? visibleViews.map((view)=>view.id) : [
                    frame.viewId
                ]
            }
        });
        const requiredNodes = result?.requiredGeometryNodes ?? new Set();
        this.preparedRequiredNodesByView.set(frame.viewId, requiredNodes);
        this.lastRequiredNodesByView.set(frame.viewId, requiredNodes);
        if (preparePerView) {
            this.preparedVisibilityActivity = this._mergeVisibilityActivity(this.preparedVisibilityActivity, result?.activity);
            this.lastVisibilityActivity = this.preparedVisibilityActivity;
            this.preparedViewIds.add(frame.viewId);
            return;
        }
        this.preparedViewIds.add('__single__');
        this._markPreparedVisibility(frame.frameNumber, scopeKey);
    }
    _getViewRegistry() {
        if (!this.context.hasService('ViewRegistry')) return null;
        const registry = this.context.getService('ViewRegistry');
        if (!registry || 'function' != typeof registry.list) return null;
        return registry;
    }
    _getVisibleViews() {
        const registry = this._getViewRegistry();
        if (!registry) return [];
        return registry.list().filter((view)=>false !== view.visible);
    }
    _mergeVisibilityActivity(current, next) {
        if (!next) return current;
        if (!current) return {
            ...next
        };
        return {
            queuedForLoad: current.queuedForLoad + next.queuedForLoad,
            loadsStarted: current.loadsStarted + next.loadsStarted,
            gpuUploads: current.gpuUploads + next.gpuUploads,
            gpuUploadBacklog: current.gpuUploadBacklog + next.gpuUploadBacklog,
            loadedWaitingForParent: current.loadedWaitingForParent + next.loadedWaitingForParent,
            queuedWaitingForParent: current.queuedWaitingForParent + next.queuedWaitingForParent,
            queueSize: current.queueSize + next.queueSize
        };
    }
    _runResidencyMaintenance(frameNumber, visibleViewIds) {
        if (!this.residency || this.disposed) return;
        if (this.residencyMaintenanceFrame === frameNumber) return;
        this.residencyMaintenanceFrame = frameNumber;
        const protectedNodes = new Set();
        const visibleGeometries = new Set(this._collectVisibleOctrees().map(({ octree })=>octree.pcoGeometry));
        const registryViewIds = visibleViewIds ?? this._getVisibleViews().map((view)=>view.id);
        const hasKnownVisibleViews = void 0 !== visibleViewIds || registryViewIds.length > 0;
        const activeViewIds = hasKnownVisibleViews ? new Set(registryViewIds) : new Set([
            ...this.lastRequiredNodesByView.keys(),
            ...this.preparedRequiredNodesByView.keys()
        ]);
        if (hasKnownVisibleViews) {
            for (const viewId of this.lastRequiredNodesByView.keys())if (!activeViewIds.has(viewId)) this.lastRequiredNodesByView.delete(viewId);
        }
        for (const viewId of activeViewIds){
            const nodes = this.preparedFrameNumber === frameNumber ? this.preparedRequiredNodesByView.get(viewId) ?? this.lastRequiredNodesByView.get(viewId) : this.lastRequiredNodesByView.get(viewId);
            for (const node of nodes ?? [])if (visibleGeometries.has(node.octreeGeometry)) protectedNodes.add(node);
        }
        this.residency.setProtectedNodes(protectedNodes);
        const trim = this.residency.maintainBudget();
        this._logResidencyRuntimeSnapshot(frameNumber, trim);
        if (trim.removed > 0) this._markVisualActivity('pointcloud.residencyTrim');
    }
    _logResidencyRuntimeSnapshot(frameNumber, trim) {
        if (!this.residency || !memoryLog.isEnabled(__WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__.LogLevel.DEBUG)) return;
        const now = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__.getLoggerManager)().now();
        if (0 === trim.removed && now - this.lastResidencySnapshotDiagnosticAt < RESIDENCY_SNAPSHOT_INTERVAL_MS) return;
        const snapshot = this.residency.getSnapshot();
        const previous = this.lastLoggedResidencySnapshot;
        const deltas = Object.fromEntries(RESIDENCY_DELTA_COUNTER_KEYS.map((key)=>[
                key,
                snapshot[key] - (previous?.[key] ?? 0)
            ]));
        this.lastResidencySnapshotDiagnosticAt = now;
        this.lastLoggedResidencySnapshot = snapshot;
        memoryLog.debug(`event=pointcloud.residency.snapshot phase=frame.end frame=${frameNumber} assets=${this.records.size} residentEntries=${snapshot.residentEntries} residentPoints=${snapshot.residentPoints} estimatedResidentCpuBytes=${snapshot.estimatedResidentCpuBytes} estimatedResidentGpuBytes=${snapshot.estimatedResidentGpuBytes} estimatedResidentTotalBytes=${snapshot.estimatedResidentTotalBytes} protectedEntries=${snapshot.protectedEntries} protectedResidentPoints=${snapshot.protectedResidentPoints} cachedResidentPoints=${snapshot.cachedResidentPoints} peakResidentEntries=${snapshot.peakResidentEntries} peakResidentPoints=${snapshot.peakResidentPoints} peakEstimatedResidentCpuBytes=${snapshot.peakEstimatedResidentCpuBytes} peakEstimatedResidentGpuBytes=${snapshot.peakEstimatedResidentGpuBytes} peakEstimatedResidentTotalBytes=${snapshot.peakEstimatedResidentTotalBytes} peakProtectedEntries=${snapshot.peakProtectedEntries} cachedPointHighWatermark=${snapshot.cachedPointHighWatermark} cachedPointLowWatermark=${snapshot.cachedPointLowWatermark} pointHighWatermark=${snapshot.pointHighWatermark ?? 'disabled'} pointLowWatermark=${snapshot.pointLowWatermark ?? 'disabled'} estimatedByteHighWatermark=${snapshot.estimatedByteHighWatermark ?? 'disabled'} estimatedByteLowWatermark=${snapshot.estimatedByteLowWatermark ?? 'disabled'} trimTrigger=${trim.trigger} trimSelected=${trim.selected} trimRemoved=${trim.removed} trimBlockedByProtection=${trim.blockedByProtection} trimCount=${snapshot.trimCount} trimRemovedTotal=${snapshot.trimRemovedTotal} trimReleasedPointsTotal=${snapshot.trimReleasedPointsTotal} trimReleasedEstimatedBytesTotal=${snapshot.trimReleasedEstimatedBytesTotal} trimBlockedByProtectionTotal=${snapshot.trimBlockedByProtectionTotal} loadStartedTotal=${snapshot.loadStartedCount} loadStartedDelta=${deltas.loadStartedCount} initialLoadStartedTotal=${snapshot.initialLoadStartedCount} initialLoadStartedDelta=${deltas.initialLoadStartedCount} retryStartedTotal=${snapshot.retryStartedCount} retryStartedDelta=${deltas.retryStartedCount} reloadStartedTotal=${snapshot.reloadStartedCount} reloadStartedDelta=${deltas.reloadStartedCount} loadCompletedTotal=${snapshot.loadCompletedCount} loadCompletedDelta=${deltas.loadCompletedCount} structuralCompletedTotal=${snapshot.structuralCompletedCount} structuralCompletedDelta=${deltas.structuralCompletedCount} loadFailedTotal=${snapshot.loadFailedCount} loadFailedDelta=${deltas.loadFailedCount} loadAbortedTotal=${snapshot.loadAbortedCount} loadAbortedDelta=${deltas.loadAbortedCount} lateResultDroppedTotal=${snapshot.lateResultDroppedCount} lateResultDroppedDelta=${deltas.lateResultDroppedCount} inFlightLoads=${snapshot.inFlightLoads} peakInFlightLoads=${snapshot.peakInFlightLoads} assetUnloadCount=${snapshot.assetUnloadCount} assetUnloadRemovedTotal=${snapshot.assetUnloadRemovedTotal} assetUnloadReleasedPointsTotal=${snapshot.assetUnloadReleasedPointsTotal} assetUnloadReleasedEstimatedBytesTotal=${snapshot.assetUnloadReleasedEstimatedBytesTotal}`);
    }
    _prepareVisibilityForPick(query) {
        const currentFrameNumber = this.context.frameNumber;
        const scopeKey = this._getVisibilityScopeKey(query.viewId);
        if ('number' == typeof currentFrameNumber && this._isPreparedVisibility(currentFrameNumber, scopeKey)) return;
        const visibleOctrees = this._collectVisibleOctrees();
        if (0 === visibleOctrees.length) return;
        const progressViewId = query.viewId ?? '__pick__';
        const visibleViews = this._getVisibleViews();
        this._updateVisibility(visibleOctrees, query.camera, this.context.renderer, {
            maxNodesLoading: 0,
            viewportSize: this._getRendererSize(query.viewport),
            progressContext: 'number' == typeof currentFrameNumber ? {
                frameNumber: currentFrameNumber,
                viewId: progressViewId,
                visibleViewIds: visibleViews.length > 0 ? visibleViews.map((view)=>view.id) : [
                    progressViewId
                ]
            } : void 0
        });
        if ('number' == typeof currentFrameNumber) this._markPreparedVisibility(currentFrameNumber, scopeKey);
    }
    _getVisibleOctrees() {
        const result = [];
        for (const record of this.records.values())if (!!record.handle.visible) result.push(record.octree);
        return result;
    }
    _applyClipVolumes(volumes) {
        this.sourceClipVolumes = Array.from(volumes);
        this.globalClipState = this._buildClipState(this._getGlobalClipVolumes());
        this._clearPreparedVisibility();
        this._applyClipStateToAllMaterials(this.globalClipState);
    }
    _resolveClipTask(volumes) {
        for(let index = volumes.length - 1; index >= 0; index -= 1){
            const volume = volumes[index];
            if ('box' === volume.type && 'number' == typeof volume.clipTask) return volume.clipTask;
        }
        for (const volume of volumes)if ('number' == typeof volume.clipTask && volume.clipTask !== __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.ClipTask.HIGHLIGHT) return volume.clipTask;
        for (const volume of volumes)if ('number' == typeof volume.clipTask) return volume.clipTask;
        return this.config.clipTask;
    }
    _buildClipBoxes(volumes) {
        const boxVolumes = volumes.filter((v)=>'box' === v.type);
        return boxVolumes.filter((v)=>0 !== v.matrix.determinant()).map((v)=>{
            const box = new __WEBPACK_EXTERNAL_MODULE_three__.Object3D();
            box.matrixAutoUpdate = false;
            box.matrix.copy(v.matrix);
            box.matrixWorld.copy(v.matrix);
            box.matrixWorldNeedsUpdate = false;
            const inverse = v.matrix.clone().invert();
            const position = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().setFromMatrixPosition(v.matrix);
            return {
                box,
                inverse,
                position
            };
        });
    }
    _buildClipPolygons(volumes, fallbackClipTask) {
        const polygonVolumes = volumes.filter((v)=>'polygon' === v.type && v.vertices && v.vertices.length >= 3);
        return polygonVolumes.map((v)=>{
            const vertices = v.vertices;
            if ('screen' === v.space && v.viewMatrix && v.projMatrix) {
                const aabb = v.aabb ?? (()=>{
                    let minX = 1 / 0;
                    let minY = 1 / 0;
                    let maxX = -1 / 0;
                    let maxY = -1 / 0;
                    for (const vert of vertices){
                        minX = Math.min(minX, vert.x);
                        minY = Math.min(minY, vert.y);
                        maxX = Math.max(maxX, vert.x);
                        maxY = Math.max(maxY, vert.y);
                    }
                    return {
                        min: new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(minX, minY),
                        max: new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(maxX, maxY)
                    };
                })();
                return {
                    viewMatrix: v.viewMatrix.clone(),
                    projMatrix: v.projMatrix.clone(),
                    markers: vertices.map((vert)=>({
                            position: vert.clone()
                        })),
                    clipTask: v.clipTask ?? fallbackClipTask,
                    groupId: this._mapGroupId(v.groupId),
                    aabb: {
                        min: {
                            x: aabb.min.x,
                            y: aabb.min.y
                        },
                        max: {
                            x: aabb.max.x,
                            y: aabb.max.y
                        }
                    },
                    initialized: true
                };
            }
            const v0 = vertices[0];
            const v1 = vertices[1];
            const v2 = vertices[2];
            const edge1 = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().subVectors(v1, v0);
            const edge2 = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().subVectors(v2, v0);
            const normal = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().crossVectors(edge1, edge2).normalize();
            if (normal.lengthSq() < 1e-10) normal.set(0, 0, 1);
            const center = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
            for (const vert of vertices)center.add(vert);
            center.divideScalar(vertices.length);
            const eye = center.clone().add(normal);
            const viewMatrix = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4().lookAt(eye, center, new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 1));
            const viewFull = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4().makeRotationFromEuler(new __WEBPACK_EXTERNAL_MODULE_three__.Euler().setFromRotationMatrix(viewMatrix));
            viewFull.setPosition(-center.dot(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().setFromMatrixColumn(viewFull, 0)), -center.dot(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().setFromMatrixColumn(viewFull, 1)), -center.dot(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().setFromMatrixColumn(viewFull, 2)));
            const projMatrix = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4().identity();
            const projectedVertices = [];
            let minX = 1 / 0;
            let minY = 1 / 0;
            let maxX = -1 / 0;
            let maxY = -1 / 0;
            const vpMatrix = projMatrix.clone().multiply(viewFull);
            for (const vert of vertices){
                const projected = vert.clone().applyMatrix4(vpMatrix);
                projectedVertices.push({
                    position: projected
                });
                const px = projected.x;
                const py = projected.y;
                if (px < minX) minX = px;
                if (py < minY) minY = py;
                if (px > maxX) maxX = px;
                if (py > maxY) maxY = py;
            }
            return {
                viewMatrix: viewFull,
                projMatrix,
                markers: projectedVertices,
                clipTask: v.clipTask ?? fallbackClipTask,
                groupId: this._mapGroupId(v.groupId),
                aabb: {
                    min: {
                        x: minX,
                        y: minY
                    },
                    max: {
                        x: maxX,
                        y: maxY
                    }
                },
                initialized: true
            };
        });
    }
    _mapGroupId(groupId) {
        if (!groupId) return 0;
        const existing = this.groupIdMap.get(groupId);
        if (void 0 !== existing) return existing;
        const nextId = this.groupIdMap.size % 8;
        this.groupIdMap.set(groupId, nextId);
        return nextId;
    }
    _buildClipState(volumes) {
        const clipTask = this._resolveClipTask(volumes);
        return {
            clipBoxes: this._buildClipBoxes(volumes),
            clipPolygons: this._buildClipPolygons(volumes, clipTask),
            clipTask
        };
    }
    _applyClipStateToAllMaterials(clipState) {
        for (const record of this.records.values())this._applyClipStateToMaterial(record.octree.material, clipState);
    }
    _resolveClipState(viewId) {
        if (!viewId || !this._hasScopedClipVolumes()) return this.globalClipState;
        return this._buildClipState(this._resolveClipVolumesForScope(viewId));
    }
    _resolveClipVolumesForScope(viewId) {
        if (!viewId) return this._getGlobalClipVolumes();
        if (!this._hasScopedClipVolumes()) return this.sourceClipVolumes;
        return this.sourceClipVolumes.filter((volume)=>null == volume.viewId || volume.viewId === viewId);
    }
    _getGlobalClipVolumes() {
        if (!this._hasScopedClipVolumes()) return this.sourceClipVolumes;
        return this.sourceClipVolumes.filter((volume)=>null == volume.viewId);
    }
    _hasScopedClipVolumes() {
        return this.sourceClipVolumes.some((volume)=>null != volume.viewId);
    }
    _isPreparedVisibility(frameNumber, scopeKey) {
        return this.preparedVisibilityFrameNumber === frameNumber && this.preparedVisibilityKeys.has(scopeKey);
    }
    _markPreparedVisibility(frameNumber, scopeKey) {
        this._clearPreparedVisibility(frameNumber);
        this.preparedVisibilityKeys.add(scopeKey);
    }
    _clearPreparedVisibility(frameNumber) {
        if (void 0 === frameNumber || this.preparedVisibilityFrameNumber !== frameNumber) {
            this.preparedVisibilityFrameNumber = frameNumber ?? -1;
            this.preparedVisibilityKeys.clear();
        }
    }
    _getVisibilityScopeKey(viewId) {
        if (!this._hasScopedClipVolumes()) return 'shared';
        return viewId ? `view:${viewId}` : 'global';
    }
    _applyClipStateToMaterial(material, clipState) {
        material.setClipBoxes(clipState.clipBoxes);
        material.setClipPolygons(clipState.clipPolygons, clipState.clipPolygons.length);
        material.clipTask = clipState.clipTask;
        material.clipMethod = this.config.clipMethod;
    }
}
export { FormatNotSupportedError, PointCloudPlugin };
