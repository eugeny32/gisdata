import * as __WEBPACK_EXTERNAL_MODULE__common_constant_js_335399ae__ from "../common/constant.js";
import * as __WEBPACK_EXTERNAL_MODULE__BaseEntity_js_4a7a320c__ from "./BaseEntity.js";
class EllipseEntity extends __WEBPACK_EXTERNAL_MODULE__BaseEntity_js_4a7a320c__.BaseEntity {
    constructor(data){
        super(__WEBPACK_EXTERNAL_MODULE__common_constant_js_335399ae__.EntityType.Ellipse), this.axisRatio = 1, this.startAngle = 0, this.endAngle = 2 * Math.PI, this.clockwise = false, this.serializeKeys = [
            'center',
            'majorAxisEndPoint',
            'axisRatio',
            'startAngle',
            'endAngle'
        ];
        Object.assign(this, data);
    }
    get radiusX() {
        return Math.hypot(this.majorAxisEndPoint.x, this.majorAxisEndPoint.y);
    }
    get radiusY() {
        return this.radiusX * this.axisRatio;
    }
    get rotation() {
        return Math.atan2(this.majorAxisEndPoint.y, this.majorAxisEndPoint.x);
    }
    getCaptureData() {
        return {
            centerPoints: [
                {
                    x: this.center.x,
                    y: this.center.y
                }
            ]
        };
    }
}
export { EllipseEntity };
