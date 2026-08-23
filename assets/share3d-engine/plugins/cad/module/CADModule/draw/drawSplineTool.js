import * as __WEBPACK_EXTERNAL_MODULE_inversify__ from "inversify";
import * as __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__ from "lodash-es";
import * as __WEBPACK_EXTERNAL_MODULE_nanoid__ from "nanoid";
import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_Addons_js_c109df0d__ from "three/examples/jsm/Addons.js";
import * as __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_curves_NURBSCurve_js_c422fcc1__ from "three/examples/jsm/curves/NURBSCurve.js";
import * as __WEBPACK_EXTERNAL_MODULE_xstate__ from "xstate";
import * as __WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__ from "../auxiliaryTool/MouseTipHelper.js";
import * as __WEBPACK_EXTERNAL_MODULE__command_DrawEntityCommand_js_43176e21__ from "../command/DrawEntityCommand.js";
import * as __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__ from "../model/entity/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__object_material_MaterialUtils_js_90640340__ from "../object/material/MaterialUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__common_setting_js_85f066cc__ from "../../common/setting.js";
import * as __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__ from "../../container/types.js";
import * as __WEBPACK_EXTERNAL_MODULE__core_tool_StateMachineTool_js_4ff72ac2__ from "../../core/tool/StateMachineTool.js";
import * as __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__ from "../../i18n/tipKeys.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_index_js_57e9e83f__ from "../../utils/index.js";
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
const splineMachine = (0, __WEBPACK_EXTERNAL_MODULE_xstate__.setup)({
    actions: {
        showMouseTip: (..._args)=>{}
    }
}).createMachine({
    id: 'drawSplineTool',
    initial: 'idle',
    states: {
        idle: {
            on: {
                NEXT: 'specifyStartPoint'
            }
        },
        specifyStartPoint: {
            entry: {
                type: 'showMouseTip',
                params: __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.draw.firstPoint
            },
            on: {
                NEXT: {
                    target: 'specifyNextPoint'
                }
            }
        },
        specifyNextPoint: {
            entry: {
                type: 'showMouseTip',
                params: __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.draw.nextPoint
            },
            on: {
                NEXT: {}
            }
        }
    }
});
class DrawSplineTool extends __WEBPACK_EXTERNAL_MODULE__core_tool_StateMachineTool_js_4ff72ac2__.StateMachineTool {
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
        this.updateEntity();
        this.historyManager.commitCommand();
        this.splineObject && __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__.DrawUtils.disposeObject(this.splineObject);
        this.previewLineObject && __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__.DrawUtils.disposeObject(this.previewLineObject);
        this.group.parent?.remove(this.group);
        this.mouseTipHelper.removeTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Draw);
        this.eject(this.auxiliaryMouseHelper);
        this.points = [];
        this.tempPoint = null;
        this.splineObject = null;
        this.previewLineObject = null;
        this.entity = null;
        this.currentCommand = null;
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
        } else if (2 === params.event.button) this.exit();
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
        const [p1, p2] = points.slice(-2);
        this.updateSplineObject(points);
        this.updatePreviewLine(p1, p2);
    }
    updateSplineObject(points) {
        if (points.length < 2 || !this.entity) return;
        const splineParams = __WEBPACK_EXTERNAL_MODULE__utils_index_js_57e9e83f__.SplineUtils.fitPointsToSpline(points.map((p)=>({
                x: p.x,
                y: p.y
            })), this.entity?.degree);
        let sampledPoints = [];
        if (2 === points.length) {
            const p1 = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(points[0].x, points[0].y, 0);
            const p2 = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(points[1].x, points[1].y, 0);
            sampledPoints = [
                p1,
                p2
            ];
        } else {
            const controlPoints = splineParams.controlPoints.map((pt)=>new __WEBPACK_EXTERNAL_MODULE_three__.Vector4(pt.x, pt.y, 0, 1));
            const nurbsCurve = new __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_curves_NURBSCurve_js_c422fcc1__.NURBSCurve(splineParams.degree, splineParams.knots, controlPoints);
            const divisions = __WEBPACK_EXTERNAL_MODULE__utils_index_js_57e9e83f__.SplineUtils.getSampleCount(points.length);
            sampledPoints = nurbsCurve.getPoints(divisions);
        }
        const geometry = __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__.DrawUtils.getLineGeometryByPoints(sampledPoints);
        if (!this.splineObject) {
            this.splineObject = new __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_Addons_js_c109df0d__.Line2(geometry, __WEBPACK_EXTERNAL_MODULE__object_material_MaterialUtils_js_90640340__.MaterialUtils.createMaterialByLineType(this.entity.lineType, __WEBPACK_EXTERNAL_MODULE__object_material_MaterialUtils_js_90640340__.MaterialUtils.getMaterialOptionByEntity(this.entity)));
            this.splineObject.computeLineDistances();
            this.group.add(this.splineObject);
            return;
        }
        this.splineObject.geometry.dispose();
        this.splineObject.geometry = geometry;
        this.splineObject.computeLineDistances();
    }
    updatePreviewLine(p1, p2) {
        if (!this.previewLineObject) {
            const dashSize = this.controller.getPixelSizeInWorld(__WEBPACK_EXTERNAL_MODULE__common_setting_js_85f066cc__.Setting.dashSize);
            const materialOption = {
                color: __WEBPACK_EXTERNAL_MODULE__common_setting_js_85f066cc__.Setting.leadLineConfig.color,
                transparent: __WEBPACK_EXTERNAL_MODULE__common_setting_js_85f066cc__.Setting.leadLineConfig.opacity < 1,
                opacity: __WEBPACK_EXTERNAL_MODULE__common_setting_js_85f066cc__.Setting.leadLineConfig.opacity,
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
    createEntity(entityData) {
        const entity = new __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.SplineEntity({
            ...this.viewManager.getEntityDefaultData(entityData),
            id: (0, __WEBPACK_EXTERNAL_MODULE_nanoid__.nanoid)(),
            method: 'FIT',
            degree: 3
        });
        return entity;
    }
    updateEntity() {
        if (!this.entity || this.points.length < 2) return;
        const splineParams = __WEBPACK_EXTERNAL_MODULE__utils_index_js_57e9e83f__.SplineUtils.fitPointsToSpline(this.points.map((p)=>({
                x: p.x,
                y: p.y
            })), this.entity.degree);
        Object.assign(this.entity, {
            ...(0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.cloneDeep)(splineParams),
            fitPoints: this.points.map((p)=>({
                    x: p.x,
                    y: p.y
                }))
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
        return this.entity?.controlPoints ? this.entity.controlPoints.length >= 2 : false;
    }
    isCanUndoStep() {
        return this.points.length > 1;
    }
    constructor(...args){
        super(...args), this.name = __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.DrawSplineTool, this.machine = splineMachine.provide({
            actions: {
                showMouseTip: (_v, tip)=>{
                    this.showMouseTip(tip);
                }
            }
        }), this.points = [], this.tempPoint = null, this.group = new __WEBPACK_EXTERNAL_MODULE_three__.Group(), this.splineObject = null, this.previewLineObject = null, this.entity = null, this.currentCommand = null;
    }
}
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.CADViewManager),
    _ts_metadata("design:type", "undefined" == typeof CADViewManager ? Object : CADViewManager)
], DrawSplineTool.prototype, "viewManager", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.EntitySelector),
    _ts_metadata("design:type", "undefined" == typeof EntitySelector ? Object : EntitySelector)
], DrawSplineTool.prototype, "entitySelector", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.MouseTipHelper),
    _ts_metadata("design:type", "undefined" == typeof MouseTipHelper ? Object : MouseTipHelper)
], DrawSplineTool.prototype, "mouseTipHelper", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.HistoryManager),
    _ts_metadata("design:type", "undefined" == typeof HistoryManager ? Object : HistoryManager)
], DrawSplineTool.prototype, "historyManager", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.AuxiliaryMouseHelper),
    _ts_metadata("design:type", "undefined" == typeof AuxiliaryMouseHelper ? Object : AuxiliaryMouseHelper)
], DrawSplineTool.prototype, "auxiliaryMouseHelper", void 0);
DrawSplineTool = _ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.injectable)()
], DrawSplineTool);
export { DrawSplineTool };
