import * as __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__ from "lodash-es";
import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__ from "../model/entity/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__model_layer_Layer_js_1b70f47c__ from "../model/layer/Layer.js";
const DefaultLayerId = 'default';
function createDefaultLayer() {
    const layer = new __WEBPACK_EXTERNAL_MODULE__model_layer_Layer_js_1b70f47c__.Layer({
        id: DefaultLayerId,
        name: '默认图层1'
    });
    return layer;
}
class DataManager {
    get layers() {
        return Array.from(this.layerMap.values());
    }
    get entities() {
        return Array.from(this.entitieMap.values());
    }
    get plane() {
        return this._plane;
    }
    reset() {
        this.layerMap.clear();
        this.entitieMap.clear();
    }
    serialize() {
        const layers = Array.from(this.layerMap.values()).map((layer)=>layer.serialize());
        const entities = Array.from(this.entitieMap.values()).map((entity)=>entity.serialize());
        return {
            layers,
            entities,
            plane: {
                origin: (0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.pick)(this.plane.origin, [
                    'x',
                    'y',
                    'z'
                ]),
                normal: (0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.pick)(this.plane.normal, [
                    'x',
                    'y',
                    'z'
                ]),
                up: (0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.pick)(this.plane.up, [
                    'x',
                    'y',
                    'z'
                ]),
                elevation: this.plane.elevation
            }
        };
    }
    static deserialize(data) {
        const dataManager = new DataManager();
        const { layers = [], entities = [], plane } = data || {};
        for (const layerData of layers){
            const layer = new __WEBPACK_EXTERNAL_MODULE__model_layer_Layer_js_1b70f47c__.Layer((0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.cloneDeep)(layerData));
            dataManager.addLayer(layer);
        }
        for (const entityData of entities){
            const entity = __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.EntityFactory.createEntity((0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.cloneDeep)(entityData));
            entity && dataManager.addEntity(entity);
        }
        if (plane) dataManager.updatePlane(plane);
        return dataManager;
    }
    addLayer(layer) {
        this.layerMap.set(layer.id, layer);
    }
    addLayers(layers) {
        for (const layer of layers)this.addLayer(layer);
    }
    deleteLayer(id) {
        this.layerMap.delete(id);
    }
    updateLayer(layer) {
        this.layerMap.set(layer.id, layer);
    }
    getLayer(id) {
        return this.layerMap.get(id);
    }
    addEntity(entity) {
        this.entitieMap.set(entity.id, entity);
    }
    addEntities(entities) {
        for (const entity of entities)this.addEntity(entity);
    }
    deleteEntity(entity) {
        this.entitieMap.delete(entity.id);
    }
    deleteEntities(entities) {
        for (const entity of entities)this.deleteEntity(entity);
    }
    deleteAllEntities() {
        this.entitieMap.clear();
    }
    updateEntity(entity) {
        this.entitieMap.set(entity.id, entity);
    }
    updateEntities(entities) {
        for (const entity of entities)this.updateEntity(entity);
    }
    getEntity(id) {
        return this.entitieMap.get(id);
    }
    updatePlane(plane) {
        const { origin, normal, up, elevation } = plane;
        origin && this._plane.origin.copy(origin);
        normal && this._plane.normal.copy(normal);
        up && this._plane.up.copy(up);
        void 0 !== elevation && (this._plane.elevation = elevation);
    }
    constructor(){
        this.layerMap = new Map();
        this.entitieMap = new Map();
        this._plane = {
            origin: new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 0),
            normal: new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 1),
            up: new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 1, 0),
            elevation: 0
        };
    }
}
export { DataManager, DefaultLayerId, createDefaultLayer };
