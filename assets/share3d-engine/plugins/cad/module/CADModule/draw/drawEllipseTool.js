import * as __WEBPACK_EXTERNAL_MODULE_inversify__ from "inversify";
import * as __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__ from "lodash-es";
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
const EllipseMouseTip = {
    axisEnd: __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.draw.ellipse.axisEnd,
    otherAxisEnd: __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.draw.ellipse.otherAxisEnd,
    otherSemiAxisLength: __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.draw.ellipse.otherSemiAxisLength
};
const ellipseMachine = (0, __WEBPACK_EXTERNAL_MODULE_xstate__.setup)({
    actions: {
        showMouseTip: (..._args)=>{},
        entryFinished: ()=>{}
    }
}).createMachine({
    id: 'drawEllipseTool',
    initial: 'idle',
    states: {
        idle: {
            on: {
                NEXT: [
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
                                params: EllipseMouseTip.axisEnd
                            }
                        },
                        point2: {
                            on: {
                                NEXT: 'point3'
                            },
                            entry: {
                                type: 'showMouseTip',
                                params: EllipseMouseTip.otherAxisEnd
                            }
                        },
                        point3: {
                            on: {
                                NEXT: '#drawEllipseTool.finished',
                                PREVIOUS: 'point2'
                            },
                            entry: {
                                type: 'showMouseTip',
                                params: EllipseMouseTip.otherSemiAxisLength
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
class DrawEllipseTool extends __WEBPACK_EXTERNAL_MODULE__core_tool_StateMachineTool_js_4ff72ac2__.StateMachineTool {
    onInitialize(entityData) {
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
        this.ellipseObject && __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__.DrawUtils.disposeObject(this.ellipseObject);
        this.dimensionGroup?.dispose();
        this.previewLineObject && __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__.DrawUtils.disposeObject(this.previewLineObject);
        this.group.parent?.remove(this.group);
        this.mouseTipHelper.removeTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Draw);
        this.eject(this.auxiliaryMouseHelper);
        this.points = [];
        this.tempPoint = null;
        this.ellipseObject = null;
        this.dimensionGroup = null;
        this.previewLineObject = null;
        this.entity = null;
        this.currentCommand = null;
        this.ellipseParams = null;
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
    updateCanvas() {
        this.updateObject();
    }
    updateObject() {
        const points = [
            ...this.points
        ];
        if (this.tempPoint) points.push(this.tempPoint);
        if (points.length < 2) return;
        const ellipseParams = this.getEllipseParams(points);
        this.updateEllipseObject(ellipseParams);
        this.ellipseParams = ellipseParams;
        const p1 = ellipseParams ? ellipseParams.center : points[points.length - 2];
        const p2 = points[points.length - 1];
        this.updatePreviewLine(p1, p2);
        this.updateDimensionGroup(p1, ellipseParams ? ellipseParams.axisPoint : p2, !ellipseParams);
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
    updateDimensionGroup(startPoint, endPoint, showAngle = true) {
        if (this.dimensionGroup) {
            this.dimensionGroup.updateOptions({
                showAngle,
                lengthOffset: showAngle ? void 0 : 0
            });
            this.dimensionGroup.updateLine(startPoint, endPoint);
            return;
        }
        this.dimensionGroup = new __WEBPACK_EXTERNAL_MODULE__objects_LineDimensionGroup_js_6240db4c__["default"](startPoint, endPoint, {}, this.group, this.controller.domElement.parentElement, (point)=>this.controller.getScreenPosition(point), (radius)=>this.controller.getPixelSizeInWorld(radius));
    }
    updateEllipseObject(params) {
        if (!params || !this.entity) {
            this.ellipseObject && (this.ellipseObject.visible = false);
            return;
        }
        const options = {
            center: {
                x: 0,
                y: 0
            },
            ...(0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.pick)(params, [
                'radiusX',
                'radiusY',
                'rotation'
            ])
        };
        const points = __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__.DrawUtils.getEllipsePoints(options);
        if (!this.ellipseObject) {
            const material = __WEBPACK_EXTERNAL_MODULE__object_material_MaterialUtils_js_90640340__.MaterialUtils.createMaterialByLineType(this.entity.lineType, __WEBPACK_EXTERNAL_MODULE__object_material_MaterialUtils_js_90640340__.MaterialUtils.getMaterialOptionByEntity(this.entity));
            const geometry = __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__.DrawUtils.getLineGeometryByPoints(points);
            this.ellipseObject = new __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_lines_Line2_js_b8170acb__.Line2(geometry, material);
            this.ellipseObject.position.set(params.center.x, params.center.y, 0);
            this.ellipseObject.computeLineDistances();
            this.group.add(this.ellipseObject);
            return;
        }
        this.ellipseObject.geometry.setPositions(points.flatMap((p)=>[
                p.x,
                p.y,
                0
            ]));
        this.ellipseObject.geometry.attributes.position.needsUpdate = true;
        this.ellipseObject.position.set(params.center.x, params.center.y, 0);
        this.ellipseObject.computeLineDistances();
        this.ellipseObject.visible = true;
    }
    createEntity(entityData) {
        const entity = new __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.EllipseEntity({
            ...this.viewManager.getEntityDefaultData(entityData),
            id: (0, __WEBPACK_EXTERNAL_MODULE_nanoid_non_secure_cbb059f4__.nanoid)()
        });
        return entity;
    }
    updateEntity() {
        if (this.entity && this.ellipseParams) Object.assign(this.entity, (0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.pick)(this.ellipseParams, [
            'center',
            'majorAxisEndPoint',
            'axisRatio'
        ]));
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
        return this.entity ? !!this.entity.center : false;
    }
    isCanUndoStep() {
        return this.points.length > 1;
    }
    getEllipseParams(points) {
        if (3 === points.length) return this.getEllipseParamsByThreePoints(points[0], points[1], points[2]);
        return null;
    }
    getEllipseParamsByThreePoints(p1, p2, p3) {
        const center = {
            x: (p1.x + p2.x) / 2,
            y: (p1.y + p2.y) / 2
        };
        const majorX = p1.x - center.x;
        const majorY = p1.y - center.y;
        const a = Math.hypot(majorX, majorY);
        if (0 === a) return null;
        const b = Math.hypot(p3.x - center.x, p3.y - center.y);
        if (0 === b) return null;
        let majorAxisEndPoint;
        let axisRatio;
        if (b > a) {
            const ux = majorX / a;
            const uy = majorY / a;
            majorAxisEndPoint = {
                x: -uy * b,
                y: ux * b
            };
            axisRatio = a / b;
        } else {
            majorAxisEndPoint = {
                x: majorX,
                y: majorY
            };
            axisRatio = b / a;
        }
        const axisPoint = new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(center.x, center.y).addScaledVector(new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(majorX, majorY).rotateAround({
            x: 0,
            y: 0
        }, -Math.PI / 2).normalize(), b);
        return {
            center,
            majorAxisEndPoint,
            axisRatio,
            radiusX: Math.max(a, b),
            radiusY: Math.min(a, b),
            rotation: Math.atan2(majorAxisEndPoint.y, majorAxisEndPoint.x),
            axisPoint
        };
    }
    constructor(...args){
        super(...args), this.name = __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.DrawEllipseTool, this.machine = ellipseMachine.provide({
            actions: {
                showMouseTip: (_v, tip)=>{
                    this.showMouseTip(tip);
                },
                entryFinished: ()=>{
                    this.updateEntity();
                    this.exit();
                }
            }
        }), this.points = [], this.tempPoint = null, this.group = new __WEBPACK_EXTERNAL_MODULE_three__.Group(), this.ellipseObject = null, this.dimensionGroup = null, this.previewLineObject = null, this.entity = null, this.currentCommand = null, this.ellipseParams = null;
    }
}
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.CADViewManager),
    _ts_metadata("design:type", "undefined" == typeof CADViewManager ? Object : CADViewManager)
], DrawEllipseTool.prototype, "viewManager", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.EntitySelector),
    _ts_metadata("design:type", "undefined" == typeof EntitySelector ? Object : EntitySelector)
], DrawEllipseTool.prototype, "entitySelector", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.MouseTipHelper),
    _ts_metadata("design:type", "undefined" == typeof MouseTipHelper ? Object : MouseTipHelper)
], DrawEllipseTool.prototype, "mouseTipHelper", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.HistoryManager),
    _ts_metadata("design:type", "undefined" == typeof HistoryManager ? Object : HistoryManager)
], DrawEllipseTool.prototype, "historyManager", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.AuxiliaryMouseHelper),
    _ts_metadata("design:type", "undefined" == typeof AuxiliaryMouseHelper ? Object : AuxiliaryMouseHelper)
], DrawEllipseTool.prototype, "auxiliaryMouseHelper", void 0);
DrawEllipseTool = _ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.injectable)()
], DrawEllipseTool);
export { DrawEllipseTool };
