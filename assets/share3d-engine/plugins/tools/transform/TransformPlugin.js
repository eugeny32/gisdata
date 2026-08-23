import * as __WEBPACK_EXTERNAL_MODULE_three_addons_controls_TransformControls_js_6c1bd776__ from "three/addons/controls/TransformControls.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__ from "../shared/viewScope.js";
const ASSET_SERVICE_MAP = {
    pointCloud: 'PointCloudService',
    'gaussian-splat': 'GaussianSplatService',
    cad: 'CadService'
};
class TransformPlugin {
    get isActive() {
        return this._active;
    }
    get mode() {
        return this._mode;
    }
    get space() {
        return this._space;
    }
    setActivationToken(token) {
        this.activationToken = token;
    }
    onInit(context) {
        this.context = context;
    }
    onStart() {
        this.inputRouter = this.context.getService('InputRouter');
        this.selectionService = this.context.getService('SelectionService');
        this.viewRegistry = (0, __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__.getOptionalViewRegistry)(this.context);
    }
    onRenderView(frame) {
        if (!(0, __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__.isActiveViewFrame)(this.viewRegistry, frame)) return;
        if (!this._active) return;
        this.currentCamera = frame.camera;
        if (!this.gizmo) this.createGizmo();
        this.updateGizmo();
    }
    onDestroy() {
        if (this._active && this.activationToken) this.deactivate(this.activationToken);
        this.removeGizmo();
        this.viewRegistry = null;
    }
    activate(token) {
        this.validateToken(token);
        if (this._active) return;
        this._active = true;
        this.inputRouter.addConsumer(this.consumer);
        this.createGizmo();
    }
    deactivate(token) {
        this.validateToken(token);
        if (!this._active) return;
        this._active = false;
        this.inputRouter.removeConsumer(this.consumer);
        this.removeGizmo();
        this.isDragging = false;
    }
    setMode(mode) {
        if (this._mode === mode) return;
        this._mode = mode;
        this.updateGizmo();
        this.context.events.emit('tool.resultChanged', {
            name: this.name,
            data: {
                mode
            }
        });
    }
    setSpace(space) {
        if (this._space === space) return;
        this._space = space;
        this.updateGizmo();
        this.context.events.emit('tool.resultChanged', {
            name: this.name,
            data: {
                space
            }
        });
    }
    handlePointerDown(_event) {
        return this.isDragging;
    }
    handlePointerMove(_event) {
        return this.isDragging;
    }
    handlePointerUp(_event) {
        return this.isDragging;
    }
    handleKeyDown(event) {
        if (!this._active) return false;
        switch(event.key.toLowerCase()){
            case 't':
                this.setMode('translate');
                return true;
            case 'r':
                this.setMode('rotate');
                return true;
            case 's':
                this.setMode('scale');
                return true;
            default:
                return false;
        }
    }
    createGizmo() {
        if (this.gizmo) return;
        const camera = this.currentCamera;
        const domElement = this.context.container;
        if (!camera || !domElement) return;
        this.gizmo = new __WEBPACK_EXTERNAL_MODULE_three_addons_controls_TransformControls_js_6c1bd776__.TransformControls(camera, domElement);
        this.gizmo.setMode(this._mode);
        this.gizmo.setSpace(this._space);
        this.gizmo.addEventListener('dragging-changed', (event)=>{
            this.isDragging = event.value;
        });
        this.context.sceneGraph.toolsRoot.add(this.gizmo.getHelper());
    }
    updateGizmo() {
        if (!this.gizmo) return;
        if (this.currentCamera) this.gizmo.camera = this.currentCamera;
        this.gizmo.setMode(this._mode);
        this.gizmo.setSpace(this._space);
        const selected = this.getSelectedObject();
        if (selected) {
            if (this.gizmo.object !== selected) this.gizmo.attach(selected);
        } else this.gizmo.detach();
    }
    removeGizmo() {
        if (!this.gizmo) return;
        this.gizmo.detach();
        this.context.sceneGraph.toolsRoot.remove(this.gizmo.getHelper());
        this.gizmo.dispose();
        this.gizmo = null;
    }
    getSelectedObject() {
        const selected = this.selectionService.selected;
        if (0 === selected.length) return null;
        const first = selected[0];
        const serviceKey = ASSET_SERVICE_MAP[first.kind];
        if (!serviceKey || !this.context.hasService(serviceKey)) return null;
        const service = this.context.getService(serviceKey);
        const handle = service.getAsset(first.assetId);
        return handle?.object3D ?? null;
    }
    validateToken(token) {
        if (token !== this.activationToken) throw new Error('TransformPlugin: 非法的 ActivationToken，操作被拒绝');
    }
    constructor(){
        this.name = 'transform';
        this.priority = 50;
        this.group = 'default';
        this.dependencies = [
            'SelectionService',
            'InputRouter'
        ];
        this._active = false;
        this.activationToken = null;
        this.viewRegistry = null;
        this._mode = 'translate';
        this._space = 'world';
        this.isDragging = false;
        this.gizmo = null;
        this.currentCamera = null;
        this.consumer = {
            name: 'transform',
            priority: 100,
            onPointerDown: (event)=>this.handlePointerDown(event),
            onPointerMove: (event)=>this.handlePointerMove(event),
            onPointerUp: (event)=>this.handlePointerUp(event),
            onKeyDown: (event)=>this.handleKeyDown(event)
        };
    }
}
const TransformPlugin_rslib_entry_ = TransformPlugin;
export { TransformPlugin, TransformPlugin_rslib_entry_ as default };
