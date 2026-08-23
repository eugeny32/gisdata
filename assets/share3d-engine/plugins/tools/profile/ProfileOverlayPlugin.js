import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_TextSprite_js_0db73ebd__ from "../shared/TextSprite.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_ToolMaterials_js_f1e409bb__ from "../shared/ToolMaterials.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__ from "../shared/viewScope.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_4a2ea0d6__ from "../../../shared/types/assets.js";
const SPHERE_RADIUS = 0.4;
const SPHERE_SEGMENTS = 10;
const SPHERE_SCREEN_PX = 15;
const BOX_HEIGHT = 0.3;
const BOX_OPACITY = 0.2;
const sharedSphereGeometry = new __WEBPACK_EXTERNAL_MODULE_three__.SphereGeometry(SPHERE_RADIUS, SPHERE_SEGMENTS, SPHERE_SEGMENTS);
function formatLength(meters) {
    return `${meters.toFixed(2)}m`;
}
function midpoint(a, b) {
    return new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().addVectors(a, b).multiplyScalar(0.5);
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
function createSphere() {
    const material = new __WEBPACK_EXTERNAL_MODULE_three__.MeshBasicMaterial({
        color: __WEBPACK_EXTERNAL_MODULE__shared_ToolMaterials_js_f1e409bb__.TOOL_COLOR_PROFILE,
        depthTest: false,
        depthWrite: false
    });
    return new __WEBPACK_EXTERNAL_MODULE_three__.Mesh(sharedSphereGeometry, material);
}
function createConnectionLine(positions) {
    const geometry = new __WEBPACK_EXTERNAL_MODULE_three__.BufferGeometry();
    geometry.setFromPoints(positions);
    const material = (0, __WEBPACK_EXTERNAL_MODULE__shared_ToolMaterials_js_f1e409bb__.createLineMaterial)(__WEBPACK_EXTERNAL_MODULE__shared_ToolMaterials_js_f1e409bb__.TOOL_COLOR_PROFILE);
    return new __WEBPACK_EXTERNAL_MODULE_three__.Line(geometry, material);
}
function createSegmentBox(start, end, width) {
    const length = start.distanceTo(end);
    const geometry = new __WEBPACK_EXTERNAL_MODULE_three__.BoxGeometry(length, BOX_HEIGHT, width);
    const material = new __WEBPACK_EXTERNAL_MODULE_three__.MeshBasicMaterial({
        color: __WEBPACK_EXTERNAL_MODULE__shared_ToolMaterials_js_f1e409bb__.TOOL_COLOR_PROFILE,
        transparent: true,
        opacity: BOX_OPACITY,
        side: __WEBPACK_EXTERNAL_MODULE_three__.DoubleSide,
        depthTest: false,
        depthWrite: false
    });
    const mesh = new __WEBPACK_EXTERNAL_MODULE_three__.Mesh(geometry, material);
    mesh.position.copy(midpoint(start, end));
    const direction = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().subVectors(end, start).normalize();
    const quaternion = new __WEBPACK_EXTERNAL_MODULE_three__.Quaternion();
    quaternion.setFromUnitVectors(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1, 0, 0), direction);
    mesh.quaternion.copy(quaternion);
    return mesh;
}
function computeSphereScale(spherePos, camera, viewportHeight) {
    const distance = camera.position.distanceTo(spherePos);
    if (0 === distance) return 1;
    if (camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.PerspectiveCamera) {
        const fovRad = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.degToRad(camera.fov);
        const worldPerPixel = 2 * distance * Math.tan(fovRad / 2) / viewportHeight;
        const targetWorldSize = SPHERE_SCREEN_PX * worldPerPixel;
        return targetWorldSize / SPHERE_RADIUS;
    }
    if (camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.OrthographicCamera) {
        const orthoHeight = (camera.top - camera.bottom) / camera.zoom;
        const worldPerPixel = orthoHeight / viewportHeight;
        const targetWorldSize = SPHERE_SCREEN_PX * worldPerPixel;
        return targetWorldSize / SPHERE_RADIUS;
    }
    return 1;
}
function buildProfileVisual(result) {
    const group = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
    group.name = `profile-visual-${result.id}`;
    const pts = result.points.map((p)=>p.position);
    if (0 === pts.length) return group;
    for (const pos of pts){
        const sphere = createSphere();
        sphere.position.copy(pos);
        sphere.userData._isProfileSphere = true;
        group.add(sphere);
    }
    if (pts.length >= 2) {
        const line = createConnectionLine(pts);
        group.add(line);
    }
    for(let i = 0; i < pts.length - 1; i++){
        const box = createSegmentBox(pts[i], pts[i + 1], result.width);
        group.add(box);
    }
    if (pts.length >= 2) {
        const label = (0, __WEBPACK_EXTERNAL_MODULE__shared_TextSprite_js_0db73ebd__.createTextSprite)(formatLength(result.length));
        const lastPt = pts[pts.length - 1];
        label.position.copy(lastPt);
        label.position.y += 0.5;
        group.add(label);
    }
    return group;
}
class ProfileOverlayPlugin {
    constructor(){
        this.name = 'profile-overlay';
        this.priority = 55;
        this.dependencies = [
            'ProfileService',
            'RenderPipeline'
        ];
        this.kind = 'profile-overlay';
        this.phases = [
            __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_4a2ea0d6__.RenderPhase.Overlay3D
        ];
        this.renderPriority = 0;
        this.viewRegistry = null;
        this.root = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
        this.overlayScene = new __WEBPACK_EXTERNAL_MODULE_three__.Scene();
        this.visualCache = new Map();
        this.widthSnapshot = new Map();
        this.previewGroup = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
        this.lastPreviewPointCount = 0;
        this.root.name = 'profileOverlayRoot';
        this.previewGroup.name = 'profilePreview';
        this.root.add(this.previewGroup);
    }
    onInit(context) {
        this.context = context;
    }
    onStart() {
        this.profileService = this.context.getService('ProfileService');
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
        this.lastPreviewPointCount = 0;
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
        this.syncPreview();
        this.updateSphereScales(frame.camera, ctx.viewport.height);
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
        const results = this.profileService.getResults();
        const currentIds = new Set();
        for (const result of results){
            currentIds.add(result.id);
            const cachedWidth = this.widthSnapshot.get(result.id);
            if (this.visualCache.has(result.id) && cachedWidth !== result.width) {
                const old = this.visualCache.get(result.id);
                disposeGroup(old);
                this.root.remove(old);
                this.visualCache.delete(result.id);
            }
            if (!this.visualCache.has(result.id)) {
                const visual = buildProfileVisual(result);
                this.visualCache.set(result.id, visual);
                this.widthSnapshot.set(result.id, result.width);
                this.root.add(visual);
            }
        }
        for (const [id, group] of this.visualCache)if (!currentIds.has(id)) {
            disposeGroup(group);
            this.root.remove(group);
            this.visualCache.delete(id);
            this.widthSnapshot.delete(id);
        }
    }
    syncPreview() {
        const currentPoints = this.profileService.getCurrentPoints();
        if (currentPoints.length === this.lastPreviewPointCount && 0 === currentPoints.length) return;
        this.lastPreviewPointCount = currentPoints.length;
        disposeGroup(this.previewGroup);
        if (0 === currentPoints.length) return;
        const positions = currentPoints.map((p)=>p.position);
        for (const pos of positions){
            const sphere = createSphere();
            sphere.position.copy(pos);
            sphere.userData._isProfileSphere = true;
            this.previewGroup.add(sphere);
        }
        if (positions.length >= 2) {
            const line = createConnectionLine(positions);
            this.previewGroup.add(line);
        }
    }
    updateSphereScales(camera, viewportHeight) {
        this.root.traverse((obj)=>{
            if (obj instanceof __WEBPACK_EXTERNAL_MODULE_three__.Mesh && obj.userData._isProfileSphere) {
                const scale = computeSphereScale(obj.position, camera, viewportHeight);
                obj.scale.setScalar(scale);
            }
        });
    }
}
export { ProfileOverlayPlugin };
