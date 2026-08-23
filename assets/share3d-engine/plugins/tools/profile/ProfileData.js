import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_idGenerator_js_530c4c39__ from "../shared/idGenerator.js";
const DEG2RAD = Math.PI / 180;
const generateProfileId = (0, __WEBPACK_EXTERNAL_MODULE__shared_idGenerator_js_530c4c39__.createIdGenerator)('profile');
function computeSegmentLengths(points) {
    const segments = [];
    for(let i = 1; i < points.length; i++)segments.push(points[i - 1].position.distanceTo(points[i].position));
    return segments;
}
function computeTotalLength(segments) {
    let total = 0;
    for(let i = 0; i < segments.length; i++)total += segments[i];
    return total;
}
function computeDefaultWidth(points, camera, _viewportWidth, viewportHeight) {
    if (0 === points.length) return 1;
    const distance = camera.position.distanceTo(points[0].position);
    if (0 === distance) return 1;
    if (camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.PerspectiveCamera) {
        const fov = camera.fov;
        const projectedRadius = viewportHeight / (2 * distance * Math.tan(fov / 2 * DEG2RAD));
        if (0 === projectedRadius) return 1;
        return 10 / projectedRadius;
    }
    return 1;
}
function buildProfileResult(points, width) {
    const segmentLengths = computeSegmentLengths(points);
    const length = computeTotalLength(segmentLengths);
    return {
        id: generateProfileId(),
        points: [
            ...points
        ],
        width,
        length,
        segmentLengths
    };
}
export { buildProfileResult, computeDefaultWidth, computeSegmentLengths, computeTotalLength, generateProfileId };
