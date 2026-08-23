import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_loaders_GLTFLoader_js_81322d5a__ from "three/examples/jsm/loaders/GLTFLoader.js";
import * as __WEBPACK_EXTERNAL_MODULE__CharacterPlugin_js_d6bf3a6f__ from "../CharacterPlugin.js";
import * as __WEBPACK_EXTERNAL_MODULE__CapsuleCharacterPresenter_js_75fb3459__ from "./CapsuleCharacterPresenter.js";
import * as __WEBPACK_EXTERNAL_MODULE__InvisibleCharacterPresenter_js_ef003f0a__ from "./InvisibleCharacterPresenter.js";
import * as __WEBPACK_EXTERNAL_MODULE__corePlugins_js_bb3f684e__ from "../../corePlugins.js";
const TIMMY_ROBOT_MODEL_URL = '/3dmodel/timmyrobot.glb';
const Y_BOT_MODEL_URL = TIMMY_ROBOT_MODEL_URL;
const MODEL_UP = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 1, 0);
const WORLD_UP = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 1);
const DEFAULT_AXIS_CORRECTION = new __WEBPACK_EXTERNAL_MODULE_three__.Quaternion().setFromUnitVectors(MODEL_UP, WORLD_UP);
const DEFAULT_YAW_OFFSET = Math.PI / 2;
const DEFAULT_SCALE = 1;
const DEFAULT_LOCAL_OFFSET = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 0);
const DEFAULT_FADE_DURATION = 0.18;
const DEFAULT_WALK_SPEED = 2;
const DEFAULT_RUN_SPEED = 5.335;
const DEFAULT_SPEED_CHANGE_RATE = 10;
const DEFAULT_LANDING_MIN_HOLD = 0.12;
const DEFAULT_LANDING_MAX_HOLD = 0.42;
const LANDING_CANCEL_SPEED = 1.2;
const LOCOMOTION_WEIGHT_EPSILON = 1e-4;
const GROUND_LOCOMOTION_STATES = [
    'idle',
    'walk',
    'run'
];
const DEFAULT_CLIP_ALIASES = {
    idle: [
        'idle',
        'Idle'
    ],
    walk: [
        'Walking',
        'walk'
    ],
    run: [
        'Running',
        'running',
        'run'
    ],
    jump: [
        'JumpingUp',
        'jump'
    ],
    fall: [
        'FallingIdle',
        'falling',
        'fall'
    ],
    land: [
        'Landing',
        'land'
    ]
};
class YBotCharacterPresenter {
    constructor(options){
        this.modelContainer = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
        this.visible = true;
        this.loadState = 'loading';
        this.modelRoot = null;
        this.disposed = false;
        this.object = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
        this.object.name = `yBotCharacter:${options.characterId}`;
        options.sceneRoot.add(this.object);
        this.modelContainer.name = `yBotModelContainer:${options.characterId}`;
        this.object.add(this.modelContainer);
        this.lightingRoot = createYBotLightingRoot(options.characterId);
        options.sceneRoot.add(this.lightingRoot);
        this.fallbackPresenter = new __WEBPACK_EXTERNAL_MODULE__CapsuleCharacterPresenter_js_75fb3459__.CapsuleCharacterPresenter({
            characterId: options.characterId,
            sceneRoot: options.sceneRoot,
            debugRoot: options.debugRoot,
            color: '#94a3b8',
            opacity: 0.42
        });
        this.debugObject = this.fallbackPresenter.debugObject;
        this.modelCorrection = createModelCorrection(options.axisCorrection ?? DEFAULT_AXIS_CORRECTION, options.yawOffset ?? DEFAULT_YAW_OFFSET);
        this.modelOffset = options.localOffset?.clone() ?? DEFAULT_LOCAL_OFFSET.clone();
        this.modelScale = options.scale ?? DEFAULT_SCALE;
        this.onLoadStateChange = options.onLoadStateChange;
        this.onLoadStateChange?.('loading');
        this.bindingPromise = (options.modelPromise ?? loadYBotCharacterAsset(options.modelUrl)).then((asset)=>this.attachModel(asset)).catch((error)=>{
            const normalizedError = toError(error);
            if (!this.disposed) {
                this.loadState = 'error';
                this.updateVisibility();
                this.onLoadStateChange?.('error', normalizedError);
            }
            throw normalizedError;
        });
        this.bindingPromise.catch(()=>{});
        this.updateVisibility();
    }
    whenModelReady() {
        return this.bindingPromise;
    }
    update(frame) {
        this.object.position.copy(frame.anchors.root.position);
        this.object.quaternion.copy(frame.anchors.root.quaternion);
        this.modelContainer.position.copy(this.modelOffset);
        this.modelContainer.quaternion.copy(this.modelCorrection);
        this.modelContainer.scale.setScalar(this.modelScale);
        this.fallbackPresenter.update(frame);
        this.updateVisibility();
    }
    setVisible(visible) {
        this.visible = visible;
        this.updateVisibility();
    }
    dispose() {
        if (this.disposed) return;
        this.disposed = true;
        if (this.modelRoot) {
            disposeObjectTree(this.modelRoot);
            this.modelRoot = null;
        }
        this.fallbackPresenter.dispose();
        this.object.removeFromParent();
        this.object.clear();
        this.lightingRoot.removeFromParent();
        this.lightingRoot.clear();
    }
    attachModel(asset) {
        if (this.disposed) {
            disposeObjectTree(asset.scene);
            throw new Error('YBot presenter was disposed before model loading completed');
        }
        const root = asset.scene;
        root.name = 'yBotModel';
        prepareModelForCharacterRendering(root);
        this.modelContainer.add(root);
        this.modelRoot = root;
        this.loadState = 'ready';
        this.updateVisibility();
        this.onLoadStateChange?.('ready');
        return {
            root,
            animations: asset.animations
        };
    }
    updateVisibility() {
        const modelVisible = this.visible && 'ready' === this.loadState;
        this.object.visible = modelVisible;
        this.fallbackPresenter.setVisible(this.visible && !modelVisible);
    }
}
class YBotLocomotionAnimationController {
    constructor(presenter, options = {}){
        this.actions = new Map();
        this.groundLocomotionClipNames = new Map();
        this.clips = [];
        this.mixer = null;
        this.modelRoot = null;
        this.currentAction = null;
        this.currentClipName = null;
        this.latestFrame = null;
        this.groundLocomotionStarted = false;
        this.smoothedPlanarSpeed = 0;
        this.landingHoldRemaining = 0;
        this.landingHoldElapsed = 0;
        this.landingClipName = null;
        this.disposed = false;
        this.fadeDuration = options.fadeDuration ?? DEFAULT_FADE_DURATION;
        this.clipAliases = options.clipAliases ?? DEFAULT_CLIP_ALIASES;
        this.walkSpeed = options.walkSpeed ?? DEFAULT_WALK_SPEED;
        this.runSpeed = options.runSpeed ?? DEFAULT_RUN_SPEED;
        this.speedChangeRate = options.speedChangeRate ?? DEFAULT_SPEED_CHANGE_RATE;
        this.landingMinHold = options.landingMinHold ?? DEFAULT_LANDING_MIN_HOLD;
        this.landingMaxHold = options.landingMaxHold ?? DEFAULT_LANDING_MAX_HOLD;
        presenter.whenModelReady().then((binding)=>{
            this.initializeMixer(binding);
        }).catch(()=>{});
    }
    update(frame, context) {
        if (this.disposed) return;
        this.latestFrame = frame;
        if (!this.mixer) return;
        const delta = Math.max(0, context?.delta ?? 0);
        this.updateAnimationState(frame, delta);
        this.mixer.update(delta);
    }
    dispose() {
        if (this.disposed) return;
        this.disposed = true;
        if (this.mixer) {
            this.mixer.stopAllAction();
            for (const clip of this.clips)this.mixer.uncacheClip(clip);
            if (this.modelRoot) this.mixer.uncacheRoot(this.modelRoot);
        }
        this.actions.clear();
        this.groundLocomotionClipNames.clear();
        this.clips.length = 0;
        this.mixer = null;
        this.modelRoot = null;
        this.currentAction = null;
        this.currentClipName = null;
        this.groundLocomotionStarted = false;
        this.landingHoldRemaining = 0;
        this.landingHoldElapsed = 0;
        this.landingClipName = null;
    }
    initializeMixer(binding) {
        if (this.disposed) return;
        this.modelRoot = binding.root;
        this.mixer = new __WEBPACK_EXTERNAL_MODULE_three__.AnimationMixer(binding.root);
        this.clips.push(...binding.animations);
        for (const clip of binding.animations)this.actions.set(clip.name, this.mixer.clipAction(clip));
        this.resolveGroundLocomotionClips();
        if (this.latestFrame) this.updateAnimationState(this.latestFrame, 0);
    }
    updateAnimationState(frame, delta) {
        if ('jump' === frame.locomotionState || 'fall' === frame.locomotionState) {
            this.clearLandingHold();
            this.transitionToState(frame.locomotionState);
            return;
        }
        if ('land' === frame.locomotionState) {
            this.beginLandingState();
            return;
        }
        if (this.shouldHoldLanding(frame, delta)) return;
        this.applyGroundLocomotionBlend(frame, delta);
    }
    applyGroundLocomotionBlend(frame, delta) {
        const previousAction = this.currentAction;
        if (previousAction) previousAction.fadeOut(this.fadeDuration);
        this.currentAction = null;
        this.currentClipName = null;
        this.ensureGroundLocomotionActionsPlaying();
        const blendAlpha = delta > 0 ? 1 - Math.exp(-this.speedChangeRate * delta) : 1;
        this.smoothedPlanarSpeed = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.lerp(this.smoothedPlanarSpeed, Math.max(0, frame.planarSpeed), blendAlpha);
        const weights = computeYBotLocomotionBlendWeights(this.smoothedPlanarSpeed, this.walkSpeed, this.runSpeed);
        this.setGroundLocomotionWeight('idle', weights.idle);
        this.setGroundLocomotionWeight('walk', weights.walk);
        this.setGroundLocomotionWeight('run', weights.run);
    }
    transitionToState(state) {
        const targetClipName = resolveYBotLocomotionClipName(state, Array.from(this.actions.keys()), this.clipAliases);
        if (!targetClipName || targetClipName === this.currentClipName) return this.currentAction;
        const nextAction = this.actions.get(targetClipName);
        if (!nextAction) return null;
        this.fadeOutGroundLocomotionActions(nextAction);
        this.configureActionForState(nextAction, state, targetClipName);
        nextAction.enabled = true;
        nextAction.reset();
        nextAction.play();
        if (this.currentAction && this.currentAction !== nextAction) this.currentAction.crossFadeTo(nextAction, this.fadeDuration, false);
        else nextAction.fadeIn(this.fadeDuration);
        this.currentAction = nextAction;
        this.currentClipName = targetClipName;
        return nextAction;
    }
    beginLandingState() {
        const action = this.transitionToState('land');
        const clipName = this.currentClipName;
        if (!action || !clipName || !isExplicitClipForState('land', clipName, this.clipAliases)) {
            this.clearLandingHold();
            return;
        }
        if (this.landingClipName === clipName && this.landingHoldRemaining > 0) return;
        const duration = action.getClip().duration;
        this.landingClipName = clipName;
        this.landingHoldElapsed = 0;
        this.landingHoldRemaining = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.clamp(duration, this.landingMinHold, this.landingMaxHold);
    }
    shouldHoldLanding(frame, delta) {
        if (this.landingHoldRemaining <= 0 || !this.landingClipName || this.currentClipName !== this.landingClipName) return false;
        this.landingHoldElapsed += delta;
        this.landingHoldRemaining = Math.max(0, this.landingHoldRemaining - delta);
        if (this.landingHoldRemaining <= 0) {
            this.clearLandingHold();
            return false;
        }
        if (this.landingHoldElapsed >= this.landingMinHold && frame.planarSpeed >= LANDING_CANCEL_SPEED) {
            this.clearLandingHold();
            return false;
        }
        return true;
    }
    clearLandingHold() {
        this.landingHoldRemaining = 0;
        this.landingHoldElapsed = 0;
        this.landingClipName = null;
    }
    configureActionForState(action, state, clipName) {
        const oneShot = ('jump' === state || 'land' === state) && isExplicitClipForState(state, clipName, this.clipAliases);
        action.setLoop(oneShot ? __WEBPACK_EXTERNAL_MODULE_three__.LoopOnce : __WEBPACK_EXTERNAL_MODULE_three__.LoopRepeat, oneShot ? 1 : 1 / 0);
        action.clampWhenFinished = oneShot;
        action.setEffectiveTimeScale(1);
    }
    resolveGroundLocomotionClips() {
        this.groundLocomotionClipNames.clear();
        const usedClipNames = new Set();
        const clipNames = Array.from(this.actions.keys());
        for (const state of GROUND_LOCOMOTION_STATES){
            const clipName = resolveYBotLocomotionClipName(state, clipNames, this.clipAliases);
            if (!(!clipName || usedClipNames.has(clipName))) {
                usedClipNames.add(clipName);
                this.groundLocomotionClipNames.set(state, clipName);
            }
        }
    }
    ensureGroundLocomotionActionsPlaying() {
        for (const clipName of this.groundLocomotionClipNames.values()){
            const action = this.actions.get(clipName);
            if (!!action) {
                action.enabled = true;
                action.setLoop(__WEBPACK_EXTERNAL_MODULE_three__.LoopRepeat, 1 / 0);
                action.clampWhenFinished = false;
                if (!this.groundLocomotionStarted) action.reset();
                action.play();
            }
        }
        this.groundLocomotionStarted = true;
    }
    setGroundLocomotionWeight(state, weight) {
        const clipName = this.groundLocomotionClipNames.get(state);
        const action = clipName ? this.actions.get(clipName) : null;
        if (!action) return;
        action.enabled = weight > LOCOMOTION_WEIGHT_EPSILON;
        action.setEffectiveWeight(weight);
        action.setEffectiveTimeScale(1);
    }
    fadeOutGroundLocomotionActions(exceptAction) {
        for (const clipName of this.groundLocomotionClipNames.values()){
            const action = this.actions.get(clipName);
            if (!!action && action !== exceptAction) {
                action.fadeOut(this.fadeDuration);
                action.setEffectiveWeight(0);
            }
        }
    }
}
function createSpatialCapsuleWalkPlugins(options = {}) {
    const presentation = options.characterPresentation ?? 'model';
    const characterPlugin = new __WEBPACK_EXTERNAL_MODULE__CharacterPlugin_js_d6bf3a6f__.CharacterPlugin({
        presenterFactory: (context)=>{
            if ('none' === presentation) return new __WEBPACK_EXTERNAL_MODULE__InvisibleCharacterPresenter_js_ef003f0a__.InvisibleCharacterPresenter(context);
            if ('capsule' === presentation) return new __WEBPACK_EXTERNAL_MODULE__CapsuleCharacterPresenter_js_75fb3459__.CapsuleCharacterPresenter(context);
            return new YBotCharacterPresenter({
                ...context,
                modelUrl: options.modelUrl,
                onLoadStateChange: options.onModelStateChange
            });
        },
        animationControllerFactory: ({ presenter })=>presenter instanceof YBotCharacterPresenter ? new YBotLocomotionAnimationController(presenter) : null
    });
    let replacedCharacterPlugin = false;
    const plugins = [
        ...(0, __WEBPACK_EXTERNAL_MODULE__corePlugins_js_bb3f684e__.corePlugins)({
            withCredentials: options.withCredentials
        }),
        ...options.assetPlugins ?? []
    ].map((plugin)=>{
        if ('character' !== plugin.name) return plugin;
        replacedCharacterPlugin = true;
        return characterPlugin;
    });
    if (!replacedCharacterPlugin) plugins.push(characterPlugin);
    return plugins;
}
function resolveYBotLocomotionClipName(state, clipNames, aliases = DEFAULT_CLIP_ALIASES) {
    const exactNames = new Set(clipNames);
    const lowerNameMap = new Map(clipNames.map((name)=>[
            name.toLowerCase(),
            name
        ]));
    const candidates = aliases[state] ?? DEFAULT_CLIP_ALIASES[state];
    for (const candidate of candidates){
        if (exactNames.has(candidate)) return candidate;
        const lowerMatch = lowerNameMap.get(candidate.toLowerCase());
        if (lowerMatch) return lowerMatch;
    }
    if ('idle' !== state) return resolveYBotLocomotionClipName('idle', clipNames, aliases);
    return null;
}
function isExplicitClipForState(state, clipName, aliases) {
    const candidates = aliases[state] ?? DEFAULT_CLIP_ALIASES[state];
    return candidates.some((candidate)=>candidate.toLowerCase() === clipName.toLowerCase());
}
function computeYBotLocomotionBlendWeights(planarSpeed, walkSpeed = DEFAULT_WALK_SPEED, runSpeed = DEFAULT_RUN_SPEED) {
    const safeSpeed = Number.isFinite(planarSpeed) ? Math.max(0, planarSpeed) : 0;
    const safeWalkSpeed = Math.max(LOCOMOTION_WEIGHT_EPSILON, walkSpeed);
    const safeRunSpeed = Math.max(safeWalkSpeed + LOCOMOTION_WEIGHT_EPSILON, runSpeed);
    if (safeSpeed <= LOCOMOTION_WEIGHT_EPSILON) return {
        idle: 1,
        walk: 0,
        run: 0
    };
    if (safeSpeed < safeWalkSpeed) {
        const walkWeight = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.clamp(safeSpeed / safeWalkSpeed, 0, 1);
        return {
            idle: 1 - walkWeight,
            walk: walkWeight,
            run: 0
        };
    }
    const runWeight = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.clamp((safeSpeed - safeWalkSpeed) / (safeRunSpeed - safeWalkSpeed), 0, 1);
    return {
        idle: 0,
        walk: 1 - runWeight,
        run: runWeight
    };
}
function loadYBotCharacterAsset(modelUrl = Y_BOT_MODEL_URL) {
    const loader = new __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_loaders_GLTFLoader_js_81322d5a__.GLTFLoader();
    return loader.loadAsync(modelUrl).then((gltf)=>({
            scene: gltf.scene,
            animations: gltf.animations
        }));
}
function createModelCorrection(axisCorrection, yawOffset) {
    return new __WEBPACK_EXTERNAL_MODULE_three__.Quaternion().setFromAxisAngle(WORLD_UP, yawOffset).multiply(axisCorrection);
}
function createYBotLightingRoot(characterId) {
    const root = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
    root.name = `yBotLighting:${characterId}`;
    const hemisphere = new __WEBPACK_EXTERNAL_MODULE_three__.HemisphereLight(0xffffff, 0x475569, 1.25);
    hemisphere.name = `yBotHemisphereLight:${characterId}`;
    const key = new __WEBPACK_EXTERNAL_MODULE_three__.DirectionalLight(0xffffff, 1.6);
    key.name = `yBotKeyLight:${characterId}`;
    key.position.set(3, -4, 6);
    const fill = new __WEBPACK_EXTERNAL_MODULE_three__.DirectionalLight(0xdbeafe, 0.7);
    fill.name = `yBotFillLight:${characterId}`;
    fill.position.set(-4, 3, 4);
    root.add(hemisphere, key, fill);
    return root;
}
function prepareModelForCharacterRendering(root) {
    root.traverse((object)=>{
        object.frustumCulled = false;
        if (!isMeshLike(object)) return;
        object.castShadow = true;
        object.receiveShadow = true;
        setMaterialDepthTest(object.material);
    });
}
function setMaterialDepthTest(material) {
    if (!material) return;
    const materials = Array.isArray(material) ? material : [
        material
    ];
    for (const entry of materials){
        entry.depthTest = true;
        entry.depthWrite = true;
        entry.colorWrite = true;
        entry.needsUpdate = true;
    }
}
function disposeObjectTree(root) {
    const geometries = new Set();
    const materials = new Set();
    const textures = new Set();
    root.traverse((object)=>{
        if (!isMeshLike(object)) return;
        if (object.geometry) geometries.add(object.geometry);
        collectMaterials(object.material, materials, textures);
    });
    root.removeFromParent();
    root.clear();
    for (const texture of textures)texture.dispose();
    for (const material of materials)material.dispose();
    for (const geometry of geometries)geometry.dispose();
}
function collectMaterials(material, materials, textures) {
    const materialList = Array.isArray(material) ? material : [
        material
    ];
    for (const item of materialList){
        materials.add(item);
        for (const value of Object.values(item))if (value instanceof __WEBPACK_EXTERNAL_MODULE_three__.Texture) textures.add(value);
    }
}
function isMeshLike(object) {
    return object instanceof __WEBPACK_EXTERNAL_MODULE_three__.Mesh || object instanceof __WEBPACK_EXTERNAL_MODULE_three__.SkinnedMesh;
}
function toError(error) {
    return error instanceof Error ? error : new Error(String(error));
}
export { TIMMY_ROBOT_MODEL_URL, YBotCharacterPresenter, YBotLocomotionAnimationController, Y_BOT_MODEL_URL, computeYBotLocomotionBlendWeights, createSpatialCapsuleWalkPlugins, resolveYBotLocomotionClipName };
