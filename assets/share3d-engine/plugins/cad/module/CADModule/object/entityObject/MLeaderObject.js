import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_lines_Line2_js_b8170acb__ from "three/examples/jsm/lines/Line2.js";
import * as __WEBPACK_EXTERNAL_MODULE_troika_three_text_1c19a3ab__ from "troika-three-text";
import * as __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_4760f106__ from "../../model/entity/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__material_MaterialUtils_js_8d969826__ from "../material/MaterialUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_index_js_02c78a7f__ from "../../../utils/index.js";
class MLeaderObject extends __WEBPACK_EXTERNAL_MODULE_three__.Object3D {
    constructor(entity, material, color){
        super(), this.entity = entity;
        this.isCacheMaterial = !!material;
        this.lineObject = this.createLineObject(material);
        this.textObject = this.createTextObject(color);
        this.init();
        this.onUpdateGeometry();
    }
    get material() {
        return this.lineObject.material;
    }
    get materialColor() {
        return this.entity.color;
    }
    init() {
        this.add(this.lineObject);
        this.add(this.textObject);
        this.lineObject.userData.entity = this.entity;
        this.lineObject.userData.hitRole = 'mleader-branch';
        this.textObject.userData.entity = this.entity;
        this.textObject.userData.hitRole = 'mleader-text';
    }
    onUpdateGeometry() {
        const points = this.getRenderablePoints();
        const vertices = points.flatMap((point)=>[
                point.x,
                point.y,
                0
            ]);
        this.lineObject.geometry.setPositions(vertices);
        this.lineObject.geometry.attributes.position.needsUpdate = true;
        this.lineObject.geometry.computeBoundingBox();
        this.lineObject.geometry.computeBoundingSphere();
        this.lineObject.computeLineDistances();
        const textPosition = this.getTextPosition();
        this.textObject.text = this.entity.contents;
        this.textObject.fontSize = this.entity.textHeight;
        this.textObject.rotation.z = this.entity.textRotation ?? 0;
        this.textObject.position.set(textPosition.x, textPosition.y, 0);
        this.textObject.sync();
    }
    onUpdateMaterial(material, color) {
        if (!this.isCacheMaterial) this.lineObject.material.dispose();
        const materialColor = color ?? this.materialColor;
        this.isCacheMaterial = !!material;
        this.lineObject.material = material || this.createMaterial(materialColor);
        this.textObject.color = `#${materialColor.toString(16).padStart(6, '0')}`;
        this.textObject.fontSize = this.entity.textHeight;
        this.textObject.rotation.z = this.entity.textRotation ?? 0;
        this.textObject.sync();
    }
    dispose() {
        this.lineObject.geometry.dispose();
        if (!this.isCacheMaterial) this.lineObject.material.dispose();
        this.textObject.dispose();
    }
    clone() {
        return new MLeaderObject(this.entity);
    }
    createLineObject(material) {
        const geometry = __WEBPACK_EXTERNAL_MODULE__utils_index_js_02c78a7f__.DrawUtils.getLineGeometryByPoints(this.getRenderablePoints());
        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();
        return new __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_lines_Line2_js_b8170acb__.Line2(geometry, material || this.createMaterial());
    }
    createMaterial(color) {
        const materialOption = __WEBPACK_EXTERNAL_MODULE__material_MaterialUtils_js_8d969826__.MaterialUtils.getMaterialOptionByEntity(this.entity);
        if (void 0 !== color) materialOption.color = color;
        return __WEBPACK_EXTERNAL_MODULE__material_MaterialUtils_js_8d969826__.MaterialUtils.createMaterialByLineType(this.entity.lineType, materialOption);
    }
    createTextObject(color) {
        const textPosition = this.getTextPosition();
        const object = new __WEBPACK_EXTERNAL_MODULE_troika_three_text_1c19a3ab__.Text();
        object.text = this.entity.contents;
        object.fontSize = this.entity.textHeight;
        object.color = `#${(color ?? this.materialColor).toString(16).padStart(6, '0')}`;
        object.position.set(textPosition.x, textPosition.y, 0);
        object.anchorX = 'left';
        object.anchorY = 'middle';
        object.rotation.z = this.entity.textRotation ?? 0;
        object.whiteSpace = 'pre-wrap';
        object.overflowWrap = 'break-word';
        const materialOption = __WEBPACK_EXTERNAL_MODULE__material_MaterialUtils_js_8d969826__.MaterialUtils.getMaterialOptionByEntity(this.entity);
        object.material.depthTest = materialOption.depthTest ?? true;
        object.material.depthWrite = materialOption.depthWrite ?? true;
        object.sync();
        return object;
    }
    getRenderablePoints() {
        const branch = this.entity.branches[0];
        if (!branch) return [
            {
                x: 0,
                y: 0
            },
            {
                x: 0,
                y: 0
            }
        ];
        const points = (0, __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_4760f106__.getMLeaderBranchPoints)(branch);
        if (1 === points.length) return [
            points[0],
            points[0]
        ];
        return points;
    }
    getTextPosition() {
        if (this.entity.isTextPositionEdited) return this.entity.textPosition;
        return (0, __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_4760f106__.getMLeaderTextPosition)(this.entity.branches[0], this.entity.textPosition, this.entity.textHeight, this.entity.landingGap);
    }
}
export { MLeaderObject };
