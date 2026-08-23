import * as __WEBPACK_EXTERNAL_MODULE__core_GSplatSogsData_js_6764351e__ from "../core/GSplatSogsData.js";
import * as __WEBPACK_EXTERNAL_MODULE__loaders_GSplatSogsResource_js_754c29ce__ from "../loaders/GSplatSogsResource.js";
import * as __WEBPACK_EXTERNAL_MODULE__loaders_SOGBundleLoader_js_f4e06486__ from "../loaders/SOGBundleLoader.js";
import * as __WEBPACK_EXTERNAL_MODULE__loaders_SogsParser_js_db694410__ from "../loaders/SogsParser.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__ from "../../../shared/constants/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('gsplat:lod');
function sogShortName(url) {
    const clean = url.split(/[?#]/)[0];
    const parts = clean.split('/').filter(Boolean);
    const last = parts[parts.length - 1] ?? url;
    if ('meta.json' === last && parts.length >= 2) return parts[parts.length - 2];
    return last;
}
class GSplatAssetLoaderBase {
    isResourceFailed(_url) {
        return false;
    }
    destroy() {}
}
class GSplatAssetLoader extends GSplatAssetLoaderBase {
    constructor(renderer, options){
        super(), this.resources = new Map(), this.loadQueue = [], this.currentlyLoading = new Set(), this.nextAttemptId = 1, this.destroyed = false, this.contextLost = false, this.onContextLost = (event)=>{
            if (this.destroyed) return;
            event.preventDefault();
            this.contextLost = true;
            for (const attempt of this.currentlyLoading){
                attempt.contextLost = true;
                attempt.controller.abort();
            }
        }, this.onContextRestored = ()=>{
            if (this.destroyed) return;
            this.contextLost = false;
            this.processQueue();
        }, this.initialBatchStart = null, this.initialBatchReported = false, this.initialBatchLoaded = 0;
        this.renderer = renderer;
        this.maxConcurrentLoads = options?.maxConcurrentLoads ?? __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.DEFAULT_MAX_CONCURRENT_LOADS;
        this.maxRetries = options?.maxRetries ?? __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.DEFAULT_MAX_RETRIES;
        this.debug = options?.debug ?? false;
        this.withCredentials = options?.withCredentials ?? false;
        this.onResourceLoaded = options?.onResourceLoaded;
        this.onResourceGpuReady = options?.onResourceGpuReady;
        this.onResourceFailed = options?.onResourceFailed;
        renderer.domElement?.addEventListener?.('webglcontextlost', this.onContextLost);
        renderer.domElement?.addEventListener?.('webglcontextrestored', this.onContextRestored);
    }
    notifyResourceLoaded(url, resource) {
        try {
            this.onResourceLoaded?.(url, resource);
        } catch (error) {
            log.error(`[GSplatAssetLoader] onResourceLoaded callback failed for ${url}: ` + (error instanceof Error ? error.message : String(error)));
        }
    }
    notifyResourceFailed(url, error) {
        try {
            this.onResourceFailed?.(url, error);
        } catch (callbackError) {
            log.error(`[GSplatAssetLoader] onResourceFailed callback failed for ${url}: ` + (callbackError instanceof Error ? callbackError.message : String(callbackError)));
        }
    }
    notifyResourceGpuReady(url, resource) {
        try {
            this.onResourceGpuReady?.(url, resource);
        } catch (error) {
            log.error(`[GSplatAssetLoader] onResourceGpuReady callback failed for ${url}: ` + (error instanceof Error ? error.message : String(error)));
        }
    }
    assertLoadActive(entry, attempt) {
        if (!this.isAttemptCurrent(entry, attempt)) throw new DOMException(`Load cancelled: ${entry.url}`, 'AbortError');
    }
    isEntryCurrent(entry) {
        return !this.destroyed && this.resources.get(entry.url) === entry;
    }
    isAttemptCurrent(entry, attempt) {
        return this.isEntryCurrent(entry) && entry.activeAttempt === attempt && !attempt.controller.signal.aborted;
    }
    isAttemptOwned(entry, attempt) {
        return this.isEntryCurrent(entry) && entry.activeAttempt === attempt;
    }
    hasLoadingAttemptForUrl(url) {
        for (const attempt of this.currentlyLoading)if (attempt.entry.url === url) return true;
        return false;
    }
    finalizeSogsData(entry, attempt, name, gsplatData) {
        return (async ()=>{
            try {
                this.assertLoadActive(entry, attempt);
                await log.perf.span(`sog.finalize ${name}`, async ()=>{
                    gsplatData.prepareCodebook();
                    await gsplatData.generateCenters(this.renderer, attempt.controller.signal);
                });
                this.assertLoadActive(entry, attempt);
            } catch (error) {
                gsplatData.destroy();
                throw error;
            }
            if (this.debug) log.debug(`[GSplatAssetLoader] prepared SOG resource with raw textures: ${name}`);
            const endResource = log.perf.time(`sog.resource ${name}`);
            try {
                const resource = new __WEBPACK_EXTERNAL_MODULE__loaders_GSplatSogsResource_js_754c29ce__.GSplatSogsResource(this.renderer, gsplatData);
                resource.setGpuReadyCallback(()=>{
                    if (this.isEntryCurrent(entry) && entry.resource === resource) this.notifyResourceGpuReady(entry.url, resource);
                });
                resource.setGpuRestoreFailedCallback((error)=>{
                    if (!this.isEntryCurrent(entry) || entry.resource !== resource) return;
                    entry.resource = null;
                    entry.state = "queued";
                    entry.retryCount = 0;
                    resource.retireWhenUnused();
                    log.warn(`[GSplatAssetLoader] GPU restore failed, reloading ${entry.url}: ${error.message}`);
                    this.enqueue(entry, true);
                });
                return resource;
            } catch (error) {
                gsplatData.destroy();
                throw error;
            } finally{
                endResource();
            }
        })();
    }
    load(url) {
        if (this.destroyed) {
            log.warn(`[GSplatAssetLoader] 加载器已销毁，忽略加载请求: ${url}`);
            return;
        }
        const entry = this.resources.get(url);
        if (entry) return;
        const nextEntry = {
            url,
            state: "queued",
            resource: null,
            parser: null,
            promise: null,
            retryCount: 0,
            activeAttempt: null
        };
        this.resources.set(url, nextEntry);
        if (null === this.initialBatchStart && !this.initialBatchReported) {
            const mgr = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)();
            if (mgr.isPerfEnabled()) {
                this.initialBatchStart = mgr.now();
                this.initialBatchLoaded = 0;
            }
        }
        this.enqueue(nextEntry);
    }
    enqueue(entry, prioritize = false) {
        if (!this.isEntryCurrent(entry)) return;
        entry.state = "queued";
        if (!this.loadQueue.includes(entry)) {
            if (prioritize) this.loadQueue.unshift(entry);
            else this.loadQueue.push(entry);
        }
        this.processQueue();
    }
    async startLoading(entry) {
        if (!this.isEntryCurrent(entry) || entry.activeAttempt) return;
        const { url } = entry;
        const attempt = {
            id: this.nextAttemptId++,
            entry,
            controller: new AbortController(),
            contextLost: false
        };
        entry.state = "loading";
        entry.activeAttempt = attempt;
        this.currentlyLoading.add(attempt);
        const isSogBundle = url.toLowerCase().endsWith('.sog');
        const name = sogShortName(url);
        let promise;
        if (isSogBundle) {
            const bundleLoader = new __WEBPACK_EXTERNAL_MODULE__loaders_SOGBundleLoader_js_f4e06486__.SOGBundleLoader({
                keepCompressed: true,
                withCredentials: this.withCredentials,
                signal: attempt.controller.signal
            });
            promise = log.perf.span(`sog.fetch ${name}`, ()=>bundleLoader.loadGpuData(url, {
                    renderer: this.renderer,
                    preuploadTextures: true,
                    retainTextureRestoreSource: true,
                    signal: attempt.controller.signal
                })).then((gsplatData)=>{
                gsplatData.releaseSourceImages();
                return this.finalizeSogsData(entry, attempt, name, gsplatData);
            });
        } else {
            const parser = new __WEBPACK_EXTERNAL_MODULE__loaders_SogsParser_js_db694410__.SogsParser();
            entry.parser = parser;
            promise = log.perf.span(`sog.fetch ${name}`, ()=>__WEBPACK_EXTERNAL_MODULE__loaders_SogsParser_js_db694410__.SogsParser.load(url, {
                    withCredentials: this.withCredentials,
                    signal: attempt.controller.signal
                })).then(({ textures, meta })=>{
                const gsplatData = new __WEBPACK_EXTERNAL_MODULE__core_GSplatSogsData_js_6764351e__.GSplatSogsData({
                    meta,
                    numSplats: meta.count,
                    means_l: textures.means_l,
                    means_u: textures.means_u,
                    quats: textures.quats,
                    scales: textures.scales,
                    sh0: textures.sh0,
                    sh_centroids: textures.sh_centroids,
                    sh_labels: textures.sh_labels,
                    url
                });
                return this.finalizeSogsData(entry, attempt, name, gsplatData);
            });
        }
        entry.promise = promise;
        let retry = false;
        try {
            const resource = await promise;
            if (attempt.contextLost) {
                resource.destroy();
                if (this.isAttemptOwned(entry, attempt)) {
                    retry = true;
                    entry.state = "queued";
                }
                return;
            }
            if (!this.isAttemptCurrent(entry, attempt)) {
                resource.destroy();
                return;
            }
            entry.state = "loaded";
            entry.resource = resource;
            entry.retryCount = 0;
            this.notifyResourceLoaded(url, resource);
            if (null !== this.initialBatchStart && !this.initialBatchReported) this.initialBatchLoaded++;
        } catch (error) {
            if (attempt.contextLost && this.isAttemptOwned(entry, attempt)) {
                retry = true;
                entry.state = "queued";
                return;
            }
            if (!this.isAttemptCurrent(entry, attempt)) return;
            const retryCount = entry.retryCount;
            if (retryCount < this.maxRetries) {
                entry.retryCount++;
                log.warn(`[GSplatAssetLoader] 加载失败，重试 ${entry.retryCount}/${this.maxRetries}: ${url} - ` + (error instanceof Error ? error.message : String(error)));
                retry = true;
                entry.state = "queued";
            } else {
                const finalError = error instanceof Error ? error : new Error(String(error));
                log.error(`[GSplatAssetLoader] 加载失败，已达最大重试次数: ${url} - ${finalError.message}`);
                entry.state = "failed";
                this.notifyResourceFailed(url, finalError);
            }
        } finally{
            this.currentlyLoading.delete(attempt);
            if (entry.activeAttempt === attempt) {
                entry.activeAttempt = null;
                entry.promise = null;
            }
            if (retry && this.isEntryCurrent(entry)) this.enqueue(entry, true);
            this.processQueue();
        }
    }
    processQueue() {
        if (this.destroyed || this.contextLost) return;
        this.loadQueue = this.loadQueue.filter((entry)=>this.isEntryCurrent(entry));
        while(this.currentlyLoading.size < this.maxConcurrentLoads && this.loadQueue.length > 0){
            const queueIndex = this.loadQueue.findIndex((entry)=>this.isEntryCurrent(entry) && !this.hasLoadingAttemptForUrl(entry.url));
            if (-1 === queueIndex) break;
            const [entry] = this.loadQueue.splice(queueIndex, 1);
            this.startLoading(entry);
        }
        if (0 === this.currentlyLoading.size && 0 === this.loadQueue.length) this.reportInitialBatchSettled();
    }
    reportInitialBatchSettled() {
        if (null === this.initialBatchStart || this.initialBatchReported) return;
        const mgr = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)();
        const elapsed = mgr.now() - this.initialBatchStart;
        this.initialBatchReported = true;
        this.initialBatchStart = null;
        if (mgr.isPerfEnabled()) mgr.writeRecord({
            level: __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.LogLevel.INFO,
            namespace: 'gsplat:lod:perf',
            message: `initialBatch settled: ${this.initialBatchLoaded} sogs in ${elapsed.toFixed(1)}ms`,
            timestamp: mgr.now()
        });
    }
    unload(url) {
        const entry = this.resources.get(url);
        if (!entry) return;
        entry.activeAttempt?.controller.abort();
        this.loadQueue = this.loadQueue.filter((queuedEntry)=>queuedEntry !== entry);
        if (entry?.resource) entry.resource.destroy();
        if (this.resources.get(url) === entry) this.resources.delete(url);
        this.processQueue();
    }
    getResource(url) {
        const entry = this.resources.get(url);
        if (entry && "loaded" === entry.state && entry.resource?.gpuReady !== false) return entry.resource;
        return null;
    }
    isResourceFailed(url) {
        return this.resources.get(url)?.state === "failed";
    }
    destroy() {
        this.destroyed = true;
        this.renderer.domElement?.removeEventListener?.('webglcontextlost', this.onContextLost);
        this.renderer.domElement?.removeEventListener?.('webglcontextrestored', this.onContextRestored);
        this.loadQueue.length = 0;
        for (const attempt of this.currentlyLoading)attempt.controller.abort();
        for (const entry of this.resources.values())entry.resource?.destroy();
        this.resources.clear();
    }
    getStatus() {
        let loaded = 0;
        let loading = 0;
        let queued = 0;
        let failed = 0;
        for (const entry of this.resources.values())switch(entry.state){
            case "loaded":
                loaded++;
                break;
            case "loading":
                loading++;
                break;
            case "queued":
                queued++;
                break;
            case "failed":
                failed++;
                break;
        }
        return {
            total: this.resources.size,
            loaded,
            loading,
            queued,
            failed
        };
    }
}
export { GSplatAssetLoader, GSplatAssetLoaderBase };
