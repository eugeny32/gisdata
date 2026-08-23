import * as __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_c632c149__ from "../../shared/types/assets.js";
import * as __WEBPACK_EXTERNAL_MODULE__SharedOcclusionDepthService_js_c704de6e__ from "./SharedOcclusionDepthService.js";
class SharedOcclusionDepthPlugin {
    onInit(context) {
        this.context = context;
        this.service = new __WEBPACK_EXTERNAL_MODULE__SharedOcclusionDepthService_js_c704de6e__.SharedOcclusionDepthServiceImpl((reason)=>{
            const serviceContext = context;
            if (!serviceContext.getService) return;
            if (serviceContext.hasService && !serviceContext.hasService('RenderInvalidationService')) return;
            const service = serviceContext.getService('RenderInvalidationService');
            service?.invalidate?.(reason);
        });
        context.registerService('SharedOcclusionDepthService', this.service);
    }
    onStart() {
        if (!this.context || !this.service) return;
        this.renderPipeline = this.context.getService('RenderPipeline');
        this.renderPipeline.addRenderContributor(this.renderContributor);
    }
    onDestroy() {
        this.renderPipeline?.removeRenderContributor(this.renderContributor);
        this.service?.dispose();
        this.renderPipeline = null;
        this.service = null;
        this.context = null;
    }
    render(frame, renderContext) {
        this.service?.render(frame, renderContext);
    }
    constructor(){
        this.name = 'shared-occlusion-depth';
        this.priority = 24;
        this.dependencies = [
            'RenderPipeline'
        ];
        this.provides = [
            'SharedOcclusionDepthService'
        ];
        this.context = null;
        this.renderPipeline = null;
        this.service = null;
        this.renderContributor = {
            kind: 'shared-occlusion-depth',
            phases: [
                __WEBPACK_EXTERNAL_MODULE__shared_types_assets_js_c632c149__.RenderPhase.OcclusionDepth
            ],
            renderPriority: 0,
            render: (frame, _phase, renderContext)=>{
                this.render(frame, renderContext);
            }
        };
    }
}
export { SharedOcclusionDepthPlugin };
