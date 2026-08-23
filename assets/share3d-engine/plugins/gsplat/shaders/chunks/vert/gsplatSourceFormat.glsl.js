const gsplatSourceFormat_glsl_rslib_entry_ = `// ============================================================
// GSplat Source Format - 数据格式选择器
// 对标 PlayCanvas gsplatSourceFormat.js
// ============================================================
//
// 根据 defines 动态选择数据读取方式
// 支持的格式：
// - GSPLAT_WORKBUFFER_DATA: WorkBuffer 预计算格式
// - GSPLAT_COMPRESSED_DATA: 压缩格式（预留）
// - GSPLAT_SOGS_DATA: SOGS 压缩格式
// - 默认: 标准 PLY 格式

#if defined(GSPLAT_WORKBUFFER_DATA)
  // WorkBuffer 预计算数据
  #include "gsplatWorkBufferVS"
  #if defined(SH_BANDS) && SH_BANDS > 0
    // WorkBuffer 仍需读取 SH 纹理（统一排序后仍使用 SH）
    #include "gsplatSHVS"
  #endif
#elif defined(GSPLAT_COMPRESSED_DATA)
  // 压缩数据格式
  #include "gsplatCompressedDataVS"
  #if defined(SH_BANDS) && SH_BANDS > 0
    #include "gsplatCompressedSHVS"
  #endif
#elif defined(GSPLAT_SOGS_DATA)
  // SOGS 格式
  #include "gsplatSogsDataVS"
  #include "gsplatSogsColorVS"
  #if defined(SH_BANDS) && SH_BANDS > 0
    #include "gsplatSogsSHVS"
  #endif
#else
  // 标准 PLY 格式
  #include "gsplatDataVS"
  #include "gsplatColorVS"
  #if defined(SH_BANDS) && SH_BANDS > 0
    #include "gsplatSHVS"
  #endif
#endif
`;
export { gsplatSourceFormat_glsl_rslib_entry_ as default };
