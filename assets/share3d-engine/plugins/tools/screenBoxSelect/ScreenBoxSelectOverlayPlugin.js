import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__ from "../shared/viewScope.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_4a2ea0d6__ from "../../../shared/types/assets.js";
const FILL_COLOR = 0x4488ff;
const FILL_OPACITY = 0.15;
const BORDER_COLOR = 0xffffff;
class ScreenBoxSelectOverlayPlugin {
    onInit(context) {
        this.context = context;
    }
    onStart() {
        this.selectService = this.context.getService('ScreenBoxSelectService');
        this.pipeline = this.context.getService('RenderPipeline');
        this.viewRegistry = (0, __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__.getOptionalViewRegistry)(this.context);
        this.pipeline.addRenderContributor(this);
        this.root.name = 'screenBoxSelectOverlayRoot';
        this.resolveOverlayRoot((0, __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__.getActiveViewId)(this.viewRegistry)).add(this.root);
    }
    onDestroy() {
        this.pipeline.removeRenderContributor(this);
        this.disposeOverlayObjects();
        this.fillMaterial.dispose();
        this.borderMaterial.dispose();
        this.root.removeFromParent();
        this.viewRegistry = null;
    }
    render(_frame, _phase, ctx) {
        const activeViewId = (0, __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__.getActiveViewId)(this.viewRegistry);
        if (activeViewId && ctx.viewId !== activeViewId) return;
        const overlayRoot = this.resolveOverlayRoot(activeViewId ?? ctx.viewId);
        if (this.root.parent !== overlayRoot) {
            this.root.parent?.remove(this.root);
            overlayRoot.add(this.root);
        }
        const rect = this.selectService.getCurrentRect();
        if (!rect) {
            if (this.fillMesh) this.disposeOverlayObjects();
            return;
        }
        const viewRect = (0, __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__.getActiveViewRect)(this.viewRegistry) ?? ctx.viewRect;
        const { width, height } = viewRect;
        if (0 === width || 0 === height) return;
        this.overlayCamera.left = 0;
        this.overlayCamera.right = width;
        this.overlayCamera.top = 0;
        this.overlayCamera.bottom = height;
        this.overlayCamera.updateProjectionMatrix();
        const left = Math.min(rect.start.x, rect.end.x) - viewRect.x;
        const top = Math.min(rect.start.y, rect.end.y) - viewRect.y;
        const rectWidth = Math.abs(rect.end.x - rect.start.x);
        const rectHeight = Math.abs(rect.end.y - rect.start.y);
        const cx = left + rectWidth / 2;
        const cy = top + rectHeight / 2;
        this.ensureOverlayObjects();
        if (this.fillMesh) {
            this.fillMesh.scale.set(rectWidth, rectHeight, 1);
            this.fillMesh.position.set(cx, cy, 0);
        }
        if (this.borderLine) {
            const positions = this.borderLine.geometry.getAttribute('position');
            if (positions) {
                positions.setXYZ(0, left, top, 0);
                positions.setXYZ(1, left + rectWidth, top, 0);
                positions.setXYZ(2, left + rectWidth, top + rectHeight, 0);
                positions.setXYZ(3, left, top + rectHeight, 0);
                positions.needsUpdate = true;
            }
        }
        const { renderer } = ctx;
        const savedTarget = renderer.getRenderTarget();
        if (this.root.parent) this.root.parent.remove(this.root);
        this.overlayScene.add(this.root);
        renderer.setRenderTarget(ctx.outputTarget);
        renderer.render(this.overlayScene, this.overlayCamera);
        renderer.setRenderTarget(savedTarget);
        this.overlayScene.remove(this.root);
        overlayRoot.add(this.root);
    }
    ensureOverlayObjects() {
        if (this.fillMesh) return;
        const fillGeometry = new __WEBPACK_EXTERNAL_MODULE_three__.PlaneGeometry(1, 1);
        this.fillMesh = new __WEBPACK_EXTERNAL_MODULE_three__.Mesh(fillGeometry, this.fillMaterial);
        this.root.add(this.fillMesh);
        const borderGeometry = new __WEBPACK_EXTERNAL_MODULE_three__.BufferGeometry();
        const borderPositions = new Float32Array(12);
        borderGeometry.setAttribute('position', new __WEBPACK_EXTERNAL_MODULE_three__.BufferAttribute(borderPositions, 3));
        this.borderLine = new __WEBPACK_EXTERNAL_MODULE_three__.LineLoop(borderGeometry, this.borderMaterial);
        this.root.add(this.borderLine);
    }
    disposeOverlayObjects() {
        if (this.fillMesh) {
            this.fillMesh.geometry.dispose();
            this.root.remove(this.fillMesh);
            this.fillMesh = null;
        }
        if (this.borderLine) {
            this.borderLine.geometry.dispose();
            this.root.remove(this.borderLine);
            this.borderLine = null;
        }
    }
    resolveOverlayRoot(viewId) {
        return (0, __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__.getViewOverlayRoot)(this.context, this.viewRegistry, viewId);
    }
    constructor(){
        this.name = 'screenBoxSelect-overlay';
        this.priority = 56;
        this.dependencies = [
            'ScreenBoxSelectService',
            'RenderPipeline'
        ];
        this.kind = 'screenBoxSelect-overlay';
        this.phases = [
            __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_4a2ea0d6__.RenderPhase.Overlay2D
        ];
        this.renderPriority = 0;
        this.overlayScene = new __WEBPACK_EXTERNAL_MODULE_three__.Scene();
        this.root = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
        this.overlayCamera = new __WEBPACK_EXTERNAL_MODULE_three__.OrthographicCamera(0, 1, 1, 0, -1, 1);
        this.fillMesh = null;
        this.borderLine = null;
        this.fillMaterial = new __WEBPACK_EXTERNAL_MODULE_three__.MeshBasicMaterial({
            color: FILL_COLOR,
            transparent: true,
            opacity: FILL_OPACITY,
            depthTest: false,
            depthWrite: false,
            side: __WEBPACK_EXTERNAL_MODULE_three__.DoubleSide
        });
        this.borderMaterial = new __WEBPACK_EXTERNAL_MODULE_three__.LineBasicMaterial({
            color: BORDER_COLOR,
            depthTest: false,
            depthWrite: false
        });
        this.viewRegistry = null;
    }
}
export { ScreenBoxSelectOverlayPlugin };
