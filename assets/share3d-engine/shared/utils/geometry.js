import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
function mergeBoundingBoxes(boxes) {
    if (0 === boxes.length) return new __WEBPACK_EXTERNAL_MODULE_three__.Box3(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(), new __WEBPACK_EXTERNAL_MODULE_three__.Vector3());
    const merged = new __WEBPACK_EXTERNAL_MODULE_three__.Box3();
    for (const box of boxes)merged.union(box);
    return merged;
}
function ndcToRay(ndc, camera) {
    const raycaster = new __WEBPACK_EXTERNAL_MODULE_three__.Raycaster();
    raycaster.setFromCamera(ndc, camera);
    return raycaster.ray.clone();
}
export { mergeBoundingBoxes, ndcToRay };
