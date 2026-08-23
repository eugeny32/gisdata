import * as __WEBPACK_EXTERNAL_MODULE__core_Command_js_ab052390__ from "../../core/Command.js";
class DrawEntityCommand extends __WEBPACK_EXTERNAL_MODULE__core_Command_js_ab052390__.Command {
    constructor(entity, viewManager, handleUndoStep, isCanCommit, isCanUndoStep){
        super(), this.entity = entity, this.viewManager = viewManager, this.handleUndoStep = handleUndoStep, this.isCanCommit = isCanCommit, this.isCanUndoStep = isCanUndoStep;
    }
    execute() {
        this.viewManager.addEntity(this.entity);
    }
    undo() {
        this.viewManager.deleteEntity(this.entity);
    }
    undoStep() {
        this.handleUndoStep?.();
    }
    canUndoStep() {
        return this.isCanUndoStep ? this.isCanUndoStep() : false;
    }
    canCommit() {
        return this.isCanCommit ? this.isCanCommit() : true;
    }
}
export { DrawEntityCommand };
