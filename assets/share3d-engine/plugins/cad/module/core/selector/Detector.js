import * as __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__ from "lodash-es";
function merge(target, source) {
    return Object.assign(target, source);
}
class Detector {
    handleDetect(mousePosition) {
        if (!mousePosition) return [];
        if (!this.setting.enableDetect) return [];
        const result = this.detect(mousePosition);
        this.entities = this.applyDetectorFilter(result);
        return this.entities;
    }
    getEntities() {
        return this.entities;
    }
    getOneEntity() {
        if (this.entities.length) return this.entities[0];
        return null;
    }
    isDetected() {
        return this.entities.length > 0;
    }
    config(option) {
        merge(this.setting, option);
    }
    resetConfig() {
        this.setting = (0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.cloneDeep)(this.defaultSetting);
    }
    setDefaultConfig(option) {
        Object.assign(this.defaultSetting, option);
        this.resetConfig();
    }
    getEnableHighlight() {
        return this.setting.enableHighlight;
    }
    applyDetectorFilter(entities) {
        const tool = this.tool;
        if (tool?.onDetectorFilter) return tool.onDetectorFilter(entities);
        return entities;
    }
    onMouseMove(params) {
        this.handleDetect(params.screenPos);
    }
    injectTool(tool) {
        this.tool = tool;
    }
    ejectTool() {
        this.tool = void 0;
    }
    constructor(){
        this.entities = [];
        this.defaultSetting = {
            enableDetect: true,
            enableHighlight: false
        };
        this.setting = {
            enableDetect: true,
            enableHighlight: false
        };
    }
}
export { Detector };
