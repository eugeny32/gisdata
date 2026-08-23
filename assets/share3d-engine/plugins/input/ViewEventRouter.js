import * as __WEBPACK_EXTERNAL_MODULE__shared_utils_viewRect_js_7e8b5892__ from "../../shared/utils/viewRect.js";
const VIEW_EVENT_ROUTER_PRIORITY = 20000;
class ViewEventRouter {
    constructor(inputRouter, viewRegistry){
        this.consumers = [];
        this.inputRouter = null;
        this.viewRegistry = null;
        this.containerViewportProvider = null;
        this.capturedViewIdValue = null;
        this.disposed = false;
        this.inputConsumer = {
            name: 'view-event-router',
            priority: VIEW_EVENT_ROUTER_PRIORITY,
            onPointerDown: (event)=>this.handlePointerDown(event),
            onPointerMove: (event)=>this.handlePointerMove(event),
            onPointerUp: (event)=>this.handlePointerUp(event),
            onWheel: (event)=>this.handleWheel(event),
            onKeyDown: (event)=>this.handleKeyDown(event),
            onKeyUp: (event)=>this.handleKeyUp(event),
            onWinKeyDown: (event)=>this.handleWinKeyDown(event),
            onWinKeyUp: (event)=>this.handleWinKeyUp(event),
            onDoubleClick: (event)=>this.handleDoubleClick(event)
        };
        if (inputRouter && viewRegistry) this.connect(inputRouter, viewRegistry);
    }
    get activeViewId() {
        return this.viewRegistry?.getActive()?.id ?? null;
    }
    get capturedViewId() {
        return this.getCapturedViewSnapshot()?.id ?? null;
    }
    addConsumer(consumer) {
        this.consumers.push(consumer);
        this.sortConsumers();
    }
    removeConsumer(consumer) {
        const index = this.consumers.indexOf(consumer);
        if (index >= 0) this.consumers.splice(index, 1);
    }
    connect(inputRouter, viewRegistry, containerViewportProvider) {
        if (this.disposed) throw new Error('ViewEventRouter 已销毁，无法重新连接');
        if (this.inputRouter) this.inputRouter.removeConsumer(this.inputConsumer);
        this.inputRouter = inputRouter;
        this.viewRegistry = viewRegistry;
        this.containerViewportProvider = containerViewportProvider ?? null;
        this.inputRouter.addConsumer(this.inputConsumer);
    }
    dispose() {
        if (this.disposed) return;
        this.disposed = true;
        this.capturedViewIdValue = null;
        this.consumers.length = 0;
        this.inputRouter?.removeConsumer(this.inputConsumer);
        this.inputRouter = null;
        this.viewRegistry = null;
        this.containerViewportProvider = null;
    }
    sortConsumers() {
        this.consumers.sort((left, right)=>right.priority - left.priority);
    }
    handlePointerDown(event) {
        const view = this.resolveHitView(event);
        if (!view) return false;
        this.capturedViewIdValue = view.id;
        return this.dispatchPointer('onPointerDown', event, view, false);
    }
    handlePointerMove(event) {
        const routed = this.resolvePointerRoute(event);
        if (!routed) return false;
        return this.dispatchPointer('onPointerMove', event, routed.view, routed.captured);
    }
    handlePointerUp(event) {
        const hadCapture = null !== this.capturedViewIdValue;
        const capturedView = this.getCapturedViewSnapshot();
        if (capturedView) try {
            return this.dispatchPointer('onPointerUp', event, capturedView, true);
        } finally{
            this.capturedViewIdValue = null;
        }
        if (hadCapture) {
            this.capturedViewIdValue = null;
            return false;
        }
        const hitView = this.resolveHitView(event);
        if (!hitView) return false;
        try {
            return this.dispatchPointer('onPointerUp', event, hitView, false);
        } finally{
            this.capturedViewIdValue = null;
        }
    }
    handleWheel(event) {
        const routed = this.resolveWheelRoute(event);
        if (!routed) return false;
        const routedEvent = this.createWheelEvent(event, routed.view, routed.captured);
        return this.dispatchWheel(routedEvent);
    }
    handleKeyDown(event) {
        const routedEvent = this.createKeyEvent(event);
        if (!routedEvent) return false;
        return this.dispatchKey('onKeyDown', routedEvent);
    }
    handleKeyUp(event) {
        const routedEvent = this.createKeyEvent(event);
        if (!routedEvent) return false;
        return this.dispatchKey('onKeyUp', routedEvent);
    }
    handleWinKeyDown(event) {
        const routedEvent = this.createKeyEvent(event);
        if (!routedEvent) return false;
        return this.dispatchKey('onWinKeyDown', routedEvent);
    }
    handleWinKeyUp(event) {
        const routedEvent = this.createKeyEvent(event);
        if (!routedEvent) return false;
        return this.dispatchKey('onWinKeyUp', routedEvent);
    }
    handleDoubleClick(event) {
        const routed = this.resolveWheelRoute(event);
        if (!routed) return false;
        return this.dispatchPointer('onDoubleClick', event, routed.view, routed.captured);
    }
    resolvePointerRoute(event) {
        const capturedView = this.getCapturedViewSnapshot();
        if (capturedView) return {
            view: capturedView,
            captured: true
        };
        const hitView = this.resolveHitView(event);
        if (!hitView) return null;
        return {
            view: hitView,
            captured: false
        };
    }
    resolveWheelRoute(event) {
        return this.resolvePointerRoute(event);
    }
    resolveHitView(event) {
        return this.viewRegistry?.resolveViewAtScreen(this.toContainerLocalScreen(event.screen)) ?? null;
    }
    getCapturedViewSnapshot() {
        if (!this.capturedViewIdValue) return null;
        const snapshot = this.viewRegistry?.get(this.capturedViewIdValue);
        if (!snapshot || !snapshot.visible || snapshot.rect.width <= 0 || snapshot.rect.height <= 0) {
            this.capturedViewIdValue = null;
            return null;
        }
        return snapshot;
    }
    createPointerEvent(event, view, captured) {
        const screen = this.toContainerLocalScreen(event.screen);
        return {
            ...event,
            screen,
            viewport: {
                ...view.rect
            },
            viewId: view.id,
            viewRect: {
                ...view.rect
            },
            localNDC: (0, __WEBPACK_EXTERNAL_MODULE__shared_utils_viewRect_js_7e8b5892__.screenToViewNDC)(screen, view.rect),
            captured
        };
    }
    createWheelEvent(event, view, captured) {
        const screen = this.toContainerLocalScreen(event.screen);
        return {
            ...event,
            screen,
            viewport: {
                ...view.rect
            },
            viewId: view.id,
            viewRect: {
                ...view.rect
            },
            localNDC: (0, __WEBPACK_EXTERNAL_MODULE__shared_utils_viewRect_js_7e8b5892__.screenToViewNDC)(screen, view.rect),
            captured
        };
    }
    createKeyEvent(event) {
        const activeViewId = this.activeViewId;
        if (!activeViewId) return null;
        return {
            ...event,
            viewId: activeViewId,
            captured: this.capturedViewId === activeViewId
        };
    }
    dispatchPointer(methodName, event, view, captured) {
        const routedEvent = this.createPointerEvent(event, view, captured);
        for (const consumer of this.consumers){
            const handler = consumer[methodName];
            if (handler?.call(consumer, routedEvent)) return true;
        }
        return false;
    }
    dispatchWheel(event) {
        for (const consumer of this.consumers)if (consumer.onWheel?.(event)) return true;
        return false;
    }
    dispatchKey(methodName, event) {
        for (const consumer of this.consumers){
            const handler = consumer[methodName];
            if (handler?.call(consumer, event)) return true;
        }
        return false;
    }
    toContainerLocalScreen(screen) {
        const viewport = this.containerViewportProvider?.();
        if (!viewport) return screen.clone();
        return (0, __WEBPACK_EXTERNAL_MODULE__shared_utils_viewRect_js_7e8b5892__.toViewportLocalPoint)(screen, viewport);
    }
}
export { ViewEventRouter };
