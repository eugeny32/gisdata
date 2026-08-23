import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE_three_addons_controls_OrbitControls_js_ecfbfad4__ from "three/addons/controls/OrbitControls.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__ from "../../shared/constants/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_c632c149__ from "../../shared/types/assets.js";
import * as __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__ from "./NativeControlUtils.js";
const KEYBOARD_TRANSLATION_CODES = new Set([
    'KeyW',
    'KeyA',
    'KeyS',
    'KeyD',
    'ArrowUp',
    'ArrowLeft',
    'ArrowDown',
    'ArrowRight',
    'KeyQ',
    'KeyE'
]);
class EarthController extends __WEBPACK_EXTERNAL_MODULE_three_addons_controls_OrbitControls_js_ecfbfad4__.OrbitControls {
    static #_ = this.WORLD_UP = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 1);
    static #_2 = this.LEGACY_ROTATION_SPEED = 10;
    static #_3 = this.LEGACY_WHEEL_FADE_FACTOR = 20;
    static #_4 = this.LEGACY_WHEEL_STEP_RATIO = 0.2;
    static #_5 = this.MAX_ABSOLUTE_PITCH = Math.PI / 2 - 1e-3;
    static #_6 = this.ACTIVATION_TRANSITION_MS = 180;
    static #_7 = this.UP_ALIGNMENT_EPSILON = 1e-3;
    static #_8 = this.PIVOT_INDICATOR_PIXEL_RADIUS = 10;
    static #_9 = this.GSPLAT_HOVER_RADIUS = 0.08;
    static #_10 = this.DEFAULT_FRAME_DELTA = 1 / 60;
    static #_11 = this.MIN_KEYBOARD_MAX_SPEED = 1;
    static #_12 = this.KEYBOARD_ACCELERATION_DURATION = 1.0;
    static #_13 = this.NAVIGATION_SCALE_ABSOLUTE_MINIMUM = __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.DEFAULT_NAVIGATION_SCALE_ABSOLUTE_MINIMUM;
    static #_14 = this.WHEEL_MIN_STEP_RATIO = __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.DEFAULT_WHEEL_MIN_STEP_RATIO;
    static #_15 = this.WHEEL_ABSOLUTE_MIN_STEP = __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.DEFAULT_WHEEL_ABSOLUTE_MIN_STEP;
    static #_16 = this.DOUBLE_CLICK_ORTHOGRAPHIC_MIN_ZOOM_FACTOR = 2.5;
    static #_17 = this.GPU_PREWARM_THROTTLE_MS = 48;
    static #_18 = this.GPU_PREWARM_MOTION_COOLDOWN_MS = 120;
    static #_19 = this.WHEEL_PICK_REUSE_MS = 120;
    static #_20 = this.WHEEL_PICK_REUSE_DISTANCE_PX = 2;
    constructor(options){
        const camera = (0, __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.syncViewportCameraFromRig)(options.services);
        super(camera), this.kind = 'earth-control-overlay', this.phases = [
            __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_c632c149__.RenderPhase.Overlay3D
        ], this.renderPriority = 0, this.services = null, this.boundPointerDown = null, this.boundPointerMove = null, this.boundPointerUp = null, this.boundWheel = null, this.boundDoubleClick = null, this.boundKeyDown = null, this.boundKeyUp = null, this.boundBlur = null, this.activePivot = null, this.activePointerId = null, this.lastPointerScreen = null, this.activeDragMode = null, this.lastStableYaw = 0, this.isActivating = false, this.activationToken = 0, this.activationPending = false, this.overlayScene = new __WEBPACK_EXTERNAL_MODULE_three__.Scene(), this.wheelDelta = 0, this.zoomDelta = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(), this.wheelPivot = null, this.zoomDistance = null, this.orthographicZoomTarget = null, this.orthographicZoomAnchorClient = null, this.keyState = new Set(), this.keyboardMaxSpeed = EarthController.MIN_KEYBOARD_MAX_SPEED, this.keyboardCurrentSpeed = 0, this.lastCameraMotionAt = -1 / 0, this.lastGpuPrewarmAt = -1 / 0, this.lastWheelPickAt = -1 / 0, this.lastWheelPickScreen = null, this.lastWheelPickedPivot = null, this.lastCommittedRigState = null;
        this.services = options.services;
        this.enabled = false;
        this.enableDamping = true;
        this.dampingFactor = __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.CONTROL_DAMPING_FACTOR;
        this.screenSpacePanning = false;
        this.zoomToCursor = true;
        this.mouseButtons = {
            LEFT: -1,
            MIDDLE: __WEBPACK_EXTERNAL_MODULE_three__.MOUSE.DOLLY,
            RIGHT: -1
        };
        this.touches = {
            ONE: __WEBPACK_EXTERNAL_MODULE_three__.TOUCH.ROTATE,
            TWO: __WEBPACK_EXTERNAL_MODULE_three__.TOUCH.DOLLY_PAN
        };
        this.target.copy(options.services.rig.target);
        this.cursor.copy(options.services.rig.target);
        this.pivotIndicator = new __WEBPACK_EXTERNAL_MODULE_three__.Mesh(new __WEBPACK_EXTERNAL_MODULE_three__.SphereGeometry(0.8, 16, 16), new __WEBPACK_EXTERNAL_MODULE_three__.MeshNormalMaterial());
        this.pivotIndicator.name = 'earthPivotIndicator';
        this.pivotIndicator.visible = false;
        this.overlayScene.add(this.pivotIndicator);
    }
    connect(element) {
        if (!this.services) return;
        if (!element.hasAttribute('tabindex')) element.setAttribute('tabindex', '0');
        const camera = this.syncFromRig();
        this.target.copy(this.services.rig.target);
        this.cursor.copy(this.services.rig.target);
        this.resetKeyboardMotionProfile();
        this.rememberCurrentRigState();
        camera.updateMatrixWorld(true);
        super.connect(element);
        this.installPointerHooks(element);
        super.update();
        element.focus();
        this.activationPending = true;
    }
    update(deltaTime) {
        if (!this.enabled || !this.services) return false;
        let camera = this.syncFromRig();
        this.resetKeyboardMotionProfileForExternalRigChange();
        this.target.copy(this.services.rig.target);
        if (this.activationPending) {
            this.activationPending = false;
            this.beginActivationTransition();
        }
        if (this.isActivating) {
            camera.updateMatrixWorld(true);
            this.updatePivotIndicatorScale(camera);
            return false;
        }
        if (this.activeDragMode) {
            camera.updateMatrixWorld(true);
            this.updatePivotIndicatorScale(camera);
            return false;
        }
        const orbitChanged = super.update(deltaTime);
        camera.updateMatrixWorld(true);
        (0, __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.syncRigFromCamera)(this.services, camera, this.target);
        this.rememberCurrentRigState();
        const keyboardChanged = this.updateKeyboardTranslation(deltaTime);
        const wheelChanged = camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.OrthographicCamera ? false : this.updateLegacyWheelZoom(deltaTime);
        const orthographicZoomChanged = this.updateOrthographicZoomAnimation(deltaTime);
        camera = this.syncFromRig();
        camera.updateMatrixWorld(true);
        this.updatePivotIndicatorScale(camera);
        return orbitChanged || keyboardChanged || wheelChanged || orthographicZoomChanged;
    }
    disconnect() {
        this.removePointerHooks();
        this.hidePivotIndicator();
        if (this.domElement) super.disconnect();
    }
    dispose() {
        this.hidePivotIndicator();
        this.removePointerHooks();
        this.overlayScene.remove(this.pivotIndicator);
        this.pivotIndicator.geometry.dispose();
        this.pivotIndicator.material.dispose();
        if (this.domElement) super.dispose();
    }
    render(frame, _phase, ctx) {
        if (!this.enabled || !this.pivotIndicator.visible || this.services?.viewId != null && ctx.viewId !== this.services.viewId) return;
        const { renderer } = ctx;
        const savedTarget = renderer.getRenderTarget();
        renderer.resetState();
        renderer.setRenderTarget(ctx.outputTarget);
        renderer.setViewport(ctx.viewport.x, ctx.viewport.y, ctx.viewport.width, ctx.viewport.height);
        renderer.setScissor(ctx.viewport.x, ctx.viewport.y, ctx.viewport.width, ctx.viewport.height);
        renderer.setScissorTest(true);
        const savedCameraLayerMask = frame.camera.layers.mask;
        frame.camera.layers.mask = 0xffffffff;
        try {
            renderer.render(this.overlayScene, frame.camera);
        } finally{
            frame.camera.layers.mask = savedCameraLayerMask;
            renderer.setRenderTarget(savedTarget);
        }
    }
    syncFromRig() {
        if (!this.services) return this.object;
        const camera = (0, __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.syncViewportCameraFromRig)(this.services);
        if (this.object !== camera) this.object = camera;
        return camera;
    }
    installPointerHooks(element) {
        this.removePointerHooks();
        this.boundPointerDown = (event)=>{
            if (!this.enabled || this.isActivating || 0 !== event.button && 2 !== event.button) return;
            element.focus();
            this.activePointerId = event.pointerId;
            this.lastPointerScreen = new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(event.clientX, event.clientY);
            this.activeDragMode = 0 === event.button ? 'rotate' : 'pan';
            if (0 === event.button) {
                const pickedPivot = this.pickPivot(event, 'move');
                const pivot = pickedPivot ?? this.getFallbackPivot();
                this.activePivot = pivot.clone();
                this.cursor.copy(pivot);
                if (pickedPivot) this.showPivotIndicator(pivot);
                else this.hidePivotIndicator();
            } else {
                this.activePivot = null;
                this.hidePivotIndicator();
            }
            event.preventDefault();
            if ('function' == typeof element.setPointerCapture) element.setPointerCapture(event.pointerId);
        };
        this.boundPointerMove = (event)=>{
            if (!this.enabled) return;
            if (event.pointerId !== this.activePointerId || !this.lastPointerScreen) {
                if (null === this.activePointerId && 0 === event.buttons) this.prewarmGsplatGpuPick(event);
                return;
            }
            const current = new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(event.clientX, event.clientY);
            const delta = current.clone().sub(this.lastPointerScreen);
            this.lastPointerScreen.copy(current);
            if (0 === delta.lengthSq()) return;
            if ('rotate' === this.activeDragMode && this.activePivot) this.rotateAroundPivot(delta, this.activePivot);
            else if ('pan' === this.activeDragMode) this.panCamera(delta);
            this.markCameraMotion();
            event.preventDefault();
        };
        this.boundPointerUp = (event)=>{
            if (event.pointerId !== this.activePointerId) return;
            event.preventDefault();
            this.activePivot = null;
            this.activePointerId = null;
            this.lastPointerScreen = null;
            this.activeDragMode = null;
            this.hidePivotIndicator();
            this.markCameraMotion();
            if ('function' == typeof element.releasePointerCapture) element.releasePointerCapture(event.pointerId);
        };
        this.boundWheel = (event)=>{
            if (!this.enabled) return;
            element.focus();
            const camera = this.syncFromRig();
            if (!(camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.PerspectiveCamera)) {
                this.updatePivotFromEvent(event, 'move', false);
                return;
            }
            const wheelStep = (0, __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.resolveWheelInputDelta)(event.deltaY, event.deltaMode);
            if (0 === wheelStep) return;
            const pivot = this.getWheelPivot(event);
            if (pivot) {
                this.cursor.copy(pivot);
                this.wheelPivot = pivot.clone();
            } else this.wheelPivot = null;
            this.wheelDelta = (0, __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.accumulateWheelInputDelta)(this.wheelDelta, wheelStep);
            this.markCameraMotion();
            event.preventDefault();
            event.stopImmediatePropagation();
        };
        this.boundDoubleClick = (event)=>{
            if (event.defaultPrevented) return;
            if (!this.enabled) return;
            element.focus();
            const hit = this.pickSurfaceHit(event, 'click');
            if (!hit) return;
            const camera = this.syncFromRig();
            if (camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.OrthographicCamera) {
                this.clearWheelZoomState();
                if (!this.startOrthographicDoubleClickZoom(event, camera, hit)) return;
                if (!this.updateOrthographicZoomAnimation(EarthController.DEFAULT_FRAME_DELTA)) return;
                this.markCameraMotion();
                event.preventDefault();
                event.stopImmediatePropagation();
                return;
            }
            if (!(camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.PerspectiveCamera)) return;
            const pivot = hit.point;
            const current = this.services.rig.getState();
            const navigationScale = this.resolveWheelNavigationScale(current.position.distanceTo(current.target));
            const wheelDelta = (0, __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.resolveDoubleClickWheelDelta)({
                position: current.position,
                pickedPoint: pivot,
                hit,
                proportionalStepRatio: EarthController.LEGACY_WHEEL_STEP_RATIO,
                navigationScale,
                minStepRatio: EarthController.WHEEL_MIN_STEP_RATIO,
                absoluteMinStep: EarthController.WHEEL_ABSOLUTE_MIN_STEP
            });
            if (wheelDelta <= 0) return;
            this.cursor.copy(pivot);
            this.wheelPivot = pivot.clone();
            this.wheelDelta += wheelDelta;
            this.markCameraMotion();
            event.preventDefault();
            event.stopImmediatePropagation();
        };
        this.boundKeyDown = (event)=>{
            if (!this.enabled || this.isActivating || event.ctrlKey || event.metaKey || event.altKey || !KEYBOARD_TRANSLATION_CODES.has(event.code)) return;
            this.keyState.add(event.code);
            event.preventDefault();
        };
        this.boundKeyUp = (event)=>{
            if (!KEYBOARD_TRANSLATION_CODES.has(event.code)) return;
            this.keyState.delete(event.code);
            event.preventDefault();
        };
        this.boundBlur = ()=>{
            this.keyState.clear();
            this.keyboardCurrentSpeed = 0;
        };
        element.addEventListener('pointerdown', this.boundPointerDown, {
            capture: true
        });
        element.addEventListener('pointermove', this.boundPointerMove, {
            capture: true
        });
        element.addEventListener('pointerup', this.boundPointerUp, {
            capture: true
        });
        element.addEventListener('pointercancel', this.boundPointerUp, {
            capture: true
        });
        element.addEventListener('wheel', this.boundWheel, {
            capture: true
        });
        element.addEventListener('dblclick', this.boundDoubleClick);
        element.addEventListener('keydown', this.boundKeyDown);
        element.addEventListener('keyup', this.boundKeyUp);
        element.addEventListener('blur', this.boundBlur);
    }
    removePointerHooks() {
        if (!this.domElement) {
            this.boundPointerDown = null;
            this.boundPointerMove = null;
            this.boundPointerUp = null;
            this.boundWheel = null;
            this.boundDoubleClick = null;
            this.boundKeyDown = null;
            this.boundKeyUp = null;
            this.boundBlur = null;
            this.keyState.clear();
            this.keyboardCurrentSpeed = 0;
            return;
        }
        if (this.boundPointerDown) {
            this.domElement.removeEventListener('pointerdown', this.boundPointerDown, true);
            this.boundPointerDown = null;
        }
        if (this.boundPointerMove) {
            this.domElement.removeEventListener('pointermove', this.boundPointerMove, true);
            this.boundPointerMove = null;
        }
        if (this.boundPointerUp) {
            this.domElement.removeEventListener('pointerup', this.boundPointerUp, true);
            this.domElement.removeEventListener('pointercancel', this.boundPointerUp, true);
            this.boundPointerUp = null;
        }
        if (this.boundWheel) {
            this.domElement.removeEventListener('wheel', this.boundWheel, true);
            this.boundWheel = null;
        }
        if (this.boundDoubleClick) {
            this.domElement.removeEventListener('dblclick', this.boundDoubleClick);
            this.boundDoubleClick = null;
        }
        if (this.boundKeyDown) {
            this.domElement.removeEventListener('keydown', this.boundKeyDown);
            this.boundKeyDown = null;
        }
        if (this.boundKeyUp) {
            this.domElement.removeEventListener('keyup', this.boundKeyUp);
            this.boundKeyUp = null;
        }
        if (this.boundBlur) {
            this.domElement.removeEventListener('blur', this.boundBlur);
            this.boundBlur = null;
        }
        this.activePivot = null;
        this.activePointerId = null;
        this.lastPointerScreen = null;
        this.activeDragMode = null;
        this.clearWheelZoomState();
        this.keyState.clear();
        this.keyboardCurrentSpeed = 0;
    }
    updateKeyboardTranslation(deltaTime) {
        if (!this.services || 0 === this.keyState.size) {
            this.keyboardCurrentSpeed = 0;
            return false;
        }
        const safeDelta = deltaTime && Number.isFinite(deltaTime) && deltaTime > 0 ? deltaTime : EarthController.DEFAULT_FRAME_DELTA;
        const current = this.services.rig.getState();
        const forward = current.target.clone().sub(current.position);
        if (forward.lengthSq() <= 1e-12) {
            this.keyboardCurrentSpeed = 0;
            return false;
        }
        const yaw = this.getStableYaw(forward.normalize());
        const planarForward = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 1, 0).applyAxisAngle(EarthController.WORLD_UP, yaw).normalize();
        const side = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1, 0, 0).applyAxisAngle(EarthController.WORLD_UP, yaw).normalize();
        const movement = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        const moveForward = this.keyState.has('KeyW') || this.keyState.has('ArrowUp');
        const moveBackward = this.keyState.has('KeyS') || this.keyState.has('ArrowDown');
        const moveLeft = this.keyState.has('KeyA') || this.keyState.has('ArrowLeft');
        const moveRight = this.keyState.has('KeyD') || this.keyState.has('ArrowRight');
        const moveUp = this.keyState.has('KeyQ');
        const moveDown = this.keyState.has('KeyE');
        if (moveForward !== moveBackward) movement.addScaledVector(planarForward, moveForward ? 1 : -1);
        if (moveLeft !== moveRight) movement.addScaledVector(side, moveRight ? 1 : -1);
        if (moveUp !== moveDown) movement.addScaledVector(EarthController.WORLD_UP, moveUp ? 1 : -1);
        if (movement.lengthSq() <= 1e-12) {
            this.keyboardCurrentSpeed = 0;
            return false;
        }
        const frameSpeed = this.advanceKeyboardSpeed(safeDelta);
        movement.multiplyScalar(frameSpeed);
        const nextPosition = current.position.clone().add(movement);
        const nextTarget = current.target.clone().add(movement);
        this.commitRigState({
            ...current,
            position: nextPosition,
            target: nextTarget,
            up: current.up.clone()
        });
        this.target.copy(nextTarget);
        this.cursor.add(movement);
        this.markCameraMotion();
        return true;
    }
    rotateAroundPivot(delta, pivot) {
        if (!this.services) return;
        const previous = this.services.rig.getState();
        const viewport = this.services.getViewportSize();
        const width = Math.max(viewport.width, 1);
        const height = Math.max(viewport.height, 1);
        const yawDelta = -(delta.x / width) * EarthController.LEGACY_ROTATION_SPEED * 0.5;
        let pitchDelta = -(delta.y / height) * EarthController.LEGACY_ROTATION_SPEED * 0.2;
        const forward = previous.target.clone().sub(previous.position).normalize();
        const yaw = this.getStableYaw(forward);
        const currentPitch = Math.atan2(forward.z, Math.sqrt(forward.x * forward.x + forward.y * forward.y));
        const nextPitch = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.clamp(currentPitch + pitchDelta, -EarthController.MAX_ABSOLUTE_PITCH, EarthController.MAX_ABSOLUTE_PITCH);
        pitchDelta = nextPitch - currentPitch;
        if (Math.abs(pitchDelta) <= 1e-8 && Math.abs(yawDelta) <= 1e-8) return;
        const side = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1, 0, 0).applyAxisAngle(EarthController.WORLD_UP, yaw).normalize();
        const pivotToCamera = previous.position.clone().sub(pivot);
        const pivotToTarget = previous.target.clone().sub(pivot);
        pivotToCamera.applyAxisAngle(side, pitchDelta);
        pivotToTarget.applyAxisAngle(side, pitchDelta);
        pivotToCamera.applyAxisAngle(EarthController.WORLD_UP, yawDelta);
        pivotToTarget.applyAxisAngle(EarthController.WORLD_UP, yawDelta);
        const nextPosition = pivot.clone().add(pivotToCamera);
        const nextTarget = pivot.clone().add(pivotToTarget);
        const nextForward = nextTarget.clone().sub(nextPosition).normalize();
        const nextYaw = yaw + yawDelta;
        const nextSide = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1, 0, 0).applyAxisAngle(EarthController.WORLD_UP, nextYaw).normalize();
        const nextUp = nextSide.clone().cross(nextForward).normalize();
        this.lastStableYaw = nextYaw;
        this.commitRigState({
            ...previous,
            position: nextPosition,
            target: nextTarget,
            up: nextUp
        });
        const camera = this.syncFromRig();
        this.target.copy(nextTarget);
        this.cursor.copy(pivot);
        camera.updateMatrixWorld(true);
        this.updatePivotIndicatorScale(camera);
    }
    getStableYaw(forward) {
        const horizontalLength = Math.sqrt(forward.x * forward.x + forward.y * forward.y);
        if (horizontalLength > 1e-6) this.lastStableYaw = Math.atan2(forward.y, forward.x) - Math.PI / 2;
        return this.lastStableYaw;
    }
    async beginActivationTransition() {
        if (!this.services) return;
        const state = this.services.rig.getState();
        const forward = state.target.clone().sub(state.position);
        if (forward.lengthSq() < 1e-8) {
            this.isActivating = false;
            return;
        }
        const desiredUp = this.computeEarthAlignedUp(forward.normalize());
        if (desiredUp.angleTo(state.up) <= EarthController.UP_ALIGNMENT_EPSILON) {
            this.isActivating = false;
            return;
        }
        const token = ++this.activationToken;
        this.isActivating = true;
        await this.services.rig.animateTo({
            up: desiredUp
        }, EarthController.ACTIVATION_TRANSITION_MS);
        if (this.activationToken !== token || !this.enabled) return;
        this.isActivating = false;
        const camera = this.syncFromRig();
        this.target.copy(this.services.rig.target);
        this.cursor.copy(this.services.rig.target);
        this.resetKeyboardMotionProfile(state.position.distanceTo(state.target));
        this.rememberCurrentRigState();
        camera.updateMatrixWorld(true);
        this.updatePivotIndicatorScale(camera);
    }
    computeEarthAlignedUp(forward) {
        const yaw = this.getStableYaw(forward);
        const side = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1, 0, 0).applyAxisAngle(EarthController.WORLD_UP, yaw).normalize();
        return side.clone().cross(forward).normalize();
    }
    panCamera(delta) {
        if (!this.services) return;
        const previous = this.services.rig.getState();
        const camera = this.syncFromRig();
        camera.updateMatrixWorld(true);
        const viewport = this.services.getViewportSize();
        const width = Math.max(viewport.width, 1);
        const height = Math.max(viewport.height, 1);
        const side = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().setFromMatrixColumn(camera.matrixWorld, 0).normalize();
        const up = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().setFromMatrixColumn(camera.matrixWorld, 1).normalize();
        let panX = 0;
        let panY = 0;
        if (camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.PerspectiveCamera) {
            const panDepth = this.resolvePointerPanNavigationScale(previous.position.distanceTo(previous.target));
            const targetDistance = panDepth * Math.tan(__WEBPACK_EXTERNAL_MODULE_three__.MathUtils.degToRad(camera.fov) / 2);
            panX = -delta.x * targetDistance / height;
            panY = delta.y * targetDistance / height;
        } else if (camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.OrthographicCamera) {
            panX = -delta.x * (camera.right - camera.left) / camera.zoom / width;
            panY = delta.y * (camera.top - camera.bottom) / camera.zoom / height;
        }
        const pan = side.multiplyScalar(panX).add(up.multiplyScalar(panY));
        const nextPosition = previous.position.clone().add(pan);
        const nextTarget = previous.target.clone().add(pan);
        this.commitRigState({
            ...previous,
            position: nextPosition,
            target: nextTarget,
            up: previous.up.clone()
        });
        this.target.copy(nextTarget);
        this.cursor.add(pan);
        const syncedCamera = this.syncFromRig();
        syncedCamera.updateMatrixWorld(true);
    }
    updateLegacyWheelZoom(deltaTime) {
        if (!this.services) return false;
        const camera = this.syncFromRig();
        if (!(camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.PerspectiveCamera)) {
            this.clearWheelZoomState();
            return false;
        }
        const safeDelta = deltaTime && Number.isFinite(deltaTime) && deltaTime > 0 ? deltaTime : EarthController.DEFAULT_FRAME_DELTA;
        const fade = 0.5 ** (EarthController.LEGACY_WHEEL_FADE_FACTOR * safeDelta);
        const progression = 1 - fade;
        let changed = false;
        if (0 !== this.wheelDelta) {
            const current = this.services.rig.getState();
            const forward = current.target.clone().sub(current.position).normalize();
            const distanceToTarget = current.position.distanceTo(current.target);
            const navigationScale = this.resolveWheelNavigationScale(distanceToTarget);
            if (this.wheelPivot) {
                const step = (0, __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.resolvePickedPointWheelStep)({
                    position: current.position,
                    target: current.target,
                    forward,
                    pickedPoint: this.wheelPivot,
                    currentZoomDelta: this.zoomDelta,
                    wheelDelta: this.wheelDelta,
                    proportionalStepRatio: EarthController.LEGACY_WHEEL_STEP_RATIO,
                    navigationScale,
                    minStepRatio: EarthController.WHEEL_MIN_STEP_RATIO,
                    absoluteMinStep: EarthController.WHEEL_ABSOLUTE_MIN_STEP
                });
                if (step.crossedPickedPoint) {
                    this.zoomDelta.set(0, 0, 0);
                    this.zoomDistance = null;
                    this.commitRigState({
                        ...current,
                        position: step.nextPosition,
                        target: step.nextTarget,
                        up: current.up.clone()
                    });
                    changed = true;
                } else {
                    this.zoomDelta.copy(step.nextZoomDelta);
                    this.zoomDistance = step.nextZoomDistance;
                }
            } else {
                const moveDistance = (0, __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.resolveWheelForwardStep)({
                    cameraTargetDistance: distanceToTarget,
                    wheelDelta: this.wheelDelta,
                    proportionalStepRatio: EarthController.LEGACY_WHEEL_STEP_RATIO,
                    navigationScale,
                    minStepRatio: EarthController.WHEEL_MIN_STEP_RATIO,
                    absoluteMinStep: EarthController.WHEEL_ABSOLUTE_MIN_STEP
                });
                const moveVector = forward.multiplyScalar(moveDistance);
                if (moveVector.lengthSq() > 1e-12) {
                    const nextPosition = current.position.clone().add(moveVector);
                    const nextTarget = current.target.clone().add(moveVector);
                    this.commitRigState({
                        ...current,
                        position: nextPosition,
                        target: nextTarget,
                        up: current.up.clone()
                    });
                    changed = true;
                }
                this.zoomDistance = null;
            }
        }
        if (this.zoomDelta.lengthSq() > 1e-12) {
            const movement = this.zoomDelta.clone().multiplyScalar(progression);
            if (movement.lengthSq() > 1e-12) {
                const current = this.services.rig.getState();
                const forward = current.target.clone().sub(current.position).normalize();
                const nextPosition = current.position.clone().add(movement);
                const nextTarget = null == this.zoomDistance ? current.target.clone().add(movement) : nextPosition.clone().addScaledVector(forward, this.zoomDistance);
                this.commitRigState({
                    ...current,
                    position: nextPosition,
                    target: nextTarget,
                    up: current.up.clone()
                });
                changed = true;
            }
        }
        this.zoomDelta.multiplyScalar(fade);
        if (this.zoomDelta.lengthSq() <= 1e-12) {
            this.zoomDelta.set(0, 0, 0);
            this.zoomDistance = null;
        }
        this.wheelDelta = 0;
        this.wheelPivot = null;
        if (changed) {
            this.target.copy(this.services.rig.target);
            const syncedCamera = this.syncFromRig();
            syncedCamera.updateMatrixWorld(true);
            this.markCameraMotion();
        }
        return changed;
    }
    updateOrthographicZoomAnimation(deltaTime) {
        if (!this.services || null == this.orthographicZoomTarget || !this.orthographicZoomAnchorClient) return false;
        const camera = this.syncFromRig();
        if (!(camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.OrthographicCamera)) {
            this.clearOrthographicZoomAnimation();
            return false;
        }
        const targetZoom = this.orthographicZoomTarget;
        const currentZoom = camera.zoom;
        const remaining = targetZoom - currentZoom;
        if (remaining <= 1e-9) {
            this.clearOrthographicZoomAnimation();
            return false;
        }
        const safeDelta = deltaTime && Number.isFinite(deltaTime) && deltaTime > 0 ? deltaTime : EarthController.DEFAULT_FRAME_DELTA;
        const fade = 0.5 ** (EarthController.LEGACY_WHEEL_FADE_FACTOR * safeDelta);
        const nextZoom = Math.min(targetZoom, currentZoom + remaining * (1 - fade));
        if (!this.applyOrthographicZoomAtClientPoint(camera, this.orthographicZoomAnchorClient.x, this.orthographicZoomAnchorClient.y, nextZoom)) {
            this.clearOrthographicZoomAnimation();
            return false;
        }
        if (targetZoom - camera.zoom <= 1e-9) this.clearOrthographicZoomAnimation();
        this.target.copy(this.services.rig.target);
        this.rememberCurrentRigState();
        this.markCameraMotion();
        return true;
    }
    applyOrthographicZoomAtClientPoint(camera, clientX, clientY, zoom) {
        if (!this.domElement || !this.services) return false;
        const rect = this.domElement.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return false;
        const mouseX = (clientX - rect.left) / rect.width * 2 - 1;
        const mouseY = 2 * -((clientY - rect.top) / rect.height) + 1;
        const mouseBefore = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(mouseX, mouseY, 0).unproject(camera);
        const previousZoom = camera.zoom;
        camera.zoom = Math.max(1e-9, zoom);
        if (Math.abs(camera.zoom - previousZoom) <= 1e-9) return false;
        camera.updateProjectionMatrix();
        const mouseAfter = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(mouseX, mouseY, 0).unproject(camera);
        const translation = mouseBefore.sub(mouseAfter);
        camera.position.add(translation);
        camera.updateMatrixWorld(true);
        this.target.add(translation);
        (0, __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.syncRigFromCamera)(this.services, camera, this.target);
        return true;
    }
    startOrthographicDoubleClickZoom(event, camera, hit) {
        const current = this.services.rig.getState();
        const navigationScale = this.resolveWheelNavigationScale(current.position.distanceTo(current.target));
        const targetRadius = (0, __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.resolveDoubleClickTargetRadius)(hit, navigationScale, EarthController.WHEEL_MIN_STEP_RATIO, EarthController.WHEEL_ABSOLUTE_MIN_STEP);
        const targetHalfHeight = Math.max(targetRadius / Math.tan(__WEBPACK_EXTERNAL_MODULE_three__.MathUtils.degToRad(current.fov) / 2), 1e-9);
        const targetZoom = Math.max(camera.top / targetHalfHeight, camera.zoom * EarthController.DOUBLE_CLICK_ORTHOGRAPHIC_MIN_ZOOM_FACTOR);
        if (targetZoom <= camera.zoom + 1e-9) return false;
        this.orthographicZoomTarget = targetZoom;
        this.orthographicZoomAnchorClient = new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(event.clientX, event.clientY);
        return true;
    }
    clearOrthographicZoomAnimation() {
        this.orthographicZoomTarget = null;
        this.orthographicZoomAnchorClient = null;
    }
    clearWheelZoomState() {
        this.wheelDelta = 0;
        this.zoomDelta.set(0, 0, 0);
        this.wheelPivot = null;
        this.zoomDistance = null;
        this.clearOrthographicZoomAnimation();
        this.resetWheelPickCache();
    }
    resetKeyboardMotionProfile(distance) {
        this.keyboardMaxSpeed = this.resolveKeyboardMaxSpeed(distance);
        this.keyboardCurrentSpeed = 0;
    }
    advanceKeyboardSpeed(deltaTime) {
        const acceleration = this.keyboardMaxSpeed / EarthController.KEYBOARD_ACCELERATION_DURATION;
        this.keyboardCurrentSpeed = Math.min(this.keyboardMaxSpeed, this.keyboardCurrentSpeed + acceleration * deltaTime);
        return this.keyboardCurrentSpeed * deltaTime;
    }
    resolveKeyboardMaxSpeed(distance) {
        return this.resolveKeyboardNavigationScale(distance ?? this.getCurrentRigDistance());
    }
    getCurrentRigDistance() {
        if (!this.services) return EarthController.MIN_KEYBOARD_MAX_SPEED;
        const current = this.services.rig.getState();
        return current.position.distanceTo(current.target);
    }
    resolveWheelNavigationScale(distance, absoluteMinimum = EarthController.NAVIGATION_SCALE_ABSOLUTE_MINIMUM) {
        return (0, __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.resolveNavigationScale)({
            cameraTargetDistance: distance,
            sceneBounds: null,
            absoluteMinimum
        });
    }
    resolveKeyboardNavigationScale(distance) {
        return (0, __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.resolveNavigationScale)({
            cameraTargetDistance: distance,
            sceneBounds: null,
            absoluteMinimum: EarthController.MIN_KEYBOARD_MAX_SPEED
        });
    }
    resolvePointerPanNavigationScale(distance, absoluteMinimum = EarthController.NAVIGATION_SCALE_ABSOLUTE_MINIMUM) {
        return (0, __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.resolveNavigationScale)({
            cameraTargetDistance: distance,
            sceneBounds: null,
            absoluteMinimum
        });
    }
    commitRigState(state) {
        if (!this.services) return;
        this.services.rig.setState(state);
        this.lastCommittedRigState = this.cloneCameraState(state);
    }
    rememberCurrentRigState() {
        if (!this.services) return;
        this.lastCommittedRigState = this.cloneCameraState(this.services.rig.getState());
    }
    resetKeyboardMotionProfileForExternalRigChange() {
        if (!this.services) return;
        const current = this.services.rig.getState();
        if (!this.lastCommittedRigState) {
            this.lastCommittedRigState = this.cloneCameraState(current);
            return;
        }
        if (this.cameraStateEquals(this.lastCommittedRigState, current)) return;
        if (0 === this.keyState.size && null === this.activeDragMode && 0 === this.wheelDelta && this.zoomDelta.lengthSq() <= 1e-12) this.resetKeyboardMotionProfile(current.position.distanceTo(current.target));
        this.lastCommittedRigState = this.cloneCameraState(current);
    }
    cloneCameraState(state) {
        return {
            ...state,
            position: state.position.clone(),
            target: state.target.clone(),
            up: state.up.clone()
        };
    }
    cameraStateEquals(a, b) {
        return a.mode === b.mode && Math.abs(a.fov - b.fov) <= 1e-9 && Math.abs(a.zoom - b.zoom) <= 1e-9 && a.position.distanceToSquared(b.position) <= 1e-18 && a.target.distanceToSquared(b.target) <= 1e-18 && a.up.distanceToSquared(b.up) <= 1e-18;
    }
    showPivotIndicator(point) {
        this.pivotIndicator.position.copy(point);
        this.pivotIndicator.visible = true;
    }
    hidePivotIndicator() {
        this.pivotIndicator.visible = false;
    }
    updatePivotIndicatorScale(camera) {
        if (!this.pivotIndicator.visible) return;
        const viewportHeight = Math.max(this.services?.getViewportSize().height ?? 0, 1);
        const distance = Math.max(camera.position.distanceTo(this.pivotIndicator.position), 1e-6);
        const radius = this.projectedRadius(1, camera, distance, viewportHeight);
        const scale = radius <= 1e-6 ? 1 : EarthController.PIVOT_INDICATOR_PIXEL_RADIUS / radius;
        this.pivotIndicator.scale.setScalar(scale);
    }
    projectedRadius(radius, camera, distance, viewportHeight) {
        if (camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.PerspectiveCamera) {
            const fov = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.degToRad(camera.fov);
            return viewportHeight * radius / (2 * distance * Math.tan(fov / 2));
        }
        if (camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.OrthographicCamera) return viewportHeight * radius / Math.max(camera.top - camera.bottom, 1e-6);
        return 1;
    }
    updatePivotFromEvent(event, interactionType, updateTarget) {
        const pivot = this.pickPivot(event, interactionType);
        if (!pivot) return;
        this.cursor.copy(pivot);
        if (updateTarget) {
            this.target.copy(pivot);
            if (this.services) {
                const camera = this.object;
                camera.updateMatrixWorld(true);
                (0, __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.syncRigFromCamera)(this.services, camera, this.target);
                this.rememberCurrentRigState();
            }
        }
    }
    pickPivot(event, interactionType) {
        return this.pickSurfaceHit(event, interactionType)?.point.clone() ?? null;
    }
    pickSurfaceHit(event, interactionType) {
        if (!this.services?.surfaceQuery || !this.domElement) return null;
        const screen = new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(event.clientX, event.clientY);
        const camera = this.syncFromRig();
        return this.services.surfaceQuery.queryAtScreen(screen, camera, {
            kinds: [
                'pointCloud',
                'gaussian-splat'
            ],
            interactionType,
            centerSphereRadius: 'move' === interactionType ? EarthController.GSPLAT_HOVER_RADIUS : void 0
        });
    }
    getWheelPivot(event) {
        const reusablePivot = this.getReusableWheelPivot(event);
        if (void 0 !== reusablePivot) return reusablePivot;
        const pivot = this.pickPivot(event, 'move');
        this.cacheWheelPivot(event, pivot);
        return pivot;
    }
    getReusableWheelPivot(event) {
        if (!this.lastWheelPickScreen || performance.now() - this.lastWheelPickAt > EarthController.WHEEL_PICK_REUSE_MS) return;
        const deltaX = event.clientX - this.lastWheelPickScreen.x;
        const deltaY = event.clientY - this.lastWheelPickScreen.y;
        const maxDistance = EarthController.WHEEL_PICK_REUSE_DISTANCE_PX;
        if (deltaX * deltaX + deltaY * deltaY > maxDistance * maxDistance) return;
        return this.lastWheelPickedPivot?.clone() ?? null;
    }
    cacheWheelPivot(event, pivot) {
        if (!this.lastWheelPickScreen) this.lastWheelPickScreen = new __WEBPACK_EXTERNAL_MODULE_three__.Vector2();
        this.lastWheelPickScreen.set(event.clientX, event.clientY);
        this.lastWheelPickAt = performance.now();
        this.lastWheelPickedPivot = pivot?.clone() ?? null;
    }
    resetWheelPickCache() {
        this.lastWheelPickAt = -1 / 0;
        this.lastWheelPickedPivot = null;
        this.lastWheelPickScreen = null;
    }
    prewarmGsplatGpuPick(event) {
        if (!this.services?.picking || !this.canPrewarmGsplatGpuPick()) return;
        const screen = new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(event.clientX, event.clientY);
        const camera = this.syncFromRig();
        camera.updateMatrixWorld(true);
        this.lastGpuPrewarmAt = performance.now();
        this.services.picking.pickAtScreen(screen, camera, {
            kinds: [
                'gaussian-splat'
            ],
            interactionType: 'move',
            centerSphereRadius: EarthController.GSPLAT_HOVER_RADIUS,
            gpuOnly: true,
            prewarmGpu: true
        });
    }
    canPrewarmGsplatGpuPick() {
        if (this.isActivating || null !== this.activePointerId || null !== this.activeDragMode || this.keyState.size > 0 || 0 !== this.wheelDelta || this.zoomDelta.lengthSq() > 1e-12 || null !== this.orthographicZoomTarget) return false;
        const now = performance.now();
        return now - this.lastCameraMotionAt >= EarthController.GPU_PREWARM_MOTION_COOLDOWN_MS && now - this.lastGpuPrewarmAt >= EarthController.GPU_PREWARM_THROTTLE_MS;
    }
    markCameraMotion() {
        this.lastCameraMotionAt = performance.now();
    }
    getFallbackPivot() {
        const camera = this.syncFromRig();
        const width = Math.max(this.domElement?.clientWidth ?? 1, 1);
        const height = Math.max(this.domElement?.clientHeight ?? 1, 1);
        const ndc = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 0.78);
        ndc.x = 0.5 * width / width * 2 - 1;
        ndc.y = -(0.5 * height / height * 2 - 1);
        return ndc.unproject(camera);
    }
}
export { EarthController };
