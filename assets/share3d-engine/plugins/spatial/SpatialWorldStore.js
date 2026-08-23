import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_utils_index_js_83ff7f8f__ from "../../shared/utils/index.js";
class SpatialWorldStore {
    constructor(unloadWorld){
        this.unloadWorld = unloadWorld;
        this.records = new Map();
        this.nextGeneration = 1;
    }
    create(options) {
        const id = options.id ?? (0, __WEBPACK_EXTERNAL_MODULE__shared_utils_index_js_83ff7f8f__.generateId)();
        if (this.records.has(id)) throw new Error(`Spatial world "${id}" already exists`);
        const record = {
            id,
            name: options.name?.trim() || id,
            generation: this.nextGeneration++,
            refCount: 0,
            userData: Object.freeze({
                ...options.userData ?? {}
            }),
            representations: createRepresentationRecordMap(id, options.representations),
            handle: new SpatialWorldHandleImpl(id, this)
        };
        this.records.set(id, record);
        return record.handle;
    }
    getRecord(id) {
        return this.records.get(id);
    }
    getRepresentationRecord(id, role) {
        return this.records.get(id)?.representations[role];
    }
    getHandle(id) {
        return this.records.get(id)?.handle;
    }
    getRepresentationState(id, role) {
        return this.records.get(id)?.representations[role]?.state ?? 'absent';
    }
    getSnapshot(id) {
        const record = this.records.get(id);
        return record ? createSnapshot(record) : void 0;
    }
    listSnapshots() {
        return Array.from(this.records.values(), createSnapshot);
    }
    markRepresentationReady(id, role, result, generation) {
        const world = this.records.get(id);
        if (!world || void 0 !== generation && world.generation !== generation) return;
        const record = world.representations[role];
        if (!record) return;
        disposeBackend(record.backendInstance);
        record.state = 'ready';
        record.format = result.format;
        record.backend = result.backend.kind;
        record.backendInstance = result.backend;
        record.bounds = result.bounds?.clone() ?? null;
        record.error = null;
        record.userData = result.userData;
        record.metadata = result.metadata;
        disposeDebugObject(record.debugPrototype);
        record.debug = {
            ...result.debug,
            prototypeName: `${id}-${role}-${result.debug.prototypeName ?? 'prototype'}`
        };
        record.debugPrototype = record.debug ? result.backend.createDebugPrototype(record.debug.prototypeName ?? `${id}-${role}`, record.debug) : null;
        record.debugRevision += 1;
        return record;
    }
    markRepresentationError(id, role, error, generation) {
        const world = this.records.get(id);
        if (!world || void 0 !== generation && world.generation !== generation) return;
        const record = world.representations[role];
        if (!record) return;
        record.state = 'error';
        record.error = error;
        record.backend = null;
        disposeBackend(record.backendInstance);
        record.backendInstance = null;
        record.bounds = null;
        record.metadata = null;
        disposeDebugObject(record.debugPrototype);
        record.debugPrototype = null;
        record.debugRevision += 1;
        return record;
    }
    setRepresentationDebug(id, role, update) {
        const record = this.records.get(id)?.representations[role];
        if (!record?.debug) return;
        record.debug = {
            ...record.debug,
            ...update
        };
        disposeDebugObject(record.debugPrototype);
        record.debugPrototype = record.backendInstance && 'ready' === record.state ? record.backendInstance.createDebugPrototype(record.debug.prototypeName ?? `${id}-${role}`, record.debug) : null;
        record.debugRevision += 1;
        return record;
    }
    incrementRef(id) {
        const record = this.records.get(id);
        if (!record) return;
        record.refCount += 1;
        return record;
    }
    decrementRef(id) {
        const record = this.records.get(id);
        if (!record) return;
        record.refCount = Math.max(0, record.refCount - 1);
        return record;
    }
    remove(id) {
        const record = this.records.get(id);
        if (!record) return;
        this.records.delete(id);
        return record;
    }
    clear() {
        const records = Array.from(this.records.values());
        this.records.clear();
        return records;
    }
}
class SpatialWorldHandleImpl {
    constructor(id, store){
        this.id = id;
        this.store = store;
    }
    get name() {
        return this.requireRecord().name;
    }
    get refCount() {
        return this.requireRecord().refCount;
    }
    get userData() {
        return this.requireRecord().userData;
    }
    snapshot() {
        return createSnapshot(this.requireRecord());
    }
    getRepresentation(role) {
        return cloneRepresentation(this.requireRecord().representations[role]);
    }
    dispose() {
        this.store.unloadWorld(this.id);
    }
    requireRecord() {
        const record = this.store.getRecord(this.id);
        if (!record) throw new Error(`Spatial world "${this.id}" has been released`);
        return record;
    }
}
function createRepresentationRecordMap(worldId, requested) {
    return {
        surface: createRepresentationRecord(worldId, 'surface', requested.surface),
        collision: createRepresentationRecord(worldId, 'collision', requested.collision),
        navigation: createRepresentationRecord(worldId, 'navigation', requested.navigation)
    };
}
function createRepresentationRecord(_worldId, role, requested) {
    return {
        role,
        state: requested ? 'building' : 'absent',
        format: requested?.format ?? null,
        backend: null,
        backendInstance: null,
        bounds: null,
        error: null,
        userData: Object.freeze({
            ...requested?.userData ?? {}
        }),
        metadata: null,
        debug: requested ? {
            ...requested.debug
        } : null,
        debugPrototype: null,
        debugRevision: 0
    };
}
function createSnapshot(record) {
    return {
        id: record.id,
        name: record.name,
        refCount: record.refCount,
        userData: record.userData,
        representations: {
            surface: cloneRepresentation(record.representations.surface),
            collision: cloneRepresentation(record.representations.collision),
            navigation: cloneRepresentation(record.representations.navigation)
        }
    };
}
function cloneRepresentation(record) {
    return {
        role: record.role,
        state: record.state,
        format: record.format,
        backend: record.backend,
        bounds: record.bounds?.clone() ?? null,
        error: record.error,
        userData: record.userData,
        metadata: record.metadata,
        debug: record.debug ? {
            ...record.debug
        } : null
    };
}
function disposeDebugObject(object3D) {
    if (!object3D) return;
    object3D.traverse((child)=>{
        const disposable = child;
        if (disposable.dispose && !(child instanceof __WEBPACK_EXTERNAL_MODULE_three__.Mesh) && !(child instanceof __WEBPACK_EXTERNAL_MODULE_three__.LineSegments)) disposable.dispose();
        if (child instanceof __WEBPACK_EXTERNAL_MODULE_three__.Mesh || child instanceof __WEBPACK_EXTERNAL_MODULE_three__.LineSegments) {
            const material = child.material;
            if (Array.isArray(material)) for (const entry of material)entry.dispose();
            else material?.dispose();
        }
    });
    object3D.removeFromParent();
}
function disposeBackend(backend) {
    backend?.dispose();
}
export { SpatialWorldStore };
