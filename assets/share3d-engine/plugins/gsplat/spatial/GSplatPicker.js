import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__ from "../../../shared/constants/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__EllipsoidRaycast_js_f53fb8af__ from "./EllipsoidRaycast.js";
class GSplatPicker {
    static #_ = this._tempCenter = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
    static #_2 = this._tempScale = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
    static #_3 = this._tempRotation = new __WEBPACK_EXTERNAL_MODULE_three__.Quaternion();
    static #_4 = this._tempBox = new __WEBPACK_EXTERNAL_MODULE_three__.Box3();
    static #_5 = this._tempRaycaster = new __WEBPACK_EXTERNAL_MODULE_three__.Raycaster();
    static pickSplatInfo(ray, splatInfo, options) {
        const maxResults = options?.maxResults ?? __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.DEFAULT_MAX_PICK_RESULTS;
        const threshold = options?.threshold ?? __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.DEFAULT_PICK_THRESHOLD;
        const maxDistance = options?.maxDistance ?? 1 / 0;
        const useAABBCulling = options?.useAABBCulling ?? true;
        if (useAABBCulling) {
            const worldAabb = GSplatPicker._tempBox;
            if (!splatInfo.getWorldAabb(worldAabb)) return [];
            if (!ray.intersectsBox(worldAabb)) return [];
        }
        const resource = splatInfo.resource;
        const centers = resource.centers;
        if (centers && centers.length > 0) return GSplatPicker.pickWithCenters(ray, splatInfo, centers, threshold, maxResults, maxDistance);
        return GSplatPicker.pickWithEllipsoids(ray, splatInfo, threshold, maxResults, maxDistance);
    }
    static pickWithEllipsoids(ray, splatInfo, threshold, maxResults, maxDistance) {
        const results = [];
        const numSplats = splatInfo.numSplats;
        for(let i = 0; i < numSplats; i++)try {
            const center = splatInfo.getSplatWorldCenter(i, GSplatPicker._tempCenter);
            const scale = splatInfo.getSplatWorldScale(i, GSplatPicker._tempScale);
            const rotation = splatInfo.getSplatWorldRotation(i, GSplatPicker._tempRotation);
            const ellipsoid = {
                center: center.clone(),
                radii: scale.clone(),
                rotation: rotation.clone()
            };
            const intersection = __WEBPACK_EXTERNAL_MODULE__EllipsoidRaycast_js_f53fb8af__.EllipsoidRaycast.intersect(ray, ellipsoid, threshold);
            if (intersection.intersects && intersection.distance <= maxDistance) results.push({
                splatInfo,
                splatIndex: i,
                distance: intersection.distance,
                point: intersection.point,
                normal: intersection.normal
            });
            if (results.length >= 2 * maxResults) break;
        } catch (_error) {}
        results.sort((a, b)=>a.distance - b.distance);
        return results.slice(0, maxResults);
    }
    static pickWithCenters(ray, splatInfo, centers, threshold, maxResults, maxDistance) {
        const results = [];
        const numSplats = Math.min(splatInfo.numSplats, Math.floor(centers.length / 3));
        const worldMatrix = splatInfo.node.matrixWorld;
        const sphereRadius = 0.02 * threshold;
        const tempCenter = GSplatPicker._tempCenter;
        const tempSphere = new __WEBPACK_EXTERNAL_MODULE_three__.Sphere();
        const tempIntersect = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        for(let i = 0; i < numSplats; i++){
            tempCenter.set(centers[3 * i], centers[3 * i + 1], centers[3 * i + 2]);
            tempCenter.applyMatrix4(worldMatrix);
            tempSphere.set(tempCenter, sphereRadius);
            if (ray.intersectSphere(tempSphere, tempIntersect)) {
                const distance = ray.origin.distanceTo(tempIntersect);
                if (distance <= maxDistance) results.push({
                    splatInfo,
                    splatIndex: i,
                    distance,
                    point: tempIntersect.clone(),
                    normal: tempIntersect.clone().sub(tempCenter).normalize()
                });
                if (results.length >= 2 * maxResults) break;
            }
        }
        results.sort((a, b)=>a.distance - b.distance);
        return results.slice(0, maxResults);
    }
    static pickMultiple(ray, splatInfos, options) {
        const maxResults = options?.maxResults ?? __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.DEFAULT_MAX_PICK_RESULTS;
        const allResults = [];
        for (const splatInfo of splatInfos){
            const results = GSplatPicker.pickSplatInfo(ray, splatInfo, options);
            allResults.push(...results);
            if (allResults.length >= 2 * maxResults) break;
        }
        allResults.sort((a, b)=>a.distance - b.distance);
        return allResults.slice(0, maxResults);
    }
    static pickFromScreen(screenX, screenY, screenWidth, screenHeight, camera, splatInfos, options) {
        const ndcX = screenX / screenWidth * 2 - 1;
        const ndcY = 2 * -(screenY / screenHeight) + 1;
        return GSplatPicker.pickFromNDC(ndcX, ndcY, camera, splatInfos, options);
    }
    static pickFromNDC(ndcX, ndcY, camera, splatInfos, options) {
        const raycaster = GSplatPicker._tempRaycaster;
        raycaster.setFromCamera(new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(ndcX, ndcY), camera);
        return GSplatPicker.pickMultiple(raycaster.ray, splatInfos, options);
    }
}
export { GSplatPicker };
