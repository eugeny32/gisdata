import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
const GSPLAT_INSTANCE_SIZE = 128;
const GSPLAT_BATCH_INDEX_COUNT = 6 * GSPLAT_INSTANCE_SIZE;
const GSPLAT_BATCH_VERTEX_COUNT = 4 * GSPLAT_INSTANCE_SIZE;
function getGSplatBatchInstanceCount(visibleSplatCount) {
    const count = Math.max(0, Math.floor(visibleSplatCount));
    return 0 === count ? 0 : Math.ceil(count / GSPLAT_INSTANCE_SIZE);
}
function setBatchedSplatQuadGeometry(geometry) {
    const positions = new Float32Array(3 * GSPLAT_BATCH_VERTEX_COUNT);
    const uvs = new Float32Array(2 * GSPLAT_BATCH_VERTEX_COUNT);
    const indices = new Uint16Array(GSPLAT_BATCH_INDEX_COUNT);
    for(let i = 0; i < GSPLAT_INSTANCE_SIZE; i++){
        const vertexBase = 4 * i;
        const positionBase = 3 * vertexBase;
        const uvBase = 2 * vertexBase;
        const indexBase = 6 * i;
        positions.set([
            -1,
            -1,
            i,
            1,
            -1,
            i,
            1,
            1,
            i,
            -1,
            1,
            i
        ], positionBase);
        uvs.set([
            -1,
            -1,
            1,
            -1,
            1,
            1,
            -1,
            1
        ], uvBase);
        indices.set([
            vertexBase,
            vertexBase + 1,
            vertexBase + 2,
            vertexBase,
            vertexBase + 2,
            vertexBase + 3
        ], indexBase);
    }
    geometry.setAttribute('position', new __WEBPACK_EXTERNAL_MODULE_three__.BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new __WEBPACK_EXTERNAL_MODULE_three__.BufferAttribute(uvs, 2));
    geometry.setIndex(new __WEBPACK_EXTERNAL_MODULE_three__.BufferAttribute(indices, 1));
}
export { GSPLAT_BATCH_INDEX_COUNT, GSPLAT_BATCH_VERTEX_COUNT, GSPLAT_INSTANCE_SIZE, getGSplatBatchInstanceCount, setBatchedSplatQuadGeometry };
