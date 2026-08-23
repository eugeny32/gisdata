import * as __WEBPACK_EXTERNAL_MODULE__ConsoleSink_js_8819cb02__ from "./ConsoleSink.js";
import * as __WEBPACK_EXTERNAL_MODULE__Logger_js_39b686d5__ from "./Logger.js";
import * as __WEBPACK_EXTERNAL_MODULE__LogLevel_js_c4e215d5__ from "./LogLevel.js";
function isOptInMemoryNamespace(namespace) {
    return 'memory' === namespace || namespace.startsWith('memory:') || namespace.endsWith(':memory') || namespace.includes(':memory:');
}
function createClock() {
    const perf = globalThis.performance;
    if (null != perf && 'function' == typeof perf.now) return ()=>perf.now();
    return ()=>0;
}
class LoggerManager {
    constructor(config, defaultLevel = __WEBPACK_EXTERNAL_MODULE__LogLevel_js_c4e215d5__.LogLevel.WARN, sink){
        this._namespaceLevels = new Map();
        this._loggers = new Map();
        this._now = createClock();
        this._sink = sink ?? config?.sink ?? new __WEBPACK_EXTERNAL_MODULE__ConsoleSink_js_8819cb02__.ConsoleSink();
        this._defaultLevel = __WEBPACK_EXTERNAL_MODULE__LogLevel_js_c4e215d5__.LogLevel.WARN;
        this._perf = false;
        this.configure(config, defaultLevel);
    }
    configure(config, defaultLevel = __WEBPACK_EXTERNAL_MODULE__LogLevel_js_c4e215d5__.LogLevel.WARN) {
        this._defaultLevel = (0, __WEBPACK_EXTERNAL_MODULE__LogLevel_js_c4e215d5__.parseLogLevel)(config?.level, defaultLevel);
        this._perf = config?.perf ?? false;
        if (config?.sink != null) this._sink = config.sink;
        this._namespaceLevels.clear();
        if (config?.namespaces != null) for (const ns of Object.keys(config.namespaces))this._namespaceLevels.set(ns, (0, __WEBPACK_EXTERNAL_MODULE__LogLevel_js_c4e215d5__.parseLogLevel)(config.namespaces[ns], this._defaultLevel));
    }
    now() {
        return this._now();
    }
    isPerfEnabled() {
        return this._perf;
    }
    isEnabled(namespace, level) {
        return level <= this._resolveLevel(namespace);
    }
    emit(record) {
        this._sink.write(record);
    }
    writeRecord(record) {
        this._sink.write(record);
    }
    getLogger(namespace) {
        let logger = this._loggers.get(namespace);
        if (null == logger) {
            logger = new __WEBPACK_EXTERNAL_MODULE__Logger_js_39b686d5__.Logger(namespace, this);
            this._loggers.set(namespace, logger);
        }
        return logger;
    }
    get root() {
        return this.getLogger('');
    }
    setLevel(level) {
        this._defaultLevel = (0, __WEBPACK_EXTERNAL_MODULE__LogLevel_js_c4e215d5__.parseLogLevel)(level, this._defaultLevel);
    }
    setNamespaceLevel(namespace, level) {
        this._namespaceLevels.set(namespace, (0, __WEBPACK_EXTERNAL_MODULE__LogLevel_js_c4e215d5__.parseLogLevel)(level, this._defaultLevel));
    }
    setPerfEnabled(enabled) {
        this._perf = enabled;
    }
    setSink(sink) {
        this._sink = sink;
    }
    receiveRecord(record) {
        if (this.isEnabled(record.namespace, record.level)) this._sink.write(record);
    }
    _resolveLevel(namespace) {
        let key = namespace;
        while(key.length > 0){
            const hit = this._namespaceLevels.get(key);
            if (void 0 !== hit) return hit;
            const idx = key.lastIndexOf(':');
            if (idx < 0) break;
            key = key.slice(0, idx);
        }
        if (isOptInMemoryNamespace(namespace)) return __WEBPACK_EXTERNAL_MODULE__LogLevel_js_c4e215d5__.LogLevel.SILENT;
        return this._defaultLevel;
    }
}
let globalManager = null;
function createLoggerManager(config, defaultLevel = __WEBPACK_EXTERNAL_MODULE__LogLevel_js_c4e215d5__.LogLevel.WARN) {
    if (null == globalManager) globalManager = new LoggerManager(config, defaultLevel);
    else globalManager.configure(config, defaultLevel);
    return globalManager;
}
function getLoggerManager() {
    if (null == globalManager) globalManager = new LoggerManager();
    return globalManager;
}
export { LoggerManager, createLoggerManager, getLoggerManager };
