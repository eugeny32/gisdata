import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__ from "../../shared/constants/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_c632c149__ from "../../shared/types/assets.js";
import * as __WEBPACK_EXTERNAL_MODULE__materials_EyeDomeLightingMaterial_js_47f6b5ed__ from "./materials/EyeDomeLightingMaterial.js";
import * as __WEBPACK_EXTERNAL_MODULE__materials_NormalizationEDLMaterial_js_7087ef1f__ from "./materials/NormalizationEDLMaterial.js";
import * as __WEBPACK_EXTERNAL_MODULE__materials_NormalizationMaterial_js_8ac3dfa6__ from "./materials/NormalizationMaterial.js";
import * as __WEBPACK_EXTERNAL_MODULE__materials_PointCloudMaterial_js_63d1bc03__ from "./materials/PointCloudMaterial.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_geometry_utils_js_05a46e0d__ from "./utils/geometry-utils.js";
class PointCloudRenderBackend {
    constructor(pRenderer, getConfig, getVisibleOctrees){
        this.edlMaterial = null;
        this.rtEDL = null;
        this.normalizationMaterial = null;
        this.normalizationEDLMaterial = null;
        this.rtDepth = null;
        this.rtAttribute = null;
        this.depthMaterials = new Map();
        this.attributeMaterials = new Map();
        this.screenPassRenderers = new Set();
        this.disposed = false;
        this.pRenderer = pRenderer;
        this.getConfig = getConfig;
        this.getVisibleOctrees = getVisibleOctrees;
    }
    render(frame, phase, ctx) {
        if (phase === __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_c632c149__.RenderPhase.Prepare) this._prepare(frame, ctx);
        else if (phase === __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_c632c149__.RenderPhase.MainOpaque) this._renderMainOpaque(frame, ctx);
    }
    getMemoryDiagnostics() {
        return {
            hqDepthMaterials: this.depthMaterials.size,
            hqAttributeMaterials: this.attributeMaterials.size,
            hasEdlMaterial: null !== this.edlMaterial,
            hasEdlTarget: null !== this.rtEDL,
            hasDepthTarget: null !== this.rtDepth,
            hasAttributeTarget: null !== this.rtAttribute
        };
    }
    dispose() {
        if (this.disposed) return;
        this.disposed = true;
        this._disposeEDLResources();
        this._disposeHQResources();
        for (const renderer of this.screenPassRenderers)__WEBPACK_EXTERNAL_MODULE__utils_geometry_utils_js_05a46e0d__.screenPass.release?.(renderer);
        this.screenPassRenderers.clear();
        this.pRenderer.dispose();
    }
    _retainScreenPassRenderer(renderer) {
        if (this.screenPassRenderers.has(renderer)) return;
        this.screenPassRenderers.add(renderer);
        __WEBPACK_EXTERNAL_MODULE__utils_geometry_utils_js_05a46e0d__.screenPass.retain?.(renderer);
    }
    _bindOutputRect(renderer, outputTarget, x, y, width, height) {
        renderer.setRenderTarget(outputTarget);
        renderer.setViewport(x, y, width, height);
        renderer.setScissor(x, y, width, height);
        renderer.setScissorTest(true);
    }
    _bindViewOutput(renderer, outputTarget, viewport) {
        this._bindOutputRect(renderer, outputTarget, viewport.x, viewport.y, viewport.width, viewport.height);
    }
    _bindFullTarget(renderer, outputTarget, width, height) {
        renderer.setRenderTarget(outputTarget);
        const gl = renderer.getContext();
        gl.viewport(0, 0, width, height);
        gl.scissor(0, 0, width, height);
        gl.enable(gl.SCISSOR_TEST);
    }
    _toDeviceViewport(renderer, viewport) {
        const pixelRatio = Math.max(renderer.getPixelRatio?.() ?? 1, 1);
        return {
            x: Math.round(viewport.x * pixelRatio),
            y: Math.round(viewport.y * pixelRatio),
            width: Math.round(viewport.width * pixelRatio),
            height: Math.round(viewport.height * pixelRatio)
        };
    }
    _getPrivateRenderSize(renderer, viewport) {
        const pixelRatio = Math.max(renderer.getPixelRatio?.() ?? 1, 1);
        return {
            width: Math.max(Math.round(viewport.width * pixelRatio), 1),
            height: Math.max(Math.round(viewport.height * pixelRatio), 1)
        };
    }
    _prepare(_frame, ctx) {
        const { viewport } = ctx;
        const octrees = this.getVisibleOctrees();
        for (const octree of octrees){
            const material = octree.material;
            material.screenWidth = viewport.width;
            material.screenHeight = viewport.height;
            const octreeSize = octree.pcoGeometry?.boundingBox?.getSize(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3()).x ?? 0;
            material.uniforms.octreeSize.value = octreeSize;
            material.uniforms.visibleNodes.value = material.visibleNodesTexture;
            material.spacing = octree.pcoGeometry.spacing;
        }
    }
    _renderMainOpaque(frame, ctx) {
        const config = this.getConfig();
        const camera = frame.camera;
        const octrees = this.getVisibleOctrees();
        const clearColor = ctx.renderer.getClearColor(new __WEBPACK_EXTERNAL_MODULE_three__.Color());
        const clearAlpha = ctx.renderer.getClearAlpha();
        camera.updateMatrixWorld(true);
        for (const octree of octrees)octree.updateMatrixWorld(true);
        try {
            switch(config.renderStrategy){
                case 'edl':
                    this._renderEDL(frame, ctx, config);
                    break;
                case 'hq-splat':
                    this._renderHQSplat(frame, ctx, config);
                    break;
                default:
                    this._renderDefault(frame, ctx, config);
                    break;
            }
        } finally{
            ctx.renderer.resetState();
            ctx.renderer.setClearColor(clearColor, clearAlpha);
        }
    }
    _renderDefault(frame, ctx, _config) {
        const { renderer, outputTarget, viewport } = ctx;
        const camera = frame.camera;
        const octrees = this.getVisibleOctrees();
        for (const octree of octrees){
            octree.material.weighted = false;
            octree.material.useEDL = false;
        }
        renderer.resetState();
        this._bindViewOutput(renderer, outputTarget, viewport);
        const gl = renderer.getContext();
        const deviceViewport = this._toDeviceViewport(renderer, viewport);
        gl.enable(gl.SCISSOR_TEST);
        gl.scissor(deviceViewport.x, deviceViewport.y, deviceViewport.width, deviceViewport.height);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        for (const octree of octrees){
            const visibleNodes = octree.visibleNodes;
            if (0 !== visibleNodes.length) this.pRenderer.renderOctree(octree, visibleNodes, camera, outputTarget);
        }
        if (outputTarget) renderer.setRenderTarget(outputTarget);
    }
    _initEDL() {
        if (this.edlMaterial) return;
        this.edlMaterial = new __WEBPACK_EXTERNAL_MODULE__materials_EyeDomeLightingMaterial_js_47f6b5ed__.EyeDomeLightingMaterial({
            glslVersion: __WEBPACK_EXTERNAL_MODULE_three__.GLSL3
        });
        this.edlMaterial.depthTest = true;
        this.edlMaterial.depthWrite = true;
        this.edlMaterial.depthFunc = __WEBPACK_EXTERNAL_MODULE_three__.AlwaysDepth;
        this.edlMaterial.transparent = true;
        this.rtEDL = new __WEBPACK_EXTERNAL_MODULE_three__.WebGLRenderTarget(1024, 1024, {
            minFilter: __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter,
            magFilter: __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter,
            format: __WEBPACK_EXTERNAL_MODULE_three__.RGBAFormat,
            type: __WEBPACK_EXTERNAL_MODULE_three__.FloatType,
            depthTexture: new __WEBPACK_EXTERNAL_MODULE_three__.DepthTexture(void 0, void 0, __WEBPACK_EXTERNAL_MODULE_three__.UnsignedIntType)
        });
    }
    _renderEDL(frame, ctx, config) {
        this._initEDL();
        const { renderer, outputTarget, viewport } = ctx;
        const camera = frame.camera;
        const octrees = this.getVisibleOctrees();
        const { width, height } = this._getPrivateRenderSize(renderer, viewport);
        this.rtEDL.setSize(width, height);
        this._bindFullTarget(renderer, this.rtEDL, width, height);
        renderer.setClearColor(0x000000, 0);
        renderer.state.buffers.depth.setClear(1);
        renderer.clear(true, true, true);
        for (const octree of octrees){
            const material = octree.material;
            material.weighted = false;
            material.useEDL = true;
            material.screenWidth = width;
            material.screenHeight = height;
        }
        for (const octree of octrees){
            const visibleNodes = octree.visibleNodes;
            if (0 !== visibleNodes.length) this.pRenderer.renderOctree(octree, visibleNodes, camera, this.rtEDL, {
                transparent: false
            });
        }
        renderer.resetState();
        this._bindViewOutput(renderer, outputTarget, viewport);
        const uniforms = this.edlMaterial.uniforms;
        uniforms.screenWidth.value = width;
        uniforms.screenHeight.value = height;
        uniforms.uEDLColor.value = this.rtEDL.texture;
        uniforms.uEDLDepth.value = this.rtEDL.depthTexture;
        uniforms.edlStrength.value = config.edlStrength;
        uniforms.radius.value = config.edlRadius;
        uniforms.opacity.value = config.edlOpacity;
        this._clearCompositeOutput(renderer, outputTarget, viewport);
        if (outputTarget) {
            this._retainScreenPassRenderer(renderer);
            __WEBPACK_EXTERNAL_MODULE__utils_geometry_utils_js_05a46e0d__.screenPass.render(renderer, this.edlMaterial, outputTarget, viewport);
        } else {
            this._retainScreenPassRenderer(renderer);
            __WEBPACK_EXTERNAL_MODULE__utils_geometry_utils_js_05a46e0d__.screenPass.render(renderer, this.edlMaterial, void 0, viewport);
        }
        renderer.setRenderTarget(outputTarget);
    }
    _initHQ() {
        if (this.normalizationMaterial) return;
        this.normalizationMaterial = new __WEBPACK_EXTERNAL_MODULE__materials_NormalizationMaterial_js_8ac3dfa6__.NormalizationMaterial();
        this.normalizationMaterial.depthTest = false;
        this.normalizationMaterial.depthWrite = false;
        this.normalizationMaterial.transparent = true;
        this.normalizationEDLMaterial = new __WEBPACK_EXTERNAL_MODULE__materials_NormalizationEDLMaterial_js_7087ef1f__.NormalizationEDLMaterial();
        this.normalizationEDLMaterial.depthTest = false;
        this.normalizationEDLMaterial.depthWrite = false;
        this.normalizationEDLMaterial.transparent = true;
        this.rtDepth = new __WEBPACK_EXTERNAL_MODULE_three__.WebGLRenderTarget(1024, 1024, {
            minFilter: __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter,
            magFilter: __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter,
            format: __WEBPACK_EXTERNAL_MODULE_three__.RGBAFormat,
            type: __WEBPACK_EXTERNAL_MODULE_three__.FloatType,
            depthTexture: new __WEBPACK_EXTERNAL_MODULE_three__.DepthTexture(void 0, void 0, __WEBPACK_EXTERNAL_MODULE_three__.UnsignedIntType)
        });
        this.rtAttribute = new __WEBPACK_EXTERNAL_MODULE_three__.WebGLRenderTarget(1024, 1024, {
            minFilter: __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter,
            magFilter: __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter,
            format: __WEBPACK_EXTERNAL_MODULE_three__.RGBAFormat,
            type: __WEBPACK_EXTERNAL_MODULE_three__.FloatType,
            depthTexture: this.rtDepth.depthTexture
        });
    }
    _renderHQSplat(frame, ctx, config) {
        this._initHQ();
        const { renderer, outputTarget, viewport } = ctx;
        const camera = frame.camera;
        const octrees = this.getVisibleOctrees();
        const { width, height } = this._getPrivateRenderSize(renderer, viewport);
        const gl = renderer.getContext();
        this.rtDepth.setSize(width, height);
        this.rtAttribute.setSize(width, height);
        renderer.setClearColor(0x000000, 0);
        this._bindFullTarget(renderer, this.rtDepth, width, height);
        renderer.clear(true, true, true);
        this._bindFullTarget(renderer, this.rtAttribute, width, height);
        renderer.clear(true, true, true);
        const originalMaterials = new Map();
        for (const octree of octrees){
            originalMaterials.set(octree, octree.material);
            this._ensureHQMaterials(octree);
        }
        this._renderDepthPass(octrees, originalMaterials, camera, width, height, renderer);
        this._renderAttributePass(octrees, originalMaterials, camera, width, height, renderer, gl);
        for (const [octree, material] of originalMaterials)octree.material = material;
        renderer.resetState();
        this._renderNormalizationPass(config, width, height, renderer, outputTarget, viewport);
        renderer.setRenderTarget(outputTarget);
    }
    _ensureHQMaterials(octree) {
        if (!this.depthMaterials.has(octree)) {
            const depthMaterial = new __WEBPACK_EXTERNAL_MODULE__materials_PointCloudMaterial_js_63d1bc03__.PointCloudMaterial();
            depthMaterial.setDefine('depth_pass', '#define hq_depth_pass');
            depthMaterial.setDefine('use_edl', '#define use_edl');
            this.depthMaterials.set(octree, depthMaterial);
        }
        if (!this.attributeMaterials.has(octree)) {
            const attributeMaterial = new __WEBPACK_EXTERNAL_MODULE__materials_PointCloudMaterial_js_63d1bc03__.PointCloudMaterial();
            this.attributeMaterials.set(octree, attributeMaterial);
        }
    }
    _syncDerivedMaterial(derived, original, octree, width, height) {
        derived.size = original.size;
        derived.minSize = original.minSize;
        derived.uniforms.maxSize.value = original.uniforms.maxSize.value;
        derived.pointSizeType = original.pointSizeType;
        derived.screenWidth = width;
        derived.screenHeight = height;
        derived.shape = __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.PointShape.CIRCLE;
        derived.visibleNodesTexture = original.visibleNodesTexture;
        derived.uniforms.visibleNodes.value = original.visibleNodesTexture;
        const octreeSize = octree.pcoGeometry?.boundingBox?.getSize(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3()).x ?? 0;
        derived.uniforms.octreeSize.value = octreeSize;
        derived.spacing = octree.pcoGeometry.spacing;
        derived.classification = original.classification;
        derived.uniforms.classificationLUT.value.image.data = original.uniforms.classificationLUT.value.image.data;
        derived.classificationTexture.needsUpdate = true;
        derived.uniforms.uFilterReturnNumberRange.value = original.uniforms.uFilterReturnNumberRange.value;
        derived.uniforms.uFilterNumberOfReturnsRange.value = original.uniforms.uFilterNumberOfReturnsRange.value;
        derived.uniforms.uFilterGPSTimeClipRange.value = original.uniforms.uFilterGPSTimeClipRange.value;
        derived.uniforms.uFilterPointSourceIDClipRange.value = original.uniforms.uFilterPointSourceIDClipRange.value;
        derived.clipTask = original.clipTask;
        derived.clipMethod = original.clipMethod;
        derived.setClipBoxes(original.clipBoxes);
        derived.setClipPolygons(original.clipPolygons, original.clipPolygons?.length ?? 0);
    }
    _renderDepthPass(octrees, originalMaterials, camera, width, height, renderer) {
        for (const octree of octrees){
            const material = originalMaterials.get(octree);
            const depthMaterial = this.depthMaterials.get(octree);
            this._syncDerivedMaterial(depthMaterial, material, octree, width, height);
            depthMaterial.weighted = false;
            octree.material = depthMaterial;
        }
        this._bindFullTarget(renderer, this.rtDepth, width, height);
        for (const octree of octrees){
            const visibleNodes = octree.visibleNodes;
            if (0 !== visibleNodes.length) this.pRenderer.renderOctree(octree, visibleNodes, camera, this.rtDepth);
        }
    }
    _renderAttributePass(octrees, originalMaterials, camera, width, height, renderer, gl) {
        for (const octree of octrees){
            const material = originalMaterials.get(octree);
            const attributeMaterial = this.attributeMaterials.get(octree);
            this._syncDerivedMaterial(attributeMaterial, material, octree, width, height);
            attributeMaterial.weighted = true;
            attributeMaterial.activeAttributeName = material.activeAttributeName;
            attributeMaterial.elevationGradientRepeat = material.elevationGradientRepeat;
            attributeMaterial.elevationRange = material.elevationRange;
            attributeMaterial.gradient = material.gradient;
            attributeMaterial.matcap = material.matcap;
            attributeMaterial.intensityRange = material.intensityRange;
            attributeMaterial.intensityGamma = material.intensityGamma;
            attributeMaterial.intensityContrast = material.intensityContrast;
            attributeMaterial.intensityBrightness = material.intensityBrightness;
            attributeMaterial.rgbGamma = material.rgbGamma;
            attributeMaterial.rgbContrast = material.rgbContrast;
            attributeMaterial.rgbBrightness = material.rgbBrightness;
            attributeMaterial.weightRGB = material.weightRGB;
            attributeMaterial.weightIntensity = material.weightIntensity;
            attributeMaterial.weightElevation = material.weightElevation;
            attributeMaterial.weightClassification = material.weightClassification;
            attributeMaterial.weightReturnNumber = material.weightReturnNumber;
            attributeMaterial.weightSourceID = material.weightSourceID;
            attributeMaterial.color = material.color;
            octree.material = attributeMaterial;
        }
        this._bindFullTarget(renderer, this.rtAttribute, width, height);
        for (const octree of octrees){
            const visibleNodes = octree.visibleNodes;
            if (0 !== visibleNodes.length) this.pRenderer.renderOctree(octree, visibleNodes, camera, this.rtAttribute, {
                blendFunc: [
                    gl.SRC_ALPHA,
                    gl.ONE
                ],
                depthWrite: false
            });
        }
    }
    _renderNormalizationPass(config, width, height, renderer, outputTarget, viewport) {
        const useEDL = config.useEDL;
        const normMaterial = useEDL ? this.normalizationEDLMaterial : this.normalizationMaterial;
        if (useEDL) {
            normMaterial.uniforms.edlStrength.value = config.edlStrength;
            normMaterial.uniforms.radius.value = config.edlRadius;
            normMaterial.uniforms.screenWidth.value = width;
            normMaterial.uniforms.screenHeight.value = height;
            normMaterial.uniforms.uEDLMap.value = this.rtDepth.texture;
        }
        normMaterial.uniforms.uWeightMap.value = this.rtAttribute.texture;
        normMaterial.uniforms.uDepthMap.value = this.rtAttribute.depthTexture;
        this._clearCompositeOutput(renderer, outputTarget, viewport);
        if (outputTarget) {
            this._retainScreenPassRenderer(renderer);
            __WEBPACK_EXTERNAL_MODULE__utils_geometry_utils_js_05a46e0d__.screenPass.render(renderer, normMaterial, outputTarget, viewport);
        } else {
            this._retainScreenPassRenderer(renderer);
            __WEBPACK_EXTERNAL_MODULE__utils_geometry_utils_js_05a46e0d__.screenPass.render(renderer, normMaterial, void 0, viewport);
        }
    }
    _clearCompositeOutput(renderer, outputTarget, viewport) {
        this._bindViewOutput(renderer, outputTarget, viewport);
        renderer.setClearColor(0x000000, 0);
        renderer.clear(true, true, true);
    }
    _disposeEDLResources() {
        if (this.edlMaterial) {
            this.edlMaterial.dispose();
            this.edlMaterial = null;
        }
        if (this.rtEDL) {
            this.rtEDL.texture?.dispose();
            this.rtEDL.depthTexture?.dispose();
            this.rtEDL.dispose();
            this.rtEDL = null;
        }
    }
    _disposeHQResources() {
        if (this.normalizationMaterial) {
            this.normalizationMaterial.dispose();
            this.normalizationMaterial = null;
        }
        if (this.normalizationEDLMaterial) {
            this.normalizationEDLMaterial.dispose();
            this.normalizationEDLMaterial = null;
        }
        if (this.rtDepth) {
            this.rtDepth.texture?.dispose();
            this.rtDepth.depthTexture?.dispose();
            this.rtDepth.dispose();
            this.rtDepth = null;
        }
        if (this.rtAttribute) {
            this.rtAttribute.texture?.dispose();
            this.rtAttribute.dispose();
            this.rtAttribute = null;
        }
        for (const material of this.depthMaterials.values())material.dispose();
        this.depthMaterials.clear();
        for (const material of this.attributeMaterials.values())material.dispose();
        this.attributeMaterials.clear();
    }
}
export { PointCloudRenderBackend };
