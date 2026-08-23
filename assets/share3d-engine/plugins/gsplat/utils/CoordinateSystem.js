import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
var CoordinateSystem_rslib_entry_CoordinateSystemType = /*#__PURE__*/ function(CoordinateSystemType) {
    CoordinateSystemType["Y_UP"] = "Y_UP";
    CoordinateSystemType["Y_DOWN"] = "Y_DOWN";
    CoordinateSystemType["Z_UP"] = "Z_UP";
    return CoordinateSystemType;
}({});
class CoordinateSystem {
    static detect(splatData) {
        const x = splatData.getProp('x');
        const y = splatData.getProp('y');
        const z = splatData.getProp('z');
        if (!x || !y || !z || 0 === splatData.numSplats) return "Y_UP";
        const sampleSize = Math.min(splatData.numSplats, 10000);
        const step = Math.floor(splatData.numSplats / sampleSize);
        let yMin = 1 / 0, yMax = -1 / 0;
        let zMin = 1 / 0, zMax = -1 / 0;
        for(let i = 0; i < splatData.numSplats; i += step){
            yMin = Math.min(yMin, y[i]);
            yMax = Math.max(yMax, y[i]);
            zMin = Math.min(zMin, z[i]);
            zMax = Math.max(zMax, z[i]);
        }
        const yRange = yMax - yMin;
        const zRange = zMax - zMin;
        if (yRange > 2 * zRange) return "Z_UP";
        let negativeYCount = 0;
        for(let i = 0; i < splatData.numSplats; i += step)if (y[i] < 0) negativeYCount++;
        if (negativeYCount > 0.7 * sampleSize) return "Y_DOWN";
        return "Y_UP";
    }
    static getConversionMatrix(from, to) {
        const matrix = new __WEBPACK_EXTERNAL_MODULE_three__.Matrix4();
        if (from === to) return matrix;
        if ("Y_DOWN" === from && "Y_UP" === to) matrix.makeRotationX(Math.PI);
        else if ("Y_UP" === from && "Y_DOWN" === to) matrix.makeRotationX(Math.PI);
        else if ("Z_UP" === from && "Y_UP" === to) matrix.makeRotationX(-Math.PI / 2);
        else if ("Y_UP" === from && "Z_UP" === to) matrix.makeRotationX(Math.PI / 2);
        else if ("Z_UP" === from && "Y_DOWN" === to) matrix.makeRotationX(Math.PI / 2);
        else if ("Y_DOWN" === from && "Z_UP" === to) matrix.makeRotationX(-Math.PI / 2);
        return matrix;
    }
    static convert(splatData, from, to) {
        if (from === to) return;
        const matrix = CoordinateSystem.getConversionMatrix(from, to);
        const x = splatData.getProp('x');
        const y = splatData.getProp('y');
        const z = splatData.getProp('z');
        if (!x || !y || !z) return;
        const pos = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        for(let i = 0; i < splatData.numSplats; i++){
            pos.set(x[i], y[i], z[i]);
            pos.applyMatrix4(matrix);
            x[i] = pos.x;
            y[i] = pos.y;
            z[i] = pos.z;
        }
        const rot0 = splatData.getProp('rot_0');
        const rot1 = splatData.getProp('rot_1');
        const rot2 = splatData.getProp('rot_2');
        const rot3 = splatData.getProp('rot_3');
        if (rot0 && rot1 && rot2 && rot3) {
            const quat = new __WEBPACK_EXTERNAL_MODULE_three__.Quaternion();
            const rotationQuat = new __WEBPACK_EXTERNAL_MODULE_three__.Quaternion().setFromRotationMatrix(matrix);
            for(let i = 0; i < splatData.numSplats; i++){
                quat.set(rot1[i], rot2[i], rot3[i], rot0[i]);
                quat.premultiply(rotationQuat);
                quat.normalize();
                rot0[i] = quat.w;
                rot1[i] = quat.x;
                rot2[i] = quat.y;
                rot3[i] = quat.z;
            }
        }
    }
}
export { CoordinateSystem, CoordinateSystem_rslib_entry_CoordinateSystemType as CoordinateSystemType };
