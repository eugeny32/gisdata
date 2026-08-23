import * as __WEBPACK_EXTERNAL_MODULE__global_js_67e2b430__ from "./global.js";
let _inlineBlobUrl;
let _inlineWorkerUrlPromise = null;
const DEFAULT_WORKER_FILE = '/workers/PotreeV2DecoderWorker.js';
function resolveBaseUrl(baseUrl) {
    if (baseUrl) return baseUrl.replace(/\/+$/, '');
    if ('undefined' != typeof window && window.POTREE_BASE_URL) return window.POTREE_BASE_URL.replace(/\/+$/, '');
}
function resolveExternalWorkerUrl(baseUrl) {
    const normalizedBaseUrl = resolveBaseUrl(baseUrl);
    if (normalizedBaseUrl) return `${normalizedBaseUrl}${DEFAULT_WORKER_FILE}`;
    if ('undefined' != typeof window) return `${window.location.origin}${DEFAULT_WORKER_FILE}`;
    return DEFAULT_WORKER_FILE;
}
function resolveWorkerMode(config) {
    if (config?.workerMode) return config.workerMode;
    if ('undefined' != typeof window && window.POTREE_WORKER_MODE) return window.POTREE_WORKER_MODE;
    return 'external';
}
function loadInlineWorkerUrl() {
    if (_inlineBlobUrl) return Promise.resolve(_inlineBlobUrl);
    if (!_inlineWorkerUrlPromise) _inlineWorkerUrlPromise = (async ()=>{
        const mod = await import("@sharefe/share3d-engine/worker-code");
        if (mod.WORKER_CODE.includes('import.meta.url')) throw new Error('当前 Worker 构建依赖 import.meta.url，不能使用内联 Blob 模式，请改用外部 worker 文件模式');
        const blob = new Blob([
            mod.WORKER_CODE
        ], {
            type: "text/javascript"
        });
        _inlineBlobUrl = URL.createObjectURL(blob);
        return _inlineBlobUrl;
    })().catch((error)=>{
        _inlineWorkerUrlPromise = null;
        throw error;
    });
    return _inlineWorkerUrlPromise;
}
function loadWorkerUrl(config) {
    if ('inline' === resolveWorkerMode(config)) return loadInlineWorkerUrl();
    return resolveExternalWorkerUrl(config?.workerBaseUrl);
}
function createDefaultConfig() {
    return {
        numNodesLoading: 0,
        maxNodesLoading: 8
    };
}
function createOctreeLoaderDeps(configSource) {
    const potreeConfig = configSource?.potreeInstance ?? createDefaultConfig();
    potreeConfig.numNodesLoading ??= 0;
    potreeConfig.maxNodesLoading ??= 8;
    const counter = {
        increment () {
            potreeConfig.numNodesLoading++;
        },
        decrement () {
            potreeConfig.numNodesLoading--;
        }
    };
    return {
        workerPool: configSource?.potreeInstance?.workerPool ?? __WEBPACK_EXTERNAL_MODULE__global_js_67e2b430__.workerPool,
        workerUrl: configSource?.potreeInstance?.workerUrl ?? loadWorkerUrl(configSource?.potreeInstance),
        counter,
        potreeConfig
    };
}
export { createOctreeLoaderDeps };
