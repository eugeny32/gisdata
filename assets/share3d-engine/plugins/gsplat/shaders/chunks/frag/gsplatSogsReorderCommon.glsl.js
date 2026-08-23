const gsplatSogsReorderCommon_glsl_rslib_entry_ = `// ============================================================
// GSplat SOGS Reorder Common - SOGS 重排共享辅助函数
// ============================================================

#ifdef REORDER_V1
float sigmoid(float x) { return 1.0 / (1.0 + exp(-x)); }
vec3 vmin(vec3 v) { return vec3(min(min(v.x, v.y), v.z)); }
vec3 vmax(vec3 v) { return vec3(max(max(v.x, v.y), v.z)); }
vec3 resolve(vec3 m, vec3 M, vec3 v) {
  return (mix(m, M, v) - vmin(m)) / (vmax(M) - vmin(m));
}
#endif
`;
export { gsplatSogsReorderCommon_glsl_rslib_entry_ as default };
