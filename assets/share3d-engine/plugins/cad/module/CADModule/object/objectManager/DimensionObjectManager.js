import * as __WEBPACK_EXTERNAL_MODULE__entityObject_DimensionObject_js_0e0e4891__ from "../entityObject/DimensionObject.js";
import * as __WEBPACK_EXTERNAL_MODULE__BaseObjectManager_js_cb8c9cc7__ from "./BaseObjectManager.js";
class DimensionObjectManager extends __WEBPACK_EXTERNAL_MODULE__BaseObjectManager_js_cb8c9cc7__.BaseObjectManager {
    createObject(entity) {
        const material = this.getCachedMaterial(entity);
        const object = new __WEBPACK_EXTERNAL_MODULE__entityObject_DimensionObject_js_0e0e4891__.DimensionObject(entity, material);
        this.entityOriginalMaterialMap.set(entity.id, object.material);
        return object;
    }
    onUpdateGeometry(entity) {
        const object = this.objectMap.get(entity.id);
        if (!object) return;
        object.onUpdateGeometry();
    }
    onUpdateMaterial(entity) {
        const object = this.objectMap.get(entity.id);
        if (!object) return;
        this.disposeMaterialFromObject(object);
        object.onUpdateMaterial(this.getCachedMaterial(entity));
        this.entityOriginalMaterialMap.set(entity.id, object.material);
        this.updateEntityHighlight(entity);
    }
    disposeObject(object) {
        this.disposeMaterialFromObject(object);
        object.dispose();
        this.entityOriginalMaterialMap.delete(object.userData.entity.id);
    }
    handleEntityHighlight(entity, mode) {
        const object = this.objectMap.get(entity.id);
        if (!object) return;
        if (mode === __WEBPACK_EXTERNAL_MODULE__BaseObjectManager_js_cb8c9cc7__.HighlightMode.None) {
            const material = this.entityOriginalMaterialMap.get(entity.id);
            object.onUpdateMaterial(material);
        } else {
            const material = mode === __WEBPACK_EXTERNAL_MODULE__BaseObjectManager_js_cb8c9cc7__.HighlightMode.Hover ? this.materialManager.getCachedHoverMaterial(entity) : this.materialManager.getCachedSelectMaterial(entity);
            const color = material.color.getHex();
            object.onUpdateMaterial(material, color);
        }
    }
    constructor(...args){
        super(...args), this.entityOriginalMaterialMap = new Map();
    }
}
export { DimensionObjectManager };
