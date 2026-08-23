import * as __WEBPACK_EXTERNAL_MODULE__ViewRegistry_js_2c21f63e__ from "./ViewRegistry.js";
class ViewPlugin {
    onInit(context) {
        this.context = context;
        this.registry = new __WEBPACK_EXTERNAL_MODULE__ViewRegistry_js_2c21f63e__.ViewRegistryImpl(context.events);
        context.registerService('ViewRegistry', this.registry);
    }
    onStart() {
        if (!this.context || !this.registry) throw new Error('ViewPlugin 尚未初始化');
        this.context.events.on('view.created', this.handleViewCreated);
        this.context.events.on('view.removed', this.handleViewRemoved);
        this.context.events.on('view.updated', this.handleViewUpdated);
        this.context.events.on('viewport.resized', this.handleViewportResized);
        if (this.registry.get(this.registry.primaryViewId)) {
            const primary = this.registry.get(this.registry.primaryViewId);
            this.primaryViewTracksViewport = primary ? this.isFullViewportRect(primary.rect) : true;
        } else {
            const { width, height } = this.context.getSize();
            this.registry.create({
                id: this.registry.primaryViewId,
                rect: {
                    x: 0,
                    y: 0,
                    width,
                    height
                },
                visible: true,
                zIndex: 0,
                layerMask: 1,
                userData: {},
                removable: false
            });
            this.primaryViewTracksViewport = true;
        }
        for (const view of this.registry.list())this.ensureHelperRoots(view.id);
    }
    onDestroy() {
        if (this.disposed) return;
        this.disposed = true;
        this.context?.events.off('view.created', this.handleViewCreated);
        this.context?.events.off('view.removed', this.handleViewRemoved);
        this.context?.events.off('view.updated', this.handleViewUpdated);
        this.context?.events.off('viewport.resized', this.handleViewportResized);
        this.registry?.dispose();
        this.registry = null;
        this.context = null;
    }
    ensureHelperRoots(viewId) {
        if (!this.context || !this.registry) return;
        const helperRoots = this.context.sceneGraph.createViewHelperRoots(viewId);
        this.registry.setExtension(viewId, 'toolsRoot', helperRoots.toolsRoot);
        this.registry.setExtension(viewId, 'overlayRoot', helperRoots.overlayRoot);
        this.registry.setExtension(viewId, 'debugRoot', helperRoots.debugRoot);
    }
    syncPrimaryViewRect(width, height) {
        if (!this.registry || !this.primaryViewTracksViewport) return;
        const primary = this.registry.get(this.registry.primaryViewId);
        if (!primary || rectEquals(primary.rect, {
            x: 0,
            y: 0,
            width,
            height
        })) return;
        this.syncingPrimaryViewRect = true;
        try {
            this.registry.setRect(this.registry.primaryViewId, {
                x: 0,
                y: 0,
                width,
                height
            });
        } finally{
            this.syncingPrimaryViewRect = false;
        }
    }
    isFullViewportRect(rect) {
        if (!this.context) return false;
        const { width, height } = this.context.getSize();
        return rectEquals(rect, {
            x: 0,
            y: 0,
            width,
            height
        });
    }
    constructor(){
        this.name = 'view';
        this.priority = 8;
        this.provides = [
            'ViewRegistry'
        ];
        this.context = null;
        this.registry = null;
        this.disposed = false;
        this.primaryViewTracksViewport = true;
        this.syncingPrimaryViewRect = false;
        this.handleViewCreated = (event)=>{
            this.ensureHelperRoots(event.viewId);
        };
        this.handleViewRemoved = (event)=>{
            this.context?.sceneGraph.removeViewHelperRoots(event.viewId);
        };
        this.handleViewUpdated = (event)=>{
            if (!this.registry || event.viewId !== this.registry.primaryViewId) return;
            if (this.syncingPrimaryViewRect || rectEquals(event.snapshot.rect, event.previous.rect)) return;
            this.primaryViewTracksViewport = this.isFullViewportRect(event.snapshot.rect);
        };
        this.handleViewportResized = (event)=>{
            this.syncPrimaryViewRect(event.width, event.height);
        };
    }
}
function rectEquals(left, right) {
    return left.x === right.x && left.y === right.y && left.width === right.width && left.height === right.height;
}
export { ViewPlugin };
