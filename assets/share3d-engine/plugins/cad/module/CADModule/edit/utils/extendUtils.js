import * as __WEBPACK_EXTERNAL_MODULE__utils_index_js_02c78a7f__ from "../../../utils/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__ from "../../model/common/constant.js";
function ccwAngleDist(from, to) {
    const TWO_PI = 2 * Math.PI;
    return ((to - from) % TWO_PI + TWO_PI) % TWO_PI;
}
function normalizeAngle(a) {
    const TWO_PI = 2 * Math.PI;
    return (a % TWO_PI + TWO_PI) % TWO_PI;
}
function raySegmentIntersection(origin, dir, A, B) {
    const edgeDx = B.x - A.x;
    const edgeDy = B.y - A.y;
    const det = -(dir.x * edgeDy - dir.y * edgeDx);
    if (Math.abs(det) < 1e-12) return null;
    const ox = A.x - origin.x;
    const oy = A.y - origin.y;
    const t = (ox * -edgeDy + oy * edgeDx) / det;
    const s = (dir.x * oy - dir.y * ox) / det;
    if (t <= 1e-8 || s < -0.00000001 || s > 1 + 1e-8) return null;
    return t;
}
function circleSegmentIntersections(center, radius, A, B) {
    const dx = B.x - A.x;
    const dy = B.y - A.y;
    const vx = A.x - center.x;
    const vy = A.y - center.y;
    const a = dx * dx + dy * dy;
    if (a < 1e-12) return [];
    const b = 2 * (vx * dx + vy * dy);
    const c = vx * vx + vy * vy - radius * radius;
    const disc = b * b - 4 * a * c;
    if (disc < 0) return [];
    const sqrtDisc = Math.sqrt(Math.max(0, disc));
    const points = [];
    for (const sign of [
        -1,
        1
    ]){
        const s = (-b + sign * sqrtDisc) / (2 * a);
        if (s >= -0.00000001 && s <= 1 + 1e-8) points.push({
            x: A.x + s * dx,
            y: A.y + s * dy
        });
    }
    return points;
}
function arcParamsFromBulge(p1, p2, bulge) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const L = Math.hypot(dx, dy);
    if (L < 1e-10) return null;
    const mx = (p1.x + p2.x) / 2;
    const my = (p1.y + p2.y) / 2;
    const nx = -dy / L;
    const ny = dx / L;
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
function sampleBulgeArc(p1, p2, bulge, numPts = 16) {
    const arc = arcParamsFromBulge(p1, p2, bulge);
    if (!arc) return [
        p1,
        p2
    ];
    const { cx, cy, radius, startAngle } = arc;
    const sweep = 4 * Math.atan(bulge);
    const pts = [];
    for(let i = 0; i <= numPts; i++){
        const angle = startAngle + i / numPts * sweep;
        pts.push({
            x: cx + radius * Math.cos(angle),
            y: cy + radius * Math.sin(angle)
        });
    }
    return pts;
}
class ExtendUtils {
    static #_ = this.EnabledEntityTypes = new Set([
        __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Polyline,
        __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Arc,
        __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Spline,
        __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Ray
    ]);
    static #_2 = this.BoundaryEntityTypes = new Set([
        __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Polyline,
        __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Arc,
        __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Circle,
        __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Ellipse,
        __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Spline,
        __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Ray
    ]);
    static isEntityExtendable(entity) {
        return ExtendUtils.EnabledEntityTypes.has(entity.type) && !((entity.type === __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Polyline || entity.type === __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Spline) && entity.isClosed);
    }
    static getEndPoints(entity) {
        switch(entity.type){
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Polyline:
                {
                    const poly = entity;
                    if (poly.isClosed || poly.vertices.length < 2) return null;
                    const v = poly.vertices;
                    return {
                        start: {
                            x: v[0].x,
                            y: v[0].y
                        },
                        end: {
                            x: v[v.length - 1].x,
                            y: v[v.length - 1].y
                        }
                    };
                }
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Arc:
                {
                    const arc = entity;
                    return {
                        start: {
                            x: arc.center.x + arc.radius * Math.cos(arc.startAngle),
                            y: arc.center.y + arc.radius * Math.sin(arc.startAngle)
                        },
                        end: {
                            x: arc.center.x + arc.radius * Math.cos(arc.endAngle),
                            y: arc.center.y + arc.radius * Math.sin(arc.endAngle)
                        }
                    };
                }
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Ray:
                {
                    const ray = entity;
                    const FAR = 1e5;
                    return {
                        start: {
                            x: ray.startPoint.x,
                            y: ray.startPoint.y
                        },
                        end: {
                            x: ray.startPoint.x + ray.unitVector.x * FAR,
                            y: ray.startPoint.y + ray.unitVector.y * FAR
                        }
                    };
                }
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Spline:
                {
                    const spline = entity;
                    if (spline.isClosed || spline.controlPoints.length < 2) return null;
                    const cp = spline.controlPoints;
                    return {
                        start: {
                            x: cp[0].x,
                            y: cp[0].y
                        },
                        end: {
                            x: cp[cp.length - 1].x,
                            y: cp[cp.length - 1].y
                        }
                    };
                }
            default:
                return null;
        }
    }
    static getNearestEnd(entity, point) {
        const ends = ExtendUtils.getEndPoints(entity);
        if (!ends) return null;
        const dStart = (point.x - ends.start.x) ** 2 + (point.y - ends.start.y) ** 2;
        const dEnd = (point.x - ends.end.x) ** 2 + (point.y - ends.end.y) ** 2;
        return dStart <= dEnd ? 'start' : 'end';
    }
    static findExtendPoint(entity, endType, boundaries) {
        switch(entity.type){
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Polyline:
                return ExtendUtils.findPolylineExtendPoint(entity, endType, boundaries);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Arc:
                return ExtendUtils.findArcExtendPoint(entity, endType, boundaries);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Ray:
                return ExtendUtils.findRayExtendPoint(entity, endType, boundaries);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Spline:
                return ExtendUtils.findSplineExtendPoint(entity, endType, boundaries);
            default:
                return null;
        }
    }
    static getExtendPreviewPoints(entity, endType, intersectionPoint) {
        if (entity.type === __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Ray && 'end' === endType) return [];
        if (entity.type === __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Arc) {
            const arc = entity;
            const fromAngle = 'end' === endType ? arc.endAngle : arc.startAngle;
            const toAngle = Math.atan2(intersectionPoint.y - arc.center.y, intersectionPoint.x - arc.center.x);
            return ExtendUtils.sampleArcExtension(arc, fromAngle, toAngle, endType, 24);
        }
        const ends = ExtendUtils.getEndPoints(entity);
        if (!ends) return [];
        const startPt = 'end' === endType ? ends.end : ends.start;
        return [
            startPt,
            intersectionPoint
        ];
    }
    static findPolylineExtendPoint(entity, endType, boundaries) {
        const verts = entity.vertices;
        if (verts.length < 2) return null;
        let origin;
        let dir;
        if ('end' === endType) {
            const v1 = verts[verts.length - 2];
            const v2 = verts[verts.length - 1];
            const len = Math.hypot(v2.x - v1.x, v2.y - v1.y);
            if (len < 1e-10) return null;
            origin = {
                x: v2.x,
                y: v2.y
            };
            dir = {
                x: (v2.x - v1.x) / len,
                y: (v2.y - v1.y) / len
            };
        } else {
            const v0 = verts[0];
            const v1 = verts[1];
            const len = Math.hypot(v0.x - v1.x, v0.y - v1.y);
            if (len < 1e-10) return null;
            origin = {
                x: v0.x,
                y: v0.y
            };
            dir = {
                x: (v0.x - v1.x) / len,
                y: (v0.y - v1.y) / len
            };
        }
        return ExtendUtils.findNearestRayIntersection(origin, dir, boundaries, entity);
    }
    static findArcExtendPoint(entity, endType, boundaries) {
        const { center, radius, clockwise } = entity;
        const arcStart = normalizeAngle(entity.startAngle);
        const arcEnd = normalizeAngle(entity.endAngle);
        const arcSpan = clockwise ? ccwAngleDist(arcEnd, arcStart) : ccwAngleDist(arcStart, arcEnd);
        const gapSize = 2 * Math.PI - arcSpan;
        let bestPt = null;
        let bestDist = 1 / 0;
        for (const boundary of boundaries){
            if (boundary === entity) continue;
            const segs = ExtendUtils.getBoundarySegments(boundary);
            for (const [A, B] of segs){
                const intersections = circleSegmentIntersections(center, radius, A, B);
                for (const pt of intersections){
                    const angle = normalizeAngle(Math.atan2(pt.y - center.y, pt.x - center.x));
                    let dist;
                    dist = clockwise ? 'end' === endType ? ccwAngleDist(angle, arcEnd) : ccwAngleDist(arcStart, angle) : 'end' === endType ? ccwAngleDist(arcEnd, angle) : ccwAngleDist(angle, arcStart);
                    if (dist > 1e-6 && dist < gapSize && dist < bestDist) {
                        bestDist = dist;
                        bestPt = pt;
                    }
                }
            }
        }
        return bestPt;
    }
    static sampleArcExtension(arc, fromAngle, toAngle, endType, numPts) {
        const { center, radius, clockwise } = arc;
        let sweep;
        sweep = clockwise ? 'end' === endType ? -ccwAngleDist(toAngle, fromAngle) : ccwAngleDist(fromAngle, toAngle) : 'end' === endType ? ccwAngleDist(fromAngle, toAngle) : -ccwAngleDist(toAngle, fromAngle);
        if (Math.abs(sweep) < 1e-6) return [];
        const pts = [];
        for(let i = 0; i <= numPts; i++){
            const angle = fromAngle + i / numPts * sweep;
            pts.push({
                x: center.x + radius * Math.cos(angle),
                y: center.y + radius * Math.sin(angle)
            });
        }
        return pts;
    }
    static findRayExtendPoint(entity, endType, boundaries) {
        if ('start' !== endType) return null;
        const { startPoint, unitVector } = entity;
        const dir = {
            x: -unitVector.x,
            y: -unitVector.y
        };
        return ExtendUtils.findNearestRayIntersection({
            x: startPoint.x,
            y: startPoint.y
        }, dir, boundaries, entity);
    }
    static findSplineExtendPoint(entity, endType, boundaries) {
        const cp = entity.controlPoints;
        if (cp.length < 2) return null;
        let origin;
        let dir;
        if ('end' === endType) {
            const p1 = cp[cp.length - 2];
            const p2 = cp[cp.length - 1];
            const len = Math.hypot(p2.x - p1.x, p2.y - p1.y);
            if (len < 1e-10) return null;
            origin = {
                x: p2.x,
                y: p2.y
            };
            dir = {
                x: (p2.x - p1.x) / len,
                y: (p2.y - p1.y) / len
            };
        } else {
            const p0 = cp[0];
            const p1 = cp[1];
            const len = Math.hypot(p0.x - p1.x, p0.y - p1.y);
            if (len < 1e-10) return null;
            origin = {
                x: p0.x,
                y: p0.y
            };
            dir = {
                x: (p0.x - p1.x) / len,
                y: (p0.y - p1.y) / len
            };
        }
        return ExtendUtils.findNearestRayIntersection(origin, dir, boundaries, entity);
    }
    static findNearestRayIntersection(origin, dir, boundaries, exclude) {
        let bestT = 1 / 0;
        let bestPt = null;
        for (const boundary of boundaries){
            if (boundary === exclude) continue;
            const segs = ExtendUtils.getBoundarySegments(boundary);
            for (const [A, B] of segs){
                const t = raySegmentIntersection(origin, dir, A, B);
                if (null !== t && t > 1e-8 && t < bestT) {
                    bestT = t;
                    bestPt = {
                        x: origin.x + t * dir.x,
                        y: origin.y + t * dir.y
                    };
                }
            }
        }
        return bestPt;
    }
    static getBoundarySegments(entity) {
        const segs = [];
        switch(entity.type){
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Polyline:
                {
                    const poly = entity;
                    const v = poly.vertices;
                    for(let i = 0; i < v.length - 1; i++){
                        const bulge = v[i].bulge ?? 0;
                        if (Math.abs(bulge) < 1e-10) segs.push([
                            {
                                x: v[i].x,
                                y: v[i].y
                            },
                            {
                                x: v[i + 1].x,
                                y: v[i + 1].y
                            }
                        ]);
                        else {
                            const pts = sampleBulgeArc({
                                x: v[i].x,
                                y: v[i].y
                            }, {
                                x: v[i + 1].x,
                                y: v[i + 1].y
                            }, bulge, 16);
                            for(let j = 0; j < pts.length - 1; j++)segs.push([
                                pts[j],
                                pts[j + 1]
                            ]);
                        }
                    }
                    if (poly.isClosed && v.length > 1) {
                        const last = v[v.length - 1];
                        const first = v[0];
                        segs.push([
                            {
                                x: last.x,
                                y: last.y
                            },
                            {
                                x: first.x,
                                y: first.y
                            }
                        ]);
                    }
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Arc:
                {
                    const arc = entity;
                    const pts = ExtendUtils.sampleArc(arc, 48);
                    for(let i = 0; i < pts.length - 1; i++)segs.push([
                        pts[i],
                        pts[i + 1]
                    ]);
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Circle:
                {
                    const circle = entity;
                    const pts = ExtendUtils.sampleCircle(circle, 64);
                    for(let i = 0; i < pts.length; i++)segs.push([
                        pts[i],
                        pts[(i + 1) % pts.length]
                    ]);
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Ellipse:
                {
                    const ell = entity;
                    const pts = ExtendUtils.sampleEllipse(ell, 64);
                    for(let i = 0; i < pts.length; i++)segs.push([
                        pts[i],
                        pts[(i + 1) % pts.length]
                    ]);
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Spline:
                {
                    const spl = entity;
                    const pts = ExtendUtils.sampleSpline(spl, 64);
                    for(let i = 0; i < pts.length - 1; i++)segs.push([
                        pts[i],
                        pts[i + 1]
                    ]);
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Ray:
                {
                    const ray = entity;
                    const FAR = 1e5;
                    segs.push([
                        {
                            x: ray.startPoint.x,
                            y: ray.startPoint.y
                        },
                        {
                            x: ray.startPoint.x + ray.unitVector.x * FAR,
                            y: ray.startPoint.y + ray.unitVector.y * FAR
                        }
                    ]);
                    break;
                }
        }
        return segs;
    }
    static sampleArc(arc, numPts) {
        const { center, radius, startAngle, clockwise } = arc;
        const sweep = clockwise ? -ccwAngleDist(arc.endAngle, arc.startAngle) : ccwAngleDist(arc.startAngle, arc.endAngle);
        const actualSweep = 0 === sweep ? 2 * Math.PI * (clockwise ? -1 : 1) : sweep;
        const pts = [];
        for(let i = 0; i <= numPts; i++){
            const angle = startAngle + i / numPts * actualSweep;
            pts.push({
                x: center.x + radius * Math.cos(angle),
                y: center.y + radius * Math.sin(angle)
            });
        }
        return pts;
    }
    static sampleCircle(circle, numPts) {
        const pts = [];
        for(let i = 0; i < numPts; i++){
            const angle = i / numPts * Math.PI * 2;
            pts.push({
                x: circle.center.x + circle.radius * Math.cos(angle),
                y: circle.center.y + circle.radius * Math.sin(angle)
            });
        }
        return pts;
    }
    static sampleEllipse(ell, numPts) {
        const rX = ell.radiusX;
        const rY = ell.radiusY;
        const rot = ell.rotation;
        const cosR = Math.cos(rot);
        const sinR = Math.sin(rot);
        const { startAngle, endAngle, clockwise, center } = ell;
        const sweep = clockwise ? -ccwAngleDist(endAngle, startAngle) : ccwAngleDist(startAngle, endAngle);
        const actualSweep = 0 === sweep ? 2 * Math.PI * (clockwise ? -1 : 1) : sweep;
        const pts = [];
        for(let i = 0; i <= numPts; i++){
            const t = startAngle + i / numPts * actualSweep;
            const lx = rX * Math.cos(t);
            const ly = rY * Math.sin(t);
            pts.push({
                x: center.x + lx * cosR - ly * sinR,
                y: center.y + lx * sinR + ly * cosR
            });
        }
        return pts;
    }
    static sampleSpline(spl, numPts) {
        if (!spl.knots || !spl.controlPoints || null == spl.degree) return [];
        const uMin = spl.knots[spl.degree] ?? 0;
        const uMax = (spl.knots[spl.knots.length - spl.degree - 1] ?? 1) - 1e-9;
        const pts = [];
        for(let i = 0; i <= numPts; i++){
            const u = uMin + i / numPts * (uMax - uMin);
            const pt = __WEBPACK_EXTERNAL_MODULE__utils_index_js_02c78a7f__.SplineUtils.evaluateBSpline(u, spl.controlPoints, spl.knots, spl.degree);
            pts.push({
                x: pt.x,
                y: pt.y
            });
        }
        return pts;
    }
}
export { ExtendUtils };
