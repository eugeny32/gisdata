import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__ from "../../shared/constants/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_30373853__ from "../../shared/types/core.js";
import * as __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__ from "./NativeControlUtils.js";
const DEFAULT_LOOK_SENSITIVITY = 0.003;
const DEFAULT_PAN_PIXEL_RATIO = 0.002;
const DEFAULT_PINCH_PIXEL_RATIO = 0.01;
const DEFAULT_WHEEL_STEP_RATIO = 0.2;
const MIN_PITCH = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.degToRad(-85);
const MAX_PITCH = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.degToRad(85);
const MIN_TARGET_DISTANCE = 0.1;
const DOUBLE_CLICK_FOCUS_RATIO = 0.2;
const DOUBLE_CLICK_MIN_DISTANCE = 0.2;
const DOUBLE_CLICK_DURATION_MS = 300;
const ROTATION_MOMENTUM_MIN_SPEED = 0.002;
const ROTATION_MOMENTUM_MAX_SAMPLE_AGE_MS = 80;
const ROTATION_MOMENTUM_HALF_LIFE_SECONDS = Math.max(__WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.CONTROL_DAMPING_FACTOR, 0.05);
const MOVEMENT_KEYS = new Set([
    'KeyW',
    'KeyA',
    'KeyS',
    'KeyD',
    'KeyQ',
    'KeyE'
]);
class CameraFreeLookController extends __WEBPACK_EXTERNAL_MODULE_three__.Controls {
    constructor(options){
        super(new __WEBPACK_EXTERNAL_MODULE_three__.PerspectiveCamera(), null), this.activePointers = new Map(), this.pointerButtons = new Map(), this.keyState = new Set(), this.externalMoveInput = {
            forward: 0,
            right: 0,
            up: 0
        }, this.externalLookInput = {
            yaw: 0,
            pitch: 0
        }, this.collisionResolver = null, this.lastSinglePointer = null, this.lastTwoPointerGesture = null, this.yaw = 0, this.pitch = 0, this.targetDistance = 1, this.connected = false, this.externalMoveInputActive = false, this.externalLookInputActive = false, this.rotationMomentumYawVelocity = 0, this.rotationMomentumPitchVelocity = 0, this.lastRotationSampleAt = 0, this.handlePointerDownBound = (event)=>this.handlePointerDown(event), this.handlePointerMoveBound = (event)=>this.handlePointerMove(event), this.handlePointerUpBound = (event)=>this.handlePointerUp(event), this.handleWheelBound = (event)=>this.handleWheel(event), this.handleDoubleClickBound = (event)=>this.handleDoubleClick(event), this.handleContextMenuBound = (event)=>this.handleContextMenu(event), this.handleKeyDownBound = (event)=>this.handleKeyDown(event), this.handleKeyUpBound = (event)=>this.handleKeyUp(event), this.lookSensitivity = DEFAULT_LOOK_SENSITIVITY, this.externalLookSpeed = 1.2, this.panPixelRatio = DEFAULT_PAN_PIXEL_RATIO, this.pinchPixelRatio = DEFAULT_PINCH_PIXEL_RATIO, this.movementSpeed = __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.FIRST_PERSON_MOVEMENT_SPEED;
        this.services = options.services;
        this.panPixelRatio = resolvePanPixelRatio(options.panPixelRatio, DEFAULT_PAN_PIXEL_RATIO);
        this.enabled = false;
    }
    connect(element) {
        if (this.connected) return;
        if (this.services.rig.mode !== __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_30373853__.CameraMode.Perspective) this.services.rig.setState({
            ...this.services.rig.getState(),
            mode: __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_30373853__.CameraMode.Perspective
        });
        super.connect(element);
        this.connected = true;
        this.syncAnglesFromRig();
        element.addEventListener('pointerdown', this.handlePointerDownBound, {
            passive: false
        });
        element.addEventListener('pointermove', this.handlePointerMoveBound, {
            passive: false
        });
        element.addEventListener('pointerup', this.handlePointerUpBound, {
            passive: false
        });
        element.addEventListener('pointercancel', this.handlePointerUpBound, {
            passive: false
        });
        element.addEventListener('wheel', this.handleWheelBound, {
            passive: false
        });
        element.addEventListener('dblclick', this.handleDoubleClickBound);
        element.addEventListener('contextmenu', this.handleContextMenuBound);
        window.addEventListener('keydown', this.handleKeyDownBound, true);
        window.addEventListener('keyup', this.handleKeyUpBound, true);
    }
    disconnect() {
        if (!this.connected) return;
        const element = this.domElement;
        element?.removeEventListener('pointerdown', this.handlePointerDownBound);
        element?.removeEventListener('pointermove', this.handlePointerMoveBound);
        element?.removeEventListener('pointerup', this.handlePointerUpBound);
        element?.removeEventListener('pointercancel', this.handlePointerUpBound);
        element?.removeEventListener('wheel', this.handleWheelBound);
        element?.removeEventListener('dblclick', this.handleDoubleClickBound);
        element?.removeEventListener('contextmenu', this.handleContextMenuBound);
        window.removeEventListener('keydown', this.handleKeyDownBound, true);
        window.removeEventListener('keyup', this.handleKeyUpBound, true);
        this.connected = false;
        this.resetTransientInput();
        super.disconnect();
    }
    dispose() {
        this.disconnect();
    }
    setExternalMoveInput(input) {
        const forward = clampAxis(input?.forward ?? 0);
        const right = clampAxis(input?.right ?? 0);
        const up = clampAxis(input?.up ?? 0);
        const nextActive = 0 !== forward || 0 !== right || 0 !== up;
        if (nextActive && !this.externalMoveInputActive) this.syncAnglesFromRig();
        this.externalMoveInput.forward = forward;
        this.externalMoveInput.right = right;
        this.externalMoveInput.up = up;
        this.externalMoveInputActive = nextActive;
    }
    setExternalLookInput(input) {
        const yaw = clampAxis(input?.yaw ?? 0);
        const pitch = clampAxis(input?.pitch ?? 0);
        const nextActive = 0 !== yaw || 0 !== pitch;
        if (nextActive && !this.externalLookInputActive) this.syncAnglesFromRig();
        if (nextActive) this.stopRotationMomentum();
        this.externalLookInput.yaw = yaw;
        this.externalLookInput.pitch = pitch;
        this.externalLookInputActive = nextActive;
    }
    setCollisionResolver(resolver) {
        this.collisionResolver = resolver;
    }
    syncFromCamera() {
        this.stopRotationMomentum();
        this.syncAnglesFromRig();
    }
    update(delta) {
        if (!this.enabled || delta <= 0) return;
        this.updateRotationMomentum(delta);
        this.applyExternalLookInput(delta);
        const move = this.resolveKeyboardMoveVector();
        if (move.lengthSq() > 0) {
            move.clampLength(0, 1).multiplyScalar(this.movementSpeed * delta);
            this.translateCamera(move);
        }
    }
    handlePointerDown(event) {
        if (!this.enabled || 0 !== event.button && 2 !== event.button) return;
        this.stopRotationMomentum();
        if (0 === this.activePointers.size) this.syncAnglesFromRig();
        this.domElement?.focus();
        this.activePointers.set(event.pointerId, new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(event.clientX, event.clientY));
        this.pointerButtons.set(event.pointerId, event.button);
        this.resetGestureSnapshots();
        this.domElement?.setPointerCapture?.(event.pointerId);
        event.preventDefault();
    }
    handlePointerMove(event) {
        if (!this.enabled || !this.activePointers.has(event.pointerId)) return;
        this.activePointers.set(event.pointerId, new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(event.clientX, event.clientY));
        if (1 === this.activePointers.size) this.applySinglePointerGesture(event.pointerId);
        else this.applyTwoPointerGesture();
        event.preventDefault();
    }
    handlePointerUp(event) {
        const button = this.pointerButtons.get(event.pointerId);
        if (!this.activePointers.delete(event.pointerId)) return;
        this.pointerButtons.delete(event.pointerId);
        this.domElement?.releasePointerCapture?.(event.pointerId);
        this.resetGestureSnapshots();
        if (0 === button && 0 === this.activePointers.size) this.startRotationMomentum();
        event.preventDefault();
    }
    handleWheel(event) {
        if (!this.enabled) return;
        const wheelDelta = -Math.sign(event.deltaY);
        if (0 === wheelDelta) return;
        this.stopRotationMomentum();
        this.syncAnglesFromRig();
        const navigationScale = (0, __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.resolveNavigationScale)({
            cameraTargetDistance: this.targetDistance,
            sceneBounds: null
        });
        const distance = (0, __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.resolveWheelForwardStep)({
            cameraTargetDistance: this.targetDistance,
            wheelDelta,
            proportionalStepRatio: DEFAULT_WHEEL_STEP_RATIO,
            navigationScale,
            minStepRatio: __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.DEFAULT_WHEEL_MIN_STEP_RATIO,
            absoluteMinStep: __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.DEFAULT_WHEEL_ABSOLUTE_MIN_STEP
        });
        this.moveCameraForward(distance);
        event.preventDefault();
    }
    handleDoubleClick(event) {
        if (!this.enabled || event.defaultPrevented || !this.services.surfaceQuery) return;
        const camera = (0, __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.syncViewportCameraFromRig)(this.services);
        const hit = this.services.surfaceQuery.queryAtScreen(new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(event.clientX, event.clientY), camera, {
            kinds: [
                'pointCloud',
                'gaussian-splat'
            ],
            interactionType: 'click'
        });
        if (!hit) return;
        this.stopRotationMomentum();
        this.focusOnPoint(hit.point);
        event.preventDefault();
    }
    handleContextMenu(event) {
        if (!this.enabled) return;
        event.preventDefault();
    }
    handleKeyDown(event) {
        if (!this.enabled || !MOVEMENT_KEYS.has(event.code)) return;
        if (0 === this.keyState.size) this.syncAnglesFromRig();
        this.keyState.add(event.code);
        event.preventDefault();
    }
    handleKeyUp(event) {
        if (!this.enabled || !MOVEMENT_KEYS.has(event.code)) return;
        this.keyState.delete(event.code);
        event.preventDefault();
    }
    applySinglePointerGesture(pointerId) {
        const pointer = this.activePointers.values().next().value;
        if (!pointer) return;
        if (this.lastSinglePointer) {
            const delta = pointer.clone().sub(this.lastSinglePointer);
            if (2 === this.pointerButtons.get(pointerId)) this.panCamera(delta);
            else this.rotateCamera(delta);
        }
        this.lastSinglePointer = pointer.clone();
        this.lastTwoPointerGesture = null;
    }
    applyTwoPointerGesture() {
        const gesture = this.resolveTwoPointerGesture();
        if (!gesture) return;
        if (this.lastTwoPointerGesture) {
            const deltaCentroid = gesture.centroid.clone().sub(this.lastTwoPointerGesture.centroid);
            const deltaDistance = gesture.distance - this.lastTwoPointerGesture.distance;
            this.panCamera(deltaCentroid);
            this.moveCameraForward(deltaDistance * this.resolveDistanceScale() * this.pinchPixelRatio);
        }
        this.lastTwoPointerGesture = gesture;
        this.lastSinglePointer = null;
    }
    rotateCamera(delta) {
        const now = performance.now();
        const yawDelta = -delta.x * this.lookSensitivity;
        const pitchDelta = -delta.y * this.lookSensitivity;
        const elapsedSeconds = (now - this.lastRotationSampleAt) / 1000;
        if (this.lastRotationSampleAt > 0 && elapsedSeconds > 0 && elapsedSeconds < ROTATION_MOMENTUM_MAX_SAMPLE_AGE_MS / 1000) {
            this.rotationMomentumYawVelocity = yawDelta / elapsedSeconds;
            this.rotationMomentumPitchVelocity = pitchDelta / elapsedSeconds;
        }
        this.lastRotationSampleAt = now;
        this.applyRotationDelta(yawDelta, pitchDelta);
    }
    applyRotationDelta(yawDelta, pitchDelta) {
        this.yaw += yawDelta;
        this.pitch = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.clamp(this.pitch + pitchDelta, MIN_PITCH, MAX_PITCH);
        this.applyPoseFromAngles();
    }
    applyExternalLookInput(delta) {
        const yawAxis = this.externalLookInput.yaw;
        const pitchAxis = this.externalLookInput.pitch;
        if (0 === yawAxis && 0 === pitchAxis) return;
        this.yaw -= yawAxis * this.externalLookSpeed * delta;
        this.pitch = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.clamp(this.pitch - pitchAxis * this.externalLookSpeed * delta, MIN_PITCH, MAX_PITCH);
        this.applyPoseFromAngles();
    }
    panCamera(delta) {
        const axes = this.resolveCameraAxes();
        const scale = this.resolveDistanceScale() * this.panPixelRatio;
        const translation = axes.right.multiplyScalar(-delta.x * scale).add(axes.up.multiplyScalar(delta.y * scale));
        this.translateCamera(translation);
    }
    moveCameraForward(distance) {
        if (0 === distance) return;
        this.translateCamera(this.resolveForward().multiplyScalar(distance));
    }
    async focusOnPoint(point) {
        const previous = this.services.rig.getState();
        const forward = previous.target.clone().sub(previous.position);
        if (forward.lengthSq() <= 1e-12) return;
        forward.normalize();
        const distanceToPoint = Math.max(previous.position.distanceTo(point), 1e-6);
        const focusDistance = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.clamp(distanceToPoint * DOUBLE_CLICK_FOCUS_RATIO, DOUBLE_CLICK_MIN_DISTANCE, distanceToPoint);
        const nextPosition = point.clone().addScaledVector(forward, -focusDistance);
        const translation = nextPosition.clone().sub(previous.position);
        const resolvedTranslation = this.resolveCollisionTranslation(previous, translation);
        const resolvedPosition = previous.position.clone().add(resolvedTranslation);
        await this.services.rig.animateTo({
            position: resolvedPosition,
            target: point.clone(),
            up: previous.up.clone(),
            mode: __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_30373853__.CameraMode.Perspective
        }, DOUBLE_CLICK_DURATION_MS, {
            easing: 'cubicInOut'
        });
        this.syncAnglesFromRig();
    }
    updateRotationMomentum(delta) {
        if (this.activePointers.size > 0 || !this.hasRotationMomentum()) return;
        const yawDelta = this.rotationMomentumYawVelocity * delta;
        const pitchDelta = this.rotationMomentumPitchVelocity * delta;
        this.applyRotationDelta(yawDelta, pitchDelta);
        const decay = 0.5 ** (delta / ROTATION_MOMENTUM_HALF_LIFE_SECONDS);
        this.rotationMomentumYawVelocity *= decay;
        this.rotationMomentumPitchVelocity *= decay;
        if (!this.hasRotationMomentum()) this.stopRotationMomentum();
    }
    startRotationMomentum() {
        if (performance.now() - this.lastRotationSampleAt > ROTATION_MOMENTUM_MAX_SAMPLE_AGE_MS || !this.hasRotationMomentum()) this.stopRotationMomentum();
    }
    hasRotationMomentum() {
        return Math.abs(this.rotationMomentumYawVelocity) > ROTATION_MOMENTUM_MIN_SPEED || Math.abs(this.rotationMomentumPitchVelocity) > ROTATION_MOMENTUM_MIN_SPEED;
    }
    stopRotationMomentum() {
        this.rotationMomentumYawVelocity = 0;
        this.rotationMomentumPitchVelocity = 0;
        this.lastRotationSampleAt = 0;
    }
    translateCamera(translation) {
        const state = this.services.rig.getState();
        const resolvedTranslation = this.resolveCollisionTranslation(state, translation);
        this.services.rig.setState({
            ...state,
            position: state.position.clone().add(resolvedTranslation),
            target: state.target.clone().add(resolvedTranslation),
            mode: __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_30373853__.CameraMode.Perspective
        });
    }
    resolveCollisionTranslation(state, translation) {
        if (!this.collisionResolver || translation.lengthSq() <= 0) return translation;
        const result = this.collisionResolver({
            position: state.position.clone(),
            target: state.target.clone(),
            up: state.up.clone(),
            translation: translation.clone()
        });
        if (result instanceof __WEBPACK_EXTERNAL_MODULE_three__.Vector3) return result.clone();
        if (result?.translation instanceof __WEBPACK_EXTERNAL_MODULE_three__.Vector3) return result.translation.clone();
        return translation;
    }
    applyPoseFromAngles() {
        const state = this.services.rig.getState();
        const forward = this.resolveForward();
        const distance = Math.max(this.targetDistance, MIN_TARGET_DISTANCE);
        this.services.rig.setState({
            ...state,
            target: state.position.clone().addScaledVector(forward, distance),
            up: (0, __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.computeRollFreeUp)(forward),
            mode: __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_30373853__.CameraMode.Perspective
        });
    }
    resolveKeyboardMoveVector() {
        const axes = this.resolveCameraAxes();
        const forwardAxis = clampAxis(this.resolveAxis('KeyW', 'KeyS') + this.externalMoveInput.forward);
        const rightAxis = clampAxis(this.resolveAxis('KeyD', 'KeyA') + this.externalMoveInput.right);
        const upAxis = clampAxis(this.resolveAxis('KeyE', 'KeyQ') + this.externalMoveInput.up);
        return axes.forward.multiplyScalar(forwardAxis).add(axes.right.multiplyScalar(rightAxis)).add(axes.up.multiplyScalar(upAxis));
    }
    resolveAxis(positive, negative) {
        const hasPositive = this.keyState.has(positive);
        const hasNegative = this.keyState.has(negative);
        if (hasPositive === hasNegative) return 0;
        return hasPositive ? 1 : -1;
    }
    resolveCameraAxes() {
        const forward = this.resolveForward();
        const up = (0, __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.computeRollFreeUp)(forward);
        const right = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().crossVectors(forward, up).normalize();
        return {
            forward,
            right,
            up
        };
    }
    resolveForward() {
        const planar = Math.cos(this.pitch);
        return new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(Math.cos(this.yaw) * planar, Math.sin(this.yaw) * planar, Math.sin(this.pitch)).normalize();
    }
    resolveTwoPointerGesture() {
        const [first, second] = Array.from(this.activePointers.values());
        if (!first || !second) return null;
        return {
            centroid: first.clone().add(second).multiplyScalar(0.5),
            distance: first.distanceTo(second)
        };
    }
    syncAnglesFromRig() {
        const state = this.services.rig.getState();
        const forward = state.target.clone().sub(state.position);
        this.targetDistance = Math.max(forward.length(), MIN_TARGET_DISTANCE);
        if (forward.lengthSq() <= 1e-12) {
            this.yaw = 0;
            this.pitch = 0;
            return;
        }
        forward.normalize();
        this.yaw = Math.atan2(forward.y, forward.x);
        this.pitch = Math.asin(__WEBPACK_EXTERNAL_MODULE_three__.MathUtils.clamp(forward.z, -1, 1));
    }
    resolveDistanceScale() {
        return Math.max(this.targetDistance, 1);
    }
    resetGestureSnapshots() {
        if (1 === this.activePointers.size) {
            const pointer = this.activePointers.values().next().value;
            this.lastSinglePointer = pointer?.clone() ?? null;
            this.lastTwoPointerGesture = null;
            return;
        }
        this.lastSinglePointer = null;
        this.lastTwoPointerGesture = this.resolveTwoPointerGesture();
    }
    resetTransientInput() {
        this.activePointers.clear();
        this.pointerButtons.clear();
        this.keyState.clear();
        this.setExternalMoveInput(null);
        this.setExternalLookInput(null);
        this.setCollisionResolver(null);
        this.stopRotationMomentum();
        this.lastSinglePointer = null;
        this.lastTwoPointerGesture = null;
    }
}
function clampAxis(value) {
    if (!Number.isFinite(value)) return 0;
    return __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.clamp(value, -1, 1);
}
function resolvePanPixelRatio(value, fallback) {
    if (void 0 === value || !Number.isFinite(value) || value < 0) return fallback;
    return value;
}
const CameraFreeLookController_rslib_entry_ = CameraFreeLookController;
export { CameraFreeLookController, CameraFreeLookController_rslib_entry_ as default };
