class ActiveViewCameraRigFacade {
    constructor(getActiveRig){
        this.getActiveRig = getActiveRig;
    }
    get mode() {
        return this.getActiveRig().mode;
    }
    get position() {
        return this.getActiveRig().position;
    }
    set position(value) {
        this.getActiveRig().position = value;
    }
    get target() {
        return this.getActiveRig().target;
    }
    set target(value) {
        this.getActiveRig().target = value;
    }
    get up() {
        return this.getActiveRig().up;
    }
    get fov() {
        return this.getActiveRig().fov;
    }
    set fov(value) {
        this.getActiveRig().fov = value;
    }
    get zoom() {
        return this.getActiveRig().zoom;
    }
    set zoom(value) {
        this.getActiveRig().zoom = value;
    }
    get near() {
        return this.getActiveRig().near;
    }
    get far() {
        return this.getActiveRig().far;
    }
    get roll() {
        return this.getActiveRig().roll;
    }
    set roll(value) {
        this.getActiveRig().roll = value;
    }
    get isTransitioning() {
        return this.getActiveRig().isTransitioning;
    }
    setMode(mode) {
        this.getActiveRig().setMode(mode);
    }
    setTopDownOnPlane(origin, normal, up, distance) {
        this.getActiveRig().setTopDownOnPlane(origin, normal, up, distance);
    }
    updateNearFar(sceneBounds) {
        this.getActiveRig().updateNearFar(sceneBounds);
    }
    fitToBox(box, options) {
        this.getActiveRig().fitToBox(box, options);
    }
    setPresetView(preset) {
        this.getActiveRig().setPresetView(preset);
    }
    animateTo(state, duration, options) {
        return this.getActiveRig().animateTo(state, duration, options);
    }
    applyStatePatch(patch, options) {
        this.getActiveRig().applyStatePatch(patch, options);
    }
    cancelTransition() {
        this.getActiveRig().cancelTransition();
    }
    getState() {
        return this.getActiveRig().getState();
    }
    setState(state) {
        this.getActiveRig().setState(state);
    }
    dispose() {}
}
export { ActiveViewCameraRigFacade };
