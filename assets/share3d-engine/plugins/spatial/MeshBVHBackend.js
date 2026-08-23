import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE_three_mesh_bvh_0714967e__ from "three-mesh-bvh";
import * as __WEBPACK_EXTERNAL_MODULE_three_mesh_bvh_worker_ba8dffd3__ from "three-mesh-bvh/worker";
const sharedMeshBVHCoreEntries = new Map();
class MeshBVHBackend {
    static async create(artifact) {
        const sharedCore = await acquireSharedMeshBVHCore(artifact);
        return new MeshBVHBackend(sharedCore);
    }
    constructor(sharedCore){
        this.kind = 'mesh-bvh';
        this.disposed = false;
        this.sharedCore = sharedCore;
        this.geometry = this.sharedCore.geometry;
        this.bvh = this.sharedCore.bvh;
        this.triangleMetadata = this.sharedCore.triangleMetadata;
    }
    getDepthGeometry() {
        return this.geometry;
    }
    raycastFirst(ray) {
        const intersection = this.bvh.raycastFirst(ray, __WEBPACK_EXTERNAL_MODULE_three__.DoubleSide, 0, Number.POSITIVE_INFINITY);
        if (!intersection) return null;
        return this.createSurfaceHit(intersection.point.clone(), intersection.distance, intersection.faceIndex ?? void 0, intersection.face?.normal?.clone(), intersection);
    }
    closestPoint(point, maxDistance = Number.POSITIVE_INFINITY) {
        const target = {
            point: new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(),
            distance: Number.POSITIVE_INFINITY,
            faceIndex: -1
        };
        const result = this.bvh.closestPointToPoint(point, target, 0, maxDistance);
        if (!result?.point || void 0 === result.distance) return null;
        return this.createSurfaceHit(result.point.clone(), result.distance, result.faceIndex, void 0 !== result.faceIndex ? this.getFaceNormal(result.faceIndex) : void 0, result);
    }
    overlapSphere(sphere) {
        const workingSphere = sphere.clone();
        const originalCenter = sphere.center.clone();
        const collector = {
            hit: null,
            count: 0
        };
        this.forEachSphereCandidateTriangle(sphere, (triangle, triangleIndex)=>{
            const hit = triangleSphereIntersect(workingSphere, triangle);
            if (!hit || hit.depth <= CONTACT_EPSILON) return;
            collector.count += 1;
            workingSphere.center.addScaledVector(hit.normal, hit.depth);
            if (!collector.hit || hit.depth > collector.hit.depth) collector.hit = {
                ...hit,
                faceIndex: triangleIndex,
                queryDistance: Math.max(0, sphere.radius - hit.depth)
            };
        });
        const resolvedHit = collector.hit;
        if (!resolvedHit) return null;
        const collisionVector = workingSphere.center.sub(originalCenter);
        const penetrationDepth = collisionVector.length();
        if (penetrationDepth <= CONTACT_EPSILON) return null;
        const separationNormal = collisionVector.normalize();
        return {
            ...this.createCollisionHit(resolvedHit.point.clone(), resolvedHit.queryDistance, resolvedHit.faceIndex, resolvedHit.normal, {
                sphere,
                hitCount: collector.count
            }),
            penetrationDepth,
            separationNormal
        };
    }
    overlapCapsule(capsule) {
        const workingCapsule = cloneCapsule(capsule);
        const originalCenter = getCapsuleCenter(capsule, new __WEBPACK_EXTERNAL_MODULE_three__.Vector3());
        const collector = {
            hit: null,
            count: 0
        };
        this.forEachCapsuleCandidateTriangle(capsule, (triangle, triangleIndex)=>{
            const hit = triangleCapsuleIntersect(workingCapsule, triangle);
            if (!hit || hit.depth <= CONTACT_EPSILON) return;
            collector.count += 1;
            translateCapsuleInPlace(workingCapsule, hit.normal.clone().multiplyScalar(hit.depth));
            if (!collector.hit || hit.depth > collector.hit.depth) collector.hit = {
                ...hit,
                faceIndex: triangleIndex,
                queryDistance: Math.max(0, capsule.radius - hit.depth)
            };
        });
        const resolvedHit = collector.hit;
        if (!resolvedHit) return null;
        const collisionVector = getCapsuleCenter(workingCapsule, new __WEBPACK_EXTERNAL_MODULE_three__.Vector3()).sub(originalCenter);
        const penetrationDepth = collisionVector.length();
        if (penetrationDepth <= CONTACT_EPSILON) return null;
        return {
            ...this.createCollisionHit(resolvedHit.point.clone(), resolvedHit.queryDistance, resolvedHit.faceIndex, resolvedHit.normal, {
                capsule,
                hitCount: collector.count
            }),
            penetrationDepth,
            separationNormal: collisionVector.normalize()
        };
    }
    sweepCapsule(capsule, motion, maxSteps = 24) {
        const overlap = this.overlapCapsule(capsule);
        if (overlap) return {
            ...overlap,
            travelDistance: 0
        };
        const motionLength = motion.length();
        if (motionLength <= 1e-8) return null;
        const steps = Math.max(2, Math.round(maxSteps));
        let low = 0;
        let high = 1;
        let hit = null;
        for(let step = 1; step <= steps; step += 1){
            const t = step / steps;
            const moved = translateCapsule(capsule, motion, t);
            const candidate = this.overlapCapsule(moved);
            if (candidate) {
                low = (step - 1) / steps;
                high = t;
                hit = candidate;
                break;
            }
        }
        if (!hit) return null;
        for(let iteration = 0; iteration < 5; iteration += 1){
            const mid = (low + high) * 0.5;
            const moved = translateCapsule(capsule, motion, mid);
            const candidate = this.overlapCapsule(moved);
            if (candidate) {
                high = mid;
                hit = candidate;
            } else low = mid;
        }
        return {
            ...hit,
            travelDistance: motionLength * high
        };
    }
    resolveGround(origin, down = DEFAULT_DOWN, maxDistance = Number.POSITIVE_INFINITY, maxSlopeAngle) {
        const direction = down.clone();
        if (direction.lengthSq() <= 1e-8) return null;
        direction.normalize();
        const hit = this.raycastFirst(new __WEBPACK_EXTERNAL_MODULE_three__.Ray(origin.clone(), direction));
        if (!hit || hit.distance > maxDistance) return null;
        const slopeAngle = hit.normal ? __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.radToDeg(hit.normal.angleTo(direction.clone().negate())) : void 0;
        if (void 0 !== slopeAngle && void 0 !== maxSlopeAngle && slopeAngle > maxSlopeAngle) return null;
        return {
            ...this.createCollisionHit(hit.point, hit.distance, hit.faceIndex, hit.normal, hit.raw),
            slopeAngle
        };
    }
    projectPoint(point, maxDistance = Number.POSITIVE_INFINITY, requiredTags, blockedTags) {
        const closest = this.findClosestFilteredPoint(point, maxDistance, (metadata)=>isNavigationMetadataAllowed(metadata, requiredTags, blockedTags));
        if (!closest) return null;
        return {
            ...closest,
            semanticTags: closest.metadata?.semantic.tags ?? [],
            walkable: isMetadataWalkable(closest.metadata)
        };
    }
    resolveMotion(start, motion, maxDistance = Number.POSITIVE_INFINITY, requiredTags, blockedTags, samples = 12) {
        const totalSamples = Math.max(1, Math.round(samples));
        for(let step = totalSamples; step >= 0; step -= 1){
            const t = step / totalSamples;
            const candidatePoint = start.clone().addScaledVector(motion, t);
            const hit = this.projectPoint(candidatePoint, maxDistance, requiredTags, blockedTags);
            if (!!hit) return {
                ...hit,
                resolvedPoint: hit.point.clone(),
                appliedMotion: hit.point.clone().sub(start),
                blocked: step !== totalSamples
            };
        }
        return null;
    }
    createDebugPrototype(name, debug) {
        const root = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
        root.name = name;
        const mesh = createDebugMesh(this.geometry, `${name}-mesh`);
        mesh.visible = debug.meshVisible;
        root.add(mesh);
        const helper = createBoundsHelper(this.bvh, `${name}-bvh`, debug.boundsDepth);
        helper.visible = debug.boundsVisible;
        root.add(helper);
        root.visible = debug.meshVisible || debug.boundsVisible;
        return root;
    }
    dispose() {
        if (this.disposed) return;
        this.disposed = true;
        releaseSharedMeshBVHCore(this.sharedCore);
    }
    createSurfaceHit(point, distance, faceIndex, normal, raw) {
        return {
            point,
            distance,
            faceIndex,
            normal: normal?.clone(),
            metadata: void 0 !== faceIndex ? this.triangleMetadata[faceIndex] : void 0,
            raw
        };
    }
    createCollisionHit(point, distance, faceIndex, normal, raw) {
        return {
            point,
            distance,
            faceIndex,
            normal: normal?.clone(),
            metadata: void 0 !== faceIndex ? this.triangleMetadata[faceIndex] : void 0,
            raw
        };
    }
    findClosestFilteredPoint(point, maxDistance, predicate) {
        const triangle = new __WEBPACK_EXTERNAL_MODULE_three__.Triangle();
        const closestPoint = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        let bestDistanceSq = Number.isFinite(maxDistance) ? maxDistance * maxDistance : Number.POSITIVE_INFINITY;
        let bestHit = null;
        for(let faceIndex = 0; faceIndex < this.triangleMetadata.length; faceIndex += 1){
            const metadata = this.triangleMetadata[faceIndex];
            if (!predicate(metadata)) continue;
            this.populateTriangle(faceIndex, triangle);
            triangle.closestPointToPoint(point, closestPoint);
            const distanceSq = closestPoint.distanceToSquared(point);
            if (distanceSq > bestDistanceSq) continue;
            const normal = triangle.getNormal(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3()).normalize();
            bestDistanceSq = distanceSq;
            bestHit = {
                point: closestPoint.clone(),
                distance: Math.sqrt(distanceSq),
                faceIndex,
                normal,
                metadata,
                semanticTags: metadata.semantic.tags,
                walkable: isMetadataWalkable(metadata)
            };
        }
        return bestHit;
    }
    getFaceNormal(faceIndex) {
        const triangle = new __WEBPACK_EXTERNAL_MODULE_three__.Triangle();
        this.populateTriangle(faceIndex, triangle);
        return triangle.getNormal(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3()).normalize();
    }
    forEachSphereCandidateTriangle(sphere, callback) {
        this.bvh.shapecast({
            intersectsBounds: (box)=>sphere.intersectsBox(box) ? __WEBPACK_EXTERNAL_MODULE_three_mesh_bvh_0714967e__.INTERSECTED : __WEBPACK_EXTERNAL_MODULE_three_mesh_bvh_0714967e__.NOT_INTERSECTED,
            intersectsTriangle: (triangle, triangleIndex)=>{
                callback(triangle, triangleIndex);
                return false;
            }
        });
    }
    forEachCapsuleCandidateTriangle(capsule, callback) {
        const queryBounds = getCapsuleBounds(capsule, scratchCapsuleBounds);
        this.bvh.shapecast({
            intersectsBounds: (box)=>queryBounds.intersectsBox(box) ? __WEBPACK_EXTERNAL_MODULE_three_mesh_bvh_0714967e__.INTERSECTED : __WEBPACK_EXTERNAL_MODULE_three_mesh_bvh_0714967e__.NOT_INTERSECTED,
            intersectsTriangle: (triangle, triangleIndex)=>{
                callback(triangle, triangleIndex);
                return false;
            }
        });
    }
    populateTriangle(faceIndex, target) {
        const position = this.geometry.getAttribute('position');
        const index = this.geometry.index;
        const first = 3 * faceIndex;
        const aIndex = index ? index.getX(first) : first;
        const bIndex = index ? index.getX(first + 1) : first + 1;
        const cIndex = index ? index.getX(first + 2) : first + 2;
        target.a.fromBufferAttribute(position, aIndex);
        target.b.fromBufferAttribute(position, bIndex);
        target.c.fromBufferAttribute(position, cIndex);
    }
}
function createDebugMesh(geometry, name) {
    const material = new __WEBPACK_EXTERNAL_MODULE_three__.MeshBasicMaterial({
        color: 0x17a34a,
        depthWrite: false,
        transparent: true,
        opacity: 0.2,
        wireframe: true
    });
    const mesh = new __WEBPACK_EXTERNAL_MODULE_three__.Mesh(geometry, material);
    mesh.name = name;
    mesh.frustumCulled = false;
    return mesh;
}
function createBoundsHelper(bvh, name, depth) {
    const helper = new __WEBPACK_EXTERNAL_MODULE_three_mesh_bvh_0714967e__.BVHHelper(bvh, normalizeBoundsDepth(depth));
    helper.name = name;
    helper.color.set(0xf97316);
    helper.opacity = 0.5;
    helper.displayEdges = true;
    helper.displayParents = false;
    helper.update();
    return helper;
}
function translateCapsule(capsule, motion, t) {
    const delta = motion.clone().multiplyScalar(t);
    return {
        start: capsule.start.clone().add(delta),
        end: capsule.end.clone().add(delta),
        radius: capsule.radius
    };
}
function triangleCapsuleIntersect(capsule, triangle) {
    scratchLine1.set(capsule.start, capsule.end);
    const distance = triangle.closestPointToSegment(scratchLine1, scratchPoint1, scratchPoint2);
    if (distance >= capsule.radius - CONTACT_EPSILON) return null;
    const normal = scratchPoint2.clone().sub(scratchPoint1);
    if (normal.lengthSq() <= LINE_EPSILON) normal.copy(triangle.getNormal(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3()));
    else normal.normalize();
    return {
        normal,
        point: scratchPoint1.clone(),
        depth: capsule.radius - distance
    };
}
function triangleSphereIntersect(sphere, triangle) {
    triangle.closestPointToPoint(sphere.center, scratchPoint1);
    const distance = scratchPoint1.distanceTo(sphere.center);
    if (distance >= sphere.radius - CONTACT_EPSILON) return null;
    const normal = sphere.center.clone().sub(scratchPoint1);
    if (normal.lengthSq() <= LINE_EPSILON) normal.copy(triangle.getNormal(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3()));
    else normal.normalize();
    return {
        normal,
        point: scratchPoint1.clone(),
        depth: sphere.radius - distance
    };
}
function getCapsuleBounds(capsule, target) {
    target.makeEmpty();
    target.expandByPoint(capsule.start);
    target.expandByPoint(capsule.end);
    target.expandByScalar(capsule.radius);
    return target;
}
function getCapsuleCenter(capsule, target) {
    return target.copy(capsule.start).add(capsule.end).multiplyScalar(0.5);
}
function cloneCapsule(capsule) {
    return {
        start: capsule.start.clone(),
        end: capsule.end.clone(),
        radius: capsule.radius
    };
}
function translateCapsuleInPlace(capsule, motion) {
    capsule.start.add(motion);
    capsule.end.add(motion);
}
function isMetadataWalkable(metadata) {
    if (!metadata) return true;
    if (metadata.semantic.blocked) return false;
    if (false === metadata.semantic.walkable) return false;
    return true;
}
function isNavigationMetadataAllowed(metadata, requiredTags, blockedTags) {
    if (!isMetadataWalkable(metadata)) return false;
    const tags = new Set(metadata?.semantic.tags ?? []);
    if (blockedTags?.some((tag)=>tags.has(tag))) return false;
    if (requiredTags?.length) return requiredTags.every((tag)=>tags.has(tag));
    return true;
}
function normalizeBoundsDepth(depth) {
    if (!Number.isFinite(depth)) return 10;
    return Math.max(1, Math.round(depth));
}
function acquireSharedMeshBVHCore(artifact) {
    const existing = sharedMeshBVHCoreEntries.get(artifact.source.key);
    if (existing?.core) {
        existing.refCount += 1;
        return Promise.resolve(existing.core);
    }
    if (existing?.building) return existing.building.then((core)=>{
        existing.refCount += 1;
        return core;
    });
    const entry = existing ?? {
        core: null,
        building: null,
        refCount: 0
    };
    sharedMeshBVHCoreEntries.set(artifact.source.key, entry);
    entry.building = buildSharedMeshBVHCore(artifact).then((core)=>{
        entry.core = core;
        entry.building = null;
        return core;
    }).catch((error)=>{
        entry.building = null;
        sharedMeshBVHCoreEntries.delete(artifact.source.key);
        throw error;
    });
    return entry.building.then((core)=>{
        entry.refCount += 1;
        return core;
    });
}
function releaseSharedMeshBVHCore(core) {
    const entry = sharedMeshBVHCoreEntries.get(core.key);
    if (!entry || entry.core !== core) return;
    entry.refCount = Math.max(0, entry.refCount - 1);
    if (entry.refCount > 0) return;
    entry.core.geometry.dispose();
    sharedMeshBVHCoreEntries.delete(core.key);
}
async function buildSharedMeshBVHCore(artifact) {
    const geometry = artifact.geometry.clone();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    const bvh = await createMeshBVH(geometry);
    return {
        key: artifact.source.key,
        geometry,
        bvh,
        triangleMetadata: artifact.triangleMetadata
    };
}
async function createMeshBVH(geometry) {
    const worker = createMeshBVHWorker();
    if (!worker) return createMeshBVHSync(geometry);
    try {
        return await worker.generate(geometry, MESH_BVH_BUILD_OPTIONS);
    } finally{
        worker.dispose();
    }
}
function createMeshBVHSync(geometry) {
    return new __WEBPACK_EXTERNAL_MODULE_three_mesh_bvh_0714967e__.MeshBVH(geometry, MESH_BVH_BUILD_OPTIONS);
}
function createMeshBVHWorker() {
    if ('undefined' == typeof Worker || 'undefined' == typeof SharedArrayBuffer || true !== globalThis.crossOriginIsolated) return null;
    try {
        return new __WEBPACK_EXTERNAL_MODULE_three_mesh_bvh_worker_ba8dffd3__.ParallelMeshBVHWorker();
    } catch  {
        return null;
    }
}
const MESH_BVH_BUILD_OPTIONS = {
    maxLeafSize: 10,
    setBoundingBox: true
};
const LINE_EPSILON = 1e-10;
const CONTACT_EPSILON = 1e-5;
new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 1, 0);
const DEFAULT_DOWN = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, -1);
const scratchCapsuleBounds = new __WEBPACK_EXTERNAL_MODULE_three__.Box3();
const scratchLine1 = new __WEBPACK_EXTERNAL_MODULE_three__.Line3();
const scratchPoint1 = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
const scratchPoint2 = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
export { MeshBVHBackend };
