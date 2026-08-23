class SplatValidator {
    static validatePlyHeader(header) {
        const errors = [];
        const warnings = [];
        if (!header.startsWith('ply')) errors.push('文件不是有效的PLY格式：缺少 "ply" 签名');
        if (!header.includes('format binary_little_endian')) {
            if (header.includes('format ascii')) errors.push('不支持ASCII格式PLY，请使用binary_little_endian格式');
            else if (header.includes('format binary_big_endian')) errors.push('不支持big_endian格式，请使用binary_little_endian格式');
        }
        const requiredProps = [
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
            'opacity'
        ];
        for (const prop of requiredProps)if (!header.includes(`property float ${prop}`) && !header.includes(`property double ${prop}`)) errors.push(`缺少必需属性: ${prop}`);
        const match = header.match(/element vertex (\d+)/);
        if (match) {
            const count = parseInt(match[1], 10);
            if (count > 10000000) warnings.push(`splat数量过多(${count.toLocaleString()})，可能导致内存不足`);
            if (0 === count) errors.push('splat数量为0');
        } else errors.push('无法解析splat数量');
        if (!header.includes('f_dc_0')) warnings.push('缺少颜色属性f_dc_0，将使用默认颜色');
        return {
            valid: 0 === errors.length,
            errors,
            warnings
        };
    }
    static validateSplatData(data) {
        const errors = [];
        const warnings = [];
        if (0 === data.numSplats) {
            errors.push('SplatData为空');
            return {
                valid: false,
                errors,
                warnings
            };
        }
        const x = data.getProp('x');
        const y = data.getProp('y');
        const z = data.getProp('z');
        if (x && y && z) {
            let invalidCount = 0;
            for(let i = 0; i < data.numSplats; i++)if (!Number.isFinite(x[i]) || !Number.isFinite(y[i]) || !Number.isFinite(z[i])) invalidCount++;
            if (invalidCount > 0) warnings.push(`发现${invalidCount}个位置包含NaN或Infinity值`);
        } else errors.push('缺少位置数据(x, y, z)');
        const rot0 = data.getProp('rot_0');
        const rot1 = data.getProp('rot_1');
        const rot2 = data.getProp('rot_2');
        const rot3 = data.getProp('rot_3');
        if (rot0 && rot1 && rot2 && rot3) {
            let unnormalizedCount = 0;
            for(let i = 0; i < data.numSplats; i++){
                const len = Math.sqrt(rot0[i] ** 2 + rot1[i] ** 2 + rot2[i] ** 2 + rot3[i] ** 2);
                if (Math.abs(len - 1.0) > 0.01) unnormalizedCount++;
            }
            if (unnormalizedCount > 0) warnings.push(`${unnormalizedCount}个四元数未归一化，建议启用normalizeQuaternions选项`);
        }
        const opacity = data.getProp('opacity');
        if (opacity) {
            let lowAlphaCount = 0;
            for(let i = 0; i < data.numSplats; i++)if (opacity[i] < -4.6) lowAlphaCount++;
            if (lowAlphaCount > 0.1 * data.numSplats) warnings.push(`${lowAlphaCount}个splat(${(lowAlphaCount / data.numSplats * 100).toFixed(1)}%)的透明度很低，建议启用alphaRemovalThreshold过滤`);
        }
        return {
            valid: 0 === errors.length,
            errors,
            warnings
        };
    }
    static checkWebGLCapabilities(renderer) {
        const errors = [];
        const warnings = [];
        const gl = renderer.getContext();
        const isWebGL2 = gl instanceof WebGL2RenderingContext;
        if (!isWebGL2) warnings.push('WebGL2不可用，部分功能可能受限');
        if (!isWebGL2) {
            const floatTextureExt = gl.getExtension('OES_texture_float');
            if (!floatTextureExt) errors.push('不支持浮点纹理，无法渲染3DGS');
        }
        const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        if (maxTextureSize < 4096) warnings.push(`最大纹理尺寸为${maxTextureSize}，可能限制splat数量`);
        return {
            valid: 0 === errors.length,
            errors,
            warnings
        };
    }
    static estimateMemoryRequirements(numSplats) {
        const cpuBytesPerSplat = 60;
        const cpuMemoryMB = numSplats * cpuBytesPerSplat / 1048576;
        const gpuBytesPerSplat = 56;
        const gpuMemoryMB = numSplats * gpuBytesPerSplat / 1048576;
        const recommended = cpuMemoryMB < 500 && gpuMemoryMB < 1000;
        return {
            cpuMemoryMB: Math.round(10 * cpuMemoryMB) / 10,
            gpuMemoryMB: Math.round(10 * gpuMemoryMB) / 10,
            recommended
        };
    }
}
export { SplatValidator };
