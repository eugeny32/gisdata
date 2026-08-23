import * as __WEBPACK_EXTERNAL_MODULE_inversify__ from "inversify";
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
class AuxiliaryMouseHelper {
    injectTool(tool) {
        this.captureHelper.injectTool(tool);
    }
    ejectTool() {
        this.clearUI();
        this.captureHelper.ejectTool();
    }
    mouseCapture(params, options) {
        const currentWorldPos = {
            x: params.worldPos.x,
            y: params.worldPos.y,
            z: 0
        };
        const captureRes = this.captureHelper.capture(params.screenPos, params.worldPos, void 0, {
            entities: options?.entities
        });
        if (captureRes) {
            this.polarHelper.clearUI();
            return {
                x: captureRes.point.x,
                y: captureRes.point.y
            };
        }
        const pcRes = this.pointCloudHelper.getHitPosition(params.screenPos.x, params.screenPos.y);
        if (pcRes) {
            this.polarHelper.clearUI();
            return {
                x: currentWorldPos.x,
                y: currentWorldPos.y
            };
        }
        const polarRes = this.polarHelper.calculatePolarSnap(currentWorldPos, {
            startPoint: options?.startPoint
        });
        this.polarHelper.updateUI(params.screenPos, polarRes);
        if (polarRes) return {
            x: polarRes.x,
            y: polarRes.y
        };
        const orthoRes = this.orthogonalHelper.getOrthogonalInfo(currentWorldPos, {
            startPoint: options?.startPoint
        });
        if (orthoRes) return {
            x: orthoRes.x,
            y: orthoRes.y
        };
        return {
            x: currentWorldPos.x,
            y: currentWorldPos.y
        };
    }
    clearUI() {
        this.captureHelper.clear();
        this.polarHelper.clearUI();
    }
}
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.CaptureHelper),
    _ts_metadata("design:type", "undefined" == typeof CaptureHelper ? Object : CaptureHelper)
], AuxiliaryMouseHelper.prototype, "captureHelper", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.OrthogonalHelper),
    _ts_metadata("design:type", "undefined" == typeof OrthogonalHelper ? Object : OrthogonalHelper)
], AuxiliaryMouseHelper.prototype, "orthogonalHelper", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.PolarHelper),
    _ts_metadata("design:type", "undefined" == typeof PolarHelper ? Object : PolarHelper)
], AuxiliaryMouseHelper.prototype, "polarHelper", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.PointCloudHelper),
    _ts_metadata("design:type", "undefined" == typeof PointCloudHelper ? Object : PointCloudHelper)
], AuxiliaryMouseHelper.prototype, "pointCloudHelper", void 0);
AuxiliaryMouseHelper = _ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.injectable)()
], AuxiliaryMouseHelper);
export { AuxiliaryMouseHelper };
