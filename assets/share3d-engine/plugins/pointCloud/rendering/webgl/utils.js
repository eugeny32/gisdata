import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
function paramThreeToGL(_gl, p) {
    let extension;
    const extensions = {
        get: (ext)=>_gl.getExtension(ext)
    };
    if (p === __WEBPACK_EXTERNAL_MODULE_three__.RepeatWrapping) return _gl.REPEAT;
    if (p === __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping) return _gl.CLAMP_TO_EDGE;
    if (p === __WEBPACK_EXTERNAL_MODULE_three__.MirroredRepeatWrapping) return _gl.MIRRORED_REPEAT;
    if (p === __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter) return _gl.NEAREST;
    if (p === __WEBPACK_EXTERNAL_MODULE_three__.NearestMipMapNearestFilter) return _gl.NEAREST_MIPMAP_NEAREST;
    if (p === __WEBPACK_EXTERNAL_MODULE_three__.NearestMipMapLinearFilter) return _gl.NEAREST_MIPMAP_LINEAR;
    if (p === __WEBPACK_EXTERNAL_MODULE_three__.LinearFilter) return _gl.LINEAR;
    if (p === __WEBPACK_EXTERNAL_MODULE_three__.LinearMipMapNearestFilter) return _gl.LINEAR_MIPMAP_NEAREST;
    if (p === __WEBPACK_EXTERNAL_MODULE_three__.LinearMipMapLinearFilter) return _gl.LINEAR_MIPMAP_LINEAR;
    if (p === __WEBPACK_EXTERNAL_MODULE_three__.UnsignedByteType) return _gl.UNSIGNED_BYTE;
    if (p === __WEBPACK_EXTERNAL_MODULE_three__.UnsignedShort4444Type) return _gl.UNSIGNED_SHORT_4_4_4_4;
    if (p === __WEBPACK_EXTERNAL_MODULE_three__.UnsignedShort5551Type) return _gl.UNSIGNED_SHORT_5_5_5_1;
    if (p === __WEBPACK_EXTERNAL_MODULE_three__.ByteType) return _gl.BYTE;
    if (p === __WEBPACK_EXTERNAL_MODULE_three__.ShortType) return _gl.SHORT;
    if (p === __WEBPACK_EXTERNAL_MODULE_three__.UnsignedShortType) return _gl.UNSIGNED_SHORT;
    if (p === __WEBPACK_EXTERNAL_MODULE_three__.IntType) return _gl.INT;
    if (p === __WEBPACK_EXTERNAL_MODULE_three__.UnsignedIntType) return _gl.UNSIGNED_INT;
    if (p === __WEBPACK_EXTERNAL_MODULE_three__.FloatType) return _gl.FLOAT;
    if (p === __WEBPACK_EXTERNAL_MODULE_three__.HalfFloatType) {
        extension = extensions.get('OES_texture_half_float');
        if (null !== extension) return extension.HALF_FLOAT_OES;
    }
    if (p === __WEBPACK_EXTERNAL_MODULE_three__.AlphaFormat) return _gl.ALPHA;
    if (p === __WEBPACK_EXTERNAL_MODULE_three__.RGBAFormat) return _gl.RGBA;
    if (p === __WEBPACK_EXTERNAL_MODULE_three__.RedFormat) return _gl.LUMINANCE;
    if (p === __WEBPACK_EXTERNAL_MODULE_three__.RGFormat) return _gl.LUMINANCE_ALPHA;
    if (p === __WEBPACK_EXTERNAL_MODULE_three__.DepthFormat) return _gl.DEPTH_COMPONENT;
    if (p === __WEBPACK_EXTERNAL_MODULE_three__.DepthStencilFormat) return _gl.DEPTH_STENCIL;
    if (p === __WEBPACK_EXTERNAL_MODULE_three__.AddEquation) return _gl.FUNC_ADD;
    if (p === __WEBPACK_EXTERNAL_MODULE_three__.SubtractEquation) return _gl.FUNC_SUBTRACT;
    if (p === __WEBPACK_EXTERNAL_MODULE_three__.ReverseSubtractEquation) return _gl.FUNC_REVERSE_SUBTRACT;
    if (p === __WEBPACK_EXTERNAL_MODULE_three__.ZeroFactor) return _gl.ZERO;
    if (p === __WEBPACK_EXTERNAL_MODULE_three__.OneFactor) return _gl.ONE;
    if (p === __WEBPACK_EXTERNAL_MODULE_three__.SrcColorFactor) return _gl.SRC_COLOR;
    if (p === __WEBPACK_EXTERNAL_MODULE_three__.OneMinusSrcColorFactor) return _gl.ONE_MINUS_SRC_COLOR;
    if (p === __WEBPACK_EXTERNAL_MODULE_three__.SrcAlphaFactor) return _gl.SRC_ALPHA;
    if (p === __WEBPACK_EXTERNAL_MODULE_three__.OneMinusSrcAlphaFactor) return _gl.ONE_MINUS_SRC_ALPHA;
    if (p === __WEBPACK_EXTERNAL_MODULE_three__.DstAlphaFactor) return _gl.DST_ALPHA;
    if (p === __WEBPACK_EXTERNAL_MODULE_three__.OneMinusDstAlphaFactor) return _gl.ONE_MINUS_DST_ALPHA;
    if (p === __WEBPACK_EXTERNAL_MODULE_three__.DstColorFactor) return _gl.DST_COLOR;
    if (p === __WEBPACK_EXTERNAL_MODULE_three__.OneMinusDstColorFactor) return _gl.ONE_MINUS_DST_COLOR;
    if (p === __WEBPACK_EXTERNAL_MODULE_three__.SrcAlphaSaturateFactor) return _gl.SRC_ALPHA_SATURATE;
    if (p === __WEBPACK_EXTERNAL_MODULE_three__.RGB_S3TC_DXT1_Format || p === __WEBPACK_EXTERNAL_MODULE_three__.RGBA_S3TC_DXT1_Format || p === __WEBPACK_EXTERNAL_MODULE_three__.RGBA_S3TC_DXT3_Format || p === __WEBPACK_EXTERNAL_MODULE_three__.RGBA_S3TC_DXT5_Format) {
        extension = extensions.get('WEBGL_compressed_texture_s3tc');
        if (null !== extension) {
            if (p === __WEBPACK_EXTERNAL_MODULE_three__.RGB_S3TC_DXT1_Format) return extension.COMPRESSED_RGB_S3TC_DXT1_EXT;
            if (p === __WEBPACK_EXTERNAL_MODULE_three__.RGBA_S3TC_DXT1_Format) return extension.COMPRESSED_RGBA_S3TC_DXT1_EXT;
            if (p === __WEBPACK_EXTERNAL_MODULE_three__.RGBA_S3TC_DXT3_Format) return extension.COMPRESSED_RGBA_S3TC_DXT3_EXT;
            if (p === __WEBPACK_EXTERNAL_MODULE_three__.RGBA_S3TC_DXT5_Format) return extension.COMPRESSED_RGBA_S3TC_DXT5_EXT;
        }
    }
    if (p === __WEBPACK_EXTERNAL_MODULE_three__.RGB_PVRTC_4BPPV1_Format || p === __WEBPACK_EXTERNAL_MODULE_three__.RGB_PVRTC_2BPPV1_Format || p === __WEBPACK_EXTERNAL_MODULE_three__.RGBA_PVRTC_4BPPV1_Format || p === __WEBPACK_EXTERNAL_MODULE_three__.RGBA_PVRTC_2BPPV1_Format) {
        extension = extensions.get('WEBGL_compressed_texture_pvrtc');
        if (null !== extension) {
            if (p === __WEBPACK_EXTERNAL_MODULE_three__.RGB_PVRTC_4BPPV1_Format) return extension.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
            if (p === __WEBPACK_EXTERNAL_MODULE_three__.RGB_PVRTC_2BPPV1_Format) return extension.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
            if (p === __WEBPACK_EXTERNAL_MODULE_three__.RGBA_PVRTC_4BPPV1_Format) return extension.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
            if (p === __WEBPACK_EXTERNAL_MODULE_three__.RGBA_PVRTC_2BPPV1_Format) return extension.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
        }
    }
    if (p === __WEBPACK_EXTERNAL_MODULE_three__.RGB_ETC1_Format) {
        extension = extensions.get('WEBGL_compressed_texture_etc1');
        if (null !== extension) return extension.COMPRESSED_RGB_ETC1_WEBGL;
    }
    if (p === __WEBPACK_EXTERNAL_MODULE_three__.MinEquation || p === __WEBPACK_EXTERNAL_MODULE_three__.MaxEquation) {
        extension = extensions.get('EXT_blend_minmax');
        if (null !== extension) {
            if (p === __WEBPACK_EXTERNAL_MODULE_three__.MinEquation) return extension.MIN_EXT;
            if (p === __WEBPACK_EXTERNAL_MODULE_three__.MaxEquation) return extension.MAX_EXT;
        }
    }
    if (p === __WEBPACK_EXTERNAL_MODULE_three__.UnsignedInt248Type) {
        extension = extensions.get('WEBGL_depth_texture');
        if (null !== extension) return extension.UNSIGNED_INT_24_8_WEBGL;
    }
    return 0;
}
const attributeLocations = {
    position: {
        name: 'position',
        location: 0
    },
    color: {
        name: 'color',
        location: 1
    },
    rgba: {
        name: 'color',
        location: 1
    },
    intensity: {
        name: 'intensity',
        location: 2
    },
    classification: {
        name: 'classification',
        location: 3
    },
    returnNumber: {
        name: 'returnNumber',
        location: 4
    },
    'return number': {
        name: 'returnNumber',
        location: 4
    },
    returns: {
        name: 'returnNumber',
        location: 4
    },
    numberOfReturns: {
        name: 'numberOfReturns',
        location: 5
    },
    'number of returns': {
        name: 'numberOfReturns',
        location: 5
    },
    pointSourceID: {
        name: 'pointSourceID',
        location: 6
    },
    'source id': {
        name: 'pointSourceID',
        location: 6
    },
    'point source id': {
        name: 'pointSourceID',
        location: 6
    },
    indices: {
        name: 'indices',
        location: 7
    },
    normal: {
        name: 'normal',
        location: 8
    },
    spacing: {
        name: 'spacing',
        location: 9
    },
    'gps-time': {
        name: 'gpsTime',
        location: 10
    },
    aExtra: {
        name: 'aExtra',
        location: 11
    }
};
export { attributeLocations, paramThreeToGL };
