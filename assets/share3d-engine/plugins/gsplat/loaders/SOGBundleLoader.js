import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__core_GaussianSplatMesh_js_d31375fc__ from "../core/GaussianSplatMesh.js";
import * as __WEBPACK_EXTERNAL_MODULE__core_GSplatSogsData_js_6764351e__ from "../core/GSplatSogsData.js";
import * as __WEBPACK_EXTERNAL_MODULE__SogsParser_js_a09f7288__ from "./SogsParser.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_syncTextureUploadVersion_js_1de580b2__ from "../utils/syncTextureUploadVersion.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__SOGLoader_js_377ab56c__ from "./SOGLoader.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('gsplat:loader');
function createAbortError() {
    return new DOMException('Aborted', 'AbortError');
}
function throwIfAborted(signal) {
    if (signal?.aborted) throw createAbortError();
}
class SOGBundleLoader {
    constructor(options = {}){
        this.options = options;
        this.sogLoader = new __WEBPACK_EXTERNAL_MODULE__SOGLoader_js_377ab56c__.SOGLoader(options);
    }
    async load(url) {
        const arrayBuffer = await this.downloadArrayBuffer(url, this.options.signal);
        return this.parseBuffer(arrayBuffer);
    }
    async parseBuffer(arrayBuffer) {
        const { signal } = this.options;
        throwIfAborted(signal);
        const files = this.parseZipArchive(arrayBuffer, signal);
        for (const file of files){
            throwIfAborted(signal);
            if ('deflate' === file.compression) file.data = await this.inflate(file.data, signal);
        }
        const metaFile = files.find((f)=>'meta.json' === f.filename);
        if (!metaFile) throw new Error('SOG Bundle 中未找到 meta.json');
        const metaText = new TextDecoder().decode(metaFile.data);
        const meta = JSON.parse(metaText);
        return this.loadFromMemory(meta, files);
    }
    async loadGpuData(url, options = {}) {
        const signal = options.signal ?? this.options.signal;
        throwIfAborted(signal);
        const arrayBuffer = await this.downloadArrayBuffer(url, signal);
        const { files, meta } = await this.parseBundle(arrayBuffer, signal);
        const metaV2 = this.normalizeMeta(meta);
        this.patchMetaCodebooks(metaV2);
        const fileMap = this.createFileMap(files);
        const textureController = new AbortController();
        const abortTextures = ()=>textureController.abort();
        if (signal) {
            if (signal.aborted) abortTextures();
            else signal.addEventListener('abort', abortTextures, {
                once: true
            });
        }
        const requireTexture = async (filename, name)=>{
            const data = fileMap.get(filename);
            if (!data) throw new Error(`SOG Bundle 中缺少文件: ${filename}`);
            return this.loadWebPTextureFromMemory(data, name, {
                ...options,
                signal: textureController.signal
            });
        };
        const completedTextures = [];
        const loadTexture = async (filename, name)=>{
            const texture = await requireTexture(filename, name);
            completedTextures.push(texture);
            return texture;
        };
        try {
            const meansLow = await loadTexture(metaV2.means.files[0], 'sogsMeansLow');
            const meansHigh = await loadTexture(metaV2.means.files[1], 'sogsMeansHigh');
            const quats = await loadTexture(metaV2.quats.files[0], 'sogsQuats');
            const scales = await loadTexture(metaV2.scales.files[0], 'sogsScales');
            const sh0 = await loadTexture(metaV2.sh0.files[0], 'sogsSH0');
            const shCentroids = metaV2.shN?.files[0] ? await loadTexture(metaV2.shN.files[0], 'sogsSHCentroids') : void 0;
            const shLabels = metaV2.shN?.files[1] ? await loadTexture(metaV2.shN.files[1], 'sogsSHLabels') : void 0;
            return new __WEBPACK_EXTERNAL_MODULE__core_GSplatSogsData_js_6764351e__.GSplatSogsData({
                meta: metaV2,
                numSplats: metaV2.count,
                means_l: meansLow,
                means_u: meansHigh,
                quats,
                scales,
                sh0,
                sh_centroids: shCentroids,
                sh_labels: shLabels,
                url
            });
        } catch (error) {
            textureController.abort();
            this.disposeTextures(completedTextures);
            if (signal?.aborted) throw createAbortError();
            throw error;
        } finally{
            signal?.removeEventListener('abort', abortTextures);
        }
    }
    async loadMesh(url, meshOptions) {
        const splatData = await this.load(url);
        return new __WEBPACK_EXTERNAL_MODULE__core_GaussianSplatMesh_js_d31375fc__.GaussianSplatMesh(splatData, meshOptions);
    }
    async downloadArrayBuffer(url, signal = this.options.signal) {
        return log.perf.span('download', async ()=>{
            throwIfAborted(signal);
            const init = {};
            if (this.options.withCredentials) init.credentials = 'include';
            if (signal) init.signal = signal;
            const response = await fetch(url, init);
            if (!response.ok) throw new Error(`加载失败: ${response.status} ${response.statusText}`);
            const result = await response.arrayBuffer();
            throwIfAborted(signal);
            return result;
        });
    }
    async parseBundle(arrayBuffer, signal = this.options.signal) {
        return log.perf.span('decode', async ()=>{
            throwIfAborted(signal);
            const files = this.parseZipArchive(arrayBuffer, signal);
            for (const file of files){
                throwIfAborted(signal);
                if ('deflate' === file.compression) file.data = await this.inflate(file.data, signal);
            }
            const metaFile = files.find((file)=>'meta.json' === file.filename);
            if (!metaFile) throw new Error('SOG Bundle 中未找到 meta.json');
            const metaText = new TextDecoder().decode(metaFile.data);
            const meta = JSON.parse(metaText);
            return {
                files,
                meta
            };
        });
    }
    normalizeMeta(meta) {
        if ((0, __WEBPACK_EXTERNAL_MODULE__SogsParser_js_a09f7288__.isSogsMetaV1)(meta)) return __WEBPACK_EXTERNAL_MODULE__SogsParser_js_a09f7288__.SogsParser.upgradeMeta(meta);
        if ((0, __WEBPACK_EXTERNAL_MODULE__SogsParser_js_a09f7288__.isSogsMetaV2)(meta)) return meta;
        throw new Error('Invalid SOG meta structure');
    }
    patchMetaCodebooks(meta) {
        const codebookNames = [
            'scales',
            'sh0',
            'shN'
        ];
        for (const name of codebookNames){
            const codebook = meta[name]?.codebook;
            if (codebook?.[0] === null) codebook[0] = (codebook[1] ?? 0) + ((codebook[1] ?? 0) - (codebook[255] ?? 0)) / 255;
        }
    }
    createFileMap(files) {
        const fileMap = new Map();
        for (const file of files)fileMap.set(file.filename, file.data);
        return fileMap;
    }
    async loadWebPTextureFromMemory(data, name, options = {}) {
        const { signal } = options;
        throwIfAborted(signal);
        const buffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
        const blob = new Blob([
            buffer
        ], {
            type: 'image/webp'
        });
        let image;
        let texture;
        try {
            if ('undefined' != typeof createImageBitmap) try {
                image = await createImageBitmap(blob, {
                    colorSpaceConversion: 'none',
                    premultiplyAlpha: 'none'
                });
            } catch  {
                throwIfAborted(signal);
                image = await this.loadImageFromBlob(blob, signal);
            }
            else image = await this.loadImageFromBlob(blob, signal);
            throwIfAborted(signal);
            texture = new __WEBPACK_EXTERNAL_MODULE_three__.Texture(image);
            texture.name = name;
            texture.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
            texture.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
            texture.wrapS = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
            texture.wrapT = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
            texture.generateMipmaps = false;
            texture.colorSpace = __WEBPACK_EXTERNAL_MODULE_three__.NoColorSpace;
            texture.flipY = false;
            texture.needsUpdate = true;
            if (false !== options.preuploadTextures && options.renderer) {
                options.renderer.initTexture(texture);
                (0, __WEBPACK_EXTERNAL_MODULE__utils_syncTextureUploadVersion_js_1de580b2__.syncTextureUploadVersion)(options.renderer, texture);
            }
            if (options.retainTextureRestoreSource) (0, __WEBPACK_EXTERNAL_MODULE__core_GSplatSogsData_js_6764351e__.registerGSplatSogsTextureRestoreSource)(texture, blob, image.width, image.height);
            throwIfAborted(signal);
            if (options.retainTextureRestoreSource && false !== options.preuploadTextures && options.renderer) this.releaseDecodedTextureImage(texture);
            return texture;
        } catch (error) {
            if (texture) this.disposeTexture(texture);
            else this.closeImage(image);
            if (signal?.aborted) throw createAbortError();
            throw error;
        }
    }
    loadImageFromBlob(blob, signal) {
        return new Promise((resolve, reject)=>{
            if (signal?.aborted) {
                reject(createAbortError());
                return;
            }
            const image = new Image();
            const objectUrl = URL.createObjectURL(blob);
            let settled = false;
            const cleanup = ()=>{
                image.onload = null;
                image.onerror = null;
                signal?.removeEventListener('abort', onAbort);
                URL.revokeObjectURL(objectUrl);
            };
            const onAbort = ()=>{
                if (settled) return;
                settled = true;
                cleanup();
                image.src = '';
                reject(createAbortError());
            };
            image.crossOrigin = 'anonymous';
            image.decoding = 'async';
            image.onload = ()=>{
                if (settled) return;
                settled = true;
                cleanup();
                resolve(image);
            };
            image.onerror = ()=>{
                if (settled) return;
                settled = true;
                cleanup();
                image.src = '';
                reject(new Error('Failed to decode SOG WebP texture'));
            };
            signal?.addEventListener('abort', onAbort, {
                once: true
            });
            image.src = objectUrl;
        });
    }
    closeImage(image) {
        if (!image || 'object' != typeof image) return;
        if ('close' in image) {
            const close = image.close;
            if ('function' == typeof close) try {
                close.call(image);
            } catch  {}
            return;
        }
        if ('undefined' != typeof HTMLImageElement && image instanceof HTMLImageElement) {
            image.onload = null;
            image.onerror = null;
            image.src = '';
        }
    }
    releaseDecodedTextureImage(texture) {
        const image = texture.image;
        const width = Number(image?.width);
        const height = Number(image?.height);
        if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) return;
        try {
            this.closeImage(image);
        } finally{
            texture.image = {
                width,
                height
            };
        }
    }
    disposeTexture(texture) {
        const image = texture.image;
        try {
            texture.dispose();
        } finally{
            try {
                this.closeImage(image);
            } finally{
                texture.image = null;
            }
        }
    }
    disposeTextures(textures) {
        for (const texture of textures)this.disposeTexture(texture);
    }
    parseZipArchive(data, signal = this.options.signal) {
        throwIfAborted(signal);
        const dataView = new DataView(data);
        const u16 = (offset)=>dataView.getUint16(offset, true);
        const u32 = (offset)=>dataView.getUint32(offset, true);
        const extractEocd = (offset)=>({
                magic: u32(offset),
                numFiles: u16(offset + 8),
                cdSizeBytes: u32(offset + 12),
                cdOffsetBytes: u32(offset + 16)
            });
        const extractCdr = (offset)=>{
            const filenameLength = u16(offset + 28);
            const extraFieldLength = u16(offset + 30);
            const fileCommentLength = u16(offset + 32);
            return {
                magic: u32(offset),
                compressionMethod: u16(offset + 10),
                compressedSizeBytes: u32(offset + 20),
                uncompressedSizeBytes: u32(offset + 24),
                lfhOffsetBytes: u32(offset + 42),
                filename: new TextDecoder().decode(new Uint8Array(data, offset + 46, filenameLength)),
                recordSizeBytes: 46 + filenameLength + extraFieldLength + fileCommentLength
            };
        };
        const extractLfh = (offset)=>{
            const filenameLength = u16(offset + 26);
            const extraLength = u16(offset + 28);
            return {
                magic: u32(offset),
                offsetBytes: offset + 30 + filenameLength + extraLength
            };
        };
        const eocd = extractEocd(dataView.byteLength - 22);
        if (0x06054b50 !== eocd.magic) throw new Error('无效的 ZIP 文件: 未找到 EOCD');
        if (0xffffffff === eocd.cdOffsetBytes || 0xffffffff === eocd.cdSizeBytes) throw new Error('无效的 ZIP 文件: 不支持 Zip64');
        const result = [];
        let offset = eocd.cdOffsetBytes;
        for(let i = 0; i < eocd.numFiles; i++){
            throwIfAborted(signal);
            const cdr = extractCdr(offset);
            if (0x02014b50 !== cdr.magic) throw new Error('无效的 ZIP 文件: 未找到 CDR');
            const lfh = extractLfh(cdr.lfhOffsetBytes);
            if (0x04034b50 !== lfh.magic) throw new Error('无效的 ZIP 文件: 未找到 LFH');
            const compressionMap = {
                0: 'none',
                8: 'deflate'
            };
            result.push({
                filename: cdr.filename,
                compression: compressionMap[cdr.compressionMethod] ?? 'unknown',
                data: new Uint8Array(data, lfh.offsetBytes, cdr.compressedSizeBytes)
            });
            offset += cdr.recordSizeBytes;
        }
        return result;
    }
    async inflate(compressed, signal = this.options.signal) {
        throwIfAborted(signal);
        if ('undefined' == typeof DecompressionStream) throw new Error('浏览器不支持 DecompressionStream API');
        const ds = new DecompressionStream('deflate-raw');
        const buffer = compressed.buffer.slice(compressed.byteOffset, compressed.byteOffset + compressed.byteLength);
        const blob = new Blob([
            buffer
        ]);
        const out = blob.stream().pipeThrough(ds);
        const reader = out.getReader();
        const chunks = [];
        let totalLength = 0;
        let cancelPromise = null;
        const abort = ()=>{
            cancelPromise ??= reader.cancel(createAbortError()).catch(()=>void 0);
        };
        signal?.addEventListener('abort', abort, {
            once: true
        });
        try {
            while(true){
                throwIfAborted(signal);
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(value);
                totalLength += value.byteLength;
            }
            throwIfAborted(signal);
            const result = new Uint8Array(totalLength);
            let offset = 0;
            for (const chunk of chunks){
                result.set(chunk, offset);
                offset += chunk.byteLength;
            }
            return result;
        } catch (error) {
            if (signal?.aborted) throw createAbortError();
            throw error;
        } finally{
            signal?.removeEventListener('abort', abort);
            await cancelPromise;
            reader.releaseLock();
        }
    }
    async loadFromMemory(meta, files) {
        const hasMeta = (m)=>true;
        if (!hasMeta(meta)) throw new Error('Invalid meta structure');
        const filenames = [
            ...meta.means?.files ?? [],
            ...meta.scales?.files ?? [],
            ...meta.quats?.files ?? [],
            ...meta.sh0?.files ?? [],
            ...meta.shN?.files ?? []
        ];
        const fileMap = new Map();
        for (const file of files)fileMap.set(file.filename, file.data);
        for (const filename of filenames)if (!fileMap.has(filename)) throw new Error(`SOG Bundle 中缺少文件: ${filename}`);
        return this.sogLoader.loadChunkFromMemory(meta, fileMap);
    }
}
export { SOGBundleLoader };
