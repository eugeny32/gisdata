import * as __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__ from "lodash-es";
import * as __WEBPACK_EXTERNAL_MODULE_nanoid_non_secure_cbb059f4__ from "nanoid/non-secure";
import * as __WEBPACK_EXTERNAL_MODULE__core_Command_js_ab052390__ from "../../core/Command.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_e0d0aed1__ from "../../../../../shared/logging/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__model_layer_Layer_js_1b70f47c__ from "../model/layer/Layer.js";
const MATERIAL_UPDATE_OPTIONS = {
    updateGeometry: false,
    updateMaterial: true
};
const LAYER_STYLE_KEYS = [
    'colorMethod',
    'color',
    'lineType',
    'lineWidth'
];
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_e0d0aed1__.getLoggerManager)().getLogger('cad');
function hasOwn(target, key) {
    return Object.hasOwn(target, key);
}
function cloneLayerState(layer) {
    return (0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.cloneDeep)(layer.serialize());
}
class CreateLayerCommand extends __WEBPACK_EXTERNAL_MODULE__core_Command_js_ab052390__.Command {
    constructor(input, viewManager){
        super(), this.input = input, this.viewManager = viewManager, this.layers = [];
    }
    execute() {
        const isBatch = Array.isArray(this.input);
        const inputArray = isBatch ? this.input : [
            this.input
        ];
        this.layers = inputArray.map((input)=>new __WEBPACK_EXTERNAL_MODULE__model_layer_Layer_js_1b70f47c__.Layer({
                ...(0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.cloneDeep)(input),
                id: input.id ?? (0, __WEBPACK_EXTERNAL_MODULE_nanoid_non_secure_cbb059f4__.nanoid)()
            }));
        for (const layer of this.layers){
            const existingLayer = this.viewManager.dataManager.getLayer(layer.id);
            if (existingLayer && existingLayer !== layer) {
                if (!isBatch) throw new Error(`图层已存在: ${layer.id}`);
                log.warn(`图层已存在: ${layer.id}`);
                continue;
            }
            this.viewManager.dataManager.addLayer(layer);
        }
    }
    undo() {
        for (const layer of this.layers)this.viewManager.dataManager.deleteLayer(layer.id);
    }
    getLayers() {
        return this.layers;
    }
}
class RemoveLayerCommand extends __WEBPACK_EXTERNAL_MODULE__core_Command_js_ab052390__.Command {
    constructor(layerId, viewManager){
        super(), this.layerId = layerId, this.viewManager = viewManager, this.layerEntities = [];
    }
    execute() {
        const layer = this.viewManager.dataManager.getLayer(this.layerId);
        if (!layer) return;
        this.layer = layer;
        this.layerEntities = [
            ...this.viewManager.getEntitiesByLayerId(this.layerId)
        ];
        if (this.layerEntities.length > 0) this.viewManager.deleteEntities(this.layerEntities);
        this.viewManager.dataManager.deleteLayer(this.layerId);
    }
    undo() {
        if (!this.layer) return;
        this.viewManager.dataManager.addLayer(this.layer);
        if (this.layerEntities.length > 0) this.viewManager.addEntities(this.layerEntities);
    }
    getLayerId() {
        return this.layerId;
    }
}
class UpdateLayerCommand extends __WEBPACK_EXTERNAL_MODULE__core_Command_js_ab052390__.Command {
    constructor(layerId, patch, viewManager){
        super(), this.layerId = layerId, this.patch = patch, this.viewManager = viewManager, this.previousEntityStates = new Map();
    }
    execute() {
        const layer = this.viewManager.dataManager.getLayer(this.layerId);
        if (!layer) return;
        if (!this.previousLayerState) this.previousLayerState = cloneLayerState(layer);
        const layerEntities = this.viewManager.getEntitiesByLayerId(this.layerId);
        const shouldUpdateEntityStyle = this.shouldUpdateEntityStyle();
        if (shouldUpdateEntityStyle && 0 === this.previousEntityStates.size) for (const entity of layerEntities)this.previousEntityStates.set(entity.id, (0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.cloneDeep)(entity));
        const previousVisible = layer.visible;
        Object.assign(layer, (0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.cloneDeep)(this.patch));
        if (shouldUpdateEntityStyle) {
            const entityPatch = this.getEntityStylePatch();
            for (const entity of layerEntities)Object.assign(entity, (0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.cloneDeep)(entityPatch));
            this.viewManager.updateEntities(layerEntities, MATERIAL_UPDATE_OPTIONS);
        }
        if (previousVisible !== layer.visible) this.viewManager.objectManager.setEntitiesVisible(layerEntities, layer.visible);
    }
    undo() {
        const layer = this.viewManager.dataManager.getLayer(this.layerId);
        if (!layer || !this.previousLayerState) return;
        const previousVisible = layer.visible;
        Object.assign(layer, (0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.cloneDeep)(this.previousLayerState));
        const layerEntities = this.viewManager.getEntitiesByLayerId(this.layerId);
        if (this.previousEntityStates.size > 0) {
            for (const entity of layerEntities){
                const previousState = this.previousEntityStates.get(entity.id);
                if (!!previousState) Object.assign(entity, (0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.cloneDeep)(previousState));
            }
            this.viewManager.updateEntities(layerEntities, MATERIAL_UPDATE_OPTIONS);
        }
        if (previousVisible !== layer.visible) this.viewManager.objectManager.setEntitiesVisible(layerEntities, layer.visible);
    }
    shouldUpdateEntityStyle() {
        return LAYER_STYLE_KEYS.some((key)=>hasOwn(this.patch, key));
    }
    getEntityStylePatch() {
        const entityPatch = {};
        if (hasOwn(this.patch, 'colorMethod')) entityPatch.colorMethod = (0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.cloneDeep)(this.patch.colorMethod);
        if (hasOwn(this.patch, 'color')) entityPatch.color = (0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.cloneDeep)(this.patch.color);
        if (hasOwn(this.patch, 'lineType')) entityPatch.lineType = (0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.cloneDeep)(this.patch.lineType);
        if (hasOwn(this.patch, 'lineWidth')) entityPatch.lineWidth = (0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.cloneDeep)(this.patch.lineWidth);
        return entityPatch;
    }
}
export { CreateLayerCommand, RemoveLayerCommand, UpdateLayerCommand };
