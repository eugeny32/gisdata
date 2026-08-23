import * as __WEBPACK_EXTERNAL_MODULE_inversify__ from "inversify";
import * as __WEBPACK_EXTERNAL_MODULE_xstate__ from "xstate";
import * as __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__ from "../../container/types.js";
import * as __WEBPACK_EXTERNAL_MODULE__core_tool_StateMachineTool_js_4ff72ac2__ from "../../core/tool/StateMachineTool.js";
import * as __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__ from "../../i18n/tipKeys.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1bc05401__ from "../../../../../shared/constants/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__ from "../auxiliaryTool/MouseTipHelper.js";
import * as __WEBPACK_EXTERNAL_MODULE__command_DrawHatchCommand_js_3bcfc699__ from "../command/DrawHatchCommand.js";
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
}
const hatchMachine = (0, __WEBPACK_EXTERNAL_MODULE_xstate__.setup)({
    actions: {
        showMouseTip: (..._args)=>{}
    }
}).createMachine({
    id: 'drawHatchTool',
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
                    entry: {
                        type: 'showMouseTip',
                        params: __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.draw.hatch.target
                    }
                }
            }
        }
    }
});
class DrawHatchTool extends __WEBPACK_EXTERNAL_MODULE__core_tool_StateMachineTool_js_4ff72ac2__.StateMachineTool {
    onInitialize(_entityData) {
        this.entitySelector.clearSelection();
        this.inject(this.auxiliaryMouseHelper);
        this.currentCommand = new __WEBPACK_EXTERNAL_MODULE__command_DrawHatchCommand_js_3bcfc699__.DrawHatchCommand(this.viewManager);
        this.historyManager.startCommand(this.currentCommand);
        this.send({
            type: 'NEXT'
        });
    }
    onTerminate() {
        this.historyManager.commitCommand();
        this.mouseTipHelper.removeTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Draw);
        this.eject(this.auxiliaryMouseHelper);
        this.tempPoint = null;
        this.currentCommand = null;
    }
    onMouseDown(params) {
        if (0 === params.event.button) {
            if (this.tempPoint) this.historyManager.refresh();
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
        const finalPoint = this.auxiliaryMouseHelper.mouseCapture(params);
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
    updateObject() {}
    constructor(...args){
        super(...args), this.name = __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.DrawHatchTool, this.machine = hatchMachine.provide({
            actions: {
                showMouseTip: (_v, tip)=>{
                    this.showMouseTip(tip);
                }
            }
        }), this.tempPoint = null, this.currentCommand = null;
    }
}
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.CADViewManager),
    _ts_metadata("design:type", "undefined" == typeof CADViewManager ? Object : CADViewManager)
], DrawHatchTool.prototype, "viewManager", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.EntitySelector),
    _ts_metadata("design:type", "undefined" == typeof EntitySelector ? Object : EntitySelector)
], DrawHatchTool.prototype, "entitySelector", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.MouseTipHelper),
    _ts_metadata("design:type", "undefined" == typeof MouseTipHelper ? Object : MouseTipHelper)
], DrawHatchTool.prototype, "mouseTipHelper", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.HistoryManager),
    _ts_metadata("design:type", "undefined" == typeof HistoryManager ? Object : HistoryManager)
], DrawHatchTool.prototype, "historyManager", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.AuxiliaryMouseHelper),
    _ts_metadata("design:type", "undefined" == typeof AuxiliaryMouseHelper ? Object : AuxiliaryMouseHelper)
], DrawHatchTool.prototype, "auxiliaryMouseHelper", void 0);
DrawHatchTool = _ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.injectable)()
], DrawHatchTool);
export { DrawHatchTool };
