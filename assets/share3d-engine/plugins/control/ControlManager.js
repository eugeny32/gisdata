class ControlManagerImpl {
    constructor(events, domElement, options){
        this.events = events;
        this.domElement = domElement;
        this.controls = new Map();
        this.currentMode = 'none';
        this.disposed = false;
        this.inputActive = true;
        this.viewId = options?.viewId ?? null;
        this.inputActive = options?.inputActive ?? true;
    }
    get activeMode() {
        return this.currentMode;
    }
    get activeController() {
        if ('none' === this.currentMode) return null;
        return this.controls.get(this.currentMode)?.control ?? null;
    }
    register(mode, control) {
        if ('none' === mode) throw new Error('ControlManager: "none" is reserved and cannot be registered');
        if (this.controls.has(mode)) throw new Error(`ControlManager: controller already registered for mode "${mode}"`);
        if (control.domElement) control.disconnect();
        control.enabled = false;
        this.controls.set(mode, {
            control,
            connected: false
        });
    }
    unregister(mode) {
        if ('none' === mode) return false;
        const entry = this.controls.get(mode);
        if (!entry) return false;
        if (this.currentMode === mode) this.setMode('none');
        entry.control.enabled = false;
        if (entry.connected) {
            entry.control.disconnect();
            entry.connected = false;
        }
        entry.control.dispose();
        this.controls.delete(mode);
        return true;
    }
    setMode(mode) {
        if (mode === this.currentMode) return;
        const previous = this.currentMode;
        const oldEntry = 'none' === previous ? void 0 : this.controls.get(previous);
        const nextEntry = 'none' === mode ? void 0 : this.controls.get(mode);
        if ('none' !== mode && !nextEntry) throw new Error(`ControlManager: no controller registered for mode "${mode}"`);
        if (oldEntry) {
            oldEntry.control.enabled = false;
            if (oldEntry.connected) {
                oldEntry.control.disconnect();
                oldEntry.connected = false;
            }
        }
        this.currentMode = mode;
        if (nextEntry) {
            if (this.inputActive && !nextEntry.connected) {
                nextEntry.control.connect(this.domElement);
                nextEntry.connected = true;
            }
            nextEntry.control.enabled = this.inputActive;
            if (this.inputActive) nextEntry.control.update(0);
        }
        if (this.viewId) this.events.emit('view.controls.modeChanged', {
            viewId: this.viewId,
            mode,
            previous
        });
        if (!this.viewId || this.inputActive) this.events.emit('controls.modeChanged', {
            mode,
            previous
        });
    }
    getController(mode) {
        return this.controls.get(mode)?.control;
    }
    update(frame) {
        this.activeController?.update(frame.delta);
    }
    setInputActive(active) {
        if (this.inputActive === active) return;
        this.inputActive = active;
        const entry = 'none' === this.currentMode ? void 0 : this.controls.get(this.currentMode);
        if (!entry) return;
        if (active) {
            if (!entry.connected) {
                entry.control.connect(this.domElement);
                entry.connected = true;
            }
            entry.control.enabled = true;
            entry.control.update(0);
            return;
        }
        entry.control.enabled = false;
        if (entry.connected) {
            entry.control.disconnect();
            entry.connected = false;
        }
    }
    dispose() {
        if (this.disposed) return;
        this.disposed = true;
        const active = this.activeController;
        if (active) active.enabled = false;
        this.currentMode = 'none';
        for (const entry of this.controls.values()){
            entry.control.enabled = false;
            if (entry.connected) {
                entry.control.disconnect();
                entry.connected = false;
            }
            entry.control.dispose();
        }
        this.controls.clear();
    }
}
export { ControlManagerImpl };
