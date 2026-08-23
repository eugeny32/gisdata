import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__common_constant_js_335399ae__ from "../common/constant.js";
import * as __WEBPACK_EXTERNAL_MODULE__BaseEntity_js_4a7a320c__ from "./BaseEntity.js";
class AlignDimensionEntity extends __WEBPACK_EXTERNAL_MODULE__BaseEntity_js_4a7a320c__.BaseEntity {
    constructor(data){
        super(__WEBPACK_EXTERNAL_MODULE__common_constant_js_335399ae__.EntityType.AlignDimension), this.dimensionText = '', this.isTextPositionEdited = false, this.textHeight = 2.5, this.serializeKeys = [
            'p1',
            'p2',
            'offsetPoint',
            'dimensionText',
            'textPosition',
            'isTextPositionEdited',
            'textHeight'
        ];
        Object.assign(this, data);
    }
    getCaptureData() {
        const endPoints = [
            {
                x: this.p1.x,
                y: this.p1.y
            },
            {
                x: this.p2.x,
                y: this.p2.y
            }
        ];
        return {
            endPoints
        };
    }
}
const ALIGN_DIMENSION_EXTENSION_LINE_GAP = 0;
const ALIGN_DIMENSION_EXTENSION_LINE_EXTEND = 1;
function getAlignDimensionPoints(p1, p2, p3, gap = ALIGN_DIMENSION_EXTENSION_LINE_GAP, ext = ALIGN_DIMENSION_EXTENSION_LINE_EXTEND) {
    const v = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().subVectors(p2, p1);
    const n = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(-v.y, v.x, 0).normalize();
    const w = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().subVectors(p3, p1);
    const d = w.dot(n);
    const sign = d >= 0 ? 1 : -1;
    const d1 = p1.clone().add(n.clone().multiplyScalar(d));
    const d2 = p2.clone().add(n.clone().multiplyScalar(d));
    const e1_start = p1.clone().add(n.clone().multiplyScalar(gap * sign));
    const e1_end = d1.clone().add(n.clone().multiplyScalar(ext * sign));
    const e2_start = p2.clone().add(n.clone().multiplyScalar(gap * sign));
    const e2_end = d2.clone().add(n.clone().multiplyScalar(ext * sign));
    const length = p1.distanceTo(p2);
    const angle = Math.atan2(v.y, v.x);
    return {
        d1,
        d2,
        e1_start,
        e1_end,
        e2_start,
        e2_end,
        d,
        length,
        angle
    };
}
export { ALIGN_DIMENSION_EXTENSION_LINE_EXTEND, ALIGN_DIMENSION_EXTENSION_LINE_GAP, AlignDimensionEntity, getAlignDimensionPoints };
