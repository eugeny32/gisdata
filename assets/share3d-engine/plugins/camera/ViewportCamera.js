import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__ from "../../shared/constants/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_30373853__ from "../../shared/types/core.js";
class ViewportCamera {
    constructor(){
        this._mode = __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_30373853__.CameraMode.Perspective;
        this.perspectiveCamera = new __WEBPACK_EXTERNAL_MODULE_three__.PerspectiveCamera();
        this.orthographicCamera = new __WEBPACK_EXTERNAL_MODULE_three__.OrthographicCamera();
    }
    getActiveCamera() {
        return this._mode === __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_30373853__.CameraMode.Perspective ? this.perspectiveCamera : this.orthographicCamera;
    }
    getPerspectiveCamera() {
        return this.perspectiveCamera;
    }
    getOrthographicCamera() {
        return this.orthographicCamera;
    }
    syncFromRig(state, near, far, viewport) {
        if (viewport.width <= 0 || viewport.height <= 0) return;
        const previousMode = this._mode;
        const modeChanged = previousMode !== state.mode;
        this._mode = state.mode;
        if (modeChanged) {
            const perspectiveState = previousMode === __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_30373853__.CameraMode.Orthographic && state.mode === __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_30373853__.CameraMode.Perspective ? this._createPerspectiveEquivalentState(state) : state;
            const orthographicZoom = previousMode === __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_30373853__.CameraMode.Perspective && state.mode === __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_30373853__.CameraMode.Orthographic ? 1 : state.zoom;
            this._syncPose(this.perspectiveCamera, perspectiveState);
            this._syncPose(this.orthographicCamera, state);
            this._syncPerspectiveProjection(perspectiveState, near, far, viewport);
            this._syncOrthographicProjection(state, near, far, viewport, orthographicZoom);
        } else if (this._mode === __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_30373853__.CameraMode.Perspective) {
            this._syncPose(this.perspectiveCamera, state);
            this._syncPerspectiveProjection(state, near, far, viewport);
        } else {
            this._syncPose(this.orthographicCamera, state);
            this._syncOrthographicProjection(state, near, far, viewport);
        }
    }
    dispose() {
        this.perspectiveCamera.removeFromParent();
        this.orthographicCamera.removeFromParent();
    }
    _syncPose(camera, state) {
        camera.position.copy(state.position);
        camera.up.copy(state.up);
        camera.lookAt(state.target);
        if ('updateMatrixWorld' in camera && 'function' == typeof camera.updateMatrixWorld) camera.updateMatrixWorld(true);
    }
    _syncPerspectiveProjection(state, near, far, viewport) {
        const cam = this.perspectiveCamera;
        cam.fov = state.fov;
        cam.aspect = viewport.width / viewport.height;
        cam.near = near;
        cam.far = far;
        cam.updateProjectionMatrix();
    }
    _syncOrthographicProjection(state, near, far, viewport, zoomOverride) {
        const cam = this.orthographicCamera;
        const safeZoom = Math.max(zoomOverride ?? state.zoom, __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.EPSILON);
        const halfHeight = this._getPerspectiveHalfHeight(state);
        const halfWidth = halfHeight * (viewport.width / viewport.height);
        cam.left = -halfWidth;
        cam.right = halfWidth;
        cam.top = halfHeight;
        cam.bottom = -halfHeight;
        cam.zoom = safeZoom;
        cam.near = near;
        cam.far = far;
        cam.userData[__WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.ORTHOGRAPHIC_EQUIVALENT_FOV_USER_DATA_KEY] = state.fov;
        cam.updateProjectionMatrix();
    }
    _getPerspectiveHalfHeight(state) {
        const distance = Math.max(state.position.distanceTo(state.target), __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.EPSILON);
        const fovRad = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.degToRad(state.fov);
        return Math.max(distance * Math.tan(fovRad / 2), __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.EPSILON);
    }
    _createPerspectiveEquivalentState(state) {
        const safeZoom = Math.max(state.zoom, __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.EPSILON);
        const offset = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().subVectors(state.position, state.target);
        if (offset.lengthSq() < __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.EPSILON_ULTRA) offset.set(0, -1, 0);
        else offset.normalize();
        const distance = Math.max(state.position.distanceTo(state.target), __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_e972c9fe__.EPSILON);
        const nextPosition = state.target.clone().addScaledVector(offset, distance / safeZoom);
        return {
            ...state,
            position: nextPosition
        };
    }
}
export { ViewportCamera };
