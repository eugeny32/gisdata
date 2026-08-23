import * as __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_DatabaseObject_js_4a639819__ from "dxf-writer/src/DatabaseObject.js";
class DimStyle extends __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_DatabaseObject_js_4a639819__["default"] {
    constructor(name, textStyleHandle){
        super([
            'AcDbSymbolTableRecord',
            'AcDbDimStyleTableRecord'
        ]), this.name = name, this.textStyleHandle = textStyleHandle;
    }
    tags(manager) {
        manager.push(0, 'DIMSTYLE');
        manager.push(105, this.handle);
        manager.push(330, this.ownerObjectHandle);
        for (const s of this.subclassMarkers)manager.push(100, s);
        manager.push(2, this.name);
        manager.push(70, 0);
        manager.push(340, this.textStyleHandle);
    }
}
export { DimStyle as default };
