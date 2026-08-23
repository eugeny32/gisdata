import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__GSplatGpuPicker_js_8f1550f8__ from "./GSplatGpuPicker.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('gsplat:spatial');
var GSplatPickManager_rslib_entry_InteractionType = /*#__PURE__*/ function(InteractionType) {
    InteractionType["CLICK"] = "click";
    InteractionType["MOVE"] = "move";
    InteractionType["AUTO"] = "auto";
    return InteractionType;
}({});
class GSplatPickManager {
    static #_ = this.gpuPickerCache = new WeakMap();
    static #_2 = this.gpuPickerStateVersionCache = new WeakMap();
    static pick(ray, camera, renderer, managers, options = {}) {
        const gpuAttempt = GSplatPickManager.pickWithGpu(ray, camera, renderer, managers, options);
        if (gpuAttempt.result) return gpuAttempt.result;
        if (options.gpuOnly) return null;
        return GSplatPickManager.pickWithCpuCenter(ray, camera, managers, options);
    }
    static pickWithGpu(ray, camera, renderer, managers, options = {}) {
        let unavailable = false;
        for (const manager of managers){
            if (manager.isScalarFilterActive && manager.scalarTextureVersion <= 0) {
                unavailable = true;
                continue;
            }
            const activeSplatInfos = GSplatPickManager.filterSplatInfosByLayerMask(manager.getActiveSplatInfos(), options.layerMask);
            if (0 !== activeSplatInfos.length) try {
                const gpuPicker = GSplatPickManager.getGpuPicker(renderer, options);
                const currentVersion = manager.pickStateVersion;
                const lastVersion = GSplatPickManager.gpuPickerStateVersionCache.get(manager) ?? -1;
                const needsOnDemandPrepare = currentVersion !== lastVersion || !gpuPicker.isPreparedFor(camera) || !gpuPicker.isReady();
                if (needsOnDemandPrepare) {
                    if (!GSplatPickManager.shouldPrepareGpuOnDemand(options)) {
                        GSplatPickManager.gpuPickerStateVersionCache.set(manager, currentVersion);
                        return {
                            result: null,
                            unavailable: true
                        };
                    }
                    gpuPicker.prepare(camera, manager, activeSplatInfos);
                    GSplatPickManager.gpuPickerStateVersionCache.set(manager, currentVersion);
                }
                const { screenX, screenY, screenWidth, screenHeight } = GSplatPickManager.resolveScreenCoords(ray, camera, renderer, options);
                const gpuResult = GSplatPickManager.pickBestGpuResult(gpuPicker, camera, screenX, screenY, screenWidth, screenHeight, options);
                if (!gpuResult) continue;
                const worldPos = gpuResult.worldPosition.clone();
                return {
                    result: {
                        location: worldPos,
                        distance: camera.position.distanceTo(worldPos),
                        splatIndex: gpuResult.splatIndex,
                        splatInfo: gpuResult.splatInfo,
                        depth: gpuResult.depth,
                        gpuPickResult: gpuResult
                    },
                    unavailable: false
                };
            } catch (error) {
                log.warn('[GSplatPickManager] GPU pick failed: ' + (error instanceof Error ? error.message : String(error)));
                unavailable = true;
            }
        }
        return {
            result: null,
            unavailable
        };
    }
    static pickWithCpuCenter(ray, camera, managers, options = {}) {
        const allSplatInfos = [];
        const managerBySplatInfo = new Map();
        for (const manager of managers)for (const splatInfo of GSplatPickManager.filterSplatInfosByLayerMask(manager.getActiveSplatInfos(), options.layerMask)){
            allSplatInfos.push(splatInfo);
            managerBySplatInfo.set(splatInfo, manager);
        }
        if (0 === allSplatInfos.length) return null;
        const requiresScalarPostFilter = managers.some((manager)=>manager.isScalarFilterActive);
        const candidateLimits = requiresScalarPostFilter ? [
            16,
            64,
            256
        ] : [
            1
        ];
        for (const candidateLimit of candidateLimits){
            const results = __WEBPACK_EXTERNAL_MODULE__GSplatGpuPicker_js_8f1550f8__.GSplatGpuPicker.pickWithCenters(ray, allSplatInfos, options.centerSphereRadius ?? 0.02, candidateLimit);
            for (const hit of results){
                const manager = managerBySplatInfo.get(hit.splatInfo);
                if (manager && !manager.passesScalarFilter(hit.splatInfo, hit.splatIndex)) continue;
                const worldPos = hit.worldPosition.clone();
                return {
                    location: worldPos,
                    distance: camera.position.distanceTo(worldPos),
                    splatIndex: hit.splatIndex,
                    splatInfo: hit.splatInfo,
                    depth: hit.depth
                };
            }
            if (results.length < candidateLimit) break;
        }
        return null;
    }
    static getGpuPicker(renderer, options = {}) {
        let picker = GSplatPickManager.gpuPickerCache.get(renderer);
        const { width, height } = GSplatPickManager.resolveScreenSize(renderer, options);
        const pickerWidth = Math.ceil(0.5 * width);
        const pickerHeight = Math.ceil(0.5 * height);
        if (picker) picker.resize(pickerWidth, pickerHeight);
        else {
            picker = new __WEBPACK_EXTERNAL_MODULE__GSplatGpuPicker_js_8f1550f8__.GSplatGpuPicker(renderer, {
                width: pickerWidth,
                height: pickerHeight,
                alphaClip: 0.3
            });
            GSplatPickManager.gpuPickerCache.set(renderer, picker);
        }
        return picker;
    }
    static filterSplatInfosByLayerMask(splatInfos, layerMask) {
        if (void 0 === layerMask) return splatInfos;
        return splatInfos.filter((splatInfo)=>GSplatPickManager.matchesLayerMask(splatInfo, layerMask));
    }
    static matchesLayerMask(splatInfo, layerMask) {
        const object = splatInfo.node;
        const objectLayerMask = object?.layers?.mask;
        if ('number' != typeof objectLayerMask) return true;
        return (objectLayerMask & layerMask) !== 0;
    }
    static resolveScreenCoords(ray, camera, renderer, options) {
        if (Number.isFinite(options.screenX) && Number.isFinite(options.screenY)) {
            const { width, height } = GSplatPickManager.resolveScreenSize(renderer, options);
            return {
                screenX: Math.max(0, Math.min(width - 1, options.screenX)),
                screenY: Math.max(0, Math.min(height - 1, options.screenY)),
                screenWidth: width,
                screenHeight: height
            };
        }
        return GSplatPickManager.rayToScreenCoords(ray, camera, renderer);
    }
    static resolveScreenSize(renderer, options) {
        if (Number.isFinite(options.screenWidth) && Number.isFinite(options.screenHeight) && options.screenWidth > 0 && options.screenHeight > 0) return {
            width: options.screenWidth,
            height: options.screenHeight
        };
        return renderer.getSize(new __WEBPACK_EXTERNAL_MODULE_three__.Vector2());
    }
    static shouldPrepareGpuOnDemand(options) {
        return 'click' === GSplatPickManager.normalizeInteractionType(options.interactionType) || true === options.prewarmGpu;
    }
    static pickBestGpuResult(gpuPicker, camera, screenX, screenY, screenWidth, screenHeight, options) {
        const windowSize = GSplatPickManager.resolveGpuPickWindowSize(options);
        if (windowSize <= 1) return gpuPicker.pick(screenX, screenY, screenWidth, screenHeight);
        const rect = GSplatPickManager.resolveGpuPickRect(screenX, screenY, screenWidth, screenHeight, windowSize);
        const candidates = gpuPicker.pickRect(rect.x, rect.y, rect.width, rect.height, screenWidth, screenHeight);
        return GSplatPickManager.selectClosestGpuResult(candidates, camera, screenX, screenY, screenWidth, screenHeight);
    }
    static resolveGpuPickWindowSize(options) {
        const interactionType = GSplatPickManager.normalizeInteractionType(options.interactionType);
        if (Number.isFinite(options.windowSize)) return Math.max(1, Math.floor(options.windowSize));
        if ('click' === interactionType) return 5;
        if ('move' === interactionType) return 3;
        return 1;
    }
    static normalizeInteractionType(interactionType) {
        if (null == interactionType) return;
        return String(interactionType);
    }
    static resolveGpuPickRect(screenX, screenY, screenWidth, screenHeight, windowSize) {
        const halfWindow = Math.floor(windowSize / 2);
        const x = Math.max(0, Math.floor(screenX - halfWindow));
        const y = Math.max(0, Math.floor(screenY - halfWindow));
        const maxX = Math.min(screenWidth, Math.ceil(screenX + halfWindow + 1));
        const maxY = Math.min(screenHeight, Math.ceil(screenY + halfWindow + 1));
        return {
            x,
            y,
            width: Math.max(1, maxX - x),
            height: Math.max(1, maxY - y)
        };
    }
    static selectClosestGpuResult(candidates, camera, screenX, screenY, screenWidth, screenHeight) {
        if (0 === candidates.length) return null;
        let bestResult = null;
        let bestScreenDistanceSq = Number.POSITIVE_INFINITY;
        let bestDepth = Number.POSITIVE_INFINITY;
        for (const candidate of candidates){
            const projected = candidate.worldPosition.clone().project(camera);
            if (!Number.isFinite(projected.x) || !Number.isFinite(projected.y) || !Number.isFinite(projected.z)) continue;
            const projectedScreenX = (projected.x + 1) / 2 * screenWidth;
            const projectedScreenY = (-projected.y + 1) / 2 * screenHeight;
            const dx = projectedScreenX - screenX;
            const dy = projectedScreenY - screenY;
            const screenDistanceSq = dx * dx + dy * dy;
            const depth = candidate.depth ?? camera.position.distanceToSquared(candidate.worldPosition);
            if (screenDistanceSq < bestScreenDistanceSq || screenDistanceSq === bestScreenDistanceSq && depth < bestDepth) {
                bestResult = candidate;
                bestScreenDistanceSq = screenDistanceSq;
                bestDepth = depth;
            }
        }
        return bestResult ?? candidates[0] ?? null;
    }
    static rayToScreenCoords(ray, camera, renderer) {
        const { width, height } = renderer.getSize(new __WEBPACK_EXTERNAL_MODULE_three__.Vector2());
        const point = ray.at(1, new __WEBPACK_EXTERNAL_MODULE_three__.Vector3());
        point.project(camera);
        let screenX = (point.x + 1) / 2 * width;
        let screenY = (-point.y + 1) / 2 * height;
        screenX = Math.max(0, Math.min(width - 1, screenX));
        screenY = Math.max(0, Math.min(height - 1, screenY));
        return {
            screenX,
            screenY,
            screenWidth: width,
            screenHeight: height
        };
    }
    static disposeGpuPicker(renderer) {
        const picker = GSplatPickManager.gpuPickerCache.get(renderer);
        if (picker) {
            picker.dispose();
            GSplatPickManager.gpuPickerCache.delete(renderer);
        }
    }
    static getGpuPickerDiagnostics(renderer) {
        const picker = GSplatPickManager.gpuPickerCache.get(renderer);
        if (!picker) return {
            exists: false,
            currentInfos: 0,
            pickMaterials: 0
        };
        return {
            exists: true,
            ...picker.getDiagnostics()
        };
    }
    static clearGpuPickerLodVersion(manager) {
        GSplatPickManager.gpuPickerStateVersionCache.delete(manager);
    }
    static clearAllGpuPickerLodVersions() {
        GSplatPickManager.gpuPickerStateVersionCache = new WeakMap();
    }
}
export { GSplatPickManager, GSplatPickManager_rslib_entry_InteractionType as InteractionType };
