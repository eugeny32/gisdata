import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__boxScanLut_js_c1b5156b__ from "./boxScanLut.js";
import * as __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__ from "./effectUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__GSplatShaderEffect_js_a4503a18__ from "./GSplatShaderEffect.js";
const shaderGLSL = `
uniform sampler2D uLUT;
uniform vec3 uAabbMin;
uniform vec3 uAabbMax;
uniform vec3 uSweepMin;
uniform vec3 uSweepMax;
uniform vec3 uDirection;

bool g_insideAABB;
vec4 g_lutValue;

void modifySplatCenter(inout vec3 center) {
  g_insideAABB = all(greaterThanEqual(center, uAabbMin)) && all(lessThanEqual(center, uAabbMax));
  if (!g_insideAABB) {
    return;
  }

  float dirLen = length(uDirection);
  if (dirLen < 0.001) {
    g_insideAABB = false;
    return;
  }

  vec3 absDir = abs(uDirection / dirLen);
  vec3 relPos = center - uSweepMin;
  vec3 sweepSize = uSweepMax - uSweepMin;
  float boxLength = dot(sweepSize, absDir);
  float splatPos = dot(relPos, absDir);
  float t = clamp(splatPos / max(boxLength, 0.0001), 0.0, 1.0);
  int texelX = int(t * 255.0);
  g_lutValue = texelFetch(uLUT, ivec2(texelX, 0), 0);
}

void modifySplatCovariance(vec3 originalCenter, vec3 modifiedCenter, inout vec3 covA, inout vec3 covB) {
  if (!g_insideAABB) return;

  float lutScale = g_lutValue.a;
  if (lutScale < 0.01) {
    gsplatMakeRound(covA, covB, 0.0);
    return;
  }

  if (lutScale < 1.0) {
    gsplatApplyUniformScale(covA, covB, lutScale);
  }
}

void modifySplatColor(vec3 center, inout vec4 color) {
  if (!g_insideAABB) return;
  color.rgb *= g_lutValue.rgb;
}
`;
class GSplatBoxShaderEffect extends __WEBPACK_EXTERNAL_MODULE__GSplatShaderEffect_js_a4503a18__.GSplatShaderEffect {
    constructor(options = {}){
        super(options), this._aabbMinArray = [
            0,
            0,
            0
        ], this._aabbMaxArray = [
            0,
            0,
            0
        ], this._sweepMinArray = [
            0,
            0,
            0
        ], this._sweepMaxArray = [
            0,
            0,
            0
        ], this._directionArray = [
            0,
            0,
            0
        ], this._lutData = new Uint16Array(1024), this._normDir = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(), this._absDir = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(), this._boxSize = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(), this._lutWriter = new __WEBPACK_EXTERNAL_MODULE__boxScanLut_js_c1b5156b__.GSplatScanLUTWriter(), this._lutTexture = null;
        this.aabbMin = (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.createVector3)(options.aabbMin, new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(-0.5, -0.5, -0.5));
        this.aabbMax = (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.createVector3)(options.aabbMax, new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0.5, 0.5, 0.5));
        this.sweepMin = options.sweepMin ? (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.createVector3)(options.sweepMin, this.aabbMin) : null;
        this.sweepMax = options.sweepMax ? (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.createVector3)(options.sweepMax, this.aabbMax) : null;
        this.direction = (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.createVector3)(options.direction, new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 1, 0));
        this.duration = options.duration ?? 1;
        this.visibleStart = options.visibleStart ?? false;
        this.visibleEnd = options.visibleEnd ?? true;
        this.interval = options.interval ?? 0.2;
        this.invertTint = options.invertTint ?? false;
        this.baseTint = (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.createColor)(options.baseTint, new __WEBPACK_EXTERNAL_MODULE_three__.Color(1, 1, 1));
        this.edgeTint = (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.createColor)(options.edgeTint, new __WEBPACK_EXTERNAL_MODULE_three__.Color(1, 0, 1));
        this.tint = (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.createColor)(options.tint, new __WEBPACK_EXTERNAL_MODULE_three__.Color(1, 1, 1));
        this._lutTexture = this.createLUTTexture();
    }
    getShaderGLSL() {
        return shaderGLSL;
    }
    get lutTexture() {
        return this._lutTexture;
    }
    generateLUT() {
        const dirLen = this.direction.length();
        if (dirLen < 0.001) {
            this._lutWriter.fill(this._lutData, 1, 1, 1, 1);
            if (this._lutTexture) this._lutTexture.needsUpdate = true;
            return;
        }
        this._normDir.copy(this.direction).normalize();
        this._absDir.set(Math.abs(this._normDir.x), Math.abs(this._normDir.y), Math.abs(this._normDir.z));
        this._boxSize.subVectors(this.sweepMax ?? this.aabbMax, this.sweepMin ?? this.aabbMin);
        const boxLength = this._boxSize.dot(this._absDir);
        const isNegativeDir = this._normDir.x + this._normDir.y + this._normDir.z < 0;
        this._lutWriter.write(this._lutData, {
            length: boxLength,
            effectTime: this.effectTime,
            duration: this.duration,
            interval: this.interval,
            reverse: isNegativeDir,
            visibleStart: this.visibleStart,
            visibleEnd: this.visibleEnd,
            invertTint: this.invertTint,
            baseTint: this.baseTint,
            edgeTint: this.edgeTint,
            tint: this.tint
        });
        if (this._lutTexture) this._lutTexture.needsUpdate = true;
    }
    updateEffect() {
        this.generateLUT();
        this.setUniform('uLUT', this._lutTexture);
        this.setUniform('uAabbMin', (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.writeVector3Array)(this.aabbMin, this._aabbMinArray));
        this.setUniform('uAabbMax', (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.writeVector3Array)(this.aabbMax, this._aabbMaxArray));
        this.setUniform('uSweepMin', (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.writeVector3Array)(this.sweepMin ?? this.aabbMin, this._sweepMinArray));
        this.setUniform('uSweepMax', (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.writeVector3Array)(this.sweepMax ?? this.aabbMax, this._sweepMaxArray));
        this.setUniform('uDirection', (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.writeVector3Array)(this.direction, this._directionArray));
    }
    onDestroy() {
        this._lutTexture?.dispose();
        this._lutTexture = null;
    }
    createLUTTexture() {
        const texture = new __WEBPACK_EXTERNAL_MODULE_three__.DataTexture(this._lutData, 256, 1, __WEBPACK_EXTERNAL_MODULE_three__.RGBAFormat, __WEBPACK_EXTERNAL_MODULE_three__.HalfFloatType);
        texture.name = 'GSplatBoxShaderEffectLUT';
        texture.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        texture.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        texture.generateMipmaps = false;
        texture.unpackAlignment = 1;
        texture.needsUpdate = true;
        return texture;
    }
}
export { GSplatBoxShaderEffect };
