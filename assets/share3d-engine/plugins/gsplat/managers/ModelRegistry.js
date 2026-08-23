import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('gsplat');
class ModelRegistry {
    registerLOD(entry) {
        this.lodGroups.set(entry.clientId, entry);
        this.urlToClientId.set(entry.url, entry.clientId);
        this.nodeIdToClientId.set(entry.nodeId, entry.clientId);
    }
    registerSingle(entry) {
        this.singleFiles.set(entry.clientId, entry);
        this.urlToClientId.set(entry.url, entry.clientId);
        this.nodeIdToClientId.set(entry.nodeId, entry.clientId);
    }
    unregisterLOD(clientId) {
        const entry = this.lodGroups.get(clientId);
        if (!entry) return;
        this.lodGroups.delete(clientId);
        this.urlToClientId.delete(entry.url);
        this.nodeIdToClientId.delete(entry.nodeId);
        return entry;
    }
    unregisterSingle(clientId) {
        const entry = this.singleFiles.get(clientId);
        if (!entry) return;
        this.singleFiles.delete(clientId);
        this.urlToClientId.delete(entry.url);
        this.nodeIdToClientId.delete(entry.nodeId);
        return entry;
    }
    resolveClientId(nodeId) {
        return this.nodeIdToClientId.get(nodeId);
    }
    getLODByNodeId(nodeId) {
        const clientId = this.nodeIdToClientId.get(nodeId);
        if (!clientId) return;
        return this.lodGroups.get(clientId);
    }
    getSingleByNodeId(nodeId) {
        const clientId = this.nodeIdToClientId.get(nodeId);
        if (!clientId) return;
        return this.singleFiles.get(clientId);
    }
    getByNodeId(nodeId) {
        const clientId = this.nodeIdToClientId.get(nodeId);
        if (!clientId) return;
        const lodEntry = this.lodGroups.get(clientId);
        if (lodEntry) return lodEntry;
        const singleEntry = this.singleFiles.get(clientId);
        if (singleEntry) return singleEntry.mesh;
    }
    getByUrl(url) {
        const clientId = this.urlToClientId.get(url);
        if (!clientId) return;
        const lodEntry = this.lodGroups.get(clientId);
        if (lodEntry) return lodEntry;
        const singleEntry = this.singleFiles.get(clientId);
        if (singleEntry) return singleEntry.mesh;
    }
    getAll() {
        const result = [];
        for (const entry of this.lodGroups.values())result.push(entry);
        for (const entry of this.singleFiles.values())result.push(entry.mesh);
        return result;
    }
    hasByNodeId(nodeId) {
        return this.nodeIdToClientId.has(nodeId);
    }
    hasByUrl(url) {
        return this.urlToClientId.has(url);
    }
    isLoading(url) {
        return this.loadingPromises.has(url);
    }
    getAllNodeIds() {
        return Array.from(this.nodeIdToClientId.keys());
    }
    setNodeId(group, nodeId) {
        let currentNodeId;
        if ('object' == typeof group && null !== group) {
            if ('id' in group && 'string' == typeof group.id) currentNodeId = group.id;
            else if ('nodeId' in group && 'string' == typeof group.nodeId) currentNodeId = group.nodeId;
            else for (const [, entry] of this.singleFiles.entries())if (entry.mesh === group) {
                currentNodeId = entry.nodeId;
                break;
            }
        }
        if (!currentNodeId) {
            log.warn('[ModelRegistry] setNodeId: 无法从 group 对象中提取当前 nodeId');
            return false;
        }
        const clientId = this.nodeIdToClientId.get(currentNodeId);
        if (!clientId) {
            log.warn(`[ModelRegistry] setNodeId: nodeId "${currentNodeId}" not found`);
            return false;
        }
        if (this.nodeIdToClientId.has(nodeId) && this.nodeIdToClientId.get(nodeId) !== clientId) {
            log.warn(`[ModelRegistry] setNodeId: newNodeId "${nodeId}" already exists`);
            return false;
        }
        const lodEntry = this.lodGroups.get(clientId);
        if (lodEntry) lodEntry.nodeId = nodeId;
        const singleEntry = this.singleFiles.get(clientId);
        if (singleEntry) singleEntry.nodeId = nodeId;
        this.nodeIdToClientId.delete(currentNodeId);
        this.nodeIdToClientId.set(nodeId, clientId);
        return true;
    }
    extractNodeId(group) {
        if (!group || 'object' != typeof group) return;
        if ('nodeId' in group && 'string' == typeof group.nodeId) return group.nodeId;
        for (const [, entry] of this.singleFiles.entries())if (entry.mesh === group) return entry.nodeId;
    }
    clear() {
        this.lodGroups.clear();
        this.singleFiles.clear();
        this.urlToClientId.clear();
        this.nodeIdToClientId.clear();
        this.loadingPromises.clear();
    }
    constructor(){
        this.lodGroups = new Map();
        this.singleFiles = new Map();
        this.urlToClientId = new Map();
        this.nodeIdToClientId = new Map();
        this.loadingPromises = new Map();
    }
}
export { ModelRegistry };
