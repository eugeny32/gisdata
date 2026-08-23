import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__ from "../../shared/logging/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_c632c149__ from "../../shared/types/assets.js";
const PHASE_ORDER = [
    __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_c632c149__.RenderPhase.Prepare,
    __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_c632c149__.RenderPhase.MainOpaque,
    __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_c632c149__.RenderPhase.MainTransparent,
    __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_c632c149__.RenderPhase.OcclusionDepth,
    __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_c632c149__.RenderPhase.MainOcclusionTested,
    __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_c632c149__.RenderPhase.Overlay3D,
    __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_c632c149__.RenderPhase.Overlay2D,
    __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_c632c149__.RenderPhase.PostProcess
];
const RENDER_PHASE_SLOW_MS = 8;
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__.getLoggerManager)().getLogger('render:pipeline');
function isFiniteBox(box) {
    const { min, max } = box;
    return Number.isFinite(min.x) && Number.isFinite(min.y) && Number.isFinite(min.z) && Number.isFinite(max.x) && Number.isFinite(max.y) && Number.isFinite(max.z);
}
class RenderPipeline {
    constructor(eventBus, renderInvalidation){
        this.renderInvalidation = renderInvalidation;
        this.contributors = new Set();
        this.postProcessPasses = new Set();
        this.disposed = false;
        this.eventBus = eventBus;
    }
    addRenderContributor(contributor) {
        if (this.disposed) return;
        const hadContributor = this.contributors.has(contributor);
        this.contributors.add(contributor);
        if (!hadContributor) this.invalidatePipeline('render.pipeline.contributorAdded', contributor.kind);
        log.debug(`[RenderPipeline] contributor added, kind=${contributor.kind}, phases=${contributor.phases.join(',')}`);
    }
    removeRenderContributor(contributor) {
        const removed = this.contributors.delete(contributor);
        if (removed) this.invalidatePipeline('render.pipeline.contributorRemoved', contributor.kind);
        log.debug(`[RenderPipeline] contributor removed, kind=${contributor.kind}`);
    }
    addPostProcessPass(pass) {
        if (this.disposed) return;
        const hadPass = this.postProcessPasses.has(pass);
        this.postProcessPasses.add(pass);
        if (!hadPass) this.invalidatePipeline('render.pipeline.postProcessAdded', pass.name);
        log.debug(`[RenderPipeline] postProcess added, name=${pass.name}`);
    }
    removePostProcessPass(pass) {
        const removed = this.postProcessPasses.delete(pass);
        if (removed) this.invalidatePipeline('render.pipeline.postProcessRemoved', pass.name);
        log.debug(`[RenderPipeline] postProcess removed, name=${pass.name}`);
    }
    execute(frame, options) {
        if (this.disposed) return;
        const renderer = frame.renderer;
        const entryState = this.captureRendererState(renderer);
        const outputTarget = options?.outputTarget ?? null;
        const viewport = options?.viewportOverride ?? frame.viewport;
        try {
            for (const phase of PHASE_ORDER){
                const phaseContributors = this.collectContributorsForPhase(phase);
                if (0 === phaseContributors.length) continue;
                const mgr = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__.getLoggerManager)();
                const phaseStart = mgr.isPerfEnabled() ? mgr.now() : 0;
                phaseContributors.sort((a, b)=>(a.renderPriority ?? 0) - (b.renderPriority ?? 0));
                const renderContext = {
                    viewId: frame.viewId,
                    outputTarget,
                    viewport,
                    viewRect: frame.viewRect,
                    renderer
                };
                const viewBaseline = {
                    renderTarget: outputTarget,
                    viewport: new __WEBPACK_EXTERNAL_MODULE_three__.Vector4(viewport.x, viewport.y, viewport.width, viewport.height),
                    scissor: new __WEBPACK_EXTERNAL_MODULE_three__.Vector4(viewport.x, viewport.y, viewport.width, viewport.height),
                    scissorTest: true,
                    autoClear: false
                };
                for (const contributor of phaseContributors){
                    this.restoreRendererState(renderer, viewBaseline);
                    try {
                        contributor.render(frame, phase, renderContext);
                    } catch (err) {
                        log.error(`[RenderPipeline] contributor failed, kind=${contributor.kind}, phase=${phase}, reason=${err instanceof Error ? err.message : String(err)}`);
                        this.eventBus.emit('engine.error', {
                            error: err instanceof Error ? err : new Error(String(err)),
                            context: `RenderPipeline: contributor "${contributor.kind}" in phase "${phase}" render failed`
                        });
                    } finally{
                        this.restoreRendererState(renderer, viewBaseline);
                    }
                }
                if (mgr.isPerfEnabled()) {
                    const elapsed = mgr.now() - phaseStart;
                    if (elapsed >= RENDER_PHASE_SLOW_MS) mgr.writeRecord({
                        level: __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__.LogLevel.DEBUG,
                        namespace: 'render:pipeline:perf',
                        message: `slow phase ${phase} ${elapsed.toFixed(1)}ms, view=${frame.viewId}, frame=${frame.frameNumber}, contributors=${phaseContributors.length}`,
                        timestamp: mgr.now()
                    });
                }
            }
        } finally{
            this.restoreRendererState(renderer, entryState);
        }
    }
    collectCameraClipBounds(context) {
        const result = new __WEBPACK_EXTERNAL_MODULE_three__.Box3();
        if (this.disposed) return result;
        for (const contributor of this.contributors)if (!!contributor.getCameraClipBounds) try {
            const bounds = contributor.getCameraClipBounds(context);
            if (!bounds || bounds.isEmpty() || !isFiniteBox(bounds)) continue;
            result.union(bounds);
        } catch (err) {
            log.warn(`[RenderPipeline] camera clip bounds query failed, kind=${contributor.kind}, reason=${err instanceof Error ? err.message : String(err)}`);
        }
        return result;
    }
    resize(_width, _height) {}
    collectRenderActivity(context) {
        if (this.disposed) return {
            needsNextFrame: false,
            reasons: []
        };
        const reasons = [];
        for (const contributor of Array.from(this.contributors))if (!!contributor.getRenderActivity) try {
            const report = contributor.getRenderActivity(context);
            if (!report?.needsNextFrame) continue;
            if (report.reasons?.length) reasons.push(...report.reasons);
            else reasons.push(contributor.kind);
        } catch (err) {
            log.warn(`[RenderPipeline] activity query failed, kind=${contributor.kind}, reason=${err instanceof Error ? err.message : String(err)}`);
        }
        return {
            needsNextFrame: reasons.length > 0,
            reasons
        };
    }
    dispose() {
        if (this.disposed) return;
        this.disposed = true;
        this.contributors.clear();
        for (const pass of Array.from(this.postProcessPasses))try {
            pass.dispose();
        } catch (err) {
            this.eventBus.emit('engine.error', {
                error: err instanceof Error ? err : new Error(String(err)),
                context: `RenderPipeline: post-process pass "${pass.name}" dispose failed`
            });
        }
        this.postProcessPasses.clear();
    }
    collectContributorsForPhase(phase) {
        const result = [];
        for (const contributor of Array.from(this.contributors))if (contributor.phases.includes(phase)) result.push(contributor);
        return result;
    }
    invalidatePipeline(reason, detail) {
        this.renderInvalidation?.invalidate(reason, {
            detail
        });
    }
    captureRendererState(renderer) {
        return {
            renderTarget: renderer.getRenderTarget(),
            viewport: 'function' == typeof renderer.getViewport ? renderer.getViewport(new __WEBPACK_EXTERNAL_MODULE_three__.Vector4()) : null,
            scissor: 'function' == typeof renderer.getScissor ? renderer.getScissor(new __WEBPACK_EXTERNAL_MODULE_three__.Vector4()) : null,
            scissorTest: 'function' == typeof renderer.getScissorTest ? renderer.getScissorTest() : false,
            autoClear: renderer.autoClear
        };
    }
    restoreRendererState(renderer, state) {
        renderer.setRenderTarget(state.renderTarget);
        if (state.viewport) renderer.setViewport(state.viewport.x, state.viewport.y, state.viewport.z, state.viewport.w);
        if (state.scissor) renderer.setScissor(state.scissor.x, state.scissor.y, state.scissor.z, state.scissor.w);
        renderer.setScissorTest(state.scissorTest);
        renderer.autoClear = state.autoClear;
    }
}
export { RenderPipeline };
