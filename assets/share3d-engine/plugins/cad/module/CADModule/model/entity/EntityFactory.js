import * as __WEBPACK_EXTERNAL_MODULE__common_constant_js_335399ae__ from "../common/constant.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_2967608e__ from "../../../../../../shared/logging/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__AlignDimensionEntity_js_3a77f236__ from "./AlignDimensionEntity.js";
import * as __WEBPACK_EXTERNAL_MODULE__AngularDimensionEntity_js_f3e1b80b__ from "./AngularDimensionEntity.js";
import * as __WEBPACK_EXTERNAL_MODULE__ArcEntity_js_81e741a5__ from "./ArcEntity.js";
import * as __WEBPACK_EXTERNAL_MODULE__CircleEntity_js_d710a8cf__ from "./CircleEntity.js";
import * as __WEBPACK_EXTERNAL_MODULE__EllipseEntity_js_642cde73__ from "./EllipseEntity.js";
import * as __WEBPACK_EXTERNAL_MODULE__HatchEntity_js_00df9bce__ from "./HatchEntity.js";
import * as __WEBPACK_EXTERNAL_MODULE__MLeaderEntity_js_beb79e1e__ from "./MLeaderEntity.js";
import * as __WEBPACK_EXTERNAL_MODULE__MTextEntity_js_7ef2e0ba__ from "./MTextEntity.js";
import * as __WEBPACK_EXTERNAL_MODULE__PolylineEntity_js_e0c931da__ from "./PolylineEntity.js";
import * as __WEBPACK_EXTERNAL_MODULE__RayEntity_js_a48f91b6__ from "./RayEntity.js";
import * as __WEBPACK_EXTERNAL_MODULE__SplineEntity_js_b0226a74__ from "./SplineEntity.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_2967608e__.getLoggerManager)().getLogger('cad');
class EntityFactory {
    static createEntity(data) {
        switch(data.type){
            case __WEBPACK_EXTERNAL_MODULE__common_constant_js_335399ae__.EntityType.Polyline:
                return new __WEBPACK_EXTERNAL_MODULE__PolylineEntity_js_e0c931da__.PolylineEntity(data);
            case __WEBPACK_EXTERNAL_MODULE__common_constant_js_335399ae__.EntityType.Arc:
                return new __WEBPACK_EXTERNAL_MODULE__ArcEntity_js_81e741a5__.ArcEntity(data);
            case __WEBPACK_EXTERNAL_MODULE__common_constant_js_335399ae__.EntityType.Circle:
                return new __WEBPACK_EXTERNAL_MODULE__CircleEntity_js_d710a8cf__.CircleEntity(data);
            case __WEBPACK_EXTERNAL_MODULE__common_constant_js_335399ae__.EntityType.Spline:
                return new __WEBPACK_EXTERNAL_MODULE__SplineEntity_js_b0226a74__.SplineEntity(data);
            case __WEBPACK_EXTERNAL_MODULE__common_constant_js_335399ae__.EntityType.MText:
                return new __WEBPACK_EXTERNAL_MODULE__MTextEntity_js_7ef2e0ba__.MTextEntity(data);
            case __WEBPACK_EXTERNAL_MODULE__common_constant_js_335399ae__.EntityType.MLeader:
                return new __WEBPACK_EXTERNAL_MODULE__MLeaderEntity_js_beb79e1e__.MLeaderEntity(data);
            case __WEBPACK_EXTERNAL_MODULE__common_constant_js_335399ae__.EntityType.AlignDimension:
                return new __WEBPACK_EXTERNAL_MODULE__AlignDimensionEntity_js_3a77f236__.AlignDimensionEntity(data);
            case __WEBPACK_EXTERNAL_MODULE__common_constant_js_335399ae__.EntityType.Ellipse:
                return new __WEBPACK_EXTERNAL_MODULE__EllipseEntity_js_642cde73__.EllipseEntity(data);
            case __WEBPACK_EXTERNAL_MODULE__common_constant_js_335399ae__.EntityType.Ray:
                return new __WEBPACK_EXTERNAL_MODULE__RayEntity_js_a48f91b6__.RayEntity(data);
            case __WEBPACK_EXTERNAL_MODULE__common_constant_js_335399ae__.EntityType.Hatch:
                return new __WEBPACK_EXTERNAL_MODULE__HatchEntity_js_00df9bce__.HatchEntity(data);
            case __WEBPACK_EXTERNAL_MODULE__common_constant_js_335399ae__.EntityType.AngularDimension:
                return new __WEBPACK_EXTERNAL_MODULE__AngularDimensionEntity_js_f3e1b80b__.AngularDimensionEntity(data);
            default:
                log.warn(`Unknown entity type: ${data.type}`);
                return null;
        }
    }
}
export { EntityFactory };
