import * as __WEBPACK_EXTERNAL_MODULE_inversify__ from "inversify";
import * as __WEBPACK_EXTERNAL_MODULE__core_common_EventDispatcher_js_0ec5b8de__ from "../../core/common/EventDispatcher.js";
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
class HistoryManager extends __WEBPACK_EXTERNAL_MODULE__core_common_EventDispatcher_js_0ec5b8de__["default"] {
    get canUndo() {
        return !this.isLocked && (this.activeCommand ? this.activeCommand.canUndoStep?.() ?? false : this.undoStack.length > 0);
    }
    get canRedo() {
        return !this.isLocked && (this.activeCommand ? false : this.redoStack.length > 0);
    }
    setLock(val) {
        this.isLocked = val;
        this.notify();
    }
    startCommand(command) {
        this.activeCommand = command;
        this.notify();
    }
    commitCommand() {
        if (!this.activeCommand) return;
        if (this.activeCommand.canCommit()) this.addCommandAndExecute(this.activeCommand);
        this.activeCommand = null;
        this.notify();
    }
    addCommandAndExecute(command) {
        command.execute();
        this.addCommand(command);
        this.notify();
    }
    addCommand(command) {
        this.undoStack.push(command);
        this.clearRedoStack();
        if (this.undoStack.length > this.maxLimit) this.undoStack.shift();
        this.notify();
    }
    undo() {
        if (this.isLocked) return;
        if (this.activeCommand) {
            if (this.activeCommand.canUndoStep?.()) {
                this.activeCommand.undoStep?.();
                this.notify();
            }
            return;
        }
        const command = this.undoStack.pop();
        if (command) {
            command.undo();
            this.redoStack.push(command);
            this.notify();
            this.undoRedoNotify();
        }
    }
    redo() {
        if (this.isLocked) return;
        if (this.activeCommand) return;
        const command = this.redoStack.pop();
        if (command) {
            command.redo();
            this.undoStack.push(command);
            this.notify();
            this.undoRedoNotify();
        }
    }
    clear() {
        this.undoStack = [];
        this.redoStack = [];
        this.notify();
    }
    clearRedoStack() {
        this.redoStack = [];
    }
    notify() {
        this.emit('onStateChanged');
    }
    undoRedoNotify() {
        this.emit('undoRedo');
    }
    refresh() {
        this.notify();
    }
    constructor(...args){
        super(...args), this.undoStack = [], this.redoStack = [], this.maxLimit = 10, this.activeCommand = null, this.isLocked = false;
    }
}
HistoryManager = _ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.injectable)()
], HistoryManager);
export { HistoryManager };
