import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
const TOOL_COLOR_LINE = 0x52a6ff;
const TOOL_COLOR_FILL = 0x118af0;
const TOOL_COLOR_LABEL = '#ffffff';
const TOOL_COLOR_HEIGHT = 0x118af0;
const TOOL_COLOR_ANGLE = 0xffff00;
const TOOL_COLOR_CLIP = 0xffff00;
const TOOL_COLOR_VOLUME = 0x00ff00;
const TOOL_COLOR_PROFILE = 0xff0000;
function createLineMaterial(color, linewidth = 2) {
    return new __WEBPACK_EXTERNAL_MODULE_three__.LineBasicMaterial({
        color,
        linewidth,
        depthTest: false,
        depthWrite: false
    });
}
function createDashedMaterial(color, dashSize = 5, gapSize = 3) {
    return new __WEBPACK_EXTERNAL_MODULE_three__.LineDashedMaterial({
        color,
        dashSize,
        gapSize,
        depthTest: false,
        depthWrite: false
    });
}
function createFillMaterial(color, opacity = 0.15) {
    return new __WEBPACK_EXTERNAL_MODULE_three__.MeshBasicMaterial({
        color,
        opacity,
        transparent: true,
        side: __WEBPACK_EXTERNAL_MODULE_three__.DoubleSide,
        depthTest: false,
        depthWrite: false
    });
}
function createPointMaterial(color, size = 6) {
    return new __WEBPACK_EXTERNAL_MODULE_three__.PointsMaterial({
        color,
        size,
        depthTest: false,
        depthWrite: false,
        sizeAttenuation: false
    });
}
export { TOOL_COLOR_ANGLE, TOOL_COLOR_CLIP, TOOL_COLOR_FILL, TOOL_COLOR_HEIGHT, TOOL_COLOR_LABEL, TOOL_COLOR_LINE, TOOL_COLOR_PROFILE, TOOL_COLOR_VOLUME, createDashedMaterial, createFillMaterial, createLineMaterial, createPointMaterial };
