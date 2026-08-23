import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_ToolMaterials_js_f1e409bb__ from "../shared/ToolMaterials.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__ from "../shared/viewScope.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__ from "../../../shared/constants/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_4a2ea0d6__ from "../../../shared/types/assets.js";
const WIREFRAME_POSITIONS = new Float32Array([
    -0.5,
    -0.5,
    -0.5,
    0.5,
    -0.5,
    -0.5,
    0.5,
    -0.5,
    -0.5,
    0.5,
    -0.5,
    0.5,
    0.5,
    -0.5,
    0.5,
    -0.5,
    -0.5,
    0.5,
    -0.5,
    -0.5,
    0.5,
    -0.5,
    -0.5,
    -0.5,
    -0.5,
    0.5,
    -0.5,
    0.5,
    0.5,
    -0.5,
    0.5,
    0.5,
    -0.5,
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
    0.5,
    0.5,
    -0.5,
    0.5,
    -0.5,
    -0.5,
    -0.5,
    -0.5,
    -0.5,
    0.5,
    -0.5,
    0.5,
    -0.5,
    -0.5,
    0.5,
    0.5,
    -0.5,
    0.5,
    -0.5,
    0.5,
    0.5,
    0.5,
    0.5,
    -0.5,
    -0.5,
    0.5,
    -0.5,
    0.5,
    0.5
]);
function clonePoints(points) {
    return points.map((point)=>point.clone());
}
function buildRectanglePoints(start, end) {
    return [
        new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(start.x, start.y, 0),
        new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(end.x, start.y, 0),
        new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(end.x, end.y, 0),
        new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(start.x, end.y, 0)
    ];
}
function disposeObjectTree(root) {
    root.traverse((child)=>{
        const renderable = child;
        renderable.geometry?.dispose();
        const materials = Array.isArray(renderable.material) ? renderable.material : renderable.material ? [
            renderable.material
        ] : [];
        for (const material of materials)material.dispose();
    });
    while(root.children.length > 0)root.remove(root.children[0]);
}
function createBoxVisual(matrix, fillOpacity) {
    const group = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
    group.matrixAutoUpdate = false;
    group.matrix.copy(matrix);
    const wireGeometry = new __WEBPACK_EXTERNAL_MODULE_three__.BufferGeometry();
    wireGeometry.setAttribute('position', new __WEBPACK_EXTERNAL_MODULE_three__.BufferAttribute(WIREFRAME_POSITIONS.slice(), 3));
    const wireframe = new __WEBPACK_EXTERNAL_MODULE_three__.LineSegments(wireGeometry, (0, __WEBPACK_EXTERNAL_MODULE__shared_ToolMaterials_js_f1e409bb__.createLineMaterial)(__WEBPACK_EXTERNAL_MODULE__shared_ToolMaterials_js_f1e409bb__.TOOL_COLOR_CLIP));
    group.add(wireframe);
    const fill = new __WEBPACK_EXTERNAL_MODULE_three__.Mesh(new __WEBPACK_EXTERNAL_MODULE_three__.BoxGeometry(1, 1, 1), (0, __WEBPACK_EXTERNAL_MODULE__shared_ToolMaterials_js_f1e409bb__.createFillMaterial)(__WEBPACK_EXTERNAL_MODULE__shared_ToolMaterials_js_f1e409bb__.TOOL_COLOR_CLIP, fillOpacity));
    group.add(fill);
    return group;
}
function createPolygonVisual(vertices, fillOpacity) {
    const group = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
    if (0 === vertices.length) return group;
    if (1 === vertices.length) {
        group.add(createVertexPoints(vertices, 10));
        return group;
    }
    const linePositions = new Float32Array((vertices.length + 1) * 3);
    for(let index = 0; index < vertices.length; index++){
        const point = vertices[index];
        linePositions[3 * index] = point.x;
        linePositions[3 * index + 1] = point.y;
        linePositions[3 * index + 2] = point.z;
    }
    linePositions[3 * vertices.length] = vertices[0].x;
    linePositions[3 * vertices.length + 1] = vertices[0].y;
    linePositions[3 * vertices.length + 2] = vertices[0].z;
    const lineGeometry = new __WEBPACK_EXTERNAL_MODULE_three__.BufferGeometry();
    lineGeometry.setAttribute('position', new __WEBPACK_EXTERNAL_MODULE_three__.BufferAttribute(linePositions, 3));
    group.add(new __WEBPACK_EXTERNAL_MODULE_three__.Line(lineGeometry, (0, __WEBPACK_EXTERNAL_MODULE__shared_ToolMaterials_js_f1e409bb__.createLineMaterial)(__WEBPACK_EXTERNAL_MODULE__shared_ToolMaterials_js_f1e409bb__.TOOL_COLOR_CLIP)));
    group.add(createVertexPoints(vertices, 8));
    if (vertices.length >= 3) {
        const fillPositions = new Float32Array((vertices.length - 2) * 9);
        for(let index = 0; index < vertices.length - 2; index++){
            const base = 9 * index;
            fillPositions[base] = vertices[0].x;
            fillPositions[base + 1] = vertices[0].y;
            fillPositions[base + 2] = vertices[0].z;
            fillPositions[base + 3] = vertices[index + 1].x;
            fillPositions[base + 4] = vertices[index + 1].y;
            fillPositions[base + 5] = vertices[index + 1].z;
            fillPositions[base + 6] = vertices[index + 2].x;
            fillPositions[base + 7] = vertices[index + 2].y;
            fillPositions[base + 8] = vertices[index + 2].z;
        }
        const fillGeometry = new __WEBPACK_EXTERNAL_MODULE_three__.BufferGeometry();
        fillGeometry.setAttribute('position', new __WEBPACK_EXTERNAL_MODULE_three__.BufferAttribute(fillPositions, 3));
        group.add(new __WEBPACK_EXTERNAL_MODULE_three__.Mesh(fillGeometry, (0, __WEBPACK_EXTERNAL_MODULE__shared_ToolMaterials_js_f1e409bb__.createFillMaterial)(__WEBPACK_EXTERNAL_MODULE__shared_ToolMaterials_js_f1e409bb__.TOOL_COLOR_CLIP, fillOpacity)));
    }
    return group;
}
function createOpenPolylineVisual(vertices) {
    const group = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
    if (0 === vertices.length) return group;
    group.add(createVertexPoints(vertices, 8));
    if (vertices.length < 2) return group;
    const positions = new Float32Array(3 * vertices.length);
    for(let index = 0; index < vertices.length; index++){
        const point = vertices[index];
        positions[3 * index] = point.x;
        positions[3 * index + 1] = point.y;
        positions[3 * index + 2] = point.z;
    }
    const geometry = new __WEBPACK_EXTERNAL_MODULE_three__.BufferGeometry();
    geometry.setAttribute('position', new __WEBPACK_EXTERNAL_MODULE_three__.BufferAttribute(positions, 3));
    group.add(new __WEBPACK_EXTERNAL_MODULE_three__.Line(geometry, (0, __WEBPACK_EXTERNAL_MODULE__shared_ToolMaterials_js_f1e409bb__.createLineMaterial)(__WEBPACK_EXTERNAL_MODULE__shared_ToolMaterials_js_f1e409bb__.TOOL_COLOR_CLIP)));
    return group;
}
function createVertexPoints(vertices, size) {
    const geometry = new __WEBPACK_EXTERNAL_MODULE_three__.BufferGeometry();
    const positions = new Float32Array(3 * vertices.length);
    for(let index = 0; index < vertices.length; index++){
        const point = vertices[index];
        positions[3 * index] = point.x;
        positions[3 * index + 1] = point.y;
        positions[3 * index + 2] = point.z;
    }
    geometry.setAttribute('position', new __WEBPACK_EXTERNAL_MODULE_three__.BufferAttribute(positions, 3));
    return new __WEBPACK_EXTERNAL_MODULE_three__.Points(geometry, new __WEBPACK_EXTERNAL_MODULE_three__.PointsMaterial({
        color: __WEBPACK_EXTERNAL_MODULE__shared_ToolMaterials_js_f1e409bb__.TOOL_COLOR_CLIP,
        size,
        sizeAttenuation: false,
        depthTest: false,
        transparent: true,
        opacity: 0.95
    }));
}
function getDraftScreenVertices(selectionMode, points, previewPoint) {
    if ('rectangle' === selectionMode) {
        if (points.length >= 2) return buildRectanglePoints(points[0], points[1]);
        if (1 === points.length && previewPoint) return buildRectanglePoints(points[0], previewPoint);
        return clonePoints(points);
    }
    const vertices = clonePoints(points);
    if (previewPoint && points.length > 0) vertices.push(previewPoint.clone());
    return vertices;
}
class ClipOverlayPlugin {
    constructor(){
        this.name = 'clip-overlay';
        this.priority = 55;
        this.dependencies = [
            'ClipService',
            'RenderPipeline'
        ];
        this.kind = 'clip-overlay';
        this.phases = [
            __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_4a2ea0d6__.RenderPhase.Overlay3D
        ];
        this.renderPriority = 0;
        this.changedSub = null;
        this.viewRegistry = null;
        this.root = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
        this.confirmedRoot = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
        this.helperRoot = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
        this.screenRoot = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
        this.draftRoot = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
        this.overlayScene = new __WEBPACK_EXTERNAL_MODULE_three__.Scene();
        this.screenScene = new __WEBPACK_EXTERNAL_MODULE_three__.Scene();
        this.screenCamera = new __WEBPACK_EXTERNAL_MODULE_three__.OrthographicCamera(-1, 1, 1, -1, -1, 1);
        this.confirmedDirty = true;
        this.confirmedViewId = null;
        this.attachedHelper = null;
        this.root.name = 'clipOverlayRoot';
        this.confirmedRoot.name = 'clipConfirmedRoot';
        this.draftRoot.name = 'clipDraftRoot';
        this.helperRoot.name = 'clipHelperRoot';
        this.screenRoot.name = 'clipScreenRoot';
        this.root.add(this.confirmedRoot, this.helperRoot);
        this.screenRoot.add(this.draftRoot);
    }
    onInit(context) {
        this.context = context;
    }
    onStart() {
        this.clipService = this.context.getService('ClipService');
        this.pipeline = this.context.getService('RenderPipeline');
        this.viewRegistry = (0, __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__.getOptionalViewRegistry)(this.context);
        this.pipeline.addRenderContributor(this);
        this.resolveToolsRoot((0, __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__.getActiveViewId)(this.viewRegistry)).add(this.root);
        this.resolveToolsRoot((0, __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__.getActiveViewId)(this.viewRegistry)).add(this.screenRoot);
        this.changedSub = this.clipService.onChanged(()=>{
            this.confirmedDirty = true;
        });
    }
    onDestroy() {
        this.changedSub?.dispose();
        this.changedSub = null;
        this.pipeline.removeRenderContributor(this);
        this.syncHelper(null);
        disposeObjectTree(this.confirmedRoot);
        disposeObjectTree(this.draftRoot);
        this.root.removeFromParent();
        this.screenRoot.removeFromParent();
        this.confirmedViewId = null;
        this.viewRegistry = null;
    }
    render(frame, phase, ctx) {
        if (phase !== __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_4a2ea0d6__.RenderPhase.Overlay3D) return;
        const activeViewId = (0, __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__.getActiveViewId)(this.viewRegistry);
        const toolsRoot = this.resolveToolsRoot(ctx.viewId);
        if (this.root.parent !== toolsRoot) {
            this.root.parent?.remove(this.root);
            toolsRoot.add(this.root);
        }
        if (this.screenRoot.parent !== toolsRoot) {
            this.screenRoot.parent?.remove(this.screenRoot);
            toolsRoot.add(this.screenRoot);
        }
        if (this.confirmedDirty || this.confirmedViewId !== ctx.viewId) {
            this.rebuildConfirmedVisuals(ctx.viewId);
            this.confirmedDirty = false;
            this.confirmedViewId = ctx.viewId;
        }
        if (activeViewId && ctx.viewId !== activeViewId) {
            disposeObjectTree(this.draftRoot);
            this.syncHelper(null);
        } else {
            this.rebuildDraftVisuals();
            this.syncHelper(this.clipService.isActive ? this.clipService.getBoxGizmoHelper() : null);
        }
        if (0 === this.confirmedRoot.children.length && 0 === this.draftRoot.children.length && 0 === this.helperRoot.children.length) return;
        const { renderer } = ctx;
        const savedTarget = renderer.getRenderTarget();
        renderer.setRenderTarget(ctx.outputTarget);
        renderer.resetState();
        renderer.setViewport(ctx.viewport.x, ctx.viewport.y, ctx.viewport.width, ctx.viewport.height);
        renderer.setScissor(ctx.viewport.x, ctx.viewport.y, ctx.viewport.width, ctx.viewport.height);
        renderer.setScissorTest(true);
        if (this.confirmedRoot.children.length > 0 || this.helperRoot.children.length > 0) {
            this.overlayScene.children.length = 0;
            this.overlayScene.add(this.root);
            renderer.render(this.overlayScene, frame.camera);
        }
        if (this.draftRoot.children.length > 0) {
            this.screenScene.children.length = 0;
            this.screenScene.add(this.screenRoot);
            renderer.render(this.screenScene, this.screenCamera);
        }
        renderer.setRenderTarget(savedTarget);
        toolsRoot.add(this.root);
        toolsRoot.add(this.screenRoot);
    }
    resolveToolsRoot(viewId) {
        return (0, __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__.getViewToolsRoot)(this.context, this.viewRegistry, viewId);
    }
    rebuildConfirmedVisuals(viewId) {
        disposeObjectTree(this.confirmedRoot);
        for (const volume of this.clipService.volumes)if (volume.clipTask !== __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.ClipTask.HIGHLIGHT && 'box' === volume.type && 'box3d' !== volume.selectionMode && (null == volume.viewId || volume.viewId === viewId)) this.confirmedRoot.add(createBoxVisual(volume.matrix, 0.16));
    }
    rebuildDraftVisuals() {
        disposeObjectTree(this.draftRoot);
        if (!this.clipService.isActive) return;
        const draft = this.clipService.getDraftState();
        if ('box3d' === draft.selectionMode) return;
        const screenVertices = getDraftScreenVertices(draft.selectionMode, draft.points, draft.previewPoint);
        if (0 === screenVertices.length && draft.previewPoint) {
            this.draftRoot.add(createVertexPoints([
                draft.previewPoint.clone()
            ], 10));
            return;
        }
        if ('rectangle' === draft.selectionMode && screenVertices.length >= 4) {
            this.draftRoot.add(createPolygonVisual(screenVertices, 0.06));
            return;
        }
        if ('polygon' === draft.selectionMode && screenVertices.length >= 3) {
            this.draftRoot.add(createPolygonVisual(screenVertices, 0.04));
            return;
        }
        this.draftRoot.add(createOpenPolylineVisual(screenVertices));
    }
    syncHelper(nextHelper) {
        if (this.attachedHelper === nextHelper) return;
        if (this.attachedHelper && this.attachedHelper.parent === this.helperRoot) this.helperRoot.remove(this.attachedHelper);
        this.attachedHelper = nextHelper;
        if (nextHelper) this.helperRoot.add(nextHelper);
    }
}
const ClipOverlayPlugin_rslib_entry_ = ClipOverlayPlugin;
export { ClipOverlayPlugin, ClipOverlayPlugin_rslib_entry_ as default };
