import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_utils_viewRect_js_7e8b5892__ from "../../shared/utils/viewRect.js";
const INTERACTION_PRIORITY = 9999;
const DEFAULT_THROTTLE_MS = 50;
const DRAG_THRESHOLD_PX = 5;
class InteractionPlugin {
    onInit(context) {
        this.context = context;
        this.events = context.events;
        this.service = new InteractionServiceImpl();
        context.registerService('InteractionService', this.service);
    }
    onStart() {
        this.pickingService = this.context.getService('PickingService');
        this.viewEventRouter = this.context.getService('ViewEventRouter');
        this.viewRegistry = this.context.getService('ViewRegistry');
        this.service.init(this.pickingService, this.viewRegistry, this.events, ()=>{
            const rect = this.context.container?.getBoundingClientRect?.();
            return {
                x: rect?.left ?? 0,
                y: rect?.top ?? 0,
                width: rect?.width ?? 0,
                height: rect?.height ?? 0
            };
        });
        this.consumer = {
            name: 'interaction',
            priority: INTERACTION_PRIORITY,
            onPointerDown: (event)=>{
                this.service.recordPointerDown(event);
                return false;
            },
            onPointerUp: (event)=>{
                this.service.handleClick(event);
                return false;
            },
            onPointerMove: (event)=>{
                this.service.handleMove(event);
                return false;
            }
        };
        this.viewEventRouter.addConsumer(this.consumer);
    }
    onDestroy() {
        if (this.viewEventRouter && this.consumer) this.viewEventRouter.removeConsumer(this.consumer);
        this.service?.dispose();
    }
    constructor(){
        this.name = 'interaction';
        this.priority = INTERACTION_PRIORITY;
        this.dependencies = [
            'PickingService',
            'ViewEventRouter',
            'ViewRegistry'
        ];
        this.provides = [
            'InteractionService'
        ];
    }
}
class InteractionServiceImpl {
    init(pickingService, viewRegistry, events, getContainerViewport) {
        this.pickingService = pickingService;
        this.viewRegistry = viewRegistry;
        this.events = events;
        this.getContainerViewport = getContainerViewport;
    }
    setEmitPointInfoOnClick(enabled) {
        this.clickEnabled = enabled;
    }
    setEmitPointInfoOnMove(enabled, throttleMs) {
        this.moveEnabled = enabled;
        if (void 0 !== throttleMs) this.moveThrottleMs = throttleMs;
    }
    onPointInfo(type, handler) {
        const handlers = 'click' === type ? this.clickHandlers : this.moveHandlers;
        handlers.add(handler);
        return {
            dispose: ()=>{
                handlers.delete(handler);
                if ('move' === type && 0 === this.moveHandlers.size) this.moveEnabled = false;
            }
        };
    }
    registerInteractiveScene(scene) {
        this.interactiveScenes.add(scene);
    }
    unregisterInteractiveScene(scene) {
        this.interactiveScenes.delete(scene);
    }
    raycastObjects(objects, screen) {
        const context = this.resolveViewContextAtScreen(screen);
        if (!context) return [];
        context.camera.updateMatrixWorld(true);
        const raycaster = new __WEBPACK_EXTERNAL_MODULE_three__.Raycaster();
        raycaster.layers.mask = context.view.layerMask;
        raycaster.setFromCamera(context.ndc, context.camera);
        return raycaster.intersectObjects(objects, true);
    }
    recordPointerDown(event) {
        this.downScreen = event.screen.clone();
        this.downViewId = event.viewId;
    }
    handleClick(event) {
        if (this.disposed || !this.clickEnabled) return;
        if (!this.downScreen) return;
        {
            const dx = event.screen.x - this.downScreen.x;
            const dy = event.screen.y - this.downScreen.y;
            if (dx * dx + dy * dy > DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX) {
                this.downScreen = null;
                this.downViewId = null;
                return;
            }
        }
        if (this.downViewId && this.downViewId !== event.viewId) {
            this.downScreen = null;
            this.downViewId = null;
            return;
        }
        this.downScreen = null;
        this.downViewId = null;
        const info = this.pickAt(event, 'click');
        for (const handler of this.clickHandlers)handler(info);
        this.events.emit('interaction.pointInfo.click', info);
    }
    handleMove(event) {
        if (this.disposed || !this.moveEnabled) return;
        if (event.captured) return;
        const now = performance.now();
        if (now - this.lastMoveTime < this.moveThrottleMs) return;
        this.lastMoveTime = now;
        const info = this.pickAt(event, 'move');
        for (const handler of this.moveHandlers)handler(info);
        this.events.emit('interaction.pointInfo.move', info);
    }
    dispose() {
        this.disposed = true;
        this.clickHandlers.clear();
        this.moveHandlers.clear();
        this.interactiveScenes.clear();
        this.downScreen = null;
        this.downViewId = null;
    }
    pickAt(event, interactionType) {
        const context = this.resolveViewContext(event.viewId);
        if (!context) return null;
        const { view, camera } = context;
        const mouse = {
            x: event.screen.x,
            y: event.screen.y
        };
        const pickResults = this.pickingService.pickAtScreen(event.screen, camera, {
            interactionType,
            viewId: view.id,
            viewRect: event.viewRect
        });
        let sceneHit = null;
        if (this.interactiveScenes.size > 0) {
            camera.updateMatrixWorld(true);
            const raycaster = new __WEBPACK_EXTERNAL_MODULE_three__.Raycaster();
            raycaster.layers.mask = view.layerMask;
            raycaster.setFromCamera(event.localNDC, camera);
            for (const scene of this.interactiveScenes){
                const hits = raycaster.intersectObjects(scene.children, true);
                if (hits.length > 0) {
                    if (!sceneHit || hits[0].distance < sceneHit.distance) sceneHit = hits[0];
                }
            }
        }
        const pickBest = pickResults.length > 0 ? pickResults[0] : null;
        const useSceneHit = sceneHit && (!pickBest || sceneHit.distance < pickBest.distance);
        if (useSceneHit && sceneHit) return {
            viewId: view.id,
            mouse,
            point: sceneHit.point,
            raw: sceneHit
        };
        if (pickBest) return {
            viewId: view.id,
            mouse,
            point: pickBest.point,
            pointIndex: pickBest.pointIndex,
            assetId: pickBest.assetId,
            kind: pickBest.kind,
            attributes: pickBest.attributes,
            raw: pickBest._raw
        };
        return null;
    }
    resolveViewContext(viewId) {
        const view = this.viewRegistry.get(viewId);
        if (!view || !view.visible || view.rect.width <= 0 || view.rect.height <= 0) return null;
        const viewportCamera = this.viewRegistry.getExtension(viewId, 'viewportCamera');
        const camera = viewportCamera?.getActiveCamera();
        if (!camera) return null;
        return {
            view,
            camera
        };
    }
    resolveViewContextAtScreen(screen) {
        const localScreen = (0, __WEBPACK_EXTERNAL_MODULE__shared_utils_viewRect_js_7e8b5892__.toViewportLocalPoint)(screen, this.getContainerViewport());
        const hitView = this.viewRegistry.resolveViewAtScreen(localScreen);
        const candidateView = hitView ?? this.viewRegistry.getActive();
        if (!candidateView) return null;
        const context = this.resolveViewContext(candidateView.id);
        if (!context) return null;
        const { view, camera } = context;
        return {
            view,
            camera,
            ndc: new __WEBPACK_EXTERNAL_MODULE_three__.Vector2((localScreen.x - view.rect.x) / view.rect.width * 2 - 1, -((localScreen.y - view.rect.y) / view.rect.height * 2 - 1))
        };
    }
    constructor(){
        this.clickEnabled = false;
        this.moveEnabled = false;
        this.moveThrottleMs = DEFAULT_THROTTLE_MS;
        this.lastMoveTime = 0;
        this.clickHandlers = new Set();
        this.moveHandlers = new Set();
        this.interactiveScenes = new Set();
        this.disposed = false;
        this.downScreen = null;
        this.downViewId = null;
    }
}
export { InteractionPlugin };
