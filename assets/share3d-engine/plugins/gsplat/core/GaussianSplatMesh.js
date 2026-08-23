import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__export_SplatExporter_js_2577a575__ from "../export/SplatExporter.js";
import * as __WEBPACK_EXTERNAL_MODULE__gpu_GSplatResolveSH_js_631f5d26__ from "../gpu/GSplatResolveSH.js";
import * as __WEBPACK_EXTERNAL_MODULE__lod_GSplatDirector_js_fb2a7fea__ from "../lod/GSplatDirector.js";
import * as __WEBPACK_EXTERNAL_MODULE__lod_GSplatPlacement_js_5aad7c85__ from "../lod/GSplatPlacement.js";
import * as __WEBPACK_EXTERNAL_MODULE__lod_GSplatResource_js_fccb9d9a__ from "../lod/GSplatResource.js";
import * as __WEBPACK_EXTERNAL_MODULE__lod_Layer_js_879f5cf0__ from "../lod/Layer.js";
import * as __WEBPACK_EXTERNAL_MODULE__lod_LayerComposition_js_ab0a4933__ from "../lod/LayerComposition.js";
import * as __WEBPACK_EXTERNAL_MODULE__materials_GaussianSplatMaterial_js_9bde232b__ from "../materials/GaussianSplatMaterial.js";
import * as __WEBPACK_EXTERNAL_MODULE__sorting_SplatSorter_js_06a7f42e__ from "../sorting/SplatSorter.js";
import * as __WEBPACK_EXTERNAL_MODULE__spatial_EllipsoidRaycast_js_861cbd52__ from "../spatial/EllipsoidRaycast.js";
import * as __WEBPACK_EXTERNAL_MODULE__tools_SplatCropper_js_1061a2f2__ from "../tools/SplatCropper.js";
import * as __WEBPACK_EXTERNAL_MODULE__utils_getRendererViewportSize_js_7c6ff589__ from "../utils/getRendererViewportSize.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__ from "../../../shared/constants/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__CompressedSplatData_js_d49ef5ff__ from "./CompressedSplatData.js";
import * as __WEBPACK_EXTERNAL_MODULE__GaussianSplatGeometry_js_694c78fa__ from "./GaussianSplatGeometry.js";
import * as __WEBPACK_EXTERNAL_MODULE__SogsData_js_e6cfed53__ from "./SogsData.js";
import * as __WEBPACK_EXTERNAL_MODULE__SplatData_js_df8b864e__ from "./SplatData.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('gsplat:core');
class GaussianSplatMesh extends __WEBPACK_EXTERNAL_MODULE_three__.Mesh {
    static #_ = this.SORT_POSITION_THRESHOLD = __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.GSPLAT_SORT_POSITION_THRESHOLD;
    static #_2 = this.SORT_DIRECTION_THRESHOLD = __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.GSPLAT_SORT_DIRECTION_THRESHOLD;
    constructor(splatData, options = {}){
        const isCompressed = splatData instanceof __WEBPACK_EXTERNAL_MODULE__CompressedSplatData_js_d49ef5ff__.CompressedSplatData;
        const isSogs = splatData instanceof __WEBPACK_EXTERNAL_MODULE__SogsData_js_e6cfed53__.SogsData;
        let geometryData;
        if (isSogs) {
            const sogs = splatData;
            geometryData = GaussianSplatMesh.decompressFromSogs(sogs);
        } else if (isCompressed) {
            const compressed = splatData;
            geometryData = GaussianSplatMesh.decompressForGeometry(compressed);
        } else geometryData = splatData;
        const geometry = new __WEBPACK_EXTERNAL_MODULE__GaussianSplatGeometry_js_694c78fa__.GaussianSplatGeometry(geometryData);
        const actualSHBands = geometry.shBands;
        const effectiveEnableSH = actualSHBands > 0 ? options.enableSH ?? true : false;
        const effectiveMaxSHBands = actualSHBands > 0 ? options.maxSHBands ?? actualSHBands : 0;
        const material = new __WEBPACK_EXTERNAL_MODULE__materials_GaussianSplatMaterial_js_9bde232b__.GaussianSplatMaterial({
            depthWrite: options.depthWrite,
            depthTest: options.depthTest,
            transparent: options.transparent,
            enableSH: effectiveEnableSH,
            maxSHBands: effectiveMaxSHBands
        });
        super(geometry, material), this.sorter = null, this.cameraStates = null, this.colorSpaceManager = null, this._shaderEffect = null, this.cropper = null, this.director = null, this.composition = null, this.layer = null, this.placement = null, this.gsplatResource = null, this.resolveSH = null, this.shLabelsTexture = null, this.shCentroidsTexture = null, this.lastSortCameraPosition = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1 / 0, 1 / 0, 1 / 0), this.lastSortCameraDirection = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1 / 0, 1 / 0, 1 / 0), this._needsGpuPacking = false, this._gpuPackingMinimalMemory = false, this._needsUnifiedLodInit = false, this._unifiedLodResourcePath = null, this._placementResourcePath = null, this._rteCameraPos = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(), this._rteSceneOrigin = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(), this._sceneOriginOverride = null, this._viewportSize = new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(), this.onBeforeRender = (renderer, _scene, camera)=>{
            if (this._needsGpuPacking && this.splatData instanceof __WEBPACK_EXTERNAL_MODULE__SogsData_js_e6cfed53__.SogsData) {
                const sogs = this.splatData;
                const minimalMemory = this._gpuPackingMinimalMemory;
                const packed = sogs.packGpuMemory(renderer, minimalMemory);
                if (packed) {
                    this.material.setDataTextures(packed.dataTextureA, packed.dataTextureB, packed.colorTexture, this.geometry.orderTexture);
                    this.material.uniforms.dataWidth.value = packed.width;
                    if (this.material.defines.GSPLAT_SOGS_DATA) {
                        this.material.defines.GSPLAT_SOGS_DATA = void 0;
                        this.material.defines.GSPLAT_SOGS_V2 = void 0;
                        this.material.needsUpdate = true;
                    }
                    const shPaletteInfo = sogs.getShPaletteInfo();
                    if (shPaletteInfo && sogs.shLabels && sogs.shCentroids) {
                        this.shLabelsTexture = new __WEBPACK_EXTERNAL_MODULE_three__.DataTexture(sogs.shLabels, packed.width, packed.height, __WEBPACK_EXTERNAL_MODULE_three__.RGBAFormat, __WEBPACK_EXTERNAL_MODULE_three__.UnsignedByteType);
                        this.shLabelsTexture.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
                        this.shLabelsTexture.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
                        this.shLabelsTexture.needsUpdate = true;
                        const shNMeta = sogs.meta.shN;
                        let processedCentroids;
                        let shNMins;
                        let shNMaxs;
                        if (2 === sogs.meta.version && shNMeta?.codebook) {
                            const codebook = shNMeta.codebook;
                            const cbMin = codebook[0];
                            const cbMax = codebook[codebook.length - 1];
                            const cbRange = cbMax - cbMin;
                            processedCentroids = new Uint8Array(sogs.shCentroids.length);
                            for(let i = 0; i < sogs.shCentroids.length; i += 4){
                                for(let c = 0; c < 3; c++){
                                    const idx = sogs.shCentroids[i + c];
                                    const value = codebook[idx] ?? 0;
                                    const normalized = 0 !== cbRange ? (value - cbMin) / cbRange : 0;
                                    processedCentroids[i + c] = Math.round(255 * Math.max(0, Math.min(1, normalized)));
                                }
                                processedCentroids[i + 3] = sogs.shCentroids[i + 3];
                            }
                            shNMins = cbMin;
                            shNMaxs = cbMax;
                        } else {
                            processedCentroids = sogs.shCentroids;
                            shNMins = shNMeta?.mins ?? 0;
                            shNMaxs = shNMeta?.maxs ?? 1;
                        }
                        this.shCentroidsTexture = new __WEBPACK_EXTERNAL_MODULE_three__.DataTexture(processedCentroids, shPaletteInfo.width, shPaletteInfo.height, __WEBPACK_EXTERNAL_MODULE_three__.RGBAFormat, __WEBPACK_EXTERNAL_MODULE_three__.UnsignedByteType);
                        this.shCentroidsTexture.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
                        this.shCentroidsTexture.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
                        this.shCentroidsTexture.needsUpdate = true;
                        this.resolveSH = new __WEBPACK_EXTERNAL_MODULE__gpu_GSplatResolveSH_js_631f5d26__.GSplatResolveSH(renderer, shPaletteInfo.shBands);
                        this.resolveSH.setCentroids(this.shCentroidsTexture, shNMins, shNMaxs);
                        this.material.defines.USE_HIGH_QUALITY_SH = 1;
                        this.material.needsUpdate = true;
                        this.material.uniforms.sh_labels.value = this.shLabelsTexture;
                        this.material.uniforms.sh_result.value = this.resolveSH.texture;
                        if (this.material.uniforms.shN_mins) this.material.uniforms.shN_mins.value = new __WEBPACK_EXTERNAL_MODULE_three__.Vector4(shNMins, shNMins, shNMins, shNMins);
                        if (this.material.uniforms.shN_maxs) this.material.uniforms.shN_maxs.value = new __WEBPACK_EXTERNAL_MODULE_three__.Vector4(shNMaxs, shNMaxs, shNMaxs, shNMaxs);
                        this.material.defines.SH_BANDS = 0;
                        this.material.uniforms.shBands.value = 0;
                    }
                }
                this._needsGpuPacking = false;
                this._gpuPackingMinimalMemory = false;
            }
            if (this.resolveSH) this.resolveSH.render(camera, this.matrixWorld);
            if (this._needsUnifiedLodInit) {
                const resourcePath = this._unifiedLodResourcePath;
                if (resourcePath) this.initUnifiedLOD(renderer, camera, resourcePath);
                this._needsUnifiedLodInit = false;
                this._unifiedLodResourcePath = null;
            }
            if (this.director && this.composition) {
                this.director.updateForRender(this.composition);
                const manager = this.director.getManager(camera, this.layer);
                if (manager) {
                    this.material.setUnifiedLODTextures(manager.colorTexture, manager.splatTexture0, manager.splatTexture1, manager.orderTexture, manager.textureSize);
                    if (manager.isHighQualitySHActive && manager.shResultTexture) this.material.setHighQualitySHTexture(manager.shResultTexture, null);
                    else this.material.setHighQualitySHTexture(null);
                    const visibleSplatCount = manager.visibleSplatCount;
                    this.geometry.setVisibleSplatCount(visibleSplatCount);
                    this.material.setMetadata(visibleSplatCount, manager.textureSize, manager.textureSize);
                }
            }
            const size = (0, __WEBPACK_EXTERNAL_MODULE__utils_getRendererViewportSize_js_7c6ff589__.getRendererViewportDrawingBufferSize)(renderer, this._viewportSize);
            this.material.setViewport(size.x, size.y);
            this.material.setCameraParams(camera);
            camera.getWorldPosition(this._rteCameraPos);
            this.material.setCameraPositionWorld(this._rteCameraPos);
            if (this._sceneOriginOverride) this.material.setOriginToCamera(this._sceneOriginOverride, this._rteCameraPos);
            else {
                this._rteSceneOrigin.setFromMatrixPosition(this.matrixWorld);
                this.material.setOriginToCamera(this._rteSceneOrigin, this._rteCameraPos);
            }
            if (this.colorSpaceManager) this.colorSpaceManager.configureMaterial(this.material);
            else this.material.updateGammaMode(renderer);
            const shouldSort = this.checkCameraChanged(camera);
            if (this.cameraStates) {
                const state = this.cameraStates.get(camera);
                if (state) {
                    if (shouldSort) state.sorter.setCamera(camera, this.matrixWorld);
                    this.material.setDataTextures(this.geometry.dataTextureA, this.geometry.dataTextureB, this.geometry.colorTexture, state.orderTexture);
                } else {
                    if (this.sorter && shouldSort) this.sorter.setCamera(camera, this.matrixWorld);
                    this.material.setDataTextures(this.geometry.dataTextureA, this.geometry.dataTextureB, this.geometry.colorTexture, this.geometry.orderTexture);
                }
            } else if (this.sorter && shouldSort) this.sorter.setCamera(camera, this.matrixWorld);
        };
        this.splatData = splatData;
        if (isSogs && false !== options.enableGpuPacking) {
            this._needsGpuPacking = true;
            this._gpuPackingMinimalMemory = options.gpuPackingMinimalMemory || false;
        }
        material.setDataTextures(geometry.dataTextureA, geometry.dataTextureB, geometry.colorTexture, geometry.orderTexture);
        material.setMetadata(splatData.numSplats, geometry.dataWidth, geometry.orderWidth);
        if (geometry.shBands > 0 && geometry.shTextures.length > 0) material.setSHTextures(geometry.shTextures, geometry.shBands);
        if (options.customAabb) this.geometry.boundingBox = options.customAabb.clone();
        else {
            const aabb = new __WEBPACK_EXTERNAL_MODULE_three__.Box3();
            splatData.calcAabb(aabb);
            this.geometry.boundingBox = aabb;
        }
        this.updateBoundingSphereFromBox();
        if (false !== options.enableSorting) {
            const centers = splatData.getCenters();
            const sorterData = {
                numSplats: splatData.numSplats,
                getCenters: ()=>centers
            };
            this.sorter = new __WEBPACK_EXTERNAL_MODULE__sorting_SplatSorter_js_06a7f42e__.SplatSorter(sorterData, geometry.orderTexture, {
                ...options.sortingOptions,
                onSortComplete: (data)=>{
                    this.geometry.setVisibleSplatCount(data.count);
                    this.dispatchEvent({
                        type: 'sortComplete',
                        ...data
                    });
                }
            });
        }
        if (options.enableUnifiedLOD && options.unifiedLodResourcePath) {
            this._needsUnifiedLodInit = true;
            this._unifiedLodResourcePath = options.unifiedLodResourcePath;
        }
    }
    initUnifiedLOD(renderer, camera, resourcePath) {
        this.director = new __WEBPACK_EXTERNAL_MODULE__lod_GSplatDirector_js_fb2a7fea__.GSplatDirector(renderer);
        this.composition = new __WEBPACK_EXTERNAL_MODULE__lod_LayerComposition_js_ab0a4933__.LayerComposition();
        this.layer = new __WEBPACK_EXTERNAL_MODULE__lod_Layer_js_879f5cf0__.Layer('main-layer');
        this.layer.enabled = true;
        this.composition.addLayer(this.layer);
        let resourceData;
        if (this.splatData instanceof __WEBPACK_EXTERNAL_MODULE__CompressedSplatData_js_d49ef5ff__.CompressedSplatData) resourceData = GaussianSplatMesh.decompressForGeometry(this.splatData);
        else this.splatData, __WEBPACK_EXTERNAL_MODULE__SogsData_js_e6cfed53__.SogsData, resourceData = this.splatData;
        const resource = new __WEBPACK_EXTERNAL_MODULE__lod_GSplatResource_js_fccb9d9a__.GSplatResource(resourceData);
        this.gsplatResource = resource;
        this.placement = new __WEBPACK_EXTERNAL_MODULE__lod_GSplatPlacement_js_5aad7c85__.GSplatPlacement(resource, this);
        this.placement.aabb = resource.aabb;
        this._placementResourcePath = resourcePath;
        this.layer.addGSplatPlacement(this.placement);
        const cameraComponent = new __WEBPACK_EXTERNAL_MODULE__lod_LayerComposition_js_ab0a4933__.CameraComponent(camera, [
            this.layer.id
        ]);
        this.composition.addCamera(cameraComponent);
    }
    static decompressFromSogs(sogs) {
        const numSplats = sogs.numSplats;
        const shBands = sogs.shBands;
        const x = new Float32Array(numSplats);
        const y = new Float32Array(numSplats);
        const z = new Float32Array(numSplats);
        const rot_0 = new Float32Array(numSplats);
        const rot_1 = new Float32Array(numSplats);
        const rot_2 = new Float32Array(numSplats);
        const rot_3 = new Float32Array(numSplats);
        const scale_0 = new Float32Array(numSplats);
        const scale_1 = new Float32Array(numSplats);
        const scale_2 = new Float32Array(numSplats);
        const f_dc_0 = new Float32Array(numSplats);
        const f_dc_1 = new Float32Array(numSplats);
        const f_dc_2 = new Float32Array(numSplats);
        const opacity = new Float32Array(numSplats);
        const shCoeffsPerChannel = shBands > 0 ? [
            3,
            8,
            15
        ][shBands - 1] : 0;
        const fRest = [];
        for(let i = 0; i < 3 * shCoeffsPerChannel; i++)fRest.push(new Float32Array(numSplats));
        const iter = sogs.createIterator();
        for(let i = 0; i < numSplats; i++){
            const splat = iter.read(i);
            x[i] = splat.position[0];
            y[i] = splat.position[1];
            z[i] = splat.position[2];
            rot_0[i] = splat.rotation[0];
            rot_1[i] = splat.rotation[1];
            rot_2[i] = splat.rotation[2];
            rot_3[i] = splat.rotation[3];
            scale_0[i] = splat.scale[0];
            scale_1[i] = splat.scale[1];
            scale_2[i] = splat.scale[2];
            f_dc_0[i] = splat.color[0];
            f_dc_1[i] = splat.color[1];
            f_dc_2[i] = splat.color[2];
            opacity[i] = splat.opacity;
            if (splat.sh && shBands > 0) for(let c = 0; c < shCoeffsPerChannel; c++){
                fRest[3 * c + 0][i] = splat.sh[0 + c];
                fRest[3 * c + 1][i] = splat.sh[15 + c];
                fRest[3 * c + 2][i] = splat.sh[30 + c];
            }
        }
        const properties = [
            {
                name: 'x',
                type: 'float',
                storage: x
            },
            {
                name: 'y',
                type: 'float',
                storage: y
            },
            {
                name: 'z',
                type: 'float',
                storage: z
            },
            {
                name: 'f_dc_0',
                type: 'float',
                storage: f_dc_0
            },
            {
                name: 'f_dc_1',
                type: 'float',
                storage: f_dc_1
            },
            {
                name: 'f_dc_2',
                type: 'float',
                storage: f_dc_2
            }
        ];
        for(let i = 0; i < fRest.length; i++)properties.push({
            name: `f_rest_${i}`,
            type: 'float',
            storage: fRest[i]
        });
        properties.push({
            name: 'opacity',
            type: 'float',
            storage: opacity
        }, {
            name: 'scale_0',
            type: 'float',
            storage: scale_0
        }, {
            name: 'scale_1',
            type: 'float',
            storage: scale_1
        }, {
            name: 'scale_2',
            type: 'float',
            storage: scale_2
        }, {
            name: 'rot_0',
            type: 'float',
            storage: rot_0
        }, {
            name: 'rot_1',
            type: 'float',
            storage: rot_1
        }, {
            name: 'rot_2',
            type: 'float',
            storage: rot_2
        }, {
            name: 'rot_3',
            type: 'float',
            storage: rot_3
        });
        const splatData = new __WEBPACK_EXTERNAL_MODULE__SplatData_js_df8b864e__.SplatData();
        splatData.numSplats = numSplats;
        splatData.elements = [
            {
                name: 'vertex',
                count: numSplats,
                properties
            }
        ];
        return splatData;
    }
    static decompressForGeometry(compressed) {
        const numSplats = compressed.numSplats;
        const shBands = compressed.shBands;
        const x = new Float32Array(numSplats);
        const y = new Float32Array(numSplats);
        const z = new Float32Array(numSplats);
        const rot_0 = new Float32Array(numSplats);
        const rot_1 = new Float32Array(numSplats);
        const rot_2 = new Float32Array(numSplats);
        const rot_3 = new Float32Array(numSplats);
        const scale_0 = new Float32Array(numSplats);
        const scale_1 = new Float32Array(numSplats);
        const scale_2 = new Float32Array(numSplats);
        const f_dc_0 = new Float32Array(numSplats);
        const f_dc_1 = new Float32Array(numSplats);
        const f_dc_2 = new Float32Array(numSplats);
        const opacity = new Float32Array(numSplats);
        const shCoeffsPerChannel = shBands > 0 ? [
            3,
            8,
            15
        ][shBands - 1] : 0;
        const fRest = [];
        for(let i = 0; i < 3 * shCoeffsPerChannel; i++)fRest.push(new Float32Array(numSplats));
        const iter = compressed.createIterator();
        for(let i = 0; i < numSplats; i++){
            const splat = iter.read(i);
            x[i] = splat.position[0];
            y[i] = splat.position[1];
            z[i] = splat.position[2];
            rot_0[i] = splat.rotation[0];
            rot_1[i] = splat.rotation[1];
            rot_2[i] = splat.rotation[2];
            rot_3[i] = splat.rotation[3];
            scale_0[i] = splat.scale[0];
            scale_1[i] = splat.scale[1];
            scale_2[i] = splat.scale[2];
            f_dc_0[i] = splat.color[0];
            f_dc_1[i] = splat.color[1];
            f_dc_2[i] = splat.color[2];
            opacity[i] = splat.opacity;
            if (splat.sh) for(let k = 0; k < fRest.length; k++)fRest[k][i] = splat.sh[k];
        }
        const splatData = new __WEBPACK_EXTERNAL_MODULE__SplatData_js_df8b864e__.SplatData();
        splatData.numSplats = numSplats;
        const properties = [
            {
                name: 'x',
                type: 'float',
                storage: x
            },
            {
                name: 'y',
                type: 'float',
                storage: y
            },
            {
                name: 'z',
                type: 'float',
                storage: z
            },
            {
                name: 'f_dc_0',
                type: 'float',
                storage: f_dc_0
            },
            {
                name: 'f_dc_1',
                type: 'float',
                storage: f_dc_1
            },
            {
                name: 'f_dc_2',
                type: 'float',
                storage: f_dc_2
            },
            {
                name: 'opacity',
                type: 'float',
                storage: opacity
            },
            {
                name: 'scale_0',
                type: 'float',
                storage: scale_0
            },
            {
                name: 'scale_1',
                type: 'float',
                storage: scale_1
            },
            {
                name: 'scale_2',
                type: 'float',
                storage: scale_2
            },
            {
                name: 'rot_0',
                type: 'float',
                storage: rot_0
            },
            {
                name: 'rot_1',
                type: 'float',
                storage: rot_1
            },
            {
                name: 'rot_2',
                type: 'float',
                storage: rot_2
            },
            {
                name: 'rot_3',
                type: 'float',
                storage: rot_3
            }
        ];
        for(let i = 0; i < fRest.length; i++)properties.push({
            name: `f_rest_${i}`,
            type: 'float',
            storage: fRest[i]
        });
        splatData.elements = [
            {
                name: 'vertex',
                count: numSplats,
                properties
            }
        ];
        return splatData;
    }
    checkCameraChanged(camera) {
        const pos = camera.position;
        const dir = camera.getWorldDirection(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3());
        const posDelta = pos.distanceToSquared(this.lastSortCameraPosition);
        const posThreshold = GaussianSplatMesh.SORT_POSITION_THRESHOLD * GaussianSplatMesh.SORT_POSITION_THRESHOLD;
        const dirDot = dir.dot(this.lastSortCameraDirection);
        const dirChanged = dirDot < 1.0 - GaussianSplatMesh.SORT_DIRECTION_THRESHOLD;
        if (posDelta > posThreshold || dirChanged) {
            this.lastSortCameraPosition.copy(pos);
            this.lastSortCameraDirection.copy(dir);
            return true;
        }
        return false;
    }
    raycast(raycaster, intersects) {
        if (!this.splatData) return;
        const candidates = Array.from({
            length: this.splatData.numSplats
        }, (_, i)=>i);
        if (0 === candidates.length) return;
        let x, y, z;
        let scale0, scale1, scale2;
        let rot0 = null;
        let rot1 = null;
        let rot2 = null;
        let rot3 = null;
        if (this.splatData instanceof __WEBPACK_EXTERNAL_MODULE__CompressedSplatData_js_d49ef5ff__.CompressedSplatData || this.splatData instanceof __WEBPACK_EXTERNAL_MODULE__SogsData_js_e6cfed53__.SogsData) {
            const iter = this.splatData.createIterator();
            const numSplats = this.splatData.numSplats;
            x = new Float32Array(numSplats);
            y = new Float32Array(numSplats);
            z = new Float32Array(numSplats);
            scale0 = new Float32Array(numSplats);
            scale1 = new Float32Array(numSplats);
            scale2 = new Float32Array(numSplats);
            rot0 = new Float32Array(numSplats);
            rot1 = new Float32Array(numSplats);
            rot2 = new Float32Array(numSplats);
            rot3 = new Float32Array(numSplats);
            for(let i = 0; i < numSplats; i++){
                const splat = iter.read(i);
                x[i] = splat.position[0];
                y[i] = splat.position[1];
                z[i] = splat.position[2];
                scale0[i] = splat.scale[0];
                scale1[i] = splat.scale[1];
                scale2[i] = splat.scale[2];
                rot0[i] = splat.rotation[0];
                rot1[i] = splat.rotation[1];
                rot2[i] = splat.rotation[2];
                rot3[i] = splat.rotation[3];
            }
        } else {
            x = this.splatData.getProp('x');
            y = this.splatData.getProp('y');
            z = this.splatData.getProp('z');
            scale0 = this.splatData.getProp('scale_0');
            scale1 = this.splatData.getProp('scale_1');
            scale2 = this.splatData.getProp('scale_2');
            rot0 = this.splatData.getProp('rot_0');
            rot1 = this.splatData.getProp('rot_1');
            rot2 = this.splatData.getProp('rot_2');
            rot3 = this.splatData.getProp('rot_3');
        }
        if (!x || !y || !z || !scale0 || !scale1 || !scale2) return;
        const hasRotation = rot0 && rot1 && rot2 && rot3;
        const center = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        const worldRay = new __WEBPACK_EXTERNAL_MODULE_three__.Ray();
        const tempResults = [];
        const invMatrix = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4().copy(this.matrixWorld).invert();
        worldRay.copy(raycaster.ray).applyMatrix4(invMatrix);
        const roughCandidates = [];
        for (const idx of candidates){
            center.set(x[idx], y[idx], z[idx]);
            const maxRadius = 2 * Math.max(Math.exp(scale0[idx]), Math.exp(scale1[idx]), Math.exp(scale2[idx]));
            if (__WEBPACK_EXTERNAL_MODULE__spatial_EllipsoidRaycast_js_861cbd52__.EllipsoidRaycast.roughIntersect(worldRay, center, maxRadius)) roughCandidates.push(idx);
        }
        for (const idx of roughCandidates){
            center.set(x[idx], y[idx], z[idx]);
            const ellipsoid = hasRotation ? __WEBPACK_EXTERNAL_MODULE__spatial_EllipsoidRaycast_js_861cbd52__.EllipsoidRaycast.fromSplatData(center, scale0[idx], scale1[idx], scale2[idx], rot0?.[idx], rot1?.[idx], rot2?.[idx], rot3?.[idx]) : {
                center: center.clone(),
                radii: new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(Math.exp(scale0[idx]), Math.exp(scale1[idx]), Math.exp(scale2[idx])),
                rotation: new __WEBPACK_EXTERNAL_MODULE_three__.Quaternion(0, 0, 0, 1)
            };
            const result = __WEBPACK_EXTERNAL_MODULE__spatial_EllipsoidRaycast_js_861cbd52__.EllipsoidRaycast.intersect(worldRay, ellipsoid, 1.5);
            if (result.intersects) {
                const worldPoint = result.point.clone().applyMatrix4(this.matrixWorld);
                const worldDistance = worldPoint.distanceTo(raycaster.ray.origin);
                if (worldDistance >= raycaster.near && worldDistance <= raycaster.far) tempResults.push({
                    distance: worldDistance,
                    point: worldPoint,
                    index: idx
                });
            }
        }
        tempResults.sort((a, b)=>a.distance - b.distance);
        for (const result of tempResults)intersects.push({
            distance: result.distance,
            point: result.point,
            object: this,
            index: result.index
        });
    }
    setShaderEffect(effect) {
        if (this._shaderEffect === effect) return effect ? effect.enable(this.material) : true;
        this._shaderEffect?.disable();
        this._shaderEffect = effect;
        if (!effect) {
            this.material.clearShaderEffect();
            return true;
        }
        return effect.enable(this.material);
    }
    clearShaderEffect() {
        return this.setShaderEffect(null);
    }
    restartShaderEffect() {
        return this._shaderEffect?.restart() ?? false;
    }
    getShaderEffect() {
        return this._shaderEffect;
    }
    updateShaderEffect(delta) {
        this._shaderEffect?.update(delta);
    }
    dispose() {
        this._shaderEffect?.destroy();
        this._shaderEffect = null;
        this.sorter?.dispose();
        if (this.cameraStates) {
            for (const [, state] of this.cameraStates){
                state.sorter.dispose();
                state.orderTexture.dispose();
            }
            this.cameraStates.clear();
        }
        this.resolveSH?.dispose();
        this.resolveSH = null;
        this.shLabelsTexture?.dispose();
        this.shLabelsTexture = null;
        this.shCentroidsTexture?.dispose();
        this.shCentroidsTexture = null;
        this.director?.destroy();
        this.director = null;
        this.composition = null;
        this.layer = null;
        this.placement = null;
        this.gsplatResource?.dispose();
        this.gsplatResource = null;
        this.cropper = null;
        this.geometry.dispose();
        this.material.dispose();
    }
    addCamera(camera, options) {
        if (!this.cameraStates) {
            this.cameraStates = new Map();
            if (this.sorter) {
                const defaultState = {
                    camera,
                    orderTexture: this.geometry.orderTexture,
                    sorter: this.sorter,
                    sortVersion: 0
                };
                this.cameraStates.set(camera, defaultState);
                this.sorter = null;
                return true;
            }
        }
        if (this.cameraStates.has(camera)) {
            log.warn('[ThreeGS] 相机已存在于多相机系统中');
            return false;
        }
        const width = this.geometry.orderWidth;
        const height = Math.ceil(this.splatData.numSplats / width);
        const orderData = new Uint32Array(width * height);
        for(let i = 0; i < this.splatData.numSplats; i++)orderData[i] = i;
        const orderTexture = new __WEBPACK_EXTERNAL_MODULE_three__.DataTexture(orderData, width, height, __WEBPACK_EXTERNAL_MODULE_three__.RedIntegerFormat, __WEBPACK_EXTERNAL_MODULE_three__.UnsignedIntType);
        orderTexture.internalFormat = 'R32UI';
        orderTexture.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        orderTexture.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        orderTexture.needsUpdate = true;
        const centers = this.splatData.getCenters();
        const sorterData = {
            numSplats: this.splatData.numSplats,
            getCenters: ()=>centers
        };
        const sorter = new __WEBPACK_EXTERNAL_MODULE__sorting_SplatSorter_js_06a7f42e__.SplatSorter(sorterData, orderTexture, {
            ...options,
            onSortComplete: (data)=>{
                data.count;
            }
        });
        const state = {
            camera,
            orderTexture,
            sorter,
            sortVersion: 0
        };
        this.cameraStates.set(camera, state);
        return true;
    }
    removeCamera(camera) {
        if (!this.cameraStates || !this.cameraStates.has(camera)) {
            log.warn('[ThreeGS] 相机不在多相机系统中');
            return false;
        }
        const state = this.cameraStates.get(camera);
        state.sorter.dispose();
        state.orderTexture.dispose();
        this.cameraStates.delete(camera);
        if (0 === this.cameraStates.size) this.cameraStates = null;
        return true;
    }
    getCameras() {
        if (!this.cameraStates) return [];
        return Array.from(this.cameraStates.keys());
    }
    isMultiCameraEnabled() {
        return null !== this.cameraStates;
    }
    getCameraSortStats(camera) {
        if (!this.cameraStates) return null;
        const state = this.cameraStates.get(camera);
        if (!state) return null;
        return {
            version: state.sortVersion,
            count: this.geometry.visibleSplatCount
        };
    }
    setColorSpaceManager(manager) {
        this.colorSpaceManager = manager;
        if (manager) manager.configureMaterial(this.material);
    }
    getColorSpaceManager() {
        return this.colorSpaceManager;
    }
    updateOrder(sortedIndices) {
        this.geometry.updateOrder(sortedIndices);
    }
    getCropper() {
        if (!this.cropper) {
            let dataForCropper;
            dataForCropper = this.splatData instanceof __WEBPACK_EXTERNAL_MODULE__SogsData_js_e6cfed53__.SogsData ? GaussianSplatMesh.decompressFromSogs(this.splatData) : this.splatData instanceof __WEBPACK_EXTERNAL_MODULE__CompressedSplatData_js_d49ef5ff__.CompressedSplatData ? GaussianSplatMesh.decompressForGeometry(this.splatData) : this.splatData;
            this.cropper = new __WEBPACK_EXTERNAL_MODULE__tools_SplatCropper_js_1061a2f2__.SplatCropper(dataForCropper);
        }
        return this.cropper;
    }
    cropByBox(box, invert) {
        return this.getCropper().cropByBox(box, invert);
    }
    cropBySphere(sphere, invert) {
        return this.getCropper().cropBySphere(sphere, invert);
    }
    cropByPlane(plane, keepPositiveSide) {
        return this.getCropper().cropByPlane(plane, keepPositiveSide);
    }
    deleteByIndices(indices) {
        this.getCropper().deleteByIndices(indices);
    }
    resetCrop() {
        this.cropper?.reset();
    }
    getCropStats() {
        return this.cropper?.getStats() || {
            total: this.splatData.numSplats,
            deleted: 0,
            remaining: this.splatData.numSplats
        };
    }
    async export(options) {
        let dataToExport;
        dataToExport = this.splatData instanceof __WEBPACK_EXTERNAL_MODULE__SogsData_js_e6cfed53__.SogsData ? GaussianSplatMesh.decompressFromSogs(this.splatData) : this.splatData instanceof __WEBPACK_EXTERNAL_MODULE__CompressedSplatData_js_d49ef5ff__.CompressedSplatData ? GaussianSplatMesh.decompressForGeometry(this.splatData) : this.splatData;
        const exportOptions = {
            ...options,
            deletedMask: this.cropper?.getDeletedMask()
        };
        if (options?.format === 'splat') return (0, __WEBPACK_EXTERNAL_MODULE__export_SplatExporter_js_2577a575__.exportToSplat)(dataToExport, exportOptions);
        return (0, __WEBPACK_EXTERNAL_MODULE__export_SplatExporter_js_2577a575__.exportToPly)(dataToExport, exportOptions);
    }
    async exportPly(options) {
        return this.export({
            ...options,
            format: 'ply'
        });
    }
    async exportSplat(options) {
        return this.export({
            ...options,
            format: 'splat'
        });
    }
    setCustomAabb(aabb) {
        if (aabb) this.geometry.boundingBox = aabb.clone();
        else {
            const newAabb = new __WEBPACK_EXTERNAL_MODULE_three__.Box3();
            this.splatData.calcAabb(newAabb);
            this.geometry.boundingBox = newAabb;
        }
        this.updateBoundingSphereFromBox();
    }
    updateBoundingSphereFromBox() {
        const box = this.geometry.boundingBox;
        if (!box) {
            log.warn('[ThreeGS] 无法更新 boundingSphere：boundingBox 未设置');
            return;
        }
        const center = box.getCenter(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3());
        const size = box.getSize(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3());
        const radius = size.length() / 2;
        if (this.geometry.boundingSphere) {
            this.geometry.boundingSphere.center.copy(center);
            this.geometry.boundingSphere.radius = radius;
        } else this.geometry.boundingSphere = new __WEBPACK_EXTERNAL_MODULE_three__.Sphere(center, radius);
    }
    getAabb() {
        return this.geometry.boundingBox;
    }
    expandAabb(margin) {
        if (!this.geometry.boundingBox) {
            log.warn('[ThreeGS] 无法扩展包围盒：boundingBox 未设置');
            return;
        }
        const box = this.geometry.boundingBox;
        const center = box.getCenter(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3());
        const size = box.getSize(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3());
        const newSize = size.multiplyScalar(1 + margin / 100);
        box.setFromCenterAndSize(center, newSize);
        this.updateBoundingSphereFromBox();
    }
    setAabbPadding(padding) {
        const aabb = new __WEBPACK_EXTERNAL_MODULE_three__.Box3();
        this.splatData.calcAabb(aabb);
        aabb.min.sub(padding);
        aabb.max.add(padding);
        this.geometry.boundingBox = aabb;
        this.updateBoundingSphereFromBox();
    }
    setSceneOriginOverride(origin) {
        if (origin) {
            if (!this._sceneOriginOverride) this._sceneOriginOverride = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
            this._sceneOriginOverride.copy(origin);
            this.__sceneOriginOverride = this._sceneOriginOverride;
        } else {
            this._sceneOriginOverride = null;
            delete this.__sceneOriginOverride;
        }
    }
    getDirector() {
        return this.director;
    }
    getUnifiedLODManager(camera) {
        if (!this.director || !this.layer) return null;
        return this.director.getManager(camera, this.layer);
    }
    getPlacement() {
        return this.placement;
    }
    updateUnifiedLODResource(resourcePath) {
        if (this.placement) {
            this._placementResourcePath = resourcePath;
            if (this.layer) this.layer.gsplatPlacementsDirty = true;
        }
    }
    debugSort(camera) {
        if (!this.sorter) {
            log.warn('[ThreeGS Debug] 排序器未启用');
            return;
        }
        this.sorter.setCamera(camera, this.matrixWorld);
    }
    getDebugInfo(camera) {
        const lines = [];
        lines.push('======== GaussianSplatMesh Debug ========');
        lines.push(`[Mesh] visible=${this.visible}, frustumCulled=${this.frustumCulled}`);
        lines.push(`[Mesh] name="${this.name}"`);
        const worldPos = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        const worldScale = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        const worldQuat = new __WEBPACK_EXTERNAL_MODULE_three__.Quaternion();
        this.matrixWorld.decompose(worldPos, worldQuat, worldScale);
        lines.push(`[Mesh] worldPos=(${worldPos.x.toFixed(3)}, ${worldPos.y.toFixed(3)}, ${worldPos.z.toFixed(3)})`);
        lines.push(`[Mesh] worldScale=(${worldScale.x.toFixed(3)}, ${worldScale.y.toFixed(3)}, ${worldScale.z.toFixed(3)})`);
        const geom = this.geometry;
        lines.push(`[Geometry] visibleSplatCount=${geom.visibleSplatCount}`);
        lines.push(`[Geometry] batchInstanceCount=${geom.instanceCount}`);
        lines.push(`[Geometry] dataWidth=${geom.dataWidth}, dataHeight=${geom.dataHeight}`);
        lines.push(`[Geometry] orderWidth=${geom.orderWidth}`);
        const bbox = geom.boundingBox;
        if (bbox) {
            lines.push(`[Geometry] boundingBox.min=(${bbox.min.x.toFixed(3)}, ${bbox.min.y.toFixed(3)}, ${bbox.min.z.toFixed(3)})`);
            lines.push(`[Geometry] boundingBox.max=(${bbox.max.x.toFixed(3)}, ${bbox.max.y.toFixed(3)}, ${bbox.max.z.toFixed(3)})`);
            const size = bbox.getSize(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3());
            lines.push(`[Geometry] boundingBox.size=(${size.x.toFixed(3)}, ${size.y.toFixed(3)}, ${size.z.toFixed(3)})`);
            const isValidBox = bbox.min.x <= bbox.max.x && bbox.min.y <= bbox.max.y && bbox.min.z <= bbox.max.z;
            lines.push(`[Geometry] boundingBox.valid=${isValidBox}`);
        } else lines.push('[Geometry] boundingBox=null');
        const bsphere = geom.boundingSphere;
        if (bsphere) {
            lines.push(`[Geometry] boundingSphere.center=(${bsphere.center.x.toFixed(3)}, ${bsphere.center.y.toFixed(3)}, ${bsphere.center.z.toFixed(3)})`);
            lines.push(`[Geometry] boundingSphere.radius=${bsphere.radius.toFixed(3)}`);
        } else lines.push('[Geometry] boundingSphere=null (PROBLEM: frustum culling will fail!)');
        lines.push(`[Data] numSplats=${this.splatData.numSplats}`);
        if (this.sorter) lines.push('[Sorter] enabled=true');
        else lines.push('[Sorter] enabled=false');
        lines.push(`[SortDebounce] lastPos=(${this.lastSortCameraPosition.x.toFixed(3)}, ${this.lastSortCameraPosition.y.toFixed(3)}, ${this.lastSortCameraPosition.z.toFixed(3)})`);
        lines.push(`[SortDebounce] lastDir=(${this.lastSortCameraDirection.x.toFixed(3)}, ${this.lastSortCameraDirection.y.toFixed(3)}, ${this.lastSortCameraDirection.z.toFixed(3)})`);
        const camPos = camera.position;
        const camDir = camera.getWorldDirection(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3());
        lines.push(`[Camera] position=(${camPos.x.toFixed(3)}, ${camPos.y.toFixed(3)}, ${camPos.z.toFixed(3)})`);
        lines.push(`[Camera] direction=(${camDir.x.toFixed(3)}, ${camDir.y.toFixed(3)}, ${camDir.z.toFixed(3)})`);
        const posDelta = camPos.distanceToSquared(this.lastSortCameraPosition);
        const posThreshold = GaussianSplatMesh.SORT_POSITION_THRESHOLD * GaussianSplatMesh.SORT_POSITION_THRESHOLD;
        const dirDot = camDir.dot(this.lastSortCameraDirection);
        const dirChanged = dirDot < 1.0 - GaussianSplatMesh.SORT_DIRECTION_THRESHOLD;
        lines.push(`[Camera] positionDeltaSquared=${posDelta.toFixed(6)}, threshold=${posThreshold.toFixed(6)}`);
        lines.push(`[Camera] directionDot=${dirDot.toFixed(6)}, dirChanged=${dirChanged}`);
        if (bbox && camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.PerspectiveCamera) {
            const worldBbox = bbox.clone().applyMatrix4(this.matrixWorld);
            const frustum = new __WEBPACK_EXTERNAL_MODULE_three__.Frustum();
            const projScreenMatrix = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4();
            projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
            frustum.setFromProjectionMatrix(projScreenMatrix);
            const inFrustum = frustum.intersectsBox(worldBbox);
            lines.push(`[Frustum] meshInFrustum=${inFrustum}`);
            lines.push(`[Frustum] worldBbox.min=(${worldBbox.min.x.toFixed(3)}, ${worldBbox.min.y.toFixed(3)}, ${worldBbox.min.z.toFixed(3)})`);
            lines.push(`[Frustum] worldBbox.max=(${worldBbox.max.x.toFixed(3)}, ${worldBbox.max.y.toFixed(3)}, ${worldBbox.max.z.toFixed(3)})`);
        }
        if (this.cameraStates) {
            lines.push(`[MultiCamera] enabled=true, cameraCount=${this.cameraStates.size}`);
            const hasCurrentCamera = this.cameraStates.has(camera);
            lines.push(`[MultiCamera] currentCameraRegistered=${hasCurrentCamera}`);
        } else lines.push('[MultiCamera] enabled=false');
        if (this.director) {
            lines.push('[UnifiedLOD] enabled=true');
            lines.push(`[UnifiedLOD] gsplatCount=${this.director.gsplatCount}`);
        } else lines.push('[UnifiedLOD] enabled=false');
        lines.push('=========================================');
        return lines.join('\n');
    }
}
export { GaussianSplatMesh };
