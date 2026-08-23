import * as __WEBPACK_EXTERNAL_MODULE__3dconnexion_3dconnexionjs_1e8e8793__ from "@3dconnexion/3dconnexionjs";
import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__ from "../../shared/logging/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_c632c149__ from "../../shared/types/assets.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_30373853__ from "../../shared/types/core.js";
import * as __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__ from "./NativeControlUtils.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__.getLoggerManager)().getLogger('control');
const DEFAULT_APP_NAME = 'SHARE3D Engine';
const DEFAULT_EXTENT = 15;
const DEFAULT_UNITS_TO_METERS = 10;
const CAMERA_EPSILON = 1e-5;
const PIVOT_RING_PIXEL_RADIUS = 44;
const PIVOT_RING_BASE_RADIUS = 1;
const PIVOT_RING_TUBE_RADIUS = 0.028;
const PIVOT_CENTER_PIXEL_RADIUS = 7;
const PIVOT_CENTER_BASE_RADIUS = 0.18;
const DEFAULT_PICK_RADIUS = 0.08;
const LEGACY_ROTATION_SPEED = 10;
const LEGACY_WHEEL_FADE_FACTOR = 20;
const LEGACY_WHEEL_STEP_RATIO = 0.2;
const MAX_ABSOLUTE_PITCH = Math.PI / 2 - 1e-3;
const ROTATE_MODE_TRANSITION_DURATION_MS = 180;
const DEFAULT_FRAME_DELTA = 1 / 60;
const DEFAULT_PRESENCE_POLL_INTERVAL_MS = 1000;
const MIN_KEYBOARD_MAX_SPEED = 1;
const KEYBOARD_ACCELERATION_DURATION = 1.0;
const NAVIGATION_SCALE_ABSOLUTE_MINIMUM = __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.DEFAULT_NAVIGATION_SCALE_ABSOLUTE_MINIMUM;
const WHEEL_MIN_STEP_RATIO = __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.DEFAULT_WHEEL_MIN_STEP_RATIO;
const WHEEL_ABSOLUTE_MIN_STEP = __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.DEFAULT_WHEEL_ABSOLUTE_MIN_STEP;
const DOUBLE_CLICK_ORTHOGRAPHIC_MIN_ZOOM_FACTOR = 2.5;
const GPU_PREWARM_THROTTLE_MS = 48;
const GPU_PREWARM_MOTION_COOLDOWN_MS = 120;
const WHEEL_PICK_REUSE_MS = 120;
const WHEEL_PICK_REUSE_DISTANCE_PX = 2;
const IDENTITY_16 = [
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1
];
const SPACEMOUSE_ACTIONSET_NODE = 0;
const SPACEMOUSE_CATEGORY_NODE = 1;
const SPACEMOUSE_ACTION_NODE = 2;
const SPACEMOUSE_ROTATE_ACTION_SET_ID = 'mouseRotateMode';
const SPACEMOUSE_ROTATE_CATEGORY_ID = 'mouseRotateMode.category';
const SPACEMOUSE_ROTATE_ARCBALL_COMMAND_ID = 'mouseRotateMode.arcball';
const SPACEMOUSE_ROTATE_YAW_PITCH_COMMAND_ID = 'mouseRotateMode.yawPitch';
const SPACEMOUSE_TARGET_CATEGORY_ID = 'mouseTargetMode.category';
const SPACEMOUSE_TARGET_BOUNDS_CENTER_COMMAND_ID = 'mouseTargetMode.boundsCenter';
const SPACEMOUSE_TARGET_CAPTURED_POINT_COMMAND_ID = 'mouseTargetMode.capturedPoint';
const SPACEMOUSE_HISTORY_CATEGORY_ID = 'appHistory.category';
const SPACEMOUSE_UNDO_COMMAND_ID = 'app.undo';
const SPACEMOUSE_REDO_COMMAND_ID = 'app.redo';
const CAMERA_LOCAL_RIGHT = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1, 0, 0);
const CAMERA_LOCAL_UP = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 1, 0);
const CAMERA_LOCAL_FORWARD = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, -1);
const WORLD_UP = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 1);
const WORLD_RIGHT = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1, 0, 0);
const WORLD_FORWARD = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 1, 0);
const SCRATCH_V3 = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
const SCRATCH_Q = new __WEBPACK_EXTERNAL_MODULE_three__.Quaternion();
const SCRATCH_M4 = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4();
const SPACEMOUSE_FRONT_VIEW = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4().makeBasis(WORLD_RIGHT, WORLD_UP, WORLD_FORWARD.clone().negate()).toArray();
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
function isEditableElement(target) {
    if (!(target instanceof HTMLElement)) return false;
    if (target.isContentEditable) return true;
    const tagName = target.tagName;
    return 'INPUT' === tagName || 'TEXTAREA' === tagName || 'SELECT' === tagName;
}
function cloneCameraState(state) {
    return {
        position: state.position.clone(),
        target: state.target.clone(),
        up: state.up.clone(),
        fov: state.fov,
        zoom: state.zoom,
        mode: state.mode,
        roll: state.roll
    };
}
function vectorEquals(a, b, epsilon = CAMERA_EPSILON) {
    return a.distanceToSquared(b) <= epsilon * epsilon;
}
function stateEquals(a, b) {
    if (!a) return false;
    return a.mode === b.mode && Math.abs(a.fov - b.fov) <= CAMERA_EPSILON && Math.abs(a.zoom - b.zoom) <= CAMERA_EPSILON && vectorEquals(a.position, b.position) && vectorEquals(a.target, b.target) && vectorEquals(a.up, b.up);
}
class SpaceMouseController extends __WEBPACK_EXTERNAL_MODULE_three__.Controls {
    constructor(options){
        const camera = (0, __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.syncViewportCameraFromRig)(options.services);
        super(camera, null), this.kind = 'spacemouse-overlay', this.phases = [
            __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_c632c149__.RenderPhase.Overlay3D
        ], this.renderPriority = 0, this.rotateSpeed = 1, this.panSpeed = 1, this.zoomSpeed = 1, this.pivot = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(), this.navTarget = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(), this.services = null, this.perspectiveDeviceCamera = new __WEBPACK_EXTERNAL_MODULE_three__.PerspectiveCamera(), this.orthographicDeviceCamera = new __WEBPACK_EXTERNAL_MODULE_three__.OrthographicCamera(), this.deviceCamera = this.perspectiveDeviceCamera, this.offset = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(), this.rotation = new __WEBPACK_EXTERNAL_MODULE_three__.Quaternion(), this.lastPointer = new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(), this.startArcballDir = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(), this.startQuat = new __WEBPACK_EXTERNAL_MODULE_three__.Quaternion(), this.arcballCenterScreen = new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(), this.lastRight = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(), this.lastUp = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(), this.lastForward = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(), this.arcballDir = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(), this.currentMouseScreen = new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(), this.ringGizmo = new __WEBPACK_EXTERNAL_MODULE_three__.Group(), this.overlayScene = new __WEBPACK_EXTERNAL_MODULE_three__.Scene(), this.ringMaterials = [], this.centerSphereMaterial = null, this.lookFrom = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(), this.lookDirection = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, -1), this.transitionWorldPosition = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(), this.transitionFromRotation = new __WEBPACK_EXTERNAL_MODULE_three__.Quaternion(), this.transitionToRotation = new __WEBPACK_EXTERNAL_MODULE_three__.Quaternion(), this.keyState = new Set(), this.glState = {
            viewportWidth: 1,
            viewportHeight: 1,
            fov: 60,
            frustumNear: 0.1,
            frustumFar: 1000,
            left: -1,
            right: 1,
            bottom: -1,
            top: 1
        }, this.nav = null, this.navIsActive = false, this.navCreated = false, this.selectionOnly = false, this.pointerState = 'none', this.activePointerId = null, this.lastCommittedState = null, this.hasInternalState = false, this.lastStableYaw = 0, this.pointerDragStarted = false, this.pendingRotatePivot = null, this.wheelDelta = 0, this.zoomDelta = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(), this.wheelPivot = null, this.zoomDistance = null, this.orthographicZoomTarget = null, this.orthographicZoomAnchorClient = null, this.keyboardMaxSpeed = MIN_KEYBOARD_MAX_SPEED, this.keyboardCurrentSpeed = 0, this.lastCameraMotionAt = -1 / 0, this.lastGpuPrewarmAt = -1 / 0, this.lastWheelPickAt = -1 / 0, this.lastWheelPickScreen = null, this.lastWheelPickedPivot = null, this.boundPointerDown = null, this.boundPointerMove = null, this.boundPointerUp = null, this.boundWheel = null, this.boundDoubleClick = null, this.boundContextMenu = null, this.boundKeyDown = null, this.boundKeyUp = null, this.boundBlur = null, this.boundDocumentPointerDown = null, this.boundDocumentFocusIn = null, this.focusRestoreTimer = 0, this.focusRestoreFrame = 0, this.interactionElement = null, this.lastKnownControlMode = 'none', this.mouseRotateMode = 'arcball', this.mouseTargetMode = 'bounds-center', this.mouseNavigationProfile = 'hybrid', this.promoteHybridProfileOnNextConfirmed3DMouseInput = false, this.lastResolved3DMousePresence = null, this.presencePollHandle = 0, this.presenceRequestVersion = 0, this.rotationLocked = false, this.deviceNavigationEnabled = true, this.pivotGizmoEnabled = true, this.appCommandHandlers = {}, this.lastCapturedPoint = null, this.rotateModeTransitionEndTime = 0, this.handleControlModeChanged = (payload)=>{
            this.lastKnownControlMode = payload.mode;
        };
        this.services = options.services;
        this.enabled = false;
        this.rotateSpeed = options.rotateSpeed ?? 1;
        this.panSpeed = options.panSpeed ?? 1;
        this.zoomSpeed = options.zoomSpeed ?? 1;
        this.appName = options.appName ?? DEFAULT_APP_NAME;
        this.unitsToMeters = options.unitsToMeters ?? DEFAULT_UNITS_TO_METERS;
        this.presenceProvider = options.presenceProvider ?? null;
        this.presencePollIntervalMs = Math.max(0, options.presencePollIntervalMs ?? DEFAULT_PRESENCE_POLL_INTERVAL_MS);
        this.lastKnownControlMode = 'none';
        this.applyNavigationProfile(options.navigationProfile ?? 'hybrid', {
            syncCommandState: false,
            requestFocus: false
        });
        this.initializePivotRings();
        this.services.events?.on('controls.modeChanged', this.handleControlModeChanged);
        this.syncInternalFromRig(true);
        this.syncDeviceCameraFromRig();
    }
    get isSpaceMouseActive() {
        return this.navIsActive;
    }
    getMouseRotateMode() {
        return this.mouseRotateMode;
    }
    getNavigationProfile() {
        return this.mouseNavigationProfile;
    }
    setNavigationProfile(profile) {
        this.promoteHybridProfileOnNextConfirmed3DMouseInput = false;
        this.applyNavigationProfile(profile, {
            syncCommandState: true,
            requestFocus: true
        });
    }
    setMouseRotateMode(mode) {
        this.promoteHybridProfileOnNextConfirmed3DMouseInput = false;
        if (this.mouseRotateMode === mode) return;
        if ('yaw-pitch' === mode) this.beginYawPitchTransition();
        else this.rotateModeTransitionEndTime = 0;
        this.mouseRotateMode = mode;
        this.syncNavigationProfileFromModes();
        this.sync3DMouseCommandState();
        this.requestFocusRecovery();
    }
    getMouseTargetMode() {
        return this.mouseTargetMode;
    }
    setMouseTargetMode(mode) {
        this.promoteHybridProfileOnNextConfirmed3DMouseInput = false;
        if (this.mouseTargetMode === mode) return;
        this.mouseTargetMode = mode;
        this.syncNavigationProfileFromModes();
        this.sync3DMouseCommandState();
        this.requestFocusRecovery();
    }
    getRotationLocked() {
        return this.rotationLocked;
    }
    setRotationLocked(locked) {
        this.promoteHybridProfileOnNextConfirmed3DMouseInput = false;
        if (this.rotationLocked === locked) return;
        this.rotationLocked = locked;
        if (locked) this.rotateModeTransitionEndTime = 0;
        this.syncNavigationProfileFromModes();
        this.sync3DMouseCommandState();
        this.requestFocusRecovery();
    }
    get3DMouseNavigationEnabled() {
        return this.deviceNavigationEnabled;
    }
    set3DMouseNavigationEnabled(enabled) {
        if (this.deviceNavigationEnabled === enabled) return;
        this.deviceNavigationEnabled = enabled;
        if (!enabled) {
            this.navIsActive = false;
            this.promoteHybridProfileOnNextConfirmed3DMouseInput = false;
        }
        this.sync3DMouseCommandState();
        this.requestFocusRecovery();
    }
    getPivotGizmoEnabled() {
        return this.pivotGizmoEnabled;
    }
    setPivotGizmoEnabled(enabled) {
        if (this.pivotGizmoEnabled === enabled) return;
        this.pivotGizmoEnabled = enabled;
        if (!enabled) {
            this.hidePivotRings();
            return;
        }
        this.showPivotRings();
    }
    clearCapturedPivot() {
        if ('none' !== this.pointerState) return;
        this.lastCapturedPoint = null;
        this.pendingRotatePivot = null;
        if (!this.services) return;
        const camera = this.syncManagedCameraFromRig();
        this.pivot.copy(this.resolveBoundsCenterPivot());
        this.syncOffsetFromPosition(camera);
        this.syncNavTargetFromCamera(camera);
        this.updatePivotRings(camera);
        this.sync3DMouseCommandState();
    }
    setAppCommandHandlers(handlers) {
        this.appCommandHandlers = {
            undo: handlers?.undo,
            redo: handlers?.redo
        };
    }
    clearAppCommandHandlers() {
        this.appCommandHandlers = {};
    }
    connect(element) {
        if (!this.services) return;
        const interactionElement = this.services.rendererDomElement ?? element;
        this.interactionElement = interactionElement;
        if (!interactionElement.hasAttribute('tabindex')) interactionElement.setAttribute('tabindex', '0');
        super.connect(interactionElement);
        const shouldResetPivot = !this.hasInternalState || 'spacemouse' !== this.lastKnownControlMode;
        this.syncInternalFromRig(shouldResetPivot);
        this.syncDeviceCameraFromRig();
        this.showPivotRings();
        this.installMouseHandlers(interactionElement);
        this.promoteHybridProfileOnNextConfirmed3DMouseInput = true;
        this.lastResolved3DMousePresence = null;
        this.refreshNavigationProfileFromPresence();
        this.startPresencePolling();
        this.connect3DMouse(interactionElement);
        interactionElement.focus();
    }
    disconnect() {
        this.removeMouseHandlers();
        this.stopPresencePolling();
        this.lastResolved3DMousePresence = null;
        this.presenceRequestVersion += 1;
        this.disconnect3DMouse();
        this.interactionElement = null;
        this.hidePivotRings();
        this.stop();
    }
    dispose() {
        this.disconnect();
        this.services?.events?.off('controls.modeChanged', this.handleControlModeChanged);
        this.disposePivotRings();
    }
    update(deltaTime) {
        if (!this.enabled || !this.services) return;
        const camera = this.syncManagedCameraFromRig();
        if (this.services.rig.isTransitioning) {
            camera.updateMatrixWorld(true);
            this.updatePivotRings(camera);
            this.syncDeviceCameraFromRig();
            return;
        }
        if (this.shouldSyncInternalFromRig()) {
            const state = this.services.rig.getState();
            const shouldResetPivot = !this.hasInternalState || this.shouldRefreshBoundsCenterPivotFromRig();
            this.syncInternalFromCamera(camera, shouldResetPivot);
            if (!shouldResetPivot) this.navTarget.copy(state.target);
            this.resetKeyboardMotionProfile(state.position.distanceTo(state.target));
        }
        this.stepRotateModeTransition();
        if (this.nav && this.navIsActive) {
            this.syncDeviceCameraFromRig();
            this.updatePivotRings(camera);
            this.nav.update3dcontroller({
                frame: {
                    time: performance.now()
                }
            });
            return;
        }
        if ('none' === this.pointerState) {
            this.updateLegacyWheelZoom();
            this.updateOrthographicZoomAnimation(camera, deltaTime);
            this.updateKeyboardTranslation(deltaTime);
        }
        this.applyStateToCamera(camera);
        this.updatePivotRings(camera);
        this.commitCameraToRig(camera);
        this.syncDeviceCameraFromRig();
    }
    render(frame, _phase, ctx) {
        if (!this.enabled || !this.ringGizmo.visible || this.services?.viewId != null && ctx.viewId !== this.services.viewId) return;
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
    stop() {
        this.pointerState = 'none';
        this.activePointerId = null;
        this.pointerDragStarted = false;
        this.pendingRotatePivot = null;
        this.navIsActive = false;
        this.clearWheelZoomState();
        this.keyState.clear();
        this.keyboardCurrentSpeed = 0;
    }
    syncManagedCameraFromRig() {
        if (!this.services) return this.object;
        const camera = (0, __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.syncViewportCameraFromRig)(this.services);
        if (this.object !== camera) this.object = camera;
        this.updateViewportMetrics();
        return camera;
    }
    syncInternalFromRig(resetPivot) {
        const camera = this.syncManagedCameraFromRig();
        const state = this.services.rig.getState();
        this.syncInternalFromCamera(camera, resetPivot || this.shouldRefreshBoundsCenterPivotFromRig());
        this.navTarget.copy(state.target);
        this.resetKeyboardMotionProfile(state.position.distanceTo(state.target));
        this.lastCommittedState = cloneCameraState(state);
    }
    syncInternalFromCamera(camera, resetPivot) {
        if (resetPivot || !this.hasInternalState) {
            this.pivot.copy(this.getEffectiveTargetPivot());
            this.syncNavTargetToEffectivePivot();
        }
        this.rotation.copy(camera.quaternion);
        this.syncOffsetFromPosition(camera);
        this.refreshAxesFromQuat();
        this.getStableYaw(this.lastForward);
        this.hasInternalState = true;
        if ('rotate' === this.pointerState) {
            this.startQuat.copy(this.rotation);
            this.startArcballDir.copy(this.mouseToArcballDir(this.lastPointer.x, this.lastPointer.y));
        }
        this.updatePivotRings(camera);
    }
    resolveBoundsCenterPivot() {
        if (!this.services) return new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        const bounds = this.services.getSceneBounds?.('fit') ?? this.services.getSceneBounds?.();
        if (bounds && !bounds.isEmpty()) return bounds.getCenter(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3());
        if (this.hasInternalState) return this.pivot.clone();
        return this.services.rig.target;
    }
    shouldRefreshBoundsCenterPivotFromRig() {
        return this.hasInternalState && 'none' === this.pointerState && !this.navIsActive && 'bounds-center' === this.mouseTargetMode;
    }
    getEffectiveTargetPivot() {
        if ('captured-point' === this.mouseTargetMode && this.lastCapturedPoint) return this.lastCapturedPoint.clone();
        return this.resolveBoundsCenterPivot();
    }
    syncNavTargetToEffectivePivot() {
        this.navTarget.copy(this.getEffectiveTargetPivot());
    }
    resolveNavigationProfileFromModes() {
        if ('yaw-pitch' === this.mouseRotateMode && 'captured-point' === this.mouseTargetMode) return 'mouse-only';
        if ('arcball' === this.mouseRotateMode && 'bounds-center' === this.mouseTargetMode) return 'hybrid';
        return null;
    }
    syncNavigationProfileFromModes() {
        this.mouseNavigationProfile = this.resolveNavigationProfileFromModes();
        this.emitNavigationStateChanged();
    }
    applyNavigationProfile(profile, options) {
        const nextState = 'mouse-only' === profile ? {
            rotateMode: 'yaw-pitch',
            targetMode: 'captured-point'
        } : {
            rotateMode: 'arcball',
            targetMode: 'bounds-center'
        };
        const rotateModeChanged = this.mouseRotateMode !== nextState.rotateMode;
        if (rotateModeChanged) {
            if ('yaw-pitch' === nextState.rotateMode) this.beginYawPitchTransition();
            else this.rotateModeTransitionEndTime = 0;
        }
        this.mouseRotateMode = nextState.rotateMode;
        this.mouseTargetMode = nextState.targetMode;
        this.mouseNavigationProfile = profile;
        this.emitNavigationStateChanged();
        if (options.syncCommandState) this.sync3DMouseCommandState();
        if (options.requestFocus) this.requestFocusRecovery();
    }
    startPresencePolling() {
        if (!this.presenceProvider || this.presencePollIntervalMs <= 0) return;
        this.stopPresencePolling();
        this.presencePollHandle = window.setInterval(()=>{
            this.refreshNavigationProfileFromPresence();
        }, this.presencePollIntervalMs);
    }
    stopPresencePolling() {
        if (0 === this.presencePollHandle) return;
        window.clearInterval(this.presencePollHandle);
        this.presencePollHandle = 0;
    }
    refreshNavigationProfileFromPresence() {
        if (!this.presenceProvider) return;
        const requestVersion = ++this.presenceRequestVersion;
        try {
            const result = this.presenceProvider();
            if ('boolean' == typeof result) {
                this.applyDetected3DMousePresence(result, requestVersion);
                return;
            }
            Promise.resolve(result).then((present)=>{
                this.applyDetected3DMousePresence(Boolean(present), requestVersion);
            }).catch(()=>{});
        } catch  {}
    }
    isPresetActive(profile) {
        if ('mouse-only' === profile) return 'mouse-only' === this.mouseNavigationProfile && 'yaw-pitch' === this.mouseRotateMode && 'captured-point' === this.mouseTargetMode;
        return 'hybrid' === this.mouseNavigationProfile && 'arcball' === this.mouseRotateMode && 'bounds-center' === this.mouseTargetMode;
    }
    applyDetected3DMousePresence(present, requestVersion) {
        if (requestVersion !== this.presenceRequestVersion || !this.interactionElement) return;
        const previousPresence = this.lastResolved3DMousePresence;
        this.lastResolved3DMousePresence = present;
        this.promoteHybridProfileOnNextConfirmed3DMouseInput = !present;
        if (previousPresence === present) return;
        const targetProfile = present ? 'hybrid' : 'mouse-only';
        if (this.isPresetActive(targetProfile)) return;
        this.applyNavigationProfile(targetProfile, {
            syncCommandState: true,
            requestFocus: false
        });
    }
    promoteNavigationProfileForConfirmed3DMouseInput() {
        if (!this.promoteHybridProfileOnNextConfirmed3DMouseInput) return;
        this.promoteHybridProfileOnNextConfirmed3DMouseInput = false;
        if ('hybrid' === this.mouseNavigationProfile && 'arcball' === this.mouseRotateMode && 'bounds-center' === this.mouseTargetMode && !this.rotationLocked) return;
        this.applyNavigationProfile('hybrid', {
            syncCommandState: false,
            requestFocus: false
        });
    }
    emitNavigationStateChanged() {
        this.services?.events?.emit('controls.spacemouseNavigationChanged', {
            viewId: this.services?.viewId ?? null,
            profile: this.mouseNavigationProfile,
            rotateMode: this.mouseRotateMode,
            targetMode: this.mouseTargetMode,
            rotationLocked: this.rotationLocked
        });
    }
    pickSurfaceHitAtScreen(screen, camera, interactionType = 'move') {
        if (!this.services?.surfaceQuery || !this.domElement) return null;
        const { width, height } = this.services.getViewportSize();
        if (width <= 0 || height <= 0) return null;
        if (screen.x < 0 || screen.y < 0 || screen.x > width || screen.y > height) return null;
        const rect = this.domElement.getBoundingClientRect();
        const screenInWindow = screen.clone().add(new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(rect.left, rect.top));
        return this.services.surfaceQuery.queryAtScreen(screenInWindow, camera, {
            kinds: [
                'pointCloud',
                'gaussian-splat'
            ],
            interactionType,
            centerSphereRadius: 'move' === interactionType ? DEFAULT_PICK_RADIUS : void 0
        });
    }
    prewarmGsplatGpuPick() {
        if (!this.services?.picking || !this.domElement || !this.canPrewarmGsplatGpuPick()) return;
        const { width, height } = this.services.getViewportSize();
        if (width <= 0 || height <= 0) return;
        if (this.currentMouseScreen.x < 0 || this.currentMouseScreen.y < 0 || this.currentMouseScreen.x > width || this.currentMouseScreen.y > height) return;
        const rect = this.domElement.getBoundingClientRect();
        const screenInWindow = this.currentMouseScreen.clone().add(new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(rect.left, rect.top));
        const camera = this.syncManagedCameraFromRig();
        camera.updateMatrixWorld(true);
        this.lastGpuPrewarmAt = performance.now();
        this.services.picking.pickAtScreen(screenInWindow, camera, {
            kinds: [
                'gaussian-splat'
            ],
            interactionType: 'move',
            centerSphereRadius: DEFAULT_PICK_RADIUS,
            gpuOnly: true,
            prewarmGpu: true
        });
    }
    syncOffsetFromPosition(camera) {
        SCRATCH_V3.subVectors(camera.position, this.pivot);
        this.offset.copy(SCRATCH_V3.applyQuaternion(SCRATCH_Q.copy(this.rotation).invert()));
    }
    syncOffsetFromWorldPosition(position) {
        SCRATCH_V3.subVectors(position, this.pivot);
        this.offset.copy(SCRATCH_V3.applyQuaternion(SCRATCH_Q.copy(this.rotation).invert()));
    }
    refreshAxesFromQuat() {
        this.lastRight.copy(CAMERA_LOCAL_RIGHT).applyQuaternion(this.rotation);
        this.lastUp.copy(CAMERA_LOCAL_UP).applyQuaternion(this.rotation);
        this.lastForward.copy(CAMERA_LOCAL_FORWARD).applyQuaternion(this.rotation);
    }
    getCurrentViewState() {
        const position = this.pivot.clone().add(SCRATCH_V3.copy(this.offset).applyQuaternion(this.rotation));
        const forward = CAMERA_LOCAL_FORWARD.clone().applyQuaternion(this.rotation).normalize();
        const target = this.navTarget.clone();
        const distance = Math.max(position.distanceTo(target), 0.1);
        return {
            position,
            forward,
            target,
            distance
        };
    }
    applyWheelCameraState(position, target, options = {}) {
        this.navTarget.copy(target);
        this.pivot.copy(options.preserveRotationPivot ? this.getEffectiveTargetPivot() : target);
        this.syncOffsetFromWorldPosition(position);
        this.refreshAxesFromQuat();
    }
    translateView(movement, options = {}) {
        if (movement.lengthSq() <= 1e-12) return;
        this.pivot.add(movement);
        this.navTarget.add(movement);
        if (options.includeCapturedPoint && this.lastCapturedPoint) this.lastCapturedPoint.add(movement);
    }
    syncInteractiveViewState() {
        const camera = this.syncManagedCameraFromRig();
        this.applyStateToCamera(camera);
        this.syncNavTargetFromCamera(camera);
        this.updatePivotRings(camera);
        this.commitCameraToRig(camera);
        this.syncDeviceCameraFromRig();
    }
    syncNavTargetFromCamera(camera) {
        const forward = CAMERA_LOCAL_FORWARD.clone().applyQuaternion(camera.quaternion).normalize();
        const distance = Math.max(camera.position.distanceTo(this.navTarget), 0.1);
        this.navTarget.copy(camera.position.clone().addScaledVector(forward, distance));
    }
    applyOrthographicWheelZoom(event, camera) {
        if (!this.domElement || 0 === this.zoomSpeed) return false;
        const rect = this.domElement.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return false;
        const normalizedDelta = Math.abs(0.01 * event.deltaY);
        if (normalizedDelta <= 0) return false;
        const dollyScale = 0.95 ** (this.zoomSpeed * normalizedDelta);
        if (!Number.isFinite(dollyScale) || dollyScale <= 0) return false;
        const previousZoom = camera.zoom;
        const nextZoom = event.deltaY < 0 ? camera.zoom / dollyScale : camera.zoom * dollyScale;
        if (!this.applyOrthographicZoomAtClientPoint(camera, event.clientX, event.clientY, nextZoom)) return false;
        return Math.abs(camera.zoom - previousZoom) > CAMERA_EPSILON;
    }
    applyOrthographicZoomAtClientPoint(camera, clientX, clientY, zoom) {
        if (!this.domElement) return false;
        const rect = this.domElement.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return false;
        const mouseX = (clientX - rect.left) / rect.width * 2 - 1;
        const mouseY = 2 * -((clientY - rect.top) / rect.height) + 1;
        const mouseBefore = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(mouseX, mouseY, 0).unproject(camera);
        const previousZoom = camera.zoom;
        camera.zoom = Math.max(CAMERA_EPSILON, zoom);
        if (Math.abs(camera.zoom - previousZoom) <= CAMERA_EPSILON) return false;
        camera.updateProjectionMatrix();
        const mouseAfter = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(mouseX, mouseY, 0).unproject(camera);
        const translation = mouseBefore.sub(mouseAfter);
        camera.position.add(translation);
        camera.updateMatrixWorld(true);
        this.pivot.add(translation);
        this.navTarget.add(translation);
        this.syncOffsetFromPosition(camera);
        this.refreshAxesFromQuat();
        return true;
    }
    updateOrthographicZoomAnimation(camera, deltaTime) {
        if (!(camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.OrthographicCamera) || null == this.orthographicZoomTarget || !this.orthographicZoomAnchorClient) return false;
        const targetZoom = this.orthographicZoomTarget;
        const currentZoom = camera.zoom;
        const remaining = targetZoom - currentZoom;
        if (remaining <= CAMERA_EPSILON) {
            this.clearOrthographicZoomAnimation();
            return false;
        }
        const safeDelta = deltaTime && Number.isFinite(deltaTime) && deltaTime > 0 ? deltaTime : DEFAULT_FRAME_DELTA;
        const fade = 0.5 ** (LEGACY_WHEEL_FADE_FACTOR * safeDelta);
        const progression = 1 - fade;
        const nextZoom = Math.min(targetZoom, currentZoom + remaining * progression);
        const changed = this.applyOrthographicZoomAtClientPoint(camera, this.orthographicZoomAnchorClient.x, this.orthographicZoomAnchorClient.y, nextZoom);
        if (!changed) {
            this.clearOrthographicZoomAnimation();
            return false;
        }
        if (targetZoom - camera.zoom <= CAMERA_EPSILON) this.clearOrthographicZoomAnimation();
        this.markCameraMotion();
        return true;
    }
    clearOrthographicZoomAnimation() {
        this.orthographicZoomTarget = null;
        this.orthographicZoomAnchorClient = null;
    }
    startOrthographicDoubleClickZoom(event, camera, hit) {
        const current = this.getCurrentViewState();
        const navigationScale = this.resolveWheelNavigationScale(current.distance);
        const targetRadius = (0, __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.resolveDoubleClickTargetRadius)(hit, navigationScale, WHEEL_MIN_STEP_RATIO, WHEEL_ABSOLUTE_MIN_STEP);
        const targetHalfHeight = Math.max(targetRadius / Math.tan(__WEBPACK_EXTERNAL_MODULE_three__.MathUtils.degToRad(this.services?.rig.fov ?? 60) / 2), CAMERA_EPSILON);
        const targetZoom = Math.max(camera.top / targetHalfHeight, camera.zoom * DOUBLE_CLICK_ORTHOGRAPHIC_MIN_ZOOM_FACTOR);
        if (targetZoom <= camera.zoom + CAMERA_EPSILON) return false;
        this.orthographicZoomTarget = targetZoom;
        this.orthographicZoomAnchorClient = new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(event.clientX, event.clientY);
        return true;
    }
    beginRotateGesture(camera) {
        const nextPivot = 'captured-point' === this.mouseTargetMode && this.pendingRotatePivot ? this.pendingRotatePivot.clone() : this.getEffectiveTargetPivot();
        if ('captured-point' === this.mouseTargetMode && this.pendingRotatePivot) this.lastCapturedPoint = this.pendingRotatePivot.clone();
        this.pivot.copy(nextPivot);
        this.syncOffsetFromPosition(camera);
        this.syncNavTargetFromCamera(camera);
        if ('captured-point' === this.mouseTargetMode && this.pendingRotatePivot) this.emitNavigationStateChanged();
        this.arcballCenterScreen.copy(this.pivotToScreen());
        this.refreshAxesFromQuat();
        this.startArcballDir.copy(this.mouseToArcballDir(this.lastPointer.x, this.lastPointer.y));
        this.startQuat.copy(this.rotation);
        this.pendingRotatePivot = null;
    }
    capturePanPivotAtPointer(event, camera) {
        if ('captured-point' !== this.mouseTargetMode) return;
        const pivot = this.pickPivotAtPointer(event, camera, 'click');
        if (!pivot) return;
        this.lastCapturedPoint = pivot.clone();
        this.pivot.copy(pivot);
        this.syncOffsetFromPosition(camera);
        this.syncNavTargetFromCamera(camera);
        this.emitNavigationStateChanged();
    }
    applyStateToCamera(camera) {
        camera.position.copy(this.pivot).add(SCRATCH_V3.copy(this.offset).applyQuaternion(this.rotation));
        camera.quaternion.copy(this.rotation);
        camera.up.copy(CAMERA_LOCAL_UP).applyQuaternion(this.rotation);
        camera.updateMatrixWorld(true);
    }
    commitCameraToRig(camera) {
        if (!this.services) return;
        const previous = this.services.rig.getState();
        const position = camera.position.clone();
        const up = CAMERA_LOCAL_UP.clone().applyQuaternion(camera.quaternion).normalize();
        const target = this.navTarget.clone();
        const nextState = {
            ...previous,
            position,
            target,
            up,
            fov: camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.PerspectiveCamera ? camera.fov : previous.fov,
            zoom: camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.OrthographicCamera ? camera.zoom : previous.zoom,
            mode: camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.OrthographicCamera ? __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_30373853__.CameraMode.Orthographic : __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_30373853__.CameraMode.Perspective
        };
        this.services.rig.setState(nextState);
        this.lastCommittedState = cloneCameraState(nextState);
    }
    shouldSyncInternalFromRig() {
        if (!this.services) return false;
        const state = this.services.rig.getState();
        return !stateEquals(this.lastCommittedState, state);
    }
    installMouseHandlers(element) {
        this.removeMouseHandlers();
        this.boundPointerDown = (event)=>{
            if (!this.enabled || 0 !== event.button && 2 !== event.button) return;
            this.interactionElement?.focus();
            this.updateCurrentMouseScreen(event);
            this.clearWheelZoomState();
            this.activePointerId = event.pointerId;
            this.pointerState = 0 === event.button ? 'rotate' : 'pan';
            this.pointerDragStarted = false;
            this.lastPointer.set(event.clientX, event.clientY);
            const camera = this.syncManagedCameraFromRig();
            camera.updateMatrixWorld(true);
            if (0 === event.button) {
                this.pendingRotatePivot = this.rotationLocked || 'captured-point' !== this.mouseTargetMode ? null : this.pickPivotAtPointer(event, camera, 'click');
                if (!this.rotationLocked && 'yaw-pitch' === this.mouseRotateMode) this.beginYawPitchTransition();
            } else {
                this.pendingRotatePivot = null;
                this.capturePanPivotAtPointer(event, camera);
            }
            if ('function' == typeof element.setPointerCapture) element.setPointerCapture(event.pointerId);
            event.preventDefault();
        };
        this.boundPointerMove = (event)=>{
            this.updateCurrentMouseScreen(event);
            if (!this.enabled) return;
            if ('none' === this.pointerState) {
                if (null === this.activePointerId && 0 === event.buttons) this.prewarmGsplatGpuPick();
                return;
            }
            if (this.activePointerId !== event.pointerId) return;
            const dx = event.clientX - this.lastPointer.x;
            const dy = event.clientY - this.lastPointer.y;
            const dragDelta = dx * dx + dy * dy;
            let didMutateView = false;
            if (0 === dragDelta) return;
            if (!this.pointerDragStarted) {
                this.pointerDragStarted = true;
                if ('rotate' === this.pointerState && !this.rotationLocked) {
                    const camera = this.syncManagedCameraFromRig();
                    camera.updateMatrixWorld(true);
                    this.beginRotateGesture(camera);
                    this.updatePivotRings(camera);
                }
            }
            if ('rotate' === this.pointerState) {
                if (this.rotationLocked) ;
                else if (event.shiftKey && 'arcball' === this.mouseRotateMode) {
                    const width = Math.max(this.domElement?.clientWidth ?? 1, 1);
                    const angle = -(2 * Math.PI * dx * this.rotateSpeed) / width;
                    const forward = CAMERA_LOCAL_FORWARD.clone().applyQuaternion(this.rotation).normalize();
                    SCRATCH_Q.setFromAxisAngle(forward, angle);
                    this.rotation.premultiply(SCRATCH_Q);
                    this.startQuat.copy(this.rotation);
                    this.refreshAxesFromQuat();
                    this.startArcballDir.copy(this.mouseToArcballDir(event.clientX, event.clientY));
                    didMutateView = true;
                } else if ('yaw-pitch' === this.mouseRotateMode) {
                    if (this.rotateModeTransitionEndTime <= 0) {
                        this.rotateWithYawPitch(new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(dx, dy));
                        didMutateView = true;
                    }
                } else {
                    this.rotateWithArcball(event.clientX, event.clientY);
                    didMutateView = true;
                }
            } else if ('pan' === this.pointerState) {
                const camera = this.object;
                const width = Math.max(this.domElement?.clientWidth ?? 1, 1);
                const height = Math.max(this.domElement?.clientHeight ?? 1, 1);
                const current = this.getCurrentViewState();
                let panX = 0;
                let panY = 0;
                if (camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.PerspectiveCamera) {
                    const panDepth = this.resolvePointerPanNavigationScale(current.distance);
                    const targetDistance = panDepth * Math.tan(camera.fov * Math.PI / 360);
                    panX = -dx * targetDistance * this.panSpeed / height;
                    panY = dy * targetDistance * this.panSpeed / height;
                } else {
                    panX = -dx * (camera.right - camera.left) * this.panSpeed / Math.max(camera.zoom, 1e-6) / width;
                    panY = dy * (camera.top - camera.bottom) * this.panSpeed / Math.max(camera.zoom, 1e-6) / height;
                }
                this.offset.x += panX;
                this.offset.y += panY;
                this.navTarget.addScaledVector(this.lastRight, panX).addScaledVector(this.lastUp, panY);
                didMutateView = true;
            }
            if (didMutateView) {
                this.markCameraMotion();
                this.syncInteractiveViewState();
            }
            this.lastPointer.set(event.clientX, event.clientY);
            event.preventDefault();
        };
        this.boundPointerUp = (event)=>{
            this.updateCurrentMouseScreen(event);
            if (this.activePointerId !== event.pointerId) return;
            this.pointerState = 'none';
            this.activePointerId = null;
            this.pointerDragStarted = false;
            this.pendingRotatePivot = null;
            this.markCameraMotion();
            if ('function' == typeof element.releasePointerCapture) element.releasePointerCapture(event.pointerId);
            event.preventDefault();
        };
        this.boundWheel = (event)=>{
            if (!this.enabled) return;
            this.updateCurrentMouseScreen(event);
            const camera = this.syncManagedCameraFromRig();
            if (camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.OrthographicCamera) {
                this.clearWheelZoomState();
                if (!this.applyOrthographicWheelZoom(event, camera)) return;
                this.markCameraMotion();
                this.updatePivotRings(camera);
                this.commitCameraToRig(camera);
                this.syncDeviceCameraFromRig();
                event.preventDefault();
                event.stopImmediatePropagation();
                return;
            }
            if (!(camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.PerspectiveCamera)) return;
            const wheelStep = (0, __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.resolveWheelInputDelta)(event.deltaY, event.deltaMode);
            if (0 === wheelStep) return;
            const pointerPivot = this.getWheelPivotAtPointer(event, camera);
            this.wheelPivot = pointerPivot?.clone() ?? null;
            const maxWheelDelta = Math.abs(this.zoomSpeed);
            this.wheelDelta = (0, __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.accumulateWheelInputDelta)(this.wheelDelta, wheelStep * this.zoomSpeed, maxWheelDelta);
            this.markCameraMotion();
            event.preventDefault();
            event.stopImmediatePropagation();
        };
        this.boundDoubleClick = (event)=>{
            if (event.defaultPrevented || !this.enabled) return;
            const camera = this.syncManagedCameraFromRig();
            const hit = this.pickSurfaceHitAtPointer(event, camera, 'click');
            if (!hit) return;
            if (camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.OrthographicCamera) {
                this.clearWheelZoomState();
                if (!this.startOrthographicDoubleClickZoom(event, camera, hit)) return;
                if (!this.updateOrthographicZoomAnimation(camera, DEFAULT_FRAME_DELTA)) return;
                this.markCameraMotion();
                this.updatePivotRings(camera);
                this.commitCameraToRig(camera);
                this.syncDeviceCameraFromRig();
                event.preventDefault();
                event.stopImmediatePropagation();
                return;
            }
            if (!(camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.PerspectiveCamera)) return;
            const pivot = hit.point;
            const current = this.getCurrentViewState();
            const navigationScale = this.resolveWheelNavigationScale(current.distance);
            const wheelDelta = (0, __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.resolveDoubleClickWheelDelta)({
                position: current.position,
                pickedPoint: pivot,
                hit,
                proportionalStepRatio: LEGACY_WHEEL_STEP_RATIO,
                navigationScale,
                minStepRatio: WHEEL_MIN_STEP_RATIO,
                absoluteMinStep: WHEEL_ABSOLUTE_MIN_STEP
            });
            if (wheelDelta <= 0) return;
            this.wheelPivot = pivot.clone();
            this.wheelDelta += wheelDelta;
            this.markCameraMotion();
            event.preventDefault();
            event.stopImmediatePropagation();
        };
        this.boundContextMenu = (event)=>{
            if (!this.enabled) return;
            event.preventDefault();
        };
        this.boundKeyDown = (event)=>{
            if (!this.enabled || event.ctrlKey || event.metaKey || event.altKey || !KEYBOARD_TRANSLATION_CODES.has(event.code)) return;
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
        this.boundDocumentPointerDown = (event)=>{
            if (this.shouldRestoreFocusFromEventTarget(event.target)) this.scheduleInteractionFocusRestore();
        };
        this.boundDocumentFocusIn = (event)=>{
            if (this.shouldRestoreFocusFromEventTarget(event.target)) this.scheduleInteractionFocusRestore();
        };
        element.addEventListener('pointerdown', this.boundPointerDown);
        element.addEventListener('pointermove', this.boundPointerMove);
        element.addEventListener('pointerup', this.boundPointerUp);
        element.addEventListener('pointercancel', this.boundPointerUp);
        element.addEventListener('wheel', this.boundWheel, {
            passive: false
        });
        element.addEventListener('dblclick', this.boundDoubleClick);
        element.addEventListener('contextmenu', this.boundContextMenu);
        element.addEventListener('keydown', this.boundKeyDown);
        element.addEventListener('keyup', this.boundKeyUp);
        element.addEventListener('blur', this.boundBlur);
        element.ownerDocument.addEventListener('pointerdown', this.boundDocumentPointerDown, true);
        element.ownerDocument.addEventListener('focusin', this.boundDocumentFocusIn, true);
    }
    removeMouseHandlers() {
        this.clearScheduledFocusRestore();
        if (!this.domElement) {
            this.boundPointerDown = null;
            this.boundPointerMove = null;
            this.boundPointerUp = null;
            this.boundWheel = null;
            this.boundDoubleClick = null;
            this.boundContextMenu = null;
            this.boundKeyDown = null;
            this.boundKeyUp = null;
            this.boundBlur = null;
            this.boundDocumentPointerDown = null;
            this.boundDocumentFocusIn = null;
            this.pointerDragStarted = false;
            this.pendingRotatePivot = null;
            this.keyState.clear();
            this.keyboardCurrentSpeed = 0;
            return;
        }
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
        if (this.boundDoubleClick) {
            this.domElement.removeEventListener('dblclick', this.boundDoubleClick);
            this.boundDoubleClick = null;
        }
        if (this.boundContextMenu) {
            this.domElement.removeEventListener('contextmenu', this.boundContextMenu);
            this.boundContextMenu = null;
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
        if (this.boundDocumentPointerDown) {
            this.domElement.ownerDocument.removeEventListener('pointerdown', this.boundDocumentPointerDown, true);
            this.boundDocumentPointerDown = null;
        }
        if (this.boundDocumentFocusIn) {
            this.domElement.ownerDocument.removeEventListener('focusin', this.boundDocumentFocusIn, true);
            this.boundDocumentFocusIn = null;
        }
        this.clearWheelZoomState();
        this.pointerDragStarted = false;
        this.pendingRotatePivot = null;
        this.keyState.clear();
        this.keyboardCurrentSpeed = 0;
    }
    updateLegacyWheelZoom() {
        const safeDelta = DEFAULT_FRAME_DELTA;
        const fade = 0.5 ** (LEGACY_WHEEL_FADE_FACTOR * safeDelta);
        const progression = 1 - fade;
        let didMutateView = false;
        if (0 !== this.wheelDelta) {
            const current = this.getCurrentViewState();
            const navigationScale = this.resolveWheelNavigationScale(current.distance);
            if (this.wheelPivot) {
                const step = (0, __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.resolvePickedPointWheelStep)({
                    position: current.position,
                    target: current.target,
                    forward: current.forward,
                    pickedPoint: this.wheelPivot,
                    currentZoomDelta: this.zoomDelta,
                    wheelDelta: this.wheelDelta,
                    proportionalStepRatio: LEGACY_WHEEL_STEP_RATIO,
                    navigationScale,
                    minStepRatio: WHEEL_MIN_STEP_RATIO,
                    absoluteMinStep: WHEEL_ABSOLUTE_MIN_STEP
                });
                if (step.crossedPickedPoint) {
                    this.zoomDelta.set(0, 0, 0);
                    this.zoomDistance = null;
                    this.applyWheelCameraState(step.nextPosition, step.nextTarget, {
                        preserveRotationPivot: 'captured-point' === this.mouseTargetMode && null !== this.lastCapturedPoint
                    });
                    didMutateView = true;
                } else {
                    this.zoomDelta.copy(step.nextZoomDelta);
                    this.zoomDistance = step.nextZoomDistance;
                }
            } else {
                const moveDistance = (0, __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.resolveWheelForwardStep)({
                    cameraTargetDistance: current.distance,
                    wheelDelta: this.wheelDelta,
                    proportionalStepRatio: LEGACY_WHEEL_STEP_RATIO,
                    navigationScale,
                    minStepRatio: WHEEL_MIN_STEP_RATIO,
                    absoluteMinStep: WHEEL_ABSOLUTE_MIN_STEP
                });
                const moveVector = current.forward.multiplyScalar(moveDistance);
                if (moveVector.lengthSq() > 1e-12) {
                    this.applyWheelCameraState(current.position.clone().add(moveVector), current.target.clone().add(moveVector));
                    didMutateView = true;
                }
                this.zoomDistance = null;
            }
        }
        if (this.zoomDelta.lengthSq() > 1e-12) {
            const current = this.getCurrentViewState();
            const movement = this.zoomDelta.clone().multiplyScalar(progression);
            if (movement.lengthSq() > 1e-12) {
                const nextPosition = current.position.clone().add(movement);
                const nextTarget = null == this.zoomDistance ? current.target.clone().add(movement) : nextPosition.clone().addScaledVector(current.forward, this.zoomDistance);
                this.applyWheelCameraState(nextPosition, nextTarget);
                didMutateView = true;
            }
        }
        this.zoomDelta.multiplyScalar(fade);
        if (this.zoomDelta.lengthSq() <= 1e-12) {
            this.zoomDelta.set(0, 0, 0);
            this.zoomDistance = null;
        }
        this.wheelDelta = 0;
        this.wheelPivot = null;
        if (didMutateView) this.markCameraMotion();
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
        const acceleration = this.keyboardMaxSpeed / KEYBOARD_ACCELERATION_DURATION;
        this.keyboardCurrentSpeed = Math.min(this.keyboardMaxSpeed, this.keyboardCurrentSpeed + acceleration * deltaTime);
        return this.keyboardCurrentSpeed * deltaTime;
    }
    resolveKeyboardMaxSpeed(distance) {
        return this.resolveKeyboardNavigationScale(distance);
    }
    resolveWheelNavigationScale(distance, absoluteMinimum = NAVIGATION_SCALE_ABSOLUTE_MINIMUM) {
        return (0, __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.resolveNavigationScale)({
            cameraTargetDistance: distance,
            sceneBounds: null,
            absoluteMinimum
        });
    }
    resolvePointerPanNavigationScale(distance, absoluteMinimum = NAVIGATION_SCALE_ABSOLUTE_MINIMUM) {
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
            absoluteMinimum: MIN_KEYBOARD_MAX_SPEED
        });
    }
    updateKeyboardTranslation(deltaTime) {
        if (0 === this.keyState.size) {
            this.keyboardCurrentSpeed = 0;
            return;
        }
        const current = this.getCurrentViewState();
        if (current.forward.lengthSq() <= 1e-12) {
            this.keyboardCurrentSpeed = 0;
            return;
        }
        const safeDelta = deltaTime && Number.isFinite(deltaTime) && deltaTime > 0 ? deltaTime : DEFAULT_FRAME_DELTA;
        const yaw = this.getStableYaw(current.forward);
        const planarForward = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 1, 0).applyAxisAngle(WORLD_UP, yaw).normalize();
        const side = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1, 0, 0).applyAxisAngle(WORLD_UP, yaw).normalize();
        const movement = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        const moveForward = this.keyState.has('KeyW') || this.keyState.has('ArrowUp');
        const moveBackward = this.keyState.has('KeyS') || this.keyState.has('ArrowDown');
        const moveLeft = this.keyState.has('KeyA') || this.keyState.has('ArrowLeft');
        const moveRight = this.keyState.has('KeyD') || this.keyState.has('ArrowRight');
        const moveUp = this.keyState.has('KeyQ');
        const moveDown = this.keyState.has('KeyE');
        if (moveForward !== moveBackward) movement.addScaledVector(planarForward, moveForward ? 1 : -1);
        if (moveLeft !== moveRight) movement.addScaledVector(side, moveRight ? 1 : -1);
        if (moveUp !== moveDown) movement.addScaledVector(WORLD_UP, moveUp ? 1 : -1);
        if (movement.lengthSq() <= 1e-12) {
            this.keyboardCurrentSpeed = 0;
            return;
        }
        const frameSpeed = this.advanceKeyboardSpeed(safeDelta) * this.panSpeed;
        movement.multiplyScalar(frameSpeed);
        this.translateView(movement);
        this.markCameraMotion();
    }
    shouldRestoreFocusFromEventTarget(target) {
        if (!this.enabled || !this.interactionElement) return false;
        if (!(target instanceof Node)) return false;
        if (this.interactionElement.contains(target)) return false;
        if (isEditableElement(target)) return false;
        return true;
    }
    scheduleInteractionFocusRestore() {
        this.clearScheduledFocusRestore();
        this.focusRestoreTimer = window.setTimeout(()=>{
            this.focusRestoreTimer = 0;
            this.restoreInteractionFocus();
        }, 0);
    }
    clearScheduledFocusRestore() {
        if (0 !== this.focusRestoreTimer) {
            window.clearTimeout(this.focusRestoreTimer);
            this.focusRestoreTimer = 0;
        }
        if (0 !== this.focusRestoreFrame) {
            window.cancelAnimationFrame(this.focusRestoreFrame);
            this.focusRestoreFrame = 0;
        }
    }
    restoreInteractionFocus() {
        if (!this.enabled || !this.interactionElement) return;
        this.interactionElement.focus();
        if (this.nav && this.navCreated) this.nav.update3dcontroller({
            focus: true
        });
    }
    requestFocusRecovery() {
        this.scheduleInteractionFocusRestore();
        this.focusRestoreFrame = window.requestAnimationFrame(()=>{
            this.focusRestoreFrame = 0;
            this.restoreInteractionFocus();
        });
    }
    pivotToScreen() {
        if (!this.domElement) return new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(0, 0);
        const rect = this.domElement.getBoundingClientRect();
        const projected = this.pivot.clone().project(this.object);
        return new __WEBPACK_EXTERNAL_MODULE_three__.Vector2((projected.x + 1) * 0.5 * rect.width, (1 - projected.y) * 0.5 * rect.height);
    }
    mouseToArcballDir(clientX, clientY) {
        const rect = this.domElement?.getBoundingClientRect();
        if (!rect) return this.lastForward.clone();
        const radius = 0.5 * Math.min(rect.width, rect.height);
        let centerX = this.arcballCenterScreen.x;
        let centerY = this.arcballCenterScreen.y;
        centerX = Math.max(radius, Math.min(rect.width - radius, centerX));
        centerY = Math.max(radius, Math.min(rect.height - radius, centerY));
        const x = clientX - rect.left - centerX;
        const y = centerY - (clientY - rect.top);
        const vx = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.clamp(x * this.rotateSpeed / radius, -1, 1);
        const vy = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.clamp(y * this.rotateSpeed / radius, -1, 1);
        const d2 = vx * vx + vy * vy;
        const vz = d2 >= 1 ? 0 : Math.sqrt(1 - d2);
        this.arcballDir.set(0, 0, 0).addScaledVector(this.lastRight, vx).addScaledVector(this.lastUp, vy).addScaledVector(this.lastForward, -vz);
        return this.arcballDir.lengthSq() > 1e-8 ? this.arcballDir.normalize() : this.lastForward.clone();
    }
    updateCurrentMouseScreen(event) {
        if (!this.domElement) return;
        const rect = this.domElement.getBoundingClientRect();
        this.currentMouseScreen.set(event.clientX - rect.left, event.clientY - rect.top);
    }
    getWheelPivotAtPointer(event, camera) {
        const reusablePivot = this.getReusableWheelPivot();
        if (void 0 !== reusablePivot) return reusablePivot;
        const pivot = this.pickPivotAtPointer(event, camera);
        this.cacheWheelPivotAtCurrentMouse(pivot);
        return pivot;
    }
    getReusableWheelPivot() {
        if (!this.lastWheelPickScreen || performance.now() - this.lastWheelPickAt > WHEEL_PICK_REUSE_MS) return;
        const deltaX = this.currentMouseScreen.x - this.lastWheelPickScreen.x;
        const deltaY = this.currentMouseScreen.y - this.lastWheelPickScreen.y;
        if (deltaX * deltaX + deltaY * deltaY > WHEEL_PICK_REUSE_DISTANCE_PX ** 2) return;
        return this.lastWheelPickedPivot?.clone() ?? null;
    }
    cacheWheelPivotAtCurrentMouse(pivot) {
        if (!this.lastWheelPickScreen) this.lastWheelPickScreen = new __WEBPACK_EXTERNAL_MODULE_three__.Vector2();
        this.lastWheelPickScreen.copy(this.currentMouseScreen);
        this.lastWheelPickAt = performance.now();
        this.lastWheelPickedPivot = pivot?.clone() ?? null;
    }
    resetWheelPickCache() {
        this.lastWheelPickAt = -1 / 0;
        this.lastWheelPickScreen = null;
        this.lastWheelPickedPivot = null;
    }
    canPrewarmGsplatGpuPick() {
        if ('none' !== this.pointerState || null !== this.activePointerId || this.navIsActive || this.keyState.size > 0 || 0 !== this.wheelDelta || this.zoomDelta.lengthSq() > 1e-12 || null !== this.orthographicZoomTarget) return false;
        const now = performance.now();
        return now - this.lastCameraMotionAt >= GPU_PREWARM_MOTION_COOLDOWN_MS && now - this.lastGpuPrewarmAt >= GPU_PREWARM_THROTTLE_MS;
    }
    markCameraMotion() {
        this.lastCameraMotionAt = performance.now();
    }
    pickPivotAtPointer(event, camera, interactionType = 'move') {
        return this.pickSurfaceHitAtPointer(event, camera, interactionType)?.point.clone() ?? null;
    }
    pickSurfaceHitAtPointer(event, camera, interactionType = 'move') {
        if (!this.domElement) return null;
        const rect = this.domElement.getBoundingClientRect();
        return this.pickSurfaceHitAtScreen(new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(event.clientX - rect.left, event.clientY - rect.top), camera, interactionType);
    }
    rotateWithYawPitch(delta) {
        if (!this.domElement) return;
        const width = Math.max(this.domElement.clientWidth, 1);
        const height = Math.max(this.domElement.clientHeight, 1);
        const yawDelta = -(delta.x / width) * LEGACY_ROTATION_SPEED * this.rotateSpeed * 0.5;
        let pitchDelta = -(delta.y / height) * LEGACY_ROTATION_SPEED * this.rotateSpeed * 0.2;
        const position = this.pivot.clone().add(SCRATCH_V3.copy(this.offset).applyQuaternion(this.rotation));
        const forward = CAMERA_LOCAL_FORWARD.clone().applyQuaternion(this.rotation).normalize();
        const target = this.navTarget.clone();
        const yaw = this.getStableYaw(forward);
        const currentPitch = Math.atan2(forward.z, Math.sqrt(forward.x * forward.x + forward.y * forward.y));
        const nextPitch = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.clamp(currentPitch + pitchDelta, -MAX_ABSOLUTE_PITCH, MAX_ABSOLUTE_PITCH);
        pitchDelta = nextPitch - currentPitch;
        if (Math.abs(pitchDelta) <= 1e-8 && Math.abs(yawDelta) <= 1e-8) return;
        const side = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1, 0, 0).applyAxisAngle(WORLD_UP, yaw).normalize();
        const pivotToCamera = position.clone().sub(this.pivot);
        const pivotToTarget = target.clone().sub(this.pivot);
        pivotToCamera.applyAxisAngle(side, pitchDelta);
        pivotToTarget.applyAxisAngle(side, pitchDelta);
        pivotToCamera.applyAxisAngle(WORLD_UP, yawDelta);
        pivotToTarget.applyAxisAngle(WORLD_UP, yawDelta);
        const nextPosition = this.pivot.clone().add(pivotToCamera);
        const nextTarget = this.pivot.clone().add(pivotToTarget);
        const nextForward = nextTarget.clone().sub(nextPosition).normalize();
        const nextYaw = yaw + yawDelta;
        const nextSide = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1, 0, 0).applyAxisAngle(WORLD_UP, nextYaw).normalize();
        const nextUp = nextSide.clone().cross(nextForward).normalize();
        const nextRight = nextForward.clone().cross(nextUp).normalize();
        SCRATCH_M4.makeBasis(nextRight, nextUp, nextForward.clone().negate());
        this.rotation.setFromRotationMatrix(SCRATCH_M4);
        this.lastStableYaw = nextYaw;
        this.navTarget.copy(nextTarget);
        SCRATCH_V3.subVectors(nextPosition, this.pivot);
        this.offset.copy(SCRATCH_V3.applyQuaternion(SCRATCH_Q.copy(this.rotation).invert()));
        this.refreshAxesFromQuat();
    }
    rotateWithArcball(clientX, clientY) {
        const currentDir = this.mouseToArcballDir(clientX, clientY);
        SCRATCH_Q.setFromUnitVectors(currentDir, this.startArcballDir);
        this.rotation.copy(this.startQuat).premultiply(SCRATCH_Q);
    }
    beginYawPitchTransition() {
        if (!this.hasInternalState) return;
        const currentPosition = this.pivot.clone().add(SCRATCH_V3.copy(this.offset).applyQuaternion(this.rotation));
        const forward = CAMERA_LOCAL_FORWARD.clone().applyQuaternion(this.rotation).normalize();
        const targetRotation = this.createYawPitchAlignedRotation(forward);
        if (this.rotation.angleTo(targetRotation) <= 1e-5) {
            this.rotateModeTransitionEndTime = 0;
            this.rotation.copy(targetRotation);
            this.syncOffsetFromWorldPosition(currentPosition);
            this.refreshAxesFromQuat();
            return;
        }
        this.transitionWorldPosition.copy(currentPosition);
        this.transitionFromRotation.copy(this.rotation);
        this.transitionToRotation.copy(targetRotation);
        this.rotateModeTransitionEndTime = performance.now() + ROTATE_MODE_TRANSITION_DURATION_MS;
    }
    stepRotateModeTransition() {
        if (this.rotateModeTransitionEndTime <= 0) return;
        const now = performance.now();
        const startTime = this.rotateModeTransitionEndTime - ROTATE_MODE_TRANSITION_DURATION_MS;
        const progress = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.clamp((now - startTime) / ROTATE_MODE_TRANSITION_DURATION_MS, 0, 1);
        const eased = 1 - (1 - progress) ** 3;
        this.rotation.copy(this.transitionFromRotation).slerp(this.transitionToRotation, eased);
        this.syncOffsetFromWorldPosition(this.transitionWorldPosition);
        this.refreshAxesFromQuat();
        if (progress >= 1) this.rotateModeTransitionEndTime = 0;
    }
    getStableYaw(forward) {
        const horizontalLength = Math.sqrt(forward.x * forward.x + forward.y * forward.y);
        if (horizontalLength > 1e-6) this.lastStableYaw = Math.atan2(forward.y, forward.x) - Math.PI / 2;
        return this.lastStableYaw;
    }
    createYawPitchAlignedRotation(forward) {
        const yaw = this.getStableYaw(forward);
        const side = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1, 0, 0).applyAxisAngle(WORLD_UP, yaw).normalize();
        const up = side.clone().cross(forward).normalize();
        const right = forward.clone().cross(up).normalize();
        SCRATCH_M4.makeBasis(right, up, forward.clone().negate());
        return new __WEBPACK_EXTERNAL_MODULE_three__.Quaternion().setFromRotationMatrix(SCRATCH_M4);
    }
    updateViewportMetrics() {
        const { width, height } = this.services?.getViewportSize() ?? {
            width: 1,
            height: 1
        };
        const viewportWidth = Math.max(width, 1);
        const viewportHeight = Math.max(height, 1);
        const camera = this.deviceCamera;
        this.glState.viewportWidth = viewportWidth;
        this.glState.viewportHeight = viewportHeight;
        this.glState.frustumNear = camera.near;
        this.glState.frustumFar = camera.far;
        if (camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.PerspectiveCamera) {
            const aspect = viewportWidth / viewportHeight;
            this.glState.fov = camera.fov;
            const left = -8 * Math.tan(camera.fov * Math.PI / 360) * aspect;
            this.glState.left = left;
            this.glState.right = -left;
            this.glState.bottom = left / aspect;
            this.glState.top = -this.glState.bottom;
            return;
        }
        const safeZoom = Math.max(camera.zoom, CAMERA_EPSILON);
        this.glState.left = camera.left / safeZoom;
        this.glState.right = camera.right / safeZoom;
        this.glState.bottom = camera.bottom / safeZoom;
        this.glState.top = camera.top / safeZoom;
    }
    getDeviceCameraForMode(mode) {
        this.deviceCamera = mode === __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_30373853__.CameraMode.Orthographic ? this.orthographicDeviceCamera : this.perspectiveDeviceCamera;
        return this.deviceCamera;
    }
    getOrthographicReferenceHalfHeight(distance) {
        const fov = this.services?.rig.getState().fov ?? this.glState.fov;
        return Math.max(distance * Math.tan(fov * Math.PI / 360), CAMERA_EPSILON);
    }
    syncOrthographicDeviceProjection(camera, distance) {
        const aspect = Math.max(this.glState.viewportWidth, 1) / Math.max(this.glState.viewportHeight, 1);
        const halfHeight = this.getOrthographicReferenceHalfHeight(distance);
        const halfWidth = halfHeight * aspect;
        const viewWidth = Math.max(this.glState.right - this.glState.left, CAMERA_EPSILON);
        const viewHeight = Math.max(this.glState.top - this.glState.bottom, CAMERA_EPSILON);
        const zoomX = 2 * halfWidth / viewWidth;
        const zoomY = 2 * halfHeight / viewHeight;
        camera.left = -halfWidth;
        camera.right = halfWidth;
        camera.bottom = -halfHeight;
        camera.top = halfHeight;
        camera.zoom = Math.max(Math.min(zoomX, zoomY), CAMERA_EPSILON);
    }
    getActiveRotateCommandId() {
        return 'yaw-pitch' === this.mouseRotateMode ? SPACEMOUSE_ROTATE_YAW_PITCH_COMMAND_ID : SPACEMOUSE_ROTATE_ARCBALL_COMMAND_ID;
    }
    create3DMouseTargetCategory() {
        return {
            id: SPACEMOUSE_TARGET_CATEGORY_ID,
            label: 'Target Mode',
            type: SPACEMOUSE_CATEGORY_NODE,
            nodes: [
                {
                    id: SPACEMOUSE_TARGET_BOUNDS_CENTER_COMMAND_ID,
                    label: 'Bounds Center',
                    type: SPACEMOUSE_ACTION_NODE,
                    description: 'Rotate around the scene bounds center'
                },
                {
                    id: SPACEMOUSE_TARGET_CAPTURED_POINT_COMMAND_ID,
                    label: 'Captured Point',
                    type: SPACEMOUSE_ACTION_NODE,
                    description: 'Rotate around the latest ordinary mouse capture point'
                }
            ]
        };
    }
    create3DMouseHistoryCategory() {
        return {
            id: SPACEMOUSE_HISTORY_CATEGORY_ID,
            label: 'History',
            type: SPACEMOUSE_CATEGORY_NODE,
            nodes: [
                {
                    id: SPACEMOUSE_UNDO_COMMAND_ID,
                    label: 'Undo',
                    type: SPACEMOUSE_ACTION_NODE,
                    description: 'Run the active application undo command'
                },
                {
                    id: SPACEMOUSE_REDO_COMMAND_ID,
                    label: 'Redo',
                    type: SPACEMOUSE_ACTION_NODE,
                    description: 'Run the active application redo command'
                }
            ]
        };
    }
    create3DMouseCommandTree() {
        return {
            nodes: [
                {
                    id: SPACEMOUSE_ROTATE_ACTION_SET_ID,
                    label: 'Mouse Navigation',
                    type: SPACEMOUSE_ACTIONSET_NODE,
                    nodes: [
                        {
                            id: SPACEMOUSE_ROTATE_CATEGORY_ID,
                            label: 'Rotate Mode',
                            type: SPACEMOUSE_CATEGORY_NODE,
                            nodes: [
                                {
                                    id: SPACEMOUSE_ROTATE_ARCBALL_COMMAND_ID,
                                    label: 'Arcball',
                                    type: SPACEMOUSE_ACTION_NODE,
                                    description: 'Switch to arcball rotation'
                                },
                                {
                                    id: SPACEMOUSE_ROTATE_YAW_PITCH_COMMAND_ID,
                                    label: 'Yaw/Pitch',
                                    type: SPACEMOUSE_ACTION_NODE,
                                    description: 'Switch to yaw/pitch rotation'
                                }
                            ]
                        },
                        this.create3DMouseTargetCategory(),
                        this.create3DMouseHistoryCategory()
                    ]
                }
            ]
        };
    }
    push3DMouseControllerUpdate(payload) {
        if (!this.nav || !this.navCreated) return;
        try {
            const result = this.nav.update3dcontroller(payload);
            if ('object' == typeof result && null !== result && 'catch' in result && 'function' == typeof result.catch) result.catch(()=>{});
        } catch  {}
    }
    sync3DMouseCommandState(includeCommandTree = false) {
        const commands = {
            activeCommand: this.getActiveRotateCommandId()
        };
        if (includeCommandTree) commands.tree = this.create3DMouseCommandTree();
        const payload = {
            commands,
            settings: {
                ActionSet: SPACEMOUSE_ROTATE_ACTION_SET_ID
            }
        };
        if (includeCommandTree) payload.frame = {
            timingSource: 1
        };
        this.push3DMouseControllerUpdate(payload);
    }
    normalize3DMouseCommandId(command) {
        if ('string' == typeof command || 'number' == typeof command) return `${command}`;
        if (Array.isArray(command)) {
            for (const candidate of command){
                const commandId = this.normalize3DMouseCommandId(candidate);
                if (commandId) return commandId;
            }
            return null;
        }
        if (!command || 'object' != typeof command) return null;
        const record = command;
        for (const key of [
            'id',
            'ID',
            'command',
            'name',
            'Name'
        ]){
            const value = record[key];
            if ('string' == typeof value || 'number' == typeof value) return `${value}`;
        }
        return null;
    }
    handle3DMouseActiveCommand(command) {
        if (!this.deviceNavigationEnabled) return;
        const commandId = this.normalize3DMouseCommandId(command);
        if (!commandId) return;
        if (commandId === SPACEMOUSE_UNDO_COMMAND_ID) {
            this.appCommandHandlers.undo?.();
            this.requestFocusRecovery();
            return;
        }
        if (commandId === SPACEMOUSE_REDO_COMMAND_ID) {
            this.appCommandHandlers.redo?.();
            this.requestFocusRecovery();
            return;
        }
        this.promoteNavigationProfileForConfirmed3DMouseInput();
        if (commandId === SPACEMOUSE_ROTATE_ARCBALL_COMMAND_ID) {
            this.setMouseRotateMode('arcball');
            return;
        }
        if (commandId === SPACEMOUSE_ROTATE_YAW_PITCH_COMMAND_ID) {
            this.setMouseRotateMode('yaw-pitch');
            return;
        }
        if (commandId === SPACEMOUSE_TARGET_BOUNDS_CENTER_COMMAND_ID) {
            this.setMouseTargetMode('bounds-center');
            return;
        }
        if (commandId === SPACEMOUSE_TARGET_CAPTURED_POINT_COMMAND_ID) this.setMouseTargetMode('captured-point');
    }
    connect3DMouse(container) {
        this.disconnect3DMouse();
        try {
            const client = this.build3DConnexionClient(container);
            this.nav = new __WEBPACK_EXTERNAL_MODULE__3dconnexion_3dconnexionjs_1e8e8793__["default"](client);
            this.nav.connect();
            container.focus();
        } catch (error) {
            this.nav = null;
            log.warn('[SpaceMouseController] failed to initialize 3Dconnexion client: ' + (error instanceof Error ? error.message : String(error)));
        }
    }
    disconnect3DMouse() {
        if (!this.nav) return;
        try {
            if (this.navCreated) this.nav.delete3dmouse();
            this.nav.close();
        } finally{
            this.nav = null;
            this.navCreated = false;
            this.navIsActive = false;
            this.promoteHybridProfileOnNextConfirmed3DMouseInput = false;
        }
    }
    build3DConnexionClient(container) {
        return {
            onConnect: ()=>{
                this.nav?.create3dmouse(container, this.appName);
            },
            onDisconnect: ()=>{
                this.navCreated = false;
                this.navIsActive = false;
            },
            on3dmouseCreated: ()=>{
                this.navCreated = true;
                this.sync3DMouseCommandState(true);
            },
            onStartMotion: ()=>{
                if (!this.deviceNavigationEnabled) {
                    this.navIsActive = false;
                    return;
                }
                this.promoteNavigationProfileForConfirmed3DMouseInput();
                this.navIsActive = true;
            },
            onStopMotion: ()=>{
                this.navIsActive = false;
            },
            getCoordinateSystem: ()=>[
                    ...IDENTITY_16
                ],
            getConstructionPlane: ()=>this.getPlane(0, 0, 0),
            getFloorPlane: ()=>this.getPlane(0, 0, 0),
            getUnitsToMeters: ()=>this.unitsToMeters,
            getFov: ()=>{
                const camera = this.deviceCamera;
                const fov = camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.PerspectiveCamera ? camera.fov : this.glState.fov;
                const aspect = camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.PerspectiveCamera ? camera.aspect : Math.max(this.glState.viewportWidth, 1) / Math.max(this.glState.viewportHeight, 1);
                return 2 * Math.atan(Math.tan(fov * Math.PI / 360) * Math.sqrt(1 + aspect * aspect));
            },
            getFrontView: ()=>[
                    ...SPACEMOUSE_FRONT_VIEW
                ],
            getLookAt: ()=>this.getLookAt(),
            getModelExtents: ()=>this.getModelExtents(),
            getPerspective: ()=>this.deviceCamera instanceof __WEBPACK_EXTERNAL_MODULE_three__.PerspectiveCamera,
            getPivotPosition: ()=>this.getSpaceMousePivot().toArray(),
            getPointerPosition: ()=>this.getPointerPosition(),
            getViewRotatable: ()=>this.deviceNavigationEnabled && !this.rotationLocked,
            getViewExtents: ()=>{
                const camera = this.deviceCamera;
                if (camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.OrthographicCamera) {
                    const safeZoom = Math.max(camera.zoom, CAMERA_EPSILON);
                    return [
                        camera.left / safeZoom,
                        camera.bottom / safeZoom,
                        -camera.far,
                        camera.right / safeZoom,
                        camera.top / safeZoom,
                        -camera.near
                    ];
                }
                return [
                    this.glState.left,
                    this.glState.bottom,
                    -camera.far,
                    this.glState.right,
                    this.glState.top,
                    -camera.near
                ];
            },
            getViewFrustum: ()=>{
                const camera = this.deviceCamera;
                if (camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.OrthographicCamera) {
                    const safeZoom = Math.max(camera.zoom, CAMERA_EPSILON);
                    return [
                        camera.left / safeZoom,
                        camera.right / safeZoom,
                        camera.bottom / safeZoom,
                        camera.top / safeZoom,
                        camera.near,
                        camera.far
                    ];
                }
                const tanHalfFov = Math.tan(camera.fov * Math.PI / 360);
                const bottom = -camera.near * tanHalfFov;
                const left = bottom * camera.aspect;
                return [
                    left,
                    -left,
                    bottom,
                    -bottom,
                    camera.near,
                    camera.far
                ];
            },
            getViewMatrix: ()=>this.deviceCamera.matrixWorld.toArray(),
            getViewTarget: ()=>this.getEffectiveTargetPivot().toArray(),
            setActiveCommand: (command)=>{
                this.handle3DMouseActiveCommand(command);
            },
            setLookFrom: (data)=>{
                this.lookFrom.set(data[0] ?? 0, data[1] ?? 0, data[2] ?? 0);
            },
            setLookDirection: (data)=>{
                this.lookDirection.set(data[0] ?? 0, data[1] ?? 0, data[2] ?? -1);
            },
            setLookAperture: ()=>{},
            setSelectionOnly: (data)=>{
                this.selectionOnly = data;
            },
            setViewExtents: (data)=>{
                if (!this.deviceNavigationEnabled) return;
                this.glState.left = data[0] ?? this.glState.left;
                this.glState.bottom = data[1] ?? this.glState.bottom;
                this.glState.right = data[3] ?? this.glState.right;
                this.glState.top = data[4] ?? this.glState.top;
                if (this.deviceCamera instanceof __WEBPACK_EXTERNAL_MODULE_three__.OrthographicCamera) {
                    const distance = Math.max(this.deviceCamera.position.distanceTo(this.navTarget), CAMERA_EPSILON);
                    this.syncOrthographicDeviceProjection(this.deviceCamera, distance);
                    this.deviceCamera.updateProjectionMatrix();
                }
            },
            setViewMatrix: (data)=>{
                if (!this.deviceNavigationEnabled) return;
                this.promoteNavigationProfileForConfirmed3DMouseInput();
                const effectivePivot = this.getEffectiveTargetPivot();
                this.pivot.copy(effectivePivot);
                this.syncNavTargetToEffectivePivot();
                const matrix = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4().fromArray(data);
                matrix.decompose(this.deviceCamera.position, this.deviceCamera.quaternion, this.deviceCamera.scale);
                if (this.rotationLocked) this.deviceCamera.quaternion.copy(this.rotation);
                else if ('yaw-pitch' === this.mouseRotateMode) {
                    const forward = CAMERA_LOCAL_FORWARD.clone().applyQuaternion(this.deviceCamera.quaternion).normalize();
                    this.deviceCamera.quaternion.copy(this.createYawPitchAlignedRotation(forward));
                }
                this.deviceCamera.updateMatrixWorld(true);
                this.syncInternalFromCamera(this.deviceCamera, false);
                this.syncNavTargetFromCamera(this.deviceCamera);
                if (this.deviceCamera instanceof __WEBPACK_EXTERNAL_MODULE_three__.OrthographicCamera) {
                    const distance = Math.max(this.deviceCamera.position.distanceTo(this.navTarget), CAMERA_EPSILON);
                    this.syncOrthographicDeviceProjection(this.deviceCamera, distance);
                    this.deviceCamera.updateProjectionMatrix();
                }
                this.commitCameraToRig(this.deviceCamera);
            },
            setFov: (data)=>{
                if (!this.deviceNavigationEnabled) return;
                if (this.deviceCamera instanceof __WEBPACK_EXTERNAL_MODULE_three__.PerspectiveCamera) {
                    this.deviceCamera.fov = 180 * data / Math.PI;
                    this.deviceCamera.updateProjectionMatrix();
                } else {
                    this.glState.fov = 180 * data / Math.PI;
                    const distance = Math.max(this.deviceCamera.position.distanceTo(this.navTarget), CAMERA_EPSILON);
                    this.syncOrthographicDeviceProjection(this.deviceCamera, distance);
                    this.deviceCamera.updateProjectionMatrix();
                }
            },
            setTarget: (data)=>{
                if (!this.deviceNavigationEnabled) return;
                this.promoteNavigationProfileForConfirmed3DMouseInput();
                this.syncNavTargetToEffectivePivot();
            },
            setTransaction: ()=>{}
        };
    }
    syncDeviceCameraFromRig() {
        if (!this.services) return;
        const state = this.services.rig.getState();
        const camera = this.getDeviceCameraForMode(state.mode);
        camera.position.copy(state.position);
        camera.up.copy(state.up);
        camera.near = this.services.rig.near;
        camera.far = this.services.rig.far;
        if (camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.PerspectiveCamera) {
            camera.fov = state.fov;
            camera.aspect = Math.max(this.glState.viewportWidth, 1) / Math.max(this.glState.viewportHeight, 1);
        } else {
            const distance = Math.max(state.position.distanceTo(state.target), CAMERA_EPSILON);
            this.glState.fov = state.fov;
            this.syncOrthographicDeviceProjection(camera, distance);
            camera.zoom = Math.max(state.zoom, CAMERA_EPSILON);
        }
        camera.lookAt(state.target);
        camera.updateProjectionMatrix();
        camera.updateMatrixWorld(true);
        this.updateViewportMetrics();
    }
    getPlane(px, py, pz) {
        const d0 = WORLD_UP.x * px + WORLD_UP.y * py + WORLD_UP.z * pz;
        return [
            WORLD_UP.x,
            WORLD_UP.y,
            WORLD_UP.z,
            -d0
        ];
    }
    getModelExtents() {
        const bounds = this.services?.getSceneBounds?.('fit') ?? this.services?.getSceneBounds?.();
        if (bounds && !bounds.isEmpty()) return [
            bounds.min.x,
            bounds.min.y,
            bounds.min.z,
            bounds.max.x,
            bounds.max.y,
            bounds.max.z
        ];
        return [
            -DEFAULT_EXTENT,
            -DEFAULT_EXTENT,
            -DEFAULT_EXTENT,
            DEFAULT_EXTENT,
            DEFAULT_EXTENT,
            DEFAULT_EXTENT
        ];
    }
    getSpaceMousePivot() {
        return this.getEffectiveTargetPivot();
    }
    getLookAt() {
        if (!this.services?.surfaceQuery || !this.domElement) return null;
        const rect = this.domElement.getBoundingClientRect();
        const screenInWindow = this.currentMouseScreen.clone().add(new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(rect.left, rect.top));
        const result = this.services.surfaceQuery.queryAtScreen(screenInWindow, this.object, {
            kinds: [
                'pointCloud',
                'gaussian-splat'
            ],
            interactionType: 'move'
        });
        if (this.selectionOnly && !result) return null;
        return result?.point.toArray() ?? null;
    }
    getPointerPosition() {
        if (!this.domElement) return [
            0,
            0,
            0
        ];
        const rect = this.domElement.getBoundingClientRect();
        const camera = this.deviceCamera;
        const pos = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(this.currentMouseScreen.x / Math.max(rect.width, 1) * 2 - 1, -(this.currentMouseScreen.y / Math.max(rect.height, 1) * 2 - 1), 0);
        pos.unproject(camera);
        return pos.toArray();
    }
    initializePivotRings() {
        this.ringGizmo.name = 'spaceMousePivotRings';
        this.ringGizmo.visible = false;
        const xRing = this.createPivotRing(0xff6f61);
        xRing.rotation.y = 0.5 * Math.PI;
        const yRing = this.createPivotRing(0x6fe08f);
        yRing.rotation.x = 0.5 * Math.PI;
        const zRing = this.createPivotRing(0x6fa8ff);
        const centerSphereMaterial = new __WEBPACK_EXTERNAL_MODULE_three__.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.9,
            depthTest: false,
            depthWrite: false
        });
        this.centerSphereMaterial = centerSphereMaterial;
        const centerSphere = new __WEBPACK_EXTERNAL_MODULE_three__.Mesh(new __WEBPACK_EXTERNAL_MODULE_three__.SphereGeometry(PIVOT_CENTER_BASE_RADIUS, 18, 18), centerSphereMaterial);
        centerSphere.name = 'spaceMousePivotCenter';
        this.ringGizmo.add(xRing, yRing, zRing, centerSphere);
        this.overlayScene.add(this.ringGizmo);
    }
    createPivotRing(color) {
        const material = new __WEBPACK_EXTERNAL_MODULE_three__.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.72,
            depthTest: false,
            depthWrite: false
        });
        this.ringMaterials.push(material);
        return new __WEBPACK_EXTERNAL_MODULE_three__.Mesh(new __WEBPACK_EXTERNAL_MODULE_three__.TorusGeometry(PIVOT_RING_BASE_RADIUS, PIVOT_RING_TUBE_RADIUS, 20, 72), material);
    }
    showPivotRings() {
        this.ringGizmo.visible = this.shouldShowPivotRings();
    }
    hidePivotRings() {
        this.ringGizmo.visible = false;
    }
    updatePivotRings(camera) {
        const displayPivot = this.pointerDragStarted || 'none' !== this.pointerState ? this.pivot : this.navIsActive ? this.getSpaceMousePivot() : this.pivot;
        this.ringGizmo.position.copy(displayPivot);
        this.ringGizmo.visible = this.shouldShowPivotRings();
        const viewportHeight = Math.max(this.services?.getViewportSize().height ?? 0, 1);
        const distance = Math.max(camera.position.distanceTo(displayPivot), 1e-6);
        const radius = this.projectedRadius(PIVOT_RING_BASE_RADIUS, camera, distance, viewportHeight);
        const scale = radius <= 1e-6 ? 1 : PIVOT_RING_PIXEL_RADIUS / radius;
        this.ringGizmo.scale.setScalar(scale);
        const centerSphere = this.ringGizmo.getObjectByName('spaceMousePivotCenter');
        if (centerSphere) {
            const centerRadius = this.projectedRadius(PIVOT_CENTER_BASE_RADIUS, camera, distance, viewportHeight);
            const centerScale = centerRadius <= 1e-6 ? 1 : PIVOT_CENTER_PIXEL_RADIUS / centerRadius;
            centerSphere.scale.setScalar(centerScale / scale);
        }
    }
    shouldShowPivotRings() {
        return this.pivotGizmoEnabled && this.enabled && (this.pointerDragStarted || this.navIsActive);
    }
    projectedRadius(radius, camera, distance, viewportHeight) {
        if (camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.PerspectiveCamera) {
            const fov = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.degToRad(camera.fov);
            return viewportHeight * radius / (2 * distance * Math.tan(fov / 2));
        }
        if (camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.OrthographicCamera) return viewportHeight * radius * camera.zoom / Math.max(camera.top - camera.bottom, 1e-6);
        return 1;
    }
    disposePivotRings() {
        this.overlayScene.remove(this.ringGizmo);
        this.ringGizmo.traverse((child)=>{
            const mesh = child;
            mesh.geometry?.dispose();
        });
        for (const material of this.ringMaterials)material.dispose();
        this.ringMaterials.length = 0;
        this.centerSphereMaterial?.dispose();
        this.centerSphereMaterial = null;
    }
}
const SpaceMouseController_rslib_entry_ = SpaceMouseController;
export { SpaceMouseController, SpaceMouseController_rslib_entry_ as default };
