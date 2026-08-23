import * as __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__ from "../model/common/constant.js";
const EPSILON = 1e-6;
const ARC_SEGMENTS_NUM = 32;
function buildAngularDimensionSegmentCandidates(entity) {
    if (entity.type === __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Polyline) return buildPolylineSegmentCandidates(entity);
    const lines = entity.getCaptureData().lines || [];
    return lines.map((line, index)=>createLineCandidate(`${entity.id}:line:${index}`, line));
}
function getAngularDimensionSegmentDistance(point, candidate) {
    let minDistance = Number.POSITIVE_INFINITY;
    for (const line of candidate.previewLines){
        const nearestPoint = projectPointOnLineSegment(point, line);
        minDistance = Math.min(minDistance, getDistance(nearestPoint, point));
    }
    return minDistance;
}
function resolveAngularDimensionLinePair(first, second) {
    return {
        line1: resolveAngularDimensionLine(first, second),
        line2: resolveAngularDimensionLine(second, first)
    };
}
function buildPolylineSegmentCandidates(entity) {
    const candidates = [];
    const vertices = entity.vertices || [];
    if (vertices.length < 2) return candidates;
    const segmentCount = entity.isClosed ? vertices.length : vertices.length - 1;
    for(let index = 0; index < segmentCount; index++){
        const start = vertices[index];
        const end = vertices[(index + 1) % vertices.length];
        const line = {
            startPoint: {
                x: start.x,
                y: start.y
            },
            endPoint: {
                x: end.x,
                y: end.y
            }
        };
        const bulge = start.bulge || 0;
        if (Math.abs(bulge) < EPSILON) {
            candidates.push(createLineCandidate(`${entity.id}:polyline:${index}:line`, line));
            continue;
        }
        const arcParams = getBulgeArcParams(line.startPoint, line.endPoint, bulge);
        if (!arcParams) {
            candidates.push(createLineCandidate(`${entity.id}:polyline:${index}:line`, line));
            continue;
        }
        const previewPoints = sampleBulgeArcPoints(line.startPoint, line.endPoint, bulge, ARC_SEGMENTS_NUM);
        const previewLines = getLinesByPoints(previewPoints);
        const tangentLength = Math.max(getDistance(line.startPoint, line.endPoint), arcParams.radius, 1);
        candidates.push({
            id: `${entity.id}:polyline:${index}:arc`,
            kind: 'arc',
            line,
            previewLines,
            startPoint: clonePoint(line.startPoint),
            endPoint: clonePoint(line.endPoint),
            tangentAtStart: createTangentLine(line.startPoint, arcParams.startAngle, arcParams.sweepAngle, tangentLength),
            tangentAtEnd: createTangentLine(line.endPoint, arcParams.startAngle + arcParams.sweepAngle, arcParams.sweepAngle, tangentLength)
        });
    }
    return candidates;
}
function resolveAngularDimensionLine(current, other) {
    if ('line' === current.kind) return cloneLine(current.line);
    if (isSamePoint(current.startPoint, other.startPoint) || isSamePoint(current.startPoint, other.endPoint)) return cloneLine(current.tangentAtStart || current.line);
    if (isSamePoint(current.endPoint, other.startPoint) || isSamePoint(current.endPoint, other.endPoint)) return cloneLine(current.tangentAtEnd || current.line);
    return cloneLine(current.line);
}
function createLineCandidate(id, line) {
    const clonedLine = cloneLine(line);
    return {
        id,
        kind: 'line',
        line: clonedLine,
        previewLines: [
            cloneLine(clonedLine)
        ],
        startPoint: clonePoint(clonedLine.startPoint),
        endPoint: clonePoint(clonedLine.endPoint)
    };
}
function sampleBulgeArcPoints(startPoint, endPoint, bulge, segmentsNum) {
    const arcParams = getBulgeArcParams(startPoint, endPoint, bulge);
    if (!arcParams) return [
        clonePoint(startPoint),
        clonePoint(endPoint)
    ];
    const points = [];
    for(let index = 0; index <= segmentsNum; index++){
        const t = index / segmentsNum;
        const angle = arcParams.startAngle + arcParams.sweepAngle * t;
        points.push({
            x: arcParams.center.x + Math.cos(angle) * arcParams.radius,
            y: arcParams.center.y + Math.sin(angle) * arcParams.radius
        });
    }
    points[0] = clonePoint(startPoint);
    points[points.length - 1] = clonePoint(endPoint);
    return points;
}
function getBulgeArcParams(startPoint, endPoint, bulge) {
    if (Math.abs(bulge) < EPSILON) return null;
    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;
    const chordLength = Math.sqrt(dx * dx + dy * dy);
    if (chordLength < EPSILON) return null;
    const midPoint = {
        x: (startPoint.x + endPoint.x) / 2,
        y: (startPoint.y + endPoint.y) / 2
    };
    const normal = {
        x: -dy / chordLength,
        y: dx / chordLength
    };
    const offset = chordLength / 2 * (1 - bulge * bulge) / (2 * bulge);
    const center = {
        x: midPoint.x + normal.x * offset,
        y: midPoint.y + normal.y * offset
    };
    return {
        center,
        radius: Math.sqrt((chordLength / 2) ** 2 + offset ** 2),
        startAngle: Math.atan2(startPoint.y - center.y, startPoint.x - center.x),
        sweepAngle: 4 * Math.atan(bulge)
    };
}
function createTangentLine(point, angle, sweepAngle, length) {
    const direction = sweepAngle >= 0 ? {
        x: -Math.sin(angle),
        y: Math.cos(angle)
    } : {
        x: Math.sin(angle),
        y: -Math.cos(angle)
    };
    return {
        startPoint: clonePoint(point),
        endPoint: {
            x: point.x + direction.x * length,
            y: point.y + direction.y * length
        }
    };
}
function getLinesByPoints(points) {
    const lines = [];
    for(let index = 0; index < points.length - 1; index++)lines.push({
        startPoint: clonePoint(points[index]),
        endPoint: clonePoint(points[index + 1])
    });
    return lines;
}
function projectPointOnLineSegment(point, line) {
    const dx = line.endPoint.x - line.startPoint.x;
    const dy = line.endPoint.y - line.startPoint.y;
    const lengthSquared = dx * dx + dy * dy;
    if (lengthSquared < EPSILON) return clonePoint(line.startPoint);
    const t = Math.max(0, Math.min(1, ((point.x - line.startPoint.x) * dx + (point.y - line.startPoint.y) * dy) / lengthSquared));
    return {
        x: line.startPoint.x + t * dx,
        y: line.startPoint.y + t * dy
    };
}
function getDistance(point1, point2) {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
}
function isSamePoint(point1, point2, tolerance = EPSILON) {
    return Math.abs(point1.x - point2.x) <= tolerance && Math.abs(point1.y - point2.y) <= tolerance;
}
function cloneLine(line) {
    return {
        startPoint: clonePoint(line.startPoint),
        endPoint: clonePoint(line.endPoint)
    };
}
function clonePoint(point) {
    return {
        x: point.x,
        y: point.y
    };
}
export { buildAngularDimensionSegmentCandidates, getAngularDimensionSegmentDistance, resolveAngularDimensionLinePair };
