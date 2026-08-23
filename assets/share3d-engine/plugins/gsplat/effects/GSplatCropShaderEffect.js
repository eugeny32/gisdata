import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__ from "./effectUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__GSplatShaderEffect_js_a4503a18__ from "./GSplatShaderEffect.js";
const shaderGLSL = `
uniform vec3 uAabbMin;
uniform vec3 uAabbMax;
uniform float uEdgeScaleFactor;

void modifySplatCenter(inout vec3 center) {
}

void modifySplatCovariance(vec3 originalCenter, vec3 modifiedCenter, inout vec3 covA, inout vec3 covB) {
  bool insideAABB = all(greaterThanEqual(modifiedCenter, uAabbMin)) && all(lessThanEqual(modifiedCenter, uAabbMax));

  if (!insideAABB) {
    gsplatMakeRound(covA, covB, 0.0);
    return;
  }

  #ifdef GSPLAT_PRECISE_CROP
  float maxRadius = gsplatExtractSize(covA, covB) * 3.0;
  vec3 distToMin = modifiedCenter - uAabbMin;
  vec3 distToMax = uAabbMax - modifiedCenter;
  float minDist = min(
    min(min(distToMin.x, distToMin.y), distToMin.z),
    min(min(distToMax.x, distToMax.y), distToMax.z)
  );

  if (maxRadius > minDist) {
    float scale = (minDist / max(maxRadius, 0.0001)) * uEdgeScaleFactor;
    gsplatApplyUniformScale(covA, covB, scale);
  }
  #endif
}

void modifySplatColor(vec3 center, inout vec4 color) {
}
`;
class GSplatCropShaderEffect extends __WEBPACK_EXTERNAL_MODULE__GSplatShaderEffect_js_a4503a18__.GSplatShaderEffect {
    constructor(options = {}){
        super(options), this._aabbMinArray = [
            0,
            0,
            0
        ], this._aabbMaxArray = [
            0,
            0,
            0
        ];
        this.aabbMin = (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.createVector3)(options.aabbMin, new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(-0.5, -0.5, -0.5));
        this.aabbMax = (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.createVector3)(options.aabbMax, new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0.5, 0.5, 0.5));
        this.edgeScaleFactor = options.edgeScaleFactor ?? 0.5;
    }
    getShaderGLSL() {
        return shaderGLSL;
    }
    updateEffect() {
        this.setUniform('uAabbMin', (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.writeVector3Array)(this.aabbMin, this._aabbMinArray));
        this.setUniform('uAabbMax', (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.writeVector3Array)(this.aabbMax, this._aabbMaxArray));
        this.setUniform('uEdgeScaleFactor', this.edgeScaleFactor);
    }
}
export { GSplatCropShaderEffect };
