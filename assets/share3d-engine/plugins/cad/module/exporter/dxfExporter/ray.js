import * as __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_DatabaseObject_js_4a639819__ from "dxf-writer/src/DatabaseObject.js";
class Ray extends __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_DatabaseObject_js_4a639819__["default"] {
    constructor(startPoint, unitVector){
        super([
            'AcDbEntity',
            'AcDbRay'
        ]), this.startPoint = startPoint, this.unitVector = unitVector, this.lineType = 'ByLayer', this.lineWidth = -1;
    }
    tags(manager) {
        manager.push(0, 'RAY');
        super.tags(manager);
        manager.push(8, this.layer.name);
        manager.push(6, this.lineType);
        manager.push(62, 256);
        manager.push(370, this.lineWidth);
        if (void 0 !== this.trueColor) manager.push(420, this.trueColor);
        manager.point(this.startPoint.x, this.startPoint.y);
        manager.push(11, this.unitVector.x);
        manager.push(21, this.unitVector.y);
        manager.push(31, 0);
    }
}
export { Ray as default };
