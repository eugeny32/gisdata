import * as __WEBPACK_EXTERNAL_MODULE__deserializeCadMetadata_js_fc53b2eb__ from "../deserializeCadMetadata.js";
import * as __WEBPACK_EXTERNAL_MODULE__normalizeJsonCadMetadata_js_2039c822__ from "../normalizeJsonCadMetadata.js";
async function fetchJsonData(source, signal) {
    if (void 0 !== source.data) return source.data;
    if (source.url) {
        const resp = await fetch(source.url, {
            signal
        });
        if (!resp.ok) throw new Error(`JSON fetch failed: ${resp.status} ${resp.statusText}`);
        return resp.text();
    }
    throw new Error('JsonCadLoader: data 和 url 均未提供');
}
class JsonCadLoader {
    canLoad(source) {
        if ('json' === source.format) return true;
        if (source.url && /\.json$/i.test(source.url)) return true;
        return false;
    }
    async load(source, context) {
        const signal = source.signal ?? context.signal;
        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        const text = await fetchJsonData(source, signal);
        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch  {
            throw new Error('JsonCadLoader: JSON 解析失败，数据格式无效');
        }
        const metadata = (0, __WEBPACK_EXTERNAL_MODULE__normalizeJsonCadMetadata_js_2039c822__.normalizeJsonCadMetadata)(parsed);
        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        context.onProgress?.(1);
        return (0, __WEBPACK_EXTERNAL_MODULE__deserializeCadMetadata_js_fc53b2eb__.createCadLoadResultFromMetadata)(metadata);
    }
    constructor(){
        this.format = 'json';
        this.detectPriority = 0;
        this.cancellationLevel = 'soft';
    }
}
export { JsonCadLoader };
