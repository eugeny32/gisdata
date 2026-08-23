import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
class SceneGraphService {
    constructor(){
        this.roots = new Map();
        this.viewHelperRoots = new Map();
        this.mainScene = new __WEBPACK_EXTERNAL_MODULE_three__.Scene();
        this.overlayScene = new __WEBPACK_EXTERNAL_MODULE_three__.Scene();
        this.pointCloudRoot = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
        this.pointCloudRoot.name = 'pointCloudRoot';
        this.gaussianSplatRoot = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
        this.gaussianSplatRoot.name = 'gaussianSplatRoot';
        this.cadRoot = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
        this.cadRoot.name = 'cadRoot';
        this.toolsRoot = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
        this.toolsRoot.name = 'toolsRoot';
        this.overlayRoot = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
        this.overlayRoot.name = 'overlayRoot';
        this.debugRoot = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
        this.debugRoot.name = 'debugRoot';
        this.mainScene.add(this.pointCloudRoot, this.gaussianSplatRoot, this.cadRoot, this.toolsRoot, this.debugRoot);
        this.overlayScene.add(this.overlayRoot);
        this.roots.set('pointCloud', this.pointCloudRoot);
        this.roots.set('gaussian-splat', this.gaussianSplatRoot);
        this.roots.set('cad', this.cadRoot);
    }
    getRootForKind(kind) {
        const root = this.roots.get(kind);
        if (!root) throw new Error(`未知的 AssetKind: "${kind}"，请先调用 registerRoot 注册`);
        return root;
    }
    setBackground(color) {
        this.mainScene.background = color;
    }
    registerRoot(kind) {
        if (!kind || !kind.trim()) throw new Error('SceneGraphService: kind 不能为空');
        const existing = this.roots.get(kind);
        if (existing) return existing;
        const group = new __WEBPACK_EXTERNAL_MODULE_three__.Group();
        group.name = `${kind}Root`;
        this.mainScene.add(group);
        this.roots.set(kind, group);
        return group;
    }
    getRoot(kind) {
        return this.roots.get(kind);
    }
    createViewHelperRoots(viewId) {
        if (!viewId.trim()) throw new Error('SceneGraphService: viewId 不能为空');
        const existing = this.viewHelperRoots.get(viewId);
        if (existing) return existing;
        const helperRoots = {
            toolsRoot: new __WEBPACK_EXTERNAL_MODULE_three__.Group(),
            overlayRoot: new __WEBPACK_EXTERNAL_MODULE_three__.Group(),
            debugRoot: new __WEBPACK_EXTERNAL_MODULE_three__.Group()
        };
        helperRoots.toolsRoot.name = `toolsRoot/view:${viewId}`;
        helperRoots.overlayRoot.name = `overlayRoot/view:${viewId}`;
        helperRoots.debugRoot.name = `debugRoot/view:${viewId}`;
        this.toolsRoot.add(helperRoots.toolsRoot);
        this.overlayRoot.add(helperRoots.overlayRoot);
        this.debugRoot.add(helperRoots.debugRoot);
        this.viewHelperRoots.set(viewId, helperRoots);
        return helperRoots;
    }
    getViewHelperRoots(viewId) {
        return this.viewHelperRoots.get(viewId);
    }
    removeViewHelperRoots(viewId) {
        const roots = this.viewHelperRoots.get(viewId);
        if (!roots) return false;
        roots.toolsRoot.clear();
        roots.overlayRoot.clear();
        roots.debugRoot.clear();
        roots.toolsRoot.removeFromParent();
        roots.overlayRoot.removeFromParent();
        roots.debugRoot.removeFromParent();
        this.viewHelperRoots.delete(viewId);
        return true;
    }
    dispose() {
        for (const viewId of Array.from(this.viewHelperRoots.keys()))this.removeViewHelperRoots(viewId);
        while(this.mainScene.children.length > 0)this.mainScene.remove(this.mainScene.children[0]);
        while(this.overlayScene.children.length > 0)this.overlayScene.remove(this.overlayScene.children[0]);
        this.roots.clear();
    }
}
export { SceneGraphService };
