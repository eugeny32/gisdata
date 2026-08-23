import * as __WEBPACK_EXTERNAL_MODULE__GSplatShaderEffect_js_a4503a18__ from "./GSplatShaderEffect.js";
import * as __WEBPACK_EXTERNAL_MODULE__showcaseShaderUtils_js_586a5261__ from "./showcaseShaderUtils.js";
const DEFAULT_DISSOLVE_MIN_PIXEL_SIZE = 0.5;
const dissolveDriftShaderGLSL = `
uniform float uTime;
uniform float uSpeed;
uniform float uMotionScale;
uniform float uEffectScale;

${__WEBPACK_EXTERNAL_MODULE__showcaseShaderUtils_js_586a5261__.SHOWCASE_SHADER_COMMON_GLSL}

float dissolveProgress(vec3 center) {
  float seed = showcaseHash13(floor(center / uEffectScale * 5.0));
  return showcaseSaturate(fract(uTime * uSpeed * 0.12 + seed * 0.72) * 1.18);
}

void modifySplatCenter(inout vec3 center) {
  float progress = dissolveProgress(center);
  vec3 seed = vec3(
    showcaseHash12(center.xy),
    showcaseHash12(center.yz),
    showcaseHash12(center.zx)
  );
  vec3 dir = normalize(vec3(seed.xy - 0.5, abs(seed.z - 0.15) + 0.2));

  center += dir * progress * progress * 1.15 * uMotionScale * uEffectScale;
}

void modifySplatCovariance(
  vec3 originalCenter,
  vec3 modifiedCenter,
  inout vec3 covA,
  inout vec3 covB
) {
  float progress = dissolveProgress(originalCenter);
  gsplatApplyUniformScale(covA, covB, max(0.03, 1.0 - progress * 0.82));
}

void modifySplatColor(vec3 center, inout vec4 color) {
  float progress = dissolveProgress(center);
  vec3 ember = mix(vec3(0.16, 0.16, 0.18), vec3(0.98, 0.52, 0.16), progress);
  color.rgb = mix(color.rgb, ember, progress * 0.78);
  color.a *= 1.0 - smoothstep(0.58, 1.0, progress);
}
`;
class GSplatDissolveDriftEffect extends __WEBPACK_EXTERNAL_MODULE__GSplatShaderEffect_js_a4503a18__.GSplatShaderEffect {
    constructor(options = {}){
        super({
            ...options,
            id: options.id ?? 'dissolve-drift'
        });
        this._speed = options.speed ?? 1;
        this._motionScale = options.motionScale ?? 1;
        this._effectScale = Math.max(0.001, options.effectScale ?? 1);
        this._minPixelSize = options.minPixelSize ?? DEFAULT_DISSOLVE_MIN_PIXEL_SIZE;
        this.uniforms.minPixelSize = {
            value: this._minPixelSize
        };
    }
    getShaderGLSL() {
        return dissolveDriftShaderGLSL;
    }
    updateEffect(effectTime) {
        this.setUniform('uTime', effectTime);
        this.setUniform('uSpeed', this._speed);
        this.setUniform('uMotionScale', this._motionScale);
        this.setUniform('uEffectScale', this._effectScale);
        this.setUniform('minPixelSize', this._minPixelSize);
    }
}
export { GSplatDissolveDriftEffect };
