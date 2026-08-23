import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__ from "./effectUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__GSplatShaderEffect_js_a4503a18__ from "./GSplatShaderEffect.js";
class GSplatVisualShowcaseEffect extends __WEBPACK_EXTERNAL_MODULE__GSplatShaderEffect_js_a4503a18__.GSplatShaderEffect {
    constructor(config, options = {}){
        super({
            ...options,
            id: options.id ?? config.id
        });
        this._center = (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.createVector3)(options.center, new __WEBPACK_EXTERNAL_MODULE_three__.Vector3());
        this._intensity = options.intensity ?? 1;
        this._timeScale = options.timeScale ?? 1;
        this._effectScale = Math.max(0.001, options.effectScale ?? 1);
        this._shader = config.shader;
    }
    getShaderGLSL() {
        return this._shader;
    }
    updateEffect(effectTime) {
        this.setUniform('uTime', effectTime);
        this.setUniform('uTimeScale', this._timeScale);
        this.setUniform('uIntensity', this._intensity);
        this.setUniform('uCenter', this._center);
        this.setUniform('uEffectScale', this._effectScale);
    }
}
export { GSplatVisualShowcaseEffect };
