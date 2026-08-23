import * as __WEBPACK_EXTERNAL_MODULE_nanoid__ from "nanoid";
import * as __WEBPACK_EXTERNAL_MODULE__utils_index_js_02c78a7f__ from "../../../utils/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__ from "../../model/common/constant.js";
import * as __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_4760f106__ from "../../model/entity/index.js";
class JoinUtils {
    static joinByType(type, entities, tolerance) {
        const result = {
            nonJoined: [],
            created: []
        };
        let joinFunc = null;
        let getEndPointsFunc = null;
        switch(type){
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Polyline:
                joinFunc = JoinUtils.joinPolylines.bind(JoinUtils);
                getEndPointsFunc = JoinUtils.getPolylineEndPoints.bind(JoinUtils);
                break;
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Spline:
                joinFunc = JoinUtils.joinSplines.bind(JoinUtils);
                getEndPointsFunc = JoinUtils.getSplineEndPoints.bind(JoinUtils);
                break;
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Arc:
                joinFunc = JoinUtils.joinArcs.bind(JoinUtils);
                getEndPointsFunc = JoinUtils.getArcEndPoints.bind(JoinUtils);
                break;
            default:
                result.nonJoined.push(...entities);
                return result;
        }
        const chains = JoinUtils.findConnectedChains(entities, getEndPointsFunc, tolerance);
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
                    if (JoinUtils.pointsNear(currentEnd, start, tolerance)) {
                        chain.push(candidate);
                        currentEnd = end;
                        remaining.splice(i, 1);
                        changed = true;
                        break;
                    }
                    if (JoinUtils.pointsNear(currentEnd, end, tolerance)) {
                        const reversed = JoinUtils.reverseEntity(candidate);
                        if (reversed) {
                            chain.push(reversed);
                            currentEnd = getEndPoints(reversed).end;
                            remaining.splice(i, 1);
                            changed = true;
                            break;
                        }
                    } else if (JoinUtils.pointsNear(currentStart, end, tolerance)) {
                        chain.unshift(candidate);
                        currentStart = start;
                        remaining.splice(i, 1);
                        changed = true;
                        break;
                    } else if (JoinUtils.pointsNear(currentStart, start, tolerance)) {
                        const reversed = JoinUtils.reverseEntity(candidate);
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
        const orderedPolylines = JoinUtils.orderConnectedEntities(polylines, (pl)=>JoinUtils.getPolylineEndPoints(pl), tolerance);
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
        const isClosed = JoinUtils.pointsNear(first, last, tolerance);
        if (isClosed) mergedVertices.pop();
        return new __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_4760f106__.PolylineEntity({
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
        const orderedSplines = JoinUtils.orderConnectedEntities(splines, (sp)=>JoinUtils.getSplineEndPoints(sp), tolerance);
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
            const isClosed = JoinUtils.pointsNear(first, last, tolerance);
            if (isClosed) mergedFitPoints.pop();
            const { controlPoints, knots, degree } = __WEBPACK_EXTERNAL_MODULE__utils_index_js_02c78a7f__.SplineUtils.fitPointsToSpline(mergedFitPoints, splines[0].degree, orderedSplines[0].startTangent, orderedSplines[orderedSplines.length - 1].endTangent, isClosed);
            return new __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_4760f106__.SplineEntity({
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
            const isClosed = JoinUtils.pointsNear(first, last, tolerance);
            if (isClosed) mergedControlPoints.pop();
            const knots = __WEBPACK_EXTERNAL_MODULE__utils_index_js_02c78a7f__.SplineUtils.generateKnots(mergedControlPoints.length, splines[0].degree, isClosed);
            return new __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_4760f106__.SplineEntity({
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
        const orderedArcs = JoinUtils.orderConnectedEntities(arcs, (arc)=>JoinUtils.getArcEndPoints(arc), tolerance);
        if (!orderedArcs) return null;
        let totalAngle = 0;
        for (const arc of orderedArcs){
            let arcAngle = arc.endAngle - arc.startAngle;
            if (arc.clockwise) {
                if (arcAngle > 0) arcAngle -= 2 * Math.PI;
            } else if (arcAngle < 0) arcAngle += 2 * Math.PI;
            totalAngle += Math.abs(arcAngle);
        }
        if (Math.abs(totalAngle - 2 * Math.PI) < 0.01) return new __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_4760f106__.CircleEntity({
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
        const firstStart = JoinUtils.getArcEndPoints(orderedArcs[0]).start;
        vertices.push({
            x: firstStart.x,
            y: firstStart.y,
            bulge: bulges[0]
        });
        for(let i = 0; i < orderedArcs.length; i++){
            const endPt = JoinUtils.getArcEndPoints(orderedArcs[i]).end;
            const nextBulge = i + 1 < bulges.length ? bulges[i + 1] : 0;
            vertices.push({
                x: endPt.x,
                y: endPt.y,
                bulge: nextBulge
            });
        }
        const isClosed = JoinUtils.pointsNear(vertices[0], vertices[vertices.length - 1], tolerance);
        if (isClosed) vertices.pop();
        return new __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_4760f106__.PolylineEntity({
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
                if (JoinUtils.pointsNear(currentEnd, start, tolerance)) {
                    ordered.push(candidate);
                    currentEnd = end;
                    remaining.splice(i, 1);
                    found = true;
                    break;
                }
                if (JoinUtils.pointsNear(currentEnd, end, tolerance)) {
                    const reversed = JoinUtils.reverseEntity(candidate);
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
        if (entity instanceof __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_4760f106__.PolylineEntity) {
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
        if (entity instanceof __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_4760f106__.SplineEntity) {
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
        if (entity instanceof __WEBPACK_EXTERNAL_MODULE__model_entity_index_js_4760f106__.ArcEntity) {
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
export { JoinUtils };
