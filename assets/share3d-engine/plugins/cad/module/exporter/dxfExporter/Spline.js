import * as __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_Spline_js_d744e3d2__ from "dxf-writer/src/Spline.js";
class Spline extends __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_Spline_js_d744e3d2__["default"] {
    constructor(...args){
        super(...args), this.lineType = 'ByLayer', this.lineWidth = -1, this.fitPoints = [];
    }
    tags(manager) {
        super.tags(manager);
        manager.push(6, this.lineType);
        manager.push(62, 256);
        manager.push(370, this.lineWidth);
        if (void 0 !== this.trueColor) manager.push(420, this.trueColor);
        this.fitPoints.forEach((point)=>{
            const [x, y] = point;
            manager.push(11, x);
            manager.push(21, y);
        });
    }
}
export { Spline as default };
