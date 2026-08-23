class WebGLBuffer {
    constructor(){
        this.numElements = 0;
        this.vao = null;
        this.disposeHandler = null;
        this.vbos = new Map();
    }
}
export { WebGLBuffer };
