import * as __WEBPACK_EXTERNAL_MODULE__shared_idGenerator_js_530c4c39__ from "../shared/idGenerator.js";
const generateVolumeId = (0, __WEBPACK_EXTERNAL_MODULE__shared_idGenerator_js_530c4c39__.createIdGenerator)('volume');
function computeVolume(dimensions) {
    return Math.abs(dimensions.x * dimensions.y * dimensions.z);
}
function buildVolumeResult(matrix, dimensions) {
    return {
        id: generateVolumeId(),
        matrix: matrix.clone(),
        dimensions: dimensions.clone(),
        computedVolume: computeVolume(dimensions)
    };
}
export { buildVolumeResult, computeVolume, generateVolumeId };
