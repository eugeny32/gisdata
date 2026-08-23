import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__material_MaterialUtils_js_8d969826__ from "../material/MaterialUtils.js";
var BaseObjectManager_rslib_entry_HighlightMode = /*#__PURE__*/ function(HighlightMode) {
    HighlightMode["Hover"] = "hover";
    HighlightMode["Select"] = "select";
    HighlightMode["None"] = "none";
    return HighlightMode;
}({});
class BaseObjectManager {
    constructor(parent, materialManager, entityType){
        this.objectMap = new Map();
        this.group = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
        this.hoverEntityIds = new Set();
        this.selectedEntityIds = new Set();
        this.hoverMaterialOption = {
            color: 0xffff00,
            depthTest: false,
            transparent: true,
            opacity: 0.8
        };
        this.selectMaterialOption = {
            color: 0x00ffff,
            depthTest: false,
            transparent: true,
            opacity: 0.8
        };
        this.materialManager = materialManager;
        this.group.userData.entityType = entityType;
        parent.add(this.group);
    }
    addEntity(entity) {
        const object = this.createObject(entity);
        object.userData.entity = entity;
        this.installLineTypeDashScaleUpdater(object);
        this.group.add(object);
        this.objectMap.set(entity.id, object);
        return object;
    }
    deleteEntity(entity) {
        const object = this.objectMap.get(entity.id);
        object?.parent?.remove(object);
        object && this.disposeObject(object);
        this.objectMap.delete(entity.id);
        this.hoverEntityIds.delete(entity.id);
        this.selectedEntityIds.delete(entity.id);
    }
    deleteAllEntities() {
        this.dispose();
    }
    updateEntity(entity, options = {
        updateGeometry: true,
        updateMaterial: false
    }) {
        if (options.updateGeometry) this.onUpdateGeometry(entity);
        if (options.updateMaterial) this.onUpdateMaterial(entity);
    }
    getEntityObject(entity) {
        return this.objectMap.get(entity.id);
    }
    getCachedMaterial(entity) {
        return this.materialManager.getCachedMaterial(entity);
    }
    disposeMaterialFromObject(object) {
        const material = object.material;
        const entity = object.userData.entity;
        if (material && entity) this.materialManager.disposeMaterialByEntity(material, entity);
    }
    hover(entity) {
        const entities = Array.isArray(entity) ? entity : [
            entity
        ];
        entities.forEach((entity)=>{
            if (this.selectedEntityIds.has(entity.id) || this.hoverEntityIds.has(entity.id)) return;
            this.hoverEntityIds.add(entity.id);
            this.handleEntityHighlight(entity, "hover");
        });
    }
    cancelHover(entity) {
        const entities = Array.isArray(entity) ? entity : [
            entity
        ];
        entities.forEach((entity)=>{
            this.hoverEntityIds.delete(entity.id);
            if (this.selectedEntityIds.has(entity.id)) return;
            this.handleEntityHighlight(entity, "none");
        });
    }
    select(entity) {
        const entities = Array.isArray(entity) ? entity : [
            entity
        ];
        entities.forEach((entity)=>{
            this.hoverEntityIds.delete(entity.id);
            if (this.selectedEntityIds.has(entity.id)) return;
            this.selectedEntityIds.add(entity.id);
            this.handleEntityHighlight(entity, "select");
        });
    }
    cancelSelect(entity) {
        const entities = Array.isArray(entity) ? entity : [
            entity
        ];
        entities.forEach((entity)=>{
            this.selectedEntityIds.delete(entity.id);
            if (this.hoverEntityIds.has(entity.id)) {
                this.handleEntityHighlight(entity, "hover");
                return;
            }
            this.handleEntityHighlight(entity, "none");
        });
    }
    getEntitySelectMode(entity) {
        if (this.selectedEntityIds.has(entity.id)) return "select";
        if (this.hoverEntityIds.has(entity.id)) return "hover";
        return "none";
    }
    updateEntityHighlight(entity) {
        const selectMode = this.getEntitySelectMode(entity);
        this.handleEntityHighlight(entity, selectMode);
    }
    installLineTypeDashScaleUpdater(object) {
        const lineObject = object;
        if (!lineObject.geometry || !lineObject.material?.isLineMaterial) return;
        const originalOnBeforeRender = object.onBeforeRender.bind(object);
        const referencePoint = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        const fallbackPoint = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        object.onBeforeRender = (renderer, scene, camera, geometry, material, group)=>{
            originalOnBeforeRender(renderer, scene, camera, geometry, material, group);
            const currentMaterial = object.material;
            if (!currentMaterial?.isLineMaterial || !currentMaterial.dashed) return;
            const currentGeometry = object.geometry;
            if (currentGeometry) {
                if (!currentGeometry.boundingSphere) currentGeometry.computeBoundingSphere();
                if (currentGeometry.boundingSphere) referencePoint.copy(currentGeometry.boundingSphere.center).applyMatrix4(object.matrixWorld);
                else object.getWorldPosition(referencePoint);
            } else object.getWorldPosition(referencePoint);
            if (!Number.isFinite(referencePoint.x) || !Number.isFinite(referencePoint.y) || !Number.isFinite(referencePoint.z)) {
                object.getWorldPosition(fallbackPoint);
                referencePoint.copy(fallbackPoint);
            }
            const dashScale = __WEBPACK_EXTERNAL_MODULE__material_MaterialUtils_js_8d969826__.MaterialUtils.getLineTypeDashScaleByCamera(camera, renderer, void 0, referencePoint);
            if (void 0 !== dashScale) __WEBPACK_EXTERNAL_MODULE__material_MaterialUtils_js_8d969826__.MaterialUtils.updateLineTypeDashScale(currentMaterial, dashScale);
        };
    }
    dispose() {
        this.group.clear();
        this.objectMap.forEach((object)=>{
            this.disposeObject(object);
        });
        this.objectMap.clear();
        this.hoverEntityIds.clear();
        this.selectedEntityIds.clear();
        this.materialManager.dispose();
    }
}
export { BaseObjectManager, BaseObjectManager_rslib_entry_HighlightMode as HighlightMode };
