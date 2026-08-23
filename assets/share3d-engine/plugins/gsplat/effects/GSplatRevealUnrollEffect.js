import * as __WEBPACK_EXTERNAL_MODULE__GSplatRevealShowcaseEffect_js_cbc9c2ec__ from "./GSplatRevealShowcaseEffect.js";
import * as __WEBPACK_EXTERNAL_MODULE__showcaseShaderUtils_js_586a5261__ from "./showcaseShaderUtils.js";
const DEFAULT_UNROLL_MIN_PIXEL_SIZE = 0.5;
const unrollShaderGLSL = `
uniform float uTime;
uniform float uTimeScale;
uniform float uDuration;
uniform vec2 uHeightRange;
uniform vec3 uCenter;

${__WEBPACK_EXTERNAL_MODULE__showcaseShaderUtils_js_586a5261__.SHOWCASE_SHADER_COMMON_GLSL}

float revealUnrollRevealTime() {
  return clamp(uTime * uTimeScale / uDuration, 0.0, 1.0) * 6.0;
}

float revealUnrollMotionTime() {
  return uTime * uTimeScale;
}

vec3 revealUnrollToSourceSpace(vec3 local) {
  vec2 horizontal = local.xy;
  return vec3(horizontal.x, -local.z, horizontal.y);
}

vec3 revealUnrollFromSourceSpace(vec3 local) {
  return vec3(local.x, local.z, -local.y);
}

float revealUnrollCenterFactor(float t) {
  return 1.0 - exp(-t) * 2.0;
}

float revealUnrollScaleFactor(float t, float height) {
  return smoothstep(0.3, 0.7, t + height - 2.0);
}

float revealUnrollNormalizeHeight(float height) {
  float normalized = (height - uHeightRange.x) / (uHeightRange.y - uHeightRange.x);
  return mix(-0.5, 0.5, clamp(normalized, 0.0, 1.0));
}

float revealUnrollOriginalHeight(vec3 sourceLocal, float t) {
  float centerFactor = revealUnrollCenterFactor(t);
  float safeFactor = abs(centerFactor) > 0.0001 ? centerFactor : 0.0001;
  return sourceLocal.y / safeFactor;
}

void modifySplatCenter(inout vec3 center) {
  vec3 local = center - uCenter;
  vec3 sourceLocal = revealUnrollToSourceSpace(local);
  float t = revealUnrollMotionTime();
  float twist = (sourceLocal.y * 50.0 - 20.0) * exp(-t);

  sourceLocal.xz = showcaseRotate2d(sourceLocal.xz, twist);
  center = uCenter + revealUnrollFromSourceSpace(sourceLocal * revealUnrollCenterFactor(t));
}

void modifySplatCovariance(
  vec3 originalCenter,
  vec3 modifiedCenter,
  inout vec3 covA,
  inout vec3 covB
) {
  vec3 sourceLocal = revealUnrollToSourceSpace(originalCenter - uCenter);
  float t = revealUnrollRevealTime();
  float visible = revealUnrollScaleFactor(t, revealUnrollNormalizeHeight(sourceLocal.y));
  vec3 tinyA = covA;
  vec3 tinyB = covB;

  gsplatMakeRound(tinyA, tinyB, 0.002);
  covA = mix(tinyA, covA, visible);
  covB = mix(tinyB, covB, visible);
}

void modifySplatColor(vec3 center, inout vec4 color) {
  vec3 local = center - uCenter;
  vec3 sourceLocal = revealUnrollToSourceSpace(local);
  float revealTime = revealUnrollRevealTime();
  float height = revealUnrollNormalizeHeight(
    revealUnrollOriginalHeight(sourceLocal, revealUnrollMotionTime())
  );

  color *= step(0.0, revealTime * 0.5 + height - 0.5);
}
`;
const DEFAULT_HEIGHT_RANGE = [
    -0.5,
    0.5
];
class GSplatRevealUnrollEffect extends __WEBPACK_EXTERNAL_MODULE__GSplatRevealShowcaseEffect_js_cbc9c2ec__.GSplatRevealShowcaseEffect {
    constructor(options = {}){
        super({
            id: 'reveal-unroll',
            shader: unrollShaderGLSL
        }, options);
        this._heightRange = normalizeHeightRange(options.heightRange);
        this._minPixelSize = options.minPixelSize ?? DEFAULT_UNROLL_MIN_PIXEL_SIZE;
        this.uniforms.minPixelSize = {
            value: this._minPixelSize
        };
    }
    updateEffect(effectTime) {
        super.updateEffect(effectTime);
        this.setUniform('uHeightRange', this._heightRange);
        this.setUniform('minPixelSize', this._minPixelSize);
    }
}
function normalizeHeightRange(value) {
    if (!value || !Number.isFinite(value[0]) || !Number.isFinite(value[1]) || value[1] <= value[0]) return DEFAULT_HEIGHT_RANGE;
    return [
        value[0],
        value[1]
    ];
}
export { GSplatRevealUnrollEffect };
