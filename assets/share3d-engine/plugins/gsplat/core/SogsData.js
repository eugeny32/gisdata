import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__gpu_SogsGpuPacker_js_bdeab123__ from "../gpu/SogsGpuPacker.js";
import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('gsplat:core');
class SogsData {
    constructor(params){
        this._meansLowTexture = null;
        this._meansHighTexture = null;
        this._quatsTexture = null;
        this._scalesTexture = null;
        this._sh0Texture = null;
        this._textureWidth = 0;
        this._textureHeight = 0;
        this._centers = null;
        this._isDisposed = false;
        this._minimalMemory = false;
        this.meta = params.meta;
        this.numSplats = params.numSplats;
        this.meansLow = params.meansLow;
        this.meansHigh = params.meansHigh;
        this.quats = params.quats;
        this.scales = params.scales;
        this.sh0 = params.sh0;
        this.shLabels = params.shLabels ?? null;
        this.shCentroids = params.shCentroids ?? null;
        if (params.shCentroidsWidth && params.shCentroidsHeight) {
            this.shCentroidsWidth = params.shCentroidsWidth;
            this.shCentroidsHeight = params.shCentroidsHeight;
        } else if (params.shCentroids) {
            const totalPixels = params.shCentroids.length / 4;
            this.shCentroidsWidth = Math.ceil(Math.sqrt(totalPixels));
            this.shCentroidsHeight = Math.ceil(totalPixels / this.shCentroidsWidth);
        } else {
            this.shCentroidsWidth = 0;
            this.shCentroidsHeight = 0;
        }
        const pixelCount = params.meansLow.length / 4;
        this._textureWidth = Math.ceil(Math.sqrt(pixelCount));
        this._textureHeight = Math.ceil(pixelCount / this._textureWidth);
        if (params.minimalMemory) this._performMinimalMemorySetup();
    }
    get textureWidth() {
        return this._textureWidth;
    }
    get textureHeight() {
        return this._textureHeight;
    }
    get meansLowTexture() {
        if (!this._meansLowTexture) {
            if (!this.meansLow) throw new Error('[SogsData] CPU 数据已释放（minimalMemory 模式），无法创建纹理');
            this._meansLowTexture = this.createDataTexture('sogs_means_l', this.meansLow);
        }
        return this._meansLowTexture;
    }
    get meansHighTexture() {
        if (!this._meansHighTexture) {
            if (!this.meansHigh) throw new Error('[SogsData] CPU 数据已释放（minimalMemory 模式），无法创建纹理');
            this._meansHighTexture = this.createDataTexture('sogs_means_u', this.meansHigh);
        }
        return this._meansHighTexture;
    }
    get quatsTexture() {
        if (!this._quatsTexture) {
            if (!this.quats) throw new Error('[SogsData] CPU 数据已释放（minimalMemory 模式），无法创建纹理');
            this._quatsTexture = this.createDataTexture('sogs_quats', this.quats);
        }
        return this._quatsTexture;
    }
    get scalesTexture() {
        if (!this._scalesTexture) {
            if (!this.scales) throw new Error('[SogsData] CPU 数据已释放（minimalMemory 模式），无法创建纹理');
            this._scalesTexture = this.createDataTexture('sogs_scales', this.scales);
        }
        return this._scalesTexture;
    }
    get sh0Texture() {
        if (!this._sh0Texture) {
            if (!this.sh0) throw new Error('[SogsData] CPU 数据已释放（minimalMemory 模式），无法创建纹理');
            this._sh0Texture = this.createDataTexture('sogs_sh0', this.sh0);
        }
        return this._sh0Texture;
    }
    createDataTexture(name, data) {
        const expectedSize = this._textureWidth * this._textureHeight * 4;
        let textureData;
        if (data.length === expectedSize) textureData = data;
        else {
            textureData = new Uint8Array(expectedSize);
            textureData.set(data.subarray(0, Math.min(data.length, expectedSize)));
        }
        const texture = new __WEBPACK_EXTERNAL_MODULE_three__.DataTexture(textureData, this._textureWidth, this._textureHeight, __WEBPACK_EXTERNAL_MODULE_three__.RGBAFormat, __WEBPACK_EXTERNAL_MODULE_three__.UnsignedByteType);
        texture.name = name;
        texture.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        texture.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
        texture.wrapS = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
        texture.wrapT = __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping;
        texture.generateMipmaps = false;
        texture.colorSpace = __WEBPACK_EXTERNAL_MODULE_three__.NoColorSpace;
        texture.needsUpdate = true;
        return texture;
    }
    createIterator() {
        if (this._minimalMemory && !this.meansLow) throw new Error('[SogsData] minimalMemory 模式下无法创建迭代器（CPU 数据已释放）');
        return new SogsIterator(this);
    }
    getSplat(index) {
        const iter = this.createIterator();
        return iter.read(index);
    }
    getCenters() {
        if (this._centers) {
            const cached = this._centers;
            this._centers = null;
            return cached;
        }
        log.warn('[SogsData] getCenters: 使用 CPU 回退路径，建议先调用 generateCenters()');
        const centers = new Float32Array(3 * this.numSplats);
        const iter = this.createIterator();
        for(let i = 0; i < this.numSplats; i++){
            const splat = iter.read(i);
            centers[3 * i + 0] = splat.position[0];
            centers[3 * i + 1] = splat.position[1];
            centers[3 * i + 2] = splat.position[2];
        }
        return centers;
    }
    async generateCenters(renderer) {
        if (this._isDisposed) throw new Error('[SogsData] 资源已释放，无法生成 centers');
        try {
            const width = this._textureWidth;
            const height = this._textureHeight;
            const centersTarget = new __WEBPACK_EXTERNAL_MODULE_three__.WebGLRenderTarget(width, height, {
                format: __WEBPACK_EXTERNAL_MODULE_three__.RGBAFormat,
                type: __WEBPACK_EXTERNAL_MODULE_three__.FloatType,
                minFilter: __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter,
                magFilter: __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter,
                generateMipmaps: false
            });
            const material = new __WEBPACK_EXTERNAL_MODULE_three__.ShaderMaterial({
                glslVersion: __WEBPACK_EXTERNAL_MODULE_three__.GLSL3,
                uniforms: {
                    means_l: {
                        value: this.meansLowTexture
                    },
                    means_u: {
                        value: this.meansHighTexture
                    },
                    means_mins: {
                        value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(...this.meta.means.mins)
                    },
                    means_maxs: {
                        value: new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(...this.meta.means.maxs)
                    }
                },
                vertexShader: `
          out vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
                fragmentShader: `
          precision highp float;
          precision highp sampler2D;

          uniform sampler2D means_l;
          uniform sampler2D means_u;
          uniform vec3 means_mins;
          uniform vec3 means_maxs;
          in vec2 vUv;
          out vec4 fragColor;

          vec3 decompressPosition(vec2 uv) {
            vec4 low = texture(means_l, uv);
            vec4 high = texture(means_u, uv);

            // 合并高低位（16-bit）
            float px = ((high.r * 255.0) * 256.0 + low.r * 255.0) / 65535.0;
            float py = ((high.g * 255.0) * 256.0 + low.g * 255.0) / 65535.0;
            float pz = ((high.b * 255.0) * 256.0 + low.b * 255.0) / 65535.0;

            // 反量化到范围
            vec3 n = mix(means_mins, means_maxs, vec3(px, py, pz));

            // 指数反变换（PlayCanvas 特有）
            return sign(n) * (exp(abs(n)) - 1.0);
          }

          void main() {
            vec3 pos = decompressPosition(vUv);
            fragColor = vec4(pos, 1.0);
          }
        `
            });
            const quad = new __WEBPACK_EXTERNAL_MODULE_three__.Mesh(new __WEBPACK_EXTERNAL_MODULE_three__.PlaneGeometry(2, 2), material);
            const quadScene = new __WEBPACK_EXTERNAL_MODULE_three__.Scene();
            quadScene.add(quad);
            const quadCamera = new __WEBPACK_EXTERNAL_MODULE_three__.OrthographicCamera(-1, 1, 1, -1, 0, 1);
            const oldRenderTarget = renderer.getRenderTarget();
            renderer.setRenderTarget(centersTarget);
            renderer.render(quadScene, quadCamera);
            renderer.setRenderTarget(oldRenderTarget);
            const buffer = new Float32Array(width * height * 4);
            renderer.readRenderTargetPixels(centersTarget, 0, 0, width, height, buffer);
            const centers = new Float32Array(3 * this.numSplats);
            for(let i = 0; i < this.numSplats; i++){
                centers[3 * i + 0] = buffer[4 * i + 0];
                centers[3 * i + 1] = buffer[4 * i + 1];
                centers[3 * i + 2] = buffer[4 * i + 2];
            }
            this._centers = centers;
            centersTarget.dispose();
            material.dispose();
            quad.geometry.dispose();
        } catch (error) {
            log.warn('[SogsData] GPU generateCenters 失败，回退到 CPU: ' + (error instanceof Error ? error.message : String(error)));
            const centers = new Float32Array(3 * this.numSplats);
            const iter = this.createIterator();
            for(let i = 0; i < this.numSplats; i++){
                const splat = iter.read(i);
                centers[3 * i + 0] = splat.position[0];
                centers[3 * i + 1] = splat.position[1];
                centers[3 * i + 2] = splat.position[2];
            }
            this._centers = centers;
        }
    }
    calcAabb(result) {
        if (0 === this.numSplats) return false;
        let minX = 1 / 0, minY = 1 / 0, minZ = 1 / 0;
        let maxX = -1 / 0, maxY = -1 / 0, maxZ = -1 / 0;
        const iter = this.createIterator();
        for(let i = 0; i < this.numSplats; i++){
            const splat = iter.read(i);
            const [x, y, z] = splat.position;
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (z < minZ) minZ = z;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
            if (z > maxZ) maxZ = z;
        }
        result.min.set(minX, minY, minZ);
        result.max.set(maxX, maxY, maxZ);
        return true;
    }
    calcMortonOrder() {
        const result = new Uint32Array(this.numSplats);
        const aabb = new __WEBPACK_EXTERNAL_MODULE_three__.Box3();
        this.calcAabb(aabb);
        const min = aabb.min;
        const sizeX = aabb.max.x === min.x ? 0 : 1024 / (aabb.max.x - min.x);
        const sizeY = aabb.max.y === min.y ? 0 : 1024 / (aabb.max.y - min.y);
        const sizeZ = aabb.max.z === min.z ? 0 : 1024 / (aabb.max.z - min.z);
        const codes = new Map();
        const iter = this.createIterator();
        for(let i = 0; i < this.numSplats; i++){
            const splat = iter.read(i);
            const [x, y, z] = splat.position;
            const ix = Math.min(1023, Math.floor((x - min.x) * sizeX));
            const iy = Math.min(1023, Math.floor((y - min.y) * sizeY));
            const iz = Math.min(1023, Math.floor((z - min.z) * sizeZ));
            const code = this.encodeMorton3D(Math.max(0, ix), Math.max(0, iy), Math.max(0, iz));
            const existing = codes.get(code);
            if (existing) existing.push(i);
            else codes.set(code, [
                i
            ]);
        }
        const sortedKeys = Array.from(codes.keys()).sort((a, b)=>a - b);
        let idx = 0;
        for (const key of sortedKeys){
            const indices = codes.get(key);
            for (const i of indices)result[idx++] = i;
        }
        return result;
    }
    encodeMorton3D(x, y, z) {
        x = (x | x << 16) & 0x030000ff;
        x = (x | x << 8) & 0x0300f00f;
        x = (x | x << 4) & 0x030c30c3;
        x = (x | x << 2) & 0x09249249;
        y = (y | y << 16) & 0x030000ff;
        y = (y | y << 8) & 0x0300f00f;
        y = (y | y << 4) & 0x030c30c3;
        y = (y | y << 2) & 0x09249249;
        z = (z | z << 16) & 0x030000ff;
        z = (z | z << 8) & 0x0300f00f;
        z = (z | z << 4) & 0x030c30c3;
        z = (z | z << 2) & 0x09249249;
        return x | y << 1 | z << 2;
    }
    getUncompressedMemoryUsage() {
        return 56 * this.numSplats;
    }
    getCompressionRatio() {
        return this.getUncompressedMemoryUsage() / this.getMemoryUsage();
    }
    get shBands() {
        const info = this.getShPaletteInfo();
        return info?.shBands ?? 0;
    }
    getShPaletteInfo() {
        if (!this.shCentroids) return null;
        const totalPixels = this.shCentroids.length / 4;
        let shBands = 0;
        let width = 0;
        if (this.meta.shN?.bands !== void 0 && this.meta.shN.bands > 0) {
            shBands = this.meta.shN.bands;
            const bandsToWidth = {
                1: 192,
                2: 512,
                3: 960
            };
            width = bandsToWidth[shBands] || 0;
            if (0 === width || totalPixels % width !== 0) width = 0;
        }
        if (!width) {
            const widthBands = {
                192: 1,
                512: 2,
                960: 3
            };
            for (const [candidate, bands] of Object.entries(widthBands)){
                const candidateWidth = Number(candidate);
                if (totalPixels % candidateWidth === 0) {
                    width = candidateWidth;
                    shBands = bands;
                    break;
                }
            }
        }
        if (!width || !shBands) return null;
        const height = totalPixels / width;
        const coeffs = 1 === shBands ? 3 : 2 === shBands ? 8 : 15;
        return {
            width,
            height,
            coeffs,
            shBands
        };
    }
    packGpuMemory(renderer, minimalMemory = false) {
        try {
            const packer = new __WEBPACK_EXTERNAL_MODULE__gpu_SogsGpuPacker_js_bdeab123__.SogsGpuPacker(renderer);
            const packed = packer.packGpuMemory(this);
            packer.dispose();
            if (minimalMemory) this.enableMinimalMemory();
            return {
                dataTextureA: packed.dataTextureA,
                dataTextureB: packed.dataTextureB,
                colorTexture: packed.colorTexture,
                width: packed.width,
                height: packed.height
            };
        } catch (error) {
            log.error(`[SogsData] GPU 打包失败: ${error instanceof Error ? error.message : String(error)}`);
            return null;
        }
    }
    createDataTextures(width, height) {
        if (this._minimalMemory) throw new Error('[SogsData] minimalMemory 模式下无法调用 createDataTextures（CPU 数据已释放）');
        const createTexture = (data)=>{
            const texture = new __WEBPACK_EXTERNAL_MODULE_three__.DataTexture(data, width, height, __WEBPACK_EXTERNAL_MODULE_three__.RGBAFormat, __WEBPACK_EXTERNAL_MODULE_three__.UnsignedByteType);
            texture.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
            texture.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
            texture.generateMipmaps = false;
            texture.colorSpace = __WEBPACK_EXTERNAL_MODULE_three__.NoColorSpace;
            texture.needsUpdate = true;
            return texture;
        };
        return {
            meansLow: createTexture(this.meansLow),
            meansHigh: createTexture(this.meansHigh),
            quats: createTexture(this.quats),
            scales: createTexture(this.scales),
            sh0: createTexture(this.sh0)
        };
    }
    get isDisposed() {
        return this._isDisposed;
    }
    dispose() {
        if (this._isDisposed) {
            log.warn('[SogsData] 资源已释放，跳过重复释放');
            return;
        }
        this._isDisposed = true;
        if (this._meansLowTexture) {
            this._meansLowTexture.dispose();
            this._meansLowTexture = null;
        }
        if (this._meansHighTexture) {
            this._meansHighTexture.dispose();
            this._meansHighTexture = null;
        }
        if (this._quatsTexture) {
            this._quatsTexture.dispose();
            this._quatsTexture = null;
        }
        if (this._scalesTexture) {
            this._scalesTexture.dispose();
            this._scalesTexture = null;
        }
        if (this._sh0Texture) {
            this._sh0Texture.dispose();
            this._sh0Texture = null;
        }
        this._centers = null;
    }
    enableMinimalMemory() {
        if (this._minimalMemory) {
            log.warn('[SogsData] 已处于 minimalMemory 模式');
            return;
        }
        this._performMinimalMemorySetup();
    }
    _performMinimalMemorySetup() {
        this._minimalMemory = true;
        this._meansLowTexture = this.createDataTexture('sogs_means_l', this.meansLow);
        this._meansHighTexture = this.createDataTexture('sogs_means_u', this.meansHigh);
        this._quatsTexture = this.createDataTexture('sogs_quats', this.quats);
        this._scalesTexture = this.createDataTexture('sogs_scales', this.scales);
        this._sh0Texture = this.createDataTexture('sogs_sh0', this.sh0);
        this.meansLow = null;
        this.meansHigh = null;
        this.quats = null;
        this.scales = null;
        this.sh0 = null;
        this.shLabels = null;
        this.shCentroids = null;
    }
    getMemoryUsage() {
        if (this._minimalMemory) {
            const texelCount = this._textureWidth * this._textureHeight;
            return 20 * texelCount;
        }
        let total = 0;
        if (this.meansLow) total += this.meansLow.byteLength;
        if (this.meansHigh) total += this.meansHigh.byteLength;
        if (this.quats) total += this.quats.byteLength;
        if (this.scales) total += this.scales.byteLength;
        if (this.sh0) total += this.sh0.byteLength;
        if (this.shLabels) total += this.shLabels.byteLength;
        if (this.shCentroids) total += this.shCentroids.byteLength;
        return total;
    }
    getSplatCenter(index, target) {
        if (index < 0 || index >= this.numSplats) throw new Error(`[SogsData] 无效的 splat 索引: ${index} (总数: ${this.numSplats})`);
        const result = target || new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        const splat = this.getSplat(index);
        result.set(splat.position[0], splat.position[1], splat.position[2]);
        return result;
    }
    getSplatScale(index, target) {
        if (index < 0 || index >= this.numSplats) throw new Error(`[SogsData] 无效的 splat 索引: ${index} (总数: ${this.numSplats})`);
        const result = target || new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        const splat = this.getSplat(index);
        result.set(Math.exp(splat.scale[0]), Math.exp(splat.scale[1]), Math.exp(splat.scale[2]));
        return result;
    }
    getSplatRotation(index, target) {
        if (index < 0 || index >= this.numSplats) throw new Error(`[SogsData] 无效的 splat 索引: ${index} (总数: ${this.numSplats})`);
        const result = target || new __WEBPACK_EXTERNAL_MODULE_three__.Quaternion();
        const splat = this.getSplat(index);
        result.set(splat.rotation[1], splat.rotation[2], splat.rotation[3], splat.rotation[0]);
        result.normalize();
        return result;
    }
}
class SogsIterator {
    constructor(data){
        if (!data.meansLow || !data.meansHigh || !data.quats || !data.scales || !data.sh0) throw new Error('[SogsIterator] CPU 数据已释放，无法创建迭代器');
        this.data = data;
    }
    read(index) {
        const pixelOffset = 4 * index;
        const meansLow = this.data.meansLow;
        const meansHigh = this.data.meansHigh;
        const quats = this.data.quats;
        const scales = this.data.scales;
        const sh0 = this.data.sh0;
        const lowR = meansLow[pixelOffset];
        const lowG = meansLow[pixelOffset + 1];
        const lowB = meansLow[pixelOffset + 2];
        const highR = meansHigh[pixelOffset];
        const highG = meansHigh[pixelOffset + 1];
        const highB = meansHigh[pixelOffset + 2];
        const px16 = (highR << 8 | lowR) / 65535;
        const py16 = (highG << 8 | lowG) / 65535;
        const pz16 = (highB << 8 | lowB) / 65535;
        const mins = this.data.meta.means.mins;
        const maxs = this.data.meta.means.maxs;
        const nx = this.lerp(mins[0], maxs[0], px16);
        const ny = this.lerp(mins[1], maxs[1], py16);
        const nz = this.lerp(mins[2], maxs[2], pz16);
        const x = Math.sign(nx) * (Math.exp(Math.abs(nx)) - 1);
        const y = Math.sign(ny) * (Math.exp(Math.abs(ny)) - 1);
        const z = Math.sign(nz) * (Math.exp(Math.abs(nz)) - 1);
        const a = (quats[pixelOffset] / 255 - 0.5) * Math.SQRT2;
        const b = (quats[pixelOffset + 1] / 255 - 0.5) * Math.SQRT2;
        const c = (quats[pixelOffset + 2] / 255 - 0.5) * Math.SQRT2;
        const d = Math.sqrt(Math.max(0, 1 - (a * a + b * b + c * c)));
        const mode = quats[pixelOffset + 3] - 252;
        let rot_w, rot_x, rot_y, rot_z;
        switch(mode){
            case 0:
                rot_x = a;
                rot_y = b;
                rot_z = c;
                rot_w = d;
                break;
            case 1:
                rot_x = d;
                rot_y = b;
                rot_z = c;
                rot_w = a;
                break;
            case 2:
                rot_x = b;
                rot_y = d;
                rot_z = c;
                rot_w = a;
                break;
            case 3:
                rot_x = b;
                rot_y = c;
                rot_z = d;
                rot_w = a;
                break;
            default:
                {
                    log.warn(`[SogsIterator] 未知的四元数 mode: ${mode + 252}, fallback 到归一化`);
                    rot_x = a;
                    rot_y = b;
                    rot_z = c;
                    rot_w = d;
                    const qLen = Math.sqrt(rot_x * rot_x + rot_y * rot_y + rot_z * rot_z + rot_w * rot_w);
                    rot_w /= qLen;
                    rot_x /= qLen;
                    rot_y /= qLen;
                    rot_z /= qLen;
                }
        }
        let scale_0, scale_1, scale_2;
        if (2 === this.data.meta.version && this.data.meta.scales.codebook) {
            const codebook = this.data.meta.scales.codebook;
            scale_0 = codebook[scales[pixelOffset]] ?? -10;
            scale_1 = codebook[scales[pixelOffset + 1]] ?? -10;
            scale_2 = codebook[scales[pixelOffset + 2]] ?? -10;
        } else {
            const mins = this.data.meta.scales.mins;
            const maxs = this.data.meta.scales.maxs;
            scale_0 = this.lerp(mins[0], maxs[0], scales[pixelOffset] / 255);
            scale_1 = this.lerp(mins[1], maxs[1], scales[pixelOffset + 1] / 255);
            scale_2 = this.lerp(mins[2], maxs[2], scales[pixelOffset + 2] / 255);
        }
        let f_dc_0, f_dc_1, f_dc_2, opacity;
        if (2 === this.data.meta.version && this.data.meta.sh0.codebook) {
            const codebook = this.data.meta.sh0.codebook;
            f_dc_0 = codebook[sh0[pixelOffset]] ?? 0;
            f_dc_1 = codebook[sh0[pixelOffset + 1]] ?? 0;
            f_dc_2 = codebook[sh0[pixelOffset + 2]] ?? 0;
            opacity = sh0[pixelOffset + 3] / 255;
        } else {
            const mins = this.data.meta.sh0.mins;
            const maxs = this.data.meta.sh0.maxs;
            f_dc_0 = this.lerp(mins[0], maxs[0], sh0[pixelOffset] / 255);
            f_dc_1 = this.lerp(mins[1], maxs[1], sh0[pixelOffset + 1] / 255);
            f_dc_2 = this.lerp(mins[2], maxs[2], sh0[pixelOffset + 2] / 255);
            opacity = this.lerp(mins[3], maxs[3], sh0[pixelOffset + 3] / 255);
        }
        let shCoeffs;
        if (this.data.shLabels && this.data.shCentroids && this.data.meta.shN) {
            const paletteInfo = this.data.getShPaletteInfo();
            const { shN } = this.data.meta;
            if (paletteInfo && shN) {
                const { width, coeffs, shBands } = paletteInfo;
                const label = this.data.shLabels[pixelOffset] + (this.data.shLabels[pixelOffset + 1] << 8);
                const u = label % 64 * coeffs;
                const v = Math.floor(label / 64);
                shCoeffs = new Float32Array(45);
                for(let j = 0; j < 3; ++j)for(let k = 0; k < coeffs; ++k){
                    const idx = (u + k) * 4 + j + v * width * 4;
                    const encoded = this.data.shCentroids[idx];
                    let value = 0;
                    if (shN.codebook) value = shN.codebook[encoded] ?? 0;
                    else if (void 0 !== shN.mins && void 0 !== shN.maxs) value = this.lerp(shN.mins, shN.maxs, encoded / 255);
                    shCoeffs[15 * j + k] = value;
                }
                if (shBands < 3) shCoeffs.fill(0, 1 === shBands ? 9 : 24);
            }
        }
        return {
            position: [
                x,
                y,
                z
            ],
            rotation: [
                rot_w,
                rot_x,
                rot_y,
                rot_z
            ],
            scale: [
                scale_0,
                scale_1,
                scale_2
            ],
            color: [
                f_dc_0,
                f_dc_1,
                f_dc_2
            ],
            opacity,
            sh: shCoeffs
        };
    }
    lerp(a, b, t) {
        return a * (1 - t) + b * t;
    }
}
export { SogsData, SogsIterator };
