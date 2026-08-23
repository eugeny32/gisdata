import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__ from "../../shared/constants/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_30373853__ from "../../shared/types/core.js";
import * as __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__ from "./NativeControlUtils.js";
const WORLD_UP = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 1);
const LEGACY_ROTATION_SPEED = 200;
const DRAG_TRANSLATION_SCALE = 100;
const DRAG_TRANSLATION_SPEED_MULTIPLIER = 4;
const FADE_FACTOR = 50;
const MIN_SPEED = 0.1;
const DOUBLE_CLICK_FOCUS_RATIO = 0.2;
const DOUBLE_CLICK_MIN_DISTANCE = 0.2;
const DOUBLE_CLICK_DURATION_MS = 600;
const MIN_PITCH = -Math.PI / 2;
const MAX_PITCH = Math.PI / 2;
const FIRST_PERSON_ACTIVATION_TRANSITION_MS = 180;
const UP_ALIGNMENT_EPSILON = 1e-3;
class LegacyFirstPersonController extends __WEBPACK_EXTERNAL_MODULE_three__.Controls {
    constructor(options){
        const camera = (0, __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.syncViewportCameraFromRig)(options.services);
        super(camera, null), this.movementSpeed = __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.FIRST_PERSON_MOVEMENT_SPEED, this.lookSpeed = __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.FIRST_PERSON_LOOK_SPEED, this.lockElevation = false, this.disableRotation = false, this.services = null, this.translationDelta = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(), this.translationWorldDelta = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(), this.keyState = new Set(), this.activePointerId = null, this.activeDragButton = null, this.lastPointerScreen = null, this.yawDelta = 0, this.pitchDelta = 0, this.activationToken = 0, this.isActivating = false, this.boundPointerDown = null, this.boundPointerMove = null, this.boundPointerUp = null, this.boundWheel = null, this.boundContextMenu = null, this.boundKeyDown = null, this.boundKeyUp = null, this.boundDoubleClick = null;
        this.services = options.services;
        this.enabled = false;
    }
    connect(element) {
        if (!this.services) return;
        if (this.services.rig.mode !== __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_30373853__.CameraMode.Perspective) {
            const state = this.services.rig.getState();
            this.services.rig.setState({
                ...state,
                mode: __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_30373853__.CameraMode.Perspective
            });
        }
        const camera = this.syncFromRig();
        super.connect(element);
        this.installEventHandlers(element);
        camera.lookAt(this.services.rig.target);
        camera.updateMatrixWorld(true);
        this.beginActivationTransition();
    }
    disconnect() {
        this.activationToken += 1;
        this.isActivating = false;
        this.removeEventHandlers();
        this.stop();
    }
    dispose() {
        this.disconnect();
    }
    update(delta) {
        if (!this.enabled || !this.services) return;
        const previous = this.services.rig.getState();
        const camera = this.syncFromRig();
        camera.updateMatrixWorld(true);
        if (this.isActivating) return;
        const currentForward = previous.target.clone().sub(previous.position);
        const lookDistance = Math.max(currentForward.length(), 1);
        if (currentForward.lengthSq() < 1e-8) camera.getWorldDirection(currentForward);
        currentForward.normalize();
        let { yaw, pitch } = this.directionToYawPitch(currentForward);
        if (!this.disableRotation) {
            yaw -= this.yawDelta * delta;
            pitch = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.clamp(pitch - this.pitchDelta * delta, MIN_PITCH, MAX_PITCH);
        }
        const nextForward = this.yawPitchToDirection(yaw, pitch);
        const side = this.yawToSide(yaw);
        const screenUp = side.clone().cross(nextForward).normalize();
        const movement = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        this.accumulateKeyboardMovement(nextForward, side, WORLD_UP, movement);
        movement.addScaledVector(side, this.translationDelta.x * delta);
        movement.addScaledVector(nextForward, this.translationDelta.y * delta);
        movement.addScaledVector(screenUp, this.translationDelta.z * delta);
        movement.addScaledVector(WORLD_UP, this.translationWorldDelta.z * delta);
        const nextPosition = previous.position.clone().add(movement);
        const nextTarget = nextPosition.clone().addScaledVector(nextForward, lookDistance);
        this.services.rig.setState({
            ...previous,
            position: nextPosition,
            target: nextTarget,
            up: screenUp,
            mode: __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_30373853__.CameraMode.Perspective
        });
        const syncedCamera = this.syncFromRig();
        syncedCamera.updateMatrixWorld(true);
        const attenuation = Math.exp(-FADE_FACTOR * delta);
        this.yawDelta *= attenuation;
        this.pitchDelta *= attenuation;
        this.translationDelta.multiplyScalar(attenuation);
        this.translationWorldDelta.multiplyScalar(attenuation);
    }
    stop() {
        this.yawDelta = 0;
        this.pitchDelta = 0;
        this.translationDelta.set(0, 0, 0);
        this.translationWorldDelta.set(0, 0, 0);
        this.keyState.clear();
        this.activePointerId = null;
        this.activeDragButton = null;
        this.lastPointerScreen = null;
    }
    syncFromRig() {
        if (!this.services) return this.object;
        const camera = (0, __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.syncViewportCameraFromRig)(this.services);
        if (this.object !== camera) this.object = camera;
        return camera;
    }
    installEventHandlers(element) {
        this.removeEventHandlers();
        this.boundPointerDown = (event)=>{
            if (!this.enabled || this.isActivating || 0 !== event.button && 2 !== event.button) return;
            element.focus();
            this.activePointerId = event.pointerId;
            this.activeDragButton = event.button;
            this.lastPointerScreen = new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(event.clientX, event.clientY);
            event.preventDefault();
            if ('function' == typeof element.setPointerCapture) element.setPointerCapture(event.pointerId);
        };
        this.boundPointerMove = (event)=>{
            if (!this.enabled || this.isActivating || this.activePointerId !== event.pointerId || !this.lastPointerScreen || null === this.activeDragButton) return;
            const current = new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(event.clientX, event.clientY);
            const delta = current.clone().sub(this.lastPointerScreen);
            this.lastPointerScreen.copy(current);
            if (0 === delta.lengthSq()) return;
            const width = Math.max(element.clientWidth, 1);
            const height = Math.max(element.clientHeight, 1);
            const dragX = delta.x / width;
            const dragY = delta.y / height;
            if (0 === this.activeDragButton) {
                if (this.disableRotation) return;
                this.yawDelta += dragX * LEGACY_ROTATION_SPEED;
                this.pitchDelta += dragY * LEGACY_ROTATION_SPEED;
            } else if (2 === this.activeDragButton) {
                const dragTranslationSpeed = this.movementSpeed * DRAG_TRANSLATION_SPEED_MULTIPLIER;
                this.translationDelta.x -= dragX * dragTranslationSpeed * DRAG_TRANSLATION_SCALE;
                this.translationDelta.z += dragY * dragTranslationSpeed * DRAG_TRANSLATION_SCALE;
            }
            event.preventDefault();
        };
        this.boundPointerUp = (event)=>{
            if (this.activePointerId !== event.pointerId) return;
            event.preventDefault();
            this.activePointerId = null;
            this.activeDragButton = null;
            this.lastPointerScreen = null;
            if ('function' == typeof element.releasePointerCapture) element.releasePointerCapture(event.pointerId);
        };
        this.boundWheel = (event)=>{
            if (!this.enabled || this.isActivating) return;
            if (event.deltaY < 0) this.movementSpeed /= 0.9;
            else if (event.deltaY > 0) this.movementSpeed *= 0.9;
            this.movementSpeed = Math.max(this.movementSpeed, MIN_SPEED);
            event.preventDefault();
        };
        this.boundContextMenu = (event)=>{
            if (!this.enabled) return;
            event.preventDefault();
        };
        this.boundKeyDown = (event)=>{
            if (!this.enabled || this.isActivating) return;
            this.keyState.add(event.code);
        };
        this.boundKeyUp = (event)=>{
            this.keyState.delete(event.code);
        };
        this.boundDoubleClick = (event)=>{
            if (!this.enabled || event.defaultPrevented) return;
            const pivot = this.pickPoint(event);
            if (!pivot) return;
            this.focusOnPoint(pivot);
            event.preventDefault();
        };
        element.addEventListener('pointerdown', this.boundPointerDown);
        element.addEventListener('pointermove', this.boundPointerMove);
        element.addEventListener('pointerup', this.boundPointerUp);
        element.addEventListener('pointercancel', this.boundPointerUp);
        element.addEventListener('wheel', this.boundWheel, {
            passive: false
        });
        element.addEventListener('contextmenu', this.boundContextMenu);
        element.addEventListener('dblclick', this.boundDoubleClick);
        window.addEventListener('keydown', this.boundKeyDown);
        window.addEventListener('keyup', this.boundKeyUp);
    }
    removeEventHandlers() {
        if (!this.domElement) return;
        if (this.boundPointerDown) {
            this.domElement.removeEventListener('pointerdown', this.boundPointerDown);
            this.boundPointerDown = null;
        }
        if (this.boundPointerMove) {
            this.domElement.removeEventListener('pointermove', this.boundPointerMove);
            this.boundPointerMove = null;
        }
        if (this.boundPointerUp) {
            this.domElement.removeEventListener('pointerup', this.boundPointerUp);
            this.domElement.removeEventListener('pointercancel', this.boundPointerUp);
            this.boundPointerUp = null;
        }
        if (this.boundWheel) {
            this.domElement.removeEventListener('wheel', this.boundWheel);
            this.boundWheel = null;
        }
        if (this.boundContextMenu) {
            this.domElement.removeEventListener('contextmenu', this.boundContextMenu);
            this.boundContextMenu = null;
        }
        if (this.boundDoubleClick) {
            this.domElement.removeEventListener('dblclick', this.boundDoubleClick);
            this.boundDoubleClick = null;
        }
        if (this.boundKeyDown) {
            window.removeEventListener('keydown', this.boundKeyDown);
            this.boundKeyDown = null;
        }
        if (this.boundKeyUp) {
            window.removeEventListener('keyup', this.boundKeyUp);
            this.boundKeyUp = null;
        }
        this.stop();
    }
    accumulateKeyboardMovement(forward, side, worldUp, out) {
        const moveSpeed = this.movementSpeed;
        const moveForward = this.keyState.has('KeyW') || this.keyState.has('ArrowUp');
        const moveBackward = this.keyState.has('KeyS') || this.keyState.has('ArrowDown');
        const moveLeft = this.keyState.has('KeyA') || this.keyState.has('ArrowLeft');
        const moveRight = this.keyState.has('KeyD') || this.keyState.has('ArrowRight');
        const moveUp = this.keyState.has('KeyQ') || this.keyState.has('PageUp');
        const moveDown = this.keyState.has('KeyE') || this.keyState.has('PageDown');
        const projectedForward = forward.clone();
        if (this.lockElevation) {
            projectedForward.z = 0;
            if (projectedForward.lengthSq() > 1e-8) projectedForward.normalize();
            else projectedForward.copy(forward);
        }
        if (moveForward !== moveBackward) out.addScaledVector(projectedForward, moveForward ? moveSpeed : -moveSpeed);
        if (moveLeft !== moveRight) out.addScaledVector(side, moveRight ? moveSpeed : -moveSpeed);
        if (moveUp !== moveDown) out.addScaledVector(worldUp, moveUp ? moveSpeed : -moveSpeed);
    }
    directionToYawPitch(direction) {
        if (Math.abs(direction.x) < 1e-8 && Math.abs(direction.y) < 1e-8) return {
            yaw: 0,
            pitch: Math.PI / 2 * Math.sign(direction.z || 1)
        };
        return {
            yaw: Math.atan2(direction.y, direction.x) - Math.PI / 2,
            pitch: Math.atan2(direction.z, Math.sqrt(direction.x * direction.x + direction.y * direction.y))
        };
    }
    yawPitchToDirection(yaw, pitch) {
        return new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 1, 0).applyAxisAngle(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1, 0, 0), pitch).applyAxisAngle(WORLD_UP, yaw).normalize();
    }
    yawToSide(yaw) {
        return new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1, 0, 0).applyAxisAngle(WORLD_UP, yaw).normalize();
    }
    pickPoint(event) {
        if (!this.services?.surfaceQuery || !this.domElement) return null;
        const screen = new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(event.clientX, event.clientY);
        const camera = this.syncFromRig();
        const result = this.services.surfaceQuery.queryAtScreen(screen, camera, {
            kinds: [
                'pointCloud',
                'gaussian-splat'
            ],
            interactionType: 'click'
        });
        return result?.point.clone() ?? null;
    }
    async focusOnPoint(point) {
        if (!this.services) return;
        const previous = this.services.rig.getState();
        const direction = previous.target.clone().sub(previous.position).normalize();
        const distanceToPoint = Math.max(previous.position.distanceTo(point), 1e-6);
        const focusDistance = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.clamp(distanceToPoint * DOUBLE_CLICK_FOCUS_RATIO, DOUBLE_CLICK_MIN_DISTANCE, distanceToPoint);
        const nextPosition = point.clone().addScaledVector(direction, -focusDistance);
        await this.services.rig.animateTo({
            position: nextPosition,
            target: point.clone(),
            up: previous.up.clone(),
            mode: __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_30373853__.CameraMode.Perspective
        }, DOUBLE_CLICK_DURATION_MS);
    }
    async beginActivationTransition() {
        if (!this.services) return;
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
        this.stop();
        await this.services.rig.animateTo({
            up: desiredUp,
            mode: __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_30373853__.CameraMode.Perspective
        }, FIRST_PERSON_ACTIVATION_TRANSITION_MS);
        if (this.activationToken !== token) return;
        this.isActivating = false;
    }
}
const LegacyFirstPersonController_rslib_entry_ = LegacyFirstPersonController;
export { LegacyFirstPersonController, LegacyFirstPersonController_rslib_entry_ as default };
