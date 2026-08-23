import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_3bd7879c__ from "../shared/logging/index.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_3bd7879c__.getLoggerManager)().getLogger('runtime:plugins');
class PluginManager {
    add(plugin) {
        if (this.destroyed) throw new Error('PluginManager 已销毁，禁止再添加 Plugin');
        if (this.initialized) throw new Error('PluginManager 已初始化，禁止再添加 Plugin');
        if (this.plugins.some((e)=>e.plugin.name === plugin.name)) throw new Error(`Plugin "${plugin.name}" 已注册，name 不可重复`);
        this.plugins.push({
            plugin,
            registrationOrder: this.nextOrder++
        });
    }
    addAll(plugins) {
        for (const p of plugins)this.add(p);
    }
    get(name) {
        const entry = this.plugins.find((e)=>e.plugin.name === name);
        return entry ? entry.plugin : void 0;
    }
    getNames() {
        return this.plugins.map((e)=>e.plugin.name);
    }
    has(name) {
        return this.plugins.some((e)=>e.plugin.name === name);
    }
    getAssetPlugins() {
        return this.plugins.map((e)=>e.plugin).filter((p)=>'load' in p && 'mount' in p);
    }
    getToolPlugins() {
        return this.plugins.map((e)=>e.plugin).filter((p)=>'activate' in p && 'deactivate' in p);
    }
    getAll() {
        return this.plugins.map((e)=>e.plugin);
    }
    async init(context) {
        if (this.destroyed) throw new Error('PluginManager 已销毁，禁止初始化');
        if (this.initialized) throw new Error('PluginManager 已初始化，禁止重复调用');
        if (this.initializing) throw new Error('PluginManager 正在初始化中，禁止并发调用');
        this.initializing = true;
        const initStart = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_3bd7879c__.getLoggerManager)().now();
        try {
            this.context = context;
            log.debug(`[PluginManager] init started, plugins=${this.plugins.length}`);
            const names = this.plugins.map((e)=>e.plugin.name);
            const seen = new Set();
            for (const n of names){
                if (seen.has(n)) throw new Error(`Plugin name 重复: "${n}"`);
                seen.add(n);
            }
            const allProvides = new Set();
            for (const { plugin } of this.plugins)if (plugin.provides) for (const svc of plugin.provides)allProvides.add(svc);
            for (const { plugin } of this.plugins)if (plugin.dependencies) {
                for (const dep of plugin.dependencies)if (!allProvides.has(dep)) throw new Error(`Plugin "${plugin.name}" 依赖服务 "${dep}"，但没有任何 Plugin 在 provides 中声明该服务`);
            }
            const providerMap = new Map();
            for (const { plugin } of this.plugins)if (plugin.provides) for (const svc of plugin.provides){
                const providers = providerMap.get(svc) ?? [];
                providers.push(plugin.name);
                providerMap.set(svc, providers);
            }
            for (const [svc, providers] of Array.from(providerMap.entries()))if (providers.length > 1) throw new Error(`服务 "${svc}" 被多个 Plugin 同时 provides: [${providers.join(', ')}]，禁止重复提供`);
            this.topoSorted = this.topologicalSort();
            if (log.isEnabled(__WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_3bd7879c__.LogLevel.DEBUG)) log.debug(`[PluginManager] topo sorted, order=${this.topoSorted.map((plugin)=>plugin.name).join(',')}`);
            this.buildUpdateAndDestroyOrder();
            await this.runPreloads();
            for (const plugin of this.topoSorted){
                const start = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_3bd7879c__.getLoggerManager)().now();
                plugin.onInit?.(context);
                log.debug(`[PluginManager] onInit completed, plugin=${plugin.name}, elapsed=${((0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_3bd7879c__.getLoggerManager)().now() - start).toFixed(1)}ms`);
            }
            for (const plugin of this.topoSorted){
                const start = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_3bd7879c__.getLoggerManager)().now();
                plugin.onStart?.();
                log.debug(`[PluginManager] onStart completed, plugin=${plugin.name}, elapsed=${((0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_3bd7879c__.getLoggerManager)().now() - start).toFixed(1)}ms`);
            }
            this.initialized = true;
            log.debug(`[PluginManager] init completed, plugins=${this.plugins.length}, elapsed=${((0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_3bd7879c__.getLoggerManager)().now() - initStart).toFixed(1)}ms`);
        } catch (err) {
            log.error(`[PluginManager] init failed, elapsed=${((0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_3bd7879c__.getLoggerManager)().now() - initStart).toFixed(1)}ms, reason=${err instanceof Error ? err.message : String(err)}`);
            throw err;
        } finally{
            this.initializing = false;
        }
    }
    topologicalSort() {
        const entries = this.plugins;
        const serviceToPlugin = new Map();
        for (const { plugin } of entries)if (plugin.provides) for (const svc of plugin.provides)serviceToPlugin.set(svc, plugin.name);
        const graph = new Map();
        const inDegree = new Map();
        for (const { plugin } of entries){
            graph.set(plugin.name, new Set());
            inDegree.set(plugin.name, 0);
        }
        for (const { plugin } of entries)if (plugin.dependencies) for (const dep of plugin.dependencies){
            const providerName = serviceToPlugin.get(dep);
            if (providerName && providerName !== plugin.name) {
                const edges = graph.get(providerName);
                if (!edges.has(plugin.name)) {
                    edges.add(plugin.name);
                    inDegree.set(plugin.name, (inDegree.get(plugin.name) ?? 0) + 1);
                }
            }
        }
        const queue = [];
        for (const { plugin } of entries)if ((inDegree.get(plugin.name) ?? 0) === 0) queue.push(plugin.name);
        const sorted = [];
        while(queue.length > 0){
            const current = queue.shift();
            sorted.push(current);
            const neighbors = graph.get(current);
            for (const neighbor of neighbors ? Array.from(neighbors) : []){
                const newDegree = (inDegree.get(neighbor) ?? 1) - 1;
                inDegree.set(neighbor, newDegree);
                if (0 === newDegree) queue.push(neighbor);
            }
        }
        if (sorted.length !== entries.length) {
            const inCycle = entries.filter(({ plugin })=>!sorted.includes(plugin.name)).map(({ plugin })=>plugin.name);
            throw new Error(`检测到循环依赖，涉及 Plugin: [${inCycle.join(' → ')}]`);
        }
        const nameToPlugin = new Map(entries.map((e)=>[
                e.plugin.name,
                e.plugin
            ]));
        return sorted.map((name)=>nameToPlugin.get(name));
    }
    buildUpdateAndDestroyOrder() {
        const sorted = [
            ...this.plugins
        ].sort((a, b)=>{
            const pa = a.plugin.priority ?? 0;
            const pb = b.plugin.priority ?? 0;
            if (pa !== pb) return pa - pb;
            return a.registrationOrder - b.registrationOrder;
        });
        this.updateSorted = sorted.map((e)=>e.plugin);
        this.destroySorted = [
            ...this.updateSorted
        ].reverse();
    }
    async runPreloads() {
        const preloadStart = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_3bd7879c__.getLoggerManager)().now();
        const preloadCount = this.plugins.filter(({ plugin })=>plugin.preload).length;
        log.debug(`[PluginManager] preload started, plugins=${preloadCount}`);
        const tasks = this.plugins.map(async ({ plugin })=>{
            if (!plugin.preload) return {
                plugin,
                status: 'skipped'
            };
            const start = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_3bd7879c__.getLoggerManager)().now();
            await plugin.preload();
            log.debug(`[PluginManager] preload completed, plugin=${plugin.name}, elapsed=${((0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_3bd7879c__.getLoggerManager)().now() - start).toFixed(1)}ms`);
            return {
                plugin,
                status: 'fulfilled'
            };
        });
        const settled = await Promise.allSettled(tasks);
        const results = settled.map((item, index)=>{
            if ('fulfilled' === item.status) return item.value;
            return {
                plugin: this.plugins[index].plugin,
                status: 'rejected',
                error: item.reason
            };
        });
        const failed = results.filter((r)=>'rejected' === r.status);
        if (0 === failed.length) {
            log.debug(`[PluginManager] preload settled, fulfilled=${preloadCount}, elapsed=${((0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_3bd7879c__.getLoggerManager)().now() - preloadStart).toFixed(1)}ms`);
            return;
        }
        const reason = failed[0].error;
        log.error(`[PluginManager] preload failed, failed=${failed.length}, reason=${reason instanceof Error ? reason.message : String(reason)}`);
        const succeeded = results.filter((r)=>'fulfilled' === r.status).reverse();
        for (const r of succeeded)try {
            await r.plugin.rollbackPreload?.(reason);
            log.debug(`[PluginManager] rollbackPreload completed, plugin=${r.plugin.name}`);
        } catch (rollbackErr) {
            log.warn(`[PluginManager] rollbackPreload failed, plugin=${r.plugin.name}, reason=${rollbackErr instanceof Error ? rollbackErr.message : String(rollbackErr)}`);
        }
        throw reason;
    }
    updateFrame(frame) {
        for (const plugin of this.updateSorted)try {
            plugin.onUpdateFrame?.(frame);
        } catch (err) {
            this.context?.events.emit('engine.error', {
                error: err instanceof Error ? err : new Error(String(err)),
                context: `updateFrame:${plugin.name}`
            });
        }
    }
    renderView(frame) {
        for (const plugin of this.updateSorted)if (!!plugin.onRenderView) try {
            plugin.onRenderView(frame);
        } catch (err) {
            this.context?.events.emit('engine.error', {
                error: err instanceof Error ? err : new Error(String(err)),
                context: `renderView:${plugin.name}`
            });
        }
    }
    destroy() {
        if (this.destroyed) return;
        this.destroyed = true;
        const destroyStart = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_3bd7879c__.getLoggerManager)().now();
        log.debug(`[PluginManager] destroy started, plugins=${this.destroySorted.length}`);
        for (const plugin of this.destroySorted)try {
            const start = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_3bd7879c__.getLoggerManager)().now();
            plugin.onDestroy?.();
            log.debug(`[PluginManager] onDestroy completed, plugin=${plugin.name}, elapsed=${((0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_3bd7879c__.getLoggerManager)().now() - start).toFixed(1)}ms`);
        } catch (err) {
            log.error(`[PluginManager] onDestroy failed, plugin=${plugin.name}, reason=${err instanceof Error ? err.message : String(err)}`);
            this.context?.events.emit('engine.error', {
                error: err instanceof Error ? err : new Error(String(err)),
                context: `destroy:${plugin.name}`
            });
        }
        log.debug(`[PluginManager] destroy completed, plugins=${this.destroySorted.length}, elapsed=${((0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_3bd7879c__.getLoggerManager)().now() - destroyStart).toFixed(1)}ms`);
    }
    releaseReferences() {
        if (this.referencesReleased) return;
        if (!this.destroyed) this.destroy();
        this.referencesReleased = true;
        this.context = null;
        this.plugins.length = 0;
        this.topoSorted.length = 0;
        this.updateSorted.length = 0;
        this.destroySorted.length = 0;
    }
    dispose() {
        this.destroy();
        this.releaseReferences();
    }
    constructor(){
        this.plugins = [];
        this.initialized = false;
        this.initializing = false;
        this.destroyed = false;
        this.referencesReleased = false;
        this.context = null;
        this.nextOrder = 0;
        this.topoSorted = [];
        this.updateSorted = [];
        this.destroySorted = [];
    }
}
export { PluginManager };
