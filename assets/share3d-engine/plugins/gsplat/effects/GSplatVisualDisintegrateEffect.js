import * as __WEBPACK_EXTERNAL_MODULE__GSplatVisualShowcaseEffect_js_9f30b0ab__ from "./GSplatVisualShowcaseEffect.js";
import * as __WEBPACK_EXTERNAL_MODULE__showcaseShaderUtils_js_586a5261__ from "./showcaseShaderUtils.js";
const disintegrateShaderGLSL = `
uniform float uTime;
uniform float uTimeScale;
uniform float uIntensity;
uniform vec3 uCenter;
uniform float uEffectScale;

${__WEBPACK_EXTERNAL_MODULE__showcaseShaderUtils_js_586a5261__.SHOWCASE_SHADER_COMMON_GLSL}

void modifySplatCenter(inout vec3 center) {
  vec3 local = (center - uCenter) / uEffectScale;
  float t = uTime * uTimeScale;
  float noise = showcaseHash13(floor(local * 11.0));
  float amount = smoothstep(0.0, 1.0, fract(t * 0.12 + noise));
  vec3 dir = normalize(vec3(
    showcaseHash12(local.xy) - 0.5,
    showcaseHash12(local.yz) - 0.5,
    abs(showcaseHash12(local.zx) - 0.2) + 0.2
  ));

  center += dir * amount * amount * 0.72 * uIntensity * uEffectScale;
}

void modifySplatCovariance(
  vec3 originalCenter,
  vec3 modifiedCenter,
  inout vec3 covA,
  inout vec3 covB
) {
  float t = uTime * uTimeScale;
  float noise = showcaseHash13(floor((originalCenter - uCenter) / uEffectScale * 11.0));
  float amount = smoothstep(0.0, 1.0, fract(t * 0.12 + noise));
  gsplatApplyUniformScale(covA, covB, max(0.18, 1.0 - amount * 0.58 * uIntensity));
}

void modifySplatColor(vec3 center, inout vec4 color) {
  vec3 local = (center - uCenter) / uEffectScale;
  float t = uTime * uTimeScale;
  float noise = showcaseHash13(floor(local * 11.0));
  float amount = smoothstep(0.0, 1.0, fract(t * 0.12 + noise));
  vec3 dust = mix(vec3(0.22, 0.16, 0.12), vec3(1.0, 0.64, 0.24), amount);
  color.rgb = mix(color.rgb, dust, showcaseSaturate(amount * 0.72 * uIntensity));
  color.a *= 1.0 - amount * 0.42 * showcaseSaturate(uIntensity);
}
`;
class GSplatVisualDisintegrateEffect extends __WEBPACK_EXTERNAL_MODULE__GSplatVisualShowcaseEffect_js_9f30b0ab__.GSplatVisualShowcaseEffect {
    constructor(options = {}){
        super({
            id: 'visual-disintegrate',
            shader: disintegrateShaderGLSL
        }, options);
    }
}
export { GSplatVisualDisintegrateEffect };
