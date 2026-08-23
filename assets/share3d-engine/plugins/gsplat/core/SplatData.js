import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
class SplatIteratorImpl {
    constructor(gsplatData, p, r, s, c){
        const x = gsplatData.getProp('x');
        const y = gsplatData.getProp('y');
        const z = gsplatData.getProp('z');
        const rx = gsplatData.getProp('rot_1');
        const ry = gsplatData.getProp('rot_2');
        const rz = gsplatData.getProp('rot_3');
        const rw = gsplatData.getProp('rot_0');
        const sx = gsplatData.getProp('scale_0');
        const sy = gsplatData.getProp('scale_1');
        const sz = gsplatData.getProp('scale_2');
        const cr = gsplatData.getProp('f_dc_0');
        const cg = gsplatData.getProp('f_dc_1');
        const cb = gsplatData.getProp('f_dc_2');
        const ca = gsplatData.getProp('opacity');
        const SH_C0 = 0.28209479177387814;
        const sigmoid = (v)=>{
            if (v > 0) return 1 / (1 + Math.exp(-v));
            const t = Math.exp(v);
            return t / (1 + t);
        };
        this.read = (i)=>{
            if (p && x && y && z) {
                p.x = x[i];
                p.y = y[i];
                p.z = z[i];
            }
            if (r && rx && ry && rz && rw) r.set(rx[i], ry[i], rz[i], rw[i]);
            if (s && sx && sy && sz) s.set(Math.exp(sx[i]), Math.exp(sy[i]), Math.exp(sz[i]));
            if (c && cr && cg && cb && ca) c.set(0.5 + cr[i] * SH_C0, 0.5 + cg[i] * SH_C0, 0.5 + cb[i] * SH_C0, sigmoid(ca[i]));
        };
    }
}
class SplatData {
    constructor(elements, comments = []){
        this._aabbCache = null;
        this.elements = elements || [];
        this.numSplats = this.elements.length > 0 ? this.elements[0].count : 0;
        this.comments = comments;
    }
    getProp(name) {
        for (const element of this.elements){
            const prop = element.properties.find((p)=>p.name === name);
            if (prop) return prop.storage;
        }
        return null;
    }
    createIter(p, r, s, c) {
        return new SplatIteratorImpl(this, p, r, s, c);
    }
    getCenters() {
        const x = this.getProp('x');
        const y = this.getProp('y');
        const z = this.getProp('z');
        if (!x || !y || !z) throw new Error('Missing position properties (x, y, z)');
        const centers = new Float32Array(3 * this.numSplats);
        for(let i = 0; i < this.numSplats; i++){
            centers[3 * i + 0] = x[i];
            centers[3 * i + 1] = y[i];
            centers[3 * i + 2] = z[i];
        }
        return centers;
    }
    calcAabb(result) {
        if (this._aabbCache) {
            result.copy(this._aabbCache);
            return true;
        }
        const x = this.getProp('x');
        const y = this.getProp('y');
        const z = this.getProp('z');
        if (!x || !y || !z || 0 === this.numSplats) return false;
        let minX = 1 / 0, minY = 1 / 0, minZ = 1 / 0;
        let maxX = -1 / 0, maxY = -1 / 0, maxZ = -1 / 0;
        for(let i = 0; i < this.numSplats; i++){
            const px = x[i];
            const py = y[i];
            const pz = z[i];
            if (px < minX) minX = px;
            if (py < minY) minY = py;
            if (pz < minZ) minZ = pz;
            if (px > maxX) maxX = px;
            if (py > maxY) maxY = py;
            if (pz > maxZ) maxZ = pz;
        }
        result.min.set(minX, minY, minZ);
        result.max.set(maxX, maxY, maxZ);
        this._aabbCache = result.clone();
        return true;
    }
    invalidateAabbCache() {
        this._aabbCache = null;
    }
    calcAabbExact(result, pred) {
        const p = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        const r = new __WEBPACK_EXTERNAL_MODULE_three__.Quaternion();
        const s = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        const iter = this.createIter(p, r, s);
        const tempBox = new __WEBPACK_EXTERNAL_MODULE_three__.Box3();
        let first = true;
        for(let i = 0; i < this.numSplats; i++)if (!pred || !!pred(i)) {
            iter.read(i);
            if (first) {
                first = false;
                SplatData.calcSplatAabb(result, p, r, s);
            } else {
                SplatData.calcSplatAabb(tempBox, p, r, s);
                result.union(tempBox);
            }
        }
        return !first;
    }
    calcFocalPoint(result, pred) {
        const x = this.getProp('x');
        const y = this.getProp('y');
        const z = this.getProp('z');
        const sx = this.getProp('scale_0');
        const sy = this.getProp('scale_1');
        const sz = this.getProp('scale_2');
        result.set(0, 0, 0);
        let sum = 0;
        for(let i = 0; i < this.numSplats; i++){
            if (pred && !pred(i)) continue;
            const px = x[i];
            const py = y[i];
            const pz = z[i];
            if (!Number.isFinite(px) || !Number.isFinite(py) || !Number.isFinite(pz)) continue;
            const weight = 1.0 / (1.0 + Math.exp(Math.max(sx[i], sy[i], sz[i])));
            result.x += px * weight;
            result.y += py * weight;
            result.z += pz * weight;
            sum += weight;
        }
        if (sum > 0) result.multiplyScalar(1 / sum);
    }
    reorder(order) {
        const cache = new Map();
        const getStorage = (size)=>{
            const buffer = cache.get(size);
            if (buffer) {
                cache.delete(size);
                return buffer;
            }
            return new ArrayBuffer(size);
        };
        const returnStorage = (buffer)=>{
            if (buffer instanceof ArrayBuffer) cache.set(buffer.byteLength, buffer);
        };
        const reorderArray = (data)=>{
            const ctor = data.constructor;
            const result = new ctor(getStorage(data.byteLength));
            for(let i = 0; i < order.length; i++)result[i] = data[order[i]];
            returnStorage(data.buffer);
            return result;
        };
        this.elements.forEach((element)=>{
            element.properties.forEach((property)=>{
                if (property.storage) property.storage = reorderArray(property.storage);
            });
        });
    }
    reorderData() {
        this.reorder(this.calcMortonOrder());
    }
    static calcSplatAabb(result, p, r, s) {
        const mat = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4();
        mat.compose(p, r, new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(1, 1, 1));
        const localBox = new __WEBPACK_EXTERNAL_MODULE_three__.Box3();
        localBox.min.set(2 * -s.x, 2 * -s.y, 2 * -s.z);
        localBox.max.set(2 * s.x, 2 * s.y, 2 * s.z);
        result.makeEmpty();
        const corners = [
            new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(localBox.min.x, localBox.min.y, localBox.min.z),
            new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(localBox.max.x, localBox.min.y, localBox.min.z),
            new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(localBox.min.x, localBox.max.y, localBox.min.z),
            new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(localBox.max.x, localBox.max.y, localBox.min.z),
            new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(localBox.min.x, localBox.min.y, localBox.max.z),
            new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(localBox.max.x, localBox.min.y, localBox.max.z),
            new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(localBox.min.x, localBox.max.y, localBox.max.z),
            new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(localBox.max.x, localBox.max.y, localBox.max.z)
        ];
        for (const corner of corners){
            corner.applyMatrix4(mat);
            result.expandByPoint(corner);
        }
    }
    get shBands() {
        let numRestProps = 0;
        for(let i = 0; i < 45; i++){
            if (!this.getProp(`f_rest_${i}`)) break;
            numRestProps++;
        }
        const bandMap = {
            9: 1,
            24: 2,
            45: 3
        };
        return bandMap[numRestProps] ?? 0;
    }
    calcMortonOrder() {
        const x = this.getProp('x');
        const y = this.getProp('y');
        const z = this.getProp('z');
        if (!x || !y || !z || 0 === this.numSplats) return new Uint32Array(0);
        const aabb = new __WEBPACK_EXTERNAL_MODULE_three__.Box3();
        this.calcAabb(aabb);
        const min = aabb.min;
        const sizeX = aabb.max.x === min.x ? 0 : 1024 / (aabb.max.x - min.x);
        const sizeY = aabb.max.y === min.y ? 0 : 1024 / (aabb.max.y - min.y);
        const sizeZ = aabb.max.z === min.z ? 0 : 1024 / (aabb.max.z - min.z);
        const codes = new Map();
        for(let i = 0; i < this.numSplats; i++){
            const ix = Math.min(1023, Math.floor((x[i] - min.x) * sizeX));
            const iy = Math.min(1023, Math.floor((y[i] - min.y) * sizeY));
            const iz = Math.min(1023, Math.floor((z[i] - min.z) * sizeZ));
            const code = this.encodeMorton3D(Math.max(0, ix), Math.max(0, iy), Math.max(0, iz));
            const existing = codes.get(code);
            if (existing) existing.push(i);
            else codes.set(code, [
                i
            ]);
        }
        const sortedKeys = Array.from(codes.keys()).sort((a, b)=>a - b);
        const result = new Uint32Array(this.numSplats);
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
    get isCompressed() {
        return false;
    }
    dispose() {
        this.elements = [];
        this.numSplats = 0;
    }
}
export { SplatData };
