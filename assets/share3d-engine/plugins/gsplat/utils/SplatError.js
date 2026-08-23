var SplatError_rslib_entry_SplatErrorCode = /*#__PURE__*/ function(SplatErrorCode) {
    SplatErrorCode["INVALID_PLY_HEADER"] = "INVALID_PLY_HEADER";
    SplatErrorCode["MISSING_PROPERTY"] = "MISSING_PROPERTY";
    SplatErrorCode["INVALID_BINARY_DATA"] = "INVALID_BINARY_DATA";
    SplatErrorCode["UNSUPPORTED_FORMAT"] = "UNSUPPORTED_FORMAT";
    SplatErrorCode["TEXTURE_SIZE_EXCEEDED"] = "TEXTURE_SIZE_EXCEEDED";
    SplatErrorCode["OUT_OF_MEMORY"] = "OUT_OF_MEMORY";
    SplatErrorCode["WORKER_ERROR"] = "WORKER_ERROR";
    SplatErrorCode["WEBGL_NOT_SUPPORTED"] = "WEBGL_NOT_SUPPORTED";
    SplatErrorCode["SHADER_COMPILE_ERROR"] = "SHADER_COMPILE_ERROR";
    SplatErrorCode["FLOAT_TEXTURE_NOT_SUPPORTED"] = "FLOAT_TEXTURE_NOT_SUPPORTED";
    return SplatErrorCode;
}({});
class SplatError extends Error {
    constructor(code, message, details){
        super(`[ThreeGS:${code}] ${message}`);
        this.name = 'SplatError';
        this.code = code;
        this.details = details;
        Object.setPrototypeOf(this, SplatError.prototype);
    }
    toJSON() {
        return {
            name: this.name,
            code: this.code,
            message: this.message,
            details: this.details,
            stack: this.stack
        };
    }
}
export { SplatError, SplatError_rslib_entry_SplatErrorCode as SplatErrorCode };
