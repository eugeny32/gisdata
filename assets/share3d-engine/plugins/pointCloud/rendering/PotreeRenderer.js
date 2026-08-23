import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__core_PointCloudTree_js_b3150489__ from "../core/PointCloudTree.js";
import * as __WEBPACK_EXTERNAL_MODULE__loaders_global_js_48932f79__ from "../loaders/global.js";
import * as __WEBPACK_EXTERNAL_MODULE__webgl_Shader_js_fae26330__ from "./webgl/Shader.js";
import * as __WEBPACK_EXTERNAL_MODULE__webgl_utils_js_d92ef5ff__ from "./webgl/utils.js";
import * as __WEBPACK_EXTERNAL_MODULE__webgl_WebGLBuffer_js_53325f4f__ from "./webgl/WebGLBuffer.js";
import * as __WEBPACK_EXTERNAL_MODULE__webgl_WebGLTexture_js_806bea9a__ from "./webgl/WebGLTexture.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__ from "../../../shared/constants/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('pointcloud');
const DEFAULT_ORTHOGRAPHIC_EDL_FOV = 60;
function normalizeGpsTimeClipRange(clipRange, globalRange) {
    const [globalMin, globalMax] = globalRange;
    const globalRangeSize = globalMax - globalMin;
    if (!Number.isFinite(globalMin) || !Number.isFinite(globalMax) || globalRangeSize <= 0) return [
        0,
        1
    ];
    if (!Array.isArray(clipRange) || clipRange.length < 2 || !Number.isFinite(clipRange[0]) || !Number.isFinite(clipRange[1]) || clipRange[0] > clipRange[1]) return [
        0,
        1
    ];
    return [
        (clipRange[0] - globalMin) / globalRangeSize,
        (clipRange[1] - globalMin) / globalRangeSize
    ];
}
function getOrthographicVisibleSize(camera) {
    const safeZoom = Math.max(camera.zoom, 1e-9);
    return {
        width: (camera.right - camera.left) / safeZoom,
        height: (camera.top - camera.bottom) / safeZoom
    };
}
function getOrthographicEDLScale(camera) {
    const storedFov = camera.userData[__WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.ORTHOGRAPHIC_EQUIVALENT_FOV_USER_DATA_KEY];
    const fov = 'number' == typeof storedFov && Number.isFinite(storedFov) && storedFov > 0 && storedFov < 180 ? storedFov : DEFAULT_ORTHOGRAPHIC_EDL_FOV;
    const fovRadians = __WEBPACK_EXTERNAL_MODULE_three__.MathUtils.degToRad(fov);
    return 2 * Math.tan(fovRadians / 2) / Math.LN2;
}
class PotreeRenderer {
    constructor(threeRenderer){
        this.clipPolygonMaxVerticeCount = __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.ClipPolygonMaxVerticeCount;
        this.vaoCreatedCount = 0;
        this.vaoDeletedCount = 0;
        this.vboCreatedCount = 0;
        this.vboDeletedCount = 0;
        this.vboUploadedBytes = 0;
        this.vboReleasedBytes = 0;
        this.programCreatedCount = 0;
        this.programDeletedCount = 0;
        this.shaderCreatedCount = 0;
        this.shaderDeletedCount = 0;
        this.uniformBufferCreatedCount = 0;
        this.uniformBufferDeletedCount = 0;
        this.textureCreatedCount = 0;
        this.textureDeletedCount = 0;
        this.threeRenderer = threeRenderer;
        this.gl = this.threeRenderer.getContext();
        this.buffers = new Map();
        this.shaders = new Map();
        this.textures = new Map();
        this.glTypeMapping = new Map();
        this.glTypeMapping.set(Float32Array, this.gl.FLOAT);
        this.glTypeMapping.set(Uint8Array, this.gl.UNSIGNED_BYTE);
        this.glTypeMapping.set(Uint16Array, this.gl.UNSIGNED_SHORT);
        this.toggle = 0;
    }
    getMemoryDiagnostics() {
        let trackedVaoCount = 0;
        let trackedVboCount = 0;
        let estimatedVboBytes = 0;
        for (const buffer of this.buffers.values()){
            if (buffer.vao) trackedVaoCount++;
            trackedVboCount += buffer.vbos.size;
            for (const vbo of buffer.vbos.values())estimatedVboBytes += vbo.byteLength;
        }
        let shaderCacheEntries = 0;
        let shaderUniformBlockCount = 0;
        for (const shader of this.shaders.values()){
            shaderCacheEntries += shader.cache.size;
            for (const cached of shader.cache.values())shaderUniformBlockCount += Object.keys(cached.uniformBlocks).length;
        }
        let estimatedTextureBytes = 0;
        for (const texture of this.textures.values()){
            const image = texture.texture.image;
            if (image?.data && ArrayBuffer.isView(image.data)) estimatedTextureBytes += image.data.byteLength;
            else if (image?.width && image?.height) estimatedTextureBytes += image.width * image.height * 4;
        }
        return {
            bufferCacheSize: this.buffers.size,
            shaderCacheSize: this.shaders.size,
            textureCacheSize: this.textures.size,
            trackedVaoCount,
            trackedVboCount,
            estimatedVboBytes,
            estimatedTextureBytes,
            shaderCacheEntries,
            shaderUniformBlockCount,
            vaoCreated: this.vaoCreatedCount,
            vaoDeleted: this.vaoDeletedCount,
            liveVaoEstimate: this.vaoCreatedCount - this.vaoDeletedCount,
            vboCreated: this.vboCreatedCount,
            vboDeleted: this.vboDeletedCount,
            liveVboEstimate: this.vboCreatedCount - this.vboDeletedCount,
            vboUploadedBytes: this.vboUploadedBytes,
            vboReleasedBytes: this.vboReleasedBytes,
            programCreated: this.programCreatedCount,
            programDeleted: this.programDeletedCount,
            shaderCreated: this.shaderCreatedCount,
            shaderDeleted: this.shaderDeletedCount,
            uniformBufferCreated: this.uniformBufferCreatedCount,
            uniformBufferDeleted: this.uniformBufferDeletedCount,
            textureCreated: this.textureCreatedCount,
            textureDeleted: this.textureDeletedCount
        };
    }
    deleteBuffer(geometry) {
        const webglBuffer = this.buffers.get(geometry);
        if (null != webglBuffer) {
            if (webglBuffer.disposeHandler) {
                geometry.removeEventListener('dispose', webglBuffer.disposeHandler);
                webglBuffer.disposeHandler = null;
            }
            this._deleteWebGLBuffer(webglBuffer);
            this.buffers.delete(geometry);
        }
    }
    createBuffer(geometry) {
        const gl = this.gl;
        const webglBuffer = new __WEBPACK_EXTERNAL_MODULE__webgl_WebGLBuffer_js_53325f4f__.WebGLBuffer();
        webglBuffer.vao = gl.createVertexArray();
        if (webglBuffer.vao) this.vaoCreatedCount++;
        webglBuffer.numElements = geometry.attributes.position.count;
        gl.bindVertexArray(webglBuffer.vao);
        for(const attributeName in geometry.attributes){
            const bufferAttribute = geometry.attributes[attributeName];
            const vbo = gl.createBuffer();
            if (vbo) this.vboCreatedCount++;
            gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
            gl.bufferData(gl.ARRAY_BUFFER, bufferAttribute.array, gl.STATIC_DRAW);
            this.vboUploadedBytes += bufferAttribute.array.byteLength;
            const normalized = bufferAttribute.normalized;
            const type = this.glTypeMapping.get(bufferAttribute.array.constructor);
            if (void 0 === __WEBPACK_EXTERNAL_MODULE__webgl_utils_js_d92ef5ff__.attributeLocations[attributeName]) ;
            else {
                const attributeLocation = __WEBPACK_EXTERNAL_MODULE__webgl_utils_js_d92ef5ff__.attributeLocations[attributeName].location;
                gl.vertexAttribPointer(attributeLocation, bufferAttribute.itemSize, type, normalized, 0, 0);
                gl.enableVertexAttribArray(attributeLocation);
            }
            webglBuffer.vbos.set(attributeName, {
                handle: vbo,
                name: attributeName,
                count: bufferAttribute.count,
                itemSize: bufferAttribute.itemSize,
                type: geometry.attributes.position.array.constructor,
                version: 0,
                byteLength: bufferAttribute.array.byteLength
            });
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
        const disposeHandler = ()=>{
            this.deleteBuffer(geometry);
        };
        webglBuffer.disposeHandler = disposeHandler;
        geometry.addEventListener('dispose', disposeHandler);
        return webglBuffer;
    }
    updateBuffer(geometry) {
        const gl = this.gl;
        const webglBuffer = this.buffers.get(geometry);
        if (!webglBuffer) return;
        gl.bindVertexArray(webglBuffer.vao);
        for(const attributeName in geometry.attributes){
            const bufferAttribute = geometry.attributes[attributeName];
            const normalized = bufferAttribute.normalized;
            const type = this.glTypeMapping.get(bufferAttribute.array.constructor);
            let vbo = null;
            if (webglBuffer.vbos.has(attributeName)) {
                const existingVbo = webglBuffer.vbos.get(attributeName);
                if (existingVbo) {
                    vbo = existingVbo.handle;
                    existingVbo.version = bufferAttribute.version;
                    existingVbo.byteLength = bufferAttribute.array.byteLength;
                }
            } else {
                vbo = gl.createBuffer();
                if (vbo) this.vboCreatedCount++;
                webglBuffer.vbos.set(attributeName, {
                    handle: vbo,
                    name: attributeName,
                    count: bufferAttribute.count,
                    itemSize: bufferAttribute.itemSize,
                    type: geometry.attributes.position.array.constructor,
                    version: bufferAttribute.version,
                    byteLength: bufferAttribute.array.byteLength
                });
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
            gl.bufferData(gl.ARRAY_BUFFER, bufferAttribute.array, gl.STATIC_DRAW);
            this.vboUploadedBytes += bufferAttribute.array.byteLength;
            if (void 0 === __WEBPACK_EXTERNAL_MODULE__webgl_utils_js_d92ef5ff__.attributeLocations[attributeName]) ;
            else {
                const attributeLocation = __WEBPACK_EXTERNAL_MODULE__webgl_utils_js_d92ef5ff__.attributeLocations[attributeName].location;
                gl.vertexAttribPointer(attributeLocation, bufferAttribute.itemSize, type, normalized, 0, 0);
                gl.enableVertexAttribArray(attributeLocation);
            }
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }
    traverse(scene) {
        const octrees = [];
        const stack = [
            scene
        ];
        while(stack.length > 0){
            const node = stack.pop();
            if (node instanceof __WEBPACK_EXTERNAL_MODULE__core_PointCloudTree_js_b3150489__.PointCloudTree) {
                octrees.push(node);
                continue;
            }
            const visibleChildren = node.children.filter((c)=>c.visible);
            stack.push(...visibleChildren);
        }
        const result = {
            octrees: octrees
        };
        return result;
    }
    renderNodes(octree, nodes, visibilityTextureData, camera, _target, shader, params) {
        if (__WEBPACK_EXTERNAL_MODULE__loaders_global_js_48932f79__.measureTimings) performance.mark('renderNodes-start');
        const gl = this.gl;
        const material = params.material ? params.material : octree.material;
        const shadowMaps = null == params.shadowMaps ? [] : params.shadowMaps;
        let view = camera.matrixWorldInverse;
        if (params.viewOverride) view = params.viewOverride;
        const worldView = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4();
        const mat4holder = new Float32Array(16);
        let i = 0;
        for (const node of nodes){
            if (void 0 !== __WEBPACK_EXTERNAL_MODULE__loaders_global_js_48932f79__.debug.allowedNodes) {
                if (!__WEBPACK_EXTERNAL_MODULE__loaders_global_js_48932f79__.debug.allowedNodes.includes(node.name)) continue;
            }
            if (!node.sceneNode) continue;
            const geometryNode = node.geometryNode;
            const geometry = geometryNode?.geometry;
            if (!geometry) {
                log.debug(`Missing geometry, node: ${node.name}`);
                continue;
            }
            const world = node.sceneNode.matrixWorld;
            worldView.multiplyMatrices(view, world);
            if (visibilityTextureData) {
                const vnStart = visibilityTextureData.offsets.get(node);
                if (void 0 !== vnStart) shader.setUniform1f('uVNStart', vnStart);
            }
            const level = node.getLevel();
            if (node.debug) shader.setUniform('uDebug', true);
            else shader.setUniform('uDebug', false);
            const lModel = shader.uniformLocations['modelMatrix'];
            if (lModel) {
                mat4holder.set(world.elements);
                gl.uniformMatrix4fv(lModel, false, mat4holder);
            }
            const lModelView = shader.uniformLocations['modelViewMatrix'];
            for(let j = 0; j < 16; j++)mat4holder[j] = worldView.elements[j];
            gl.uniformMatrix4fv(lModelView, false, mat4holder);
            if (material.clipPolygons && material.clipPolygons.length > 0) {
                const clipPolygonVCount = [];
                const worldViewProjMatrices = [];
                const clipTasks = [];
                const clipPolygonGroups = [];
                const clipPolygonAABBs = [];
                for (const clipPolygon of material.clipPolygons){
                    const view = clipPolygon.viewMatrix;
                    const proj = clipPolygon.projMatrix;
                    const worldViewProj = proj.clone().multiply(view).multiply(world);
                    clipPolygonVCount.push(clipPolygon.markers.length);
                    worldViewProjMatrices.push(worldViewProj);
                    clipTasks.push(clipPolygon.clipTask);
                    clipPolygonGroups.push(clipPolygon.groupId || 0);
                    clipPolygonAABBs.push(clipPolygon.aabb.min.x, clipPolygon.aabb.min.y, clipPolygon.aabb.max.x, clipPolygon.aabb.max.y);
                }
                const flattenedMatrices = worldViewProjMatrices.flatMap((m)=>m.elements);
                const flattenedVertices = new Array(3 * this.clipPolygonMaxVerticeCount * material.clipPolygons.length);
                for(let i = 0; i < material.clipPolygons.length; i++){
                    const clipPolygon = material.clipPolygons[i];
                    for(let j = 0; j < clipPolygon.markers.length; j++){
                        flattenedVertices[i * this.clipPolygonMaxVerticeCount * 3 + (3 * j + 0)] = clipPolygon.markers[j].position.x;
                        flattenedVertices[i * this.clipPolygonMaxVerticeCount * 3 + (3 * j + 1)] = clipPolygon.markers[j].position.y;
                        flattenedVertices[i * this.clipPolygonMaxVerticeCount * 3 + (3 * j + 2)] = clipPolygon.markers[j].position.z;
                    }
                }
                const lClipPolygonVCount = shader.uniformLocations['uClipPolygonVCount[0]'];
                gl.uniform1iv(lClipPolygonVCount, clipPolygonVCount);
                const uClipPolygonTasks = shader.uniformLocations['uClipPolygonTasks[0]'];
                gl.uniform1iv(uClipPolygonTasks, clipTasks);
                const uClipPolygonGroups = shader.uniformLocations['uClipPolygonGroups[0]'];
                gl.uniform1iv(uClipPolygonGroups, clipPolygonGroups);
                const uClipPolygonAABBs = shader.uniformLocations['uClipPolygonAABBs[0]'];
                gl.uniform4fv(uClipPolygonAABBs, clipPolygonAABBs);
                const lClipPolygonVP = shader.uniformLocations['uClipPolygonWVP[0]'];
                gl.uniformMatrix4fv(lClipPolygonVP, false, flattenedMatrices);
                const lClipPolygons = shader.uniformLocations['uClipPolygonVertices[0]'];
                gl.uniform3fv(lClipPolygons, flattenedVertices);
            }
            shader.setUniform1f('uLevel', level);
            shader.setUniform1f('uNodeSpacing', geometryNode.estimatedSpacing);
            shader.setUniform1f('uPCIndex', i);
            if (shadowMaps.length > 0) {
                const lShadowMap = shader.uniformLocations['uShadowMap[0]'];
                shader.setUniform3f('uShadowColor', material.uniforms.uShadowColor.value);
                const bindingStart = 5;
                const bindingPoints = new Array(shadowMaps.length).fill(bindingStart).map((a, i)=>a + i);
                gl.uniform1iv(lShadowMap, bindingPoints);
                for(let i = 0; i < shadowMaps.length; i++){
                    const shadowMap = shadowMaps[i];
                    const bindingPoint = bindingPoints[i];
                    const glTexture = this.threeRenderer.properties.get(shadowMap.target.texture).__webglTexture;
                    gl.activeTexture(gl[`TEXTURE${bindingPoint}`]);
                    gl.bindTexture(gl.TEXTURE_2D, glTexture);
                }
                {
                    const worldViewMatrices = shadowMaps.map((sm)=>sm.camera.matrixWorldInverse).map((view)=>new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4().multiplyMatrices(view, world));
                    const flattenedMatrices = worldViewMatrices.flatMap((c)=>c.elements);
                    const lWorldView = shader.uniformLocations['uShadowWorldView[0]'];
                    gl.uniformMatrix4fv(lWorldView, false, flattenedMatrices);
                }
                {
                    const flattenedMatrices = shadowMaps.flatMap((sm)=>sm.camera.projectionMatrix.elements);
                    const lProj = shader.uniformLocations['uShadowProj[0]'];
                    gl.uniformMatrix4fv(lProj, false, flattenedMatrices);
                }
            }
            if (geometry.attributes['gps-time']) {
                const attGPS = octree.getAttribute('gps-time');
                const initialRange = attGPS.initialRange;
                const initialRangeSize = initialRange[1] - initialRange[0];
                const globalRange = attGPS.range;
                const globalRangeSize = globalRange[1] - globalRange[0];
                let scale = initialRangeSize / globalRangeSize;
                let offset = -(globalRange[0] - initialRange[0]) / initialRangeSize;
                scale = Number.isNaN(scale) ? 1 : scale;
                offset = Number.isNaN(offset) ? 0 : offset;
                shader.setUniform1f('uGpsScale', scale);
                shader.setUniform1f('uGpsOffset', offset);
                const normalizedClipRange = normalizeGpsTimeClipRange(material.uniforms.uFilterGPSTimeClipRange.value, globalRange);
                shader.setUniform2f('uFilterGPSTimeClipRange', normalizedClipRange);
            }
            {
                const uFilterReturnNumberRange = material.uniforms.uFilterReturnNumberRange.value;
                const uFilterNumberOfReturnsRange = material.uniforms.uFilterNumberOfReturnsRange.value;
                const uFilterPointSourceIDClipRange = material.uniforms.uFilterPointSourceIDClipRange.value;
                shader.setUniform2f('uFilterReturnNumberRange', uFilterReturnNumberRange);
                shader.setUniform2f('uFilterNumberOfReturnsRange', uFilterNumberOfReturnsRange);
                shader.setUniform2f('uFilterPointSourceIDClipRange', uFilterPointSourceIDClipRange);
            }
            let webglBuffer = null;
            if (this.buffers.has(geometry)) {
                webglBuffer = this.buffers.get(geometry);
                for(const attributeName in geometry.attributes){
                    const attribute = geometry.attributes[attributeName];
                    const vbo = webglBuffer.vbos.get(attributeName);
                    if (vbo && attribute.version > vbo.version) this.updateBuffer(geometry);
                }
            } else {
                webglBuffer = this.createBuffer(geometry);
                this.buffers.set(geometry, webglBuffer);
            }
            gl.bindVertexArray(webglBuffer.vao);
            const isExtraAttribute = void 0 === __WEBPACK_EXTERNAL_MODULE__webgl_utils_js_d92ef5ff__.attributeLocations[material.activeAttributeName] && Object.keys(geometry.attributes).includes(material.activeAttributeName);
            if (isExtraAttribute) {
                const attributeLocation = __WEBPACK_EXTERNAL_MODULE__webgl_utils_js_d92ef5ff__.attributeLocations.aExtra.location;
                for(const attributeName in geometry.attributes){
                    const vbo = webglBuffer.vbos.get(attributeName);
                    if (vbo) gl.bindBuffer(gl.ARRAY_BUFFER, vbo.handle);
                    gl.disableVertexAttribArray(attributeLocation);
                }
                const attName = material.activeAttributeName;
                const bufferAttribute = geometry.attributes[attName];
                const vbo = webglBuffer.vbos.get(attName);
                if (void 0 !== bufferAttribute && void 0 !== vbo) {
                    const type = this.glTypeMapping.get(bufferAttribute.array.constructor);
                    const normalized = bufferAttribute.normalized;
                    gl.bindBuffer(gl.ARRAY_BUFFER, vbo.handle);
                    gl.vertexAttribPointer(attributeLocation, bufferAttribute.itemSize, type, normalized, 0, 0);
                    gl.enableVertexAttribArray(attributeLocation);
                }
                {
                    const attExtra = octree.pcoGeometry.pointAttributes.attributes.find((a)=>a.name === attName);
                    let range = material.getRange(attName);
                    if (!range) range = attExtra.range;
                    if (!range) range = [
                        0,
                        1
                    ];
                    const initialRange = attExtra.initialRange;
                    const initialRangeSize = initialRange[1] - initialRange[0];
                    const globalRange = range;
                    const globalRangeSize = globalRange[1] - globalRange[0];
                    let scale = initialRangeSize / globalRangeSize;
                    let offset = -(globalRange[0] - initialRange[0]) / initialRangeSize;
                    scale = Number.isNaN(scale) ? 1 : scale;
                    offset = Number.isNaN(offset) ? 0 : offset;
                    shader.setUniform1f('uExtraScale', scale);
                    shader.setUniform1f('uExtraOffset', offset);
                }
            } else for(const attributeName in geometry.attributes){
                const bufferAttribute = geometry.attributes[attributeName];
                const vbo = webglBuffer.vbos.get(attributeName);
                if (void 0 !== __WEBPACK_EXTERNAL_MODULE__webgl_utils_js_d92ef5ff__.attributeLocations[attributeName] && vbo) {
                    const attributeLocation = __WEBPACK_EXTERNAL_MODULE__webgl_utils_js_d92ef5ff__.attributeLocations[attributeName].location;
                    const type = this.glTypeMapping.get(bufferAttribute.array.constructor);
                    const normalized = bufferAttribute.normalized;
                    gl.bindBuffer(gl.ARRAY_BUFFER, vbo.handle);
                    gl.vertexAttribPointer(attributeLocation, bufferAttribute.itemSize, type, normalized, 0, 0);
                    gl.enableVertexAttribArray(attributeLocation);
                }
            }
            const numPoints = webglBuffer.numElements;
            gl.drawArrays(gl.POINTS, 0, numPoints);
            i++;
        }
        gl.bindVertexArray(null);
        if (__WEBPACK_EXTERNAL_MODULE__loaders_global_js_48932f79__.measureTimings) {
            performance.mark('renderNodes-end');
            performance.measure('render.renderNodes', 'renderNodes-start', 'renderNodes-end');
        }
    }
    renderOctree(octree, nodes, camera, target, params = {}) {
        const gl = this.gl;
        const material = params.material ? params.material : octree.material;
        const shadowMaps = null == params.shadowMaps ? [] : params.shadowMaps;
        let view = camera.matrixWorldInverse;
        let viewInv = camera.matrixWorld;
        if (params.viewOverride) {
            view = params.viewOverride;
            viewInv = view.clone().invert();
        }
        const proj = camera.projectionMatrix;
        const projInv = proj.clone().invert();
        let shader;
        let visibilityTextureData = null;
        let uVNBufferLength = 2048.0;
        let currentTextureBindingPoint = 0;
        if (material.pointSizeType >= 0) {
            if (material.pointSizeType === __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.PointSizeType.ADAPTIVE || 'level of detail' === material.activeAttributeName) {
                const vnNodes = null != params.vnTextureNodes ? params.vnTextureNodes : nodes;
                visibilityTextureData = octree.computeVisibilityTextureData(vnNodes, camera);
                const vnt = material.visibleNodesTexture;
                const data = vnt.image.data;
                if (visibilityTextureData.data.length > data.length) {
                    if (material.updateVisibleNodesTexture) {
                        const maxTextureSize = this.threeRenderer.capabilities.maxTextureSize;
                        const res = material.updateVisibleNodesTexture(data.length, maxTextureSize);
                        if (res) {
                            material.visibleNodesTexture.image.data.set(visibilityTextureData.data);
                            material.visibleNodesTexture.needsUpdate = true;
                        }
                    }
                } else {
                    data.set(visibilityTextureData.data);
                    vnt.needsUpdate = true;
                }
                uVNBufferLength = material.visibleNodesTexture.image.data.length / 4;
            }
        }
        {
            let [vs, fs] = [
                material.vertexShader,
                material.fragmentShader
            ];
            const numSnapshots = material.snapEnabled ? material.numSnapshots : 0;
            const numClipBoxes = material.clipBoxes?.length ? material.clipBoxes.length : 0;
            const numClipSpheres = params.clipSpheres?.length ? params.clipSpheres.length : 0;
            const numClipPolygons = material.clipPolygons?.length ? material.clipPolygons.length : 0;
            const defines = [
                `#define num_shadowmaps ${shadowMaps.length}`,
                `#define num_snapshots ${numSnapshots}`,
                `#define num_clipboxes ${numClipBoxes}`,
                `#define num_clipspheres ${numClipSpheres}`,
                `#define num_clippolygons ${numClipPolygons}`,
                `#define clip_polygon_max_vertice ${this.clipPolygonMaxVerticeCount}`
            ];
            if (octree.pcoGeometry.root.isLoaded()) {
                const attributes = octree.pcoGeometry.root.geometry.attributes;
                if (attributes['gps-time']) defines.push('#define clip_gps_enabled');
                if (attributes['return number']) defines.push('#define clip_return_number_enabled');
                if (attributes['number of returns']) defines.push('#define clip_number_of_returns_enabled');
                if (attributes['source id'] || attributes['point source id']) defines.push('#define clip_point_source_id_enabled');
            }
            const definesString = defines.join('\n');
            const vsVersionIndex = vs.indexOf('#version ');
            const fsVersionIndex = fs.indexOf('#version ');
            vs = vsVersionIndex >= 0 ? vs.replace(/(#version .*)/, `$1\n${definesString}`) : `#version 300 es\n${definesString}\n${vs}`;
            fs = fsVersionIndex >= 0 ? fs.replace(/(#version .*)/, `$1\n${definesString}`) : `#version 300 es\n${definesString}\n${fs}`;
            if (this.shaders.has(material)) {
                const existingShader = this.shaders.get(material);
                const previousEntries = existingShader.cache.size;
                const previousUniformBlocks = this._countShaderUniformBlocks(existingShader);
                existingShader.update(vs, fs);
                this._recordShaderResourceCreation(existingShader, previousEntries, previousUniformBlocks);
            } else {
                const s = new __WEBPACK_EXTERNAL_MODULE__webgl_Shader_js_fae26330__.Shader(gl, 'pointcloud', vs, fs);
                this._recordShaderResourceCreation(s, 0, 0);
                this.shaders.set(material, s);
            }
            material.needsUpdate = false;
        }
        shader = this.shaders.get(material);
        for (const uniformName of Object.keys(material.uniforms)){
            const uniform = material.uniforms[uniformName];
            if ('t' === uniform.type) {
                const texture = uniform.value;
                if (!texture) continue;
                if (!this.textures.has(texture)) {
                    const webglTexture = new __WEBPACK_EXTERNAL_MODULE__webgl_WebGLTexture_js_806bea9a__.WebGLTexture(gl, texture);
                    if (webglTexture.id) this.textureCreatedCount++;
                    this.textures.set(texture, webglTexture);
                }
                const webGLTexture = this.textures.get(texture);
                if (webGLTexture) webGLTexture.update();
            }
        }
        gl.useProgram(shader.program);
        let transparent = false;
        transparent = void 0 !== params.transparent ? params.transparent && material.opacity < 1 : material.opacity < 1;
        if (transparent) {
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            gl.depthMask(false);
            gl.enable(gl.DEPTH_TEST);
        } else {
            gl.disable(gl.BLEND);
            gl.depthMask(true);
            gl.enable(gl.DEPTH_TEST);
        }
        if (void 0 !== params.blendFunc) {
            gl.enable(gl.BLEND);
            gl.blendFunc(...params.blendFunc);
        }
        if (void 0 !== params.depthTest) {
            if (true === params.depthTest) gl.enable(gl.DEPTH_TEST);
            else gl.disable(gl.DEPTH_TEST);
        }
        if (void 0 !== params.depthWrite) {
            if (true === params.depthWrite) gl.depthMask(true);
            else gl.depthMask(false);
        }
        {
            shader.setUniformMatrix4('projectionMatrix', proj);
            shader.setUniformMatrix4('viewMatrix', view);
            shader.setUniformMatrix4('uViewInv', viewInv);
            shader.setUniformMatrix4('uProjInv', projInv);
            const screenWidth = target ? target.width : material.screenWidth;
            const screenHeight = target ? target.height : material.screenHeight;
            shader.setUniform1f('uScreenWidth', screenWidth);
            shader.setUniform1f('uScreenHeight', screenHeight);
            shader.setUniform1f('near', camera.near);
            shader.setUniform1f('far', camera.far);
            if (camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.OrthographicCamera) {
                const orthoSize = getOrthographicVisibleSize(camera);
                shader.setUniform('uUseOrthographicCamera', true);
                shader.setUniform('uOrthoWidth', orthoSize.width);
                shader.setUniform('uOrthoHeight', orthoSize.height);
                shader.setUniform1f('uEDLOrthoScale', getOrthographicEDLScale(camera));
            } else if (camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.PerspectiveCamera) {
                shader.setUniform('uUseOrthographicCamera', false);
                shader.setUniform1f('fov', Math.PI * camera.fov / 180);
            }
            if (material.clipBoxes.length + material.clipPolygons.length === 0) shader.setUniform1i('clipTask', __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.ClipTask.NONE);
            else shader.setUniform1i('clipTask', material.clipTask);
            shader.setUniform1i('clipMethod', material.clipMethod);
            if (material.clipBoxes && material.clipBoxes.length > 0) {
                const lClipBoxes = shader.uniformLocations['clipBoxes[0]'];
                gl.uniformMatrix4fv(lClipBoxes, false, material.uniforms.clipBoxes.value);
            }
            if (params.clipSpheres && params.clipSpheres.length > 0) {
                const clipSpheres = params.clipSpheres;
                const matrices = [];
                for (const clipSphere of clipSpheres){
                    const clipToWorld = clipSphere.matrixWorld;
                    const viewToWorld = camera.matrixWorld;
                    const worldToClip = clipToWorld.clone().invert();
                    const viewToClip = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4().multiplyMatrices(worldToClip, viewToWorld);
                    matrices.push(viewToClip);
                }
                const flattenedMatrices = matrices.flatMap((matrix)=>matrix.elements);
                const lClipSpheres = shader.uniformLocations['uClipSpheres[0]'];
                gl.uniformMatrix4fv(lClipSpheres, false, flattenedMatrices);
            }
            shader.setUniform1f('size', material.size);
            shader.setUniform1f('maxSize', material.uniforms.maxSize.value);
            shader.setUniform1f('minSize', material.uniforms.minSize.value);
            shader.setUniform1f('uOctreeSpacing', material.spacing);
            shader.setUniform('uOctreeSize', material.uniforms.octreeSize.value);
            shader.setUniform3f('uColor', material.color.toArray());
            shader.setUniform1f('uOpacity', material.opacity);
            shader.setUniform('uEnableZClip', material.enableZClip);
            shader.setUniform('uZClipRange', material.zClipRange);
            shader.setUniform2f('elevationRange', material.elevationRange);
            shader.setUniform2f('intensityRange', material.intensityRange);
            shader.setUniform2f('activeSamplingRange', material.activeSamplingRange);
            shader.setUniform3f('uIntensity_gbc', [
                material.intensityGamma,
                material.intensityBrightness,
                material.intensityContrast
            ]);
            shader.setUniform3f('uRGB_gbc', [
                material.rgbGamma,
                material.rgbBrightness,
                material.rgbContrast
            ]);
            shader.setUniform1f('uTransition', material.transition);
            shader.setUniform1f('wRGB', material.weightRGB);
            shader.setUniform1f('wIntensity', material.weightIntensity);
            shader.setUniform1f('wElevation', material.weightElevation);
            shader.setUniform1f('wClassification', material.weightClassification);
            shader.setUniform1f('wReturnNumber', material.weightReturnNumber);
            shader.setUniform1f('wSourceID', material.weightSourceID);
            shader.setUniform('backfaceCulling', material.uniforms.backfaceCulling.value);
            const vnWebGLTexture = this.textures.get(material.visibleNodesTexture);
            if (vnWebGLTexture) {
                shader.setUniform1i('visibleNodes', currentTextureBindingPoint);
                gl.activeTexture(gl.TEXTURE0 + currentTextureBindingPoint);
                gl.bindTexture(vnWebGLTexture.target, vnWebGLTexture.id);
                currentTextureBindingPoint++;
            }
            const gradientTexture = this.textures.get(material.gradientTexture);
            if (gradientTexture) {
                shader.setUniform1i('gradient', currentTextureBindingPoint);
                gl.activeTexture(gl.TEXTURE0 + currentTextureBindingPoint);
                gl.bindTexture(gradientTexture.target, gradientTexture.id);
                const repeat = material.elevationGradientRepeat;
                if (repeat === __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.ElevationGradientRepeat.REPEAT) {
                    gl.texParameteri(gradientTexture.target, gl.TEXTURE_WRAP_S, gl.REPEAT);
                    gl.texParameteri(gradientTexture.target, gl.TEXTURE_WRAP_T, gl.REPEAT);
                } else if (repeat === __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.ElevationGradientRepeat.MIRRORED_REPEAT) {
                    gl.texParameteri(gradientTexture.target, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
                    gl.texParameteri(gradientTexture.target, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
                } else {
                    gl.texParameteri(gradientTexture.target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gradientTexture.target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                }
            }
            currentTextureBindingPoint++;
            const classificationTexture = this.textures.get(material.classificationTexture);
            if (classificationTexture) {
                shader.setUniform1i('classificationLUT', currentTextureBindingPoint);
                gl.activeTexture(gl.TEXTURE0 + currentTextureBindingPoint);
                gl.bindTexture(classificationTexture.target, classificationTexture.id);
            }
            currentTextureBindingPoint++;
            const matcapTexture = this.textures.get(material.matcapTexture);
            if (matcapTexture) {
                shader.setUniform1i('matcapTextureUniform', currentTextureBindingPoint);
                gl.activeTexture(gl.TEXTURE0 + currentTextureBindingPoint);
                gl.bindTexture(matcapTexture.target, matcapTexture.id);
            }
            currentTextureBindingPoint++;
            if (true === material.snapEnabled) {
                {
                    const lSnapshot = shader.uniformLocations['uSnapshot[0]'];
                    const lSnapshotDepth = shader.uniformLocations['uSnapshotDepth[0]'];
                    const bindingStart = currentTextureBindingPoint;
                    const lSnapshotBindingPoints = new Array(5).fill(bindingStart).map((a, i)=>a + i);
                    const lSnapshotDepthBindingPoints = new Array(5).fill(1 + Math.max(...lSnapshotBindingPoints)).map((a, i)=>a + i);
                    currentTextureBindingPoint = 1 + Math.max(...lSnapshotDepthBindingPoints);
                    gl.uniform1iv(lSnapshot, lSnapshotBindingPoints);
                    gl.uniform1iv(lSnapshotDepth, lSnapshotDepthBindingPoints);
                    for(let i = 0; i < 5; i++){
                        const texture = material.uniforms["uSnapshot"].value[i];
                        const textureDepth = material.uniforms["uSnapshotDepth"].value[i];
                        if (!texture) break;
                        const snapTexture = this.threeRenderer.properties.get(texture).__webglTexture;
                        const snapTextureDepth = this.threeRenderer.properties.get(textureDepth).__webglTexture;
                        const bindingPoint = lSnapshotBindingPoints[i];
                        const depthBindingPoint = lSnapshotDepthBindingPoints[i];
                        gl.activeTexture(gl[`TEXTURE${bindingPoint}`]);
                        gl.bindTexture(gl.TEXTURE_2D, snapTexture);
                        gl.activeTexture(gl[`TEXTURE${depthBindingPoint}`]);
                        gl.bindTexture(gl.TEXTURE_2D, snapTextureDepth);
                    }
                }
                {
                    const flattenedMatrices = material.uniforms.uSnapView.value.flatMap((c)=>c.elements);
                    const lSnapView = shader.uniformLocations['uSnapView[0]'];
                    gl.uniformMatrix4fv(lSnapView, false, flattenedMatrices);
                }
                {
                    const flattenedMatrices = material.uniforms.uSnapProj.value.flatMap((c)=>c.elements);
                    const lSnapProj = shader.uniformLocations['uSnapProj[0]'];
                    gl.uniformMatrix4fv(lSnapProj, false, flattenedMatrices);
                }
                {
                    const flattenedMatrices = material.uniforms.uSnapProjInv.value.flatMap((c)=>c.elements);
                    const lSnapProjInv = shader.uniformLocations['uSnapProjInv[0]'];
                    gl.uniformMatrix4fv(lSnapProjInv, false, flattenedMatrices);
                }
                {
                    const flattenedMatrices = material.uniforms.uSnapViewInv.value.flatMap((c)=>c.elements);
                    const lSnapViewInv = shader.uniformLocations['uSnapViewInv[0]'];
                    gl.uniformMatrix4fv(lSnapViewInv, false, flattenedMatrices);
                }
            }
        }
        shader.setUniform1f('uVNBufferLength', uVNBufferLength);
        this.renderNodes(octree, nodes, visibilityTextureData, camera, target, shader, params);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE0);
    }
    render(scene, camera, target = null, params = {}) {
        const gl = this.gl;
        if (null != target) this.threeRenderer.setRenderTarget(target);
        const traversalResult = this.traverse(scene);
        for (const octree of traversalResult.octrees){
            const nodes = octree.visibleNodes;
            this.renderOctree(octree, nodes, camera, target, params);
        }
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
        this.threeRenderer.resetState();
    }
    _countShaderUniformBlocks(shader) {
        let count = 0;
        for (const cached of shader.cache.values())count += Object.keys(cached.uniformBlocks).length;
        return count;
    }
    _deleteWebGLBuffer(webglBuffer) {
        if (webglBuffer.vao) {
            this.gl.deleteVertexArray(webglBuffer.vao);
            this.vaoDeletedCount++;
            webglBuffer.vao = null;
        }
        for (const vbo of webglBuffer.vbos.values())if (vbo.handle) {
            this.gl.deleteBuffer(vbo.handle);
            this.vboDeletedCount++;
            this.vboReleasedBytes += vbo.byteLength;
            vbo.handle = null;
        }
        webglBuffer.vbos.clear();
    }
    _recordShaderResourceCreation(shader, previousEntries, previousUniformBlocks) {
        const createdPrograms = Math.max(0, shader.cache.size - previousEntries);
        const createdUniformBuffers = Math.max(0, this._countShaderUniformBlocks(shader) - previousUniformBlocks);
        this.programCreatedCount += createdPrograms;
        this.shaderCreatedCount += 2 * createdPrograms;
        this.uniformBufferCreatedCount += createdUniformBuffers;
    }
    dispose() {
        for (const shader of this.shaders.values()){
            const gl = this.gl;
            gl.deleteShader(shader.vs);
            gl.deleteShader(shader.fs);
            gl.deleteProgram(shader.program);
            if (shader.vs) this.shaderDeletedCount++;
            if (shader.fs) this.shaderDeletedCount++;
            if (shader.program) this.programDeletedCount++;
            shader.cache.clear();
        }
        this.shaders.clear();
        for (const [geometry, buffer] of this.buffers){
            if (buffer.disposeHandler) {
                geometry.removeEventListener('dispose', buffer.disposeHandler);
                buffer.disposeHandler = null;
            }
            this._deleteWebGLBuffer(buffer);
        }
        this.buffers.clear();
        for (const texture of this.textures.values()){
            const gl = this.gl;
            gl.deleteTexture(texture.id);
            if (texture.id) this.textureDeletedCount++;
        }
        this.textures.clear();
    }
}
export { PotreeRenderer, PotreeRenderer as Renderer, getOrthographicEDLScale, getOrthographicVisibleSize, normalizeGpsTimeClipRange };
