import * as __WEBPACK_EXTERNAL_MODULE__core_Command_js_ab052390__ from "../../core/Command.js";
class DeleteEntityCommand extends __WEBPACK_EXTERNAL_MODULE__core_Command_js_ab052390__.Command {
    constructor(entities, viewManager){
        super();
        this.entities = entities;
        this.viewManager = viewManager;
    }
    execute() {
        this.viewManager.deleteEntities(this.entities);
    }
    undo() {
        this.viewManager.addEntities(this.entities);
    }
}
export { DeleteEntityCommand };
