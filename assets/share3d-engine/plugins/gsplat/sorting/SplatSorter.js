import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__SplatSortWorker_js_24bbfc08__ from "./SplatSortWorker.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('gsplat:sort');
const sorterMemoryTotals = {
    workersCreated: 0,
    workersTerminated: 0,
    blobUrlsCreated: 0,
    blobUrlsRevoked: 0
};
function getSplatSorterMemoryDiagnostics() {
    return {
        ...sorterMemoryTotals,
        workersActive: sorterMemoryTotals.workersCreated - sorterMemoryTotals.workersTerminated,
        blobUrlsActive: sorterMemoryTotals.blobUrlsCreated - sorterMemoryTotals.blobUrlsRevoked
    };
}
const _invModelMatrix = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4();
const _modelCameraPos = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
const _modelCameraDir = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
class SplatSorter {
    constructor(splatData, orderTexture, options = {}){
        this.worker = null;
        this.orderBufferPool = [];
        this.culledIndices = null;
        this.originalCenters = null;
        this.lastSortTimeMs = 0;
        this.orderTexture = orderTexture;
        this.retainCentersForMapping = options.retainCentersForMapping ?? true;
        if (options.onSortComplete) this.onSortCompleteCallback = options.onSortComplete;
        const textureData = orderTexture.image.data;
        const initialBuffer = textureData.slice();
        const n = splatData.numSplats;
        for(let i = 0; i < n; i++)initialBuffer[i] = i;
        this.orderBufferPool.push(initialBuffer);
        this.createWorker(splatData);
    }
    createWorker(splatData) {
        const blob = new Blob([
            __WEBPACK_EXTERNAL_MODULE__SplatSortWorker_js_24bbfc08__.SortWorkerCode
        ], {
            type: "application/javascript"
        });
        const blobURL = URL.createObjectURL(blob);
        sorterMemoryTotals.blobUrlsCreated++;
        try {
            this.worker = new Worker(blobURL);
            sorterMemoryTotals.workersCreated++;
        } finally{
            URL.revokeObjectURL(blobURL);
            sorterMemoryTotals.blobUrlsRevoked++;
        }
        const centers = splatData.getCenters();
        this.originalCenters = this.retainCentersForMapping ? centers.slice() : null;
        const orderBuffer = this.orderBufferPool.pop();
        this.worker.postMessage({
            centers: centers.buffer,
            order: orderBuffer.buffer
        }, [
            centers.buffer,
            orderBuffer.buffer
        ]);
        this.worker.onmessage = (e)=>{
            this.onSortComplete(e.data);
        };
        this.worker.onerror = (e)=>{
            log.error(`[ThreeGS] Sorter Worker Error: ${e.message}`);
        };
    }
    setCulledIndices(indices) {
        this.culledIndices = indices;
    }
    setMapping(mapping) {
        if (!this.originalCenters) {
            log.warn('[ThreeGS] Sorter mapping requires retained centers');
            return;
        }
        if (mapping) {
            const centers = new Float32Array(3 * mapping.length);
            for(let i = 0; i < mapping.length; i++){
                const src = 3 * mapping[i];
                const dst = 3 * i;
                centers[dst + 0] = this.originalCenters[src + 0];
                centers[dst + 1] = this.originalCenters[src + 1];
                centers[dst + 2] = this.originalCenters[src + 2];
            }
            this.worker?.postMessage({
                centers: centers.buffer,
                mapping: mapping.buffer
            }, [
                centers.buffer,
                mapping.buffer
            ]);
        } else {
            const centers = this.originalCenters.slice();
            this.worker?.postMessage({
                centers: centers.buffer,
                mapping: null
            }, [
                centers.buffer
            ]);
        }
    }
    setCamera(camera, meshMatrixWorld) {
        const worldPos = camera.position;
        const worldDir = camera.getWorldDirection(_modelCameraDir);
        worldDir.negate();
        let camPosX, camPosY, camPosZ;
        let camDirX, camDirY, camDirZ;
        if (meshMatrixWorld) {
            _invModelMatrix.copy(meshMatrixWorld).invert();
            _modelCameraPos.copy(worldPos).applyMatrix4(_invModelMatrix);
            _modelCameraDir.copy(worldDir).transformDirection(_invModelMatrix);
            camPosX = _modelCameraPos.x;
            camPosY = _modelCameraPos.y;
            camPosZ = _modelCameraPos.z;
            camDirX = _modelCameraDir.x;
            camDirY = _modelCameraDir.y;
            camDirZ = _modelCameraDir.z;
        } else {
            camPosX = worldPos.x;
            camPosY = worldPos.y;
            camPosZ = worldPos.z;
            camDirX = worldDir.x;
            camDirY = worldDir.y;
            camDirZ = worldDir.z;
        }
        const message = {
            cameraPosition: {
                x: camPosX,
                y: camPosY,
                z: camPosZ
            },
            cameraDirection: {
                x: camDirX,
                y: camDirY,
                z: camDirZ
            }
        };
        const transferList = [];
        if (this.culledIndices) {
            message.culledIndices = this.culledIndices.buffer;
            if (this.culledIndices.buffer instanceof ArrayBuffer) transferList.push(this.culledIndices.buffer);
            this.culledIndices = null;
        }
        this.worker?.postMessage(message, transferList);
    }
    onSortComplete(data) {
        const newOrder = new Uint32Array(data.order);
        const oldOrder = this.orderTexture.image.data;
        const oldBuffer = oldOrder.buffer;
        this.worker?.postMessage({
            order: oldBuffer
        }, [
            oldBuffer
        ]);
        this.orderTexture.image.data = newOrder;
        this.orderTexture.needsUpdate = true;
        if (this.onSortCompleteCallback) this.onSortCompleteCallback({
            count: data.count,
            timeMs: data.timeMs
        });
        this.lastSortTimeMs = data.timeMs;
    }
    getLastSortTimeMs() {
        return this.lastSortTimeMs;
    }
    dispose() {
        if (this.worker) {
            this.worker.terminate();
            sorterMemoryTotals.workersTerminated++;
        }
        this.worker = null;
        this.orderBufferPool = [];
    }
}
export { SplatSorter, getSplatSorterMemoryDiagnostics };
