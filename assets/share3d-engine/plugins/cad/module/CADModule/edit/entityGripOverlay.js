import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__common_setting_js_85f066cc__ from "../../common/setting.js";
class EntityGripOverlay {
    constructor(controller, viewManager){
        this.controller = controller;
        this.viewManager = viewManager;
        this.group = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
        this.geometry = new __WEBPACK_EXTERNAL_MODULE_three__.PlaneGeometry(2, 2);
        this.gripMeshMap = new Map();
        this.hoverGripId = null;
        this.activeGripId = null;
        this.viewManager.attachTempObject(this.group);
    }
    setGrips(grips) {
        this.disposeMeshes();
        for (const grip of grips){
            const material = this.createMaterial(grip.id);
            const mesh = new __WEBPACK_EXTERNAL_MODULE_three__.Mesh(this.geometry, material);
            mesh.position.set(grip.point.x, grip.point.y, 0);
            mesh.rotation.z = grip.meta?.angle ?? 0;
            mesh.userData.grip = grip;
            this.group.add(mesh);
            this.gripMeshMap.set(grip.id, mesh);
        }
        this.updateVisualState();
        this.updateScale();
    }
    setHoverGrip(gripId) {
        this.hoverGripId = gripId;
        this.updateVisualState();
    }
    setActiveGrip(gripId) {
        this.activeGripId = gripId;
        this.updateVisualState();
    }
    clear() {
        this.hoverGripId = null;
        this.activeGripId = null;
        this.setGrips([]);
    }
    updateScale() {
        const scale = this.controller.getPixelSizeInWorld(__WEBPACK_EXTERNAL_MODULE__common_setting_js_85f066cc__.Setting.gripConfig.pixelRadius);
        this.gripMeshMap.forEach((mesh)=>{
            const grip = mesh.userData.grip;
            const scaleX = grip?.meta?.scaleX ?? 1;
            const scaleY = grip?.meta?.scaleY ?? 1;
            mesh.scale.set(scale * scaleX, scale * scaleY, 1);
        });
    }
    dispose() {
        this.disposeMeshes();
        this.group.removeFromParent();
        this.geometry.dispose();
    }
    updateVisualState() {
        this.gripMeshMap.forEach((mesh, gripId)=>{
            const material = mesh.material;
            const isActive = gripId === this.activeGripId;
            const isHover = gripId === this.hoverGripId;
            material.color.setHex(isActive ? __WEBPACK_EXTERNAL_MODULE__common_setting_js_85f066cc__.Setting.gripConfig.activeColor : isHover ? __WEBPACK_EXTERNAL_MODULE__common_setting_js_85f066cc__.Setting.gripConfig.hoverColor : __WEBPACK_EXTERNAL_MODULE__common_setting_js_85f066cc__.Setting.gripConfig.color);
            material.needsUpdate = true;
        });
    }
    createMaterial(gripId) {
        return new __WEBPACK_EXTERNAL_MODULE_three__.MeshBasicMaterial({
            color: gripId === this.activeGripId ? __WEBPACK_EXTERNAL_MODULE__common_setting_js_85f066cc__.Setting.gripConfig.activeColor : __WEBPACK_EXTERNAL_MODULE__common_setting_js_85f066cc__.Setting.gripConfig.color,
            depthTest: __WEBPACK_EXTERNAL_MODULE__common_setting_js_85f066cc__.Setting.gripConfig.depthTest,
            depthWrite: __WEBPACK_EXTERNAL_MODULE__common_setting_js_85f066cc__.Setting.gripConfig.depthWrite,
            side: __WEBPACK_EXTERNAL_MODULE_three__.DoubleSide
        });
    }
    disposeMeshes() {
        this.gripMeshMap.forEach((mesh)=>{
            mesh.material.dispose();
            mesh.removeFromParent();
        });
        this.gripMeshMap.clear();
    }
}
export { EntityGripOverlay };
