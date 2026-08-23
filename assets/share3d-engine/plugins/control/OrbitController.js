import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE_three_addons_controls_OrbitControls_js_ecfbfad4__ from "three/addons/controls/OrbitControls.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__ from "../../shared/constants/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__ from "./NativeControlUtils.js";
const ORBIT_WORLD_UP = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 1);
class OrbitController extends __WEBPACK_EXTERNAL_MODULE_three_addons_controls_OrbitControls_js_ecfbfad4__.OrbitControls {
    constructor(options){
        const camera = (0, __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.syncViewportCameraFromRig)(options.services);
        super(camera), this.services = null;
        this.services = options.services;
        this.enabled = false;
        this.enableDamping = true;
        this.dampingFactor = __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.CONTROL_DAMPING_FACTOR;
        this.screenSpacePanning = false;
        this.target.copy(options.services.rig.target);
    }
    connect(element) {
        if (!this.services) return;
        const camera = this.syncFromRig();
        this.target.copy(this.services.rig.target);
        camera.updateMatrixWorld(true);
        super.connect(element);
        super.update();
    }
    update(deltaTime) {
        if (!this.enabled || !this.services) return false;
        const camera = this.syncFromRig();
        this.target.copy(this.services.rig.target);
        if (this.services.rig.isTransitioning) {
            camera.updateMatrixWorld(true);
            return false;
        }
        const changed = super.update(deltaTime);
        camera.updateMatrixWorld(true);
        (0, __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.syncRigFromCamera)(this.services, camera, this.target);
        return changed;
    }
    syncFromRigWithoutCommit() {
        if (!this.services) return;
        const camera = this.syncFromRig();
        this.target.copy(this.services.rig.target);
        camera.updateMatrixWorld(true);
    }
    dispose() {
        if (this.domElement) super.dispose();
    }
    syncFromRig() {
        if (!this.services) return this.object;
        const camera = (0, __WEBPACK_EXTERNAL_MODULE__NativeControlUtils_js_54863792__.syncViewportCameraFromRig)(this.services);
        camera.up.copy(ORBIT_WORLD_UP);
        camera.lookAt(this.services.rig.target);
        if (this.object !== camera) this.object = camera;
        return camera;
    }
}
export { OrbitController };
