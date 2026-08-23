import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
function createBoxVolume(position, scale, rotation) {
    const matrix = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4();
    matrix.compose(position, new __WEBPACK_EXTERNAL_MODULE_three__.Quaternion().setFromEuler(rotation ?? new __WEBPACK_EXTERNAL_MODULE_three__.Euler()), scale);
    return {
        type: 'box',
        matrix
    };
}
function createPolygonVolume(vertices, options) {
    const center = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
    for (const v of vertices)center.add(v);
    if (vertices.length > 0) center.divideScalar(vertices.length);
    const matrix = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4().setPosition(center);
    return {
        type: 'polygon',
        matrix,
        vertices: vertices.map((v)=>v.clone()),
        viewMatrix: options?.viewMatrix,
        projMatrix: options?.projMatrix
    };
}
export { createBoxVolume, createPolygonVolume };
