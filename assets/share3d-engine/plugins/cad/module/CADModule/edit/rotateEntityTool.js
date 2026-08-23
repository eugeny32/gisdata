import * as __WEBPACK_EXTERNAL_MODULE_inversify__ from "inversify";
import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE_xstate__ from "xstate";
import * as __WEBPACK_EXTERNAL_MODULE__common_setting_js_85f066cc__ from "../../common/setting.js";
import * as __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__ from "../../container/types.js";
import * as __WEBPACK_EXTERNAL_MODULE__core_tool_StateMachineTool_js_4ff72ac2__ from "../../core/tool/StateMachineTool.js";
import * as __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__ from "../../i18n/tipKeys.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__ from "../../utils/DrawUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1bc05401__ from "../../../../../shared/constants/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__ from "../auxiliaryTool/MouseTipHelper.js";
import * as __WEBPACK_EXTERNAL_MODULE__command_RotateEntityCommand_js_3b203ae7__ from "../command/RotateEntityCommand.js";
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
}
const rotateEntityMachine = (0, __WEBPACK_EXTERNAL_MODULE_xstate__.setup)({
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
    id: 'rotateEntity',
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
class RotateEntityTool extends __WEBPACK_EXTERNAL_MODULE__core_tool_StateMachineTool_js_4ff72ac2__.StateMachineTool {
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
        this.currentPoint = void 0;
        this.baseAngle = 0;
        this.leadLineObject = void 0;
        this.entityGroup = void 0;
    }
    onMouseDown(params) {
        if (0 === params.event.button) {
            if (this.checkState('specifyBasePoint')) {
                this.basePoint = {
                    ...params.worldPos
                };
                this.currentPoint = {
                    ...params.worldPos
                };
                this.baseAngle = Math.atan2(params.worldPos.y - this.basePoint.y, params.worldPos.x - this.basePoint.x);
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
        this.mouseTipHelper.updateTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Edit, __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.edit.rotate.pendingCount, {
            count: this.selectedEntities.length
        });
    }
    mouseCapture(params) {
        this.currentPoint = this.auxiliaryMouseHelper.mouseCapture(params);
    }
    isSelectedEntity() {
        return this.selectedEntities.length > 0;
    }
    entrySelectEntity() {
        this.inject(this.entitySelector);
        this.mouseTipHelper.addTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Edit, __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.edit.rotate.pendingCount, {
            count: this.selectedEntities.length
        });
    }
    exitSelectEntity() {
        this.eject(this.entitySelector);
    }
    entrySpecifyBasePoint() {
        this.mouseTipHelper.addTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Edit, __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.edit.rotate.basePoint);
        this.inject(this.auxiliaryMouseHelper);
    }
    entrySpecifySecondPoint() {
        this.mouseTipHelper.addTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Edit, __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.edit.rotate.angle);
    }
    update() {
        if (!this.basePoint || !this.currentPoint) return;
        this.updateLeadLine({
            startPoint: this.basePoint,
            endPoint: this.currentPoint
        });
        if (this.checkState('specifySecondPoint')) {
            const angle = this.computeAngle();
            this.updateEntityGroup(angle);
        }
    }
    computeAngle() {
        if (!this.basePoint || !this.currentPoint) return 0;
        const currentAngle = Math.atan2(this.currentPoint.y - this.basePoint.y, this.currentPoint.x - this.basePoint.x);
        return currentAngle - this.baseAngle;
    }
    updateEntityGroup(angle) {
        if (!this.basePoint) return;
        if (!this.entityGroup) {
            this.entityGroup = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
            this.group.add(this.entityGroup);
            this.selectedEntities.forEach((entity)=>{
                const object = this.viewManager.getEntityObject(entity);
                const cloneObject = object?.clone();
                cloneObject && this.entityGroup.add(cloneObject);
            });
        }
        const { x, y } = this.basePoint;
        const mat = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4().makeTranslation(x, y, 0).multiply(new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4().makeRotationZ(angle)).multiply(new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4().makeTranslation(-x, -y, 0));
        this.entityGroup.matrix.copy(mat);
        this.entityGroup.matrixAutoUpdate = false;
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
            this.leadLineObject = __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__.DrawUtils.drawDashedLine(line.startPoint, line.endPoint, {
                color: __WEBPACK_EXTERNAL_MODULE__common_setting_js_85f066cc__.Setting.leadLineConfig.color,
                opacity: __WEBPACK_EXTERNAL_MODULE__common_setting_js_85f066cc__.Setting.leadLineConfig.opacity,
                transparent: __WEBPACK_EXTERNAL_MODULE__common_setting_js_85f066cc__.Setting.leadLineConfig.opacity < 1,
                dashSize,
                gapSize: dashSize / 2,
                depthTest: false,
                depthWrite: false
            }, this.group);
        }
    }
    executeOperate() {
        if (!this.basePoint || !this.currentPoint) return;
        const angle = this.computeAngle();
        const command = new __WEBPACK_EXTERNAL_MODULE__command_RotateEntityCommand_js_3b203ae7__.RotateEntityCommand(this.selectedEntities, {
            center: this.basePoint,
            angle
        }, this.viewManager);
        this.historyManager.addCommandAndExecute(command);
    }
    constructor(...args){
        super(...args), this.name = __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.RotateEntityTool, this.machine = rotateEntityMachine.provide({
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
        }), this.selectedEntities = [], this.baseAngle = 0, this.group = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
    }
}
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.CADViewManager),
    _ts_metadata("design:type", "undefined" == typeof CADViewManager ? Object : CADViewManager)
], RotateEntityTool.prototype, "viewManager", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.EntitySelector),
    _ts_metadata("design:type", "undefined" == typeof EntitySelector ? Object : EntitySelector)
], RotateEntityTool.prototype, "entitySelector", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.MouseTipHelper),
    _ts_metadata("design:type", "undefined" == typeof MouseTipHelper ? Object : MouseTipHelper)
], RotateEntityTool.prototype, "mouseTipHelper", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.HistoryManager),
    _ts_metadata("design:type", "undefined" == typeof HistoryManager ? Object : HistoryManager)
], RotateEntityTool.prototype, "historyManager", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.AuxiliaryMouseHelper),
    _ts_metadata("design:type", "undefined" == typeof AuxiliaryMouseHelper ? Object : AuxiliaryMouseHelper)
], RotateEntityTool.prototype, "auxiliaryMouseHelper", void 0);
RotateEntityTool = _ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.injectable)()
], RotateEntityTool);
export { RotateEntityTool };
