import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_types_gsplat_js_2ba04999__ from "../../../shared/types/gsplat.js";
import * as __WEBPACK_EXTERNAL_MODULE__constants_js_e283b470__ from "./constants.js";
import * as __WEBPACK_EXTERNAL_MODULE__GSplatPlacement_js_f818991c__ from "./GSplatPlacement.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('gsplat:lod');
class NodeInfo {
    reset() {
        this.currentLod = -1;
        this.optimalLod = -1;
        this.importance = 0;
        this.worldDistance = 0;
        this.lods = null;
        this.budgetBucket = 0;
    }
    constructor(){
        this.currentLod = -1;
        this.optimalLod = -1;
        this.importance = 0;
        this.worldDistance = 0;
        this.inst = null;
        this.lods = null;
        this.budgetBucket = 0;
    }
}
const _invWorldMat = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4();
const _localCameraPos = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
const _localCameraFwd = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
const _dirToNode = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
const _worldCameraPos = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
const _worldCameraFwd = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
const _closestPoint = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
const _tempCompletedUrls = [];
const REF_TAN_HALF_FOV = Math.tan(__WEBPACK_EXTERNAL_MODULE_three__.MathUtils.degToRad(22.5));
class GSplatOctreeInstance {
    constructor(octree, placement, renderer){
        this.activePlacements = new Set();
        this.dirtyModifiedPlacements = false;
        this.pending = new Set();
        this.pendingDecrements = new Map();
        this.previousPosition = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        this.needsLodUpdate = false;
        this.prefetchPending = new Set();
        this.pendingVisibleAdds = new Map();
        this.splatBudget = 0;
        this.rangeMin = 0;
        this.rangeMax = 0;
        this.loadedThisFrame = 0;
        this._nodeIndices = null;
        this.lodMinDistThresholds = null;
        this.environmentPlacement = null;
        this._visible = true;
        this.renderer = null;
        this.forceRefresh = false;
        this._warnedBudget = false;
        this.firstActivePlacementLogged = false;
        this.ownsEnvironmentRef = false;
        this._destroyed = false;
        this.onContextLost = (event)=>{
            if (this._destroyed) return;
            event.preventDefault();
            log.warn('GSplatOctreeInstance: WebGL context lost');
            for(let i = 0; i < this.filePlacements.length; i++)if (this.filePlacements[i]) this.octree.decRefCount(i, 0);
            this.cancelAllFileLoads();
            this.filePlacements.fill(null);
            this.activePlacements.clear();
            this.pendingDecrements.clear();
            this.pendingVisibleAdds.clear();
            for (const nodeInfo of this.nodeInfos)nodeInfo.reset();
            if (this.environmentPlacement) {
                this.activePlacements.delete(this.environmentPlacement);
                this.environmentPlacement = null;
            }
            if (this.ownsEnvironmentRef && this.octree.environmentUrl) this.octree.unloadEnvironmentResource();
            this.dirtyModifiedPlacements = true;
            this.needsLodUpdate = true;
        };
        this.onContextRestored = ()=>{
            if (this._destroyed) return;
            this.forceRefresh = true;
            this.needsLodUpdate = true;
        };
        this.octree = octree;
        this.placement = placement;
        this.renderer = renderer || null;
        this.nodeInfos = new Array(octree.nodes.length);
        for(let i = 0; i < octree.nodes.length; i++){
            const nodeInfo = new NodeInfo();
            nodeInfo.inst = this;
            this.nodeInfos[i] = nodeInfo;
        }
        const numFiles = octree.files.length;
        this.filePlacements = new Array(numFiles).fill(null);
        if (octree.environmentUrl) {
            octree.incEnvironmentRefCount();
            this.ownsEnvironmentRef = true;
            try {
                octree.ensureEnvironmentResource();
            } catch (error) {
                this.releaseEnvironmentRef();
                throw error;
            }
        }
        if (this.renderer) this.setupContextLossHandling(this.renderer);
        this.needsLodUpdate = true;
    }
    setupContextLossHandling(renderer) {
        const canvas = renderer.domElement;
        canvas.addEventListener('webglcontextlost', this.onContextLost);
        canvas.addEventListener('webglcontextrestored', this.onContextRestored);
    }
    cleanupContextLossHandling() {
        if (this.renderer) {
            const canvas = this.renderer.domElement;
            canvas.removeEventListener('webglcontextlost', this.onContextLost);
            canvas.removeEventListener('webglcontextrestored', this.onContextRestored);
        }
    }
    destroy(cooldownTicks) {
        if (this._destroyed) return;
        this._destroyed = true;
        try {
            this.cleanupContextLossHandling();
            if (this.octree && !this.octree.destroyed) {
                const filesToDecRef = this.getFileDecrements();
                for (const fileIndex of filesToDecRef)if (void 0 === cooldownTicks) this.octree.decRefCount(fileIndex);
                else this.octree.decRefCount(fileIndex, cooldownTicks);
            }
        } finally{
            try {
                this.cancelAllFileLoads();
            } finally{
                try {
                    this.releaseEnvironmentRef();
                } finally{
                    this.clearDestroyedState();
                }
            }
        }
    }
    addFileLoadInterest(files, fileIndex) {
        if (files.has(fileIndex)) return;
        files.add(fileIndex);
        this.octree.incLoadInterest(fileIndex);
    }
    completeFileLoadInterest(files, fileIndex) {
        if (!files.delete(fileIndex)) return;
        this.octree.decLoadInterest(fileIndex);
    }
    cancelFileLoadInterest(files, fileIndex) {
        if (!files.delete(fileIndex)) return;
        this.octree.decLoadInterest(fileIndex);
        this.octree.cancelResourceLoadIfUnused(fileIndex);
    }
    cancelAllFileLoads() {
        for (const fileIndex of this.pending)this.cancelFileLoadInterest(this.pending, fileIndex);
        for (const fileIndex of this.prefetchPending)this.cancelFileLoadInterest(this.prefetchPending, fileIndex);
    }
    releaseEnvironmentRef() {
        if (!this.ownsEnvironmentRef) return;
        this.ownsEnvironmentRef = false;
        this.octree.decEnvironmentRefCount();
    }
    clearDestroyedState() {
        this.activePlacements.clear();
        this.pendingDecrements.clear();
        this.pendingVisibleAdds.clear();
        this.filePlacements.length = 0;
        for (const nodeInfo of this.nodeInfos){
            nodeInfo.reset();
            nodeInfo.inst = null;
        }
        this.nodeInfos.length = 0;
        this._nodeIndices = null;
        this.lodMinDistThresholds = null;
        this.environmentPlacement = null;
        this.forceRefresh = false;
        this.needsLodUpdate = false;
        this.dirtyModifiedPlacements = false;
        this.loadedThisFrame = 0;
        this.renderer = null;
    }
    getFileDecrements() {
        const toRelease = [];
        for(let i = 0; i < this.filePlacements.length; i++)if (this.filePlacements[i]) toRelease.push(i);
        return toRelease;
    }
    updateLod(cameraNode, params) {
        if (0 === this.octree.nodes.length) return;
        const maxLod = this.octree.lodLevels - 1;
        const lodBaseDistance = this.placement.lodBaseDistance;
        const lodMultiplier = this.placement.lodMultiplier;
        const { lodRangeMin, lodRangeMax } = params;
        const rangeMin = Math.max(0, Math.min(lodRangeMin ?? 0, maxLod));
        const rangeMax = Math.max(rangeMin, Math.min(lodRangeMax ?? maxLod, maxLod));
        const totalOptimalSplats = this.evaluateNodeLods(cameraNode, maxLod, lodBaseDistance, lodMultiplier, rangeMin, rangeMax, params);
        if (this.splatBudget > 0) this.enforceSplatBudget(totalOptimalSplats, this.splatBudget, rangeMin, rangeMax);
        this.applyLodChanges(maxLod, params);
    }
    evaluateNodeLods(cameraNode, maxLod, lodBaseDistance, lodMultiplier, rangeMin, rangeMax, params, accumulateSplats = true, globalMaxDistanceForBuckets = 0) {
        const { lodBehindPenalty } = params;
        const safeBaseDistance = Math.max(0.0001, lodBaseDistance);
        const safeMultiplier = Math.max(1.0001, lodMultiplier);
        const fovScale = this.getFovScale(cameraNode);
        cameraNode.getWorldPosition(_worldCameraPos);
        cameraNode.getWorldDirection(_worldCameraFwd);
        this.placement.node.updateMatrixWorld(true);
        _invWorldMat.copy(this.placement.node.matrixWorld).invert();
        _localCameraPos.copy(_worldCameraPos).applyMatrix4(_invWorldMat);
        _localCameraFwd.copy(_worldCameraFwd).transformDirection(_invWorldMat).normalize();
        const nodes = this.octree.nodes;
        const nodeInfos = this.nodeInfos;
        let totalSplats = 0;
        const uniformScale = this.getUniformScale();
        const minDistThresholds = maxLod >= 1 ? this.ensureLodMinDistThresholds(maxLod, safeBaseDistance, safeMultiplier) : null;
        const maxDistance = rangeMax >= 1 ? safeBaseDistance * safeMultiplier ** Math.max(0, rangeMax - 1) : safeBaseDistance;
        for(let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex++){
            const node = nodes[nodeIndex];
            node.bounds.clampPoint(_localCameraPos, _closestPoint);
            _dirToNode.subVectors(_closestPoint, _localCameraPos);
            const actualDistance = _dirToNode.length();
            let penalizedDistance = actualDistance;
            let importanceMultiplier = 1.0;
            if (lodBehindPenalty > 1 && actualDistance > 0.01) {
                const dotOverDistance = _localCameraFwd.dot(_dirToNode) / actualDistance;
                if (dotOverDistance < 0) {
                    const t = -dotOverDistance;
                    const factor = 1 + t * (lodBehindPenalty - 1);
                    penalizedDistance = actualDistance * factor;
                    importanceMultiplier = 1.0 / factor;
                }
            }
            const fovAdjustedDistance = penalizedDistance * fovScale;
            let optimalLodIndex;
            if (0 === maxLod || fovAdjustedDistance < safeBaseDistance) optimalLodIndex = 0;
            else {
                optimalLodIndex = maxLod;
                while(minDistThresholds && optimalLodIndex > 1 && fovAdjustedDistance < minDistThresholds[optimalLodIndex])optimalLodIndex--;
            }
            if (optimalLodIndex < rangeMin) optimalLodIndex = rangeMin;
            if (optimalLodIndex > rangeMax) optimalLodIndex = rangeMax;
            const normalizedDistance = Math.min(fovAdjustedDistance / maxDistance, 1.0);
            const importance = (1.0 - normalizedDistance) * importanceMultiplier;
            const nodeInfo = nodeInfos[nodeIndex];
            nodeInfo.optimalLod = optimalLodIndex;
            nodeInfo.importance = importance;
            nodeInfo.worldDistance = fovAdjustedDistance * uniformScale;
            if (globalMaxDistanceForBuckets > 0 && optimalLodIndex >= 0) {
                const bucketScale = __WEBPACK_EXTERNAL_MODULE__constants_js_e283b470__.NUM_BUCKETS / Math.sqrt(globalMaxDistanceForBuckets);
                const bucket = Math.floor(Math.sqrt(nodeInfo.worldDistance) * bucketScale);
                nodeInfo.budgetBucket = Math.min(Math.max(bucket, 0), __WEBPACK_EXTERNAL_MODULE__constants_js_e283b470__.NUM_BUCKETS - 1);
            }
            if (accumulateSplats) {
                const lod = nodes[nodeIndex].lods[optimalLodIndex];
                if (lod?.count) totalSplats += lod.count;
            }
        }
        return totalSplats;
    }
    evaluateOptimalLods(cameraNode, params, budgetScale = 1, globalMaxDistanceForBuckets = 0) {
        const maxLod = this.octree.lodLevels - 1;
        const { lodRangeMin, lodRangeMax } = params;
        const rangeMin = Math.max(0, Math.min(lodRangeMin ?? 0, maxLod));
        const rangeMax = Math.max(rangeMin, Math.min(lodRangeMax ?? maxLod, maxLod));
        this.rangeMin = rangeMin;
        this.rangeMax = rangeMax;
        const effectiveBase = this.placement.lodBaseDistance * budgetScale;
        const effectiveMult = Math.max(1.2, this.placement.lodMultiplier * budgetScale ** -0.2);
        return this.evaluateNodeLods(cameraNode, maxLod, effectiveBase, effectiveMult, rangeMin, rangeMax, params, true, globalMaxDistanceForBuckets);
    }
    ensureLodMinDistThresholds(maxLod, baseDistance, multiplier) {
        const requiredLength = maxLod + 1;
        if (!this.lodMinDistThresholds || this.lodMinDistThresholds.length < requiredLength) this.lodMinDistThresholds = new Float32Array(requiredLength);
        let threshold = baseDistance;
        this.lodMinDistThresholds[1] = threshold;
        for(let index = 2; index <= maxLod; index++){
            threshold *= multiplier;
            this.lodMinDistThresholds[index] = threshold;
        }
        return this.lodMinDistThresholds;
    }
    getFovScale(cameraNode) {
        const camera = cameraNode;
        if (!camera.isPerspectiveCamera) return 1;
        const tanHalfVFov = Math.tan(__WEBPACK_EXTERNAL_MODULE_three__.MathUtils.degToRad(0.5 * camera.fov));
        const tanHalfHFov = tanHalfVFov * camera.aspect;
        return Math.min(tanHalfVFov, tanHalfHFov) / REF_TAN_HALF_FOV;
    }
    getUniformScale() {
        this.placement.node.updateMatrixWorld(true);
        _worldCameraPos.setFromMatrixScale(this.placement.node.matrixWorld);
        return Math.max(_worldCameraPos.x, _worldCameraPos.y, _worldCameraPos.z, 0.0001);
    }
    enforceSplatBudget(totalSplats, splatBudget, rangeMin, rangeMax) {
        const nodes = this.octree.nodes;
        const nodeInfos = this.nodeInfos;
        if (!this._nodeIndices) {
            this._nodeIndices = new Uint32Array(nodes.length);
            for(let i = 0; i < nodes.length; i++)this._nodeIndices[i] = i;
        }
        const nodeIndices = this._nodeIndices;
        nodeIndices.sort((a, b)=>nodeInfos[a].importance - nodeInfos[b].importance);
        let currentSplats = totalSplats;
        if (currentSplats === splatBudget) return;
        const isOverBudget = currentSplats > splatBudget;
        const lodDelta = isOverBudget ? 1 : -1;
        while(isOverBudget ? currentSplats > splatBudget : currentSplats < splatBudget){
            let modified = false;
            if (isOverBudget) for(let i = 0; i < nodeIndices.length; i++){
                const nodeIndex = nodeIndices[i];
                const nodeInfo = nodeInfos[nodeIndex];
                const node = nodes[nodeIndex];
                const currentOptimalLod = nodeInfo.optimalLod;
                if (currentOptimalLod < rangeMax) {
                    const currentLod = node.lods[currentOptimalLod];
                    const nextLod = node.lods[currentOptimalLod + 1];
                    const splatsSaved = currentLod.count - nextLod.count;
                    nodeInfo.optimalLod += lodDelta;
                    currentSplats -= splatsSaved;
                    modified = true;
                    if (currentSplats <= splatBudget) break;
                }
            }
            else for(let i = nodeIndices.length - 1; i >= 0; i--){
                const nodeIndex = nodeIndices[i];
                const nodeInfo = nodeInfos[nodeIndex];
                const node = nodes[nodeIndex];
                const currentOptimalLod = nodeInfo.optimalLod;
                if (currentOptimalLod > rangeMin) {
                    const currentLod = node.lods[currentOptimalLod];
                    const nextLod = node.lods[currentOptimalLod - 1];
                    const splatsAdded = nextLod.count - currentLod.count;
                    if (currentSplats + splatsAdded <= splatBudget) {
                        nodeInfo.optimalLod += lodDelta;
                        currentSplats += splatsAdded;
                        modified = true;
                        if (currentSplats >= splatBudget) break;
                    }
                }
            }
            if (!modified) break;
        }
    }
    applyLodChanges(maxLod, params) {
        const nodes = this.octree.nodes;
        const { lodUnderfillLimit = 0, maxLoadsPerFrame = 0 } = params;
        this.loadedThisFrame = 0;
        if (this.pendingVisibleAdds.size > 0) {
            const toPromote = [];
            for (const [nodeIndex, fileIndex] of this.pendingVisibleAdds){
                const placement = this.filePlacements[fileIndex];
                if (placement?.resource) toPromote.push(nodeIndex);
            }
            for (const nodeIndex of toPromote){
                const fileIndex = this.pendingVisibleAdds.get(nodeIndex);
                const node = nodes[nodeIndex];
                let lodIndex = 0;
                for(let li = 0; li < node.lods.length; li++)if (node.lods[li].fileIndex === fileIndex) {
                    lodIndex = li;
                    break;
                }
                this.nodeInfos[nodeIndex].currentLod = lodIndex;
                this.pendingVisibleAdds.delete(nodeIndex);
            }
        }
        for(let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex++){
            const node = nodes[nodeIndex];
            const nodeInfo = this.nodeInfos[nodeIndex];
            const optimalLodIndex = nodeInfo.optimalLod;
            const currentLodIndex = nodeInfo.currentLod;
            const desiredLodIndex = this.selectDesiredLodIndex(node, optimalLodIndex, maxLod, lodUnderfillLimit);
            if (desiredLodIndex !== currentLodIndex) {
                const currentFileIndex = currentLodIndex >= 0 ? node.lods[currentLodIndex].fileIndex : -1;
                const desiredFileIndex = desiredLodIndex >= 0 ? node.lods[desiredLodIndex].fileIndex : -1;
                const wasVisible = -1 !== currentFileIndex;
                const willBeVisible = -1 !== desiredFileIndex;
                const pendingEntry = this.pendingDecrements.get(nodeIndex);
                if (pendingEntry) {
                    if (pendingEntry.newFileIndex !== desiredFileIndex) {
                        const prevPendingPlacement = this.filePlacements[pendingEntry.newFileIndex];
                        if (prevPendingPlacement) this.decrementFileRef(pendingEntry.newFileIndex, nodeIndex);
                        if (wasVisible && willBeVisible) this.pendingDecrements.set(nodeIndex, {
                            oldFileIndex: pendingEntry.oldFileIndex,
                            newFileIndex: desiredFileIndex
                        });
                        else this.pendingDecrements.delete(nodeIndex);
                    }
                }
                if (!wasVisible && willBeVisible) {
                    const prevPendingFi = this.pendingVisibleAdds.get(nodeIndex);
                    if (void 0 !== prevPendingFi && prevPendingFi !== desiredFileIndex) {
                        this.decrementFileRef(prevPendingFi, nodeIndex);
                        this.pendingVisibleAdds.delete(nodeIndex);
                    }
                    const willTriggerLoad = !this.filePlacements[desiredFileIndex];
                    const canLoad = 0 === maxLoadsPerFrame || this.loadedThisFrame < maxLoadsPerFrame;
                    if (!willTriggerLoad || canLoad) {
                        if (willTriggerLoad) this.loadedThisFrame++;
                        this.incrementFileRef(desiredFileIndex, nodeIndex, desiredLodIndex);
                        const newPlacement = this.filePlacements[desiredFileIndex];
                        if (newPlacement?.resource) {
                            nodeInfo.currentLod = desiredLodIndex;
                            this.pendingVisibleAdds.delete(nodeIndex);
                        } else this.pendingVisibleAdds.set(nodeIndex, desiredFileIndex);
                    }
                } else if (wasVisible && !willBeVisible) {
                    const pendingEntry2 = this.pendingDecrements.get(nodeIndex);
                    if (pendingEntry2) {
                        this.decrementFileRef(pendingEntry2.newFileIndex, nodeIndex);
                        this.pendingDecrements.delete(nodeIndex);
                    }
                    this.decrementFileRef(currentFileIndex, nodeIndex);
                    nodeInfo.currentLod = -1;
                    this.pendingVisibleAdds.delete(nodeIndex);
                } else if (wasVisible && willBeVisible) {
                    const willTriggerLoad = !this.filePlacements[desiredFileIndex];
                    const canLoad = 0 === maxLoadsPerFrame || this.loadedThisFrame < maxLoadsPerFrame;
                    if (!willTriggerLoad || canLoad) {
                        if (willTriggerLoad) this.loadedThisFrame++;
                        this.incrementFileRef(desiredFileIndex, nodeIndex, desiredLodIndex);
                        const newPlacement = this.filePlacements[desiredFileIndex];
                        if (newPlacement?.resource) {
                            this.decrementFileRef(currentFileIndex, nodeIndex);
                            this.pendingDecrements.delete(nodeIndex);
                            nodeInfo.currentLod = desiredLodIndex;
                            this.pendingVisibleAdds.delete(nodeIndex);
                        } else {
                            this.pendingDecrements.set(nodeIndex, {
                                oldFileIndex: currentFileIndex,
                                newFileIndex: desiredFileIndex
                            });
                            this.pendingVisibleAdds.delete(nodeIndex);
                        }
                    }
                }
            }
            if (desiredLodIndex > optimalLodIndex && this.isDesiredLodReadyAndVisible(node, nodeIndex, desiredLodIndex)) this.prefetchNextLod(node, desiredLodIndex, optimalLodIndex);
        }
    }
    isDesiredLodReadyAndVisible(node, nodeIndex, desiredLodIndex) {
        if (desiredLodIndex < 0 || this.nodeInfos[nodeIndex].currentLod !== desiredLodIndex) return false;
        const fileIndex = node.lods[desiredLodIndex]?.fileIndex ?? -1;
        if (-1 === fileIndex) return false;
        const placement = this.filePlacements[fileIndex];
        if (!placement?.resource) return false;
        return placement.intervals.has(nodeIndex) && this.activePlacements.has(placement);
    }
    selectDesiredLodIndex(node, optimalLodIndex, maxLod, lodUnderfillLimit) {
        if (lodUnderfillLimit > 0) {
            const allowedMaxCoarseLod = Math.min(maxLod, optimalLodIndex + lodUnderfillLimit);
            for(let lod = optimalLodIndex; lod <= allowedMaxCoarseLod; lod++){
                const fi = node.lods[lod].fileIndex;
                if (-1 !== fi && this.octree.getFileResource(fi)) return lod;
            }
            for(let lod = allowedMaxCoarseLod; lod >= optimalLodIndex; lod--){
                const fi = node.lods[lod].fileIndex;
                if (-1 !== fi) return lod;
            }
        }
        return optimalLodIndex;
    }
    prefetchNextLod(node, desiredLodIndex, optimalLodIndex) {
        if (-1 === desiredLodIndex || -1 === optimalLodIndex) return;
        if (desiredLodIndex === optimalLodIndex) {
            const fi = node.lods[optimalLodIndex].fileIndex;
            if (-1 !== fi) {
                this.octree.ensureFileResource(fi);
                if (!this.octree.getFileResource(fi)) this.addFileLoadInterest(this.prefetchPending, fi);
            }
            return;
        }
        const targetLod = Math.max(optimalLodIndex, desiredLodIndex - 1);
        for(let lod = targetLod; lod >= optimalLodIndex; lod--){
            const fi = node.lods[lod].fileIndex;
            if (-1 !== fi) {
                this.octree.ensureFileResource(fi);
                if (!this.octree.getFileResource(fi)) this.addFileLoadInterest(this.prefetchPending, fi);
                break;
            }
        }
    }
    incrementFileRef(fileIndex, nodeIndex, lodIndex) {
        if (-1 === fileIndex) return;
        let placement = this.filePlacements[fileIndex];
        if (!placement) {
            placement = new __WEBPACK_EXTERNAL_MODULE__GSplatPlacement_js_f818991c__.GSplatPlacement(null, this.placement.node, lodIndex);
            placement.workBufferModifier = this.placement.workBufferModifier;
            placement.workBufferUpdateMode = this.placement.workBufferUpdateMode;
            this.filePlacements[fileIndex] = placement;
            this.octree.incRefCount(fileIndex);
            const resourceExists = this.addFilePlacement(fileIndex);
            if (!resourceExists) {
                this.octree.ensureFileResource(fileIndex);
                this.addFileLoadInterest(this.pending, fileIndex);
            }
        }
        const nodes = this.octree.nodes;
        const node = nodes[nodeIndex];
        const lod = node.lods[lodIndex];
        const interval = {
            start: lod.offset,
            end: lod.offset + lod.count - 1
        };
        placement.intervals.set(nodeIndex, interval);
        this.dirtyModifiedPlacements = true;
    }
    decrementFileRef(fileIndex, nodeIndex, cooldownTicks) {
        if (-1 === fileIndex) return;
        const placement = this.filePlacements[fileIndex];
        if (!placement) return;
        placement.intervals.delete(nodeIndex);
        this.dirtyModifiedPlacements = true;
        if (0 === placement.intervals.size) {
            if (placement.resource) this.activePlacements.delete(placement);
            this.filePlacements[fileIndex] = null;
            if (void 0 === cooldownTicks) this.octree.decRefCount(fileIndex);
            else this.octree.decRefCount(fileIndex, cooldownTicks);
            this.cancelFileLoadInterest(this.pending, fileIndex);
        }
    }
    addFilePlacement(fileIndex) {
        const res = this.octree.getFileResource(fileIndex);
        if (res) {
            const placement = this.filePlacements[fileIndex];
            if (placement) {
                placement.resource = res;
                const resource = res;
                if (resource.aabb) placement.aabb.copy(resource.aabb);
                else placement.aabb.copy(new __WEBPACK_EXTERNAL_MODULE_three__.Box3());
                this.activePlacements.add(placement);
                this.dirtyModifiedPlacements = true;
                if (!this.firstActivePlacementLogged) {
                    this.firstActivePlacementLogged = true;
                    log.debug(`[GSplatOctreeInstance] first active placement, fileIndex=${fileIndex}, activePlacements=${this.activePlacements.size}, pending=${this.pending.size}`);
                }
                return true;
            }
        }
        return false;
    }
    testMoved(threshold) {
        this.placement.node.getWorldPosition(_worldCameraPos);
        const length = _worldCameraPos.distanceTo(this.previousPosition);
        return length > threshold;
    }
    updateMoved() {
        this.placement.node.getWorldPosition(this.previousPosition);
    }
    update() {
        if (!this._visible) {
            const wasDirty = this.dirtyModifiedPlacements;
            this.dirtyModifiedPlacements = false;
            return wasDirty;
        }
        const currentBudget = this.placement.splatBudget;
        if (currentBudget !== this.splatBudget) {
            this.splatBudget = currentBudget;
            this.needsLodUpdate = true;
        }
        if (0 === this.splatBudget && !this._warnedBudget) {
            log.warn('[GSplatOctreeInstance] splatBudget is 0');
            this._warnedBudget = true;
        }
        if (this.forceRefresh) {
            this.forceRefresh = false;
            for(let fileIndex = 0; fileIndex < this.filePlacements.length; fileIndex++){
                const placement = this.filePlacements[fileIndex];
                if (placement) {
                    this.octree.ensureFileResource(fileIndex);
                    if (!this.octree.getFileResource(fileIndex)) this.addFileLoadInterest(this.pending, fileIndex);
                }
            }
        }
        if (this.pending.size) {
            for (const fileIndex of this.pending){
                this.octree.ensureFileResource(fileIndex);
                if (this.addFilePlacement(fileIndex)) {
                    _tempCompletedUrls.push(fileIndex);
                    for (const [nodeIndex, { oldFileIndex, newFileIndex }] of this.pendingDecrements)if (newFileIndex === fileIndex) {
                        let newLodIndex = 0;
                        const nodeLods = this.octree.nodes[nodeIndex].lods;
                        for(let li = 0; li < nodeLods.length; li++)if (nodeLods[li].fileIndex === newFileIndex) {
                            newLodIndex = li;
                            break;
                        }
                        this.decrementFileRef(oldFileIndex, nodeIndex);
                        this.pendingDecrements.delete(nodeIndex);
                        this.nodeInfos[nodeIndex].currentLod = newLodIndex;
                    }
                }
            }
            if (_tempCompletedUrls.length > 0) this.needsLodUpdate = true;
            for (const fileIndex of _tempCompletedUrls)this.completeFileLoadInterest(this.pending, fileIndex);
            _tempCompletedUrls.length = 0;
        }
        this.pollPrefetchCompletions();
        if (this.octree.environmentUrl && !this.environmentPlacement) {
            this.octree.ensureEnvironmentResource();
            const envResource = this.octree.environmentResource;
            if (envResource) {
                this.environmentPlacement = new __WEBPACK_EXTERNAL_MODULE__GSplatPlacement_js_f818991c__.GSplatPlacement(envResource, this.placement.node, 0);
                this.environmentPlacement.workBufferModifier = this.placement.workBufferModifier;
                this.environmentPlacement.workBufferUpdateMode = this.placement.workBufferUpdateMode;
                const resource = envResource;
                if (resource.aabb) this.environmentPlacement.aabb.copy(resource.aabb);
                else this.environmentPlacement.aabb.copy(new __WEBPACK_EXTERNAL_MODULE_three__.Box3());
                this.activePlacements.add(this.environmentPlacement);
                this.dirtyModifiedPlacements = true;
            }
        }
        if (this.environmentPlacement?.resource && !this.activePlacements.has(this.environmentPlacement)) {
            this.activePlacements.add(this.environmentPlacement);
            this.dirtyModifiedPlacements = true;
        }
        const dirty = this.dirtyModifiedPlacements;
        this.dirtyModifiedPlacements = false;
        return dirty;
    }
    consumeNeedsLodUpdate() {
        const v = this.needsLodUpdate;
        this.needsLodUpdate = false;
        return v;
    }
    get lodPresentationPending() {
        if (!this._visible) return false;
        if (this.forceRefresh || this.needsLodUpdate || this.dirtyModifiedPlacements) return true;
        for (const fileIndex of this.pending)if (!this.octree.isFileFailed(fileIndex)) return true;
        for (const fileIndex of this.prefetchPending)if (!this.octree.isFileFailed(fileIndex)) return true;
        for (const { newFileIndex } of this.pendingDecrements.values())if (!this.octree.isFileFailed(newFileIndex)) return true;
        for (const fileIndex of this.pendingVisibleAdds.values())if (!this.octree.isFileFailed(fileIndex)) return true;
        return false;
    }
    get lodPresentationWorkPending() {
        if (!this._visible) return false;
        if (this.forceRefresh || this.needsLodUpdate || this.dirtyModifiedPlacements) return true;
        for (const fileIndex of this.pending)if (!this.octree.isFileFailed(fileIndex) && this.octree.getFileResource(fileIndex)) return true;
        for (const fileIndex of this.prefetchPending)if (!this.octree.isFileFailed(fileIndex) && this.octree.getFileResource(fileIndex)) return true;
        for (const { newFileIndex } of this.pendingDecrements.values())if (!this.octree.isFileFailed(newFileIndex) && this.octree.getFileResource(newFileIndex)) return true;
        for (const fileIndex of this.pendingVisibleAdds.values())if (!this.octree.isFileFailed(fileIndex) && this.octree.getFileResource(fileIndex)) return true;
        return false;
    }
    setWorkBufferModifier(modifier) {
        this.placement.workBufferModifier = modifier;
        for (const placement of this.filePlacements)if (placement) placement.workBufferModifier = modifier;
        if (this.environmentPlacement) this.environmentPlacement.workBufferModifier = modifier;
    }
    setWorkBufferUpdateMode(mode) {
        this.placement.workBufferUpdateMode = mode;
        for (const placement of this.filePlacements)if (placement) placement.workBufferUpdateMode = mode;
        if (this.environmentPlacement) this.environmentPlacement.workBufferUpdateMode = mode;
    }
    consumeWorkBufferUpdateOnce(renderedPlacements) {
        if ((!renderedPlacements || renderedPlacements.has(this.placement)) && this.placement.workBufferUpdateMode === __WEBPACK_EXTERNAL_MODULE__shared_types_gsplat_js_2ba04999__.GSPLAT_WORKBUFFER_UPDATE_ONCE) this.placement.workBufferUpdateMode = __WEBPACK_EXTERNAL_MODULE__shared_types_gsplat_js_2ba04999__.GSPLAT_WORKBUFFER_UPDATE_AUTO;
        for (const placement of this.filePlacements)if (placement && (!renderedPlacements || renderedPlacements.has(placement)) && placement.workBufferUpdateMode === __WEBPACK_EXTERNAL_MODULE__shared_types_gsplat_js_2ba04999__.GSPLAT_WORKBUFFER_UPDATE_ONCE) placement.workBufferUpdateMode = __WEBPACK_EXTERNAL_MODULE__shared_types_gsplat_js_2ba04999__.GSPLAT_WORKBUFFER_UPDATE_AUTO;
        if (this.environmentPlacement && (!renderedPlacements || renderedPlacements.has(this.environmentPlacement)) && this.environmentPlacement.workBufferUpdateMode === __WEBPACK_EXTERNAL_MODULE__shared_types_gsplat_js_2ba04999__.GSPLAT_WORKBUFFER_UPDATE_ONCE) this.environmentPlacement.workBufferUpdateMode = __WEBPACK_EXTERNAL_MODULE__shared_types_gsplat_js_2ba04999__.GSPLAT_WORKBUFFER_UPDATE_AUTO;
    }
    pollPrefetchCompletions() {
        if (this.prefetchPending.size) {
            for (const fileIndex of this.prefetchPending){
                this.octree.ensureFileResource(fileIndex);
                if (this.octree.getFileResource(fileIndex)) _tempCompletedUrls.push(fileIndex);
            }
            if (_tempCompletedUrls.length > 0) this.needsLodUpdate = true;
            for (const fileIndex of _tempCompletedUrls)this.completeFileLoadInterest(this.prefetchPending, fileIndex);
            _tempCompletedUrls.length = 0;
        }
    }
    get pendingLoadCount() {
        let count = this.activePendingLoadCount;
        for (const fileIndex of this.prefetchPending)if (!this.octree.isFileFailed(fileIndex)) count++;
        if (this.octree.environmentUrl && !this.environmentPlacement && !this.octree.isEnvironmentFailed()) count++;
        return count;
    }
    get activePendingLoadCount() {
        let count = 0;
        for (const fileIndex of this.pending)if (!this.octree.isFileFailed(fileIndex)) count++;
        return count;
    }
    collectDebugState() {
        const parts = [];
        let visibleNodes = 0;
        let pendingLodChange = 0;
        const totalNodes = this.nodeInfos.length;
        for (const info of this.nodeInfos){
            if (info.currentLod >= 0) visibleNodes++;
            if (info.optimalLod >= 0 && info.currentLod !== info.optimalLod) pendingLodChange++;
        }
        parts.push(`nodes=${visibleNodes}/${totalNodes}`);
        parts.push(`pendingLodChange=${pendingLodChange}`);
        parts.push(`active=${this.activePlacements.size}`);
        parts.push(`pending=${this.pending.size}`);
        parts.push(`prefetch=${this.prefetchPending.size}`);
        parts.push(`pendingDecrements=${this.pendingDecrements.size}`);
        parts.push(`pendingVisibleAdds=${this.pendingVisibleAdds.size}`);
        parts.push(`needsLodUpdate=${this.needsLodUpdate}`);
        parts.push(`dirty=${this.dirtyModifiedPlacements}`);
        return parts.join(', ');
    }
    get visible() {
        return this._visible;
    }
    set visible(value) {
        if (this._visible === value) return;
        this._visible = value;
        if (value) {
            for(let i = 0; i < this.filePlacements.length; i++){
                const placement = this.filePlacements[i];
                if (placement?.resource) this.activePlacements.add(placement);
            }
            if (this.environmentPlacement?.resource) this.activePlacements.add(this.environmentPlacement);
            this.dirtyModifiedPlacements = true;
            this.needsLodUpdate = true;
        } else {
            this.activePlacements.clear();
            this.dirtyModifiedPlacements = true;
        }
    }
    collectNodeLodDetails(maxNodes = 10) {
        const result = [];
        const sortedIndices = this.nodeInfos.map((info, index)=>({
                info,
                index
            })).sort((a, b)=>b.info.importance - a.info.importance).slice(0, maxNodes);
        for (const { info, index } of sortedIndices)result.push({
            nodeIndex: index,
            currentLod: info.currentLod,
            optimalLod: info.optimalLod,
            importance: info.importance
        });
        return result;
    }
}
export { GSplatOctreeInstance };
