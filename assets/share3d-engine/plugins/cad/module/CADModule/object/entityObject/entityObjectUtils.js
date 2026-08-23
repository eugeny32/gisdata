import * as __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__ from "lodash-es";
import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_Addons_js_c109df0d__ from "three/examples/jsm/Addons.js";
import * as __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__ from "../../model/common/constant.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_index_js_02c78a7f__ from "../../../utils/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_ArcUtils_js_38ae85a5__ from "../../../utils/ArcUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_SplineUtils_js_f26f80c2__ from "../../../utils/SplineUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_2967608e__ from "../../../../../../shared/logging/index.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_2967608e__.getLoggerManager)().getLogger('cad');
class EntityObjectUtils {
    static #_ = this.RAY_RENDER_LENGTH = 1000;
    static createEntityLineGeometry(entity) {
        const points = EntityObjectUtils.getEntitySamplePoints(entity);
        if (!points) return null;
        return __WEBPACK_EXTERNAL_MODULE__utils_index_js_02c78a7f__.DrawUtils.getLineGeometryByPoints(points);
    }
    static getEntitySamplePoints(entity) {
        switch(entity.type){
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Polyline:
                return EntityObjectUtils.getPolylineSamplePoints(entity);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Arc:
                return __WEBPACK_EXTERNAL_MODULE__utils_index_js_02c78a7f__.DrawUtils.getArcPoints({
                    ...(0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.pick)(entity, [
                        'center',
                        'radius',
                        'startAngle',
                        'endAngle',
                        'clockwise'
                    ]),
                    segmentsNum: entity.segmentsNum || 32
                });
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Circle:
                return __WEBPACK_EXTERNAL_MODULE__utils_index_js_02c78a7f__.DrawUtils.getArcPoints({
                    ...(0, __WEBPACK_EXTERNAL_MODULE_lodash_es_18c59938__.pick)(entity, [
                        'center',
                        'radius'
                    ]),
                    segmentsNum: entity.segmentsNum || 32
                });
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Spline:
                return EntityObjectUtils.getSplineSamplePoints(entity);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Ellipse:
                return EntityObjectUtils.getEllipseSamplePoints(entity);
            case __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_b3663690__.EntityType.Ray:
                return EntityObjectUtils.getRaySamplePoints(entity);
            default:
                log.warn(`Unsupported entity type: ${entity.type}`);
                return null;
        }
    }
    static getPolylineSamplePoints(entity) {
        const points = entity.vertices.map((v)=>({
                x: v.x,
                y: v.y,
                bulge: v.bulge || 0
            }));
        if (entity.isClosed && points.length > 2) points.push(points[0]);
        const sampledPoints = [];
        for(let i = 0; i < points.length - 1; i++){
            const p1 = new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(points[i].x, points[i].y);
            const p2 = new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(points[i + 1].x, points[i + 1].y);
            const bulge = points[i].bulge || 0;
            if (Math.abs(bulge) < 0.0001) sampledPoints.push(p1, p2);
            else {
                const arcData = EntityObjectUtils.getArcDataFromBulge(p1, p2, bulge);
                if (!arcData) {
                    sampledPoints.push(p1, p2);
                    continue;
                }
                const path = new __WEBPACK_EXTERNAL_MODULE_three__.Path();
                path.moveTo(p1.x, p1.y);
                EntityObjectUtils.addBulgeArc(path, arcData);
                const sweepAngle = __WEBPACK_EXTERNAL_MODULE__utils_ArcUtils_js_38ae85a5__.ArcUtils.getSweepAngle(arcData.startAngle, arcData.endAngle, arcData.clockwise);
                const segmentsNum = __WEBPACK_EXTERNAL_MODULE__utils_ArcUtils_js_38ae85a5__.ArcUtils.getStaticSegments(arcData.radius, sweepAngle);
                sampledPoints.push(...path.getPoints(segmentsNum));
            }
        }
        return sampledPoints;
    }
    static addBulgeArc(path, arcData) {
        const { center, radius, startAngle, endAngle, clockwise } = arcData;
        path.absarc(center.x, center.y, radius, startAngle, endAngle, clockwise);
    }
    static getArcDataFromBulge(p1, p2, bulge) {
        if (Math.abs(bulge) < 0.0001) return null;
        const v = new __WEBPACK_EXTERNAL_MODULE_three__.Vector2().subVectors(p2, p1);
        const L = v.length();
        const middle = new __WEBPACK_EXTERNAL_MODULE_three__.Vector2().addVectors(p1, p2).multiplyScalar(0.5);
        const normal = new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(-v.y, v.x).normalize();
        const d = L / 2 * (1 - bulge * bulge) / (2 * bulge);
        const center = middle.clone().add(normal.multiplyScalar(d));
        const radius = Math.sqrt((L / 2) ** 2 + d ** 2);
        const startAngle = Math.atan2(p1.y - center.y, p1.x - center.x);
        let endAngle = Math.atan2(p2.y - center.y, p2.x - center.x);
        if (bulge > 0 && endAngle <= startAngle) endAngle += 2 * Math.PI;
        else if (bulge < 0 && endAngle >= startAngle) endAngle -= 2 * Math.PI;
        return {
            center,
            radius,
            startAngle,
            endAngle,
            clockwise: bulge < 0
        };
    }
    static getSplineSamplePoints(entity) {
        if (entity.controlPoints.length < entity.degree + 1) return entity.controlPoints.map((pt)=>new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(pt.x, pt.y, 0));
        const { knots, degree } = entity;
        const controlPoints = entity.controlPoints.map((pt)=>new __WEBPACK_EXTERNAL_MODULE_three__.Vector4(pt.x, pt.y, 0, 1));
        const nurbsCurve = new __WEBPACK_EXTERNAL_MODULE_three_examples_jsm_Addons_js_c109df0d__.NURBSCurve(degree, knots, controlPoints);
        const basePointCount = entity.fitPoints?.length || entity.controlPoints.length;
        const sampleCount = __WEBPACK_EXTERNAL_MODULE__utils_SplineUtils_js_f26f80c2__.SplineUtils.getSampleCount(basePointCount);
        const curvePoints = nurbsCurve.getPoints(sampleCount);
        return curvePoints;
    }
    static getEllipseSamplePoints(entity) {
        const { radiusX, radiusY, startAngle, endAngle, clockwise, rotation } = entity;
        const points = __WEBPACK_EXTERNAL_MODULE__utils_index_js_02c78a7f__.DrawUtils.getEllipsePoints({
            center: {
                x: 0,
                y: 0
            },
            radiusX,
            radiusY,
            startAngle,
            endAngle,
            clockwise,
            rotation
        });
        return points;
    }
    static getRaySamplePoints(entity) {
        const start = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(entity.startPoint.x, entity.startPoint.y, 0);
        const unit = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(entity.unitVector.x, entity.unitVector.y, 0);
        const end = start.clone().add(unit.multiplyScalar(EntityObjectUtils.RAY_RENDER_LENGTH));
        return [
            start,
            end
        ];
    }
}
export { EntityObjectUtils };
