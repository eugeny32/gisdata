import * as __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_Ellipse_js_5d5f5d41__ from "dxf-writer/src/Ellipse.js";
class Ellipse extends __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_Ellipse_js_5d5f5d41__["default"] {
    constructor(...args){
        super(...args), this.lineType = 'ByLayer', this.lineWidth = -1;
    }
    tags(manager) {
        super.tags(manager);
        manager.push(6, this.lineType);
        manager.push(62, 256);
        manager.push(370, this.lineWidth);
        if (void 0 !== this.trueColor) manager.push(420, this.trueColor);
    }
}
export { Ellipse as default };
