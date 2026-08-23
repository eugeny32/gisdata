import * as __WEBPACK_EXTERNAL_MODULE_nanoid__ from "nanoid";
import * as __WEBPACK_EXTERNAL_MODULE__utils_index_js_02c78a7f__ from "../../../utils/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__ from "../../model/common/constant.js";
import * as __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_4760f106__ from "../../model/entity/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__breakUtils_js_1f286599__ from "./breakUtils.js";
const BOUNDARY_SAMPLE_NUM = 128;
const SPLINE_PROJECT_SAMPLE_NUM = 200;
const RAY_SAMPLE_LENGTH = 1e6;
const EPS = 1e-8;
const ANGLE_EPS = 1e-6;
class TrimUtils {
    static #_ = this.EnabledEntityTypes = new Set([
        __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Polyline,
        __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Arc,
        __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Circle,
        __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Ellipse,
        __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Spline,
        __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Ray
    ]);
    static trimEntity(entity, cursorPoint, boundaries) {
        const empty = {
            createdEntities: [],
            deleteEntities: []
        };
        if (!TrimUtils.EnabledEntityTypes.has(entity.type)) return empty;
        const rawTs = TrimUtils.findIntersectionParams(entity, boundaries);
        if (0 === rawTs.length) {
            if (entity.type === __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Polyline) return TrimUtils.trimPolylineCursorSegment(entity, cursorPoint, []);
            return {
                createdEntities: [],
                deleteEntities: [
                    entity
                ]
            };
        }
        const sorted = TrimUtils.deduplicateAndSort(rawTs);
        if (0 === sorted.length) return empty;
        if (entity.type === __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Polyline) return TrimUtils.trimPolylineCursorSegment(entity, cursorPoint, sorted);
        const cursorT = TrimUtils.projectOnEntity(entity, cursorPoint);
        const isClosed = TrimUtils.isEntityClosed(entity);
        const paramRange = TrimUtils.getParamRange(entity);
        let interval;
        interval = isClosed ? TrimUtils.findIntervalClosed(sorted, cursorT, paramRange.period, entity, cursorPoint) : TrimUtils.findIntervalOpen(sorted, cursorT, paramRange.tMin, paramRange.tMax);
        if (!interval) return empty;
        if (isClosed) {
            if (entity.type === __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Circle) return TrimUtils.trimCircle(entity, interval.tLo, interval.tHi);
            if (entity.type === __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Ellipse) return TrimUtils.trimFullEllipse(entity, interval.tLo, interval.tHi);
        }
        const p1 = TrimUtils.getPointAtParam(entity, interval.tLo);
        const p2 = TrimUtils.getPointAtParam(entity, interval.tHi);
        const res = __WEBPACK_EXTERNAL_MODULE__breakUtils_js_1f286599__.BreakUtils.breakEntity(entity, {
            firstPoint: p1,
            secondPoint: p2
        });
        if (0 === res.createdEntities.length && 0 === res.deleteEntities.length) res.deleteEntities = [
            entity
        ];
        return res;
    }
    static getTrimmedPreviewEntities(entity, cursorPoint, boundaries) {
        if (!TrimUtils.EnabledEntityTypes.has(entity.type)) return [];
        const rawTs = TrimUtils.findIntersectionParams(entity, boundaries);
        if (0 === rawTs.length && entity.type !== __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Polyline) return [
            entity
        ];
        const sorted = TrimUtils.deduplicateAndSort(rawTs);
        const interval = TrimUtils.findTrimInterval(entity, cursorPoint, sorted);
        if (!interval || interval.tHi - interval.tLo < EPS) return [];
        return TrimUtils.createTrimmedIntervalEntities(entity, interval);
    }
    static projectOnEntity(entity, point) {
        switch(entity.type){
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Polyline:
                return TrimUtils.projectOnPolyline(point, entity);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Arc:
                return TrimUtils.projectOnArc(point, entity);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Circle:
                return TrimUtils.projectOnCircle(point, entity);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Ellipse:
                return TrimUtils.projectOnEllipse(point, entity);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Spline:
                return TrimUtils.projectOnSpline(point, entity);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Ray:
                return TrimUtils.projectOnRay(point, entity);
            default:
                return 0;
        }
    }
    static findIntersectionParams(entity, boundaries) {
        const result = [];
        for (const boundary of boundaries){
            if (boundary.id === entity.id) continue;
            const pts = TrimUtils.findEntityBoundaryIntersections(entity, boundary);
            result.push(...pts);
        }
        return result;
    }
    static findEntityBoundaryIntersections(entity, boundary) {
        const boundaryPts = TrimUtils.sampleEntityToWorldPoints(boundary);
        if (!boundaryPts || boundaryPts.length < 2) return [];
        const result = [];
        for(let i = 0; i < boundaryPts.length - 1; i++){
            const p1 = boundaryPts[i];
            const p2 = boundaryPts[i + 1];
            const intPts = TrimUtils.findSegmentEntityIntersectionPoints(p1, p2, entity);
            for (const pt of intPts)result.push(TrimUtils.projectOnEntity(entity, pt));
        }
        return result;
    }
    static sampleEntityToWorldPoints(entity) {
        switch(entity.type){
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Polyline:
                return TrimUtils.samplePolylineToPoints(entity);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Arc:
                return TrimUtils.sampleArcToPoints(entity, BOUNDARY_SAMPLE_NUM);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Circle:
                return TrimUtils.sampleCircleToPoints(entity, BOUNDARY_SAMPLE_NUM);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Ellipse:
                return TrimUtils.sampleEllipseToPoints(entity, BOUNDARY_SAMPLE_NUM);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Spline:
                return TrimUtils.sampleSplineToPoints(entity, BOUNDARY_SAMPLE_NUM);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Ray:
                {
                    const { startPoint, unitVector } = entity;
                    return [
                        {
                            x: startPoint.x,
                            y: startPoint.y
                        },
                        {
                            x: startPoint.x + unitVector.x * RAY_SAMPLE_LENGTH,
                            y: startPoint.y + unitVector.y * RAY_SAMPLE_LENGTH
                        }
                    ];
                }
            default:
                return null;
        }
    }
    static samplePolylineToPoints(entity) {
        const pts = [];
        const vertices = entity.vertices;
        const n = entity.isClosed ? vertices.length : vertices.length - 1;
        for(let i = 0; i < n; i++){
            const v1 = vertices[i];
            const v2 = vertices[(i + 1) % vertices.length];
            const bulge = v1.bulge ?? 0;
            pts.push({
                x: v1.x,
                y: v1.y
            });
            if (Math.abs(bulge) > 1e-10) {
                const arcPts = TrimUtils.sampleBulgeSegment(v1, v2, bulge, 16);
                pts.push(...arcPts.slice(1, -1));
            }
        }
        pts.push({
            x: vertices[n === vertices.length ? 0 : vertices.length - 1].x,
            y: vertices[n === vertices.length ? 0 : vertices.length - 1].y
        });
        if (entity.isClosed && vertices.length > 0) pts.push({
            x: vertices[0].x,
            y: vertices[0].y
        });
        return pts;
    }
    static sampleBulgeSegment(p1, p2, bulge, n) {
        const { cx, cy, radius, startAngle } = TrimUtils.arcParamsFromBulge(p1, p2, bulge);
        const sweep = 4 * Math.atan(bulge);
        const pts = [];
        for(let i = 0; i <= n; i++){
            const angle = startAngle + i / n * sweep;
            pts.push({
                x: cx + radius * Math.cos(angle),
                y: cy + radius * Math.sin(angle)
            });
        }
        return pts;
    }
    static sampleArcToPoints(entity, n) {
        const { center, radius, startAngle, endAngle, clockwise } = entity;
        const span = clockwise ? -(TrimUtils.normalizeAngle(startAngle - endAngle) || 2 * Math.PI) : TrimUtils.normalizeAngle(endAngle - startAngle) || 2 * Math.PI;
        const pts = [];
        for(let i = 0; i <= n; i++){
            const angle = startAngle + i / n * span;
            pts.push({
                x: center.x + radius * Math.cos(angle),
                y: center.y + radius * Math.sin(angle)
            });
        }
        return pts;
    }
    static sampleCircleToPoints(entity, n) {
        const { center, radius } = entity;
        const pts = [];
        for(let i = 0; i <= n; i++){
            const angle = i / n * Math.PI * 2;
            pts.push({
                x: center.x + radius * Math.cos(angle),
                y: center.y + radius * Math.sin(angle)
            });
        }
        return pts;
    }
    static sampleEllipseToPoints(entity, n) {
        const { center, radiusX, radiusY, rotation, startAngle, endAngle } = entity;
        let span = TrimUtils.ccwSpan(startAngle, endAngle);
        if (span < ANGLE_EPS) span = 2 * Math.PI;
        const pts = [];
        for(let i = 0; i <= n; i++){
            const theta = startAngle + i / n * span;
            const lx = radiusX * Math.cos(theta);
            const ly = radiusY * Math.sin(theta);
            pts.push({
                x: center.x + lx * Math.cos(rotation) - ly * Math.sin(rotation),
                y: center.y + lx * Math.sin(rotation) + ly * Math.cos(rotation)
            });
        }
        return pts;
    }
    static sampleSplineToPoints(entity, n) {
        if (entity.controlPoints.length < entity.degree + 1) return [];
        const { knots, degree } = entity;
        const uMin = knots[degree] ?? 0;
        const uMax = (knots[knots.length - degree - 1] ?? 1) - 1e-9;
        const pts = [];
        for(let i = 0; i <= n; i++){
            const u = uMin + i / n * (uMax - uMin);
            const pt = __WEBPACK_EXTERNAL_MODULE__utils_index_js_02c78a7f__.SplineUtils.evaluateBSpline(u, entity.controlPoints, entity.knots, entity.degree);
            pts.push({
                x: pt.x,
                y: pt.y
            });
        }
        return pts;
    }
    static findSegmentEntityIntersectionPoints(p1, p2, entity) {
        switch(entity.type){
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Polyline:
                return TrimUtils.segmentVsPolyline(p1, p2, entity);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Arc:
                return TrimUtils.segmentVsArc(p1, p2, entity);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Circle:
                return TrimUtils.segmentVsCircle(p1, p2, entity);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Ellipse:
                return TrimUtils.segmentVsEllipse(p1, p2, entity);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Spline:
                return TrimUtils.segmentVsSpline(p1, p2, entity);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Ray:
                return TrimUtils.segmentVsRay(p1, p2, entity);
            default:
                return [];
        }
    }
    static segmentVsPolyline(p1, p2, poly) {
        const result = [];
        const vertices = poly.vertices;
        const n = poly.isClosed ? vertices.length : vertices.length - 1;
        for(let i = 0; i < n; i++){
            const v1 = vertices[i];
            const v2 = vertices[(i + 1) % vertices.length];
            const bulge = v1.bulge ?? 0;
            if (Math.abs(bulge) < 1e-10) {
                const pt = TrimUtils.segmentSegmentIntersection(p1, p2, v1, v2);
                if (pt) result.push(pt);
            } else {
                const arcPts = TrimUtils.sampleBulgeSegment(v1, v2, bulge, 16);
                for(let j = 0; j < arcPts.length - 1; j++){
                    const pt = TrimUtils.segmentSegmentIntersection(p1, p2, arcPts[j], arcPts[j + 1]);
                    if (pt) result.push(pt);
                }
            }
        }
        return result;
    }
    static segmentVsArc(p1, p2, arc) {
        const all = TrimUtils.segmentVsFullCircle(p1, p2, arc.center, arc.radius);
        const arcStart = TrimUtils.normalizeAngle(arc.startAngle);
        const arcEnd = TrimUtils.normalizeAngle(arc.endAngle);
        return all.filter((pt)=>{
            const angle = TrimUtils.normalizeAngle(Math.atan2(pt.y - arc.center.y, pt.x - arc.center.x));
            return TrimUtils.isAngleOnDirectedArc(angle, arcStart, arcEnd, arc.clockwise);
        });
    }
    static segmentVsCircle(p1, p2, circle) {
        return TrimUtils.segmentVsFullCircle(p1, p2, circle.center, circle.radius);
    }
    static segmentVsFullCircle(p1, p2, center, radius) {
        const dx = p2.x - p1.x, dy = p2.y - p1.y;
        const fx = p1.x - center.x, fy = p1.y - center.y;
        const a = dx * dx + dy * dy;
        if (a < EPS * EPS) return [];
        const b = 2 * (fx * dx + fy * dy);
        const c = fx * fx + fy * fy - radius * radius;
        const disc = b * b - 4 * a * c;
        if (disc < 0) return [];
        const sq = Math.sqrt(Math.max(0, disc));
        const result = [];
        for (const sign of [
            -1,
            1
        ]){
            const t = (-b + sign * sq) / (2 * a);
            if (t >= -EPS && t <= 1 + EPS) result.push({
                x: p1.x + t * dx,
                y: p1.y + t * dy
            });
        }
        return result;
    }
    static segmentVsEllipse(p1, p2, ellipse) {
        const { center, radiusX, radiusY, rotation, startAngle, endAngle } = ellipse;
        const cosR = Math.cos(-rotation), sinR = Math.sin(-rotation);
        const toLocal = (p)=>{
            const dx = p.x - center.x, dy = p.y - center.y;
            return {
                x: (dx * cosR - dy * sinR) / radiusX,
                y: (dx * sinR + dy * cosR) / radiusY
            };
        };
        const lp1 = toLocal(p1), lp2 = toLocal(p2);
        const unitPts = TrimUtils.segmentVsFullCircle(lp1, lp2, {
            x: 0,
            y: 0
        }, 1);
        return unitPts.map((lp)=>{
            const wx = center.x + (lp.x * radiusX * Math.cos(rotation) - lp.y * radiusY * Math.sin(rotation));
            const wy = center.y + (lp.x * radiusX * Math.sin(rotation) + lp.y * radiusY * Math.cos(rotation));
            return {
                x: wx,
                y: wy
            };
        }).filter((pt)=>{
            const dx = pt.x - center.x, dy = pt.y - center.y;
            const lx = dx * Math.cos(rotation) + dy * Math.sin(rotation);
            const ly = -dx * Math.sin(rotation) + dy * Math.cos(rotation);
            const angle = TrimUtils.normalizeAngle(Math.atan2(ly / radiusY, lx / radiusX));
            const fullEllipse = TrimUtils.ccwSpan(startAngle, endAngle) < ANGLE_EPS;
            if (fullEllipse) return true;
            return TrimUtils.isAngleOnArc(angle, startAngle, endAngle);
        });
    }
    static segmentVsSpline(p1, p2, spline) {
        const pts = TrimUtils.sampleSplineToPoints(spline, BOUNDARY_SAMPLE_NUM);
        const result = [];
        for(let i = 0; i < pts.length - 1; i++){
            const pt = TrimUtils.segmentSegmentIntersection(p1, p2, pts[i], pts[i + 1]);
            if (pt) result.push(pt);
        }
        return result;
    }
    static segmentVsRay(p1, p2, ray) {
        const { startPoint, unitVector } = ray;
        const dx = p2.x - p1.x, dy = p2.y - p1.y;
        const ox = p1.x - startPoint.x, oy = p1.y - startPoint.y;
        const det = unitVector.x * dy - unitVector.y * dx;
        if (Math.abs(det) < 1e-12) return [];
        const tRay = (ox * dy - oy * dx) / det;
        if (tRay < -EPS) return [];
        const sSeg = (ox * unitVector.y - oy * unitVector.x) / det;
        if (sSeg < -EPS || sSeg > 1 + EPS) return [];
        return [
            {
                x: startPoint.x + tRay * unitVector.x,
                y: startPoint.y + tRay * unitVector.y
            }
        ];
    }
    static segmentSegmentIntersection(p1, p2, p3, p4) {
        const d1x = p2.x - p1.x, d1y = p2.y - p1.y;
        const d2x = p4.x - p3.x, d2y = p4.y - p3.y;
        const cross = d1x * d2y - d1y * d2x;
        if (Math.abs(cross) < EPS) return null;
        const dx = p3.x - p1.x, dy = p3.y - p1.y;
        const t = (dx * d2y - dy * d2x) / cross;
        const u = (dx * d1y - dy * d1x) / cross;
        if (t >= -EPS && t <= 1 + EPS && u >= -EPS && u <= 1 + EPS) return {
            x: p1.x + t * d1x,
            y: p1.y + t * d1y
        };
        return null;
    }
    static projectOnPolyline(p, entity) {
        const vertices = entity.vertices;
        const n = entity.isClosed ? vertices.length : vertices.length - 1;
        let bestT = 0, bestDistSq = 1 / 0;
        for(let i = 0; i < n; i++){
            const v1 = vertices[i];
            const v2 = vertices[(i + 1) % vertices.length];
            const bulge = v1.bulge ?? 0;
            let t, point;
            if (Math.abs(bulge) < 1e-10) {
                const dx = v2.x - v1.x, dy = v2.y - v1.y;
                const lenSq = dx * dx + dy * dy;
                if (lenSq < 1e-12) {
                    t = 0;
                    point = {
                        x: v1.x,
                        y: v1.y
                    };
                } else {
                    const raw = ((p.x - v1.x) * dx + (p.y - v1.y) * dy) / lenSq;
                    t = Math.max(0, Math.min(1, raw));
                    point = {
                        x: v1.x + t * dx,
                        y: v1.y + t * dy
                    };
                }
            } else {
                const { cx, cy, radius, startAngle } = TrimUtils.arcParamsFromBulge(v1, v2, bulge);
                const sweep = 4 * Math.atan(bulge);
                let delta = Math.atan2(p.y - cy, p.x - cx) - startAngle;
                if (sweep > 0) {
                    while(delta < 0)delta += 2 * Math.PI;
                    while(delta > 2 * Math.PI)delta -= 2 * Math.PI;
                } else {
                    while(delta > 0)delta -= 2 * Math.PI;
                    while(delta < 2 * -Math.PI)delta += 2 * Math.PI;
                }
                t = Math.max(0, Math.min(1, delta / sweep));
                const cAngle = startAngle + t * sweep;
                point = {
                    x: cx + radius * Math.cos(cAngle),
                    y: cy + radius * Math.sin(cAngle)
                };
            }
            const ddx = p.x - point.x, ddy = p.y - point.y;
            const distSq = ddx * ddx + ddy * ddy;
            if (distSq < bestDistSq) {
                bestDistSq = distSq;
                bestT = i + t;
            }
        }
        return bestT;
    }
    static projectOnArc(p, entity) {
        const arcStart = TrimUtils.normalizeAngle(entity.startAngle);
        const arcEnd = TrimUtils.normalizeAngle(entity.endAngle);
        const totalSpan = TrimUtils.directedSpan(arcStart, arcEnd, entity.clockwise) || 2 * Math.PI;
        const angle = TrimUtils.normalizeAngle(Math.atan2(p.y - entity.center.y, p.x - entity.center.x));
        if (TrimUtils.isAngleOnDirectedArc(angle, arcStart, arcEnd, entity.clockwise)) return TrimUtils.directedSpan(arcStart, angle, entity.clockwise);
        const dStart = TrimUtils.directedSpan(arcStart, angle, entity.clockwise);
        return dStart <= totalSpan / 2 ? 0 : totalSpan;
    }
    static projectOnCircle(p, entity) {
        return TrimUtils.normalizeAngle(Math.atan2(p.y - entity.center.y, p.x - entity.center.x));
    }
    static projectOnEllipse(p, entity) {
        const { center, radiusX, radiusY, rotation, startAngle, endAngle } = entity;
        const dx = p.x - center.x, dy = p.y - center.y;
        const cosR = Math.cos(rotation), sinR = Math.sin(rotation);
        const u = dx * cosR + dy * sinR;
        const v = -dx * sinR + dy * cosR;
        const angle = TrimUtils.normalizeAngle(Math.atan2(v / radiusY, u / radiusX));
        const fullEllipse = TrimUtils.ccwSpan(startAngle, endAngle) < ANGLE_EPS;
        if (fullEllipse) return angle;
        const totalSpan = TrimUtils.ccwSpan(startAngle, endAngle);
        const startN = TrimUtils.normalizeAngle(startAngle);
        if (TrimUtils.isAngleOnArc(angle, startN, TrimUtils.normalizeAngle(endAngle))) return TrimUtils.ccwSpan(startN, angle);
        const dStart = TrimUtils.ccwSpan(startN, angle);
        return dStart <= totalSpan / 2 ? 0 : totalSpan;
    }
    static projectOnSpline(p, entity) {
        if (entity.controlPoints.length < entity.degree + 1) return 0;
        const { knots, degree } = entity;
        const uMin = knots[degree] ?? 0;
        const uMax = (knots[knots.length - degree - 1] ?? 1) - 1e-9;
        let bestU = uMin, bestDistSq = 1 / 0;
        for(let i = 0; i <= SPLINE_PROJECT_SAMPLE_NUM; i++){
            const u = uMin + i / SPLINE_PROJECT_SAMPLE_NUM * (uMax - uMin);
            const pt = __WEBPACK_EXTERNAL_MODULE__utils_index_js_02c78a7f__.SplineUtils.evaluateBSpline(u, entity.controlPoints, entity.knots, entity.degree);
            const ddx = p.x - pt.x, ddy = p.y - pt.y;
            const distSq = ddx * ddx + ddy * ddy;
            if (distSq < bestDistSq) {
                bestDistSq = distSq;
                bestU = u;
            }
        }
        return bestU;
    }
    static projectOnRay(p, entity) {
        const { startPoint, unitVector } = entity;
        return Math.max(0, (p.x - startPoint.x) * unitVector.x + (p.y - startPoint.y) * unitVector.y);
    }
    static getPointAtParam(entity, t) {
        switch(entity.type){
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Polyline:
                return TrimUtils.polylinePointAt(entity, t);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Arc:
                return TrimUtils.arcPointAt(entity, t);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Circle:
                return TrimUtils.circlePointAt(entity, t);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Ellipse:
                return TrimUtils.ellipsePointAt(entity, t);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Spline:
                return TrimUtils.splinePointAt(entity, t);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Ray:
                return TrimUtils.rayPointAt(entity, t);
            default:
                return {
                    x: 0,
                    y: 0
                };
        }
    }
    static polylinePointAt(entity, t) {
        const vertices = entity.vertices;
        const n = entity.isClosed ? vertices.length : vertices.length - 1;
        const i = Math.max(0, Math.min(Math.floor(t), n - 1));
        const frac = Math.max(0, Math.min(1, t - i));
        const v1 = vertices[i];
        const v2 = vertices[(i + 1) % vertices.length];
        const bulge = v1.bulge ?? 0;
        if (Math.abs(bulge) < 1e-10) return {
            x: v1.x + (v2.x - v1.x) * frac,
            y: v1.y + (v2.y - v1.y) * frac
        };
        const { cx, cy, radius, startAngle } = TrimUtils.arcParamsFromBulge(v1, v2, bulge);
        const sweep = 4 * Math.atan(bulge);
        const angle = startAngle + frac * sweep;
        return {
            x: cx + radius * Math.cos(angle),
            y: cy + radius * Math.sin(angle)
        };
    }
    static arcPointAt(entity, t) {
        const startAngle = TrimUtils.normalizeAngle(entity.startAngle);
        const angle = entity.clockwise ? startAngle - t : startAngle + t;
        return {
            x: entity.center.x + entity.radius * Math.cos(angle),
            y: entity.center.y + entity.radius * Math.sin(angle)
        };
    }
    static circlePointAt(entity, t) {
        return {
            x: entity.center.x + entity.radius * Math.cos(t),
            y: entity.center.y + entity.radius * Math.sin(t)
        };
    }
    static ellipsePointAt(entity, t) {
        const { center, radiusX, radiusY, rotation, startAngle } = entity;
        const fullEllipse = TrimUtils.ccwSpan(startAngle, entity.endAngle) < ANGLE_EPS;
        const angle = fullEllipse ? t : TrimUtils.normalizeAngle(startAngle) + t;
        const lx = radiusX * Math.cos(angle);
        const ly = radiusY * Math.sin(angle);
        return {
            x: center.x + lx * Math.cos(rotation) - ly * Math.sin(rotation),
            y: center.y + lx * Math.sin(rotation) + ly * Math.cos(rotation)
        };
    }
    static splinePointAt(entity, u) {
        const pt = __WEBPACK_EXTERNAL_MODULE__utils_index_js_02c78a7f__.SplineUtils.evaluateBSpline(u, entity.controlPoints, entity.knots, entity.degree);
        return {
            x: pt.x,
            y: pt.y
        };
    }
    static rayPointAt(entity, t) {
        return {
            x: entity.startPoint.x + t * entity.unitVector.x,
            y: entity.startPoint.y + t * entity.unitVector.y
        };
    }
    static isEntityClosed(entity) {
        switch(entity.type){
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Circle:
                return true;
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Polyline:
                return entity.isClosed;
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Ellipse:
                {
                    const e = entity;
                    return TrimUtils.ccwSpan(e.startAngle, e.endAngle) < ANGLE_EPS;
                }
            default:
                return false;
        }
    }
    static getParamRange(entity) {
        switch(entity.type){
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Polyline:
                {
                    const poly = entity;
                    const n = poly.isClosed ? poly.vertices.length : poly.vertices.length - 1;
                    return {
                        tMin: 0,
                        tMax: n,
                        period: poly.isClosed ? n : void 0
                    };
                }
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Arc:
                {
                    const arc = entity;
                    const span = TrimUtils.directedSpan(arc.startAngle, arc.endAngle, arc.clockwise) || 2 * Math.PI;
                    return {
                        tMin: 0,
                        tMax: span
                    };
                }
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Circle:
                return {
                    tMin: 0,
                    tMax: 2 * Math.PI,
                    period: 2 * Math.PI
                };
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Ellipse:
                {
                    const e = entity;
                    const span = TrimUtils.ccwSpan(e.startAngle, e.endAngle);
                    if (span < ANGLE_EPS) return {
                        tMin: 0,
                        tMax: 2 * Math.PI,
                        period: 2 * Math.PI
                    };
                    return {
                        tMin: 0,
                        tMax: span
                    };
                }
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Spline:
                {
                    const spline = entity;
                    const uMin = spline.knots[spline.degree] ?? 0;
                    const uMax = (spline.knots[spline.knots.length - spline.degree - 1] ?? 1) - 1e-9;
                    return {
                        tMin: uMin,
                        tMax: uMax
                    };
                }
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Ray:
                return {
                    tMin: 0,
                    tMax: RAY_SAMPLE_LENGTH
                };
            default:
                return {
                    tMin: 0,
                    tMax: 1
                };
        }
    }
    static trimPolylineCursorSegment(entity, cursorPoint, sorted) {
        const interval = TrimUtils.findPolylineCursorInterval(entity, cursorPoint, sorted);
        if (!interval || interval.tHi - interval.tLo < EPS) return {
            createdEntities: [],
            deleteEntities: []
        };
        if (entity.isClosed) return TrimUtils.trimClosedPolylineInterval(entity, interval.tLo, interval.tHi);
        const p1 = TrimUtils.getPointAtParam(entity, interval.tLo);
        const p2 = TrimUtils.getPointAtParam(entity, interval.tHi);
        const res = __WEBPACK_EXTERNAL_MODULE__breakUtils_js_1f286599__.BreakUtils.breakEntity(entity, {
            firstPoint: p1,
            secondPoint: p2
        });
        if (0 === res.createdEntities.length && 0 === res.deleteEntities.length) return {
            createdEntities: [],
            deleteEntities: [
                entity
            ]
        };
        return res;
    }
    static findTrimInterval(entity, cursorPoint, sorted) {
        if (entity.type === __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Polyline) return TrimUtils.findPolylineCursorInterval(entity, cursorPoint, sorted);
        const paramRange = TrimUtils.getParamRange(entity);
        if (0 === sorted.length) return {
            tLo: paramRange.tMin,
            tHi: paramRange.tMax,
            wrapping: false
        };
        const cursorT = TrimUtils.projectOnEntity(entity, cursorPoint);
        if (TrimUtils.isEntityClosed(entity)) return TrimUtils.findIntervalClosed(sorted, cursorT, paramRange.period, entity, cursorPoint);
        return TrimUtils.findIntervalOpen(sorted, cursorT, paramRange.tMin, paramRange.tMax);
    }
    static findPolylineCursorInterval(entity, cursorPoint, sorted) {
        const cursorT = TrimUtils.projectOnPolyline(cursorPoint, entity);
        const maxSegmentIndex = entity.isClosed ? entity.vertices.length - 1 : entity.vertices.length - 2;
        const segmentIndex = Math.max(0, Math.min(Math.floor(cursorT), maxSegmentIndex));
        const tMin = segmentIndex;
        const tMax = segmentIndex + 1;
        const segmentTs = sorted.filter((t)=>t >= tMin - EPS && t <= tMax + EPS);
        if (segmentTs.length > 0) return TrimUtils.findIntervalOpen(segmentTs, cursorT, tMin, tMax);
        return {
            tLo: tMin,
            tHi: tMax,
            wrapping: false
        };
    }
    static createTrimmedIntervalEntities(entity, interval) {
        switch(entity.type){
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Polyline:
                return TrimUtils.createPolylineTrimmedIntervalEntities(entity, interval);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Arc:
                return TrimUtils.createArcTrimmedIntervalEntity(entity, interval);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Circle:
                return TrimUtils.createCircleTrimmedIntervalEntity(entity, interval);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Ellipse:
                return TrimUtils.createEllipseTrimmedIntervalEntity(entity, interval);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Spline:
                return TrimUtils.createSplineTrimmedIntervalEntity(entity, interval);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Ray:
                return TrimUtils.createRayTrimmedIntervalEntity(entity, interval);
            default:
                return [];
        }
    }
    static createPolylineTrimmedIntervalEntities(entity, interval) {
        if (!entity.isClosed) {
            const result = __WEBPACK_EXTERNAL_MODULE__breakUtils_js_1f286599__.BreakUtils.clipOpenPolylineToInterval(entity, interval.tLo, interval.tHi);
            return result ? [
                result
            ] : [];
        }
        if (!interval.wrapping) {
            const result = __WEBPACK_EXTERNAL_MODULE__breakUtils_js_1f286599__.BreakUtils.clipClosedPolylineToInterval(entity, interval.tLo, interval.tHi);
            return result ? [
                result
            ] : [];
        }
        const maxT = entity.vertices.length;
        return [
            __WEBPACK_EXTERNAL_MODULE__breakUtils_js_1f286599__.BreakUtils.clipClosedPolylineToInterval(entity, interval.tLo, maxT),
            __WEBPACK_EXTERNAL_MODULE__breakUtils_js_1f286599__.BreakUtils.clipClosedPolylineToInterval(entity, 0, interval.tHi)
        ].filter((item)=>Boolean(item));
    }
    static createArcTrimmedIntervalEntity(entity, interval) {
        if (interval.tHi - interval.tLo < ANGLE_EPS) return [];
        const preview = entity.clone();
        const direction = entity.clockwise ? -1 : 1;
        Object.assign(preview, {
            id: (0, __WEBPACK_EXTERNAL_MODULE_nanoid__.nanoid)(),
            startAngle: TrimUtils.normalizeAngle(entity.startAngle + direction * interval.tLo),
            endAngle: TrimUtils.normalizeAngle(entity.startAngle + direction * interval.tHi),
            clockwise: entity.clockwise
        });
        return [
            preview
        ];
    }
    static createCircleTrimmedIntervalEntity(entity, interval) {
        if (TrimUtils.ccwSpan(interval.tLo, interval.tHi) < ANGLE_EPS) return [];
        return [
            new __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_4760f106__.ArcEntity({
                ...entity.serialize(),
                id: (0, __WEBPACK_EXTERNAL_MODULE_nanoid__.nanoid)(),
                type: __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Arc,
                startAngle: TrimUtils.normalizeAngle(interval.tLo),
                endAngle: TrimUtils.normalizeAngle(interval.tHi),
                clockwise: false
            })
        ];
    }
    static createEllipseTrimmedIntervalEntity(entity, interval) {
        const span = interval.wrapping ? TrimUtils.ccwSpan(interval.tLo, interval.tHi) : interval.tHi - interval.tLo;
        if (span < ANGLE_EPS) return [];
        const preview = entity.clone();
        const fullEllipse = TrimUtils.ccwSpan(entity.startAngle, entity.endAngle) < ANGLE_EPS;
        const startAngle = fullEllipse ? interval.tLo : entity.startAngle + interval.tLo;
        const endAngle = fullEllipse ? interval.tHi : entity.startAngle + interval.tHi;
        Object.assign(preview, {
            id: (0, __WEBPACK_EXTERNAL_MODULE_nanoid__.nanoid)(),
            startAngle: TrimUtils.normalizeAngle(startAngle),
            endAngle: TrimUtils.normalizeAngle(endAngle),
            clockwise: false
        });
        return [
            preview
        ];
    }
    static createSplineTrimmedIntervalEntity(entity, interval) {
        if (interval.tHi - interval.tLo < EPS) return [];
        const pts = [];
        for(let i = 0; i <= 16; i++){
            const u = interval.tLo + (interval.tHi - interval.tLo) * (i / 16);
            pts.push(__WEBPACK_EXTERNAL_MODULE__utils_index_js_02c78a7f__.SplineUtils.evaluateBSpline(u, entity.controlPoints, entity.knots, entity.degree));
        }
        try {
            const { controlPoints, knots, degree } = __WEBPACK_EXTERNAL_MODULE__utils_index_js_02c78a7f__.SplineUtils.fitPointsToSpline(pts);
            const preview = entity.clone();
            Object.assign(preview, {
                id: (0, __WEBPACK_EXTERNAL_MODULE_nanoid__.nanoid)(),
                method: 'FIT',
                fitPoints: pts,
                controlPoints,
                knots,
                degree,
                isClosed: false,
                startTangent: void 0,
                endTangent: void 0
            });
            return [
                preview
            ];
        } catch  {
            return [];
        }
    }
    static createRayTrimmedIntervalEntity(entity, interval) {
        if (interval.tHi - interval.tLo < EPS) return [];
        return [
            new __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_4760f106__.PolylineEntity({
                id: (0, __WEBPACK_EXTERNAL_MODULE_nanoid__.nanoid)(),
                layerId: entity.layerId,
                colorMethod: entity.colorMethod,
                color: entity.color,
                lineType: entity.lineType,
                lineWidth: entity.lineWidth,
                vertices: [
                    {
                        x: entity.startPoint.x + interval.tLo * entity.unitVector.x,
                        y: entity.startPoint.y + interval.tLo * entity.unitVector.y,
                        bulge: 0
                    },
                    {
                        x: entity.startPoint.x + interval.tHi * entity.unitVector.x,
                        y: entity.startPoint.y + interval.tHi * entity.unitVector.y,
                        bulge: 0
                    }
                ],
                isClosed: false
            })
        ];
    }
    static trimClosedPolylineInterval(entity, tLo, tHi) {
        const maxT = entity.vertices.length;
        const keptParts = [];
        if (tHi < maxT - EPS) {
            const part = __WEBPACK_EXTERNAL_MODULE__breakUtils_js_1f286599__.BreakUtils.clipClosedPolylineToInterval(entity, tHi, maxT);
            if (part) keptParts.push(part);
        }
        if (tLo > EPS) {
            const part = __WEBPACK_EXTERNAL_MODULE__breakUtils_js_1f286599__.BreakUtils.clipClosedPolylineToInterval(entity, 0, tLo);
            if (part) keptParts.push(part);
        }
        const keptVertices = keptParts.reduce((acc, part)=>{
            if (0 === acc.length) return [
                ...part.vertices
            ];
            const last = acc[acc.length - 1];
            const first = part.vertices[0];
            if (Math.abs(last.x - first.x) < EPS && Math.abs(last.y - first.y) < EPS) return [
                ...acc.slice(0, -1),
                ...part.vertices
            ];
            return [
                ...acc,
                ...part.vertices
            ];
        }, []);
        if (keptVertices.length < 2) return {
            createdEntities: [],
            deleteEntities: [
                entity
            ]
        };
        const newEntity = entity.clone();
        Object.assign(newEntity, {
            id: (0, __WEBPACK_EXTERNAL_MODULE_nanoid__.nanoid)(),
            vertices: keptVertices,
            isClosed: false
        });
        return {
            createdEntities: [
                newEntity
            ],
            deleteEntities: [
                entity
            ]
        };
    }
    static findIntervalOpen(sorted, cursorT, tMin, tMax) {
        if (0 === sorted.length) return null;
        const firstT = sorted[0], lastT = sorted[sorted.length - 1];
        if (cursorT <= firstT + EPS) {
            if (firstT - tMin < EPS) return null;
            return {
                tLo: tMin,
                tHi: firstT,
                wrapping: false
            };
        }
        if (cursorT >= lastT - EPS) {
            if (tMax - lastT < EPS) return null;
            return {
                tLo: lastT,
                tHi: tMax,
                wrapping: false
            };
        }
        for(let i = 0; i < sorted.length - 1; i++)if (cursorT >= sorted[i] - EPS && cursorT <= sorted[i + 1] + EPS) return {
            tLo: sorted[i],
            tHi: sorted[i + 1],
            wrapping: false
        };
        return null;
    }
    static findIntervalClosed(sorted, cursorT, period, entity, cursorPoint) {
        if (sorted.length < 2) return null;
        const norm = (t)=>(t % period + period) % period;
        const span = (from, to)=>norm(to - from);
        const normalizedCursor = norm(cursorT);
        if (entity && cursorPoint) {
            const boundaryInterval = TrimUtils.findClosedBoundaryInterval(sorted, normalizedCursor, period, entity, cursorPoint);
            if (boundaryInterval) return boundaryInterval;
        }
        for(let i = 0; i < sorted.length; i++){
            const lo = norm(sorted[i]);
            const hi = norm(sorted[(i + 1) % sorted.length]);
            const intervalSpan = span(lo, hi);
            const cursorOffset = span(lo, normalizedCursor);
            if (cursorOffset <= intervalSpan + EPS) {
                const isWrapping = i === sorted.length - 1;
                return {
                    tLo: lo,
                    tHi: hi,
                    wrapping: isWrapping
                };
            }
        }
        return null;
    }
    static findClosedBoundaryInterval(sorted, cursorT, period, entity, cursorPoint) {
        const norm = (t)=>(t % period + period) % period;
        const circularDistance = (a, b)=>{
            const delta = Math.abs(norm(a) - norm(b));
            return Math.min(delta, period - delta);
        };
        for(let i = 0; i < sorted.length; i++){
            const current = norm(sorted[i]);
            if (circularDistance(cursorT, current) > ANGLE_EPS) continue;
            const prevIndex = (i - 1 + sorted.length) % sorted.length;
            const nextIndex = (i + 1) % sorted.length;
            const prev = norm(sorted[prevIndex]);
            const next = norm(sorted[nextIndex]);
            const before = {
                tLo: prev,
                tHi: current,
                wrapping: prevIndex > i
            };
            const after = {
                tLo: current,
                tHi: next,
                wrapping: i === sorted.length - 1
            };
            const beforeDistance = TrimUtils.distanceToClosedIntervalMidpoint(entity, cursorPoint, before.tLo, before.tHi, period);
            const afterDistance = TrimUtils.distanceToClosedIntervalMidpoint(entity, cursorPoint, after.tLo, after.tHi, period);
            return beforeDistance <= afterDistance ? before : after;
        }
        return null;
    }
    static distanceToClosedIntervalMidpoint(entity, point, tLo, tHi, period) {
        const span = ((tHi - tLo) % period + period) % period;
        const midT = (tLo + span / 2) % period;
        const midPoint = TrimUtils.getPointAtParam(entity, midT);
        return Math.hypot(point.x - midPoint.x, point.y - midPoint.y);
    }
    static trimCircle(entity, tLo, tHi) {
        if (TrimUtils.ccwSpan(tLo, tHi) < ANGLE_EPS) return {
            createdEntities: [],
            deleteEntities: []
        };
        return {
            createdEntities: [
                new __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_4760f106__.ArcEntity({
                    ...entity.serialize(),
                    id: (0, __WEBPACK_EXTERNAL_MODULE_nanoid__.nanoid)(),
                    type: __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Arc,
                    startAngle: TrimUtils.normalizeAngle(tHi),
                    endAngle: TrimUtils.normalizeAngle(tLo),
                    clockwise: false
                })
            ],
            deleteEntities: [
                entity
            ]
        };
    }
    static trimFullEllipse(entity, tLo, tHi) {
        if (TrimUtils.ccwSpan(tLo, tHi) < ANGLE_EPS) return {
            createdEntities: [],
            deleteEntities: []
        };
        const newEntity = entity.clone();
        Object.assign(newEntity, {
            id: (0, __WEBPACK_EXTERNAL_MODULE_nanoid__.nanoid)(),
            startAngle: TrimUtils.normalizeAngle(tHi),
            endAngle: TrimUtils.normalizeAngle(tLo)
        });
        return {
            createdEntities: [
                newEntity
            ],
            deleteEntities: [
                entity
            ]
        };
    }
    static deduplicateAndSort(arr) {
        const sorted = [
            ...arr
        ].sort((a, b)=>a - b);
        if (0 === sorted.length) return [];
        const result = [
            sorted[0]
        ];
        for(let i = 1; i < sorted.length; i++)if (Math.abs(sorted[i] - result[result.length - 1]) > EPS) result.push(sorted[i]);
        return result;
    }
    static normalizeAngle(angle) {
        const TWO_PI = 2 * Math.PI;
        return (angle % TWO_PI + TWO_PI) % TWO_PI;
    }
    static isAngleOnArc(angle, arcStart, arcEnd) {
        const a = TrimUtils.normalizeAngle(angle);
        const s = TrimUtils.normalizeAngle(arcStart);
        const e = TrimUtils.normalizeAngle(arcEnd);
        if (s <= e) return a >= s - ANGLE_EPS && a <= e + ANGLE_EPS;
        return a >= s - ANGLE_EPS || a <= e + ANGLE_EPS;
    }
    static ccwSpan(from, to) {
        return TrimUtils.normalizeAngle(to - from);
    }
    static directedSpan(from, to, clockwise) {
        return clockwise ? TrimUtils.ccwSpan(to, from) : TrimUtils.ccwSpan(from, to);
    }
    static isAngleOnDirectedArc(angle, arcStart, arcEnd, clockwise) {
        const sweep = TrimUtils.directedSpan(arcStart, arcEnd, clockwise) || 2 * Math.PI;
        const distanceFromStart = TrimUtils.directedSpan(arcStart, angle, clockwise);
        return distanceFromStart <= sweep + ANGLE_EPS;
    }
    static arcParamsFromBulge(p1, p2, bulge) {
        const dx = p2.x - p1.x, dy = p2.y - p1.y;
        const L = Math.hypot(dx, dy);
        if (L < 1e-12) return {
            cx: p1.x,
            cy: p1.y,
            radius: 0,
            startAngle: 0,
            endAngle: 0
        };
        const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
        const nx = -dy / L, ny = dx / L;
        const d_c = L / 2 * (1 - bulge * bulge) / (2 * bulge);
        const cx = mx + nx * d_c, cy = my + ny * d_c;
        const radius = Math.hypot(L / 2, d_c);
        return {
            cx,
            cy,
            radius,
            startAngle: Math.atan2(p1.y - cy, p1.x - cx),
            endAngle: Math.atan2(p2.y - cy, p2.x - cx)
        };
    }
}
export { TrimUtils };
