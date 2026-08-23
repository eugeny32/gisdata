import * as __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_DatabaseObject_js_4a639819__ from "dxf-writer/src/DatabaseObject.js";
class Block extends __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_DatabaseObject_js_4a639819__["default"] {
    constructor(name, flag = 1, basePoint = {
        x: 0,
        y: 0
    }){
        super([
            'AcDbEntity',
            'AcDbBlockBegin'
        ]), this.name = name, this.flag = flag, this.basePoint = basePoint, this.shapes = [];
        this.end = new __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_DatabaseObject_js_4a639819__["default"]([
            'AcDbEntity',
            'AcDbBlockEnd'
        ]);
        this.recordHandle = null;
    }
    addShape(shape) {
        this.shapes.push(shape);
    }
    tags(manager) {
        manager.push(0, 'BLOCK');
        super.tags(manager);
        manager.push(2, this.name);
        manager.push(70, this.flag);
        manager.point(this.basePoint.x, this.basePoint.y);
        manager.push(3, this.name);
        manager.push(1, '');
        const ownerHandle = this.recordHandle || this.handle;
        for (const shape of this.shapes){
            shape.ownerObjectHandle = ownerHandle;
            shape.tags(manager);
        }
        manager.push(0, 'ENDBLK');
        this.end.tags(manager);
    }
}
export { Block as default };
