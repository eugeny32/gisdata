import * as __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__ from "lodash-es";
import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__ from "../../utils/entityGripUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_SplineUtils_js_d30ecb97__ from "../../utils/SplineUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__ from "../model/common/constant.js";
import * as __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__ from "../model/entity/index.js";
class EntityGripHandler {
    static getGripPoints(entity) {
        switch(entity.type){
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Polyline:
                return EntityGripHandler.getPolylineGrips(entity);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Spline:
                return EntityGripHandler.getSplineGrips(entity);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Arc:
                return EntityGripHandler.getArcGrips(entity);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Circle:
                return EntityGripHandler.getCircleGrips(entity);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Ellipse:
                return EntityGripHandler.getEllipseGrips(entity);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Ray:
                return EntityGripHandler.getRayGrips(entity);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.AlignDimension:
                return EntityGripHandler.getDimensionGrips(entity);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.MLeader:
                return EntityGripHandler.getMLeaderGrips(entity);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.AngularDimension:
                return EntityGripHandler.getAngularDimensionGrips(entity);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.MText:
                return EntityGripHandler.getTextGrips(entity);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Hatch:
                return EntityGripHandler.getHatchGrips(entity);
            default:
                return [];
        }
    }
    static applyGrip(entity, grip, targetPoint) {
        switch(entity.type){
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Polyline:
                EntityGripHandler.applyPolylineGrip(entity, grip, targetPoint);
                break;
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Spline:
                EntityGripHandler.applySplineGrip(entity, grip, targetPoint);
                break;
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Arc:
                EntityGripHandler.applyArcGrip(entity, grip, targetPoint);
                break;
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Circle:
                EntityGripHandler.applyCircleGrip(entity, grip, targetPoint);
                break;
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Ellipse:
                EntityGripHandler.applyEllipseGrip(entity, grip, targetPoint);
                break;
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Ray:
                EntityGripHandler.applyRayGrip(entity, grip, targetPoint);
                break;
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.AlignDimension:
                EntityGripHandler.applyDimensionGrip(entity, grip, targetPoint);
                break;
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.MLeader:
                EntityGripHandler.applyMLeaderGrip(entity, grip, targetPoint);
                break;
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.AngularDimension:
                EntityGripHandler.applyAngularDimensionGrip(entity, grip, targetPoint);
                break;
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.MText:
                EntityGripHandler.applyTextGrip(entity, grip, targetPoint);
                break;
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Hatch:
                EntityGripHandler.applyHatchGrip(entity, grip, targetPoint);
                break;
            default:
                break;
        }
    }
    static snapshot(entity) {
        const baseEntity = entity;
        if ('function' != typeof baseEntity.serialize) return null;
        return (0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.cloneDeep)(baseEntity.serialize());
    }
    static getPolylineGrips(entity) {
        const grips = entity.vertices.map((vertex, index)=>({
                id: `${entity.id}:vertex:${index}`,
                entityId: entity.id,
                kind: 'vertex',
                point: {
                    x: vertex.x,
                    y: vertex.y
                },
                meta: {
                    index
                }
            }));
        const segmentCount = entity.isClosed ? entity.vertices.length : Math.max(entity.vertices.length - 1, 0);
        for(let i = 0; i < segmentCount; i++){
            const startIndex = i;
            const endIndex = (i + 1) % entity.vertices.length;
            const start = entity.vertices[startIndex];
            const end = entity.vertices[endIndex];
            grips.push({
                id: `${entity.id}:segmentMidpoint:${i}`,
                entityId: entity.id,
                kind: 'segmentMidpoint',
                point: {
                    x: (start.x + end.x) / 2,
                    y: (start.y + end.y) / 2
                },
                meta: {
                    startIndex,
                    endIndex,
                    angle: Math.atan2(end.y - start.y, end.x - start.x),
                    scaleX: 1.2,
                    scaleY: 0.75
                }
            });
        }
        return grips;
    }
    static getSplineGrips(entity) {
        const points = 'FIT' === entity.method && entity.fitPoints?.length ? entity.fitPoints : entity.controlPoints;
        const kind = 'FIT' === entity.method ? 'fitPoint' : 'controlPoint';
        return (points || []).map((point, index)=>({
                id: `${entity.id}:${kind}:${index}`,
                entityId: entity.id,
                kind,
                point: (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(point),
                meta: {
                    index
                }
            }));
    }
    static getArcGrips(entity) {
        const { start, end, mid } = (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.getArcGripPoints)(entity);
        return [
            {
                id: `${entity.id}:center`,
                entityId: entity.id,
                kind: 'center',
                point: (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(entity.center)
            },
            {
                id: `${entity.id}:start`,
                entityId: entity.id,
                kind: 'start',
                point: start
            },
            {
                id: `${entity.id}:end`,
                entityId: entity.id,
                kind: 'end',
                point: end
            },
            {
                id: `${entity.id}:mid`,
                entityId: entity.id,
                kind: 'mid',
                point: mid
            }
        ];
    }
    static getCircleGrips(entity) {
        const quadrants = (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.getCircleQuadrantPoints)(entity);
        return [
            {
                id: `${entity.id}:center`,
                entityId: entity.id,
                kind: 'center',
                point: (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(entity.center)
            },
            ...Object.entries(quadrants).map(([kind, point])=>({
                    id: `${entity.id}:${kind}`,
                    entityId: entity.id,
                    kind,
                    point
                }))
        ];
    }
    static getEllipseGrips(entity) {
        const quadrants = (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.getEllipseQuadrantPoints)(entity);
        return [
            {
                id: `${entity.id}:center`,
                entityId: entity.id,
                kind: 'center',
                point: (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(entity.center)
            },
            ...Object.entries(quadrants).map(([kind, point])=>({
                    id: `${entity.id}:${kind}`,
                    entityId: entity.id,
                    kind,
                    point
                }))
        ];
    }
    static getRayGrips(entity) {
        return [
            {
                id: `${entity.id}:startPoint`,
                entityId: entity.id,
                kind: 'startPoint',
                point: (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(entity.startPoint)
            }
        ];
    }
    static getDimensionGrips(entity) {
        const { d1, d2 } = (0, __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.getAlignDimensionPoints)(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(entity.p1.x, entity.p1.y, 0), new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(entity.p2.x, entity.p2.y, 0), new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(entity.offsetPoint.x, entity.offsetPoint.y, 0));
        return [
            {
                id: `${entity.id}:p1`,
                entityId: entity.id,
                kind: 'p1',
                point: (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(entity.p1)
            },
            {
                id: `${entity.id}:p2`,
                entityId: entity.id,
                kind: 'p2',
                point: (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(entity.p2)
            },
            {
                id: `${entity.id}:dimStart`,
                entityId: entity.id,
                kind: 'dimStart',
                point: {
                    x: d1.x,
                    y: d1.y
                }
            },
            {
                id: `${entity.id}:dimEnd`,
                entityId: entity.id,
                kind: 'dimEnd',
                point: {
                    x: d2.x,
                    y: d2.y
                }
            },
            {
                id: `${entity.id}:textPosition`,
                entityId: entity.id,
                kind: 'textPosition',
                point: (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(entity.textPosition)
            }
        ];
    }
    static getTextGrips(entity) {
        return [
            {
                id: `${entity.id}:position`,
                entityId: entity.id,
                kind: 'position',
                point: (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(entity.position)
            }
        ];
    }
    static getMLeaderGrips(entity) {
        const branch = entity.branches[0];
        const elbowPoint = (0, __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.getMLeaderElbowPoint)(branch);
        const landingEnd = (0, __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.getMLeaderLandingEnd)(branch);
        if (!branch || !elbowPoint || !landingEnd) return [];
        return [
            {
                id: `${entity.id}:arrowPoint`,
                entityId: entity.id,
                kind: 'arrowPoint',
                point: (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(branch.arrowPoint)
            },
            {
                id: `${entity.id}:elbowPoint`,
                entityId: entity.id,
                kind: 'elbowPoint',
                point: elbowPoint
            },
            {
                id: `${entity.id}:textPosition`,
                entityId: entity.id,
                kind: 'textPosition',
                point: (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(entity.textPosition || landingEnd)
            }
        ];
    }
    static getAngularDimensionGrips(entity) {
        return [
            {
                id: `${entity.id}:line1Start`,
                entityId: entity.id,
                kind: 'line1Start',
                point: (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(entity.line1.startPoint)
            },
            {
                id: `${entity.id}:line1End`,
                entityId: entity.id,
                kind: 'line1End',
                point: (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(entity.line1.endPoint)
            },
            {
                id: `${entity.id}:line2Start`,
                entityId: entity.id,
                kind: 'line2Start',
                point: (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(entity.line2.startPoint)
            },
            {
                id: `${entity.id}:line2End`,
                entityId: entity.id,
                kind: 'line2End',
                point: (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(entity.line2.endPoint)
            },
            {
                id: `${entity.id}:arcPoint`,
                entityId: entity.id,
                kind: 'arcPoint',
                point: (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(entity.arcPoint)
            },
            {
                id: `${entity.id}:textPosition`,
                entityId: entity.id,
                kind: 'textPosition',
                point: (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(entity.textPosition)
            }
        ];
    }
    static getHatchGrips(entity) {
        if (!entity.startPoint) return [];
        return [
            {
                id: `${entity.id}:startPoint`,
                entityId: entity.id,
                kind: 'startPoint',
                point: (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(entity.startPoint)
            }
        ];
    }
    static applyPolylineGrip(entity, grip, targetPoint) {
        if ('segmentMidpoint' === grip.kind) {
            const startIndex = grip.meta?.startIndex;
            const endIndex = grip.meta?.endIndex;
            if ('number' != typeof startIndex || 'number' != typeof endIndex) return;
            const start = entity.vertices[startIndex];
            const end = entity.vertices[endIndex];
            if (!start || !end) return;
            const currentMidpoint = {
                x: (start.x + end.x) / 2,
                y: (start.y + end.y) / 2
            };
            const dx = targetPoint.x - currentMidpoint.x;
            const dy = targetPoint.y - currentMidpoint.y;
            entity.vertices[startIndex] = {
                ...start,
                x: start.x + dx,
                y: start.y + dy
            };
            entity.vertices[endIndex] = {
                ...end,
                x: end.x + dx,
                y: end.y + dy
            };
            return;
        }
        const index = grip.meta?.index;
        if ('number' != typeof index || !entity.vertices[index]) return;
        entity.vertices[index] = {
            ...entity.vertices[index],
            x: targetPoint.x,
            y: targetPoint.y
        };
    }
    static applySplineGrip(entity, grip, targetPoint) {
        const index = grip.meta?.index;
        if ('number' != typeof index) return;
        if ('FIT' === entity.method && entity.fitPoints?.[index]) {
            entity.fitPoints[index] = (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(targetPoint);
            if (entity.fitPoints.length >= 2) {
                const fitted = __WEBPACK_EXTERNAL_MODULE__utils_SplineUtils_js_d30ecb97__.SplineUtils.fitPointsToSpline(entity.fitPoints.map(__WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint), entity.degree);
                entity.controlPoints = fitted.controlPoints;
                entity.knots = fitted.knots;
                entity.degree = fitted.degree;
            }
            return;
        }
        if (entity.controlPoints?.[index]) entity.controlPoints[index] = (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(targetPoint);
    }
    static applyArcGrip(entity, grip, targetPoint) {
        if ('center' === grip.kind) {
            entity.center = (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(targetPoint);
            return;
        }
        const { start, end, mid } = (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.getArcGripPoints)(entity);
        if ('start' === grip.kind) {
            const next = (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.getArcParamsByThreePoints)(targetPoint, mid, end);
            if (next) {
                entity.center = next.center;
                entity.radius = next.radius;
                entity.startAngle = next.startAngle;
                entity.endAngle = next.endAngle;
                entity.clockwise = next.clockwise;
            }
            return;
        }
        if ('end' === grip.kind) {
            const next = (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.getArcParamsByThreePoints)(start, mid, targetPoint);
            if (next) {
                entity.center = next.center;
                entity.radius = next.radius;
                entity.startAngle = next.startAngle;
                entity.endAngle = next.endAngle;
                entity.clockwise = next.clockwise;
            }
            return;
        }
        if ('mid' === grip.kind) {
            const next = (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.getArcParamsByThreePoints)(start, targetPoint, end);
            if (next) {
                entity.center = next.center;
                entity.radius = next.radius;
                entity.startAngle = next.startAngle;
                entity.endAngle = next.endAngle;
                entity.clockwise = next.clockwise;
            }
        }
    }
    static applyCircleGrip(entity, grip, targetPoint) {
        if ('center' === grip.kind) {
            entity.center = (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(targetPoint);
            return;
        }
        entity.radius = Math.max((0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.distanceBetweenPoints)(entity.center, targetPoint), 1e-6);
    }
    static applyEllipseGrip(entity, grip, targetPoint) {
        if ('center' === grip.kind) {
            entity.center = (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(targetPoint);
            return;
        }
        const { majorAxisUnit, minorAxisUnit, radiusX, radiusY } = (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.getEllipseAxes)(entity);
        if ('right' === grip.kind || 'left' === grip.kind) {
            const majorRadius = Math.max(Math.abs((0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.projectPointToAxis)(targetPoint, entity.center, majorAxisUnit)), 1e-6);
            if (majorRadius < radiusY) {
                entity.majorAxisEndPoint = {
                    x: minorAxisUnit.x * radiusY,
                    y: minorAxisUnit.y * radiusY
                };
                entity.axisRatio = majorRadius / radiusY;
            } else {
                entity.majorAxisEndPoint = {
                    x: majorAxisUnit.x * majorRadius,
                    y: majorAxisUnit.y * majorRadius
                };
                entity.axisRatio = radiusY / majorRadius;
            }
            return;
        }
        if ('top' === grip.kind || 'bottom' === grip.kind) {
            const minorRadius = Math.max(Math.abs((0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.projectPointToAxis)(targetPoint, entity.center, minorAxisUnit)), 1e-6);
            if (minorRadius > radiusX) {
                entity.majorAxisEndPoint = {
                    x: minorAxisUnit.x * minorRadius,
                    y: minorAxisUnit.y * minorRadius
                };
                entity.axisRatio = radiusX / minorRadius;
            } else {
                entity.majorAxisEndPoint = {
                    x: majorAxisUnit.x * radiusX,
                    y: majorAxisUnit.y * radiusX
                };
                entity.axisRatio = minorRadius / radiusX;
            }
        }
    }
    static applyRayGrip(entity, grip, targetPoint) {
        if ('startPoint' === grip.kind) entity.startPoint = (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(targetPoint);
    }
    static applyDimensionGrip(entity, grip, targetPoint) {
        if ('p1' === grip.kind) {
            entity.p1 = (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(targetPoint);
            EntityGripHandler.syncDimensionTextPosition(entity);
        } else if ('p2' === grip.kind) {
            entity.p2 = (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(targetPoint);
            EntityGripHandler.syncDimensionTextPosition(entity);
        } else if ('dimStart' === grip.kind || 'dimEnd' === grip.kind) {
            const { d1, d2 } = (0, __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.getAlignDimensionPoints)(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(entity.p1.x, entity.p1.y, 0), new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(entity.p2.x, entity.p2.y, 0), new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(entity.offsetPoint.x, entity.offsetPoint.y, 0));
            const sourcePoint = 'dimStart' === grip.kind ? {
                x: d1.x,
                y: d1.y
            } : {
                x: d2.x,
                y: d2.y
            };
            const dx = targetPoint.x - sourcePoint.x;
            const dy = targetPoint.y - sourcePoint.y;
            entity.offsetPoint = {
                x: entity.offsetPoint.x + dx,
                y: entity.offsetPoint.y + dy
            };
            EntityGripHandler.syncDimensionTextPosition(entity, {
                d1,
                d2
            });
        } else if ('textPosition' === grip.kind) {
            entity.textPosition = (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(targetPoint);
            entity.isTextPositionEdited = true;
        }
    }
    static syncDimensionTextPosition(entity, dimLine) {
        if (entity.isTextPositionEdited) return;
        if (!dimLine) dimLine = (0, __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.getAlignDimensionPoints)(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(entity.p1.x, entity.p1.y, 0), new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(entity.p2.x, entity.p2.y, 0), new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(entity.offsetPoint.x, entity.offsetPoint.y, 0));
        const { d1, d2 } = dimLine;
        entity.textPosition = {
            x: (d1.x + d2.x) / 2,
            y: (d1.y + d2.y) / 2
        };
    }
    static applyAngularDimensionGrip(entity, grip, targetPoint) {
        if ('textPosition' === grip.kind) {
            entity.textPosition = (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(targetPoint);
            entity.isTextPositionEdited = true;
            return;
        }
        const originalData = {
            line1: {
                startPoint: (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(entity.line1.startPoint),
                endPoint: (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(entity.line1.endPoint)
            },
            line2: {
                startPoint: (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(entity.line2.startPoint),
                endPoint: (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(entity.line2.endPoint)
            },
            arcPoint: (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(entity.arcPoint),
            textPosition: (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(entity.textPosition),
            isTextPositionEdited: entity.isTextPositionEdited
        };
        switch(grip.kind){
            case 'line1Start':
                entity.line1.startPoint = (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(targetPoint);
                break;
            case 'line1End':
                entity.line1.endPoint = (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(targetPoint);
                break;
            case 'line2Start':
                entity.line2.startPoint = (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(targetPoint);
                break;
            case 'line2End':
                entity.line2.endPoint = (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(targetPoint);
                break;
            case 'arcPoint':
                entity.arcPoint = (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(targetPoint);
                break;
            default:
                return;
        }
        (0, __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.syncAngularDimensionTextPosition)(entity);
        const isValid = !!(0, __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.getAngularDimensionData)(entity.line1, entity.line2, entity.arcPoint, entity.textPosition);
        if (!isValid) {
            entity.line1 = originalData.line1;
            entity.line2 = originalData.line2;
            entity.arcPoint = originalData.arcPoint;
            entity.textPosition = originalData.textPosition;
            entity.isTextPositionEdited = originalData.isTextPositionEdited;
        }
    }
    static applyTextGrip(entity, grip, targetPoint) {
        if ('position' === grip.kind) entity.position = (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(targetPoint);
    }
    static applyMLeaderGrip(entity, grip, targetPoint) {
        const branch = entity.branches[0];
        if (!branch) return;
        const landingDirection = (0, __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.getMLeaderLandingDirection)(branch, entity.textPosition);
        const landingVector = (0, __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.getMLeaderLandingVector)(branch, landingDirection);
        const landingDistance = (0, __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.getMLeaderLandingDistance)(branch, (0, __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.getDefaultMLeaderLandingDistance)(entity.textHeight, entity.landingGap));
        if ('arrowPoint' === grip.kind) {
            branch.arrowPoint = (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(targetPoint);
            return;
        }
        if ('elbowPoint' === grip.kind) {
            branch.vertices[0] = (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(targetPoint);
            EntityGripHandler.syncMLeaderTextPosition(entity, {
                landingDirection,
                landingDistance,
                landingVector
            });
            return;
        }
        if ('textPosition' === grip.kind) {
            const elbowPoint = (0, __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.getMLeaderElbowPoint)(branch);
            if (!elbowPoint) return;
            const textDirection = targetPoint.x >= elbowPoint.x ? 1 : -1;
            const textGap = (0, __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.getMLeaderTextGap)(entity.textHeight, entity.landingGap);
            branch.vertices[0] = {
                x: elbowPoint.x,
                y: targetPoint.y
            };
            branch.vertices[1] = {
                x: targetPoint.x - textDirection * textGap,
                y: targetPoint.y
            };
            entity.textPosition = (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(targetPoint);
            entity.isTextPositionEdited = true;
        }
    }
    static syncMLeaderTextPosition(entity, options) {
        const branch = entity.branches[0];
        const elbowPoint = (0, __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.getMLeaderElbowPoint)(branch);
        if (!branch || !elbowPoint) return;
        const landingDistance = options?.landingDistance ?? (0, __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.getMLeaderLandingDistance)(branch, (0, __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.getDefaultMLeaderLandingDistance)(entity.textHeight, entity.landingGap));
        const textGap = (0, __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.getMLeaderTextGap)(entity.textHeight, entity.landingGap);
        const landingVector = options?.landingVector ?? (0, __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.getMLeaderLandingVector)(branch, options?.landingDirection ?? (0, __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.getMLeaderLandingDirection)(branch, entity.textPosition));
        const landingEnd = entity.isTextPositionEdited && entity.textPosition ? {
            x: entity.textPosition.x - landingVector.x * textGap,
            y: entity.textPosition.y - landingVector.y * textGap
        } : {
            x: elbowPoint.x + landingVector.x * landingDistance,
            y: elbowPoint.y + landingVector.y * landingDistance
        };
        branch.vertices[0] = (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(elbowPoint);
        branch.vertices[1] = (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(landingEnd);
        if (!entity.isTextPositionEdited) entity.textPosition = {
            x: landingEnd.x + landingVector.x * textGap,
            y: landingEnd.y + landingVector.y * textGap
        };
    }
    static applyHatchGrip(entity, grip, targetPoint) {
        if ('startPoint' === grip.kind) entity.startPoint = (0, __WEBPACK_EXTERNAL_MODULE__utils_entityGripUtils_js_09d9657d__.clonePoint)(targetPoint);
    }
}
export { EntityGripHandler };
