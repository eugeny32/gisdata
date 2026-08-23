import * as __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_DatabaseObject_js_4a639819__ from "dxf-writer/src/DatabaseObject.js";
import * as __WEBPACK_EXTERNAL_MODULE__constant_js_0d47549d__ from "./constant.js";
class AngularDimension extends __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_DatabaseObject_js_4a639819__["default"] {
    constructor(line1Start, line1End, line2Start, line2End, arcPoint, textPosition, text, hasUserDefinedTextPosition = false, blockName){
        super('AcDbEntity'), this.line1Start = line1Start, this.line1End = line1End, this.line2Start = line2Start, this.line2End = line2End, this.arcPoint = arcPoint, this.textPosition = textPosition, this.text = text, this.hasUserDefinedTextPosition = hasUserDefinedTextPosition, this.blockName = blockName, this.lineType = 'ByLayer', this.lineWidth = -1;
    }
    tags(manager) {
        manager.push(0, 'DIMENSION');
        super.tags(manager);
        manager.push(8, this.layer.name);
        manager.push(6, this.lineType);
        manager.push(62, 256);
        manager.push(370, this.lineWidth);
        if (void 0 !== this.trueColor) manager.push(420, this.trueColor);
        manager.push(100, 'AcDbDimension');
        manager.push(280, 0);
        if (this.blockName) manager.push(2, this.blockName);
        manager.push(3, __WEBPACK_EXTERNAL_MODULE__constant_js_0d47549d__.DimStyleName);
        manager.point(this.line2Start.x, this.line2Start.y);
        manager.push(11, this.textPosition.x);
        manager.push(21, this.textPosition.y);
        manager.push(31, 0);
        manager.push(70, 2 | (this.blockName ? 32 : 0) | (this.hasUserDefinedTextPosition ? 128 : 0));
        manager.push(71, 5);
        manager.push(1, this.text || '<>');
        manager.push(100, 'AcDb2LineAngularDimension');
        manager.push(13, this.line1Start.x);
        manager.push(23, this.line1Start.y);
        manager.push(33, 0);
        manager.push(14, this.line1End.x);
        manager.push(24, this.line1End.y);
        manager.push(34, 0);
        manager.push(15, this.line2End.x);
        manager.push(25, this.line2End.y);
        manager.push(35, 0);
        manager.push(16, this.arcPoint.x);
        manager.push(26, this.arcPoint.y);
        manager.push(36, 0);
    }
}
export { AngularDimension as default };
