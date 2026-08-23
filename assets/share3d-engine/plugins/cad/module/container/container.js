import * as __WEBPACK_EXTERNAL_MODULE_inversify__ from "inversify";
import * as __WEBPACK_EXTERNAL_MODULE__CADModule_CADModule_js_dedaf68f__ from "../CADModule/CADModule.js";
import * as __WEBPACK_EXTERNAL_MODULE__types_js_7eec16d2__ from "./types.js";
function createCadContainer(ctx) {
    const cadContainer = new __WEBPACK_EXTERNAL_MODULE_inversify__.Container();
    cadContainer.bind(__WEBPACK_EXTERNAL_MODULE__types_js_7eec16d2__.TYPES.EngineContext).toConstantValue(ctx);
    cadContainer.bind(__WEBPACK_EXTERNAL_MODULE__types_js_7eec16d2__.TYPES.Scene).toDynamicValue(()=>ctx.sceneGraph.mainScene);
    cadContainer.bind(__WEBPACK_EXTERNAL_MODULE__types_js_7eec16d2__.TYPES.SelectionService).toDynamicValue(()=>ctx.getService('SelectionService'));
    cadContainer.bind(__WEBPACK_EXTERNAL_MODULE__types_js_7eec16d2__.TYPES.PickingService).toDynamicValue(()=>ctx.getService('PickingService'));
    cadContainer.bind(__WEBPACK_EXTERNAL_MODULE__types_js_7eec16d2__.TYPES.RenderInvalidator).toConstantValue({
        invalidate (reason) {
            if (ctx.hasService('RenderInvalidationService')) ctx.getService('RenderInvalidationService').invalidate(reason);
        }
    });
    cadContainer.bind(__WEBPACK_EXTERNAL_MODULE__types_js_7eec16d2__.TYPES.Camera).toDynamicValue(()=>{
        const vc = ctx.getService('ViewportCamera');
        return vc.getActiveCamera();
    });
    cadContainer.bind(__WEBPACK_EXTERNAL_MODULE__types_js_7eec16d2__.TYPES.Renderer).toDynamicValue(()=>ctx.renderer);
    cadContainer.load(__WEBPACK_EXTERNAL_MODULE__CADModule_CADModule_js_dedaf68f__.CADModule);
    return cadContainer;
}
export { createCadContainer };
