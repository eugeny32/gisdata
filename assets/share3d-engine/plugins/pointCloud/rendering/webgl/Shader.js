import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_19e54b99__ from "../../../../shared/logging/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_utils_hash_js_13ddf9b7__ from "../../../../shared/utils/hash.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_js_d88b7fe1__ from "./utils.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_19e54b99__.getLoggerManager)().getLogger('pointcloud');
class Shader {
    constructor(gl, name, vsSource, fsSource){
        this.gl = gl;
        this.name = name;
        this.vsSource = vsSource;
        this.fsSource = fsSource;
        this.cache = new Map();
        this.vs = null;
        this.fs = null;
        this.program = null;
        this.uniformLocations = {};
        this.attributeLocations = {};
        this.uniformBlockIndices = {};
        this.uniformBlocks = {};
        this.uniforms = {};
        this.update(vsSource, fsSource);
    }
    update(vsSource, fsSource) {
        this.vsSource = vsSource;
        this.fsSource = fsSource;
        this.linkProgram();
    }
    compileShader(shader, source) {
        const gl = this.gl;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!success) {
            const info = gl.getShaderInfoLog(shader);
            const numberedSource = source.split('\n').map((a, i)=>`${i + 1}`.padEnd(5) + a).join('\n');
            throw `could not compile shader ${this.name}: ${info}, \n${numberedSource}`;
        }
    }
    linkProgram() {
        const tStart = performance.now();
        const gl = this.gl;
        this.uniformLocations = {};
        this.attributeLocations = {};
        this.uniforms = {};
        gl.useProgram(null);
        const key = (0, __WEBPACK_EXTERNAL_MODULE__shared_utils_hash_js_13ddf9b7__.fnv32a)(this.vsSource + this.fsSource);
        const cached = this.cache.get(key);
        if (cached) {
            this.program = cached.program;
            this.vs = cached.vs;
            this.fs = cached.fs;
            this.attributeLocations = cached.attributeLocations;
            this.uniformLocations = cached.uniformLocations;
            this.uniformBlocks = cached.uniformBlocks;
            this.uniforms = cached.uniforms;
            return;
        }
        {
            this.vs = gl.createShader(gl.VERTEX_SHADER);
            this.fs = gl.createShader(gl.FRAGMENT_SHADER);
            this.program = gl.createProgram();
            if (!this.program) throw new Error('Failed to create program');
            for (const name of Object.keys(__WEBPACK_EXTERNAL_MODULE__utils_js_d88b7fe1__.attributeLocations)){
                const location = __WEBPACK_EXTERNAL_MODULE__utils_js_d88b7fe1__.attributeLocations[name].location;
                const glslName = __WEBPACK_EXTERNAL_MODULE__utils_js_d88b7fe1__.attributeLocations[name].name;
                gl.bindAttribLocation(this.program, location, glslName);
            }
            if (this.vs && this.fs && this.program) {
                this.compileShader(this.vs, this.vsSource);
                this.compileShader(this.fs, this.fsSource);
                gl.attachShader(this.program, this.vs);
                gl.attachShader(this.program, this.fs);
                gl.linkProgram(this.program);
                gl.detachShader(this.program, this.vs);
                gl.detachShader(this.program, this.fs);
            }
            if (!this.program) return;
            const success = gl.getProgramParameter(this.program, gl.LINK_STATUS);
            if (!success) {
                const info = gl.getProgramInfoLog(this.program);
                throw `could not link program ${this.name}: ${info}`;
            }
            {
                const numAttributes = gl.getProgramParameter(this.program, gl.ACTIVE_ATTRIBUTES);
                for(let i = 0; i < numAttributes; i++){
                    const attribute = gl.getActiveAttrib(this.program, i);
                    const location = gl.getAttribLocation(this.program, attribute.name);
                    this.attributeLocations[attribute.name] = location;
                }
            }
            {
                const numUniforms = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
                for(let i = 0; i < numUniforms; i++){
                    const uniform = gl.getActiveUniform(this.program, i);
                    const location = gl.getUniformLocation(this.program, uniform.name);
                    this.uniformLocations[uniform.name] = location;
                    this.uniforms[uniform.name] = {
                        location: location,
                        value: null
                    };
                }
            }
            if (gl instanceof WebGL2RenderingContext) {
                const numBlocks = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORM_BLOCKS);
                for(let i = 0; i < numBlocks; i++){
                    const blockName = gl.getActiveUniformBlockName(this.program, i);
                    const blockIndex = gl.getUniformBlockIndex(this.program, blockName);
                    this.uniformBlockIndices[blockName] = blockIndex;
                    gl.uniformBlockBinding(this.program, blockIndex, blockIndex);
                    const dataSize = gl.getActiveUniformBlockParameter(this.program, blockIndex, gl.UNIFORM_BLOCK_DATA_SIZE);
                    const uBuffer = gl.createBuffer();
                    gl.bindBuffer(gl.UNIFORM_BUFFER, uBuffer);
                    gl.bufferData(gl.UNIFORM_BUFFER, dataSize, gl.DYNAMIC_READ);
                    gl.bindBufferBase(gl.UNIFORM_BUFFER, blockIndex, uBuffer);
                    gl.bindBuffer(gl.UNIFORM_BUFFER, null);
                    this.uniformBlocks[blockName] = {
                        name: blockName,
                        index: blockIndex,
                        dataSize: dataSize,
                        buffer: uBuffer
                    };
                }
            }
            const cached = {
                program: this.program,
                vs: this.vs,
                fs: this.fs,
                attributeLocations: this.attributeLocations,
                uniformLocations: this.uniformLocations,
                uniforms: this.uniforms,
                uniformBlocks: this.uniformBlocks
            };
            this.cache.set(key, cached);
        }
        const tEnd = performance.now();
        const duration = tEnd - tStart;
        log.debug(`shader compile duration: ${duration.toFixed(3)}`);
    }
    setUniformMatrix4(name, value) {
        const gl = this.gl;
        const location = this.uniformLocations[name];
        if (null == location) return;
        const tmp = new Float32Array(value.elements);
        gl.uniformMatrix4fv(location, false, tmp);
    }
    setUniform1f(name, value) {
        const gl = this.gl;
        const uniform = this.uniforms[name];
        if (void 0 === uniform) return;
        if (uniform.value === value) return;
        uniform.value = value;
        gl.uniform1f(uniform.location, value);
    }
    setUniformBoolean(name, value) {
        const gl = this.gl;
        const uniform = this.uniforms[name];
        if (void 0 === uniform) return;
        if (uniform.value === value) return;
        uniform.value = value;
        gl.uniform1i(uniform.location, value ? 1 : 0);
    }
    setUniformTexture(name, value) {
        const gl = this.gl;
        const location = this.uniformLocations[name];
        if (null == location) return;
        gl.uniform1i(location, value);
    }
    setUniform2f(name, value) {
        const gl = this.gl;
        const location = this.uniformLocations[name];
        if (null == location) return;
        gl.uniform2f(location, value[0], value[1]);
    }
    setUniform3f(name, value) {
        const gl = this.gl;
        const location = this.uniformLocations[name];
        if (null == location) return;
        gl.uniform3f(location, value[0], value[1], value[2]);
    }
    setUniform(name, value) {
        if (value.constructor === __WEBPACK_EXTERNAL_MODULE_three__.Matrix4) this.setUniformMatrix4(name, value);
        else if ('number' == typeof value) this.setUniform1f(name, value);
        else if ('boolean' == typeof value) this.setUniformBoolean(name, value);
        else if (Array.isArray(value)) {
            if (2 === value.length) this.setUniform2f(name, value);
            else if (3 === value.length) this.setUniform3f(name, value);
        } else log.error(`unhandled uniform type: ${name}, ${String(value)}`);
    }
    setUniform1i(name, value) {
        const gl = this.gl;
        const location = this.uniformLocations[name];
        if (null == location) return;
        gl.uniform1i(location, value);
    }
}
export { Shader };
