import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('gsplat:lod');
class CameraComponent {
    constructor(camera, layers = []){
        this.layers = [];
        this.layersSet = new Set();
        this.camera = camera;
        this.setLayers(layers);
    }
    setLayers(layers) {
        this.layers = layers.slice();
        this.layersSet = new Set(layers);
    }
    addLayer(layerId) {
        if (!this.layersSet.has(layerId)) {
            this.layers.push(layerId);
            this.layersSet.add(layerId);
        }
    }
    removeLayer(layerId) {
        if (this.layersSet.has(layerId)) {
            const index = this.layers.indexOf(layerId);
            if (-1 !== index) this.layers.splice(index, 1);
            this.layersSet.delete(layerId);
        }
    }
}
class LayerComposition {
    addLayer(layer) {
        if (this.layerMap.has(layer.id)) {
            log.warn(`Layer with id ${layer.id} already exists`);
            return;
        }
        this.layerList.push(layer);
        this.layerMap.set(layer.id, layer);
        this.layerNameMap.set(layer.name, layer);
    }
    removeLayer(layer) {
        const index = this.layerList.indexOf(layer);
        if (-1 !== index) {
            this.layerList.splice(index, 1);
            this.layerMap.delete(layer.id);
            this.layerNameMap.delete(layer.name);
            for (const cameraComponent of this.cameras)cameraComponent.removeLayer(layer.id);
        }
    }
    getLayerById(id) {
        return this.layerMap.get(id) ?? null;
    }
    getLayerByName(name) {
        return this.layerNameMap.get(name) ?? null;
    }
    addCamera(cameraComponent) {
        if (!this.camerasSet.has(cameraComponent.camera)) {
            this.cameras.push(cameraComponent);
            this.camerasSet.add(cameraComponent.camera);
        }
    }
    removeCamera(cameraComponent) {
        const index = this.cameras.indexOf(cameraComponent);
        if (-1 !== index) {
            this.cameras.splice(index, 1);
            this.camerasSet.delete(cameraComponent.camera);
        }
    }
    getCameraComponent(camera) {
        return this.cameras.find((c)=>c.camera === camera) ?? null;
    }
    clearLayers() {
        const layerIds = this.layerList.map((layer)=>layer.id);
        for (const cameraComponent of this.cameras)for (const layerId of layerIds)cameraComponent.removeLayer(layerId);
        this.layerList.length = 0;
        this.layerMap.clear();
        this.layerNameMap.clear();
    }
    clearCameras() {
        this.cameras.length = 0;
        this.camerasSet.clear();
    }
    constructor(){
        this.layerList = [];
        this.layerMap = new Map();
        this.layerNameMap = new Map();
        this.cameras = [];
        this.camerasSet = new Set();
    }
}
export { CameraComponent, LayerComposition };
