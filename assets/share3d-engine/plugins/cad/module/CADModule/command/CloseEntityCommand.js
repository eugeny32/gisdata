import * as __WEBPACK_EXTERNAL_MODULE__core_Command_js_ab052390__ from "../../core/Command.js";
import * as __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__ from "../model/common/constant.js";
class CloseEntityCommand extends __WEBPACK_EXTERNAL_MODULE__core_Command_js_ab052390__.Command {
    constructor(viewManager){
        super(), this.viewManager = viewManager, this.entities = [], this.originClosedStates = new Map();
    }
    execute() {}
    undo() {
        this.entities.forEach((entity)=>{
            if (!this.originClosedStates.has(entity.id)) return;
            this.handleEntity(entity, this.originClosedStates.get(entity.id), false);
        });
        this.viewManager.updateEntities(this.entities, {
            updateGeometry: true
        });
    }
    redo() {
        this.entities.forEach((entity)=>{
            this.handleEntity(entity, true, false);
        });
        this.viewManager.updateEntities(this.entities, {
            updateGeometry: true
        });
    }
    canCommit() {
        return this.entities.length > 0;
    }
    addEntities(entities) {
        const updateEntities = [];
        entities.forEach((entity)=>{
            if (this.originClosedStates.has(entity.id)) return;
            if (this.handleEntity(entity, true, true)) updateEntities.push(entity);
        });
        this.entities.push(...updateEntities);
        this.viewManager.updateEntities(updateEntities, {
            updateGeometry: true
        });
    }
    handleEntity(entity, newState, isRecord = true) {
        if (entity.type === __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Polyline) {
            const currentEntity = entity;
            isRecord && this.originClosedStates.set(currentEntity.id, currentEntity.isClosed);
            currentEntity.isClosed = newState;
            return true;
        }
        return false;
    }
}
export { CloseEntityCommand };
