import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_3bd7879c__ from "../shared/logging/index.js";
const loggerManager = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_3bd7879c__.getLoggerManager)();
const log = loggerManager.getLogger('runtime');
const HANDLER_ERROR_LOG_INTERVAL_MS = 5000;
const HANDLER_ERROR_MESSAGE_MAX_LENGTH = 300;
function formatErrorMessage(value) {
    const singleLine = value.replace(/\s*[\r\n]+\s*/g, ' ');
    return singleLine.length <= HANDLER_ERROR_MESSAGE_MAX_LENGTH ? singleLine : `${singleLine.slice(0, HANDLER_ERROR_MESSAGE_MAX_LENGTH - 3)}...`;
}
class EventBus {
    getDiagnostics() {
        let listeners = 0;
        for (const handlers of this.listeners.values())listeners += handlers.size;
        return {
            eventTypes: this.listeners.size,
            listeners,
            onceWrappers: this.onceWrappers.size,
            handlerErrors: this.handlerErrors.length,
            disposed: this.disposed
        };
    }
    on(event, handler) {
        if (this.disposed) return;
        let set = this.listeners.get(event);
        if (!set) {
            set = new Set();
            this.listeners.set(event, set);
        }
        set.add(handler);
    }
    once(event, handler) {
        const wrapper = (data)=>{
            this.onceWrappers.delete(handler);
            this.off(event, wrapper);
            handler(data);
        };
        this.onceWrappers.set(handler, wrapper);
        this.on(event, wrapper);
    }
    off(event, handler) {
        const set = this.listeners.get(event);
        if (!set) return;
        const wrapper = this.onceWrappers.get(handler);
        if (wrapper) {
            set.delete(wrapper);
            this.onceWrappers.delete(handler);
        } else set.delete(handler);
        if (0 === set.size) this.listeners.delete(event);
    }
    emit(event, ...args) {
        if (this.disposed) return;
        const data = args[0];
        const set = this.listeners.get(event);
        if (!set) return;
        for (const handler of Array.from(set))try {
            handler(data);
        } catch (err) {
            this.handlerErrors.push(err);
            const eventName = event;
            if (log.isEnabled(__WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_3bd7879c__.LogLevel.ERROR) && this.shouldLogHandlerError(eventName, handler)) {
                const errorName = err instanceof Error ? err.name || 'Error' : 'NonErrorThrown';
                const errorMessage = err instanceof Error ? err.message : String(err);
                log.error(`EventBus handler error event=${eventName} handler=${handler.name || '<anonymous>'} error=${formatErrorMessage(errorName)} message=${formatErrorMessage(errorMessage)}`);
            }
        }
    }
    shouldLogHandlerError(event, handler) {
        const now = loggerManager.now();
        let eventLogTimes = this.handlerErrorLogTimes.get(handler);
        if (null == eventLogTimes) {
            eventLogTimes = new Map();
            this.handlerErrorLogTimes.set(handler, eventLogTimes);
        }
        const lastLoggedAt = eventLogTimes.get(event);
        if (void 0 !== lastLoggedAt && now - lastLoggedAt < HANDLER_ERROR_LOG_INTERVAL_MS) return false;
        eventLogTimes.set(event, now);
        return true;
    }
    removeAllListeners(event) {
        if (void 0 !== event) {
            const set = this.listeners.get(event);
            if (set) {
                this.onceWrappers.forEach((wrapper, original)=>{
                    if (set.has(wrapper)) this.onceWrappers.delete(original);
                });
                this.listeners.delete(event);
            }
        } else {
            this.listeners.clear();
            this.onceWrappers.clear();
        }
    }
    dispose() {
        this.disposed = true;
        this.listeners.clear();
        this.onceWrappers.clear();
        this.handlerErrors.length = 0;
    }
    constructor(){
        this.listeners = new Map();
        this.onceWrappers = new Map();
        this.handlerErrorLogTimes = new WeakMap();
        this.disposed = false;
        this.handlerErrors = [];
    }
}
export { EventBus };
