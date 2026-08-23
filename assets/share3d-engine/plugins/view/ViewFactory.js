import * as __WEBPACK_EXTERNAL_MODULE__shared_utils_index_js_83ff7f8f__ from "../../shared/utils/index.js";
class ViewFactory {
    static #_ = this.DEFAULT_LAYER_MASK = 1;
    static createRecord(options, order) {
        if (!options.rect) throw new Error('View rect 为必填项');
        return {
            id: options.id ?? (0, __WEBPACK_EXTERNAL_MODULE__shared_utils_index_js_83ff7f8f__.generateId)(),
            rect: ViewFactory.cloneRect(options.rect),
            visible: options.visible ?? true,
            zIndex: options.zIndex ?? 0,
            layerMask: options.layerMask ?? ViewFactory.DEFAULT_LAYER_MASK,
            userData: {
                ...options.userData ?? {}
            },
            removable: options.removable ?? true,
            extensions: {},
            order
        };
    }
    static toSnapshot(record, active) {
        return {
            id: record.id,
            rect: ViewFactory.cloneRect(record.rect),
            visible: record.visible,
            zIndex: record.zIndex,
            layerMask: record.layerMask,
            userData: {
                ...record.userData
            },
            removable: record.removable,
            active
        };
    }
    static cloneRect(rect) {
        return {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
        };
    }
}
export { ViewFactory };
