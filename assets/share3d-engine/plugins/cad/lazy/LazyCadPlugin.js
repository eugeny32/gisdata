import * as __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_4a2ea0d6__ from "../../../shared/types/assets.js";
const createAbortError = ()=>new DOMException('CAD runtime initialization aborted', 'AbortError');
class LazyCadPlugin {
    constructor(options){
        this.name = 'cad';
        this.kind = 'cad';
        this.priority = 40;
        this.phases = [
            __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_4a2ea0d6__.RenderPhase.MainOpaque,
            __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_4a2ea0d6__.RenderPhase.Overlay3D
        ];
        this.renderPriority = 10;
        this.dependencies = [
            'CameraRig',
            'ViewportCamera',
            'SelectionService',
            'RenderPipeline',
            'PickingService',
            'ViewEventRouter',
            'ViewRegistry'
        ];
        this.provides = [
            'CadService'
        ];
        this.context = null;
        this.delegate = null;
        this.delegatePromise = null;
        this.started = false;
        this.disposed = false;
        this.options = options;
    }
    onInit(context) {
        this.context = context;
        context.registerService('CadService', this);
    }
    onStart() {
        this.started = true;
    }
    onDestroy() {
        if (this.disposed) return;
        this.disposed = true;
        this.started = false;
        const delegate = this.delegate;
        this.delegate = null;
        this.context = null;
        delegate?.onDestroy();
    }
    async load(request) {
        return (await this.ensureDelegate()).load(request);
    }
    mount(handle) {
        this.requireDelegate().mount(handle);
    }
    unmount(id) {
        this.delegate?.unmount(id);
    }
    getAsset(id) {
        return this.delegate?.getAsset(id);
    }
    getAll() {
        return this.delegate?.getAll() ?? [];
    }
    setVisibility(id, visible) {
        this.delegate?.setVisibility(id, visible);
    }
    render(frame, phase, context) {
        this.delegate?.render(frame, phase, context);
    }
    pick(query) {
        return this.delegate?.pick(query) ?? null;
    }
    dispose(id) {
        this.delegate?.dispose(id);
    }
    async export(id, format, options) {
        return (await this.ensureDelegate()).export(id, format, options);
    }
    getActive() {
        return this.delegate?.getActive();
    }
    getActiveId() {
        return this.delegate?.getActiveId() ?? null;
    }
    setActive(id) {
        this.delegate?.setActive(id);
    }
    requireDelegate() {
        if (!this.delegate) throw new Error('[LazyCadPlugin] CAD runtime 尚未加载');
        return this.delegate;
    }
    ensureDelegate() {
        if (this.disposed) return Promise.reject(createAbortError());
        if (this.delegate) return Promise.resolve(this.delegate);
        if (this.delegatePromise) return this.delegatePromise;
        if (!this.context) return Promise.reject(new Error('[LazyCadPlugin] 插件尚未初始化'));
        const context = this.context;
        const delegatePromise = import("../CadPlugin.js").then(({ CadPlugin })=>{
            if (this.disposed) throw createAbortError();
            const delegate = new CadPlugin(this.options);
            try {
                delegate.onInitAsDelegate(context);
                if (this.started) delegate.onStart();
            } catch (error) {
                try {
                    delegate.onDestroy();
                } catch  {}
                throw error;
            }
            if (this.disposed) {
                delegate.onDestroy();
                throw createAbortError();
            }
            this.delegate = delegate;
            return delegate;
        }).catch((error)=>{
            if (this.delegatePromise === delegatePromise) this.delegatePromise = null;
            throw error;
        });
        this.delegatePromise = delegatePromise;
        return delegatePromise;
    }
}
export { LazyCadPlugin };
