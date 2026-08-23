import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__ from "../shared/viewScope.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_utils_Magnifier_js_5b3fda6b__ from "../../../shared/utils/Magnifier.js";
import * as __WEBPACK_EXTERNAL_MODULE__MeasureData_js_9578c8f4__ from "./MeasureData.js";
import * as __WEBPACK_EXTERNAL_MODULE__MeasureSnapService_js_d994c8f7__ from "./MeasureSnapService.js";
class MeasurePlugin {
    static #_ = this.CLICK_MOVE_THRESHOLD = 5;
    static #_2 = this.GSPLAT_HOVER_RADIUS = 0.08;
    static #_3 = this.CAMERA_MOTION_COOLDOWN_MS = 120;
    static #_4 = this.MAGNIFIER_SHOW_DELAY_MS = 120;
    constructor(options = {}){
        this.name = 'measure';
        this.priority = 50;
        this.dependencies = [
            'PickingService',
            'InputRouter'
        ];
        this.provides = [
            'MeasureService'
        ];
        this.resultVisibility = new Map();
        this._active = false;
        this._measureType = 'distance';
        this.activationToken = null;
        this.cursorBeforeActivate = null;
        this.viewEventRouter = null;
        this.usingViewEventRouter = false;
        this.clipService = null;
        this.results = [];
        this.currentPoints = [];
        this.draftViewId = null;
        this.previewViewId = null;
        this.previewPoint = null;
        this.hoverSnap = null;
        this.currentCamera = null;
        this.magnifier = null;
        this.magnifierShowTimer = null;
        this.viewRegistry = null;
        this.escapeArmed = false;
        this.lastCameraMatrixWorld = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4();
        this.lastCameraProjectionMatrix = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4();
        this.hasCameraSnapshot = false;
        this.lastCameraMotionAt = -1 / 0;
        this.pendingPointer = null;
        this.handleViewActivated = (_event)=>{
            this.currentCamera = this.resolveActiveViewCamera();
        };
        this.consumer = {
            name: 'measure',
            priority: 100,
            onPointerDown: (event)=>this.handlePointerDown(event),
            onPointerMove: (event)=>this.handlePointerMove(event),
            onPointerUp: (event)=>this.handlePointerUp(event),
            onWinKeyDown: (event)=>this.handleKeyDown(event),
            onWinKeyUp: (event)=>this.handleKeyUp(event),
            onDoubleClick: ()=>{
                this.finishCurrentMeasure();
                return true;
            }
        };
        this.group = options.group ?? 'default';
    }
    get isActive() {
        return this._active;
    }
    setMeasureType(type) {
        if (this._measureType !== type) this.resetDraftState();
        this._measureType = type;
        this.emitResultChanged();
    }
    getMeasureType() {
        return this._measureType;
    }
    getCurrentPoints() {
        return this.currentPoints;
    }
    getPreviewPoint() {
        return this.previewPoint;
    }
    getPreviewViewId() {
        return this.previewViewId;
    }
    getDraftViewId() {
        return this.draftViewId;
    }
    getDraftResult() {
        if (!this.canCompleteCurrentMeasure()) return null;
        return (0, __WEBPACK_EXTERNAL_MODULE__MeasureData_js_9578c8f4__.buildMeasureResult)(this.currentPoints, this._measureType, {
            viewId: this.draftViewId
        });
    }
    canSaveDraft() {
        return null !== this.getDraftResult();
    }
    saveDraft() {
        const result = this.getDraftResult();
        if (!result) return null;
        this.results.push(result);
        this.resetDraftState();
        this.emitResultChanged();
        return result;
    }
    undoLastPoint() {
        if (0 === this.currentPoints.length) return false;
        this.currentPoints.pop();
        const lastPoint = this.currentPoints[this.currentPoints.length - 1] ?? null;
        this.previewPoint = lastPoint ? {
            position: lastPoint.position.clone()
        } : null;
        this.previewViewId = lastPoint ? this.draftViewId : null;
        if (!lastPoint) this.draftViewId = null;
        this.hoverSnap = null;
        this.resetTransientState();
        this.emitResultChanged();
        return true;
    }
    clearDraft() {
        if (0 === this.currentPoints.length && null === this.previewPoint) return false;
        this.currentPoints = [];
        this.draftViewId = null;
        this.previewPoint = null;
        this.previewViewId = null;
        this.hoverSnap = null;
        this.pendingPointer = null;
        this.emitResultChanged();
        return true;
    }
    getHoverSnap() {
        return this.hoverSnap;
    }
    setCaptureEnabled(enabled) {
        this.snapService.setCaptureEnabled(enabled);
        this.emitResultChanged();
    }
    isCaptureEnabled() {
        return this.snapService.isCaptureEnabled();
    }
    setPointCloudCaptureEnabled(enabled) {
        this.snapService.setPointCloudCaptureEnabled(enabled);
        this.emitResultChanged();
    }
    isPointCloudCaptureEnabled() {
        return this.snapService.isPointCloudCaptureEnabled();
    }
    setCadCaptureEnabled(enabled) {
        this.snapService.setCadCaptureEnabled(enabled);
        this.emitResultChanged();
    }
    isCadCaptureEnabled() {
        return this.snapService.isCadCaptureEnabled();
    }
    setCaptureConfig(config) {
        this.snapService.setCaptureConfig(config);
        this.emitResultChanged();
    }
    setOrthogonalEnabled(enabled) {
        this.snapService.setOrthogonalEnabled(enabled);
        this.emitResultChanged();
    }
    isOrthogonalEnabled() {
        return this.snapService.isOrthogonalEnabled();
    }
    setActivationToken(token) {
        this.activationToken = token;
    }
    onInit(context) {
        this.context = context;
        context.registerService('MeasureService', this);
    }
    setResultVisible(id, visible) {
        if ((this.resultVisibility.get(id) ?? true) === visible) return;
        this.resultVisibility.set(id, visible);
        this.emitResultChanged();
    }
    getResultVisible(id) {
        return this.resultVisibility.get(id) ?? true;
    }
    onStart() {
        this.inputRouter = this.context.getService('InputRouter');
        this.viewEventRouter = this.context.hasService('ViewEventRouter') ? this.context.getService('ViewEventRouter') : null;
        this.pickingService = this.context.getService('PickingService');
        this.clipService = this.context.hasService('ClipService') ? this.context.getService('ClipService') : null;
        this.snapService = new __WEBPACK_EXTERNAL_MODULE__MeasureSnapService_js_d994c8f7__.MeasureSnapService(this.context, this.pickingService);
        this.viewRegistry = (0, __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__.getOptionalViewRegistry)(this.context);
        this.currentCamera = this.resolveActiveViewCamera();
        if (this.viewRegistry) this.context.events.on('view.activated', this.handleViewActivated);
    }
    onRenderView(frame) {
        if (!(0, __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__.isActiveViewFrame)(this.viewRegistry, frame)) return;
        this.currentCamera = this.resolveActiveViewCamera() ?? frame.camera;
        this.currentCamera.updateMatrixWorld(true);
        this.trackCameraMotion(this.currentCamera);
    }
    onDestroy() {
        if (this.viewRegistry) this.context.events.off('view.activated', this.handleViewActivated);
        if (this._active && this.activationToken) this.deactivate(this.activationToken);
        this.disposeMagnifier();
        this.viewRegistry = null;
        this.viewEventRouter = null;
        this.clipService = null;
    }
    activate(token) {
        this.validateToken(token);
        if (this._active) return;
        this._active = true;
        this.cursorBeforeActivate = this.context.renderer.domElement.style.cursor;
        this.context.renderer.domElement.style.cursor = 'crosshair';
        if (this.viewEventRouter) {
            this.viewEventRouter.addConsumer(this.consumer);
            this.usingViewEventRouter = true;
            return;
        }
        this.inputRouter.addConsumer(this.consumer);
        this.usingViewEventRouter = false;
    }
    deactivate(token) {
        this.validateToken(token);
        if (!this._active) return;
        this._active = false;
        if (this.usingViewEventRouter) this.viewEventRouter?.removeConsumer(this.consumer);
        else this.inputRouter.removeConsumer(this.consumer);
        this.usingViewEventRouter = false;
        this.finishCurrentMeasure();
        this.hideMagnifier();
        this.context.renderer.domElement.style.cursor = this.cursorBeforeActivate ?? '';
        this.cursorBeforeActivate = null;
        this.currentCamera = null;
        this.resetTransientState();
        this.snapService.setCaptureEnabled(false);
        this.snapService.setPointCloudCaptureEnabled(false);
        this.snapService.setOrthogonalEnabled(false);
    }
    getResults() {
        return this.results;
    }
    addResult(result) {
        this.results.push(result);
        this.emitResultChanged();
    }
    removeResult(id) {
        const prevLength = this.results.length;
        this.results = this.results.filter((result)=>result.id !== id);
        if (this.results.length !== prevLength) {
            this.resultVisibility.delete(id);
            this.emitResultChanged();
        }
    }
    clearResults() {
        if (0 === this.results.length) return;
        this.results = [];
        this.resultVisibility.clear();
        this.emitResultChanged();
    }
    handleKeyDown(event) {
        if (!this._active) return false;
        if (this.isControlKey(event.key)) {
            this.scheduleMagnifierShow();
            return false;
        }
        if (event.ctrlKey && 'z' === event.key.toLowerCase()) {
            this.hideMagnifier();
            this.undoLastPoint();
            event.domEvent.preventDefault();
            return true;
        }
        this.cancelPendingMagnifierShow();
        if ('Escape' === event.key) {
            if (this.escapeArmed) {
                this.escapeArmed = false;
                this.cancelCurrentMeasure();
                this.requestDeactivate();
                return true;
            }
            this.clearDraft();
            this.escapeArmed = true;
            return true;
        }
        this.escapeArmed = false;
        return false;
    }
    handleKeyUp(event) {
        if (!this._active) return false;
        if (!this.isControlKey(event.key)) return false;
        this.hideMagnifier();
        return false;
    }
    requestDeactivate() {
        this.context.events.emit('tool.requestDeactivate', {
            name: this.name,
            group: this.group ?? 'default'
        });
    }
    handlePointerDown(event) {
        if (0 !== event.button && 2 !== event.button) return false;
        const eventViewId = this.resolveEventViewId(event);
        if (this.shouldIgnorePointerForDraft(eventViewId)) return false;
        this.pendingPointer = {
            button: event.button,
            startScreen: event.screen.clone(),
            viewId: eventViewId,
            moved: false
        };
        return false;
    }
    handlePointerMove(event) {
        if (this.releaseClipBoxDrag()) return false;
        const eventViewId = this.resolveEventViewId(event);
        if (this.shouldIgnorePointerForDraft(eventViewId)) return false;
        if (this.pendingPointer) {
            const distance = event.screen.distanceTo(this.pendingPointer.startScreen);
            if (distance > MeasurePlugin.CLICK_MOVE_THRESHOLD) this.pendingPointer.moved = true;
        }
        if (!this.resolveEventCamera(event)) return false;
        if (this.shouldSuspendHoverPicking(event)) {
            this.updateHoverState(null, null, null);
            return false;
        }
        const snapResult = this.pickPoint(event, 'move');
        const nextPreviewPoint = snapResult ? {
            position: snapResult.point.clone()
        } : null;
        const nextHoverSnap = snapResult?.isCaptureHit ? {
            kind: snapResult.kind,
            snapType: snapResult.snapType,
            entityId: snapResult.entityId,
            assetId: snapResult.assetId
        } : null;
        this.updateHoverState(nextPreviewPoint, nextHoverSnap, eventViewId);
        return false;
    }
    handlePointerUp(event) {
        if ('pointercancel' === event.domEvent.type) {
            this.pendingPointer = null;
            return false;
        }
        if (this.releaseClipBoxDrag()) return false;
        const pendingPointer = this.pendingPointer;
        this.pendingPointer = null;
        const eventViewId = this.resolveEventViewId(event);
        if (!pendingPointer || pendingPointer.button !== event.button || pendingPointer.moved || pendingPointer.viewId && eventViewId && pendingPointer.viewId !== eventViewId) return false;
        if (this.shouldIgnorePointerForDraft(eventViewId)) return false;
        if (2 === event.button) {
            if (event.domEvent.ctrlKey) return this.undoLastPoint();
            if (this.canCompleteCurrentMeasure()) this.finishCurrentMeasure();
            else this.cancelCurrentMeasure();
            return true;
        }
        if (0 !== event.button || !this.resolveEventCamera(event)) return false;
        const snapResult = this.pickPoint(event, 'click');
        if (!snapResult) return false;
        if (!this.draftViewId) this.draftViewId = eventViewId;
        this.currentPoints.push({
            position: snapResult.point.clone()
        });
        this.hoverSnap = snapResult.isCaptureHit ? {
            kind: snapResult.kind,
            snapType: snapResult.snapType,
            entityId: snapResult.entityId,
            assetId: snapResult.assetId
        } : null;
        this.escapeArmed = false;
        if (this.tryAutoFinish()) return true;
        this.previewPoint = {
            position: snapResult.point.clone()
        };
        this.previewViewId = eventViewId;
        this.emitResultChanged();
        return true;
    }
    pickPoint(event, interactionType) {
        const eventViewId = this.resolveEventViewId(event);
        const eventViewRect = this.resolveEventViewRect(event, eventViewId);
        const eventCamera = this.resolveEventCamera(event);
        if (!eventCamera) return null;
        return this.snapService.resolvePoint({
            screen: event.screen,
            camera: eventCamera,
            interactionType,
            centerSphereRadius: 'move' === interactionType ? MeasurePlugin.GSPLAT_HOVER_RADIUS : void 0,
            startPoint: this.currentPoints[this.currentPoints.length - 1]?.position ?? null,
            viewId: eventViewId,
            viewRect: eventViewRect,
            allowMoveWithoutStartPoint: 'move' === interactionType
        });
    }
    shouldIgnorePointerForDraft(eventViewId) {
        return !!this.draftViewId && !!eventViewId && this.draftViewId !== eventViewId;
    }
    resolveEventViewId(event) {
        const routedViewId = event.viewId;
        if ('string' == typeof routedViewId) return routedViewId;
        return this.viewRegistry?.getActive()?.id ?? null;
    }
    resolveEventViewRect(event, eventViewId) {
        const routedViewRect = event.viewRect;
        if (routedViewRect) return routedViewRect;
        if (event.viewport) return event.viewport;
        if (eventViewId && this.viewRegistry) return this.viewRegistry.get(eventViewId)?.rect ?? null;
        return this.resolveActiveViewRect();
    }
    resolveEventCamera(event) {
        const eventViewId = this.resolveEventViewId(event);
        if (eventViewId && this.viewRegistry) {
            const viewportCamera = this.viewRegistry.getExtension(eventViewId, 'viewportCamera');
            const camera = viewportCamera?.getActiveCamera();
            if (camera) return camera;
        }
        return this.currentCamera ?? this.resolveActiveViewCamera();
    }
    finishCurrentMeasure() {
        if (this.saveDraft()) return;
        this.resetDraftState();
        this.emitResultChanged();
    }
    cancelCurrentMeasure() {
        if (0 === this.currentPoints.length && null === this.previewPoint) return;
        this.resetDraftState();
        this.emitResultChanged();
    }
    resetDraftState() {
        this.currentPoints = [];
        this.draftViewId = null;
        this.previewPoint = null;
        this.previewViewId = null;
        this.pendingPointer = null;
        this.hoverSnap = null;
        this.resetTransientState();
    }
    resetTransientState() {
        this.pendingPointer = null;
        this.escapeArmed = false;
    }
    releaseClipBoxDrag() {
        const boxEditorState = this.clipService?.getBoxEditorState();
        if (!boxEditorState?.active || !boxEditorState.dragging) return false;
        this.pendingPointer = null;
        this.updateHoverState(null, null, null);
        return true;
    }
    shouldSuspendHoverPicking(event) {
        const buttons = 'number' == typeof event.domEvent.buttons ? event.domEvent.buttons ?? 0 : 0;
        if (0 !== buttons) return true;
        return performance.now() - this.lastCameraMotionAt < MeasurePlugin.CAMERA_MOTION_COOLDOWN_MS;
    }
    trackCameraMotion(camera) {
        const matrixWorldChanged = !this.lastCameraMatrixWorld.equals(camera.matrixWorld);
        const projectionChanged = !this.lastCameraProjectionMatrix.equals(camera.projectionMatrix);
        if (!this.hasCameraSnapshot) {
            this.lastCameraMatrixWorld.copy(camera.matrixWorld);
            this.lastCameraProjectionMatrix.copy(camera.projectionMatrix);
            this.hasCameraSnapshot = true;
            return;
        }
        if (!matrixWorldChanged && !projectionChanged) return;
        this.lastCameraMotionAt = performance.now();
        this.lastCameraMatrixWorld.copy(camera.matrixWorld);
        this.lastCameraProjectionMatrix.copy(camera.projectionMatrix);
    }
    updateHoverState(nextPreviewPoint, nextHoverSnap, nextPreviewViewId) {
        const effectivePreviewViewId = nextPreviewPoint ? nextPreviewViewId : null;
        if (this.hasPreviewPointChanged(nextPreviewPoint) || this.hasHoverSnapChanged(nextHoverSnap) || this.hasPreviewViewIdChanged(effectivePreviewViewId)) {
            this.previewPoint = nextPreviewPoint;
            this.previewViewId = effectivePreviewViewId;
            this.hoverSnap = nextHoverSnap;
            this.emitResultChanged();
        }
    }
    hasPreviewPointChanged(nextPreviewPoint) {
        if (null === this.previewPoint && null === nextPreviewPoint) return false;
        if (null === this.previewPoint || null === nextPreviewPoint) return true;
        return !this.previewPoint.position.equals(nextPreviewPoint.position);
    }
    hasPreviewViewIdChanged(nextPreviewViewId) {
        return this.previewViewId !== nextPreviewViewId;
    }
    hasHoverSnapChanged(nextHoverSnap) {
        if (null === this.hoverSnap && null === nextHoverSnap) return false;
        if (null === this.hoverSnap || null === nextHoverSnap) return true;
        return this.hoverSnap.kind !== nextHoverSnap.kind || this.hoverSnap.snapType !== nextHoverSnap.snapType || this.hoverSnap.entityId !== nextHoverSnap.entityId || this.hoverSnap.assetId !== nextHoverSnap.assetId;
    }
    tryAutoFinish() {
        const count = this.currentPoints.length;
        const type = this._measureType;
        if ('coordinate' === type && 1 === count) {
            this.finishCurrentMeasure();
            return true;
        }
        if (('height' === type || 'azimuth' === type) && 2 === count) {
            this.finishCurrentMeasure();
            return true;
        }
        if (('circle' === type || 'angle' === type) && 3 === count) {
            this.finishCurrentMeasure();
            return true;
        }
        return false;
    }
    canCompleteCurrentMeasure() {
        const count = this.currentPoints.length;
        switch(this._measureType){
            case 'coordinate':
                return 1 === count;
            case 'distance':
                return count >= 2;
            case 'height':
            case 'azimuth':
                return count >= 2;
            case 'circle':
            case 'angle':
                return 3 === count;
            case 'area':
                return count >= 3;
            default:
                return false;
        }
    }
    emitResultChanged() {
        this.context.events.emit('tool.resultChanged', {
            name: this.name,
            data: this.results
        });
    }
    validateToken(token) {
        if (token !== this.activationToken) throw new Error('MeasurePlugin: invalid ActivationToken');
    }
    resolveActiveViewCamera() {
        return (0, __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__.getActiveViewCamera)(this.viewRegistry);
    }
    resolveActiveViewRect() {
        return this.viewRegistry?.getActive()?.rect ?? null;
    }
    isControlKey(key) {
        return 'Control' === key || 'Ctrl' === key;
    }
    ensureMagnifier() {
        if (!this.magnifier) this.magnifier = new __WEBPACK_EXTERNAL_MODULE__shared_utils_Magnifier_js_5b3fda6b__.Magnifier(this.context, ()=>this.currentCamera ?? this.resolveActiveViewCamera() ?? void 0, {
            excludeTextSprite: true,
            occlusionExcludeObjectPredicate: (obj)=>this.shouldHideCoveredObject(obj)
        });
        return this.magnifier;
    }
    showMagnifier() {
        this.ensureMagnifier().show();
    }
    hideMagnifier() {
        this.cancelPendingMagnifierShow();
        this.magnifier?.hide();
    }
    scheduleMagnifierShow() {
        if (null !== this.magnifierShowTimer) return;
        this.magnifierShowTimer = globalThis.setTimeout(()=>{
            this.magnifierShowTimer = null;
            if (!this._active) return;
            this.showMagnifier();
        }, MeasurePlugin.MAGNIFIER_SHOW_DELAY_MS);
    }
    cancelPendingMagnifierShow() {
        if (null === this.magnifierShowTimer) return;
        globalThis.clearTimeout(this.magnifierShowTimer);
        this.magnifierShowTimer = null;
    }
    disposeMagnifier() {
        this.cancelPendingMagnifierShow();
        if (!this.magnifier) return;
        this.magnifier.dispose();
        this.magnifier = null;
    }
    shouldHideCoveredObject(obj) {
        return this.isTextSpriteObject(obj) || this.isCadObject(obj);
    }
    isTextSpriteObject(obj) {
        if ('Sprite' !== obj.type) return false;
        const userData = obj.userData ?? {};
        const name = (obj.name ?? '').toLowerCase();
        return name.includes('text') || '_labelAnchor' in userData || '_textCanvas' in userData || '_textTexture' in userData;
    }
    isCadObject(obj) {
        const cadRoot = this.context.sceneGraph.cadRoot;
        let current = obj;
        while(current){
            if (current === cadRoot) return true;
            current = current.parent;
        }
        return false;
    }
}
const MeasurePlugin_rslib_entry_ = MeasurePlugin;
export { MeasurePlugin, MeasurePlugin_rslib_entry_ as default };
