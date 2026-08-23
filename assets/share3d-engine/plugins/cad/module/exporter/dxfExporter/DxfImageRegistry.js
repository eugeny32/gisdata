import * as __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_DatabaseObject_js_4a639819__ from "dxf-writer/src/DatabaseObject.js";
class DxfImageEntity extends __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_DatabaseObject_js_4a639819__["default"] {
    constructor(imageDefHandle, reactorHandle, x, y, pixelWidth, pixelHeight, pixelWidthInModel, pixelHeightInModel){
        super(), this.imageDefHandle = imageDefHandle, this.reactorHandle = reactorHandle, this.x = x, this.y = y, this.pixelWidth = pixelWidth, this.pixelHeight = pixelHeight, this.pixelWidthInModel = pixelWidthInModel, this.pixelHeightInModel = pixelHeightInModel, this.fadeInValue = 0;
    }
    setFadeInValue(value) {
        this.fadeInValue = Math.max(0, Math.min(100, value));
    }
    tags(manager) {
        manager.push(0, 'IMAGE');
        manager.push(5, this.handle);
        manager.push(330, this.ownerObjectHandle);
        manager.push(100, 'AcDbEntity');
        manager.push(8, this.layer.name);
        manager.push(100, 'AcDbRasterImage');
        manager.push(90, 0);
        manager.push(10, this.x);
        manager.push(20, this.y);
        manager.push(30, 0);
        manager.push(11, this.pixelWidthInModel.toFixed(8));
        manager.push(21, 0);
        manager.push(31, 0);
        manager.push(12, 0);
        manager.push(22, this.pixelHeightInModel.toFixed(8));
        manager.push(32, 0);
        manager.push(13, this.pixelWidth);
        manager.push(23, this.pixelHeight);
        manager.push(340, this.imageDefHandle);
        manager.push(70, 7);
        manager.push(280, 1);
        manager.push(281, 50);
        manager.push(282, 50);
        manager.push(283, this.fadeInValue);
        manager.push(360, this.reactorHandle);
        manager.push(71, 1);
        manager.push(91, 2);
        manager.push(14, -0.5);
        manager.push(24, -0.5);
        manager.push(14, this.pixelWidth - 0.5);
        manager.push(24, this.pixelHeight - 0.5);
    }
}
class DxfImageDefReactorObject extends __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_DatabaseObject_js_4a639819__["default"] {
    constructor(imageHandle){
        super('AcDbRasterImageDefReactor');
        this.ownerObjectHandle = imageHandle;
    }
    tags(manager) {
        manager.push(0, 'IMAGEDEF_REACTOR');
        super.tags(manager);
        manager.push(90, 2);
    }
}
class DxfImageDefObject extends __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_DatabaseObject_js_4a639819__["default"] {
    constructor(logoPath, pixelWidth, pixelHeight, pixelWidthInModel, pixelHeightInModel, reactorHandle){
        super('AcDbRasterImageDef'), this.logoPath = logoPath, this.pixelWidth = pixelWidth, this.pixelHeight = pixelHeight, this.pixelWidthInModel = pixelWidthInModel, this.pixelHeightInModel = pixelHeightInModel, this.reactorHandle = reactorHandle;
    }
    tags(manager) {
        manager.push(0, 'IMAGEDEF');
        manager.push(5, this.handle);
        manager.push(102, '{ACAD_REACTORS');
        manager.push(330, this.reactorHandle);
        manager.push(102, '}');
        manager.push(330, this.ownerObjectHandle);
        manager.push(100, 'AcDbRasterImageDef');
        manager.push(90, 0);
        manager.push(1, this.logoPath);
        manager.push(10, this.pixelWidth);
        manager.push(20, this.pixelHeight);
        manager.push(11, this.pixelWidthInModel.toFixed(8));
        manager.push(21, this.pixelHeightInModel.toFixed(8));
        manager.push(280, 1);
        manager.push(281, 0);
    }
}
class DxfImageDictionary extends __WEBPACK_EXTERNAL_MODULE_dxf_writer_src_DatabaseObject_js_4a639819__["default"] {
    constructor(){
        super('AcDbDictionary'), this.entries = new Map(), this.looseObjects = [];
    }
    addEntry(name, object) {
        object.ownerObjectHandle = this.handle;
        this.entries.set(name, object);
    }
    addLooseObject(object) {
        this.looseObjects.push(object);
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
        for (const object of this.looseObjects)object.tags(manager);
    }
}
const IMAGE_CLASSES = [
    {
        appClassName: 'IMAGE',
        cppClassName: 'AcDbRasterImage',
        appName: 'ISM',
        proxyCapabilities: 0,
        instanceCount: 0,
        wasAProxy: 0,
        isAnEntity: 1
    },
    {
        appClassName: 'IMAGEDEF',
        cppClassName: 'AcDbRasterImageDef',
        appName: 'ISM',
        proxyCapabilities: 0,
        instanceCount: 0,
        wasAProxy: 0,
        isAnEntity: 0
    },
    {
        appClassName: 'IMAGEDEF_REACTOR',
        cppClassName: 'AcDbRasterImageDefReactor',
        appName: 'ISM',
        proxyCapabilities: 0,
        instanceCount: 0,
        wasAProxy: 0,
        isAnEntity: 0
    }
];
function getOrCreateImageDictionary(rootDictionary) {
    const existingDictionary = rootDictionary?.children?.ACAD_IMAGE_DICT;
    if (existingDictionary instanceof DxfImageDictionary) return existingDictionary;
    if (!rootDictionary?.addChildDictionary) return null;
    const imageDictionary = new DxfImageDictionary();
    rootDictionary.addChildDictionary('ACAD_IMAGE_DICT', imageDictionary);
    return imageDictionary;
}
function resolveImageLayer(drawing, layerName) {
    const existingLayer = drawing.layers?.[layerName];
    if (existingLayer) return existingLayer;
    const addLayer = drawing.addLayer;
    if ('function' != typeof addLayer) return;
    addLayer.call(drawing, layerName, 7, 'CONTINUOUS');
    return drawing.layers?.[layerName];
}
function registerFrameImage(drawing, artifacts) {
    if (!artifacts || !artifacts.logoPath) return;
    const pixelWidth = artifacts.pixelWidth > 0 ? artifacts.pixelWidth : 1;
    const pixelHeight = artifacts.pixelHeight > 0 ? artifacts.pixelHeight : 1;
    const pixelWidthInModel = artifacts.width / pixelWidth;
    const pixelHeightInModel = artifacts.height / pixelHeight;
    const block = artifacts.frameBlockName ? drawing.blocks?.[artifacts.frameBlockName] : void 0;
    const layer = resolveImageLayer(drawing, artifacts.frameLayerName);
    const rootDictionary = drawing.dictionary;
    if (!layer || !rootDictionary?.addChildDictionary) return;
    const imageDefReactor = new DxfImageDefReactorObject('0');
    const imageDef = new DxfImageDefObject(artifacts.logoPath, pixelWidth, pixelHeight, pixelWidthInModel, pixelHeightInModel, imageDefReactor.handle);
    const imageEntity = new DxfImageEntity(imageDef.handle, imageDefReactor.handle, artifacts.x, artifacts.y, pixelWidth, pixelHeight, pixelWidthInModel, pixelHeightInModel);
    imageEntity.layer = layer;
    imageDefReactor.ownerObjectHandle = imageEntity.handle;
    if (artifacts.options?.fadeInValue) imageEntity.setFadeInValue(artifacts.options.fadeInValue);
    if (artifacts.insertToModelSpace) drawing.addModelSpaceEntity(imageEntity, artifacts.insertAtStart);
    else {
        if (!block) return;
        block.addShape(imageEntity);
    }
    const imageDictionary = getOrCreateImageDictionary(rootDictionary);
    if (!imageDictionary) return;
    imageDictionary.addEntry(`IMAGE_${imageEntity.handle}`, imageDef);
    imageDictionary.addLooseObject(imageDefReactor);
    const addDxfClass = drawing.addDxfClass;
    if ('function' == typeof addDxfClass) for (const imageClass of IMAGE_CLASSES)addDxfClass.call(drawing, imageClass);
}
export { registerFrameImage };
