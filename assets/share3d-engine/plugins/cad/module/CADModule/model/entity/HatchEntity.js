import * as __WEBPACK_EXTERNAL_MODULE__common_constant_js_335399ae__ from "../common/constant.js";
import * as __WEBPACK_EXTERNAL_MODULE__BaseEntity_js_4a7a320c__ from "./BaseEntity.js";
var HatchEntity_rslib_entry_FillType = /*#__PURE__*/ function(FillType) {
    FillType["Solid"] = "Solid";
    FillType["Pattern"] = "Pattern";
    FillType["Gradient"] = "Gradient";
    return FillType;
}({});
class HatchEntity extends __WEBPACK_EXTERNAL_MODULE__BaseEntity_js_4a7a320c__.BaseEntity {
    constructor(data){
        super(__WEBPACK_EXTERNAL_MODULE__common_constant_js_335399ae__.EntityType.Hatch), this.patternAngle = 0, this.patternScale = 1, this.fillType = "Solid", this.associative = false, this.loops = {}, this.holes = {}, this.serializeKeys = [
            'patternAngle',
            'patternScale',
            'fillType',
            'patternName',
            'gradientName',
            'gcolor1',
            'gcolor2',
            'associative',
            'loops',
            'holes',
            'startPoint',
            'xDirection'
        ];
        Object.assign(this, data);
    }
}
export { HatchEntity_rslib_entry_FillType as FillType, HatchEntity };
