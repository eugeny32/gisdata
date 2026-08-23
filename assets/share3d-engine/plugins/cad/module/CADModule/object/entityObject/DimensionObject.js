import * as __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__ from "lodash-es";
import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_lines_LineSegments2_js_18620d24__ from "three/examples/jsm/lines/LineSegments2.js";
import * as __WEBPACK_EXTERNAL_MODULE_troika_three_text_1c19a3ab__ from "troika-three-text";
import * as __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_4760f106__ from "../../model/entity/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__material_MaterialUtils_js_8d969826__ from "../material/MaterialUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_index_js_02c78a7f__ from "../../../utils/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__ArrowObject_js_60cb9350__ from "./ArrowObject.js";
class DimensionObject extends __WEBPACK_EXTERNAL_MODULE_three__.Object3D {
    constructor(entity, material, color){
        super(), this.entity = entity;
        this.isCacheMaterial = !!material;
        const { p1, p2, offsetPoint } = this.entity;
        const dimPointData = (0, __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_4760f106__.getAlignDimensionPoints)(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(p1.x, p1.y, 0), new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(p2.x, p2.y, 0), new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(offsetPoint.x, offsetPoint.y, 0));
        this.lineObject = this.createLineObject(dimPointData, material);
        this.lineObject.computeLineDistances();
        const { leftArrow, rightArrow } = this.createArrowObject(dimPointData, color);
        this.leftArrowObject = leftArrow;
        this.rightArrowObject = rightArrow;
        this.textObject = this.createTextObject(dimPointData, color);
        this.init();
    }
    get materialColor() {
        return this.entity.color;
    }
    get material() {
        return this.lineObject.material;
    }
    init() {
        this.add(this.lineObject);
        this.add(this.leftArrowObject);
        this.add(this.rightArrowObject);
        this.add(this.textObject);
        this.lineObject.userData.entity = this.entity;
        this.leftArrowObject.userData.entity = this.entity;
        this.rightArrowObject.userData.entity = this.entity;
        this.textObject.userData.entity = this.entity;
    }
    onUpdateGeometry() {
        const { p1, p2, offsetPoint, textPosition } = this.entity;
        const dimPointData = (0, __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_4760f106__.getAlignDimensionPoints)(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(p1.x, p1.y, 0), new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(p2.x, p2.y, 0), new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(offsetPoint.x, offsetPoint.y, 0));
        const lines = this.getNeedRenderLines(dimPointData);
        const vertices = lines.flatMap((line)=>[
                line.startPoint,
                line.endPoint
            ]).flatMap((p)=>[
                p.x,
                p.y,
                0
            ]);
        const geometry = this.lineObject.geometry;
        geometry.setPositions(vertices);
        geometry.attributes.position.needsUpdate = true;
        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();
        this.lineObject.computeLineDistances();
        const { d1, d2 } = dimPointData;
        const dir = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().subVectors(d2, d1).normalize();
        this.leftArrowObject.update(d1, dir, true);
        this.rightArrowObject.update(d2, dir, false);
        const isShowArrow = dimPointData.length >= 10;
        this.leftArrowObject.visible = isShowArrow;
        this.rightArrowObject.visible = isShowArrow;
        this.textObject.text = this.entity.dimensionText || dimPointData.length.toFixed(2);
        this.textObject.rotation.z = dimPointData.angle;
        this.textObject.position.set(textPosition.x, textPosition.y, 0);
        this.textObject.sync();
    }
    onUpdateMaterial(material, color) {
        if (!this.isCacheMaterial) this.lineObject.material.dispose();
        const materialColor = color ?? this.materialColor;
        this.isCacheMaterial = !!material;
        this.lineObject.material = material || this.createMaterial(materialColor);
        const arrowMaterial = new __WEBPACK_EXTERNAL_MODULE_three__.MeshBasicMaterial({
            color: materialColor,
            ...(0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.pick)(this.lineObject.material, [
                'depthTest',
                'depthWrite'
            ])
        });
        this.leftArrowObject.material.dispose();
        this.leftArrowObject.material = arrowMaterial;
        this.rightArrowObject.material.dispose();
        this.rightArrowObject.material = arrowMaterial;
        this.textObject.color = `#${materialColor.toString(16).padStart(6, '0')}`;
        this.textObject.fontSize = this.entity.textHeight;
        this.textObject.sync();
    }
    dispose() {
        this.lineObject.geometry.dispose();
        if (!this.isCacheMaterial) this.lineObject.material.dispose();
        this.leftArrowObject.geometry.dispose();
        this.leftArrowObject.material.dispose();
        this.rightArrowObject.geometry.dispose();
        this.rightArrowObject.material.dispose();
        this.textObject.dispose();
    }
    clone() {
        return new DimensionObject(this.entity);
    }
    createLineObject(dimPointData, material) {
        const lines = this.getNeedRenderLines(dimPointData);
        const geometry = __WEBPACK_EXTERNAL_MODULE__utils_index_js_02c78a7f__.DrawUtils.getLineSegmentsGeometryByLines(lines);
        const object = new __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_lines_LineSegments2_js_18620d24__.LineSegments2(geometry, material || this.createMaterial());
        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();
        return object;
    }
    createMaterial(color) {
        const materialOption = __WEBPACK_EXTERNAL_MODULE__material_MaterialUtils_js_8d969826__.MaterialUtils.getMaterialOptionByEntity(this.entity);
        if (color) materialOption.color = color;
        return __WEBPACK_EXTERNAL_MODULE__material_MaterialUtils_js_8d969826__.MaterialUtils.createMaterialByLineType(this.entity.lineType, materialOption);
    }
    getNeedRenderLines(params) {
        const { d1, d2, e1_start, e1_end, e2_start, e2_end } = params;
        return [
            {
                startPoint: d1,
                endPoint: d2
            },
            {
                startPoint: e1_start,
                endPoint: e1_end
            },
            {
                startPoint: e2_start,
                endPoint: e2_end
            }
        ];
    }
    createArrowObject(params, color) {
        const materialOption = __WEBPACK_EXTERNAL_MODULE__material_MaterialUtils_js_8d969826__.MaterialUtils.getMaterialOptionByEntity(this.entity);
        const material = new __WEBPACK_EXTERNAL_MODULE_three__.MeshBasicMaterial({
            color: color ?? this.materialColor,
            ...(0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.pick)(materialOption, [
                'depthTest',
                'depthWrite'
            ])
        });
        const length = 2.5;
        const leftArrow = new __WEBPACK_EXTERNAL_MODULE__ArrowObject_js_60cb9350__.ArrowObject({
            material,
            length
        });
        const rightArrow = new __WEBPACK_EXTERNAL_MODULE__ArrowObject_js_60cb9350__.ArrowObject({
            material,
            length
        });
        const { d1, d2 } = params;
        const dir = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().subVectors(d2, d1).normalize();
        leftArrow.update(d1, dir, true);
        rightArrow.update(d2, dir, false);
        if (params.length < 10) {
            leftArrow.visible = false;
            rightArrow.visible = false;
        }
        return {
            leftArrow,
            rightArrow
        };
    }
    createTextObject(params, materialColor) {
        const { textPosition, dimensionText, textHeight } = this.entity;
        const color = materialColor ?? this.materialColor;
        const object = new __WEBPACK_EXTERNAL_MODULE_troika_three_text_1c19a3ab__.Text();
        object.text = dimensionText || params.length.toFixed(2);
        object.fontSize = textHeight;
        object.color = `#${color.toString(16).padStart(6, '0')}`;
        object.position.set(textPosition.x, textPosition.y, 0);
        object.anchorX = 'center';
        object.anchorY = 'bottom';
        object.rotation.z = params.angle;
        const materialOption = __WEBPACK_EXTERNAL_MODULE__material_MaterialUtils_js_8d969826__.MaterialUtils.getMaterialOptionByEntity(this.entity);
        object.material.depthTest = materialOption.depthTest ?? true;
        object.material.depthWrite = materialOption.depthWrite ?? true;
        object.sync();
        return object;
    }
}
export { DimensionObject };
