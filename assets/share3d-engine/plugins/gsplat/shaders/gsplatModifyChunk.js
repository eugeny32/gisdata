const HOOK_DEFINES = [
    [
        'modifySplatCenter',
        'CUSTOM_MODIFY_SPLAT_CENTER'
    ],
    [
        'modifySplatCovariance',
        'CUSTOM_MODIFY_SPLAT_COVARIANCE'
    ],
    [
        'modifySplatColor',
        'CUSTOM_MODIFY_SPLAT_COLOR'
    ],
    [
        'modifyCenter',
        'CUSTOM_MODIFY_CENTER'
    ],
    [
        'modifyCovariance',
        'CUSTOM_MODIFY_COVARIANCE'
    ],
    [
        'modifyColor',
        'CUSTOM_MODIFY_COLOR'
    ]
];
const PLAYCANVAS_ROTATION_SCALE_HOOK = 'modifySplatRotationScale';
const DEFAULT_GSPLAT_MODIFY_CHUNK = `
// ============================================================
// GSplat Modify - PlayCanvas 风格自定义钩子函数
// 对标 PlayCanvas gsplatModifyVS，保留旧 gsplatCustomizeVS 作为内部兼容入口。
// ============================================================

// 外部特效优先实现 modifySplat* 函数。旧 modify* 函数作为兼容别名保留。

#ifndef CUSTOM_MODIFY_SPLAT_CENTER
// 修改中心位置钩子
// 用法示例：center.y += 1.0; // 上移 1 单位
void modifySplatCenter(inout vec3 center) {
  #ifdef CUSTOM_MODIFY_CENTER
    modifyCenter(center);
  #endif
  // 默认不修改
}
#endif

#ifndef CUSTOM_MODIFY_SPLAT_COVARIANCE
// 修改协方差钩子，对应 PlayCanvas modifySplatRotationScale 的 Share3DEngine 版本。
// 参数：originalCenter - 原始中心位置
//       modifiedCenter - 经过 modifySplatCenter 修改后的中心位置
//       covA, covB - 协方差矩阵上三角元素
// 用法示例：
//   gsplatApplyUniformScale(covA, covB, 2.0);  // 半径放大 2 倍，covariance 内部按 4 倍缩放
//   float size = gsplatExtractSize(covA, covB);
//   gsplatMakeRound(covA, covB, size * 0.5);   // 变成圆形 splat
//   gsplatMakeRound(covA, covB, 0.0);          // 隐藏 splat
void modifySplatCovariance(vec3 originalCenter, vec3 modifiedCenter, inout vec3 covA, inout vec3 covB) {
  #ifdef CUSTOM_MODIFY_COVARIANCE
    modifyCovariance(originalCenter, modifiedCenter, covA, covB);
  #endif
  // 默认不修改
}
#endif

#ifndef CUSTOM_MODIFY_SPLAT_COLOR
// 修改颜色钩子
// 参数：center - 当前 splat 中心位置
//       color - RGBA 颜色（xyz=RGB，w=透明度）
// 用法示例：color.rgb *= 0.5; // 变暗
void modifySplatColor(vec3 center, inout vec4 color) {
  #ifdef CUSTOM_MODIFY_COLOR
    modifyColor(center, color);
  #endif
  // 默认不修改
}
#endif

#ifndef CUSTOM_MODIFY_CENTER
void modifyCenter(inout vec3 center) {
  modifySplatCenter(center);
}
#endif

#ifndef CUSTOM_MODIFY_COVARIANCE
void modifyCovariance(vec3 originalCenter, vec3 modifiedCenter, inout vec3 covA, inout vec3 covB) {
  modifySplatCovariance(originalCenter, modifiedCenter, covA, covB);
}
#endif

#ifndef CUSTOM_MODIFY_COLOR
void modifyColor(vec3 center, inout vec4 color) {
  modifySplatColor(center, color);
}
#endif
`;
function definesFunction(source, name) {
    return new RegExp(`\\bvoid\\s+${name}\\s*\\(`).test(source);
}
function extractFunction(source, name) {
    const match = new RegExp(`\\bvoid\\s+${name}\\s*\\(`).exec(source);
    if (!match) return null;
    const start = match.index;
    const bodyStart = source.indexOf('{', match.index);
    if (bodyStart < 0) return null;
    let depth = 0;
    let inLineComment = false;
    let inBlockComment = false;
    for(let i = bodyStart; i < source.length; i++){
        const char = source[i];
        const next = source[i + 1];
        if (inLineComment) {
            if ('\n' === char || '\r' === char) inLineComment = false;
            continue;
        }
        if (inBlockComment) {
            if ('*' === char && '/' === next) {
                inBlockComment = false;
                i++;
            }
            continue;
        }
        if ('/' === char && '/' === next) {
            inLineComment = true;
            i++;
            continue;
        }
        if ('/' === char && '*' === next) {
            inBlockComment = true;
            i++;
            continue;
        }
        if ('{' === char) depth++;
        else if ('}' === char) {
            depth--;
            if (0 === depth) return source.slice(start, i + 1);
        }
    }
    return null;
}
function assertNoUnsupportedPlayCanvasHooks(source) {
    if (!definesFunction(source, PLAYCANVAS_ROTATION_SCALE_HOOK)) return;
    throw new Error('[GSplatModifyChunk] Unsupported PlayCanvas hook "modifySplatRotationScale". Share3DEngine uses covariance hooks; port the shader to modifySplatCovariance(originalCenter, modifiedCenter, covA, covB).');
}
function createGSplatModifyChunk(customCode) {
    const source = customCode?.trim();
    if (!source) return DEFAULT_GSPLAT_MODIFY_CHUNK;
    assertNoUnsupportedPlayCanvasHooks(source);
    const defines = HOOK_DEFINES.filter(([functionName])=>definesFunction(source, functionName)).map(([, defineName])=>`#define ${defineName} 1`);
    return `${defines.join('\n')}\n${source}\n${DEFAULT_GSPLAT_MODIFY_CHUNK}`;
}
function createGSplatCovarianceOnlyModifyChunk(customCode) {
    const source = customCode?.trim();
    if (!source) return DEFAULT_GSPLAT_MODIFY_CHUNK;
    assertNoUnsupportedPlayCanvasHooks(source);
    const centerNoop = 'void modifySplatCenter(inout vec3 center) {}\n';
    const legacyCenterNoop = 'void modifyCenter(inout vec3 center) {}\n';
    const colorNoop = 'void modifySplatColor(vec3 center, inout vec4 color) {}\n';
    const legacyColorNoop = 'void modifyColor(vec3 center, inout vec4 color) {}\n';
    let patched = source;
    const centerMatch = extractFunction(patched, 'modifySplatCenter');
    if (centerMatch) patched = patched.replace(centerMatch, centerNoop);
    const legacyCenterMatch = extractFunction(patched, 'modifyCenter');
    if (legacyCenterMatch) patched = patched.replace(legacyCenterMatch, legacyCenterNoop);
    const colorMatch = extractFunction(patched, 'modifySplatColor');
    if (colorMatch) patched = patched.replace(colorMatch, colorNoop);
    const legacyColorMatch = extractFunction(patched, 'modifyColor');
    if (legacyColorMatch) patched = patched.replace(legacyColorMatch, legacyColorNoop);
    const defines = HOOK_DEFINES.filter(([functionName])=>definesFunction(patched, functionName)).map(([, defineName])=>`#define ${defineName} 1`);
    return `${defines.join('\n')}\n${patched}\n${DEFAULT_GSPLAT_MODIFY_CHUNK}`;
}
export { DEFAULT_GSPLAT_MODIFY_CHUNK, createGSplatCovarianceOnlyModifyChunk, createGSplatModifyChunk };
