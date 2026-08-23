class ExporterRegistry {
    register(exporter) {
        const format = exporter.format?.trim();
        if (!format) throw new Error('ExporterRegistry: format 不能为空');
        if (this.exporters.has(format)) throw new Error(`ExporterRegistry: format "${format}" 已注册`);
        this.exporters.set(format, exporter);
    }
    get(format) {
        return this.exporters.get(format.trim());
    }
    formats() {
        return Array.from(this.exporters.keys());
    }
    constructor(){
        this.exporters = new Map();
    }
}
export { ExporterRegistry };
