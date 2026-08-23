import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
const currentViewport = new __WEBPACK_EXTERNAL_MODULE_three__.Vector4();
function getRendererViewportDrawingBufferSize(renderer, target) {
    if ('function' == typeof renderer.getViewport) {
        const viewport = renderer.getViewport(currentViewport);
        if (Number.isFinite(viewport.z) && Number.isFinite(viewport.w) && viewport.z > 0 && viewport.w > 0) {
            const pixelRatio = normalizePixelRatio(renderer.getPixelRatio?.() ?? 1);
            return target.set(Math.max(1, Math.round(viewport.z * pixelRatio)), Math.max(1, Math.round(viewport.w * pixelRatio)));
        }
    }
    return renderer.getDrawingBufferSize(target);
}
function normalizePixelRatio(pixelRatio) {
    return Number.isFinite(pixelRatio) && pixelRatio > 0 ? pixelRatio : 1;
}
export { getRendererViewportDrawingBufferSize };
