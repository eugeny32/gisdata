import * as __WEBPACK_EXTERNAL_MODULE__VideoRenderService_js_bfbc0bcd__ from "./VideoRenderService.js";
class VideoRenderPlugin {
    #service;
    onInit(context) {
        this.#service = (0, __WEBPACK_EXTERNAL_MODULE__VideoRenderService_js_bfbc0bcd__.createVideoRenderService)();
        context.registerService('VideoRenderService', this.#service);
    }
    onStart() {}
    onDestroy() {
        this.#service = null;
    }
    constructor(){
        this.name = 'videoRender';
        this.priority = 90;
        this.provides = [
            'VideoRenderService'
        ];
        this.#service = null;
    }
}
export { VideoRenderPlugin };
