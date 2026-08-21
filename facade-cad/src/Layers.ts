/**
 * Layers — AutoCAD-style layer table driving entity appearance.
 *
 * Each layer owns two shared LineMaterials (normal / selected): restyling a
 * layer is a couple of uniform flips, entities never own materials.
 * Line widths are screen-space pixels (Line2), so the global lineweight
 * toggle (LWDISPLAY analogue) is one pass over the materials: off → every
 * line renders as a hairline, on → the layer's weight in mm.
 *
 * Linetypes ride on LineMaterial's dash support; dash lengths are in world
 * meters so patterns keep their physical scale at any zoom.
 */
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';

export type Linetype = 'solid' | 'dashed' | 'dotted' | 'dashdot';

export const LINETYPE_NAMES: Record<Linetype, string> = {
  solid: 'Сплошная',
  dashed: 'Штриховая',
  dotted: 'Пунктирная',
  dashdot: 'Штрихпункт.',
};

/** ГОСТ-ish lineweight ladder, mm. */
export const WEIGHTS = [0.13, 0.18, 0.25, 0.35, 0.5, 0.7, 1.0, 1.4, 2.0];

export interface Layer {
  name: string;
  color: string; // '#rrggbb'
  linetype: Linetype;
  weight: number; // mm
  visible: boolean;
  readonly mat: LineMaterial;
  readonly matSel: LineMaterial;
}

/** Selection highlight — the secondary accent (cyan). The primary mint is
 *  already spoken for by the osnap marker, so selection keeps its own hue. */
const SELECT_COLOR = '#38bdf8';
const HAIRLINE_PX = 1.6;
/** mm → screen px for weight display (damped 96-dpi ratio). */
const MM_TO_PX = 3.2;

const DEFAULT_COLORS = ['#dde6ff', '#f87171', '#fbbf24', '#4ade80', '#38bdf8', '#a78bfa', '#f472b6', '#fb923c'];

function dashParams(lt: Linetype): { dashSize: number; gapSize: number } {
  switch (lt) {
    case 'dashed':
      return { dashSize: 0.3, gapSize: 0.15 };
    case 'dotted':
      return { dashSize: 0.04, gapSize: 0.12 };
    case 'dashdot':
      return { dashSize: 0.65, gapSize: 0.3 };
    default:
      return { dashSize: 1, gapSize: 0 };
  }
}

export class LayerStore {
  readonly layers: Layer[] = [];
  current = '0';
  /** LWDISPLAY: true weights (on) vs hairlines (off). */
  showWeight = true;

  constructor() {
    this.add('0');
  }

  get(name: string): Layer {
    return this.layers.find((l) => l.name === name) ?? this.layers[0];
  }

  has(name: string): boolean {
    return this.layers.some((l) => l.name === name);
  }

  get currentLayer(): Layer {
    return this.get(this.current);
  }

  add(name?: string): Layer {
    let n = name;
    if (!n) {
      let i = this.layers.length;
      do n = `Слой ${i++}`;
      while (this.has(n));
    }
    const layer: Layer = {
      name: n,
      color: DEFAULT_COLORS[this.layers.length % DEFAULT_COLORS.length],
      linetype: 'solid',
      weight: 0.25,
      visible: true,
      mat: new LineMaterial({ linewidth: HAIRLINE_PX }),
      matSel: new LineMaterial({ linewidth: HAIRLINE_PX }),
    };
    this.layers.push(layer);
    this.applyLayer(layer);
    return layer;
  }

  /** Layer «0» is permanent; returns false when removal is refused. */
  remove(name: string): boolean {
    if (name === '0') return false;
    const i = this.layers.findIndex((l) => l.name === name);
    if (i < 0) return false;
    const [l] = this.layers.splice(i, 1);
    l.mat.dispose();
    l.matSel.dispose();
    if (this.current === name) this.current = '0';
    return true;
  }

  rename(oldName: string, newName: string): boolean {
    if (oldName === '0' || !newName || this.has(newName)) return false;
    const l = this.layers.find((x) => x.name === oldName);
    if (!l) return false;
    l.name = newName;
    if (this.current === oldName) this.current = newName;
    return true;
  }

  /** Push layer state into the shared materials (uniform flips only). */
  applyMaterials(): void {
    for (const l of this.layers) this.applyLayer(l);
  }

  private applyLayer(l: Layer): void {
    const px = this.showWeight ? Math.max(HAIRLINE_PX, l.weight * MM_TO_PX) : HAIRLINE_PX;
    const dash = dashParams(l.linetype);
    for (const m of [l.mat, l.matSel]) {
      m.linewidth = px;
      m.dashed = l.linetype !== 'solid';
      m.dashSize = dash.dashSize;
      m.gapSize = dash.gapSize;
      m.needsUpdate = true; // dashed flips a shader define
    }
    l.mat.color.set(l.color);
    l.matSel.color.set(SELECT_COLOR);
  }

  /** Line2 widths are computed against the render-target size — flip it to
   *  the scissored viewport before each pass (called by the Engine). */
  setResolution(w: number, h: number): void {
    for (const l of this.layers) {
      l.mat.resolution.set(w, h);
      l.matSel.resolution.set(w, h);
    }
  }

  // ------------------------------------------------------- persistence --
  // Single (de)serialization point: when the app moves to a server, swap
  // the localStorage calls in Engine for an API round-trip — the payload
  // stays exactly this JSON.

  serialize(): string {
    return JSON.stringify({
      current: this.current,
      showWeight: this.showWeight,
      layers: this.layers.map(({ name, color, linetype, weight, visible }) => ({ name, color, linetype, weight, visible })),
    });
  }

  /** Rebuild the table from a serialize() payload. False = bad payload. */
  restore(json: string): boolean {
    interface Saved {
      current?: string;
      showWeight?: boolean;
      layers?: { name: string; color: string; linetype: Linetype; weight: number; visible: boolean }[];
    }
    let data: Saved;
    try {
      data = JSON.parse(json) as Saved;
    } catch {
      return false;
    }
    if (!data.layers || !data.layers.length) return false;
    for (const l of this.layers) {
      l.mat.dispose();
      l.matSel.dispose();
    }
    this.layers.length = 0;
    for (const o of data.layers) {
      if (!o.name || this.has(o.name)) continue;
      const l = this.add(o.name);
      l.color = o.color ?? l.color;
      l.linetype = o.linetype ?? 'solid';
      l.weight = typeof o.weight === 'number' ? o.weight : 0.25;
      l.visible = o.visible !== false;
    }
    if (!this.has('0')) this.add('0'); // layer 0 is not optional
    this.current = data.current && this.has(data.current) ? data.current : '0';
    this.showWeight = data.showWeight !== false;
    this.applyMaterials();
    return true;
  }
}
