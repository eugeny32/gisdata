import * as __WEBPACK_EXTERNAL_MODULE_inversify__ from "inversify";
import * as __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__ from "lodash-es";
import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__renderInvalidation_js_14124a91__ from "../renderInvalidation.js";
import * as __WEBPACK_EXTERNAL_MODULE__common_utils_js_15eda51d__ from "../../common/utils.js";
import * as __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__ from "../../container/types.js";
import * as __WEBPACK_EXTERNAL_MODULE__DataManager_js_c60702d7__ from "./DataManager.js";
import * as __WEBPACK_EXTERNAL_MODULE__ObjectManager_js_89ab748f__ from "./ObjectManager.js";
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
}
class CADViewManager {
    get dataManager() {
        return this._dataManager;
    }
    get objectManager() {
        return this._objectManager;
    }
    get planeHelper() {
        return this._planeHelper;
    }
    get tempGroup() {
        return this._tempGroup;
    }
    set(dataManager, objectManager) {
        this._dataManager = dataManager;
        this._objectManager = objectManager;
        const { origin, normal } = this.dataManager.plane;
        this.planeHelper.setFromNormalAndCoplanarPoint(normal, origin);
        this.updateTempGroupByPlane(this.dataManager.plane);
    }
    getObjectGroup() {
        return this.objectManager.getSceneGroup();
    }
    mountTempGroup(parent) {
        if (this._tempGroup.parent !== parent) {
            parent.add(this._tempGroup);
            this.renderInvalidator.invalidate('cad.tempGroup.mounted');
        }
    }
    unmountTempGroup() {
        if (this._tempGroup.parent) {
            this._tempGroup.removeFromParent();
            this.renderInvalidator.invalidate('cad.tempGroup.unmounted');
        }
    }
    clearTempObjects() {
        if (0 === this._tempGroup.children.length) return;
        this._tempGroup.clear();
        this.renderInvalidator.invalidate('cad.tempGroup.cleared');
    }
    attachTempObject(object) {
        this.patchTempObjectMutation(object);
        this._tempGroup.add(object);
        this.renderInvalidator.invalidate('cad.tempObject.attached');
    }
    updateTempGroupByPlane(plane) {
        (0, __WEBPACK_EXTERNAL_MODULE__common_utils_js_15eda51d__.updateGroupByPlane)(this._tempGroup, plane);
        this.renderInvalidator.invalidate('cad.tempGroup.transform');
    }
    patchTempObjectMutation(object) {
        if (this.patchedTempObjects.has(object)) return;
        this.patchedTempObjects.add(object);
        const invalidate = (reason)=>this.renderInvalidator.invalidate(reason);
        const originalAdd = object.add.bind(object);
        const originalRemove = object.remove.bind(object);
        const originalClear = object.clear.bind(object);
        object.add = (...children)=>{
            const before = object.children.length;
            const result = originalAdd(...children);
            if (object.children.length !== before) invalidate('cad.tempObject.childrenChanged');
            return result;
        };
        object.remove = (...children)=>{
            const before = object.children.length;
            const result = originalRemove(...children);
            if (object.children.length !== before) invalidate('cad.tempObject.childrenChanged');
            return result;
        };
        object.clear = ()=>{
            if (0 === object.children.length) return originalClear();
            const result = originalClear();
            invalidate('cad.tempObject.childrenChanged');
            return result;
        };
    }
    addLayer(layer) {
        this.dataManager.addLayer(layer);
    }
    addLayers(layers) {
        for (const layer of layers)this.dataManager.addLayer(layer);
    }
    deleteLayer(id) {
        this.dataManager.deleteLayer(id);
    }
    updateLayer(layer) {
        this.dataManager.updateLayer(layer);
    }
    addEntity(entity) {
        this.dataManager.addEntity(entity);
        this.objectManager.addEntity(entity);
    }
    addEntities(entities) {
        this.dataManager.addEntities(entities);
        this.objectManager.addEntities(entities);
    }
    deleteEntity(entity) {
        this.dataManager.deleteEntity(entity);
        this.objectManager.deleteEntity(entity);
    }
    deleteEntities(entities) {
        this.dataManager.deleteEntities(entities);
        this.objectManager.deleteEntities(entities);
    }
    deleteAllEntities() {
        this.dataManager.deleteAllEntities();
        this.objectManager.deleteAllEntities();
    }
    updateEntity(entity, options) {
        this.dataManager.updateEntity(entity);
        this.objectManager.updateEntity(entity, options);
    }
    updateEntities(entities, options) {
        this.dataManager.updateEntities(entities);
        this.objectManager.updateEntities(entities, options);
    }
    getEntity(id) {
        return this.dataManager.getEntity(id);
    }
    hoverEntity(entity) {
        this.objectManager.hoverEntity(entity);
    }
    cancelHoverEntity(entity) {
        this.objectManager.cancelHoverEntity(entity);
    }
    selectEntity(entity) {
        this.objectManager.selectEntity(entity);
    }
    cancelSelectEntity(entity) {
        this.objectManager.cancelSelectEntity(entity);
    }
    getEntityObject(entity) {
        return this.objectManager.getEntityObject(entity);
    }
    getVisibleEntities() {
        return this.dataManager.entities;
    }
    getEntitiesByLayerId(layerId) {
        return this.dataManager.entities.filter((e)=>e.layerId === layerId);
    }
    getEntityDefaultData(initData) {
        return {
            ...(0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.omitBy)((0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.pick)(initData ?? {}, [
                'colorMethod',
                'color',
                'lineType',
                'lineWidth'
            ]), __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.isNil),
            layerId: initData?.layerId || __WEBPACK_EXTERNAL_MODULE__DataManager_js_c60702d7__.DefaultLayerId
        };
    }
    constructor(){
        this.renderInvalidator = __WEBPACK_EXTERNAL_MODULE__renderInvalidation_js_14124a91__.NOOP_CAD_RENDER_INVALIDATOR;
        this._dataManager = new __WEBPACK_EXTERNAL_MODULE__DataManager_js_c60702d7__.DataManager();
        this._objectManager = new __WEBPACK_EXTERNAL_MODULE__ObjectManager_js_89ab748f__.ObjectManager();
        this._planeHelper = new __WEBPACK_EXTERNAL_MODULE_three__.Plane(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 1), 0);
        this._tempGroup = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
        this.patchedTempObjects = new WeakSet();
    }
}
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.RenderInvalidator),
    _ts_metadata("design:type", "undefined" == typeof CadRenderInvalidator ? Object : CadRenderInvalidator)
], CADViewManager.prototype, "renderInvalidator", void 0);
CADViewManager = _ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.injectable)()
], CADViewManager);
export { CADViewManager };
