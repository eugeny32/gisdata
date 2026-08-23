import * as __WEBPACK_EXTERNAL_MODULE_inversify__ from "inversify";
import * as __WEBPACK_EXTERNAL_MODULE_nanoid__ from "nanoid";
import * as __WEBPACK_EXTERNAL_MODULE_xstate__ from "xstate";
import * as __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__ from "../../container/types.js";
import * as __WEBPACK_EXTERNAL_MODULE__core_selector_Selector_js_7c4871fe__ from "../../core/selector/Selector.js";
import * as __WEBPACK_EXTERNAL_MODULE__core_tool_StateMachineTool_js_4ff72ac2__ from "../../core/tool/StateMachineTool.js";
import * as __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__ from "../../i18n/tipKeys.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_focusCadTipInput_js_15e83685__ from "../../utils/focusCadTipInput.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_styleCadTipNumberInput_js_2c62e34c__ from "../../utils/styleCadTipNumberInput.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1bc05401__ from "../../../../../shared/constants/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__ from "../auxiliaryTool/MouseTipHelper.js";
import * as __WEBPACK_EXTERNAL_MODULE__command_OffsetEntityCommand_js_955dd514__ from "../command/OffsetEntityCommand.js";
import * as __WEBPACK_EXTERNAL_MODULE__EntityEditHandler_js_9944ecc6__ from "./EntityEditHandler.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_offsetUtils_js_4693f150__ from "./utils/offsetUtils.js";
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
}
const offsetEntityMachine = (0, __WEBPACK_EXTERNAL_MODULE_xstate__.setup)({
    actions: {
        entryInputDistance: ()=>{},
        exitInputDistance: ()=>{},
        entrySelectEntity: ()=>{},
        exitSelectEntity: ()=>{},
        entrySpecifyDirection: ()=>{},
        exitSpecifyDirection: ()=>{},
        entryExecute: ()=>{}
    },
    guards: {
        hasSelectedEntity: ()=>false
    }
}).createMachine({
    id: 'offsetEntity',
    initial: 'idle',
    states: {
        idle: {
            on: {
                NEXT: 'inputDistance'
            }
        },
        inputDistance: {
            entry: {
                type: 'entryInputDistance'
            },
            exit: {
                type: 'exitInputDistance'
            },
            on: {
                NEXT: 'selectEntity',
                MOUSE_RIGHT_DOWN: 'selectEntity'
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
                NEXT: {
                    target: 'specifyDirection',
                    guard: 'hasSelectedEntity'
                }
            }
        },
        specifyDirection: {
            entry: {
                type: 'entrySpecifyDirection'
            },
            exit: {
                type: 'exitSpecifyDirection'
            },
            on: {
                MOUSE_RIGHT_DOWN: 'execute'
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
class OffsetEntityTool extends __WEBPACK_EXTERNAL_MODULE__core_tool_StateMachineTool_js_4ff72ac2__.StateMachineTool {
    onInitialize() {
        this.entitySelector.clearSelection();
        this.entitySelector.config({
            enableFrameSelect: false,
            mode: __WEBPACK_EXTERNAL_MODULE__core_selector_Selector_js_7c4871fe__.SelectMode.replace
        });
        this.currentCommand = new __WEBPACK_EXTERNAL_MODULE__command_OffsetEntityCommand_js_955dd514__.OffsetEntityCommand(this.viewManager);
        this.historyManager.startCommand(this.currentCommand);
        this.send({
            type: 'NEXT'
        });
    }
    onTerminate() {
        this.historyManager.commitCommand();
        this.entitySelector.clearSelection();
        this.entitySelector.resetConfig();
        this.mouseTipHelper.removeTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Edit);
        this.removeInputEl();
        this.clearEntityPreviewMap();
        this.selectedEntity = null;
        this.currentCommand = null;
        this.offsetDistance = this.defaultOffsetDistance;
        this.offsetSide = 1;
    }
    onMouseDown(params) {
        if (2 === params.event.button) this.send({
            type: 'MOUSE_RIGHT_DOWN'
        });
    }
    onMouseMove(params) {
        this.mousePos = {
            x: params.worldPos.x,
            y: params.worldPos.y
        };
        if (this.checkState('specifyDirection')) this.updateCanvas();
    }
    onKeyDown(params) {
        if (params.event.keyCode === __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1bc05401__.KeyCodes.ESC) {
            this.exit();
            return;
        }
        if (this.checkState('inputDistance') && params.event.keyCode === __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1bc05401__.KeyCodes.ENTER) this.send({
            type: 'NEXT'
        });
    }
    onSelectorChanged(entities) {
        if (entities.length > 0) {
            this.selectedEntity = entities[0];
            this.send({
                type: 'NEXT'
            });
        } else this.selectedEntity = null;
    }
    onDetectorFilter(entities) {
        return entities.filter((e)=>__WEBPACK_EXTERNAL_MODULE__utils_offsetUtils_js_4693f150__.OffsetUtils.EnabledEntityTypes.has(e.type));
    }
    hasSelectedEntity() {
        return null !== this.selectedEntity;
    }
    entryInputDistance() {
        this.showInputEl();
    }
    exitInputDistance() {
        this.mouseTipHelper.removeTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Edit);
        this.removeInputEl();
    }
    entrySelectEntity() {
        this.selectedEntity = null;
        this.entitySelector.clearSelection();
        this.inject(this.entitySelector);
        this.mouseTipHelper.addTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Edit, __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.edit.offset.target);
    }
    exitSelectEntity() {
        this.eject(this.entitySelector);
    }
    entrySpecifyDirection() {
        this.mouseTipHelper.addTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Edit, __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.edit.offset.direction);
    }
    exitSpecifyDirection() {}
    entryExecute() {
        this.executeOffset();
    }
    showInputEl() {
        this.mouseTipHelper.removeTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Edit);
        this.removeInputEl();
        this.mouseTipHelper.addCustomTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Edit, (translate)=>this.createDistanceTipElement(translate));
        if (this.inputEl) (0, __WEBPACK_EXTERNAL_MODULE__utils_focusCadTipInput_js_15e83685__.focusCadTipInput)(this.inputEl, true);
    }
    createDistanceTipElement(translate) {
        const element = document.createElement('span');
        element.innerText = translate(__WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.edit.offset.distanceLabel);
        element.style = 'background-color: #fff; color: black; padding: 4px; font-size: 12px;';
        const inputElement = document.createElement('input');
        inputElement.type = 'number';
        inputElement.value = String(this.offsetDistance);
        (0, __WEBPACK_EXTERNAL_MODULE__utils_styleCadTipNumberInput_js_2c62e34c__.styleCadTipNumberInput)(inputElement);
        inputElement.addEventListener('change', ()=>{
            const value = parseInt(inputElement.value, 10);
            if (Number.isNaN(value) || value <= 0) {
                inputElement.value = String(this.defaultOffsetDistance);
                this.offsetDistance = this.defaultOffsetDistance;
            } else this.offsetDistance = value;
        });
        inputElement.addEventListener('mousedown', (e)=>{
            if (2 === e.button) {
                e.stopPropagation();
                e.preventDefault();
                this.send({
                    type: 'NEXT'
                });
            }
        });
        if (this.onDocumentMouseDown) {
            document.removeEventListener('mousedown', this.onDocumentMouseDown, false);
            this.onDocumentMouseDown = null;
        }
        this.onDocumentMouseDown = (event)=>{
            if (event.target !== inputElement) {
                event.preventDefault();
                (0, __WEBPACK_EXTERNAL_MODULE__utils_focusCadTipInput_js_15e83685__.focusCadTipInput)(inputElement, true);
            }
        };
        document.addEventListener('mousedown', this.onDocumentMouseDown, false);
        element.appendChild(inputElement);
        this.inputEl = inputElement;
        return element;
    }
    removeInputEl() {
        if (this.inputEl) {
            this.inputEl.parentElement?.removeChild(this.inputEl);
            this.inputEl = null;
        }
        if (this.onDocumentMouseDown) {
            document.removeEventListener('mousedown', this.onDocumentMouseDown, false);
            this.onDocumentMouseDown = null;
        }
    }
    updateCanvas() {
        if (!this.selectedEntity) return;
        this.offsetSide = this.computeSide();
        const entityId = this.selectedEntity.id;
        if (!this.entityPreviewMap.has(entityId)) this.entityPreviewMap.set(entityId, new Map());
        const previewMap = this.entityPreviewMap.get(entityId);
        const previewData = previewMap.get(this.offsetSide);
        previewMap?.forEach((data, side)=>{
            if (side !== this.offsetSide && data.object) data.object.visible = false;
        });
        if (previewData) {
            previewData.object && (previewData.object.visible = true);
            return;
        }
        const entity = __WEBPACK_EXTERNAL_MODULE__EntityEditHandler_js_9944ecc6__.EntityEditHandler.offset(this.selectedEntity, {
            distance: this.offsetDistance,
            side: this.offsetSide
        });
        entity && this.viewManager.objectManager.addEntity(entity);
        previewMap.set(this.offsetSide, {
            entity,
            object: entity ? this.viewManager.objectManager.getEntityObject(entity) || null : null
        });
    }
    clearEntityPreviewMap() {
        this.entityPreviewMap.forEach((previewMap)=>{
            previewMap.forEach((data)=>{
                data.entity && this.viewManager.objectManager.deleteEntity(data.entity);
            });
        });
        this.entityPreviewMap.clear();
    }
    hidePreview(entityId, side) {
        const previewMap = this.entityPreviewMap.get(entityId);
        const previewData = previewMap?.get(side);
        if (previewData?.object) previewData.object.visible = false;
    }
    computeSide() {
        if (!this.selectedEntity) return 1;
        return __WEBPACK_EXTERNAL_MODULE__utils_offsetUtils_js_4693f150__.OffsetUtils.computeSide(this.selectedEntity, this.mousePos);
    }
    executeOffset() {
        if (!this.selectedEntity || !this.currentCommand) return;
        const previewMap = this.entityPreviewMap.get(this.selectedEntity.id);
        const previewData = previewMap?.get(this.offsetSide);
        this.hidePreview(this.selectedEntity.id, this.offsetSide);
        this.offsetSide = 1;
        if (previewData?.entity) {
            const newEntity = previewData.entity.clone();
            newEntity.id = (0, __WEBPACK_EXTERNAL_MODULE_nanoid__.nanoid)();
            this.currentCommand.addEntity(newEntity);
        }
        this.send({
            type: 'NEXT'
        });
    }
    constructor(...args){
        super(...args), this.name = __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.OffsetEntityTool, this.machine = offsetEntityMachine.provide({
            actions: {
                entryInputDistance: ()=>this.entryInputDistance(),
                exitInputDistance: ()=>this.exitInputDistance(),
                entrySelectEntity: ()=>this.entrySelectEntity(),
                exitSelectEntity: ()=>this.exitSelectEntity(),
                entrySpecifyDirection: ()=>this.entrySpecifyDirection(),
                exitSpecifyDirection: ()=>this.exitSpecifyDirection(),
                entryExecute: ()=>this.entryExecute()
            },
            guards: {
                hasSelectedEntity: ()=>this.hasSelectedEntity()
            }
        }), this.defaultOffsetDistance = 2, this.offsetDistance = this.defaultOffsetDistance, this.offsetSide = 1, this.selectedEntity = null, this.mousePos = {
            x: 0,
            y: 0
        }, this.entityPreviewMap = new Map(), this.currentCommand = null, this.inputEl = null, this.onDocumentMouseDown = null;
    }
}
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.CADViewManager),
    _ts_metadata("design:type", "undefined" == typeof CADViewManager ? Object : CADViewManager)
], OffsetEntityTool.prototype, "viewManager", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.EntitySelector),
    _ts_metadata("design:type", "undefined" == typeof EntitySelector ? Object : EntitySelector)
], OffsetEntityTool.prototype, "entitySelector", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.MouseTipHelper),
    _ts_metadata("design:type", "undefined" == typeof MouseTipHelper ? Object : MouseTipHelper)
], OffsetEntityTool.prototype, "mouseTipHelper", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.HistoryManager),
    _ts_metadata("design:type", "undefined" == typeof HistoryManager ? Object : HistoryManager)
], OffsetEntityTool.prototype, "historyManager", void 0);
OffsetEntityTool = _ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.injectable)()
], OffsetEntityTool);
export { OffsetEntityTool };
