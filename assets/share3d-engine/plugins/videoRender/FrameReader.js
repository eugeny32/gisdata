import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__ from "../../shared/logging/index.js";
const DEFAULT_MAX_PIXEL_COUNT = 8294400;
const DEFAULT_MAX_PENDING_READBACKS = 1;
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__.getLoggerManager)().getLogger('videoRender:readback');
class FrameReader {
    #pendingReadbacks;
    constructor(source, options = {}){
        this.source = source;
        this.options = options;
        this.#pendingReadbacks = 0;
    }
    async readFrame(request) {
        this.#validateRequest(request);
        const maxPendingReadbacks = this.options.maxPendingReadbacks ?? DEFAULT_MAX_PENDING_READBACKS;
        if (this.#pendingReadbacks >= maxPendingReadbacks) {
            log.warn(`[FrameReader] readback backpressure, pending=${this.#pendingReadbacks}, maxPending=${maxPendingReadbacks}`);
            throw createReadbackError('VIDEO_RENDER_READBACK_BACKPRESSURE', 'Frame readback backpressure limit reached.');
        }
        const pixelCount = request.width * request.height;
        const maxPixelCount = this.options.maxPixelCount ?? DEFAULT_MAX_PIXEL_COUNT;
        if (pixelCount > maxPixelCount) {
            log.warn(`[FrameReader] readback rejected, reason=too-large, width=${request.width}, height=${request.height}, pixels=${pixelCount}, maxPixels=${maxPixelCount}`);
            throw createReadbackError('VIDEO_RENDER_READBACK_TOO_LARGE', 'Frame readback pixel count exceeds configured limit.');
        }
        const readWidth = Math.max(1, Math.round(request.width * request.pixelRatio));
        const readHeight = Math.max(1, Math.round(request.height * request.pixelRatio));
        const readPixelCount = readWidth * readHeight;
        if (readPixelCount > maxPixelCount) {
            log.warn(`[FrameReader] readback rejected, reason=too-large-after-ratio, width=${readWidth}, height=${readHeight}, pixels=${readPixelCount}, maxPixels=${maxPixelCount}`);
            throw createReadbackError('VIDEO_RENDER_READBACK_TOO_LARGE', 'Frame readback pixel count exceeds configured limit.');
        }
        const readBuffer = new Uint8Array(4 * readPixelCount);
        const startMs = nowMs();
        this.#pendingReadbacks += 1;
        try {
            const strategy = await this.#readBottomLeftRgba(readWidth, readHeight, readBuffer);
            flipRgbaRowsInPlace(readBuffer, readWidth, readHeight);
            const buffer = readWidth === request.width && readHeight === request.height ? readBuffer : resizeRgbaNearest(readBuffer, readWidth, readHeight, request.width, request.height);
            const durationMs = nowMs() - startMs;
            const diagnostics = {
                strategy,
                durationMs,
                byteLength: buffer.byteLength,
                maxPixelCount,
                pendingReadbacks: this.#pendingReadbacks - 1,
                backpressure: durationMs > (this.options.warnIfDurationExceedsMs ?? Number.POSITIVE_INFINITY),
                origin: 'top-left',
                colorSpace: this.options.colorSpace ?? 'srgb',
                alphaMode: this.options.alphaMode ?? 'straight',
                yFlipped: true
            };
            if (diagnostics.backpressure) log.warn(`[FrameReader] slow readback, frame=${request.frameNumber}, strategy=${strategy}, width=${readWidth}, height=${readHeight}, duration=${durationMs.toFixed(1)}ms`);
            return {
                width: request.width,
                height: request.height,
                pixelRatio: request.pixelRatio,
                frameNumber: request.frameNumber,
                timestampSeconds: request.timestampSeconds,
                data: buffer,
                colorSpace: diagnostics.colorSpace ?? 'srgb',
                alphaMode: diagnostics.alphaMode ?? 'straight',
                origin: 'top-left',
                yFlipped: true,
                diagnostics
            };
        } finally{
            this.#pendingReadbacks -= 1;
        }
    }
    async #readBottomLeftRgba(width, height, buffer) {
        const renderer = this.source.renderer;
        if (renderer?.readRenderTargetPixels && this.source.renderTarget) {
            await renderer.readRenderTargetPixels(this.source.renderTarget, 0, 0, width, height, buffer);
            return 'render-target-readpixels';
        }
        if (!this.options.allowBackbufferRead || !this.source.preserveDrawingBuffer) {
            log.warn('[FrameReader] readback source unavailable, reason=render-target-required');
            throw createReadbackError('VIDEO_RENDER_READBACK_SOURCE_UNAVAILABLE', 'FrameReader requires a render target readPixels source or explicit preserveDrawingBuffer backbuffer read.');
        }
        const gl = renderer?.getContext?.();
        if (!gl?.readPixels) {
            log.warn('[FrameReader] readback source unavailable, reason=readPixels-missing');
            throw createReadbackError('VIDEO_RENDER_READBACK_SOURCE_UNAVAILABLE', 'WebGL readPixels is unavailable.');
        }
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, buffer);
        return 'backbuffer-readpixels';
    }
    #validateRequest(request) {
        if (request.width <= 0 || request.height <= 0 || request.pixelRatio <= 0) {
            log.warn(`[FrameReader] invalid readback size, width=${request.width}, height=${request.height}, pixelRatio=${request.pixelRatio}`);
            throw createReadbackError('VIDEO_RENDER_READBACK_INVALID_SIZE', 'Frame readback size must be positive.');
        }
    }
}
function createFrameReader(source, options = {}) {
    return new FrameReader(source, options);
}
function createMockFrameReader() {
    return {
        async readFrame (request) {
            const byteLength = request.width * request.height * 4;
            return {
                width: request.width,
                height: request.height,
                pixelRatio: request.pixelRatio,
                frameNumber: request.frameNumber,
                timestampSeconds: request.timestampSeconds,
                data: new Uint8Array(byteLength),
                colorSpace: 'srgb',
                alphaMode: 'straight',
                origin: 'top-left',
                yFlipped: true,
                diagnostics: {
                    strategy: 'mock',
                    byteLength,
                    origin: 'top-left',
                    colorSpace: 'srgb',
                    alphaMode: 'straight',
                    yFlipped: true
                }
            };
        }
    };
}
function flipRgbaRowsInPlace(data, width, height) {
    const rowLength = 4 * width;
    const scratch = new Uint8Array(rowLength);
    for(let top = 0, bottom = height - 1; top < bottom; top += 1, bottom -= 1){
        const topOffset = top * rowLength;
        const bottomOffset = bottom * rowLength;
        scratch.set(data.subarray(topOffset, topOffset + rowLength));
        data.copyWithin(topOffset, bottomOffset, bottomOffset + rowLength);
        data.set(scratch, bottomOffset);
    }
}
function resizeRgbaNearest(source, sourceWidth, sourceHeight, targetWidth, targetHeight) {
    const target = new Uint8Array(targetWidth * targetHeight * 4);
    for(let y = 0; y < targetHeight; y += 1){
        const sourceY = Math.min(sourceHeight - 1, Math.floor(y / targetHeight * sourceHeight));
        for(let x = 0; x < targetWidth; x += 1){
            const sourceX = Math.min(sourceWidth - 1, Math.floor(x / targetWidth * sourceWidth));
            const sourceOffset = (sourceY * sourceWidth + sourceX) * 4;
            const targetOffset = (y * targetWidth + x) * 4;
            target[targetOffset] = source[sourceOffset];
            target[targetOffset + 1] = source[sourceOffset + 1];
            target[targetOffset + 2] = source[sourceOffset + 2];
            target[targetOffset + 3] = source[sourceOffset + 3];
        }
    }
    return target;
}
function createReadbackError(code, message) {
    return Object.assign(new Error(message), {
        code
    });
}
function nowMs() {
    return 'undefined' != typeof performance && 'function' == typeof performance.now ? performance.now() : Date.now();
}
export { FrameReader, createFrameReader, createMockFrameReader, flipRgbaRowsInPlace, resizeRgbaNearest };
