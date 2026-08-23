import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__runtime_EngineContext_js_14c959cd__ from "../runtime/EngineContext.js";
import * as __WEBPACK_EXTERNAL_MODULE__runtime_EventBus_js_18889a45__ from "../runtime/EventBus.js";
import * as __WEBPACK_EXTERNAL_MODULE__runtime_PluginManager_js_673bcc96__ from "../runtime/PluginManager.js";
import * as __WEBPACK_EXTERNAL_MODULE__runtime_RenderLoop_js_6e137c22__ from "../runtime/RenderLoop.js";
import * as __WEBPACK_EXTERNAL_MODULE__runtime_SceneBoundsService_js_218b49f3__ from "../runtime/SceneBoundsService.js";
import * as __WEBPACK_EXTERNAL_MODULE__runtime_SceneGraphService_js_6dbe8275__ from "../runtime/SceneGraphService.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_disposable_DisposableScope_js_397fc142__ from "../shared/disposable/DisposableScope.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_3bd7879c__ from "../shared/logging/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__PotreeEngine_js_41d119d1__ from "./PotreeEngine.js";
function resolveDefaultLogLevel() {
    const isProd = true;
    return isProd ? __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_3bd7879c__.LogLevel.SILENT : __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_3bd7879c__.LogLevel.WARN;
}
async function createPotreeEngine(config) {
    let renderer = null;
    let events = null;
    let context = null;
    let pluginManager = null;
    let loop = null;
    try {
        const width = config.container.clientWidth;
        const height = config.container.clientHeight;
        if (0 === width || 0 === height) throw new Error('container 尺寸为 0，请确保 container 已添加到 DOM 且可见');
        const loggerManager = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_3bd7879c__.createLoggerManager)(config.logging, resolveDefaultLogLevel());
        const logger = loggerManager.root;
        renderer = new __WEBPACK_EXTERNAL_MODULE_three__.WebGLRenderer({
            antialias: config.renderer?.antialias ?? true,
            preserveDrawingBuffer: config.renderer?.preserveDrawingBuffer ?? false,
            logarithmicDepthBuffer: config.renderer?.logarithmicDepthBuffer ?? false,
            powerPreference: config.renderer?.powerPreference ?? 'high-performance',
            canvas: document.createElement('canvas')
        });
        config.container.appendChild(renderer.domElement);
        config.container.style.outline = 'none';
        renderer.domElement.style.outline = 'none';
        const pixelRatio = (config.pixelRatio ?? window.devicePixelRatio) || 1;
        renderer.setPixelRatio(pixelRatio);
        renderer.setSize(width, height, true);
        events = new __WEBPACK_EXTERNAL_MODULE__runtime_EventBus_js_18889a45__.EventBus();
        const sceneGraph = new __WEBPACK_EXTERNAL_MODULE__runtime_SceneGraphService_js_6dbe8275__.SceneGraphService();
        const sceneBounds = new __WEBPACK_EXTERNAL_MODULE__runtime_SceneBoundsService_js_218b49f3__.SceneBoundsService();
        if (null != config.background) {
            const bgColor = 'string' == typeof config.background ? new __WEBPACK_EXTERNAL_MODULE_three__.Color(config.background) : config.background;
            sceneGraph.setBackground(bgColor);
        }
        const disposables = new __WEBPACK_EXTERNAL_MODULE__shared_disposable_DisposableScope_js_397fc142__.DisposableScope();
        const loadingManager = new __WEBPACK_EXTERNAL_MODULE_three__.LoadingManager();
        loadingManager.onLoad = ()=>{
            events.emit('asset.allLoaded', void 0);
        };
        loadingManager.onProgress = (_url, loaded, total)=>{
            events.emit('asset.progress', {
                url: _url,
                loaded,
                total,
                progress: total > 0 ? loaded / total : 0
            });
        };
        loadingManager.onError = (url)=>{
            events.emit('engine.error', {
                error: new Error(`加载失败: ${url}`),
                context: 'loadingManager'
            });
        };
        context = new __WEBPACK_EXTERNAL_MODULE__runtime_EngineContext_js_14c959cd__.EngineContext({
            container: config.container,
            renderer,
            events,
            sceneGraph,
            sceneBounds,
            disposables,
            loadingManager,
            logger,
            pointBudget: config.pointBudget,
            maxNodesLoading: config.maxNodesLoading
        });
        pluginManager = new __WEBPACK_EXTERNAL_MODULE__runtime_PluginManager_js_673bcc96__.PluginManager();
        pluginManager.addAll(config.plugins);
        await pluginManager.init(context);
        let viewportCamera = null;
        if (context.hasService('ViewportCamera')) viewportCamera = context.getService('ViewportCamera');
        loop = new __WEBPACK_EXTERNAL_MODULE__runtime_RenderLoop_js_6e137c22__.RenderLoop(context, pluginManager, viewportCamera, config.pixelRatio, config.renderMode ?? 'continuous');
        const engine = new __WEBPACK_EXTERNAL_MODULE__PotreeEngine_js_41d119d1__.PotreeEngine({
            context,
            plugins: pluginManager,
            events,
            loop,
            pluginManager
        });
        if (config.statsContainer) loop.enableStats(config.statsContainer);
        loop.start();
        engine.markReady();
        events.emit('engine.ready', void 0);
        return engine;
    } catch (error) {
        try {
            if (loop) loop.dispose();
        } catch  {}
        try {
            if (pluginManager) pluginManager.destroy();
        } catch  {}
        try {
            if (context) context.dispose();
        } catch  {}
        try {
            if (events) events.dispose();
        } catch  {}
        try {
            if (renderer) {
                renderer.dispose();
                renderer.domElement.remove();
            }
        } catch  {}
        try {
            pluginManager?.releaseReferences();
            context?.releaseHostReferences();
        } catch  {}
        throw error;
    }
}
export { createPotreeEngine };
