import * as __WEBPACK_EXTERNAL_MODULE__RenderPipeline_js_fa6741d7__ from "./RenderPipeline.js";
class RenderPlugin {
    onInit(context) {
        const renderInvalidation = 'function' == typeof context.hasService && context.hasService('RenderInvalidationService') ? context.getService('RenderInvalidationService') : null;
        this.pipeline = new __WEBPACK_EXTERNAL_MODULE__RenderPipeline_js_fa6741d7__.RenderPipeline(context.events, renderInvalidation);
        context.registerService('RenderPipeline', this.pipeline);
    }
    onStart() {}
    onRenderView(frame) {
        this.pipeline?.execute(frame);
    }
    onDestroy() {
        this.pipeline?.dispose();
    }
    constructor(){
        this.name = 'render';
        this.priority = 100;
        this.provides = [
            'RenderPipeline'
        ];
    }
}
export { RenderPlugin };
