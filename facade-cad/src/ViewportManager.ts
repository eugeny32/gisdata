/**
 * ViewportManager — three synchronized viewports rendered by a SINGLE
 * WebGLRenderer over a single scene using scissor testing:
 *
 *   ┌─────────────────────┬──────────────┐
 *   │                     │ PROFILE      │  ortho, looks along the wall
 *   │  MAIN (drafting)    ├──────────────┤
 *   │  ortho, wall-aligned│ 3D ISO (QA)  │  perspective + OrbitControls
 *   └─────────────────────┴──────────────┘
 *
 * Because all cameras render the same scene graph, geometry drawn in the
 * main viewport shows up in the other two on the very same frame — no
 * synchronization code needed.
 *
 * All hot-path methods reuse module-level temp vectors (no allocations).
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { shade, token } from './theme';

export type ViewportName = 'main' | 'profile' | 'iso';

/** Layout fractions — defaults; the live values are in `PaneLayout` and
 *  published to CSS variables --split-x/--split-y/--pane-h on every resize,
 *  so the DOM overlays follow the panes wherever the user drags them. */
export const SPLIT_X = 0.62;
export const SPLIT_Y = 0.5;

/** Раскладка окон: пользовательская. Границы таскаются за грипы, окна 2 и 3
 *  можно скрывать — окно 1 забирает освободившееся место. */
export interface PaneLayout {
  splitX: number;
  splitY: number;
  hideProfile: boolean;
  hideIso: boolean;
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Viewport {
  name: ViewportName;
  camera: THREE.OrthographicCamera | THREE.PerspectiveCamera;
  clearColor: number;
  /** Layout fractions, CSS convention (origin top-left). */
  fx: number;
  fy: number;
  fw: number;
  fh: number;
  /** Pixel rect in CSS space (origin top-left) — hit-testing, marquee. */
  css: Rect;
  /** Pixel rect in WebGL space (origin bottom-left) — scissor/viewport. */
  gl: Rect;
  /** World units visible vertically (orthographic zoom state). */
  frustumHeight: number;
}

const _ndc = new THREE.Vector2();
const _v = new THREE.Vector3();
const _before = new THREE.Vector3();
const _after = new THREE.Vector3();
const _right = new THREE.Vector3();
const _up = new THREE.Vector3();

function rect0(): Rect {
  return { x: 0, y: 0, w: 0, h: 0 };
}

export class ViewportManager {
  readonly main: Viewport;
  readonly profile: Viewport;
  readonly iso: Viewport;
  readonly list: readonly Viewport[];
  readonly orbit: OrbitControls;

  /** Height of the docked ribbon, px: the panes start under it instead of
   *  running behind it, so the focus ring frames what you actually see. */
  private topOffset = 0;

  private readonly layoutState: PaneLayout = { splitX: SPLIT_X, splitY: SPLIT_Y, hideProfile: false, hideIso: false };

  /** Engine hook: flip per-viewport shader uniforms (section clip, sizing)
   *  right before each scissored render pass. */
  onBeforeViewport: ((vp: Viewport) => void) | null = null;

  constructor(
    private readonly renderer: THREE.WebGLRenderer,
    private readonly scene: THREE.Scene,
    orbitPad: HTMLElement,
  ) {
    const mainCam = new THREE.OrthographicCamera(-1, 1, 1, -1, -2000, 4000);
    const profCam = new THREE.OrthographicCamera(-1, 1, 1, -1, -2000, 4000);
    const isoCam = new THREE.PerspectiveCamera(50, 1, 0.1, 4000);

    // Layer 1 = main-only overlays; layer 2 = iso-only helpers;
    // layer 3 = CAD linework (individually toggleable per viewport).
    mainCam.layers.enable(1);
    isoCam.layers.enable(2);
    mainCam.layers.enable(3);
    profCam.layers.enable(3);
    isoCam.layers.enable(3);
    // Layer 4 = point cloud (individually toggleable per viewport).
    mainCam.layers.enable(4);
    profCam.layers.enable(4);
    isoCam.layers.enable(4);
    // Layer 5 = mirrored cursor: shown everywhere EXCEPT the pane the mouse
    // is in, which already has the OS cursor (see CADTools).
    profCam.layers.enable(5);
    isoCam.layers.enable(5);
    // Layer 6 = profile-only overlays (полоса среза фасада: границы слоя
    // должны читаться на профиле, где глубина разложена по экрану).
    profCam.layers.enable(6);

    // Фон окон берётся из темы (--bg), а не из чисел в коде: сцена занимает
    // почти весь экран, и «почти тот же чёрный», что у панелей, читается как
    // грязь. Соседние окна на волос темнее главного — граница между ними
    // должна быть видна и там, где облако не дошло до края.
    const bg = token('--bg', 0x0b0c0d);
    this.main = { name: 'main', camera: mainCam, clearColor: bg, fx: 0, fy: 0, fw: SPLIT_X, fh: 1, css: rect0(), gl: rect0(), frustumHeight: 30 };
    this.profile = { name: 'profile', camera: profCam, clearColor: shade(bg, -0.3), fx: SPLIT_X, fy: 0, fw: 1 - SPLIT_X, fh: SPLIT_Y, css: rect0(), gl: rect0(), frustumHeight: 30 };
    this.iso = { name: 'iso', camera: isoCam, clearColor: shade(bg, -0.55), fx: SPLIT_X, fy: SPLIT_Y, fw: 1 - SPLIT_X, fh: 1 - SPLIT_Y, css: rect0(), gl: rect0(), frustumHeight: 30 };
    this.list = [this.main, this.profile, this.iso];

    this.orbit = new OrbitControls(isoCam, orbitPad);
    this.orbit.enableDamping = true;
    this.orbit.dampingFactor = 0.08;
    // Drawing happens with LMB in the iso view too: rotate stays on MMB
    // (LMB rotate is re-enabled by the Engine while Select is active).
    this.orbit.mouseButtons.MIDDLE = THREE.MOUSE.ROTATE;
    this.orbit.mouseButtons.RIGHT = THREE.MOUSE.PAN;

    this.renderer.setScissorTest(true);
    window.addEventListener('resize', () => this.resize());
    this.resize();
  }

  /** Dock the panes under a header of `px` pixels (the ribbon). */
  setTopOffset(px: number): void {
    const next = Math.max(0, Math.round(px));
    if (next === this.topOffset) return;
    this.topOffset = next;
    this.resize();
  }

  layout(): PaneLayout {
    return { ...this.layoutState };
  }

  /** Изменить раскладку: границы зажимаются в разумных пределах, доли
   *  пересчитываются, DOM-переменные обновляет resize(). */
  setLayout(patch: Partial<PaneLayout>): void {
    const s = this.layoutState;
    if (patch.splitX !== undefined) s.splitX = THREE.MathUtils.clamp(patch.splitX, 0.2, 0.85);
    if (patch.splitY !== undefined) s.splitY = THREE.MathUtils.clamp(patch.splitY, 0.15, 0.85);
    if (patch.hideProfile !== undefined) s.hideProfile = patch.hideProfile;
    if (patch.hideIso !== undefined) s.hideIso = patch.hideIso;
    this.applyFractions();
    this.resize();
  }

  /** Доли окон из раскладки: скрытое окно схлопывается в ноль, соседи
   *  забирают место — главное тянется вправо, сечение/3D по вертикали. */
  private applyFractions(): void {
    const { splitX, splitY, hideProfile: hp, hideIso: hi } = this.layoutState;
    const sx = hp && hi ? 1 : splitX;
    this.main.fx = 0;
    this.main.fy = 0;
    this.main.fw = sx;
    this.main.fh = 1;
    this.profile.fx = sx;
    this.profile.fy = 0;
    this.profile.fw = hp ? 0 : 1 - sx;
    this.profile.fh = hp ? 0 : hi ? 1 : splitY;
    this.iso.fx = sx;
    this.iso.fy = hi ? 0 : hp ? 0 : splitY;
    this.iso.fw = hi ? 0 : 1 - sx;
    this.iso.fh = hi ? 0 : hp ? 1 : 1 - splitY;
    // Оверлеи скрытых окон гасит CSS по классам на body.
    document.body.classList.toggle('no-profile', hp);
    document.body.classList.toggle('no-iso', hi);
    document.body.classList.toggle('no-right', hp && hi);
  }

  resize(): void {
    const w = window.innerWidth;
    const full = window.innerHeight;
    const top = Math.min(this.topOffset, full - 40); // never collapse the panes
    const h = full - top;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // fill-rate budget for 3 passes
    this.renderer.setSize(w, full, false);
    for (const vp of this.list) {
      vp.css.x = vp.fx * w;
      vp.css.y = top + vp.fy * h;
      vp.css.w = vp.fw * w;
      vp.css.h = vp.fh * h;
      vp.gl.x = vp.css.x;
      vp.gl.w = vp.css.w;
      vp.gl.h = vp.css.h;
      vp.gl.y = full - (vp.css.y + vp.css.h);
      if (vp.camera instanceof THREE.OrthographicCamera) {
        this.applyOrtho(vp);
      } else {
        vp.camera.aspect = vp.css.w / Math.max(1, vp.css.h);
        vp.camera.updateProjectionMatrix();
      }
    }
    // Оверлеи (панели, ярлыки, кнопки, грипы) позиционируются от этих
    // переменных — двигаются вместе с границами окон.
    const st = this.layoutState;
    const ySplit = !st.hideIso ? this.iso.css.y : !st.hideProfile ? this.profile.css.y + this.profile.css.h : full;
    const root = document.documentElement.style;
    root.setProperty('--split-x', `${Math.round(this.main.css.w)}px`);
    root.setProperty('--split-y', `${Math.round(ySplit)}px`);
    root.setProperty('--pane-h', `${Math.max(0, Math.round(full - ySplit))}px`);
  }

  /** Damped orbit needs a per-frame tick. */
  update(): void {
    this.orbit.update();
  }

  render(): void {
    const r = this.renderer;
    for (const vp of this.list) {
      if (vp.css.w < 2 || vp.css.h < 2) continue; // окно скрыто раскладкой
      r.setViewport(vp.gl.x, vp.gl.y, vp.gl.w, vp.gl.h);
      r.setScissor(vp.gl.x, vp.gl.y, vp.gl.w, vp.gl.h);
      r.setClearColor(vp.clearColor, 1);
      if (this.onBeforeViewport) this.onBeforeViewport(vp);
      r.render(this.scene, vp.camera);
    }
  }

  // ------------------------------------------------------------- picking --

  viewportAt(clientX: number, clientY: number): Viewport | null {
    for (const vp of this.list) {
      const c = vp.css;
      if (clientX >= c.x && clientX < c.x + c.w && clientY >= c.y && clientY < c.y + c.h) return vp;
    }
    return null;
  }

  ndcInto(vp: Viewport, clientX: number, clientY: number, out: THREE.Vector2): THREE.Vector2 {
    out.x = ((clientX - vp.css.x) / vp.css.w) * 2 - 1;
    out.y = -(((clientY - vp.css.y) / vp.css.h) * 2 - 1);
    return out;
  }

  /** World-units-per-CSS-pixel for an orthographic viewport — drives the
   *  15 px snap radius, raycast thresholds and marker sizing. */
  worldPerPixel(vp: Viewport): number {
    if (!(vp.camera instanceof THREE.OrthographicCamera)) return 0.01;
    return vp.frustumHeight / vp.css.h;
  }

  projectToClient(vp: Viewport, world: THREE.Vector3, out: { x: number; y: number }): void {
    _v.copy(world).project(vp.camera);
    out.x = vp.css.x + (_v.x * 0.5 + 0.5) * vp.css.w;
    out.y = vp.css.y + (-_v.y * 0.5 + 0.5) * vp.css.h;
  }

  // ------------------------------------------------------- view framing --

  /** Aim an orthographic viewport: eye sits along `dir` from `center`. */
  setOrthoView(vp: Viewport, dir: THREE.Vector3, up: THREE.Vector3, center: THREE.Vector3, frustumHeight: number): void {
    const cam = vp.camera as THREE.OrthographicCamera;
    vp.frustumHeight = frustumHeight;
    cam.up.copy(up);
    cam.position.copy(center).addScaledVector(dir, 120);
    cam.lookAt(center);
    cam.updateMatrixWorld(true);
    this.applyOrtho(vp);
  }

  /** Plan view for wall isolation: world X → right, world Z → down. */
  setTopView(center: THREE.Vector3, extent: number): void {
    _v.set(0, 1, 0);
    _up.set(0, 0, -1);
    this.setOrthoView(this.main, _v, _up, center, extent);
  }

  setIsoView(center: THREE.Vector3, radius: number): void {
    const cam = this.iso.camera as THREE.PerspectiveCamera;
    _v.set(0.9, 0.7, 0.9).normalize().multiplyScalar(radius * 2.1);
    cam.position.copy(center).add(_v);
    this.orbit.target.copy(center);
    this.orbit.update();
  }

  // --------------------------------------------------------- navigation --

  /** Wheel zoom anchored at the cursor (orthographic viewports only). */
  zoomAt(vp: Viewport, clientX: number, clientY: number, scale: number): void {
    if (!(vp.camera instanceof THREE.OrthographicCamera)) return;
    this.ndcInto(vp, clientX, clientY, _ndc);
    _before.set(_ndc.x, _ndc.y, 0).unproject(vp.camera);
    vp.frustumHeight = THREE.MathUtils.clamp(vp.frustumHeight * scale, 0.05, 4000);
    this.applyOrtho(vp);
    _after.set(_ndc.x, _ndc.y, 0).unproject(vp.camera);
    vp.camera.position.add(_before.sub(_after));
    vp.camera.updateMatrixWorld(true);
  }

  /** Middle-mouse pan in screen pixels (orthographic viewports only). */
  pan(vp: Viewport, dxPx: number, dyPx: number): void {
    if (!(vp.camera instanceof THREE.OrthographicCamera)) return;
    const wpp = this.worldPerPixel(vp);
    const e = vp.camera.matrixWorld.elements;
    _right.set(e[0], e[1], e[2]);
    _up.set(e[4], e[5], e[6]);
    vp.camera.position.addScaledVector(_right, -dxPx * wpp).addScaledVector(_up, dyPx * wpp);
    vp.camera.updateMatrixWorld(true);
  }

  private applyOrtho(vp: Viewport): void {
    const cam = vp.camera as THREE.OrthographicCamera;
    const aspect = vp.css.w / Math.max(1, vp.css.h);
    cam.top = vp.frustumHeight / 2;
    cam.bottom = -cam.top;
    cam.right = (vp.frustumHeight * aspect) / 2;
    cam.left = -cam.right;
    cam.updateProjectionMatrix();
  }
}
