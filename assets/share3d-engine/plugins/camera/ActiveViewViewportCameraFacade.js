class ActiveViewViewportCameraFacade {
    constructor(getActiveViewport){
        this.getActiveViewport = getActiveViewport;
    }
    get perspectiveCamera() {
        return this.getActiveViewport().perspectiveCamera;
    }
    get orthographicCamera() {
        return this.getActiveViewport().orthographicCamera;
    }
    getActiveCamera() {
        return this.getActiveViewport().getActiveCamera();
    }
    getPerspectiveCamera() {
        return this.getActiveViewport().getPerspectiveCamera();
    }
    getOrthographicCamera() {
        return this.getActiveViewport().getOrthographicCamera();
    }
    syncFromRig(state, near, far, viewport) {
        this.getActiveViewport().syncFromRig(state, near, far, viewport);
    }
    dispose() {}
}
export { ActiveViewViewportCameraFacade };
