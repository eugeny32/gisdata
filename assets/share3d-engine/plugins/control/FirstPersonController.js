import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE_three_addons_controls_FirstPersonControls_js_d1d4b2bf__ from "three/addons/controls/FirstPersonControls.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__ from "../../shared/constants/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_30373853__ from "../../shared/types/core.js";
import * as __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__ from "./NativeControlUtils.js";
const THREE_FIRST_PERSON_LOOK_SPEED_MULTIPLIER = 10;
const CONTROL_UP = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 1, 0);
const ENGINE_TO_CONTROL_ROTATION = new __WEBPACK_EXTERNAL_MODULE_three__.Quaternion().setFromAxisAngle(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1, 0, 0), -Math.PI / 2);
const CONTROL_TO_ENGINE_ROTATION = ENGINE_TO_CONTROL_ROTATION.clone().invert();
const FIRST_PERSON_ACTIVATION_TRANSITION_MS = 180;
const UP_ALIGNMENT_EPSILON = 1e-3;
class FirstPersonController extends __WEBPACK_EXTERNAL_MODULE_three_addons_controls_FirstPersonControls_js_d1d4b2bf__.FirstPersonControls {
    constructor(options){
        const camera = new __WEBPACK_EXTERNAL_MODULE_three__.PerspectiveCamera();
        super(camera), this.activationToken = 0, this.isActivating = false;
        this.services = options.services;
        this.controlCamera = camera;
        this.enabled = false;
        this.movementSpeed = __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.FIRST_PERSON_MOVEMENT_SPEED;
        this.lookSpeed = __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.FIRST_PERSON_LOOK_SPEED * THREE_FIRST_PERSON_LOOK_SPEED_MULTIPLIER;
        this.lookVertical = true;
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
        this.handleResize();
        this.controlCamera.updateMatrixWorld(true);
        this.beginActivationTransition();
    }
    update(delta) {
        if (!this.enabled) return;
        this.syncProxyFromRig();
        if (this.isActivating) {
            this.controlCamera.updateMatrixWorld(true);
            return;
        }
        super.update(delta);
        const direction = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        this.controlCamera.getWorldDirection(direction);
        this.controlCamera.updateMatrixWorld(true);
        this.syncRigFromProxy(direction);
    }
    dispose() {
        this.activationToken += 1;
        this.isActivating = false;
        if (this.domElement) super.dispose();
    }
    syncProxyFromRig() {
        const state = this.services.rig.getState();
        const controlPosition = this.engineToControl(state.position);
        const controlTarget = this.engineToControl(state.target);
        this.controlCamera.position.copy(controlPosition);
        this.controlCamera.up.copy(CONTROL_UP);
        this.controlCamera.fov = state.fov;
        this.controlCamera.near = this.services.rig.near;
        this.controlCamera.far = this.services.rig.far;
        this.controlCamera.lookAt(controlTarget);
        this.controlCamera.updateProjectionMatrix();
        this.controlCamera.updateMatrixWorld(true);
        this.lookAt(controlTarget);
    }
    syncRigFromProxy(controlDirection) {
        const previous = this.services.rig.getState();
        const distance = Math.max(previous.position.distanceTo(previous.target), 1);
        const enginePosition = this.controlToEngine(this.controlCamera.position);
        const engineDirection = this.controlToEngineDirection(controlDirection);
        const target = enginePosition.clone().addScaledVector(engineDirection, distance);
        const up = (0, __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.computeRollFreeUp)(engineDirection);
        this.services.rig.setState({
            ...previous,
            position: enginePosition,
            target,
            up,
            fov: this.controlCamera.fov,
            mode: __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_30373853__.CameraMode.Perspective
        });
    }
    async beginActivationTransition() {
        const state = this.services.rig.getState();
        const forward = state.target.clone().sub(state.position);
        if (forward.lengthSq() < 1e-8) {
            this.isActivating = false;
            return;
        }
        const desiredUp = (0, __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.computeRollFreeUp)(forward);
        if (desiredUp.angleTo(state.up) <= UP_ALIGNMENT_EPSILON) {
            this.isActivating = false;
            return;
        }
        const token = ++this.activationToken;
        this.isActivating = true;
        await this.services.rig.animateTo({
            up: desiredUp,
            mode: __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_30373853__.CameraMode.Perspective
        }, FIRST_PERSON_ACTIVATION_TRANSITION_MS);
        if (this.activationToken !== token) return;
        this.isActivating = false;
        this.syncProxyFromRig();
    }
    engineToControl(vector) {
        return vector.clone().applyQuaternion(ENGINE_TO_CONTROL_ROTATION);
    }
    controlToEngine(vector) {
        return vector.clone().applyQuaternion(CONTROL_TO_ENGINE_ROTATION);
    }
    controlToEngineDirection(vector) {
        return this.controlToEngine(vector).normalize();
    }
}
export { FirstPersonController };
