import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__ from "../model/common/constant.js";
import * as __WEBPACK_EXTERNAL_MODULE__object_material_MaterialManager_js_e243677c__ from "../object/material/MaterialManager.js";
import * as __WEBPACK_EXTERNAL_MODULE__object_objectManager_AngularDimensionObjectManager_js_26a448a5__ from "../object/objectManager/AngularDimensionObjectManager.js";
import * as __WEBPACK_EXTERNAL_MODULE__object_objectManager_ArcObjectManager_js_07c98e7d__ from "../object/objectManager/ArcObjectManager.js";
import * as __WEBPACK_EXTERNAL_MODULE__object_objectManager_CircleObjectManager_js_863f9650__ from "../object/objectManager/CircleObjectManager.js";
import * as __WEBPACK_EXTERNAL_MODULE__object_objectManager_DimensionObjectManager_js_c4b98e04__ from "../object/objectManager/DimensionObjectManager.js";
import * as __WEBPACK_EXTERNAL_MODULE__object_objectManager_EllipseObjectManager_js_2bff17cc__ from "../object/objectManager/EllipseObjectManager.js";
import * as __WEBPACK_EXTERNAL_MODULE__object_objectManager_HatchObjectManager_js_3a53fde0__ from "../object/objectManager/HatchObjectManager.js";
import * as __WEBPACK_EXTERNAL_MODULE__object_objectManager_MLeaderObjectManager_js_e0d987f7__ from "../object/objectManager/MLeaderObjectManager.js";
import * as __WEBPACK_EXTERNAL_MODULE__object_objectManager_PolylineObjectManager_js_3a297fb3__ from "../object/objectManager/PolylineObjectManager.js";
import * as __WEBPACK_EXTERNAL_MODULE__object_objectManager_RayObjectManager_js_1d7bc2cb__ from "../object/objectManager/RayObjectManager.js";
import * as __WEBPACK_EXTERNAL_MODULE__object_objectManager_SplineObjectManager_js_d55e8836__ from "../object/objectManager/SplineObjectManager.js";
import * as __WEBPACK_EXTERNAL_MODULE__object_objectManager_TextObjectManager_js_1a63b130__ from "../object/objectManager/TextObjectManager.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_cadDiagnostics_js_3245853d__ from "../utils/cadDiagnostics.js";
import * as __WEBPACK_EXTERNAL_MODULE__common_utils_js_15eda51d__ from "../../common/utils.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_e0d0aed1__ from "../../../../../shared/logging/index.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_e0d0aed1__.getLoggerManager)().getLogger('cad:diagnostics');
class ObjectManager {
    constructor(){
        this.sceneGroup = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
        this.entityObjectManagerMap = new Map();
        this.materialManager = new __WEBPACK_EXTERNAL_MODULE__object_material_MaterialManager_js_e243677c__.MaterialManager();
        const typeToManagerData = [
            {
                type: __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Polyline,
                manager: __WEBPACK_EXTERNAL_MODULE__object_objectManager_PolylineObjectManager_js_3a297fb3__.PolylineObjectManager
            },
            {
                type: __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Arc,
                manager: __WEBPACK_EXTERNAL_MODULE__object_objectManager_ArcObjectManager_js_07c98e7d__.ArcObjectManager
            },
            {
                type: __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Circle,
                manager: __WEBPACK_EXTERNAL_MODULE__object_objectManager_CircleObjectManager_js_863f9650__.CircleObjectManager
            },
            {
                type: __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Spline,
                manager: __WEBPACK_EXTERNAL_MODULE__object_objectManager_SplineObjectManager_js_d55e8836__.SplineObjectManager
            },
            {
                type: __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.MText,
                manager: __WEBPACK_EXTERNAL_MODULE__object_objectManager_TextObjectManager_js_1a63b130__.TextObjectManager
            },
            {
                type: __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.AlignDimension,
                manager: __WEBPACK_EXTERNAL_MODULE__object_objectManager_DimensionObjectManager_js_c4b98e04__.DimensionObjectManager
            },
            {
                type: __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Ellipse,
                manager: __WEBPACK_EXTERNAL_MODULE__object_objectManager_EllipseObjectManager_js_2bff17cc__.EllipseObjectManager
            },
            {
                type: __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Ray,
                manager: __WEBPACK_EXTERNAL_MODULE__object_objectManager_RayObjectManager_js_1d7bc2cb__.RayObjectManager
            },
            {
                type: __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Hatch,
                manager: __WEBPACK_EXTERNAL_MODULE__object_objectManager_HatchObjectManager_js_3a53fde0__.HatchObjectManager
            },
            {
                type: __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.MLeader,
                manager: __WEBPACK_EXTERNAL_MODULE__object_objectManager_MLeaderObjectManager_js_e0d987f7__.MLeaderObjectManager
            },
            {
                type: __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.AngularDimension,
                manager: __WEBPACK_EXTERNAL_MODULE__object_objectManager_AngularDimensionObjectManager_js_26a448a5__.AngularDimensionObjectManager
            }
        ];
        typeToManagerData.forEach(({ type, manager })=>{
            this.entityObjectManagerMap.set(type, new manager(this.sceneGroup, this.materialManager, type));
        });
    }
    dispose() {
        this.sceneGroup.clear();
        this.entityObjectManagerMap.forEach((manager)=>{
            manager.dispose();
        });
    }
    getSceneGroup() {
        return this.sceneGroup;
    }
    updateLineTypeDashScale(dashScale) {
        this.materialManager.updateLineTypeDashScale(dashScale);
    }
    updateGroupByPlane(plane) {
        const group = this.sceneGroup;
        (0, __WEBPACK_EXTERNAL_MODULE__common_utils_js_15eda51d__.updateGroupByPlane)(group, plane);
    }
    addEntity(entity) {
        const manager = this.entityObjectManagerMap.get(entity.type);
        manager?.addEntity(entity);
    }
    addEntities(entities) {
        const stats = (0, __WEBPACK_EXTERNAL_MODULE__utils_cadDiagnostics_js_3245853d__.collectCadEntityStats)(entities);
        const shouldLog = (0, __WEBPACK_EXTERNAL_MODULE__utils_cadDiagnostics_js_3245853d__.shouldLogCadEntityStats)(stats);
        const startedAt = shouldLog ? (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_e0d0aed1__.getLoggerManager)().now() : 0;
        if (shouldLog) log.info(`[CADObjectManager] addEntities started, ${(0, __WEBPACK_EXTERNAL_MODULE__utils_cadDiagnostics_js_3245853d__.formatCadEntityStats)(stats)}`);
        for (const entity of entities)this.addEntity(entity);
        if (shouldLog) log.info(`[CADObjectManager] addEntities completed, ${(0, __WEBPACK_EXTERNAL_MODULE__utils_cadDiagnostics_js_3245853d__.formatCadEntityStats)(stats)}, elapsed=${((0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_e0d0aed1__.getLoggerManager)().now() - startedAt).toFixed(1)}ms`);
    }
    deleteEntity(entity) {
        const manager = this.entityObjectManagerMap.get(entity.type);
        manager?.deleteEntity(entity);
    }
    deleteEntities(entities) {
        for (const entity of entities)this.deleteEntity(entity);
    }
    deleteAllEntities() {
        this.entityObjectManagerMap.forEach((manager)=>{
            manager.deleteAllEntities();
        });
    }
    updateEntity(entity, options) {
        const manager = this.entityObjectManagerMap.get(entity.type);
        manager?.updateEntity(entity, options);
    }
    updateEntities(entities, options) {
        for (const entity of entities)this.updateEntity(entity, options);
    }
    hoverEntity(entity) {
        const entities = Array.isArray(entity) ? entity : [
            entity
        ];
        entities.forEach((entity)=>{
            const manager = this.entityObjectManagerMap.get(entity.type);
            manager?.hover(entity);
        });
    }
    cancelHoverEntity(entity) {
        const entities = Array.isArray(entity) ? entity : [
            entity
        ];
        entities.forEach((entity)=>{
            const manager = this.entityObjectManagerMap.get(entity.type);
            manager?.cancelHover(entity);
        });
    }
    selectEntity(entity) {
        const entities = Array.isArray(entity) ? entity : [
            entity
        ];
        entities.forEach((entity)=>{
            const manager = this.entityObjectManagerMap.get(entity.type);
            manager?.select(entity);
        });
    }
    cancelSelectEntity(entity) {
        const entities = Array.isArray(entity) ? entity : [
            entity
        ];
        entities.forEach((entity)=>{
            const manager = this.entityObjectManagerMap.get(entity.type);
            manager?.cancelSelect(entity);
        });
    }
    getEntityObject(entity) {
        const manager = this.entityObjectManagerMap.get(entity.type);
        return manager?.getEntityObject(entity);
    }
    getMaterialManager() {
        return this.materialManager;
    }
    setEntityVisible(entity, visible) {
        const object = this.getEntityObject(entity);
        if (object) object.visible = visible;
    }
    setEntitiesVisible(entities, visible) {
        for (const entity of entities)this.setEntityVisible(entity, visible);
    }
}
export { ObjectManager };
