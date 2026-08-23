function normalizeProgress(value, fallback) {
    if ('number' != typeof value || !Number.isFinite(value)) return fallback;
    return Math.min(1, Math.max(0, value));
}
class OctreePointCloudHandle {
    #octree;
    #onVisualChange;
    constructor(id, octree, url, onVisualChange){
        this.kind = 'pointCloud';
        this.userData = {};
        this.id = id;
        this.url = url;
        this.#octree = octree;
        this.#onVisualChange = onVisualChange;
    }
    get name() {
        return this.#octree.name;
    }
    set name(value) {
        this.#octree.name = value;
    }
    get visible() {
        return this.#octree.visible;
    }
    set visible(value) {
        const changed = this.#octree.visible !== value;
        this.#octree.visible = value;
        if (changed) this.#onVisualChange?.('pointcloud.visibility');
    }
    get boundingBox() {
        const box = this.#octree.boundingBox;
        if (!box || box.isEmpty()) return null;
        return box.clone();
    }
    set boundingBox(_value) {}
    get object3D() {
        return this.#octree;
    }
    get attributes() {
        return this.#octree.pcoGeometry?.pointAttributes ?? {
            attributes: []
        };
    }
    get progress() {
        return normalizeProgress(this.#octree.progress, 1);
    }
    get viewLodProgress() {
        return normalizeProgress(this.#octree.viewLodProgress, 0);
    }
    get visibleNodeCount() {
        return this.#octree.numVisibleNodes ?? 0;
    }
    get visiblePointCount() {
        return this.#octree.numVisiblePoints ?? 0;
    }
    get projection() {
        return this.#octree.pcoGeometry?.projection ?? null;
    }
    setAssetConfig(config) {
        const mat = this.#octree.material;
        if (!mat) return;
        if (void 0 !== config.size) mat.size = config.size;
        if (void 0 !== config.minSize) mat.minSize = config.minSize;
        if (void 0 !== config.opacity) mat.opacity = config.opacity;
        if (void 0 !== config.pointSizeType) mat.pointSizeType = config.pointSizeType;
        if (void 0 !== config.shape) mat.shape = config.shape;
        if (void 0 !== config.activeAttributeName) mat.activeAttributeName = config.activeAttributeName;
        if (void 0 !== config.gradient) mat.gradient = config.gradient;
        if (void 0 !== config.intensityRange) mat.intensityRange = config.intensityRange;
        if (void 0 !== config.elevationRange) mat.elevationRange = config.elevationRange;
        if (void 0 !== config.color) mat.color = config.color;
        if (void 0 !== config.weightRGB) mat.weightRGB = config.weightRGB;
        if (void 0 !== config.weightIntensity) mat.weightIntensity = config.weightIntensity;
        if (void 0 !== config.weightElevation) mat.weightElevation = config.weightElevation;
        if (void 0 !== config.weightClassification) mat.weightClassification = config.weightClassification;
        if (void 0 !== config.weightReturnNumber) mat.weightReturnNumber = config.weightReturnNumber;
        if (void 0 !== config.weightSourceID) mat.weightSourceID = config.weightSourceID;
        if (void 0 !== config.rgbGamma) mat.rgbGamma = config.rgbGamma;
        if (void 0 !== config.rgbBrightness) mat.rgbBrightness = config.rgbBrightness;
        if (void 0 !== config.rgbContrast) mat.rgbContrast = config.rgbContrast;
        if (void 0 !== config.intensityGamma) mat.intensityGamma = config.intensityGamma;
        if (void 0 !== config.intensityBrightness) mat.intensityBrightness = config.intensityBrightness;
        if (void 0 !== config.intensityContrast) mat.intensityContrast = config.intensityContrast;
        if (void 0 !== config.extraGamma) mat.extraGamma = config.extraGamma;
        if (void 0 !== config.extraBrightness) mat.extraBrightness = config.extraBrightness;
        if (void 0 !== config.extraContrast) mat.extraContrast = config.extraContrast;
        if (void 0 !== config.extraRange) mat.extraRange = config.extraRange;
        if (void 0 !== config.activeSamplingRange) mat.activeSamplingRange = config.activeSamplingRange;
        if (void 0 !== config.maxSize) mat.maxSize = config.maxSize;
        if (void 0 !== config.weighted) mat.weighted = config.weighted;
        if (void 0 !== config.matcap) mat.matcap = config.matcap;
        if (void 0 !== config.classification) mat.classification = config.classification;
        if (void 0 !== config.useOrthographicCamera) mat.useOrthographicCamera = config.useOrthographicCamera;
        if (void 0 !== config.useClipBox) mat.useClipBox = config.useClipBox;
        this.#onVisualChange?.('pointcloud.assetConfig');
    }
    getAssetConfig() {
        const mat = this.#octree.material;
        return {
            size: mat.size,
            minSize: mat.minSize,
            opacity: mat.opacity,
            pointSizeType: mat.pointSizeType,
            shape: mat.shape,
            activeAttributeName: mat.activeAttributeName,
            gradient: mat.gradient,
            intensityRange: mat.intensityRange,
            elevationRange: mat.elevationRange,
            color: mat.color,
            weightRGB: mat.weightRGB,
            weightIntensity: mat.weightIntensity,
            weightElevation: mat.weightElevation,
            weightClassification: mat.weightClassification,
            weightReturnNumber: mat.weightReturnNumber,
            weightSourceID: mat.weightSourceID,
            rgbGamma: mat.rgbGamma,
            rgbBrightness: mat.rgbBrightness,
            rgbContrast: mat.rgbContrast,
            intensityGamma: mat.intensityGamma,
            intensityBrightness: mat.intensityBrightness,
            intensityContrast: mat.intensityContrast,
            extraGamma: mat.extraGamma,
            extraBrightness: mat.extraBrightness,
            extraContrast: mat.extraContrast,
            extraRange: mat.extraRange,
            activeSamplingRange: mat.activeSamplingRange,
            maxSize: mat.maxSize,
            weighted: mat.weighted,
            matcap: mat.matcap,
            classification: mat.classification,
            useOrthographicCamera: mat.useOrthographicCamera,
            useClipBox: mat.useClipBox
        };
    }
}
export { OctreePointCloudHandle };
