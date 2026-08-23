const DEFAULT_TIMEOUT_MS = 5000;
const DEFAULT_POLL_INTERVAL_MS = 16;
const DEFAULT_CONSECUTIVE_NON_EMPTY_FRAMES = 2;
class RenderStabilityGuard {
    #timeoutMs;
    #pollIntervalMs;
    #requiredConsecutiveNonEmptyFrames;
    constructor(probe, options = {}){
        this.probe = probe;
        this.#timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
        this.#pollIntervalMs = options.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS;
        this.#requiredConsecutiveNonEmptyFrames = options.requiredConsecutiveNonEmptyFrames ?? DEFAULT_CONSECUTIVE_NON_EMPTY_FRAMES;
    }
    async waitForGsplatRenderable(signal) {
        const startMs = nowMs();
        let diagnostics = normalizeGsplatDiagnostics({
            stage: 'pending'
        });
        let assetsWaited = false;
        while(nowMs() - startMs <= this.#timeoutMs){
            try {
                throwIfAborted(signal);
                if (!assetsWaited) {
                    await withRemainingTimeout(this.probe.waitForAssets?.(signal), startMs, this.#timeoutMs, signal);
                    assetsWaited = true;
                }
                const snapshot = await withRemainingTimeout(this.probe.getDiagnostics(), startMs, this.#timeoutMs, signal);
                diagnostics = normalizeGsplatDiagnostics({
                    ...diagnostics,
                    ...snapshot,
                    stage: 'pending'
                });
                if (diagnostics.webgl?.contextLost) return normalizeGsplatDiagnostics({
                    ...diagnostics,
                    stage: 'error',
                    failureReason: diagnostics.webgl.lastContextLostReason ?? 'webgl-context-lost',
                    timeoutMs: this.#timeoutMs
                });
                if (diagnostics.pendingOrderUpload) {
                    await withRemainingTimeout(this.probe.flushOrderUpload?.(signal), startMs, this.#timeoutMs, signal);
                    diagnostics = normalizeGsplatDiagnostics({
                        ...diagnostics,
                        ...await withRemainingTimeout(this.probe.getDiagnostics(), startMs, this.#timeoutMs, signal),
                        stage: 'pending'
                    });
                }
                if (canReadFrame(diagnostics)) {
                    const frame = await withRemainingTimeout(this.probe.readFrame?.(signal), startMs, this.#timeoutMs, signal);
                    diagnostics = normalizeGsplatDiagnostics({
                        ...diagnostics,
                        readback: frame?.diagnostics ?? diagnostics.readback,
                        consecutiveNonEmptyFrames: frameHasNonEmptyPixels(frame) ? diagnostics.consecutiveNonEmptyFrames + 1 : 0,
                        stage: 'pending'
                    });
                }
                if (isReady(diagnostics, this.#requiredConsecutiveNonEmptyFrames)) return normalizeGsplatDiagnostics({
                    ...diagnostics,
                    stage: 'ready'
                });
            } catch (error) {
                if (isAbortError(error)) throw error;
                return normalizeGsplatDiagnostics({
                    ...diagnostics,
                    stage: 'error',
                    failureReason: error instanceof Error ? error.message : 'GSplat stabilize failed.',
                    timeoutMs: this.#timeoutMs
                });
            }
            await sleep(this.#pollIntervalMs, signal);
        }
        return normalizeGsplatDiagnostics({
            ...diagnostics,
            stage: 'timeout',
            timeoutMs: this.#timeoutMs,
            failureReason: firstPendingReason(diagnostics, this.#requiredConsecutiveNonEmptyFrames)
        });
    }
}
function createRenderStabilityGuard(probe, options = {}) {
    return new RenderStabilityGuard(probe, options);
}
function normalizeGsplatDiagnostics(diagnostics = {}) {
    return {
        assetLoaded: diagnostics.assetLoaded ?? false,
        gpuPrepared: diagnostics.gpuPrepared ?? false,
        sortGeneration: diagnostics.sortGeneration,
        pendingOrderUpload: diagnostics.pendingOrderUpload ?? false,
        orderUploadFlushed: diagnostics.orderUploadFlushed ?? false,
        visibleCount: diagnostics.visibleCount,
        consecutiveNonEmptyFrames: diagnostics.consecutiveNonEmptyFrames ?? 0,
        stage: diagnostics.stage ?? 'pending',
        resourceProgress: diagnostics.resourceProgress,
        webgl: diagnostics.webgl,
        readback: diagnostics.readback,
        timeoutMs: diagnostics.timeoutMs,
        failureReason: diagnostics.failureReason
    };
}
function collectWebGLDiagnostics(renderer) {
    const gl = renderer?.getContext?.();
    if (!gl) return;
    return {
        renderer: stringifyGlParameter(gl.getParameter?.(gl.RENDERER)),
        vendor: stringifyGlParameter(gl.getParameter?.(gl.VENDOR)),
        version: stringifyGlParameter(gl.getParameter?.(gl.VERSION)),
        extensions: gl.getSupportedExtensions?.() ?? void 0,
        contextLost: gl.isContextLost?.() ?? false,
        shaderCompileErrors: collectShaderCompileErrors(gl)
    };
}
function collectShaderCompileErrors(gl) {
    const program = gl.getParameter?.(gl.CURRENT_PROGRAM);
    if (!program) return;
    const messages = [
        ...(gl.getAttachedShaders?.(program) ?? []).map((shader)=>gl.getShaderInfoLog?.(shader)?.trim()),
        gl.getProgramParameter?.(program, gl.LINK_STATUS) === false ? 'program-link-failed' : void 0
    ].filter((message)=>Boolean(message));
    return messages.length > 0 ? messages : void 0;
}
function isReady(diagnostics, requiredNonEmptyFrames) {
    return diagnostics.assetLoaded && diagnostics.gpuPrepared && !diagnostics.pendingOrderUpload && diagnostics.orderUploadFlushed && (diagnostics.visibleCount ?? 0) > 0 && diagnostics.consecutiveNonEmptyFrames >= requiredNonEmptyFrames;
}
function canReadFrame(diagnostics) {
    return diagnostics.assetLoaded && diagnostics.gpuPrepared && !diagnostics.pendingOrderUpload && diagnostics.orderUploadFlushed && (diagnostics.visibleCount ?? 0) > 0;
}
function frameHasNonEmptyPixels(frame) {
    if (!frame) return false;
    return frame.data.some((value)=>0 !== value);
}
function firstPendingReason(diagnostics, requiredNonEmptyFrames) {
    if (!diagnostics.assetLoaded) return 'asset-not-loaded';
    if (!diagnostics.gpuPrepared) return 'gpu-not-prepared';
    if (diagnostics.pendingOrderUpload) return 'pending-order-upload';
    if (!diagnostics.orderUploadFlushed) return 'order-upload-not-flushed';
    if ((diagnostics.visibleCount ?? 0) <= 0) return 'no-visible-splats';
    if (diagnostics.consecutiveNonEmptyFrames < requiredNonEmptyFrames) return 'non-empty-frame-threshold-not-met';
    return 'unknown';
}
function stringifyGlParameter(value) {
    return 'string' == typeof value && value.length > 0 ? value : void 0;
}
function nowMs() {
    return 'undefined' != typeof performance && 'function' == typeof performance.now ? performance.now() : Date.now();
}
function throwIfAborted(signal) {
    if (signal?.aborted) throw new DOMException('Video render stabilization was cancelled.', 'AbortError');
}
function isAbortError(error) {
    return error instanceof DOMException && 'AbortError' === error.name;
}
function withRemainingTimeout(promise, startMs, timeoutMs, signal) {
    throwIfAborted(signal);
    const remainingMs = Math.max(0, timeoutMs - (nowMs() - startMs));
    const operation = Promise.resolve(promise);
    let timeoutId;
    let abortHandler;
    const timeout = new Promise((_, reject)=>{
        timeoutId = setTimeout(()=>{
            reject(new Error('GSplat stabilize probe timed out.'));
        }, remainingMs);
    });
    const abort = new Promise((_, reject)=>{
        abortHandler = ()=>reject(new DOMException('Video render stabilization was cancelled.', 'AbortError'));
        signal?.addEventListener('abort', abortHandler, {
            once: true
        });
    });
    return Promise.race([
        operation,
        timeout,
        abort
    ]).finally(()=>{
        if (void 0 !== timeoutId) clearTimeout(timeoutId);
        if (abortHandler) signal?.removeEventListener('abort', abortHandler);
    });
}
function sleep(ms, signal) {
    throwIfAborted(signal);
    return new Promise((resolve, reject)=>{
        const timeout = setTimeout(()=>{
            cleanup();
            resolve();
        }, ms);
        const onAbort = ()=>{
            cleanup();
            reject(new DOMException('Video render stabilization was cancelled.', 'AbortError'));
        };
        const cleanup = ()=>{
            clearTimeout(timeout);
            signal?.removeEventListener('abort', onAbort);
        };
        signal?.addEventListener('abort', onAbort, {
            once: true
        });
    });
}
export { RenderStabilityGuard, collectWebGLDiagnostics, createRenderStabilityGuard, normalizeGsplatDiagnostics };
