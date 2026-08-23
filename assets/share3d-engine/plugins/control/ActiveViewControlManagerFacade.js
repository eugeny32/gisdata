class ActiveViewControlManagerFacade {
    constructor(getActiveManager){
        this.getActiveManager = getActiveManager;
    }
    get activeMode() {
        return this.getActiveManager().activeMode;
    }
    get activeController() {
        return this.getActiveManager().activeController;
    }
    register(mode, control) {
        this.getActiveManager().register(mode, control);
    }
    unregister(mode) {
        return this.getActiveManager().unregister(mode);
    }
    setMode(mode) {
        this.getActiveManager().setMode(mode);
    }
    getController(mode) {
        return this.getActiveManager().getController(mode);
    }
    setInputActive(active) {
        this.getActiveManager().setInputActive(active);
    }
    update(frame) {
        this.getActiveManager().update(frame);
    }
    dispose() {}
}
export { ActiveViewControlManagerFacade };
