import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
function containsScreenPoint(rect, screen) {
    return screen.x >= rect.x && screen.y >= rect.y && screen.x <= rect.x + rect.width && screen.y <= rect.y + rect.height;
}
function toViewportLocalPoint(screen, viewport) {
    return new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(screen.x - viewport.x, screen.y - viewport.y);
}
function screenToViewNDC(screen, rect) {
    const x = (screen.x - rect.x) / rect.width * 2 - 1;
    const y = -((screen.y - rect.y) / rect.height * 2 - 1);
    return new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(0 === x ? 0 : x, 0 === y ? 0 : y);
}
function screenToNDC(screen, viewport) {
    return screenToViewNDC(screen, viewport);
}
function toRendererViewportRect(rect, containerSize) {
    return {
        x: Math.round(rect.x),
        y: Math.round(containerSize.height - rect.y - rect.height),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
    };
}
export { containsScreenPoint, screenToNDC, screenToViewNDC, toRendererViewportRect, toViewportLocalPoint };
