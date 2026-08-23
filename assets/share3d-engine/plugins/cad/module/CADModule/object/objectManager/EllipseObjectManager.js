import * as __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_Addons_js_c109df0d__ from "three/examples/jsm/Addons.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_5dc4c073__ from "../../../utils/DrawUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__BaseObjectManager_js_cb8c9cc7__ from "./BaseObjectManager.js";
class EllipseObjectManager extends __WEBPACK_EXTERNAL_MODULE__BaseObjectManager_js_cb8c9cc7__.BaseObjectManager {
    createObject(entity) {
        const geometry = this.getCachedGeometry(entity);
        const material = this.getCachedMaterial(entity);
        const object = new __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_Addons_js_c109df0d__.Line2(geometry, material);
        object.position.set(entity.center.x, entity.center.y, 0);
        object.computeLineDistances();
        this.entityOriginalMaterialMap.set(entity.id, object.material);
        return object;
    }
    onUpdateGeometry(entity) {
        const object = this.objectMap.get(entity.id);
        if (!object) return;
        this.disposeGeometryFromObject(object);
        object.geometry = this.getCachedGeometry(entity);
        object.position.set(entity.center.x, entity.center.y, 0);
        object.computeLineDistances();
    }
    onUpdateMaterial(entity) {
        const object = this.objectMap.get(entity.id);
        if (!object) return;
        this.disposeMaterialFromObject(object);
        object.material = this.getCachedMaterial(entity);
        object.material.needsUpdate = true;
        this.entityOriginalMaterialMap.set(entity.id, object.material);
        this.updateEntityHighlight(entity);
    }
    disposeObject(object) {
        this.disposeGeometryFromObject(object);
        this.disposeMaterialFromObject(object);
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
    getCachedGeometryKey(entity) {
        return `${entity.majorAxisEndPoint.x}_${entity.majorAxisEndPoint.y}_${entity.axisRatio}_${entity.startAngle}_${entity.endAngle}_${entity.clockwise}`;
    }
    getCachedGeometry(entity) {
        const key = this.getCachedGeometryKey(entity);
        if (!this.cachedGeometryMap.has(key)) {
            const geometry = this.createGeometry(entity);
            geometry.userData = {
                cacheKey: key
            };
            this.cachedGeometryMap.set(key, geometry);
            geometry.computeBoundingBox();
            geometry.computeBoundingSphere();
        }
        if (!this.usedCacheGeometryEntityMap.has(key)) this.usedCacheGeometryEntityMap.set(key, new Set());
        this.usedCacheGeometryEntityMap.get(key).add(entity.id);
        return this.cachedGeometryMap.get(key);
    }
    disposeGeometryFromObject(object) {
        const geometry = object.geometry;
        const cacheKey = geometry.userData.cacheKey;
        const entity = object.userData.entity;
        const usedSet = this.usedCacheGeometryEntityMap.get(cacheKey);
        usedSet?.delete(entity.id);
        if (usedSet && 0 === usedSet.size) {
            this.cachedGeometryMap.delete(cacheKey);
            this.usedCacheGeometryEntityMap.delete(cacheKey);
            geometry.dispose();
        }
    }
    createGeometry(entity) {
        const { radiusX, radiusY, startAngle, endAngle, clockwise, rotation } = entity;
        const points = __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_5dc4c073__.DrawUtils.getEllipsePoints({
            center: {
                x: 0,
                y: 0
            },
            radiusX,
            radiusY,
            startAngle,
            endAngle,
            clockwise,
            rotation
        });
        return __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_5dc4c073__.DrawUtils.getLineGeometryByPoints(points);
    }
    constructor(...args){
        super(...args), this.cachedGeometryMap = new Map(), this.usedCacheGeometryEntityMap = new Map(), this.entityOriginalMaterialMap = new Map();
    }
}
export { EllipseObjectManager };
