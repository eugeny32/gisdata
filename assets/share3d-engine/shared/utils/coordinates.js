import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__constants_index_js_028bc35d__ from "../constants/index.js";
function toPixelCoordinates(camera, domElement, vec) {
    const vector = vec.project(camera);
    return {
        x: (vector.x + 1) / 2 * domElement.clientWidth,
        y: (-vector.y + 1) / 2 * domElement.clientHeight
    };
}
function toSceneCoordinates(camera, renderer, screenPos, z) {
    const { width, height } = renderer.getSize(new __WEBPACK_EXTERNAL_MODULE_three__.Vector2());
    const labelPos = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(screenPos.x / width * 2 - 1, 2 * -(screenPos.y / height) + 1, z ?? __WEBPACK_EXTERNAL_MODULE__constants_index_js_028bc35d__.DEFAULT_UNPROJECT_Z);
    return labelPos.unproject(camera).clone();
}
export { toPixelCoordinates, toSceneCoordinates };
