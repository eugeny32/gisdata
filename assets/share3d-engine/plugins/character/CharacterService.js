import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__ from "../../shared/constants/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__motor_CapsuleCharacterMotor_js_5e90becd__ from "./motor/CapsuleCharacterMotor.js";
const DEFAULT_FIRST_PERSON_VIEW_OPTIONS = {
    lookInteraction: 'drag-look',
    lookSensitivity: __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.FIRST_PERSON_LOOK_SPEED,
    dragButton: 0,
    pointerLockButton: 0,
    minPitch: -Math.PI / 2 + 1e-4,
    maxPitch: Math.PI / 2 - 1e-4
};
const DEFAULT_THIRD_PERSON_VIEW_OPTIONS = {
    lookSensitivity: 1.5 * __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.FIRST_PERSON_LOOK_SPEED,
    dragButton: 0,
    followDistance: 4.5,
    minDistance: 1.5,
    maxDistance: 12,
    zoomSensitivity: 0.01,
    minPitch: -Math.PI / 3,
    maxPitch: Math.PI / 2 - 1e-4,
    cameraCollision: {
        enabled: false,
        radius: 0.22,
        skinWidth: 0.08,
        minDistance: 0.75,
        pullInSmoothing: 20,
        restoreSmoothing: 8
    }
};
const DEFAULT_COMMAND = {
    move: {
        forward: 0,
        right: 0
    },
    run: false,
    jump: false,
    bodyYaw: 0,
    aimYaw: 0,
    aimPitch: 0
};
class CharacterServiceImpl {
    constructor(onVisualChange = ()=>{}){
        this.onVisualChange = onVisualChange;
        this.spatialQueryService = null;
        this.records = new Map();
        this.viewBindings = new Map();
        this.nextId = 0;
        this.disposed = false;
    }
    setSpatialQueryService(service) {
        this.spatialQueryService = service;
    }
    create(options = {}) {
        this.assertUsable();
        this.assertSpatialQueryService();
        const id = options.id ?? `character-${++this.nextId}`;
        if (this.records.has(id)) throw new Error(`CharacterService: character "${id}" already exists`);
        const command = mergeCharacterCommand(DEFAULT_COMMAND, options.command);
        const spatialQuery = {
            ...options.spatialQuery ?? {}
        };
        const motor = new __WEBPACK_EXTERNAL_MODULE__motor_CapsuleCharacterMotor_js_5e90becd__.CapsuleCharacterMotor(this.createMotorQueries(spatialQuery), options.motorOptions);
        if (options.floorPoint) motor.setFloorPoint(options.floorPoint);
        else if (options.capsuleStart) motor.setCapsuleStart(options.capsuleStart);
        motor.setOrientation(command.bodyYaw, command.aimYaw, command.aimPitch);
        const handle = new CharacterHandleImpl(id, this);
        const record = {
            id,
            handle,
            motor,
            command,
            snapshot: this.withId(id, motor.getSnapshot()),
            spatialQuery
        };
        this.records.set(id, record);
        this.onVisualChange('character.created');
        return handle;
    }
    get(id) {
        this.assertUsable();
        return this.records.get(id)?.handle;
    }
    list() {
        this.assertUsable();
        return Array.from(this.records.values(), (record)=>record.handle);
    }
    remove(id) {
        this.assertUsable();
        const removed = this.records.delete(id);
        if (removed) {
            this.clearBindingsForCharacter(id);
            this.onVisualChange('character.removed');
        }
        return removed;
    }
    update(delta) {
        this.assertUsable();
        for (const record of this.records.values()){
            record.snapshot = this.withId(record.id, record.motor.update(record.command, delta));
            record.command = {
                ...record.command,
                move: {
                    ...record.command.move
                },
                jump: false
            };
        }
    }
    getSnapshot(id) {
        return cloneCharacterSnapshot(this.requireRecord(id).snapshot);
    }
    getCommand(id) {
        return cloneCharacterCommand(this.requireRecord(id).command);
    }
    setCommand(id, command) {
        const record = this.requireRecord(id);
        record.command = mergeCharacterCommand(record.command, command);
        record.motor.setOrientation(record.command.bodyYaw, record.command.aimYaw, record.command.aimPitch);
        record.snapshot = this.withId(record.id, record.motor.getSnapshot());
        this.onVisualChange('character.command');
        return cloneCharacterSnapshot(record.snapshot);
    }
    replaceCommand(id, command) {
        const record = this.requireRecord(id);
        record.command = cloneCharacterCommand(command);
        record.motor.setOrientation(record.command.bodyYaw, record.command.aimYaw, record.command.aimPitch);
        record.snapshot = this.withId(record.id, record.motor.getSnapshot());
        this.onVisualChange('character.command');
        return cloneCharacterSnapshot(record.snapshot);
    }
    resetCommand(id) {
        return this.replaceCommand(id, DEFAULT_COMMAND);
    }
    bindViewCharacter(viewId, characterId, options = {}) {
        this.requireRecord(characterId);
        const binding = {
            viewId,
            characterId,
            firstPerson: normalizeFirstPersonViewOptions(options.firstPerson),
            thirdPerson: normalizeThirdPersonViewOptions(options.thirdPerson)
        };
        this.viewBindings.set(viewId, binding);
        this.onVisualChange('character.bindingChanged');
        return cloneCharacterViewBinding(binding);
    }
    unbindViewCharacter(viewId) {
        this.assertUsable();
        const removed = this.viewBindings.delete(viewId);
        if (removed) this.onVisualChange('character.bindingChanged');
        return removed;
    }
    getViewBinding(viewId) {
        this.assertUsable();
        const binding = this.viewBindings.get(viewId);
        return binding ? cloneCharacterViewBinding(binding) : null;
    }
    listViewBindings() {
        this.assertUsable();
        return Array.from(this.viewBindings.values(), cloneCharacterViewBinding);
    }
    setCapsuleStart(id, point) {
        const record = this.requireRecord(id);
        record.motor.setCapsuleStart(point);
        record.snapshot = this.withId(record.id, record.motor.getSnapshot());
        this.onVisualChange('character.pose');
        return cloneCharacterSnapshot(record.snapshot);
    }
    setFloorPoint(id, point) {
        const record = this.requireRecord(id);
        record.motor.setFloorPoint(point);
        record.snapshot = this.withId(record.id, record.motor.getSnapshot());
        this.onVisualChange('character.pose');
        return cloneCharacterSnapshot(record.snapshot);
    }
    dispose() {
        if (this.disposed) return;
        this.disposed = true;
        this.records.clear();
        this.viewBindings.clear();
        this.spatialQueryService = null;
    }
    withId(id, snapshot) {
        return {
            id,
            ...snapshot
        };
    }
    createMotorQueries(spatialQuery) {
        return {
            overlapCapsule: (capsule)=>this.spatialQueryService.overlapCollisionCapsule({
                    ...spatialQuery,
                    capsule
                }),
            resolveCapsule: (capsule, maxIterations, skinWidth)=>this.spatialQueryService.resolveCollisionCapsule({
                    ...spatialQuery,
                    capsule,
                    maxIterations,
                    skinWidth
                }),
            sweepCapsule: (capsule, motion, maxSteps)=>this.spatialQueryService.sweepCollisionCapsule({
                    ...spatialQuery,
                    capsule,
                    motion,
                    maxSteps
                }),
            resolveGround: (origin, down, maxDistance)=>this.spatialQueryService.resolveCollisionGround({
                    ...spatialQuery,
                    origin,
                    down,
                    maxDistance
                })
        };
    }
    requireRecord(id) {
        this.assertUsable();
        const record = this.records.get(id);
        if (!record) throw new Error(`CharacterService: character "${id}" was not found`);
        return record;
    }
    assertUsable() {
        if (this.disposed) throw new Error('CharacterService has been disposed');
    }
    assertSpatialQueryService() {
        if (!this.spatialQueryService) throw new Error('CharacterService requires SpatialQueryService before creating characters');
    }
    clearBindingsForCharacter(characterId) {
        for (const [viewId, binding] of this.viewBindings)if (binding.characterId === characterId) this.viewBindings.delete(viewId);
    }
}
class CharacterHandleImpl {
    constructor(id, service){
        this.id = id;
        this.service = service;
    }
    getSnapshot() {
        return this.service.getSnapshot(this.id);
    }
    getCommand() {
        return this.service.getCommand(this.id);
    }
    setCommand(command) {
        return this.service.setCommand(this.id, command);
    }
    replaceCommand(command) {
        return this.service.replaceCommand(this.id, command);
    }
    resetCommand() {
        return this.service.resetCommand(this.id);
    }
    setCapsuleStart(point) {
        return this.service.setCapsuleStart(this.id, point);
    }
    setFloorPoint(point) {
        return this.service.setFloorPoint(this.id, point);
    }
    dispose() {
        this.service.remove(this.id);
    }
}
function mergeCharacterCommand(current, patch) {
    return {
        move: {
            forward: patch?.move?.forward ?? current.move.forward,
            right: patch?.move?.right ?? current.move.right
        },
        run: patch?.run ?? current.run,
        jump: patch?.jump ?? current.jump,
        bodyYaw: patch?.bodyYaw ?? current.bodyYaw,
        aimYaw: patch?.aimYaw ?? current.aimYaw,
        aimPitch: patch?.aimPitch ?? current.aimPitch
    };
}
function cloneCharacterCommand(command) {
    return {
        ...command,
        move: {
            ...command.move
        }
    };
}
function cloneCharacterSnapshot(snapshot) {
    return {
        ...snapshot,
        capsule: {
            start: snapshot.capsule.start.clone(),
            end: snapshot.capsule.end.clone(),
            radius: snapshot.capsule.radius
        },
        floorPoint: snapshot.floorPoint.clone(),
        eyePosition: snapshot.eyePosition.clone(),
        velocity: snapshot.velocity.clone(),
        groundNormal: snapshot.groundNormal?.clone() ?? null
    };
}
function normalizeFirstPersonViewOptions(options) {
    const minPitch = options?.minPitch ?? DEFAULT_FIRST_PERSON_VIEW_OPTIONS.minPitch;
    const maxPitch = options?.maxPitch ?? DEFAULT_FIRST_PERSON_VIEW_OPTIONS.maxPitch;
    const normalizedMinPitch = Math.min(minPitch, maxPitch);
    const normalizedMaxPitch = Math.max(minPitch, maxPitch);
    return {
        lookInteraction: options?.lookInteraction ?? DEFAULT_FIRST_PERSON_VIEW_OPTIONS.lookInteraction,
        lookSensitivity: options?.lookSensitivity ?? DEFAULT_FIRST_PERSON_VIEW_OPTIONS.lookSensitivity,
        dragButton: options?.dragButton ?? DEFAULT_FIRST_PERSON_VIEW_OPTIONS.dragButton,
        pointerLockButton: options?.pointerLockButton ?? DEFAULT_FIRST_PERSON_VIEW_OPTIONS.pointerLockButton,
        minPitch: normalizedMinPitch,
        maxPitch: normalizedMaxPitch
    };
}
function normalizeThirdPersonViewOptions(options) {
    const minPitch = options?.minPitch ?? DEFAULT_THIRD_PERSON_VIEW_OPTIONS.minPitch;
    const maxPitch = options?.maxPitch ?? DEFAULT_THIRD_PERSON_VIEW_OPTIONS.maxPitch;
    const minDistance = options?.minDistance ?? DEFAULT_THIRD_PERSON_VIEW_OPTIONS.minDistance;
    const maxDistance = options?.maxDistance ?? DEFAULT_THIRD_PERSON_VIEW_OPTIONS.maxDistance;
    const normalizedMinPitch = Math.min(minPitch, maxPitch);
    const normalizedMaxPitch = Math.max(minPitch, maxPitch);
    const normalizedMinDistance = Math.max(0.1, Math.min(minDistance, maxDistance));
    const normalizedMaxDistance = Math.max(normalizedMinDistance, maxDistance);
    const followDistance = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.clamp(options?.followDistance ?? DEFAULT_THIRD_PERSON_VIEW_OPTIONS.followDistance, normalizedMinDistance, normalizedMaxDistance);
    return {
        lookSensitivity: options?.lookSensitivity ?? DEFAULT_THIRD_PERSON_VIEW_OPTIONS.lookSensitivity,
        dragButton: options?.dragButton ?? DEFAULT_THIRD_PERSON_VIEW_OPTIONS.dragButton,
        followDistance,
        minDistance: normalizedMinDistance,
        maxDistance: normalizedMaxDistance,
        zoomSensitivity: options?.zoomSensitivity ?? DEFAULT_THIRD_PERSON_VIEW_OPTIONS.zoomSensitivity,
        minPitch: normalizedMinPitch,
        maxPitch: normalizedMaxPitch,
        cameraCollision: normalizeThirdPersonCameraCollisionOptions(options)
    };
}
function normalizeThirdPersonCameraCollisionOptions(options) {
    const defaults = DEFAULT_THIRD_PERSON_VIEW_OPTIONS.cameraCollision;
    const collision = options?.cameraCollision;
    return {
        enabled: collision?.enabled ?? defaults.enabled,
        radius: Math.max(0, collision?.radius ?? defaults.radius),
        skinWidth: Math.max(0, collision?.skinWidth ?? defaults.skinWidth),
        minDistance: Math.max(0.1, collision?.minDistance ?? defaults.minDistance),
        pullInSmoothing: Math.max(0.1, collision?.pullInSmoothing ?? defaults.pullInSmoothing),
        restoreSmoothing: Math.max(0.1, collision?.restoreSmoothing ?? defaults.restoreSmoothing)
    };
}
function cloneCharacterViewBinding(binding) {
    return {
        viewId: binding.viewId,
        characterId: binding.characterId,
        firstPerson: {
            ...binding.firstPerson
        },
        thirdPerson: {
            ...binding.thirdPerson,
            cameraCollision: {
                ...binding.thirdPerson.cameraCollision
            }
        }
    };
}
export { CharacterServiceImpl };
