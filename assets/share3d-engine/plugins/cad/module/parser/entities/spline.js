import * as __WEBPACK_EXTERNAL_MODULE__parseHelpers_js_fcb41ae7__ from "../parseHelpers.js";
class SplineEntityParser {
    parseEntity(scanner, curr) {
        const entity = {
            type: curr.value
        };
        curr = scanner.next();
        while(!scanner.isEOF()){
            if (0 === curr.code) break;
            switch(curr.code){
                case 10:
                    entity.controlPoints ||= [];
                    entity.controlPoints.push(__WEBPACK_EXTERNAL_MODULE__parseHelpers_js_fcb41ae7__.parsePoint(scanner));
                    break;
                case 11:
                    entity.fitPoints ||= [];
                    entity.fitPoints.push(__WEBPACK_EXTERNAL_MODULE__parseHelpers_js_fcb41ae7__.parsePoint(scanner));
                    break;
                case 12:
                    entity.startTangent = __WEBPACK_EXTERNAL_MODULE__parseHelpers_js_fcb41ae7__.parsePoint(scanner);
                    break;
                case 13:
                    entity.endTangent = __WEBPACK_EXTERNAL_MODULE__parseHelpers_js_fcb41ae7__.parsePoint(scanner);
                    break;
                case 40:
                    entity.knotValues ||= [];
                    entity.knotValues.push(curr.value);
                    break;
                case 41:
                    entity.weights ||= [];
                    entity.weights.push(curr.value);
                    break;
                case 70:
                    if ((1 & curr.value) !== 0) entity.closed = true;
                    if ((2 & curr.value) !== 0) entity.periodic = true;
                    if ((4 & curr.value) !== 0) entity.rational = true;
                    if ((8 & curr.value) !== 0) entity.planar = true;
                    if ((16 & curr.value) !== 0) {
                        entity.planar = true;
                        entity.linear = true;
                    }
                    break;
                case 71:
                    entity.degreeOfSplineCurve = curr.value;
                    break;
                case 72:
                    entity.numberOfKnots = curr.value;
                    break;
                case 73:
                    entity.numberOfControlPoints = curr.value;
                    break;
                case 74:
                    entity.numberOfFitPoints = curr.value;
                    break;
                case 210:
                    entity.normalVector = __WEBPACK_EXTERNAL_MODULE__parseHelpers_js_fcb41ae7__.parsePoint(scanner);
                    break;
                default:
                    __WEBPACK_EXTERNAL_MODULE__parseHelpers_js_fcb41ae7__.checkCommonEntityProperties(entity, curr, scanner);
                    break;
            }
            curr = scanner.next();
        }
        return entity;
    }
    constructor(){
        this.ForEntityName = 'SPLINE';
    }
}
export { SplineEntityParser as default };
