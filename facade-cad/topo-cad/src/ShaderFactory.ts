/**
 * ShaderFactory — GPU materials for the heavy point cloud.
 *
 * The cloud is NEVER filtered on the CPU per frame. Two clip stages run in
 * the vertex shader from uniforms only:
 *
 *   1. Area isolation — an even-odd point-in-polygon test against the
 *      top-down lasso fence (world XZ), uploaded as a vec2 uniform array.
 *   2. Section slab — an axis-aligned box test in UCS-local space
 *      (`uUcsInv * worldPos`), enabled per-viewport by the Engine: the
 *      cross-section is thin in X (station), the longitudinal one thin in
 *      Y (offset), and the plan can clip a slab in Z (срез по высоте).
 *
 * Culled vertices are collapsed outside clip space (zero rasterization
 * cost) and `discard`-ed in the fragment stage as a safety net, so updating
 * the lasso or dragging the section slider costs one uniform upload — the
 * 400k-point buffer itself is immutable.
 */
import * as THREE from 'three';

export const MAX_LASSO_VERTS = 64;

export interface CloudUniforms {
  uSize: THREE.IUniform<number>;
  uIsPersp: THREE.IUniform<number>;
  uUcsInv: THREE.IUniform<THREE.Matrix4>;
  uSectionEnabled: THREE.IUniform<number>;
  uBoxMin: THREE.IUniform<THREE.Vector3>;
  uBoxMax: THREE.IUniform<THREE.Vector3>;
  /** Height slice (plan viewport): local-Z slab clip. */
  uSliceClip: THREE.IUniform<number>;
  uSliceMin: THREE.IUniform<number>;
  uSliceMax: THREE.IUniform<number>;
  /** 3D viewport economy: square window of cloud around the cursor. */
  uCurClip: THREE.IUniform<number>;
  uCurPos: THREE.IUniform<THREE.Vector3>;
  uCurHalf: THREE.IUniform<number>;
  uOpacity: THREE.IUniform<number>;
  uDensity: THREE.IUniform<number>;
  uMode: THREE.IUniform<number>;
  uMinY: THREE.IUniform<number>;
  uYRangeInv: THREE.IUniform<number>;
}

const VERTEX = /* glsl */ `
  uniform float uSize;
  uniform float uIsPersp;
  uniform mat4  uUcsInv;
  uniform float uSectionEnabled;
  uniform vec3  uBoxMin;
  uniform vec3  uBoxMax;
  uniform float uSliceClip;
  uniform float uSliceMin;
  uniform float uSliceMax;
  uniform float uCurClip;
  uniform vec3  uCurPos;
  uniform float uCurHalf;
  uniform float uDensity;  // 0..1 — keep points whose key falls below it
  uniform float uMode;     // 0 = RGB, 1 = intensity (grayscale), 2 = height ramp
  uniform float uMinY;
  uniform float uYRangeInv;

  attribute vec3  aColor;
  attribute float aKey;    // stable per-point random in [0,1) — see Engine

  varying vec3  vColor;
  varying float vKill;

  void main() {
    // Thinning is a KEY test, not a buffer prefix: drawRange now carries the
    // spatial tile range, so decimation has to be order-independent.
    vKill = aKey < uDensity ? 0.0 : 1.0;

    vec4 wp = modelMatrix * vec4(position, 1.0);

    vec3 col = aColor;
    if (uMode > 1.5) {
      float t = clamp((wp.y - uMinY) * uYRangeInv, 0.0, 1.0);
      if (t < 0.5) col = mix(vec3(0.15, 0.35, 0.9), vec3(0.2, 0.85, 0.4), t * 2.0);
      else col = mix(vec3(0.2, 0.85, 0.4), vec3(0.95, 0.35, 0.2), t * 2.0 - 1.0);
    } else if (uMode > 0.5) {
      col = vec3(dot(aColor, vec3(0.299, 0.587, 0.114)));
    }
    vColor = col;


    if ((uSectionEnabled > 0.5 || uSliceClip > 0.5 || uCurClip > 0.5) && vKill < 0.5) {
      vec3 lp = (uUcsInv * wp).xyz;
      if (uSectionEnabled > 0.5 && (any(lessThan(lp, uBoxMin)) || any(greaterThan(lp, uBoxMax)))) vKill = 1.0;
      // Height slice in plan: keep only the slab at the chosen elevation —
      // the ground shows through vegetation and snapping targets it.
      if (uSliceClip > 0.5 && (lp.z < uSliceMin || lp.z > uSliceMax)) vKill = 1.0;
      // Economical 3D view: show the cloud only in a box around the cursor.
      if (uCurClip > 0.5 && (abs(lp.x - uCurPos.x) > uCurHalf || abs(lp.y - uCurPos.y) > uCurHalf)) vKill = 1.0;
    }

    vec4 mv = viewMatrix * wp;
    gl_Position = projectionMatrix * mv;

    // Perspective: mild distance attenuation only (0.5×..1.5×), so the
    // per-viewport size slider stays in charge.
    float size = uSize;
    if (uIsPersp > 0.5) size *= clamp(120.0 / max(1.0, -mv.z), 0.5, 1.5);
    gl_PointSize = clamp(size, 0.5, 8.0);

    // Collapse culled points outside clip space: rejected before
    // rasterization, so per-frame clipping is effectively free.
    if (vKill > 0.5) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  precision highp float;

  uniform float uOpacity;

  varying vec3  vColor;
  varying float vKill;

  void main() {
    if (vKill > 0.5) discard;               // clip-box / lasso safety net
    vec2 c = gl_PointCoord - 0.5;
    if (dot(c, c) > 0.25) discard;          // round sprites
    gl_FragColor = vec4(vColor, uOpacity);
  }
`;

export function createPointCloudMaterial(): { material: THREE.ShaderMaterial; uniforms: CloudUniforms } {
  const uniforms: CloudUniforms = {
    uSize: { value: 2.0 },
    uIsPersp: { value: 0 },
    uUcsInv: { value: new THREE.Matrix4() },
    uSectionEnabled: { value: 0 },
    uBoxMin: { value: new THREE.Vector3(-1e6, -1e6, -1e6) },
    uBoxMax: { value: new THREE.Vector3(1e6, 1e6, 1e6) },
    uSliceClip: { value: 0 },
    uSliceMin: { value: -1e6 },
    uSliceMax: { value: 1e6 },
    uCurClip: { value: 0 },
    uCurPos: { value: new THREE.Vector3() },
    uCurHalf: { value: 20 }, // 40 × 40 m window around the cursor
    uOpacity: { value: 1 },
    uDensity: { value: 1 },
    uMode: { value: 0 },
    uMinY: { value: 0 },
    uYRangeInv: { value: 1 },
  };

  const material = new THREE.ShaderMaterial({
    uniforms: uniforms as unknown as { [uniform: string]: THREE.IUniform },
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    transparent: true, // per-viewport opacity is a uniform flip
  });

  return { material, uniforms };
}

/** CPU twin of the shader lasso test — used ONCE per lasso application to
 *  build the snapping/picking index, never per frame.
 *
 *  Flat arrays, not Vector2[]: this runs over every point in the scan, so
 *  the per-vertex property loads and the O(verts) edge walk were the whole
 *  cost. Callers bbox-reject first (see Engine.applyLasso) — that alone
 *  throws away most of the cloud with two compares. */
export function pointInPolyFlat(x: number, z: number, px: Float32Array, pz: Float32Array, count: number): boolean {
  let inside = false;
  for (let i = 0, j = count - 1; i < count; j = i++) {
    const az = pz[i];
    const bz = pz[j];
    if (az > z !== bz > z && x < ((px[j] - px[i]) * (z - az)) / (bz - az) + px[i]) inside = !inside;
  }
  return inside;
}
