import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__ from "./effectUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__GSplatVisualShowcaseEffect_js_9f30b0ab__ from "./GSplatVisualShowcaseEffect.js";
import * as __WEBPACK_EXTERNAL_MODULE__showcaseShaderUtils_js_586a5261__ from "./showcaseShaderUtils.js";
const electronicShaderGLSL = `
uniform float uTime;
uniform float uTimeScale;
uniform float uIntensity;
uniform vec3 uCenter;
uniform float uEffectScale;
uniform float uSwayAmplitude;
uniform float uSwaySpeed;
uniform vec3 uFlickerColor;

${__WEBPACK_EXTERNAL_MODULE__showcaseShaderUtils_js_586a5261__.SHOWCASE_SHADER_COMMON_GLSL}

void modifySplatCenter(inout vec3 center) {
  vec3 local = (center - uCenter) / uEffectScale;
  float t = uTime * uTimeScale;
  float sourceHeight = local.z * 2.0 - 1.0;
  local.xz = showcaseRotate2d(
    local.xz,
    smoothstep(-1.0, -2.0, sourceHeight) * uSwayAmplitude * sin(t * uSwaySpeed)
  );
  center = uCenter + local * uEffectScale;
}

vec4 electronicFractal(vec3 local, float t) {
  float m = 100.0;
  vec3 p = local * 0.1;
  p.z += 0.5;

  for (int i = 0; i < 8; i++) {
    p = abs(p) / clamp(abs(p.x * p.z), 0.3, 3.0) - 1.0;
    p.xz = showcaseRotate2d(p.xz, radians(90.0));
    if (i > 1) {
      m = min(
        m,
        length(p.xz) + step(0.3, fract(p.y * 0.5 + t * 0.5 + float(i) * 0.2))
      );
    }
  }

  m = step(m, 0.5) * 1.3 * uIntensity;
  return vec4(uFlickerColor + vec3(-local.z * 0.3, 0.0, 0.0), 0.3) * uIntensity + m;
}

void modifySplatColor(vec3 center, inout vec4 color) {
  vec3 local = (center - uCenter) / uEffectScale;
  float t = uTime * uTimeScale;
  vec4 effectColor = electronicFractal(local, t);
  color = mix(color, color * effectColor, uIntensity);
}
`;
class GSplatVisualElectronicEffect extends __WEBPACK_EXTERNAL_MODULE__GSplatVisualShowcaseEffect_js_9f30b0ab__.GSplatVisualShowcaseEffect {
    constructor(options = {}){
        super({
            id: 'visual-electronic',
            shader: electronicShaderGLSL
        }, options), this._flickerColorArray = [
            0,
            0,
            0
        ];
        this._swayAmplitude = normalizeNonNegative(options.swayAmplitude, 0.2);
        this._swaySpeed = normalizeNonNegative(options.swaySpeed, 2);
        this._flickerColor = (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.createColor)(options.flickerColor, new __WEBPACK_EXTERNAL_MODULE_three__.Color(0, 0.5, 0.7));
    }
    updateEffect(effectTime) {
        super.updateEffect(effectTime);
        this.setUniform('uSwayAmplitude', this._swayAmplitude);
        this.setUniform('uSwaySpeed', this._swaySpeed);
        this.setUniform('uFlickerColor', (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.writeColorArray)(this._flickerColor, this._flickerColorArray));
    }
}
function normalizeNonNegative(value, fallback) {
    return 'number' == typeof value && Number.isFinite(value) && value >= 0 ? value : fallback;
}
export { GSplatVisualElectronicEffect };
