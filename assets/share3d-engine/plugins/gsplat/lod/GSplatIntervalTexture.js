import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shaders_gsplatIntervalTexture_glsl_js_2b7c0cf7__ from "../shaders/gsplatIntervalTexture.glsl.js";
import * as __WEBPACK_EXTERNAL_MODULE__QuadRender_js_74a70adf__ from "./QuadRender.js";
class GSplatIntervalTexture {
    constructor(textureSize, splats){
        this.lineStarts = [];
        this.padding = [];
        this.intervals = [];
        this.textureSize = textureSize;
        this.calculateLayout(splats);
    }
    calculateLayout(splats) {
        this.lineStarts = [];
        this.padding = [];
        this.intervals = [];
        for (const splat of splats){
            this.lineStarts.push(splat.lineStart);
            this.padding.push(splat.padding);
            const splatIntervals = [];
            for(let i = 0; i < splat.intervals.length; i += 2)splatIntervals.push({
                start: splat.intervals[i],
                end: splat.intervals[i + 1]
            });
            this.intervals.push(splatIntervals);
        }
    }
    getFlatIntervals() {
        const flat = [];
        for (const splatIntervals of this.intervals)for (const { start, end } of splatIntervals)flat.push(start, end);
        return new Float32Array(flat);
    }
    getTotalIntervalPixels() {
        let total = 0;
        for (const splatIntervals of this.intervals)for (const { start, end } of splatIntervals)total += end - start;
        return total;
    }
    getIntervalCount(splatIndex) {
        return this.intervals[splatIndex]?.length ?? 0;
    }
    destroy() {
        this.lineStarts.length = 0;
        this.padding.length = 0;
        this.intervals.length = 0;
    }
}
class GSplatIntervalTextureGPU {
    constructor(renderer){
        this.texture = null;
        this.renderTarget = null;
        this.intervalsDataTexture = null;
        this.material = null;
        this.quadRender = null;
        this.useIntegerTextures = true;
        this.renderer = renderer;
        const gl = renderer.getContext();
        this.useIntegerTextures = gl instanceof WebGL2RenderingContext || null !== gl.getExtension('EXT_color_buffer_float');
    }
    destroy() {
        this.texture?.dispose();
        this.texture = null;
        this.renderTarget?.dispose();
        this.renderTarget = null;
        this.intervalsDataTexture?.dispose();
        this.intervalsDataTexture = null;
        this.quadRender?.dispose();
        this.quadRender = null;
        this.material?.dispose();
        this.material = null;
    }
    getMaterial() {
        if (!this.material) this.material = new __WEBPACK_EXTERNAL_MODULE_three__.ShaderMaterial({
            uniforms: {
                uIntervalsTexture: {
                    value: null
                },
                uNumIntervals: {
                    value: 0
                },
                uTextureWidth: {
                    value: 0
                },
                uActiveSplats: {
                    value: 0
                }
            },
            vertexShader: __WEBPACK_EXTERNAL_MODULE__shaders_gsplatIntervalTexture_glsl_js_2b7c0cf7__.vertexShader,
            fragmentShader: this.useIntegerTextures ? __WEBPACK_EXTERNAL_MODULE__shaders_gsplatIntervalTexture_glsl_js_2b7c0cf7__.fragmentShader : __WEBPACK_EXTERNAL_MODULE__shaders_gsplatIntervalTexture_glsl_js_2b7c0cf7__.fragmentShaderFloat,
            depthTest: false,
            depthWrite: false,
            blending: __WEBPACK_EXTERNAL_MODULE_three__.NoBlending,
            ...this.useIntegerTextures && {
                glslVersion: __WEBPACK_EXTERNAL_MODULE_three__.GLSL3
            }
        });
        return this.material;
    }
    update(intervals, totalIntervalSplats) {
        if (0 === totalIntervalSplats || 0 === intervals.length) {
            this.destroy();
            return 0;
        }
        const maxTextureSize = this.renderer.capabilities.maxTextureSize;
        let textureWidth = Math.ceil(Math.sqrt(totalIntervalSplats));
        textureWidth = Math.min(textureWidth, maxTextureSize);
        const textureHeight = Math.ceil(totalIntervalSplats / textureWidth);
        this.texture?.dispose();
        this.renderTarget?.dispose();
        this.intervalsDataTexture?.dispose();
        if (this.useIntegerTextures) {
            this.texture = new __WEBPACK_EXTERNAL_MODULE_three__.DataTexture(new Uint32Array(textureWidth * textureHeight), textureWidth, textureHeight, __WEBPACK_EXTERNAL_MODULE_three__.RedIntegerFormat, __WEBPACK_EXTERNAL_MODULE_three__.UnsignedIntType);
            this.texture.internalFormat = 'R32UI';
        } else this.texture = new __WEBPACK_EXTERNAL_MODULE_three__.DataTexture(new Float32Array(textureWidth * textureHeight), textureWidth, textureHeight, __WEBPACK_EXTERNAL_MODULE_three__.RedFormat, __WEBPACK_EXTERNAL_MODULE_three__.FloatType);
        this.texture.name = 'GSplatIntervalTexture';
        this.texture.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        this.texture.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        this.texture.generateMipmaps = false;
        this.renderTarget = new __WEBPACK_EXTERNAL_MODULE_three__.WebGLRenderTarget(textureWidth, textureHeight, {
            minFilter: __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter,
            magFilter: __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter,
            format: this.useIntegerTextures ? __WEBPACK_EXTERNAL_MODULE_three__.RedIntegerFormat : __WEBPACK_EXTERNAL_MODULE_three__.RedFormat,
            type: this.useIntegerTextures ? __WEBPACK_EXTERNAL_MODULE_three__.UnsignedIntType : __WEBPACK_EXTERNAL_MODULE_three__.FloatType,
            depthBuffer: false,
            stencilBuffer: false
        });
        if (this.useIntegerTextures && this.renderTarget.texture) this.renderTarget.texture.internalFormat = 'R32UI';
        const numIntervals = intervals.length / 2;
        const dataTextureSize = Math.ceil(Math.sqrt(numIntervals));
        if (this.useIntegerTextures) {
            const intervalsData = new Uint32Array(dataTextureSize * dataTextureSize * 2);
            let runningSum = 0;
            for(let i = 0; i < numIntervals; i++){
                const start = intervals[2 * i];
                const end = intervals[2 * i + 1];
                const intervalSize = end - start;
                runningSum += intervalSize;
                intervalsData[2 * i] = start;
                intervalsData[2 * i + 1] = runningSum;
            }
            this.intervalsDataTexture = new __WEBPACK_EXTERNAL_MODULE_three__.DataTexture(intervalsData, dataTextureSize, dataTextureSize, __WEBPACK_EXTERNAL_MODULE_three__.RGIntegerFormat, __WEBPACK_EXTERNAL_MODULE_three__.UnsignedIntType);
            this.intervalsDataTexture.internalFormat = 'RG32UI';
        } else {
            const intervalsData = new Float32Array(dataTextureSize * dataTextureSize * 2);
            let runningSum = 0;
            for(let i = 0; i < numIntervals; i++){
                const start = intervals[2 * i];
                const end = intervals[2 * i + 1];
                const intervalSize = end - start;
                runningSum += intervalSize;
                intervalsData[2 * i] = start;
                intervalsData[2 * i + 1] = runningSum;
            }
            this.intervalsDataTexture = new __WEBPACK_EXTERNAL_MODULE_three__.DataTexture(intervalsData, dataTextureSize, dataTextureSize, __WEBPACK_EXTERNAL_MODULE_three__.RGFormat, __WEBPACK_EXTERNAL_MODULE_three__.FloatType);
        }
        this.intervalsDataTexture.name = 'GSplatIntervalsData';
        this.intervalsDataTexture.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        this.intervalsDataTexture.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        this.intervalsDataTexture.generateMipmaps = false;
        this.intervalsDataTexture.needsUpdate = true;
        const material = this.getMaterial();
        material.uniforms.uIntervalsTexture.value = this.intervalsDataTexture;
        material.uniforms.uNumIntervals.value = numIntervals;
        material.uniforms.uTextureWidth.value = textureWidth;
        material.uniforms.uActiveSplats.value = totalIntervalSplats;
        if (!this.quadRender) this.quadRender = new __WEBPACK_EXTERNAL_MODULE__QuadRender_js_74a70adf__.QuadRender(material);
        const currentRenderTarget = this.renderer.getRenderTarget();
        this.renderer.setRenderTarget(this.renderTarget);
        if (this.useIntegerTextures) {
            const gl = this.renderer.getContext();
            if (gl instanceof WebGL2RenderingContext) gl.clearBufferuiv(gl.COLOR, 0, new Uint32Array([
                0,
                0,
                0,
                0
            ]));
        } else this.renderer.clear();
        this.quadRender.render(this.renderer);
        this.renderer.setRenderTarget(currentRenderTarget);
        this.texture = this.renderTarget.texture;
        return totalIntervalSplats;
    }
    getTexture() {
        return this.renderTarget?.texture ?? this.texture;
    }
}
export { GSplatIntervalTexture, GSplatIntervalTextureGPU };
