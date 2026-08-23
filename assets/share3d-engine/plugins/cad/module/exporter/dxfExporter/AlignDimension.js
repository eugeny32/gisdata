import * as __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_DatabaseObject_js_4a639819__ from "dxf-writer/src/DatabaseObject.js";
import * as __WEBPACK_EXTERNAL_MODULE__constant_js_0d47549d__ from "./constant.js";
class AlignDimension extends __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_DatabaseObject_js_4a639819__["default"] {
    constructor(p1, p2, offsetPoint, textPosition, text, textHeight = 2.5, textGap = 0.625, arrowSize = 2.5, hasUserDefinedTextPosition = false, lineTypeHandle, blockName){
        super('AcDbEntity'), this.p1 = p1, this.p2 = p2, this.offsetPoint = offsetPoint, this.textPosition = textPosition, this.text = text, this.textHeight = textHeight, this.textGap = textGap, this.arrowSize = arrowSize, this.hasUserDefinedTextPosition = hasUserDefinedTextPosition, this.lineTypeHandle = lineTypeHandle, this.blockName = blockName, this.lineType = 'ByLayer', this.lineWidth = -1;
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
        manager.point(this.offsetPoint.x, this.offsetPoint.y);
        manager.push(70, 1 | (this.blockName ? 32 : 0) | (this.hasUserDefinedTextPosition ? 128 : 0));
        manager.push(11, this.textPosition.x);
        manager.push(21, this.textPosition.y);
        manager.push(31, 0);
        manager.push(71, 5);
        manager.push(1, this.text);
        manager.push(3, __WEBPACK_EXTERNAL_MODULE__constant_js_0d47549d__.DimStyleName);
        manager.push(100, 'AcDbAlignedDimension');
        manager.push(13, this.p1.x);
        manager.push(23, this.p1.y);
        manager.push(14, this.p2.x);
        manager.push(24, this.p2.y);
        manager.push(1001, 'ACAD');
        manager.push(1000, 'DSTYLE');
        manager.push(1002, '{');
        this.pushShortOverride(manager, 73, 0);
        this.pushShortOverride(manager, 77, 1);
        this.pushShortOverride(manager, 174, 0);
        this.pushRealOverride(manager, 140, this.textHeight);
        this.pushRealOverride(manager, 147, this.textGap);
        this.pushRealOverride(manager, 41, this.arrowSize);
        if (this.lineTypeHandle) {
            this.pushHandleOverride(manager, 343, this.lineTypeHandle);
            this.pushHandleOverride(manager, 344, this.lineTypeHandle);
            this.pushHandleOverride(manager, 345, this.lineTypeHandle);
        }
        manager.push(1002, '}');
    }
    pushShortOverride(manager, code, value) {
        manager.push(1070, code);
        manager.push(1070, value);
    }
    pushRealOverride(manager, code, value) {
        manager.push(1070, code);
        manager.push(1040, value);
    }
    pushHandleOverride(manager, code, handle) {
        manager.push(1070, code);
        manager.push(1005, handle);
    }
}
export { AlignDimension as default };
