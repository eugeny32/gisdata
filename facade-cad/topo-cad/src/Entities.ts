/**
 * Entities — CAD primitives stored in UCS-local coordinates.
 *
 * Invariant: every defining vertex has z === 0. Entities are children of
 * UCSManager.group, so world placement happens exclusively through the
 * group's matrixWorld at render time. This keeps the drawing 100% flat for
 * CAD/DXF export while it still reads correctly in all three viewports.
 *
 * Linework renders through Line2 (screen-space wide lines): the material
 * comes from the entity's LAYER (color, linetype, lineweight), entities
 * never own line materials — see Layers.ts. Selection swaps to the layer's
 * cyan twin material.
 *
 * Geometry lives in a per-entity CPU sample array (`samples`) that also
 * backs bounds tests and click picking, so hit-testing never touches
 * three.js raycasting. Rotate/Scale/Mirror commit through the shared 2×2
 * affine helpers below; live previews ride on the Object3D transform.
 *
 * Every entity serializes to a compact JSON atom — the undo/redo stack is
 * snapshot-based on top of `toJSON`/`entityFromJSON`.
 */
import * as THREE from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import type { Layer } from './Layers';

let nextId = 1;

/** Entities resolve their layer through this indirection so the module
 *  stays free of an Engine dependency. Set once at startup. */
export interface LayerProvider {
  get(name: string): Layer;
  current: string;
}

let layerProvider: LayerProvider | null = null;

export function setLayerProvider(p: LayerProvider): void {
  layerProvider = p;
}

/** Fallback material — only ever used before the provider is wired. */
const MAT_FALLBACK = new LineMaterial({ color: 0xdde6ff, linewidth: 1.6 });

// depthTest: false everywhere — see the note in Layers.applyLayer.
export const MAT_GHOST_LINE = new THREE.LineBasicMaterial({ color: 0x8b9cf9, transparent: true, opacity: 0.4, depthTest: false });
export const MAT_GHOST_LINE2 = new LineMaterial({ color: 0x8b9cf9, transparent: true, opacity: 0.4, linewidth: 1.6, depthTest: false });
export const MAT_GHOST_MESH = new THREE.MeshBasicMaterial({ color: 0x8b9cf9, transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false, depthTest: false });

export type EntityJSON =
  | { k: 'pl'; pts: number[]; closed: boolean; l?: string }
  | { k: 'ci'; c: [number, number]; r: number; l?: string }
  | { k: 'ar'; c: [number, number]; r: number; a0: number; sw: number; l?: string }
  | { k: 'el'; c: [number, number]; rx: number; ry: number; rot: number; l?: string }
  | { k: 'tx'; a: [number, number]; t: string; h: number; rot: number; l?: string }
  | { k: 'pt'; a: [number, number]; lbl?: string; dev?: number; l?: string };

interface Bounds {
  minx: number;
  miny: number;
  maxx: number;
  maxy: number;
}

// Shared scratch — selection tests are synchronous and single-threaded.
const _b: Bounds = { minx: 0, miny: 0, maxx: 0, maxy: 0 };

export abstract class CadEntity {
  readonly id = nextId++;
  abstract readonly kind: string;
  abstract readonly object3D: THREE.Object3D;
  /** Defining vertices in UCS-local coordinates, z always 0. */
  readonly points: THREE.Vector3[] = [];
  /** CAD layer name (see LayerStore). New entities land on the current one. */
  layer: string = layerProvider ? layerProvider.current : '0';
  selected = false;

  setSelected(v: boolean): void {
    if (this.selected === v) return;
    this.selected = v;
    this.refreshAppearance();
  }

  /** Re-pull material/visibility from the entity's layer. */
  refreshAppearance(): void {
    if (!layerProvider) return;
    const l = layerProvider.get(this.layer);
    this.applyLayer(l);
    this.object3D.visible = l.visible;
  }

  protected abstract applyLayer(l: Layer): void;
  /** Sync GPU buffers / placement from the entity data (in-place). */
  abstract rebuild(): void;
  abstract makeCopy(delta: THREE.Vector3): CadEntity;
  abstract toJSON(): EntityJSON;
  abstract dispose(): void;
  /** Distance from a local-space point to the entity outline (picking). */
  abstract hitDistance(x: number, y: number): number;

  // ------------------------------------------------------ data transforms

  /** Bake a translation into the local vertices (Move commit). */
  translate(delta: THREE.Vector3): void {
    for (const p of this.points) {
      p.add(delta);
      p.z = 0;
    }
    this.rebuild();
  }

  /** p ← pivot + M·(p − pivot) for every defining vertex. */
  protected mapPoints(m00: number, m01: number, m10: number, m11: number, px: number, py: number): void {
    for (const p of this.points) {
      const dx = p.x - px;
      const dy = p.y - py;
      p.set(px + m00 * dx + m01 * dy, py + m10 * dx + m11 * dy, 0);
    }
  }

  rotateAround(pivot: THREE.Vector3, angle: number): void {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    this.mapPoints(c, -s, s, c, pivot.x, pivot.y);
    this.onRotated(angle);
    this.rebuild();
  }

  scaleAround(pivot: THREE.Vector3, f: number): void {
    this.mapPoints(f, 0, 0, f, pivot.x, pivot.y);
    this.onScaled(f);
    this.rebuild();
  }

  /** Reflect across the line through `pivot` at angle `phi`. */
  mirrorAcross(pivot: THREE.Vector3, phi: number): void {
    const c = Math.cos(2 * phi);
    const s = Math.sin(2 * phi);
    this.mapPoints(c, s, s, -c, pivot.x, pivot.y);
    this.onMirrored(phi);
    this.rebuild();
  }

  /** Shape-parameter hooks (radius, sweep angles, text rotation, …). */
  protected onRotated(_angle: number): void {}
  protected onScaled(_f: number): void {}
  protected onMirrored(_phi: number): void {}

  // ------------------------------------------------------- drag previews

  /** Cheap visual offset for Move previews — does NOT touch `points`. */
  setPreviewOffset(delta: THREE.Vector3): void {
    this.object3D.position.set(delta.x, delta.y, 0);
  }

  /** Preview world' = R(θ)·S(sx,sy)·p + (pivot − M·pivot): rotate/scale/
   *  mirror drags ride entirely on the Object3D transform. */
  setPreviewTransform(theta: number, sx: number, sy: number, pivot: THREE.Vector3): void {
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    const m00 = c * sx;
    const m01 = -s * sy;
    const m10 = s * sx;
    const m11 = c * sy;
    this.object3D.rotation.z = theta;
    this.object3D.scale.set(sx, sy, 1);
    this.object3D.position.set(pivot.x - (m00 * pivot.x + m01 * pivot.y), pivot.y - (m10 * pivot.x + m11 * pivot.y), 0);
  }

  clearPreview(): void {
    this.object3D.position.set(0, 0, 0);
    this.object3D.rotation.z = 0;
    this.object3D.scale.set(1, 1, 1);
    this.rebuild();
  }

  // ---------------------------------------------------- selection helpers

  /** 2D AABB of the entity (shared scratch object). */
  protected getBounds(): Bounds {
    _b.minx = Infinity;
    _b.miny = Infinity;
    _b.maxx = -Infinity;
    _b.maxy = -Infinity;
    for (const p of this.points) {
      _b.minx = Math.min(_b.minx, p.x);
      _b.miny = Math.min(_b.miny, p.y);
      _b.maxx = Math.max(_b.maxx, p.x);
      _b.maxy = Math.max(_b.maxy, p.y);
    }
    return _b;
  }

  /** Is (x, y) within `r` of this entity's extent? An O(1) reject used by
   *  osnap and click picking, which both run over the whole drawing. */
  nearPoint(x: number, y: number, r: number): boolean {
    const g = this.getBounds();
    return x >= g.minx - r && x <= g.maxx + r && y >= g.miny - r && y <= g.maxy + r;
  }

  /** Window selection: entity fully inside the local-space rect? */
  withinRect(min: THREE.Vector2, max: THREE.Vector2): boolean {
    const g = this.getBounds();
    return g.minx >= min.x && g.maxx <= max.x && g.miny >= min.y && g.maxy <= max.y;
  }

  /** Crossing selection, approximated by 2D AABB overlap — the standard
   *  drafting-UX tradeoff (exact segment clipping buys little here). */
  intersectsRect(min: THREE.Vector2, max: THREE.Vector2): boolean {
    const g = this.getBounds();
    return g.maxx >= min.x && g.minx <= max.x && g.maxy >= min.y && g.miny <= max.y;
  }
}

// ------------------------------------------------------ linework base --

/** Shared base for every line-drawn entity: owns the Line2 object, the CPU
 *  sample polyline that backs the GPU buffer, bounds and hit-testing. */
abstract class LineworkEntity extends CadEntity {
  readonly object3D: Line2;
  /** Flat xyz sample run — exactly what the GPU renders. */
  protected samples: Float32Array = new Float32Array(0);

  constructor() {
    super();
    const mat = layerProvider ? layerProvider.get(layerProvider.current).mat : MAT_FALLBACK;
    this.object3D = new Line2(new LineGeometry(), mat);
    this.object3D.userData.entity = this;
    this.object3D.frustumCulled = false; // previews ride the transform
  }

  /** Refill `samples` from the entity data. */
  protected abstract fillSamples(): Float32Array;

  rebuild(): void {
    this.samples = this.fillSamples();
    const old = this.object3D.geometry;
    const geo = new LineGeometry();
    geo.setPositions(this.samples);
    this.object3D.geometry = geo;
    old.dispose();
    this.object3D.computeLineDistances(); // dashes are world-metric
  }

  protected applyLayer(l: Layer): void {
    this.object3D.material = this.selected ? l.matSel : l.mat;
  }

  /** Distance to the sampled polyline (segment-exact). */
  hitDistance(x: number, y: number): number {
    const s = this.samples;
    let best = Infinity;
    for (let i = 0; i + 5 < s.length; i += 3) {
      const ax = s[i];
      const ay = s[i + 1];
      const bx = s[i + 3];
      const by = s[i + 4];
      const abx = bx - ax;
      const aby = by - ay;
      const len2 = abx * abx + aby * aby;
      let t = len2 > 0 ? ((x - ax) * abx + (y - ay) * aby) / len2 : 0;
      t = Math.max(0, Math.min(1, t));
      const dx = ax + abx * t - x;
      const dy = ay + aby * t - y;
      const d2 = dx * dx + dy * dy;
      if (d2 < best) best = d2;
    }
    return Math.sqrt(best);
  }

  /** Exact bounds for sampled shapes (arcs, ellipses). */
  protected boundsFromSamples(): Bounds {
    const s = this.samples;
    _b.minx = Infinity;
    _b.miny = Infinity;
    _b.maxx = -Infinity;
    _b.maxy = -Infinity;
    for (let i = 0; i + 2 < s.length; i += 3) {
      _b.minx = Math.min(_b.minx, s[i]);
      _b.miny = Math.min(_b.miny, s[i + 1]);
      _b.maxx = Math.max(_b.maxx, s[i]);
      _b.maxy = Math.max(_b.maxy, s[i + 1]);
    }
    return _b;
  }

  dispose(): void {
    this.object3D.geometry.dispose();
  }
}

// ---------------------------------------------------------------- polyline

export class PolylineEntity extends LineworkEntity {
  readonly kind: string = 'polyline';

  constructor(
    pts: readonly THREE.Vector3[],
    readonly closed: boolean,
  ) {
    super();
    for (const p of pts) this.points.push(new THREE.Vector3(p.x, p.y, 0));
    this.rebuild();
  }

  protected fillSamples(): Float32Array {
    const n = this.points.length + (this.closed ? 1 : 0);
    const out = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const p = this.points[i % this.points.length];
      out[i * 3] = p.x;
      out[i * 3 + 1] = p.y;
    }
    return out;
  }

  makeCopy(delta: THREE.Vector3): CadEntity {
    const c = new PolylineEntity(
      this.points.map((p) => new THREE.Vector3(p.x + delta.x, p.y + delta.y, 0)),
      this.closed,
    );
    c.layer = this.layer;
    return c;
  }

  toJSON(): EntityJSON {
    const pts: number[] = [];
    for (const p of this.points) pts.push(p.x, p.y);
    return { k: 'pl', pts, closed: this.closed, l: this.layer };
  }
}

// ------------------------------------------------------------------ circle

const CIRCLE_SEGS = 72;

export class CircleEntity extends LineworkEntity {
  readonly kind: string = 'circle';
  radius: number;

  /** points[0] is the center. */
  constructor(center: THREE.Vector3, radius: number) {
    super();
    this.points.push(new THREE.Vector3(center.x, center.y, 0));
    this.radius = Math.max(1e-4, radius);
    this.rebuild();
  }

  protected fillSamples(): Float32Array {
    const c = this.points[0];
    const out = new Float32Array((CIRCLE_SEGS + 1) * 3);
    for (let i = 0; i <= CIRCLE_SEGS; i++) {
      const a = (i / CIRCLE_SEGS) * Math.PI * 2;
      out[i * 3] = c.x + Math.cos(a) * this.radius;
      out[i * 3 + 1] = c.y + Math.sin(a) * this.radius;
    }
    return out;
  }

  override hitDistance(x: number, y: number): number {
    const c = this.points[0];
    return Math.abs(Math.hypot(x - c.x, y - c.y) - this.radius);
  }

  protected override onScaled(f: number): void {
    this.radius *= Math.abs(f);
  }

  protected override getBounds() {
    const c = this.points[0];
    _b.minx = c.x - this.radius;
    _b.miny = c.y - this.radius;
    _b.maxx = c.x + this.radius;
    _b.maxy = c.y + this.radius;
    return _b;
  }

  makeCopy(delta: THREE.Vector3): CadEntity {
    const c = new CircleEntity(new THREE.Vector3(this.points[0].x + delta.x, this.points[0].y + delta.y, 0), this.radius);
    c.layer = this.layer;
    return c;
  }

  toJSON(): EntityJSON {
    return { k: 'ci', c: [this.points[0].x, this.points[0].y], r: this.radius, l: this.layer };
  }
}

// --------------------------------------------------------------------- arc

const ARC_SEGS = 64;

export class ArcEntity extends LineworkEntity {
  readonly kind: string = 'arc';
  radius: number;
  /** Start angle + signed sweep (radians) — mirror-safe parameterization. */
  a0: number;
  sweep: number;

  /** points[0] is the center. */
  constructor(center: THREE.Vector3, radius: number, a0: number, sweep: number) {
    super();
    this.points.push(new THREE.Vector3(center.x, center.y, 0));
    this.radius = Math.max(1e-4, radius);
    this.a0 = a0;
    this.sweep = sweep;
    this.rebuild();
  }

  protected fillSamples(): Float32Array {
    const c = this.points[0];
    const out = new Float32Array((ARC_SEGS + 1) * 3);
    for (let i = 0; i <= ARC_SEGS; i++) {
      const a = this.a0 + (this.sweep * i) / ARC_SEGS;
      out[i * 3] = c.x + Math.cos(a) * this.radius;
      out[i * 3 + 1] = c.y + Math.sin(a) * this.radius;
    }
    return out;
  }

  protected override onRotated(angle: number): void {
    this.a0 += angle;
  }

  protected override onScaled(f: number): void {
    this.radius *= Math.abs(f);
  }

  protected override onMirrored(phi: number): void {
    // Reflection maps angle a → 2φ − a and flips the winding direction.
    this.a0 = 2 * phi - this.a0;
    this.sweep = -this.sweep;
  }

  protected override getBounds() {
    return this.boundsFromSamples();
  }

  makeCopy(delta: THREE.Vector3): CadEntity {
    const c = new ArcEntity(new THREE.Vector3(this.points[0].x + delta.x, this.points[0].y + delta.y, 0), this.radius, this.a0, this.sweep);
    c.layer = this.layer;
    return c;
  }

  toJSON(): EntityJSON {
    return { k: 'ar', c: [this.points[0].x, this.points[0].y], r: this.radius, a0: this.a0, sw: this.sweep, l: this.layer };
  }
}

// ----------------------------------------------------------------- ellipse

const ELLIPSE_SEGS = 72;

export class EllipseEntity extends LineworkEntity {
  readonly kind: string = 'ellipse';
  rx: number;
  ry: number;
  /** Rotation of the major axis — lets Rotate/Mirror stay exact. */
  rot: number;

  /** points[0] is the center. */
  constructor(center: THREE.Vector3, rx: number, ry: number, rot = 0) {
    super();
    this.points.push(new THREE.Vector3(center.x, center.y, 0));
    this.rx = Math.max(1e-4, rx);
    this.ry = Math.max(1e-4, ry);
    this.rot = rot;
    this.rebuild();
  }

  protected fillSamples(): Float32Array {
    const c = this.points[0];
    const cr = Math.cos(this.rot);
    const sr = Math.sin(this.rot);
    const out = new Float32Array((ELLIPSE_SEGS + 1) * 3);
    for (let i = 0; i <= ELLIPSE_SEGS; i++) {
      const t = (i / ELLIPSE_SEGS) * Math.PI * 2;
      const ex = this.rx * Math.cos(t);
      const ey = this.ry * Math.sin(t);
      out[i * 3] = c.x + ex * cr - ey * sr;
      out[i * 3 + 1] = c.y + ex * sr + ey * cr;
    }
    return out;
  }

  protected override onRotated(angle: number): void {
    this.rot += angle;
  }

  protected override onScaled(f: number): void {
    this.rx *= Math.abs(f);
    this.ry *= Math.abs(f);
  }

  protected override onMirrored(phi: number): void {
    this.rot = 2 * phi - this.rot;
  }

  protected override getBounds() {
    return this.boundsFromSamples();
  }

  makeCopy(delta: THREE.Vector3): CadEntity {
    const c = new EllipseEntity(new THREE.Vector3(this.points[0].x + delta.x, this.points[0].y + delta.y, 0), this.rx, this.ry, this.rot);
    c.layer = this.layer;
    return c;
  }

  toJSON(): EntityJSON {
    return { k: 'el', c: [this.points[0].x, this.points[0].y], rx: this.rx, ry: this.ry, rot: this.rot, l: this.layer };
  }
}

// -------------------------------------------------------------------- text

export class TextEntity extends CadEntity {
  readonly kind: string = 'text';
  readonly object3D: THREE.Mesh;
  height: number;
  rotation: number;
  private readonly baseHeight: number;
  private readonly aspect: number;
  private readonly material: THREE.MeshBasicMaterial;

  get width(): number {
    return this.height * this.aspect;
  }

  /** points[0] is the bottom-left anchor on the UCS plane. */
  constructor(
    anchor: THREE.Vector3,
    readonly text: string,
    height = 0.35,
    rotation = 0,
  ) {
    super();
    this.points.push(new THREE.Vector3(anchor.x, anchor.y, 0));
    this.height = height;
    this.baseHeight = height;
    this.rotation = rotation;

    // Rasterize once into a canvas texture — cheap and DXF-mappable (the
    // anchor + height + string survive as data for a real TEXT export).
    const canvas = document.createElement('canvas');
    const font = '600 96px "Segoe UI", system-ui, sans-serif';
    let ctx = canvas.getContext('2d')!;
    ctx.font = font;
    canvas.width = Math.max(32, Math.ceil(ctx.measureText(text).width) + 16);
    canvas.height = 128;
    ctx = canvas.getContext('2d')!; // canvas resize resets the 2D state
    ctx.font = font;
    ctx.fillStyle = '#ffffff'; // pure white — the layer color tints it
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 8, 64);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;

    this.aspect = canvas.width / canvas.height;
    const w = this.baseHeight * this.aspect;
    const geo = new THREE.PlaneGeometry(w, this.baseHeight);
    geo.translate(w / 2, this.baseHeight / 2, 0); // origin = bottom-left
    this.material = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false, depthTest: false });
    this.object3D = new THREE.Mesh(geo, this.material);
    this.object3D.userData.entity = this;
    this.object3D.renderOrder = 2;
    this.rebuild();
  }

  rebuild(): void {
    // Tiny z-offset lifts the quad off the wall points without breaking
    // the flat-drawing invariant (the DATA anchor stays at z = 0).
    const k = this.height / this.baseHeight;
    this.object3D.position.set(this.points[0].x, this.points[0].y, 0.002);
    this.object3D.rotation.z = this.rotation;
    this.object3D.scale.set(k, k, 1);
  }

  override setPreviewOffset(delta: THREE.Vector3): void {
    this.object3D.position.set(this.points[0].x + delta.x, this.points[0].y + delta.y, 0.002);
  }

  override setPreviewTransform(theta: number, sx: number, sy: number, pivot: THREE.Vector3): void {
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    const dx = this.points[0].x - pivot.x;
    const dy = this.points[0].y - pivot.y;
    const k = this.height / this.baseHeight;
    this.object3D.rotation.z = theta + this.rotation;
    this.object3D.scale.set(sx * k, sy * k, 1);
    this.object3D.position.set(pivot.x + c * sx * dx - s * sy * dy, pivot.y + s * sx * dx + c * sy * dy, 0.002);
  }

  protected applyLayer(l: Layer): void {
    this.material.color.set(this.selected ? '#f472b6' : l.color);
  }

  hitDistance(x: number, y: number): number {
    // Rotation-agnostic bbox distance — fine for click-pick UX.
    const b = this.getBounds();
    const dx = Math.max(b.minx - x, 0, x - b.maxx);
    const dy = Math.max(b.miny - y, 0, y - b.maxy);
    return Math.hypot(dx, dy);
  }

  protected override onRotated(angle: number): void {
    this.rotation += angle;
  }

  protected override onScaled(f: number): void {
    this.height *= Math.abs(f);
  }

  protected override onMirrored(phi: number): void {
    // Keep glyphs readable (AutoCAD MIRRTEXT=0): mirror the anchor and
    // baseline direction only, never the glyph geometry.
    this.rotation = 2 * phi - this.rotation;
  }

  protected override getBounds() {
    // Rotation-agnostic approximation — fine for marquee UX.
    const a = this.points[0];
    _b.minx = a.x;
    _b.miny = a.y;
    _b.maxx = a.x + this.width;
    _b.maxy = a.y + this.height;
    return _b;
  }

  makeCopy(delta: THREE.Vector3): CadEntity {
    const c = new TextEntity(new THREE.Vector3(this.points[0].x + delta.x, this.points[0].y + delta.y, 0), this.text, this.height, this.rotation);
    c.layer = this.layer;
    return c;
  }

  toJSON(): EntityJSON {
    return { k: 'tx', a: [this.points[0].x, this.points[0].y], t: this.text, h: this.height, rot: this.rotation, l: this.layer };
  }

  dispose(): void {
    this.object3D.geometry.dispose();
    this.material.map?.dispose();
    this.material.dispose();
  }
}

// ------------------------------------------------------------------ point

// Terrain scale: a survey point on a topographic plan is metres across,
// not centimetres like a facade detail.
const PT_R = 0.4; // marker half-size, metres — a real drawing symbol
const PT_LABEL_H = 0.9; // caption height, metres

/** Survey point: a small diamond marker with an optional caption.
 *  Elevation readings are exactly this — a point whose caption is the
 *  signed height above the datum plane (see Engine.deviationRef). */
export class PointEntity extends LineworkEntity {
  readonly kind: string = 'point';
  /** Caption drawn next to the marker (deviation text, a name, …). */
  label: string;
  /** Signed deviation in metres when this point came from a measurement. */
  deviation: number | null;
  private labelMesh: THREE.Mesh | null = null;
  private labelMat: THREE.MeshBasicMaterial | null = null;

  constructor(at: THREE.Vector3, label = '', deviation: number | null = null) {
    super();
    this.points.push(new THREE.Vector3(at.x, at.y, 0));
    this.label = label;
    this.deviation = deviation;
    this.rebuild();
    if (label) this.buildLabel();
  }

  protected fillSamples(): Float32Array {
    const p = this.points[0];
    // Diamond: reads as a survey point and stays one continuous polyline.
    return new Float32Array([p.x - PT_R, p.y, 0, p.x, p.y + PT_R, 0, p.x + PT_R, p.y, 0, p.x, p.y - PT_R, 0, p.x - PT_R, p.y, 0]);
  }

  private buildLabel(): void {
    const canvas = document.createElement('canvas');
    const font = '600 64px "Segoe UI", system-ui, sans-serif';
    let ctx = canvas.getContext('2d')!;
    ctx.font = font;
    canvas.width = Math.ceil(ctx.measureText(this.label).width) + 12;
    canvas.height = 80;
    ctx = canvas.getContext('2d')!;
    ctx.font = font;
    ctx.fillStyle = '#ffffff'; // tinted by the layer colour
    ctx.textBaseline = 'middle';
    ctx.fillText(this.label, 6, 42);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    const h = PT_LABEL_H;
    const w = (h * canvas.width) / canvas.height;
    const geo = new THREE.PlaneGeometry(w, h);
    geo.translate(w / 2 + PT_R * 1.6, h / 2, 0);
    this.labelMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false, depthTest: false });
    this.labelMesh = new THREE.Mesh(geo, this.labelMat);
    this.labelMesh.renderOrder = 2;
    this.labelMesh.layers.set(3);
    this.object3D.add(this.labelMesh);
    this.placeLabel();
  }

  private placeLabel(): void {
    if (this.labelMesh) this.labelMesh.position.set(this.points[0].x, this.points[0].y, 0.002);
  }

  override rebuild(): void {
    super.rebuild();
    this.placeLabel();
  }

  protected override applyLayer(l: Layer): void {
    super.applyLayer(l);
    this.labelMat?.color.set(this.selected ? '#f472b6' : l.color);
  }

  protected override getBounds() {
    const p = this.points[0];
    _b.minx = p.x - PT_R;
    _b.miny = p.y - PT_R;
    _b.maxx = p.x + PT_R;
    _b.maxy = p.y + PT_R;
    return _b;
  }

  makeCopy(delta: THREE.Vector3): CadEntity {
    const c = new PointEntity(new THREE.Vector3(this.points[0].x + delta.x, this.points[0].y + delta.y, 0), this.label, this.deviation);
    c.layer = this.layer;
    return c;
  }

  toJSON(): EntityJSON {
    return { k: 'pt', a: [this.points[0].x, this.points[0].y], lbl: this.label || undefined, dev: this.deviation ?? undefined, l: this.layer };
  }

  override dispose(): void {
    super.dispose();
    this.labelMesh?.geometry.dispose();
    this.labelMat?.map?.dispose();
    this.labelMat?.dispose();
  }
}

// ------------------------------------------------------------- serializer

const _v = new THREE.Vector3();

export function entityFromJSON(o: EntityJSON): CadEntity | null {
  let e: CadEntity | null = null;
  switch (o.k) {
    case 'pl': {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i + 1 < o.pts.length; i += 2) pts.push(new THREE.Vector3(o.pts[i], o.pts[i + 1], 0));
      e = pts.length >= 2 ? new PolylineEntity(pts, o.closed) : null;
      break;
    }
    case 'ci':
      e = new CircleEntity(_v.set(o.c[0], o.c[1], 0), o.r);
      break;
    case 'ar':
      e = new ArcEntity(_v.set(o.c[0], o.c[1], 0), o.r, o.a0, o.sw);
      break;
    case 'el':
      e = new EllipseEntity(_v.set(o.c[0], o.c[1], 0), o.rx, o.ry, o.rot);
      break;
    case 'tx':
      e = new TextEntity(_v.set(o.a[0], o.a[1], 0), o.t, o.h, o.rot);
      break;
    case 'pt':
      e = new PointEntity(_v.set(o.a[0], o.a[1], 0), o.lbl ?? '', o.dev ?? null);
      break;
  }
  if (e) e.layer = o.l ?? '0';
  return e;
}

// ------------------------------------------------------------------- store

export class EntityStore {
  readonly entities: CadEntity[] = [];
  readonly selection = new Set<CadEntity>();
  /** Flat raycast target list, kept in sync with `entities`. */
  readonly pickables: THREE.Object3D[] = [];
  /** Fired whenever the contents or the selection change — the Engine uses
   *  it to keep the layer combo and per-layer counts in sync. Must never
   *  mutate the store (no re-entrancy guard). */
  onChange: (() => void) | null = null;

  constructor(private readonly parent: THREE.Group) {}

  add(e: CadEntity): void {
    // Layer 3 = CAD linework: per-viewport visibility is a camera-layer
    // toggle, so hiding costs nothing.
    e.object3D.layers.set(3);
    e.object3D.renderOrder = 2; // drafting output paints over the cloud
    this.entities.push(e);
    this.pickables.push(e.object3D);
    this.parent.add(e.object3D);
    e.refreshAppearance();
    this.onChange?.();
  }

  remove(e: CadEntity): void {
    const i = this.entities.indexOf(e);
    if (i >= 0) this.entities.splice(i, 1);
    const j = this.pickables.indexOf(e.object3D);
    if (j >= 0) this.pickables.splice(j, 1);
    this.selection.delete(e);
    this.parent.remove(e.object3D);
    e.dispose();
    this.onChange?.();
  }

  select(e: CadEntity, additive: boolean): void {
    if (!additive) this.clearSelection();
    e.setSelected(true);
    this.selection.add(e);
    this.onChange?.();
  }

  toggle(e: CadEntity): void {
    if (e.selected) {
      e.setSelected(false);
      this.selection.delete(e);
    } else {
      e.setSelected(true);
      this.selection.add(e);
    }
    this.onChange?.();
  }

  clearSelection(): void {
    for (const e of this.selection) e.setSelected(false);
    this.selection.clear();
    this.onChange?.();
  }

  deleteSelected(): number {
    const doomed = [...this.selection];
    for (const e of doomed) this.remove(e);
    return doomed.length;
  }

  /** Layer of the current selection, or null when empty/mixed. */
  selectionLayer(): string | null {
    let name: string | null = null;
    for (const e of this.selection) {
      if (name === null) name = e.layer;
      else if (name !== e.layer) return null;
    }
    return name;
  }

  countOnLayer(name: string): number {
    let n = 0;
    for (const e of this.entities) {
      if (e.layer === name) n++;
    }
    return n;
  }

  // ------------------------------------------------------------- layers

  /** Re-pull layer materials/visibility for every entity. */
  refreshAll(): void {
    for (const e of this.entities) e.refreshAppearance();
  }

  /** Move every entity of layer `from` onto layer `to` (layer deletion). */
  reassignLayer(from: string, to: string): void {
    for (const e of this.entities) {
      if (e.layer === from) e.layer = to;
    }
    this.refreshAll();
  }

  /** Follow a layer rename so entity references stay valid. */
  renameLayerRefs(from: string, to: string): void {
    for (const e of this.entities) {
      if (e.layer === from) e.layer = to;
    }
  }

  /** On UCS redefinition: keep every entity's WORLD position, re-express it
   *  in the new UCS, then flatten onto the new drafting plane (z := 0). */
  rebase(oldUcs: THREE.Matrix4, newUcsInverse: THREE.Matrix4): void {
    for (const e of this.entities) {
      for (const p of e.points) {
        p.applyMatrix4(oldUcs).applyMatrix4(newUcsInverse);
        p.z = 0;
      }
      e.rebuild();
    }
  }

  // ------------------------------------------------- undo/redo snapshots

  serialize(): string {
    return JSON.stringify(this.entities.map((e) => e.toJSON()));
  }

  restore(json: string): void {
    this.clearAll();
    const list = JSON.parse(json) as EntityJSON[];
    for (const o of list) {
      const e = entityFromJSON(o);
      if (e) this.add(e);
    }
  }

  clearAll(): void {
    for (const e of [...this.entities]) this.remove(e);
  }
}
