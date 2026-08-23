import * as __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_DatabaseObject_js_4a639819__ from "dxf-writer/src/DatabaseObject.js";
class Solid extends __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_DatabaseObject_js_4a639819__["default"] {
    constructor(p1, p2, p3, p4 = p3){
        super([
            'AcDbEntity',
            'AcDbTrace'
        ]), this.p1 = p1, this.p2 = p2, this.p3 = p3, this.p4 = p4, this.lineType = 'ByLayer', this.lineWidth = -1;
    }
    tags(manager) {
        manager.push(0, 'SOLID');
        super.tags(manager);
        manager.push(8, this.layer.name);
        manager.push(6, this.lineType);
        manager.push(62, 256);
        manager.push(370, this.lineWidth);
        if (void 0 !== this.trueColor) manager.push(420, this.trueColor);
        manager.point(this.p1.x, this.p1.y);
        manager.push(11, this.p2.x);
        manager.push(21, this.p2.y);
        manager.push(31, 0);
        manager.push(12, this.p3.x);
        manager.push(22, this.p3.y);
        manager.push(32, 0);
        manager.push(13, this.p4.x);
        manager.push(23, this.p4.y);
        manager.push(33, 0);
    }
}
export { Solid as default };
