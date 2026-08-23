import * as __WEBPACK_EXTERNAL_MODULE_inversify__ from "inversify";
import * as __WEBPACK_EXTERNAL_MODULE_nanoid__ from "nanoid";
import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_Addons_js_c109df0d__ from "three/examples/jsm/Addons.js";
import * as __WEBPACK_EXTERNAL_MODULE_xstate__ from "xstate";
import * as __WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__ from "../auxiliaryTool/MouseTipHelper.js";
import * as __WEBPACK_EXTERNAL_MODULE__command_DrawEntityCommand_js_43176e21__ from "../command/DrawEntityCommand.js";
import * as __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__ from "../model/entity/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__object_entityObject_ArrowObject_js_19a798f2__ from "../object/entityObject/ArrowObject.js";
import * as __WEBPACK_EXTERNAL_MODULE__object_material_MaterialUtils_js_90640340__ from "../object/material/MaterialUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__ from "../../container/types.js";
import * as __WEBPACK_EXTERNAL_MODULE__core_tool_StateMachineTool_js_4ff72ac2__ from "../../core/tool/StateMachineTool.js";
import * as __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__ from "../../i18n/tipKeys.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_index_js_57e9e83f__ from "../../utils/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1bc05401__ from "../../../../../shared/constants/index.js";
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
}
const dimensionMachine = (0, __WEBPACK_EXTERNAL_MODULE_xstate__.setup)({
    actions: {
        showMouseTip: (..._args)=>{},
        entryFinished: ()=>{},
        entryPoint2: ()=>{}
    }
}).createMachine({
    id: 'drawDimensionTool',
    initial: 'idle',
    states: {
        idle: {
            on: {
                NEXT: 'draw'
            }
        },
        draw: {
            initial: 'align',
            states: {
                align: {
                    initial: 'point1',
                    states: {
                        point1: {
                            on: {
                                NEXT: 'point2'
                            },
                            entry: {
                                type: 'showMouseTip',
                                params: __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.draw.dimension.firstOrigin
                            }
                        },
                        point2: {
                            on: {
                                NEXT: 'point3'
                            },
                            entry: [
                                {
                                    type: 'showMouseTip',
                                    params: __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.draw.dimension.secondOrigin
                                },
                                'entryPoint2'
                            ]
                        },
                        point3: {
                            on: {
                                NEXT: '#drawDimensionTool.finished'
                            },
                            entry: {
                                type: 'showMouseTip',
                                params: __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.draw.dimension.linePosition
                            }
                        }
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
class DrawDimensionTool extends __WEBPACK_EXTERNAL_MODULE__core_tool_StateMachineTool_js_4ff72ac2__.StateMachineTool {
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
        this.previewLineObject && __WEBPACK_EXTERNAL_MODULE__utils_index_js_57e9e83f__.DrawUtils.disposeObject(this.previewLineObject);
        this.leftArrowObject && __WEBPACK_EXTERNAL_MODULE__utils_index_js_57e9e83f__.DrawUtils.disposeObject(this.leftArrowObject);
        this.rightArrowObject && __WEBPACK_EXTERNAL_MODULE__utils_index_js_57e9e83f__.DrawUtils.disposeObject(this.rightArrowObject);
        this.group.parent?.remove(this.group);
        this.mouseTipHelper.removeTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Draw);
        this.eject(this.auxiliaryMouseHelper);
        this.points = [];
        this.tempPoint = null;
        this.previewLineObject = null;
        this.leftArrowObject = null;
        this.rightArrowObject = null;
        this.entity = null;
        this.currentCommand = null;
        this.dimPointData = null;
        if (this.inputElement) {
            this.inputElement.parentElement?.removeChild(this.inputElement);
            this.inputElement = null;
        }
        this.isInputEdited = false;
    }
    onMouseDown(params) {
        if (0 === params.event.button) {
            if (this.tempPoint && this.points.length < 3) {
                this.points.push({
                    x: this.tempPoint.x,
                    y: this.tempPoint.y
                });
                this.updateCanvas();
                this.send({
                    type: 'NEXT'
                });
            }
        } else if (2 === params.event.button) this.finishDrawing();
    }
    onMouseMove(params) {
        if (this.points.length >= 3) return;
        this.tempPoint = {
            x: params.worldPos.x,
            y: params.worldPos.y
        };
        this.mouseCapture(params);
        this.updateCanvas();
    }
    onKeyDown(params) {
        if (params.event.keyCode === __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1bc05401__.KeyCodes.ESC) this.exit();
        else if (params.event.keyCode === __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1bc05401__.KeyCodes.ENTER) this.finishDrawing();
    }
    mouseCapture(params) {
        if (!this.tempPoint) return;
        const startPoint = this.points.length > 0 ? this.points[this.points.length - 1] : void 0;
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
    entryPoint2() {
        const { screenPoint, angle, length } = this.getInputBoxPositionData();
        this.inputElement = this.createInputBox(screenPoint, angle);
        if (screenPoint) {
            this.inputElement.style.visibility = 'visible';
            this.inputElement.value = length ? length.toFixed(2) : '';
        }
    }
    getInputBoxPositionData() {
        const points = this.tempPoint ? this.points.concat(this.tempPoint) : [
            ...this.points
        ];
        let p1;
        let p2;
        let midPoint;
        let angle;
        let length;
        if (this.dimPointData) {
            p1 = this.dimPointData.d1;
            p2 = this.dimPointData.d2;
        } else if (points.length >= 2) {
            p1 = points[0];
            p2 = points[1];
        }
        if (p1 && p2) {
            midPoint = {
                x: (p1.x + p2.x) / 2,
                y: (p1.y + p2.y) / 2
            };
            const vector = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().subVectors(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(p2.x, p2.y, 0), new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(p1.x, p1.y, 0));
            const dir = vector.clone().normalize();
            angle = Math.atan2(dir.y, dir.x);
            length = vector.length();
            if (angle > Math.PI / 2 || angle < -Math.PI / 2) angle += Math.PI;
        }
        return {
            screenPoint: midPoint ? this.controller.getScreenPosition({
                x: midPoint.x,
                y: midPoint.y,
                z: 0
            }) : void 0,
            angle,
            length
        };
    }
    createInputBox(screenPoint = {
        x: 0,
        y: 0
    }, angle = 0) {
        const inputElement = document.createElement('input');
        Object.assign(inputElement.style, {
            position: 'absolute',
            left: `${screenPoint.x}px`,
            top: `${screenPoint.y}px`,
            width: '60px',
            maxWidth: '-webkit-fill-available',
            outline: 'none',
            backgroundColor: '#fff',
            visibility: 'hidden',
            transform: `translate(-50%, -100%) rotate(${-angle}rad)`,
            color: '#000'
        });
        this.controller.domElement.parentElement?.appendChild(inputElement);
        inputElement.focus();
        inputElement.addEventListener('input', ()=>{
            this.isInputEdited = true;
        });
        inputElement.addEventListener('keydown', (event)=>{
            if ('Enter' === event.key) {
                event.preventDefault();
                this.finishDrawing();
            }
        });
        inputElement.addEventListener('contextmenu', (event)=>{
            event.preventDefault();
            this.finishDrawing();
        });
        return inputElement;
    }
    finishDrawing() {
        if (this.points.length >= 3) {
            this.send({
                type: 'NEXT'
            });
            return;
        }
        if (2 === this.points.length && this.tempPoint) {
            this.points.push({
                x: this.tempPoint.x,
                y: this.tempPoint.y
            });
            this.updateCanvas();
            this.send({
                type: 'NEXT'
            });
        }
    }
    updateInputBox() {
        if (!this.inputElement) return;
        const { screenPoint, angle, length } = this.getInputBoxPositionData();
        if (!screenPoint) {
            this.inputElement.style.visibility = 'hidden';
            return;
        }
        Object.assign(this.inputElement.style, {
            left: `${screenPoint.x}px`,
            top: `${screenPoint.y}px`,
            transform: `translate(-50%, -100%) rotate(${-(angle ?? 0)}rad)`
        });
        this.inputElement.style.visibility = 'visible';
        this.inputElement.focus();
        if (!this.isInputEdited) {
            this.inputElement.value = length ? length.toFixed(2) : '';
            this.inputElement.select();
        }
    }
    updateCanvas() {
        this.updateObject();
        this.updateInputBox();
    }
    updateObject() {
        const points = [
            ...this.points
        ];
        if (this.tempPoint) points.push(this.tempPoint);
        if (points.length < 2) return;
        this.dimPointData = points.length > 2 ? (0, __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.getAlignDimensionPoints)(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(points[0].x, points[0].y, 0), new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(points[1].x, points[1].y, 0), new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(points[2].x, points[2].y, 0)) : null;
        const p1 = this.dimPointData ? this.dimPointData.d1 : points[0];
        const p2 = this.dimPointData ? this.dimPointData.d2 : points[1];
        this.updatePreviewLine(points);
        this.updateArrowObject(p1, p2);
    }
    get materialColor() {
        return this.entity ? this.entity.color : 0xffffff;
    }
    updatePreviewLine(points) {
        if (points.length < 2 || !this.entity) return;
        const lines = [];
        if (2 === points.length) lines.push({
            startPoint: points[0],
            endPoint: points[1]
        });
        else if (points.length > 2 && this.dimPointData) {
            const { d1, d2, e1_start, e1_end, e2_start, e2_end } = this.dimPointData;
            lines.push({
                startPoint: d1,
                endPoint: d2
            });
            lines.push({
                startPoint: e1_start,
                endPoint: e1_end
            });
            lines.push({
                startPoint: e2_start,
                endPoint: e2_end
            });
        }
        const geometry = __WEBPACK_EXTERNAL_MODULE__utils_index_js_57e9e83f__.DrawUtils.getLineSegmentsGeometryByLines(lines);
        if (!this.previewLineObject) {
            this.previewLineObject = new __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_Addons_js_c109df0d__.LineSegments2(geometry, __WEBPACK_EXTERNAL_MODULE__object_material_MaterialUtils_js_90640340__.MaterialUtils.createMaterialByLineType(this.entity.lineType, __WEBPACK_EXTERNAL_MODULE__object_material_MaterialUtils_js_90640340__.MaterialUtils.getMaterialOptionByEntity(this.entity)));
            this.previewLineObject.computeLineDistances();
            this.group.add(this.previewLineObject);
            return;
        }
        this.previewLineObject.geometry.dispose();
        this.previewLineObject.geometry = geometry;
        this.previewLineObject.computeLineDistances();
    }
    updateArrowObject(p1, p2) {
        let material;
        const length = 2.5;
        if (!this.leftArrowObject || !this.rightArrowObject) material = new __WEBPACK_EXTERNAL_MODULE_three__.MeshBasicMaterial({
            color: this.materialColor,
            depthTest: false,
            depthWrite: false
        });
        if (!this.leftArrowObject) {
            this.leftArrowObject = new __WEBPACK_EXTERNAL_MODULE__object_entityObject_ArrowObject_js_19a798f2__.ArrowObject({
                length,
                material
            });
            this.leftArrowObject.name = 'leftArrow';
            this.group.add(this.leftArrowObject);
        }
        if (!this.rightArrowObject) {
            this.rightArrowObject = new __WEBPACK_EXTERNAL_MODULE__object_entityObject_ArrowObject_js_19a798f2__.ArrowObject({
                length,
                material
            });
            this.rightArrowObject.name = 'rightArrow';
            this.group.add(this.rightArrowObject);
        }
        const start = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(p1.x, p1.y, 0);
        const end = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(p2.x, p2.y, 0);
        const dir = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().subVectors(end, start).normalize();
        this.leftArrowObject.update(start, dir, true);
        this.rightArrowObject.update(end, dir, false);
        const isShowArrow = start.distanceTo(end) >= 10;
        this.leftArrowObject.visible = isShowArrow;
        this.rightArrowObject.visible = isShowArrow;
    }
    createEntity(entityData) {
        const entity = new __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.AlignDimensionEntity({
            ...this.viewManager.getEntityDefaultData(entityData),
            id: (0, __WEBPACK_EXTERNAL_MODULE_nanoid__.nanoid)()
        });
        if (entityData?.textHeight) entity.textHeight = entityData.textHeight;
        return entity;
    }
    updateEntity() {
        if (!this.entity || !this.dimPointData) return;
        const { d1, d2 } = this.dimPointData;
        const textPosition = {
            x: (d1.x + d2.x) / 2,
            y: (d1.y + d2.y) / 2
        };
        Object.assign(this.entity, {
            p1: this.points[0],
            p2: this.points[1],
            offsetPoint: this.points[2],
            textPosition,
            dimensionText: this.inputElement && this.isInputEdited ? this.inputElement.value : ''
        });
    }
    isCanCommit() {
        return !!this.entity?.offsetPoint;
    }
    constructor(...args){
        super(...args), this.name = __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.DrawDimensionTool, this.machine = dimensionMachine.provide({
            actions: {
                showMouseTip: (_v, tip)=>{
                    this.showMouseTip(tip);
                },
                entryFinished: ()=>{
                    this.updateEntity();
                    this.exit();
                },
                entryPoint2: ()=>this.entryPoint2()
            }
        }), this.points = [], this.tempPoint = null, this.group = new __WEBPACK_EXTERNAL_MODULE_three__.Group(), this.previewLineObject = null, this.leftArrowObject = null, this.rightArrowObject = null, this.entity = null, this.currentCommand = null, this.dimPointData = null, this.inputElement = null, this.isInputEdited = false;
    }
}
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.CADViewManager),
    _ts_metadata("design:type", "undefined" == typeof CADViewManager ? Object : CADViewManager)
], DrawDimensionTool.prototype, "viewManager", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.EntitySelector),
    _ts_metadata("design:type", "undefined" == typeof EntitySelector ? Object : EntitySelector)
], DrawDimensionTool.prototype, "entitySelector", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.MouseTipHelper),
    _ts_metadata("design:type", "undefined" == typeof MouseTipHelper ? Object : MouseTipHelper)
], DrawDimensionTool.prototype, "mouseTipHelper", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.HistoryManager),
    _ts_metadata("design:type", "undefined" == typeof HistoryManager ? Object : HistoryManager)
], DrawDimensionTool.prototype, "historyManager", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.AuxiliaryMouseHelper),
    _ts_metadata("design:type", "undefined" == typeof AuxiliaryMouseHelper ? Object : AuxiliaryMouseHelper)
], DrawDimensionTool.prototype, "auxiliaryMouseHelper", void 0);
DrawDimensionTool = _ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.injectable)()
], DrawDimensionTool);
export { DrawDimensionTool };
