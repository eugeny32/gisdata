import * as __WEBPACK_EXTERNAL_MODULE__common_constant_js_335399ae__ from "../common/constant.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_ArcUtils_js_38ae85a5__ from "../../../utils/ArcUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__BaseEntity_js_4a7a320c__ from "./BaseEntity.js";
class ArcEntity extends __WEBPACK_EXTERNAL_MODULE__BaseEntity_js_4a7a320c__.BaseEntity {
    constructor(data){
        super(__WEBPACK_EXTERNAL_MODULE__common_constant_js_335399ae__.EntityType.Arc), this.clockwise = false, this.serializeKeys = [
            'center',
            'radius',
            'startAngle',
            'endAngle',
            'clockwise'
        ];
        Object.assign(this, data);
    }
    getCaptureData() {
        const endPoints = [];
        const midPoints = [];
        endPoints.push({
            x: this.center.x + this.radius * Math.cos(this.startAngle),
            y: this.center.y + this.radius * Math.sin(this.startAngle)
        });
        endPoints.push({
            x: this.center.x + this.radius * Math.cos(this.endAngle),
            y: this.center.y + this.radius * Math.sin(this.endAngle)
        });
        const sweep = __WEBPACK_EXTERNAL_MODULE__utils_ArcUtils_js_38ae85a5__.ArcUtils.getSweepAngle(this.startAngle, this.endAngle, this.clockwise);
        const midAngle = this.startAngle + (this.clockwise ? -sweep / 2 : sweep / 2);
        midPoints.push({
            x: this.center.x + this.radius * Math.cos(midAngle),
            y: this.center.y + this.radius * Math.sin(midAngle)
        });
        return {
            endPoints,
            midPoints,
            centerPoints: [
                {
                    x: this.center.x,
                    y: this.center.y
                }
            ]
        };
    }
}
export { ArcEntity };
