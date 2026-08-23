function getOptionalViewRegistry(context) {
    if ('function' != typeof context.hasService || !context.hasService('ViewRegistry')) return null;
    return context.getService('ViewRegistry');
}
function getActiveViewId(viewRegistry) {
    return viewRegistry?.getActive()?.id ?? null;
}
function isActiveViewFrame(viewRegistry, frame) {
    const activeViewId = getActiveViewId(viewRegistry);
    return !activeViewId || frame.viewId === activeViewId;
}
function getActiveView(viewRegistry) {
    return viewRegistry?.getActive() ?? null;
}
function getActiveViewCamera(viewRegistry) {
    const activeView = getActiveView(viewRegistry);
    if (!viewRegistry || !activeView) return null;
    const managedCamera = viewRegistry.getExtension(activeView.id, 'viewportCamera');
    return managedCamera?.getActiveCamera() ?? null;
}
function getActiveViewRect(viewRegistry) {
    return getActiveView(viewRegistry)?.rect ?? null;
}
function getViewToolsRoot(context, viewRegistry, viewId) {
    if (!viewRegistry || !viewId) return context.sceneGraph.toolsRoot;
    return viewRegistry.getExtension(viewId, 'toolsRoot') ?? context.sceneGraph.toolsRoot;
}
function getViewOverlayRoot(context, viewRegistry, viewId) {
    if (!viewRegistry || !viewId) return context.sceneGraph.overlayRoot;
    return viewRegistry.getExtension(viewId, 'overlayRoot') ?? context.sceneGraph.overlayRoot;
}
export { getActiveView, getActiveViewCamera, getActiveViewId, getActiveViewRect, getOptionalViewRegistry, getViewOverlayRoot, getViewToolsRoot, isActiveViewFrame };
