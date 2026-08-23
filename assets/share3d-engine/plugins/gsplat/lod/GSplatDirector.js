import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__GSplatManager_js_79c3cb82__ from "./GSplatManager.js";
class GSplatLayerData {
    createManager(renderer, director, layer, camera) {
        this.manager = new __WEBPACK_EXTERNAL_MODULE__GSplatManager_js_79c3cb82__.GSplatManager(renderer, camera, void 0, director.managerOptions);
        director.dispatchEvent({
            type: 'manager:created',
            manager: this.manager,
            camera,
            layer
        });
    }
    updateConfiguration(renderer, director, layer, camera) {
        const hasNormalPlacements = layer.gsplatPlacements.length > 0;
        const desiredMainMode = hasNormalPlacements;
        if (desiredMainMode && !this.manager) this.createManager(renderer, director, layer, camera);
        else if (!desiredMainMode && this.manager) {
            this.manager.destroy();
            this.manager = null;
        }
    }
    destroy() {
        if (this.manager) {
            this.manager.destroy();
            this.manager = null;
        }
    }
    constructor(){
        this.manager = null;
    }
}
class GSplatCameraData {
    destroy() {
        this.layersMap.forEach((layerData)=>layerData.destroy());
        this.layersMap.clear();
    }
    removeLayerData(layerId) {
        const layerData = this.layersMap.get(layerId);
        if (layerData) {
            layerData.destroy();
            this.layersMap.delete(layerId);
        }
    }
    getLayerData(renderer, director, layer, camera) {
        let layerData = this.layersMap.get(layer.id);
        if (!layerData) {
            layerData = new GSplatLayerData();
            layerData.updateConfiguration(renderer, director, layer, camera);
            this.layersMap.set(layer.id, layerData);
        }
        return layerData;
    }
    constructor(){
        this.layersMap = new Map();
    }
}
const tempLayersToRemove = [];
class GSplatDirector extends __WEBPACK_EXTERNAL_MODULE_three__.EventDispatcher {
    constructor(renderer, options = {}){
        super(), this.camerasMap = new Map(), this.currentCooldownFrameId = null, this.currentCooldownFrameSource = null, this.fallbackCooldownFrameId = 0, this.fallbackCooldownFrameSource = {}, this.cooldownFrameGeneration = 0, this._gsplatCount = 0;
        this.renderer = renderer;
        this.managerOptions = options.managerOptions;
    }
    setManagerOptions(options) {
        this.managerOptions = options;
        for (const manager of this.getAllManagers()){
            manager.setOrderUploadSchedulerOptions(options?.orderUploadScheduler);
            manager.setInteractiveSortSchedulerConfig(options?.interactiveSortScheduler);
            manager.setOnSortResultReady(options?.onSortResultReady ?? null);
        }
    }
    destroy() {
        this.camerasMap.forEach((cameraData)=>cameraData.destroy());
        this.camerasMap.clear();
        this.currentCooldownFrameId = null;
        this.currentCooldownFrameSource = null;
        this.cooldownFrameGeneration++;
    }
    getCameraData(camera) {
        let cameraData = this.camerasMap.get(camera);
        if (!cameraData) {
            cameraData = new GSplatCameraData();
            this.camerasMap.set(camera, cameraData);
        }
        return cameraData;
    }
    update(comp, frameId, frameSource) {
        const hasHostFrameId = 'number' == typeof frameId && Number.isFinite(frameId);
        const cooldownFrameId = hasHostFrameId ? Math.floor(frameId) : ++this.fallbackCooldownFrameId;
        const cooldownFrameSource = hasHostFrameId ? frameSource ?? this : this.fallbackCooldownFrameSource;
        this.rememberCooldownFrame(cooldownFrameId, cooldownFrameSource);
        this.camerasMap.forEach((cameraData, camera)=>{
            if (comp.camerasSet.has(camera)) {
                const cameraComponent = comp.getCameraComponent(camera);
                if (!cameraComponent) return;
                tempLayersToRemove.length = 0;
                cameraData.layersMap.forEach((_layerData, layerId)=>{
                    const layer = comp.getLayerById(layerId);
                    if (!cameraComponent.layersSet.has(layerId) || !layer || !layer.enabled) tempLayersToRemove.push(layerId);
                });
                for(let i = 0; i < tempLayersToRemove.length; i++)cameraData.removeLayerData(tempLayersToRemove[i]);
                tempLayersToRemove.length = 0;
            } else {
                cameraData.destroy();
                this.camerasMap.delete(camera);
            }
        });
        let gsplatCount = 0;
        for(let i = 0; i < comp.cameras.length; i++){
            const cameraComponent = comp.cameras[i];
            const camera = cameraComponent.camera;
            let cameraData = this.camerasMap.get(camera);
            const layerIds = cameraComponent.layers;
            for(let j = 0; j < layerIds.length; j++){
                const layerId = layerIds[j];
                const layer = comp.getLayerById(layerId);
                if (!layer || !layer.enabled) continue;
                const isDirty = layer.gsplatPlacementsDirty;
                const isNewCamera = !cameraData;
                if (isDirty || isNewCamera) {
                    const hasNormalPlacements = layer.gsplatPlacements.length > 0;
                    if (hasNormalPlacements) {
                        cameraData ??= this.getCameraData(camera);
                        const layerData = cameraData.getLayerData(this.renderer, this, layer, camera);
                        layerData.updateConfiguration(this.renderer, this, layer, camera);
                        if (layerData.manager) layerData.manager.reconcile(layer.gsplatPlacements);
                    } else if (cameraData) cameraData.removeLayerData(layer.id);
                }
            }
            if (cameraData) {
                for (const layerData of cameraData.layersMap.values())if (layerData.manager) gsplatCount += layerData.manager.update(cooldownFrameId, cooldownFrameSource);
            }
        }
        this._gsplatCount = gsplatCount;
        for(let i = 0; i < comp.layerList.length; i++){
            const layer = comp.layerList[i];
            layer.gsplatPlacementsDirty = false;
        }
        this.camerasMap.forEach((cameraData, camera)=>{
            cameraData.layersMap.forEach((layerData, layerId)=>{
                const layer = comp.getLayerById(layerId);
                if (layer && layerData.manager) {
                    const isReady = layerData.manager.isReady;
                    const loadingCount = layerData.manager.loadingCount;
                    this.dispatchEvent({
                        type: 'frame:ready',
                        camera,
                        layer,
                        isReady,
                        loadingCount
                    });
                }
            });
        });
    }
    updateForRender(comp) {
        if (null !== this.currentCooldownFrameId && this.currentCooldownFrameSource) {
            this.update(comp, this.currentCooldownFrameId, this.currentCooldownFrameSource);
            return;
        }
        this.update(comp);
    }
    rememberCooldownFrame(frameId, frameSource) {
        this.currentCooldownFrameId = frameId;
        this.currentCooldownFrameSource = frameSource;
        const generation = ++this.cooldownFrameGeneration;
        queueMicrotask(()=>{
            if (this.cooldownFrameGeneration !== generation) return;
            this.currentCooldownFrameId = null;
            this.currentCooldownFrameSource = null;
        });
    }
    getManager(camera, layer) {
        const cameraData = this.camerasMap.get(camera);
        if (!cameraData) return null;
        const layerData = cameraData.layersMap.get(layer.id);
        return layerData?.manager ?? null;
    }
    getAllManagers() {
        const managers = [];
        this.camerasMap.forEach((cameraData)=>{
            cameraData.layersMap.forEach((layerData)=>{
                if (layerData.manager) managers.push(layerData.manager);
            });
        });
        return managers;
    }
    get gsplatCount() {
        return this._gsplatCount;
    }
}
export { GSplatDirector };
