import * as __WEBPACK_EXTERNAL_MODULE__common_event_js_2be06679__ from "../common/event.js";
import * as __WEBPACK_EXTERNAL_MODULE__common_interface_js_c10b0d9b__ from "../common/interface.js";
class BaseTool {
    start(controller, startMode = __WEBPACK_EXTERNAL_MODULE__common_interface_js_c10b0d9b__.StartMode.alone, ...args) {
        this.controller = controller;
        this.startMode = startMode;
        if (startMode === __WEBPACK_EXTERNAL_MODULE__common_interface_js_c10b0d9b__.StartMode.alone) {
            controller.toolStack.alone(this);
            this.initialize(...args);
        } else this.initialize(...args);
    }
    exit() {
        if (this.startMode === __WEBPACK_EXTERNAL_MODULE__common_interface_js_c10b0d9b__.StartMode.none) {
            this.onPause?.();
            this.terminate();
            return;
        }
        if (this.controller.toolStack.top === this) this.controller.toolStack.pop();
    }
    inject(handler) {
        handler.injectTool(this);
        return this.eventTypeList.forEach((eventType)=>{
            handler[eventType] && this.injectedMap[eventType].set(handler, handler[eventType].bind(handler));
        });
    }
    eject(handler) {
        handler.ejectTool();
        return this.eventTypeList.forEach((eventType)=>{
            handler[eventType] && this.injectedMap[eventType].delete(handler);
        });
    }
    constructor(){
        this.eventTypeList = [
            __WEBPACK_EXTERNAL_MODULE__common_event_js_2be06679__.EventName.onMouseDown,
            __WEBPACK_EXTERNAL_MODULE__common_event_js_2be06679__.EventName.onMouseMove,
            __WEBPACK_EXTERNAL_MODULE__common_event_js_2be06679__.EventName.onDoubleClick,
            __WEBPACK_EXTERNAL_MODULE__common_event_js_2be06679__.EventName.onKeyDown,
            __WEBPACK_EXTERNAL_MODULE__common_event_js_2be06679__.EventName.onKeyUp,
            __WEBPACK_EXTERNAL_MODULE__common_event_js_2be06679__.EventName.onControlsChange,
            __WEBPACK_EXTERNAL_MODULE__common_event_js_2be06679__.EventName.onViewerUpdate
        ];
        this.injectedMap = this.eventTypeList.reduce((map, eventType)=>{
            map[eventType] = new Map();
            return map;
        }, {});
    }
}
export { BaseTool };
