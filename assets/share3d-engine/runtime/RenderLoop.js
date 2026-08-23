import * as __WEBPACK_EXTERNAL_MODULE_stats_js_ed2aade8__ from "stats.js";
import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_3bd7879c__ from "../shared/logging/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_utils_viewRect_js_3e3494c7__ from "../shared/utils/viewRect.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_3bd7879c__.getLoggerManager)().getLogger('runtime');
const MAX_FRAME_DELTA_SECONDS = 0.1;
function normalizePixelRatioOverride(pixelRatio) {
    if (null == pixelRatio) return null;
    return Number.isFinite(pixelRatio) && pixelRatio > 0 ? pixelRatio : 1;
}
class RenderLoop {
    get running() {
        return this._running;
    }
    get fps() {
        return this._fps;
    }
    getMemoryDiagnostics() {
        return {
            running: this._running,
            disposed: this._disposed,
            rafScheduled: 0 !== this.rafId,
            resizeObserverActive: null !== this.resizeObserver,
            renderedViewEntries: this.lastRenderedAt.size
        };
    }
    constructor(context, pluginManager, viewportCamera, pixelRatioOverride, renderMode = 'continuous'){
        this._running = false;
        this._disposed = false;
        this._fps = 0;
        this.fallbackCamera = new __WEBPACK_EXTERNAL_MODULE_three__.PerspectiveCamera(60, 1, 0.1, 10000);
        this._stats = null;
        this.lastTime = 0;
        this.rafId = 0;
        this.resizeObserver = null;
        this.cachedViewportSize = {
            width: 0,
            height: 0
        };
        this.viewportDirty = true;
        this.lastViewport = {
            width: 0,
            height: 0,
            pixelRatio: 0
        };
        this.lastRenderedAt = new Map();
        this.context = context;
        this.pluginManager = pluginManager;
        this.events = context.events;
        this.viewportCamera = viewportCamera;
        this.renderMode = renderMode;
        this.pixelRatioOverride = normalizePixelRatioOverride(pixelRatioOverride);
        this.viewRegistry = context.hasService('ViewRegistry') ? context.getService('ViewRegistry') : null;
        this.renderInvalidation = context.hasService('RenderInvalidationService') ? context.getService('RenderInvalidationService') : null;
        if ('on-demand' === this.renderMode) this.renderInvalidation?.setFrameRequestCallback(()=>this.requestFrame());
        if (context.hasService('RenderPipeline')) this.pipelineActivityDisposable = this.renderInvalidation?.registerActivitySource({
            id: 'RenderPipeline',
            getRenderActivity: (activityContext)=>context.getService('RenderPipeline').collectRenderActivity(activityContext)
        }) ?? null;
        else this.pipelineActivityDisposable = null;
        this.cachedViewportSize = this.readContainerSize();
        this.resizeObserver = new ResizeObserver((entries)=>{
            this.handleResizeEntries(entries);
        });
        this.resizeObserver.observe(context.container);
    }
    enableStats(container) {
        if (container && !this._stats) {
            this._stats = new __WEBPACK_EXTERNAL_MODULE_stats_js_ed2aade8__["default"]();
            this._stats.showPanel(0);
            this._stats.dom.style.position = 'relative';
            container.appendChild(this._stats.dom);
        } else if (!container && this._stats) {
            this._stats.dom.remove();
            this._stats = null;
        }
    }
    start() {
        if (this._running || this._disposed) return;
        this._running = true;
        this.lastTime = performance.now();
        if ('continuous' === this.renderMode) this.scheduleFrame();
        else {
            this.renderInvalidation?.invalidate('engine.initialFrame');
            if (!this.renderInvalidation) this.requestFrame();
        }
    }
    stop() {
        this._running = false;
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = 0;
            this.renderInvalidation?.setFrameScheduled(false);
        }
    }
    renderOnce() {
        if (this._disposed) return;
        const now = performance.now();
        if (0 === this.lastTime) this.lastTime = now;
        this.onFrame(now, {
            forceRender: true,
            collectActivity: false
        });
    }
    renderManualFrame(request) {
        if (this._disposed) return;
        this.validateManualFrameRequest(request);
        this.stop();
        const timestamp = 1000 * request.timestampSeconds;
        const delta = request.deltaSeconds;
        const width = Math.round(request.width);
        const height = Math.round(request.height);
        this.updateCachedViewportSize({
            width,
            height
        });
        this.applyViewport({
            width,
            height,
            pixelRatio: request.pixelRatio
        });
        this.lastTime = timestamp;
        this.runFrame({
            timestamp,
            delta,
            frameNumber: request.frameNumber,
            forceRenderAllViews: true,
            syncCachedViewport: false,
            targetViewId: request.viewId,
            manualFrame: {
                deterministic: true
            }
        });
    }
    requestFrame() {
        if (this._disposed || this.rafId) return;
        if ('continuous' === this.renderMode && this._running) return;
        this.renderInvalidation?.setFrameScheduled(true);
        this.rafId = requestAnimationFrame((t)=>{
            this.rafId = 0;
            this.renderInvalidation?.setFrameScheduled(false);
            if (this._disposed) return;
            if ('on-demand' === this.renderMode && !this._running) return;
            try {
                if (0 === this.lastTime) this.lastTime = t;
                this.onFrame(t, {
                    forceRender: true,
                    collectActivity: 'on-demand' === this.renderMode
                });
            } catch (err) {
                log.error(`[RenderLoop] onFrame error: ${String(err)}`);
            }
            if ('continuous' === this.renderMode && this._running) this.scheduleFrame();
        });
    }
    syncViewport(size) {
        this.updateCachedViewportSize(size ?? this.readContainerSize());
        if (this.applyCachedViewport()) this.renderInvalidation?.invalidate('viewport.resized');
    }
    readContainerSize() {
        return this.normalizeViewportSize(this.context.getSize());
    }
    handleResizeEntries(entries) {
        const observedSize = this.getObservedViewportSize(entries);
        this.updateCachedViewportSize(observedSize ?? this.readContainerSize());
        if (this.applyCachedViewport()) this.renderInvalidation?.invalidate('viewport.resized');
    }
    getObservedViewportSize(entries) {
        const entry = entries?.[0];
        if (!entry) return null;
        const boxSize = entry.contentBoxSize;
        const firstBox = Array.isArray(boxSize) ? boxSize[0] : boxSize;
        if (firstBox) return this.normalizeViewportSize({
            width: firstBox.inlineSize,
            height: firstBox.blockSize
        });
        if (entry.contentRect) return this.normalizeViewportSize({
            width: entry.contentRect.width,
            height: entry.contentRect.height
        });
        return null;
    }
    normalizeViewportSize(size) {
        return {
            width: Math.max(Math.round(size.width), 1),
            height: Math.max(Math.round(size.height), 1)
        };
    }
    updateCachedViewportSize(size) {
        if (size.width === this.cachedViewportSize.width && size.height === this.cachedViewportSize.height) return;
        this.cachedViewportSize = size;
        this.viewportDirty = true;
    }
    applyCachedViewport() {
        const { width, height } = this.cachedViewportSize;
        const pixelRatio = (this.pixelRatioOverride ?? window.devicePixelRatio) || 1;
        return this.applyViewport({
            width,
            height,
            pixelRatio
        });
    }
    applyViewport(viewport) {
        const { width, height, pixelRatio } = viewport;
        const changed = this.viewportDirty || width !== this.lastViewport.width || height !== this.lastViewport.height || pixelRatio !== this.lastViewport.pixelRatio;
        if (changed) {
            this.lastViewport = {
                width,
                height,
                pixelRatio
            };
            this.context.renderer.setPixelRatio(pixelRatio);
            this.context.renderer.setSize(width, height, true);
            if (this.context.hasService('RenderPipeline')) this.context.getService('RenderPipeline').resize(width, height);
            this.events.emit('viewport.resized', {
                width,
                height,
                pixelRatio
            });
        }
        this.viewportDirty = false;
        return changed;
    }
    dispose() {
        if (this._disposed) return;
        this._disposed = true;
        this.stop();
        this.pipelineActivityDisposable?.dispose();
        this.pipelineActivityDisposable = null;
        this.renderInvalidation?.setFrameRequestCallback(null);
        this.lastRenderedAt.clear();
        this.enableStats(null);
        this.resizeObserver?.disconnect();
        this.resizeObserver = null;
    }
    scheduleFrame() {
        if (!this._running || 'continuous' !== this.renderMode || this.rafId) return;
        this.renderInvalidation?.setFrameScheduled(true);
        this.rafId = requestAnimationFrame((t)=>{
            this.rafId = 0;
            this.renderInvalidation?.setFrameScheduled(false);
            if (!this._running || this._disposed) return;
            try {
                this.onFrame(t);
            } catch (err) {
                log.error(`[RenderLoop] onFrame error: ${String(err)}`);
            }
            this.scheduleFrame();
        });
    }
    onFrame(timestamp, options = {}) {
        const dirtyReasons = this.renderInvalidation?.consumeDirty() ?? [];
        if ('on-demand' === this.renderMode && !options.forceRender && 0 === dirtyReasons.length) return [];
        const rawDelta = Math.max(0, (timestamp - this.lastTime) / 1000);
        const delta = Math.min(rawDelta, MAX_FRAME_DELTA_SECONDS);
        this.lastTime = timestamp;
        if (rawDelta > 0) this._fps = 1 / rawDelta;
        const renderedViewIds = this.runFrame({
            timestamp,
            delta,
            frameNumber: this.context.frameNumber + 1,
            forceRenderAllViews: false,
            syncCachedViewport: true
        });
        if (options.collectActivity ?? 'on-demand' === this.renderMode) this.collectOnDemandActivity(renderedViewIds);
        return renderedViewIds;
    }
    runFrame(request) {
        this._stats?.begin();
        const { timestamp, delta } = request;
        this.context.frameNumber = request.frameNumber;
        const renderedViewIds = [];
        if (request.syncCachedViewport) this.applyCachedViewport();
        const surface = this.getRenderSurfaceInfo();
        const width = surface.renderWidth;
        const height = surface.renderHeight;
        const engineFrame = {
            frameNumber: this.context.frameNumber,
            timestamp,
            delta,
            renderer: this.context.renderer,
            views: this.collectViewSnapshots(width, height),
            manualFrame: request.manualFrame
        };
        this.pruneRenderSchedule(engineFrame.views);
        if (request.targetViewId && !this.resolveRenderableView(request.targetViewId)) throw new Error(`Manual frame target view is not renderable: ${request.targetViewId}`);
        this.events.emit('frame.begin', {
            timestamp,
            delta
        });
        this.pluginManager.updateFrame(engineFrame);
        for (const snapshot of engineFrame.views){
            const current = this.resolveRenderableView(snapshot.id);
            if (!current) continue;
            if (request.targetViewId && current.id !== request.targetViewId) continue;
            if (!request.forceRenderAllViews && !this.shouldRenderView(current, timestamp)) continue;
            const viewFrame = this.createViewFrame(current, timestamp, delta, surface, request.manualFrame);
            const rendererState = this.captureRendererState(this.context.renderer);
            this.clearViewBuffer(this.context.renderer, viewFrame);
            this.events.emit('view.frame.begin', {
                viewId: current.id,
                timestamp,
                delta
            });
            try {
                this.pluginManager.renderView(viewFrame);
                this.lastRenderedAt.set(current.id, timestamp);
                renderedViewIds.push(current.id);
            } finally{
                this.restoreRendererState(this.context.renderer, rendererState);
                this.events.emit('view.frame.end', {
                    viewId: current.id,
                    frameContext: viewFrame
                });
            }
        }
        this.events.emit('frame.end', {
            engineFrame
        });
        this._stats?.end();
        return renderedViewIds;
    }
    collectOnDemandActivity(renderedViewIds) {
        if ('on-demand' !== this.renderMode || !this._running || !this.renderInvalidation) return;
        const activity = this.renderInvalidation.collectActivity({
            frameNumber: this.context.frameNumber,
            renderedViewIds,
            activeViewId: this.viewRegistry?.getActive()?.id ?? null
        });
        if (!activity.needsNextFrame) return;
        this.renderInvalidation.requestNextFrame('render.activity', {
            detail: activity.reasons?.join(',') ?? ''
        });
    }
    validateManualFrameRequest(request) {
        const invalidField = Object.entries({
            frameNumber: request.frameNumber,
            timestampSeconds: request.timestampSeconds,
            deltaSeconds: request.deltaSeconds,
            width: request.width,
            height: request.height,
            pixelRatio: request.pixelRatio
        }).find(([, value])=>!Number.isFinite(value));
        if (invalidField) throw new Error(`Invalid manual frame parameter: ${invalidField[0]}`);
        if (!Number.isInteger(request.frameNumber) || request.frameNumber < 0) throw new Error('Invalid manual frame parameter: frameNumber');
        if (request.timestampSeconds < 0 || request.deltaSeconds < 0) throw new Error('Invalid manual frame parameter: timestampSeconds/deltaSeconds');
        if (request.width <= 0 || request.height <= 0 || request.pixelRatio <= 0) throw new Error('Invalid manual frame parameter: width/height/pixelRatio');
    }
    clearViewBuffer(renderer, viewFrame) {
        const savedState = this.captureRendererState(renderer);
        try {
            renderer.setViewport(viewFrame.viewport.x, viewFrame.viewport.y, viewFrame.viewport.width, viewFrame.viewport.height);
            renderer.setScissor(viewFrame.viewport.x, viewFrame.viewport.y, viewFrame.viewport.width, viewFrame.viewport.height);
            renderer.setScissorTest(true);
            renderer.clear(true, true, true);
        } finally{
            this.restoreRendererState(renderer, savedState);
        }
    }
    collectViewSnapshots(width, height) {
        if (this.viewRegistry) return this.viewRegistry.list();
        return [
            {
                id: 'primary',
                rect: {
                    x: 0,
                    y: 0,
                    width,
                    height
                },
                visible: true,
                zIndex: 0,
                layerMask: 1,
                userData: {},
                removable: false,
                active: true
            }
        ];
    }
    resolveRenderableView(viewId) {
        if (!this.viewRegistry) return this.collectViewSnapshots(this.cachedViewportSize.width, this.cachedViewportSize.height)[0] ?? null;
        const snapshot = this.viewRegistry.get(viewId);
        if (!snapshot) return null;
        if (!snapshot.visible || snapshot.rect.width <= 0 || snapshot.rect.height <= 0) return null;
        return snapshot;
    }
    shouldRenderView(snapshot, timestamp) {
        if (snapshot.active || !this.viewRegistry) return true;
        const policy = this.viewRegistry.getExtension(snapshot.id, 'renderPolicy');
        const minIntervalMs = policy?.minIntervalMs ?? 0;
        if (minIntervalMs <= 0) return true;
        const lastRenderedAt = this.lastRenderedAt.get(snapshot.id);
        if (null == lastRenderedAt) return true;
        return timestamp - lastRenderedAt >= minIntervalMs;
    }
    pruneRenderSchedule(views) {
        const aliveViewIds = new Set(views.map((view)=>view.id));
        for (const viewId of Array.from(this.lastRenderedAt.keys()))if (!aliveViewIds.has(viewId)) this.lastRenderedAt.delete(viewId);
    }
    createViewFrame(snapshot, timestamp, delta, surface, manualFrame) {
        const viewRect = this.getEffectiveViewRect(snapshot.rect, surface);
        return {
            frameNumber: this.context.frameNumber,
            timestamp,
            delta,
            renderer: this.context.renderer,
            viewId: snapshot.id,
            camera: this.getViewCamera(snapshot.id),
            viewport: (0, __WEBPACK_EXTERNAL_MODULE__shared_utils_viewRect_js_3e3494c7__.toRendererViewportRect)(viewRect, {
                width: surface.renderWidth,
                height: surface.renderHeight
            }),
            viewRect,
            manualFrame
        };
    }
    getViewCamera(viewId) {
        const managedCamera = this.viewRegistry?.getExtension(viewId, 'viewportCamera');
        return managedCamera?.getActiveCamera() ?? this.viewportCamera?.getActiveCamera() ?? this.fallbackCamera;
    }
    captureRendererState(renderer) {
        return {
            renderTarget: renderer.getRenderTarget(),
            viewport: 'function' == typeof renderer.getViewport ? renderer.getViewport(new __WEBPACK_EXTERNAL_MODULE_three__.Vector4()) : null,
            scissor: 'function' == typeof renderer.getScissor ? renderer.getScissor(new __WEBPACK_EXTERNAL_MODULE_three__.Vector4()) : null,
            scissorTest: 'function' == typeof renderer.getScissorTest ? renderer.getScissorTest() : false,
            autoClear: renderer.autoClear
        };
    }
    restoreRendererState(renderer, state) {
        renderer.setRenderTarget(state.renderTarget);
        if (state.viewport) renderer.setViewport(state.viewport.x, state.viewport.y, state.viewport.z, state.viewport.w);
        if (state.scissor) renderer.setScissor(state.scissor.x, state.scissor.y, state.scissor.z, state.scissor.w);
        renderer.setScissorTest(state.scissorTest);
        renderer.autoClear = state.autoClear;
    }
    getRenderSurfaceInfo() {
        const rendererSize = this.context.renderer.getSize(new __WEBPACK_EXTERNAL_MODULE_three__.Vector2());
        const canvas = this.context.renderer.domElement;
        const renderWidth = Math.max(Math.round(rendererSize.x), 1);
        const renderHeight = Math.max(Math.round(rendererSize.y), 1);
        const useRendererSurface = renderWidth !== this.cachedViewportSize.width || renderHeight !== this.cachedViewportSize.height;
        return {
            containerWidth: this.cachedViewportSize.width,
            containerHeight: this.cachedViewportSize.height,
            renderWidth,
            renderHeight,
            canvasWidth: canvas.width,
            canvasHeight: canvas.height,
            useRendererSurface
        };
    }
    getEffectiveViewRect(rect, surface) {
        if (!surface.useRendererSurface) return rect;
        const scaleX = surface.containerWidth > 0 ? surface.renderWidth / surface.containerWidth : 1;
        const scaleY = surface.containerHeight > 0 ? surface.renderHeight / surface.containerHeight : 1;
        return {
            x: Math.round(rect.x * scaleX),
            y: Math.round(rect.y * scaleY),
            width: Math.round(rect.width * scaleX),
            height: Math.round(rect.height * scaleY)
        };
    }
}
export { RenderLoop };
