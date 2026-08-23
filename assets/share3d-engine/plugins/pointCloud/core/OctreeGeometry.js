import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
const NODE_LOAD_RETRY_DELAYS_MS = [
    1000,
    3000,
    10000,
    30000
];
const NODE_LOAD_MAX_RETRY_COUNT = 5;
const EMPTY_RESOURCE_METRICS = {
    points: 0,
    estimatedCpuBytes: 0,
    estimatedGpuBytes: 0,
    estimatedTotalBytes: 0
};
function getArrayByteLength(value) {
    return ArrayBuffer.isView(value) ? value.byteLength : 0;
}
function estimateGeometryBytes(geometry) {
    if (!geometry) return {
        cpu: 0,
        gpu: 0
    };
    const ownedBuffers = new Set();
    let cpu = 0;
    let gpu = 0;
    const countAttribute = (attribute)=>{
        const array = attribute.array;
        if (ArrayBuffer.isView(array) && !ownedBuffers.has(array.buffer)) {
            ownedBuffers.add(array.buffer);
            cpu += array.byteLength;
            gpu += array.byteLength;
        }
        const preciseBuffer = attribute.potree?.preciseBuffer;
        const preciseBytes = getArrayByteLength(preciseBuffer);
        if (preciseBytes > 0) {
            const preciseArray = preciseBuffer;
            if (!ownedBuffers.has(preciseArray.buffer)) {
                ownedBuffers.add(preciseArray.buffer);
                cpu += preciseBytes;
            }
        }
    };
    for (const attribute of Object.values(geometry.attributes))countAttribute(attribute);
    if (geometry.index) countAttribute(geometry.index);
    return {
        cpu,
        gpu
    };
}
function nowMs() {
    return globalThis.performance?.now?.() ?? Date.now();
}
class OctreeGeometry {
    addResourceStateListener(listener) {
        this.resourceStateListeners.add(listener);
        return ()=>this.resourceStateListeners.delete(listener);
    }
    notifyResourceStateChanged(node, previousState, state) {
        for (const listener of this.resourceStateListeners)listener(node, previousState, state);
    }
    dispose() {
        if (this.disposed) return;
        this.disposed = true;
        if (this.root) {
            const stack = [
                this.root
            ];
            while(stack.length > 0){
                const node = stack.pop();
                for (const child of node.getChildren())stack.push(child);
                node.dispose();
            }
        }
        this.resourceStateListeners.clear();
    }
    constructor(){
        this.url = null;
        this.spacing = 0;
        this.boundingBox = null;
        this.root = null;
        this.pointAttributes = null;
        this.loader = null;
        this.disposed = false;
        this.resourceStateListeners = new Set();
    }
}
class OctreeGeometryNode {
    static #_ = this.IDCount = 0;
    constructor(name, octreeGeometry, boundingBox, Potree){
        this.children = {};
        this.numPoints = 0;
        this.level = null;
        this.oneTimeDisposeHandlers = [];
        this.geometry = null;
        this.loadFailed = false;
        this.loadErrorCount = 0;
        this.retryAfter = 0;
        this.loadPermanentlyFailed = false;
        this._resourceState = 'unloaded';
        this._loadGeneration = 0;
        this._structural = false;
        this.id = OctreeGeometryNode.IDCount++;
        this.name = name;
        this.index = parseInt(name.charAt(name.length - 1), 10);
        this.octreeGeometry = octreeGeometry;
        this.boundingBox = boundingBox;
        this.boundingSphere = boundingBox.getBoundingSphere(new __WEBPACK_EXTERNAL_MODULE_three__.Sphere());
        this.Potree = Potree;
    }
    get resourceState() {
        return this._resourceState;
    }
    get loaded() {
        return 'decoded' === this._resourceState || 'resident' === this._resourceState;
    }
    get loading() {
        return 'loading' === this._resourceState;
    }
    get disposed() {
        return 'disposed' === this._resourceState;
    }
    get structural() {
        return this._structural;
    }
    isGeometryNode() {
        return true;
    }
    getLevel() {
        return this.level;
    }
    isTreeNode() {
        return false;
    }
    isLoaded() {
        return this.loaded;
    }
    getBoundingSphere() {
        return this.boundingSphere;
    }
    getChildren() {
        const children = [];
        for(let i = 0; i < 8; i++)if (this.children[i]) children.push(this.children[i]);
        return children;
    }
    getBoundingBox() {
        return this.boundingBox;
    }
    load(signal = this.octreeGeometry.loadSignal) {
        if (!this.canStartLoad(signal)) return false;
        this.octreeGeometry.loader?.load(this, signal);
        return true;
    }
    canStartLoad(signal = this.octreeGeometry.loadSignal) {
        if (this.loaded || this.loading || this._structural) return false;
        if (this.disposed || this.octreeGeometry.disposed || signal?.aborted) return false;
        if (this.loadPermanentlyFailed) return false;
        if (this.loadFailed && nowMs() < this.retryAfter) return false;
        if (this.Potree.numNodesLoading >= this.Potree.maxNodesLoading) return false;
        return !!this.octreeGeometry.loader;
    }
    beginLoad(signal = this.octreeGeometry.loadSignal) {
        if (!this.canStartLoad(signal)) return null;
        this._loadGeneration += 1;
        this._setResourceState('loading');
        return this._loadGeneration;
    }
    isLoadTokenCurrent(token) {
        return token === this._loadGeneration && 'loading' === this._resourceState && !this.octreeGeometry.disposed;
    }
    completeDecoded(token, geometry, density) {
        if (!this.isLoadTokenCurrent(token)) return false;
        this.geometry = geometry;
        this.density = density;
        this.clearLoadFailure();
        this._setResourceState('decoded');
        return true;
    }
    markResident() {
        if ('resident' === this._resourceState) return true;
        if ('decoded' !== this._resourceState || !this.geometry) return false;
        this._setResourceState('resident');
        return true;
    }
    markStructural() {
        if (this.disposed) return;
        this._structural = true;
        this._releaseLoadedGeometry();
        this.clearLoadFailure();
        if ('loading' !== this._resourceState) {
            this._loadGeneration += 1;
            this._setResourceState('unloaded');
        }
    }
    completeStructural(token) {
        if (!this.isLoadTokenCurrent(token)) return false;
        this._structural = true;
        this._loadGeneration += 1;
        this._releaseLoadedGeometry();
        this.clearLoadFailure();
        this._setResourceState('unloaded');
        return true;
    }
    cancelLoad(token) {
        if (void 0 !== token && token !== this._loadGeneration) return;
        if ('loading' !== this._resourceState) return;
        this._loadGeneration += 1;
        this._setResourceState('unloaded');
    }
    markLoadFailed(reason, token) {
        if (void 0 !== token && token !== this._loadGeneration) return;
        if (this.disposed) return;
        this._loadGeneration += 1;
        this._setResourceState('unloaded');
        this.loadFailed = true;
        this.loadErrorCount += 1;
        this.lastLoadError = reason;
        if (this.loadErrorCount >= NODE_LOAD_MAX_RETRY_COUNT) {
            this.loadPermanentlyFailed = true;
            this.retryAfter = Number.POSITIVE_INFINITY;
            return;
        }
        const delay = NODE_LOAD_RETRY_DELAYS_MS[Math.min(this.loadErrorCount - 1, NODE_LOAD_RETRY_DELAYS_MS.length - 1)];
        this.retryAfter = nowMs() + delay;
    }
    clearLoadFailure() {
        this.loadFailed = false;
        this.loadErrorCount = 0;
        this.retryAfter = 0;
        this.lastLoadError = void 0;
        this.loadPermanentlyFailed = false;
    }
    getNumPoints() {
        return this.numPoints;
    }
    getResourceMetrics() {
        if (!this.loaded || !this.geometry) return {
            ...EMPTY_RESOURCE_METRICS
        };
        const estimated = estimateGeometryBytes(this.geometry);
        const estimatedGpuBytes = 'resident' === this._resourceState ? estimated.gpu : 0;
        return {
            points: this.numPoints,
            estimatedCpuBytes: estimated.cpu,
            estimatedGpuBytes,
            estimatedTotalBytes: estimated.cpu + estimatedGpuBytes
        };
    }
    dispose() {
        return this._release('disposed');
    }
    unload() {
        return this._release('unloaded');
    }
    _release(finalState) {
        if (this.disposed) return this._emptyReleaseRecord('disposed');
        const previousState = this._resourceState;
        const metrics = this.getResourceMetrics();
        const released = null !== this.geometry;
        this._loadGeneration += 1;
        this.loadFailed = false;
        this.retryAfter = 0;
        this.loadPermanentlyFailed = false;
        this._releaseLoadedGeometry();
        this._setResourceState(finalState);
        return {
            ...metrics,
            released,
            previousState
        };
    }
    _releaseLoadedGeometry() {
        if (this.geometry) {
            this.geometry.dispose();
            this.geometry = null;
        }
        for(let i = 0; i < this.oneTimeDisposeHandlers.length; i++){
            const handler = this.oneTimeDisposeHandlers[i];
            handler();
        }
        this.oneTimeDisposeHandlers = [];
    }
    _setResourceState(state) {
        if (this._resourceState === state) return;
        const previousState = this._resourceState;
        this._resourceState = state;
        this.octreeGeometry.notifyResourceStateChanged(this, previousState, state);
    }
    _emptyReleaseRecord(previousState) {
        return {
            ...EMPTY_RESOURCE_METRICS,
            released: false,
            previousState
        };
    }
}
export { OctreeGeometry, OctreeGeometryNode };
