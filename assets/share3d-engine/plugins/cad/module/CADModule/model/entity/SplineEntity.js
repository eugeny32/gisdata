import * as __WEBPACK_EXTERNAL_MODULE__common_constant_js_335399ae__ from "../common/constant.js";
import * as __WEBPACK_EXTERNAL_MODULE__BaseEntity_js_4a7a320c__ from "./BaseEntity.js";
class SplineEntity extends __WEBPACK_EXTERNAL_MODULE__BaseEntity_js_4a7a320c__.BaseEntity {
    constructor(data){
        super(__WEBPACK_EXTERNAL_MODULE__common_constant_js_335399ae__.EntityType.Spline), this.degree = 3, this.method = 'FIT', this.isClosed = false, this.serializeKeys = [
            'degree',
            'knots',
            'controlPoints',
            'weights',
            'method',
            'fitPoints',
            'isClosed',
            'startTangent',
            'endTangent'
        ];
        Object.assign(this, data);
    }
    getCaptureData() {
        const endPoints = [];
        if ('FIT' === this.method) this.fitPoints?.forEach((point)=>{
            endPoints.push({
                x: point.x,
                y: point.y
            });
        });
        else this.controlPoints?.forEach((point)=>{
            endPoints.push({
                x: point.x,
                y: point.y
            });
        });
        return {
            endPoints
        };
    }
}
export { SplineEntity };
