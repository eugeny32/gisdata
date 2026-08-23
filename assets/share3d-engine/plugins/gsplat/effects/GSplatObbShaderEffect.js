import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__boxScanLut_js_c1b5156b__ from "./boxScanLut.js";
import * as __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__ from "./effectUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__GSplatShaderEffect_js_a4503a18__ from "./GSplatShaderEffect.js";
const MODE_SCAN = 0;
const MODE_DOUBLE_WAVE_REVEAL = 1;
const DEFAULT_MIN_PIXEL_SIZE = 0.5;
const shaderGLSL = `
uniform int uObbMode;
uniform bool uObbBypass;
uniform sampler2D uLUT;
uniform vec3 uObbOrigin;
uniform vec3 uObbAxisX;
uniform vec3 uObbAxisY;
uniform vec3 uObbAxisZ;
uniform vec3 uObbMin;
uniform vec3 uObbMax;
uniform vec3 uObbDirection;
uniform float uSweepStart;
uniform float uSweepEnd;
uniform float uTime;
uniform float uSpeed;
uniform float uAcceleration;
uniform float uDelay;
uniform vec3 uDotTint;
uniform vec3 uWaveTint;
uniform float uOscillationIntensity;
uniform float uBandWidth;
uniform float uDotSize;
uniform float uMaxRoundSize;
uniform float uRevealBlendDistance;

bool g_insideOBB;
vec4 g_lutValue;
float g_scanDistance;
float g_scanLength;
float g_dotWavePos;
float g_liftTime;
float g_liftWavePos;

float hash(vec3 p) {
  return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
}

vec3 computeObbLocal(vec3 center) {
  vec3 delta = center - uObbOrigin;
  return vec3(dot(delta, uObbAxisX), dot(delta, uObbAxisY), dot(delta, uObbAxisZ));
}

void initObbShared(vec3 center) {
  vec3 localCenter = computeObbLocal(center);
  g_insideOBB = all(greaterThanEqual(localCenter, uObbMin)) && all(lessThanEqual(localCenter, uObbMax));
  if (!g_insideOBB) {
    return;
  }

  float dirLen = length(uObbDirection);
  if (dirLen < 0.001) {
    g_insideOBB = false;
    return;
  }

  vec3 dir = uObbDirection / dirLen;
  float projection = dot(localCenter, dir);
  float sweepStart = min(uSweepStart, uSweepEnd);
  float sweepEnd = max(uSweepStart, uSweepEnd);
  g_scanLength = max(sweepEnd - sweepStart, 0.0001);
  g_scanDistance = projection - sweepStart;

  if (uObbMode == 0) {
    float t = clamp(g_scanDistance / g_scanLength, 0.0, 1.0);
    int texelX = int(t * 255.0);
    g_lutValue = texelFetch(uLUT, ivec2(texelX, 0), 0);
  } else {
    g_dotWavePos = uSpeed * uTime + 0.5 * uAcceleration * uTime * uTime;
    g_liftTime = max(0.0, uTime - uDelay);
    g_liftWavePos = uSpeed * g_liftTime + 0.5 * uAcceleration * g_liftTime * g_liftTime;
  }
}

void modifySplatCenter(inout vec3 center) {
  if (uObbBypass) {
    return;
  }
  initObbShared(center);
  if (!g_insideOBB || uObbMode == 0) {
    return;
  }

  if (g_scanDistance < 0.0 || g_scanDistance > g_scanLength) {
    return;
  }

  float liftOffset = 0.0;
  bool wavesActive = g_liftTime <= 0.0 || g_scanDistance > g_liftWavePos - 1.5 * uBandWidth;
  if (wavesActive) {
    float phase = hash(center) * 6.28318;
    liftOffset += sin(uTime * 3.0 + phase) * uOscillationIntensity * 0.25;
  }

  float distToLiftWave = abs(g_scanDistance - g_liftWavePos);
  if (distToLiftWave < uBandWidth && g_liftTime > 0.0) {
    float normalizedDist = distToLiftWave / uBandWidth;
    float liftAmount = (1.0 - normalizedDist) * sin(normalizedDist * 3.14159);
    liftOffset += liftAmount * uOscillationIntensity * 0.9;
  }

  if (abs(liftOffset) > 1e-6) {
    vec3 liftAxis = length(uObbAxisZ) > 0.001 ? normalize(uObbAxisZ) : vec3(0.0, 0.0, 1.0);
    center += liftAxis * liftOffset;
  }
}

void modifySplatCovariance(vec3 originalCenter, vec3 modifiedCenter, inout vec3 covA, inout vec3 covB) {
  if (uObbBypass) {
    return;
  }
  if (!g_insideOBB) {
    return;
  }

  if (uObbMode == 0) {
    float lutScale = g_lutValue.a;
    if (lutScale < 0.01) {
      gsplatMakeRound(covA, covB, 0.0);
      return;
    }

    if (lutScale < 1.0) {
      gsplatApplyUniformScale(covA, covB, lutScale);
    }
    return;
  }

  if (g_scanDistance < 0.0 || g_scanDistance > g_scanLength) {
    gsplatMakeRound(covA, covB, 0.0);
    return;
  }

  float scaleFactor;
  bool isLiftWave = g_liftTime > 0.0 && g_liftWavePos > g_scanDistance;

  if (isLiftWave) {
    scaleFactor = (g_liftWavePos >= g_scanDistance + uRevealBlendDistance)
      ? 1.0
      : mix(0.1, 1.0, (g_liftWavePos - g_scanDistance) / max(uRevealBlendDistance, 1e-5));
  } else if (g_scanDistance > g_dotWavePos + uRevealBlendDistance) {
    gsplatMakeRound(covA, covB, 0.0);
    return;
  } else if (g_scanDistance > g_dotWavePos - uRevealBlendDistance) {
    float distToWave = abs(g_scanDistance - g_dotWavePos);
    float normalizedWave = distToWave / max(uRevealBlendDistance, 1e-5);
    scaleFactor = (normalizedWave < 0.5)
      ? mix(0.1, 0.2, 1.0 - normalizedWave * 2.0)
      : mix(0.0, 0.1, smoothstep(g_dotWavePos + uRevealBlendDistance, g_dotWavePos - uRevealBlendDistance, g_scanDistance));
  } else {
    scaleFactor = 0.1;
  }

  if (scaleFactor >= 1.0) {
    return;
  }

  float origSize = gsplatExtractSize(covA, covB);

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
  if (uObbBypass) {
    return;
  }
  if (!g_insideOBB) {
    return;
  }

  if (uObbMode == 0) {
    color.rgb *= g_lutValue.rgb;
    return;
  }

  if (g_scanDistance < 0.0 || g_scanDistance > g_scanLength) {
    return;
  }

  if (g_liftTime > 0.0 && g_scanDistance >= g_liftWavePos - 1.5 * uBandWidth && g_scanDistance <= g_liftWavePos + 0.5 * uBandWidth) {
    float distToLift = abs(g_scanDistance - g_liftWavePos);
    float liftIntensity = smoothstep(1.5 * uBandWidth, 0.0, distToLift);
    color.rgb += uWaveTint * liftIntensity;
  } else if (g_scanDistance <= g_dotWavePos && (g_liftTime <= 0.0 || g_scanDistance > g_liftWavePos + 0.5 * uBandWidth)) {
    float distToDot = abs(g_scanDistance - g_dotWavePos);
    float dotIntensity = smoothstep(uBandWidth, 0.0, distToDot);
    color.rgb += uDotTint * dotIntensity;
  }
}
`;
class GSplatObbShaderEffect extends __WEBPACK_EXTERNAL_MODULE__GSplatShaderEffect_js_a4503a18__.GSplatShaderEffect {
    constructor(options = {}){
        super(options), this._originArray = [
            0,
            0,
            0
        ], this._axisXArray = [
            0,
            0,
            0
        ], this._axisYArray = [
            0,
            0,
            0
        ], this._axisZArray = [
            0,
            0,
            0
        ], this._minArray = [
            0,
            0,
            0
        ], this._maxArray = [
            0,
            0,
            0
        ], this._directionArray = [
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
        ], this._normalizedDirection = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(), this._lutData = new Uint16Array(1024), this._lutWriter = new __WEBPACK_EXTERNAL_MODULE__boxScanLut_js_c1b5156b__.GSplatScanLUTWriter(), this._lutTexture = null;
        this.mode = options.mode ?? 'scan';
        this.origin = (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.createVector3)(options.origin, new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 0));
        this.axisX = (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.createVector3)(options.axisX, new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1, 0, 0));
        this.axisY = (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.createVector3)(options.axisY, new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 1, 0));
        this.axisZ = (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.createVector3)(options.axisZ, new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 1));
        this.min = (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.createVector3)(options.min, new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(-0.5, -0.5, -0.5));
        this.max = (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.createVector3)(options.max, new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0.5, 0.5, 0.5));
        this.direction = (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.createVector3)(options.direction, new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 1, 0));
        this.sweepStart = Number.isFinite(options.sweepStart) ? options.sweepStart : null;
        this.sweepEnd = Number.isFinite(options.sweepEnd) ? options.sweepEnd : null;
        this.duration = options.duration ?? 1;
        this.visibleStart = options.visibleStart ?? false;
        this.visibleEnd = options.visibleEnd ?? true;
        this.interval = options.interval ?? 0.2;
        this.invertTint = options.invertTint ?? false;
        this.baseTint = (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.createColor)(options.baseTint, new __WEBPACK_EXTERNAL_MODULE_three__.Color(1, 1, 1));
        this.edgeTint = (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.createColor)(options.edgeTint, new __WEBPACK_EXTERNAL_MODULE_three__.Color(1, 0, 1));
        this.tint = (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.createColor)(options.tint, new __WEBPACK_EXTERNAL_MODULE_three__.Color(1, 1, 1));
        this.speed = options.speed ?? 5;
        this.acceleration = options.acceleration ?? 0;
        this.delay = options.delay ?? 3;
        this.dotTint = (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.createColor)(options.dotTint, new __WEBPACK_EXTERNAL_MODULE_three__.Color(0, 1, 1));
        this.waveTint = (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.createColor)(options.waveTint, new __WEBPACK_EXTERNAL_MODULE_three__.Color(1, 0.5, 0));
        this.oscillationIntensity = options.oscillationIntensity ?? 0.2;
        this.bandWidth = options.bandWidth ?? 1;
        this.dotSize = options.dotSize ?? 0.05;
        this.maxRoundSize = options.maxRoundSize ?? this.dotSize;
        this.revealBlendDistance = options.revealBlendDistance ?? 1;
        this.minPixelSize = options.minPixelSize ?? DEFAULT_MIN_PIXEL_SIZE;
        this.uniforms.uObbBypass = {
            value: false
        };
        this.uniforms.minPixelSize = {
            value: this.minPixelSize
        };
        this._lutTexture = this.createLUTTexture();
    }
    getShaderGLSL() {
        return shaderGLSL;
    }
    get lutTexture() {
        return this._lutTexture;
    }
    getProjectionRange() {
        const dirLen = this.direction.length();
        if (dirLen < 0.001) return {
            start: 0,
            end: 0,
            length: 0
        };
        this._normalizedDirection.copy(this.direction).normalize();
        const dir = this._normalizedDirection;
        const start = dir.x * (dir.x >= 0 ? this.min.x : this.max.x) + dir.y * (dir.y >= 0 ? this.min.y : this.max.y) + dir.z * (dir.z >= 0 ? this.min.z : this.max.z);
        const end = dir.x * (dir.x >= 0 ? this.max.x : this.min.x) + dir.y * (dir.y >= 0 ? this.max.y : this.min.y) + dir.z * (dir.z >= 0 ? this.max.z : this.min.z);
        return {
            start,
            end,
            length: Math.max(0, end - start)
        };
    }
    getSweepProjectionRange() {
        const supportRange = this.getProjectionRange();
        if (supportRange.length <= 0) return supportRange;
        const rawStart = this.sweepStart ?? supportRange.start;
        const rawEnd = this.sweepEnd ?? supportRange.end;
        const start = Math.max(supportRange.start, Math.min(rawStart, rawEnd));
        const end = Math.min(supportRange.end, Math.max(rawStart, rawEnd));
        if (end <= start) return supportRange;
        return {
            start,
            end,
            length: end - start
        };
    }
    generateLUT() {
        const range = this.getSweepProjectionRange();
        if (range.length <= 0) this._lutWriter.fill(this._lutData, 1, 1, 1, 1);
        else this._lutWriter.write(this._lutData, {
            length: range.length,
            effectTime: this.effectTime,
            duration: this.duration,
            interval: this.interval,
            reverse: false,
            visibleStart: this.visibleStart,
            visibleEnd: this.visibleEnd,
            invertTint: this.invertTint,
            baseTint: this.baseTint,
            edgeTint: this.edgeTint,
            tint: this.tint
        });
        if (this._lutTexture) this._lutTexture.needsUpdate = true;
    }
    getCompletionTime() {
        if ('scan' === this.mode) return this.duration;
        return this.delay + (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.solveWaveTime)(this.getSweepProjectionRange().length, this.speed, this.acceleration);
    }
    isEffectComplete() {
        return 'double-wave-reveal' === this.mode && this.effectTime >= this.getCompletionTime();
    }
    updateEffect(effectTime) {
        if (this.isEffectComplete()) {
            this.setUniform('uObbBypass', true);
            this.finishWithShadersAttached();
            return;
        }
        this.setUniform('uObbBypass', false);
        if ('scan' === this.mode) this.generateLUT();
        const range = this.getSweepProjectionRange();
        this.setUniform('uObbMode', 'scan' === this.mode ? MODE_SCAN : MODE_DOUBLE_WAVE_REVEAL);
        this.setUniform('uLUT', this._lutTexture);
        this.setUniform('uObbOrigin', (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.writeVector3Array)(this.origin, this._originArray));
        this.setUniform('uObbAxisX', (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.writeVector3Array)(this.axisX, this._axisXArray));
        this.setUniform('uObbAxisY', (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.writeVector3Array)(this.axisY, this._axisYArray));
        this.setUniform('uObbAxisZ', (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.writeVector3Array)(this.axisZ, this._axisZArray));
        this.setUniform('uObbMin', (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.writeVector3Array)(this.min, this._minArray));
        this.setUniform('uObbMax', (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.writeVector3Array)(this.max, this._maxArray));
        this.setUniform('uObbDirection', (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.writeVector3Array)(this.direction, this._directionArray));
        this.setUniform('uSweepStart', range.start);
        this.setUniform('uSweepEnd', range.end);
        this.setUniform('uTime', effectTime);
        this.setUniform('uSpeed', this.speed);
        this.setUniform('uAcceleration', this.acceleration);
        this.setUniform('uDelay', this.delay);
        this.setUniform('uDotTint', (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.writeColorArray)(this.dotTint, this._dotTintArray));
        this.setUniform('uWaveTint', (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.writeColorArray)(this.waveTint, this._waveTintArray));
        this.setUniform('uOscillationIntensity', this.oscillationIntensity);
        this.setUniform('uBandWidth', this.bandWidth);
        this.setUniform('uDotSize', this.dotSize);
        this.setUniform('uMaxRoundSize', this.maxRoundSize);
        this.setUniform('uRevealBlendDistance', this.revealBlendDistance);
        if ('double-wave-reveal' === this.mode) this.setUniform('minPixelSize', this.minPixelSize);
    }
    onDestroy() {
        this._lutTexture?.dispose();
        this._lutTexture = null;
    }
    createLUTTexture() {
        const texture = new __WEBPACK_EXTERNAL_MODULE_three__.DataTexture(this._lutData, 256, 1, __WEBPACK_EXTERNAL_MODULE_three__.RGBAFormat, __WEBPACK_EXTERNAL_MODULE_three__.HalfFloatType);
        texture.name = 'GSplatObbShaderEffectLUT';
        texture.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        texture.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        texture.generateMipmaps = false;
        texture.unpackAlignment = 1;
        texture.needsUpdate = true;
        return texture;
    }
}
export { GSplatObbShaderEffect };
