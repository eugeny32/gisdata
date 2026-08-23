import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__materials_CentersPointsMaterial_js_b278f5e6__ from "../materials/CentersPointsMaterial.js";
class UnifiedLODCentersPoints extends __WEBPACK_EXTERNAL_MODULE_three__.Points {
    constructor(gaussianMesh){
        const geometry = new __WEBPACK_EXTERNAL_MODULE_three__.BufferGeometry();
        geometry.setAttribute('position', new __WEBPACK_EXTERNAL_MODULE_three__.BufferAttribute(new Float32Array(3), 3));
        geometry.boundingBox = new __WEBPACK_EXTERNAL_MODULE_three__.Box3();
        geometry.boundingSphere = new __WEBPACK_EXTERNAL_MODULE_three__.Sphere();
        const material = new __WEBPACK_EXTERNAL_MODULE__materials_CentersPointsMaterial_js_b278f5e6__.CentersPointsMaterial();
        super(geometry, material), this._tempCameraPos = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(), this._tempSceneOrigin = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(), this._dummyBufferSize = 0, this.onBeforeRender = (renderer, _scene, camera)=>{
            const state = this.gaussianMesh.updateFrameState(renderer, camera, true);
            if (!state) {
                this.geometry.setDrawRange(0, 0);
                return;
            }
            const manager = state.manager;
            if (false === manager.isWorkBufferRenderable) {
                this.geometry.setDrawRange(0, 0);
                return;
            }
            this.geometry.setDrawRange(0, state.visibleSplatCount);
            if (state.visibleSplatCount > this._dummyBufferSize) {
                const newSize = Math.max(state.visibleSplatCount, 2 * this._dummyBufferSize);
                this.geometry.setAttribute('position', new __WEBPACK_EXTERNAL_MODULE_three__.BufferAttribute(new Float32Array(3 * newSize), 3));
                this._dummyBufferSize = newSize;
            }
            if (this.gaussianMesh.geometry.boundingBox) this.geometry.boundingBox.copy(this.gaussianMesh.geometry.boundingBox);
            if (this.gaussianMesh.geometry.boundingSphere) this.geometry.boundingSphere.copy(this.gaussianMesh.geometry.boundingSphere);
            this.material.setWorkBufferData(manager.splatTexture0, manager.orderTexture, state.visibleSplatCount, state.textureSize);
            this.material.setSplatStateTexture(state.mergedStateTexture);
            this.material.setViewport(state.viewportWidth, state.viewportHeight);
            this.material.setCameraParams(camera);
            const filterConfig = manager.getScalarFilterConfig();
            if (filterConfig?.enabled && manager.scalarTexture) {
                this.material.setScalarTexture(manager.scalarTexture);
                this.material.setScalarFilter(true, filterConfig.min, filterConfig.max);
            } else {
                this.material.setScalarTexture(null);
                this.material.setScalarFilter(false, 0, 1);
            }
            camera.getWorldPosition(this._tempCameraPos);
            this.material.setCameraPositionWorld(this._tempCameraPos);
            this.gaussianMesh.getSceneOrigin(this._tempSceneOrigin);
            this.material.setOriginToCamera(this._tempSceneOrigin, this._tempCameraPos);
        };
        this.gaussianMesh = gaussianMesh;
        this.renderOrder = 1001;
        this.frustumCulled = false;
        this.visible = false;
    }
    dispose() {
        this.geometry.dispose();
        this.material.dispose();
    }
}
export { UnifiedLODCentersPoints };
