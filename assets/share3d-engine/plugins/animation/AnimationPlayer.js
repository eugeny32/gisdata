import * as __WEBPACK_EXTERNAL_MODULE__sampler_js_2d6b46c2__ from "./sampler.js";
import * as __WEBPACK_EXTERNAL_MODULE__validation_js_32e0704a__ from "./validation.js";
class AnimationPlayerImpl {
    constructor(id, clip, registry, options = {}){
        this.resolvedTracks = [];
        this.listeners = new Map();
        this.sampleGroups = new Map();
        this._state = 'paused';
        this._time = 0;
        this._speed = 1;
        this.id = id;
        this.clip = clip;
        this.duration = (0, __WEBPACK_EXTERNAL_MODULE__validation_js_32e0704a__.validateAnimationClip)(clip);
        this.loopMode = options.loopMode ?? clip.loopMode ?? 'once';
        this._time = options.startTime ?? 0;
        this._speed = options.speed ?? 1;
        for (const track of clip.tracks){
            const target = registry.resolve(track.target);
            if (!target) throw new Error(`Animation target "${track.target.kind}" cannot be resolved for track "${track.name ?? track.propertyPath}"`);
            if (target.supportedProperties && !target.supportedProperties.includes(track.propertyPath)) throw new Error(`Animation target "${target.key}" does not support property "${track.propertyPath}"`);
            this.resolvedTracks.push({
                track,
                target,
                sample: {
                    propertyPath: track.propertyPath,
                    valueType: track.valueType,
                    value: [],
                    track
                }
            });
        }
    }
    get state() {
        return this._state;
    }
    get time() {
        return (0, __WEBPACK_EXTERNAL_MODULE__sampler_js_2d6b46c2__.normalizeAnimationTime)(this._time, this.duration, this.loopMode).time;
    }
    get speed() {
        return this._speed;
    }
    play() {
        if ('playing' === this._state) return;
        if ('completed' === this._state) this._time = this._speed >= 0 ? 0 : this.duration;
        this._state = 'playing';
        this.applyAtCurrentTime();
        this.emit('play');
    }
    pause() {
        if ('playing' !== this._state) return;
        this._state = 'paused';
        this.emit('pause');
    }
    resume() {
        if ('paused' !== this._state) return;
        this._state = 'playing';
        this.emit('resume');
    }
    stop() {
        if ('stopped' === this._state || 'completed' === this._state) return;
        this._state = 'stopped';
        this.emit('stop');
    }
    sampleAt(time) {
        this.assertFiniteTime(time, 'Animation sample time must be finite');
        const normalized = (0, __WEBPACK_EXTERNAL_MODULE__sampler_js_2d6b46c2__.normalizeAnimationTime)(time, this.duration, this.loopMode);
        this.applyAtTime(normalized.time);
    }
    seekAndApply(time) {
        this.seek(time);
    }
    seek(time) {
        this.assertFiniteTime(time, 'Animation seek time must be finite');
        this._time = time;
        this.applyAtCurrentTime();
        this.emit('seek');
    }
    setSpeed(speed) {
        if (!Number.isFinite(speed)) throw new Error('Animation speed must be finite');
        this._speed = speed;
    }
    update(deltaSeconds) {
        if ('playing' !== this._state) return;
        if (!Number.isFinite(deltaSeconds)) throw new Error('Animation deltaSeconds must be finite');
        this._time += deltaSeconds * this._speed;
        const normalized = (0, __WEBPACK_EXTERNAL_MODULE__sampler_js_2d6b46c2__.normalizeAnimationTime)(this._time, this.duration, this.loopMode);
        this.applyAtTime(normalized.time);
        if (normalized.completed) {
            this._time = normalized.time;
            this._state = 'completed';
            this.emit('complete');
            return;
        }
        this.emit('update');
    }
    hasTargetKey(key) {
        return this.resolvedTracks.some((entry)=>entry.target.key === key);
    }
    hasTargetRef(targetRef) {
        return this.resolvedTracks.some((entry)=>{
            const resolved = entry.target.targetRef;
            if (resolved.kind !== targetRef.kind) return false;
            if ('viewId' in targetRef && void 0 !== targetRef.viewId) return 'viewId' in resolved && resolved.viewId === targetRef.viewId;
            if ('id' in targetRef && void 0 !== targetRef.id) return 'id' in resolved && resolved.id === targetRef.id;
            if ('namespace' in targetRef && void 0 !== targetRef.namespace) return 'namespace' in resolved && resolved.namespace === targetRef.namespace;
            return true;
        });
    }
    on(event, callback) {
        let callbacks = this.listeners.get(event);
        if (!callbacks) {
            callbacks = new Set();
            this.listeners.set(event, callbacks);
        }
        callbacks.add(callback);
        return {
            dispose: ()=>{
                callbacks?.delete(callback);
            }
        };
    }
    dispose() {
        this.stop();
        this.listeners.clear();
        this.sampleGroups.clear();
    }
    applyAtCurrentTime() {
        const normalized = (0, __WEBPACK_EXTERNAL_MODULE__sampler_js_2d6b46c2__.normalizeAnimationTime)(this._time, this.duration, this.loopMode);
        this.applyAtTime(normalized.time);
    }
    assertFiniteTime(time, message) {
        if (!Number.isFinite(time)) throw new Error(message);
    }
    applyAtTime(time) {
        this.sampleGroups.clear();
        for (const entry of this.resolvedTracks){
            (0, __WEBPACK_EXTERNAL_MODULE__sampler_js_2d6b46c2__.sampleAnimationTrack)(entry.track, time, {
                duration: this.duration,
                loopMode: this.loopMode
            }, entry.sample.value);
            let group = this.sampleGroups.get(entry.target.key);
            if (!group) {
                group = {
                    target: entry.target,
                    samples: []
                };
                this.sampleGroups.set(entry.target.key, group);
            }
            group.samples.push(entry.sample);
        }
        const context = {
            player: this,
            time
        };
        for (const group of this.sampleGroups.values())group.target.write(group.samples, context);
    }
    emit(event) {
        const callbacks = this.listeners.get(event);
        if (!callbacks || 0 === callbacks.size) return;
        const payload = {
            player: this,
            time: this.time
        };
        for (const callback of Array.from(callbacks))callback(payload);
    }
}
export { AnimationPlayerImpl };
