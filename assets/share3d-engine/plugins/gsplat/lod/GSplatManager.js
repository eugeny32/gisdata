import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__gpu_GSplatResolveSH_js_631f5d26__ from "../gpu/GSplatResolveSH.js";
import * as __WEBPACK_EXTERNAL_MODULE__sorting_GSplatUnifiedSorter_js_b44150fa__ from "../sorting/GSplatUnifiedSorter.js";
import * as __WEBPACK_EXTERNAL_MODULE__spatial_GSplatPicker_js_9b9f7b7c__ from "../spatial/GSplatPicker.js";
import * as __WEBPACK_EXTERNAL_MODULE__types_ManagerTypes_js_9a270aac__ from "../types/ManagerTypes.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__ from "../../../shared/constants/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_types_gsplat_js_2ba04999__ from "../../../shared/types/gsplat.js";
import * as __WEBPACK_EXTERNAL_MODULE__GSplatBudgetBalancer_js_1c0baebb__ from "./GSplatBudgetBalancer.js";
import * as __WEBPACK_EXTERNAL_MODULE__GSplatInfo_js_d09f7cc5__ from "./GSplatInfo.js";
import * as __WEBPACK_EXTERNAL_MODULE__GSplatOctreeInstance_js_ebb61c9d__ from "./GSplatOctreeInstance.js";
import * as __WEBPACK_EXTERNAL_MODULE__GSplatParams_js_ac2e4c18__ from "./GSplatParams.js";
import * as __WEBPACK_EXTERNAL_MODULE__GSplatWorkBuffer_js_ec84d73f__ from "./GSplatWorkBuffer.js";
import * as __WEBPACK_EXTERNAL_MODULE__GSplatWorldState_js_00752deb__ from "./GSplatWorldState.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('gsplat:lod');
const DEFAULT_ORDER_UPLOAD_SCHEDULER = {
    orderUploadMode: 'auto',
    minOrderUploadIntervalMs: 250,
    maxOrderUploadDelayMs: 1000,
    maxImmediateOrderUploadBytes: 2097152,
    maxOrderUploadBytesPerFrame: 2097152,
    maxOrderUploadChunksPerFrame: 1,
    firstOrderUploadMode: 'full',
    allowFirstOrderFallback: true,
    allowFullUploadFallback: true
};
const PLAYCANVAS_ALLOCATOR_GROW_MULTIPLIER = 1.15;
const INTERACTIVE_ORDER_UPLOAD_GRACE_MS = 180;
function createDefaultBudgetRuntimeDiagnostics() {
    return {
        budgetScale: 1,
        globalMaxDistance: 0,
        adjustedBudget: 0,
        paddingEstimate: 0,
        rawOptimalSplats: 0,
        budgetTextureWidth: 0,
        fixedSplats: 0,
        octreeBudget: 0,
        cameraAspect: 0
    };
}
function createDefaultOrderUploadDiagnostics() {
    return {
        scheduledUploadCount: 0,
        scheduledUploadBytes: 0,
        lastScheduledUploadBytes: 0,
        lastScheduledTextureSize: 0,
        lastScheduledAtMs: null,
        lastApplyReason: null,
        lastAppliedSortGeneration: 0,
        lastAppliedPendingOrderSkippedFrameCount: 0,
        coalescedResultCount: 0,
        staleResultCount: 0,
        observedUploadCount: 0,
        lastObservedAtMs: null,
        observedUploadAvailable: false,
        submittedRequestCount: 0,
        queuedRequestCount: 0,
        replayedRequestCount: 0,
        overwrittenRequestCount: 0,
        rejectedRequestCount: 0,
        workerErrorCount: 0,
        lastRequestToSubmitLatencyMs: null,
        lastWorkerToApplyLatencyMs: null,
        orderBufferConservativeCopyCount: 0,
        orderBufferSynchronousCopyCount: 0,
        orderBufferAllocCount: 0,
        orderBufferReuseCount: 0,
        orderBufferReleaseCount: 0,
        pendingOrderBufferLeaseCount: 0,
        adaptiveReplayDeferralCount: 0,
        adaptiveReplayTimerFireCount: 0,
        adaptiveSortIntervalMs: 0,
        workerSortTimeEmaMs: 0,
        pendingReplayDelayMs: null,
        stagingTotalBytes: 0,
        stagingSubmittedBytes: 0,
        stagingRemainingBytes: 0,
        stagingSubmittedChunks: 0,
        stagingRemainingChunks: 0,
        lastFrameSubmittedBytes: 0,
        lastFrameSubmittedChunks: 0,
        byteBudgetBlockedCount: 0,
        chunkBudgetBlockedCount: 0,
        minRowBudgetOverrideCount: 0,
        chunkedUploadCount: 0,
        fullUploadCount: 0,
        fallbackUploadCount: 0,
        abortedStagingJobCount: 0,
        activeCommitCount: 0,
        lastCommitGeneration: null,
        lastCommitReason: null,
        lastCommitVisibleCount: 0,
        lastFallbackReason: null,
        firstOrderStrategy: null,
        firstOrderFallbackActive: false,
        forcedDrainActive: false
    };
}
function createDefaultNowMs() {
    const perf = globalThis.performance;
    if (perf && 'function' == typeof perf.now) return ()=>perf.now();
    return ()=>Date.now();
}
function normalizeOrderUploadSchedulerOptions(options) {
    const normalized = {};
    if (!options) return normalized;
    if (options.orderUploadMode) normalized.orderUploadMode = options.orderUploadMode;
    if ('number' == typeof options.minOrderUploadIntervalMs) normalized.minOrderUploadIntervalMs = Math.max(0, options.minOrderUploadIntervalMs);
    if ('number' == typeof options.maxOrderUploadDelayMs) normalized.maxOrderUploadDelayMs = Math.max(0, options.maxOrderUploadDelayMs);
    if ('number' == typeof options.maxImmediateOrderUploadBytes) normalized.maxImmediateOrderUploadBytes = Math.max(0, options.maxImmediateOrderUploadBytes);
    if ('number' == typeof options.maxOrderUploadBytesPerFrame) normalized.maxOrderUploadBytesPerFrame = Math.max(0, options.maxOrderUploadBytesPerFrame);
    if ('number' == typeof options.maxOrderUploadChunksPerFrame) normalized.maxOrderUploadChunksPerFrame = Math.max(0, Math.floor(options.maxOrderUploadChunksPerFrame));
    if (options.firstOrderUploadMode) normalized.firstOrderUploadMode = options.firstOrderUploadMode;
    if ('boolean' == typeof options.allowFirstOrderFallback) normalized.allowFirstOrderFallback = options.allowFirstOrderFallback;
    if ('boolean' == typeof options.allowFullUploadFallback) normalized.allowFullUploadFallback = options.allowFullUploadFallback;
    return normalized;
}
const scalarFilterDebugGlobal = globalThis;
function isScalarFilterDebugEnabled() {
    return true === scalarFilterDebugGlobal.__POTREE_GS_SCALAR_DEBUG__;
}
function getScalarModeLabel(mode) {
    switch(mode){
        case __WEBPACK_EXTERNAL_MODULE__GSplatWorkBuffer_js_ec84d73f__.GSplatScalarMode.Volume:
            return 'volume';
        case __WEBPACK_EXTERNAL_MODULE__GSplatWorkBuffer_js_ec84d73f__.GSplatScalarMode.SurfaceArea:
            return 'surface-area';
        case __WEBPACK_EXTERNAL_MODULE__GSplatWorkBuffer_js_ec84d73f__.GSplatScalarMode.Value:
            return 'value';
        default:
            return 'none';
    }
}
function clampPercentile(value, fallback) {
    if (!Number.isFinite(value)) return fallback;
    return Math.min(100, Math.max(0, value ?? fallback));
}
function getPercentileValue(sortedSamples, percentile) {
    if (0 === sortedSamples.length) return 0;
    if (1 === sortedSamples.length) return sortedSamples[0];
    const clamped = Math.min(100, Math.max(0, percentile));
    const position = clamped / 100 * (sortedSamples.length - 1);
    const lowerIndex = Math.floor(position);
    const upperIndex = Math.ceil(position);
    if (lowerIndex === upperIndex) return sortedSamples[lowerIndex];
    const ratio = position - lowerIndex;
    return sortedSamples[lowerIndex] * (1 - ratio) + sortedSamples[upperIndex] * ratio;
}
function getHistogramScaleTransform(scale, min, max) {
    if ('log' !== scale) return (value)=>value;
    const range = Math.max(0, max - min);
    const offset = Math.max(range / __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.GSPLAT_LOG_SCALE_DIVISOR, __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.EPSILON_ULTRA);
    return (value)=>{
        const shifted = Math.max(0, value - min);
        return Math.log10(shifted + offset);
    };
}
class GSplatManager {
    get colorUpdateDistance() {
        return this.params.colorUpdateDistance;
    }
    get colorUpdateAngle() {
        return this.params.colorUpdateAngle;
    }
    get colorUpdateDistanceLodScale() {
        return this.params.colorUpdateDistanceLodScale;
    }
    get colorUpdateAngleLodScale() {
        return this.params.colorUpdateAngleLodScale;
    }
    get colorizeLod() {
        return this.params.colorizeLod;
    }
    get colorizeColorUpdate() {
        return this.params.colorizeColorUpdate;
    }
    get radialSort() {
        return this.params.radialSorting;
    }
    constructor(renderer, cameraNode, params, options){
        this.worldStates = new Map();
        this.lastWorldStateVersion = 0;
        this.sortedVersion = 0;
        this.pendingOrder = null;
        this.stagingOrder = null;
        this.stagingOrderApplyReason = null;
        this.stagingOrderForcedDrain = false;
        this.lastAppliedSortGeneration = 0;
        this.lastOrderUploadScheduledAtMs = Number.NEGATIVE_INFINITY;
        this.lastInteractiveSortAtMs = Number.NEGATIVE_INFINITY;
        this.orderUploadScheduler = {
            ...DEFAULT_ORDER_UPLOAD_SCHEDULER
        };
        this.orderUploadNowMs = createDefaultNowMs();
        this.onSortResultReady = null;
        this._orderUploadDiagnostics = createDefaultOrderUploadDiagnostics();
        this.orderUploadObservedProbeInstalled = false;
        this.observedOrderTexture = null;
        this.previousObservedOrderTextureOnUpdate = null;
        this.firstWorldStateLogged = false;
        this.firstSortedOrderLogged = false;
        this.firstOrderAppliedLogged = false;
        this.firstWorkBufferRenderLogged = false;
        this.firstVisibleSplatsLogged = false;
        this._pickStateVersion = 0;
        this.sortNeeded = true;
        this.layerPlacementsDirty = false;
        this.framesTillFullUpdate = 0;
        this.worldStateUpdateCooldown = 0;
        this.lastLodCameraPos = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1 / 0, 1 / 0, 1 / 0);
        this.lastLodCameraFwd = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1 / 0, 1 / 0, 1 / 0);
        this.lastLodCameraFov = -1;
        this.lastLodCameraAspect = -1;
        this.lastSortCameraPos = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1 / 0, 1 / 0, 1 / 0);
        this.lastSortCameraFwd = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1 / 0, 1 / 0, 1 / 0);
        this.lastColorUpdateCameraPos = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1 / 0, 1 / 0, 1 / 0);
        this.lastColorUpdateCameraFwd = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1 / 0, 1 / 0, 1 / 0);
        this.layerPlacements = [];
        this.octreeInstances = new Map();
        this.octreeInstancesToDestroy = [];
        this.retiredOctrees = new Set();
        this.hasNewOctreeInstances = false;
        this._tempCameraPos = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        this._tempCameraRot = new __WEBPACK_EXTERNAL_MODULE_three__.Quaternion();
        this._tempCameraDir = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        this._tempUpdatedSplats = [];
        this._tempSplatsNeedingColorUpdate = [];
        this._tempNonOctreePlacements = new Set();
        this._tempOctreePlacements = new Set();
        this._tempOctreesTicked = new Set();
        this._tempWorkBufferRenderedPlacements = new Set();
        this._tempBudgetAabbCenter = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        this._tempBudgetAabbSize = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        this._tempBudgetScale = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        this._workBufferDirty = false;
        this.budgetBalancer = new __WEBPACK_EXTERNAL_MODULE__GSplatBudgetBalancer_js_1c0baebb__.GSplatBudgetBalancer();
        this.budgetScale = 1.0;
        this._budgetRuntimeDiagnostics = createDefaultBudgetRuntimeDiagnostics();
        this.shUpdateDistanceThreshold = 0.05;
        this.shUpdateAngleThreshold = 0.02;
        this.lastSortPosition = null;
        this.sortMoveThreshold = 0.001;
        this._destroyed = false;
        this.resolveSH = null;
        this.currentSHBands = 0;
        this._scalarFilterEnabled = false;
        this._scalarFilterMode = __WEBPACK_EXTERNAL_MODULE__GSplatWorkBuffer_js_ec84d73f__.GSplatScalarMode.None;
        this._scalarFilterMin = 0;
        this._scalarFilterMax = 1;
        this._scalarValues = null;
        this._scalarValuesVersion = -1;
        this._scalarValuesMode = __WEBPACK_EXTERNAL_MODULE__GSplatWorkBuffer_js_ec84d73f__.GSplatScalarMode.None;
        this.renderer = renderer;
        this.cameraNode = cameraNode;
        this.params = params ?? new __WEBPACK_EXTERNAL_MODULE__GSplatParams_js_ac2e4c18__.GSplatParams();
        this.orderUploadScheduler = {
            ...DEFAULT_ORDER_UPLOAD_SCHEDULER,
            ...normalizeOrderUploadSchedulerOptions(options?.orderUploadScheduler)
        };
        this.interactiveSortScheduler = options?.interactiveSortScheduler ? {
            ...options.interactiveSortScheduler
        } : void 0;
        this.orderUploadNowMs = options?.nowMs ?? createDefaultNowMs();
        this.onSortResultReady = options?.onSortResultReady ?? null;
        this.workBuffer = new __WEBPACK_EXTERNAL_MODULE__GSplatWorkBuffer_js_ec84d73f__.GSplatWorkBuffer(renderer);
        try {
            this.installOrderUploadObservedHook();
            this.sorter = this.createSorter();
        } catch (error) {
            this.restoreOrderUploadObservedHook();
            this.resetScalarValuesCache();
            this.onSortResultReady = null;
            this.workBuffer.destroy();
            throw error;
        }
    }
    setOrderUploadSchedulerOptions(options) {
        this.orderUploadScheduler = {
            ...this.orderUploadScheduler,
            ...normalizeOrderUploadSchedulerOptions(options)
        };
    }
    setInteractiveSortSchedulerConfig(config) {
        this.interactiveSortScheduler = config ? {
            ...config
        } : void 0;
        this.sorter.setInteractiveSortSchedulerConfig(this.interactiveSortScheduler);
    }
    setOnSortResultReady(callback) {
        this.onSortResultReady = callback;
    }
    createSorter() {
        const sorter = new __WEBPACK_EXTERNAL_MODULE__sorting_GSplatUnifiedSorter_js_b44150fa__.GSplatUnifiedSorter({
            interactiveSortScheduler: this.interactiveSortScheduler,
            nowMs: this.orderUploadNowMs
        });
        try {
            sorter.on('sorted', this.onSorted.bind(this));
            sorter.setOnSortJobSettledCallback(()=>this.onSortResultReady?.());
            return sorter;
        } catch (error) {
            sorter.destroy();
            throw error;
        }
    }
    installOrderUploadObservedHook() {
        const texture = this.workBuffer.orderTexture;
        if (this.observedOrderTexture === texture) return;
        if (this.observedOrderTexture) this.observedOrderTexture.onUpdate = this.previousObservedOrderTextureOnUpdate ?? null;
        const previousOnUpdate = texture.onUpdate;
        this.observedOrderTexture = texture;
        this.previousObservedOrderTextureOnUpdate = previousOnUpdate;
        this.orderUploadObservedProbeInstalled = true;
        this._orderUploadDiagnostics.observedUploadAvailable = true;
        texture.onUpdate = ()=>{
            previousOnUpdate?.call(texture, texture);
            this._orderUploadDiagnostics.observedUploadCount++;
            this._orderUploadDiagnostics.lastObservedAtMs = this.orderUploadNowMs();
        };
    }
    restoreOrderUploadObservedHook() {
        if (this.observedOrderTexture) this.observedOrderTexture.onUpdate = this.previousObservedOrderTextureOnUpdate ?? null;
        this.observedOrderTexture = null;
        this.previousObservedOrderTextureOnUpdate = null;
        this.orderUploadObservedProbeInstalled = false;
        this._orderUploadDiagnostics.observedUploadAvailable = false;
    }
    initResolveSH(shBands, centroidsTexture, shNMins, shNMaxs) {
        if (!this.params.highQualitySH || 0 === shBands || !centroidsTexture) return;
        if (this.currentSHBands !== shBands) {
            if (this.resolveSH) this.resolveSH.dispose();
            this.resolveSH = new __WEBPACK_EXTERNAL_MODULE__gpu_GSplatResolveSH_js_631f5d26__.GSplatResolveSH(this.renderer, shBands);
            this.currentSHBands = shBands;
        }
        if (this.resolveSH) this.resolveSH.setCentroids(centroidsTexture, shNMins, shNMaxs);
    }
    destroy() {
        if (this._destroyed) return;
        this._destroyed = true;
        this.abortStagingOrder('destroy');
        if (this.pendingOrder) {
            this.releasePendingOrder(this.pendingOrder);
            this.pendingOrder = null;
        }
        if (this.resolveSH) {
            this.resolveSH.dispose();
            this.resolveSH = null;
        }
        for (const [, worldState] of this.worldStates)this.destroyWorldState(worldState);
        this.worldStates.clear();
        this._tempOctreesTicked.clear();
        for (const [, instance] of this.octreeInstances){
            this._tempOctreesTicked.add(instance.octree);
            instance.destroy(0);
        }
        this.octreeInstances.clear();
        for (const retirement of this.octreeInstancesToDestroy){
            this._tempOctreesTicked.add(retirement.instance.octree);
            retirement.instance.destroy(0);
        }
        this.octreeInstancesToDestroy.length = 0;
        for (const octree of this.retiredOctrees)this._tempOctreesTicked.add(octree);
        this.retiredOctrees.clear();
        for (const octree of this._tempOctreesTicked)octree.flushCooldowns();
        this._tempOctreesTicked.clear();
        this.restoreOrderUploadObservedHook();
        this.resetScalarValuesCache();
        this.onSortResultReady = null;
        this.workBuffer.destroy();
        this.sorter.destroy();
    }
    reconcile(placements) {
        this._tempNonOctreePlacements.clear();
        this._tempOctreePlacements.clear();
        for (const p of placements)if (p.octree) {
            if (!this.octreeInstances.has(p)) {
                this.octreeInstances.set(p, new __WEBPACK_EXTERNAL_MODULE__GSplatOctreeInstance_js_ebb61c9d__.GSplatOctreeInstance(p.octree, p, this.renderer));
                this.hasNewOctreeInstances = true;
            }
            this._tempOctreePlacements.add(p);
        } else this._tempNonOctreePlacements.add(p);
        for (const [placement, inst] of this.octreeInstances)if (!this._tempOctreePlacements.has(placement)) {
            this.octreeInstances.delete(placement);
            this.layerPlacementsDirty = true;
            this.octreeInstancesToDestroy.push({
                instance: inst,
                retireAfterVersion: null
            });
        }
        this.layerPlacementsDirty ||= this.layerPlacements.length !== this._tempNonOctreePlacements.size;
        if (!this.layerPlacementsDirty) for(let i = 0; i < this.layerPlacements.length; i++){
            const existing = this.layerPlacements[i];
            if (!this._tempNonOctreePlacements.has(existing)) {
                this.layerPlacementsDirty = true;
                break;
            }
        }
        this.layerPlacements.length = 0;
        for (const p of this._tempNonOctreePlacements)this.layerPlacements.push(p);
        this._tempNonOctreePlacements.clear();
        this._tempOctreePlacements.clear();
    }
    updateWorldState() {
        const worldChanged = this.layerPlacementsDirty || 0 === this.worldStates.size;
        if (!worldChanged) return;
        this.lastWorldStateVersion++;
        const splats = [];
        for (const p of this.layerPlacements)if (p.resource) {
            const geometry = (0, __WEBPACK_EXTERNAL_MODULE__types_ManagerTypes_js_9a270aac__.hasGeometry)(p.node) ? p.node.geometry : void 0;
            const splatInfo = new __WEBPACK_EXTERNAL_MODULE__GSplatInfo_js_d09f7cc5__.GSplatInfo(p.resource, p, geometry);
            splatInfo.resetColorAccumulators(this.colorUpdateAngle, this.colorUpdateDistance);
            splats.push(splatInfo);
        }
        for (const [, inst] of this.octreeInstances)inst.activePlacements.forEach((p)=>{
            if (p.resource) {
                const geometry = (0, __WEBPACK_EXTERNAL_MODULE__types_ManagerTypes_js_9a270aac__.hasGeometry)(p.node) ? p.node.geometry : void 0;
                const splatInfo = new __WEBPACK_EXTERNAL_MODULE__GSplatInfo_js_d09f7cc5__.GSplatInfo(p.resource, p, geometry);
                splatInfo.resetColorAccumulators(this.colorUpdateAngle, this.colorUpdateDistance);
                splats.push(splatInfo);
            }
        });
        this.sorter.updateCentersForSplats(splats, this.params.sortVisibilityCompact || this.params.sortVisibilityScreenCompact);
        const newState = new __WEBPACK_EXTERNAL_MODULE__GSplatWorldState_js_00752deb__.GSplatWorldState(this.lastWorldStateVersion, splats, 8192, this.getBudgetTextureSizeFloor());
        for (const splat of newState.splats){
            if ((0, __WEBPACK_EXTERNAL_MODULE__types_ManagerTypes_js_9a270aac__.hasRefCounting)(splat.resource)) splat.resource.incRefCount();
            this.prewarmWorkBufferShaders(splat);
        }
        this.worldStates.set(this.lastWorldStateVersion, newState);
        this.assignPendingOctreeRetirementVersion(this.lastWorldStateVersion);
        this.pruneWorldStatesForUnavailableSorter(this.lastWorldStateVersion);
        if (!this.firstWorldStateLogged && newState.splats.length > 0) {
            this.firstWorldStateLogged = true;
            log.debug(`[GSplatManager] first world state created, version=${newState.version}, splats=${newState.splats.length}, activeSplats=${newState.totalActiveSplats}, textureSize=${newState.textureSize}`);
        }
        this.layerPlacementsDirty = false;
        this.sortNeeded = true;
    }
    destroyWorldState(worldState) {
        for (const splat of worldState.splats)if ((0, __WEBPACK_EXTERNAL_MODULE__types_ManagerTypes_js_9a270aac__.hasRefCounting)(splat.resource)) splat.resource.decRefCount();
        worldState.destroy();
    }
    pruneWorldStatesForUnavailableSorter(latestVersion) {
        if (!this.sorter.isWorkerUnavailable) return;
        for (const [version, worldState] of this.worldStates)if (version !== this.sortedVersion && version !== latestVersion) {
            if (this.pendingOrder?.version === version) {
                this.releasePendingOrder(this.pendingOrder);
                this.pendingOrder = null;
            }
            if (this.stagingOrder?.version === version) this.abortStagingOrder('worker-unavailable-world-state-pruned');
            this.worldStates.delete(version);
            this.destroyWorldState(worldState);
        }
    }
    assignPendingOctreeRetirementVersion(version) {
        for (const retirement of this.octreeInstancesToDestroy ?? [])if (null === retirement.retireAfterVersion) retirement.retireAfterVersion = version;
    }
    retireOctreeInstancesThroughVersion(version) {
        const retirements = this.octreeInstancesToDestroy;
        if (!retirements || 0 === retirements.length) return;
        const pendingRetirements = [];
        for (const retirement of retirements){
            if (null === retirement.retireAfterVersion || retirement.retireAfterVersion > version) {
                pendingRetirements.push(retirement);
                continue;
            }
            const octree = retirement.instance.octree;
            retirement.instance.destroy();
            if (octree.hasPendingCooldowns) {
                this.retiredOctrees ??= new Set();
                this.retiredOctrees.add(octree);
            }
        }
        this.octreeInstancesToDestroy = pendingRetirements;
    }
    prewarmWorkBufferShaders(splat) {
        const resource = splat.resource;
        const shBands = resource.shBands || 0;
        const isSogs = 'GSplatSogsResource' === resource.constructor.name || 'meta' in resource;
        const modifier = splat.placement.workBufferModifier;
        this.workBuffer.prewarmRenderInfo('full', shBands, isSogs, modifier);
        this.workBuffer.prewarmRenderInfo('colorOnly', shBands, isSogs, modifier);
        if (this._scalarFilterMode !== __WEBPACK_EXTERNAL_MODULE__GSplatWorkBuffer_js_ec84d73f__.GSplatScalarMode.None) this.workBuffer.prewarmRenderInfo('scalarOnly', shBands, isSogs, modifier);
    }
    setWorkBufferModifierForPlacement(placement, modifier) {
        let applied = false;
        for (const layerPlacement of this.layerPlacements)if (layerPlacement === placement) {
            layerPlacement.workBufferModifier = modifier;
            applied = true;
        }
        const instance = this.octreeInstances.get(placement);
        if (instance) {
            instance.setWorkBufferModifier(modifier);
            applied = true;
        }
        if (applied) this.markWorkBufferDirty();
        return applied;
    }
    setWorkBufferUpdateModeForPlacement(placement, mode) {
        let applied = false;
        for (const layerPlacement of this.layerPlacements)if (layerPlacement === placement) {
            layerPlacement.workBufferUpdateMode = mode;
            applied = true;
        }
        const instance = this.octreeInstances.get(placement);
        if (instance) {
            instance.setWorkBufferUpdateMode(mode);
            applied = true;
        }
        if (applied && mode !== __WEBPACK_EXTERNAL_MODULE__shared_types_gsplat_js_2ba04999__.GSPLAT_WORKBUFFER_UPDATE_AUTO) this.markWorkBufferDirty();
        return applied;
    }
    markWorkBufferDirty() {
        this._workBufferDirty = true;
    }
    shouldForceWorkBufferRender(splats) {
        if (this._workBufferDirty) return true;
        for (const splat of splats){
            const mode = splat.placement.workBufferUpdateMode;
            if (mode === __WEBPACK_EXTERNAL_MODULE__shared_types_gsplat_js_2ba04999__.GSPLAT_WORKBUFFER_UPDATE_ALWAYS || mode === __WEBPACK_EXTERNAL_MODULE__shared_types_gsplat_js_2ba04999__.GSPLAT_WORKBUFFER_UPDATE_ONCE) return true;
        }
        return false;
    }
    consumeWorkBufferUpdateOnce(splats) {
        const renderedPlacements = void 0 !== splats ? this._tempWorkBufferRenderedPlacements : null;
        if (renderedPlacements) {
            renderedPlacements.clear();
            for (const splat of splats ?? [])renderedPlacements.add(splat.placement);
        }
        for (const placement of this.layerPlacements)if ((!renderedPlacements || renderedPlacements.has(placement)) && placement.workBufferUpdateMode === __WEBPACK_EXTERNAL_MODULE__shared_types_gsplat_js_2ba04999__.GSPLAT_WORKBUFFER_UPDATE_ONCE) placement.workBufferUpdateMode = __WEBPACK_EXTERNAL_MODULE__shared_types_gsplat_js_2ba04999__.GSPLAT_WORKBUFFER_UPDATE_AUTO;
        for (const instance of this.octreeInstances.values())instance.consumeWorkBufferUpdateOnce(renderedPlacements ?? void 0);
        renderedPlacements?.clear();
    }
    getVisualActivitySnapshot() {
        const reasons = [];
        const hasPlacements = this.layerPlacements.length > 0 || this.octreeInstances.size > 0;
        if (hasPlacements && (this.params.dirty || this.layerPlacementsDirty || 0 === this.worldStates.size)) reasons.push('gsplat.worldStateDirty');
        if (this.canAdvanceLodPresentationWork()) reasons.push('gsplat.lodPresentationWork');
        if (this.hasOctreeCooldownTickWork()) reasons.push('gsplat.lodCooldown');
        if (hasPlacements && this.sortNeeded && !this.sorter.isWorkerUnavailable) reasons.push('gsplat.sortNeeded');
        if (this.pendingOrder) reasons.push('gsplat.pendingOrder');
        if (this.stagingOrder) reasons.push('gsplat.stagingOrderUpload');
        if (this._workBufferDirty) reasons.push('gsplat.workBufferDirty');
        if (this.hasWorkBufferUpdateMode(__WEBPACK_EXTERNAL_MODULE__shared_types_gsplat_js_2ba04999__.GSPLAT_WORKBUFFER_UPDATE_ONCE)) reasons.push('gsplat.workBufferOnce');
        if (this.hasWorkBufferUpdateMode(__WEBPACK_EXTERNAL_MODULE__shared_types_gsplat_js_2ba04999__.GSPLAT_WORKBUFFER_UPDATE_ALWAYS)) reasons.push('gsplat.workBufferAlways');
        return {
            needsNextFrame: reasons.length > 0,
            reasons
        };
    }
    hasWorkBufferUpdateMode(mode) {
        for (const placement of this.layerPlacements)if (placement.workBufferUpdateMode === mode) return true;
        for (const instance of this.octreeInstances.values()){
            if (instance.placement.workBufferUpdateMode === mode) return true;
            for (const placement of instance.activePlacements)if (placement.workBufferUpdateMode === mode) return true;
        }
        const sortedState = this.worldStates.get(this.sortedVersion);
        for (const splat of sortedState?.splats ?? [])if (splat.placement.workBufferUpdateMode === mode) return true;
        return false;
    }
    hasLodPresentationWorkPending() {
        for (const instance of this.octreeInstances.values())if (instance.lodPresentationWorkPending) return true;
        return false;
    }
    hasOctreeCooldownTickWork() {
        let hasCooldownTickWork = false;
        for (const instance of this.octreeInstances.values())hasCooldownTickWork ||= instance.octree?.hasCooldownTickWork === true;
        for (const retirement of this.octreeInstancesToDestroy ?? [])hasCooldownTickWork ||= retirement.instance.octree.hasCooldownTickWork;
        for (const octree of this.retiredOctrees ?? [])if (octree.hasPendingCooldowns) hasCooldownTickWork ||= octree.hasCooldownTickWork;
        else this.retiredOctrees.delete(octree);
        return hasCooldownTickWork;
    }
    canAdvanceLodPresentationWork() {
        return this.sorter.jobsInFlight < 3 && this.hasLodPresentationWorkPending();
    }
    releasePendingOrder(pending) {
        pending.releaseOrderData?.();
    }
    abortStagingOrder(reason) {
        if (!this.stagingOrder) return;
        this.workBuffer.abortOrderStaging();
        this.releasePendingOrder(this.stagingOrder);
        this.stagingOrder = null;
        this.stagingOrderApplyReason = null;
        this.stagingOrderForcedDrain = false;
        this._orderUploadDiagnostics.abortedStagingJobCount = (this._orderUploadDiagnostics.abortedStagingJobCount ?? 0) + 1;
        this._orderUploadDiagnostics.lastFallbackReason = reason;
    }
    estimateOrderUploadBytes(visibleCount, textureSize, orderDataLength) {
        const width = Math.max(1, Math.floor(textureSize));
        const validElements = Math.min(Math.max(0, Math.floor(visibleCount)), Math.max(0, orderDataLength), width * width);
        if (0 === validElements) return 0;
        return Math.ceil(validElements / width) * width * Uint32Array.BYTES_PER_ELEMENT;
    }
    onSorted(count, version, orderData, sortGeneration = 0, metadata) {
        const generation = Number.isFinite(sortGeneration) ? Math.max(0, Math.floor(sortGeneration)) : 0;
        const releaseOrderData = metadata?.releaseOrderData;
        if (generation > 0 && generation <= this.lastAppliedSortGeneration) {
            this._orderUploadDiagnostics.staleResultCount++;
            releaseOrderData?.();
            return;
        }
        const pendingWorldState = this.worldStates.get(version);
        if (!pendingWorldState || version < this.sortedVersion) {
            this._orderUploadDiagnostics.staleResultCount++;
            releaseOrderData?.();
            if (!pendingWorldState) log.warn(`GSplatManager: World state with version ${version} not found`);
            return;
        }
        if (this.stagingOrder && generation > 0 && this.stagingOrder.sortGeneration >= generation) {
            this._orderUploadDiagnostics.staleResultCount++;
            releaseOrderData?.();
            return;
        }
        if (this.pendingOrder && generation > 0 && this.pendingOrder.sortGeneration >= generation) {
            this._orderUploadDiagnostics.staleResultCount++;
            releaseOrderData?.();
            return;
        }
        const previousSkippedFrameCount = this.pendingOrder?.skippedFrameCount ?? 0;
        if (this.stagingOrder && !this.stagingOrderForcedDrain) {
            this._orderUploadDiagnostics.coalescedResultCount++;
            this.abortStagingOrder('new-generation');
        }
        if (this.pendingOrder) {
            this._orderUploadDiagnostics.coalescedResultCount++;
            this.releasePendingOrder(this.pendingOrder);
        }
        const pendingTextureSize = pendingWorldState.textureSize;
        const safeOrderData = releaseOrderData ? orderData : new Uint32Array(orderData);
        if (!releaseOrderData) this._orderUploadDiagnostics.orderBufferConservativeCopyCount++;
        this.pendingOrder = {
            count,
            version,
            sortGeneration: generation,
            orderData: safeOrderData,
            releaseOrderData,
            receivedAtMs: this.orderUploadNowMs(),
            workerCompletedAtMs: metadata?.completedAtMs ?? this.orderUploadNowMs(),
            requestToSubmitLatencyMs: metadata?.requestToSubmitLatencyMs ?? null,
            skippedFrameCount: previousSkippedFrameCount,
            textureSize: pendingTextureSize,
            estimatedBytes: this.estimateOrderUploadBytes(count, pendingTextureSize, safeOrderData.length)
        };
        this._orderUploadDiagnostics.lastRequestToSubmitLatencyMs = metadata?.requestToSubmitLatencyMs ?? this._orderUploadDiagnostics.lastRequestToSubmitLatencyMs;
        if (!this.firstSortedOrderLogged) {
            this.firstSortedOrderLogged = true;
            log.debug(`[GSplatManager] first sorted order received, version=${version}, generation=${generation}, visibleSplats=${count}, textureSize=${pendingTextureSize}, workerTime=${metadata?.workerTimeMs?.toFixed(1) ?? 'unknown'}ms`);
        }
    }
    tryApplyPendingOrder() {
        if (this.stagingOrder) {
            if (this.shouldPrioritizeInteractiveOrderUpload(this.stagingOrder)) return this.fallbackStagingOrderToFullUpload('interactive-sort');
            return this.advanceStagingOrderUpload();
        }
        if (!this.pendingOrder) return false;
        const decision = this.getPendingOrderApplyDecision();
        if (!decision) {
            this.pendingOrder.skippedFrameCount++;
            return false;
        }
        if ('full' === decision.mode) return this.applyPendingOrderFullUpload(decision.reason);
        return this.beginPendingOrderStaging(decision.reason, decision.forcedDrain);
    }
    getPendingOrderApplyDecision() {
        const pending = this.pendingOrder;
        if (!pending) return null;
        if (0 === this.sortedVersion) {
            const firstOrderMode = this.orderUploadScheduler.firstOrderUploadMode;
            this._orderUploadDiagnostics.firstOrderStrategy = firstOrderMode;
            if ('chunked-with-fallback' === firstOrderMode) {
                if (!this.orderUploadScheduler.allowFirstOrderFallback) return {
                    reason: 'first-result',
                    mode: 'full',
                    forcedDrain: false
                };
                this._orderUploadDiagnostics.firstOrderFallbackActive = true;
                return {
                    reason: 'first-result-fallback',
                    mode: 'chunked',
                    forcedDrain: true
                };
            }
            return {
                reason: 'first-result',
                mode: 'full',
                forcedDrain: false
            };
        }
        if (this.shouldPrioritizeInteractiveOrderUpload(pending)) return {
            reason: 'interactive-sort',
            mode: 'full',
            forcedDrain: false
        };
        const now = this.orderUploadNowMs();
        const ageMs = Math.max(0, now - pending.receivedAtMs);
        let reason = null;
        let forcedDrain = false;
        if (ageMs >= this.orderUploadScheduler.maxOrderUploadDelayMs) {
            reason = 'max-delay';
            forcedDrain = true;
        }
        const maxImmediateBytes = this.orderUploadScheduler.maxImmediateOrderUploadBytes;
        if (!reason && maxImmediateBytes >= 0 && pending.estimatedBytes <= maxImmediateBytes) reason = 'immediate-size';
        const elapsedMs = now - this.lastOrderUploadScheduledAtMs;
        if (!reason && elapsedMs >= this.orderUploadScheduler.minOrderUploadIntervalMs) reason = 'interval';
        if (!reason) return null;
        const mode = this.getOrderUploadModeForPending(pending);
        return {
            reason,
            mode,
            forcedDrain
        };
    }
    shouldPrioritizeInteractiveOrderUpload(pending) {
        return 'auto' === this.orderUploadScheduler.orderUploadMode && (this.sortNeeded || (this.sorter?.jobsInFlight ?? 0) > 0 || this.hasPendingSortReplayRequest() || pending.skippedFrameCount > 0 || this.hasRecentInteractiveSortActivity()) && pending.sortGeneration > 0;
    }
    hasPendingSortReplayRequest() {
        return this.sorter?.diagnostics?.pendingRequestAgeMs != null;
    }
    markInteractiveSortActivity() {
        this.lastInteractiveSortAtMs = this.getOrderUploadNowMs();
    }
    hasRecentInteractiveSortActivity() {
        return this.getOrderUploadNowMs() - this.lastInteractiveSortAtMs < INTERACTIVE_ORDER_UPLOAD_GRACE_MS;
    }
    getOrderUploadNowMs() {
        return 'function' == typeof this.orderUploadNowMs ? this.orderUploadNowMs() : 0;
    }
    getOrderUploadModeForPending(pending) {
        const mode = this.orderUploadScheduler.orderUploadMode;
        if ('full' === mode) return 'full';
        if ('chunked' === mode) return 'chunked';
        if (pending.estimatedBytes <= this.orderUploadScheduler.maxImmediateOrderUploadBytes) return 'full';
        return 'chunked';
    }
    applyPendingOrderFullUpload(reason) {
        const pending = this.pendingOrder;
        if (!pending) return false;
        this.pendingOrder = null;
        if (pending.sortGeneration > 0 && pending.sortGeneration <= this.lastAppliedSortGeneration || pending.version < this.sortedVersion) {
            this._orderUploadDiagnostics.staleResultCount++;
            this.releasePendingOrder(pending);
            return false;
        }
        const worldState = this.worldStates.get(pending.version);
        if (!worldState) {
            this._orderUploadDiagnostics.staleResultCount++;
            this.releasePendingOrder(pending);
            log.warn(`GSplatManager: World state with version ${pending.version} not found`);
            return false;
        }
        worldState.sortedVisibleSplatCount = Math.min(worldState.totalActiveSplats, Math.max(0, Math.floor(pending.count)));
        if (worldState.textureSize !== this.workBuffer.textureSize) this.workBuffer.resize(worldState.textureSize);
        const orderUploadResult = this.workBuffer.setOrderData(pending.orderData) ?? {
            synchronousCopy: true,
            conservativeCopy: false,
            copiedBytes: pending.estimatedBytes,
            textureRecreated: false,
            textureSizeChanged: false,
            mode: 'full'
        };
        if (orderUploadResult.synchronousCopy) this._orderUploadDiagnostics.orderBufferSynchronousCopyCount++;
        if (orderUploadResult.conservativeCopy) this._orderUploadDiagnostics.orderBufferConservativeCopyCount++;
        this.releasePendingOrder(pending);
        this._orderUploadDiagnostics.fullUploadCount = (this._orderUploadDiagnostics.fullUploadCount ?? 0) + 1;
        return this.commitAppliedOrder(pending, worldState, orderUploadResult, reason);
    }
    beginPendingOrderStaging(reason, forcedDrain) {
        const pending = this.pendingOrder;
        if (!pending) return false;
        this.pendingOrder = null;
        if (pending.sortGeneration > 0 && pending.sortGeneration <= this.lastAppliedSortGeneration || pending.version < this.sortedVersion) {
            this._orderUploadDiagnostics.staleResultCount++;
            this.releasePendingOrder(pending);
            return false;
        }
        const worldState = this.worldStates.get(pending.version);
        if (!worldState) {
            this._orderUploadDiagnostics.staleResultCount++;
            this.releasePendingOrder(pending);
            log.warn(`GSplatManager: World state with version ${pending.version} not found`);
            return false;
        }
        const visibleCount = Math.min(worldState.totalActiveSplats, Math.max(0, Math.floor(pending.count)));
        this.workBuffer.beginOrderStaging(pending.orderData, {
            textureSize: worldState.textureSize,
            visibleCount,
            generation: pending.sortGeneration
        });
        this.stagingOrder = pending;
        this.stagingOrderApplyReason = reason;
        this.stagingOrderForcedDrain = forcedDrain;
        this._orderUploadDiagnostics.chunkedUploadCount = (this._orderUploadDiagnostics.chunkedUploadCount ?? 0) + 1;
        this._orderUploadDiagnostics.forcedDrainActive = forcedDrain;
        this.updateStagingDiagnostics();
        return this.advanceStagingOrderUpload();
    }
    advanceStagingOrderUpload() {
        const pending = this.stagingOrder;
        if (!pending) return false;
        const result = this.workBuffer.advanceOrderStaging({
            maxBytesPerFrame: this.orderUploadScheduler.maxOrderUploadBytesPerFrame,
            maxChunksPerFrame: this.orderUploadScheduler.maxOrderUploadChunksPerFrame
        });
        this.recordStagingAdvanceDiagnostics(result);
        if (result.fallbackToFullUpload) {
            if (!this.orderUploadScheduler.allowFullUploadFallback) {
                this.abortStagingOrder(result.fallbackReason ?? 'chunked-upload-failed');
                return false;
            }
            return this.fallbackStagingOrderToFullUpload(result.fallbackReason ?? 'chunked-upload-failed');
        }
        if (!result.completed) return result.submittedChunks > 0;
        return this.commitStagingOrder();
    }
    drainStagingOrderUpload(reason) {
        if (!this.stagingOrder) return false;
        this.stagingOrderApplyReason = reason;
        this.stagingOrderForcedDrain = true;
        this._orderUploadDiagnostics.forcedDrainActive = true;
        let guard = 0;
        while(this.stagingOrder && guard < 1024){
            const result = this.workBuffer.advanceOrderStaging({
                maxBytesPerFrame: Number.POSITIVE_INFINITY,
                maxChunksPerFrame: Number.MAX_SAFE_INTEGER
            });
            this.recordStagingAdvanceDiagnostics(result);
            if (result.fallbackToFullUpload) return this.fallbackStagingOrderToFullUpload(result.fallbackReason ?? reason);
            if (result.completed) return this.commitStagingOrder();
            guard++;
        }
        return false;
    }
    fallbackStagingOrderToFullUpload(reason) {
        const pending = this.stagingOrder;
        if (!pending) return false;
        this.workBuffer.abortOrderStaging();
        this.stagingOrder = null;
        this.stagingOrderApplyReason = null;
        this.stagingOrderForcedDrain = false;
        this.pendingOrder = pending;
        this._orderUploadDiagnostics.fallbackUploadCount = (this._orderUploadDiagnostics.fallbackUploadCount ?? 0) + 1;
        this._orderUploadDiagnostics.lastFallbackReason = reason;
        this._orderUploadDiagnostics.forcedDrainActive = false;
        return this.applyPendingOrderFullUpload(`fallback:${reason}`);
    }
    updateStagingDiagnostics() {
        const info = this.workBuffer.getOrderStagingInfo();
        this._orderUploadDiagnostics.stagingTotalBytes = info?.totalBytes ?? 0;
        this._orderUploadDiagnostics.stagingSubmittedBytes = info?.submittedBytes ?? 0;
        this._orderUploadDiagnostics.stagingRemainingBytes = info?.remainingBytes ?? 0;
        this._orderUploadDiagnostics.stagingSubmittedChunks = info?.submittedChunks ?? 0;
        this._orderUploadDiagnostics.stagingRemainingChunks = info?.remainingChunks ?? 0;
    }
    recordStagingAdvanceDiagnostics(result) {
        this._orderUploadDiagnostics.lastFrameSubmittedBytes = result.submittedBytes;
        this._orderUploadDiagnostics.lastFrameSubmittedChunks = result.submittedChunks;
        if ('byte-budget' === result.blockedReason) this._orderUploadDiagnostics.byteBudgetBlockedCount = (this._orderUploadDiagnostics.byteBudgetBlockedCount ?? 0) + 1;
        else if ('chunk-budget' === result.blockedReason) this._orderUploadDiagnostics.chunkBudgetBlockedCount = (this._orderUploadDiagnostics.chunkBudgetBlockedCount ?? 0) + 1;
        if (result.minRowBudgetOverride) this._orderUploadDiagnostics.minRowBudgetOverrideCount = (this._orderUploadDiagnostics.minRowBudgetOverrideCount ?? 0) + 1;
        if (result.fallbackReason) this._orderUploadDiagnostics.lastFallbackReason = result.fallbackReason;
        this.updateStagingDiagnostics();
    }
    clearStagingDiagnostics() {
        this._orderUploadDiagnostics.stagingTotalBytes = 0;
        this._orderUploadDiagnostics.stagingSubmittedBytes = 0;
        this._orderUploadDiagnostics.stagingRemainingBytes = 0;
        this._orderUploadDiagnostics.stagingSubmittedChunks = 0;
        this._orderUploadDiagnostics.stagingRemainingChunks = 0;
    }
    commitStagingOrder() {
        const pending = this.stagingOrder;
        if (!pending) return false;
        const worldState = this.worldStates.get(pending.version);
        if (!worldState) {
            this._orderUploadDiagnostics.staleResultCount++;
            this.abortStagingOrder('missing-world-state');
            return false;
        }
        worldState.sortedVisibleSplatCount = Math.min(worldState.totalActiveSplats, Math.max(0, Math.floor(pending.count)));
        const orderUploadResult = this.workBuffer.commitOrderStaging();
        this.installOrderUploadObservedHook();
        this.releasePendingOrder(pending);
        this.stagingOrder = null;
        const reason = this.stagingOrderApplyReason ?? 'chunked';
        this.stagingOrderApplyReason = null;
        this.stagingOrderForcedDrain = false;
        this._orderUploadDiagnostics.firstOrderFallbackActive = false;
        this._orderUploadDiagnostics.forcedDrainActive = false;
        return this.commitAppliedOrder(pending, worldState, orderUploadResult, reason);
    }
    commitAppliedOrder(pending, worldState, orderUploadResult, reason) {
        for(let v = this.sortedVersion; v < pending.version; v++){
            const oldState = this.worldStates.get(v);
            if (oldState) {
                this.worldStates.delete(v);
                this.destroyWorldState(oldState);
            }
        }
        this.sortedVersion = pending.version;
        this.retireOctreeInstancesThroughVersion(pending.version);
        if (pending.sortGeneration > 0) this.lastAppliedSortGeneration = pending.sortGeneration;
        this.bumpPickStateVersion();
        if (!this.firstOrderAppliedLogged) {
            this.firstOrderAppliedLogged = true;
            log.debug(`[GSplatManager] first order texture applied, version=${pending.version}, generation=${pending.sortGeneration}, visibleSplats=${worldState.sortedVisibleSplatCount}, mode=${orderUploadResult.mode}, bytes=${orderUploadResult.copiedBytes || pending.estimatedBytes}, reason=${reason}`);
        }
        if (!worldState.sortedBefore) {
            worldState.sortedBefore = true;
            this.workBuffer.render(worldState.splats, this.cameraNode, this.getDebugColors());
            if (!this.firstWorkBufferRenderLogged) {
                this.firstWorkBufferRenderLogged = true;
                log.debug(`[GSplatManager] first workBuffer render completed, version=${pending.version}, splats=${worldState.splats.length}, visibleSplats=${worldState.sortedVisibleSplatCount}`);
            }
            worldState.splats.forEach((splat)=>{
                splat.update();
                splat.resetColorAccumulators(this.colorUpdateAngle, this.colorUpdateDistance);
            });
            if (this._scalarFilterMode !== __WEBPACK_EXTERNAL_MODULE__GSplatWorkBuffer_js_ec84d73f__.GSplatScalarMode.None) this.workBuffer.markScalarDirty();
            this._workBufferDirty = false;
            this.consumeWorkBufferUpdateOnce(worldState.splats);
            this.updateColorCameraTracking();
        }
        const now = this.orderUploadNowMs();
        const workerToApplyLatencyMs = Math.max(0, now - pending.workerCompletedAtMs);
        const scheduledBytes = orderUploadResult.copiedBytes || pending.estimatedBytes;
        this.lastOrderUploadScheduledAtMs = now;
        this._orderUploadDiagnostics.scheduledUploadCount++;
        this._orderUploadDiagnostics.scheduledUploadBytes += scheduledBytes;
        this._orderUploadDiagnostics.lastScheduledUploadBytes = scheduledBytes;
        this._orderUploadDiagnostics.lastScheduledTextureSize = worldState.textureSize;
        this._orderUploadDiagnostics.lastScheduledAtMs = now;
        this._orderUploadDiagnostics.lastApplyReason = reason;
        this._orderUploadDiagnostics.lastAppliedSortGeneration = this.lastAppliedSortGeneration;
        this._orderUploadDiagnostics.lastWorkerToApplyLatencyMs = workerToApplyLatencyMs;
        this._orderUploadDiagnostics.lastAppliedPendingOrderSkippedFrameCount = pending.skippedFrameCount;
        this._orderUploadDiagnostics.activeCommitCount = (this._orderUploadDiagnostics.activeCommitCount ?? 0) + 1;
        this._orderUploadDiagnostics.lastCommitGeneration = pending.sortGeneration;
        this._orderUploadDiagnostics.lastCommitReason = reason;
        this._orderUploadDiagnostics.lastCommitVisibleCount = worldState.sortedVisibleSplatCount;
        this.clearStagingDiagnostics();
        return true;
    }
    flushPendingOrderUpload(reason = 'flush') {
        if (this.stagingOrder) return this.drainStagingOrderUpload(reason);
        return this.applyPendingOrderFullUpload(reason);
    }
    computeGlobalMaxDistance() {
        let maxDistance = 0;
        this.cameraNode.updateMatrixWorld(true);
        this._tempCameraPos.setFromMatrixPosition(this.cameraNode.matrixWorld);
        for (const [, inst] of this.octreeInstances){
            const node = inst.placement.node;
            node.updateMatrixWorld(true);
            const matrixWorld = node.matrixWorld;
            inst.placement.aabb.getCenter(this._tempBudgetAabbCenter).applyMatrix4(matrixWorld);
            inst.placement.aabb.getSize(this._tempBudgetAabbSize);
            this._tempBudgetScale.setFromMatrixScale(matrixWorld);
            const uniformScale = Math.max(this._tempBudgetScale.x, this._tempBudgetScale.y, this._tempBudgetScale.z);
            const radius = 0.5 * this._tempBudgetAabbSize.length() * uniformScale;
            const distance = this._tempBudgetAabbCenter.distanceTo(this._tempCameraPos) + radius;
            if (distance > maxDistance) maxDistance = distance;
        }
        return Math.max(maxDistance, 1);
    }
    getBudgetTextureSizeFloor() {
        const budget = Math.max(0, Math.floor(this.params.maxCachePoints));
        if (budget <= 0) return 1;
        const allocatorCapacity = Math.ceil(budget * PLAYCANVAS_ALLOCATOR_GROW_MULTIPLIER);
        return Math.max(1, Math.ceil(Math.sqrt(allocatorCapacity)));
    }
    enforceBudget(budget) {
        const textureWidth = Math.max(1, this.workBuffer.textureSize, this.getBudgetTextureSizeFloor());
        let fixedSplats = 0;
        let paddingEstimate = 0;
        for (const placement of this.layerPlacements){
            const resource = placement.resource;
            if (resource) {
                const numSplats = resource.numSplats ?? 0;
                fixedSplats += numSplats;
                paddingEstimate += (textureWidth - numSplats % textureWidth) % textureWidth;
            }
        }
        const octreeBudget = Math.max(1, budget - fixedSplats);
        const globalMaxDistance = this.computeGlobalMaxDistance();
        let totalOptimalSplats = 0;
        for (const [, inst] of this.octreeInstances){
            totalOptimalSplats += inst.evaluateOptimalLods(this.cameraNode, this.params, this.budgetScale, globalMaxDistance);
            for (const placement of inst.activePlacements){
                const resource = placement.resource;
                const numSplats = resource?.numSplats ?? 0;
                paddingEstimate += (textureWidth - numSplats % textureWidth) % textureWidth;
            }
        }
        const adjustedBudget = Math.max(1, octreeBudget - paddingEstimate);
        if (totalOptimalSplats > 0) {
            const ratio = totalOptimalSplats / adjustedBudget;
            const deadZone = 0.4;
            const blendRate = 0.3;
            if (ratio > 1 + deadZone || ratio < 1 - deadZone) {
                const invCorrection = 1 / Math.sqrt(ratio);
                this.budgetScale *= 1 + (invCorrection - 1) * blendRate;
                this.budgetScale = Math.max(0.01, Math.min(this.budgetScale, 100.0));
            }
        }
        const camera = this.cameraNode;
        this._budgetRuntimeDiagnostics = {
            budgetScale: this.budgetScale,
            globalMaxDistance,
            adjustedBudget,
            paddingEstimate,
            rawOptimalSplats: totalOptimalSplats,
            budgetTextureWidth: textureWidth,
            fixedSplats,
            octreeBudget,
            cameraAspect: camera.isPerspectiveCamera ? camera.aspect : 0
        };
        this.budgetBalancer.balance(this.octreeInstances, adjustedBudget);
        for (const [, inst] of this.octreeInstances)inst.applyLodChanges(inst.octree.lodLevels - 1, this.params);
    }
    testCameraMovedForLod() {
        this.cameraNode.updateMatrixWorld(true);
        this._tempCameraPos.setFromMatrixPosition(this.cameraNode.matrixWorld);
        const distanceThreshold = this.params.lodUpdateDistance;
        const cameraMoved = this.lastLodCameraPos.distanceTo(this._tempCameraPos) > distanceThreshold;
        if (cameraMoved) return true;
        const lodUpdateAngleDeg = this.params.lodUpdateAngle;
        if (lodUpdateAngleDeg > 0) {
            if (!Number.isFinite(this.lastLodCameraFwd.x)) return true;
            {
                this._tempCameraRot.setFromRotationMatrix(this.cameraNode.matrixWorld);
                this._tempCameraDir.set(0, 0, -1).applyQuaternion(this._tempCameraRot);
                const dot = Math.min(1, Math.max(-1, this.lastLodCameraFwd.dot(this._tempCameraDir)));
                const angle = Math.acos(dot);
                const rotThreshold = lodUpdateAngleDeg * __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.DEG2RAD;
                const cameraRotated = angle > rotThreshold;
                if (cameraRotated) return true;
            }
        }
        const camera = this.cameraNode;
        if (camera.isPerspectiveCamera) {
            const fovChanged = this.lastLodCameraFov < 0 || Math.abs(camera.fov - this.lastLodCameraFov) > Math.max(0.001, 0.02 * this.lastLodCameraFov);
            const aspectChanged = this.lastLodCameraAspect < 0 || Math.abs(camera.aspect - this.lastLodCameraAspect) > Math.max(0.001, 0.02 * this.lastLodCameraAspect);
            if (fovChanged || aspectChanged) return true;
        }
        return false;
    }
    testCameraMovedForSort() {
        const epsilon = 0.001;
        this.cameraNode.updateMatrixWorld(true);
        this._tempCameraPos.setFromMatrixPosition(this.cameraNode.matrixWorld);
        if (this.radialSort) {
            if (!this.lastSortPosition) return true;
            if (this._tempCameraPos.distanceTo(this.lastSortPosition) > this.sortMoveThreshold) return true;
            if (!this.params.sortVisibilityCompact) return false;
            this._tempCameraRot.setFromRotationMatrix(this.cameraNode.matrixWorld);
            this._tempCameraDir.set(0, 0, -1).applyQuaternion(this._tempCameraRot);
            if (!Number.isFinite(this.lastSortCameraFwd.x)) return true;
            const dot = Math.min(1, Math.max(-1, this.lastSortCameraFwd.dot(this._tempCameraDir)));
            const refreshAngleRad = Math.max(epsilon, this.params.sortVisibilityRotationRefreshAngle * __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.DEG2RAD);
            return Math.acos(dot) > refreshAngleRad;
        }
        {
            this._tempCameraRot.setFromRotationMatrix(this.cameraNode.matrixWorld);
            this._tempCameraDir.set(0, 0, -1).applyQuaternion(this._tempCameraRot);
            if (!Number.isFinite(this.lastSortCameraFwd.x)) return true;
            const dot = Math.min(1, Math.max(-1, this.lastSortCameraFwd.dot(this._tempCameraDir)));
            const angle = Math.acos(dot);
            if (angle > epsilon) return true;
            if (!this.params.sortVisibilityCompact) return false;
            if (!Number.isFinite(this.lastSortCameraPos.x)) return true;
            return this._tempCameraPos.distanceTo(this.lastSortCameraPos) > this.sortMoveThreshold;
        }
    }
    updateColorCameraTracking() {
        this.cameraNode.updateMatrixWorld(true);
        this._tempCameraPos.setFromMatrixPosition(this.cameraNode.matrixWorld);
        this._tempCameraRot.setFromRotationMatrix(this.cameraNode.matrixWorld);
        this._tempCameraDir.set(0, 0, -1).applyQuaternion(this._tempCameraRot);
        this.lastColorUpdateCameraPos.copy(this._tempCameraPos);
        this.lastColorUpdateCameraFwd.copy(this._tempCameraDir);
    }
    updateLastSortCameraTracking() {
        this.cameraNode.updateMatrixWorld(true);
        this._tempCameraPos.setFromMatrixPosition(this.cameraNode.matrixWorld);
        this._tempCameraRot.setFromRotationMatrix(this.cameraNode.matrixWorld);
        this._tempCameraDir.set(0, 0, -1).applyQuaternion(this._tempCameraRot);
        this.lastSortCameraPos.copy(this._tempCameraPos);
        this.lastSortCameraFwd.copy(this._tempCameraDir);
        if (!this.lastSortPosition) this.lastSortPosition = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        this.lastSortPosition.copy(this._tempCameraPos);
    }
    calculateColorCameraDeltas() {
        let rotationDelta = 0;
        let translationDelta = 0;
        if (Number.isFinite(this.lastColorUpdateCameraPos.x)) {
            this.cameraNode.updateMatrixWorld(true);
            this._tempCameraPos.setFromMatrixPosition(this.cameraNode.matrixWorld);
            this._tempCameraRot.setFromRotationMatrix(this.cameraNode.matrixWorld);
            this._tempCameraDir.set(0, 0, -1).applyQuaternion(this._tempCameraRot);
            const dot = Math.min(1, Math.max(-1, this.lastColorUpdateCameraFwd.dot(this._tempCameraDir)));
            rotationDelta = Math.acos(dot) * __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.RAD2DEG;
            translationDelta = this.lastColorUpdateCameraPos.distanceTo(this._tempCameraPos);
        }
        return {
            rotationDelta,
            translationDelta
        };
    }
    sort(lastState) {
        const camera = this.cameraNode;
        return this.sorter.setSortParams(camera, lastState.splats, {
            enabled: this.params.sortVisibilityCompact,
            behindMargin: this.params.sortVisibilityBehindMargin,
            screenCompact: this.params.sortVisibilityScreenCompact,
            screenMargin: this.params.sortVisibilityScreenMargin
        });
    }
    handleSortRequestResult(result) {
        if (result.retrySuppressed) {
            this.sortNeeded = false;
            return false;
        }
        if ('submitted' !== result.status && 'queued' !== result.status) return false;
        this.markInteractiveSortActivity();
        this.sortNeeded = false;
        this.updateLastSortCameraTracking();
        return true;
    }
    prepareSortParameters(worldState) {
        return {
            command: 'intervals',
            textureSize: worldState.textureSize,
            totalUsedPixels: worldState.totalUsedPixels,
            totalActiveSplats: worldState.totalActiveSplats,
            version: worldState.version,
            ids: worldState.splats.map((splat)=>splat.resource.id),
            lineStarts: worldState.splats.map((splat)=>splat.lineStart),
            padding: worldState.splats.map((splat)=>splat.padding),
            intervals: worldState.splats.map((splat)=>splat.intervals)
        };
    }
    getDebugColors() {
        if (this.colorizeColorUpdate) {
            const r = Math.random();
            const g = Math.random();
            const b = Math.random();
            return Array(8).fill(null).map(()=>[
                    r,
                    g,
                    b
                ]);
        }
        if (this.colorizeLod) return [
            [
                1,
                0,
                0
            ],
            [
                0,
                1,
                0
            ],
            [
                0,
                0,
                1
            ],
            [
                1,
                1,
                0
            ],
            [
                1,
                0,
                1
            ],
            [
                0,
                1,
                1
            ],
            [
                1,
                0.5,
                0
            ],
            [
                0.5,
                0,
                1
            ]
        ];
    }
    update(cooldownFrameId, cooldownFrameSource) {
        const resolvedCooldownFrameId = 'number' == typeof cooldownFrameId && Number.isFinite(cooldownFrameId) ? Math.floor(cooldownFrameId) : void 0;
        const resolvedCooldownFrameSource = void 0 === resolvedCooldownFrameId ? void 0 : cooldownFrameSource;
        if (this.sorter.consumeWorkerRecovered()) {
            this.layerPlacementsDirty = true;
            this.sortNeeded = true;
        }
        if (this.sorter.consumeSortRetryNeeded()) this.sortNeeded = true;
        if (this.testCameraMovedForSort()) {
            this.markInteractiveSortActivity();
            this.sortNeeded = true;
        }
        this.sorter.applyPendingSorted();
        this.tryApplyPendingOrder();
        let fullUpdate = false;
        if (this.canAdvanceLodPresentationWork()) this.framesTillFullUpdate = 0;
        this.framesTillFullUpdate--;
        if (this.framesTillFullUpdate <= 0) {
            this.framesTillFullUpdate = 10;
            if (this.sorter.jobsInFlight < 3) fullUpdate = true;
        }
        const hasNewInstances = this.hasNewOctreeInstances && this.sorter.jobsInFlight < 3;
        if (hasNewInstances) this.hasNewOctreeInstances = false;
        let anyInstanceNeedsLodUpdate = false;
        let anyOctreeMoved = false;
        let cameraMovedOrRotatedForLod = false;
        if (fullUpdate) {
            for (const [, inst] of this.octreeInstances){
                const isDirty = inst.update();
                this.layerPlacementsDirty ||= isDirty;
                const instNeeds = inst.consumeNeedsLodUpdate();
                anyInstanceNeedsLodUpdate ||= instNeeds;
            }
            const threshold = this.params.lodUpdateDistance;
            for (const [, inst] of this.octreeInstances){
                const moved = inst.testMoved(threshold);
                anyOctreeMoved ||= moved;
            }
            cameraMovedOrRotatedForLod = this.testCameraMovedForLod();
        }
        if (this.testCameraMovedForSort()) {
            this.markInteractiveSortActivity();
            this.sortNeeded = true;
        }
        if (this.params.dirty) this.layerPlacementsDirty = true;
        if (cameraMovedOrRotatedForLod || anyOctreeMoved || this.params.dirty || anyInstanceNeedsLodUpdate || hasNewInstances) {
            for (const [, inst] of this.octreeInstances)inst.updateMoved();
            this.cameraNode.updateMatrixWorld(true);
            this._tempCameraPos.setFromMatrixPosition(this.cameraNode.matrixWorld);
            this._tempCameraRot.setFromRotationMatrix(this.cameraNode.matrixWorld);
            this._tempCameraDir.set(0, 0, -1).applyQuaternion(this._tempCameraRot);
            this.lastLodCameraPos.copy(this._tempCameraPos);
            this.lastLodCameraFwd.copy(this._tempCameraDir);
            const camera = this.cameraNode;
            if (camera.isPerspectiveCamera) {
                this.lastLodCameraFov = camera.fov;
                this.lastLodCameraAspect = camera.aspect;
            }
            const budget = Math.max(0, Math.floor(this.params.maxCachePoints));
            if (budget > 0) this.enforceBudget(budget);
            else {
                this.budgetScale = 1.0;
                for (const [, inst] of this.octreeInstances)inst.updateLod(this.cameraNode, this.params);
            }
        }
        if (this.layerPlacementsDirty) this.worldStateUpdateCooldown--;
        const shouldUpdateWorldState = this.layerPlacementsDirty && (this.worldStateUpdateCooldown <= 0 || 0 === this.worldStates.size);
        if (shouldUpdateWorldState) {
            this.updateWorldState();
            const interval = this.params.worldStateUpdateInterval;
            this.worldStateUpdateCooldown = interval > 0 ? interval : 0;
        }
        const lastState = this.worldStates.get(this.lastWorldStateVersion);
        if (lastState) {
            if (!lastState.sortParametersSet) {
                lastState.sortParametersSet = true;
                const payload = this.prepareSortParameters(lastState);
                this.sorter.setSortParameters(payload);
            }
            if (this.sortNeeded) {
                this.sorter.setRadialSort(this.radialSort);
                this.handleSortRequestResult(this.sort(lastState));
            }
        }
        const sortedState = this.worldStates.get(this.sortedVersion);
        if (sortedState) {
            if (this.params.highQualitySH && sortedState.splats.length > 0) {
                for (const splat of sortedState.splats){
                    const resource = splat.resource;
                    if ((0, __WEBPACK_EXTERNAL_MODULE__types_ManagerTypes_js_9a270aac__.hasHighQualitySH)(resource)) {
                        const shNMins = resource.meta?.shN?.mins ?? 0;
                        const shNMaxs = resource.meta?.shN?.maxs ?? 1;
                        this.initResolveSH(resource.shBands, resource.sh_centroids ?? null, shNMins, shNMaxs);
                        break;
                    }
                }
                if (this.resolveSH) {
                    const firstSplat = sortedState.splats[0];
                    const modelMatrix = firstSplat?.node.matrixWorld ?? new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4();
                    this.resolveSH.render(this.cameraNode, modelMatrix);
                }
            }
            const { rotationDelta, translationDelta } = this.calculateColorCameraDeltas();
            sortedState.splats.forEach((splat)=>{
                if (splat.update()) {
                    this._tempUpdatedSplats.push(splat);
                    splat.resetColorAccumulators(this.colorUpdateAngle, this.colorUpdateDistance);
                    this.sortNeeded = true;
                } else if (splat.hasSphericalHarmonics) {
                    splat.colorAccumulatedRotation += rotationDelta;
                    splat.colorAccumulatedTranslation += translationDelta;
                    const lodIndex = splat.lodIndex ?? 0;
                    const distThreshold = this.colorUpdateDistance * this.colorUpdateDistanceLodScale ** lodIndex;
                    const angleThreshold = this.colorUpdateAngle * this.colorUpdateAngleLodScale ** lodIndex;
                    if (splat.colorAccumulatedRotation >= angleThreshold || splat.colorAccumulatedTranslation >= distThreshold) {
                        this._tempSplatsNeedingColorUpdate.push(splat);
                        splat.resetColorAccumulators(angleThreshold, distThreshold);
                    }
                }
            });
            const forceWorkBufferRender = sortedState.splats.length > 0 && this.shouldForceWorkBufferRender(sortedState.splats);
            if (forceWorkBufferRender) {
                this.workBuffer.render(sortedState.splats, this.cameraNode, this.getDebugColors());
                if (this._scalarFilterMode !== __WEBPACK_EXTERNAL_MODULE__GSplatWorkBuffer_js_ec84d73f__.GSplatScalarMode.None) this.workBuffer.markScalarDirty();
                this._tempUpdatedSplats.length = 0;
                this._tempSplatsNeedingColorUpdate.length = 0;
                this._workBufferDirty = false;
                this.consumeWorkBufferUpdateOnce(sortedState.splats);
            } else if (this._tempUpdatedSplats.length > 0) {
                this.workBuffer.render(this._tempUpdatedSplats, this.cameraNode, this.getDebugColors());
                if (this._scalarFilterMode !== __WEBPACK_EXTERNAL_MODULE__GSplatWorkBuffer_js_ec84d73f__.GSplatScalarMode.None) this.workBuffer.markScalarDirty();
                this._tempUpdatedSplats.length = 0;
            }
            if (!forceWorkBufferRender && this._tempSplatsNeedingColorUpdate.length > 0) {
                this.workBuffer.renderColor(this._tempSplatsNeedingColorUpdate, this.cameraNode, this.getDebugColors());
                if (this._scalarFilterMode !== __WEBPACK_EXTERNAL_MODULE__GSplatWorkBuffer_js_ec84d73f__.GSplatScalarMode.None) this.workBuffer.markScalarDirty();
                this._tempSplatsNeedingColorUpdate.length = 0;
            }
            this.updateColorCameraTracking();
            if (this._scalarFilterMode !== __WEBPACK_EXTERNAL_MODULE__GSplatWorkBuffer_js_ec84d73f__.GSplatScalarMode.None) {
                this.workBuffer.renderScalar(sortedState.splats, this.cameraNode);
                this.updateScalarValuesCache();
            }
        }
        return this.finishUpdateFrame(resolvedCooldownFrameId, resolvedCooldownFrameSource);
    }
    finishUpdateFrame(cooldownFrameId, cooldownFrameSource) {
        const visibleSplatCount = this.visibleSplatCount;
        if (!this.firstVisibleSplatsLogged && visibleSplatCount > 0) {
            this.firstVisibleSplatsLogged = true;
            log.info(`[GSplatManager] first visible splats, visibleSplats=${visibleSplatCount}`);
        }
        this.tickOctreeCooldowns(cooldownFrameId, cooldownFrameSource);
        this.params.frameEnd();
        return visibleSplatCount;
    }
    tickOctreeCooldowns(frameId, frameSource) {
        if (0 === this.octreeInstances.size && (this.octreeInstancesToDestroy?.length ?? 0) === 0 && (this.retiredOctrees?.size ?? 0) === 0) return;
        const cooldownTicks = this.params.cooldownTicks;
        for (const instance of this.octreeInstances.values()){
            const octree = instance.octree;
            if (!this._tempOctreesTicked.has(octree)) {
                this._tempOctreesTicked.add(octree);
                octree.updateCooldownTick(cooldownTicks, frameId, frameSource);
            }
        }
        for (const retirement of this.octreeInstancesToDestroy ?? []){
            const octree = retirement.instance.octree;
            if (!this._tempOctreesTicked.has(octree)) {
                this._tempOctreesTicked.add(octree);
                octree.updateCooldownTick(cooldownTicks, frameId, frameSource);
            }
        }
        for (const octree of this.retiredOctrees ?? [])if (!this._tempOctreesTicked.has(octree)) {
            this._tempOctreesTicked.add(octree);
            octree.updateCooldownTick(cooldownTicks, frameId, frameSource);
        }
        this._tempOctreesTicked.clear();
        for (const octree of this.retiredOctrees ?? [])if (!octree.hasPendingCooldowns) this.retiredOctrees.delete(octree);
    }
    get colorTexture() {
        return this.workBuffer.colorTexture;
    }
    get splatTexture0() {
        return this.workBuffer.splatTexture0;
    }
    get splatTexture1() {
        return this.workBuffer.splatTexture1;
    }
    get orderTexture() {
        return this.workBuffer.orderTexture;
    }
    get textureSize() {
        return this.workBuffer.textureSize;
    }
    get isWorkBufferRenderable() {
        return this.workBuffer.renderable;
    }
    get visibleSplatCount() {
        const worldState = this.worldStates.get(this.sortedVersion);
        return worldState?.sortedVisibleSplatCount ?? 0;
    }
    get sortVisibilityCompactStats() {
        return this.sorter.lastVisibilityCompactStats;
    }
    get budgetRuntimeDiagnostics() {
        return {
            ...this._budgetRuntimeDiagnostics,
            budgetScale: this.budgetScale
        };
    }
    get orderUploadDiagnostics() {
        const now = this.orderUploadNowMs();
        const pendingAgeMs = this.pendingOrder ? Math.max(0, now - this.pendingOrder.receivedAtMs) : null;
        const sorterDiagnostics = this.sorter?.diagnostics;
        const pendingWorkerToApplyLatencyMs = this.pendingOrder ? Math.max(0, now - this.pendingOrder.workerCompletedAtMs) : null;
        const stagingInfo = this.workBuffer.getOrderStagingInfo?.() ?? null;
        return {
            ...this._orderUploadDiagnostics,
            observedUploadAvailable: this._orderUploadDiagnostics.observedUploadAvailable || this.orderUploadObservedProbeInstalled,
            pendingAgeMs,
            pendingSortGeneration: this.pendingOrder?.sortGeneration ?? null,
            pendingWorldStateVersion: this.pendingOrder?.version ?? null,
            pendingOrderSkippedFrameCount: this.pendingOrder?.skippedFrameCount ?? null,
            stagingSortGeneration: this.stagingOrder?.sortGeneration ?? stagingInfo?.generation ?? null,
            stagingTextureSize: stagingInfo?.textureSize ?? null,
            stagingVisibleCount: stagingInfo?.visibleCount ?? null,
            stagingTotalBytes: stagingInfo?.totalBytes ?? this._orderUploadDiagnostics.stagingTotalBytes,
            stagingSubmittedBytes: stagingInfo?.submittedBytes ?? this._orderUploadDiagnostics.stagingSubmittedBytes,
            stagingRemainingBytes: stagingInfo?.remainingBytes ?? this._orderUploadDiagnostics.stagingRemainingBytes,
            stagingSubmittedChunks: stagingInfo?.submittedChunks ?? this._orderUploadDiagnostics.stagingSubmittedChunks,
            stagingRemainingChunks: stagingInfo?.remainingChunks ?? this._orderUploadDiagnostics.stagingRemainingChunks,
            pendingRequestAgeMs: sorterDiagnostics?.pendingRequestAgeMs ?? null,
            pendingRequestToSubmitLatencyMs: this.pendingOrder?.requestToSubmitLatencyMs ?? null,
            pendingWorkerToApplyLatencyMs,
            coalescedResultCount: this._orderUploadDiagnostics.coalescedResultCount + (this.sorter?.coalescedResultCount ?? 0),
            staleResultCount: this._orderUploadDiagnostics.staleResultCount + (this.sorter?.staleResultCount ?? 0),
            submittedRequestCount: sorterDiagnostics?.submittedRequestCount ?? 0,
            queuedRequestCount: sorterDiagnostics?.queuedRequestCount ?? 0,
            replayedRequestCount: sorterDiagnostics?.replayedRequestCount ?? 0,
            overwrittenRequestCount: sorterDiagnostics?.overwrittenRequestCount ?? 0,
            rejectedRequestCount: sorterDiagnostics?.rejectedRequestCount ?? 0,
            workerErrorCount: sorterDiagnostics?.workerErrorCount ?? 0,
            lastRequestToSubmitLatencyMs: sorterDiagnostics?.lastRequestToSubmitLatencyMs ?? this._orderUploadDiagnostics.lastRequestToSubmitLatencyMs,
            orderBufferAllocCount: sorterDiagnostics?.orderBufferAllocCount ?? 0,
            orderBufferReuseCount: sorterDiagnostics?.orderBufferReuseCount ?? 0,
            orderBufferReleaseCount: sorterDiagnostics?.orderBufferReleaseCount ?? 0,
            pendingOrderBufferLeaseCount: (sorterDiagnostics?.pendingOrderBufferLeaseCount ?? 0) + (this.pendingOrder?.releaseOrderData ? 1 : 0) + (this.stagingOrder?.releaseOrderData ? 1 : 0),
            adaptiveReplayDeferralCount: sorterDiagnostics?.adaptiveReplayDeferralCount ?? 0,
            adaptiveReplayTimerFireCount: sorterDiagnostics?.adaptiveReplayTimerFireCount ?? 0,
            adaptiveSortIntervalMs: sorterDiagnostics?.adaptiveSortIntervalMs ?? 0,
            workerSortTimeEmaMs: sorterDiagnostics?.workerSortTimeEmaMs ?? 0,
            pendingReplayDelayMs: sorterDiagnostics?.pendingReplayDelayMs ?? null
        };
    }
    get shResultTexture() {
        return this.resolveSH?.texture ?? null;
    }
    get isHighQualitySHActive() {
        return this.params.highQualitySH && null !== this.resolveSH;
    }
    get scalarTexture() {
        return this.workBuffer.scalarTexture;
    }
    get scalarTextureVersion() {
        return this.workBuffer.scalarVersion;
    }
    get pickStateVersion() {
        return this._pickStateVersion;
    }
    setScalarFilter(options) {
        const nextMode = options.enabled ? options.mode : __WEBPACK_EXTERNAL_MODULE__GSplatWorkBuffer_js_ec84d73f__.GSplatScalarMode.None;
        const modeChanged = this._scalarFilterMode !== nextMode;
        const enabledChanged = this._scalarFilterEnabled !== options.enabled;
        const rangeChanged = this._scalarFilterMin !== options.min || this._scalarFilterMax !== options.max;
        this._scalarFilterEnabled = options.enabled;
        this._scalarFilterMode = nextMode;
        this._scalarFilterMin = options.min;
        this._scalarFilterMax = options.max;
        if (modeChanged || enabledChanged) this.workBuffer.setScalarMode(nextMode);
        if (modeChanged) this.resetScalarValuesCache();
        if (options.enabled && (modeChanged || enabledChanged || rangeChanged)) this.updateScalarValuesCache();
        if (options.enabled && (modeChanged || enabledChanged || rangeChanged)) this.logScalarFilterSnapshot('setScalarFilter');
        if (modeChanged || enabledChanged || rangeChanged) this.bumpPickStateVersion();
    }
    clearScalarFilter() {
        const hadScalarFilter = this._scalarFilterEnabled || this._scalarFilterMode !== __WEBPACK_EXTERNAL_MODULE__GSplatWorkBuffer_js_ec84d73f__.GSplatScalarMode.None;
        this._scalarFilterEnabled = false;
        this._scalarFilterMode = __WEBPACK_EXTERNAL_MODULE__GSplatWorkBuffer_js_ec84d73f__.GSplatScalarMode.None;
        this.workBuffer.setScalarMode(__WEBPACK_EXTERNAL_MODULE__GSplatWorkBuffer_js_ec84d73f__.GSplatScalarMode.None);
        if (hadScalarFilter) this.bumpPickStateVersion();
    }
    getScalarFilterConfig() {
        if (!this.isScalarFilterActive) return null;
        return {
            enabled: true,
            min: this._scalarFilterMin,
            max: this._scalarFilterMax
        };
    }
    get isScalarFilterActive() {
        return this._scalarFilterEnabled && this._scalarFilterMode !== __WEBPACK_EXTERNAL_MODULE__GSplatWorkBuffer_js_ec84d73f__.GSplatScalarMode.None && this.workBuffer.supportsScalarFiltering;
    }
    passesScalarFilter(splatInfo, splatIndex) {
        if (!this.isScalarFilterActive) return true;
        const readback = this.readScalarValues(this._scalarFilterMode);
        if (!readback) return false;
        const activeIndex = splatInfo.getActiveSplatIndex(splatIndex);
        if (activeIndex < 0) return false;
        const textureSize = this.workBuffer.textureSize;
        const globalIndex = splatInfo.lineStart * textureSize + activeIndex;
        if (globalIndex < 0 || globalIndex >= readback.values.length) return false;
        const scalar = readback.values[globalIndex];
        return scalar >= this._scalarFilterMin && scalar <= this._scalarFilterMax;
    }
    getScalarHistogram(options) {
        if (options.mode === __WEBPACK_EXTERNAL_MODULE__GSplatWorkBuffer_js_ec84d73f__.GSplatScalarMode.None) return null;
        const sortedState = this.worldStates.get(this.sortedVersion);
        if (!sortedState || 0 === sortedState.splats.length) return null;
        const readback = this.readScalarValues(options.mode);
        if (!readback) return null;
        const binCount = Math.max(1, Math.floor(options.binCount ?? __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.GSPLAT_DEFAULT_BIN_COUNT));
        const bins = new Array(binCount).fill(0);
        const textureSize = this.workBuffer.textureSize;
        let totalActive = 0;
        for (const splatInfo of sortedState.splats)totalActive += splatInfo.activeSplats;
        const samples = new Float32Array(totalActive);
        let writeIdx = 0;
        let min = Number.POSITIVE_INFINITY;
        let max = Number.NEGATIVE_INFINITY;
        for (const splatInfo of sortedState.splats){
            const baseIndex = splatInfo.lineStart * textureSize;
            for(let activeIndex = 0; activeIndex < splatInfo.activeSplats; activeIndex++){
                const scalar = readback.values[baseIndex + activeIndex];
                if (!!Number.isFinite(scalar)) {
                    samples[writeIdx++] = scalar;
                    min = Math.min(min, scalar);
                    max = Math.max(max, scalar);
                }
            }
        }
        const sampleCount = writeIdx;
        if (0 === sampleCount) return {
            min: 0,
            max: 0,
            displayMin: 0,
            displayMax: 0,
            bins,
            sampleCount: 0,
            clippedSampleCount: 0,
            textureVersion: readback.textureVersion
        };
        const validSamples = samples.subarray(0, sampleCount);
        validSamples.sort();
        const lowerPercentile = clampPercentile(options.percentileRange?.lower, 0);
        const upperPercentile = clampPercentile(options.percentileRange?.upper, 100);
        const percentileMin = Math.min(lowerPercentile, upperPercentile);
        const percentileMax = Math.max(lowerPercentile, upperPercentile);
        const scale = options.scale ?? 'linear';
        const displayMin = getPercentileValue(validSamples, percentileMin);
        const displayMax = getPercentileValue(validSamples, percentileMax);
        const scaleTransform = getHistogramScaleTransform(scale, min, max);
        let clippedSampleCount = 0;
        if (displayMin === displayMax) {
            for(let i = 0; i < sampleCount; i++)if (validSamples[i] >= displayMin && validSamples[i] <= displayMax) clippedSampleCount++;
            bins[0] = clippedSampleCount;
            return {
                min,
                max,
                displayMin,
                displayMax,
                bins,
                sampleCount,
                clippedSampleCount,
                textureVersion: readback.textureVersion
            };
        }
        const scaledDisplayMin = scaleTransform(displayMin);
        const scaledDisplayMax = scaleTransform(displayMax);
        const scaledDisplayRange = scaledDisplayMax - scaledDisplayMin;
        if (0 === scaledDisplayRange) {
            bins[0] = sampleCount;
            return {
                min,
                max,
                displayMin,
                displayMax,
                bins,
                sampleCount,
                clippedSampleCount: sampleCount,
                textureVersion: readback.textureVersion
            };
        }
        for(let i = 0; i < sampleCount; i++){
            const scalar = validSamples[i];
            if (scalar <= displayMin) {
                bins[0]++;
                continue;
            }
            if (scalar >= displayMax) {
                bins[binCount - 1]++;
                continue;
            }
            clippedSampleCount++;
            const normalized = (scaleTransform(scalar) - scaledDisplayMin) / scaledDisplayRange;
            const binIndex = Math.min(binCount - 1, Math.floor(normalized * binCount));
            bins[binIndex]++;
        }
        const result = {
            min,
            max,
            displayMin,
            displayMax,
            bins,
            sampleCount,
            clippedSampleCount,
            textureVersion: readback.textureVersion
        };
        if (isScalarFilterDebugEnabled()) log.info('[GSplatManager][ScalarFilter] histogram mode=' + getScalarModeLabel(options.mode) + ', scale=' + scale + ', percentileMin=' + percentileMin + ', percentileMax=' + percentileMax + ', min=' + result.min + ', max=' + result.max + ', displayMin=' + result.displayMin + ', displayMax=' + result.displayMax + ', sampleCount=' + result.sampleCount + ', clippedSampleCount=' + result.clippedSampleCount + ', textureVersion=' + result.textureVersion);
        return result;
    }
    updateScalarValuesCache() {
        if (this.isScalarFilterActive) this.readScalarValues(this._scalarFilterMode);
    }
    logScalarFilterSnapshot(reason) {
        if (!isScalarFilterDebugEnabled()) return;
        if (!this.isScalarFilterActive) {
            log.info('[GSplatManager][ScalarFilter] inactive reason=' + reason + ', enabled=' + this._scalarFilterEnabled + ', mode=' + getScalarModeLabel(this._scalarFilterMode) + ', supportsScalarFiltering=' + this.workBuffer.supportsScalarFiltering);
            return;
        }
        const sortedState = this.worldStates.get(this.sortedVersion);
        if (!sortedState || 0 === sortedState.splats.length) {
            log.info('[GSplatManager][ScalarFilter] no sorted splats reason=' + reason + ', sortedVersion=' + this.sortedVersion + ', mode=' + getScalarModeLabel(this._scalarFilterMode) + ', min=' + this._scalarFilterMin + ', max=' + this._scalarFilterMax);
            return;
        }
        const readback = this.readScalarValues(this._scalarFilterMode);
        if (!readback) {
            log.info('[GSplatManager][ScalarFilter] readback unavailable reason=' + reason + ', sortedVersion=' + this.sortedVersion + ', mode=' + getScalarModeLabel(this._scalarFilterMode) + ', min=' + this._scalarFilterMin + ', max=' + this._scalarFilterMax);
            return;
        }
        const textureSize = this.workBuffer.textureSize;
        let sampleCount = 0;
        let finiteCount = 0;
        let passCount = 0;
        let belowMinCount = 0;
        let aboveMaxCount = 0;
        let exactMinCount = 0;
        let exactMaxCount = 0;
        let actualMin = Number.POSITIVE_INFINITY;
        let actualMax = Number.NEGATIVE_INFINITY;
        for (const splatInfo of sortedState.splats){
            const baseIndex = splatInfo.lineStart * textureSize;
            for(let activeIndex = 0; activeIndex < splatInfo.activeSplats; activeIndex++){
                sampleCount++;
                const scalar = readback.values[baseIndex + activeIndex];
                if (!!Number.isFinite(scalar)) {
                    finiteCount++;
                    actualMin = Math.min(actualMin, scalar);
                    actualMax = Math.max(actualMax, scalar);
                    if (scalar < this._scalarFilterMin) {
                        belowMinCount++;
                        continue;
                    }
                    if (scalar > this._scalarFilterMax) {
                        aboveMaxCount++;
                        continue;
                    }
                    if (scalar === this._scalarFilterMin) exactMinCount++;
                    if (scalar === this._scalarFilterMax) exactMaxCount++;
                    passCount++;
                }
            }
        }
        log.info('[GSplatManager][ScalarFilter] snapshot reason=' + reason + ', mode=' + getScalarModeLabel(this._scalarFilterMode) + ', min=' + this._scalarFilterMin + ', max=' + this._scalarFilterMax + ', width=' + (this._scalarFilterMax - this._scalarFilterMin) + ', sampleCount=' + sampleCount + ', finiteCount=' + finiteCount + ', passCount=' + passCount + ', belowMinCount=' + belowMinCount + ', aboveMaxCount=' + aboveMaxCount + ', exactMinCount=' + exactMinCount + ', exactMaxCount=' + exactMaxCount + ', actualMin=' + (finiteCount > 0 ? actualMin : null) + ', actualMax=' + (finiteCount > 0 ? actualMax : null) + ', sortedVersion=' + this.sortedVersion + ', textureVersion=' + readback.textureVersion + ', textureSize=' + textureSize);
    }
    readScalarValues(mode) {
        if (mode === __WEBPACK_EXTERNAL_MODULE__GSplatWorkBuffer_js_ec84d73f__.GSplatScalarMode.None) return null;
        const sortedState = this.worldStates.get(this.sortedVersion);
        if (!sortedState || 0 === sortedState.splats.length) return null;
        const originalMode = this.workBuffer.scalarMode;
        const needsTemporaryMode = originalMode !== mode;
        if (needsTemporaryMode) {
            this.workBuffer.setScalarMode(mode);
            this.workBuffer.markScalarDirty();
        }
        this.workBuffer.renderScalar(sortedState.splats, this.cameraNode);
        const scalarVersion = this.workBuffer.scalarVersion;
        if (scalarVersion <= 0) {
            if (needsTemporaryMode) this.workBuffer.setScalarMode(originalMode);
            return null;
        }
        const canUseSharedCache = !needsTemporaryMode || originalMode === __WEBPACK_EXTERNAL_MODULE__GSplatWorkBuffer_js_ec84d73f__.GSplatScalarMode.None;
        if (canUseSharedCache && this._scalarValues && this._scalarValuesVersion === scalarVersion && this._scalarValuesMode === mode) {
            if (needsTemporaryMode) this.workBuffer.setScalarMode(originalMode);
            return {
                values: this._scalarValues,
                textureVersion: scalarVersion
            };
        }
        const scalarRenderTarget = this.workBuffer.scalarRenderTarget;
        if (!scalarRenderTarget) {
            if (needsTemporaryMode) {
                this.workBuffer.setScalarMode(originalMode);
                if (originalMode !== __WEBPACK_EXTERNAL_MODULE__GSplatWorkBuffer_js_ec84d73f__.GSplatScalarMode.None) this.workBuffer.renderScalar(sortedState.splats, this.cameraNode);
            }
            return null;
        }
        const size = this.workBuffer.textureSize;
        const buffer = new Float32Array(size * size);
        try {
            this.renderer.readRenderTargetPixels(scalarRenderTarget, 0, 0, size, size, buffer);
            if (canUseSharedCache) {
                this._scalarValues = buffer;
                this._scalarValuesVersion = scalarVersion;
                this._scalarValuesMode = mode;
            }
            if (needsTemporaryMode) {
                this.workBuffer.setScalarMode(originalMode);
                if (originalMode !== __WEBPACK_EXTERNAL_MODULE__GSplatWorkBuffer_js_ec84d73f__.GSplatScalarMode.None) this.workBuffer.renderScalar(sortedState.splats, this.cameraNode);
            }
            return {
                values: buffer,
                textureVersion: scalarVersion
            };
        } catch (error) {
            if (needsTemporaryMode) {
                this.workBuffer.setScalarMode(originalMode);
                if (originalMode !== __WEBPACK_EXTERNAL_MODULE__GSplatWorkBuffer_js_ec84d73f__.GSplatScalarMode.None) this.workBuffer.renderScalar(sortedState.splats, this.cameraNode);
            }
            this.resetScalarValuesCache();
            log.warn('[GSplatManager] Failed to read back scalarTexture: ' + (error instanceof Error ? error.message : String(error)));
            return null;
        }
    }
    resetScalarValuesCache() {
        this._scalarValues = null;
        this._scalarValuesVersion = -1;
        this._scalarValuesMode = __WEBPACK_EXTERNAL_MODULE__GSplatWorkBuffer_js_ec84d73f__.GSplatScalarMode.None;
    }
    bumpPickStateVersion() {
        this._pickStateVersion++;
    }
    get loadingCount() {
        let count = 0;
        for (const [, inst] of this.octreeInstances)count += inst.pendingLoadCount;
        return count;
    }
    get isReady() {
        return this.sortedVersion === this.lastWorldStateVersion;
    }
    get lodPresentationPending() {
        const hasPlacements = this.layerPlacements.length > 0 || this.octreeInstances.size > 0;
        if (!hasPlacements) return false;
        for (const instance of this.octreeInstances.values())if (instance.lodPresentationPending) return true;
        return this.hasNewOctreeInstances || this.params.dirty || this.layerPlacementsDirty || 0 === this.worldStates.size || this.sortedVersion !== this.lastWorldStateVersion && !this.sorter.isWorkerUnavailable;
    }
    getActiveSplatInfos() {
        const sortedState = this.worldStates.get(this.sortedVersion);
        if (!sortedState) return [];
        return sortedState.splats;
    }
    pickSplats(ray, options) {
        const activeSplatInfos = this.getActiveSplatInfos();
        if (0 === activeSplatInfos.length) return [];
        const requestedMaxResults = options?.maxResults ?? __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.DEFAULT_MAX_PICK_RESULTS;
        const pickOptions = this.getPickOptionsWithScalarFilter(options, activeSplatInfos);
        const results = __WEBPACK_EXTERNAL_MODULE__spatial_GSplatPicker_js_9b9f7b7c__.GSplatPicker.pickMultiple(ray, activeSplatInfos, pickOptions);
        return this.filterPickResults(results, requestedMaxResults);
    }
    pickSplatsFromScreen(screenX, screenY, screenWidth, screenHeight, camera, options) {
        const activeSplatInfos = this.getActiveSplatInfos();
        if (0 === activeSplatInfos.length) return [];
        const requestedMaxResults = options?.maxResults ?? __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.DEFAULT_MAX_PICK_RESULTS;
        const pickOptions = this.getPickOptionsWithScalarFilter(options, activeSplatInfos);
        const results = __WEBPACK_EXTERNAL_MODULE__spatial_GSplatPicker_js_9b9f7b7c__.GSplatPicker.pickFromScreen(screenX, screenY, screenWidth, screenHeight, camera, activeSplatInfos, pickOptions);
        return this.filterPickResults(results, requestedMaxResults);
    }
    getPickOptionsWithScalarFilter(options, activeSplatInfos) {
        if (!this.isScalarFilterActive) return options;
        const maxResults = activeSplatInfos.reduce((sum, splatInfo)=>sum + splatInfo.numSplats, 0);
        return {
            ...options,
            maxResults
        };
    }
    filterPickResults(results, maxResults) {
        if (!this.isScalarFilterActive) return results;
        if (maxResults <= 0) return [];
        const filtered = [];
        for (const result of results)if (!!this.passesScalarFilter(result.splatInfo, result.splatIndex)) {
            filtered.push(result);
            if (filtered.length >= maxResults) break;
        }
        return filtered;
    }
}
export { GSplatManager };
