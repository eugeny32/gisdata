import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
class SceneBoundsService {
    register(entry) {
        this.entries.set(this._makeKey(entry.kind, entry.id), entry);
    }
    unregister(kind, id) {
        this.entries.delete(this._makeKey(kind, id));
    }
    getWorldBoundingBox(query = {}) {
        const result = new __WEBPACK_EXTERNAL_MODULE_three__.Box3();
        const ids = query.ids ? new Set(query.ids) : null;
        const kinds = query.kinds ? new Set(query.kinds) : null;
        const includeInvisible = query.includeInvisible ?? false;
        const purpose = query.purpose ?? 'default';
        for (const entry of this.entries.values()){
            if (ids && !ids.has(entry.id)) continue;
            if (kinds && !kinds.has(entry.kind)) continue;
            if (!includeInvisible && !entry.isVisible()) continue;
            if ('fit' === purpose && entry.getWorldBoundingBoxForFit) {
                const fitBounds = entry.getWorldBoundingBoxForFit()?.clone() ?? null;
                if (fitBounds && !fitBounds.isEmpty()) {
                    result.union(fitBounds);
                    continue;
                }
            }
            const localBounds = entry.getLocalBoundingBox();
            if (!localBounds) continue;
            const localBox = localBounds.clone();
            if (localBox.isEmpty()) continue;
            entry.object3D.updateWorldMatrix(true, false);
            const worldBox = localBox.applyMatrix4(entry.object3D.matrixWorld);
            if (!worldBox.isEmpty()) result.union(worldBox);
        }
        return result;
    }
    dispose() {
        this.entries.clear();
    }
    _makeKey(kind, id) {
        return `${kind}:${id}`;
    }
    constructor(){
        this.entries = new Map();
    }
}
export { SceneBoundsService };
