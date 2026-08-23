import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('gsplat:utils');
class WebGLUploadStream {
    constructor(renderer, options = {}){
        this.availablePBOs = [];
        this.pendingPBOs = [];
        this.directTextures = new WeakMap();
        this.directDisposeHandlers = new WeakMap();
        this.directTextureTargets = new Set();
        this.onContextLostHandler = null;
        this.renderer = renderer;
        this.useSingleBuffer = options.useSingleBuffer ?? false;
        this.debugGlErrors = options.debugGlErrors ?? true === globalThis.__SHARE3D_DEBUG_UPLOAD_GL_ERRORS__;
        const gl = renderer.getContext();
        if (!gl) throw new Error('WebGLUploadStream requires WebGL2 context');
        this.gl = gl;
        this.onContextLostHandler = this._onDeviceLost.bind(this);
        renderer.domElement.addEventListener('webglcontextlost', this.onContextLostHandler);
    }
    destroy() {
        if (this.onContextLostHandler) {
            this.renderer.domElement.removeEventListener('webglcontextlost', this.onContextLostHandler);
            this.onContextLostHandler = null;
        }
        const gl = this.gl;
        this.availablePBOs.forEach((info)=>gl.deleteBuffer(info.pbo));
        this.pendingPBOs.forEach((item)=>{
            if (item.sync) gl.deleteSync(item.sync);
            gl.deleteBuffer(item.pbo);
        });
        for (const texture of Array.from(this.directTextureTargets))this.deleteDirectTexture(texture);
        this.availablePBOs = [];
        this.pendingPBOs = [];
        this.directTextures = new WeakMap();
        this.directDisposeHandlers = new WeakMap();
        this.directTextureTargets.clear();
    }
    upload(data, target, offset = 0, size = data.length) {
        this.uploadRegion(data, target, {
            sourceOffset: 0,
            targetOffset: offset,
            size
        });
    }
    uploadRegion(data, target, region) {
        const sourceOffset = Math.max(0, Math.floor(region.sourceOffset ?? 0));
        const targetOffset = Math.max(0, Math.floor(region.targetOffset ?? 0));
        const size = Math.max(0, Math.floor(region.size ?? data.length - sourceOffset));
        this.validateSourceRange(data, sourceOffset, size);
        const targetLength = target.image?.data?.length ?? 0;
        const canUseDirect = this.useSingleBuffer && 0 === targetOffset && 0 === sourceOffset && size === targetLength;
        if (canUseDirect) this.uploadDirect(data, target, sourceOffset, targetOffset, size);
        else this.uploadPBO(data, target, sourceOffset, targetOffset, size);
    }
    validateSourceRange(data, sourceOffset, size) {
        if (sourceOffset < 0 || size < 0 || sourceOffset + size > data.length) throw new Error(`Upload source range out of bounds: sourceOffset=${sourceOffset}, size=${size}, length=${data.length}`);
    }
    uploadDirect(data, target, sourceOffset, targetOffset, size) {
        if (0 !== targetOffset || size !== target.image.data.length) throw new Error('Direct texture upload only supports full texture replacement. Use PBO mode instead.');
        if (!target.image || !target.image.data) throw new Error('Target texture must have image.data');
        if (!(0 === sourceOffset && size === target.image.data.length && data === target.image.data)) target.image.data.set(data.subarray(sourceOffset, sourceOffset + size), 0);
        const gl = this.gl;
        const width = target.image.width;
        const height = target.image.height;
        const glTexture = this.ensureDirectTexture(target);
        this.bindTexture(glTexture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, data.BYTES_PER_ELEMENT);
        gl.pixelStorei(gl.UNPACK_ROW_LENGTH, 0);
        gl.pixelStorei(gl.UNPACK_SKIP_ROWS, 0);
        gl.pixelStorei(gl.UNPACK_SKIP_PIXELS, 0);
        this.applyTextureParameters(target);
        const glFormat = this.getGLFormat(target.format);
        const glType = this.getGLType(target.type);
        const glInternalFormat = this.getGLInternalFormat(target, glFormat, glType);
        const uploadData = this.getUploadView(target.image.data, glType);
        gl.texImage2D(gl.TEXTURE_2D, 0, glInternalFormat, width, height, 0, glFormat, glType, uploadData);
        this.markTextureUploaded(target);
    }
    ensureDirectTexture(target) {
        const existing = this.directTextures.get(target);
        if (existing) return existing;
        const glTexture = this.gl.createTexture();
        if (!glTexture) throw new Error('Failed to create direct WebGL texture');
        const extRenderer = this.renderer;
        const properties = extRenderer.properties?.get(target);
        if (properties) {
            properties.__webglTexture = glTexture;
            properties.__share3dUploadStreamDirect = true;
        }
        this.directTextures.set(target, glTexture);
        this.directTextureTargets.add(target);
        const disposeHandler = ()=>this.deleteDirectTexture(target);
        this.directDisposeHandlers.set(target, disposeHandler);
        target.addEventListener('dispose', disposeHandler);
        return glTexture;
    }
    deleteDirectTexture(target) {
        const glTexture = this.directTextures.get(target);
        if (glTexture) {
            this.gl.deleteTexture(glTexture);
            this.directTextures.delete(target);
        }
        const disposeHandler = this.directDisposeHandlers.get(target);
        if (disposeHandler) {
            target.removeEventListener('dispose', disposeHandler);
            this.directDisposeHandlers.delete(target);
        }
        this.directTextureTargets.delete(target);
        const extRenderer = this.renderer;
        const properties = extRenderer.properties?.get(target);
        if (properties?.__share3dUploadStreamDirect) {
            properties.__webglTexture = void 0;
            properties.__version = void 0;
            properties.__share3dUploadStreamDirect = false;
        }
    }
    bindTexture(glTexture) {
        const rendererState = this.renderer.state;
        rendererState?.activeTexture?.(this.gl.TEXTURE0);
        if (rendererState?.bindTexture) {
            rendererState.bindTexture(this.gl.TEXTURE_2D, glTexture, this.gl.TEXTURE0);
            return;
        }
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, glTexture);
    }
    applyTextureParameters(target) {
        const gl = this.gl;
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.getGLWrapping(target.wrapS));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.getGLWrapping(target.wrapT));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.getGLFilter(target.magFilter));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.getGLFilter(target.minFilter));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_BASE_LEVEL, 0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, 0);
    }
    getUploadView(data, glType) {
        const gl = this.gl;
        if (glType === gl.UNSIGNED_BYTE && !(data instanceof Uint8Array)) return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
        if ((glType === gl.UNSIGNED_SHORT || glType === gl.HALF_FLOAT) && !(data instanceof Uint16Array)) return new Uint16Array(data.buffer, data.byteOffset, data.byteLength / Uint16Array.BYTES_PER_ELEMENT);
        if (glType === gl.UNSIGNED_INT && !(data instanceof Uint32Array)) return new Uint32Array(data.buffer, data.byteOffset, data.byteLength / Uint32Array.BYTES_PER_ELEMENT);
        if (glType === gl.FLOAT && !(data instanceof Float32Array)) return new Float32Array(data.buffer, data.byteOffset, data.byteLength / Float32Array.BYTES_PER_ELEMENT);
        return data;
    }
    uploadPBO(data, target, sourceOffset, targetOffset, size) {
        const gl = this.gl;
        const width = target.image.width;
        const height = target.image.height;
        const byteSize = size * data.BYTES_PER_ELEMENT;
        this.update(byteSize);
        if (targetOffset % width !== 0) throw new Error(`Upload offset (${targetOffset}) must be a multiple of texture width (${width}) for row alignment`);
        if (size % width !== 0) throw new Error(`Upload size (${size}) must be a multiple of texture width (${width}) for row alignment`);
        const startY = targetOffset / width;
        const uploadHeight = size / width;
        if (startY + uploadHeight > height) {
            log.error(`[UploadStream] texSubImage2D overflow: startY=${startY}, uploadHeight=${uploadHeight}, texture height=${height}, texture size=${width}x${height}, targetOffset=${targetOffset}, size=${size}`);
            throw new Error(`Upload exceeds texture bounds: startY(${startY}) + uploadHeight(${uploadHeight}) > height(${height})`);
        }
        const pboInfo = this.availablePBOs.pop() ?? (()=>{
            const pbo = gl.createBuffer();
            if (!pbo) throw new Error('Failed to create PBO');
            return {
                pbo,
                size: byteSize
            };
        })();
        gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, pboInfo.pbo);
        gl.bufferData(gl.PIXEL_UNPACK_BUFFER, byteSize, gl.STREAM_DRAW);
        gl.bufferSubData(gl.PIXEL_UNPACK_BUFFER, 0, new Uint8Array(data.buffer, data.byteOffset + sourceOffset * data.BYTES_PER_ELEMENT, byteSize));
        gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, null);
        this.ensureTextureAllocatedForSubImage(target);
        const extRenderer = this.renderer;
        const properties = extRenderer.properties?.get(target);
        const glTexture = properties?.__webglTexture;
        if (!glTexture) throw new Error('Failed to get WebGL texture from Three.js');
        this.bindTexture(glTexture);
        gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, pboInfo.pbo);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, data.BYTES_PER_ELEMENT);
        gl.pixelStorei(gl.UNPACK_ROW_LENGTH, 0);
        gl.pixelStorei(gl.UNPACK_SKIP_ROWS, 0);
        gl.pixelStorei(gl.UNPACK_SKIP_PIXELS, 0);
        const glFormat = this.getGLFormat(target.format);
        const glType = this.getGLType(target.type);
        try {
            gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, startY, width, uploadHeight, glFormat, glType, 0);
            if (this.debugGlErrors) {
                const err = gl.getError();
                if (err !== gl.NO_ERROR) {
                    let levelW = -1;
                    let levelH = -1;
                    let levelIF = -1;
                    try {
                        levelW = gl.getTexLevelParameter(gl.TEXTURE_2D, 0, gl.TEXTURE_WIDTH);
                        levelH = gl.getTexLevelParameter(gl.TEXTURE_2D, 0, gl.TEXTURE_HEIGHT);
                        levelIF = gl.getTexLevelParameter(gl.TEXTURE_2D, 0, gl.TEXTURE_INTERNAL_FORMAT);
                    } catch (_e) {}
                    log.error(`[UploadStream] texSubImage2D glError=${err} tex=${target.name || 'unnamed'} fmt=${target.format} type=${target.type} internal=${target.internalFormat} width=${width} height=${height} startY=${startY} uploadH=${uploadHeight} targetOffset=${targetOffset} size=${size} glFormat=${glFormat} glType=${glType} levelSize=${levelW}x${levelH} levelIF=${levelIF}`);
                    throw new Error('texSubImage2D failed');
                }
            }
        } catch (e) {
            log.error(`[UploadStream] texSubImage2D exception tex=${target.name || 'unnamed'} fmt=${target.format} type=${target.type} internal=${target.internalFormat} width=${width} height=${height} startY=${startY} uploadH=${uploadHeight} targetOffset=${targetOffset} size=${size}`);
            throw e;
        }
        gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, null);
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        if (!sync) throw new Error('Failed to create sync object');
        this.pendingPBOs.push({
            pbo: pboInfo.pbo,
            size: byteSize,
            sync
        });
        gl.flush();
        this.markTextureUploaded(target);
    }
    markTextureUploaded(target) {
        const mutableTarget = target;
        const nextVersion = (mutableTarget.version ?? 0) + 1;
        mutableTarget.version = nextVersion;
        const extRenderer = this.renderer;
        const properties = extRenderer.properties?.get(target);
        if (properties) properties.__version = nextVersion;
        const source = target.source;
        const sourceProperties = extRenderer.properties?.get(source);
        if (sourceProperties) sourceProperties.__version = source.version;
    }
    ensureTextureAllocatedForSubImage(target) {
        const extRenderer = this.renderer;
        const properties = extRenderer.properties?.get(target);
        if (properties?.__webglTexture) return;
        const source = target.source;
        const previousDataReady = source?.dataReady;
        if (source) source.dataReady = false;
        try {
            target.needsUpdate = true;
            this.renderer.initTexture(target);
        } finally{
            if (source) source.dataReady = previousDataReady ?? true;
        }
    }
    update(minByteSize) {
        const gl = this.gl;
        const pending = this.pendingPBOs;
        for(let i = pending.length - 1; i >= 0; i--){
            const item = pending[i];
            const result = gl.clientWaitSync(item.sync, 0, 0);
            if (result === gl.CONDITION_SATISFIED || result === gl.ALREADY_SIGNALED) {
                gl.deleteSync(item.sync);
                this.availablePBOs.push({
                    pbo: item.pbo,
                    size: item.size
                });
                pending.splice(i, 1);
            }
        }
        const available = this.availablePBOs;
        for(let i = available.length - 1; i >= 0; i--)if (available[i].size < minByteSize) {
            gl.deleteBuffer(available[i].pbo);
            available.splice(i, 1);
        }
    }
    _onDeviceLost(_event) {
        this.availablePBOs.length = 0;
        this.pendingPBOs.length = 0;
    }
    getGLFormat(format) {
        const gl = this.gl;
        switch(format){
            case __WEBPACK_EXTERNAL_MODULE_three__.RGBAFormat:
                return gl.RGBA;
            case __WEBPACK_EXTERNAL_MODULE_three__.RGBAIntegerFormat:
                return gl.RGBA_INTEGER;
            case __WEBPACK_EXTERNAL_MODULE_three__.RGIntegerFormat:
                return gl.RG_INTEGER;
            case __WEBPACK_EXTERNAL_MODULE_three__.RedIntegerFormat:
                return gl.RED_INTEGER;
            case __WEBPACK_EXTERNAL_MODULE_three__.RGFormat:
                return gl.RG;
            case __WEBPACK_EXTERNAL_MODULE_three__.RedFormat:
                return gl.RED;
            default:
                throw new Error(`Unsupported texture format: ${format}`);
        }
    }
    getGLType(type) {
        const gl = this.gl;
        switch(type){
            case __WEBPACK_EXTERNAL_MODULE_three__.UnsignedIntType:
                return gl.UNSIGNED_INT;
            case __WEBPACK_EXTERNAL_MODULE_three__.HalfFloatType:
                return gl.HALF_FLOAT;
            case __WEBPACK_EXTERNAL_MODULE_three__.FloatType:
                return gl.FLOAT;
            case __WEBPACK_EXTERNAL_MODULE_three__.UnsignedByteType:
                return gl.UNSIGNED_BYTE;
            case __WEBPACK_EXTERNAL_MODULE_three__.UnsignedShortType:
                return gl.UNSIGNED_SHORT;
            default:
                throw new Error(`Unsupported texture type: ${type}`);
        }
    }
    getGLInternalFormat(target, glFormat, glType) {
        const gl = this.gl;
        const explicit = target.internalFormat;
        if ('string' == typeof explicit) switch(explicit){
            case 'R32UI':
                return gl.R32UI;
            case 'RG32UI':
                return gl.RG32UI;
            case 'RGBA32UI':
                return gl.RGBA32UI;
            case 'RGBA16F':
                return gl.RGBA16F;
            case 'RGBA8':
                return gl.RGBA8;
            default:
                break;
        }
        if (glFormat === gl.RED_INTEGER && glType === gl.UNSIGNED_INT) return gl.R32UI;
        if (glFormat === gl.RG_INTEGER && glType === gl.UNSIGNED_INT) return gl.RG32UI;
        if (glFormat === gl.RGBA_INTEGER && glType === gl.UNSIGNED_INT) return gl.RGBA32UI;
        if (glFormat === gl.RGBA && glType === gl.HALF_FLOAT) return gl.RGBA16F;
        if (glFormat === gl.RGBA && glType === gl.UNSIGNED_BYTE) return gl.RGBA8;
        return glFormat;
    }
    getGLWrapping(wrapping) {
        const gl = this.gl;
        switch(wrapping){
            case __WEBPACK_EXTERNAL_MODULE_three__.RepeatWrapping:
                return gl.REPEAT;
            case __WEBPACK_EXTERNAL_MODULE_three__.MirroredRepeatWrapping:
                return gl.MIRRORED_REPEAT;
            default:
                return gl.CLAMP_TO_EDGE;
        }
    }
    getGLFilter(filter) {
        const gl = this.gl;
        switch(filter){
            case __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter:
                return gl.NEAREST;
            case __WEBPACK_EXTERNAL_MODULE_three__.NearestMipmapNearestFilter:
                return gl.NEAREST_MIPMAP_NEAREST;
            case __WEBPACK_EXTERNAL_MODULE_three__.NearestMipmapLinearFilter:
                return gl.NEAREST_MIPMAP_LINEAR;
            case __WEBPACK_EXTERNAL_MODULE_three__.LinearMipmapNearestFilter:
                return gl.LINEAR_MIPMAP_NEAREST;
            case __WEBPACK_EXTERNAL_MODULE_three__.LinearMipmapLinearFilter:
                return gl.LINEAR_MIPMAP_LINEAR;
            default:
                return gl.LINEAR;
        }
    }
}
function createUploadStream(renderer, options = {}) {
    const { backend = 'webgl', ...streamOptions } = options;
    if ('webgpu' === backend) log.warn('[UploadStream] WebGPU 后端未实现（WebGL2-only），回退到 webgl');
    return new WebGLUploadStream(renderer, streamOptions);
}
const UploadStream = WebGLUploadStream;
export { UploadStream, WebGLUploadStream, createUploadStream };
