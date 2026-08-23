import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shaders_frag_gsplatSogsReorderMRT_fs_js_7024c53d__ from "../shaders/frag/gsplatSogsReorderMRT.fs.js";
import * as __WEBPACK_EXTERNAL_MODULE__shaders_gsplat_chunks_js_c6e8d193__ from "../shaders/gsplat-chunks.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('gsplat:gpu');
const fullscreenVS = `
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;
class SogsGpuPackerGPU {
    constructor(renderer){
        this.renderer = renderer;
        this.processedReorderFragment = (0, __WEBPACK_EXTERNAL_MODULE__shaders_gsplat_chunks_js_c6e8d193__.registerGSplatChunks)().assembleSource(__WEBPACK_EXTERNAL_MODULE__shaders_frag_gsplatSogsReorderMRT_fs_js_7024c53d__["default"]);
        const geometry = new __WEBPACK_EXTERNAL_MODULE_three__.BufferGeometry();
        const vertices = new Float32Array([
            -1,
            -1,
            3,
            -1,
            -1,
            3
        ]);
        geometry.setAttribute('position', new __WEBPACK_EXTERNAL_MODULE_three__.BufferAttribute(vertices, 2));
        geometry.boundingBox = new __WEBPACK_EXTERNAL_MODULE_three__.Box3(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(-1, -1, 0), new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(3, 3, 0));
        geometry.boundingSphere = new __WEBPACK_EXTERNAL_MODULE_three__.Sphere(new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1, 1, 0), 2 * Math.SQRT2);
        geometry.computeBoundingSphere = ()=>{};
        this.fullscreenQuad = new __WEBPACK_EXTERNAL_MODULE_three__.Mesh(geometry);
        this.quadScene = new __WEBPACK_EXTERNAL_MODULE_three__.Scene();
        this.quadScene.add(this.fullscreenQuad);
        this.quadCamera = new __WEBPACK_EXTERNAL_MODULE_three__.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    }
    packGpuMemory(sogsData) {
        const endPack = log.perf.time('gpuPack');
        const meta = sogsData.meta;
        if (!sogsData.meansLow || !sogsData.meansHigh || !sogsData.quats || !sogsData.scales || !sogsData.sh0) throw new Error('[SogsGpuPackerGPU] SOGS 数据不可用');
        const width = sogsData.textureWidth;
        const height = sogsData.textureHeight;
        const meansLTex = this.createSourceTexture(sogsData.meansLow, width, height, 'means_l');
        const meansUTex = this.createSourceTexture(sogsData.meansHigh, width, height, 'means_u');
        const quatsTex = this.createSourceTexture(sogsData.quats, width, height, 'quats');
        const scalesTex = this.createSourceTexture(sogsData.scales, width, height, 'scales');
        const sh0Tex = this.createSourceTexture(sogsData.sh0, width, height, 'sh0');
        const shLabelsTex = sogsData.shLabels ? this.createSourceTexture(sogsData.shLabels, width, height, 'sh_labels') : meansLTex;
        const uniforms = {
            means_l: {
                value: meansLTex
            },
            means_u: {
                value: meansUTex
            },
            quats: {
                value: quatsTex
            },
            scales: {
                value: scalesTex
            },
            sh0: {
                value: sh0Tex
            },
            sh_labels: {
                value: shLabelsTex
            },
            numSplats: {
                value: sogsData.numSplats
            }
        };
        const defines = {};
        if (2 === meta.version) {
            if (meta.scales.codebook && meta.sh0.codebook) {
                uniforms.scales_codebook = {
                    value: this.createCodebookUniform(meta.scales.codebook)
                };
                uniforms.sh0_codebook = {
                    value: this.createCodebookUniform(meta.sh0.codebook)
                };
            }
        } else {
            defines.REORDER_V1 = '1';
            uniforms.scalesMins = {
                value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(...meta.scales.mins)
            };
            uniforms.scalesMaxs = {
                value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(...meta.scales.maxs)
            };
            uniforms.sh0Mins = {
                value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector4(...meta.sh0.mins)
            };
            uniforms.sh0Maxs = {
                value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector4(...meta.sh0.maxs)
            };
        }
        const mrt = this.createMRTTarget(width, height);
        const material = new __WEBPACK_EXTERNAL_MODULE_three__.RawShaderMaterial({
            glslVersion: __WEBPACK_EXTERNAL_MODULE_three__.GLSL3,
            vertexShader: fullscreenVS,
            fragmentShader: this.processedReorderFragment,
            uniforms,
            defines,
            depthTest: false,
            depthWrite: false,
            blending: __WEBPACK_EXTERNAL_MODULE_three__.NoBlending
        });
        this.fullscreenQuad.material = material;
        const oldRenderTarget = this.renderer.getRenderTarget();
        const oldAutoClear = this.renderer.autoClear;
        this.renderer.autoClear = false;
        this.renderer.setRenderTarget(mrt);
        this.renderer.render(this.quadScene, this.quadCamera);
        this.renderer.setRenderTarget(oldRenderTarget);
        this.renderer.autoClear = oldAutoClear;
        const packedTexture = mrt.textures[0];
        const packedSh0 = mrt.textures[1];
        meansLTex.dispose();
        meansUTex.dispose();
        quatsTex.dispose();
        scalesTex.dispose();
        sh0Tex.dispose();
        if (sogsData.shLabels) shLabelsTex.dispose();
        material.dispose();
        endPack();
        return {
            packedTexture,
            packedSh0,
            width,
            height
        };
    }
    createSourceTexture(data, width, height, name) {
        const expectedSize = width * height * 4;
        let textureData;
        if (data.length === expectedSize) textureData = data;
        else {
            textureData = new Uint8Array(expectedSize);
            textureData.set(data.subarray(0, Math.min(data.length, expectedSize)));
        }
        const texture = new __WEBPACK_EXTERNAL_MODULE_three__.DataTexture(textureData, width, height, __WEBPACK_EXTERNAL_MODULE_three__.RGBAFormat, __WEBPACK_EXTERNAL_MODULE_three__.UnsignedByteType);
        texture.name = name;
        texture.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        texture.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        texture.wrapS = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
        texture.wrapT = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
        texture.generateMipmaps = false;
        texture.needsUpdate = true;
        return texture;
    }
    createMRTTarget(width, height) {
        const mrt = new __WEBPACK_EXTERNAL_MODULE_three__.WebGLRenderTarget(width, height, {
            count: 2,
            depthBuffer: false,
            stencilBuffer: false
        });
        const packedTex = mrt.textures[0];
        packedTex.name = 'sogsPackedData';
        packedTex.internalFormat = 'RGBA32UI';
        packedTex.format = __WEBPACK_EXTERNAL_MODULE_three__.RGBAIntegerFormat;
        packedTex.type = __WEBPACK_EXTERNAL_MODULE_three__.UnsignedIntType;
        packedTex.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        packedTex.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        packedTex.generateMipmaps = false;
        const colorTex = mrt.textures[1];
        colorTex.name = 'sogsPackedSh0';
        colorTex.format = __WEBPACK_EXTERNAL_MODULE_three__.RGBAFormat;
        colorTex.type = __WEBPACK_EXTERNAL_MODULE_three__.UnsignedByteType;
        colorTex.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        colorTex.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        colorTex.generateMipmaps = false;
        return mrt;
    }
    createCodebookUniform(codebook) {
        const result = new Float32Array(256);
        for(let i = 0; i < 256; i++)result[i] = codebook[i] ?? 0;
        return result;
    }
    dispose() {
        this.fullscreenQuad.geometry.dispose();
        this.quadScene.clear();
    }
    packFromTextures(params) {
        const { means_l, means_u, quats, scales, sh0, sh_labels, numSplats, meta } = params;
        const width = Math.floor(means_l.image.width);
        const height = Math.floor(means_l.image.height);
        const expectedBytes = width * height * 4;
        const textures = [
            {
                name: 'means_l',
                tex: means_l
            },
            {
                name: 'means_u',
                tex: means_u
            },
            {
                name: 'quats',
                tex: quats
            },
            {
                name: 'scales',
                tex: scales
            },
            {
                name: 'sh0',
                tex: sh0
            }
        ];
        if (sh_labels) textures.push({
            name: 'sh_labels',
            tex: sh_labels
        });
        for (const { name, tex } of textures){
            const dataLength = tex.image?.data?.length || 0;
            if (dataLength > 0 && dataLength < expectedBytes) log.error(`[SogsGpuPackerGPU] 纹理 ${name} 数据不足! 期望: ${expectedBytes} 字节, 实际: ${dataLength} 字节, 差额: ${expectedBytes - dataLength} 字节`);
        }
        const uniforms = {
            means_l: {
                value: means_l
            },
            means_u: {
                value: means_u
            },
            quats: {
                value: quats
            },
            scales: {
                value: scales
            },
            sh0: {
                value: sh0
            },
            sh_labels: {
                value: sh_labels ?? means_l
            },
            numSplats: {
                value: numSplats
            }
        };
        const defines = {};
        if (2 === meta.version) {
            if (meta.scales.codebook && meta.sh0.codebook) {
                uniforms.scales_codebook = {
                    value: this.createCodebookUniform(meta.scales.codebook)
                };
                uniforms.sh0_codebook = {
                    value: this.createCodebookUniform(meta.sh0.codebook)
                };
            }
        } else {
            defines.REORDER_V1 = '1';
            uniforms.scalesMins = {
                value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(...meta.scales.mins)
            };
            uniforms.scalesMaxs = {
                value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(...meta.scales.maxs)
            };
            uniforms.sh0Mins = {
                value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector4(...meta.sh0.mins)
            };
            uniforms.sh0Maxs = {
                value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector4(...meta.sh0.maxs)
            };
        }
        const mrt = this.createMRTTarget(width, height);
        const material = new __WEBPACK_EXTERNAL_MODULE_three__.RawShaderMaterial({
            glslVersion: __WEBPACK_EXTERNAL_MODULE_three__.GLSL3,
            vertexShader: fullscreenVS,
            fragmentShader: this.processedReorderFragment,
            uniforms,
            defines,
            depthTest: false,
            depthWrite: false,
            blending: __WEBPACK_EXTERNAL_MODULE_three__.NoBlending
        });
        this.fullscreenQuad.material = material;
        const oldRenderTarget = this.renderer.getRenderTarget();
        const oldAutoClear = this.renderer.autoClear;
        this.renderer.autoClear = false;
        this.renderer.setRenderTarget(mrt);
        this.renderer.render(this.quadScene, this.quadCamera);
        this.renderer.setRenderTarget(oldRenderTarget);
        this.renderer.autoClear = oldAutoClear;
        const packedTexture = mrt.textures[0];
        const packedSh0 = mrt.textures[1];
        material.dispose();
        return {
            packedTexture,
            packedSh0,
            width,
            height
        };
    }
}
export { SogsGpuPackerGPU };
