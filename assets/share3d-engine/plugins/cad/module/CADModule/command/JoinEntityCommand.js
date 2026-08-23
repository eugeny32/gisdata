import * as __WEBPACK_EXTERNAL_MODULE__core_Command_js_ab052390__ from "../../core/Command.js";
class JoinEntityCommand extends __WEBPACK_EXTERNAL_MODULE__core_Command_js_ab052390__.Command {
    constructor(addEntities, deleteEntities, viewManager){
        super(), this.addEntities = addEntities, this.deleteEntities = deleteEntities, this.viewManager = viewManager;
    }
    execute() {
        this.viewManager.addEntities(this.addEntities);
        this.viewManager.deleteEntities(this.deleteEntities);
    }
    undo() {
        this.viewManager.deleteEntities(this.addEntities);
        this.viewManager.addEntities(this.deleteEntities);
    }
}
export { JoinEntityCommand };
