import * as __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__ from "lodash-es";
import * as __WEBPACK_EXTERNAL_MODULE__module_CADModule_manager_DataManager_js_dcc62dc4__ from "./module/CADModule/manager/DataManager.js";
import * as __WEBPACK_EXTERNAL_MODULE__module_CADModule_model_common_constant_js_3e18f98d__ from "./module/CADModule/model/common/constant.js";
function isRecord(value) {
    return 'object' == typeof value && null !== value && !Array.isArray(value);
}
function isColorMethod(value) {
    return value === __WEBPACK_EXTERNAL_MODULE__module_CADModule_model_common_constant_js_3e18f98d__.ColorMethod.BY_LAYER || value === __WEBPACK_EXTERNAL_MODULE__module_CADModule_model_common_constant_js_3e18f98d__.ColorMethod.BY_BLOCK || value === __WEBPACK_EXTERNAL_MODULE__module_CADModule_model_common_constant_js_3e18f98d__.ColorMethod.INDEX || value === __WEBPACK_EXTERNAL_MODULE__module_CADModule_model_common_constant_js_3e18f98d__.ColorMethod.RGB;
}
function isLineType(value) {
    return Object.values(__WEBPACK_EXTERNAL_MODULE__module_CADModule_model_common_constant_js_3e18f98d__.LineType).includes(value);
}
function isEntityType(value) {
    return Object.values(__WEBPACK_EXTERNAL_MODULE__module_CADModule_model_common_constant_js_3e18f98d__.EntityType).includes(value);
}
function toNumber(value, fallback) {
    return 'number' == typeof value && Number.isFinite(value) ? value : fallback;
}
function toBoolean(value, fallback) {
    return 'boolean' == typeof value ? value : fallback;
}
function toNonEmptyString(value, fallback) {
    return 'string' == typeof value && value.length > 0 ? value : fallback;
}
function toPoint3D(value, fallback) {
    if (!isRecord(value)) return {
        ...fallback
    };
    return {
        x: toNumber(value.x, fallback.x),
        y: toNumber(value.y, fallback.y),
        z: toNumber(value.z, fallback.z)
    };
}
function toEntityType(value) {
    if (value === __WEBPACK_EXTERNAL_MODULE__module_CADModule_model_common_constant_js_3e18f98d__.EntityType.Text) return __WEBPACK_EXTERNAL_MODULE__module_CADModule_model_common_constant_js_3e18f98d__.EntityType.MText;
    return isEntityType(value) ? value : null;
}
function createDefaultCadPlaneMetadata() {
    return {
        origin: {
            x: 0,
            y: 0,
            z: 0
        },
        normal: {
            x: 0,
            y: 0,
            z: 1
        },
        up: {
            x: 0,
            y: 1,
            z: 0
        },
        elevation: 0
    };
}
function normalizePlaneMetadata(plane) {
    const fallback = createDefaultCadPlaneMetadata();
    if (!isRecord(plane)) return fallback;
    return {
        origin: toPoint3D(plane.origin, fallback.origin),
        normal: toPoint3D(plane.normal, fallback.normal),
        up: toPoint3D(plane.up, fallback.up),
        elevation: toNumber(plane.elevation, fallback.elevation)
    };
}
function normalizeLayerData(layer, index) {
    const fallbackLayer = (0, __WEBPACK_EXTERNAL_MODULE__module_CADModule_manager_DataManager_js_dcc62dc4__.createDefaultLayer)().serialize();
    const layerRecord = isRecord(layer) ? layer : {};
    const id = toNonEmptyString(layerRecord.id, 0 === index ? __WEBPACK_EXTERNAL_MODULE__module_CADModule_manager_DataManager_js_dcc62dc4__.DefaultLayerId : `legacy-layer-${index + 1}`);
    return {
        id,
        name: toNonEmptyString(layerRecord.name, id === __WEBPACK_EXTERNAL_MODULE__module_CADModule_manager_DataManager_js_dcc62dc4__.DefaultLayerId ? fallbackLayer.name : id),
        colorMethod: isColorMethod(layerRecord.colorMethod) ? layerRecord.colorMethod : fallbackLayer.colorMethod,
        color: toNumber(layerRecord.color, fallbackLayer.color),
        lineType: isLineType(layerRecord.lineType) ? layerRecord.lineType : fallbackLayer.lineType,
        lineWidth: toNumber(layerRecord.lineWidth, fallbackLayer.lineWidth),
        visible: toBoolean(layerRecord.visible, fallbackLayer.visible),
        locked: toBoolean(layerRecord.locked, fallbackLayer.locked)
    };
}
function normalizeEntityData(entity, index) {
    if (!isRecord(entity)) return null;
    const type = toEntityType(entity.type);
    if (!type) return null;
    return {
        id: toNonEmptyString(entity.id, `legacy-entity-${index + 1}`),
        type,
        layerId: 'string' == typeof entity.layerId ? entity.layerId : '',
        colorMethod: isColorMethod(entity.colorMethod) ? entity.colorMethod : __WEBPACK_EXTERNAL_MODULE__module_CADModule_model_common_constant_js_3e18f98d__.ColorMethod.BY_LAYER,
        color: toNumber(entity.color, 0xffffff),
        lineType: isLineType(entity.lineType) ? entity.lineType : __WEBPACK_EXTERNAL_MODULE__module_CADModule_model_common_constant_js_3e18f98d__.LineType.Solid,
        lineWidth: toNumber(entity.lineWidth, 0.25),
        ...(0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.omit)(entity, [
            'id',
            'type',
            'layerId',
            'colorMethod',
            'color',
            'lineType',
            'lineWidth'
        ])
    };
}
function normalizeJsonCadMetadata(data) {
    if (!isRecord(data)) throw new Error('JsonCadLoader: JSON 数据必须是对象');
    const inputLayers = Array.isArray(data.layers) ? data.layers : [];
    const inputEntities = Array.isArray(data.entities) ? data.entities : [];
    const layers = inputLayers.map((layer, index)=>normalizeLayerData(layer, index));
    const entities = inputEntities.map((entity, index)=>normalizeEntityData(entity, index)).filter((entity)=>null !== entity);
    if (entities.length > 0 && 0 === layers.length) layers.push((0, __WEBPACK_EXTERNAL_MODULE__module_CADModule_manager_DataManager_js_dcc62dc4__.createDefaultLayer)().serialize());
    const fallbackLayerId = layers[0]?.id ?? __WEBPACK_EXTERNAL_MODULE__module_CADModule_manager_DataManager_js_dcc62dc4__.DefaultLayerId;
    const knownLayerIds = new Set(layers.map((layer)=>layer.id));
    for (const entity of entities)if (!entity.layerId || !knownLayerIds.has(entity.layerId)) entity.layerId = fallbackLayerId;
    return {
        layers,
        entities,
        plane: normalizePlaneMetadata(data.plane)
    };
}
export { createDefaultCadPlaneMetadata, normalizeJsonCadMetadata };
