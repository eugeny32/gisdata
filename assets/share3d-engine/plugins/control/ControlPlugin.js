import * as __WEBPACK_EXTERNAL_MODULE__ActiveViewControlManagerFacade_js_f2e9b192__ from "./ActiveViewControlManagerFacade.js";
import * as __WEBPACK_EXTERNAL_MODULE__CameraFreeLookController_js_aef2738b__ from "./CameraFreeLookController.js";
import * as __WEBPACK_EXTERNAL_MODULE__ControlManager_js_646a8ebc__ from "./ControlManager.js";
import * as __WEBPACK_EXTERNAL_MODULE__ControlModeRegistry_js_9b97828e__ from "./ControlModeRegistry.js";
import * as __WEBPACK_EXTERNAL_MODULE__createViewScopedDomElement_js_2acef420__ from "./createViewScopedDomElement.js";
import * as __WEBPACK_EXTERNAL_MODULE__EarthController_js_34093e6c__ from "./EarthController.js";
import * as __WEBPACK_EXTERNAL_MODULE__FirstPersonController_js_b1182135__ from "./FirstPersonController.js";
import * as __WEBPACK_EXTERNAL_MODULE__FlyController_js_69c2ca18__ from "./FlyController.js";
import * as __WEBPACK_EXTERNAL_MODULE__LegacyFirstPersonController_js_afa3b708__ from "./LegacyFirstPersonController.js";
import * as __WEBPACK_EXTERNAL_MODULE__MapController_js_489d5ae6__ from "./MapController.js";
import * as __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__ from "./NativeControlUtils.js";
import * as __WEBPACK_EXTERNAL_MODULE__OrbitController_js_2ec56ec8__ from "./OrbitController.js";
import * as __WEBPACK_EXTERNAL_MODULE__SpaceMouseController_js_6aefa6f9__ from "./SpaceMouseController.js";
class ControlPlugin {
    constructor(options){
        this.name = 'control';
        this.priority = 15;
        this.dependencies = [
            'ViewRegistry',
            'CameraRig',
            'ViewportCamera',
            'PickingService',
            'RenderPipeline'
        ];
        this.provides = [
            'ControlManager',
            'ControlModeRegistry'
        ];
        this.manager = null;
        this.controlModeRegistry = null;
        this.context = null;
        this.viewRegistry = null;
        this.renderPipeline = null;
        this.pickingService = null;
        this.spatialQueryService = null;
        this.staticControlFactories = new Map();
        this.runtimeControlFactories = new Map();
        this.resources = new Map();
        this.builtInModes = new Set([
            'orbit',
            'spacemouse',
            'first-person',
            'legacy-first-person',
            'camera-free-look',
            'fly',
            'map',
            'earth'
        ]);
        this.disposed = false;
        this.handleViewCreated = (event)=>{
            const resource = this.ensureViewResource(event.viewId);
            this.attachContributors(resource.contributors);
        };
        this.handleViewRemoved = (event)=>{
            const resource = this.resources.get(event.viewId);
            if (!resource) return;
            this.detachContributors(resource.contributors);
            resource.manager.dispose();
            this.resources.delete(event.viewId);
        };
        this.handleViewActivated = (event)=>{
            const next = this.ensureViewResource(event.viewId);
            const previous = event.previousViewId ? this.resources.get(event.previousViewId) ?? null : null;
            previous?.manager.setInputActive(false);
            next.manager.setInputActive(true);
            if (!previous || previous.manager.activeMode !== next.manager.activeMode) this.context?.events.emit('controls.modeChanged', {
                mode: next.manager.activeMode,
                previous: previous?.manager.activeMode ?? next.manager.activeMode
            });
        };
        this.extraControls = options?.extraControls ?? [];
        for (const [mode, factory] of options?.extraControlFactories ?? [])this.registerStaticFactory(mode, factory);
        this.defaultMode = options?.defaultMode ?? 'orbit';
        this.cameraFreeLookSettings = options?.cameraFreeLook ?? {};
        this.defaultSpaceMouseNavigationProfile = options?.spaceMouseNavigationProfile ?? 'hybrid';
        this.spaceMousePresenceProvider = options?.spaceMousePresenceProvider ?? null;
        this.spaceMousePresencePollIntervalMs = options?.spaceMousePresencePollIntervalMs;
    }
    onInit(context) {
        this.context = context;
        this.manager = new __WEBPACK_EXTERNAL_MODULE__ActiveViewControlManagerFacade_js_f2e9b192__.ActiveViewControlManagerFacade(()=>this.getActiveManager());
        this.controlModeRegistry = new __WEBPACK_EXTERNAL_MODULE__ControlModeRegistry_js_9b97828e__.ControlModeRegistryImpl({
            registerFactory: (mode, factory)=>this.registerRuntimeFactory(mode, factory),
            unregisterFactory: (mode)=>this.unregisterRuntimeFactory(mode),
            has: (mode)=>this.hasRegisteredMode(mode),
            listModes: ()=>this.listRegisteredModes()
        });
        context.registerService('ControlManager', this.manager);
        context.registerService('ControlModeRegistry', this.controlModeRegistry);
    }
    onStart() {
        if (!this.context || !this.manager) throw new Error('ControlPlugin is not initialized');
        const container = this.context.container;
        if (!container.hasAttribute('tabindex')) container.setAttribute('tabindex', '0');
        this.viewRegistry = this.context.getService('ViewRegistry');
        this.renderPipeline = this.context.getService('RenderPipeline');
        this.pickingService = this.context.getService('PickingService');
        this.spatialQueryService = this.context.hasService('SpatialQueryService') ? this.context.getService('SpatialQueryService') : null;
        for (const view of this.viewRegistry.list()){
            const resource = this.ensureViewResource(view.id);
            this.attachContributors(resource.contributors);
        }
        this.context.events.on('view.created', this.handleViewCreated);
        this.context.events.on('view.removed', this.handleViewRemoved);
        this.context.events.on('view.activated', this.handleViewActivated);
        const activeViewId = this.viewRegistry.getActive()?.id;
        if (activeViewId) this.ensureViewResource(activeViewId).manager.setInputActive(true);
    }
    onUpdateFrame(frame) {
        this.getActiveManager().update(frame);
    }
    onDestroy() {
        if (this.disposed) return;
        this.disposed = true;
        this.context?.events.off('view.created', this.handleViewCreated);
        this.context?.events.off('view.removed', this.handleViewRemoved);
        this.context?.events.off('view.activated', this.handleViewActivated);
        for (const resource of this.resources.values())this.detachContributors(resource.contributors);
        for (const resource of this.resources.values())resource.manager.dispose();
        this.resources.clear();
        this.manager?.dispose();
        this.manager = null;
        this.controlModeRegistry?.dispose();
        this.controlModeRegistry = null;
        this.renderPipeline = null;
        this.pickingService = null;
        this.spatialQueryService = null;
        this.viewRegistry = null;
        this.runtimeControlFactories.clear();
        this.context = null;
    }
    ensureViewResource(viewId) {
        const existing = this.resources.get(viewId);
        if (existing) return existing;
        if (!this.context || !this.viewRegistry || !this.pickingService) throw new Error('ControlPlugin 依赖尚未完成初始化');
        const rig = this.viewRegistry.getExtension(viewId, 'cameraRig');
        const viewportCamera = this.viewRegistry.getExtension(viewId, 'viewportCamera');
        if (!rig || !viewportCamera) throw new Error(`View "${viewId}" 缺少相机资源，无法创建控制器`);
        const interactionElement = (0, __WEBPACK_EXTERNAL_MODULE__createViewScopedDomElement_js_2acef420__.createViewScopedDomElement)(this.context.container, ()=>this.getViewRect(viewId));
        const manager = new __WEBPACK_EXTERNAL_MODULE__ControlManager_js_646a8ebc__.ControlManagerImpl(this.context.events, interactionElement, {
            viewId,
            inputActive: this.viewRegistry.getActive()?.id === viewId
        });
        const services = this.createNativeServices(viewId, rig, viewportCamera);
        manager.register('orbit', new __WEBPACK_EXTERNAL_MODULE__OrbitController_js_2ec56ec8__.OrbitController({
            services
        }));
        const spaceMouseController = new __WEBPACK_EXTERNAL_MODULE__SpaceMouseController_js_6aefa6f9__.SpaceMouseController({
            services,
            navigationProfile: this.defaultSpaceMouseNavigationProfile,
            presenceProvider: this.spaceMousePresenceProvider ?? void 0,
            presencePollIntervalMs: this.spaceMousePresencePollIntervalMs
        });
        manager.register('spacemouse', spaceMouseController);
        manager.register('first-person', new __WEBPACK_EXTERNAL_MODULE__FirstPersonController_js_b1182135__.FirstPersonController({
            services
        }));
        manager.register('camera-free-look', new __WEBPACK_EXTERNAL_MODULE__CameraFreeLookController_js_aef2738b__.CameraFreeLookController({
            services,
            ...this.cameraFreeLookSettings
        }));
        manager.register('legacy-first-person', new __WEBPACK_EXTERNAL_MODULE__LegacyFirstPersonController_js_afa3b708__.LegacyFirstPersonController({
            services
        }));
        manager.register('fly', new __WEBPACK_EXTERNAL_MODULE__FlyController_js_69c2ca18__.FlyController({
            services
        }));
        manager.register('map', new __WEBPACK_EXTERNAL_MODULE__MapController_js_489d5ae6__.MapController({
            services
        }));
        const earthController = new __WEBPACK_EXTERNAL_MODULE__EarthController_js_34093e6c__.EarthController({
            services
        });
        manager.register('earth', earthController);
        this.registerFactories(manager, services, this.staticControlFactories);
        this.registerFactories(manager, services, this.runtimeControlFactories);
        if (viewId === this.viewRegistry.primaryViewId) for (const [mode, control] of this.extraControls)manager.register(mode, control);
        manager.setMode(this.defaultMode);
        const resource = {
            manager,
            contributors: [
                earthController,
                spaceMouseController
            ],
            services
        };
        this.resources.set(viewId, resource);
        this.viewRegistry.setExtension(viewId, 'controlManager', manager);
        return resource;
    }
    createNativeServices(viewId, rig, viewportCamera) {
        const rendererDomElement = (0, __WEBPACK_EXTERNAL_MODULE__createViewScopedDomElement_js_2acef420__.createViewScopedDomElement)(this.context.renderer.domElement, ()=>this.getViewRect(viewId));
        const getViewClientRect = ()=>{
            const rect = rendererDomElement.getBoundingClientRect();
            return {
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height
            };
        };
        const viewLocalPicking = this.pickingService ? (0, __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.createViewLocalPickingService)(viewId, ()=>this.getViewRect(viewId), getViewClientRect, this.pickingService) : void 0;
        return {
            viewId,
            rig,
            viewportCamera,
            events: this.context.events,
            rendererDomElement,
            getViewportSize: ()=>{
                const rect = this.getViewRect(viewId);
                return {
                    width: rect.width,
                    height: rect.height
                };
            },
            getViewRect: ()=>this.getViewRect(viewId),
            picking: viewLocalPicking,
            surfaceQuery: this.pickingService ? (0, __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.createViewLocalSurfaceQueryService)(viewId, ()=>this.getViewRect(viewId), getViewClientRect, this.pickingService, this.spatialQueryService ?? void 0) : void 0,
            spatial: this.spatialQueryService ?? void 0,
            getSceneBounds: (purpose = 'default')=>this.context.sceneBounds.getWorldBoundingBox({
                    purpose
                })
        };
    }
    getViewRect(viewId) {
        const rect = this.viewRegistry?.get(viewId)?.rect;
        if (rect) return rect;
        const size = this.context.getSize();
        return {
            x: 0,
            y: 0,
            width: size.width,
            height: size.height
        };
    }
    getActiveManager() {
        const activeViewId = this.viewRegistry?.getActive()?.id;
        if (activeViewId) return this.ensureViewResource(activeViewId).manager;
        const first = this.resources.values().next().value;
        if (first) return first.manager;
        throw new Error('当前没有可用的 ControlManager');
    }
    attachContributors(contributors) {
        if (!this.renderPipeline) return;
        for (const contributor of contributors)this.renderPipeline.addRenderContributor(contributor);
    }
    detachContributors(contributors) {
        if (!this.renderPipeline) return;
        for (const contributor of contributors)this.renderPipeline.removeRenderContributor(contributor);
    }
    registerFactories(manager, services, factories) {
        for (const [mode, factory] of factories)manager.register(mode, factory(services));
    }
    registerStaticFactory(mode, factory) {
        this.assertFactoryModeAvailable(mode, this.staticControlFactories);
        this.staticControlFactories.set(mode, factory);
    }
    registerRuntimeFactory(mode, factory) {
        this.assertFactoryModeAvailable(mode, this.runtimeControlFactories);
        this.runtimeControlFactories.set(mode, factory);
        for (const resource of this.resources.values())resource.manager.register(mode, factory(resource.services));
    }
    unregisterRuntimeFactory(mode) {
        if (!this.runtimeControlFactories.delete(mode)) return false;
        for (const resource of this.resources.values()){
            if (resource.manager.activeMode === mode) {
                const fallbackMode = this.defaultMode !== mode && resource.manager.getController(this.defaultMode) ? this.defaultMode : 'none';
                resource.manager.setMode(fallbackMode);
            }
            resource.manager.unregister(mode);
        }
        return true;
    }
    hasRegisteredMode(mode) {
        return this.builtInModes.has(mode) || this.staticControlFactories.has(mode) || this.runtimeControlFactories.has(mode);
    }
    listRegisteredModes() {
        return [
            ...this.builtInModes,
            ...this.staticControlFactories.keys(),
            ...this.runtimeControlFactories.keys()
        ];
    }
    assertFactoryModeAvailable(mode, target) {
        if ('none' === mode) throw new Error('ControlPlugin: "none" is reserved and cannot be registered');
        if (this.builtInModes.has(mode)) throw new Error(`ControlPlugin: "${mode}" is a built-in control mode`);
        if (this.extraControls.some(([registeredMode])=>registeredMode === mode)) throw new Error(`ControlPlugin: "${mode}" is already reserved by extraControls`);
        if (target.has(mode) || this.staticControlFactories.has(mode) || this.runtimeControlFactories.has(mode)) throw new Error(`ControlPlugin: "${mode}" is already registered`);
    }
}
export { ControlPlugin };
