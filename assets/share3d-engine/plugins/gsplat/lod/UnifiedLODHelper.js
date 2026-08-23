import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__GSplatAssetLoader_js_f461e5ef__ from "./GSplatAssetLoader.js";
import * as __WEBPACK_EXTERNAL_MODULE__GSplatDirector_js_42eb2bd7__ from "./GSplatDirector.js";
import * as __WEBPACK_EXTERNAL_MODULE__GSplatOctree_js_e0a6f7f9__ from "./GSplatOctree.js";
import * as __WEBPACK_EXTERNAL_MODULE__GSplatParams_js_ac2e4c18__ from "./GSplatParams.js";
import * as __WEBPACK_EXTERNAL_MODULE__GSplatPlacement_js_f818991c__ from "./GSplatPlacement.js";
import * as __WEBPACK_EXTERNAL_MODULE__Layer_js_c06309ce__ from "./Layer.js";
import * as __WEBPACK_EXTERNAL_MODULE__LayerComposition_js_53723fa8__ from "./LayerComposition.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('gsplat:lod');
class UnifiedLODHelper {
    constructor(renderer, options){
        this.logicalFrameId = 0;
        this.placements = new Map();
        this.director = new __WEBPACK_EXTERNAL_MODULE__GSplatDirector_js_42eb2bd7__.GSplatDirector(renderer);
        this.composition = new __WEBPACK_EXTERNAL_MODULE__LayerComposition_js_53723fa8__.LayerComposition();
        this.defaultLayer = new __WEBPACK_EXTERNAL_MODULE__Layer_js_c06309ce__.Layer('default');
        this.composition.addLayer(this.defaultLayer);
        this.params = new __WEBPACK_EXTERNAL_MODULE__GSplatParams_js_ac2e4c18__.GSplatParams();
        if (options?.lodUnderfillLimit !== void 0) this.params.lodUnderfillLimit = options.lodUnderfillLimit;
        if (options?.cooldownTicks !== void 0) this.params.cooldownTicks = options.cooldownTicks;
        if (options?.lodUpdateDistance !== void 0) this.params.lodUpdateDistance = options.lodUpdateDistance;
        if (options?.lodUpdateAngle !== void 0) this.params.lodUpdateAngle = options.lodUpdateAngle;
        if (options?.sortMode === 'radial') this.params.radialSorting = true;
    }
    addSOGSLOD(baseUrl, node, lodMeta, renderer, options) {
        const octree = new __WEBPACK_EXTERNAL_MODULE__GSplatOctree_js_e0a6f7f9__.GSplatOctree(baseUrl, {
            lodLevels: lodMeta.lodLevels,
            filenames: lodMeta.filenames,
            tree: lodMeta.tree,
            environment: 'string' == typeof lodMeta.environment ? lodMeta.environment : void 0
        }, {
            debug: false,
            loadEnvironment: options?.loadEnvironment
        });
        const assetLoader = new __WEBPACK_EXTERNAL_MODULE__GSplatAssetLoader_js_f461e5ef__.GSplatAssetLoader(renderer, {
            maxConcurrentLoads: 4,
            maxRetries: 2,
            debug: false
        });
        octree.assetLoader = assetLoader;
        const placement = new __WEBPACK_EXTERNAL_MODULE__GSplatPlacement_js_f818991c__.GSplatPlacement(null, node, 0);
        placement.octree = octree;
        this.defaultLayer.addGSplatPlacement(placement);
        this.placements.set(node, placement);
        return {
            octree,
            placement,
            environmentUrl: octree.environmentUrl,
            environmentConfigured: null !== octree.environmentUrl
        };
    }
    addSplat(resource, node, lodIndex = 0) {
        const placement = new __WEBPACK_EXTERNAL_MODULE__GSplatPlacement_js_f818991c__.GSplatPlacement(resource, node, lodIndex);
        this.defaultLayer.addGSplatPlacement(placement);
        this.placements.set(node, placement);
    }
    removeSplat(node) {
        const placement = this.placements.get(node);
        if (placement) {
            this.defaultLayer.removeGSplatPlacement(placement);
            this.placements.delete(node);
        }
    }
    setVisible(node, visible) {
        const placement = this.placements.get(node);
        if (!placement) {
            log.warn('[UnifiedLODHelper] setVisible: 未找到指定节点的 Placement');
            return;
        }
        const manager = this.director.getManager(this.composition.cameras[0]?.camera, this.defaultLayer);
        if (manager) {
            const instance = manager.octreeInstances.get(placement);
            if (instance) instance.visible = visible;
        }
    }
    loadEnvironment(node) {
        const placement = this.placements.get(node);
        if (!placement || !placement.octree) {
            log.warn('[UnifiedLODHelper] loadEnvironment: 未找到指定节点的 Octree');
            return;
        }
        const octree = placement.octree;
        if (!octree.environmentUrl) {
            log.warn('[UnifiedLODHelper] loadEnvironment: 该 Octree 未配置 Environment');
            return;
        }
        octree.ensureEnvironmentResource();
    }
    unloadEnvironment(node) {
        const placement = this.placements.get(node);
        if (!placement || !placement.octree) {
            log.warn('[UnifiedLODHelper] unloadEnvironment: 未找到指定节点的 Octree');
            return;
        }
        const octree = placement.octree;
        octree.unloadEnvironmentResource();
    }
    update(camera) {
        const existingCamera = this.composition.cameras.find((c)=>c.camera === camera);
        if (!existingCamera) {
            const cameraComp = new __WEBPACK_EXTERNAL_MODULE__LayerComposition_js_53723fa8__.CameraComponent(camera, [
                this.defaultLayer.id
            ]);
            this.composition.addCamera(cameraComp);
        }
        this.director.update(this.composition, ++this.logicalFrameId, this);
    }
    getManager(camera) {
        return this.director.getManager(camera, this.defaultLayer);
    }
    getLoadingCount() {
        let count = 0;
        for (const cameraComp of this.composition.cameras){
            const manager = this.director.getManager(cameraComp.camera, this.defaultLayer);
            if (manager) count += manager.loadingCount;
        }
        return count;
    }
    isReady() {
        return 0 === this.getLoadingCount();
    }
    on(event, callback) {
        this.director.addEventListener(event, callback);
    }
    off(event, callback) {
        this.director.removeEventListener(event, callback);
    }
    destroy() {
        this.director.destroy();
        this.placements.clear();
    }
}
export { UnifiedLODHelper };
