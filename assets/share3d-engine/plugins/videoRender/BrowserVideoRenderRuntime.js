import * as __WEBPACK_EXTERNAL_MODULE__diagnostics_js_a9f91375__ from "./diagnostics.js";
import * as __WEBPACK_EXTERNAL_MODULE__RenderStabilityGuard_js_8261a8ae__ from "./RenderStabilityGuard.js";
import * as __WEBPACK_EXTERNAL_MODULE__VideoRenderService_js_bfbc0bcd__ from "./VideoRenderService.js";
class BrowserVideoRenderRuntimeImpl {
    #state;
    #engine;
    #lastFrame;
    #lastRenderedFrame;
    #disposed;
    #service;
    #defaultFrameReader;
    constructor(config){
        this.config = config;
        this.#state = 'idle';
        this.#disposed = false;
        this.#service = (0, __WEBPACK_EXTERNAL_MODULE__VideoRenderService_js_bfbc0bcd__.createVideoRenderService)();
        this.diagnostics = {
            state: this.#state,
            canvas: {
                width: config.width,
                height: config.height,
                pixelRatio: config.pixelRatio ?? 1
            },
            preset: (0, __WEBPACK_EXTERNAL_MODULE__diagnostics_js_a9f91375__.createVideoRenderPresetDiagnostics)(config.additionalPlugins)
        };
    }
    get state() {
        return this.#state;
    }
    async initialize() {
        try {
            if (this.config.engineFactory) {
                this.#engine = await this.config.engineFactory(this.config);
                this.#engine.stop?.();
            }
            this.#setState('ready');
            this.#emit('create', 'runtime-ready');
        } catch (error) {
            this.#throwStageError(error, 'create', this.#classifyStageErrorCode(error, 'create'), true);
        }
    }
    async loadScene(_scene) {
        this.#assertActive('scene-load');
        this.#setState('loading');
        this.#emit('scene-load', 'scene-load-started');
        try {
            await (this.config.sceneLoader?.(_scene, this.#engine) ?? this.#engine?.loadScene?.(_scene));
            this.#setState('ready');
            this.#emit('scene-load', 'scene-load-complete');
        } catch (error) {
            this.#throwStageError(error, 'scene-load', this.#classifyStageErrorCode(error, 'scene-load'), true);
        }
    }
    async waitForGsplatRenderable(signal) {
        this.#assertActive('gsplat-stabilize');
        this.#emit('gsplat-stabilize', 'gsplat-stabilize-started');
        const guard = this.config.stabilityGuard ?? this.#service.createStabilityGuard(this.#engine, this.config.stabilityOptions, this.config.frameReaderOptions);
        const gsplat = (0, __WEBPACK_EXTERNAL_MODULE__RenderStabilityGuard_js_8261a8ae__.normalizeGsplatDiagnostics)(await guard.waitForGsplatRenderable(signal));
        this.diagnostics.gsplat = gsplat;
        if (gsplat.webgl) this.diagnostics.webgl = gsplat.webgl;
        if ('timeout' === gsplat.stage || 'error' === gsplat.stage) {
            const error = {
                code: 'timeout' === gsplat.stage ? 'VIDEO_RENDER_GSPLAT_STABILIZE_TIMEOUT' : this.#classifyStageErrorCode(gsplat.failureReason, 'gsplat-stabilize'),
                stage: 'gsplat-stabilize',
                message: gsplat.failureReason ?? 'GSplat renderable stabilization failed.',
                retryable: true
            };
            this.diagnostics.lastError = error;
            this.#emit('gsplat-stabilize', `gsplat-stabilize-${gsplat.stage}`);
            throw Object.assign(new Error(error.message), {
                code: error.code,
                diagnostics: (0, __WEBPACK_EXTERNAL_MODULE__diagnostics_js_a9f91375__.sanitizeVideoRenderDiagnostics)(this.diagnostics)
            });
        }
        this.#emit('gsplat-stabilize', 'gsplat-stabilize-ready');
        return gsplat;
    }
    async applyClipTemplate(template) {
        await this.applyTimelineTemplate(template);
    }
    async applyTimelineTemplate(template) {
        this.#assertActive('template-apply');
        await this.#getTimelineAdapter()?.apply(template);
        this.#emit('template-apply', 'template-apply-placeholder');
    }
    async renderFrame(request) {
        this.#assertActive('manual-frame');
        this.#validateManualFrameRequest(request);
        this.diagnostics.frame = request;
        this.diagnostics.renderTarget = {
            width: request.width,
            height: request.height,
            pixelRatio: request.pixelRatio
        };
        this.#setState('rendering');
        this.#emit('manual-frame', 'manual-frame-placeholder', request.frameNumber);
        try {
            await this.#getTimelineAdapter()?.seekAndApply(request.timestampSeconds);
            await this.#service.renderManualFrame(this.#engine, request);
        } catch (error) {
            this.#throwRenderFrameError(error, request);
        }
        this.#lastFrame = request;
        this.#lastRenderedFrame = request;
        this.#setState('ready');
        return this.diagnostics;
    }
    async readFrame() {
        this.#assertActive('readback');
        const frame = this.#lastRenderedFrame;
        if (!frame) {
            const error = {
                code: 'VIDEO_RENDER_READBACK_WITHOUT_FRAME',
                stage: 'readback',
                message: 'readFrame requires a successful renderFrame call first.',
                retryable: false
            };
            this.diagnostics.lastError = error;
            throw Object.assign(new Error(error.message), {
                code: error.code,
                diagnostics: (0, __WEBPACK_EXTERNAL_MODULE__diagnostics_js_a9f91375__.sanitizeVideoRenderDiagnostics)(this.diagnostics)
            });
        }
        const reader = this.config.frameReader ?? this.#createDefaultFrameReader();
        const result = await reader.readFrame(frame);
        this.diagnostics.readback = result.diagnostics;
        this.#emit('readback', 'readback-complete', frame.frameNumber);
        return result;
    }
    async dispose() {
        if (this.#disposed) return;
        this.#disposed = true;
        let cleanupError;
        try {
            await this.#getTimelineAdapter()?.clear();
        } catch (error) {
            cleanupError = error;
        } finally{
            try {
                await this.#engine?.dispose?.();
            } catch (error) {
                cleanupError ??= error;
            }
            this.#setState('disposed');
            if (cleanupError) this.diagnostics.lastError = {
                code: this.#classifyStageErrorCode(cleanupError, 'dispose'),
                stage: 'dispose',
                message: cleanupError instanceof Error ? cleanupError.message : 'Video render runtime cleanup failed.',
                retryable: false
            };
            this.#emit('dispose', 'runtime-disposed');
        }
    }
    #setState(state) {
        this.#state = state;
        this.diagnostics.state = state;
    }
    #assertActive(stage) {
        if (!this.#disposed) return;
        const error = {
            code: 'VIDEO_RENDER_RUNTIME_DISPOSED',
            stage,
            message: 'Video render runtime has been disposed.',
            retryable: false
        };
        this.diagnostics.lastError = error;
        throw Object.assign(new Error(error.message), {
            code: error.code,
            diagnostics: (0, __WEBPACK_EXTERNAL_MODULE__diagnostics_js_a9f91375__.sanitizeVideoRenderDiagnostics)(this.diagnostics)
        });
    }
    #validateManualFrameRequest(request) {
        const entries = [
            [
                'frameNumber',
                request.frameNumber
            ],
            [
                'timestampSeconds',
                request.timestampSeconds
            ],
            [
                'deltaSeconds',
                request.deltaSeconds
            ],
            [
                'width',
                request.width
            ],
            [
                'height',
                request.height
            ],
            [
                'pixelRatio',
                request.pixelRatio
            ]
        ];
        const invalid = entries.find(([, value])=>void 0 === value || !Number.isFinite(value));
        if (invalid) this.#throwFrameError(`Invalid manual frame parameter: ${invalid[0]}`, request);
        if (!Number.isInteger(request.frameNumber) || request.frameNumber < 0) this.#throwFrameError('Invalid manual frame parameter: frameNumber', request);
        if (request.timestampSeconds < 0 || request.deltaSeconds < 0) this.#throwFrameError('Invalid manual frame parameter: timestampSeconds/deltaSeconds', request);
        if (request.width <= 0 || request.height <= 0 || request.pixelRatio <= 0) this.#throwFrameError('Invalid manual frame parameter: width/height/pixelRatio', request);
    }
    #throwFrameError(message, request) {
        const error = {
            code: 'VIDEO_RENDER_INVALID_MANUAL_FRAME',
            stage: 'manual-frame',
            message,
            retryable: false,
            frameNumber: request.frameNumber
        };
        this.diagnostics.lastError = error;
        throw Object.assign(new Error(message), {
            code: error.code,
            diagnostics: (0, __WEBPACK_EXTERNAL_MODULE__diagnostics_js_a9f91375__.sanitizeVideoRenderDiagnostics)(this.diagnostics)
        });
    }
    #throwRenderFrameError(cause, request) {
        const message = cause instanceof Error ? cause.message : 'Manual frame render failed.';
        const error = {
            code: this.#classifyStageErrorCode(cause, 'manual-frame'),
            stage: 'manual-frame',
            message,
            retryable: true,
            frameNumber: request.frameNumber
        };
        this.#setState('error');
        this.diagnostics.lastError = error;
        this.#emit('manual-frame', 'manual-frame-failed', request.frameNumber);
        throw Object.assign(new Error(message), {
            code: error.code,
            cause,
            diagnostics: (0, __WEBPACK_EXTERNAL_MODULE__diagnostics_js_a9f91375__.sanitizeVideoRenderDiagnostics)(this.diagnostics)
        });
    }
    #classifyStageErrorCode(cause, fallbackStage) {
        const message = 'string' == typeof cause ? cause : cause instanceof Error ? `${cause.name} ${cause.message}` : '';
        const normalized = message.toLowerCase();
        if (normalized.includes('context lost') || normalized.includes('webgl-context-lost')) return 'VIDEO_RENDER_WEBGL_CONTEXT_LOST';
        if (normalized.includes('page crash') || normalized.includes('target closed') || normalized.includes('browser has been closed')) return 'VIDEO_RENDER_PAGE_CRASHED';
        if (normalized.includes('worker terminate') || normalized.includes('worker terminated') || normalized.includes('worker was terminated')) return 'VIDEO_RENDER_WORKER_TERMINATED';
        if ('scene-load' === fallbackStage) return 'VIDEO_RENDER_SCENE_LOAD_FAILED';
        if ('manual-frame' === fallbackStage) return 'VIDEO_RENDER_MANUAL_FRAME_FAILED';
        if ('gsplat-stabilize' === fallbackStage) return 'VIDEO_RENDER_GSPLAT_STABILIZE_FAILED';
        if ('dispose' === fallbackStage) return 'VIDEO_RENDER_RUNTIME_DISPOSE_FAILED';
        return 'VIDEO_RENDER_RUNTIME_CREATE_FAILED';
    }
    #throwStageError(cause, stage, code, retryable) {
        const message = cause instanceof Error ? cause.message : 'Video render stage failed.';
        const error = {
            code,
            stage,
            message,
            retryable
        };
        this.#setState('error');
        this.diagnostics.lastError = error;
        this.#emit(stage, `${stage}-failed`);
        throw Object.assign(new Error(message), {
            code: error.code,
            cause,
            diagnostics: (0, __WEBPACK_EXTERNAL_MODULE__diagnostics_js_a9f91375__.sanitizeVideoRenderDiagnostics)(this.diagnostics)
        });
    }
    #createDefaultFrameReader() {
        this.#defaultFrameReader ??= this.#service.createFrameReader({
            renderer: this.#engine?.renderer,
            renderTarget: this.#engine?.renderTarget,
            preserveDrawingBuffer: this.#engine?.preserveDrawingBuffer
        }, this.config.frameReaderOptions);
        return this.#defaultFrameReader;
    }
    #getTimelineAdapter() {
        return this.config.timelineAdapter ?? this.config.clipTemplateApplier;
    }
    #emit(stage, name, frameNumber) {
        const event = {
            stage,
            name,
            frameNumber,
            diagnostics: (0, __WEBPACK_EXTERNAL_MODULE__diagnostics_js_a9f91375__.sanitizeVideoRenderDiagnostics)(this.diagnostics)
        };
        this.config.onProgress?.(event);
        this.config.onDiagnosticEvent?.(event);
    }
}
async function createBrowserVideoRenderRuntime(config) {
    const runtime = new BrowserVideoRenderRuntimeImpl(config);
    await runtime.initialize();
    return runtime;
}
export { createBrowserVideoRenderRuntime };
