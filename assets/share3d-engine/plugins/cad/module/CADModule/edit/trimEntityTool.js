import * as __WEBPACK_EXTERNAL_MODULE_inversify__ from "inversify";
import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_Addons_js_c109df0d__ from "three/examples/jsm/Addons.js";
import * as __WEBPACK_EXTERNAL_MODULE_xstate__ from "xstate";
import * as __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__ from "../../container/types.js";
import * as __WEBPACK_EXTERNAL_MODULE__core_tool_StateMachineTool_js_4ff72ac2__ from "../../core/tool/StateMachineTool.js";
import * as __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__ from "../../i18n/tipKeys.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1bc05401__ from "../../../../../shared/constants/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__ from "../auxiliaryTool/MouseTipHelper.js";
import * as __WEBPACK_EXTERNAL_MODULE__command_TrimEntityCommand_js_0c6cbdc3__ from "../command/TrimEntityCommand.js";
import * as __WEBPACK_EXTERNAL_MODULE__object_entityObject_entityObjectUtils_js_3a4a2246__ from "../object/entityObject/entityObjectUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__EntityEditHandler_js_9944ecc6__ from "./EntityEditHandler.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_trimUtils_js_6b100bd6__ from "./utils/trimUtils.js";
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
}
const TRIM_STATUS_MOUSE_TIP_ID = 'TrimStatusMouseTipId';
const trimEntityMachine = (0, __WEBPACK_EXTERNAL_MODULE_xstate__.setup)({
    actions: {
        entryTrimming: ()=>{}
    }
}).createMachine({
    id: 'trimEntity',
    initial: 'idle',
    states: {
        idle: {
            on: {
                NEXT: 'trimming'
            }
        },
        trimming: {
            entry: {
                type: 'entryTrimming'
            }
        }
    }
});
class TrimEntityTool extends __WEBPACK_EXTERNAL_MODULE__core_tool_StateMachineTool_js_4ff72ac2__.StateMachineTool {
    onInitialize() {
        this.viewManager.attachTempObject(this.group);
        this.entitySelector.clearSelection();
        this.currentCommand = new __WEBPACK_EXTERNAL_MODULE__command_TrimEntityCommand_js_0c6cbdc3__.TrimEntityCommand(this.viewManager);
        this.historyManager.startCommand(this.currentCommand);
        this.send({
            type: 'NEXT'
        });
    }
    onTerminate() {
        this.historyManager.commitCommand();
        this.entityDetector.resetConfig();
        this.clearPreviewObjects();
        this.restoreHoveredEntity();
        this.group.parent?.remove(this.group);
        this.mouseTipHelper.removeTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Edit);
        this.hideTrimStatusTip();
        this.eject(this.entityDetector);
        this.hoveredEntity = void 0;
        this.hoveredEntityObject = void 0;
        this.hoveredEntityOriginalMaterial = void 0;
        this.hoveredEntityPreviewMaskMaterial = void 0;
        this.currentCommand = void 0;
        this.trimResultCache = void 0;
    }
    onMouseDown(params) {
        if (0 === params.event.button && this.checkState('trimming')) this.executeOperate();
    }
    onMouseMove(params) {
        this.cursorPos = {
            x: params.worldPos.x,
            y: params.worldPos.y
        };
        if (this.checkState('trimming')) this.updatePreview();
    }
    onKeyDown(params) {
        if (params.event.keyCode === __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1bc05401__.KeyCodes.ESC) this.exit();
    }
    entryTrimming() {
        this.entityDetector.config({
            enableDetect: true,
            enableHighlight: false
        });
        this.inject(this.entityDetector);
        this.mouseTipHelper.addTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Edit, __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.edit.trim.target);
    }
    getBoundaries(exclude) {
        return this.viewManager.getVisibleEntities().filter((e)=>e !== exclude);
    }
    updatePreview() {
        this.trimResultCache = void 0;
        const entity = this.entityDetector.getOneEntity();
        if (entity !== this.hoveredEntity) {
            this.restoreHoveredEntity();
            this.clearPreviewObjects();
        }
        if (!entity) {
            this.hideTrimStatusTip();
            return;
        }
        const boundaries = this.getBoundaries(entity);
        const trimResult = __WEBPACK_EXTERNAL_MODULE__EntityEditHandler_js_9944ecc6__.EntityEditHandler.trim(entity, {
            cursorPoint: this.cursorPos,
            boundaries
        });
        this.trimResultCache = trimResult;
        if (0 === trimResult.deleteEntities.length) {
            this.restoreHoveredEntity();
            this.clearPreviewObjects();
            this.showDisabledTip();
            return;
        }
        this.showTrimTip();
        if (entity !== this.hoveredEntity) {
            this.hoveredEntity = entity;
            this.hoveredEntityObject = this.viewManager.getEntityObject(entity);
            this.hoveredEntityOriginalMaterial = this.hoveredEntityObject?.material;
            if (this.hoveredEntityObject) {
                this.hoveredEntityPreviewMaskMaterial = this.createPreviewMaskMaterial(this.hoveredEntityOriginalMaterial);
                if (this.hoveredEntityPreviewMaskMaterial) this.hoveredEntityObject.material = this.hoveredEntityPreviewMaskMaterial;
            }
        }
        const trimPreviewEntities = __WEBPACK_EXTERNAL_MODULE__utils_trimUtils_js_6b100bd6__.TrimUtils.getTrimmedPreviewEntities(entity, this.cursorPos, boundaries);
        const lockedMaterial = this.viewManager.objectManager.getMaterialManager().getCachedLockedMaterial(entity);
        this.updatePreviewObjects(this.keptPreviewObjects, trimResult.createdEntities, this.hoveredEntityOriginalMaterial);
        this.updatePreviewObjects(this.trimmedPreviewObjects, trimPreviewEntities, lockedMaterial);
    }
    updatePreviewObjects(objects, entities, material) {
        if (!material) {
            objects.forEach((o)=>o.visible = false);
            return;
        }
        entities.forEach((previewEntity, i)=>{
            let obj = objects[i];
            const geometry = __WEBPACK_EXTERNAL_MODULE__object_entityObject_entityObjectUtils_js_3a4a2246__.EntityObjectUtils.createEntityLineGeometry(previewEntity);
            if (!geometry) {
                if (obj) obj.visible = false;
                return;
            }
            if (obj) {
                obj.geometry.dispose();
                obj.geometry = geometry;
                obj.material = material;
                obj.computeLineDistances();
                obj.visible = true;
            } else {
                obj = new __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_Addons_js_c109df0d__.Line2(geometry, material);
                obj.computeLineDistances();
                this.group.add(obj);
                objects[i] = obj;
            }
        });
        objects.slice(entities.length).forEach((o)=>o.visible = false);
    }
    createPreviewMaskMaterial(material) {
        if (!material || 'function' != typeof material.clone) return material;
        const maskMaterial = material.clone();
        maskMaterial.transparent = true;
        maskMaterial.opacity = 0;
        maskMaterial.depthWrite = false;
        return maskMaterial;
    }
    restoreHoveredEntity() {
        if (this.hoveredEntityObject && this.hoveredEntityOriginalMaterial) this.hoveredEntityObject.material = this.hoveredEntityOriginalMaterial;
        if (this.hoveredEntityPreviewMaskMaterial && this.hoveredEntityPreviewMaskMaterial !== this.hoveredEntityOriginalMaterial) this.hoveredEntityPreviewMaskMaterial.dispose();
        this.hoveredEntity = void 0;
        this.hoveredEntityObject = void 0;
        this.hoveredEntityOriginalMaterial = void 0;
        this.hoveredEntityPreviewMaskMaterial = void 0;
    }
    clearPreviewObjects() {
        [
            ...this.keptPreviewObjects,
            ...this.trimmedPreviewObjects
        ].forEach((obj)=>{
            obj.geometry.dispose();
            this.group.remove(obj);
        });
        this.keptPreviewObjects = [];
        this.trimmedPreviewObjects = [];
    }
    showTrimTip() {
        this.mouseTipHelper.addIconTip(TRIM_STATUS_MOUSE_TIP_ID, 'x');
    }
    showDisabledTip() {
        this.mouseTipHelper.addIconTip(TRIM_STATUS_MOUSE_TIP_ID, 'disabled');
    }
    hideTrimStatusTip() {
        this.mouseTipHelper.removeTip(TRIM_STATUS_MOUSE_TIP_ID);
    }
    executeOperate() {
        const trimResult = this.trimResultCache;
        if (!trimResult || 0 === trimResult.deleteEntities.length) return;
        this.restoreHoveredEntity();
        this.clearPreviewObjects();
        this.hideTrimStatusTip();
        this.currentCommand?.addEntity(trimResult.deleteEntities, trimResult.createdEntities);
        this.trimResultCache = void 0;
    }
    constructor(...args){
        super(...args), this.name = __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.TrimEntityTool, this.machine = trimEntityMachine.provide({
            actions: {
                entryTrimming: ()=>this.entryTrimming()
            }
        }), this.cursorPos = {
            x: 0,
            y: 0
        }, this.group = new __WEBPACK_EXTERNAL_MODULE_three__.Group(), this.keptPreviewObjects = [], this.trimmedPreviewObjects = [];
    }
}
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.CADViewManager),
    _ts_metadata("design:type", "undefined" == typeof CADViewManager ? Object : CADViewManager)
], TrimEntityTool.prototype, "viewManager", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.EntitySelector),
    _ts_metadata("design:type", "undefined" == typeof EntitySelector ? Object : EntitySelector)
], TrimEntityTool.prototype, "entitySelector", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.EntityDetector),
    _ts_metadata("design:type", "undefined" == typeof EntityDetector ? Object : EntityDetector)
], TrimEntityTool.prototype, "entityDetector", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.MouseTipHelper),
    _ts_metadata("design:type", "undefined" == typeof MouseTipHelper ? Object : MouseTipHelper)
], TrimEntityTool.prototype, "mouseTipHelper", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.HistoryManager),
    _ts_metadata("design:type", "undefined" == typeof HistoryManager ? Object : HistoryManager)
], TrimEntityTool.prototype, "historyManager", void 0);
TrimEntityTool = _ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.injectable)()
], TrimEntityTool);
export { TrimEntityTool };
