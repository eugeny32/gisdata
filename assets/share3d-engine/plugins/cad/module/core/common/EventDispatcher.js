import * as __WEBPACK_EXTERNAL_MODULE_mitt__ from "mitt";
class EventDispatcher {
    on(type, handler) {
        this.emitter.on(type, handler);
    }
    emit(type, event) {
        this.emitter.emit(type, event);
    }
    off(type, handler) {
        this.emitter.off(type, handler);
    }
    constructor(){
        this.emitter = (0, __WEBPACK_EXTERNAL_MODULE_mitt__["default"])();
    }
}
export { EventDispatcher as default };
