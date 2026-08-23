import * as __WEBPACK_EXTERNAL_MODULE_inversify__ from "inversify";
import * as __WEBPACK_EXTERNAL_MODULE_nanoid__ from "nanoid";
import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_Addons_js_c109df0d__ from "three/examples/jsm/Addons.js";
import * as __WEBPACK_EXTERNAL_MODULE_xstate__ from "xstate";
import * as __WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__ from "../auxiliaryTool/MouseTipHelper.js";
import * as __WEBPACK_EXTERNAL_MODULE__command_DrawPolylineCommand_js_f4bf82a7__ from "../command/DrawPolylineCommand.js";
import * as __WEBPACK_EXTERNAL_MODULE__model_entity_PolylineEntity_js_b484bf8c__ from "../model/entity/PolylineEntity.js";
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
const polylineMachine = (0, __WEBPACK_EXTERNAL_MODULE_xstate__.setup)({
    actions: {
        entrySpecifyStartPoint: ()=>{},
        entrySpecifyNextPoint: ()=>{}
    }
}).createMachine({
    id: 'drawPolylineTool',
    initial: 'idle',
    states: {
        idle: {
            on: {
                NEXT: 'specifyStartPoint'
            }
        },
        specifyStartPoint: {
            entry: {
                type: 'entrySpecifyStartPoint'
            },
            on: {
                NEXT: {
                    target: 'specifyNextPoint'
                }
            }
        },
        specifyNextPoint: {
            entry: {
                type: 'entrySpecifyNextPoint'
            },
            on: {
                NEXT: {}
            }
        }
    }
});
class DrawPolylineTool extends __WEBPACK_EXTERNAL_MODULE__core_tool_StateMachineTool_js_4ff72ac2__.StateMachineTool {
    get points() {
        return this.entity?.vertices || [];
    }
    onInitialize(entityData) {
        this.viewManager.attachTempObject(this.group);
        this.entitySelector.clearSelection();
        this.inject(this.auxiliaryMouseHelper);
        this.entity = this.createEntity(entityData);
        this.currentCommand = new __WEBPACK_EXTERNAL_MODULE__command_DrawPolylineCommand_js_f4bf82a7__.DrawPolylineCommand(this.entity, this.viewManager, this.updateCanvas.bind(this));
        this.historyManager.startCommand(this.currentCommand);
        this.send({
            type: 'NEXT'
        });
    }
    onTerminate() {
        this.historyManager.commitCommand();
        this.lineObject && __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__.DrawUtils.disposeObject(this.lineObject);
        this.dimensionGroup?.dispose();
        this.group.parent?.remove(this.group);
        this.mouseTipHelper.removeTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Draw);
        this.eject(this.auxiliaryMouseHelper);
        this.tempPoint = null;
        this.lineObject = null;
        this.dimensionGroup = null;
        this.entity = null;
        this.currentCommand = null;
    }
    onMouseDown(params) {
        if (0 === params.event.button) {
            this.currentCommand?.addPoint(this.tempPoint || {
                x: params.worldPos.x,
                y: params.worldPos.y
            });
            this.historyManager.refresh();
            this.send({
                type: 'NEXT'
            });
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
    onViewerUpdate() {
        this.dimensionGroup?.update();
    }
    mouseCapture(params) {
        if (!this.tempPoint) return;
        const startPoint = this.points.length > 0 ? this.points[this.points.length - 1] : void 0;
        const finalPoint = this.auxiliaryMouseHelper.mouseCapture(params, {
            startPoint,
            entities: this.entity ? [
                this.entity
            ] : void 0
        });
        this.tempPoint = {
            x: finalPoint.x,
            y: finalPoint.y
        };
    }
    entrySpecifyStartPoint() {
        this.mouseTipHelper.addTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Draw, __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.draw.firstPoint);
    }
    entrySpecifyNextPoint() {
        this.mouseTipHelper.addTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Draw, __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.draw.nextPoint);
    }
    createEntity(entityData) {
        const entity = new __WEBPACK_EXTERNAL_MODULE__model_entity_PolylineEntity_js_b484bf8c__.PolylineEntity({
            ...this.viewManager.getEntityDefaultData(entityData),
            id: (0, __WEBPACK_EXTERNAL_MODULE_nanoid__.nanoid)(),
            vertices: [],
            isClosed: false
        });
        return entity;
    }
    getDrawPoints() {
        return [
            ...this.points
        ].concat(this.tempPoint ? [
            this.tempPoint
        ] : []);
    }
    drawLineObject() {
        const points = this.getDrawPoints();
        if (!this.entity || points.length < 2) return;
        const geometry = __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__.DrawUtils.getLineGeometryByPoints(points);
        const materialOption = __WEBPACK_EXTERNAL_MODULE__object_material_MaterialUtils_js_90640340__.MaterialUtils.getMaterialOptionByEntity(this.entity);
        const material = __WEBPACK_EXTERNAL_MODULE__object_material_MaterialUtils_js_90640340__.MaterialUtils.createMaterialByLineType(this.entity.lineType, materialOption);
        this.lineObject = new __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_Addons_js_c109df0d__.Line2(geometry, material);
        this.lineObject.computeLineDistances();
        this.group.add(this.lineObject);
    }
    updateLineObject() {
        if (!this.lineObject) {
            this.drawLineObject();
            return;
        }
        const points = this.getDrawPoints();
        this.lineObject.geometry.dispose();
        this.lineObject.geometry = __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__.DrawUtils.getLineGeometryByPoints(points);
        this.lineObject.computeLineDistances();
    }
    drawDimension() {
        const startPoint = this.points[this.points.length - 1];
        const endPoint = this.tempPoint;
        if (!startPoint || !endPoint) return;
        if (this.dimensionGroup) {
            this.dimensionGroup.updateLine(startPoint, endPoint);
            return;
        }
        this.dimensionGroup = new __WEBPACK_EXTERNAL_MODULE__objects_LineDimensionGroup_js_6240db4c__["default"](startPoint, endPoint, {}, this.group, this.controller.domElement.parentElement, (point)=>this.controller.getScreenPosition(point), (radius)=>this.controller.getPixelSizeInWorld(radius));
    }
    updateCanvas() {
        this.updateLineObject();
        this.drawDimension();
    }
    constructor(...args){
        super(...args), this.name = __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.DrawPolylineTool, this.machine = polylineMachine.provide({
            actions: {
                entrySpecifyStartPoint: ()=>this.entrySpecifyStartPoint(),
                entrySpecifyNextPoint: ()=>this.entrySpecifyNextPoint()
            }
        }), this.tempPoint = null, this.group = new __WEBPACK_EXTERNAL_MODULE_three__.Group(), this.lineObject = null, this.dimensionGroup = null, this.entity = null, this.currentCommand = null;
    }
}
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.CADViewManager),
    _ts_metadata("design:type", "undefined" == typeof CADViewManager ? Object : CADViewManager)
], DrawPolylineTool.prototype, "viewManager", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.EntitySelector),
    _ts_metadata("design:type", "undefined" == typeof EntitySelector ? Object : EntitySelector)
], DrawPolylineTool.prototype, "entitySelector", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.MouseTipHelper),
    _ts_metadata("design:type", "undefined" == typeof MouseTipHelper ? Object : MouseTipHelper)
], DrawPolylineTool.prototype, "mouseTipHelper", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.HistoryManager),
    _ts_metadata("design:type", "undefined" == typeof HistoryManager ? Object : HistoryManager)
], DrawPolylineTool.prototype, "historyManager", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.AuxiliaryMouseHelper),
    _ts_metadata("design:type", "undefined" == typeof AuxiliaryMouseHelper ? Object : AuxiliaryMouseHelper)
], DrawPolylineTool.prototype, "auxiliaryMouseHelper", void 0);
DrawPolylineTool = _ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.injectable)()
], DrawPolylineTool);
export { DrawPolylineTool };
