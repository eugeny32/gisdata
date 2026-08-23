import * as __WEBPACK_EXTERNAL_MODULE__AnimationService_js_61bdc313__ from "./AnimationService.js";
import * as __WEBPACK_EXTERNAL_MODULE__cameraBinding_js_56541c1b__ from "./cameraBinding.js";
class AnimationPlugin {
    onInit(context) {
        this.context = context;
        const invalidation = context.hasService('RenderInvalidationService') ? context.getService('RenderInvalidationService') : null;
        this.service = new __WEBPACK_EXTERNAL_MODULE__AnimationService_js_61bdc313__.AnimationServiceImpl({
            onVisualChange: (reason, detail)=>invalidation?.invalidate(reason, {
                    detail
                })
        });
        context.registerService('AnimationService', this.service);
        this.activityDisposable = invalidation?.registerActivitySource({
            id: 'animation',
            getRenderActivity: ()=>this.service?.hasPlayingPlayers() ? {
                    needsNextFrame: true,
                    reasons: [
                        'animation.playing'
                    ]
                } : {
                    needsNextFrame: false
                }
        }) ?? null;
    }
    onStart() {
        if (!this.context || !this.service) return;
        if (this.context.hasService('CameraBindingHost')) {
            const cameraHost = this.context.getService('CameraBindingHost');
            this.cameraBindingDisposable = this.service.registerBinding('camera', (0, __WEBPACK_EXTERNAL_MODULE__cameraBinding_js_56541c1b__.createCameraBindingResolver)(cameraHost));
        }
    }
    onUpdateFrame(frame) {
        this.service?.update(frame.delta);
    }
    onDestroy() {
        this.activityDisposable?.dispose();
        this.activityDisposable = null;
        this.cameraBindingDisposable?.dispose();
        this.cameraBindingDisposable = null;
        this.service?.dispose();
        this.service = null;
        this.context = null;
    }
    constructor(){
        this.name = 'animation';
        this.priority = 18;
        this.provides = [
            'AnimationService'
        ];
        this.context = null;
        this.service = null;
        this.cameraBindingDisposable = null;
        this.activityDisposable = null;
    }
}
export { AnimationPlugin };
