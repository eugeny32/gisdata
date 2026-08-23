import * as __WEBPACK_EXTERNAL_MODULE_inversify__ from "inversify";
import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__ from "../../container/types.js";
import * as __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__ from "../../i18n/tipKeys.js";
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
}
class PolarHelper {
    isEnabled() {
        return this.enabled;
    }
    setPolarAngles(angles) {
        this.polarAngles = angles;
        this.setEnabled(angles.length > 0);
    }
    setEnabled(val) {
        if (this.enabled === val) return;
        this.enabled = val;
        if (!this.enabled) this.clearUI();
    }
    updateUI(_screenPos, polarRes) {
        if (!this.enabled) return;
        if (polarRes) {
            this.mouseTipHelper.addTip('Polar_Tip', __WEBPACK_EXTERNAL_MODULE__i18n_tipKeys_js_f7b351c4__.CadTipKey.auxiliary.polar.status, {
                distance: polarRes.distance.toFixed(4),
                angle: polarRes.angle
            });
            const el = this.mouseTipHelper.getTip('Polar_Tip');
            if (el) {
                el.style.borderLeft = '1px solid #999';
                el.style.marginLeft = '6px';
                el.style.paddingLeft = '6px';
            }
        } else this.mouseTipHelper.removeTip('Polar_Tip');
    }
    clearUI() {
        this.hidePolarLine();
        this.mouseTipHelper.removeTip('Polar_Tip');
    }
    calculatePolarSnap(worldPos, option) {
        if (!this.enabled || !option?.startPoint || 0 === this.polarAngles.length) {
            this.hidePolarLine();
            return null;
        }
        const startPoint = option.startPoint;
        const dx = worldPos.x - startPoint.x;
        const dy = worldPos.y - startPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = 180 / Math.PI * Math.atan2(dy, dx);
        let snapAngle = null;
        let minDiff = 6;
        for (const pAngle of this.polarAngles){
            const snapCandidate = Math.round(angle / pAngle) * pAngle;
            const diff = Math.abs(angle - snapCandidate);
            if (diff <= 5 && diff < minDiff) {
                minDiff = diff;
                snapAngle = snapCandidate;
            }
        }
        if (null !== snapAngle) {
            const radian = Math.PI / 180 * snapAngle;
            this.drawPolarLine(startPoint, snapAngle);
            return {
                x: startPoint.x + distance * Math.cos(radian),
                y: startPoint.y + distance * Math.sin(radian),
                z: startPoint.z || worldPos.z || 0,
                distance,
                angle: snapAngle
            };
        }
        this.hidePolarLine();
        return null;
    }
    drawPolarLine(startPoint, angle) {
        if (!this.polarLineObj) {
            const mat = new __WEBPACK_EXTERNAL_MODULE_three__.LineDashedMaterial({
                color: 0x118af0,
                dashSize: 0.5,
                gapSize: 0.5,
                depthTest: false
            });
            this.polarLineObj = new __WEBPACK_EXTERNAL_MODULE_three__.Line(new __WEBPACK_EXTERNAL_MODULE_three__.BufferGeometry(), mat);
            this.viewManager.attachTempObject(this.polarLineObj);
        }
        const radian = Math.PI / 180 * angle;
        const length = 1000;
        const endPoint = {
            x: startPoint.x + length * Math.cos(radian),
            y: startPoint.y + length * Math.sin(radian),
            z: startPoint.z || 0
        };
        this.polarLineObj.geometry.setFromPoints([
            new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(startPoint.x, startPoint.y, startPoint.z || 0),
            new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(endPoint.x, endPoint.y, endPoint.z || 0)
        ]);
        this.polarLineObj.computeLineDistances();
        this.polarLineObj.visible = true;
    }
    hidePolarLine() {
        if (this.polarLineObj) this.polarLineObj.visible = false;
    }
    constructor(){
        this.enabled = false;
        this.polarAngles = [];
        this.polarLineObj = null;
    }
}
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.CADViewManager),
    _ts_metadata("design:type", "undefined" == typeof CADViewManager ? Object : CADViewManager)
], PolarHelper.prototype, "viewManager", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_b48f778d__.TYPES.MouseTipHelper),
    _ts_metadata("design:type", "undefined" == typeof MouseTipHelper ? Object : MouseTipHelper)
], PolarHelper.prototype, "mouseTipHelper", void 0);
PolarHelper = _ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.injectable)()
], PolarHelper);
export { PolarHelper };
