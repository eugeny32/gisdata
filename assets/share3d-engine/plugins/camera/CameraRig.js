import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__animation_easing_js_c9170c29__ from "../animation/easing.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__ from "../../shared/constants/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_30373853__ from "../../shared/types/core.js";
const SAFE_DIRECTION = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, -1, 0);
const WORLD_UP = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 1);
const PRESET_POLE_OFFSET_RATIO = 1e-3;
class CameraRigImpl {
    constructor(events){
        this._position = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(5, -5, 7);
        this._target = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 0);
        this._up = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 1);
        this._fov = 60;
        this._zoom = 1;
        this._mode = __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_30373853__.CameraMode.Perspective;
        this._near = __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.CAMERA_DEFAULT_NEAR;
        this._far = __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.CAMERA_DEFAULT_FAR;
        this._animationFrameId = 0;
        this._animationResolve = null;
        this._isTransitioning = false;
        this._events = events;
    }
    get mode() {
        return this._mode;
    }
    get isTransitioning() {
        return this._isTransitioning;
    }
    get position() {
        return this._position.clone();
    }
    set position(value) {
        if (this._isVectorEquivalent(this._position, value)) return;
        this._position.copy(value);
        this._emitChanged();
    }
    get target() {
        return this._target.clone();
    }
    set target(value) {
        if (this._isVectorEquivalent(this._target, value)) return;
        this._target.copy(value);
        this._emitChanged();
    }
    get up() {
        return this._up.clone();
    }
    get fov() {
        return this._fov;
    }
    set fov(value) {
        if (this._isNumberEquivalent(this._fov, value)) return;
        this._fov = value;
        this._emitChanged();
    }
    get zoom() {
        return this._zoom;
    }
    set zoom(value) {
        if (this._isNumberEquivalent(this._zoom, value)) return;
        this._zoom = value;
        this._emitChanged();
    }
    get near() {
        return this._near;
    }
    get far() {
        return this._far;
    }
    get roll() {
        const dir = this._getViewDirection();
        const right = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().crossVectors(dir, WORLD_UP);
        if (right.lengthSq() < __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.EPSILON_HIGH) return 0;
        right.normalize();
        const refUp = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().crossVectors(right, dir).normalize();
        const dot = this._up.dot(refUp);
        const cross = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().crossVectors(refUp, this._up);
        const sign = cross.dot(dir);
        return Math.atan2(sign, dot);
    }
    set roll(angle) {
        this._setRoll(angle);
        this._emitChanged();
    }
    _setRoll(angle) {
        const dir = this._getViewDirection();
        const right = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().crossVectors(dir, WORLD_UP);
        if (right.lengthSq() < __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.EPSILON_HIGH) right.set(0, -1, 0);
        right.normalize();
        const refUp = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().crossVectors(right, dir).normalize();
        this._up.copy(refUp).applyAxisAngle(dir, angle).normalize();
    }
    setMode(mode) {
        if (mode === this._mode) return;
        const previous = this._mode;
        this._mode = mode;
        this._events.emit('camera.modeChanged', {
            mode,
            previous
        });
        this._emitChanged();
    }
    setTopDownOnPlane(origin, normal, up, distance) {
        const n = normal.clone().normalize();
        this._position.copy(origin).addScaledVector(n, distance);
        this._target.copy(origin);
        const projected = up.clone().addScaledVector(n, -up.dot(n));
        if (projected.lengthSq() < __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.EPSILON_HIGH) {
            projected.copy(Math.abs(n.z) < 0.9 ? WORLD_UP : new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 1, 0));
            projected.addScaledVector(n, -projected.dot(n));
        }
        this._up.copy(projected.normalize());
        this._emitChanged();
    }
    updateNearFar(sceneBounds) {
        if (sceneBounds.isEmpty()) {
            const nextNear = __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.CAMERA_DEFAULT_NEAR;
            const nextFar = __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.CAMERA_DEFAULT_FAR;
            if (Math.abs(this._near - nextNear) <= __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.EPSILON_HIGH && Math.abs(this._far - nextFar) <= __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.EPSILON_HIGH) return;
            this._near = nextNear;
            this._far = nextFar;
            this._emitChanged();
            return;
        }
        const size = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        sceneBounds.getSize(size);
        const diagonal = size.length();
        if (this._mode === __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_30373853__.CameraMode.Orthographic) {
            const depthRange = this._getBoxDepthRange(sceneBounds);
            const padding = Math.max(1, diagonal * __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.CAMERA_FAR_PADDING_RATIO);
            const nextNear = depthRange.min - padding;
            const nextFar = Math.max(depthRange.max + padding, nextNear + 1);
            if (Math.abs(this._near - nextNear) <= __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.EPSILON_HIGH && Math.abs(this._far - nextFar) <= __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.EPSILON_HIGH) return;
            this._near = nextNear;
            this._far = nextFar;
            this._emitChanged();
            return;
        }
        const distanceToTarget = this._getDistanceToTarget();
        const closestPoint = sceneBounds.clampPoint(this._position, new __WEBPACK_EXTERNAL_MODULE_three__.Vector3());
        const distanceToBounds = this._position.distanceTo(closestPoint);
        const nearFromTarget = distanceToTarget * __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.CAMERA_NEAR_TARGET_RATIO;
        const nearFromBounds = distanceToBounds > 0 ? distanceToBounds * __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.CAMERA_NEAR_BOUNDS_RATIO : nearFromTarget;
        const nextNear = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.clamp(Math.min(nearFromTarget, nearFromBounds), 0.01, Math.max(1, diagonal * __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.CAMERA_FAR_PADDING_RATIO));
        const maxCornerDistance = this._getMaxDistanceToBoxCorner(sceneBounds);
        const nextFar = Math.max(nextNear + 1, distanceToTarget + diagonal, maxCornerDistance + diagonal * __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.CAMERA_FAR_PADDING_RATIO);
        if (Math.abs(this._near - nextNear) <= __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.EPSILON_HIGH && Math.abs(this._far - nextFar) <= __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.EPSILON_HIGH) return;
        this._near = nextNear;
        this._far = nextFar;
        this._emitChanged();
    }
    fitToBox(box, options) {
        if (box.isEmpty()) return;
        const padding = options?.padding ?? __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.CAMERA_FIT_PADDING;
        const center = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        box.getCenter(center);
        const size = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const fovRad = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.degToRad(this._fov);
        const zoomFactor = this._mode === __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_30373853__.CameraMode.Orthographic ? Math.max(this._zoom, __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.CAMERA_MIN_DISTANCE) : 1;
        const fitDistance = maxDim * padding * zoomFactor / (2 * Math.tan(fovRad / 2));
        const direction = this._getViewDirection();
        direction.negate();
        this._target.copy(center);
        this._position.copy(center).addScaledVector(direction, fitDistance);
        this._emitChanged();
    }
    setPresetView(preset) {
        const d = this._getDistanceToTarget();
        const t = this._target;
        switch(preset){
            case 'top':
                {
                    const lateral = Math.max(d * PRESET_POLE_OFFSET_RATIO, __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.EPSILON);
                    const vertical = Math.sqrt(Math.max(d * d - lateral * lateral, 0));
                    this._position.set(t.x, t.y - lateral, t.z + vertical);
                    this._up.copy(WORLD_UP);
                }
                break;
            case 'bottom':
                {
                    const lateral = Math.max(d * PRESET_POLE_OFFSET_RATIO, __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.EPSILON);
                    const vertical = Math.sqrt(Math.max(d * d - lateral * lateral, 0));
                    this._position.set(t.x, t.y + lateral, t.z - vertical);
                    this._up.copy(WORLD_UP);
                }
                break;
            case 'front':
                this._position.set(t.x, t.y - d, t.z);
                this._up.set(0, 0, 1);
                break;
            case 'back':
                this._position.set(t.x, t.y + d, t.z);
                this._up.set(0, 0, 1);
                break;
            case 'left':
                this._position.set(t.x - d, t.y, t.z);
                this._up.set(0, 0, 1);
                break;
            case 'right':
                this._position.set(t.x + d, t.y, t.z);
                this._up.set(0, 0, 1);
                break;
        }
        this._emitChanged();
    }
    animateTo(state, duration = 500, options) {
        if ('number' != typeof duration) {
            options = duration;
            duration = options.duration ?? 500;
        }
        this._cancelAnimation();
        if (duration <= 0) {
            this._applyPartialState(state);
            this._emitChanged();
            options?.onUpdate?.(this.getState(), {
                progress: 1,
                easedProgress: 1,
                completed: true
            });
            return Promise.resolve();
        }
        return new Promise((resolve)=>{
            const startPos = this._position.clone();
            const startTarget = this._target.clone();
            const startUp = this._up.clone();
            const startFov = this._fov;
            const startZoom = this._zoom;
            const endPos = state.position?.clone() ?? startPos.clone();
            const endTarget = state.target?.clone() ?? startTarget.clone();
            const endUp = state.up?.clone() ?? startUp.clone();
            const endFov = state.fov ?? startFov;
            const endZoom = state.zoom ?? startZoom;
            const easing = options?.easing;
            const startTime = performance.now();
            this._animationResolve = resolve;
            this._isTransitioning = true;
            if (void 0 !== state.mode && state.mode !== this._mode) this.setMode(state.mode);
            const tick = (now)=>{
                const elapsed = now - startTime;
                const t = Math.min(elapsed / duration, 1);
                const s = easing ? (0, __WEBPACK_EXTERNAL_MODULE__animation_easing_js_c9170c29__.applyAnimationEasing)(t, easing) : t;
                this._position.lerpVectors(startPos, endPos, s);
                this._target.lerpVectors(startTarget, endTarget, s);
                this._up.lerpVectors(startUp, endUp, s).normalize();
                this._fov = startFov + (endFov - startFov) * s;
                this._zoom = startZoom + (endZoom - startZoom) * s;
                this._emitChanged();
                options?.onUpdate?.(this.getState(), {
                    progress: t,
                    easedProgress: s,
                    completed: t >= 1
                });
                if (t < 1) this._animationFrameId = requestAnimationFrame(tick);
                else {
                    this._animationFrameId = 0;
                    this._animationResolve = null;
                    resolve();
                    this._isTransitioning = false;
                }
            };
            this._animationFrameId = requestAnimationFrame(tick);
        });
    }
    applyStatePatch(patch, options) {
        if (options?.cancelTransition) this._cancelAnimation();
        const previousState = this.getState();
        this._applyPartialState(patch);
        if (!this._isStateEquivalent(previousState)) this._emitChanged();
    }
    cancelTransition() {
        this._cancelAnimation();
    }
    getState() {
        return {
            position: this._position.clone(),
            target: this._target.clone(),
            up: this._up.clone(),
            fov: this._fov,
            zoom: this._zoom,
            mode: this._mode,
            roll: this.roll
        };
    }
    setState(state) {
        const changed = !this._isStateEquivalent(state);
        this._cancelAnimation();
        if (!changed) return;
        this._position.copy(state.position);
        this._target.copy(state.target);
        this._up.copy(state.up);
        this._fov = state.fov;
        this._zoom = state.zoom;
        if (state.mode !== this._mode) {
            const previous = this._mode;
            this._mode = state.mode;
            this._events.emit('camera.modeChanged', {
                mode: this._mode,
                previous
            });
        }
        this._emitChanged();
    }
    dispose() {
        this._cancelAnimation();
    }
    _emitChanged() {
        this._events.emit('camera.changed', {
            state: this.getState()
        });
    }
    _isStateEquivalent(state) {
        return this._isVectorEquivalent(this._position, state.position) && this._isVectorEquivalent(this._target, state.target) && this._isVectorEquivalent(this._up, state.up) && this._isNumberEquivalent(this._fov, state.fov) && this._isNumberEquivalent(this._zoom, state.zoom) && this._mode === state.mode;
    }
    _isVectorEquivalent(a, b) {
        return a.distanceToSquared(b) <= __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.EPSILON_HIGH * __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.EPSILON_HIGH;
    }
    _isNumberEquivalent(a, b) {
        return Math.abs(a - b) <= __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.EPSILON_HIGH;
    }
    _cancelAnimation() {
        this._isTransitioning = false;
        if (0 !== this._animationFrameId) {
            cancelAnimationFrame(this._animationFrameId);
            this._animationFrameId = 0;
        }
        if (this._animationResolve) {
            this._animationResolve();
            this._animationResolve = null;
        }
    }
    _getDistanceToTarget() {
        return Math.max(this._position.distanceTo(this._target), __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.CAMERA_MIN_DISTANCE);
    }
    _getViewDirection() {
        const dir = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().subVectors(this._target, this._position);
        if (dir.lengthSq() < __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.CAMERA_MIN_DISTANCE * __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.CAMERA_MIN_DISTANCE) return SAFE_DIRECTION.clone();
        return dir.normalize();
    }
    _getMaxDistanceToBoxCorner(box) {
        let maxDistance = 0;
        const xs = [
            box.min.x,
            box.max.x
        ];
        const ys = [
            box.min.y,
            box.max.y
        ];
        const zs = [
            box.min.z,
            box.max.z
        ];
        for (const x of xs)for (const y of ys)for (const z of zs){
            const distance = this._position.distanceTo(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(x, y, z));
            maxDistance = Math.max(maxDistance, distance);
        }
        return maxDistance;
    }
    _getBoxDepthRange(box) {
        const forward = this._getViewDirection();
        let min = Number.POSITIVE_INFINITY;
        let max = Number.NEGATIVE_INFINITY;
        const xs = [
            box.min.x,
            box.max.x
        ];
        const ys = [
            box.min.y,
            box.max.y
        ];
        const zs = [
            box.min.z,
            box.max.z
        ];
        for (const x of xs)for (const y of ys)for (const z of zs){
            const depth = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(x, y, z).sub(this._position).dot(forward);
            min = Math.min(min, depth);
            max = Math.max(max, depth);
        }
        return {
            min,
            max
        };
    }
    _applyPartialState(state) {
        if (state.position) this._position.copy(state.position);
        if (state.target) this._target.copy(state.target);
        if (state.up) this._up.copy(state.up);
        if (void 0 !== state.fov) this._fov = state.fov;
        if (void 0 !== state.zoom) this._zoom = state.zoom;
        if (void 0 !== state.mode && state.mode !== this._mode) {
            const previous = this._mode;
            this._mode = state.mode;
            this._events.emit('camera.modeChanged', {
                mode: this._mode,
                previous
            });
        }
        if (void 0 !== state.roll && !state.up) this._setRoll(state.roll);
    }
}
const CameraRig_rslib_entry_ = CameraRigImpl;
export { CameraRigImpl, CameraRig_rslib_entry_ as default };
