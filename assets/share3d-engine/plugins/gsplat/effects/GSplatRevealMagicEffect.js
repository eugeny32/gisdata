import * as __WEBPACK_EXTERNAL_MODULE__GSplatRevealShowcaseEffect_js_cbc9c2ec__ from "./GSplatRevealShowcaseEffect.js";
import * as __WEBPACK_EXTERNAL_MODULE__showcaseShaderUtils_js_586a5261__ from "./showcaseShaderUtils.js";
const DEFAULT_MAGIC_MIN_PIXEL_SIZE = 0.5;
const magicShaderGLSL = `
uniform float uTime;
uniform float uTimeScale;
uniform float uMotionScale;
uniform float uDuration;
uniform float uRevealRadius;
uniform vec3 uCenter;

${__WEBPACK_EXTERNAL_MODULE__showcaseShaderUtils_js_586a5261__.SHOWCASE_SHADER_COMMON_GLSL}

vec3 revealMagicHash(vec3 value) {
  value = fract(value * 0.3183099 + 0.1);
  value *= 17.0;
  return fract(vec3(
    value.x * value.y * value.z,
    value.x + value.y * value.z,
    value.x * value.y + value.z
  ));
}

vec3 revealMagicNoise(vec3 value) {
  vec3 cell = floor(value);
  vec3 local = fract(value);
  local = local * local * (3.0 - 2.0 * local);

  vec3 n000 = revealMagicHash(cell + vec3(0.0, 0.0, 0.0));
  vec3 n100 = revealMagicHash(cell + vec3(1.0, 0.0, 0.0));
  vec3 n010 = revealMagicHash(cell + vec3(0.0, 1.0, 0.0));
  vec3 n110 = revealMagicHash(cell + vec3(1.0, 1.0, 0.0));
  vec3 n001 = revealMagicHash(cell + vec3(0.0, 0.0, 1.0));
  vec3 n101 = revealMagicHash(cell + vec3(1.0, 0.0, 1.0));
  vec3 n011 = revealMagicHash(cell + vec3(0.0, 1.0, 1.0));
  vec3 n111 = revealMagicHash(cell + vec3(1.0, 1.0, 1.0));

  vec3 x0 = mix(n000, n100, local.x);
  vec3 x1 = mix(n010, n110, local.x);
  vec3 x2 = mix(n001, n101, local.x);
  vec3 x3 = mix(n011, n111, local.x);
  vec3 y0 = mix(x0, x1, local.y);
  vec3 y1 = mix(x2, x3, local.y);

  return mix(y0, y1, local.z);
}

vec3 revealMagicToSourceSpace(vec3 local) {
  return vec3(local.x, local.z, local.y);
}

vec3 revealMagicFromSourceSpace(vec3 local) {
  return vec3(local.x, local.z, local.y);
}

float revealMagicSourceTime() {
  return min(uTime * uTimeScale * 14.5 / max(uDuration, 0.001), 14.5);
}

float revealMagicFront(float t) {
  return smoothstep(0.0, 10.0, t - 4.5) * uRevealRadius;
}

void modifySplatCenter(inout vec3 center) {
  vec3 local = center - uCenter;
  vec3 sourceLocal = revealMagicToSourceSpace(local);
  float t = revealMagicSourceTime();
  float front = revealMagicFront(t);
  float radius = length(local.xy);
  float border = abs(front - radius - 0.5);
  float hidden = smoothstep(front - 0.5, front, radius + 0.5);
  float motion = max(uMotionScale, 0.0);

  sourceLocal *= 1.0 - 0.2 * exp(-20.0 * border) * motion;
  sourceLocal += 0.1 * revealMagicNoise(sourceLocal * 2.0 + t * 0.5) * hidden * motion;

  center = uCenter + revealMagicFromSourceSpace(sourceLocal);
}

void modifySplatCovariance(
  vec3 originalCenter,
  vec3 modifiedCenter,
  inout vec3 covA,
  inout vec3 covB
) {
  vec3 local = originalCenter - uCenter;
  float t = revealMagicSourceTime();
  float front = revealMagicFront(t);
  float radius = length(local.xy);
  float hidden = smoothstep(front - 0.5, front, radius + 0.5) * showcaseSaturate(uMotionScale);
  vec3 tinyA = covA;
  vec3 tinyB = covB;

  gsplatMakeRound(tinyA, tinyB, 0.002);
  covA = mix(covA, tinyA, hidden);
  covB = mix(covB, tinyB, hidden);
}

void modifySplatColor(vec3 center, inout vec4 color) {
  vec3 local = center - uCenter;
  float t = revealMagicSourceTime();
  float front = revealMagicFront(t);
  float radius = length(local.xy);
  float border = abs(front - radius - 0.5);
  float angle = atan(local.x, local.y) / 3.1416;
  float angularReveal = step(angle, t - 3.1416);
  float edgeGlow = exp(-20.0 * border);
  float sweepGlow = exp(-50.0 * abs(t - angle - 3.1416)) * 0.5;
  float glow = edgeGlow + sweepGlow;

  color.rgb = color.rgb * angularReveal + vec3(glow);
  color.a = min(1.0, color.a * angularReveal + glow);
}
`;
class GSplatRevealMagicEffect extends __WEBPACK_EXTERNAL_MODULE__GSplatRevealShowcaseEffect_js_cbc9c2ec__.GSplatRevealShowcaseEffect {
    constructor(options = {}){
        super({
            id: 'reveal-magic',
            shader: magicShaderGLSL
        }, options);
        this._revealRadius = normalizeRevealRadius(options.revealRadius);
        this._minPixelSize = options.minPixelSize ?? DEFAULT_MAGIC_MIN_PIXEL_SIZE;
        this.uniforms.minPixelSize = {
            value: this._minPixelSize
        };
    }
    updateEffect(effectTime) {
        super.updateEffect(effectTime);
        this.setUniform('uRevealRadius', this._revealRadius);
        this.setUniform('minPixelSize', this._minPixelSize);
    }
}
function normalizeRevealRadius(value) {
    return 'number' == typeof value && Number.isFinite(value) && value > 0 ? Math.max(value, 0.001) : 10;
}
export { GSplatRevealMagicEffect };
