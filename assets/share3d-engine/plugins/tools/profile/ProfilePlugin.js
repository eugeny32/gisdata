import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__ from "../shared/viewScope.js";
import * as __WEBPACK_EXTERNAL_MODULE__ProfileData_js_214bf85d__ from "./ProfileData.js";
class ProfilePlugin {
    get isActive() {
        return this._active;
    }
    setActivationToken(token) {
        this.activationToken = token;
    }
    onInit(context) {
        this.context = context;
        context.registerService('ProfileService', this);
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
        this.finishCurrentProfile();
        this.currentCamera = null;
    }
    getCurrentPoints() {
        return this.currentPoints;
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
    updateProfileWidth(id, width) {
        const result = this.results.find((r)=>r.id === id);
        if (!result) return false;
        result.width = width;
        if (this.currentCamera) {
            const sectionPoints = this._sampleSectionPoints(result);
            if (sectionPoints.length > 0) result.sectionPoints = sectionPoints;
        }
        this.emitResultChanged();
        return true;
    }
    addResult(result) {
        this.results.push(result);
        this.emitResultChanged();
    }
    handlePointerDown(event) {
        if (2 === event.button) {
            this.cancelCurrentProfile();
            return true;
        }
        if (0 !== event.button) return false;
        if (!this.currentCamera) return false;
        const pickResults = this.pickingService.pickAtScreen(event.screen, this.currentCamera);
        if (pickResults.length > 0) {
            const hitPoint = pickResults[0].point;
            this.currentPoints.push({
                position: hitPoint.clone()
            });
            this.emitResultChanged();
            return true;
        }
        return false;
    }
    finishCurrentProfile() {
        if (this.currentPoints.length >= 2 && this.currentCamera) {
            const renderer = this.context.renderer;
            const size = renderer.getSize(new __WEBPACK_EXTERNAL_MODULE_three__.Vector2());
            const width = (0, __WEBPACK_EXTERNAL_MODULE__ProfileData_js_214bf85d__.computeDefaultWidth)(this.currentPoints, this.currentCamera, size.x, size.y);
            const result = (0, __WEBPACK_EXTERNAL_MODULE__ProfileData_js_214bf85d__.buildProfileResult)(this.currentPoints, width);
            const sectionPoints = this._sampleSectionPoints(result);
            if (sectionPoints.length > 0) result.sectionPoints = sectionPoints;
            this.results.push(result);
        }
        this.currentPoints = [];
        this.emitResultChanged();
    }
    cancelCurrentProfile() {
        if (0 === this.currentPoints.length) return;
        this.currentPoints = [];
        this.emitResultChanged();
    }
    _sampleSectionPoints(profile) {
        if (!this.context.hasService('PickingService')) return [];
        const picking = this.context.getService('PickingService');
        const camera = this.currentCamera;
        if (!camera) return [];
        const sectionPoints = [];
        const SAMPLE_STEP = 1;
        const points = profile.points;
        for(let i = 0; i < points.length - 1; i++){
            const start = points[i].position;
            const end = points[i + 1].position;
            const dir = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().subVectors(end, start);
            const segLen = dir.length();
            if (0 === segLen) continue;
            dir.normalize();
            const steps = Math.max(1, Math.floor(segLen / SAMPLE_STEP));
            for(let s = 0; s <= steps; s++){
                const t = s / steps;
                const samplePos = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().lerpVectors(start, end, t);
                const ray = new __WEBPACK_EXTERNAL_MODULE_three__.Ray(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(samplePos.x, samplePos.y, samplePos.z + 100), new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, -1));
                const ndc = samplePos.clone().project(camera);
                const results = picking.pick({
                    ndc: new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(ndc.x, ndc.y),
                    ray,
                    camera,
                    kinds: [
                        'pointCloud'
                    ]
                });
                if (results.length > 0) {
                    const hit = results[0];
                    const attrs = hit.attributes;
                    sectionPoints.push({
                        position: hit.point,
                        classification: attrs?.classification,
                        intensity: attrs?.intensity,
                        rgba: attrs?.rgba
                    });
                }
            }
        }
        return sectionPoints;
    }
    emitResultChanged() {
        this.context.events.emit('tool.resultChanged', {
            name: this.name,
            data: this.results
        });
    }
    validateToken(token) {
        if (token !== this.activationToken) throw new Error('ProfilePlugin: 非法的 ActivationToken，操作被拒绝');
    }
    resolveActiveViewCamera() {
        return (0, __WEBPACK_EXTERNAL_MODULE__shared_viewScope_js_67bb219e__.getActiveViewCamera)(this.viewRegistry);
    }
    constructor(){
        this.name = 'profile';
        this.priority = 50;
        this.group = 'default';
        this.dependencies = [
            'PickingService',
            'InputRouter'
        ];
        this.provides = [
            'ProfileService'
        ];
        this._active = false;
        this.activationToken = null;
        this.results = [];
        this.currentPoints = [];
        this.currentCamera = null;
        this.viewRegistry = null;
        this.handleViewActivated = (event)=>{
            this.currentCamera = this.resolveActiveViewCamera();
            if (event.previousViewId && event.previousViewId !== event.viewId) this.cancelCurrentProfile();
        };
        this.consumer = {
            name: 'profile',
            priority: 100,
            onPointerDown: (event)=>this.handlePointerDown(event),
            onPointerMove: (_event)=>false,
            onPointerUp: (_event)=>false,
            onDoubleClick: (_event)=>{
                this.finishCurrentProfile();
                return true;
            }
        };
    }
}
const ProfilePlugin_rslib_entry_ = ProfilePlugin;
export { ProfilePlugin, ProfilePlugin_rslib_entry_ as default };
