import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shaders_shaders_js_f0891b73__ from "./shaders/shaders.js";
class NormalizationMaterial extends __WEBPACK_EXTERNAL_MODULE_three__.RawShaderMaterial {
    constructor(_parameters = {}){
        super();
        const uniforms = {
            uDepthMap: {
                type: 't',
                value: null
            },
            uWeightMap: {
                type: 't',
                value: null
            }
        };
        this.setValues({
            uniforms: uniforms,
            vertexShader: this.getDefines() + __WEBPACK_EXTERNAL_MODULE__shaders_shaders_js_f0891b73__.Shaders["normalize.vs"],
            fragmentShader: this.getDefines() + __WEBPACK_EXTERNAL_MODULE__shaders_shaders_js_f0891b73__.Shaders["normalize.fs"]
        });
    }
    getDefines() {
        const defines = '';
        return defines;
    }
    updateShaderSource() {
        const vs = this.getDefines() + __WEBPACK_EXTERNAL_MODULE__shaders_shaders_js_f0891b73__.Shaders["normalize.vs"];
        const fs = this.getDefines() + __WEBPACK_EXTERNAL_MODULE__shaders_shaders_js_f0891b73__.Shaders["normalize.fs"];
        this.setValues({
            vertexShader: vs,
            fragmentShader: fs
        });
        this.needsUpdate = true;
    }
}
export { NormalizationMaterial };
