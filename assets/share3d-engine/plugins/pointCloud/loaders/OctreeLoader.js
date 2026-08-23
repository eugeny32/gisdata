import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__core_OctreeGeometry_js_13604713__ from "../core/OctreeGeometry.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__PointAttributes_js_5efd3262__ from "./PointAttributes.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('pointcloud');
const diagnosticsLog = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('pointcloud:diagnostics');
const LARGE_NODE_BUFFER_BYTES = 16777216;
const NODE_DIAGNOSTIC_INTERVAL_MS = 15000;
let lastNodeDiagnosticAt = 0;
function createAbortError() {
    return new DOMException('Aborted', 'AbortError');
}
function createFetchInit(options, init = {}) {
    return {
        ...init,
        ...true === options.withCredentials ? {
            credentials: 'include'
        } : {}
    };
}
function isAbortError(error) {
    return error instanceof DOMException && 'AbortError' === error.name;
}
function getErrorMessage(error) {
    return error instanceof Error ? error.message : String(error);
}
function nowMs() {
    return globalThis.performance?.now?.() ?? Date.now();
}
function toMB(bytes) {
    return (bytes / 1024 / 1024).toFixed(1);
}
function bigIntToFiniteNumber(value) {
    if (void 0 === value) return 0;
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : 0;
}
function shouldLogNodeDiagnostic(bytes) {
    const now = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().now();
    if (bytes >= LARGE_NODE_BUFFER_BYTES || now - lastNodeDiagnosticAt >= NODE_DIAGNOSTIC_INTERVAL_MS) {
        lastNodeDiagnosticAt = now;
        return true;
    }
    return false;
}
function getWorkerFailureMessage(event) {
    const message = event?.message;
    if ('string' == typeof message && message.length > 0) return message;
    return event?.type ? `worker ${event.type}` : 'worker failed';
}
function resolveSiblingResourceUrl(fileUrl, siblingFileName) {
    const queryPathMatch = fileUrl.match(/^([^?]+\?path=)([^#]+)(.*)$/);
    if (queryPathMatch) {
        const prefix = queryPathMatch[1];
        const encodedPath = queryPathMatch[2];
        let decodedPath = encodedPath;
        try {
            decodedPath = decodeURIComponent(encodedPath);
        } catch  {
            decodedPath = encodedPath;
        }
        const lastSlash = Math.max(decodedPath.lastIndexOf('/'), decodedPath.lastIndexOf('\\'));
        const baseDir = lastSlash >= 0 ? decodedPath.substring(0, lastSlash + 1) : decodedPath;
        return prefix + encodeURIComponent(`${baseDir}${siblingFileName}`);
    }
    const localFileMatch = fileUrl.match(/^(https?:\/\/[^/]+\/local-file\/)([^?#]+)(.*)$/);
    if (localFileMatch) {
        const prefix = localFileMatch[1];
        const encodedPath = localFileMatch[2];
        let decodedPath = encodedPath;
        try {
            decodedPath = decodeURIComponent(encodedPath);
        } catch  {
            decodedPath = encodedPath;
        }
        const lastSlash = Math.max(decodedPath.lastIndexOf('/'), decodedPath.lastIndexOf('\\'));
        const separator = decodedPath.includes('\\') ? '\\' : '/';
        const baseDir = lastSlash >= 0 ? decodedPath.substring(0, lastSlash + 1) : `${decodedPath}${separator}`;
        return prefix + encodeURIComponent(`${baseDir}${siblingFileName}`);
    }
    return `${fileUrl}/../${siblingFileName}`;
}
class NodeLoader {
    constructor(deps, url, options = {}){
        this.disposed = false;
        this.generation = 0;
        this.activeControllers = new Set();
        this.activeCancelers = new Set();
        this.successfullyLoadedNodes = new WeakSet();
        this.url = url;
        this.workerPool = deps.workerPool;
        this.workerUrl = deps.workerUrl;
        this.counter = deps.counter;
        this.onNodeLoadStarted = deps.onNodeLoadStarted;
        this.onNodeLoadSettled = deps.onNodeLoadSettled;
        this.potreeConfig = deps.potreeConfig;
        this.options = options;
    }
    async load(node, signal) {
        if (node.loaded || node.loading) return;
        if (node.loadPermanentlyFailed || node.loadFailed && nowMs() < node.retryAfter) return;
        if (this.disposed || node.disposed || node.octreeGeometry.disposed || signal?.aborted) return;
        const requestToken = node.beginLoad(signal);
        if (null === requestToken) return;
        this.counter.increment();
        const startKind = this.successfullyLoadedNodes.has(node) ? 'reload' : node.loadErrorCount > 0 ? 'retry' : 'initial';
        this.onNodeLoadStarted?.({
            node,
            kind: startKind
        });
        const controller = new AbortController();
        const taskGeneration = this.generation;
        let worker;
        let workerUrl;
        let finished = false;
        let workerReturned = false;
        let counterReleased = false;
        let settledNotified = false;
        let abortHandler;
        let cancelActiveTask = ()=>{};
        if (signal) {
            abortHandler = ()=>controller.abort();
            if (signal.aborted) controller.abort();
            else signal.addEventListener('abort', abortHandler, {
                once: true
            });
        }
        this.activeControllers.add(controller);
        const cleanup = ()=>{
            if (signal && abortHandler) signal.removeEventListener('abort', abortHandler);
            this.activeControllers.delete(controller);
            this.activeCancelers.delete(cancelActiveTask);
        };
        const isCanceled = ()=>this.disposed || this.generation !== taskGeneration || controller.signal.aborted || !node.isLoadTokenCurrent(requestToken) || node.disposed || node.octreeGeometry.disposed;
        const releaseCounter = ()=>{
            if (counterReleased) return;
            counterReleased = true;
            this.counter.decrement();
        };
        const returnWorker = ()=>{
            if (!worker || !workerUrl || workerReturned) return;
            workerReturned = true;
            worker.onmessage = null;
            worker.onerror = null;
            worker.onmessageerror = null;
            this.workerPool.returnWorker(workerUrl, worker);
        };
        const discardWorker = ()=>{
            if (!worker || !workerUrl || workerReturned) return;
            workerReturned = true;
            worker.onmessage = null;
            worker.onerror = null;
            worker.onmessageerror = null;
            this.workerPool.discardWorker(workerUrl, worker);
        };
        const resetNode = ()=>{
            node.cancelLoad(requestToken);
        };
        const settle = (status, reason)=>{
            if (settledNotified) return;
            settledNotified = true;
            if ('loaded' === status) this.successfullyLoadedNodes.add(node);
            this.notifyNodeLoadSettled(node, status, reason);
        };
        const markNodeLoadFailed = (reason)=>{
            node.markLoadFailed(reason, requestToken);
        };
        const finishWithoutGeometry = ()=>{
            if (finished) return;
            finished = true;
            returnWorker();
            resetNode();
            releaseCounter();
            cleanup();
        };
        cancelActiveTask = ()=>{
            controller.abort();
            if (finished) return;
            if (!worker) return;
            finished = true;
            discardWorker();
            resetNode();
            releaseCounter();
            cleanup();
            settle('aborted');
        };
        this.activeCancelers.add(cancelActiveTask);
        try {
            if (node?.nodeType === 2) {
                await this.loadHierarchy(node, controller.signal);
                if (isCanceled()) throw createAbortError();
            }
            const { byteOffset, byteSize } = node;
            if (0n === byteSize) {
                this.normalizeZeroByteNode(node);
                node.completeStructural(requestToken);
                finished = true;
                releaseCounter();
                cleanup();
                settle('structural');
                return;
            }
            const urlOctree = resolveSiblingResourceUrl(this.url, 'octree.bin');
            const first = byteOffset;
            const last = byteOffset + byteSize - 1n;
            const response = await fetch(urlOctree, {
                headers: {
                    'content-type': 'multipart/byteranges',
                    Range: `bytes=${first}-${last}`
                },
                signal: controller.signal,
                ...true === this.options.withCredentials ? {
                    credentials: 'include'
                } : {}
            });
            const buffer = await response.arrayBuffer();
            const inputBytes = buffer.byteLength;
            const expectedBytes = bigIntToFiniteNumber(byteSize);
            if (shouldLogNodeDiagnostic(Math.max(inputBytes, expectedBytes))) diagnosticsLog.info(`[OctreeLoader] node input loaded, name=${node.name}, level=${node.level}, numPoints=${node.numPoints}, expectedMB=${toMB(expectedBytes)}, bufferMB=${toMB(inputBytes)}`);
            if (isCanceled()) throw createAbortError();
            workerUrl = await this.workerUrl;
            worker = await this.workerPool.getWorker(workerUrl);
            if (isCanceled()) throw createAbortError();
            const cleanupTask = cleanup;
            const shouldDropResult = isCanceled;
            const releaseTaskCounter = releaseCounter;
            const resetTaskNode = resetNode;
            worker.onmessage = (e)=>{
                if (finished) return;
                finished = true;
                let geometry;
                let settledStatus = null;
                let settledReason;
                try {
                    const data = e.data;
                    const buffers = data.attributeBuffers;
                    geometry = new __WEBPACK_EXTERNAL_MODULE_three__.BufferGeometry();
                    let outputBytes = 0;
                    let preciseBytes = 0;
                    let attributeCount = 0;
                    const returnedSourceBuffer = data.buffer?.buffer ?? data.buffer;
                    const returnedSourceBytes = returnedSourceBuffer?.byteLength ?? 0;
                    for(const property in buffers){
                        const propertyBuffer = buffers[property].buffer;
                        outputBytes += propertyBuffer?.byteLength ?? 0;
                        preciseBytes += buffers[property].preciseBuffer?.byteLength ?? 0;
                        attributeCount += 1;
                        if ('position' === property) geometry.setAttribute('position', new __WEBPACK_EXTERNAL_MODULE_three__.BufferAttribute(new Float32Array(propertyBuffer), 3));
                        else if ('rgba' === property) geometry.setAttribute('rgba', new __WEBPACK_EXTERNAL_MODULE_three__.BufferAttribute(new Uint8Array(propertyBuffer), 4, true));
                        else if ('NORMAL' === property) geometry.setAttribute('normal', new __WEBPACK_EXTERNAL_MODULE_three__.BufferAttribute(new Float32Array(propertyBuffer), 3));
                        else if ('INDICES' === property) {
                            const bufferAttribute = new __WEBPACK_EXTERNAL_MODULE_three__.BufferAttribute(new Uint8Array(propertyBuffer), 4);
                            bufferAttribute.normalized = true;
                            geometry.setAttribute('indices', bufferAttribute);
                        } else {
                            const bufferAttribute = new __WEBPACK_EXTERNAL_MODULE_three__.BufferAttribute(new Float32Array(propertyBuffer), 1);
                            const batchAttribute = buffers[property].attribute;
                            bufferAttribute.potree = {
                                offset: buffers[property].offset,
                                scale: buffers[property].scale,
                                preciseBuffer: buffers[property].preciseBuffer,
                                range: batchAttribute.range
                            };
                            geometry.setAttribute(property, bufferAttribute);
                        }
                    }
                    if (shouldLogNodeDiagnostic(Math.max(inputBytes, outputBytes))) diagnosticsLog.info(`[OctreeLoader] node decoded, name=${node.name}, level=${node.level}, numPoints=${node.numPoints}, inputMB=${toMB(inputBytes)}, outputMB=${toMB(outputBytes)}, preciseMB=${toMB(preciseBytes)}, returnedSourceMB=${toMB(returnedSourceBytes)}, attributes=${attributeCount}`);
                    if (shouldDropResult()) {
                        geometry.dispose();
                        resetTaskNode();
                        settledStatus = 'late-dropped';
                    } else if (node.completeDecoded(requestToken, geometry, data.density)) settledStatus = 'loaded';
                    else {
                        geometry.dispose();
                        settledStatus = 'late-dropped';
                    }
                } catch (err) {
                    geometry?.dispose();
                    settledStatus = 'failed';
                    settledReason = getErrorMessage(err);
                    markNodeLoadFailed(settledReason);
                    log.warn(`点云节点解码结果处理失败，节点: ${node.name}, 原因: ${settledReason}`);
                } finally{
                    returnWorker();
                    releaseTaskCounter();
                    cleanupTask();
                    if (settledStatus) settle(settledStatus, settledReason);
                }
            };
            const handleWorkerFailure = (event)=>{
                if (finished) return;
                finished = true;
                discardWorker();
                const reason = getWorkerFailureMessage(event);
                markNodeLoadFailed(reason);
                releaseTaskCounter();
                cleanupTask();
                settle('failed', reason);
            };
            worker.onerror = handleWorkerFailure;
            worker.onmessageerror = handleWorkerFailure;
            const pointAttributes = node.octreeGeometry.pointAttributes;
            const scale = node.octreeGeometry.scale;
            const box = node.boundingBox;
            const min = node.octreeGeometry.offset?.clone().add(box.min);
            const size = box.max.clone().sub(box.min);
            const max = min?.clone().add(size);
            const numPoints = node.numPoints;
            const offset = node.octreeGeometry.loader?.offset;
            const message = {
                encoding: this.metadata.encoding,
                name: node.name,
                buffer: buffer,
                pointAttributes: pointAttributes,
                scale: scale,
                min: min,
                max: max,
                size: size,
                offset: offset,
                numPoints: numPoints
            };
            worker.postMessage(message, [
                message.buffer
            ]);
        } catch (err) {
            if (isAbortError(err)) {
                finishWithoutGeometry();
                settle('aborted');
            } else {
                const reason = getErrorMessage(err);
                markNodeLoadFailed(reason);
                finishWithoutGeometry();
                settle('failed', reason);
                log.warn(`点云节点加载失败，节点: ${node.name}, 原因: ${reason}`);
            }
        }
    }
    notifyNodeLoadSettled(node, status, reason) {
        this.onNodeLoadSettled?.({
            node,
            status,
            reason
        });
    }
    dispose() {
        if (this.disposed) return;
        this.disposed = true;
        this.generation++;
        for (const controller of this.activeControllers)controller.abort();
        for (const cancel of Array.from(this.activeCancelers))cancel();
    }
    parseHierarchy(node, buffer) {
        const view = new DataView(buffer);
        const bytesPerNode = 22;
        const numNodes = buffer.byteLength / bytesPerNode;
        const octree = node.octreeGeometry;
        const nodes = new Array(numNodes);
        nodes[0] = node;
        let nodePos = 1;
        for(let i = 0; i < numNodes; i++){
            const current = nodes[i];
            const type = view.getUint8(i * bytesPerNode + 0);
            const childMask = view.getUint8(i * bytesPerNode + 1);
            const numPoints = view.getUint32(i * bytesPerNode + 2, true);
            const byteOffset = view.getBigInt64(i * bytesPerNode + 6, true);
            const byteSize = view.getBigInt64(i * bytesPerNode + 14, true);
            if (current?.nodeType === 2) {
                current.byteOffset = byteOffset;
                current.byteSize = byteSize;
                current.numPoints = numPoints;
            } else if (2 === type) {
                current.hierarchyByteOffset = byteOffset;
                current.hierarchyByteSize = byteSize;
                current.numPoints = numPoints;
            } else if (current) {
                current.byteOffset = byteOffset;
                current.byteSize = byteSize;
                current.numPoints = numPoints;
            }
            if (current?.byteSize === 0n) {
                this.normalizeZeroByteNode(current);
                current.markStructural();
            }
            if (current) current.nodeType = type;
            if (current?.nodeType !== 2) for(let childIndex = 0; childIndex < 8; childIndex++){
                const childExists = (1 << childIndex & childMask) !== 0;
                if (!childExists) continue;
                if (!current) continue;
                const childName = current.name + childIndex;
                const childAABB = createChildAABB(current.boundingBox, childIndex);
                const child = new __WEBPACK_EXTERNAL_MODULE__core_OctreeGeometry_js_13604713__.OctreeGeometryNode(childName, octree, childAABB, this.potreeConfig);
                child.name = childName;
                child.spacing = current.spacing / 2;
                child.level = current.level + 1;
                current.children[childIndex] = child;
                child.parent = current;
                nodes[nodePos] = child;
                nodePos++;
            }
        }
    }
    async loadHierarchy(node, signal) {
        const { hierarchyByteOffset, hierarchyByteSize } = node;
        const hierarchyPath = resolveSiblingResourceUrl(this.url, 'hierarchy.bin');
        const first = hierarchyByteOffset;
        const last = first + hierarchyByteSize - 1n;
        const response = await fetch(hierarchyPath, {
            headers: {
                'content-type': 'multipart/byteranges',
                Range: `bytes=${first}-${last}`
            },
            signal,
            ...true === this.options.withCredentials ? {
                credentials: 'include'
            } : {}
        });
        const buffer = await response.arrayBuffer();
        this.parseHierarchy(node, buffer);
    }
    normalizeZeroByteNode(node) {
        if (node.numPoints > 0) log.warn(`点云零字节节点元数据矛盾，节点: ${node.name}, 声明点数: ${node.numPoints}`);
        node.numPoints = 0;
    }
}
const tmpVec3 = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
function createChildAABB(aabb, index) {
    const min = aabb.min.clone();
    const max = aabb.max.clone();
    const size = tmpVec3.subVectors(max, min);
    if ((1 & index) > 0) min.z += size.z / 2;
    else max.z -= size.z / 2;
    if ((2 & index) > 0) min.y += size.y / 2;
    else max.y -= size.y / 2;
    if ((4 & index) > 0) min.x += size.x / 2;
    else max.x -= size.x / 2;
    return new __WEBPACK_EXTERNAL_MODULE_three__.Box3(min, max);
}
const typenameTypeattributeMap = {
    double: __WEBPACK_EXTERNAL_MODULE__PointAttributes_js_5efd3262__.PointAttributeTypes.DATA_TYPE_DOUBLE,
    float: __WEBPACK_EXTERNAL_MODULE__PointAttributes_js_5efd3262__.PointAttributeTypes.DATA_TYPE_FLOAT,
    int8: __WEBPACK_EXTERNAL_MODULE__PointAttributes_js_5efd3262__.PointAttributeTypes.DATA_TYPE_INT8,
    uint8: __WEBPACK_EXTERNAL_MODULE__PointAttributes_js_5efd3262__.PointAttributeTypes.DATA_TYPE_UINT8,
    int16: __WEBPACK_EXTERNAL_MODULE__PointAttributes_js_5efd3262__.PointAttributeTypes.DATA_TYPE_INT16,
    uint16: __WEBPACK_EXTERNAL_MODULE__PointAttributes_js_5efd3262__.PointAttributeTypes.DATA_TYPE_UINT16,
    int32: __WEBPACK_EXTERNAL_MODULE__PointAttributes_js_5efd3262__.PointAttributeTypes.DATA_TYPE_INT32,
    uint32: __WEBPACK_EXTERNAL_MODULE__PointAttributes_js_5efd3262__.PointAttributeTypes.DATA_TYPE_UINT32,
    int64: __WEBPACK_EXTERNAL_MODULE__PointAttributes_js_5efd3262__.PointAttributeTypes.DATA_TYPE_INT64,
    uint64: __WEBPACK_EXTERNAL_MODULE__PointAttributes_js_5efd3262__.PointAttributeTypes.DATA_TYPE_UINT64
};
class OctreeLoader {
    static parseAttributes(jsonAttributes) {
        const attributes = new __WEBPACK_EXTERNAL_MODULE__PointAttributes_js_5efd3262__.PointAttributes();
        const replacements = {
            rgb: 'rgba'
        };
        for (const jsonAttribute of jsonAttributes){
            const { name, numElements, min, max } = jsonAttribute;
            const type = typenameTypeattributeMap[jsonAttribute.type];
            const potreeAttributeName = replacements[name] ? replacements[name] : name;
            const attribute = new __WEBPACK_EXTERNAL_MODULE__PointAttributes_js_5efd3262__.PointAttribute(potreeAttributeName, type, numElements);
            if (1 === numElements) attribute.range = [
                min[0],
                max[0]
            ];
            else attribute.range = [
                min,
                max
            ];
            if ('gps-time' === name) {
                if (attribute.range[0] === attribute.range[1]) attribute.range[1] += 1;
            }
            attribute.initialRange = attribute.range;
            attributes.add(attribute);
        }
        {
            const hasNormals = void 0 !== attributes.attributes.find((a)=>'NormalX' === a.name) && void 0 !== attributes.attributes.find((a)=>'NormalY' === a.name) && void 0 !== attributes.attributes.find((a)=>'NormalZ' === a.name);
            if (hasNormals) {
                const vector = {
                    name: 'NORMAL',
                    attributes: [
                        'NormalX',
                        'NormalY',
                        'NormalZ'
                    ]
                };
                attributes.addVector(vector);
            }
        }
        return attributes;
    }
    static async load(url, deps, options = {}) {
        const response = await fetch(url, createFetchInit(options));
        const metadata = await response.json();
        const attributes = OctreeLoader.parseAttributes(metadata.attributes);
        const loader = new NodeLoader(deps, url, options);
        loader.metadata = metadata;
        loader.attributes = attributes;
        loader.scale = metadata.scale;
        loader.offset = metadata.offset;
        const octree = new __WEBPACK_EXTERNAL_MODULE__core_OctreeGeometry_js_13604713__.OctreeGeometry();
        octree.url = url;
        octree.spacing = metadata.spacing;
        octree.scale = metadata.scale;
        const _position = metadata.attributes.find((x)=>'position' === x.name);
        const _min = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(..._position.min);
        const _max = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(..._position.max);
        const min = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(...metadata.boundingBox.min);
        const max = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(...metadata.boundingBox.max);
        const boundingBox = new __WEBPACK_EXTERNAL_MODULE_three__.Box3(min, max);
        const mini_boundingBox = new __WEBPACK_EXTERNAL_MODULE_three__.Box3(_min, _max);
        const offset = min.clone();
        const mini_offset = _min.clone();
        boundingBox.min.sub(offset);
        boundingBox.max.sub(offset);
        mini_boundingBox.min.sub(mini_offset);
        mini_boundingBox.max.sub(mini_offset);
        octree.projection = metadata.projection;
        octree.boundingBox = boundingBox;
        octree.tightBoundingBox = boundingBox.clone();
        octree.mini_tightBoundingBox = mini_boundingBox.clone();
        octree.boundingSphere = boundingBox.getBoundingSphere(new __WEBPACK_EXTERNAL_MODULE_three__.Sphere());
        octree.tightBoundingSphere = boundingBox.getBoundingSphere(new __WEBPACK_EXTERNAL_MODULE_three__.Sphere());
        octree.offset = offset;
        octree.pointAttributes = OctreeLoader.parseAttributes(metadata.attributes);
        octree.loader = loader;
        const root = new __WEBPACK_EXTERNAL_MODULE__core_OctreeGeometry_js_13604713__.OctreeGeometryNode('r', octree, boundingBox, deps.potreeConfig);
        root.level = 0;
        root.nodeType = 2;
        root.hierarchyByteOffset = 0n;
        root.hierarchyByteSize = BigInt(metadata.hierarchy.firstChunkSize);
        root.hasChildren = false;
        root.spacing = octree.spacing;
        root.byteOffset = 0n;
        octree.root = root;
        loader.load(root);
        const result = {
            geometry: octree
        };
        return result;
    }
}
export { NodeLoader, OctreeLoader, resolveSiblingResourceUrl };
