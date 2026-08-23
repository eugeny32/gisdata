import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
function isPromiseLike(value) {
    return 'object' == typeof value && null !== value && 'then' in value && 'function' == typeof value.then;
}
class PointerLockServiceImpl {
    constructor(target, events){
        this.target = target;
        this.events = events;
        this.viewRegistry = null;
        this.lockedViewIdValue = null;
        this.pendingViewIdValue = null;
        this.delta = new __WEBPACK_EXTERNAL_MODULE_three__.Vector2();
        this.disposed = false;
        this.handleMouseMove = (event)=>{
            if (!this.isLocked) return;
            this.delta.x += event.movementX ?? 0;
            this.delta.y += event.movementY ?? 0;
        };
        this.handleBlur = ()=>{
            if (this.isLocked || this.pendingViewIdValue) {
                this.exit();
                return;
            }
            this.delta.set(0, 0);
        };
        this.handlePointerLockChange = ()=>{
            if (document.pointerLockElement === this.target) {
                this.lockedViewIdValue = this.resolveLockedViewId();
                this.pendingViewIdValue = null;
                this.delta.set(0, 0);
                return;
            }
            this.clearSession();
        };
        this.handleViewRemoved = ({ viewId })=>{
            if (viewId !== this.lockedViewIdValue && viewId !== this.pendingViewIdValue) return;
            this.exit();
        };
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('blur', this.handleBlur);
        document.addEventListener('pointerlockchange', this.handlePointerLockChange);
        this.events.on('view.removed', this.handleViewRemoved);
    }
    get isLocked() {
        return document.pointerLockElement === this.target;
    }
    get lockedViewId() {
        return this.lockedViewIdValue;
    }
    get pendingViewId() {
        return this.pendingViewIdValue;
    }
    bindViewRegistry(viewRegistry) {
        this.viewRegistry = viewRegistry;
        if (this.lockedViewIdValue && !this.viewRegistry.get(this.lockedViewIdValue)) this.clearSession();
        if (this.pendingViewIdValue && !this.viewRegistry.get(this.pendingViewIdValue)) this.pendingViewIdValue = null;
    }
    request(viewId) {
        if (this.disposed) return false;
        if (this.viewRegistry && !this.viewRegistry.get(viewId)) return false;
        if (this.isLocked) {
            this.lockedViewIdValue = viewId;
            this.pendingViewIdValue = null;
            this.delta.set(0, 0);
            return true;
        }
        const pointerLockTarget = this.target;
        if ('function' != typeof pointerLockTarget.requestPointerLock) return false;
        this.pendingViewIdValue = viewId;
        this.delta.set(0, 0);
        const result = pointerLockTarget.requestPointerLock();
        if (isPromiseLike(result)) result.catch(()=>{
            if (!this.isLocked && this.pendingViewIdValue === viewId) this.pendingViewIdValue = null;
        });
        return true;
    }
    isLockedFor(viewId) {
        return this.isLocked && this.lockedViewIdValue === viewId;
    }
    peekDelta(viewId) {
        if (!this.isLocked) return new __WEBPACK_EXTERNAL_MODULE_three__.Vector2();
        if (viewId && this.lockedViewIdValue !== viewId) return new __WEBPACK_EXTERNAL_MODULE_three__.Vector2();
        return this.delta.clone();
    }
    consumeDelta(viewId) {
        const movement = this.peekDelta(viewId);
        if (!viewId || this.lockedViewIdValue === viewId) this.delta.set(0, 0);
        return movement;
    }
    exit() {
        if (this.disposed) return;
        this.pendingViewIdValue = null;
        this.delta.set(0, 0);
        if (document.pointerLockElement === this.target) {
            document.exitPointerLock?.();
            if (document.pointerLockElement === this.target) this.clearSession();
            return;
        }
        this.clearSession();
    }
    dispose() {
        if (this.disposed) return;
        this.exit();
        this.disposed = true;
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('blur', this.handleBlur);
        document.removeEventListener('pointerlockchange', this.handlePointerLockChange);
        this.events.off('view.removed', this.handleViewRemoved);
        this.viewRegistry = null;
        this.clearSession();
    }
    clearSession() {
        this.lockedViewIdValue = null;
        this.pendingViewIdValue = null;
        this.delta.set(0, 0);
    }
    resolveLockedViewId() {
        if (this.pendingViewIdValue) {
            if (!this.viewRegistry || this.viewRegistry.get(this.pendingViewIdValue)) return this.pendingViewIdValue;
        }
        if (this.lockedViewIdValue) {
            if (!this.viewRegistry || this.viewRegistry.get(this.lockedViewIdValue)) return this.lockedViewIdValue;
        }
        return this.viewRegistry?.getActive()?.id ?? null;
    }
}
export { PointerLockServiceImpl };
