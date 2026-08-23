import * as __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__ from "lodash-es";
import * as __WEBPACK_EXTERNAL_MODULE__common_constant_js_335399ae__ from "../common/constant.js";
class BaseEntity {
    constructor(type){
        this.id = '';
        this.layerId = '';
        this.colorMethod = __WEBPACK_EXTERNAL_MODULE__common_constant_js_335399ae__.ColorMethod.BY_LAYER;
        this.color = 0xffffff;
        this.lineType = __WEBPACK_EXTERNAL_MODULE__common_constant_js_335399ae__.LineType.Solid;
        this.lineWidth = 0.25;
        this.baseSerializeKeys = [
            'id',
            'type',
            'layerId',
            'colorMethod',
            'color',
            'lineType',
            'lineWidth'
        ];
        this.type = type;
    }
    clone() {
        const cloned = (0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.cloneDeep)(this);
        return cloned;
    }
    getCaptureData() {
        return {};
    }
    serialize() {
        return (0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.cloneDeep)((0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.pick)(this, [
            ...new Set(this.baseSerializeKeys.concat(this.serializeKeys))
        ]));
    }
}
export { BaseEntity };
