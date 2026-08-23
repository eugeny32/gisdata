import * as __WEBPACK_EXTERNAL_MODULE__GSplatVisualShowcaseEffect_js_9f30b0ab__ from "./GSplatVisualShowcaseEffect.js";
import * as __WEBPACK_EXTERNAL_MODULE__showcaseShaderUtils_js_586a5261__ from "./showcaseShaderUtils.js";
const flareShaderGLSL = `
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
  float front = fract(t * 0.18) * 5.5;
  float ring = showcaseRing(radius, front, 0.42);
  vec2 dir = normalize(local.xy + vec2(0.0001));

  center.xy += dir * ring * 0.22 * uIntensity * uEffectScale;
  center.z += ring * sin(t * 5.0 + radius * 4.0) * 0.12 * uIntensity * uEffectScale;
}

void modifySplatCovariance(
  vec3 originalCenter,
  vec3 modifiedCenter,
  inout vec3 covA,
  inout vec3 covB
) {
  float t = uTime * uTimeScale;
  float radius = length((originalCenter - uCenter).xy / uEffectScale);
  float ring = showcaseRing(radius, fract(t * 0.18) * 5.5, 0.42);
  gsplatApplyUniformScale(covA, covB, 1.0 + ring * 0.65 * uIntensity);
}

void modifySplatColor(vec3 center, inout vec4 color) {
  vec3 local = (center - uCenter) / uEffectScale;
  float t = uTime * uTimeScale;
  float radius = length(local.xy);
  float ring = showcaseRing(radius, fract(t * 0.18) * 5.5, 0.52);
  vec3 flare = mix(vec3(1.0, 0.28, 0.08), vec3(1.0, 0.92, 0.42), ring);
  color.rgb = mix(color.rgb, flare, showcaseSaturate(ring * 0.85 * uIntensity));
}
`;
class GSplatVisualFlareEffect extends __WEBPACK_EXTERNAL_MODULE__GSplatVisualShowcaseEffect_js_9f30b0ab__.GSplatVisualShowcaseEffect {
    constructor(options = {}){
        super({
            id: 'visual-flare',
            shader: flareShaderGLSL
        }, options);
    }
}
export { GSplatVisualFlareEffect };
