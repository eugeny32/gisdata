import * as __WEBPACK_EXTERNAL_MODULE_inversify__ from "inversify";
import * as __WEBPACK_EXTERNAL_MODULE_nanoid_non_secure_cbb059f4__ from "nanoid/non-secure";
import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_lines_Line2_js_b8170acb__ from "three/examples/jsm/lines/Line2.js";
import * as __WEBPACK_EXTERNAL_MODULE_xstate__ from "xstate";
import * as __WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__ from "../auxiliaryTool/MouseTipHelper.js";
import * as __WEBPACK_EXTERNAL_MODULE__command_DrawEntityCommand_js_43176e21__ from "../command/DrawEntityCommand.js";
import * as __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__ from "../model/entity/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__object_material_MaterialUtils_js_90640340__ from "../object/material/MaterialUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__ from "../../container/types.js";
import * as __WEBPACK_EXTERNAL_MODULE__core_tool_StateMachineTool_js_4ff72ac2__ from "../../core/tool/StateMachineTool.js";
import * as __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__ from "../../i18n/tipKeys.js";
import * as __WEBPACK_EXTERNAL_MODULE__objects_LineDimensionGroup_js_6240db4c__ from "../../objects/LineDimensionGroup.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__ from "../../utils/DrawUtils.js";
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
var drawRectTool_rslib_entry_RectDrawMode = /*#__PURE__*/ function(RectDrawMode) {
    RectDrawMode[RectDrawMode["TwoCorners"] = 1] = "TwoCorners";
    RectDrawMode[RectDrawMode["BaseHeight"] = 2] = "BaseHeight";
    return RectDrawMode;
}({});
const rectMachine = (0, __WEBPACK_EXTERNAL_MODULE_xstate__.setup)({
    actions: {
        showMouseTip: (..._args)=>{},
        entryFinished: ()=>{}
    },
    guards: {
        isMode: ()=>false
    }
}).createMachine({
    id: 'drawRectTool',
    initial: 'idle',
    states: {
        idle: {
            on: {
                NEXT: [
                    {
                        target: 'draw.baseHeight',
                        guard: {
                            type: 'isMode',
                            params: 2
                        }
                    },
                    {
                        target: 'draw.twoCorners'
                    }
                ]
            }
        },
        draw: {
            initial: 'twoCorners',
            states: {
                twoCorners: {
                    initial: 'point1',
                    states: {
                        point1: {
                            on: {
                                NEXT: 'point2'
                            },
                            entry: {
                                type: 'showMouseTip',
                                params: __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.draw.rect.firstCorner
                            }
                        },
                        point2: {
                            on: {
                                NEXT: '#drawRectTool.finished'
                            },
                            entry: {
                                type: 'showMouseTip',
                                params: __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.draw.rect.otherCorner
                            }
                        }
                    }
                },
                baseHeight: {
                    initial: 'point1',
                    states: {
                        point1: {
                            on: {
                                NEXT: 'point2'
                            },
                            entry: {
                                type: 'showMouseTip',
                                params: __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.draw.rect.firstBasePoint
                            }
                        },
                        point2: {
                            on: {
                                NEXT: 'point3'
                            },
                            entry: {
                                type: 'showMouseTip',
                                params: __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.draw.rect.secondBasePoint
                            }
                        },
                        point3: {
                            on: {
                                NEXT: '#drawRectTool.finished',
                                PREVIOUS: 'point2'
                            },
                            entry: {
                                type: 'showMouseTip',
                                params: __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.draw.rect.height
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
class DrawRectTool extends __WEBPACK_EXTERNAL_MODULE__core_tool_StateMachineTool_js_4ff72ac2__.StateMachineTool {
    onInitialize(entityData, mode = 1) {
        this.mode = mode;
        this.viewManager.attachTempObject(this.group);
        this.entitySelector.clearSelection();
        this.inject(this.auxiliaryMouseHelper);
        this.entity = this.createEntity(entityData);
        this.currentCommand = new __WEBPACK_EXTERNAL_MODULE__command_DrawEntityCommand_js_43176e21__.DrawEntityCommand(this.entity, this.viewManager, this.handleUndo.bind(this), this.isCanCommit.bind(this), this.isCanUndoStep.bind(this));
        this.historyManager.startCommand(this.currentCommand);
        this.send({
            type: 'NEXT'
        });
    }
    onTerminate() {
        this.historyManager.commitCommand();
        this.rectObject && __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__.DrawUtils.disposeObject(this.rectObject);
        this.lengthDimensionGroup?.dispose();
        this.widthDimensionGroup?.dispose();
        this.group.parent?.remove(this.group);
        this.mouseTipHelper.removeTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Draw);
        this.eject(this.auxiliaryMouseHelper);
        this.points = [];
        this.tempPoint = null;
        this.rectObject = null;
        this.lengthDimensionGroup = null;
        this.widthDimensionGroup = null;
        this.entity = null;
        this.currentCommand = null;
        this.rectPoints = [];
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
                this.historyManager.refresh();
            }
        } else params.event.button;
    }
    onMouseMove(params) {
        this.tempPoint = {
            x: params.worldPos.x,
            y: params.worldPos.y
        };
        this.mouseCapture(params);
        this.updateCanvas();
    }
    onKeyDown(params) {
        if (params.event.keyCode === __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1bc05401__.KeyCodes.ESC) this.exit();
    }
    onViewerUpdate() {
        this.lengthDimensionGroup?.update();
        this.widthDimensionGroup?.update();
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
    updateCanvas() {
        this.updateObject();
    }
    updateObject() {
        const points = [
            ...this.points
        ];
        if (this.tempPoint) points.push(this.tempPoint);
        if (points.length < 2) return;
        this.rectPoints = this.getRectPointsByMode(this.mode, points);
        const drawPoints = 4 === this.rectPoints.length ? this.rectPoints : points;
        this.updateRectObject(drawPoints);
        this.updateDimensionGroup(drawPoints);
    }
    updateDimensionGroup(points) {
        if (points.length < 2) return;
        const [p1, p2, p3, p4] = points;
        const options = {
            showAngle: false
        };
        const getDimensionGroup = (pointA, pointB)=>new __WEBPACK_EXTERNAL_MODULE__objects_LineDimensionGroup_js_6240db4c__["default"](pointA, pointB, options, this.group, this.controller.domElement.parentElement, (point)=>this.controller.getScreenPosition(point), (radius)=>this.controller.getPixelSizeInWorld(radius));
        if (4 !== points.length) {
            this.lengthDimensionGroup ? this.lengthDimensionGroup.updateLine(p1, p2) : this.lengthDimensionGroup = getDimensionGroup(p1, p2);
            return;
        }
        const line1 = {
            startPoint: p2,
            endPoint: p3
        };
        const line2 = {
            startPoint: p3,
            endPoint: p4
        };
        if (!this.getRectClockwise(p1, p3)) {
            [line1.startPoint, line1.endPoint] = [
                line1.endPoint,
                line1.startPoint
            ];
            [line2.startPoint, line2.endPoint] = [
                line2.endPoint,
                line2.startPoint
            ];
        }
        this.lengthDimensionGroup ? this.lengthDimensionGroup.updateLine(line1.startPoint, line1.endPoint) : this.lengthDimensionGroup = getDimensionGroup(line1.startPoint, line1.endPoint);
        this.widthDimensionGroup ? this.widthDimensionGroup.updateLine(line2.startPoint, line2.endPoint) : this.widthDimensionGroup = getDimensionGroup(line2.startPoint, line2.endPoint);
    }
    updateRectObject(points) {
        if (!this.entity || points.length < 2) return;
        const geometry = __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__.DrawUtils.getLineGeometryByPoints(points.concat(points[0]));
        if (!this.rectObject) {
            this.rectObject = new __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_lines_Line2_js_b8170acb__.Line2(geometry, __WEBPACK_EXTERNAL_MODULE__object_material_MaterialUtils_js_90640340__.MaterialUtils.createMaterialByLineType(this.entity.lineType, __WEBPACK_EXTERNAL_MODULE__object_material_MaterialUtils_js_90640340__.MaterialUtils.getMaterialOptionByEntity(this.entity)));
            this.rectObject.computeLineDistances();
            this.group.add(this.rectObject);
            return;
        }
        this.rectObject.geometry.dispose();
        this.rectObject.geometry = geometry;
        this.rectObject.computeLineDistances();
    }
    createEntity(entityData) {
        const entity = new __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.PolylineEntity({
            ...this.viewManager.getEntityDefaultData(entityData),
            id: (0, __WEBPACK_EXTERNAL_MODULE_nanoid_non_secure_cbb059f4__.nanoid)(),
            vertices: [],
            isClosed: true
        });
        return entity;
    }
    updateEntity() {
        if (this.entity && 4 === this.rectPoints.length) this.entity.vertices = this.rectPoints.map((p)=>({
                x: p.x,
                y: p.y,
                bulge: 0
            }));
    }
    handleUndo() {
        if (this.isCanUndoStep()) {
            this.points.pop();
            this.updateCanvas();
            this.send({
                type: 'PREVIOUS'
            });
        }
    }
    isCanCommit() {
        if (!this.entity || 4 !== this.entity.vertices.length) return false;
        const [p1, p2, p3, _p4] = this.entity.vertices;
        const d1 = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const d2 = Math.hypot(p3.x - p2.x, p3.y - p2.y);
        const esp = 1e-6;
        return d1 > esp && d2 > esp;
    }
    isCanUndoStep() {
        return this.points.length > 1;
    }
    getRectPointsByMode(mode, points) {
        if (1 === mode && points.length >= 2) {
            const [p1, p2] = points.slice(-2);
            return this.getRectPointsByTwoCorners(p1, p2);
        }
        if (2 === mode && points.length >= 3) {
            const [p1, p2, p3] = points.slice(-3);
            return this.getRectByBaseAndHeight(p1, p2, p3);
        }
        return [];
    }
    getRectPointsByTwoCorners(p1, p2) {
        const pt1 = {
            x: p1.x,
            y: p1.y
        };
        const pt2 = {
            x: p2.x,
            y: p1.y
        };
        const pt3 = {
            x: p2.x,
            y: p2.y
        };
        const pt4 = {
            x: p1.x,
            y: p2.y
        };
        return [
            pt1,
            pt2,
            pt3,
            pt4
        ];
    }
    getRectByBaseAndHeight(p1, p2, p3) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const baseLength = Math.sqrt(dx * dx + dy * dy);
        if (0 === baseLength) return [
            p1,
            p1,
            p1,
            p1
        ];
        const ux = -dy / baseLength;
        const uy = dx / baseLength;
        const h = (p3.x - p1.x) * ux + (p3.y - p1.y) * uy;
        const offsetX = ux * h;
        const offsetY = uy * h;
        return [
            {
                x: p1.x,
                y: p1.y
            },
            {
                x: p2.x,
                y: p2.y
            },
            {
                x: p2.x + offsetX,
                y: p2.y + offsetY
            },
            {
                x: p1.x + offsetX,
                y: p1.y + offsetY
            }
        ];
    }
    getRectClockwise(p1, p2) {
        const crossProduct = (p2.x - p1.x) * (p2.y - p1.y);
        return !(crossProduct > 0);
    }
    constructor(...args){
        super(...args), this.name = __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.DrawRectTool, this.machine = rectMachine.provide({
            actions: {
                showMouseTip: (_v, tip)=>{
                    this.showMouseTip(tip);
                },
                entryFinished: ()=>{
                    this.updateEntity();
                    this.exit();
                }
            },
            guards: {
                isMode: (_v, mode)=>this.mode === mode
            }
        }), this.mode = 1, this.points = [], this.tempPoint = null, this.group = new __WEBPACK_EXTERNAL_MODULE_three__.Group(), this.rectObject = null, this.lengthDimensionGroup = null, this.widthDimensionGroup = null, this.entity = null, this.currentCommand = null, this.rectPoints = [];
    }
}
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.CADViewManager),
    _ts_metadata("design:type", "undefined" == typeof CADViewManager ? Object : CADViewManager)
], DrawRectTool.prototype, "viewManager", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.EntitySelector),
    _ts_metadata("design:type", "undefined" == typeof EntitySelector ? Object : EntitySelector)
], DrawRectTool.prototype, "entitySelector", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.MouseTipHelper),
    _ts_metadata("design:type", "undefined" == typeof MouseTipHelper ? Object : MouseTipHelper)
], DrawRectTool.prototype, "mouseTipHelper", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.HistoryManager),
    _ts_metadata("design:type", "undefined" == typeof HistoryManager ? Object : HistoryManager)
], DrawRectTool.prototype, "historyManager", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.AuxiliaryMouseHelper),
    _ts_metadata("design:type", "undefined" == typeof AuxiliaryMouseHelper ? Object : AuxiliaryMouseHelper)
], DrawRectTool.prototype, "auxiliaryMouseHelper", void 0);
DrawRectTool = _ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.injectable)()
], DrawRectTool);
export { DrawRectTool, drawRectTool_rslib_entry_RectDrawMode as RectDrawMode };
