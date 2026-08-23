class Setting {
    static #_ = this.dashSize = 10;
    static #_2 = this.dimensionConfig = {
        color: 0x06fffd,
        opacity: 0.5,
        textColor: '#06FFFD',
        textSize: 16,
        linewidth: 2
    };
    static setDimensionConfig(config) {
        Object.assign(Setting.dimensionConfig, config);
    }
    static #_3 = this.leadLineConfig = {
        color: 0xffa500,
        opacity: 1
    };
    static setLeadLineConfig(config) {
        Object.assign(Setting.leadLineConfig, config);
    }
    static #_4 = this.previewLineConfig = {
        color: 0x06fffd,
        opacity: 1
    };
    static setPreviewLineConfig(config) {
        Object.assign(Setting.previewLineConfig, config);
    }
    static #_5 = this.gripConfig = {
        color: 0xffffff,
        hoverColor: 0xffc107,
        activeColor: 0x00ffff,
        pixelRadius: 6,
        hitPadding: 4,
        depthTest: false,
        depthWrite: false
    };
    static setGripConfig(config) {
        Object.assign(Setting.gripConfig, config);
    }
}
export { Setting };
