import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__ from "./effectUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__GSplatShaderEffect_js_a4503a18__ from "./GSplatShaderEffect.js";
const shaderGLSL = `
uniform float uTime;
uniform vec3 uCenter;
uniform float uDistance;
uniform float uSpeed;
uniform float uAcceleration;
uniform float uSpreadTime;
uniform float uSpreadCurve;
uniform float uWaveRadius;
uniform float uFlightTime;
uniform float uDropJitter;
uniform float uRainSize;
uniform float uMaxRoundSize;
uniform float uFallVisibleRatio;
uniform float uRotation;
uniform vec3 uFallTint;
uniform float uFallTintIntensity;
uniform vec3 uHitTint;
uniform float uHitDuration;
uniform float uEndRadius;
uniform float uStartRadius;

float g_dist2D;
float g_dist3D;
float g_tStart;
float g_tLand;
float g_dropDistance;
float g_fallVisibleStart;

float hash(vec3 p) {
  return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
}

float solveWaveTime(float dist) {
  if (uSpreadTime > 0.0) {
    float normalized = clamp(dist / max(uWaveRadius, 1e-5), 0.0, 1.0);
    return pow(normalized, uSpreadCurve) * uSpreadTime;
  }
  if (uAcceleration == 0.0) {
    return uSpeed > 0.0 ? dist / uSpeed : 1e10;
  }
  float discriminant = uSpeed * uSpeed + 2.0 * uAcceleration * dist;
  return (-uSpeed + sqrt(max(discriminant, 0.0))) / uAcceleration;
}

void initShared(vec3 center) {
  vec2 center2D = center.xy;
  vec2 origin2D = uCenter.xy;
  g_dist2D = length(center2D - origin2D);
  g_dist3D = length(center - uCenter);
  float seed = hash(center);
  float seed2 = hash(center.yzx + vec3(19.19, 7.31, 3.17));
  float localFlightTime = uFlightTime * mix(0.82, 1.18, seed2);
  float radialOrder = smoothstep(0.0, max(uStartRadius, 1e-5), g_dist2D);
  g_tStart = solveWaveTime(g_dist2D) + seed * uDropJitter * radialOrder;
  g_tLand = g_tStart + localFlightTime;
  g_dropDistance = uDistance * mix(0.75, 1.18, seed);
  g_fallVisibleStart = mix(g_tLand, g_tStart, clamp(uFallVisibleRatio, 0.0, 1.0));
}

void modifySplatCenter(inout vec3 center) {
  vec3 originalCenter = center;
  initShared(center);

  float timeSinceLanding = uTime - g_tLand;
  if (timeSinceLanding >= 0.5) return;
  if (g_dist3D > uEndRadius) return;
  if (uTime < g_tStart) return;

  if (uTime < g_tLand) {
    float fallProgress = (uTime - g_tStart) / (g_tLand - g_tStart);
    float fallHeight = pow(1.0 - fallProgress, 1.35);
    center.z += g_dropDistance * fallHeight;

    float angle = fallProgress * uRotation * 6.283185;
    float cosAngle = cos(angle);
    float sinAngle = sin(angle);
    float offsetX = originalCenter.x - uCenter.x;
    float offsetY = originalCenter.y - uCenter.y;
    center.x = uCenter.x + offsetX * cosAngle - offsetY * sinAngle;
    center.y = uCenter.y + offsetX * sinAngle + offsetY * cosAngle;
  }
}

void modifySplatCovariance(vec3 originalCenter, vec3 modifiedCenter, inout vec3 covA, inout vec3 covB) {
  float timeSinceLanding = uTime - g_tLand;
  if (timeSinceLanding >= 0.5) return;

  if (uTime < g_fallVisibleStart) {
    gsplatMakeRound(covA, covB, 0.0);
    return;
  }

  if (g_dist3D > uEndRadius || uTime < g_tStart) {
    gsplatMakeRound(covA, covB, 0.0);
    return;
  }

  float origSize = gsplatExtractSize(covA, covB);
  if (timeSinceLanding < 0.5) {
    if (timeSinceLanding < 0.0) {
      float targetSize = min(min(uRainSize, origSize), uMaxRoundSize);
      gsplatMakeRound(covA, covB, targetSize);
    } else {
      float t = smoothstep(0.0, 0.5, timeSinceLanding);
      vec3 rainA = covA;
      vec3 rainB = covB;
      float targetSize = min(min(uRainSize, origSize), uMaxRoundSize);
      gsplatMakeRound(rainA, rainB, targetSize);
      covA = mix(rainA, covA, t);
      covB = mix(rainB, covB, t);
    }
  }
}

void modifySplatColor(vec3 center, inout vec4 color) {
  float timeSinceLanding = uTime - g_tLand;
  if (timeSinceLanding >= uHitDuration) return;
  if (g_dist3D > uEndRadius) return;
  if (uTime < g_fallVisibleStart) return;

  if (timeSinceLanding < 0.0) {
    color.rgb = mix(color.rgb, uFallTint, uFallTintIntensity);
  } else if (timeSinceLanding < uHitDuration) {
    float fadeOut = 1.0 - (timeSinceLanding / uHitDuration);
    color.rgb += uHitTint * fadeOut;
  }
}
`;
class GSplatRevealRain extends __WEBPACK_EXTERNAL_MODULE__GSplatShaderEffect_js_a4503a18__.GSplatShaderEffect {
    static #_ = this.MAX_LOCAL_FLIGHT_TIME_SCALE = 1.18;
    constructor(options = {}){
        super(options), this._centerArray = [
            0,
            0,
            0
        ], this._fallTintArray = [
            0,
            0,
            0
        ], this._hitTintArray = [
            0,
            0,
            0
        ];
        this.center = (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.createVector3)(options.center, new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 0));
        this.distance = options.distance ?? 30;
        this.speed = options.speed ?? 2;
        this.acceleration = options.acceleration ?? 0;
        this.spreadTime = options.spreadTime ?? 0;
        this.spreadCurve = options.spreadCurve ?? 1;
        this.waveRadius = options.waveRadius ?? 25;
        this.flightTime = options.flightTime ?? 2;
        this.dropJitter = options.dropJitter ?? 0.6;
        this.rainSize = options.rainSize ?? 0.015;
        this.maxRoundSize = options.maxRoundSize ?? this.rainSize;
        this.fallVisibleRatio = options.fallVisibleRatio ?? 1;
        this.rotation = options.rotation ?? 0.9;
        this.fallTint = (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.createColor)(options.fallTint, new __WEBPACK_EXTERNAL_MODULE_three__.Color(0, 1, 1));
        this.fallTintIntensity = options.fallTintIntensity ?? 0.2;
        this.hitTint = (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.createColor)(options.hitTint, new __WEBPACK_EXTERNAL_MODULE_three__.Color(2, 0, 0));
        this.hitDuration = options.hitDuration ?? 0.5;
        this.endRadius = options.endRadius ?? 25;
        this.startRadius = options.startRadius ?? this.endRadius;
    }
    getShaderGLSL() {
        return shaderGLSL;
    }
    isEffectComplete() {
        const maxTStart = this.spreadTime > 0 ? this.spreadTime : (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.solveWaveTime)(this.endRadius, this.speed, this.acceleration);
        const maxTLand = maxTStart + this.dropJitter + this.flightTime * GSplatRevealRain.MAX_LOCAL_FLIGHT_TIME_SCALE;
        return this.effectTime >= maxTLand + Math.max(0.5, this.hitDuration);
    }
    updateEffect(effectTime) {
        if (this.isEffectComplete()) {
            this.enabled = false;
            return;
        }
        this.setUniform('uTime', effectTime);
        this.setUniform('uCenter', (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.writeVector3Array)(this.center, this._centerArray));
        this.setUniform('uDistance', this.distance);
        this.setUniform('uSpeed', this.speed);
        this.setUniform('uAcceleration', this.acceleration);
        this.setUniform('uSpreadTime', this.spreadTime);
        this.setUniform('uSpreadCurve', this.spreadCurve);
        this.setUniform('uWaveRadius', this.waveRadius);
        this.setUniform('uFlightTime', this.flightTime);
        this.setUniform('uDropJitter', this.dropJitter);
        this.setUniform('uRainSize', this.rainSize);
        this.setUniform('uMaxRoundSize', this.maxRoundSize);
        this.setUniform('uFallVisibleRatio', this.fallVisibleRatio);
        this.setUniform('uRotation', this.rotation);
        this.setUniform('uFallTint', (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.writeColorArray)(this.fallTint, this._fallTintArray));
        this.setUniform('uFallTintIntensity', this.fallTintIntensity);
        this.setUniform('uHitTint', (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.writeColorArray)(this.hitTint, this._hitTintArray));
        this.setUniform('uHitDuration', this.hitDuration);
        this.setUniform('uEndRadius', this.endRadius);
        this.setUniform('uStartRadius', this.startRadius);
    }
}
export { GSplatRevealRain };
