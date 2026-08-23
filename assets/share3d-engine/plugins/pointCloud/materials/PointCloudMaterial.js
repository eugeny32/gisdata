import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__utils_geometry_utils_js_d463fbb9__ from "../utils/geometry-utils.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__ from "../../../shared/constants/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
import * as __WEBPACK_EXTERNAL_MODULE__ClassificationScheme_js_076c43c2__ from "./ClassificationScheme.js";
import * as __WEBPACK_EXTERNAL_MODULE__Gradients_js_28f83939__ from "./Gradients.js";
import * as __WEBPACK_EXTERNAL_MODULE__shaders_shaders_js_f0891b73__ from "./shaders/shaders.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('pointcloud');
class PointCloudMaterial extends __WEBPACK_EXTERNAL_MODULE_three__.RawShaderMaterial {
    constructor(parameters = {}){
        super();
        this.glslVersion = __WEBPACK_EXTERNAL_MODULE_three__.GLSL3;
        this.visibleNodesTexture = (0, __WEBPACK_EXTERNAL_MODULE__utils_geometry_utils_js_d463fbb9__.generateDataTexture)(2048, 1, new __WEBPACK_EXTERNAL_MODULE_three__.Color(0xffffff));
        this.visibleNodesTexture.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        this.visibleNodesTexture.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        const getValid = (a, b)=>{
            if (void 0 !== a) return a;
            return b;
        };
        const pointSize = getValid(parameters.size, 1.0);
        const minSize = getValid(parameters.minSize, 1.0);
        const maxSize = getValid(parameters.maxSize, 20.0);
        const treeType = getValid(parameters.treeType, __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.TreeType.OCTREE);
        this._pointSizeType = __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.PointSizeType.FIXED;
        this._shape = __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.PointShape.SQUARE;
        this._useClipBox = false;
        this.clipBoxes = [];
        this.clipPolygons = [];
        this._weighted = false;
        this._gradient = __WEBPACK_EXTERNAL_MODULE__Gradients_js_28f83939__.Gradients.SPECTRAL;
        this.gradientTexture = PointCloudMaterial.generateGradientTexture(this._gradient);
        this._matcap = null;
        this.matcapTexture = null;
        this.lights = false;
        this.fog = false;
        this._treeType = treeType;
        this._useEDL = false;
        this.defines = new Map();
        this.ranges = new Map();
        this._activeAttributeName = null;
        this._defaultIntensityRangeChanged = false;
        this._defaultElevationRangeChanged = false;
        {
            const [width, height] = [
                256,
                1
            ];
            const data = new Uint8Array(4 * width);
            const texture = new __WEBPACK_EXTERNAL_MODULE_three__.DataTexture(data, width, height, __WEBPACK_EXTERNAL_MODULE_three__.RGBAFormat);
            texture.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
            texture.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
            texture.needsUpdate = true;
            this.classificationTexture = texture;
        }
        this.attributes = {
            position: {
                type: 'fv',
                value: []
            },
            color: {
                type: 'fv',
                value: []
            },
            normal: {
                type: 'fv',
                value: []
            },
            intensity: {
                type: 'f',
                value: []
            },
            classification: {
                type: 'f',
                value: []
            },
            returnNumber: {
                type: 'f',
                value: []
            },
            numberOfReturns: {
                type: 'f',
                value: []
            },
            pointSourceID: {
                type: 'f',
                value: []
            },
            indices: {
                type: 'fv',
                value: []
            }
        };
        this.uniforms = {
            level: {
                type: 'f',
                value: 0.0
            },
            vnStart: {
                type: 'f',
                value: 0.0
            },
            spacing: {
                type: 'f',
                value: 1.0
            },
            blendHardness: {
                type: 'f',
                value: 2.0
            },
            blendDepthSupplement: {
                type: 'f',
                value: 0.0
            },
            fov: {
                type: 'f',
                value: 1.0
            },
            screenWidth: {
                type: 'f',
                value: 1.0
            },
            screenHeight: {
                type: 'f',
                value: 1.0
            },
            near: {
                type: 'f',
                value: 0.1
            },
            far: {
                type: 'f',
                value: 1.0
            },
            uColor: {
                type: 'c',
                value: new __WEBPACK_EXTERNAL_MODULE_three__.Color(0xffffff)
            },
            uOpacity: {
                type: 'f',
                value: 1.0
            },
            size: {
                type: 'f',
                value: pointSize
            },
            minSize: {
                type: 'f',
                value: minSize
            },
            maxSize: {
                type: 'f',
                value: maxSize
            },
            octreeSize: {
                type: 'f',
                value: 0
            },
            bbSize: {
                type: 'fv',
                value: [
                    0,
                    0,
                    0
                ]
            },
            elevationRange: {
                type: '2fv',
                value: [
                    0,
                    0
                ]
            },
            clipBoxCount: {
                type: 'f',
                value: 0
            },
            clipPolygonCount: {
                type: 'i',
                value: 0
            },
            clipBoxes: {
                type: 'Matrix4fv',
                value: []
            },
            clipPolygons: {
                type: '3fv',
                value: []
            },
            clipPolygonVCount: {
                type: 'iv',
                value: []
            },
            clipPolygonVP: {
                type: 'Matrix4fv',
                value: []
            },
            visibleNodes: {
                type: 't',
                value: this.visibleNodesTexture
            },
            pcIndex: {
                type: 'f',
                value: 0
            },
            gradient: {
                type: 't',
                value: this.gradientTexture
            },
            classificationLUT: {
                type: 't',
                value: this.classificationTexture
            },
            uHQDepthMap: {
                type: 't',
                value: null
            },
            toModel: {
                type: 'Matrix4f',
                value: []
            },
            diffuse: {
                type: 'fv',
                value: [
                    1,
                    1,
                    1
                ]
            },
            transition: {
                type: 'f',
                value: 0.5
            },
            intensityRange: {
                type: 'fv',
                value: [
                    1 / 0,
                    -1 / 0
                ]
            },
            activeSamplingRange: {
                type: 'fv',
                value: [
                    1 / 0,
                    -1 / 0
                ]
            },
            intensity_gbc: {
                type: 'fv',
                value: [
                    1,
                    0,
                    0
                ]
            },
            uRGB_gbc: {
                type: 'fv',
                value: [
                    1,
                    0,
                    0
                ]
            },
            wRGB: {
                type: 'f',
                value: 1
            },
            wIntensity: {
                type: 'f',
                value: 0
            },
            wElevation: {
                type: 'f',
                value: 0
            },
            wClassification: {
                type: 'f',
                value: 0
            },
            wReturnNumber: {
                type: 'f',
                value: 0
            },
            wSourceID: {
                type: 'f',
                value: 0
            },
            useOrthographicCamera: {
                type: 'b',
                value: false
            },
            elevationGradientRepeat: {
                type: 'i',
                value: __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.ElevationGradientRepeat.CLAMP
            },
            clipTask: {
                type: 'i',
                value: 1
            },
            clipMethod: {
                type: 'i',
                value: 1
            },
            uShadowColor: {
                type: '3fv',
                value: [
                    0,
                    0,
                    0
                ]
            },
            uExtraScale: {
                type: 'f',
                value: 1
            },
            uExtraOffset: {
                type: 'f',
                value: 0
            },
            uExtraRange: {
                type: '2fv',
                value: [
                    0,
                    1
                ]
            },
            uExtraGammaBrightContr: {
                type: '3fv',
                value: [
                    1,
                    0,
                    0
                ]
            },
            uFilterReturnNumberRange: {
                type: 'fv',
                value: [
                    0,
                    7
                ]
            },
            uFilterNumberOfReturnsRange: {
                type: 'fv',
                value: [
                    0,
                    7
                ]
            },
            uFilterGPSTimeClipRange: {
                type: 'fv',
                value: null
            },
            uFilterPointSourceIDClipRange: {
                type: 'fv',
                value: [
                    0,
                    65535
                ]
            },
            matcapTextureUniform: {
                type: 't',
                value: this.matcapTexture
            },
            backfaceCulling: {
                type: 'b',
                value: false
            },
            uEnableZClip: {
                type: 'b',
                value: false
            },
            uZClipRange: {
                type: 'fv',
                value: [
                    0,
                    0
                ]
            }
        };
        this.classification = __WEBPACK_EXTERNAL_MODULE__ClassificationScheme_js_076c43c2__.ClassificationScheme.DEFAULT;
        this.recomputeClassification();
        this.defaultAttributeValues.normal = [
            0,
            0,
            0
        ];
        this.defaultAttributeValues.classification = [
            0,
            0,
            0
        ];
        this.defaultAttributeValues.indices = [
            0,
            0,
            0,
            0
        ];
        this.vertexShader = __WEBPACK_EXTERNAL_MODULE__shaders_shaders_js_f0891b73__.Shaders["pointcloud.vs"];
        this.fragmentShader = __WEBPACK_EXTERNAL_MODULE__shaders_shaders_js_f0891b73__.Shaders["pointcloud.fs"];
        this.updateShaderSource();
    }
    setDefine(key, value) {
        if (null != value) {
            if (this.defines.get(key) !== value) {
                this.defines.set(key, value);
                this.updateShaderSource();
            }
        } else this.removeDefine(key);
    }
    removeDefine(key) {
        this.defines.delete(key);
    }
    updateVisibleNodesTexture(requiredNodeCount, maxTextureSize) {
        const currentCapacity = this.visibleNodesTexture.image.width * this.visibleNodesTexture.image.height;
        if (requiredNodeCount <= currentCapacity) return true;
        const result = (0, __WEBPACK_EXTERNAL_MODULE__utils_geometry_utils_js_d463fbb9__.resizeVisibleNodesTexture)(requiredNodeCount, maxTextureSize);
        if (!result.success) {
            log.warn(`[PointCloudMaterial] Texture resize failed: ${result.message}`);
            return false;
        }
        const newTexture = result.texture;
        const oldTexture = this.visibleNodesTexture;
        this.visibleNodesTexture = newTexture;
        this.uniforms.visibleNodes.value = newTexture;
        if (oldTexture) oldTexture.dispose();
        return true;
    }
    updateShaderSource() {
        let vs = __WEBPACK_EXTERNAL_MODULE__shaders_shaders_js_f0891b73__.Shaders["pointcloud.vs"].trim();
        let fs = __WEBPACK_EXTERNAL_MODULE__shaders_shaders_js_f0891b73__.Shaders["pointcloud.fs"].trim();
        const definesString = this.getDefines();
        const versionString = '#version 300 es';
        vs = vs.replace(versionString, '').trim();
        fs = fs.replace(versionString, '').trim();
        this.vertexShader = `${definesString}\n${vs}`;
        this.fragmentShader = `${definesString}\n${fs}`;
        if (1.0 === this.opacity) {
            this.blending = __WEBPACK_EXTERNAL_MODULE_three__.NoBlending;
            this.transparent = false;
            this.depthTest = true;
            this.depthWrite = true;
            this.depthFunc = __WEBPACK_EXTERNAL_MODULE_three__.LessEqualDepth;
        } else if (this.opacity < 1.0 && !this.useEDL) {
            this.blending = __WEBPACK_EXTERNAL_MODULE_three__.NormalBlending;
            this.transparent = true;
            this.depthTest = true;
            this.depthWrite = false;
            this.depthFunc = __WEBPACK_EXTERNAL_MODULE_three__.LessEqualDepth;
        }
        if (this.weighted) {
            this.blending = __WEBPACK_EXTERNAL_MODULE_three__.AdditiveBlending;
            this.transparent = true;
            this.depthTest = true;
            this.depthWrite = false;
        }
        this.needsUpdate = true;
    }
    getDefines() {
        const defines = [];
        if (this.pointSizeType === __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.PointSizeType.FIXED) defines.push('#define fixed_point_size');
        else if (this.pointSizeType === __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.PointSizeType.ATTENUATED) defines.push('#define attenuated_point_size');
        else if (this.pointSizeType === __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.PointSizeType.ADAPTIVE) defines.push('#define adaptive_point_size');
        if (this.shape === __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.PointShape.SQUARE) defines.push('#define square_point_shape');
        else if (this.shape === __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.PointShape.CIRCLE) defines.push('#define circle_point_shape');
        else if (this.shape === __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.PointShape.PARABOLOID) defines.push('#define paraboloid_point_shape');
        if (this._useEDL) defines.push('#define use_edl');
        if (this.activeAttributeName) {
            const attributeName = this.activeAttributeName.replace(/[^a-zA-Z0-9]/g, '_');
            defines.push(`#define color_type_${attributeName}`);
        }
        if (this._treeType === __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.TreeType.OCTREE) defines.push('#define tree_type_octree');
        else if (this._treeType === __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.TreeType.KDTREE) defines.push('#define tree_type_kdtree');
        if (this.weighted) defines.push('#define weighted_splats');
        for (const [, value] of this.defines)defines.push(value);
        return defines.join('\n');
    }
    setClipBoxes(clipBoxes) {
        if (!clipBoxes) return;
        const doUpdate = this.clipBoxes.length !== clipBoxes.length && (0 === clipBoxes.length || 0 === this.clipBoxes.length);
        this.uniforms.clipBoxCount.value = this.clipBoxes.length;
        this.clipBoxes = clipBoxes;
        if (doUpdate) this.updateShaderSource();
        this.uniforms.clipBoxes.value = new Float32Array(16 * this.clipBoxes.length);
        for(let i = 0; i < this.clipBoxes.length; i++){
            const box = clipBoxes[i];
            this.uniforms.clipBoxes.value.set(box.inverse.elements, 16 * i);
        }
        for(let i = 0; i < this.uniforms.clipBoxes.value.length; i++)if (Number.isNaN(this.uniforms.clipBoxes.value[i])) this.uniforms.clipBoxes.value[i] = 1 / 0;
    }
    setClipPolygons(clipPolygons, _maxPolygonVertices) {
        if (!clipPolygons) return;
        const previousCount = this.clipPolygons.length;
        this.clipPolygons = clipPolygons;
        const doUpdate = previousCount !== clipPolygons.length;
        if (doUpdate) this.updateShaderSource();
    }
    get gradient() {
        return this._gradient;
    }
    set gradient(value) {
        if (this._gradient !== value) {
            this._gradient = value;
            this.gradientTexture = PointCloudMaterial.generateGradientTexture(this._gradient);
            this.uniforms.gradient.value = this.gradientTexture;
        }
    }
    get matcap() {
        return this._matcap;
    }
    set matcap(value) {
        if (this._matcap !== value) {
            this._matcap = value;
            this.matcapTexture = value ? PointCloudMaterial.generateMatcapTexture(value) : null;
            this.uniforms.matcapTextureUniform.value = this.matcapTexture;
        }
    }
    get useOrthographicCamera() {
        return this.uniforms.useOrthographicCamera.value;
    }
    set useOrthographicCamera(value) {
        if (this.uniforms.useOrthographicCamera.value !== value) this.uniforms.useOrthographicCamera.value = value;
    }
    get backfaceCulling() {
        return this.uniforms.backfaceCulling.value;
    }
    set backfaceCulling(value) {
        if (this.uniforms.backfaceCulling.value !== value) {
            this.uniforms.backfaceCulling.value = value;
            this.dispatchEvent({
                type: 'backface_changed',
                target: this
            });
        }
    }
    recomputeClassification() {
        const classification = this.classification;
        const data = this.classificationTexture.image.data;
        const width = 256;
        const black = [
            1,
            1,
            1,
            1
        ];
        let valuesChanged = false;
        for(let i = 0; i < width; i++){
            let color;
            let visible = true;
            if (classification[i]) {
                color = classification[i].color;
                visible = classification[i].visible;
            } else if (classification[i % 32]) {
                color = classification[i % 32].color;
                visible = classification[i % 32].visible;
            } else if (classification.DEFAULT) {
                color = classification.DEFAULT.color;
                visible = classification.DEFAULT.visible;
            } else color = black;
            const r = parseInt(255 * color[0], 10);
            const g = parseInt(255 * color[1], 10);
            const b = parseInt(255 * color[2], 10);
            const a = visible ? parseInt(255 * color[3], 10) : 0;
            if (data[4 * i + 0] !== r) {
                data[4 * i + 0] = r;
                valuesChanged = true;
            }
            if (data[4 * i + 1] !== g) {
                data[4 * i + 1] = g;
                valuesChanged = true;
            }
            if (data[4 * i + 2] !== b) {
                data[4 * i + 2] = b;
                valuesChanged = true;
            }
            if (data[4 * i + 3] !== a) {
                data[4 * i + 3] = a;
                valuesChanged = true;
            }
        }
        if (valuesChanged) {
            this.classificationTexture.needsUpdate = true;
            this.dispatchEvent({
                type: 'material_property_changed',
                target: this
            });
        }
    }
    get spacing() {
        return this.uniforms.spacing.value;
    }
    set spacing(value) {
        if (this.uniforms.spacing.value !== value) this.uniforms.spacing.value = value;
    }
    get useClipBox() {
        return this._useClipBox;
    }
    set useClipBox(value) {
        if (this._useClipBox !== value) {
            this._useClipBox = value;
            this.updateShaderSource();
        }
    }
    get clipTask() {
        return this.uniforms.clipTask.value;
    }
    set clipTask(mode) {
        this.uniforms.clipTask.value = mode;
    }
    get elevationGradientRepeat() {
        return this.uniforms.elevationGradientRepeat.value;
    }
    set elevationGradientRepeat(mode) {
        this.uniforms.elevationGradientRepeat.value = mode;
    }
    get clipMethod() {
        return this.uniforms.clipMethod.value;
    }
    set clipMethod(mode) {
        this.uniforms.clipMethod.value = mode;
    }
    get weighted() {
        return this._weighted;
    }
    set weighted(value) {
        if (this._weighted !== value) {
            this._weighted = value;
            this.updateShaderSource();
        }
    }
    get maxSize() {
        return this.uniforms.maxSize.value;
    }
    set maxSize(value) {
        this.uniforms.maxSize.value = value;
    }
    get fov() {
        return this.uniforms.fov.value;
    }
    set fov(value) {
        if (this.uniforms.fov.value !== value) this.uniforms.fov.value = value;
    }
    get screenWidth() {
        return this.uniforms.screenWidth.value;
    }
    set screenWidth(value) {
        if (this.uniforms.screenWidth.value !== value) this.uniforms.screenWidth.value = value;
    }
    get screenHeight() {
        return this.uniforms.screenHeight.value;
    }
    set screenHeight(value) {
        if (this.uniforms.screenHeight.value !== value) this.uniforms.screenHeight.value = value;
    }
    get near() {
        return this.uniforms.near.value;
    }
    set near(value) {
        if (this.uniforms.near.value !== value) this.uniforms.near.value = value;
    }
    get far() {
        return this.uniforms.far.value;
    }
    set far(value) {
        if (this.uniforms.far.value !== value) this.uniforms.far.value = value;
    }
    get opacity() {
        return this.uniforms.uOpacity.value;
    }
    set opacity(value) {
        if (this.uniforms?.uOpacity) {
            if (this.uniforms.uOpacity.value !== value) {
                this.uniforms.uOpacity.value = value;
                this.updateShaderSource();
                this.dispatchEvent({
                    type: 'opacity_changed',
                    target: this
                });
                this.dispatchEvent({
                    type: 'material_property_changed',
                    target: this
                });
            }
        }
    }
    get activeAttributeName() {
        return this._activeAttributeName;
    }
    set activeAttributeName(value) {
        if (this._activeAttributeName !== value) {
            this._activeAttributeName = value;
            if ('elevation' === value) this.activeSamplingRange = this.elevationRange;
            else if (value.includes('intensity')) this.activeSamplingRange = this.intensityRange;
            else if ('gps_time' === value) this.activeSamplingRange = [
                0,
                1
            ];
            this.updateShaderSource();
            this.dispatchEvent({
                type: 'active_attribute_changed',
                target: this
            });
            this.dispatchEvent({
                type: 'material_property_changed',
                target: this
            });
        }
    }
    get pointSizeType() {
        return this._pointSizeType;
    }
    set pointSizeType(value) {
        if (this._pointSizeType !== value) {
            this._pointSizeType = value;
            this.updateShaderSource();
            this.dispatchEvent({
                type: 'point_size_type_changed',
                target: this
            });
            this.dispatchEvent({
                type: 'material_property_changed',
                target: this
            });
        }
    }
    get useEDL() {
        return this._useEDL;
    }
    set useEDL(value) {
        if (this._useEDL !== value) {
            this._useEDL = value;
            this.updateShaderSource();
        }
    }
    get color() {
        return this.uniforms.uColor.value;
    }
    set color(value) {
        if (!this.uniforms.uColor.value.equals(value)) {
            this.uniforms.uColor.value.copy(value);
            this.dispatchEvent({
                type: 'color_changed',
                target: this
            });
            this.dispatchEvent({
                type: 'material_property_changed',
                target: this
            });
        }
    }
    get shape() {
        return this._shape;
    }
    set shape(value) {
        if (this._shape !== value) {
            this._shape = value;
            this.updateShaderSource();
            this.dispatchEvent({
                type: 'point_shape_changed',
                target: this
            });
            this.dispatchEvent({
                type: 'material_property_changed',
                target: this
            });
        }
    }
    get treeType() {
        return this._treeType;
    }
    set treeType(value) {
        if (this._treeType !== value) {
            this._treeType = value;
            this.updateShaderSource();
        }
    }
    get bbSize() {
        return this.uniforms.bbSize.value;
    }
    set bbSize(value) {
        this.uniforms.bbSize.value = value;
    }
    get size() {
        return this.uniforms.size.value;
    }
    set size(value) {
        if (this.uniforms.size.value !== value) {
            this.uniforms.size.value = value;
            this.dispatchEvent({
                type: 'point_size_changed',
                target: this
            });
            this.dispatchEvent({
                type: 'material_property_changed',
                target: this
            });
        }
    }
    get minSize() {
        return this.uniforms.minSize.value;
    }
    set minSize(value) {
        if (this.uniforms.minSize.value !== value) {
            this.uniforms.minSize.value = value;
            this.dispatchEvent({
                type: 'point_size_changed',
                target: this
            });
            this.dispatchEvent({
                type: 'material_property_changed',
                target: this
            });
        }
    }
    get elevationRange() {
        return this.uniforms.elevationRange.value;
    }
    set elevationRange(value) {
        const changed = this.uniforms.elevationRange.value[0] !== value[0] || this.uniforms.elevationRange.value[1] !== value[1];
        if (changed) {
            this.uniforms.elevationRange.value = value;
            this._defaultElevationRangeChanged = true;
            this.dispatchEvent({
                type: 'material_property_changed',
                target: this
            });
        }
    }
    get activeSamplingRange() {
        return this.uniforms.activeSamplingRange.value;
    }
    set activeSamplingRange(value) {
        const changed = this.uniforms.activeSamplingRange.value[0] !== value[0] || this.uniforms.activeSamplingRange.value[1] !== value[1];
        if (changed) {
            this.uniforms.activeSamplingRange.value[0] = value[0];
            this.uniforms.activeSamplingRange.value[1] = value[1];
            this.dispatchEvent({
                type: 'material_property_changed',
                target: this
            });
        }
    }
    get heightMin() {
        return this.uniforms.elevationRange.value[0];
    }
    set heightMin(value) {
        this.elevationRange = [
            value,
            this.elevationRange[1]
        ];
    }
    get heightMax() {
        return this.uniforms.elevationRange.value[1];
    }
    set heightMax(value) {
        this.elevationRange = [
            this.elevationRange[0],
            value
        ];
    }
    get transition() {
        return this.uniforms.transition.value;
    }
    set transition(value) {
        this.uniforms.transition.value = value;
    }
    get intensityRange() {
        return this.uniforms.intensityRange.value;
    }
    set intensityRange(value) {
        if (!(Array.isArray(value) && 2 === value.length)) return;
        if (value[0] === this.uniforms.intensityRange.value[0] && value[1] === this.uniforms.intensityRange.value[1]) return;
        this.uniforms.intensityRange.value = value;
        this._defaultIntensityRangeChanged = true;
        this.dispatchEvent({
            type: 'material_property_changed',
            target: this
        });
    }
    get intensityGamma() {
        return this.uniforms.intensity_gbc.value[0];
    }
    set intensityGamma(value) {
        if (this.uniforms.intensity_gbc.value[0] !== value) {
            this.uniforms.intensity_gbc.value[0] = value;
            this.dispatchEvent({
                type: 'material_property_changed',
                target: this
            });
        }
    }
    get intensityContrast() {
        return this.uniforms.intensity_gbc.value[2];
    }
    set intensityContrast(value) {
        if (this.uniforms.intensity_gbc.value[2] !== value) {
            this.uniforms.intensity_gbc.value[2] = value;
            this.dispatchEvent({
                type: 'material_property_changed',
                target: this
            });
        }
    }
    get intensityBrightness() {
        return this.uniforms.intensity_gbc.value[1];
    }
    set intensityBrightness(value) {
        if (this.uniforms.intensity_gbc.value[1] !== value) {
            this.uniforms.intensity_gbc.value[1] = value;
            this.dispatchEvent({
                type: 'material_property_changed',
                target: this
            });
        }
    }
    get rgbGamma() {
        return this.uniforms.uRGB_gbc.value[0];
    }
    set rgbGamma(value) {
        if (this.uniforms.uRGB_gbc.value[0] !== value) {
            this.uniforms.uRGB_gbc.value[0] = value;
            this.dispatchEvent({
                type: 'material_property_changed',
                target: this
            });
        }
    }
    get rgbContrast() {
        return this.uniforms.uRGB_gbc.value[2];
    }
    set rgbContrast(value) {
        if (this.uniforms.uRGB_gbc.value[2] !== value) {
            this.uniforms.uRGB_gbc.value[2] = value;
            this.dispatchEvent({
                type: 'material_property_changed',
                target: this
            });
        }
    }
    get rgbBrightness() {
        return this.uniforms.uRGB_gbc.value[1];
    }
    set rgbBrightness(value) {
        if (this.uniforms.uRGB_gbc.value[1] !== value) {
            this.uniforms.uRGB_gbc.value[1] = value;
            this.dispatchEvent({
                type: 'material_property_changed',
                target: this
            });
        }
    }
    get extraGamma() {
        return this.uniforms.uExtraGammaBrightContr.value[0];
    }
    set extraGamma(value) {
        if (this.uniforms.uExtraGammaBrightContr.value[0] !== value) {
            this.uniforms.uExtraGammaBrightContr.value[0] = value;
            this.dispatchEvent({
                type: 'material_property_changed',
                target: this
            });
        }
    }
    get extraBrightness() {
        return this.uniforms.uExtraGammaBrightContr.value[1];
    }
    set extraBrightness(value) {
        if (this.uniforms.uExtraGammaBrightContr.value[1] !== value) {
            this.uniforms.uExtraGammaBrightContr.value[1] = value;
            this.dispatchEvent({
                type: 'material_property_changed',
                target: this
            });
        }
    }
    get extraContrast() {
        return this.uniforms.uExtraGammaBrightContr.value[2];
    }
    set extraContrast(value) {
        if (this.uniforms.uExtraGammaBrightContr.value[2] !== value) {
            this.uniforms.uExtraGammaBrightContr.value[2] = value;
            this.dispatchEvent({
                type: 'material_property_changed',
                target: this
            });
        }
    }
    getRange(attributeName) {
        return this.ranges.get(attributeName);
    }
    setRange(attributeName, newRange) {
        let rangeChanged = false;
        const oldRange = this.ranges.get(attributeName);
        rangeChanged = null != oldRange && null != newRange ? oldRange[0] !== newRange[0] || oldRange[1] !== newRange[1] : true;
        this.ranges.set(attributeName, newRange);
        if (rangeChanged) this.dispatchEvent({
            type: 'material_property_changed',
            target: this
        });
    }
    get extraRange() {
        return this.uniforms.uExtraRange.value;
    }
    set extraRange(value) {
        if (!(Array.isArray(value) && 2 === value.length)) return;
        if (value[0] === this.uniforms.uExtraRange.value[0] && value[1] === this.uniforms.uExtraRange.value[1]) return;
        this.uniforms.uExtraRange.value = value;
        this._defaultExtraRangeChanged = true;
        this.dispatchEvent({
            type: 'material_property_changed',
            target: this
        });
    }
    get weightRGB() {
        return this.uniforms.wRGB.value;
    }
    set weightRGB(value) {
        if (this.uniforms.wRGB.value !== value) {
            this.uniforms.wRGB.value = value;
            this.dispatchEvent({
                type: 'material_property_changed',
                target: this
            });
        }
    }
    get weightIntensity() {
        return this.uniforms.wIntensity.value;
    }
    set weightIntensity(value) {
        if (this.uniforms.wIntensity.value !== value) {
            this.uniforms.wIntensity.value = value;
            this.dispatchEvent({
                type: 'material_property_changed',
                target: this
            });
        }
    }
    get weightElevation() {
        return this.uniforms.wElevation.value;
    }
    set weightElevation(value) {
        if (this.uniforms.wElevation.value !== value) {
            this.uniforms.wElevation.value = value;
            this.dispatchEvent({
                type: 'material_property_changed',
                target: this
            });
        }
    }
    get weightClassification() {
        return this.uniforms.wClassification.value;
    }
    set weightClassification(value) {
        if (this.uniforms.wClassification.value !== value) {
            this.uniforms.wClassification.value = value;
            this.dispatchEvent({
                type: 'material_property_changed',
                target: this
            });
        }
    }
    get weightReturnNumber() {
        return this.uniforms.wReturnNumber.value;
    }
    set weightReturnNumber(value) {
        if (this.uniforms.wReturnNumber.value !== value) {
            this.uniforms.wReturnNumber.value = value;
            this.dispatchEvent({
                type: 'material_property_changed',
                target: this
            });
        }
    }
    get weightSourceID() {
        return this.uniforms.wSourceID.value;
    }
    set weightSourceID(value) {
        if (this.uniforms.wSourceID.value !== value) {
            this.uniforms.wSourceID.value = value;
            this.dispatchEvent({
                type: 'material_property_changed',
                target: this
            });
        }
    }
    get enableZClip() {
        return this.uniforms.uEnableZClip.value;
    }
    set enableZClip(value) {
        this.uniforms.uEnableZClip.value = value;
    }
    get zClipRange() {
        return this.uniforms.uZClipRange.value;
    }
    set zClipRange(value) {
        this.uniforms.uZClipRange.value = value;
    }
    static generateGradientTexture(gradient) {
        const size = 64;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d');
        context.rect(0, 0, size, size);
        const ctxGradient = context.createLinearGradient(0, 0, size, size);
        for(let i = 0; i < gradient.length; i++){
            const step = gradient[i];
            ctxGradient.addColorStop(step[0], `#${step[1].getHexString()}`);
        }
        context.fillStyle = ctxGradient;
        context.fill();
        const texture = new __WEBPACK_EXTERNAL_MODULE_three__.CanvasTexture(canvas);
        texture.needsUpdate = true;
        texture.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.LinearFilter;
        texture.wrapS = __WEBPACK_EXTERNAL_MODULE_three__.RepeatWrapping;
        texture.wrapT = __WEBPACK_EXTERNAL_MODULE_three__.RepeatWrapping;
        texture.repeat = new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(2, 2);
        return texture;
    }
    static generateMatcapTexture(url) {
        const texture = new __WEBPACK_EXTERNAL_MODULE_three__.TextureLoader().load(url);
        texture.magFilter = texture.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.LinearFilter;
        texture.needsUpdate = true;
        return texture;
    }
    dispose() {
        this.visibleNodesTexture?.dispose();
        this.gradientTexture?.dispose();
        this.classificationTexture?.dispose();
        this.matcapTexture?.dispose();
        super.dispose();
    }
    disableEvents() {
        if (void 0 === this._hiddenListeners) {
            this._hiddenListeners = this._listeners;
            this._listeners = {};
        }
    }
    enableEvents() {
        this._listeners = this._hiddenListeners;
        this._hiddenListeners = void 0;
    }
}
export { PointCloudMaterial };
