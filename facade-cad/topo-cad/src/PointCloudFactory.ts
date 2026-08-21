/**
 * PointCloudFactory — deterministic synthetic survey of a terrain strip.
 *
 * Stands in for a real airborne/mobile scan so the prototype runs
 * standalone: rolling ground, a road corridor crossing it at an angle
 * (this is what makes the axis UCS meaningful — the trace is NOT aligned
 * with the world axes), carriageway, shoulders, side ditches, cut/fill
 * slopes, a building and vegetation clutter.
 *
 * The corridor alternates between embankment and cut along its length, so
 * both section panes have something to show: the cross-section reads the
 * road prism, the longitudinal one reads the vertical alignment against
 * the natural ground.
 */
import * as THREE from 'three';

export interface DemoCloud {
  geometry: THREE.BufferGeometry;
  positions: Float32Array;
  count: number;
  center: THREE.Vector3;
  radius: number;
}

/** Parse an ASCII cloud (x y z [i] [r g b], space/comma/semicolon).
 *  Assumes surveying Z-up → converts to Y-up and re-centers near origin. */
export interface ParsedCloud {
  positions: Float32Array;
  colors: Float32Array;
  count: number;
  /** What was subtracted, in the SOURCE (survey) axes: add it back to a
   *  world point to get the scan's own coordinates. */
  origin?: { x: number; y: number; z: number };
}

export function parseAsciiCloud(text: string, onProgress?: (frac: number) => void): ParsedCloud | null {
  const lines = text.split(/\r?\n/);
  const pos: number[] = [];
  const col: number[] = [];
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    if ((li & 0x3ffff) === 0 && onProgress) onProgress(li / lines.length);
    const t = line.trim();
    if (!t || t[0] === '#' || t[0] === '/') continue;
    const c = t.split(/[\s,;]+/);
    if (c.length < 3) continue;
    const x = +c[0];
    const y = +c[1];
    const z = +c[2];
    if (!isFinite(x) || !isFinite(y) || !isFinite(z)) continue;
    pos.push(x, z, -y); // Z-up → Y-up
    if (c.length >= 6 && isFinite(+c[c.length - 3])) {
      let r = +c[c.length - 3];
      let g = +c[c.length - 2];
      let b = +c[c.length - 1];
      if (r > 1 || g > 1 || b > 1) {
        r /= 255;
        g /= 255;
        b /= 255;
      }
      col.push(r, g, b);
    } else if (c.length >= 4 && isFinite(+c[3])) {
      const i = Math.min(1, +c[3] / (+c[3] > 1 ? 255 : 1));
      col.push(i, i, i);
    } else {
      col.push(0.7, 0.68, 0.65);
    }
  }
  const count = pos.length / 3;
  if (count < 10) return null;
  // Subtract the origin in DOUBLE first: survey coordinates (7 400 123.456)
  // quantise to half a metre once they land in float32, and no later
  // centering can bring the lost digits back.
  let ox = Infinity;
  let oy = Infinity;
  let oz = Infinity;
  for (let i = 0; i < pos.length; i += 3) {
    if (pos[i] < ox) ox = pos[i];
    if (pos[i + 1] < oy) oy = pos[i + 1];
    if (pos[i + 2] < oz) oz = pos[i + 2];
  }
  for (let i = 0; i < pos.length; i += 3) {
    pos[i] -= ox;
    pos[i + 1] -= oy;
    pos[i + 2] -= oz;
  }
  const positions = Float32Array.from(pos);
  const shift = centerCloud(positions);
  // Origin is kept in THREE axes — add it to a world point to undo every
  // subtraction, then swap axes once (see Engine.worldToSource).
  return { positions, colors: Float32Array.from(col), count, origin: { x: ox + shift.cx, y: oy + shift.cy, z: oz + shift.cz } };
}

/** Re-center in place: survey coordinates are huge — Float32 precision.
 *  XZ to the bbox middle, Y to the lowest point (ground at 0). */
export function centerCloud(pos: Float32Array): { cx: number; cy: number; cz: number } {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, minZ = Infinity, maxZ = -Infinity;
  for (let i = 0; i < pos.length; i += 3) {
    minX = Math.min(minX, pos[i]); maxX = Math.max(maxX, pos[i]);
    minY = Math.min(minY, pos[i + 1]);
    minZ = Math.min(minZ, pos[i + 2]); maxZ = Math.max(maxZ, pos[i + 2]);
  }
  const cx = (minX + maxX) / 2;
  const cz = (minZ + maxZ) / 2;
  for (let i = 0; i < pos.length; i += 3) {
    pos[i] -= cx;
    pos[i + 1] -= minY;
    pos[i + 2] -= cz;
  }
  // Report the shift: without it the scan's own coordinates are gone for
  // good and nothing can be exported back into the survey system.
  return { cx, cy: minY, cz };
}

/** Fisher–Yates over point triples. A pre-shuffled buffer makes any
 *  drawRange prefix a uniform spatial subsample — per-viewport density
 *  becomes true decimation with proportional GPU savings. */
export function shuffleCloud(pos: Float32Array, col: Float32Array, count: number, rand: () => number = Math.random): void {
  for (let i = count - 1; i > 0; i--) {
    const j = (rand() * (i + 1)) | 0;
    for (let k = 0; k < 3; k++) {
      const a = i * 3 + k;
      const b = j * 3 + k;
      let t = pos[a];
      pos[a] = pos[b];
      pos[b] = t;
      t = col[a];
      col[a] = col[b];
      col[b] = t;
    }
  }
}

function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A valid, empty cloud. The app boots with this so nothing heavy runs
 *  before the user has actually chosen a scan — the demo is generated in
 *  the worker on demand, and an import never pays for it at all. */
export function emptyCloud(): DemoCloud {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(0), 3));
  geometry.setAttribute('aColor', new THREE.BufferAttribute(new Float32Array(0), 3));
  geometry.setAttribute('aKey', new THREE.BufferAttribute(new Float32Array(0), 1));
  return { geometry, positions: new Float32Array(0), count: 0, center: new THREE.Vector3(), radius: 10 };
}

// ------------------------------------------------------------- terrain --

const AXIS_ANGLE = 0.32; // rad — the road is deliberately NOT axis-aligned
const AREA_U = 260; // along the road, m
const AREA_V = 150; // across the road, m

const CARRIAGE = 3.5; // half-width of the carriageway
const SHOULDER = 5.0; // outer edge of the shoulders
const DITCH_OUT = 7.0; // outer edge of the ditches
const SLOPE_W = 11.0; // cut/fill slope tying back into natural ground

/** Natural ground: a few octaves of smooth relief, ±6 m over the site. */
function terrain(x: number, z: number): number {
  return 3.1 * Math.sin(x / 41) + 2.2 * Math.cos(z / 33) + 1.3 * Math.sin((x + z) / 17.5) + 0.55 * Math.sin((x - 2 * z) / 9.3) + 6;
}

/** Vertical alignment of the road at station u — crosses the natural
 *  ground repeatedly, so the corridor alternates fill and cut. */
function roadTop(u: number): number {
  return 6.4 + 2.7 * Math.sin(u / 57) + 0.9 * Math.sin(u / 23 + 1.1);
}

type Surface = { y: number; kind: number }; // 0 ground · 1 asphalt · 2 shoulder · 3 ditch · 4 slope

/** Ground elevation at a point, road prism included. */
function surface(u: number, v: number, x: number, z: number, out: Surface): Surface {
  const av = Math.abs(v);
  const t = terrain(x, z);
  if (av > DITCH_OUT + SLOPE_W) {
    out.y = t;
    out.kind = 0;
    return out;
  }
  const r = roadTop(u);
  if (av <= CARRIAGE) {
    out.y = r - 0.025 * av; // 2.5 % crown
    out.kind = 1;
    return out;
  }
  if (av <= SHOULDER) {
    out.y = r - 0.088 - 0.05 * (av - CARRIAGE);
    out.kind = 2;
    return out;
  }
  const edge = r - 0.088 - 0.05 * (SHOULDER - CARRIAGE);
  if (av <= DITCH_OUT) {
    // V-ditch: down to the invert at mid-width, then back up to the edge.
    const d = (av - SHOULDER) / (DITCH_OUT - SHOULDER); // 0..1
    const invert = edge - 0.85;
    out.y = d <= 0.5 ? edge + (invert - edge) * (d / 0.5) : invert + (edge - 0.12 - invert) * ((d - 0.5) / 0.5);
    out.kind = 3;
    return out;
  }
  // Cut/fill slope: smooth tie-in to the natural ground.
  const w = (av - DITCH_OUT) / SLOPE_W;
  const k = w * w * (3 - 2 * w);
  out.y = edge * (1 - k) + t * k;
  out.kind = k > 0.75 ? 0 : 4;
  return out;
}

export function buildDemoCloud(count = 420_000): DemoCloud {
  const rnd = mulberry32(20260803);
  const g = () => rnd() + rnd() + rnd() - 1.5; // ~gaussian, sigma ≈ 0.5

  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  let w = 0;

  const push = (x: number, y: number, z: number, r: number, gr: number, b: number): void => {
    positions[w * 3] = x;
    positions[w * 3 + 1] = y;
    positions[w * 3 + 2] = z;
    colors[w * 3] = r;
    colors[w * 3 + 1] = gr;
    colors[w * 3 + 2] = b;
    w++;
  };

  const dirX = Math.cos(AXIS_ANGLE);
  const dirZ = Math.sin(AXIS_ANGLE);
  const sfc: Surface = { y: 0, kind: 0 };

  /** One ground return at road-frame (u, v). */
  const shoot = (u: number, v: number): void => {
    const x = dirX * u - dirZ * v;
    const z = dirZ * u + dirX * v;
    surface(u, v, x, z, sfc);
    const y = sfc.y + g() * 0.018; // ~2 cm scan noise
    let cr: number;
    let cg: number;
    let cb: number;
    if (sfc.kind === 1) {
      const s = 0.2 + rnd() * 0.05;
      const mark = Math.abs(Math.abs(v) - 3.2) < 0.06 || (Math.abs(v) < 0.08 && (u % 9) < 5); // edge + centre lines
      cr = mark ? 0.85 : s;
      cg = mark ? 0.84 : s + 0.005;
      cb = mark ? 0.8 : s + 0.02;
    } else if (sfc.kind === 2) {
      const s = 0.42 + rnd() * 0.08;
      cr = s;
      cg = s - 0.03;
      cb = s - 0.09;
    } else if (sfc.kind === 3) {
      const s = 0.3 + rnd() * 0.07;
      cr = s;
      cg = s + 0.05;
      cb = s - 0.06;
    } else if (sfc.kind === 4) {
      const s = 0.34 + rnd() * 0.07;
      cr = s + 0.04;
      cg = s + 0.02;
      cb = s - 0.08;
    } else {
      // Grass: greener in the hollows, drier on the ridges.
      const dry = Math.min(1, Math.max(0, (sfc.y - 4) / 6));
      cr = 0.22 + dry * 0.26 + rnd() * 0.05;
      cg = 0.36 + dry * 0.18 + rnd() * 0.06;
      cb = 0.16 + dry * 0.12 + rnd() * 0.04;
    }
    push(x, y, z, cr, cg, cb);
  };

  const nCorridor = Math.floor(count * 0.5); // dense strip along the road
  const nGround = Math.floor(count * 0.32);
  const nTrees = Math.floor(count * 0.13);

  for (let i = 0; i < nCorridor; i++) shoot((rnd() - 0.5) * AREA_U, (rnd() - 0.5) * 2 * (DITCH_OUT + SLOPE_W));
  for (let i = 0; i < nGround; i++) shoot((rnd() - 0.5) * AREA_U, (rnd() - 0.5) * AREA_V);

  // --- vegetation: tree crowns off the corridor --------------------------
  const trees = 22;
  const stop = w + nTrees;
  while (w < stop) {
    const b = Math.floor(rnd() * trees);
    const tu = ((b * 71.3) % AREA_U) - AREA_U / 2;
    const tv = (b % 2 ? 1 : -1) * (24 + ((b * 13.7) % 46));
    const tx = dirX * tu - dirZ * tv;
    const tz = dirZ * tu + dirX * tv;
    const base = terrain(tx, tz);
    const R = 1.9 + (b % 4) * 0.55;
    const a1 = rnd() * Math.PI * 2;
    const a2 = Math.acos(2 * rnd() - 1);
    const rr = R * Math.cbrt(rnd());
    push(
      tx + rr * Math.sin(a2) * Math.cos(a1),
      base + 2.6 + R * 0.9 + rr * Math.cos(a2),
      tz + rr * Math.sin(a2) * Math.sin(a1),
      0.13 + rnd() * 0.07,
      0.27 + rnd() * 0.13,
      0.11 + rnd() * 0.05,
    );
  }

  // --- a building off the road (walls only, as a scanner sees them) ------
  const bu = -58;
  const bv = 34;
  const bx = dirX * bu - dirZ * bv;
  const bz = dirZ * bu + dirX * bv;
  const bh = terrain(bx, bz);
  const BW = 14;
  const BD = 9;
  const BH = 6.5;
  while (w < count) {
    const side = Math.floor(rnd() * 4);
    const t = rnd();
    const lu = side < 2 ? (t - 0.5) * BW : (side === 2 ? -0.5 : 0.5) * BW;
    const lv = side < 2 ? (side === 0 ? -0.5 : 0.5) * BD : (t - 0.5) * BD;
    const y = bh + rnd() * BH;
    const s = 0.55 + g() * 0.06 - (y - bh) * 0.02;
    push(bx + dirX * lu - dirZ * lv + g() * 0.03, y, bz + dirZ * lu + dirX * lv + g() * 0.03, s, s - 0.03, s - 0.08);
  }

  shuffleCloud(positions, colors, count, rnd); // drawRange prefix = uniform subsample

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
  geometry.computeBoundingSphere();

  const sphere = geometry.boundingSphere!;
  return { geometry, positions, count, center: sphere.center.clone(), radius: sphere.radius };
}
