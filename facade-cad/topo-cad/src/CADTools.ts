/**
 * CADTools — extensible drafting state machine.
 *
 * ToolManager owns the input pipeline for the MAIN viewport:
 *
 *   raw pointer → ray → drafting-plane intersection → snap (spatial grid)
 *               → ortho constraint → DraftPointer → active tool
 *
 * plus AutoCAD-style dynamic input: while a tool has an anchor, typed
 * digits accumulate in a buffer next to the cursor; Enter commits either
 * a distance along the cursor direction (`2.5`), a relative offset
 * (`3,1.2`), or a tool-specific scalar (rotation angle, scale factor,
 * circle radius) via `onNumeric`.
 *
 * Tools are small state machines subclassing CadTool; adding a tool is
 * "write a class, register it". The shared DraftPointer and all module
 * temp vectors are reused — the mousemove path performs zero allocations.
 */
import * as THREE from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { UCSManager } from './UCSManager';
import { SnapEngine } from './SnapEngine';
import { ArcEntity, CadEntity, CircleEntity, EllipseEntity, EntityStore, MAT_GHOST_LINE, MAT_GHOST_LINE2, MAT_GHOST_MESH, PointEntity, PolylineEntity, TextEntity } from './Entities';
import { Viewport, ViewportManager } from './ViewportManager';
import { MAX_LASSO_VERTS } from './ShaderFactory';
import type { UI } from './UI';

const SNAP_RADIUS_PX = 15;

/** Services tools need from the Engine (which implements this interface). */
export interface ToolHost {
  readonly scene: THREE.Scene;
  readonly ucs: UCSManager;
  readonly snap: SnapEngine;
  readonly store: EntityStore;
  readonly vpm: ViewportManager;
  readonly ui: UI;
  snapOn: boolean;
  orthoOn: boolean;
  /** Elevation window for cloud snapping (±Infinity when the slice is off). */
  readonly snapZMin: number;
  readonly snapZMax: number;
  applyLasso(worldPts: readonly THREE.Vector3[]): void;
  clearLasso(): void;
  pickCloudPoint(ray: THREE.Ray, out: THREE.Vector3): boolean;
  defineUcs(p1: THREE.Vector3, p2: THREE.Vector3): void;
  enterTopView(): void;
  enterDraftView(): void;
  /** False in МСК overview — drafting/editing tools refuse to arm. */
  canDraft(): boolean;
  /** Push an undo snapshot — call BEFORE mutating the drawing. */
  snapshot(): void;
  /** Datum elevation (UCS-local z) for point labels, null when unset. */
  deviationRef: number | null;
  /** Set the reference plane from the cloud point under a pick ray. */
  setDeviationRef(ray: THREE.Ray): boolean;
}

/** Fully-resolved cursor state handed to tools. All vectors are reused. */
export class DraftPointer {
  readonly world = new THREE.Vector3();
  /** On the drafting plane, snapped + ortho-constrained. z === 0. */
  readonly local = new THREE.Vector3();
  /** Plane hit before snap/ortho. */
  readonly rawLocal = new THREE.Vector3();
  /** The real 3-D cloud point behind the snap (z ≠ 0). */
  readonly snapLocal = new THREE.Vector3();
  snapped = false;
  clientX = 0;
  clientY = 0;
  valid = false;
}

/** Stand-in event for numeric-input commits (no modifier keys pressed). */
const SYNTH_EVENT = { shiftKey: false, button: 0 } as unknown as PointerEvent;

// ---------------------------------------------------------------- preview

const RB_CAP = 512;

/** Reusable rubber-band line: one pre-allocated buffer, draw-range writes.
 *  Used by every tool for live previews — no allocation per mousemove. */
export class RubberBand {
  readonly line: THREE.Line;
  private readonly attr: THREE.BufferAttribute;

  constructor(parent: THREE.Object3D, color: number) {
    const geo = new THREE.BufferGeometry();
    this.attr = new THREE.BufferAttribute(new Float32Array(RB_CAP * 3), 3);
    geo.setAttribute('position', this.attr);
    geo.setDrawRange(0, 0);
    this.line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9, depthTest: false }));
    this.line.frustumCulled = false;
    this.line.visible = false;
    this.line.renderOrder = 3; // over the cloud, under the snap marker
    this.line.layers.set(3); // previews follow the per-viewport linework toggle
    parent.add(this.line);
  }

  private writeXYZ(i: number, x: number, y: number, z: number): void {
    const a = this.attr.array as Float32Array;
    a[i * 3] = x;
    a[i * 3 + 1] = y;
    a[i * 3 + 2] = z;
  }

  private commit(n: number): void {
    this.attr.needsUpdate = true;
    this.line.geometry.setDrawRange(0, n);
    this.line.visible = n >= 2;
  }

  setPath(pts: readonly THREE.Vector3[], cursor?: THREE.Vector3, close = false): void {
    let n = 0;
    for (let i = 0; i < pts.length && n < RB_CAP - 2; i++, n++) this.writeXYZ(n, pts[i].x, pts[i].y, pts[i].z);
    if (cursor && n < RB_CAP - 1) this.writeXYZ(n++, cursor.x, cursor.y, cursor.z);
    if (close && n >= 3) this.writeXYZ(n++, pts[0].x, pts[0].y, pts[0].z);
    this.commit(n);
  }

  setCircle(c: THREE.Vector3, radius: number): void {
    const segs = 72;
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      this.writeXYZ(i, c.x + Math.cos(a) * radius, c.y + Math.sin(a) * radius, 0);
    }
    this.commit(segs + 1);
  }

  setArc(cx: number, cy: number, r: number, a0: number, sweep: number): void {
    const segs = 48;
    for (let i = 0; i <= segs; i++) {
      const a = a0 + (sweep * i) / segs;
      this.writeXYZ(i, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 0);
    }
    this.commit(segs + 1);
  }

  setEllipse(c: THREE.Vector3, rx: number, ry: number): void {
    const segs = 64;
    for (let i = 0; i <= segs; i++) {
      const t = (i / segs) * Math.PI * 2;
      this.writeXYZ(i, c.x + Math.cos(t) * rx, c.y + Math.sin(t) * ry, 0);
    }
    this.commit(segs + 1);
  }

  setRect(a: THREE.Vector3, b: THREE.Vector3): void {
    this.writeXYZ(0, a.x, a.y, 0);
    this.writeXYZ(1, b.x, a.y, 0);
    this.writeXYZ(2, b.x, b.y, 0);
    this.writeXYZ(3, a.x, b.y, 0);
    this.writeXYZ(4, a.x, a.y, 0);
    this.commit(5);
  }

  hide(): void {
    this.commit(0);
  }
}

// ---------------------------------------------------------------- CadTool

export abstract class CadTool {
  abstract readonly id: string;
  abstract readonly hint: string;
  /** Unit label shown next to the dynamic-input buffer. */
  readonly numericSuffix: string = 'м';

  constructor(
    protected readonly host: ToolHost,
    protected readonly mgr: ToolManager,
  ) {}

  activate(): void {}
  deactivate(): void {}
  onDown(_p: DraftPointer, _e: PointerEvent): void {}
  onMove(_p: DraftPointer, _e: PointerEvent): void {}
  onUp(_p: DraftPointer, _e: PointerEvent): void {}
  /** Enter key / right click. */
  onFinish(): void {}
  /** Return true when the key was consumed. */
  onKey(_e: KeyboardEvent): boolean {
    return false;
  }
  /** Local-space anchor for the ortho constraint (null = unconstrained). */
  getOrthoAnchor(): THREE.Vector3 | null {
    return null;
  }
  /** Anchor for dynamic numeric input; defaults to the ortho anchor. */
  getDynamicAnchor(): THREE.Vector3 | null {
    return this.getOrthoAnchor();
  }
  /** Tool-specific scalar entry (angle, factor, radius). Return true when
   *  the value was consumed; false falls back to distance-along-cursor. */
  onNumeric(_v: number): boolean {
    return false;
  }
}

// module-level temps: the whole tool layer allocates only on commit clicks
const _ndc = new THREE.Vector2();
const _pick = new THREE.Vector3();
const _delta = new THREE.Vector3();
const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _num = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _zero = new THREE.Vector3();
const _cc = new THREE.Vector3();
const _min2 = new THREE.Vector2();
const _max2 = new THREE.Vector2();
const _pq = new THREE.Quaternion();
const _mq = new THREE.Quaternion();
const _rect: THREE.Vector3[] = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
const _arc = { r: 0, a0: 0, sweep: 0 };

/** Circumcenter of three 2D points (false when collinear). */
function circumcenter(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, out: THREE.Vector3): boolean {
  const d = 2 * (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y));
  if (Math.abs(d) < 1e-9) return false;
  const a2 = a.x * a.x + a.y * a.y;
  const b2 = b.x * b.x + b.y * b.y;
  const c2 = c.x * c.x + c.y * c.y;
  out.set((a2 * (b.y - c.y) + b2 * (c.y - a.y) + c2 * (a.y - b.y)) / d, (a2 * (c.x - b.x) + b2 * (a.x - c.x) + c2 * (b.x - a.x)) / d, 0);
  return true;
}

/** Three-point arc (start, on-arc, end) → center + start angle + signed
 *  sweep chosen so the arc passes through the middle point. */
function arcFrom3(p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3): boolean {
  if (!circumcenter(p1, p2, p3, _cc)) return false;
  const TAU = Math.PI * 2;
  _arc.r = Math.hypot(p1.x - _cc.x, p1.y - _cc.y);
  const aS = Math.atan2(p1.y - _cc.y, p1.x - _cc.x);
  const aM = Math.atan2(p2.y - _cc.y, p2.x - _cc.x);
  const aE = Math.atan2(p3.y - _cc.y, p3.x - _cc.x);
  const ccw = (((aE - aS) % TAU) + TAU) % TAU;
  const mid = (((aM - aS) % TAU) + TAU) % TAU;
  _arc.a0 = aS;
  _arc.sweep = mid <= ccw ? ccw : ccw - TAU;
  return _arc.r > 1e-4;
}

/** Ghost visuals for copy/mirror previews — clones share geometry with the
 *  originals, so detach without disposing. */
function makeGhostGroup(selection: ReadonlySet<CadEntity>, parent: THREE.Object3D): THREE.Group {
  const g = new THREE.Group();
  for (const ent of selection) {
    const c = ent.object3D.clone(true);
    c.traverse((o) => {
      // Order matters: Line2 reports isMesh=true, so probe isLine2 first.
      const m = o as unknown as { isLine2?: boolean; isLine?: boolean; isMesh?: boolean; material?: THREE.Material };
      if (m.isLine2) m.material = MAT_GHOST_LINE2;
      else if (m.isLine) m.material = MAT_GHOST_LINE;
      else if (m.isMesh) m.material = MAT_GHOST_MESH;
    });
    g.add(c);
  }
  parent.add(g);
  return g;
}

// ------------------------------------------------------------ ToolManager

export class ToolManager {
  readonly pointer = new DraftPointer();
  private readonly raycaster = new THREE.Raycaster();
  private readonly tools = new Map<string, CadTool>();
  /** Snap marker — wide screen-space lines so it reads over dense points
   *  in EVERY viewport (a 1 px loop vanished in the profile pane). */
  private readonly marker: Line2;
  private readonly markerMat: LineMaterial;
  private readonly cross: THREE.LineSegments;
  private sBest = 0;
  private sFound = false;
  active: CadTool | null = null;
  /** Last non-select command — Space/Enter repeat it (AutoCAD habit). */
  private lastCommand: string | null = null;
  /** Viewport under the cursor for the current event. */
  viewport: Viewport | null = null;
  shiftHeld = false;
  /** Dynamic-input buffer (typed digits next to the cursor). */
  numBuffer = '';

  constructor(private readonly host: ToolHost) {
    // Green snap square — visible in ALL viewports so placed points read
    // in the profile and iso views too.
    const geo = new LineGeometry();
    geo.setPositions([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0, -1, -1, 0]);
    this.markerMat = new LineMaterial({ color: 0x2bff9e, linewidth: 2.6, depthTest: false, transparent: true });
    this.marker = new Line2(geo, this.markerMat);
    this.marker.renderOrder = 4;
    this.marker.frustumCulled = false;
    this.marker.visible = false;
    host.ucs.group.add(this.marker);

    // Crosshair that mirrors the cursor into the profile and iso views.
    const cgeo = new THREE.BufferGeometry();
    cgeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, 0, 0, 1, 0, 0, 0, -1, 0, 0, 1, 0]), 3));
    this.cross = new THREE.LineSegments(cgeo, new THREE.LineBasicMaterial({ color: 0xbfd2f0, transparent: true, opacity: 0.95, depthTest: false }));
    this.cross.renderOrder = 4;
    this.cross.frustumCulled = false;
    this.cross.visible = false;
    // Layer 5 = MIRRORED cursor. The pane you are actually pointing at has
    // the real OS cursor; drawing ours there too showed a second crosshair
    // trailing a frame behind. Only the other panes get the reflection.
    this.cross.layers.set(5);
    host.ucs.group.add(this.cross);

    for (const t of [
      new IsolateTool(host, this),
      new UcsTool(host, this),
      new SelectTool(host, this),
      new MoveTool(host, this),
      new CopyTool(host, this),
      new RotateTool(host, this),
      new ScaleTool(host, this),
      new MirrorTool(host, this),
      new TrimTool(host, this),
      new JoinTool(host, this),
      new LineTool(host, this),
      new PolylineTool(host, this),
      new RectangleTool(host, this),
      new CircleTool(host, this),
      new ArcTool(host, this),
      new EllipseTool(host, this),
      new TextTool(host, this),
      new PointTool(host, this),
      new RefPlaneTool(host, this),
      new DeviationTool(host, this),
    ]) {
      this.tools.set(t.id, t);
    }
  }

  get ray(): THREE.Ray {
    return this.raycaster.ray;
  }

  /** Shift temporarily inverts the F8 ortho state (AutoCAD behavior). */
  get orthoActive(): boolean {
    return this.host.orthoOn !== this.shiftHeld;
  }

  private static readonly DRAFT_IDS = new Set(['line', 'polyline', 'rect', 'circle', 'arc', 'ellipse', 'text', 'point', 'refplane', 'deviation', 'move', 'copy', 'rotate', 'scale', 'mirror', 'trim', 'join']);

  activate(id: string): void {
    const next = this.tools.get(id);
    if (!next || next === this.active) return;
    if (ToolManager.DRAFT_IDS.has(id) && !this.host.canDraft()) {
      this.host.ui.setHint('В МСК черчение недоступно — выберите ПСК из списка справа');
      return;
    }
    this.active?.deactivate();
    this.clearNumBuffer();
    this.active = next;
    next.activate();
    if (id !== 'select') this.lastCommand = id;
    this.host.ui.setActiveTool(id);
    this.host.ui.setHint(next.hint);
  }

  repeatLast(): void {
    if (this.lastCommand) this.activate(this.lastCommand);
  }

  /** Cancel + restart the active tool (after undo/redo restores). */
  resetActive(): void {
    if (!this.active) return;
    this.active.deactivate();
    this.clearNumBuffer();
    this.active.activate();
  }

  pointerDown(e: PointerEvent, vp: Viewport): void {
    this.shiftHeld = e.shiftKey;
    this.computePointer(e, vp);
    if (this.pointer.valid) this.active?.onDown(this.pointer, e);
  }

  pointerMove(e: PointerEvent, vp: Viewport): void {
    this.shiftHeld = e.shiftKey;
    this.computePointer(e, vp);
    if (this.pointer.valid) this.active?.onMove(this.pointer, e);
  }

  pointerUp(e: PointerEvent, vp: Viewport): void {
    this.computePointer(e, vp);
    this.active?.onUp(this.pointer, e);
  }

  finish(): void {
    this.active?.onFinish();
  }

  key(e: KeyboardEvent): boolean {
    if (this.active?.onKey(e)) return true;
    if (e.key === 'Enter') {
      // Enter (and Space) on an idle Select repeats the last command.
      if (this.active && this.active.id === 'select') this.repeatLast();
      else this.active?.onFinish();
      return true;
    }
    return false;
  }

  // ------------------------------------------------------- dynamic input

  /** Intercept digit keys for AutoCAD-style direct entry. Returns true
   *  when the key was consumed by the buffer. */
  handleNumKey(e: KeyboardEvent): boolean {
    if (/^[0-9]$/.test(e.key) || e.key === '.' || e.key === ',' || e.key === '-') {
      if (!this.active?.getDynamicAnchor()) return false;
      this.numBuffer += e.key;
      this.updateDynBox();
      return true;
    }
    if (!this.numBuffer) return false;
    if (e.key === 'Backspace') {
      this.numBuffer = this.numBuffer.slice(0, -1);
      this.updateDynBox();
      return true;
    }
    if (e.key === 'Enter') {
      const raw = this.numBuffer;
      this.clearNumBuffer();
      this.applyNumeric(raw);
      return true;
    }
    if (e.key === 'Escape') {
      this.clearNumBuffer();
      return true;
    }
    return false;
  }

  clearNumBuffer(): void {
    this.numBuffer = '';
    this.host.ui.hideDynInput();
  }

  private updateDynBox(): void {
    if (this.numBuffer) {
      this.host.ui.showDynInput(this.pointer.clientX + 18, this.pointer.clientY + 18, this.numBuffer, this.active?.numericSuffix ?? '');
    } else {
      this.host.ui.hideDynInput();
    }
  }

  /** `12.5` → distance along cursor direction (or tool scalar);
   *  `3,1.2` → relative dx,dy from the anchor. */
  private applyNumeric(raw: string): void {
    const tool = this.active;
    if (!tool) return;
    const anchor = tool.getDynamicAnchor();
    if (!anchor) return;

    if (raw.includes(',')) {
      const [sx, sy] = raw.split(',');
      const dx = parseFloat(sx);
      const dy = parseFloat(sy);
      if (!isFinite(dx) || !isFinite(dy)) return;
      _num.set(anchor.x + dx, anchor.y + dy, 0);
      this.synthClick(_num);
      return;
    }

    const v = parseFloat(raw);
    if (!isFinite(v)) return;
    if (tool.onNumeric(v)) return;

    _dir.subVectors(this.pointer.local, anchor);
    _dir.z = 0;
    if (_dir.lengthSq() < 1e-12) _dir.set(1, 0, 0);
    _dir.normalize();
    _num.copy(anchor).addScaledVector(_dir, v);
    this.synthClick(_num);
  }

  /** Feed an exact point into the active tool as if it were clicked. */
  private synthClick(local: THREE.Vector3): void {
    const p = this.pointer;
    p.local.copy(local);
    p.rawLocal.copy(local);
    p.snapped = false;
    p.valid = true;
    if (this.host.ucs.defined) this.host.ucs.localToWorld(p.local, p.world);
    else p.world.copy(p.local);
    this.active?.onDown(p, SYNTH_EVENT);
  }

  // ------------------------------------------------------ cursor pipeline

  /** The full cursor pipeline. Allocation-free (hot path). */
  private computePointer(e: PointerEvent, vp: Viewport): void {
    const p = this.pointer;
    const ucs = this.host.ucs;
    this.viewport = vp;
    p.clientX = e.clientX;
    p.clientY = e.clientY;

    this.host.vpm.ndcInto(vp, e.clientX, e.clientY, _ndc);
    this.raycaster.setFromCamera(_ndc, vp.camera);
    p.valid = this.raycaster.ray.intersectPlane(ucs.plane, p.world) !== null;
    if (!p.valid) {
      this.marker.visible = false;
      return;
    }

    if (ucs.defined) {
      ucs.worldToLocal(p.world, p.rawLocal);
      p.rawLocal.z = 0;
    } else {
      p.rawLocal.copy(p.world);
    }
    p.local.copy(p.rawLocal);
    p.snapped = false;

    // Snap: nearest cloud point OR entity point (endpoints, midpoints,
    // centers, quadrants) within 15 px — whichever is closer. The cloud
    // hit keeps its real ELEVATION for the marker and for the readout;
    // the drawing itself always flattens onto the plan (z = 0).
    if (this.host.snapOn && ucs.defined && vp.name === 'main') {
      const r = SNAP_RADIUS_PX * this.host.vpm.worldPerPixel(vp);
      let cloudD2 = Infinity;
      if (this.host.snap.query(p.rawLocal.x, p.rawLocal.y, r, p.snapLocal, this.host.snapZMin, this.host.snapZMax)) {
        const dx = p.snapLocal.x - p.rawLocal.x;
        const dy = p.snapLocal.y - p.rawLocal.y;
        cloudD2 = dx * dx + dy * dy;
      }
      const entHit = this.snapToEntities(p.rawLocal.x, p.rawLocal.y, r, _num);
      if (entHit && this.sBest < cloudD2) {
        p.snapped = true;
        p.snapLocal.set(_num.x, _num.y, 0);
        p.local.set(_num.x, _num.y, 0);
      } else if (cloudD2 < Infinity) {
        p.snapped = true;
        p.local.set(p.snapLocal.x, p.snapLocal.y, 0);
      }
    }

    // Ortho: constrain to the dominant local axis relative to the anchor.
    const anchor = this.active ? this.active.getOrthoAnchor() : null;
    if (anchor && this.orthoActive) {
      if (Math.abs(p.local.x - anchor.x) >= Math.abs(p.local.y - anchor.y)) p.local.y = anchor.y;
      else p.local.x = anchor.x;
    }

    if (ucs.defined) ucs.localToWorld(p.local, p.world);

    this.marker.visible = p.snapped;
    if (p.snapped) this.marker.position.copy(p.snapLocal);
    // Orientation is handled per-pass by the billboard in applyViewportScale;
    // here we only place the cursors.
    this.cross.visible = true;
    if (ucs.defined) this.cross.position.set(p.local.x, p.local.y, 0.001);
    else this.cross.position.set(p.local.x, 0.01, p.local.z);
    if (this.numBuffer) this.updateDynBox();
  }

  /** Osnap over drawn geometry: vertices + segment midpoints, circle
   *  center/quadrants, arc center/endpoints, anchors. Allocation-free. */
  private snapToEntities(x: number, y: number, maxR: number, out: THREE.Vector3): boolean {
    this.sBest = maxR * maxR;
    this.sFound = false;
    for (const ent of this.host.store.entities) {
      if (!ent.object3D.visible) continue; // hidden layer — no osnap
      // Cheap reject: the cursor is nowhere near this object's extent. Runs
      // on every mousemove, so it has to stay O(1) per entity.
      if (!ent.nearPoint(x, y, maxR)) continue;
      const pts = ent.points;
      if (ent instanceof CircleEntity) {
        const c = pts[0];
        this.testSnap(c.x, c.y, x, y, out);
        this.testSnap(c.x + ent.radius, c.y, x, y, out);
        this.testSnap(c.x - ent.radius, c.y, x, y, out);
        this.testSnap(c.x, c.y + ent.radius, x, y, out);
        this.testSnap(c.x, c.y - ent.radius, x, y, out);
      } else if (ent instanceof ArcEntity) {
        const c = pts[0];
        this.testSnap(c.x, c.y, x, y, out);
        this.testSnap(c.x + Math.cos(ent.a0) * ent.radius, c.y + Math.sin(ent.a0) * ent.radius, x, y, out);
        const a1 = ent.a0 + ent.sweep;
        this.testSnap(c.x + Math.cos(a1) * ent.radius, c.y + Math.sin(a1) * ent.radius, x, y, out);
      } else if (ent instanceof PolylineEntity) {
        for (let i = 0; i < pts.length; i++) {
          this.testSnap(pts[i].x, pts[i].y, x, y, out);
          const j = i + 1 < pts.length ? i + 1 : ent.closed ? 0 : -1;
          if (j >= 0) this.testSnap((pts[i].x + pts[j].x) / 2, (pts[i].y + pts[j].y) / 2, x, y, out);
        }
      } else {
        this.testSnap(pts[0].x, pts[0].y, x, y, out);
      }
    }
    return this.sFound;
  }

  private testSnap(px: number, py: number, x: number, y: number, out: THREE.Vector3): void {
    const dx = px - x;
    const dy = py - y;
    const d2 = dx * dx + dy * dy;
    if (d2 < this.sBest) {
      this.sBest = d2;
      this.sFound = true;
      out.set(px, py, 0);
    }
  }

  /** Per-render-pass: constant SCREEN size for marker/crosshair in every
   *  viewport. */
  applyViewportScale(vp: Viewport): void {
    // Line2 widths are resolution-relative — aim them at THIS scissor rect
    // before the pass, or the marker thins out in the smaller panes.
    this.markerMat.resolution.set(vp.gl.w, vp.gl.h);
    if (!this.marker.visible && !this.cross.visible) return;
    const cam = vp.camera;

    // Billboard both cursors at THIS pane's camera. They live in the UCS
    // plane, so a section view (looking ALONG that plane) saw the square
    // edge-on — it read as a stray line. local = inv(parentWorld) · camWorld.
    this.host.ucs.group.getWorldQuaternion(_pq).invert();
    _mq.copy(_pq).multiply(cam.quaternion);
    this.marker.quaternion.copy(_mq);
    this.cross.quaternion.copy(_mq);
    const wpp = this.host.vpm.worldPerPixel(vp);
    // Billboarded local X/Y map to screen X/Y, and a section pane squeezes
    // world Y by its exaggeration — undo it here or the snap square shows
    // up as a tall rectangle in the cuts.
    const k = vp.vExag;
    if (this.marker.visible) this.marker.scale.set(8 * wpp, (8 * wpp) / k, 8 * wpp);
    if (this.cross.visible) this.cross.scale.set(9 * wpp, (9 * wpp) / k, 9 * wpp);
  }

  /** Click pick with a pixel-true tolerance: nearest entity outline to the
   *  cursor in UCS-local space. Deterministic 2D math — deliberately NOT
   *  three.js raycasting (entities live on camera layer 3 and Line2 raycast
   *  semantics vary by renderer). Hidden layers never pick. */
  pickEntity(vp: Viewport): CadEntity | null {
    const x = this.pointer.rawLocal.x;
    const y = this.pointer.rawLocal.y;
    let bestD = 8 * this.host.vpm.worldPerPixel(vp);
    let best: CadEntity | null = null;
    for (const ent of this.host.store.entities) {
      if (!ent.object3D.visible || !ent.nearPoint(x, y, bestD)) continue;
      const d = ent.hitDistance(x, y);
      if (d <= bestD) {
        bestD = d;
        best = ent;
      }
    }
    return best;
  }

  /** Unproject an arbitrary screen point onto the drafting plane. */
  localAtScreen(vp: Viewport, clientX: number, clientY: number, out: THREE.Vector3): boolean {
    this.host.vpm.ndcInto(vp, clientX, clientY, _ndc);
    this.raycaster.setFromCamera(_ndc, vp.camera);
    if (!this.raycaster.ray.intersectPlane(this.host.ucs.plane, out)) return false;
    if (this.host.ucs.defined) {
      this.host.ucs.worldToLocal(out, out);
      out.z = 0;
    }
    return true;
  }
}

// ------------------------------------------------------- workflow tools --

/** Top-down lasso fence: filters the cloud to one working area (GPU-side). */
class IsolateTool extends CadTool {
  readonly id = 'isolate';
  readonly hint = 'ШАГ 1/3 · УЧАСТОК — обведите участок контуром на плане: ЛКМ вершины · Enter/ПКМ применить · Esc сброс';
  private readonly pts: THREE.Vector3[] = [];
  private readonly rb: RubberBand;

  constructor(host: ToolHost, mgr: ToolManager) {
    super(host, mgr);
    this.rb = new RubberBand(host.scene, 0xf59e0b); // world-space overlay
  }

  override activate(): void {
    this.host.enterTopView();
  }

  override deactivate(): void {
    this.reset();
  }

  private reset(): void {
    this.pts.length = 0;
    this.rb.hide();
  }

  override onDown(p: DraftPointer): void {
    if (this.pts.length < MAX_LASSO_VERTS) this.pts.push(p.world.clone());
    this.rb.setPath(this.pts, undefined, true);
  }

  override onMove(p: DraftPointer): void {
    if (this.pts.length) this.rb.setPath(this.pts, p.world, true);
  }

  override onFinish(): void {
    if (this.pts.length < 3) return;
    this.host.applyLasso(this.pts);
    this.reset();
    this.mgr.activate('ucs'); // next step of the natural workflow
  }

  override onKey(e: KeyboardEvent): boolean {
    if (e.key === 'Escape') {
      this.reset();
      this.host.clearLasso();
      return true;
    }
    return false;
  }
}

/** Two clicks in plan define the axis UCS: X along the trace, Y across
 *  it, Z up. Both cuts are then taken in these axes. */
class UcsTool extends CadTool {
  readonly id = 'ucs';
  readonly hint = 'ШАГ 2/3 · ОСЬ — кликните 2 точки вдоль трассы (ось X пойдёт по ним, поперечник встанет к ней перпендикулярно) · Esc заново';
  private hasFirst = false;
  private readonly p1 = new THREE.Vector3();
  private readonly seg: THREE.Vector3[];
  private readonly rb: RubberBand;

  constructor(host: ToolHost, mgr: ToolManager) {
    super(host, mgr);
    this.seg = [this.p1];
    this.rb = new RubberBand(host.scene, 0xa78bfa);
  }

  override activate(): void {
    this.host.enterTopView();
    this.hasFirst = false;
  }

  override deactivate(): void {
    this.hasFirst = false;
    this.rb.hide();
  }

  override onDown(p: DraftPointer): void {
    // Prefer the real scan: nearest cloud point to the click ray.
    const picked = this.host.pickCloudPoint(this.mgr.ray, _pick) ? _pick : p.world;
    if (!this.hasFirst) {
      this.p1.copy(picked);
      this.hasFirst = true;
    } else {
      this.host.defineUcs(this.p1, picked);
      this.hasFirst = false;
      this.rb.hide();
      this.mgr.activate('polyline');
    }
  }

  override onMove(p: DraftPointer): void {
    if (this.hasFirst) this.rb.setPath(this.seg, p.world);
  }

  override onKey(e: KeyboardEvent): boolean {
    if (e.key === 'Escape') {
      this.hasFirst = false;
      this.rb.hide();
      return true;
    }
    return false;
  }
}

// ------------------------------------------------------- drafting tools --

class LineTool extends CadTool {
  readonly id = 'line';
  readonly hint = 'ОТРЕЗОК — две точки; длину можно ввести цифрами (мышь задаёт направление) · Esc отмена';
  private hasA = false;
  private readonly a = new THREE.Vector3();
  private readonly seg: THREE.Vector3[];
  private readonly rb: RubberBand;

  constructor(host: ToolHost, mgr: ToolManager) {
    super(host, mgr);
    this.seg = [this.a];
    this.rb = new RubberBand(host.ucs.group, 0x8b9cf9);
  }

  override activate(): void {
    this.host.enterDraftView();
  }

  override deactivate(): void {
    this.hasA = false;
    this.rb.hide();
  }

  override onDown(p: DraftPointer): void {
    if (!this.hasA) {
      this.a.copy(p.local);
      this.hasA = true;
      return;
    }
    this.host.snapshot();
    this.host.store.add(new PolylineEntity([this.a, p.local], false));
    this.hasA = false;
    this.rb.hide();
    this.mgr.activate('select'); // command done → back to selection
  }

  override onMove(p: DraftPointer): void {
    if (this.hasA) this.rb.setPath(this.seg, p.local);
  }

  override onKey(e: KeyboardEvent): boolean {
    if (e.key === 'Escape') {
      this.hasA = false;
      this.rb.hide();
      return true;
    }
    return false;
  }

  override getOrthoAnchor(): THREE.Vector3 | null {
    return this.hasA ? this.a : null;
  }
}

class PolylineTool extends CadTool {
  readonly id = 'polyline';
  readonly hint = 'ПОЛИЛИНИЯ — ЛКМ точки по плану (бровка, кромка, горизонталь) · Enter/ПКМ завершить · C замкнуть · Esc отмена';
  private readonly pts: THREE.Vector3[] = [];
  private readonly rb: RubberBand;

  constructor(host: ToolHost, mgr: ToolManager) {
    super(host, mgr);
    this.rb = new RubberBand(host.ucs.group, 0x8b9cf9); // local-space preview
  }

  override activate(): void {
    this.host.enterDraftView();
  }

  override deactivate(): void {
    this.reset();
  }

  private reset(): void {
    this.pts.length = 0;
    this.rb.hide();
  }

  override onDown(p: DraftPointer): void {
    this.pts.push(p.local.clone());
    this.rb.setPath(this.pts, p.local);
  }

  override onMove(p: DraftPointer): void {
    if (this.pts.length) this.rb.setPath(this.pts, p.local);
  }

  override onFinish(): void {
    this.commit(false);
  }

  private commit(closed: boolean): void {
    const ok = this.pts.length >= (closed ? 3 : 2);
    if (ok) {
      this.host.snapshot();
      this.host.store.add(new PolylineEntity(this.pts, closed));
    }
    this.reset();
    if (ok) this.mgr.activate('select');
  }

  override onKey(e: KeyboardEvent): boolean {
    if (e.key === 'c' || e.key === 'C' || e.key === 'с' || e.key === 'С') {
      this.commit(true);
      return true;
    }
    if (e.key === 'Escape') {
      this.reset();
      return true;
    }
    return false;
  }

  override getOrthoAnchor(): THREE.Vector3 | null {
    return this.pts.length ? this.pts[this.pts.length - 1] : null;
  }
}

class RectangleTool extends CadTool {
  readonly id = 'rect';
  readonly hint = 'ПРЯМОУГОЛЬНИК — два клика по диагонали; размеры цифрами: ширина,высота · Esc отмена';
  private hasA = false;
  private readonly a = new THREE.Vector3();
  private readonly rb: RubberBand;

  constructor(host: ToolHost, mgr: ToolManager) {
    super(host, mgr);
    this.rb = new RubberBand(host.ucs.group, 0x8b9cf9);
  }

  override activate(): void {
    this.host.enterDraftView();
  }

  override deactivate(): void {
    this.hasA = false;
    this.rb.hide();
  }

  override onDown(p: DraftPointer): void {
    if (!this.hasA) {
      this.a.copy(p.local);
      this.hasA = true;
      return;
    }
    _rect[0].set(this.a.x, this.a.y, 0);
    _rect[1].set(p.local.x, this.a.y, 0);
    _rect[2].set(p.local.x, p.local.y, 0);
    _rect[3].set(this.a.x, p.local.y, 0);
    this.host.snapshot();
    this.host.store.add(new PolylineEntity(_rect, true));
    this.hasA = false;
    this.rb.hide();
    this.mgr.activate('select');
  }

  override onMove(p: DraftPointer): void {
    if (this.hasA) this.rb.setRect(this.a, p.local);
  }

  override onKey(e: KeyboardEvent): boolean {
    if (e.key === 'Escape') {
      this.hasA = false;
      this.rb.hide();
      return true;
    }
    return false;
  }

  override getDynamicAnchor(): THREE.Vector3 | null {
    return this.hasA ? this.a : null;
  }
}

class CircleTool extends CadTool {
  readonly id = 'circle';
  readonly hint = 'ОКРУЖНОСТЬ — клик центр, затем точка радиуса (или радиус цифрами) · Esc отмена';
  private hasCenter = false;
  private readonly center = new THREE.Vector3();
  private readonly rb: RubberBand;

  constructor(host: ToolHost, mgr: ToolManager) {
    super(host, mgr);
    this.rb = new RubberBand(host.ucs.group, 0x8b9cf9);
  }

  override activate(): void {
    this.host.enterDraftView();
  }

  override deactivate(): void {
    this.hasCenter = false;
    this.rb.hide();
  }

  override onDown(p: DraftPointer): void {
    if (!this.hasCenter) {
      this.center.copy(p.local);
      this.hasCenter = true;
      return;
    }
    this.commit(Math.hypot(p.local.x - this.center.x, p.local.y - this.center.y));
  }

  private commit(r: number): void {
    const ok = r > 1e-4;
    if (ok) {
      this.host.snapshot();
      this.host.store.add(new CircleEntity(this.center, r));
    }
    this.hasCenter = false;
    this.rb.hide();
    if (ok) this.mgr.activate('select');
  }

  override onNumeric(v: number): boolean {
    if (!this.hasCenter) return false;
    this.commit(Math.abs(v));
    return true;
  }

  override onMove(p: DraftPointer): void {
    if (this.hasCenter) this.rb.setCircle(this.center, Math.hypot(p.local.x - this.center.x, p.local.y - this.center.y));
  }

  override onKey(e: KeyboardEvent): boolean {
    if (e.key === 'Escape') {
      this.hasCenter = false;
      this.rb.hide();
      return true;
    }
    return false;
  }

  override getOrthoAnchor(): THREE.Vector3 | null {
    return this.hasCenter ? this.center : null;
  }
}

class ArcTool extends CadTool {
  readonly id = 'arc';
  readonly hint = 'ДУГА — три точки: начало, точка на дуге, конец · Esc отмена';
  private stage = 0;
  private readonly p1 = new THREE.Vector3();
  private readonly p2 = new THREE.Vector3();
  private readonly path: THREE.Vector3[];
  private readonly seg1: THREE.Vector3[];
  private readonly rb: RubberBand;

  constructor(host: ToolHost, mgr: ToolManager) {
    super(host, mgr);
    this.path = [this.p1, this.p2];
    this.seg1 = [this.p1];
    this.rb = new RubberBand(host.ucs.group, 0x8b9cf9);
  }

  override activate(): void {
    this.host.enterDraftView();
  }

  override deactivate(): void {
    this.reset();
  }

  private reset(): void {
    this.stage = 0;
    this.rb.hide();
  }

  override onDown(p: DraftPointer): void {
    if (this.stage === 0) {
      this.p1.copy(p.local);
      this.stage = 1;
    } else if (this.stage === 1) {
      this.p2.copy(p.local);
      this.stage = 2;
    } else {
      const ok = arcFrom3(this.p1, this.p2, p.local);
      if (ok) {
        this.host.snapshot();
        this.host.store.add(new ArcEntity(_cc, _arc.r, _arc.a0, _arc.sweep));
      }
      this.reset();
      if (ok) this.mgr.activate('select');
    }
  }

  override onMove(p: DraftPointer): void {
    if (this.stage === 1) {
      this.rb.setPath(this.seg1, p.local);
    } else if (this.stage === 2) {
      if (arcFrom3(this.p1, this.p2, p.local)) this.rb.setArc(_cc.x, _cc.y, _arc.r, _arc.a0, _arc.sweep);
      else this.rb.setPath(this.path, p.local);
    }
  }

  override onKey(e: KeyboardEvent): boolean {
    if (e.key === 'Escape') {
      this.reset();
      return true;
    }
    return false;
  }

  override getOrthoAnchor(): THREE.Vector3 | null {
    return this.stage === 1 ? this.p1 : null;
  }
}

class EllipseTool extends CadTool {
  readonly id = 'ellipse';
  readonly hint = 'ЭЛЛИПС — клик центр, затем угловая точка; полуоси цифрами: rx,ry · Esc отмена';
  private hasCenter = false;
  private readonly center = new THREE.Vector3();
  private readonly rb: RubberBand;

  constructor(host: ToolHost, mgr: ToolManager) {
    super(host, mgr);
    this.rb = new RubberBand(host.ucs.group, 0x8b9cf9);
  }

  override activate(): void {
    this.host.enterDraftView();
  }

  override deactivate(): void {
    this.hasCenter = false;
    this.rb.hide();
  }

  override onDown(p: DraftPointer): void {
    if (!this.hasCenter) {
      this.center.copy(p.local);
      this.hasCenter = true;
      return;
    }
    const rx = Math.abs(p.local.x - this.center.x);
    const ry = Math.abs(p.local.y - this.center.y);
    const ok = rx > 1e-4 && ry > 1e-4;
    if (ok) {
      this.host.snapshot();
      this.host.store.add(new EllipseEntity(this.center, rx, ry, 0));
    }
    this.hasCenter = false;
    this.rb.hide();
    if (ok) this.mgr.activate('select');
  }

  override onMove(p: DraftPointer): void {
    if (this.hasCenter) this.rb.setEllipse(this.center, Math.abs(p.local.x - this.center.x), Math.abs(p.local.y - this.center.y));
  }

  override onKey(e: KeyboardEvent): boolean {
    if (e.key === 'Escape') {
      this.hasCenter = false;
      this.rb.hide();
      return true;
    }
    return false;
  }

  override getDynamicAnchor(): THREE.Vector3 | null {
    return this.hasCenter ? this.center : null;
  }
}

class TextTool extends CadTool {
  readonly id = 'text';
  readonly hint = 'ТЕКСТ — кликните точку вставки и введите надпись';

  override activate(): void {
    this.host.enterDraftView();
  }

  override onDown(p: DraftPointer): void {
    // window.prompt is deliberate prototype minimalism — swap for an
    // inline floating input when the UI grows an edit layer.
    const text = window.prompt('Текст надписи:');
    if (text && text.trim()) {
      this.host.snapshot();
      this.host.store.add(new TextEntity(p.local, text.trim(), 1.2)); // terrain scale
      this.mgr.activate('select');
    }
  }
}

/** Plain survey point. */
class PointTool extends CadTool {
  readonly id = 'point';
  readonly hint = 'ТОЧКА — кликните место; привязка ловит точку скана · Esc выход';

  override activate(): void {
    this.host.enterDraftView();
  }

  override onDown(p: DraftPointer): void {
    this.host.snapshot();
    this.host.store.add(new PointEntity(p.local));
  }
}

/** Pick the datum for elevation labels: a horizontal plane through the
 *  picked scan point, so "zero" is a real place on the ground rather than
 *  an abstract offset. Without it the datum is the cloud's own zero. */
class RefPlaneTool extends CadTool {
  readonly id = 'refplane';
  readonly hint = 'ГОРИЗОНТ — кликните точку земли: её отметка станет нулём для подписей превышений';

  override onDown(): void {
    if (this.host.setDeviationRef(this.mgr.ray)) this.mgr.activate('deviation');
  }
}

/** Elevation of a ground point relative to the datum, written next to the
 *  marker. Plus = above the datum, minus = below it. */
class DeviationTool extends CadTool {
  readonly id = 'deviation';
  readonly hint = 'ОТМЕТКА — кликайте точки земли: рядом появится подпись + выше / − ниже горизонта · Esc выход';

  override activate(): void {
    this.host.enterDraftView();
    if (this.host.deviationRef === null) {
      this.host.ui.setHint('Сначала задайте горизонт: инструмент ГОРИЗОНТ, клик по земле');
      this.mgr.activate('refplane');
    }
  }

  override onDown(p: DraftPointer): void {
    const ref = this.host.deviationRef;
    if (ref === null) return;
    // p.snapLocal carries the REAL scan elevation; with no snap there is no
    // measured surface under the cursor and nothing to report.
    if (!p.snapped) {
      this.host.ui.setHint('Нет точки скана под курсором — включите привязку (S) и целься в облако');
      return;
    }
    const dev = p.snapLocal.z - ref;
    const txt = (dev >= 0 ? '+' : '−') + Math.abs(dev).toFixed(3);
    this.host.snapshot();
    this.host.store.add(new PointEntity(p.local, txt, dev));
  }
}

// --------------------------------------------------- modification tools --

class SelectTool extends CadTool {
  readonly id = 'select';
  readonly hint = 'ВЫБОР — клик по объекту · Ctrl/Shift+клик добавить/убрать · рамка слева-направо целиком, справа-налево секущая · Del удалить';
  private down = false;
  private dragged = false;
  private downX = 0;
  private downY = 0;
  private hit: CadEntity | null = null;

  override activate(): void {
    this.host.enterDraftView();
  }

  override deactivate(): void {
    this.down = false;
    this.host.ui.hideMarquee();
  }

  override onDown(p: DraftPointer, e: PointerEvent): void {
    this.down = true;
    this.dragged = false;
    this.downX = p.clientX;
    this.downY = p.clientY;
    this.hit = this.mgr.viewport ? this.mgr.pickEntity(this.mgr.viewport) : null;
    if (this.hit) {
      if (e.shiftKey || e.ctrlKey) this.host.store.toggle(this.hit);
      else this.host.store.select(this.hit, false);
    }
  }

  override onMove(p: DraftPointer): void {
    if (!this.down || this.hit) return;
    const dx = p.clientX - this.downX;
    const dy = p.clientY - this.downY;
    if (Math.abs(dx) + Math.abs(dy) > 4) {
      this.dragged = true;
      // AutoCAD colors: L→R window = blue/solid, R→L crossing = green/dashed.
      this.host.ui.showMarquee(Math.min(this.downX, p.clientX), Math.min(this.downY, p.clientY), Math.abs(dx), Math.abs(dy), dx < 0);
    }
  }

  override onUp(p: DraftPointer, e: PointerEvent): void {
    if (!this.down) return;
    this.down = false;
    this.host.ui.hideMarquee();
    if (this.hit) {
      this.hit = null;
      return;
    }
    if (!this.dragged) {
      if (!e.shiftKey && !e.ctrlKey) this.host.store.clearSelection();
      return;
    }
    const vp = this.mgr.viewport;
    if (!vp || !this.mgr.localAtScreen(vp, this.downX, this.downY, _a)) return;
    _b.copy(p.rawLocal);
    const crossing = p.clientX < this.downX; // AutoCAD: R→L drag = crossing
    _min2.set(Math.min(_a.x, _b.x), Math.min(_a.y, _b.y));
    _max2.set(Math.max(_a.x, _b.x), Math.max(_a.y, _b.y));
    if (!e.shiftKey && !e.ctrlKey) this.host.store.clearSelection();
    for (const ent of this.host.store.entities) {
      if (!ent.object3D.visible) continue; // hidden layer — not selectable
      if (crossing ? ent.intersectsRect(_min2, _max2) : ent.withinRect(_min2, _max2)) {
        this.host.store.select(ent, true);
      }
    }
  }

  override onKey(e: KeyboardEvent): boolean {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (this.host.store.selection.size) {
        this.host.snapshot();
        this.host.store.deleteSelected();
      }
      return true;
    }
    if (e.key === 'Escape') {
      this.host.store.clearSelection();
      return true;
    }
    return false;
  }
}

/** Shared base for tools that operate on the current selection. */
abstract class BaseEditTool extends CadTool {
  override activate(): void {
    this.host.enterDraftView();
  }

  /** Allow picking an object directly when nothing is selected yet. */
  protected ensureSelection(e: PointerEvent): boolean {
    if (this.host.store.selection.size) return true;
    const ent = this.mgr.viewport ? this.mgr.pickEntity(this.mgr.viewport) : null;
    if (ent) {
      this.host.store.select(ent, e.shiftKey);
    } else {
      this.host.ui.setHint('Ничего не выбрано — сначала кликните объект, затем базовую точку');
    }
    return false;
  }
}

class MoveTool extends BaseEditTool {
  readonly id: string = 'move';
  readonly hint: string = 'ПЕРЕНОС — клик базовая точка, затем целевая; расстояние можно ввести цифрами · Esc отмена';
  protected picking = false;
  protected readonly base = new THREE.Vector3();

  override deactivate(): void {
    this.cancel();
  }

  override onDown(p: DraftPointer, e: PointerEvent): void {
    if (!this.ensureSelection(e)) return;
    if (!this.picking) {
      this.base.copy(p.local);
      this.picking = true;
      this.onArmed();
    } else {
      this.place(p);
    }
  }

  protected onArmed(): void {}

  protected place(p: DraftPointer): void {
    _delta.subVectors(p.local, this.base);
    this.host.snapshot();
    for (const ent of this.host.store.selection) {
      ent.clearPreview();
      ent.translate(_delta);
    }
    this.picking = false;
  }

  override onMove(p: DraftPointer): void {
    if (!this.picking) return;
    _delta.subVectors(p.local, this.base);
    this.preview(_delta);
  }

  protected preview(delta: THREE.Vector3): void {
    for (const ent of this.host.store.selection) ent.setPreviewOffset(delta);
  }

  protected cancel(): void {
    if (this.picking) {
      for (const ent of this.host.store.selection) ent.clearPreview();
    }
    this.picking = false;
  }

  override onKey(e: KeyboardEvent): boolean {
    if (e.key === 'Escape') {
      this.cancel();
      return true;
    }
    return false;
  }

  override getOrthoAnchor(): THREE.Vector3 | null {
    return this.picking ? this.base : null;
  }
}

class CopyTool extends MoveTool {
  override readonly id: string = 'copy';
  override readonly hint: string = 'КОПИЯ — базовая точка, затем каждый клик ставит копию · Esc завершить';
  private ghost: THREE.Group | null = null;

  protected override onArmed(): void {
    this.ghost = makeGhostGroup(this.host.store.selection, this.host.ucs.group);
  }

  protected override place(p: DraftPointer): void {
    _delta.subVectors(p.local, this.base);
    this.host.snapshot();
    for (const ent of this.host.store.selection) this.host.store.add(ent.makeCopy(_delta));
    // stay armed: multi-copy until Esc
  }

  protected override preview(delta: THREE.Vector3): void {
    if (this.ghost) this.ghost.position.set(delta.x, delta.y, 0);
  }

  protected override cancel(): void {
    if (this.ghost) {
      this.host.ucs.group.remove(this.ghost);
      this.ghost = null;
    }
    this.picking = false;
  }
}

class RotateTool extends BaseEditTool {
  readonly id = 'rotate';
  readonly hint = 'ПОВОРОТ — клик базовая точка, затем угол мышью или цифрами в градусах · Esc отмена';
  override readonly numericSuffix = '°';
  private picking = false;
  private readonly pivot = new THREE.Vector3();

  override deactivate(): void {
    this.cancel();
  }

  override onDown(p: DraftPointer, e: PointerEvent): void {
    if (!this.ensureSelection(e)) return;
    if (!this.picking) {
      this.pivot.copy(p.local);
      this.picking = true;
    } else {
      this.commit(Math.atan2(p.local.y - this.pivot.y, p.local.x - this.pivot.x));
    }
  }

  override onMove(p: DraftPointer): void {
    if (!this.picking) return;
    const theta = Math.atan2(p.local.y - this.pivot.y, p.local.x - this.pivot.x);
    for (const ent of this.host.store.selection) ent.setPreviewTransform(theta, 1, 1, this.pivot);
  }

  override onNumeric(v: number): boolean {
    if (!this.picking) return false;
    this.commit((v * Math.PI) / 180);
    return true;
  }

  private commit(theta: number): void {
    this.host.snapshot();
    for (const ent of this.host.store.selection) {
      ent.clearPreview();
      ent.rotateAround(this.pivot, theta);
    }
    this.picking = false;
  }

  private cancel(): void {
    if (this.picking) {
      for (const ent of this.host.store.selection) ent.clearPreview();
    }
    this.picking = false;
  }

  override onKey(e: KeyboardEvent): boolean {
    if (e.key === 'Escape') {
      this.cancel();
      return true;
    }
    return false;
  }

  override getDynamicAnchor(): THREE.Vector3 | null {
    return this.picking ? this.pivot : null;
  }
}

class ScaleTool extends BaseEditTool {
  readonly id = 'scale';
  readonly hint = 'МАСШТАБ — клик базовая точка, затем коэффициент мышью (1 м = ×1) или цифрами · Esc отмена';
  override readonly numericSuffix = '×';
  private picking = false;
  private readonly pivot = new THREE.Vector3();

  override deactivate(): void {
    this.cancel();
  }

  override onDown(p: DraftPointer, e: PointerEvent): void {
    if (!this.ensureSelection(e)) return;
    if (!this.picking) {
      this.pivot.copy(p.local);
      this.picking = true;
    } else {
      this.commit(Math.hypot(p.local.x - this.pivot.x, p.local.y - this.pivot.y));
    }
  }

  override onMove(p: DraftPointer): void {
    if (!this.picking) return;
    const f = Math.hypot(p.local.x - this.pivot.x, p.local.y - this.pivot.y);
    if (f > 1e-4) {
      for (const ent of this.host.store.selection) ent.setPreviewTransform(0, f, f, this.pivot);
    }
  }

  override onNumeric(v: number): boolean {
    if (!this.picking) return false;
    this.commit(Math.abs(v));
    return true;
  }

  private commit(f: number): void {
    if (f > 1e-4) {
      this.host.snapshot();
      for (const ent of this.host.store.selection) {
        ent.clearPreview();
        ent.scaleAround(this.pivot, f);
      }
    } else {
      this.cancel();
    }
    this.picking = false;
  }

  private cancel(): void {
    if (this.picking) {
      for (const ent of this.host.store.selection) ent.clearPreview();
    }
    this.picking = false;
  }

  override onKey(e: KeyboardEvent): boolean {
    if (e.key === 'Escape') {
      this.cancel();
      return true;
    }
    return false;
  }

  override getDynamicAnchor(): THREE.Vector3 | null {
    return this.picking ? this.pivot : null;
  }
}

class MirrorTool extends BaseEditTool {
  readonly id = 'mirror';
  readonly hint = 'ЗЕРКАЛО — две точки оси отражения; создаётся зеркальная копия · Esc отмена';
  private hasP1 = false;
  private readonly p1 = new THREE.Vector3();
  private ghost: THREE.Group | null = null;

  override deactivate(): void {
    this.cancel();
  }

  override onDown(p: DraftPointer, e: PointerEvent): void {
    if (!this.ensureSelection(e)) return;
    if (!this.hasP1) {
      this.p1.copy(p.local);
      this.hasP1 = true;
      this.ghost = makeGhostGroup(this.host.store.selection, this.host.ucs.group);
    } else {
      this.commit(Math.atan2(p.local.y - this.p1.y, p.local.x - this.p1.x));
    }
  }

  override onMove(p: DraftPointer): void {
    if (!this.hasP1 || !this.ghost) return;
    const phi = Math.atan2(p.local.y - this.p1.y, p.local.x - this.p1.x);
    // Reflection = R(2φ)·S(1,−1) on the ghost group, anchored at p1.
    const c = Math.cos(2 * phi);
    const s = Math.sin(2 * phi);
    this.ghost.rotation.z = 2 * phi;
    this.ghost.scale.set(1, -1, 1);
    this.ghost.position.set(this.p1.x - (c * this.p1.x + s * this.p1.y), this.p1.y - (s * this.p1.x - c * this.p1.y), 0);
  }

  private commit(phi: number): void {
    this.host.snapshot();
    for (const ent of this.host.store.selection) {
      const copy = ent.makeCopy(_zero);
      copy.mirrorAcross(this.p1, phi);
      this.host.store.add(copy);
    }
    this.cancel();
  }

  private cancel(): void {
    if (this.ghost) {
      this.host.ucs.group.remove(this.ghost);
      this.ghost = null;
    }
    this.hasP1 = false;
  }

  override onKey(e: KeyboardEvent): boolean {
    if (e.key === 'Escape') {
      this.cancel();
      return true;
    }
    return false;
  }

  override getDynamicAnchor(): THREE.Vector3 | null {
    return this.hasP1 ? this.p1 : null;
  }
}

// ----------------------------------------------------------- trim / join --

interface PolyHit {
  ent: PolylineEntity;
  u: number; // arc-length param: segment index + t
  d2: number;
}

/** Nearest polyline (by perpendicular distance to its segments). */
function pickPolylineAt(entities: readonly CadEntity[], x: number, y: number, tol: number): PolyHit | null {
  let best: PolyHit | null = null;
  for (const ent of entities) {
    if (!(ent instanceof PolylineEntity) || !ent.object3D.visible) continue;
    const pts = ent.points;
    const segs = ent.closed ? pts.length : pts.length - 1;
    for (let s = 0; s < segs; s++) {
      const a = pts[s];
      const b = pts[(s + 1) % pts.length];
      const abx = b.x - a.x;
      const aby = b.y - a.y;
      const len2 = abx * abx + aby * aby;
      let t = len2 > 0 ? ((x - a.x) * abx + (y - a.y) * aby) / len2 : 0;
      t = Math.max(0, Math.min(1, t));
      const dx = a.x + abx * t - x;
      const dy = a.y + aby * t - y;
      const dd = dx * dx + dy * dy;
      if (dd <= tol * tol && (!best || dd < best.d2)) best = { ent, u: s + t, d2: dd };
    }
  }
  return best;
}

/** Param t on AB of the AB×CD intersection, or -1. */
function segSegT(ax: number, ay: number, bx: number, by: number, cx: number, cy: number, dx: number, dy: number): number {
  const rX = bx - ax;
  const rY = by - ay;
  const sX = dx - cx;
  const sY = dy - cy;
  const denom = rX * sY - rY * sX;
  if (Math.abs(denom) < 1e-12) return -1;
  const t = ((cx - ax) * sY - (cy - ay) * sX) / denom;
  const u = ((cx - ax) * rY - (cy - ay) * rX) / denom;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1 ? t : -1;
}

/** Params on AB where it crosses the circle (c, r). */
function segCircleTs(ax: number, ay: number, bx: number, by: number, cx: number, cy: number, r: number, out: number[]): void {
  const dxx = bx - ax;
  const dyy = by - ay;
  const fx = ax - cx;
  const fy = ay - cy;
  const qa = dxx * dxx + dyy * dyy;
  const qb = 2 * (fx * dxx + fy * dyy);
  const qc = fx * fx + fy * fy - r * r;
  const disc = qb * qb - 4 * qa * qc;
  if (disc < 0 || qa < 1e-12) return;
  const sq = Math.sqrt(disc);
  const t1 = (-qb - sq) / (2 * qa);
  const t2 = (-qb + sq) / (2 * qa);
  if (t1 >= 0 && t1 <= 1) out.push(t1);
  if (t2 >= 0 && t2 <= 1 && Math.abs(t2 - t1) > 1e-9) out.push(t2);
}

function angleOnArc(arc: ArcEntity, x: number, y: number): boolean {
  const c = arc.points[0];
  let rel = Math.atan2(y - c.y, x - c.x) - arc.a0;
  const TWO_PI = Math.PI * 2;
  rel = ((rel % TWO_PI) + TWO_PI) % TWO_PI;
  return arc.sweep >= 0 ? rel <= arc.sweep + 1e-6 : rel - TWO_PI >= arc.sweep - 1e-6;
}

/** All params where `target` is crossed by other linework, sorted. */
function cutParams(target: PolylineEntity, entities: readonly CadEntity[]): number[] {
  const res: number[] = [];
  const tmp: number[] = [];
  const pts = target.points;
  const segs = target.closed ? pts.length : pts.length - 1;
  for (let s = 0; s < segs; s++) {
    const a = pts[s];
    const b = pts[(s + 1) % pts.length];
    for (const o of entities) {
      if (o === target) continue;
      if (o instanceof PolylineEntity) {
        const op = o.points;
        const os = o.closed ? op.length : op.length - 1;
        for (let k = 0; k < os; k++) {
          const t = segSegT(a.x, a.y, b.x, b.y, op[k].x, op[k].y, op[(k + 1) % op.length].x, op[(k + 1) % op.length].y);
          if (t >= 0) res.push(s + t);
        }
      } else if (o instanceof CircleEntity || o instanceof ArcEntity) {
        tmp.length = 0;
        const c = o.points[0];
        segCircleTs(a.x, a.y, b.x, b.y, c.x, c.y, o.radius, tmp);
        for (const t of tmp) {
          if (o instanceof ArcEntity && !angleOnArc(o, a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t)) continue;
          res.push(s + t);
        }
      }
    }
  }
  res.sort((p, q) => p - q);
  return res;
}

/** Vertices of the polyline between params u0..u1 (u may wrap for closed). */
function subPath(pts: readonly THREE.Vector3[], u0: number, u1: number): THREE.Vector3[] {
  const n = pts.length;
  const res: THREE.Vector3[] = [];
  const push = (x: number, y: number) => {
    const l = res[res.length - 1];
    if (!l || (l.x - x) * (l.x - x) + (l.y - y) * (l.y - y) > 1e-12) res.push(new THREE.Vector3(x, y, 0));
  };
  const at = (u: number) => {
    const s = Math.floor(u);
    const t = u - s;
    const a = pts[((s % n) + n) % n];
    const b = pts[(((s + 1) % n) + n) % n];
    push(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
  };
  at(u0);
  for (let k = Math.floor(u0) + 1; k < u1 - 1e-9; k++) {
    const v = pts[((k % n) + n) % n];
    push(v.x, v.y);
  }
  at(u1);
  return res;
}

/** AutoCAD-style TRIM: click the portion to remove — it is cut back to the
 *  nearest intersections with other linework (or to the free end). */
class TrimTool extends CadTool {
  readonly id = 'trim';
  readonly hint = 'НОЖНИЦЫ — кликните участок линии между пересечениями, он будет вырезан · Esc выход';

  override activate(): void {
    this.host.enterDraftView();
  }

  override onDown(p: DraftPointer): void {
    const vp = this.mgr.viewport;
    if (!vp) return;
    const tol = 8 * this.host.vpm.worldPerPixel(vp);
    const hit = pickPolylineAt(this.host.store.entities, p.rawLocal.x, p.rawLocal.y, tol);
    if (!hit) return;
    const ent = hit.ent;
    const pts = ent.points;
    const segs = ent.closed ? pts.length : pts.length - 1;
    const cuts = cutParams(ent, this.host.store.entities).filter((u) => Math.abs(u - hit.u) > 1e-6);
    let lo = -Infinity;
    let hi = Infinity;
    for (const u of cuts) {
      if (u < hit.u && u > lo) lo = u;
      if (u > hit.u && u < hi) hi = u;
    }
    this.host.snapshot();
    if (!ent.closed) {
      const a = lo === -Infinity ? 0 : lo;
      const b = hi === Infinity ? segs : hi;
      const partA = a > 1e-9 ? subPath(pts, 0, a) : null;
      const partB = b < segs - 1e-9 ? subPath(pts, b, segs) : null;
      const srcLayer = ent.layer;
      this.host.store.remove(ent);
      for (const part of [partA, partB]) {
        if (part && part.length >= 2) {
          const pe = new PolylineEntity(part, false);
          pe.layer = srcLayer; // trimmed pieces stay on the source layer
          this.host.store.add(pe);
        }
      }
    } else if (!cuts.length) {
      this.host.store.remove(ent); // nothing to cut back to — erase the loop
    } else {
      let a = lo === -Infinity ? cuts[cuts.length - 1] : lo;
      const b = hi === Infinity ? cuts[0] + segs : hi;
      if (a <= b) a += segs; // walk forward b → a around the loop
      const rest = subPath(pts, b, a);
      const srcLayer = ent.layer;
      this.host.store.remove(ent);
      if (rest.length >= 2) {
        const pe = new PolylineEntity(rest, false);
        pe.layer = srcLayer;
        this.host.store.add(pe);
      }
    }
    this.host.ui.setHint('Вырезано — кликните следующий участок или Esc');
  }
}

/** JOIN: merge two open polylines whose ends coincide. */
class JoinTool extends CadTool {
  readonly id = 'join';
  readonly hint = 'СОЕДИНИТЬ — кликните первую линию, затем вторую (их концы должны совпадать)';
  private first: PolylineEntity | null = null;

  override activate(): void {
    this.host.enterDraftView();
    this.first = null;
  }

  override deactivate(): void {
    this.first = null;
  }

  override onDown(p: DraftPointer): void {
    const vp = this.mgr.viewport;
    if (!vp) return;
    const tol = 8 * this.host.vpm.worldPerPixel(vp);
    const hit = pickPolylineAt(this.host.store.entities, p.rawLocal.x, p.rawLocal.y, tol);
    if (!hit) return;
    if (hit.ent.closed) {
      this.host.ui.setHint('Замкнутый контур соединять нельзя');
      return;
    }
    if (!this.first) {
      this.first = hit.ent;
      this.host.store.select(hit.ent, false);
      return;
    }
    if (hit.ent === this.first) return;
    this.join(this.first, hit.ent, 12 * this.host.vpm.worldPerPixel(vp));
    this.first = null;
  }

  private join(a: PolylineEntity, b: PolylineEntity, tol: number): void {
    const dd = (p: THREE.Vector3, q: THREE.Vector3) => (p.x - q.x) * (p.x - q.x) + (p.y - q.y) * (p.y - q.y);
    const a0 = a.points[0];
    const a1 = a.points[a.points.length - 1];
    const b0 = b.points[0];
    const b1 = b.points[b.points.length - 1];
    const combos: { d: number; pts: () => THREE.Vector3[] }[] = [
      { d: dd(a1, b0), pts: () => [...a.points, ...b.points.slice(1)] },
      { d: dd(a1, b1), pts: () => [...a.points, ...[...b.points].reverse().slice(1)] },
      { d: dd(a0, b0), pts: () => [...[...a.points].reverse(), ...b.points.slice(1)] },
      { d: dd(a0, b1), pts: () => [...b.points, ...a.points.slice(1)] },
    ];
    combos.sort((x, y) => x.d - y.d);
    if (combos[0].d > tol * tol) {
      this.host.ui.setHint('Концы не совпадают — линии не соединены');
      return;
    }
    const pts = combos[0].pts();
    let closed = false;
    if (pts.length > 3 && dd(pts[0], pts[pts.length - 1]) <= tol * tol) {
      closed = true;
      pts.pop();
    }
    this.host.snapshot();
    const srcLayer = a.layer;
    this.host.store.remove(a);
    this.host.store.remove(b);
    const merged = new PolylineEntity(pts, closed);
    merged.layer = srcLayer; // merged line keeps the first pick's layer
    this.host.store.add(merged);
    this.host.store.select(merged, false);
    this.host.ui.setHint(closed ? 'Соединено в замкнутый контур' : 'Соединено');
  }

  override onKey(e: KeyboardEvent): boolean {
    if (e.key === 'Escape') {
      this.first = null;
      this.host.store.clearSelection();
      return true;
    }
    return false;
  }
}
