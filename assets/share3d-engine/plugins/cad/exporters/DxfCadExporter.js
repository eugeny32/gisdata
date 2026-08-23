import * as __WEBPACK_EXTERNAL_MODULE__module_exporter_dxfExporter_DxfExporter_js_0f26776d__ from "../module/exporter/dxfExporter/DxfExporter.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('cad:export');
class DxfCadExporter {
    constructor(getMetadata){
        this.format = 'dxf';
        this.getMetadata = getMetadata;
    }
    async export(handle, options) {
        const exportStart = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().now();
        const metadata = this.getMetadata(handle);
        const cadOptions = options;
        const units = cadOptions?.extra?.units;
        const dxfString = __WEBPACK_EXTERNAL_MODULE__module_exporter_dxfExporter_DxfExporter_js_0f26776d__.DxfExporter["export"](metadata, units);
        log.debug(`[DxfCadExporter] dxf generated, id=${handle.id}, entities=${metadata.entities.length}, layers=${metadata.layers.length}, chars=${dxfString.length}, elapsed=${((0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().now() - exportStart).toFixed(1)}ms`);
        return new Blob([
            dxfString
        ], {
            type: 'application/dxf'
        });
    }
}
export { DxfCadExporter };
