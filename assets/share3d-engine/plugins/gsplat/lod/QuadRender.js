import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
class QuadRender {
    constructor(material){
        this.segmentGeometry = null;
        this.segmentMesh = null;
        this.segmentScene = null;
        this.segmentRects = new Float32Array(0);
        this.segmentRectAttribute = null;
        this.segmentCapacity = 0;
        this.material = material;
        this.geometry = new __WEBPACK_EXTERNAL_MODULE_three__.PlaneGeometry(2, 2);
        this.geometry.boundingBox = new __WEBPACK_EXTERNAL_MODULE_three__.Box3(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(-1, -1, -1), new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1, 1, 1));
        this.geometry.boundingSphere = new __WEBPACK_EXTERNAL_MODULE_three__.Sphere(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 0), Math.SQRT2);
        this.geometry.computeBoundingSphere = ()=>{};
        this.mesh = new __WEBPACK_EXTERNAL_MODULE_three__.Mesh(this.geometry, material);
        this.mesh.frustumCulled = false;
        this.scene = new __WEBPACK_EXTERNAL_MODULE_three__.Scene();
        this.scene.add(this.mesh);
        this.camera = new __WEBPACK_EXTERNAL_MODULE_three__.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    }
    render(renderer) {
        renderer.render(this.scene, this.camera);
    }
    precompile(renderer) {
        this.ensureSegmentGeometry(1);
        const precompileRenderer = renderer;
        if ('function' == typeof precompileRenderer.compileAsync) {
            const compilePromises = [
                precompileRenderer.compileAsync(this.scene, this.camera)
            ];
            if (this.segmentScene) compilePromises.push(precompileRenderer.compileAsync(this.segmentScene, this.camera));
            return Promise.all(compilePromises).then(()=>void 0);
        }
        if ('function' == typeof precompileRenderer.compile) {
            precompileRenderer.compile(this.scene, this.camera);
            if (this.segmentScene) precompileRenderer.compile(this.segmentScene, this.camera);
        }
    }
    renderSegments(renderer, segments, targetSize) {
        if (0 === segments.length) return;
        this.ensureSegmentGeometry(segments.length);
        const targetSizeUniform = this.material.uniforms.uTargetSize;
        if (targetSizeUniform?.value instanceof __WEBPACK_EXTERNAL_MODULE_three__.Vector2) targetSizeUniform.value.set(targetSize, targetSize);
        for(let i = 0; i < segments.length; i++){
            const segment = segments[i];
            const base = 4 * i;
            this.segmentRects[base] = segment.x;
            this.segmentRects[base + 1] = segment.y;
            this.segmentRects[base + 2] = segment.width;
            this.segmentRects[base + 3] = segment.height;
        }
        if (this.segmentGeometry && this.segmentRectAttribute && this.segmentScene) {
            this.segmentGeometry.instanceCount = segments.length;
            this.segmentRectAttribute.needsUpdate = true;
            renderer.render(this.segmentScene, this.camera);
        }
    }
    ensureSegmentGeometry(requiredCapacity) {
        if (!this.segmentGeometry) {
            this.segmentGeometry = new __WEBPACK_EXTERNAL_MODULE_three__.InstancedBufferGeometry();
            this.segmentGeometry.setAttribute('position', new __WEBPACK_EXTERNAL_MODULE_three__.BufferAttribute(new Float32Array([
                -1,
                -1,
                0,
                1,
                -1,
                0,
                -1,
                1,
                0,
                1,
                1,
                0
            ]), 3));
            this.segmentGeometry.setAttribute('uv', new __WEBPACK_EXTERNAL_MODULE_three__.BufferAttribute(new Float32Array([
                0,
                0,
                1,
                0,
                0,
                1,
                1,
                1
            ]), 2));
            this.segmentGeometry.setIndex([
                0,
                1,
                2,
                2,
                1,
                3
            ]);
            this.segmentGeometry.boundingBox = new __WEBPACK_EXTERNAL_MODULE_three__.Box3(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(-1, -1, -1), new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1, 1, 1));
            this.segmentGeometry.boundingSphere = new __WEBPACK_EXTERNAL_MODULE_three__.Sphere(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 0), Math.SQRT2);
            this.segmentMesh = new __WEBPACK_EXTERNAL_MODULE_three__.Mesh(this.segmentGeometry, this.material);
            this.segmentMesh.frustumCulled = false;
            this.segmentScene = new __WEBPACK_EXTERNAL_MODULE_three__.Scene();
            this.segmentScene.add(this.segmentMesh);
        }
        if (requiredCapacity <= this.segmentCapacity) return;
        let nextCapacity = Math.max(1, this.segmentCapacity);
        while(nextCapacity < requiredCapacity)nextCapacity *= 2;
        this.segmentRects = new Float32Array(4 * nextCapacity);
        this.segmentRectAttribute = new __WEBPACK_EXTERNAL_MODULE_three__.InstancedBufferAttribute(this.segmentRects, 4);
        this.segmentRectAttribute.setUsage(__WEBPACK_EXTERNAL_MODULE_three__.DynamicDrawUsage);
        this.segmentGeometry.setAttribute('instanceRect', this.segmentRectAttribute);
        this.segmentCapacity = nextCapacity;
    }
    dispose() {
        this.geometry.dispose();
        if (this.segmentGeometry) this.segmentGeometry.dispose();
        this.material.dispose();
        this.scene.remove(this.mesh);
        if (this.segmentScene && this.segmentMesh) this.segmentScene.remove(this.segmentMesh);
    }
}
export { QuadRender };
