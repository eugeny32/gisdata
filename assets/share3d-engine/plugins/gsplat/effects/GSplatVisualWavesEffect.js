import * as __WEBPACK_EXTERNAL_MODULE__GSplatVisualShowcaseEffect_js_9f30b0ab__ from "./GSplatVisualShowcaseEffect.js";
import * as __WEBPACK_EXTERNAL_MODULE__showcaseShaderUtils_js_586a5261__ from "./showcaseShaderUtils.js";
const wavesShaderGLSL = `
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
  float wave = sin(radius * 7.5 - t * 4.0);
  float ripple = wave * 0.12 * uIntensity;

  center.z += ripple * uEffectScale;
  center.xy += normalize(local.xy + vec2(0.0001)) * cos(radius * 6.0 - t * 3.0) * 0.04 * uIntensity * uEffectScale;
}

void modifySplatCovariance(
  vec3 originalCenter,
  vec3 modifiedCenter,
  inout vec3 covA,
  inout vec3 covB
) {
  float t = uTime * uTimeScale;
  float radius = length((originalCenter - uCenter).xy / uEffectScale);
  float crest = sin(radius * 7.5 - t * 4.0) * 0.5 + 0.5;
  gsplatApplyUniformScale(covA, covB, 1.0 + crest * 0.26 * uIntensity);
}

void modifySplatColor(vec3 center, inout vec4 color) {
  vec3 local = (center - uCenter) / uEffectScale;
  float t = uTime * uTimeScale;
  float crest = sin(length(local.xy) * 7.5 - t * 4.0) * 0.5 + 0.5;
  vec3 waveColor = mix(vec3(0.05, 0.28, 0.82), vec3(0.28, 0.94, 0.88), crest);
  color.rgb = mix(color.rgb, waveColor, 0.42 * uIntensity);
}
`;
class GSplatVisualWavesEffect extends __WEBPACK_EXTERNAL_MODULE__GSplatVisualShowcaseEffect_js_9f30b0ab__.GSplatVisualShowcaseEffect {
    constructor(options = {}){
        super({
            id: 'visual-waves',
            shader: wavesShaderGLSL
        }, options);
    }
}
export { GSplatVisualWavesEffect };
