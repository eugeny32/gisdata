import * as __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__ from "lodash-es";
import * as __WEBPACK_EXTERNAL_MODULE_nanoid__ from "nanoid";
import * as __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__ from "../model/common/constant.js";
import * as __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__ from "../model/entity/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_SplineUtils_js_d30ecb97__ from "../../utils/SplineUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_e0d0aed1__ from "../../../../../shared/logging/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_breakUtils_js_f36227b3__ from "./utils/breakUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_offsetUtils_js_4693f150__ from "./utils/offsetUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_trimUtils_js_6b100bd6__ from "./utils/trimUtils.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_e0d0aed1__.getLoggerManager)().getLogger('cad');
class EntityEditHandler {
    static move(entities, params) {
        entities.forEach((entity)=>{
            EntityEditHandler.moveEntity(entity, params);
        });
    }
    static copy(entities, params) {
        const copyEntities = [];
        entities.forEach((entity)=>{
            const copyEntity = entity.clone();
            copyEntity.id = (0, __WEBPACK_EXTERNAL_MODULE_nanoid__.nanoid)();
            copyEntities.push(copyEntity);
            EntityEditHandler.moveEntity(copyEntity, params);
        });
        return copyEntities;
    }
    static rotate(entities, params) {
        entities.forEach((entity)=>{
            EntityEditHandler.rotateEntity(entity, params);
        });
    }
    static scale(entities, scale) {
        if (1 === scale || scale <= 0) return;
        entities.forEach((entity)=>{
            EntityEditHandler.scaleEntity(entity, scale);
        });
    }
    static offset(entity, params) {
        return __WEBPACK_EXTERNAL_MODULE__utils_offsetUtils_js_4693f150__.OffsetUtils.offsetEntity(entity, params);
    }
    static break(entities, params) {
        const result = {
            createdEntities: [],
            deleteEntities: []
        };
        for (const entity of entities){
            const { createdEntities, deleteEntities } = __WEBPACK_EXTERNAL_MODULE__utils_breakUtils_js_f36227b3__.BreakUtils.breakEntity(entity, params);
            result.createdEntities.push(...createdEntities);
            result.deleteEntities.push(...deleteEntities);
        }
        return result;
    }
    static trim(entity, params) {
        return __WEBPACK_EXTERNAL_MODULE__utils_trimUtils_js_6b100bd6__.TrimUtils.trimEntity(entity, params.cursorPoint, params.boundaries);
    }
    static extend(entity, params) {
        const { endType, newPoint } = params;
        switch(entity.type){
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Polyline:
                {
                    const poly = entity;
                    const v = poly.vertices;
                    if ('end' === endType) v[v.length - 1] = {
                        ...v[v.length - 1],
                        x: newPoint.x,
                        y: newPoint.y
                    };
                    else v[0] = {
                        ...v[0],
                        x: newPoint.x,
                        y: newPoint.y
                    };
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Arc:
                {
                    const arc = entity;
                    const newAngle = Math.atan2(newPoint.y - arc.center.y, newPoint.x - arc.center.x);
                    if ('end' === endType) arc.endAngle = newAngle;
                    else arc.startAngle = newAngle;
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Ray:
                if ('start' === endType) {
                    const ray = entity;
                    ray.startPoint = {
                        x: newPoint.x,
                        y: newPoint.y
                    };
                }
                break;
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Spline:
                {
                    const spline = entity;
                    const { knots, degree, controlPoints } = spline;
                    if (controlPoints.length < degree + 1) break;
                    const uMin = knots[degree] ?? 0;
                    const uMax = (knots[knots.length - degree - 1] ?? 1) - 1e-9;
                    const NUM_SAMPLES = 32;
                    const pts = [];
                    for(let i = 0; i <= NUM_SAMPLES; i++){
                        const u = uMin + i / NUM_SAMPLES * (uMax - uMin);
                        const pt = __WEBPACK_EXTERNAL_MODULE__utils_SplineUtils_js_d30ecb97__.SplineUtils.evaluateBSpline(u, controlPoints, knots, degree);
                        pts.push({
                            x: pt.x,
                            y: pt.y
                        });
                    }
                    if ('end' === endType) pts.push({
                        x: newPoint.x,
                        y: newPoint.y
                    });
                    else pts.unshift({
                        x: newPoint.x,
                        y: newPoint.y
                    });
                    try {
                        const fitted = __WEBPACK_EXTERNAL_MODULE__utils_SplineUtils_js_d30ecb97__.SplineUtils.fitPointsToSpline(pts);
                        spline.controlPoints = fitted.controlPoints;
                        spline.knots = fitted.knots;
                        spline.degree = fitted.degree;
                        if (spline.fitPoints?.length) {
                            if ('end' === endType) spline.fitPoints.push(newPoint);
                            else spline.fitPoints.unshift(newPoint);
                        }
                    } catch  {
                        log.warn('Spline extend: re-fit failed');
                    }
                    break;
                }
            default:
                log.warn(`Extend operation not implemented for entity type: ${entity.type}`);
        }
    }
    static join(entities, tolerance = 0.001) {
        const result = {
            nonJoinedEntities: [],
            createdEntities: []
        };
        if (entities.length < 2) {
            result.nonJoinedEntities.push(...entities);
            return result;
        }
        const { closedEntities, openEntities } = entities.reduce((data, entity)=>{
            if ([
                __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Polyline,
                __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Spline
            ].includes(entity.type) && entity.isClosed) data.closedEntities.push(entity);
            else data.openEntities.push(entity);
            return data;
        }, {
            closedEntities: [],
            openEntities: []
        });
        result.nonJoinedEntities.push(...closedEntities);
        const groupedByType = (0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.groupBy)(openEntities, 'type');
        for (const [type, group] of Object.entries(groupedByType)){
            if (group.length < 2) {
                result.nonJoinedEntities.push(...group);
                continue;
            }
            const joinResult = EntityEditHandler.joinByType(type, group, tolerance);
            result.nonJoinedEntities.push(...joinResult.nonJoined);
            result.createdEntities.push(...joinResult.created);
        }
        return result;
    }
    static scaleEntity(entity, scale) {
        if (1 === scale || scale <= 0) return;
        const scalePoint = (point)=>{
            point.x *= scale;
            point.y *= scale;
        };
        switch(entity.type){
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Polyline:
                {
                    const { vertices } = entity;
                    vertices.forEach(scalePoint);
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Arc:
                {
                    const arc = entity;
                    scalePoint(arc.center);
                    arc.radius *= scale;
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Circle:
                {
                    const circle = entity;
                    scalePoint(circle.center);
                    circle.radius *= scale;
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Ellipse:
                {
                    const ellipse = entity;
                    scalePoint(ellipse.center);
                    scalePoint(ellipse.majorAxisEndPoint);
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Ray:
                {
                    const ray = entity;
                    scalePoint(ray.startPoint);
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Spline:
                {
                    const { fitPoints, controlPoints } = entity;
                    controlPoints.forEach(scalePoint);
                    fitPoints?.forEach(scalePoint);
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.MText:
                {
                    const mtext = entity;
                    scalePoint(mtext.position);
                    mtext.textHeight *= scale;
                    mtext.rectWidth && (mtext.rectWidth *= scale);
                    mtext.rectHeight && (mtext.rectHeight *= scale);
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.AlignDimension:
                {
                    const dim = entity;
                    [
                        dim.p1,
                        dim.p2,
                        dim.offsetPoint,
                        dim.textPosition
                    ].forEach(scalePoint);
                    dim.textHeight *= scale;
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.MLeader:
                {
                    const mLeader = entity;
                    EntityEditHandler.forEachUniqueMLeaderPoint(mLeader, scalePoint);
                    mLeader.textHeight *= scale;
                    if ('number' == typeof mLeader.landingGap) mLeader.landingGap *= scale;
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.AngularDimension:
                {
                    const angularDimension = entity;
                    [
                        angularDimension.line1.startPoint,
                        angularDimension.line1.endPoint,
                        angularDimension.line2.startPoint,
                        angularDimension.line2.endPoint,
                        angularDimension.arcPoint,
                        angularDimension.textPosition
                    ].forEach(scalePoint);
                    angularDimension.textHeight *= scale;
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Hatch:
                {
                    const hatch = entity;
                    if (hatch.startPoint) scalePoint(hatch.startPoint);
                    if ('number' == typeof hatch.patternScale) hatch.patternScale *= scale;
                    EntityEditHandler.forEachHatchBoundaryEntity(hatch, (boundaryEntity)=>{
                        EntityEditHandler.scaleEntity(boundaryEntity, scale);
                    });
                    break;
                }
            default:
                log.warn(`Scale operation not implemented for entity type: ${entity.type}`);
        }
    }
    static moveEntity(entity, params) {
        const { translate } = params;
        const translatePoint = (point)=>{
            point.x += translate.x;
            point.y += translate.y;
        };
        switch(entity.type){
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Polyline:
                {
                    const { vertices } = entity;
                    vertices.forEach(translatePoint);
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Arc:
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Circle:
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Ellipse:
                {
                    const { center } = entity;
                    translatePoint(center);
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Spline:
                {
                    const { fitPoints, controlPoints } = entity;
                    controlPoints.forEach(translatePoint);
                    fitPoints?.forEach(translatePoint);
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.MText:
                {
                    const { position } = entity;
                    translatePoint(position);
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.AlignDimension:
                {
                    const { p1, p2, offsetPoint, textPosition } = entity;
                    [
                        p1,
                        p2,
                        offsetPoint,
                        textPosition
                    ].forEach(translatePoint);
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.MLeader:
                {
                    const mLeader = entity;
                    EntityEditHandler.forEachUniqueMLeaderPoint(mLeader, translatePoint);
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Ray:
                {
                    const { startPoint } = entity;
                    translatePoint(startPoint);
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.AngularDimension:
                {
                    const angularDimension = entity;
                    [
                        angularDimension.line1.startPoint,
                        angularDimension.line1.endPoint,
                        angularDimension.line2.startPoint,
                        angularDimension.line2.endPoint,
                        angularDimension.arcPoint,
                        angularDimension.textPosition
                    ].forEach(translatePoint);
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Hatch:
                {
                    const hatch = entity;
                    if (hatch.startPoint) translatePoint(hatch.startPoint);
                    EntityEditHandler.forEachHatchBoundaryEntity(hatch, (boundaryEntity)=>{
                        EntityEditHandler.moveEntity(boundaryEntity, params);
                    });
                    break;
                }
            default:
                log.warn(`Move operation not implemented for entity type: ${entity.type}`);
        }
    }
    static rotateEntity(entity, params) {
        const { center, angle } = params;
        const rotatePoint = (point)=>{
            const dx = point.x - center.x;
            const dy = point.y - center.y;
            point.x = center.x + dx * Math.cos(angle) - dy * Math.sin(angle);
            point.y = center.y + dx * Math.sin(angle) + dy * Math.cos(angle);
        };
        const rotateVector = (point)=>{
            const x = point.x;
            const y = point.y;
            point.x = x * Math.cos(angle) - y * Math.sin(angle);
            point.y = x * Math.sin(angle) + y * Math.cos(angle);
        };
        switch(entity.type){
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Polyline:
                entity.vertices.forEach((v)=>rotatePoint(v));
                break;
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Arc:
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Circle:
                rotatePoint(entity.center);
                if (entity.type === __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Arc) {
                    const arc = entity;
                    arc.startAngle += angle;
                    arc.endAngle += angle;
                }
                break;
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Ellipse:
                {
                    const ellipse = entity;
                    rotatePoint(ellipse.center);
                    rotateVector(ellipse.majorAxisEndPoint);
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Ray:
                {
                    const ray = entity;
                    rotatePoint(ray.startPoint);
                    rotateVector(ray.unitVector);
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Spline:
                {
                    const spline = entity;
                    spline.controlPoints.forEach((p)=>rotatePoint(p));
                    spline.fitPoints?.forEach((p)=>rotatePoint(p));
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.MText:
                rotatePoint(entity.position);
                break;
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.AlignDimension:
                {
                    const dim = entity;
                    [
                        dim.p1,
                        dim.p2,
                        dim.offsetPoint,
                        dim.textPosition
                    ].forEach((p)=>rotatePoint(p));
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.MLeader:
                {
                    const mLeader = entity;
                    EntityEditHandler.forEachUniqueMLeaderPoint(mLeader, rotatePoint);
                    mLeader.textRotation = (mLeader.textRotation ?? 0) + angle;
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.AngularDimension:
                {
                    const angularDimension = entity;
                    [
                        angularDimension.line1.startPoint,
                        angularDimension.line1.endPoint,
                        angularDimension.line2.startPoint,
                        angularDimension.line2.endPoint,
                        angularDimension.arcPoint,
                        angularDimension.textPosition
                    ].forEach(rotatePoint);
                    break;
                }
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Hatch:
                {
                    const hatch = entity;
                    if (hatch.startPoint) rotatePoint(hatch.startPoint);
                    if (hatch.xDirection) rotateVector(hatch.xDirection);
                    hatch.patternAngle += angle;
                    EntityEditHandler.forEachHatchBoundaryEntity(hatch, (boundaryEntity)=>{
                        EntityEditHandler.rotateEntity(boundaryEntity, params);
                    });
                    break;
                }
            default:
                log.warn(`Rotate operation not implemented for entity type: ${entity.type}`);
        }
    }
    static forEachHatchBoundaryEntity(hatch, callback) {
        [
            hatch.loops,
            hatch.holes
        ].forEach((boundaryMap)=>{
            Object.values(boundaryMap || {}).forEach((entities)=>{
                entities.forEach((boundaryEntity)=>callback(boundaryEntity));
            });
        });
    }
    static forEachUniqueMLeaderPoint(mLeader, callback) {
        const visited = new Set();
        const visitPoint = (point)=>{
            if (!point || visited.has(point)) return;
            visited.add(point);
            callback(point);
        };
        mLeader.branches.forEach((branch)=>{
            visitPoint(branch.arrowPoint);
            branch.vertices.forEach(visitPoint);
        });
        visitPoint(mLeader.textPosition);
    }
    static joinByType(type, entities, tolerance) {
        const result = {
            nonJoined: [],
            created: []
        };
        let joinFunc = null;
        let getEndPointsFunc = null;
        switch(type){
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Polyline:
                joinFunc = EntityEditHandler.joinPolylines.bind(EntityEditHandler);
                getEndPointsFunc = EntityEditHandler.getPolylineEndPoints.bind(EntityEditHandler);
                break;
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Spline:
                joinFunc = EntityEditHandler.joinSplines.bind(EntityEditHandler);
                getEndPointsFunc = EntityEditHandler.getSplineEndPoints.bind(EntityEditHandler);
                break;
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Arc:
                joinFunc = EntityEditHandler.joinArcs.bind(EntityEditHandler);
                getEndPointsFunc = EntityEditHandler.getArcEndPoints.bind(EntityEditHandler);
                break;
            default:
                result.nonJoined.push(...entities);
                return result;
        }
        const chains = EntityEditHandler.findConnectedChains(entities, getEndPointsFunc, tolerance);
        for (const chain of chains)if (chain.length < 2) result.nonJoined.push(...chain);
        else {
            const joined = joinFunc(chain, tolerance);
            if (joined) result.created.push(joined);
            else result.nonJoined.push(...chain);
        }
        return result;
    }
    static findConnectedChains(entities, getEndPoints, tolerance) {
        if (0 === entities.length) return [];
        const chains = [];
        const remaining = [
            ...entities
        ];
        while(remaining.length > 0){
            const chain = [];
            const current = remaining.shift();
            chain.push(current);
            let currentEnd = getEndPoints(current).end;
            let currentStart = getEndPoints(current).start;
            let changed = true;
            while(changed && remaining.length > 0){
                changed = false;
                for(let i = 0; i < remaining.length; i++){
                    const candidate = remaining[i];
                    const { start, end } = getEndPoints(candidate);
                    if (EntityEditHandler.pointsNear(currentEnd, start, tolerance)) {
                        chain.push(candidate);
                        currentEnd = end;
                        remaining.splice(i, 1);
                        changed = true;
                        break;
                    }
                    if (EntityEditHandler.pointsNear(currentEnd, end, tolerance)) {
                        const reversed = EntityEditHandler.reverseEntity(candidate);
                        if (reversed) {
                            chain.push(reversed);
                            currentEnd = getEndPoints(reversed).end;
                            remaining.splice(i, 1);
                            changed = true;
                            break;
                        }
                    } else if (EntityEditHandler.pointsNear(currentStart, end, tolerance)) {
                        chain.unshift(candidate);
                        currentStart = start;
                        remaining.splice(i, 1);
                        changed = true;
                        break;
                    } else if (EntityEditHandler.pointsNear(currentStart, start, tolerance)) {
                        const reversed = EntityEditHandler.reverseEntity(candidate);
                        if (reversed) {
                            chain.unshift(reversed);
                            currentStart = getEndPoints(reversed).start;
                            remaining.splice(i, 1);
                            changed = true;
                            break;
                        }
                    }
                }
            }
            chains.push(chain);
        }
        return chains;
    }
    static joinPolylines(polylines, tolerance) {
        if (0 === polylines.length) return null;
        const orderedPolylines = EntityEditHandler.orderConnectedEntities(polylines, (pl)=>EntityEditHandler.getPolylineEndPoints(pl), tolerance);
        if (!orderedPolylines) return null;
        const mergedVertices = [];
        for(let i = 0; i < orderedPolylines.length; i++){
            const polyline = orderedPolylines[i];
            const vertices = [
                ...polyline.vertices
            ];
            if (0 === i) mergedVertices.push(...vertices);
            else {
                if (mergedVertices.length > 0 && vertices.length > 0) mergedVertices[mergedVertices.length - 1].bulge = vertices[0].bulge || 0;
                mergedVertices.push(...vertices.slice(1));
            }
        }
        const first = mergedVertices[0];
        const last = mergedVertices[mergedVertices.length - 1];
        const isClosed = EntityEditHandler.pointsNear(first, last, tolerance);
        if (isClosed) mergedVertices.pop();
        return new __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.PolylineEntity({
            id: (0, __WEBPACK_EXTERNAL_MODULE_nanoid__.nanoid)(),
            layerId: polylines[0].layerId,
            vertices: mergedVertices,
            isClosed,
            color: polylines[0].color,
            lineWidth: polylines[0].lineWidth,
            lineType: polylines[0].lineType
        });
    }
    static joinSplines(splines, tolerance) {
        if (0 === splines.length) return null;
        const firstMethod = splines[0].method;
        const allSameMethod = splines.every((s)=>s.method === firstMethod);
        if (!allSameMethod) return null;
        const orderedSplines = EntityEditHandler.orderConnectedEntities(splines, (sp)=>EntityEditHandler.getSplineEndPoints(sp), tolerance);
        if (!orderedSplines) return null;
        if ('FIT' === firstMethod) {
            const mergedFitPoints = [];
            for(let i = 0; i < orderedSplines.length; i++){
                const spline = orderedSplines[i];
                const fitPoints = spline.fitPoints || [];
                if (0 === i) mergedFitPoints.push(...fitPoints);
                else mergedFitPoints.push(...fitPoints.slice(1));
            }
            const first = mergedFitPoints[0];
            const last = mergedFitPoints[mergedFitPoints.length - 1];
            const isClosed = EntityEditHandler.pointsNear(first, last, tolerance);
            if (isClosed) mergedFitPoints.pop();
            const { controlPoints, knots, degree } = __WEBPACK_EXTERNAL_MODULE__utils_SplineUtils_js_d30ecb97__.SplineUtils.fitPointsToSpline(mergedFitPoints, splines[0].degree, orderedSplines[0].startTangent, orderedSplines[orderedSplines.length - 1].endTangent, isClosed);
            return new __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.SplineEntity({
                id: (0, __WEBPACK_EXTERNAL_MODULE_nanoid__.nanoid)(),
                layerId: splines[0].layerId,
                method: 'FIT',
                degree,
                fitPoints: mergedFitPoints,
                controlPoints,
                knots,
                isClosed,
                startTangent: orderedSplines[0].startTangent,
                endTangent: orderedSplines[orderedSplines.length - 1].endTangent,
                color: splines[0].color,
                lineWidth: splines[0].lineWidth,
                lineType: splines[0].lineType
            });
        }
        {
            const mergedControlPoints = [];
            for(let i = 0; i < orderedSplines.length; i++){
                const spline = orderedSplines[i];
                const controlPoints = spline.controlPoints || [];
                if (0 === i) mergedControlPoints.push(...controlPoints);
                else mergedControlPoints.push(...controlPoints.slice(1));
            }
            const first = mergedControlPoints[0];
            const last = mergedControlPoints[mergedControlPoints.length - 1];
            const isClosed = EntityEditHandler.pointsNear(first, last, tolerance);
            if (isClosed) mergedControlPoints.pop();
            const knots = __WEBPACK_EXTERNAL_MODULE__utils_SplineUtils_js_d30ecb97__.SplineUtils.generateKnots(mergedControlPoints.length, splines[0].degree, isClosed);
            return new __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.SplineEntity({
                id: (0, __WEBPACK_EXTERNAL_MODULE_nanoid__.nanoid)(),
                layerId: splines[0].layerId,
                method: 'CV',
                degree: splines[0].degree,
                controlPoints: mergedControlPoints,
                knots,
                isClosed,
                color: splines[0].color,
                lineWidth: splines[0].lineWidth,
                lineType: splines[0].lineType
            });
        }
    }
    static joinArcs(arcs, tolerance) {
        if (0 === arcs.length) return null;
        const originArc = arcs[0];
        const orderedArcs = EntityEditHandler.orderConnectedEntities(arcs, (arc)=>EntityEditHandler.getArcEndPoints(arc), tolerance);
        if (!orderedArcs) return null;
        let totalAngle = 0;
        for (const arc of orderedArcs){
            let arcAngle = arc.endAngle - arc.startAngle;
            if (arc.clockwise) {
                if (arcAngle > 0) arcAngle -= 2 * Math.PI;
            } else if (arcAngle < 0) arcAngle += 2 * Math.PI;
            totalAngle += Math.abs(arcAngle);
        }
        if (Math.abs(totalAngle - 2 * Math.PI) < 0.01) return new __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.CircleEntity({
            id: (0, __WEBPACK_EXTERNAL_MODULE_nanoid__.nanoid)(),
            layerId: originArc.layerId,
            center: {
                x: originArc.center.x,
                y: originArc.center.y
            },
            radius: originArc.radius,
            color: originArc.color,
            lineWidth: originArc.lineWidth,
            lineType: originArc.lineType
        });
        const computeSignedSweep = (arc)=>{
            let delta = arc.endAngle - arc.startAngle;
            while(delta <= -2 * Math.PI)delta += 2 * Math.PI;
            while(delta > 2 * Math.PI)delta -= 2 * Math.PI;
            if (arc.clockwise) {
                if (delta > 0) delta -= 2 * Math.PI;
            } else if (delta < 0) delta += 2 * Math.PI;
            return delta;
        };
        const bulges = orderedArcs.map((a)=>{
            const angle = computeSignedSweep(a);
            return Math.tan(angle / 4);
        });
        const vertices = [];
        const firstStart = EntityEditHandler.getArcEndPoints(orderedArcs[0]).start;
        vertices.push({
            x: firstStart.x,
            y: firstStart.y,
            bulge: bulges[0]
        });
        for(let i = 0; i < orderedArcs.length; i++){
            const endPt = EntityEditHandler.getArcEndPoints(orderedArcs[i]).end;
            const nextBulge = i + 1 < bulges.length ? bulges[i + 1] : 0;
            vertices.push({
                x: endPt.x,
                y: endPt.y,
                bulge: nextBulge
            });
        }
        const isClosed = EntityEditHandler.pointsNear(vertices[0], vertices[vertices.length - 1], tolerance);
        if (isClosed) vertices.pop();
        return new __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.PolylineEntity({
            id: (0, __WEBPACK_EXTERNAL_MODULE_nanoid__.nanoid)(),
            layerId: originArc.layerId,
            vertices,
            isClosed,
            color: originArc.color,
            lineWidth: originArc.lineWidth,
            lineType: originArc.lineType
        });
    }
    static orderConnectedEntities(entities, getEndPoints, tolerance) {
        if (0 === entities.length) return null;
        if (1 === entities.length) return entities;
        const ordered = [];
        const remaining = [
            ...entities
        ];
        const current = remaining.shift();
        ordered.push(current);
        let currentEnd = getEndPoints(current).end;
        while(remaining.length > 0){
            let found = false;
            for(let i = 0; i < remaining.length; i++){
                const candidate = remaining[i];
                const { start, end } = getEndPoints(candidate);
                if (EntityEditHandler.pointsNear(currentEnd, start, tolerance)) {
                    ordered.push(candidate);
                    currentEnd = end;
                    remaining.splice(i, 1);
                    found = true;
                    break;
                }
                if (EntityEditHandler.pointsNear(currentEnd, end, tolerance)) {
                    const reversed = EntityEditHandler.reverseEntity(candidate);
                    if (reversed) {
                        ordered.push(reversed);
                        currentEnd = getEndPoints(reversed).end;
                        remaining.splice(i, 1);
                        found = true;
                        break;
                    }
                }
            }
            if (!found) return null;
        }
        return ordered;
    }
    static reverseEntity(entity) {
        if (entity instanceof __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.PolylineEntity) {
            const reversed = entity.clone();
            const original = [
                ...reversed.vertices
            ];
            const n = original.length;
            const out = new Array(n);
            for(let i = 0; i < n; i++){
                const origIndex = n - 1 - i;
                out[i] = {
                    ...original[origIndex]
                };
            }
            if (n > 0) {
                if (reversed.isClosed) for(let i = 0; i < n; i++){
                    const origIndex = n - 1 - i;
                    const prevOrigIndex = (origIndex - 1 + n) % n;
                    out[i].bulge = -(original[prevOrigIndex].bulge || 0);
                }
                else {
                    for(let i = 0; i < n - 1; i++){
                        const origIndex = n - 1 - i;
                        out[i].bulge = -(original[origIndex - 1].bulge || 0);
                    }
                    out[n - 1].bulge = 0;
                }
            }
            reversed.vertices = out;
            return reversed;
        }
        if (entity instanceof __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.SplineEntity) {
            const reversed = entity.clone();
            if (reversed.fitPoints) reversed.fitPoints = [
                ...reversed.fitPoints
            ].reverse();
            reversed.controlPoints = [
                ...reversed.controlPoints
            ].reverse();
            [reversed.startTangent, reversed.endTangent] = [
                reversed.endTangent,
                reversed.startTangent
            ];
            return reversed;
        }
        if (entity instanceof __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_cc0256eb__.ArcEntity) {
            const reversed = entity.clone();
            [reversed.startAngle, reversed.endAngle] = [
                reversed.endAngle,
                reversed.startAngle
            ];
            reversed.clockwise = !reversed.clockwise;
            return reversed;
        }
        return null;
    }
    static getPolylineEndPoints(polyline) {
        const vertices = polyline.vertices;
        return {
            start: {
                x: vertices[0].x,
                y: vertices[0].y
            },
            end: {
                x: vertices[vertices.length - 1].x,
                y: vertices[vertices.length - 1].y
            }
        };
    }
    static getSplineEndPoints(spline) {
        const points = 'FIT' === spline.method ? spline.fitPoints : spline.controlPoints;
        if (!points || 0 === points.length) return {
            start: {
                x: 0,
                y: 0
            },
            end: {
                x: 0,
                y: 0
            }
        };
        return {
            start: {
                x: points[0].x,
                y: points[0].y
            },
            end: {
                x: points[points.length - 1].x,
                y: points[points.length - 1].y
            }
        };
    }
    static getArcEndPoints(arc) {
        const startX = arc.center.x + arc.radius * Math.cos(arc.startAngle);
        const startY = arc.center.y + arc.radius * Math.sin(arc.startAngle);
        const endX = arc.center.x + arc.radius * Math.cos(arc.endAngle);
        const endY = arc.center.y + arc.radius * Math.sin(arc.endAngle);
        return {
            start: {
                x: startX,
                y: startY
            },
            end: {
                x: endX,
                y: endY
            }
        };
    }
    static pointsNear(p1, p2, tolerance) {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= tolerance;
    }
}
export { EntityEditHandler };
