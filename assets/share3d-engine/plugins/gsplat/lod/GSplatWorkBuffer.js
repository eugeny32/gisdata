import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shaders_gsplat_chunks_js_c6e8d193__ from "../shaders/gsplat-chunks.js";
import * as __WEBPACK_EXTERNAL_MODULE__shaders_gsplatCopyToWorkBuffer_glsl_js_eb48ee5f__ from "../shaders/gsplatCopyToWorkBuffer.glsl.js";
import * as __WEBPACK_EXTERNAL_MODULE__shaders_gsplatModifyChunk_js_2bdd6f97__ from "../shaders/gsplatModifyChunk.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_UploadStream_js_d9045c01__ from "../utils/UploadStream.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__GSplatWorkBufferRenderPass_js_d7e0d8b7__ from "./GSplatWorkBufferRenderPass.js";
import * as __WEBPACK_EXTERNAL_MODULE__QuadRender_js_74a70adf__ from "./QuadRender.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('gsplat:lod');
var GSplatWorkBuffer_rslib_entry_GSplatScalarMode = /*#__PURE__*/ function(GSplatScalarMode) {
    GSplatScalarMode[GSplatScalarMode["None"] = 0] = "None";
    GSplatScalarMode[GSplatScalarMode["Volume"] = 1] = "Volume";
    GSplatScalarMode[GSplatScalarMode["SurfaceArea"] = 2] = "SurfaceArea";
    GSplatScalarMode[GSplatScalarMode["Value"] = 3] = "Value";
    return GSplatScalarMode;
}({});
const TEXTURE_FORMATS = {
    COLOR_HDR: {
        format: __WEBPACK_EXTERNAL_MODULE_three__.RGBAFormat,
        type: __WEBPACK_EXTERNAL_MODULE_three__.HalfFloatType,
        internalFormat: 'RGBA16F',
        label: 'rgba16f'
    },
    COLOR_FALLBACK: {
        format: __WEBPACK_EXTERNAL_MODULE_three__.RGBAFormat,
        type: __WEBPACK_EXTERNAL_MODULE_three__.UnsignedByteType,
        internalFormat: 'RGBA8',
        label: 'rgba8'
    },
    SPLAT0: {
        format: __WEBPACK_EXTERNAL_MODULE_three__.RGBAIntegerFormat,
        type: __WEBPACK_EXTERNAL_MODULE_three__.UnsignedIntType,
        internalFormat: 'RGBA32UI'
    },
    SPLAT1: {
        format: __WEBPACK_EXTERNAL_MODULE_three__.RGIntegerFormat,
        type: __WEBPACK_EXTERNAL_MODULE_three__.UnsignedIntType,
        internalFormat: 'RG32UI'
    },
    ORDER: {
        format: __WEBPACK_EXTERNAL_MODULE_three__.RedIntegerFormat,
        type: __WEBPACK_EXTERNAL_MODULE_three__.UnsignedIntType,
        internalFormat: 'R32UI'
    }
};
class WorkBufferRenderInfo {
    constructor(_renderer, _hasIntervals, colorTextureFormat, passMode, shBands, isSogs = false, modifier = null){
        this.precompileStarted = false;
        this.isSogs = isSogs;
        const defines = {};
        defines.GSPLAT_COPY_SEGMENTS = '';
        if ('colorOnly' === passMode) defines.GSPLAT_COLOR_ONLY = '';
        else if ('scalarOnly' === passMode) defines.GSPLAT_SCALAR_ONLY = '';
        if (isSogs) defines.GSPLAT_SOGS_DATA = '';
        defines.SH_BANDS = shBands.toString();
        const uniforms = {
            uStartLine: {
                value: 0
            },
            uViewportWidth: {
                value: 1
            },
            uActiveSplats: {
                value: 0
            },
            uTargetSize: {
                value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(1, 1)
            },
            uColorMultiply: {
                value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1, 1, 1)
            },
            matrix_model: {
                value: new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4()
            },
            matrix_view: {
                value: new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4()
            },
            uSegmentSourceBase: {
                value: 0
            },
            uSegmentTargetOffset: {
                value: 0
            },
            uSegmentCount: {
                value: 0
            },
            uSegmentX: {
                value: 0
            },
            uSegmentY: {
                value: 0
            },
            uSegmentWidth: {
                value: 1
            }
        };
        if ('scalarOnly' === passMode) uniforms.uScalarMode = {
            value: 0
        };
        if (isSogs) {
            uniforms.splatMeansLow = {
                value: null
            };
            uniforms.splatMeansHigh = {
                value: null
            };
            uniforms.splatQuats = {
                value: null
            };
            uniforms.splatScales = {
                value: null
            };
            uniforms.splatSH0 = {
                value: null
            };
            uniforms.sogsMeans_mins = {
                value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector3()
            };
            uniforms.sogsMeans_maxs = {
                value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector3()
            };
            uniforms.sogsScales_mins = {
                value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector3()
            };
            uniforms.sogsScales_maxs = {
                value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector3()
            };
            uniforms.sogsSH0_mins = {
                value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector4()
            };
            uniforms.sogsSH0_maxs = {
                value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector4()
            };
            uniforms.sogsScalesCodebook = {
                value: null
            };
            uniforms.sogsSH0Codebook = {
                value: null
            };
            if (shBands > 0) {
                uniforms.packedShN = {
                    value: null
                };
                uniforms.sogsSH_labels = {
                    value: null
                };
                uniforms.sogsSHN_mins = {
                    value: 0
                };
                uniforms.sogsSHN_maxs = {
                    value: 0
                };
                uniforms.sogsSHNCodebook = {
                    value: null
                };
            }
        } else {
            uniforms.splatColor = {
                value: null
            };
            uniforms.splatDataA = {
                value: null
            };
            uniforms.splatDataB = {
                value: null
            };
            const uniformShBands = parseInt(defines.SH_BANDS || '0', 10);
            if (uniformShBands > 0) {
                uniforms.splatSH0 = {
                    value: null
                };
                if (uniformShBands >= 2) uniforms.splatSH1 = {
                    value: null
                };
                if (uniformShBands >= 3) uniforms.splatSH2 = {
                    value: null
                };
            }
        }
        const manager = (0, __WEBPACK_EXTERNAL_MODULE__shaders_gsplat_chunks_js_c6e8d193__.registerGSplatChunks)();
        const chunkOverrides = modifier ? {
            gsplatModifyVS: (0, __WEBPACK_EXTERNAL_MODULE__shaders_gsplatModifyChunk_js_2bdd6f97__.createGSplatModifyChunk)(modifier.code)
        } : void 0;
        const processedFS = manager.processIncludes(__WEBPACK_EXTERNAL_MODULE__shaders_gsplatCopyToWorkBuffer_glsl_js_eb48ee5f__.fragmentShader, new Set(), chunkOverrides);
        this.material = new __WEBPACK_EXTERNAL_MODULE_three__.ShaderMaterial({
            vertexShader: __WEBPACK_EXTERNAL_MODULE__shaders_gsplatCopyToWorkBuffer_glsl_js_eb48ee5f__.vertexShader,
            fragmentShader: processedFS,
            defines: defines,
            uniforms: uniforms,
            glslVersion: __WEBPACK_EXTERNAL_MODULE_three__.GLSL3,
            depthTest: false,
            depthWrite: false,
            blending: __WEBPACK_EXTERNAL_MODULE_three__.NoBlending
        });
        this.quadRender = new __WEBPACK_EXTERNAL_MODULE__QuadRender_js_74a70adf__.QuadRender(this.material);
    }
    precompile(renderer) {
        if (this.precompileStarted) return;
        this.precompileStarted = true;
        try {
            const result = this.quadRender.precompile(renderer);
            if (result && 'function' == typeof result.catch) result.catch(()=>{
                this.precompileStarted = false;
            });
        } catch  {
            this.precompileStarted = false;
        }
    }
    destroy() {
        this.quadRender.dispose();
        this.material.dispose();
    }
}
class GSplatWorkBuffer {
    constructor(renderer){
        this._textureSize = 1;
        this._renderable = true;
        this._isWebGL2 = false;
        this._hasColorBufferFloat = false;
        this._hasColorBufferHalfFloat = false;
        this.stagingOrderTexture = null;
        this.orderStagingJob = null;
        this.mergedStateTexture = null;
        this.scalarRenderTarget = null;
        this.scalarRenderPass = null;
        this.renderInfoCache = new Map();
        this.scalarTexture = null;
        this._scalarMode = 0;
        this._scalarDirty = false;
        this._scalarVersion = 0;
        this.warnedScalarFilteringUnsupported = false;
        this.renderer = renderer;
        this.detectColorFormat();
        this.scalarFilteringSupported = this.detectScalarFilteringSupport();
        this.colorTexture = this.createTexture('splatColor', this.colorTextureFormat, 1, 1);
        this.splatTexture0 = this.createTexture('splatTexture0', TEXTURE_FORMATS.SPLAT0, 1, 1);
        this.splatTexture1 = this.createTexture('splatTexture1', TEXTURE_FORMATS.SPLAT1, 1, 1);
        this.orderTexture = this.createTexture('SplatGlobalOrder', TEXTURE_FORMATS.ORDER, 1, 1);
        this.renderTarget = new __WEBPACK_EXTERNAL_MODULE_three__.WebGLRenderTarget(1, 1, {
            count: 3,
            depthBuffer: false,
            stencilBuffer: false
        });
        const colorTex = this.renderTarget.textures[0];
        colorTex.format = this.colorTextureFormat.format;
        colorTex.type = this.colorTextureFormat.type;
        colorTex.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        colorTex.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        colorTex.name = 'splatColor';
        if (this.colorTextureFormat.type === __WEBPACK_EXTERNAL_MODULE_three__.HalfFloatType) colorTex.internalFormat = 'RGBA16F';
        else if (this.colorTextureFormat.type === __WEBPACK_EXTERNAL_MODULE_three__.UnsignedByteType) colorTex.internalFormat = 'RGBA8';
        const splat0Tex = this.renderTarget.textures[1];
        splat0Tex.format = TEXTURE_FORMATS.SPLAT0.format;
        splat0Tex.type = TEXTURE_FORMATS.SPLAT0.type;
        splat0Tex.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        splat0Tex.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        splat0Tex.name = 'splatTexture0';
        splat0Tex.internalFormat = 'RGBA32UI';
        const splat1Tex = this.renderTarget.textures[2];
        splat1Tex.format = TEXTURE_FORMATS.SPLAT1.format;
        splat1Tex.type = TEXTURE_FORMATS.SPLAT1.type;
        splat1Tex.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        splat1Tex.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        splat1Tex.name = 'splatTexture1';
        splat1Tex.internalFormat = 'RG32UI';
        this.colorTexture = this.renderTarget.textures[0];
        this.splatTexture0 = this.renderTarget.textures[1];
        this.splatTexture1 = this.renderTarget.textures[2];
        this.colorRenderTarget = this.renderTarget;
        this.initializeColorFormat();
        this.renderPass = new __WEBPACK_EXTERNAL_MODULE__GSplatWorkBufferRenderPass_js_d7e0d8b7__.GSplatWorkBufferRenderPass(renderer, this, 'full');
        this.colorRenderPass = new __WEBPACK_EXTERNAL_MODULE__GSplatWorkBufferRenderPass_js_d7e0d8b7__.GSplatWorkBufferRenderPass(renderer, this, 'colorOnly');
        this.uploadStream = (0, __WEBPACK_EXTERNAL_MODULE__utils_UploadStream_js_d9045c01__.createUploadStream)(renderer, {
            useSingleBuffer: true
        });
    }
    detectColorFormat() {
        const gl = this.renderer.getContext();
        this._isWebGL2 = this.isWebGL2Context(gl);
        this._hasColorBufferFloat = null !== gl.getExtension('EXT_color_buffer_float');
        this._hasColorBufferHalfFloat = null !== gl.getExtension('EXT_color_buffer_half_float');
        if (this._isWebGL2 && (this._hasColorBufferFloat || this._hasColorBufferHalfFloat)) this.colorTextureFormat = TEXTURE_FORMATS.COLOR_HDR;
        else this.colorTextureFormat = TEXTURE_FORMATS.COLOR_FALLBACK;
    }
    detectScalarFilteringSupport() {
        const gl = this.renderer.getContext();
        const isWebGL2 = this.isWebGL2Context(gl);
        const hasColorBufferFloat = null !== gl.getExtension('EXT_color_buffer_float');
        return isWebGL2 && hasColorBufferFloat;
    }
    isWebGL2Context(gl) {
        if ('undefined' != typeof WebGL2RenderingContext && gl instanceof WebGL2RenderingContext) return true;
        const maybeWebGL2 = gl;
        return 'function' == typeof maybeWebGL2.drawBuffers && 'function' == typeof maybeWebGL2.texStorage2D;
    }
    initializeColorFormat() {
        const canTryHalfFloat = this._isWebGL2 && (this._hasColorBufferFloat || this._hasColorBufferHalfFloat);
        if (!this._isWebGL2) {
            this.colorTextureFormat = TEXTURE_FORMATS.COLOR_FALLBACK;
            this.configureRenderTargetTextures(this.colorTextureFormat);
            this._renderable = false;
            log.error('GSplatWorkBuffer: WebGL2 is required for Unified WorkBuffer, disabling WorkBuffer');
            return;
        }
        if (canTryHalfFloat) {
            this.colorTextureFormat = TEXTURE_FORMATS.COLOR_HDR;
            this.configureRenderTargetTextures(this.colorTextureFormat);
            if (this.validateRenderTargets('initial', 'warn')) {
                this._renderable = true;
                return;
            }
            log.warn('GSplatWorkBuffer: RGBA16F framebuffer incomplete, using RGBA8 fallback');
        } else log.warn('GSplatWorkBuffer: HalfFloat render target unsupported, using RGBA8 fallback');
        this.colorTextureFormat = TEXTURE_FORMATS.COLOR_FALLBACK;
        this.renderTarget.dispose();
        this.configureRenderTargetTextures(this.colorTextureFormat);
        this._renderable = this.validateRenderTargets('initial-fallback', 'error');
        if (!this._renderable) log.error('GSplatWorkBuffer: RGBA8 fallback framebuffer incomplete, disabling WorkBuffer');
    }
    configureRenderTargetTextures(formatConfig) {
        this.configureTexture(this.renderTarget.textures[0], 'splatColor', formatConfig);
        this.configureTexture(this.renderTarget.textures[1], 'splatTexture0', TEXTURE_FORMATS.SPLAT0);
        this.configureTexture(this.renderTarget.textures[2], 'splatTexture1', TEXTURE_FORMATS.SPLAT1);
        this.colorTexture = this.renderTarget.textures[0];
        this.splatTexture0 = this.renderTarget.textures[1];
        this.splatTexture1 = this.renderTarget.textures[2];
    }
    configureTexture(texture, name, formatConfig) {
        texture.format = formatConfig.format;
        texture.type = formatConfig.type;
        texture.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        texture.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        texture.wrapS = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
        texture.wrapT = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
        texture.generateMipmaps = false;
        texture.name = name;
        texture.internalFormat = formatConfig.internalFormat ?? null;
    }
    validateRenderTargets(reason, level) {
        return this.validateRenderTarget(reason, 'full', this.renderTarget, level);
    }
    validateRenderTarget(reason, pass, target, level) {
        const gl = this.renderer.getContext();
        const previousTarget = this.renderer.getRenderTarget();
        let status = 0;
        try {
            this.renderer.setRenderTarget(target);
            status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        } finally{
            this.renderer.setRenderTarget(previousTarget);
        }
        if (status === gl.FRAMEBUFFER_COMPLETE) return true;
        this.logFramebufferDiagnostic(reason, pass, target, status, level);
        return false;
    }
    logFramebufferDiagnostic(reason, pass, target, status, level) {
        const gl = this.renderer.getContext();
        const colorTexture = 'full' === pass ? target.textures[0] : target.texture;
        const splat0Internal = this.renderTarget.textures[1]?.internalFormat ?? 'none';
        const splat1Internal = this.renderTarget.textures[2]?.internalFormat ?? 'none';
        const gl2 = gl;
        const maxDrawBuffers = gl.getParameter(gl2.MAX_DRAW_BUFFERS);
        const maxColorAttachments = gl.getParameter(gl2.MAX_COLOR_ATTACHMENTS);
        const message = `GSplatWorkBuffer framebuffer incomplete reason=${reason} pass=${pass} size=${target.width}x${target.height} colorFormat=${colorTexture.format} colorType=${colorTexture.type} colorInternal=${colorTexture.internalFormat ?? 'default'} splat0Internal=${splat0Internal} splat1Internal=${splat1Internal} isWebGL2=${this._isWebGL2} extColorBufferFloat=${this._hasColorBufferFloat} extColorBufferHalfFloat=${this._hasColorBufferHalfFloat} maxDrawBuffers=${maxDrawBuffers} maxColorAttachments=${maxColorAttachments} framebufferStatus=${status}`;
        if ('warn' === level) log.warn(message);
        else log.error(message);
    }
    createTexture(name, formatConfig, width, height) {
        let data;
        const pixelCount = width * height;
        if (formatConfig.type === __WEBPACK_EXTERNAL_MODULE_three__.HalfFloatType) data = new Uint16Array(4 * pixelCount);
        else if (formatConfig.type === __WEBPACK_EXTERNAL_MODULE_three__.UnsignedByteType) data = new Uint8Array(4 * pixelCount);
        else if (formatConfig.type === __WEBPACK_EXTERNAL_MODULE_three__.UnsignedIntType) {
            const channels = formatConfig.format === __WEBPACK_EXTERNAL_MODULE_three__.RGBAIntegerFormat ? 4 : formatConfig.format === __WEBPACK_EXTERNAL_MODULE_three__.RGIntegerFormat ? 2 : 1;
            data = new Uint32Array(pixelCount * channels);
        } else data = new Float32Array(4 * pixelCount);
        const texture = new __WEBPACK_EXTERNAL_MODULE_three__.DataTexture(data, width, height, formatConfig.format, formatConfig.type);
        texture.name = name;
        texture.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        texture.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        texture.wrapS = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
        texture.wrapT = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
        texture.generateMipmaps = false;
        if (formatConfig.internalFormat) texture.internalFormat = formatConfig.internalFormat;
        else if (formatConfig.type === __WEBPACK_EXTERNAL_MODULE_three__.UnsignedIntType) {
            if (formatConfig.format === __WEBPACK_EXTERNAL_MODULE_three__.RGBAIntegerFormat) texture.internalFormat = 'RGBA32UI';
            else if (formatConfig.format === __WEBPACK_EXTERNAL_MODULE_three__.RGIntegerFormat) texture.internalFormat = 'RG32UI';
            else if (formatConfig.format === __WEBPACK_EXTERNAL_MODULE_three__.RedIntegerFormat) texture.internalFormat = 'R32UI';
        } else if (formatConfig.type === __WEBPACK_EXTERNAL_MODULE_three__.HalfFloatType) {
            if (formatConfig.format === __WEBPACK_EXTERNAL_MODULE_three__.RGBAFormat) texture.internalFormat = 'RGBA16F';
        } else if (formatConfig.type === __WEBPACK_EXTERNAL_MODULE_three__.UnsignedByteType) {
            if (formatConfig.format === __WEBPACK_EXTERNAL_MODULE_three__.RGBAFormat) texture.internalFormat = 'RGBA8';
        }
        texture.needsUpdate = true;
        return texture;
    }
    createOrderTexture(name, size) {
        return this.createTexture(name, TEXTURE_FORMATS.ORDER, size, size);
    }
    resizeRenderTargets(newSize) {
        this._textureSize = newSize;
        this.renderTarget.setSize(newSize, newSize);
        if (this.scalarRenderTarget) this.scalarRenderTarget.setSize(newSize, newSize);
        const resizeDiagnosticLevel = this.colorTextureFormat === TEXTURE_FORMATS.COLOR_FALLBACK ? 'error' : 'warn';
        if (this._isWebGL2 && this._renderable && !this.validateRenderTargets('resize', resizeDiagnosticLevel)) {
            if (this.colorTextureFormat !== TEXTURE_FORMATS.COLOR_FALLBACK) {
                log.warn('GSplatWorkBuffer: resize made RGBA16F incomplete, using RGBA8 fallback');
                this.colorTextureFormat = TEXTURE_FORMATS.COLOR_FALLBACK;
                this.renderTarget.dispose();
                this.configureRenderTargetTextures(this.colorTextureFormat);
                this._renderable = this.validateRenderTargets('resize-fallback', 'error');
            } else {
                this._renderable = false;
                log.error('GSplatWorkBuffer: RGBA8 fallback framebuffer incomplete, disabling WorkBuffer');
            }
        }
    }
    ensureStagingOrderTexture(size) {
        let textureRecreated = false;
        if (this.stagingOrderTexture) {
            if (this.stagingOrderTexture.image.width !== size || this.stagingOrderTexture.image.height !== size) {
                this.resizeTexture(this.stagingOrderTexture, size, size);
                textureRecreated = true;
            }
        } else {
            this.stagingOrderTexture = this.createOrderTexture('SplatGlobalOrderStaging', size);
            textureRecreated = true;
        }
        return {
            textureRecreated
        };
    }
    get textureSize() {
        return this._textureSize;
    }
    get renderable() {
        return this._renderable;
    }
    resize(newSize) {
        if (newSize === this._textureSize) return;
        this.abortOrderStaging();
        this.resizeTexture(this.orderTexture, newSize, newSize);
        this.resizeRenderTargets(newSize);
    }
    resizeTexture(texture, width, height) {
        const pixelCount = width * height;
        const oldData = texture.image.data;
        let newData;
        if (oldData instanceof Uint8Array) {
            const channels = texture.format === __WEBPACK_EXTERNAL_MODULE_three__.RGBAFormat ? 4 : 1;
            newData = new Uint8Array(pixelCount * channels);
        } else if (oldData instanceof Uint16Array) {
            const channels = texture.format === __WEBPACK_EXTERNAL_MODULE_three__.RGBAFormat ? 4 : 2;
            newData = new Uint16Array(pixelCount * channels);
        } else if (oldData instanceof Uint32Array) {
            const channels = texture.format === __WEBPACK_EXTERNAL_MODULE_three__.RGBAIntegerFormat ? 4 : texture.format === __WEBPACK_EXTERNAL_MODULE_three__.RGIntegerFormat ? 2 : 1;
            newData = new Uint32Array(pixelCount * channels);
        } else newData = new Float32Array(4 * pixelCount);
        texture.dispose();
        texture.image = {
            data: newData,
            width: width,
            height: height
        };
        texture.version = 0;
        texture.needsUpdate = true;
    }
    render(splats, cameraNode, colorsByLod) {
        if (!this._renderable) return;
        if (this.renderPass.update(splats, cameraNode, colorsByLod)) this.renderPass.render();
    }
    renderColor(splats, cameraNode, colorsByLod) {
        if (!this._renderable) return;
        if (this.colorRenderPass.update(splats, cameraNode, colorsByLod)) this.colorRenderPass.render();
    }
    setOrderData(orderData) {
        const expectedSize = this._textureSize * this._textureSize;
        let textureSizeChanged = false;
        let textureRecreated = false;
        if (orderData.length > expectedSize) {
            const requiredSize = Math.ceil(Math.sqrt(orderData.length));
            this.resize(requiredSize);
            textureSizeChanged = true;
            textureRecreated = true;
        }
        const texWidth = this.orderTexture.image.width;
        const texHeight = this.orderTexture.image.height;
        const texelCount = texWidth * texHeight;
        const existingDataLen = this.orderTexture.image.data?.length ?? 0;
        if (existingDataLen !== texelCount) {
            this.orderTexture.dispose();
            this.orderTexture.image.data = new Uint32Array(texelCount);
            this.orderTexture.version = 0;
            textureRecreated = true;
        }
        if (orderData.length > texelCount) log.error(`[GSplatWorkBuffer] orderData length overflow length=${orderData.length} texelCount=${texelCount}, will clamp`);
        const targetData = this.orderTexture.image.data;
        const copyLen = Math.min(orderData.length, texelCount);
        targetData.set(orderData.subarray(0, copyLen));
        if (copyLen < texelCount) targetData.fill(0, copyLen);
        this.orderTexture.image.width = texWidth;
        this.orderTexture.image.height = texHeight;
        const extRenderer = this.renderer;
        const properties = extRenderer.properties?.get(this.orderTexture);
        if (properties?.__webglTexture) {
            const currentVersion = this.orderTexture.version;
            if (0 === currentVersion) {
                this.orderTexture.dispose();
                textureRecreated = true;
            }
        }
        const beforeUploadVersion = this.orderTexture.version;
        try {
            this.uploadStream.uploadRegion(targetData, this.orderTexture, {
                sourceOffset: 0,
                targetOffset: 0,
                size: texelCount
            });
            if (this.orderTexture.version <= beforeUploadVersion) this.orderTexture.needsUpdate = true;
        } catch (error) {
            this.orderTexture.needsUpdate = true;
            log.warn('[GSplatWorkBuffer] Failed to stream order texture upload; falling back to Three texture upload: ' + (error instanceof Error ? error.message : String(error)));
        }
        return {
            synchronousCopy: true,
            conservativeCopy: false,
            copiedBytes: copyLen * Uint32Array.BYTES_PER_ELEMENT,
            textureRecreated,
            textureSizeChanged,
            mode: 'full'
        };
    }
    beginOrderStaging(orderData, options) {
        this.abortOrderStaging();
        const textureSize = Math.max(1, Math.floor(options.textureSize));
        this.ensureStagingOrderTexture(textureSize);
        const texelCount = textureSize * textureSize;
        const visibleCount = Math.min(texelCount, Math.max(0, Math.floor(options.visibleCount)));
        const validElements = Math.min(visibleCount, orderData.length);
        const totalUploadElements = 0 === validElements ? 0 : Math.min(texelCount, Math.ceil(validElements / textureSize) * textureSize);
        this.orderStagingJob = {
            generation: Math.max(0, Math.floor(options.generation)),
            textureSize,
            visibleCount,
            orderData,
            totalUploadElements,
            uploadedElements: 0,
            submittedBytes: 0,
            submittedChunks: 0
        };
        return this.getOrderStagingInfo();
    }
    advanceOrderStaging(options) {
        const job = this.orderStagingJob;
        if (!job) return {
            completed: true,
            submittedBytes: 0,
            submittedChunks: 0,
            remainingBytes: 0,
            remainingChunks: 0,
            blockedReason: null,
            minRowBudgetOverride: false,
            fallbackToFullUpload: false,
            fallbackReason: null
        };
        const width = job.textureSize;
        const rowBytes = width * Uint32Array.BYTES_PER_ELEMENT;
        const maxChunks = Math.floor(options.maxChunksPerFrame);
        const maxBytes = options.maxBytesPerFrame;
        if (0 === job.totalUploadElements) return this.createAdvanceResult(job, 0, 0, null, false, false, null);
        if (maxChunks <= 0 || 'number' != typeof maxBytes || Number.isNaN(maxBytes) || !Number.isFinite(maxBytes) && maxBytes !== Number.POSITIVE_INFINITY) return this.createAdvanceResult(job, 0, 0, 'invalid-budget', false, true, 'invalid-budget');
        if (maxBytes <= 0) return this.createAdvanceResult(job, 0, 0, 'invalid-budget', false, true, 'invalid-budget');
        let submittedBytes = 0;
        let submittedChunks = 0;
        let blockedReason = null;
        let minRowBudgetOverride = false;
        while(job.uploadedElements < job.totalUploadElements && submittedChunks < maxChunks){
            const remainingElements = job.totalUploadElements - job.uploadedElements;
            const remainingRows = Math.ceil(remainingElements / width);
            const remainingBudget = maxBytes === Number.POSITIVE_INFINITY ? Number.POSITIVE_INFINITY : maxBytes - submittedBytes;
            if (remainingBudget < rowBytes) {
                if (submittedChunks > 0) {
                    blockedReason = 'byte-budget';
                    break;
                }
                minRowBudgetOverride = true;
            }
            const forceOneRow = remainingBudget < rowBytes;
            const budgetRows = remainingBudget === Number.POSITIVE_INFINITY ? remainingRows : forceOneRow ? 1 : Math.max(1, Math.floor(remainingBudget / rowBytes));
            const rowsToUpload = Math.max(1, Math.min(remainingRows, budgetRows));
            const chunkElements = rowsToUpload * width;
            const targetOffset = job.uploadedElements;
            try {
                this.uploadOrderStagingChunk(job, targetOffset, chunkElements);
            } catch (error) {
                const reason = error instanceof Error ? error.message : 'upload-error';
                return this.createAdvanceResult(job, submittedBytes, submittedChunks, null, minRowBudgetOverride, true, reason);
            }
            const chunkBytes = chunkElements * Uint32Array.BYTES_PER_ELEMENT;
            job.uploadedElements += chunkElements;
            job.submittedBytes += chunkBytes;
            job.submittedChunks++;
            submittedBytes += chunkBytes;
            submittedChunks++;
        }
        if (job.uploadedElements < job.totalUploadElements && submittedChunks >= maxChunks) blockedReason = 'chunk-budget';
        return this.createAdvanceResult(job, submittedBytes, submittedChunks, blockedReason, minRowBudgetOverride, false, null);
    }
    uploadOrderStagingChunk(job, targetOffset, chunkElements) {
        const stagingTexture = this.stagingOrderTexture;
        if (!stagingTexture) throw new Error('Missing staging order texture');
        const stagingData = stagingTexture.image.data;
        const sourceEnd = Math.min(job.orderData.length, targetOffset + chunkElements);
        const sourceCount = Math.max(0, sourceEnd - targetOffset);
        if (sourceCount === chunkElements) {
            stagingData.set(job.orderData.subarray(targetOffset, targetOffset + chunkElements), targetOffset);
            this.uploadStream.uploadRegion(job.orderData, stagingTexture, {
                sourceOffset: targetOffset,
                targetOffset,
                size: chunkElements
            });
            return;
        }
        const scratch = new Uint32Array(chunkElements);
        if (sourceCount > 0) {
            scratch.set(job.orderData.subarray(targetOffset, sourceEnd));
            stagingData.set(job.orderData.subarray(targetOffset, sourceEnd), targetOffset);
        }
        if (sourceCount < chunkElements) stagingData.fill(0, targetOffset + sourceCount, targetOffset + chunkElements);
        this.uploadStream.uploadRegion(scratch, stagingTexture, {
            sourceOffset: 0,
            targetOffset,
            size: chunkElements
        });
    }
    createAdvanceResult(job, submittedBytes, submittedChunks, blockedReason, minRowBudgetOverride, fallbackToFullUpload, fallbackReason) {
        const remainingElements = Math.max(0, job.totalUploadElements - job.uploadedElements);
        return {
            completed: 0 === remainingElements,
            submittedBytes,
            submittedChunks,
            remainingBytes: remainingElements * Uint32Array.BYTES_PER_ELEMENT,
            remainingChunks: Math.ceil(remainingElements / job.textureSize),
            blockedReason,
            minRowBudgetOverride,
            fallbackToFullUpload,
            fallbackReason
        };
    }
    commitOrderStaging() {
        const job = this.orderStagingJob;
        const stagingTexture = this.stagingOrderTexture;
        if (!job || !stagingTexture) throw new Error('No staging order upload job to commit');
        if (job.uploadedElements < job.totalUploadElements) throw new Error('Cannot commit incomplete staging order upload');
        const textureSizeChanged = job.textureSize !== this._textureSize;
        const previousActive = this.orderTexture;
        this.orderTexture = stagingTexture;
        this.stagingOrderTexture = previousActive;
        this.orderStagingJob = null;
        if (textureSizeChanged) this.resizeRenderTargets(job.textureSize);
        return {
            synchronousCopy: false,
            conservativeCopy: false,
            copiedBytes: job.submittedBytes,
            textureRecreated: true,
            textureSizeChanged,
            mode: 'chunked'
        };
    }
    abortOrderStaging() {
        this.orderStagingJob = null;
    }
    getOrderStagingInfo() {
        const job = this.orderStagingJob;
        if (!job) return null;
        const remainingElements = Math.max(0, job.totalUploadElements - job.uploadedElements);
        return {
            generation: job.generation,
            textureSize: job.textureSize,
            visibleCount: job.visibleCount,
            totalBytes: job.totalUploadElements * Uint32Array.BYTES_PER_ELEMENT,
            submittedBytes: job.submittedBytes,
            remainingBytes: remainingElements * Uint32Array.BYTES_PER_ELEMENT,
            submittedChunks: job.submittedChunks,
            remainingChunks: Math.ceil(remainingElements / job.textureSize),
            uploadedElements: job.uploadedElements,
            totalUploadElements: job.totalUploadElements
        };
    }
    destroy() {
        this.renderPass.destroy();
        this.colorRenderPass.destroy();
        if (this.scalarRenderPass) {
            this.scalarRenderPass.destroy();
            this.scalarRenderPass = null;
        }
        for (const renderInfo of this.renderInfoCache.values())renderInfo.destroy();
        this.renderInfoCache.clear();
        this.colorTexture.dispose();
        this.splatTexture0.dispose();
        this.splatTexture1.dispose();
        this.disposeCpuBackedDataTexture(this.orderTexture);
        if (this.stagingOrderTexture && this.stagingOrderTexture !== this.orderTexture) this.disposeCpuBackedDataTexture(this.stagingOrderTexture);
        this.stagingOrderTexture = null;
        this.orderStagingJob = null;
        if (this.scalarTexture) {
            this.scalarTexture.dispose();
            this.scalarTexture = null;
        }
        if (this.scalarRenderTarget) {
            this.scalarRenderTarget.dispose();
            this.scalarRenderTarget = null;
        }
        if (this.mergedStateTexture) {
            this.disposeCpuBackedDataTexture(this.mergedStateTexture);
            this.mergedStateTexture = null;
        }
        this.renderTarget.dispose();
        this.uploadStream.destroy();
    }
    disposeCpuBackedDataTexture(texture) {
        try {
            texture.dispose();
        } finally{
            const baseTexture = texture;
            baseTexture.image = null;
        }
    }
    getWorkBufferRenderInfo(hasIntervals, passMode, shBands, isSogs = false, modifier = null) {
        const modifierHash = modifier?.hash ?? 0;
        const key = `${passMode}_${shBands}_${isSogs}_${modifierHash}`;
        let renderInfo = this.renderInfoCache.get(key);
        if (!renderInfo) {
            renderInfo = new WorkBufferRenderInfo(this.renderer, hasIntervals, this.colorTextureFormat, passMode, shBands, isSogs, modifier);
            this.renderInfoCache.set(key, renderInfo);
        }
        return renderInfo;
    }
    prewarmRenderInfo(passMode, shBands, isSogs = false, modifier = null) {
        const renderInfo = this.getWorkBufferRenderInfo(false, passMode, shBands, isSogs, modifier);
        renderInfo.precompile(this.renderer);
    }
    setScalarMode(mode) {
        if (this._scalarMode === mode) return;
        this._scalarMode = mode;
        if (0 === mode) {
            this._scalarDirty = false;
            return;
        }
        this.ensureScalarResources();
        this._scalarDirty = null !== this.scalarRenderTarget;
    }
    markScalarDirty() {
        if (0 !== this._scalarMode && this.scalarFilteringSupported) this._scalarDirty = true;
    }
    get scalarVersion() {
        return this._scalarVersion;
    }
    get scalarTextureReady() {
        return null !== this.scalarTexture && this._scalarVersion > 0;
    }
    get supportsScalarFiltering() {
        return this.scalarFilteringSupported;
    }
    ensureScalarResources() {
        if (this.scalarRenderTarget) return;
        if (!this.scalarFilteringSupported) {
            if (!this.warnedScalarFilteringUnsupported) {
                log.warn('GSplatWorkBuffer: scalar filtering requires WebGL2 with EXT_color_buffer_float support');
                this.warnedScalarFilteringUnsupported = true;
            }
            return;
        }
        const size = this._textureSize;
        this.scalarRenderTarget = new __WEBPACK_EXTERNAL_MODULE_three__.WebGLRenderTarget(size, size, {
            depthBuffer: false,
            stencilBuffer: false
        });
        this.scalarRenderTarget.texture.format = __WEBPACK_EXTERNAL_MODULE_three__.RedFormat;
        this.scalarRenderTarget.texture.type = __WEBPACK_EXTERNAL_MODULE_three__.FloatType;
        this.scalarRenderTarget.texture.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        this.scalarRenderTarget.texture.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        this.scalarRenderTarget.texture.internalFormat = 'R32F';
        this.scalarRenderTarget.texture.name = 'splatScalar';
        this.scalarTexture = this.scalarRenderTarget.texture;
        this.scalarRenderPass = new __WEBPACK_EXTERNAL_MODULE__GSplatWorkBufferRenderPass_js_d7e0d8b7__.GSplatWorkBufferRenderPass(this.renderer, this, 'scalarOnly');
    }
    renderScalar(splats, cameraNode) {
        if (!this._renderable) return;
        if (0 === this._scalarMode || !this._scalarDirty) return;
        if (!this.scalarRenderPass) return;
        if (!this.scalarRenderPass.update(splats, cameraNode)) return;
        this.scalarRenderPass.render();
        this._scalarDirty = false;
        this._scalarVersion++;
    }
    get scalarMode() {
        return this._scalarMode;
    }
    mergeStateTextures(splats) {
        const hasAnyState = splats.some((splat)=>null !== splat.stateData);
        if (!hasAnyState) {
            if (this.mergedStateTexture) {
                this.mergedStateTexture.dispose();
                this.mergedStateTexture = null;
            }
            return null;
        }
        const texSize = this._textureSize;
        const totalPixels = texSize * texSize;
        if (!this.mergedStateTexture || this.mergedStateTexture.image.width !== texSize) {
            if (this.mergedStateTexture) this.mergedStateTexture.dispose();
            const stateData = new Uint8Array(totalPixels);
            this.mergedStateTexture = new __WEBPACK_EXTERNAL_MODULE_three__.DataTexture(stateData, texSize, texSize, __WEBPACK_EXTERNAL_MODULE_three__.RedFormat, __WEBPACK_EXTERNAL_MODULE_three__.UnsignedByteType);
            this.mergedStateTexture.name = 'mergedSplatState';
            this.mergedStateTexture.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
            this.mergedStateTexture.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
            this.mergedStateTexture.wrapS = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
            this.mergedStateTexture.wrapT = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
            this.mergedStateTexture.generateMipmaps = false;
            this.mergedStateTexture.internalFormat = 'R8';
        }
        const mergedData = this.mergedStateTexture.image.data;
        mergedData.fill(0);
        for (const splat of splats){
            const stateData = splat.stateData;
            if (!stateData) continue;
            const startOffset = splat.lineStart * texSize;
            const activeSplats = splat.activeSplats;
            const copyLength = Math.min(stateData.length, activeSplats, totalPixels - startOffset);
            if (copyLength > 0 && startOffset >= 0 && startOffset < totalPixels) {
                if (0 === splat.intervals.length) for(let i = 0; i < copyLength; i++)mergedData[startOffset + i] = stateData[i];
                else {
                    let destIdx = 0;
                    for(let i = 0; i < splat.intervals.length; i += 2){
                        const intervalStart = splat.intervals[i];
                        const intervalEnd = splat.intervals[i + 1];
                        for(let srcIdx = intervalStart; srcIdx < intervalEnd && destIdx < copyLength; srcIdx++, destIdx++)if (srcIdx < stateData.length) mergedData[startOffset + destIdx] = stateData[srcIdx];
                    }
                }
            }
        }
        this.mergedStateTexture.needsUpdate = true;
        return this.mergedStateTexture;
    }
}
export { GSplatWorkBuffer_rslib_entry_GSplatScalarMode as GSplatScalarMode, GSplatWorkBuffer };
