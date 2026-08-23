import * as __WEBPACK_EXTERNAL_MODULE__ActiveViewCameraRigFacade_js_827c6905__ from "./ActiveViewCameraRigFacade.js";
import * as __WEBPACK_EXTERNAL_MODULE__ActiveViewViewportCameraFacade_js_3d665449__ from "./ActiveViewViewportCameraFacade.js";
import * as __WEBPACK_EXTERNAL_MODULE__CameraRig_js_b668eaa4__ from "./CameraRig.js";
import * as __WEBPACK_EXTERNAL_MODULE__ViewportCamera_js_57552b1d__ from "./ViewportCamera.js";
class CameraPlugin {
    onInit(context) {
        this.context = context;
        this.rig = new __WEBPACK_EXTERNAL_MODULE__ActiveViewCameraRigFacade_js_827c6905__.ActiveViewCameraRigFacade(()=>this.getActiveResource().rig);
        this.viewport = new __WEBPACK_EXTERNAL_MODULE__ActiveViewViewportCameraFacade_js_3d665449__.ActiveViewViewportCameraFacade(()=>this.getActiveResource().viewport);
        context.registerService('CameraRig', this.rig);
        context.registerService('ViewportCamera', this.viewport);
        context.registerService('CameraBindingHost', this.cameraBindingHost);
    }
    onStart() {
        this.viewRegistry = this.context.getService('ViewRegistry');
        this.renderPipeline = this.context.hasService('RenderPipeline') ? this.context.getService('RenderPipeline') : null;
        for (const view of this.viewRegistry.list())this.ensureViewResource(view.id);
        this.context.events.on('view.created', this.handleViewCreated);
        this.context.events.on('view.removed', this.handleViewRemoved);
        this.context.events.on('view.activated', this.handleViewActivated);
    }
    onRenderView(frame) {
        this.syncViewResource(frame.viewId, frame.viewRect);
        frame.camera = this.ensureViewResource(frame.viewId).viewport.getActiveCamera();
    }
    onDestroy() {
        if (this._disposed) return;
        this._disposed = true;
        this.context.events.off('view.created', this.handleViewCreated);
        this.context.events.off('view.removed', this.handleViewRemoved);
        this.context.events.off('view.activated', this.handleViewActivated);
        for (const viewId of Array.from(this.resources.keys()))this.disposeViewResource(viewId);
        this.rig.dispose();
        this.viewport.dispose();
        this.viewRegistry = null;
    }
    ensureViewResource(viewId) {
        const existing = this.resources.get(viewId);
        if (existing) return existing;
        const rig = new __WEBPACK_EXTERNAL_MODULE__CameraRig_js_b668eaa4__.CameraRigImpl(this.createEventSink(viewId));
        const viewport = new __WEBPACK_EXTERNAL_MODULE__ViewportCamera_js_57552b1d__.ViewportCamera();
        const resource = {
            rig,
            viewport
        };
        this.resources.set(viewId, resource);
        this.viewRegistry?.setExtension(viewId, 'cameraRig', rig);
        this.viewRegistry?.setExtension(viewId, 'viewportCamera', viewport);
        return resource;
    }
    disposeViewResource(viewId) {
        const resource = this.resources.get(viewId);
        if (!resource) return;
        resource.rig.dispose();
        resource.viewport.dispose();
        this.resources.delete(viewId);
    }
    getActiveResource() {
        const activeViewId = this.viewRegistry?.getActive()?.id;
        if (activeViewId) return this.ensureViewResource(activeViewId);
        const first = this.resources.values().next().value;
        if (first) return first;
        return this.ensureViewResource(this.viewRegistry?.primaryViewId ?? 'primary');
    }
    resolveCameraTarget(ref) {
        const viewId = ref.viewId ?? this.viewRegistry?.getActive()?.id ?? this.viewRegistry?.primaryViewId ?? this.resources.keys().next().value ?? 'primary';
        if (this.viewRegistry && !this.viewRegistry.get(viewId)) return null;
        const resource = this.ensureViewResource(viewId);
        return {
            key: `camera:${viewId}`,
            viewId,
            rig: resource.rig
        };
    }
    applyCameraStatePatch(viewId, patch, options) {
        if (this.viewRegistry && !this.viewRegistry.get(viewId)) return false;
        this.ensureViewResource(viewId).rig.applyStatePatch(patch, options);
        return true;
    }
    cancelCameraTransition(viewId) {
        if (this.viewRegistry && !this.viewRegistry.get(viewId)) return false;
        this.ensureViewResource(viewId).rig.cancelTransition();
        return true;
    }
    syncViewResource(viewId, viewportRect) {
        const resource = this.ensureViewResource(viewId);
        const cameraBounds = this.context.sceneBounds.getWorldBoundingBox();
        if (this.renderPipeline) cameraBounds.union(this.renderPipeline.collectCameraClipBounds({
            viewId
        }));
        resource.rig.updateNearFar(cameraBounds);
        const state = resource.rig.getState();
        resource.viewport.syncFromRig(state, resource.rig.near, resource.rig.far, viewportRect);
        const layerMask = this.viewRegistry?.get(viewId)?.layerMask;
        if (void 0 !== layerMask) {
            resource.viewport.getPerspectiveCamera().layers.mask = layerMask;
            resource.viewport.getOrthographicCamera().layers.mask = layerMask;
        }
    }
    createEventSink(viewId) {
        return {
            emit: (event, data)=>{
                if ('camera.changed' === event) {
                    const changed = data;
                    this.context.events.emit('view.camera.changed', {
                        viewId,
                        state: changed.state
                    });
                } else {
                    const modeChanged = data;
                    this.context.events.emit('view.camera.modeChanged', {
                        viewId,
                        mode: modeChanged.mode,
                        previous: modeChanged.previous
                    });
                }
                if (this.viewRegistry?.getActive()?.id === viewId) this.context.events.emit(event, data);
            }
        };
    }
    constructor(){
        this.name = 'camera';
        this.priority = 20;
        this.dependencies = [
            'ViewRegistry'
        ];
        this.provides = [
            'CameraRig',
            'ViewportCamera',
            'CameraBindingHost'
        ];
        this.viewRegistry = null;
        this.renderPipeline = null;
        this.cameraBindingHost = {
            resolveCameraTarget: (ref)=>this.resolveCameraTarget(ref),
            applyCameraStatePatch: (viewId, patch, options)=>this.applyCameraStatePatch(viewId, patch, options),
            cancelCameraTransition: (viewId)=>this.cancelCameraTransition(viewId)
        };
        this.resources = new Map();
        this._disposed = false;
        this.handleViewCreated = (event)=>{
            this.ensureViewResource(event.viewId);
        };
        this.handleViewRemoved = (event)=>{
            this.disposeViewResource(event.viewId);
        };
        this.handleViewActivated = (event)=>{
            const current = this.resources.get(event.viewId);
            if (!current) return;
            const previousMode = event.previousViewId && this.resources.get(event.previousViewId) ? this.resources.get(event.previousViewId).rig.mode : current.rig.mode;
            this.context.events.emit('camera.changed', {
                state: current.rig.getState()
            });
            if (previousMode !== current.rig.mode) this.context.events.emit('camera.modeChanged', {
                mode: current.rig.mode,
                previous: previousMode
            });
        };
    }
}
export { CameraPlugin };
