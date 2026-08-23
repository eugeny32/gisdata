import * as __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_296af400__ from "../shared/constants/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_3bd7879c__ from "../shared/logging/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__RenderInvalidationEventBridge_js_dd1c5ebc__ from "./RenderInvalidationEventBridge.js";
import * as __WEBPACK_EXTERNAL_MODULE__RenderInvalidationService_js_de922848__ from "./RenderInvalidationService.js";
import * as __WEBPACK_EXTERNAL_MODULE__SceneBoundsService_js_895d52b8__ from "./SceneBoundsService.js";
let nextMemoryDiagnosticContextId = 1;
class EngineContext {
    get serviceCount() {
        return this.services.size;
    }
    get container() {
        if (!this._container) throw new Error('EngineContext 已释放宿主容器引用');
        return this._container;
    }
    get renderer() {
        if (!this._renderer) throw new Error('EngineContext 已释放 WebGLRenderer 引用');
        return this._renderer;
    }
    constructor(params){
        this.memoryDiagnosticId = nextMemoryDiagnosticContextId++;
        this.frameNumber = 0;
        this.services = new Map();
        this._container = params.container;
        this._renderer = params.renderer;
        this.events = params.events;
        this.sceneGraph = params.sceneGraph;
        this.sceneBounds = params.sceneBounds ?? new __WEBPACK_EXTERNAL_MODULE__SceneBoundsService_js_895d52b8__.SceneBoundsService();
        this.disposables = params.disposables;
        this.loadingManager = params.loadingManager;
        this.logger = params.logger ?? (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_3bd7879c__.getLoggerManager)().root;
        this.pointBudget = params.pointBudget ?? __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_296af400__.DEFAULT_POINT_BUDGET;
        this.maxNodesLoading = params.maxNodesLoading ?? __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_296af400__.DEFAULT_MAX_NODES_LOADING;
        this.renderInvalidation = this.disposables.track(new __WEBPACK_EXTERNAL_MODULE__RenderInvalidationService_js_de922848__.RenderInvalidationService());
        this.renderInvalidationEventBridge = this.disposables.track(new __WEBPACK_EXTERNAL_MODULE__RenderInvalidationEventBridge_js_dd1c5ebc__.RenderInvalidationEventBridge(this.events, this.renderInvalidation));
        this.registerService('Logger', this.logger);
        this.registerService('RenderInvalidationService', this.renderInvalidation);
    }
    registerService(name, service) {
        if (null == service) throw new Error(`服务 "${String(name)}" 的值不能为 null 或 undefined`);
        if (this.services.has(name)) throw new Error(`服务 "${String(name)}" 已被注册，禁止重复注册`);
        this.services.set(name, service);
    }
    getService(name) {
        if (!this.services.has(name)) throw new Error(`服务 "${String(name)}" 未注册，请检查 Plugin 依赖配置`);
        return this.services.get(name);
    }
    hasService(name) {
        return this.services.has(name);
    }
    getSize() {
        return {
            width: this.container.clientWidth,
            height: this.container.clientHeight
        };
    }
    getPixelRatio() {
        return this.renderer.getPixelRatio();
    }
    getRendererIfAvailable() {
        return this._renderer;
    }
    releaseHostReferences() {
        this._renderer = null;
        this._container = null;
    }
    dispose() {
        this.disposables.dispose();
        this.sceneBounds.dispose();
        this.sceneGraph.dispose();
        this.services.clear();
    }
}
export { EngineContext };
