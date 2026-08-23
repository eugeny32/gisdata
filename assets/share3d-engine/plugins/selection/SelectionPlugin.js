import * as __WEBPACK_EXTERNAL_MODULE__SelectionService_js_8974d4ba__ from "./SelectionService.js";
class SelectionPlugin {
    onInit(context) {
        this._disposed = false;
        this.service = new __WEBPACK_EXTERNAL_MODULE__SelectionService_js_8974d4ba__.SelectionServiceImpl(context.events);
        context.registerService('SelectionService', this.service);
    }
    onStart() {}
    onDestroy() {
        if (this._disposed) return;
        this._disposed = true;
        this.service?.dispose();
        this.service = null;
    }
    constructor(){
        this.name = 'selection';
        this.priority = 30;
        this.dependencies = [
            'PickingService'
        ];
        this.provides = [
            'SelectionService'
        ];
        this.service = null;
        this._disposed = false;
    }
}
export { SelectionPlugin };
