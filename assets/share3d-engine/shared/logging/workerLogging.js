import * as __WEBPACK_EXTERNAL_MODULE__LogLevel_js_c4e215d5__ from "./LogLevel.js";
function workerNow() {
    const perf = globalThis.performance;
    return null != perf && 'function' == typeof perf.now ? perf.now() : 0;
}
function isLogMessage(data) {
    return 'object' == typeof data && null !== data && '__log__' in data;
}
function createWorkerLogger(post, namespace = '') {
    const send = (level, message)=>{
        post({
            __log__: {
                level,
                namespace,
                message,
                timestamp: workerNow()
            }
        });
    };
    return {
        error: (msg)=>send(__WEBPACK_EXTERNAL_MODULE__LogLevel_js_c4e215d5__.LogLevel.ERROR, msg),
        warn: (msg)=>send(__WEBPACK_EXTERNAL_MODULE__LogLevel_js_c4e215d5__.LogLevel.WARN, msg),
        info: (msg)=>send(__WEBPACK_EXTERNAL_MODULE__LogLevel_js_c4e215d5__.LogLevel.INFO, msg),
        debug: (msg)=>send(__WEBPACK_EXTERNAL_MODULE__LogLevel_js_c4e215d5__.LogLevel.DEBUG, msg),
        child: (sub)=>createWorkerLogger(post, '' === namespace ? sub : `${namespace}:${sub}`),
        time: (label)=>{
            const start = workerNow();
            return ()=>{
                const elapsed = workerNow() - start;
                post({
                    __log__: {
                        level: __WEBPACK_EXTERNAL_MODULE__LogLevel_js_c4e215d5__.LogLevel.DEBUG,
                        namespace: '' === namespace ? 'perf' : `${namespace}:perf`,
                        message: `${label} ${elapsed.toFixed(1)}ms`,
                        timestamp: workerNow()
                    }
                });
                return elapsed;
            };
        }
    };
}
export { createWorkerLogger, isLogMessage };
