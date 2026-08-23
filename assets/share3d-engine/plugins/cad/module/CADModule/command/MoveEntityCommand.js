import * as __WEBPACK_EXTERNAL_MODULE__edit_EntityEditHandler_js_0e936aab__ from "../edit/EntityEditHandler.js";
import * as __WEBPACK_EXTERNAL_MODULE__core_Command_js_ab052390__ from "../../core/Command.js";
class MoveEntityCommand extends __WEBPACK_EXTERNAL_MODULE__core_Command_js_ab052390__.Command {
    constructor(entities, params, viewManager){
        super();
        this.entities = entities;
        this.params = params;
        this.viewManager = viewManager;
    }
    execute() {
        __WEBPACK_EXTERNAL_MODULE__edit_EntityEditHandler_js_0e936aab__.EntityEditHandler.move(this.entities, this.params);
        this.viewManager.updateEntities(this.entities, {
            updateGeometry: true
        });
    }
    undo() {
        const reverseTranslate = {
            x: -this.params.translate.x,
            y: -this.params.translate.y
        };
        __WEBPACK_EXTERNAL_MODULE__edit_EntityEditHandler_js_0e936aab__.EntityEditHandler.move(this.entities, {
            translate: reverseTranslate
        });
        this.viewManager.updateEntities(this.entities, {
            updateGeometry: true
        });
    }
}
export { MoveEntityCommand };
