import * as __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_Arc_js_a1487d8d__ from "dxf-writer/src/Arc.js";
class Arc extends __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_Arc_js_a1487d8d__["default"] {
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
export { Arc as default };
