import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_4a2ea0d6__ from "../../../shared/types/assets.js";
const CLICK_TO_WALK_RING_UP = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 1);
const CLICK_TO_WALK_RING_OFFSET_M = 0.025;
const CLICK_TO_WALK_HOVER_RING_RADIUS_M = 0.32;
const CLICK_TO_WALK_TARGET_DISC_RADIUS_M = 0.22;
const DEFAULT_HOVER_COLOR = 0xffffff;
const DEFAULT_TARGET_COLOR = 0xffffff;
const DEFAULT_HOVER_OPACITY = 0.92;
const DEFAULT_TARGET_OPACITY = 0.86;
const DEFAULT_RENDER_PRIORITY = 12;
class SpatialCapsuleClickToWalkIndicators {
    constructor(options){
        this.options = options;
        this.root = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
        this.scene = new __WEBPACK_EXTERNAL_MODULE_three__.Scene();
        this.disposed = false;
        this.pipeline = options.engine.context.hasService('RenderPipeline') ? options.engine.context.getService('RenderPipeline') : null;
        this.root.name = 'spatialCapsuleClickToWalkIndicators';
        this.hoverRing = createClickToWalkRing({
            name: 'spatialCapsuleClickToWalkHoverRing',
            color: options.hoverColor ?? DEFAULT_HOVER_COLOR,
            opacity: options.hoverOpacity ?? DEFAULT_HOVER_OPACITY,
            radius: options.hoverRadius ?? CLICK_TO_WALK_HOVER_RING_RADIUS_M
        });
        this.targetDisc = createClickToWalkDisc({
            name: 'spatialCapsuleClickToWalkTargetDisc',
            color: options.targetColor ?? DEFAULT_TARGET_COLOR,
            opacity: options.targetOpacity ?? DEFAULT_TARGET_OPACITY,
            radius: options.targetRadius ?? CLICK_TO_WALK_TARGET_DISC_RADIUS_M
        });
        this.root.add(this.hoverRing, this.targetDisc);
        this.scene.add(this.root);
        this.renderContributor = {
            kind: 'spatial-capsule-click-to-walk-indicators',
            phases: [
                __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_4a2ea0d6__.RenderPhase.MainOcclusionTested
            ],
            renderPriority: options.renderPriority ?? DEFAULT_RENDER_PRIORITY,
            render: (frame, _phase, renderContext)=>{
                this.render(frame, renderContext);
            }
        };
        this.pipeline?.addRenderContributor(this.renderContributor);
        this.removeSnapshotListener = options.controller.onSnapshotChange((snapshot)=>{
            this.syncSnapshot(snapshot);
        });
    }
    dispose() {
        if (this.disposed) return;
        this.disposed = true;
        this.removeSnapshotListener?.();
        this.pipeline?.removeRenderContributor(this.renderContributor);
        disposeClickToWalkIndicator(this.hoverRing);
        disposeClickToWalkIndicator(this.targetDisc);
        this.root.removeFromParent();
        this.scene.remove(this.root);
    }
    syncSnapshot(snapshot) {
        syncClickToWalkIndicator(this.hoverRing, {
            point: snapshot.available ? snapshot.hoverPoint : null,
            normal: snapshot.hoverNormal
        });
        syncClickToWalkIndicator(this.targetDisc, {
            point: snapshot.active ? snapshot.targetPoint : null,
            normal: snapshot.targetNormal
        });
    }
    render(frame, renderContext) {
        if (!this.hoverRing.visible && !this.targetDisc.visible) return;
        const renderer = renderContext.renderer;
        const savedTarget = renderer.getRenderTarget();
        const savedViewport = 'function' == typeof renderer.getViewport ? renderer.getViewport(new __WEBPACK_EXTERNAL_MODULE_three__.Vector4()) : null;
        const savedScissor = 'function' == typeof renderer.getScissor ? renderer.getScissor(new __WEBPACK_EXTERNAL_MODULE_three__.Vector4()) : null;
        const savedScissorTest = 'function' == typeof renderer.getScissorTest ? renderer.getScissorTest() : false;
        renderer.setRenderTarget(renderContext.outputTarget);
        renderer.setViewport(renderContext.viewport.x, renderContext.viewport.y, renderContext.viewport.width, renderContext.viewport.height);
        renderer.setScissor(renderContext.viewport.x, renderContext.viewport.y, renderContext.viewport.width, renderContext.viewport.height);
        renderer.setScissorTest(true);
        try {
            renderer.render(this.scene, frame.camera);
        } finally{
            if (savedViewport) renderer.setViewport(savedViewport.x, savedViewport.y, savedViewport.z, savedViewport.w);
            if (savedScissor) renderer.setScissor(savedScissor.x, savedScissor.y, savedScissor.z, savedScissor.w);
            renderer.setScissorTest(savedScissorTest);
            renderer.setRenderTarget(savedTarget);
        }
    }
}
function createClickToWalkRing(options) {
    const ring = new __WEBPACK_EXTERNAL_MODULE_three__.Mesh(new __WEBPACK_EXTERNAL_MODULE_three__.RingGeometry(options.radius - 0.04, options.radius, 72), new __WEBPACK_EXTERNAL_MODULE_three__.MeshBasicMaterial({
        color: options.color,
        transparent: true,
        opacity: options.opacity,
        side: __WEBPACK_EXTERNAL_MODULE_three__.DoubleSide,
        depthTest: false,
        depthWrite: false,
        toneMapped: false
    }));
    ring.name = options.name;
    ring.visible = false;
    ring.renderOrder = 30;
    return ring;
}
function createClickToWalkDisc(options) {
    const disc = new __WEBPACK_EXTERNAL_MODULE_three__.Mesh(new __WEBPACK_EXTERNAL_MODULE_three__.CircleGeometry(options.radius, 72), new __WEBPACK_EXTERNAL_MODULE_three__.MeshBasicMaterial({
        color: options.color,
        transparent: true,
        opacity: options.opacity,
        side: __WEBPACK_EXTERNAL_MODULE_three__.DoubleSide,
        depthTest: false,
        depthWrite: false,
        toneMapped: false
    }));
    disc.name = options.name;
    disc.visible = false;
    disc.renderOrder = 30;
    return disc;
}
function syncClickToWalkIndicator(indicator, options) {
    if (!options.point) {
        indicator.visible = false;
        return;
    }
    const normal = normalizeClickToWalkIndicatorNormal(options.normal);
    indicator.position.copy(options.point).addScaledVector(normal, CLICK_TO_WALK_RING_OFFSET_M);
    indicator.quaternion.setFromUnitVectors(CLICK_TO_WALK_RING_UP, normal);
    indicator.visible = true;
}
function normalizeClickToWalkIndicatorNormal(normal) {
    if (!normal || normal.lengthSq() <= Number.EPSILON) return CLICK_TO_WALK_RING_UP.clone();
    return normal.clone().normalize();
}
function disposeClickToWalkIndicator(indicator) {
    indicator.geometry.dispose();
    indicator.material.dispose();
}
export { SpatialCapsuleClickToWalkIndicators };
