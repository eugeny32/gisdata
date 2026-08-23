import * as __WEBPACK_EXTERNAL_MODULE_inversify__ from "inversify";
import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_Addons_js_c109df0d__ from "three/examples/jsm/Addons.js";
import * as __WEBPACK_EXTERNAL_MODULE_xstate__ from "xstate";
import * as __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__ from "../../container/types.js";
import * as __WEBPACK_EXTERNAL_MODULE__core_selector_Selector_js_7c4871fe__ from "../../core/selector/Selector.js";
import * as __WEBPACK_EXTERNAL_MODULE__core_tool_StateMachineTool_js_4ff72ac2__ from "../../core/tool/StateMachineTool.js";
import * as __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__ from "../../i18n/tipKeys.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1bc05401__ from "../../../../../shared/constants/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__ from "../auxiliaryTool/MouseTipHelper.js";
import * as __WEBPACK_EXTERNAL_MODULE__command_BreakEntityCommand_js_aee24987__ from "../command/BreakEntityCommand.js";
import * as __WEBPACK_EXTERNAL_MODULE__object_entityObject_entityObjectUtils_js_3a4a2246__ from "../object/entityObject/entityObjectUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__EntityEditHandler_js_9944ecc6__ from "./EntityEditHandler.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_breakUtils_js_f36227b3__ from "./utils/breakUtils.js";
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
}
const breakEntityMachine = (0, __WEBPACK_EXTERNAL_MODULE_xstate__.setup)({
    actions: {
        entrySpecifyFirstPoint: ()=>{},
        entrySpecifySecondPoint: ()=>{}
    }
}).createMachine({
    id: 'breakEntity',
    initial: 'idle',
    states: {
        idle: {
            on: {
                NEXT: 'specifyFirstPoint'
            }
        },
        specifyFirstPoint: {
            entry: {
                type: 'entrySpecifyFirstPoint'
            },
            on: {
                NEXT: 'specifySecondPoint'
            }
        },
        specifySecondPoint: {
            entry: {
                type: 'entrySpecifySecondPoint'
            }
        }
    }
});
class BreakEntityTool extends __WEBPACK_EXTERNAL_MODULE__core_tool_StateMachineTool_js_4ff72ac2__.StateMachineTool {
    onInitialize() {
        this.viewManager.attachTempObject(this.group);
        this.entitySelector.clearSelection();
        this.entitySelector.config({
            enableFrameSelect: false,
            mode: __WEBPACK_EXTERNAL_MODULE__core_selector_Selector_js_7c4871fe__.SelectMode.replace
        });
        this.historyManager.setLock(true);
        this.inject(this.auxiliaryMouseHelper);
        this.send({
            type: 'NEXT'
        });
    }
    onTerminate() {
        this.group.parent?.remove(this.group);
        this.clearPreviewObjects();
        this.entitySelector.clearSelection();
        this.entitySelector.resetConfig();
        this.mouseTipHelper.removeTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Edit);
        this.historyManager.setLock(false);
        this.eject(this.auxiliaryMouseHelper);
        this.eject(this.entitySelector);
        this.selectedEntity = void 0;
        this.selectedEntityObject = void 0;
        this.selectedEntityOriginalMaterial = void 0;
        this.firstPoint = void 0;
        this.secondPoint = void 0;
    }
    onMouseDown(params) {
        if (0 !== params.event.button) return;
        if (this.checkState('specifyFirstPoint') && this.selectedEntity) {
            this.firstPoint = this.getCapturedPoint(params);
            this.send({
                type: 'NEXT'
            });
            return;
        }
        if (this.checkState('specifySecondPoint')) {
            this.secondPoint = this.getCapturedPoint(params);
            this.executeOperate();
            this.exit();
        }
    }
    onMouseMove(params) {
        if (!this.checkState('specifySecondPoint') || !this.firstPoint) return;
        this.secondPoint = this.getCapturedPoint(params);
        this.updateCanvas();
    }
    onKeyDown(params) {
        if (params.event.keyCode === __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1bc05401__.KeyCodes.ESC) this.exit();
    }
    onSelectorChanged(entities) {
        if (this.checkState('specifyFirstPoint') && entities.length > 0) {
            this.selectedEntity = entities[0];
            this.selectedEntityObject = this.viewManager.getEntityObject(this.selectedEntity);
            this.selectedEntityOriginalMaterial = this.selectedEntityObject.material;
        }
    }
    onDetectorFilter(entities) {
        return entities.filter((entity)=>__WEBPACK_EXTERNAL_MODULE__utils_breakUtils_js_f36227b3__.BreakUtils.EnabledEntityTypes.has(entity.type));
    }
    entrySpecifyFirstPoint() {
        this.mouseTipHelper.addTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Edit, __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.edit["break"].target);
        this.inject(this.entitySelector);
    }
    entrySpecifySecondPoint() {
        this.eject(this.entitySelector);
        this.mouseTipHelper.addTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Edit, __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.edit["break"].secondPoint);
    }
    getCapturedPoint(params, startPoint) {
        const finalPoint = this.auxiliaryMouseHelper.mouseCapture(params, {
            startPoint
        });
        return {
            x: finalPoint.x,
            y: finalPoint.y
        };
    }
    updateCanvas() {
        if (!this.selectedEntity || !this.selectedEntityObject || !this.firstPoint || !this.secondPoint) return;
        const res = __WEBPACK_EXTERNAL_MODULE__utils_breakUtils_js_f36227b3__.BreakUtils.breakEntity(this.selectedEntity, {
            firstPoint: this.firstPoint,
            secondPoint: this.secondPoint
        });
        if (res.deleteEntities.length > 0) this.selectedEntityObject.material = this.viewManager.objectManager.getMaterialManager().getCachedLockedMaterial(this.selectedEntity);
        res.createdEntities.forEach((entity, i)=>{
            let previewObject = this.previewLineObjects[i];
            const geometry = __WEBPACK_EXTERNAL_MODULE__object_entityObject_entityObjectUtils_js_3a4a2246__.EntityObjectUtils.createEntityLineGeometry(entity);
            if (!geometry) {
                previewObject && (previewObject.visible = false);
                return;
            }
            if (previewObject) {
                previewObject.geometry.dispose();
                previewObject.geometry = geometry;
                previewObject.computeLineDistances();
                previewObject.visible = true;
            } else {
                previewObject = new __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_Addons_js_c109df0d__.Line2(geometry, this.selectedEntityOriginalMaterial);
                previewObject.computeLineDistances();
                this.group.add(previewObject);
                this.previewLineObjects[i] = previewObject;
            }
        });
        this.previewLineObjects.slice(res.createdEntities.length).forEach((obj)=>obj.visible = false);
    }
    clearPreviewObjects() {
        this.previewLineObjects.forEach((obj)=>{
            obj.geometry.dispose();
            this.group.remove(obj);
        });
        this.previewLineObjects = [];
    }
    executeOperate() {
        if (!this.firstPoint || !this.secondPoint || !this.selectedEntity) return;
        const { createdEntities, deleteEntities } = __WEBPACK_EXTERNAL_MODULE__EntityEditHandler_js_9944ecc6__.EntityEditHandler["break"]([
            this.selectedEntity
        ], {
            firstPoint: this.firstPoint,
            secondPoint: this.secondPoint
        });
        if (0 === createdEntities.length && 0 === deleteEntities.length) return;
        this.historyManager.addCommandAndExecute(new __WEBPACK_EXTERNAL_MODULE__command_BreakEntityCommand_js_aee24987__.BreakEntityCommand([
            this.selectedEntity
        ], createdEntities, this.viewManager));
    }
    constructor(...args){
        super(...args), this.name = __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.BreakEntityTool, this.machine = breakEntityMachine.provide({
            actions: {
                entrySpecifyFirstPoint: ()=>this.entrySpecifyFirstPoint(),
                entrySpecifySecondPoint: ()=>this.entrySpecifySecondPoint()
            }
        }), this.group = new __WEBPACK_EXTERNAL_MODULE_three__.Group(), this.previewLineObjects = [];
    }
}
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.CADViewManager),
    _ts_metadata("design:type", "undefined" == typeof CADViewManager ? Object : CADViewManager)
], BreakEntityTool.prototype, "viewManager", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.EntitySelector),
    _ts_metadata("design:type", "undefined" == typeof EntitySelector ? Object : EntitySelector)
], BreakEntityTool.prototype, "entitySelector", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.MouseTipHelper),
    _ts_metadata("design:type", "undefined" == typeof MouseTipHelper ? Object : MouseTipHelper)
], BreakEntityTool.prototype, "mouseTipHelper", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.AuxiliaryMouseHelper),
    _ts_metadata("design:type", "undefined" == typeof AuxiliaryMouseHelper ? Object : AuxiliaryMouseHelper)
], BreakEntityTool.prototype, "auxiliaryMouseHelper", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.HistoryManager),
    _ts_metadata("design:type", "undefined" == typeof HistoryManager ? Object : HistoryManager)
], BreakEntityTool.prototype, "historyManager", void 0);
BreakEntityTool = _ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.injectable)()
], BreakEntityTool);
export { BreakEntityTool };
