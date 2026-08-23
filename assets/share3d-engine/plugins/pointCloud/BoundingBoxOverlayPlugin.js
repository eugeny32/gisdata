import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_c632c149__ from "../../shared/types/assets.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_utils_Box3Helper_js_0b9a952d__ from "../../shared/utils/Box3Helper.js";
const BBOX_HIGHLIGHT_COLOR = 0x0a65b9;
const DEFAULT_DYNAMIC_HIGHLIGHT_KIND = 'pointCloud';
const BOX_EDGE_VERTEX_INDICES = [
    0,
    1,
    1,
    2,
    2,
    3,
    3,
    0,
    4,
    5,
    5,
    6,
    6,
    7,
    7,
    4,
    0,
    4,
    1,
    5,
    2,
    6,
    3,
    7
];
function isFiniteBox(box) {
    const { min, max } = box;
    return Number.isFinite(min.x) && Number.isFinite(min.y) && Number.isFinite(min.z) && Number.isFinite(max.x) && Number.isFinite(max.y) && Number.isFinite(max.z);
}
class BoundingBoxOverlayPlugin {
    onInit(context) {
        this.context = context;
    }
    onStart() {
        this.pipeline = this.context.getService('RenderPipeline');
        this.pipeline.addRenderContributor(this);
    }
    onDestroy() {
        this.pipeline.removeRenderContributor(this);
        this.clearHelpers();
    }
    setHighlightedIds(entries) {
        this.dynamicLineStyles.clear();
        const normalizedEntries = new Map();
        for (const entry of entries){
            const normalized = this.normalizeDynamicEntry(entry);
            normalizedEntries.set(this.makeDynamicHelperKey(normalized.kind, normalized.id), normalized);
        }
        this.highlightedEntries = Array.from(normalizedEntries.values());
        for (const entry of this.highlightedEntries)this.dynamicLineStyles.set(this.makeDynamicHelperKey(entry.kind, entry.id), entry.lineStyle);
        this.syncedFrame = -1;
        const highlightedHelperKeys = new Set(this.highlightedEntries.map((entry)=>this.makeDynamicHelperKey(entry.kind, entry.id)));
        for (const [id, helper] of this.dynamicHelpers)if (!highlightedHelperKeys.has(id)) {
            this.overlayScene.remove(helper);
            this.disposeHelper(helper);
            this.dynamicHelpers.delete(id);
        }
    }
    setStaticBoxes(entries) {
        const incoming = new Set(entries.map((entry)=>entry.id));
        for (const [id, helper] of this.staticHelpers)if (!incoming.has(id)) {
            this.overlayScene.remove(helper);
            this.disposeHelper(helper);
            this.staticHelpers.delete(id);
            this.staticBounds.delete(id);
        }
        for (const entry of entries){
            const box = new __WEBPACK_EXTERNAL_MODULE_three__.Box3(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(entry.min[0], entry.min[1], entry.min[2]), new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(entry.max[0], entry.max[1], entry.max[2]));
            if (box.isEmpty() || !isFiniteBox(box)) {
                const existing = this.staticHelpers.get(entry.id);
                if (existing) {
                    this.overlayScene.remove(existing);
                    this.disposeHelper(existing);
                    this.staticHelpers.delete(entry.id);
                }
                this.staticBounds.delete(entry.id);
                continue;
            }
            this.staticBounds.set(entry.id, box.clone());
            const existing = this.staticHelpers.get(entry.id);
            if (existing) {
                this.updateHelperGeometry(existing, box);
                this.applyHelperLineStyle(existing, entry.lineStyle ?? 'solid');
                existing.visible = true;
            } else {
                const created = new __WEBPACK_EXTERNAL_MODULE__shared_utils_Box3Helper_js_0b9a952d__.Box3Helper(box, BBOX_HIGHLIGHT_COLOR);
                created.name = `staticBoundingBoxHelper:${entry.id}`;
                created.frustumCulled = false;
                this.applyHelperLineStyle(created, entry.lineStyle ?? 'solid');
                this.staticHelpers.set(entry.id, created);
                this.overlayScene.add(created);
            }
        }
    }
    getCameraClipBounds(_context) {
        const result = new __WEBPACK_EXTERNAL_MODULE_three__.Box3();
        for (const entry of this.highlightedEntries){
            const box = this.context.sceneBounds.getWorldBoundingBox({
                ids: [
                    entry.id
                ],
                kinds: [
                    entry.kind
                ],
                includeInvisible: true,
                purpose: 'fit'
            });
            if (!box.isEmpty() && isFiniteBox(box)) result.union(box);
        }
        for (const box of this.staticBounds.values())result.union(box);
        return result;
    }
    render(frame, _phase, ctx) {
        if (null !== ctx.outputTarget) return;
        if (0 === this.highlightedEntries.length && 0 === this.dynamicHelpers.size && 0 === this.staticHelpers.size) return;
        this.syncHelpers(frame.frameNumber);
        if (0 === this.dynamicHelpers.size && 0 === this.staticHelpers.size) return;
        const { renderer } = ctx;
        const savedTarget = renderer.getRenderTarget();
        const savedCameraLayerMask = frame.camera.layers.mask;
        const savedViewport = renderer.getViewport(new __WEBPACK_EXTERNAL_MODULE_three__.Vector4());
        const savedScissor = renderer.getScissor(new __WEBPACK_EXTERNAL_MODULE_three__.Vector4());
        const savedScissorTest = renderer.getScissorTest();
        try {
            renderer.setRenderTarget(ctx.outputTarget);
            renderer.resetState();
            frame.camera.layers.mask = 0xffffffff;
            renderer.setViewport(ctx.viewport.x, ctx.viewport.y, ctx.viewport.width, ctx.viewport.height);
            renderer.setScissor(ctx.viewport.x, ctx.viewport.y, ctx.viewport.width, ctx.viewport.height);
            renderer.setScissorTest(true);
            renderer.render(this.overlayScene, frame.camera);
        } finally{
            frame.camera.layers.mask = savedCameraLayerMask;
            renderer.setRenderTarget(savedTarget);
            renderer.setViewport(savedViewport.x, savedViewport.y, savedViewport.z, savedViewport.w);
            renderer.setScissor(savedScissor.x, savedScissor.y, savedScissor.z, savedScissor.w);
            renderer.setScissorTest(savedScissorTest);
        }
    }
    syncHelpers(frameNumber) {
        if (frameNumber === this.syncedFrame) return;
        this.syncedFrame = frameNumber;
        for (const entry of this.highlightedEntries){
            const helperKey = this.makeDynamicHelperKey(entry.kind, entry.id);
            const box = this.context.sceneBounds.getWorldBoundingBox({
                ids: [
                    entry.id
                ],
                kinds: [
                    entry.kind
                ],
                includeInvisible: true,
                purpose: 'fit'
            });
            const helper = this.dynamicHelpers.get(helperKey);
            if (!box || box.isEmpty()) {
                if (helper) helper.visible = false;
                continue;
            }
            if (helper) {
                this.updateHelperGeometry(helper, box);
                this.applyHelperLineStyle(helper, this.dynamicLineStyles.get(helperKey) ?? 'solid');
                helper.visible = true;
            } else {
                const created = new __WEBPACK_EXTERNAL_MODULE__shared_utils_Box3Helper_js_0b9a952d__.Box3Helper(box, BBOX_HIGHLIGHT_COLOR);
                created.name = `boundingBoxHelper:${helperKey}`;
                created.frustumCulled = false;
                this.applyHelperLineStyle(created, this.dynamicLineStyles.get(helperKey) ?? 'solid');
                this.dynamicHelpers.set(helperKey, created);
                this.overlayScene.add(created);
            }
        }
    }
    normalizeDynamicEntry(entry) {
        if ('string' == typeof entry) return {
            id: entry,
            kind: DEFAULT_DYNAMIC_HIGHLIGHT_KIND,
            lineStyle: 'solid'
        };
        return {
            id: entry.id,
            kind: entry.kind ?? DEFAULT_DYNAMIC_HIGHLIGHT_KIND,
            lineStyle: entry.lineStyle ?? 'solid'
        };
    }
    makeDynamicHelperKey(kind, id) {
        return `${kind}:${id}`;
    }
    getDashSize(helper) {
        helper.geometry.computeBoundingSphere();
        const radius = helper.geometry.boundingSphere?.radius;
        if (!Number.isFinite(radius) || !radius || radius <= 0) return 1;
        return Math.max(radius / 40, 0.1);
    }
    replaceHelperMaterial(helper, material) {
        const oldMaterial = helper.material;
        helper.material = material;
        if (Array.isArray(oldMaterial)) oldMaterial.forEach((m)=>m.dispose());
        else oldMaterial.dispose();
    }
    applyHelperLineStyle(helper, lineStyle) {
        if ('dashed' === lineStyle) {
            const dashSize = this.getDashSize(helper);
            this.ensureNonIndexedLineSegments(helper);
            if (helper.material instanceof __WEBPACK_EXTERNAL_MODULE_three__.LineDashedMaterial) {
                helper.material.dashSize = dashSize;
                helper.material.gapSize = 0.75 * dashSize;
            } else this.replaceHelperMaterial(helper, new __WEBPACK_EXTERNAL_MODULE_three__.LineDashedMaterial({
                color: BBOX_HIGHLIGHT_COLOR,
                dashSize,
                gapSize: 0.75 * dashSize
            }));
            helper.computeLineDistances();
            return;
        }
        if (helper.material instanceof __WEBPACK_EXTERNAL_MODULE_three__.LineDashedMaterial || !(helper.material instanceof __WEBPACK_EXTERNAL_MODULE_three__.LineBasicMaterial)) this.replaceHelperMaterial(helper, new __WEBPACK_EXTERNAL_MODULE_three__.LineBasicMaterial({
            color: BBOX_HIGHLIGHT_COLOR
        }));
    }
    ensureNonIndexedLineSegments(helper) {
        const position = helper.geometry.getAttribute('position');
        if (!helper.geometry.index && position?.count === BOX_EDGE_VERTEX_INDICES.length) return;
        const box = new __WEBPACK_EXTERNAL_MODULE_three__.Box3().setFromBufferAttribute(position);
        const geometry = new __WEBPACK_EXTERNAL_MODULE_three__.BufferGeometry();
        geometry.setAttribute('position', new __WEBPACK_EXTERNAL_MODULE_three__.BufferAttribute(this.createLineSegmentPositions(box), 3));
        helper.geometry.dispose();
        helper.geometry = geometry;
    }
    createLineSegmentPositions(box) {
        const { min, max } = box;
        const vertices = [
            [
                min.x,
                min.y,
                min.z
            ],
            [
                max.x,
                min.y,
                min.z
            ],
            [
                max.x,
                min.y,
                max.z
            ],
            [
                min.x,
                min.y,
                max.z
            ],
            [
                min.x,
                max.y,
                min.z
            ],
            [
                max.x,
                max.y,
                min.z
            ],
            [
                max.x,
                max.y,
                max.z
            ],
            [
                min.x,
                max.y,
                max.z
            ]
        ];
        const positions = new Float32Array(3 * BOX_EDGE_VERTEX_INDICES.length);
        BOX_EDGE_VERTEX_INDICES.forEach((vertexIndex, index)=>{
            const vertex = vertices[vertexIndex];
            positions[3 * index] = vertex[0];
            positions[3 * index + 1] = vertex[1];
            positions[3 * index + 2] = vertex[2];
        });
        return positions;
    }
    updateHelperGeometry(helper, box) {
        const position = helper.geometry.getAttribute('position');
        if (!helper.geometry.index && position.count === BOX_EDGE_VERTEX_INDICES.length) {
            position.copyArray(this.createLineSegmentPositions(box));
            position.needsUpdate = true;
            helper.geometry.computeBoundingSphere();
            return;
        }
        const { min, max } = box;
        position.setXYZ(0, min.x, min.y, min.z);
        position.setXYZ(1, max.x, min.y, min.z);
        position.setXYZ(2, max.x, min.y, max.z);
        position.setXYZ(3, min.x, min.y, max.z);
        position.setXYZ(4, min.x, max.y, min.z);
        position.setXYZ(5, max.x, max.y, min.z);
        position.setXYZ(6, max.x, max.y, max.z);
        position.setXYZ(7, min.x, max.y, max.z);
        position.needsUpdate = true;
        helper.geometry.computeBoundingSphere();
    }
    clearHelpers() {
        for (const [, helper] of this.dynamicHelpers){
            this.overlayScene.remove(helper);
            this.disposeHelper(helper);
        }
        this.dynamicHelpers.clear();
        for (const [, helper] of this.staticHelpers){
            this.overlayScene.remove(helper);
            this.disposeHelper(helper);
        }
        this.staticHelpers.clear();
        this.staticBounds.clear();
        this.highlightedEntries = [];
        this.dynamicLineStyles.clear();
        this.syncedFrame = -1;
    }
    disposeHelper(helper) {
        helper.geometry.dispose();
        const material = helper.material;
        if (Array.isArray(material)) material.forEach((m)=>m.dispose());
        else material.dispose();
    }
    constructor(){
        this.name = 'boundingBoxOverlay';
        this.priority = 56;
        this.dependencies = [
            'RenderPipeline'
        ];
        this.kind = 'bounding-box-overlay';
        this.phases = [
            __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_c632c149__.RenderPhase.Overlay3D
        ];
        this.renderPriority = 0;
        this.overlayScene = new __WEBPACK_EXTERNAL_MODULE_three__.Scene();
        this.dynamicHelpers = new Map();
        this.staticHelpers = new Map();
        this.staticBounds = new Map();
        this.highlightedEntries = [];
        this.dynamicLineStyles = new Map();
        this.syncedFrame = -1;
    }
}
export { BoundingBoxOverlayPlugin };
