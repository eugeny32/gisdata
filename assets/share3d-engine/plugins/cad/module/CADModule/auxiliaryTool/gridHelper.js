import * as __WEBPACK_EXTERNAL_MODULE_inversify__ from "inversify";
import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__renderInvalidation_js_14124a91__ from "../renderInvalidation.js";
import * as __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__ from "../../container/types.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__ from "../../utils/DrawUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_e0d0aed1__ from "../../../../../shared/logging/index.js";
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
}
const GRID_DEPTH_OFFSET = -0.1;
const MIN_VISIBLE_SIZE = 1;
const MAX_GRID_LINES_PER_AXIS = 2000;
const INVALID_RANGE_LOG_INTERVAL_MS = 5000;
const loggerManager = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_e0d0aed1__.getLoggerManager)();
const log = loggerManager.getLogger('cad:grid');
const VIEWPORT_CORNERS = [
    [
        -1,
        -1
    ],
    [
        1,
        -1
    ],
    [
        1,
        1
    ],
    [
        -1,
        1
    ]
];
class GridHelper {
    isEnabled() {
        return this.enabled;
    }
    setEnabled(enabled) {
        if (this.enabled === enabled) return;
        this.enabled = enabled;
        if (this.enabled) {
            this.bindFrameListener();
            this.updateGridAndScale();
            this.renderInvalidator.invalidate('cad.grid.enabled');
        } else {
            this.unbindFrameListener();
            this.lastInvalidRangeLogAt = Number.NEGATIVE_INFINITY;
            if (this.gridObject) {
                __WEBPACK_EXTERNAL_MODULE__utils_DrawUtils_js_cc7b9ecc__.DrawUtils.disposeObject(this.gridObject);
                this.gridObject = null;
            }
            this.renderInvalidator.invalidate('cad.grid.disabled');
        }
    }
    updateGridAndScale() {
        if (!this.enabled) return;
        const rawCam = this.ctx.getService('ViewportCamera').getActiveCamera();
        if (!rawCam.isOrthographicCamera) return;
        const cam = rawCam;
        const plane = this.viewManager.dataManager.plane;
        const basis = getPlaneBasis(plane);
        const bounds = this.getVisibleLocalBounds(cam, basis);
        const visibleLocalWidth = Math.max(bounds.maxX - bounds.minX, MIN_VISIBLE_SIZE);
        const visibleLocalHeight = Math.max(bounds.maxY - bounds.minY, MIN_VISIBLE_SIZE);
        const majorStep = this.getNiceStep(Math.max(visibleLocalWidth, visibleLocalHeight) / 10);
        const minorStep = majorStep / 5;
        const startXIdx = Math.floor(bounds.minX / minorStep) - 1;
        const endXIdx = Math.ceil(bounds.maxX / minorStep) + 1;
        const startYIdx = Math.floor(bounds.minY / minorStep) - 1;
        const endYIdx = Math.ceil(bounds.maxY / minorStep) + 1;
        const xLineCount = endXIdx - startXIdx + 1;
        const yLineCount = endYIdx - startYIdx + 1;
        const hasFiniteRange = Number.isFinite(bounds.minX) && Number.isFinite(bounds.maxX) && Number.isFinite(bounds.minY) && Number.isFinite(bounds.maxY) && Number.isFinite(visibleLocalWidth) && Number.isFinite(visibleLocalHeight) && Number.isFinite(majorStep) && majorStep > 0 && Number.isFinite(minorStep) && minorStep > 0;
        const hasSafeIndices = Number.isSafeInteger(startXIdx) && Number.isSafeInteger(endXIdx) && Number.isSafeInteger(startYIdx) && Number.isSafeInteger(endYIdx) && Number.isSafeInteger(xLineCount) && Number.isSafeInteger(yLineCount);
        const hasSafeLineCounts = xLineCount > 0 && xLineCount <= MAX_GRID_LINES_PER_AXIS && yLineCount > 0 && yLineCount <= MAX_GRID_LINES_PER_AXIS;
        if (!hasFiniteRange || !hasSafeIndices || !hasSafeLineCounts) {
            if (log.isEnabled(__WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_e0d0aed1__.LogLevel.ERROR)) {
                const now = loggerManager.now();
                if (now - this.lastInvalidRangeLogAt >= INVALID_RANGE_LOG_INTERVAL_MS) {
                    let reason = 'excessiveLineCount';
                    if (hasFiniteRange) {
                        if (!hasSafeIndices) reason = 'unsafeIndices';
                    } else reason = 'nonFiniteRange';
                    log.error(`CAD grid skipped reason=${reason} bounds=${bounds.minX},${bounds.maxX},${bounds.minY},${bounds.maxY} lineCounts=${xLineCount},${yLineCount} maxLinesPerAxis=${MAX_GRID_LINES_PER_AXIS}`);
                    this.lastInvalidRangeLogAt = now;
                }
            }
            return;
        }
        const minX = startXIdx * minorStep;
        const maxX = endXIdx * minorStep;
        const minY = startYIdx * minorStep;
        const maxY = endYIdx * minorStep;
        const vertices = [];
        const colors = [];
        const colorMajor = new __WEBPACK_EXTERNAL_MODULE_three__.Color(0x444444);
        const colorMinor = new __WEBPACK_EXTERNAL_MODULE_three__.Color(0x222222);
        for(let i = startXIdx; i <= endXIdx; i++){
            const x = i * minorStep;
            const c = i % 5 === 0 ? colorMajor : colorMinor;
            vertices.push(x, minY, 0, x, maxY, 0);
            colors.push(c.r, c.g, c.b, c.r, c.g, c.b);
        }
        for(let j = startYIdx; j <= endYIdx; j++){
            const y = j * minorStep;
            const c = j % 5 === 0 ? colorMajor : colorMinor;
            vertices.push(minX, y, 0, maxX, y, 0);
            colors.push(c.r, c.g, c.b, c.r, c.g, c.b);
        }
        const geometry = new __WEBPACK_EXTERNAL_MODULE_three__.BufferGeometry();
        geometry.setAttribute('position', new __WEBPACK_EXTERNAL_MODULE_three__.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('color', new __WEBPACK_EXTERNAL_MODULE_three__.Float32BufferAttribute(colors, 3));
        if (this.gridObject) {
            this.gridObject.geometry.dispose();
            this.gridObject.geometry = geometry;
        } else {
            this.gridObject = new __WEBPACK_EXTERNAL_MODULE_three__.LineSegments(geometry, new __WEBPACK_EXTERNAL_MODULE_three__.LineBasicMaterial({
                vertexColors: true,
                depthWrite: false,
                depthTest: false,
                transparent: true,
                opacity: 0.8
            }));
            this.gridObject.frustumCulled = false;
            this.viewManager.attachTempObject(this.gridObject);
        }
        this.updateGridTransform();
    }
    getVisibleLocalBounds(cam, basis) {
        const plane = new __WEBPACK_EXTERNAL_MODULE_three__.Plane().setFromNormalAndCoplanarPoint(basis.zAxis, basis.origin);
        const localPoints = [];
        for (const [ndcX, ndcY] of VIEWPORT_CORNERS){
            const hit = this.intersectCameraRayWithPlane(cam, plane, ndcX, ndcY);
            if (hit) localPoints.push(this.worldToPlaneLocal(hit, basis));
        }
        if (localPoints.length >= 2) return this.getLocalBounds(localPoints);
        return this.getFallbackLocalBounds(cam, plane, basis);
    }
    intersectCameraRayWithPlane(cam, plane, ndcX, ndcY) {
        const nearPoint = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(ndcX, ndcY, -1).unproject(cam);
        const farPoint = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(ndcX, ndcY, 1).unproject(cam);
        const direction = farPoint.sub(nearPoint);
        if (0 === direction.lengthSq()) return null;
        const hit = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        return new __WEBPACK_EXTERNAL_MODULE_three__.Ray(nearPoint, direction.normalize()).intersectPlane(plane, hit);
    }
    getFallbackLocalBounds(cam, plane, basis) {
        const centerHit = this.intersectCameraRayWithPlane(cam, plane, 0, 0);
        const centerWorld = centerHit ?? plane.projectPoint(cam.position, new __WEBPACK_EXTERNAL_MODULE_three__.Vector3());
        const center = this.worldToPlaneLocal(centerWorld, basis);
        const visibleWorldWidth = Math.max(Math.abs((cam.right - cam.left) / cam.zoom), MIN_VISIBLE_SIZE);
        const visibleWorldHeight = Math.max(Math.abs((cam.top - cam.bottom) / cam.zoom), MIN_VISIBLE_SIZE);
        return {
            minX: center.x - visibleWorldWidth / 2,
            maxX: center.x + visibleWorldWidth / 2,
            minY: center.y - visibleWorldHeight / 2,
            maxY: center.y + visibleWorldHeight / 2
        };
    }
    getLocalBounds(points) {
        let minX = 1 / 0;
        let maxX = -1 / 0;
        let minY = 1 / 0;
        let maxY = -1 / 0;
        for (const point of points){
            minX = Math.min(minX, point.x);
            maxX = Math.max(maxX, point.x);
            minY = Math.min(minY, point.y);
            maxY = Math.max(maxY, point.y);
        }
        return {
            minX,
            maxX,
            minY,
            maxY
        };
    }
    worldToPlaneLocal(point, basis) {
        const offset = point.clone().sub(basis.origin);
        return new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(offset.dot(basis.xAxis), offset.dot(basis.yAxis));
    }
    getNiceStep(rawStep) {
        if (!Number.isFinite(rawStep) || rawStep <= 0) return 1;
        const exponent = Math.floor(Math.log10(rawStep));
        const fraction = rawStep / 10 ** exponent;
        const niceFraction = fraction >= 5 ? 5 : fraction >= 2 ? 2 : 1;
        return niceFraction * 10 ** exponent;
    }
    updateGridTransform() {
        if (!this.gridObject) return;
        this.gridObject.quaternion.identity();
        this.gridObject.position.set(0, 0, GRID_DEPTH_OFFSET);
        this.gridObject.updateMatrixWorld(true);
    }
    bindFrameListener() {
        if (this.isFrameListenerBound) return;
        this.ctx.events.on('frame.begin', this.handleFrameBegin);
        this.isFrameListenerBound = true;
    }
    unbindFrameListener() {
        if (!this.isFrameListenerBound) return;
        this.ctx.events.off('frame.begin', this.handleFrameBegin);
        this.isFrameListenerBound = false;
    }
    constructor(){
        this.renderInvalidator = __WEBPACK_EXTERNAL_MODULE__renderInvalidation_js_14124a91__.NOOP_CAD_RENDER_INVALIDATOR;
        this.enabled = false;
        this.gridObject = null;
        this.isFrameListenerBound = false;
        this.lastInvalidRangeLogAt = Number.NEGATIVE_INFINITY;
        this.handleFrameBegin = ()=>{
            this.updateGridAndScale();
        };
    }
}
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.EngineContext),
    _ts_metadata("design:type", "undefined" == typeof EngineContext ? Object : EngineContext)
], GridHelper.prototype, "ctx", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.CADViewManager),
    _ts_metadata("design:type", "undefined" == typeof CADViewManager ? Object : CADViewManager)
], GridHelper.prototype, "viewManager", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.RenderInvalidator),
    _ts_metadata("design:type", "undefined" == typeof CadRenderInvalidator ? Object : CadRenderInvalidator)
], GridHelper.prototype, "renderInvalidator", void 0);
GridHelper = _ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.injectable)()
], GridHelper);
function getPlaneBasis(plane) {
    const { origin, normal, up } = plane;
    const zAxis = normal.clone().normalize();
    const xAxis = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().crossVectors(up, zAxis);
    if (0 === xAxis.lengthSq()) {
        const fallbackUp = Math.abs(zAxis.z) < 0.9 ? new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 1) : new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 1, 0);
        xAxis.crossVectors(fallbackUp, zAxis);
    }
    xAxis.normalize();
    const yAxis = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().crossVectors(zAxis, xAxis).normalize();
    return {
        origin,
        xAxis,
        yAxis,
        zAxis
    };
}
export { GridHelper };
