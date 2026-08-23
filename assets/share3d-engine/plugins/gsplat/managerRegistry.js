import * as __WEBPACK_EXTERNAL_MODULE__PCManager_js_66f7b006__ from "./PCManager.js";
const engineFactories = new Map();
function registerEngine(engine, factory) {
    engineFactories.set(engine, factory);
}
function createGS3DManager(config) {
    const factory = engineFactories.get(config.engine);
    if (!factory) {
        const availableEngines = Array.from(engineFactories.keys()).join(', ');
        throw new Error(`Unknown engine: "${config.engine}". Available engines: ${availableEngines || 'none registered'}`);
    }
    return factory(config);
}
function getRegisteredEngines() {
    return Array.from(engineFactories.keys());
}
registerEngine('playcanvas', (config)=>new __WEBPACK_EXTERNAL_MODULE__PCManager_js_66f7b006__.PlayCanvasGS3DManager(config.scene, config.renderer, config.lodConfig, {
        withCredentials: config.withCredentials
    }));
export { createGS3DManager, getRegisteredEngines, registerEngine };
