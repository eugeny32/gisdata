import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('gsplat:tool');
class SplatCropper {
    constructor(splatData){
        this.splatData = splatData;
        this.deletedMask = new Uint8Array(splatData.numSplats);
    }
    cropByBox(box, invert = false) {
        const x = this.splatData.getProp('x');
        const y = this.splatData.getProp('y');
        const z = this.splatData.getProp('z');
        if (!x || !y || !z) {
            log.warn('SplatCropper: 缺少位置数据');
            return 0;
        }
        let count = 0;
        for(let i = 0; i < this.splatData.numSplats; i++){
            const inside = x[i] >= box.min.x && x[i] <= box.max.x && y[i] >= box.min.y && y[i] <= box.max.y && z[i] >= box.min.z && z[i] <= box.max.z;
            const shouldDelete = invert ? inside : !inside;
            if (shouldDelete && !this.deletedMask[i]) {
                this.deletedMask[i] = 1;
                count++;
            }
        }
        return count;
    }
    cropBySphere(sphere, invert = false) {
        const x = this.splatData.getProp('x');
        const y = this.splatData.getProp('y');
        const z = this.splatData.getProp('z');
        if (!x || !y || !z) {
            log.warn('SplatCropper: 缺少位置数据');
            return 0;
        }
        const r2 = sphere.radius * sphere.radius;
        let count = 0;
        for(let i = 0; i < this.splatData.numSplats; i++){
            const dx = x[i] - sphere.center.x;
            const dy = y[i] - sphere.center.y;
            const dz = z[i] - sphere.center.z;
            const dist2 = dx * dx + dy * dy + dz * dz;
            const inside = dist2 <= r2;
            const shouldDelete = invert ? inside : !inside;
            if (shouldDelete && !this.deletedMask[i]) {
                this.deletedMask[i] = 1;
                count++;
            }
        }
        return count;
    }
    cropByPlane(plane, keepPositiveSide = true) {
        const x = this.splatData.getProp('x');
        const y = this.splatData.getProp('y');
        const z = this.splatData.getProp('z');
        if (!x || !y || !z) {
            log.warn('SplatCropper: 缺少位置数据');
            return 0;
        }
        let count = 0;
        const point = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        for(let i = 0; i < this.splatData.numSplats; i++){
            point.set(x[i], y[i], z[i]);
            const distance = plane.distanceToPoint(point);
            const shouldDelete = keepPositiveSide ? distance < 0 : distance >= 0;
            if (shouldDelete && !this.deletedMask[i]) {
                this.deletedMask[i] = 1;
                count++;
            }
        }
        return count;
    }
    deleteByIndices(indices) {
        for (const i of indices)if (i >= 0 && i < this.splatData.numSplats) this.deletedMask[i] = 1;
    }
    reset() {
        this.deletedMask.fill(0);
    }
    getDeletedMask() {
        return this.deletedMask;
    }
    getValidIndices() {
        const indices = [];
        for(let i = 0; i < this.splatData.numSplats; i++)if (!this.deletedMask[i]) indices.push(i);
        return new Uint32Array(indices);
    }
    getStats() {
        let deleted = 0;
        for(let i = 0; i < this.deletedMask.length; i++)if (this.deletedMask[i]) deleted++;
        return {
            total: this.splatData.numSplats,
            deleted,
            remaining: this.splatData.numSplats - deleted
        };
    }
}
export { SplatCropper };
