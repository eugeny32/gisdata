import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__core_gsplatBatching_js_2c6b5696__ from "../core/gsplatBatching.js";
import * as __WEBPACK_EXTERNAL_MODULE__materials_GaussianSplatMaterial_js_9bde232b__ from "../materials/GaussianSplatMaterial.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__ from "../../../shared/constants/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('gsplat:spatial');
class GSplatGpuPicker {
    static #_ = this.currentFrameId = 0;
    constructor(renderer, widthOrOptions, height, options){
        this.idRanges = [];
        this.currentSplatInfos = [];
        this.pickMaterials = new Map();
        this.tempMeshes = [];
        this.tempGeometries = [];
        this.tempCameraPosition = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        this.tempSceneOrigin = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        this.prepared = false;
        this.renderCompleted = false;
        this.prepareFrameId = -1;
        this.preparedCameraMatrixWorld = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4();
        this.preparedCameraProjectionMatrix = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4();
        this.hasPreparedCameraState = false;
        this.renderer = renderer;
        if ('object' == typeof widthOrOptions) {
            const opts = widthOrOptions;
            this.width = opts.width ?? __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.DEFAULT_PICK_BUFFER_SIZE;
            this.height = opts.height ?? __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.DEFAULT_PICK_BUFFER_SIZE;
            this.alphaClip = opts.alphaClip ?? __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.DEFAULT_PICK_ALPHA_CLIP;
        } else {
            this.width = widthOrOptions ?? options?.width ?? __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.DEFAULT_PICK_BUFFER_SIZE;
            this.height = height ?? options?.height ?? __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.DEFAULT_PICK_BUFFER_SIZE;
            this.alphaClip = options?.alphaClip ?? __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.DEFAULT_PICK_ALPHA_CLIP;
        }
        this.pickRenderTarget = new __WEBPACK_EXTERNAL_MODULE_three__.WebGLRenderTarget(this.width, this.height, {
            format: __WEBPACK_EXTERNAL_MODULE_three__.RGBAFormat,
            type: __WEBPACK_EXTERNAL_MODULE_three__.UnsignedByteType,
            minFilter: __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter,
            magFilter: __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter,
            generateMipmaps: false,
            stencilBuffer: false,
            depthBuffer: true
        });
        if (this.width <= 0 || this.height <= 0) log.error('[GSplatGpuPicker] Invalid render target size: width=' + this.width + ', height=' + this.height);
        this.pickScene = new __WEBPACK_EXTERNAL_MODULE_three__.Scene();
        this.pixelBuffer = new Uint8Array(4);
    }
    resize(width, height) {
        if (this.width === width && this.height === height) return;
        this.width = width;
        this.height = height;
        this.pickRenderTarget.setSize(width, height);
        this.prepared = false;
        this.renderCompleted = false;
        this.hasPreparedCameraState = false;
    }
    prepare(camera, manager, splatInfos) {
        this.idRanges.length = 0;
        this.currentSplatInfos = splatInfos;
        this.prepareFrameId = GSplatGpuPicker.currentFrameId;
        this.renderCompleted = false;
        this.clearPickScene();
        camera.updateMatrixWorld(true);
        this.preparedCameraMatrixWorld.copy(camera.matrixWorld);
        this.preparedCameraProjectionMatrix.copy(camera.projectionMatrix);
        this.hasPreparedCameraState = true;
        camera.getWorldPosition(this.tempCameraPosition);
        const workBufferGroups = new Map();
        let globalId = 0;
        for (const splatInfo of splatInfos){
            const sourceNode = this.resolvePickSourceNode(splatInfo);
            if (sourceNode && this.isWorkBufferPickSource(sourceNode)) {
                const key = sourceNode;
                let group = workBufferGroups.get(key);
                if (!group) {
                    group = {
                        sourceNode,
                        members: []
                    };
                    workBufferGroups.set(key, group);
                }
                group.members.push(splatInfo);
                continue;
            }
            const startId = globalId;
            globalId += splatInfo.numSplats;
            this.idRanges.push({
                startId,
                endId: globalId,
                mode: 'direct',
                splatInfo
            });
            const materialKey = this.getPickMaterialKey(splatInfo, sourceNode);
            let pickMaterial = this.pickMaterials.get(materialKey);
            if (!pickMaterial) {
                const newMaterial = this.createPickMaterial(splatInfo);
                if (!newMaterial) continue;
                pickMaterial = newMaterial;
                this.pickMaterials.set(materialKey, pickMaterial);
            }
            this.syncScalarState(pickMaterial, manager);
            pickMaterial.setPickId(this.encodePickId(startId));
            const transformNode = sourceNode ?? splatInfo.node;
            transformNode.updateMatrixWorld(true);
            pickMaterial.setCameraParams(camera);
            pickMaterial.setViewport(this.width, this.height);
            pickMaterial.setCameraPositionWorld(this.tempCameraPosition);
            pickMaterial.setOriginToCamera(this.resolveSceneOrigin(transformNode, splatInfo.node), this.tempCameraPosition);
            const geometry = sourceNode?.geometry ?? splatInfo.geometry;
            if (!geometry) continue;
            const pickMesh = new __WEBPACK_EXTERNAL_MODULE_three__.Mesh(geometry, pickMaterial);
            pickMesh.matrixWorld.copy(transformNode.matrixWorld);
            pickMesh.matrixAutoUpdate = false;
            pickMesh.frustumCulled = false;
            this.pickScene.add(pickMesh);
            this.tempMeshes.push(pickMesh);
        }
        for (const [, group] of workBufferGroups){
            const sourceNode = group.sourceNode;
            const geometry = sourceNode.geometry;
            if (!geometry || 0 === group.members.length) continue;
            const visibleSplatCount = this.getWorkBufferVisibleSplatCount(sourceNode, manager);
            const batchInstanceCount = (0, __WEBPACK_EXTERNAL_MODULE__core_gsplatBatching_js_2c6b5696__.getGSplatBatchInstanceCount)(visibleSplatCount);
            if (visibleSplatCount <= 0 || batchInstanceCount <= 0) continue;
            const startId = globalId;
            globalId += visibleSplatCount;
            this.idRanges.push({
                startId,
                endId: globalId,
                mode: 'workbuffer',
                ownerRanges: group.members.map((splatInfo)=>({
                        startWorkId: splatInfo.lineStart * manager.textureSize,
                        endWorkId: splatInfo.lineStart * manager.textureSize + splatInfo.activeSplats,
                        splatInfo
                    })).sort((a, b)=>a.startWorkId - b.startWorkId)
            });
            const materialKey = sourceNode;
            let pickMaterial = this.pickMaterials.get(materialKey);
            if (!pickMaterial) {
                const newMaterial = this.createPickMaterial(group.members[0]);
                if (!newMaterial) continue;
                pickMaterial = newMaterial;
                this.pickMaterials.set(materialKey, pickMaterial);
            }
            this.syncScalarState(pickMaterial, manager);
            pickMaterial.setUnifiedLODTextures(manager.colorTexture, manager.splatTexture0, manager.splatTexture1, manager.orderTexture, manager.textureSize);
            pickMaterial.setPickId(this.encodePickId(startId));
            pickMaterial.setMetadata(visibleSplatCount, manager.textureSize, manager.textureSize);
            sourceNode.updateMatrixWorld(true);
            pickMaterial.setCameraParams(camera);
            pickMaterial.setViewport(this.width, this.height);
            pickMaterial.setCameraPositionWorld(this.tempCameraPosition);
            pickMaterial.setOriginToCamera(this.resolveSceneOrigin(sourceNode, group.members[0].node), this.tempCameraPosition);
            const pickGeometry = geometry.clone();
            if ('instanceCount' in pickGeometry) pickGeometry.instanceCount = batchInstanceCount;
            this.tempGeometries.push(pickGeometry);
            const pickMesh = new __WEBPACK_EXTERNAL_MODULE_three__.Mesh(pickGeometry, pickMaterial);
            pickMesh.matrixWorld.copy(sourceNode.matrixWorld);
            pickMesh.matrixAutoUpdate = false;
            pickMesh.frustumCulled = false;
            this.pickScene.add(pickMesh);
            this.tempMeshes.push(pickMesh);
        }
        this.renderPickBuffer(camera);
        this.prepared = true;
    }
    isReady() {
        if (!this.prepared) return false;
        const framesSincePrepare = GSplatGpuPicker.currentFrameId - this.prepareFrameId;
        if (framesSincePrepare < 2) return false;
        if (this.renderCompleted) return true;
        return framesSincePrepare >= 5;
    }
    isPreparedFor(camera) {
        if (!this.prepared || !this.hasPreparedCameraState) return false;
        camera.updateMatrixWorld(true);
        return this.preparedCameraMatrixWorld.equals(camera.matrixWorld) && this.preparedCameraProjectionMatrix.equals(camera.projectionMatrix);
    }
    createPickMaterial(splatInfo) {
        const sourceNode = this.resolvePickSourceNode(splatInfo);
        const geometry = sourceNode?.geometry ?? splatInfo.geometry;
        if (!geometry) return null;
        const pickMaterial = new __WEBPACK_EXTERNAL_MODULE__materials_GaussianSplatMaterial_js_9bde232b__.GaussianSplatMaterial({
            pass: 'pick',
            alphaClip: this.alphaClip,
            enableSH: false,
            depthWrite: true,
            depthTest: true
        });
        if (geometry.dataTextureA && geometry.dataTextureB && geometry.colorTexture && geometry.orderTexture) {
            pickMaterial.setDataTextures(geometry.dataTextureA, geometry.dataTextureB, geometry.colorTexture, geometry.orderTexture);
            pickMaterial.setMetadata(splatInfo.numSplats, geometry.dataWidth, geometry.orderWidth);
        } else {
            const srcMaterial = sourceNode?.material ?? splatInfo.material;
            if (srcMaterial?.uniforms) this.copyMaterialUniforms(pickMaterial, srcMaterial);
        }
        return pickMaterial;
    }
    resolvePickSourceNode(splatInfo) {
        const node = splatInfo.node;
        if (this.isPickRenderableNode(node)) return node;
        return this.findPickRenderableDescendant(node);
    }
    resolveSceneOrigin(sourceNode, fallbackNode) {
        const sourceOverride = sourceNode.__sceneOriginOverride;
        if (sourceOverride) return this.tempSceneOrigin.copy(sourceOverride);
        const fallbackOverride = fallbackNode.__sceneOriginOverride;
        if (fallbackOverride) return this.tempSceneOrigin.copy(fallbackOverride);
        return this.tempSceneOrigin.setFromMatrixPosition(sourceNode.matrixWorld);
    }
    findPickRenderableDescendant(node) {
        const children = Array.isArray(node.children) ? node.children : [];
        for (const child of children){
            const candidate = child;
            if (this.isPickRenderableNode(candidate)) return candidate;
            const descendant = this.findPickRenderableDescendant(candidate);
            if (descendant) return descendant;
        }
        return null;
    }
    isPickRenderableNode(node) {
        if (!node?.geometry || !node?.material) return false;
        const material = node.material;
        return Boolean(material.uniforms?.transformA) && Boolean(material.uniforms?.splatOrder);
    }
    copyMaterialUniforms(target, source) {
        const uniformNames = [
            'transformA',
            'transformB',
            'splatColor',
            'splatOrder',
            'numSplats',
            'dataWidth',
            'orderWidth',
            'splatScalar',
            'scalarFilterEnabled',
            'scalarFilterRange'
        ];
        for (const name of uniformNames)if (source.uniforms[name]) {
            target.uniforms[name] = target.uniforms[name] || {};
            target.uniforms[name].value = source.uniforms[name].value;
        }
        if (source.defines.GSPLAT_SOGS_DATA) {
            target.defines.GSPLAT_SOGS_DATA = 1;
            const sogsUniforms = [
                'splatMeansLow',
                'splatMeansHigh',
                'splatQuats',
                'splatScales'
            ];
            for (const name of sogsUniforms)if (source.uniforms[name]) {
                target.uniforms[name] = target.uniforms[name] || {};
                target.uniforms[name].value = source.uniforms[name].value;
            }
            if (source.uniforms.sogsMeans_mins && target.uniforms.sogsMeans_mins) target.uniforms.sogsMeans_mins.value.copy(source.uniforms.sogsMeans_mins.value);
            if (source.uniforms.sogsMeans_maxs && target.uniforms.sogsMeans_maxs) target.uniforms.sogsMeans_maxs.value.copy(source.uniforms.sogsMeans_maxs.value);
        }
        if (source.defines.GSPLAT_SOGS_V2) target.defines.GSPLAT_SOGS_V2 = 1;
        if (source.defines.GSPLAT_WORKBUFFER_DATA) target.defines.GSPLAT_WORKBUFFER_DATA = 1;
        this.syncMaterialDefine(target, 'HAS_SCALAR_FILTER', Boolean(source.defines.HAS_SCALAR_FILTER));
    }
    syncMaterialDefine(material, defineName, enabled) {
        const hadDefine = defineName in material.defines;
        if (enabled === hadDefine) return;
        if (enabled) material.defines[defineName] = 1;
        else delete material.defines[defineName];
        material.needsUpdate = true;
    }
    syncScalarState(material, manager) {
        const filterConfig = manager.getScalarFilterConfig();
        if (filterConfig?.enabled && manager.scalarTexture && manager.scalarTextureVersion > 0) {
            material.setScalarTexture(manager.scalarTexture);
            material.setScalarFilter(true, filterConfig.min, filterConfig.max);
            return;
        }
        material.setScalarTexture(null);
        material.setScalarFilter(false, 0, 1);
    }
    encodePickId(startId) {
        return [
            (0xff & startId) / 255,
            (startId >> 8 & 0xff) / 255,
            (startId >> 16 & 0xff) / 255,
            (startId >> 24 & 0xff) / 255
        ];
    }
    getPickMaterialKey(splatInfo, sourceNode) {
        return sourceNode && this.isWorkBufferPickSource(sourceNode) ? sourceNode : splatInfo;
    }
    isWorkBufferPickSource(sourceNode) {
        const material = sourceNode.material;
        return Boolean(material?.defines?.GSPLAT_WORKBUFFER_DATA);
    }
    getWorkBufferVisibleSplatCount(sourceNode, manager) {
        const material = sourceNode.material;
        const materialCount = material?.uniforms?.numSplats?.value;
        if ('number' == typeof materialCount && Number.isFinite(materialCount) && materialCount >= 0) return Math.floor(materialCount);
        return Math.max(0, Math.floor(manager.visibleSplatCount));
    }
    findRangeByGlobalId(globalId) {
        const ranges = this.idRanges;
        let lo = 0;
        let hi = ranges.length - 1;
        while(lo <= hi){
            const mid = lo + hi >>> 1;
            const r = ranges[mid];
            if (globalId < r.startId) hi = mid - 1;
            else {
                if (!(globalId >= r.endId)) return r;
                lo = mid + 1;
            }
        }
        return null;
    }
    findWorkBufferOwnerById(ownerRanges, workBufferId) {
        let lo = 0;
        let hi = ownerRanges.length - 1;
        while(lo <= hi){
            const mid = lo + hi >>> 1;
            const range = ownerRanges[mid];
            if (workBufferId < range.startWorkId) hi = mid - 1;
            else {
                if (!(workBufferId >= range.endWorkId)) return range;
                lo = mid + 1;
            }
        }
        return null;
    }
    getOriginalIndexFromActiveIndex(splatInfo, activeIndex) {
        if (activeIndex < 0) return -1;
        if (0 === splatInfo.intervals.length) return activeIndex < splatInfo.activeSplats ? activeIndex : -1;
        let cursor = 0;
        for(let i = 0; i < splatInfo.intervals.length; i += 2){
            const start = splatInfo.intervals[i];
            const end = splatInfo.intervals[i + 1];
            const segmentLength = end - start;
            if (activeIndex < cursor + segmentLength) return start + (activeIndex - cursor);
            cursor += segmentLength;
        }
        return -1;
    }
    clearPickScene() {
        for (const mesh of this.tempMeshes)this.pickScene.remove(mesh);
        this.tempMeshes = [];
        for (const geometry of this.tempGeometries)geometry.dispose();
        this.tempGeometries = [];
    }
    renderPickBuffer(camera) {
        const currentRenderTarget = this.renderer.getRenderTarget();
        const currentClearColor = new __WEBPACK_EXTERNAL_MODULE_three__.Color();
        this.renderer.getClearColor(currentClearColor);
        const currentClearAlpha = this.renderer.getClearAlpha();
        const currentViewport = 'function' == typeof this.renderer.getViewport ? this.renderer.getViewport(new __WEBPACK_EXTERNAL_MODULE_three__.Vector4()) : null;
        const currentScissor = 'function' == typeof this.renderer.getScissor ? this.renderer.getScissor(new __WEBPACK_EXTERNAL_MODULE_three__.Vector4()) : null;
        const currentScissorTest = 'function' == typeof this.renderer.getScissorTest ? this.renderer.getScissorTest() : null;
        this.pickRenderTarget.viewport.set(0, 0, this.width, this.height);
        this.pickRenderTarget.scissor.set(0, 0, this.width, this.height);
        this.pickRenderTarget.scissorTest = false;
        this.renderer.setRenderTarget(this.pickRenderTarget);
        this.renderer.setClearColor(0xffffffff, 1);
        this.renderer.clear(true, true, false);
        this.renderer.render(this.pickScene, camera);
        this.renderer.setRenderTarget(currentRenderTarget);
        if (currentViewport && 'function' == typeof this.renderer.setViewport) this.renderer.setViewport(currentViewport.x, currentViewport.y, currentViewport.z, currentViewport.w);
        if (currentScissor && 'function' == typeof this.renderer.setScissor) this.renderer.setScissor(currentScissor.x, currentScissor.y, currentScissor.z, currentScissor.w);
        if (null !== currentScissorTest && 'function' == typeof this.renderer.setScissorTest) this.renderer.setScissorTest(currentScissorTest);
        this.renderer.setClearColor(currentClearColor, currentClearAlpha);
    }
    pick(screenX, screenY, screenWidth, screenHeight) {
        const results = this.pickRect(screenX, screenY, 1, 1, screenWidth, screenHeight);
        return results.length > 0 ? results[0] : null;
    }
    pickRect(x, y, width, height, screenWidth, screenHeight) {
        if (!this.prepared) {
            log.warn('[GSplatGpuPicker] 未准备 pick buffer，请先调用 prepare()');
            return [];
        }
        if (this.width <= 0 || this.height <= 0) {
            log.error(`[GSplatGpuPicker] Invalid render target size: ${this.width}x${this.height}`);
            return [];
        }
        const scaleX = this.width / screenWidth;
        const scaleY = this.height / screenHeight;
        const bufferX = Math.floor(x * scaleX);
        const bufferY = Math.floor(y * scaleY);
        const bufferWidth = Math.max(1, Math.floor(width * scaleX));
        const bufferHeight = Math.max(1, Math.floor(height * scaleY));
        if (bufferX < 0 || bufferY < 0 || bufferX >= this.width || bufferY >= this.height || bufferWidth <= 0 || bufferHeight <= 0) {
            log.warn('[GSplatGpuPicker] Pick coordinates out of bounds: bufferX=' + bufferX + ', bufferY=' + bufferY + ', bufferWidth=' + bufferWidth + ', bufferHeight=' + bufferHeight + ', rtWidth=' + this.width + ', rtHeight=' + this.height);
            return [];
        }
        const pixelCount = bufferWidth * bufferHeight * 4;
        if (this.pixelBuffer.length < pixelCount) this.pixelBuffer = new Uint8Array(pixelCount);
        const gl = this.renderer.getContext();
        const currentRenderTarget = this.renderer.getRenderTarget();
        try {
            this.renderer.setRenderTarget(this.pickRenderTarget);
            const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
            if (status !== gl.FRAMEBUFFER_COMPLETE) {
                log.error(`[GSplatGpuPicker] Framebuffer is incomplete: ${status}`);
                this.renderer.setRenderTarget(currentRenderTarget);
                return [];
            }
            gl.readPixels(bufferX, this.height - bufferY - bufferHeight, bufferWidth, bufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, this.pixelBuffer);
        } catch (error) {
            log.error('[GSplatGpuPicker] Error reading pixels: ' + (error instanceof Error ? error.message : String(error)));
            return [];
        } finally{
            this.renderer.setRenderTarget(currentRenderTarget);
        }
        const results = this.decodePixels(this.pixelBuffer, bufferWidth * bufferHeight);
        if (results.length > 0) this.renderCompleted = true;
        return results;
    }
    decodePixels(pixels, count) {
        const results = [];
        const seen = new Set();
        for(let i = 0; i < count; i++){
            const offset = 4 * i;
            const r = pixels[offset + 0];
            const g = pixels[offset + 1];
            const b = pixels[offset + 2];
            const a = pixels[offset + 3];
            const globalId = (r | g << 8 | b << 16 | a << 24) >>> 0;
            if (0xffffffff === globalId || seen.has(globalId)) continue;
            seen.add(globalId);
            const range = this.findRangeByGlobalId(globalId);
            if (!range) continue;
            let splatInfo = null;
            let originalIndex = -1;
            if ('direct' === range.mode) {
                splatInfo = range.splatInfo;
                originalIndex = globalId - range.startId;
            } else {
                const workBufferId = globalId - range.startId;
                const ownerRange = this.findWorkBufferOwnerById(range.ownerRanges, workBufferId);
                if (!ownerRange) continue;
                splatInfo = ownerRange.splatInfo;
                originalIndex = this.getOriginalIndexFromActiveIndex(ownerRange.splatInfo, workBufferId - ownerRange.startWorkId);
            }
            if (!splatInfo || originalIndex < 0) continue;
            const worldPosition = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
            try {
                splatInfo.getSplatWorldCenter(originalIndex, worldPosition);
            } catch (_e) {
                worldPosition.set(0, 0, 0);
            }
            results.push({
                splatIndex: originalIndex,
                splatInfo,
                worldPosition
            });
        }
        return results;
    }
    async pickAsync(screenX, screenY, screenWidth, screenHeight) {
        const results = await this.pickRectAsync(screenX, screenY, 1, 1, screenWidth, screenHeight);
        return results.length > 0 ? results[0] : null;
    }
    async pickRectAsync(x, y, width, height, screenWidth, screenHeight) {
        if (!this.prepared) {
            log.warn('[GSplatGpuPicker] 未准备 pick buffer，请先调用 prepare()');
            return [];
        }
        const scaleX = this.width / screenWidth;
        const scaleY = this.height / screenHeight;
        const bufferX = Math.floor(x * scaleX);
        const bufferY = Math.floor(y * scaleY);
        const bufferWidth = Math.max(1, Math.floor(width * scaleX));
        const bufferHeight = Math.max(1, Math.floor(height * scaleY));
        const renderer = this.renderer;
        if ('function' != typeof renderer.readRenderTargetPixelsAsync) return this.pickRect(x, y, width, height, screenWidth, screenHeight);
        {
            const pixels = new Uint8Array(bufferWidth * bufferHeight * 4);
            await renderer.readRenderTargetPixelsAsync(this.pickRenderTarget, bufferX, this.height - bufferY - bufferHeight, bufferWidth, bufferHeight, pixels);
            return this.decodePixels(pixels, bufferWidth * bufferHeight);
        }
    }
    static pickWithCenters(ray, splatInfos, sphereRadius = 0.01, maxResults = __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.DEFAULT_MAX_PICK_RESULTS) {
        const tempCenter = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        const tempSphere = new __WEBPACK_EXTERNAL_MODULE_three__.Sphere();
        const tempIntersect = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        if (1 === maxResults) {
            let best = null;
            let bestDepth = 1 / 0;
            for (const splatInfo of splatInfos){
                const resource = splatInfo.resource;
                const centers = resource.centers;
                if (!centers) continue;
                const worldMatrix = splatInfo.node.matrixWorld;
                const testSplat = (i)=>{
                    tempCenter.set(centers[3 * i], centers[3 * i + 1], centers[3 * i + 2]);
                    tempCenter.applyMatrix4(worldMatrix);
                    const distToRay = ray.distanceToPoint(tempCenter);
                    if (distToRay > sphereRadius) return;
                    tempSphere.set(tempCenter, sphereRadius);
                    if (ray.intersectSphere(tempSphere, tempIntersect)) {
                        const depth = ray.origin.distanceTo(tempIntersect);
                        if (depth < bestDepth) {
                            bestDepth = depth;
                            best = {
                                splatIndex: i,
                                splatInfo,
                                worldPosition: tempCenter.clone(),
                                depth
                            };
                        }
                    }
                };
                const intervals = splatInfo.intervals;
                if (intervals.length > 0) for(let k = 0; k < intervals.length; k += 2)for(let i = intervals[k]; i < intervals[k + 1]; i++)testSplat(i);
                else {
                    const count = splatInfo.activeSplats > 0 ? splatInfo.activeSplats : splatInfo.numSplats;
                    for(let i = 0; i < count; i++)testSplat(i);
                }
            }
            return best ? [
                best
            ] : [];
        }
        const results = [];
        const collectLimit = 2 * maxResults;
        for (const splatInfo of splatInfos){
            const resource = splatInfo.resource;
            const centers = resource.centers;
            if (!centers) continue;
            const worldMatrix = splatInfo.node.matrixWorld;
            const testSplat = (i)=>{
                tempCenter.set(centers[3 * i], centers[3 * i + 1], centers[3 * i + 2]);
                tempCenter.applyMatrix4(worldMatrix);
                tempSphere.set(tempCenter, sphereRadius);
                if (ray.intersectSphere(tempSphere, tempIntersect)) results.push({
                    splatIndex: i,
                    splatInfo,
                    worldPosition: tempCenter.clone(),
                    depth: ray.origin.distanceTo(tempIntersect)
                });
            };
            const intervals = splatInfo.intervals;
            if (intervals.length > 0) for(let k = 0; k < intervals.length; k += 2){
                for(let i = intervals[k]; i < intervals[k + 1]; i++){
                    testSplat(i);
                    if (results.length >= collectLimit) break;
                }
                if (results.length >= collectLimit) break;
            }
            else {
                const count = splatInfo.activeSplats > 0 ? splatInfo.activeSplats : splatInfo.numSplats;
                for(let i = 0; i < count; i++){
                    testSplat(i);
                    if (results.length >= collectLimit) break;
                }
            }
            if (results.length >= collectLimit) break;
        }
        results.sort((a, b)=>(a.depth ?? 1 / 0) - (b.depth ?? 1 / 0));
        return results.slice(0, maxResults);
    }
    dispose() {
        this.pickRenderTarget.dispose();
        this.idRanges.length = 0;
        this.currentSplatInfos = [];
        this.prepared = false;
        this.renderCompleted = false;
        this.hasPreparedCameraState = false;
        this.clearPickScene();
        for (const [, material] of this.pickMaterials)material.dispose();
        this.pickMaterials.clear();
    }
    getDiagnostics() {
        return {
            currentInfos: this.currentSplatInfos.length,
            pickMaterials: this.pickMaterials.size
        };
    }
    static incrementFrameId() {
        GSplatGpuPicker.currentFrameId++;
    }
}
export { GSplatGpuPicker };
