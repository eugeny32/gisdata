import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE__utils_js_d88b7fe1__ from "./utils.js";
class WebGLTexture {
    constructor(gl, texture){
        this.gl = gl;
        this.texture = texture;
        this.id = gl.createTexture();
        this.target = gl.TEXTURE_2D;
        this.version = -1;
        this.update(texture);
    }
    update(_updatetexture) {
        if (!this.texture.image) {
            this.version = this.texture.version;
            return;
        }
        const gl = this.gl;
        const texture = this.texture;
        if (this.version === texture.version) return;
        this.target = gl.TEXTURE_2D;
        gl.bindTexture(this.target, this.id);
        const level = 0;
        const internalFormat = (0, __WEBPACK_EXTERNAL_MODULE__utils_js_d88b7fe1__.paramThreeToGL)(gl, texture.format);
        const width = texture.image.width;
        const height = texture.image.height;
        const border = 0;
        const srcFormat = internalFormat;
        const srcType = (0, __WEBPACK_EXTERNAL_MODULE__utils_js_d88b7fe1__.paramThreeToGL)(gl, texture.type);
        let data;
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, texture.flipY);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultiplyAlpha);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, texture.unpackAlignment);
        if (texture instanceof __WEBPACK_EXTERNAL_MODULE_three__.DataTexture) {
            data = texture.image.data;
            gl.texParameteri(this.target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(this.target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(this.target, gl.TEXTURE_MAG_FILTER, (0, __WEBPACK_EXTERNAL_MODULE__utils_js_d88b7fe1__.paramThreeToGL)(gl, texture.magFilter));
            gl.texParameteri(this.target, gl.TEXTURE_MIN_FILTER, (0, __WEBPACK_EXTERNAL_MODULE__utils_js_d88b7fe1__.paramThreeToGL)(gl, texture.minFilter));
            gl.texImage2D(this.target, level, internalFormat, width, height, border, srcFormat, srcType, data);
        } else if (texture instanceof __WEBPACK_EXTERNAL_MODULE_three__.CanvasTexture || texture instanceof __WEBPACK_EXTERNAL_MODULE_three__.Texture) {
            data = texture.image;
            gl.texParameteri(this.target, gl.TEXTURE_WRAP_S, (0, __WEBPACK_EXTERNAL_MODULE__utils_js_d88b7fe1__.paramThreeToGL)(gl, texture.wrapS));
            gl.texParameteri(this.target, gl.TEXTURE_WRAP_T, (0, __WEBPACK_EXTERNAL_MODULE__utils_js_d88b7fe1__.paramThreeToGL)(gl, texture.wrapT));
            gl.texParameteri(this.target, gl.TEXTURE_MAG_FILTER, (0, __WEBPACK_EXTERNAL_MODULE__utils_js_d88b7fe1__.paramThreeToGL)(gl, texture.magFilter));
            gl.texParameteri(this.target, gl.TEXTURE_MIN_FILTER, (0, __WEBPACK_EXTERNAL_MODULE__utils_js_d88b7fe1__.paramThreeToGL)(gl, texture.minFilter));
            gl.texImage2D(this.target, level, internalFormat, internalFormat, srcType, data);
            if (texture instanceof __WEBPACK_EXTERNAL_MODULE_three__.Texture) gl.generateMipmap(gl.TEXTURE_2D);
        }
        gl.bindTexture(this.target, null);
        this.version = texture.version;
    }
}
export { WebGLTexture };
