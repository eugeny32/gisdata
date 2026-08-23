import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__module_CADModule_manager_DataManager_js_dcc62dc4__ from "./module/CADModule/manager/DataManager.js";
import * as __WEBPACK_EXTERNAL_MODULE__module_CADModule_manager_ObjectManager_js_e9628dde__ from "./module/CADModule/manager/ObjectManager.js";
import * as __WEBPACK_EXTERNAL_MODULE__normalizeJsonCadMetadata_js_5d0a8902__ from "./normalizeJsonCadMetadata.js";
function createCadLoadResultFromMetadata(data, metadataOverrides) {
    const dataManager = __WEBPACK_EXTERNAL_MODULE__module_CADModule_manager_DataManager_js_dcc62dc4__.DataManager.deserialize(data);
    const objectManager = new __WEBPACK_EXTERNAL_MODULE__module_CADModule_manager_ObjectManager_js_e9628dde__.ObjectManager();
    const entities = dataManager.entities;
    objectManager.addEntities(entities);
    objectManager.updateGroupByPlane(dataManager.plane);
    return {
        metadata: {
            boundingBox: metadataOverrides?.boundingBox ?? new __WEBPACK_EXTERNAL_MODULE_three__.Box3(),
            layerCount: metadataOverrides?.layerCount ?? dataManager.layers.length
        },
        scene: objectManager.getSceneGroup(),
        entities,
        dataManager,
        objectManager
    };
}
var __webpack_exports__createDefaultCadPlaneMetadata = __WEBPACK_EXTERNAL_MODULE__normalizeJsonCadMetadata_js_5d0a8902__.createDefaultCadPlaneMetadata;
var __webpack_exports__normalizeJsonCadMetadata = __WEBPACK_EXTERNAL_MODULE__normalizeJsonCadMetadata_js_5d0a8902__.normalizeJsonCadMetadata;
export { createCadLoadResultFromMetadata, __webpack_exports__createDefaultCadPlaneMetadata as createDefaultCadPlaneMetadata, __webpack_exports__normalizeJsonCadMetadata as normalizeJsonCadMetadata };
