import * as __WEBPACK_EXTERNAL_MODULE__SplatData_js_df8b864e__ from "./SplatData.js";
import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
var __webpack_modules__ = {
    "./SplatData": function(module) {
        module.exports = __WEBPACK_EXTERNAL_MODULE__SplatData_js_df8b864e__;
    }
};
var __webpack_module_cache__ = {};
function __webpack_require__(moduleId) {
    var cachedModule = __webpack_module_cache__[moduleId];
    if (void 0 !== cachedModule) return cachedModule.exports;
    var module = __webpack_module_cache__[moduleId] = {
        exports: {}
    };
    __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
    return module.exports;
}
class CompressedSplatData {
    constructor(params){
        this.numSplats = params.numSplats;
        this.numChunks = params.numChunks;
        this.chunkSize = params.chunkSize;
        this.chunkData = params.chunkData;
        this.vertexData = params.vertexData;
        this.hasColorRange = params.hasColorRange;
        this.shBands = params.shBands;
        this.comments = params.comments || [];
        this.shData0 = params.shData0 || null;
        this.shData1 = params.shData1 || null;
        this.shData2 = params.shData2 || null;
    }
    createIterator() {
        return new CompressedIterator(this);
    }
    getSplat(index) {
        const iter = this.createIterator();
        return iter.read(index);
    }
    getCenters() {
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
    getMemoryUsage() {
        let total = this.chunkData.byteLength + this.vertexData.byteLength;
        if (this.shData0) total += this.shData0.byteLength;
        if (this.shData1) total += this.shData1.byteLength;
        if (this.shData2) total += this.shData2.byteLength;
        return total;
    }
    getUncompressedMemoryUsage() {
        const baseSize = 56;
        const shSize = this.shBands > 0 ? [
            36,
            96,
            180
        ][this.shBands - 1] : 0;
        return this.numSplats * (baseSize + shSize);
    }
    getCompressionRatio() {
        return this.getUncompressedMemoryUsage() / this.getMemoryUsage();
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
    getChunks(result) {
        const { chunkData, numChunks, chunkSize } = this;
        for(let c = 0; c < numChunks; c++){
            const off = c * chunkSize;
            result[6 * c + 0] = chunkData[off + 0];
            result[6 * c + 1] = chunkData[off + 1];
            result[6 * c + 2] = chunkData[off + 2];
            result[6 * c + 3] = chunkData[off + 3];
            result[6 * c + 4] = chunkData[off + 4];
            result[6 * c + 5] = chunkData[off + 5];
        }
    }
    calcFocalPoint(result) {
        const { chunkData, numChunks, chunkSize } = this;
        result.set(0, 0, 0);
        for(let i = 0; i < numChunks; i++){
            const off = i * chunkSize;
            result.x += chunkData[off + 0] + chunkData[off + 3];
            result.y += chunkData[off + 1] + chunkData[off + 4];
            result.z += chunkData[off + 2] + chunkData[off + 5];
        }
        result.multiplyScalar(0.5 / numChunks);
    }
    get isCompressed() {
        return true;
    }
    decompress() {
        const { SplatData } = __webpack_require__("./SplatData");
        const members = [
            'x',
            'y',
            'z',
            'f_dc_0',
            'f_dc_1',
            'f_dc_2',
            'opacity',
            'scale_0',
            'scale_1',
            'scale_2',
            'rot_0',
            'rot_1',
            'rot_2',
            'rot_3'
        ];
        if (this.shBands > 0) {
            const shMembers = [];
            for(let i = 0; i < 45; i++)shMembers.push(`f_rest_${i}`);
            const location = Math.max(...[
                'f_dc_0',
                'f_dc_1',
                'f_dc_2'
            ].map((name)=>members.indexOf(name)));
            members.splice(location + 1, 0, ...shMembers);
        }
        const data = {};
        members.forEach((name)=>{
            data[name] = new Float32Array(this.numSplats);
        });
        const iter = this.createIterator();
        for(let i = 0; i < this.numSplats; i++){
            const splat = iter.read(i);
            data.x[i] = splat.position[0];
            data.y[i] = splat.position[1];
            data.z[i] = splat.position[2];
            data.rot_0[i] = splat.rotation[0];
            data.rot_1[i] = splat.rotation[1];
            data.rot_2[i] = splat.rotation[2];
            data.rot_3[i] = splat.rotation[3];
            data.scale_0[i] = splat.scale[0];
            data.scale_1[i] = splat.scale[1];
            data.scale_2[i] = splat.scale[2];
            data.f_dc_0[i] = splat.color[0];
            data.f_dc_1[i] = splat.color[1];
            data.f_dc_2[i] = splat.color[2];
            data.opacity[i] = splat.opacity;
            if (splat.sh) for(let c = 0; c < 45; c++)data[`f_rest_${c}`][i] = splat.sh[c] || 0;
        }
        const splatData = new SplatData();
        splatData.numSplats = this.numSplats;
        splatData.comments = this.comments;
        splatData.elements = [
            {
                name: 'vertex',
                count: this.numSplats,
                properties: members.map((name)=>({
                        name,
                        type: 'float',
                        byteSize: 4,
                        storage: data[name]
                    }))
            }
        ];
        return splatData;
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
}
class CompressedIterator {
    constructor(data){
        this.SH_C0 = 0.28209479177387814;
        this.data = data;
        const shSize = data.shBands > 0 ? [
            9,
            24,
            45
        ][data.shBands - 1] : 0;
        this.tempSH = new Float32Array(shSize);
    }
    read(index) {
        const chunkIdx = Math.floor(index / 256);
        const ci = chunkIdx * this.data.chunkSize;
        const [px, py, pz] = this.unpack111011(this.data.vertexData[4 * index + 0]);
        const x = this.lerp(this.data.chunkData[ci + 0], this.data.chunkData[ci + 3], px);
        const y = this.lerp(this.data.chunkData[ci + 1], this.data.chunkData[ci + 4], py);
        const z = this.lerp(this.data.chunkData[ci + 2], this.data.chunkData[ci + 5], pz);
        const [rx, ry, rz, rw] = this.unpackRot(this.data.vertexData[4 * index + 1]);
        const [sx, sy, sz] = this.unpack111011(this.data.vertexData[4 * index + 2]);
        const scale_0 = this.lerp(this.data.chunkData[ci + 6], this.data.chunkData[ci + 9], sx);
        const scale_1 = this.lerp(this.data.chunkData[ci + 7], this.data.chunkData[ci + 10], sy);
        const scale_2 = this.lerp(this.data.chunkData[ci + 8], this.data.chunkData[ci + 11], sz);
        const [cr, cg, cb, ca] = this.unpack8888(this.data.vertexData[4 * index + 3]);
        let finalR = cr, finalG = cg, finalB = cb;
        if (this.data.hasColorRange) {
            finalR = this.lerp(this.data.chunkData[ci + 12], this.data.chunkData[ci + 15], cr);
            finalG = this.lerp(this.data.chunkData[ci + 13], this.data.chunkData[ci + 16], cg);
            finalB = this.lerp(this.data.chunkData[ci + 14], this.data.chunkData[ci + 17], cb);
        }
        const f_dc_0 = (finalR - 0.5) / this.SH_C0;
        const f_dc_1 = (finalG - 0.5) / this.SH_C0;
        const f_dc_2 = (finalB - 0.5) / this.SH_C0;
        const opacity = ca <= 0 ? -40 : ca >= 1 ? 40 : -Math.log(1 / ca - 1);
        if (this.data.shBands > 0 && this.data.shData0 && this.data.shData1 && this.data.shData2) {
            const shCoeffsPerChannel = [
                3,
                8,
                15
            ][this.data.shBands - 1];
            const shDataArr = [
                this.data.shData0,
                this.data.shData1,
                this.data.shData2
            ];
            for(let ch = 0; ch < 3; ch++)for(let k = 0; k < shCoeffsPerChannel; k++){
                const rawValue = shDataArr[ch][16 * index + k];
                const decoded = 8 / 255 * rawValue - 4;
                this.tempSH[ch * shCoeffsPerChannel + k] = decoded;
            }
        }
        return {
            position: [
                x,
                y,
                z
            ],
            rotation: [
                rw,
                rx,
                ry,
                rz
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
            sh: this.data.shBands > 0 ? this.tempSH.slice() : void 0
        };
    }
    unpackUnorm(value, bits) {
        const t = (1 << bits) - 1;
        return (value & t) / t;
    }
    unpack111011(value) {
        const x = this.unpackUnorm(value >>> 21, 11);
        const y = this.unpackUnorm(value >>> 11, 10);
        const z = this.unpackUnorm(value, 11);
        return [
            x,
            y,
            z
        ];
    }
    unpack8888(value) {
        const x = this.unpackUnorm(value >>> 24, 8);
        const y = this.unpackUnorm(value >>> 16, 8);
        const z = this.unpackUnorm(value >>> 8, 8);
        const w = this.unpackUnorm(value, 8);
        return [
            x,
            y,
            z,
            w
        ];
    }
    unpackRot(value) {
        const norm = Math.SQRT2;
        const a = (this.unpackUnorm(value >>> 20, 10) - 0.5) * norm;
        const b = (this.unpackUnorm(value >>> 10, 10) - 0.5) * norm;
        const c = (this.unpackUnorm(value, 10) - 0.5) * norm;
        const m = Math.sqrt(Math.max(0, 1.0 - (a * a + b * b + c * c)));
        switch(value >>> 30){
            case 0:
                return [
                    a,
                    b,
                    c,
                    m
                ];
            case 1:
                return [
                    m,
                    b,
                    c,
                    a
                ];
            case 2:
                return [
                    b,
                    m,
                    c,
                    a
                ];
            case 3:
                return [
                    b,
                    c,
                    m,
                    a
                ];
            default:
                return [
                    0,
                    0,
                    0,
                    1
                ];
        }
    }
    lerp(a, b, t) {
        return a * (1 - t) + b * t;
    }
}
export { CompressedIterator, CompressedSplatData };
