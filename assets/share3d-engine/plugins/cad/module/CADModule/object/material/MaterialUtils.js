import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_lines_LineMaterial_js_154029c0__ from "three/examples/jsm/lines/LineMaterial.js";
import * as __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__ from "../../model/common/constant.js";
import * as __WEBPACK_EXTERNAL_MODULE__common_setting_js_21703e7d__ from "../../../common/setting.js";
import * as __WEBPACK_EXTERNAL_MODULE__common_utils_js_ae8621eb__ from "../../../common/utils.js";
import * as __WEBPACK_EXTERNAL_MODULE__DashDotLineMaterial_js_19e4d9a6__ from "./DashDotLineMaterial.js";
import * as __WEBPACK_EXTERNAL_MODULE__DoubleDashLineMaterial_js_857950ce__ from "./DoubleDashLineMaterial.js";
function createInitialResolution() {
    if ('undefined' == typeof window) return new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(1, 1);
    return new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(window.innerWidth, window.innerHeight);
}
class MaterialUtils {
    static #_ = this.globalResolution = createInitialResolution();
    static #_2 = this.lineTypeDashScale = __WEBPACK_EXTERNAL_MODULE__common_setting_js_21703e7d__.Setting.dashSize;
    static #_3 = this.lineTypeMaterials = new Set();
    static getPixelWidth(lineWidthInMM) {
        const scale = 4.0;
        return Math.max(lineWidthInMM * scale, 1.0);
    }
    static getMaterialOptionByEntity(entity) {
        return {
            color: entity.color,
            linewidth: MaterialUtils.getPixelWidth(entity.lineWidth),
            resolution: MaterialUtils.globalResolution,
            depthTest: false,
            depthWrite: false
        };
    }
    static setLineTypeDashScale(dashScale) {
        if (Number.isFinite(dashScale) && dashScale > 0) {
            if (Math.abs(dashScale - MaterialUtils.lineTypeDashScale) / dashScale < 0.001) return;
            MaterialUtils.lineTypeDashScale = dashScale;
            MaterialUtils.syncLineTypeMaterials();
        }
    }
    static resetLineTypeDashScale() {
        MaterialUtils.lineTypeDashScale = __WEBPACK_EXTERNAL_MODULE__common_setting_js_21703e7d__.Setting.dashSize;
        MaterialUtils.syncLineTypeMaterials();
    }
    static getLineTypeDashScaleByCamera(camera, renderer, dashPixelSize = __WEBPACK_EXTERNAL_MODULE__common_setting_js_21703e7d__.Setting.dashSize, referencePoint, plane) {
        const dashWorldSize = (0, __WEBPACK_EXTERNAL_MODULE__common_utils_js_ae8621eb__.getPixelSizeInWorldByCamera)(camera, renderer, dashPixelSize, {
            plane,
            referencePoint
        });
        if (!Number.isFinite(dashWorldSize) || dashWorldSize <= 0) return;
        return 1 / dashWorldSize;
    }
    static updateLineTypeDashScale(material, dashScale = MaterialUtils.lineTypeDashScale) {
        if (!material.dashed) return;
        material.dashScale = dashScale;
    }
    static registerLineTypeMaterial(material) {
        MaterialUtils.lineTypeMaterials.add(material);
        const dispose = material.dispose.bind(material);
        material.dispose = ()=>{
            MaterialUtils.lineTypeMaterials.delete(material);
            dispose();
        };
        return material;
    }
    static syncLineTypeMaterials() {
        MaterialUtils.lineTypeMaterials.forEach((material)=>{
            MaterialUtils.updateLineTypeDashScale(material);
        });
    }
    static createMaterialByLineType(lineType, materialOption) {
        const option = {
            ...materialOption
        };
        const dashOption = {
            dashSize: 1,
            gapSize: 0.5,
            dashScale: MaterialUtils.lineTypeDashScale,
            dashed: true
        };
        const dashMaterialOption = {
            ...dashOption,
            ...option,
            dashed: true
        };
        let material;
        switch(lineType){
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.LineType.Dash:
                material = new __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_lines_LineMaterial_js_154029c0__.LineMaterial(dashMaterialOption);
                break;
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.LineType.DashDot:
                material = new __WEBPACK_EXTERNAL_MODULE__DashDotLineMaterial_js_19e4d9a6__.DashDotLineMaterial(dashMaterialOption);
                break;
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.LineType.DoubleDash:
                dashMaterialOption.gapSize = option.gapSize ?? option.dashSize ?? dashOption.dashSize;
                dashMaterialOption.linewidth = Math.max(option.linewidth ?? 1, 4);
                material = new __WEBPACK_EXTERNAL_MODULE__DoubleDashLineMaterial_js_857950ce__.DoubleDashLineMaterial(dashMaterialOption);
                break;
            default:
                material = new __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_lines_LineMaterial_js_154029c0__.LineMaterial(option);
        }
        return MaterialUtils.registerLineTypeMaterial(material);
    }
}
export { MaterialUtils };
