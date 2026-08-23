import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__core_ColorSpaceConstants_js_789f0287__ from "../core/ColorSpaceConstants.js";
import * as __WEBPACK_EXTERNAL_MODULE__core_gsplatBatching_js_2c6b5696__ from "../core/gsplatBatching.js";
import * as __WEBPACK_EXTERNAL_MODULE__shaders_gsplat_chunks_js_c6e8d193__ from "../shaders/gsplat-chunks.js";
import * as __WEBPACK_EXTERNAL_MODULE__shaders_gsplatModifyChunk_js_2bdd6f97__ from "../shaders/gsplatModifyChunk.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_BlueNoiseTexture_js_bd271e77__ from "../utils/BlueNoiseTexture.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('gsplat:material');
(0, __WEBPACK_EXTERNAL_MODULE__shaders_gsplat_chunks_js_c6e8d193__.registerGSplatChunks)();
var GaussianSplatMaterial_rslib_entry_GSplatRenderMode = /*#__PURE__*/ function(GSplatRenderMode) {
    GSplatRenderMode[GSplatRenderMode["DEFAULT"] = 0] = "DEFAULT";
    GSplatRenderMode[GSplatRenderMode["POINTS"] = 1] = "POINTS";
    GSplatRenderMode[GSplatRenderMode["FLAT"] = 2] = "FLAT";
    GSplatRenderMode[GSplatRenderMode["DEPTH"] = 3] = "DEPTH";
    GSplatRenderMode[GSplatRenderMode["OPACITY"] = 4] = "OPACITY";
    GSplatRenderMode[GSplatRenderMode["SCALE"] = 5] = "SCALE";
    GSplatRenderMode[GSplatRenderMode["NORMAL"] = 6] = "NORMAL";
    return GSplatRenderMode;
}({});
class GaussianSplatMaterial extends __WEBPACK_EXTERNAL_MODULE_three__.ShaderMaterial {
    constructor(options = {}){
        const { depthWrite = false, depthTest = true, transparent = true, enableSH = true, maxSHBands = 3, useLogDepth = false, useHalfPrecision = false, clipping = false, enableAA = false, dither = 'none', webgpu = false, pass = 'default', alphaClip = 0.3, minPixelSize = 2.0, enableOverdraw = false, gammaMode = 'auto', toneMapping = __WEBPACK_EXTERNAL_MODULE__core_ColorSpaceConstants_js_789f0287__.ToneMappingMode.NONE, exposure = 1.0 } = options;
        if (webgpu) log.warn('[GaussianSplatMaterial] WebGPU 已禁用（WebGL2-only），将忽略 webgpu 配置');
        const { vertexShader, fragmentShader } = (0, __WEBPACK_EXTERNAL_MODULE__shaders_gsplat_chunks_js_c6e8d193__.assembleGSplatShaders)();
        super({
            vertexShader,
            fragmentShader,
            glslVersion: __WEBPACK_EXTERNAL_MODULE_three__.GLSL3,
            uniforms: {
                viewport: {
                    value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(1920, 1080)
                },
                viewport_size: {
                    value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector4(1920, 1080, 1 / 1920, 1 / 1080)
                },
                camera_params: {
                    value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector4(0.01, 100, 0.1, 0)
                },
                cameraPositionHigh: {
                    value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector3()
                },
                cameraPositionLow: {
                    value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector3()
                },
                originToCameraHigh: {
                    value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector3()
                },
                originToCameraLow: {
                    value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector3()
                },
                transformA: {
                    value: null
                },
                transformB: {
                    value: null
                },
                splatColor: {
                    value: null
                },
                splatOrder: {
                    value: null
                },
                numSplats: {
                    value: 0
                },
                dataWidth: {
                    value: 0
                },
                orderWidth: {
                    value: 0
                },
                renderMode: {
                    value: 0
                },
                depthRange: {
                    value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(0.1, 100)
                },
                splatSH_1to3: {
                    value: null
                },
                splatSH_4to7: {
                    value: null
                },
                splatSH_8to11: {
                    value: null
                },
                splatSH_12to15: {
                    value: null
                },
                shBands: {
                    value: 0
                },
                splatMeansLow: {
                    value: null
                },
                splatMeansHigh: {
                    value: null
                },
                splatQuats: {
                    value: null
                },
                splatScales: {
                    value: null
                },
                splatSH0: {
                    value: null
                },
                sogsMeans_mins: {
                    value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector3()
                },
                sogsMeans_maxs: {
                    value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector3()
                },
                sogsScales_mins: {
                    value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector3()
                },
                sogsScales_maxs: {
                    value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector3()
                },
                sogsSH0_mins: {
                    value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector4()
                },
                sogsSH0_maxs: {
                    value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector4()
                },
                sogsScalesCodebook: {
                    value: null
                },
                sogsSH0Codebook: {
                    value: null
                },
                packedShN: {
                    value: null
                },
                sogsSH_labels: {
                    value: null
                },
                sogsSHN_mins: {
                    value: 0.0
                },
                sogsSHN_maxs: {
                    value: 0.0
                },
                sh_result: {
                    value: null
                },
                sh_labels: {
                    value: null
                },
                shN_mins: {
                    value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector4()
                },
                shN_maxs: {
                    value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector4()
                },
                pickId: {
                    value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector4(0, 0, 0, 1)
                },
                alphaClip: {
                    value: alphaClip
                },
                minPixelSize: {
                    value: minPixelSize
                },
                blueNoiseTexture: {
                    value: null
                },
                blueNoiseJitter: {
                    value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(0, 0)
                },
                exposure: {
                    value: exposure
                },
                colorBrightness: {
                    value: 0.0
                },
                colorTemperature: {
                    value: 0.0
                },
                colorContrast: {
                    value: 1.0
                },
                colorSaturation: {
                    value: 1.0
                },
                colorOpacity: {
                    value: 1.0
                },
                splatScalar: {
                    value: null
                },
                scalarFilterEnabled: {
                    value: false
                },
                scalarFilterRange: {
                    value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(0, 1)
                }
            },
            transparent,
            depthWrite,
            depthTest,
            blending: __WEBPACK_EXTERNAL_MODULE_three__.CustomBlending,
            blendEquation: __WEBPACK_EXTERNAL_MODULE_three__.AddEquation,
            blendSrc: __WEBPACK_EXTERNAL_MODULE_three__.OneFactor,
            blendDst: __WEBPACK_EXTERNAL_MODULE_three__.OneMinusSrcAlphaFactor,
            blendSrcAlpha: __WEBPACK_EXTERNAL_MODULE_three__.OneFactor,
            blendDstAlpha: __WEBPACK_EXTERNAL_MODULE_three__.OneMinusSrcAlphaFactor,
            side: __WEBPACK_EXTERNAL_MODULE_three__.DoubleSide
        }), this._gammaMode = 'auto', this._toneMapping = __WEBPACK_EXTERNAL_MODULE__core_ColorSpaceConstants_js_789f0287__.ToneMappingMode.NONE, this._shaderEffect = null, this._shaderEffectActive = false, this._workBufferModifier = null, this._shaderEffectUniformBackup = new Map(), this._shaderEffectDefineBackup = new Map(), this._blueNoiseTexture = null;
        this.defines = this.defines || {};
        this.defines.GSPLAT_INSTANCE_SIZE = __WEBPACK_EXTERNAL_MODULE__core_gsplatBatching_js_2c6b5696__.GSPLAT_INSTANCE_SIZE;
        if (enableSH && maxSHBands > 0) this.defines.SH_BANDS = Math.min(maxSHBands, 3);
        if (useLogDepth) {
            this.defines.USE_LOGDEPTHBUF = '';
            this.defines.USE_LOGDEPTHBUF_EXT = '';
        }
        if (useHalfPrecision) this.defines.USE_HALF_PRECISION = '';
        if (enableAA) this.defines.GSPLAT_AA = 1;
        if (enableOverdraw) {
            this.defines.GSPLAT_OVERDRAW = 1;
            this.blending = __WEBPACK_EXTERNAL_MODULE_three__.AdditiveBlending;
            this.depthWrite = false;
            this.transparent = true;
        }
        if ('none' === dither) this.defines.DITHER_NONE = 1;
        else if ('bayer8' === dither) {
            this.defines.DITHER_BAYER8 = 1;
            this.depthWrite = true;
            this.blending = __WEBPACK_EXTERNAL_MODULE_three__.NoBlending;
            this.transparent = false;
        } else if ('bluenoise' === dither) {
            this.defines.DITHER_BLUENOISE = 1;
            this.depthWrite = true;
            this.blending = __WEBPACK_EXTERNAL_MODULE_three__.NoBlending;
            this.transparent = false;
            this._blueNoiseTexture = (0, __WEBPACK_EXTERNAL_MODULE__utils_BlueNoiseTexture_js_bd271e77__.createBlueNoiseTexture)();
            this.uniforms.blueNoiseTexture.value = this._blueNoiseTexture;
        }
        if ('pick' === pass) this.defines.PICK_PASS = 1;
        else if ('shadow' === pass) this.defines.SHADOW_PASS = 1;
        else if ('prepass' === pass) this.defines.PREPASS_PASS = 1;
        if ('pick' === pass || 'shadow' === pass || 'prepass' === pass) {
            this.blending = __WEBPACK_EXTERNAL_MODULE_three__.NoBlending;
            this.transparent = false;
            this.toneMapped = false;
            this.depthWrite = true;
        }
        this.clipping = clipping;
        this._gammaMode = gammaMode;
        this._toneMapping = toneMapping;
        this._updateGammaDefines();
        this._updateToneMappingDefines();
        this.name = 'GaussianSplatMaterial';
    }
    setShaderEffect(effect) {
        this._clearShaderEffectState();
        this._shaderEffect = effect;
        this._shaderEffectActive = null !== effect;
        if (effect) {
            this._applyShaderEffectDefines(effect);
            this._applyShaderEffectUniforms(effect);
        }
        this._rebuildShaderEffectSource();
    }
    clearShaderEffect(expectedEffect) {
        if (expectedEffect && this._shaderEffect !== expectedEffect) return;
        this.setShaderEffect(null);
    }
    deactivateShaderEffect(effect) {
        if (this._shaderEffect !== effect) return false;
        for (const [name, uniform] of this._shaderEffectUniformBackup){
            const effectUniform = this.uniforms[name];
            if (void 0 !== uniform && effectUniform) effectUniform.value = uniform.value;
        }
        this._shaderEffectActive = false;
        return true;
    }
    getShaderEffect() {
        return this._shaderEffectActive ? this._shaderEffect : null;
    }
    setWorkBufferModifier(modifier) {
        if (this._workBufferModifier?.hash === modifier?.hash && this._workBufferModifier?.code === modifier?.code) return;
        this._workBufferModifier = modifier;
        this._rebuildShaderEffectSource();
    }
    setShaderEffectUniform(name, value) {
        const uniform = this.uniforms[name];
        if (uniform) {
            if (this._shaderEffect && !this._shaderEffectUniformBackup.has(name)) this._shaderEffectUniformBackup.set(name, {
                ...uniform
            });
            uniform.value = value;
            return true;
        }
        if (!this._shaderEffect) return false;
        if (!this._shaderEffectUniformBackup.has(name)) this._shaderEffectUniformBackup.set(name, void 0);
        this.uniforms[name] = {
            value
        };
        return true;
    }
    setViewport(width, height) {
        this.uniforms.viewport.value.set(width, height);
        this.uniforms.viewport_size.value.set(width, height, 1 / width, 1 / height);
    }
    setCameraParams(camera) {
        if (camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.PerspectiveCamera) this.uniforms.camera_params.value.set(1 / camera.far, camera.far, camera.near, 0);
        else if (camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.OrthographicCamera) this.uniforms.camera_params.value.set(1 / camera.far, camera.far, camera.near, 1);
    }
    setCameraPositionWorld(position) {
        const highX = Math.fround(position.x);
        const highY = Math.fround(position.y);
        const highZ = Math.fround(position.z);
        const lowX = position.x - highX;
        const lowY = position.y - highY;
        const lowZ = position.z - highZ;
        this.uniforms.cameraPositionHigh.value.set(highX, highY, highZ);
        this.uniforms.cameraPositionLow.value.set(lowX, lowY, lowZ);
    }
    setOriginToCamera(sceneOrigin, cameraPosition) {
        const diffX = sceneOrigin.x - cameraPosition.x;
        const diffY = sceneOrigin.y - cameraPosition.y;
        const diffZ = sceneOrigin.z - cameraPosition.z;
        const highX = Math.fround(diffX);
        const highY = Math.fround(diffY);
        const highZ = Math.fround(diffZ);
        this.uniforms.originToCameraHigh.value.set(highX, highY, highZ);
        this.uniforms.originToCameraLow.value.set(diffX - highX, diffY - highY, diffZ - highZ);
    }
    setDataTextures(transformA, transformB, splatColor, splatOrder) {
        this.uniforms.transformA.value = transformA;
        this.uniforms.transformB.value = transformB;
        this.uniforms.splatColor.value = splatColor;
        this.uniforms.splatOrder.value = splatOrder;
    }
    setUnifiedLODTextures(colorTexture, splatTexture0, splatTexture1, orderTexture, textureSize) {
        this.uniforms.splatColor.value = colorTexture;
        this.uniforms.transformA.value = splatTexture0;
        this.uniforms.transformB.value = splatTexture1;
        this.uniforms.splatOrder.value = orderTexture;
        this.uniforms.dataWidth.value = textureSize;
        this.uniforms.orderWidth.value = textureSize;
        let needsUpdate = false;
        if (!this.defines.GSPLAT_WORKBUFFER_DATA) {
            this.defines.GSPLAT_WORKBUFFER_DATA = 1;
            needsUpdate = true;
        }
        const hasSHTextures = !!this.uniforms.splatSH_1to3.value || !!this.uniforms.splatSH_4to7.value || !!this.uniforms.splatSH_8to11.value || !!this.uniforms.splatSH_12to15.value;
        if (!hasSHTextures && 0 !== this.defines.SH_BANDS) {
            this.defines.SH_BANDS = 0;
            this.uniforms.shBands.value = 0;
            this.uniforms.splatSH_1to3.value = null;
            this.uniforms.splatSH_4to7.value = null;
            this.uniforms.splatSH_8to11.value = null;
            this.uniforms.splatSH_12to15.value = null;
            needsUpdate = true;
        }
        if (needsUpdate) this.needsUpdate = true;
    }
    setMetadata(numSplats, dataWidth, orderWidth) {
        this.uniforms.numSplats.value = numSplats;
        this.uniforms.dataWidth.value = dataWidth;
        this.uniforms.orderWidth.value = orderWidth;
    }
    setRenderMode(mode) {
        this.uniforms.renderMode.value = mode;
        const needsDebugVaryings = 3 === mode || 5 === mode || 6 === mode;
        const hasDebugVaryings = 'GSPLAT_DEBUG_VARYINGS' in this.defines;
        if (needsDebugVaryings && !hasDebugVaryings) {
            this.defines.GSPLAT_DEBUG_VARYINGS = 1;
            this.needsUpdate = true;
        } else if (!needsDebugVaryings && hasDebugVaryings) {
            delete this.defines.GSPLAT_DEBUG_VARYINGS;
            this.needsUpdate = true;
        }
    }
    getRenderMode() {
        return this.uniforms.renderMode.value;
    }
    static getRenderModeDescription(mode) {
        const descriptions = {
            [0]: '默认高斯渲染',
            [1]: '点云模式',
            [2]: '平面椭圆模式',
            [3]: '深度热力图',
            [4]: '透明度热力图',
            [5]: '缩放热力图',
            [6]: '法线可视化'
        };
        return descriptions[mode] || `未知模式 (${mode})`;
    }
    setSHTextures(shTextures, shBands) {
        this.uniforms.shBands.value = Math.min(shBands, 3);
        if (shBands > 0) {
            this.defines = this.defines || {};
            this.defines.SH_BANDS = Math.min(shBands, 3);
            this.needsUpdate = true;
        }
        this.uniforms.splatSH_1to3.value = shTextures.length > 0 ? shTextures[0] : null;
        this.uniforms.splatSH_4to7.value = shTextures.length > 1 ? shTextures[1] : null;
        this.uniforms.splatSH_8to11.value = shTextures.length > 2 ? shTextures[2] : null;
        this.uniforms.splatSH_12to15.value = shTextures.length > 3 ? shTextures[3] : null;
    }
    setAlphaClip(value) {
        this.uniforms.alphaClip.value = value;
    }
    setMinPixelSize(value) {
        const uniformName = 'minPixelSize';
        if (this._shaderEffectUniformBackup.has(uniformName)) {
            const backup = this._shaderEffectUniformBackup.get(uniformName);
            if (backup) backup.value = value;
            else this._shaderEffectUniformBackup.set(uniformName, {
                value
            });
        }
        this.uniforms.minPixelSize.value = value;
    }
    updateDitherJitter() {
        this.uniforms.blueNoiseJitter.value.set(Math.random(), Math.random());
    }
    setPickId(id) {
        if (id instanceof __WEBPACK_EXTERNAL_MODULE_three__.Vector4) this.uniforms.pickId.value.copy(id);
        else if (Array.isArray(id)) this.uniforms.pickId.value.set(id[0] ?? 0, id[1] ?? 0, id[2] ?? 0, id[3] ?? 0);
    }
    setSogsTextures(textures, meta) {
        this.uniforms.splatMeansLow.value = textures.meansLow;
        this.uniforms.splatMeansHigh.value = textures.meansHigh;
        this.uniforms.splatQuats.value = textures.quats;
        this.uniforms.splatScales.value = textures.scales;
        this.uniforms.splatSH0.value = textures.sh0;
        this.uniforms.sogsMeans_mins.value.set(...meta.means.mins);
        this.uniforms.sogsMeans_maxs.value.set(...meta.means.maxs);
        this.defines = this.defines || {};
        this.defines.GSPLAT_SOGS_DATA = 1;
        if (2 === meta.version) {
            this.defines.GSPLAT_SOGS_V2 = 1;
            if (textures.scalesCodebook) this.uniforms.sogsScalesCodebook.value = textures.scalesCodebook;
            if (textures.sh0Codebook) this.uniforms.sogsSH0Codebook.value = textures.sh0Codebook;
        } else {
            delete this.defines.GSPLAT_SOGS_V2;
            if (meta.scales.mins && meta.scales.maxs) {
                this.uniforms.sogsScales_mins.value.set(...meta.scales.mins);
                this.uniforms.sogsScales_maxs.value.set(...meta.scales.maxs);
            }
            if (meta.sh0.mins && meta.sh0.maxs) {
                this.uniforms.sogsSH0_mins.value.set(...meta.sh0.mins);
                this.uniforms.sogsSH0_maxs.value.set(...meta.sh0.maxs);
            }
        }
        this.needsUpdate = true;
    }
    setSogsSHTextures(packedShN, shLabels, shN_mins, shN_maxs, shBands) {
        this.uniforms.packedShN.value = packedShN;
        this.uniforms.sogsSH_labels.value = shLabels;
        this.uniforms.sogsSHN_mins.value = shN_mins;
        this.uniforms.sogsSHN_maxs.value = shN_maxs;
        if (packedShN && shLabels && shBands > 0) {
            this.defines.SH_BANDS = Math.min(shBands, 3);
            this.uniforms.shBands.value = Math.min(shBands, 3);
        } else {
            delete this.defines.SH_BANDS;
            this.uniforms.shBands.value = 0;
        }
        this.needsUpdate = true;
    }
    setHighQualitySHTexture(shResultTexture, shLabelsTexture, shN_mins, shN_maxs) {
        const nextLabels = void 0 !== shLabelsTexture ? shLabelsTexture : this.uniforms.sh_labels.value;
        const shouldEnable = null !== shResultTexture && null !== nextLabels;
        const wasEnabled = 'USE_HIGH_QUALITY_SH' in this.defines;
        this.uniforms.sh_result.value = shResultTexture;
        if (void 0 !== shLabelsTexture) this.uniforms.sh_labels.value = shouldEnable ? shLabelsTexture : null;
        else if (!shouldEnable) this.uniforms.sh_labels.value = null;
        if (void 0 !== shN_mins) this.uniforms.shN_mins.value.setScalar(shN_mins);
        if (void 0 !== shN_maxs) this.uniforms.shN_maxs.value.setScalar(shN_maxs);
        if (shouldEnable && !wasEnabled) {
            this.defines.USE_HIGH_QUALITY_SH = 1;
            this.needsUpdate = true;
        } else if (!shouldEnable && wasEnabled) {
            delete this.defines.USE_HIGH_QUALITY_SH;
            this.needsUpdate = true;
        }
    }
    _rebuildShaderEffectSource() {
        const chunkOverrides = this._workBufferModifier ? {
            gsplatModifyVS: (0, __WEBPACK_EXTERNAL_MODULE__shaders_gsplatModifyChunk_js_2bdd6f97__.createGSplatCovarianceOnlyModifyChunk)(this._workBufferModifier.code)
        } : this._shaderEffect ? {
            gsplatModifyVS: (0, __WEBPACK_EXTERNAL_MODULE__shaders_gsplatModifyChunk_js_2bdd6f97__.createGSplatModifyChunk)(this._shaderEffect.glsl)
        } : void 0;
        const { vertexShader, fragmentShader } = (0, __WEBPACK_EXTERNAL_MODULE__shaders_gsplat_chunks_js_c6e8d193__.assembleGSplatShaders)({
            chunkOverrides
        });
        this.vertexShader = vertexShader;
        this.fragmentShader = fragmentShader;
        this.needsUpdate = true;
    }
    _applyShaderEffectUniforms(effect) {
        if (!effect.uniforms) return;
        for (const [name, uniform] of Object.entries(effect.uniforms)){
            if (!this._shaderEffectUniformBackup.has(name)) this._shaderEffectUniformBackup.set(name, this.uniforms[name]);
            this.uniforms[name] = uniform;
        }
    }
    _applyShaderEffectDefines(effect) {
        if (!effect.defines) return;
        this.defines = this.defines || {};
        for (const [name, value] of Object.entries(effect.defines)){
            if (!this._shaderEffectDefineBackup.has(name)) this._shaderEffectDefineBackup.set(name, this.defines[name]);
            this.defines[name] = value;
        }
    }
    _clearShaderEffectState() {
        this._shaderEffect?.dispose?.();
        this._shaderEffect = null;
        this._shaderEffectActive = false;
        for (const [name, uniform] of this._shaderEffectUniformBackup)if (void 0 === uniform) delete this.uniforms[name];
        else this.uniforms[name] = uniform;
        this._shaderEffectUniformBackup.clear();
        for (const [name, value] of this._shaderEffectDefineBackup)if (void 0 === value) delete this.defines[name];
        else this.defines[name] = value;
        this._shaderEffectDefineBackup.clear();
    }
    dispose() {
        this._clearShaderEffectState();
        this._blueNoiseTexture?.dispose();
        this._blueNoiseTexture = null;
        this.uniforms.blueNoiseTexture.value = null;
        super.dispose();
        this.uniforms.transformA.value = null;
        this.uniforms.transformB.value = null;
        this.uniforms.splatColor.value = null;
        this.uniforms.splatOrder.value = null;
        this.uniforms.splatSH_1to3.value = null;
        this.uniforms.splatSH_4to7.value = null;
        this.uniforms.splatSH_8to11.value = null;
        this.uniforms.splatSH_12to15.value = null;
        this.uniforms.splatMeansLow.value = null;
        this.uniforms.splatMeansHigh.value = null;
        this.uniforms.splatQuats.value = null;
        this.uniforms.splatScales.value = null;
        this.uniforms.splatSH0.value = null;
        this.uniforms.sogsScalesCodebook.value = null;
        this.uniforms.sogsSH0Codebook.value = null;
        this.uniforms.packedShN.value = null;
        this.uniforms.sogsSH_labels.value = null;
        this.uniforms.sh_result.value = null;
        this.uniforms.sh_labels.value = null;
    }
    setGammaMode(mode) {
        if (this._gammaMode === mode) return;
        this._gammaMode = mode;
        this._updateGammaDefines();
        this.needsUpdate = true;
    }
    getGammaMode() {
        return this._gammaMode;
    }
    setToneMapping(mode) {
        if (this._toneMapping === mode) return;
        this._toneMapping = mode;
        this._updateToneMappingDefines();
        this.needsUpdate = true;
    }
    getToneMapping() {
        return this._toneMapping;
    }
    setExposure(value) {
        this.uniforms.exposure.value = value;
    }
    getExposure() {
        return this.uniforms.exposure.value;
    }
    setColorAdjustment(options) {
        if (void 0 !== options.brightness) this.uniforms.colorBrightness.value = Math.max(-1, Math.min(1, options.brightness));
        if (void 0 !== options.temperature) this.uniforms.colorTemperature.value = Math.max(-1, Math.min(1, options.temperature));
        if (void 0 !== options.contrast) this.uniforms.colorContrast.value = Math.max(0, Math.min(2, options.contrast));
        if (void 0 !== options.saturation) this.uniforms.colorSaturation.value = Math.max(0, Math.min(2, options.saturation));
        if (void 0 !== options.opacity) this.uniforms.colorOpacity.value = Math.max(0, Math.min(1, options.opacity));
    }
    getColorAdjustment() {
        return {
            brightness: this.uniforms.colorBrightness.value,
            temperature: this.uniforms.colorTemperature.value,
            contrast: this.uniforms.colorContrast.value,
            saturation: this.uniforms.colorSaturation.value,
            opacity: this.uniforms.colorOpacity.value
        };
    }
    resetColorAdjustment() {
        this.uniforms.colorBrightness.value = 0.0;
        this.uniforms.colorTemperature.value = 0.0;
        this.uniforms.colorContrast.value = 1.0;
        this.uniforms.colorSaturation.value = 1.0;
        this.uniforms.colorOpacity.value = 1.0;
    }
    setScalarTexture(texture) {
        const hadDefine = this.defines && 'HAS_SCALAR_FILTER' in this.defines;
        const needDefine = null !== texture;
        this.uniforms.splatScalar.value = texture;
        if (needDefine && !hadDefine) {
            this.defines = this.defines || {};
            this.defines.HAS_SCALAR_FILTER = 1;
            this.needsUpdate = true;
        } else if (!needDefine && hadDefine) {
            delete this.defines.HAS_SCALAR_FILTER;
            this.needsUpdate = true;
        }
    }
    setScalarFilter(enabled, min, max) {
        this.uniforms.scalarFilterEnabled.value = enabled;
        this.uniforms.scalarFilterRange.value.set(min, max);
    }
    clearScalarFilter() {
        this.setScalarTexture(null);
        this.uniforms.scalarFilterEnabled.value = false;
        this.uniforms.scalarFilterRange.value.set(0, 1);
    }
    setBrightness(value) {
        this.uniforms.colorBrightness.value = Math.max(-1, Math.min(1, value));
    }
    getBrightness() {
        return this.uniforms.colorBrightness.value;
    }
    setTemperature(value) {
        this.uniforms.colorTemperature.value = Math.max(-1, Math.min(1, value));
    }
    getTemperature() {
        return this.uniforms.colorTemperature.value;
    }
    setContrast(value) {
        this.uniforms.colorContrast.value = Math.max(0, Math.min(2, value));
    }
    getContrast() {
        return this.uniforms.colorContrast.value;
    }
    setSaturation(value) {
        this.uniforms.colorSaturation.value = Math.max(0, Math.min(2, value));
    }
    getSaturation() {
        return this.uniforms.colorSaturation.value;
    }
    setOpacity(value) {
        this.uniforms.colorOpacity.value = Math.max(0, Math.min(1, value));
    }
    getOpacity() {
        return this.uniforms.colorOpacity.value;
    }
    updateGammaMode(renderer) {
        if ('auto' !== this._gammaMode) return;
        const needsShaderGamma = renderer.outputColorSpace === __WEBPACK_EXTERNAL_MODULE_three__.SRGBColorSpace;
        const currentlyHasGammaSRGB = Object.hasOwn(this.defines, 'GAMMA_SRGB');
        const shouldHaveGammaSRGB = needsShaderGamma;
        if (currentlyHasGammaSRGB !== shouldHaveGammaSRGB) {
            if (shouldHaveGammaSRGB) {
                delete this.defines.GAMMA_NONE;
                this.defines.GAMMA_SRGB = '';
            } else {
                delete this.defines.GAMMA_SRGB;
                this.defines.GAMMA_NONE = '';
            }
            this.needsUpdate = true;
        }
    }
    _updateGammaDefines() {
        delete this.defines.GAMMA_NONE;
        delete this.defines.GAMMA_SRGB;
        if ('auto' === this._gammaMode) this.defines.GAMMA_NONE = '';
        else if (this._gammaMode === __WEBPACK_EXTERNAL_MODULE__core_ColorSpaceConstants_js_789f0287__.GammaMode.SRGB) this.defines.GAMMA_SRGB = '';
        else this.defines.GAMMA_NONE = '';
    }
    _updateToneMappingDefines() {
        delete this.defines.TONEMAP_NONE;
        delete this.defines.TONEMAP_LINEAR;
        delete this.defines.TONEMAP_ACES;
        delete this.defines.TONEMAP_FILMIC;
        delete this.defines.TONEMAP_NEUTRAL;
        this.defines[`TONEMAP_${this._toneMapping}`] = '';
    }
    clone() {
        const material = new GaussianSplatMaterial({
            depthWrite: this.depthWrite,
            depthTest: this.depthTest,
            transparent: this.transparent,
            enableSH: !!this.defines?.SH_BANDS,
            maxSHBands: this.defines?.SH_BANDS || 0,
            useLogDepth: Object.hasOwn(this.defines, 'USE_LOGDEPTHBUF'),
            useHalfPrecision: Object.hasOwn(this.defines, 'USE_HALF_PRECISION'),
            clipping: this.clipping,
            enableAA: !!this.defines?.GSPLAT_AA,
            dither: this.defines?.DITHER_BAYER8 ? 'bayer8' : this.defines?.DITHER_BLUENOISE ? 'bluenoise' : 'none',
            pass: this.defines?.PICK_PASS ? 'pick' : this.defines?.SHADOW_PASS ? 'shadow' : this.defines?.PREPASS_PASS ? 'prepass' : 'default',
            alphaClip: this.uniforms.alphaClip.value,
            minPixelSize: this.uniforms.minPixelSize.value,
            enableOverdraw: !!this.defines?.GSPLAT_OVERDRAW,
            gammaMode: this._gammaMode,
            toneMapping: this._toneMapping,
            exposure: this.uniforms.exposure.value
        });
        material.uniforms.viewport.value.copy(this.uniforms.viewport.value);
        material.uniforms.viewport_size.value.copy(this.uniforms.viewport_size.value);
        material.uniforms.camera_params.value.copy(this.uniforms.camera_params.value);
        material.uniforms.cameraPositionHigh.value.copy(this.uniforms.cameraPositionHigh.value);
        material.uniforms.cameraPositionLow.value.copy(this.uniforms.cameraPositionLow.value);
        material.uniforms.originToCameraHigh.value.copy(this.uniforms.originToCameraHigh.value);
        material.uniforms.originToCameraLow.value.copy(this.uniforms.originToCameraLow.value);
        material.uniforms.transformA.value = this.uniforms.transformA.value;
        material.uniforms.transformB.value = this.uniforms.transformB.value;
        material.uniforms.splatColor.value = this.uniforms.splatColor.value;
        material.uniforms.splatOrder.value = this.uniforms.splatOrder.value;
        material.uniforms.numSplats.value = this.uniforms.numSplats.value;
        material.uniforms.dataWidth.value = this.uniforms.dataWidth.value;
        material.uniforms.orderWidth.value = this.uniforms.orderWidth.value;
        material.uniforms.splatSH_1to3.value = this.uniforms.splatSH_1to3.value;
        material.uniforms.splatSH_4to7.value = this.uniforms.splatSH_4to7.value;
        material.uniforms.splatSH_8to11.value = this.uniforms.splatSH_8to11.value;
        material.uniforms.splatSH_12to15.value = this.uniforms.splatSH_12to15.value;
        material.uniforms.shBands.value = this.uniforms.shBands.value;
        return material;
    }
}
export { GaussianSplatMaterial_rslib_entry_GSplatRenderMode as GSplatRenderMode, GaussianSplatMaterial };
