import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
class EllipsoidRaycast {
    static #_ = this._matrix = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4();
    static #_2 = this._invMatrix = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4();
    static #_3 = this._rayOrigin = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
    static #_4 = this._rayDirection = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
    static #_5 = this._temp = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
    static intersect(ray, ellipsoid, threshold = 1.0) {
        const result = {
            intersects: false,
            distance: 1 / 0,
            point: new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(),
            normal: new __WEBPACK_EXTERNAL_MODULE_three__.Vector3()
        };
        const matrix = EllipsoidRaycast._matrix;
        const invMatrix = EllipsoidRaycast._invMatrix;
        const sx = 1.0 / (ellipsoid.radii.x * threshold);
        const sy = 1.0 / (ellipsoid.radii.y * threshold);
        const sz = 1.0 / (ellipsoid.radii.z * threshold);
        matrix.compose(ellipsoid.center, ellipsoid.rotation, new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1 / sx, 1 / sy, 1 / sz));
        invMatrix.copy(matrix).invert();
        const rayOrigin = EllipsoidRaycast._rayOrigin.copy(ray.origin).applyMatrix4(invMatrix);
        const rayDirection = EllipsoidRaycast._rayDirection.copy(ray.direction).transformDirection(invMatrix).normalize();
        const a = rayDirection.dot(rayDirection);
        const b = 2.0 * rayOrigin.dot(rayDirection);
        const c = rayOrigin.dot(rayOrigin) - 1.0;
        const discriminant = b * b - 4 * a * c;
        if (discriminant < 0) return result;
        const sqrtDisc = Math.sqrt(discriminant);
        const t1 = (-b - sqrtDisc) / (2 * a);
        const t2 = (-b + sqrtDisc) / (2 * a);
        let t = -1;
        if (t1 > 0 && t2 > 0) t = Math.min(t1, t2);
        else if (t1 > 0) t = t1;
        else if (t2 > 0) t = t2;
        if (t <= 0) return result;
        const localPoint = EllipsoidRaycast._temp.copy(rayDirection).multiplyScalar(t).add(rayOrigin);
        const worldPoint = localPoint.clone().applyMatrix4(matrix);
        const localNormal = localPoint.clone().normalize();
        const worldNormal = localNormal.transformDirection(matrix).normalize();
        const distance = worldPoint.distanceTo(ray.origin);
        result.intersects = true;
        result.distance = distance;
        result.point = worldPoint;
        result.normal = worldNormal;
        return result;
    }
    static intersectMultiple(ray, ellipsoids, threshold = 1.0, maxResults = 100) {
        const results = [];
        for(let i = 0; i < ellipsoids.length; i++){
            const result = EllipsoidRaycast.intersect(ray, ellipsoids[i], threshold);
            if (result.intersects) results.push({
                index: i,
                result
            });
            if (results.length >= 2 * maxResults) break;
        }
        results.sort((a, b)=>a.result.distance - b.result.distance);
        return results.slice(0, maxResults);
    }
    static roughIntersect(ray, center, maxRadius) {
        const distance = ray.distanceToPoint(center);
        return distance <= maxRadius;
    }
    static fromSplatData(center, scale0, scale1, scale2, rot0, rot1, rot2, rot3) {
        const radii = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(Math.exp(scale0), Math.exp(scale1), Math.exp(scale2));
        const rotation = new __WEBPACK_EXTERNAL_MODULE_three__.Quaternion(rot1, rot2, rot3, rot0).normalize();
        return {
            center: center.clone(),
            radii,
            rotation
        };
    }
    static getBoundingSphereRadius(ellipsoid) {
        return Math.max(ellipsoid.radii.x, ellipsoid.radii.y, ellipsoid.radii.z);
    }
}
export { EllipsoidRaycast };
