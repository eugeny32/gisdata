import * as __WEBPACK_EXTERNAL_MODULE_inversify__ from "inversify";
import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__ from "../../container/types.js";
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
}
const CAD_POINT_CLOUD_PICK_WINDOW_SIZE = 5;
class PointCloudHelper {
    isEnabled() {
        return this.enabled;
    }
    setEnabled(val) {
        this.enabled = val;
    }
    getHitPosition(offsetX, offsetY) {
        if (!this.enabled) return null;
        if (!this.ctx.hasService('PickingService')) return null;
        const pickingService = this.ctx.getService('PickingService');
        const screen = new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(offsetX, offsetY);
        const camera = this.ctx.getService('ViewportCamera').getActiveCamera();
        const results = pickingService.pickAtScreen(screen, camera, {
            kinds: [
                'pointCloud'
            ],
            windowSize: CAD_POINT_CLOUD_PICK_WINDOW_SIZE
        });
        if (results.length > 0) {
            const hit = results[0];
            return {
                point: {
                    x: hit.point.x,
                    y: hit.point.y,
                    z: hit.point.z
                },
                isSnappingPointCloud: true
            };
        }
        return null;
    }
    constructor(){
        this.enabled = false;
    }
}
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.EngineContext),
    _ts_metadata("design:type", "undefined" == typeof EngineContext ? Object : EngineContext)
], PointCloudHelper.prototype, "ctx", void 0);
PointCloudHelper = _ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.injectable)()
], PointCloudHelper);
export { PointCloudHelper };
