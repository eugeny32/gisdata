/**
 * ShaderFactory — GPU materials for the heavy point cloud.
 *
 * The cloud is NEVER filtered on the CPU per frame. Two clip stages run in
 * the vertex shader from uniforms only:
 *
 *   1. Wall isolation — an even-odd point-in-polygon test against the
 *      top-down lasso fence (world XZ), uploaded as a vec2 uniform array.
 *   2. Section depth — an axis-aligned box test in UCS-local space
 *      (`uUcsInv * worldPos`), enabled per-viewport by the Engine.
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
  /** Facade depth slice (main viewport): local-Z slab clip. */
  uFacadeClip: THREE.IUniform<number>;
  uFacadeMin: THREE.IUniform<number>;
  uFacadeMax: THREE.IUniform<number>;
  /** ОБЛАСТЬ поиска проёмов (main viewport): local-XY rect clip — пока она
   *  задана, окно 1 показывает только выбранный кусок фасада. */
  uRegionClip: THREE.IUniform<number>;
  uRegionMin: THREE.IUniform<THREE.Vector2>;
  uRegionMax: THREE.IUniform<THREE.Vector2>;
  uCurClip: THREE.IUniform<number>;
  uCurPos: THREE.IUniform<THREE.Vector3>;
  uCurHalf: THREE.IUniform<number>;
  /** Plan slice (top view, BEFORE a UCS exists): world-height slab clip.
   *  Wall lines are picked on this slice instead of on the full elevation
   *  soup, so it cannot be expressed in UCS-local coordinates. */
  uPlanClip: THREE.IUniform<number>;
  uPlanMin: THREE.IUniform<number>;
  uPlanMax: THREE.IUniform<number>;
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
  uniform float uFacadeClip;
  uniform float uFacadeMin;
  uniform float uFacadeMax;
  uniform float uRegionClip;
  uniform vec2  uRegionMin;
  uniform vec2  uRegionMax;
  uniform float uCurClip;
  uniform vec3  uCurPos;
  uniform float uCurHalf;
  uniform float uPlanClip;
  uniform float uPlanMin;
  uniform float uPlanMax;
  uniform float uDensity;  // 0..1 — keep points whose key falls below it
  uniform float uMode;     // 0 = RGB, 1 = intensity (grayscale), 2 = height ramp
  uniform float uMinY;
  uniform float uYRangeInv;

  attribute vec3  aColor;
  // The compact wall buffer decimates by KEY (drawRange is busy carrying the
  // spatial tile range there); the leaf chunks decimate by drawRange PREFIX
  // and skip the attribute entirely — one shader, two materials.
  #ifdef USE_AKEY
  attribute float aKey;    // stable per-point random in [0,1) — see Engine
  #endif
  #ifdef USE_QUANT
  // Лист хранит позиции в uint16 относительно СВОЕЙ коробки: 6 байт вместо
  // 12 и в куче, и на GPU. Восстановление — один madd на вершину; шаг сетки
  // на 30-метровом листе ~0.5 мм, глубже шума самого сканера.
  uniform vec3 uQMin;
  uniform vec3 uQScale;
  #endif

  varying vec3  vColor;
  varying float vKill;

  void main() {
    #ifdef USE_AKEY
    vKill = aKey < uDensity ? 0.0 : 1.0;
    #else
    vKill = 0.0;
    #endif

    #ifdef USE_QUANT
    vec4 wp = modelMatrix * vec4(uQMin + position * uQScale, 1.0);
    #else
    vec4 wp = modelMatrix * vec4(position, 1.0);
    #endif

    vec3 col = aColor;
    if (uMode > 1.5) {
      float t = clamp((wp.y - uMinY) * uYRangeInv, 0.0, 1.0);
      if (t < 0.5) col = mix(vec3(0.15, 0.35, 0.9), vec3(0.2, 0.85, 0.4), t * 2.0);
      else col = mix(vec3(0.2, 0.85, 0.4), vec3(0.95, 0.35, 0.2), t * 2.0 - 1.0);
    } else if (uMode > 0.5) {
      col = vec3(dot(aColor, vec3(0.299, 0.587, 0.114)));
    }
    vColor = col;


    // Plan slice runs in WORLD height: it is used before any UCS exists.
    if (uPlanClip > 0.5 && (wp.y < uPlanMin || wp.y > uPlanMax)) vKill = 1.0;

    if ((uSectionEnabled > 0.5 || uCurClip > 0.5 || uFacadeClip > 0.5 || uRegionClip > 0.5) && vKill < 0.5) {
      vec3 lp = (uUcsInv * wp).xyz;
      if (uSectionEnabled > 0.5 && (any(lessThan(lp, uBoxMin)) || any(greaterThan(lp, uBoxMax)))) vKill = 1.0;
      // Facade depth slice: keep only the slab at the chosen UCS depth, so
      // reveals/recesses read cleanly and snapping can target them.
      if (uFacadeClip > 0.5 && (lp.z < uFacadeMin || lp.z > uFacadeMax)) vKill = 1.0;
      // Область поиска: работаем по куску — остальной фасад не отвлекает.
      if (uRegionClip > 0.5 && (any(lessThan(lp.xy, uRegionMin)) || any(greaterThan(lp.xy, uRegionMax)))) vKill = 1.0;
      // Economical iso view: show the cloud only in a box around the cursor.
      if (uCurClip > 0.5 && (abs(lp.x - uCurPos.x) > uCurHalf || abs(lp.y - uCurPos.y) > uCurHalf)) vKill = 1.0;
    }

    vec4 mv = viewMatrix * wp;
    gl_Position = projectionMatrix * mv;

    // Perspective: mild distance attenuation only (0.5×..1.5×), so the
    // per-viewport size slider stays in charge — the old hard clamp to
    // 4 px saturated at close range and the slider had no visible effect.
    float size = uSize;
    if (uIsPersp > 0.5) size *= clamp(60.0 / max(1.0, -mv.z), 0.5, 1.5);
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
    uBoxMin: { value: new THREE.Vector3(-1e6, -1e6, -0.2) },
    uBoxMax: { value: new THREE.Vector3(1e6, 1e6, 0.2) },
    uFacadeClip: { value: 0 },
    uFacadeMin: { value: -1e6 },
    uFacadeMax: { value: 1e6 },
    uRegionClip: { value: 0 },
    uRegionMin: { value: new THREE.Vector2(-1e6, -1e6) },
    uRegionMax: { value: new THREE.Vector2(1e6, 1e6) },
    uCurClip: { value: 0 },
    uCurPos: { value: new THREE.Vector3() },
    uCurHalf: { value: 25.0 }, // 50×50 м вокруг курсора — держать в согласии с #cursor-area
    uPlanClip: { value: 0 },
    uPlanMin: { value: -1e6 },
    uPlanMax: { value: 1e6 },
    uOpacity: { value: 1 },
    uDensity: { value: 1 },
    uMode: { value: 0 },
    uMinY: { value: 0 },
    uYRangeInv: { value: 1 },
  };

  const material = new THREE.ShaderMaterial({
    uniforms: uniforms as unknown as { [uniform: string]: THREE.IUniform },
    defines: { USE_AKEY: 1 },
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    transparent: true, // per-viewport opacity is a uniform flip
  });

  return { material, uniforms };
}

/**
 * Материал одного ЛИСТА облака: тот же шейдер, те же ОБЪЕКТЫ юниформ (клипы
 * и настройки окон обновляются в одном месте и доходят до всех листьев),
 * плюс два своих — параметры деквантования его коробки. Программа у GL
 * одна на всех: код шейдера совпадает, различаются только значения.
 */
export function createLeafMaterial(shared: CloudUniforms, qMin: THREE.Vector3, qScale: THREE.Vector3): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      ...(shared as unknown as { [uniform: string]: THREE.IUniform }),
      uQMin: { value: qMin },
      uQScale: { value: qScale },
    },
    defines: { USE_QUANT: 1 },
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    transparent: true,
  });
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
