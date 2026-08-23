import * as __WEBPACK_EXTERNAL_MODULE__core_Command_js_ab052390__ from "../../core/Command.js";
class TrimEntityCommand extends __WEBPACK_EXTERNAL_MODULE__core_Command_js_ab052390__.Command {
    constructor(viewManager){
        super(), this.viewManager = viewManager, this.data = [];
    }
    execute() {}
    undo() {
        const { original, created } = this.data.reduce((acc, item)=>{
            acc.original.push(...item.original);
            acc.created.push(...item.created);
            return acc;
        }, {
            original: [],
            created: []
        });
        this.viewManager.deleteEntities(created);
        this.viewManager.addEntities(original);
    }
    redo() {
        const { original, created } = this.data.reduce((acc, item)=>{
            acc.original.push(...item.original);
            acc.created.push(...item.created);
            return acc;
        }, {
            original: [],
            created: []
        });
        this.viewManager.deleteEntities(original);
        this.viewManager.addEntities(created);
    }
    undoStep() {
        if (!this.canUndoStep()) return;
        const { original, created } = this.data.pop();
        this.viewManager.deleteEntities(created);
        this.viewManager.addEntities(original);
    }
    canUndoStep() {
        return this.data.length > 0;
    }
    canCommit() {
        return this.data.length > 0;
    }
    addEntity(original, created) {
        this.data.push({
            original: original,
            created
        });
        this.viewManager.deleteEntities(original);
        this.viewManager.addEntities(created);
    }
}
export { TrimEntityCommand };
