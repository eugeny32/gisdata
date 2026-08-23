import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('gsplat:loader');
function createAbortError() {
    return new DOMException('Aborted', 'AbortError');
}
function throwIfAborted(signal) {
    if (signal?.aborted) throw createAbortError();
}
function isSogsMetaV1(meta) {
    return 'means' in meta && 'object' == typeof meta.means && null !== meta.means && 'shape' in meta.means;
}
function isSogsMetaV2(meta) {
    return 'version' in meta && 'number' == typeof meta.version && (1 === meta.version || 2 === meta.version);
}
class SogsParser {
    static fetchInit(options) {
        if (!options?.withCredentials && !options?.signal) return;
        const init = {};
        if (options.withCredentials) init.credentials = 'include';
        if (options.signal) init.signal = options.signal;
        return init;
    }
    static upgradeMeta(meta) {
        const result = {
            version: 1,
            count: meta.means.shape[0],
            means: {
                mins: meta.means.mins,
                maxs: meta.means.maxs,
                files: meta.means.files
            },
            scales: {
                mins: meta.scales.mins,
                maxs: meta.scales.maxs,
                files: meta.scales.files
            },
            quats: {
                files: meta.quats.files
            },
            sh0: {
                mins: meta.sh0.mins,
                maxs: meta.sh0.maxs,
                files: meta.sh0.files
            }
        };
        if (meta.shN) result.shN = {
            mins: meta.shN.mins,
            maxs: meta.shN.maxs,
            files: meta.shN.files
        };
        return result;
    }
    static async loadTexture(url, options = {}) {
        const { signal } = options;
        throwIfAborted(signal);
        const response = await fetch(url, SogsParser.fetchInit(options));
        if (!response.ok) throw new Error(`Failed to load SOG texture: ${response.status}`);
        const blob = await response.blob();
        throwIfAborted(signal);
        const imageBitmap = await createImageBitmap(blob, {
            colorSpaceConversion: 'none',
            premultiplyAlpha: 'none'
        });
        let texture;
        try {
            throwIfAborted(signal);
            const width = Math.floor(imageBitmap.width);
            const height = Math.floor(imageBitmap.height);
            let imageData;
            if ('undefined' != typeof OffscreenCanvas) {
                const offscreen = new OffscreenCanvas(width, height);
                const ctx = offscreen.getContext('2d');
                ctx.drawImage(imageBitmap, 0, 0, width, height);
                imageData = ctx.getImageData(0, 0, width, height);
            } else {
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(imageBitmap, 0, 0, width, height);
                imageData = ctx.getImageData(0, 0, width, height);
            }
            throwIfAborted(signal);
            const expectedLength = width * height * 4;
            const actualLength = imageData.data.length;
            if (actualLength !== expectedLength) log.warn(`[SogsParser.loadTexture] 数据长度不匹配! 差额: ${expectedLength - actualLength} 字节`);
            const pixelData = new Uint8Array(expectedLength);
            pixelData.set(imageData.data.subarray(0, Math.min(actualLength, expectedLength)));
            texture = new __WEBPACK_EXTERNAL_MODULE_three__.DataTexture(pixelData, width, height, __WEBPACK_EXTERNAL_MODULE_three__.RGBAFormat, __WEBPACK_EXTERNAL_MODULE_three__.UnsignedByteType);
            texture.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
            texture.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
            texture.generateMipmaps = false;
            texture.colorSpace = __WEBPACK_EXTERNAL_MODULE_three__.NoColorSpace;
            texture.flipY = false;
            texture.needsUpdate = true;
            throwIfAborted(signal);
            return texture;
        } catch (error) {
            texture?.dispose();
            if (signal?.aborted) throw createAbortError();
            throw error;
        } finally{
            imageBitmap.close();
        }
    }
    static async load(metaUrl, options = {}) {
        const { signal } = options;
        throwIfAborted(signal);
        const response = await fetch(metaUrl, SogsParser.fetchInit(options));
        if (!response.ok) throw new Error(`Failed to load meta.json: ${response.status}`);
        let meta = await response.json();
        throwIfAborted(signal);
        if (isSogsMetaV1(meta)) {
            log.warn('[SogsParser] Loading SOG v1 data which is deprecated. Please recompress your scene with latest tools.');
            meta = SogsParser.upgradeMeta(meta);
        }
        const metaV2 = meta;
        const baseUrl = new URL(metaUrl, window.location.href);
        const subs = [
            'means',
            'quats',
            'scales',
            'sh0',
            'shN'
        ];
        const textureUrls = {};
        for (const sub of subs){
            const files = metaV2[sub]?.files ?? [];
            textureUrls[sub] = files.map((filename)=>{
                if (options.mapUrl) return options.mapUrl(filename);
                return new URL(filename, baseUrl).toString();
            });
        }
        const textureController = new AbortController();
        const abortTextures = ()=>textureController.abort();
        if (signal) {
            if (signal.aborted) abortTextures();
            else signal.addEventListener('abort', abortTextures, {
                once: true
            });
        }
        const textureOptions = {
            ...options,
            signal: textureController.signal
        };
        const loadPromises = [];
        const textureKeys = [];
        if (textureUrls.means[0]) {
            loadPromises.push(SogsParser.loadTexture(textureUrls.means[0], textureOptions));
            textureKeys.push('means_l');
        }
        if (textureUrls.means[1]) {
            loadPromises.push(SogsParser.loadTexture(textureUrls.means[1], textureOptions));
            textureKeys.push('means_u');
        }
        if (textureUrls.quats[0]) {
            loadPromises.push(SogsParser.loadTexture(textureUrls.quats[0], textureOptions));
            textureKeys.push('quats');
        }
        if (textureUrls.scales[0]) {
            loadPromises.push(SogsParser.loadTexture(textureUrls.scales[0], textureOptions));
            textureKeys.push('scales');
        }
        if (textureUrls.sh0[0]) {
            loadPromises.push(SogsParser.loadTexture(textureUrls.sh0[0], textureOptions));
            textureKeys.push('sh0');
        }
        if (textureUrls.shN && textureUrls.shN.length > 0) {
            if (textureUrls.shN[0]) {
                loadPromises.push(SogsParser.loadTexture(textureUrls.shN[0], textureOptions));
                textureKeys.push('sh_centroids');
            }
            if (textureUrls.shN[1]) {
                loadPromises.push(SogsParser.loadTexture(textureUrls.shN[1], textureOptions));
                textureKeys.push('sh_labels');
            }
        }
        let loaded = 0;
        const total = loadPromises.length;
        let firstError;
        try {
            const settled = await Promise.allSettled(loadPromises.map(async (promise)=>{
                let texture;
                try {
                    texture = await promise;
                    throwIfAborted(textureController.signal);
                    loaded++;
                    options.onProgress?.(loaded, total);
                    return texture;
                } catch (error) {
                    texture?.dispose();
                    if (void 0 === firstError) {
                        firstError = error;
                        textureController.abort();
                    }
                    throw error;
                }
            }));
            const textures = settled.flatMap((result)=>'fulfilled' === result.status ? [
                    result.value
                ] : []);
            const rejection = settled.find((result)=>'rejected' === result.status);
            if (signal?.aborted || rejection) {
                for (const texture of textures)texture.dispose();
                if (signal?.aborted) throw createAbortError();
                throw firstError ?? rejection?.reason;
            }
            const textureData = {
                means_l: textures[textureKeys.indexOf('means_l')],
                means_u: textures[textureKeys.indexOf('means_u')],
                quats: textures[textureKeys.indexOf('quats')],
                scales: textures[textureKeys.indexOf('scales')],
                sh0: textures[textureKeys.indexOf('sh0')]
            };
            if (textureKeys.includes('sh_centroids')) textureData.sh_centroids = textures[textureKeys.indexOf('sh_centroids')];
            if (textureKeys.includes('sh_labels')) textureData.sh_labels = textures[textureKeys.indexOf('sh_labels')];
            return {
                textures: textureData,
                meta: metaV2
            };
        } finally{
            signal?.removeEventListener('abort', abortTextures);
        }
    }
    static disposeTextures(textures) {
        textures.means_l?.dispose();
        textures.means_u?.dispose();
        textures.quats?.dispose();
        textures.scales?.dispose();
        textures.sh0?.dispose();
        textures.sh_centroids?.dispose();
        textures.sh_labels?.dispose();
    }
}
export { SogsParser, isSogsMetaV1, isSogsMetaV2 };
