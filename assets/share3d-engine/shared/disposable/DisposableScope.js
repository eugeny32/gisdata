import * as __WEBPACK_EXTERNAL_MODULE__logging_index_js_891196f4__ from "../logging/index.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__logging_index_js_891196f4__.getLoggerManager)().getLogger('runtime');
class DisposableScope {
    track(resource) {
        if (this.disposed) throw new Error('DisposableScope: 已释放，不能再跟踪资源');
        this.cleanups.push(()=>resource.dispose());
        return resource;
    }
    defer(fn) {
        if (this.disposed) throw new Error('DisposableScope: 已释放，不能再注册回调');
        this.cleanups.push(fn);
    }
    dispose() {
        if (this.disposed) return;
        this.disposed = true;
        for(let i = this.cleanups.length - 1; i >= 0; i--)try {
            this.cleanups[i]();
        } catch (err) {
            this.disposeErrors.push(err);
            log.error(`DisposableScope: 清理回调执行出错: ${err instanceof Error ? err.message : String(err)}`);
        }
        this.cleanups.length = 0;
        if (this.disposeErrors.length > 0) log.error(`DisposableScope: 释放过程中共有 ${this.disposeErrors.length} 个错误`);
    }
    get size() {
        return this.cleanups.length;
    }
    constructor(){
        this.cleanups = [];
        this.disposed = false;
        this.disposeErrors = [];
    }
}
export { DisposableScope };
