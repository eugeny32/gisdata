import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_utils_index_js_83ff7f8f__ from "../../shared/utils/index.js";
class PickingServiceImpl {
    constructor(getViewport, getViewRegistry){
        this.providers = new Set();
        this.getViewport = getViewport;
        this.getViewRegistry = getViewRegistry ?? null;
    }
    addProvider(provider) {
        this.providers.add(provider);
    }
    removeProvider(provider) {
        this.providers.delete(provider);
    }
    pick(query) {
        return this.withQueryLayerMask(query.camera, query.layerMask, ()=>{
            const results = [];
            for (const provider of Array.from(this.providers)){
                if (!matchKinds(provider, query.kinds)) continue;
                const result = provider.pick(query);
                if (result) results.push(result);
            }
            results.sort((a, b)=>a.distance - b.distance);
            return results;
        });
    }
    pickRect(query) {
        return this.withQueryLayerMask(query.camera, query.layerMask, ()=>{
            const results = [];
            for (const provider of Array.from(this.providers)){
                if (!matchKinds(provider, query.kinds)) continue;
                if (!provider.pickRect) continue;
                const partial = provider.pickRect(query);
                for (const r of partial)results.push(r);
            }
            results.sort((a, b)=>a.distance - b.distance);
            return results;
        });
    }
    pickInView(viewId, screen, options = {}) {
        const registry = this.getViewRegistry?.() ?? null;
        const view = registry?.get(viewId);
        if (!this.isPickableView(view)) return [];
        const screenInContainer = new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(view.rect.x + screen.x, view.rect.y + screen.y);
        const camera = this.resolveCamera(registry, viewId, options.camera ?? new __WEBPACK_EXTERNAL_MODULE_three__.PerspectiveCamera());
        return this.pickAtScreen(screenInContainer, camera, {
            ...options,
            viewId
        });
    }
    pickAtScreen(screen, camera, options = {}) {
        const containerViewport = this.cloneRect(this.getViewport());
        const screenInContainer = this.normalizeScreen(screen, options, containerViewport);
        const context = this.resolvePickContext(screenInContainer, camera, options, containerViewport);
        if (context.viewport.width <= 0 || context.viewport.height <= 0) return [];
        context.camera.updateMatrixWorld(true);
        const ndc = (0, __WEBPACK_EXTERNAL_MODULE__shared_utils_index_js_83ff7f8f__.screenToNDC)(screenInContainer, context.viewport);
        const ray = (0, __WEBPACK_EXTERNAL_MODULE__shared_utils_index_js_83ff7f8f__.ndcToRay)(ndc, context.camera);
        const query = {
            ...options,
            screen: screenInContainer,
            viewport: this.cloneRect(context.viewport),
            viewId: context.viewId,
            viewRect: context.viewRect ? this.cloneRect(context.viewRect) : void 0,
            layerMask: context.layerMask,
            ndc,
            ray,
            camera: context.camera
        };
        return this.pick(query);
    }
    dispose() {
        this.providers.clear();
    }
    resolvePickContext(screen, fallbackCamera, options, containerViewport) {
        const registry = this.getViewRegistry?.() ?? null;
        const resolvedView = this.resolveViewSnapshot(registry, screen, options.viewId);
        if (options.viewId && registry && !resolvedView) return {
            camera: fallbackCamera,
            viewport: {
                x: 0,
                y: 0,
                width: 0,
                height: 0
            },
            viewId: options.viewId
        };
        const explicitViewRect = options.viewRect ?? options.viewport;
        const viewRect = resolvedView ? this.cloneRect(resolvedView.rect) : explicitViewRect ? this.cloneRect(explicitViewRect) : void 0;
        return {
            camera: this.resolveCamera(registry, resolvedView?.id, fallbackCamera),
            viewport: viewRect ?? {
                x: 0,
                y: 0,
                width: containerViewport.width,
                height: containerViewport.height
            },
            viewId: resolvedView?.id ?? options.viewId,
            viewRect,
            layerMask: resolvedView?.layerMask ?? options.layerMask
        };
    }
    resolveViewSnapshot(registry, screen, requestedViewId) {
        if (!registry) return null;
        if (requestedViewId) {
            const requestedView = registry.get(requestedViewId);
            return this.isPickableView(requestedView) ? requestedView : null;
        }
        const hitView = registry.resolveViewAtScreen(screen);
        if (this.isPickableView(hitView)) return hitView;
        const activeView = registry.getActive();
        return this.isPickableView(activeView) ? activeView : null;
    }
    resolveCamera(registry, viewId, fallbackCamera) {
        if (!registry || !viewId) return fallbackCamera;
        const managedCamera = registry.getExtension(viewId, 'viewportCamera');
        return managedCamera?.getActiveCamera() ?? fallbackCamera;
    }
    withQueryLayerMask(camera, layerMask, action) {
        if (void 0 === layerMask) return action();
        const previousMask = camera.layers.mask;
        camera.layers.mask = layerMask;
        try {
            return action();
        } finally{
            camera.layers.mask = previousMask;
        }
    }
    isPickableView(view) {
        return !!view && view.visible && view.rect.width > 0 && view.rect.height > 0;
    }
    cloneRect(rect) {
        return {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
        };
    }
    normalizeScreen(screen, options, containerViewport) {
        if (options.viewId || options.viewRect || options.viewport) return screen.clone();
        return (0, __WEBPACK_EXTERNAL_MODULE__shared_utils_index_js_83ff7f8f__.toViewportLocalPoint)(screen, containerViewport);
    }
}
function matchKinds(provider, kinds) {
    if (!kinds || 0 === kinds.length) return true;
    return kinds.includes(provider.kind);
}
export { PickingServiceImpl };
