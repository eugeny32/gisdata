import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__blue_noise_js_f5e4e33d__ from "./blue-noise.js";
let globalTexture = null;
const textureCache = new WeakMap();
function createBlueNoiseTexture() {
    const data = (0, __WEBPACK_EXTERNAL_MODULE__blue_noise_js_f5e4e33d__.blueNoiseData)();
    const texture = new __WEBPACK_EXTERNAL_MODULE_three__.DataTexture(data, __WEBPACK_EXTERNAL_MODULE__blue_noise_js_f5e4e33d__.BLUE_NOISE_SIZE, __WEBPACK_EXTERNAL_MODULE__blue_noise_js_f5e4e33d__.BLUE_NOISE_SIZE, __WEBPACK_EXTERNAL_MODULE_three__.RGBAFormat, __WEBPACK_EXTERNAL_MODULE_three__.UnsignedByteType);
    texture.name = 'BlueNoise32';
    texture.wrapS = __WEBPACK_EXTERNAL_MODULE_three__.RepeatWrapping;
    texture.wrapT = __WEBPACK_EXTERNAL_MODULE_three__.RepeatWrapping;
    texture.minFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
    texture.magFilter = __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
    return texture;
}
function getBlueNoiseTexture(renderer) {
    if (renderer) {
        let texture = textureCache.get(renderer);
        if (!texture) {
            texture = createBlueNoiseTexture();
            textureCache.set(renderer, texture);
        }
        return texture;
    }
    if (!globalTexture) globalTexture = createBlueNoiseTexture();
    return globalTexture;
}
function disposeBlueNoiseTexture(renderer) {
    if (renderer) {
        const texture = textureCache.get(renderer);
        if (texture) {
            texture.dispose();
            textureCache.delete(renderer);
        }
    } else if (globalTexture) {
        globalTexture.dispose();
        globalTexture = null;
    }
}
export { createBlueNoiseTexture, disposeBlueNoiseTexture, getBlueNoiseTexture };
