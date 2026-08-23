import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('gsplat:shader');
class ShaderChunkManager {
    static #_ = this.instance = null;
    constructor(){
        this.chunks = new Map();
    }
    static getInstance() {
        if (!ShaderChunkManager.instance) ShaderChunkManager.instance = new ShaderChunkManager();
        return ShaderChunkManager.instance;
    }
    register(name, code) {
        this.chunks.set(name, code);
    }
    registerAll(chunks) {
        for (const [name, code] of Object.entries(chunks))this.register(name, code);
    }
    get(name) {
        return this.chunks.get(name);
    }
    processIncludes(source, visited = new Set(), chunkOverrides) {
        const pattern = /#include\s+"([^"]+)"/g;
        return source.replace(pattern, (_match, chunkName)=>{
            if (visited.has(chunkName)) {
                log.warn(`[ShaderChunkManager] Circular include detected: ${chunkName}`);
                return `// [WARNING] Circular include skipped: ${chunkName}`;
            }
            const hasOverride = chunkOverrides && Object.hasOwn(chunkOverrides, chunkName);
            const chunk = hasOverride ? chunkOverrides[chunkName] : this.chunks.get(chunkName);
            if (void 0 === chunk) {
                log.warn(`[ShaderChunkManager] Chunk not found: ${chunkName}`);
                return `// [ERROR] Chunk not found: ${chunkName}`;
            }
            visited.add(chunkName);
            const result = this.processIncludes(chunk, visited, chunkOverrides);
            visited.delete(chunkName);
            return result;
        });
    }
    generateDefines(defines) {
        let header = '';
        for (const [key, value] of Object.entries(defines))if ('' === value || true === value) header += `#define ${key}\n`;
        else false === value || (header += `#define ${key} ${value}\n`);
        return header;
    }
    assemble(entryChunk, defines, chunkOverrides) {
        const entry = this.chunks.get(entryChunk);
        if (!entry) throw new Error(`[ShaderChunkManager] Entry chunk not found: ${entryChunk}`);
        return this.assembleSource(entry, defines, chunkOverrides);
    }
    assembleSource(source, defines, chunkOverrides) {
        let header = '';
        if (defines) header = this.generateDefines(defines);
        const processed = this.processIncludes(source, new Set(), chunkOverrides);
        return header + processed;
    }
}
function getShaderChunkManager() {
    return ShaderChunkManager.getInstance();
}
export { ShaderChunkManager, getShaderChunkManager };
