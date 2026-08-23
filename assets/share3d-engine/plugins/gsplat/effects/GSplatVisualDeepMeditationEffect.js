import * as __WEBPACK_EXTERNAL_MODULE__GSplatVisualShowcaseEffect_js_9f30b0ab__ from "./GSplatVisualShowcaseEffect.js";
import * as __WEBPACK_EXTERNAL_MODULE__showcaseShaderUtils_js_586a5261__ from "./showcaseShaderUtils.js";
const deepMeditationShaderGLSL = `
uniform float uTime;
uniform float uTimeScale;
uniform float uIntensity;
uniform vec3 uCenter;
uniform float uEffectScale;

${__WEBPACK_EXTERNAL_MODULE__showcaseShaderUtils_js_586a5261__.SHOWCASE_SHADER_COMMON_GLSL}

void modifySplatCenter(inout vec3 center) {
  vec3 local = (center - uCenter) / uEffectScale;
  float t = uTime * uTimeScale;
  float radius = length(local.xy);
  float breathe = sin(t * 1.15 + radius * 3.4) * 0.5 + 0.5;
  float lift = sin(t * 0.72 + local.z * 1.8) * 0.035 * uIntensity;

  center.xy += normalize(local.xy + vec2(0.0001)) * (breathe - 0.5) * 0.07 * uIntensity * uEffectScale;
  center.z += lift * uEffectScale;
}

void modifySplatCovariance(
  vec3 originalCenter,
  vec3 modifiedCenter,
  inout vec3 covA,
  inout vec3 covB
) {
  float t = uTime * uTimeScale;
  float radius = length((originalCenter - uCenter).xy / uEffectScale);
  float breathe = sin(t * 1.15 + radius * 3.4) * 0.5 + 0.5;
  gsplatApplyUniformScale(covA, covB, 1.0 + (breathe - 0.5) * 0.35 * uIntensity);
}

void modifySplatColor(vec3 center, inout vec4 color) {
  vec3 local = (center - uCenter) / uEffectScale;
  float t = uTime * uTimeScale;
  float wave = sin(length(local.xy) * 4.0 - t * 1.8) * 0.5 + 0.5;
  vec3 calmA = vec3(0.33, 0.79, 0.93);
  vec3 calmB = vec3(0.96, 0.66, 0.42);
  color.rgb = mix(color.rgb, mix(calmA, calmB, wave), 0.34 * uIntensity);
}
`;
class GSplatVisualDeepMeditationEffect extends __WEBPACK_EXTERNAL_MODULE__GSplatVisualShowcaseEffect_js_9f30b0ab__.GSplatVisualShowcaseEffect {
    constructor(options = {}){
        super({
            id: 'visual-deep-meditation',
            shader: deepMeditationShaderGLSL
        }, options);
    }
}
export { GSplatVisualDeepMeditationEffect };
