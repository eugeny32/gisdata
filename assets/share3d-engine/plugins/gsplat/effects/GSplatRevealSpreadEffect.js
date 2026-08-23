import * as __WEBPACK_EXTERNAL_MODULE__GSplatRevealShowcaseEffect_js_cbc9c2ec__ from "./GSplatRevealShowcaseEffect.js";
import * as __WEBPACK_EXTERNAL_MODULE__showcaseShaderUtils_js_586a5261__ from "./showcaseShaderUtils.js";
const spreadShaderGLSL = `
uniform float uTime;
uniform float uTimeScale;
uniform vec3 uCenter;

${__WEBPACK_EXTERNAL_MODULE__showcaseShaderUtils_js_586a5261__.SHOWCASE_SHADER_COMMON_GLSL}

float revealSpreadSourceTime() {
  return uTime * uTimeScale;
}

float revealSpreadTt(float t) {
  return t * t * 0.4 + 0.5;
}

float revealSpreadFactor(float tt) {
  return min(1.0, 0.3 + max(0.0, tt * 0.05));
}

vec3 revealSpreadToSourceSpace(vec3 local) {
  vec2 horizontal = local.xy;
  return vec3(horizontal.x, local.z, horizontal.y);
}

vec3 revealSpreadFromSourceSpace(vec3 local) {
  return vec3(local.x, local.z, local.y);
}

void modifySplatCenter(inout vec3 center) {
  vec3 local = center - uCenter;
  vec3 sourceLocal = revealSpreadToSourceSpace(local);
  float t = revealSpreadSourceTime();
  float tt = revealSpreadTt(t);

  sourceLocal.xz *= revealSpreadFactor(tt);
  center = uCenter + revealSpreadFromSourceSpace(sourceLocal);
}

void modifySplatCovariance(
  vec3 originalCenter,
  vec3 modifiedCenter,
  inout vec3 covA,
  inout vec3 covB
) {
  vec3 sourceLocal = revealSpreadToSourceSpace(originalCenter - uCenter);
  float t = revealSpreadSourceTime();
  float tt = revealSpreadTt(t);
  float l = length(sourceLocal.xz);
  float fullScale = min(tt - 7.0 - l * 2.5, 1.0);
  float dotScale = min(tt - 1.0 - l * 2.0, 1.0) * 0.2;

  gsplatApplyUniformScale(covA, covB, max(max(fullScale, dotScale), 0.0));
}

void modifySplatColor(vec3 center, inout vec4 color) {
  vec3 local = center - uCenter;
  float t = revealSpreadSourceTime();
  float tt = revealSpreadTt(t);
  float spread = revealSpreadFactor(tt);
  vec3 sourceLocal = revealSpreadToSourceSpace(local);

  sourceLocal.xz /= max(spread, 0.0001);

  float l = length(sourceLocal.xz);
  float visible = showcaseSaturate(tt - l * 2.5 - 3.0);
  color = mix(vec4(0.3), color, visible);
}
`;
class GSplatRevealSpreadEffect extends __WEBPACK_EXTERNAL_MODULE__GSplatRevealShowcaseEffect_js_cbc9c2ec__.GSplatRevealShowcaseEffect {
    constructor(options = {}){
        super({
            id: 'reveal-spread',
            shader: spreadShaderGLSL
        }, options);
    }
}
export { GSplatRevealSpreadEffect };
