import * as __WEBPACK_EXTERNAL_MODULE__edit_EntityEditHandler_js_0e936aab__ from "../edit/EntityEditHandler.js";
import * as __WEBPACK_EXTERNAL_MODULE__core_Command_js_ab052390__ from "../../core/Command.js";
class CopyEntityCommand extends __WEBPACK_EXTERNAL_MODULE__core_Command_js_ab052390__.Command {
    constructor(entities, params, viewManager){
        super(), this.copyEntities = [];
        this.entities = entities;
        this.params = params;
        this.viewManager = viewManager;
    }
    execute() {
        this.copyEntities = __WEBPACK_EXTERNAL_MODULE__edit_EntityEditHandler_js_0e936aab__.EntityEditHandler.copy(this.entities, this.params);
        this.viewManager.addEntities(this.copyEntities);
    }
    undo() {
        this.viewManager.deleteEntities(this.copyEntities);
    }
    redo() {
        this.viewManager.addEntities(this.copyEntities);
    }
}
export { CopyEntityCommand };
