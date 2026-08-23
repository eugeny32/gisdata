import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__core_OctreeGeometry_js_13604713__ from "../core/OctreeGeometry.js";
import * as __WEBPACK_EXTERNAL_MODULE__OctreeLoader_js_2f8b880b__ from "./OctreeLoader.js";
function mergeSignals(s1, s2) {
    if (!s1 && !s2) {
        const ac = new AbortController();
        return {
            signal: ac.signal,
            cleanup: ()=>{}
        };
    }
    if (!s1) return {
        signal: s2,
        cleanup: ()=>{}
    };
    if (!s2) return {
        signal: s1,
        cleanup: ()=>{}
    };
    if (s1.aborted) return {
        signal: s1,
        cleanup: ()=>{}
    };
    if (s2.aborted) return {
        signal: s2,
        cleanup: ()=>{}
    };
    const ac = new AbortController();
    const onAbort = ()=>ac.abort();
    s1.addEventListener('abort', onAbort);
    s2.addEventListener('abort', onAbort);
    const cleanup = ()=>{
        s1.removeEventListener('abort', onAbort);
        s2.removeEventListener('abort', onAbort);
    };
    return {
        signal: ac.signal,
        cleanup
    };
}
function createAbortError() {
    return new DOMException('Aborted', 'AbortError');
}
function createFetchInit(source, init = {}) {
    return {
        ...init,
        ...true === source.withCredentials ? {
            credentials: 'include'
        } : {}
    };
}
function getBytesPerElement(array) {
    return 0 === array.length ? 0 : array.byteLength / array.length;
}
async function waitForGeometryNodeLoad(node, signal) {
    if (signal?.aborted) throw createAbortError();
    if (node.loaded || node.structural) return;
    await new Promise((resolve, reject)=>{
        let timer;
        const cleanup = ()=>{
            if (void 0 !== timer) clearTimeout(timer);
            signal?.removeEventListener('abort', onAbort);
        };
        const onAbort = ()=>{
            cleanup();
            reject(createAbortError());
        };
        const poll = ()=>{
            if (signal?.aborted) {
                cleanup();
                reject(createAbortError());
                return;
            }
            if (node.loaded || node.structural) {
                cleanup();
                resolve();
                return;
            }
            if (!node.loading) {
                cleanup();
                reject(new Error(`Failed to load Potree node "${node.name}"`));
                return;
            }
            timer = setTimeout(poll, 0);
        };
        signal?.addEventListener('abort', onAbort);
        poll();
    });
}
async function waitForGeometryNodeLoadSlot(node, signal) {
    if (signal?.aborted) throw createAbortError();
    await new Promise((resolve, reject)=>{
        let timer;
        const cleanup = ()=>{
            if (void 0 !== timer) clearTimeout(timer);
            signal?.removeEventListener('abort', onAbort);
        };
        const onAbort = ()=>{
            cleanup();
            reject(createAbortError());
        };
        const poll = ()=>{
            if (signal?.aborted) {
                onAbort();
                return;
            }
            if (node.Potree.numNodesLoading < node.Potree.maxNodesLoading) {
                cleanup();
                resolve();
                return;
            }
            timer = setTimeout(poll, 0);
        };
        signal?.addEventListener('abort', onAbort);
        poll();
    });
}
async function loadGeometryNode(loader, node, signal) {
    while(!node.loaded && !node.structural){
        if (signal?.aborted) throw createAbortError();
        await loader.load(node, signal);
        if (node.loaded || node.structural) return;
        if (node.loading) {
            await waitForGeometryNodeLoad(node, signal);
            return;
        }
        if (node.loadFailed || node.loadPermanentlyFailed || node.disposed || node.octreeGeometry.disposed) throw new Error(`Failed to load Potree node "${node.name}"`);
        await waitForGeometryNodeLoadSlot(node, signal);
    }
}
function toPointBuffer(node) {
    const position = node.geometry?.getAttribute?.('position');
    const array = position?.array;
    if (!position || !array || !ArrayBuffer.isView(array)) throw new Error(`Potree node "${node.name}" 缺少 position 缓冲`);
    const buffer = new Uint8Array(array.buffer, array.byteOffset, array.byteLength).slice().buffer;
    return {
        buffer,
        pointCount: position.count,
        stride: position.itemSize * getBytesPerElement(array)
    };
}
function adaptNode(node, nodeMap, adaptedCache) {
    const cached = adaptedCache.get(node);
    if (cached) return cached;
    let pointBuffer;
    const adapted = {
        get index () {
            return node.index;
        },
        get boundingBox () {
            return node.boundingBox;
        },
        get pointCount () {
            return node.numPoints;
        },
        get level () {
            return node.level ?? 0;
        },
        get children () {
            const result = [];
            for(let i = 0; i < 8; i++){
                const child = node.children[i];
                result.push(child ? adaptNode(child, nodeMap, adaptedCache) : null);
            }
            return result;
        },
        get loaded () {
            return node.loaded ?? false;
        },
        set loaded (v){
            if (v) {
                if (node.geometry) node.markResident();
            } else node.unload();
        },
        get buffer () {
            return pointBuffer;
        },
        set buffer (v){
            pointBuffer = v;
        }
    };
    adaptedCache.set(node, adapted);
    nodeMap.set(adapted, node);
    return adapted;
}
function adaptAttributes(attrs) {
    return {
        attributes: attrs.attributes.map((a)=>({
                name: a.name,
                type: {
                    ordinal: a.type.ordinal,
                    size: a.type.size
                },
                numElements: a.numElements,
                byteSize: a.byteSize,
                description: a.description,
                range: a.range,
                initialRange: a.initialRange
            }))
    };
}
class NodeLoaderAdapter {
    constructor(inner, nodeMap){
        this._inner = inner;
        this._nodeMap = nodeMap;
    }
    async load(node, signal) {
        const geoNode = this._nodeMap.get(node);
        if (!geoNode) throw new Error('PointCloudNode 未绑定到底层 OctreeGeometryNode');
        if (node.buffer) return node.buffer;
        await loadGeometryNode(this._inner, geoNode, signal);
        const pointBuffer = toPointBuffer(geoNode);
        node.buffer = pointBuffer;
        return pointBuffer;
    }
    dispose() {
        this._inner.dispose();
    }
}
class PotreeV2Loader {
    constructor(deps){
        this.format = 'potree-v2';
        this.detectPriority = 10;
        this.deps = deps;
    }
    canLoad(source) {
        if (!source.url) return false;
        const candidates = [
            source.url
        ];
        try {
            candidates.push(decodeURIComponent(source.url));
        } catch  {}
        return candidates.some((url)=>/(?:^|[\\/])metadata\.json(?:$|[?#])/.test(url));
    }
    async load(source, context) {
        const { signal, cleanup } = mergeSignals(source.signal, context.signal);
        try {
            if (signal.aborted) throw createAbortError();
            const response = await fetch(source.url, createFetchInit(source, {
                signal
            }));
            const metadata = await response.json();
            if (signal.aborted) throw createAbortError();
            const attributes = __WEBPACK_EXTERNAL_MODULE__OctreeLoader_js_2f8b880b__.OctreeLoader.parseAttributes(metadata.attributes);
            const nodeLoader = new __WEBPACK_EXTERNAL_MODULE__OctreeLoader_js_2f8b880b__.NodeLoader(this.deps, source.url, {
                withCredentials: source.withCredentials
            });
            nodeLoader.metadata = metadata;
            nodeLoader.attributes = attributes;
            nodeLoader.scale = metadata.scale;
            nodeLoader.offset = metadata.offset;
            const octree = new __WEBPACK_EXTERNAL_MODULE__core_OctreeGeometry_js_13604713__.OctreeGeometry();
            octree.url = source.url;
            octree.spacing = metadata.spacing;
            octree.scale = metadata.scale;
            const posAttr = metadata.attributes.find((x)=>'position' === x.name);
            if (!posAttr) throw new Error('Potree metadata 缺少 position 属性');
            const posMin = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(...posAttr.min);
            const posMax = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(...posAttr.max);
            const bbMin = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(...metadata.boundingBox.min);
            const bbMax = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(...metadata.boundingBox.max);
            const boundingBox = new __WEBPACK_EXTERNAL_MODULE_three__.Box3(bbMin, bbMax);
            const miniBoundingBox = new __WEBPACK_EXTERNAL_MODULE_three__.Box3(posMin, posMax);
            const offset = bbMin.clone();
            const miniOffset = posMin.clone();
            boundingBox.min.sub(offset);
            boundingBox.max.sub(offset);
            miniBoundingBox.min.sub(miniOffset);
            miniBoundingBox.max.sub(miniOffset);
            octree.projection = metadata.projection;
            octree.boundingBox = boundingBox;
            octree.tightBoundingBox = boundingBox.clone();
            octree.mini_tightBoundingBox = miniBoundingBox.clone();
            octree.boundingSphere = boundingBox.getBoundingSphere(new __WEBPACK_EXTERNAL_MODULE_three__.Sphere());
            octree.tightBoundingSphere = boundingBox.getBoundingSphere(new __WEBPACK_EXTERNAL_MODULE_three__.Sphere());
            octree.offset = offset;
            octree.pointAttributes = __WEBPACK_EXTERNAL_MODULE__OctreeLoader_js_2f8b880b__.OctreeLoader.parseAttributes(metadata.attributes);
            octree.loader = nodeLoader;
            if (signal.aborted) throw createAbortError();
            const root = new __WEBPACK_EXTERNAL_MODULE__core_OctreeGeometry_js_13604713__.OctreeGeometryNode('r', octree, boundingBox, this.deps.potreeConfig);
            root.level = 0;
            root.nodeType = 2;
            root.hierarchyByteOffset = 0n;
            root.hierarchyByteSize = BigInt(metadata.hierarchy.firstChunkSize);
            root.hasChildren = false;
            root.spacing = octree.spacing;
            root.byteOffset = 0n;
            octree.root = root;
            await loadGeometryNode(nodeLoader, root, signal);
            if (signal.aborted) throw createAbortError();
            let totalPoints = 0;
            const countPoints = (node)=>{
                totalPoints += node.numPoints;
                for(let i = 0; i < 8; i++)if (node.children[i]) countPoints(node.children[i]);
            };
            countPoints(root);
            const nodeMap = new Map();
            const adaptedCache = new Map();
            const result = {
                type: 'octree',
                octreeGeometry: octree,
                metadata: {
                    boundingBox: octree.boundingBox,
                    pointCount: totalPoints,
                    attributes: adaptAttributes(attributes),
                    projection: octree.projection,
                    spacing: octree.spacing
                },
                root: adaptNode(root, nodeMap, adaptedCache),
                nodeLoader: new NodeLoaderAdapter(nodeLoader, nodeMap)
            };
            return result;
        } finally{
            cleanup();
        }
    }
}
export { PotreeV2Loader };
