import * as __WEBPACK_EXTERNAL_MODULE_inversify__ from "inversify";
import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE_xstate__ from "xstate";
import * as __WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__ from "../auxiliaryTool/MouseTipHelper.js";
import * as __WEBPACK_EXTERNAL_MODULE__command_MoveEntityCommand_js_7a404e96__ from "../command/MoveEntityCommand.js";
import * as __WEBPACK_EXTERNAL_MODULE__common_setting_js_85f066cc__ from "../../common/setting.js";
import * as __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__ from "../../container/types.js";
import * as __WEBPACK_EXTERNAL_MODULE__core_tool_StateMachineTool_js_4ff72ac2__ from "../../core/tool/StateMachineTool.js";
import * as __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__ from "../../i18n/tipKeys.js";
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
const moveEntityMachine = (0, __WEBPACK_EXTERNAL_MODULE_xstate__.setup)({
    actions: {
        entrySelectEntity: ()=>{},
        exitSelectEntity: ()=>{},
        entrySpecifyBasePoint: ()=>{},
        entrySpecifySecondPoint: ()=>{},
        entryCanceling: ()=>{}
    },
    guards: {
        isSelectedEntity: ()=>false
    }
}).createMachine({
    id: 'moveEntity',
    initial: 'idle',
    states: {
        idle: {
            on: {
                NEXT: [
                    {
                        target: 'specifyBasePoint',
                        guard: 'isSelectedEntity'
                    },
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
                NEXT: 'specifyBasePoint',
                MOUSE_RIGHT_DOWN: [
                    {
                        target: 'specifyBasePoint',
                        guard: 'isSelectedEntity'
                    },
                    'canceling'
                ]
            }
        },
        specifyBasePoint: {
            entry: {
                type: 'entrySpecifyBasePoint'
            },
            on: {
                NEXT: 'specifySecondPoint'
            }
        },
        specifySecondPoint: {
            entry: {
                type: 'entrySpecifySecondPoint'
            }
        },
        canceling: {
            entry: {
                type: 'entryCanceling'
            }
        }
    }
});
class MoveEntityTool extends __WEBPACK_EXTERNAL_MODULE__core_tool_StateMachineTool_js_4ff72ac2__.StateMachineTool {
    onInitialize() {
        this.selectedEntities = this.entitySelector.getSelected();
        this.viewManager.attachTempObject(this.group);
        this.historyManager.setLock(true);
        this.send({
            type: 'NEXT'
        });
    }
    onTerminate() {
        this.leadLineObject && __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__.DrawUtils.disposeObject(this.leadLineObject);
        this.entityGroup && __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__.DrawUtils.disposeObject(this.entityGroup);
        this.group.parent?.remove(this.group);
        this.entitySelector.clearSelection();
        this.mouseTipHelper.removeTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Edit);
        this.historyManager.setLock(false);
        this.eject(this.auxiliaryMouseHelper);
        this.selectedEntities = [];
        this.basePoint = void 0;
        this.secondPoint = void 0;
        this.leadLineObject = void 0;
        this.entityGroup = void 0;
    }
    onMouseDown(params) {
        if (0 === params.event.button) {
            if (this.checkState('specifyBasePoint')) {
                this.basePoint = {
                    ...params.worldPos
                };
                this.send({
                    type: 'NEXT'
                });
                return;
            }
        } else if (2 === params.event.button) {
            if (this.checkState('selectEntity')) {
                this.send({
                    type: 'MOUSE_RIGHT_DOWN'
                });
                return;
            }
        }
        if (this.checkState('specifySecondPoint')) {
            this.executeOperate();
            this.exit();
        }
    }
    onMouseMove(params) {
        if (this.checkState('specifyBasePoint') || this.checkState('specifySecondPoint')) {
            this.mouseCapture(params);
            this.update();
        }
    }
    onKeyDown(params) {
        if (params.event.keyCode === __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1bc05401__.KeyCodes.ESC) this.exit();
    }
    onSelectorChanged(entities) {
        this.selectedEntities = entities;
        this.mouseTipHelper.updateTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Edit, __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.edit.move.pendingCount, {
            count: this.selectedEntities.length
        });
    }
    mouseCapture(params) {
        const startPoint = this.checkState('specifySecondPoint') && this.basePoint ? this.basePoint : void 0;
        const finalPoint = this.auxiliaryMouseHelper.mouseCapture(params, {
            startPoint
        });
        this.tempPoint = {
            x: finalPoint.x,
            y: finalPoint.y
        };
        if (this.checkState('specifySecondPoint')) this.secondPoint = {
            ...this.tempPoint
        };
    }
    isSelectedEntity() {
        return this.selectedEntities.length > 0;
    }
    entrySelectEntity() {
        this.inject(this.entitySelector);
        this.mouseTipHelper.addTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Edit, __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.edit.move.pendingCount, {
            count: this.selectedEntities.length
        });
    }
    exitSelectEntity() {
        this.eject(this.entitySelector);
    }
    entrySpecifyBasePoint() {
        this.mouseTipHelper.addTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Edit, __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.edit.move.basePoint);
        this.inject(this.auxiliaryMouseHelper);
    }
    entrySpecifySecondPoint() {
        this.mouseTipHelper.addTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Edit, __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.edit.move.targetPoint);
    }
    update() {
        if (!this.basePoint || !this.secondPoint) return;
        const line = {
            startPoint: this.basePoint,
            endPoint: this.secondPoint
        };
        const diffX = this.secondPoint.x - this.basePoint.x;
        const diffY = this.secondPoint.y - this.basePoint.y;
        this.updateLeadLine(line);
        this.updateEntityGroup({
            x: diffX,
            y: diffY
        });
    }
    updateEntityGroup(translate) {
        if (!this.entityGroup) {
            this.entityGroup = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
            this.group.add(this.entityGroup);
            this.selectedEntities.forEach((entity)=>{
                const object = this.viewManager.getEntityObject(entity);
                const cloneObject = object?.clone();
                cloneObject && this.entityGroup.add(cloneObject);
            });
        }
        this.entityGroup.position.set(translate.x, translate.y, 0);
    }
    updateLeadLine(line) {
        if (this.leadLineObject) {
            const geometry = __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__.DrawUtils.getBufferGeometryByPoints([
                line.startPoint,
                line.endPoint
            ]);
            this.leadLineObject.geometry = geometry;
            this.leadLineObject.geometry.attributes.position.needsUpdate = true;
            this.leadLineObject.computeLineDistances();
        } else {
            const dashSize = this.controller.getPixelSizeInWorld(__WEBPACK_EXTERNAL_MODULE__common_setting_js_85f066cc__.Setting.dashSize);
            const materialOprion = {
                color: __WEBPACK_EXTERNAL_MODULE__common_setting_js_85f066cc__.Setting.leadLineConfig.color,
                opacity: __WEBPACK_EXTERNAL_MODULE__common_setting_js_85f066cc__.Setting.leadLineConfig.opacity,
                transparent: __WEBPACK_EXTERNAL_MODULE__common_setting_js_85f066cc__.Setting.leadLineConfig.opacity < 1,
                dashSize,
                gapSize: dashSize / 2,
                depthTest: false,
                depthWrite: false
            };
            this.leadLineObject = __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__.DrawUtils.drawDashedLine(line.startPoint, line.endPoint, materialOprion, this.group);
        }
    }
    executeOperate() {
        if (!this.basePoint || !this.secondPoint) return;
        const translate = {
            x: this.secondPoint.x - this.basePoint.x,
            y: this.secondPoint.y - this.basePoint.y
        };
        const command = new __WEBPACK_EXTERNAL_MODULE__command_MoveEntityCommand_js_7a404e96__.MoveEntityCommand(this.selectedEntities, {
            translate
        }, this.viewManager);
        this.historyManager.addCommandAndExecute(command);
    }
    constructor(...args){
        super(...args), this.name = __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.MoveEntityTool, this.machine = moveEntityMachine.provide({
            actions: {
                entrySelectEntity: ()=>this.entrySelectEntity(),
                exitSelectEntity: ()=>this.exitSelectEntity(),
                entrySpecifyBasePoint: ()=>this.entrySpecifyBasePoint(),
                entrySpecifySecondPoint: ()=>this.entrySpecifySecondPoint(),
                entryCanceling: ()=>{
                    this.exit();
                }
            },
            guards: {
                isSelectedEntity: ()=>this.isSelectedEntity()
            }
        }), this.selectedEntities = [], this.group = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
    }
}
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.CADViewManager),
    _ts_metadata("design:type", "undefined" == typeof CADViewManager ? Object : CADViewManager)
], MoveEntityTool.prototype, "viewManager", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.EntitySelector),
    _ts_metadata("design:type", "undefined" == typeof EntitySelector ? Object : EntitySelector)
], MoveEntityTool.prototype, "entitySelector", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.MouseTipHelper),
    _ts_metadata("design:type", "undefined" == typeof MouseTipHelper ? Object : MouseTipHelper)
], MoveEntityTool.prototype, "mouseTipHelper", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.HistoryManager),
    _ts_metadata("design:type", "undefined" == typeof HistoryManager ? Object : HistoryManager)
], MoveEntityTool.prototype, "historyManager", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.AuxiliaryMouseHelper),
    _ts_metadata("design:type", "undefined" == typeof AuxiliaryMouseHelper ? Object : AuxiliaryMouseHelper)
], MoveEntityTool.prototype, "auxiliaryMouseHelper", void 0);
MoveEntityTool = _ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.injectable)()
], MoveEntityTool);
export { MoveEntityTool };
