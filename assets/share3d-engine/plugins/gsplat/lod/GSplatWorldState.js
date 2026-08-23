import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('gsplat:lod');
class GSplatWorldState {
    constructor(version, splats, maxTextureSize = 8192, minTextureSize = 1){
        this.version = 0;
        this.sortParametersSet = false;
        this.sortedBefore = false;
        this.splats = [];
        this.textureSize = 0;
        this.totalUsedPixels = 0;
        this.totalActiveSplats = 0;
        this.sortedVisibleSplatCount = 0;
        this.version = version;
        this.splats = splats;
        this.estimateTextureSize(splats, maxTextureSize, minTextureSize);
        this.assignLines(splats, this.textureSize);
    }
    estimateTextureSize(splats, maxSize, minSize = 1) {
        const fits = (size)=>{
            let rows = 0;
            for (const splat of splats){
                rows += Math.ceil(splat.activeSplats / size);
                if (rows > size) return false;
            }
            return true;
        };
        const safeMinSize = Math.max(1, Math.min(maxSize, Math.floor(minSize)));
        let low = safeMinSize;
        let high = maxSize;
        let bestSize = null;
        while(low <= high){
            const mid = Math.floor((low + high) / 2);
            if (fits(mid)) {
                bestSize = mid;
                high = mid - 1;
            } else low = mid + 1;
        }
        if (null === bestSize) {
            this.textureSize = 0;
            log.error('GSplatWorldState.estimateTextureSize: failed to find a valid texture size');
            return false;
        }
        this.textureSize = bestSize;
        return true;
    }
    assignLines(splats, size) {
        if (0 === splats.length) {
            this.totalUsedPixels = 0;
            this.totalActiveSplats = 0;
            this.sortedVisibleSplatCount = 0;
            return;
        }
        let start = 0;
        this.totalActiveSplats = 0;
        for (const splat of splats){
            const activeSplats = splat.activeSplats;
            this.totalActiveSplats += activeSplats;
            const numLines = Math.ceil(activeSplats / size);
            splat.setLines(start, numLines, size, activeSplats);
            start += numLines;
        }
        this.totalUsedPixels = start * size;
        this.sortedVisibleSplatCount = this.totalActiveSplats;
    }
    destroy() {
        this.splats.forEach((splat)=>splat.destroy());
        this.splats.length = 0;
    }
}
export { GSplatWorldState };
