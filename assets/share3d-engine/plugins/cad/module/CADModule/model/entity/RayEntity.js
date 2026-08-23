import * as __WEBPACK_EXTERNAL_MODULE__common_constant_js_335399ae__ from "../common/constant.js";
import * as __WEBPACK_EXTERNAL_MODULE__BaseEntity_js_4a7a320c__ from "./BaseEntity.js";
class RayEntity extends __WEBPACK_EXTERNAL_MODULE__BaseEntity_js_4a7a320c__.BaseEntity {
    constructor(data){
        super(__WEBPACK_EXTERNAL_MODULE__common_constant_js_335399ae__.EntityType.Ray), this.serializeKeys = [
            'startPoint',
            'unitVector'
        ];
        Object.assign(this, data);
    }
    getCaptureData() {
        return {
            endPoints: [
                this.startPoint
            ]
        };
    }
}
export { RayEntity };
