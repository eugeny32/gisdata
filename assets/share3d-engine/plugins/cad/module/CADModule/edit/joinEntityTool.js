import * as __WEBPACK_EXTERNAL_MODULE_inversify__ from "inversify";
import * as __WEBPACK_EXTERNAL_MODULE_xstate__ from "xstate";
import * as __WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__ from "../auxiliaryTool/MouseTipHelper.js";
import * as __WEBPACK_EXTERNAL_MODULE__command_JoinEntityCommand_js_aea20f79__ from "../command/JoinEntityCommand.js";
import * as __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__ from "../../container/types.js";
import * as __WEBPACK_EXTERNAL_MODULE__core_tool_StateMachineTool_js_4ff72ac2__ from "../../core/tool/StateMachineTool.js";
import * as __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__ from "../../i18n/tipKeys.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1bc05401__ from "../../../../../shared/constants/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__EntityEditHandler_js_9944ecc6__ from "./EntityEditHandler.js";
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
}
const joinEntityMachine = (0, __WEBPACK_EXTERNAL_MODULE_xstate__.setup)({
    actions: {
        entrySelectEntity: ()=>{},
        exitSelectEntity: ()=>{},
        entryFinished: ()=>{}
    },
    guards: {
        isSelectedEntity: ()=>false
    }
}).createMachine({
    id: 'joinEntity',
    initial: 'idle',
    states: {
        idle: {
            on: {
                NEXT: [
                    'selectEntity'
                ]
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
                NEXT: 'finished'
            }
        },
        finished: {
            entry: {
                type: 'entryFinished'
            },
            type: 'final'
        }
    }
});
class JoinEntityTool extends __WEBPACK_EXTERNAL_MODULE__core_tool_StateMachineTool_js_4ff72ac2__.StateMachineTool {
    onInitialize() {
        this.selectedEntities = this.entitySelector.getSelected();
        this.historyManager.setLock(true);
        this.send({
            type: 'NEXT'
        });
    }
    onTerminate() {
        this.entitySelector.clearSelection();
        this.historyManager.setLock(false);
        if (!this.timer) this.mouseTipHelper.removeTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Edit);
        this.selectedEntities = [];
    }
    onMouseDown(params) {
        if (0 === params.event.button) ;
        else if (2 === params.event.button) this.send({
            type: 'NEXT'
        });
    }
    onKeyDown(params) {
        if (params.event.keyCode === __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1bc05401__.KeyCodes.ESC) this.exit();
    }
    onSelectorChanged(entities) {
        this.selectedEntities = entities;
        this.mouseTipHelper.updateTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Edit, __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.edit.join.pendingCount, {
            count: this.selectedEntities.length
        });
    }
    isSelectedEntity() {
        return this.selectedEntities.length >= 2;
    }
    entrySelectEntity() {
        this.inject(this.entitySelector);
        this.mouseTipHelper.addTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Edit, __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.edit.join.pendingCount, {
            count: this.selectedEntities.length
        });
    }
    exitSelectEntity() {
        this.eject(this.entitySelector);
    }
    entryFinished() {
        this.executeOperate();
        this.exit();
    }
    executeOperate() {
        if (0 === this.selectedEntities.length) return;
        const { nonJoinedEntities, createdEntities } = __WEBPACK_EXTERNAL_MODULE__EntityEditHandler_js_9944ecc6__.EntityEditHandler.join(this.selectedEntities);
        const deleteEntities = this.selectedEntities.filter((e)=>!nonJoinedEntities.includes(e));
        this.entitySelector.clearSelection();
        this.mouseTipHelper.addTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Edit, __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.edit.join.result, {
            joined: deleteEntities.length,
            skipped: nonJoinedEntities.length
        });
        this.timer = setTimeout(()=>{
            this.mouseTipHelper.removeTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Edit);
            this.timer = null;
        }, 1000);
        this.historyManager.addCommandAndExecute(new __WEBPACK_EXTERNAL_MODULE__command_JoinEntityCommand_js_aea20f79__.JoinEntityCommand(createdEntities, deleteEntities, this.viewManager));
    }
    constructor(...args){
        super(...args), this.name = __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.JoinEntityTool, this.machine = joinEntityMachine.provide({
            actions: {
                entrySelectEntity: ()=>this.entrySelectEntity(),
                exitSelectEntity: ()=>this.exitSelectEntity(),
                entryFinished: ()=>{
                    this.entryFinished();
                }
            },
            guards: {
                isSelectedEntity: ()=>this.isSelectedEntity()
            }
        }), this.selectedEntities = [], this.timer = null;
    }
}
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.CADViewManager),
    _ts_metadata("design:type", "undefined" == typeof CADViewManager ? Object : CADViewManager)
], JoinEntityTool.prototype, "viewManager", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.EntitySelector),
    _ts_metadata("design:type", "undefined" == typeof EntitySelector ? Object : EntitySelector)
], JoinEntityTool.prototype, "entitySelector", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.MouseTipHelper),
    _ts_metadata("design:type", "undefined" == typeof MouseTipHelper ? Object : MouseTipHelper)
], JoinEntityTool.prototype, "mouseTipHelper", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.HistoryManager),
    _ts_metadata("design:type", "undefined" == typeof HistoryManager ? Object : HistoryManager)
], JoinEntityTool.prototype, "historyManager", void 0);
JoinEntityTool = _ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.injectable)()
], JoinEntityTool);
export { JoinEntityTool };
