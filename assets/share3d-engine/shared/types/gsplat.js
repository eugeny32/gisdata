var gsplat_rslib_entry_GammaMode = /*#__PURE__*/ function(GammaMode) {
    GammaMode["NONE"] = "NONE";
    GammaMode["SRGB"] = "SRGB";
    return GammaMode;
}({});
var gsplat_rslib_entry_ToneMappingMode = /*#__PURE__*/ function(ToneMappingMode) {
    ToneMappingMode["NONE"] = "NONE";
    ToneMappingMode["LINEAR"] = "LINEAR";
    ToneMappingMode["ACES"] = "ACES";
    ToneMappingMode["FILMIC"] = "FILMIC";
    ToneMappingMode["NEUTRAL"] = "NEUTRAL";
    return ToneMappingMode;
}({});
const GSPLAT_WORKBUFFER_UPDATE_AUTO = 'auto';
const GSPLAT_WORKBUFFER_UPDATE_ONCE = 'once';
const GSPLAT_WORKBUFFER_UPDATE_ALWAYS = 'always';
export { GSPLAT_WORKBUFFER_UPDATE_ALWAYS, GSPLAT_WORKBUFFER_UPDATE_AUTO, GSPLAT_WORKBUFFER_UPDATE_ONCE, gsplat_rslib_entry_GammaMode as GammaMode, gsplat_rslib_entry_ToneMappingMode as ToneMappingMode };
