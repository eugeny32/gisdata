import * as __WEBPACK_EXTERNAL_MODULE__common_Stack_js_faf97e08__ from "../common/Stack.js";
class ToolStack extends __WEBPACK_EXTERNAL_MODULE__common_Stack_js_faf97e08__.Stack {
    constructor(emitter){
        super(), this.emitter = emitter, this.defaultTool = null;
    }
    push(val) {
        const last = this.top ?? this.defaultTool;
        last?.onPause?.();
        super.push(val);
        this.emitter.emit('onToolChanged', {
            curTool: val,
            lastTool: last
        });
    }
    pop() {
        const item = super.pop();
        item?.onPause?.();
        item?.terminate();
        const last = this.top ?? this.defaultTool;
        last?.onPlay?.();
        this.emitter.emit('onToolChanged', {
            curTool: last,
            lastTool: item
        });
        return item;
    }
    alone(val) {
        if (0 === this.length) {
            this.push(val);
            return;
        }
        this.clear(false);
        this.push(val);
    }
    clear(isEmit = true) {
        const last = this.top ?? this.defaultTool;
        this.forEach((tool)=>{
            tool?.terminate();
        });
        super.clear();
        if (isEmit) this.emitter.emit('onToolChanged', {
            curTool: null,
            lastTool: last
        });
    }
}
export { ToolStack };
