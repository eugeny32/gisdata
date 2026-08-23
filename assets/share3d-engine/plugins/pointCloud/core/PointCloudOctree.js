import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__OctreeGeometry_js_e1504a42__ from "./OctreeGeometry.js";
import * as __WEBPACK_EXTERNAL_MODULE__materials_PointCloudMaterial_js_de2c4e1f__ from "../materials/PointCloudMaterial.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_geometry_utils_js_d463fbb9__ from "../utils/geometry-utils.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__ from "../../../shared/constants/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__PointCloudTree_js_b7b70776__ from "./PointCloudTree.js";
class PointCloudOctreeNode extends __WEBPACK_EXTERNAL_MODULE__PointCloudTree_js_b7b70776__.PointCloudTreeNode {
    getNumPoints() {
        return this.geometryNode?.numPoints ?? 0;
    }
    isLoaded() {
        return this.geometryNode?.resourceState === 'resident' && null !== this.sceneNode;
    }
    isTreeNode() {
        return true;
    }
    isGeometryNode() {
        return false;
    }
    getLevel() {
        return this.geometryNode?.level ?? 0;
    }
    getBoundingSphere() {
        return this.geometryNode?.boundingSphere ?? new __WEBPACK_EXTERNAL_MODULE_three__.Sphere();
    }
    getBoundingBox() {
        return this.geometryNode?.boundingBox ?? new __WEBPACK_EXTERNAL_MODULE_three__.Box3();
    }
    getMinimumBoundingBox() {
        const metadata = this.geometryNode?.octreeGeometry?.loader?.metadata ?? null;
        const aPosition = metadata.attributes.find((a)=>'position' === a.name);
        const min = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(...aPosition.min);
        const max = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(...aPosition.max);
        const boundingBox = new __WEBPACK_EXTERNAL_MODULE_three__.Box3(min, max);
        const offset = min.clone();
        boundingBox.min.sub(offset);
        boundingBox.max.sub(offset);
        return boundingBox;
    }
    getChildren() {
        const children = [];
        for(let i = 0; i < 8; i++)if (this.children[i]) children.push(this.children[i]);
        return children;
    }
    getPointsInBox(boxNode) {
        if (!this.sceneNode) return null;
        const buffer = this.geometryNode?.buffer;
        const posOffset = buffer.offset('position');
        const stride = buffer.stride;
        const view = new DataView(buffer.data);
        const worldToBox = boxNode.matrixWorld.clone().invert();
        const objectToBox = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4().multiplyMatrices(worldToBox, this.sceneNode.matrixWorld);
        const inBox = [];
        const pos = new __WEBPACK_EXTERNAL_MODULE_three__.Vector4();
        for(let i = 0; i < buffer.numElements; i++){
            const x = view.getFloat32(i * stride + posOffset + 0, true);
            const y = view.getFloat32(i * stride + posOffset + 4, true);
            const z = view.getFloat32(i * stride + posOffset + 8, true);
            pos.set(x, y, z, 1);
            pos.applyMatrix4(objectToBox);
            if (-0.5 < pos.x && pos.x < 0.5) {
                if (-0.5 < pos.y && pos.y < 0.5) {
                    if (-0.5 < pos.z && pos.z < 0.5) {
                        pos.set(x, y, z, 1).applyMatrix4(this.sceneNode.matrixWorld);
                        inBox.push(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(pos.x, pos.y, pos.z));
                    }
                }
            }
        }
        return inBox;
    }
    get name() {
        return this.geometryNode?.name ?? '';
    }
    constructor(...args){
        super(...args), this.children = [], this.sceneNode = null, this.octree = null, this.geometryNode = null;
    }
}
class PointCloudOctree extends __WEBPACK_EXTERNAL_MODULE__PointCloudTree_js_b7b70776__.PointCloudTree {
    constructor(geometry, material){
        super(), this.pointBudget = 1 / 0, this.visiblePointsTarget = 2000000, this.minimumNodePixelSize = 150, this.level = 0, this.showBoundingBox = false, this.boundingBoxNodes = [], this.loadQueue = [], this.visibleBounds = new __WEBPACK_EXTERNAL_MODULE_three__.Box3(), this.visibleNodes = [], this._viewLodProgressByView = new Map(), this._viewLodProgressFrameNumber = -1, this._viewLodProgress = 0, this.generateDEM = false, this.profileRequests = [], this._visible = true, this.screenHeight = 0, this.screenWidth = 0, this.renderNodes = new WeakMap();
        this.pcoGeometry = geometry;
        this.boundingBox = this.pcoGeometry.boundingBox ?? new __WEBPACK_EXTERNAL_MODULE_three__.Box3();
        this.boundingSphere = this.boundingBox.getBoundingSphere(new __WEBPACK_EXTERNAL_MODULE_three__.Sphere()) ?? new __WEBPACK_EXTERNAL_MODULE_three__.Sphere();
        this.material = material || new __WEBPACK_EXTERNAL_MODULE__materials_PointCloudMaterial_js_de2c4e1f__.PointCloudMaterial();
        this.position.copy(geometry.offset ?? new __WEBPACK_EXTERNAL_MODULE_three__.Vector3());
        this.updateMatrix();
        {
            const priorityQueue = [
                'rgba',
                'rgb',
                'intensity',
                'classification'
            ];
            let selected = 'rgba';
            for (const attributeName of priorityQueue){
                const attribute = this.pcoGeometry?.pointAttributes?.attributes.find((a)=>a.name === attributeName);
                if (!attribute) continue;
                const min = Array.isArray(attribute.range[0]) ? attribute.range[0] : [
                    attribute.range[0]
                ];
                const max = Array.isArray(attribute.range[1]) ? attribute.range[1] : [
                    attribute.range[1]
                ];
                const range_min = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(...min);
                const range_max = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(...max);
                const range = range_min.distanceTo(range_max);
                if (0 !== range) {
                    selected = attributeName;
                    break;
                }
            }
            this.material.activeAttributeName = selected;
        }
        {
            const intensityAttribute = this.pcoGeometry?.pointAttributes?.attributes.find((attribute)=>'intensity' === attribute.name && Array.isArray(attribute.range) && 2 === attribute.range.length && Number.isFinite(attribute.range[0]) && Number.isFinite(attribute.range[1]));
            if (intensityAttribute?.range) {
                let [min, max] = intensityAttribute.range;
                if (min === max) max = min + 1;
                const currentRange = this.material.intensityRange;
                const needsDefaultRange = !Number.isFinite(currentRange[0]) || !Number.isFinite(currentRange[1]) || currentRange[0] >= currentRange[1];
                if (needsDefaultRange) this.material.intensityRange = [
                    min,
                    max
                ];
                if ((this.material.activeAttributeName ?? '').includes('intensity')) this.material.activeSamplingRange = [
                    min,
                    max
                ];
            }
        }
        this.name = '';
        {
            let box = [
                this.pcoGeometry.tightBoundingBox,
                this.getBoundingBoxWorld()
            ].find((v)=>void 0 !== v);
            this.updateMatrixWorld(true);
            box = (0, __WEBPACK_EXTERNAL_MODULE__utils_geometry_utils_js_d463fbb9__.computeTransformedBoundingBox)(box, this.matrixWorld);
            const bMin = box.min.z;
            const bMax = box.max.z;
            this.material.heightMin = bMin;
            this.material.heightMax = bMax;
        }
        this.projection = geometry.projection;
        this.fallbackProjection = geometry.fallbackProjection;
        this.root = this.pcoGeometry.root;
    }
    setName(name) {
        if (this.name !== name) {
            this.name = name;
            this.dispatchEvent({
                type: 'name_changed',
                name: name,
                pointcloud: this
            });
        }
    }
    getName() {
        return this.name;
    }
    getNormalizerName(name) {
        return name.toLowerCase().replace(/[-_\s]/g, '');
    }
    getAttribute(name) {
        const attribute = this.pcoGeometry?.pointAttributes?.attributes.find((a)=>this.getNormalizerName(this.getNormalizerName(a.name)) === this.getNormalizerName(this.getNormalizerName(name)));
        if (attribute) return attribute;
        return null;
    }
    getAttributes() {
        return this.pcoGeometry.pointAttributes;
    }
    toTreeNode(geometryNode, _parent) {
        const existing = this.renderNodes.get(geometryNode);
        if (existing?.sceneNode && 'resident' === geometryNode.resourceState) return existing;
        if (!geometryNode.geometry || geometryNode.structural) throw new Error(`节点 ${geometryNode.name} 没有可渲染驻留载荷`);
        const node = new PointCloudOctreeNode();
        const sceneNode = new __WEBPACK_EXTERNAL_MODULE_three__.Points(geometryNode.geometry, this.material);
        sceneNode.name = geometryNode.name;
        sceneNode.position.copy(geometryNode.boundingBox.min);
        sceneNode.frustumCulled = false;
        sceneNode.onBeforeRender = (renderer, _scene, _camera, _geometry, material, _group)=>{
            if (material.program) {
                const gl = renderer.getContext();
                gl['useProgram'](material.program.program);
                if (material.program.getUniforms().map.level) {
                    const level = geometryNode.getLevel();
                    material.uniforms.level.value = level;
                    material.program.getUniforms().map.level.setValue(renderer.getContext(), level);
                }
                if (this.visibleNodeTextureOffsets && material.program.getUniforms().map.vnStart) {
                    const vnStart = this.visibleNodeTextureOffsets.get(node);
                    material.uniforms.vnStart.value = vnStart;
                    material.program.getUniforms().map.vnStart.setValue(gl, vnStart);
                }
                if (material.program.getUniforms().map.pcIndex) {
                    const i = node.pcIndex ? node.pcIndex : this.visibleNodes.indexOf(node);
                    material.uniforms.pcIndex.value = i;
                    material.program.getUniforms().map.pcIndex.setValue(gl, i);
                }
            }
        };
        node.geometryNode = geometryNode;
        node.sceneNode = sceneNode;
        node.pointcloud = this;
        node.children = [];
        for(let i = 0; i < 8; i++)node.children[i] = geometryNode.children[i];
        this.add(sceneNode);
        this.renderNodes.set(geometryNode, node);
        geometryNode.markResident();
        const disposeListener = ()=>{
            node.sceneNode?.removeFromParent();
            if (node.sceneNode) node.sceneNode.onBeforeRender = ()=>{};
            node.sceneNode = null;
            this.renderNodes.delete(geometryNode);
            const visibleIndex = this.visibleNodes.indexOf(node);
            if (visibleIndex >= 0) this.visibleNodes.splice(visibleIndex, 1);
        };
        geometryNode.oneTimeDisposeHandlers.push(disposeListener);
        return node;
    }
    getRenderNode(geometryNode) {
        return this.renderNodes.get(geometryNode) ?? null;
    }
    updateVisibleBounds() {
        const leafNodes = [];
        for(let i = 0; i < this.visibleNodes.length; i++){
            const node = this.visibleNodes[i];
            let isLeaf = true;
            for(let j = 0; j < node.children.length; j++){
                const child = node.children[j];
                if (child instanceof PointCloudOctreeNode) isLeaf = isLeaf && !child.sceneNode?.visible;
                else if (child instanceof __WEBPACK_EXTERNAL_MODULE__OctreeGeometry_js_e1504a42__.OctreeGeometryNode) isLeaf = true;
            }
            if (isLeaf) leafNodes.push(node);
        }
        this.visibleBounds.min = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1 / 0, 1 / 0, 1 / 0);
        this.visibleBounds.max = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(-1 / 0, -1 / 0, -1 / 0);
        for(let i = 0; i < leafNodes.length; i++){
            const node = leafNodes[i];
            this.visibleBounds.expandByPoint(node.getBoundingBox().min);
            this.visibleBounds.expandByPoint(node.getBoundingBox().max);
        }
    }
    updateMaterial(material, _visibleNodes, camera, renderer, viewportSize) {
        material.fov = camera.fov * (Math.PI / 180);
        material.screenWidth = viewportSize?.width ?? renderer.domElement.clientWidth;
        material.screenHeight = viewportSize?.height ?? renderer.domElement.clientHeight;
        material.spacing = this.pcoGeometry.spacing;
        material.near = camera.near;
        material.far = camera.far;
        material.uniforms.octreeSize.value = this.pcoGeometry?.boundingBox?.getSize(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3()).x ?? 0;
    }
    computeVisibilityTextureData(nodes, _camera) {
        const data = new Uint8Array(4 * nodes.length);
        const visibleNodeTextureOffsets = new Map();
        nodes = nodes.slice();
        const sort = (a, b)=>{
            const na = a.geometryNode.name;
            const nb = b.geometryNode.name;
            if (na.length !== nb.length) return na.length - nb.length;
            if (na < nb) return -1;
            if (na > nb) return 1;
            return 0;
        };
        nodes.sort(sort);
        new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        const nodeMap = new Map();
        const offsetsToChild = new Array(nodes.length).fill(1 / 0);
        for(let i = 0; i < nodes.length; i++){
            const node = nodes[i];
            nodeMap.set(node.name, node);
            visibleNodeTextureOffsets.set(node, i);
            if (i > 0) {
                const index = parseInt(node.name.slice(-1), 10);
                const parentName = node.name.slice(0, -1);
                const parent = nodeMap.get(parentName);
                const parentOffset = visibleNodeTextureOffsets.get(parent);
                const parentOffsetToChild = i - parentOffset;
                offsetsToChild[parentOffset] = Math.min(offsetsToChild[parentOffset], parentOffsetToChild);
                data[4 * parentOffset + 0] = data[4 * parentOffset + 0] | 1 << index;
                data[4 * parentOffset + 1] = offsetsToChild[parentOffset] >> 8;
                data[4 * parentOffset + 2] = offsetsToChild[parentOffset] % 256;
            }
            const density = node.geometryNode.density;
            if ('number' != typeof density || Number.isNaN(density)) data[4 * i + 3] = 100;
            else {
                const lodOffset = Math.log2(density) / 2 - 1.5;
                const offsetUint8 = (lodOffset + 10) * 10;
                data[4 * i + 3] = offsetUint8;
            }
        }
        return {
            data: data,
            offsets: visibleNodeTextureOffsets
        };
    }
    nodeIntersectsProfile(node, profile) {
        const bbWorld = node.boundingBox.clone().applyMatrix4(this.matrixWorld);
        const bsWorld = bbWorld.getBoundingSphere(new __WEBPACK_EXTERNAL_MODULE_three__.Sphere());
        let intersects = false;
        for(let i = 0; i < profile.points.length - 1; i++){
            const start = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(profile.points[i + 0].x, profile.points[i + 0].y, bsWorld.center.z);
            const end = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(profile.points[i + 1].x, profile.points[i + 1].y, bsWorld.center.z);
            const closest = new __WEBPACK_EXTERNAL_MODULE_three__.Line3(start, end).closestPointToPoint(bsWorld.center, true, new __WEBPACK_EXTERNAL_MODULE_three__.Vector3());
            const distance = closest.distanceTo(bsWorld.center);
            intersects = intersects || distance < bsWorld.radius + profile.width;
        }
        return intersects;
    }
    deepestNodeAt(position) {
        const toObjectSpace = this.matrixWorld.clone().invert();
        const objPos = position.clone().applyMatrix4(toObjectSpace);
        let current = this.root;
        while(true){
            let containingChild = null;
            for (const child of current.children)if (void 0 !== child) {
                if (child.getBoundingBox().containsPoint(objPos)) containingChild = child;
            }
            if (null !== containingChild && containingChild instanceof PointCloudOctreeNode) current = containingChild;
            else break;
        }
        const deepest = current;
        return deepest;
    }
    nodesOnRay(nodes, ray) {
        const nodesOnRay = [];
        const _ray = ray.clone();
        for(let i = 0; i < nodes.length; i++){
            const node = nodes[i];
            const sphere = node.getBoundingSphere().clone().applyMatrix4(this.matrixWorld);
            if (_ray.intersectsSphere(sphere)) nodesOnRay.push(node);
        }
        return nodesOnRay;
    }
    updateMatrixWorld(force) {
        if (true === this.matrixAutoUpdate) this.updateMatrix();
        if (true === this.matrixWorldNeedsUpdate || true === force) {
            if (this.parent) this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
            else this.matrixWorld.copy(this.matrix);
            this.matrixWorldNeedsUpdate = false;
            force = true;
        }
    }
    hideDescendants(object) {
        const stack = [];
        for(let i = 0; i < object.children.length; i++){
            const child = object.children[i];
            if (child.visible) stack.push(child);
        }
        while(stack.length > 0){
            const object = stack.shift();
            object.visible = false;
            for(let i = 0; i < object.children.length; i++){
                const child = object.children[i];
                if (child.visible) stack.push(child);
            }
        }
    }
    moveToOrigin() {
        this.position.set(0, 0, 0);
        this.updateMatrixWorld(true);
        const box = this.boundingBox;
        const transform = this.matrixWorld;
        const tBox = (0, __WEBPACK_EXTERNAL_MODULE__utils_geometry_utils_js_d463fbb9__.computeTransformedBoundingBox)(box, transform);
        this.position.set(0, 0, 0).sub(tBox.getCenter(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3()));
    }
    moveToGroundPlane() {
        this.updateMatrixWorld(true);
        const box = this.boundingBox;
        const transform = this.matrixWorld;
        const tBox = (0, __WEBPACK_EXTERNAL_MODULE__utils_geometry_utils_js_d463fbb9__.computeTransformedBoundingBox)(box, transform);
        this.position.y += -tBox.min.y;
    }
    getBoundingBoxWorld() {
        this.updateMatrixWorld(true);
        const box = this.boundingBox;
        const transform = this.matrixWorld;
        const tBox = (0, __WEBPACK_EXTERNAL_MODULE__utils_geometry_utils_js_d463fbb9__.computeTransformedBoundingBox)(box, transform);
        return tBox;
    }
    getVisibleExtent() {
        return this.visibleBounds.applyMatrix4(this.matrixWorld);
    }
    intersectsPoint(position) {
        const rootAvailable = this.pcoGeometry.root?.geometry;
        if (!rootAvailable) return false;
        if (void 0 === this.signedDistanceField) {
            const resolution = 32;
            const field = new Float32Array(resolution ** 3).fill(1 / 0);
            const positions = this.pcoGeometry.root.geometry.attributes.position;
            const boundingBox = this.boundingBox;
            const n = positions.count;
            for(let i = 0; i < n; i += 3){
                const x = positions.array[3 * i + 0];
                const y = positions.array[3 * i + 1];
                const z = positions.array[3 * i + 2];
                const ix = parseInt(Math.min(resolution * (x / boundingBox.max.x), resolution - 1), 10);
                const iy = parseInt(Math.min(resolution * (y / boundingBox.max.y), resolution - 1), 10);
                const iz = parseInt(Math.min(resolution * (z / boundingBox.max.z), resolution - 1), 10);
                const index = ix + iy * resolution + iz * resolution * resolution;
                field[index] = 0;
            }
            const sdf = {
                resolution: resolution,
                field: field
            };
            this.signedDistanceField = sdf;
        }
        {
            const sdf = this.signedDistanceField;
            const boundingBox = this.boundingBox;
            const toObjectSpace = this.matrixWorld.clone().invert();
            const objPos = position.clone().applyMatrix4(toObjectSpace);
            const resolution = sdf.resolution;
            const ix = parseInt(resolution * (objPos.x / boundingBox.max.x), 10);
            const iy = parseInt(resolution * (objPos.y / boundingBox.max.y), 10);
            const iz = parseInt(resolution * (objPos.z / boundingBox.max.z), 10);
            if (ix < 0 || iy < 0 || iz < 0) return false;
            if (ix >= resolution || iy >= resolution || iz >= resolution) return false;
            const index = ix + iy * resolution + iz * resolution * resolution;
            const value = sdf.field[index];
            if (0 === value) return true;
        }
        return false;
    }
    pick(renderer, pRenderer, camera, ray, params = {}) {
        performance.mark('pick-start');
        const getVal = (a, b)=>void 0 !== a ? a : b;
        const pickWindowSize = getVal(params.pickWindowSize, 65);
        getVal(params.pickOutsideClipRegion, false);
        const size = renderer.getSize(new __WEBPACK_EXTERNAL_MODULE_three__.Vector2());
        const width = Math.ceil(getVal(params.width, size.width));
        const height = Math.ceil(getVal(params.height, size.height));
        const pointSizeType = getVal(params.pointSizeType, this.material.pointSizeType);
        const pointSize = getVal(params.pointSize, this.material.size);
        const nodes = this.nodesOnRay(this.visibleNodes, ray);
        if (0 === nodes.length) return null;
        if (!this.pickState) {
            const scene = new __WEBPACK_EXTERNAL_MODULE_three__.Scene();
            const material = new __WEBPACK_EXTERNAL_MODULE__materials_PointCloudMaterial_js_de2c4e1f__.PointCloudMaterial();
            material.activeAttributeName = 'indices';
            const renderTarget = new __WEBPACK_EXTERNAL_MODULE_three__.WebGLRenderTarget(1, 1, {
                minFilter: __WEBPACK_EXTERNAL_MODULE_three__.LinearFilter,
                magFilter: __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter,
                format: __WEBPACK_EXTERNAL_MODULE_three__.RGBAFormat
            });
            this.pickState = {
                renderTarget: renderTarget,
                material: material,
                scene: scene
            };
        }
        const pickState = this.pickState;
        const pickMaterial = pickState.material;
        pickMaterial.pointSizeType = pointSizeType;
        pickMaterial.shape = __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.PointShape.PARABOLOID;
        pickMaterial.uniforms.uFilterReturnNumberRange.value = this.material.uniforms.uFilterReturnNumberRange.value;
        pickMaterial.uniforms.uFilterNumberOfReturnsRange.value = this.material.uniforms.uFilterNumberOfReturnsRange.value;
        pickMaterial.uniforms.uFilterGPSTimeClipRange.value = this.material.uniforms.uFilterGPSTimeClipRange.value;
        pickMaterial.uniforms.uFilterPointSourceIDClipRange.value = this.material.uniforms.uFilterPointSourceIDClipRange.value;
        pickMaterial.activeAttributeName = 'indices';
        pickMaterial.size = pointSize;
        pickMaterial.uniforms.minSize.value = this.material.uniforms.minSize.value;
        pickMaterial.uniforms.maxSize.value = this.material.uniforms.maxSize.value;
        pickMaterial.classification = this.material.classification;
        pickMaterial.recomputeClassification();
        if (params.pickClipped) {
            pickMaterial.clipBoxes = this.material.clipBoxes;
            pickMaterial.uniforms.clipBoxes = this.material.uniforms.clipBoxes;
            if (this.material.clipTask === __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.ClipTask.HIGHLIGHT) pickMaterial.clipTask = __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.ClipTask.NONE;
            else pickMaterial.clipTask = this.material.clipTask;
            pickMaterial.clipMethod = this.material.clipMethod;
        } else pickMaterial.clipBoxes = [];
        this.updateMaterial(pickMaterial, nodes, camera, renderer);
        pickState.renderTarget.setSize(width, height);
        const pixelPos = new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(params.x, params.y);
        const gl = renderer.getContext();
        gl.enable(gl.SCISSOR_TEST);
        gl.scissor(parseInt(pixelPos.x - (pickWindowSize - 1) / 2, 10), parseInt(pixelPos.y - (pickWindowSize - 1) / 2, 10), parseInt(pickWindowSize, 10), parseInt(pickWindowSize, 10));
        renderer.state.buffers.depth.setTest(pickMaterial.depthTest);
        renderer.state.buffers.depth.setMask(pickMaterial.depthWrite);
        renderer.state.setBlending(__WEBPACK_EXTERNAL_MODULE_three__.NoBlending);
        {
            renderer.setRenderTarget(pickState.renderTarget);
            gl.clearColor(0, 0, 0, 0);
            renderer.clear(true, true, true);
            const tmp = this.material;
            this.material = pickMaterial;
            pRenderer.renderOctree(this, nodes, camera, pickState.renderTarget);
            this.material = tmp;
        }
        const clamp = (number, min, max)=>Math.min(Math.max(min, number), max);
        const x = parseInt(clamp(pixelPos.x - (pickWindowSize - 1) / 2, 0, width), 10);
        const y = parseInt(clamp(pixelPos.y - (pickWindowSize - 1) / 2, 0, height), 10);
        parseInt(Math.min(x + pickWindowSize, width) - x, 10);
        parseInt(Math.min(y + pickWindowSize, height) - y, 10);
        const pixelCount = pickWindowSize * pickWindowSize;
        const buffer = new Uint8Array(4 * pixelCount);
        gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
        gl.readPixels(x, y, pickWindowSize, pickWindowSize, gl.RGBA, gl.UNSIGNED_BYTE, buffer);
        renderer.setScissorTest(false);
        gl.disable(gl.SCISSOR_TEST);
        const pixels = buffer;
        const ibuffer = new Uint32Array(buffer.buffer);
        const hits = [];
        for(let u = 0; u < pickWindowSize; u++)for(let v = 0; v < pickWindowSize; v++){
            const offset = u + v * pickWindowSize;
            const distance = (u - (pickWindowSize - 1) / 2) ** 2 + (v - (pickWindowSize - 1) / 2) ** 2;
            const pcIndex = pixels[4 * offset + 3];
            pixels[4 * offset + 3] = 0;
            const pIndex = ibuffer[offset];
            if (!(0 === pcIndex && 0 === pIndex) && void 0 !== pcIndex && void 0 !== pIndex) {
                const hit = {
                    pIndex: pIndex,
                    pcIndex: pcIndex - 1,
                    distanceToCenter: distance
                };
                if (params.all) hits.push(hit);
                else if (hits.length > 0) {
                    if (distance < hits[0].distanceToCenter) hits[0] = hit;
                } else hits.push(hit);
            }
        }
        for (const hit of hits){
            const point = {};
            if (!nodes[hit.pcIndex]) return null;
            const node = nodes[hit.pcIndex];
            const pc = node.sceneNode;
            const geometry = node.geometryNode.geometry;
            point.__node = node;
            for(const attributeName in geometry.attributes){
                const attribute = geometry.attributes[attributeName];
                if ('position' === attributeName) {
                    const x = attribute.array[3 * hit.pIndex + 0];
                    const y = attribute.array[3 * hit.pIndex + 1];
                    const z = attribute.array[3 * hit.pIndex + 2];
                    const position = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(x, y, z);
                    position.applyMatrix4(pc.matrixWorld);
                    point[attributeName] = position;
                } else if ('indices' === attributeName) ;
                else {
                    let values = attribute.array.slice(attribute.itemSize * hit.pIndex, attribute.itemSize * (hit.pIndex + 1));
                    if (attribute.potree) {
                        const { scale, offset } = attribute.potree;
                        values = values.map((v)=>v / scale + offset);
                    }
                    point[attributeName] = values;
                }
            }
            hit.point = point;
        }
        performance.mark('pick-end');
        performance.measure('pick', 'pick-start', 'pick-end');
        if (params.all) return hits.map((hit)=>hit.point);
        if (0 === hits.length) return null;
        return hits[0].point;
    }
    get progress() {
        return 1;
    }
    get viewLodProgress() {
        return this._viewLodProgress;
    }
    updateViewLodProgress(readyNodes, totalNodes, context = {}) {
        const ratio = 0 === totalNodes ? 1 : readyNodes / totalNodes;
        const normalized = Number.isFinite(ratio) ? Math.min(1, Math.max(0, ratio)) : 0;
        const { frameNumber, viewId, visibleViewIds } = context;
        if (void 0 === frameNumber || void 0 === viewId) {
            this._viewLodProgressFrameNumber = -1;
            this._viewLodProgressByView.clear();
            this._viewLodProgressByView.set('__single__', normalized);
            this._viewLodProgress = normalized;
            return;
        }
        if (this._viewLodProgressFrameNumber !== frameNumber) {
            this._viewLodProgressFrameNumber = frameNumber;
            this._viewLodProgressByView.clear();
        }
        if (visibleViewIds) {
            const visibleViews = new Set(visibleViewIds);
            for (const storedViewId of this._viewLodProgressByView.keys())if (!visibleViews.has(storedViewId)) this._viewLodProgressByView.delete(storedViewId);
        }
        this._viewLodProgressByView.set(viewId, normalized);
        this._viewLodProgress = Math.min(...this._viewLodProgressByView.values());
    }
    find(name) {
        let node = null;
        for (const char of name)node = 'r' === char ? this.root : node.children[char];
        return node;
    }
    get visible() {
        return this._visible;
    }
    set visible(value) {
        if (value !== this._visible) {
            this._visible = value;
            this.dispatchEvent({
                type: 'visibility_changed',
                pointcloud: this
            });
        }
    }
    traverseDescendants(handler) {
        for (const child of this.children)child.traverse(handler);
    }
    traverseRelease(item) {
        const arr = Object.values(item.children);
        item.dispose(false);
        if (!arr.length) return;
        arr.forEach((a)=>{
            this.traverseRelease(a);
        });
    }
    dispose() {
        if (this.pcoGeometry) {
            this.pcoGeometry.loadSignal = void 0;
            this.pcoGeometry.loader?.dispose();
            this.pcoGeometry.dispose();
        }
        this.traverseDescendants((child)=>{
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
        if (this.root?.sceneNode) this.root.sceneNode.onBeforeRender = null;
        if (this.pickState?.renderTarget) this.pickState.renderTarget.dispose();
        if (this.pickState?.material) this.pickState.material.dispose();
        this.pickState = void 0;
        this.material.dispose();
        this.visibleNodes = [];
        this._viewLodProgressByView.clear();
        this._viewLodProgress = 0;
        this.loadQueue = [];
        this.profileRequests = [];
        this.renderNodes = new WeakMap();
    }
}
export { PointCloudOctree, PointCloudOctreeNode };
