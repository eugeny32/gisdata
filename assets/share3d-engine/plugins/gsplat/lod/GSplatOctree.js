import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('gsplat:lod');
class GSplatOctreeNode {
    constructor(lods, boundData){
        this.lods = lods;
        this.bounds = new __WEBPACK_EXTERNAL_MODULE_three__.Box3(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(boundData.min[0], boundData.min[1], boundData.min[2]), new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(boundData.max[0], boundData.max[1], boundData.max[2]));
    }
}
const _toDelete = [];
class GSplatOctree {
    constructor(assetFileUrl, data, options){
        this.nodes = [];
        this.files = [];
        this.fileResources = new Map();
        this.restoringFileResources = new Map();
        this.cooldowns = new Map();
        this.environmentUrl = null;
        this.environmentResource = null;
        this.environmentRefCount = 0;
        this.assetLoader = null;
        this.destroyed = false;
        this.debug = false;
        this.cooldownTicks = 100;
        this.lastCooldownTickFrame = null;
        this.lastCooldownTickSource = null;
        this.lodLevels = data.lodLevels;
        this.assetFileUrl = assetFileUrl;
        this.debug = options?.debug ?? false;
        const baseDir = options?.baseUrl ?? GSplatOctree.resolveBaseUrl(assetFileUrl);
        const shardDirs = options?.baseUrls && options.baseUrls.length > 0 ? options.baseUrls.map((shard)=>GSplatOctree.normalizeShardDir(shard, baseDir)) : [
            baseDir
        ];
        this.files = data.filenames.map((url, index)=>({
                url: this.isRelativePath(url) ? this.joinPath(shardDirs[index % shardDirs.length], url) : url,
                lodLevel: -1
            }));
        this.fileRefCounts = new Int32Array(this.files.length);
        this.fileLoadInterests = new Int32Array(this.files.length);
        if (data.environment && options?.loadEnvironment !== false) this.environmentUrl = this.isRelativePath(data.environment) ? this.joinPath(baseDir, data.environment) : data.environment;
        const leafNodes = [];
        this._extractLeafNodes(data.tree, leafNodes);
        this.nodes = leafNodes.map((nodeData)=>{
            const lods = [];
            for(let i = 0; i < this.lodLevels; i++){
                const lodData = nodeData.lods?.[i.toString()];
                if (lodData) {
                    lods.push({
                        file: this.files[lodData.file].url || '',
                        fileIndex: lodData.file,
                        offset: lodData.offset || 0,
                        count: lodData.count || 0
                    });
                    this.files[lodData.file].lodLevel = i;
                } else lods.push({
                    file: '',
                    fileIndex: -1,
                    offset: 0,
                    count: 0
                });
            }
            return new GSplatOctreeNode(lods, nodeData.bound);
        });
    }
    destroy() {
        this.destroyed = true;
        this.fileResources.clear();
        this.restoringFileResources?.clear();
        this.cooldowns.clear();
        this.lastCooldownTickFrame = null;
        this.lastCooldownTickSource = null;
        if (this.assetLoader) {
            this.assetLoader.destroy();
            this.assetLoader = null;
        }
        this.environmentResource = null;
    }
    get hasPendingCooldowns() {
        return this.cooldowns.size > 0;
    }
    get hasCooldownTickWork() {
        for (const [fileIndex, remaining] of this.cooldowns){
            if (remaining > 1) return true;
            const resource = this.fileResources.get(fileIndex);
            const restoringResource = this.restoringFileResources.get(fileIndex);
            const blockedByActiveUse = 0 !== this.fileLoadInterests[fileIndex] || (resource?.refCount ?? 0) !== 0 || (restoringResource?.refCount ?? 0) !== 0;
            if (!blockedByActiveUse && this.assetLoader) return true;
        }
        return false;
    }
    _extractLeafNodes(node, leafNodes) {
        if (node.lods) leafNodes.push({
            lods: node.lods,
            bound: node.bound
        });
        else if (node.children) for (const child of node.children)this._extractLeafNodes(child, leafNodes);
    }
    getFileResource(fileIndex) {
        const resource = this.fileResources.get(fileIndex);
        if (resource?.gpuReady === false) {
            this.restoringFileResources.set(fileIndex, resource);
            this.fileResources.delete(fileIndex);
            return null;
        }
        return resource ?? null;
    }
    isFileFailed(fileIndex) {
        if (fileIndex < 0 || fileIndex >= this.files.length) return false;
        const url = this.files[fileIndex].url;
        return this.assetLoader?.isResourceFailed?.(url) === true;
    }
    isEnvironmentFailed() {
        if (!this.environmentUrl) return false;
        return this.assetLoader?.isResourceFailed?.(this.environmentUrl) === true;
    }
    incRefCount(fileIndex) {
        if (fileIndex < 0 || fileIndex >= this.files.length) {
            log.error(`[GSplatOctree] 无效的 fileIndex: ${fileIndex}`);
            return;
        }
        const count = this.fileRefCounts[fileIndex] + 1;
        this.fileRefCounts[fileIndex] = count;
        this.cooldowns.delete(fileIndex);
    }
    decRefCount(fileIndex, cooldownTicks = this.cooldownTicks) {
        if (fileIndex < 0 || fileIndex >= this.files.length) {
            log.error(`[GSplatOctree] 无效的 fileIndex: ${fileIndex}`);
            return;
        }
        const previousCount = this.fileRefCounts[fileIndex];
        if (previousCount <= 0) {
            this.fileRefCounts[fileIndex] = 0;
            log.error(`[GSplatOctree] 引用计数异常: fileIndex=${fileIndex}, count=-1`);
            return;
        }
        const count = previousCount - 1;
        this.fileRefCounts[fileIndex] = count;
        if (0 === count) {
            if (cooldownTicks <= 0) {
                if (!this.unloadResourceIfUnused(fileIndex)) this.cooldowns.set(fileIndex, 1);
            } else this.cooldowns.set(fileIndex, cooldownTicks);
        }
    }
    incLoadInterest(fileIndex) {
        if (fileIndex < 0 || fileIndex >= this.files.length) {
            log.error(`[GSplatOctree] 无效的 fileIndex: ${fileIndex}`);
            return;
        }
        this.fileLoadInterests[fileIndex]++;
        this.cooldowns.delete(fileIndex);
    }
    decLoadInterest(fileIndex) {
        if (fileIndex < 0 || fileIndex >= this.files.length) {
            log.error(`[GSplatOctree] 无效的 fileIndex: ${fileIndex}`);
            return;
        }
        const previousCount = this.fileLoadInterests[fileIndex];
        if (previousCount <= 0) {
            this.fileLoadInterests[fileIndex] = 0;
            log.error(`[GSplatOctree] 加载关注计数异常: fileIndex=${fileIndex}, count=-1`);
            return;
        }
        this.fileLoadInterests[fileIndex] = previousCount - 1;
    }
    cancelResourceLoadIfUnused(fileIndex) {
        if (fileIndex < 0 || fileIndex >= this.files.length) {
            log.error(`[GSplatOctree] 无效的 fileIndex: ${fileIndex}`);
            return;
        }
        if (0 !== this.fileRefCounts[fileIndex] || 0 !== this.fileLoadInterests[fileIndex]) return;
        const fullUrl = this.files[fileIndex].url;
        const loadedResource = this.fileResources.get(fileIndex) ?? this.assetLoader?.getResource(fullUrl);
        if (loadedResource) {
            this.fileResources.set(fileIndex, loadedResource);
            this.cooldowns.set(fileIndex, loadedResource.refCount > 0 ? 1 : this.cooldownTicks);
            return;
        }
        this.unloadResourceIfUnused(fileIndex);
    }
    updateCooldownTick(cooldownTicks, frameId, frameSource) {
        this.cooldownTicks = Math.max(0, Math.floor(cooldownTicks));
        if (0 === this.cooldowns.size) return;
        const hasFrameIdentity = 'number' == typeof frameId && Number.isFinite(frameId);
        const normalizedFrameId = hasFrameIdentity ? Math.floor(frameId) : null;
        const normalizedFrameSource = frameSource ?? null;
        if (hasFrameIdentity && this.lastCooldownTickFrame === normalizedFrameId && this.lastCooldownTickSource === normalizedFrameSource) return;
        if (hasFrameIdentity) {
            this.lastCooldownTickFrame = normalizedFrameId;
            this.lastCooldownTickSource = normalizedFrameSource;
        }
        this.cooldowns.forEach((remaining, fileIndex)=>{
            if (remaining <= 1) {
                if (0 !== this.fileRefCounts[fileIndex]) _toDelete.push(fileIndex);
                else if (this.unloadResourceIfUnused(fileIndex)) _toDelete.push(fileIndex);
                else this.cooldowns.set(fileIndex, 1);
            } else this.cooldowns.set(fileIndex, remaining - 1);
        });
        for (const fileIndex of _toDelete)this.cooldowns.delete(fileIndex);
        _toDelete.length = 0;
    }
    flushCooldowns() {
        for (const fileIndex of Array.from(this.cooldowns.keys()))if (0 !== this.fileRefCounts[fileIndex]) this.cooldowns.delete(fileIndex);
        else if (!this.unloadResourceIfUnused(fileIndex)) this.cooldowns.set(fileIndex, 1);
    }
    unloadResource(fileIndex) {
        if (fileIndex < 0 || fileIndex >= this.files.length) {
            log.error(`[GSplatOctree] 无效的 fileIndex: ${fileIndex}`);
            return;
        }
        if (!this.unloadResourceIfUnused(fileIndex)) this.cooldowns.set(fileIndex, 1);
    }
    unloadResourceIfUnused(fileIndex) {
        const resource = this.fileResources.get(fileIndex);
        const restoringResource = this.restoringFileResources.get(fileIndex);
        if (0 !== this.fileRefCounts[fileIndex] || 0 !== this.fileLoadInterests[fileIndex] || (resource?.refCount ?? 0) !== 0 || (restoringResource?.refCount ?? 0) !== 0) return false;
        if (!this.assetLoader) return false;
        const fullUrl = this.files[fileIndex].url;
        this.assetLoader.unload(fullUrl);
        if (this.fileResources.has(fileIndex)) this.fileResources.delete(fileIndex);
        this.restoringFileResources.delete(fileIndex);
        this.cooldowns.delete(fileIndex);
        return true;
    }
    ensureFileResource(fileIndex) {
        if (fileIndex < 0 || fileIndex >= this.files.length) {
            log.error(`[GSplatOctree] 无效的 fileIndex: ${fileIndex}`);
            return;
        }
        if (!this.assetLoader) {
            log.error('[GSplatOctree] assetLoader 未设置');
            return;
        }
        const cachedResource = this.fileResources.get(fileIndex);
        if (cachedResource) {
            if (false !== cachedResource.gpuReady) return;
            this.restoringFileResources.set(fileIndex, cachedResource);
            this.fileResources.delete(fileIndex);
        }
        const fullUrl = this.files[fileIndex].url;
        const res = this.assetLoader.getResource(fullUrl);
        if (res) {
            this.fileResources.set(fileIndex, res);
            this.restoringFileResources.delete(fileIndex);
            if (0 === this.fileRefCounts[fileIndex]) this.cooldowns.set(fileIndex, this.cooldownTicks);
            return;
        }
        this.assetLoader.load(fullUrl);
    }
    incEnvironmentRefCount() {
        this.environmentRefCount++;
    }
    decEnvironmentRefCount() {
        if (this.environmentRefCount <= 0) {
            this.environmentRefCount = 0;
            log.error('[GSplatOctree] environmentRefCount 异常: -1');
            return;
        }
        this.environmentRefCount--;
        if (0 === this.environmentRefCount) this.unloadEnvironmentResource();
    }
    ensureEnvironmentResource() {
        if (!this.assetLoader) return;
        if (!this.environmentUrl) return;
        if (this.environmentResource) return;
        const res = this.assetLoader.getResource(this.environmentUrl);
        if (res) {
            this.environmentResource = res;
            if (0 === this.environmentRefCount) this.unloadEnvironmentResource();
            return;
        }
        this.assetLoader.load(this.environmentUrl);
    }
    unloadEnvironmentResource() {
        try {
            if (this.assetLoader && this.environmentUrl) this.assetLoader.unload(this.environmentUrl);
        } finally{
            this.environmentResource = null;
        }
    }
    static resolveBaseUrl(filePath, options) {
        const queryPathMatch = filePath.match(/^([^?]+\?path=)(.*)$/);
        if (queryPathMatch) {
            const prefix = queryPathMatch[1];
            const actualPath = queryPathMatch[2];
            let decodedActualPath = actualPath;
            try {
                decodedActualPath = decodeURIComponent(actualPath);
            } catch  {
                decodedActualPath = actualPath;
            }
            const lastSlash = Math.max(decodedActualPath.lastIndexOf('/'), decodedActualPath.lastIndexOf('\\'));
            if (lastSlash >= 0) {
                const directory = decodedActualPath.substring(0, lastSlash + 1);
                const shouldEncode = options?.encode ?? actualPath.includes('%');
                return prefix + (shouldEncode ? encodeURIComponent(directory) : directory);
            }
            return prefix;
        }
        const localFileMatch = filePath.match(/^(https?:\/\/[^/]+\/local-file\/)(.+)$/);
        if (localFileMatch) {
            const prefix = localFileMatch[1];
            const encodedLocalPath = localFileMatch[2];
            let decodedLocalPath;
            try {
                decodedLocalPath = decodeURIComponent(encodedLocalPath);
            } catch  {
                decodedLocalPath = encodedLocalPath;
            }
            const lastSlash = Math.max(decodedLocalPath.lastIndexOf('/'), decodedLocalPath.lastIndexOf('\\'));
            if (lastSlash >= 0) {
                const localDir = decodedLocalPath.substring(0, lastSlash + 1);
                return prefix + encodeURIComponent(localDir);
            }
            return prefix;
        }
        const lastSlash = Math.max(filePath.lastIndexOf('/'), filePath.lastIndexOf('\\'));
        return lastSlash >= 0 ? filePath.substring(0, lastSlash + 1) : '';
    }
    static normalizeShardDir(shard, baseDir) {
        let shardUrl;
        try {
            shardUrl = new URL(shard);
        } catch  {
            return shard;
        }
        if ('/' !== shardUrl.pathname || shardUrl.search || shardUrl.hash) return shard;
        try {
            const baseUrl = new URL(baseDir);
            return shardUrl.origin + baseDir.slice(baseUrl.origin.length);
        } catch  {
            const normalizedBaseDir = baseDir.startsWith('/') ? baseDir : `/${baseDir}`;
            return shardUrl.origin + normalizedBaseDir;
        }
    }
    isRelativePath(path) {
        return !path.includes('://') && !path.startsWith('/');
    }
    joinPath(base, relative) {
        const queryPathMatch = base.match(/^([^?]+\?path=)(.*)$/);
        if (queryPathMatch) {
            const prefix = queryPathMatch[1];
            const basePath = queryPathMatch[2];
            let decodedBasePath = basePath;
            try {
                decodedBasePath = decodeURIComponent(basePath);
            } catch  {
                decodedBasePath = basePath;
            }
            const separator = decodedBasePath.includes('\\') ? '\\' : '/';
            let normalizedBase = decodedBasePath;
            if (!normalizedBase.endsWith('/') && !normalizedBase.endsWith('\\')) normalizedBase += separator;
            const normalizedRelative = relative.replace(/[/\\]/g, separator);
            const fullPath = normalizedBase + normalizedRelative;
            const shouldEncode = basePath.includes('%');
            return prefix + (shouldEncode ? encodeURIComponent(fullPath) : fullPath);
        }
        const localFileMatch = base.match(/^(https?:\/\/[^/]+\/local-file\/)(.+)$/);
        if (localFileMatch) {
            const prefix = localFileMatch[1];
            const encodedLocalDir = localFileMatch[2];
            let decodedLocalDir;
            try {
                decodedLocalDir = decodeURIComponent(encodedLocalDir);
            } catch  {
                decodedLocalDir = encodedLocalDir;
            }
            if (!decodedLocalDir.endsWith('/') && !decodedLocalDir.endsWith('\\')) decodedLocalDir += '/';
            const fullLocalPath = decodedLocalDir + relative;
            return prefix + encodeURIComponent(fullLocalPath);
        }
        const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
        const cleanRelative = relative.startsWith('/') ? relative.slice(1) : relative;
        return `${cleanBase}/${cleanRelative}`;
    }
}
export { GSplatOctree, GSplatOctreeNode };
