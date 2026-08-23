import * as __WEBPACK_EXTERNAL_MODULE__ResidentNodeLRU_js_1c70eb54__ from "./ResidentNodeLRU.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__ from "../../shared/logging/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_utils_BinaryHeap_js_f44f1668__ from "../../shared/utils/BinaryHeap.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__.getLoggerManager)().getLogger('pointcloud:memory');
const TRIM_DIAGNOSTIC_INTERVAL_MS = 15000;
const DEFAULT_MAX_CACHED_POINTS = 1000000;
const EMPTY_TRIM_SUMMARY = {
    trigger: 'none',
    selected: 0,
    removed: 0,
    releasedPoints: 0,
    releasedEstimatedCpuBytes: 0,
    releasedEstimatedGpuBytes: 0,
    releasedEstimatedTotalBytes: 0,
    blockedByProtection: 0
};
function assertPositiveFinite(name, value) {
    if (!Number.isFinite(value) || value <= 0) throw new Error(`${name} 必须是大于 0 的有限数值`);
}
class PointCloudResidencyManager {
    constructor(options){
        this.lru = new __WEBPACK_EXTERNAL_MODULE__ResidentNodeLRU_js_1c70eb54__.ResidentNodeLRU();
        this.entries = new Map();
        this.residentDescendantCounts = new Map();
        this.geometryAssets = new Map();
        this.assetGeometries = new Map();
        this.assetListenerDisposers = new Map();
        this.protectedNodes = new Set();
        this.residentPoints = 0;
        this.estimatedResidentCpuBytes = 0;
        this.estimatedResidentGpuBytes = 0;
        this.estimatedResidentTotalBytes = 0;
        this.protectedEntries = 0;
        this.protectedResidentPoints = 0;
        this.trimCount = 0;
        this.trimRemovedTotal = 0;
        this.trimReleasedPointsTotal = 0;
        this.trimReleasedEstimatedBytesTotal = 0;
        this.trimBlockedByProtectionTotal = 0;
        this.assetUnloadCount = 0;
        this.assetUnloadRemovedTotal = 0;
        this.assetUnloadReleasedPointsTotal = 0;
        this.assetUnloadReleasedEstimatedBytesTotal = 0;
        this.loadStartedCount = 0;
        this.initialLoadStartedCount = 0;
        this.retryStartedCount = 0;
        this.reloadStartedCount = 0;
        this.loadCompletedCount = 0;
        this.structuralCompletedCount = 0;
        this.loadFailedCount = 0;
        this.loadAbortedCount = 0;
        this.lateResultDroppedCount = 0;
        this.inFlightLoads = 0;
        this.peakInFlightLoads = 0;
        this.peakResidentEntries = 0;
        this.peakResidentPoints = 0;
        this.peakEstimatedResidentCpuBytes = 0;
        this.peakEstimatedResidentGpuBytes = 0;
        this.peakEstimatedResidentTotalBytes = 0;
        this.peakProtectedEntries = 0;
        this.lastTrimDiagnosticAt = Number.NEGATIVE_INFINITY;
        this.lastTrim = {
            ...EMPTY_TRIM_SUMMARY
        };
        const lowWatermarkRatio = options.lowWatermarkRatio ?? 0.85;
        if (!Number.isFinite(lowWatermarkRatio) || lowWatermarkRatio <= 0 || lowWatermarkRatio >= 1) throw new Error('lowWatermarkRatio 必须大于 0 且小于 1');
        if (void 0 !== options.maxResidentPoints) assertPositiveFinite('maxResidentPoints', options.maxResidentPoints);
        const maxCachedPoints = options.maxCachedPoints ?? DEFAULT_MAX_CACHED_POINTS;
        assertPositiveFinite('maxCachedPoints', maxCachedPoints);
        if (void 0 !== options.maxEstimatedResidentBytes) assertPositiveFinite('maxEstimatedResidentBytes', options.maxEstimatedResidentBytes);
        this.pointHighWatermark = options.maxResidentPoints ?? null;
        this.pointLowWatermark = void 0 === options.maxResidentPoints ? null : Math.floor(options.maxResidentPoints * lowWatermarkRatio);
        this.cachedPointHighWatermark = maxCachedPoints;
        this.cachedPointLowWatermark = Math.floor(maxCachedPoints * lowWatermarkRatio);
        this.estimatedByteHighWatermark = options.maxEstimatedResidentBytes ?? null;
        this.estimatedByteLowWatermark = void 0 === options.maxEstimatedResidentBytes ? null : Math.floor(options.maxEstimatedResidentBytes * lowWatermarkRatio);
    }
    attachAsset(assetId, geometry) {
        this.detachAsset(assetId);
        this.geometryAssets.set(geometry, assetId);
        this.assetGeometries.set(assetId, geometry);
        const disposeListener = 'function' == typeof geometry.addResourceStateListener ? geometry.addResourceStateListener((node)=>this.syncNode(node)) : ()=>{};
        this.assetListenerDisposers.set(assetId, disposeListener);
        if (!geometry.root) return;
        this.forEachTopologyNode(geometry.root, (node)=>{
            this.syncNode(node);
        });
    }
    detachAsset(assetId) {
        this.assetListenerDisposers.get(assetId)?.();
        this.assetListenerDisposers.delete(assetId);
        const geometry = this.assetGeometries.get(assetId);
        if (geometry) {
            this.geometryAssets.delete(geometry);
            this.assetGeometries.delete(assetId);
        }
        for (const [node, entry] of this.entries)if (entry.assetId === assetId) this.removeEntry(node, entry);
        this.recountProtectedEntries();
    }
    touch(node) {
        if (!this.entries.has(node)) this.syncNode(node);
        if (this.entries.has(node)) this.lru.touch(node);
    }
    recordNodeLoadStarted(event) {
        this.loadStartedCount += 1;
        this.inFlightLoads += 1;
        if ('initial' === event.kind) this.initialLoadStartedCount += 1;
        else if ('retry' === event.kind) this.retryStartedCount += 1;
        else this.reloadStartedCount += 1;
        this.peakInFlightLoads = Math.max(this.peakInFlightLoads, this.inFlightLoads);
    }
    recordNodeLoadSettled(event) {
        this.inFlightLoads = Math.max(0, this.inFlightLoads - 1);
        if ('loaded' === event.status) this.loadCompletedCount += 1;
        else if ('structural' === event.status) this.structuralCompletedCount += 1;
        else if ('failed' === event.status) this.loadFailedCount += 1;
        else if ('aborted' === event.status) this.loadAbortedCount += 1;
        else this.lateResultDroppedCount += 1;
    }
    setProtectedNodes(nodes) {
        const protectedNodes = new Set();
        for (const node of nodes){
            let current = node;
            while(current){
                protectedNodes.add(current);
                current = current.parent;
            }
        }
        this.protectedNodes = protectedNodes;
        this.recountProtectedEntries();
    }
    unloadAsset(assetId) {
        const summary = this.releaseAssetPayload(assetId);
        if (this.assetGeometries.has(assetId)) {
            this.assetUnloadCount += 1;
            this.assetUnloadRemovedTotal += summary.removed;
            this.assetUnloadReleasedPointsTotal += summary.releasedPoints;
            this.assetUnloadReleasedEstimatedBytesTotal += summary.releasedEstimatedTotalBytes;
        }
        return summary;
    }
    releaseAssetPayload(assetId) {
        const geometry = this.assetGeometries.get(assetId);
        const summary = {
            ...EMPTY_TRIM_SUMMARY
        };
        if (!geometry?.root) return summary;
        this.forEachTopologyNode(geometry.root, (node)=>{
            const release = node.unload();
            if (release.released) {
                this.accumulateRelease(summary, release);
                summary.removed += 1;
            }
        });
        return summary;
    }
    maintainBudget() {
        const trigger = this.getTrimTrigger();
        if ('none' === trigger) {
            this.lastTrim = {
                ...EMPTY_TRIM_SUMMARY
            };
            return {
                ...this.lastTrim
            };
        }
        const beforeEntries = this.entries.size;
        const beforePoints = this.residentPoints;
        const beforeCachedPoints = this.getCachedResidentPoints();
        const beforeEstimatedBytes = this.estimatedResidentTotalBytes;
        const summary = {
            ...EMPTY_TRIM_SUMMARY,
            trigger
        };
        const blockedNodes = new Set();
        const ranks = new Map();
        const queuedNodes = new Set();
        const candidates = new __WEBPACK_EXTERNAL_MODULE__shared_utils_BinaryHeap_js_f44f1668__.BinaryHeap((candidate)=>candidate.rank);
        const cursor = this.lru.createOldestFirstCursor();
        let rank = 0;
        for(let node = cursor.next(); node; node = cursor.next()){
            ranks.set(node, rank);
            rank += 1;
            this.enqueueSafeCandidate(node, ranks, candidates, queuedNodes, blockedNodes);
        }
        while(this.isAboveLowWatermarks()){
            const candidate = this.popSafeCandidate(candidates, queuedNodes, blockedNodes);
            if (!candidate) break;
            summary.selected += 1;
            const release = candidate.unload();
            if (this.entries.has(candidate)) {
                log.warn(`event=pointcloud.residency.trim phase=stalled node=${candidate.name} state=${candidate.resourceState}`);
                break;
            }
            if (release.released) {
                summary.removed += 1;
                this.accumulateRelease(summary, release);
            }
            this.enqueueSafeAncestors(candidate.parent, ranks, candidates, queuedNodes, blockedNodes);
        }
        summary.blockedByProtection = this.isAboveLowWatermarks() ? blockedNodes.size : 0;
        this.trimCount += 1;
        this.trimRemovedTotal += summary.removed;
        this.trimReleasedPointsTotal += summary.releasedPoints;
        this.trimReleasedEstimatedBytesTotal += summary.releasedEstimatedTotalBytes;
        this.trimBlockedByProtectionTotal += summary.blockedByProtection;
        this.lastTrim = summary;
        if (log.isEnabled(__WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__.LogLevel.DEBUG)) {
            const now = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__.getLoggerManager)().now();
            if (summary.removed > 0 || now - this.lastTrimDiagnosticAt >= TRIM_DIAGNOSTIC_INTERVAL_MS) {
                this.lastTrimDiagnosticAt = now;
                log.debug(`event=pointcloud.residency.trim phase=complete trigger=${summary.trigger} selected=${summary.selected} removed=${summary.removed} releasedPoints=${summary.releasedPoints} releasedEstimatedCpuBytes=${summary.releasedEstimatedCpuBytes} releasedEstimatedGpuBytes=${summary.releasedEstimatedGpuBytes} releasedEstimatedTotalBytes=${summary.releasedEstimatedTotalBytes} blockedByProtection=${summary.blockedByProtection} beforeEntries=${beforeEntries} afterEntries=${this.entries.size} beforePoints=${beforePoints} afterPoints=${this.residentPoints} beforeCachedPoints=${beforeCachedPoints} afterCachedPoints=${this.getCachedResidentPoints()} beforeEstimatedTotalBytes=${beforeEstimatedBytes} afterEstimatedTotalBytes=${this.estimatedResidentTotalBytes} protectedEntries=${this.protectedEntries} protectedResidentPoints=${this.protectedResidentPoints} cachedPointHighWatermark=${this.cachedPointHighWatermark} cachedPointLowWatermark=${this.cachedPointLowWatermark} pointHighWatermark=${this.pointHighWatermark ?? 'disabled'} pointLowWatermark=${this.pointLowWatermark ?? 'disabled'} estimatedByteHighWatermark=${this.estimatedByteHighWatermark ?? 'disabled'} estimatedByteLowWatermark=${this.estimatedByteLowWatermark ?? 'disabled'}`);
            }
        }
        return {
            ...summary
        };
    }
    getSnapshot() {
        return {
            residentEntries: this.entries.size,
            residentPoints: this.residentPoints,
            estimatedResidentCpuBytes: this.estimatedResidentCpuBytes,
            estimatedResidentGpuBytes: this.estimatedResidentGpuBytes,
            estimatedResidentTotalBytes: this.estimatedResidentTotalBytes,
            protectedEntries: this.protectedEntries,
            protectedResidentPoints: this.protectedResidentPoints,
            cachedResidentPoints: this.getCachedResidentPoints(),
            pointHighWatermark: this.pointHighWatermark,
            pointLowWatermark: this.pointLowWatermark,
            cachedPointHighWatermark: this.cachedPointHighWatermark,
            cachedPointLowWatermark: this.cachedPointLowWatermark,
            estimatedByteHighWatermark: this.estimatedByteHighWatermark,
            estimatedByteLowWatermark: this.estimatedByteLowWatermark,
            trimTrigger: this.getTrimTrigger(),
            trimCount: this.trimCount,
            trimRemovedTotal: this.trimRemovedTotal,
            trimReleasedPointsTotal: this.trimReleasedPointsTotal,
            trimReleasedEstimatedBytesTotal: this.trimReleasedEstimatedBytesTotal,
            trimBlockedByProtectionTotal: this.trimBlockedByProtectionTotal,
            assetUnloadCount: this.assetUnloadCount,
            assetUnloadRemovedTotal: this.assetUnloadRemovedTotal,
            assetUnloadReleasedPointsTotal: this.assetUnloadReleasedPointsTotal,
            assetUnloadReleasedEstimatedBytesTotal: this.assetUnloadReleasedEstimatedBytesTotal,
            loadStartedCount: this.loadStartedCount,
            initialLoadStartedCount: this.initialLoadStartedCount,
            retryStartedCount: this.retryStartedCount,
            reloadStartedCount: this.reloadStartedCount,
            loadCompletedCount: this.loadCompletedCount,
            structuralCompletedCount: this.structuralCompletedCount,
            loadFailedCount: this.loadFailedCount,
            loadAbortedCount: this.loadAbortedCount,
            lateResultDroppedCount: this.lateResultDroppedCount,
            inFlightLoads: this.inFlightLoads,
            peakInFlightLoads: this.peakInFlightLoads,
            peakResidentEntries: this.peakResidentEntries,
            peakResidentPoints: this.peakResidentPoints,
            peakEstimatedResidentCpuBytes: this.peakEstimatedResidentCpuBytes,
            peakEstimatedResidentGpuBytes: this.peakEstimatedResidentGpuBytes,
            peakEstimatedResidentTotalBytes: this.peakEstimatedResidentTotalBytes,
            peakProtectedEntries: this.peakProtectedEntries,
            lastTrim: {
                ...this.lastTrim
            }
        };
    }
    dispose() {
        for (const assetId of Array.from(this.assetGeometries.keys())){
            this.releaseAssetPayload(assetId);
            this.detachAsset(assetId);
        }
        this.protectedNodes.clear();
        this.protectedEntries = 0;
        this.protectedResidentPoints = 0;
        this.residentDescendantCounts.clear();
        this.lru.clear();
    }
    syncNode(node) {
        const assetId = this.geometryAssets.get(node.octreeGeometry);
        const state = node.resourceState;
        if (void 0 === assetId || 'decoded' !== state && 'resident' !== state) {
            const entry = this.entries.get(node);
            if (entry) this.removeEntry(node, entry);
            return;
        }
        const metrics = node.getResourceMetrics();
        const previous = this.entries.get(node);
        const isProtected = this.protectedNodes.has(node);
        if (previous) {
            this.subtractEntry(previous);
            if (isProtected) this.protectedResidentPoints -= previous.points;
        } else {
            this.lru.add(node);
            this.adjustResidentAncestorCounts(node, 1);
        }
        const entry = {
            ...metrics,
            assetId,
            state
        };
        this.entries.set(node, entry);
        this.addEntry(entry);
        if (isProtected) {
            this.protectedResidentPoints += entry.points;
            if (!previous) {
                this.protectedEntries += 1;
                this.updateProtectedPeak();
            }
        }
    }
    removeEntry(node, entry) {
        this.subtractEntry(entry);
        this.entries.delete(node);
        this.lru.remove(node);
        this.adjustResidentAncestorCounts(node, -1);
        if (this.protectedNodes.has(node)) {
            this.protectedEntries = Math.max(0, this.protectedEntries - 1);
            this.protectedResidentPoints = Math.max(0, this.protectedResidentPoints - entry.points);
        }
    }
    addEntry(entry) {
        this.residentPoints += entry.points;
        this.estimatedResidentCpuBytes += entry.estimatedCpuBytes;
        this.estimatedResidentGpuBytes += entry.estimatedGpuBytes;
        this.estimatedResidentTotalBytes += entry.estimatedTotalBytes;
        this.updateResourcePeaks();
    }
    subtractEntry(entry) {
        this.residentPoints -= entry.points;
        this.estimatedResidentCpuBytes -= entry.estimatedCpuBytes;
        this.estimatedResidentGpuBytes -= entry.estimatedGpuBytes;
        this.estimatedResidentTotalBytes -= entry.estimatedTotalBytes;
    }
    getTrimTrigger() {
        const pointsExceeded = this.getCachedResidentPoints() > this.cachedPointHighWatermark || null !== this.pointHighWatermark && this.residentPoints > this.pointHighWatermark;
        const estimatedBytesExceeded = null !== this.estimatedByteHighWatermark && this.estimatedResidentTotalBytes > this.estimatedByteHighWatermark;
        if (pointsExceeded && estimatedBytesExceeded) return 'both';
        if (pointsExceeded) return 'points';
        return estimatedBytesExceeded ? 'estimatedBytes' : 'none';
    }
    isAboveLowWatermarks() {
        if (this.getCachedResidentPoints() > this.cachedPointLowWatermark) return true;
        if (null !== this.pointLowWatermark && this.residentPoints > this.pointLowWatermark) return true;
        return null !== this.estimatedByteLowWatermark && this.estimatedResidentTotalBytes > this.estimatedByteLowWatermark;
    }
    enqueueSafeCandidate(node, ranks, candidates, queuedNodes, blockedNodes) {
        if (!this.entries.has(node) || queuedNodes.has(node)) return;
        if (this.protectedNodes.has(node)) {
            blockedNodes.add(node);
            return;
        }
        if ((this.residentDescendantCounts.get(node) ?? 0) > 0) return;
        const rank = ranks.get(node);
        if (void 0 === rank) return;
        queuedNodes.add(node);
        candidates.push({
            node,
            rank
        });
    }
    popSafeCandidate(candidates, queuedNodes, blockedNodes) {
        for(let candidate = candidates.pop(); candidate; candidate = candidates.pop()){
            const { node } = candidate;
            queuedNodes.delete(node);
            if (!!this.entries.has(node)) {
                if (this.protectedNodes.has(node)) {
                    blockedNodes.add(node);
                    continue;
                }
                if ((this.residentDescendantCounts.get(node) ?? 0) === 0) return node;
            }
        }
        return null;
    }
    enqueueSafeAncestors(node, ranks, candidates, queuedNodes, blockedNodes) {
        let current = node;
        while(current){
            this.enqueueSafeCandidate(current, ranks, candidates, queuedNodes, blockedNodes);
            current = current.parent;
        }
    }
    adjustResidentAncestorCounts(node, delta) {
        let current = node.parent;
        while(current){
            const count = (this.residentDescendantCounts.get(current) ?? 0) + delta;
            if (count > 0) this.residentDescendantCounts.set(current, count);
            else this.residentDescendantCounts.delete(current);
            current = current.parent;
        }
    }
    forEachTopologyNode(root, visit) {
        const stack = [
            root
        ];
        while(stack.length > 0){
            const node = stack.pop();
            visit(node);
            if ('function' == typeof node.getChildren) stack.push(...node.getChildren());
        }
    }
    accumulateRelease(summary, release) {
        summary.releasedPoints += release.points;
        summary.releasedEstimatedCpuBytes += release.estimatedCpuBytes;
        summary.releasedEstimatedGpuBytes += release.estimatedGpuBytes;
        summary.releasedEstimatedTotalBytes += release.estimatedTotalBytes;
    }
    recountProtectedEntries() {
        let count = 0;
        let points = 0;
        for (const node of this.protectedNodes){
            const entry = this.entries.get(node);
            if (entry) {
                count += 1;
                points += entry.points;
            }
        }
        this.protectedEntries = count;
        this.protectedResidentPoints = points;
        this.updateProtectedPeak();
    }
    getCachedResidentPoints() {
        return Math.max(0, this.residentPoints - this.protectedResidentPoints);
    }
    updateProtectedPeak() {
        this.peakProtectedEntries = Math.max(this.peakProtectedEntries, this.protectedEntries);
    }
    updateResourcePeaks() {
        this.peakResidentEntries = Math.max(this.peakResidentEntries, this.entries.size);
        this.peakResidentPoints = Math.max(this.peakResidentPoints, this.residentPoints);
        this.peakEstimatedResidentCpuBytes = Math.max(this.peakEstimatedResidentCpuBytes, this.estimatedResidentCpuBytes);
        this.peakEstimatedResidentGpuBytes = Math.max(this.peakEstimatedResidentGpuBytes, this.estimatedResidentGpuBytes);
        this.peakEstimatedResidentTotalBytes = Math.max(this.peakEstimatedResidentTotalBytes, this.estimatedResidentTotalBytes);
    }
}
export { PointCloudResidencyManager };
