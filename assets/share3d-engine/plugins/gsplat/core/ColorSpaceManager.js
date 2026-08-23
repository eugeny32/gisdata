import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__ColorSpaceConstants_js_1f16fae5__ from "./ColorSpaceConstants.js";
class ColorSpaceManager {
    constructor(renderer){
        this._defaultConfig = {
            gammaMode: 'auto',
            toneMapping: __WEBPACK_EXTERNAL_MODULE__ColorSpaceConstants_js_1f16fae5__.ToneMappingMode.NONE,
            exposure: 1.0
        };
        this.renderer = renderer;
    }
    configureMaterial(material) {
        const renderTarget = this.renderer.getRenderTarget();
        const isSRGBTarget = renderTarget?.texture.colorSpace === __WEBPACK_EXTERNAL_MODULE_three__.SRGBColorSpace;
        const rendererOutputsSRGB = this.renderer.outputColorSpace === __WEBPACK_EXTERNAL_MODULE_three__.SRGBColorSpace;
        let gammaMode = this._defaultConfig.gammaMode;
        if ('auto' === gammaMode) gammaMode = isSRGBTarget || rendererOutputsSRGB ? __WEBPACK_EXTERNAL_MODULE__ColorSpaceConstants_js_1f16fae5__.GammaMode.SRGB : __WEBPACK_EXTERNAL_MODULE__ColorSpaceConstants_js_1f16fae5__.GammaMode.NONE;
        material.setGammaMode(gammaMode);
        material.setToneMapping(this._defaultConfig.toneMapping);
        material.setExposure(this._defaultConfig.exposure);
    }
    setDefaults(config) {
        if (void 0 !== config.gammaMode) this._defaultConfig.gammaMode = config.gammaMode;
        if (void 0 !== config.toneMapping) this._defaultConfig.toneMapping = config.toneMapping;
        if (void 0 !== config.exposure) this._defaultConfig.exposure = config.exposure;
    }
    getDefaults() {
        return {
            ...this._defaultConfig
        };
    }
    detectGammaNeed() {
        const renderTarget = this.renderer.getRenderTarget();
        const isSRGBTarget = renderTarget?.texture.colorSpace === __WEBPACK_EXTERNAL_MODULE_three__.SRGBColorSpace;
        const rendererOutputsSRGB = this.renderer.outputColorSpace === __WEBPACK_EXTERNAL_MODULE_three__.SRGBColorSpace;
        return isSRGBTarget || rendererOutputsSRGB ? __WEBPACK_EXTERNAL_MODULE__ColorSpaceConstants_js_1f16fae5__.GammaMode.SRGB : __WEBPACK_EXTERNAL_MODULE__ColorSpaceConstants_js_1f16fae5__.GammaMode.NONE;
    }
    getRenderer() {
        return this.renderer;
    }
}
export { ColorSpaceManager };
