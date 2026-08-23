import * as __WEBPACK_EXTERNAL_MODULE__core_Command_js_ab052390__ from "../../core/Command.js";
class AddEntityCommand extends __WEBPACK_EXTERNAL_MODULE__core_Command_js_ab052390__.Command {
    constructor(entities, viewManager){
        super(), this.entities = entities, this.viewManager = viewManager;
    }
    execute() {
        this.viewManager.addEntities(this.entities);
    }
    undo() {
        this.viewManager.deleteEntities(this.entities);
    }
}
export { AddEntityCommand };
