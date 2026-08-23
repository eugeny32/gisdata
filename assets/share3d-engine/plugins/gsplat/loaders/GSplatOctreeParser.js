import * as __WEBPACK_EXTERNAL_MODULE__lod_GSplatAssetLoader_js_b0649f9d__ from "../lod/GSplatAssetLoader.js";
import * as __WEBPACK_EXTERNAL_MODULE__lod_GSplatOctreeResource_js_ab4c0066__ from "../lod/GSplatOctreeResource.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__ from "../../../shared/constants/index.js";
class GSplatOctreeParser {
    constructor(options){
        this.maxRetries = options?.maxRetries ?? __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.DEFAULT_MAX_RETRIES;
        this.debug = options?.debug ?? false;
    }
    async load(url, renderer, assetLoaderOptions) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`加载 lod-meta.json 失败: ${response.status} ${response.statusText}`);
        const data = await response.json();
        const assetLoader = new __WEBPACK_EXTERNAL_MODULE__lod_GSplatAssetLoader_js_b0649f9d__.GSplatAssetLoader(renderer, {
            maxConcurrentLoads: assetLoaderOptions?.maxConcurrentLoads ?? __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.DEFAULT_MAX_CONCURRENT_LOADS,
            maxRetries: assetLoaderOptions?.maxRetries ?? this.maxRetries,
            debug: assetLoaderOptions?.debug ?? this.debug
        });
        const resource = new __WEBPACK_EXTERNAL_MODULE__lod_GSplatOctreeResource_js_ab4c0066__.GSplatOctreeResource(url, data, assetLoader);
        return resource;
    }
}
export { GSplatOctreeParser };
