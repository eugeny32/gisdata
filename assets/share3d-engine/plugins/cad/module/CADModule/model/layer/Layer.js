import * as __WEBPACK_EXTERNAL_MODULE__common_constant_js_335399ae__ from "../common/constant.js";
class Layer {
    constructor(data){
        this.colorMethod = __WEBPACK_EXTERNAL_MODULE__common_constant_js_335399ae__.ColorMethod.RGB;
        this.color = 0xffffff;
        this.lineType = __WEBPACK_EXTERNAL_MODULE__common_constant_js_335399ae__.LineType.Solid;
        this.lineWidth = 0.25;
        this.visible = true;
        this.locked = false;
        Object.assign(this, data);
    }
    serialize() {
        return {
            id: this.id,
            name: this.name,
            colorMethod: this.colorMethod,
            color: this.color,
            lineType: this.lineType,
            lineWidth: this.lineWidth,
            visible: this.visible,
            locked: this.locked
        };
    }
}
export { Layer };
