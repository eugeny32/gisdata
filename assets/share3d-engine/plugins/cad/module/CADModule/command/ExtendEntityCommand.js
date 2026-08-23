import * as __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__ from "lodash-es";
import * as __WEBPACK_EXTERNAL_MODULE__core_Command_js_ab052390__ from "../../core/Command.js";
import * as __WEBPACK_EXTERNAL_MODULE__edit_EntityEditHandler_js_0e936aab__ from "../edit/EntityEditHandler.js";
import * as __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__ from "../model/common/constant.js";
class ExtendEntityCommand extends __WEBPACK_EXTERNAL_MODULE__core_Command_js_ab052390__.Command {
    constructor(viewManager){
        super(), this.viewManager = viewManager, this.data = [];
    }
    execute() {}
    undo() {
        const entities = [];
        for (const { entity, originData } of this.data){
            Object.assign(entity, (0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.cloneDeep)(originData));
            entities.push(entity);
        }
        this.viewManager.updateEntities(entities, {
            updateGeometry: true
        });
    }
    redo() {
        for (const { entity, params } of this.data)if (params) {
            __WEBPACK_EXTERNAL_MODULE__edit_EntityEditHandler_js_0e936aab__.EntityEditHandler.extend(entity, params);
            this.viewManager.updateEntity(entity, {
                updateGeometry: true
            });
        }
    }
    undoStep() {
        if (!this.canUndoStep()) return;
        const { entity, originData } = this.data.pop();
        Object.assign(entity, (0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.cloneDeep)(originData));
        this.viewManager.updateEntity(entity, {
            updateGeometry: true
        });
    }
    canUndoStep() {
        return this.data.length > 0;
    }
    canCommit() {
        return this.data.length > 0;
    }
    addEntity(entity, params) {
        const originData = this.getOriginalEntityData(entity);
        if (!originData) return;
        this.data.push({
            entity,
            originData,
            params
        });
        __WEBPACK_EXTERNAL_MODULE__edit_EntityEditHandler_js_0e936aab__.EntityEditHandler.extend(entity, params);
        this.viewManager.updateEntity(entity, {
            updateGeometry: true
        });
    }
    getOriginalEntityData(entity) {
        let snapshot;
        switch(entity.type){
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Polyline:
                snapshot = {
                    vertices: (0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.cloneDeep)(entity.vertices)
                };
                break;
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Arc:
                {
                    const arc = entity;
                    snapshot = {
                        startAngle: arc.startAngle,
                        endAngle: arc.endAngle
                    };
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Ray:
                snapshot = {
                    startPoint: (0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.cloneDeep)(entity.startPoint)
                };
                break;
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Spline:
                {
                    const spline = entity;
                    snapshot = {
                        controlPoints: (0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.cloneDeep)(spline.controlPoints),
                        knots: (0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.cloneDeep)(spline.knots),
                        degree: spline.degree,
                        fitPoints: (0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.cloneDeep)(spline.fitPoints)
                    };
                    break;
                }
        }
        return snapshot;
    }
}
export { ExtendEntityCommand };
