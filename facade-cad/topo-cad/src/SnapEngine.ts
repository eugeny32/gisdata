/**
 * SnapEngine — spatial index over the isolated cloud for cursor snapping.
 *
 * A uniform grid over UCS-local XY is used instead of an octree: terrain
 * is a 2.5-D surface, so 2D binning gives O(1) neighborhood queries with
 * better cache behavior and far less code.
 *
 * The grid is CSR-shaped (`cellStart` prefix sums + an `order` permutation)
 * and built with a counting sort. The previous Map<number, number[]> paid
 * one array object and one push per point, and THAT allocation storm — not
 * the arithmetic — was the visible stall when an area was isolated on a
 * slow machine. Two linear passes over typed arrays allocate nothing per
 * point.
 *
 * The cell size GROWS with the site: a 2 km corridor at a fixed 0.35 m
 * cell would blow past the per-axis cap and pile the whole tail into one
 * bucket, turning every mousemove into a linear scan.
 *
 * `query` returns the REAL 3-D point (z = elevation). The caller projects
 * it onto the UCS plane (z := 0) so the drawing stays flat, while the
 * green marker is rendered at the true point.
 */
import * as THREE from 'three';

const _p = new THREE.Vector3();

const CELL_MIN = 0.35; // meters; ≈ snap radius at typical drafting zoom
const GRID_MAX = 2048; // per-axis cell cap — bounds the index for huge sites

export class SnapEngine {
  private cellStart: Int32Array | null = null;
  private order: Int32Array | null = null;
  private pts: Float32Array | null = null;
  private cols = 1;
  private rows = 1;
  private ox = 0;
  private oy = 0;
  /** Cell size of the current index, metres (see the header note). */
  private cell = CELL_MIN;
  /** UCS-local bounds of the indexed points — used for view framing. */
  readonly localBounds = new THREE.Box3();
  ready = false;

  /** Index points that are ALREADY in UCS-local space. The Engine builds
   *  the compact area buffer in local coordinates anyway, so handing that
   *  array over here saves a second full transform pass over the site. */
  buildLocal(pts: Float32Array, n: number): void {
    if (!n) {
      this.clear();
      return;
    }
    this.localBounds.makeEmpty();
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (let k = 0; k < n; k++) {
      const x = pts[k * 3];
      const y = pts[k * 3 + 1];
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    this.finishBuild(pts, n, minX, minY, maxX, maxY);
  }

  /** One-time pass: transform (a subset of) the cloud into UCS-local space
   *  and bin by XY cell. ~400k points take a few ms — click-time cost. */
  build(positions: Float32Array, indices: Uint32Array | null, worldToLocal: THREE.Matrix4): void {
    const n = indices ? indices.length : positions.length / 3;
    if (!n) {
      this.clear();
      return;
    }
    const pts = new Float32Array(n * 3);
    this.localBounds.makeEmpty();

    // Expand the matrix once: per-point Vector3 method calls dominated the
    // transform pass, and only the basis rows are ever needed.
    const e = worldToLocal.elements;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (let k = 0; k < n; k++) {
      const i = (indices ? indices[k] : k) * 3;
      const wx = positions[i];
      const wy = positions[i + 1];
      const wz = positions[i + 2];
      const x = e[0] * wx + e[4] * wy + e[8] * wz + e[12];
      const y = e[1] * wx + e[5] * wy + e[9] * wz + e[13];
      const z = e[2] * wx + e[6] * wy + e[10] * wz + e[14];
      pts[k * 3] = x;
      pts[k * 3 + 1] = y;
      pts[k * 3 + 2] = z;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    this.finishBuild(pts, n, minX, minY, maxX, maxY);
  }

  /** Shared tail of both builders: grid sizing + counting sort. */
  private finishBuild(pts: Float32Array, n: number, minX: number, minY: number, maxX: number, maxY: number): void {
    _p.set(minX, minY, 0);
    this.localBounds.expandByPoint(_p);
    _p.set(maxX, maxY, 0);
    this.localBounds.expandByPoint(_p);

    this.ox = minX;
    this.oy = minY;
    // Keep the grid within the cap by growing the cell, never by folding
    // the far end of a long corridor into the last column.
    this.cell = Math.max(CELL_MIN, Math.max(maxX - minX, maxY - minY) / GRID_MAX);
    this.cols = Math.max(1, Math.min(GRID_MAX, Math.ceil((maxX - minX) / this.cell) + 1));
    this.rows = Math.max(1, Math.min(GRID_MAX, Math.ceil((maxY - minY) / this.cell) + 1));
    const cells = this.cols * this.rows;

    // Counting sort: histogram → prefix sums → scatter.
    const counts = new Int32Array(cells + 1);
    const cellOf = new Int32Array(n);
    for (let k = 0; k < n; k++) {
      const c = this.cellIndex(pts[k * 3], pts[k * 3 + 1]);
      cellOf[k] = c;
      counts[c + 1]++;
    }
    for (let c = 0; c < cells; c++) counts[c + 1] += counts[c];
    const order = new Int32Array(n);
    const cursor = Int32Array.from(counts.subarray(0, cells));
    for (let k = 0; k < n; k++) order[cursor[cellOf[k]]++] = k;

    this.pts = pts;
    this.cellStart = counts;
    this.order = order;
    this.ready = true;
  }

  private cellIndex(x: number, y: number): number {
    const cx = Math.min(this.cols - 1, Math.max(0, Math.floor((x - this.ox) / this.cell)));
    const cy = Math.min(this.rows - 1, Math.max(0, Math.floor((y - this.oy) / this.cell)));
    return cy * this.cols + cx;
  }

  /** Nearest indexed point to (x, y) within `maxR` (all UCS-local, screen
   *  distance ≈ XY distance because the plan view is plane-aligned).
   *  `zMin/zMax` restrict candidates to an elevation slab — with the height
   *  slice active the cursor snaps to the ground in that slab, not to the
   *  canopy above it. Allocation-free: runs on every mousemove. */
  query(x: number, y: number, maxR: number, out: THREE.Vector3, zMin = -Infinity, zMax = Infinity): boolean {
    const pts = this.pts;
    const start = this.cellStart;
    const order = this.order;
    if (!this.ready || !pts || !start || !order) return false;

    const cr = Math.min(4, Math.ceil(maxR / this.cell));
    const cx = Math.floor((x - this.ox) / this.cell);
    const cy = Math.floor((y - this.oy) / this.cell);
    let best = -1;
    let bestD2 = maxR * maxR;

    const gx0 = Math.max(0, cx - cr);
    const gx1 = Math.min(this.cols - 1, cx + cr);
    const gy0 = Math.max(0, cy - cr);
    const gy1 = Math.min(this.rows - 1, cy + cr);
    for (let gy = gy0; gy <= gy1; gy++) {
      const row = gy * this.cols;
      for (let gx = gx0; gx <= gx1; gx++) {
        const c = row + gx;
        for (let si = start[c], se = start[c + 1]; si < se; si++) {
          const k = order[si] * 3;
          const pz = pts[k + 2];
          if (pz < zMin || pz > zMax) continue;
          const dx = pts[k] - x;
          const dy = pts[k + 1] - y;
          const d2 = dx * dx + dy * dy;
          if (d2 < bestD2) {
            bestD2 = d2;
            best = k;
          }
        }
      }
    }

    if (best < 0) return false;
    out.set(pts[best], pts[best + 1], pts[best + 2]);
    return true;
  }

  clear(): void {
    this.cellStart = null;
    this.order = null;
    this.pts = null;
    this.ready = false;
    this.localBounds.makeEmpty();
  }
}
