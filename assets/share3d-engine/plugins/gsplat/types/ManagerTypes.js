import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
function hasHighQualitySH(resource) {
    const res = resource;
    return 'shBands' in resource && 'number' == typeof res.shBands && res.shBands > 0 && 'sh_centroids' in resource && res.sh_centroids instanceof __WEBPACK_EXTERNAL_MODULE_three__.Texture;
}
function hasRefCounting(resource) {
    const res = resource;
    return 'incRefCount' in resource && 'function' == typeof res.incRefCount && 'decRefCount' in resource && 'function' == typeof res.decRefCount;
}
function hasGeometry(node) {
    return 'geometry' in node;
}
export { hasGeometry, hasHighQualitySH, hasRefCounting };
