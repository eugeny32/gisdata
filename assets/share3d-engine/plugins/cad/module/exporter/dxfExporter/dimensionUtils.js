import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__CADModule_model_entity_AlignDimensionEntity_js_5c611ae1__ from "../../CADModule/model/entity/AlignDimensionEntity.js";
class DimensionUtils {
    static getAlignedDimensionRenderData(entity, scale = 1) {
        const p1 = {
            x: entity.p1.x * scale,
            y: entity.p1.y * scale
        };
        const p2 = {
            x: entity.p2.x * scale,
            y: entity.p2.y * scale
        };
        const offsetPoint = {
            x: entity.offsetPoint.x * scale,
            y: entity.offsetPoint.y * scale
        };
        const rawTextPosition = {
            x: entity.textPosition.x * scale,
            y: entity.textPosition.y * scale
        };
        const dimPointData = (0, __WEBPACK_EXTERNAL_MODULE__CADModule_model_entity_AlignDimensionEntity_js_5c611ae1__.getAlignDimensionPoints)(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(p1.x, p1.y, 0), new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(p2.x, p2.y, 0), new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(offsetPoint.x, offsetPoint.y, 0), __WEBPACK_EXTERNAL_MODULE__CADModule_model_entity_AlignDimensionEntity_js_5c611ae1__.ALIGN_DIMENSION_EXTENSION_LINE_GAP * scale, __WEBPACK_EXTERNAL_MODULE__CADModule_model_entity_AlignDimensionEntity_js_5c611ae1__.ALIGN_DIMENSION_EXTENSION_LINE_EXTEND * scale);
        const vx = p2.x - p1.x;
        const vy = p2.y - p1.y;
        const length = dimPointData.length;
        const vLen = length || 1;
        const ux = vx / vLen;
        const uy = vy / vLen;
        const nx = -uy;
        const ny = ux;
        const d1 = {
            x: dimPointData.d1.x,
            y: dimPointData.d1.y
        };
        const d2 = {
            x: dimPointData.d2.x,
            y: dimPointData.d2.y
        };
        const e1_start = {
            x: dimPointData.e1_start.x,
            y: dimPointData.e1_start.y
        };
        const e1_end = {
            x: dimPointData.e1_end.x,
            y: dimPointData.e1_end.y
        };
        const e2_start = {
            x: dimPointData.e2_start.x,
            y: dimPointData.e2_start.y
        };
        const e2_end = {
            x: dimPointData.e2_end.x,
            y: dimPointData.e2_end.y
        };
        const measurementText = (()=>{
            const s = length.toFixed(3);
            return s.replace(/\.0+$/, '').replace(/(\.[0-9]*?)0+$/, '$1');
        })();
        const rawDimensionText = entity.dimensionText ?? '';
        const displayText = rawDimensionText.length > 0 ? rawDimensionText.replaceAll('<>', measurementText) : measurementText;
        const dimensionText = rawDimensionText.length > 0 ? rawDimensionText : '<>';
        const textHeight = (entity.textHeight ?? 2.5) * scale;
        const textGap = 0.25 * textHeight;
        const arrowSize = Math.max(textHeight, 0.5);
        const textOffsetFromLine = (rawTextPosition.x - d1.x) * nx + (rawTextPosition.y - d1.y) * ny;
        const hasUserDefinedTextPosition = Math.abs(textOffsetFromLine) > Math.max(1e-6, 0.05 * textHeight);
        const textMidPoint = hasUserDefinedTextPosition ? rawTextPosition : {
            x: rawTextPosition.x + nx * (textGap + 0.5 * textHeight),
            y: rawTextPosition.y + ny * (textGap + 0.5 * textHeight)
        };
        let textRotationDeg = 180 * Math.atan2(vy, vx) / Math.PI;
        if (textRotationDeg > 90 || textRotationDeg <= -90) textRotationDeg += 180;
        return {
            p1,
            p2,
            offsetPoint,
            d1,
            d2,
            e1_start,
            e1_end,
            e2_start,
            e2_end,
            ux,
            uy,
            displayText,
            dimensionText,
            textHeight,
            textGap,
            arrowSize,
            textMidPoint,
            textRotationDeg,
            hasUserDefinedTextPosition
        };
    }
}
export { DimensionUtils as default };
