import * as __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_DatabaseObject_js_4a639819__ from "dxf-writer/src/DatabaseObject.js";
const H_ALIGN_CODES = [
    'left',
    'center',
    'right'
];
const V_ALIGN_CODES = [
    'baseline',
    'bottom',
    'middle',
    'top'
];
class Text extends __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_DatabaseObject_js_4a639819__["default"] {
    constructor(x, y, height, rotation, value, horizontalAlignment = 'left', verticalAlignment = 'baseline'){
        super([
            'AcDbEntity',
            'AcDbText'
        ]), this.x = x, this.y = y, this.height = height, this.rotation = rotation, this.value = value, this.horizontalAlignment = horizontalAlignment, this.verticalAlignment = verticalAlignment, this.lineType = 'ByLayer', this.lineWidth = -1;
    }
    tags(manager) {
        manager.push(0, 'TEXT');
        super.tags(manager);
        manager.push(8, this.layer.name);
        manager.push(6, this.lineType);
        manager.push(62, 256);
        manager.push(370, this.lineWidth);
        if (void 0 !== this.trueColor) manager.push(420, this.trueColor);
        manager.push(10, this.x);
        manager.push(20, this.y);
        manager.push(30, 0);
        manager.push(40, this.height);
        manager.push(1, this.value);
        manager.push(50, this.rotation);
        const hIdx = H_ALIGN_CODES.indexOf(this.horizontalAlignment);
        const vIdx = V_ALIGN_CODES.indexOf(this.verticalAlignment);
        if (hIdx > 0 || vIdx > 0) {
            manager.push(72, hIdx);
            manager.push(11, this.x);
            manager.push(21, this.y);
            manager.push(31, 0);
            manager.push(100, 'AcDbText');
            manager.push(73, vIdx);
        } else manager.push(100, 'AcDbText');
    }
}
export { Text as default };
