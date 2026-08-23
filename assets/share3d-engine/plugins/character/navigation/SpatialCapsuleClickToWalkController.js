import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
const CLICK_TO_WALK_MOUSE_CLICK_THRESHOLD_PX = 5;
const CLICK_TO_WALK_TOUCH_TAP_THRESHOLD_PX = 10;
const CLICK_TO_WALK_ARRIVAL_RADIUS_M = 0.45;
const CLICK_TO_WALK_BLOCKED_WINDOW_MS = 900;
const CLICK_TO_WALK_BLOCKED_MIN_PROGRESS_M = 0.08;
const CLICK_TO_WALK_TURN_GRACE_MS = 500;
const CLICK_TO_WALK_ALIGNMENT_DEGREES = 35;
const CLICK_TO_WALK_HOVER_SURFACE_REUSE_MS = 120;
const CLICK_TO_WALK_HOVER_SURFACE_REUSE_DISTANCE_PX = 2;
const CLICK_TO_WALK_INPUT_PRIORITY = 1100;
const CLICK_TO_WALK_PLUGIN_PRIORITY = 17;
const CLICK_TO_WALK_TURN_RATE = 7;
const CLICK_TO_WALK_FORWARD_ALIGNMENT_LIMIT_RAD = Math.PI / 2;
const MIN_PLANAR_DISTANCE = 1e-4;
const MANUAL_INPUT_CODES = new Set([
    'KeyW',
    'KeyA',
    'KeyS',
    'KeyD',
    'ArrowUp',
    'ArrowLeft',
    'ArrowDown',
    'ArrowRight',
    'Space',
    'ShiftLeft',
    'ShiftRight'
]);
class SpatialCapsuleClickToWalkController {
    onInit(context) {
        this.context = context;
    }
    onStart() {
        if (!this.context) throw new Error('SpatialCapsuleClickToWalkController is not initialized');
        this.viewEventRouter = this.context.getService('ViewEventRouter');
        this.spatial = this.context.getService('SpatialQueryService');
        this.viewEventRouter.addConsumer(this.consumer);
        this.context.events.on('view.removed', this.handleViewRemoved);
    }
    onUpdateFrame(frame) {
        this.updateHoverSurfacePick();
        if (!this.target) return;
        const binding = this.binding;
        if (!binding?.character || !this.isAvailable()) {
            this.cancelTarget('context-lost');
            return;
        }
        if (this.manualKeys.size > 0) {
            this.cancelTarget('manual-input', {
                writeNeutralCommand: false
            });
            return;
        }
        const snapshot = binding.character.getSnapshot();
        const command = binding.character.getCommand();
        const planarDelta = this.target.point.clone().sub(snapshot.floorPoint);
        planarDelta.z = 0;
        const distance = planarDelta.length();
        if (distance <= CLICK_TO_WALK_ARRIVAL_RADIUS_M) {
            this.cancelTarget('arrived');
            return;
        }
        if (distance <= MIN_PLANAR_DISTANCE) {
            this.cancelTarget('arrived');
            return;
        }
        const targetYaw = Math.atan2(planarDelta.y, planarDelta.x);
        const nextYaw = rotateTowardsAngle(this.target.bodyYaw, targetYaw, Math.max(0, frame.delta) * CLICK_TO_WALK_TURN_RATE);
        this.target.bodyYaw = nextYaw;
        const alignment = Math.abs(shortestAngleDelta(nextYaw, targetYaw));
        const forward = alignment < CLICK_TO_WALK_FORWARD_ALIGNMENT_LIMIT_RAD ? 1 : 0;
        if (this.isBlocked(frame.timestamp, distance, alignment)) {
            this.cancelTarget('blocked');
            return;
        }
        binding.character.setCommand({
            move: {
                forward,
                right: 0
            },
            run: forward > 0,
            jump: false,
            bodyYaw: nextYaw,
            aimYaw: command.aimYaw,
            aimPitch: command.aimPitch
        });
    }
    onDestroy() {
        this.disposed = true;
        this.cancelTarget('disposed');
        this.clearHoverPickState();
        this.clearHover();
        this.manualKeys.clear();
        this.activeTouchPointers.clear();
        this.pointerCandidate = null;
        this.context?.events.off('view.removed', this.handleViewRemoved);
        this.viewEventRouter?.removeConsumer(this.consumer);
        this.viewEventRouter = null;
        this.spatial = null;
        this.context = null;
        this.binding = null;
        this.listeners.clear();
    }
    bind(binding) {
        const previous = this.binding;
        this.binding = binding;
        if (!binding) {
            this.cancelTarget('context-lost');
            this.clearHoverPickState();
            this.clearHover();
            this.emitSnapshot();
            return;
        }
        if (previous?.worldId && previous.worldId !== binding.worldId) this.cancelTarget('world-change');
        else if (previous?.primaryViewId && previous.primaryViewId !== binding.primaryViewId) this.cancelTarget('view-removed');
        else if (previous?.mode && previous.mode !== binding.mode) this.cancelTarget('mode-change');
        this.emitSnapshot();
    }
    getSnapshot() {
        return {
            available: this.isAvailable(),
            active: !!this.target,
            hoverPoint: this.hoverPoint?.clone() ?? null,
            hoverNormal: this.hoverNormal?.clone() ?? null,
            hoverScreen: this.hoverScreen?.clone() ?? null,
            targetPoint: this.target?.point.clone() ?? null,
            targetNormal: this.target?.normal?.clone() ?? null,
            targetScreen: this.target?.screen.clone() ?? null,
            lastReason: this.lastReason
        };
    }
    onSnapshotChange(listener) {
        this.listeners.add(listener);
        listener(this.getSnapshot());
        return ()=>{
            this.listeners.delete(listener);
        };
    }
    handlePointerDown(event) {
        const pointerId = event.domEvent.pointerId;
        const pointerType = event.domEvent.pointerType || 'mouse';
        if ('touch' === pointerType) {
            this.activeTouchPointers.add(pointerId);
            if (this.activeTouchPointers.size > 1) {
                this.pointerCandidate = null;
                this.cancelTarget('multi-touch');
                return false;
            }
        }
        if (!this.shouldTrackPointer(event)) return false;
        this.pointerCandidate = {
            pointerId,
            pointerType,
            viewId: event.viewId,
            startScreen: event.screen.clone(),
            lastScreen: event.screen.clone(),
            threshold: 'touch' === pointerType ? CLICK_TO_WALK_TOUCH_TAP_THRESHOLD_PX : CLICK_TO_WALK_MOUSE_CLICK_THRESHOLD_PX,
            cancelled: false
        };
        this.clearPendingHoverPick();
        return false;
    }
    handlePointerMove(event) {
        const candidate = this.pointerCandidate;
        if (candidate && candidate.pointerId === event.domEvent.pointerId) {
            candidate.lastScreen.copy(event.screen);
            if (!candidate.cancelled && event.screen.distanceTo(candidate.startScreen) > candidate.threshold) {
                candidate.cancelled = true;
                this.clearHoverPickState();
                this.clearHover();
            }
            return false;
        }
        if (!this.shouldPickHover(event)) {
            this.clearHoverPickState();
            this.clearHover();
            return false;
        }
        this.queueHoverSurfacePick(event);
        return false;
    }
    handlePointerUp(event) {
        const pointerId = event.domEvent.pointerId;
        const pointerType = event.domEvent.pointerType || 'mouse';
        if ('touch' === pointerType) this.activeTouchPointers.delete(pointerId);
        const candidate = this.pointerCandidate;
        if (!candidate || candidate.pointerId !== pointerId) return false;
        this.pointerCandidate = null;
        if ('pointercancel' === event.domEvent.type) {
            this.cancelTarget('pointer-cancel');
            return false;
        }
        if (candidate.cancelled || candidate.viewId !== event.viewId || event.screen.distanceTo(candidate.startScreen) > candidate.threshold) return false;
        if (this.manualKeys.size > 0) {
            this.cancelTarget('manual-input', {
                writeNeutralCommand: false
            });
            return false;
        }
        const resolved = this.resolveNavigationTarget(event);
        if (!resolved) {
            if (this.target) this.cancelTarget('invalid-target');
            else {
                this.lastReason = 'invalid-target';
                this.emitSnapshot();
            }
            return false;
        }
        this.setTarget(resolved);
        return false;
    }
    handleKeyDown(event) {
        if (!this.isPrimaryKeyEvent(event) || !MANUAL_INPUT_CODES.has(event.code)) return false;
        this.manualKeys.add(event.code);
        if (this.target) this.cancelTarget('manual-input', {
            writeNeutralCommand: false
        });
        return false;
    }
    handleKeyUp(event) {
        if (MANUAL_INPUT_CODES.has(event.code)) this.manualKeys.delete(event.code);
        return false;
    }
    shouldTrackPointer(event) {
        return 0 === event.button && this.isPrimaryViewEvent(event) && this.isAvailable();
    }
    isPrimaryViewEvent(event) {
        return this.isPrimaryViewId(event.viewId);
    }
    isPrimaryKeyEvent(event) {
        return event.viewId === this.binding?.primaryViewId;
    }
    isPrimaryViewId(viewId) {
        return viewId === this.binding?.primaryViewId;
    }
    isAvailable() {
        const binding = this.binding;
        return !this.disposed && !!this.spatial && !!binding?.character && binding.worldId.length > 0 && binding.primaryViewId.length > 0 && !binding.isPointerLocked() && !('first-person' === binding.mode && 'pointer-lock' === binding.lookInteraction);
    }
    shouldPickHover(event) {
        return this.isPrimaryViewEvent(event) && this.isAvailable() && 'touch' !== event.domEvent.pointerType && (event.domEvent.buttons ?? 0) === 0;
    }
    queueHoverSurfacePick(event) {
        this.pendingHoverPick = {
            screen: event.screen.clone(),
            viewId: event.viewId,
            viewRect: {
                ...event.viewRect
            },
            viewport: event.viewport ? {
                ...event.viewport
            } : void 0
        };
    }
    updateHoverSurfacePick() {
        if (!this.pendingHoverPick) return;
        const query = this.pendingHoverPick;
        this.pendingHoverPick = null;
        const resolved = this.resolveSurfaceTarget(query);
        if (!resolved) {
            this.cachedSurfaceTarget = null;
            this.clearHover();
            return;
        }
        this.cachedSurfaceTarget = {
            ...resolved,
            viewId: query.viewId,
            pickedAtMs: performance.now()
        };
        this.hoverPoint = resolved.point.clone();
        this.hoverNormal = resolved.normal?.clone() ?? null;
        this.hoverScreen = resolved.screen.clone();
        this.emitSnapshot();
    }
    clearPendingHoverPick() {
        this.pendingHoverPick = null;
    }
    clearHoverPickState() {
        this.pendingHoverPick = null;
        this.cachedSurfaceTarget = null;
    }
    resolveNavigationTarget(event) {
        const binding = this.binding;
        if (!this.spatial || !binding || !this.isPrimaryViewEvent(event)) return null;
        const surfaceTarget = this.getReusableSurfaceTarget(event) ?? this.resolveSurfaceTarget(event);
        if (!surfaceTarget || surfaceTarget.worldId !== binding.worldId) return null;
        const navigationHit = this.spatial.projectNavigationPoint({
            worldId: binding.worldId,
            point: surfaceTarget.point
        });
        if (!navigationHit?.walkable || navigationHit.worldId !== binding.worldId) return null;
        return {
            point: navigationHit.point.clone(),
            normal: normalizeHitNormal(navigationHit.normal) ?? surfaceTarget.normal?.clone() ?? null,
            screen: event.screen.clone(),
            navigationHit
        };
    }
    resolveSurfaceTarget(query) {
        const binding = this.binding;
        const camera = binding?.getPrimaryCamera();
        if (!this.spatial || !binding || !camera || !this.isPrimaryViewId(query.viewId)) return null;
        const surfaceHit = this.spatial.raycastSurfaceAtScreen({
            surfaceUsage: 'camera-control',
            camera,
            screen: query.screen.clone(),
            worldId: binding.worldId,
            viewId: query.viewId,
            viewRect: {
                ...query.viewRect
            },
            viewport: query.viewport ? {
                ...query.viewport
            } : {
                ...query.viewRect
            }
        });
        if (!surfaceHit || surfaceHit.worldId !== binding.worldId) return null;
        return {
            point: surfaceHit.point.clone(),
            normal: normalizeHitNormal(surfaceHit.normal),
            screen: query.screen.clone(),
            worldId: surfaceHit.worldId
        };
    }
    getReusableSurfaceTarget(event) {
        const cached = this.cachedSurfaceTarget;
        const binding = this.binding;
        if (!cached || !binding || cached.worldId !== binding.worldId) return null;
        if (cached.viewId !== event.viewId) return null;
        if (performance.now() - cached.pickedAtMs > CLICK_TO_WALK_HOVER_SURFACE_REUSE_MS || cached.screen.distanceTo(event.screen) > CLICK_TO_WALK_HOVER_SURFACE_REUSE_DISTANCE_PX) return null;
        return {
            point: cached.point.clone(),
            normal: cached.normal?.clone() ?? null,
            screen: event.screen.clone(),
            worldId: cached.worldId
        };
    }
    setTarget(resolved) {
        this.clearHoverPickState();
        const command = this.binding?.character?.getCommand();
        this.target = {
            point: resolved.point.clone(),
            normal: resolved.normal?.clone() ?? null,
            screen: resolved.screen.clone(),
            bodyYaw: this.target?.bodyYaw ?? command?.bodyYaw ?? 0,
            startedAtMs: performance.now(),
            blockedWindowStartedAtMs: null,
            blockedWindowStartDistance: Number.POSITIVE_INFINITY
        };
        this.clearHover(false);
        this.lastReason = 'target-set';
        this.emitSnapshot();
    }
    cancelTarget(reason, options = {}) {
        const hadTarget = !!this.target;
        this.target = null;
        this.pointerCandidate = null;
        this.clearHoverPickState();
        this.clearHover(false);
        this.lastReason = reason;
        if (hadTarget && false !== options.writeNeutralCommand) this.writeNeutralCommand();
        this.emitSnapshot();
    }
    writeNeutralCommand() {
        const character = this.binding?.character;
        if (!character) return;
        const command = character.getCommand();
        character.setCommand(createNeutralCommand(command));
    }
    clearHover(emit = true) {
        if (!this.hoverPoint && !this.hoverScreen) return;
        this.hoverPoint = null;
        this.hoverNormal = null;
        this.hoverScreen = null;
        if (emit) this.emitSnapshot();
    }
    isBlocked(timestamp, distance, alignment) {
        if (!this.target) return false;
        const turnGraceElapsed = timestamp - this.target.startedAtMs >= CLICK_TO_WALK_TURN_GRACE_MS;
        const aligned = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.radToDeg(alignment) <= CLICK_TO_WALK_ALIGNMENT_DEGREES;
        if (!turnGraceElapsed || !aligned) {
            this.target.blockedWindowStartedAtMs = null;
            this.target.blockedWindowStartDistance = distance;
            return false;
        }
        if (null === this.target.blockedWindowStartedAtMs) {
            this.target.blockedWindowStartedAtMs = timestamp;
            this.target.blockedWindowStartDistance = distance;
            return false;
        }
        const elapsed = timestamp - this.target.blockedWindowStartedAtMs;
        const progress = this.target.blockedWindowStartDistance - distance;
        if (progress >= CLICK_TO_WALK_BLOCKED_MIN_PROGRESS_M) {
            this.target.blockedWindowStartedAtMs = timestamp;
            this.target.blockedWindowStartDistance = distance;
            return false;
        }
        return elapsed >= CLICK_TO_WALK_BLOCKED_WINDOW_MS;
    }
    emitSnapshot() {
        const snapshot = this.getSnapshot();
        for (const listener of this.listeners)listener(snapshot);
    }
    constructor(){
        this.name = 'spatial-capsule-click-to-walk';
        this.priority = CLICK_TO_WALK_PLUGIN_PRIORITY;
        this.dependencies = [
            'ViewEventRouter',
            'SpatialQueryService'
        ];
        this.listeners = new Set();
        this.activeTouchPointers = new Set();
        this.manualKeys = new Set();
        this.consumer = {
            name: 'spatial-capsule-click-to-walk-input',
            priority: CLICK_TO_WALK_INPUT_PRIORITY,
            onPointerDown: (event)=>this.handlePointerDown(event),
            onPointerMove: (event)=>this.handlePointerMove(event),
            onPointerUp: (event)=>this.handlePointerUp(event),
            onWinKeyDown: (event)=>this.handleKeyDown(event),
            onWinKeyUp: (event)=>this.handleKeyUp(event)
        };
        this.context = null;
        this.viewEventRouter = null;
        this.spatial = null;
        this.binding = null;
        this.pointerCandidate = null;
        this.target = null;
        this.pendingHoverPick = null;
        this.cachedSurfaceTarget = null;
        this.hoverPoint = null;
        this.hoverNormal = null;
        this.hoverScreen = null;
        this.lastReason = null;
        this.disposed = false;
        this.handleViewRemoved = ({ viewId })=>{
            if (viewId !== this.binding?.primaryViewId) return;
            this.cancelTarget('view-removed');
            this.clearHover();
        };
    }
}
function createNeutralCommand(command) {
    return {
        move: {
            forward: 0,
            right: 0
        },
        run: false,
        jump: false,
        bodyYaw: command.bodyYaw,
        aimYaw: command.aimYaw,
        aimPitch: command.aimPitch
    };
}
function rotateTowardsAngle(current, target, maxStep) {
    const delta = shortestAngleDelta(current, target);
    return current + __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.clamp(delta, -maxStep, maxStep);
}
function shortestAngleDelta(current, target) {
    return Math.atan2(Math.sin(target - current), Math.cos(target - current));
}
function normalizeHitNormal(normal) {
    if (!normal) return null;
    const next = normal.clone();
    if (next.lengthSq() <= Number.EPSILON) return null;
    return next.normalize();
}
export { CLICK_TO_WALK_ALIGNMENT_DEGREES, CLICK_TO_WALK_ARRIVAL_RADIUS_M, CLICK_TO_WALK_BLOCKED_MIN_PROGRESS_M, CLICK_TO_WALK_BLOCKED_WINDOW_MS, CLICK_TO_WALK_HOVER_SURFACE_REUSE_DISTANCE_PX, CLICK_TO_WALK_HOVER_SURFACE_REUSE_MS, CLICK_TO_WALK_MOUSE_CLICK_THRESHOLD_PX, CLICK_TO_WALK_TOUCH_TAP_THRESHOLD_PX, CLICK_TO_WALK_TURN_GRACE_MS, SpatialCapsuleClickToWalkController };
