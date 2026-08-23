import * as __WEBPACK_EXTERNAL_MODULE__common_constant_js_335399ae__ from "../common/constant.js";
import * as __WEBPACK_EXTERNAL_MODULE__BaseEntity_js_4a7a320c__ from "./BaseEntity.js";
class CircleEntity extends __WEBPACK_EXTERNAL_MODULE__BaseEntity_js_4a7a320c__.BaseEntity {
    constructor(data){
        super(__WEBPACK_EXTERNAL_MODULE__common_constant_js_335399ae__.EntityType.Circle), this.serializeKeys = [
            'center',
            'radius'
        ];
        Object.assign(this, data);
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
export { CircleEntity };
