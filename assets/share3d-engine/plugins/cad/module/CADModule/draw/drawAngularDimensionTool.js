import * as __WEBPACK_EXTERNAL_MODULE_inversify__ from "inversify";
import * as __WEBPACK_EXTERNAL_MODULE_nanoid__ from "nanoid";
import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_Addons_js_c109df0d__ from "three/examples/jsm/Addons.js";
import * as __WEBPACK_EXTERNAL_MODULE_xstate__ from "xstate";
import * as __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__ from "../../container/types.js";
import * as __WEBPACK_EXTERNAL_MODULE__core_tool_StateMachineTool_js_4ff72ac2__ from "../../core/tool/StateMachineTool.js";
import * as __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__ from "../../i18n/tipKeys.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_index_js_57e9e83f__ from "../../utils/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1bc05401__ from "../../../../../shared/constants/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__ from "../auxiliaryTool/MouseTipHelper.js";
import * as __WEBPACK_EXTERNAL_MODULE__command_DrawEntityCommand_js_43176e21__ from "../command/DrawEntityCommand.js";
import * as __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__ from "../model/entity/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__object_material_MaterialUtils_js_90640340__ from "../object/material/MaterialUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__angularDimensionSegmentUtils_js_e433ff9c__ from "./angularDimensionSegmentUtils.js";
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
}
const AngularDimensionMouseTip = {
    firstLine: __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.draw.angularDimension.firstLine,
    secondLine: __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.draw.angularDimension.secondLine,
    position: __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.draw.angularDimension.position,
    parallelLinesRetry: __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.draw.angularDimension.parallelLinesRetry
};
const angularDimensionMachine = (0, __WEBPACK_EXTERNAL_MODULE_xstate__.setup)({
    actions: {
        showMouseTip: (..._args)=>{},
        entrySpecifyPosition: ()=>{},
        entryFinished: ()=>{}
    }
}).createMachine({
    id: 'drawAngularDimensionTool',
    initial: 'idle',
    states: {
        idle: {
            on: {
                NEXT: 'draw'
            }
        },
        draw: {
            initial: 'line1',
            states: {
                line1: {
                    on: {
                        NEXT: 'line2'
                    },
                    entry: {
                        type: 'showMouseTip',
                        params: AngularDimensionMouseTip.firstLine
                    }
                },
                line2: {
                    on: {
                        NEXT: 'position',
                        PREVIOUS: 'line1'
                    },
                    entry: {
                        type: 'showMouseTip',
                        params: AngularDimensionMouseTip.secondLine
                    }
                },
                position: {
                    on: {
                        NEXT: '#drawAngularDimensionTool.finished',
                        PREVIOUS: 'line2'
                    },
                    entry: [
                        {
                            type: 'showMouseTip',
                            params: AngularDimensionMouseTip.position
                        },
                        'entrySpecifyPosition'
                    ]
                }
            }
        },
        finished: {
            entry: 'entryFinished',
            type: 'final'
        }
    }
});
class DrawAngularDimensionTool extends __WEBPACK_EXTERNAL_MODULE__core_tool_StateMachineTool_js_4ff72ac2__.StateMachineTool {
    onInitialize(entityData) {
        this.viewManager.attachTempObject(this.group);
        this.entitySelector.clearSelection();
        this.entity = this.createEntity(entityData);
        this.currentCommand = new __WEBPACK_EXTERNAL_MODULE__command_DrawEntityCommand_js_43176e21__.DrawEntityCommand(this.entity, this.viewManager, this.handleUndo.bind(this), this.isCanCommit.bind(this), this.isCanUndoStep.bind(this));
        this.historyManager.startCommand(this.currentCommand);
        this.send({
            type: 'NEXT'
        });
    }
    onTerminate() {
        this.historyManager.commitCommand();
        if (this.selectedLineObject) {
            this.selectedLineObject.geometry.dispose();
            this.selectedLineObject.parent?.remove(this.selectedLineObject);
        }
        if (this.hoverLineObject) {
            this.hoverLineObject.geometry.dispose();
            this.hoverLineObject.parent?.remove(this.hoverLineObject);
        }
        if (this.previewLineObject) {
            this.previewLineObject.geometry.dispose();
            this.previewLineObject.parent?.remove(this.previewLineObject);
        }
        if (this.previewArcObject) {
            this.previewArcObject.geometry.dispose();
            this.previewArcObject.parent?.remove(this.previewArcObject);
        }
        this.previewMaterial?.dispose();
        this.group.parent?.remove(this.group);
        this.mouseTipHelper.removeTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Draw);
        this.removeInputBox();
        this.selectedLineCandidates = [];
        this.currentLineCandidate = null;
        this.tempPoint = null;
        this.selectedLineObject = null;
        this.hoverLineObject = null;
        this.previewLineObject = null;
        this.previewArcObject = null;
        this.selectedLineMaterial = null;
        this.hoverLineMaterial = null;
        this.previewMaterial = null;
        this.entity = null;
        this.currentCommand = null;
    }
    onMouseDown(params) {
        if (0 !== params.event.button) return;
        if (this.selectedLineCandidates.length < 2) {
            if (!this.currentLineCandidate) return;
            if (this.selectedLineCandidates.some((candidate)=>candidate.id === this.currentLineCandidate.id)) return;
            if (this.selectedLineCandidates.length > 0) {
                if (!this.canCreateDimension(this.selectedLineCandidates[0], this.currentLineCandidate)) {
                    this.showMouseTip(AngularDimensionMouseTip.parallelLinesRetry);
                    return;
                }
            }
            this.selectedLineCandidates.push(this.currentLineCandidate);
            this.currentLineCandidate = null;
            this.send({
                type: 'NEXT'
            });
            this.updateCanvas();
            this.historyManager.refresh();
            return;
        }
        if (this.tempPoint && this.getDimensionData()) this.send({
            type: 'NEXT'
        });
    }
    onMouseMove(params) {
        if (this.selectedLineCandidates.length < 2) {
            this.currentLineCandidate = this.getCurrentLineCandidate(params);
            this.tempPoint = null;
            this.updateCanvas();
            return;
        }
        this.tempPoint = {
            x: params.worldPos.x,
            y: params.worldPos.y
        };
        this.updateCanvas();
    }
    onKeyDown(params) {
        if (params.event.keyCode === __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1bc05401__.KeyCodes.ESC) this.exit();
    }
    onViewerUpdate() {
        this.updateInputBox();
    }
    showMouseTip(tip) {
        this.mouseTipHelper.addTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Draw, tip);
    }
    ensureInputBox() {
        if (this.inputElement) return;
        this.inputElement = this.createInputBox();
    }
    createInputBox() {
        const inputElement = document.createElement('input');
        inputElement.readOnly = true;
        inputElement.tabIndex = -1;
        Object.assign(inputElement.style, {
            position: 'absolute',
            width: '72px',
            maxWidth: '-webkit-fill-available',
            outline: 'none',
            backgroundColor: '#fff',
            color: '#000',
            visibility: 'hidden',
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none'
        });
        this.controller.domElement?.parentElement?.appendChild(inputElement);
        return inputElement;
    }
    removeInputBox() {
        if (!this.inputElement) return;
        this.inputElement.parentElement?.removeChild(this.inputElement);
        this.inputElement = null;
    }
    updateInputBox() {
        if (!this.inputElement) return;
        const dimensionData = this.getDimensionData();
        if (!dimensionData) {
            this.inputElement.style.visibility = 'hidden';
            return;
        }
        const screenPoint = this.controller.getScreenPosition(this.getArcMiddlePoint(dimensionData));
        Object.assign(this.inputElement.style, {
            left: `${screenPoint.x}px`,
            top: `${screenPoint.y}px`
        });
        this.inputElement.style.visibility = 'visible';
        this.inputElement.value = dimensionData.angleDegrees.toFixed(2);
    }
    updateCanvas() {
        this.updateSelectedLineObject();
        this.updateHoverLineObject();
        const dimensionData = this.getDimensionData();
        this.updatePreviewLine(dimensionData);
        this.updatePreviewArc(dimensionData);
        this.updateInputBox();
    }
    updateSelectedLineObject() {
        const lines = this.selectedLineCandidates.flatMap((candidate)=>candidate.previewLines);
        if (0 === lines.length) {
            this.selectedLineObject && (this.selectedLineObject.visible = false);
            return;
        }
        const geometry = __WEBPACK_EXTERNAL_MODULE__utils_index_js_57e9e83f__.DrawUtils.getLineSegmentsGeometryByLines(lines);
        if (!this.selectedLineObject) {
            this.selectedLineObject = new __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_Addons_js_c109df0d__.LineSegments2(geometry, this.getSelectedLineMaterial());
            this.selectedLineObject.computeLineDistances();
            this.group.add(this.selectedLineObject);
            return;
        }
        this.selectedLineObject.visible = true;
        this.selectedLineObject.geometry.dispose();
        this.selectedLineObject.geometry = geometry;
        this.selectedLineObject.computeLineDistances();
    }
    updateHoverLineObject() {
        const candidate = this.currentLineCandidate && !this.selectedLineCandidates.some((item)=>item.id === this.currentLineCandidate.id) ? this.currentLineCandidate : null;
        if (!candidate) {
            this.hoverLineObject && (this.hoverLineObject.visible = false);
            return;
        }
        const geometry = __WEBPACK_EXTERNAL_MODULE__utils_index_js_57e9e83f__.DrawUtils.getLineSegmentsGeometryByLines(candidate.previewLines);
        if (!this.hoverLineObject) {
            this.hoverLineObject = new __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_Addons_js_c109df0d__.LineSegments2(geometry, this.getHoverLineMaterial());
            this.hoverLineObject.computeLineDistances();
            this.group.add(this.hoverLineObject);
            return;
        }
        this.hoverLineObject.visible = true;
        this.hoverLineObject.geometry.dispose();
        this.hoverLineObject.geometry = geometry;
        this.hoverLineObject.computeLineDistances();
    }
    updatePreviewLine(dimensionData) {
        if (!this.entity || !dimensionData) {
            this.previewLineObject && (this.previewLineObject.visible = false);
            return;
        }
        const { line1, line2 } = (0, __WEBPACK_EXTERNAL_MODULE__angularDimensionSegmentUtils_js_e433ff9c__.resolveAngularDimensionLinePair)(this.selectedLineCandidates[0], this.selectedLineCandidates[1]);
        const lines = (0, __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.getAngularDimensionLegLines)({
            line1,
            line2
        }, dimensionData);
        const geometry = __WEBPACK_EXTERNAL_MODULE__utils_index_js_57e9e83f__.DrawUtils.getLineSegmentsGeometryByLines(lines);
        if (!this.previewLineObject) {
            this.previewLineObject = new __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_Addons_js_c109df0d__.LineSegments2(geometry, this.getPreviewMaterial());
            this.previewLineObject.computeLineDistances();
            this.group.add(this.previewLineObject);
            return;
        }
        this.previewLineObject.visible = true;
        this.previewLineObject.geometry.dispose();
        this.previewLineObject.geometry = geometry;
        this.previewLineObject.computeLineDistances();
    }
    updatePreviewArc(dimensionData) {
        if (!dimensionData) {
            this.previewArcObject && (this.previewArcObject.visible = false);
            return;
        }
        const geometry = __WEBPACK_EXTERNAL_MODULE__utils_index_js_57e9e83f__.DrawUtils.getLineGeometryByPoints(__WEBPACK_EXTERNAL_MODULE__utils_index_js_57e9e83f__.DrawUtils.getArcPoints({
            center: {
                x: 0,
                y: 0
            },
            radius: dimensionData.radius,
            startAngle: dimensionData.startAngle,
            endAngle: dimensionData.endAngle,
            clockwise: dimensionData.clockwise
        }));
        if (!this.previewArcObject) {
            this.previewArcObject = new __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_Addons_js_c109df0d__.Line2(geometry, this.getPreviewMaterial());
            this.previewArcObject.position.copy(dimensionData.intersection);
            this.previewArcObject.computeLineDistances();
            this.group.add(this.previewArcObject);
            return;
        }
        this.previewArcObject.visible = true;
        this.previewArcObject.geometry.dispose();
        this.previewArcObject.geometry = geometry;
        this.previewArcObject.position.copy(dimensionData.intersection);
        this.previewArcObject.computeLineDistances();
    }
    getPreviewMaterial() {
        if (!this.previewMaterial) {
            if (!this.entity) return;
            this.previewMaterial = __WEBPACK_EXTERNAL_MODULE__object_material_MaterialUtils_js_90640340__.MaterialUtils.createMaterialByLineType(this.entity.lineType, __WEBPACK_EXTERNAL_MODULE__object_material_MaterialUtils_js_90640340__.MaterialUtils.getMaterialOptionByEntity(this.entity));
        }
        return this.previewMaterial;
    }
    getSelectedLineMaterial() {
        if (!this.selectedLineMaterial) {
            if (!this.entity) return;
            this.selectedLineMaterial = this.viewManager.objectManager.getMaterialManager().getCachedSelectMaterial(this.entity);
        }
        return this.selectedLineMaterial;
    }
    getHoverLineMaterial() {
        if (!this.hoverLineMaterial) {
            if (!this.entity) return;
            this.hoverLineMaterial = this.viewManager.objectManager.getMaterialManager().getCachedHoverMaterial(this.entity);
        }
        return this.hoverLineMaterial;
    }
    createEntity(entityData) {
        const entity = new __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.AngularDimensionEntity({
            ...this.viewManager.getEntityDefaultData(entityData),
            id: (0, __WEBPACK_EXTERNAL_MODULE_nanoid__.nanoid)()
        });
        if (entityData?.textHeight) entity.textHeight = entityData.textHeight;
        return entity;
    }
    updateEntity() {
        if (!this.entity || this.selectedLineCandidates.length < 2 || !this.tempPoint) return;
        const { line1, line2 } = (0, __WEBPACK_EXTERNAL_MODULE__angularDimensionSegmentUtils_js_e433ff9c__.resolveAngularDimensionLinePair)(this.selectedLineCandidates[0], this.selectedLineCandidates[1]);
        const dimensionData = (0, __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.getAngularDimensionData)(line1, line2, this.tempPoint, this.tempPoint);
        if (!dimensionData) return;
        const textPosition = this.getArcMiddlePoint(dimensionData);
        Object.assign(this.entity, {
            line1,
            line2,
            arcPoint: {
                x: this.tempPoint.x,
                y: this.tempPoint.y
            },
            textPosition: {
                x: textPosition.x,
                y: textPosition.y
            },
            dimensionText: ''
        });
    }
    handleUndo() {
        if (!this.isCanUndoStep()) return;
        this.selectedLineCandidates.pop();
        this.currentLineCandidate = null;
        this.tempPoint = null;
        this.removeInputBox();
        this.updateCanvas();
        this.send({
            type: 'PREVIOUS'
        });
    }
    isCanCommit() {
        return !!this.entity?.arcPoint;
    }
    isCanUndoStep() {
        return this.selectedLineCandidates.length > 0;
    }
    canCreateDimension(first, second) {
        const { line1, line2 } = (0, __WEBPACK_EXTERNAL_MODULE__angularDimensionSegmentUtils_js_e433ff9c__.resolveAngularDimensionLinePair)(first, second);
        const previewPoint = this.getLineMidPoint(line2);
        return !!(0, __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.getAngularDimensionData)(line1, line2, previewPoint, previewPoint);
    }
    getCurrentLineCandidate(params) {
        const entities = this.entityDetector.handleDetect(params.screenPos);
        const threshold = this.controller.getPixelSizeInWorld(12);
        let candidate = null;
        let minDistance = threshold;
        for (const entity of entities){
            const candidates = (0, __WEBPACK_EXTERNAL_MODULE__angularDimensionSegmentUtils_js_e433ff9c__.buildAngularDimensionSegmentCandidates)(entity);
            for (const item of candidates){
                const distance = (0, __WEBPACK_EXTERNAL_MODULE__angularDimensionSegmentUtils_js_e433ff9c__.getAngularDimensionSegmentDistance)(params.worldPos, item);
                if (distance <= minDistance) {
                    minDistance = distance;
                    candidate = item;
                }
            }
        }
        return candidate;
    }
    getDimensionData() {
        if (this.selectedLineCandidates.length < 2 || !this.tempPoint) return null;
        const { line1, line2 } = (0, __WEBPACK_EXTERNAL_MODULE__angularDimensionSegmentUtils_js_e433ff9c__.resolveAngularDimensionLinePair)(this.selectedLineCandidates[0], this.selectedLineCandidates[1]);
        return (0, __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.getAngularDimensionData)(line1, line2, this.tempPoint, this.tempPoint);
    }
    getArcMiddlePoint(dimensionData) {
        const middleAngle = dimensionData.startAngle + dimensionData.sweepAngle / 2;
        return new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(dimensionData.intersection.x + Math.cos(middleAngle) * dimensionData.radius, dimensionData.intersection.y + Math.sin(middleAngle) * dimensionData.radius, dimensionData.intersection.z);
    }
    getLineMidPoint(line) {
        return {
            x: (line.startPoint.x + line.endPoint.x) / 2,
            y: (line.startPoint.y + line.endPoint.y) / 2
        };
    }
    constructor(...args){
        super(...args), this.name = __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.DrawAngularDimensionTool, this.machine = angularDimensionMachine.provide({
            actions: {
                showMouseTip: (_v, tip)=>{
                    this.showMouseTip(tip);
                },
                entrySpecifyPosition: ()=>{
                    this.ensureInputBox();
                },
                entryFinished: ()=>{
                    this.updateEntity();
                    this.exit();
                }
            }
        }), this.selectedLineCandidates = [], this.currentLineCandidate = null, this.tempPoint = null, this.group = new __WEBPACK_EXTERNAL_MODULE_three__.Group(), this.selectedLineObject = null, this.hoverLineObject = null, this.previewLineObject = null, this.previewArcObject = null, this.selectedLineMaterial = null, this.hoverLineMaterial = null, this.previewMaterial = null, this.entity = null, this.currentCommand = null, this.inputElement = null;
    }
}
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.CADViewManager),
    _ts_metadata("design:type", "undefined" == typeof CADViewManager ? Object : CADViewManager)
], DrawAngularDimensionTool.prototype, "viewManager", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.EntitySelector),
    _ts_metadata("design:type", "undefined" == typeof EntitySelector ? Object : EntitySelector)
], DrawAngularDimensionTool.prototype, "entitySelector", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.EntityDetector),
    _ts_metadata("design:type", "undefined" == typeof EntityDetector ? Object : EntityDetector)
], DrawAngularDimensionTool.prototype, "entityDetector", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.MouseTipHelper),
    _ts_metadata("design:type", "undefined" == typeof MouseTipHelper ? Object : MouseTipHelper)
], DrawAngularDimensionTool.prototype, "mouseTipHelper", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.HistoryManager),
    _ts_metadata("design:type", "undefined" == typeof HistoryManager ? Object : HistoryManager)
], DrawAngularDimensionTool.prototype, "historyManager", void 0);
DrawAngularDimensionTool = _ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.injectable)()
], DrawAngularDimensionTool);
export { DrawAngularDimensionTool };
