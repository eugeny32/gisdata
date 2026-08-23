import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_TextSprite_js_0db73ebd__ from "../shared/TextSprite.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_ToolMaterials_js_f1e409bb__ from "../shared/ToolMaterials.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__ from "../shared/viewScope.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_4a2ea0d6__ from "../../../shared/types/assets.js";
const LABEL_KEY = '_volumeLabel';
const WIREFRAME_POSITIONS = new Float32Array([
    -0.5,
    -0.5,
    0.5,
    0.5,
    -0.5,
    0.5,
    0.5,
    -0.5,
    0.5,
    0.5,
    -0.5,
    -0.5,
    0.5,
    -0.5,
    -0.5,
    -0.5,
    -0.5,
    -0.5,
    -0.5,
    -0.5,
    -0.5,
    -0.5,
    -0.5,
    0.5,
    -0.5,
    0.5,
    0.5,
    0.5,
    0.5,
    0.5,
    0.5,
    0.5,
    0.5,
    0.5,
    0.5,
    -0.5,
    0.5,
    0.5,
    -0.5,
    -0.5,
    0.5,
    -0.5,
    -0.5,
    0.5,
    -0.5,
    -0.5,
    0.5,
    0.5,
    -0.5,
    -0.5,
    0.5,
    -0.5,
    0.5,
    0.5,
    0.5,
    -0.5,
    0.5,
    0.5,
    0.5,
    0.5,
    0.5,
    -0.5,
    -0.5,
    0.5,
    0.5,
    -0.5,
    -0.5,
    -0.5,
    -0.5,
    -0.5,
    0.5,
    -0.5
]);
function formatVolume(cubicMeters) {
    return `${cubicMeters.toFixed(2)} m\u00B3`;
}
function disposeGroup(group) {
    group.traverse((obj)=>{
        if (obj instanceof __WEBPACK_EXTERNAL_MODULE_three__.Sprite) {
            (0, __WEBPACK_EXTERNAL_MODULE__shared_TextSprite_js_0db73ebd__.disposeTextSprite)(obj);
            return;
        }
        const meshLike = obj;
        if (meshLike.geometry) meshLike.geometry.dispose();
        if (meshLike.material) {
            const materials = Array.isArray(meshLike.material) ? meshLike.material : [
                meshLike.material
            ];
            for (const mat of materials)mat.dispose();
        }
    });
    while(group.children.length > 0)group.remove(group.children[0]);
}
function createWireframeBox() {
    const geometry = new __WEBPACK_EXTERNAL_MODULE_three__.BufferGeometry();
    geometry.setAttribute('position', new __WEBPACK_EXTERNAL_MODULE_three__.BufferAttribute(WIREFRAME_POSITIONS.slice(), 3));
    const material = (0, __WEBPACK_EXTERNAL_MODULE__shared_ToolMaterials_js_f1e409bb__.createLineMaterial)(__WEBPACK_EXTERNAL_MODULE__shared_ToolMaterials_js_f1e409bb__.TOOL_COLOR_VOLUME);
    return new __WEBPACK_EXTERNAL_MODULE_three__.LineSegments(geometry, material);
}
function createFillBox() {
    const geometry = new __WEBPACK_EXTERNAL_MODULE_three__.BoxGeometry(1, 1, 1);
    const material = (0, __WEBPACK_EXTERNAL_MODULE__shared_ToolMaterials_js_f1e409bb__.createFillMaterial)(__WEBPACK_EXTERNAL_MODULE__shared_ToolMaterials_js_f1e409bb__.TOOL_COLOR_VOLUME, 0.3);
    return new __WEBPACK_EXTERNAL_MODULE_three__.Mesh(geometry, material);
}
function createVolumeVisual(result) {
    const group = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
    group.name = `volume-${result.id}`;
    group.add(createWireframeBox());
    group.add(createFillBox());
    const volumeText = null !== result.computedVolume ? formatVolume(result.computedVolume) : '-- m\u00B3';
    const label = (0, __WEBPACK_EXTERNAL_MODULE__shared_TextSprite_js_0db73ebd__.createTextSprite)(volumeText);
    label.position.set(0, 0.5, 0);
    group.add(label);
    group.userData[LABEL_KEY] = label;
    group.matrixAutoUpdate = false;
    group.matrix.copy(result.matrix);
    return group;
}
function createDragPreview(matrix) {
    const group = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
    group.name = 'volumeDragPreview';
    group.add(createWireframeBox());
    group.add(createFillBox());
    group.matrixAutoUpdate = false;
    group.matrix.copy(matrix);
    return group;
}
class VolumeOverlayPlugin {
    constructor(){
        this.name = 'volume-overlay';
        this.priority = 55;
        this.dependencies = [
            'VolumeService',
            'RenderPipeline'
        ];
        this.kind = 'volume-overlay';
        this.phases = [
            __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_4a2ea0d6__.RenderPhase.Overlay3D
        ];
        this.renderPriority = 0;
        this.viewRegistry = null;
        this.root = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
        this.overlayScene = new __WEBPACK_EXTERNAL_MODULE_three__.Scene();
        this.visualCache = new Map();
        this.previewGroup = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
        this.hadDragLastFrame = false;
        this.root.name = 'volumeOverlayRoot';
        this.previewGroup.name = 'volumePreview';
        this.root.add(this.previewGroup);
    }
    onInit(context) {
        this.context = context;
    }
    onStart() {
        this.volumeService = this.context.getService('VolumeService');
        this.pipeline = this.context.getService('RenderPipeline');
        this.viewRegistry = (0, __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__.getOptionalViewRegistry)(this.context);
        this.pipeline.addRenderContributor(this);
        this.resolveToolsRoot((0, __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__.getActiveViewId)(this.viewRegistry)).add(this.root);
    }
    onDestroy() {
        this.pipeline.removeRenderContributor(this);
        for (const [, group] of this.visualCache)disposeGroup(group);
        this.visualCache.clear();
        disposeGroup(this.previewGroup);
        this.hadDragLastFrame = false;
        if (this.root.parent) this.root.parent.remove(this.root);
        this.viewRegistry = null;
    }
    render(frame, _phase, ctx) {
        const activeViewId = (0, __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__.getActiveViewId)(this.viewRegistry);
        if (activeViewId && ctx.viewId !== activeViewId) return;
        const toolsRoot = this.resolveToolsRoot(activeViewId ?? ctx.viewId);
        if (this.root.parent !== toolsRoot) {
            this.root.parent?.remove(this.root);
            toolsRoot.add(this.root);
        }
        this.syncResultVisuals();
        this.syncDragPreview();
        if (0 === this.root.children.length) return;
        const { renderer } = ctx;
        this.overlayScene.children.length = 0;
        this.overlayScene.add(this.root);
        const savedTarget = renderer.getRenderTarget();
        renderer.setRenderTarget(ctx.outputTarget);
        renderer.resetState();
        renderer.render(this.overlayScene, frame.camera);
        renderer.setRenderTarget(savedTarget);
        toolsRoot.add(this.root);
    }
    resolveToolsRoot(viewId) {
        return (0, __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__.getViewToolsRoot)(this.context, this.viewRegistry, viewId);
    }
    syncResultVisuals() {
        const results = this.volumeService.getResults();
        const currentIds = new Set();
        for (const result of results){
            currentIds.add(result.id);
            if (!this.visualCache.has(result.id)) {
                const visual = createVolumeVisual(result);
                this.visualCache.set(result.id, visual);
                this.root.add(visual);
            }
        }
        for (const [id, group] of this.visualCache)if (!currentIds.has(id)) {
            disposeGroup(group);
            this.root.remove(group);
            this.visualCache.delete(id);
        }
    }
    syncDragPreview() {
        const drag = this.volumeService.getCurrentDrag();
        if (!drag) {
            if (this.hadDragLastFrame) {
                disposeGroup(this.previewGroup);
                this.hadDragLastFrame = false;
            }
            return;
        }
        disposeGroup(this.previewGroup);
        const preview = createDragPreview(drag.matrix);
        while(preview.children.length > 0){
            const child = preview.children[0];
            preview.remove(child);
            this.previewGroup.add(child);
        }
        this.previewGroup.matrixAutoUpdate = false;
        this.previewGroup.matrix.copy(drag.matrix);
        this.hadDragLastFrame = true;
    }
}
const VolumeOverlayPlugin_rslib_entry_ = VolumeOverlayPlugin;
export { VolumeOverlayPlugin, VolumeOverlayPlugin_rslib_entry_ as default };
