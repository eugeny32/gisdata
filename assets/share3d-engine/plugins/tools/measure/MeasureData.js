import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_idGenerator_js_530c4c39__ from "../shared/idGenerator.js";
const generateMeasureId = (0, __WEBPACK_EXTERNAL_MODULE__shared_idGenerator_js_530c4c39__.createIdGenerator)('measure');
function computeSegmentDistances(points) {
    const segments = [];
    for(let i = 1; i < points.length; i++)segments.push(points[i - 1].position.distanceTo(points[i].position));
    return segments;
}
function computeTotalDistance(segments) {
    let total = 0;
    for(let i = 0; i < segments.length; i++)total += segments[i];
    return total;
}
function computeArea(points) {
    if (points.length < 3) return null;
    const normal = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 0);
    const n = points.length;
    for(let i = 0; i < n; i++){
        const current = points[i].position;
        const next = points[(i + 1) % n].position;
        normal.x += (current.y - next.y) * (current.z + next.z);
        normal.y += (current.z - next.z) * (current.x + next.x);
        normal.z += (current.x - next.x) * (current.y + next.y);
    }
    return 0.5 * normal.length();
}
function computeProjectedArea(points) {
    if (points.length < 3) return null;
    const origin = points[0].position;
    let doubledArea = 0;
    for(let i = 0; i < points.length; i++){
        const current = points[i].position;
        const next = points[(i + 1) % points.length].position;
        const currentX = current.x - origin.x;
        const currentY = current.y - origin.y;
        const nextX = next.x - origin.x;
        const nextY = next.y - origin.y;
        doubledArea += currentX * nextY - nextX * currentY;
    }
    return 0.5 * Math.abs(doubledArea);
}
function computeAngle(points) {
    if (3 !== points.length) return null;
    const v1 = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().subVectors(points[0].position, points[1].position);
    const v2 = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().subVectors(points[2].position, points[1].position);
    const len1 = v1.length();
    const len2 = v2.length();
    if (0 === len1 || 0 === len2) return 0;
    const cosAngle = Math.max(-1, Math.min(1, v1.dot(v2) / (len1 * len2)));
    return __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.radToDeg(Math.acos(cosAngle));
}
function computeProjectedAngle(points) {
    if (3 !== points.length) return null;
    const corner = points[1].position;
    const v1x = points[0].position.x - corner.x;
    const v1y = points[0].position.y - corner.y;
    const v2x = points[2].position.x - corner.x;
    const v2y = points[2].position.y - corner.y;
    const len1 = Math.hypot(v1x, v1y);
    const len2 = Math.hypot(v2x, v2y);
    if (0 === len1 || 0 === len2) return 0;
    const cosAngle = Math.max(-1, Math.min(1, (v1x * v2x + v1y * v2y) / (len1 * len2)));
    return __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.radToDeg(Math.acos(cosAngle));
}
function computeHeight(p1, p2) {
    const vertical = Math.abs(p2.z - p1.z);
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const horizontal = Math.sqrt(dx * dx + dy * dy);
    const slopeAngle = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.radToDeg(Math.atan2(vertical, horizontal));
    return {
        vertical,
        horizontal,
        slopeAngle
    };
}
function computeCircle(p1, p2, p3) {
    const AB = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().subVectors(p2, p1);
    const AC = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().subVectors(p3, p1);
    const N = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().crossVectors(AC, AB);
    if (N.lengthSq() < 1e-10) return null;
    N.normalize();
    const abDir = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().crossVectors(AB, N).normalize();
    const acDir = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().crossVectors(AC, N).normalize();
    const abMid = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    const acMid = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().addVectors(p1, p3).multiplyScalar(0.5);
    const center = lineLineIntersection(abMid, abDir, acMid, acDir);
    if (!center) return null;
    const radius = center.distanceTo(p1);
    const circumference = 2 * Math.PI * radius;
    return {
        center,
        radius,
        circumference
    };
}
function lineLineIntersection(origin1, dir1, origin2, dir2) {
    const d = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().subVectors(origin2, origin1);
    const cross = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().crossVectors(dir1, dir2);
    const denom = cross.lengthSq();
    if (denom < 1e-10) return null;
    const t = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().crossVectors(d, dir2).dot(cross) / denom;
    return origin1.clone().addScaledVector(dir1, t);
}
function computeAzimuth(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.atan2(dx, dy);
}
function computeClosedPathDistance(segmentDistances, firstPoint, lastPoint) {
    let total = 0;
    for(let i = 0; i < segmentDistances.length; i++)total += segmentDistances[i];
    total += firstPoint.distanceTo(lastPoint);
    return total;
}
function buildMeasureResult(points, measureType = 'distance', options = {}) {
    const segmentDistances = computeSegmentDistances(points);
    const distance = computeTotalDistance(segmentDistances);
    const area = computeArea(points);
    const projectedArea = computeProjectedArea(points);
    const angle = computeAngle(points);
    const projectedAngle = computeProjectedAngle(points);
    const result = {
        id: options.id ?? generateMeasureId(),
        ...options.viewId ? {
            viewId: options.viewId
        } : {},
        measureType,
        points: [
            ...points
        ],
        distance,
        area,
        projectedArea,
        angle,
        projectedAngle,
        segmentDistances
    };
    if ('height' === measureType && points.length >= 2) {
        const p0 = points[0].position;
        const p1 = points[points.length - 1].position;
        return {
            ...result,
            height: computeHeight(p0, p1)
        };
    }
    if ('circle' === measureType && 3 === points.length) {
        const circleResult = computeCircle(points[0].position, points[1].position, points[2].position);
        return circleResult ? {
            ...result,
            circle: circleResult
        } : result;
    }
    if ('azimuth' === measureType && points.length >= 2) {
        const az = computeAzimuth(points[0].position, points[points.length - 1].position);
        return {
            ...result,
            azimuth: az
        };
    }
    if ('area' === measureType && points.length >= 3) {
        const closed = computeClosedPathDistance(segmentDistances, points[0].position, points[points.length - 1].position);
        return {
            ...result,
            closedDistance: closed
        };
    }
    return result;
}
export { buildMeasureResult, computeAngle, computeArea, computeAzimuth, computeCircle, computeClosedPathDistance, computeHeight, computeProjectedAngle, computeProjectedArea, computeSegmentDistances, computeTotalDistance, generateMeasureId };
