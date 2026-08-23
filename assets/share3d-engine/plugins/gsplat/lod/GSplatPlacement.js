import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_types_gsplat_js_2ba04999__ from "../../../shared/types/gsplat.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('gsplat:lod');
class GSplatPlacement {
    constructor(resource, node, lodIndex = 0){
        this.octree = null;
        this.intervals = new Map();
        this.lodIndex = 0;
        this._lodDistances = null;
        this._lodBaseDistance = 5;
        this._lodMultiplier = 3;
        this.splatBudget = 0;
        this.workBufferModifier = null;
        this.workBufferUpdateMode = __WEBPACK_EXTERNAL_MODULE__shared_types_gsplat_js_2ba04999__.GSPLAT_WORKBUFFER_UPDATE_AUTO;
        this._aabb = new __WEBPACK_EXTERNAL_MODULE_three__.Box3();
        this.resource = resource;
        this.node = node;
        this.lodIndex = lodIndex;
    }
    set aabb(aabb) {
        this._aabb.copy(aabb);
    }
    get aabb() {
        return this._aabb;
    }
    set lodDistances(distances) {
        const isOctree = !!(this.resource && 'meta' in this.resource);
        if (isOctree) {
            if (distances) {
                if (!Array.isArray(distances)) {
                    log.warn('lodDistances must be an array');
                    return;
                }
                this._lodDistances = distances.slice();
            } else this._lodDistances = null;
        }
    }
    get lodDistances() {
        return this._lodDistances ? this._lodDistances.slice() : null;
    }
    set lodBaseDistance(value) {
        if (Number.isFinite(value) && value > 0) this._lodBaseDistance = value;
    }
    get lodBaseDistance() {
        return this._lodBaseDistance;
    }
    set lodMultiplier(value) {
        if (Number.isFinite(value) && value > 1) this._lodMultiplier = value;
    }
    get lodMultiplier() {
        return this._lodMultiplier;
    }
    getWorldAabb() {
        this.node.updateMatrixWorld(true);
        const worldBox = this._aabb.clone();
        worldBox.applyMatrix4(this.node.matrixWorld);
        return worldBox;
    }
}
export { GSplatPlacement };
