import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shared_events_EventDispatcher_js_041df8a2__ from "../../../shared/events/EventDispatcher.js";
class PointCloudTreeNode extends __WEBPACK_EXTERNAL_MODULE__shared_events_EventDispatcher_js_041df8a2__.EventDispatcher {
    getChildren() {
        throw new Error('override function');
    }
    getBoundingBox() {
        throw new Error('override function');
    }
    isLoaded() {
        throw new Error('override function');
    }
    isGeometryNode() {
        throw new Error('override function');
    }
    isTreeNode() {
        throw new Error('override function');
    }
    getLevel() {
        throw new Error('override function');
    }
    getBoundingSphere() {
        throw new Error('override function');
    }
    constructor(...args){
        super(...args), this.needsTransformUpdate = true;
    }
}
class PointCloudTree extends __WEBPACK_EXTERNAL_MODULE_three__.Object3D {
    initialized() {
        return null !== this.root;
    }
}
export { PointCloudTree, PointCloudTreeNode };
