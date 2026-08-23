import * as __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__ from "lodash-es";
import * as __WEBPACK_EXTERNAL_MODULE__core_Command_js_ab052390__ from "../../core/Command.js";
import * as __WEBPACK_EXTERNAL_MODULE__entityGripHandler_js_0d667d7c__ from "./entityGripHandler.js";
class UpdateEntityByGripCommand extends __WEBPACK_EXTERNAL_MODULE__core_Command_js_ab052390__.Command {
    constructor(entity, grip, targetPoint, originalData, viewManager){
        super(), this.entity = entity, this.grip = grip, this.targetPoint = targetPoint, this.originalData = originalData, this.viewManager = viewManager;
    }
    execute() {
        Object.assign(this.entity, (0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.cloneDeep)(this.originalData));
        __WEBPACK_EXTERNAL_MODULE__entityGripHandler_js_0d667d7c__.EntityGripHandler.applyGrip(this.entity, this.grip, this.targetPoint);
        this.viewManager.updateEntity(this.entity, {
            updateGeometry: true
        });
    }
    undo() {
        Object.assign(this.entity, (0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.cloneDeep)(this.originalData));
        this.viewManager.updateEntity(this.entity, {
            updateGeometry: true
        });
    }
}
export { UpdateEntityByGripCommand };
