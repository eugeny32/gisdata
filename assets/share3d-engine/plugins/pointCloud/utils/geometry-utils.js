import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
function computeTransformedBoundingBox(box, transform) {
    const vertices = [
        new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(box.min.x, box.min.y, box.min.z).applyMatrix4(transform),
        new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(box.min.x, box.min.y, box.min.z).applyMatrix4(transform),
        new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(box.max.x, box.min.y, box.min.z).applyMatrix4(transform),
        new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(box.min.x, box.max.y, box.min.z).applyMatrix4(transform),
        new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(box.min.x, box.min.y, box.max.z).applyMatrix4(transform),
        new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(box.min.x, box.max.y, box.max.z).applyMatrix4(transform),
        new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(box.max.x, box.max.y, box.min.z).applyMatrix4(transform),
        new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(box.max.x, box.min.y, box.max.z).applyMatrix4(transform),
        new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(box.max.x, box.max.y, box.max.z).applyMatrix4(transform)
    ];
    const boundingBox = new __WEBPACK_EXTERNAL_MODULE_three__.Box3();
    boundingBox.setFromPoints(vertices);
    return boundingBox;
}
function generateDataTexture(width, height, color) {
    const size = width * height;
    const data = new Uint8Array(4 * width * height);
    const r = Math.floor(255 * color.r);
    const g = Math.floor(255 * color.g);
    const b = Math.floor(255 * color.b);
    for(let i = 0; i < size; i++){
        data[4 * i] = r;
        data[4 * i + 1] = g;
        data[4 * i + 2] = b;
        data[4 * i + 3] = 255;
    }
    const texture = new __WEBPACK_EXTERNAL_MODULE_three__.DataTexture(data, width, height, __WEBPACK_EXTERNAL_MODULE_three__.RGBAFormat);
    texture.needsUpdate = true;
    texture.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
    texture.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
    return texture;
}
function resizeVisibleNodesTexture(requiredNodeCount, maxTextureSize, fillColor = new __WEBPACK_EXTERNAL_MODULE_three__.Color(0xffffff)) {
    const preferredWidth = 2048;
    let width = Math.min(preferredWidth, maxTextureSize);
    let height = Math.ceil(requiredNodeCount / width);
    width *= height;
    height = 1;
    if (height > maxTextureSize) return {
        success: false,
        message: `Required node count (${requiredNodeCount}) would require texture height of ${height}, but GPU only supports up to ${maxTextureSize} (width: ${width}).`
    };
    const size = width * height;
    const data = new Uint8Array(4 * size);
    const r = Math.floor(255 * fillColor.r);
    const g = Math.floor(255 * fillColor.g);
    const b = Math.floor(255 * fillColor.b);
    const a = 255;
    for(let i = 0; i < size; i++){
        const idx = 4 * i;
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = a;
    }
    const texture = new __WEBPACK_EXTERNAL_MODULE_three__.DataTexture(data, width, height, __WEBPACK_EXTERNAL_MODULE_three__.RGBAFormat, __WEBPACK_EXTERNAL_MODULE_three__.UnsignedByteType);
    texture.needsUpdate = true;
    texture.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
    texture.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
    return {
        success: true,
        texture
    };
}
function createChildAABB(aabb, index) {
    const min = aabb.min.clone();
    const max = aabb.max.clone();
    const size = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3().subVectors(max, min);
    if ((1 & index) > 0) min.z += size.z / 2;
    else max.z -= size.z / 2;
    if ((2 & index) > 0) min.y += size.y / 2;
    else max.y -= size.y / 2;
    if ((4 & index) > 0) min.x += size.x / 2;
    else max.x -= size.x / 2;
    return new __WEBPACK_EXTERNAL_MODULE_three__.Box3(min, max);
}
function createFullscreenTriangleGeometry() {
    const geometry = new __WEBPACK_EXTERNAL_MODULE_three__.BufferGeometry();
    geometry.setAttribute('position', new __WEBPACK_EXTERNAL_MODULE_three__.Float32BufferAttribute([
        -1,
        -1,
        0,
        3,
        -1,
        0,
        -1,
        3,
        0
    ], 3));
    geometry.setAttribute('uv', new __WEBPACK_EXTERNAL_MODULE_three__.Float32BufferAttribute([
        0,
        0,
        2,
        0,
        0,
        2
    ], 2));
    return geometry;
}
class ScreenPass {
    retain(renderer) {
        this.getResources(renderer).owners++;
    }
    release(renderer) {
        const resources = this.resourcesByRenderer.get(renderer);
        if (!resources) return;
        resources.owners = Math.max(resources.owners - 1, 0);
        if (0 === resources.owners) this.dispose(renderer);
    }
    render(renderer, material, target, viewport) {
        const resources = this.getResources(renderer);
        resources.quad.material = material;
        renderer.setRenderTarget(target ?? null);
        if (viewport) {
            renderer.setViewport(viewport.x, viewport.y, viewport.width, viewport.height);
            renderer.setScissor(viewport.x, viewport.y, viewport.width, viewport.height);
            renderer.setScissorTest(true);
        }
        renderer.render(resources.scene, resources.camera);
    }
    getGeometryForDiagnostics(renderer) {
        return this.getResources(renderer).quad.geometry;
    }
    dispose(renderer) {
        const resources = this.resourcesByRenderer.get(renderer);
        if (!resources) return;
        resources.quad.geometry.dispose();
        resources.quad.material = null;
        resources.scene.clear();
        this.resourcesByRenderer.delete(renderer);
    }
    getResources(renderer) {
        const existing = this.resourcesByRenderer.get(renderer);
        if (existing) return existing;
        const scene = new __WEBPACK_EXTERNAL_MODULE_three__.Scene();
        const quad = new __WEBPACK_EXTERNAL_MODULE_three__.Mesh(createFullscreenTriangleGeometry(), null);
        const resources = {
            scene,
            quad,
            camera: new __WEBPACK_EXTERNAL_MODULE_three__.Camera(),
            owners: 0
        };
        scene.add(quad);
        this.resourcesByRenderer.set(renderer, resources);
        return resources;
    }
    constructor(){
        this.resourcesByRenderer = new WeakMap();
    }
}
const screenPass = new ScreenPass();
export { computeTransformedBoundingBox, createChildAABB, generateDataTexture, resizeVisibleNodesTexture, screenPass };
