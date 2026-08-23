import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('tools');
const DEFAULT_OPTIONS = {
    fontFace: 'Arial',
    fontSize: 64,
    fontWeight: 'bold',
    placement: 'center',
    fontColor: '#ffffff',
    textColor: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 8,
    borderRadius: 4,
    borderThickness: 0,
    borderColor: 'rgba(0, 0, 0, 0)',
    textStrokeWidth: 0,
    textStrokeColor: 'rgba(0, 0, 0, 1)',
    textAlign: 'center'
};
function getSpriteState(sprite) {
    return sprite.userData;
}
function resolveTextSpriteOptions(options) {
    const fontColor = options?.fontColor ?? DEFAULT_OPTIONS.fontColor;
    return {
        fontFace: options?.fontFace ?? DEFAULT_OPTIONS.fontFace,
        fontSize: options?.fontSize ?? DEFAULT_OPTIONS.fontSize,
        fontWeight: options?.fontWeight ?? DEFAULT_OPTIONS.fontWeight,
        placement: options?.placement ?? DEFAULT_OPTIONS.placement,
        fontColor,
        textColor: options?.textColor ?? fontColor,
        backgroundColor: options?.backgroundColor ?? DEFAULT_OPTIONS.backgroundColor,
        padding: options?.padding ?? DEFAULT_OPTIONS.padding,
        borderRadius: options?.borderRadius ?? DEFAULT_OPTIONS.borderRadius,
        borderThickness: options?.borderThickness ?? DEFAULT_OPTIONS.borderThickness,
        borderColor: options?.borderColor ?? DEFAULT_OPTIONS.borderColor,
        textStrokeWidth: options?.textStrokeWidth ?? DEFAULT_OPTIONS.textStrokeWidth,
        textStrokeColor: options?.textStrokeColor ?? DEFAULT_OPTIONS.textStrokeColor,
        textAlign: options?.textAlign ?? DEFAULT_OPTIONS.textAlign
    };
}
function nextPowerOfTwo(v) {
    let n = Math.ceil(v);
    n--;
    n |= n >> 1;
    n |= n >> 2;
    n |= n >> 4;
    n |= n >> 8;
    n |= n >> 16;
    return n + 1;
}
function drawRoundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}
function renderTextToCanvas(canvas, text, opts) {
    const ctx = canvas.getContext('2d');
    const { fontFace, fontSize, fontWeight, textColor, backgroundColor, padding, borderRadius, borderThickness, borderColor, textStrokeWidth, textStrokeColor, textAlign } = opts;
    const dpr = 'undefined' != typeof window ? window.devicePixelRatio : 1;
    const font = `${fontWeight} ${fontSize}px ${fontFace}`;
    const lines = String(text).split(/\r?\n/);
    ctx.font = font;
    const lineMetrics = lines.map((line)=>ctx.measureText(line));
    const textWidth = lineMetrics.reduce((max, item)=>Math.max(max, item.width), 0);
    let lineHeight = 1.3 * fontSize;
    for (const metrics of lineMetrics){
        const ascent = metrics.actualBoundingBoxAscent ?? 0.8 * fontSize;
        const descent = metrics.actualBoundingBoxDescent ?? 0.2 * fontSize;
        lineHeight = Math.max(lineHeight, ascent + descent);
    }
    const strokePadding = Math.max(0, Math.ceil(textStrokeWidth));
    const innerPadding = padding + strokePadding;
    const cssWidth = textWidth + 2 * innerPadding + 2 * borderThickness;
    const cssHeight = lineHeight * lines.length + 2 * innerPadding + 2 * borderThickness;
    canvas.width = nextPowerOfTwo(Math.max(1, cssWidth * dpr));
    canvas.height = nextPowerOfTwo(Math.max(1, cssHeight * dpr));
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = font;
    ctx.textBaseline = 'middle';
    ctx.textAlign = textAlign;
    ctx.lineJoin = 'round';
    ctx.fillStyle = backgroundColor;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderThickness;
    const rectX = borderThickness > 0 ? borderThickness / 2 : 0;
    const rectY = borderThickness > 0 ? borderThickness / 2 : 0;
    const rectWidth = Math.max(cssWidth - borderThickness, 0);
    const rectHeight = Math.max(cssHeight - borderThickness, 0);
    const radius = Math.min(borderRadius, rectWidth / 2, rectHeight / 2);
    drawRoundRect(ctx, rectX, rectY, rectWidth, rectHeight, radius);
    ctx.fill();
    if (borderThickness > 0) ctx.stroke();
    const textLeft = borderThickness + innerPadding;
    const textRight = cssWidth - borderThickness - innerPadding;
    const textCenter = cssWidth / 2;
    ctx.fillStyle = textColor;
    ctx.strokeStyle = textStrokeColor;
    ctx.lineWidth = textStrokeWidth;
    lines.forEach((line, index)=>{
        const x = 'left' === textAlign ? textLeft : 'right' === textAlign ? textRight : textCenter;
        const y = borderThickness + innerPadding + lineHeight * (index + 0.5);
        if (textStrokeWidth > 0) ctx.strokeText(line, x, y);
        ctx.fillText(line, x, y);
    });
    return {
        cssWidth,
        cssHeight
    };
}
function applyBaseScale(sprite, cssWidth, cssHeight) {
    const scale = 0.01;
    const baseScale = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(cssWidth * scale, cssHeight * scale, 1.0);
    const state = getSpriteState(sprite);
    state._textBaseScale = baseScale;
    sprite.scale.copy(baseScale);
}
function applyPlacement(sprite, placement) {
    const centerY = 'above' === placement ? 0 : 'below' === placement ? 1 : 0.5;
    sprite.center.set(0.5, centerY);
}
function createTextSprite(text, options) {
    const opts = resolveTextSpriteOptions(options);
    const canvas = document.createElement('canvas');
    const { cssWidth, cssHeight } = renderTextToCanvas(canvas, text, opts);
    const texture = new __WEBPACK_EXTERNAL_MODULE_three__.CanvasTexture(canvas);
    texture.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.LinearFilter;
    texture.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.LinearFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
    const material = new __WEBPACK_EXTERNAL_MODULE_three__.SpriteMaterial({
        map: texture,
        depthTest: false,
        depthWrite: false,
        transparent: true
    });
    const sprite = new __WEBPACK_EXTERNAL_MODULE_three__.Sprite(material);
    applyPlacement(sprite, opts.placement);
    applyBaseScale(sprite, cssWidth, cssHeight);
    const state = getSpriteState(sprite);
    state._textCanvas = canvas;
    state._textTexture = texture;
    state._textMaterial = material;
    state._textOptions = opts;
    return sprite;
}
function updateTextSprite(sprite, text) {
    const state = getSpriteState(sprite);
    const canvas = state._textCanvas ?? void 0;
    const texture = state._textTexture ?? void 0;
    const opts = state._textOptions ?? void 0;
    if (!canvas || !texture || !opts) {
        log.warn('updateTextSprite: missing sprite text state, skip update');
        return;
    }
    const { cssWidth, cssHeight } = renderTextToCanvas(canvas, text, opts);
    texture.needsUpdate = true;
    applyBaseScale(sprite, cssWidth, cssHeight);
}
function updateTextSpriteScaleForCamera(sprite, camera, viewportHeight, targetPx = 70) {
    const state = getSpriteState(sprite);
    const baseScale = state._textBaseScale;
    if (!baseScale || viewportHeight <= 0) return;
    let worldPerPixel = 1 / viewportHeight;
    if (camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.PerspectiveCamera) {
        const distance = camera.position.distanceTo(sprite.getWorldPosition(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3()));
        const fovRad = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.degToRad(camera.fov);
        worldPerPixel = 2 * distance * Math.tan(fovRad / 2) / viewportHeight;
    } else if (camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.OrthographicCamera) {
        const frustumHeight = (camera.top - camera.bottom) / Math.max(camera.zoom, 1e-6);
        worldPerPixel = frustumHeight / viewportHeight;
    }
    const scaleFactor = targetPx * worldPerPixel;
    sprite.scale.copy(baseScale).multiplyScalar(scaleFactor);
}
function disposeTextSprite(sprite) {
    const state = getSpriteState(sprite);
    state._textTexture?.dispose();
    state._textMaterial?.dispose();
    state._textCanvas = null;
    state._textTexture = null;
    state._textMaterial = null;
    state._textOptions = null;
    state._textBaseScale = null;
}
export { createTextSprite, disposeTextSprite, updateTextSprite, updateTextSpriteScaleForCamera };
