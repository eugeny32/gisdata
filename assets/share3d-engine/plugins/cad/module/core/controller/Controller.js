import * as __WEBPACK_EXTERNAL_MODULE_mitt__ from "mitt";
import * as __WEBPACK_EXTERNAL_MODULE__common_interface_js_c10b0d9b__ from "../common/interface.js";
import * as __WEBPACK_EXTERNAL_MODULE__tool_ToolStack_js_5941f2b1__ from "../tool/ToolStack.js";
class Controller {
    start(...args) {
        this.initialize(...args);
        if (this.defaultTool) {
            this.toolStack.defaultTool = this.defaultTool;
            this.defaultTool.start(this, __WEBPACK_EXTERNAL_MODULE__common_interface_js_c10b0d9b__.StartMode.none);
        }
    }
    exit() {
        this.terminate();
        this.toolStack.clear();
    }
    on(type, handler) {
        this.emitter.on(type, handler);
    }
    off(type, handler) {
        this.emitter.off(type, handler);
    }
    getTool() {
        return this.toolStack.top || this.defaultTool;
    }
    eventDispatch(type, ...args) {
        const tool = this.getTool();
        if (!tool) return;
        tool.injectedMap[type]?.forEach((func)=>func(...args));
        tool[type]?.(...args);
    }
    constructor(){
        this.emitter = (0, __WEBPACK_EXTERNAL_MODULE_mitt__["default"])();
        this.toolStack = new __WEBPACK_EXTERNAL_MODULE__tool_ToolStack_js_5941f2b1__.ToolStack(this.emitter);
    }
}
export { Controller };
