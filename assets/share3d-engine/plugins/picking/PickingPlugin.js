import * as __WEBPACK_EXTERNAL_MODULE__PickingService_js_fc85a567__ from "./PickingService.js";
class PickingPlugin {
    onInit(context) {
        this.context = context;
        this._disposed = false;
        this.service = new __WEBPACK_EXTERNAL_MODULE__PickingService_js_fc85a567__.PickingServiceImpl(()=>{
            const { container } = context;
            const rect = container.getBoundingClientRect();
            return {
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height
            };
        }, ()=>this.viewRegistry);
        context.registerService('PickingService', this.service);
    }
    onStart() {
        if (!this.context) return;
        this.viewRegistry = this.context.getService('ViewRegistry');
    }
    onDestroy() {
        if (this._disposed) return;
        this._disposed = true;
        this.service?.dispose();
        this.service = null;
        this.viewRegistry = null;
        this.context = null;
    }
    constructor(){
        this.name = 'picking';
        this.priority = 25;
        this.dependencies = [
            'ViewRegistry'
        ];
        this.provides = [
            'PickingService'
        ];
        this.context = null;
        this.viewRegistry = null;
        this.service = null;
        this._disposed = false;
    }
}
export { PickingPlugin };
