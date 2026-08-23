import * as __WEBPACK_EXTERNAL_MODULE_inversify__ from "inversify";
import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__common_utils_js_15eda51d__ from "../../common/utils.js";
import * as __WEBPACK_EXTERNAL_MODULE__common_view_js_fb21ae28__ from "../../common/view.js";
import * as __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__ from "../../container/types.js";
import * as __WEBPACK_EXTERNAL_MODULE__core_selector_Detector_js_13fab7d5__ from "../../core/selector/Detector.js";
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
}
class EntityDetector extends __WEBPACK_EXTERNAL_MODULE__core_selector_Detector_js_13fab7d5__.Detector {
    config(option) {
        if (false === option.enableHighlight) this.clearPreselect();
        super.config(option);
    }
    detect(mousePosition) {
        const camera = this.ctx.getService('ViewportCamera').getActiveCamera();
        const activeView = (0, __WEBPACK_EXTERNAL_MODULE__common_view_js_fb21ae28__.getActiveView)(this.ctx);
        const mouse = (0, __WEBPACK_EXTERNAL_MODULE__common_view_js_fb21ae28__.screenToActiveViewNDC)(this.ctx, mousePosition);
        const viewportElement = (0, __WEBPACK_EXTERNAL_MODULE__common_view_js_fb21ae28__.getActiveViewSize)(this.ctx);
        this.raycaster.setFromCamera(mouse, camera);
        this.applyRaycasterLayerMask(activeView?.layerMask);
        const threshold = (0, __WEBPACK_EXTERNAL_MODULE__common_utils_js_15eda51d__.getPixelSizeInWorld)(camera, viewportElement, this.detectThreshold);
        const line2Threshold = 0.5 * this.detectThreshold;
        this.raycaster.params.Line.threshold = threshold;
        if (this.raycaster.params.Line2) this.raycaster.params.Line2.threshold = line2Threshold;
        else this.raycaster.params.Line2 = {
            threshold: line2Threshold
        };
        const objectGroup = this.viewManager.getObjectGroup();
        if (!objectGroup) return [];
        const intersectableObjects = [];
        objectGroup.traverse((child)=>{
            if (child instanceof __WEBPACK_EXTERNAL_MODULE_three__.Line || child instanceof __WEBPACK_EXTERNAL_MODULE_three__.LineSegments || child instanceof __WEBPACK_EXTERNAL_MODULE_three__.Mesh) {
                const entity = child.userData.entity;
                if (!entity) return;
                const isLayerVisible = this.viewManager.dataManager.getLayer(entity.layerId)?.visible ?? true;
                if (this.isObjectVisible(child) && isLayerVisible) intersectableObjects.push(child);
            }
        });
        const intersects = this.raycaster.intersectObjects(intersectableObjects, false);
        return this.extractEntities(intersects);
    }
    detectWithHit(ndc, options) {
        const camera = options?.camera ?? this.ctx.getService('ViewportCamera').getActiveCamera();
        const viewport = options?.viewport ? {
            clientWidth: Math.max(1, Math.round(options.viewport.width)),
            clientHeight: Math.max(1, Math.round(options.viewport.height))
        } : (0, __WEBPACK_EXTERNAL_MODULE__common_view_js_fb21ae28__.getActiveViewSize)(this.ctx);
        this.raycaster.setFromCamera(new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(ndc.x, ndc.y), camera);
        this.applyRaycasterLayerMask(options?.layerMask);
        const threshold = (0, __WEBPACK_EXTERNAL_MODULE__common_utils_js_15eda51d__.getPixelSizeInWorld)(camera, viewport, this.detectThreshold);
        const line2Threshold = 0.5 * this.detectThreshold;
        this.raycaster.params.Line.threshold = threshold;
        if (this.raycaster.params.Line2) this.raycaster.params.Line2.threshold = line2Threshold;
        else this.raycaster.params.Line2 = {
            threshold: line2Threshold
        };
        const objectGroup = this.viewManager.getObjectGroup();
        if (!objectGroup) return [];
        const intersectableObjects = [];
        objectGroup.traverse((child)=>{
            if (child instanceof __WEBPACK_EXTERNAL_MODULE_three__.Line || child instanceof __WEBPACK_EXTERNAL_MODULE_three__.LineSegments || child instanceof __WEBPACK_EXTERNAL_MODULE_three__.Mesh) {
                if (child.userData.entity && this.isObjectVisible(child)) intersectableObjects.push(child);
            }
        });
        const intersects = this.raycaster.intersectObjects(intersectableObjects, false);
        const results = [];
        const entityIdSet = new Set();
        for (const intersect of intersects.sort((a, b)=>a.distance - b.distance)){
            const entity = intersect.object.userData?.entity;
            if (entity && !entityIdSet.has(entity.id)) {
                results.push({
                    id: entity.id,
                    point: intersect.point,
                    distance: intersect.distance
                });
                entityIdSet.add(entity.id);
            }
        }
        return results;
    }
    applyRaycasterLayerMask(layerMask) {
        if (void 0 === layerMask) {
            this.raycaster.layers.enableAll();
            return;
        }
        this.raycaster.layers.mask = layerMask;
    }
    extractEntities(intersects) {
        const detectedEntities = [];
        const entityIdSet = new Set();
        for (const intersect of intersects.sort((a, b)=>a.distance - b.distance)){
            const obj = intersect.object;
            let entity;
            if (obj.userData?.entity) entity = obj.userData.entity;
            if (entity && !entityIdSet.has(entity.id)) {
                detectedEntities.push(entity);
                entityIdSet.add(entity.id);
            }
        }
        return detectedEntities;
    }
    handleDetect(mousePosition) {
        const entities = super.handleDetect(mousePosition);
        this.handlePreselect(entities.slice(0, 1));
        return entities;
    }
    handlePreselect(entities) {
        if (!this.getEnableHighlight()) {
            this.clearPreselect();
            return;
        }
        this.preSelectEntity.forEach((entity)=>{
            if (!entities.includes(entity)) this.viewManager.cancelHoverEntity(entity);
        });
        entities.forEach((entity)=>{
            if (!this.preSelectEntity.has(entity)) this.viewManager.hoverEntity(entity);
        });
        this.preSelectEntity = new Set(entities);
    }
    clearPreselect() {
        this.preSelectEntity.forEach((entity)=>{
            this.viewManager.cancelHoverEntity(entity);
        });
        this.preSelectEntity.clear();
    }
    isObjectVisible(object) {
        let current = object;
        while(current){
            if (!current.visible) return false;
            current = current.parent;
        }
        return true;
    }
    constructor(...args){
        super(...args), this.raycaster = new __WEBPACK_EXTERNAL_MODULE_three__.Raycaster(), this.preSelectEntity = new Set(), this.detectThreshold = 10;
    }
}
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.CADViewManager),
    _ts_metadata("design:type", "undefined" == typeof CADViewManager ? Object : CADViewManager)
], EntityDetector.prototype, "viewManager", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.EngineContext),
    _ts_metadata("design:type", "undefined" == typeof EngineContext ? Object : EngineContext)
], EntityDetector.prototype, "ctx", void 0);
EntityDetector = _ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.injectable)()
], EntityDetector);
export { EntityDetector };
