import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__GSplatWorkBufferCopySegments_js_22e4f614__ from "./GSplatWorkBufferCopySegments.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('gsplat:lod');
const WHITE_COLOR = [
    1,
    1,
    1
];
class GSplatWorkBufferRenderPass {
    constructor(renderer, workBuffer, passMode = 'full'){
        this.splats = [];
        this.cameraNode = null;
        this.viewMatrix = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4();
        this.tempMatrix = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4();
        this.tempSceneOrigin = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        this.tempViewMatrix = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4();
        this.renderer = renderer;
        this.workBuffer = workBuffer;
        this.passMode = passMode;
        if ('colorOnly' === passMode) this.renderTarget = workBuffer.colorRenderTarget;
        else if ('scalarOnly' === passMode) this.renderTarget = workBuffer.scalarRenderTarget;
        else this.renderTarget = workBuffer.renderTarget;
    }
    get colorOnly() {
        return 'colorOnly' === this.passMode;
    }
    get scalarOnly() {
        return 'scalarOnly' === this.passMode;
    }
    update(splats, cameraNode, colorsByLod) {
        this.splats.length = 0;
        this.colorsByLod = colorsByLod;
        this.cameraNode = cameraNode;
        for(let i = 0; i < splats.length; i++){
            const splatInfo = splats[i];
            if (splatInfo.activeSplats > 0) this.splats.push(splatInfo);
        }
        return this.splats.length > 0;
    }
    render() {
        if (0 === this.splats.length) return;
        const gl = this.renderer.getContext();
        const hasDebugGroup = 'function' == typeof gl.pushDebugGroup;
        if (hasDebugGroup && gl.pushDebugGroup && void 0 !== gl.DEBUG_SOURCE_APPLICATION) gl.pushDebugGroup(gl.DEBUG_SOURCE_APPLICATION, 0, `GSplatWorkBufferRenderPass [passMode=${this.passMode}, splats=${this.splats.length}]`);
        const currentRenderTarget = this.renderer.getRenderTarget();
        const rt = 'scalarOnly' === this.passMode ? this.workBuffer.scalarRenderTarget : this.renderTarget;
        if (!rt) {
            if (hasDebugGroup && gl.popDebugGroup) gl.popDebugGroup();
            this.renderer.setRenderTarget(currentRenderTarget);
            return;
        }
        this.renderer.setRenderTarget(rt);
        if (!this.cameraNode) {
            log.error('GSplatWorkBufferRenderPass: cameraNode is null');
            this.renderer.setRenderTarget(currentRenderTarget);
            if (hasDebugGroup && gl.popDebugGroup) gl.popDebugGroup();
            return;
        }
        const savedAutoClear = this.renderer.autoClear;
        this.renderer.autoClear = false;
        let colorAttachmentMaskApplied = false;
        try {
            if ('colorOnly' === this.passMode) {
                gl.drawBuffers([
                    gl.COLOR_ATTACHMENT0,
                    gl.NONE,
                    gl.NONE
                ]);
                colorAttachmentMaskApplied = true;
            }
            this.cameraNode.updateMatrixWorld(true);
            this.viewMatrix.copy(this.cameraNode.matrixWorld).invert();
            for(let i = 0; i < this.splats.length; i++)this.renderSplat(this.splats[i]);
        } finally{
            if (colorAttachmentMaskApplied) gl.drawBuffers([
                gl.COLOR_ATTACHMENT0,
                gl.COLOR_ATTACHMENT1,
                gl.COLOR_ATTACHMENT2
            ]);
            this.renderer.autoClear = savedAutoClear;
            this.renderer.setRenderTarget(currentRenderTarget);
            if (hasDebugGroup && gl.popDebugGroup) gl.popDebugGroup();
        }
    }
    renderSplat(splatInfo) {
        const { resource, intervals, activeSplats, lineStart, viewport } = splatInfo;
        if ('gpuReady' in resource && false === resource.gpuReady) return;
        const shBands = resource.shBands || 0;
        const isSogs = 'GSplatSogsResource' === resource.constructor.name || 'meta' in resource;
        const modifier = splatInfo.placement.workBufferModifier;
        const renderInfo = this.workBuffer.getWorkBufferRenderInfo(intervals.length > 0, this.passMode, shBands, isSogs, modifier);
        const material = renderInfo.material;
        material.uniforms.uActiveSplats.value = activeSplats;
        material.uniforms.uStartLine.value = lineStart;
        material.uniforms.uViewportWidth.value = viewport.z;
        material.uniforms.uColorMultiply.value.set(...this.getColorForLod(splatInfo.lodIndex));
        const nodeOverride = splatInfo.node.__sceneOriginOverride;
        if (nodeOverride) this.tempSceneOrigin.copy(nodeOverride);
        else this.tempSceneOrigin.setFromMatrixPosition(splatInfo.node.matrixWorld);
        this.tempMatrix.copy(splatInfo.node.matrixWorld);
        this.tempMatrix.elements[12] -= this.tempSceneOrigin.x;
        this.tempMatrix.elements[13] -= this.tempSceneOrigin.y;
        this.tempMatrix.elements[14] -= this.tempSceneOrigin.z;
        material.uniforms.matrix_model.value.copy(this.tempMatrix);
        const vm = this.viewMatrix.elements;
        const ox = this.tempSceneOrigin.x;
        const oy = this.tempSceneOrigin.y;
        const oz = this.tempSceneOrigin.z;
        const offsetX = vm[0] * ox + vm[4] * oy + vm[8] * oz;
        const offsetY = vm[1] * ox + vm[5] * oy + vm[9] * oz;
        const offsetZ = vm[2] * ox + vm[6] * oy + vm[10] * oz;
        this.tempViewMatrix.copy(this.viewMatrix);
        this.tempViewMatrix.elements[12] += offsetX;
        this.tempViewMatrix.elements[13] += offsetY;
        this.tempViewMatrix.elements[14] += offsetZ;
        material.uniforms.matrix_view.value.copy(this.tempViewMatrix);
        if (0 === viewport.z || 0 === viewport.w) return;
        const geometry = splatInfo.geometry;
        if (geometry) {
            material.uniforms.splatColor.value = geometry.colorTexture;
            material.uniforms.splatDataA.value = geometry.dataTextureA;
            material.uniforms.splatDataB.value = geometry.dataTextureB;
            if (shBands > 0 && geometry.shTextures.length > 0) {
                material.uniforms.splatSH0.value = geometry.shTextures[0] || null;
                if (shBands >= 2 && material.uniforms.splatSH1) material.uniforms.splatSH1.value = geometry.shTextures[1] || null;
                if (shBands >= 3 && material.uniforms.splatSH2) material.uniforms.splatSH2.value = geometry.shTextures[2] || null;
            }
        } else {
            if (!('configureMaterial' in resource) || 'function' != typeof resource.configureMaterial) return;
            resource.configureMaterial(material);
        }
        if ('scalarOnly' === this.passMode && material.uniforms.uScalarMode) material.uniforms.uScalarMode.value = this.workBuffer.scalarMode;
        const copySegments = this.buildCopySegments(splatInfo, activeSplats, viewport.z, lineStart);
        this.renderCopySegments(material, renderInfo.quadRender, copySegments);
    }
    buildCopySegments(splatInfo, activeSplats, textureWidth, lineStart) {
        if (0 === splatInfo.intervals.length) return (0, __WEBPACK_EXTERNAL_MODULE__GSplatWorkBufferCopySegments_js_22e4f614__.buildWorkBufferCopySegments)({
            activeSplats,
            textureWidth,
            lineStart,
            includeTrailingPadding: true
        });
        const segments = [];
        let targetOffset = 0;
        for(let i = 0; i < splatInfo.intervals.length; i += 2){
            const sourceBase = splatInfo.intervals[i];
            const count = splatInfo.intervals[i + 1] - sourceBase;
            if (!(count <= 0)) {
                segments.push(...(0, __WEBPACK_EXTERNAL_MODULE__GSplatWorkBufferCopySegments_js_22e4f614__.buildWorkBufferCopySegments)({
                    activeSplats: count,
                    textureWidth,
                    lineStart,
                    targetOffset,
                    sourceBase
                }));
                targetOffset += count;
            }
        }
        return segments;
    }
    renderCopySegments(material, quadRender, segments) {
        if (0 === segments.length) return;
        const renderer = this.renderer;
        if (quadRender.renderSegments) {
            for (const segment of segments){
                this.configureCopySegmentUniforms(material, segment);
                quadRender.renderSegments(renderer, [
                    segment
                ], this.workBuffer.textureSize);
            }
            return;
        }
        const gl = renderer.getContext();
        const savedViewport = gl.getParameter(gl.VIEWPORT);
        const savedScissor = gl.getParameter(gl.SCISSOR_BOX);
        const savedScissorTest = gl.isEnabled(gl.SCISSOR_TEST);
        try {
            gl.enable(gl.SCISSOR_TEST);
            for (const segment of segments){
                this.configureCopySegmentUniforms(material, segment);
                gl.viewport(segment.x, segment.y, segment.width, segment.height);
                gl.scissor(segment.x, segment.y, segment.width, segment.height);
                quadRender.render(renderer);
            }
        } finally{
            gl.viewport(savedViewport[0], savedViewport[1], savedViewport[2], savedViewport[3]);
            gl.scissor(savedScissor[0], savedScissor[1], savedScissor[2], savedScissor[3]);
            if (savedScissorTest) gl.enable(gl.SCISSOR_TEST);
            else gl.disable(gl.SCISSOR_TEST);
        }
    }
    configureCopySegmentUniforms(material, segment) {
        material.uniforms.uSegmentSourceBase.value = segment.sourceBase;
        material.uniforms.uSegmentTargetOffset.value = segment.targetOffset;
        material.uniforms.uSegmentCount.value = segment.count;
        material.uniforms.uSegmentX.value = segment.x;
        material.uniforms.uSegmentY.value = segment.y;
        material.uniforms.uSegmentWidth.value = segment.width;
    }
    getColorForLod(_lodIndex) {
        if (!this.colorsByLod) return WHITE_COLOR;
        return this.colorsByLod[_lodIndex] ?? this.colorsByLod[0] ?? WHITE_COLOR;
    }
    destroy() {
        this.splats.length = 0;
        this.cameraNode = null;
        this.colorsByLod = void 0;
    }
}
export { GSplatWorkBufferRenderPass };
