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
import * as __WEBPACK_EXTERNAL_MODULE__command_ExtendEntityCommand_js_10d0bc48__ from "../command/ExtendEntityCommand.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_extendUtils_js_e9bd69e4__ from "./utils/extendUtils.js";
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
}
const EXTEND_DISABLED_MOUSE_TIP_ID = 'ExtendDisabledMouseTipId';
const extendEntityMachine = (0, __WEBPACK_EXTERNAL_MODULE_xstate__.setup)({
    actions: {
        entrySelectEntity: ()=>{}
    }
}).createMachine({
    id: 'extendEntity',
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
            }
        }
    }
});
class ExtendEntityTool extends __WEBPACK_EXTERNAL_MODULE__core_tool_StateMachineTool_js_4ff72ac2__.StateMachineTool {
    onInitialize() {
        this.viewManager.attachTempObject(this.group);
        this.entitySelector.clearSelection();
        this.currentCommand = new __WEBPACK_EXTERNAL_MODULE__command_ExtendEntityCommand_js_10d0bc48__.ExtendEntityCommand(this.viewManager);
        this.historyManager.startCommand(this.currentCommand);
        this.send({
            type: 'NEXT'
        });
    }
    onTerminate() {
        this.historyManager.commitCommand();
        this.clearPreview();
        this.previewMaterial?.dispose();
        this.previewMaterial = void 0;
        this.group.parent?.remove(this.group);
        this.entitySelector.clearSelection();
        this.mouseTipHelper.removeTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Edit);
        this.hideDisabledTip();
        this.eject(this.entityDetector);
        this.hoveredEntity = void 0;
        this.hoveredEndType = void 0;
        this.hoveredIntersectionPt = void 0;
        this.currentMousePos = void 0;
        this.currentCommand = void 0;
    }
    onMouseDown(params) {
        if (0 !== params.event.button) return;
        if (!this.checkState('selectEntity')) return;
        if (this.hoveredEntity && this.hoveredEndType && this.hoveredIntersectionPt) this.executeExtend();
    }
    onMouseMove(params) {
        if (!this.checkState('selectEntity')) return;
        this.hoveredEntity = this.entityDetector.getOneEntity() || void 0;
        this.currentMousePos = {
            ...params.worldPos
        };
        this.updateHoverPreview();
    }
    onKeyDown(params) {
        if (params.event.keyCode === __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1bc05401__.KeyCodes.ESC) this.exit();
    }
    entrySelectEntity() {
        this.inject(this.entityDetector);
        this.mouseTipHelper.addTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Edit, __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.edit.extend.target);
    }
    getBoundaries(exclude) {
        return this.viewManager.getVisibleEntities().filter((e)=>e !== exclude && __WEBPACK_EXTERNAL_MODULE__utils_extendUtils_js_e9bd69e4__.ExtendUtils.BoundaryEntityTypes.has(e.type));
    }
    updateHoverPreview() {
        if (!this.hoveredEntity || !this.currentMousePos) {
            this.clearPreview();
            this.clearHoverCache();
            this.hideDisabledTip();
            return;
        }
        if (!__WEBPACK_EXTERNAL_MODULE__utils_extendUtils_js_e9bd69e4__.ExtendUtils.isEntityExtendable(this.hoveredEntity)) {
            this.clearPreview();
            this.clearHoverCache();
            this.showDisabledTip();
            return;
        }
        const endType = __WEBPACK_EXTERNAL_MODULE__utils_extendUtils_js_e9bd69e4__.ExtendUtils.getNearestEnd(this.hoveredEntity, this.currentMousePos);
        if (!endType) {
            this.clearPreview();
            this.clearHoverCache();
            this.showDisabledTip();
            return;
        }
        this.hoveredEndType = endType;
        const boundaries = this.getBoundaries(this.hoveredEntity);
        const intersectionPt = __WEBPACK_EXTERNAL_MODULE__utils_extendUtils_js_e9bd69e4__.ExtendUtils.findExtendPoint(this.hoveredEntity, endType, boundaries);
        this.hoveredIntersectionPt = intersectionPt ?? void 0;
        if (!intersectionPt) {
            this.clearPreview();
            this.showDisabledTip();
            return;
        }
        const previewPts = __WEBPACK_EXTERNAL_MODULE__utils_extendUtils_js_e9bd69e4__.ExtendUtils.getExtendPreviewPoints(this.hoveredEntity, endType, intersectionPt);
        if (previewPts.length < 2) {
            this.clearPreview();
            this.hoveredIntersectionPt = void 0;
            this.showDisabledTip();
            return;
        }
        this.hideDisabledTip();
        this.updatePreviewObject(previewPts);
    }
    updatePreviewObject(points) {
        const dashSize = this.controller.getPixelSizeInWorld(__WEBPACK_EXTERNAL_MODULE__common_setting_js_85f066cc__.Setting.dashSize);
        if (!this.previewMaterial) this.previewMaterial = new __WEBPACK_EXTERNAL_MODULE_three__.LineDashedMaterial({
            color: __WEBPACK_EXTERNAL_MODULE__common_setting_js_85f066cc__.Setting.leadLineConfig.color,
            opacity: __WEBPACK_EXTERNAL_MODULE__common_setting_js_85f066cc__.Setting.leadLineConfig.opacity,
            transparent: __WEBPACK_EXTERNAL_MODULE__common_setting_js_85f066cc__.Setting.leadLineConfig.opacity < 1,
            dashSize,
            gapSize: dashSize / 2,
            depthTest: false,
            depthWrite: false
        });
        const geometry = __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__.DrawUtils.getBufferGeometryByPoints(points);
        if (this.previewObject) {
            this.previewObject.geometry.dispose();
            this.previewObject.geometry = geometry;
            this.previewObject.computeLineDistances();
            this.previewObject.visible = true;
        } else {
            this.previewObject = new __WEBPACK_EXTERNAL_MODULE_three__.Line(geometry, this.previewMaterial);
            this.previewObject.computeLineDistances();
            this.group.add(this.previewObject);
        }
    }
    clearPreview() {
        if (this.previewObject) this.previewObject.visible = false;
    }
    clearHoverCache() {
        this.hoveredEndType = void 0;
        this.hoveredIntersectionPt = void 0;
    }
    showDisabledTip() {
        this.mouseTipHelper.addIconTip(EXTEND_DISABLED_MOUSE_TIP_ID, 'disabled');
    }
    hideDisabledTip() {
        this.mouseTipHelper.removeTip(EXTEND_DISABLED_MOUSE_TIP_ID);
    }
    executeExtend() {
        if (!this.hoveredEntity || !this.hoveredEndType || !this.hoveredIntersectionPt) return;
        if (this.currentCommand) this.currentCommand.addEntity(this.hoveredEntity, {
            endType: this.hoveredEndType,
            newPoint: this.hoveredIntersectionPt
        });
        this.clearPreview();
        this.hoveredEntity = void 0;
        this.hoveredEndType = void 0;
        this.hoveredIntersectionPt = void 0;
        this.hideDisabledTip();
        this.mouseTipHelper.updateTip(__WEBPACK_EXTERNAL_MODULE__auxiliaryTool_MouseTipHelper_js_0b8aa1a1__.MouseTipId.Edit, __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.edit.extend.target);
    }
    constructor(...args){
        super(...args), this.name = __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.ExtendEntityTool, this.machine = extendEntityMachine.provide({
            actions: {
                entrySelectEntity: ()=>this.entrySelectEntity()
            }
        }), this.group = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
    }
}
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.CADViewManager),
    _ts_metadata("design:type", "undefined" == typeof CADViewManager ? Object : CADViewManager)
], ExtendEntityTool.prototype, "viewManager", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.EntitySelector),
    _ts_metadata("design:type", "undefined" == typeof EntitySelector ? Object : EntitySelector)
], ExtendEntityTool.prototype, "entitySelector", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.EntityDetector),
    _ts_metadata("design:type", "undefined" == typeof EntityDetector ? Object : EntityDetector)
], ExtendEntityTool.prototype, "entityDetector", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.MouseTipHelper),
    _ts_metadata("design:type", "undefined" == typeof MouseTipHelper ? Object : MouseTipHelper)
], ExtendEntityTool.prototype, "mouseTipHelper", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.HistoryManager),
    _ts_metadata("design:type", "undefined" == typeof HistoryManager ? Object : HistoryManager)
], ExtendEntityTool.prototype, "historyManager", void 0);
ExtendEntityTool = _ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.injectable)()
], ExtendEntityTool);
export { ExtendEntityTool };
