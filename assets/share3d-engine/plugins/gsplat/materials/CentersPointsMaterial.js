import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shaders_chunks_frag_centersPoints_glsl_js_afa0a7d8__ from "../shaders/chunks/frag/centersPoints.glsl.js";
import * as __WEBPACK_EXTERNAL_MODULE__shaders_chunks_vert_centersPoints_glsl_js_b4319dc3__ from "../shaders/chunks/vert/centersPoints.glsl.js";
const DEFAULT_CENTERS_STYLE = {
    pointSize: 4.0,
    selectedColor: new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1, 1, 0),
    selectedOpacity: 1.0,
    unselectedColor: new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 1),
    unselectedOpacity: 0.5
};
function createFallbackStateTexture() {
    const texture = new __WEBPACK_EXTERNAL_MODULE_three__.DataTexture(new Uint8Array([
        0
    ]), 1, 1, __WEBPACK_EXTERNAL_MODULE_three__.RedFormat, __WEBPACK_EXTERNAL_MODULE_three__.UnsignedByteType);
    texture.name = 'fallbackSplatState';
    texture.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
    texture.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
    return texture;
}
class CentersPointsMaterial extends __WEBPACK_EXTERNAL_MODULE_three__.ShaderMaterial {
    constructor(){
        const fallbackStateTexture = createFallbackStateTexture();
        super({
            vertexShader: __WEBPACK_EXTERNAL_MODULE__shaders_chunks_vert_centersPoints_glsl_js_b4319dc3__["default"],
            fragmentShader: __WEBPACK_EXTERNAL_MODULE__shaders_chunks_frag_centersPoints_glsl_js_afa0a7d8__["default"],
            glslVersion: __WEBPACK_EXTERNAL_MODULE_three__.GLSL3,
            uniforms: {
                transformA: {
                    value: null
                },
                splatOrder: {
                    value: null
                },
                numSplats: {
                    value: 0
                },
                dataWidth: {
                    value: 0
                },
                orderWidth: {
                    value: 0
                },
                viewport_size: {
                    value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector4(1920, 1080, 1 / 1920, 1 / 1080)
                },
                camera_params: {
                    value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector4(0.01, 100, 0.1, 0)
                },
                cameraPositionHigh: {
                    value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector3()
                },
                cameraPositionLow: {
                    value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector3()
                },
                originToCameraHigh: {
                    value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector3()
                },
                originToCameraLow: {
                    value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector3()
                },
                splatState: {
                    value: fallbackStateTexture
                },
                pointSize: {
                    value: DEFAULT_CENTERS_STYLE.pointSize
                },
                selectedColor: {
                    value: DEFAULT_CENTERS_STYLE.selectedColor.clone()
                },
                selectedOpacity: {
                    value: DEFAULT_CENTERS_STYLE.selectedOpacity
                },
                unselectedColor: {
                    value: DEFAULT_CENTERS_STYLE.unselectedColor.clone()
                },
                unselectedOpacity: {
                    value: DEFAULT_CENTERS_STYLE.unselectedOpacity
                },
                splatScalar: {
                    value: null
                },
                scalarFilterEnabled: {
                    value: false
                },
                scalarFilterRange: {
                    value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector2(0, 1)
                }
            },
            transparent: true,
            depthWrite: false,
            depthTest: true,
            blending: __WEBPACK_EXTERNAL_MODULE_three__.CustomBlending,
            blendEquation: __WEBPACK_EXTERNAL_MODULE_three__.AddEquation,
            blendSrc: __WEBPACK_EXTERNAL_MODULE_three__.OneFactor,
            blendDst: __WEBPACK_EXTERNAL_MODULE_three__.OneMinusSrcAlphaFactor,
            blendSrcAlpha: __WEBPACK_EXTERNAL_MODULE_three__.OneFactor,
            blendDstAlpha: __WEBPACK_EXTERNAL_MODULE_three__.OneMinusSrcAlphaFactor,
            side: __WEBPACK_EXTERNAL_MODULE_three__.DoubleSide
        });
        this.name = 'CentersPointsMaterial';
        this._fallbackStateTexture = fallbackStateTexture;
    }
    setWorkBufferData(splatTexture0, orderTexture, numSplats, textureSize) {
        this.uniforms.transformA.value = splatTexture0;
        this.uniforms.splatOrder.value = orderTexture;
        this.uniforms.numSplats.value = numSplats;
        this.uniforms.dataWidth.value = textureSize;
        this.uniforms.orderWidth.value = textureSize;
    }
    setViewport(width, height) {
        this.uniforms.viewport_size.value.set(width, height, 1 / width, 1 / height);
    }
    setCameraParams(camera) {
        if (camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.PerspectiveCamera) this.uniforms.camera_params.value.set(1 / camera.far, camera.far, camera.near, 0);
        else if (camera instanceof __WEBPACK_EXTERNAL_MODULE_three__.OrthographicCamera) this.uniforms.camera_params.value.set(1 / camera.far, camera.far, camera.near, 1);
    }
    setCameraPositionWorld(position) {
        const highX = Math.fround(position.x);
        const highY = Math.fround(position.y);
        const highZ = Math.fround(position.z);
        this.uniforms.cameraPositionHigh.value.set(highX, highY, highZ);
        this.uniforms.cameraPositionLow.value.set(position.x - highX, position.y - highY, position.z - highZ);
    }
    setOriginToCamera(sceneOrigin, cameraPosition) {
        const diffX = sceneOrigin.x - cameraPosition.x;
        const diffY = sceneOrigin.y - cameraPosition.y;
        const diffZ = sceneOrigin.z - cameraPosition.z;
        const highX = Math.fround(diffX);
        const highY = Math.fround(diffY);
        const highZ = Math.fround(diffZ);
        this.uniforms.originToCameraHigh.value.set(highX, highY, highZ);
        this.uniforms.originToCameraLow.value.set(diffX - highX, diffY - highY, diffZ - highZ);
    }
    setSplatStateTexture(texture) {
        this.uniforms.splatState.value = texture ?? this._fallbackStateTexture;
    }
    setStyle(style) {
        if (void 0 !== style.pointSize) this.uniforms.pointSize.value = Math.max(1, style.pointSize);
        if (void 0 !== style.selectedColor) this.uniforms.selectedColor.value.copy(style.selectedColor);
        if (void 0 !== style.selectedOpacity) this.uniforms.selectedOpacity.value = Math.max(0, Math.min(1, style.selectedOpacity));
        if (void 0 !== style.unselectedColor) this.uniforms.unselectedColor.value.copy(style.unselectedColor);
        if (void 0 !== style.unselectedOpacity) this.uniforms.unselectedOpacity.value = Math.max(0, Math.min(1, style.unselectedOpacity));
    }
    getStyle() {
        return {
            pointSize: this.uniforms.pointSize.value,
            selectedColor: this.uniforms.selectedColor.value.clone(),
            selectedOpacity: this.uniforms.selectedOpacity.value,
            unselectedColor: this.uniforms.unselectedColor.value.clone(),
            unselectedOpacity: this.uniforms.unselectedOpacity.value
        };
    }
    setScalarTexture(texture) {
        const hadDefine = this.defines && 'HAS_SCALAR_FILTER' in this.defines;
        const needDefine = null !== texture;
        this.uniforms.splatScalar.value = texture;
        if (needDefine && !hadDefine) {
            this.defines = this.defines || {};
            this.defines.HAS_SCALAR_FILTER = 1;
            this.needsUpdate = true;
        } else if (!needDefine && hadDefine) {
            this.defines.HAS_SCALAR_FILTER = void 0;
            this.needsUpdate = true;
        }
    }
    setScalarFilter(enabled, min, max) {
        this.uniforms.scalarFilterEnabled.value = enabled;
        this.uniforms.scalarFilterRange.value.set(min, max);
    }
    clearScalarFilter() {
        this.setScalarTexture(null);
        this.uniforms.scalarFilterEnabled.value = false;
        this.uniforms.scalarFilterRange.value.set(0, 1);
    }
    dispose() {
        this._fallbackStateTexture?.dispose();
        this._fallbackStateTexture = null;
        super.dispose();
        this.uniforms.transformA.value = null;
        this.uniforms.splatOrder.value = null;
        this.uniforms.splatState.value = null;
        this.uniforms.splatScalar.value = null;
    }
}
export { CentersPointsMaterial, DEFAULT_CENTERS_STYLE };
