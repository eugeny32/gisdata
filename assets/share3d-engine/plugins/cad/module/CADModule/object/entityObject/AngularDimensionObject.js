import * as __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__ from "lodash-es";
import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_Addons_js_c109df0d__ from "three/examples/jsm/Addons.js";
import * as __WEBPACK_EXTERNAL_MODULE_troika_three_text_1c19a3ab__ from "troika-three-text";
import * as __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_4760f106__ from "../../model/entity/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__material_MaterialUtils_js_8d969826__ from "../material/MaterialUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_index_js_02c78a7f__ from "../../../utils/index.js";
const ENDPOINT_POINT_SIZE = 4;
class AngularDimensionObject extends __WEBPACK_EXTERNAL_MODULE_three__.Object3D {
    constructor(entity, material, color){
        super(), this.entity = entity, this.endpointPointTexture = createEndpointPointTexture();
        this.isCacheMaterial = !!material;
        const dimensionData = this.getDimensionData();
        const lineMaterial = material || this.createMaterial(color);
        this.legLineObject = this.createLegLineObject(dimensionData, lineMaterial);
        this.arcObject = this.createArcObject(dimensionData, lineMaterial);
        this.endpointObject = this.createEndpointObject(dimensionData, color);
        this.textObject = this.createTextObject(dimensionData, color);
        this.init();
    }
    get materialColor() {
        return this.entity.color;
    }
    get material() {
        return this.arcObject.material;
    }
    init() {
        this.add(this.legLineObject);
        this.add(this.arcObject);
        this.add(this.endpointObject);
        this.add(this.textObject);
        this.legLineObject.userData.entity = this.entity;
        this.arcObject.userData.entity = this.entity;
        this.endpointObject.userData.entity = this.entity;
        this.textObject.userData.entity = this.entity;
    }
    onUpdateGeometry() {
        const dimensionData = this.getDimensionData();
        this.legLineObject.geometry.dispose();
        this.legLineObject.geometry = __WEBPACK_EXTERNAL_MODULE__utils_index_js_02c78a7f__.DrawUtils.getLineSegmentsGeometryByLines(this.getLegLines(dimensionData));
        this.legLineObject.geometry.computeBoundingBox();
        this.legLineObject.geometry.computeBoundingSphere();
        this.legLineObject.computeLineDistances();
        this.arcObject.geometry.dispose();
        this.arcObject.geometry = __WEBPACK_EXTERNAL_MODULE__utils_index_js_02c78a7f__.DrawUtils.getLineGeometryByPoints(__WEBPACK_EXTERNAL_MODULE__utils_index_js_02c78a7f__.DrawUtils.getArcPoints({
            center: {
                x: 0,
                y: 0
            },
            radius: dimensionData.radius,
            startAngle: dimensionData.startAngle,
            endAngle: dimensionData.endAngle,
            clockwise: dimensionData.clockwise
        }));
        this.arcObject.position.copy(dimensionData.intersection);
        this.arcObject.geometry.computeBoundingBox();
        this.arcObject.geometry.computeBoundingSphere();
        this.arcObject.computeLineDistances();
        this.updateEndpointObject(dimensionData);
        this.textObject.text = this.getDisplayText(dimensionData.angleDegrees);
        this.textObject.position.copy(dimensionData.textPosition);
        this.textObject.sync();
    }
    onUpdateMaterial(material, color) {
        if (!this.isCacheMaterial) this.arcObject.material.dispose();
        const lineMaterial = material || this.createMaterial(color);
        const materialColor = color ?? this.materialColor;
        this.isCacheMaterial = !!material;
        this.legLineObject.material = lineMaterial;
        this.arcObject.material = lineMaterial;
        this.endpointObject.material.dispose();
        this.endpointObject.material = this.createEndpointMaterial(materialColor);
        this.textObject.color = `#${materialColor.toString(16).padStart(6, '0')}`;
        this.textObject.fontSize = this.entity.textHeight;
        this.textObject.sync();
    }
    dispose() {
        this.legLineObject.geometry.dispose();
        this.arcObject.geometry.dispose();
        if (!this.isCacheMaterial) this.arcObject.material.dispose();
        this.endpointObject.geometry.dispose();
        this.endpointObject.material.dispose();
        this.endpointPointTexture?.dispose();
        this.textObject.dispose();
    }
    clone() {
        return new AngularDimensionObject(this.entity);
    }
    getDimensionData() {
        const { line1, line2, arcPoint, textPosition } = this.entity;
        const dimensionData = (0, __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_4760f106__.getAngularDimensionData)(line1, line2, arcPoint, textPosition);
        if (!dimensionData) throw new Error('Invalid angular dimension geometry.');
        return dimensionData;
    }
    createMaterial(color) {
        const materialOption = __WEBPACK_EXTERNAL_MODULE__material_MaterialUtils_js_8d969826__.MaterialUtils.getMaterialOptionByEntity(this.entity);
        if (void 0 !== color) materialOption.color = color;
        return __WEBPACK_EXTERNAL_MODULE__material_MaterialUtils_js_8d969826__.MaterialUtils.createMaterialByLineType(this.entity.lineType, materialOption);
    }
    createLegLineObject(dimensionData, material) {
        const geometry = __WEBPACK_EXTERNAL_MODULE__utils_index_js_02c78a7f__.DrawUtils.getLineSegmentsGeometryByLines(this.getLegLines(dimensionData));
        const object = new __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_Addons_js_c109df0d__.LineSegments2(geometry, material);
        object.computeLineDistances();
        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();
        return object;
    }
    createArcObject(dimensionData, material) {
        const geometry = __WEBPACK_EXTERNAL_MODULE__utils_index_js_02c78a7f__.DrawUtils.getLineGeometryByPoints(__WEBPACK_EXTERNAL_MODULE__utils_index_js_02c78a7f__.DrawUtils.getArcPoints({
            center: {
                x: 0,
                y: 0
            },
            radius: dimensionData.radius,
            startAngle: dimensionData.startAngle,
            endAngle: dimensionData.endAngle,
            clockwise: dimensionData.clockwise
        }));
        const object = new __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_Addons_js_c109df0d__.Line2(geometry, material);
        object.position.copy(dimensionData.intersection);
        object.computeLineDistances();
        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();
        return object;
    }
    getLegLines(dimensionData) {
        return (0, __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_4760f106__.getAngularDimensionLegLines)(this.entity, dimensionData);
    }
    createEndpointObject(dimensionData, color) {
        const geometry = new __WEBPACK_EXTERNAL_MODULE_three__.BufferGeometry().setFromPoints(this.getEndpointPoints(dimensionData));
        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();
        return new __WEBPACK_EXTERNAL_MODULE_three__.Points(geometry, this.createEndpointMaterial(color ?? this.materialColor));
    }
    updateEndpointObject(dimensionData, endpointObject = this.endpointObject) {
        endpointObject.geometry.setFromPoints(this.getEndpointPoints(dimensionData));
        endpointObject.geometry.attributes.position.needsUpdate = true;
        endpointObject.geometry.computeBoundingBox();
        endpointObject.geometry.computeBoundingSphere();
    }
    createEndpointMaterial(color) {
        const materialOption = __WEBPACK_EXTERNAL_MODULE__material_MaterialUtils_js_8d969826__.MaterialUtils.getMaterialOptionByEntity(this.entity);
        return new __WEBPACK_EXTERNAL_MODULE_three__.PointsMaterial({
            color,
            size: ENDPOINT_POINT_SIZE,
            sizeAttenuation: false,
            transparent: true,
            alphaTest: 0.5,
            map: this.endpointPointTexture,
            ...(0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.pick)(materialOption, [
                'depthTest',
                'depthWrite'
            ])
        });
    }
    getEndpointPoints(dimensionData) {
        const { firstPoint, secondPoint } = (0, __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_4760f106__.getAngularDimensionDefinitionPoints)(this.entity, dimensionData);
        return [
            dimensionData.intersection,
            new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(firstPoint.x, firstPoint.y, 0),
            new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(secondPoint.x, secondPoint.y, 0)
        ];
    }
    createTextObject(dimensionData, materialColor) {
        const color = materialColor ?? this.materialColor;
        const object = new __WEBPACK_EXTERNAL_MODULE_troika_three_text_1c19a3ab__.Text();
        object.text = this.getDisplayText(dimensionData.angleDegrees);
        object.fontSize = this.entity.textHeight;
        object.color = `#${color.toString(16).padStart(6, '0')}`;
        object.position.copy(dimensionData.textPosition);
        object.anchorX = 'center';
        object.anchorY = 'bottom';
        const materialOption = __WEBPACK_EXTERNAL_MODULE__material_MaterialUtils_js_8d969826__.MaterialUtils.getMaterialOptionByEntity(this.entity);
        object.material.depthTest = materialOption.depthTest ?? true;
        object.material.depthWrite = materialOption.depthWrite ?? true;
        object.sync();
        return object;
    }
    getDisplayText(angleDegrees) {
        return this.entity.dimensionText || `${angleDegrees.toFixed(2)}°`;
    }
}
function createEndpointPointTexture() {
    if ('undefined' == typeof document) return;
    const size = 32;
    const radius = size / 2 - 1;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.clearRect(0, 0, size, size);
    context.fillStyle = '#ffffff';
    context.beginPath();
    context.arc(size / 2, size / 2, radius, 0, 2 * Math.PI);
    context.fill();
    return new __WEBPACK_EXTERNAL_MODULE_three__.CanvasTexture(canvas);
}
export { AngularDimensionObject };
