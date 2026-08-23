import * as __WEBPACK_EXTERNAL_MODULE__core_Command_js_ab052390__ from "../../core/Command.js";
import * as __WEBPACK_EXTERNAL_MODULE__edit_EntityEditHandler_js_0e936aab__ from "../edit/EntityEditHandler.js";
class RotateEntityCommand extends __WEBPACK_EXTERNAL_MODULE__core_Command_js_ab052390__.Command {
    constructor(entities, params, viewManager){
        super();
        this.entities = entities;
        this.params = params;
        this.viewManager = viewManager;
    }
    execute() {
        __WEBPACK_EXTERNAL_MODULE__edit_EntityEditHandler_js_0e936aab__.EntityEditHandler.rotate(this.entities, this.params);
        this.viewManager.updateEntities(this.entities, {
            updateGeometry: true
        });
    }
    undo() {
        __WEBPACK_EXTERNAL_MODULE__edit_EntityEditHandler_js_0e936aab__.EntityEditHandler.rotate(this.entities, {
            center: this.params.center,
            angle: -this.params.angle
        });
        this.viewManager.updateEntities(this.entities, {
            updateGeometry: true
        });
    }
}
export { RotateEntityCommand };
