import * as __WEBPACK_EXTERNAL_MODULE_nanoid__ from "nanoid";
import * as __WEBPACK_EXTERNAL_MODULE__utils_index_js_02c78a7f__ from "../../../utils/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_2967608e__ from "../../../../../../shared/logging/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__ from "../../model/common/constant.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_2967608e__.getLoggerManager)().getLogger('cad');
class OffsetUtils {
    static #_ = this.EnabledEntityTypes = new Set([
        __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Polyline,
        __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Arc,
        __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Circle,
        __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Spline,
        __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Ellipse
    ]);
    static offsetEntity(entity, params) {
        const { distance, side } = params;
        const d = distance * side;
        switch(entity.type){
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Circle:
                {
                    const circle = entity;
                    const newRadius = circle.radius + d;
                    if (newRadius <= 0) return null;
                    const cloned = circle.clone();
                    cloned.id = (0, __WEBPACK_EXTERNAL_MODULE_nanoid__.nanoid)();
                    cloned.radius = newRadius;
                    return cloned;
                }
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Arc:
                {
                    const arc = entity;
                    const newRadius = arc.radius + d;
                    if (newRadius <= 0) return null;
                    const cloned = arc.clone();
                    cloned.id = (0, __WEBPACK_EXTERNAL_MODULE_nanoid__.nanoid)();
                    cloned.radius = newRadius;
                    return cloned;
                }
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Polyline:
                return OffsetUtils.offsetPolyline(entity, d);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Spline:
                return OffsetUtils.offsetSpline(entity, d);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Ellipse:
                return OffsetUtils.offsetEllipse(entity, d);
            default:
                log.warn(`Offset operation not implemented for entity type: ${entity.type}`);
                return null;
        }
    }
    static offsetPolyline(polyline, d) {
        const verts = polyline.vertices;
        if (verts.length < 2) return null;
        const arcFromBulge = (p1, p2, b)=>{
            const dx = p2.x - p1.x, dy = p2.y - p1.y;
            const L = Math.hypot(dx, dy);
            if (L < 1e-10) return null;
            const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
            const nx = -dy / L, ny = dx / L;
            const d_c = L / 2 * (1 - b * b) / (2 * b);
            const cx = mx + nx * d_c;
            const cy = my + ny * d_c;
            const radius = Math.hypot(L / 2, d_c);
            return {
                cx,
                cy,
                radius
            };
        };
        const lineLineIntersect = (p1, p2, p3, p4)=>{
            const dx1 = p2.x - p1.x, dy1 = p2.y - p1.y;
            const dx2 = p4.x - p3.x, dy2 = p4.y - p3.y;
            const denom = dx1 * dy2 - dy1 * dx2;
            if (Math.abs(denom) < 1e-10) return {
                x: (p2.x + p3.x) / 2,
                y: (p2.y + p3.y) / 2
            };
            const t = ((p3.x - p1.x) * dy2 - (p3.y - p1.y) * dx2) / denom;
            return {
                x: p1.x + t * dx1,
                y: p1.y + t * dy1
            };
        };
        const lineCircleIntersect = (lp1, lp2, cx, cy, r, refPt)=>{
            const dx = lp2.x - lp1.x, dy = lp2.y - lp1.y;
            const len = Math.hypot(dx, dy);
            if (len < 1e-10) return {
                x: cx + r,
                y: cy
            };
            const ux = dx / len, uy = dy / len;
            const t = (cx - lp1.x) * ux + (cy - lp1.y) * uy;
            const px = lp1.x + t * ux, py = lp1.y + t * uy;
            const distSq = (cx - px) ** 2 + (cy - py) ** 2;
            const rSq = r * r;
            if (distSq >= rSq - 1e-10) return {
                x: px,
                y: py
            };
            const dt = Math.sqrt(rSq - distSq);
            const pt1 = {
                x: px + dt * ux,
                y: py + dt * uy
            };
            const pt2 = {
                x: px - dt * ux,
                y: py - dt * uy
            };
            const d1 = (pt1.x - refPt.x) ** 2 + (pt1.y - refPt.y) ** 2;
            const d2 = (pt2.x - refPt.x) ** 2 + (pt2.y - refPt.y) ** 2;
            return d1 <= d2 ? pt1 : pt2;
        };
        const circleCircleIntersect = (cx1, cy1, r1, cx2, cy2, r2, refPt)=>{
            const dx = cx2 - cx1, dy = cy2 - cy1;
            const dist = Math.hypot(dx, dy);
            if (dist < 1e-10) {
                const a = Math.atan2(refPt.y - cy1, refPt.x - cx1);
                return {
                    x: cx1 + r1 * Math.cos(a),
                    y: cy1 + r1 * Math.sin(a)
                };
            }
            const a = (r1 * r1 - r2 * r2 + dist * dist) / (2 * dist);
            const h2 = r1 * r1 - a * a;
            if (h2 < 0) return {
                x: cx1 + r1 * dx / dist,
                y: cy1 + r1 * dy / dist
            };
            const h = Math.sqrt(h2);
            const nx = dx / dist, ny = dy / dist;
            const mx = cx1 + a * nx, my = cy1 + a * ny;
            const pt1 = {
                x: mx + h * ny,
                y: my - h * nx
            };
            const pt2 = {
                x: mx - h * ny,
                y: my + h * nx
            };
            const d1 = (pt1.x - refPt.x) ** 2 + (pt1.y - refPt.y) ** 2;
            const d2 = (pt2.x - refPt.x) ** 2 + (pt2.y - refPt.y) ** 2;
            return d1 <= d2 ? pt1 : pt2;
        };
        if (polyline.isClosed) {
            let area2 = 0;
            for(let i = 0, j = verts.length - 1; i < verts.length; j = i++)area2 += verts[j].x * verts[i].y - verts[i].x * verts[j].y;
            if (area2 > 0) d = -d;
        }
        const segCount = polyline.isClosed ? verts.length : verts.length - 1;
        const segOffs = [];
        for(let i = 0; i < segCount; i++){
            const v1 = verts[i];
            const v2 = verts[(i + 1) % verts.length];
            const bulge = v1.bulge || 0;
            if (Math.abs(bulge) < 1e-10) {
                const sdx = v2.x - v1.x, sdy = v2.y - v1.y;
                const sLen = Math.hypot(sdx, sdy);
                if (sLen < 1e-10) {
                    segOffs.push(null);
                    continue;
                }
                const nx = -sdy / sLen * d, ny = sdx / sLen * d;
                segOffs.push({
                    type: 'straight',
                    p1: {
                        x: v1.x + nx,
                        y: v1.y + ny
                    },
                    p2: {
                        x: v2.x + nx,
                        y: v2.y + ny
                    }
                });
            } else {
                const arc = arcFromBulge(v1, v2, bulge);
                if (!arc) {
                    segOffs.push(null);
                    continue;
                }
                const newRadius = arc.radius - Math.sign(bulge) * d;
                if (newRadius < 1e-10) return null;
                segOffs.push({
                    type: 'arc',
                    cx: arc.cx,
                    cy: arc.cy,
                    newRadius,
                    origBulge: bulge
                });
            }
        }
        if (segOffs.some((s)=>null === s)) return null;
        const intersectSegs = (prevSeg, currSeg, refPt)=>{
            if ('straight' === prevSeg.type && 'straight' === currSeg.type) return lineLineIntersect(prevSeg.p1, prevSeg.p2, currSeg.p1, currSeg.p2);
            if ('straight' === prevSeg.type && 'arc' === currSeg.type) return lineCircleIntersect(prevSeg.p1, prevSeg.p2, currSeg.cx, currSeg.cy, currSeg.newRadius, refPt);
            if ('arc' === prevSeg.type && 'straight' === currSeg.type) return lineCircleIntersect(currSeg.p1, currSeg.p2, prevSeg.cx, prevSeg.cy, prevSeg.newRadius, refPt);
            return circleCircleIntersect(prevSeg.cx, prevSeg.cy, prevSeg.newRadius, currSeg.cx, currSeg.cy, currSeg.newRadius, refPt);
        };
        const arcEndpoint = (seg, origVert)=>{
            const adx = origVert.x - seg.cx, ady = origVert.y - seg.cy;
            const aLen = Math.hypot(adx, ady);
            if (aLen < 1e-10) return {
                x: seg.cx + seg.newRadius,
                y: seg.cy
            };
            return {
                x: seg.cx + adx / aLen * seg.newRadius,
                y: seg.cy + ady / aLen * seg.newRadius
            };
        };
        const n = segOffs.length;
        const newPositions = [];
        if (polyline.isClosed) for(let i = 0; i < n; i++)newPositions.push(intersectSegs(segOffs[(i - 1 + n) % n], segOffs[i], verts[i]));
        else {
            const firstSeg = segOffs[0];
            newPositions.push('straight' === firstSeg.type ? firstSeg.p1 : arcEndpoint(firstSeg, verts[0]));
            for(let i = 1; i < n; i++)newPositions.push(intersectSegs(segOffs[i - 1], segOffs[i], verts[i]));
            const lastSeg = segOffs[n - 1];
            newPositions.push('straight' === lastSeg.type ? lastSeg.p2 : arcEndpoint(lastSeg, verts[verts.length - 1]));
        }
        const recomputeBulge = (p1, p2, seg)=>{
            if ('straight' === seg.type) return 0;
            const { cx, cy, origBulge } = seg;
            const a1 = Math.atan2(p1.y - cy, p1.x - cx);
            const a2 = Math.atan2(p2.y - cy, p2.x - cx);
            let theta;
            if (origBulge > 0) {
                theta = a2 - a1;
                if (theta <= 0) theta += 2 * Math.PI;
            } else {
                theta = a1 - a2;
                if (theta <= 0) theta += 2 * Math.PI;
            }
            if (theta > 2 * Math.PI - 1e-6) theta = 2 * Math.PI - 1e-6;
            return Math.sign(origBulge) * Math.tan(theta / 4);
        };
        const newVerts = [];
        const posCount = newPositions.length;
        for(let i = 0; i < posCount; i++){
            const pt = newPositions[i];
            let bulge = 0;
            if (i < n) {
                const nextIdx = polyline.isClosed ? (i + 1) % posCount : i + 1;
                if (nextIdx < posCount) bulge = recomputeBulge(pt, newPositions[nextIdx], segOffs[i]);
            }
            newVerts.push({
                x: pt.x,
                y: pt.y,
                bulge
            });
        }
        const signedArea = (pts)=>{
            let a = 0;
            for(let i = 0, j = pts.length - 1; i < pts.length; j = i++)a += pts[j].x * pts[i].y - pts[i].x * pts[j].y;
            return a;
        };
        if (polyline.isClosed) {
            const origArea = signedArea(verts);
            const newArea = signedArea(newVerts);
            if (origArea * newArea <= 0) return null;
            if (d > 0 && newArea >= origArea) return null;
            if (d < 0 && newArea <= origArea) return null;
        } else for(let i = 0; i < n; i++){
            const origDx = verts[(i + 1) % verts.length].x - verts[i].x;
            const origDy = verts[(i + 1) % verts.length].y - verts[i].y;
            const newDx = newVerts[i + 1].x - newVerts[i].x;
            const newDy = newVerts[i + 1].y - newVerts[i].y;
            if (origDx * newDx + origDy * newDy < 0) return null;
        }
        const cloned = polyline.clone();
        cloned.id = (0, __WEBPACK_EXTERNAL_MODULE_nanoid__.nanoid)();
        cloned.vertices = newVerts;
        return cloned;
    }
    static offsetEllipse(ellipse, d) {
        const a = ellipse.radiusX;
        const b = ellipse.radiusY;
        const newA = a + d;
        const newB = b + d;
        if (newA <= 0 || newB <= 0) return null;
        const cloned = ellipse.clone();
        cloned.id = (0, __WEBPACK_EXTERNAL_MODULE_nanoid__.nanoid)();
        const scale = newA / a;
        cloned.majorAxisEndPoint = {
            x: ellipse.majorAxisEndPoint.x * scale,
            y: ellipse.majorAxisEndPoint.y * scale
        };
        cloned.axisRatio = newB / newA;
        return cloned;
    }
    static offsetSpline(spline, d) {
        const offsetPoints = (pts)=>{
            const n = pts.length;
            if (n < 2) return pts.map((p)=>({
                    x: p.x,
                    y: p.y
                }));
            return pts.map((p, i)=>{
                let tx = 0, ty = 0;
                if (i > 0) {
                    const dx = p.x - pts[i - 1].x;
                    const dy = p.y - pts[i - 1].y;
                    const len = Math.hypot(dx, dy);
                    if (len > 1e-10) {
                        tx += dx / len;
                        ty += dy / len;
                    }
                }
                if (i < n - 1) {
                    const dx = pts[i + 1].x - p.x;
                    const dy = pts[i + 1].y - p.y;
                    const len = Math.hypot(dx, dy);
                    if (len > 1e-10) {
                        tx += dx / len;
                        ty += dy / len;
                    }
                }
                const tLen = Math.hypot(tx, ty);
                if (tLen < 1e-10) return {
                    x: p.x,
                    y: p.y
                };
                const nx = -ty / tLen;
                const ny = tx / tLen;
                return {
                    x: p.x + nx * d,
                    y: p.y + ny * d
                };
            });
        };
        const cloned = spline.clone();
        cloned.id = (0, __WEBPACK_EXTERNAL_MODULE_nanoid__.nanoid)();
        if ('FIT' === spline.method && spline.fitPoints && spline.fitPoints.length >= 2) {
            const newFitPoints = offsetPoints(spline.fitPoints);
            const { controlPoints, knots, degree } = __WEBPACK_EXTERNAL_MODULE__utils_index_js_02c78a7f__.SplineUtils.fitPointsToSpline(newFitPoints, spline.degree, void 0, void 0, spline.isClosed);
            cloned.fitPoints = newFitPoints;
            cloned.controlPoints = controlPoints;
            cloned.knots = knots;
            cloned.degree = degree;
        } else {
            if (!spline.controlPoints || !(spline.controlPoints.length >= 2)) return null;
            const newControlPoints = offsetPoints(spline.controlPoints);
            const knots = __WEBPACK_EXTERNAL_MODULE__utils_index_js_02c78a7f__.SplineUtils.generateKnots(newControlPoints.length, spline.degree, spline.isClosed);
            cloned.controlPoints = newControlPoints;
            cloned.knots = knots;
        }
        return cloned;
    }
    static computeSide(entity, mousePos) {
        const { x: mx, y: my } = mousePos;
        switch(entity.type){
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Circle:
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Arc:
                {
                    const e = entity;
                    return Math.hypot(mx - e.center.x, my - e.center.y) >= e.radius ? 1 : -1;
                }
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Polyline:
                return OffsetUtils.polylineSide(entity, mx, my);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Spline:
                return OffsetUtils.splineSide(entity, mx, my);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Ellipse:
                {
                    const e = entity;
                    const angle = Math.atan2(e.majorAxisEndPoint.y, e.majorAxisEndPoint.x);
                    const cosA = Math.cos(-angle);
                    const sinA = Math.sin(-angle);
                    const dx = mx - e.center.x;
                    const dy = my - e.center.y;
                    const xRot = dx * cosA - dy * sinA;
                    const yRot = dx * sinA + dy * cosA;
                    const norm = xRot * xRot / (e.radiusX * e.radiusX) + yRot * yRot / (e.radiusY * e.radiusY);
                    return norm >= 1 ? 1 : -1;
                }
            default:
                return 1;
        }
    }
    static polylineSide(polyline, mx, my) {
        const verts = polyline.vertices;
        if (verts.length < 2) return 1;
        if (polyline.isClosed && verts.length >= 3) return OffsetUtils.isPointInPolygon(verts, mx, my) ? -1 : 1;
        return OffsetUtils.sideByNearestSegment(verts, mx, my);
    }
    static splineSide(spline, mx, my) {
        const pts = 'FIT' === spline.method && spline.fitPoints?.length ? spline.fitPoints : spline.controlPoints;
        if (!pts || pts.length < 2) return 1;
        if (spline.isClosed && pts.length >= 3) return OffsetUtils.isPointInPolygon(pts, mx, my) ? -1 : 1;
        return OffsetUtils.sideByNearestSegment(pts, mx, my);
    }
    static sideByNearestSegment(pts, mx, my) {
        let minDist = 1 / 0;
        let cross = 0;
        for(let i = 0; i < pts.length - 1; i++){
            const ax = pts[i].x, ay = pts[i].y;
            const bx = pts[i + 1].x, by = pts[i + 1].y;
            const dx = bx - ax, dy = by - ay;
            const lenSq = dx * dx + dy * dy;
            const t = lenSq > 0 ? Math.max(0, Math.min(1, ((mx - ax) * dx + (my - ay) * dy) / lenSq)) : 0;
            const closestX = ax + t * dx;
            const closestY = ay + t * dy;
            const dist = Math.hypot(mx - closestX, my - closestY);
            if (dist < minDist) {
                minDist = dist;
                cross = dx * (my - ay) - dy * (mx - ax);
            }
        }
        return cross >= 0 ? 1 : -1;
    }
    static isPointInPolygon(polygon, mx, my) {
        let inside = false;
        const n = polygon.length;
        for(let i = 0, j = n - 1; i < n; j = i++){
            const xi = polygon[i].x, yi = polygon[i].y;
            const xj = polygon[j].x, yj = polygon[j].y;
            const intersects = yi > my !== yj > my && mx < (xj - xi) * (my - yi) / (yj - yi) + xi;
            if (intersects) inside = !inside;
        }
        return inside;
    }
}
export { OffsetUtils };
