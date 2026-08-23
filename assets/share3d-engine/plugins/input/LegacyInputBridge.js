import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
const DEFAULT_BRIDGE_PRIORITY = 50;
class LegacyInputBridge {
    constructor(priority){
        this.name = 'LegacyInputBridge';
        this.listeners = [];
        this.drag = null;
        this.dragStarted = false;
        this.priority = priority ?? DEFAULT_BRIDGE_PRIORITY;
    }
    addLegacyListener(listener) {
        if (-1 === this.listeners.indexOf(listener)) this.listeners.push(listener);
    }
    removeLegacyListener(listener) {
        const idx = this.listeners.indexOf(listener);
        if (-1 !== idx) this.listeners.splice(idx, 1);
    }
    onPointerDown(event) {
        const mouse = this.toLegacyPointerPosition(event);
        this.drag = {
            start: mouse.clone(),
            end: mouse.clone(),
            lastDrag: new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(0, 0),
            mouse: event.button
        };
        this.dragStarted = false;
        return this.dispatchToListeners({
            type: 'mousedown',
            mouse,
            button: event.button
        });
    }
    onPointerMove(event) {
        if (!this.drag) return false;
        const mouse = this.toLegacyPointerPosition(event);
        const x = mouse.x;
        const y = mouse.y;
        this.drag.lastDrag.x = x - this.drag.end.x;
        this.drag.lastDrag.y = y - this.drag.end.y;
        this.drag.end.set(x, y);
        if (!this.dragStarted) this.dragStarted = true;
        return this.dispatchToListeners({
            type: 'drag',
            drag: this.cloneDrag()
        });
    }
    onPointerUp(event) {
        const hadDrag = null !== this.drag;
        const mouse = this.toLegacyPointerPosition(event);
        let consumed = false;
        if (hadDrag) {
            this.drag.end.copy(mouse);
            consumed = this.dispatchToListeners({
                type: 'drop',
                drag: this.cloneDrag()
            });
        }
        const mouseupConsumed = this.dispatchToListeners({
            type: 'mouseup',
            mouse,
            button: event.button
        });
        this.drag = null;
        this.dragStarted = false;
        return consumed || mouseupConsumed;
    }
    onWheel(event) {
        const delta = Math.sign(event.delta);
        return this.dispatchToListeners({
            type: 'mousewheel',
            delta
        });
    }
    onDoubleClick(event) {
        return this.dispatchToListeners({
            type: 'dblclick',
            mouse: this.toLegacyPointerPosition(event)
        });
    }
    onKeyDown(event) {
        return this.dispatchToListeners({
            type: 'keydown',
            keyCode: event.code,
            key: event.key,
            event: event.domEvent
        });
    }
    onKeyUp(event) {
        return this.dispatchToListeners({
            type: 'keyup',
            keyCode: event.code,
            key: event.key,
            event: event.domEvent
        });
    }
    dispose() {
        this.listeners.length = 0;
        this.drag = null;
        this.dragStarted = false;
    }
    getSortedListeners() {
        return this.listeners.slice().sort((a, b)=>{
            const ia = a.importance ?? 0;
            const ib = b.importance ?? 0;
            return ib - ia;
        });
    }
    dispatchToListeners(event) {
        let consumed = false;
        const legacyEvent = {
            ...event,
            consume: ()=>{
                consumed = true;
            }
        };
        for (const listener of this.getSortedListeners()){
            const result = listener.dispatchEvent(legacyEvent);
            if (consumed || true === result) return true;
        }
        return false;
    }
    cloneDrag() {
        if (!this.drag) return null;
        return {
            start: this.drag.start.clone(),
            end: this.drag.end.clone(),
            lastDrag: this.drag.lastDrag.clone(),
            mouse: this.drag.mouse
        };
    }
    toLegacyPointerPosition(event) {
        if (event.viewport) return this.toViewportLocalPosition(event.screen, event.viewport);
        const currentTarget = event.domEvent.currentTarget;
        if (currentTarget instanceof HTMLElement) {
            const rect = currentTarget.getBoundingClientRect();
            return this.toViewportLocalPosition(event.screen, {
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height
            });
        }
        return event.screen.clone();
    }
    toViewportLocalPosition(screen, viewport) {
        return new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(screen.x - viewport.x, screen.y - viewport.y);
    }
}
export { LegacyInputBridge };
