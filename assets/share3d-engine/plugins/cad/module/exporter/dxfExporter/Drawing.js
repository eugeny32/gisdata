import * as __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_BlockRecord_js_3962111d__ from "dxf-writer/src/BlockRecord.js";
import * as __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_DatabaseObject_js_4a639819__ from "dxf-writer/src/DatabaseObject.js";
import * as __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_Drawing_js_8bc2b11b__ from "dxf-writer/src/Drawing.js";
import * as __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_Handle_js_729dac8f__ from "dxf-writer/src/Handle.js";
import * as __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_Table_js_db8967f8__ from "dxf-writer/src/Table.js";
import * as __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_TagsManager_js_52ef568a__ from "dxf-writer/src/TagsManager.js";
import * as __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_TextStyle_js_0e9055c8__ from "dxf-writer/src/TextStyle.js";
import * as __WEBPACK_EXTERNAL_MODULE__constant_js_0d47549d__ from "./constant.js";
const MLEADER_ARROWHEAD_SIZE = 0;
class DxfClassRecord {
    constructor(definition){
        this.definition = definition;
    }
    tags(manager) {
        manager.push(0, 'CLASS');
        manager.push(1, this.definition.appClassName);
        manager.push(2, this.definition.cppClassName);
        manager.push(3, this.definition.appName);
        manager.push(90, this.definition.proxyCapabilities);
        manager.push(91, this.definition.instanceCount);
        manager.push(280, this.definition.wasAProxy);
        manager.push(281, this.definition.isAnEntity);
    }
}
class DxfObjectDictionary extends __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_DatabaseObject_js_4a639819__["default"] {
    constructor(){
        super('AcDbDictionary'), this.entries = new Map();
    }
    addEntry(name, object) {
        object.ownerObjectHandle = this.handle;
        this.entries.set(name, object);
    }
    tags(manager) {
        manager.push(0, 'DICTIONARY');
        super.tags(manager);
        manager.push(281, 1);
        for (const [name, object] of this.entries){
            manager.push(3, name);
            manager.push(350, object.handle);
        }
        for (const object of this.entries.values())object.tags(manager);
    }
}
class DxfMLineStyle extends __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_DatabaseObject_js_4a639819__["default"] {
    constructor(){
        super('AcDbMlineStyle');
    }
    tags(manager) {
        manager.push(0, 'MLINESTYLE');
        super.tags(manager);
        manager.push(2, 'Standard');
        manager.push(70, 0);
        manager.push(62, 256);
        manager.push(51, 90.0);
        manager.push(52, 90.0);
        manager.push(71, 2);
        manager.push(49, 0.5);
        manager.push(62, 256);
        manager.push(6, 'BYLAYER');
        manager.push(49, -0.5);
        manager.push(62, 256);
        manager.push(6, 'BYLAYER');
    }
}
class DxfMLeaderStyle extends __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_DatabaseObject_js_4a639819__["default"] {
    constructor(textStyleHandle, lineTypeHandle){
        super('AcDbMLeaderStyle'), this.textStyleHandle = textStyleHandle, this.lineTypeHandle = lineTypeHandle;
    }
    tags(manager) {
        manager.push(0, 'MLEADERSTYLE');
        super.tags(manager);
        manager.push(179, 2);
        manager.push(170, 2);
        manager.push(171, 1);
        manager.push(172, 0);
        manager.push(90, 2);
        manager.push(40, 0.0);
        manager.push(41, 0.0);
        manager.push(173, 1);
        manager.push(91, -1056964608);
        manager.push(340, this.lineTypeHandle);
        manager.push(92, -2);
        manager.push(290, 1);
        manager.push(42, 2.0);
        manager.push(291, 1);
        manager.push(43, 8.0);
        manager.push(3, 'Standard');
        manager.push(44, MLEADER_ARROWHEAD_SIZE);
        manager.push(300, '');
        manager.push(342, this.textStyleHandle);
        manager.push(174, 1);
        manager.push(178, 1);
        manager.push(175, 1);
        manager.push(176, 0);
        manager.push(93, -1056964608);
        manager.push(45, 4.0);
        manager.push(292, 0);
        manager.push(297, 0);
        manager.push(46, 4.0);
        manager.push(94, -1056964608);
        manager.push(47, 1.0);
        manager.push(49, 1.0);
        manager.push(140, 1.0);
        manager.push(293, 1);
        manager.push(141, 0.0);
        manager.push(294, 1);
        manager.push(177, 0);
        manager.push(142, 1.0);
        manager.push(295, 0);
        manager.push(296, 1);
        manager.push(143, 3.75);
        manager.push(271, 0);
        manager.push(272, 9);
        manager.push(273, 9);
    }
}
class DxfAppId extends __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_DatabaseObject_js_4a639819__["default"] {
    constructor(name){
        super([
            'AcDbSymbolTableRecord',
            'AcDbRegAppTableRecord'
        ]), this.name = name;
    }
    tags(manager) {
        manager.push(0, 'APPID');
        super.tags(manager);
        manager.push(2, this.name);
        manager.push(70, 0);
    }
}
__WEBPACK_EXTERNAL_MODULE_dxf_writer_src_Drawing_js_8bc2b11b__["default"].LINE_TYPES = __WEBPACK_EXTERNAL_MODULE__constant_js_0d47549d__.DXFLineTypes;
class Drawing extends __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_Drawing_js_8bc2b11b__["default"] {
    getAnonDimBlockName() {
        return `*D${++this.anonDimBlockSeq}`;
    }
    constructor(){
        super(), this.registeredMLeaderEntityCount = 0, this.classDefinitions = new Map(), this.modelSpaceEntities = [], this.anonDimBlockSeq = 0;
        this.init();
    }
    init() {
        let styleTable = this.tables['STYLE'];
        if (!styleTable) styleTable = this.addTable('STYLE');
        const defaultStyle = styleTable.elements[0] || new __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_TextStyle_js_0e9055c8__["default"]('Standard');
        defaultStyle.name = 'Standard';
        defaultStyle.fontFileName = 'arial.ttf';
    }
    addDxfClass(definition) {
        this.classDefinitions.set(definition.appClassName, definition);
        return this;
    }
    addAppId(name) {
        const appIdTable = this.tables['APPID'] ?? this.addTable('APPID');
        const elements = appIdTable.elements;
        if (!elements.some((element)=>element.name === name)) appIdTable.add(new DxfAppId(name));
        return this;
    }
    registerMLeaderEntity() {
        this.registeredMLeaderEntityCount += 1;
        this.ensureMLeaderEntityClass();
        return this;
    }
    addModelSpaceEntity(shape, prepend = false) {
        if (prepend) this.modelSpaceEntities.unshift(shape);
        else this.modelSpaceEntities.push(shape);
        return this;
    }
    ensureMLineStyleObjects() {
        if (this.mlineStyleDictionary) return;
        const existingDictionary = this.dictionary.children?.ACAD_MLINESTYLE;
        if (existingDictionary instanceof DxfObjectDictionary) {
            this.mlineStyleDictionary = existingDictionary;
            return;
        }
        const mlineStyleDictionary = new DxfObjectDictionary();
        const mlineStyleObject = new DxfMLineStyle();
        mlineStyleDictionary.addEntry('Standard', mlineStyleObject);
        this.dictionary.addChildDictionary('ACAD_MLINESTYLE', mlineStyleDictionary);
        this.mlineStyleDictionary = mlineStyleDictionary;
        this.mlineStyleObject = mlineStyleObject;
    }
    ensureMLeaderStyleObjects() {
        if (this.mLeaderStyleDictionary) return;
        this.classDefinitions.set('MLEADERSTYLE', {
            appClassName: 'MLEADERSTYLE',
            cppClassName: 'AcDbMLeaderStyle',
            appName: 'ACDB_MLEADERSTYLE_CLASS',
            proxyCapabilities: 4095,
            instanceCount: 1,
            wasAProxy: 0,
            isAnEntity: 0
        });
        const existingDictionary = this.dictionary.children?.ACAD_MLEADERSTYLE;
        if (existingDictionary instanceof DxfObjectDictionary) {
            this.mLeaderStyleDictionary = existingDictionary;
            return;
        }
        const textStyle = this.tables['STYLE']?.elements?.[0] ?? new __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_TextStyle_js_0e9055c8__["default"]('Standard');
        const byBlockLineTypeHandle = this.lineTypes?.ByBlock?.handle ?? '0';
        const mLeaderStyleDictionary = new DxfObjectDictionary();
        const mLeaderStyleObject = new DxfMLeaderStyle(textStyle.handle, byBlockLineTypeHandle);
        mLeaderStyleDictionary.addEntry('Standard', mLeaderStyleObject);
        this.dictionary.addChildDictionary('ACAD_MLEADERSTYLE', mLeaderStyleDictionary);
        this.mLeaderStyleDictionary = mLeaderStyleDictionary;
        this.mLeaderStyleObject = mLeaderStyleObject;
    }
    ensureMLeaderEntityClass() {
        const instanceCount = Math.max(this.registeredMLeaderEntityCount, this.countMLeaderShapes());
        if (instanceCount <= 0) return;
        this.classDefinitions.set('MULTILEADER', {
            appClassName: 'MULTILEADER',
            cppClassName: 'AcDbMLeader',
            appName: 'ACDB_MLEADER_CLASS',
            proxyCapabilities: 1025,
            instanceCount,
            wasAProxy: 0,
            isAnEntity: 1
        });
    }
    countMLeaderShapes() {
        const layerCount = Object.values(this.layers ?? {}).reduce((count, layer)=>{
            const shapes = layer.shapes ?? [];
            return count + shapes.filter((shape)=>this.isMLeaderShape(shape)).length;
        }, 0);
        const modelSpaceCount = this.modelSpaceEntities.filter((shape)=>this.isMLeaderShape(shape)).length;
        return layerCount + modelSpaceCount;
    }
    isMLeaderShape(shape) {
        const candidate = shape;
        return candidate?.dxfEntityName === 'MULTILEADER' || candidate?.constructor?.name === 'MLeader';
    }
    getMLeaderStyleHandle() {
        this.ensureMLeaderStyleObjects();
        return this.mLeaderStyleObject?.handle ?? '0';
    }
    _tagsManager() {
        this.ensureMLineStyleObjects();
        this.ensureMLeaderStyleObjects();
        this.ensureMLeaderEntityClass();
        const manager = new __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_TagsManager_js_52ef568a__["default"]();
        const blockRecordTable = new __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_Table_js_db8967f8__["default"]('BLOCK_RECORD');
        const blocks = Object.values(this.blocks ?? {});
        for (const block of blocks){
            const record = new __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_BlockRecord_js_3962111d__["default"](block.name);
            blockRecordTable.add(record);
            block.ownerObjectHandle = record.handle;
            if (block.end) block.end.ownerObjectHandle = record.handle;
            if (void 0 !== block.recordHandle) block.recordHandle = record.handle;
        }
        const ltypeTable = this._ltypeTable();
        const layerTable = this._layerTable(manager);
        manager.start('HEADER');
        manager.addHeaderVariable('HANDSEED', [
            [
                5,
                __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_Handle_js_729dac8f__["default"].peek()
            ]
        ]);
        const variables = Object.entries(this.headers ?? {});
        for (const [name, values] of variables)manager.addHeaderVariable(name, values);
        manager.end();
        manager.start('CLASSES');
        for (const classDefinition of this.classDefinitions.values())new DxfClassRecord(classDefinition).tags(manager);
        manager.end();
        manager.start('TABLES');
        ltypeTable.tags(manager);
        layerTable.tags(manager);
        const tables = Object.values(this.tables ?? {});
        for (const table of tables)table.tags(manager);
        blockRecordTable.tags(manager);
        manager.end();
        manager.start('BLOCKS');
        for (const block of blocks)block.tags(manager);
        manager.end();
        manager.start('ENTITIES');
        for (const entity of this.modelSpaceEntities){
            entity.ownerObjectHandle = this.modelSpace.handle;
            entity.tags(manager);
        }
        const layers = Object.values(this.layers ?? {});
        for (const layer of layers)layer.shapesTags(this.modelSpace, manager);
        manager.end();
        manager.start('OBJECTS');
        this.dictionary.tags(manager);
        manager.end();
        manager.push(0, 'EOF');
        return manager;
    }
}
export { Drawing as default };
