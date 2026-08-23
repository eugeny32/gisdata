import * as __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__ from "lodash-es";
import * as __WEBPACK_EXTERNAL_MODULE_nanoid__ from "nanoid";
import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__module_CADModule_toolDispatcher_interface_js_7e19b1ab__ from "./module/CADModule/toolDispatcher/interface.js";
import * as __WEBPACK_EXTERNAL_MODULE__module_container_container_js_515376f5__ from "./module/container/container.js";
import * as __WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__ from "./module/container/types.js";
import * as __WEBPACK_EXTERNAL_MODULE__module_core_common_interface_js_03ed8c22__ from "./module/core/common/interface.js";
import * as __WEBPACK_EXTERNAL_MODULE__runtime_ExporterRegistry_js_37525b6f__ from "../../runtime/ExporterRegistry.js";
import * as __WEBPACK_EXTERNAL_MODULE__runtime_LoaderRegistry_js_be00e9c5__ from "../../runtime/LoaderRegistry.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_disposable_DisposableScope_js_5e519bb3__ from "../../shared/disposable/DisposableScope.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__ from "../../shared/logging/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_c632c149__ from "../../shared/types/assets.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_utils_index_js_83ff7f8f__ from "../../shared/utils/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__exporters_DxfCadExporter_js_d9354dac__ from "./exporters/DxfCadExporter.js";
import * as __WEBPACK_EXTERNAL_MODULE__loaders_DxfCadLoader_js_6357a9b2__ from "./loaders/DxfCadLoader.js";
import * as __WEBPACK_EXTERNAL_MODULE__loaders_JsonCadLoader_js_b1b5e47e__ from "./loaders/JsonCadLoader.js";
import * as __WEBPACK_EXTERNAL_MODULE__module_CADModule_command_AddEntityCommand_js_35195a65__ from "./module/CADModule/command/AddEntityCommand.js";
import * as __WEBPACK_EXTERNAL_MODULE__module_CADModule_command_CompositeCommand_js_7ecdf049__ from "./module/CADModule/command/CompositeCommand.js";
import * as __WEBPACK_EXTERNAL_MODULE__module_CADModule_command_DeleteEntityCommand_js_3d7241ed__ from "./module/CADModule/command/DeleteEntityCommand.js";
import * as __WEBPACK_EXTERNAL_MODULE__module_CADModule_command_LayerCommand_js_ac2b05ff__ from "./module/CADModule/command/LayerCommand.js";
import * as __WEBPACK_EXTERNAL_MODULE__module_CADModule_command_UpdateEntityCommand_js_4baab5c5__ from "./module/CADModule/command/UpdateEntityCommand.js";
import * as __WEBPACK_EXTERNAL_MODULE__module_CADModule_model_layer_Layer_js_89c67d60__ from "./module/CADModule/model/layer/Layer.js";
import * as __WEBPACK_EXTERNAL_MODULE__module_CADModule_utils_cadDiagnostics_js_7242336e__ from "./module/CADModule/utils/cadDiagnostics.js";
import * as __WEBPACK_EXTERNAL_MODULE__module_parser_DxfParser_js_56b4b87f__ from "./module/parser/DxfParser.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__.getLoggerManager)().getLogger('cad');
const diagnosticsLog = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__.getLoggerManager)().getLogger('cad:diagnostics');
class FormatNotSupportedError extends Error {
    constructor(url, formats){
        super(`无法加载 "${url}"：不支持该格式。已注册格式: ${formats.join(', ')}`);
        this.name = 'FormatNotSupportedError';
        this.url = url;
        this.formats = formats;
    }
}
const CAD_INPUT_PRIORITY = 90;
const resolveCadToolName = (toolName)=>{
    if ('string' == typeof toolName || 'symbol' == typeof toolName) return toolName;
    return null;
};
const getCadHandleEntities = (handle)=>{
    const entities = handle.dataManager?.entities;
    return Array.isArray(entities) ? entities : [];
};
class CadPlugin {
    get isActive() {
        return this._isActive;
    }
    constructor(options){
        this.name = 'cad';
        this.kind = 'cad';
        this.priority = 40;
        this.phases = [
            __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_c632c149__.RenderPhase.MainOpaque,
            __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_c632c149__.RenderPhase.Overlay3D
        ];
        this.renderPriority = 10;
        this.dependencies = [
            'CameraRig',
            'ViewportCamera',
            'SelectionService',
            'RenderPipeline',
            'PickingService',
            'ViewEventRouter',
            'ViewRegistry'
        ];
        this.provides = [
            'CadService'
        ];
        this.group = 'default';
        this.assets = new Map();
        this.activeSessionId = null;
        this.pendingLoads = new Map();
        this.disposed = false;
        this.bridgeCleanups = [];
        this.bridgingSelection = false;
        this.isolatedCadScene = new __WEBPACK_EXTERNAL_MODULE_three__.Scene();
        this._activationToken = null;
        this._isActive = false;
        this._inputConsumer = null;
        this.loaders = new __WEBPACK_EXTERNAL_MODULE__runtime_LoaderRegistry_js_be00e9c5__.LoaderRegistry();
        this.exporters = new __WEBPACK_EXTERNAL_MODULE__runtime_ExporterRegistry_js_37525b6f__.ExporterRegistry();
        const builtinLoaders = [
            new __WEBPACK_EXTERNAL_MODULE__loaders_DxfCadLoader_js_6357a9b2__.DxfCadLoader(),
            new __WEBPACK_EXTERNAL_MODULE__loaders_JsonCadLoader_js_b1b5e47e__.JsonCadLoader()
        ];
        const extraLoaders = options?.extraLoaders ?? [];
        const overriddenFormats = new Set(extraLoaders.map((l)=>l.format));
        for (const loader of builtinLoaders)if (!overriddenFormats.has(loader.format)) this.loaders.register(loader);
        for (const loader of extraLoaders)this.loaders.register(loader);
        const extraExporters = options?.extraExporters ?? [];
        const userFormats = new Set(extraExporters.map((e)=>e.format));
        for (const exporter of extraExporters)this.exporters.register(exporter);
        if (!userFormats.has('dxf')) {
            const getMetadata = (_handle)=>{
                const viewManager = this.cadContainer.get(__WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.CADViewManager);
                return viewManager.dataManager.serialize();
            };
            this.exporters.register(new __WEBPACK_EXTERNAL_MODULE__exporters_DxfCadExporter_js_d9354dac__.DxfCadExporter(getMetadata));
        }
    }
    onInit(context) {
        this.initialize(context, true);
    }
    onInitAsDelegate(context) {
        this.initialize(context, false);
    }
    initialize(context, registerService) {
        this.context = context;
        this.cadContainer = (0, __WEBPACK_EXTERNAL_MODULE__module_container_container_js_515376f5__.createCadContainer)(context);
        if (registerService) context.registerService('CadService', this);
        log.debug(`[CadPlugin] initialized, loaders=${this.loaders.formats().join(',')}, exporters=${this.exporters.formats().join(',')}`);
    }
    onStart() {
        const pipeline = this.context.getService('RenderPipeline');
        pipeline.addRenderContributor(this);
        const picking = this.context.getService('PickingService');
        picking.addProvider(this);
        if (this.context.hasService('ClipService')) this.context.disposables.track(this.context.getService('ClipService').onChanged((volumes)=>this._applyClipVolumes(volumes)));
        this.bridgeSelection();
        log.debug('[CadPlugin] started, renderContributor=true, pickProvider=true');
    }
    onDestroy() {
        if (this.pendingLoads.size > 0 || this.assets.size > 0) log.debug(`[CadPlugin] destroying, pendingLoads=${this.pendingLoads.size}, assets=${this.assets.size}`);
        if (this._isActive) this._deactivateInternal();
        const pipeline = this.context.getService('RenderPipeline');
        pipeline.removeRenderContributor(this);
        const picking = this.context.getService('PickingService');
        picking.removeProvider(this);
        for (const [id, controller] of this.pendingLoads){
            controller.abort();
            log.debug(`[CadPlugin] onDestroy aborted pending load, id=${id}`);
        }
        this.pendingLoads.clear();
        this.disposed = true;
        for (const cleanup of this.bridgeCleanups)try {
            cleanup();
        } catch  {}
        this.bridgeCleanups.length = 0;
        this.dispose();
        if (this.cadContainer) this.cadContainer.unbindAll();
    }
    setActivationToken(token) {
        this._activationToken = token;
    }
    activate(token) {
        this._validateToken(token);
        if (this._isActive) return;
        this._isActive = true;
        this._activateInternal();
    }
    deactivate(token) {
        this._validateToken(token);
        if (!this._isActive) return;
        this._isActive = false;
        this._deactivateInternal();
    }
    _validateToken(token) {
        if (token !== this._activationToken) throw new Error('[CadPlugin] 非法的 ActivationToken，操作被拒绝');
    }
    _activateInternal() {
        const viewEventRouter = this.context.getService('ViewEventRouter');
        this._inputConsumer = this._createInputConsumer();
        viewEventRouter.addConsumer(this._inputConsumer);
        const controller = this.cadContainer.get(__WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.CADController);
        controller.start();
        this.markVisualActivity('cad.controllerStarted');
    }
    _deactivateInternal() {
        try {
            const gridHelper = this.cadContainer.get(__WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.GridHelper);
            gridHelper.setEnabled(false);
        } catch  {}
        try {
            const controller = this.cadContainer.get(__WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.CADController);
            controller.exit();
            this.markVisualActivity('cad.controllerExited');
        } catch  {}
        if (this._inputConsumer) {
            try {
                const viewEventRouter = this.context.getService('ViewEventRouter');
                viewEventRouter.removeConsumer(this._inputConsumer);
            } catch  {}
            this._inputConsumer = null;
        }
    }
    _createInputConsumer() {
        const getController = ()=>this.cadContainer.get(__WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.CADController);
        const getActiveViewId = ()=>this.context.getService('ViewRegistry').getActive()?.id ?? null;
        const isActiveViewEvent = (viewId)=>getActiveViewId() === viewId && this._isCadRenderEnabledForView(viewId);
        const toCanvasScreen = (event)=>({
                x: event.screen.x,
                y: event.screen.y
            });
        return {
            name: 'cad-controller',
            priority: CAD_INPUT_PRIORITY,
            onPointerDown: (event)=>{
                if (!isActiveViewEvent(event.viewId)) return false;
                const ctrl = getController();
                const screenPos = toCanvasScreen(event);
                ctrl.handlePointerDown(event.domEvent, screenPos);
                return false;
            },
            onPointerMove: (event)=>{
                if (!isActiveViewEvent(event.viewId)) return false;
                const ctrl = getController();
                const screenPos = toCanvasScreen(event);
                ctrl.handlePointerMove(event.domEvent, screenPos);
                return false;
            },
            onPointerUp: (event)=>{
                if (!isActiveViewEvent(event.viewId)) return false;
                const ctrl = getController();
                const screenPos = toCanvasScreen(event);
                return ctrl.handlePointerUp(event.domEvent, screenPos);
            },
            onWinKeyDown: (event)=>{
                const ctrl = getController();
                ctrl.handleKeyDown(event.domEvent);
                return 'Escape' === event.key;
            },
            onWinKeyUp: (event)=>{
                const ctrl = getController();
                ctrl.handleKeyUp(event.domEvent);
                return false;
            }
        };
    }
    async load(request) {
        if (this.disposed) throw new DOMException('Load aborted', 'AbortError');
        if (!request.data && !request.url) throw new Error('[CadPlugin] load 失败：request.data 和 request.url 至少需要提供一个');
        const id = request.id ?? (0, __WEBPACK_EXTERNAL_MODULE__shared_utils_index_js_83ff7f8f__.generateId)();
        const controller = new AbortController();
        this.pendingLoads.set(id, controller);
        const loadStart = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__.getLoggerManager)().now();
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
        log.debug(`[CadPlugin] load started, id=${id}, format=${request.format ?? 'auto'}, source=${request.url ?? 'inline-data'}`);
        try {
            if (controller.signal.aborted) {
                log.debug(`[CadPlugin] load aborted before loader, id=${id}`);
                throw new DOMException('Aborted', 'AbortError');
            }
            const result = await this.loadWithRegisteredLoader(id, request, controller.signal);
            if (this.disposed || controller.signal.aborted) throw new DOMException('Load aborted', 'AbortError');
            const handle = this.createHandle(id, result, request);
            this.context.events.emit('asset.loaded', {
                id,
                kind: this.kind
            });
            const stats = (0, __WEBPACK_EXTERNAL_MODULE__module_CADModule_utils_cadDiagnostics_js_7242336e__.collectCadEntityStats)(result.entities);
            diagnosticsLog.info(`[CadPlugin] load completed, id=${id}, ${(0, __WEBPACK_EXTERNAL_MODULE__module_CADModule_utils_cadDiagnostics_js_7242336e__.formatCadEntityStats)(stats)}, layers=${result.dataManager.layers.length}, elapsed=${((0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__.getLoggerManager)().now() - loadStart).toFixed(1)}ms`);
            log.debug(`[CadPlugin] load completed, id=${id}, entities=${result.entities.length}, layers=${result.dataManager.layers.length}, elapsed=${((0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__.getLoggerManager)().now() - loadStart).toFixed(1)}ms`);
            if (null === this.activeSessionId) this.setActive(id);
            return handle;
        } catch (err) {
            if (err instanceof DOMException && 'AbortError' === err.name) log.debug(`[CadPlugin] load aborted, id=${id}, source=${request.url ?? 'inline-data'}`);
            else {
                log.error(`[CadPlugin] load failed, id=${id}, source=${request.url ?? 'inline-data'}, reason=${err instanceof Error ? err.message : String(err)}`);
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
            log.debug(`[CadPlugin] load settled, id=${id}, pendingLoads=${this.pendingLoads.size}`);
        }
    }
    mount(handle) {
        const obj = handle.object3D;
        if (!obj) {
            log.warn(`[CadPlugin] mount 跳过：资产 "${handle.id}" 无 object3D`);
            return;
        }
        if (obj instanceof __WEBPACK_EXTERNAL_MODULE_three__.Object3D) (0, __WEBPACK_EXTERNAL_MODULE__shared_utils_index_js_83ff7f8f__.setMaskRecursive)(obj, obj.layers.mask);
        obj.visible = handle.visible;
        const root = this.context.sceneGraph.cadRoot;
        root.add(obj);
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
        const stats = (0, __WEBPACK_EXTERNAL_MODULE__module_CADModule_utils_cadDiagnostics_js_7242336e__.collectCadEntityStats)(getCadHandleEntities(handle));
        diagnosticsLog.info(`[CadPlugin] mounted, id=${handle.id}, ${(0, __WEBPACK_EXTERNAL_MODULE__module_CADModule_utils_cadDiagnostics_js_7242336e__.formatCadEntityStats)(stats)}`);
        log.debug(`[CadPlugin] mounted, id=${handle.id}, entities=${handle.dataManager.entities.length}`);
    }
    unmount(id) {
        const handle = this.assets.get(id);
        if (!handle) {
            log.warn(`[CadPlugin] unmount 跳过：未找到资产 "${id}"`);
            return;
        }
        this.context.sceneBounds?.unregister(this.kind, id);
        const obj = handle.object3D;
        if (obj?.parent) obj.parent.remove(obj);
        this.context.events.emit('asset.unmounted', {
            id,
            kind: this.kind
        });
        log.debug(`[CadPlugin] unmounted, id=${id}, assets=${this.assets.size}`);
    }
    getAsset(id) {
        return this.assets.get(id);
    }
    getAll() {
        return Array.from(this.assets.values());
    }
    setVisibility(id, visible) {
        const handle = this.assets.get(id);
        if (handle) {
            handle.visible = visible;
            if (handle.object3D) handle.object3D.visible = visible;
            this.context.events.emit('asset.visibilityChanged', {
                id,
                visible
            });
            log.debug(`[CadPlugin] visibility changed, id=${id}, visible=${visible}`);
        }
    }
    render(frame, phase, ctx) {
        if (phase === __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_c632c149__.RenderPhase.MainOpaque) {
            if (!this._isCadRenderEnabledForView(frame.viewId)) return;
            const hasVisibleCad = Array.from(this.assets.values()).some((handle)=>handle.visible && handle.object3D?.visible !== false);
            if (!hasVisibleCad) return;
            const { renderer } = ctx;
            const cadRoot = this.context.sceneGraph.cadRoot;
            renderer.resetState();
            const savedTarget = renderer.getRenderTarget();
            const savedViewport = 'function' == typeof renderer.getViewport ? renderer.getViewport(new __WEBPACK_EXTERNAL_MODULE_three__.Vector4()) : null;
            const savedScissor = 'function' == typeof renderer.getScissor ? renderer.getScissor(new __WEBPACK_EXTERNAL_MODULE_three__.Vector4()) : null;
            const savedScissorTest = 'function' == typeof renderer.getScissorTest ? renderer.getScissorTest() : false;
            renderer.setRenderTarget(ctx.outputTarget);
            renderer.setViewport(ctx.viewport.x, ctx.viewport.y, ctx.viewport.width, ctx.viewport.height);
            renderer.setScissor(ctx.viewport.x, ctx.viewport.y, ctx.viewport.width, ctx.viewport.height);
            renderer.setScissorTest(true);
            const restoreCadRootParent = this._attachCadRootToIsolatedScene(cadRoot);
            try {
                renderer.render(this.isolatedCadScene, frame.camera);
            } finally{
                restoreCadRootParent();
                if (savedViewport) renderer.setViewport(savedViewport.x, savedViewport.y, savedViewport.z, savedViewport.w);
                if (savedScissor) renderer.setScissor(savedScissor.x, savedScissor.y, savedScissor.z, savedScissor.w);
                renderer.setScissorTest(savedScissorTest);
                renderer.setRenderTarget(savedTarget);
            }
        }
    }
    _attachCadRootToIsolatedScene(cadRoot) {
        const originalParent = cadRoot.parent;
        const originalIndex = originalParent?.children.indexOf(cadRoot) ?? -1;
        if (originalParent) originalParent.remove(cadRoot);
        this.isolatedCadScene.add(cadRoot);
        return ()=>{
            this.isolatedCadScene.remove(cadRoot);
            if (!originalParent) return;
            originalParent.add(cadRoot);
            const restoredIndex = originalParent.children.indexOf(cadRoot);
            if (originalIndex >= 0 && restoredIndex >= 0 && restoredIndex !== originalIndex) {
                originalParent.children.splice(restoredIndex, 1);
                originalParent.children.splice(Math.min(originalIndex, originalParent.children.length), 0, cadRoot);
            }
        };
    }
    pick(query) {
        let best = null;
        for (const [assetId, handle] of this.assets)if (!!handle.visible) try {
            const hits = this.withBoundAssetView(assetId, ()=>{
                const detector = this.cadContainer.get(__WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.EntityDetector);
                if (!detector || 'function' != typeof detector.detectWithHit) return [];
                return detector.detectWithHit({
                    x: query.ndc.x,
                    y: query.ndc.y
                }, {
                    camera: query.camera,
                    viewport: query.viewport,
                    layerMask: query.layerMask
                });
            });
            if (hits.length > 0) {
                const hit = hits[0];
                const result = {
                    assetId,
                    kind: this.kind,
                    point: new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(hit.point.x, hit.point.y, hit.point.z),
                    distance: hit.distance,
                    entityId: hit.id
                };
                if (!best || result.distance < best.distance) best = result;
            }
        } catch  {}
        return best;
    }
    dispose(id) {
        if (void 0 !== id) {
            const handle = this.assets.get(id);
            const pending = this.pendingLoads.get(id);
            if (pending) {
                pending.abort();
                this.pendingLoads.delete(id);
                log.debug(`[CadPlugin] dispose aborted pending load, id=${id}`);
            }
            const beforeStats = handle ? (0, __WEBPACK_EXTERNAL_MODULE__module_CADModule_utils_cadDiagnostics_js_7242336e__.collectCadEntityStats)(getCadHandleEntities(handle)) : null;
            if (beforeStats) diagnosticsLog.info(`[CadPlugin] dispose started, id=${id}, ${(0, __WEBPACK_EXTERNAL_MODULE__module_CADModule_utils_cadDiagnostics_js_7242336e__.formatCadEntityStats)(beforeStats)}`);
            this.unmount(id);
            handle?.objectManager?.dispose?.();
            const existed = this.assets.delete(id);
            if (this.activeSessionId === id) {
                const previousId = id;
                const remaining = Array.from(this.assets.keys());
                this.activeSessionId = remaining.length > 0 ? remaining[0] : null;
                this.bindActiveHandleToView();
                this.context.events.emit('cad.activeChanged', {
                    assetId: this.activeSessionId,
                    previousId
                });
            }
            if (existed) {
                this.context.events.emit('asset.disposed', {
                    id,
                    kind: this.kind
                });
                diagnosticsLog.info(`[CadPlugin] disposed, id=${id}, assets=${this.assets.size}`);
            }
        } else {
            let totalEntities = 0;
            let totalTextLike = 0;
            for (const handle of this.assets.values()){
                const stats = (0, __WEBPACK_EXTERNAL_MODULE__module_CADModule_utils_cadDiagnostics_js_7242336e__.collectCadEntityStats)(getCadHandleEntities(handle));
                totalEntities += stats.total;
                totalTextLike += stats.textLike;
            }
            if (this.assets.size > 0) diagnosticsLog.info(`[CadPlugin] dispose all started, assets=${this.assets.size}, entities=${totalEntities}, textLike=${totalTextLike}`);
            for (const assetId of Array.from(this.assets.keys())){
                const handle = this.assets.get(assetId);
                this.unmount(assetId);
                handle?.objectManager?.dispose?.();
                this.context.events.emit('asset.disposed', {
                    id: assetId,
                    kind: this.kind
                });
            }
            this.assets.clear();
            diagnosticsLog.info('[CadPlugin] disposed all assets');
            if (null !== this.activeSessionId) {
                const previousId = this.activeSessionId;
                this.activeSessionId = null;
                this.context.events.emit('cad.activeChanged', {
                    assetId: null,
                    previousId
                });
            }
        }
    }
    async export(id, format, options) {
        const handle = this.assets.get(id);
        if (!handle) throw new Error(`[CadPlugin] export 失败：未找到资产 "${id}"`);
        const exporter = this.exporters.get(format);
        if (!exporter) throw new FormatNotSupportedError(`(export:${id})`, this.exporters.formats());
        const scope = new __WEBPACK_EXTERNAL_MODULE__shared_disposable_DisposableScope_js_5e519bb3__.DisposableScope();
        const exportStart = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__.getLoggerManager)().now();
        try {
            this.context.events.emit('asset.exportStarted', {
                id,
                kind: this.kind,
                format
            });
            log.debug(`[CadPlugin] export started, id=${id}, format=${format}`);
            const blob = await this.withBoundAssetViewAsync(id, ()=>exporter.export(handle, options));
            this.context.events.emit('asset.exportCompleted', {
                id,
                kind: this.kind,
                format
            });
            log.debug(`[CadPlugin] export completed, id=${id}, format=${format}, bytes=${blob.size}, elapsed=${((0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__.getLoggerManager)().now() - exportStart).toFixed(1)}ms`);
            return blob;
        } catch (err) {
            log.error(`[CadPlugin] export failed, id=${id}, format=${format}, reason=${err instanceof Error ? err.message : String(err)}`);
            this.context.events.emit('asset.exportError', {
                id,
                kind: this.kind,
                format,
                error: err instanceof Error ? err : new Error(String(err))
            });
            throw err;
        } finally{
            scope.dispose();
        }
    }
    undo() {
        if (!this.getActive()) return;
        try {
            this.cadContainer.get(__WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.HistoryManager).undo();
        } catch  {
            log.warn('[CadPlugin] undo 失败：HistoryManager 不可用');
        }
    }
    redo() {
        if (!this.getActive()) return;
        try {
            this.cadContainer.get(__WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.HistoryManager).redo();
        } catch  {
            log.warn('[CadPlugin] redo 失败：HistoryManager 不可用');
        }
    }
    executeCommand(_command, _params) {}
    get canUndo() {
        if (!this.getActive()) return false;
        try {
            return this.cadContainer.get(__WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.HistoryManager).canUndo;
        } catch  {
            return false;
        }
    }
    get canRedo() {
        if (!this.getActive()) return false;
        try {
            return this.cadContainer.get(__WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.HistoryManager).canRedo;
        } catch  {
            return false;
        }
    }
    getSelectedEntityIds() {
        if (!this.getActive()) return [];
        try {
            const selector = this.cadContainer.get(__WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.EntitySelector);
            return selector.getSelected().map((e)=>e.id);
        } catch  {
            return [];
        }
    }
    syncSelectionFromService(entityIds) {
        if (!this.getActive()) return;
        try {
            const selector = this.cadContainer.get(__WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.EntitySelector);
            const viewManager = this.cadContainer.get(__WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.CADViewManager);
            selector.clearSelection();
            if (0 === entityIds.length) return;
            const entities = entityIds.map((id)=>viewManager.getEntity(id)).filter(Boolean);
            if (entities.length > 0) selector.select(entities, {
                mode: 'replace'
            });
        } catch  {
            log.warn('[CadPlugin] syncSelectionFromService 失败：EntitySelector 或 CADViewManager 不可用');
        }
    }
    _resolveDrawTool(toolType) {
        const symbolMap = {
            [__WEBPACK_EXTERNAL_MODULE__module_CADModule_toolDispatcher_interface_js_7e19b1ab__.DrawToolType.Polyline]: __WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.DrawPolylineTool,
            [__WEBPACK_EXTERNAL_MODULE__module_CADModule_toolDispatcher_interface_js_7e19b1ab__.DrawToolType.Arc]: __WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.DrawArcTool,
            [__WEBPACK_EXTERNAL_MODULE__module_CADModule_toolDispatcher_interface_js_7e19b1ab__.DrawToolType.Circle]: __WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.DrawCircleTool,
            [__WEBPACK_EXTERNAL_MODULE__module_CADModule_toolDispatcher_interface_js_7e19b1ab__.DrawToolType.Rect]: __WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.DrawRectTool,
            [__WEBPACK_EXTERNAL_MODULE__module_CADModule_toolDispatcher_interface_js_7e19b1ab__.DrawToolType.Spline]: __WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.DrawSplineTool,
            [__WEBPACK_EXTERNAL_MODULE__module_CADModule_toolDispatcher_interface_js_7e19b1ab__.DrawToolType.Text]: __WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.DrawTextTool,
            [__WEBPACK_EXTERNAL_MODULE__module_CADModule_toolDispatcher_interface_js_7e19b1ab__.DrawToolType.Dimension]: __WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.DrawDimensionTool,
            [__WEBPACK_EXTERNAL_MODULE__module_CADModule_toolDispatcher_interface_js_7e19b1ab__.DrawToolType.Polygon]: __WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.DrawPolygonTool,
            [__WEBPACK_EXTERNAL_MODULE__module_CADModule_toolDispatcher_interface_js_7e19b1ab__.DrawToolType.Ellipse]: __WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.DrawEllipseTool,
            [__WEBPACK_EXTERNAL_MODULE__module_CADModule_toolDispatcher_interface_js_7e19b1ab__.DrawToolType.Ray]: __WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.DrawRayTool,
            [__WEBPACK_EXTERNAL_MODULE__module_CADModule_toolDispatcher_interface_js_7e19b1ab__.DrawToolType.Hatch]: __WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.DrawHatchTool,
            [__WEBPACK_EXTERNAL_MODULE__module_CADModule_toolDispatcher_interface_js_7e19b1ab__.DrawToolType.MLeader]: __WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.DrawMLeaderTool,
            [__WEBPACK_EXTERNAL_MODULE__module_CADModule_toolDispatcher_interface_js_7e19b1ab__.DrawToolType.AngularDimension]: __WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.DrawAngularDimensionTool
        };
        const sym = symbolMap[toolType];
        if (!sym) {
            log.warn(`[CadPlugin] 不支持的绘制工具类型: "${toolType}"`);
            return null;
        }
        try {
            return this.cadContainer.get(sym);
        } catch  {
            log.warn(`[CadPlugin] 解析绘制工具失败: "${toolType}"`);
            return null;
        }
    }
    _resolveEditTool(toolType) {
        const symbolMap = {
            [__WEBPACK_EXTERNAL_MODULE__module_CADModule_toolDispatcher_interface_js_7e19b1ab__.EditToolType.Join]: __WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.JoinEntityTool,
            [__WEBPACK_EXTERNAL_MODULE__module_CADModule_toolDispatcher_interface_js_7e19b1ab__.EditToolType.Copy]: __WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.CopyEntityTool,
            [__WEBPACK_EXTERNAL_MODULE__module_CADModule_toolDispatcher_interface_js_7e19b1ab__.EditToolType.Move]: __WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.MoveEntityTool,
            [__WEBPACK_EXTERNAL_MODULE__module_CADModule_toolDispatcher_interface_js_7e19b1ab__.EditToolType.Close]: __WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.CloseEntityTool,
            [__WEBPACK_EXTERNAL_MODULE__module_CADModule_toolDispatcher_interface_js_7e19b1ab__.EditToolType.Rotate]: __WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.RotateEntityTool,
            [__WEBPACK_EXTERNAL_MODULE__module_CADModule_toolDispatcher_interface_js_7e19b1ab__.EditToolType.Offset]: __WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.OffsetEntityTool,
            [__WEBPACK_EXTERNAL_MODULE__module_CADModule_toolDispatcher_interface_js_7e19b1ab__.EditToolType.Break]: __WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.BreakEntityTool,
            [__WEBPACK_EXTERNAL_MODULE__module_CADModule_toolDispatcher_interface_js_7e19b1ab__.EditToolType.Trim]: __WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.TrimEntityTool,
            [__WEBPACK_EXTERNAL_MODULE__module_CADModule_toolDispatcher_interface_js_7e19b1ab__.EditToolType.Extend]: __WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.ExtendEntityTool
        };
        const sym = symbolMap[toolType];
        if (!sym) {
            log.warn(`[CadPlugin] 不支持的编辑工具类型: "${toolType}"`);
            return null;
        }
        try {
            return this.cadContainer.get(sym);
        } catch  {
            log.warn(`[CadPlugin] 解析编辑工具失败: "${toolType}"`);
            return null;
        }
    }
    activateDrawTool(params) {
        if (!this.getActive()) return;
        const { toolType, entityData } = params;
        const controller = params.controller ?? this.cadContainer.get(__WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.CADController);
        const drawTool = this._resolveDrawTool(toolType);
        drawTool?.start(controller, __WEBPACK_EXTERNAL_MODULE__module_core_common_interface_js_03ed8c22__.StartMode.alone, entityData, params.mode);
    }
    exitDrawTool(toolType) {
        const drawTool = this._resolveDrawTool(toolType);
        drawTool?.exit();
    }
    activateEditTool(params) {
        if (!this.getActive()) return;
        const { toolType } = params;
        const controller = params.controller ?? this.cadContainer.get(__WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.CADController);
        const editTool = this._resolveEditTool(toolType);
        editTool?.start(controller, __WEBPACK_EXTERNAL_MODULE__module_core_common_interface_js_03ed8c22__.StartMode.alone);
    }
    exitEditTool(toolType) {
        const editTool = this._resolveEditTool(toolType);
        editTool?.exit();
    }
    setOrthogonalEnabled(enabled) {
        const orthogonalHelper = this.cadContainer.get(__WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.OrthogonalHelper);
        orthogonalHelper.setEnabled(enabled);
    }
    isOrthogonalEnabled() {
        const orthogonalHelper = this.cadContainer.get(__WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.OrthogonalHelper);
        return orthogonalHelper.isEnabled();
    }
    setCaptureEnabled(enabled) {
        const captureHelper = this.cadContainer.get(__WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.CaptureHelper);
        captureHelper.setEnabled(enabled);
    }
    isCaptureEnabled() {
        const captureHelper = this.cadContainer.get(__WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.CaptureHelper);
        return captureHelper.isEnabled();
    }
    setCaptureType(type, enabled) {
        const captureHelper = this.cadContainer.get(__WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.CaptureHelper);
        captureHelper.setCaptureType(type, enabled);
    }
    setCaptureConfig(config) {
        const captureHelper = this.cadContainer.get(__WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.CaptureHelper);
        captureHelper.setConfig(config);
    }
    setGridEnabled(enabled) {
        const gridHelper = this.cadContainer.get(__WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.GridHelper);
        gridHelper.setEnabled(enabled);
    }
    isGridEnabled() {
        const gridHelper = this.cadContainer.get(__WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.GridHelper);
        return gridHelper.isEnabled();
    }
    setPolarEnabled(enabled) {
        const polarHelper = this.cadContainer.get(__WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.PolarHelper);
        polarHelper.setEnabled(enabled);
    }
    setPolarAngles(angles) {
        const polarHelper = this.cadContainer.get(__WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.PolarHelper);
        polarHelper.setPolarAngles(angles);
    }
    getPolarAngles() {
        const polarHelper = this.cadContainer.get(__WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.PolarHelper);
        return polarHelper.polarAngles;
    }
    isPolarEnabled() {
        const polarHelper = this.cadContainer.get(__WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.PolarHelper);
        return polarHelper.isEnabled();
    }
    setPointCloudEnabled(enabled) {
        const pointCloudHelper = this.cadContainer.get(__WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.PointCloudHelper);
        pointCloudHelper.setEnabled(enabled);
    }
    isPointCloudEnabled() {
        const pointCloudHelper = this.cadContainer.get(__WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.PointCloudHelper);
        return pointCloudHelper.isEnabled();
    }
    _applyClipVolumes(volumes) {
        const globalVolumes = volumes.filter((volume)=>null == volume.viewId);
        try {
            const viewManager = this.cadContainer.get(__WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.CADViewManager);
            if (viewManager && 'function' == typeof viewManager.setClipVolumes) {
                viewManager.setClipVolumes(globalVolumes);
                this.markVisualActivity('cad.clipVolumes');
            }
        } catch  {}
    }
    markVisualActivity(reason) {
        this.context?.renderInvalidation?.invalidate(reason);
    }
    _isCadRenderEnabledForView(viewId) {
        if (!this.context.hasService('ViewRegistry')) return true;
        try {
            const viewRegistry = this.context.getService('ViewRegistry');
            const view = viewRegistry.get(viewId);
            return view?.userData?.renderCad !== false;
        } catch  {
            return true;
        }
    }
    async loadWithRegisteredLoader(id, request, signal) {
        const loader = request.format ? this.loaders.get(request.format) : this.loaders.detect(request);
        if (!loader) throw new FormatNotSupportedError(request.url ?? '(inline-data)', this.loaders.formats());
        log.debug(`[CadPlugin] loader selected, id=${id}, format=${loader.format}, source=${request.url ?? 'inline-data'}`);
        const abortRacePromise = new Promise((_, reject)=>{
            signal.addEventListener('abort', ()=>reject(new DOMException('Aborted', 'AbortError')), {
                once: true
            });
        });
        const loaderPromise = loader.load(request, {
            signal,
            onProgress: (progress)=>this.context.events.emit('asset.progress', {
                    id,
                    kind: this.kind,
                    progress,
                    loaded: progress,
                    total: 1
                })
        });
        return Promise.race([
            loaderPromise,
            abortRacePromise
        ]);
    }
    createHandle(id, result, request) {
        const plugin = this;
        const withActiveHistory = (action)=>{
            if (plugin.getActiveId() !== id) {
                plugin.runHandleDataAction(result, action);
                return;
            }
            try {
                const viewManager = plugin.cadContainer.get(__WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.CADViewManager);
                let historyManager = null;
                try {
                    historyManager = plugin.cadContainer.get(__WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.HistoryManager);
                } catch  {
                    historyManager = null;
                }
                action(viewManager, historyManager);
            } catch  {
                plugin.runHandleDataAction(result, action);
            }
        };
        const handle = {
            id,
            kind: 'cad',
            name: request.name ?? request.url ?? '(unnamed)',
            visible: true,
            boundingBox: result.metadata.boundingBox,
            object3D: result.objectManager.getSceneGroup(),
            get layers () {
                return result.dataManager.layers;
            },
            get selectedEntityIds () {
                return plugin.getSelectedEntityIds();
            },
            get canUndo () {
                return plugin.canUndo;
            },
            get canRedo () {
                return plugin.canRedo;
            },
            get dataManager () {
                return result.dataManager;
            },
            get objectManager () {
                return result.objectManager;
            },
            activateDrawTool (params) {
                plugin.ensureHandleIsActive(id);
                plugin.activateDrawTool(params);
            },
            exitDrawTool (toolType) {
                plugin.ensureHandleIsActive(id);
                plugin.exitDrawTool(toolType);
            },
            activateEditTool (params) {
                plugin.ensureHandleIsActive(id);
                plugin.activateEditTool(params);
            },
            exitEditTool (toolType) {
                plugin.ensureHandleIsActive(id);
                plugin.exitEditTool(toolType);
            },
            undo () {
                plugin.ensureHandleIsActive(id);
                plugin.undo();
            },
            redo () {
                plugin.ensureHandleIsActive(id);
                plugin.redo();
            },
            executeCommand (_name, _params) {},
            serialize () {
                return result.dataManager.serialize();
            },
            replaceData (_data) {},
            addEntities (entities, options) {
                const typedEntities = entities;
                withActiveHistory((viewManager, historyManager)=>{
                    if (options?.recordHistory && historyManager) {
                        const command = new __WEBPACK_EXTERNAL_MODULE__module_CADModule_command_AddEntityCommand_js_35195a65__.AddEntityCommand(typedEntities, viewManager);
                        historyManager.addCommandAndExecute(command);
                        return;
                    }
                    viewManager.addEntities(typedEntities);
                });
            },
            updateEntities (entityIds, patch, options) {
                withActiveHistory((viewManager, historyManager)=>{
                    const typedEntities = entityIds.map((entityId)=>viewManager.dataManager.getEntity(entityId)).filter((entity)=>void 0 !== entity);
                    if (0 === typedEntities.length) return;
                    if (options?.recordHistory && historyManager) {
                        const command = new __WEBPACK_EXTERNAL_MODULE__module_CADModule_command_UpdateEntityCommand_js_4baab5c5__.UpdateEntityCommand(typedEntities, patch, options?.updateOptions, viewManager);
                        historyManager.addCommandAndExecute(command);
                        return;
                    }
                    typedEntities.forEach((entity)=>{
                        Object.assign(entity, (0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.cloneDeep)(patch));
                    });
                    viewManager.updateEntities(typedEntities, options?.updateOptions);
                });
            },
            deleteEntities (entityIds, options) {
                withActiveHistory((viewManager, historyManager)=>{
                    const typedEntities = entityIds.map((entityId)=>viewManager.dataManager.getEntity(entityId)).filter((entity)=>void 0 !== entity);
                    if (0 === typedEntities.length) return;
                    if (options?.recordHistory && historyManager) {
                        const command = new __WEBPACK_EXTERNAL_MODULE__module_CADModule_command_DeleteEntityCommand_js_3d7241ed__.DeleteEntityCommand(typedEntities, viewManager);
                        historyManager.addCommandAndExecute(command);
                        return;
                    }
                    viewManager.deleteEntities(typedEntities);
                });
            },
            importDxf (dxfString, options) {
                try {
                    const parsed = __WEBPACK_EXTERNAL_MODULE__module_parser_DxfParser_js_56b4b87f__.DxfParser.parse(dxfString);
                    if (!parsed || !parsed.entities || 0 === parsed.entities.length) return;
                    withActiveHistory((viewManager, historyManager)=>{
                        if (options?.recordHistory && historyManager) {
                            const command = new __WEBPACK_EXTERNAL_MODULE__module_CADModule_command_AddEntityCommand_js_35195a65__.AddEntityCommand(parsed.entities, viewManager);
                            historyManager.addCommandAndExecute(command);
                            return;
                        }
                        viewManager.addEntities(parsed.entities);
                    });
                } catch  {}
            },
            addLayer (input, options) {
                let layer;
                withActiveHistory((viewManager, historyManager)=>{
                    const hasIdConflict = null != input.id && viewManager.dataManager?.getLayer?.(input.id) != null;
                    if (options?.recordHistory && historyManager && !hasIdConflict) {
                        const command = new __WEBPACK_EXTERNAL_MODULE__module_CADModule_command_LayerCommand_js_ac2b05ff__.CreateLayerCommand(input, viewManager);
                        try {
                            historyManager.addCommandAndExecute(command);
                            layer = command.getLayers()[0];
                            return;
                        } catch  {}
                    }
                    layer = new __WEBPACK_EXTERNAL_MODULE__module_CADModule_model_layer_Layer_js_89c67d60__.Layer({
                        ...(0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.omitBy)((0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.cloneDeep)(input), __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.isNil),
                        id: input.id ?? (0, __WEBPACK_EXTERNAL_MODULE_nanoid__.nanoid)()
                    });
                    viewManager.addLayer(layer);
                });
                return layer;
            },
            updateLayer (layerId, patch, options) {
                withActiveHistory((viewManager, historyManager)=>{
                    if (options?.recordHistory && historyManager) {
                        const command = new __WEBPACK_EXTERNAL_MODULE__module_CADModule_command_LayerCommand_js_ac2b05ff__.UpdateLayerCommand(layerId, patch, viewManager);
                        historyManager.addCommandAndExecute(command);
                    } else {
                        const layer = viewManager.dataManager.getLayer(layerId);
                        if (layer) {
                            Object.assign(layer, (0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.omitBy)((0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.cloneDeep)(patch), __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.isNil));
                            viewManager.updateLayer(layer);
                        }
                    }
                });
            },
            deleteLayer (layerId, options) {
                withActiveHistory((viewManager, historyManager)=>{
                    if (options?.recordHistory && historyManager) {
                        const command = new __WEBPACK_EXTERNAL_MODULE__module_CADModule_command_LayerCommand_js_ac2b05ff__.RemoveLayerCommand(layerId, viewManager);
                        historyManager.addCommandAndExecute(command);
                    } else viewManager.dataManager.deleteLayer(layerId);
                });
            },
            addLayersAndEntities (layers, entities, options) {
                const typedEntities = entities;
                withActiveHistory((viewManager, historyManager)=>{
                    if (options?.recordHistory && historyManager) {
                        const layerCommand = new __WEBPACK_EXTERNAL_MODULE__module_CADModule_command_LayerCommand_js_ac2b05ff__.CreateLayerCommand(layers, viewManager);
                        const entityCommand = new __WEBPACK_EXTERNAL_MODULE__module_CADModule_command_AddEntityCommand_js_35195a65__.AddEntityCommand(typedEntities, viewManager);
                        const command = new __WEBPACK_EXTERNAL_MODULE__module_CADModule_command_CompositeCommand_js_7ecdf049__.CompositeCommand([
                            layerCommand,
                            entityCommand
                        ]);
                        historyManager.addCommandAndExecute(command);
                    } else {
                        const newLayers = layers.map((layer)=>new __WEBPACK_EXTERNAL_MODULE__module_CADModule_model_layer_Layer_js_89c67d60__.Layer({
                                ...(0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.omitBy)((0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.cloneDeep)(layer), __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.isNil),
                                id: layer.id ?? (0, __WEBPACK_EXTERNAL_MODULE_nanoid__.nanoid)()
                            }));
                        viewManager.addLayers(newLayers);
                        viewManager.addEntities(typedEntities);
                    }
                });
            },
            getPlane () {
                const plane = result.dataManager.plane;
                return plane;
            },
            setPlane (plane) {
                result.dataManager.updatePlane(plane);
                result.objectManager.updateGroupByPlane(result.dataManager.plane);
                plugin.refreshActiveView(id);
            },
            getLayers () {
                return result.dataManager.layers;
            },
            setActiveLayer (_layerId) {}
        };
        this.assets.set(id, handle);
        log.debug(`[CadPlugin] handle created, id=${id}, entities=${result.dataManager.entities.length}, layers=${result.dataManager.layers.length}, assets=${this.assets.size}`);
        return handle;
    }
    bridgeSelection() {
        this._bridgeContainerEvents(this.cadContainer);
        const onSelectionChanged = (evt)=>{
            if (this.bridgingSelection) return;
            const cadIds = evt.selected.filter((item)=>'cad' === item.kind && item.entityId).map((item)=>item.entityId);
            this.bridgingSelection = true;
            try {
                this.syncSelectionFromService(cadIds);
            } finally{
                this.bridgingSelection = false;
            }
        };
        this.context.events.on('selection.changed', onSelectionChanged);
        this.bridgeCleanups.push(()=>this.context.events.off('selection.changed', onSelectionChanged));
    }
    _bridgeContainerEvents(container) {
        try {
            const hm = container.get(__WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.HistoryManager);
            const onHistoryChanged = ()=>{
                this.context.events.emit('cad.historyChanged', {
                    assetId: this.activeSessionId ?? '',
                    canUndo: hm.canUndo,
                    canRedo: hm.canRedo
                });
            };
            const onUndoRedo = ()=>{
                this.context.events.emit('cad.undoRedo', {
                    assetId: this.activeSessionId ?? '',
                    canUndo: hm.canUndo,
                    canRedo: hm.canRedo
                });
            };
            hm.on('onStateChanged', onHistoryChanged);
            hm.on('undoRedo', onUndoRedo);
            this.bridgeCleanups.push(()=>hm.off('onStateChanged', onHistoryChanged));
            this.bridgeCleanups.push(()=>hm.off('undoRedo', onUndoRedo));
        } catch  {
            log.warn('[CadPlugin] _bridgeContainerEvents: HistoryManager 不可用，跳过历史事件桥接');
        }
        try {
            const es = container.get(__WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.EntitySelector);
            const onSelectorChanged = (entities)=>{
                if (this.bridgingSelection) return;
                const entityIds = (entities ?? []).map((e)=>e.id);
                this.context.events.emit('cad.selectionChanged', {
                    assetId: this.activeSessionId ?? '',
                    entityIds
                });
                this.bridgingSelection = true;
                try {
                    const selectionService = this.context.getService('SelectionService');
                    const pickResults = entityIds.map((eid)=>({
                            assetId: this.activeSessionId ?? '',
                            kind: this.kind,
                            entityId: eid,
                            point: new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(),
                            distance: 0
                        }));
                    selectionService.set(pickResults);
                } catch  {} finally{
                    this.bridgingSelection = false;
                }
            };
            es.on('onSelectorChanged', onSelectorChanged);
            this.bridgeCleanups.push(()=>es.off('onSelectorChanged', onSelectorChanged));
        } catch  {
            log.warn('[CadPlugin] _bridgeContainerEvents: EntitySelector 不可用，跳过选择事件桥接');
        }
        try {
            const controller = container.get(__WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.CADController);
            const onToolChanged = (payload)=>{
                this.context.events.emit('cad.toolChanged', {
                    assetId: this.activeSessionId ?? '',
                    curToolName: resolveCadToolName(payload?.curTool?.name),
                    lastToolName: resolveCadToolName(payload?.lastTool?.name)
                });
            };
            controller.on('onToolChanged', onToolChanged);
            this.bridgeCleanups.push(()=>controller.off('onToolChanged', onToolChanged));
        } catch  {
            log.warn('[CadPlugin] _bridgeContainerEvents: CADController 不可用，跳过工具事件桥接');
        }
    }
    getActive() {
        if (!this.activeSessionId) return;
        return this.assets.get(this.activeSessionId);
    }
    getActiveId() {
        return this.activeSessionId;
    }
    setActive(id) {
        if (id === this.activeSessionId) return;
        if (null !== id && !this.assets.has(id)) throw new Error(`[CadPlugin] setActive 失败：未找到资产 "${id}"`);
        const previousId = this.activeSessionId;
        this.activeSessionId = id;
        this.bindActiveHandleToView();
        this.context.events.emit('cad.activeChanged', {
            assetId: id,
            previousId
        });
    }
    bindActiveHandleToView() {
        const activeHandle = this.getActive();
        if (!activeHandle) return;
        this.bindHandleToView(activeHandle);
    }
    bindHandleToView(handle) {
        try {
            const viewManager = this.cadContainer.get(__WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.CADViewManager);
            viewManager.set(handle.dataManager, handle.objectManager);
            return true;
        } catch  {
            return false;
        }
    }
    ensureHandleIsActive(id) {
        if (this.activeSessionId !== id) this.setActive(id);
    }
    refreshActiveView(id) {
        if (this.activeSessionId !== id) return;
        this.bindActiveHandleToView();
    }
    runHandleDataAction(result, action) {
        const viewManager = {
            dataManager: result.dataManager,
            objectManager: result.objectManager,
            planeHelper: {
                normal: result.dataManager.plane.normal,
                constant: -result.dataManager.plane.normal.dot(result.dataManager.plane.origin)
            },
            set: ()=>{},
            getEntity: (entityId)=>result.dataManager.getEntity(entityId),
            addEntities: (entities)=>{
                result.dataManager.addEntities(entities);
                result.objectManager.addEntities(entities);
            },
            deleteEntities: (entities)=>{
                const typedEntities = entities.map((entity)=>result.dataManager.getEntity(entity.id)).filter((entity)=>null != entity);
                result.dataManager.deleteEntities(typedEntities);
                result.objectManager.deleteEntities(typedEntities);
            },
            updateEntities: (entities, updateOptions)=>{
                result.dataManager.updateEntities(entities);
                result.objectManager.updateEntities(entities, updateOptions);
            },
            addLayer: (layer)=>{
                result.dataManager.addLayer(layer);
            },
            deleteLayer: (id)=>{
                result.dataManager.deleteLayer(id);
            },
            updateLayer: (layer)=>{
                result.dataManager.updateLayer(layer);
            },
            addLayers: (layers)=>{
                result.dataManager.addLayers(layers);
            }
        };
        action(viewManager, null);
    }
    withBoundAssetView(assetId, action) {
        const handle = this.assets.get(assetId);
        if (!handle) throw new Error(`[CadPlugin] 未找到资产 "${assetId}"`);
        const viewManager = this.cadContainer.get(__WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.CADViewManager);
        const previousDataManager = viewManager.dataManager;
        const previousObjectManager = viewManager.objectManager;
        viewManager.set(handle.dataManager, handle.objectManager);
        try {
            return action();
        } finally{
            viewManager.set(previousDataManager, previousObjectManager);
        }
    }
    async withBoundAssetViewAsync(assetId, action) {
        const handle = this.assets.get(assetId);
        if (!handle) throw new Error(`[CadPlugin] 未找到资产 "${assetId}"`);
        const viewManager = this.cadContainer.get(__WEBPACK_EXTERNAL_MODULE__module_container_types_js_3714a02e__.TYPES.CADViewManager);
        const previousDataManager = viewManager.dataManager;
        const previousObjectManager = viewManager.objectManager;
        viewManager.set(handle.dataManager, handle.objectManager);
        try {
            return await action();
        } finally{
            viewManager.set(previousDataManager, previousObjectManager);
        }
    }
}
export { CadPlugin, FormatNotSupportedError };
