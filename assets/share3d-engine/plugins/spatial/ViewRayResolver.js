import * as __WEBPACK_EXTERNAL_MODULE__shared_utils_index_js_83ff7f8f__ from "../../shared/utils/index.js";
class ViewRayResolver {
    constructor(getViewport, getViewRegistry){
        this.getViewport = getViewport;
        this.getViewRegistry = getViewRegistry;
    }
    resolve(query) {
        const containerViewport = cloneRect(this.getViewport());
        const screenInContainer = this.normalizeScreen(query.screen, query, containerViewport);
        const context = this.resolveContext(screenInContainer, query.camera, query, containerViewport);
        if (context.viewport.width <= 0 || context.viewport.height <= 0) return null;
        context.camera.updateMatrixWorld(true);
        const ndc = (0, __WEBPACK_EXTERNAL_MODULE__shared_utils_index_js_83ff7f8f__.screenToNDC)(screenInContainer, context.viewport);
        return {
            camera: context.camera,
            ray: (0, __WEBPACK_EXTERNAL_MODULE__shared_utils_index_js_83ff7f8f__.ndcToRay)(ndc, context.camera),
            screen: screenInContainer,
            viewport: cloneRect(context.viewport),
            viewId: context.viewId,
            viewRect: context.viewRect ? cloneRect(context.viewRect) : void 0,
            layerMask: context.layerMask
        };
    }
    resolveContext(screen, fallbackCamera, options, containerViewport) {
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
        const viewRect = resolvedView ? cloneRect(resolvedView.rect) : explicitViewRect ? cloneRect(explicitViewRect) : void 0;
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
            return this.isQueryableView(requestedView) ? requestedView : null;
        }
        const hitView = registry.resolveViewAtScreen(screen);
        if (this.isQueryableView(hitView)) return hitView;
        const activeView = registry.getActive();
        return this.isQueryableView(activeView) ? activeView : null;
    }
    resolveCamera(registry, viewId, fallbackCamera) {
        if (!registry || !viewId) return fallbackCamera;
        const managedCamera = registry.getExtension(viewId, 'viewportCamera');
        return managedCamera?.getActiveCamera() ?? fallbackCamera;
    }
    isQueryableView(view) {
        return !!view && view.visible && view.rect.width > 0 && view.rect.height > 0;
    }
    normalizeScreen(screen, options, containerViewport) {
        if (options.viewId || options.viewRect || options.viewport) return screen.clone();
        return (0, __WEBPACK_EXTERNAL_MODULE__shared_utils_index_js_83ff7f8f__.toViewportLocalPoint)(screen, containerViewport);
    }
}
function cloneRect(rect) {
    return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height
    };
}
export { ViewRayResolver };
