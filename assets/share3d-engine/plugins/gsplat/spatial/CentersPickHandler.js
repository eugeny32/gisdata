import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__ from "../../../shared/constants/index.js";
class CentersPickHandler {
    static #_ = this._tempVec4 = new __WEBPACK_EXTERNAL_MODULE_three__.Vector4();
    static #_2 = this._tempVec3 = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
    static #_3 = this._tempMatrix = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4();
    static #_4 = this._vpMatrix = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4();
    static pickAtScreen(screenX, screenY, screenWidth, screenHeight, camera, splatInfos, options) {
        const maxResults = options?.maxResults ?? __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.DEFAULT_MAX_PICK_RESULTS;
        const pointSize = options?.pointSize ?? __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.DEFAULT_CENTERS_PICK_POINT_SIZE;
        const closestOnly = options?.closestOnly ?? false;
        const vpMatrix = CentersPickHandler._vpMatrix;
        vpMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
        const halfPointSize = 0.5 * pointSize;
        if (closestOnly) {
            let best = null;
            for (const splatInfo of splatInfos){
                const resource = splatInfo.resource;
                const centers = resource.centers;
                if (!centers || 0 === centers.length) continue;
                const mvpMatrix = CentersPickHandler._tempMatrix;
                mvpMatrix.multiplyMatrices(vpMatrix, splatInfo.node.matrixWorld);
                const numSplats = splatInfo.activeSplats > 0 ? splatInfo.activeSplats : splatInfo.numSplats;
                const intervals = splatInfo.intervals;
                const scan = (start, end)=>{
                    for(let idx = start; idx < end; idx++){
                        const r = CentersPickHandler.testSplatAtScreen(idx, centers, mvpMatrix, screenX, screenY, screenWidth, screenHeight, halfPointSize, splatInfo);
                        if (r && (!best || r.depth < best.depth)) best = r;
                    }
                };
                if (intervals.length > 0) for(let i = 0; i < intervals.length; i += 2)scan(intervals[i], intervals[i + 1]);
                else scan(0, numSplats);
            }
            return best ? [
                best
            ] : [];
        }
        const results = [];
        for (const splatInfo of splatInfos){
            const resource = splatInfo.resource;
            const centers = resource.centers;
            if (!centers || 0 === centers.length) continue;
            const mvpMatrix = CentersPickHandler._tempMatrix;
            mvpMatrix.multiplyMatrices(vpMatrix, splatInfo.node.matrixWorld);
            const numSplats = splatInfo.activeSplats > 0 ? splatInfo.activeSplats : splatInfo.numSplats;
            const intervals = splatInfo.intervals;
            if (intervals.length > 0) for(let i = 0; i < intervals.length; i += 2)for(let splatIndex = intervals[i]; splatIndex < intervals[i + 1]; splatIndex++){
                const result = CentersPickHandler.testSplatAtScreen(splatIndex, centers, mvpMatrix, screenX, screenY, screenWidth, screenHeight, halfPointSize, splatInfo);
                if (result) results.push(result);
            }
            else for(let splatIndex = 0; splatIndex < numSplats; splatIndex++){
                const result = CentersPickHandler.testSplatAtScreen(splatIndex, centers, mvpMatrix, screenX, screenY, screenWidth, screenHeight, halfPointSize, splatInfo);
                if (result) results.push(result);
            }
        }
        results.sort((a, b)=>a.depth - b.depth);
        return results.slice(0, maxResults);
    }
    static testSplatAtScreen(splatIndex, centers, mvpMatrix, screenX, screenY, screenWidth, screenHeight, halfPointSize, splatInfo) {
        const baseIndex = 3 * splatIndex;
        if (baseIndex + 2 >= centers.length) return null;
        const localX = centers[baseIndex];
        const localY = centers[baseIndex + 1];
        const localZ = centers[baseIndex + 2];
        const clipPos = CentersPickHandler._tempVec4;
        clipPos.set(localX, localY, localZ, 1.0);
        clipPos.applyMatrix4(mvpMatrix);
        const w = clipPos.w;
        if (w <= 0) return null;
        const ndcX = clipPos.x / w;
        const ndcY = clipPos.y / w;
        const ndcZ = clipPos.z / w;
        if (ndcX < -1 || ndcX > 1 || ndcY < -1 || ndcY > 1 || ndcZ < -1 || ndcZ > 1) return null;
        const projectedX = (0.5 * ndcX + 0.5) * screenWidth;
        const projectedY = (0.5 * -ndcY + 0.5) * screenHeight;
        const dx = projectedX - screenX;
        const dy = projectedY - screenY;
        const screenDistance = Math.sqrt(dx * dx + dy * dy);
        if (screenDistance > halfPointSize) return null;
        const worldPos = CentersPickHandler._tempVec3.set(localX, localY, localZ);
        worldPos.applyMatrix4(splatInfo.node.matrixWorld);
        return {
            splatInfo,
            splatIndex,
            screenDistance,
            worldPosition: worldPos.clone(),
            depth: ndcZ
        };
    }
    static pickInRect(startX, startY, endX, endY, screenWidth, screenHeight, camera, splatInfos, maxResults = __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.DEFAULT_RECT_PICK_MAX_RESULTS) {
        const minX = Math.min(startX, endX);
        const maxX = Math.max(startX, endX);
        const minY = Math.min(startY, endY);
        const maxY = Math.max(startY, endY);
        const vpMatrix = CentersPickHandler._vpMatrix;
        vpMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
        const results = [];
        for (const splatInfo of splatInfos){
            const resource = splatInfo.resource;
            const centers = resource.centers;
            if (!centers || 0 === centers.length) continue;
            const mvpMatrix = CentersPickHandler._tempMatrix;
            mvpMatrix.multiplyMatrices(vpMatrix, splatInfo.node.matrixWorld);
            const numSplats = splatInfo.activeSplats > 0 ? splatInfo.activeSplats : splatInfo.numSplats;
            const intervals = splatInfo.intervals;
            const processIndex = (splatIndex)=>{
                const baseIndex = 3 * splatIndex;
                if (baseIndex + 2 >= centers.length) return;
                const localX = centers[baseIndex];
                const localY = centers[baseIndex + 1];
                const localZ = centers[baseIndex + 2];
                const clipPos = CentersPickHandler._tempVec4;
                clipPos.set(localX, localY, localZ, 1.0);
                clipPos.applyMatrix4(mvpMatrix);
                const w = clipPos.w;
                if (w <= 0) return;
                const ndcX = clipPos.x / w;
                const ndcY = clipPos.y / w;
                const ndcZ = clipPos.z / w;
                if (ndcX < -1 || ndcX > 1 || ndcY < -1 || ndcY > 1 || ndcZ < -1 || ndcZ > 1) return;
                const projectedX = (0.5 * ndcX + 0.5) * screenWidth;
                const projectedY = (0.5 * -ndcY + 0.5) * screenHeight;
                if (projectedX >= minX && projectedX <= maxX && projectedY >= minY && projectedY <= maxY) {
                    const worldPos = CentersPickHandler._tempVec3.set(localX, localY, localZ);
                    worldPos.applyMatrix4(splatInfo.node.matrixWorld);
                    results.push({
                        splatInfo,
                        splatIndex,
                        screenDistance: 0,
                        worldPosition: worldPos.clone(),
                        depth: ndcZ
                    });
                }
            };
            if (intervals.length > 0) for(let i = 0; i < intervals.length; i += 2){
                for(let splatIndex = intervals[i]; splatIndex < intervals[i + 1]; splatIndex++){
                    if (results.length >= maxResults) break;
                    processIndex(splatIndex);
                }
                if (results.length >= maxResults) break;
            }
            else for(let splatIndex = 0; splatIndex < numSplats; splatIndex++){
                if (results.length >= maxResults) break;
                processIndex(splatIndex);
            }
            if (results.length >= maxResults) break;
        }
        return results;
    }
}
export { CentersPickHandler };
