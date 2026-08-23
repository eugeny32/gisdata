const gsplatCommon_glsl_rslib_entry_ = `// ============================================================
// GSplat Common - 公共 chunks 入口
// 对标 PlayCanvas gsplatCommon.js
// ============================================================
//
// 这个文件作为顶点着色器的入口点，包含所有必要的依赖
// 使用 #include 指令按正确的依赖顺序引入各个模块

// 基础结构和辅助函数（无依赖）
#include "gsplatStructsVS"
#include "gsplatQuatToMat3VS"
#include "gsplatHelpersVS"
#include "gsplatModifyVS"

// 输出处理
#include "gsplatOutputVS"

// 数据源初始化
#include "gsplatSourceVS"

// 根据格式选择数据读取方式
#include "gsplatSourceFormatVS"

// SH 评估（如果启用）
#include "gsplatEvalSHVS"

// 核心变换
#include "gsplatCenterVS"
#include "gsplatCornerVS"
`;
export { gsplatCommon_glsl_rslib_entry_ as default };
