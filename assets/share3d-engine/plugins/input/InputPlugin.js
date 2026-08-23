import * as __WEBPACK_EXTERNAL_MODULE__shared_utils_viewRect_js_7e8b5892__ from "../../shared/utils/viewRect.js";
import * as __WEBPACK_EXTERNAL_MODULE__InputRouter_js_62e8239b__ from "./InputRouter.js";
import * as __WEBPACK_EXTERNAL_MODULE__PointerLockService_js_aaa9922e__ from "./PointerLockService.js";
import * as __WEBPACK_EXTERNAL_MODULE__ViewEventRouter_js_3c9946e7__ from "./ViewEventRouter.js";
const VIEW_ACTIVATION_PRIORITY = 25000;
class InputPlugin {
    toClientViewport(containerViewport, rect) {
        return {
            x: containerViewport.x + rect.x,
            y: containerViewport.y + rect.y,
            width: rect.width,
            height: rect.height
        };
    }
    shouldUseContainerViewportAsCompatibilityDefault() {
        if (!this.context?.hasService('ViewRegistry')) return true;
        const viewRegistry = this.context.getService('ViewRegistry');
        const visibleViews = viewRegistry.list().filter((view)=>view.visible && view.rect.width > 0 && view.rect.height > 0);
        return 1 === visibleViews.length && visibleViews[0]?.id === viewRegistry.primaryViewId;
    }
    onInit(context) {
        this.context = context;
        const renderInvalidation = context.hasService('RenderInvalidationService') ? context.getService('RenderInvalidationService') : null;
        this.router = renderInvalidation ? new __WEBPACK_EXTERNAL_MODULE__InputRouter_js_62e8239b__.InputRouter(context.container, renderInvalidation) : new __WEBPACK_EXTERNAL_MODULE__InputRouter_js_62e8239b__.InputRouter(context.container);
        this.pointerLockService = new __WEBPACK_EXTERNAL_MODULE__PointerLockService_js_aaa9922e__.PointerLockServiceImpl(context.container, context.events);
        this.viewEventRouter = new __WEBPACK_EXTERNAL_MODULE__ViewEventRouter_js_3c9946e7__.ViewEventRouter();
        context.registerService('InputRouter', this.router);
        context.registerService('PointerLockService', this.pointerLockService);
        context.registerService('ViewEventRouter', this.viewEventRouter);
    }
    onStart() {
        if (!this.context) throw new Error('InputPlugin 未初始化，无法启动');
        this.context.getService('CameraRig');
        const viewRegistry = this.context.getService('ViewRegistry');
        this.pointerLockService?.bindViewRegistry(viewRegistry);
        this.viewEventRouter?.connect(this.router, viewRegistry, ()=>{
            const rect = this.context.container.getBoundingClientRect();
            return {
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height
            };
        });
        this.router?.setCompatibilityViewportProvider(()=>{
            const containerRect = this.context.container.getBoundingClientRect();
            const containerViewport = {
                x: containerRect.left,
                y: containerRect.top,
                width: containerRect.width,
                height: containerRect.height
            };
            if (this.shouldUseContainerViewportAsCompatibilityDefault()) return containerViewport;
            if (!this.context?.hasService('ViewRegistry')) return null;
            const capturedViewId = this.viewEventRouter?.capturedViewId;
            if (capturedViewId) {
                const capturedViewRect = this.context.getService('ViewRegistry').get(capturedViewId)?.rect;
                return capturedViewRect ? this.toClientViewport(containerViewport, capturedViewRect) : null;
            }
            const activeViewRect = this.context.getService('ViewRegistry').getActive()?.rect;
            return activeViewRect ? this.toClientViewport(containerViewport, activeViewRect) : null;
        });
        this.activationConsumer = {
            name: 'input-active-view-sync',
            priority: VIEW_ACTIVATION_PRIORITY,
            onPointerDown: (event)=>{
                const rect = this.context.container.getBoundingClientRect();
                const hitView = viewRegistry.resolveViewAtScreen((0, __WEBPACK_EXTERNAL_MODULE__shared_utils_viewRect_js_7e8b5892__.toViewportLocalPoint)(event.screen, {
                    x: rect.left,
                    y: rect.top
                }));
                if (hitView && hitView.id !== viewRegistry.getActive()?.id) viewRegistry.setActive(hitView.id);
                return false;
            }
        };
        this.router?.addConsumer(this.activationConsumer);
    }
    onDestroy() {
        if (this._disposed) return;
        this._disposed = true;
        if (this.router && this.activationConsumer) {
            this.router.removeConsumer(this.activationConsumer);
            this.activationConsumer = null;
        }
        this.pointerLockService?.dispose();
        this.viewEventRouter?.dispose();
        this.router?.dispose();
    }
    constructor(){
        this.name = 'input';
        this.priority = 5;
        this.dependencies = [
            'CameraRig',
            'ViewRegistry'
        ];
        this.provides = [
            'InputRouter',
            'ViewEventRouter',
            'PointerLockService'
        ];
        this.activationConsumer = null;
        this._disposed = false;
    }
}
export { InputPlugin };
