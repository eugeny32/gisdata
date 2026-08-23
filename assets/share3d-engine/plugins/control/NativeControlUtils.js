import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_30373853__ from "../../shared/types/core.js";
const CAMERA_STATE_EPSILON = 1e-6;
const DEFAULT_NAVIGATION_SCALE_SCENE_RATIO = 0.002;
const DEFAULT_NAVIGATION_SCALE_ABSOLUTE_MINIMUM = 0.02;
const DEFAULT_WHEEL_MIN_STEP_RATIO = 0.05;
const DEFAULT_WHEEL_ABSOLUTE_MIN_STEP = 0.005;
const DEFAULT_WHEEL_PIXEL_STEP = 100;
const DEFAULT_WHEEL_LINE_STEP = 3;
const DEFAULT_WHEEL_INPUT_LIMIT = 1;
const WHEEL_DELTA_MODE_PIXEL = 0;
const WHEEL_DELTA_MODE_LINE = 1;
const WHEEL_DELTA_MODE_PAGE = 2;
const DEFAULT_DOUBLE_CLICK_MIN_TARGET_DISTANCE = 0.2;
function resolveWheelInputDelta(deltaY, deltaMode = WHEEL_DELTA_MODE_PIXEL, limit = DEFAULT_WHEEL_INPUT_LIMIT) {
    if (!Number.isFinite(deltaY) || 0 === deltaY) return 0;
    const safeLimit = toFinitePositive(limit);
    if (0 === safeLimit) return 0;
    let stepSize = DEFAULT_WHEEL_PIXEL_STEP;
    if (deltaMode === WHEEL_DELTA_MODE_LINE) stepSize = DEFAULT_WHEEL_LINE_STEP;
    else if (deltaMode === WHEEL_DELTA_MODE_PAGE) stepSize = 1;
    return __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.clamp(-deltaY / stepSize, -safeLimit, safeLimit);
}
function accumulateWheelInputDelta(current, input, limit = DEFAULT_WHEEL_INPUT_LIMIT) {
    const safeLimit = toFinitePositive(limit);
    if (0 === safeLimit) return 0;
    const safeCurrent = Number.isFinite(current) ? current : 0;
    const safeInput = Number.isFinite(input) ? input : 0;
    return __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.clamp(safeCurrent + safeInput, -safeLimit, safeLimit);
}
function createViewportRect(size) {
    return {
        x: 0,
        y: 0,
        width: size.width,
        height: size.height
    };
}
function resolveNavigationScale(options) {
    const sceneScaleRatio = options.sceneScaleRatio ?? DEFAULT_NAVIGATION_SCALE_SCENE_RATIO;
    const absoluteMinimum = options.absoluteMinimum ?? DEFAULT_NAVIGATION_SCALE_ABSOLUTE_MINIMUM;
    const distance = toFinitePositive(options.cameraTargetDistance);
    const sceneScale = resolveSceneBoundsScale(options.sceneBounds, sceneScaleRatio);
    return Math.max(distance, sceneScale, toFinitePositive(absoluteMinimum));
}
function resolvePickedPointWheelStep(options) {
    const zoomDelta = options.currentZoomDelta ?? new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
    const resolvedPosition = options.position.clone().add(zoomDelta);
    const wheelSign = Math.sign(options.wheelDelta);
    if (0 === wheelSign) return {
        nextPosition: resolvedPosition.clone(),
        nextTarget: options.target.clone(),
        nextZoomDelta: zoomDelta.clone(),
        nextZoomDistance: resolvedPosition.distanceTo(options.pickedPoint),
        crossedPickedPoint: false
    };
    const pickedPointDirection = resolveSafeDirection(options.pickedPoint.clone().sub(options.position), options.forward);
    const forward = resolveSafeDirection(options.forward, pickedPointDirection);
    const distanceToPickedPoint = Math.max(resolvedPosition.distanceTo(options.pickedPoint), 1e-9);
    const stepDistance = resolveWheelStepMagnitude({
        baseDistance: distanceToPickedPoint,
        wheelMagnitude: Math.abs(options.wheelDelta),
        proportionalStepRatio: options.proportionalStepRatio,
        navigationScale: options.navigationScale,
        minStepRatio: options.minStepRatio,
        absoluteMinStep: options.absoluteMinStep
    });
    const signedStep = wheelSign * stepDistance;
    const forwardDistanceToPickedPoint = options.pickedPoint.clone().sub(resolvedPosition).dot(forward);
    const crossedPickedPoint = wheelSign > 0 && (distanceToPickedPoint <= stepDistance + 1e-9 || forwardDistanceToPickedPoint <= 0);
    if (crossedPickedPoint) {
        const nextPosition = resolvedPosition.clone().addScaledVector(forward, stepDistance);
        const followDistance = Math.max(options.position.distanceTo(options.target), resolveMinimumWheelStep(options.navigationScale, options.minStepRatio, options.absoluteMinStep));
        const nextTarget = nextPosition.clone().addScaledVector(forward, followDistance);
        return {
            nextPosition,
            nextTarget,
            nextZoomDelta: new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(),
            nextZoomDistance: null,
            crossedPickedPoint: true
        };
    }
    const nextPosition = resolvedPosition.clone().addScaledVector(pickedPointDirection, signedStep);
    const nextZoomDistance = nextPosition.distanceTo(options.pickedPoint);
    return {
        nextPosition,
        nextTarget: nextPosition.clone().addScaledVector(forward, nextZoomDistance),
        nextZoomDelta: nextPosition.clone().sub(options.position),
        nextZoomDistance,
        crossedPickedPoint: false
    };
}
function resolveWheelForwardStep(options) {
    const wheelSign = Math.sign(options.wheelDelta);
    if (0 === wheelSign) return 0;
    return wheelSign * resolveWheelStepMagnitude({
        baseDistance: options.cameraTargetDistance,
        wheelMagnitude: Math.abs(options.wheelDelta),
        proportionalStepRatio: options.proportionalStepRatio,
        navigationScale: options.navigationScale,
        minStepRatio: options.minStepRatio,
        absoluteMinStep: options.absoluteMinStep
    });
}
function resolveDoubleClickWheelDelta(options) {
    const distance = options.position.distanceTo(options.pickedPoint);
    if (!Number.isFinite(distance) || distance <= 1e-9) return 0;
    const targetDistance = Math.min(distance, Math.max(resolveSurfaceHitRadius(options.hit), DEFAULT_DOUBLE_CLICK_MIN_TARGET_DISTANCE, resolveMinimumWheelStep(options.navigationScale, options.minStepRatio, options.absoluteMinStep)));
    const moveDistance = distance - targetDistance;
    if (moveDistance <= 1e-9) return 0;
    const denominator = Math.max(distance * options.proportionalStepRatio, 1e-9);
    return moveDistance / denominator;
}
function resolveDoubleClickTargetRadius(hit, navigationScale, minStepRatio, absoluteMinStep) {
    return Math.max(resolveSurfaceHitRadius(hit), DEFAULT_DOUBLE_CLICK_MIN_TARGET_DISTANCE, resolveMinimumWheelStep(navigationScale, minStepRatio, absoluteMinStep));
}
function createViewLocalPickingService(viewId, getViewRect, getViewClientRect, picking) {
    const applyViewScope = (query)=>{
        const viewRect = cloneViewportRect(getViewRect());
        return {
            ...query,
            viewId,
            viewRect,
            viewport: cloneViewportRect(viewRect)
        };
    };
    return {
        pick: (query)=>picking.pick(applyViewScope(query)),
        pickRect: (query)=>picking.pickRect(applyViewScope(query)),
        pickAtScreen: (screen, camera, options = {})=>picking.pickAtScreen(toContainerLocalScreen(screen, getViewRect(), getViewClientRect()), camera, applyViewScope(options))
    };
}
function createViewLocalSurfaceQueryService(viewId, getViewRect, getViewClientRect, picking, spatial) {
    const applyViewScope = (query)=>{
        const viewRect = cloneViewportRect(getViewRect());
        return {
            ...query,
            viewId,
            viewRect,
            viewport: cloneViewportRect(viewRect)
        };
    };
    return {
        queryAtScreen: (screen, camera, options = {})=>{
            const scopedOptions = applyViewScope(options);
            const localScreen = toContainerLocalScreen(screen, getViewRect(), getViewClientRect());
            if (spatial) {
                const spatialHit = spatial.raycastSurfaceAtScreen({
                    surfaceUsage: 'camera-control',
                    camera,
                    screen: localScreen,
                    viewId: scopedOptions.viewId,
                    viewRect: scopedOptions.viewRect,
                    viewport: scopedOptions.viewport,
                    layerMask: scopedOptions.layerMask,
                    ownerAssetId: scopedOptions.assetIds?.[0],
                    ownerKind: scopedOptions.kinds?.length === 1 ? scopedOptions.kinds[0] : void 0
                });
                if (spatialHit) return {
                    point: spatialHit.point.clone(),
                    source: 'spatial',
                    spatialHit
                };
            }
            const [pickResult] = picking.pickAtScreen(localScreen, camera, scopedOptions);
            if (!pickResult) return null;
            return {
                point: pickResult.point.clone(),
                source: 'picking',
                pickResult
            };
        }
    };
}
function getActiveManagedCamera(viewportCamera) {
    return viewportCamera.getActiveCamera();
}
function syncViewportCameraFromRig(services) {
    const viewport = services.getViewRect?.() ?? createViewportRect(services.getViewportSize());
    services.viewportCamera.syncFromRig(services.rig.getState(), services.rig.near, services.rig.far, viewport);
    return getActiveManagedCamera(services.viewportCamera);
}
function syncRigFromCamera(services, camera, target) {
    const previous = services.rig.getState();
    const position = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().copy(camera.position);
    const up = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().copy(camera.up);
    const nextState = {
        ...previous,
        position,
        target: new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().copy(target),
        up,
        fov: camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.PerspectiveCamera ? camera.fov : previous.fov,
        zoom: camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.OrthographicCamera ? camera.zoom : previous.zoom,
        mode: camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.OrthographicCamera ? __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_30373853__.CameraMode.Orthographic : __WEBPACK_EXTERNAL_MODULE__shared_types_core_js_30373853__.CameraMode.Perspective
    };
    if (isCameraStateEquivalent(previous, nextState)) return;
    services.rig.setState(nextState);
}
function isCameraStateEquivalent(a, b) {
    return a.position.distanceToSquared(b.position) <= CAMERA_STATE_EPSILON * CAMERA_STATE_EPSILON && a.target.distanceToSquared(b.target) <= CAMERA_STATE_EPSILON * CAMERA_STATE_EPSILON && a.up.distanceToSquared(b.up) <= CAMERA_STATE_EPSILON * CAMERA_STATE_EPSILON && Math.abs(a.fov - b.fov) <= CAMERA_STATE_EPSILON && Math.abs(a.zoom - b.zoom) <= CAMERA_STATE_EPSILON && a.mode === b.mode;
}
function syncRigFromDirection(services, camera, direction) {
    const distance = Math.max(services.rig.position.distanceTo(services.rig.target), 1);
    const target = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().copy(camera.position).addScaledVector(direction.clone().normalize(), distance);
    syncRigFromCamera(services, camera, target);
}
function computeRollFreeUp(forward, preferredUp = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 1)) {
    const normalizedForward = forward.clone().normalize();
    const referenceUp = preferredUp.clone().normalize();
    if (normalizedForward.lengthSq() < 1e-8) return referenceUp;
    if (Math.abs(normalizedForward.dot(referenceUp)) > 0.999) {
        referenceUp.set(0, 1, 0);
        if (Math.abs(normalizedForward.dot(referenceUp)) > 0.999) referenceUp.set(1, 0, 0);
    }
    const side = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().crossVectors(normalizedForward, referenceUp).normalize();
    return new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().crossVectors(side, normalizedForward).normalize();
}
function cloneViewportRect(rect) {
    return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height
    };
}
function resolveSurfaceHitRadius(hit) {
    return Math.max(resolvePickResultRadius(hit?.pickResult), resolveSpatialHitRadius(hit?.spatialHit));
}
function resolvePickResultRadius(result) {
    const raw = result?._raw;
    return Math.max(resolvePointCloudNodeRadius(raw?.__node ?? raw?.node), resolveGsplatInfoRadius(raw?.splatInfo));
}
function resolveSpatialHitRadius(hit) {
    const raw = hit?.raw;
    return Math.max(resolvePointCloudNodeRadius(raw?.__node ?? raw?.node), resolveGsplatInfoRadius(raw?.splatInfo));
}
function resolvePointCloudNodeRadius(node) {
    const sphere = node?.getBoundingSphere?.();
    if (!sphere || !Number.isFinite(sphere.radius) || sphere.radius <= 0) return 0;
    const worldSphere = sphere.clone();
    const matrixWorld = node?.sceneNode?.matrixWorld ?? node?.matrixWorld;
    if (matrixWorld?.isMatrix4) worldSphere.applyMatrix4(matrixWorld);
    return toFinitePositive(worldSphere.radius);
}
function resolveGsplatInfoRadius(splatInfo) {
    const box = new __WEBPACK_EXTERNAL_MODULE_three__.Box3();
    if ('function' == typeof splatInfo?.getWorldAabb && splatInfo.getWorldAabb(box) && !box.isEmpty()) return toFinitePositive(box.getBoundingSphere(new __WEBPACK_EXTERNAL_MODULE_three__.Sphere()).radius);
    const placementBox = splatInfo?.placement?.getWorldAabb?.();
    if (placementBox instanceof __WEBPACK_EXTERNAL_MODULE_three__.Box3 && !placementBox.isEmpty()) return toFinitePositive(placementBox.getBoundingSphere(new __WEBPACK_EXTERNAL_MODULE_three__.Sphere()).radius);
    return 0;
}
function toContainerLocalScreen(screen, viewRect, viewClientRect) {
    return new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(screen.x - viewClientRect.x + viewRect.x, screen.y - viewClientRect.y + viewRect.y);
}
function resolveSceneBoundsScale(sceneBounds, sceneScaleRatio) {
    if (!sceneBounds || sceneBounds.isEmpty()) return 0;
    const diagonal = sceneBounds.getSize(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3()).length();
    if (!Number.isFinite(diagonal) || diagonal <= 0) return 0;
    return diagonal * Math.max(sceneScaleRatio, 0);
}
function resolveWheelStepMagnitude(options) {
    const wheelMagnitude = toFinitePositive(options.wheelMagnitude);
    if (wheelMagnitude <= 0) return 0;
    const proportionalStep = toFinitePositive(options.baseDistance) * Math.max(options.proportionalStepRatio, 0) * wheelMagnitude;
    const minimumStep = resolveMinimumWheelStep(options.navigationScale, options.minStepRatio, options.absoluteMinStep) * wheelMagnitude;
    return Math.max(proportionalStep, minimumStep);
}
function resolveMinimumWheelStep(navigationScale, minStepRatio = DEFAULT_WHEEL_MIN_STEP_RATIO, absoluteMinStep = DEFAULT_WHEEL_ABSOLUTE_MIN_STEP) {
    return Math.max(toFinitePositive(navigationScale) * Math.max(minStepRatio, 0), toFinitePositive(absoluteMinStep));
}
function resolveSafeDirection(preferred, fallback) {
    if (preferred.lengthSq() > 1e-12) return preferred.normalize();
    if (fallback.lengthSq() > 1e-12) return fallback.clone().normalize();
    return new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 1, 0);
}
function toFinitePositive(value) {
    if (null == value || !Number.isFinite(value) || value <= 0) return 0;
    return value;
}
export { DEFAULT_NAVIGATION_SCALE_ABSOLUTE_MINIMUM, DEFAULT_NAVIGATION_SCALE_SCENE_RATIO, DEFAULT_WHEEL_ABSOLUTE_MIN_STEP, DEFAULT_WHEEL_INPUT_LIMIT, DEFAULT_WHEEL_LINE_STEP, DEFAULT_WHEEL_MIN_STEP_RATIO, DEFAULT_WHEEL_PIXEL_STEP, accumulateWheelInputDelta, computeRollFreeUp, createViewLocalPickingService, createViewLocalSurfaceQueryService, createViewportRect, getActiveManagedCamera, resolveDoubleClickTargetRadius, resolveDoubleClickWheelDelta, resolveNavigationScale, resolvePickedPointWheelStep, resolveWheelForwardStep, resolveWheelInputDelta, syncRigFromCamera, syncRigFromDirection, syncViewportCameraFromRig };
