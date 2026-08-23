import * as __WEBPACK_EXTERNAL_MODULE_inversify__ from "inversify";
import * as __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__ from "lodash-es";
import * as __WEBPACK_EXTERNAL_MODULE__renderInvalidation_js_1eceb3b2__ from "./renderInvalidation.js";
import * as __WEBPACK_EXTERNAL_MODULE__common_setting_js_26a0d8d5__ from "../common/setting.js";
import * as __WEBPACK_EXTERNAL_MODULE__container_types_js_cfed9b58__ from "../container/types.js";
import * as __WEBPACK_EXTERNAL_MODULE__core_tool_BaseTool_js_12891ae7__ from "../core/tool/BaseTool.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_f5144b54__ from "../utils/DrawUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_80c6d5a0__ from "../../../../shared/constants/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__command_DeleteEntityCommand_js_7b0c9b74__ from "./command/DeleteEntityCommand.js";
import * as __WEBPACK_EXTERNAL_MODULE__command_UpdateEntityCommand_js_3e8ce3bb__ from "./command/UpdateEntityCommand.js";
import * as __WEBPACK_EXTERNAL_MODULE__edit_entityGripHandler_js_aa131fe1__ from "./edit/entityGripHandler.js";
import * as __WEBPACK_EXTERNAL_MODULE__edit_entityGripOverlay_js_629769e8__ from "./edit/entityGripOverlay.js";
import * as __WEBPACK_EXTERNAL_MODULE__edit_updateEntityByGripCommand_js_d8cea1e4__ from "./edit/updateEntityByGripCommand.js";
import * as __WEBPACK_EXTERNAL_MODULE__manager_ObjectManager_js_9ae67701__ from "./manager/ObjectManager.js";
import * as __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_6042ba20__ from "./model/common/constant.js";
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
}
class CADDefaultTool extends __WEBPACK_EXTERNAL_MODULE__core_tool_BaseTool_js_12891ae7__.BaseTool {
    initialize() {
        this.gripOverlay = new __WEBPACK_EXTERNAL_MODULE__edit_entityGripOverlay_js_629769e8__.EntityGripOverlay(this.controller, this.viewManager);
        this.gripPreviewObjectManager = new __WEBPACK_EXTERNAL_MODULE__manager_ObjectManager_js_9ae67701__.ObjectManager();
        this.viewManager.attachTempObject(this.gripPreviewObjectManager.getSceneGroup());
        this.inject(this.entitySelector);
        this.entitySelector.resetConfig();
        this.historyManager.on('undoRedo', this.handleUndoRedo);
        this.refreshGrips();
    }
    terminate() {
        this.historyManager.off('undoRedo', this.handleUndoRedo);
        this.cancelGripEdit();
        this.finishTextEdit(true);
        this.gripOverlay?.dispose();
        this.clearGripPreviewLine();
        this.gripPreviewObjectManager?.dispose();
        this.gripPreviewObjectManager?.getSceneGroup().removeFromParent();
        this.gripOverlay = void 0;
        this.gripPreviewObjectManager = void 0;
        this.grips = [];
        this.hoverGripId = null;
        this.eject(this.entitySelector);
    }
    onPause() {
        this.cancelGripEdit();
        this.finishTextEdit(true);
        this.clearGripHover();
        this.clearGripPreview();
        this.gripOverlay?.clear();
        this.entitySelector.resetConfig();
        this.eject(this.entitySelector);
    }
    onPlay() {
        this.inject(this.entitySelector);
        this.entitySelector.resetConfig();
        this.refreshGrips();
    }
    onMouseDown(params) {
        if (this.activeTextEdit) return;
        if (2 === params.event.button) {
            if (this.activeGripEdit) this.cancelGripEdit();
            return;
        }
        if (0 !== params.event.button) return;
        if (this.activeGripEdit) {
            const targetPoint = this.getGripTargetPoint(params);
            this.previewGripEdit(targetPoint);
            this.commitGripEdit();
            return;
        }
        const hoverGrip = this.getGripById(this.hoverGripId);
        if (hoverGrip) this.beginGripEdit(hoverGrip);
    }
    onMouseMove(params) {
        if (this.activeTextEdit) return;
        if (this.activeGripEdit) {
            this.previewGripEdit(this.getGripTargetPoint(params));
            return;
        }
        this.updateHoverGrip(params.screenPos);
    }
    onDoubleClick(params) {
        if (this.activeGripEdit || this.activeTextEdit) return;
        const hit = this.controller.getCADIntersections(params.screenPos).find((intersection)=>{
            const entity = intersection.object.userData?.entity;
            return entity?.type === __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_6042ba20__.EntityType.MLeader && intersection.object.userData?.hitRole === 'mleader-text';
        });
        const entity = hit?.object.userData?.entity;
        if (!entity) return;
        const isSelected = this.entitySelector.getSelected().some((selectedEntity)=>selectedEntity.id === entity.id);
        if (!isSelected) return;
        params.event.preventDefault();
        params.event.stopPropagation();
        this.beginTextEdit(entity);
    }
    onKeyDown(params) {
        if (this.activeTextEdit) {
            if (params.event.keyCode === __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_80c6d5a0__.KeyCodes.ESC) this.finishTextEdit(false);
            else if (params.event.keyCode === __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_80c6d5a0__.KeyCodes.ENTER) {
                params.event.preventDefault();
                this.finishTextEdit(true);
            }
            return;
        }
        if (params.event.keyCode === __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_80c6d5a0__.KeyCodes.ESC && this.activeGripEdit) {
            this.cancelGripEdit();
            return;
        }
        if (params.event.keyCode === __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_80c6d5a0__.KeyCodes.DELETE) {
            if (this.activeGripEdit) this.cancelGripEdit();
            const selectedEntities = this.entitySelector.getSelected();
            this.entitySelector.clearSelection();
            this.historyManager.addCommandAndExecute(new __WEBPACK_EXTERNAL_MODULE__command_DeleteEntityCommand_js_7b0c9b74__.DeleteEntityCommand(selectedEntities, this.viewManager));
        }
    }
    onViewerUpdate() {
        this.gripOverlay?.updateScale();
        this.updateTextEditPosition();
    }
    onSelectorChanged(entities) {
        if (this.activeGripEdit && !entities.some((entity)=>entity.id === this.activeGripEdit?.entity.id)) {
            this.cancelGripEdit();
            return;
        }
        if (this.activeTextEdit && !entities.some((entity)=>entity.id === this.activeTextEdit?.entity.id)) {
            this.finishTextEdit(true);
            return;
        }
        this.refreshGrips();
    }
    refreshGrips() {
        const selectedEntities = this.entitySelector.getSelected();
        this.grips = selectedEntities.flatMap((entity)=>__WEBPACK_EXTERNAL_MODULE__edit_entityGripHandler_js_aa131fe1__.EntityGripHandler.getGripPoints(entity));
        if (!this.getGripById(this.hoverGripId)) this.hoverGripId = null;
        const activeGripId = this.activeGripEdit?.grip.id ?? null;
        if (this.activeGripEdit && !this.getGripById(activeGripId)) {
            this.activeGripEdit = null;
            this.historyManager.setLock(false);
            this.auxiliaryMouseHelper.clearUI();
        }
        this.gripOverlay?.setGrips(this.grips);
        this.gripOverlay?.setHoverGrip(this.hoverGripId);
        this.gripOverlay?.setActiveGrip(activeGripId);
        this.updateSelectorInteraction();
    }
    updateHoverGrip(screenPos) {
        let closestGrip = null;
        let minDistance = Number.POSITIVE_INFINITY;
        const threshold = __WEBPACK_EXTERNAL_MODULE__common_setting_js_26a0d8d5__.Setting.gripConfig.pixelRadius + __WEBPACK_EXTERNAL_MODULE__common_setting_js_26a0d8d5__.Setting.gripConfig.hitPadding;
        for (const grip of this.grips){
            const gripScreenPos = this.controller.getScreenPosition(grip.point);
            const distance = Math.hypot(gripScreenPos.x - screenPos.x, gripScreenPos.y - screenPos.y);
            if (distance <= threshold && distance < minDistance) {
                minDistance = distance;
                closestGrip = grip;
            }
        }
        this.hoverGripId = closestGrip?.id ?? null;
        this.gripOverlay?.setHoverGrip(this.hoverGripId);
        this.updateSelectorInteraction();
    }
    updateSelectorInteraction() {
        const disableSelector = !!this.hoverGripId || !!this.activeGripEdit || !!this.activeTextEdit;
        this.entitySelector.config({
            enableMouseSelect: !disableSelector,
            enableFrameSelect: !disableSelector
        });
    }
    beginGripEdit(grip) {
        const entity = this.viewManager.getEntity(grip.entityId);
        if (!entity) return;
        const originalData = __WEBPACK_EXTERNAL_MODULE__edit_entityGripHandler_js_aa131fe1__.EntityGripHandler.snapshot(entity);
        if (!originalData) return;
        this.activeGripEdit = {
            entity,
            grip,
            originalData,
            targetPoint: (0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.cloneDeep)(grip.point)
        };
        this.historyManager.setLock(true);
        this.hoverGripId = grip.id;
        this.gripOverlay?.setHoverGrip(grip.id);
        this.gripOverlay?.setActiveGrip(grip.id);
        this.updateSelectorInteraction();
    }
    previewGripEdit(targetPoint) {
        if (!this.activeGripEdit) return;
        this.activeGripEdit.targetPoint = (0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.cloneDeep)(targetPoint);
        this.renderGripPreview();
        this.renderInvalidator.invalidate('cad.gripPreview.updated');
    }
    commitGripEdit() {
        if (!this.activeGripEdit) return;
        const { entity, grip, originalData, targetPoint } = this.activeGripEdit;
        const isNoop = Math.hypot(targetPoint.x - grip.point.x, targetPoint.y - grip.point.y) < 1e-6;
        if (isNoop) {
            this.finishGripEdit(true);
            return;
        }
        this.clearGripPreview();
        const command = new __WEBPACK_EXTERNAL_MODULE__edit_updateEntityByGripCommand_js_d8cea1e4__.UpdateEntityByGripCommand(entity, grip, (0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.cloneDeep)(targetPoint), (0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.cloneDeep)(originalData), this.viewManager);
        this.historyManager.addCommandAndExecute(command);
        this.finishGripEdit(false);
    }
    cancelGripEdit() {
        this.finishGripEdit(true);
    }
    finishGripEdit(restoreEntity) {
        this.clearGripPreview();
        if (!this.activeGripEdit) {
            if (!this.activeTextEdit) this.historyManager.setLock(false);
            this.auxiliaryMouseHelper.clearUI();
            this.updateSelectorInteraction();
            return;
        }
        if (restoreEntity) {
            Object.assign(this.activeGripEdit.entity, (0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.cloneDeep)(this.activeGripEdit.originalData));
            this.viewManager.updateEntity(this.activeGripEdit.entity, {
                updateGeometry: true
            });
        }
        this.activeGripEdit = null;
        this.auxiliaryMouseHelper.clearUI();
        if (!this.activeTextEdit) this.historyManager.setLock(false);
        this.refreshGrips();
    }
    renderGripPreview() {
        if (!this.activeGripEdit || !this.gripPreviewObjectManager) return;
        this.clearGripPreview();
        const { entity, grip, originalData, targetPoint } = this.activeGripEdit;
        const previewEntity = (0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.cloneDeep)(entity);
        Object.assign(previewEntity, (0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.cloneDeep)(originalData));
        __WEBPACK_EXTERNAL_MODULE__edit_entityGripHandler_js_aa131fe1__.EntityGripHandler.applyGrip(previewEntity, grip, targetPoint);
        this.gripPreviewObjectManager.addEntity(previewEntity);
        this.renderGripPreviewLine(grip.point, targetPoint);
    }
    clearGripPreview() {
        const hadPreview = !!this.gripPreviewLine || (this.gripPreviewObjectManager?.getSceneGroup().children.length ?? 0) > 0;
        this.gripPreviewObjectManager?.deleteAllEntities();
        this.clearGripPreviewLine();
        if (hadPreview) this.renderInvalidator.invalidate('cad.gripPreview.cleared');
    }
    renderGripPreviewLine(startPoint, endPoint) {
        if (!this.gripPreviewLine) {
            const dashSize = this.controller.getPixelSizeInWorld(__WEBPACK_EXTERNAL_MODULE__common_setting_js_26a0d8d5__.Setting.dashSize);
            const materialOption = {
                color: __WEBPACK_EXTERNAL_MODULE__common_setting_js_26a0d8d5__.Setting.leadLineConfig.color,
                opacity: __WEBPACK_EXTERNAL_MODULE__common_setting_js_26a0d8d5__.Setting.leadLineConfig.opacity,
                transparent: __WEBPACK_EXTERNAL_MODULE__common_setting_js_26a0d8d5__.Setting.leadLineConfig.opacity < 1,
                dashSize,
                gapSize: dashSize / 2,
                depthTest: false,
                depthWrite: false
            };
            this.gripPreviewLine = __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_f5144b54__.DrawUtils.drawDashedLine(startPoint, endPoint, materialOption);
            this.viewManager.attachTempObject(this.gripPreviewLine);
            return;
        }
        __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_f5144b54__.DrawUtils.updateLineByPoints(this.gripPreviewLine, [
            startPoint,
            endPoint
        ]);
        this.gripPreviewLine.computeLineDistances();
    }
    clearGripPreviewLine() {
        if (!this.gripPreviewLine) return;
        __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_f5144b54__.DrawUtils.disposeObject(this.gripPreviewLine);
        this.gripPreviewLine = void 0;
    }
    clearGripHover() {
        this.hoverGripId = null;
        this.gripOverlay?.setHoverGrip(null);
    }
    getGripTargetPoint(params) {
        const startPoint = this.activeGripEdit?.grip.point;
        const targetPoint = this.auxiliaryMouseHelper.mouseCapture(params, {
            startPoint
        });
        return {
            x: targetPoint.x,
            y: targetPoint.y
        };
    }
    getGripById(gripId) {
        if (!gripId) return null;
        return this.grips.find((grip)=>grip.id === gripId) || null;
    }
    beginTextEdit(entity) {
        this.finishTextEdit(true);
        const inputElement = this.createTextEditInput(entity);
        this.activeTextEdit = {
            entity,
            originalContents: entity.contents,
            inputElement
        };
        this.historyManager.setLock(true);
        this.updateSelectorInteraction();
    }
    finishTextEdit(commit) {
        if (!this.activeTextEdit) {
            if (!this.activeGripEdit) this.historyManager.setLock(false);
            this.updateSelectorInteraction();
            return;
        }
        const { entity, originalContents, inputElement } = this.activeTextEdit;
        const nextContents = inputElement.value.trim();
        this.activeTextEdit = null;
        inputElement.remove();
        if (commit && nextContents && nextContents !== originalContents) this.historyManager.addCommandAndExecute(new __WEBPACK_EXTERNAL_MODULE__command_UpdateEntityCommand_js_3e8ce3bb__.UpdateEntityCommand([
            entity
        ], {
            contents: nextContents
        }, {
            updateGeometry: true,
            updateMaterial: false
        }, this.viewManager));
        if (!this.activeGripEdit) this.historyManager.setLock(false);
        this.refreshGrips();
    }
    createTextEditInput(entity) {
        const inputElement = document.createElement('textarea');
        Object.assign(inputElement.style, {
            position: 'absolute',
            minWidth: '160px',
            minHeight: '48px',
            padding: '6px 8px',
            outline: 'none',
            resize: 'none',
            border: '1px solid #d0d0d0',
            backgroundColor: '#fff',
            color: '#000',
            transform: 'translate(0, -50%)'
        });
        inputElement.value = entity.contents;
        inputElement.addEventListener('keydown', (event)=>{
            event.stopPropagation();
            if (event.keyCode !== __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_80c6d5a0__.KeyCodes.ENTER || event.shiftKey) {
                if (event.keyCode === __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_80c6d5a0__.KeyCodes.ESC) {
                    event.preventDefault();
                    this.finishTextEdit(false);
                }
            } else {
                event.preventDefault();
                this.finishTextEdit(true);
            }
        });
        inputElement.addEventListener('mousedown', (event)=>{
            event.stopPropagation();
        });
        inputElement.addEventListener('dblclick', (event)=>{
            event.stopPropagation();
        });
        inputElement.addEventListener('contextmenu', (event)=>{
            event.preventDefault();
        });
        inputElement.addEventListener('blur', ()=>{
            this.finishTextEdit(true);
        });
        this.controller.domElement?.parentElement?.appendChild(inputElement);
        this.updateTextEditPosition(entity, inputElement);
        inputElement.focus();
        inputElement.select();
        return inputElement;
    }
    updateTextEditPosition(entity = this.activeTextEdit?.entity, inputElement = this.activeTextEdit?.inputElement) {
        if (!entity || !inputElement) return;
        const screenPos = this.controller.getScreenPosition(entity.textPosition);
        Object.assign(inputElement.style, {
            left: `${screenPos.x}px`,
            top: `${screenPos.y}px`
        });
    }
    constructor(...args){
        super(...args), this.renderInvalidator = __WEBPACK_EXTERNAL_MODULE__renderInvalidation_js_1eceb3b2__.NOOP_CAD_RENDER_INVALIDATOR, this.grips = [], this.hoverGripId = null, this.activeGripEdit = null, this.activeTextEdit = null, this.handleUndoRedo = ()=>{
            if (this.activeGripEdit) this.cancelGripEdit();
            if (this.activeTextEdit) this.finishTextEdit(false);
            this.refreshGrips();
        };
    }
}
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_cfed9b58__.TYPES.EntitySelector),
    _ts_metadata("design:type", "undefined" == typeof EntitySelector ? Object : EntitySelector)
], CADDefaultTool.prototype, "entitySelector", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_cfed9b58__.TYPES.CADViewManager),
    _ts_metadata("design:type", "undefined" == typeof CADViewManager ? Object : CADViewManager)
], CADDefaultTool.prototype, "viewManager", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_cfed9b58__.TYPES.HistoryManager),
    _ts_metadata("design:type", "undefined" == typeof HistoryManager ? Object : HistoryManager)
], CADDefaultTool.prototype, "historyManager", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_cfed9b58__.TYPES.AuxiliaryMouseHelper),
    _ts_metadata("design:type", "undefined" == typeof AuxiliaryMouseHelper ? Object : AuxiliaryMouseHelper)
], CADDefaultTool.prototype, "auxiliaryMouseHelper", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_cfed9b58__.TYPES.RenderInvalidator),
    _ts_metadata("design:type", "undefined" == typeof CadRenderInvalidator ? Object : CadRenderInvalidator)
], CADDefaultTool.prototype, "renderInvalidator", void 0);
CADDefaultTool = _ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.injectable)()
], CADDefaultTool);
export { CADDefaultTool };
