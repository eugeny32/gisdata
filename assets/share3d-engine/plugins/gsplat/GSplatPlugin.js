import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__export_SplatExporter_js_23a7219b__ from "./export/SplatExporter.js";
import * as __WEBPACK_EXTERNAL_MODULE__managerRegistry_js_d42665f7__ from "./managerRegistry.js";
import * as __WEBPACK_EXTERNAL_MODULE__sorting_GSplatUnifiedSorter_js_9704e452__ from "./sorting/GSplatUnifiedSorter.js";
import * as __WEBPACK_EXTERNAL_MODULE__sorting_SplatSorter_js_93127460__ from "./sorting/SplatSorter.js";
import * as __WEBPACK_EXTERNAL_MODULE__spatial_GSplatPickManager_js_0243191c__ from "./spatial/GSplatPickManager.js";
import * as __WEBPACK_EXTERNAL_MODULE__runtime_ExporterRegistry_js_37525b6f__ from "../../runtime/ExporterRegistry.js";
import * as __WEBPACK_EXTERNAL_MODULE__runtime_LoaderRegistry_js_be00e9c5__ from "../../runtime/LoaderRegistry.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__ from "../../shared/logging/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_c632c149__ from "../../shared/types/assets.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_utils_index_js_83ff7f8f__ from "../../shared/utils/index.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__.getLoggerManager)().getLogger('gsplat');
const memoryLog = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__.getLoggerManager)().getLogger('gsplat:memory');
async function adaptLoadResult(getManager, source, context) {
    const manager = getManager();
    const result = await manager.load(source.url, {
        ...source.options,
        signal: context.signal ?? source.options?.signal
    });
    if (context.signal?.aborted) {
        manager.removeByNodeId(result.id);
        throw new DOMException('Load aborted', 'AbortError');
    }
    context.onProgress?.(1);
    return convertLoadResult(result, manager);
}
function convertLoadResult(result, manager) {
    const { boundingBox, numSplats, id } = result;
    const bbox = new __WEBPACK_EXTERNAL_MODULE_three__.Box3(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(boundingBox.min.x, boundingBox.min.y, boundingBox.min.z), new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(boundingBox.max.x, boundingBox.max.y, boundingBox.max.z));
    const root = {
        index: 0,
        boundingBox: bbox,
        splatCount: numSplats,
        level: 0,
        children: [],
        loaded: true
    };
    const nodeLoader = {
        load (_node, _signal) {
            return Promise.resolve(new ArrayBuffer(0));
        },
        dispose () {
            manager.removeByNodeId(id);
        }
    };
    return {
        metadata: {
            boundingBox: bbox,
            splatCount: numSplats
        },
        root,
        nodeLoader
    };
}
const LOADER_DEFS = [
    {
        format: 'lod-meta',
        detectPriority: 10,
        pattern: /\.json(?:$|[?#])/i
    },
    {
        format: 'sog',
        detectPriority: 5,
        pattern: /\.sog(?:$|[?#])/i
    },
    {
        format: 'splat',
        detectPriority: 3,
        pattern: /\.splat(?:$|[?#])/i
    },
    {
        format: 'ply',
        detectPriority: 0,
        pattern: /\.ply(?:$|[?#])/i
    }
];
function createGSplatLoader(def, getManager) {
    return {
        format: def.format,
        detectPriority: def.detectPriority,
        canLoad: (source)=>def.pattern.test(source.url),
        load: (source, context)=>adaptLoadResult(getManager, source, context)
    };
}
function createGSplatExporter(format, getSplatData, exportFn) {
    const exporter = new __WEBPACK_EXTERNAL_MODULE__export_SplatExporter_js_23a7219b__.SplatExporter();
    return {
        format,
        export: async (handle, _options)=>{
            const splatData = getSplatData(handle);
            return exportFn(exporter, splatData);
        }
    };
}
class FormatNotSupportedError extends Error {
    constructor(url, formats){
        super(`无法加载 "${url}"：不支持该格式。已注册格式: ${formats.join(', ')}`);
        this.name = 'FormatNotSupportedError';
        this.url = url;
        this.formats = formats;
    }
}
const DEFAULT_CONFIG = {
    sortingMode: 'gpu',
    qualityLevel: 'medium',
    maxSplats: 5000000,
    opacity: 1.0
};
const EMPTY_LOD_STATS = {
    totalGroups: 0,
    visibleNodes: 0,
    loadedNodes: 0,
    cachedPoints: 0,
    pendingLoads: 0,
    activeLoads: 0,
    cachedFiles: 0
};
class GaussianSplatPlugin {
    static #_ = this.MOVE_CENTER_PICK_SIZE = 12;
    static #_2 = this.CLICK_CENTER_PICK_SIZE = 8;
    constructor(options){
        this.name = 'gaussian-splat';
        this.kind = 'gaussian-splat';
        this.priority = 40;
        this.phases = [
            __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_c632c149__.RenderPhase.Prepare,
            __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_c632c149__.RenderPhase.MainTransparent
        ];
        this.renderPriority = 0;
        this.dependencies = [
            'CameraRig',
            'RenderPipeline',
            'PickingService'
        ];
        this.provides = [
            'GaussianSplatService'
        ];
        this.assets = new Map();
        this.assetResults = new Map();
        this.pendingLoads = new Map();
        this.disposed = false;
        this.config = {
            ...DEFAULT_CONFIG
        };
        this.preparedView = null;
        this.transientActivityReasons = new Set();
        this.activeShaderEffects = new Map();
        this.workBufferAlwaysNodeIds = new Set();
        this.managerEventCleanups = [];
        this.isolatedGsplatScene = new __WEBPACK_EXTERNAL_MODULE_three__.Scene();
        const backendMap = {
            playcanvas: 'playcanvas'
        };
        this.backend = backendMap[options?.backend ?? 'playcanvas'] ?? 'playcanvas';
        this.lodConfig = options?.lodConfig ? {
            ...options.lodConfig
        } : void 0;
        this.withCredentials = options?.withCredentials ?? false;
        this.loaders = new __WEBPACK_EXTERNAL_MODULE__runtime_LoaderRegistry_js_be00e9c5__.LoaderRegistry();
        this.exporters = new __WEBPACK_EXTERNAL_MODULE__runtime_ExporterRegistry_js_37525b6f__.ExporterRegistry();
        const getManager = ()=>this.manager;
        for (const def of LOADER_DEFS)this.loaders.register(createGSplatLoader(def, getManager));
        const getSplatData = (handle)=>{
            const model = getManager().getByNodeId(handle.id);
            if (!model?.splatData) throw new Error(`[GaussianSplatPlugin] 无法获取 SplatData，资产 "${handle.id}" 不支持导出`);
            return model.splatData;
        };
        this.exporters.register(createGSplatExporter('ply', getSplatData, (e, d)=>e.exportPly(d)));
        this.exporters.register(createGSplatExporter('splat', getSplatData, (e, d)=>e.exportSplat(d)));
        this.exporters.register(createGSplatExporter('compressed-ply', getSplatData, (e, d)=>e.exportCompressedPly(d)));
        for (const loader of options?.extraLoaders ?? [])this.loaders.register(loader);
        for (const exporter of options?.extraExporters ?? [])this.exporters.register(exporter);
    }
    onInit(context) {
        this.context = context;
        this.manager = this._createManager(context);
        context.registerService('GaussianSplatService', this);
        log.debug(`[GaussianSplatPlugin] initialized, backend=${this.backend}, withCredentials=${this.withCredentials}`);
    }
    onStart() {
        const pipeline = this.context.getService('RenderPipeline');
        pipeline.addRenderContributor(this);
        this._bindManagerInvalidationEvents();
        const picking = this.context.getService('PickingService');
        picking.addProvider(this);
        log.debug('[GaussianSplatPlugin] started, renderContributor=true, pickProvider=true');
        if (this.context.hasService('ClipService')) this.context.disposables.track(this.context.getService('ClipService').onChanged((volumes)=>this._applyClipVolumes(volumes)));
    }
    onDestroy() {
        const pipeline = this.context.getService('RenderPipeline');
        pipeline.removeRenderContributor(this);
        const picking = this.context.getService('PickingService');
        picking.removeProvider(this);
        if (this.pendingLoads.size > 0 || this.assets.size > 0) log.debug(`[GaussianSplatPlugin] destroying, pendingLoads=${this.pendingLoads.size}, assets=${this.assets.size}`);
        for (const [_id, controller] of this.pendingLoads)controller.abort();
        this.pendingLoads.clear();
        this.disposed = true;
        this._clearManagerInvalidationEvents();
        this.transientActivityReasons.clear();
        this.activeShaderEffects.clear();
        this.workBufferAlwaysNodeIds.clear();
        this.dispose();
        this.manager.dispose();
        this.preparedView = null;
        this._logDestroySummary();
    }
    async load(request) {
        const id = request.id ?? (0, __WEBPACK_EXTERNAL_MODULE__shared_utils_index_js_83ff7f8f__.generateId)();
        const controller = new AbortController();
        this.pendingLoads.set(id, controller);
        const loadStart = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__.getLoggerManager)().now();
        request = {
            ...request,
            options: {
                ...request.options,
                nodeId: id
            }
        };
        let abortHandler;
        if (request.signal) {
            if (request.signal.aborted) controller.abort();
            else {
                abortHandler = ()=>controller.abort();
                request.signal.addEventListener('abort', abortHandler, {
                    once: true
                });
            }
        }
        this.context.events.emit('asset.loading', {
            id,
            kind: this.kind
        });
        log.debug(`[GaussianSplatPlugin] load started, id=${id}, format=${request.format ?? 'auto'}, url=${request.url}`);
        try {
            if (controller.signal.aborted) {
                log.debug(`[GaussianSplatPlugin] load aborted before loader, id=${id}, url=${request.url}`);
                throw new DOMException('Aborted', 'AbortError');
            }
            const loader = request.format ? this.loaders.get(request.format) : this.loaders.detect(request);
            if (!loader) throw new FormatNotSupportedError(request.url, this.loaders.formats());
            log.debug(`[GaussianSplatPlugin] loader selected, id=${id}, format=${loader.format}`);
            const abortRacePromise = new Promise((_, reject)=>{
                controller.signal.addEventListener('abort', ()=>reject(new DOMException('Aborted', 'AbortError')), {
                    once: true
                });
            });
            const loaderPromise = loader.load(request, {
                signal: controller.signal,
                onProgress: (p)=>this.context.events.emit('asset.progress', {
                        id,
                        kind: this.kind,
                        progress: p,
                        loaded: p,
                        total: 1
                    })
            });
            const result = await Promise.race([
                loaderPromise,
                abortRacePromise
            ]);
            if (this.disposed || controller.signal.aborted) {
                this._disposeLoadResult(result);
                throw new DOMException('Aborted', 'AbortError');
            }
            const handle = this._createHandle(id, result, request);
            this.context.events.emit('asset.loaded', {
                id,
                kind: this.kind
            });
            this._markVisualActivity('gsplat.assetLoaded', id);
            log.debug(`[GaussianSplatPlugin] load completed, id=${id}, format=${loader.format}, splats=${handle.numSplats}, elapsed=${((0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__.getLoggerManager)().now() - loadStart).toFixed(1)}ms`);
            return handle;
        } catch (err) {
            if (err instanceof DOMException && 'AbortError' === err.name) log.debug(`[GaussianSplatPlugin] load aborted, id=${id}, url=${request.url}`);
            else {
                log.error(`[GaussianSplatPlugin] load failed, id=${id}, url=${request.url}, reason=${err instanceof Error ? err.message : String(err)}`);
                this.context.events.emit('asset.error', {
                    id,
                    kind: this.kind,
                    error: err instanceof Error ? err : new Error(String(err))
                });
            }
            throw err;
        } finally{
            if (request.signal && abortHandler) request.signal.removeEventListener('abort', abortHandler);
            this.pendingLoads.delete(id);
            log.debug(`[GaussianSplatPlugin] load settled, id=${id}, pendingLoads=${this.pendingLoads.size}`);
        }
    }
    mount(handle) {
        const obj = handle.object3D;
        if (!obj) {
            log.warn(`[GaussianSplatPlugin] mount 跳过：资产 "${handle.id}" 缺少 object3D`);
            return;
        }
        if (obj instanceof __WEBPACK_EXTERNAL_MODULE_three__.Object3D) (0, __WEBPACK_EXTERNAL_MODULE__shared_utils_index_js_83ff7f8f__.setMaskRecursive)(obj, obj.layers.mask);
        const root = this.context.sceneGraph.gaussianSplatRoot;
        root.add(obj);
        this._markVisualActivity('gsplat.mounted', handle.id);
        this.context.sceneBounds?.register({
            id: handle.id,
            kind: this.kind,
            object3D: obj,
            getLocalBoundingBox: ()=>handle.boundingBox,
            isVisible: ()=>handle.visible
        });
        this.context.events.emit('asset.mounted', {
            id: handle.id,
            kind: this.kind
        });
        log.debug(`[GaussianSplatPlugin] mounted, id=${handle.id}, splats=${handle.numSplats}, assets=${this.assets.size}`);
    }
    unmount(id) {
        const handle = this.assets.get(id);
        if (!handle) {
            log.warn(`[GaussianSplatPlugin] unmount 跳过：未找到资产 "${id}"`);
            return;
        }
        this.context.sceneBounds?.unregister(this.kind, id);
        const obj = handle.object3D;
        if (obj?.parent) obj.parent.remove(obj);
        this.manager.removeByNodeId(id);
        this._clearNodeActivity(id);
        this.context.events.emit('asset.unmounted', {
            id,
            kind: this.kind
        });
        log.debug(`[GaussianSplatPlugin] unmounted, id=${id}, assets=${this.assets.size}`);
    }
    getAsset(id) {
        return this.assets.get(id);
    }
    getAll() {
        return Array.from(this.assets.values());
    }
    getByUrl(url) {
        for (const handle of this.assets.values())if (handle.url === url) return handle;
    }
    isLoading(url) {
        return this.manager?.isLoading?.(url) ?? false;
    }
    setVisibility(id, visible) {
        const handle = this.assets.get(id);
        if (handle) {
            handle.visible = visible;
            if (handle.object3D) handle.object3D.visible = visible;
            this.manager.setVisible?.(id, visible);
            this._markVisualActivity('gsplat.visibility', id);
            this.context.events.emit('asset.visibilityChanged', {
                id,
                visible
            });
        }
    }
    getRenderActivity(context) {
        if (0 === context.renderedViewIds.length) {
            this.transientActivityReasons.clear();
            return {
                needsNextFrame: false,
                reasons: []
            };
        }
        const reasons = Array.from(this.transientActivityReasons);
        this.transientActivityReasons.clear();
        if (this.hasActiveShaderEffects()) reasons.push('gsplat.shaderEffect');
        if (this.workBufferAlwaysNodeIds.size > 0) reasons.push('gsplat.workBufferAlways');
        const managerActivity = this.manager.getVisualActivitySnapshot?.();
        if (managerActivity?.needsNextFrame) reasons.push(...managerActivity.reasons);
        return {
            needsNextFrame: reasons.length > 0,
            reasons: Array.from(new Set(reasons))
        };
    }
    render(frame, phase, ctx) {
        if (!this.context || !this.manager) return;
        if (phase === __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_c632c149__.RenderPhase.Prepare) {
            this._prepareView(frame);
            return;
        }
        if (phase !== __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_c632c149__.RenderPhase.MainTransparent) return;
        this._prepareView(frame);
        const hasVisibleGsplat = Array.from(this.assets.values()).some((handle)=>handle.visible && handle.object3D?.visible !== false);
        if (!hasVisibleGsplat) return;
        const { renderer } = ctx;
        const gsplatRoot = this.context.sceneGraph.gaussianSplatRoot;
        const savedTarget = renderer.getRenderTarget();
        const savedViewport = 'function' == typeof renderer.getViewport ? renderer.getViewport(new __WEBPACK_EXTERNAL_MODULE_three__.Vector4()) : null;
        const savedScissor = 'function' == typeof renderer.getScissor ? renderer.getScissor(new __WEBPACK_EXTERNAL_MODULE_three__.Vector4()) : null;
        const savedScissorTest = 'function' == typeof renderer.getScissorTest ? renderer.getScissorTest() : false;
        renderer.setRenderTarget(ctx.outputTarget);
        renderer.setViewport(ctx.viewport.x, ctx.viewport.y, ctx.viewport.width, ctx.viewport.height);
        renderer.setScissor(ctx.viewport.x, ctx.viewport.y, ctx.viewport.width, ctx.viewport.height);
        renderer.setScissorTest(true);
        const restoreGsplatRootParent = this._attachGsplatRootToIsolatedScene(gsplatRoot);
        try {
            renderer.render(this.isolatedGsplatScene, frame.camera);
        } finally{
            restoreGsplatRootParent();
            if (savedViewport) renderer.setViewport(savedViewport.x, savedViewport.y, savedViewport.z, savedViewport.w);
            if (savedScissor) renderer.setScissor(savedScissor.x, savedScissor.y, savedScissor.z, savedScissor.w);
            renderer.setScissorTest(savedScissorTest);
            renderer.setRenderTarget(savedTarget);
        }
    }
    pick(query) {
        if (!this.manager) return null;
        const managerAny = this.manager;
        if ('function' == typeof managerAny.pick) {
            const viewRect = query.viewport ?? query.viewRect;
            const localScreenX = query.screen && viewRect ? query.screen.x - viewRect.x : query.screen?.x;
            const localScreenY = query.screen && viewRect ? query.screen.y - viewRect.y : query.screen?.y;
            const raw = managerAny.pick(query.ray, query.camera, {
                interactionType: query.interactionType,
                centerSphereRadius: query.centerSphereRadius,
                windowSize: query.windowSize,
                gpuOnly: query.gpuOnly,
                prewarmGpu: query.prewarmGpu,
                screenX: localScreenX,
                screenY: localScreenY,
                screenWidth: viewRect?.width,
                screenHeight: viewRect?.height,
                layerMask: query.layerMask
            });
            if (raw?.location) {
                const assetId = this._resolveAssetId(raw.splatInfo) ?? '';
                const loc = raw.location;
                const point = loc instanceof __WEBPACK_EXTERNAL_MODULE_three__.Vector3 ? loc : new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(loc.x, loc.y, loc.z);
                return {
                    assetId,
                    kind: this.kind,
                    point,
                    distance: raw.distance ?? query.ray.origin.distanceTo(point),
                    normal: raw.normal,
                    _raw: raw
                };
            }
            return null;
        }
        if (query.gpuOnly) return null;
        const pointSize = 'move' === query.interactionType ? GaussianSplatPlugin.MOVE_CENTER_PICK_SIZE : GaussianSplatPlugin.CLICK_CENTER_PICK_SIZE;
        return this._pickWithScreenCenters(query, pointSize);
    }
    _pickWithScreenCenters(query, pointSize) {
        const managerAny = this.manager;
        if ('function' != typeof managerAny.pickCenter || !query.screen || !query.viewport) return null;
        const screenX = query.screen.x - query.viewport.x;
        const screenY = query.screen.y - query.viewport.y;
        const hits = managerAny.pickCenter(screenX, screenY, query.camera, {
            pointSize,
            closestOnly: true,
            screenWidth: query.viewport.width,
            screenHeight: query.viewport.height
        });
        if (!Array.isArray(hits) || 0 === hits.length) return null;
        const raw = hits[0];
        if (!raw?.worldPosition) return null;
        const point = raw.worldPosition instanceof __WEBPACK_EXTERNAL_MODULE_three__.Vector3 ? raw.worldPosition.clone() : new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(raw.worldPosition.x, raw.worldPosition.y, raw.worldPosition.z);
        return {
            assetId: this._resolveAssetId(raw.splatInfo) ?? '',
            kind: this.kind,
            point,
            distance: query.ray.origin.distanceTo(point),
            _raw: raw
        };
    }
    _resolveAssetId(splatInfo) {
        if (!splatInfo?.node) return;
        const node = splatInfo.node;
        for (const id of this.assets.keys()){
            const entry = this.manager.getByNodeId(id);
            if (!!entry) {
                if (entry.rootNode === node || entry === node || entry.mesh === node) return id;
            }
        }
    }
    dispose(id) {
        if (void 0 !== id) {
            const pending = this.pendingLoads.get(id);
            if (pending) {
                pending.abort();
                this.pendingLoads.delete(id);
            }
            this._disposeAssetResult(id);
            const existed = this.assets.delete(id);
            if (existed) this.context.events.emit('asset.disposed', {
                id,
                kind: this.kind
            });
        } else {
            for (const assetId of Array.from(this.assets.keys())){
                this._disposeAssetResult(assetId);
                this.context.events.emit('asset.disposed', {
                    id: assetId,
                    kind: this.kind
                });
            }
            this.assets.clear();
        }
    }
    async export(id, format, options) {
        const handle = this.assets.get(id);
        if (!handle) throw new Error(`[GaussianSplatPlugin] export 失败：未找到资产 "${id}"`);
        const exporter = this.exporters.get(format);
        if (!exporter) throw new FormatNotSupportedError(`(export:${id})`, this.exporters.formats());
        try {
            this.context.events.emit('asset.exportStarted', {
                id,
                kind: this.kind,
                format
            });
            const blob = await exporter.export(handle, options);
            this.context.events.emit('asset.exportCompleted', {
                id,
                kind: this.kind,
                format
            });
            return blob;
        } catch (err) {
            this.context.events.emit('asset.exportError', {
                id,
                kind: this.kind,
                format,
                error: err instanceof Error ? err : new Error(String(err))
            });
            throw err;
        }
    }
    getConfig() {
        return {
            ...this.config
        };
    }
    setConfig(config) {
        Object.assign(this.config, config);
        this._markVisualActivity('gsplat.config');
        if (log.isEnabled(__WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__.LogLevel.DEBUG)) {
            const keys = Object.keys(config).join(',');
            log.debug(`[GaussianSplatPlugin] render config updated, keys=${keys}`);
        }
    }
    setLodConfig(config) {
        this.lodConfig = {
            ...this.lodConfig ?? {},
            ...config
        };
        if (this.manager) this.manager.setConfig(config);
        this._markVisualActivity('gsplat.lodConfig');
        if (log.isEnabled(__WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__.LogLevel.DEBUG)) {
            const keys = Object.keys(config).join(',');
            log.debug(`[GaussianSplatPlugin] lod config updated, keys=${keys}`);
        }
    }
    getLodConfig() {
        if (!this.manager) throw new Error('[GaussianSplatPlugin] getLodConfig called before onInit');
        return this.manager.getConfig();
    }
    getLodStats() {
        if (!this.manager) throw new Error('[GaussianSplatPlugin] getLodStats called before onInit');
        return this.manager.getStats();
    }
    getDeviceBudgetDiagnostics() {
        if (!this.manager) throw new Error('[GaussianSplatPlugin] getDeviceBudgetDiagnostics called before onInit');
        return this.manager.getDeviceBudgetDiagnostics();
    }
    _logDestroySummary() {
        if (!memoryLog.isEnabled(__WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__.LogLevel.INFO)) return;
        try {
            const standardSorter = (0, __WEBPACK_EXTERNAL_MODULE__sorting_SplatSorter_js_93127460__.getSplatSorterMemoryDiagnostics)();
            const unifiedSorter = (0, __WEBPACK_EXTERNAL_MODULE__sorting_GSplatUnifiedSorter_js_9704e452__.getUnifiedSorterMemoryDiagnostics)();
            const picker = __WEBPACK_EXTERNAL_MODULE__spatial_GSplatPickManager_js_0243191c__.GSplatPickManager.getGpuPickerDiagnostics(this.context.renderer);
            memoryLog.info(`event=gsplat.memory engineId=${this.context?.memoryDiagnosticId ?? 0} phase=plugin.destroyed scope=plugin elapsedMs=0 assets=${this.assets.size} pending=${this.pendingLoads.size} results=${this.assetResults.size} standardWorkersActive=${standardSorter.workersActive} standardBlobUrlsActive=${standardSorter.blobUrlsActive} unifiedWorkersActive=${unifiedSorter.workersActive} unifiedBlobUrlsActive=${unifiedSorter.blobUrlsActive} pickerExists=${picker.exists} pickMaterials=${picker.pickMaterials}`);
        } catch  {}
    }
    _applyClipVolumes(volumes) {
        const globalVolumes = volumes.filter((volume)=>null == volume.viewId);
        const managerAny = this.manager;
        if ('function' == typeof managerAny.setClipVolumes) {
            managerAny.setClipVolumes(globalVolumes);
            this._markVisualActivity('gsplat.clipVolumes');
        }
    }
    _bindManagerInvalidationEvents() {
        if ('function' != typeof this.manager.on || 'function' != typeof this.manager.off) return;
        const bind = (event, reason)=>{
            const handler = ()=>this._markVisualActivity(reason);
            this.manager.on(event, handler);
            this.managerEventCleanups.push(()=>this.manager.off(event, handler));
        };
        bind('loadProgress', 'gsplat.lodMetaReady');
        bind('nodeLoaded', 'gsplat.lodReady');
        bind('nodeGpuReady', 'gsplat.lodGpuReady');
        bind('nodeUnloaded', 'gsplat.lodUnloaded');
        bind('sortReady', 'gsplat.sortReady');
        const loadErrorHandler = (data)=>{
            this._markVisualActivity('gsplat.lodError');
            const node = 'object' == typeof data.node && null !== data.node ? data.node : {};
            if ('string' != typeof node.nodeId || 0 === node.nodeId.length) {
                this.context.events.emit('engine.error', {
                    error: data.error,
                    context: 'gsplat.lod'
                });
                return;
            }
            const resourceUrl = 'string' == typeof node.url ? node.url : '';
            log.warn(resourceUrl ? `[GaussianSplatPlugin] LOD 资源已耗尽重试，将跳过并继续加载：${resourceUrl} (${data.error.message})` : `[GaussianSplatPlugin] LOD 资源已耗尽重试，将跳过并继续加载：${data.error.message}`);
        };
        this.manager.on('loadError', loadErrorHandler);
        this.managerEventCleanups.push(()=>this.manager.off('loadError', loadErrorHandler));
    }
    _clearManagerInvalidationEvents() {
        for(let i = this.managerEventCleanups.length - 1; i >= 0; i--)this.managerEventCleanups[i]();
        this.managerEventCleanups.length = 0;
    }
    hasActiveShaderEffects() {
        for (const effect of this.activeShaderEffects.values())if (effect.enabled) return true;
        return false;
    }
    _markVisualActivity(reason, nodeId) {
        this.transientActivityReasons.add(reason);
        this.context?.renderInvalidation?.invalidate(reason, nodeId ? {
            detail: nodeId
        } : void 0);
    }
    _clearNodeActivity(nodeId) {
        this.activeShaderEffects.delete(nodeId);
        this.workBufferAlwaysNodeIds.delete(nodeId);
    }
    _createManager(context) {
        return (0, __WEBPACK_EXTERNAL_MODULE__managerRegistry_js_d42665f7__.createGS3DManager)({
            engine: this.backend,
            scene: this.isolatedGsplatScene,
            renderer: context.renderer,
            lodConfig: this.lodConfig,
            withCredentials: this.withCredentials
        });
    }
    _attachGsplatRootToIsolatedScene(gsplatRoot) {
        const originalParent = gsplatRoot.parent;
        const originalIndex = originalParent?.children.indexOf(gsplatRoot) ?? -1;
        if (originalParent) originalParent.remove(gsplatRoot);
        this.isolatedGsplatScene.add(gsplatRoot);
        return ()=>{
            this.isolatedGsplatScene.remove(gsplatRoot);
            if (!originalParent) return;
            originalParent.add(gsplatRoot);
            const restoredIndex = originalParent.children.indexOf(gsplatRoot);
            if (originalIndex >= 0 && restoredIndex >= 0 && restoredIndex !== originalIndex) {
                originalParent.children.splice(restoredIndex, 1);
                originalParent.children.splice(Math.min(originalIndex, originalParent.children.length), 0, gsplatRoot);
            }
        };
    }
    _prepareView(frame) {
        if (this.preparedView?.frameNumber === frame.frameNumber && this.preparedView.viewId === frame.viewId) return;
        this.manager.update(frame.camera, frame.manualFrame?.deterministic ? {
            effectDelta: 0,
            logicalFrameId: frame.frameNumber,
            logicalFrameSource: this
        } : {
            effectDelta: frame.delta,
            logicalFrameId: frame.frameNumber,
            logicalFrameSource: this
        });
        this.preparedView = {
            frameNumber: frame.frameNumber,
            viewId: frame.viewId
        };
    }
    _extractObject3D(nodeId) {
        const model = this.manager.getByNodeId(nodeId);
        if (!model) return null;
        let obj = null;
        if (model instanceof __WEBPACK_EXTERNAL_MODULE_three__.Object3D) obj = model;
        else if ('object' == typeof model && null !== model && 'rootNode' in model) {
            const entry = model;
            if (entry.rootNode instanceof __WEBPACK_EXTERNAL_MODULE_three__.Object3D) obj = entry.rootNode;
        }
        if (obj?.parent) obj.parent.remove(obj);
        return obj;
    }
    _createHandle(id, result, request) {
        const nodeId = id;
        const manager = this.manager;
        const plugin = this;
        const object3D = this._extractObject3D(nodeId);
        if (!object3D) log.debug(`[GaussianSplatPlugin] object3D not found after load, id=${id}`);
        const handle = {
            id,
            kind: 'gaussian-splat',
            url: request.url,
            name: request.name ?? request.url,
            visible: true,
            boundingBox: result.metadata.boundingBox,
            object3D,
            numSplats: result.metadata.splatCount,
            get lodStats () {
                try {
                    return manager.getStats();
                } catch  {
                    return {
                        ...EMPTY_LOD_STATS
                    };
                }
            },
            setScalarFilter (options) {
                const applied = manager.setScalarFilter(nodeId, options);
                if (applied) plugin._markVisualActivity('gsplat.scalarFilter', nodeId);
                return applied;
            },
            clearScalarFilter () {
                const applied = manager.clearScalarFilter(nodeId);
                if (applied) plugin._markVisualActivity('gsplat.scalarFilter', nodeId);
                return applied;
            },
            async getScalarHistogram (options) {
                return manager.getScalarHistogram(nodeId, options);
            },
            setCentersDisplayMode (mode) {
                const applied = manager.setCentersDisplayMode ? manager.setCentersDisplayMode(nodeId, mode) : false;
                if (applied) plugin._markVisualActivity('gsplat.centersDisplay', nodeId);
                return applied;
            },
            setBoxHelperVisible (visible) {
                manager.setBoxHelperVisible(visible, [
                    nodeId
                ]);
                plugin._markVisualActivity('gsplat.boxHelper', nodeId);
            },
            setCentersStyle (style) {
                const applied = manager.setCentersStyle ? manager.setCentersStyle(nodeId, style) : false;
                if (applied) plugin._markVisualActivity('gsplat.centersStyle', nodeId);
                return applied;
            },
            setColorSpaceConfig (config) {
                manager.setColorSpaceConfig?.(config);
                plugin._markVisualActivity('gsplat.colorSpace', nodeId);
            },
            setColorAdjustment (options) {
                const applied = manager.setColorAdjustment?.(nodeId, options) ?? false;
                if (applied) plugin._markVisualActivity('gsplat.colorAdjustment', nodeId);
                return applied;
            },
            getColorAdjustment () {
                return manager.getColorAdjustment?.(nodeId);
            },
            resetColorAdjustment () {
                const applied = manager.resetColorAdjustment?.(nodeId) ?? false;
                if (applied) plugin._markVisualActivity('gsplat.colorAdjustment', nodeId);
                return applied;
            },
            setShaderEffect (effect) {
                const applied = manager.setShaderEffect?.(nodeId, effect) ?? false;
                if (applied) {
                    if (effect) plugin.activeShaderEffects.set(nodeId, effect);
                    else plugin.activeShaderEffects.delete(nodeId);
                    plugin._markVisualActivity('gsplat.shaderEffect', nodeId);
                }
                return applied;
            },
            clearShaderEffect () {
                const applied = manager.clearShaderEffect?.(nodeId) ?? false;
                if (applied) {
                    plugin.activeShaderEffects.delete(nodeId);
                    plugin._markVisualActivity('gsplat.shaderEffect', nodeId);
                }
                return applied;
            },
            restartShaderEffect () {
                const applied = manager.restartShaderEffect?.(nodeId) ?? false;
                if (applied) {
                    const effect = manager.getShaderEffect?.(nodeId);
                    if (effect) plugin.activeShaderEffects.set(nodeId, effect);
                    plugin._markVisualActivity('gsplat.shaderEffect', nodeId);
                }
                return applied;
            },
            setShaderEffectUniform (name, value) {
                const applied = manager.setShaderEffectUniform?.(nodeId, name, value) ?? false;
                if (applied) plugin._markVisualActivity('gsplat.shaderEffectUniform', nodeId);
                return applied;
            },
            setWorkBufferModifier (modifier) {
                const applied = manager.setWorkBufferModifier?.(nodeId, modifier) ?? false;
                if (applied) plugin._markVisualActivity('gsplat.workBuffer', nodeId);
                return applied;
            },
            setWorkBufferUpdateMode (mode) {
                const applied = manager.setWorkBufferUpdateMode?.(nodeId, mode) ?? false;
                if (applied) {
                    if ('always' === mode) plugin.workBufferAlwaysNodeIds.add(nodeId);
                    else plugin.workBufferAlwaysNodeIds.delete(nodeId);
                    plugin._markVisualActivity('gsplat.workBuffer', nodeId);
                }
                return applied;
            },
            setSceneOrigin (offset) {
                const applied = manager.setSceneOrigin?.(nodeId, offset) ?? false;
                if (applied) plugin._markVisualActivity('gsplat.sceneOrigin', nodeId);
                return applied;
            }
        };
        this.assetResults.set(id, result);
        this.assets.set(id, handle);
        log.debug(`[GaussianSplatPlugin] handle created, id=${id}, splats=${result.metadata.splatCount}, hasObject3D=${null !== object3D}`);
        return handle;
    }
    _disposeAssetResult(id) {
        const result = this.assetResults.get(id);
        if (!result) return;
        this.assetResults.delete(id);
        this.context.sceneBounds?.unregister(this.kind, id);
        const handle = this.assets.get(id);
        if (handle?.object3D?.parent) handle.object3D.parent.remove(handle.object3D);
        this._clearNodeActivity(id);
        this.manager.removeByNodeId(id);
        this._disposeLoadResult(result);
        log.debug(`[GaussianSplatPlugin] asset resources disposed, id=${id}`);
    }
    _disposeLoadResult(result) {
        result.nodeLoader.dispose();
    }
}
export { FormatNotSupportedError, GaussianSplatPlugin };
