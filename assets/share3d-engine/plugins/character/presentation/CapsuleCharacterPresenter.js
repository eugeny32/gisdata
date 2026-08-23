import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
const CAPSULE_AXIS = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 1, 0);
const DEFAULT_COLOR = '#ff9559';
const DEFAULT_OPACITY = 1.0;
class CapsuleCharacterPresenter {
    constructor(options){
        this.currentRadius = -1;
        this.currentLength = -1;
        this.object = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
        this.object.name = `characterPresenter:${options.characterId}`;
        this.material = new __WEBPACK_EXTERNAL_MODULE_three__.MeshBasicMaterial({
            color: options.color ?? DEFAULT_COLOR,
            depthTest: true,
            depthWrite: true,
            transparent: true,
            opacity: options.opacity ?? DEFAULT_OPACITY
        });
        this.mesh = new __WEBPACK_EXTERNAL_MODULE_three__.Mesh(new __WEBPACK_EXTERNAL_MODULE_three__.CapsuleGeometry(0.5, 1), this.material);
        this.mesh.name = `characterCapsule:${options.characterId}`;
        this.object.add(this.mesh);
        options.sceneRoot.add(this.object);
        this.debugObject = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
        this.debugObject.name = `characterDebug:${options.characterId}`;
        this.debugObject.visible = false;
        this.bodyArrow = new __WEBPACK_EXTERNAL_MODULE_three__.ArrowHelper(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1, 0, 0), new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(), 1, 0x42d392);
        this.aimArrow = new __WEBPACK_EXTERNAL_MODULE_three__.ArrowHelper(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1, 0, 0), new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(), 1, 0xffd166);
        this.debugObject.add(this.bodyArrow, this.aimArrow);
        options.debugRoot.add(this.debugObject);
    }
    update(frame) {
        const capsule = frame.snapshot.capsule;
        const segment = capsule.end.clone().sub(capsule.start);
        const length = Math.max(1e-4, segment.length());
        if (Math.abs(capsule.radius - this.currentRadius) > 1e-6 || Math.abs(length - this.currentLength) > 1e-6) {
            this.mesh.geometry.dispose();
            this.mesh.geometry = new __WEBPACK_EXTERNAL_MODULE_three__.CapsuleGeometry(capsule.radius, length);
            this.currentRadius = capsule.radius;
            this.currentLength = length;
        }
        const center = capsule.start.clone().add(capsule.end).multiplyScalar(0.5);
        const direction = segment.lengthSq() > Number.EPSILON ? segment.normalize() : new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 1);
        this.object.position.copy(center);
        this.object.quaternion.setFromUnitVectors(CAPSULE_AXIS, direction);
        this.debugObject.position.copy(frame.anchors.root.position);
        this.debugObject.quaternion.copy(frame.anchors.root.quaternion);
        this.bodyArrow.setDirection(frame.bodyDirection);
        this.bodyArrow.setLength(Math.max(0.75, frame.planarSpeed + 0.5));
        this.aimArrow.position.copy(frame.anchors.eye.position.clone().sub(frame.anchors.root.position));
        this.aimArrow.setDirection(frame.aimDirection);
        this.aimArrow.setLength(1.25);
    }
    setVisible(visible) {
        this.object.visible = visible;
    }
    dispose() {
        this.mesh.geometry.dispose();
        this.material.dispose();
        this.object.removeFromParent();
        this.debugObject.removeFromParent();
        this.object.clear();
        this.debugObject.clear();
    }
}
export { CapsuleCharacterPresenter };
