import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_utils_index_js_83ff7f8f__ from "../../shared/utils/index.js";
function getViewportRect(container) {
    const rect = container.getBoundingClientRect();
    return {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
    };
}
class InputRouter {
    constructor(container, renderInvalidation){
        this.container = container;
        this.renderInvalidation = renderInvalidation;
        this.consumers = [];
        this._isPointerDown = false;
        this._currentPointerNDC = new __WEBPACK_EXTERNAL_MODULE_three__.Vector2();
        this._enabled = true;
        this._disposed = false;
        this.compatibilityViewportProvider = null;
        if (!container.hasAttribute('tabindex')) container.setAttribute('tabindex', '0');
        this.boundHandlers = {
            pointerdown: this.handlePointerDown.bind(this),
            pointermove: this.handlePointerMove.bind(this),
            pointerup: this.handlePointerUp.bind(this),
            pointercancel: this.handlePointerCancel.bind(this),
            wheel: this.handleWheel.bind(this),
            keydown: this.handleKeyDown.bind(this),
            keyup: this.handleKeyUp.bind(this),
            winKeydown: this.handleWinKeyDown.bind(this),
            winKeyup: this.handleWinKeyUp.bind(this),
            dblclick: this.handleDblClick.bind(this)
        };
        container.addEventListener('pointerdown', this.boundHandlers.pointerdown, {
            passive: false
        });
        container.addEventListener('pointermove', this.boundHandlers.pointermove, {
            passive: false
        });
        container.addEventListener('pointerup', this.boundHandlers.pointerup, {
            passive: false
        });
        container.addEventListener('pointercancel', this.boundHandlers.pointercancel, {
            passive: false
        });
        container.addEventListener('wheel', this.boundHandlers.wheel, {
            passive: false
        });
        container.addEventListener('keydown', this.boundHandlers.keydown, {
            passive: false
        });
        container.addEventListener('keyup', this.boundHandlers.keyup, {
            passive: false
        });
        container.addEventListener('dblclick', this.boundHandlers.dblclick, {
            passive: false
        });
        window.addEventListener('keydown', this.boundHandlers.winKeydown, true);
        window.addEventListener('keyup', this.boundHandlers.winKeyup, true);
    }
    addConsumer(consumer) {
        this.consumers.push(consumer);
        this.sortConsumers();
    }
    removeConsumer(consumer) {
        const idx = this.consumers.indexOf(consumer);
        if (-1 !== idx) this.consumers.splice(idx, 1);
    }
    screenToNDC(screenPos) {
        const viewport = this.resolveCompatibilityViewport(screenPos);
        return (0, __WEBPACK_EXTERNAL_MODULE__shared_utils_index_js_83ff7f8f__.screenToNDC)(screenPos, viewport);
    }
    setCompatibilityViewportProvider(provider) {
        this.compatibilityViewportProvider = provider;
    }
    get isPointerDown() {
        return this._isPointerDown;
    }
    get currentPointerNDC() {
        return this._currentPointerNDC.clone();
    }
    set enabled(value) {
        this._enabled = value;
        if (!value) this._isPointerDown = false;
    }
    dispose() {
        if (this._disposed) return;
        this._disposed = true;
        this.container.removeEventListener('pointerdown', this.boundHandlers.pointerdown);
        this.container.removeEventListener('pointermove', this.boundHandlers.pointermove);
        this.container.removeEventListener('pointerup', this.boundHandlers.pointerup);
        this.container.removeEventListener('pointercancel', this.boundHandlers.pointercancel);
        this.container.removeEventListener('wheel', this.boundHandlers.wheel);
        this.container.removeEventListener('keydown', this.boundHandlers.keydown);
        this.container.removeEventListener('keyup', this.boundHandlers.keyup);
        this.container.removeEventListener('dblclick', this.boundHandlers.dblclick);
        window.removeEventListener('keydown', this.boundHandlers.winKeydown, true);
        window.removeEventListener('keyup', this.boundHandlers.winKeyup, true);
        this.consumers.length = 0;
    }
    sortConsumers() {
        this.consumers.sort((a, b)=>b.priority - a.priority);
    }
    resolveCompatibilityViewport(screen) {
        const viewport = this.compatibilityViewportProvider?.(screen);
        if (viewport && viewport.width > 0 && viewport.height > 0) return viewport;
        return getViewportRect(this.container);
    }
    normalizePointerEvent(e) {
        const screen = new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(e.clientX, e.clientY);
        const viewport = this.resolveCompatibilityViewport(screen);
        const ndc = (0, __WEBPACK_EXTERNAL_MODULE__shared_utils_index_js_83ff7f8f__.screenToNDC)(screen, viewport);
        return {
            screen,
            viewport,
            ndc,
            button: e.button,
            shiftKey: e.shiftKey,
            ctrlKey: e.ctrlKey,
            altKey: e.altKey,
            domEvent: e
        };
    }
    normalizeWheelEvent(e) {
        const screen = new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(e.clientX, e.clientY);
        const viewport = this.resolveCompatibilityViewport(screen);
        const ndc = (0, __WEBPACK_EXTERNAL_MODULE__shared_utils_index_js_83ff7f8f__.screenToNDC)(screen, viewport);
        return {
            delta: e.deltaY,
            screen,
            viewport,
            ndc,
            domEvent: e
        };
    }
    normalizeKeyEvent(e) {
        return {
            key: e.key,
            code: e.code,
            shiftKey: e.shiftKey,
            ctrlKey: e.ctrlKey,
            altKey: e.altKey,
            domEvent: e
        };
    }
    dispatchPointer(methodName, event) {
        for (const consumer of this.consumers){
            const handler = consumer[methodName];
            if (handler?.call(consumer, event)) return true;
        }
        return false;
    }
    dispatchWheel(event) {
        for (const consumer of this.consumers)if (consumer.onWheel?.(event)) return true;
        return false;
    }
    dispatchKey(methodName, event) {
        for (const consumer of this.consumers){
            const handler = consumer[methodName];
            if (handler?.call(consumer, event)) return true;
        }
        return false;
    }
    dispatchWinKey(methodName, event) {
        for (const consumer of this.consumers){
            const handler = consumer[methodName];
            if (handler?.call(consumer, event)) return true;
        }
        return false;
    }
    invalidateInput(reason) {
        this.renderInvalidation?.invalidate(reason);
    }
    handlePointerDown(e) {
        if (!this._enabled) return;
        this._isPointerDown = true;
        const event = this.normalizePointerEvent(e);
        this._currentPointerNDC.copy(event.ndc);
        this.invalidateInput('input.pointerdown');
        this.dispatchPointer('onPointerDown', event);
    }
    handlePointerMove(e) {
        if (!this._enabled) return;
        const event = this.normalizePointerEvent(e);
        this._currentPointerNDC.copy(event.ndc);
        if (this._isPointerDown) this.invalidateInput('input.pointermove');
        const consumed = this.dispatchPointer('onPointerMove', event);
        if (!this._isPointerDown && consumed) this.invalidateInput('input.pointermove');
    }
    handlePointerUp(e) {
        if (!this._enabled) return;
        this._isPointerDown = false;
        const event = this.normalizePointerEvent(e);
        this._currentPointerNDC.copy(event.ndc);
        this.invalidateInput('input.pointerup');
        this.dispatchPointer('onPointerUp', event);
    }
    handleWheel(e) {
        if (!this._enabled) return;
        const event = this.normalizeWheelEvent(e);
        this._currentPointerNDC.copy(event.ndc);
        this.invalidateInput('input.wheel');
        this.dispatchWheel(event);
    }
    handleKeyDown(e) {
        if (!this._enabled) return;
        const event = this.normalizeKeyEvent(e);
        if (this.dispatchKey('onKeyDown', event)) this.invalidateInput('input.keydown');
    }
    handleKeyUp(e) {
        if (!this._enabled) return;
        const event = this.normalizeKeyEvent(e);
        if (this.dispatchKey('onKeyUp', event)) this.invalidateInput('input.keyup');
    }
    handleWinKeyDown(e) {
        if (!this._enabled) return;
        const event = this.normalizeKeyEvent(e);
        if (this.dispatchWinKey('onWinKeyDown', event)) this.invalidateInput('input.windowKeydown');
    }
    handleWinKeyUp(e) {
        if (!this._enabled) return;
        const event = this.normalizeKeyEvent(e);
        if (this.dispatchWinKey('onWinKeyUp', event)) this.invalidateInput('input.windowKeyup');
    }
    handlePointerCancel(e) {
        if (!this._enabled) return;
        this._isPointerDown = false;
        const event = this.normalizePointerEvent(e);
        this._currentPointerNDC.copy(event.ndc);
        this.invalidateInput('input.pointercancel');
        this.dispatchPointer('onPointerUp', event);
    }
    handleDblClick(e) {
        if (!this._enabled) return;
        const event = this.normalizePointerEvent(e);
        this._currentPointerNDC.copy(event.ndc);
        if (this.dispatchPointer('onDoubleClick', event)) {
            this.invalidateInput('input.dblclick');
            e.preventDefault();
        }
    }
}
export { InputRouter };
