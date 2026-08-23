import * as __WEBPACK_EXTERNAL_MODULE__GSplatRevealShowcaseEffect_js_cbc9c2ec__ from "./GSplatRevealShowcaseEffect.js";
import * as __WEBPACK_EXTERNAL_MODULE__showcaseShaderUtils_js_586a5261__ from "./showcaseShaderUtils.js";
const DEFAULT_TWISTER_MIN_PIXEL_SIZE = 0.5;
const DEFAULT_HORIZONTAL_RADIUS = 1;
const DEFAULT_REVEAL_RADIUS = 1;
const DEFAULT_HEIGHT_RANGE = [
    -0.5,
    0.5
];
const twisterShaderGLSL = `
uniform float uTime;
uniform float uTimeScale;
uniform float uMotionScale;
uniform float uDuration;
uniform float uHorizontalRadius;
uniform float uRevealRadius;
uniform float uFunnelHeight;
uniform vec2 uHeightRange;
uniform vec3 uCenter;

${__WEBPACK_EXTERNAL_MODULE__showcaseShaderUtils_js_586a5261__.SHOWCASE_SHADER_COMMON_GLSL}

float revealTwisterSourceTime() {
  return showcaseSaturate(uTime * uTimeScale / uDuration) * 10.0;
}

float revealTwisterNormalizeHeight(float height) {
  return (height - uHeightRange.x) / (uHeightRange.y - uHeightRange.x) - 0.5;
}

float revealTwisterDenormalizeHeight(float height) {
  return (height + 0.5) * (uHeightRange.y - uHeightRange.x) + uHeightRange.x;
}

float revealTwisterProgress(vec3 local) {
  float t = revealTwisterSourceTime();
  return smoothstep(0.0, 8.0, t * t * 0.1 - length(local.xy) / uRevealRadius * 2.0 + 2.0);
}

void modifySplatCenter(inout vec3 center) {
  vec3 local = center - uCenter;
  vec3 normalizedLocal = vec3(local.xy / uHorizontalRadius, local.z / uFunnelHeight);
  float t = revealTwisterSourceTime();
  float progress = revealTwisterProgress(local);
  float staggeredProgress = pow(progress, 2.0 * showcaseHash13(local));

  normalizedLocal.z = mix(-0.5, normalizedLocal.z, staggeredProgress);
  normalizedLocal.xy = mix(normalizedLocal.xy * 0.5, normalizedLocal.xy, staggeredProgress);

  float rotationTime = t * (1.0 - progress) * 0.2;
  float helicalTwist = normalizedLocal.z * 20.0 * (1.0 - progress)
    * exp(-length(normalizedLocal.xy));
  normalizedLocal.xy = showcaseRotate2d(
    normalizedLocal.xy,
    (rotationTime + helicalTwist) * uMotionScale
  );

  center = uCenter + vec3(
    normalizedLocal.xy * uHorizontalRadius,
    normalizedLocal.z * uFunnelHeight
  );
}

void modifySplatCovariance(
  vec3 originalCenter,
  vec3 modifiedCenter,
  inout vec3 covA,
  inout vec3 covB
) {
  vec3 local = originalCenter - uCenter;
  float visible = pow(revealTwisterProgress(local), 12.0);
  vec3 tinyA = covA;
  vec3 tinyB = covB;

  gsplatMakeRound(tinyA, tinyB, 0.002);
  covA = mix(tinyA, covA, visible);
  covB = mix(tinyB, covB, visible);
}
`;
class GSplatRevealTwisterEffect extends __WEBPACK_EXTERNAL_MODULE__GSplatRevealShowcaseEffect_js_cbc9c2ec__.GSplatRevealShowcaseEffect {
    constructor(options = {}){
        super({
            id: 'reveal-twister',
            shader: twisterShaderGLSL
        }, options);
        this._horizontalRadius = normalizeHorizontalRadius(options.horizontalRadius);
        this._revealRadius = normalizeRevealRadius(options.revealRadius);
        this._funnelHeight = normalizeFunnelHeight(options.funnelHeight);
        this._heightRange = normalizeHeightRange(options.heightRange);
        this._minPixelSize = options.minPixelSize ?? DEFAULT_TWISTER_MIN_PIXEL_SIZE;
        this.uniforms.minPixelSize = {
            value: this._minPixelSize
        };
    }
    updateEffect(effectTime) {
        super.updateEffect(effectTime);
        this.setUniform('uHorizontalRadius', this._horizontalRadius);
        this.setUniform('uRevealRadius', this._revealRadius);
        this.setUniform('uFunnelHeight', this._funnelHeight);
        this.setUniform('uHeightRange', this._heightRange);
        this.setUniform('minPixelSize', this._minPixelSize);
    }
}
function normalizeHorizontalRadius(value) {
    return 'number' == typeof value && Number.isFinite(value) && value > 0 ? value : DEFAULT_HORIZONTAL_RADIUS;
}
function normalizeRevealRadius(value) {
    return 'number' == typeof value && Number.isFinite(value) && value > 0 ? value : DEFAULT_REVEAL_RADIUS;
}
function normalizeFunnelHeight(value) {
    return 'number' == typeof value && Number.isFinite(value) && value > 0 ? value : 1;
}
function normalizeHeightRange(value) {
    if (!value || !Number.isFinite(value[0]) || !Number.isFinite(value[1]) || value[1] <= value[0]) return DEFAULT_HEIGHT_RANGE;
    return [
        value[0],
        value[1]
    ];
}
export { GSplatRevealTwisterEffect };
