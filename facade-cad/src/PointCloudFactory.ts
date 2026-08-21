/**
 * PointCloudFactory — deterministic synthetic scan of a building corner.
 *
 * Stands in for a real laser scan so the prototype runs standalone: a main
 * facade (rotated relative to the world axes — this is what makes the UCS
 * meaningful), window/door openings with interior returns behind the
 * glass, a perpendicular return wall, ground and vegetation clutter.
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
  /** 0..255 на канал (нормализуется атрибутом). На десятках миллионов
   *  точек Float32-цвет — это лишние сотни МБ и в куче, и на GPU. */
  colors: Uint8Array;
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
      if (r <= 1 && g <= 1 && b <= 1) {
        r *= 255;
        g *= 255;
        b *= 255;
      }
      col.push(Math.min(255, r), Math.min(255, g), Math.min(255, b));
    } else if (c.length >= 4 && isFinite(+c[3])) {
      const i = Math.min(255, +c[3] > 1 ? +c[3] : +c[3] * 255);
      col.push(i, i, i);
    } else {
      col.push(179, 173, 166);
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
  return { positions, colors: Uint8Array.from(col), count, origin: { x: ox + shift.cx, y: oy + shift.cy, z: oz + shift.cz } };
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
 *  becomes true decimation with proportional GPU savings. The kd split
 *  (CloudIndex) is order-preserving inside a leaf, so the property
 *  survives indexing: a LEAF prefix is a uniform subsample of that leaf. */
export function shuffleCloud(pos: Float32Array, col: Uint8Array | Float32Array, count: number, rand: () => number = Math.random): void {
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

const WALL_ANGLE = 0.42; // rad — facade is deliberately NOT axis-aligned
const WALL_LEN = 14;
const WALL_H = 9;
const SIDE_LEN = 8;

/** A valid, empty cloud. The app boots with this so nothing heavy runs
 *  before the user has actually chosen a scan — the demo is generated in
 *  the worker on demand, and an import never pays for it at all. */
export function emptyCloud(): DemoCloud {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(0), 3));
  geometry.setAttribute('aColor', new THREE.BufferAttribute(new Uint8Array(0), 3, true));
  geometry.setAttribute('aKey', new THREE.BufferAttribute(new Float32Array(0), 1));
  return { geometry, positions: new Float32Array(0), count: 0, center: new THREE.Vector3(), radius: 10 };
}

export function buildDemoCloud(count = 420_000): DemoCloud {
  const rnd = mulberry32(1337);
  const g = () => rnd() + rnd() + rnd() - 1.5; // ~gaussian, sigma ≈ 0.5

  const positions = new Float32Array(count * 3);
  const colors = new Uint8Array(count * 3);
  let w = 0;

  const push = (x: number, y: number, z: number, r: number, gr: number, b: number): void => {
    positions[w * 3] = x;
    positions[w * 3 + 1] = y;
    positions[w * 3 + 2] = z;
    // Генераторы ниже дают 0..1 — атрибут хранится байтами (см. ParsedCloud).
    colors[w * 3] = Math.min(255, r * 255);
    colors[w * 3 + 1] = Math.min(255, gr * 255);
    colors[w * 3 + 2] = Math.min(255, b * 255);
    w++;
  };

  const dirX = Math.cos(WALL_ANGLE);
  const dirZ = Math.sin(WALL_ANGLE);
  const nrmX = -dirZ; // (dir × up) — horizontal wall normal
  const nrmZ = dirX;
  const ox = -6;
  const oz = -3;

  // 4 × 3 window grid + a door — all treated as openings.
  const isOpening = (u: number, v: number): boolean => {
    if (u > 6.35 && u < 7.65 && v < 2.3) return true; // door
    for (let c = 0; c < 4; c++) {
      const u0 = 1.7 + c * 3.1;
      if (u < u0 || u > u0 + 1.5) continue;
      for (let r = 0; r < 3; r++) {
        const v0 = 1.6 + r * 2.4;
        if (v >= v0 && v <= v0 + 1.5) return true;
      }
    }
    return false;
  };

  const nWall = Math.floor(count * 0.62);
  const nSide = Math.floor(count * 0.12);
  const nGround = Math.floor(count * 0.18);

  // --- main facade -------------------------------------------------------
  for (let i = 0; i < nWall; i++) {
    const u = rnd() * WALL_LEN;
    const v = rnd() * WALL_H;
    let depth = g() * 0.05; // ~2.5 cm scan noise around the wall plane
    let cr: number;
    let cg: number;
    let cb: number;
    if (isOpening(u, v)) {
      if (rnd() < 0.72) {
        // sparse interior returns through the glass
        depth = -(0.5 + rnd() * 2.4);
        const s = 0.09 + rnd() * 0.08;
        cr = s;
        cg = s;
        cb = s + 0.03;
      } else {
        // frame / reveal at the window plane
        depth = -0.28 + g() * 0.02;
        cr = 0.16 + rnd() * 0.04;
        cg = 0.17 + rnd() * 0.04;
        cb = 0.2 + rnd() * 0.04;
      }
    } else {
      const band = 1 - 0.06 * (Math.sin(v * 9) > 0.7 ? 1 : 0); // masonry hint
      const ao = 0.7 + 0.3 * Math.min(1, v / 1.8); // grounded darkening
      cr = (0.76 + g() * 0.05) * ao * band;
      cg = (0.7 + g() * 0.05) * ao * band;
      cb = (0.6 + g() * 0.05) * ao * band;
    }
    push(ox + dirX * u + nrmX * depth, v + g() * 0.01, oz + dirZ * u + nrmZ * depth, cr, cg, cb);
  }

  // --- perpendicular return wall (the reason isolation matters) ----------
  const cx2 = ox + dirX * WALL_LEN;
  const cz2 = oz + dirZ * WALL_LEN;
  for (let i = 0; i < nSide; i++) {
    const u = rnd() * SIDE_LEN;
    const v = rnd() * WALL_H;
    const depth = g() * 0.05;
    const ao = 0.55 + 0.25 * Math.min(1, v / 1.8);
    push(cx2 + nrmX * u + dirX * depth, v + g() * 0.01, cz2 + nrmZ * u + dirZ * depth, (0.62 + g() * 0.05) * ao, (0.6 + g() * 0.05) * ao, (0.58 + g() * 0.05) * ao);
  }

  // --- ground ------------------------------------------------------------
  const bcx = ox + dirX * (WALL_LEN / 2);
  const bcz = oz + dirZ * (WALL_LEN / 2);
  for (let i = 0; i < nGround; i++) {
    const x = bcx + (rnd() - 0.5) * 46;
    const z = bcz + (rnd() - 0.5) * 36;
    const green = rnd() < 0.3 ? 0.05 : 0;
    const s = 0.26 + rnd() * 0.07;
    push(x, g() * 0.04, z, s, s + green, s - 0.02);
  }

  // --- vegetation blobs --------------------------------------------------
  while (w < count) {
    const b = Math.floor(rnd() * 5);
    const cX = bcx + nrmX * (4 + b * 1.7) + dirX * ((b - 2) * 4.2);
    const cZ = bcz + nrmZ * (4 + b * 1.7) + dirZ * ((b - 2) * 4.2);
    const R = 0.7 + (b % 3) * 0.5;
    const a1 = rnd() * Math.PI * 2;
    const a2 = Math.acos(2 * rnd() - 1);
    const rr = R * Math.cbrt(rnd());
    push(
      cX + rr * Math.sin(a2) * Math.cos(a1),
      Math.max(0.05, R * 0.9 + rr * Math.cos(a2)),
      cZ + rr * Math.sin(a2) * Math.sin(a1),
      0.16 + rnd() * 0.08,
      0.3 + rnd() * 0.12,
      0.14 + rnd() * 0.06,
    );
  }

  shuffleCloud(positions, colors, count, rnd); // drawRange prefix = uniform subsample

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3, true));
  geometry.computeBoundingSphere();

  const sphere = geometry.boundingSphere!;
  return { geometry, positions, count, center: sphere.center.clone(), radius: sphere.radius };
}
