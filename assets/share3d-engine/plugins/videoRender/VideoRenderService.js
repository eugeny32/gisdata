import * as __WEBPACK_EXTERNAL_MODULE__FrameReader_js_0a045afa__ from "./FrameReader.js";
import * as __WEBPACK_EXTERNAL_MODULE__RenderStabilityGuard_js_8261a8ae__ from "./RenderStabilityGuard.js";
class VideoRenderService {
    createStabilityGuard(engine, options, frameReaderOptions) {
        const probe = {
            getDiagnostics: async ()=>({
                    ...await engine?.getGsplatRenderableDiagnostics?.(),
                    webgl: (0, __WEBPACK_EXTERNAL_MODULE__RenderStabilityGuard_js_8261a8ae__.collectWebGLDiagnostics)(engine?.renderer)
                }),
            waitForAssets: (signal)=>engine?.waitForAssets?.(signal),
            flushOrderUpload: (signal)=>engine?.flushGsplatOrderUpload?.(signal),
            readFrame: engine?.renderer ? async (signal)=>{
                throwIfAborted(signal);
                const frame = await this.createFrameReader({
                    renderer: engine.renderer,
                    renderTarget: engine.renderTarget,
                    preserveDrawingBuffer: engine.preserveDrawingBuffer
                }, {
                    ...frameReaderOptions,
                    allowBackbufferRead: frameReaderOptions?.allowBackbufferRead ?? Boolean(engine.preserveDrawingBuffer)
                }).readFrame({
                    frameNumber: 0,
                    timestampSeconds: 0,
                    deltaSeconds: 0,
                    width: engine.renderer?.domElement?.width ?? 1,
                    height: engine.renderer?.domElement?.height ?? 1,
                    pixelRatio: 1
                });
                throwIfAborted(signal);
                return frame;
            } : void 0
        };
        return (0, __WEBPACK_EXTERNAL_MODULE__RenderStabilityGuard_js_8261a8ae__.createRenderStabilityGuard)(probe, options);
    }
    createFrameReader(source, options) {
        if (!source.renderer) return (0, __WEBPACK_EXTERNAL_MODULE__FrameReader_js_0a045afa__.createMockFrameReader)();
        return (0, __WEBPACK_EXTERNAL_MODULE__FrameReader_js_0a045afa__.createFrameReader)(source, options);
    }
    async renderManualFrame(engine, request) {
        engine?.stop?.();
        await (engine?.renderManualFrame?.(request) ?? engine?.loop?.renderManualFrame?.(request));
    }
}
function createVideoRenderService() {
    return new VideoRenderService();
}
function throwIfAborted(signal) {
    if (signal?.aborted) throw new DOMException('Video render stabilization was cancelled.', 'AbortError');
}
export { VideoRenderService, createVideoRenderService };
