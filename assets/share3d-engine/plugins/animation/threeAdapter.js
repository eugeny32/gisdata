import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
function createAnimationClipFromThreeClip(source, options) {
    return {
        id: options.id,
        name: options.name ?? source.name,
        duration: source.duration,
        loopMode: 'once',
        tracks: source.tracks.map((track)=>{
            const interpolation = mapThreeInterpolation(track);
            const valueType = mapThreeValueType(track);
            return {
                name: track.name,
                target: options.target,
                propertyPath: normalizeThreePropertyPath(track.name),
                valueType,
                interpolation,
                times: Array.from(track.times),
                values: Array.from(track.values),
                metadata: {
                    source: 'three-animation-clip',
                    threeValueType: track.ValueTypeName
                }
            };
        }),
        metadata: {
            source: 'three-animation-clip',
            originalName: source.name
        }
    };
}
function mapThreeInterpolation(track) {
    const interpolation = track.getInterpolation();
    if (interpolation === __WEBPACK_EXTERNAL_MODULE_three__.InterpolateDiscrete) return 'step';
    if (interpolation === __WEBPACK_EXTERNAL_MODULE_three__.InterpolateLinear) return 'linear';
    throw new Error(`Unsupported Three.js interpolation for track "${track.name}". Use Share3D native sampler for extended semantics.`);
}
function mapThreeValueType(track) {
    switch(track.ValueTypeName){
        case 'number':
            return 'number';
        case 'vector':
            return mapVectorValueType(track);
        case 'color':
            return 'color';
        case 'quaternion':
            return 'quaternion';
        default:
            throw new Error(`Unsupported Three.js track value type: ${track.ValueTypeName}`);
    }
}
function mapVectorValueType(track) {
    const stride = track.values.length / track.times.length;
    if (2 === stride) return 'vec2';
    if (3 === stride) return 'vec3';
    if (4 === stride) return 'vec4';
    throw new Error(`Unsupported Three.js vector track stride: ${stride}`);
}
function normalizeThreePropertyPath(name) {
    return name.startsWith('.') ? name.slice(1) : name;
}
export { createAnimationClipFromThreeClip };
