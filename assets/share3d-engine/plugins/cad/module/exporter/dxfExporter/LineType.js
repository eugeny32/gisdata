import * as __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_DatabaseObject_js_4a639819__ from "dxf-writer/src/DatabaseObject.js";
class LineType extends __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_DatabaseObject_js_4a639819__["default"] {
    constructor(name, description, elements){
        super([
            'AcDbSymbolTableRecord',
            'AcDbLinetypeTableRecord'
        ]), this.name = name, this.description = description, this.elements = elements;
        this.name = name;
        this.description = description;
        this.elements = elements;
    }
    tags(manager) {
        manager.push(0, 'LTYPE');
        super.tags(manager);
        manager.push(2, this.name);
        manager.push(3, this.description);
        manager.push(70, 0);
        manager.push(72, 65);
        manager.push(73, this.elements.length);
        manager.push(40, this.getElementsSum());
        this.elements.forEach((element)=>{
            const isNumber = 'number' == typeof element;
            manager.push(49, isNumber ? 1 : element.length);
            if (isNumber) manager.push(74, 0);
            else element.tags?.(manager);
        });
    }
    getElementsSum() {
        return this.elements.reduce((sum, element)=>sum + Math.abs('number' == typeof element ? 1 : element.length), 0);
    }
}
export { LineType as default };
