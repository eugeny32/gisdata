import * as __WEBPACK_EXTERNAL_MODULE__common_constant_js_335399ae__ from "../common/constant.js";
import * as __WEBPACK_EXTERNAL_MODULE__BaseEntity_js_4a7a320c__ from "./BaseEntity.js";
const DEFAULT_MLEADER_LANDING_DISTANCE = 1;
const MLEADER_TEXT_GAP_FACTOR = 0.35;
const MLEADER_EPSILON = 1e-6;
function clonePoint(point) {
    return {
        x: point.x,
        y: point.y
    };
}
function isSamePoint(a, b) {
    if (!a || !b) return false;
    return Math.abs(a.x - b.x) <= MLEADER_EPSILON && Math.abs(a.y - b.y) <= MLEADER_EPSILON;
}
function resolveLandingDirection(startPoint, elbowPoint, textPosition) {
    if (textPosition && textPosition.x !== elbowPoint.x) return textPosition.x >= elbowPoint.x ? 1 : -1;
    if (elbowPoint.x !== startPoint.x) return elbowPoint.x >= startPoint.x ? 1 : -1;
    return 1;
}
function normalizeMLeaderBranch(branch, options) {
    const arrowPoint = branch.arrowPoint ? clonePoint(branch.arrowPoint) : {
        x: 0,
        y: 0
    };
    const vertices = (branch.vertices || []).map(clonePoint);
    const elbowPoint = vertices[0] ? clonePoint(vertices[0]) : options?.textPosition ? clonePoint(options.textPosition) : clonePoint(arrowPoint);
    const normalizedVertices = [
        elbowPoint
    ];
    if (options?.hasLanding !== false) {
        const landingEnd = vertices[1] ? clonePoint(vertices[1]) : buildMLeaderLandingEnd(elbowPoint, {
            direction: resolveLandingDirection(arrowPoint, elbowPoint, options?.textPosition),
            landingDistance: options?.landingDistance,
            textPosition: options?.textPosition
        });
        normalizedVertices.push(landingEnd);
    }
    return {
        arrowPoint,
        vertices: normalizedVertices
    };
}
function getDefaultMLeaderLandingDistance(_textHeight, _landingGap) {
    return DEFAULT_MLEADER_LANDING_DISTANCE;
}
function getMLeaderTextGap(textHeight = 2.5, landingGap) {
    const height = Math.max(Math.abs(textHeight), MLEADER_EPSILON);
    const requestedGap = Math.abs(landingGap ?? height * MLEADER_TEXT_GAP_FACTOR);
    const minGap = height * MLEADER_TEXT_GAP_FACTOR;
    return Math.max(requestedGap, minGap);
}
function buildMLeaderLandingEnd(elbowPoint, options) {
    const direction = options?.direction ?? (options?.textPosition && options.textPosition.x < elbowPoint.x ? -1 : 1);
    const landingDistance = Math.max(Math.abs(options?.landingDistance ?? DEFAULT_MLEADER_LANDING_DISTANCE), 1e-6);
    if (options?.textPosition) {
        const dx = options.textPosition.x - elbowPoint.x;
        if (0 !== dx && Math.abs(dx) >= landingDistance) return {
            x: options.textPosition.x,
            y: elbowPoint.y
        };
    }
    return {
        x: elbowPoint.x + direction * landingDistance,
        y: elbowPoint.y
    };
}
function cloneMLeaderBranch(branch) {
    return {
        arrowPoint: branch.arrowPoint ? clonePoint(branch.arrowPoint) : {
            x: 0,
            y: 0
        },
        vertices: (branch.vertices || []).map(clonePoint)
    };
}
function normalizeMLeaderBranches(branches, options) {
    return (branches || []).map((branch)=>normalizeMLeaderBranch(branch, options));
}
function getMLeaderBranchPoints(branch) {
    const points = [
        clonePoint(branch.arrowPoint)
    ];
    (branch.vertices || []).forEach((vertex)=>{
        points.push(clonePoint(vertex));
    });
    return points;
}
function getMLeaderElbowPoint(branch) {
    if (!branch) return null;
    const elbowPoint = branch.vertices[0];
    return elbowPoint ? clonePoint(elbowPoint) : clonePoint(branch.arrowPoint);
}
function getMLeaderLandingEnd(branch) {
    if (!branch) return null;
    if (branch.vertices[1]) return clonePoint(branch.vertices[1]);
    return getMLeaderElbowPoint(branch);
}
function getMLeaderLandingDirection(branch, textPosition) {
    if (!branch) return 1;
    const elbowPoint = getMLeaderElbowPoint(branch) || clonePoint(branch.arrowPoint);
    if (textPosition && textPosition.x !== elbowPoint.x) return textPosition.x >= elbowPoint.x ? 1 : -1;
    const landingEnd = getMLeaderLandingEnd(branch);
    if (landingEnd && landingEnd.x !== elbowPoint.x) return landingEnd.x >= elbowPoint.x ? 1 : -1;
    return resolveLandingDirection(branch.arrowPoint, elbowPoint, textPosition);
}
function getMLeaderLandingDistance(branch, fallbackDistance = DEFAULT_MLEADER_LANDING_DISTANCE) {
    const elbowPoint = getMLeaderElbowPoint(branch);
    const landingEnd = getMLeaderLandingEnd(branch);
    if (elbowPoint && landingEnd) {
        const dx = landingEnd.x - elbowPoint.x;
        const dy = landingEnd.y - elbowPoint.y;
        return Math.max(Math.sqrt(dx * dx + dy * dy), 1e-6);
    }
    return Math.max(Math.abs(fallbackDistance), 1e-6);
}
function getMLeaderLandingVector(branch, fallbackDirection = 1) {
    const elbowPoint = getMLeaderElbowPoint(branch);
    const landingEnd = getMLeaderLandingEnd(branch);
    if (elbowPoint && landingEnd) {
        const dx = landingEnd.x - elbowPoint.x;
        const dy = landingEnd.y - elbowPoint.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length > 1e-6) return {
            x: dx / length,
            y: dy / length
        };
    }
    return {
        x: fallbackDirection,
        y: 0
    };
}
function getMLeaderTextPosition(branch, textPosition, textHeight, landingGap) {
    const landingEnd = getMLeaderLandingEnd(branch);
    if (!landingEnd) return textPosition ? clonePoint(textPosition) : {
        x: 0,
        y: 0
    };
    if (textPosition && !isSamePoint(textPosition, landingEnd)) return clonePoint(textPosition);
    const landingDirection = getMLeaderLandingDirection(branch, textPosition);
    const landingVector = getMLeaderLandingVector(branch, landingDirection);
    const textGap = getMLeaderTextGap(textHeight, landingGap);
    return {
        x: landingEnd.x + landingVector.x * textGap,
        y: landingEnd.y + landingVector.y * textGap
    };
}
function getMLeaderBranchEnd(branch) {
    return getMLeaderLandingEnd(branch);
}
function getMLeaderBranchLines(branch) {
    const points = getMLeaderBranchPoints(branch);
    const lines = [];
    for(let i = 0; i < points.length - 1; i++)lines.push({
        startPoint: clonePoint(points[i]),
        endPoint: clonePoint(points[i + 1])
    });
    return lines;
}
class MLeaderEntity extends __WEBPACK_EXTERNAL_MODULE__BaseEntity_js_4a7a320c__.BaseEntity {
    constructor(data){
        super(__WEBPACK_EXTERNAL_MODULE__common_constant_js_335399ae__.EntityType.MLeader), this.contentType = 'mtext', this.branches = [], this.contents = '', this.textHeight = 2.5, this.textRotation = 0, this.landingGap = 2.5, this.hasLanding = true, this.isTextPositionEdited = false, this.serializeKeys = [
            'contentType',
            'branches',
            'textPosition',
            'contents',
            'textHeight',
            'textRotation',
            'landingGap',
            'hasLanding',
            'isTextPositionEdited'
        ];
        Object.assign(this, data);
        this.contentType = data.contentType || 'mtext';
        this.hasLanding = data.hasLanding ?? true;
        this.textRotation = data.textRotation ?? 0;
        this.textPosition = data.textPosition ? clonePoint(data.textPosition) : {
            x: 0,
            y: 0
        };
        this.branches = normalizeMLeaderBranches(data.branches, {
            textPosition: data.textPosition,
            landingDistance: getDefaultMLeaderLandingDistance(data.textHeight ?? this.textHeight, data.landingGap ?? this.landingGap),
            hasLanding: this.hasLanding
        });
        const landingEnd = getMLeaderLandingEnd(this.branches[0]);
        if (landingEnd) this.textPosition = data.isTextPositionEdited && data.textPosition ? clonePoint(data.textPosition) : getMLeaderTextPosition(this.branches[0], data.textPosition, this.textHeight, this.landingGap);
    }
    getCaptureData() {
        const endPoints = [];
        const lines = [];
        this.branches.forEach((branch)=>{
            const branchPoints = getMLeaderBranchPoints(branch);
            endPoints.push(...branchPoints.map(clonePoint));
            lines.push(...getMLeaderBranchLines(branch));
        });
        return {
            endPoints,
            lines
        };
    }
}
export { DEFAULT_MLEADER_LANDING_DISTANCE, MLeaderEntity, buildMLeaderLandingEnd, cloneMLeaderBranch, getDefaultMLeaderLandingDistance, getMLeaderBranchEnd, getMLeaderBranchLines, getMLeaderBranchPoints, getMLeaderElbowPoint, getMLeaderLandingDirection, getMLeaderLandingDistance, getMLeaderLandingEnd, getMLeaderLandingVector, getMLeaderTextGap, getMLeaderTextPosition, normalizeMLeaderBranches };
