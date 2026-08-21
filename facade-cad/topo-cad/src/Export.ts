/**
 * Export — DXF (R12) writer and AutoCAD command-script generator.
 * Entities are flat (z = 0, UCS-local), so both exports are exact 2D.
 * The script route: paste (Ctrl+V) into the AutoCAD command line — the
 * primitives replay natively in the active drawing.
 */
import { ArcEntity, CadEntity, CircleEntity, EllipseEntity, PointEntity, PolylineEntity, TextEntity } from './Entities';
import type { Layer } from './Layers';

const f = (n: number) => (Math.abs(n) < 1e-9 ? '0' : n.toFixed(4));
const deg = (r: number) => (r * 180) / Math.PI;

/** Nearest AutoCAD Color Index for a '#rrggbb' layer color. */
const ACI: [number, number, number, number][] = [
  [255, 0, 0, 1],
  [255, 255, 0, 2],
  [0, 255, 0, 3],
  [0, 255, 255, 4],
  [0, 0, 255, 5],
  [255, 0, 255, 6],
  [255, 255, 255, 7],
  [128, 128, 128, 8],
  [192, 192, 192, 9],
];

function toAci(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  let best = 7;
  let bestD = Infinity;
  for (const [cr, cg, cb, idx] of ACI) {
    const d = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2;
    if (d < bestD) {
      bestD = d;
      best = idx;
    }
  }
  return best;
}

function ellipsePts(e: EllipseEntity): { x: number; y: number }[] {
  const c = e.points[0];
  const cr = Math.cos(e.rot);
  const sr = Math.sin(e.rot);
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < 72; i++) {
    const t = (i / 72) * Math.PI * 2;
    const ex = e.rx * Math.cos(t);
    const ey = e.ry * Math.sin(t);
    pts.push({ x: c.x + ex * cr - ey * sr, y: c.y + ex * sr + ey * cr });
  }
  return pts;
}

/** App linetype → DXF LTYPE name + dash pattern (49-codes, meters). */
const DXF_LTYPES: Record<string, { name: string; desc: string; dashes: number[] }> = {
  solid: { name: 'CONTINUOUS', desc: 'Solid line', dashes: [] },
  dashed: { name: 'DASHED', desc: '__ __ __', dashes: [0.3, -0.15] },
  dotted: { name: 'DOT', desc: '. . . .', dashes: [0, -0.12] },
  dashdot: { name: 'DASHDOT', desc: '__ . __ .', dashes: [0.5, -0.15, 0, -0.15] },
};

export function toDxf(list: readonly CadEntity[], layers?: readonly Pick<Layer, 'name' | 'color' | 'linetype'>[]): string {
  const out: string[] = [];
  // LTYPE + LAYER tables first — importers then keep names, colors and
  // REAL linetypes (the in-app dash patterns replayed as LTYPE records).
  if (layers && layers.length) {
    out.push('0', 'SECTION', '2', 'TABLES');
    const usedTypes = [...new Set(['solid', ...layers.map((l) => l.linetype)])];
    out.push('0', 'TABLE', '2', 'LTYPE', '70', String(usedTypes.length));
    for (const t of usedTypes) {
      const lt = DXF_LTYPES[t] ?? DXF_LTYPES.solid;
      const total = lt.dashes.reduce((s, d) => s + Math.abs(d), 0);
      out.push('0', 'LTYPE', '2', lt.name, '70', '64', '3', lt.desc, '72', '65', '73', String(lt.dashes.length), '40', f(total));
      for (const d of lt.dashes) out.push('49', f(d));
    }
    out.push('0', 'ENDTAB');
    out.push('0', 'TABLE', '2', 'LAYER', '70', String(layers.length));
    for (const l of layers) {
      const lt = DXF_LTYPES[l.linetype] ?? DXF_LTYPES.solid;
      out.push('0', 'LAYER', '2', l.name, '70', '0', '62', String(toAci(l.color)), '6', lt.name);
    }
    out.push('0', 'ENDTAB', '0', 'ENDSEC');
  }
  out.push('0', 'SECTION', '2', 'ENTITIES');
  const poly = (pts: readonly { x: number; y: number }[], closed: boolean, layer: string) => {
    out.push('0', 'POLYLINE', '8', layer, '66', '1', '70', closed ? '1' : '0');
    for (const p of pts) out.push('0', 'VERTEX', '8', layer, '10', f(p.x), '20', f(p.y), '30', '0');
    out.push('0', 'SEQEND');
  };
  for (const e of list) {
    const p0 = e.points[0];
    const l = e.layer;
    if (e instanceof CircleEntity) {
      out.push('0', 'CIRCLE', '8', l, '10', f(p0.x), '20', f(p0.y), '30', '0', '40', f(e.radius));
    } else if (e instanceof ArcEntity) {
      // DXF arcs are CCW start→end: flip for negative sweeps.
      const a0 = e.sweep >= 0 ? e.a0 : e.a0 + e.sweep;
      const a1 = e.sweep >= 0 ? e.a0 + e.sweep : e.a0;
      out.push('0', 'ARC', '8', l, '10', f(p0.x), '20', f(p0.y), '30', '0', '40', f(e.radius), '50', f(deg(a0)), '51', f(deg(a1)));
    } else if (e instanceof EllipseEntity) {
      poly(ellipsePts(e), true, l); // R12 has no ELLIPSE — sampled polyline
    } else if (e instanceof PointEntity) {
      out.push('0', 'POINT', '8', l, '10', f(p0.x), '20', f(p0.y), '30', '0');
      if (e.label) out.push('0', 'TEXT', '8', l, '10', f(p0.x + 0.65), '20', f(p0.y + 0.15), '30', '0', '40', '0.9', '1', e.label);
    } else if (e instanceof TextEntity) {
      out.push('0', 'TEXT', '8', l, '10', f(p0.x), '20', f(p0.y), '30', '0', '40', f(e.height), '50', f(deg(e.rotation)), '1', e.text);
    } else if (e instanceof PolylineEntity) {
      poly(e.points, e.closed, l);
    }
  }
  out.push('0', 'ENDSEC', '0', 'EOF');
  return out.join('\r\n');
}

export function toAcadScript(list: readonly CadEntity[]): string {
  let s = '';
  for (const e of list) {
    const p0 = e.points[0];
    if (e instanceof CircleEntity) {
      s += `_.CIRCLE\n${f(p0.x)},${f(p0.y)}\n${f(e.radius)}\n`;
    } else if (e instanceof ArcEntity) {
      const a0 = e.sweep >= 0 ? e.a0 : e.a0 + e.sweep;
      const a1 = e.sweep >= 0 ? e.a0 + e.sweep : e.a0;
      const sx = p0.x + Math.cos(a0) * e.radius;
      const sy = p0.y + Math.sin(a0) * e.radius;
      const ex = p0.x + Math.cos(a1) * e.radius;
      const ey = p0.y + Math.sin(a1) * e.radius;
      s += `_.ARC\n_C\n${f(p0.x)},${f(p0.y)}\n${f(sx)},${f(sy)}\n${f(ex)},${f(ey)}\n`;
    } else if (e instanceof EllipseEntity) {
      const ax = p0.x + e.rx * Math.cos(e.rot);
      const ay = p0.y + e.rx * Math.sin(e.rot);
      s += `_.ELLIPSE\n_C\n${f(p0.x)},${f(p0.y)}\n${f(ax)},${f(ay)}\n${f(e.ry)}\n`;
    } else if (e instanceof PointEntity) {
      s += `_.POINT\n${f(p0.x)},${f(p0.y)}\n`;
      if (e.label) s += `_.-TEXT\n${f(p0.x + 0.65)},${f(p0.y + 0.15)}\n0.9\n0\n${e.label}\n`;
    } else if (e instanceof TextEntity) {
      s += `_.-TEXT\n${f(p0.x)},${f(p0.y)}\n${f(e.height)}\n${f(deg(e.rotation))}\n${e.text}\n`;
    } else if (e instanceof PolylineEntity) {
      s += '_.PLINE\n';
      for (const p of e.points) s += `${f(p.x)},${f(p.y)}\n`;
      s += e.closed ? '_C\n' : '\n';
    }
  }
  return s;
}

export function downloadText(name: string, content: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: 'application/octet-stream' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
