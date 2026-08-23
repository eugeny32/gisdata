import * as __WEBPACK_EXTERNAL_MODULE__SOGLoader_js_377ab56c__ from "./SOGLoader.js";
import * as __WEBPACK_EXTERNAL_MODULE__SplatLoader_js_641d1180__ from "./SplatLoader.js";
var GSplatResourceHandler_rslib_entry_ResourceType = /*#__PURE__*/ function(ResourceType) {
    ResourceType["PLY"] = "ply";
    ResourceType["SPLAT"] = "splat";
    ResourceType["SOG"] = "json";
    ResourceType["SOG_LOD"] = "lod-meta";
    return ResourceType;
}({});
class GSplatResourceHandler {
    constructor(){
        this.parsers = new Map();
        const splatLoader = new __WEBPACK_EXTERNAL_MODULE__SplatLoader_js_641d1180__.SplatLoader();
        this.parsers.set("ply", splatLoader);
        this.parsers.set("splat", splatLoader);
        const sogLoader = new __WEBPACK_EXTERNAL_MODULE__SOGLoader_js_377ab56c__.SOGLoader();
        this.parsers.set("json", sogLoader);
        this.parsers.set("lod-meta", sogLoader);
    }
    getUrlWithoutParams(url) {
        const queryIndex = url.indexOf('?');
        return queryIndex >= 0 ? url.substring(0, queryIndex) : url;
    }
    getBasename(url) {
        const cleanUrl = this.getUrlWithoutParams(url);
        const lastSlash = cleanUrl.lastIndexOf('/');
        return lastSlash >= 0 ? cleanUrl.substring(lastSlash + 1) : cleanUrl;
    }
    getExtension(filename) {
        const lastDot = filename.lastIndexOf('.');
        return lastDot >= 0 ? filename.substring(lastDot + 1).toLowerCase() : '';
    }
    getParserType(url) {
        const basename = this.getBasename(url).toLowerCase();
        if ('lod-meta.json' === basename) return "lod-meta";
        if ('meta.json' === basename) return "json";
        const ext = this.getExtension(basename);
        switch(ext){
            case 'ply':
                return "ply";
            case 'splat':
                return "splat";
            case 'json':
                return "json";
            default:
                return "ply";
        }
    }
    getParser(url) {
        const type = this.getParserType(url);
        const parser = this.parsers.get(type);
        if (!parser) throw new Error(`No parser found for resource type: ${type}`);
        return parser;
    }
    async load(url, options) {
        const parser = this.getParser(url);
        return parser.load(url, options);
    }
    registerParser(type, parser) {
        this.parsers.set(type, parser);
    }
    isLODResource(url) {
        const basename = this.getBasename(url).toLowerCase();
        return 'lod-meta.json' === basename;
    }
    isSOGResource(url) {
        const basename = this.getBasename(url).toLowerCase();
        const ext = this.getExtension(basename);
        return 'meta.json' === basename || 'lod-meta.json' === basename || 'json' === ext;
    }
}
export { GSplatResourceHandler, GSplatResourceHandler_rslib_entry_ResourceType as ResourceType };
