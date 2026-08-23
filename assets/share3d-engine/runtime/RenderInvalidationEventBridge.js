class RenderInvalidationEventBridge {
    constructor(events, invalidation){
        this.events = events;
        this.invalidation = invalidation;
        this.cleanups = [];
        this.disposed = false;
        this.bind('camera.changed');
        this.bind('camera.modeChanged');
        this.bind('view.camera.changed', (payload)=>({
                viewId: payload.viewId
            }));
        this.bind('view.camera.modeChanged', (payload)=>({
                viewId: payload.viewId
            }));
        this.bind('view.controls.modeChanged', (payload)=>({
                viewId: payload.viewId
            }));
        this.bind('view.viewport.resized', (payload)=>({
                viewId: payload.viewId
            }));
        this.bind('view.created', (payload)=>({
                viewId: payload.viewId
            }));
        this.bind('view.removed', (payload)=>({
                viewId: payload.viewId
            }));
        this.bind('view.updated', (payload)=>({
                viewId: payload.viewId
            }));
        this.bind('view.activated', (payload)=>({
                viewId: payload.viewId
            }));
        this.bind('asset.loading');
        this.bind('asset.loaded');
        this.bind('asset.mounted');
        this.bind('asset.unmounted');
        this.bind('asset.disposed');
        this.bind('asset.visibilityChanged');
        this.bind('asset.error');
        this.bind('cad.selectionChanged');
        this.bind('cad.historyChanged');
        this.bind('cad.undoRedo');
        this.bind('cad.toolChanged');
        this.bind('cad.activeChanged');
        this.bind('cad.dataChanged');
        this.bind('selection.changed');
        this.bind('tool.activated');
        this.bind('tool.deactivated');
        this.bind('tool.requestDeactivate');
        this.bind('tool.resultChanged');
        this.bind('annotation.created');
        this.bind('annotation.updated');
        this.bind('annotation.removed');
        this.bind('annotation.insertionStarted');
        this.bind('annotation.insertionPreview');
        this.bind('annotation.insertionCompleted');
        this.bind('annotation.insertionCancelled');
        this.bind('interaction.pointInfo.click');
        this.bind('interaction.pointInfo.move');
        this.bind('spatial.representationReady');
        this.bind('spatial.representationError');
        this.bind('spatial.bindingChanged');
        this.bind('spatial.worldDisposed');
    }
    dispose() {
        if (this.disposed) return;
        this.disposed = true;
        for(let i = this.cleanups.length - 1; i >= 0; i--)this.cleanups[i]();
        this.cleanups.length = 0;
    }
    bind(event, toOptions) {
        const handler = (payload)=>{
            this.invalidation.invalidate(event, toOptions?.(payload));
        };
        this.events.on(event, handler);
        this.cleanups.push(()=>this.events.off(event, handler));
    }
}
export { RenderInvalidationEventBridge };
