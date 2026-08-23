import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_loaders_GLTFLoader_js_81322d5a__ from "three/examples/jsm/loaders/GLTFLoader.js";
import * as __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_loaders_PLYLoader_js_37f36f01__ from "three/examples/jsm/loaders/PLYLoader.js";
import * as __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_utils_BufferGeometryUtils_js_9f53b8c2__ from "three/examples/jsm/utils/BufferGeometryUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__MeshBVHBackend_js_0964f29b__ from "./MeshBVHBackend.js";
class SpatialBuildPipeline {
    constructor(loadingManager, options){
        this.artifactCache = new Map();
        this.loadingManager = loadingManager;
        this.withCredentials = options?.withCredentials ?? false;
    }
    dispose() {
        this.artifactCache.clear();
    }
    async buildRepresentation(role, request, signal) {
        throwIfAborted(signal);
        const artifact = await this.resolveArtifact(request);
        throwIfAborted(signal);
        const backend = await __WEBPACK_EXTERNAL_MODULE__MeshBVHBackend_js_0964f29b__.MeshBVHBackend.create(artifact);
        return {
            backend,
            format: artifact.source.format,
            bounds: artifact.bounds?.clone() ?? null,
            metadata: artifact.metadata,
            debug: createDebugSnapshot(role, request.debug),
            userData: Object.freeze({
                ...request.userData ?? {}
            })
        };
    }
    resolveArtifact(request) {
        const format = resolveFormat(request);
        const sourceRef = createSourceReference(request.source, format);
        const cached = this.artifactCache.get(sourceRef.key);
        if (cached) return cached;
        let pending;
        pending = this.normalizeArtifact(request, sourceRef).catch((error)=>{
            if (this.artifactCache.get(sourceRef.key) === pending) this.artifactCache.delete(sourceRef.key);
            throw error;
        });
        this.artifactCache.set(sourceRef.key, pending);
        return pending;
    }
    async normalizeArtifact(request, sourceRef) {
        const { source } = request;
        const withCredentials = this.withCredentials || true === request.withCredentials;
        if ('string' == typeof source) {
            if ('ply' === sourceRef.format) {
                const geometry = await this.createPlyLoader(withCredentials).loadAsync(source);
                return createArtifactFromGeometry(prepareGeometry(geometry, {
                    requireIndexedFaces: true
                }), sourceRef);
            }
            if ('glb' === sourceRef.format || 'gltf' === sourceRef.format) {
                const gltf = await this.createGltfLoader(withCredentials).loadAsync(source);
                return createArtifactFromObject(gltf.scene, sourceRef);
            }
            throw new Error(`Unsupported spatial source format for "${source}"`);
        }
        if (source instanceof __WEBPACK_EXTERNAL_MODULE_three__.BufferGeometry) return createArtifactFromGeometry(prepareGeometry(source, {
            requireIndexedFaces: false
        }), sourceRef);
        if (source instanceof __WEBPACK_EXTERNAL_MODULE_three__.Object3D) return createArtifactFromObject(source, sourceRef);
        throw new Error('Unsupported spatial world source');
    }
    createGltfLoader(withCredentials) {
        const loader = new __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_loaders_GLTFLoader_js_81322d5a__.GLTFLoader(this.loadingManager);
        loader.withCredentials = withCredentials;
        return loader;
    }
    createPlyLoader(withCredentials) {
        const loader = new __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_loaders_PLYLoader_js_37f36f01__.PLYLoader(this.loadingManager);
        loader.withCredentials = withCredentials;
        return loader;
    }
}
function createArtifactFromGeometry(geometry, source) {
    const semantic = extractSemanticMetadata(geometry.userData);
    const meshMetadata = createMeshMetadataSnapshot({
        meshId: geometry.uuid,
        meshName: geometry.name || geometry.uuid,
        nodeId: geometry.uuid,
        nodeName: geometry.name || geometry.uuid,
        groupRanges: createGroupRanges(geometry),
        semantic
    });
    const triangleMetadata = createTriangleMetadata(geometry, meshMetadata);
    const metadata = {
        source,
        meshMetadata: [
            meshMetadata
        ],
        semanticTags: semantic.tags
    };
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    return {
        source,
        geometry,
        bounds: geometry.boundingBox?.clone() ?? null,
        metadata,
        triangleMetadata
    };
}
function createArtifactFromObject(root, source) {
    root.updateMatrixWorld(true);
    const rootInverse = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4().copy(root.matrixWorld).invert();
    const geometries = [];
    const meshMetadata = [];
    const triangleMetadata = [];
    const semanticTags = new Set();
    root.traverse((object)=>{
        if (!(object instanceof __WEBPACK_EXTERNAL_MODULE_three__.Mesh) || !(object.geometry instanceof __WEBPACK_EXTERNAL_MODULE_three__.BufferGeometry)) return;
        const prepared = prepareGeometry(object.geometry, {
            requireIndexedFaces: false
        });
        const relativeMatrix = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4().copy(rootInverse).multiply(object.matrixWorld);
        prepared.applyMatrix4(relativeMatrix);
        prepared.computeBoundingBox();
        prepared.computeBoundingSphere();
        const semantic = extractSemanticMetadata(object.geometry.userData, object.userData);
        for (const tag of semantic.tags)semanticTags.add(tag);
        const snapshot = createMeshMetadataSnapshot({
            meshId: object.uuid,
            meshName: object.name || object.uuid,
            nodeId: object.uuid,
            nodeName: object.name || object.uuid,
            groupRanges: createGroupRanges(prepared, object.material),
            semantic
        });
        geometries.push(prepared);
        meshMetadata.push(snapshot);
        triangleMetadata.push(...createTriangleMetadata(prepared, snapshot));
    });
    if (0 === geometries.length) throw new Error('Spatial world source must contain triangle positions');
    const merged = 1 === geometries.length ? geometries[0] : (0, __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_utils_BufferGeometryUtils_js_9f53b8c2__.mergeGeometries)(geometries, true);
    if (!merged) throw new Error('Failed to merge normalized spatial geometries');
    for (const geometry of geometries)if (geometry !== merged) geometry.dispose();
    merged.computeBoundingBox();
    merged.computeBoundingSphere();
    return {
        source,
        geometry: merged,
        bounds: merged.boundingBox?.clone() ?? null,
        metadata: {
            source,
            meshMetadata,
            semanticTags: Array.from(semanticTags)
        },
        triangleMetadata
    };
}
function createDebugSnapshot(role, debug) {
    return {
        prototypeName: `${role}-prototype`,
        meshVisible: debug?.meshVisible ?? false,
        boundsVisible: debug?.boundsVisible ?? false,
        boundsDepth: debug?.boundsDepth ?? 10
    };
}
function prepareGeometry(source, options) {
    const position = source.getAttribute('position');
    if (!position || position.count < 3) throw new Error('Spatial world source must contain triangle positions');
    if (options.requireIndexedFaces && !source.index) throw new Error('PLY spatial source must contain triangle faces');
    const geometry = new __WEBPACK_EXTERNAL_MODULE_three__.BufferGeometry();
    geometry.setAttribute('position', position.clone());
    if (source.index) geometry.setIndex(source.index.clone());
    const normal = source.getAttribute('normal');
    if (normal) geometry.setAttribute('normal', normal.clone());
    else geometry.computeVertexNormals();
    for (const group of source.groups)geometry.addGroup(group.start, group.count, group.materialIndex);
    const indexCount = geometry.index?.count;
    const vertexCount = geometry.getAttribute('position').count;
    const primitiveCount = indexCount ?? vertexCount;
    if (primitiveCount < 3 || primitiveCount % 3 !== 0) throw new Error('Spatial world source must resolve to triangle primitives');
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    geometry.name = source.name;
    geometry.userData = {
        ...source.userData ?? {}
    };
    return geometry;
}
function createSourceReference(source, format) {
    if ('string' == typeof source) return {
        key: `url:${source}`,
        kind: 'url',
        format
    };
    if (source instanceof __WEBPACK_EXTERNAL_MODULE_three__.BufferGeometry) return {
        key: `buffer-geometry:${source.uuid}`,
        kind: 'buffer-geometry',
        format
    };
    return {
        key: `object3D:${source.uuid}`,
        kind: 'object3D',
        format
    };
}
function resolveFormat(request) {
    if (request.format) return request.format;
    if ('string' != typeof request.source) return null;
    const normalized = request.source.toLowerCase();
    if (normalized.endsWith('.glb')) return 'glb';
    if (normalized.endsWith('.gltf')) return 'gltf';
    if (normalized.endsWith('.ply')) return 'ply';
    return null;
}
function createGroupRanges(geometry, material) {
    const groups = geometry.groups.length ? geometry.groups : [
        {
            start: 0,
            count: geometry.index?.count ?? geometry.getAttribute('position').count,
            materialIndex: 0
        }
    ];
    return groups.map((group, index)=>({
            groupIndex: index,
            start: group.start,
            count: group.count,
            materialIndex: group.materialIndex,
            materialName: getMaterialName(material, group.materialIndex)
        }));
}
function createMeshMetadataSnapshot(input) {
    return {
        meshId: input.meshId,
        meshName: input.meshName,
        nodeId: input.nodeId,
        nodeName: input.nodeName,
        groupRanges: input.groupRanges,
        semantic: input.semantic
    };
}
function createTriangleMetadata(geometry, mesh) {
    const triangleCount = (geometry.index?.count ?? geometry.getAttribute('position').count) / 3;
    const metadata = Array.from({
        length: triangleCount
    }, ()=>createHitMetadata(mesh, void 0, void 0));
    if (!geometry.groups.length) return metadata;
    for (const group of mesh.groupRanges){
        const startTriangle = Math.floor(group.start / 3);
        const triangleSpan = Math.ceil(group.count / 3);
        for(let faceIndex = startTriangle; faceIndex < Math.min(triangleCount, startTriangle + triangleSpan); faceIndex += 1)metadata[faceIndex] = createHitMetadata(mesh, group.materialIndex, group.materialName);
    }
    return metadata;
}
function createHitMetadata(mesh, materialIndex, materialName) {
    return {
        meshId: mesh.meshId,
        meshName: mesh.meshName,
        nodeId: mesh.nodeId,
        nodeName: mesh.nodeName,
        materialIndex,
        materialName,
        semantic: mesh.semantic
    };
}
function extractSemanticMetadata(...sources) {
    const tags = new Set();
    const mergedUserData = {};
    let walkable;
    let blocked;
    for (const source of sources)if (!!source) {
        Object.assign(mergedUserData, source);
        collectTags(source, tags);
        walkable = pickBoolean(walkable, source.walkable, source.navigation?.walkable, source.semantic?.walkable);
        blocked = pickBoolean(blocked, source.blocked, source.navigation?.blocked, source.semantic?.blocked);
    }
    return {
        tags: Array.from(tags),
        walkable,
        blocked,
        userData: Object.freeze(mergedUserData)
    };
}
function collectTags(source, target) {
    const candidates = [
        source.tags,
        source.semanticTags,
        source.spatialTags,
        source.navigation?.tags,
        source.semantic?.tags
    ];
    for (const candidate of candidates)for (const tag of normalizeTags(candidate))target.add(tag);
}
function normalizeTags(candidate) {
    if (Array.isArray(candidate)) return candidate.filter((value)=>'string' == typeof value);
    if ('string' == typeof candidate && candidate.trim()) return candidate.split(',').map((item)=>item.trim()).filter(Boolean);
    return [];
}
function pickBoolean(current, ...candidates) {
    if ('boolean' == typeof current) return current;
    for (const candidate of candidates)if ('boolean' == typeof candidate) return candidate;
}
function getMaterialName(material, materialIndex) {
    if (!material) return null;
    if (Array.isArray(material)) {
        const entry = void 0 !== materialIndex ? material[materialIndex] : material[0];
        return entry?.name || null;
    }
    const singleMaterial = material;
    return singleMaterial.name || null;
}
function throwIfAborted(signal) {
    if (!signal?.aborted) return;
    const error = new Error('Spatial world build aborted');
    error.name = 'AbortError';
    throw error;
}
export { SpatialBuildPipeline };
