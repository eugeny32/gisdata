import * as __WEBPACK_EXTERNAL_MODULE__LogLevel_js_c4e215d5__ from "./LogLevel.js";
const consoleRef = globalThis.console;
function formatTimestamp(timestamp) {
    const totalMs = Math.max(0, Math.floor(timestamp));
    const ms = totalMs % 1000;
    const totalSec = Math.floor(totalMs / 1000);
    const sec = totalSec % 60;
    const min = Math.floor(totalSec / 60) % 60;
    const hour = Math.floor(totalSec / 3600) % 24;
    const p2 = (n)=>String(n).padStart(2, '0');
    const p3 = (n)=>String(n).padStart(3, '0');
    return `${p2(hour)}:${p2(min)}:${p2(sec)}.${p3(ms)}`;
}
class ConsoleSink {
    write(record) {
        const out = consoleRef;
        if (null == out) return;
        const line = `[${formatTimestamp(record.timestamp)}] [${record.namespace}] ${(0, __WEBPACK_EXTERNAL_MODULE__LogLevel_js_c4e215d5__.logLevelName)(record.level)} ${record.message}`;
        switch(record.level){
            case __WEBPACK_EXTERNAL_MODULE__LogLevel_js_c4e215d5__.LogLevel.ERROR:
                out.error(line);
                break;
            case __WEBPACK_EXTERNAL_MODULE__LogLevel_js_c4e215d5__.LogLevel.WARN:
                out.warn(line);
                break;
            case __WEBPACK_EXTERNAL_MODULE__LogLevel_js_c4e215d5__.LogLevel.INFO:
                out.info(line);
                break;
            case __WEBPACK_EXTERNAL_MODULE__LogLevel_js_c4e215d5__.LogLevel.DEBUG:
                out.debug(line);
                break;
            default:
                out.log(line);
                break;
        }
    }
}
export { ConsoleSink };
