import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__core_GaussianSogsMesh_js_77b0a45e__ from "../core/GaussianSogsMesh.js";
import * as __WEBPACK_EXTERNAL_MODULE__core_GaussianSplatMesh_js_d31375fc__ from "../core/GaussianSplatMesh.js";
import * as __WEBPACK_EXTERNAL_MODULE__core_UnifiedLODCentersPoints_js_4f0d7848__ from "../core/UnifiedLODCentersPoints.js";
import * as __WEBPACK_EXTERNAL_MODULE__core_UnifiedLODMesh_js_bdf4fc63__ from "../core/UnifiedLODMesh.js";
import * as __WEBPACK_EXTERNAL_MODULE__loaders_SOGBundleLoader_js_f4e06486__ from "../loaders/SOGBundleLoader.js";
import * as __WEBPACK_EXTERNAL_MODULE__loaders_SOGLoader_js_238890f5__ from "../loaders/SOGLoader.js";
import * as __WEBPACK_EXTERNAL_MODULE__loaders_SplatLoader_js_2957c538__ from "../loaders/SplatLoader.js";
import * as __WEBPACK_EXTERNAL_MODULE__lod_GSplatAssetLoader_js_b0649f9d__ from "../lod/GSplatAssetLoader.js";
import * as __WEBPACK_EXTERNAL_MODULE__lod_GSplatOctree_js_b430f8ca__ from "../lod/GSplatOctree.js";
import * as __WEBPACK_EXTERNAL_MODULE__lod_GSplatPlacement_js_5aad7c85__ from "../lod/GSplatPlacement.js";
import * as __WEBPACK_EXTERNAL_MODULE__lod_Layer_js_879f5cf0__ from "../lod/Layer.js";
import * as __WEBPACK_EXTERNAL_MODULE__materials_CentersPointsMaterial_js_b278f5e6__ from "../materials/CentersPointsMaterial.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('gsplat');
class ModelLoader {
    constructor(ctx){
        this.ctx = ctx;
        this.splatLoader = null;
        this.sogBundleLoader = null;
    }
    async load(url, options) {
        return log.perf.span('load', async ()=>{
            const parsedUrl = decodeUrlSafe(url);
            const extension = getFileExtension(parsedUrl).toLowerCase();
            if (this.ctx.registry.urlToClientId.has(url)) return this.returnExisting(url, options);
            if ('.json' === extension) return this.loadLOD(url, options);
            const supportedFormats = [
                '.sog',
                '.ply',
                '.splat'
            ];
            if (!supportedFormats.includes(extension)) throw new Error(`Unsupported file format: ${extension}. Supported formats: .json (LOD), ${supportedFormats.join(', ')} (single file)`);
            return this.loadSingleFile(url, options);
        });
    }
    dispose() {
        this.splatLoader = null;
        this.sogBundleLoader = null;
    }
    syncConfig() {}
    returnExisting(url, options) {
        const clientId = this.ctx.registry.urlToClientId.get(url);
        const lodEntry = this.ctx.registry.lodGroups.get(clientId);
        if (lodEntry) {
            const result = {
                type: 'lod',
                id: lodEntry.nodeId,
                boundingBox: convertBox3ToBoundingBox(lodEntry.boundingBox),
                numSplats: lodEntry.totalPointCount,
                environmentUrl: lodEntry.octree.environmentUrl,
                environmentConfigured: null !== lodEntry.octree.environmentUrl,
                _raw: lodEntry
            };
            if (options?.onLoadComplete) setTimeout(()=>options.onLoadComplete(result), 0);
            return result;
        }
        const singleEntry = this.ctx.registry.singleFiles.get(clientId);
        if (singleEntry) {
            const result = {
                type: 'single',
                id: singleEntry.nodeId,
                boundingBox: convertBox3ToBoundingBox(singleEntry.boundingBox),
                numSplats: singleEntry.numSplats,
                _raw: singleEntry.mesh
            };
            if (options?.onLoadComplete) setTimeout(()=>options.onLoadComplete(result), 0);
            return result;
        }
        throw new Error(`[ModelLoader] URL "${url}" registered but entry not found`);
    }
    async loadLOD(url, options) {
        throwIfAborted(options?.signal);
        const existingPromise = this.ctx.registry.loadingPromises.get(url);
        if (existingPromise) return existingPromise;
        const loadPromise = this.loadLODInternal(url, options);
        this.ctx.registry.loadingPromises.set(url, loadPromise);
        const clearCurrentLoadingPromise = ()=>{
            if (this.ctx.registry.loadingPromises.get(url) === loadPromise) this.ctx.registry.loadingPromises.delete(url);
        };
        const abortHandler = clearCurrentLoadingPromise;
        options?.signal?.addEventListener('abort', abortHandler, {
            once: true
        });
        const finalizeLoadingPromise = ()=>{
            options?.signal?.removeEventListener('abort', abortHandler);
            clearCurrentLoadingPromise();
        };
        loadPromise.then(finalizeLoadingPromise, finalizeLoadingPromise);
        return loadPromise;
    }
    async loadLODInternal(url, options) {
        throwIfAborted(options?.signal);
        const endLodInit = log.perf.time('lodInit');
        const { director, composition } = (()=>{
            try {
                return this.ctx.initLODSystem();
            } finally{
                endLodInit();
            }
        })();
        let config = this.ctx.getLodConfig();
        const clientId = generateNodeId();
        const finalNodeId = options?.nodeId ?? clientId;
        if (this.ctx.registry.nodeIdToClientId.has(finalNodeId)) this.ctx.removeByNodeId(finalNodeId);
        let octree = null;
        let assetLoader = null;
        let rootNode = null;
        let layer = null;
        let renderMesh = null;
        let centersPoints = null;
        let entry = null;
        let layerRegistrationAttempted = false;
        let sceneAttachmentAttempted = false;
        let registryRegistrationAttempted = false;
        try {
            const sogLoader = new __WEBPACK_EXTERNAL_MODULE__loaders_SOGLoader_js_238890f5__.SOGLoader({
                debug: false,
                maxConcurrentLoads: config.maxConcurrentLoads,
                signal: options?.signal,
                withCredentials: this.ctx.withCredentials
            });
            const lodMeta = await sogLoader.preloadMeta(url);
            throwIfAborted(options?.signal);
            config = this.ctx.getLodConfig();
            const parsedUrl = decodeUrlSafe(url);
            const shouldEncodeBaseUrl = parsedUrl !== url;
            const baseUrl = options?.baseUrl ?? __WEBPACK_EXTERNAL_MODULE__lod_GSplatOctree_js_b430f8ca__.GSplatOctree.resolveBaseUrl(parsedUrl, {
                encode: shouldEncodeBaseUrl
            });
            octree = new __WEBPACK_EXTERNAL_MODULE__lod_GSplatOctree_js_b430f8ca__.GSplatOctree(url, {
                lodLevels: lodMeta.lodLevels,
                filenames: lodMeta.filenames,
                tree: lodMeta.tree,
                environment: 'string' == typeof lodMeta.environment ? lodMeta.environment : void 0
            }, {
                debug: false,
                loadEnvironment: options?.loadEnvironment,
                baseUrl,
                baseUrls: options?.baseUrls
            });
            config = this.ctx.getLodConfig();
            const getEventGroup = ()=>entry ?? {
                    nodeId: finalNodeId,
                    url
                };
            const createResourceNode = (resourceUrl)=>({
                    nodeId: finalNodeId,
                    url: resourceUrl
                });
            const requestImmediateLodRefresh = ()=>{
                for (const manager of director.getAllManagers())manager.framesTillFullUpdate = 0;
            };
            assetLoader = new __WEBPACK_EXTERNAL_MODULE__lod_GSplatAssetLoader_js_b0649f9d__.GSplatAssetLoader(this.ctx.renderer, {
                maxConcurrentLoads: config.maxConcurrentLoads,
                maxRetries: 2,
                debug: false,
                withCredentials: this.ctx.withCredentials,
                onResourceLoaded: (resourceUrl)=>{
                    requestImmediateLodRefresh();
                    this.ctx.emit('nodeLoaded', {
                        node: createResourceNode(resourceUrl),
                        group: getEventGroup()
                    });
                },
                onResourceGpuReady: (resourceUrl)=>{
                    requestImmediateLodRefresh();
                    this.ctx.emit('nodeGpuReady', {
                        node: createResourceNode(resourceUrl),
                        group: getEventGroup()
                    });
                },
                onResourceFailed: (resourceUrl, error)=>{
                    this.ctx.emit('loadError', {
                        node: createResourceNode(resourceUrl),
                        group: getEventGroup(),
                        error
                    });
                }
            });
            octree.assetLoader = assetLoader;
            throwIfAborted(options?.signal);
            rootNode = new __WEBPACK_EXTERNAL_MODULE_three__.Object3D();
            rootNode.name = `LODGroup_${finalNodeId}`;
            applyTransform(rootNode, options);
            const boundingBox = sogLoader.getBoundingBox() ?? new __WEBPACK_EXTERNAL_MODULE_three__.Box3();
            let totalPointCount = 0;
            for (const node of octree.nodes)for (const lod of node.lods)if (lod.count > 0) {
                totalPointCount += lod.count;
                break;
            }
            config = this.ctx.getLodConfig();
            const placement = new __WEBPACK_EXTERNAL_MODULE__lod_GSplatPlacement_js_5aad7c85__.GSplatPlacement(null, rootNode);
            placement.octree = octree;
            placement.aabb = boundingBox;
            if ('number' == typeof config.lodBaseDistance) placement.lodBaseDistance = config.lodBaseDistance;
            if ('number' == typeof config.lodMultiplier) placement.lodMultiplier = config.lodMultiplier;
            placement.splatBudget = Math.max(1, Math.min(totalPointCount, config.maxCachePoints));
            layer = new __WEBPACK_EXTERNAL_MODULE__lod_Layer_js_879f5cf0__.Layer(`layer_${finalNodeId}`);
            layer.enabled = true;
            layer.addGSplatPlacement(placement);
            layerRegistrationAttempted = true;
            composition.addLayer(layer);
            for (const cameraComponent of composition.cameras)cameraComponent.addLayer(layer.id);
            const endMeshBuild = log.perf.time('meshBuild');
            try {
                renderMesh = new __WEBPACK_EXTERNAL_MODULE__core_UnifiedLODMesh_js_bdf4fc63__.UnifiedLODMesh(director, composition, layer, boundingBox);
            } finally{
                endMeshBuild();
            }
            renderMesh.name = `LODRenderMesh_${finalNodeId}`;
            rootNode.add(renderMesh);
            centersPoints = new __WEBPACK_EXTERNAL_MODULE__core_UnifiedLODCentersPoints_js_4f0d7848__.UnifiedLODCentersPoints(renderMesh);
            centersPoints.name = `LODCentersPoints_${finalNodeId}`;
            rootNode.add(centersPoints);
            sceneAttachmentAttempted = true;
            this.ctx.scene.add(rootNode);
            entry = {
                clientId,
                nodeId: finalNodeId,
                url,
                octree,
                placement,
                layer,
                rootNode,
                renderMesh,
                centersPoints,
                centersDisplayMode: 'gaussian-only',
                centersStyle: {
                    pointSize: __WEBPACK_EXTERNAL_MODULE__materials_CentersPointsMaterial_js_b278f5e6__.DEFAULT_CENTERS_STYLE.pointSize,
                    selectedColor: __WEBPACK_EXTERNAL_MODULE__materials_CentersPointsMaterial_js_b278f5e6__.DEFAULT_CENTERS_STYLE.selectedColor.clone(),
                    selectedOpacity: __WEBPACK_EXTERNAL_MODULE__materials_CentersPointsMaterial_js_b278f5e6__.DEFAULT_CENTERS_STYLE.selectedOpacity,
                    unselectedColor: __WEBPACK_EXTERNAL_MODULE__materials_CentersPointsMaterial_js_b278f5e6__.DEFAULT_CENTERS_STYLE.unselectedColor.clone(),
                    unselectedOpacity: __WEBPACK_EXTERNAL_MODULE__materials_CentersPointsMaterial_js_b278f5e6__.DEFAULT_CENTERS_STYLE.unselectedOpacity
                },
                boundingBox,
                totalPointCount,
                onLoadCompleteCallback: options?.onLoadComplete,
                loadCompleteCallbackFired: false,
                lastLoadingCount: void 0
            };
            registryRegistrationAttempted = true;
            this.ctx.registry.registerLOD(entry);
            this.ctx.syncLodConfig?.();
            this.ctx.emit('loadProgress', {
                loaded: 1,
                total: 1,
                group: entry
            });
            this.ctx.addForceCpuPick(finalNodeId);
            return {
                type: 'lod',
                id: finalNodeId,
                boundingBox: convertBox3ToBoundingBox(boundingBox),
                numSplats: totalPointCount,
                environmentUrl: octree.environmentUrl,
                environmentConfigured: null !== octree.environmentUrl,
                _raw: entry
            };
        } catch (error) {
            const runCleanup = (label, cleanup)=>{
                try {
                    cleanup();
                } catch (cleanupError) {
                    log.warn(`[ModelLoader] LOD rollback failed at ${label}: ` + (cleanupError instanceof Error ? cleanupError.message : String(cleanupError)));
                }
            };
            if (registryRegistrationAttempted) runCleanup('registry', ()=>{
                if (entry && this.ctx.registry.lodGroups.get(clientId) === entry) {
                    this.ctx.registry.unregisterLOD(clientId);
                    return;
                }
                if (this.ctx.registry.urlToClientId.get(url) === clientId) this.ctx.registry.urlToClientId.delete(url);
                if (this.ctx.registry.nodeIdToClientId.get(finalNodeId) === clientId) this.ctx.registry.nodeIdToClientId.delete(finalNodeId);
            });
            if (sceneAttachmentAttempted && rootNode) {
                const ownedRootNode = rootNode;
                runCleanup('scene-root', ()=>this.ctx.scene.remove(ownedRootNode));
            }
            if (centersPoints) {
                const ownedCentersPoints = centersPoints;
                runCleanup('centers-points', ()=>ownedCentersPoints.dispose());
            }
            if (renderMesh) {
                const ownedRenderMesh = renderMesh;
                runCleanup('render-mesh', ()=>ownedRenderMesh.dispose());
            }
            if (layerRegistrationAttempted && layer) {
                const ownedLayer = layer;
                runCleanup('layer', ()=>composition.removeLayer(ownedLayer));
            }
            if (octree) {
                const ownedOctree = octree;
                runCleanup('octree', ()=>ownedOctree.destroy());
            } else if (assetLoader) {
                const ownedAssetLoader = assetLoader;
                runCleanup('asset-loader', ()=>ownedAssetLoader.destroy());
            }
            if (isAbortError(error)) throw error;
            log.error('[ModelLoader] Failed to load LOD: ' + url + ', error: ' + (error instanceof Error ? error.message : String(error)));
            throw error;
        }
    }
    async loadSingleFile(url, options) {
        const extension = getFileExtension(url).toLowerCase();
        const clientId = generateNodeId();
        const finalNodeId = options?.nodeId ?? clientId;
        try {
            if ('.sog' === extension) return this.loadSingleSogFile(url, options, clientId, finalNodeId);
            if (!this.splatLoader) this.splatLoader = new __WEBPACK_EXTERNAL_MODULE__loaders_SplatLoader_js_2957c538__.SplatLoader();
            const splatData = await this.splatLoader.load(url);
            const mesh = new __WEBPACK_EXTERNAL_MODULE__core_GaussianSplatMesh_js_d31375fc__.GaussianSplatMesh(splatData, {
                enableSorting: true
            });
            mesh.name = `SingleFile_${finalNodeId}`;
            applyTransform(mesh, options);
            mesh.updateMatrixWorld(true);
            const boundingBox = new __WEBPACK_EXTERNAL_MODULE_three__.Box3().setFromObject(mesh);
            if (options?.autoAddToScene !== false) this.ctx.scene.add(mesh);
            const entry = {
                clientId,
                nodeId: finalNodeId,
                mesh,
                url,
                numSplats: splatData.numSplats,
                boundingBox
            };
            this.ctx.registry.registerSingle(entry);
            const result = {
                type: 'single',
                id: finalNodeId,
                boundingBox: convertBox3ToBoundingBox(boundingBox),
                numSplats: splatData.numSplats,
                environmentUrl: void 0,
                environmentConfigured: false,
                _raw: mesh
            };
            if (options?.onLoadComplete) options.onLoadComplete(result);
            return result;
        } catch (error) {
            log.error('[ModelLoader] Failed to load single file: ' + url + ', error: ' + (error instanceof Error ? error.message : String(error)));
            throw error;
        }
    }
    async loadSingleSogFile(url, options, clientId, finalNodeId) {
        const signal = options?.signal;
        throwIfAborted(signal);
        if (!this.sogBundleLoader) this.sogBundleLoader = new __WEBPACK_EXTERNAL_MODULE__loaders_SOGBundleLoader_js_f4e06486__.SOGBundleLoader({
            keepCompressed: true,
            debug: false,
            withCredentials: this.ctx.withCredentials
        });
        const sogsData = await this.sogBundleLoader.loadGpuData(url, {
            renderer: this.ctx.renderer,
            preuploadTextures: true,
            signal
        });
        let centers;
        let mesh = null;
        let addedToScene = false;
        let registered = false;
        try {
            throwIfAborted(signal);
            try {
                await sogsData.generateCenters(this.ctx.renderer, signal);
                throwIfAborted(signal);
                centers = sogsData.getCenters() ?? void 0;
            } catch (error) {
                if (isAbortError(error)) throw error;
                throwIfAborted(signal);
                const message = error instanceof Error ? error.message : 'Unknown error';
                log.warn(`[ModelLoader] SOG centers generation failed, sorting disabled: ${message}`);
            }
            const endMeshBuild = log.perf.time('meshBuild');
            try {
                mesh = new __WEBPACK_EXTERNAL_MODULE__core_GaussianSogsMesh_js_77b0a45e__.GaussianSogsMesh(sogsData, {
                    enableSorting: void 0 !== centers,
                    centers
                });
            } finally{
                endMeshBuild();
            }
            throwIfAborted(signal);
            mesh.name = `SingleFile_${finalNodeId}`;
            applyTransform(mesh, options);
            mesh.updateMatrixWorld(true);
            const boundingBox = new __WEBPACK_EXTERNAL_MODULE_three__.Box3().setFromObject(mesh);
            if (options?.autoAddToScene !== false) {
                throwIfAborted(signal);
                this.ctx.scene.add(mesh);
                addedToScene = true;
            }
            throwIfAborted(signal);
            const entry = {
                clientId,
                nodeId: finalNodeId,
                mesh,
                url,
                numSplats: sogsData.numSplats,
                boundingBox
            };
            this.ctx.registry.registerSingle(entry);
            registered = true;
            throwIfAborted(signal);
            const result = {
                type: 'single',
                id: finalNodeId,
                boundingBox: convertBox3ToBoundingBox(boundingBox),
                numSplats: sogsData.numSplats,
                environmentUrl: void 0,
                environmentConfigured: false,
                _raw: mesh
            };
            if (options?.onLoadComplete) options.onLoadComplete(result);
            throwIfAborted(signal);
            return result;
        } catch (error) {
            if (registered) this.ctx.registry.unregisterSingle(clientId);
            if (mesh) {
                if (addedToScene) this.ctx.scene.remove(mesh);
                mesh.dispose();
            } else sogsData.destroy();
            throw error;
        }
    }
}
function generateNodeId() {
    return `gs3d_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
function throwIfAborted(signal) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
}
function isAbortError(error) {
    return 'object' == typeof error && null !== error && 'name' in error && 'AbortError' === error.name;
}
function getFileExtension(url) {
    let pathToExtract = decodeUrlSafe(url);
    const queryPathMatch = pathToExtract.match(/^([^?]+\?path=)(.*)$/);
    if (queryPathMatch) pathToExtract = queryPathMatch[2];
    else {
        const localFileMatch = pathToExtract.match(/^(https?:\/\/[^/]+\/local-file\/)(.+)$/);
        pathToExtract = localFileMatch ? localFileMatch[2] : pathToExtract.split('?')[0].split('#')[0];
    }
    try {
        pathToExtract = decodeURIComponent(pathToExtract);
    } catch  {}
    const lastSlash = Math.max(pathToExtract.lastIndexOf('/'), pathToExtract.lastIndexOf('\\'));
    const fileName = -1 !== lastSlash ? pathToExtract.substring(lastSlash + 1) : pathToExtract;
    const lastDot = fileName.lastIndexOf('.');
    return -1 !== lastDot ? fileName.substring(lastDot).toLowerCase() : '';
}
function decodeUrlSafe(url) {
    try {
        return decodeURIComponent(url);
    } catch  {
        return url;
    }
}
function convertBox3ToBoundingBox(box) {
    return {
        min: {
            x: box.min.x,
            y: box.min.y,
            z: box.min.z
        },
        max: {
            x: box.max.x,
            y: box.max.y,
            z: box.max.z
        }
    };
}
function applyTransform(obj, options) {
    if (options?.position) obj.position.set(options.position.x, options.position.y, options.position.z);
    if (options?.rotation) obj.rotation.set(options.rotation.x, options.rotation.y, options.rotation.z);
    if (options?.scale) obj.scale.set(options.scale.x, options.scale.y, options.scale.z);
}
export { ModelLoader, convertBox3ToBoundingBox };
