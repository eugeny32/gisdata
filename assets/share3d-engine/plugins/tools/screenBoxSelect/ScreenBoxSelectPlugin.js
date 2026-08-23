import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__ from "../shared/viewScope.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_utils_index_js_26f49040__ from "../../../shared/utils/index.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('tools');
const MIN_DRAG_SIZE = 5;
class ScreenBoxSelectPlugin {
    get isActive() {
        return this._active;
    }
    getCurrentRect() {
        if (!this.isDragging || !this.startScreen || !this.endScreen) return null;
        return {
            start: {
                ...this.startScreen
            },
            end: {
                ...this.endScreen
            }
        };
    }
    setActivationToken(token) {
        this.activationToken = token;
    }
    onInit(context) {
        this.context = context;
        context.registerService('ScreenBoxSelectService', this);
    }
    onStart() {
        this.inputRouter = this.context.getService('InputRouter');
        this.pickingService = this.context.getService('PickingService');
        this.selectionService = this.context.getService('SelectionService');
        this.viewRegistry = (0, __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__.getOptionalViewRegistry)(this.context);
        this.viewEventRouter = this.context.hasService('ViewEventRouter') ? this.context.getService('ViewEventRouter') : null;
        this.syncActiveViewState();
        if (this.viewRegistry) this.context.events.on('view.activated', this.handleViewActivated);
    }
    onRenderView(frame) {
        if (!(0, __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__.isActiveViewFrame)(this.viewRegistry, frame)) return;
        this.currentCamera = this.resolveActiveViewCamera() ?? frame.camera;
        this.syncActiveViewState();
        this.viewportWidth = frame.viewport.width;
        this.viewportHeight = frame.viewport.height;
    }
    onDestroy() {
        if (this.viewRegistry) this.context.events.off('view.activated', this.handleViewActivated);
        if (this._active && this.activationToken) this.deactivate(this.activationToken);
        this.viewRegistry = null;
        this.viewEventRouter = null;
    }
    activate(token) {
        this.validateToken(token);
        if (this._active) return;
        this._active = true;
        this.syncActiveViewState();
        if (this.viewEventRouter) {
            this.viewEventRouter.addConsumer(this.viewConsumer);
            this.usingViewEventRouter = true;
            return;
        }
        this.inputRouter.addConsumer(this.consumer);
        this.usingViewEventRouter = false;
    }
    deactivate(token) {
        this.validateToken(token);
        if (!this._active) return;
        this._active = false;
        if (this.usingViewEventRouter) this.viewEventRouter?.removeConsumer(this.viewConsumer);
        else this.inputRouter.removeConsumer(this.consumer);
        this.usingViewEventRouter = false;
        this.resetDrag();
        this.currentCamera = null;
        this.currentViewId = null;
        this.currentViewRect = null;
    }
    handlePointerDown(event) {
        if (2 === event.button) {
            if (this.isDragging) {
                this.resetDrag();
                return true;
            }
            return false;
        }
        if (0 !== event.button) return false;
        this.syncEventViewState(event);
        this.isDragging = true;
        this.startScreen = {
            x: event.screen.x,
            y: event.screen.y
        };
        this.endScreen = {
            x: event.screen.x,
            y: event.screen.y
        };
        this.dragViewportRect = this.resolveEventViewportRect(event);
        this.dragQueryViewRect = this.resolveEventQueryViewRect(event);
        this.dragViewId = this.resolveEventViewId(event);
        this.dragCamera = this.resolveEventCamera(event);
        return true;
    }
    handlePointerMove(event) {
        if (!this.isDragging) return false;
        this.endScreen = {
            x: event.screen.x,
            y: event.screen.y
        };
        return true;
    }
    handlePointerUp(_event) {
        if (!this.isDragging || !this.startScreen || !this.endScreen) return false;
        const rectWidth = Math.abs(this.endScreen.x - this.startScreen.x);
        const rectHeight = Math.abs(this.endScreen.y - this.startScreen.y);
        if (rectWidth < MIN_DRAG_SIZE || rectHeight < MIN_DRAG_SIZE) {
            this.resetDrag();
            return true;
        }
        this.performRectPick();
        this.resetDrag();
        return true;
    }
    handleKeyDown(event) {
        if ('Escape' === event.key && this.isDragging) {
            this.resetDrag();
            return true;
        }
        return false;
    }
    performRectPick() {
        const camera = this.dragCamera ?? this.currentCamera;
        if (!camera || !this.startScreen || !this.endScreen) return;
        const minScreen = {
            x: Math.min(this.startScreen.x, this.endScreen.x),
            y: Math.min(this.startScreen.y, this.endScreen.y)
        };
        const maxScreen = {
            x: Math.max(this.startScreen.x, this.endScreen.x),
            y: Math.max(this.startScreen.y, this.endScreen.y)
        };
        const viewportRect = this.dragViewportRect ?? this.currentViewRect;
        if (!viewportRect && (0 === this.viewportWidth || 0 === this.viewportHeight)) return;
        const ndcMin = viewportRect ? (0, __WEBPACK_EXTERNAL_MODULE__shared_utils_index_js_26f49040__.screenToViewNDC)(new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(minScreen.x, maxScreen.y), viewportRect) : new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(minScreen.x / this.viewportWidth * 2 - 1, 2 * -(maxScreen.y / this.viewportHeight) + 1);
        const ndcMax = viewportRect ? (0, __WEBPACK_EXTERNAL_MODULE__shared_utils_index_js_26f49040__.screenToViewNDC)(new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(maxScreen.x, minScreen.y), viewportRect) : new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(maxScreen.x / this.viewportWidth * 2 - 1, 2 * -(minScreen.y / this.viewportHeight) + 1);
        const queryViewRect = this.dragQueryViewRect ?? this.currentViewRect;
        const query = {
            min: ndcMin,
            max: ndcMax,
            camera,
            viewId: this.dragViewId ?? this.currentViewId ?? void 0,
            viewRect: queryViewRect ? {
                ...queryViewRect
            } : void 0
        };
        const results = this.pickingService.pickRect(query);
        if (0 === results.length) log.warn(`[ScreenBoxSelectPlugin] pickRect 返回空结果，请确认是否有 provider 实现了 pickRect`);
        this.selectionService.set(results);
    }
    resetDrag() {
        this.isDragging = false;
        this.startScreen = null;
        this.endScreen = null;
        this.dragViewportRect = null;
        this.dragQueryViewRect = null;
        this.dragViewId = null;
        this.dragCamera = null;
    }
    validateToken(token) {
        if (token !== this.activationToken) throw new Error('ScreenBoxSelectPlugin: 非法的 ActivationToken，操作被拒绝');
    }
    syncActiveViewState() {
        const activeView = (0, __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__.getActiveView)(this.viewRegistry);
        this.currentViewId = activeView?.id ?? null;
        this.currentViewRect = activeView ? {
            x: activeView.rect.x,
            y: activeView.rect.y,
            width: activeView.rect.width,
            height: activeView.rect.height
        } : null;
        this.currentCamera = this.resolveActiveViewCamera() ?? this.currentCamera;
    }
    resolveActiveViewCamera() {
        return (0, __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__.getActiveViewCamera)(this.viewRegistry);
    }
    syncEventViewState(event) {
        if (!this.isViewPointerEvent(event)) return;
        this.currentViewId = event.viewId;
        this.currentViewRect = {
            ...event.viewRect
        };
        this.currentCamera = this.resolveViewCamera(event.viewId) ?? this.currentCamera;
    }
    resolveEventViewportRect(event) {
        if (this.isViewPointerEvent(event)) return {
            ...event.viewRect
        };
        return event.viewport ? {
            ...event.viewport
        } : this.currentViewRect;
    }
    resolveEventQueryViewRect(event) {
        if (this.isViewPointerEvent(event)) return {
            ...event.viewRect
        };
        return this.currentViewRect;
    }
    resolveEventViewId(event) {
        if (this.isViewPointerEvent(event)) return event.viewId;
        return this.currentViewId;
    }
    resolveEventCamera(event) {
        const viewId = this.resolveEventViewId(event);
        return (viewId ? this.resolveViewCamera(viewId) : null) ?? this.currentCamera;
    }
    resolveViewCamera(viewId) {
        const managedCamera = this.viewRegistry?.getExtension(viewId, 'viewportCamera');
        return managedCamera?.getActiveCamera?.() ?? null;
    }
    isViewPointerEvent(event) {
        return 'viewId' in event && 'viewRect' in event;
    }
    constructor(){
        this.name = 'screenBoxSelect';
        this.priority = 50;
        this.group = 'default';
        this.dependencies = [
            'PickingService',
            'InputRouter',
            'SelectionService'
        ];
        this.provides = [
            'ScreenBoxSelectService'
        ];
        this._active = false;
        this.activationToken = null;
        this.viewRegistry = null;
        this.viewEventRouter = null;
        this.usingViewEventRouter = false;
        this.isDragging = false;
        this.startScreen = null;
        this.endScreen = null;
        this.dragViewportRect = null;
        this.dragQueryViewRect = null;
        this.dragViewId = null;
        this.dragCamera = null;
        this.currentCamera = null;
        this.currentViewId = null;
        this.currentViewRect = null;
        this.viewportWidth = 0;
        this.viewportHeight = 0;
        this.handleViewActivated = (event)=>{
            this.syncActiveViewState();
            if (event.previousViewId && event.previousViewId !== event.viewId) this.resetDrag();
        };
        this.consumer = {
            name: 'screenBoxSelect',
            priority: 100,
            onPointerDown: (event)=>this.handlePointerDown(event),
            onPointerMove: (event)=>this.handlePointerMove(event),
            onPointerUp: (event)=>this.handlePointerUp(event),
            onKeyDown: (event)=>this.handleKeyDown(event)
        };
        this.viewConsumer = {
            name: 'screenBoxSelect',
            priority: 100,
            onPointerDown: (event)=>this.handlePointerDown(event),
            onPointerMove: (event)=>this.handlePointerMove(event),
            onPointerUp: (event)=>this.handlePointerUp(event),
            onKeyDown: (event)=>this.handleKeyDown(event)
        };
    }
}
const ScreenBoxSelectPlugin_rslib_entry_ = ScreenBoxSelectPlugin;
export { ScreenBoxSelectPlugin, ScreenBoxSelectPlugin_rslib_entry_ as default };
