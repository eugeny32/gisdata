import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__ from "../../model/common/constant.js";
import * as __WEBPACK_EXTERNAL_MODULE__model_entity_HatchEntity_js_b6a280fb__ from "../../model/entity/HatchEntity.js";
import * as __WEBPACK_EXTERNAL_MODULE__BaseObjectManager_js_cb8c9cc7__ from "./BaseObjectManager.js";
function buildShapeFromLoops(entity) {
    const loopKeys = Object.keys(entity.loops);
    if (0 === loopKeys.length) return null;
    const outerEntities = entity.loops[loopKeys[0]];
    const outerPoints = extractPoints(outerEntities);
    if (outerPoints.length < 2) return null;
    const shape = new __WEBPACK_EXTERNAL_MODULE_three__.Shape(outerPoints);
    const holeKeys = Object.keys(entity.holes);
    for (const key of holeKeys){
        const holeEntities = entity.holes[key];
        const holePts = extractPoints(holeEntities);
        if (holePts.length >= 2) {
            const path = new __WEBPACK_EXTERNAL_MODULE_three__.Path(holePts);
            shape.holes.push(path);
        }
    }
    return shape;
}
function extractPoints(entities) {
    const pts = [];
    for (const ent of entities)if (void 0 !== ent.x && void 0 !== ent.y) pts.push(new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(ent.x, ent.y));
    else if (ent.startPoint) pts.push(new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(ent.startPoint.x, ent.startPoint.y));
    return pts;
}
class HatchObjectManager extends __WEBPACK_EXTERNAL_MODULE__BaseObjectManager_js_cb8c9cc7__.BaseObjectManager {
    constructor(parent, materialManager){
        super(parent, materialManager, __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Hatch);
    }
    createObject(entity) {
        const geometry = this.buildGeometry(entity);
        const material = this.buildMaterial(entity);
        const mesh = new __WEBPACK_EXTERNAL_MODULE_three__.Mesh(geometry, material);
        mesh.userData.entity = entity;
        return mesh;
    }
    buildGeometry(entity) {
        const shape = buildShapeFromLoops(entity);
        if (!shape) return new __WEBPACK_EXTERNAL_MODULE_three__.BufferGeometry();
        return new __WEBPACK_EXTERNAL_MODULE_three__.ShapeGeometry(shape);
    }
    buildMaterial(entity) {
        const cached = this.getCachedMaterial(entity);
        if (cached) return cached;
        return this.createMaterialForEntity(entity);
    }
    createMaterialForEntity(entity) {
        if (entity.fillType === __WEBPACK_EXTERNAL_MODULE__model_entity_HatchEntity_js_b6a280fb__.FillType.Gradient) return new __WEBPACK_EXTERNAL_MODULE_three__.MeshBasicMaterial({
            color: entity.gcolor1 ?? 0xffffff,
            side: __WEBPACK_EXTERNAL_MODULE_three__.DoubleSide,
            transparent: true,
            opacity: 0.8
        });
        return new __WEBPACK_EXTERNAL_MODULE_three__.MeshBasicMaterial({
            color: entity.color,
            side: __WEBPACK_EXTERNAL_MODULE_three__.DoubleSide,
            transparent: true,
            opacity: 0.8
        });
    }
    onUpdateGeometry(entity) {
        const mesh = this.objectMap.get(entity.id);
        if (!mesh) return;
        mesh.geometry.dispose();
        mesh.geometry = this.buildGeometry(entity);
    }
    onUpdateMaterial(entity) {
        const mesh = this.objectMap.get(entity.id);
        if (!mesh) return;
        mesh.material.dispose();
        mesh.material = this.createMaterialForEntity(entity);
    }
    handleEntityHighlight(entity, mode) {
        const mesh = this.objectMap.get(entity.id);
        if (!mesh) return;
        switch(mode){
            case __WEBPACK_EXTERNAL_MODULE__BaseObjectManager_js_cb8c9cc7__.HighlightMode.Hover:
                mesh.material.color.setHex(this.hoverMaterialOption.color);
                break;
            case __WEBPACK_EXTERNAL_MODULE__BaseObjectManager_js_cb8c9cc7__.HighlightMode.Select:
                mesh.material.color.setHex(this.selectMaterialOption.color);
                break;
            default:
                mesh.material.color.setHex(entity.color);
                break;
        }
    }
    disposeObject(object) {
        object.geometry.dispose();
        this.disposeMaterialFromObject(object);
    }
}
export { HatchObjectManager };
