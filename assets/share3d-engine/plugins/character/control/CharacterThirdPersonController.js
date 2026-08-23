import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__control_NativeControlUtils_js_7526c111__ from "../../control/NativeControlUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_c13864f0__ from "../../../shared/types/core.js";
import * as __WEBPACK_EXTERNAL_MODULE__characterControlUtils_js_278c5499__ from "./characterControlUtils.js";
const CHARACTER_THIRD_PERSON_INPUT_PRIORITY = 1000;
const MIN_CAMERA_OFFSET = 1e-4;
const BODY_ROTATION_SMOOTH_TIME = 0.12;
const MIN_SMOOTH_TIME = 1e-4;
class CharacterThirdPersonController extends __WEBPACK_EXTERNAL_MODULE_three__.Controls {
    constructor(options){
        super(new __WEBPACK_EXTERNAL_MODULE_three__.PerspectiveCamera(), null), this.keyState = new Set(), this.pendingOrbitDelta = new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(), this.collisionCamera = new __WEBPACK_EXTERNAL_MODULE_three__.PerspectiveCamera(), this.activeCharacterId = null, this.activePointerId = null, this.lastPointerScreen = null, this.orbitYaw = 0, this.orbitPitch = 0, this.bodyYaw = 0, this.bodyYawVelocity = 0, this.followDistance = 4.5, this.cameraDistance = null, this.pendingZoomDelta = 0, this.jumpQueued = false, this.connected = false;
        if (!options.services.viewId) throw new Error('CharacterThirdPersonController requires a bound viewId');
        this.services = options.services;
        this.characterService = options.characterService;
        this.viewEventRouter = options.viewEventRouter;
        this.onVisualInput = options.onVisualInput;
        this.viewId = options.services.viewId;
        this.enabled = false;
        this.consumer = {
            name: `character-third-person:${this.viewId}`,
            priority: CHARACTER_THIRD_PERSON_INPUT_PRIORITY,
            onPointerDown: (event)=>this.handlePointerDown(event),
            onPointerMove: (event)=>this.handlePointerMove(event),
            onPointerUp: (event)=>this.handlePointerUp(event),
            onWheel: (event)=>this.handleWheel(event),
            onWinKeyDown: (event)=>this.handleKeyDown(event),
            onWinKeyUp: (event)=>this.handleKeyUp(event)
        };
    }
    connect(element) {
        if (this.services.rig.mode !== __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_c13864f0__.CameraMode.Perspective) {
            const state = this.services.rig.getState();
            this.services.rig.setState({
                ...state,
                mode: __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_c13864f0__.CameraMode.Perspective
            });
        }
        super.connect(element);
        this.connected = true;
        this.resetTransientInput();
        this.viewEventRouter.removeConsumer(this.consumer);
        this.viewEventRouter.addConsumer(this.consumer);
    }
    disconnect() {
        if (!this.connected) return;
        this.connected = false;
        this.viewEventRouter.removeConsumer(this.consumer);
        this.resetTransientInput();
        this.releaseControlledCharacter();
        super.disconnect();
    }
    dispose() {
        this.disconnect();
    }
    update(_delta) {
        if (!this.enabled) return;
        const binding = this.characterService.getViewBinding(this.viewId);
        if (!binding) {
            this.releaseControlledCharacter();
            return;
        }
        const handle = this.characterService.get(binding.characterId);
        if (!handle) {
            this.releaseControlledCharacter();
            return;
        }
        const snapshot = handle.getSnapshot();
        if (this.activeCharacterId !== binding.characterId) {
            this.releaseControlledCharacter();
            this.activeCharacterId = binding.characterId;
            this.syncOrbitFromSnapshot(snapshot, binding);
            this.bodyYaw = snapshot.bodyYaw;
            this.bodyYawVelocity = 0;
            this.cameraDistance = this.followDistance;
        }
        this.applyOrbitDelta(binding);
        this.applyZoom(binding);
        const movementDirection = this.resolveMoveDirection();
        const hasMovement = movementDirection.lengthSq() > 0;
        if (hasMovement) {
            const targetBodyYaw = (0, __WEBPACK_EXTERNAL_MODULE__characterControlUtils_js_278c5499__.resolvePlanarYawFromDirection)(movementDirection, this.bodyYaw);
            const smoothedYaw = smoothDampAngle(this.bodyYaw, targetBodyYaw, this.bodyYawVelocity, BODY_ROTATION_SMOOTH_TIME, Math.max(0, _delta));
            this.bodyYaw = smoothedYaw.value;
            this.bodyYawVelocity = smoothedYaw.velocity;
        } else {
            this.bodyYaw = snapshot.bodyYaw;
            this.bodyYawVelocity = 0;
        }
        this.characterService.setCommand(binding.characterId, {
            move: hasMovement ? createMoveInputFromWorldDirection(movementDirection, this.bodyYaw) : {
                forward: 0,
                right: 0
            },
            run: this.isRunPressed(),
            jump: this.consumeJump(),
            bodyYaw: this.bodyYaw,
            aimYaw: this.orbitYaw,
            aimPitch: this.orbitPitch
        });
    }
    getCameraState(snapshot, delta = 0) {
        const target = snapshot.eyePosition.clone();
        const forward = (0, __WEBPACK_EXTERNAL_MODULE__characterControlUtils_js_278c5499__.createAimDirection)(this.orbitYaw, this.orbitPitch);
        const binding = this.characterService.getViewBinding(this.viewId);
        const distance = binding ? this.resolveCameraDistance(target, forward, this.followDistance, binding.thirdPerson.cameraCollision, delta) : this.followDistance;
        const position = target.clone().addScaledVector(forward, -distance);
        return {
            position,
            target,
            up: (0, __WEBPACK_EXTERNAL_MODULE__control_NativeControlUtils_js_7526c111__.computeRollFreeUp)(forward)
        };
    }
    handlePointerDown(event) {
        if (!this.enabled || event.viewId !== this.viewId) return false;
        const binding = this.characterService.getViewBinding(this.viewId);
        if (!binding || event.button !== binding.thirdPerson.dragButton) return false;
        this.domElement?.focus();
        this.activePointerId = event.domEvent.pointerId;
        this.lastPointerScreen = event.screen.clone();
        event.domEvent.preventDefault();
        this.onVisualInput?.('character.input');
        return true;
    }
    handlePointerMove(event) {
        if (!this.enabled || event.viewId !== this.viewId || this.activePointerId !== event.domEvent.pointerId || !this.lastPointerScreen) return false;
        const delta = event.screen.clone().sub(this.lastPointerScreen);
        this.lastPointerScreen.copy(event.screen);
        this.pendingOrbitDelta.add(delta);
        event.domEvent.preventDefault();
        this.onVisualInput?.('character.input');
        return true;
    }
    handlePointerUp(event) {
        if (!this.enabled || event.viewId !== this.viewId || this.activePointerId !== event.domEvent.pointerId) return false;
        this.activePointerId = null;
        this.lastPointerScreen = null;
        event.domEvent.preventDefault();
        this.onVisualInput?.('character.input');
        return true;
    }
    handleWheel(event) {
        if (!this.enabled || event.viewId !== this.viewId) return false;
        const binding = this.characterService.getViewBinding(this.viewId);
        if (!binding) return false;
        this.pendingZoomDelta += event.delta * binding.thirdPerson.zoomSensitivity;
        event.domEvent.preventDefault();
        this.onVisualInput?.('character.input');
        return true;
    }
    handleKeyDown(event) {
        if (!this.enabled || event.viewId !== this.viewId || !(0, __WEBPACK_EXTERNAL_MODULE__characterControlUtils_js_278c5499__.isCharacterInputKey)(event.code)) return false;
        this.keyState.add(event.code);
        if (__WEBPACK_EXTERNAL_MODULE__characterControlUtils_js_278c5499__.JUMP_CODES.includes(event.code) && !event.domEvent.repeat) this.jumpQueued = true;
        event.domEvent.preventDefault();
        this.onVisualInput?.('character.input');
        return true;
    }
    handleKeyUp(event) {
        if (!this.enabled || event.viewId !== this.viewId || !(0, __WEBPACK_EXTERNAL_MODULE__characterControlUtils_js_278c5499__.isCharacterInputKey)(event.code)) return false;
        this.keyState.delete(event.code);
        event.domEvent.preventDefault();
        this.onVisualInput?.('character.input');
        return true;
    }
    hasCameraActivity() {
        if (this.pendingOrbitDelta.lengthSq() > 0 || Math.abs(this.pendingZoomDelta) > Number.EPSILON) return true;
        if (null == this.cameraDistance) return false;
        return Math.abs(this.cameraDistance - this.followDistance) > 0.001;
    }
    applyOrbitDelta(binding) {
        if (this.pendingOrbitDelta.lengthSq() <= 0) return;
        const delta = this.pendingOrbitDelta.clone();
        this.pendingOrbitDelta.set(0, 0);
        const sensitivity = binding.thirdPerson.lookSensitivity;
        this.orbitYaw -= delta.x * sensitivity;
        this.orbitPitch = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.clamp(this.orbitPitch - delta.y * sensitivity, binding.thirdPerson.minPitch, binding.thirdPerson.maxPitch);
    }
    applyZoom(binding) {
        if (Math.abs(this.pendingZoomDelta) <= Number.EPSILON) return;
        this.followDistance = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.clamp(this.followDistance + this.pendingZoomDelta, binding.thirdPerson.minDistance, binding.thirdPerson.maxDistance);
        this.pendingZoomDelta = 0;
    }
    resolveCameraDistance(target, forward, idealDistance, collision, delta) {
        if (!collision.enabled || !this.services.spatial) {
            this.cameraDistance = idealDistance;
            return idealDistance;
        }
        const blockerDistance = this.findCameraBlockerDistance(target, forward, idealDistance, collision);
        const desiredDistance = blockerDistance ?? idealDistance;
        const previousDistance = this.cameraDistance ?? idealDistance;
        const responseRate = desiredDistance < previousDistance ? collision.pullInSmoothing : collision.restoreSmoothing;
        const alpha = delta > 0 ? 1 - Math.exp(-responseRate * delta) : 1;
        this.cameraDistance = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.clamp(__WEBPACK_EXTERNAL_MODULE_three__.MathUtils.lerp(previousDistance, desiredDistance, alpha), collision.minDistance, idealDistance);
        return this.cameraDistance;
    }
    findCameraBlockerDistance(target, forward, idealDistance, collision) {
        const spatial = this.services.spatial;
        if (!spatial || idealDistance <= collision.minDistance) return null;
        const rayDirection = forward.clone().multiplyScalar(-1).normalize();
        const activeCamera = this.services.viewportCamera.getActiveCamera();
        this.collisionCamera.layers.mask = activeCamera.layers.mask;
        const hit = spatial.raycastSurface({
            surfaceUsage: 'camera-control',
            ray: new __WEBPACK_EXTERNAL_MODULE_three__.Ray(target.clone(), rayDirection),
            camera: this.collisionCamera
        });
        if (!hit) return null;
        const hitDistance = target.distanceTo(hit.point);
        if (hitDistance <= MIN_CAMERA_OFFSET || hitDistance >= idealDistance) return null;
        return __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.clamp(hitDistance - collision.radius - collision.skinWidth, collision.minDistance, idealDistance);
    }
    resolveMoveDirection() {
        const forwardAxis = this.resolveAxis(__WEBPACK_EXTERNAL_MODULE__characterControlUtils_js_278c5499__.MOVE_FORWARD_CODES, __WEBPACK_EXTERNAL_MODULE__characterControlUtils_js_278c5499__.MOVE_BACKWARD_CODES);
        const rightAxis = this.resolveAxis(__WEBPACK_EXTERNAL_MODULE__characterControlUtils_js_278c5499__.MOVE_RIGHT_CODES, __WEBPACK_EXTERNAL_MODULE__characterControlUtils_js_278c5499__.MOVE_LEFT_CODES);
        if (0 === forwardAxis && 0 === rightAxis) return new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        const direction = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().addScaledVector((0, __WEBPACK_EXTERNAL_MODULE__characterControlUtils_js_278c5499__.createPlanarForward)(this.orbitYaw), forwardAxis).addScaledVector((0, __WEBPACK_EXTERNAL_MODULE__characterControlUtils_js_278c5499__.createPlanarRight)(this.orbitYaw), rightAxis);
        if (direction.lengthSq() > 0) direction.normalize();
        return direction;
    }
    resolveAxis(positiveCodes, negativeCodes) {
        const positive = positiveCodes.some((code)=>this.keyState.has(code));
        const negative = negativeCodes.some((code)=>this.keyState.has(code));
        if (positive === negative) return 0;
        return positive ? 1 : -1;
    }
    isRunPressed() {
        return __WEBPACK_EXTERNAL_MODULE__characterControlUtils_js_278c5499__.RUN_CODES.some((code)=>this.keyState.has(code));
    }
    consumeJump() {
        const jump = this.jumpQueued;
        this.jumpQueued = false;
        return jump;
    }
    syncOrbitFromSnapshot(snapshot, binding) {
        const target = snapshot.eyePosition;
        const rigState = this.services.rig.getState();
        const offset = rigState.position.clone().sub(target);
        if (offset.lengthSq() > MIN_CAMERA_OFFSET) {
            const forward = target.clone().sub(rigState.position).normalize();
            this.orbitYaw = Math.atan2(forward.y, forward.x);
            this.orbitPitch = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.clamp(Math.asin(__WEBPACK_EXTERNAL_MODULE_three__.MathUtils.clamp(forward.z, -1, 1)), binding.thirdPerson.minPitch, binding.thirdPerson.maxPitch);
            this.followDistance = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.clamp(offset.length(), binding.thirdPerson.minDistance, binding.thirdPerson.maxDistance);
            return;
        }
        this.orbitYaw = snapshot.aimYaw;
        this.orbitPitch = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.clamp(snapshot.aimPitch, binding.thirdPerson.minPitch, binding.thirdPerson.maxPitch);
        this.followDistance = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.clamp(binding.thirdPerson.followDistance, binding.thirdPerson.minDistance, binding.thirdPerson.maxDistance);
    }
    releaseControlledCharacter() {
        if (!this.activeCharacterId) return;
        const characterId = this.activeCharacterId;
        this.activeCharacterId = null;
        const handle = this.characterService.get(characterId);
        if (!handle) return;
        const command = handle.getCommand();
        this.characterService.setCommand(characterId, {
            move: {
                forward: 0,
                right: 0
            },
            run: false,
            jump: false,
            bodyYaw: command.bodyYaw,
            aimYaw: command.aimYaw,
            aimPitch: command.aimPitch
        });
    }
    resetTransientInput() {
        this.keyState.clear();
        this.pendingOrbitDelta.set(0, 0);
        this.activePointerId = null;
        this.lastPointerScreen = null;
        this.pendingZoomDelta = 0;
        this.jumpQueued = false;
    }
}
function createMoveInputFromWorldDirection(direction, bodyYaw) {
    const forward = (0, __WEBPACK_EXTERNAL_MODULE__characterControlUtils_js_278c5499__.createPlanarForward)(bodyYaw);
    const right = (0, __WEBPACK_EXTERNAL_MODULE__characterControlUtils_js_278c5499__.createPlanarRight)(bodyYaw);
    return {
        forward: direction.dot(forward),
        right: direction.dot(right)
    };
}
function smoothDampAngle(current, target, currentVelocity, smoothTime, delta) {
    const adjustedTarget = current + getShortestAngleDelta(current, target);
    return smoothDamp(current, adjustedTarget, currentVelocity, Math.max(MIN_SMOOTH_TIME, smoothTime), delta);
}
function smoothDamp(current, target, currentVelocity, smoothTime, delta) {
    if (delta <= 0) return {
        value: current,
        velocity: currentVelocity
    };
    const omega = 2 / smoothTime;
    const x = omega * delta;
    const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
    const change = current - target;
    const temp = (currentVelocity + omega * change) * delta;
    const velocity = (currentVelocity - omega * temp) * exp;
    const value = target + (change + temp) * exp;
    return {
        value,
        velocity
    };
}
function getShortestAngleDelta(current, target) {
    return Math.atan2(Math.sin(target - current), Math.cos(target - current));
}
export { CharacterThirdPersonController };
