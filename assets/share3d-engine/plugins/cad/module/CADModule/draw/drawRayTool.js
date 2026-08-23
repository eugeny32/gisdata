import * as __WEBPACK_EXTERNAL_MODULE_inversify__ from "inversify";
import * as __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__ from "lodash-es";
import * as __WEBPACK_EXTERNAL_MODULE_nanoid_non_secure_cbb059f4__ from "nanoid/non-secure";
import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_lines_Line2_js_b8170acb__ from "three/examples/jsm/lines/Line2.js";
import * as __WEBPACK_EXTERNAL_MODULE_xstate__ from "xstate";
import * as __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__ from "../../container/types.js";
import * as __WEBPACK_EXTERNAL_MODULE__core_tool_StateMachineTool_js_4ff72ac2__ from "../../core/tool/StateMachineTool.js";
import * as __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__ from "../../i18n/tipKeys.js";
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
const rayMachine = (0, __WEBPACK_EXTERNAL_MODULE_xstate__.setup)({
    actions: {
        showMouseTip: (..._args)=>{},
        entryFinished: ()=>{}
    }
}).createMachine({
    id: 'drawRayTool',
    initial: 'idle',
    states: {
        idle: {
            on: {
                NEXT: [
                    {
                        target: 'draw.point1'
                    }
                ]
            }
        },
        draw: {
            initial: 'point1',
            states: {
                point1: {
                    on: {
                        NEXT: 'point2'
                    },
                    entry: {
                        type: 'showMouseTip',
                        params: __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.draw.ray.startPoint
                    }
                },
                point2: {
                    on: {
                        NEXT: '#drawRayTool.finished'
                    },
                    entry: {
                        type: 'showMouseTip',
                        params: __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.draw.ray.pointOnRay
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
class DrawRayTool extends __WEBPACK_EXTERNAL_MODULE__core_tool_StateMachineTool_js_4ff72ac2__.StateMachineTool {
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
        this.entityObject && __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__.DrawUtils.disposeObject(this.entityObject);
        this.group.parent?.remove(this.group);
        this.mouseTipHelper.removeTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Draw);
        this.eject(this.auxiliaryMouseHelper);
        this.points = [];
        this.tempPoint = null;
        this.entityObject = null;
        this.entity = null;
        this.currentCommand = null;
        this.entityParams = null;
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
        const entityParams = this.getEntityParams(points[0], points[1]);
        this.entityParams = entityParams;
        this.updateEntityObject(entityParams);
    }
    updateEntityObject(params) {
        if (!params || !this.entity) {
            this.entityObject && (this.entityObject.visible = false);
            return;
        }
        const points = [
            params.startPoint,
            new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(params.startPoint.x, params.startPoint.y).add(new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(params.unitVector.x, params.unitVector.y).multiplyScalar(1000))
        ];
        if (!this.entityObject) {
            const material = __WEBPACK_EXTERNAL_MODULE__object_material_MaterialUtils_js_90640340__.MaterialUtils.createMaterialByLineType(this.entity.lineType, __WEBPACK_EXTERNAL_MODULE__object_material_MaterialUtils_js_90640340__.MaterialUtils.getMaterialOptionByEntity(this.entity));
            const geometry = __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__.DrawUtils.getLineGeometryByPoints(points);
            this.entityObject = new __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_lines_Line2_js_b8170acb__.Line2(geometry, material);
            this.entityObject.computeLineDistances();
            this.group.add(this.entityObject);
            return;
        }
        this.entityObject.geometry.setPositions(points.flatMap((p)=>[
                p.x,
                p.y,
                0
            ]));
        this.entityObject.geometry.attributes.position.needsUpdate = true;
        this.entityObject.computeLineDistances();
        this.entityObject.visible = true;
    }
    createEntity(entityData) {
        const entity = new __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.RayEntity({
            ...this.viewManager.getEntityDefaultData(entityData),
            id: (0, __WEBPACK_EXTERNAL_MODULE_nanoid_non_secure_cbb059f4__.nanoid)()
        });
        return entity;
    }
    updateEntity() {
        if (this.entity && this.entityParams) Object.assign(this.entity, (0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.pick)(this.entityParams, [
            'startPoint',
            'unitVector'
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
        return this.entity ? !!(this.entity.startPoint && this.entity.unitVector) : false;
    }
    isCanUndoStep() {
        return this.points.length > 1;
    }
    getEntityParams(p1, p2) {
        const unitVector = new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(p2.x - p1.x, p2.y - p1.y);
        if (unitVector.lengthSq() < 1e-12) return null;
        unitVector.normalize();
        return {
            startPoint: p1,
            unitVector: {
                x: unitVector.x,
                y: unitVector.y
            }
        };
    }
    constructor(...args){
        super(...args), this.name = __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.DrawRayTool, this.machine = rayMachine.provide({
            actions: {
                showMouseTip: (_v, tip)=>{
                    this.showMouseTip(tip);
                },
                entryFinished: ()=>{
                    this.updateEntity();
                    this.exit();
                }
            }
        }), this.points = [], this.tempPoint = null, this.group = new __WEBPACK_EXTERNAL_MODULE_three__.Group(), this.entityObject = null, this.entity = null, this.currentCommand = null, this.entityParams = null;
    }
}
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.CADViewManager),
    _ts_metadata("design:type", "undefined" == typeof CADViewManager ? Object : CADViewManager)
], DrawRayTool.prototype, "viewManager", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.EntitySelector),
    _ts_metadata("design:type", "undefined" == typeof EntitySelector ? Object : EntitySelector)
], DrawRayTool.prototype, "entitySelector", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.MouseTipHelper),
    _ts_metadata("design:type", "undefined" == typeof MouseTipHelper ? Object : MouseTipHelper)
], DrawRayTool.prototype, "mouseTipHelper", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.HistoryManager),
    _ts_metadata("design:type", "undefined" == typeof HistoryManager ? Object : HistoryManager)
], DrawRayTool.prototype, "historyManager", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.AuxiliaryMouseHelper),
    _ts_metadata("design:type", "undefined" == typeof AuxiliaryMouseHelper ? Object : AuxiliaryMouseHelper)
], DrawRayTool.prototype, "auxiliaryMouseHelper", void 0);
DrawRayTool = _ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.injectable)()
], DrawRayTool);
export { DrawRayTool };
