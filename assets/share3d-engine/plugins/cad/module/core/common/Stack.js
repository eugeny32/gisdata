class Stack {
    constructor(){
        this.stack = [];
    }
    push(val) {
        this.stack.push(val);
    }
    pop(..._args) {
        return this.stack.pop();
    }
    clear() {
        this.stack.length = 0;
    }
    get top() {
        return this.stack.length > 0 ? this.stack[this.stack.length - 1] : void 0;
    }
    get bottom() {
        return this.stack[0];
    }
    get length() {
        return this.stack.length;
    }
    empty() {
        return 0 === this.stack.length;
    }
    forEach(callback) {
        this.stack.forEach(callback);
    }
}
export { Stack };
