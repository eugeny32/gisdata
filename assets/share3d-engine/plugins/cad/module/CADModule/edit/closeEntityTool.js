import * as __WEBPACK_EXTERNAL_MODULE_inversify__ from "inversify";
import * as __WEBPACK_EXTERNAL_MODULE_xstate__ from "xstate";
import * as __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__ from "../../container/types.js";
import * as __WEBPACK_EXTERNAL_MODULE__core_selector_Selector_js_7c4871fe__ from "../../core/selector/Selector.js";
import * as __WEBPACK_EXTERNAL_MODULE__core_tool_StateMachineTool_js_4ff72ac2__ from "../../core/tool/StateMachineTool.js";
import * as __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__ from "../../i18n/tipKeys.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1bc05401__ from "../../../../../shared/constants/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__ from "../auxiliaryTool/MouseTipHelper.js";
import * as __WEBPACK_EXTERNAL_MODULE__command_CloseEntityCommand_js_a5c15de0__ from "../command/CloseEntityCommand.js";
import * as __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__ from "../model/common/constant.js";
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
}
const closeEntityMachine = (0, __WEBPACK_EXTERNAL_MODULE_xstate__.setup)({
    actions: {
        entrySelectEntity: ()=>{},
        exitSelectEntity: ()=>{},
        entryExecute: ()=>{}
    }
}).createMachine({
    id: 'closeEntity',
    initial: 'idle',
    states: {
        idle: {
            on: {
                NEXT: 'selectEntity'
            }
        },
        selectEntity: {
            entry: {
                type: 'entrySelectEntity'
            },
            exit: {
                type: 'exitSelectEntity'
            },
            on: {
                NEXT: 'execute'
            }
        },
        execute: {
            entry: {
                type: 'entryExecute'
            },
            on: {
                NEXT: 'selectEntity'
            }
        }
    }
});
class CloseEntityTool extends __WEBPACK_EXTERNAL_MODULE__core_tool_StateMachineTool_js_4ff72ac2__.StateMachineTool {
    onInitialize() {
        this.entitySelector.clearSelection();
        this.entitySelector.config({
            enableFrameSelect: false,
            mode: __WEBPACK_EXTERNAL_MODULE__core_selector_Selector_js_7c4871fe__.SelectMode.replace
        });
        this.currentCommand = new __WEBPACK_EXTERNAL_MODULE__command_CloseEntityCommand_js_a5c15de0__.CloseEntityCommand(this.viewManager);
        this.historyManager.startCommand(this.currentCommand);
        this.send({
            type: 'NEXT'
        });
    }
    onTerminate() {
        this.entitySelector.clearSelection();
        this.entitySelector.resetConfig();
        this.historyManager.commitCommand();
        if (!this.timer) this.mouseTipHelper.removeTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Edit);
        this.selectedEntities = [];
        this.currentCommand = null;
    }
    onMouseDown(params) {
        if (2 === params.event.button && this.checkState('selectEntity')) this.send({
            type: 'NEXT'
        });
    }
    onKeyDown(params) {
        if (params.event.keyCode === __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1bc05401__.KeyCodes.ESC) this.exit();
    }
    onSelectorChanged(entities) {
        this.selectedEntities = entities;
    }
    onDetectorFilter(entities) {
        return entities.filter((entity)=>[
                __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Polyline
            ].includes(entity.type));
    }
    entrySelectEntity() {
        this.inject(this.entitySelector);
        this.mouseTipHelper.addTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Edit, __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.edit.close.target);
    }
    exitSelectEntity() {
        this.eject(this.entitySelector);
    }
    entryExecute() {
        if (0 === this.selectedEntities.length) this.send({
            type: 'NEXT'
        });
        else this.executeOperate();
    }
    executeOperate() {
        this.currentCommand?.addEntities(this.selectedEntities);
        this.selectedEntities = [];
        this.entitySelector.clearSelection();
        this.mouseTipHelper.addTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Edit, __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.edit.close.success);
        this.timer = setTimeout(()=>{
            this.send({
                type: 'NEXT'
            });
            this.timer = null;
        }, 2000);
    }
    constructor(...args){
        super(...args), this.name = __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.CloseEntityTool, this.machine = closeEntityMachine.provide({
            actions: {
                entrySelectEntity: ()=>this.entrySelectEntity(),
                exitSelectEntity: ()=>this.exitSelectEntity(),
                entryExecute: ()=>this.entryExecute()
            }
        }), this.selectedEntities = [], this.timer = null, this.currentCommand = null;
    }
}
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.CADViewManager),
    _ts_metadata("design:type", "undefined" == typeof CADViewManager ? Object : CADViewManager)
], CloseEntityTool.prototype, "viewManager", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.EntitySelector),
    _ts_metadata("design:type", "undefined" == typeof EntitySelector ? Object : EntitySelector)
], CloseEntityTool.prototype, "entitySelector", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.MouseTipHelper),
    _ts_metadata("design:type", "undefined" == typeof MouseTipHelper ? Object : MouseTipHelper)
], CloseEntityTool.prototype, "mouseTipHelper", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.HistoryManager),
    _ts_metadata("design:type", "undefined" == typeof HistoryManager ? Object : HistoryManager)
], CloseEntityTool.prototype, "historyManager", void 0);
CloseEntityTool = _ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.injectable)()
], CloseEntityTool);
export { CloseEntityTool };
