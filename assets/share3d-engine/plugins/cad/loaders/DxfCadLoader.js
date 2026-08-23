import * as __WEBPACK_EXTERNAL_MODULE__deserializeCadMetadata_js_fc53b2eb__ from "../deserializeCadMetadata.js";
import * as __WEBPACK_EXTERNAL_MODULE__module_parser_DxfParser_js_3b066f41__ from "../module/parser/DxfParser.js";
import * as __WEBPACK_EXTERNAL_MODULE__normalizeJsonCadMetadata_js_2039c822__ from "../normalizeJsonCadMetadata.js";
async function fetchDxfData(source, signal) {
    if (void 0 !== source.data) return source.data;
    if (source.url) {
        const resp = await fetch(source.url, {
            signal
        });
        if (!resp.ok) throw new Error(`DXF fetch failed: ${resp.status} ${resp.statusText}`);
        return resp.text();
    }
    throw new Error('DxfCadLoader: data 和 url 均未提供');
}
class DxfCadLoader {
    canLoad(source) {
        if ('dxf' === source.format) return true;
        if (source.url && /\.dxf$/i.test(source.url)) return true;
        return false;
    }
    async load(source, context) {
        const signal = source.signal ?? context.signal;
        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        const text = await fetchDxfData(source, signal);
        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        const parsed = __WEBPACK_EXTERNAL_MODULE__module_parser_DxfParser_js_3b066f41__.DxfParser.parse(text);
        if (!parsed) throw new Error('DxfCadLoader: DXF 解析失败，数据无效');
        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        context.onProgress?.(1);
        return (0, __WEBPACK_EXTERNAL_MODULE__deserializeCadMetadata_js_fc53b2eb__.createCadLoadResultFromMetadata)({
            layers: parsed.layers,
            entities: parsed.entities,
            plane: (0, __WEBPACK_EXTERNAL_MODULE__normalizeJsonCadMetadata_js_2039c822__.createDefaultCadPlaneMetadata)()
        });
    }
    constructor(){
        this.format = 'dxf';
        this.detectPriority = 0;
        this.cancellationLevel = 'soft';
    }
}
export { DxfCadLoader };
