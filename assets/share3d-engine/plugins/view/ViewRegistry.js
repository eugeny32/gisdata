import * as __WEBPACK_EXTERNAL_MODULE__shared_utils_viewRect_js_7e8b5892__ from "../../shared/utils/viewRect.js";
import * as __WEBPACK_EXTERNAL_MODULE__ViewFactory_js_04afa605__ from "./ViewFactory.js";
class ViewRegistryImpl {
    constructor(events, primaryViewId = 'primary'){
        this.views = new Map();
        this.activeViewId = null;
        this.nextOrder = 0;
        this.disposed = false;
        this.events = events;
        this.primaryViewId = primaryViewId;
    }
    create(options) {
        this.assertNotDisposed();
        const record = __WEBPACK_EXTERNAL_MODULE__ViewFactory_js_04afa605__.ViewFactory.createRecord(options, this.nextOrder++);
        if (record.id === this.primaryViewId) record.removable = false;
        if (this.views.has(record.id)) throw new Error(`View "${record.id}" 已存在`);
        this.views.set(record.id, record);
        const previousViewId = this.activeViewId;
        if (null == this.activeViewId) this.activeViewId = record.id;
        const snapshot = this.snapshotOf(record.id);
        this.events.emit('view.created', {
            viewId: record.id,
            snapshot
        });
        if (previousViewId !== this.activeViewId) this.events.emit('view.activated', {
            viewId: record.id,
            previousViewId,
            snapshot
        });
        return snapshot;
    }
    remove(id) {
        this.assertNotDisposed();
        if (id === this.primaryViewId) return false;
        const record = this.views.get(id);
        if (!record) return false;
        const previousActiveViewId = this.activeViewId;
        this.views.delete(id);
        this.events.emit('view.removed', {
            viewId: id,
            previousActiveViewId
        });
        if (this.activeViewId === id) {
            const nextActiveId = this.resolveFallbackActiveViewId();
            this.activeViewId = nextActiveId;
            if (nextActiveId) this.events.emit('view.activated', {
                viewId: nextActiveId,
                previousViewId: id,
                snapshot: this.snapshotOf(nextActiveId)
            });
        }
        return true;
    }
    get(id) {
        const record = this.views.get(id);
        if (!record) return;
        return this.snapshotOf(record.id);
    }
    list() {
        return Array.from(this.views.values()).sort((left, right)=>{
            if (left.zIndex !== right.zIndex) return left.zIndex - right.zIndex;
            return left.order - right.order;
        }).map((record)=>this.snapshotOf(record.id));
    }
    getActive() {
        if (!this.activeViewId) return;
        return this.snapshotOf(this.activeViewId);
    }
    setActive(id) {
        this.assertNotDisposed();
        const record = this.getRequiredRecord(id);
        if (this.activeViewId === record.id) return this.snapshotOf(record.id);
        const previousViewId = this.activeViewId;
        this.activeViewId = record.id;
        const snapshot = this.snapshotOf(record.id);
        this.events.emit('view.activated', {
            viewId: record.id,
            previousViewId,
            snapshot
        });
        return snapshot;
    }
    update(id, patch) {
        this.assertNotDisposed();
        const record = this.getRequiredRecord(id);
        const previous = this.snapshotOf(id);
        if (patch.rect) record.rect = __WEBPACK_EXTERNAL_MODULE__ViewFactory_js_04afa605__.ViewFactory.cloneRect(patch.rect);
        if (void 0 !== patch.visible) record.visible = patch.visible;
        if (void 0 !== patch.zIndex) record.zIndex = patch.zIndex;
        if (void 0 !== patch.layerMask) record.layerMask = patch.layerMask;
        if (void 0 !== patch.userData) record.userData = {
            ...patch.userData
        };
        const snapshot = this.snapshotOf(id);
        this.events.emit('view.updated', {
            viewId: id,
            snapshot,
            previous
        });
        return snapshot;
    }
    setRect(id, rect) {
        return this.update(id, {
            rect
        });
    }
    setVisible(id, visible) {
        return this.update(id, {
            visible
        });
    }
    setLayerMask(id, layerMask) {
        return this.update(id, {
            layerMask
        });
    }
    setZIndex(id, zIndex) {
        return this.update(id, {
            zIndex
        });
    }
    resolveViewAtScreen(screen) {
        const hits = Array.from(this.views.values()).filter((record)=>{
            if (!record.visible) return false;
            if (record.rect.width <= 0 || record.rect.height <= 0) return false;
            return (0, __WEBPACK_EXTERNAL_MODULE__shared_utils_viewRect_js_7e8b5892__.containsScreenPoint)(record.rect, screen);
        });
        hits.sort((left, right)=>{
            if (left.zIndex !== right.zIndex) return right.zIndex - left.zIndex;
            return right.order - left.order;
        });
        const topmost = hits[0];
        return topmost ? this.snapshotOf(topmost.id) : void 0;
    }
    setExtension(id, key, value) {
        this.assertNotDisposed();
        const record = this.getRequiredRecord(id);
        record.extensions[key] = value;
    }
    getExtension(id, key) {
        const record = this.getRequiredRecord(id);
        return record.extensions[key];
    }
    dispose() {
        this.disposed = true;
        this.views.clear();
        this.activeViewId = null;
    }
    snapshotOf(id) {
        const record = this.getRequiredRecord(id);
        return __WEBPACK_EXTERNAL_MODULE__ViewFactory_js_04afa605__.ViewFactory.toSnapshot(record, this.activeViewId === id);
    }
    getRequiredRecord(id) {
        const record = this.views.get(id);
        if (!record) throw new Error(`View "${id}" 不存在`);
        return record;
    }
    resolveFallbackActiveViewId() {
        if (this.views.has(this.primaryViewId)) return this.primaryViewId;
        const next = Array.from(this.views.values()).sort((left, right)=>{
            if (left.order !== right.order) return left.order - right.order;
            return left.zIndex - right.zIndex;
        })[0];
        return next?.id ?? null;
    }
    assertNotDisposed() {
        if (this.disposed) throw new Error('ViewRegistry 已销毁');
    }
}
export { ViewRegistryImpl };
