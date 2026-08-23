import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('gsplat:lod');
function isSplatData(data) {
    return 'object' == typeof data && null !== data && 'getProp' in data && 'function' == typeof data.getProp;
}
function isSogsData(data) {
    return 'object' == typeof data && null !== data && 'getSplatCenter' in data && 'function' == typeof data.getSplatCenter;
}
var GSplatInfo_rslib_entry_SplatState = /*#__PURE__*/ function(SplatState) {
    SplatState[SplatState["NONE"] = 0] = "NONE";
    SplatState[SplatState["SELECTED"] = 1] = "SELECTED";
    SplatState[SplatState["LOCKED"] = 2] = "LOCKED";
    SplatState[SplatState["DELETED"] = 4] = "DELETED";
    return SplatState;
}({});
const tempIntervals = [];
class GSplatInfo {
    constructor(resource, placement, geometry){
        this.activeSplats = 0;
        this.intervals = [];
        this.lineStart = 0;
        this.lineCount = 0;
        this.padding = 0;
        this.viewport = new __WEBPACK_EXTERNAL_MODULE_three__.Vector4();
        this.lastMatrix = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4();
        this.aabb = new __WEBPACK_EXTERNAL_MODULE_three__.Box3();
        this.worldAabb = new __WEBPACK_EXTERNAL_MODULE_three__.Box3();
        this.colorAccumulatedRotation = 0;
        this.colorAccumulatedTranslation = 0;
        this.intervalTexture = null;
        this._stateData = null;
        this._stateTexture = null;
        this._stateDirty = false;
        if (!resource) throw new Error('GSplatInfo: resource is required');
        if (!placement) throw new Error('GSplatInfo: placement is required');
        this.resource = resource;
        this.placement = placement;
        this.node = placement.node;
        this.lodIndex = placement.lodIndex;
        this.numSplats = resource.numSplats || 0;
        this.aabb.copy(placement.aabb);
        if (void 0 !== geometry) this.geometry = geometry;
        this.updateIntervals(placement.intervals);
        this.node.updateMatrixWorld(true);
        this.lastMatrix.copy(this.node.matrixWorld);
        this.updateWorldAabb();
    }
    destroy() {
        this.intervals.length = 0;
        if (this.intervalTexture) {
            this.intervalTexture.dispose();
            this.intervalTexture = null;
        }
        if (this._stateTexture) {
            this._stateTexture.dispose();
            this._stateTexture = null;
        }
        this._stateData = null;
        this._stateDirty = false;
    }
    setLines(start, count, textureSize, activeSplats) {
        this.lineStart = start;
        this.lineCount = count;
        this.padding = textureSize * count - activeSplats;
        if (this.padding < 0) log.warn(`GSplatInfo.setLines: padding is negative ${this.padding}`);
        this.viewport.set(0, start, textureSize, count);
        if (0 === textureSize || 0 === count) log.warn(`[GSplatInfo] viewport is zero texSize=${textureSize} count=${count} start=${start} active=${activeSplats}`);
    }
    updateIntervals(intervals) {
        this.intervals.length = 0;
        this.activeSplats = this.numSplats;
        if (intervals.size > 0) {
            let totalCount = 0;
            let used = 0;
            intervals.forEach((interval)=>{
                totalCount += interval.end - interval.start + 1;
                tempIntervals[used++] = interval;
            });
            if (totalCount !== this.numSplats) {
                tempIntervals.length = used;
                tempIntervals.sort((a, b)=>a.start - b.start);
                this.intervals.length = 2 * used;
                let k = 0;
                let currentStart = tempIntervals[0].start;
                let currentEnd = tempIntervals[0].end;
                for(let i = 1; i < used; i++){
                    const interval = tempIntervals[i];
                    if (interval.start === currentEnd + 1) currentEnd = interval.end;
                    else {
                        this.intervals[k++] = currentStart;
                        this.intervals[k++] = currentEnd + 1;
                        currentStart = interval.start;
                        currentEnd = interval.end;
                    }
                }
                this.intervals[k++] = currentStart;
                this.intervals[k++] = currentEnd + 1;
                this.intervals.length = k;
                this.activeSplats = totalCount;
                this.destroyIntervalTexture();
            } else this.destroyIntervalTexture();
            tempIntervals.length = 0;
        }
    }
    update() {
        this.node.updateMatrixWorld(true);
        const worldMatrix = this.node.matrixWorld;
        const changed = !this.lastMatrix.equals(worldMatrix);
        if (changed) {
            this.lastMatrix.copy(worldMatrix);
            this.updateWorldAabb();
        }
        return changed;
    }
    updateWorldAabb() {
        this.worldAabb.copy(this.aabb);
        this.worldAabb.applyMatrix4(this.node.matrixWorld);
    }
    getWorldAabb(result) {
        result.copy(this.worldAabb);
        return true;
    }
    resetColorAccumulators(colorUpdateAngle, colorUpdateDistance) {
        const randomFactor = Math.random();
        this.colorAccumulatedRotation = randomFactor * colorUpdateAngle;
        this.colorAccumulatedTranslation = randomFactor * colorUpdateDistance;
    }
    get hasSphericalHarmonics() {
        return (this.resource.shBands || 0) > 0;
    }
    get count() {
        return this.activeSplats - this.padding;
    }
    getActiveSplatIndex(originalIndex) {
        if (originalIndex < 0 || originalIndex >= this.numSplats) return -1;
        if (0 === this.intervals.length) return originalIndex < this.activeSplats ? originalIndex : -1;
        let activeIndex = 0;
        for(let i = 0; i < this.intervals.length; i += 2){
            const start = this.intervals[i];
            const end = this.intervals[i + 1];
            if (originalIndex < start) break;
            if (originalIndex < end) return activeIndex + (originalIndex - start);
            activeIndex += end - start;
        }
        return -1;
    }
    destroyIntervalTexture() {
        if (this.intervalTexture) {
            this.intervalTexture.dispose();
            this.intervalTexture = null;
        }
    }
    getSplatWorldCenter(index, target) {
        const result = target || new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        if (this.resource.centers && this.resource.centers.length > 3 * index + 2) {
            const centers = this.resource.centers;
            result.set(centers[3 * index], centers[3 * index + 1], centers[3 * index + 2]);
        } else if (this.resource.gsplatData) {
            const gsplatData = this.resource.gsplatData;
            if (isSogsData(gsplatData)) gsplatData.getSplatCenter(index, result);
            else if (isSplatData(gsplatData)) {
                const x = gsplatData.getProp('x');
                const y = gsplatData.getProp('y');
                const z = gsplatData.getProp('z');
                if (x && y && z) result.set(x[index], y[index], z[index]);
                else throw new Error('[GSplatInfo] SplatData 缺少位置属性（x, y, z）');
            } else throw new Error('[GSplatInfo] SOGS GPU 资源不支持直接访问 splat 属性（数据在 GPU），且 centers 缓存不可用');
        } else throw new Error('[GSplatInfo] 资源不支持获取 splat 中心位置');
        result.applyMatrix4(this.node.matrixWorld);
        return result;
    }
    getSplatWorldScale(index, target) {
        const result = target || new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        if (this.resource.gsplatData) {
            const gsplatData = this.resource.gsplatData;
            if (isSogsData(gsplatData)) gsplatData.getSplatScale(index, result);
            else if (isSplatData(gsplatData)) {
                const sx = gsplatData.getProp('scale_0');
                const sy = gsplatData.getProp('scale_1');
                const sz = gsplatData.getProp('scale_2');
                if (sx && sy && sz) result.set(Math.exp(sx[index]), Math.exp(sy[index]), Math.exp(sz[index]));
                else throw new Error('[GSplatInfo] SplatData 缺少缩放属性（scale_0, scale_1, scale_2）');
            } else throw new Error('[GSplatInfo] SOGS GPU 资源不支持直接访问 splat 属性（数据在 GPU）');
        } else throw new Error('[GSplatInfo] 资源不支持获取 splat 缩放');
        const worldScale = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        this.node.matrixWorld.decompose(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(), new __WEBPACK_EXTERNAL_MODULE_three__.Quaternion(), worldScale);
        result.multiply(worldScale);
        return result;
    }
    getSplatWorldRotation(index, target) {
        const result = target || new __WEBPACK_EXTERNAL_MODULE_three__.Quaternion();
        if (this.resource.gsplatData) {
            const gsplatData = this.resource.gsplatData;
            if (isSogsData(gsplatData)) gsplatData.getSplatRotation(index, result);
            else if (isSplatData(gsplatData)) {
                const rx = gsplatData.getProp('rot_1');
                const ry = gsplatData.getProp('rot_2');
                const rz = gsplatData.getProp('rot_3');
                const rw = gsplatData.getProp('rot_0');
                if (rx && ry && rz && rw) {
                    result.set(rx[index], ry[index], rz[index], rw[index]);
                    result.normalize();
                } else throw new Error('[GSplatInfo] SplatData 缺少旋转属性（rot_0, rot_1, rot_2, rot_3）');
            } else throw new Error('[GSplatInfo] SOGS GPU 资源不支持直接访问 splat 属性（数据在 GPU）');
        } else throw new Error('[GSplatInfo] 资源不支持获取 splat 旋转');
        const worldRotation = new __WEBPACK_EXTERNAL_MODULE_three__.Quaternion();
        this.node.matrixWorld.decompose(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(), worldRotation, new __WEBPACK_EXTERNAL_MODULE_three__.Vector3());
        result.premultiply(worldRotation);
        return result;
    }
    initState() {
        if (this._stateData) return;
        this._stateData = new Uint8Array(this.numSplats);
        this._stateDirty = true;
    }
    get stateData() {
        return this._stateData;
    }
    get splatStateTexture() {
        if (this._stateDirty) this.updateStateTexture();
        return this._stateTexture;
    }
    get stateDirty() {
        return this._stateDirty;
    }
    setSplatState(index, state) {
        if (!this._stateData) this.initState();
        if (index >= 0 && index < this.numSplats) {
            this._stateData[index] = state;
            this._stateDirty = true;
        }
    }
    getSplatState(index) {
        if (!this._stateData || index < 0 || index >= this.numSplats) return 0;
        return this._stateData[index];
    }
    addSplatStateFlag(index, flag) {
        if (!this._stateData) this.initState();
        if (index >= 0 && index < this.numSplats) {
            this._stateData[index] |= flag;
            this._stateDirty = true;
        }
    }
    removeSplatStateFlag(index, flag) {
        if (!this._stateData) return;
        if (index >= 0 && index < this.numSplats) {
            this._stateData[index] &= ~flag;
            this._stateDirty = true;
        }
    }
    clearSplatState(index) {
        if (!this._stateData) return;
        if (index >= 0 && index < this.numSplats) {
            this._stateData[index] = 0;
            this._stateDirty = true;
        }
    }
    clearAllStates() {
        if (!this._stateData) return;
        this._stateData.fill(0);
        this._stateDirty = true;
    }
    setSelected(indices, selected) {
        if (!this._stateData) this.initState();
        for (const index of indices)if (index >= 0 && index < this.numSplats) {
            if (selected) this._stateData[index] |= 1;
            else this._stateData[index] &= -2;
        }
        this._stateDirty = true;
    }
    clearSelection() {
        if (!this._stateData) return;
        for(let i = 0; i < this.numSplats; i++)this._stateData[i] &= -2;
        this._stateDirty = true;
    }
    getSelectedIndices() {
        if (!this._stateData) return [];
        const selected = [];
        for(let i = 0; i < this.numSplats; i++)if (1 & this._stateData[i]) selected.push(i);
        return selected;
    }
    updateStateTexture() {
        if (!this._stateData || !this._stateDirty) return;
        const texSize = Math.ceil(Math.sqrt(this.numSplats));
        if (this._stateTexture && this._stateTexture.image.width === texSize) {
            const textureData = this._stateTexture.image.data;
            textureData.set(this._stateData);
        } else {
            if (this._stateTexture) this._stateTexture.dispose();
            const paddedData = new Uint8Array(texSize * texSize);
            paddedData.set(this._stateData);
            this._stateTexture = new __WEBPACK_EXTERNAL_MODULE_three__.DataTexture(paddedData, texSize, texSize, __WEBPACK_EXTERNAL_MODULE_three__.RedFormat, __WEBPACK_EXTERNAL_MODULE_three__.UnsignedByteType);
            this._stateTexture.name = 'splatState';
            this._stateTexture.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
            this._stateTexture.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
            this._stateTexture.wrapS = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
            this._stateTexture.wrapT = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
            this._stateTexture.generateMipmaps = false;
            this._stateTexture.internalFormat = 'R8';
        }
        this._stateTexture.needsUpdate = true;
        this._stateDirty = false;
    }
}
export { GSplatInfo, GSplatInfo_rslib_entry_SplatState as SplatState };
