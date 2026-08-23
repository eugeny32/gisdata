import * as __WEBPACK_EXTERNAL_MODULE_inversify__ from "inversify";
import * as __WEBPACK_EXTERNAL_MODULE_nanoid_non_secure_cbb059f4__ from "nanoid/non-secure";
import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_lines_Line2_js_b8170acb__ from "three/examples/jsm/lines/Line2.js";
import * as __WEBPACK_EXTERNAL_MODULE_xstate__ from "xstate";
import * as __WEBPACK_EXTERNAL_MODULE__common_setting_js_85f066cc__ from "../../common/setting.js";
import * as __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__ from "../../container/types.js";
import * as __WEBPACK_EXTERNAL_MODULE__core_tool_StateMachineTool_js_4ff72ac2__ from "../../core/tool/StateMachineTool.js";
import * as __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__ from "../../i18n/tipKeys.js";
import * as __WEBPACK_EXTERNAL_MODULE__objects_LineDimensionGroup_js_6240db4c__ from "../../objects/LineDimensionGroup.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__ from "../../utils/DrawUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_focusCadTipInput_js_15e83685__ from "../../utils/focusCadTipInput.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_styleCadTipNumberInput_js_2c62e34c__ from "../../utils/styleCadTipNumberInput.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1bc05401__ from "../../../../../shared/constants/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__ from "../auxiliaryTool/MouseTipHelper.js";
import * as __WEBPACK_EXTERNAL_MODULE__command_DrawEntityCommand_js_43176e21__ from "../command/DrawEntityCommand.js";
import * as __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__ from "../model/entity/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__object_material_MaterialUtils_js_90640340__ from "../object/material/MaterialUtils.js";
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
}
const polygonMachine = (0, __WEBPACK_EXTERNAL_MODULE_xstate__.setup)({
    actions: {
        showMouseTip: (..._args)=>{},
        entryFinished: ()=>{},
        entryInputEdgeNum: ()=>{},
        exitInputEdgeNum: ()=>{}
    }
}).createMachine({
    id: 'drawPolygonTool',
    initial: 'idle',
    states: {
        idle: {
            on: {
                NEXT: [
                    {
                        target: 'draw.inputEdgeNum'
                    }
                ]
            }
        },
        draw: {
            initial: 'inputEdgeNum',
            states: {
                inputEdgeNum: {
                    entry: 'entryInputEdgeNum',
                    exit: 'exitInputEdgeNum',
                    on: {
                        NEXT: 'center'
                    }
                },
                center: {
                    entry: {
                        type: 'showMouseTip',
                        params: __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.draw.polygon.center
                    },
                    on: {
                        NEXT: 'radius'
                    }
                },
                radius: {
                    entry: {
                        type: 'showMouseTip',
                        params: __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.draw.polygon.circumscribedRadius
                    },
                    on: {
                        NEXT: '#drawPolygonTool.finished'
                    }
                }
            }
        },
        finished: {
            entry: 'entryFinished',
            type: 'final'
        }
    }
});
class DrawPolygonTool extends __WEBPACK_EXTERNAL_MODULE__core_tool_StateMachineTool_js_4ff72ac2__.StateMachineTool {
    onInitialize(entityData) {
        this.viewManager.attachTempObject(this.group);
        this.entitySelector.clearSelection();
        this.inject(this.auxiliaryMouseHelper);
        this.entity = this.createEntity(entityData);
        this.currentCommand = new __WEBPACK_EXTERNAL_MODULE__command_DrawEntityCommand_js_43176e21__.DrawEntityCommand(this.entity, this.viewManager, void 0, this.isCanCommit.bind(this));
        this.historyManager.startCommand(this.currentCommand);
        this.send({
            type: 'NEXT'
        });
    }
    onTerminate() {
        this.historyManager.commitCommand();
        this.lineObject && __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__.DrawUtils.disposeObject(this.lineObject);
        this.dimensionGroup?.dispose();
        this.previewLineObject && __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__.DrawUtils.disposeObject(this.previewLineObject);
        this.group.parent?.remove(this.group);
        this.mouseTipHelper.removeTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Draw);
        this.eject(this.auxiliaryMouseHelper);
        if (this.onDocumentMouseDown) {
            document.removeEventListener('mousedown', this.onDocumentMouseDown, false);
            this.onDocumentMouseDown = null;
        }
        this.points = [];
        this.tempPoint = null;
        this.lineObject = null;
        this.dimensionGroup = null;
        this.previewLineObject = null;
        this.entity = null;
        this.currentCommand = null;
        this.polygonParams = null;
        this.edgeNum = 3;
        this.edgeNumInput = null;
    }
    onMouseDown(params) {
        if (0 === params.event.button) {
            if (this.tempPoint) {
                this.points.push({
                    x: this.tempPoint.x,
                    y: this.tempPoint.y
                });
                this.tempPoint = null;
                this.send({
                    type: 'NEXT'
                });
                this.updateCanvas();
            }
        } else if (2 === params.event.button) {
            if (this.checkState('draw.inputEdgeNum')) this.send({
                type: 'NEXT'
            });
        }
    }
    onMouseMove(params) {
        if (!this.checkState('draw.center') && !this.checkState('draw.radius')) return;
        this.tempPoint = {
            x: params.worldPos.x,
            y: params.worldPos.y
        };
        this.mouseCapture(params);
        this.updateCanvas();
    }
    onKeyDown(params) {
        if (params.event.keyCode === __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1bc05401__.KeyCodes.ESC) this.exit();
        else if (params.event.keyCode === __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1bc05401__.KeyCodes.ENTER) {
            if (this.checkState('draw.inputEdgeNum')) this.send({
                type: 'NEXT'
            });
        }
    }
    onViewerUpdate() {
        this.dimensionGroup?.update();
    }
    mouseCapture(params) {
        if (!this.tempPoint) return;
        const startPoint = this.points[this.points.length - 1];
        const finalPoint = this.auxiliaryMouseHelper.mouseCapture(params, {
            startPoint
        });
        this.tempPoint = {
            x: finalPoint.x,
            y: finalPoint.y
        };
    }
    showMouseTip(tip) {
        this.mouseTipHelper.addTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Draw, tip);
    }
    entryInputEdgeNum() {
        this.mouseTipHelper.removeTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Draw);
        this.removeDocumentMouseDownListener();
        this.mouseTipHelper.addCustomTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Draw, (translate)=>this.createEdgeNumTipElement(translate));
        if (this.edgeNumInput) (0, __WEBPACK_EXTERNAL_MODULE__utils_focusCadTipInput_js_15e83685__.focusCadTipInput)(this.edgeNumInput, true);
    }
    createEdgeNumTipElement(translate) {
        const element = document.createElement('span');
        element.innerText = translate(__WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.draw.polygon.edgeCountLabel);
        element.style = 'background-color: #fff; color: black; padding: 4px; font-size: 12px;';
        const inputElement = document.createElement('input');
        inputElement.type = 'number';
        inputElement.min = '3';
        inputElement.max = '1024';
        inputElement.step = '1';
        inputElement.value = String(this.edgeNum);
        (0, __WEBPACK_EXTERNAL_MODULE__utils_styleCadTipNumberInput_js_2c62e34c__.styleCadTipNumberInput)(inputElement);
        inputElement.addEventListener('change', ()=>{
            const value = parseInt(inputElement.value, 10);
            if (Number.isNaN(value) || value < 3) {
                inputElement.value = '3';
                this.edgeNum = 3;
            } else this.edgeNum = value;
        });
        inputElement.addEventListener('mousedown', (e)=>{
            if (2 === e.button) {
                e.stopPropagation();
                e.preventDefault();
                this.send({
                    type: 'NEXT'
                });
            }
        });
        this.removeDocumentMouseDownListener();
        this.onDocumentMouseDown = (event)=>{
            if (event.target !== inputElement) {
                event.preventDefault();
                (0, __WEBPACK_EXTERNAL_MODULE__utils_focusCadTipInput_js_15e83685__.focusCadTipInput)(inputElement, true);
            }
        };
        document.addEventListener('mousedown', this.onDocumentMouseDown, false);
        element.appendChild(inputElement);
        this.edgeNumInput = inputElement;
        return element;
    }
    exitInputEdgeNum() {
        this.mouseTipHelper.removeTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Draw);
        this.removeDocumentMouseDownListener();
        this.edgeNumInput = null;
    }
    removeDocumentMouseDownListener() {
        if (this.onDocumentMouseDown) {
            document.removeEventListener('mousedown', this.onDocumentMouseDown, false);
            this.onDocumentMouseDown = null;
        }
    }
    updateCanvas() {
        this.updateObject();
    }
    updateObject() {
        const points = [
            ...this.points
        ];
        if (this.tempPoint) points.push(this.tempPoint);
        if (points.length < 2) return;
        const p1 = points[points.length - 2];
        const p2 = points[points.length - 1];
        this.updatePreviewLine(p1, p2);
        this.updateDimensionGroup(p1, p2);
        const polygonParams = this.getPolygonParams(p1, p2, this.edgeNum);
        this.updateLineObject(polygonParams);
        this.polygonParams = polygonParams;
    }
    updatePreviewLine(p1, p2) {
        if (!this.previewLineObject) {
            const dashSize = this.controller.getPixelSizeInWorld(20);
            const materialOption = {
                color: __WEBPACK_EXTERNAL_MODULE__common_setting_js_85f066cc__.Setting.previewLineConfig.color,
                transparent: __WEBPACK_EXTERNAL_MODULE__common_setting_js_85f066cc__.Setting.previewLineConfig.opacity < 1,
                opacity: __WEBPACK_EXTERNAL_MODULE__common_setting_js_85f066cc__.Setting.previewLineConfig.opacity,
                dashSize,
                gapSize: dashSize / 2,
                depthTest: false,
                depthWrite: false
            };
            this.previewLineObject = __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__.DrawUtils.drawDashedLine(p1, p2, materialOption, this.group);
            return;
        }
        const positions = [
            p1,
            p2
        ].flatMap((p)=>[
                p.x,
                p.y,
                0
            ]);
        const { geometry } = this.previewLineObject;
        geometry.setAttribute('position', new __WEBPACK_EXTERNAL_MODULE_three__.Float32BufferAttribute(positions, 3));
        geometry.attributes.position.needsUpdate = true;
        this.previewLineObject.computeLineDistances();
    }
    updateDimensionGroup(startPoint, endPoint) {
        if (this.dimensionGroup) {
            this.dimensionGroup.updateLine(startPoint, endPoint);
            return;
        }
        this.dimensionGroup = new __WEBPACK_EXTERNAL_MODULE__objects_LineDimensionGroup_js_6240db4c__["default"](startPoint, endPoint, {
            showAngle: false
        }, this.group, this.controller.domElement.parentElement, (point)=>this.controller.getScreenPosition(point), (radius)=>this.controller.getPixelSizeInWorld(radius));
    }
    updateLineObject(params) {
        if (!params || !this.entity) {
            this.lineObject && (this.lineObject.visible = false);
            return;
        }
        const points = [
            ...params.vertices,
            params.vertices[0]
        ].map((v)=>({
                x: v.x,
                y: v.y
            }));
        if (this.lineObject) {
            this.lineObject.geometry.setPositions(points.flatMap((p)=>[
                    p.x,
                    p.y,
                    0
                ]));
            this.lineObject.geometry.attributes.position.needsUpdate = true;
        } else {
            const materialOption = __WEBPACK_EXTERNAL_MODULE__object_material_MaterialUtils_js_90640340__.MaterialUtils.getMaterialOptionByEntity(this.entity);
            const material = __WEBPACK_EXTERNAL_MODULE__object_material_MaterialUtils_js_90640340__.MaterialUtils.createMaterialByLineType(this.entity.lineType, materialOption);
            const geometry = __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__.DrawUtils.getLineGeometryByPoints(points);
            this.lineObject = new __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_lines_Line2_js_b8170acb__.Line2(geometry, material);
            this.group.add(this.lineObject);
        }
        this.lineObject.computeLineDistances();
        this.lineObject.visible = true;
    }
    createEntity(entityData) {
        const entity = new __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.PolylineEntity({
            ...this.viewManager.getEntityDefaultData(entityData),
            isClosed: true,
            id: (0, __WEBPACK_EXTERNAL_MODULE_nanoid_non_secure_cbb059f4__.nanoid)()
        });
        return entity;
    }
    updateEntity() {
        if (this.entity && this.polygonParams) Object.assign(this.entity, {
            ...this.polygonParams
        });
    }
    isCanCommit() {
        return this.entity ? this.entity.vertices.length > 2 : false;
    }
    getPolygonParams(p1, p2, edgeNum) {
        const vertices = [];
        const center = {
            x: p1.x,
            y: p1.y
        };
        const radius = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
        if (edgeNum < 3 || radius <= 0) return {
            vertices
        };
        const step = 2 * Math.PI / edgeNum;
        const startAngle = Math.atan2(p2.y - center.y, p2.x - center.x);
        for(let i = 0; i < edgeNum; i++){
            const angle = startAngle + step * i;
            vertices.push({
                x: center.x + Math.cos(angle) * radius,
                y: center.y + Math.sin(angle) * radius,
                bulge: 0
            });
        }
        return {
            vertices
        };
    }
    constructor(...args){
        super(...args), this.name = __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.DrawPolygonTool, this.machine = polygonMachine.provide({
            actions: {
                showMouseTip: (_v, tip)=>{
                    this.showMouseTip(tip);
                },
                entryFinished: ()=>{
                    this.updateEntity();
                    this.exit();
                },
                entryInputEdgeNum: ()=>this.entryInputEdgeNum(),
                exitInputEdgeNum: ()=>this.exitInputEdgeNum()
            }
        }), this.points = [], this.tempPoint = null, this.group = new __WEBPACK_EXTERNAL_MODULE_three__.Group(), this.lineObject = null, this.dimensionGroup = null, this.previewLineObject = null, this.entity = null, this.currentCommand = null, this.polygonParams = null, this.edgeNum = 3, this.edgeNumInput = null, this.onDocumentMouseDown = null;
    }
}
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.CADViewManager),
    _ts_metadata("design:type", "undefined" == typeof CADViewManager ? Object : CADViewManager)
], DrawPolygonTool.prototype, "viewManager", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.EntitySelector),
    _ts_metadata("design:type", "undefined" == typeof EntitySelector ? Object : EntitySelector)
], DrawPolygonTool.prototype, "entitySelector", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.MouseTipHelper),
    _ts_metadata("design:type", "undefined" == typeof MouseTipHelper ? Object : MouseTipHelper)
], DrawPolygonTool.prototype, "mouseTipHelper", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.HistoryManager),
    _ts_metadata("design:type", "undefined" == typeof HistoryManager ? Object : HistoryManager)
], DrawPolygonTool.prototype, "historyManager", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.AuxiliaryMouseHelper),
    _ts_metadata("design:type", "undefined" == typeof AuxiliaryMouseHelper ? Object : AuxiliaryMouseHelper)
], DrawPolygonTool.prototype, "auxiliaryMouseHelper", void 0);
DrawPolygonTool = _ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.injectable)()
], DrawPolygonTool);
export { DrawPolygonTool };
