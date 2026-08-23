class ControlModeRegistryImpl {
    constructor(hooks){
        this.hooks = hooks;
    }
    registerFactory(mode, factory) {
        this.hooks.registerFactory(mode, factory);
    }
    unregisterFactory(mode) {
        return this.hooks.unregisterFactory(mode);
    }
    has(mode) {
        return this.hooks.has(mode);
    }
    listModes() {
        return this.hooks.listModes();
    }
    dispose() {}
}
export { ControlModeRegistryImpl };
