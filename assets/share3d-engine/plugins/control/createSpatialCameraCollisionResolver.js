import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
const DEFAULT_GROUND_MARGIN = 0.05;
const DEFAULT_MAX_PROJECTION_DISTANCE = 1.5;
function createSpatialCameraCollisionResolver(options) {
    const policy = options.policy ?? 'hard';
    const groundMargin = options.groundMargin ?? DEFAULT_GROUND_MARGIN;
    const maxProjectionDistance = options.maxProjectionDistance ?? DEFAULT_MAX_PROJECTION_DISTANCE;
    return ({ position, translation })=>{
        const groundZ = resolveGroundZ(options);
        const nextPosition = position.clone().add(translation);
        if (Number.isFinite(groundZ)) nextPosition.z = Math.max(nextPosition.z, groundZ + groundMargin);
        const projected = options.spatial.projectNavigationPoint({
            worldId: options.worldId,
            point: nextPosition.clone(),
            maxDistance: maxProjectionDistance
        });
        if (!projected || !projected.walkable) return {
            translation: 'soft' === policy ? nextPosition.sub(position) : new __WEBPACK_EXTERNAL_MODULE_three__.Vector3()
        };
        return {
            translation: nextPosition.sub(position)
        };
    };
}
function resolveGroundZ(options) {
    if ('number' == typeof options.groundZ && Number.isFinite(options.groundZ)) return options.groundZ;
    try {
        const bounds = options.spatial.getWorld(options.worldId)?.getRepresentation('surface').bounds;
        if (bounds && !bounds.isEmpty()) return bounds.min.z;
    } catch  {}
    return -1 / 0;
}
export { createSpatialCameraCollisionResolver };
