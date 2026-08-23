import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__shaders_frag_gsplatResolveSH_fs_js_41dc0da2__ from "../shaders/frag/gsplatResolveSH.fs.js";
import * as __WEBPACK_EXTERNAL_MODULE__shaders_gsplat_chunks_js_c6e8d193__ from "../shaders/gsplat-chunks.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__ from "../../../shared/constants/index.js";
class GSplatResolveSH {
    constructor(renderer, shBands){
        this.prevDir = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        this.updateMode = 'enable';
        this.directionThreshold = __WEBPACK_EXTERNAL_MODULE__shared_constants_index_js_1ee73a4e__.GSPLAT_SH_DIRECTION_THRESHOLD;
        this.centroidsTexture = null;
        this.renderCount = 0;
        this.renderer = renderer;
        this.shBands = shBands;
        this.processedFragment = (0, __WEBPACK_EXTERNAL_MODULE__shaders_gsplat_chunks_js_c6e8d193__.registerGSplatChunks)().assembleSource(__WEBPACK_EXTERNAL_MODULE__shaders_frag_gsplatResolveSH_fs_js_41dc0da2__["default"]);
        const width = 64;
        const height = 1024;
        this.renderTarget = new __WEBPACK_EXTERNAL_MODULE_three__.WebGLRenderTarget(width, height, {
            format: __WEBPACK_EXTERNAL_MODULE_three__.RGBAFormat,
            type: __WEBPACK_EXTERNAL_MODULE_three__.UnsignedByteType,
            minFilter: __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter,
            magFilter: __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter,
            generateMipmaps: false,
            depthBuffer: false,
            stencilBuffer: false
        });
        this.texture = this.renderTarget.texture;
        this.texture.name = 'shResultTexture';
        this.quadScene = new __WEBPACK_EXTERNAL_MODULE_three__.Scene();
        this.quadCamera = new __WEBPACK_EXTERNAL_MODULE_three__.OrthographicCamera(-1, 1, 1, -1, 0, 1);
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
        const material = this.createMaterial();
        this.quadMesh = new __WEBPACK_EXTERNAL_MODULE_three__.Mesh(geometry, material);
        this.quadScene.add(this.quadMesh);
    }
    createMaterial() {
        return new __WEBPACK_EXTERNAL_MODULE_three__.RawShaderMaterial({
            glslVersion: __WEBPACK_EXTERNAL_MODULE_three__.GLSL3,
            vertexShader: `
        in vec2 position;
        void main() {
          gl_Position = vec4(position, 0.0, 1.0);
        }
      `,
            fragmentShader: this.processedFragment,
            uniforms: {
                dir: {
                    value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, 1)
                },
                centroids: {
                    value: null
                },
                shN_mins: {
                    value: 0.0
                },
                shN_maxs: {
                    value: 1.0
                }
            },
            defines: {
                SH_BANDS: String(this.shBands)
            },
            depthTest: false,
            depthWrite: false,
            blending: __WEBPACK_EXTERNAL_MODULE_three__.NoBlending
        });
    }
    setCentroids(texture, mins, maxs) {
        this.centroidsTexture = texture;
        const material = this.quadMesh.material;
        material.uniforms.centroids.value = texture;
        material.uniforms.shN_mins.value = mins;
        material.uniforms.shN_maxs.value = maxs;
    }
    render(camera, modelMatrix) {
        if ('disable' === this.updateMode) return false;
        if (!this.centroidsTexture) return false;
        const invModelMat = modelMatrix.clone().invert();
        const cameraForward = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(0, 0, -1);
        cameraForward.applyQuaternion(camera.quaternion);
        const dir = cameraForward.clone().transformDirection(invModelMat).normalize();
        if ('enable' === this.updateMode) {
            const diff = dir.distanceTo(this.prevDir);
            if (diff < this.directionThreshold) return false;
        }
        this.prevDir.copy(dir);
        const material = this.quadMesh.material;
        material.uniforms.dir.value.copy(dir);
        const oldRenderTarget = this.renderer.getRenderTarget();
        this.renderer.setRenderTarget(this.renderTarget);
        this.renderer.render(this.quadScene, this.quadCamera);
        this.renderer.setRenderTarget(oldRenderTarget);
        this.renderCount++;
        return true;
    }
    getUniforms() {
        return {
            sh_result: {
                value: this.texture
            }
        };
    }
    dispose() {
        this.texture.dispose();
        this.renderTarget.dispose();
        this.quadMesh.material.dispose();
        this.quadMesh.geometry.dispose();
    }
}
const gsplatSogsHighQualitySHChunk = `
// 高质量 SH 解析 uniforms
uniform sampler2D sh_result;

const float SH_C0 = 0.28209479177387814;

// 解包 11+11+10 位打包的 RGB 值（与 SHBitPacker.shBitPackingChunk 一致）
vec3 unpackSHRgb(vec4 v) {
  uvec4 uv = uvec4(v * 255.0);
  uint bits = (uv.x << 24u) | (uv.y << 16u) | (uv.z << 8u) | uv.w;
  uvec3 vb = (uvec3(bits) >> uvec3(21u, 10u, 0u)) & uvec3(0x7ffu, 0x7ffu, 0x3ffu);
  return vec3(vb) / vec3(2047.0, 2047.0, 1023.0);
}

// 反归一化 SH 值（与 SHBitPacker.shBitPackingChunk 一致）
vec3 denormalizeSH(vec3 normalized) {
  return (normalized - 0.5) * 4.0;
}

// 高质量 SH 颜色读取（使用预计算的 SH 查找纹理）
vec4 readColorHighQualitySH(in SplatSource source) {
  // 采样基础颜色
  vec4 baseSample = mix(sh0Mins, sh0Maxs, texelFetch(sh0, source.uv, 0));

  // 解析基础颜色
  vec4 base = vec4(vec3(0.5) + baseSample.xyz * SH_C0, 1.0 / (1.0 + exp(-baseSample.w)));

  // 提取球谐调色板索引
  ivec2 labelSample = ivec2(texelFetch(sh_labels, source.uv, 0).xy * 255.0);
  int n = labelSample.x + labelSample.y * 256;

  // 从预计算的 SH 结果纹理查找
  vec4 shSample = texelFetch(sh_result, ivec2(n % 64, n / 64), 0);
  vec3 sh = denormalizeSH(unpackSHRgb(shSample));

  return vec4(base.xyz + sh, base.w);
}
`;
export { GSplatResolveSH, gsplatSogsHighQualitySHChunk };
