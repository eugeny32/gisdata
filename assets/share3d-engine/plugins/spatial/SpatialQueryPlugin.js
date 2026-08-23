import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_c632c149__ from "../../shared/types/assets.js";
import * as __WEBPACK_EXTERNAL_MODULE__SpatialQueryService_js_c1e983fd__ from "./SpatialQueryService.js";
class SpatialQueryPlugin {
    constructor(options){
        this.name = 'spatial-query';
        this.kind = 'spatial-query';
        this.priority = 26;
        this.dependencies = [
            'ViewRegistry',
            'RenderPipeline'
        ];
        this.provides = [
            'SpatialQueryService'
        ];
        this.phases = [
            __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_c632c149__.RenderPhase.Overlay3D
        ];
        this.renderPriority = 0;
        this.context = null;
        this.viewRegistry = null;
        this.pointCloudService = null;
        this.gaussianSplatService = null;
        this.cadService = null;
        this.service = null;
        this.renderPipeline = null;
        this.debugScene = new __WEBPACK_EXTERNAL_MODULE_three__.Scene();
        this.debugRoot = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
        this.disposed = false;
        this.withCredentials = options?.withCredentials ?? false;
        this.debugRoot.name = 'spatialQueryDebugRoot';
        this.debugScene.add(this.debugRoot);
    }
    onInit(context) {
        this.context = context;
        this.disposed = false;
        this.service = new __WEBPACK_EXTERNAL_MODULE__SpatialQueryService_js_c1e983fd__.SpatialQueryServiceImpl({
            events: context.events,
            loadingManager: context.loadingManager,
            getViewport: ()=>{
                const rect = context.container.getBoundingClientRect();
                return {
                    x: rect.left,
                    y: rect.top,
                    width: rect.width,
                    height: rect.height
                };
            },
            getViewRegistry: ()=>this.viewRegistry,
            getDebugRoot: ()=>this.debugRoot,
            resolveOwnerHandle: (kind, id)=>this.resolveOwnerHandle(kind, id),
            getSharedOcclusionDepthService: ()=>context.hasService('SharedOcclusionDepthService') ? context.getService('SharedOcclusionDepthService') : null,
            onSharedOcclusionDepthChanged: (reason)=>{
                if (!context.hasService('RenderInvalidationService')) return;
                context.getService('RenderInvalidationService').invalidate(reason);
            },
            withCredentials: this.withCredentials
        });
        context.registerService('SpatialQueryService', this.service);
    }
    onStart() {
        if (!this.context) return;
        this.renderPipeline = this.context.getService('RenderPipeline');
        this.renderPipeline.addRenderContributor(this);
        this.viewRegistry = this.context.getService('ViewRegistry');
        this.pointCloudService = this.context.hasService('PointCloudService') ? this.context.getService('PointCloudService') : null;
        this.gaussianSplatService = this.context.hasService('GaussianSplatService') ? this.context.getService('GaussianSplatService') : null;
        this.cadService = this.context.hasService('CadService') ? this.context.getService('CadService') : null;
    }
    onUpdateFrame(_frame) {
        this.service?.update();
    }
    render(frame, _phase, ctx) {
        if (!this.service || 0 === this.debugRoot.children.length) return;
        const hasVisibleDebugObject = this.debugRoot.children.some((child)=>child.visible);
        if (!hasVisibleDebugObject) return;
        const { renderer } = ctx;
        renderer.setRenderTarget(ctx.outputTarget);
        renderer.setViewport(ctx.viewport.x, ctx.viewport.y, ctx.viewport.width, ctx.viewport.height);
        renderer.setScissor(ctx.viewport.x, ctx.viewport.y, ctx.viewport.width, ctx.viewport.height);
        renderer.setScissorTest(true);
        renderer.render(this.debugScene, frame.camera);
    }
    onDestroy() {
        if (this.disposed) return;
        this.disposed = true;
        this.renderPipeline?.removeRenderContributor(this);
        this.service?.dispose();
        this.service = null;
        this.renderPipeline = null;
        this.pointCloudService = null;
        this.gaussianSplatService = null;
        this.cadService = null;
        this.viewRegistry = null;
        this.debugRoot.clear();
        this.context = null;
    }
    resolveOwnerHandle(kind, id) {
        switch(kind){
            case 'pointCloud':
                return this.pointCloudService?.getAsset(id);
            case 'gaussian-splat':
                return this.gaussianSplatService?.getAsset(id);
            case 'cad':
                return this.cadService?.getAsset(id);
            default:
                return;
        }
    }
}
export { SpatialQueryPlugin };
