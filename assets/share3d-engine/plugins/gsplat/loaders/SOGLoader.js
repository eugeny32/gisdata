import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__core_GaussianSplatMesh_js_d31375fc__ from "../core/GaussianSplatMesh.js";
import * as __WEBPACK_EXTERNAL_MODULE__core_SogsData_js_907ea638__ from "../core/SogsData.js";
import * as __WEBPACK_EXTERNAL_MODULE__core_SplatData_js_d4d2cdff__ from "../core/SplatData.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('gsplat:loader');
class SOGLoader {
    constructor(options = {}){
        this.baseUrl = '';
        this.lodMeta = null;
        this.chunkMetas = new Map();
        this.options = {
            initialLod: 0,
            maxConcurrentLoads: 8,
            debug: false,
            ...options
        };
    }
    fetchInit(extra) {
        const init = {};
        if (this.options.withCredentials) init.credentials = 'include';
        if (this.options.signal) init.signal = this.options.signal;
        return extra ? {
            ...init,
            ...extra
        } : init;
    }
    updateOptions(options) {
        this.options = {
            ...this.options,
            ...options
        };
    }
    async load(url) {
        if (this.options.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        const decodedUrl = decodeURIComponent(url);
        this.baseUrl = decodedUrl.substring(0, decodedUrl.lastIndexOf('/') + 1);
        this.options.onProgress?.(0, 100, '加载元数据');
        const response = await fetch(url, this.fetchInit());
        if (!response.ok) throw new Error(`加载失败: ${response.status} ${response.statusText}`);
        this.lodMeta = await response.json();
        if (this.options.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        const chunksToLoad = this.collectChunksForLod(this.options.initialLod || 0);
        const totalChunks = chunksToLoad.length;
        let loadedCount = 0;
        const chunkDataList = [];
        try {
            const batchSize = this.options.maxConcurrentLoads || 8;
            for(let i = 0; i < chunksToLoad.length; i += batchSize){
                if (this.options.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
                const batch = chunksToLoad.slice(i, i + batchSize);
                const results = await Promise.all(batch.map(async (chunkInfo)=>{
                    const data = await this.loadChunk(chunkInfo.fileIndex, chunkInfo.offset, chunkInfo.count);
                    loadedCount++;
                    this.options.onProgress?.(loadedCount, totalChunks, `加载块 ${loadedCount}/${totalChunks}`);
                    return data;
                }));
                chunkDataList.push(...results);
            }
        } catch (error) {
            for (const data of chunkDataList)if (data instanceof __WEBPACK_EXTERNAL_MODULE__core_SogsData_js_907ea638__.SogsData) data.dispose();
            throw error;
        }
        this.options.onProgress?.(totalChunks, totalChunks, '合并数据');
        if (false !== this.options.keepCompressed) {
            const mergedSogs = this.mergeSogsData(chunkDataList);
            return mergedSogs;
        }
        {
            const mergedData = this.mergeSplatData(chunkDataList);
            return mergedData;
        }
    }
    async loadMesh(url, meshOptions) {
        const splatData = await this.load(url);
        return new __WEBPACK_EXTERNAL_MODULE__core_GaussianSplatMesh_js_d31375fc__.GaussianSplatMesh(splatData, meshOptions);
    }
    collectChunksForLod(lodLevel) {
        const chunks = [];
        const collectFromNode = (node)=>{
            if (node.lods) {
                const lodKey = lodLevel.toString();
                if (node.lods[lodKey]) chunks.push({
                    fileIndex: node.lods[lodKey].file,
                    offset: node.lods[lodKey].offset,
                    count: node.lods[lodKey].count
                });
            }
            if (node.children) for (const child of node.children)collectFromNode(child);
        };
        if (this.lodMeta?.tree) collectFromNode(this.lodMeta.tree);
        return chunks;
    }
    async loadChunk(fileIndex, offset, count) {
        if (this.options.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        let chunkMeta = this.chunkMetas.get(fileIndex);
        if (!chunkMeta) {
            const metaUrl = this.baseUrl + this.lodMeta?.filenames[fileIndex];
            const response = await fetch(metaUrl, this.fetchInit());
            chunkMeta = await response.json();
            this.chunkMetas.set(fileIndex, chunkMeta);
        }
        const chunkDir = this.lodMeta?.filenames[fileIndex].replace('/meta.json', '/');
        if (!chunkDir) throw new Error('[SOGLoader] 无法计算块目录');
        const [meansData, scalesData, quatsData, sh0Data, shNData] = await Promise.all([
            this.loadMeansWebP(chunkDir, chunkMeta),
            this.loadScalesWebP(chunkDir, chunkMeta),
            this.loadQuatsWebP(chunkDir, chunkMeta),
            this.loadSH0WebP(chunkDir, chunkMeta),
            this.loadShNWebP(chunkDir, chunkMeta)
        ]);
        if (false !== this.options.keepCompressed) return this.extractChunkSogsData(chunkMeta, meansData, scalesData, quatsData, sh0Data, shNData, offset, count);
        return this.extractChunkData(chunkMeta, meansData, scalesData, quatsData, sh0Data, offset, count);
    }
    async loadMeansWebP(chunkDir, meta) {
        const [lowResult, highResult] = await Promise.all([
            this.loadWebPAsImageData(this.baseUrl + chunkDir + meta.means.files[0]),
            this.loadWebPAsImageData(this.baseUrl + chunkDir + meta.means.files[1])
        ]);
        return {
            low: lowResult.data,
            high: highResult.data
        };
    }
    async loadScalesWebP(chunkDir, meta) {
        const result = await this.loadWebPAsImageData(this.baseUrl + chunkDir + meta.scales.files[0]);
        return result.data;
    }
    async loadQuatsWebP(chunkDir, meta) {
        const result = await this.loadWebPAsImageData(this.baseUrl + chunkDir + meta.quats.files[0]);
        return result.data;
    }
    async loadSH0WebP(chunkDir, meta) {
        const result = await this.loadWebPAsImageData(this.baseUrl + chunkDir + meta.sh0.files[0]);
        return result.data;
    }
    async loadShNWebP(chunkDir, meta) {
        if (!meta.shN?.files || meta.shN.files.length < 2) return null;
        const [centroidsResult, labelsResult] = await Promise.all([
            this.loadWebPAsImageData(this.baseUrl + chunkDir + meta.shN.files[0]),
            this.loadWebPAsImageData(this.baseUrl + chunkDir + meta.shN.files[1])
        ]);
        return {
            shCentroids: centroidsResult.data,
            shLabels: labelsResult.data,
            shCentroidsWidth: centroidsResult.width,
            shCentroidsHeight: centroidsResult.height
        };
    }
    async loadWebPAsImageData(url) {
        if (this.options.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        return new Promise((resolve, reject)=>{
            const img = new Image();
            img.crossOrigin = 'anonymous';
            const abortHandler = ()=>{
                img.src = '';
                reject(new DOMException('Aborted', 'AbortError'));
            };
            if (this.options.signal) this.options.signal.addEventListener('abort', abortHandler, {
                once: true
            });
            img.onload = ()=>{
                if (this.options.signal) this.options.signal.removeEventListener('abort', abortHandler);
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('无法创建 canvas context'));
                    return;
                }
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, img.width, img.height);
                resolve({
                    data: new Uint8Array(imageData.data.buffer),
                    width: img.width,
                    height: img.height
                });
            };
            img.onerror = ()=>{
                if (this.options.signal) this.options.signal.removeEventListener('abort', abortHandler);
                reject(new Error(`加载图片失败: ${url}`));
            };
            img.src = url;
        });
    }
    extractChunkData(meta, meansData, scalesData, quatsData, sh0Data, offset, count) {
        const x = new Float32Array(count);
        const y = new Float32Array(count);
        const z = new Float32Array(count);
        const scale_0 = new Float32Array(count);
        const scale_1 = new Float32Array(count);
        const scale_2 = new Float32Array(count);
        const rot_0 = new Float32Array(count);
        const rot_1 = new Float32Array(count);
        const rot_2 = new Float32Array(count);
        const rot_3 = new Float32Array(count);
        const f_dc_0 = new Float32Array(count);
        const f_dc_1 = new Float32Array(count);
        const f_dc_2 = new Float32Array(count);
        const opacity = new Float32Array(count);
        const mins = meta.means.mins;
        const maxs = meta.means.maxs;
        const ranges = [
            maxs[0] - mins[0],
            maxs[1] - mins[1],
            maxs[2] - mins[2]
        ];
        const scalesCodebook = meta.scales.codebook;
        const sh0Codebook = meta.sh0.codebook;
        for(let i = 0; i < count; i++){
            const srcIdx = offset + i;
            const pixelOffset = 4 * srcIdx;
            const lowR = meansData.low[pixelOffset];
            const lowG = meansData.low[pixelOffset + 1];
            const lowB = meansData.low[pixelOffset + 2];
            const highR = meansData.high[pixelOffset];
            const highG = meansData.high[pixelOffset + 1];
            const highB = meansData.high[pixelOffset + 2];
            const px = (highR << 8 | lowR) / 65535;
            const py = (highG << 8 | lowG) / 65535;
            const pz = (highB << 8 | lowB) / 65535;
            x[i] = mins[0] + px * ranges[0];
            y[i] = mins[1] + py * ranges[1];
            z[i] = mins[2] + pz * ranges[2];
            const scaleIdx0 = scalesData[pixelOffset];
            const scaleIdx1 = scalesData[pixelOffset + 1];
            const scaleIdx2 = scalesData[pixelOffset + 2];
            scale_0[i] = scalesCodebook[scaleIdx0] ?? -10;
            scale_1[i] = scalesCodebook[scaleIdx1] ?? -10;
            scale_2[i] = scalesCodebook[scaleIdx2] ?? -10;
            const qx = quatsData[pixelOffset] / 255 * 2 - 1;
            const qy = quatsData[pixelOffset + 1] / 255 * 2 - 1;
            const qz = quatsData[pixelOffset + 2] / 255 * 2 - 1;
            const qw = quatsData[pixelOffset + 3] / 255 * 2 - 1;
            const qLen = Math.sqrt(qx * qx + qy * qy + qz * qz + qw * qw);
            rot_0[i] = qw / qLen;
            rot_1[i] = qx / qLen;
            rot_2[i] = qy / qLen;
            rot_3[i] = qz / qLen;
            const sh0Idx0 = sh0Data[pixelOffset];
            const sh0Idx1 = sh0Data[pixelOffset + 1];
            const sh0Idx2 = sh0Data[pixelOffset + 2];
            const sh0Alpha = sh0Data[pixelOffset + 3];
            f_dc_0[i] = sh0Codebook[sh0Idx0] ?? 0;
            f_dc_1[i] = sh0Codebook[sh0Idx1] ?? 0;
            f_dc_2[i] = sh0Codebook[sh0Idx2] ?? 0;
            const alpha = sh0Alpha / 255;
            opacity[i] = alpha <= 0 ? -40 : alpha >= 1 ? 40 : -Math.log(1 / alpha - 1);
        }
        const splatData = new __WEBPACK_EXTERNAL_MODULE__core_SplatData_js_d4d2cdff__.SplatData();
        splatData.numSplats = count;
        splatData.elements = [
            {
                name: 'vertex',
                count: count,
                properties: [
                    {
                        name: 'x',
                        type: 'float',
                        storage: x
                    },
                    {
                        name: 'y',
                        type: 'float',
                        storage: y
                    },
                    {
                        name: 'z',
                        type: 'float',
                        storage: z
                    },
                    {
                        name: 'f_dc_0',
                        type: 'float',
                        storage: f_dc_0
                    },
                    {
                        name: 'f_dc_1',
                        type: 'float',
                        storage: f_dc_1
                    },
                    {
                        name: 'f_dc_2',
                        type: 'float',
                        storage: f_dc_2
                    },
                    {
                        name: 'opacity',
                        type: 'float',
                        storage: opacity
                    },
                    {
                        name: 'scale_0',
                        type: 'float',
                        storage: scale_0
                    },
                    {
                        name: 'scale_1',
                        type: 'float',
                        storage: scale_1
                    },
                    {
                        name: 'scale_2',
                        type: 'float',
                        storage: scale_2
                    },
                    {
                        name: 'rot_0',
                        type: 'float',
                        storage: rot_0
                    },
                    {
                        name: 'rot_1',
                        type: 'float',
                        storage: rot_1
                    },
                    {
                        name: 'rot_2',
                        type: 'float',
                        storage: rot_2
                    },
                    {
                        name: 'rot_3',
                        type: 'float',
                        storage: rot_3
                    }
                ]
            }
        ];
        return splatData;
    }
    extractChunkSogsData(meta, meansData, scalesData, quatsData, sh0Data, shNData, offset, count) {
        const pixelStart = 4 * offset;
        const pixelCount = 4 * count;
        const meansLow = meansData.low.slice(pixelStart, pixelStart + pixelCount);
        const meansHigh = meansData.high.slice(pixelStart, pixelStart + pixelCount);
        const quats = quatsData.slice(pixelStart, pixelStart + pixelCount);
        const scales = scalesData.slice(pixelStart, pixelStart + pixelCount);
        const sh0 = sh0Data.slice(pixelStart, pixelStart + pixelCount);
        let shLabels;
        if (shNData?.shLabels) shLabels = shNData.shLabels.slice(pixelStart, pixelStart + pixelCount);
        const sogsMeta = {
            version: meta.version,
            means: {
                mins: meta.means.mins,
                maxs: meta.means.maxs
            },
            scales: {
                ...2 === meta.version && meta.scales.codebook.length > 0 ? {
                    codebook: new Float32Array(meta.scales.codebook)
                } : {},
                ...meta.scales.mins ? {
                    mins: meta.scales.mins
                } : {},
                ...meta.scales.maxs ? {
                    maxs: meta.scales.maxs
                } : {}
            },
            sh0: {
                ...2 === meta.version && meta.sh0.codebook.length > 0 ? {
                    codebook: new Float32Array(meta.sh0.codebook)
                } : {},
                ...meta.sh0.mins ? {
                    mins: meta.sh0.mins
                } : {},
                ...meta.sh0.maxs ? {
                    maxs: meta.sh0.maxs
                } : {}
            },
            ...meta.shN ? {
                shN: {
                    ...void 0 !== meta.shN.count ? {
                        count: meta.shN.count
                    } : {},
                    ...void 0 !== meta.shN.bands ? {
                        bands: meta.shN.bands
                    } : {},
                    ...2 === meta.version && meta.shN.codebook.length > 0 ? {
                        codebook: new Float32Array(meta.shN.codebook)
                    } : {},
                    ...void 0 !== meta.shN.mins ? {
                        mins: meta.shN.mins
                    } : {},
                    ...void 0 !== meta.shN.maxs ? {
                        maxs: meta.shN.maxs
                    } : {}
                }
            } : {}
        };
        return new __WEBPACK_EXTERNAL_MODULE__core_SogsData_js_907ea638__.SogsData({
            meta: sogsMeta,
            numSplats: count,
            meansLow,
            meansHigh,
            quats,
            scales,
            sh0,
            ...shLabels ? {
                shLabels
            } : {},
            ...shNData?.shCentroids ? {
                shCentroids: shNData.shCentroids
            } : {},
            ...shNData?.shCentroidsWidth ? {
                shCentroidsWidth: shNData.shCentroidsWidth
            } : {},
            ...shNData?.shCentroidsHeight ? {
                shCentroidsHeight: shNData.shCentroidsHeight
            } : {}
        });
    }
    mergeSplatData(dataList) {
        const splatDataList = dataList.filter((d)=>d instanceof __WEBPACK_EXTERNAL_MODULE__core_SplatData_js_d4d2cdff__.SplatData);
        if (0 === splatDataList.length) {
            const empty = new __WEBPACK_EXTERNAL_MODULE__core_SplatData_js_d4d2cdff__.SplatData();
            empty.numSplats = 0;
            empty.elements = [];
            return empty;
        }
        if (1 === splatDataList.length) return splatDataList[0];
        const totalCount = splatDataList.reduce((sum, d)=>sum + d.numSplats, 0);
        const propNames = splatDataList[0].elements[0].properties.map((p)=>p.name);
        const mergedProps = new Map();
        for (const name of propNames)mergedProps.set(name, new Float32Array(totalCount));
        let offset = 0;
        for (const data of splatDataList){
            for (const name of propNames){
                const src = data.getProp(name);
                const dst = mergedProps.get(name);
                if (src) dst.set(src, offset);
            }
            offset += data.numSplats;
        }
        const merged = new __WEBPACK_EXTERNAL_MODULE__core_SplatData_js_d4d2cdff__.SplatData();
        merged.numSplats = totalCount;
        merged.elements = [
            {
                name: 'vertex',
                count: totalCount,
                properties: propNames.map((name)=>({
                        name,
                        type: 'float',
                        storage: mergedProps.get(name)
                    }))
            }
        ];
        return merged;
    }
    mergeSogsData(dataList) {
        const sogsDataList = dataList.filter((d)=>d instanceof __WEBPACK_EXTERNAL_MODULE__core_SogsData_js_907ea638__.SogsData);
        if (0 === sogsDataList.length) throw new Error('No SOGS data to merge');
        if (1 === sogsDataList.length) return sogsDataList[0];
        const totalCount = sogsDataList.reduce((sum, d)=>sum + d.numSplats, 0);
        const meansLow = new Uint8Array(4 * totalCount);
        const meansHigh = new Uint8Array(4 * totalCount);
        const quats = new Uint8Array(4 * totalCount);
        const scales = new Uint8Array(4 * totalCount);
        const sh0 = new Uint8Array(4 * totalCount);
        const hasShData = sogsDataList.some((d)=>d.shLabels && d.shCentroids);
        let shLabels;
        let shCentroids;
        if (hasShData) {
            shLabels = new Uint8Array(4 * totalCount);
            shCentroids = sogsDataList.find((d)=>d.shCentroids)?.shCentroids ?? void 0;
        }
        let offset = 0;
        for (const data of sogsDataList){
            if (!data.meansLow || !data.meansHigh || !data.quats || !data.scales || !data.sh0) throw new Error('[SOGLoader] 无法合并 SOGS 数据：数据已释放（minimalMemory 模式）');
            const count = 4 * data.numSplats;
            meansLow.set(data.meansLow, offset);
            meansHigh.set(data.meansHigh, offset);
            quats.set(data.quats, offset);
            scales.set(data.scales, offset);
            sh0.set(data.sh0, offset);
            if (shLabels && data.shLabels) shLabels.set(data.shLabels, offset);
            offset += count;
        }
        return new __WEBPACK_EXTERNAL_MODULE__core_SogsData_js_907ea638__.SogsData({
            meta: sogsDataList[0].meta,
            numSplats: totalCount,
            meansLow,
            meansHigh,
            quats,
            scales,
            sh0,
            ...shLabels ? {
                shLabels
            } : {},
            ...shCentroids ? {
                shCentroids
            } : {}
        });
    }
    getBoundingBox() {
        if (!this.lodMeta?.tree?.bound) return null;
        const b = this.lodMeta.tree.bound;
        return new __WEBPACK_EXTERNAL_MODULE_three__.Box3(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(b.min[0], b.min[1], b.min[2]), new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(b.max[0], b.max[1], b.max[2]));
    }
    getLodMeta() {
        return this.lodMeta;
    }
    async loadChunkOnDemand(fileIndex, offset, count) {
        return this.loadChunk(fileIndex, offset, count);
    }
    async loadLODLevel(lodLevel) {
        if (!this.lodMeta) throw new Error('LOD 元数据未加载，请先调用 load()');
        const chunks = this.collectChunksForLod(lodLevel);
        if (0 === chunks.length) throw new Error(`LOD 级别 ${lodLevel} 没有数据`);
        const chunkDataList = [];
        const batchSize = this.options.maxConcurrentLoads || 8;
        for(let i = 0; i < chunks.length; i += batchSize){
            const batch = chunks.slice(i, i + batchSize);
            const results = await Promise.all(batch.map((chunk)=>this.loadChunk(chunk.fileIndex, chunk.offset, chunk.count)));
            chunkDataList.push(...results);
        }
        if (false !== this.options.keepCompressed) return this.mergeSogsData(chunkDataList);
        return this.mergeSplatData(chunkDataList);
    }
    async preloadMeta(url) {
        if (this.options.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        const decodedUrl = decodeURIComponent(url);
        this.baseUrl = decodedUrl.substring(0, decodedUrl.lastIndexOf('/') + 1);
        return log.perf.span('preloadMeta', async ()=>{
            const response = await fetch(url, this.fetchInit());
            if (!response.ok) throw new Error(`加载失败: ${response.status} ${response.statusText}`);
            this.lodMeta = await response.json();
            return this.lodMeta;
        });
    }
    getLODInfo() {
        if (!this.lodMeta) return null;
        const info = [];
        for(let i = 0; i < this.lodMeta.lodLevels; i++){
            const chunks = this.collectChunksForLod(i);
            info.push({
                level: i,
                chunkCount: chunks.length
            });
        }
        return info;
    }
    getNodeLODInfo(node) {
        const result = [];
        if (node.lods) for (const [levelStr, lodData] of Object.entries(node.lods))result.push({
            level: parseInt(levelStr, 10),
            fileIndex: lodData.file,
            offset: lodData.offset,
            count: lodData.count
        });
        return result;
    }
    clearChunkMetaCache() {
        this.chunkMetas.clear();
    }
    async loadChunkFromMeta(metaUrl) {
        if (this.options.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        const response = await fetch(metaUrl, this.fetchInit());
        if (!response.ok) throw new Error(`加载子块 meta 失败: ${response.status} ${response.statusText}`);
        const rawMeta = await response.json();
        const chunkMeta = this.upgradeMeta(rawMeta);
        const chunkDir = metaUrl.substring(0, metaUrl.lastIndexOf('/') + 1);
        const [meansData, scalesData, quatsData, sh0Data] = await Promise.all([
            this.loadMeansWebPFromDir(chunkDir, chunkMeta),
            this.loadScalesWebPFromDir(chunkDir, chunkMeta),
            this.loadQuatsWebPFromDir(chunkDir, chunkMeta),
            this.loadSH0WebPFromDir(chunkDir, chunkMeta)
        ]);
        const offset = 0;
        const count = chunkMeta.count;
        if (false !== this.options.keepCompressed) return this.extractChunkSogsData(chunkMeta, meansData, scalesData, quatsData, sh0Data, null, offset, count);
        return this.extractChunkData(chunkMeta, meansData, scalesData, quatsData, sh0Data, offset, count);
    }
    upgradeMeta(meta) {
        if ('version' in meta && 'number' == typeof meta.version && 2 === meta.version) return meta;
        const v1Meta = meta;
        const result = {
            version: 1,
            count: v1Meta.means?.shape?.[0] ?? 0,
            means: {
                mins: v1Meta.means?.mins ?? [
                    0,
                    0,
                    0
                ],
                maxs: v1Meta.means?.maxs ?? [
                    0,
                    0,
                    0
                ],
                files: v1Meta.means?.files ?? []
            },
            scales: {
                ...v1Meta.scales?.mins ? {
                    mins: v1Meta.scales.mins
                } : {},
                ...v1Meta.scales?.maxs ? {
                    maxs: v1Meta.scales.maxs
                } : {},
                codebook: [],
                files: v1Meta.scales?.files ?? []
            },
            quats: {
                files: v1Meta.quats?.files ?? []
            },
            sh0: {
                ...v1Meta.sh0?.mins ? {
                    mins: v1Meta.sh0.mins
                } : {},
                ...v1Meta.sh0?.maxs ? {
                    maxs: v1Meta.sh0.maxs
                } : {},
                codebook: [],
                files: v1Meta.sh0?.files ?? []
            }
        };
        if (v1Meta.shN) result.shN = {
            ...void 0 !== v1Meta.shN.mins ? {
                mins: v1Meta.shN.mins
            } : {},
            ...void 0 !== v1Meta.shN.maxs ? {
                maxs: v1Meta.shN.maxs
            } : {},
            codebook: [],
            files: v1Meta.shN.files ?? []
        };
        return result;
    }
    async loadMeansWebPFromDir(chunkDir, meta) {
        const [lowResult, highResult] = await Promise.all([
            this.loadWebPAsImageData(chunkDir + meta.means.files[0]),
            this.loadWebPAsImageData(chunkDir + meta.means.files[1])
        ]);
        return {
            low: lowResult.data,
            high: highResult.data
        };
    }
    async loadScalesWebPFromDir(chunkDir, meta) {
        const result = await this.loadWebPAsImageData(chunkDir + meta.scales.files[0]);
        return result.data;
    }
    async loadQuatsWebPFromDir(chunkDir, meta) {
        const result = await this.loadWebPAsImageData(chunkDir + meta.quats.files[0]);
        return result.data;
    }
    async loadSH0WebPFromDir(chunkDir, meta) {
        const result = await this.loadWebPAsImageData(chunkDir + meta.sh0.files[0]);
        return result.data;
    }
    async loadChunkFromMemory(meta, fileMap) {
        const chunkMeta = this.upgradeMeta(meta);
        const [meansData, scalesData, quatsData, sh0Data, shNData] = await Promise.all([
            this.loadMeansWebPFromMemory(chunkMeta, fileMap),
            this.loadScalesWebPFromMemory(chunkMeta, fileMap),
            this.loadQuatsWebPFromMemory(chunkMeta, fileMap),
            this.loadSH0WebPFromMemory(chunkMeta, fileMap),
            this.loadShNWebPFromMemory(chunkMeta, fileMap)
        ]);
        const offset = 0;
        const count = chunkMeta.count;
        if (false !== this.options.keepCompressed) return this.extractChunkSogsData(chunkMeta, meansData, scalesData, quatsData, sh0Data, shNData, offset, count);
        return this.extractChunkData(chunkMeta, meansData, scalesData, quatsData, sh0Data, offset, count);
    }
    async loadMeansWebPFromMemory(meta, fileMap) {
        const lowData = fileMap.get(meta.means.files[0]);
        const highData = fileMap.get(meta.means.files[1]);
        if (!lowData || !highData) throw new Error(`缺少位置数据文件: ${meta.means.files[0]} 或 ${meta.means.files[1]}`);
        const [lowResult, highResult] = await Promise.all([
            this.decodeWebPFromMemory(lowData),
            this.decodeWebPFromMemory(highData)
        ]);
        return {
            low: lowResult.data,
            high: highResult.data
        };
    }
    async loadScalesWebPFromMemory(meta, fileMap) {
        const data = fileMap.get(meta.scales.files[0]);
        if (!data) throw new Error(`缺少缩放数据文件: ${meta.scales.files[0]}`);
        const result = await this.decodeWebPFromMemory(data);
        return result.data;
    }
    async loadQuatsWebPFromMemory(meta, fileMap) {
        const data = fileMap.get(meta.quats.files[0]);
        if (!data) throw new Error(`缺少四元数数据文件: ${meta.quats.files[0]}`);
        const result = await this.decodeWebPFromMemory(data);
        return result.data;
    }
    async loadSH0WebPFromMemory(meta, fileMap) {
        const data = fileMap.get(meta.sh0.files[0]);
        if (!data) throw new Error(`缺少 SH0 数据文件: ${meta.sh0.files[0]}`);
        const result = await this.decodeWebPFromMemory(data);
        return result.data;
    }
    async loadShNWebPFromMemory(meta, fileMap) {
        if (!meta.shN?.files || meta.shN.files.length < 2) return null;
        const centroidsData = fileMap.get(meta.shN.files[0]);
        const labelsData = fileMap.get(meta.shN.files[1]);
        if (!centroidsData || !labelsData) return null;
        const [centroidsResult, labelsResult] = await Promise.all([
            this.decodeWebPFromMemory(centroidsData),
            this.decodeWebPFromMemory(labelsData)
        ]);
        return {
            shCentroids: centroidsResult.data,
            shLabels: labelsResult.data,
            shCentroidsWidth: centroidsResult.width,
            shCentroidsHeight: centroidsResult.height
        };
    }
    async decodeWebPFromMemory(webpData) {
        return new Promise((resolve, reject)=>{
            const buffer = webpData.buffer.slice(webpData.byteOffset, webpData.byteOffset + webpData.byteLength);
            const blob = new Blob([
                buffer
            ], {
                type: 'image/webp'
            });
            const url = URL.createObjectURL(blob);
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = ()=>{
                URL.revokeObjectURL(url);
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('无法创建 canvas context'));
                    return;
                }
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, img.width, img.height);
                resolve({
                    data: new Uint8Array(imageData.data.buffer),
                    width: img.width,
                    height: img.height
                });
            };
            img.onerror = ()=>{
                URL.revokeObjectURL(url);
                reject(new Error('解码 WebP 失败'));
            };
            img.src = url;
        });
    }
}
export { SOGLoader };
