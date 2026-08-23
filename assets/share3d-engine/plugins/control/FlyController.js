import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE_three_addons_controls_FlyControls_js_3c48326b__ from "three/addons/controls/FlyControls.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__ from "../../shared/constants/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_30373853__ from "../../shared/types/core.js";
const THREE_FLY_ROLL_SPEED_MULTIPLIER = 10;
class FlyController extends __WEBPACK_EXTERNAL_MODULE_three_addons_controls_FlyControls_js_3c48326b__.FlyControls {
    constructor(options){
        const camera = new __WEBPACK_EXTERNAL_MODULE_three__.PerspectiveCamera();
        super(camera);
        this.services = options.services;
        this.controlCamera = camera;
        this.enabled = false;
        this.dragToLook = false;
        this.autoForward = false;
        this.movementSpeed = __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.FIRST_PERSON_MOVEMENT_SPEED;
        this.rollSpeed = __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.FIRST_PERSON_LOOK_SPEED * THREE_FLY_ROLL_SPEED_MULTIPLIER;
    }
    connect(element) {
        if (this.services.rig.mode !== __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_30373853__.CameraMode.Perspective) {
            const state = this.services.rig.getState();
            this.services.rig.setState({
                ...state,
                mode: __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_30373853__.CameraMode.Perspective
            });
        }
        this.syncProxyFromRig();
        super.connect(element);
        this.controlCamera.updateMatrixWorld(true);
    }
    update(delta) {
        if (!this.enabled) return;
        this.syncProxyFromRig();
        super.update(delta);
        this.controlCamera.updateMatrixWorld(true);
        this.syncRigFromProxy();
    }
    dispose() {
        if (this.domElement) super.dispose();
    }
    syncProxyFromRig() {
        const state = this.services.rig.getState();
        this.controlCamera.position.copy(state.position);
        this.controlCamera.up.copy(state.up);
        this.controlCamera.fov = state.fov;
        this.controlCamera.near = this.services.rig.near;
        this.controlCamera.far = this.services.rig.far;
        this.controlCamera.lookAt(state.target);
        this.controlCamera.updateProjectionMatrix();
        this.controlCamera.updateMatrixWorld(true);
    }
    syncRigFromProxy() {
        const previous = this.services.rig.getState();
        const direction = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        this.controlCamera.getWorldDirection(direction);
        const distance = Math.max(previous.position.distanceTo(previous.target), 1);
        const target = this.controlCamera.position.clone().addScaledVector(direction, distance);
        const up = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 1, 0).applyQuaternion(this.controlCamera.quaternion).normalize();
        this.services.rig.setState({
            ...previous,
            position: this.controlCamera.position.clone(),
            target,
            up,
            fov: this.controlCamera.fov,
            mode: __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_30373853__.CameraMode.Perspective
        });
    }
}
const FlyController_rslib_entry_ = FlyController;
export { FlyController, FlyController_rslib_entry_ as default };
