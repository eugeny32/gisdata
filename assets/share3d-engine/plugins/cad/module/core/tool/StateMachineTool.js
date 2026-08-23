import * as __WEBPACK_EXTERNAL_MODULE_xstate__ from "xstate";
import * as __WEBPACK_EXTERNAL_MODULE__BaseTool_js_0e9c6f91__ from "./BaseTool.js";
class StateMachineTool extends __WEBPACK_EXTERNAL_MODULE__BaseTool_js_0e9c6f91__.BaseTool {
    initialize(...args) {
        if (this.actor) return;
        this.actor = (0, __WEBPACK_EXTERNAL_MODULE_xstate__.createActor)(this.machine);
        this.actor.start();
        this.onInitialize(...args);
    }
    terminate() {
        this.onTerminate();
        this.actor?.stop();
        this.actor = null;
    }
    send(event) {
        if (!this.actor) return;
        this.actor.send(event);
    }
    checkState(stateName) {
        return this.actor?.getSnapshot().matches(stateName) ?? false;
    }
    constructor(...args){
        super(...args), this.actor = null;
    }
}
export { StateMachineTool };
