import * as __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__ from "../shared/viewScope.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_utils_index_js_26f49040__ from "../../../shared/utils/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_utils_viewRect_js_614c5b68__ from "../../../shared/utils/viewRect.js";
class AnnotationPlugin {
    onInit(context) {
        this.context = context;
        context.registerService('AnnotationService', this);
    }
    onStart() {
        this.inputRouter = this.context.getService('InputRouter');
        this.pickingService = this.context.getService('PickingService');
        this.viewRegistry = (0, __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__.getOptionalViewRegistry)(this.context);
        this.currentCamera = this.resolveActiveViewCamera();
        if (this.viewRegistry) this.context.events.on('view.activated', this.handleViewActivated);
    }
    onRenderView(frame) {
        if (!(0, __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__.isActiveViewFrame)(this.viewRegistry, frame)) return;
        this.currentCamera = this.resolveActiveViewCamera() ?? frame.camera;
        if (0 === this.annotations.size) return;
        const cameraPos = this.currentCamera.position;
        this.annotations.forEach((entry)=>{
            this.updateAnnotationVisibility(entry, cameraPos);
        });
    }
    onDestroy() {
        if (this.viewRegistry) this.context.events.off('view.activated', this.handleViewActivated);
        if (this._inserting) this._cleanupInsertion();
        this.annotations.clear();
        this.viewRegistry = null;
    }
    create(data) {
        const id = data.id || (0, __WEBPACK_EXTERNAL_MODULE__shared_utils_index_js_26f49040__.generateId)();
        const fullData = {
            ...data,
            id
        };
        const handle = {
            id,
            anchor: fullData.position.clone(),
            visible: fullData.visible ?? true
        };
        this.annotations.set(id, {
            data: fullData,
            handle
        });
        this.context.events.emit('annotation.created', {
            id
        });
        return handle;
    }
    update(id, patch) {
        const entry = this.annotations.get(id);
        if (!entry) return;
        Object.assign(entry.data, patch);
        if (patch.position) entry.handle.anchor.copy(patch.position);
        if (void 0 !== patch.visible) entry.handle.visible = patch.visible;
        this.context.events.emit('annotation.updated', {
            id
        });
    }
    remove(id) {
        const entry = this.annotations.get(id);
        if (!entry) return;
        this.annotations.delete(id);
        this.context.events.emit('annotation.removed', {
            id
        });
    }
    get(id) {
        return this.annotations.get(id)?.handle;
    }
    getAll() {
        const handles = [];
        this.annotations.forEach((e)=>handles.push(e.handle));
        return handles;
    }
    get isInserting() {
        return this._inserting;
    }
    startInsertion(data) {
        if (this._inserting) return;
        this._inserting = true;
        this._insertionData = data ?? {};
        const consumer = {
            name: 'annotation-insertion',
            priority: 100,
            onPointerMove: (event)=>{
                const results = this.pickAtActiveView(event.screen);
                if (results.length > 0) this.context.events.emit('annotation.insertionPreview', {
                    position: results[0].point.clone()
                });
                return false;
            },
            onPointerDown: (event)=>{
                if (2 === event.button) {
                    this.cancelInsertion();
                    return true;
                }
                if (0 === event.button) {
                    const results = this.pickAtActiveView(event.screen);
                    if (results.length > 0) {
                        const position = results[0].point.clone();
                        this.create({
                            position,
                            title: '',
                            content: '',
                            ...this._insertionData
                        });
                        this._finishInsertion();
                        return true;
                    }
                }
                return false;
            },
            onKeyDown: (event)=>{
                if ('Escape' === event.key) {
                    this.cancelInsertion();
                    return true;
                }
                return false;
            }
        };
        this._insertionConsumer = consumer;
        this.inputRouter.addConsumer(consumer);
        this.context.events.emit('annotation.insertionStarted', {});
    }
    cancelInsertion() {
        if (!this._inserting) return;
        this._cleanupInsertion();
        this.context.events.emit('annotation.insertionCancelled', {});
    }
    _finishInsertion() {
        this._cleanupInsertion();
        this.context.events.emit('annotation.insertionCompleted', {});
    }
    _cleanupInsertion() {
        if (this._insertionConsumer) this.inputRouter.removeConsumer(this._insertionConsumer);
        this._inserting = false;
        this._insertionData = null;
        this._insertionConsumer = null;
    }
    updateAnnotationVisibility(entry, cameraPos) {
        if (false === entry.data.visible) {
            entry.handle.visible = false;
            return;
        }
        const distance = cameraPos.distanceTo(entry.handle.anchor);
        entry.handle.visible = distance < 1000;
    }
    resolveActiveViewCamera() {
        return (0, __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__.getActiveViewCamera)(this.viewRegistry);
    }
    pickAtActiveView(screen) {
        if (!this.currentCamera) return [];
        const activeViewId = (0, __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__.getActiveViewId)(this.viewRegistry);
        const activeViewRect = (0, __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__.getActiveViewRect)(this.viewRegistry);
        const containerRect = this.context.container?.getBoundingClientRect?.();
        const scopedScreen = activeViewId || activeViewRect ? containerRect ? (0, __WEBPACK_EXTERNAL_MODULE__shared_utils_viewRect_js_614c5b68__.toViewportLocalPoint)(screen, containerRect) : screen.clone() : screen;
        return this.pickingService.pickAtScreen(scopedScreen, this.currentCamera, {
            viewId: activeViewId ?? void 0,
            viewRect: activeViewRect ?? void 0
        });
    }
    constructor(){
        this.name = 'annotation';
        this.priority = 50;
        this.dependencies = [
            'PickingService',
            'SelectionService',
            'InputRouter'
        ];
        this.provides = [
            'AnnotationService'
        ];
        this.annotations = new Map();
        this.viewRegistry = null;
        this.currentCamera = null;
        this._inserting = false;
        this._insertionData = null;
        this._insertionConsumer = null;
        this.handleViewActivated = (event)=>{
            this.currentCamera = this.resolveActiveViewCamera();
            if (event.previousViewId && event.previousViewId !== event.viewId && this._inserting) this.cancelInsertion();
        };
    }
}
const AnnotationPlugin_rslib_entry_ = AnnotationPlugin;
export { AnnotationPlugin, AnnotationPlugin_rslib_entry_ as default };
