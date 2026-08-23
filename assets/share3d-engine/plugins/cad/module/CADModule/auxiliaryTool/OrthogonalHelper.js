import * as __WEBPACK_EXTERNAL_MODULE_inversify__ from "inversify";
import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
class OrthogonalHelper {
    setEnabled(val) {
        this.enabled = val;
    }
    isEnabled() {
        return this.enabled;
    }
    getOrthogonalInfo(worldPos, option) {
        if (!this.enabled || !option?.startPoint) return;
        const startPoint = new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(option.startPoint.x, option.startPoint.y);
        const currentPoint = new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(worldPos.x, worldPos.y);
        const diff = currentPoint.clone().sub(startPoint);
        const distX = Math.abs(diff.x);
        const distY = Math.abs(diff.y);
        if (distX > distY) return {
            x: currentPoint.x,
            y: startPoint.y
        };
        return {
            x: startPoint.x,
            y: currentPoint.y
        };
    }
    constructor(){
        this.enabled = false;
    }
}
OrthogonalHelper = _ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.injectable)()
], OrthogonalHelper);
export { OrthogonalHelper };
