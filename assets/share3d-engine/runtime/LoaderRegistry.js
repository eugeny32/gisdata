class LoaderRegistry {
    register(loader) {
        if (!loader.format) throw new Error('LoaderRegistry: format 不能为空');
        if (this.loaders.has(loader.format)) throw new Error(`LoaderRegistry: format "${loader.format}" 已注册`);
        this.loaders.set(loader.format, loader);
    }
    get(format) {
        return this.loaders.get(format);
    }
    detect(source) {
        const matches = [];
        this.loaders.forEach((loader)=>{
            if (loader.canLoad?.(source)) matches.push(loader);
        });
        if (0 === matches.length) return;
        if (1 === matches.length) return matches[0];
        matches.sort((a, b)=>(b.detectPriority ?? 0) - (a.detectPriority ?? 0));
        const top = matches[0];
        const second = matches[1];
        if ((top.detectPriority ?? 0) === (second.detectPriority ?? 0)) throw new Error('LoaderRegistry: 多个 loader 匹配且 detectPriority 相同 (' + top.format + ', ' + second.format + ')，请指定 format');
        return top;
    }
    formats() {
        return Array.from(this.loaders.keys());
    }
    constructor(){
        this.loaders = new Map();
    }
}
export { LoaderRegistry };
