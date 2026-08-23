import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__viewRect_js_121ee12e__ from "./viewRect.js";
class Magnifier {
    constructor(context, getActiveCamera, options = {}){
        this._renderTarget = null;
        this._pixelBuffer = new Uint8Array(0);
        this._visible = false;
        this._mouseX = 0;
        this._mouseY = 0;
        this._offsetY = 30;
        const { radius = 100, magnification = 3 } = options;
        this._context = context;
        this._events = context.events;
        this._sceneGraph = context.sceneGraph;
        this._getActiveCamera = getActiveCamera;
        this._radius = radius;
        this._magnification = magnification;
        this._options = options;
        const size = 2 * this._radius;
        this._canvas = document.createElement('canvas');
        this._canvas.width = size;
        this._canvas.height = size;
        Object.assign(this._canvas.style, {
            position: 'absolute',
            pointerEvents: 'none',
            borderRadius: '50%',
            border: '2px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 0 8px rgba(0, 0, 0, 0.5)',
            display: 'none'
        });
        this._ctx = this._canvas.getContext('2d');
        this._ctx.imageSmoothingEnabled = false;
        this._context.container.appendChild(this._canvas);
        this._sampleCanvas = document.createElement('canvas');
        this._sampleCtx = this._sampleCanvas.getContext('2d');
        this._sampleCtx.imageSmoothingEnabled = false;
        this._underlayCanvas = document.createElement('canvas');
        this._underlayCtx = this._underlayCanvas.getContext('2d');
        this._underlayCtx.imageSmoothingEnabled = false;
        this._onRenderBound = this._onRender.bind(this);
        this._onMouseMoveBound = this._onMouseMove.bind(this);
    }
    show() {
        if (this._visible) return;
        this._visible = true;
        this._canvas.style.display = 'block';
        this._events.on('frame.end', this._onRenderBound);
        this._context.renderer.domElement.addEventListener('mousemove', this._onMouseMoveBound);
        this._originalCursor = this._context.renderer.domElement.style.cursor;
        this._context.renderer.domElement.style.cursor = 'crosshair';
    }
    hide() {
        if (!this._visible) return;
        this._visible = false;
        this._canvas.style.display = 'none';
        this._events.off('frame.end', this._onRenderBound);
        this._context.renderer.domElement.removeEventListener('mousemove', this._onMouseMoveBound);
        this._context.renderer.domElement.style.cursor = this._originalCursor ?? '';
        this._originalCursor = void 0;
    }
    setRadius(radius) {
        if (radius === this._radius) return;
        this._radius = radius;
        const size = 2 * this._radius;
        this._canvas.width = size;
        this._canvas.height = size;
        this._canvas.style.left = `${this._mouseX - this._radius}px`;
        this._canvas.style.top = `${this._mouseY - 2 * this._radius - this._offsetY}px`;
    }
    _onMouseMove(e) {
        const rect = this._context.renderer.domElement.getBoundingClientRect();
        this._mouseX = e.clientX - rect.left;
        this._mouseY = e.clientY - rect.top;
    }
    _onRender() {
        if (!this._visible) return;
        const renderer = this._context.renderer;
        const scaleFactor = renderer.getPixelRatio();
        const underlay = this._renderUnderlayToCanvas(scaleFactor);
        const source = this._renderSampleToCanvas(scaleFactor);
        if (!source) return;
        const size = 2 * this._radius;
        const ctx = this._ctx;
        ctx.clearRect(0, 0, size, size);
        ctx.imageSmoothingEnabled = false;
        ctx.save();
        ctx.beginPath();
        ctx.arc(this._radius, this._radius, this._radius, 0, 2 * Math.PI);
        ctx.clip();
        if (underlay) ctx.drawImage(underlay.canvas, 0, 0, underlay.width, underlay.height, 0, 0, size, size);
        ctx.drawImage(source.canvas, 0, 0, source.width, source.height, 0, 0, size, size);
        ctx.restore();
        this._drawCrosshair(ctx);
        this._canvas.style.left = `${this._mouseX - this._radius}px`;
        this._canvas.style.top = `${this._mouseY - 2 * this._radius - this._offsetY}px`;
    }
    _renderSampleToCanvas(scaleFactor) {
        const size = 2 * this._radius;
        return this._renderSceneToCanvas({
            scaleFactor,
            sourceCSS: size / this._magnification,
            canvas: this._sampleCanvas,
            ctx: this._sampleCtx,
            predicate: this._resolveExcludePredicate()
        });
    }
    _renderUnderlayToCanvas(scaleFactor) {
        const size = 2 * this._radius;
        const predicate = this._resolveOcclusionExcludePredicate();
        if (!predicate) return null;
        return this._renderSceneToCanvas({
            scaleFactor,
            sourceCSS: size,
            canvas: this._underlayCanvas,
            ctx: this._underlayCtx,
            predicate
        });
    }
    _renderSceneToCanvas(params) {
        const glRenderer = this._context.renderer;
        const { scaleFactor, sourceCSS, canvas, ctx, predicate } = params;
        const renderSize = glRenderer.getDrawingBufferSize(new __WEBPACK_EXTERNAL_MODULE_three__.Vector2());
        if (renderSize.x <= 0 || renderSize.y <= 0) return null;
        this._ensureRenderTarget(renderSize.x, renderSize.y);
        if (!this._renderTarget) return null;
        const sw = Math.max(1, Math.floor(sourceCSS * scaleFactor));
        const sh = Math.max(1, Math.floor(sourceCSS * scaleFactor));
        const sx = Math.floor(this._mouseX * scaleFactor - sw / 2);
        const sy = Math.floor(this._mouseY * scaleFactor - sh / 2);
        const clamped = this._clampReadRect(sx, sy, sw, sh, renderSize.x, renderSize.y);
        const needBufferLength = clamped.w * clamped.h * 4;
        if (this._pixelBuffer.length !== needBufferLength) this._pixelBuffer = new Uint8Array(needBufferLength);
        const oldRenderTarget = glRenderer.getRenderTarget();
        const hiddenObjects = this._temporarilyHideObjects(predicate);
        try {
            glRenderer.setRenderTarget(this._renderTarget);
            glRenderer.clear(true, true, true);
            this._renderOffscreen(glRenderer);
            glRenderer.readRenderTargetPixels(this._renderTarget, clamped.x, clamped.readY, clamped.w, clamped.h, this._pixelBuffer);
        } finally{
            for (const obj of hiddenObjects)obj.visible = true;
            glRenderer.setRenderTarget(oldRenderTarget);
        }
        if (canvas.width !== clamped.w || canvas.height !== clamped.h) {
            canvas.width = clamped.w;
            canvas.height = clamped.h;
        }
        const flipped = new Uint8ClampedArray(this._pixelBuffer.length);
        for(let row = 0; row < clamped.h; row++){
            const srcOffset = row * clamped.w * 4;
            const dstOffset = (clamped.h - row - 1) * clamped.w * 4;
            flipped.set(this._pixelBuffer.subarray(srcOffset, srcOffset + 4 * clamped.w), dstOffset);
        }
        ctx.putImageData(new ImageData(flipped, clamped.w, clamped.h), 0, 0);
        return {
            canvas,
            width: clamped.w,
            height: clamped.h
        };
    }
    _renderOffscreen(renderer) {
        const activeCamera = this._getActiveCamera();
        if (!activeCamera) return;
        const pipeline = this._getRenderPipeline();
        const frame = this._buildPipelineFrame(activeCamera);
        if (pipeline && frame) {
            pipeline.execute(frame, {
                outputTarget: this._renderTarget,
                viewportOverride: frame.viewport
            });
            return;
        }
        const sg = this._sceneGraph;
        renderer.render(sg.mainScene, activeCamera);
        renderer.clearDepth();
        renderer.render(sg.overlayScene, activeCamera);
    }
    _buildPipelineFrame(camera) {
        const activeView = this._getActiveViewSnapshot();
        const renderSize = this._context.renderer.getSize(new __WEBPACK_EXTERNAL_MODULE_three__.Vector2());
        const surfaceWidth = Math.max(Math.round(renderSize.x), 1);
        const surfaceHeight = Math.max(Math.round(renderSize.y), 1);
        const viewRect = activeView?.rect ?? {
            x: 0,
            y: 0,
            width: this._context.renderer.domElement.clientWidth,
            height: this._context.renderer.domElement.clientHeight
        };
        const viewport = (0, __WEBPACK_EXTERNAL_MODULE__viewRect_js_121ee12e__.toRendererViewportRect)(viewRect, {
            width: surfaceWidth,
            height: surfaceHeight
        });
        return {
            viewId: activeView?.id ?? 'primary',
            camera,
            renderer: this._context.renderer,
            viewport,
            viewRect,
            frameNumber: 0
        };
    }
    _getActiveViewSnapshot() {
        if (!this._context.hasService?.('ViewRegistry')) return null;
        try {
            const registry = this._context.getService('ViewRegistry');
            return registry.getActive?.() ?? null;
        } catch  {
            return null;
        }
    }
    _getRenderPipeline() {
        if (!this._context.hasService?.('RenderPipeline')) return null;
        try {
            return this._context.getService('RenderPipeline');
        } catch  {
            return null;
        }
    }
    _ensureRenderTarget(width, height) {
        if (!this._renderTarget) {
            this._renderTarget = new __WEBPACK_EXTERNAL_MODULE_three__.WebGLRenderTarget(width, height, {
                minFilter: __WEBPACK_EXTERNAL_MODULE_three__.LinearFilter,
                magFilter: __WEBPACK_EXTERNAL_MODULE_three__.LinearFilter,
                format: __WEBPACK_EXTERNAL_MODULE_three__.RGBAFormat,
                depthBuffer: true,
                stencilBuffer: false
            });
            this._renderTarget.texture.colorSpace = this._context.renderer.outputColorSpace;
            return;
        }
        if (this._renderTarget.width !== width || this._renderTarget.height !== height) this._renderTarget.setSize(width, height);
    }
    _clampReadRect(x, yTop, w, h, totalW, totalH) {
        const maxX = Math.max(0, totalW - w);
        const maxTop = Math.max(0, totalH - h);
        const clampedX = Math.min(Math.max(0, x), maxX);
        const clampedTop = Math.min(Math.max(0, yTop), maxTop);
        const readY = totalH - clampedTop - h;
        return {
            x: clampedX,
            yTop: clampedTop,
            readY,
            w,
            h
        };
    }
    _temporarilyHideObjects(predicate) {
        if (!predicate) return [];
        const hidden = [];
        const scenes = this._collectCandidateScenes();
        for (const scene of scenes)scene.traverse((obj)=>{
            if (!obj.visible) return;
            if (!predicate(obj)) return;
            obj.visible = false;
            hidden.push(obj);
        });
        return hidden;
    }
    _resolveExcludePredicate() {
        const custom = this._options.excludeObjectPredicate;
        if (custom) return custom;
        if (this._options.excludeTextSprite) return (obj)=>obj instanceof __WEBPACK_EXTERNAL_MODULE_three__.Sprite;
        return null;
    }
    _resolveOcclusionExcludePredicate() {
        return this._options.occlusionExcludeObjectPredicate ?? null;
    }
    _collectCandidateScenes() {
        const sg = this._sceneGraph;
        return [
            sg.mainScene,
            sg.overlayScene
        ];
    }
    _drawCrosshair(ctx) {
        const cx = this._radius;
        const cy = this._radius;
        const len = 15;
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx - len, cy);
        ctx.lineTo(cx + len, cy);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, cy - len);
        ctx.lineTo(cx, cy + len);
        ctx.stroke();
        ctx.restore();
    }
    dispose() {
        this.hide();
        this._renderTarget?.dispose();
        this._renderTarget = null;
        if (this._canvas.parentElement) this._canvas.parentElement.removeChild(this._canvas);
    }
}
export { Magnifier };
