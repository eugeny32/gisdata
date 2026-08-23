var Capturer_rslib_entry_CaptureType = /*#__PURE__*/ function(CaptureType) {
    CaptureType["None"] = "none";
    CaptureType["Endpoint"] = "endpoint";
    CaptureType["Midpoint"] = "midpoint";
    CaptureType["Node"] = "node";
    CaptureType["Center"] = "center";
    CaptureType["Nearest"] = "nearest";
    return CaptureType;
}({});
class Capturer {
    setConfig(config) {
        this.config = {
            ...this.config,
            ...config
        };
        if (config.enabledTypes) this.config.enabledTypes = new Set(config.enabledTypes);
    }
    getConfig() {
        return {
            ...this.config
        };
    }
    setEnabled(enabled) {
        this.config.enabled = enabled;
    }
    isEnabled() {
        return this.config.enabled;
    }
    setCaptureRadius(radius) {
        this.config.captureRadius = Math.max(1, radius);
    }
    setCaptureType(type, enabled) {
        if (enabled) this.config.enabledTypes.add(type);
        else this.config.enabledTypes.delete(type);
    }
    isCaptureTypeEnabled(type) {
        return this.config.enabledTypes.has(type);
    }
    getLastCaptureResult() {
        return this.lastCaptureResult;
    }
    clearCapture() {
        this.lastCaptureResult = null;
    }
    findNearestPointOnLine(point, line) {
        const { startPoint, endPoint } = line;
        const dx = endPoint.x - startPoint.x;
        const dy = endPoint.y - startPoint.y;
        const lengthSquared = dx * dx + dy * dy;
        if (0 === lengthSquared) return {
            x: startPoint.x,
            y: startPoint.y
        };
        const t = Math.max(0, Math.min(1, ((point.x - startPoint.x) * dx + (point.y - startPoint.y) * dy) / lengthSquared));
        return {
            x: startPoint.x + t * dx,
            y: startPoint.y + t * dy
        };
    }
    calculateDistance(p1, p2) {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    resetConfig() {
        this.config = {
            ...this.defaultConfig
        };
        this.config.enabledTypes = new Set(this.defaultConfig.enabledTypes);
    }
    injectTool(tool) {
        this.tool = tool;
    }
    ejectTool() {
        this.tool = void 0;
    }
    constructor(){
        this.defaultConfig = {
            enabled: false,
            captureRadius: 10,
            enabledTypes: new Set([
                "endpoint",
                "midpoint",
                "node",
                "center",
                "nearest"
            ]),
            showMarker: true
        };
        this.config = {
            ...this.defaultConfig
        };
        this.lastCaptureResult = null;
    }
}
export { Capturer_rslib_entry_CaptureType as CaptureType, Capturer };
