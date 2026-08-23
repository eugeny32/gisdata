const TWO_PI = 2 * Math.PI;
function clonePoint(point) {
    return {
        x: point.x,
        y: point.y
    };
}
function distanceBetweenPoints(p1, p2) {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}
function normalizeAngle(angle) {
    let result = angle % TWO_PI;
    if (result < 0) result += TWO_PI;
    return result;
}
function getPointByAngle(center, radius, angle) {
    return {
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle)
    };
}
function getArcMidAngle(entity) {
    const start = normalizeAngle(entity.startAngle);
    const end = normalizeAngle(entity.endAngle);
    if (entity.clockwise) {
        let delta = start - end;
        if (delta < 0) delta += TWO_PI;
        return normalizeAngle(start - delta / 2);
    }
    let delta = end - start;
    if (delta < 0) delta += TWO_PI;
    return normalizeAngle(start + delta / 2);
}
function getArcGripPoints(entity) {
    return {
        start: getPointByAngle(entity.center, entity.radius, entity.startAngle),
        end: getPointByAngle(entity.center, entity.radius, entity.endAngle),
        mid: getPointByAngle(entity.center, entity.radius, getArcMidAngle(entity))
    };
}
function getArcParamsByThreePoints(p1, p2, p3) {
    const x1 = p1.x, y1 = p1.y;
    const x2 = p2.x, y2 = p2.y;
    const x3 = p3.x, y3 = p3.y;
    const a1 = x1 * x1 + y1 * y1;
    const a2 = x2 * x2 + y2 * y2;
    const a3 = x3 * x3 + y3 * y3;
    const d = 2 * (x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2));
    if (Math.abs(d) < 1e-6) return null;
    const centerX = (a1 * (y2 - y3) + a2 * (y3 - y1) + a3 * (y1 - y2)) / d;
    const centerY = (a1 * (x3 - x2) + a2 * (x1 - x3) + a3 * (x2 - x1)) / d;
    const center = {
        x: centerX,
        y: centerY
    };
    const radius = Math.sqrt((centerX - x1) ** 2 + (centerY - y1) ** 2);
    const startAngle = Math.atan2(p1.y - center.y, p1.x - center.x);
    let midAngle = Math.atan2(p2.y - center.y, p2.x - center.x);
    let endAngle = Math.atan2(p3.y - center.y, p3.x - center.x);
    const crossProduct = (p2.x - p1.x) * (p3.y - p2.y) - (p2.y - p1.y) * (p3.x - p2.x);
    const anticlockwise = crossProduct > 0;
    if (anticlockwise) {
        while(midAngle < startAngle)midAngle += TWO_PI;
        while(endAngle < midAngle)endAngle += TWO_PI;
    } else {
        while(midAngle > startAngle)midAngle -= TWO_PI;
        while(endAngle > midAngle)endAngle -= TWO_PI;
    }
    return {
        center,
        radius,
        startAngle,
        endAngle,
        clockwise: !anticlockwise
    };
}
function getCircleQuadrantPoints(entity) {
    const { center, radius } = entity;
    return {
        top: {
            x: center.x,
            y: center.y + radius
        },
        right: {
            x: center.x + radius,
            y: center.y
        },
        bottom: {
            x: center.x,
            y: center.y - radius
        },
        left: {
            x: center.x - radius,
            y: center.y
        }
    };
}
function rotateVector(vector, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
        x: vector.x * cos - vector.y * sin,
        y: vector.x * sin + vector.y * cos
    };
}
function getEllipseAxes(entity) {
    const radiusX = entity.radiusX;
    const radiusY = entity.radiusY;
    const rotation = entity.rotation;
    const majorAxisUnit = rotateVector({
        x: 1,
        y: 0
    }, rotation);
    const minorAxisUnit = rotateVector({
        x: 0,
        y: 1
    }, rotation);
    return {
        radiusX,
        radiusY,
        rotation,
        majorAxisUnit,
        minorAxisUnit
    };
}
function getEllipseQuadrantPoints(entity) {
    const { center } = entity;
    const { radiusX, radiusY, majorAxisUnit, minorAxisUnit } = getEllipseAxes(entity);
    return {
        right: {
            x: center.x + majorAxisUnit.x * radiusX,
            y: center.y + majorAxisUnit.y * radiusX
        },
        left: {
            x: center.x - majorAxisUnit.x * radiusX,
            y: center.y - majorAxisUnit.y * radiusX
        },
        top: {
            x: center.x + minorAxisUnit.x * radiusY,
            y: center.y + minorAxisUnit.y * radiusY
        },
        bottom: {
            x: center.x - minorAxisUnit.x * radiusY,
            y: center.y - minorAxisUnit.y * radiusY
        }
    };
}
function projectPointToAxis(point, origin, axisUnit) {
    return (point.x - origin.x) * axisUnit.x + (point.y - origin.y) * axisUnit.y;
}
export { clonePoint, distanceBetweenPoints, getArcGripPoints, getArcMidAngle, getArcParamsByThreePoints, getCircleQuadrantPoints, getEllipseAxes, getEllipseQuadrantPoints, getPointByAngle, normalizeAngle, projectPointToAxis, rotateVector };
