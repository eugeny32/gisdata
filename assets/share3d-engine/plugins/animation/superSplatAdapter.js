const DEFAULT_CAMERA_TARGET = {
    kind: 'camera',
    active: 'bind-on-play'
};
function createAnimationClipFromSuperSplatCameraTrack(source, options = {}) {
    validateSuperSplatTrack(source);
    const target = options.target ?? DEFAULT_CAMERA_TARGET;
    const times = source.keyframes.times.map((time)=>time / source.frameRate);
    const duration = source.duration / source.frameRate;
    const interpolation = mapInterpolation(source.interpolation);
    const smoothness = source.smoothness ?? 1;
    const tracks = [];
    addVectorTrack(tracks, source, target, times, 'position', 'position', interpolation, smoothness);
    addVectorTrack(tracks, source, target, times, 'target', 'target', interpolation, smoothness);
    addNumberTrack(tracks, source, target, times, 'fov', 'fov', interpolation, smoothness);
    if (0 === tracks.length) throw new Error('SuperSplat camera track must contain position, target, or fov values');
    return {
        id: options.id,
        name: options.name ?? source.name,
        duration,
        loopMode: mapLoopMode(source.loopMode),
        tracks,
        metadata: {
            source: 'supersplat-camera-track',
            frameRate: source.frameRate,
            originalDuration: source.duration,
            interpolation: source.interpolation ?? 'spline',
            smoothness
        }
    };
}
function addVectorTrack(tracks, source, target, times, valueKey, propertyPath, interpolation, smoothness) {
    const values = source.keyframes.values[valueKey];
    if (!values) return;
    if (values.length !== 3 * times.length) throw new Error(`SuperSplat camera ${valueKey} values must contain 3 numbers per keyframe`);
    tracks.push({
        name: `${source.name ?? 'SuperSplat Camera'}.${propertyPath}`,
        target,
        propertyPath,
        valueType: 'vec3',
        interpolation,
        smoothness: 'spline' === interpolation ? smoothness : void 0,
        times,
        values,
        metadata: {
            sourceProperty: valueKey
        }
    });
}
function addNumberTrack(tracks, source, target, times, valueKey, propertyPath, interpolation, smoothness) {
    const values = source.keyframes.values[valueKey];
    if (!values) return;
    if (values.length !== times.length) throw new Error(`SuperSplat camera ${valueKey} values must contain 1 number per keyframe`);
    tracks.push({
        name: `${source.name ?? 'SuperSplat Camera'}.${propertyPath}`,
        target,
        propertyPath,
        valueType: 'number',
        interpolation,
        smoothness: 'spline' === interpolation ? smoothness : void 0,
        times,
        values,
        metadata: {
            sourceProperty: valueKey,
            unit: 'degree'
        }
    });
}
function validateSuperSplatTrack(source) {
    if (!Number.isFinite(source.frameRate) || source.frameRate <= 0) throw new Error('SuperSplat camera track frameRate must be greater than 0');
    if (!Number.isFinite(source.duration) || source.duration < 0) throw new Error('SuperSplat camera track duration must be a non-negative number');
    if (!source.keyframes.times || 0 === source.keyframes.times.length) throw new Error('SuperSplat camera track must contain at least one keyframe time');
    const lastKeyframeTime = source.keyframes.times[source.keyframes.times.length - 1];
    if (source.duration < lastKeyframeTime) throw new Error('SuperSplat camera track duration cannot be shorter than its last keyframe');
    if (void 0 !== source.smoothness && (!Number.isFinite(source.smoothness) || source.smoothness < 0 || source.smoothness > 1)) throw new Error('SuperSplat camera track smoothness must be in the range [0, 1]');
}
function mapInterpolation(interpolation) {
    switch(interpolation){
        case 'step':
            return 'step';
        case 'spline':
        case void 0:
            return 'spline';
        default:
            throw new Error(`Unsupported SuperSplat camera interpolation: ${interpolation}`);
    }
}
function mapLoopMode(loopMode) {
    switch(loopMode){
        case 'repeat':
            return 'repeat';
        case 'pingpong':
            return 'pingpong';
        case 'none':
        case void 0:
            return 'once';
        default:
            throw new Error(`Unsupported SuperSplat camera loopMode: ${loopMode}`);
    }
}
export { createAnimationClipFromSuperSplatCameraTrack };
