import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('gsplat:lod');
let globalResourceId = 0;
class GSplatResource {
    constructor(data){
        this.id = globalResourceId++;
        this._refCount = 0;
        this._aabb = null;
        this._centers = null;
        this.data = data;
    }
    incRefCount() {
        this._refCount++;
    }
    decRefCount() {
        this._refCount--;
        if (this._refCount < 0) log.warn(`GSplatResource[${this.id}]: refCount is negative (${this._refCount})`);
    }
    get refCount() {
        return this._refCount;
    }
    get numSplats() {
        return this.data.numSplats;
    }
    get aabb() {
        if (!this._aabb) {
            this._aabb = new __WEBPACK_EXTERNAL_MODULE_three__.Box3();
            this.data.calcAabb(this._aabb);
        }
        return this._aabb;
    }
    get centers() {
        if (!this._centers) this._centers = this.data.getCenters();
        return this._centers;
    }
    get shBands() {
        return this.data.shBands;
    }
    getProp(name) {
        if ('getProp' in this.data) return this.data.getProp(name);
        return null;
    }
    get meta() {
        if ('meta' in this.data) return this.data.meta;
        return null;
    }
    destroy() {
        if ('dispose' in this.data && 'function' == typeof this.data.dispose) this.data.dispose();
        this._aabb = null;
        this._centers = null;
    }
    dispose() {
        this.destroy();
    }
}
export { GSplatResource };
