import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__easing_js_764f4a7e__ from "./easing.js";
const SEMANTIC_CAMERA_MOTION_KIND = 'share3d.camera-motion-semantic';
const SEMANTIC_CAMERA_MOTION_VERSION = 1;
const SEMANTIC_CAMERA_MOTION_SEMANTICS = [
    'dolly',
    'orbit',
    'rise-overlook',
    'spiral'
];
const ALLOWED_TEMPLATE_FIELDS = new Set([
    'kind',
    'version',
    'id',
    'name',
    "description",
    'semantic',
    'params',
    'interpolation',
    'easing',
    'segmentEasing',
    'holdDuration'
]);
const ANIMATION_INTERPOLATIONS = new Set([
    'step',
    'linear',
    'spline'
]);
const SEMANTIC_SET = new Set(SEMANTIC_CAMERA_MOTION_SEMANTICS);
const MIN_DISTANCE_SCALE = 0.25;
const DOLLY_IN_DISTANCE_SCALE = 0.35;
const DOLLY_OUT_DISTANCE_SCALE = 1.5;
const DEFAULT_DOLLY_DIRECTION = 'in';
const DEFAULT_ORBIT_DIRECTION = 'right';
const DEFAULT_SPIRAL_VERTICAL_DIRECTION = 'up';
const DEFAULT_SPIRAL_ROTATION_DIRECTION = 'clockwise';
const DEFAULT_SPIRAL_RADIUS_MODE = 'fixed';
const RISE_DISTANCE_SCALE = 1.15;
const RISE_HEIGHT_SCALE = 0.35;
const ORBIT_ANGLE_DEGREES = 90;
const SPIRAL_ANGLE_DEGREES = 360;
const SPIRAL_HEIGHT_SCALE = 0.5;
const SPIRAL_IN_RADIUS_SCALE = 0.65;
const SPIRAL_OUT_RADIUS_SCALE = 1.35;
const DEFAULT_ORBIT_KEYFRAME_COUNT = 3;
const DEFAULT_RISE_KEYFRAME_COUNT = 3;
const DEFAULT_SPIRAL_KEYFRAME_COUNT = 13;
const MIN_KEYFRAME_COUNT = 2;
const MAX_KEYFRAME_COUNT = 24;
const MAX_ORBIT_ANGLE_DEGREES = 360;
const MAX_SPIRAL_ANGLE_DEGREES = 1440;
const MAX_SPIRAL_RADIUS_SCALE = 10;
const MIN_ABSOLUTE_DISTANCE = 1e-4;
const EPSILON = 1e-8;
const ORBIT_AXIS_PARALLEL_EPSILON = 1e-6;
const WORLD_UP_AXIS = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 1);
const ENDPOINT_PROGRESS_EASING_BY_PAIR = new Map([
    [
        'linearIn:linearOut',
        'linearInOut'
    ],
    [
        'quadraticIn:quadraticOut',
        'quadraticInOut'
    ],
    [
        'cubicIn:cubicOut',
        'cubicInOut'
    ],
    [
        'quarticIn:quarticOut',
        'quarticInOut'
    ],
    [
        'quinticIn:quinticOut',
        'quinticInOut'
    ],
    [
        'sineIn:sineOut',
        'sineInOut'
    ],
    [
        'expoIn:expoOut',
        'expoInOut'
    ],
    [
        'circIn:circOut',
        'circInOut'
    ],
    [
        'backIn:backOut',
        'backInOut'
    ],
    [
        'bounceIn:bounceOut',
        'bounceInOut'
    ],
    [
        'elasticIn:elasticOut',
        'elasticInOut'
    ]
]);
function parseSemanticCameraMotionTemplate(value) {
    const record = expectRecord(value, 'Semantic camera motion template must be an object');
    for (const key of Object.keys(record))if (!ALLOWED_TEMPLATE_FIELDS.has(key)) throw new Error(`Unknown semantic camera motion field: ${key}`);
    if (record.kind !== SEMANTIC_CAMERA_MOTION_KIND) throw new Error(`Unsupported semantic camera motion kind: ${String(record.kind)}`);
    if (record.version !== SEMANTIC_CAMERA_MOTION_VERSION) throw new Error(`Unsupported semantic camera motion version: ${String(record.version)}`);
    const id = expectNonEmptyString(record.id, 'id');
    const name = expectNonEmptyString(record.name, 'name');
    const description = void 0 === record.description ? void 0 : expectString(record.description, "description");
    const semantic = parseSemantic(record.semantic);
    const params = parseParams(record.params, semantic);
    const interpolation = parseInterpolation(record.interpolation);
    const easing = parseEasing(record.easing);
    const segmentEasing = parseSegmentEasing(record.segmentEasing);
    const holdDuration = parseOptionalNonNegativeNumber(record.holdDuration, 'holdDuration');
    if ('step' === interpolation && (void 0 !== easing || void 0 !== segmentEasing)) throw new Error('Semantic camera motion easing is not supported with step interpolation');
    return {
        kind: SEMANTIC_CAMERA_MOTION_KIND,
        version: SEMANTIC_CAMERA_MOTION_VERSION,
        id,
        name,
        ...void 0 !== description ? {
            description
        } : {},
        semantic,
        ...void 0 !== params ? {
            params
        } : {},
        interpolation,
        ...void 0 !== easing ? {
            easing
        } : {},
        ...void 0 !== segmentEasing ? {
            segmentEasing
        } : {},
        ...void 0 !== holdDuration ? {
            holdDuration
        } : {}
    };
}
function createSemanticCameraMotion(template, context, options) {
    const normalizedTemplate = parseSemanticCameraMotionTemplate(template);
    const input = normalizeMotionInput(context, options);
    const { keyframes: motionKeyframes, clamped } = createMotionKeyframes(normalizedTemplate, input);
    const keyframes = appendHoldKeyframe(normalizedTemplate, motionKeyframes, input.duration);
    const clip = createMotionClip(normalizedTemplate, keyframes, getKeyframesDuration(keyframes), Math.max(0, motionKeyframes.length - 1));
    return {
        keyframes,
        clip,
        diagnostics: {
            distance: input.distance,
            clamped
        }
    };
}
function expectRecord(value, message) {
    if (!value || 'object' != typeof value || Array.isArray(value)) throw new Error(message);
    return value;
}
function expectString(value, fieldName) {
    if ('string' != typeof value) throw new Error(`Semantic camera motion ${fieldName} must be a string`);
    return value;
}
function expectNonEmptyString(value, fieldName) {
    const text = expectString(value, fieldName).trim();
    if (!text) throw new Error(`Semantic camera motion ${fieldName} must not be empty`);
    return text;
}
function parseSemantic(value) {
    if ('string' != typeof value || !SEMANTIC_SET.has(value)) throw new Error(`Unsupported semantic camera motion semantic: ${String(value)}`);
    return value;
}
function parseInterpolation(value) {
    if ('string' != typeof value || !ANIMATION_INTERPOLATIONS.has(value)) throw new Error(`Unsupported semantic camera motion interpolation: ${String(value)}`);
    return value;
}
function parseEasing(value) {
    if (void 0 === value) return;
    if ('none' === value) throw new Error('Semantic camera motion easing must be omitted instead of "none"');
    if (!(0, __WEBPACK_EXTERNAL_MODULE__easing_js_764f4a7e__.isAnimationEasing)(value)) throw new Error(`Unsupported semantic camera motion easing: ${String(value)}`);
    return value;
}
function parseSegmentEasing(value) {
    if (void 0 === value) return;
    const record = expectRecord(value, 'Semantic camera motion segmentEasing must be an object');
    expectAllowedParams(record, [
        'first',
        'last'
    ], 'segmentEasing');
    const first = parseEasing(record.first);
    const last = parseEasing(record.last);
    if (void 0 === first && void 0 === last) throw new Error('Semantic camera motion segmentEasing must include first or last');
    return {
        ...void 0 !== first ? {
            first
        } : {},
        ...void 0 !== last ? {
            last
        } : {}
    };
}
function parseParams(value, semantic) {
    if (void 0 === value) return;
    const record = expectRecord(value, 'Semantic camera motion params must be an object');
    switch(semantic){
        case 'dolly':
            return parseDollyParams(record);
        case 'orbit':
            return parseOrbitParams(record);
        case 'rise-overlook':
            return parseRiseOverlookParams(record);
        case 'spiral':
            return parseSpiralParams(record);
    }
    throw new Error(`Unsupported semantic camera motion semantic: ${String(semantic)}`);
}
function parseDollyParams(record) {
    expectAllowedParams(record, [
        'direction',
        'distanceScale'
    ], 'dolly');
    const direction = parseOptionalDollyDirection(record.direction);
    const distanceScale = parseOptionalPositiveNumber(record.distanceScale, 'params.distanceScale');
    const effectiveDirection = direction ?? DEFAULT_DOLLY_DIRECTION;
    if ('in' === effectiveDirection && void 0 !== distanceScale && distanceScale >= 1) throw new Error('Semantic camera motion params.distanceScale must be less than 1 for dolly in');
    if ('out' === effectiveDirection && void 0 !== distanceScale && distanceScale <= 1) throw new Error('Semantic camera motion params.distanceScale must be greater than 1 for dolly out');
    return {
        ...void 0 !== direction ? {
            direction
        } : {},
        ...void 0 !== distanceScale ? {
            distanceScale
        } : {}
    };
}
function parseOrbitParams(record) {
    expectAllowedParams(record, [
        'direction',
        'angle',
        'keyframeCount'
    ], 'orbit');
    const direction = parseOptionalOrbitDirection(record.direction);
    const angle = parseOptionalRangeNumber(record.angle, 'params.angle', 0, MAX_ORBIT_ANGLE_DEGREES);
    const keyframeCount = parseOptionalKeyframeCount(record.keyframeCount);
    return {
        ...void 0 !== direction ? {
            direction
        } : {},
        ...void 0 !== angle ? {
            angle
        } : {},
        ...void 0 !== keyframeCount ? {
            keyframeCount
        } : {}
    };
}
function parseRiseOverlookParams(record) {
    expectAllowedParams(record, [
        'distanceScale',
        'heightScale',
        'keyframeCount'
    ], 'rise-overlook');
    const distanceScale = parseOptionalPositiveNumber(record.distanceScale, 'params.distanceScale');
    const heightScale = parseOptionalNonNegativeNumber(record.heightScale, 'params.heightScale');
    const keyframeCount = parseOptionalKeyframeCount(record.keyframeCount);
    return {
        ...void 0 !== distanceScale ? {
            distanceScale
        } : {},
        ...void 0 !== heightScale ? {
            heightScale
        } : {},
        ...void 0 !== keyframeCount ? {
            keyframeCount
        } : {}
    };
}
function parseSpiralParams(record) {
    expectAllowedParams(record, [
        'verticalDirection',
        'rotationDirection',
        'radiusMode',
        'angle',
        'radiusScale',
        'heightScale',
        'keyframeCount'
    ], 'spiral');
    const verticalDirection = parseOptionalSpiralVerticalDirection(record.verticalDirection);
    const rotationDirection = parseOptionalSpiralRotationDirection(record.rotationDirection);
    const radiusMode = parseOptionalSpiralRadiusMode(record.radiusMode);
    const angle = parseOptionalRangeNumber(record.angle, 'params.angle', 0, MAX_SPIRAL_ANGLE_DEGREES);
    const radiusScale = parseOptionalRangeNumber(record.radiusScale, 'params.radiusScale', 0, MAX_SPIRAL_RADIUS_SCALE);
    const heightScale = parseOptionalNonNegativeNumber(record.heightScale, 'params.heightScale');
    const keyframeCount = parseOptionalKeyframeCount(record.keyframeCount);
    validateSpiralRadiusScale(radiusMode ?? DEFAULT_SPIRAL_RADIUS_MODE, radiusScale);
    return {
        ...void 0 !== verticalDirection ? {
            verticalDirection
        } : {},
        ...void 0 !== rotationDirection ? {
            rotationDirection
        } : {},
        ...void 0 !== radiusMode ? {
            radiusMode
        } : {},
        ...void 0 !== angle ? {
            angle
        } : {},
        ...void 0 !== radiusScale ? {
            radiusScale
        } : {},
        ...void 0 !== heightScale ? {
            heightScale
        } : {},
        ...void 0 !== keyframeCount ? {
            keyframeCount
        } : {}
    };
}
function expectAllowedParams(record, allowedFields, semantic) {
    const allowed = new Set(allowedFields);
    for (const key of Object.keys(record))if (!allowed.has(key)) throw new Error(`Unknown semantic camera motion params field for ${semantic}: ${key}`);
}
function parseOptionalDollyDirection(value) {
    if (void 0 === value) return;
    if ('in' !== value && 'out' !== value) throw new Error(`Unsupported semantic camera motion params.direction: ${String(value)}`);
    return value;
}
function parseOptionalOrbitDirection(value) {
    if (void 0 === value) return;
    if ('left' !== value && 'right' !== value) throw new Error(`Unsupported semantic camera motion params.direction: ${String(value)}`);
    return value;
}
function parseOptionalSpiralVerticalDirection(value) {
    if (void 0 === value) return;
    if ('up' !== value && 'down' !== value) throw new Error(`Unsupported semantic camera motion params.verticalDirection: ${String(value)}`);
    return value;
}
function parseOptionalSpiralRotationDirection(value) {
    if (void 0 === value) return;
    if ('clockwise' !== value && 'counterclockwise' !== value) throw new Error(`Unsupported semantic camera motion params.rotationDirection: ${String(value)}`);
    return value;
}
function parseOptionalSpiralRadiusMode(value) {
    if (void 0 === value) return;
    if ('fixed' !== value && 'in' !== value && 'out' !== value) throw new Error(`Unsupported semantic camera motion params.radiusMode: ${String(value)}`);
    return value;
}
function validateSpiralRadiusScale(radiusMode, radiusScale) {
    if (void 0 === radiusScale) return;
    if ('in' === radiusMode && radiusScale >= 1) throw new Error('Semantic camera motion params.radiusScale must be less than 1 for spiral in');
    if ('out' === radiusMode && radiusScale <= 1) throw new Error('Semantic camera motion params.radiusScale must be greater than 1 for spiral out');
    if ('fixed' === radiusMode && 1 !== radiusScale) throw new Error('Semantic camera motion params.radiusScale must be 1 for fixed spiral radius');
}
function parseOptionalPositiveNumber(value, fieldName) {
    if (void 0 === value) return;
    const numberValue = readFiniteNumber(value, fieldName);
    if (numberValue <= 0) throw new Error(`Semantic camera motion ${fieldName} must be greater than 0`);
    return numberValue;
}
function parseOptionalNonNegativeNumber(value, fieldName) {
    if (void 0 === value) return;
    const numberValue = readFiniteNumber(value, fieldName);
    if (numberValue < 0) throw new Error(`Semantic camera motion ${fieldName} must be greater than or equal to 0`);
    return numberValue;
}
function parseOptionalRangeNumber(value, fieldName, minExclusive, maxInclusive) {
    if (void 0 === value) return;
    const numberValue = readFiniteNumber(value, fieldName);
    if (numberValue <= minExclusive || numberValue > maxInclusive) throw new Error(`Semantic camera motion ${fieldName} must be greater than ${minExclusive} and less than or equal to ${maxInclusive}`);
    return numberValue;
}
function parseOptionalKeyframeCount(value) {
    if (void 0 === value) return;
    if ('number' != typeof value || !Number.isInteger(value)) throw new Error('Semantic camera motion params.keyframeCount must be an integer');
    if (value < MIN_KEYFRAME_COUNT || value > MAX_KEYFRAME_COUNT) throw new Error(`Semantic camera motion params.keyframeCount must be between ${MIN_KEYFRAME_COUNT} and ${MAX_KEYFRAME_COUNT}`);
    return value;
}
function normalizeMotionInput(context, options) {
    const contextRecord = expectRecord(context, 'Semantic camera motion context must be an object');
    const camera = expectRecord(contextRecord.camera, 'Semantic camera motion context.camera must be an object');
    const optionsRecord = expectRecord(options, 'Semantic camera motion options must be an object');
    const duration = readFiniteNumber(optionsRecord.duration, 'duration');
    if (!Number.isFinite(duration) || duration <= 0) throw new Error('Semantic camera motion duration must be a positive finite number');
    const position = toVector3(camera.position, 'camera.position');
    const target = toVector3(camera.target, 'camera.target');
    const up = toVector3(camera.up, 'camera.up');
    const fov = readFiniteNumber(camera.fov, 'camera.fov');
    const roll = void 0 === camera.roll ? 0 : readFiniteNumber(camera.roll, 'camera.roll');
    if (!Number.isFinite(fov) || fov <= 0) throw new Error('Semantic camera motion camera.fov must be a positive finite number');
    if (!Number.isFinite(roll)) throw new Error('Semantic camera motion camera.roll must be finite when provided');
    if (up.lengthSq() <= EPSILON) throw new Error('Semantic camera motion camera.up must not be a zero vector');
    const distance = position.distanceTo(target);
    if (!Number.isFinite(distance) || distance <= EPSILON) throw new Error('Semantic camera motion camera.position must not equal camera.target');
    return {
        position,
        target,
        up: up.normalize(),
        fov,
        roll,
        distance,
        duration
    };
}
function readFiniteNumber(value, fieldName) {
    if ('number' != typeof value || !Number.isFinite(value)) throw new Error(`Semantic camera motion ${fieldName} must be a finite number`);
    return value;
}
function toVector3(value, fieldName) {
    const candidate = Array.isArray(value) ? tupleToVector3(value, fieldName) : objectToVector3(value, fieldName);
    if (!Number.isFinite(candidate.x) || !Number.isFinite(candidate.y) || !Number.isFinite(candidate.z)) throw new Error(`Semantic camera motion ${fieldName} must contain finite coordinates`);
    return candidate;
}
function tupleToVector3(value, fieldName) {
    if (3 !== value.length) throw new Error(`Semantic camera motion ${fieldName} must contain exactly 3 coordinates`);
    return new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(readFiniteNumber(value[0], `${fieldName}.x`), readFiniteNumber(value[1], `${fieldName}.y`), readFiniteNumber(value[2], `${fieldName}.z`));
}
function objectToVector3(value, fieldName) {
    const record = expectRecord(value, `Semantic camera motion ${fieldName} must be a vector tuple or object`);
    return new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(readFiniteNumber(record.x, `${fieldName}.x`), readFiniteNumber(record.y, `${fieldName}.y`), readFiniteNumber(record.z, `${fieldName}.z`));
}
function createMotionKeyframes(template, input) {
    switch(template.semantic){
        case 'dolly':
            {
                const params = resolveDollyParams(template.params);
                return createDollyKeyframes(input, params.distanceScale);
            }
        case 'orbit':
            {
                const params = resolveOrbitParams(template.params);
                const signedAngle = 'left' === params.direction ? params.angle : -params.angle;
                return createOrbitKeyframes(input, signedAngle, params.keyframeCount);
            }
        case 'rise-overlook':
            return createRiseOverlookKeyframes(input, resolveRiseOverlookParams(template.params));
        case 'spiral':
            return createSpiralKeyframes(input, resolveSpiralParams(template.params), resolveEndpointProgressEasing(template.segmentEasing));
    }
    throw new Error(`Unsupported semantic camera motion semantic: ${String(template.semantic)}`);
}
function resolveDollyParams(params) {
    const dollyParams = params ?? {};
    const direction = dollyParams.direction ?? DEFAULT_DOLLY_DIRECTION;
    const distanceScale = dollyParams.distanceScale ?? ('in' === direction ? DOLLY_IN_DISTANCE_SCALE : DOLLY_OUT_DISTANCE_SCALE);
    return {
        direction,
        distanceScale
    };
}
function resolveOrbitParams(params) {
    const orbitParams = params ?? {};
    return {
        direction: orbitParams.direction ?? DEFAULT_ORBIT_DIRECTION,
        angle: __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.degToRad(orbitParams.angle ?? ORBIT_ANGLE_DEGREES),
        keyframeCount: orbitParams.keyframeCount ?? DEFAULT_ORBIT_KEYFRAME_COUNT
    };
}
function resolveRiseOverlookParams(params) {
    const riseParams = params ?? {};
    return {
        distanceScale: riseParams.distanceScale ?? RISE_DISTANCE_SCALE,
        heightScale: riseParams.heightScale ?? RISE_HEIGHT_SCALE,
        keyframeCount: riseParams.keyframeCount ?? DEFAULT_RISE_KEYFRAME_COUNT
    };
}
function resolveSpiralParams(params) {
    const spiralParams = params ?? {};
    const radiusMode = spiralParams.radiusMode ?? DEFAULT_SPIRAL_RADIUS_MODE;
    return {
        verticalDirection: spiralParams.verticalDirection ?? DEFAULT_SPIRAL_VERTICAL_DIRECTION,
        rotationDirection: spiralParams.rotationDirection ?? DEFAULT_SPIRAL_ROTATION_DIRECTION,
        radiusMode,
        angle: spiralParams.angle ?? SPIRAL_ANGLE_DEGREES,
        radiusScale: spiralParams.radiusScale ?? getDefaultSpiralRadiusScale(radiusMode),
        heightScale: spiralParams.heightScale ?? SPIRAL_HEIGHT_SCALE,
        keyframeCount: spiralParams.keyframeCount ?? DEFAULT_SPIRAL_KEYFRAME_COUNT
    };
}
function getDefaultSpiralRadiusScale(radiusMode) {
    switch(radiusMode){
        case 'in':
            return SPIRAL_IN_RADIUS_SCALE;
        case 'out':
            return SPIRAL_OUT_RADIUS_SCALE;
        case 'fixed':
            return 1;
    }
}
function createDollyKeyframes(input, distanceScale) {
    const direction = input.position.clone().sub(input.target).normalize();
    const minDistance = getMinDistance(input.distance);
    const unclampedDistance = input.distance * distanceScale;
    const endDistance = Math.max(minDistance, unclampedDistance);
    const endPosition = input.target.clone().addScaledVector(direction, endDistance);
    return {
        keyframes: [
            createKeyframe(0, input.position, input),
            createKeyframe(input.duration, endPosition, input)
        ],
        clamped: endDistance !== unclampedDistance
    };
}
function createOrbitKeyframes(input, totalAngle, count) {
    const offset = input.position.clone().sub(input.target);
    const axis = resolveOrbitAxis(offset, input.up);
    const keyframes = [];
    for(let index = 0; index < count; index++){
        const progress = 1 === count ? 1 : index / (count - 1);
        const position = input.target.clone().add(offset.clone().applyAxisAngle(axis, totalAngle * progress));
        keyframes.push(createKeyframe(input.duration * progress, position, input));
    }
    return {
        keyframes,
        clamped: false
    };
}
function resolveOrbitAxis(offset, up) {
    const direction = offset.clone().normalize();
    const axis = up.clone().normalize();
    const crossLengthSq = direction.clone().cross(axis).lengthSq();
    if (crossLengthSq > ORBIT_AXIS_PARALLEL_EPSILON) return axis;
    return createFallbackOrbitAxis(direction);
}
function createFallbackOrbitAxis(direction) {
    const candidates = [
        new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 1),
        new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 1, 0),
        new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1, 0, 0)
    ];
    for (const candidate of candidates){
        const axis = direction.clone().cross(candidate);
        if (axis.lengthSq() > EPSILON) return axis.normalize();
    }
    return new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1, 0, 0);
}
function createRiseOverlookKeyframes(input, params) {
    const direction = input.position.clone().sub(input.target).normalize();
    const minDistance = getMinDistance(input.distance);
    const riseOffset = input.distance * params.heightScale;
    const keyframes = [];
    let clamped = false;
    for(let index = 0; index < params.keyframeCount; index++){
        const progress = 1 === params.keyframeCount ? 1 : index / (params.keyframeCount - 1);
        const distanceScale = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.lerp(1, params.distanceScale, progress);
        const unclampedDistance = input.distance * distanceScale;
        const distance = Math.max(minDistance, unclampedDistance);
        const position = input.target.clone().addScaledVector(direction, distance).addScaledVector(input.up, riseOffset * progress);
        clamped = clamped || distance !== unclampedDistance;
        keyframes.push(createKeyframe(input.duration * progress, position, input));
    }
    return {
        keyframes,
        clamped
    };
}
function createSpiralKeyframes(input, params, progressEasing) {
    const axis = WORLD_UP_AXIS.clone();
    const offset = input.position.clone().sub(input.target);
    const startHeight = offset.dot(axis);
    const radialOffset = offset.clone().addScaledVector(axis, -startHeight);
    const radialLength = radialOffset.length();
    const radialDirection = radialLength > EPSILON ? radialOffset.normalize() : createPerpendicularVector(axis);
    const rotationSign = 'counterclockwise' === params.rotationDirection ? 1 : -1;
    const verticalSign = 'up' === params.verticalDirection ? 1 : -1;
    const totalAngle = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.degToRad(params.angle) * rotationSign;
    const endRadius = radialLength * params.radiusScale;
    const heightDelta = Math.abs(startHeight) * params.heightScale * verticalSign;
    const keyframes = [];
    for(let index = 0; index < params.keyframeCount; index++){
        const rawProgress = 1 === params.keyframeCount ? 1 : index / (params.keyframeCount - 1);
        const progress = applyEndpointProgressEasing(rawProgress, progressEasing);
        const radius = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.lerp(radialLength, endRadius, progress);
        const height = startHeight + heightDelta * progress;
        const radial = radialDirection.clone().multiplyScalar(radius).applyAxisAngle(axis, totalAngle * progress);
        const position = input.target.clone().add(radial).addScaledVector(axis, height);
        keyframes.push(createKeyframe(input.duration * rawProgress, position, input));
    }
    return {
        keyframes,
        clamped: false
    };
}
function resolveEndpointProgressEasing(segmentEasing) {
    if (!segmentEasing?.first || !segmentEasing.last) return;
    return ENDPOINT_PROGRESS_EASING_BY_PAIR.get(`${segmentEasing.first}:${segmentEasing.last}`);
}
function shouldBakeSegmentEasingIntoPath(template) {
    return 'spiral' === template.semantic && void 0 !== resolveEndpointProgressEasing(template.segmentEasing);
}
function applyEndpointProgressEasing(progress, easing) {
    return void 0 === easing ? progress : (0, __WEBPACK_EXTERNAL_MODULE__easing_js_764f4a7e__.applyAnimationEasing)(progress, easing);
}
function createPerpendicularVector(axis) {
    const candidates = [
        new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1, 0, 0),
        new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 1, 0),
        new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 1)
    ];
    for (const candidate of candidates){
        const perpendicular = candidate.clone().addScaledVector(axis, -candidate.dot(axis));
        if (perpendicular.lengthSq() > EPSILON) return perpendicular.normalize();
    }
    return new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1, 0, 0);
}
function getMinDistance(distance) {
    return Math.min(distance, Math.max(MIN_ABSOLUTE_DISTANCE, distance * MIN_DISTANCE_SCALE));
}
function createKeyframe(time, position, input) {
    return {
        time,
        position: vectorToTuple(position),
        target: vectorToTuple(input.target),
        fov: input.fov,
        roll: input.roll
    };
}
function vectorToTuple(value) {
    return [
        value.x,
        value.y,
        value.z
    ];
}
function appendHoldKeyframe(template, keyframes, motionDuration) {
    const holdDuration = template.holdDuration ?? 0;
    if (holdDuration <= 0 || 0 === keyframes.length) return keyframes;
    const last = keyframes[keyframes.length - 1];
    return [
        ...keyframes,
        {
            time: motionDuration + holdDuration,
            position: [
                ...last.position
            ],
            target: [
                ...last.target
            ],
            fov: last.fov,
            roll: last.roll
        }
    ];
}
function getKeyframesDuration(keyframes) {
    return keyframes[keyframes.length - 1]?.time ?? 0;
}
function createMotionClip(template, keyframes, duration, motionSegmentCount) {
    const target = {
        kind: 'camera',
        active: 'bind-on-play'
    };
    const times = keyframes.map((frame)=>frame.time);
    const timing = createTrackTiming(template, Math.max(0, times.length - 1), motionSegmentCount);
    return {
        name: template.name,
        duration,
        loopMode: 'once',
        metadata: {
            semanticCameraMotion: true,
            semantic: template.semantic,
            templateId: template.id
        },
        tracks: [
            createTrack(target, 'position', 'vec3', times, keyframes.flatMap((frame)=>frame.position), timing),
            createTrack(target, 'target', 'vec3', times, keyframes.flatMap((frame)=>frame.target), timing),
            createTrack(target, 'fov', 'number', times, keyframes.map((frame)=>frame.fov), timing),
            createTrack(target, 'roll', 'number', times, keyframes.map((frame)=>frame.roll), timing)
        ]
    };
}
function createTrackTiming(template, totalSegmentCount, motionSegmentCount) {
    return {
        interpolation: template.interpolation,
        ...void 0 !== template.easing ? {
            easing: template.easing
        } : {},
        ...createSegmentEasingTiming(template, totalSegmentCount, motionSegmentCount),
        ...'spline' === template.interpolation ? {
            smoothness: 1
        } : {}
    };
}
function createSegmentEasingTiming(template, totalSegmentCount, motionSegmentCount) {
    if (void 0 === template.segmentEasing || totalSegmentCount <= 0 || motionSegmentCount <= 0 || shouldBakeSegmentEasingIntoPath(template)) return {};
    const fallbackEasing = template.easing ?? 'linear';
    const segmentEasing = new Array(totalSegmentCount).fill(fallbackEasing);
    const firstIndex = 0;
    const lastIndex = motionSegmentCount - 1;
    if (void 0 !== template.segmentEasing.first) segmentEasing[firstIndex] = template.segmentEasing.first;
    if (void 0 !== template.segmentEasing.last && (lastIndex !== firstIndex || void 0 === template.segmentEasing.first)) segmentEasing[lastIndex] = template.segmentEasing.last;
    return {
        segmentEasing
    };
}
function createTrack(target, propertyPath, valueType, times, values, timing) {
    return {
        target,
        propertyPath,
        valueType,
        times,
        values,
        ...timing
    };
}
export { SEMANTIC_CAMERA_MOTION_KIND, SEMANTIC_CAMERA_MOTION_SEMANTICS, SEMANTIC_CAMERA_MOTION_VERSION, createSemanticCameraMotion, parseSemanticCameraMotionTemplate };
