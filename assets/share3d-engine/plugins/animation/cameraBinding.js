import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
const CAMERA_ANIMATION_PROPERTIES = [
    'position',
    'target',
    'up',
    'fov',
    'zoom',
    'roll'
];
function createCameraBindingResolver(host) {
    return {
        resolve (targetRef) {
            if ('camera' !== targetRef.kind) return null;
            const resolved = host.resolveCameraTarget(targetRef);
            if (!resolved) return null;
            return {
                key: resolved.key,
                targetRef: {
                    kind: 'camera',
                    viewId: resolved.viewId
                },
                supportedProperties: CAMERA_ANIMATION_PROPERTIES,
                write (samples) {
                    const patch = cameraSamplesToPatch(samples);
                    host.applyCameraStatePatch(resolved.viewId, patch, {
                        cancelTransition: true
                    });
                }
            };
        }
    };
}
function cameraSamplesToPatch(samples) {
    const patch = {};
    for (const sample of samples)switch(sample.propertyPath){
        case 'position':
            patch.position = toVector3(sample.value);
            break;
        case 'target':
            patch.target = toVector3(sample.value);
            break;
        case 'up':
            patch.up = toVector3(sample.value);
            break;
        case 'fov':
            patch.fov = sample.value[0];
            break;
        case 'zoom':
            patch.zoom = sample.value[0];
            break;
        case 'roll':
            patch.roll = sample.value[0];
            break;
    }
    return patch;
}
function toVector3(value) {
    return new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(value[0] ?? 0, value[1] ?? 0, value[2] ?? 0);
}
export { CAMERA_ANIMATION_PROPERTIES, createCameraBindingResolver };
