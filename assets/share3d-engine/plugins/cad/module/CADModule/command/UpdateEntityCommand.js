import * as __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__ from "lodash-es";
import * as __WEBPACK_EXTERNAL_MODULE__core_Command_js_ab052390__ from "../../core/Command.js";
class UpdateEntityCommand extends __WEBPACK_EXTERNAL_MODULE__core_Command_js_ab052390__.Command {
    constructor(entities, updateData, updateOptions = {
        updateGeometry: true,
        updateMaterial: false
    }, viewManager){
        super(), this.entities = entities, this.updateData = updateData, this.updateOptions = updateOptions, this.viewManager = viewManager, this.originalData = new Map();
    }
    execute() {
        this.entities.forEach((entity)=>{
            if (this.originalData.has(entity.id)) return;
            const original = {};
            for(const key in this.updateData){
                original[key] = (0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.cloneDeep)(entity[key]);
                entity[key] = (0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.cloneDeep)(this.updateData[key]);
            }
            this.originalData.set(entity.id, original);
        });
        this.viewManager.updateEntities(this.entities, this.updateOptions);
    }
    undo() {
        this.entities.forEach((entity)=>{
            const original = this.originalData.get(entity.id);
            if (!original) return;
            Object.assign(entity, (0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.cloneDeep)(original));
        });
        this.viewManager.updateEntities(this.entities, this.updateOptions);
    }
    redo() {
        this.entities.forEach((entity)=>{
            Object.assign(entity, (0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.cloneDeep)(this.updateData));
        });
        this.viewManager.updateEntities(this.entities, this.updateOptions);
    }
}
export { UpdateEntityCommand };
