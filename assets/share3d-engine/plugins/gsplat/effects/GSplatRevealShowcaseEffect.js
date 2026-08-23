import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__ from "./effectUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__GSplatShaderEffect_js_a4503a18__ from "./GSplatShaderEffect.js";
class GSplatRevealShowcaseEffect extends __WEBPACK_EXTERNAL_MODULE__GSplatShaderEffect_js_a4503a18__.GSplatShaderEffect {
    constructor(config, options = {}){
        super({
            ...options,
            id: options.id ?? config.id
        });
        this._center = (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.createVector3)(options.center, new __WEBPACK_EXTERNAL_MODULE_three__.Vector3());
        this._timeScale = options.timeScale ?? 1;
        this._motionScale = options.motionScale ?? 1;
        this._duration = Math.max(0.001, options.duration ?? 6);
        this._shader = config.shader;
    }
    getShaderGLSL() {
        return this._shader;
    }
    updateEffect(effectTime) {
        this.setUniform('uTime', effectTime);
        this.setUniform('uTimeScale', this._timeScale);
        this.setUniform('uMotionScale', this._motionScale);
        this.setUniform('uDuration', this._duration);
        this.setUniform('uCenter', this._center);
    }
}
export { GSplatRevealShowcaseEffect };
