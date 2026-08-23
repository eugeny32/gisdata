import * as __WEBPACK_EXTERNAL_MODULE__common_constant_js_335399ae__ from "../common/constant.js";
import * as __WEBPACK_EXTERNAL_MODULE__BaseEntity_js_4a7a320c__ from "./BaseEntity.js";
class MTextEntity extends __WEBPACK_EXTERNAL_MODULE__BaseEntity_js_4a7a320c__.BaseEntity {
    constructor(data){
        super(__WEBPACK_EXTERNAL_MODULE__common_constant_js_335399ae__.EntityType.MText), this.textHeight = 2.5, this.rotation = 0, this.attachment = 1, this.serializeKeys = [
            'position',
            'contents',
            'textHeight',
            'rotation',
            'rectWidth',
            'rectHeight',
            'attachment'
        ];
        Object.assign(this, data);
    }
}
export { MTextEntity };
