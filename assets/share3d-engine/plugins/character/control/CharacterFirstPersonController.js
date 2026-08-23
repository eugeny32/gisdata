import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_c13864f0__ from "../../../shared/types/core.js";
import * as __WEBPACK_EXTERNAL_MODULE__characterControlUtils_js_278c5499__ from "./characterControlUtils.js";
const CHARACTER_FIRST_PERSON_INPUT_PRIORITY = 1000;
class CharacterFirstPersonController extends __WEBPACK_EXTERNAL_MODULE_three__.Controls {
    constructor(options){
        super(new __WEBPACK_EXTERNAL_MODULE_three__.PerspectiveCamera(), null), this.keyState = new Set(), this.pendingLookDelta = new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(), this.externalMoveInput = {
            forward: 0,
            right: 0
        }, this.activeCharacterId = null, this.activePointerId = null, this.lastPointerScreen = null, this.lookYaw = 0, this.lookPitch = 0, this.jumpQueued = false, this.connected = false;
        if (!options.services.viewId) throw new Error('CharacterFirstPersonController requires a bound viewId');
        this.services = options.services;
        this.characterService = options.characterService;
        this.viewEventRouter = options.viewEventRouter;
        this.pointerLockService = options.pointerLockService;
        this.onVisualInput = options.onVisualInput;
        this.viewId = options.services.viewId;
        this.enabled = false;
        this.consumer = {
            name: `character-first-person:${this.viewId}`,
            priority: CHARACTER_FIRST_PERSON_INPUT_PRIORITY,
            onPointerDown: (event)=>this.handlePointerDown(event),
            onPointerMove: (event)=>this.handlePointerMove(event),
            onPointerUp: (event)=>this.handlePointerUp(event),
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
        this.exitPointerLockSession();
        this.resetTransientInput();
        this.releaseControlledCharacter();
        super.disconnect();
    }
    dispose() {
        this.disconnect();
    }
    setExternalMoveInput(input) {
        this.externalMoveInput.forward = clampAxis(input?.forward ?? 0);
        this.externalMoveInput.right = clampAxis(input?.right ?? 0);
    }
    update(_delta) {
        if (!this.enabled) return;
        const binding = this.characterService.getViewBinding(this.viewId);
        if (!binding) {
            this.exitPointerLockSession();
            this.releaseControlledCharacter();
            return;
        }
        const handle = this.characterService.get(binding.characterId);
        if (!handle) {
            this.exitPointerLockSession();
            this.releaseControlledCharacter();
            return;
        }
        if ('pointer-lock' !== binding.firstPerson.lookInteraction) this.exitPointerLockSession();
        if (this.activeCharacterId !== binding.characterId) {
            this.releaseControlledCharacter();
            this.activeCharacterId = binding.characterId;
            this.syncLookFromSnapshot(handle.getSnapshot(), binding);
        }
        this.applyLookDelta(binding);
        this.characterService.setCommand(binding.characterId, {
            move: this.resolveMoveInput(),
            run: this.isRunPressed(),
            jump: this.consumeJump(),
            bodyYaw: this.lookYaw,
            aimYaw: this.lookYaw,
            aimPitch: this.lookPitch
        });
    }
    handlePointerDown(event) {
        if (!this.enabled || event.viewId !== this.viewId) return false;
        const binding = this.characterService.getViewBinding(this.viewId);
        if (!binding) return false;
        this.domElement?.focus();
        if ('pointer-lock' === binding.firstPerson.lookInteraction) {
            if (event.button !== binding.firstPerson.pointerLockButton) return false;
            event.domEvent.preventDefault();
            this.onVisualInput?.('character.input');
            return this.pointerLockService.request(this.viewId);
        }
        if (event.button !== binding.firstPerson.dragButton) return false;
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
        this.pendingLookDelta.add(delta);
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
    applyLookDelta(binding) {
        const delta = 'pointer-lock' === binding.firstPerson.lookInteraction ? this.pointerLockService.consumeDelta(this.viewId) : this.consumeDragLookDelta();
        if (delta.lengthSq() <= 0) return;
        const sensitivity = binding.firstPerson.lookSensitivity;
        this.lookYaw -= delta.x * sensitivity;
        this.lookPitch = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.clamp(this.lookPitch - delta.y * sensitivity, binding.firstPerson.minPitch, binding.firstPerson.maxPitch);
    }
    consumeDragLookDelta() {
        const delta = this.pendingLookDelta.clone();
        this.pendingLookDelta.set(0, 0);
        return delta;
    }
    resolveMoveInput() {
        const forward = this.resolveAxis(__WEBPACK_EXTERNAL_MODULE__characterControlUtils_js_278c5499__.MOVE_FORWARD_CODES, __WEBPACK_EXTERNAL_MODULE__characterControlUtils_js_278c5499__.MOVE_BACKWARD_CODES) + this.externalMoveInput.forward;
        const right = this.resolveAxis(__WEBPACK_EXTERNAL_MODULE__characterControlUtils_js_278c5499__.MOVE_RIGHT_CODES, __WEBPACK_EXTERNAL_MODULE__characterControlUtils_js_278c5499__.MOVE_LEFT_CODES) + this.externalMoveInput.right;
        return {
            forward: clampAxis(forward),
            right: clampAxis(right)
        };
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
    syncLookFromSnapshot(snapshot, binding) {
        this.lookYaw = snapshot.aimYaw;
        this.lookPitch = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.clamp(snapshot.aimPitch, binding.firstPerson.minPitch, binding.firstPerson.maxPitch);
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
        this.pendingLookDelta.set(0, 0);
        this.activePointerId = null;
        this.lastPointerScreen = null;
        this.jumpQueued = false;
        this.setExternalMoveInput(null);
    }
    exitPointerLockSession() {
        if (this.pointerLockService.isLockedFor(this.viewId) || this.pointerLockService.pendingViewId === this.viewId) this.pointerLockService.exit();
    }
}
function clampAxis(value) {
    if (!Number.isFinite(value)) return 0;
    return __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.clamp(value, -1, 1);
}
export { CharacterFirstPersonController };
