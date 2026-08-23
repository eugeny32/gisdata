import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__gpu_SogsGpuPackerGPU_js_1f95f767__ from "../gpu/SogsGpuPackerGPU.js";
import * as __WEBPACK_EXTERNAL_MODULE__shaders_frag_gsplatSogsCenters_fs_js_e631073b__ from "../shaders/frag/gsplatSogsCenters.fs.js";
import * as __WEBPACK_EXTERNAL_MODULE__shaders_frag_gsplatSogsReorderSh_fs_js_f38e59dd__ from "../shaders/frag/gsplatSogsReorderSh.fs.js";
import * as __WEBPACK_EXTERNAL_MODULE__shaders_gsplat_chunks_js_c6e8d193__ from "../shaders/gsplat-chunks.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_syncTextureUploadVersion_js_1de580b2__ from "../utils/syncTextureUploadVersion.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('gsplat:core');
const GPU_SYNC_TIMEOUT_MS = 30000;
const textureRestoreSources = new WeakMap();
const sourceTextureRestoreTailsByRenderer = new WeakMap();
function runSourceTextureRestoreExclusive(renderer, run) {
    const previous = sourceTextureRestoreTailsByRenderer.get(renderer) ?? Promise.resolve();
    const queued = previous.catch(()=>void 0).then(run);
    const tail = queued.catch(()=>void 0);
    sourceTextureRestoreTailsByRenderer.set(renderer, tail);
    tail.finally(()=>{
        if (sourceTextureRestoreTailsByRenderer.get(renderer) === tail) sourceTextureRestoreTailsByRenderer.delete(renderer);
    });
    return queued;
}
function registerGSplatSogsTextureRestoreSource(texture, blob, width, height) {
    textureRestoreSources.set(texture, {
        blob,
        width,
        height
    });
}
function createAbortError() {
    return new DOMException('Aborted', 'AbortError');
}
function throwIfAborted(signal) {
    if (signal?.aborted) throw createAbortError();
}
function isAbortError(error) {
    return error instanceof DOMException && 'AbortError' === error.name;
}
function createGpuSyncTimeoutError() {
    const error = new Error(`GPU center readback timed out after ${GPU_SYNC_TIMEOUT_MS}ms`);
    error.name = 'TimeoutError';
    return error;
}
const centersRenderResourcesByRenderer = new WeakMap();
const centersGenerationQueuesByRenderer = new WeakMap();
function deleteCentersGenerationQueueIfIdle(renderer, queue) {
    if (null === queue.active && 0 === queue.pending.length && centersGenerationQueuesByRenderer.get(renderer) === queue) {
        if (queue.disposeResourcesWhenIdle) disposeCentersRenderResourcesNow(renderer);
        centersGenerationQueuesByRenderer.delete(renderer);
    }
}
function drainCentersGenerationQueue(renderer, queue) {
    if (queue.active) return;
    while(queue.pending.length > 0){
        const task = queue.pending.shift();
        if (!task) break;
        if (task.onAbort) {
            task.signal?.removeEventListener('abort', task.onAbort);
            task.onAbort = null;
        }
        if (task.signal?.aborted) {
            task.reject(createAbortError());
            continue;
        }
        task.started = true;
        queue.active = task;
        (async ()=>{
            try {
                await task.run();
                task.resolve();
            } catch (error) {
                task.reject(error);
            } finally{
                if (queue.active === task) queue.active = null;
                drainCentersGenerationQueue(renderer, queue);
            }
        })();
        return;
    }
    deleteCentersGenerationQueueIfIdle(renderer, queue);
}
function runCentersGenerationExclusive(renderer, signal, run) {
    if (signal?.aborted) return Promise.reject(createAbortError());
    let queue = centersGenerationQueuesByRenderer.get(renderer);
    if (!queue) {
        queue = {
            active: null,
            pending: [],
            disposeResourcesWhenIdle: false
        };
        centersGenerationQueuesByRenderer.set(renderer, queue);
    }
    const rendererQueue = queue;
    return new Promise((resolve, reject)=>{
        const task = {
            signal,
            run,
            resolve,
            reject,
            started: false,
            onAbort: null
        };
        if (signal) {
            task.onAbort = ()=>{
                if (task.started) return;
                const index = rendererQueue.pending.indexOf(task);
                if (-1 === index) return;
                rendererQueue.pending.splice(index, 1);
                signal.removeEventListener('abort', task.onAbort);
                task.onAbort = null;
                reject(createAbortError());
                deleteCentersGenerationQueueIfIdle(renderer, rendererQueue);
            };
            signal.addEventListener('abort', task.onAbort, {
                once: true
            });
        }
        rendererQueue.pending.push(task);
        drainCentersGenerationQueue(renderer, rendererQueue);
    });
}
function closeTextureImage(image) {
    try {
        if (image && 'object' == typeof image && 'close' in image) {
            const close = image.close;
            if ('function' == typeof close) close.call(image);
        } else if ('undefined' != typeof HTMLImageElement && image instanceof HTMLImageElement) {
            image.onload = null;
            image.onerror = null;
            image.src = '';
        }
    } catch  {}
}
function releaseTextureImage(texture) {
    if (!texture) return;
    try {
        closeTextureImage(texture.image);
    } finally{
        texture.image = null;
    }
}
function releaseTextureImageBacking(texture) {
    const image = texture.image;
    const width = Number(image?.width);
    const height = Number(image?.height);
    if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) return;
    try {
        closeTextureImage(image);
    } finally{
        texture.image = {
            width,
            height
        };
    }
}
function disposeTextureAndImage(texture) {
    if (!texture) return;
    try {
        texture.dispose();
    } finally{
        releaseTextureImage(texture);
    }
}
function disposeCentersRenderResourcesNow(renderer) {
    const resources = centersRenderResourcesByRenderer.get(renderer);
    if (!resources) return;
    for (const uniform of Object.values(resources.material.uniforms))uniform.value = null;
    resources.material.dispose();
    resources.geometry.dispose();
    resources.scene.clear();
    centersRenderResourcesByRenderer.delete(renderer);
}
function disposeGSplatSogsRenderResources(renderer) {
    const queue = centersGenerationQueuesByRenderer.get(renderer);
    if (queue && (null !== queue.active || queue.pending.length > 0)) {
        queue.disposeResourcesWhenIdle = true;
        return;
    }
    disposeCentersRenderResourcesNow(renderer);
}
class GSplatSogsData {
    assembleFragmentShader(source) {
        const manager = (0, __WEBPACK_EXTERNAL_MODULE__shaders_gsplat_chunks_js_c6e8d193__.registerGSplatChunks)();
        return manager.assembleSource(source);
    }
    async readCenterPixels(renderer, renderTarget, width, height, signal) {
        throwIfAborted(signal);
        const pboPixels = await this.readCenterPixelsWithPbo(renderer, renderTarget, width, height, signal);
        if (pboPixels) return pboPixels;
        throwIfAborted(signal);
        const asyncReader = renderer.readRenderTargetPixelsAsync;
        if (!signal && 'function' == typeof asyncReader) {
            const buffer = new Float32Array(width * height * 4);
            try {
                await asyncReader.call(renderer, renderTarget, 0, 0, width, height, buffer);
                return buffer;
            } catch (error) {
                log.warn('[GSplatSogsData] async center readback failed, using sync fallback: ' + (error instanceof Error ? error.message : String(error)));
            }
        }
        return this.readCenterPixelsSync(renderer, renderTarget, width, height, signal);
    }
    async readCenterPixelsWithPbo(renderer, renderTarget, width, height, signal) {
        throwIfAborted(signal);
        const rendererWithContext = renderer;
        if ('function' != typeof rendererWithContext.getContext) return null;
        if (renderTarget.texture.format !== __WEBPACK_EXTERNAL_MODULE_three__.RGBAFormat || renderTarget.texture.type !== __WEBPACK_EXTERNAL_MODULE_three__.FloatType) return null;
        const gl = rendererWithContext.getContext();
        if (!gl || 'function' != typeof gl.fenceSync || 'function' != typeof gl.clientWaitSync || 'function' != typeof gl.getBufferSubData || 'function' != typeof gl.readPixels) return null;
        const pbo = gl.createBuffer();
        if (!pbo) return null;
        let previousRenderTarget = null;
        let shouldRestoreRenderTarget = false;
        let sync = null;
        try {
            const buffer = new Float32Array(width * height * 4);
            previousRenderTarget = renderer.getRenderTarget();
            throwIfAborted(signal);
            shouldRestoreRenderTarget = true;
            renderer.setRenderTarget(renderTarget);
            gl.bindBuffer(gl.PIXEL_PACK_BUFFER, pbo);
            gl.bufferData(gl.PIXEL_PACK_BUFFER, buffer.byteLength, gl.STREAM_READ);
            gl.readPixels(0, 0, width, height, gl.RGBA, gl.FLOAT, 0);
            sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
            if (!sync) return null;
            gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
            renderer.setRenderTarget(previousRenderTarget);
            shouldRestoreRenderTarget = false;
            await this.waitForGpuSync(gl, sync, signal);
            throwIfAborted(signal);
            gl.bindBuffer(gl.PIXEL_PACK_BUFFER, pbo);
            gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, buffer);
            throwIfAborted(signal);
            return buffer;
        } catch (error) {
            if (signal?.aborted || isAbortError(error) || error instanceof Error && 'TimeoutError' === error.name) throw signal?.aborted ? createAbortError() : error;
            log.warn('[GSplatSogsData] direct PBO center readback failed, using Three fallback: ' + (error instanceof Error ? error.message : String(error)));
            return null;
        } finally{
            try {
                gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
            } catch  {}
            if (shouldRestoreRenderTarget) try {
                renderer.setRenderTarget(previousRenderTarget);
            } catch  {}
            if (sync) try {
                gl.deleteSync(sync);
            } catch  {}
            try {
                gl.deleteBuffer(pbo);
            } catch  {}
        }
    }
    waitForGpuSync(gl, sync, signal) {
        return new Promise((resolve, reject)=>{
            let timer = null;
            let settled = false;
            const startedAt = Date.now();
            const cleanup = ()=>{
                if (null !== timer) {
                    clearTimeout(timer);
                    timer = null;
                }
                signal?.removeEventListener('abort', onAbort);
            };
            const settle = (error)=>{
                if (settled) return;
                settled = true;
                cleanup();
                if (void 0 === error) resolve();
                else reject(error);
            };
            const onAbort = ()=>settle(createAbortError());
            const probe = ()=>{
                timer = null;
                if (signal?.aborted) {
                    settle(createAbortError());
                    return;
                }
                if (Date.now() - startedAt >= GPU_SYNC_TIMEOUT_MS) {
                    settle(createGpuSyncTimeoutError());
                    return;
                }
                let result;
                try {
                    result = gl.clientWaitSync(sync, gl.SYNC_FLUSH_COMMANDS_BIT, 0);
                } catch (error) {
                    settle(error);
                    return;
                }
                if (result === gl.WAIT_FAILED) {
                    settle(new Error('GPU sync wait failed'));
                    return;
                }
                if (result === gl.TIMEOUT_EXPIRED) {
                    timer = setTimeout(probe, 4);
                    return;
                }
                settle();
            };
            if (signal?.aborted) {
                settle(createAbortError());
                return;
            }
            signal?.addEventListener('abort', onAbort, {
                once: true
            });
            timer = setTimeout(probe, 0);
        });
    }
    readCenterPixelsSync(renderer, renderTarget, width, height, signal) {
        throwIfAborted(signal);
        const result = new Float32Array(width * height * 4);
        const rowsPerRead = 32;
        const reusableBuffer = new Float32Array(width * rowsPerRead * 4);
        for(let y = 0; y < height; y += rowsPerRead){
            throwIfAborted(signal);
            const readRows = Math.min(rowsPerRead, height - y);
            const readBuffer = readRows === rowsPerRead ? reusableBuffer : new Float32Array(width * readRows * 4);
            renderer.readRenderTargetPixels(renderTarget, 0, y, width, readRows, readBuffer);
            result.set(readBuffer, y * width * 4);
        }
        return result;
    }
    constructor(params){
        this.url = '';
        this.packedTexture = null;
        this.packedSh0 = null;
        this.packedShN = null;
        this._centers = null;
        this._shBands = 0;
        this.renderer = null;
        this._onContextRestored = null;
        this._gpuPacker = null;
        this._destroyed = false;
        this._sourceImagesReleased = false;
        this._sourceTextureRestoreSources = new Map();
        this._sourceTextureRestoreGeneration = 0;
        this._sourceTextureRestorePromise = null;
        this._activeSourceTextureRestoreGeneration = -1;
        this._sourceTextureRestoreAbortController = null;
        this._shRenderTarget = null;
        this.meta = params.meta;
        this.numSplats = params.numSplats;
        this.means_l = params.means_l;
        this.means_u = params.means_u;
        this.quats = params.quats;
        this.scales = params.scales;
        this.sh0 = params.sh0;
        this.sh_centroids = params.sh_centroids;
        this.sh_labels = params.sh_labels;
        this.url = params.url || '';
        this.collectTextureRestoreSources();
        if (this.meta.shN?.bands !== void 0) this._shBands = this.meta.shN.bands;
        else {
            const shBandsWidths = {
                192: 1,
                512: 2,
                960: 3
            };
            this._shBands = shBandsWidths[this.sh_centroids?.image?.width ?? 0] ?? 0;
        }
    }
    get shBands() {
        return this._shBands;
    }
    releaseSourceImages() {
        if (this._destroyed || this._sourceImagesReleased) return this._sourceImagesReleased;
        this.collectTextureRestoreSources();
        const textures = this.getSourceTextures();
        if (textures.some((texture)=>!this._sourceTextureRestoreSources.has(texture))) return false;
        this._sourceImagesReleased = true;
        for (const texture of textures)releaseTextureImageBacking(texture);
        return true;
    }
    get sourceImagesReleased() {
        return this._sourceImagesReleased;
    }
    cancelSourceTextureRestore() {
        this._sourceTextureRestoreGeneration++;
        this._sourceTextureRestoreAbortController?.abort();
        this._sourceTextureRestoreAbortController = null;
    }
    restoreSourceTextures(renderer) {
        if (!this._sourceImagesReleased) return Promise.resolve();
        if (this._destroyed) return Promise.reject(createAbortError());
        const generation = this._sourceTextureRestoreGeneration;
        if (this._sourceTextureRestorePromise && this._activeSourceTextureRestoreGeneration === generation) return this._sourceTextureRestorePromise;
        const previous = this._sourceTextureRestorePromise?.catch(()=>void 0);
        const abortController = new AbortController();
        const restore = runSourceTextureRestoreExclusive(renderer, async ()=>{
            await previous;
            this.assertSourceTextureRestoreActive(generation);
            throwIfAborted(abortController.signal);
            for (const texture of this.getSourceTextures()){
                const source = this._sourceTextureRestoreSources.get(texture);
                if (!source) throw new Error(`[GSplatSogsData] missing texture restore source: ${texture.name}`);
                const image = await this.decodeTextureRestoreSource(source.blob, abortController.signal);
                try {
                    this.assertSourceTextureRestoreActive(generation);
                    texture.image = image;
                    texture.needsUpdate = true;
                    renderer.initTexture(texture);
                    (0, __WEBPACK_EXTERNAL_MODULE__utils_syncTextureUploadVersion_js_1de580b2__.syncTextureUploadVersion)(renderer, texture);
                    this.assertSourceTextureRestoreActive(generation);
                } finally{
                    if (texture.image === image) releaseTextureImageBacking(texture);
                    else closeTextureImage(image);
                }
            }
        });
        this._activeSourceTextureRestoreGeneration = generation;
        this._sourceTextureRestoreAbortController = abortController;
        let tracked;
        tracked = restore.finally(()=>{
            if (this._sourceTextureRestorePromise === tracked) {
                this._sourceTextureRestorePromise = null;
                this._activeSourceTextureRestoreGeneration = -1;
            }
            if (this._sourceTextureRestoreAbortController === abortController) this._sourceTextureRestoreAbortController = null;
        });
        this._sourceTextureRestorePromise = tracked;
        return tracked;
    }
    assertSourceTextureRestoreActive(generation) {
        if (this._destroyed || generation !== this._sourceTextureRestoreGeneration) throw createAbortError();
    }
    async decodeTextureRestoreSource(blob, signal) {
        throwIfAborted(signal);
        if ('undefined' != typeof createImageBitmap) try {
            const bitmapPromise = createImageBitmap(blob, {
                colorSpaceConversion: 'none',
                premultiplyAlpha: 'none'
            });
            return await this.waitForImageBitmapDecode(bitmapPromise, signal);
        } catch (error) {
            if (signal.aborted || isAbortError(error)) throw createAbortError();
        }
        throwIfAborted(signal);
        return new Promise((resolve, reject)=>{
            const image = new Image();
            const objectUrl = URL.createObjectURL(blob);
            let settled = false;
            const cleanup = ()=>{
                image.onload = null;
                image.onerror = null;
                signal.removeEventListener('abort', onAbort);
                URL.revokeObjectURL(objectUrl);
            };
            const settle = (error)=>{
                if (settled) return;
                settled = true;
                cleanup();
                if (void 0 === error) resolve(image);
                else reject(error);
            };
            const onAbort = ()=>{
                settle(createAbortError());
                image.src = '';
            };
            image.onload = ()=>{
                if (signal.aborted) {
                    onAbort();
                    return;
                }
                settle();
            };
            image.onerror = ()=>{
                settle(new Error('Failed to restore SOG WebP texture'));
                image.src = '';
            };
            signal.addEventListener('abort', onAbort, {
                once: true
            });
            image.decoding = 'async';
            image.src = objectUrl;
            if (signal.aborted) onAbort();
        });
    }
    waitForImageBitmapDecode(bitmapPromise, signal) {
        return new Promise((resolve, reject)=>{
            let settled = false;
            const cleanup = ()=>signal.removeEventListener('abort', onAbort);
            const onAbort = ()=>{
                if (settled) return;
                settled = true;
                cleanup();
                reject(createAbortError());
            };
            signal.addEventListener('abort', onAbort, {
                once: true
            });
            if (signal.aborted) onAbort();
            bitmapPromise.then((bitmap)=>{
                if (settled) {
                    closeTextureImage(bitmap);
                    return;
                }
                settled = true;
                cleanup();
                if (signal.aborted) {
                    closeTextureImage(bitmap);
                    reject(createAbortError());
                    return;
                }
                resolve(bitmap);
            }, (error)=>{
                if (settled) return;
                settled = true;
                cleanup();
                reject(signal.aborted ? createAbortError() : error);
            });
        });
    }
    getSourceTextures() {
        const textures = new Set([
            this.means_l,
            this.means_u,
            this.quats,
            this.scales,
            this.sh0
        ]);
        if (this.sh_centroids) textures.add(this.sh_centroids);
        if (this.sh_labels) textures.add(this.sh_labels);
        return Array.from(textures);
    }
    collectTextureRestoreSources() {
        for (const texture of this.getSourceTextures()){
            if (this._sourceTextureRestoreSources.has(texture)) continue;
            const source = textureRestoreSources.get(texture);
            if (source) {
                this._sourceTextureRestoreSources.set(texture, source);
                textureRestoreSources.delete(texture);
            }
        }
    }
    get isSogs() {
        return true;
    }
    calcAabb(result) {
        const { mins, maxs } = this.meta.means;
        const map = (v)=>Math.sign(v) * (Math.exp(Math.abs(v)) - 1);
        const minX = map(mins[0]);
        const minY = map(mins[1]);
        const minZ = map(mins[2]);
        const maxX = map(maxs[0]);
        const maxY = map(maxs[1]);
        const maxZ = map(maxs[2]);
        result.min.set(minX, minY, minZ);
        result.max.set(maxX, maxY, maxZ);
        return true;
    }
    getMemoryUsage() {
        let total = 0;
        const estimateTextureMemory = (texture)=>{
            if (!texture?.image) return 0;
            const { width, height } = texture.image;
            return width * height * 4;
        };
        total += estimateTextureMemory(this.means_l);
        total += estimateTextureMemory(this.means_u);
        total += estimateTextureMemory(this.quats);
        total += estimateTextureMemory(this.scales);
        total += estimateTextureMemory(this.sh0);
        total += estimateTextureMemory(this.sh_centroids);
        total += estimateTextureMemory(this.sh_labels);
        if (this.packedTexture) {
            const { width, height } = this.packedTexture.image;
            total += width * height * 16;
        }
        if (this.packedSh0) total += estimateTextureMemory(this.packedSh0);
        if (this.packedShN) total += estimateTextureMemory(this.packedShN);
        return total;
    }
    getUncompressedMemoryUsage() {
        let bytesPerSplat = 56;
        if (this._shBands > 0) {
            const shSizes = [
                0,
                3,
                5,
                7
            ];
            for(let i = 1; i <= this._shBands; i++)bytesPerSplat += 12 * shSizes[i];
        }
        return this.numSplats * bytesPerSplat;
    }
    getCompressionRatio() {
        const compressed = this.getMemoryUsage();
        if (0 === compressed) return 0;
        return this.getUncompressedMemoryUsage() / compressed;
    }
    calcFocalPoint(result) {
        const { mins, maxs } = this.meta.means;
        const map = (v)=>Math.sign(v) * (Math.exp(Math.abs(v)) - 1);
        result.set((map(mins[0]) + map(maxs[0])) * 0.5, (map(mins[1]) + map(maxs[1])) * 0.5, (map(mins[2]) + map(maxs[2])) * 0.5);
    }
    getCenters() {
        const centers = this._centers;
        this._centers = null;
        return centers;
    }
    prepareCodebook() {
        const codebookNames = [
            'scales',
            'sh0',
            'shN'
        ];
        for (const name of codebookNames){
            const codebook = this.meta[name]?.codebook;
            if (codebook?.[0] === null) codebook[0] = (codebook[1] ?? 0) + ((codebook[1] ?? 0) - (codebook[255] ?? 0)) / 255;
        }
    }
    getCentersRenderResources(renderer) {
        const existing = centersRenderResourcesByRenderer.get(renderer);
        if (existing) return existing;
        const material = new __WEBPACK_EXTERNAL_MODULE_three__.ShaderMaterial({
            glslVersion: __WEBPACK_EXTERNAL_MODULE_three__.GLSL3,
            uniforms: {
                means_l: {
                    value: null
                },
                means_u: {
                    value: null
                },
                numSplats: {
                    value: 0
                },
                means_mins: {
                    value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector3()
                },
                means_maxs: {
                    value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector3()
                }
            },
            vertexShader: `
        void main() {
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
            fragmentShader: this.assembleFragmentShader(__WEBPACK_EXTERNAL_MODULE__shaders_frag_gsplatSogsCenters_fs_js_e631073b__["default"])
        });
        const scene = new __WEBPACK_EXTERNAL_MODULE_three__.Scene();
        const camera = new __WEBPACK_EXTERNAL_MODULE_three__.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const quad = this.createFullscreenQuad(material);
        const geometry = quad.geometry;
        scene.add(quad);
        const resources = {
            material,
            geometry,
            scene,
            camera
        };
        centersRenderResourcesByRenderer.set(renderer, resources);
        return resources;
    }
    async generateCenters(renderer, signal) {
        await runCentersGenerationExclusive(renderer, signal, ()=>this.generateCentersExclusive(renderer, signal));
    }
    async generateCentersExclusive(renderer, signal) {
        throwIfAborted(signal);
        const width = this.means_l.image.width;
        const height = this.means_l.image.height;
        const centersTarget = new __WEBPACK_EXTERNAL_MODULE_three__.WebGLRenderTarget(width, height, {
            format: __WEBPACK_EXTERNAL_MODULE_three__.RGBAFormat,
            type: __WEBPACK_EXTERNAL_MODULE_three__.FloatType,
            minFilter: __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter,
            magFilter: __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter,
            generateMipmaps: false
        });
        let material = null;
        try {
            const centersRenderResources = this.getCentersRenderResources(renderer);
            material = centersRenderResources.material;
            const { scene, camera } = centersRenderResources;
            material.uniforms.means_l.value = this.means_l;
            material.uniforms.means_u.value = this.means_u;
            material.uniforms.numSplats.value = this.numSplats;
            material.uniforms.means_mins.value.set(...this.meta.means.mins);
            material.uniforms.means_maxs.value.set(...this.meta.means.maxs);
            throwIfAborted(signal);
            const oldRenderTarget = renderer.getRenderTarget();
            try {
                renderer.setRenderTarget(centersTarget);
                renderer.render(scene, camera);
            } finally{
                renderer.setRenderTarget(oldRenderTarget);
            }
            throwIfAborted(signal);
            const centerPixels = await this.readCenterPixels(renderer, centersTarget, width, height, signal);
            throwIfAborted(signal);
            const centers = new Float32Array(3 * this.numSplats);
            let splatIndex = 0;
            while(splatIndex < this.numSplats){
                const src = 4 * splatIndex;
                const dst = 3 * splatIndex;
                centers[dst + 0] = centerPixels[src + 0];
                centers[dst + 1] = centerPixels[src + 1];
                centers[dst + 2] = centerPixels[src + 2];
                splatIndex++;
            }
            throwIfAborted(signal);
            if (!this._destroyed) this._centers = centers;
        } finally{
            try {
                if (material) this.clearCentersRenderUniforms(material);
            } finally{
                centersTarget.dispose();
            }
        }
    }
    clearCentersRenderUniforms(material) {
        const ownsMeansLow = material.uniforms.means_l.value === this.means_l;
        const ownsMeansHigh = material.uniforms.means_u.value === this.means_u;
        if (ownsMeansLow) material.uniforms.means_l.value = null;
        if (ownsMeansHigh) material.uniforms.means_u.value = null;
        if (ownsMeansLow && ownsMeansHigh) material.uniforms.numSplats.value = 0;
    }
    packGpuMemory(renderer) {
        if (!this._gpuPacker) this._gpuPacker = new __WEBPACK_EXTERNAL_MODULE__gpu_SogsGpuPackerGPU_js_1f95f767__.SogsGpuPackerGPU(renderer);
        try {
            const result = this._gpuPacker.packFromTextures({
                means_l: this.means_l,
                means_u: this.means_u,
                quats: this.quats,
                scales: this.scales,
                sh0: this.sh0,
                sh_labels: this.sh_labels,
                numSplats: this.numSplats,
                meta: this.meta
            });
            this.packedTexture?.dispose();
            this.packedSh0?.dispose();
            this.packedTexture = result.packedTexture;
            this.packedSh0 = result.packedSh0;
        } catch (e) {
            log.warn(`[GSplatSogsData] GPU MRT 打包失败: ${e instanceof Error ? e.message : String(e)}`);
            this.packedTexture?.dispose();
            this.packedTexture = null;
            this.packedSh0?.dispose();
            this.packedSh0 = null;
        }
    }
    packShMemory(renderer) {
        const { meta, sh_centroids } = this;
        if (!sh_centroids) return;
        const width = Math.floor(sh_centroids.image.width);
        const height = Math.floor(sh_centroids.image.height);
        const uniforms = {
            sh_centroids: {
                value: sh_centroids
            }
        };
        const defines = {};
        if (2 === meta.version) {
            if (meta.shN?.codebook) {
                const shNCodebook = this.createCodebookUniform(meta.shN.codebook);
                uniforms.shN_codebook = {
                    value: shNCodebook
                };
            } else log.warn('[GSplatSogsData.packShMemory] V2 格式但没有 shN.codebook!');
        } else defines.REORDER_V1 = '1';
        const fragmentShader = this.assembleFragmentShader(__WEBPACK_EXTERNAL_MODULE__shaders_frag_gsplatSogsReorderSh_fs_js_f38e59dd__["default"]);
        const material = new __WEBPACK_EXTERNAL_MODULE_three__.ShaderMaterial({
            glslVersion: __WEBPACK_EXTERNAL_MODULE_three__.GLSL3,
            uniforms,
            defines,
            vertexShader: `
        void main() {
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
            fragmentShader
        });
        const renderTarget = new __WEBPACK_EXTERNAL_MODULE_three__.WebGLRenderTarget(width, height, {
            format: __WEBPACK_EXTERNAL_MODULE_three__.RGBAFormat,
            type: __WEBPACK_EXTERNAL_MODULE_three__.UnsignedByteType,
            minFilter: __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter,
            magFilter: __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter,
            generateMipmaps: false,
            depthBuffer: false,
            stencilBuffer: false
        });
        const quadScene = new __WEBPACK_EXTERNAL_MODULE_three__.Scene();
        const quadCamera = new __WEBPACK_EXTERNAL_MODULE_three__.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const quad = this.createFullscreenQuad(material);
        quadScene.add(quad);
        const oldRenderTarget = renderer.getRenderTarget();
        renderer.setRenderTarget(renderTarget);
        renderer.render(quadScene, quadCamera);
        renderer.setRenderTarget(oldRenderTarget);
        if (this._shRenderTarget) {
            this._shRenderTarget.dispose();
            this._shRenderTarget = null;
        } else if (this.packedShN) this.packedShN.dispose();
        this.packedShN = renderTarget.texture;
        this.packedShN.name = `sogsPackedShN_${this.url || ''}`;
        this._shRenderTarget = renderTarget;
        material.dispose();
        quad.geometry.dispose();
    }
    async prepareGpuData(renderer) {
        if (this._onContextRestored && this.renderer) this.renderer.domElement.removeEventListener('webglcontextrestored', this._onContextRestored);
        this.renderer = renderer;
        this.packedTexture?.dispose();
        this.packedTexture = null;
        this.packedSh0?.dispose();
        this.packedSh0 = null;
        this._onContextRestored = this.onContextRestored.bind(this);
        renderer.domElement.addEventListener('webglcontextrestored', this._onContextRestored);
        this.prepareCodebook();
        if (null === this._centers) await this.generateCenters(renderer);
    }
    createFullscreenQuad(material) {
        const geometry = new __WEBPACK_EXTERNAL_MODULE_three__.BufferGeometry();
        const vertices = new Float32Array([
            -1,
            -1,
            0,
            3,
            -1,
            0,
            -1,
            3,
            0
        ]);
        geometry.setAttribute('position', new __WEBPACK_EXTERNAL_MODULE_three__.BufferAttribute(vertices, 3));
        return new __WEBPACK_EXTERNAL_MODULE_three__.Mesh(geometry, material);
    }
    createCodebookUniform(codebook) {
        const result = [];
        for(let i = 0; i < 64; i++){
            result.push(codebook[4 * i + 0] ?? 0);
            result.push(codebook[4 * i + 1] ?? 0);
            result.push(codebook[4 * i + 2] ?? 0);
            result.push(codebook[4 * i + 3] ?? 0);
        }
        return result;
    }
    destroy() {
        if (this._destroyed) return;
        this._destroyed = true;
        this.cancelSourceTextureRestore();
        this._centers = null;
        const renderer = this.renderer;
        const centersResources = renderer ? centersRenderResourcesByRenderer.get(renderer) : void 0;
        if (centersResources) this.clearCentersRenderUniforms(centersResources.material);
        if (this._onContextRestored && renderer) renderer.domElement.removeEventListener('webglcontextrestored', this._onContextRestored);
        this._onContextRestored = null;
        this.renderer = null;
        const shRenderTarget = this._shRenderTarget;
        const packedShN = this.packedShN;
        this._shRenderTarget = null;
        this.packedShN = null;
        if (shRenderTarget) {
            shRenderTarget.dispose();
            releaseTextureImage(packedShN);
        } else disposeTextureAndImage(packedShN);
        const packedTexture = this.packedTexture;
        const packedSh0 = this.packedSh0;
        this.packedTexture = null;
        this.packedSh0 = null;
        const textures = new Set([
            this.means_l,
            this.means_u,
            this.quats,
            this.scales,
            this.sh0
        ]);
        if (this.sh_centroids) textures.add(this.sh_centroids);
        if (this.sh_labels) textures.add(this.sh_labels);
        if (packedTexture) textures.add(packedTexture);
        if (packedSh0) textures.add(packedSh0);
        for (const texture of textures)disposeTextureAndImage(texture);
        this._sourceTextureRestoreSources.clear();
        if (this._gpuPacker) {
            this._gpuPacker.dispose();
            this._gpuPacker = null;
        }
    }
    onContextRestored() {
        if (!this.renderer) {
            log.warn('[GSplatSogsData] No renderer available for context restoration');
            return;
        }
        this.prepareCodebook();
    }
}
export { GSplatSogsData, disposeGSplatSogsRenderResources, registerGSplatSogsTextureRestoreSource };
