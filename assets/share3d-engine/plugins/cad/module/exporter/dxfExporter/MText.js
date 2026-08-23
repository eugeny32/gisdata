import * as __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_DatabaseObject_js_4a639819__ from "dxf-writer/src/DatabaseObject.js";
class MText extends __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_DatabaseObject_js_4a639819__["default"] {
    constructor(x, y, height, rotation, value, rectWidth, attachment){
        super([
            'AcDbEntity',
            'AcDbMText'
        ]), this.x = x, this.y = y, this.height = height, this.rotation = rotation, this.value = value, this.rectWidth = rectWidth, this.attachment = attachment, this.lineType = 'ByLayer', this.lineWidth = -1;
    }
    tags(manager) {
        manager.push(0, 'MTEXT');
        super.tags(manager);
        manager.push(8, this.layer.name);
        manager.push(6, this.lineType);
        manager.push(62, 256);
        manager.push(370, this.lineWidth);
        if (void 0 !== this.trueColor) manager.push(420, this.trueColor);
        manager.point(this.x, this.y);
        manager.push(40, this.height);
        if (void 0 !== this.rectWidth) manager.push(41, this.rectWidth);
        manager.push(71, this.attachment);
        manager.push(50, this.rotation);
        this.handleLongMText(manager, this.value);
    }
    handleLongMText(manager, text) {
        const chunkSize = 240;
        const dxfText = text.replace(/\r?\n/g, '\\P');
        let remaining = dxfText;
        while(remaining.length > chunkSize){
            let actualSlice = chunkSize;
            if ('\\' === remaining[actualSlice - 1]) actualSlice -= 1;
            manager.push(3, remaining.substring(0, actualSlice));
            remaining = remaining.substring(actualSlice);
        }
        manager.push(1, remaining);
    }
}
export { MText as default };
