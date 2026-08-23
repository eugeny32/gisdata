import * as __WEBPACK_EXTERNAL_MODULE_nanoid__ from "nanoid";
import * as __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__ from "../../model/common/constant.js";
import * as __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_4760f106__ from "../../model/entity/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_index_js_02c78a7f__ from "../../../utils/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_2967608e__ from "../../../../../../shared/logging/index.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_2967608e__.getLoggerManager)().getLogger('cad');
const SPLINE_SAMPLE_NUM = 200;
const SPLINE_FIT_NUM = 16;
class BreakUtils {
    static #_ = this.EnabledEntityTypes = new Set([
        __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Polyline,
        __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Arc,
        __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Circle,
        __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Ellipse,
        __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Spline,
        __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Ray
    ]);
    static breakEntity(entity, params) {
        switch(entity.type){
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Polyline:
                return BreakUtils.breakPolyline(entity, params.firstPoint, params.secondPoint);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Arc:
                return BreakUtils.breakArc(entity, params.firstPoint, params.secondPoint);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Circle:
                return BreakUtils.breakCircle(entity, params.firstPoint, params.secondPoint);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Spline:
                return BreakUtils.breakSpline(entity, params.firstPoint, params.secondPoint);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Ellipse:
                return BreakUtils.breakEllipse(entity, params.firstPoint, params.secondPoint);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Ray:
                return BreakUtils.breakRay(entity, params.firstPoint, params.secondPoint);
            default:
                log.warn(`Break operation not implemented for entity type: ${entity.type}`);
                return {
                    createdEntities: [],
                    deleteEntities: []
                };
        }
    }
    static arcParamsFromBulge(p1, p2, bulge) {
        const dx = p2.x - p1.x, dy = p2.y - p1.y;
        const L = Math.hypot(dx, dy);
        const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
        const nx = -dy / L, ny = dx / L;
        const d_c = L / 2 * (1 - bulge * bulge) / (2 * bulge);
        const cx = mx + nx * d_c;
        const cy = my + ny * d_c;
        const radius = Math.hypot(L / 2, d_c);
        const startAngle = Math.atan2(p1.y - cy, p1.x - cx);
        const endAngle = Math.atan2(p2.y - cy, p2.x - cx);
        return {
            cx,
            cy,
            radius,
            startAngle,
            endAngle
        };
    }
    static projectPointOnArcSegment(p, p1, p2, bulge) {
        const { cx, cy, radius, startAngle } = BreakUtils.arcParamsFromBulge(p1, p2, bulge);
        const angle = Math.atan2(p.y - cy, p.x - cx);
        const sweep = 4 * Math.atan(bulge);
        let delta = angle - startAngle;
        if (sweep > 0) {
            while(delta < 0)delta += 2 * Math.PI;
            while(delta > 2 * Math.PI)delta -= 2 * Math.PI;
        } else {
            while(delta > 0)delta -= 2 * Math.PI;
            while(delta < 2 * -Math.PI)delta += 2 * Math.PI;
        }
        const t = Math.max(0, Math.min(1, delta / sweep));
        const clampedAngle = startAngle + t * sweep;
        return {
            t,
            point: {
                x: cx + radius * Math.cos(clampedAngle),
                y: cy + radius * Math.sin(clampedAngle)
            }
        };
    }
    static splitArcSegment(p1, p2, bulge, t) {
        const { cx, cy, radius, startAngle } = BreakUtils.arcParamsFromBulge(p1, p2, bulge);
        const sweep = 4 * Math.atan(bulge);
        const midAngle = startAngle + t * sweep;
        const splitPoint = {
            x: cx + radius * Math.cos(midAngle),
            y: cy + radius * Math.sin(midAngle)
        };
        const bulge1 = Math.tan(sweep * t / 4);
        const bulge2 = Math.tan(sweep * (1 - t) / 4);
        return {
            splitPoint,
            bulge1,
            bulge2
        };
    }
    static projectPointOnPolyline(p, vertices) {
        let bestT = 0;
        let bestDistSq = 1 / 0;
        let bestPoint = {
            ...vertices[0]
        };
        for(let i = 0; i < vertices.length - 1; i++){
            const v1 = vertices[i], v2 = vertices[i + 1];
            const bulge = v1.bulge ?? 0;
            let t;
            let point;
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
                const result = BreakUtils.projectPointOnArcSegment(p, v1, v2, bulge);
                t = result.t;
                point = result.point;
            }
            const dx = p.x - point.x, dy = p.y - point.y;
            const distSq = dx * dx + dy * dy;
            if (distSq < bestDistSq) {
                bestDistSq = distSq;
                bestT = i + t;
                bestPoint = point;
            }
        }
        return {
            t: bestT,
            point: bestPoint
        };
    }
    static clipPolylineSegment(vertices, tStart, tEnd) {
        if (tEnd - tStart < 1e-10) return [];
        const n = vertices.length;
        const result = [];
        const iStart = Math.min(Math.floor(tStart), n - 2);
        const iEnd = Math.min(Math.floor(tEnd), n - 2);
        const fracStart = tStart - iStart;
        const v1s = vertices[iStart], v2s = vertices[iStart + 1];
        const bulgeS = v1s.bulge ?? 0;
        let startPt;
        if (fracStart < 1e-10) startPt = {
            ...v1s
        };
        else if (Math.abs(bulgeS) < 1e-10) startPt = {
            x: v1s.x + (v2s.x - v1s.x) * fracStart,
            y: v1s.y + (v2s.y - v1s.y) * fracStart,
            bulge: 0
        };
        else {
            const { splitPoint, bulge2 } = BreakUtils.splitArcSegment(v1s, v2s, bulgeS, fracStart);
            startPt = {
                x: splitPoint.x,
                y: splitPoint.y,
                bulge: bulge2
            };
        }
        result.push(startPt);
        if (iStart === iEnd) {
            const iE = Math.floor(tEnd);
            const actualFracEnd = tEnd - iE;
            if (actualFracEnd < 1e-10) {
                if (iE > iStart) result.push({
                    ...vertices[iE]
                });
            } else {
                const bulge0 = vertices[iStart].bulge ?? 0;
                if (Math.abs(bulge0) < 1e-10) {
                    const v2 = vertices[iStart + 1];
                    result.push({
                        x: vertices[iStart].x + (v2.x - vertices[iStart].x) * actualFracEnd,
                        y: vertices[iStart].y + (v2.y - vertices[iStart].y) * actualFracEnd,
                        bulge: 0
                    });
                } else {
                    const { splitPoint: sp1, bulge2: b_remain } = BreakUtils.splitArcSegment(vertices[iStart], vertices[iStart + 1], bulge0, fracStart);
                    const tInRemain = (actualFracEnd - fracStart) / (1 - fracStart);
                    const { splitPoint: endPt, bulge1: b_clip } = BreakUtils.splitArcSegment(sp1, vertices[iStart + 1], b_remain, Math.max(0, Math.min(1, tInRemain)));
                    result[0] = {
                        ...result[0],
                        bulge: b_clip
                    };
                    result.push({
                        x: endPt.x,
                        y: endPt.y,
                        bulge: 0
                    });
                }
            }
            return result.length >= 2 ? result : [];
        }
        for(let i = iStart + 1; i <= iEnd; i++)result.push({
            ...vertices[i]
        });
        const actualFracEnd = tEnd - iEnd;
        const v1e = vertices[iEnd], v2e = vertices[iEnd + 1];
        const bulgeE = v1e.bulge ?? 0;
        if (actualFracEnd < 1e-10) ;
        else if (Math.abs(bulgeE) < 1e-10) {
            result[result.length - 1] = {
                ...v1e,
                bulge: 0
            };
            result.push({
                x: v1e.x + (v2e.x - v1e.x) * actualFracEnd,
                y: v1e.y + (v2e.y - v1e.y) * actualFracEnd,
                bulge: 0
            });
        } else {
            const { splitPoint, bulge1 } = BreakUtils.splitArcSegment(v1e, v2e, bulgeE, actualFracEnd);
            result[result.length - 1] = {
                ...v1e,
                bulge: bulge1
            };
            result.push({
                x: splitPoint.x,
                y: splitPoint.y,
                bulge: 0
            });
        }
        return result.length >= 2 ? result : [];
    }
    static breakPolyline(entity, p1, p2) {
        const vertices = entity.vertices;
        if (vertices.length < 2) return {
            createdEntities: [],
            deleteEntities: []
        };
        return entity.isClosed ? BreakUtils.breakClosedPolyline(entity, p1, p2) : BreakUtils.breakOpenPolyline(entity, p1, p2);
    }
    static clipOpenPolylineToInterval(entity, tStart, tEnd) {
        if (entity.isClosed || entity.vertices.length < 2) return null;
        const maxT = entity.vertices.length - 1;
        const clipped = BreakUtils.clipPolylineSegment(entity.vertices, Math.max(0, Math.min(tStart, maxT)), Math.max(0, Math.min(tEnd, maxT)));
        if (clipped.length < 2) return null;
        const newEntity = entity.clone();
        Object.assign(newEntity, {
            id: (0, __WEBPACK_EXTERNAL_MODULE_nanoid__.nanoid)(),
            vertices: clipped,
            isClosed: false
        });
        return newEntity;
    }
    static breakOpenPolyline(entity, p1, p2) {
        const results = {
            createdEntities: [],
            deleteEntities: []
        };
        const vertices = entity.vertices;
        const { t: t1 } = BreakUtils.projectPointOnPolyline(p1, vertices);
        const { t: t2 } = BreakUtils.projectPointOnPolyline(p2, vertices);
        const tStart = Math.min(t1, t2);
        const tEnd = Math.max(t1, t2);
        const maxT = vertices.length - 1;
        const buildSeg = (from, to)=>{
            const seg = BreakUtils.clipPolylineSegment(vertices, from, to);
            if (seg.length < 2) return null;
            const e = entity.clone();
            Object.assign(e, {
                id: (0, __WEBPACK_EXTERNAL_MODULE_nanoid__.nanoid)(),
                vertices: seg,
                isClosed: false
            });
            return e;
        };
        if (tStart > 1e-6) {
            const seg = buildSeg(0, tStart);
            if (seg) results.createdEntities.push(seg);
        }
        if (tEnd < maxT - 1e-6) {
            const seg = buildSeg(tEnd, maxT);
            if (seg) results.createdEntities.push(seg);
        }
        if (results.createdEntities.length > 0) results.deleteEntities.push(entity);
        return results;
    }
    static breakClosedPolyline(entity, p1, p2) {
        const results = {
            createdEntities: [],
            deleteEntities: []
        };
        const vertices = entity.vertices;
        const n = vertices.length;
        const extendedVertices = [
            ...vertices,
            {
                x: vertices[0].x,
                y: vertices[0].y,
                bulge: 0
            }
        ];
        const { t: t1 } = BreakUtils.projectPointOnPolyline(p1, extendedVertices);
        const { t: t2 } = BreakUtils.projectPointOnPolyline(p2, extendedVertices);
        const tStart = Math.min(t1, t2);
        const tEnd = Math.max(t1, t2);
        const maxT = n;
        const EPS = 1e-6;
        if (tEnd - tStart < EPS) return results;
        const rawSeg2 = tEnd < maxT - EPS ? BreakUtils.clipPolylineSegment(extendedVertices, tEnd, maxT) : null;
        const rawSeg1 = tStart > EPS ? BreakUtils.clipPolylineSegment(extendedVertices, 0, tStart) : null;
        let combined = [];
        if (rawSeg2 && rawSeg2.length >= 1 && rawSeg1 && rawSeg1.length >= 1) {
            const last = rawSeg2[rawSeg2.length - 1];
            const first = rawSeg1[0];
            combined = Math.abs(last.x - first.x) < EPS && Math.abs(last.y - first.y) < EPS ? [
                ...rawSeg2.slice(0, -1),
                first,
                ...rawSeg1.slice(1)
            ] : [
                ...rawSeg2,
                ...rawSeg1
            ];
        } else if (rawSeg2) combined = rawSeg2;
        else if (rawSeg1) combined = rawSeg1;
        results.deleteEntities.push(entity);
        if (combined.length >= 2) {
            const newEntity = entity.clone();
            Object.assign(newEntity, {
                id: (0, __WEBPACK_EXTERNAL_MODULE_nanoid__.nanoid)(),
                vertices: combined,
                isClosed: false
            });
            results.createdEntities.push(newEntity);
        }
        return results;
    }
    static normalizeAngle(angle) {
        const TWO_PI = 2 * Math.PI;
        return (angle % TWO_PI + TWO_PI) % TWO_PI;
    }
    static projectAngleOnCircle(p, center) {
        return BreakUtils.normalizeAngle(Math.atan2(p.y - center.y, p.x - center.x));
    }
    static isAngleOnArc(angle, arcStart, arcEnd) {
        const a = BreakUtils.normalizeAngle(angle);
        const s = BreakUtils.normalizeAngle(arcStart);
        const e = BreakUtils.normalizeAngle(arcEnd);
        if (s <= e) return a >= s && a <= e;
        return a >= s || a <= e;
    }
    static ccwSpan(from, to) {
        return BreakUtils.normalizeAngle(to - from);
    }
    static directedSpan(from, to, clockwise) {
        return clockwise ? BreakUtils.ccwSpan(to, from) : BreakUtils.ccwSpan(from, to);
    }
    static angularDistance(a, b) {
        const span = BreakUtils.ccwSpan(a, b);
        return Math.min(span, 2 * Math.PI - span);
    }
    static breakArc(entity, p1, p2) {
        const { center, startAngle, endAngle, clockwise } = entity;
        const arcStart = BreakUtils.normalizeAngle(startAngle);
        const arcEnd = BreakUtils.normalizeAngle(endAngle);
        const arcSweep = BreakUtils.directedSpan(arcStart, arcEnd, clockwise);
        const EPS = 1e-6;
        const results = {
            createdEntities: [],
            deleteEntities: []
        };
        if (arcSweep < EPS) return results;
        const clampToArc = (a)=>{
            const normalized = BreakUtils.normalizeAngle(a);
            if (BreakUtils.directedSpan(arcStart, normalized, clockwise) <= arcSweep + EPS) return normalized;
            return BreakUtils.angularDistance(normalized, arcStart) <= BreakUtils.angularDistance(normalized, arcEnd) ? arcStart : arcEnd;
        };
        let a1 = clampToArc(BreakUtils.projectAngleOnCircle(p1, center));
        let a2 = clampToArc(BreakUtils.projectAngleOnCircle(p2, center));
        if (BreakUtils.directedSpan(arcStart, a1, clockwise) > BreakUtils.directedSpan(arcStart, a2, clockwise)) [a1, a2] = [
            a2,
            a1
        ];
        if (BreakUtils.directedSpan(arcStart, a1, clockwise) > EPS) {
            const newEntity = entity.clone();
            Object.assign(newEntity, {
                id: (0, __WEBPACK_EXTERNAL_MODULE_nanoid__.nanoid)(),
                startAngle: arcStart,
                endAngle: a1
            });
            results.createdEntities.push(newEntity);
        }
        if (BreakUtils.directedSpan(a2, arcEnd, clockwise) > EPS) {
            const newEntity = entity.clone();
            Object.assign(newEntity, {
                id: (0, __WEBPACK_EXTERNAL_MODULE_nanoid__.nanoid)(),
                startAngle: a2,
                endAngle: arcEnd
            });
            results.createdEntities.push(newEntity);
        }
        if (results.createdEntities.length > 0) results.deleteEntities.push(entity);
        return results;
    }
    static breakCircle(entity, p1, p2) {
        const { center } = entity;
        const a1 = BreakUtils.projectAngleOnCircle(p1, center);
        const a2 = BreakUtils.projectAngleOnCircle(p2, center);
        const results = {
            createdEntities: [],
            deleteEntities: []
        };
        if (Math.abs(BreakUtils.normalizeAngle(a1 - a2)) < 1e-6) return results;
        const newEntity = new __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_4760f106__.ArcEntity({
            ...entity.serialize(),
            id: (0, __WEBPACK_EXTERNAL_MODULE_nanoid__.nanoid)(),
            type: __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Arc,
            startAngle: a2,
            endAngle: a1
        });
        if (newEntity) {
            results.createdEntities.push(newEntity);
            results.deleteEntities.push(entity);
        }
        return results;
    }
    static getSplineParamRange(entity) {
        const { knots, degree } = entity;
        const uMin = knots[degree] ?? 0;
        const uMax = (knots[knots.length - degree - 1] ?? 1) - 1e-9;
        return {
            uMin,
            uMax
        };
    }
    static projectOnSpline(p, entity) {
        const { uMin, uMax } = BreakUtils.getSplineParamRange(entity);
        let bestU = uMin;
        let bestDistSq = 1 / 0;
        for(let i = 0; i <= SPLINE_SAMPLE_NUM; i++){
            const u = uMin + i / SPLINE_SAMPLE_NUM * (uMax - uMin);
            const pt = __WEBPACK_EXTERNAL_MODULE__utils_index_js_02c78a7f__.SplineUtils.evaluateBSpline(u, entity.controlPoints, entity.knots, entity.degree);
            const dx = p.x - pt.x, dy = p.y - pt.y;
            const distSq = dx * dx + dy * dy;
            if (distSq < bestDistSq) {
                bestDistSq = distSq;
                bestU = u;
            }
        }
        return bestU;
    }
    static sampleSplineSegment(entity, uStart, uEnd, numPts) {
        const pts = [];
        for(let i = 0; i <= numPts; i++){
            const u = uStart + i / numPts * (uEnd - uStart);
            pts.push(__WEBPACK_EXTERNAL_MODULE__utils_index_js_02c78a7f__.SplineUtils.evaluateBSpline(u, entity.controlPoints, entity.knots, entity.degree));
        }
        return pts;
    }
    static breakSpline(entity, p1, p2) {
        const results = {
            createdEntities: [],
            deleteEntities: []
        };
        const { uMin, uMax } = BreakUtils.getSplineParamRange(entity);
        const u1 = BreakUtils.projectOnSpline(p1, entity);
        const u2 = BreakUtils.projectOnSpline(p2, entity);
        const uStart = Math.min(u1, u2);
        const uEnd = Math.max(u1, u2);
        const EPS = (uMax - uMin) * 1e-4;
        const buildSegment = (from, to)=>{
            if (to - from <= EPS) return null;
            const fitPts = BreakUtils.sampleSplineSegment(entity, from, to, SPLINE_FIT_NUM);
            if (fitPts.length < 2) return null;
            try {
                const { controlPoints, knots, degree } = __WEBPACK_EXTERNAL_MODULE__utils_index_js_02c78a7f__.SplineUtils.fitPointsToSpline(fitPts);
                const newEntity = entity.clone();
                Object.assign(newEntity, {
                    id: (0, __WEBPACK_EXTERNAL_MODULE_nanoid__.nanoid)(),
                    method: 'FIT',
                    fitPoints: fitPts,
                    controlPoints,
                    knots,
                    degree,
                    isClosed: false,
                    startTangent: void 0,
                    endTangent: void 0
                });
                return newEntity;
            } catch  {
                return null;
            }
        };
        const seg1 = buildSegment(uMin, uStart);
        if (seg1) results.createdEntities.push(seg1);
        const seg2 = buildSegment(uEnd, uMax);
        if (seg2) results.createdEntities.push(seg2);
        if (results.createdEntities.length > 0) results.deleteEntities.push(entity);
        return results;
    }
    static projectAngleOnEllipse(p, entity) {
        const { center, radiusX, radiusY, rotation } = entity;
        const dx = p.x - center.x, dy = p.y - center.y;
        const cosR = Math.cos(rotation), sinR = Math.sin(rotation);
        const u = dx * cosR + dy * sinR;
        const v = -dx * sinR + dy * cosR;
        return BreakUtils.normalizeAngle(Math.atan2(v / radiusY, u / radiusX));
    }
    static breakEllipse(entity, p1, p2) {
        const results = {
            createdEntities: [],
            deleteEntities: []
        };
        const arcStart = BreakUtils.normalizeAngle(entity.startAngle);
        const arcEnd = BreakUtils.normalizeAngle(entity.endAngle);
        const isFullEllipse = BreakUtils.ccwSpan(arcStart, arcEnd) < 1e-6;
        if (isFullEllipse) {
            const a1 = BreakUtils.projectAngleOnEllipse(p1, entity);
            const a2 = BreakUtils.projectAngleOnEllipse(p2, entity);
            if (Math.abs(BreakUtils.normalizeAngle(a1 - a2)) < 1e-6) return results;
            const newEntity = entity.clone();
            Object.assign(newEntity, {
                id: (0, __WEBPACK_EXTERNAL_MODULE_nanoid__.nanoid)(),
                startAngle: a2,
                endAngle: a1
            });
            results.createdEntities.push(newEntity);
            results.deleteEntities.push(entity);
            return results;
        }
        const clampToArc = (a)=>{
            if (BreakUtils.isAngleOnArc(a, arcStart, arcEnd)) return a;
            const dStart = BreakUtils.ccwSpan(arcStart, a);
            const dEnd = BreakUtils.ccwSpan(a, arcEnd);
            return dStart <= dEnd ? arcStart : arcEnd;
        };
        let a1 = clampToArc(BreakUtils.projectAngleOnEllipse(p1, entity));
        let a2 = clampToArc(BreakUtils.projectAngleOnEllipse(p2, entity));
        if (BreakUtils.ccwSpan(arcStart, a1) > BreakUtils.ccwSpan(arcStart, a2)) [a1, a2] = [
            a2,
            a1
        ];
        const EPS = 1e-6;
        if (BreakUtils.ccwSpan(arcStart, a1) > EPS) {
            const newEntity = entity.clone();
            Object.assign(newEntity, {
                id: (0, __WEBPACK_EXTERNAL_MODULE_nanoid__.nanoid)(),
                startAngle: arcStart,
                endAngle: a1
            });
            results.createdEntities.push(newEntity);
        }
        if (BreakUtils.ccwSpan(a2, arcEnd) > EPS) {
            const newEntity = entity.clone();
            Object.assign(newEntity, {
                id: (0, __WEBPACK_EXTERNAL_MODULE_nanoid__.nanoid)(),
                startAngle: a2,
                endAngle: arcEnd
            });
            results.createdEntities.push(newEntity);
        }
        if (results.createdEntities.length > 0) results.deleteEntities.push(entity);
        return results;
    }
    static clipClosedPolylineToInterval(entity, tStart, tEnd) {
        const vertices = entity.vertices;
        if (vertices.length < 2) return null;
        const extendedVertices = [
            ...vertices,
            {
                x: vertices[0].x,
                y: vertices[0].y,
                bulge: 0
            }
        ];
        const clipped = BreakUtils.clipPolylineSegment(extendedVertices, tStart, tEnd);
        if (clipped.length < 2) return null;
        const newEntity = entity.clone();
        Object.assign(newEntity, {
            id: (0, __WEBPACK_EXTERNAL_MODULE_nanoid__.nanoid)(),
            vertices: clipped,
            isClosed: false
        });
        return newEntity;
    }
    static breakRay(entity, p1, p2) {
        const results = {
            createdEntities: [],
            deleteEntities: []
        };
        const { startPoint, unitVector } = entity;
        const projectOnRay = (p)=>Math.max(0, (p.x - startPoint.x) * unitVector.x + (p.y - startPoint.y) * unitVector.y);
        const t1 = projectOnRay(p1);
        const t2 = projectOnRay(p2);
        const tStart = Math.min(t1, t2);
        const tEnd = Math.max(t1, t2);
        if (tEnd - tStart < 1e-10) return results;
        if (tStart > 1e-6) {
            const seg = new __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_4760f106__.PolylineEntity({
                id: (0, __WEBPACK_EXTERNAL_MODULE_nanoid__.nanoid)(),
                layerId: entity.layerId,
                colorMethod: entity.colorMethod,
                color: entity.color,
                lineType: entity.lineType,
                lineWidth: entity.lineWidth,
                vertices: [
                    {
                        x: startPoint.x,
                        y: startPoint.y,
                        bulge: 0
                    },
                    {
                        x: startPoint.x + tStart * unitVector.x,
                        y: startPoint.y + tStart * unitVector.y,
                        bulge: 0
                    }
                ],
                isClosed: false
            });
            results.createdEntities.push(seg);
        }
        const newRay = entity.clone();
        Object.assign(newRay, {
            id: (0, __WEBPACK_EXTERNAL_MODULE_nanoid__.nanoid)(),
            startPoint: {
                x: startPoint.x + tEnd * unitVector.x,
                y: startPoint.y + tEnd * unitVector.y
            }
        });
        results.createdEntities.push(newRay);
        results.deleteEntities.push(entity);
        return results;
    }
}
export { BreakUtils };
