import * as __WEBPACK_EXTERNAL_MODULE__core_Command_js_ab052390__ from "../../core/Command.js";
class DrawHatchCommand extends __WEBPACK_EXTERNAL_MODULE__core_Command_js_ab052390__.Command {
    constructor(viewManager){
        super(), this.viewManager = viewManager, this.entities = [];
    }
    execute() {}
    undo() {
        this.viewManager.deleteEntities(this.entities);
    }
    redo() {
        this.viewManager.addEntities(this.entities);
    }
    undoStep() {
        if (this.canUndoStep()) {
            const entity = this.entities.pop();
            this.viewManager.deleteEntity(entity);
        }
    }
    canUndoStep() {
        return this.entities.length > 0;
    }
    canCommit() {
        return this.entities.length > 0;
    }
    addEntity(entity) {
        this.entities.push(entity);
        this.viewManager.addEntity(entity);
    }
}
export { DrawHatchCommand };
