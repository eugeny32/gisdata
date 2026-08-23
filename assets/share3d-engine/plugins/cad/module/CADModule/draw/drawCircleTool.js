import * as __WEBPACK_EXTERNAL_MODULE_inversify__ from "inversify";
import * as __WEBPACK_EXTERNAL_MODULE_nanoid_non_secure_cbb059f4__ from "nanoid/non-secure";
import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_lines_Line2_js_b8170acb__ from "three/examples/jsm/lines/Line2.js";
import * as __WEBPACK_EXTERNAL_MODULE_xstate__ from "xstate";
import * as __WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__ from "../auxiliaryTool/MouseTipHelper.js";
import * as __WEBPACK_EXTERNAL_MODULE__command_DrawEntityCommand_js_43176e21__ from "../command/DrawEntityCommand.js";
import * as __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__ from "../model/entity/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__object_material_MaterialUtils_js_90640340__ from "../object/material/MaterialUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__common_setting_js_85f066cc__ from "../../common/setting.js";
import * as __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__ from "../../container/types.js";
import * as __WEBPACK_EXTERNAL_MODULE__core_tool_StateMachineTool_js_4ff72ac2__ from "../../core/tool/StateMachineTool.js";
import * as __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__ from "../../i18n/tipKeys.js";
import * as __WEBPACK_EXTERNAL_MODULE__objects_LineDimensionGroup_js_6240db4c__ from "../../objects/LineDimensionGroup.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_ArcUtils_js_0b275f38__ from "../../utils/ArcUtils.js";
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
var drawCircleTool_rslib_entry_CircleDrawMode = /*#__PURE__*/ function(CircleDrawMode) {
    CircleDrawMode[CircleDrawMode["ThreePoints"] = 1] = "ThreePoints";
    CircleDrawMode[CircleDrawMode["TwoPoints"] = 2] = "TwoPoints";
    CircleDrawMode[CircleDrawMode["CenterRadius"] = 3] = "CenterRadius";
    return CircleDrawMode;
}({});
const circleMachine = (0, __WEBPACK_EXTERNAL_MODULE_xstate__.setup)({
    actions: {
        showMouseTip: (..._args)=>{},
        entryFinished: ()=>{}
    },
    guards: {
        isMode: ()=>false
    }
}).createMachine({
    id: 'drawCircleTool',
    initial: 'idle',
    states: {
        idle: {
            on: {
                NEXT: [
                    {
                        target: 'draw.twoPoints',
                        guard: {
                            type: 'isMode',
                            params: 2
                        }
                    },
                    {
                        target: 'draw.centerRadius',
                        guard: {
                            type: 'isMode',
                            params: 3
                        }
                    },
                    {
                        target: 'draw.threePoints'
                    }
                ]
            }
        },
        draw: {
            initial: 'threePoints',
            states: {
                threePoints: {
                    initial: 'point1',
                    states: {
                        point1: {
                            on: {
                                NEXT: 'point2'
                            },
                            entry: {
                                type: 'showMouseTip',
                                params: __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.draw.circle.firstPoint
                            }
                        },
                        point2: {
                            on: {
                                NEXT: 'point3'
                            },
                            entry: {
                                type: 'showMouseTip',
                                params: __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.draw.circle.secondPoint
                            }
                        },
                        point3: {
                            on: {
                                NEXT: '#drawCircleTool.finished',
                                PREVIOUS: 'point2'
                            },
                            entry: {
                                type: 'showMouseTip',
                                params: __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.draw.circle.thirdPoint
                            }
                        }
                    }
                },
                twoPoints: {
                    initial: 'point1',
                    states: {
                        point1: {
                            on: {
                                NEXT: 'point2'
                            },
                            entry: {
                                type: 'showMouseTip',
                                params: __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.draw.circle.firstDiameterPoint
                            }
                        },
                        point2: {
                            on: {
                                NEXT: '#drawCircleTool.finished'
                            },
                            entry: {
                                type: 'showMouseTip',
                                params: __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.draw.circle.secondDiameterPoint
                            }
                        }
                    }
                },
                centerRadius: {
                    initial: 'center',
                    states: {
                        center: {
                            on: {
                                NEXT: 'radius'
                            },
                            entry: {
                                type: 'showMouseTip',
                                params: __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.draw.circle.centerPoint
                            }
                        },
                        radius: {
                            on: {
                                NEXT: '#drawCircleTool.finished'
                            },
                            entry: {
                                type: 'showMouseTip',
                                params: __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.draw.circle.radius
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
class DrawCircleTool extends __WEBPACK_EXTERNAL_MODULE__core_tool_StateMachineTool_js_4ff72ac2__.StateMachineTool {
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
        this.circleObject && __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__.DrawUtils.disposeObject(this.circleObject);
        this.dimensionGroup?.dispose();
        this.previewLineObject && __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__.DrawUtils.disposeObject(this.previewLineObject);
        this.group.parent?.remove(this.group);
        this.mouseTipHelper.removeTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Draw);
        this.eject(this.auxiliaryMouseHelper);
        this.points = [];
        this.tempPoint = null;
        this.circleObject = null;
        this.dimensionGroup = null;
        this.previewLineObject = null;
        this.entity = null;
        this.currentCommand = null;
        this.circleParams = null;
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
        this.dimensionGroup?.update();
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
        const p1 = points[points.length - 2];
        const p2 = points[points.length - 1];
        this.updatePreviewLine(p1, p2);
        this.updateDimensionGroup(p1, p2);
        const circleParams = this.getCircleParamsByMode(this.mode, points);
        this.updateCircleObject(circleParams);
        this.circleParams = circleParams;
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
        this.dimensionGroup = new __WEBPACK_EXTERNAL_MODULE__objects_LineDimensionGroup_js_6240db4c__["default"](startPoint, endPoint, {}, this.group, this.controller.domElement.parentElement, (point)=>this.controller.getScreenPosition(point), (radius)=>this.controller.getPixelSizeInWorld(radius));
    }
    updateCircleObject(params) {
        if (!params || !this.entity) {
            this.circleObject && (this.circleObject.visible = false);
            return;
        }
        const segmentsNum = __WEBPACK_EXTERNAL_MODULE__utils_ArcUtils_js_0b275f38__.ArcUtils.getDynamicSegments(params.radius, this.controller.getPixelSizeInWorld(1));
        params.segmentsNum = segmentsNum;
        const options = {
            center: {
                x: 0,
                y: 0,
                z: 0
            },
            radius: params.radius,
            segmentsNum
        };
        const points = __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__.DrawUtils.getArcPoints(options);
        const geometry = __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__.DrawUtils.getLineGeometryByPoints(points);
        if (!this.circleObject) {
            const material = __WEBPACK_EXTERNAL_MODULE__object_material_MaterialUtils_js_90640340__.MaterialUtils.createMaterialByLineType(this.entity.lineType, __WEBPACK_EXTERNAL_MODULE__object_material_MaterialUtils_js_90640340__.MaterialUtils.getMaterialOptionByEntity(this.entity));
            this.circleObject = new __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_lines_Line2_js_b8170acb__.Line2(geometry, material);
            this.circleObject.position.set(params.center.x, params.center.y, 0);
            this.circleObject.computeLineDistances();
            this.group.add(this.circleObject);
            return;
        }
        this.circleObject.geometry.dispose();
        this.circleObject.geometry = geometry;
        this.circleObject.position.set(params.center.x, params.center.y, 0);
        this.circleObject.computeLineDistances();
        this.circleObject.visible = true;
    }
    createEntity(entityData) {
        const entity = new __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.CircleEntity({
            ...this.viewManager.getEntityDefaultData(entityData),
            id: (0, __WEBPACK_EXTERNAL_MODULE_nanoid_non_secure_cbb059f4__.nanoid)()
        });
        return entity;
    }
    updateEntity() {
        if (this.entity && this.circleParams) Object.assign(this.entity, {
            ...this.circleParams
        });
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
        return this.entity ? this.entity.radius > 1e-2 : false;
    }
    isCanUndoStep() {
        return this.points.length > 1;
    }
    getCircleParamsByMode(mode, points) {
        if (1 === mode && points.length >= 3) {
            const [p1, p2, p3] = points.slice(-3);
            return this.getCircleParamsByThreePoints(p1, p2, p3);
        }
        if (2 === mode && points.length >= 2) {
            const [p1, p2] = points.slice(-2);
            return this.getCircleParamsByTwoPoints(p1, p2);
        }
        if (3 === mode && points.length >= 2) {
            const [center, radiusPoint] = points.slice(-2);
            return this.getCircleParamsByCenterRadius(center, radiusPoint);
        }
        return null;
    }
    getCircleParamsByThreePoints(p1, p2, p3) {
        const { x: x1, y: y1 } = p1;
        const { x: x2, y: y2 } = p2;
        const { x: x3, y: y3 } = p3;
        const D = 2 * (x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2));
        if (Math.abs(D) < 1e-6) return null;
        const x1_2 = x1 * x1;
        const y1_2 = y1 * y1;
        const x2_2 = x2 * x2;
        const y2_2 = y2 * y2;
        const x3_2 = x3 * x3;
        const y3_2 = y3 * y3;
        const centerX = ((x1_2 + y1_2) * (y2 - y3) + (x2_2 + y2_2) * (y3 - y1) + (x3_2 + y3_2) * (y1 - y2)) / D;
        const centerY = ((x1_2 + y1_2) * (x3 - x2) + (x2_2 + y2_2) * (x1 - x3) + (x3_2 + y3_2) * (x2 - x1)) / D;
        const center = {
            x: centerX,
            y: centerY
        };
        const radius = Math.sqrt((centerX - x1) ** 2 + (centerY - y1) ** 2);
        return {
            center,
            radius
        };
    }
    getCircleParamsByTwoPoints(p1, p2) {
        const centerX = (p1.x + p2.x) / 2;
        const centerY = (p1.y + p2.y) / 2;
        const radius = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2) / 2;
        return {
            center: {
                x: centerX,
                y: centerY
            },
            radius
        };
    }
    getCircleParamsByCenterRadius(center, radiusPoint) {
        const radius = Math.sqrt((center.x - radiusPoint.x) ** 2 + (center.y - radiusPoint.y) ** 2);
        return {
            center: {
                x: center.x,
                y: center.y
            },
            radius
        };
    }
    constructor(...args){
        super(...args), this.name = __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.DrawCircleTool, this.machine = circleMachine.provide({
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
        }), this.mode = 1, this.points = [], this.tempPoint = null, this.group = new __WEBPACK_EXTERNAL_MODULE_three__.Group(), this.circleObject = null, this.dimensionGroup = null, this.previewLineObject = null, this.entity = null, this.currentCommand = null, this.circleParams = null;
    }
}
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.CADViewManager),
    _ts_metadata("design:type", "undefined" == typeof CADViewManager ? Object : CADViewManager)
], DrawCircleTool.prototype, "viewManager", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.EntitySelector),
    _ts_metadata("design:type", "undefined" == typeof EntitySelector ? Object : EntitySelector)
], DrawCircleTool.prototype, "entitySelector", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.MouseTipHelper),
    _ts_metadata("design:type", "undefined" == typeof MouseTipHelper ? Object : MouseTipHelper)
], DrawCircleTool.prototype, "mouseTipHelper", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.HistoryManager),
    _ts_metadata("design:type", "undefined" == typeof HistoryManager ? Object : HistoryManager)
], DrawCircleTool.prototype, "historyManager", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.AuxiliaryMouseHelper),
    _ts_metadata("design:type", "undefined" == typeof AuxiliaryMouseHelper ? Object : AuxiliaryMouseHelper)
], DrawCircleTool.prototype, "auxiliaryMouseHelper", void 0);
DrawCircleTool = _ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.injectable)()
], DrawCircleTool);
export { drawCircleTool_rslib_entry_CircleDrawMode as CircleDrawMode, DrawCircleTool };
