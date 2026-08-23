import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__control_NativeControlUtils_js_85dbe257__ from "../control/NativeControlUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_c632c149__ from "../../shared/types/assets.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_30373853__ from "../../shared/types/core.js";
import * as __WEBPACK_EXTERNAL_MODULE__CharacterService_js_15a3cd2b__ from "./CharacterService.js";
import * as __WEBPACK_EXTERNAL_MODULE__control_CharacterFirstPersonController_js_fae6ef87__ from "./control/CharacterFirstPersonController.js";
import * as __WEBPACK_EXTERNAL_MODULE__control_CharacterThirdPersonController_js_680ee668__ from "./control/CharacterThirdPersonController.js";
import * as __WEBPACK_EXTERNAL_MODULE__control_characterControlUtils_js_66423159__ from "./control/characterControlUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__presentation_CapsuleCharacterPresenter_js_9b5d1df7__ from "./presentation/CapsuleCharacterPresenter.js";
const WORLD_UP = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 1);
const WORLD_FORWARD = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1, 0, 0);
const ORIGIN = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
class CharacterPlugin {
    constructor(options = {}){
        this.name = 'character';
        this.priority = 18;
        this.dependencies = [
            'ViewRegistry',
            'ViewEventRouter',
            'PointerLockService',
            'CameraRig',
            'ViewportCamera',
            'ControlModeRegistry',
            'RenderPipeline',
            'SpatialQueryService'
        ];
        this.provides = [
            'CharacterService'
        ];
        this.context = null;
        this.service = null;
        this.viewRegistry = null;
        this.viewEventRouter = null;
        this.pointerLockService = null;
        this.controlModeRegistry = null;
        this.renderPipeline = null;
        this.characterSceneRoot = null;
        this.characterDebugRoot = null;
        this.isolatedCharacterScene = new __WEBPACK_EXTERNAL_MODULE_three__.Scene();
        this.presentationRuntimes = new Map();
        this.disposed = false;
        this.renderContributor = {
            kind: 'character',
            phases: [
                __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_c632c149__.RenderPhase.MainOcclusionTested
            ],
            renderPriority: 10,
            render: (frame, _phase, renderContext)=>{
                this.renderCharacters(frame, renderContext);
            },
            getRenderActivity: (context)=>this.getRenderActivity(context)
        };
        this.handleViewRemoved = ({ viewId })=>{
            this.service?.unbindViewCharacter(viewId);
        };
        this.presenterFactory = options.presenterFactory ?? ((context)=>new __WEBPACK_EXTERNAL_MODULE__presentation_CapsuleCharacterPresenter_js_9b5d1df7__.CapsuleCharacterPresenter({
                characterId: context.characterId,
                sceneRoot: context.sceneRoot,
                debugRoot: context.debugRoot
            }));
        this.animationControllerFactory = options.animationControllerFactory ?? null;
    }
    onInit(context) {
        this.context = context;
        this.disposed = false;
        this.service = new __WEBPACK_EXTERNAL_MODULE__CharacterService_js_15a3cd2b__.CharacterServiceImpl((reason)=>this.invalidateCharacter(reason));
        context.registerService('CharacterService', this.service);
    }
    onStart() {
        if (!this.context || !this.service) throw new Error('CharacterPlugin is not initialized');
        this.viewRegistry = this.context.getService('ViewRegistry');
        this.viewEventRouter = this.context.getService('ViewEventRouter');
        this.pointerLockService = this.context.getService('PointerLockService');
        this.context.getService('CameraRig');
        this.context.getService('ViewportCamera');
        this.controlModeRegistry = this.context.getService('ControlModeRegistry');
        this.renderPipeline = this.context.getService('RenderPipeline');
        this.service.setSpatialQueryService(this.context.getService('SpatialQueryService'));
        this.initializeSceneRoots();
        const firstPersonFactory = (services)=>new __WEBPACK_EXTERNAL_MODULE__control_CharacterFirstPersonController_js_fae6ef87__.CharacterFirstPersonController({
                services,
                characterService: this.service,
                viewEventRouter: this.viewEventRouter,
                pointerLockService: this.pointerLockService,
                onVisualInput: (reason)=>this.invalidateCharacter(reason)
            });
        const thirdPersonFactory = (services)=>new __WEBPACK_EXTERNAL_MODULE__control_CharacterThirdPersonController_js_680ee668__.CharacterThirdPersonController({
                services,
                characterService: this.service,
                viewEventRouter: this.viewEventRouter,
                onVisualInput: (reason)=>this.invalidateCharacter(reason)
            });
        this.controlModeRegistry.registerFactory('character-first-person', firstPersonFactory);
        this.controlModeRegistry.registerFactory('character-third-person', thirdPersonFactory);
        this.renderPipeline.addRenderContributor(this.renderContributor);
        this.context.events.on('view.removed', this.handleViewRemoved);
        this.syncPresentationRuntimes();
    }
    onUpdateFrame(frame) {
        this.service?.update(frame.delta);
        this.syncPresentationRuntimes({
            frameNumber: frame.frameNumber,
            timestamp: frame.timestamp,
            delta: frame.delta
        });
    }
    onRenderView(frame) {
        if (!this.service || !this.viewRegistry) return;
        this.syncPresentationRuntimes();
        this.applyPresentationVisibility(frame.viewId);
        const binding = this.service.getViewBinding(frame.viewId);
        if (!binding) return;
        const controlManager = this.viewRegistry.getExtension(frame.viewId, 'controlManager');
        const activeMode = controlManager?.activeMode;
        if ('character-first-person' !== activeMode && 'character-third-person' !== activeMode) return;
        const rig = this.viewRegistry.getExtension(frame.viewId, 'cameraRig');
        if (!rig) return;
        const handle = this.service.get(binding.characterId);
        if (!handle) return;
        const snapshot = handle.getSnapshot();
        if ('character-first-person' === activeMode) {
            this.applyFirstPersonCamera(rig, snapshot);
            return;
        }
        const thirdPersonController = controlManager?.activeController;
        if (!hasThirdPersonCameraState(thirdPersonController)) return;
        this.applyThirdPersonCamera(rig, thirdPersonController.getCameraState(snapshot, frame.delta));
    }
    onDestroy() {
        if (this.disposed) return;
        this.disposed = true;
        this.context?.events.off('view.removed', this.handleViewRemoved);
        this.renderPipeline?.removeRenderContributor(this.renderContributor);
        this.controlModeRegistry?.unregisterFactory('character-third-person');
        this.controlModeRegistry?.unregisterFactory('character-first-person');
        this.disposePresentationRuntimes();
        this.characterSceneRoot?.removeFromParent();
        this.characterDebugRoot?.removeFromParent();
        this.service?.dispose();
        this.service = null;
        this.viewRegistry = null;
        this.viewEventRouter = null;
        this.pointerLockService = null;
        this.controlModeRegistry = null;
        this.renderPipeline = null;
        this.characterSceneRoot = null;
        this.characterDebugRoot = null;
        this.context = null;
    }
    initializeSceneRoots() {
        if (!this.context) return;
        const characterRoot = this.context.sceneGraph.registerRoot('character');
        this.characterSceneRoot = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
        this.characterSceneRoot.name = 'characterRuntimeRoot';
        characterRoot.add(this.characterSceneRoot);
        this.characterDebugRoot = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
        this.characterDebugRoot.name = 'characterRuntimeDebugRoot';
        this.characterDebugRoot.visible = false;
        this.context.sceneGraph.debugRoot.add(this.characterDebugRoot);
    }
    invalidateCharacter(reason) {
        this.context?.renderInvalidation?.invalidate(reason);
    }
    getRenderActivity(context) {
        if (0 === context.renderedViewIds.length || !this.service) return {
            needsNextFrame: false,
            reasons: []
        };
        const reasons = new Set();
        for (const handle of this.service.list()){
            const command = handle.getCommand();
            const snapshot = handle.getSnapshot();
            if (Math.abs(command.move.forward) > 0 || Math.abs(command.move.right) > 0 || command.jump) reasons.add('character.motion');
            if (snapshot.speed > 0.001 || snapshot.planarSpeed > 0.001 || 'jump' === snapshot.locomotionState || 'fall' === snapshot.locomotionState || 'land' === snapshot.locomotionState) reasons.add('character.motion');
        }
        for (const viewId of context.renderedViewIds)if (this.hasThirdPersonCameraActivity(viewId)) reasons.add('character.cameraFollow');
        return {
            needsNextFrame: reasons.size > 0,
            reasons: Array.from(reasons)
        };
    }
    syncPresentationRuntimes(animationContext) {
        if (!this.service || !this.characterSceneRoot || !this.characterDebugRoot) return;
        const activeIds = new Set();
        for (const handle of this.service.list()){
            activeIds.add(handle.id);
            const runtime = this.ensurePresentationRuntime(handle.id);
            const frame = this.createPresentationFrame(handle.getSnapshot());
            runtime.presenter.update(frame);
            if (animationContext) runtime.animationController?.update(frame, animationContext);
        }
        for (const [characterId] of this.presentationRuntimes)if (!activeIds.has(characterId)) this.disposePresentationRuntime(characterId);
    }
    ensurePresentationRuntime(characterId) {
        const existing = this.presentationRuntimes.get(characterId);
        if (existing) return existing;
        if (!this.characterSceneRoot || !this.characterDebugRoot) throw new Error('CharacterPlugin scene roots are not initialized');
        const presenter = this.presenterFactory({
            characterId,
            sceneRoot: this.characterSceneRoot,
            debugRoot: this.characterDebugRoot
        });
        const animationController = this.animationControllerFactory?.({
            characterId,
            presenter
        }) ?? null;
        const runtime = {
            presenter,
            animationController,
            visible: true
        };
        this.presentationRuntimes.set(characterId, runtime);
        this.invalidateCharacter('character.presentationReady');
        return runtime;
    }
    disposePresentationRuntime(characterId) {
        const runtime = this.presentationRuntimes.get(characterId);
        if (!runtime) return;
        runtime.animationController?.dispose();
        runtime.presenter.dispose();
        this.presentationRuntimes.delete(characterId);
    }
    disposePresentationRuntimes() {
        for (const characterId of Array.from(this.presentationRuntimes.keys()))this.disposePresentationRuntime(characterId);
    }
    applyPresentationVisibility(viewId) {
        if (!this.service || !this.viewRegistry) return;
        const binding = this.service.getViewBinding(viewId);
        const controlManager = this.viewRegistry.getExtension(viewId, 'controlManager');
        const hiddenCharacterId = binding && controlManager?.activeMode === 'character-first-person' ? binding.characterId : null;
        for (const [characterId, runtime] of this.presentationRuntimes){
            const visible = characterId !== hiddenCharacterId;
            runtime.presenter.setVisible(visible);
            if (runtime.visible !== visible) {
                runtime.visible = visible;
                this.invalidateCharacter('character.presentationVisibility');
            }
        }
    }
    hasThirdPersonCameraActivity(viewId) {
        if (!this.service || !this.viewRegistry) return false;
        const binding = this.service.getViewBinding(viewId);
        if (!binding) return false;
        const controlManager = this.viewRegistry.getExtension(viewId, 'controlManager');
        if (controlManager?.activeMode !== 'character-third-person') return false;
        const controller = controlManager.activeController;
        return hasCharacterCameraActivity(controller) && controller.hasCameraActivity();
    }
    createPresentationFrame(snapshot) {
        const aimDirection = (0, __WEBPACK_EXTERNAL_MODULE__control_characterControlUtils_js_66423159__.createAimDirection)(snapshot.aimYaw, snapshot.aimPitch);
        const bodyQuaternion = new __WEBPACK_EXTERNAL_MODULE_three__.Quaternion().setFromAxisAngle(WORLD_UP, snapshot.bodyYaw);
        const bodyDirection = WORLD_FORWARD.clone().applyQuaternion(bodyQuaternion).normalize();
        const capsuleAxis = snapshot.capsule.end.clone().sub(snapshot.capsule.start);
        const capsuleDirection = capsuleAxis.lengthSq() > Number.EPSILON ? capsuleAxis.normalize() : WORLD_UP.clone();
        const eyeQuaternion = quaternionFromLookDirection(aimDirection);
        return {
            characterId: snapshot.id,
            snapshot,
            anchors: {
                root: {
                    position: snapshot.floorPoint.clone(),
                    quaternion: bodyQuaternion.clone()
                },
                capsule: {
                    position: snapshot.capsule.start.clone().add(snapshot.capsule.end).multiplyScalar(0.5),
                    quaternion: new __WEBPACK_EXTERNAL_MODULE_three__.Quaternion().setFromUnitVectors(WORLD_UP, capsuleDirection)
                },
                eye: {
                    position: snapshot.eyePosition.clone(),
                    quaternion: eyeQuaternion
                }
            },
            bodyDirection,
            aimDirection,
            locomotionState: snapshot.locomotionState,
            speed: snapshot.speed,
            planarSpeed: snapshot.planarSpeed
        };
    }
    applyFirstPersonCamera(rig, snapshot) {
        const direction = (0, __WEBPACK_EXTERNAL_MODULE__control_characterControlUtils_js_66423159__.createAimDirection)(snapshot.aimYaw, snapshot.aimPitch);
        const state = rig.getState();
        const position = snapshot.eyePosition.clone();
        rig.setState({
            ...state,
            position,
            target: position.clone().add(direction),
            up: (0, __WEBPACK_EXTERNAL_MODULE__control_NativeControlUtils_js_85dbe257__.computeRollFreeUp)(direction),
            mode: __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_30373853__.CameraMode.Perspective
        });
    }
    applyThirdPersonCamera(rig, cameraState) {
        const state = rig.getState();
        rig.setState({
            ...state,
            position: cameraState.position.clone(),
            target: cameraState.target.clone(),
            up: cameraState.up.clone(),
            mode: __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_30373853__.CameraMode.Perspective
        });
    }
    renderCharacters(frame, renderContext) {
        if (!this.characterSceneRoot || 0 === this.characterSceneRoot.children.length) return;
        const renderer = renderContext.renderer;
        const savedTarget = renderer.getRenderTarget();
        const savedViewport = 'function' == typeof renderer.getViewport ? renderer.getViewport(new __WEBPACK_EXTERNAL_MODULE_three__.Vector4()) : null;
        const savedScissor = 'function' == typeof renderer.getScissor ? renderer.getScissor(new __WEBPACK_EXTERNAL_MODULE_three__.Vector4()) : null;
        const savedScissorTest = 'function' == typeof renderer.getScissorTest ? renderer.getScissorTest() : false;
        renderer.setRenderTarget(renderContext.outputTarget);
        renderer.setViewport(renderContext.viewport.x, renderContext.viewport.y, renderContext.viewport.width, renderContext.viewport.height);
        renderer.setScissor(renderContext.viewport.x, renderContext.viewport.y, renderContext.viewport.width, renderContext.viewport.height);
        renderer.setScissorTest(true);
        const restoreParent = this.attachCharacterRootToIsolatedScene();
        try {
            renderer.render(this.isolatedCharacterScene, frame.camera);
        } finally{
            restoreParent();
            if (savedViewport) renderer.setViewport(savedViewport.x, savedViewport.y, savedViewport.z, savedViewport.w);
            if (savedScissor) renderer.setScissor(savedScissor.x, savedScissor.y, savedScissor.z, savedScissor.w);
            renderer.setScissorTest(savedScissorTest);
            renderer.setRenderTarget(savedTarget);
        }
    }
    attachCharacterRootToIsolatedScene() {
        if (!this.characterSceneRoot) return ()=>{};
        const originalParent = this.characterSceneRoot.parent;
        this.isolatedCharacterScene.add(this.characterSceneRoot);
        return ()=>{
            this.characterSceneRoot?.removeFromParent();
            if (originalParent) originalParent.add(this.characterSceneRoot);
        };
    }
}
function hasThirdPersonCameraState(value) {
    return 'object' == typeof value && null !== value && 'getCameraState' in value && 'function' == typeof value.getCameraState;
}
function hasCharacterCameraActivity(controller) {
    return 'object' == typeof controller && null !== controller && 'hasCameraActivity' in controller && 'function' == typeof controller.hasCameraActivity;
}
function quaternionFromLookDirection(direction) {
    const up = (0, __WEBPACK_EXTERNAL_MODULE__control_NativeControlUtils_js_85dbe257__.computeRollFreeUp)(direction);
    const matrix = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4().lookAt(ORIGIN, direction.clone(), up).invert();
    return new __WEBPACK_EXTERNAL_MODULE_three__.Quaternion().setFromRotationMatrix(matrix);
}
export { CharacterPlugin };
