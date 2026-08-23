import * as __WEBPACK_EXTERNAL_MODULE__LogLevel_js_c4e215d5__ from "./LogLevel.js";
const NOOP_END = ()=>0;
class Profiler {
    constructor(params){
        this._namespace = '' === params.namespace ? 'perf' : `${params.namespace}:perf`;
        this._isEnabled = params.isEnabled;
        this._now = params.now;
        this._emit = params.emit;
    }
    time(label) {
        if (!this._isEnabled()) return NOOP_END;
        const start = this._now();
        return ()=>{
            const elapsed = this._now() - start;
            this._record(label, elapsed);
            return elapsed;
        };
    }
    async span(label, fn) {
        if (!this._isEnabled()) return fn();
        const start = this._now();
        try {
            return await fn();
        } finally{
            this._record(label, this._now() - start);
        }
    }
    _record(label, elapsed) {
        this._emit({
            level: __WEBPACK_EXTERNAL_MODULE__LogLevel_js_c4e215d5__.LogLevel.DEBUG,
            namespace: this._namespace,
            message: `${label} ${elapsed.toFixed(1)}ms`,
            timestamp: this._now()
        });
    }
}
export { Profiler };
