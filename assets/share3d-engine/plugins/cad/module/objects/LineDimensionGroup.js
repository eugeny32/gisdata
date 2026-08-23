import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_Addons_js_c109df0d__ from "three/examples/jsm/Addons.js";
import * as __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_lines_Line2_js_b8170acb__ from "three/examples/jsm/lines/Line2.js";
import * as __WEBPACK_EXTERNAL_MODULE__CADModule_object_material_MaterialUtils_js_726ca42f__ from "../CADModule/object/material/MaterialUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__common_setting_js_26a0d8d5__ from "../common/setting.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_index_js_6619c453__ from "../utils/index.js";
const defaultOptions = {
    showLength: true,
    showAngle: true,
    showArrow: false,
    lengthOffset: 0.5,
    lengthDecimals: 2,
    angleDecimals: 0,
    arrowSize: 0.15
};
class LineDimensionGroup extends __WEBPACK_EXTERNAL_MODULE_three__.Group {
    constructor(startPoint, endPoint, options, parentGroup, parentElement, transformToScreen, getPixelSizeInWorld){
        super(), this.transformToScreen = transformToScreen, this.getPixelSizeInWorld = getPixelSizeInWorld, this.start = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(), this.end = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(), this.direction = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(), this.elementContainer = document.createElement('div'), this.options = {
            ...defaultOptions,
            textSize: __WEBPACK_EXTERNAL_MODULE__common_setting_js_26a0d8d5__.Setting.dimensionConfig.textSize,
            textColor: __WEBPACK_EXTERNAL_MODULE__common_setting_js_26a0d8d5__.Setting.dimensionConfig.textColor,
            dashSize: __WEBPACK_EXTERNAL_MODULE__common_setting_js_26a0d8d5__.Setting.dashSize
        };
        options && Object.assign(this.options, options);
        const dashSize = this.getPixelSizeInWorld?.(this.options.dashSize) ?? this.options.dashSize;
        const materialOption = {
            color: __WEBPACK_EXTERNAL_MODULE__common_setting_js_26a0d8d5__.Setting.dimensionConfig.color,
            transparent: __WEBPACK_EXTERNAL_MODULE__common_setting_js_26a0d8d5__.Setting.dimensionConfig.opacity < 1,
            opacity: __WEBPACK_EXTERNAL_MODULE__common_setting_js_26a0d8d5__.Setting.dimensionConfig.opacity,
            linewidth: __WEBPACK_EXTERNAL_MODULE__common_setting_js_26a0d8d5__.Setting.dimensionConfig.linewidth,
            dashed: true,
            resolution: __WEBPACK_EXTERNAL_MODULE__CADModule_object_material_MaterialUtils_js_726ca42f__.MaterialUtils.globalResolution,
            dashSize,
            gapSize: dashSize / 2,
            depthTest: false,
            depthWrite: false,
            ...this.options.materialOption || {}
        };
        this.options.materialOption = materialOption;
        this.material = new __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_Addons_js_c109df0d__.LineMaterial(materialOption);
        this.updateStartAndEnd(startPoint, endPoint);
        this.init();
        parentGroup?.add(this);
        parentElement?.appendChild(this.elementContainer);
    }
    get lengthDecimals() {
        return this.options.decimals ?? this.options.lengthDecimals;
    }
    get angleDecimals() {
        return this.options.decimals ?? this.options.angleDecimals;
    }
    get materialOption() {
        return this.options.materialOption || {};
    }
    init() {
        if (this.options.showLength) this.createLengthDimension();
        if (this.options.showAngle) this.createAngleDimension();
        this.elementContainer.className = 'line-dimension-container';
        Object.assign(this.elementContainer.style, {
            position: 'absolute',
            left: 0,
            top: 0,
            pointerEvents: 'none'
        });
    }
    updateStartAndEnd(startPoint, endPoint) {
        this.start.copy({
            ...startPoint,
            z: startPoint.z ?? 0
        });
        this.end.copy({
            ...endPoint,
            z: endPoint.z ?? 0
        });
        this.direction.subVectors(this.end, this.start);
    }
    drawLineObject(points, parent) {
        const geometry = __WEBPACK_EXTERNAL_MODULE__utils_index_js_6619c453__.DrawUtils.getLineGeometryByPoints(points);
        const line = new __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_lines_Line2_js_b8170acb__.Line2(geometry, this.material);
        line.computeLineDistances();
        line.renderOrder = 999;
        parent.add(line);
        return line;
    }
    updateLineObject(line, points) {
        if (!line) return;
        line.geometry.dispose();
        line.geometry = __WEBPACK_EXTERNAL_MODULE__utils_index_js_6619c453__.DrawUtils.getLineGeometryByPoints(points);
        line.computeLineDistances();
    }
    getLengthDimensionData() {
        const offset = this.options.lengthOffset ?? 0.5;
        const { start, end, direction } = this;
        const length = direction.length();
        const dirNormalized = direction.clone().normalize();
        const normal = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(-dirNormalized.y, dirNormalized.x, 0);
        const dimStart = start.clone().add(normal.clone().multiplyScalar(offset));
        const dimEnd = end.clone().add(normal.clone().multiplyScalar(offset));
        const text = length.toFixed(this.lengthDecimals);
        const textPos = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().addVectors(dimStart, dimEnd).multiplyScalar(0.5);
        return {
            start,
            end,
            dimStart,
            dimEnd,
            text,
            textPos
        };
    }
    createLengthDimension() {
        const group = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
        const { start, end, dimStart, dimEnd, text, textPos } = this.getLengthDimensionData();
        const dimLine = this.drawLineObject([
            {
                x: dimStart.x,
                y: dimStart.y,
                z: dimStart.z
            },
            {
                x: dimEnd.x,
                y: dimEnd.y,
                z: dimEnd.z
            }
        ], group);
        dimLine.name = 'LengthDimensionLine';
        const extensionStart1 = this.drawLineObject([
            {
                x: start.x,
                y: start.y,
                z: start.z
            },
            {
                x: dimStart.x,
                y: dimStart.y,
                z: dimStart.z
            }
        ], group);
        const extensionStart2 = this.drawLineObject([
            {
                x: end.x,
                y: end.y,
                z: end.z
            },
            {
                x: dimEnd.x,
                y: dimEnd.y,
                z: dimEnd.z
            }
        ], group);
        extensionStart1.name = 'LengthDimensionExtensionLine1';
        extensionStart2.name = 'LengthDimensionExtensionLine2';
        this.lengthTextElement = this.createText(text, textPos);
        this.elementContainer.appendChild(this.lengthTextElement);
        this.add(group);
        this.lengthDimensionGroup = group;
        return group;
    }
    updateLengthDimension() {
        if (!this.lengthDimensionGroup) return;
        const dimLine = this.lengthDimensionGroup.getObjectByName('LengthDimensionLine');
        const extensionLine1 = this.lengthDimensionGroup.getObjectByName('LengthDimensionExtensionLine1');
        const extensionLine2 = this.lengthDimensionGroup.getObjectByName('LengthDimensionExtensionLine2');
        const { start, end, dimStart, dimEnd, text, textPos } = this.getLengthDimensionData();
        this.updateLineObject(dimLine, [
            dimStart,
            dimEnd
        ]);
        this.updateLineObject(extensionLine1, [
            start,
            dimStart
        ]);
        this.updateLineObject(extensionLine2, [
            end,
            dimEnd
        ]);
        if (this.lengthTextElement) this.updateText(this.lengthTextElement, text, textPos);
    }
    getAngleDimensionData() {
        const { start, direction } = this;
        const length = direction.length();
        const angleRadians = Math.atan2(direction.y, direction.x);
        const angleRadius = this.options.angleRadius ?? length;
        const center = start;
        const xAxisEnd = center.clone().add(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(angleRadius, 0, 0));
        const angleDegrees = 180 * angleRadians / Math.PI;
        const text = `${angleDegrees.toFixed(this.angleDecimals)}°`;
        const midAngle = angleRadians / 2;
        const textPos = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(center.x + Math.cos(midAngle) * angleRadius, center.y + Math.sin(midAngle) * angleRadius, center.z);
        return {
            center: start,
            radius: angleRadius,
            angleRadians,
            xAxisEnd,
            text,
            textPos
        };
    }
    createAngleDimension() {
        const group = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
        const { center, radius, angleRadians, xAxisEnd, text, textPos } = this.getAngleDimensionData();
        const xAxisLine = this.drawLineObject([
            {
                x: center.x,
                y: center.y,
                z: center.z
            },
            {
                x: xAxisEnd.x,
                y: xAxisEnd.y,
                z: xAxisEnd.z
            }
        ], group);
        xAxisLine.name = 'AngleDimensionXAxis';
        const points = __WEBPACK_EXTERNAL_MODULE__utils_index_js_6619c453__.DrawUtils.getArcPoints({
            center: {
                x: 0,
                y: 0
            },
            radius,
            startAngle: 0,
            endAngle: angleRadians,
            clockwise: angleRadians < 0
        });
        const arc = this.drawLineObject(points, group);
        arc.position.copy(center);
        arc.name = 'AngleDimensionArc';
        group.add(arc);
        this.angleTextElement = this.createText(text, {
            x: textPos.x,
            y: textPos.y
        });
        this.elementContainer.appendChild(this.angleTextElement);
        this.add(group);
        this.angleDimensionGroup = group;
        return group;
    }
    updateAngleDimension() {
        if (!this.angleDimensionGroup) return;
        const xAxisLine = this.angleDimensionGroup.getObjectByName('AngleDimensionXAxis');
        const arc = this.angleDimensionGroup.getObjectByName('AngleDimensionArc');
        const { center, radius, angleRadians, xAxisEnd, text, textPos } = this.getAngleDimensionData();
        this.updateLineObject(xAxisLine, [
            center,
            xAxisEnd
        ]);
        this.updateLineObject(arc, __WEBPACK_EXTERNAL_MODULE__utils_index_js_6619c453__.DrawUtils.getArcPoints({
            center: {
                x: 0,
                y: 0
            },
            radius,
            startAngle: 0,
            endAngle: angleRadians,
            clockwise: angleRadians < 0
        }));
        arc?.position.copy(center);
        if (this.angleTextElement) this.updateText(this.angleTextElement, text, textPos);
    }
    createText(text, position) {
        const screenPos = this.transformToScreen?.({
            x: position.x,
            y: position.y,
            z: 0
        }) ?? position;
        const el = document.createElement('div');
        el.innerText = text;
        el.className = 'dimension-item';
        Object.assign(el.style, {
            position: 'absolute',
            left: `${screenPos.x}px`,
            top: `${screenPos.y}px`,
            transform: "translate(-50%, -100%)",
            color: `${this.options.textColor}`,
            fontSize: `${this.options.textSize}px`
        });
        el.dataset.x = position.x.toString();
        el.dataset.y = position.y.toString();
        return el;
    }
    updateText(el, text, position) {
        const screenPos = this.transformToScreen?.({
            x: position.x,
            y: position.y,
            z: 0
        }) ?? position;
        Object.assign(el.style, {
            left: `${screenPos.x}px`,
            top: `${screenPos.y}px`
        });
        el.innerText = text;
        el.dataset.x = position.x.toString();
        el.dataset.y = position.y.toString();
    }
    updateTextScreenPosition(el) {
        if (!this.transformToScreen) return;
        const position = {
            x: parseFloat(el.dataset.x),
            y: parseFloat(el.dataset.y)
        };
        const screenPos = this.transformToScreen?.({
            x: position.x,
            y: position.y,
            z: 0
        }) ?? position;
        Object.assign(el.style, {
            left: `${screenPos.x}px`,
            top: `${screenPos.y}px`
        });
    }
    updateOptions(options) {
        const needUpdateLength = void 0 !== options.showLength && options.showLength !== this.options.showLength;
        const needUpdateAngle = void 0 !== options.showAngle && options.showAngle !== this.options.showAngle;
        Object.assign(this.options, options);
        if (needUpdateLength) {
            const isShowLength = !!this.options.showLength;
            if (isShowLength && !this.lengthDimensionGroup) this.createLengthDimension();
            else if (this.lengthDimensionGroup) this.lengthDimensionGroup.visible = isShowLength;
            if (this.lengthTextElement) this.lengthTextElement.style.visibility = isShowLength ? '' : 'hidden';
        }
        if (needUpdateAngle) {
            const isShowAngle = !!this.options.showAngle;
            if (isShowAngle && !this.angleDimensionGroup) this.createAngleDimension();
            else if (this.angleDimensionGroup) this.angleDimensionGroup.visible = isShowAngle;
            if (this.angleTextElement) this.angleTextElement.style.visibility = isShowAngle ? '' : 'hidden';
        }
    }
    updateLine(startPoint, endPoint) {
        this.updateStartAndEnd(startPoint, endPoint);
        this.updateLengthDimension();
        this.updateAngleDimension();
    }
    update() {
        if (this.getPixelSizeInWorld) {
            const dashSize = this.getPixelSizeInWorld(__WEBPACK_EXTERNAL_MODULE__common_setting_js_26a0d8d5__.Setting.dashSize);
            const gapSize = dashSize / 2;
            this.traverse((child)=>{
                if (child instanceof __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_lines_Line2_js_b8170acb__.Line2) {
                    child.material.dashSize = dashSize;
                    child.material.gapSize = gapSize;
                    child.computeLineDistances();
                }
            });
        }
        this.lengthTextElement && this.updateTextScreenPosition(this.lengthTextElement);
        this.angleTextElement && this.updateTextScreenPosition(this.angleTextElement);
    }
    dispose() {
        __WEBPACK_EXTERNAL_MODULE__utils_index_js_6619c453__.DrawUtils.disposeObject(this.lengthDimensionGroup);
        __WEBPACK_EXTERNAL_MODULE__utils_index_js_6619c453__.DrawUtils.disposeObject(this.angleDimensionGroup);
        this.material.dispose();
        this.lengthDimensionGroup = void 0;
        this.angleDimensionGroup = void 0;
        this.parent?.remove(this);
        this.clear();
        this.elementContainer.innerHTML = '';
        this.elementContainer.remove();
        this.lengthTextElement = void 0;
        this.angleTextElement = void 0;
    }
}
export { LineDimensionGroup as default };
