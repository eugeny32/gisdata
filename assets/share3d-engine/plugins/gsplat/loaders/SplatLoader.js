import * as __WEBPACK_EXTERNAL_MODULE__core_CompressedSplatData_js_602d88b9__ from "../core/CompressedSplatData.js";
import * as __WEBPACK_EXTERNAL_MODULE__core_GaussianSplatMesh_js_d31375fc__ from "../core/GaussianSplatMesh.js";
import * as __WEBPACK_EXTERNAL_MODULE__core_SplatData_js_d4d2cdff__ from "../core/SplatData.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_CoordinateSystem_js_438e4bee__ from "../utils/CoordinateSystem.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_SplatError_js_d27410ca__ from "../utils/SplatError.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_SplatValidator_js_c7804092__ from "../utils/SplatValidator.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__StreamBuf_js_54c1f830__ from "./StreamBuf.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('gsplat:loader');
class SplatLoader {
    async load(url, options) {
        const opts = {
            ...options
        };
        if (opts.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        if (opts.streaming) return this.loadStreaming(url, opts);
        opts.onProgress?.(0, '加载文件');
        const buffer = await this.fetchWithProgress(url, opts);
        if (opts.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        opts.onProgress?.(0.3, '解析数据');
        const data = opts.keepCompressed ? this.parseAdvanced(buffer, {
            keepCompressed: true,
            ...opts.propertyFilter ? {
                propertyFilter: opts.propertyFilter
            } : {},
            ...void 0 !== opts.skipSH ? {
                skipSH: opts.skipSH
            } : {}
        }) : this.parse(buffer, opts);
        if (!(data instanceof __WEBPACK_EXTERNAL_MODULE__core_SplatData_js_d4d2cdff__.SplatData)) throw new Error('压缩格式不支持预处理，请使用 parseAdvanced');
        if (opts.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        if (opts.debugMode) {
            opts.onProgress?.(0.6, '验证数据');
            const result = __WEBPACK_EXTERNAL_MODULE__utils_SplatValidator_js_c7804092__.SplatValidator.validateSplatData(data);
            result.warnings.forEach((w)=>log.warn(`[ThreeGS] ${w}`));
            if (!result.valid) throw new __WEBPACK_EXTERNAL_MODULE__utils_SplatError_js_d27410ca__.SplatError(__WEBPACK_EXTERNAL_MODULE__utils_SplatError_js_d27410ca__.SplatErrorCode.INVALID_BINARY_DATA, result.errors.join('\n'));
        }
        opts.onProgress?.(0.7, '预处理');
        this.preprocess(data, opts);
        opts.onProgress?.(1.0, '完成');
        return data;
    }
    async loadStreaming(url, options) {
        const opts = {
            ...options
        };
        opts.onProgress?.(0, '连接服务器');
        const response = await fetch(url, opts.signal ? {
            signal: opts.signal
        } : void 0);
        if (!response.ok) throw new __WEBPACK_EXTERNAL_MODULE__utils_SplatError_js_d27410ca__.SplatError(__WEBPACK_EXTERNAL_MODULE__utils_SplatError_js_d27410ca__.SplatErrorCode.INVALID_BINARY_DATA, `加载失败: ${response.status} ${response.statusText}`);
        if (!response.body) throw new Error('Response body is null');
        const totalLength = parseInt(response.headers.get('content-length') ?? '0', 10);
        let totalReceived = 0;
        const progressFunc = (bytes)=>{
            totalReceived += bytes;
            if (totalLength > 0) opts.onProgress?.(totalReceived / totalLength * 0.8, '流式解析');
        };
        const reader = response.body.getReader();
        const data = await this.readPlyStreaming(reader, opts, progressFunc);
        if (opts.debugMode) {
            opts.onProgress?.(0.85, '验证数据');
            const result = __WEBPACK_EXTERNAL_MODULE__utils_SplatValidator_js_c7804092__.SplatValidator.validateSplatData(data);
            result.warnings.forEach((w)=>log.warn(`[ThreeGS] ${w}`));
            if (!result.valid) throw new __WEBPACK_EXTERNAL_MODULE__utils_SplatError_js_d27410ca__.SplatError(__WEBPACK_EXTERNAL_MODULE__utils_SplatError_js_d27410ca__.SplatErrorCode.INVALID_BINARY_DATA, result.errors.join('\n'));
        }
        opts.onProgress?.(0.9, '预处理');
        this.preprocess(data, opts);
        opts.onProgress?.(1.0, '完成');
        return data;
    }
    async loadMesh(url, options, meshOptions) {
        const splatData = await this.load(url, options);
        return new __WEBPACK_EXTERNAL_MODULE__core_GaussianSplatMesh_js_d31375fc__.GaussianSplatMesh(splatData, meshOptions);
    }
    parse(buffer, options) {
        const format = this.detectFormat(buffer);
        if ('splat' === format) return this.parseSplatFormat(buffer);
        const header = this.parseHeader(buffer);
        if (header.isCompressed) {
            const compressed = this.parseCompressedBody(buffer, header);
            return this.decompressToSplatData(compressed);
        }
        this.parseBody(buffer, header.headerEnd, header.elements, options);
        const splatData = new __WEBPACK_EXTERNAL_MODULE__core_SplatData_js_d4d2cdff__.SplatData();
        splatData.elements = header.elements;
        const vertexElement = header.elements.find((e)=>'vertex' === e.name);
        if (vertexElement) splatData.numSplats = vertexElement.count;
        return splatData;
    }
    parseAdvanced(buffer, options) {
        const format = this.detectFormat(buffer);
        if ('splat' === format) return this.parseSplatFormat(buffer);
        const header = this.parseHeader(buffer);
        if (header.isCompressed) {
            const compressed = this.parseCompressedBody(buffer, header);
            if (options?.keepCompressed === true) return compressed;
            return this.decompressToSplatData(compressed);
        }
        this.parseBody(buffer, header.headerEnd, header.elements, {
            ...options?.propertyFilter ? {
                propertyFilter: options.propertyFilter
            } : {},
            ...options?.skipSH !== void 0 ? {
                skipSH: options.skipSH
            } : {}
        });
        const splatData = new __WEBPACK_EXTERNAL_MODULE__core_SplatData_js_d4d2cdff__.SplatData();
        splatData.elements = header.elements;
        const vertexElement = header.elements.find((e)=>'vertex' === e.name);
        if (vertexElement) splatData.numSplats = vertexElement.count;
        return splatData;
    }
    detectFormat(buffer) {
        const decoder = new TextDecoder('utf-8');
        const headerBytes = new Uint8Array(buffer, 0, Math.min(buffer.byteLength, 10));
        const headerText = decoder.decode(headerBytes);
        if (headerText.toLowerCase().startsWith('ply')) return 'ply';
        if (buffer.byteLength % 32 === 0 && buffer.byteLength >= 32) return 'splat';
        return 'ply';
    }
    parseHeader(buffer) {
        const headerBytes = new Uint8Array(buffer, 0, Math.min(buffer.byteLength, 65536));
        const decoder = new TextDecoder('utf-8');
        const headerText = decoder.decode(headerBytes);
        const endHeaderPos = headerText.indexOf('end_header');
        if (-1 === endHeaderPos) throw new Error('Invalid PLY file: missing end_header');
        const endHeaderLine = headerText.indexOf('\n', endHeaderPos);
        if (-1 === endHeaderLine) throw new Error('Invalid PLY file: malformed end_header');
        const headerEnd = endHeaderLine + 1;
        const lines = headerText.substring(0, headerEnd).split('\n');
        const elements = [];
        let currentElement = null;
        let hasChunkElement = false;
        let hasPackedPosition = false;
        for (const line of lines){
            const trimmed = line.trim();
            if (!!trimmed && 'ply' !== trimmed && 'end_header' !== trimmed) {
                if (trimmed.startsWith('format')) {
                    const parts = trimmed.split(/\s+/);
                    if ('binary_little_endian' !== parts[1]) throw new Error(`Unsupported PLY format: ${parts[1]}`);
                    continue;
                }
                if (trimmed.startsWith('element')) {
                    const parts = trimmed.split(/\s+/);
                    if (parts.length < 3) throw new Error(`Invalid element line: ${trimmed}`);
                    currentElement = {
                        name: parts[1],
                        count: parseInt(parts[2], 10),
                        properties: []
                    };
                    elements.push(currentElement);
                    if ('chunk' === parts[1]) hasChunkElement = true;
                    continue;
                }
                if (trimmed.startsWith('property')) {
                    if (!currentElement) throw new Error('Property defined before element');
                    const parts = trimmed.split(/\s+/);
                    if (parts.length < 3) throw new Error(`Invalid property line: ${trimmed}`);
                    const propType = parts[1];
                    const propName = parts[2];
                    currentElement.properties.push({
                        name: propName,
                        type: propType,
                        storage: null
                    });
                    if ('packed_position' === propName) hasPackedPosition = true;
                }
            }
        }
        const isCompressed = hasChunkElement && hasPackedPosition;
        return {
            elements,
            headerEnd,
            isCompressed
        };
    }
    parseBody(buffer, headerEnd, elements, options) {
        if (this.tryFastPathFloat32(buffer, headerEnd, elements, options)) return;
        const dataView = new DataView(buffer, headerEnd);
        let offset = 0;
        for (const element of elements){
            for (const prop of element.properties)this.getTypeSize(prop.type);
            const shouldIncludeProp = (propName)=>{
                if (options?.skipSH && propName.startsWith('f_rest_')) return false;
                if (options?.propertyFilter) return options.propertyFilter.includes(propName);
                return true;
            };
            for (const prop of element.properties){
                if (!shouldIncludeProp(prop.name)) {
                    prop.storage = null;
                    continue;
                }
                if ('float' === prop.type) prop.storage = new Float32Array(element.count);
                else if ('uchar' === prop.type) prop.storage = new Uint8Array(element.count);
                else if ('int' === prop.type) prop.storage = new Int32Array(element.count);
                else throw new Error(`Unsupported property type: ${prop.type}`);
            }
            for(let i = 0; i < element.count; i++)for (const prop of element.properties){
                const propSize = this.getTypeSize(prop.type);
                if (!prop.storage) {
                    offset += propSize;
                    continue;
                }
                const value = this.readValue(dataView, offset, prop.type);
                if (prop.storage instanceof Float32Array) prop.storage[i] = value;
                else if (prop.storage instanceof Uint8Array) prop.storage[i] = value;
                else if (prop.storage instanceof Int32Array) prop.storage[i] = value;
                offset += propSize;
            }
        }
    }
    tryFastPathFloat32(buffer, headerEnd, elements, options) {
        if (1 !== elements.length || 'vertex' !== elements[0].name) return false;
        const element = elements[0];
        const allFloat = element.properties.every((p)=>'float' === p.type);
        if (!allFloat) return false;
        if (options?.propertyFilter || options?.skipSH) return false;
        const propsPerVertex = element.properties.length;
        const vertexByteSize = 4 * propsPerVertex;
        const totalVertices = element.count;
        const expectedSize = totalVertices * vertexByteSize;
        const actualSize = buffer.byteLength - headerEnd;
        if (expectedSize !== actualSize) return false;
        if (headerEnd % 4 !== 0) return false;
        const allData = new Float32Array(buffer, headerEnd, totalVertices * propsPerVertex);
        for(let propIdx = 0; propIdx < element.properties.length; propIdx++){
            const prop = element.properties[propIdx];
            prop.storage = new Float32Array(totalVertices);
            for(let vertexIdx = 0; vertexIdx < totalVertices; vertexIdx++)prop.storage[vertexIdx] = allData[vertexIdx * propsPerVertex + propIdx];
        }
        return true;
    }
    getTypeSize(type) {
        switch(type){
            case 'float':
                return 4;
            case 'uchar':
                return 1;
            case 'int':
                return 4;
            case 'double':
                return 8;
            case 'short':
                return 2;
            case 'ushort':
                return 2;
            default:
                throw new Error(`Unknown type: ${type}`);
        }
    }
    readValue(dataView, offset, type) {
        switch(type){
            case 'float':
                return dataView.getFloat32(offset, true);
            case 'uchar':
                return dataView.getUint8(offset);
            case 'int':
                return dataView.getInt32(offset, true);
            case 'double':
                return dataView.getFloat64(offset, true);
            case 'short':
                return dataView.getInt16(offset, true);
            case 'ushort':
                return dataView.getUint16(offset, true);
            default:
                throw new Error(`Unknown type: ${type}`);
        }
    }
    async fetchWithProgress(url, options) {
        const response = await fetch(url, options?.signal ? {
            signal: options.signal
        } : void 0);
        if (!response.ok) throw new __WEBPACK_EXTERNAL_MODULE__utils_SplatError_js_d27410ca__.SplatError(__WEBPACK_EXTERNAL_MODULE__utils_SplatError_js_d27410ca__.SplatErrorCode.INVALID_BINARY_DATA, `加载失败: ${response.status} ${response.statusText}`);
        const contentLength = response.headers.get('Content-Length');
        if (!contentLength || !response.body) return response.arrayBuffer();
        const total = parseInt(contentLength, 10);
        let loaded = 0;
        const chunks = [];
        const reader = response.body.getReader();
        try {
            while(true){
                if (options?.signal?.aborted) {
                    reader.cancel();
                    throw new DOMException('Aborted', 'AbortError');
                }
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(value);
                loaded += value.length;
                options?.onProgress?.(loaded / total * 0.3, '加载文件');
            }
        } catch (error) {
            reader.cancel();
            throw error;
        }
        const buffer = new Uint8Array(loaded);
        let offset = 0;
        for (const chunk of chunks){
            buffer.set(chunk, offset);
            offset += chunk.length;
        }
        return buffer.buffer;
    }
    preprocess(data, options) {
        if (options?.coordinateSystem || options?.targetCoordinateSystem) {
            const from = options.coordinateSystem ?? __WEBPACK_EXTERNAL_MODULE__utils_CoordinateSystem_js_438e4bee__.CoordinateSystem.detect(data);
            const to = options.targetCoordinateSystem ?? __WEBPACK_EXTERNAL_MODULE__utils_CoordinateSystem_js_438e4bee__.CoordinateSystemType.Y_UP;
            if (from !== to) __WEBPACK_EXTERNAL_MODULE__utils_CoordinateSystem_js_438e4bee__.CoordinateSystem.convert(data, from, to);
        }
        if (options?.normalizeQuaternions !== false) this.normalizeQuaternions(data);
        if (options?.fixNegativeScales !== false) this.fixNegativeScales(data);
        if (options?.alphaRemovalThreshold !== void 0 && options.alphaRemovalThreshold > 0) this.markLowAlpha(data, options.alphaRemovalThreshold);
    }
    normalizeQuaternions(data) {
        const rot0 = data.getProp('rot_0');
        const rot1 = data.getProp('rot_1');
        const rot2 = data.getProp('rot_2');
        const rot3 = data.getProp('rot_3');
        if (!rot0 || !rot1 || !rot2 || !rot3) return;
        for(let i = 0; i < data.numSplats; i++){
            const len = Math.sqrt(rot0[i] ** 2 + rot1[i] ** 2 + rot2[i] ** 2 + rot3[i] ** 2);
            if (len > 0 && Math.abs(len - 1.0) > 0.001) {
                rot0[i] /= len;
                rot1[i] /= len;
                rot2[i] /= len;
                rot3[i] /= len;
            }
        }
    }
    fixNegativeScales(data) {
        const scale0 = data.getProp('scale_0');
        const scale1 = data.getProp('scale_1');
        const scale2 = data.getProp('scale_2');
        if (!scale0 || !scale1 || !scale2) return;
    }
    markLowAlpha(data, threshold) {
        const opacity = data.getProp('opacity');
        if (!opacity) return;
        const logitThreshold = Math.log(threshold / (1 - threshold));
        for(let i = 0; i < data.numSplats; i++)if (opacity[i] < logitThreshold) opacity[i] = -100;
    }
    parseCompressedBody(buffer, header) {
        const chunkElement = header.elements.find((e)=>'chunk' === e.name);
        const vertexElement = header.elements.find((e)=>'vertex' === e.name);
        if (!chunkElement || !vertexElement) throw new Error('Invalid compressed PLY: missing chunk or vertex element');
        const numChunks = chunkElement.count;
        const numSplats = vertexElement.count;
        const chunkProps = chunkElement.properties.length;
        const chunkSize = chunkProps;
        const hasColorRange = chunkSize > 12;
        const shElement = header.elements.find((e)=>e.properties.some((p)=>p.name.startsWith('f_rest_')));
        const shBands = this.detectSHBandsFromElement(shElement);
        const dataView = new DataView(buffer, header.headerEnd);
        let offset = 0;
        const chunkData = new Float32Array(numChunks * chunkSize);
        for(let c = 0; c < numChunks; c++)for(let p = 0; p < chunkSize; p++){
            chunkData[c * chunkSize + p] = dataView.getFloat32(offset, true);
            offset += 4;
        }
        const vertexData = new Uint32Array(4 * numSplats);
        for(let i = 0; i < 4 * numSplats; i++){
            vertexData[i] = dataView.getUint32(offset, true);
            offset += 4;
        }
        let shData0 = null;
        let shData1 = null;
        let shData2 = null;
        if (shBands > 0) {
            const shDataSize = 16 * numSplats;
            shData0 = new Uint8Array(shDataSize);
            shData1 = new Uint8Array(shDataSize);
            shData2 = new Uint8Array(shDataSize);
            for(let i = 0; i < shDataSize; i++)shData0[i] = dataView.getUint8(offset++);
            for(let i = 0; i < shDataSize; i++)shData1[i] = dataView.getUint8(offset++);
            for(let i = 0; i < shDataSize; i++)shData2[i] = dataView.getUint8(offset++);
        }
        const compressed = new __WEBPACK_EXTERNAL_MODULE__core_CompressedSplatData_js_602d88b9__.CompressedSplatData({
            numSplats,
            numChunks,
            chunkSize,
            chunkData,
            vertexData,
            hasColorRange,
            shBands,
            shData0,
            shData1,
            shData2
        });
        return compressed;
    }
    detectSHBandsFromElement(element) {
        if (!element) return 0;
        let maxRestIndex = -1;
        for (const prop of element.properties)if (prop.name.startsWith('f_rest_')) {
            const idx = parseInt(prop.name.substring(7), 10);
            if (!Number.isNaN(idx) && idx > maxRestIndex) maxRestIndex = idx;
        }
        if (maxRestIndex < 0) return 0;
        if (maxRestIndex < 9) return 1;
        if (maxRestIndex < 24) return 2;
        return 3;
    }
    decompressToSplatData(compressed) {
        const numSplats = compressed.numSplats;
        const shBands = compressed.shBands;
        const x = new Float32Array(numSplats);
        const y = new Float32Array(numSplats);
        const z = new Float32Array(numSplats);
        const rot_0 = new Float32Array(numSplats);
        const rot_1 = new Float32Array(numSplats);
        const rot_2 = new Float32Array(numSplats);
        const rot_3 = new Float32Array(numSplats);
        const scale_0 = new Float32Array(numSplats);
        const scale_1 = new Float32Array(numSplats);
        const scale_2 = new Float32Array(numSplats);
        const f_dc_0 = new Float32Array(numSplats);
        const f_dc_1 = new Float32Array(numSplats);
        const f_dc_2 = new Float32Array(numSplats);
        const opacity = new Float32Array(numSplats);
        const shCoeffsPerChannel = shBands > 0 ? [
            3,
            8,
            15
        ][shBands - 1] : 0;
        const fRest = [];
        for(let i = 0; i < 3 * shCoeffsPerChannel; i++)fRest.push(new Float32Array(numSplats));
        const iter = compressed.createIterator();
        for(let i = 0; i < numSplats; i++){
            const splat = iter.read(i);
            x[i] = splat.position[0];
            y[i] = splat.position[1];
            z[i] = splat.position[2];
            rot_0[i] = splat.rotation[0];
            rot_1[i] = splat.rotation[1];
            rot_2[i] = splat.rotation[2];
            rot_3[i] = splat.rotation[3];
            scale_0[i] = splat.scale[0];
            scale_1[i] = splat.scale[1];
            scale_2[i] = splat.scale[2];
            f_dc_0[i] = splat.color[0];
            f_dc_1[i] = splat.color[1];
            f_dc_2[i] = splat.color[2];
            opacity[i] = splat.opacity;
            if (splat.sh) for(let k = 0; k < fRest.length; k++)fRest[k][i] = splat.sh[k];
        }
        const splatData = new __WEBPACK_EXTERNAL_MODULE__core_SplatData_js_d4d2cdff__.SplatData();
        splatData.numSplats = numSplats;
        const properties = [
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
        ];
        for(let i = 0; i < fRest.length; i++)properties.push({
            name: `f_rest_${i}`,
            type: 'float',
            storage: fRest[i]
        });
        splatData.elements = [
            {
                name: 'vertex',
                count: numSplats,
                properties
            }
        ];
        return splatData;
    }
    async readPlyStreaming(reader, options, progressFunc) {
        const magicBytes = new Uint8Array([
            112,
            108,
            121,
            10
        ]);
        const endHeaderBytes = new Uint8Array([
            10,
            101,
            110,
            100,
            95,
            104,
            101,
            97,
            100,
            101,
            114,
            10
        ]);
        const streamBuf = new __WEBPACK_EXTERNAL_MODULE__StreamBuf_js_54c1f830__.StreamBuf(reader, progressFunc);
        let headerLength;
        while(true){
            await streamBuf.read();
            const buffer = streamBuf.buffer;
            if (buffer && streamBuf.remaining >= magicBytes.length) {
                if (!this.startsWith(buffer, magicBytes)) throw new Error('Invalid PLY header');
            }
            if (buffer) {
                const idx = this.findInBuffer(buffer, endHeaderBytes);
                if (-1 !== idx) {
                    headerLength = idx;
                    break;
                }
            }
        }
        const buffer = streamBuf.buffer;
        const headerText = new TextDecoder('ascii').decode(buffer.subarray(0, headerLength));
        const lines = headerText.split('\n');
        const header = this.parseHeaderLines(lines);
        const headerEnd = headerLength + endHeaderBytes.length;
        this.allocateStorage(header.elements, options);
        if (this.isFloatPly(header.elements)) await this.readFloatPlyStreaming(streamBuf, headerEnd, header.elements);
        else await this.readGeneralPlyStreaming(streamBuf, headerEnd, header.elements);
        const splatData = new __WEBPACK_EXTERNAL_MODULE__core_SplatData_js_d4d2cdff__.SplatData();
        splatData.elements = header.elements;
        const vertexElement = header.elements.find((e)=>'vertex' === e.name);
        if (vertexElement) splatData.numSplats = vertexElement.count;
        return splatData;
    }
    async readFloatPlyStreaming(streamBuf, headerEnd, elements) {
        let offset = headerEnd;
        const element = elements[0];
        const properties = element.properties;
        const numProperties = properties.length;
        const storage = properties.map((p)=>p.storage);
        const inputSize = 4 * numProperties;
        let vertexIdx = 0;
        let floatData = null;
        const checkFloatData = ()=>{
            const buf = streamBuf.buffer;
            if (!floatData || floatData.buffer !== buf.buffer) floatData = new Float32Array(buf.buffer, 0, buf.buffer.byteLength / 4);
        };
        checkFloatData();
        while(vertexIdx < element.count){
            while(streamBuf.remaining - (offset - headerEnd) < inputSize){
                await streamBuf.read();
                checkFloatData();
            }
            const available = Math.floor((streamBuf.remaining - (offset - headerEnd)) / inputSize);
            const toRead = Math.min(element.count - vertexIdx, available);
            const floatOffset = offset / 4;
            for(let j = 0; j < numProperties; ++j){
                const s = storage[j];
                for(let n = 0; n < toRead; ++n)s[n + vertexIdx] = floatData[floatOffset + n * numProperties + j];
            }
            vertexIdx += toRead;
            offset += toRead * inputSize;
        }
    }
    async readGeneralPlyStreaming(streamBuf, headerEnd, elements) {
        let bytesToSkip = headerEnd;
        while(bytesToSkip > 0){
            const available = Math.min(bytesToSkip, streamBuf.remaining);
            if (0 === available) {
                await streamBuf.read();
                continue;
            }
            for(let i = 0; i < available; i++)streamBuf.getUint8();
            bytesToSkip -= available;
        }
        streamBuf.compact();
        for (const element of elements){
            const inputSize = element.properties.reduce((a, p)=>a + this.getTypeSize(p.type), 0);
            const propertyParsingFunctions = element.properties.map((p)=>{
                if (!p.storage) return (sb, _c)=>{
                    const size = this.getTypeSize(p.type);
                    for(let i = 0; i < size; i++)sb.getUint8();
                };
                switch(p.type){
                    case 'char':
                        return (sb, c)=>{
                            p.storage[c] = sb.getInt8();
                        };
                    case 'uchar':
                        return (sb, c)=>{
                            p.storage[c] = sb.getUint8();
                        };
                    case 'short':
                        return (sb, c)=>{
                            p.storage[c] = sb.getInt16();
                        };
                    case 'ushort':
                        return (sb, c)=>{
                            p.storage[c] = sb.getUint16();
                        };
                    case 'int':
                        return (sb, c)=>{
                            p.storage[c] = sb.getInt32();
                        };
                    case 'uint':
                        return (sb, c)=>{
                            p.storage[c] = sb.getUint32();
                        };
                    case 'float':
                        return (sb, c)=>{
                            p.storage[c] = sb.getFloat32();
                        };
                    case 'double':
                        return (sb, c)=>{
                            p.storage[c] = sb.getFloat64();
                        };
                    default:
                        throw new Error(`Unsupported property data type '${p.type}' in ply header`);
                }
            });
            let c = 0;
            while(c < element.count){
                while(streamBuf.remaining < inputSize)await streamBuf.read();
                const toRead = Math.min(element.count - c, Math.floor(streamBuf.remaining / inputSize));
                for(let n = 0; n < toRead; ++n){
                    for(let j = 0; j < element.properties.length; ++j)propertyParsingFunctions[j](streamBuf, c);
                    c++;
                }
            }
        }
    }
    isFloatPly(elements) {
        return 1 === elements.length && 'vertex' === elements[0].name && elements[0].properties.every((p)=>'float' === p.type);
    }
    allocateStorage(elements, options) {
        const dataTypeMap = new Map([
            [
                'char',
                Int8Array
            ],
            [
                'uchar',
                Uint8Array
            ],
            [
                'short',
                Int16Array
            ],
            [
                'ushort',
                Uint16Array
            ],
            [
                'int',
                Int32Array
            ],
            [
                'uint',
                Uint32Array
            ],
            [
                'float',
                Float32Array
            ],
            [
                'double',
                Float64Array
            ]
        ]);
        const shouldIncludeProp = (propName)=>{
            if (options?.skipSH && propName.startsWith('f_rest_')) return false;
            if (options?.propertyFilter) return options.propertyFilter.includes(propName);
            return true;
        };
        elements.forEach((e)=>{
            e.properties.forEach((p)=>{
                const storageType = dataTypeMap.get(p.type);
                if (storageType) {
                    const storage = shouldIncludeProp(p.name) ? new storageType(e.count) : null;
                    p.storage = storage;
                }
            });
        });
    }
    parseHeaderLines(lines) {
        const elements = [];
        let format = 'binary_little_endian';
        let currentElement = null;
        for(let i = 1; i < lines.length; ++i){
            const words = lines[i].split(' ');
            switch(words[0]){
                case 'comment':
                    break;
                case 'format':
                    format = words[1];
                    break;
                case 'element':
                    currentElement = {
                        name: words[1],
                        count: parseInt(words[2], 10),
                        properties: []
                    };
                    elements.push(currentElement);
                    break;
                case 'property':
                    if (!currentElement) throw new Error('Property defined before element');
                    currentElement.properties.push({
                        type: words[1],
                        name: words[2],
                        storage: null
                    });
                    break;
                default:
                    break;
            }
        }
        if ('binary_little_endian' !== format) throw new Error('Unsupported ply format');
        return {
            elements,
            format
        };
    }
    findInBuffer(buf, search) {
        const endIndex = buf.length - search.length;
        for(let i = 0; i <= endIndex; ++i){
            let j = 0;
            for(; j < search.length && buf[i + j] === search[j]; ++j);
            if (j === search.length) return i;
        }
        return -1;
    }
    startsWith(a, b) {
        if (a.length < b.length) return false;
        for(let i = 0; i < b.length; ++i)if (a[i] !== b[i]) return false;
        return true;
    }
    parseSplatFormat(buffer) {
        const SH_C0 = 0.28209479177387814;
        const totalSplats = Math.floor(buffer.byteLength / 32);
        const dataView = new DataView(buffer);
        const storage_x = new Float32Array(totalSplats);
        const storage_y = new Float32Array(totalSplats);
        const storage_z = new Float32Array(totalSplats);
        const storage_scale_0 = new Float32Array(totalSplats);
        const storage_scale_1 = new Float32Array(totalSplats);
        const storage_scale_2 = new Float32Array(totalSplats);
        const storage_f_dc_0 = new Float32Array(totalSplats);
        const storage_f_dc_1 = new Float32Array(totalSplats);
        const storage_f_dc_2 = new Float32Array(totalSplats);
        const storage_opacity = new Float32Array(totalSplats);
        const storage_rot_0 = new Float32Array(totalSplats);
        const storage_rot_1 = new Float32Array(totalSplats);
        const storage_rot_2 = new Float32Array(totalSplats);
        const storage_rot_3 = new Float32Array(totalSplats);
        for(let i = 0; i < totalSplats; i++){
            const offset = 32 * i;
            storage_x[i] = dataView.getFloat32(offset + 0, true);
            storage_y[i] = dataView.getFloat32(offset + 4, true);
            storage_z[i] = dataView.getFloat32(offset + 8, true);
            storage_scale_0[i] = Math.log(dataView.getFloat32(offset + 12, true));
            storage_scale_1[i] = Math.log(dataView.getFloat32(offset + 16, true));
            storage_scale_2[i] = Math.log(dataView.getFloat32(offset + 20, true));
            storage_f_dc_0[i] = (dataView.getUint8(offset + 24) / 255 - 0.5) / SH_C0;
            storage_f_dc_1[i] = (dataView.getUint8(offset + 25) / 255 - 0.5) / SH_C0;
            storage_f_dc_2[i] = (dataView.getUint8(offset + 26) / 255 - 0.5) / SH_C0;
            const alphaUint8 = dataView.getUint8(offset + 27);
            const alpha = alphaUint8 / 255;
            storage_opacity[i] = alpha <= 0 ? -40 : alpha >= 1 ? 40 : -Math.log(1 / alpha - 1);
            storage_rot_0[i] = (dataView.getUint8(offset + 28) - 128) / 128;
            storage_rot_1[i] = (dataView.getUint8(offset + 29) - 128) / 128;
            storage_rot_2[i] = (dataView.getUint8(offset + 30) - 128) / 128;
            storage_rot_3[i] = (dataView.getUint8(offset + 31) - 128) / 128;
        }
        const splatData = new __WEBPACK_EXTERNAL_MODULE__core_SplatData_js_d4d2cdff__.SplatData();
        splatData.numSplats = totalSplats;
        splatData.elements = [
            {
                name: 'vertex',
                count: totalSplats,
                properties: [
                    {
                        name: 'x',
                        type: 'float',
                        storage: storage_x
                    },
                    {
                        name: 'y',
                        type: 'float',
                        storage: storage_y
                    },
                    {
                        name: 'z',
                        type: 'float',
                        storage: storage_z
                    },
                    {
                        name: 'f_dc_0',
                        type: 'float',
                        storage: storage_f_dc_0
                    },
                    {
                        name: 'f_dc_1',
                        type: 'float',
                        storage: storage_f_dc_1
                    },
                    {
                        name: 'f_dc_2',
                        type: 'float',
                        storage: storage_f_dc_2
                    },
                    {
                        name: 'opacity',
                        type: 'float',
                        storage: storage_opacity
                    },
                    {
                        name: 'scale_0',
                        type: 'float',
                        storage: storage_scale_0
                    },
                    {
                        name: 'scale_1',
                        type: 'float',
                        storage: storage_scale_1
                    },
                    {
                        name: 'scale_2',
                        type: 'float',
                        storage: storage_scale_2
                    },
                    {
                        name: 'rot_0',
                        type: 'float',
                        storage: storage_rot_0
                    },
                    {
                        name: 'rot_1',
                        type: 'float',
                        storage: storage_rot_1
                    },
                    {
                        name: 'rot_2',
                        type: 'float',
                        storage: storage_rot_2
                    },
                    {
                        name: 'rot_3',
                        type: 'float',
                        storage: storage_rot_3
                    }
                ]
            }
        ];
        return splatData;
    }
}
export { SplatLoader };
