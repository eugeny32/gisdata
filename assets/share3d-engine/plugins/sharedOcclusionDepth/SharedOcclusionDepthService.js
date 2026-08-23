import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
class SharedOcclusionDepthServiceImpl {
    constructor(onWriterChanged = null){
        this.onWriterChanged = onWriterChanged;
        this.writers = new Set();
        this.diagnosticsByView = new Map();
        this.depthScene = new __WEBPACK_EXTERNAL_MODULE_three__.Scene();
        this.depthMaterial = new __WEBPACK_EXTERNAL_MODULE_three__.MeshBasicMaterial({
            colorWrite: false,
            depthTest: true,
            depthWrite: true,
            side: __WEBPACK_EXTERNAL_MODULE_three__.DoubleSide
        });
        this.latestViewId = null;
        this.disposed = false;
        this.restorePool = [];
    }
    registerWriter(writer) {
        if (this.disposed) return {
            dispose: ()=>{}
        };
        this.writers.add(writer);
        this.onWriterChanged?.('sharedOcclusionDepth.writerChanged');
        let active = true;
        return {
            dispose: ()=>{
                if (!active) return;
                active = false;
                this.writers.delete(writer);
                this.onWriterChanged?.('sharedOcclusionDepth.writerChanged');
            }
        };
    }
    getDiagnostics(viewId) {
        const targetViewId = viewId ?? this.latestViewId;
        if (!targetViewId) return null;
        return this.diagnosticsByView.get(targetViewId) ?? null;
    }
    render(frame, context) {
        if (this.disposed) return;
        const writers = Array.from(this.writers).sort((left, right)=>(left.priority ?? 0) - (right.priority ?? 0));
        const renderablesByWriter = new Map();
        for (const writer of writers){
            const collected = collectWriterRenderables(writer, frame, context);
            if (collected.length > 0) renderablesByWriter.set(writer, collected);
        }
        const renderableCount = Array.from(renderablesByWriter.values()).reduce((total, entries)=>total + entries.length, 0);
        const diagnostics = {
            viewId: frame.viewId,
            frameNumber: frame.frameNumber,
            writerCount: renderablesByWriter.size,
            renderableCount,
            hasDepth: renderableCount > 0
        };
        this.diagnosticsByView.set(frame.viewId, diagnostics);
        this.latestViewId = frame.viewId;
        if (0 === renderableCount) return;
        const renderer = context.renderer;
        const savedState = captureRendererState(renderer);
        const attached = [];
        const previousOverrideMaterial = this.depthScene.overrideMaterial;
        try {
            renderer.setRenderTarget(context.outputTarget);
            renderer.setViewport(context.viewport.x, context.viewport.y, context.viewport.width, context.viewport.height);
            renderer.setScissor(context.viewport.x, context.viewport.y, context.viewport.width, context.viewport.height);
            renderer.setScissorTest(true);
            renderer.autoClear = false;
            for (const entries of renderablesByWriter.values())for (const entry of entries){
                const restore = this.restorePool.pop() ?? createRestoreRecord();
                attached.push(attachObject(this.depthScene, entry.object, restore));
            }
            this.depthScene.updateMatrixWorld(true);
            this.depthScene.overrideMaterial = this.depthMaterial;
            renderer.render(this.depthScene, frame.camera);
        } finally{
            this.depthScene.overrideMaterial = previousOverrideMaterial;
            const restoredRoots = new Set();
            for(let i = attached.length - 1; i >= 0; i -= 1){
                const restore = attached[i];
                restoreAttachedObject(restore);
                restoredRoots.add(restore.object);
                restore.object = null;
                restore.parent = null;
                this.restorePool.push(restore);
            }
            for (const restoredRoot of restoredRoots)restoredRoot.updateMatrixWorld(true);
            restoreRendererState(renderer, savedState);
        }
    }
    dispose() {
        if (this.disposed) return;
        this.disposed = true;
        this.writers.clear();
        this.diagnosticsByView.clear();
        this.depthScene.clear();
        this.depthMaterial.dispose();
    }
}
function createRestoreRecord() {
    return {
        object: null,
        parent: null,
        index: -1,
        matrix: new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4(),
        matrixWorld: new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4(),
        position: new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(),
        quaternion: new __WEBPACK_EXTERNAL_MODULE_three__.Quaternion(),
        scale: new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(),
        matrixAutoUpdate: true
    };
}
function attachObject(targetScene, object, restore) {
    restore.object = object;
    restore.parent = object.parent;
    restore.index = object.parent?.children.indexOf(object) ?? -1;
    object.updateMatrixWorld(true);
    restore.matrix.copy(object.matrix);
    restore.matrixWorld.copy(object.matrixWorld);
    restore.position.copy(object.position);
    restore.quaternion.copy(object.quaternion);
    restore.scale.copy(object.scale);
    restore.matrixAutoUpdate = object.matrixAutoUpdate;
    targetScene.add(object);
    object.matrixAutoUpdate = false;
    object.matrix.copy(restore.matrixWorld);
    object.matrixWorld.copy(restore.matrixWorld);
    return restore;
}
function restoreAttachedObject(restore) {
    restore.object.removeFromParent();
    if (restore.parent) {
        restore.parent.add(restore.object);
        const restoredIndex = restore.parent.children.indexOf(restore.object);
        if (restore.index >= 0 && restoredIndex >= 0 && restoredIndex !== restore.index) {
            restore.parent.children.splice(restoredIndex, 1);
            restore.parent.children.splice(Math.min(restore.index, restore.parent.children.length), 0, restore.object);
        }
    }
    restore.object.matrixAutoUpdate = restore.matrixAutoUpdate;
    restore.object.position.copy(restore.position);
    restore.object.quaternion.copy(restore.quaternion);
    restore.object.scale.copy(restore.scale);
    restore.object.matrix.copy(restore.matrix);
    restore.object.matrixWorld.copy(restore.matrixWorld);
}
function collectWriterRenderables(writer, frame, context) {
    try {
        return Array.from(writer.collect(frame, context) ?? []).filter((entry)=>entry.object.visible);
    } catch  {
        return [];
    }
}
function captureRendererState(renderer) {
    return {
        renderTarget: renderer.getRenderTarget(),
        viewport: 'function' == typeof renderer.getViewport ? renderer.getViewport(new __WEBPACK_EXTERNAL_MODULE_three__.Vector4()) : null,
        scissor: 'function' == typeof renderer.getScissor ? renderer.getScissor(new __WEBPACK_EXTERNAL_MODULE_three__.Vector4()) : null,
        scissorTest: 'function' == typeof renderer.getScissorTest ? renderer.getScissorTest() : false,
        autoClear: renderer.autoClear
    };
}
function restoreRendererState(renderer, state) {
    renderer.setRenderTarget(state.renderTarget);
    if (state.viewport) renderer.setViewport(state.viewport.x, state.viewport.y, state.viewport.z, state.viewport.w);
    if (state.scissor) renderer.setScissor(state.scissor.x, state.scissor.y, state.scissor.z, state.scissor.w);
    renderer.setScissorTest(state.scissorTest);
    renderer.autoClear = state.autoClear;
}
export { SharedOcclusionDepthServiceImpl };
