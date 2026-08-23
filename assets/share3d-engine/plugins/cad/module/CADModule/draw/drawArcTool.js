import * as __WEBPACK_EXTERNAL_MODULE_inversify__ from "inversify";
import * as __WEBPACK_EXTERNAL_MODULE_nanoid_non_secure_cbb059f4__ from "nanoid/non-secure";
import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_Addons_js_c109df0d__ from "three/examples/jsm/Addons.js";
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
var drawArcTool_rslib_entry_ArcDrawMode = /*#__PURE__*/ function(ArcDrawMode) {
    ArcDrawMode[ArcDrawMode["ThreePoints"] = 1] = "ThreePoints";
    ArcDrawMode[ArcDrawMode["TwoPointsAndRadius"] = 2] = "TwoPointsAndRadius";
    return ArcDrawMode;
}({});
const MouseTip = {
    startPoint: __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.draw.arc.startPoint,
    midPoint: __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.draw.arc.midPoint,
    endPoint: __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.draw.arc.endPoint,
    radius: __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.draw.arc.radius
};
const arcMachine = (0, __WEBPACK_EXTERNAL_MODULE_xstate__.setup)({
    actions: {
        showMouseTip: (..._args)=>{},
        entryFinished: ()=>{}
    },
    guards: {
        isMode: ()=>false
    }
}).createMachine({
    id: 'drawArcTool',
    initial: 'idle',
    states: {
        idle: {
            on: {
                NEXT: [
                    {
                        target: 'draw.twoPointsAndRadius',
                        guard: {
                            type: 'isMode',
                            params: 2
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
                                params: MouseTip.startPoint
                            }
                        },
                        point2: {
                            on: {
                                NEXT: 'point3'
                            },
                            entry: {
                                type: 'showMouseTip',
                                params: MouseTip.midPoint
                            }
                        },
                        point3: {
                            on: {
                                NEXT: '#drawArcTool.finished',
                                PREVIOUS: 'point2'
                            },
                            entry: {
                                type: 'showMouseTip',
                                params: MouseTip.endPoint
                            }
                        }
                    }
                },
                twoPointsAndRadius: {
                    initial: 'point1',
                    states: {
                        point1: {
                            on: {
                                NEXT: 'point2'
                            },
                            entry: {
                                type: 'showMouseTip',
                                params: MouseTip.startPoint
                            }
                        },
                        point2: {
                            on: {
                                NEXT: 'radius'
                            },
                            entry: {
                                type: 'showMouseTip',
                                params: MouseTip.endPoint
                            }
                        },
                        radius: {
                            on: {
                                NEXT: '#drawArcTool.finished',
                                PREVIOUS: 'point2'
                            },
                            entry: {
                                type: 'showMouseTip',
                                params: MouseTip.radius
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
class DrawArcTool extends __WEBPACK_EXTERNAL_MODULE__core_tool_StateMachineTool_js_4ff72ac2__.StateMachineTool {
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
        this.arcObject && __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__.DrawUtils.disposeObject(this.arcObject);
        this.dimensionGroup?.dispose();
        this.previewLineObject && __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__.DrawUtils.disposeObject(this.previewLineObject);
        this.group.parent?.remove(this.group);
        this.mouseTipHelper.removeTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Draw);
        this.eject(this.auxiliaryMouseHelper);
        this.points = [];
        this.tempPoint = null;
        this.arcObject = null;
        this.dimensionGroup = null;
        this.previewLineObject = null;
        this.entity = null;
        this.currentCommand = null;
        this.arcParams = null;
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
        const arcParams = this.getArcParamsByMode(this.mode, points);
        this.updateArcObject(arcParams);
        this.arcParams = arcParams;
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
    updateArcObject(arcParams) {
        if (!arcParams || !this.entity) {
            this.arcObject && (this.arcObject.visible = false);
            return;
        }
        const segmentsNum = __WEBPACK_EXTERNAL_MODULE__utils_ArcUtils_js_0b275f38__.ArcUtils.getDynamicSegments(arcParams.radius, this.controller.getPixelSizeInWorld(1));
        arcParams.segmentsNum = segmentsNum;
        const options = {
            ...arcParams,
            center: {
                x: 0,
                y: 0,
                z: 0
            }
        };
        const points = __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__.DrawUtils.getArcPoints(options);
        const geometry = __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__.DrawUtils.getLineGeometryByPoints(points);
        if (!this.arcObject) {
            const material = __WEBPACK_EXTERNAL_MODULE__object_material_MaterialUtils_js_90640340__.MaterialUtils.createMaterialByLineType(this.entity.lineType, __WEBPACK_EXTERNAL_MODULE__object_material_MaterialUtils_js_90640340__.MaterialUtils.getMaterialOptionByEntity(this.entity));
            this.arcObject = new __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_Addons_js_c109df0d__.Line2(geometry, material);
            this.arcObject.position.set(arcParams.center.x, arcParams.center.y, 0);
            this.arcObject.computeLineDistances();
            this.group.add(this.arcObject);
            return;
        }
        this.arcObject.geometry.dispose();
        this.arcObject.geometry = geometry;
        this.arcObject.position.set(arcParams.center.x, arcParams.center.y, 0);
        this.arcObject.computeLineDistances();
        this.arcObject.visible = true;
    }
    createEntity(entityData) {
        const entity = new __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.ArcEntity({
            ...this.viewManager.getEntityDefaultData(entityData),
            id: (0, __WEBPACK_EXTERNAL_MODULE_nanoid_non_secure_cbb059f4__.nanoid)()
        });
        return entity;
    }
    updateEntity() {
        if (this.entity && this.arcParams) Object.assign(this.entity, {
            ...this.arcParams
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
    getArcParamsByMode(mode, points) {
        if (1 === mode && points.length >= 3) {
            const [p1, p2, p3] = points.slice(-3);
            return this.getArcParamsByThreePoints(p1, p2, p3);
        }
        if (2 === mode && points.length >= 3) {
            const [p1, p2, p3] = points.slice(-3);
            return this.getArcParamsByTwoPointsAndRadius(p1, p2, p3);
        }
        return null;
    }
    getArcParamsByThreePoints(p1, p2, p3) {
        const x1 = p1.x, y1 = p1.y;
        const x2 = p2.x, y2 = p2.y;
        const x3 = p3.x, y3 = p3.y;
        const a1 = x1 * x1 + y1 * y1;
        const a2 = x2 * x2 + y2 * y2;
        const a3 = x3 * x3 + y3 * y3;
        const d = 2 * (x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2));
        if (Math.abs(d) < 1e-6) return null;
        const centerX = (a1 * (y2 - y3) + a2 * (y3 - y1) + a3 * (y1 - y2)) / d;
        const centerY = (a1 * (x3 - x2) + a2 * (x1 - x3) + a3 * (x2 - x1)) / d;
        const center = {
            x: centerX,
            y: centerY
        };
        const radius = Math.sqrt((centerX - p1.x) ** 2 + (centerY - p1.y) ** 2);
        const startAngle = Math.atan2(p1.y - center.y, p1.x - center.x);
        let midAngle = Math.atan2(p2.y - center.y, p2.x - center.x);
        let endAngle = Math.atan2(p3.y - center.y, p3.x - center.x);
        const crossProduct = (p2.x - p1.x) * (p3.y - p2.y) - (p2.y - p1.y) * (p3.x - p2.x);
        const anticlockwise = crossProduct > 0;
        if (anticlockwise) {
            while(midAngle < startAngle)midAngle += 2 * Math.PI;
            while(endAngle < midAngle)endAngle += 2 * Math.PI;
        } else {
            while(midAngle > startAngle)midAngle -= 2 * Math.PI;
            while(endAngle > midAngle)endAngle -= 2 * Math.PI;
        }
        return {
            center,
            radius,
            startAngle,
            endAngle,
            clockwise: !anticlockwise
        };
    }
    getArcParamsByTwoPointsAndRadius(p1, p2, mouse) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distP1P2 = Math.sqrt(dx * dx + dy * dy);
        if (distP1P2 < 1e-8) return null;
        const offset = ((mouse.x - p1.x) * dy - (mouse.y - p1.y) * dx) / distP1P2;
        const h = Math.abs(offset);
        let r;
        r = h < 1e-8 ? distP1P2 / 2 : h / 2 + distP1P2 * distP1P2 / (8 * h);
        const isLargeArc = h > distP1P2 / 2;
        const anticlockwise = offset < 0;
        return this.getArcByTwoPointsAndRadius(p1, p2, r, isLargeArc, anticlockwise);
    }
    getArcByTwoPointsAndRadius(p1, p2, radius, isLargeArc = false, anticlockwise = true) {
        const d2 = (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2;
        const d = Math.sqrt(d2);
        if (d > 2 * radius) return null;
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;
        const vdx = p2.x - p1.x;
        const vdy = p2.y - p1.y;
        const h = Math.sqrt(radius ** 2 - d2 / 4);
        let factor = anticlockwise ? 1 : -1;
        if (isLargeArc) factor *= -1;
        const centerX = mx - factor * h * vdy / d;
        const centerY = my + factor * h * vdx / d;
        const startAngle = Math.atan2(p1.y - centerY, p1.x - centerX);
        const endAngle = Math.atan2(p2.y - centerY, p2.x - centerX);
        return {
            center: {
                x: centerX,
                y: centerY
            },
            radius,
            startAngle,
            endAngle,
            clockwise: !anticlockwise
        };
    }
    constructor(...args){
        super(...args), this.name = __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.DrawArcTool, this.machine = arcMachine.provide({
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
        }), this.mode = 1, this.points = [], this.tempPoint = null, this.group = new __WEBPACK_EXTERNAL_MODULE_three__.Group(), this.arcObject = null, this.dimensionGroup = null, this.previewLineObject = null, this.entity = null, this.currentCommand = null, this.arcParams = null;
    }
}
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.CADViewManager),
    _ts_metadata("design:type", "undefined" == typeof CADViewManager ? Object : CADViewManager)
], DrawArcTool.prototype, "viewManager", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.EntitySelector),
    _ts_metadata("design:type", "undefined" == typeof EntitySelector ? Object : EntitySelector)
], DrawArcTool.prototype, "entitySelector", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.MouseTipHelper),
    _ts_metadata("design:type", "undefined" == typeof MouseTipHelper ? Object : MouseTipHelper)
], DrawArcTool.prototype, "mouseTipHelper", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.HistoryManager),
    _ts_metadata("design:type", "undefined" == typeof HistoryManager ? Object : HistoryManager)
], DrawArcTool.prototype, "historyManager", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.AuxiliaryMouseHelper),
    _ts_metadata("design:type", "undefined" == typeof AuxiliaryMouseHelper ? Object : AuxiliaryMouseHelper)
], DrawArcTool.prototype, "auxiliaryMouseHelper", void 0);
DrawArcTool = _ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.injectable)()
], DrawArcTool);
export { drawArcTool_rslib_entry_ArcDrawMode as ArcDrawMode, DrawArcTool };
