import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__ from "./effectUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__GSplatShaderEffect_js_a4503a18__ from "./GSplatShaderEffect.js";
const shaderGLSL = `
uniform float uTime;
uniform vec3 uCenter;
uniform float uBlockCount;
uniform float uBlockSize;
uniform float uDelay;
uniform float uDuration;
uniform float uDotSize;
uniform vec3 uMoveTint;
uniform float uMoveTintIntensity;
uniform vec3 uLandTint;
uniform float uLandDuration;
uniform float uEndRadius;

float g_blockDist;
float g_tStart;
float g_tEnd;

void initShared(vec3 center) {
  vec3 offset = center - uCenter;
  ivec3 blockIdx = ivec3(floor(offset / uBlockSize + vec3(uBlockCount * 0.5)));
  vec3 blockCenter = (vec3(blockIdx) - vec3(uBlockCount * 0.5) + vec3(0.5)) * uBlockSize + uCenter;
  g_blockDist = length(blockCenter - uCenter);
  g_tStart = g_blockDist * uDelay;
  g_tEnd = g_tStart + uDuration;
}

void modifySplatCenter(inout vec3 center) {
  vec3 originalCenter = center;
  initShared(center);

  float timeSinceLanding = uTime - g_tEnd;
  if (timeSinceLanding >= 0.3) return;
  if (g_blockDist > uEndRadius) return;

  if (uTime < g_tStart) {
    center = uCenter;
    return;
  }

  if (uTime < g_tEnd) {
    float progress = (uTime - g_tStart) / uDuration;
    center = mix(uCenter, originalCenter, progress);
  }
}

void modifySplatCovariance(vec3 originalCenter, vec3 modifiedCenter, inout vec3 covA, inout vec3 covB) {
  float timeSinceLanding = uTime - g_tEnd;
  if (timeSinceLanding >= 0.3) return;

  if (g_blockDist > uEndRadius || uTime < g_tStart) {
    gsplatMakeRound(covA, covB, 0.0);
    return;
  }

  float origSize = gsplatExtractSize(covA, covB);
  if (timeSinceLanding < 0.3) {
    if (timeSinceLanding < 0.0) {
      float targetSize = min(uDotSize, origSize);
      gsplatMakeRound(covA, covB, targetSize);
    } else {
      float t = timeSinceLanding * 3.333333;
      float size = mix(uDotSize, origSize, t);
      vec3 roundA = covA;
      vec3 roundB = covB;
      gsplatMakeRound(roundA, roundB, size);
      covA = mix(roundA, covA, t);
      covB = mix(roundB, covB, t);
    }
  }
}

void modifySplatColor(vec3 center, inout vec4 color) {
  float timeSinceLanding = uTime - g_tEnd;
  if (timeSinceLanding >= uLandDuration) return;
  if (g_blockDist > uEndRadius) return;
  if (uTime < g_tStart) return;

  if (timeSinceLanding < 0.0) {
    color.rgb = mix(color.rgb, uMoveTint, uMoveTintIntensity);
  } else if (timeSinceLanding < uLandDuration) {
    float fadeOut = 1.0 - (timeSinceLanding / uLandDuration);
    color.rgb += uLandTint * fadeOut;
  }
}
`;
const DEFAULT_MIN_PIXEL_SIZE = 0.5;
class GSplatRevealGridEruption extends __WEBPACK_EXTERNAL_MODULE__GSplatShaderEffect_js_a4503a18__.GSplatShaderEffect {
    constructor(options = {}){
        super(options), this._centerArray = [
            0,
            0,
            0
        ], this._moveTintArray = [
            0,
            0,
            0
        ], this._landTintArray = [
            0,
            0,
            0
        ];
        this.center = (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.createVector3)(options.center, new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 0));
        this.blockCount = options.blockCount ?? 10;
        this.blockSize = options.blockSize ?? 2;
        this.delay = options.delay ?? 0.2;
        this.duration = options.duration ?? 1;
        this.dotSize = options.dotSize ?? 0.01;
        this.moveTint = (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.createColor)(options.moveTint, new __WEBPACK_EXTERNAL_MODULE_three__.Color(1, 0, 1));
        this.moveTintIntensity = options.moveTintIntensity ?? 0.2;
        this.landTint = (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.createColor)(options.landTint, new __WEBPACK_EXTERNAL_MODULE_three__.Color(2, 2, 0));
        this.landDuration = options.landDuration ?? 0.6;
        this.endRadius = options.endRadius ?? 25;
        this.minPixelSize = options.minPixelSize ?? DEFAULT_MIN_PIXEL_SIZE;
        this.uniforms.minPixelSize = {
            value: this.minPixelSize
        };
    }
    getShaderGLSL() {
        return shaderGLSL;
    }
    isEffectComplete() {
        const maxTStart = this.endRadius * this.delay;
        const maxTEnd = maxTStart + this.duration;
        return this.effectTime >= maxTEnd + Math.max(0.3, this.landDuration);
    }
    updateEffect(effectTime) {
        if (this.isEffectComplete()) {
            this.enabled = false;
            return;
        }
        this.setUniform('uTime', effectTime);
        this.setUniform('uCenter', (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.writeVector3Array)(this.center, this._centerArray));
        this.setUniform('uBlockCount', this.blockCount);
        this.setUniform('uBlockSize', this.blockSize);
        this.setUniform('uDelay', this.delay);
        this.setUniform('uDuration', this.duration);
        this.setUniform('uDotSize', this.dotSize);
        this.setUniform('uMoveTint', (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.writeColorArray)(this.moveTint, this._moveTintArray));
        this.setUniform('uMoveTintIntensity', this.moveTintIntensity);
        this.setUniform('uLandTint', (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.writeColorArray)(this.landTint, this._landTintArray));
        this.setUniform('uLandDuration', this.landDuration);
        this.setUniform('uEndRadius', this.endRadius);
        this.setUniform('minPixelSize', this.minPixelSize);
    }
}
export { GSplatRevealGridEruption };
