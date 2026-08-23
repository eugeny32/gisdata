class SplatExporter {
    async exportPly(splatData, options = {}) {
        const { includeDeleted = false, deletedMask, maxSHBands = 3 } = options;
        let count = 0;
        const validIndices = [];
        for(let i = 0; i < splatData.numSplats; i++)if (includeDeleted || !deletedMask || !deletedMask[i]) {
            validIndices.push(i);
            count++;
        }
        const header = this.buildPlyHeader(splatData, count, maxSHBands);
        const bytesPerSplat = this.calcBytesPerSplat(splatData, maxSHBands);
        const body = new ArrayBuffer(count * bytesPerSplat);
        const view = new DataView(body);
        let offset = 0;
        for (const i of validIndices)offset = this.writeSplat(view, offset, splatData, i, maxSHBands);
        const headerBytes = new TextEncoder().encode(header);
        const result = new Uint8Array(headerBytes.length + body.byteLength);
        result.set(headerBytes);
        result.set(new Uint8Array(body), headerBytes.length);
        return new Blob([
            result
        ], {
            type: 'application/octet-stream'
        });
    }
    async exportSplat(splatData, options = {}) {
        const { includeDeleted = false, deletedMask } = options;
        const validIndices = [];
        for(let i = 0; i < splatData.numSplats; i++)if (includeDeleted || !deletedMask || !deletedMask[i]) validIndices.push(i);
        const x = splatData.getProp('x');
        const y = splatData.getProp('y');
        const z = splatData.getProp('z');
        const scale0 = splatData.getProp('scale_0');
        const scale1 = splatData.getProp('scale_1');
        const scale2 = splatData.getProp('scale_2');
        const rot0 = splatData.getProp('rot_0');
        const rot1 = splatData.getProp('rot_1');
        const rot2 = splatData.getProp('rot_2');
        const rot3 = splatData.getProp('rot_3');
        const f_dc_0 = splatData.getProp('f_dc_0');
        const f_dc_1 = splatData.getProp('f_dc_1');
        const f_dc_2 = splatData.getProp('f_dc_2');
        const opacity = splatData.getProp('opacity');
        const SH_C0 = 0.28209479177387814;
        const buffer = new ArrayBuffer(32 * validIndices.length);
        const view = new DataView(buffer);
        let offset = 0;
        for (const i of validIndices){
            view.setFloat32(offset, x[i], true);
            offset += 4;
            view.setFloat32(offset, y[i], true);
            offset += 4;
            view.setFloat32(offset, z[i], true);
            offset += 4;
            view.setFloat32(offset, Math.exp(scale0[i]), true);
            offset += 4;
            view.setFloat32(offset, Math.exp(scale1[i]), true);
            offset += 4;
            view.setFloat32(offset, Math.exp(scale2[i]), true);
            offset += 4;
            const r = Math.max(0, Math.min(255, Math.round((0.5 + f_dc_0[i] * SH_C0) * 255)));
            const g = Math.max(0, Math.min(255, Math.round((0.5 + f_dc_1[i] * SH_C0) * 255)));
            const b = Math.max(0, Math.min(255, Math.round((0.5 + f_dc_2[i] * SH_C0) * 255)));
            const a = Math.max(0, Math.min(255, Math.round(1 / (1 + Math.exp(-opacity[i])) * 255)));
            view.setUint8(offset++, r);
            view.setUint8(offset++, g);
            view.setUint8(offset++, b);
            view.setUint8(offset++, a);
            const qLen = Math.sqrt(rot0[i] ** 2 + rot1[i] ** 2 + rot2[i] ** 2 + rot3[i] ** 2);
            const qw = rot0[i] / qLen;
            const qx = rot1[i] / qLen;
            const qy = rot2[i] / qLen;
            const qz = rot3[i] / qLen;
            view.setUint8(offset++, Math.round((0.5 * qw + 0.5) * 255));
            view.setUint8(offset++, Math.round((0.5 * qx + 0.5) * 255));
            view.setUint8(offset++, Math.round((0.5 * qy + 0.5) * 255));
            view.setUint8(offset++, Math.round((0.5 * qz + 0.5) * 255));
        }
        return new Blob([
            buffer
        ], {
            type: 'application/octet-stream'
        });
    }
    async exportCompressedPly(splatData, options = {}) {
        const { includeDeleted = false, deletedMask } = options;
        const validIndices = [];
        for(let i = 0; i < splatData.numSplats; i++)if (includeDeleted || !deletedMask || !deletedMask[i]) validIndices.push(i);
        const numSplats = validIndices.length;
        const numChunks = Math.ceil(numSplats / 256);
        const x = splatData.getProp('x');
        const y = splatData.getProp('y');
        const z = splatData.getProp('z');
        const scale0 = splatData.getProp('scale_0');
        const scale1 = splatData.getProp('scale_1');
        const scale2 = splatData.getProp('scale_2');
        const rot0 = splatData.getProp('rot_0');
        const rot1 = splatData.getProp('rot_1');
        const rot2 = splatData.getProp('rot_2');
        const rot3 = splatData.getProp('rot_3');
        const f_dc_0 = splatData.getProp('f_dc_0');
        const f_dc_1 = splatData.getProp('f_dc_1');
        const f_dc_2 = splatData.getProp('f_dc_2');
        const opacity = splatData.getProp('opacity');
        const SH_C0 = 0.28209479177387814;
        const chunkSize = 12;
        const chunkData = new Float32Array(numChunks * chunkSize);
        for(let c = 0; c < numChunks; c++){
            const startIdx = 256 * c;
            const endIdx = Math.min(startIdx + 256, numSplats);
            let minX = 1 / 0, minY = 1 / 0, minZ = 1 / 0;
            let maxX = -1 / 0, maxY = -1 / 0, maxZ = -1 / 0;
            let minSX = 1 / 0, minSY = 1 / 0, minSZ = 1 / 0;
            let maxSX = -1 / 0, maxSY = -1 / 0, maxSZ = -1 / 0;
            for(let j = startIdx; j < endIdx; j++){
                const i = validIndices[j];
                minX = Math.min(minX, x[i]);
                maxX = Math.max(maxX, x[i]);
                minY = Math.min(minY, y[i]);
                maxY = Math.max(maxY, y[i]);
                minZ = Math.min(minZ, z[i]);
                maxZ = Math.max(maxZ, z[i]);
                minSX = Math.min(minSX, scale0[i]);
                maxSX = Math.max(maxSX, scale0[i]);
                minSY = Math.min(minSY, scale1[i]);
                maxSY = Math.max(maxSY, scale1[i]);
                minSZ = Math.min(minSZ, scale2[i]);
                maxSZ = Math.max(maxSZ, scale2[i]);
            }
            const off = c * chunkSize;
            chunkData[off + 0] = minX;
            chunkData[off + 1] = minY;
            chunkData[off + 2] = minZ;
            chunkData[off + 3] = maxX;
            chunkData[off + 4] = maxY;
            chunkData[off + 5] = maxZ;
            chunkData[off + 6] = minSX;
            chunkData[off + 7] = minSY;
            chunkData[off + 8] = minSZ;
            chunkData[off + 9] = maxSX;
            chunkData[off + 10] = maxSY;
            chunkData[off + 11] = maxSZ;
        }
        const vertexData = new Uint32Array(4 * numSplats);
        for(let j = 0; j < numSplats; j++){
            const i = validIndices[j];
            const chunkIdx = Math.floor(j / 256);
            const off = chunkIdx * chunkSize;
            const px = this.quantize(x[i], chunkData[off + 0], chunkData[off + 3], 2047);
            const py = this.quantize(y[i], chunkData[off + 1], chunkData[off + 4], 1023);
            const pz = this.quantize(z[i], chunkData[off + 2], chunkData[off + 5], 2047);
            vertexData[4 * j + 0] = px << 21 | py << 11 | pz;
            vertexData[4 * j + 1] = this.packRotation(rot0[i], rot1[i], rot2[i], rot3[i]);
            const sx = this.quantize(scale0[i], chunkData[off + 6], chunkData[off + 9], 2047);
            const sy = this.quantize(scale1[i], chunkData[off + 7], chunkData[off + 10], 1023);
            const sz = this.quantize(scale2[i], chunkData[off + 8], chunkData[off + 11], 2047);
            vertexData[4 * j + 2] = sx << 21 | sy << 11 | sz;
            const r = Math.max(0, Math.min(255, Math.round((0.5 + f_dc_0[i] * SH_C0) * 255)));
            const g = Math.max(0, Math.min(255, Math.round((0.5 + f_dc_1[i] * SH_C0) * 255)));
            const b = Math.max(0, Math.min(255, Math.round((0.5 + f_dc_2[i] * SH_C0) * 255)));
            const a = Math.max(0, Math.min(255, Math.round(1 / (1 + Math.exp(-opacity[i])) * 255)));
            vertexData[4 * j + 3] = r << 24 | g << 16 | b << 8 | a;
        }
        let header = 'ply\nformat binary_little_endian 1.0\n';
        header += `comment Compressed PLY exported by ThreeGS\n`;
        header += `element chunk ${numChunks}\n`;
        header += 'property float min_x\nproperty float min_y\nproperty float min_z\n';
        header += 'property float max_x\nproperty float max_y\nproperty float max_z\n';
        header += 'property float min_scale_x\nproperty float min_scale_y\nproperty float min_scale_z\n';
        header += 'property float max_scale_x\nproperty float max_scale_y\nproperty float max_scale_z\n';
        header += `element vertex ${numSplats}\n`;
        header += 'property uint packed_position\n';
        header += 'property uint packed_rotation\n';
        header += 'property uint packed_scale\n';
        header += 'property uint packed_color\n';
        header += 'end_header\n';
        const headerBytes = new TextEncoder().encode(header);
        const chunkBytes = new Uint8Array(chunkData.buffer);
        const vertexBytes = new Uint8Array(vertexData.buffer);
        const result = new Uint8Array(headerBytes.length + chunkBytes.length + vertexBytes.length);
        result.set(headerBytes, 0);
        result.set(chunkBytes, headerBytes.length);
        result.set(vertexBytes, headerBytes.length + chunkBytes.length);
        return new Blob([
            result
        ], {
            type: 'application/octet-stream'
        });
    }
    quantize(value, min, max, maxInt) {
        if (max === min) return 0;
        const t = (value - min) / (max - min);
        return Math.max(0, Math.min(maxInt, Math.round(t * maxInt)));
    }
    packRotation(w, x, y, z) {
        const len = Math.sqrt(w * w + x * x + y * y + z * z);
        if (len > 0) {
            w /= len;
            x /= len;
            y /= len;
            z /= len;
        }
        const absW = Math.abs(w), absX = Math.abs(x), absY = Math.abs(y), absZ = Math.abs(z);
        let maxIdx = 0;
        let maxVal = absW;
        if (absX > maxVal) {
            maxIdx = 1;
            maxVal = absX;
        }
        if (absY > maxVal) {
            maxIdx = 2;
            maxVal = absY;
        }
        if (absZ > maxVal) maxIdx = 3;
        const sign = [
            w,
            x,
            y,
            z
        ][maxIdx] >= 0 ? 1 : -1;
        w *= sign;
        x *= sign;
        y *= sign;
        z *= sign;
        let a, b, c;
        switch(maxIdx){
            case 0:
                a = x;
                b = y;
                c = z;
                break;
            case 1:
                a = w;
                b = y;
                c = z;
                break;
            case 2:
                a = x;
                b = w;
                c = z;
                break;
            case 3:
                a = x;
                b = y;
                c = w;
                break;
            default:
                a = x;
                b = y;
                c = z;
        }
        const norm = Math.SQRT2;
        const qa = Math.max(0, Math.min(1023, Math.round((a / norm + 0.5) * 1023)));
        const qb = Math.max(0, Math.min(1023, Math.round((b / norm + 0.5) * 1023)));
        const qc = Math.max(0, Math.min(1023, Math.round((c / norm + 0.5) * 1023)));
        return maxIdx << 30 | qa << 20 | qb << 10 | qc;
    }
    buildPlyHeader(_splatData, count, maxSHBands) {
        let header = 'ply\nformat binary_little_endian 1.0\n';
        header += `element vertex ${count}\n`;
        header += 'property float x\n';
        header += 'property float y\n';
        header += 'property float z\n';
        header += 'property float rot_0\n';
        header += 'property float rot_1\n';
        header += 'property float rot_2\n';
        header += 'property float rot_3\n';
        header += 'property float scale_0\n';
        header += 'property float scale_1\n';
        header += 'property float scale_2\n';
        header += 'property float f_dc_0\n';
        header += 'property float f_dc_1\n';
        header += 'property float f_dc_2\n';
        header += 'property float opacity\n';
        if (maxSHBands > 0) {
            const shCoeffCount = this.getSHCoeffCount(maxSHBands);
            for(let i = 0; i < shCoeffCount; i++)header += `property float f_rest_${i}\n`;
        }
        header += 'end_header\n';
        return header;
    }
    getSHCoeffCount(bands) {
        const counts = [
            0,
            9,
            24,
            45
        ];
        return counts[bands] || 0;
    }
    calcBytesPerSplat(_splatData, maxSHBands) {
        let bytes = 56;
        if (maxSHBands > 0) bytes += 4 * this.getSHCoeffCount(maxSHBands);
        return bytes;
    }
    writeSplat(view, offset, splatData, index, maxSHBands) {
        const props = [
            'x',
            'y',
            'z',
            'rot_0',
            'rot_1',
            'rot_2',
            'rot_3',
            'scale_0',
            'scale_1',
            'scale_2',
            'f_dc_0',
            'f_dc_1',
            'f_dc_2',
            'opacity'
        ];
        for (const prop of props){
            const arr = splatData.getProp(prop);
            if (arr) view.setFloat32(offset, arr[index], true);
            else view.setFloat32(offset, 0, true);
            offset += 4;
        }
        if (maxSHBands > 0) {
            const shCount = this.getSHCoeffCount(maxSHBands);
            for(let i = 0; i < shCount; i++){
                const arr = splatData.getProp(`f_rest_${i}`);
                if (arr) view.setFloat32(offset, arr[index], true);
                else view.setFloat32(offset, 0, true);
                offset += 4;
            }
        }
        return offset;
    }
}
async function exportToPly(splatData, options) {
    const exporter = new SplatExporter();
    return exporter.exportPly(splatData, options);
}
async function exportToSplat(splatData, options) {
    const exporter = new SplatExporter();
    return exporter.exportSplat(splatData, options);
}
async function exportToCompressedPly(splatData, options) {
    const exporter = new SplatExporter();
    return exporter.exportCompressedPly(splatData, options);
}
export { SplatExporter, exportToCompressedPly, exportToPly, exportToSplat };
