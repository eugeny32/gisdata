import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__ from "../shared/viewScope.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__ from "../../../shared/constants/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__BoxTransformGizmo_js_cf06727f__ from "./BoxTransformGizmo.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('tools');
const PREVIEW_GROUP_ID = 'interactive-preview';
const LIVE_BOX_GROUP_ID = 'interactive-box3d-live';
const CONFIRMED_GROUP_PREFIX = 'interactive-confirmed';
const CLICK_MOVE_THRESHOLD = 5;
const MIN_BOX_EDGE = 1;
const FOCUS_VIEW_PADDING = 1.2;
const FOCUS_POLE_OFFSET_RATIO = 1e-3;
const FOCUS_WORLD_UP = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 1);
function toClipPoint(ndc) {
    return new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(ndc.x, ndc.y, 0);
}
function clonePoints(points) {
    return points.map((point)=>point.clone());
}
function buildRectanglePoints(start, end) {
    return [
        new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(start.x, start.y, 0),
        new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(end.x, start.y, 0),
        new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(end.x, end.y, 0),
        new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(start.x, end.y, 0)
    ];
}
function computeClipAabb(points) {
    const min = new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(1 / 0, 1 / 0);
    const max = new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(-1 / 0, -1 / 0);
    for (const point of points){
        min.x = Math.min(min.x, point.x);
        min.y = Math.min(min.y, point.y);
        max.x = Math.max(max.x, point.x);
        max.y = Math.max(max.y, point.y);
    }
    return {
        min,
        max
    };
}
function composeBoxMatrix(box) {
    const center = box.getCenter(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3());
    const size = box.getSize(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3());
    size.x = Math.max(size.x, MIN_BOX_EDGE);
    size.y = Math.max(size.y, MIN_BOX_EDGE);
    size.z = Math.max(size.z, MIN_BOX_EDGE);
    return new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4().compose(center, new __WEBPACK_EXTERNAL_MODULE_three__.Quaternion(), size);
}
function clipModeToTask(mode) {
    return 'inside' === mode ? __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.ClipTask.SHOW_INSIDE : __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.ClipTask.SHOW_OUTSIDE;
}
function rangeToBox3(range) {
    if (!Array.isArray(range) || 2 !== range.length) return null;
    const [min, max] = range;
    if (!Array.isArray(min) || 3 !== min.length || !Array.isArray(max) || 3 !== max.length) return null;
    const values = [
        ...min,
        ...max
    ];
    if (values.some((value)=>'number' != typeof value || !Number.isFinite(value))) return null;
    return new __WEBPACK_EXTERNAL_MODULE_three__.Box3(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(min[0], min[1], min[2]), new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(max[0], max[1], max[2]));
}
class ClipPlugin {
    get isActive() {
        return this._active;
    }
    get volumes() {
        if (0 === this.previewSelectionVolumes.length) return this._volumes;
        return [
            ...this._volumes,
            ...this.previewSelectionVolumes
        ];
    }
    getSelectionMode() {
        return this._selectionMode;
    }
    setSelectionMode(mode) {
        if (this._selectionMode === mode) return;
        const previousMode = this._selectionMode;
        this._selectionMode = mode;
        const preservePreview = ('polygon' === previousMode || 'rectangle' === previousMode) && ('polygon' === mode || 'rectangle' === mode);
        this.pendingPointer = null;
        this._draftPoints = [];
        this._draftPreviewPoint = null;
        if (!preservePreview) this.previewSelectionVolumes = [];
        if ('box3d' === mode) {
            this._clipApplyMode = 'inside';
            if (!this.restoreDraftBoxFromLiveVolume()) this.resetBoxDraft();
        }
        if (this._active && 'box3d' === mode) {
            this.ensureBoxDraftInitialized();
            this.ensureBoxGizmo();
            this.syncLiveBoxVolume();
        } else if ('box3d' !== mode) this.disposeBoxGizmo();
        this.syncControlLock();
        this.emitChanged();
    }
    setClipMode(mode) {
        this.setSelectionMode(mode);
    }
    getClipMode() {
        return this.getSelectionMode();
    }
    getClipApplyMode() {
        return this._clipApplyMode;
    }
    setClipApplyMode(mode) {
        if ('box3d' === this._selectionMode) return;
        if (this._clipApplyMode === mode) return;
        this._clipApplyMode = mode;
        this.emitChanged();
    }
    getDraftState() {
        if ('box3d' === this._selectionMode) this.syncDraftBoxMatrix();
        return {
            selectionMode: this._selectionMode,
            clipMode: this._clipApplyMode,
            points: clonePoints(this._draftPoints),
            previewPoint: this._draftPreviewPoint?.clone() ?? null,
            boxMatrix: this.draftBoxMatrix?.clone() ?? null,
            canConfirm: this.canConfirmDraft()
        };
    }
    get currentVertices() {
        return this._draftPoints;
    }
    getBoxGizmoHelper() {
        return this.boxGizmo?.root ?? null;
    }
    setActivationToken(token) {
        this.activationToken = token;
    }
    onInit(context) {
        this.context = context;
        context.registerService('ClipService', this);
    }
    onStart() {
        this.inputRouter = this.context.getService('InputRouter');
        this.cameraRig = this.context.getService('CameraRig');
        this.context.container.addEventListener('contextmenu', this.onContextMenu);
        this.draftBoxAnchor.name = 'clipDraftBoxAnchor';
        this.draftBoxAnchor.visible = false;
        this.viewRegistry = (0, __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__.getOptionalViewRegistry)(this.context);
        this.currentCamera = this.resolveActiveViewCamera();
        this.reattachDraftBoxAnchor((0, __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__.getActiveViewId)(this.viewRegistry));
        if (this.context.hasService('ControlManager')) this.controlManager = this.context.getService('ControlManager');
        if (this.viewRegistry) this.context.events.on('view.activated', this.handleViewActivated);
    }
    onRenderView(frame) {
        if (!(0, __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__.isActiveViewFrame)(this.viewRegistry, frame)) return;
        this.currentCamera = this.resolveActiveViewCamera() ?? frame.camera;
        this.reattachDraftBoxAnchor(this.resolveActiveViewId());
        this.syncControlLock();
        if (!this._active) return;
        if ('box3d' === this._selectionMode) {
            this.ensureBoxDraftInitialized();
            this.ensureBoxGizmo();
            if (this.boxGizmo) {
                this.boxGizmo.setCamera(this.currentCamera);
                this.boxGizmo.setViewport(frame.viewport.width, frame.viewport.height);
                this.boxGizmo.update();
            }
            this.syncDraftBoxMatrix();
        }
    }
    onDestroy() {
        if (this.viewRegistry) this.context.events.off('view.activated', this.handleViewActivated);
        if (this._active && this.activationToken) this.deactivate(this.activationToken);
        this.previewSelectionVolumes = [];
        this.releaseControlLock();
        this.context.container.removeEventListener('contextmenu', this.onContextMenu);
        this.disposeBoxGizmo();
        this.draftBoxAnchor.removeFromParent();
        this.listeners.clear();
        this._volumes = [];
        this.viewRegistry = null;
    }
    activate(token) {
        this.validateToken(token);
        if (this._active) return;
        this._active = true;
        this.currentCamera = this.resolveActiveViewCamera() ?? this.currentCamera;
        this.reattachDraftBoxAnchor(this.resolveActiveViewId());
        this.inputRouter.addConsumer(this.consumer);
        if ('box3d' === this._selectionMode) {
            this.ensureBoxDraftInitialized();
            this.ensureBoxGizmo();
            this.syncLiveBoxVolume();
        }
        this.syncControlLock();
        this.emitChanged();
    }
    deactivate(token) {
        this.validateToken(token);
        if (!this._active) return;
        this._active = false;
        this.inputRouter.removeConsumer(this.consumer);
        this.pendingPointer = null;
        this.currentCamera = null;
        this._draftPoints = [];
        this._draftPreviewPoint = null;
        this.previewSelectionVolumes = [];
        this.disposeBoxGizmo();
        this.syncControlLock();
        this.emitChanged();
    }
    onChanged(callback) {
        this.listeners.add(callback);
        return {
            dispose: ()=>{
                this.listeners.delete(callback);
            }
        };
    }
    getVolumesByGroup(groupId) {
        return this.volumes.filter((volume)=>volume.groupId === groupId);
    }
    setGroupClipTask(groupId, volumes) {
        if (groupId === PREVIEW_GROUP_ID) {
            this.previewSelectionVolumes = [];
            for (const volume of volumes){
                volume.groupId = groupId;
                this.normalizeVolume(volume);
                this.previewSelectionVolumes.push(volume);
            }
            this.emitChanged();
            return;
        }
        this._volumes = this._volumes.filter((volume)=>volume.groupId !== groupId);
        for (const volume of volumes){
            volume.groupId = groupId;
            this.normalizeVolume(volume);
            this._volumes.push(volume);
        }
        this.emitChanged();
    }
    addVolume(volume, options) {
        volume.viewId = options?.viewId ?? volume.viewId ?? void 0;
        if (volume.groupId === PREVIEW_GROUP_ID) {
            this.normalizeVolume(volume);
            this.previewSelectionVolumes.push(volume);
            this.emitChanged();
            return;
        }
        this.normalizeVolume(volume);
        this._volumes.push(volume);
        this.emitChanged();
    }
    removeVolume(volume) {
        const previewIndex = this.previewSelectionVolumes.indexOf(volume);
        if (-1 !== previewIndex) {
            this.previewSelectionVolumes.splice(previewIndex, 1);
            this.emitChanged();
            return;
        }
        const index = this._volumes.indexOf(volume);
        if (-1 === index) return;
        this._volumes.splice(index, 1);
        this.emitChanged();
    }
    getBoxEditorState() {
        const active = this._active && 'box3d' === this._selectionMode;
        const hasBox = active && null !== this.draftBoxMatrix;
        return {
            active,
            dragging: this.boxGizmo?.isDragging ?? false,
            selectionMode: this._selectionMode,
            boxMatrix: hasBox ? this.draftBoxMatrix.clone() : null,
            boxPosition: hasBox ? this.draftBoxAnchor.position.clone() : null,
            boxScale: hasBox ? this.draftBoxAnchor.scale.clone() : null,
            boxQuaternion: hasBox ? this.draftBoxAnchor.quaternion.clone() : null
        };
    }
    setBoxEditorTransform(transform) {
        if (!this._active || 'box3d' !== this._selectionMode) return false;
        if (transform.position) this.draftBoxAnchor.position.copy(transform.position);
        if (transform.quaternion) this.draftBoxAnchor.quaternion.copy(transform.quaternion);
        if (transform.scale) this.draftBoxAnchor.scale.copy(transform.scale);
        this.draftBoxWasUserModified = true;
        this.syncDraftBoxMatrix();
        this.boxGizmo?.update();
        this.emitChanged();
        return true;
    }
    clearVolumes() {
        if (0 === this._volumes.length) return;
        this._volumes = [];
        this.resetBoxDraft();
        if (this._active && 'box3d' === this._selectionMode) {
            this.ensureBoxDraftInitialized();
            this.syncLiveBoxVolume();
        }
        this.emitChanged();
    }
    clearDraft() {
        this.pendingPointer = null;
        this._draftPoints = [];
        this._draftPreviewPoint = null;
        this.previewSelectionVolumes = [];
        if ('box3d' === this._selectionMode) {
            this.resetBoxDraft();
            this.ensureBoxDraftInitialized();
            this.syncLiveBoxVolume();
        } else this.resetBoxDraft();
        this.emitChanged();
    }
    confirmDraft() {
        if (!this.canConfirmDraft()) return false;
        if ('box3d' === this._selectionMode) return false;
        if (0 === this.previewSelectionVolumes.length) return false;
        const confirmedGroupId = this.allocateConfirmedGroupId();
        for (const previewVolume of this.previewSelectionVolumes)this.addConfirmedVolume({
            type: previewVolume.type,
            matrix: previewVolume.matrix.clone(),
            vertices: previewVolume.vertices ? clonePoints(previewVolume.vertices) : void 0,
            clipTask: clipModeToTask(this._clipApplyMode),
            selectionMode: previewVolume.selectionMode,
            space: previewVolume.space,
            viewMatrix: previewVolume.viewMatrix?.clone(),
            projMatrix: previewVolume.projMatrix?.clone(),
            aabb: previewVolume.aabb ? {
                min: previewVolume.aabb.min.clone(),
                max: previewVolume.aabb.max.clone()
            } : void 0,
            groupId: confirmedGroupId
        });
        this.previewSelectionVolumes = [];
        this.emitChanged();
        return true;
    }
    handlePointerDown(event) {
        if ('box3d' === this._selectionMode) {
            const consumed = this.boxGizmo?.handlePointerDown(event) ?? false;
            this.syncControlLock();
            return consumed;
        }
        if (0 !== event.button && 2 !== event.button) return false;
        const allowCameraInteraction = this.previewSelectionVolumes.length > 0 && 0 === this._draftPoints.length;
        this.pendingPointer = {
            button: event.button,
            startScreen: event.screen.clone(),
            moved: false
        };
        if (allowCameraInteraction) return false;
        this.syncControlLock();
        return true;
    }
    handlePointerMove(event) {
        if (this.pendingPointer) {
            const distance = event.screen.distanceTo(this.pendingPointer.startScreen);
            if (distance > CLICK_MOVE_THRESHOLD) this.pendingPointer.moved = true;
        }
        if ('box3d' === this._selectionMode) return this.boxGizmo?.handlePointerMove(event) ?? false;
        const nextPreview = toClipPoint(event.ndc);
        if (!this._draftPreviewPoint || !this._draftPreviewPoint.equals(nextPreview)) {
            this._draftPreviewPoint = nextPreview;
            this.emitChanged();
        }
        const buttons = event.domEvent?.buttons ?? 0;
        if (0 !== buttons) return this._draftPoints.length > 0;
        return true;
    }
    handlePointerUp(event) {
        if ('box3d' === this._selectionMode) {
            if (event.domEvent?.type === 'pointercancel') this.pendingPointer = null;
            const consumed = this.boxGizmo?.handlePointerUp(event) ?? false;
            this.syncControlLock();
            return consumed;
        }
        if (event.domEvent?.type === 'pointercancel') {
            this.pendingPointer = null;
            return true;
        }
        const pendingPointer = this.pendingPointer;
        this.pendingPointer = null;
        this.syncControlLock();
        if (!pendingPointer || pendingPointer.button !== event.button || pendingPointer.moved) return this._draftPoints.length > 0;
        if (2 === event.button) {
            if ('polygon' === this._selectionMode && this.canFinalizeSelection()) return this.finalizeSelectionPreview();
            const hadDraft = this._draftPoints.length > 0 || null !== this._draftPreviewPoint;
            if (hadDraft) {
                this._draftPoints = [];
                this._draftPreviewPoint = null;
                this.emitChanged();
            }
            return true;
        }
        if (0 !== event.button) return true;
        const point = toClipPoint(event.ndc);
        if ('rectangle' === this._selectionMode) {
            if (0 === this._draftPoints.length) {
                this._draftPoints = [
                    point
                ];
                this._draftPreviewPoint = point.clone();
                this.emitChanged();
                return true;
            }
            this._draftPoints = [
                this._draftPoints[0].clone(),
                point
            ];
            this._draftPreviewPoint = point.clone();
            return this.finalizeSelectionPreview();
        }
        this._draftPoints.push(point);
        this._draftPreviewPoint = point.clone();
        this.emitChanged();
        return true;
    }
    canConfirmDraft() {
        switch(this._selectionMode){
            case 'box3d':
                return false;
            case 'rectangle':
            case 'polygon':
                return this.previewSelectionVolumes.length > 0;
            default:
                return false;
        }
    }
    canFinalizeSelection() {
        if ('rectangle' === this._selectionMode) return 2 === this._draftPoints.length;
        if ('polygon' === this._selectionMode) return this._draftPoints.length >= 3;
        return false;
    }
    finalizeSelectionPreview() {
        if (!this.canFinalizeSelection() || !this.currentCamera) return false;
        const vertices = 'rectangle' === this._selectionMode ? buildRectanglePoints(this._draftPoints[0], this._draftPoints[1]) : clonePoints(this._draftPoints);
        const volume = {
            type: 'polygon',
            matrix: new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4(),
            vertices,
            clipTask: __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.ClipTask.HIGHLIGHT,
            selectionMode: this._selectionMode,
            space: 'screen',
            viewMatrix: this.currentCamera.matrixWorldInverse.clone(),
            projMatrix: this.currentCamera.projectionMatrix.clone(),
            aabb: computeClipAabb(vertices),
            groupId: PREVIEW_GROUP_ID
        };
        this.normalizeVolume(volume);
        this.previewSelectionVolumes.push(volume);
        this._draftPoints = [];
        this._draftPreviewPoint = null;
        this.emitChanged();
        return true;
    }
    getPointCloudSeedBounds() {
        if (!this.context.hasService('PointCloudService')) return null;
        const pointCloudService = this.context.getService('PointCloudService');
        const seedBounds = new __WEBPACK_EXTERNAL_MODULE_three__.Box3();
        let hasBounds = false;
        for (const handle of pointCloudService.getAll()){
            if (!handle.visible || !handle.object3D) continue;
            const pointcloud = handle.object3D;
            const rangeBounds = rangeToBox3(pointcloud.getAttribute?.('position')?.range);
            if (rangeBounds && !rangeBounds.isEmpty()) {
                seedBounds.union(rangeBounds);
                hasBounds = true;
                continue;
            }
            const localBounds = pointcloud.pcoGeometry?.mini_tightBoundingBox?.clone() ?? pointcloud.pcoGeometry?.tightBoundingBox?.clone() ?? handle.boundingBox?.clone() ?? null;
            if (!(!localBounds || localBounds.isEmpty())) {
                if ('function' == typeof pointcloud.updateWorldMatrix) pointcloud.updateWorldMatrix(true, false);
                else if ('function' == typeof pointcloud.updateMatrixWorld) pointcloud.updateMatrixWorld(true);
                seedBounds.union(localBounds.applyMatrix4(pointcloud.matrixWorld));
                hasBounds = true;
            }
        }
        if (!hasBounds || seedBounds.isEmpty()) return null;
        return seedBounds;
    }
    getBestBoxSeed() {
        const pointCloudBounds = this.getPointCloudSeedBounds();
        if (pointCloudBounds && !pointCloudBounds.isEmpty()) return {
            box: pointCloudBounds,
            source: 'pointcloud'
        };
        const fitBounds = this.context.sceneBounds.getWorldBoundingBox({
            purpose: 'fit'
        });
        if (!fitBounds.isEmpty()) return {
            box: fitBounds,
            source: 'scene'
        };
        if (this.context.hasService('PointCloudService')) return 'pending';
        return {
            box: new __WEBPACK_EXTERNAL_MODULE_three__.Box3(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(-0.5, -0.5, -0.5), new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0.5, 0.5, 0.5)),
            source: 'default'
        };
    }
    getBoxSeedPriority(source) {
        switch(source){
            case 'pointcloud':
                return 3;
            case 'scene':
                return 2;
            case 'default':
                return 1;
            default:
                return 0;
        }
    }
    ensureBoxDraftInitialized() {
        const seed = this.getBestBoxSeed();
        if (!seed || 'pending' === seed) return;
        if (this.draftBoxMatrix && (this.draftBoxWasUserModified || this.getBoxSeedPriority(this.draftBoxSeedSource) >= this.getBoxSeedPriority(seed.source))) return;
        this.applyMatrixToDraftBox(composeBoxMatrix(seed.box));
        this.draftBoxSeedSource = seed.source;
        this.draftBoxWasUserModified = false;
    }
    applyMatrixToDraftBox(matrix) {
        const position = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        const quaternion = new __WEBPACK_EXTERNAL_MODULE_three__.Quaternion();
        const scale = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        matrix.decompose(position, quaternion, scale);
        scale.x = Math.max(scale.x, MIN_BOX_EDGE);
        scale.y = Math.max(scale.y, MIN_BOX_EDGE);
        scale.z = Math.max(scale.z, MIN_BOX_EDGE);
        this.draftBoxAnchor.position.copy(position);
        this.draftBoxAnchor.quaternion.copy(quaternion);
        this.draftBoxAnchor.scale.copy(scale);
        this.draftBoxAnchor.updateMatrix();
        this.draftBoxAnchor.updateMatrixWorld(true);
        this.draftBoxMatrix = this.draftBoxAnchor.matrixWorld.clone();
        this.boxGizmo?.update();
    }
    resetBoxDraft() {
        this.draftBoxMatrix = null;
        this.draftBoxSeedSource = null;
        this.draftBoxWasUserModified = false;
    }
    getLiveBoxVolume() {
        return this._volumes.find((volume)=>volume.groupId === LIVE_BOX_GROUP_ID && 'box' === volume.type) ?? null;
    }
    restoreDraftBoxFromLiveVolume() {
        const liveBox = this.getLiveBoxVolume();
        if (!liveBox) return false;
        this.applyMatrixToDraftBox(liveBox.matrix);
        this.draftBoxSeedSource = 'pointcloud';
        this.draftBoxWasUserModified = true;
        return true;
    }
    syncDraftBoxMatrix() {
        if ('box3d' !== this._selectionMode) return;
        if (null === this.draftBoxMatrix && null === this.draftBoxSeedSource) return;
        this.draftBoxAnchor.scale.x = Math.max(this.draftBoxAnchor.scale.x, MIN_BOX_EDGE);
        this.draftBoxAnchor.scale.y = Math.max(this.draftBoxAnchor.scale.y, MIN_BOX_EDGE);
        this.draftBoxAnchor.scale.z = Math.max(this.draftBoxAnchor.scale.z, MIN_BOX_EDGE);
        this.draftBoxAnchor.updateMatrix();
        this.draftBoxAnchor.updateMatrixWorld(true);
        this.draftBoxMatrix = this.draftBoxAnchor.matrixWorld.clone();
        this.syncLiveBoxVolume();
    }
    syncLiveBoxVolume() {
        if (!this._active || 'box3d' !== this._selectionMode || !this.draftBoxMatrix) {
            this.clearLiveBoxVolume();
            return;
        }
        const liveVolume = {
            type: 'box',
            matrix: this.draftBoxMatrix.clone(),
            clipTask: __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.ClipTask.SHOW_INSIDE,
            groupId: LIVE_BOX_GROUP_ID,
            selectionMode: 'box3d'
        };
        this._volumes = this._volumes.filter((volume)=>volume.groupId !== LIVE_BOX_GROUP_ID);
        this._volumes.push(liveVolume);
    }
    clearLiveBoxVolume() {
        this._volumes = this._volumes.filter((volume)=>volume.groupId !== LIVE_BOX_GROUP_ID);
    }
    ensureBoxGizmo() {
        if (!this.currentCamera || this.boxGizmo || 'box3d' !== this._selectionMode) return;
        this.boxGizmo = new __WEBPACK_EXTERNAL_MODULE__BoxTransformGizmo_js_cf06727f__.BoxTransformGizmo({
            minBoxEdge: MIN_BOX_EDGE,
            onChange: ()=>{
                this.draftBoxWasUserModified = true;
                this.syncDraftBoxMatrix();
                this.emitChanged();
            },
            onFocus: (axis)=>{
                this.focusCameraOnDraftBox(axis);
            },
            onInteractingChanged: ()=>{
                this.syncControlLock();
            }
        });
        this.boxGizmo.attach(this.draftBoxAnchor);
        this.boxGizmo.setCamera(this.currentCamera);
    }
    disposeBoxGizmo() {
        if (!this.boxGizmo) return;
        this.boxGizmo.detach();
        this.boxGizmo.dispose();
        this.boxGizmo = null;
    }
    resolveActiveViewCamera() {
        return (0, __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__.getActiveViewCamera)(this.viewRegistry);
    }
    resolveActiveViewId() {
        return (0, __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__.getActiveViewId)(this.viewRegistry);
    }
    focusCameraOnDraftBox(localAxis) {
        this.draftBoxAnchor.updateWorldMatrix(true, false);
        const matrixWorld = this.draftBoxAnchor.matrixWorld;
        const elements = matrixWorld.elements;
        const center = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().setFromMatrixPosition(matrixWorld);
        const axisWorld = localAxis.clone().transformDirection(matrixWorld);
        const viewDirection = axisWorld.clone().negate();
        let up = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 1).transformDirection(matrixWorld);
        if (Math.abs(up.dot(viewDirection)) > 0.999) up = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 1, 0).transformDirection(matrixWorld);
        up.addScaledVector(viewDirection, -up.dot(viewDirection)).normalize();
        const distance = this.resolveFocusDistance(elements, viewDirection, up);
        const position = center.clone();
        const worldUpAlignment = axisWorld.dot(FOCUS_WORLD_UP);
        if (Math.abs(worldUpAlignment) > 0.999) {
            const lateral = Math.max(distance * FOCUS_POLE_OFFSET_RATIO, __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.EPSILON);
            const axial = Math.sqrt(Math.max(distance * distance - lateral * lateral, 0));
            position.addScaledVector(axisWorld, axial).addScaledVector(up, -Math.sign(worldUpAlignment) * lateral);
        } else position.addScaledVector(axisWorld, distance);
        this.cameraRig.animateTo({
            position,
            target: center,
            up
        }, {
            duration: 500,
            easing: 'quarticOut'
        });
    }
    resolveFocusDistance(matrixElements, viewDirection, up) {
        const worldAxes = [
            new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(matrixElements[0], matrixElements[1], matrixElements[2]),
            new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(matrixElements[4], matrixElements[5], matrixElements[6]),
            new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(matrixElements[8], matrixElements[9], matrixElements[10])
        ];
        const maxEdge = Math.max(...worldAxes.map((axis)=>axis.length()));
        const fallbackDistance = 2 * maxEdge;
        const camera = this.currentCamera;
        const halfAxes = worldAxes.map((axis)=>axis.multiplyScalar(0.5));
        const right = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().crossVectors(viewDirection, up).normalize();
        const projectedHalfExtent = (direction)=>halfAxes.reduce((sum, axis)=>sum + Math.abs(axis.dot(direction)), 0);
        const halfDepth = projectedHalfExtent(viewDirection);
        const halfHeight = projectedHalfExtent(up);
        const halfWidth = projectedHalfExtent(right);
        if (camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.OrthographicCamera) {
            const viewportHeight = Math.max(Math.abs(camera.top - camera.bottom), 1e-6);
            const aspect = Math.max(Math.abs(camera.right - camera.left) / viewportHeight, 1e-6);
            const tanHalfVerticalFov = Math.max(Math.tan(__WEBPACK_EXTERNAL_MODULE_three__.MathUtils.degToRad(this.cameraRig.fov) / 2) / Math.max(this.cameraRig.zoom, 1e-6), 1e-6);
            const tanHalfHorizontalFov = tanHalfVerticalFov * aspect;
            const projectedFit = Math.max(halfHeight / tanHalfVerticalFov, halfWidth / tanHalfHorizontalFov);
            const distance = Math.max(fallbackDistance, projectedFit * FOCUS_VIEW_PADDING);
            return Number.isFinite(distance) && distance > 0 ? distance : fallbackDistance;
        }
        if (!(camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.PerspectiveCamera)) return fallbackDistance;
        const tanHalfVerticalFov = Math.max(Math.tan(__WEBPACK_EXTERNAL_MODULE_three__.MathUtils.degToRad(camera.getEffectiveFOV()) / 2), 1e-6);
        const tanHalfHorizontalFov = tanHalfVerticalFov * Math.max(camera.aspect, 1e-6);
        const projectedFit = Math.max(halfHeight / tanHalfVerticalFov, halfWidth / tanHalfHorizontalFov);
        const distance = halfDepth + projectedFit * FOCUS_VIEW_PADDING;
        return Number.isFinite(distance) && distance > 0 ? distance : fallbackDistance;
    }
    reattachDraftBoxAnchor(viewId) {
        const toolsRoot = (0, __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__.getViewToolsRoot)(this.context, this.viewRegistry, viewId);
        if (this.draftBoxAnchor.parent === toolsRoot) return;
        this.draftBoxAnchor.removeFromParent();
        toolsRoot.add(this.draftBoxAnchor);
    }
    addConfirmedVolume(volume) {
        this.normalizeVolume(volume);
        this._volumes.push(volume);
    }
    allocateConfirmedGroupId() {
        this.confirmedGroupCount += 1;
        return `${CONFIRMED_GROUP_PREFIX}-${this.confirmedGroupCount}`;
    }
    syncControlLock() {
        if (!this.controlManager) return;
        const shouldLock = this._active && ('box3d' !== this._selectionMode && this._draftPoints.length > 0 || this.boxGizmo?.isInteracting === true);
        const activeController = this.controlManager.activeController;
        if (shouldLock) {
            if (activeController && this.lockedController !== activeController) {
                this.releaseControlLock();
                this.lockedController = activeController;
                this.lockedControllerWasEnabled = activeController.enabled;
            }
            if (this.lockedController?.enabled) this.lockedController.enabled = false;
            return;
        }
        this.releaseControlLock();
    }
    releaseControlLock() {
        if (!this.lockedController) return;
        this.lockedController.enabled = this.lockedControllerWasEnabled;
        this.lockedController = null;
        this.lockedControllerWasEnabled = false;
    }
    emitChanged() {
        this.syncControlLock();
        const nextVolumes = this.volumes;
        for (const callback of Array.from(this.listeners))try {
            callback(nextVolumes);
        } catch (error) {
            log.error('ClipService.onChanged callback error: ' + (error instanceof Error ? error.message : String(error)));
        }
        if (this.context?.events) this.context.events.emit('tool.resultChanged', {
            name: this.name,
            data: {
                selectionMode: this._selectionMode,
                clipMode: this._clipApplyMode,
                volumeCount: nextVolumes.length,
                canConfirm: this.canConfirmDraft()
            }
        });
    }
    normalizeVolume(volume) {
        volume.matrix = volume.matrix.clone();
        volume.vertices = volume.vertices ? clonePoints(volume.vertices) : void 0;
        volume.viewMatrix = volume.viewMatrix?.clone();
        volume.projMatrix = volume.projMatrix?.clone();
        volume.aabb = volume.aabb ? {
            min: volume.aabb.min.clone(),
            max: volume.aabb.max.clone()
        } : void 0;
    }
    validateToken(token) {
        if (token !== this.activationToken) throw new Error('ClipPlugin: 非法的 ActivationToken，操作被拒绝');
    }
    constructor(){
        this.name = 'clip';
        this.priority = 50;
        this.group = 'default';
        this.dependencies = [
            'InputRouter',
            'CameraRig'
        ];
        this.provides = [
            'ClipService'
        ];
        this._active = false;
        this.activationToken = null;
        this.controlManager = null;
        this.currentCamera = null;
        this.viewRegistry = null;
        this._volumes = [];
        this.listeners = new Set();
        this.previewSelectionVolumes = [];
        this.confirmedGroupCount = 0;
        this.lockedController = null;
        this.lockedControllerWasEnabled = false;
        this._selectionMode = 'polygon';
        this._clipApplyMode = 'inside';
        this._draftPoints = [];
        this._draftPreviewPoint = null;
        this.pendingPointer = null;
        this.draftBoxAnchor = new __WEBPACK_EXTERNAL_MODULE_three__.Object3D();
        this.draftBoxMatrix = null;
        this.draftBoxSeedSource = null;
        this.draftBoxWasUserModified = false;
        this.boxGizmo = null;
        this.onContextMenu = (event)=>{
            if (!this._active || 'box3d' === this._selectionMode) return;
            event.preventDefault();
            event.stopPropagation();
        };
        this.handleViewActivated = (event)=>{
            this.currentCamera = this.resolveActiveViewCamera();
            this.reattachDraftBoxAnchor(event.viewId);
            if (this.currentCamera) this.boxGizmo?.setCamera(this.currentCamera);
            if (event.previousViewId && event.previousViewId !== event.viewId && 'box3d' !== this._selectionMode) {
                const hadDraft = this._draftPoints.length > 0 || null !== this._draftPreviewPoint || this.previewSelectionVolumes.length > 0;
                this.pendingPointer = null;
                if (hadDraft) {
                    this._draftPoints = [];
                    this._draftPreviewPoint = null;
                    this.previewSelectionVolumes = [];
                    this.emitChanged();
                    return;
                }
            }
            this.syncControlLock();
        };
        this.consumer = {
            name: 'clip',
            priority: 100,
            onPointerDown: (event)=>this.handlePointerDown(event),
            onPointerMove: (event)=>this.handlePointerMove(event),
            onPointerUp: (event)=>this.handlePointerUp(event)
        };
    }
}
const ClipPlugin_rslib_entry_ = ClipPlugin;
export { ClipPlugin, ClipPlugin_rslib_entry_ as default };
