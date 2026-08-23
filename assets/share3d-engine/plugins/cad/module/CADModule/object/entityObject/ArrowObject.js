import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__utils_index_js_02c78a7f__ from "../../../utils/index.js";
class ArrowObject extends __WEBPACK_EXTERNAL_MODULE_three__.Mesh {
    constructor(options = {}){
        const { color = 0xffffff, length = 2.5 } = options;
        const geometry = __WEBPACK_EXTERNAL_MODULE__utils_index_js_02c78a7f__.DrawUtils.createArrowShape(length, length / 3);
        const material = options.material || new __WEBPACK_EXTERNAL_MODULE_three__.MeshBasicMaterial({
            color,
            depthTest: false,
            depthWrite: false
        });
        super(geometry, material);
    }
    update(point, direction, isReversed) {
        this.position.copy(point);
        let angle = Math.atan2(direction.y, direction.x);
        if (isReversed) angle += Math.PI;
        this.rotation.z = angle;
    }
}
export { ArrowObject };
