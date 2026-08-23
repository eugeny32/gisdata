import * as __WEBPACK_EXTERNAL_MODULE__LogLevel_js_c4e215d5__ from "./LogLevel.js";
import * as __WEBPACK_EXTERNAL_MODULE__Profiler_js_16ad74d5__ from "./Profiler.js";
class Logger {
    constructor(namespace, host){
        this._namespace = namespace;
        this._host = host;
        this.perf = new __WEBPACK_EXTERNAL_MODULE__Profiler_js_16ad74d5__.Profiler({
            namespace,
            isEnabled: ()=>host.isPerfEnabled(),
            now: ()=>host.now(),
            emit: (record)=>host.writeRecord(record)
        });
    }
    error(msg) {
        this._log(__WEBPACK_EXTERNAL_MODULE__LogLevel_js_c4e215d5__.LogLevel.ERROR, msg);
    }
    warn(msg) {
        this._log(__WEBPACK_EXTERNAL_MODULE__LogLevel_js_c4e215d5__.LogLevel.WARN, msg);
    }
    info(msg) {
        this._log(__WEBPACK_EXTERNAL_MODULE__LogLevel_js_c4e215d5__.LogLevel.INFO, msg);
    }
    debug(msg) {
        this._log(__WEBPACK_EXTERNAL_MODULE__LogLevel_js_c4e215d5__.LogLevel.DEBUG, msg);
    }
    child(sub) {
        return this._host.getLogger('' === this._namespace ? sub : `${this._namespace}:${sub}`);
    }
    isEnabled(level) {
        return this._host.isEnabled(this._namespace, level);
    }
    _log(level, msg) {
        if (!this._host.isEnabled(this._namespace, level)) return;
        this._host.emit({
            level,
            namespace: this._namespace,
            message: msg,
            timestamp: this._host.now()
        });
    }
}
export { Logger };
