import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
const DEFAULT_CAPTURE_RADIUS_PX = 14;
const SCREEN_EPSILON = 1e-6;
const MEASURE_MOVE_GPU_PICK_WINDOW = 3;
const MEASURE_CLICK_GPU_PICK_WINDOW = 5;
const DEFAULT_CAD_SNAP_TYPES = [
    'endpoint',
    'midpoint',
    'intersection',
    'perpendicular',
    'keypoint'
];
class MeasureSnapService {
    constructor(context, pickingService){
        this.context = context;
        this.pickingService = pickingService;
        this.captureEnabled = false;
        this.pointCloudCaptureEnabled = false;
        this.cadCaptureEnabled = true;
        this.orthogonalEnabled = false;
        this.enabledCadSnapTypes = new Set(DEFAULT_CAD_SNAP_TYPES);
    }
    setCaptureEnabled(enabled) {
        this.captureEnabled = enabled;
    }
    isCaptureEnabled() {
        return this.captureEnabled;
    }
    setPointCloudCaptureEnabled(enabled) {
        this.pointCloudCaptureEnabled = enabled;
    }
    isPointCloudCaptureEnabled() {
        return this.pointCloudCaptureEnabled;
    }
    setCadCaptureEnabled(enabled) {
        this.cadCaptureEnabled = enabled;
    }
    isCadCaptureEnabled() {
        return this.cadCaptureEnabled;
    }
    setOrthogonalEnabled(enabled) {
        this.orthogonalEnabled = enabled;
    }
    isOrthogonalEnabled() {
        return this.orthogonalEnabled;
    }
    setCaptureConfig(config) {
        if (void 0 === config.enabledTypes) return;
        const enabledCadSnapTypes = new Set();
        for (const type of config.enabledTypes)if (this.isCadSnapType(type)) enabledCadSnapTypes.add(type);
        this.enabledCadSnapTypes = enabledCadSnapTypes;
    }
    resolvePoint(options) {
        const candidates = this.captureEnabled ? [
            ...this.pointCloudCaptureEnabled ? this.collectPointCloudCandidates(options) : [],
            ...this.cadCaptureEnabled ? this.collectCadCandidates(options) : []
        ] : [];
        if (0 === candidates.length) {
            if (!this.captureEnabled && 'move' === options.interactionType && !options.startPoint && !options.allowMoveWithoutStartPoint) {
                this.prewarmGsplatGpuPick(options);
                return null;
            }
            const defaultPoint = this.pickDefaultPoint(options);
            if (defaultPoint) return defaultPoint;
            return null;
        }
        const sorted = candidates.sort((a, b)=>{
            if (Math.abs(a.screenDistance - b.screenDistance) > SCREEN_EPSILON) return a.screenDistance - b.screenDistance;
            if (a.kind !== b.kind) return 'cad' === a.kind ? -1 : 1;
            return this.getSnapPriority(a.snapType) - this.getSnapPriority(b.snapType);
        });
        const winner = sorted[0];
        if ('cad' === winner.kind) return {
            ...winner
        };
        const point = this.applyOrthogonalConstraint(winner.point, options.startPoint);
        return {
            ...winner,
            point
        };
    }
    pickDefaultPoint(options) {
        const spatial = this.getSpatialQueryService();
        const spatialPoint = this.pickSpatialPoint(options, spatial);
        if (spatialPoint) return spatialPoint;
        if ('move' === options.interactionType && spatial && !options.startPoint && !options.allowMoveWithoutStartPoint) return null;
        const results = this.pickingService.pickAtScreen(options.screen, options.camera, this.buildPickingQuery(options));
        const hit = results[0];
        if (!hit) return null;
        const point = this.applyOrthogonalConstraint(hit.point, options.startPoint);
        return {
            point,
            kind: hit.kind,
            snapType: 'pointCloud' === hit.kind ? 'pointCloud' : 'keypoint',
            screenDistance: this.getScreenDistance(point, options.screen, options.camera, options.viewRect),
            isCaptureHit: false,
            entityId: hit.entityId,
            assetId: hit.assetId
        };
    }
    pickSpatialPoint(options, spatial = this.getSpatialQueryService()) {
        if (!spatial) return null;
        const hit = spatial.raycastSurfaceAtScreen({
            surfaceUsage: 'measurement',
            camera: options.camera,
            screen: options.screen,
            viewId: options.viewId ?? void 0,
            viewRect: options.viewRect ?? void 0
        });
        if (!hit) return null;
        const point = this.applyOrthogonalConstraint(hit.point, options.startPoint);
        return {
            point,
            kind: hit.ownerKind ?? 'gaussian-splat',
            snapType: 'pointCloud',
            screenDistance: this.getScreenDistance(point, options.screen, options.camera, options.viewRect),
            isCaptureHit: false,
            assetId: hit.ownerAssetId
        };
    }
    collectPointCloudCandidates(options) {
        const spatial = this.getSpatialQueryService();
        const spatialPoint = this.pickSpatialPoint(options, spatial);
        if (spatialPoint) return [
            {
                ...spatialPoint,
                isCaptureHit: true
            }
        ];
        if ('move' === options.interactionType && spatial && !options.startPoint && !options.allowMoveWithoutStartPoint) return [];
        const results = this.pickingService.pickAtScreen(options.screen, options.camera, {
            ...this.buildPickingQuery(options),
            kinds: [
                'pointCloud',
                'gaussian-splat'
            ]
        });
        return results.slice(0, 1).map((hit)=>({
                point: hit.point.clone(),
                kind: hit.kind,
                snapType: 'pointCloud',
                screenDistance: this.getScreenDistance(hit.point, options.screen, options.camera, options.viewRect),
                isCaptureHit: true,
                assetId: hit.assetId,
                entityId: hit.entityId
            }));
    }
    collectCadCandidates(options) {
        const handles = this.getVisibleCadHandles();
        if (0 === handles.length) return [];
        return handles.flatMap((handle)=>{
            const vectorCandidates = this.getCadVectorCandidates(handle, options.screen, options.camera, options.viewRect);
            return vectorCandidates.map((candidate)=>({
                    point: candidate.point,
                    kind: 'cad',
                    snapType: candidate.snapType,
                    screenDistance: this.getScreenDistance(candidate.point, options.screen, options.camera, options.viewRect),
                    isCaptureHit: true,
                    assetId: handle.id,
                    entityId: candidate.entityId
                }));
        });
    }
    getCadVectorCandidates(handle, screen, camera, viewRect) {
        const visibleLayerIds = new Set(handle.dataManager.layers.filter((layer)=>layer.visible).map((layer)=>layer.id));
        const captureRadiusPx = DEFAULT_CAPTURE_RADIUS_PX;
        const candidates = [];
        const nearbyLines = [];
        for (const entity of handle.dataManager.entities){
            if (!entity || 'function' != typeof entity.getCaptureData) continue;
            if (entity.layerId && visibleLayerIds.size > 0 && !visibleLayerIds.has(entity.layerId)) continue;
            const captureData = entity.getCaptureData();
            const pushPoints = (points, snapType)=>{
                if (!this.isCadSnapTypeEnabled(snapType)) return;
                for (const point of points ?? []){
                    const candidate = this.localCadPointToWorld(handle, point);
                    const distance = this.getScreenDistance(candidate, screen, camera, viewRect);
                    if (distance <= captureRadiusPx) candidates.push({
                        point: candidate,
                        snapType,
                        entityId: entity.id
                    });
                }
            };
            pushPoints(captureData.endPoints, 'endpoint');
            pushPoints(captureData.midPoints, 'midpoint');
            pushPoints(captureData.nodePoints, 'keypoint');
            pushPoints(captureData.centerPoints, 'keypoint');
            if (this.isCadSnapTypeEnabled('intersection') || this.isCadSnapTypeEnabled('perpendicular')) for (const line of captureData.lines ?? []){
                const distance = this.getScreenDistanceToLine(line, handle, screen, camera, viewRect);
                if (distance <= 1.5 * captureRadiusPx) nearbyLines.push({
                    line,
                    entityId: entity.id
                });
            }
        }
        if (this.isCadSnapTypeEnabled('intersection')) {
            const intersections = this.getIntersectionCandidates(nearbyLines, handle, screen, camera, viewRect);
            candidates.push(...intersections);
        }
        if (this.isCadSnapTypeEnabled('perpendicular')) {
            const mouseLocal = this.unprojectToCadLocalPoint(handle, screen, camera, viewRect);
            if (!mouseLocal) return this.dedupeCandidates(candidates);
            const perpendiculars = this.getPerpendicularCandidates(nearbyLines, handle, mouseLocal, screen, camera, viewRect);
            candidates.push(...perpendiculars);
        }
        return this.dedupeCandidates(candidates);
    }
    getIntersectionCandidates(lines, handle, screen, camera, viewRect) {
        const captureRadiusPx = DEFAULT_CAPTURE_RADIUS_PX;
        const intersections = [];
        for(let i = 0; i < lines.length; i += 1)for(let j = i + 1; j < lines.length; j += 1){
            const intersection = this.getSegmentIntersection(lines[i].line, lines[j].line);
            if (!intersection) continue;
            const point = this.localCadPointToWorld(handle, intersection);
            const distance = this.getScreenDistance(point, screen, camera, viewRect);
            if (distance <= captureRadiusPx) intersections.push({
                point,
                snapType: 'intersection',
                entityId: lines[i].entityId ?? lines[j].entityId
            });
        }
        return intersections;
    }
    getPerpendicularCandidates(lines, handle, mouseLocal, screen, camera, viewRect) {
        const captureRadiusPx = DEFAULT_CAPTURE_RADIUS_PX;
        const perpendiculars = [];
        for (const { line, entityId } of lines){
            const foot = this.getPerpendicularFoot(mouseLocal, line);
            if (!foot) continue;
            const point3d = this.localCadPointToWorld(handle, foot);
            const distance = this.getScreenDistance(point3d, screen, camera, viewRect);
            if (distance <= captureRadiusPx) perpendiculars.push({
                point: point3d,
                snapType: 'perpendicular',
                entityId
            });
        }
        return perpendiculars;
    }
    getPerpendicularFoot(p, line) {
        const ax = line.startPoint.x;
        const ay = line.startPoint.y;
        const bx = line.endPoint.x;
        const by = line.endPoint.y;
        const dx = bx - ax;
        const dy = by - ay;
        const lenSq = dx * dx + dy * dy;
        if (lenSq < 1e-12) return null;
        const t = ((p.x - ax) * dx + (p.y - ay) * dy) / lenSq;
        if (t <= 0 || t >= 1) return null;
        return {
            x: ax + t * dx,
            y: ay + t * dy
        };
    }
    unprojectToCadLocalPoint(handle, screen, camera, viewRect) {
        const ray = this.resolveScreenRay(screen, camera, viewRect);
        if (!ray) return null;
        const object3D = handle.object3D;
        if (object3D instanceof __WEBPACK_EXTERNAL_MODULE_three__.Object3D) {
            object3D.updateMatrixWorld(true);
            const origin = object3D.localToWorld(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 0));
            const normal = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 1).transformDirection(object3D.matrixWorld);
            const plane = new __WEBPACK_EXTERNAL_MODULE_three__.Plane().setFromNormalAndCoplanarPoint(normal, origin);
            const intersection = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
            if (!new __WEBPACK_EXTERNAL_MODULE_three__.Ray(ray.origin, ray.direction).intersectPlane(plane, intersection)) return null;
            const local = object3D.worldToLocal(intersection);
            return {
                x: local.x,
                y: local.y
            };
        }
        const planeZ = this.getCadPlaneZ(handle);
        if (Math.abs(ray.direction.z) < 1e-10) return null;
        const t = (planeZ - ray.origin.z) / ray.direction.z;
        if (t < 0) return null;
        const point = ray.origin.clone().add(ray.direction.multiplyScalar(t));
        return {
            x: point.x,
            y: point.y
        };
    }
    resolveScreenRay(screen, camera, viewRect) {
        const fallbackWidth = 'undefined' != typeof window && window.innerWidth > 0 ? window.innerWidth : 1;
        const fallbackHeight = 'undefined' != typeof window && window.innerHeight > 0 ? window.innerHeight : 1;
        const rect = viewRect ?? {
            x: 0,
            y: 0,
            width: fallbackWidth,
            height: fallbackHeight
        };
        if (rect.width <= 0 || rect.height <= 0) return null;
        const ndcX = (screen.x - rect.x) / rect.width * 2 - 1;
        const ndcY = 2 * -((screen.y - rect.y) / rect.height) + 1;
        const raycaster = new __WEBPACK_EXTERNAL_MODULE_three__.Raycaster();
        raycaster.setFromCamera(new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(ndcX, ndcY), camera);
        const { origin, direction } = raycaster.ray;
        if (direction.lengthSq() <= SCREEN_EPSILON) return null;
        return {
            origin: origin.clone(),
            direction: direction.clone()
        };
    }
    getSegmentIntersection(lineA, lineB) {
        const p = lineA.startPoint;
        const r = {
            x: lineA.endPoint.x - lineA.startPoint.x,
            y: lineA.endPoint.y - lineA.startPoint.y
        };
        const q = lineB.startPoint;
        const s = {
            x: lineB.endPoint.x - lineB.startPoint.x,
            y: lineB.endPoint.y - lineB.startPoint.y
        };
        const denominator = r.x * s.y - r.y * s.x;
        if (Math.abs(denominator) <= SCREEN_EPSILON) return null;
        const qMinusP = {
            x: q.x - p.x,
            y: q.y - p.y
        };
        const t = (qMinusP.x * s.y - qMinusP.y * s.x) / denominator;
        const u = (qMinusP.x * r.y - qMinusP.y * r.x) / denominator;
        if (t < 0 || t > 1 || u < 0 || u > 1) return null;
        return {
            x: p.x + t * r.x,
            y: p.y + t * r.y
        };
    }
    getScreenDistanceToLine(line, handle, screen, camera, viewRect) {
        const start = this.worldToScreen(this.localCadPointToWorld(handle, line.startPoint), camera, viewRect);
        const end = this.worldToScreen(this.localCadPointToWorld(handle, line.endPoint), camera, viewRect);
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const lengthSquared = dx * dx + dy * dy;
        if (lengthSquared <= SCREEN_EPSILON) return screen.distanceTo(start);
        const t = Math.max(0, Math.min(1, ((screen.x - start.x) * dx + (screen.y - start.y) * dy) / lengthSquared));
        const nearest = new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(start.x + dx * t, start.y + dy * t);
        return nearest.distanceTo(screen);
    }
    dedupeCandidates(candidates) {
        const seen = new Set();
        const deduped = [];
        for (const candidate of candidates){
            const key = [
                candidate.snapType,
                candidate.point.x.toFixed(6),
                candidate.point.y.toFixed(6),
                candidate.point.z.toFixed(6)
            ].join(':');
            if (!seen.has(key)) {
                seen.add(key);
                deduped.push(candidate);
            }
        }
        return deduped;
    }
    applyOrthogonalConstraint(point, startPoint) {
        if (!this.orthogonalEnabled || !startPoint) return point.clone();
        const diff = point.clone().sub(startPoint);
        const magnitudes = [
            {
                axis: 'x',
                value: Math.abs(diff.x),
                priority: 0
            },
            {
                axis: 'y',
                value: Math.abs(diff.y),
                priority: 1
            },
            {
                axis: 'z',
                value: Math.abs(diff.z),
                priority: 2
            }
        ].sort((a, b)=>{
            if (Math.abs(a.value - b.value) > SCREEN_EPSILON) return b.value - a.value;
            return a.priority - b.priority;
        });
        const axis = magnitudes[0]?.axis ?? 'x';
        if ('x' === axis) return new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(point.x, startPoint.y, startPoint.z);
        if ('y' === axis) return new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(startPoint.x, point.y, startPoint.z);
        return new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(startPoint.x, startPoint.y, point.z);
    }
    getCadPlaneZ(handle) {
        const plane = handle.dataManager.plane;
        if ('number' == typeof plane?.origin?.z) return plane.origin.z;
        if ('number' == typeof plane?.elevation) return plane.elevation;
        return 0;
    }
    localCadPointToWorld(handle, point) {
        const localPoint = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(point.x, point.y, 0);
        const object3D = handle.object3D;
        if (object3D instanceof __WEBPACK_EXTERNAL_MODULE_three__.Object3D) {
            object3D.updateMatrixWorld(true);
            return object3D.localToWorld(localPoint);
        }
        localPoint.z = this.getCadPlaneZ(handle);
        return localPoint;
    }
    getScreenDistance(point, screen, camera, viewRect) {
        return this.worldToScreen(point, camera, viewRect).distanceTo(screen);
    }
    worldToScreen(point, camera, viewRect) {
        const projected = point.clone().project(camera);
        const rect = viewRect ?? {
            x: 0,
            y: 0,
            width: 1,
            height: 1
        };
        return new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(rect.x + (projected.x + 1) * rect.width / 2, rect.y + (-projected.y + 1) * rect.height / 2);
    }
    getCadService() {
        if (!this.context.hasService('CadService')) return null;
        return this.context.getService('CadService');
    }
    getSpatialQueryService() {
        const context = this.context;
        if (!context.hasService('SpatialQueryService')) return null;
        return context.getService('SpatialQueryService');
    }
    getVisibleCadHandles() {
        const cadService = this.getCadService();
        if (!cadService) return [];
        return cadService.getAll().filter((handle)=>handle.visible && handle.object3D?.visible !== false);
    }
    isCadSnapType(type) {
        return 'pointCloud' !== type;
    }
    isCadSnapTypeEnabled(type) {
        return this.enabledCadSnapTypes.has(type);
    }
    buildPickingQuery(options, overrides = {}) {
        return {
            interactionType: options.interactionType,
            centerSphereRadius: options.centerSphereRadius,
            prewarmGpu: 'move' === options.interactionType,
            viewId: options.viewId ?? void 0,
            viewRect: options.viewRect ?? void 0,
            windowSize: 'move' === options.interactionType ? MEASURE_MOVE_GPU_PICK_WINDOW : MEASURE_CLICK_GPU_PICK_WINDOW,
            ...overrides
        };
    }
    prewarmGsplatGpuPick(options) {
        this.pickingService.pickAtScreen(options.screen, options.camera, {
            kinds: [
                'gaussian-splat'
            ],
            interactionType: 'move',
            centerSphereRadius: options.centerSphereRadius,
            viewId: options.viewId ?? void 0,
            viewRect: options.viewRect ?? void 0,
            gpuOnly: true,
            prewarmGpu: true,
            windowSize: MEASURE_MOVE_GPU_PICK_WINDOW
        });
    }
    getSnapPriority(type) {
        switch(type){
            case 'endpoint':
                return 0;
            case 'intersection':
                return 1;
            case 'midpoint':
                return 2;
            case 'perpendicular':
                return 3;
            case 'keypoint':
                return 4;
            case 'pointCloud':
                return 5;
            default:
                return 99;
        }
    }
}
const MeasureSnapService_rslib_entry_ = MeasureSnapService;
export { MeasureSnapService, MeasureSnapService_rslib_entry_ as default };
