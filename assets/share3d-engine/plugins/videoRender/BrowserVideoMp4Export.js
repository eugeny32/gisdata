import * as __WEBPACK_EXTERNAL_MODULE_mediabunny__ from "mediabunny";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__ from "../../shared/logging/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__BrowserVideoRenderRuntime_js_0f214be7__ from "./BrowserVideoRenderRuntime.js";
import * as __WEBPACK_EXTERNAL_MODULE__ManualFrameClock_js_c87fc369__ from "./ManualFrameClock.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_88c7056b__.getLoggerManager)().getLogger('videoRender');
function normalizeBrowserVideoMp4ExportSettings(input = {}) {
    return {
        width: clampEvenInteger(input.width, 64, 3840, 1280),
        height: clampEvenInteger(input.height, 64, 2160, 720),
        fps: clampInteger(input.fps, 1, 60, 24),
        durationSeconds: clampNumber(input.durationSeconds, 0.1, 60, 4),
        pixelRatio: clampNumber(input.pixelRatio, 0.25, 4, 1),
        quality: clampNumber(input.quality, 0.1, 1, 0.82)
    };
}
function createBrowserVideoMp4FrameEncoder(settings = {}) {
    if ('undefined' == typeof VideoEncoder) throw new Error(createMissingVideoEncoderMessage());
    let output = null;
    let source = null;
    let encoder = null;
    let encoderError = null;
    const pendingPacketWrites = new Set();
    let cleanupPromise = null;
    let stopped = false;
    let finalized = false;
    let width = normalizeBrowserVideoMp4ExportSettings(settings).width;
    let height = normalizeBrowserVideoMp4ExportSettings(settings).height;
    let fps = normalizeBrowserVideoMp4ExportSettings(settings).fps;
    let bitrate = estimateVideoBitsPerSecond(normalizeBrowserVideoMp4ExportSettings(settings));
    let codec = createH264CodecString(height);
    const createEncoder = ()=>{
        if (!source) throw new Error('Video encoder source has not been started.');
        encoderError = null;
        const nextEncoder = new VideoEncoder({
            output: (chunk, meta)=>{
                const encodedPacket = __WEBPACK_EXTERNAL_MODULE_mediabunny__.EncodedPacket.fromEncodedChunk(chunk);
                const packetWrite = source?.add(encodedPacket, meta) ?? Promise.resolve();
                pendingPacketWrites.add(packetWrite);
                packetWrite.catch((error)=>{
                    encoderError = error;
                }).finally(()=>{
                    pendingPacketWrites.delete(packetWrite);
                });
            },
            error: (error)=>{
                encoderError = error;
            }
        });
        nextEncoder.configure({
            codec,
            width,
            height,
            bitrate
        });
        return nextEncoder;
    };
    return {
        mimeType: 'video/mp4',
        extension: 'mp4',
        async start (nextSettings) {
            width = nextSettings.width;
            height = nextSettings.height;
            fps = Math.max(1, nextSettings.fps);
            bitrate = estimateVideoBitsPerSecond(nextSettings);
            codec = createH264CodecString(nextSettings.height);
            await cleanupPromise;
            cleanupPromise = null;
            stopped = false;
            finalized = false;
            pendingPacketWrites.clear();
            output = new __WEBPACK_EXTERNAL_MODULE_mediabunny__.Output({
                format: new __WEBPACK_EXTERNAL_MODULE_mediabunny__.Mp4OutputFormat({
                    fastStart: 'in-memory'
                }),
                target: new __WEBPACK_EXTERNAL_MODULE_mediabunny__.BufferTarget()
            });
            source = new __WEBPACK_EXTERNAL_MODULE_mediabunny__.EncodedVideoPacketSource('avc');
            output.addVideoTrack(source, {
                rotation: 0,
                frameRate: fps
            });
            await output.start();
            encoder = createEncoder();
        },
        async addFrame (frame, request, signal) {
            assertNotStopped(stopped);
            if (!encoder) throw new Error('Video encoder has not been started.');
            throwIfAborted(signal);
            const videoFrame = new VideoFrame(frame.data, {
                format: 'RGBA',
                codedWidth: frame.width,
                codedHeight: frame.height,
                timestamp: Math.floor(1000000 * request.timestampSeconds),
                duration: Math.floor(1000000 / fps)
            });
            try {
                while(encoder.encodeQueueSize > 5){
                    throwIfAborted(signal);
                    await sleep(1, signal);
                }
                let forceKeyFrame = 0 === request.frameNumber;
                if ('closed' === encoder.state && encoderError?.message?.includes('reclaimed')) {
                    encoder = createEncoder();
                    forceKeyFrame = true;
                }
                if (encoderError) throw encoderError;
                encoder.encode(videoFrame, {
                    keyFrame: forceKeyFrame
                });
            } finally{
                videoFrame.close();
            }
        },
        async finish (signal) {
            if (!output) throw new Error('Video encoder has not been started.');
            throwIfAborted(signal);
            if (encoder && 'closed' !== encoder.state) await withAbort(encoder.flush(), signal);
            throwIfAborted(signal);
            await withAbort(Promise.all(pendingPacketWrites), signal);
            if (encoderError) throw encoderError;
            throwIfAborted(signal);
            await withAbort(output.finalize(), signal);
            stopped = true;
            finalized = true;
            const buffer = output.target.buffer;
            if (!buffer) throw new Error('Video encoder did not produce an output buffer.');
            return new Blob([
                buffer
            ], {
                type: 'video/mp4'
            });
        },
        cancel () {
            stopped = true;
            if (encoder && 'closed' !== encoder.state) encoder.close();
            cleanupPromise = output && !finalized ? output.cancel() : Promise.resolve();
            pendingPacketWrites.clear();
            encoder = null;
            output = null;
            source = null;
            return cleanupPromise;
        },
        async dispose () {
            stopped = true;
            if (encoder && 'closed' !== encoder.state) encoder.close();
            cleanupPromise ??= output && !finalized ? output.cancel() : Promise.resolve();
            pendingPacketWrites.clear();
            encoder = null;
            source = null;
            output = null;
            await cleanupPromise;
            cleanupPromise = null;
        }
    };
}
async function exportBrowserVideoMp4(options) {
    const settings = normalizeBrowserVideoMp4ExportSettings(options.settings);
    const totalFrames = Math.max(1, Math.ceil(settings.durationSeconds * settings.fps));
    const diagnosticEvents = [];
    let runtime = options.runtime ?? null;
    const ownsRuntime = !options.runtime;
    let encoder = null;
    let framesEncoded = 0;
    const progress = (stage, frameNumber, message, diagnostics)=>{
        options.onProgress?.({
            stage,
            frameNumber,
            totalFrames,
            progress: totalFrames <= 0 ? 0 : frameNumber / totalFrames,
            message,
            diagnostics
        });
    };
    try {
        encoder = options.encoder ?? createBrowserVideoMp4FrameEncoder(settings);
        throwIfAborted(options.signal);
        progress('runtime', 0, 'Preparing video runtime.');
        runtime ??= await (0, __WEBPACK_EXTERNAL_MODULE__BrowserVideoRenderRuntime_js_0f214be7__.createBrowserVideoRenderRuntime)({
            container: options.container,
            width: settings.width,
            height: settings.height,
            pixelRatio: settings.pixelRatio,
            ...options.runtimeConfig,
            onDiagnosticEvent: (event)=>{
                diagnosticEvents.push(event);
                options.runtimeConfig?.onDiagnosticEvent?.(event);
            },
            onProgress: (event)=>{
                options.runtimeConfig?.onProgress?.(event);
            }
        });
        progress('stabilize', 0, 'Waiting for render stability.', runtime.diagnostics);
        await runtime.loadScene(options.scene);
        await runtime.waitForGsplatRenderable(options.signal);
        if (void 0 !== options.timelineTemplate) {
            progress('template', 0, 'Applying timeline template.', runtime.diagnostics);
            await runtime.applyTimelineTemplate(options.timelineTemplate);
        }
        progress('encode', 0, 'Starting browser encoder.', runtime.diagnostics);
        await encoder.start(settings);
        const clock = new __WEBPACK_EXTERNAL_MODULE__ManualFrameClock_js_c87fc369__.ManualFrameClock(settings);
        for(let frameNumber = 0; frameNumber < totalFrames; frameNumber += 1){
            throwIfAborted(options.signal);
            const request = clock.frameAt(frameNumber);
            progress('render', frameNumber, `Rendering frame ${frameNumber + 1}/${totalFrames}.`, runtime.diagnostics);
            await runtime.renderFrame(request);
            throwIfAborted(options.signal);
            const frame = await runtime.readFrame();
            throwIfAborted(options.signal);
            await encoder.addFrame(frame, request, options.signal);
            framesEncoded += 1;
            progress('encode', frameNumber + 1, `Encoded frame ${frameNumber + 1}/${totalFrames}.`, runtime.diagnostics);
            await yieldToBrowser(frameNumber);
        }
        throwIfAborted(options.signal);
        const blob = await encoder.finish(options.signal);
        const arrayBuffer = await blob.arrayBuffer();
        progress('complete', totalFrames, 'Video export complete.', runtime.diagnostics);
        return {
            blob,
            arrayBuffer,
            mimeType: 'video/mp4',
            extension: 'mp4',
            width: settings.width,
            height: settings.height,
            fps: settings.fps,
            durationSeconds: settings.durationSeconds,
            framesEncoded,
            byteLength: arrayBuffer.byteLength,
            diagnosticEvents
        };
    } catch (error) {
        if (isAbortError(error)) progress('cancelled', framesEncoded, 'Video export cancelled.', runtime?.diagnostics);
        else progress('error', framesEncoded, getErrorMessage(error), runtime?.diagnostics);
        await warnOnCleanupFailure(encoder?.cancel(), 'Video export encoder cancel failed.');
        throw error;
    } finally{
        if (ownsRuntime) await warnOnCleanupFailure(runtime?.dispose(), 'Video export runtime cleanup failed.');
        await warnOnCleanupFailure(encoder?.dispose(), 'Video export encoder cleanup failed.');
    }
}
function createMissingVideoEncoderMessage() {
    const protocol = 'undefined' == typeof window ? 'unknown' : window.location.protocol;
    const host = 'undefined' == typeof window ? 'unknown' : window.location.host;
    const secureContext = 'undefined' == typeof window ? false : window.isSecureContext;
    const userAgent = 'undefined' == typeof navigator ? 'unknown' : navigator.userAgent;
    const probableCause = secureContext ? 'The current browser/WebView does not expose WebCodecs VideoEncoder.' : 'WebCodecs VideoEncoder requires a secure context. Use HTTPS or localhost instead of an insecure LAN/IP HTTP address.';
    return [
        'Current browser does not support MP4 video export because WebCodecs VideoEncoder is unavailable.',
        probableCause,
        `protocol=${protocol}, host=${host}, secureContext=${secureContext}, userAgent=${userAgent}`
    ].join(' ');
}
function createH264CodecString(height) {
    return height < 1080 ? 'avc1.420028' : 'avc1.640033';
}
function estimateVideoBitsPerSecond(settings) {
    const pixelsPerSecond = settings.width * settings.height * settings.fps;
    return Math.round(pixelsPerSecond * (0.08 + 0.22 * settings.quality));
}
function clampInteger(value, min, max, fallback) {
    return Math.round(clampNumber(value, min, max, fallback));
}
function clampEvenInteger(value, min, max, fallback) {
    const integer = clampInteger(value, min, max, fallback);
    return integer % 2 === 0 ? integer : Math.max(min, integer - 1);
}
function clampNumber(value, min, max, fallback) {
    return 'number' == typeof value && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
}
function assertNotStopped(stopped) {
    if (stopped) throw new DOMException('Video encoder has been stopped.', 'AbortError');
}
function throwIfAborted(signal) {
    if (signal?.aborted) throw new DOMException('Video export was cancelled.', 'AbortError');
}
function withAbort(promise, signal) {
    throwIfAborted(signal);
    if (!signal) return promise;
    return new Promise((resolve, reject)=>{
        const onAbort = ()=>{
            cleanup();
            reject(new DOMException('Video export was cancelled.', 'AbortError'));
        };
        const cleanup = ()=>{
            signal.removeEventListener('abort', onAbort);
        };
        signal.addEventListener('abort', onAbort, {
            once: true
        });
        promise.then((value)=>{
            cleanup();
            resolve(value);
        }, (error)=>{
            cleanup();
            reject(error);
        });
    });
}
function sleep(ms, signal) {
    return withAbort(new Promise((resolve)=>window.setTimeout(resolve, ms)), signal);
}
async function yieldToBrowser(frameNumber) {
    if (frameNumber % 4 !== 0) return;
    await new Promise((resolve)=>window.setTimeout(resolve, 0));
}
function isAbortError(error) {
    return error instanceof DOMException && 'AbortError' === error.name;
}
function getErrorMessage(error) {
    return error instanceof Error ? error.message : String(error);
}
async function warnOnCleanupFailure(promise, message) {
    try {
        await promise;
    } catch (error) {
        log.warn(`${message}: ${getErrorMessage(error)}`);
    }
}
export { createBrowserVideoMp4FrameEncoder, createMissingVideoEncoderMessage, exportBrowserVideoMp4, normalizeBrowserVideoMp4ExportSettings };
