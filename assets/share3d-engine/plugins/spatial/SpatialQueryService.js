import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__SpatialBindingStore_js_271b0a96__ from "./SpatialBindingStore.js";
import * as __WEBPACK_EXTERNAL_MODULE__SpatialBuildPipeline_js_b0c69463__ from "./SpatialBuildPipeline.js";
import * as __WEBPACK_EXTERNAL_MODULE__SpatialWorldStore_js_b98bec85__ from "./SpatialWorldStore.js";
import * as __WEBPACK_EXTERNAL_MODULE__ViewRayResolver_js_aff739c7__ from "./ViewRayResolver.js";
class SpatialQueryServiceImpl {
    constructor(options){
        this.options = options;
        this.bindingStore = new __WEBPACK_EXTERNAL_MODULE__SpatialBindingStore_js_271b0a96__.SpatialBindingStore();
        this.debugInstances = new Map();
        this.debugInstanceRevisions = new Map();
        this.occlusionDepthWriters = new Map();
        this.disposed = false;
        this.handleAssetMounted = (event)=>{
            const updated = this.bindingStore.updateOwnerState(event.id, {
                mounted: true
            }, event.kind);
            this.emitBindingUpdates('updated', updated);
            this.syncOcclusionDepthWriters();
            if (updated.length > 0) this.options.onSharedOcclusionDepthChanged?.('sharedOcclusionDepth.ownerChanged');
            this.syncDebugOverlays();
        };
        this.handleAssetUnmounted = (event)=>{
            const updated = this.bindingStore.updateOwnerState(event.id, {
                mounted: false
            }, event.kind);
            this.emitBindingUpdates('updated', updated);
            this.syncOcclusionDepthWriters();
            if (updated.length > 0) this.options.onSharedOcclusionDepthChanged?.('sharedOcclusionDepth.ownerChanged');
            this.syncDebugOverlays();
        };
        this.handleAssetVisibilityChanged = (event)=>{
            const updated = this.bindingStore.updateOwnerState(event.id, {
                visible: event.visible
            });
            this.emitBindingUpdates('updated', updated);
            this.syncOcclusionDepthWriters();
            if (updated.length > 0) this.options.onSharedOcclusionDepthChanged?.('sharedOcclusionDepth.ownerChanged');
            this.syncDebugOverlays();
        };
        this.handleAssetDisposed = (event)=>{
            const removed = this.bindingStore.removeByOwner(event.id, event.kind);
            for (const record of removed){
                this.worldStore.decrementRef(record.worldId);
                this.emitBindingChanged('unbound', record);
                this.removeDebugInstancesForBinding(record.id);
                this.removeOcclusionDepthWriterForBinding(record.id);
            }
            if (removed.length > 0) this.options.onSharedOcclusionDepthChanged?.('sharedOcclusionDepth.ownerChanged');
        };
        this.getRepresentationState = (worldId, role)=>this.worldStore.getRepresentationState(worldId, role);
        this.buildPipeline = new __WEBPACK_EXTERNAL_MODULE__SpatialBuildPipeline_js_b0c69463__.SpatialBuildPipeline(options.loadingManager, {
            withCredentials: options.withCredentials
        });
        this.worldStore = new __WEBPACK_EXTERNAL_MODULE__SpatialWorldStore_js_b98bec85__.SpatialWorldStore((worldId)=>this.unloadWorld(worldId));
        this.viewRayResolver = new __WEBPACK_EXTERNAL_MODULE__ViewRayResolver_js_aff739c7__.ViewRayResolver(options.getViewport, options.getViewRegistry);
        this.options.events.on('asset.mounted', this.handleAssetMounted);
        this.options.events.on('asset.unmounted', this.handleAssetUnmounted);
        this.options.events.on('asset.visibilityChanged', this.handleAssetVisibilityChanged);
        this.options.events.on('asset.disposed', this.handleAssetDisposed);
    }
    loadWorld(request) {
        const requested = getRequestedRepresentations(request);
        if (0 === requested.length) throw new Error('Spatial worlds must request at least one representation');
        const handle = this.worldStore.create({
            id: request.id,
            name: request.name,
            userData: request.userData,
            representations: {
                surface: request.representations.surface ? {
                    format: request.representations.surface.format ?? null,
                    debug: createRequestedDebugSnapshot('surface', request),
                    userData: request.representations.surface.userData
                } : void 0,
                collision: request.representations.collision ? {
                    format: request.representations.collision.format ?? null,
                    debug: createRequestedDebugSnapshot('collision', request),
                    userData: request.representations.collision.userData
                } : void 0,
                navigation: request.representations.navigation ? {
                    format: request.representations.navigation.format ?? null,
                    debug: createRequestedDebugSnapshot('navigation', request),
                    userData: request.representations.navigation.userData
                } : void 0
            }
        });
        const worldGeneration = this.worldStore.getRecord(handle.id)?.generation ?? 0;
        for (const role of requested){
            const representationRequest = inheritWorldCredentials(request.representations[role], request.withCredentials);
            this.buildRepresentation(handle.id, worldGeneration, role, representationRequest, request.signal);
        }
        return handle;
    }
    unloadWorld(id) {
        const record = this.worldStore.getRecord(id);
        if (!record) return false;
        const removedBindings = this.bindingStore.removeByWorldId(id);
        for (const binding of removedBindings){
            this.emitBindingChanged('unbound', binding);
            this.removeDebugInstancesForBinding(binding.id);
            this.removeOcclusionDepthWriterForBinding(binding.id);
        }
        const removedWorld = this.worldStore.remove(id);
        if (!removedWorld) return false;
        for (const representation of Object.values(removedWorld.representations)){
            representation.backendInstance?.dispose();
            disposeDebugObject(representation.debugPrototype);
        }
        this.removeDebugInstancesForWorld(id);
        this.options.events.emit('spatial.worldDisposed', {
            worldId: id
        });
        return true;
    }
    getWorld(id) {
        return this.worldStore.getHandle(id);
    }
    getWorldSnapshot(id) {
        return this.worldStore.getSnapshot(id);
    }
    listWorlds() {
        return this.worldStore.listSnapshots();
    }
    bindWorld(options) {
        const world = this.worldStore.getRecord(options.worldId);
        if (!world) throw new Error(`Spatial world "${options.worldId}" was not found`);
        const ownerState = this.resolveOwnerState(options.ownerKind, options.ownerAssetId);
        const record = this.bindingStore.create(options, ownerState);
        this.worldStore.incrementRef(record.worldId);
        this.emitBindingChanged('bound', record);
        this.syncOcclusionDepthWriters();
        this.syncDebugOverlays();
        return this.bindingStore.snapshot(record, this.getRepresentationState);
    }
    unbindWorld(bindingId) {
        const record = this.bindingStore.remove(bindingId);
        if (!record) return false;
        this.worldStore.decrementRef(record.worldId);
        this.emitBindingChanged('unbound', record);
        this.removeDebugInstancesForBinding(record.id);
        this.removeOcclusionDepthWriterForBinding(record.id);
        return true;
    }
    getBindings(filter) {
        return this.bindingStore.filter(filter, this.getRepresentationState).map((record)=>this.bindingStore.snapshot(record, this.getRepresentationState));
    }
    setDebugMeshVisible(worldId, role, visible) {
        const record = this.worldStore.setRepresentationDebug(worldId, role, {
            meshVisible: visible
        });
        if (!record) return false;
        this.syncDebugOverlays();
        return true;
    }
    setDebugBoundsVisible(worldId, role, visible) {
        const record = this.worldStore.setRepresentationDebug(worldId, role, {
            boundsVisible: visible
        });
        if (!record) return false;
        this.syncDebugOverlays();
        return true;
    }
    setDebugBoundsDepth(worldId, role, depth) {
        const record = this.worldStore.setRepresentationDebug(worldId, role, {
            boundsDepth: depth
        });
        if (!record) return false;
        this.syncDebugOverlays();
        return true;
    }
    raycastSurface(query) {
        const layerMask = query.layerMask ?? query.camera.layers.mask;
        const candidates = [];
        for (const context of this.collectBindingContexts({
            role: 'surface',
            ownerAssetId: query.ownerAssetId,
            ownerKind: query.ownerKind,
            worldId: query.worldId,
            layerMask,
            surfaceUsage: query.surfaceUsage
        })){
            const localRay = query.ray.clone().applyMatrix4(getInverseOwnerMatrix(context.ownerObject));
            const backend = context.representation.backendInstance;
            const hit = backend.raycastFirst(localRay);
            if (!!hit) candidates.push(this.toSurfaceHit(hit, context, query.surfaceUsage, query.ray.origin.distanceTo(hit.point.clone().applyMatrix4(context.ownerObject.matrixWorld))));
        }
        return pickBestSurfaceHit(candidates, this.bindingStore);
    }
    raycastSurfaceAtScreen(query) {
        const resolved = this.viewRayResolver.resolve(query);
        if (!resolved) return null;
        return this.raycastSurface({
            ...query,
            camera: resolved.camera,
            ray: resolved.ray,
            layerMask: resolved.layerMask ?? query.layerMask
        });
    }
    closestSurfacePoint(query) {
        const candidates = [];
        for (const context of this.collectBindingContexts({
            role: 'surface',
            ownerAssetId: query.ownerAssetId,
            ownerKind: query.ownerKind,
            worldId: query.worldId,
            layerMask: query.layerMask,
            surfaceUsage: query.surfaceUsage
        })){
            const localPoint = query.point.clone().applyMatrix4(getInverseOwnerMatrix(context.ownerObject));
            const backend = context.representation.backendInstance;
            const hit = backend.closestPoint(localPoint, query.maxDistance);
            if (!hit) continue;
            const worldPoint = hit.point.clone().applyMatrix4(context.ownerObject.matrixWorld);
            candidates.push(this.toSurfaceHit(hit, context, query.surfaceUsage, query.point.distanceTo(worldPoint)));
        }
        return pickBestSurfaceHit(candidates, this.bindingStore);
    }
    overlapCollisionSphere(query) {
        return this.routeCollisionSphere(query);
    }
    overlapCollisionCapsule(query) {
        return this.routeCollisionCapsuleOverlap(query);
    }
    resolveCollisionCapsule(query) {
        return this.routeCollisionCapsuleResolve(query);
    }
    sweepCollisionCapsule(query) {
        return this.routeCollisionCapsuleSweep(query);
    }
    closestCollisionPoint(query) {
        return this.routeCollisionClosestPoint(query);
    }
    resolveCollisionGround(query) {
        return this.routeCollisionGround(query);
    }
    projectNavigationPoint(query) {
        return this.routeNavigationPoint(query);
    }
    resolveNavigationMotion(query) {
        return this.routeNavigationMotion(query);
    }
    update() {
        this.syncOcclusionDepthWriters();
        this.syncDebugOverlays();
    }
    dispose() {
        if (this.disposed) return;
        this.disposed = true;
        this.options.events.off('asset.mounted', this.handleAssetMounted);
        this.options.events.off('asset.unmounted', this.handleAssetUnmounted);
        this.options.events.off('asset.visibilityChanged', this.handleAssetVisibilityChanged);
        this.options.events.off('asset.disposed', this.handleAssetDisposed);
        this.clearOcclusionDepthWriters();
        this.clearDebugInstances();
        for (const world of this.worldStore.clear())for (const representation of Object.values(world.representations)){
            representation.backendInstance?.dispose();
            disposeDebugObject(representation.debugPrototype);
        }
        this.buildPipeline.dispose();
    }
    routeCollisionSphere(query) {
        const candidates = [];
        for (const context of this.collectBindingContexts({
            role: 'collision',
            ownerAssetId: query.ownerAssetId,
            ownerKind: query.ownerKind,
            worldId: query.worldId,
            layerMask: query.layerMask
        })){
            const scale = getOwnerScale(context.ownerObject);
            const localSphere = new __WEBPACK_EXTERNAL_MODULE_three__.Sphere(query.sphere.center.clone().applyMatrix4(getInverseOwnerMatrix(context.ownerObject)), query.sphere.radius / scale);
            const backend = context.representation.backendInstance;
            const hit = backend.overlapSphere(localSphere);
            if (!!hit) candidates.push(this.toCollisionHit(hit, context, query.sphere.center.distanceTo(hit.point.clone().applyMatrix4(context.ownerObject.matrixWorld)), scale));
        }
        return pickBestCollisionHit(candidates, this.bindingStore);
    }
    routeCollisionCapsuleOverlap(query) {
        const candidates = [];
        for (const context of this.collectBindingContexts({
            role: 'collision',
            ownerAssetId: query.ownerAssetId,
            ownerKind: query.ownerKind,
            worldId: query.worldId,
            layerMask: query.layerMask
        })){
            const scale = getOwnerScale(context.ownerObject);
            const localCapsule = createLocalCapsule(context.ownerObject, query.capsule, scale);
            const backend = context.representation.backendInstance;
            const hit = backend.overlapCapsule(localCapsule);
            if (!!hit) candidates.push(this.toCollisionHit(hit, context, query.capsule.start.distanceTo(hit.point.clone().applyMatrix4(context.ownerObject.matrixWorld)), scale));
        }
        return pickBestCollisionHit(candidates, this.bindingStore);
    }
    routeCollisionCapsuleResolve(query) {
        const workingCapsule = cloneWorldCapsule(query.capsule);
        const appliedMotion = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        const maxIterations = Math.max(1, query.maxIterations ?? 8);
        const skinWidth = Math.max(0, query.skinWidth ?? 0);
        let lastHit = null;
        let iterationCount = 0;
        for(; iterationCount < maxIterations; iterationCount += 1){
            const hit = this.routeCollisionCapsuleOverlap({
                ...query,
                capsule: workingCapsule
            });
            if (!hit) break;
            const normal = normalizeWorldHitNormal(hit);
            const penetrationDepth = Math.max(hit.penetrationDepth ?? 0, 0);
            if (!normal || penetrationDepth <= 1e-8) {
                lastHit = hit;
                break;
            }
            const correction = normal.multiplyScalar(penetrationDepth + skinWidth);
            translateWorldCapsule(workingCapsule, correction);
            appliedMotion.add(correction);
            lastHit = hit;
        }
        if (!lastHit || appliedMotion.lengthSq() <= 1e-12) return null;
        const separationNormal = appliedMotion.clone().normalize();
        return {
            ...lastHit,
            distance: appliedMotion.length(),
            penetrationDepth: appliedMotion.length(),
            separationNormal,
            resolvedCapsule: cloneWorldCapsule(workingCapsule),
            appliedMotion,
            iterationCount
        };
    }
    routeCollisionCapsuleSweep(query) {
        const candidates = [];
        for (const context of this.collectBindingContexts({
            role: 'collision',
            ownerAssetId: query.ownerAssetId,
            ownerKind: query.ownerKind,
            worldId: query.worldId,
            layerMask: query.layerMask
        })){
            const inverse = getInverseOwnerMatrix(context.ownerObject);
            const scale = getOwnerScale(context.ownerObject);
            const localCapsule = createLocalCapsule(context.ownerObject, query.capsule, scale);
            const localStart = localCapsule.start;
            const localMotion = query.capsule.start.clone().add(query.motion).applyMatrix4(inverse).sub(localStart);
            const backend = context.representation.backendInstance;
            const hit = backend.sweepCapsule(localCapsule, localMotion, query.maxSteps);
            if (!!hit) candidates.push(this.toCollisionHit(hit, context, hit.distance * scale, scale));
        }
        return pickBestCollisionHit(candidates, this.bindingStore);
    }
    routeCollisionClosestPoint(query) {
        const candidates = [];
        for (const context of this.collectBindingContexts({
            role: 'collision',
            ownerAssetId: query.ownerAssetId,
            ownerKind: query.ownerKind,
            worldId: query.worldId,
            layerMask: query.layerMask
        })){
            const inverse = getInverseOwnerMatrix(context.ownerObject);
            const scale = getOwnerScale(context.ownerObject);
            const localPoint = query.point.clone().applyMatrix4(inverse);
            const backend = context.representation.backendInstance;
            const hit = backend.closestPoint(localPoint, void 0 !== query.maxDistance ? query.maxDistance / scale : void 0);
            if (!hit) continue;
            const worldPoint = hit.point.clone().applyMatrix4(context.ownerObject.matrixWorld);
            candidates.push(this.toCollisionHit(hit, context, query.point.distanceTo(worldPoint), scale));
        }
        return pickBestCollisionHit(candidates, this.bindingStore);
    }
    routeCollisionGround(query) {
        const candidates = [];
        for (const context of this.collectBindingContexts({
            role: 'collision',
            ownerAssetId: query.ownerAssetId,
            ownerKind: query.ownerKind,
            worldId: query.worldId,
            layerMask: query.layerMask
        })){
            const inverse = getInverseOwnerMatrix(context.ownerObject);
            const scale = getOwnerScale(context.ownerObject);
            const localOrigin = query.origin.clone().applyMatrix4(inverse);
            const localDown = query.down ? query.origin.clone().add(query.down).applyMatrix4(inverse).sub(localOrigin) : void 0;
            const backend = context.representation.backendInstance;
            const hit = backend.resolveGround(localOrigin, localDown, void 0 !== query.maxDistance ? query.maxDistance / scale : void 0, query.maxSlopeAngle);
            if (!!hit) candidates.push(this.toCollisionGroundHit(hit, context, query.origin.distanceTo(hit.point.clone().applyMatrix4(context.ownerObject.matrixWorld)), scale));
        }
        return pickBestCollisionGroundHit(candidates, this.bindingStore);
    }
    routeNavigationPoint(query) {
        const candidates = [];
        for (const context of this.collectBindingContexts({
            role: 'navigation',
            ownerAssetId: query.ownerAssetId,
            ownerKind: query.ownerKind,
            worldId: query.worldId,
            layerMask: query.layerMask
        })){
            const inverse = getInverseOwnerMatrix(context.ownerObject);
            const scale = getOwnerScale(context.ownerObject);
            const localPoint = query.point.clone().applyMatrix4(inverse);
            const backend = context.representation.backendInstance;
            const hit = backend.projectPoint(localPoint, void 0 !== query.maxDistance ? query.maxDistance / scale : void 0, query.requiredTags, query.blockedTags);
            if (!hit) continue;
            const worldPoint = hit.point.clone().applyMatrix4(context.ownerObject.matrixWorld);
            candidates.push(this.toNavigationHit(hit, context, query.point.distanceTo(worldPoint)));
        }
        return pickBestNavigationHit(candidates, this.bindingStore);
    }
    routeNavigationMotion(query) {
        const candidates = [];
        for (const context of this.collectBindingContexts({
            role: 'navigation',
            ownerAssetId: query.ownerAssetId,
            ownerKind: query.ownerKind,
            worldId: query.worldId,
            layerMask: query.layerMask
        })){
            const inverse = getInverseOwnerMatrix(context.ownerObject);
            const scale = getOwnerScale(context.ownerObject);
            const localStart = query.start.clone().applyMatrix4(inverse);
            const localMotion = query.start.clone().add(query.motion).applyMatrix4(inverse).sub(localStart);
            const backend = context.representation.backendInstance;
            const hit = backend.resolveMotion(localStart, localMotion, void 0 !== query.maxDistance ? query.maxDistance / scale : void 0, query.requiredTags, query.blockedTags, query.samples);
            if (!!hit) candidates.push(this.toNavigationMotionResult(hit, context));
        }
        return pickBestNavigationMotionResult(candidates, this.bindingStore);
    }
    async buildRepresentation(worldId, worldGeneration, role, request, signal) {
        try {
            const built = await this.buildPipeline.buildRepresentation(role, request, signal);
            const representation = this.worldStore.markRepresentationReady(worldId, role, built, worldGeneration);
            if (!representation) {
                built.backend.dispose();
                return;
            }
            this.emitRepresentationReady(worldId, role);
            this.emitBindingUpdatesForWorld(worldId);
            this.syncOcclusionDepthWriters();
            this.syncDebugOverlays();
        } catch (error) {
            const normalized = normalizeError(error);
            const representation = this.worldStore.markRepresentationError(worldId, role, normalized, worldGeneration);
            if (!representation) return;
            this.emitRepresentationError(worldId, role, normalized);
            this.emitBindingUpdatesForWorld(worldId);
            this.syncOcclusionDepthWriters();
            this.syncDebugOverlays();
        }
    }
    collectBindingContexts(options) {
        const records = this.bindingStore.filter({
            ownerAssetId: options.ownerAssetId,
            ownerKind: options.ownerKind,
            worldId: options.worldId,
            representationRole: options.role,
            surfaceUsage: options.surfaceUsage
        }, this.getRepresentationState);
        const contexts = [];
        for (const binding of records){
            const world = this.worldStore.getRecord(binding.worldId);
            const representation = world?.representations[options.role];
            if (!world || !representation || 'ready' !== representation.state || !representation.backendInstance) continue;
            const snapshot = this.bindingStore.snapshot(binding, this.getRepresentationState);
            if (!snapshot.availabilityByRole[options.role]) continue;
            const ownerHandle = this.options.resolveOwnerHandle(binding.ownerKind, binding.ownerAssetId);
            const ownerObject = ownerHandle?.object3D ?? null;
            if (!!ownerHandle && !!ownerObject) {
                if (void 0 === options.layerMask || (ownerObject.layers.mask & options.layerMask) !== 0) {
                    ownerObject.updateMatrixWorld(true);
                    contexts.push({
                        binding,
                        snapshot,
                        ownerHandle,
                        ownerObject,
                        world,
                        representation
                    });
                }
            }
        }
        return contexts;
    }
    toSurfaceHit(hit, context, surfaceUsage, distance) {
        const worldMatrix = context.ownerObject.matrixWorld;
        return {
            worldId: context.binding.worldId,
            bindingId: context.binding.id,
            ownerAssetId: context.binding.ownerAssetId,
            ownerKind: context.binding.ownerKind,
            representationRole: 'surface',
            surfaceUsage,
            point: hit.point.clone().applyMatrix4(worldMatrix),
            distance,
            normal: hit.normal?.clone().transformDirection(worldMatrix),
            faceIndex: hit.faceIndex,
            metadata: hit.metadata,
            raw: hit.raw
        };
    }
    toCollisionHit(hit, context, distance, scale) {
        const worldMatrix = context.ownerObject.matrixWorld;
        return {
            worldId: context.binding.worldId,
            bindingId: context.binding.id,
            ownerAssetId: context.binding.ownerAssetId,
            ownerKind: context.binding.ownerKind,
            representationRole: 'collision',
            point: hit.point.clone().applyMatrix4(worldMatrix),
            distance,
            normal: hit.normal?.clone().transformDirection(worldMatrix),
            faceIndex: hit.faceIndex,
            metadata: hit.metadata,
            penetrationDepth: void 0 !== hit.penetrationDepth ? hit.penetrationDepth * scale : void 0,
            travelDistance: void 0 !== hit.travelDistance ? hit.travelDistance * scale : void 0,
            separationNormal: hit.separationNormal?.clone().transformDirection(worldMatrix),
            raw: hit.raw
        };
    }
    toCollisionGroundHit(hit, context, distance, scale) {
        return {
            ...this.toCollisionHit(hit, context, distance, scale),
            slopeAngle: hit.slopeAngle
        };
    }
    toNavigationHit(hit, context, distance) {
        const worldMatrix = context.ownerObject.matrixWorld;
        return {
            worldId: context.binding.worldId,
            bindingId: context.binding.id,
            ownerAssetId: context.binding.ownerAssetId,
            ownerKind: context.binding.ownerKind,
            representationRole: 'navigation',
            point: hit.point.clone().applyMatrix4(worldMatrix),
            distance,
            normal: hit.normal?.clone().transformDirection(worldMatrix),
            faceIndex: hit.faceIndex,
            metadata: hit.metadata,
            semanticTags: hit.semanticTags,
            walkable: hit.walkable,
            raw: hit.raw
        };
    }
    toNavigationMotionResult(hit, context) {
        const worldMatrix = context.ownerObject.matrixWorld;
        const resolvedPoint = hit.resolvedPoint.clone().applyMatrix4(worldMatrix);
        const startPoint = hit.resolvedPoint.clone().sub(hit.appliedMotion).applyMatrix4(worldMatrix);
        return {
            ...this.toNavigationHit(hit, context, hit.appliedMotion.length()),
            resolvedPoint,
            appliedMotion: resolvedPoint.clone().sub(startPoint),
            blocked: hit.blocked
        };
    }
    resolveOwnerState(ownerKind, ownerAssetId) {
        const ownerHandle = this.options.resolveOwnerHandle(ownerKind, ownerAssetId);
        const ownerObject = ownerHandle?.object3D ?? null;
        return {
            mounted: !!ownerObject?.parent,
            visible: ownerHandle?.visible ?? false
        };
    }
    emitRepresentationReady(worldId, role) {
        const representation = this.worldStore.getRepresentationRecord(worldId, role);
        if (!representation) return;
        this.options.events.emit('spatial.representationReady', {
            worldId,
            representationRole: role,
            representation: cloneRepresentationSnapshot(representation)
        });
    }
    emitRepresentationError(worldId, role, error) {
        const representation = this.worldStore.getRepresentationRecord(worldId, role);
        if (!representation) return;
        this.options.events.emit('spatial.representationError', {
            worldId,
            representationRole: role,
            representation: cloneRepresentationSnapshot(representation),
            error
        });
    }
    emitBindingUpdatesForWorld(worldId) {
        const bindings = this.bindingStore.filter({
            worldId,
            includeInactive: true
        }, this.getRepresentationState);
        this.emitBindingUpdates('updated', bindings);
    }
    emitBindingUpdates(action, bindings) {
        for (const binding of bindings)this.emitBindingChanged(action, binding);
    }
    emitBindingChanged(action, record) {
        const snapshot = this.bindingStore.snapshot(record, this.getRepresentationState);
        this.options.events.emit('spatial.bindingChanged', {
            action,
            binding: snapshot,
            ownerAssetId: record.ownerAssetId,
            ownerKind: record.ownerKind,
            worldId: record.worldId
        });
    }
    syncOcclusionDepthWriters() {
        const service = this.options.getSharedOcclusionDepthService?.() ?? null;
        if (!service) {
            this.clearOcclusionDepthWriters();
            return;
        }
        const activeKeys = new Set();
        for (const binding of this.bindingStore.filter({
            includeInactive: true
        }, this.getRepresentationState)){
            const role = binding.occlusionDepth.representationRole;
            if (!binding.occlusionDepth.enabled || !role) {
                this.removeOcclusionDepthWriterForBinding(binding.id);
                continue;
            }
            const snapshot = this.bindingStore.snapshot(binding, this.getRepresentationState);
            const representation = this.worldStore.getRepresentationRecord(binding.worldId, role);
            const geometry = representation?.backendInstance?.getDepthGeometry?.() ?? null;
            const ownerHandle = this.options.resolveOwnerHandle(binding.ownerKind, binding.ownerAssetId);
            const ownerObject = ownerHandle?.object3D ?? null;
            if (!representation || 'ready' !== representation.state || !snapshot.availabilityByRole[role] || !geometry || !ownerHandle || !ownerObject) {
                this.removeOcclusionDepthWriterForBinding(binding.id);
                continue;
            }
            const key = createOcclusionDepthWriterKey(binding.id);
            activeKeys.add(key);
            const existing = this.occlusionDepthWriters.get(key);
            if (existing && (existing.geometry !== geometry || existing.representationRole !== role || existing.ownerObject !== ownerObject)) this.removeOcclusionDepthWriterForBinding(binding.id);
            if (!this.occlusionDepthWriters.has(key)) {
                this.occlusionDepthWriters.set(key, createSpatialOcclusionDepthWriterRecord({
                    binding,
                    geometry,
                    ownerObject,
                    service
                }));
                this.options.onSharedOcclusionDepthChanged?.('sharedOcclusionDepth.writerChanged');
                continue;
            }
            const record = this.occlusionDepthWriters.get(key);
            if (!record) continue;
            const nextSignature = createOcclusionDepthWriterSignature(ownerObject, geometry);
            if (record.signature !== nextSignature) {
                record.signature = nextSignature;
                this.options.onSharedOcclusionDepthChanged?.('sharedOcclusionDepth.ownerChanged');
            }
        }
        for (const key of Array.from(this.occlusionDepthWriters.keys()))if (!activeKeys.has(key)) this.removeOcclusionDepthWriterByKey(key);
    }
    clearOcclusionDepthWriters() {
        for (const key of Array.from(this.occlusionDepthWriters.keys()))this.removeOcclusionDepthWriterByKey(key);
    }
    removeOcclusionDepthWriterForBinding(bindingId) {
        this.removeOcclusionDepthWriterByKey(createOcclusionDepthWriterKey(bindingId));
    }
    removeOcclusionDepthWriterByKey(key) {
        const record = this.occlusionDepthWriters.get(key);
        if (!record) return;
        this.occlusionDepthWriters.delete(key);
        record.registration.dispose();
        record.mesh.removeFromParent();
        record.material.dispose();
        this.options.onSharedOcclusionDepthChanged?.('sharedOcclusionDepth.writerChanged');
    }
    syncDebugOverlays() {
        const debugRoot = this.options.getDebugRoot?.() ?? null;
        if (!debugRoot) {
            this.clearDebugInstances();
            return;
        }
        const activeKeys = new Set();
        for (const binding of this.bindingStore.filter({
            includeInactive: true
        }, this.getRepresentationState)){
            const snapshot = this.bindingStore.snapshot(binding, this.getRepresentationState);
            const ownerHandle = this.options.resolveOwnerHandle(binding.ownerKind, binding.ownerAssetId);
            const ownerObject = ownerHandle?.object3D ?? null;
            if (!ownerObject) {
                this.removeDebugInstancesForBinding(binding.id);
                continue;
            }
            ownerObject.updateMatrixWorld(true);
            for (const role of binding.representationRoles){
                const representation = this.worldStore.getRepresentationRecord(binding.worldId, role);
                const debug = representation?.debug;
                if (!representation || 'ready' !== representation.state || !representation.backendInstance || !debug || !representation.debugPrototype || !snapshot.availabilityByRole[role] || !debug.meshVisible && !debug.boundsVisible) {
                    this.removeDebugInstance(binding.id, role);
                    continue;
                }
                const key = createDebugInstanceKey(binding.id, role);
                activeKeys.add(key);
                let instance = this.debugInstances.get(key);
                if (instance && this.debugInstanceRevisions.get(key) !== representation.debugRevision) {
                    this.removeDebugInstance(binding.id, role);
                    instance = void 0;
                }
                if (!instance) {
                    const created = representation.backendInstance.createDebugPrototype(`${binding.id}-${role}-debug`, debug);
                    if (!created) continue;
                    instance = created;
                    this.debugInstances.set(key, instance);
                    this.debugInstanceRevisions.set(key, representation.debugRevision);
                    debugRoot.add(instance);
                }
                if (instance.parent !== debugRoot) {
                    instance.removeFromParent();
                    debugRoot.add(instance);
                }
                syncDebugInstanceTransform(instance, ownerObject, debugRoot);
            }
        }
        for (const key of Array.from(this.debugInstances.keys()))if (!activeKeys.has(key)) {
            const instance = this.debugInstances.get(key);
            if (!instance) continue;
            this.debugInstances.delete(key);
            disposeDebugObject(instance);
        }
    }
    clearDebugInstances() {
        for (const instance of this.debugInstances.values())disposeDebugObject(instance);
        this.debugInstances.clear();
        this.debugInstanceRevisions.clear();
    }
    removeDebugInstancesForWorld(worldId) {
        for (const binding of this.bindingStore.filter({
            worldId,
            includeInactive: true
        }, this.getRepresentationState))this.removeDebugInstancesForBinding(binding.id);
    }
    removeDebugInstancesForBinding(bindingId) {
        this.removeDebugInstance(bindingId, 'surface');
        this.removeDebugInstance(bindingId, 'collision');
        this.removeDebugInstance(bindingId, 'navigation');
    }
    removeDebugInstance(bindingId, role) {
        const key = createDebugInstanceKey(bindingId, role);
        const instance = this.debugInstances.get(key);
        if (!instance) return;
        this.debugInstances.delete(key);
        this.debugInstanceRevisions.delete(key);
        disposeDebugObject(instance);
    }
}
function getRequestedRepresentations(request) {
    return [
        'surface',
        'collision',
        'navigation'
    ].filter((role)=>!!request.representations[role]);
}
function inheritWorldCredentials(request, withCredentials) {
    if (void 0 !== request.withCredentials || void 0 === withCredentials) return request;
    return {
        ...request,
        withCredentials
    };
}
function createSpatialOcclusionDepthWriterRecord(options) {
    const material = new __WEBPACK_EXTERNAL_MODULE_three__.MeshBasicMaterial({
        colorWrite: false,
        depthTest: true,
        depthWrite: true,
        side: __WEBPACK_EXTERNAL_MODULE_three__.DoubleSide
    });
    const mesh = new __WEBPACK_EXTERNAL_MODULE_three__.Mesh(options.geometry, material);
    mesh.name = `${options.binding.id}-occlusion-depth`;
    mesh.frustumCulled = false;
    mesh.matrixAutoUpdate = false;
    const writer = {
        id: mesh.name,
        priority: -options.binding.priority,
        collect: ()=>{
            options.ownerObject.updateMatrixWorld(true);
            mesh.matrix.copy(options.ownerObject.matrixWorld);
            mesh.matrixWorld.copy(options.ownerObject.matrixWorld);
            mesh.layers.mask = options.ownerObject.layers.mask;
            mesh.visible = options.ownerObject.visible;
            return mesh.visible ? [
                {
                    object: mesh
                }
            ] : [];
        }
    };
    return {
        bindingId: options.binding.id,
        representationRole: options.binding.occlusionDepth.representationRole ?? 'surface',
        geometry: options.geometry,
        ownerObject: options.ownerObject,
        mesh,
        material,
        writer,
        registration: options.service.registerWriter(writer),
        signature: createOcclusionDepthWriterSignature(options.ownerObject, options.geometry)
    };
}
function createOcclusionDepthWriterKey(bindingId) {
    return `${bindingId}:occlusion-depth`;
}
function createOcclusionDepthWriterSignature(ownerObject, geometry) {
    ownerObject.updateMatrixWorld(true);
    return [
        ownerObject.visible ? '1' : '0',
        ownerObject.layers.mask,
        geometry.id,
        ownerObject.matrixWorld.elements.map((value)=>value.toFixed(6)).join(',')
    ].join('|');
}
function createRequestedDebugSnapshot(role, request) {
    const debug = request.representations[role]?.debug;
    return {
        prototypeName: `${role}-prototype`,
        meshVisible: debug?.meshVisible ?? false,
        boundsVisible: debug?.boundsVisible ?? false,
        boundsDepth: debug?.boundsDepth ?? 10
    };
}
function getInverseOwnerMatrix(ownerObject) {
    return new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4().copy(ownerObject.matrixWorld).invert();
}
function getOwnerScale(ownerObject) {
    const scale = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
    ownerObject.getWorldScale(scale);
    return Math.max(Math.abs(scale.x), Math.abs(scale.y), Math.abs(scale.z), 1e-8);
}
function createLocalCapsule(ownerObject, capsule, scale = getOwnerScale(ownerObject)) {
    const inverse = getInverseOwnerMatrix(ownerObject);
    return {
        start: capsule.start.clone().applyMatrix4(inverse),
        end: capsule.end.clone().applyMatrix4(inverse),
        radius: capsule.radius / scale
    };
}
function cloneWorldCapsule(capsule) {
    return {
        start: capsule.start.clone(),
        end: capsule.end.clone(),
        radius: capsule.radius
    };
}
function translateWorldCapsule(capsule, motion) {
    capsule.start.add(motion);
    capsule.end.add(motion);
}
function normalizeWorldHitNormal(hit) {
    const source = hit.separationNormal ?? hit.normal;
    if (!source || source.lengthSq() <= 1e-10) return null;
    return source.clone().normalize();
}
function cloneRepresentationSnapshot(record) {
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
function pickBestSurfaceHit(hits, bindingStore) {
    hits.sort((left, right)=>compareHits(left, right, bindingStore));
    return hits[0] ?? null;
}
function pickBestCollisionHit(hits, bindingStore) {
    hits.sort((left, right)=>compareHits(left, right, bindingStore));
    return hits[0] ?? null;
}
function pickBestCollisionGroundHit(hits, bindingStore) {
    hits.sort((left, right)=>compareHits(left, right, bindingStore));
    return hits[0] ?? null;
}
function pickBestNavigationHit(hits, bindingStore) {
    hits.sort((left, right)=>compareHits(left, right, bindingStore));
    return hits[0] ?? null;
}
function pickBestNavigationMotionResult(hits, bindingStore) {
    hits.sort((left, right)=>compareHits(left, right, bindingStore));
    return hits[0] ?? null;
}
function compareHits(left, right, bindingStore) {
    const leftBinding = bindingStore.get(left.bindingId);
    const rightBinding = bindingStore.get(right.bindingId);
    const priorityDelta = (rightBinding?.priority ?? 0) - (leftBinding?.priority ?? 0);
    if (0 !== priorityDelta) return priorityDelta;
    const leftTravel = left.travelDistance ?? left.distance;
    const rightTravel = right.travelDistance ?? right.distance;
    if (leftTravel !== rightTravel) return leftTravel - rightTravel;
    return left.distance - right.distance;
}
function createDebugInstanceKey(bindingId, role) {
    return `${bindingId}:${role}`;
}
function syncDebugInstanceTransform(instance, ownerObject, debugRoot) {
    const relativeMatrix = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4().copy(debugRoot.matrixWorld).invert().multiply(ownerObject.matrixWorld);
    relativeMatrix.decompose(instance.position, instance.quaternion, instance.scale);
    syncLayersRecursive(instance, ownerObject.layers.mask);
    instance.visible = ownerObject.visible;
    instance.updateMatrix();
    instance.updateMatrixWorld(true);
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
function syncLayersRecursive(object3D, mask) {
    object3D.layers.mask = mask;
    for (const child of object3D.children)syncLayersRecursive(child, mask);
}
function normalizeError(error) {
    if (error instanceof Error) return error;
    return new Error(String(error));
}
export { SpatialQueryServiceImpl };
