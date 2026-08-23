import * as __WEBPACK_EXTERNAL_MODULE__shared_utils_index_js_83ff7f8f__ from "../../shared/utils/index.js";
class SpatialBindingStore {
    create(options, ownerState) {
        const representationRoles = Array.from(new Set(options.representationRoles));
        const surfaceUsages = representationRoles.includes('surface') ? Array.from(new Set(options.surfaceUsages?.length ? options.surfaceUsages : DEFAULT_SURFACE_USAGES)) : [];
        const record = {
            id: options.id ?? (0, __WEBPACK_EXTERNAL_MODULE__shared_utils_index_js_83ff7f8f__.generateId)(),
            worldId: options.worldId,
            ownerAssetId: options.ownerAssetId,
            ownerKind: options.ownerKind,
            representationRoles,
            surfaceUsages,
            priority: options.priority ?? 0,
            transformMode: options.transformMode ?? 'followOwnerMatrix',
            ownerStatePolicy: options.ownerStatePolicy ?? 'inherit',
            occlusionDepth: normalizeOcclusionDepth(options.occlusionDepth),
            ownerState: {
                mounted: ownerState.mounted,
                visible: ownerState.visible
            }
        };
        this.records.set(record.id, record);
        return record;
    }
    get(id) {
        return this.records.get(id);
    }
    list() {
        return Array.from(this.records.values());
    }
    snapshot(record, getRepresentationState) {
        const ownerActive = isOwnerActive(record);
        return {
            id: record.id,
            worldId: record.worldId,
            ownerAssetId: record.ownerAssetId,
            ownerKind: record.ownerKind,
            representationRoles: [
                ...record.representationRoles
            ],
            surfaceUsages: [
                ...record.surfaceUsages
            ],
            priority: record.priority,
            transformMode: record.transformMode,
            ownerStatePolicy: record.ownerStatePolicy,
            occlusionDepth: {
                ...record.occlusionDepth
            },
            ownerActive,
            availabilityByRole: {
                surface: ownerActive && record.representationRoles.includes('surface') && 'ready' === getRepresentationState(record.worldId, 'surface'),
                collision: ownerActive && record.representationRoles.includes('collision') && 'ready' === getRepresentationState(record.worldId, 'collision'),
                navigation: ownerActive && record.representationRoles.includes('navigation') && 'ready' === getRepresentationState(record.worldId, 'navigation')
            }
        };
    }
    filter(filter, getRepresentationState) {
        return this.list().filter((record)=>{
            if (filter?.ownerAssetId && record.ownerAssetId !== filter.ownerAssetId) return false;
            if (filter?.ownerKind && record.ownerKind !== filter.ownerKind) return false;
            if (filter?.worldId && record.worldId !== filter.worldId) return false;
            if (filter?.representationRole && !record.representationRoles.includes(filter.representationRole)) return false;
            if (filter?.surfaceUsage) {
                if (!record.representationRoles.includes('surface') || !record.surfaceUsages.includes(filter.surfaceUsage)) return false;
            }
            if (!filter?.includeInactive) {
                const snapshot = this.snapshot(record, getRepresentationState);
                if (filter?.representationRole) return snapshot.availabilityByRole[filter.representationRole];
                return Object.values(snapshot.availabilityByRole).some(Boolean);
            }
            return true;
        });
    }
    updateOwnerState(ownerAssetId, patch, ownerKind) {
        const updated = [];
        for (const record of this.records.values()){
            if (record.ownerAssetId === ownerAssetId) {
                if (!ownerKind || record.ownerKind === ownerKind) {
                    record.ownerState = {
                        mounted: patch.mounted ?? record.ownerState.mounted,
                        visible: patch.visible ?? record.ownerState.visible
                    };
                    updated.push(record);
                }
            }
        }
        return updated;
    }
    remove(id) {
        const record = this.records.get(id);
        if (!record) return;
        this.records.delete(id);
        return record;
    }
    removeByOwner(ownerAssetId, ownerKind) {
        const removed = [];
        for (const record of this.records.values()){
            if (record.ownerAssetId === ownerAssetId) {
                if (!ownerKind || record.ownerKind === ownerKind) {
                    this.records.delete(record.id);
                    removed.push(record);
                }
            }
        }
        return removed;
    }
    removeByWorldId(worldId) {
        const removed = [];
        for (const record of this.records.values())if (record.worldId === worldId) {
            this.records.delete(record.id);
            removed.push(record);
        }
        return removed;
    }
    constructor(){
        this.records = new Map();
    }
}
function isOwnerActive(record) {
    if ('always' === record.ownerStatePolicy) return true;
    return record.ownerState.mounted && record.ownerState.visible;
}
const DEFAULT_SURFACE_USAGES = [
    'measurement',
    'camera-control'
];
function normalizeOcclusionDepth(value) {
    if (true === value) return {
        enabled: true,
        representationRole: 'surface'
    };
    if (value && 'object' == typeof value) return {
        enabled: true,
        representationRole: value.representationRole
    };
    return {
        enabled: false,
        representationRole: null
    };
}
export { SpatialBindingStore };
