import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
const rendererSize = new __WEBPACK_EXTERNAL_MODULE_three__.Vector2();
const ndcPoint = new __WEBPACK_EXTERNAL_MODULE_three__.Vector2();
const raycaster = new __WEBPACK_EXTERNAL_MODULE_three__.Raycaster();
const pixelWorldPointA = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
const pixelWorldPointB = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
const cameraPosition = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
const cameraDirection = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
const referencePointDelta = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
const fallbackWorldPointA = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
const fallbackWorldPointB = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
function getRendererDimensions(renderer) {
    if (!renderer) return {
        width: 0,
        height: 0
    };
    const { domElement } = renderer;
    const size = renderer.getSize?.(rendererSize);
    const width = domElement.clientWidth || domElement.width || size?.x || 0;
    const height = domElement.clientHeight || domElement.height || size?.y || 0;
    return {
        width,
        height
    };
}
function getPixelSizeOnPlane(camera, plane, width) {
    ndcPoint.set(0, 0);
    raycaster.setFromCamera(ndcPoint, camera);
    const pointA = raycaster.ray.intersectPlane(plane, pixelWorldPointA);
    if (!pointA) return;
    ndcPoint.set(2 / width, 0);
    raycaster.setFromCamera(ndcPoint, camera);
    const pointB = raycaster.ray.intersectPlane(plane, pixelWorldPointB);
    if (!pointB) return;
    const pixelSize = pointA.distanceTo(pointB);
    return Number.isFinite(pixelSize) && pixelSize > 0 ? pixelSize : void 0;
}
function getPerspectivePixelSizeAtReferencePoint(camera, height, referencePoint) {
    if (!referencePoint) return;
    camera.getWorldPosition(cameraPosition);
    camera.getWorldDirection(cameraDirection);
    const depth = referencePointDelta.subVectors(referencePoint, cameraPosition).dot(cameraDirection);
    if (!Number.isFinite(depth) || depth <= camera.near) return;
    const zoom = camera.zoom || 1;
    const visibleHeight = 2 * Math.tan(camera.fov * Math.PI / 360) * depth / zoom;
    const pixelSize = visibleHeight / height;
    return Number.isFinite(pixelSize) && pixelSize > 0 ? pixelSize : void 0;
}
function getPixelSizeByCameraType(camera, width, height, referencePoint) {
    if (camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.OrthographicCamera) {
        const zoom = camera.zoom || 1;
        const pixelSize = Math.abs(camera.right - camera.left) / zoom / width;
        return Number.isFinite(pixelSize) && pixelSize > 0 ? pixelSize : void 0;
    }
    if (camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.PerspectiveCamera) return getPerspectivePixelSizeAtReferencePoint(camera, height, referencePoint);
}
const getPixelSizeInWorldByCamera = (camera, renderer, radius, options = {})=>{
    const { width, height } = getRendererDimensions(renderer);
    if (width <= 0 || height <= 0) return radius;
    const supportsPlaneRaycast = camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.OrthographicCamera || camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.PerspectiveCamera;
    const pixelSize = (options.plane && supportsPlaneRaycast ? getPixelSizeOnPlane(camera, options.plane, width) : void 0) ?? getPixelSizeByCameraType(camera, width, height, options.referencePoint);
    if (void 0 !== pixelSize) return pixelSize * radius;
    fallbackWorldPointA.set(0, 0, 0.5).unproject(camera);
    fallbackWorldPointB.set(2 / width, 0, 0.5).unproject(camera);
    return fallbackWorldPointA.distanceTo(fallbackWorldPointB) * radius;
};
const getPixelSizeInWorld = (camera, viewSize, radius)=>{
    const w = viewSize.clientWidth;
    if (0 === w) return radius;
    const v1 = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 0.5).unproject(camera);
    const v2 = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(2 / w, 0, 0.5).unproject(camera);
    return v1.distanceTo(v2) * radius;
};
function updateGroupByPlane(group, plane) {
    const { origin, normal, up } = plane;
    const zAxis = normal.clone().normalize();
    const xAxis = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().crossVectors(up, zAxis).normalize();
    const yAxis = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().crossVectors(zAxis, xAxis).normalize();
    const matrix = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4();
    matrix.makeBasis(xAxis, yAxis, zAxis);
    matrix.setPosition(origin);
    group.quaternion.setFromRotationMatrix(matrix);
    group.position.copy(origin);
    group.updateMatrixWorld(true);
}
export { getPixelSizeInWorld, getPixelSizeInWorldByCamera, updateGroupByPlane };
