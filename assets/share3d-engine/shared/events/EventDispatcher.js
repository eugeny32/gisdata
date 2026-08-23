class EventDispatcher {
    constructor(){
        this._listeners = {};
        this._listeners = {};
    }
    addEventListener(type, listener) {
        const listeners = this._listeners;
        if (void 0 === listeners[type]) listeners[type] = [];
        if (-1 === listeners[type].indexOf(listener)) listeners[type].push(listener);
    }
    hasEventListener(type, listener) {
        const listeners = this._listeners;
        return void 0 !== listeners[type] && -1 !== listeners[type].indexOf(listener);
    }
    removeEventListener(type, listener) {
        const listeners = this._listeners;
        const listenerArray = listeners[type];
        if (void 0 !== listenerArray) {
            const index = listenerArray.indexOf(listener);
            if (-1 !== index) listenerArray.splice(index, 1);
        }
    }
    removeEventListeners(type) {
        if (void 0 !== this._listeners[type]) delete this._listeners[type];
    }
    dispatchEvent(event) {
        const listeners = this._listeners;
        const listenerArray = listeners[event.type];
        if (void 0 !== listenerArray) {
            event.target = this;
            for (const listener of listenerArray.slice(0))listener.call(this, event);
        }
    }
}
export { EventDispatcher };
