import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__GSplatOctree_js_e0a6f7f9__ from "./GSplatOctree.js";
class GSplatOctreeResource {
    constructor(assetFileUrl, data, assetLoader){
        const octreeData = {
            lodLevels: data.lodLevels,
            filenames: data.filenames,
            tree: data.tree,
            environment: 'string' == typeof data.environment ? data.environment : void 0
        };
        this.octree = new __WEBPACK_EXTERNAL_MODULE__GSplatOctree_js_e0a6f7f9__.GSplatOctree(assetFileUrl, octreeData);
        this.octree.assetLoader = assetLoader;
        const bound = data.tree.bound;
        this.aabb = new __WEBPACK_EXTERNAL_MODULE_three__.Box3(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(bound.min[0], bound.min[1], bound.min[2]), new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(bound.max[0], bound.max[1], bound.max[2]));
    }
    destroy() {
        this.octree?.destroy();
        this.octree = null;
    }
}
export { GSplatOctreeResource };
