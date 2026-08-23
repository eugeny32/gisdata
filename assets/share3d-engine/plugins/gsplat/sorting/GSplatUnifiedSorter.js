import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__core_gsplatBatching_js_2c6b5696__ from "../core/gsplatBatching.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__GSplatUnifiedSortWorker_js_4c808e0c__ from "./GSplatUnifiedSortWorker.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('gsplat:sort');
const unifiedSorterMemoryTotals = {
    workersCreated: 0,
    workersTerminated: 0,
    blobUrlsCreated: 0,
    blobUrlsRevoked: 0
};
const terminatedUnifiedWorkers = new WeakSet();
function getUnifiedSorterMemoryDiagnostics() {
    return {
        ...unifiedSorterMemoryTotals,
        workersActive: unifiedSorterMemoryTotals.workersCreated - unifiedSorterMemoryTotals.workersTerminated,
        blobUrlsActive: unifiedSorterMemoryTotals.blobUrlsCreated - unifiedSorterMemoryTotals.blobUrlsRevoked
    };
}
function recordUnifiedWorkerTermination(worker) {
    if (!terminatedUnifiedWorkers.has(worker)) {
        terminatedUnifiedWorkers.add(worker);
        unifiedSorterMemoryTotals.workersTerminated++;
    }
}
const SORT_BOUNDS_STRIDE = 4;
const SORT_BOUND_HAS_RADIUS = 1;
const SORT_BOUND_HAS_OPACITY = 2;
const SORT_BOUND_HAS_COVARIANCE = 4;
const SORT_RADIUS_SIGMA = 2;
const COMPRESSED_SPLATS_PER_CHUNK = 256;
function createDefaultNowMs() {
    const perf = globalThis.performance;
    if (perf && 'function' == typeof perf.now) return ()=>perf.now();
    return ()=>Date.now();
}
const DEFAULT_INTERACTIVE_SORT_SCHEDULER = {
    mode: 'off',
    targetWorkerDutyCycle: 0.7,
    minIntervalMs: 120,
    maxIntervalMs: 500,
    settleDelayMs: 50
};
function normalizeInteractiveSortSchedulerConfig(config) {
    const minIntervalMs = normalizeNonNegativeNumber(config?.minIntervalMs, DEFAULT_INTERACTIVE_SORT_SCHEDULER.minIntervalMs);
    const maxIntervalMs = Math.max(minIntervalMs, normalizeNonNegativeNumber(config?.maxIntervalMs, DEFAULT_INTERACTIVE_SORT_SCHEDULER.maxIntervalMs));
    const rawDutyCycle = Number(config?.targetWorkerDutyCycle);
    const targetWorkerDutyCycle = Number.isFinite(rawDutyCycle) ? Math.min(1, Math.max(0.1, rawDutyCycle)) : DEFAULT_INTERACTIVE_SORT_SCHEDULER.targetWorkerDutyCycle;
    return {
        mode: config?.mode === 'adaptive' ? 'adaptive' : 'off',
        targetWorkerDutyCycle,
        minIntervalMs,
        maxIntervalMs,
        settleDelayMs: normalizeNonNegativeNumber(config?.settleDelayMs, DEFAULT_INTERACTIVE_SORT_SCHEDULER.settleDelayMs)
    };
}
function normalizeNonNegativeNumber(value, fallback) {
    return 'number' == typeof value && Number.isFinite(value) ? Math.max(0, value) : fallback;
}
function normalizeWorkloadSize(value) {
    return 'number' == typeof value && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}
class GSplatUnifiedSorter {
    static #_ = this.MAX_WORKER_RECOVERY_ATTEMPTS = 3;
    static #_2 = this.SORT_FAILURE_RETRY_BACKOFF_MS = [
        250,
        1000
    ];
    getSortBoundsForResource(resource) {
        const cached = this.sortBoundsCache.get(resource.id);
        if (cached) return cached;
        const result = this.createSortBoundsForResource(resource);
        if (result) this.sortBoundsCache.set(resource.id, result);
        return result;
    }
    createSortBoundsForResource(resource) {
        const data = this.getResourceData(resource);
        const count = this.getResourceSplatCount(resource, data);
        if (count <= 0) return null;
        if (this.isSplatDataLike(data)) {
            const bounds = this.createBoundsFromSplatData(data, count);
            return bounds ? {
                data: bounds,
                source: 'splat'
            } : null;
        }
        if (this.isCompressedSplatDataLike(data)) {
            const bounds = this.createBoundsFromCompressedData(data, count);
            return bounds ? {
                data: bounds,
                source: 'chunk'
            } : null;
        }
        if (this.isIteratorDataLike(data)) try {
            const bounds = this.createBoundsFromIteratorData(data, count);
            return bounds ? {
                data: bounds,
                source: 'splat'
            } : null;
        } catch  {}
        const meta = this.getResourceMeta(resource, data);
        const bounds = this.createBoundsFromSogsMeta(meta, count);
        return bounds ? {
            data: bounds,
            source: 'global'
        } : null;
    }
    createBoundsFromSplatData(data, count) {
        const scaleX = data.getProp('scale_0');
        const scaleY = data.getProp('scale_1');
        const scaleZ = data.getProp('scale_2');
        if (!scaleX || !scaleY || !scaleZ) return null;
        const opacity = data.getProp('opacity');
        const bounds = new Float32Array(count * SORT_BOUNDS_STRIDE);
        for(let i = 0; i < count; i++){
            const maxLogScale = Math.max(scaleX[i], scaleY[i], scaleZ[i]);
            const maxScale = Number.isFinite(maxLogScale) ? Math.exp(maxLogScale) : null;
            const opacityUpper = opacity ? this.sigmoid(opacity[i]) : null;
            this.writeSortBound(bounds, i, maxScale, opacityUpper);
        }
        return bounds;
    }
    createBoundsFromCompressedData(data, count) {
        if (data.chunkSize < 12 || data.numChunks <= 0) return null;
        const bounds = new Float32Array(count * SORT_BOUNDS_STRIDE);
        for(let chunkIndex = 0; chunkIndex < data.numChunks; chunkIndex++){
            const chunkOffset = chunkIndex * data.chunkSize;
            const maxLogScale = Math.max(data.chunkData[chunkOffset + 9], data.chunkData[chunkOffset + 10], data.chunkData[chunkOffset + 11]);
            const maxScale = Number.isFinite(maxLogScale) ? Math.exp(maxLogScale) : null;
            const start = chunkIndex * COMPRESSED_SPLATS_PER_CHUNK;
            const end = Math.min(start + COMPRESSED_SPLATS_PER_CHUNK, count);
            for(let i = start; i < end; i++){
                const packedColor = data.vertexData[4 * i + 3] ?? 0xffffffff;
                const opacityUpper = (0xff & packedColor) / 255;
                this.writeSortBound(bounds, i, maxScale, opacityUpper);
            }
        }
        return bounds;
    }
    createBoundsFromIteratorData(data, count) {
        const iterator = data.createIterator();
        const bounds = new Float32Array(count * SORT_BOUNDS_STRIDE);
        for(let i = 0; i < count; i++){
            const splat = iterator.read(i);
            const maxScale = this.getMaxScaleFromLogScaleArray(splat.scale);
            const opacityUpper = void 0 === splat.opacity ? null : this.normalizeOpacityUpper(splat.opacity);
            this.writeSortBound(bounds, i, maxScale, opacityUpper);
        }
        return bounds;
    }
    createBoundsFromSogsMeta(meta, count) {
        const maxScale = this.getMaxScaleFromSogsMeta(meta);
        if (null === maxScale) return null;
        const opacityUpper = this.getOpacityUpperFromSogsMeta(meta);
        const bounds = new Float32Array(count * SORT_BOUNDS_STRIDE);
        for(let i = 0; i < count; i++)this.writeSortBound(bounds, i, maxScale, opacityUpper);
        return bounds;
    }
    writeSortBound(bounds, index, maxScale, opacityUpper) {
        const base = index * SORT_BOUNDS_STRIDE;
        let flags = 0;
        if (null !== maxScale && Number.isFinite(maxScale) && maxScale > 0) {
            bounds[base] = maxScale * SORT_RADIUS_SIGMA;
            bounds[base + 2] = maxScale * maxScale;
            flags |= SORT_BOUND_HAS_RADIUS | SORT_BOUND_HAS_COVARIANCE;
        }
        const normalizedOpacity = this.normalizeOpacityUpper(opacityUpper);
        if (null !== normalizedOpacity) {
            bounds[base + 1] = normalizedOpacity;
            flags |= SORT_BOUND_HAS_OPACITY;
        } else bounds[base + 1] = 1;
        bounds[base + 3] = flags;
    }
    getMaxScaleFromLogScaleArray(scale) {
        if (!scale || scale.length < 3) return null;
        const maxLogScale = Math.max(scale[0], scale[1], scale[2]);
        return Number.isFinite(maxLogScale) ? Math.exp(maxLogScale) : null;
    }
    getMaxScaleFromSogsMeta(meta) {
        if (!meta?.scales) return null;
        let maxLogScale = -1 / 0;
        const maxs = meta.scales.maxs;
        if (maxs) {
            for (const value of maxs)if (Number.isFinite(value) && value > maxLogScale) maxLogScale = value;
        }
        const codebook = meta.scales.codebook;
        if (codebook) {
            for (const value of codebook)if (Number.isFinite(value) && value > maxLogScale) maxLogScale = value;
        }
        return Number.isFinite(maxLogScale) ? Math.exp(maxLogScale) : null;
    }
    getOpacityUpperFromSogsMeta(meta) {
        const alphaMax = meta?.sh0?.maxs?.[3];
        return void 0 === alphaMax ? null : this.normalizeOpacityUpper(alphaMax);
    }
    normalizeOpacityUpper(value) {
        if (null === value || !Number.isFinite(value)) return null;
        if (value < 0 || value > 1) return this.sigmoid(value);
        return Math.min(1, Math.max(0, value));
    }
    sigmoid(value) {
        if (!Number.isFinite(value)) return 1;
        if (value > 0) return 1 / (1 + Math.exp(-value));
        const t = Math.exp(value);
        return t / (1 + t);
    }
    getResourceData(resource) {
        const typedResource = resource;
        return typedResource.data ?? typedResource.gsplatData ?? null;
    }
    getResourceSplatCount(resource, data) {
        const resourceCount = Number(resource.numSplats);
        if (Number.isFinite(resourceCount) && resourceCount > 0) return Math.floor(resourceCount);
        if (this.isObject(data)) {
            const dataCount = Number(data.numSplats);
            if (Number.isFinite(dataCount) && dataCount > 0) return Math.floor(dataCount);
        }
        return Math.floor((resource.centers?.length ?? 0) / 3);
    }
    getResourceMeta(resource, data) {
        const resourceMeta = resource.meta;
        if (this.isSogsMetaBoundsLike(resourceMeta)) return resourceMeta;
        if (this.isObject(data)) {
            const dataMeta = data.meta;
            if (this.isSogsMetaBoundsLike(dataMeta)) return dataMeta;
        }
        return null;
    }
    isSplatDataLike(data) {
        return this.isObject(data) && 'function' == typeof data.getProp;
    }
    isCompressedSplatDataLike(data) {
        if (!this.isObject(data)) return false;
        const typedData = data;
        return typedData.chunkData instanceof Float32Array && typedData.vertexData instanceof Uint32Array && Number.isFinite(typedData.chunkSize) && Number.isFinite(typedData.numChunks) && Number.isFinite(typedData.numSplats);
    }
    isIteratorDataLike(data) {
        return this.isObject(data) && 'function' == typeof data.createIterator;
    }
    isSogsMetaBoundsLike(value) {
        return this.isObject(value) && this.isObject(value.scales);
    }
    isObject(value) {
        return 'object' == typeof value && null !== value;
    }
    constructor(options = {}){
        this.workerFailed = false;
        this.workerRecoveryAttempts = 0;
        this.workerRecoveredPendingResync = false;
        this.sortRetryNeeded = false;
        this.sortFailureParameterEpoch = null;
        this.sortFailureCount = 0;
        this.sortRetryPermitParameterEpoch = null;
        this.sortFailureRetryTimer = null;
        this.centersSet = new Set();
        this.sortBoundsEnabled = null;
        this.sortBoundsCache = new Map();
        this.sortParams = null;
        this.currentVersion = 0;
        this.sortParametersEpoch = 0;
        this.hasNewVersion = false;
        this.jobsInFlight = 0;
        this.pendingSorted = null;
        this.pendingSortRequest = null;
        this.nextSortGeneration = 1;
        this.latestAcceptedSortGeneration = 0;
        this._staleResultCount = 0;
        this._coalescedResultCount = 0;
        this._submittedRequestCount = 0;
        this._queuedRequestCount = 0;
        this._replayedRequestCount = 0;
        this._overwrittenRequestCount = 0;
        this._rejectedRequestCount = 0;
        this._workerErrorCount = 0;
        this._lastWorkerSortTimeMs = 0;
        this._totalWorkerSortTimeMs = 0;
        this._lastRequestToSubmitLatencyMs = null;
        this._orderBufferAllocCount = 0;
        this._orderBufferReuseCount = 0;
        this._orderBufferReleaseCount = 0;
        this.availableOrderData = [];
        this.leasedOrderData = new Set();
        this.inFlightSorts = new Map();
        this.lastSortSubmittedAtMs = Number.NEGATIVE_INFINITY;
        this.workerSortTimeEmaMs = 0;
        this.workerSortTimePerSplatEmaMs = 0;
        this.currentSortWorkloadSplats = 0;
        this.pendingReplayTimer = null;
        this.pendingReplayScheduledAtMs = null;
        this._adaptiveReplayDeferralCount = 0;
        this._adaptiveReplayTimerFireCount = 0;
        this._lastAdaptiveSortIntervalMs = 0;
        this.bufferLength = 0;
        this.onSortedCallback = null;
        this.onPendingSortedCallback = null;
        this.onSortJobSettledCallback = null;
        this._lastVisibilityCompactStats = {
            totalActiveSplats: 0,
            visibleSplats: 0,
            culledSplats: 0,
            timeMs: 0,
            forwardBatchInstanceCount: 0
        };
        this._destroyed = false;
        this._firstSortEnd = null;
        this._firstSortStarted = false;
        this.radialSort = false;
        this._tempVec3 = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        this._tempVec3_2 = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        this._tempWorldCameraPos = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        this._tempWorldCameraDir = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        this._tempWorldModelPos = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        this._invModelMatrix = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4();
        this._viewProjectionMatrix = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4();
        this._modelViewProjectionMatrix = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4();
        this.sortNowMs = options.nowMs ?? createDefaultNowMs();
        this.interactiveSortScheduler = normalizeInteractiveSortSchedulerConfig(options.interactiveSortScheduler);
        this.worker = this.createWorker();
    }
    createWorker() {
        const workerSource = `(${__WEBPACK_EXTERNAL_MODULE__GSplatUnifiedSortWorker_js_4c808e0c__.UnifiedSortWorker.toString()})()`;
        const blob = new Blob([
            workerSource
        ], {
            type: "application/javascript"
        });
        const blobUrl = URL.createObjectURL(blob);
        unifiedSorterMemoryTotals.blobUrlsCreated++;
        try {
            const worker = new Worker(blobUrl);
            unifiedSorterMemoryTotals.workersCreated++;
            this.bindWorkerEvents(worker);
            this.workerFailed = false;
            return worker;
        } catch (error) {
            log.error(`创建排序 worker 失败: ${String(error)}`);
            this.workerFailed = true;
            throw error;
        } finally{
            URL.revokeObjectURL(blobUrl);
            unifiedSorterMemoryTotals.blobUrlsRevoked++;
        }
    }
    bindWorkerEvents(worker) {
        worker.addEventListener('message', this.onWorkerMessage.bind(this));
        worker.addEventListener('error', (error)=>{
            log.error(`排序 worker 错误: ${String(error)}`);
            this.handleWorkerFailure();
        });
        worker.addEventListener('messageerror', (error)=>{
            log.error(`排序 worker 消息错误: ${String(error)}`);
            this.handleWorkerFailure();
        });
    }
    setOnSortedCallback(callback) {
        this.onSortedCallback = callback;
    }
    setOnPendingSortedCallback(callback) {
        this.onPendingSortedCallback = callback;
    }
    setOnSortJobSettledCallback(callback) {
        this.onSortJobSettledCallback = callback;
    }
    setInteractiveSortSchedulerConfig(config) {
        this.interactiveSortScheduler = normalizeInteractiveSortSchedulerConfig(config);
        this.clearPendingReplayTimer();
        this.trySubmitPendingReplay();
    }
    on(event, callback) {
        if ('sorted' === event) this.setOnSortedCallback(callback);
        else log.warn(`不支持的事件: ${event}`);
    }
    setRadialSort(radial) {
        this.radialSort = radial;
    }
    updateCentersForSplats(splats, includeSortBounds = true) {
        if (this._destroyed || this.workerFailed) return;
        const sortBoundsModeChanged = null !== this.sortBoundsEnabled && this.sortBoundsEnabled !== includeSortBounds;
        this.sortBoundsEnabled = includeSortBounds;
        if (!includeSortBounds || sortBoundsModeChanged) this.sortBoundsCache.clear();
        const neededIds = new Set();
        for (const splat of splats){
            const id = splat.resource.id;
            const isFirstOccurrence = !neededIds.has(id);
            neededIds.add(id);
            if (isFirstOccurrence && (!this.centersSet.has(id) || sortBoundsModeChanged)) {
                this.centersSet.add(id);
                const centers = splat.resource.centers;
                const centersBuffer = centers.slice().buffer;
                const boundsResult = includeSortBounds ? this.getSortBoundsForResource(splat.resource) : null;
                const message = {
                    command: 'addCenters',
                    id: id,
                    centers: centersBuffer
                };
                const transfer = [
                    centersBuffer
                ];
                if (boundsResult) {
                    const boundsBuffer = boundsResult.data.slice().buffer;
                    message.bounds = boundsBuffer;
                    transfer.push(boundsBuffer);
                }
                try {
                    this.worker.postMessage(message, transfer);
                } catch  {
                    this.handleWorkerFailure();
                    return;
                }
            }
        }
        for (const id of this.centersSet)if (!neededIds.has(id)) {
            this.centersSet.delete(id);
            this.sortBoundsCache.delete(id);
            try {
                this.worker.postMessage({
                    command: 'removeCenters',
                    id: id
                });
            } catch  {
                this.handleWorkerFailure();
                return;
            }
        }
    }
    setSortParameters(payload) {
        if (this._destroyed) return;
        this.clearPendingReplayTimer();
        this.resetSortFailureRetryState();
        if (this.pendingSortRequest) {
            this.pendingSortRequest = null;
            this._overwrittenRequestCount++;
        }
        this.hasNewVersion = true;
        this.currentVersion = payload.version;
        this.sortParametersEpoch++;
        this.currentSortWorkloadSplats = normalizeWorkloadSize(payload.totalActiveSplats);
        this.refreshWorkerSortTimeEstimate();
        this.sortParams = payload;
        const newLength = payload.textureSize * payload.textureSize;
        if (newLength !== this.bufferLength) {
            this.bufferLength = newLength;
            this.availableOrderData.length = 0;
        }
        this.postSortParametersToWorker(payload);
    }
    postSortParametersToWorker(payload) {
        if (this.workerFailed) return;
        try {
            this.worker.postMessage({
                command: 'intervals',
                textureSize: payload.textureSize,
                ids: payload.ids,
                lineStarts: payload.lineStarts,
                padding: payload.padding,
                intervals: payload.intervals,
                totalUsedPixels: payload.totalUsedPixels,
                totalActiveSplats: payload.totalActiveSplats,
                version: payload.version
            });
        } catch  {
            this.handleWorkerFailure();
        }
    }
    setSortParams(camera, splats, visibilityCompact) {
        if (this._destroyed || this.workerFailed || !this.sortParams) {
            this._rejectedRequestCount++;
            return {
                status: 'rejected'
            };
        }
        const request = this.createPendingSortRequest(camera, splats, visibilityCompact);
        if (!this.hasNewVersion && this.jobsInFlight > 0) {
            this.queuePendingSortRequest(request);
            return {
                status: 'queued'
            };
        }
        if (!this.hasNewVersion && this.shouldDeferInteractiveSortRequest(request)) {
            this.queuePendingSortRequest(request);
            this.trySubmitPendingReplay();
            return {
                status: 'queued'
            };
        }
        if (this.pendingSortRequest) {
            this.pendingSortRequest = null;
            this._overwrittenRequestCount++;
        }
        this.clearPendingReplayTimer();
        return this.submitSortRequest(request);
    }
    createPendingSortRequest(camera, splats, visibilityCompact) {
        return {
            sortParams: this.prepareSortParams(camera, splats),
            version: this.sortParams?.version ?? this.currentVersion,
            parameterEpoch: this.sortParametersEpoch,
            textureSize: this.sortParams?.textureSize ?? 0,
            bufferLength: this.bufferLength,
            radialSorting: this.radialSort,
            visibilityCompact: visibilityCompact ? {
                ...visibilityCompact
            } : void 0,
            queuedAtMs: this.sortNowMs()
        };
    }
    queuePendingSortRequest(request) {
        if (this.pendingSortRequest) this._overwrittenRequestCount++;
        this.pendingSortRequest = request;
        this._queuedRequestCount++;
    }
    submitSortRequest(request, replayed = false) {
        if (this._destroyed || this.workerFailed || !this.sortParams || request.bufferLength <= 0) {
            this._rejectedRequestCount++;
            return {
                status: 'rejected'
            };
        }
        if (request.version !== this.currentVersion || request.bufferLength !== this.bufferLength) {
            this._overwrittenRequestCount++;
            this._rejectedRequestCount++;
            return {
                status: 'rejected'
            };
        }
        if (request.parameterEpoch !== this.sortParametersEpoch) {
            this._overwrittenRequestCount++;
            this._rejectedRequestCount++;
            return {
                status: 'rejected'
            };
        }
        if (this.sortFailureParameterEpoch === request.parameterEpoch) {
            if (this.sortRetryPermitParameterEpoch !== request.parameterEpoch) {
                this._rejectedRequestCount++;
                return {
                    status: 'rejected',
                    retrySuppressed: true
                };
            }
            this.sortRetryPermitParameterEpoch = null;
        }
        const submittedAtMs = this.sortNowMs();
        const requestToSubmitLatencyMs = Math.max(0, submittedAtMs - request.queuedAtMs);
        const orderBufferResult = this.acquireOrderData();
        const sortGeneration = this.nextSortGeneration++;
        this.jobsInFlight++;
        this.hasNewVersion = false;
        this._submittedRequestCount++;
        if (replayed) this._replayedRequestCount++;
        this._lastRequestToSubmitLatencyMs = requestToSubmitLatencyMs;
        this.inFlightSorts.set(sortGeneration, {
            submittedAtMs,
            requestToSubmitLatencyMs,
            bufferReused: orderBufferResult.reused,
            totalActiveSplats: normalizeWorkloadSize(this.sortParams.totalActiveSplats),
            version: request.version,
            parameterEpoch: request.parameterEpoch
        });
        try {
            this.worker.postMessage({
                command: 'sort',
                sortParams: request.sortParams,
                radialSorting: request.radialSorting,
                visibilityCompact: request.visibilityCompact,
                sortGeneration,
                order: orderBufferResult.orderData.buffer
            }, [
                orderBufferResult.orderData.buffer
            ]);
        } catch  {
            this.inFlightSorts.delete(sortGeneration);
            this.jobsInFlight = Math.max(0, this.jobsInFlight - 1);
            this.releaseOrderData(orderBufferResult.orderData);
            this._rejectedRequestCount++;
            this.handleWorkerFailure();
            return {
                status: 'rejected'
            };
        }
        this.sortRetryNeeded = false;
        this.lastSortSubmittedAtMs = submittedAtMs;
        if (!this._firstSortStarted) {
            this._firstSortStarted = true;
            this._firstSortEnd = log.perf.time('firstSort');
        }
        return {
            status: 'submitted',
            sortGeneration
        };
    }
    acquireOrderData() {
        let orderData = this.availableOrderData.pop();
        if (!orderData) {
            orderData = new Uint32Array(this.bufferLength);
            this._orderBufferAllocCount++;
            return {
                orderData,
                reused: false
            };
        }
        this._orderBufferReuseCount++;
        return {
            orderData,
            reused: true
        };
    }
    trySubmitPendingReplay() {
        if (!this.pendingSortRequest || this.jobsInFlight > 0 || this._destroyed) return;
        if ('adaptive' === this.interactiveSortScheduler.mode) {
            const targetAtMs = this.resolvePendingReplayTargetAtMs(this.pendingSortRequest);
            const delayMs = targetAtMs - this.sortNowMs();
            if (delayMs > 0) {
                this.schedulePendingReplay(targetAtMs);
                return;
            }
        }
        this.clearPendingReplayTimer();
        const request = this.pendingSortRequest;
        this.pendingSortRequest = null;
        this.submitSortRequest(request, true);
    }
    shouldDeferInteractiveSortRequest(request) {
        return 'adaptive' === this.interactiveSortScheduler.mode && this.resolvePendingReplayTargetAtMs(request) > this.sortNowMs();
    }
    resolvePendingReplayTargetAtMs(request) {
        const intervalMs = this.resolveAdaptiveSortIntervalMs();
        const cadenceAtMs = Number.isFinite(this.lastSortSubmittedAtMs) ? this.lastSortSubmittedAtMs + intervalMs : request.queuedAtMs;
        const settledAtMs = request.queuedAtMs + this.resolveAdaptiveSettleDelayMs();
        return Math.min(cadenceAtMs, settledAtMs);
    }
    resolveAdaptiveSettleDelayMs() {
        const { maxIntervalMs, settleDelayMs } = this.interactiveSortScheduler;
        const workloadAwareDelayMs = Math.min(maxIntervalMs, this.workerSortTimeEmaMs);
        return Math.max(settleDelayMs, workloadAwareDelayMs);
    }
    resolveAdaptiveSortIntervalMs() {
        const { minIntervalMs, maxIntervalMs, targetWorkerDutyCycle } = this.interactiveSortScheduler;
        const desiredIntervalMs = this.workerSortTimeEmaMs > 0 ? this.workerSortTimeEmaMs / targetWorkerDutyCycle : minIntervalMs;
        const intervalMs = Math.min(maxIntervalMs, Math.max(minIntervalMs, desiredIntervalMs));
        this._lastAdaptiveSortIntervalMs = intervalMs;
        return intervalMs;
    }
    schedulePendingReplay(targetAtMs) {
        if (null !== this.pendingReplayScheduledAtMs && Math.abs(this.pendingReplayScheduledAtMs - targetAtMs) < 1) return;
        this.clearPendingReplayTimer();
        this.pendingReplayScheduledAtMs = targetAtMs;
        this._adaptiveReplayDeferralCount++;
        const delayMs = Math.max(0, Math.ceil(targetAtMs - this.sortNowMs()));
        this.pendingReplayTimer = globalThis.setTimeout(()=>{
            this.pendingReplayTimer = null;
            this.pendingReplayScheduledAtMs = null;
            this._adaptiveReplayTimerFireCount++;
            this.trySubmitPendingReplay();
        }, delayMs);
    }
    clearPendingReplayTimer() {
        if (null !== this.pendingReplayTimer) globalThis.clearTimeout(this.pendingReplayTimer);
        this.pendingReplayTimer = null;
        this.pendingReplayScheduledAtMs = null;
    }
    updateWorkerSortTimeEma(workerTimeMs, totalActiveSplats) {
        const workloadSplats = normalizeWorkloadSize(totalActiveSplats);
        if (!Number.isFinite(workerTimeMs) || workerTimeMs <= 0 || workloadSplats <= 0) return;
        const alpha = 0.25;
        const sampleTimePerSplatMs = workerTimeMs / workloadSplats;
        this.workerSortTimePerSplatEmaMs = 0 === this.workerSortTimePerSplatEmaMs ? sampleTimePerSplatMs : this.workerSortTimePerSplatEmaMs * (1 - alpha) + sampleTimePerSplatMs * alpha;
        this.refreshWorkerSortTimeEstimate();
    }
    refreshWorkerSortTimeEstimate() {
        this.workerSortTimeEmaMs = this.currentSortWorkloadSplats > 0 && this.workerSortTimePerSplatEmaMs > 0 ? this.workerSortTimePerSplatEmaMs * this.currentSortWorkloadSplats : 0;
    }
    onWorkerMessage(message) {
        if (this._destroyed) return;
        if ((0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.isLogMessage)(message.data)) {
            (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().receiveRecord(message.data.__log__);
            return;
        }
        this.workerRecoveryAttempts = 0;
        const msgData = message.data;
        const orderData = new Uint32Array(msgData.order);
        const sortGeneration = Number.isFinite(msgData.sortGeneration) ? Math.max(0, Math.floor(msgData.sortGeneration)) : 0;
        this.jobsInFlight = Math.max(0, this.jobsInFlight - 1);
        const jobMetadata = sortGeneration > 0 ? this.inFlightSorts.get(sortGeneration) : void 0;
        if (sortGeneration > 0) this.inFlightSorts.delete(sortGeneration);
        const completedAtMs = this.sortNowMs();
        const workerTimeMs = Number.isFinite(msgData.timeMs) ? Math.max(0, msgData.timeMs) : 0;
        this._lastWorkerSortTimeMs = workerTimeMs;
        this._totalWorkerSortTimeMs += workerTimeMs;
        try {
            if (true === msgData.failed) {
                this._workerErrorCount++;
                this._rejectedRequestCount++;
                if (jobMetadata?.parameterEpoch === this.sortParametersEpoch) {
                    this.hasNewVersion = true;
                    this.recordSortFailure(jobMetadata.version, jobMetadata.parameterEpoch);
                }
                this.releaseOrderData(orderData);
                return;
            }
            if (jobMetadata?.parameterEpoch === this.sortFailureParameterEpoch) this.resetSortFailureRetryState();
            this.updateWorkerSortTimeEma(workerTimeMs, jobMetadata?.totalActiveSplats ?? msgData.totalActiveSplats ?? 0);
            if (sortGeneration > 0 && (sortGeneration <= this.latestAcceptedSortGeneration || null !== this.pendingSorted && sortGeneration <= this.pendingSorted.sortGeneration)) {
                this._staleResultCount++;
                this.releaseOrderData(orderData);
                return;
            }
            if (this._firstSortEnd) {
                this._firstSortEnd();
                this._firstSortEnd = null;
            }
            this._lastVisibilityCompactStats = {
                totalActiveSplats: msgData.totalActiveSplats ?? this.sortParams?.totalActiveSplats ?? msgData.count,
                visibleSplats: msgData.count,
                culledSplats: msgData.culledSplats ?? 0,
                timeMs: workerTimeMs,
                forwardBatchInstanceCount: 0 === msgData.count ? 0 : Math.ceil(msgData.count / __WEBPACK_EXTERNAL_MODULE__core_gsplatBatching_js_2c6b5696__.GSPLAT_INSTANCE_SIZE)
            };
            if (this.pendingSorted) {
                this._coalescedResultCount++;
                this.releaseOrderData(this.pendingSorted.orderData);
            }
            this.pendingSorted = {
                count: msgData.count,
                version: msgData.version,
                orderData: orderData,
                sortGeneration,
                submittedAtMs: jobMetadata?.submittedAtMs ?? null,
                completedAtMs,
                workerTimeMs,
                requestToSubmitLatencyMs: jobMetadata?.requestToSubmitLatencyMs ?? null,
                bufferReused: jobMetadata?.bufferReused ?? false
            };
            if (sortGeneration > 0) this.latestAcceptedSortGeneration = sortGeneration;
            this.onPendingSortedCallback?.();
        } finally{
            this.trySubmitPendingReplay();
            this.onSortJobSettledCallback?.();
        }
    }
    handleWorkerFailure() {
        if (this._destroyed) return;
        this._workerErrorCount++;
        try {
            const failedWorker = this.worker;
            failedWorker?.terminate();
            if (failedWorker) recordUnifiedWorkerTermination(failedWorker);
        } catch  {}
        this.workerFailed = true;
        this.clearPendingReplayTimer();
        this.resetSortFailureRetryState();
        this.jobsInFlight = 0;
        this.inFlightSorts.clear();
        this.pendingSortRequest = null;
        this.centersSet.clear();
        this.sortBoundsCache.clear();
        this.hasNewVersion = true;
        this.workerRecoveryAttempts++;
        try {
            if (this.workerRecoveryAttempts > GSplatUnifiedSorter.MAX_WORKER_RECOVERY_ATTEMPTS) {
                log.error(`排序 worker 连续失败 ${GSplatUnifiedSorter.MAX_WORKER_RECOVERY_ATTEMPTS} 次后放弃恢复`);
                return;
            }
            this.worker = this.createWorker();
            if (this.sortParams) this.postSortParametersToWorker(this.sortParams);
            this.workerRecoveredPendingResync = true;
        } catch (error) {
            log.error(`排序 worker 恢复失败: ${String(error)}`);
            this.workerFailed = true;
        } finally{
            this.onSortJobSettledCallback?.();
        }
    }
    consumeWorkerRecovered() {
        const recovered = this.workerRecoveredPendingResync;
        this.workerRecoveredPendingResync = false;
        return recovered;
    }
    consumeSortRetryNeeded() {
        const retryNeeded = this.sortRetryNeeded;
        this.sortRetryNeeded = false;
        if (retryNeeded && this.sortFailureParameterEpoch === this.sortParametersEpoch) this.sortRetryPermitParameterEpoch = this.sortParametersEpoch;
        return retryNeeded;
    }
    recordSortFailure(version, parameterEpoch) {
        if (this._destroyed || parameterEpoch !== this.sortParametersEpoch) return;
        if (this.sortFailureParameterEpoch !== parameterEpoch) {
            this.resetSortFailureRetryState();
            this.sortFailureParameterEpoch = parameterEpoch;
        }
        this.clearSortFailureRetryTimer();
        this.sortRetryNeeded = false;
        this.sortRetryPermitParameterEpoch = null;
        const maxRetries = GSplatUnifiedSorter.SORT_FAILURE_RETRY_BACKOFF_MS.length;
        this.sortFailureCount = Math.min(this.sortFailureCount + 1, maxRetries + 1);
        const retryDelayMs = GSplatUnifiedSorter.SORT_FAILURE_RETRY_BACKOFF_MS[this.sortFailureCount - 1];
        if (void 0 === retryDelayMs) {
            if (this.sortFailureCount === maxRetries + 1) log.warn(`排序连续失败 ${this.sortFailureCount} 次，version=${version}，已停止自动重试`);
            return;
        }
        this.sortFailureRetryTimer = globalThis.setTimeout(()=>{
            this.sortFailureRetryTimer = null;
            if (this._destroyed || this.sortFailureParameterEpoch !== parameterEpoch || this.sortParametersEpoch !== parameterEpoch) return;
            this.sortRetryNeeded = true;
            this.onSortJobSettledCallback?.();
        }, retryDelayMs);
    }
    clearSortFailureRetryTimer() {
        if (null !== this.sortFailureRetryTimer) globalThis.clearTimeout(this.sortFailureRetryTimer);
        this.sortFailureRetryTimer = null;
    }
    resetSortFailureRetryState() {
        this.clearSortFailureRetryTimer();
        this.sortFailureParameterEpoch = null;
        this.sortFailureCount = 0;
        this.sortRetryNeeded = false;
        this.sortRetryPermitParameterEpoch = null;
    }
    prepareSortParams(camera, splats) {
        const result = [];
        camera.updateMatrixWorld(true);
        this._viewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
        const worldCameraPos = this._tempWorldCameraPos.setFromMatrixPosition(camera.matrixWorld);
        const worldCameraDir = camera.getWorldDirection(this._tempWorldCameraDir);
        worldCameraDir.negate();
        for (const splat of splats){
            const node = splat.node;
            const resource = splat.resource;
            node.updateMatrixWorld(true);
            this._invModelMatrix.copy(node.matrixWorld).invert();
            const modelCameraPos = this._tempVec3_2.copy(worldCameraPos).applyMatrix4(this._invModelMatrix);
            const modelCameraDir = this._tempVec3.copy(worldCameraDir).transformDirection(this._invModelMatrix);
            const scale = node.matrixWorld.getMaxScaleOnAxis();
            const worldModelPos = this._tempWorldModelPos.setFromMatrixPosition(node.matrixWorld);
            const offset = worldModelPos.sub(worldCameraPos).dot(worldCameraDir);
            const aabbMin = splat.aabb.min.toArray();
            const aabbMax = splat.aabb.max.toArray();
            this._modelViewProjectionMatrix.multiplyMatrices(this._viewProjectionMatrix, node.matrixWorld);
            result.push({
                id: resource.id,
                transformedDirection: modelCameraDir.clone(),
                transformedPosition: modelCameraPos.clone(),
                offset,
                scale,
                aabbMin,
                aabbMax,
                modelViewProjection: Array.from(this._modelViewProjectionMatrix.elements)
            });
        }
        return result;
    }
    applyPendingSorted() {
        if (this.pendingSorted) {
            const { count, version, orderData, sortGeneration, submittedAtMs, completedAtMs, workerTimeMs, requestToSubmitLatencyMs, bufferReused } = this.pendingSorted;
            this.pendingSorted = null;
            const releaseOrderData = this.createOrderDataLease(orderData);
            if (this.onSortedCallback) this.onSortedCallback(count, version, orderData, sortGeneration, {
                releaseOrderData,
                submittedAtMs,
                completedAtMs,
                workerTimeMs,
                requestToSubmitLatencyMs,
                bufferReused
            });
            else releaseOrderData();
        }
    }
    createOrderDataLease(orderData) {
        let released = false;
        this.leasedOrderData.add(orderData);
        return ()=>{
            if (released) return;
            released = true;
            this.leasedOrderData.delete(orderData);
            this.releaseOrderData(orderData);
        };
    }
    releaseOrderData(orderData) {
        if (orderData.length === this.bufferLength) {
            this.availableOrderData.push(orderData);
            this._orderBufferReleaseCount++;
        }
    }
    destroy() {
        this._destroyed = true;
        this.clearPendingReplayTimer();
        this.resetSortFailureRetryState();
        this.pendingSorted = null;
        this.pendingSortRequest = null;
        this.centersSet.clear();
        this.sortBoundsCache.clear();
        this.availableOrderData = [];
        this.leasedOrderData.clear();
        this.inFlightSorts.clear();
        this.onSortedCallback = null;
        this.onPendingSortedCallback = null;
        this.onSortJobSettledCallback = null;
        this.sortParams = null;
        if (this.worker) {
            this.worker.terminate();
            recordUnifiedWorkerTermination(this.worker);
        }
    }
    get version() {
        return this.currentVersion;
    }
    get centersCacheSize() {
        return this.centersSet.size;
    }
    get lastVisibilityCompactStats() {
        return this._lastVisibilityCompactStats;
    }
    get staleResultCount() {
        return this._staleResultCount;
    }
    get coalescedResultCount() {
        return this._coalescedResultCount;
    }
    get isWorkerUnavailable() {
        return this.workerFailed;
    }
    get diagnostics() {
        const pendingRequestAgeMs = this.pendingSortRequest ? Math.max(0, this.sortNowMs() - this.pendingSortRequest.queuedAtMs) : null;
        return {
            submittedRequestCount: this._submittedRequestCount,
            queuedRequestCount: this._queuedRequestCount,
            replayedRequestCount: this._replayedRequestCount,
            overwrittenRequestCount: this._overwrittenRequestCount,
            rejectedRequestCount: this._rejectedRequestCount,
            staleResultCount: this._staleResultCount,
            coalescedResultCount: this._coalescedResultCount,
            workerErrorCount: this._workerErrorCount,
            lastWorkerSortTimeMs: this._lastWorkerSortTimeMs,
            totalWorkerSortTimeMs: this._totalWorkerSortTimeMs,
            pendingRequestAgeMs,
            lastRequestToSubmitLatencyMs: this._lastRequestToSubmitLatencyMs,
            orderBufferAllocCount: this._orderBufferAllocCount,
            orderBufferReuseCount: this._orderBufferReuseCount,
            orderBufferReleaseCount: this._orderBufferReleaseCount,
            pendingOrderBufferLeaseCount: this.leasedOrderData.size,
            adaptiveReplayDeferralCount: this._adaptiveReplayDeferralCount,
            adaptiveReplayTimerFireCount: this._adaptiveReplayTimerFireCount,
            adaptiveSortIntervalMs: this._lastAdaptiveSortIntervalMs,
            workerSortTimeEmaMs: this.workerSortTimeEmaMs,
            pendingReplayDelayMs: null === this.pendingReplayScheduledAtMs ? null : Math.max(0, this.pendingReplayScheduledAtMs - this.sortNowMs())
        };
    }
}
export { GSplatUnifiedSorter, getUnifiedSorterMemoryDiagnostics };
