import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__plugins_control_createViewScopedDomElement_js_e2f6d845__ from "../plugins/control/createViewScopedDomElement.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_3bd7879c__ from "../shared/logging/index.js";
const VIEW_SCOPED_SERVICE_PLUGIN_MAP = {
    cameraRig: 'CameraPlugin',
    viewportCamera: 'CameraPlugin',
    controlManager: 'ControlPlugin'
};
const memoryLog = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_3bd7879c__.getLoggerManager)().getLogger('runtime:memory');
function runMemoryDiagnostic(write) {
    try {
        write();
    } catch  {}
}
class EngineViewHandleImpl {
    constructor(id, getViewRegistry){
        this.id = id;
        this.getViewRegistry = getViewRegistry;
    }
    getSnapshot() {
        const snapshot = this.getViewRegistry().get(this.id);
        if (!snapshot) throw new Error(`View "${this.id}" does not exist.`);
        return snapshot;
    }
    update(patch) {
        return this.getViewRegistry().update(this.id, patch);
    }
    setRect(rect) {
        return this.getViewRegistry().setRect(this.id, rect);
    }
    setVisible(visible) {
        return this.getViewRegistry().setVisible(this.id, visible);
    }
    setZIndex(zIndex) {
        return this.getViewRegistry().setZIndex(this.id, zIndex);
    }
    setLayerMask(layerMask) {
        return this.getViewRegistry().setLayerMask(this.id, layerMask);
    }
    setUserData(userData) {
        return this.getViewRegistry().update(this.id, {
            userData: userData ?? {}
        });
    }
    getCameraRig() {
        return this.getViewService('cameraRig');
    }
    requireCameraRig() {
        return this.requireViewService('cameraRig');
    }
    getViewportCamera() {
        return this.getViewService('viewportCamera');
    }
    requireViewportCamera() {
        return this.requireViewService('viewportCamera');
    }
    getControlManager() {
        return this.getViewService('controlManager');
    }
    requireControlManager() {
        return this.requireViewService('controlManager');
    }
    getScopedServices() {
        this.getSnapshot();
        const scopedServices = {};
        const cameraRig = this.getViewService('cameraRig');
        const viewportCamera = this.getViewService('viewportCamera');
        const controlManager = this.getViewService('controlManager');
        if (cameraRig) scopedServices.cameraRig = cameraRig;
        if (viewportCamera) scopedServices.viewportCamera = viewportCamera;
        if (controlManager) scopedServices.controlManager = controlManager;
        return scopedServices;
    }
    getSlot(name) {
        return this.getViewRegistry().getExtension(this.id, name);
    }
    setSlot(name, value) {
        this.getViewRegistry().setExtension(this.id, name, value);
    }
    clearSlot(name) {
        this.getViewRegistry().setExtension(this.id, name, void 0);
    }
    getViewService(name) {
        this.getSnapshot();
        return this.getViewRegistry().getExtension(this.id, name);
    }
    requireViewService(name) {
        const service = this.getViewService(name);
        if (!service) throw new Error(`View "${this.id}" does not expose ${name}. Ensure ${VIEW_SCOPED_SERVICE_PLUGIN_MAP[name]} is registered and the view has been initialized.`);
        return service;
    }
}
class EngineViewsImpl {
    constructor(getViewRegistry, createViewHandle, helpers){
        this.getViewRegistry = getViewRegistry;
        this.createViewHandle = createViewHandle;
        this.helpers = helpers;
    }
    get primaryViewId() {
        return this.getViewRegistry().primaryViewId;
    }
    create(options) {
        const snapshot = this.getViewRegistry().create(options);
        return this.createViewHandle(snapshot.id);
    }
    remove(id) {
        return this.getViewRegistry().remove(id);
    }
    get(id) {
        const snapshot = this.getViewRegistry().get(id);
        return snapshot ? this.createViewHandle(snapshot.id) : void 0;
    }
    list() {
        return this.getViewRegistry().list().map((view)=>this.createViewHandle(view.id));
    }
    getActive() {
        const snapshot = this.getViewRegistry().getActive();
        return snapshot ? this.createViewHandle(snapshot.id) : void 0;
    }
    setActive(id) {
        const snapshot = this.getViewRegistry().setActive(id);
        return this.createViewHandle(snapshot.id);
    }
    update(id, patch) {
        const snapshot = this.getViewRegistry().update(id, patch);
        return this.createViewHandle(snapshot.id);
    }
    setRect(id, rect) {
        const snapshot = this.getViewRegistry().setRect(id, rect);
        return this.createViewHandle(snapshot.id);
    }
    setVisible(id, visible) {
        const snapshot = this.getViewRegistry().setVisible(id, visible);
        return this.createViewHandle(snapshot.id);
    }
    setLayerMask(id, layerMask) {
        const snapshot = this.getViewRegistry().setLayerMask(id, layerMask);
        return this.createViewHandle(snapshot.id);
    }
    setZIndex(id, zIndex) {
        const snapshot = this.getViewRegistry().setZIndex(id, zIndex);
        return this.createViewHandle(snapshot.id);
    }
    getCameraRig(id) {
        return this.get(id)?.getCameraRig();
    }
    requireCameraRig(id) {
        return this.requireViewHandle(id).requireCameraRig();
    }
    getViewportCamera(id) {
        return this.get(id)?.getViewportCamera();
    }
    requireViewportCamera(id) {
        return this.requireViewHandle(id).requireViewportCamera();
    }
    getControlManager(id) {
        return this.get(id)?.getControlManager();
    }
    requireControlManager(id) {
        return this.requireViewHandle(id).requireControlManager();
    }
    getScopedServices(id) {
        return this.get(id)?.getScopedServices();
    }
    worldToScreen(id, point) {
        this.requireViewHandle(id);
        return this.helpers.worldToScreen(id, point);
    }
    fitToScene(id, options) {
        this.requireViewHandle(id);
        return this.helpers.fitToScene(id, options);
    }
    fitToAssets(id, ids, options) {
        this.requireViewHandle(id);
        return this.helpers.fitToAssets(id, ids, options);
    }
    pickAtScreen(id, screen, options = {}) {
        this.requireViewHandle(id);
        return this.helpers.pickAtScreen(id, screen, options);
    }
    createScopedDomElement(id, source) {
        this.requireViewHandle(id);
        return this.helpers.createScopedDomElement(id, source);
    }
    requireViewHandle(id) {
        const viewHandle = this.get(id);
        if (!viewHandle) throw new Error(`View "${id}" does not exist.`);
        return viewHandle;
    }
}
class PotreeEngine {
    get ready() {
        return this._ready;
    }
    get disposed() {
        return this._disposed;
    }
    constructor(params){
        this.activeTools = new Map();
        this.activeSessions = new Map();
        this._ready = false;
        this._disposed = false;
        this.onWebGLContextLost = ()=>{
            runMemoryDiagnostic(()=>{
                memoryLog.warn(`event=webgl.context.lost engineId=${this.memoryDiagnosticEngineId} phase=runtime scope=renderer elapsedMs=0`);
            });
        };
        this.context = params.context;
        this.memoryDiagnosticEngineId = params.context.memoryDiagnosticId;
        this.plugins = params.plugins;
        this.events = params.events;
        this.loop = params.loop;
        this.pluginManager = params.pluginManager;
        const renderer = params.context.getRendererIfAvailable?.() ?? params.context.renderer;
        renderer?.domElement?.addEventListener?.('webglcontextlost', this.onWebGLContextLost);
        this.activationToken = Symbol('potree-activation-token');
        const getViewRegistry = ()=>this.requireService('ViewRegistry', 'views', 'ViewPlugin');
        this.viewsApi = new EngineViewsImpl(getViewRegistry, (id)=>new EngineViewHandleImpl(id, getViewRegistry), {
            worldToScreen: (id, point)=>this.worldToViewScreen(id, point),
            fitToScene: (id, options)=>this.fitViewToScene(id, options),
            fitToAssets: (id, ids, options)=>this.fitViewToAssets(id, ids, options),
            pickAtScreen: (id, screen, options)=>this.pickAtViewScreen(id, screen, options),
            createScopedDomElement: (id, source)=>this.createScopedDomElementForView(id, source)
        });
        for (const tool of this.pluginManager.getToolPlugins())tool.setActivationToken(this.activationToken);
        this.events.on('tool.requestDeactivate', ({ group })=>{
            this.deactivateTool(group);
        });
        this._installGlobalLogControl();
    }
    _installGlobalLogControl() {
        const mgr = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_3bd7879c__.getLoggerManager)();
        globalThis.__SHARE3D_LOG__ = {
            setLevel: (level)=>mgr.setLevel(level),
            setNamespaceLevel: (ns, level)=>mgr.setNamespaceLevel(ns, level),
            setPerfEnabled: (enabled)=>mgr.setPerfEnabled(enabled)
        };
    }
    markReady() {
        this.assertNotDisposed();
        this._ready = true;
        this._logMemorySummary('engine.ready');
    }
    get activeTool() {
        return this.activeTools.get('default') ?? null;
    }
    getActiveTool(group = 'default') {
        return this.activeTools.get(group) ?? null;
    }
    activateTool(name) {
        this.assertNotDisposed();
        const toolPlugins = this.pluginManager.getToolPlugins();
        const target = toolPlugins.find((t)=>t.name === name);
        if (!target) throw new Error(`未找到 ToolPlugin: "${name}"，请检查是否已注册`);
        const group = target.group ?? 'default';
        const currentName = this.activeTools.get(group);
        if (currentName === name && target.isActive) return;
        if (currentName) {
            const current = toolPlugins.find((t)=>t.name === currentName);
            if (current?.isActive) {
                current.deactivate(this.activationToken);
                this.events.emit('tool.deactivated', {
                    name: currentName,
                    group
                });
            }
            this.activeTools.delete(group);
        }
        target.activate(this.activationToken);
        this.activeTools.set(group, name);
        this.events.emit('tool.activated', {
            name,
            group
        });
    }
    deactivateTool(group) {
        this.assertNotDisposed();
        const resolvedGroup = group ?? 'default';
        const currentName = this.activeTools.get(resolvedGroup);
        if (!currentName) return;
        const current = this.pluginManager.getToolPlugins().find((t)=>t.name === currentName);
        if (current?.isActive) {
            current.deactivate(this.activationToken);
            this.events.emit('tool.deactivated', {
                name: currentName,
                group: resolvedGroup
            });
        }
        this.activeTools.delete(resolvedGroup);
    }
    startToolSession(name, options) {
        this.assertNotDisposed();
        this._configureToolBeforeActivation(name, options);
        this.activateTool(name);
        const group = this.pluginManager.getToolPlugins().find((t)=>t.name === name)?.group ?? 'default';
        let disposed = false;
        const resultHandlers = new Set();
        const cleanup = ()=>{
            if (disposed) return;
            disposed = true;
            this.events.off('tool.resultChanged', onResult);
            this.events.off('tool.deactivated', onDeactivated);
            resultHandlers.clear();
            if (this.activeSessions.get(group)?.invalidate === cleanup) this.activeSessions.delete(group);
        };
        const onResult = (data)=>{
            if (disposed || data.name !== name) return;
            for (const handler of resultHandlers)handler(data.data);
        };
        const onDeactivated = (data)=>{
            if (data.name === name && data.group === group) cleanup();
        };
        this.events.on('tool.resultChanged', onResult);
        this.events.on('tool.deactivated', onDeactivated);
        const prev = this.activeSessions.get(group);
        if (prev) prev.invalidate();
        this.activeSessions.set(group, {
            invalidate: cleanup
        });
        const session = {
            name,
            group,
            get active () {
                return !disposed;
            },
            cancel: ()=>{
                if (disposed) return;
                cleanup();
                if (this.activeTools.get(group) === name) this.deactivateTool(group);
            },
            onResult: (cb)=>{
                resultHandlers.add(cb);
                return {
                    dispose: ()=>resultHandlers.delete(cb)
                };
            },
            dispose: ()=>{
                session.cancel();
            }
        };
        return session;
    }
    _configureToolBeforeActivation(name, options) {
        if (!options) return;
        if ('measure' === name && this.context.hasService('MeasureService')) {
            const svc = this.context.getService('MeasureService');
            if (void 0 !== options.measureType) svc.setMeasureType(options.measureType);
        }
        if ('clip' === name && this.context.hasService('ClipService')) {
            const svc = this.context.getService('ClipService');
            if (void 0 !== options.selectionMode) svc.setSelectionMode(options.selectionMode);
            if (void 0 !== options.clipApplyMode) svc.setClipApplyMode(options.clipApplyMode);
        }
    }
    get views() {
        this.requireService('ViewRegistry', 'views', 'ViewPlugin');
        return this.viewsApi;
    }
    get camera() {
        return this.requireService('CameraRig', 'camera', 'CameraPlugin');
    }
    get controls() {
        return this.requireService('ControlManager', 'controls', 'ControlPlugin');
    }
    get characters() {
        return this.requireService('CharacterService', 'characters', 'CharacterPlugin');
    }
    get input() {
        return this.requireService('InputRouter', 'input', 'InputPlugin');
    }
    get picking() {
        return this.requireService('PickingService', 'picking', 'PickingPlugin');
    }
    get spatial() {
        return this.requireService('SpatialQueryService', 'spatial', 'SpatialQueryPlugin');
    }
    get selection() {
        return this.requireService('SelectionService', 'selection', 'SelectionPlugin');
    }
    get pipeline() {
        return this.requireService('RenderPipeline', 'pipeline', 'RenderPlugin');
    }
    get sceneGraph() {
        this.assertNotDisposed();
        return this.context.sceneGraph;
    }
    get activeCamera() {
        return this.requireService('ViewportCamera', 'activeCamera', 'CameraPlugin').getActiveCamera();
    }
    get interaction() {
        return this.requireService('InteractionService', 'interaction', 'InteractionPlugin');
    }
    setEDL(enabled, options) {
        this.assertNotDisposed();
        const plugin = this.pluginManager.get('pointCloud');
        if (!plugin) throw new Error('setEDL requires PointCloudPlugin');
        const configurable = plugin;
        const current = configurable.getConfig();
        configurable.setConfig({
            ...current,
            useEDL: enabled,
            ...options?.strength !== void 0 && {
                edlStrength: options.strength
            },
            ...options?.radius !== void 0 && {
                edlRadius: options.radius
            },
            ...options?.opacity !== void 0 && {
                edlOpacity: options.opacity
            }
        });
    }
    setShowBoundingBox(visible) {
        this.assertNotDisposed();
        const plugin = this.pluginManager.get('pointCloud');
        if (!plugin) throw new Error('setShowBoundingBox requires PointCloudPlugin');
        const configurable = plugin;
        const current = configurable.getConfig();
        configurable.setConfig({
            ...current,
            showBoundingBox: visible
        });
    }
    setBoundingBoxHighlight(ids) {
        this.assertNotDisposed();
        const plugin = this.pluginManager.get('boundingBoxOverlay');
        if (!plugin) throw new Error('setBoundingBoxHighlight requires BoundingBoxOverlayPlugin');
        plugin.setHighlightedIds(ids);
    }
    setStaticBoundingBoxHighlight(boxes) {
        this.assertNotDisposed();
        const plugin = this.pluginManager.get('boundingBoxOverlay');
        if (!plugin) throw new Error('setStaticBoundingBoxHighlight requires BoundingBoxOverlayPlugin');
        plugin.setStaticBoxes(boxes);
    }
    worldToScreen(point) {
        this.assertNotDisposed();
        const camera = this.activeCamera;
        const renderer = this.context.renderer;
        const size = renderer.getSize(new __WEBPACK_EXTERNAL_MODULE_three__.Vector2());
        const projected = point.clone().project(camera);
        return new __WEBPACK_EXTERNAL_MODULE_three__.Vector2((projected.x + 1) * 0.5 * size.x, (-projected.y + 1) * 0.5 * size.y);
    }
    async loadPointCloud(request) {
        this.assertNotDisposed();
        const service = this.context.getService('PointCloudService');
        const handle = await service.load(request);
        try {
            this.assertNotDisposed();
        } catch (error) {
            this.disposeLateLoadedAsset(service, handle);
            throw error;
        }
        service.mount(handle);
        return handle;
    }
    async loadGaussianSplat(request) {
        this.assertNotDisposed();
        const service = this.context.getService('GaussianSplatService');
        const handle = await service.load(request);
        try {
            this.assertNotDisposed();
        } catch (error) {
            this.disposeLateLoadedAsset(service, handle);
            throw error;
        }
        service.mount(handle);
        return handle;
    }
    async loadCadScene(request) {
        this.assertNotDisposed();
        const service = this.context.getService('CadService');
        const handle = await service.load(request);
        try {
            this.assertNotDisposed();
        } catch (error) {
            this.disposeLateLoadedAsset(service, handle);
            throw error;
        }
        service.mount(handle);
        return handle;
    }
    fitAll() {
        this.assertNotDisposed();
        const box = this.context.sceneBounds.getWorldBoundingBox({
            purpose: 'fit'
        });
        if (!box.isEmpty()) this.camera.fitToBox(box);
    }
    fitToAssets(ids) {
        this.assertNotDisposed();
        const box = this.context.sceneBounds.getWorldBoundingBox({
            ids,
            includeInvisible: true,
            purpose: 'fit'
        });
        if (!box.isEmpty()) this.camera.fitToBox(box);
    }
    worldToViewScreen(viewId, point) {
        this.assertNotDisposed();
        const view = this.views.get(viewId);
        if (!view) throw new Error(`View "${viewId}" does not exist.`);
        const { rect } = view.getSnapshot();
        const camera = this.views.requireViewportCamera(viewId).getActiveCamera();
        camera.updateMatrixWorld(true);
        const projected = point.clone().project(camera);
        return new __WEBPACK_EXTERNAL_MODULE_three__.Vector2((projected.x + 1) * 0.5 * rect.width, (-projected.y + 1) * 0.5 * rect.height);
    }
    fitViewToScene(viewId, options) {
        this.assertNotDisposed();
        const box = this.context.sceneBounds.getWorldBoundingBox({
            purpose: 'fit'
        });
        if (box.isEmpty()) return false;
        this.views.requireCameraRig(viewId).fitToBox(box, options);
        return true;
    }
    fitViewToAssets(viewId, ids, options) {
        this.assertNotDisposed();
        const box = this.context.sceneBounds.getWorldBoundingBox({
            ids,
            includeInvisible: true,
            purpose: 'fit'
        });
        if (box.isEmpty()) return false;
        this.views.requireCameraRig(viewId).fitToBox(box, options);
        return true;
    }
    pickAtViewScreen(viewId, screen, options = {}) {
        this.assertNotDisposed();
        return this.picking.pickInView(viewId, screen, options);
    }
    createScopedDomElementForView(viewId, source) {
        this.assertNotDisposed();
        return (0, __WEBPACK_EXTERNAL_MODULE__plugins_control_createViewScopedDomElement_js_e2f6d845__.createViewScopedDomElement)(source, ()=>{
            const snapshot = this.views.get(viewId)?.getSnapshot();
            return snapshot?.rect ?? {
                x: 0,
                y: 0,
                width: 0,
                height: 0
            };
        });
    }
    async screenshot(options) {
        this.assertNotDisposed();
        const renderer = this.context.renderer;
        const canvas = renderer.domElement;
        const oldSize = renderer.getSize(new __WEBPACK_EXTERNAL_MODULE_three__.Vector2());
        const oldPixelRatio = renderer.getPixelRatio();
        const targetWidth = options?.width ?? oldSize.x;
        const targetHeight = options?.height ?? oldSize.y;
        try {
            renderer.setPixelRatio(1);
            renderer.setSize(targetWidth, targetHeight, false);
            this.loop.renderOnce();
            const gl = renderer.getContext();
            const mimeType = options?.mimeType ?? 'image/png';
            gl.finish();
            const dataUrl = canvas.toDataURL(mimeType, options?.quality);
            return this.dataUrlToBlob(dataUrl, mimeType);
        } finally{
            renderer.setPixelRatio(oldPixelRatio);
            renderer.setSize(oldSize.x, oldSize.y, false);
        }
    }
    dataUrlToBlob(dataUrl, fallbackMimeType) {
        const separator = dataUrl.indexOf(',');
        if (separator < 0) throw new Error('截图失败');
        const metadata = dataUrl.slice(5, separator);
        const mimeType = metadata.split(';', 1)[0] || fallbackMimeType;
        const binary = atob(dataUrl.slice(separator + 1));
        const bytes = new Uint8Array(binary.length);
        for(let i = 0; i < binary.length; i++)bytes[i] = binary.charCodeAt(i);
        return new Blob([
            bytes
        ], {
            type: mimeType
        });
    }
    setBackground(color) {
        this.assertNotDisposed();
        if (null === color) this.context.sceneGraph.setBackground(null);
        else if ('string' == typeof color) this.context.sceneGraph.setBackground(new __WEBPACK_EXTERNAL_MODULE_three__.Color(color));
        else this.context.sceneGraph.setBackground(color);
        this.context.renderInvalidation.invalidate('scene.background');
    }
    setPointBudget(value) {
        this.assertNotDisposed();
        this.context.pointBudget = value;
        this.context.renderInvalidation.invalidate('pointcloud.pointBudget');
    }
    setMaxNodesLoading(value) {
        this.assertNotDisposed();
        this.context.maxNodesLoading = value;
        this.context.renderInvalidation.invalidate('pointcloud.maxNodesLoading');
    }
    get logger() {
        return this.context.logger;
    }
    setLogLevel(level) {
        (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_3bd7879c__.getLoggerManager)().setLevel(level);
    }
    setNamespaceLevel(namespace, level) {
        (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_3bd7879c__.getLoggerManager)().setNamespaceLevel(namespace, level);
    }
    setPerfEnabled(enabled) {
        (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_3bd7879c__.getLoggerManager)().setPerfEnabled(enabled);
    }
    setLogSink(sink) {
        (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_3bd7879c__.getLoggerManager)().setSink(sink);
    }
    getRenderer() {
        this.assertNotDisposed();
        return this.context.renderer;
    }
    getScene() {
        this.assertNotDisposed();
        return this.context.sceneGraph.mainScene;
    }
    enableStats(container) {
        this.assertNotDisposed();
        this.loop.enableStats(container);
    }
    resize() {
        this.assertNotDisposed();
        this.loop.syncViewport();
    }
    dispose() {
        if (this._disposed) return;
        const disposeStartedAt = memoryLog.isEnabled(__WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_3bd7879c__.LogLevel.INFO) ? (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_3bd7879c__.getLoggerManager)().now() : 0;
        this._disposed = true;
        let firstError;
        const runPhase = (phase, action)=>{
            try {
                this._runMemoryDiagnosedDisposePhase(phase, action);
            } catch (error) {
                firstError ??= error;
            }
        };
        runPhase('toolsAndSessions', ()=>{
            const toolPlugins = this.pluginManager.getToolPlugins();
            this.activeTools.forEach((name, group)=>{
                const tool = toolPlugins.find((t)=>t.name === name);
                if (tool?.isActive) try {
                    tool.deactivate(this.activationToken);
                    this.events.emit('tool.deactivated', {
                        name,
                        group
                    });
                } catch (err) {
                    this.events.emit('engine.error', {
                        error: err instanceof Error ? err : new Error(String(err)),
                        context: `dispose:deactivateTool:${name}`
                    });
                }
            });
            this.activeTools.clear();
            for (const entry of this.activeSessions.values())entry.invalidate();
            this.activeSessions.clear();
        });
        runPhase('loop', ()=>this.loop.dispose());
        runPhase('plugins', ()=>this.pluginManager.destroy());
        runPhase('context', ()=>this.context.dispose());
        runPhase('renderer', ()=>this.disposeRenderer());
        runPhase('disposedEvent', ()=>this.events.emit('engine.disposed', void 0));
        runPhase('eventBus', ()=>this.events.dispose());
        runPhase('pluginReferences', ()=>this.pluginManager.releaseReferences?.());
        runPhase('hostReferences', ()=>this.context.releaseHostReferences?.());
        this._logMemorySummary('engine.disposed', disposeStartedAt > 0 ? (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_3bd7879c__.getLoggerManager)().now() - disposeStartedAt : void 0, void 0 === firstError ? 'ok' : 'failed');
        if (void 0 !== firstError) throw firstError;
    }
    _runMemoryDiagnosedDisposePhase(phase, action) {
        const startedAt = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_3bd7879c__.getLoggerManager)().now();
        try {
            action();
        } catch (error) {
            const errorName = error instanceof Error ? error.name : typeof error;
            runMemoryDiagnostic(()=>{
                memoryLog.error(`event=dispose.phase.failed engineId=${this.memoryDiagnosticEngineId} phase=dispose.${phase}.failed scope=engine elapsedMs=${((0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_3bd7879c__.getLoggerManager)().now() - startedAt).toFixed(1)} failedPhase=dispose.${phase} errorName=${errorName}`);
            });
            throw error;
        }
    }
    _logMemorySummary(event, elapsedMs, status = 'ok') {
        if (!memoryLog.isEnabled(__WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_3bd7879c__.LogLevel.INFO)) return;
        try {
            const renderer = this.context.getRendererIfAvailable ? this.context.getRendererIfAvailable() : this.context.renderer;
            const rendererInfo = renderer?.info;
            let sceneObjects = 0;
            const scene = this.context.sceneGraph?.mainScene;
            if ('function' == typeof scene?.traverse) scene.traverse(()=>{
                sceneObjects++;
            });
            let contextLost = false;
            try {
                contextLost = renderer?.getContext?.().isContextLost?.() ?? false;
            } catch  {
                contextLost = false;
            }
            memoryLog.info(`event=${event} engineId=${this.memoryDiagnosticEngineId} phase=runtime scope=engine status=${status} elapsedMs=${elapsedMs?.toFixed(1) ?? '0'} loopRunning=${this.loop.running ?? false} plugins=${this.plugins.getNames?.().length ?? 0} sceneObjects=${sceneObjects} threeGeometries=${rendererInfo?.memory?.geometries ?? 0} threeTextures=${rendererInfo?.memory?.textures ?? 0} threePrograms=${rendererInfo?.programs?.length ?? 0} canvasConnected=${renderer?.domElement?.isConnected ?? false} contextLost=${contextLost}`);
        } catch  {}
    }
    disposeRenderer() {
        const renderer = this.context.getRendererIfAvailable?.() ?? this.context.renderer;
        if (!renderer) return;
        try {
            renderer.dispose();
        } catch (err) {
            this.events.emit('engine.error', {
                error: err instanceof Error ? err : new Error(String(err)),
                context: 'dispose:disposeRenderer'
            });
        }
        try {
            renderer.forceContextLoss();
            runMemoryDiagnostic(()=>{
                const contextLost = renderer.getContext().isContextLost();
                memoryLog.info(`event=webgl.context.loss.requested engineId=${this.memoryDiagnosticEngineId} phase=dispose.renderer.contextLoss scope=renderer elapsedMs=0 contextLost=${contextLost}`);
            });
        } catch (err) {
            this.events.emit('engine.error', {
                error: err instanceof Error ? err : new Error(String(err)),
                context: 'dispose:forceRendererContextLoss'
            });
        }
        try {
            renderer.domElement.remove();
        } catch (err) {
            this.events.emit('engine.error', {
                error: err instanceof Error ? err : new Error(String(err)),
                context: 'dispose:removeRendererCanvas'
            });
        }
        renderer.domElement?.removeEventListener?.('webglcontextlost', this.onWebGLContextLost);
    }
    requireService(key, getterName, pluginName) {
        this.assertNotDisposed();
        if (!this.context.hasService(key)) throw new Error('engine.' + getterName + ' requires ' + pluginName + ', but it is not registered. Add ' + pluginName + ' to your plugin list or use a preset that includes it.');
        return this.context.getService(key);
    }
    assertNotDisposed() {
        if (this._disposed) throw new Error('PotreeEngine 已销毁，禁止继续操作');
    }
    disposeLateLoadedAsset(service, handle) {
        const disposableService = service;
        try {
            disposableService.dispose?.(handle.id);
        } catch  {}
    }
}
export { PotreeEngine };
