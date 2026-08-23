import * as __WEBPACK_EXTERNAL_MODULE__AnimationBindingRegistry_js_bb9c35d4__ from "./AnimationBindingRegistry.js";
import * as __WEBPACK_EXTERNAL_MODULE__AnimationPlayer_js_61138162__ from "./AnimationPlayer.js";
import * as __WEBPACK_EXTERNAL_MODULE__validation_js_32e0704a__ from "./validation.js";
class AnimationServiceImpl {
    constructor(options = {}){
        this.options = options;
        this.registry = new __WEBPACK_EXTERNAL_MODULE__AnimationBindingRegistry_js_bb9c35d4__.AnimationBindingRegistry();
        this.clips = new Map();
        this.players = new Map();
        this.skipNextUpdatePlayers = new Set();
        this.nextClipId = 1;
        this.nextPlayerId = 1;
    }
    registerClip(clip) {
        (0, __WEBPACK_EXTERNAL_MODULE__validation_js_32e0704a__.validateAnimationClip)(clip);
        const id = clip.id ?? `clip-${this.nextClipId++}`;
        this.clips.set(id, clip);
        return id;
    }
    unregisterClip(id) {
        return this.clips.delete(id);
    }
    getClip(id) {
        return this.clips.get(id);
    }
    play(clipOrId, options = {}) {
        const clip = 'string' == typeof clipOrId ? this.clips.get(clipOrId) : clipOrId;
        if (!clip) throw new Error(`Animation clip "${clipOrId}" is not registered`);
        const id = options.id ?? `player-${this.nextPlayerId++}`;
        if (this.players.has(id)) throw new Error(`Animation player "${id}" already exists`);
        const player = new __WEBPACK_EXTERNAL_MODULE__AnimationPlayer_js_61138162__.AnimationPlayerImpl(id, clip, this.registry, options);
        this.players.set(id, player);
        let stopSubscription = null;
        stopSubscription = player.on('stop', ()=>{
            this.players.delete(id);
            stopSubscription?.dispose();
            stopSubscription = null;
            this.notifyVisualChange('animation.stopped', id);
        });
        if (false !== options.autoplay) {
            player.play();
            this.notifyVisualChange('animation.started', id);
        }
        return player;
    }
    pause(id) {
        const player = this.players.get(id);
        if (!player) return false;
        player.pause();
        this.notifyVisualChange('animation.paused', id);
        return true;
    }
    resume(id) {
        const player = this.players.get(id);
        if (!player) return false;
        player.resume();
        this.notifyVisualChange('animation.resumed', id);
        return true;
    }
    stop(id) {
        const player = this.players.get(id);
        if (!player) return false;
        player.dispose();
        this.players.delete(id);
        this.skipNextUpdatePlayers.delete(id);
        return true;
    }
    sampleAt(id, time) {
        const player = this.players.get(id);
        if (!player) return false;
        player.sampleAt(time);
        this.skipNextUpdatePlayers.add(id);
        this.notifyVisualChange('animation.sampled', id);
        return true;
    }
    seekAndApply(id, time) {
        const player = this.players.get(id);
        if (!player) return false;
        player.seekAndApply(time);
        this.skipNextUpdatePlayers.add(id);
        this.notifyVisualChange('animation.seeked', id);
        return true;
    }
    seek(id, time) {
        const player = this.players.get(id);
        if (!player) return false;
        player.seek(time);
        this.notifyVisualChange('animation.seeked', id);
        return true;
    }
    setSpeed(id, speed) {
        const player = this.players.get(id);
        if (!player) return false;
        player.setSpeed(speed);
        this.notifyVisualChange('animation.speedChanged', id);
        return true;
    }
    stopByTarget(targetRef) {
        const resolved = this.registry.resolve(targetRef);
        const resolvedKey = resolved?.key;
        let stopped = 0;
        for (const [id, player] of Array.from(this.players.entries()))if (resolvedKey && player.hasTargetKey(resolvedKey) || player.hasTargetRef(targetRef)) {
            player.dispose();
            this.players.delete(id);
            this.skipNextUpdatePlayers.delete(id);
            stopped += 1;
        }
        if (stopped > 0) this.notifyVisualChange('animation.stoppedByTarget', targetRef.kind);
        return stopped;
    }
    update(deltaSeconds) {
        for (const [id, player] of Array.from(this.players.entries()))if (!this.skipNextUpdatePlayers.delete(id)) {
            player.update(deltaSeconds);
            if ('completed' === player.state || 'stopped' === player.state) {
                player.dispose();
                this.players.delete(id);
                this.skipNextUpdatePlayers.delete(id);
                this.notifyVisualChange('animation.completed', id);
            }
        }
    }
    hasPlayingPlayers() {
        for (const player of this.players.values())if ('playing' === player.state) return true;
        return false;
    }
    registerBinding(kind, resolver) {
        return this.registry.register(kind, resolver);
    }
    dispose() {
        for (const player of this.players.values())player.dispose();
        this.players.clear();
        this.skipNextUpdatePlayers.clear();
        this.clips.clear();
        this.registry.clear();
    }
    notifyVisualChange(reason, detail) {
        this.options.onVisualChange?.(reason, detail);
    }
}
export { AnimationServiceImpl };
