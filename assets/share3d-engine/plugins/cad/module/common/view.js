import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_utils_viewRect_js_f1b39cf0__ from "../../../../shared/utils/viewRect.js";
const toViewportSize = (rect)=>({
        clientWidth: Math.max(1, Math.round(rect.width)),
        clientHeight: Math.max(1, Math.round(rect.height))
    });
const getActiveView = (ctx)=>{
    if (!ctx.hasService('ViewRegistry')) return;
    return ctx.getService('ViewRegistry').getActive();
};
const getActiveViewRect = (ctx)=>{
    const dom = ctx.renderer.domElement;
    const fallback = {
        x: 0,
        y: 0,
        width: Math.max(1, dom.clientWidth),
        height: Math.max(1, dom.clientHeight)
    };
    return getActiveView(ctx)?.rect ?? fallback;
};
const getActiveViewSize = (ctx)=>toViewportSize(getActiveViewRect(ctx));
const screenToActiveViewNDC = (ctx, screenPos)=>(0, __WEBPACK_EXTERNAL_MODULE__shared_utils_viewRect_js_f1b39cf0__.screenToViewNDC)(new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(screenPos.x, screenPos.y), getActiveViewRect(ctx));
export { getActiveView, getActiveViewRect, getActiveViewSize, screenToActiveViewNDC };
