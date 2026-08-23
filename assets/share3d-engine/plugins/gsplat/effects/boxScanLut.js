import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__ from "./effectUtils.js";
class GSplatScanLUTWriter {
    write(target, options) {
        const length = Math.max(options.length, 0);
        const duration = Math.max(options.duration, 0.001);
        const planeProgress = (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.clamp)(options.effectTime / duration, 0, 1);
        const edgeDistance = options.interval / duration * length;
        const planePos = options.reverse ? (1 - planeProgress) * length : planeProgress * length;
        const isTintOnlyMode = Math.abs((options.visibleStart ? 1 : 0) - (options.visibleEnd ? 1 : 0)) < 0.01;
        if (options.effectTime >= duration) {
            this.fillCompleted(target, isTintOnlyMode, options);
            return;
        }
        for(let i = 0; i < 256; i++){
            const t = i / 255;
            const splatPos = t * length;
            const distToPlane = splatPos - planePos;
            const tBack = (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.clamp)((distToPlane + edgeDistance) / Math.max(edgeDistance, 0.0001), 0, 1);
            const tFront = (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.clamp)(distToPlane / Math.max(edgeDistance, 0.0001), 0, 1);
            const scale = this.computeScale(options, isTintOnlyMode, distToPlane, edgeDistance, tBack, tFront);
            const tint = this.computeTint(options, isTintOnlyMode, distToPlane, edgeDistance);
            this.writePixel(target, i, options.baseTint.r * tint.x, options.baseTint.g * tint.y, options.baseTint.b * tint.z, scale);
        }
    }
    fill(target, r, g, b, scale) {
        for(let i = 0; i < 256; i++)this.writePixel(target, i, r, g, b, scale);
    }
    fillCompleted(target, isTintOnlyMode, options) {
        const scale = isTintOnlyMode || options.visibleEnd ? 1 : 0;
        if (isTintOnlyMode) {
            if (options.invertTint) this._additionalTint.set(1, 1, 1);
            else this._additionalTint.set(options.tint.r, options.tint.g, options.tint.b);
        } else this._additionalTint.set(options.tint.r, options.tint.g, options.tint.b);
        this.fill(target, options.baseTint.r * this._additionalTint.x, options.baseTint.g * this._additionalTint.y, options.baseTint.b * this._additionalTint.z, scale);
    }
    writePixel(target, index, r, g, b, scale) {
        const offset = 4 * index;
        target[offset] = __WEBPACK_EXTERNAL_MODULE_three__.DataUtils.toHalfFloat(r);
        target[offset + 1] = __WEBPACK_EXTERNAL_MODULE_three__.DataUtils.toHalfFloat(g);
        target[offset + 2] = __WEBPACK_EXTERNAL_MODULE_three__.DataUtils.toHalfFloat(b);
        target[offset + 3] = __WEBPACK_EXTERNAL_MODULE_three__.DataUtils.toHalfFloat(scale);
    }
    computeScale(options, isTintOnlyMode, distToPlane, edgeDistance, tBack, tFront) {
        if (isTintOnlyMode) return 1;
        if (options.reverse) {
            if (tBack < 1 && distToPlane < 0) {
                const visStart = options.visibleStart ? 1 : 0;
                const visEnd = options.visibleEnd ? 1 : 0;
                return visStart + (visEnd - visStart) * tBack;
            }
            return distToPlane < -edgeDistance ? options.visibleStart ? 1 : 0 : options.visibleEnd ? 1 : 0;
        }
        if (tFront < 1 && distToPlane >= 0) {
            const visStart = options.visibleStart ? 1 : 0;
            const visEnd = options.visibleEnd ? 1 : 0;
            return visEnd + (visStart - visEnd) * tFront;
        }
        return distToPlane < 0 ? options.visibleEnd ? 1 : 0 : options.visibleStart ? 1 : 0;
    }
    computeTint(options, isTintOnlyMode, distToPlane, edgeDistance) {
        this._additionalTint.set(1, 1, 1);
        if (isTintOnlyMode) {
            const isAhead = options.reverse ? distToPlane < 0 : distToPlane > 0;
            const distAbs = Math.abs(distToPlane);
            if (options.invertTint) {
                this._aheadTint.set(options.tint.r, options.tint.g, options.tint.b);
                this._behindTint.set(1, 1, 1);
            } else {
                this._aheadTint.set(1, 1, 1);
                this._behindTint.set(options.tint.r, options.tint.g, options.tint.b);
            }
            if (distAbs > edgeDistance) return this._additionalTint.copy(isAhead ? this._aheadTint : this._behindTint);
            const t = distAbs / Math.max(edgeDistance, 0.0001);
            this._edgeTintVec.set(options.edgeTint.r, options.edgeTint.g, options.edgeTint.b);
            if (isAhead) return this._additionalTint.lerpVectors(this._edgeTintVec, this._aheadTint, t);
            return this._additionalTint.lerpVectors(this._behindTint, this._edgeTintVec, t);
        }
        const edgeFactor = 1 - (0, __WEBPACK_EXTERNAL_MODULE__effectUtils_js_6d6f691f__.clamp)(Math.abs(distToPlane) / Math.max(edgeDistance, 0.0001), 0, 1);
        this._tintVec.set(options.tint.r, options.tint.g, options.tint.b);
        this._edgeTintVec.set(options.edgeTint.r, options.edgeTint.g, options.edgeTint.b);
        this._baseTintVec.lerpVectors(this._tintVec, this._edgeTintVec, edgeFactor);
        return this._additionalTint.copy(this._baseTintVec);
    }
    constructor(){
        this._additionalTint = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        this._aheadTint = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        this._behindTint = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        this._edgeTintVec = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        this._tintVec = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
        this._baseTintVec = new __WEBPACK_EXTERNAL_MODULE_three__.Vector3();
    }
}
export { GSplatScanLUTWriter };
