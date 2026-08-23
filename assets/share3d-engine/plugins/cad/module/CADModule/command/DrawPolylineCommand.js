import * as __WEBPACK_EXTERNAL_MODULE__core_Command_js_ab052390__ from "../../core/Command.js";
class DrawPolylineCommand extends __WEBPACK_EXTERNAL_MODULE__core_Command_js_ab052390__.Command {
    constructor(entity, viewManager, onUpdateCanvas){
        super();
        this.entity = entity;
        this.viewManager = viewManager;
        this.onUpdateCanvas = onUpdateCanvas;
    }
    execute() {
        this.viewManager.addEntity(this.entity);
    }
    undo() {
        this.viewManager.deleteEntity(this.entity);
    }
    undoStep() {
        if (!this.canUndoStep()) return;
        this.entity.vertices.pop();
        this.onUpdateCanvas();
    }
    canUndoStep() {
        return this.entity.vertices.length > 1;
    }
    canCommit() {
        return this.entity.vertices.length > 1;
    }
    addPoint(point) {
        this.entity.vertices.push({
            x: point.x,
            y: point.y,
            bulge: point.bulge || 0
        });
    }
}
export { DrawPolylineCommand };
