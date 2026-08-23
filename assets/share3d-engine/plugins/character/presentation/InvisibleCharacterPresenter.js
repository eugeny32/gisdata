import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
class InvisibleCharacterPresenter {
    constructor(options){
        this.debugObject = null;
        this.object = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
        this.object.name = `invisibleCharacterPresenter:${options.characterId}`;
        this.object.visible = false;
        options.sceneRoot.add(this.object);
    }
    update(frame) {
        this.object.position.copy(frame.anchors.root.position);
        this.object.quaternion.copy(frame.anchors.root.quaternion);
        this.object.visible = false;
    }
    setVisible(_visible) {
        this.object.visible = false;
    }
    dispose() {
        this.object.removeFromParent();
        this.object.clear();
    }
}
export { InvisibleCharacterPresenter };
