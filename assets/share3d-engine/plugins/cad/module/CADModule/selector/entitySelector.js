import * as __WEBPACK_EXTERNAL_MODULE_inversify__ from "inversify";
import * as __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__ from "../../container/types.js";
import * as __WEBPACK_EXTERNAL_MODULE__core_selector_Selector_js_7c4871fe__ from "../../core/selector/Selector.js";
import * as __WEBPACK_EXTERNAL_MODULE__entityFrameSelect_js_6a0d31ed__ from "./entityFrameSelect.js";
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
}
class EntitySelector extends __WEBPACK_EXTERNAL_MODULE__core_selector_Selector_js_7c4871fe__.Selector {
    onItemSelected(entity) {
        this.highlightEntity(entity, true);
    }
    onItemDeselected(entity) {
        this.highlightEntity(entity, false);
    }
    onSelectionCleared(cleared) {
        this.viewManager.cancelSelectEntity(cleared);
    }
    getFrameSelect() {
        return new __WEBPACK_EXTERNAL_MODULE__entityFrameSelect_js_6a0d31ed__.EntityFrameSelect(this.viewManager, this.detector, this);
    }
    highlightEntity(entity, highlight) {
        this.viewManager[highlight ? 'selectEntity' : 'cancelSelectEntity'](entity);
    }
}
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.EntityDetector),
    _ts_metadata("design:type", "undefined" == typeof EntityDetector ? Object : EntityDetector)
], EntitySelector.prototype, "detector", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.CADViewManager),
    _ts_metadata("design:type", "undefined" == typeof CADViewManager ? Object : CADViewManager)
], EntitySelector.prototype, "viewManager", void 0);
EntitySelector = _ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.injectable)()
], EntitySelector);
export { EntitySelector };
