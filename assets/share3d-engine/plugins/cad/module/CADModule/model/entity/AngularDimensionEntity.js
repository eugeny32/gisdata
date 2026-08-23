import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__common_constant_js_335399ae__ from "../common/constant.js";
import * as __WEBPACK_EXTERNAL_MODULE__BaseEntity_js_4a7a320c__ from "./BaseEntity.js";
const EPSILON = 1e-6;
const PI2 = 2 * Math.PI;
class AngularDimensionEntity extends __WEBPACK_EXTERNAL_MODULE__BaseEntity_js_4a7a320c__.BaseEntity {
    constructor(data){
        super(__WEBPACK_EXTERNAL_MODULE__common_constant_js_335399ae__.EntityType.AngularDimension), this.dimensionText = '', this.isTextPositionEdited = false, this.textHeight = 2.5, this.serializeKeys = [
            'line1',
            'line2',
            'arcPoint',
            'dimensionText',
            'textPosition',
            'isTextPositionEdited',
            'textHeight'
        ];
        Object.assign(this, data);
    }
    getCaptureData() {
        const dimensionData = getAngularDimensionData(this.line1, this.line2, this.arcPoint, this.textPosition);
        if (!dimensionData) return {};
        const intersection = toPoint(dimensionData.intersection);
        const arcStart = toPoint(dimensionData.arcStart);
        const arcEnd = toPoint(dimensionData.arcEnd);
        const { firstPoint, secondPoint } = getAngularDimensionDefinitionPoints(this, dimensionData);
        const legLines = getAngularDimensionLegLines(this, dimensionData);
        return {
            endPoints: [
                arcStart,
                arcEnd,
                firstPoint,
                secondPoint
            ],
            centerPoints: [
                intersection
            ],
            lines: legLines
        };
    }
}
function syncAngularDimensionTextPosition(entity) {
    if (entity.isTextPositionEdited || !entity.arcPoint) return;
    entity.textPosition = {
        x: entity.arcPoint.x,
        y: entity.arcPoint.y
    };
}
function getAngularDimensionDefinitionPoints(entity, dimensionData) {
    const lines = [
        entity.line1,
        entity.line2
    ];
    const startLineIndex = findAngularDimensionLineIndex(lines, dimensionData.startDirection);
    const endLineIndex = findAngularDimensionLineIndex(lines, dimensionData.endDirection, startLineIndex);
    return {
        firstPoint: getAngularDimensionLegPoint(lines[startLineIndex], dimensionData.intersection, dimensionData.startDirection, dimensionData.arcStart),
        secondPoint: getAngularDimensionLegPoint(lines[endLineIndex], dimensionData.intersection, dimensionData.endDirection, dimensionData.arcEnd)
    };
}
function getAngularDimensionLegLines(entity, dimensionData) {
    const lines = [
        entity.line1,
        entity.line2
    ];
    const startLineIndex = findAngularDimensionLineIndex(lines, dimensionData.startDirection);
    const endLineIndex = findAngularDimensionLineIndex(lines, dimensionData.endDirection, startLineIndex);
    const legLines = [
        getAngularDimensionVisibleLegLine(lines[startLineIndex], dimensionData.intersection, dimensionData.startDirection, dimensionData.arcStart),
        getAngularDimensionVisibleLegLine(lines[endLineIndex], dimensionData.intersection, dimensionData.endDirection, dimensionData.arcEnd)
    ];
    return legLines.filter((line)=>!!line);
}
function getAngularDimensionData(line1, line2, arcPoint, textPosition = arcPoint, minRadius = 1e-3) {
    const intersection = getLineIntersection(line1, line2);
    if (!intersection) return null;
    const direction1 = getLineDirection(line1);
    const direction2 = getLineDirection(line2);
    if (!direction1 || !direction2) return null;
    const sectorVector = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(arcPoint.x - intersection.x, arcPoint.y - intersection.y, 0);
    if (sectorVector.lengthSq() < EPSILON) return null;
    const ray1 = direction1.dot(sectorVector) >= 0 ? direction1.clone() : direction1.clone().negate();
    const ray2 = direction2.dot(sectorVector) >= 0 ? direction2.clone() : direction2.clone().negate();
    if (Math.abs(ray1.x * ray2.y - ray1.y * ray2.x) < EPSILON) return null;
    const angle1 = normalizeAngle(Math.atan2(ray1.y, ray1.x));
    const angle2 = normalizeAngle(Math.atan2(ray2.y, ray2.x));
    const sectorAngle = normalizeAngle(Math.atan2(sectorVector.y, sectorVector.x));
    const delta12 = getCcwDelta(angle1, angle2);
    const delta21 = getCcwDelta(angle2, angle1);
    let startAngle = angle1;
    let sweepAngle = delta12;
    const use12 = delta12 <= Math.PI + EPSILON && isAngleInCcwSweep(sectorAngle, angle1, delta12);
    const use21 = delta21 <= Math.PI + EPSILON && isAngleInCcwSweep(sectorAngle, angle2, delta21);
    if (use21 && (!use12 || delta21 < delta12)) {
        startAngle = angle2;
        sweepAngle = delta21;
    } else if (!use12 && !use21) {
        if (delta21 < delta12) {
            startAngle = angle2;
            sweepAngle = delta21;
        }
    }
    const endAngle = startAngle + sweepAngle;
    const startDirection = angleToDirection(startAngle);
    const endDirection = angleToDirection(endAngle);
    const radius = Math.max(intersection.distanceTo(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(arcPoint.x, arcPoint.y, 0)), minRadius);
    const arcStart = intersection.clone().add(startDirection.clone().multiplyScalar(radius));
    const arcEnd = intersection.clone().add(endDirection.clone().multiplyScalar(radius));
    return {
        intersection,
        startDirection,
        endDirection,
        arcStart,
        arcEnd,
        radius,
        startAngle,
        endAngle,
        clockwise: false,
        sweepAngle,
        arcLength: radius * sweepAngle,
        textPosition: new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(textPosition.x, textPosition.y, 0),
        angleDegrees: 180 * sweepAngle / Math.PI
    };
}
function getLineIntersection(line1, line2) {
    const x1 = line1.startPoint.x;
    const y1 = line1.startPoint.y;
    const x2 = line1.endPoint.x;
    const y2 = line1.endPoint.y;
    const x3 = line2.startPoint.x;
    const y3 = line2.startPoint.y;
    const x4 = line2.endPoint.x;
    const y4 = line2.endPoint.y;
    const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (Math.abs(denominator) < EPSILON) return null;
    const determinant1 = x1 * y2 - y1 * x2;
    const determinant2 = x3 * y4 - y3 * x4;
    const x = (determinant1 * (x3 - x4) - (x1 - x2) * determinant2) / denominator;
    const y = (determinant1 * (y3 - y4) - (y1 - y2) * determinant2) / denominator;
    return new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(x, y, 0);
}
function getLineDirection(line) {
    const direction = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(line.endPoint.x - line.startPoint.x, line.endPoint.y - line.startPoint.y, 0);
    if (direction.lengthSq() < EPSILON) return null;
    return direction.normalize();
}
function findAngularDimensionLineIndex(lines, direction, excludedIndex) {
    let bestIndex = 0 === excludedIndex ? 1 : 0;
    let bestScore = -1 / 0;
    lines.forEach((line, index)=>{
        if (index === excludedIndex) return;
        const dx = line.endPoint.x - line.startPoint.x;
        const dy = line.endPoint.y - line.startPoint.y;
        const length = Math.hypot(dx, dy);
        if (length <= EPSILON) return;
        const score = Math.abs(dx / length * direction.x + dy / length * direction.y);
        if (score > bestScore) {
            bestScore = score;
            bestIndex = index;
        }
    });
    return bestIndex;
}
function getAngularDimensionLegPoint(line, intersection, direction, fallback) {
    const candidates = [
        line.startPoint,
        line.endPoint
    ];
    let bestPoint = fallback;
    let bestProjection = -1 / 0;
    for (const point of candidates){
        const projection = (point.x - intersection.x) * direction.x + (point.y - intersection.y) * direction.y;
        if (projection > bestProjection) {
            bestProjection = projection;
            bestPoint = point;
        }
    }
    return {
        x: bestPoint.x,
        y: bestPoint.y
    };
}
function getAngularDimensionVisibleLegLine(line, intersection, direction, arcPoint) {
    const startProjection = getAngularDimensionRayProjection(line.startPoint, intersection, direction);
    const endProjection = getAngularDimensionRayProjection(line.endPoint, intersection, direction);
    const arcProjection = getAngularDimensionRayProjection(arcPoint, intersection, direction);
    const minProjection = Math.min(startProjection, endProjection);
    const maxProjection = Math.max(startProjection, endProjection);
    if (arcProjection >= minProjection - EPSILON && arcProjection <= maxProjection + EPSILON) return null;
    let anchorPoint;
    anchorPoint = arcProjection < minProjection ? startProjection < endProjection ? line.startPoint : line.endPoint : startProjection > endProjection ? line.startPoint : line.endPoint;
    if (Math.hypot(anchorPoint.x - arcPoint.x, anchorPoint.y - arcPoint.y) <= EPSILON) return null;
    return {
        startPoint: toPoint(arcPoint),
        endPoint: toPoint(anchorPoint)
    };
}
function getAngularDimensionRayProjection(point, intersection, direction) {
    return (point.x - intersection.x) * direction.x + (point.y - intersection.y) * direction.y;
}
function normalizeAngle(angle) {
    let normalized = angle % PI2;
    if (normalized < 0) normalized += PI2;
    return normalized;
}
function getCcwDelta(startAngle, endAngle) {
    return normalizeAngle(endAngle - startAngle);
}
function isAngleInCcwSweep(angle, startAngle, sweepAngle) {
    return getCcwDelta(startAngle, angle) <= sweepAngle + EPSILON;
}
function angleToDirection(angle) {
    return new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(Math.cos(angle), Math.sin(angle), 0);
}
function toPoint(point) {
    return {
        x: point.x,
        y: point.y
    };
}
export { AngularDimensionEntity, getAngularDimensionData, getAngularDimensionDefinitionPoints, getAngularDimensionLegLines, syncAngularDimensionTextPosition };
