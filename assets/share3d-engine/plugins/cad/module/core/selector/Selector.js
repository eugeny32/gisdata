import * as __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__ from "lodash-es";
import * as __WEBPACK_EXTERNAL_MODULE_mitt__ from "mitt";
import * as __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1bc05401__ from "../../../../../shared/constants/index.js";
function isEditableEventTarget(target) {
    if (!(target instanceof HTMLElement)) return false;
    const tagName = target.tagName;
    return target.isContentEditable || [
        'INPUT',
        'TEXTAREA',
        'SELECT'
    ].includes(tagName);
}
var Selector_rslib_entry_SelectMode = /*#__PURE__*/ function(SelectMode) {
    SelectMode["add"] = "add";
    SelectMode["sub"] = "sub";
    SelectMode["replace"] = "replace";
    return SelectMode;
}({});
class Selector {
    select(items, options) {
        this.handleSelect(items, options);
        this.onSelectionChanged(this.getSelected());
    }
    deselect(items) {
        this.handleSelect(items, {
            mode: "sub"
        });
        this.onSelectionChanged(this.getSelected());
    }
    selectItem(item) {
        if (!item) return;
        this.selectedEntities.add(item);
        this.onItemSelected(item);
    }
    deselectItem(item) {
        if (!item) return;
        this.selectedEntities.delete(item);
        this.onItemDeselected(item);
    }
    clearSelection() {
        const entities = Array.from(this.selectedEntities);
        this.selectedEntities.clear();
        this.onSelectionCleared(entities);
        this.onSelectionChanged([]);
    }
    getSelected() {
        return Array.from(this.selectedEntities);
    }
    getSelectedCount() {
        return this.selectedEntities.size;
    }
    isSelected(entity) {
        return this.selectedEntities.has(entity);
    }
    hasSelection() {
        return this.selectedEntities.size > 0;
    }
    handleSelect(items, options = {}) {
        const mode = this.getSelectMode(options);
        const itemsToSelect = Array.isArray(items) ? items : [
            items
        ];
        switch(mode){
            case "add":
                for (const item of itemsToSelect)if (!!item && !!item.id) this.selectItem(item);
                break;
            case "sub":
                for (const item of itemsToSelect)if (!!item && !!item.id) this.deselectItem(item);
                break;
            default:
                this.clearSelection();
                for (const item of itemsToSelect)if (!!item && !!item.id) this.selectItem(item);
                break;
        }
    }
    getSelectMode(options) {
        if (options.mode) return options.mode;
        if (this.pressedKeyCodeSet.has(__WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1bc05401__.KeyCodes.CTRL)) return "add";
        if (this.pressedKeyCodeSet.has(__WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1bc05401__.KeyCodes.SHIFT)) return "sub";
        return "replace";
    }
    onItemSelected(_item) {}
    onItemDeselected(_item) {}
    onSelectionCleared(_cleared) {}
    onSelectionChanged(items) {
        const tool = this.tool;
        tool?.onSelectorChanged?.(items);
        this.emit('onSelectorChanged', items);
    }
    on(type, handler) {
        this.emitter.on(type, handler);
    }
    emit(type, event) {
        this.emitter.emit(type, event);
    }
    off(type, handler) {
        this.emitter.off(type, handler);
    }
    onMouseDown(params) {
        if (this.frameSelect.isFraming) return;
        if (!this.getEnableMouseSelect()) return;
        if (0 === params.event.button) {
            const detected = this.detector.getOneEntity();
            this.select(detected || [], this.setting);
        }
    }
    onMouseMove(params) {
        if (this.getEnableFrameSelect()) this.frameSelect.onMouseMove(params);
        this.detector.config({
            enableDetect: !this.frameSelect.isFraming
        });
    }
    onKeyDown(params) {
        if (isEditableEventTarget(params.event.target)) return;
        const keyCode = params.event.keyCode;
        if (keyCode === __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1bc05401__.KeyCodes.ESC) {
            this.frameSelect.cancel();
            this.clearSelection();
        }
        this.pressedKeyCodeSet.add(keyCode);
    }
    onKeyUp(params) {
        if (isEditableEventTarget(params.event.target)) return;
        const keyCode = params.event.keyCode;
        this.pressedKeyCodeSet.delete(keyCode);
    }
    injectTool(tool) {
        this.tool = tool;
        tool.inject(this.detector);
        this.detector.config({
            enableHighlight: true
        });
    }
    ejectTool() {
        this.detector.config({
            enableHighlight: false
        });
        this.tool?.eject(this.detector);
        this.tool = void 0;
        this.pressedKeyCodeSet.clear();
        this.frameSelect.cancel();
    }
    get frameSelect() {
        if (!this._frameSelect) this._frameSelect = this.getFrameSelect();
        return this._frameSelect;
    }
    config(option) {
        Object.assign(this.setting, option);
        this.configCallback();
    }
    resetConfig() {
        this.setting = (0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.cloneDeep)(this.defaultSetting);
        this.configCallback();
    }
    setDefaultConfig(option) {
        Object.assign(this.defaultSetting, option);
        this.resetConfig();
    }
    configCallback() {
        if (!this.getEnableFrameSelect()) this.frameSelect.cancel();
    }
    getEnableFrameSelect() {
        return this.setting.enableFrameSelect;
    }
    getEnableMouseSelect() {
        return this.setting.enableMouseSelect;
    }
    constructor(){
        this.selectedEntities = new Set();
        this.emitter = (0, __WEBPACK_EXTERNAL_MODULE_mitt__["default"])();
        this.pressedKeyCodeSet = new Set();
        this.defaultSetting = {
            enableFrameSelect: true,
            enableMouseSelect: true
        };
        this.setting = {
            enableFrameSelect: true,
            enableMouseSelect: true
        };
    }
}
export { Selector_rslib_entry_SelectMode as SelectMode, Selector };
