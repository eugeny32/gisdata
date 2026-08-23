import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__ from "../shared/viewScope.js";
import * as __WEBPACK_EXTERNAL_MODULE__VolumeData_js_d96714d0__ from "./VolumeData.js";
class VolumePlugin {
    get isActive() {
        return this._active;
    }
    setActivationToken(token) {
        this.activationToken = token;
    }
    onInit(context) {
        this.context = context;
        context.registerService('VolumeService', this);
    }
    onStart() {
        this.inputRouter = this.context.getService('InputRouter');
        this.pickingService = this.context.getService('PickingService');
        this.viewRegistry = (0, __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__.getOptionalViewRegistry)(this.context);
        this.currentCamera = this.resolveActiveViewCamera();
        if (this.viewRegistry) this.context.events.on('view.activated', this.handleViewActivated);
    }
    onRenderView(frame) {
        if (!this._active) return;
        if (!(0, __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__.isActiveViewFrame)(this.viewRegistry, frame)) return;
        this.currentCamera = this.resolveActiveViewCamera() ?? frame.camera;
    }
    onDestroy() {
        if (this.viewRegistry) this.context.events.off('view.activated', this.handleViewActivated);
        if (this._active && this.activationToken) this.deactivate(this.activationToken);
        this.viewRegistry = null;
    }
    activate(token) {
        this.validateToken(token);
        if (this._active) return;
        this._active = true;
        this.inputRouter.addConsumer(this.consumer);
    }
    deactivate(token) {
        this.validateToken(token);
        if (!this._active) return;
        this._active = false;
        this.inputRouter.removeConsumer(this.consumer);
        this.finishCurrentVolume();
        this.currentCamera = null;
    }
    getCurrentDrag() {
        if (!this.isDragging || !this.currentMatrix || !this.currentDimensions) return null;
        return {
            matrix: this.currentMatrix.clone(),
            dimensions: this.currentDimensions.clone()
        };
    }
    getResults() {
        return this.results;
    }
    removeResult(id) {
        const prevLength = this.results.length;
        this.results = this.results.filter((r)=>r.id !== id);
        if (this.results.length !== prevLength) this.emitResultChanged();
    }
    clearResults() {
        if (0 === this.results.length) return;
        this.results = [];
        this.emitResultChanged();
    }
    handlePointerDown(event) {
        if (2 === event.button) {
            this.cancelCurrentVolume();
            return true;
        }
        if (0 !== event.button) return false;
        if (!this.currentCamera) return false;
        const pickResults = this.pickingService.pickAtScreen(event.screen, this.currentCamera);
        if (pickResults.length > 0) {
            const hitPoint = pickResults[0].point;
            this.isDragging = true;
            this.currentMatrix = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4().setPosition(hitPoint);
            this.currentDimensions = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 0);
            return true;
        }
        return false;
    }
    handlePointerMove(event) {
        if (!this.isDragging || !this.currentCamera) return false;
        const pickResults = this.pickingService.pickAtScreen(event.screen, this.currentCamera);
        if (0 === pickResults.length) return true;
        const hitPoint = pickResults[0].point;
        if (!this.currentMatrix) this.currentMatrix = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4();
        this.currentMatrix.setPosition(hitPoint);
        this.currentCamera.updateMatrixWorld();
        const cameraSpacePoint = hitPoint.clone().applyMatrix4(this.currentCamera.matrixWorld.clone().invert());
        const size = Math.abs(cameraSpacePoint.z / 5);
        this.currentDimensions = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(size, size, size);
        return true;
    }
    handlePointerUp(_event) {
        if (!this.isDragging || !this.currentMatrix || !this.currentDimensions) return false;
        if (this.currentDimensions.lengthSq() > 0) {
            const result = (0, __WEBPACK_EXTERNAL_MODULE__VolumeData_js_d96714d0__.buildVolumeResult)(this.currentMatrix, this.currentDimensions);
            this.results.push(result);
            this.emitResultChanged();
        }
        this.resetDragState();
        return true;
    }
    cancelCurrentVolume() {
        if (this.isDragging) {
            this.resetDragState();
            this.emitResultChanged();
        }
    }
    resetDragState() {
        this.isDragging = false;
        this.currentMatrix = null;
        this.currentDimensions = null;
    }
    finishCurrentVolume() {
        if (this.isDragging && this.currentMatrix && this.currentDimensions && this.currentDimensions.lengthSq() > 0) {
            const result = (0, __WEBPACK_EXTERNAL_MODULE__VolumeData_js_d96714d0__.buildVolumeResult)(this.currentMatrix, this.currentDimensions);
            this.results.push(result);
        }
        this.resetDragState();
        this.emitResultChanged();
    }
    emitResultChanged() {
        this.context.events.emit('tool.resultChanged', {
            name: this.name,
            data: this.results
        });
    }
    validateToken(token) {
        if (token !== this.activationToken) throw new Error('VolumePlugin: 非法的 ActivationToken，操作被拒绝');
    }
    resolveActiveViewCamera() {
        return (0, __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__.getActiveViewCamera)(this.viewRegistry);
    }
    constructor(){
        this.name = 'volume';
        this.priority = 50;
        this.group = 'default';
        this.dependencies = [
            'PickingService',
            'InputRouter'
        ];
        this.provides = [
            'VolumeService'
        ];
        this._active = false;
        this.activationToken = null;
        this.results = [];
        this.currentCamera = null;
        this.viewRegistry = null;
        this.handleViewActivated = (event)=>{
            this.currentCamera = this.resolveActiveViewCamera();
            if (event.previousViewId && event.previousViewId !== event.viewId) this.cancelCurrentVolume();
        };
        this.isDragging = false;
        this.currentMatrix = null;
        this.currentDimensions = null;
        this.consumer = {
            name: 'volume',
            priority: 100,
            onPointerDown: (event)=>this.handlePointerDown(event),
            onPointerMove: (event)=>this.handlePointerMove(event),
            onPointerUp: (event)=>this.handlePointerUp(event)
        };
    }
}
const VolumePlugin_rslib_entry_ = VolumePlugin;
export { VolumePlugin, VolumePlugin_rslib_entry_ as default };
