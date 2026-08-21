/**
 * ViewportManager — three synchronized viewports rendered by a SINGLE
 * WebGLRenderer over a single scene using scissor testing:
 *
 *   ┌─────────────────────┬──────────────┐
 *   │                     │ РЕЗ          │  ortho: ПОПЕРЕЧНИК ⇄ ПРОДОЛЬНИК
 *   │  ПЛАН (drafting)    ├──────────────┤
 *   │  ortho, top-down    │ 3D ИЗО       │  perspective + OrbitControls
 *   └─────────────────────┴──────────────┘
 *
 * Because all cameras render the same scene graph, geometry drawn in the
 * plan shows up in the cut and in the 3D view on the very same frame — no
 * synchronization code needed.
 *
 * The section pane carries a VERTICAL EXAGGERATION factor: terrain relief
 * is one or two orders of magnitude smaller than the distances along the
 * ground, so an unstretched profile reads as a flat line.
 *
 * All hot-path methods reuse module-level temp vectors (no allocations).
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export type ViewportName = 'main' | 'section' | 'iso';
/** What the section pane is cutting right now. */
export type SectionMode = 'cross' | 'long';

/** Layout fractions — keep in sync with the overlay CSS in index.html. */
export const SPLIT_X = 0.62;
export const SPLIT_Y = 0.5;

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
  /** Zoom state: world units visible horizontally are frustumHeight·aspect,
   *  vertically frustumHeight / vExag (orthographic viewports). */
  frustumHeight: number;
  /** Vertical exaggeration (1 = true scale) — the section pane only. */
  vExag: number;
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
  readonly section: Viewport;
  readonly iso: Viewport;
  readonly list: readonly Viewport[];
  readonly orbit: OrbitControls;

  /** Height of the docked ribbon, px: the panes start under it instead of
   *  running behind it, so the focus ring frames what you actually see. */
  private topOffset = 0;

  /** Engine hook: flip per-viewport shader uniforms (section clip, sizing)
   *  right before each scissored render pass. */
  onBeforeViewport: ((vp: Viewport) => void) | null = null;

  constructor(
    private readonly renderer: THREE.WebGLRenderer,
    private readonly scene: THREE.Scene,
    orbitPad: HTMLElement,
  ) {
    const mainCam = new THREE.OrthographicCamera(-1, 1, 1, -1, -4000, 8000);
    const sectCam = new THREE.OrthographicCamera(-1, 1, 1, -1, -4000, 8000);
    const isoCam = new THREE.PerspectiveCamera(50, 1, 0.1, 12000);

    // Layer 1 = plan-only overlays; layer 2 = iso-only helpers;
    // layer 3 = CAD linework (individually toggleable per viewport).
    mainCam.layers.enable(1);
    isoCam.layers.enable(2);
    mainCam.layers.enable(3);
    sectCam.layers.enable(3);
    isoCam.layers.enable(3);
    // Layer 4 = point cloud (individually toggleable per viewport).
    mainCam.layers.enable(4);
    sectCam.layers.enable(4);
    isoCam.layers.enable(4);
    // Layer 5 = mirrored cursor: shown everywhere EXCEPT the pane the mouse
    // is in, which already has the OS cursor (see CADTools).
    sectCam.layers.enable(5);
    isoCam.layers.enable(5);

    // Clear colours follow the UI palette: graphite, each pane a shade
    // darker than the one that owns the commands most of the time.
    this.main = { name: 'main', camera: mainCam, clearColor: 0x17161e, fx: 0, fy: 0, fw: SPLIT_X, fh: 1, css: rect0(), gl: rect0(), frustumHeight: 60, vExag: 1 };
    this.section = { name: 'section', camera: sectCam, clearColor: 0x141219, fx: SPLIT_X, fy: 0, fw: 1 - SPLIT_X, fh: SPLIT_Y, css: rect0(), gl: rect0(), frustumHeight: 30, vExag: 1 };
    this.iso = { name: 'iso', camera: isoCam, clearColor: 0x111016, fx: SPLIT_X, fy: SPLIT_Y, fw: 1 - SPLIT_X, fh: 1 - SPLIT_Y, css: rect0(), gl: rect0(), frustumHeight: 30, vExag: 1 };
    this.list = [this.main, this.section, this.iso];

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
  }

  /** Damped orbit needs a per-frame tick. */
  update(): void {
    this.orbit.update();
  }

  render(): void {
    const r = this.renderer;
    for (const vp of this.list) {
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

  /** World-units-per-CSS-pixel HORIZONTALLY — drives the 15 px snap radius,
   *  pick tolerances and marker sizing. Vertical exaggeration only ever
   *  applies to the section pane, where nothing is picked. */
  worldPerPixel(vp: Viewport): number {
    if (!(vp.camera instanceof THREE.OrthographicCamera)) return 0.01;
    return vp.frustumHeight / Math.max(1, vp.css.h);
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
    cam.position.copy(center).addScaledVector(dir, 600);
    cam.lookAt(center);
    cam.updateMatrixWorld(true);
    this.applyOrtho(vp);
  }

  /** World plan view (МСК overview): world X → right, world Z → down. */
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

  setExaggeration(vp: Viewport, k: number): void {
    vp.vExag = THREE.MathUtils.clamp(k, 1, 50);
    if (vp.camera instanceof THREE.OrthographicCamera) this.applyOrtho(vp);
  }

  // --------------------------------------------------------- navigation --

  /** Wheel zoom anchored at the cursor (orthographic viewports only). */
  zoomAt(vp: Viewport, clientX: number, clientY: number, scale: number): void {
    if (!(vp.camera instanceof THREE.OrthographicCamera)) return;
    this.ndcInto(vp, clientX, clientY, _ndc);
    _before.set(_ndc.x, _ndc.y, 0).unproject(vp.camera);
    vp.frustumHeight = THREE.MathUtils.clamp(vp.frustumHeight * scale, 0.05, 12000);
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
    vp.camera.position.addScaledVector(_right, -dxPx * wpp).addScaledVector(_up, (dyPx * wpp) / vp.vExag);
    vp.camera.updateMatrixWorld(true);
  }

  private applyOrtho(vp: Viewport): void {
    const cam = vp.camera as THREE.OrthographicCamera;
    const aspect = vp.css.w / Math.max(1, vp.css.h);
    // Horizontal half-extent is the zoom state; the vertical one is shrunk
    // by the exaggeration factor, which stretches relief on screen.
    cam.right = (vp.frustumHeight * aspect) / 2;
    cam.left = -cam.right;
    cam.top = vp.frustumHeight / (2 * vp.vExag);
    cam.bottom = -cam.top;
    cam.updateProjectionMatrix();
  }
}
