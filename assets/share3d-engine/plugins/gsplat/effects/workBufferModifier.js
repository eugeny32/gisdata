function hashGSplatWorkBufferModifierCode(code) {
    let hash = 0x811c9dc5;
    for(let i = 0; i < code.length; i++){
        hash ^= code.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
}
function compileGSplatWorkBufferModifier(modifier) {
    if (!modifier) return null;
    return {
        code: modifier.glsl,
        hash: hashGSplatWorkBufferModifierCode(modifier.glsl)
    };
}
export { compileGSplatWorkBufferModifier, hashGSplatWorkBufferModifierCode };
