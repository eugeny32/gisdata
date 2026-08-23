import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__focusIconData_js_dd6b3251__ from "./focusIconData.js";
const DEFAULT_HANDLE_OPACITY = 0.4;
const ACTIVE_HANDLE_OPACITY = 1;
const SCALE_PICK_RADIUS = 4.5;
const FOCUS_ICON_SIZE = 6;
const FOCUS_PICK_RADIUS = 3;
const TRANSLATE_SHAFT_THICKNESS = 0.2;
const TRANSLATE_SHAFT_LENGTH = 40;
const TRANSLATE_OUTLINE_SCALE = 3;
const TRANSLATE_PICK_SCALE = 18;
const TRANSLATE_PICK_LENGTH_SCALE = 1.1;
const ROTATE_TORUS_RADIUS = 20;
const ROTATE_TUBE_RADIUS = 0.0075;
const ROTATE_OUTLINE_RADIUS = 0.02;
const ROTATE_PICK_TUBE_RADIUS = 0.08;
const HOVER_RELEASE_MISS_FRAMES = 3;
const HOVER_STICKY_RADIUS_PX = 10;
const FOCUS_POSITION_FACTORS = {
    'focus.x+': [
        0.5,
        0.4,
        -0.4
    ],
    'focus.x-': [
        -0.5,
        -0.4,
        -0.4
    ],
    'focus.y+': [
        -0.4,
        0.5,
        -0.4
    ],
    'focus.y-': [
        0.4,
        -0.5,
        -0.4
    ],
    'focus.z+': [
        0.4,
        0.4,
        0.5
    ],
    'focus.z-': [
        -0.4,
        0.4,
        -0.5
    ]
};
function createBoxFrame() {
    const geometry = new __WEBPACK_EXTERNAL_MODULE_three__.BufferGeometry();
    geometry.setAttribute('position', new __WEBPACK_EXTERNAL_MODULE_three__.BufferAttribute(new Float32Array([
        -0.5,
        -0.5,
        0.5,
        0.5,
        -0.5,
        0.5,
        0.5,
        -0.5,
        0.5,
        0.5,
        -0.5,
        -0.5,
        0.5,
        -0.5,
        -0.5,
        -0.5,
        -0.5,
        -0.5,
        -0.5,
        -0.5,
        -0.5,
        -0.5,
        -0.5,
        0.5,
        -0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        -0.5,
        0.5,
        0.5,
        -0.5,
        -0.5,
        0.5,
        -0.5,
        -0.5,
        0.5,
        -0.5,
        -0.5,
        0.5,
        0.5,
        -0.5,
        -0.5,
        0.5,
        -0.5,
        0.5,
        0.5,
        0.5,
        -0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        -0.5,
        -0.5,
        0.5,
        0.5,
        -0.5,
        -0.5,
        -0.5,
        -0.5,
        -0.5,
        0.5,
        -0.5
    ]), 3));
    return new __WEBPACK_EXTERNAL_MODULE_three__.LineSegments(geometry, new __WEBPACK_EXTERNAL_MODULE_three__.LineBasicMaterial({
        color: 0x0a65b9,
        depthTest: false,
        depthWrite: false,
        transparent: true,
        opacity: 0.95
    }));
}
function createScaleHandleGeometry() {
    const profile = [
        [
            0,
            1
        ],
        [
            1,
            0.5
        ],
        [
            0.7,
            0.5
        ],
        [
            0.7,
            0.2
        ],
        [
            1,
            0.2
        ],
        [
            1,
            0
        ],
        [
            0,
            0
        ]
    ].map(([x, y])=>new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(x, y));
    const geometry = new __WEBPACK_EXTERNAL_MODULE_three__.LatheGeometry(profile);
    geometry.scale(2, 4, 1);
    return geometry;
}
function createOutlineMaterial() {
    const material = new __WEBPACK_EXTERNAL_MODULE_three__.MeshBasicMaterial({
        color: 0x000000,
        side: __WEBPACK_EXTERNAL_MODULE_three__.BackSide,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        opacity: DEFAULT_HANDLE_OPACITY
    });
    material.userData.isOutlineMaterial = true;
    return material;
}
function projectedRadius(radius, camera, distance, viewportHeight) {
    if (camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.PerspectiveCamera) {
        const fov = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.degToRad(camera.fov);
        return viewportHeight * radius / (2 * distance * Math.tan(fov / 2));
    }
    if (camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.OrthographicCamera) return viewportHeight * radius * camera.zoom / Math.max(camera.top - camera.bottom, 1e-6);
    return 1;
}
function disableFrustumCulling(root) {
    root.traverse((child)=>{
        child.frustumCulled = false;
    });
}
function disposeObjectTree(root) {
    root.traverse((child)=>{
        const renderable = child;
        renderable.geometry?.dispose();
        const materials = Array.isArray(renderable.material) ? renderable.material : renderable.material ? [
            renderable.material
        ] : [];
        for (const material of materials)material.dispose();
    });
    root.removeFromParent();
}
function makeOpacitySetter(node, visualRoots, materials) {
    node.setOpacity = (value)=>{
        for (const visualRoot of visualRoots)visualRoot.visible = value > 0;
        for (const material of materials){
            material.transparent = true;
            material.depthTest = false;
            material.depthWrite = false;
            material.opacity = value;
        }
    };
}
function getAxisComponentName(axis) {
    if (Math.abs(axis.x) > 0.5) return 'x';
    if (Math.abs(axis.y) > 0.5) return 'y';
    return 'z';
}
function closestPointOnAxis(point, origin, axis) {
    return new __WEBPACK_EXTERNAL_MODULE_three__.Line3(origin, origin.clone().add(axis)).closestPointToPoint(point, false, new __WEBPACK_EXTERNAL_MODULE_three__.Vector3());
}
class BoxTransformGizmo {
    constructor(options){
        this.root = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
        this.frameRoot = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
        this.handlesRoot = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
        this.raycaster = new __WEBPACK_EXTERNAL_MODULE_three__.Raycaster();
        this.visiblePickTargets = [];
        this.pickVolumes = [];
        this.target = null;
        this.camera = null;
        this.viewportWidth = 1;
        this.viewportHeight = 1;
        this.pointerNDC = null;
        this.activeHandle = null;
        this.lastHoverHitNDC = null;
        this.hoverMissFrames = 0;
        this.dragState = null;
        this.focusPressState = null;
        this.minBoxEdge = options.minBoxEdge;
        this.onChange = options.onChange;
        this.onFocus = options.onFocus;
        this.onInteractingChanged = options.onInteractingChanged;
        this.focusTexture = new __WEBPACK_EXTERNAL_MODULE_three__.TextureLoader().load(__WEBPACK_EXTERNAL_MODULE__focusIconData_js_dd6b3251__.FOCUS_ICON_DATA_URL);
        this.root.name = 'clipBoxGizmoRoot';
        this.root.renderOrder = 10;
        this.frameRoot.name = 'clipBoxFrameRoot';
        this.handlesRoot.name = 'clipBoxHandlesRoot';
        this.root.add(this.frameRoot, this.handlesRoot);
        this.scaleHandles = {
            'scale.x+': this.createHandle('scale.x+', 'scale', new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1, 0, 0)),
            'scale.x-': this.createHandle('scale.x-', 'scale', new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(-1, 0, 0)),
            'scale.y+': this.createHandle('scale.y+', 'scale', new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 1, 0)),
            'scale.y-': this.createHandle('scale.y-', 'scale', new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, -1, 0)),
            'scale.z+': this.createHandle('scale.z+', 'scale', new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 1)),
            'scale.z-': this.createHandle('scale.z-', 'scale', new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, -1))
        };
        this.focusHandles = {
            'focus.x+': this.createHandle('focus.x+', 'focus', new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1, 0, 0)),
            'focus.x-': this.createHandle('focus.x-', 'focus', new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(-1, 0, 0)),
            'focus.y+': this.createHandle('focus.y+', 'focus', new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 1, 0)),
            'focus.y-': this.createHandle('focus.y-', 'focus', new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, -1, 0)),
            'focus.z+': this.createHandle('focus.z+', 'focus', new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 1)),
            'focus.z-': this.createHandle('focus.z-', 'focus', new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, -1))
        };
        this.translationHandles = {
            'translation.x': this.createHandle('translation.x', 'translate', new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1, 0, 0)),
            'translation.y': this.createHandle('translation.y', 'translate', new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 1, 0)),
            'translation.z': this.createHandle('translation.z', 'translate', new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 1))
        };
        this.rotationHandles = {
            'rotation.x': this.createHandle('rotation.x', 'rotate', new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1, 0, 0)),
            'rotation.y': this.createHandle('rotation.y', 'rotate', new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 1, 0)),
            'rotation.z': this.createHandle('rotation.z', 'rotate', new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 1))
        };
        this.handles = {
            ...this.scaleHandles,
            ...this.focusHandles,
            ...this.translationHandles,
            ...this.rotationHandles
        };
        this.frameRoot.add(createBoxFrame());
        this.initializeScaleHandles();
        this.initializeFocusHandles();
        this.initializeTranslationHandles();
        this.initializeRotationHandles();
        disableFrustumCulling(this.handlesRoot);
        this.setActiveHandle(null);
        this.root.visible = false;
    }
    get isDragging() {
        return null !== this.dragState;
    }
    get isInteracting() {
        return null !== this.dragState || null !== this.focusPressState;
    }
    attach(target) {
        this.target = target;
        this.root.visible = true;
        this.syncRootTransform();
        this.update();
    }
    detach() {
        this.target = null;
        this.dragState = null;
        this.focusPressState = null;
        this.root.visible = false;
        this.setActiveHandle(null);
        this.onInteractingChanged(false);
    }
    setCamera(camera) {
        this.camera = camera;
    }
    setViewport(width, height) {
        this.viewportWidth = Math.max(width, 1);
        this.viewportHeight = Math.max(height, 1);
    }
    updatePointer(ndc) {
        this.pointerNDC = ndc.clone();
    }
    update() {
        if (!this.target || !this.camera) {
            this.root.visible = false;
            this.setActiveHandle(null);
            return;
        }
        this.root.visible = true;
        this.syncRootTransform();
        this.updateHandleScale();
        this.updateRotationHandleOrientation();
        if (!this.dragState && !this.focusPressState && this.pointerNDC) this.setActiveHandle(this.resolveHoverHandle(this.pointerNDC));
    }
    handlePointerDown(event) {
        if (0 !== event.button || !this.target || !this.camera) return false;
        this.updatePointer(event.ndc);
        this.update();
        const intersection = this.pickHandleIntersection(event.ndc, this.activeHandle);
        if (!intersection) {
            if (this.activeHandle && 'focus' !== this.activeHandle.kind && this.isWithinStickyHoverRadius(event.ndc)) {
                const fallbackPoint = this.getFallbackDragStartPoint(event.ndc, this.activeHandle);
                if (fallbackPoint) {
                    this.startDrag(this.activeHandle, event.ndc, fallbackPoint);
                    return true;
                }
            }
            return false;
        }
        const handle = this.handles[String(intersection.object.userData.handleName)];
        if (!handle) return false;
        this.setActiveHandle(handle);
        if ('focus' === handle.kind) {
            this.focusPressState = {
                handle,
                cancelled: false
            };
            this.onInteractingChanged(true);
            return true;
        }
        this.startDrag(handle, event.ndc, intersection.point);
        return true;
    }
    handlePointerMove(event) {
        this.updatePointer(event.ndc);
        if (this.focusPressState) {
            const intersection = this.pickHandleIntersection(event.ndc, this.focusPressState.handle);
            const hoveredHandle = intersection ? this.getHandleFromIntersection(intersection) : null;
            if (!this.focusPressState.cancelled) this.focusPressState.cancelled = hoveredHandle !== this.focusPressState.handle;
            this.setActiveHandle(this.focusPressState.cancelled ? hoveredHandle : this.focusPressState.handle);
            return true;
        }
        if (!this.dragState) {
            const previousHandle = this.activeHandle;
            this.update();
            return this.activeHandle !== previousHandle;
        }
        this.updateDrag(event.ndc);
        return true;
    }
    handlePointerUp(event) {
        this.updatePointer(event.ndc);
        if (this.focusPressState) {
            const pressState = this.focusPressState;
            const intersection = this.pickHandleIntersection(event.ndc, pressState.handle);
            const releasedHandle = intersection ? this.getHandleFromIntersection(intersection) : null;
            const shouldFocus = 0 === event.button && event.domEvent?.type !== 'pointercancel' && !pressState.cancelled && releasedHandle === pressState.handle;
            this.focusPressState = null;
            this.onInteractingChanged(false);
            if (shouldFocus) this.onFocus(pressState.handle.axis.clone());
            this.update();
            return true;
        }
        if (!this.dragState) {
            this.update();
            return false;
        }
        this.dragState = null;
        this.onInteractingChanged(false);
        this.update();
        return true;
    }
    dispose() {
        disposeObjectTree(this.root);
        this.focusTexture.dispose();
        this.visiblePickTargets.length = 0;
        this.pickVolumes.length = 0;
        this.target = null;
        this.camera = null;
        this.activeHandle = null;
        this.lastHoverHitNDC = null;
        this.hoverMissFrames = 0;
        this.dragState = null;
        this.focusPressState = null;
    }
    createHandle(name, kind, axis) {
        return {
            name,
            kind,
            axis,
            node: new __WEBPACK_EXTERNAL_MODULE_three__.Object3D(),
            baseColor: this.getAxisColor(axis)
        };
    }
    initializeScaleHandles() {
        const geometry = createScaleHandleGeometry();
        const pickGeometry = new __WEBPACK_EXTERNAL_MODULE_three__.SphereGeometry(1, 12, 12);
        for (const handle of Object.values(this.scaleHandles)){
            const color = handle.baseColor;
            const node = handle.node;
            node.position.set(0, 0, 0);
            this.handlesRoot.add(node);
            const material = new __WEBPACK_EXTERNAL_MODULE_three__.MeshBasicMaterial({
                color,
                transparent: true,
                opacity: DEFAULT_HANDLE_OPACITY,
                depthTest: false,
                depthWrite: false
            });
            const pickMaterial = new __WEBPACK_EXTERNAL_MODULE_three__.MeshBasicMaterial({
                color,
                transparent: true,
                opacity: 0,
                depthTest: false,
                depthWrite: false
            });
            const mesh = new __WEBPACK_EXTERNAL_MODULE_three__.Mesh(geometry.clone(), material);
            mesh.scale.setScalar(1.3);
            mesh.name = `${handle.name}.handle`;
            mesh.userData.handleName = handle.name;
            node.add(mesh);
            this.visiblePickTargets.push(mesh);
            if (handle.name.includes('x+')) mesh.rotateZ(-Math.PI / 2);
            if (handle.name.includes('x-')) mesh.rotateZ(Math.PI / 2);
            if (handle.name.includes('y-')) mesh.rotateZ(Math.PI);
            if (handle.name.includes('z+')) mesh.rotateX(Math.PI / 2);
            if (handle.name.includes('z-')) mesh.rotateX(-Math.PI / 2);
            const pickMesh = new __WEBPACK_EXTERNAL_MODULE_three__.Mesh(pickGeometry.clone(), pickMaterial);
            pickMesh.name = `${handle.name}.pick`;
            pickMesh.userData.handleName = handle.name;
            pickMesh.scale.setScalar(SCALE_PICK_RADIUS);
            mesh.add(pickMesh);
            this.pickVolumes.push(pickMesh);
            makeOpacitySetter(node, [
                mesh
            ], [
                material
            ]);
        }
    }
    initializeFocusHandles() {
        const geometry = new __WEBPACK_EXTERNAL_MODULE_three__.PlaneGeometry(4, 4);
        const pickGeometry = new __WEBPACK_EXTERNAL_MODULE_three__.SphereGeometry(1, 12, 12);
        for (const handle of Object.values(this.focusHandles)){
            const color = handle.baseColor;
            const node = handle.node;
            node.lookAt(handle.axis);
            this.applyFocusHandleUprightRotation(handle);
            this.handlesRoot.add(node);
            const material = new __WEBPACK_EXTERNAL_MODULE_three__.MeshBasicMaterial({
                color,
                map: this.focusTexture,
                transparent: true,
                opacity: DEFAULT_HANDLE_OPACITY,
                depthTest: false,
                depthWrite: false
            });
            const pickMaterial = new __WEBPACK_EXTERNAL_MODULE_three__.MeshBasicMaterial({
                color,
                transparent: true,
                opacity: 0,
                depthTest: false,
                depthWrite: false
            });
            const icon = new __WEBPACK_EXTERNAL_MODULE_three__.Mesh(geometry.clone(), material);
            icon.name = `${handle.name}.handle`;
            icon.userData.handleName = handle.name;
            icon.scale.setScalar(FOCUS_ICON_SIZE / 4);
            node.add(icon);
            this.visiblePickTargets.push(icon);
            const pickMesh = new __WEBPACK_EXTERNAL_MODULE_three__.Mesh(pickGeometry.clone(), pickMaterial);
            pickMesh.name = `${handle.name}.pick`;
            pickMesh.userData.handleName = handle.name;
            pickMesh.scale.setScalar(FOCUS_PICK_RADIUS);
            icon.add(pickMesh);
            this.pickVolumes.push(pickMesh);
            makeOpacitySetter(node, [
                icon
            ], [
                material
            ]);
        }
    }
    applyFocusHandleUprightRotation(handle) {
        if ('focus.x+' === handle.name || 'focus.x-' === handle.name) {
            handle.node.rotation.z = Math.PI / 2;
            return;
        }
        if ('focus.y+' === handle.name) {
            handle.node.rotation.set(Math.PI / 2, Math.PI, 0);
            return;
        }
        if ('focus.y-' === handle.name) handle.node.rotation.set(Math.PI / 2, 0, 0);
    }
    initializeTranslationHandles() {
        const geometry = new __WEBPACK_EXTERNAL_MODULE_three__.BoxGeometry(1, 1, 1);
        const forward = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 1);
        for (const handle of Object.values(this.translationHandles)){
            const color = handle.baseColor;
            const node = handle.node;
            node.quaternion.setFromUnitVectors(forward, handle.axis.clone().normalize());
            this.handlesRoot.add(node);
            const material = new __WEBPACK_EXTERNAL_MODULE_three__.MeshBasicMaterial({
                color,
                transparent: true,
                opacity: DEFAULT_HANDLE_OPACITY,
                depthTest: false,
                depthWrite: false
            });
            const outlineMaterial = createOutlineMaterial();
            const pickMaterial = new __WEBPACK_EXTERNAL_MODULE_three__.MeshBasicMaterial({
                color,
                transparent: true,
                opacity: 0,
                depthTest: false,
                depthWrite: false
            });
            const shaft = new __WEBPACK_EXTERNAL_MODULE_three__.Mesh(geometry.clone(), material);
            shaft.name = `${handle.name}.handle`;
            shaft.userData.handleName = handle.name;
            shaft.scale.set(TRANSLATE_SHAFT_THICKNESS, TRANSLATE_SHAFT_THICKNESS, TRANSLATE_SHAFT_LENGTH);
            shaft.position.z = 0;
            shaft.renderOrder = 11;
            node.add(shaft);
            this.visiblePickTargets.push(shaft);
            const outline = new __WEBPACK_EXTERNAL_MODULE_three__.Mesh(geometry.clone(), outlineMaterial);
            outline.scale.set(TRANSLATE_OUTLINE_SCALE, TRANSLATE_OUTLINE_SCALE, 1.03);
            shaft.add(outline);
            const pickMesh = new __WEBPACK_EXTERNAL_MODULE_three__.Mesh(geometry.clone(), pickMaterial);
            pickMesh.name = `${handle.name}.pick`;
            pickMesh.userData.handleName = handle.name;
            pickMesh.scale.set(TRANSLATE_PICK_SCALE, TRANSLATE_PICK_SCALE, TRANSLATE_PICK_LENGTH_SCALE);
            shaft.add(pickMesh);
            this.pickVolumes.push(pickMesh);
            makeOpacitySetter(node, [
                shaft,
                outline
            ], [
                material,
                outlineMaterial
            ]);
        }
    }
    initializeRotationHandles() {
        const geometry = new __WEBPACK_EXTERNAL_MODULE_three__.TorusGeometry(1, ROTATE_TUBE_RADIUS, 8, 64, Math.PI / 2);
        const outlineGeometry = new __WEBPACK_EXTERNAL_MODULE_three__.TorusGeometry(1, ROTATE_OUTLINE_RADIUS, 8, 64, Math.PI / 2);
        const pickGeometry = new __WEBPACK_EXTERNAL_MODULE_three__.TorusGeometry(1, ROTATE_PICK_TUBE_RADIUS, 6, 8, Math.PI / 2);
        for (const handle of Object.values(this.rotationHandles)){
            const color = handle.baseColor;
            const node = handle.node;
            this.handlesRoot.add(node);
            const material = new __WEBPACK_EXTERNAL_MODULE_three__.MeshBasicMaterial({
                color,
                transparent: true,
                opacity: DEFAULT_HANDLE_OPACITY,
                depthTest: false,
                depthWrite: false
            });
            const outlineMaterial = createOutlineMaterial();
            const pickMaterial = new __WEBPACK_EXTERNAL_MODULE_three__.MeshBasicMaterial({
                color,
                transparent: true,
                opacity: 0,
                depthTest: false,
                depthWrite: false
            });
            const arc = new __WEBPACK_EXTERNAL_MODULE_three__.Mesh(geometry.clone(), material);
            arc.name = `${handle.name}.handle`;
            arc.userData.handleName = handle.name;
            arc.scale.setScalar(ROTATE_TORUS_RADIUS);
            arc.lookAt(handle.axis);
            arc.renderOrder = 11;
            node.add(arc);
            this.visiblePickTargets.push(arc);
            const outline = new __WEBPACK_EXTERNAL_MODULE_three__.Mesh(outlineGeometry.clone(), outlineMaterial);
            outline.renderOrder = 0;
            arc.add(outline);
            const pickMesh = new __WEBPACK_EXTERNAL_MODULE_three__.Mesh(pickGeometry.clone(), pickMaterial);
            pickMesh.name = `${handle.name}.pick`;
            pickMesh.userData.handleName = handle.name;
            arc.add(pickMesh);
            this.pickVolumes.push(pickMesh);
            makeOpacitySetter(node, [
                arc,
                outline
            ], [
                material,
                outlineMaterial
            ]);
        }
    }
    getAxisColor(axis) {
        if (Math.abs(axis.x) > 0.5) return 0xe73100;
        if (Math.abs(axis.y) > 0.5) return 0x44a24a;
        return 0x2669e7;
    }
    syncRootTransform() {
        if (!this.target) return;
        this.target.updateWorldMatrix(true, false);
        const position = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        const quaternion = new __WEBPACK_EXTERNAL_MODULE_three__.Quaternion();
        const scale = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        this.target.matrixWorld.decompose(position, quaternion, scale);
        this.frameRoot.matrixAutoUpdate = false;
        this.frameRoot.matrix.copy(this.target.matrixWorld);
        this.frameRoot.matrixWorld.copy(this.target.matrixWorld);
        this.frameRoot.updateMatrixWorld(true);
        this.handlesRoot.matrixAutoUpdate = false;
        this.handlesRoot.matrix.compose(position, quaternion, new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1, 1, 1));
        this.handlesRoot.matrixWorld.copy(this.handlesRoot.matrix);
        this.handlesRoot.updateMatrixWorld(true);
        this.updateScaleHandlePositions(scale);
        this.updateFocusHandlePositions(scale);
        this.root.matrixAutoUpdate = false;
        this.root.matrix.identity();
        this.root.matrixWorld.identity();
        this.root.updateMatrixWorld(true);
    }
    updateScaleHandlePositions(targetScale) {
        for (const handle of Object.values(this.scaleHandles)){
            const offset = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(handle.axis.x * targetScale.x * 0.5, handle.axis.y * targetScale.y * 0.5, handle.axis.z * targetScale.z * 0.5);
            handle.node.position.copy(offset);
        }
    }
    updateFocusHandlePositions(targetScale) {
        for (const handle of Object.values(this.focusHandles)){
            const factors = FOCUS_POSITION_FACTORS[handle.name];
            if (!!factors) handle.node.position.set(factors[0] * targetScale.x, factors[1] * targetScale.y, factors[2] * targetScale.z);
        }
    }
    updateHandleScale() {
        if (!this.camera) return;
        for (const handle of Object.values(this.handles)){
            const node = handle.node;
            const handlePosition = node.getWorldPosition(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3());
            const distance = Math.max(handlePosition.distanceTo(this.camera.position), 1e-6);
            const radius = projectedRadius(1, this.camera, distance, this.viewportHeight);
            const parentScale = node.parent?.getWorldScale(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3()) ?? new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1, 1, 1);
            const uniformScale = Math.max(7 / Math.max(radius, 1e-6), 1e-3);
            const nextScale = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(uniformScale, uniformScale, uniformScale).divide(parentScale);
            const rotation = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4().makeRotationFromEuler(node.rotation);
            const inverseRotation = rotation.clone().invert();
            nextScale.applyMatrix4(inverseRotation);
            nextScale.set(Math.abs(nextScale.x), Math.abs(nextScale.y), Math.abs(nextScale.z));
            node.scale.copy(nextScale);
        }
    }
    updateRotationHandleOrientation() {
        if (!this.target || !this.camera || this.dragState) return;
        const inverseRoot = this.handlesRoot.matrixWorld.clone().invert();
        const cameraObjectPosition = this.camera.getWorldPosition(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3()).applyMatrix4(inverseRoot);
        const x = this.rotationHandles['rotation.x'].node.rotation;
        const y = this.rotationHandles['rotation.y'].node.rotation;
        const z = this.rotationHandles['rotation.z'].node.rotation;
        x.order = 'ZYX';
        y.order = 'ZYX';
        const above = cameraObjectPosition.z > 0;
        const halfPi = Math.PI / 2;
        if (above) {
            if (cameraObjectPosition.x > 0 && cameraObjectPosition.y > 0) {
                x.x = halfPi;
                y.y = 3 * halfPi;
                z.z = 0;
            } else if (cameraObjectPosition.x < 0 && cameraObjectPosition.y > 0) {
                x.x = halfPi;
                y.y = 2 * halfPi;
                z.z = halfPi;
            } else if (cameraObjectPosition.x < 0 && cameraObjectPosition.y < 0) {
                x.x = 2 * halfPi;
                y.y = 2 * halfPi;
                z.z = 2 * halfPi;
            } else if (cameraObjectPosition.x > 0 && cameraObjectPosition.y < 0) {
                x.x = 2 * halfPi;
                y.y = 3 * halfPi;
                z.z = 3 * halfPi;
            }
            return;
        }
        if (cameraObjectPosition.x > 0 && cameraObjectPosition.y > 0) {
            x.x = 0;
            y.y = 0;
            z.z = 0;
        } else if (cameraObjectPosition.x < 0 && cameraObjectPosition.y > 0) {
            x.x = 0;
            y.y = halfPi;
            z.z = halfPi;
        } else if (cameraObjectPosition.x < 0 && cameraObjectPosition.y < 0) {
            x.x = 3 * halfPi;
            y.y = halfPi;
            z.z = 2 * halfPi;
        } else if (cameraObjectPosition.x > 0 && cameraObjectPosition.y < 0) {
            x.x = 3 * halfPi;
            y.y = 0;
            z.z = 3 * halfPi;
        }
    }
    resolveHoverHandle(ndc) {
        const intersections = this.pickHandleIntersections(ndc, true);
        if (intersections.length > 0) {
            this.hoverMissFrames = 0;
            this.lastHoverHitNDC = ndc.clone();
            if (this.activeHandle && this.findIntersectionForHandle(intersections, this.activeHandle)) return this.activeHandle;
            return this.getHandleFromIntersection(intersections[0]);
        }
        if (this.activeHandle) {
            if (this.isWithinStickyHoverRadius(ndc)) return this.activeHandle;
            if (this.hoverMissFrames < HOVER_RELEASE_MISS_FRAMES) {
                this.hoverMissFrames += 1;
                return this.activeHandle;
            }
        }
        this.lastHoverHitNDC = null;
        this.hoverMissFrames = 0;
        return null;
    }
    isWithinStickyHoverRadius(ndc) {
        if (!this.lastHoverHitNDC) return false;
        const dx = (ndc.x - this.lastHoverHitNDC.x) * this.viewportWidth / 2;
        const dy = (ndc.y - this.lastHoverHitNDC.y) * this.viewportHeight / 2;
        return dx * dx + dy * dy <= HOVER_STICKY_RADIUS_PX * HOVER_STICKY_RADIUS_PX;
    }
    pickHandleIntersection(ndc, preferredHandle = null) {
        const intersections = this.pickHandleIntersections(ndc);
        if (preferredHandle) {
            const preferredIntersection = this.findIntersectionForHandle(intersections, preferredHandle);
            if (preferredIntersection) return preferredIntersection;
        }
        return intersections[0] ?? null;
    }
    pickHandleIntersections(ndc, preferVisibleHandles = false) {
        if (!this.camera) return [];
        this.root.updateMatrixWorld(true);
        this.raycaster.setFromCamera(ndc, this.camera);
        const visibleIntersections = this.raycaster.intersectObjects(this.visiblePickTargets, false);
        const pickVolumeIntersections = this.raycaster.intersectObjects(this.pickVolumes, true);
        if (preferVisibleHandles && visibleIntersections.length > 0) return visibleIntersections;
        return [
            ...visibleIntersections,
            ...pickVolumeIntersections
        ];
    }
    findIntersectionForHandle(intersections, handle) {
        return intersections.find((intersection)=>this.getHandleFromIntersection(intersection) === handle) ?? null;
    }
    getHandleFromIntersection(intersection) {
        return this.handles[String(intersection.object.userData.handleName)] ?? null;
    }
    getFallbackDragStartPoint(ndc, handle) {
        if (!this.target || !this.camera) return null;
        if ('rotate' !== handle.kind) return handle.node.getWorldPosition(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3());
        const center = this.target.getWorldPosition(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3());
        const axisWorld = handle.axis.clone().transformDirection(this.target.matrixWorld).normalize();
        const plane = new __WEBPACK_EXTERNAL_MODULE_three__.Plane().setFromNormalAndCoplanarPoint(axisWorld, center);
        return this.intersectPointerPlane(ndc, plane);
    }
    startDrag(handle, ndc, intersectionPoint) {
        if (!this.target || !this.camera || 'focus' === handle.kind) return;
        const startPosition = this.target.position.clone();
        const startScale = this.target.scale.clone();
        const center = this.target.getWorldPosition(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3());
        const axisWorld = handle.axis.clone().transformDirection(this.target.matrixWorld).normalize();
        let plane;
        let pivot = intersectionPoint.clone();
        if ('rotate' === handle.kind) plane = new __WEBPACK_EXTERNAL_MODULE_three__.Plane().setFromNormalAndCoplanarPoint(axisWorld, center);
        else {
            const handleAnchor = 'scale' === handle.kind ? handle.node.getWorldPosition(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3()) : center;
            const cameraPoint = closestPointOnAxis(this.camera.position, handleAnchor, axisWorld);
            let normal = this.camera.position.clone().sub(cameraPoint);
            if (normal.lengthSq() < 1e-6) {
                normal = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 1, 0).cross(axisWorld);
                if (normal.lengthSq() < 1e-6) normal = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 1).cross(axisWorld);
            }
            plane = new __WEBPACK_EXTERNAL_MODULE_three__.Plane().setFromNormalAndCoplanarPoint(normal.normalize(), handleAnchor);
            const pointOnPlane = this.intersectPointerPlane(ndc, plane);
            pivot = pointOnPlane ? closestPointOnAxis(pointOnPlane, handleAnchor, axisWorld) : handleAnchor;
        }
        this.dragState = {
            handle,
            plane,
            pivot,
            startPivot: pivot.clone(),
            axisWorld,
            startPosition,
            startScale
        };
        this.onInteractingChanged(true);
    }
    updateDrag(ndc) {
        if (!this.dragState || !this.camera || !this.target) return;
        const pointOnPlane = this.intersectPointerPlane(ndc, this.dragState.plane);
        if (!pointOnPlane) return;
        if ('translate' === this.dragState.handle.kind) {
            this.dragTranslation(pointOnPlane);
            return;
        }
        if ('scale' === this.dragState.handle.kind) {
            this.dragScale(pointOnPlane);
            return;
        }
        this.dragRotation(pointOnPlane);
    }
    intersectPointerPlane(ndc, plane) {
        if (!this.camera) return null;
        this.raycaster.setFromCamera(ndc, this.camera);
        return this.raycaster.ray.intersectPlane(plane, new __WEBPACK_EXTERNAL_MODULE_three__.Vector3());
    }
    dragTranslation(pointOnPlane) {
        if (!this.target || !this.dragState) return;
        const nextPivot = closestPointOnAxis(pointOnPlane, this.dragState.startPivot, this.dragState.axisWorld);
        const delta = nextPivot.clone().sub(this.dragState.startPivot);
        if (delta.lengthSq() < 1e-10) return;
        this.target.position.copy(this.dragState.startPosition);
        this.applyWorldPositionDelta(delta);
        this.dragState.pivot.copy(nextPivot);
        this.notifyTargetChanged();
    }
    dragScale(pointOnPlane) {
        if (!this.target || !this.dragState) return;
        const nextPivot = closestPointOnAxis(pointOnPlane, this.dragState.startPivot, this.dragState.axisWorld);
        const axisLocal = this.dragState.handle.axis.clone().normalize();
        const delta = nextPivot.clone().sub(this.dragState.startPivot).dot(this.dragState.axisWorld);
        if (Math.abs(delta) < 1e-8) return;
        const axisName = getAxisComponentName(axisLocal);
        const startScale = this.dragState.startScale[axisName];
        const nextScale = Math.max(this.minBoxEdge, startScale + delta);
        const appliedDelta = nextScale - startScale;
        if (Math.abs(appliedDelta) < 1e-8) return;
        this.target.scale.copy(this.dragState.startScale);
        this.target.scale[axisName] = nextScale;
        this.target.position.copy(this.dragState.startPosition);
        this.applyWorldPositionDelta(this.dragState.axisWorld.clone().multiplyScalar(0.5 * appliedDelta));
        this.dragState.pivot.copy(nextPivot);
        this.notifyTargetChanged();
    }
    dragRotation(pointOnPlane) {
        if (!this.target || !this.dragState) return;
        const center = this.target.getWorldPosition(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3());
        const from = this.dragState.pivot.clone().sub(center);
        const to = pointOnPlane.clone().sub(center);
        if (from.lengthSq() < 1e-10 || to.lengthSq() < 1e-10) return;
        from.normalize();
        to.normalize();
        const dot = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.clamp(from.dot(to), -1, 1);
        let angle = Math.acos(dot);
        if (Math.abs(angle) < 1e-8) return;
        const sign = Math.sign(from.clone().cross(to).dot(this.dragState.axisWorld)) || 1;
        angle *= sign;
        this.target.rotateOnAxis(this.dragState.handle.axis.clone().normalize(), angle);
        this.dragState.pivot.copy(pointOnPlane);
        this.notifyTargetChanged();
        this.dragState.axisWorld.copy(this.dragState.handle.axis).transformDirection(this.target.matrixWorld).normalize();
        this.dragState.plane.setFromNormalAndCoplanarPoint(this.dragState.axisWorld, center);
    }
    applyWorldPositionDelta(deltaWorld) {
        if (!this.target) return;
        const parent = this.target.parent;
        if (!parent) {
            this.target.position.add(deltaWorld);
            return;
        }
        const parentQuaternion = parent.getWorldQuaternion(new __WEBPACK_EXTERNAL_MODULE_three__.Quaternion()).invert();
        const parentScale = parent.getWorldScale(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3());
        const deltaLocal = deltaWorld.clone().applyQuaternion(parentQuaternion);
        deltaLocal.divide(parentScale);
        this.target.position.add(deltaLocal);
    }
    notifyTargetChanged() {
        if (!this.target) return;
        this.target.updateMatrix();
        this.target.updateMatrixWorld(true);
        this.syncRootTransform();
        this.onChange();
    }
    setActiveHandle(handle) {
        if (this.activeHandle === handle) return;
        this.activeHandle = handle;
        for (const current of Object.values(this.handles))current.node.setOpacity?.(current === handle ? ACTIVE_HANDLE_OPACITY : DEFAULT_HANDLE_OPACITY);
    }
}
const BoxTransformGizmo_rslib_entry_ = BoxTransformGizmo;
export { BoxTransformGizmo, BoxTransformGizmo_rslib_entry_ as default };
