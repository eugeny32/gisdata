import * as __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_Addons_js_c109df0d__ from "three/examples/jsm/Addons.js";
import * as __WEBPACK_EXTERNAL_MODULE__entityObject_entityObjectUtils_js_415ef2f4__ from "../entityObject/entityObjectUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_5dc4c073__ from "../../../utils/DrawUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__BaseObjectManager_js_cb8c9cc7__ from "./BaseObjectManager.js";
class PolylineObjectManager extends __WEBPACK_EXTERNAL_MODULE__BaseObjectManager_js_cb8c9cc7__.BaseObjectManager {
    createObject(entity) {
        const geometry = this.createGeometry(entity);
        const material = this.getCachedMaterial(entity);
        const object = new __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_Addons_js_c109df0d__.Line2(geometry, material);
        object.computeLineDistances();
        object.geometry.computeBoundingBox();
        object.geometry.computeBoundingSphere();
        this.entityOriginalMaterialMap.set(entity.id, object.material);
        return object;
    }
    onUpdateGeometry(entity) {
        const object = this.objectMap.get(entity.id);
        if (!object) return;
        object.geometry.dispose();
        object.geometry = this.createGeometry(entity);
        object.computeLineDistances();
        object.geometry.computeBoundingBox();
        object.geometry.computeBoundingSphere();
    }
    onUpdateMaterial(entity) {
        const object = this.objectMap.get(entity.id);
        if (!object) return;
        this.disposeMaterialFromObject(object);
        const material = this.getCachedMaterial(entity);
        object.material = material;
        material.needsUpdate = true;
        this.entityOriginalMaterialMap.set(entity.id, object.material);
        this.updateEntityHighlight(entity);
    }
    disposeObject(object) {
        object.geometry?.dispose?.();
        this.entityOriginalMaterialMap.delete(object.userData.entity.id);
    }
    handleEntityHighlight(entity, mode) {
        const object = this.objectMap.get(entity.id);
        if (!object) return;
        if (mode === __WEBPACK_EXTERNAL_MODULE__BaseObjectManager_js_cb8c9cc7__.HighlightMode.None) {
            object.material = this.entityOriginalMaterialMap.get(entity.id);
            object.material.needsUpdate = true;
            object.computeLineDistances();
        } else {
            const material = mode === __WEBPACK_EXTERNAL_MODULE__BaseObjectManager_js_cb8c9cc7__.HighlightMode.Hover ? this.materialManager.getCachedHoverMaterial(entity) : this.materialManager.getCachedSelectMaterial(entity);
            object.material = material;
            object.material.needsUpdate = true;
            object.computeLineDistances();
        }
    }
    createGeometry(entity) {
        const points = __WEBPACK_EXTERNAL_MODULE__entityObject_entityObjectUtils_js_415ef2f4__.EntityObjectUtils.getPolylineSamplePoints(entity);
        return __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_5dc4c073__.DrawUtils.getLineGeometryByPoints(points);
    }
    constructor(...args){
        super(...args), this.entityOriginalMaterialMap = new Map();
    }
}
export { PolylineObjectManager };
