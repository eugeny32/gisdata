import * as __WEBPACK_EXTERNAL_MODULE__core_Command_js_ab052390__ from "../../core/Command.js";
class OffsetEntityCommand extends __WEBPACK_EXTERNAL_MODULE__core_Command_js_ab052390__.Command {
    constructor(viewManager){
        super(), this.viewManager = viewManager, this.createdEntities = [];
    }
    execute() {}
    undo() {
        this.viewManager.deleteEntities(this.createdEntities);
    }
    redo() {
        this.viewManager.addEntities(this.createdEntities);
    }
    canCommit() {
        return this.createdEntities.length > 0;
    }
    addEntity(entity) {
        this.createdEntities.push(entity);
        this.viewManager.addEntities([
            entity
        ]);
    }
}
export { OffsetEntityCommand };
