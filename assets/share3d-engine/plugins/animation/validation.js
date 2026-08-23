import * as __WEBPACK_EXTERNAL_MODULE__easing_js_764f4a7e__ from "./easing.js";
import * as __WEBPACK_EXTERNAL_MODULE__sampler_js_2d6b46c2__ from "./sampler.js";
function validateAnimationClip(clip) {
    if (!clip.tracks || 0 === clip.tracks.length) throw new Error('Animation clip must contain at least one track');
    let maxTrackTime = 0;
    for (const track of clip.tracks){
        validateAnimationTrack(track);
        maxTrackTime = Math.max(maxTrackTime, track.times[track.times.length - 1] ?? 0);
    }
    const duration = (0, __WEBPACK_EXTERNAL_MODULE__sampler_js_2d6b46c2__.getClipDuration)(clip);
    if (!Number.isFinite(duration) || duration < 0) throw new Error('Animation clip duration must be a finite non-negative number');
    if (duration + Number.EPSILON < maxTrackTime) throw new Error('Animation clip duration cannot be shorter than its last keyframe');
    if (clip.loopMode && ![
        'once',
        'repeat',
        'pingpong'
    ].includes(clip.loopMode)) throw new Error(`Unsupported animation loopMode: ${clip.loopMode}`);
    return duration;
}
function validateAnimationTrack(track) {
    if (!track.target || 'string' != typeof track.target.kind) throw new Error('Animation track targetRef is required');
    if (!track.propertyPath) throw new Error('Animation track propertyPath is required');
    if (0 === track.times.length) throw new Error('Animation track must contain at least one keyframe time');
    for(let i = 0; i < track.times.length; i++){
        const time = track.times[i];
        if (!Number.isFinite(time)) throw new Error('Animation track times must be finite');
        if (i > 0 && time <= track.times[i - 1]) throw new Error('Animation track times must be strictly increasing');
    }
    const valueSize = (0, __WEBPACK_EXTERNAL_MODULE__sampler_js_2d6b46c2__.getAnimationValueSize)(track.valueType);
    if (track.values.length !== track.times.length * valueSize) throw new Error('Animation track values length does not match valueType and keyframe count');
    for(let i = 0; i < track.values.length; i++)if (!Number.isFinite(track.values[i])) throw new Error('Animation track values must be finite');
    const interpolation = track.interpolation ?? 'linear';
    if (![
        'step',
        'linear',
        'spline'
    ].includes(interpolation)) throw new Error(`Unsupported animation interpolation: ${interpolation}`);
    if (track.easing && !(0, __WEBPACK_EXTERNAL_MODULE__easing_js_764f4a7e__.isAnimationEasing)(track.easing)) throw new Error(`Unsupported animation easing: ${track.easing}`);
    if (track.segmentEasing) {
        if (track.segmentEasing.length !== Math.max(0, track.times.length - 1)) throw new Error('Animation segmentEasing length must equal times.length - 1');
        for (const easing of track.segmentEasing)if (!(0, __WEBPACK_EXTERNAL_MODULE__easing_js_764f4a7e__.isAnimationEasing)(easing)) throw new Error(`Unsupported animation segment easing: ${easing}`);
    }
    if ((track.easing || track.segmentEasing) && 'step' === interpolation) throw new Error('Animation easing is not supported with step interpolation');
    if (void 0 !== track.smoothness) {
        if (!Number.isFinite(track.smoothness) || track.smoothness < 0 || track.smoothness > 1) throw new Error('Animation spline smoothness must be in the range [0, 1]');
    }
}
export { validateAnimationClip, validateAnimationTrack };
