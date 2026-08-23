import * as __WEBPACK_EXTERNAL_MODULE__MaterialUtils_js_5f537e25__ from "./MaterialUtils.js";
const MaterialColor = {
    hover: 0xffff00,
    select: 0x00ffff,
    locked: 0xa0a0a0
};
class MaterialManager {
    getCachedMaterialKey(entity) {
        return `${__WEBPACK_EXTERNAL_MODULE__MaterialUtils_js_5f537e25__.MaterialUtils.getPixelWidth(entity.lineWidth)}_${entity.lineType}_${entity.color}`;
    }
    getCachedMaterial(entity) {
        const key = this.getCachedMaterialKey(entity);
        if (!this.cachedMaterialMap.has(key)) {
            const material = this.createMaterial(entity);
            material.userData = {
                cacheKey: key
            };
            this.cachedMaterialMap.set(key, material);
        }
        if (!this.usedCacheMaterialEntityMap.has(key)) this.usedCacheMaterialEntityMap.set(key, new Set());
        this.usedCacheMaterialEntityMap.get(key).add(entity.id);
        return this.cachedMaterialMap.get(key);
    }
    disposeMaterialByEntity(material, entity) {
        const cacheKey = material.userData.cacheKey;
        const usedSet = this.usedCacheMaterialEntityMap.get(cacheKey);
        usedSet?.delete(entity.id);
        if (usedSet && 0 === usedSet.size) {
            this.cachedMaterialMap.delete(cacheKey);
            this.usedCacheMaterialEntityMap.delete(cacheKey);
            material.dispose();
        }
    }
    createMaterial(entity) {
        const materialOption = __WEBPACK_EXTERNAL_MODULE__MaterialUtils_js_5f537e25__.MaterialUtils.getMaterialOptionByEntity(entity);
        return __WEBPACK_EXTERNAL_MODULE__MaterialUtils_js_5f537e25__.MaterialUtils.createMaterialByLineType(entity.lineType, materialOption);
    }
    updateLineTypeDashScale(dashScale) {
        __WEBPACK_EXTERNAL_MODULE__MaterialUtils_js_5f537e25__.MaterialUtils.setLineTypeDashScale(dashScale);
        this.cachedMaterialMap.forEach((material)=>__WEBPACK_EXTERNAL_MODULE__MaterialUtils_js_5f537e25__.MaterialUtils.updateLineTypeDashScale(material, dashScale));
        this.cachedHighlightMaterialMap.forEach((material)=>__WEBPACK_EXTERNAL_MODULE__MaterialUtils_js_5f537e25__.MaterialUtils.updateLineTypeDashScale(material, dashScale));
    }
    getHighlightMaterialKey(type, entity) {
        return `${type}_${__WEBPACK_EXTERNAL_MODULE__MaterialUtils_js_5f537e25__.MaterialUtils.getPixelWidth(entity.lineWidth)}_${entity.lineType}`;
    }
    getCachedHighlightMaterial(type, entity) {
        const key = this.getHighlightMaterialKey(type, entity);
        if (!this.cachedHighlightMaterialMap.has(key)) {
            const materialOption = __WEBPACK_EXTERNAL_MODULE__MaterialUtils_js_5f537e25__.MaterialUtils.getMaterialOptionByEntity(entity);
            const material = __WEBPACK_EXTERNAL_MODULE__MaterialUtils_js_5f537e25__.MaterialUtils.createMaterialByLineType(entity.lineType, {
                ...materialOption,
                color: MaterialColor[type],
                linewidth: materialOption.linewidth + 2,
                depthTest: false,
                transparent: true,
                opacity: 0.5
            });
            this.cachedHighlightMaterialMap.set(key, material);
        }
        return this.cachedHighlightMaterialMap.get(key);
    }
    getCachedHoverMaterial(entity) {
        return this.getCachedHighlightMaterial('hover', entity);
    }
    getCachedSelectMaterial(entity) {
        return this.getCachedHighlightMaterial('select', entity);
    }
    getCachedLockedMaterial(entity) {
        return this.getCachedHighlightMaterial('locked', entity);
    }
    dispose() {
        this.cachedMaterialMap.forEach((material)=>{
            material.dispose();
        });
        this.cachedHighlightMaterialMap.forEach((material)=>{
            material.dispose();
        });
        this.cachedMaterialMap.clear();
        this.usedCacheMaterialEntityMap.clear();
        this.cachedHighlightMaterialMap.clear();
    }
    constructor(){
        this.cachedMaterialMap = new Map();
        this.usedCacheMaterialEntityMap = new Map();
        this.cachedHighlightMaterialMap = new Map();
    }
}
export { MaterialColor, MaterialManager };
