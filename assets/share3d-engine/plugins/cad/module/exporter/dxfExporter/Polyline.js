import * as __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_DatabaseObject_js_4a639819__ from "dxf-writer/src/DatabaseObject.js";
class Polyline extends __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_DatabaseObject_js_4a639819__["default"] {
    constructor(points, closed = false, startWidth = 0, endWidth = 0){
        super([
            'AcDbEntity',
            'AcDbPolyline'
        ]), this.points = points, this.closed = closed, this.startWidth = startWidth, this.endWidth = endWidth, this.lineType = 'ByLayer', this.lineWidth = -1;
    }
    tags(manager) {
        manager.push(0, 'LWPOLYLINE');
        super.tags(manager);
        manager.push(8, this.layer.name);
        manager.push(6, this.lineType);
        manager.push(62, 256);
        manager.push(370, this.lineWidth);
        if (void 0 !== this.trueColor) manager.push(420, this.trueColor);
        manager.push(90, this.points.length);
        manager.push(70, this.closed ? 1 : 0);
        this.points.forEach((point)=>{
            const [x, y, z] = point;
            manager.push(10, x);
            manager.push(20, y);
            if (0 !== this.startWidth || 0 !== this.endWidth) {
                manager.push(40, this.startWidth);
                manager.push(41, this.endWidth);
            }
            if (void 0 !== z) manager.push(42, z);
        });
    }
}
export { Polyline as default };
