import * as __WEBPACK_EXTERNAL_MODULE_inversify__ from "inversify";
import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__common_utils_js_dc888826__ from "../common/utils.js";
import * as __WEBPACK_EXTERNAL_MODULE__common_view_js_c120fdaa__ from "../common/view.js";
import * as __WEBPACK_EXTERNAL_MODULE__container_types_js_cfed9b58__ from "../container/types.js";
import * as __WEBPACK_EXTERNAL_MODULE__core_common_event_js_420388de__ from "../core/common/event.js";
import * as __WEBPACK_EXTERNAL_MODULE__core_controller_Controller_js_f8b56def__ from "../core/controller/Controller.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_80c6d5a0__ from "../../../../shared/constants/index.js";
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
}
const CLICK_MOVE_THRESHOLD_PX = 5;
class CADController extends __WEBPACK_EXTERNAL_MODULE__core_controller_Controller_js_f8b56def__.Controller {
    get camera() {
        return this.ctx.getService('ViewportCamera').getActiveCamera();
    }
    get renderer() {
        return this.ctx.renderer;
    }
    get domElement() {
        return this.ctx.renderer.domElement;
    }
    get scene() {
        return this.ctx.sceneGraph.cadRoot;
    }
    initialize() {
        this.bindEngineEvents();
        this.entitySelector.frameSelect.mount(this.domElement.parentElement);
        this.entitySelector.frameSelect.setContext?.(this.camera, this.domElement, (point)=>this.getScreenPosition(point, false));
        this.mouseTipHelper.mount(this.domElement.parentElement);
        this.viewManager.mountTempGroup(this.scene);
        this.historyManager.on('undoRedo', this.syncSelectionAfterUndoRedo);
    }
    terminate() {
        this.unbindEngineEvents();
        this.entitySelector.clearSelection();
        this.entitySelector.frameSelect.unmount();
        this.mouseTipHelper.dispose();
        this.mouseTipHelper.unmount();
        this.historyManager.off('undoRedo', this.syncSelectionAfterUndoRedo);
        this.viewManager.unmountTempGroup();
        this.viewManager.clearTempObjects();
    }
    bindEngineEvents() {
        this.ctx.events.on('camera.changed', this.onControlsChange);
        this.ctx.events.on('frame.begin', this.onFrameUpdate);
    }
    unbindEngineEvents() {
        this.ctx.events.off('camera.changed', this.onControlsChange);
        this.ctx.events.off('frame.begin', this.onFrameUpdate);
    }
    dispatchExternalEvent(type, ...args) {
        this.eventDispatch(type, ...args);
    }
    handlePointerDown(event, screenPos) {
        this.pointerDownInfo = {
            button: event.button,
            screenPos
        };
    }
    handlePointerUp(event, screenPos) {
        const pointerDownInfo = this.pointerDownInfo;
        this.pointerDownInfo = null;
        if (!pointerDownInfo || pointerDownInfo.button !== event.button) return false;
        const dx = screenPos.x - pointerDownInfo.screenPos.x;
        const dy = screenPos.y - pointerDownInfo.screenPos.y;
        if (Math.hypot(dx, dy) > CLICK_MOVE_THRESHOLD_PX) return false;
        this.eventDispatch(__WEBPACK_EXTERNAL_MODULE__core_common_event_js_420388de__.EventName.onMouseDown, this.buildMouseEventParams(event, screenPos));
        return true;
    }
    handlePointerMove(event, screenPos) {
        const params = this.buildMouseEventParams(event, screenPos);
        this.eventDispatch(__WEBPACK_EXTERNAL_MODULE__core_common_event_js_420388de__.EventName.onMouseMove, params);
        this.mouseTipHelper.updateTransform({
            position: params.screenPos
        });
    }
    handleKeyDown(event) {
        const params = {
            event
        };
        this.eventDispatch(__WEBPACK_EXTERNAL_MODULE__core_common_event_js_420388de__.EventName.onKeyDown, params);
        if (event.ctrlKey && event.keyCode === __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_80c6d5a0__.KeyCodes.Z) this.historyManager.undo();
        else if (event.ctrlKey && event.keyCode === __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_80c6d5a0__.KeyCodes.Y) this.historyManager.redo();
    }
    handleDoubleClick(event, screenPos) {
        this.eventDispatch(__WEBPACK_EXTERNAL_MODULE__core_common_event_js_420388de__.EventName.onDoubleClick, this.buildMouseEventParams(event, screenPos));
    }
    handleKeyUp(event) {
        const params = {
            event
        };
        this.eventDispatch(__WEBPACK_EXTERNAL_MODULE__core_common_event_js_420388de__.EventName.onKeyUp, params);
    }
    buildMouseEventParams(event, screenPos) {
        return {
            event,
            screenPos,
            worldPos: this.screenToWorkPlane(screenPos)
        };
    }
    getActiveViewRect() {
        return (0, __WEBPACK_EXTERNAL_MODULE__common_view_js_c120fdaa__.getActiveViewRect)(this.ctx);
    }
    getActiveViewSize() {
        return (0, __WEBPACK_EXTERNAL_MODULE__common_view_js_c120fdaa__.getActiveViewSize)(this.ctx);
    }
    screenToWorkPlane(screenPos) {
        const camera = this.camera;
        const mousePoint = (0, __WEBPACK_EXTERNAL_MODULE__common_view_js_c120fdaa__.screenToActiveViewNDC)(this.ctx, screenPos);
        const intersectPoint = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        this.raycaster.setFromCamera(mousePoint, camera);
        if (this.raycaster.ray.intersectPlane(this.viewManager.planeHelper, intersectPoint)) {
            const localPoint = this.viewManager.getObjectGroup().worldToLocal(intersectPoint);
            return {
                x: localPoint.x,
                y: localPoint.y,
                z: 0
            };
        }
        const fallback = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(mousePoint.x, mousePoint.y, __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_80c6d5a0__.DEFAULT_UNPROJECT_Z).unproject(camera);
        return {
            x: fallback.x,
            y: fallback.y,
            z: fallback.z
        };
    }
    getPixelSizeInWorld(radius) {
        return (0, __WEBPACK_EXTERNAL_MODULE__common_utils_js_dc888826__.getPixelSizeInWorld)(this.camera, this.getActiveViewSize(), radius);
    }
    getScreenPosition(localPos, isLocalPos = true) {
        const group = this.viewManager.objectManager.getSceneGroup();
        const worldPos = isLocalPos ? group.localToWorld(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(localPos.x, localPos.y, localPos.z || 0)) : new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(localPos.x, localPos.y, localPos.z || 0);
        const rect = this.getActiveViewRect();
        const projected = worldPos.clone().project(this.camera);
        return {
            x: rect.x + (projected.x + 1) / 2 * rect.width,
            y: rect.y + (-projected.y + 1) / 2 * rect.height
        };
    }
    getCADIntersections(screenPos) {
        const camera = this.camera;
        const mousePoint = (0, __WEBPACK_EXTERNAL_MODULE__common_view_js_c120fdaa__.screenToActiveViewNDC)(this.ctx, screenPos);
        this.raycaster.setFromCamera(mousePoint, camera);
        const threshold = this.getPixelSizeInWorld(10);
        const line2Threshold = 5;
        this.raycaster.params.Line.threshold = threshold;
        if (this.raycaster.params.Line2) this.raycaster.params.Line2.threshold = line2Threshold;
        else this.raycaster.params.Line2 = {
            threshold: line2Threshold
        };
        const intersectableObjects = this.getCADIntersectableObjects();
        return this.raycaster.intersectObjects(intersectableObjects, false).sort((a, b)=>a.distance - b.distance);
    }
    getCADIntersectableObjects() {
        const group = this.viewManager.objectManager.getSceneGroup();
        const objects = [];
        group.traverse((child)=>{
            if (child.visible && child.isMesh || child.isLine || child.isLine2 || child.isLineSegments2) objects.push(child);
        });
        return objects;
    }
    updateGroupByPlane(plane) {
        this.viewManager.updateTempGroupByPlane(plane);
    }
    updatePlane(plane) {
        this.viewManager.planeHelper.setFromNormalAndCoplanarPoint(plane.normal, plane.origin);
        this.viewManager.dataManager.updatePlane(plane);
        this.viewManager.objectManager.updateGroupByPlane(plane);
        this.updateGroupByPlane(plane);
    }
    constructor(...args){
        super(...args), this.raycaster = new __WEBPACK_EXTERNAL_MODULE_three__.Raycaster(), this.pointerDownInfo = null, this.syncSelectionAfterUndoRedo = ()=>{
            const selected = this.entitySelector.getSelected();
            const toRemove = selected.filter((e)=>!this.viewManager.getEntity(e.id));
            if (toRemove.length > 0) this.entitySelector.deselect(toRemove);
        }, this.onControlsChange = ()=>{
            this.eventDispatch(__WEBPACK_EXTERNAL_MODULE__core_common_event_js_420388de__.EventName.onControlsChange, {});
        }, this.onFrameUpdate = ()=>{
            this.eventDispatch(__WEBPACK_EXTERNAL_MODULE__core_common_event_js_420388de__.EventName.onViewerUpdate, {});
        };
    }
}
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_cfed9b58__.TYPES.CADViewManager),
    _ts_metadata("design:type", "undefined" == typeof CADViewManager ? Object : CADViewManager)
], CADController.prototype, "viewManager", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_cfed9b58__.TYPES.EntitySelector),
    _ts_metadata("design:type", "undefined" == typeof EntitySelector ? Object : EntitySelector)
], CADController.prototype, "entitySelector", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_cfed9b58__.TYPES.MouseTipHelper),
    _ts_metadata("design:type", "undefined" == typeof MouseTipHelper ? Object : MouseTipHelper)
], CADController.prototype, "mouseTipHelper", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_cfed9b58__.TYPES.HistoryManager),
    _ts_metadata("design:type", "undefined" == typeof HistoryManager ? Object : HistoryManager)
], CADController.prototype, "historyManager", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_cfed9b58__.TYPES.CADDefaultTool),
    _ts_metadata("design:type", "undefined" == typeof CADDefaultTool ? Object : CADDefaultTool)
], CADController.prototype, "defaultTool", void 0);
_ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.inject)(__WEBPACK_EXTERNAL_MODULE__container_types_js_cfed9b58__.TYPES.EngineContext),
    _ts_metadata("design:type", "undefined" == typeof EngineContext ? Object : EngineContext)
], CADController.prototype, "ctx", void 0);
CADController = _ts_decorate([
    (0, __WEBPACK_EXTERNAL_MODULE_inversify__.injectable)()
], CADController);
export { CADController };
