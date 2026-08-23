import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
class RaycastHelper {
    static #_ = this._tempVector2 = new __WEBPACK_EXTERNAL_MODULE_three__.Vector2();
    static #_2 = this._tempRaycaster = new __WEBPACK_EXTERNAL_MODULE_three__.Raycaster();
    static screenToNDC(screenX, screenY, screenWidth, screenHeight, target) {
        const result = target || new __WEBPACK_EXTERNAL_MODULE_three__.Vector2();
        result.x = screenX / screenWidth * 2 - 1;
        result.y = 2 * -(screenY / screenHeight) + 1;
        return result;
    }
    static ndcToRay(ndcX, ndcY, camera, target) {
        const raycaster = RaycastHelper._tempRaycaster;
        const ndc = RaycastHelper._tempVector2.set(ndcX, ndcY);
        raycaster.setFromCamera(ndc, camera);
        if (!target) return raycaster.ray.clone();
        target.origin.copy(raycaster.ray.origin);
        target.direction.copy(raycaster.ray.direction);
        return target;
    }
    static screenToRay(screenX, screenY, screenWidth, screenHeight, camera, target) {
        const ndc = RaycastHelper.screenToNDC(screenX, screenY, screenWidth, screenHeight, RaycastHelper._tempVector2);
        return RaycastHelper.ndcToRay(ndc.x, ndc.y, camera, target);
    }
    static filterResults(results, options) {
        const { minDistance = -1 / 0, maxDistance = 1 / 0, filter } = options;
        return results.filter((result)=>{
            if (result.distance < minDistance || result.distance > maxDistance) return false;
            if (filter && !filter(result)) return false;
            return true;
        });
    }
    static getNearest(results) {
        if (0 === results.length) return null;
        let nearest = results[0];
        for(let i = 1; i < results.length; i++)if (results[i].distance < nearest.distance) nearest = results[i];
        return nearest;
    }
    static groupBySplatInfo(results) {
        const grouped = new Map();
        for (const result of results){
            const existing = grouped.get(result.splatInfo);
            if (existing) existing.push(result);
            else grouped.set(result.splatInfo, [
                result
            ]);
        }
        return grouped;
    }
    static createRayHelper(ray, length = 100, color = 0xff0000) {
        const points = [];
        points.push(ray.origin.clone());
        points.push(ray.at(length, new __WEBPACK_EXTERNAL_MODULE_three__.Vector3()));
        const geometry = new __WEBPACK_EXTERNAL_MODULE_three__.BufferGeometry().setFromPoints(points);
        const material = new __WEBPACK_EXTERNAL_MODULE_three__.LineBasicMaterial({
            color
        });
        const line = new __WEBPACK_EXTERNAL_MODULE_three__.Line(geometry, material);
        line.name = 'RayHelper';
        return line;
    }
    static createHitPointHelper(point, normal, size = 0.1, color = 0x00ff00) {
        const geometry = new __WEBPACK_EXTERNAL_MODULE_three__.SphereGeometry(size, 16, 16);
        const material = new __WEBPACK_EXTERNAL_MODULE_three__.MeshBasicMaterial({
            color
        });
        const sphere = new __WEBPACK_EXTERNAL_MODULE_three__.Mesh(geometry, material);
        sphere.position.copy(point);
        sphere.name = 'HitPoint';
        if (!normal) return sphere;
        const group = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
        group.name = 'HitPointHelper';
        group.add(sphere);
        const normalLength = 5 * size;
        const normalColor = 0x0000ff;
        const arrow = new __WEBPACK_EXTERNAL_MODULE_three__.ArrowHelper(normal.clone().normalize(), point, normalLength, normalColor, 0.2 * normalLength, 0.1 * normalLength);
        arrow.name = 'HitNormal';
        group.add(arrow);
        return group;
    }
    static createDebugVisualization(results, options) {
        const { showHitPoints = true, showNormals = true, hitPointColor = 0x00ff00, normalColor = 0x0000ff, normalLength = 5 } = options || {};
        const group = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
        group.name = 'PickResultDebugVisualization';
        for(let i = 0; i < results.length; i++){
            const result = results[i];
            if (showHitPoints) {
                const size = 0.1;
                const geometry = new __WEBPACK_EXTERNAL_MODULE_three__.SphereGeometry(size, 16, 16);
                const material = new __WEBPACK_EXTERNAL_MODULE_three__.MeshBasicMaterial({
                    color: hitPointColor
                });
                const sphere = new __WEBPACK_EXTERNAL_MODULE_three__.Mesh(geometry, material);
                sphere.position.copy(result.point);
                sphere.name = `HitPoint_${i}`;
                group.add(sphere);
                if (showNormals && result.normal) {
                    const normalLen = size * normalLength;
                    const arrow = new __WEBPACK_EXTERNAL_MODULE_three__.ArrowHelper(result.normal.clone().normalize(), result.point, normalLen, normalColor, 0.2 * normalLen, 0.1 * normalLen);
                    arrow.name = `HitNormal_${i}`;
                    group.add(arrow);
                }
            }
        }
        return group;
    }
}
export { RaycastHelper };
