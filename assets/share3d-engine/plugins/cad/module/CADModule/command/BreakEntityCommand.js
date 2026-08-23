import * as __WEBPACK_EXTERNAL_MODULE__core_Command_js_ab052390__ from "../../core/Command.js";
class BreakEntityCommand extends __WEBPACK_EXTERNAL_MODULE__core_Command_js_ab052390__.Command {
    constructor(originalEntities, createdEntities, viewManager){
        super(), this.originalEntities = originalEntities, this.createdEntities = createdEntities, this.viewManager = viewManager;
    }
    execute() {
        this.viewManager.addEntities(this.createdEntities);
        this.viewManager.deleteEntities(this.originalEntities);
    }
    undo() {
        this.viewManager.deleteEntities(this.createdEntities);
        this.viewManager.addEntities(this.originalEntities);
    }
    redo() {
        this.execute();
    }
}
export { BreakEntityCommand };
