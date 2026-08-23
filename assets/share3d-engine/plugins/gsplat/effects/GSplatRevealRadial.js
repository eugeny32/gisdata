import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__ from "./effectUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__GSplatShaderEffect_js_a4503a18__ from "./GSplatShaderEffect.js";
const shaderGLSL = `
uniform float uTime;
uniform vec3 uCenter;
uniform float uSpeed;
uniform float uAcceleration;
uniform float uDelay;
uniform vec3 uDotTint;
uniform vec3 uWaveTint;
uniform float uOscillationIntensity;
uniform float uEndRadius;
uniform float uBandWidth;
uniform float uDotSize;
uniform float uMaxRoundSize;
uniform float uRevealBlendDistance;

float g_dist;
float g_dotWavePos;
float g_liftTime;
float g_liftWavePos;

void initShared(vec3 center) {
  g_dist = length(center - uCenter);
  g_dotWavePos = uSpeed * uTime + 0.5 * uAcceleration * uTime * uTime;
  g_liftTime = max(0.0, uTime - uDelay);
  g_liftWavePos = uSpeed * g_liftTime + 0.5 * uAcceleration * g_liftTime * g_liftTime;
}

float hash(vec3 p) {
  return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
}

void modifySplatCenter(inout vec3 center) {
  initShared(center);

  if (g_dist > uEndRadius) return;

  bool wavesActive = g_liftTime <= 0.0 || g_dist > g_liftWavePos - 1.5 * uBandWidth;
  if (wavesActive) {
    float phase = hash(center) * 6.28318;
    center.z += sin(uTime * 3.0 + phase) * uOscillationIntensity * 0.25;
  }

  float distToLiftWave = abs(g_dist - g_liftWavePos);
  if (distToLiftWave < uBandWidth && g_liftTime > 0.0) {
    float normalizedDist = distToLiftWave / uBandWidth;
    float liftAmount = (1.0 - normalizedDist) * sin(normalizedDist * 3.14159);
    center.z += liftAmount * uOscillationIntensity * 0.9;
  }
}

void modifySplatCovariance(vec3 originalCenter, vec3 modifiedCenter, inout vec3 covA, inout vec3 covB) {
  if (g_dist > uEndRadius) {
    gsplatMakeRound(covA, covB, 0.0);
    return;
  }

  float origSize = gsplatExtractSize(covA, covB);
  float scaleFactor;
  bool isLiftWave = g_liftTime > 0.0 && g_liftWavePos > g_dist;

  if (isLiftWave) {
    scaleFactor = (g_liftWavePos >= g_dist + uRevealBlendDistance)
      ? 1.0
      : mix(0.1, 1.0, (g_liftWavePos - g_dist) / max(uRevealBlendDistance, 1e-5));
  } else if (g_dist > g_dotWavePos + uRevealBlendDistance) {
    gsplatMakeRound(covA, covB, 0.0);
    return;
  } else if (g_dist > g_dotWavePos - uRevealBlendDistance) {
    float distToWave = abs(g_dist - g_dotWavePos);
    float normalizedWave = distToWave / max(uRevealBlendDistance, 1e-5);
    scaleFactor = (normalizedWave < 0.5)
      ? mix(0.1, 0.2, 1.0 - normalizedWave * 2.0)
      : mix(0.0, 0.1, smoothstep(g_dotWavePos + uRevealBlendDistance, g_dotWavePos - uRevealBlendDistance, g_dist));
  } else {
    scaleFactor = 0.1;
  }

  if (scaleFactor >= 1.0) {
    return;
  }

  if (isLiftWave) {
    float t = (scaleFactor - 0.1) * 1.111111;
    float dotSize = min(uDotSize * scaleFactor, uMaxRoundSize);
    float finalSize = min(mix(dotSize, origSize, t), origSize);
    vec3 roundA = covA;
    vec3 roundB = covB;
    vec3 scaledA = covA;
    vec3 scaledB = covB;
    gsplatMakeRound(roundA, roundB, finalSize);
    gsplatApplyUniformScale(scaledA, scaledB, scaleFactor);
    covA = mix(roundA, scaledA, t);
    covB = mix(roundB, scaledB, t);
  } else {
    float targetSize = min(min(scaleFactor * uDotSize, origSize), uMaxRoundSize);
    gsplatMakeRound(covA, covB, targetSize);
  }
}

void modifySplatColor(vec3 center, inout vec4 color) {
  if (g_dist > uEndRadius) return;

  if (g_liftTime > 0.0 && g_dist >= g_liftWavePos - 1.5 * uBandWidth && g_dist <= g_liftWavePos + 0.5 * uBandWidth) {
    float distToLift = abs(g_dist - g_liftWavePos);
    float liftIntensity = smoothstep(1.5 * uBandWidth, 0.0, distToLift);
    color.rgb += uWaveTint * liftIntensity;
  } else if (g_dist <= g_dotWavePos && (g_liftTime <= 0.0 || g_dist > g_liftWavePos + 0.5 * uBandWidth)) {
    float distToDot = abs(g_dist - g_dotWavePos);
    float dotIntensity = smoothstep(uBandWidth, 0.0, distToDot);
    color.rgb += uDotTint * dotIntensity;
  }
}
`;
const DEFAULT_MIN_PIXEL_SIZE = 0.5;
class GSplatRevealRadial extends __WEBPACK_EXTERNAL_MODULE__GSplatShaderEffect_js_a4503a18__.GSplatShaderEffect {
    constructor(options = {}){
        super(options), this._centerArray = [
            0,
            0,
            0
        ], this._dotTintArray = [
            0,
            0,
            0
        ], this._waveTintArray = [
            0,
            0,
            0
        ];
        this.center = (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.createVector3)(options.center, new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 0));
        this.speed = options.speed ?? 1;
        this.acceleration = options.acceleration ?? 5;
        this.delay = options.delay ?? 2;
        this.dotTint = (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.createColor)(options.dotTint, new __WEBPACK_EXTERNAL_MODULE_three__.Color(0, 1, 1));
        this.waveTint = (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.createColor)(options.waveTint, new __WEBPACK_EXTERNAL_MODULE_three__.Color(5, 0, 0));
        this.oscillationIntensity = options.oscillationIntensity ?? 0.1;
        this.endRadius = options.endRadius ?? 25;
        this.bandWidth = options.bandWidth ?? 1;
        this.dotSize = options.dotSize ?? 0.05;
        this.maxRoundSize = options.maxRoundSize ?? this.dotSize;
        this.revealBlendDistance = options.revealBlendDistance ?? 1;
        this.minPixelSize = options.minPixelSize ?? DEFAULT_MIN_PIXEL_SIZE;
        this.uniforms.minPixelSize = {
            value: this.minPixelSize
        };
    }
    getShaderGLSL() {
        return shaderGLSL;
    }
    getCompletionTime() {
        return this.delay + (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.solveWaveTime)(this.endRadius, this.speed, this.acceleration);
    }
    isEffectComplete() {
        return this.effectTime >= this.getCompletionTime();
    }
    updateEffect(effectTime) {
        if (this.isEffectComplete()) {
            this.enabled = false;
            return;
        }
        this.setUniform('uTime', effectTime);
        this.setUniform('uCenter', (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.writeVector3Array)(this.center, this._centerArray));
        this.setUniform('uSpeed', this.speed);
        this.setUniform('uAcceleration', this.acceleration);
        this.setUniform('uDelay', this.delay);
        this.setUniform('uDotTint', (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.writeColorArray)(this.dotTint, this._dotTintArray));
        this.setUniform('uWaveTint', (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.writeColorArray)(this.waveTint, this._waveTintArray));
        this.setUniform('uOscillationIntensity', this.oscillationIntensity);
        this.setUniform('uEndRadius', this.endRadius);
        this.setUniform('uBandWidth', this.bandWidth);
        this.setUniform('uDotSize', this.dotSize);
        this.setUniform('uMaxRoundSize', this.maxRoundSize);
        this.setUniform('uRevealBlendDistance', this.revealBlendDistance);
        this.setUniform('minPixelSize', this.minPixelSize);
    }
}
export { GSplatRevealRadial };
