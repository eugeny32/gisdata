import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__easing_js_764f4a7e__ from "./easing.js";
const VALUE_SIZES = {
    number: 1,
    vec2: 2,
    vec3: 3,
    vec4: 4,
    color: 3,
    quaternion: 4
};
const splineCache = new WeakMap();
function getAnimationValueSize(valueType) {
    return VALUE_SIZES[valueType];
}
function getClipDuration(clip) {
    if (void 0 !== clip.duration) return clip.duration;
    let duration = 0;
    for (const track of clip.tracks){
        const last = track.times[track.times.length - 1] ?? 0;
        duration = Math.max(duration, last);
    }
    return duration;
}
function normalizeAnimationTime(time, duration, loopMode = 'once') {
    if (duration <= 0) return {
        time: 0,
        completed: true
    };
    if ('repeat' === loopMode) {
        const wrapped = (time % duration + duration) % duration;
        return {
            time: wrapped,
            completed: false
        };
    }
    if ('pingpong' === loopMode) {
        const span = 2 * duration;
        const wrapped = (time % span + span) % span;
        return {
            time: wrapped <= duration ? wrapped : span - wrapped,
            completed: false
        };
    }
    if (time <= 0) return {
        time: 0,
        completed: time < 0
    };
    if (time >= duration) return {
        time: duration,
        completed: true
    };
    return {
        time,
        completed: false
    };
}
function sampleAnimationTrack(track, time, options = {}, target = []) {
    const interpolation = track.interpolation ?? 'linear';
    if ('spline' === interpolation) return sampleSpline(track, time, options, target);
    return sampleKeyframes(track, time, interpolation, target);
}
function sampleKeyframes(track, time, interpolation, target) {
    const times = track.times;
    const values = track.values;
    const stride = getAnimationValueSize(track.valueType);
    target.length = stride;
    if (1 === times.length || time <= times[0]) {
        copySample(values, 0, stride, target);
        normalizeQuaternionResult(track, target);
        return target;
    }
    const last = times.length - 1;
    if (time >= times[last]) {
        copySample(values, last, stride, target);
        normalizeQuaternionResult(track, target);
        return target;
    }
    const segment = findSegment(times, time);
    if ('step' === interpolation) {
        copySample(values, segment, stride, target);
        normalizeQuaternionResult(track, target);
        return target;
    }
    const t0 = times[segment];
    const t1 = times[segment + 1];
    const rawProgress = (time - t0) / (t1 - t0);
    const easing = track.segmentEasing?.[segment] ?? track.easing;
    const progress = (0, __WEBPACK_EXTERNAL_MODULE__easing_js_764f4a7e__.applyAnimationEasing)(rawProgress, easing);
    if ('quaternion' === track.valueType) {
        __WEBPACK_EXTERNAL_MODULE_three__.Quaternion.slerpFlat(target, 0, values, segment * stride, values, (segment + 1) * stride, progress);
        normalizeQuaternion(target);
        return target;
    }
    const offset0 = segment * stride;
    const offset1 = (segment + 1) * stride;
    for(let i = 0; i < stride; i++)target[i] = values[offset0 + i] * (1 - progress) + values[offset1 + i] * progress;
    return target;
}
function sampleSpline(track, time, options, target) {
    const entry = getSplineCacheEntry(track, options);
    const { times, knots, dim } = entry;
    target.length = dim;
    if (0 === times.length) {
        target.fill(0);
        return target;
    }
    if (time <= times[0] || 1 === times.length) {
        copyKnot(knots, dim, 0, target);
        return target;
    }
    const last = times.length - 1;
    if (time >= times[last]) {
        copyKnot(knots, dim, last, target);
        return target;
    }
    const segment = findSegment(times, time);
    if (isSameSplineKnotValue(knots, dim, segment)) {
        copyKnot(knots, dim, segment, target);
        return target;
    }
    const rawProgress = (time - times[segment]) / (times[segment + 1] - times[segment]);
    const easing = track.segmentEasing?.[segment] ?? track.easing;
    const t = (0, __WEBPACK_EXTERNAL_MODULE__easing_js_764f4a7e__.applyAnimationEasing)(rawProgress, easing);
    evaluateSplineSegment(knots, dim, segment, t, target);
    return target;
}
function getSplineCacheEntry(track, options) {
    const cached = splineCache.get(track);
    if (cached && cached.duration === options.duration && cached.loopMode === options.loopMode) return cached;
    const smoothness = track.smoothness ?? 1;
    const baseTimes = Array.from(track.times);
    const basePoints = Array.from(track.values);
    const useLooping = 'repeat' === options.loopMode && void 0 !== options.duration && baseTimes.length > 1;
    const { times, points } = useLooping ? createLoopingPoints(options.duration, baseTimes, basePoints) : {
        times: baseTimes,
        points: basePoints
    };
    const knots = calcSplineKnots(times, points, smoothness);
    const entry = {
        track,
        duration: options.duration,
        loopMode: options.loopMode,
        times,
        knots,
        dim: times.length > 0 ? points.length / times.length : 0
    };
    splineCache.set(track, entry);
    return entry;
}
function createLoopingPoints(duration, times, points) {
    if (times.length < 2) return {
        times: [
            ...times
        ],
        points: [
            ...points
        ]
    };
    const dim = points.length / times.length;
    const newTimes = times.slice();
    const newPoints = points.slice();
    newTimes.push(duration + times[0], duration + times[1]);
    newPoints.push(...points.slice(0, 2 * dim));
    newTimes.splice(0, 0, times[times.length - 2] - duration, times[times.length - 1] - duration);
    newPoints.splice(0, 0, ...points.slice(points.length - 2 * dim));
    return {
        times: newTimes,
        points: newPoints
    };
}
function calcSplineKnots(times, points, smoothness) {
    const n = times.length;
    if (0 === n) return [];
    const dim = points.length / n;
    const knots = new Array(n * dim * 3).fill(0);
    if (1 === n) {
        for(let j = 0; j < dim; j++)knots[3 * j + 1] = points[j];
        return knots;
    }
    for(let i = 0; i < n; i++){
        const t = times[i];
        for(let j = 0; j < dim; j++){
            const idx = i * dim + j;
            const p = points[idx];
            let tangent;
            tangent = isAdjacentDuplicatePoint(points, dim, i) ? 0 : 0 === i ? (points[idx + dim] - p) / (times[i + 1] - t) : i === n - 1 ? (p - points[idx - dim]) / (t - times[i - 1]) : (points[idx + dim] - points[idx - dim]) / (times[i + 1] - times[i - 1]);
            const inScale = i > 0 ? times[i] - times[i - 1] : times[1] - times[0];
            const outScale = i < n - 1 ? times[i + 1] - times[i] : times[i] - times[i - 1];
            knots[3 * idx] = tangent * inScale * smoothness;
            knots[3 * idx + 1] = p;
            knots[3 * idx + 2] = tangent * outScale * smoothness;
        }
    }
    return knots;
}
function isAdjacentDuplicatePoint(points, dim, index) {
    return index > 0 && isSamePoint(points, dim, index, index - 1) || index < points.length / dim - 1 && isSamePoint(points, dim, index, index + 1);
}
function isSamePoint(points, dim, leftIndex, rightIndex) {
    const leftOffset = leftIndex * dim;
    const rightOffset = rightIndex * dim;
    for(let i = 0; i < dim; i++)if (Math.abs(points[leftOffset + i] - points[rightOffset + i]) > Number.EPSILON) return false;
    return true;
}
function evaluateSplineSegment(knots, dim, segment, t, target) {
    const t2 = t * t;
    const twot = t + t;
    const omt = 1 - t;
    const omt2 = omt * omt;
    let idx = segment * dim * 3;
    for(let i = 0; i < dim; i++){
        const p0 = knots[idx + 1];
        const m0 = knots[idx + 2];
        const m1 = knots[idx + 3 * dim];
        const p1 = knots[idx + 3 * dim + 1];
        target[i] = (1 + twot) * omt2 * p0 + t * omt2 * m0 + t2 * (3 - twot) * p1 + t2 * (t - 1) * m1;
        idx += 3;
    }
}
function isSameSplineKnotValue(knots, dim, segment) {
    const currentOffset = segment * dim * 3;
    const nextOffset = (segment + 1) * dim * 3;
    for(let i = 0; i < dim; i++){
        const valueDelta = Math.abs(knots[currentOffset + 3 * i + 1] - knots[nextOffset + 3 * i + 1]);
        if (valueDelta > Number.EPSILON) return false;
    }
    return true;
}
function findSegment(times, time) {
    let left = 0;
    let right = times.length - 2;
    while(left <= right){
        const mid = left + right >> 1;
        if (time < times[mid]) right = mid - 1;
        else {
            if (!(time >= times[mid + 1])) return mid;
            left = mid + 1;
        }
    }
    return Math.max(0, Math.min(times.length - 2, left));
}
function copySample(values, index, stride, target) {
    const offset = index * stride;
    for(let i = 0; i < stride; i++)target[i] = values[offset + i];
}
function copyKnot(knots, dim, index, target) {
    const offset = index * dim * 3;
    for(let i = 0; i < dim; i++)target[i] = knots[offset + 3 * i + 1];
}
function normalizeQuaternionResult(track, target) {
    if ('quaternion' === track.valueType) normalizeQuaternion(target);
}
function normalizeQuaternion(values) {
    const length = Math.hypot(values[0], values[1], values[2], values[3]);
    if (length <= Number.EPSILON) {
        values[0] = 0;
        values[1] = 0;
        values[2] = 0;
        values[3] = 1;
        return;
    }
    values[0] /= length;
    values[1] /= length;
    values[2] /= length;
    values[3] /= length;
}
export { getAnimationValueSize, getClipDuration, normalizeAnimationTime, sampleAnimationTrack };
