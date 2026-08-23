import * as __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__ from "../model/common/constant.js";
function getEntityTypeName(type) {
    return String(type);
}
function collectCadEntityStats(entities) {
    const counts = new Map();
    let textLike = 0;
    let mText = 0;
    let dimension = 0;
    let angularDimension = 0;
    let mLeader = 0;
    let hatch = 0;
    for (const entity of entities){
        const typeName = getEntityTypeName(entity.type);
        counts.set(typeName, (counts.get(typeName) ?? 0) + 1);
        if (entity.type === __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.MText) {
            mText += 1;
            textLike += 1;
        } else if (entity.type === __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.AlignDimension) {
            dimension += 1;
            textLike += 1;
        } else if (entity.type === __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.AngularDimension) {
            angularDimension += 1;
            textLike += 1;
        } else if (entity.type === __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.MLeader) {
            mLeader += 1;
            textLike += 1;
        } else if (entity.type === __WEBPACK_EXTERNAL_MODULE__model_common_constant_js_7fe1104a__.EntityType.Hatch) hatch += 1;
    }
    const typeSummary = Array.from(counts.entries()).sort((a, b)=>b[1] - a[1]).slice(0, 8).map(([type, count])=>`${type}:${count}`).join('|');
    return {
        total: entities.length,
        textLike,
        mText,
        dimension,
        angularDimension,
        mLeader,
        hatch,
        typeSummary
    };
}
function formatCadEntityStats(stats) {
    return `total=${stats.total}, textLike=${stats.textLike}, mText=${stats.mText}, dimension=${stats.dimension}, angularDimension=${stats.angularDimension}, mLeader=${stats.mLeader}, hatch=${stats.hatch}, types=${stats.typeSummary}`;
}
function shouldLogCadEntityStats(stats) {
    return stats.total >= 50 || stats.textLike > 0 || stats.hatch >= 10;
}
export { collectCadEntityStats, formatCadEntityStats, shouldLogCadEntityStats };
