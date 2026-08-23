import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__GSplatBoxShaderEffect_js_d0d81da3__ from "./GSplatBoxShaderEffect.js";
import * as __WEBPACK_EXTERNAL_MODULE__GSplatCropShaderEffect_js_cf9c5c64__ from "./GSplatCropShaderEffect.js";
import * as __WEBPACK_EXTERNAL_MODULE__GSplatDissolveDriftEffect_js_64ca8d55__ from "./GSplatDissolveDriftEffect.js";
import * as __WEBPACK_EXTERNAL_MODULE__GSplatObbShaderEffect_js_2fea64c1__ from "./GSplatObbShaderEffect.js";
import * as __WEBPACK_EXTERNAL_MODULE__GSplatRevealGridEruption_js_19a7a3b1__ from "./GSplatRevealGridEruption.js";
import * as __WEBPACK_EXTERNAL_MODULE__GSplatRevealMagicEffect_js_42867818__ from "./GSplatRevealMagicEffect.js";
import * as __WEBPACK_EXTERNAL_MODULE__GSplatRevealRadial_js_32de35d4__ from "./GSplatRevealRadial.js";
import * as __WEBPACK_EXTERNAL_MODULE__GSplatRevealRain_js_91179055__ from "./GSplatRevealRain.js";
import * as __WEBPACK_EXTERNAL_MODULE__GSplatRevealSpreadEffect_js_f9c5792b__ from "./GSplatRevealSpreadEffect.js";
import * as __WEBPACK_EXTERNAL_MODULE__GSplatRevealTwisterEffect_js_71144017__ from "./GSplatRevealTwisterEffect.js";
import * as __WEBPACK_EXTERNAL_MODULE__GSplatRevealUnrollEffect_js_e0d8ed33__ from "./GSplatRevealUnrollEffect.js";
import * as __WEBPACK_EXTERNAL_MODULE__GSplatVisualDeepMeditationEffect_js_cc80e9a3__ from "./GSplatVisualDeepMeditationEffect.js";
import * as __WEBPACK_EXTERNAL_MODULE__GSplatVisualDisintegrateEffect_js_46ff0157__ from "./GSplatVisualDisintegrateEffect.js";
import * as __WEBPACK_EXTERNAL_MODULE__GSplatVisualElectronicEffect_js_fe459628__ from "./GSplatVisualElectronicEffect.js";
import * as __WEBPACK_EXTERNAL_MODULE__GSplatVisualFlareEffect_js_a9db39b4__ from "./GSplatVisualFlareEffect.js";
import * as __WEBPACK_EXTERNAL_MODULE__GSplatVisualWavesEffect_js_0270512a__ from "./GSplatVisualWavesEffect.js";
const GSPLAT_EFFECT_TEMPLATE_KIND = 'share3d.gsplat-effect-template';
const GSPLAT_EFFECT_TEMPLATE_VERSION = 1;
const GSPLAT_EFFECT_TEMPLATE_KEYS = [
    'box-reveal',
    'box-hide',
    'box-tint',
    'box-untint',
    'box-crop',
    'reveal-radial',
    'reveal-rain',
    'reveal-grid',
    'obb-double-wave',
    'visual-electronic',
    'visual-deep-meditation',
    'visual-waves',
    'visual-flare',
    'visual-disintegrate',
    'reveal-magic',
    'reveal-spread',
    'reveal-unroll',
    'reveal-twister',
    'dissolve-drift'
];
const GSPLAT_EFFECT_TEMPLATE_BOX_DIRECTIONS = [
    'z-up',
    'z-down',
    'x-plus',
    'x-minus',
    'y-plus',
    'y-minus'
];
class GSplatEffectTemplateError extends Error {
    constructor(message){
        super(message);
        this.name = 'GSplatEffectTemplateError';
    }
}
const TEMPLATE_TOP_LEVEL_KEYS = [
    'kind',
    'version',
    'id',
    'name',
    "description",
    'effectKey',
    'adaptive',
    'params'
];
const BOX_SCAN_PARAM_KEYS = [
    'size',
    'direction',
    'duration',
    'tintColor',
    'edgeColor'
];
const BOX_CROP_PARAM_KEYS = [
    'size',
    'edgeScaleFactor'
];
const REVEAL_WAVE_PARAM_KEYS = [
    'duration',
    'dotTint',
    'waveTint',
    'intensity'
];
const GSPLAT_EFFECT_TEMPLATE_REVEAL_WAVE_MANUAL_PARAM_KEYS = [
    'speed',
    'acceleration',
    'delay',
    'dotTint',
    'waveTint',
    'oscillationIntensity',
    'bandWidth'
];
const RAIN_PARAM_KEYS = [
    'duration',
    'fallTint',
    'fallTintIntensity',
    'hitTint',
    'intensity'
];
const GSPLAT_EFFECT_TEMPLATE_RAIN_MANUAL_PARAM_KEYS = [
    'distance',
    'speed',
    'acceleration',
    'flightTime',
    'rainSize',
    'rotation',
    'fallTint',
    'fallTintIntensity',
    'hitTint',
    'hitDuration'
];
const GRID_PARAM_KEYS = [
    'duration',
    'moveTint',
    'moveTintIntensity',
    'landTint',
    'intensity'
];
const GSPLAT_EFFECT_TEMPLATE_GRID_MANUAL_PARAM_KEYS = [
    'blockSize',
    'delay',
    'duration',
    'dotSize',
    'moveTint',
    'moveTintIntensity',
    'landTint',
    'landDuration'
];
const VISUAL_SHOWCASE_PARAM_KEYS = [
    'intensity',
    'timeScale',
    'swayAmplitude',
    'swaySpeed',
    'flickerColor'
];
const REVEAL_SHOWCASE_PARAM_KEYS = [
    'timeScale',
    'motionScale',
    'duration'
];
const DISSOLVE_DRIFT_PARAM_KEYS = [
    'speed',
    'motionScale'
];
const COLOR_CONTROL_KEYS = [
    'color',
    'intensity'
];
const EFFECT_KEY_SET = new Set(GSPLAT_EFFECT_TEMPLATE_KEYS);
const NUMERIC_LIMITS = {
    colorIntensity: {
        min: 0,
        max: 5
    },
    boxSize: {
        min: 0.5,
        max: 1000
    },
    boxDuration: {
        min: 0.5,
        max: 12
    },
    edgeScaleFactor: {
        min: 0,
        max: 2
    },
    revealDuration: {
        min: 1.2,
        max: 20
    },
    unitIntensity: {
        min: 0,
        max: 1
    },
    revealIntensity: {
        min: 0,
        max: 3
    },
    revealSpeed: {
        min: 0,
        max: 20
    },
    revealAcceleration: {
        min: 0,
        max: 10
    },
    revealDelay: {
        min: 0,
        max: 10
    },
    revealBandWidth: {
        min: 0.1,
        max: 5
    },
    rainDistance: {
        min: 0,
        max: 120
    },
    rainFlightTime: {
        min: 0.1,
        max: 8
    },
    rainSize: {
        min: 0.001,
        max: 0.2
    },
    rainRotation: {
        min: 0,
        max: 2
    },
    rainHitDuration: {
        min: 0.1,
        max: 4
    },
    gridBlockSize: {
        min: 0.1,
        max: 10
    },
    gridDelay: {
        min: 0,
        max: 2
    },
    gridDuration: {
        min: 0.1,
        max: 5
    },
    gridDotSize: {
        min: 0.001,
        max: 0.2
    },
    gridLandDuration: {
        min: 0.1,
        max: 4
    },
    visualIntensity: {
        min: 0,
        max: 3
    },
    swayAmplitude: {
        min: 0,
        max: 1
    },
    swaySpeed: {
        min: 0,
        max: 8
    },
    timeScale: {
        min: 0,
        max: 4
    },
    motionScale: {
        min: 0,
        max: 5
    },
    showcaseDuration: {
        min: 0.5,
        max: 20
    },
    dissolveSpeed: {
        min: 0.05,
        max: 5
    }
};
const DEFAULT_COLOR_CONTROLS = {
    cyan: {
        color: '#00ffff',
        intensity: 1
    },
    orange: {
        color: '#ff8000',
        intensity: 1
    },
    redStrong: {
        color: '#ff0000',
        intensity: 2
    },
    magenta: {
        color: '#ff00ff',
        intensity: 1
    },
    yellowStrong: {
        color: '#ffff00',
        intensity: 2
    }
};
const BOX_EDGE_TINT_INTENSITY = 5;
const DEFAULT_SCENE_RADIUS = 32;
const DEFAULT_MIN_REVEAL_RADIUS = 10;
const MAX_REVEAL_RADIUS = NUMERIC_LIMITS.boxSize.max;
const EPSILON = 1e-8;
const DEFAULT_REVEAL_DURATION = 4;
const DEFAULT_GRID_REVEAL_DURATION = 3;
const DOUBLE_WAVE_DELAY_RATIO = 0.25;
const DOUBLE_WAVE_MAX_DELAY = 1.2;
const RAIN_TAIL_RATIO = 0.16;
const RAIN_FLIGHT_RATIO = 0.22;
const RAIN_JITTER_RATIO = 0.18;
const RAIN_MAX_FLIGHT_SCALE = 1.18;
const GRID_LAND_TAIL_RATIO = 0.16;
const GRID_MOVE_RATIO = 0.34;
const PLAYCANVAS_REFERENCE_RADIUS = 10;
const GRID_REFERENCE_BLOCK_SIZE = 2;
const GRID_REFERENCE_DOT_SIZE = 0.01;
const DEFAULT_FORWARD = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 1, 0);
const DEFAULT_UP = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 1);
const BOX_DIRECTION_VECTORS = {
    'z-up': [
        0,
        0,
        1
    ],
    'z-down': [
        0,
        0,
        -1
    ],
    'x-plus': [
        1,
        0,
        0
    ],
    'x-minus': [
        -1,
        0,
        0
    ],
    'y-plus': [
        0,
        1,
        0
    ],
    'y-minus': [
        0,
        -1,
        0
    ]
};
function parseGSplatEffectTemplate(source) {
    const template = requireRecord(source, 'GSplat effect template must be an object');
    assertNoUnknownKeys(template, TEMPLATE_TOP_LEVEL_KEYS, 'GSplat effect template');
    if (template.kind !== GSPLAT_EFFECT_TEMPLATE_KIND) throw new GSplatEffectTemplateError(`Unsupported GSplat effect template kind: ${String(template.kind)}`);
    if (template.version !== GSPLAT_EFFECT_TEMPLATE_VERSION) throw new GSplatEffectTemplateError(`Unsupported GSplat effect template version: ${String(template.version)}`);
    const id = readNonEmptyString(template.id, 'id');
    const name = readNonEmptyString(template.name, 'name');
    const description = void 0 === template.description ? void 0 : readString(template.description, "description");
    const effectKey = readEffectKey(template.effectKey);
    const adaptive = readAdaptive(template.adaptive, effectKey);
    const params = parseParams(requireRecord(template.params, 'params'), effectKey, adaptive);
    const base = {
        kind: GSPLAT_EFFECT_TEMPLATE_KIND,
        version: GSPLAT_EFFECT_TEMPLATE_VERSION,
        id,
        name,
        ...void 0 !== description ? {
            description
        } : {},
        ...isAdaptiveEffectKey(effectKey) ? {
            adaptive
        } : {}
    };
    return {
        ...base,
        effectKey,
        params
    };
}
function createGSplatEffectFromTemplate(source, context) {
    const template = parseGSplatEffectTemplate(source);
    const runtime = normalizeRuntimeContext(context);
    const diagnostics = createDiagnostics(template.effectKey, runtime);
    switch(template.effectKey){
        case 'box-reveal':
        case 'box-hide':
        case 'box-tint':
        case 'box-untint':
            return {
                effect: createBoxScanEffect(template, runtime),
                diagnostics
            };
        case 'box-crop':
            return {
                effect: createBoxCropEffect(template, runtime),
                diagnostics
            };
        case 'reveal-radial':
            return {
                effect: createRadialEffect(template, runtime, diagnostics.sceneRadius),
                diagnostics
            };
        case 'reveal-rain':
            return {
                effect: createRainEffect(template, runtime, diagnostics.sceneRadius),
                diagnostics
            };
        case 'reveal-grid':
            return {
                effect: createGridEffect(template, runtime, diagnostics.sceneRadius),
                diagnostics
            };
        case 'obb-double-wave':
            return {
                effect: createObbDoubleWaveEffect(template, runtime),
                diagnostics
            };
        case 'visual-electronic':
        case 'visual-deep-meditation':
        case 'visual-waves':
        case 'visual-flare':
        case 'visual-disintegrate':
            return {
                effect: createVisualShowcaseEffect(template, runtime),
                diagnostics
            };
        case 'reveal-magic':
        case 'reveal-spread':
        case 'reveal-unroll':
        case 'reveal-twister':
            return {
                effect: createRevealShowcaseEffect(template, runtime, diagnostics.sceneRadius),
                diagnostics
            };
        case 'dissolve-drift':
            return {
                effect: createDissolveDriftEffect(template, runtime),
                diagnostics
            };
    }
}
function parseParams(params, effectKey, adaptive) {
    switch(effectKey){
        case 'box-reveal':
        case 'box-hide':
        case 'box-tint':
        case 'box-untint':
            return parseBoxScanParams(params);
        case 'box-crop':
            return parseBoxCropParams(params);
        case 'reveal-radial':
        case 'obb-double-wave':
            return adaptive ? parseRevealWaveParams(params) : parseRevealWaveManualParams(params);
        case 'reveal-rain':
            return adaptive ? parseRainParams(params) : parseRainManualParams(params);
        case 'reveal-grid':
            return adaptive ? parseGridParams(params) : parseGridManualParams(params);
        case 'visual-electronic':
        case 'visual-deep-meditation':
        case 'visual-waves':
        case 'visual-flare':
        case 'visual-disintegrate':
            return parseVisualShowcaseParams(params);
        case 'reveal-magic':
        case 'reveal-spread':
        case 'reveal-unroll':
        case 'reveal-twister':
            return parseRevealShowcaseParams(params);
        case 'dissolve-drift':
            return parseDissolveDriftParams(params);
    }
}
function readAdaptive(value, effectKey) {
    if (void 0 === value) return true;
    if (!isAdaptiveEffectKey(effectKey)) throw new GSplatEffectTemplateError(`adaptive is not supported for effectKey: ${effectKey}`);
    if ('boolean' != typeof value) throw new GSplatEffectTemplateError('adaptive must be a boolean');
    return value;
}
function isAdaptiveEffectKey(effectKey) {
    return 'reveal-radial' === effectKey || 'reveal-rain' === effectKey || 'reveal-grid' === effectKey || 'obb-double-wave' === effectKey;
}
function parseBoxScanParams(params) {
    assertNoUnknownKeys(params, BOX_SCAN_PARAM_KEYS, 'params');
    return {
        size: readNumber(params.size, NUMERIC_LIMITS.boxSize, 'params.size', 4),
        direction: readEnum(params.direction, GSPLAT_EFFECT_TEMPLATE_BOX_DIRECTIONS, 'params.direction', 'z-up'),
        duration: readNumber(params.duration, NUMERIC_LIMITS.boxDuration, 'params.duration', 3.5),
        tintColor: readHexColor(params.tintColor, 'params.tintColor', '#00ffff'),
        edgeColor: readHexColor(params.edgeColor, 'params.edgeColor', '#ffff00')
    };
}
function parseBoxCropParams(params) {
    assertNoUnknownKeys(params, BOX_CROP_PARAM_KEYS, 'params');
    return {
        size: readNumber(params.size, NUMERIC_LIMITS.boxSize, 'params.size', 4),
        edgeScaleFactor: readNumber(params.edgeScaleFactor, NUMERIC_LIMITS.edgeScaleFactor, 'params.edgeScaleFactor', 0.45)
    };
}
function parseRevealWaveParams(params) {
    assertNoUnknownKeys(params, REVEAL_WAVE_PARAM_KEYS, 'params');
    const parsed = {
        duration: readNumber(params.duration, NUMERIC_LIMITS.revealDuration, 'params.duration', DEFAULT_REVEAL_DURATION),
        dotTint: readColorControl(params.dotTint, 'params.dotTint', DEFAULT_COLOR_CONTROLS.cyan),
        waveTint: readColorControl(params.waveTint, 'params.waveTint', DEFAULT_COLOR_CONTROLS.orange),
        intensity: readNumber(params.intensity, NUMERIC_LIMITS.revealIntensity, 'params.intensity', 1)
    };
    return parsed;
}
function parseRevealWaveManualParams(params) {
    assertNoUnknownKeys(params, GSPLAT_EFFECT_TEMPLATE_REVEAL_WAVE_MANUAL_PARAM_KEYS, 'params');
    return {
        speed: readNumber(params.speed, NUMERIC_LIMITS.revealSpeed, 'params.speed', 3.5),
        acceleration: readNumber(params.acceleration, NUMERIC_LIMITS.revealAcceleration, 'params.acceleration', 0),
        delay: readNumber(params.delay, NUMERIC_LIMITS.revealDelay, 'params.delay', 0.15),
        dotTint: readColorControl(params.dotTint, 'params.dotTint', DEFAULT_COLOR_CONTROLS.cyan),
        waveTint: readColorControl(params.waveTint, 'params.waveTint', DEFAULT_COLOR_CONTROLS.orange),
        oscillationIntensity: readNumber(params.oscillationIntensity, NUMERIC_LIMITS.unitIntensity, 'params.oscillationIntensity', 0.2),
        bandWidth: readNumber(params.bandWidth, NUMERIC_LIMITS.revealBandWidth, 'params.bandWidth', 1)
    };
}
function parseRainParams(params) {
    assertNoUnknownKeys(params, RAIN_PARAM_KEYS, 'params');
    const parsed = {
        duration: readNumber(params.duration, NUMERIC_LIMITS.revealDuration, 'params.duration', DEFAULT_REVEAL_DURATION),
        fallTint: readColorControl(params.fallTint, 'params.fallTint', DEFAULT_COLOR_CONTROLS.cyan),
        fallTintIntensity: readNumber(params.fallTintIntensity, NUMERIC_LIMITS.unitIntensity, 'params.fallTintIntensity', 0.2),
        hitTint: readColorControl(params.hitTint, 'params.hitTint', DEFAULT_COLOR_CONTROLS.redStrong),
        intensity: readNumber(params.intensity, NUMERIC_LIMITS.revealIntensity, 'params.intensity', 1)
    };
    return parsed;
}
function parseRainManualParams(params) {
    assertNoUnknownKeys(params, GSPLAT_EFFECT_TEMPLATE_RAIN_MANUAL_PARAM_KEYS, 'params');
    return {
        distance: readNumber(params.distance, NUMERIC_LIMITS.rainDistance, 'params.distance', 8),
        speed: readNumber(params.speed, NUMERIC_LIMITS.revealSpeed, 'params.speed', 8),
        acceleration: readNumber(params.acceleration, NUMERIC_LIMITS.revealAcceleration, 'params.acceleration', 0),
        flightTime: readNumber(params.flightTime, NUMERIC_LIMITS.rainFlightTime, 'params.flightTime', 2),
        rainSize: readNumber(params.rainSize, NUMERIC_LIMITS.rainSize, 'params.rainSize', 0.015),
        rotation: readNumber(params.rotation, NUMERIC_LIMITS.rainRotation, 'params.rotation', 0.9),
        fallTint: readColorControl(params.fallTint, 'params.fallTint', DEFAULT_COLOR_CONTROLS.cyan),
        fallTintIntensity: readNumber(params.fallTintIntensity, NUMERIC_LIMITS.unitIntensity, 'params.fallTintIntensity', 0.2),
        hitTint: readColorControl(params.hitTint, 'params.hitTint', DEFAULT_COLOR_CONTROLS.redStrong),
        hitDuration: readNumber(params.hitDuration, NUMERIC_LIMITS.rainHitDuration, 'params.hitDuration', 0.5)
    };
}
function parseGridParams(params) {
    assertNoUnknownKeys(params, GRID_PARAM_KEYS, 'params');
    return {
        duration: readNumber(params.duration, NUMERIC_LIMITS.revealDuration, 'params.duration', DEFAULT_GRID_REVEAL_DURATION),
        moveTint: readColorControl(params.moveTint, 'params.moveTint', DEFAULT_COLOR_CONTROLS.magenta),
        moveTintIntensity: readNumber(params.moveTintIntensity, NUMERIC_LIMITS.unitIntensity, 'params.moveTintIntensity', 0.2),
        landTint: readColorControl(params.landTint, 'params.landTint', DEFAULT_COLOR_CONTROLS.yellowStrong),
        intensity: readNumber(params.intensity, NUMERIC_LIMITS.revealIntensity, 'params.intensity', 1)
    };
}
function parseGridManualParams(params) {
    assertNoUnknownKeys(params, GSPLAT_EFFECT_TEMPLATE_GRID_MANUAL_PARAM_KEYS, 'params');
    return {
        blockSize: readNumber(params.blockSize, NUMERIC_LIMITS.gridBlockSize, 'params.blockSize', GRID_REFERENCE_BLOCK_SIZE),
        delay: readNumber(params.delay, NUMERIC_LIMITS.gridDelay, 'params.delay', 0.04),
        duration: readNumber(params.duration, NUMERIC_LIMITS.gridDuration, 'params.duration', 1),
        dotSize: readNumber(params.dotSize, NUMERIC_LIMITS.gridDotSize, 'params.dotSize', GRID_REFERENCE_DOT_SIZE),
        moveTint: readColorControl(params.moveTint, 'params.moveTint', DEFAULT_COLOR_CONTROLS.magenta),
        moveTintIntensity: readNumber(params.moveTintIntensity, NUMERIC_LIMITS.unitIntensity, 'params.moveTintIntensity', 0.2),
        landTint: readColorControl(params.landTint, 'params.landTint', DEFAULT_COLOR_CONTROLS.yellowStrong),
        landDuration: readNumber(params.landDuration, NUMERIC_LIMITS.gridLandDuration, 'params.landDuration', 0.6)
    };
}
function parseVisualShowcaseParams(params) {
    assertNoUnknownKeys(params, VISUAL_SHOWCASE_PARAM_KEYS, 'params');
    return {
        intensity: readNumber(params.intensity, NUMERIC_LIMITS.visualIntensity, 'params.intensity', 1),
        timeScale: readNumber(params.timeScale, NUMERIC_LIMITS.timeScale, 'params.timeScale', 1),
        swayAmplitude: readNumber(params.swayAmplitude, NUMERIC_LIMITS.swayAmplitude, 'params.swayAmplitude', 0.2),
        swaySpeed: readNumber(params.swaySpeed, NUMERIC_LIMITS.swaySpeed, 'params.swaySpeed', 2),
        flickerColor: readColorControl(params.flickerColor, 'params.flickerColor', {
            color: '#0080b3',
            intensity: 1
        })
    };
}
function parseRevealShowcaseParams(params) {
    assertNoUnknownKeys(params, REVEAL_SHOWCASE_PARAM_KEYS, 'params');
    return {
        timeScale: readNumber(params.timeScale, NUMERIC_LIMITS.timeScale, 'params.timeScale', 1),
        motionScale: readNumber(params.motionScale, NUMERIC_LIMITS.motionScale, 'params.motionScale', 1),
        duration: readNumber(params.duration, NUMERIC_LIMITS.showcaseDuration, 'params.duration', 6)
    };
}
function parseDissolveDriftParams(params) {
    assertNoUnknownKeys(params, DISSOLVE_DRIFT_PARAM_KEYS, 'params');
    return {
        speed: readNumber(params.speed, NUMERIC_LIMITS.dissolveSpeed, 'params.speed', 1),
        motionScale: readNumber(params.motionScale, NUMERIC_LIMITS.motionScale, 'params.motionScale', 1)
    };
}
function normalizeRuntimeContext(context) {
    const record = requireRecord(context, 'runtime context must be an object');
    if ('effect-local' !== record.effectSpace) throw new GSplatEffectTemplateError('runtime context effectSpace must be "effect-local"');
    return {
        center: readVector3(record.center, 'runtime.center'),
        effectBounds: readOptionalBox3(record.effectBounds, 'runtime.effectBounds'),
        sceneBounds: readOptionalBox3(record.sceneBounds, 'runtime.sceneBounds'),
        sceneRadius: readOptionalPositiveNumber(record.sceneRadius, 'runtime.sceneRadius'),
        defaultSceneRadius: readPositiveNumber(record.defaultSceneRadius, 'runtime.defaultSceneRadius', DEFAULT_SCENE_RADIUS),
        minRevealRadius: readPositiveNumber(record.minRevealRadius, 'runtime.minRevealRadius', DEFAULT_MIN_REVEAL_RADIUS),
        camera: void 0 === record.camera || null === record.camera ? null : readCameraContext(record.camera)
    };
}
function createDiagnostics(effectKey, runtime) {
    const radiusInfo = resolveSceneRadius(runtime);
    return {
        effectKey,
        sceneRadius: radiusInfo.radius,
        usedEffectBounds: radiusInfo.usedEffectBounds,
        usedSceneBounds: radiusInfo.usedSceneBounds
    };
}
function createBoxScanEffect(template, runtime) {
    const params = template.params;
    const targetBox = createTargetBox(runtime.center, params.size);
    const sweepBox = createSweepBox(targetBox, runtime.effectBounds ?? runtime.sceneBounds);
    const direction = createBoxDirection(params.direction, shouldReverseBoxScan(template.effectKey));
    const tintColor = 'box-tint' === template.effectKey || 'box-untint' === template.effectKey ? createColor(params.tintColor) : new __WEBPACK_EXTERNAL_MODULE_three__.Color(1, 1, 1);
    return new __WEBPACK_EXTERNAL_MODULE__GSplatBoxShaderEffect_js_d0d81da3__.GSplatBoxShaderEffect({
        enabled: false,
        aabbMin: toTuple(targetBox.min),
        aabbMax: toTuple(targetBox.max),
        sweepMin: toTuple(sweepBox.min),
        sweepMax: toTuple(sweepBox.max),
        direction: toTuple(direction),
        duration: params.duration,
        visibleStart: 'box-reveal' !== template.effectKey,
        visibleEnd: 'box-hide' !== template.effectKey,
        interval: 'box-reveal' === template.effectKey || 'box-hide' === template.effectKey ? 0.1 : 0.05,
        invertTint: 'box-untint' === template.effectKey,
        baseTint: new __WEBPACK_EXTERNAL_MODULE_three__.Color(1, 1, 1),
        edgeTint: createColor(params.edgeColor, BOX_EDGE_TINT_INTENSITY),
        tint: tintColor
    });
}
function createBoxCropEffect(template, runtime) {
    const targetBox = createTargetBox(runtime.center, template.params.size);
    return new __WEBPACK_EXTERNAL_MODULE__GSplatCropShaderEffect_js_cf9c5c64__.GSplatCropShaderEffect({
        enabled: false,
        aabbMin: toTuple(targetBox.min),
        aabbMax: toTuple(targetBox.max),
        edgeScaleFactor: template.params.edgeScaleFactor
    });
}
function createRadialEffect(template, runtime, sceneRadius) {
    const scale = createRevealAdaptiveScale(runtime, sceneRadius);
    if (!template.adaptive) {
        const params = template.params;
        return new __WEBPACK_EXTERNAL_MODULE__GSplatRevealRadial_js_32de35d4__.GSplatRevealRadial({
            enabled: false,
            center: toTuple(runtime.center),
            speed: params.speed,
            acceleration: params.acceleration,
            delay: params.delay,
            endRadius: scale.revealRadius,
            dotTint: createColorControlColor(params.dotTint),
            waveTint: createColorControlColor(params.waveTint),
            oscillationIntensity: params.oscillationIntensity,
            bandWidth: params.bandWidth
        });
    }
    const params = template.params;
    const intensity = Math.max(0, params.intensity);
    const timing = createDoubleWaveTiming(params.duration, scale.revealRadius);
    return new __WEBPACK_EXTERNAL_MODULE__GSplatRevealRadial_js_32de35d4__.GSplatRevealRadial({
        enabled: false,
        center: toTuple(runtime.center),
        speed: timing.speed,
        acceleration: 0,
        delay: timing.delay,
        endRadius: scale.revealRadius,
        dotTint: createColorControlColor(params.dotTint),
        waveTint: createColorControlColor(params.waveTint),
        oscillationIntensity: 0.18 * scale.detailScale * intensity,
        bandWidth: clampNumber(0.22 * scale.detailScale, {
            min: 0.025 * scale.revealRadius,
            max: getRadialBandMax(scale.revealRadius)
        }),
        dotSize: 0.035 * scale.detailScale * Math.max(0.35, intensity),
        maxRoundSize: 0.06 * scale.detailScale * Math.max(0.5, intensity),
        revealBlendDistance: clampNumber(0.18 * scale.detailScale, {
            min: 0.02 * scale.revealRadius,
            max: getRadialBlendMax(scale.revealRadius)
        })
    });
}
function createRainEffect(template, runtime, sceneRadius) {
    const scale = createRevealAdaptiveScale(runtime, sceneRadius);
    if (!template.adaptive) {
        const params = template.params;
        return new __WEBPACK_EXTERNAL_MODULE__GSplatRevealRain_js_91179055__.GSplatRevealRain({
            enabled: false,
            center: toTuple(runtime.center),
            distance: params.distance,
            speed: params.speed,
            acceleration: params.acceleration,
            flightTime: params.flightTime,
            rainSize: params.rainSize,
            rotation: params.rotation,
            fallTint: createColorControlColor(params.fallTint),
            fallTintIntensity: params.fallTintIntensity,
            hitTint: createColorControlColor(params.hitTint),
            hitDuration: params.hitDuration,
            endRadius: scale.revealRadius
        });
    }
    const params = template.params;
    const intensity = Math.max(0, params.intensity);
    const distance = getRainDistance(scale.revealRadius, scale.viewRadius, scale.detailScale, intensity);
    const timing = createRainTiming(params.duration, scale.revealRadius, scale.viewRadius);
    return new __WEBPACK_EXTERNAL_MODULE__GSplatRevealRain_js_91179055__.GSplatRevealRain({
        enabled: false,
        center: toTuple(runtime.center),
        distance,
        speed: timing.speed,
        acceleration: timing.acceleration,
        spreadTime: timing.spreadTime,
        spreadCurve: timing.spreadCurve,
        waveRadius: timing.waveRadius,
        flightTime: timing.flightTime,
        dropJitter: timing.dropJitter,
        rainSize: getRainSize(scale.revealRadius, scale.viewRadius, scale.detailScale, intensity),
        maxRoundSize: getRainMaxRoundSize(scale.revealRadius, scale.viewRadius, scale.detailScale, intensity),
        fallVisibleRatio: 0.45,
        rotation: 0,
        fallTint: createColorControlColor(params.fallTint),
        fallTintIntensity: params.fallTintIntensity,
        hitTint: createColorControlColor(params.hitTint),
        hitDuration: timing.hitDuration,
        endRadius: scale.revealRadius,
        startRadius: 0.15 * scale.revealRadius
    });
}
function createGridEffect(template, runtime, sceneRadius) {
    const scale = createRevealAdaptiveScale(runtime, sceneRadius);
    if (!template.adaptive) {
        const params = template.params;
        return new __WEBPACK_EXTERNAL_MODULE__GSplatRevealGridEruption_js_19a7a3b1__.GSplatRevealGridEruption({
            enabled: false,
            center: toTuple(runtime.center),
            blockSize: params.blockSize,
            delay: params.delay,
            duration: params.duration,
            dotSize: params.dotSize,
            moveTint: createColorControlColor(params.moveTint),
            moveTintIntensity: params.moveTintIntensity,
            landTint: createColorControlColor(params.landTint),
            landDuration: params.landDuration,
            endRadius: scale.revealRadius
        });
    }
    const params = template.params;
    const intensity = Math.max(0, params.intensity);
    const timing = createGridTiming(params.duration, scale.revealRadius);
    return new __WEBPACK_EXTERNAL_MODULE__GSplatRevealGridEruption_js_19a7a3b1__.GSplatRevealGridEruption({
        enabled: false,
        center: toTuple(runtime.center),
        blockSize: getGridBlockSize(scale.revealRadius),
        delay: timing.delay,
        duration: timing.blockMoveDuration,
        dotSize: getGridDotSize(scale.revealRadius, scale.viewRadius, intensity),
        moveTint: createColorControlColor(params.moveTint),
        moveTintIntensity: params.moveTintIntensity,
        landTint: createColorControlColor(params.landTint),
        landDuration: timing.landDuration,
        endRadius: scale.revealRadius
    });
}
function createObbDoubleWaveEffect(template, runtime) {
    const bounds = runtime.effectBounds ?? runtime.sceneBounds;
    if (!bounds || bounds.isEmpty()) throw new GSplatEffectTemplateError('obb-double-wave requires non-empty effect-local bounds');
    if (!runtime.camera) throw new GSplatEffectTemplateError('obb-double-wave requires effect-local camera context');
    const adaptiveObb = createCameraAdaptiveObb({
        cameraPosition: runtime.camera.position,
        cameraTarget: runtime.camera.target,
        up: runtime.camera.up,
        bounds
    });
    const sweepLength = Math.max(EPSILON, adaptiveObb.sweepEnd - adaptiveObb.sweepStart);
    const scale = createRevealAdaptiveScale(runtime, sweepLength);
    if (!template.adaptive) {
        const params = template.params;
        const effect = new __WEBPACK_EXTERNAL_MODULE__GSplatObbShaderEffect_js_2fea64c1__.GSplatObbShaderEffect({
            enabled: false,
            mode: 'double-wave-reveal',
            origin: adaptiveObb.origin,
            axisX: adaptiveObb.axisX,
            axisY: adaptiveObb.axisY,
            axisZ: adaptiveObb.axisZ,
            min: adaptiveObb.min,
            max: adaptiveObb.max,
            direction: adaptiveObb.direction,
            sweepStart: adaptiveObb.sweepStart,
            sweepEnd: adaptiveObb.sweepEnd,
            speed: params.speed,
            acceleration: params.acceleration,
            delay: params.delay,
            dotTint: createColorControlColor(params.dotTint),
            waveTint: createColorControlColor(params.waveTint),
            oscillationIntensity: params.oscillationIntensity,
            bandWidth: params.bandWidth
        });
        effect.diagnostics = {
            effectKey: template.effectKey,
            bounds: {
                min: toTuple(bounds.min),
                max: toTuple(bounds.max),
                size: toTuple(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().subVectors(bounds.max, bounds.min))
            },
            runtime: {
                center: toTuple(runtime.center),
                sceneRadius: runtime.sceneRadius,
                defaultSceneRadius: runtime.defaultSceneRadius,
                minRevealRadius: runtime.minRevealRadius
            },
            camera: {
                position: toTuple(runtime.camera.position),
                target: toTuple(runtime.camera.target),
                up: toTuple(runtime.camera.up)
            },
            adaptiveObb: {
                origin: adaptiveObb.origin,
                axisX: adaptiveObb.axisX,
                axisY: adaptiveObb.axisY,
                axisZ: adaptiveObb.axisZ,
                min: adaptiveObb.min,
                max: adaptiveObb.max,
                direction: adaptiveObb.direction,
                sweepStart: adaptiveObb.sweepStart,
                sweepEnd: adaptiveObb.sweepEnd,
                sweepLength
            },
            adaptiveScale: {
                revealRadius: scale.revealRadius,
                viewRadius: scale.viewRadius,
                detailScale: scale.detailScale
            },
            manual: {
                speed: params.speed,
                acceleration: params.acceleration,
                delay: params.delay,
                bandWidth: params.bandWidth,
                oscillationIntensity: params.oscillationIntensity
            }
        };
        return effect;
    }
    const params = template.params;
    const intensity = Math.max(0, params.intensity);
    const timing = createDoubleWaveTiming(params.duration, sweepLength);
    const bandWidth = clampNumber(0.22 * scale.detailScale, {
        min: 0.025 * scale.revealRadius,
        max: getRadialBandMax(scale.revealRadius)
    });
    const dotSize = 0.035 * scale.detailScale * Math.max(0.35, intensity);
    const maxRoundSize = 0.06 * scale.detailScale * Math.max(0.5, intensity);
    const revealBlendDistance = clampNumber(0.18 * scale.detailScale, {
        min: 0.02 * scale.revealRadius,
        max: getRadialBlendMax(scale.revealRadius)
    });
    const effect = new __WEBPACK_EXTERNAL_MODULE__GSplatObbShaderEffect_js_2fea64c1__.GSplatObbShaderEffect({
        enabled: false,
        mode: 'double-wave-reveal',
        origin: adaptiveObb.origin,
        axisX: adaptiveObb.axisX,
        axisY: adaptiveObb.axisY,
        axisZ: adaptiveObb.axisZ,
        min: adaptiveObb.min,
        max: adaptiveObb.max,
        direction: adaptiveObb.direction,
        sweepStart: adaptiveObb.sweepStart,
        sweepEnd: adaptiveObb.sweepEnd,
        speed: timing.speed,
        acceleration: 0,
        delay: timing.delay,
        dotTint: createColorControlColor(params.dotTint),
        waveTint: createColorControlColor(params.waveTint),
        oscillationIntensity: 0.18 * scale.detailScale * intensity,
        bandWidth,
        dotSize,
        maxRoundSize,
        revealBlendDistance
    });
    effect.diagnostics = {
        effectKey: template.effectKey,
        bounds: {
            min: toTuple(bounds.min),
            max: toTuple(bounds.max),
            size: toTuple(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().subVectors(bounds.max, bounds.min))
        },
        runtime: {
            center: toTuple(runtime.center),
            sceneRadius: runtime.sceneRadius,
            defaultSceneRadius: runtime.defaultSceneRadius,
            minRevealRadius: runtime.minRevealRadius
        },
        camera: {
            position: toTuple(runtime.camera.position),
            target: toTuple(runtime.camera.target),
            up: toTuple(runtime.camera.up)
        },
        adaptiveObb: {
            origin: adaptiveObb.origin,
            axisX: adaptiveObb.axisX,
            axisY: adaptiveObb.axisY,
            axisZ: adaptiveObb.axisZ,
            min: adaptiveObb.min,
            max: adaptiveObb.max,
            direction: adaptiveObb.direction,
            sweepStart: adaptiveObb.sweepStart,
            sweepEnd: adaptiveObb.sweepEnd,
            sweepLength
        },
        adaptiveScale: {
            revealRadius: scale.revealRadius,
            viewRadius: scale.viewRadius,
            detailScale: scale.detailScale
        },
        derived: {
            duration: params.duration,
            speed: timing.speed,
            delay: timing.delay,
            bandWidth,
            dotSize,
            maxRoundSize,
            revealBlendDistance,
            oscillationIntensity: 0.18 * scale.detailScale * intensity
        }
    };
    return effect;
}
function createVisualShowcaseEffect(template, runtime) {
    const params = template.params;
    const options = {
        enabled: false,
        center: toTuple(runtime.center),
        intensity: params.intensity,
        timeScale: params.timeScale,
        effectScale: createShowcaseEffectScale(runtime)
    };
    switch(template.effectKey){
        case 'visual-electronic':
            return new __WEBPACK_EXTERNAL_MODULE__GSplatVisualElectronicEffect_js_fe459628__.GSplatVisualElectronicEffect({
                ...options,
                swayAmplitude: params.swayAmplitude,
                swaySpeed: params.swaySpeed,
                flickerColor: createColorControlColor(params.flickerColor ?? {
                    color: '#0080b3',
                    intensity: 1
                })
            });
        case 'visual-deep-meditation':
            return new __WEBPACK_EXTERNAL_MODULE__GSplatVisualDeepMeditationEffect_js_cc80e9a3__.GSplatVisualDeepMeditationEffect(options);
        case 'visual-waves':
            return new __WEBPACK_EXTERNAL_MODULE__GSplatVisualWavesEffect_js_0270512a__.GSplatVisualWavesEffect(options);
        case 'visual-flare':
            return new __WEBPACK_EXTERNAL_MODULE__GSplatVisualFlareEffect_js_a9db39b4__.GSplatVisualFlareEffect(options);
        case 'visual-disintegrate':
            return new __WEBPACK_EXTERNAL_MODULE__GSplatVisualDisintegrateEffect_js_46ff0157__.GSplatVisualDisintegrateEffect(options);
    }
}
function createRevealShowcaseEffect(template, runtime, sceneRadius) {
    const params = template.params;
    const options = {
        enabled: false,
        center: toTuple(runtime.center),
        timeScale: params.timeScale,
        motionScale: params.motionScale,
        duration: params.duration
    };
    switch(template.effectKey){
        case 'reveal-magic':
            return new __WEBPACK_EXTERNAL_MODULE__GSplatRevealMagicEffect_js_42867818__.GSplatRevealMagicEffect({
                ...options,
                revealRadius: sceneRadius
            });
        case 'reveal-spread':
            return new __WEBPACK_EXTERNAL_MODULE__GSplatRevealSpreadEffect_js_f9c5792b__.GSplatRevealSpreadEffect(options);
        case 'reveal-unroll':
            return new __WEBPACK_EXTERNAL_MODULE__GSplatRevealUnrollEffect_js_e0d8ed33__.GSplatRevealUnrollEffect({
                ...options,
                heightRange: createUnrollHeightRange(runtime.effectBounds ?? runtime.sceneBounds)
            });
        case 'reveal-twister':
            return new __WEBPACK_EXTERNAL_MODULE__GSplatRevealTwisterEffect_js_71144017__.GSplatRevealTwisterEffect({
                ...options,
                ...createTwisterBounds(runtime.effectBounds ?? runtime.sceneBounds, runtime.center, sceneRadius, runtime.camera)
            });
    }
}
function createUnrollHeightRange(bounds) {
    if (!bounds || bounds.isEmpty()) return;
    return [
        -bounds.max.z,
        -bounds.min.z
    ];
}
function createTwisterBounds(bounds, center, sceneRadius, camera) {
    if (!bounds || bounds.isEmpty()) return {};
    const boundsRadius = Math.max(Math.abs(bounds.min.x - center.x), Math.abs(bounds.max.x - center.x), Math.abs(bounds.min.y - center.y), Math.abs(bounds.max.y - center.y));
    const cameraRadius = camera ? camera.position.distanceTo(camera.target) : sceneRadius;
    const horizontalRadius = Math.max(1, Math.min(boundsRadius, sceneRadius, cameraRadius));
    return {
        funnelHeight: Math.max(1, Math.min(bounds.max.z - bounds.min.z, 2 * horizontalRadius)),
        horizontalRadius,
        revealRadius: Math.max(1, boundsRadius),
        heightRange: [
            bounds.min.z - center.z,
            bounds.max.z - center.z
        ]
    };
}
function createShowcaseEffectScale(runtime) {
    const radius = resolveSceneRadius(runtime).radius;
    const cameraRadius = runtime.camera ? runtime.camera.position.distanceTo(runtime.camera.target) : radius;
    return Math.max(1, Math.min(radius, cameraRadius));
}
function createRevealAdaptiveScale(runtime, sceneRadius) {
    const modelRadius = Math.max(EPSILON, sceneRadius);
    const cameraRadius = runtime.camera ? runtime.camera.position.distanceTo(runtime.camera.target) : modelRadius;
    const viewRadius = Math.max(EPSILON, Math.min(modelRadius, Math.max(cameraRadius, EPSILON)));
    const detailScale = Math.max(EPSILON, Math.min(modelRadius, viewRadius));
    return {
        modelRadius,
        viewRadius,
        revealRadius: modelRadius,
        detailScale
    };
}
function createDoubleWaveTiming(duration, sweepDistance) {
    const delay = Math.min(duration * DOUBLE_WAVE_DELAY_RATIO, DOUBLE_WAVE_MAX_DELAY);
    const sweepTime = Math.max(EPSILON, duration - delay);
    return {
        speed: Math.max(EPSILON, sweepDistance) / sweepTime,
        delay
    };
}
function createRainTiming(duration, revealRadius, viewRadius) {
    const hitDuration = clampNumber(duration * RAIN_TAIL_RATIO, {
        min: 0.5,
        max: 0.9
    });
    const flightTime = clampNumber(duration * RAIN_FLIGHT_RATIO, {
        min: 0.35,
        max: 0.45 * duration
    });
    const dropJitter = clampNumber(duration * RAIN_JITTER_RATIO, {
        min: 0,
        max: 0.8 * flightTime
    });
    const spreadTime = Math.max(EPSILON, duration - flightTime * RAIN_MAX_FLIGHT_SCALE - dropJitter - hitDuration);
    const wave = createRainWaveTiming(revealRadius, viewRadius, spreadTime);
    return {
        speed: wave.speed,
        acceleration: wave.acceleration,
        spreadTime,
        spreadCurve: wave.spreadCurve,
        waveRadius: Math.max(EPSILON, revealRadius),
        flightTime,
        dropJitter,
        hitDuration
    };
}
function createRainWaveTiming(revealRadius, viewRadius, spreadTime) {
    const radius = Math.max(EPSILON, revealRadius);
    const localRadius = clampNumber(viewRadius, {
        min: EPSILON,
        max: radius
    });
    const viewRatio = localRadius / radius;
    const localTimeRatio = viewRatio + (1 - viewRatio) * 0.45;
    if (localTimeRatio >= 0.98) return {
        speed: radius / spreadTime,
        acceleration: 0,
        spreadCurve: 1
    };
    return {
        speed: radius / spreadTime,
        acceleration: 0,
        spreadCurve: clampNumber(Math.log(localTimeRatio) / Math.log(viewRatio), {
            min: 0.28,
            max: 1
        })
    };
}
function createGridTiming(duration, revealRadius) {
    const landDuration = clampNumber(duration * GRID_LAND_TAIL_RATIO, {
        min: 0.3,
        max: 0.7
    });
    const blockMoveDuration = clampNumber(duration * GRID_MOVE_RATIO, {
        min: 0.25,
        max: 0.6 * duration
    });
    const spreadTime = Math.max(EPSILON, duration - blockMoveDuration - landDuration);
    return {
        delay: spreadTime / Math.max(EPSILON, revealRadius),
        blockMoveDuration,
        landDuration
    };
}
function getRadialBandMax(revealRadius) {
    return Math.min(0.18 * revealRadius, 0.22 * Math.sqrt(revealRadius));
}
function getRadialBlendMax(revealRadius) {
    return Math.min(0.12 * revealRadius, 0.16 * Math.sqrt(revealRadius));
}
function getRainDistance(revealRadius, viewRadius, detailScale, intensity) {
    const styleScale = Math.max(0.45, intensity);
    const viewRatio = clampNumber(viewRadius / Math.max(EPSILON, revealRadius), {
        min: 0,
        max: 1
    });
    const overviewWeight = smoothstep(0.35, 0.85, viewRatio);
    const localMin = 0.9 * detailScale;
    const overviewMin = 0.9 * revealRadius;
    const minDistance = mix(localMin, overviewMin, overviewWeight);
    const localMax = Math.max(localMin, 2.7 * Math.sqrt(detailScale));
    const overviewMax = Math.max(overviewMin, 2.7 * Math.sqrt(revealRadius));
    const maxDistance = mix(localMax, overviewMax, overviewWeight);
    return clampNumber(3.6 * detailScale * styleScale, {
        min: minDistance,
        max: maxDistance
    });
}
function getRainSize(revealRadius, viewRadius, detailScale, intensity) {
    const styleScale = Math.max(0.35, intensity);
    const baseSize = 0.035 * detailScale * styleScale;
    const viewRatio = clampNumber(viewRadius / Math.max(EPSILON, revealRadius), {
        min: 0,
        max: 1
    });
    const overviewWeight = smoothstep(0.35, 0.85, viewRatio);
    const localMax = Math.max(0.012 * detailScale, 0.045 * Math.sqrt(detailScale));
    const overviewMax = 0.035 * detailScale * styleScale;
    return Math.min(baseSize, mix(localMax, overviewMax, overviewWeight));
}
function getRainMaxRoundSize(revealRadius, viewRadius, detailScale, intensity) {
    const styleScale = Math.max(0.5, intensity);
    const baseSize = 0.06 * detailScale * styleScale;
    const viewRatio = clampNumber(viewRadius / Math.max(EPSILON, revealRadius), {
        min: 0,
        max: 1
    });
    const overviewWeight = smoothstep(0.35, 0.85, viewRatio);
    const localMax = Math.max(0.018 * detailScale, 0.065 * Math.sqrt(detailScale));
    const overviewMax = 0.06 * detailScale * styleScale;
    return Math.min(baseSize, mix(localMax, overviewMax, overviewWeight));
}
function smoothstep(edge0, edge1, value) {
    const t = clampNumber((value - edge0) / Math.max(EPSILON, edge1 - edge0), {
        min: 0,
        max: 1
    });
    return t * t * (3 - 2 * t);
}
function mix(a, b, t) {
    return a * (1 - t) + b * t;
}
function getGridScale(revealRadius) {
    return clampNumber(revealRadius / PLAYCANVAS_REFERENCE_RADIUS, {
        min: EPSILON,
        max: 1
    });
}
function getGridBlockSize(revealRadius) {
    return GRID_REFERENCE_BLOCK_SIZE * getGridScale(revealRadius);
}
function getGridDotSize(revealRadius, viewRadius, intensity) {
    const styleScale = Math.max(0.35, intensity);
    const referenceSize = GRID_REFERENCE_DOT_SIZE * getGridScale(revealRadius) * styleScale;
    const distanceSize = 0.006 * Math.sqrt(Math.max(EPSILON, viewRadius)) * styleScale;
    const maxSize = Math.max(referenceSize, 0.018 * Math.sqrt(Math.max(EPSILON, revealRadius)));
    return Math.min(Math.max(referenceSize, distanceSize), maxSize);
}
function createDissolveDriftEffect(template, runtime) {
    const params = template.params;
    return new __WEBPACK_EXTERNAL_MODULE__GSplatDissolveDriftEffect_js_64ca8d55__.GSplatDissolveDriftEffect({
        enabled: false,
        speed: params.speed,
        motionScale: params.motionScale,
        effectScale: createShowcaseEffectScale(runtime)
    });
}
function requireRecord(value, path) {
    if (!value || 'object' != typeof value || Array.isArray(value)) throw new GSplatEffectTemplateError(`${path} must be an object`);
    return value;
}
function assertNoUnknownKeys(record, allowedKeys, path) {
    const allowed = new Set(allowedKeys);
    const unknownKeys = Object.keys(record).filter((key)=>!allowed.has(key));
    if (unknownKeys.length > 0) throw new GSplatEffectTemplateError(`${path} contains unsupported fields: ${unknownKeys.join(', ')}`);
}
function readString(value, path) {
    if ('string' != typeof value) throw new GSplatEffectTemplateError(`${path} must be a string`);
    return value;
}
function readNonEmptyString(value, path) {
    const text = readString(value, path).trim();
    if (!text) throw new GSplatEffectTemplateError(`${path} must not be empty`);
    return text;
}
function readEffectKey(value) {
    if ('string' == typeof value && EFFECT_KEY_SET.has(value)) return value;
    throw new GSplatEffectTemplateError(`Unsupported GSplat effect template effectKey: ${String(value)}`);
}
function readNumber(value, limit, path, fallback) {
    if (void 0 === value) return fallback;
    if ('number' != typeof value || !Number.isFinite(value)) throw new GSplatEffectTemplateError(`${path} must be a finite number`);
    return clampNumber(value, limit);
}
function readEnum(value, allowedValues, path, fallback) {
    if (void 0 === value) return fallback;
    if ('string' == typeof value && allowedValues.includes(value)) return value;
    throw new GSplatEffectTemplateError(`${path} is not supported`);
}
function readHexColor(value, path, fallback) {
    if (void 0 === value) return fallback;
    if ('string' != typeof value) throw new GSplatEffectTemplateError(`${path} must be a hex color string`);
    return normalizeHexColor(value, path);
}
function readColorControl(value, path, fallback) {
    if (void 0 === value) return {
        ...fallback
    };
    const record = requireRecord(value, path);
    assertNoUnknownKeys(record, COLOR_CONTROL_KEYS, path);
    return {
        color: readHexColor(record.color, `${path}.color`, fallback.color),
        intensity: readNumber(record.intensity, NUMERIC_LIMITS.colorIntensity, `${path}.intensity`, fallback.intensity)
    };
}
function normalizeHexColor(value, path) {
    const hex = /^#?([0-9a-f]{6})$/i.exec(value.trim())?.[1];
    if (!hex) throw new GSplatEffectTemplateError(`${path} must be a 6-digit hex color`);
    return `#${hex.toLowerCase()}`;
}
function clampNumber(value, limit) {
    return Math.min(limit.max, Math.max(limit.min, value));
}
function readVector3(value, path) {
    if (Array.isArray(value)) {
        if (3 !== value.length) throw new GSplatEffectTemplateError(`${path} must contain exactly 3 numbers`);
        return new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(readFiniteNumber(value[0], `${path}[0]`), readFiniteNumber(value[1], `${path}[1]`), readFiniteNumber(value[2], `${path}[2]`));
    }
    const record = requireRecord(value, path);
    return new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(readFiniteNumber(record.x, `${path}.x`), readFiniteNumber(record.y, `${path}.y`), readFiniteNumber(record.z, `${path}.z`));
}
function readFiniteNumber(value, path) {
    if ('number' != typeof value || !Number.isFinite(value)) throw new GSplatEffectTemplateError(`${path} must be a finite number`);
    return value;
}
function readOptionalBox3(value, path) {
    if (null == value) return null;
    const record = requireRecord(value, path);
    const min = readVector3(record.min, `${path}.min`);
    const max = readVector3(record.max, `${path}.max`);
    if (max.x < min.x || max.y < min.y || max.z < min.z) throw new GSplatEffectTemplateError(`${path} must not be empty`);
    return new __WEBPACK_EXTERNAL_MODULE_three__.Box3(min, max);
}
function readOptionalPositiveNumber(value, path) {
    if (null == value) return null;
    return readPositiveNumber(value, path);
}
function readPositiveNumber(value, path, fallback) {
    if (void 0 === value) {
        if (void 0 === fallback) throw new GSplatEffectTemplateError(`${path} must be a positive finite number`);
        return fallback;
    }
    if ('number' != typeof value || !Number.isFinite(value) || value <= 0) throw new GSplatEffectTemplateError(`${path} must be a positive finite number`);
    return value;
}
function readCameraContext(value) {
    const record = requireRecord(value, 'runtime.camera');
    const position = readVector3(record.position, 'runtime.camera.position');
    const target = readVector3(record.target, 'runtime.camera.target');
    const up = readVector3(record.up, 'runtime.camera.up');
    if (up.lengthSq() <= EPSILON) throw new GSplatEffectTemplateError('runtime.camera.up must not be a zero vector');
    if (position.distanceToSquared(target) <= EPSILON) throw new GSplatEffectTemplateError('runtime.camera.position must not equal target');
    return {
        position,
        target,
        up: up.normalize()
    };
}
function createTargetBox(center, size) {
    const halfSize = 0.5 * size;
    return new __WEBPACK_EXTERNAL_MODULE_three__.Box3(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(center.x - halfSize, center.y - halfSize, center.z - halfSize), new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(center.x + halfSize, center.y + halfSize, center.z + halfSize));
}
function createSweepBox(targetBox, bounds) {
    if (!bounds || bounds.isEmpty()) return targetBox.clone();
    const sweepBox = targetBox.clone().intersect(bounds);
    return sweepBox.isEmpty() ? targetBox.clone() : sweepBox;
}
function createBoxDirection(direction, reverse) {
    const [x, y, z] = BOX_DIRECTION_VECTORS[direction];
    const sign = reverse ? -1 : 1;
    return new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(x * sign, y * sign, z * sign);
}
function shouldReverseBoxScan(effectKey) {
    return 'box-hide' === effectKey || 'box-untint' === effectKey;
}
function resolveSceneRadius(runtime) {
    if (null !== runtime.sceneRadius) return {
        radius: clampRevealRadius(runtime.sceneRadius),
        usedEffectBounds: false,
        usedSceneBounds: false
    };
    const bounds = runtime.effectBounds ?? runtime.sceneBounds;
    if (bounds && !bounds.isEmpty()) {
        const sphere = bounds.getBoundingSphere(new __WEBPACK_EXTERNAL_MODULE_three__.Sphere());
        return {
            radius: clampRevealRadius(Math.max(EPSILON, runtime.center.distanceTo(sphere.center) + sphere.radius)),
            usedEffectBounds: null !== runtime.effectBounds,
            usedSceneBounds: null === runtime.effectBounds && null !== runtime.sceneBounds
        };
    }
    return {
        radius: clampRevealRadius(Math.max(runtime.minRevealRadius, runtime.defaultSceneRadius)),
        usedEffectBounds: false,
        usedSceneBounds: false
    };
}
function clampRevealRadius(radius) {
    return Math.min(MAX_REVEAL_RADIUS, radius);
}
function createColor(hex, intensity = 1) {
    return new __WEBPACK_EXTERNAL_MODULE_three__.Color(hex).multiplyScalar(intensity);
}
function createColorControlColor(control) {
    return createColor(control.color, control.intensity);
}
function toTuple(value) {
    return [
        sanitizeZero(value.x),
        sanitizeZero(value.y),
        sanitizeZero(value.z)
    ];
}
function createCameraAdaptiveObb(options) {
    const up = normalizeOrFallback(options.up, DEFAULT_UP);
    const forward = computeHorizontalForward(options.cameraPosition, options.cameraTarget, up);
    const axisY = forward;
    const axisX = normalizeOrFallback(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().crossVectors(axisY, up), new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1, 0, 0));
    const axisZ = normalizeOrFallback(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().crossVectors(axisX, axisY), up);
    const origin = options.cameraPosition.clone();
    const localBounds = projectBoundsToObb(options.bounds, origin, axisX, axisY, axisZ);
    const fallbackSweepLength = getCameraAdaptiveObbFallbackSweepLength(options.bounds);
    const fallbackHalfExtent = 0.5 * fallbackSweepLength;
    const rawForwardLength = Math.max(0, localBounds.max.y);
    const sweepLength = rawForwardLength > 0.1 * fallbackSweepLength ? rawForwardLength : fallbackSweepLength;
    const minY = 0;
    const maxY = Math.max(sweepLength, localBounds.max.y, 0.001);
    const min = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(Math.min(localBounds.min.x, -fallbackHalfExtent), minY, Math.min(localBounds.min.z, -fallbackHalfExtent));
    const max = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(Math.max(localBounds.max.x, fallbackHalfExtent), maxY, Math.max(localBounds.max.z, fallbackHalfExtent));
    const sweepStart = 0;
    const sweepEnd = sweepStart + sweepLength;
    return {
        origin: toTuple(origin),
        axisX: toTuple(axisX),
        axisY: toTuple(axisY),
        axisZ: toTuple(axisZ),
        min: toTuple(min),
        max: toTuple(max),
        direction: [
            0,
            1,
            0
        ],
        sweepStart,
        sweepEnd
    };
}
function getCameraAdaptiveObbFallbackSweepLength(bounds) {
    if (!bounds || bounds.isEmpty()) return 0.001;
    const sphere = bounds.getBoundingSphere(new __WEBPACK_EXTERNAL_MODULE_three__.Sphere());
    return Math.max(0.001, 2 * sphere.radius);
}
function computeHorizontalForward(cameraPosition, cameraTarget, up) {
    const forward = cameraTarget.clone().sub(cameraPosition);
    forward.addScaledVector(up, -forward.dot(up));
    return normalizeOrFallback(forward, DEFAULT_FORWARD);
}
function normalizeOrFallback(value, fallback) {
    if (!value || value.lengthSq() < EPSILON) return fallback.clone().normalize();
    return value.clone().normalize();
}
function projectBoundsToObb(bounds, origin, axisX, axisY, axisZ) {
    if (!bounds || bounds.isEmpty()) return new __WEBPACK_EXTERNAL_MODULE_three__.Box3(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(-0.5, 0, -0.5), new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0.5, 1, 0.5));
    const localBounds = new __WEBPACK_EXTERNAL_MODULE_three__.Box3();
    for (const corner of getBoxCorners(bounds)){
        const delta = corner.sub(origin);
        localBounds.expandByPoint(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(delta.dot(axisX), delta.dot(axisY), delta.dot(axisZ)));
    }
    return localBounds;
}
function getBoxCorners(box) {
    const { min, max } = box;
    return [
        new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(min.x, min.y, min.z),
        new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(min.x, min.y, max.z),
        new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(min.x, max.y, min.z),
        new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(min.x, max.y, max.z),
        new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(max.x, min.y, min.z),
        new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(max.x, min.y, max.z),
        new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(max.x, max.y, min.z),
        new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(max.x, max.y, max.z)
    ];
}
function sanitizeZero(value) {
    return Math.abs(value) < 1e-12 ? 0 : value;
}
export { GSPLAT_EFFECT_TEMPLATE_BOX_DIRECTIONS, GSPLAT_EFFECT_TEMPLATE_GRID_MANUAL_PARAM_KEYS, GSPLAT_EFFECT_TEMPLATE_KEYS, GSPLAT_EFFECT_TEMPLATE_KIND, GSPLAT_EFFECT_TEMPLATE_RAIN_MANUAL_PARAM_KEYS, GSPLAT_EFFECT_TEMPLATE_REVEAL_WAVE_MANUAL_PARAM_KEYS, GSPLAT_EFFECT_TEMPLATE_VERSION, GSplatEffectTemplateError, createGSplatEffectFromTemplate, parseGSplatEffectTemplate };
