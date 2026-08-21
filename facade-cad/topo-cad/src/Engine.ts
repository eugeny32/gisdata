/**
 * Engine — application root and ToolHost implementation.
 *
 * Owns the single WebGLRenderer + scene, wires input to the tool state
 * machine, and flips per-viewport uniforms so one immutable point buffer
 * serves three differently-clipped views:
 *
 *   ПЛАН  — top-down drafting view, optional height slab («срез»);
 *   РЕЗ   — vertical cut at the cursor, ПОПЕРЕЧНИК ⇄ ПРОДОЛЬНИК;
 *   3D    — perspective check view with a cloud window around the cursor.
 *
 * TRACKING AND FREEZING. The cut and the 3D view follow the drafting
 * cursor, but each one owns an ANCHOR that is updated only while it is
 * tracking. Focusing a pane (click, wheel, keys 2/3) freezes its anchor,
 * so the camera AND the clip slab stop dead — moving the mouse over the
 * plan no longer slides the picture out from under you. Key 1 (or drawing
 * in the plan again) resumes tracking.
 *
 * Also hosts the cross-cutting CAD services:
 *  - snapshot-based undo/redo over the entity store (Ctrl+Z / Ctrl+Y);
 *  - the named-UCS registry (create by two clicks along the axis, switch
 *    via the ribbon dropdown; linework keeps its WORLD position on switch
 *    via rebase).
 *
 * Performance contract:
 *  - the animation loop performs zero allocations (module temps only);
 *  - the cloud is filtered exclusively on the GPU (see ShaderFactory);
 *  - CPU passes over the cloud happen only on discrete user actions
 *    (lasso apply, UCS pick) — never per frame.
 */
import * as THREE from 'three';
import { SectionMode, Viewport, ViewportManager, ViewportName } from './ViewportManager';
import { UCSManager } from './UCSManager';
import { SnapEngine } from './SnapEngine';
import { CadEntity, EntityStore, MAT_GHOST_LINE2, setLayerProvider } from './Entities';
import { LayerStore, Linetype } from './Layers';
import { ToolHost, ToolManager } from './CADTools';
import { CloudUniforms, createPointCloudMaterial, MAX_LASSO_VERTS, pointInPolyFlat } from './ShaderFactory';
import { DemoCloud, emptyCloud } from './PointCloudFactory';
import { downloadText, toAcadScript, toDxf } from './Export';
import { UI } from './UI';

const _p = new THREE.Vector3();
const _center = new THREE.Vector3();
const _fd = new THREE.Vector3();
const _pd = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _up = new THREE.Vector3();
const _oldUcs = new THREE.Matrix4();
const _zeroVec = new THREE.Vector3();
const _snapProbe = new THREE.Vector3();

const UNDO_CAP = 50;
/** Tile width along the axis, metres — the spatial unit of drawRange. */
const TILE_M = 1.0;
const _range = { start: 0, count: 0 };

/** Live state of one cut orientation. Both are remembered, so flipping
 *  ПОПЕРЕЧНИК ⇄ ПРОДОЛЬНИК restores the window you had set for it. */
interface SectionState {
  /** Slab thickness across the cut, metres. */
  thick: number;
  /** How much ground the cut spans on screen, metres. */
  span: number;
  /** Vertical exaggeration (1 = true scale). */
  exag: number;
}

interface WorkerMsg {
  type: 'ready' | 'progress' | 'done' | 'error';
  p?: number;
  phase?: string;
  message?: string;
  positions?: Float32Array;
  colors?: Float32Array;
  count?: number;
  origin?: { x: number; y: number; z: number } | null;
}

interface UcsEntry {
  name: string;
  matrix: THREE.Matrix4;
}

/** Per-viewport cloud display settings, applied as uniform flips. */
export interface CloudViewSettings {
  size: number;
  opacity: number;
  density: number;
  mode: number; // 0 RGB · 1 intensity · 2 height ramp
}

export class Engine implements ToolHost {
  readonly scene = new THREE.Scene();
  readonly renderer: THREE.WebGLRenderer;
  readonly vpm: ViewportManager;
  readonly ucs = new UCSManager();
  readonly snap = new SnapEngine();
  readonly layers = new LayerStore();
  readonly store: EntityStore;
  readonly ui: UI;
  readonly tools: ToolManager;
  snapOn = true;
  orthoOn = false;

  private readonly cloud: DemoCloud;
  private readonly cloudUniforms: CloudUniforms;
  /** Indices inside the lasso — snapping/picking only, never rendering. */
  private isolated: Uint32Array | null = null;

  private sectionMode: SectionMode = 'cross';
  private readonly sections: Record<SectionMode, SectionState> = {
    cross: { thick: 0.6, span: 30, exag: 3 },
    long: { thick: 0.6, span: 120, exag: 5 },
  };

  /** Height slab for the plan view: only points within `sliceThick` of
   *  `sliceZ` (UCS-local elevation) are drawn AND snapped — this is how
   *  the bare ground is read out from under vegetation. */
  private sliceOn = false;
  private sliceZ = 0;
  private sliceThick = 0.5;
  /** UCS-local elevation range of the isolated area — drives the slider. */
  private zMin = 0;
  private zMax = 10;

  /** Datum for elevation labels: UCS-local z that reads as zero. */
  deviationRef: number | null = 0;
  /** Origin removed from the scan on import, in SOURCE (survey) axes. World
   *  point → scan coordinates is one addition through worldToSource(). */
  private cloudOrigin: { x: number; y: number; z: number } | null = null;
  private panning: Viewport | null = null;
  private panX = 0;
  private panY = 0;
  private frames = 0;
  private fpsT = performance.now();
  private mainMode: 'top' | 'draft' = 'top';
  /** Pane that owns the commands right now. Merely MOVING the mouse across
   *  another pane no longer changes it — only a click/wheel there or the
   *  1/2/3 keys do. */
  private activePane: ViewportName = 'main';
  /** Live cursor in UCS-local space: x station, y offset, z GROUND
   *  elevation under it (not the drafting plane — a cut centred on the
   *  datum would look at empty sky). */
  private readonly cursorLocal = new THREE.Vector3();
  /** Frozen copies: what the cut and the 3D view are actually aimed at. */
  private readonly sectionAnchor = new THREE.Vector3();
  private readonly isoAnchor = new THREE.Vector3();
  private sectionFollow = false;
  private isoFollow = false;

  private readonly cloudSettings: Record<ViewportName, CloudViewSettings> = {
    // Plan defaults to the height ramp: a topographic plan reads as relief
    // long before anyone touches the settings.
    main: { size: 2, opacity: 1, density: 1, mode: 2 },
    section: { size: 2, opacity: 1, density: 1, mode: 0 },
    iso: { size: 2, opacity: 1, density: 0.6, mode: 2 },
  };
  private readonly ucsList: UcsEntry[] = [];
  /** −1 = МСК (world overview, full cloud, axis labels visible). */
  private activeUcs = -1;
  private readonly ucsLabels = new THREE.Group();
  private cloudPoints!: THREE.Points;
  private importWorker: Worker | null = null;
  private workerReady = false;
  private pendingJob: { name: string; file: File } | null = null;
  private pendingDemo = false;
  /** Compact copy of the isolated points (vertex work ∝ site, not cloud). */
  private compactGeo: THREE.BufferGeometry | null = null;
  /** Tile index over the compact buffer: prefix sums of per-tile counts. */
  private tileStart: Int32Array | null = null;
  private tileMinX = 0;
  private tileInv = 1;
  private tileCount = 1;
  private layerUiQueued = false;
  /** Cloud points submitted across ALL panes this frame (status readout). */
  private framePts = 0;
  private framePtsShown = 0;
  private renderCount = 0;
  private readonly undoStack: string[] = [];
  private readonly redoStack: string[] = [];

  // --------------------------------------------------- server persistence
  // gisdata integration: layers + drawing + UCS list round-trip through
  // /api/topo_cad_session.php (Postgres/PostGIS, one row per admin/user)
  // instead of localStorage — see markDirty/flushDirtySave/
  // restoreSessionFromServer below and sql/schema.sql::topo_cad_sessions.
  private readonly sessionApiUrl = '/api/topo_cad_session.php';
  private cloudName: string | null = null;
  private dirty = false;
  private saving = false;

  constructor() {
    const canvas = document.getElementById('gl') as HTMLCanvasElement;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });

    // Entities resolve colors/linetypes/weights through the layer table.
    // The table is a user standard, not drawing data. Restoring it (along
    // with the drawing + UCS list) now happens over the network — see
    // restoreSessionFromServer(), fired at the end of this constructor.
    setLayerProvider(this.layers);

    // --- point cloud (single immutable buffer, GPU-clipped) --------------
    // Boot empty: generating the 420k-point demo synchronously stalled the
    // first frames on slow machines, and an import threw it away anyway.
    this.cloud = emptyCloud();
    const { material, uniforms } = createPointCloudMaterial();
    this.cloudUniforms = uniforms;
    this.attachKeys(this.cloud.geometry, this.cloud.count);
    this.cloudPoints = new THREE.Points(this.cloud.geometry, material);
    this.cloudPoints.frustumCulled = false; // scissored cameras + shader-collapsed points
    this.cloudPoints.layers.set(4); // per-viewport cloud visibility
    this.scene.add(this.cloudPoints);
    this.renderCount = this.cloud.count;
    this.scene.add(this.ucsLabels);

    // Height range for the "по высоте" color ramp (one-time pass).
    let yMin = Infinity;
    let yMax = -Infinity;
    const pp = this.cloud.positions;
    for (let i = 1; i < pp.length; i += 3) {
      if (pp[i] < yMin) yMin = pp[i];
      if (pp[i] > yMax) yMax = pp[i];
    }
    uniforms.uMinY.value = isFinite(yMin) ? yMin : 0;
    uniforms.uYRangeInv.value = 1 / Math.max(1e-3, yMax - yMin);

    // --- UCS + entities --------------------------------------------------
    this.scene.add(this.ucs.group);
    this.scene.add(this.ucs.axesHelper);
    this.store = new EntityStore(this.ucs.group);

    // Ground grid for spatial reference — isometric viewport only (layer 2).
    const grid = new THREE.GridHelper(400, 80, 0x3a3350, 0x241f30);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.5;
    grid.layers.set(2);
    this.scene.add(grid);

    // --- viewports -------------------------------------------------------
    this.vpm = new ViewportManager(this.renderer, this.scene, document.getElementById('orbit-pad') as HTMLElement);
    this.vpm.setIsoView(this.cloud.center, this.cloud.radius);
    this.vpm.onBeforeViewport = (vp) => this.applyViewportUniforms(vp);

    // --- UI + tools ------------------------------------------------------
    this.ui = new UI({
      onRibbonHeight: (px) => {
        this.vpm.setTopOffset(px);
        this.ui.setActivePane(this.activePane, this.vpm[this.activePane].css);
      },
      onTool: (id) => this.tools.activate(id),
      onErase: () => this.eraseSelection(),
      onUndo: () => this.undo(),
      onRedo: () => this.redo(),
      onToggleSnap: () => this.setSnap(!this.snapOn),
      onToggleOrtho: () => this.setOrtho(!this.orthoOn),
      onToggleSectionMode: () => {
        this.sectionMode = this.sectionMode === 'cross' ? 'long' : 'cross';
        this.syncSectionUI();
        this.applySectionView();
        this.ui.setHint(
          this.sectionMode === 'cross'
            ? 'Окно 2: ПОПЕРЕЧНИК — рез поперёк оси в точке курсора: профиль дороги, кюветы, откосы'
            : 'Окно 2: ПРОДОЛЬНИК — рез вдоль оси: ход земли по трассе, насыпи и выемки',
        );
      },
      onSectionThick: (v) => {
        this.section.thick = v;
        this.ui.setSectionThick(v);
      },
      onSectionSpan: (v) => {
        this.section.span = v;
        this.ui.setSectionSpan(v);
        this.applySectionView();
      },
      onSectionExag: (v) => {
        this.section.exag = v;
        this.vpm.setExaggeration(this.vpm.section, v);
        this.ui.setSectionExag(v);
      },
      onCursorArea: (v) => {
        this.cloudUniforms.uCurHalf.value = v / 2; // slider = full box size, m
      },
      onToggleSlice: () => {
        this.sliceOn = !this.sliceOn;
        this.ui.setSlice(this.sliceOn, this.sliceZ, this.sliceThick);
      },
      onSliceZ: (v) => {
        this.sliceZ = v;
        this.sliceOn = true; // двинули ползунок — срез сразу виден
        this.ui.setSlice(true, v, this.sliceThick);
      },
      onSliceThick: (v) => {
        this.sliceThick = v;
        this.ui.setSlice(this.sliceOn, this.sliceZ, v);
      },
      onUcsSelect: (i) => this.onUcsSelect(i),
      onToggleLayer: (name) => this.toggleEntityLayer(name),
      onOpenCloudPanel: (name) => this.ui.openCloudPanel(name, this.cloudSettings[name]),
      onCloudSetting: (name, key, v) => {
        this.cloudSettings[name][key] = v;
      },
      onToggleCloud: (name) => {
        const cam = this.vpm[name].camera;
        cam.layers.toggle(4);
        this.ui.setCloudVisible(name, cam.layers.isEnabled(4));
      },
      onImportFile: (file) => void this.importCloud(file),
      onExportDxf: () => this.exportDxf(),
      onToCad: () => void this.toCad(),
      onRenameUcs: () => this.renameUcs(),
      onDemoStart: () => this.requestDemo(),
      // ------------------------------------------------------- layers --
      onLayerAdd: () => {
        const l = this.layers.add();
        this.layers.current = l.name;
        this.layersChanged();
      },
      onLayerDelete: (name) => {
        if (!this.layers.remove(name)) return;
        this.store.reassignLayer(name, '0'); // orphans drop to layer 0
        this.layersChanged();
      },
      onLayerRename: (name) => {
        const next = window.prompt('Имя слоя:', name);
        if (!next || !next.trim() || next.trim() === name) return;
        const clean = next.trim();
        if (!this.layers.rename(name, clean)) {
          this.ui.setHint('Слой не переименован: имя занято или это слой «0»');
          return;
        }
        this.store.renameLayerRefs(name, clean);
        this.layersChanged();
      },
      onLayerCurrent: (name) => {
        this.layers.current = name;
        this.layersChanged();
      },
      onLayerColor: (name, color) => {
        this.layers.get(name).color = color;
        this.layersChanged();
      },
      onLayerType: (name, lt) => {
        this.layers.get(name).linetype = lt as Linetype;
        this.layersChanged();
      },
      onLayerWeight: (name, w) => {
        this.layers.get(name).weight = w;
        this.layersChanged();
      },
      onLayerToggleVisible: (name) => {
        const l = this.layers.get(name);
        l.visible = !l.visible;
        this.layersChanged();
      },
      onAssignToLayer: () => this.assignSelectionTo(this.layers.current),
      onLayerCombo: (name) => {
        if (!name) return; // the "— разные —" placeholder
        // AutoCAD behaviour: with a selection the combo MOVES it, otherwise
        // it just switches the layer new geometry lands on.
        if (this.store.selection.size) this.assignSelectionTo(name);
        else {
          this.layers.current = name;
          this.layersChanged();
        }
      },
      onToggleWeightDisplay: () => {
        this.layers.showWeight = !this.layers.showWeight;
        this.layersChanged();
      },
    });
    this.tools = new ToolManager(this);

    this.bindInput(canvas);
    this.ui.setSnap(this.snapOn);
    this.ui.setOrtho(false);
    this.syncSectionUI();
    this.ui.setSlice(false, 0, this.sliceThick);
    // Layer combo follows what is picked (AutoCAD-style retargeting).
    this.store.onChange = () => this.queueLayerUI();
    this.layersChanged();
    window.addEventListener('resize', () => this.ui.setActivePane(this.activePane, this.vpm[this.activePane].css));
    this.setActivePane('main');
    this.loadUcsList();
    this.refreshUcsUI();
    this.rebuildUcsLabels();
    this.enterTopView();
    this.tools.activate('isolate');
    this.ui.showStart(true); // startup: import (or demo) first
    this.ensureWorker(); // pre-warm: dev-mode worker compilation is slow

    // Server session (Postgres/PostGIS) — see the "server session" section
    // below. Runs after the start overlay is already up, so the restored
    // drawing is simply there once the user gets past import/demo.
    void this.restoreSessionFromServer();
    window.setInterval(() => this.flushDirtySave(), 8000);
    window.addEventListener('beforeunload', () => this.flushDirtySave(true));
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') this.flushDirtySave(true);
    });
  }

  start(): void {
    this.renderer.setAnimationLoop(() => this.loop());
  }

  /** Settings of the cut orientation currently on screen. */
  private get section(): SectionState {
    return this.sections[this.sectionMode];
  }

  // ------------------------------------------------------------ rendering

  /** requestAnimationFrame body — strictly allocation-free. */
  private loop(): void {
    if (this.ucs.defined && this.activeUcs >= 0) {
      // The cut: a live slice glued to the drafting cursor.
      if (this.sectionFollow) {
        this.ucs.localToWorld(this.sectionAnchor, _pd);
        this.sectionEye(_dir).multiplyScalar(600).add(_pd);
        _fd.subVectors(_dir, this.vpm.section.camera.position);
        if (_fd.lengthSq() > 1e-6) this.vpm.section.camera.position.addScaledVector(_fd, 0.2);
      }
      // The 3D view: pan towards the cursor, keeping the user's orbit
      // angle and zoom.
      if (this.isoFollow) {
        this.ucs.localToWorld(this.isoAnchor, _pd);
        _fd.subVectors(_pd, this.vpm.orbit.target);
        if (_fd.lengthSq() > 1e-6) {
          _fd.multiplyScalar(0.12);
          this.vpm.orbit.target.add(_fd);
          this.vpm.iso.camera.position.add(_fd);
        }
      }
    }
    // LMB in the iso view: draw while a command is armed, orbit otherwise.
    const drawing = this.tools.active !== null && this.tools.active.id !== 'select';
    this.vpm.orbit.mouseButtons.LEFT = drawing ? (null as unknown as THREE.MOUSE) : THREE.MOUSE.ROTATE;
    this.vpm.update();
    this.framePts = 0;
    this.vpm.render();
    this.framePtsShown = this.framePts;
    this.tickFps();
  }

  /** Same material, different clipping per pass: uniform flips are ~free
   *  compared to touching a 400k-point attribute buffer. */
  private applyViewportUniforms(vp: Viewport): void {
    this.tools.applyViewportScale(vp); // screen-true marker/crosshair size
    // Line2 widths are resolution-relative: aim them at THIS scissor rect.
    this.layers.setResolution(vp.gl.w, vp.gl.h);
    MAT_GHOST_LINE2.resolution.set(vp.gl.w, vp.gl.h);
    const u = this.cloudUniforms;
    const s = this.cloudSettings[vp.name];
    u.uIsPersp.value = vp.name === 'iso' ? 1 : 0;
    u.uSize.value = s.size;
    u.uOpacity.value = s.opacity;
    u.uMode.value = s.mode;
    // Decimation moved into the shader (aKey vs uDensity) because drawRange
    // now carries the SPATIAL tile range instead of a shuffle prefix.
    u.uDensity.value = s.density;
    const live = this.ucs.defined && this.activeUcs >= 0;
    // Plan: height slab clip (толщина + отметка среза).
    u.uSliceClip.value = vp.name === 'main' && this.sliceOn && live ? 1 : 0;
    u.uSliceMin.value = this.sliceZ - this.sliceThick / 2;
    u.uSliceMax.value = this.sliceZ + this.sliceThick / 2;
    // The cut: a slab across one horizontal axis, bounded along the other
    // so a single ditch or a single kilometre reads on its own. Driven by
    // the ANCHOR, never the raw pointer — the slab and the camera looking
    // at it must freeze together.
    u.uSectionEnabled.value = vp.name === 'section' && live ? 1 : 0;
    if (u.uSectionEnabled.value === 1) {
      const cx = this.sectionAnchor.x;
      const cy = this.sectionAnchor.y;
      const d = this.section.thick / 2;
      const w = this.section.span / 2;
      if (this.sectionMode === 'cross') {
        // Thin along the axis, wide across it.
        u.uBoxMin.value.set(cx - d, cy - w, -1e6);
        u.uBoxMax.value.set(cx + d, cy + w, 1e6);
      } else {
        // Thin across the axis, long along it.
        u.uBoxMin.value.set(cx - w, cy - d, -1e6);
        u.uBoxMax.value.set(cx + w, cy + d, 1e6);
      }
    }
    // 3D view economy: show only a window of the cloud around the cursor.
    u.uCurClip.value = vp.name === 'iso' && live ? 1 : 0;
    u.uCurPos.value.copy(this.isoAnchor);
    this.applyTileRange(vp);
  }

  /** Submit only the tiles this pass can actually see. Every clip in the app
   *  is bounded along the axis (station) direction, so one contiguous range
   *  always suffices: the cut slab, the cut window, or the visible plan. */
  private applyTileRange(vp: Viewport): void {
    const geo = this.cloudPoints.geometry;
    if (!this.tileStart || !this.ucs.defined || this.activeUcs < 0) {
      geo.setDrawRange(0, this.renderCount); // МСК overview — no axis index
      this.framePts += this.renderCount;
      return;
    }
    if (vp.name === 'section') {
      const cx = this.sectionAnchor.x;
      const half = (this.sectionMode === 'cross' ? this.section.thick : this.section.span) / 2;
      this.rangeForX(cx - half, cx + half);
    } else if (vp.name === 'iso') {
      const half = this.cloudUniforms.uCurHalf.value;
      this.rangeForX(this.isoAnchor.x - half, this.isoAnchor.x + half);
    } else {
      // Plan: the ortho frustum is axis-aligned in UCS, so its visible
      // station interval is exactly what has to be drawn — zooming in cuts
      // the vertex load proportionally.
      this.ucs.worldToLocal(vp.camera.position, _p);
      const halfW = (vp.frustumHeight * (vp.css.w / Math.max(1, vp.css.h))) / 2;
      this.rangeForX(_p.x - halfW, _p.x + halfW);
    }
    geo.setDrawRange(_range.start, _range.count);
    this.framePts += _range.count;
  }

  private tickFps(): void {
    this.frames++;
    const now = performance.now();
    if (now - this.fpsT >= 500) {
      this.ui.setFps(Math.round((this.frames * 1000) / (now - this.fpsT)), this.framePtsShown);
      this.frames = 0;
      this.fpsT = now;
    }
  }

  // ------------------------------------------------------------ undo/redo

  /** Push an undo snapshot — tools call this BEFORE mutating geometry.
   *  Doubles as the dirty signal for server autosave (every tool commit
   *  routes through here — see markDirty/flushDirtySave). */
  snapshot(): void {
    this.undoStack.push(this.store.serialize());
    if (this.undoStack.length > UNDO_CAP) this.undoStack.shift();
    this.redoStack.length = 0;
    this.markDirty();
  }

  private undo(): void {
    const prev = this.undoStack.pop();
    if (prev === undefined) return;
    this.redoStack.push(this.store.serialize());
    this.store.restore(prev);
    this.tools.resetActive(); // drop previews/ghosts that referenced old objects
    this.markDirty();
  }

  private redo(): void {
    const next = this.redoStack.pop();
    if (next === undefined) return;
    this.undoStack.push(this.store.serialize());
    this.store.restore(next);
    this.tools.resetActive();
    this.markDirty();
  }

  private eraseSelection(): void {
    if (!this.store.selection.size) return;
    this.snapshot();
    this.store.deleteSelected();
  }

  /** Move the current selection onto `name`; colour, linetype and weight
   *  follow the layer automatically (entities never own materials). */
  private assignSelectionTo(name: string): void {
    const n = this.store.selection.size;
    if (!n) {
      this.ui.setHint('Сначала выберите объекты, затем назначьте слой');
      return;
    }
    this.snapshot();
    for (const e of this.store.selection) e.layer = name;
    this.store.refreshAll();
    this.layersChanged();
    this.ui.setHint(`Перенесено на слой «${name}»: ${n} об. — цвет и тип линии теперь по слою`);
  }

  /** Coalesce UI refreshes to one per frame. A marquee over 500 objects
   *  fires 500 selection events; rebuilding the panel DOM on each of them
   *  was a multi-hundred-millisecond stall on a slow machine. */
  private queueLayerUI(): void {
    if (this.layerUiQueued) return;
    this.layerUiQueued = true;
    requestAnimationFrame(() => {
      this.layerUiQueued = false;
      this.syncLayerUI();
    });
  }

  /** Selection/content changed: re-aim the layer combo and the row counts. */
  private syncLayerUI(): void {
    const names = this.layers.layers.map((l) => l.name);
    const hasSel = this.store.selection.size > 0;
    const shown = hasSel ? this.store.selectionLayer() : this.layers.current;
    this.ui.setLayerCombo(names, shown, hasSel, this.layers.get(shown ?? this.layers.current).color);
    this.ui.renderLayers(
      this.layers.layers.map((l) => ({
        name: l.name,
        color: l.color,
        linetype: l.linetype,
        weight: l.weight,
        visible: l.visible,
        current: l.name === this.layers.current,
        count: this.store.countOnLayer(l.name),
      })),
    );
  }

  /** Any layer mutation funnels here: refresh materials, entities, UI,
   *  and persist the table (Postgres/PostGIS — see markDirty/flushDirtySave). */
  private layersChanged(): void {
    this.layers.applyMaterials();
    this.store.refreshAll();
    this.markDirty();
    this.syncLayerUI();
    this.ui.setWeightPill(this.layers.showWeight);
  }

  /** Per-viewport CAD-linework visibility (camera layer 3 toggle). */
  private toggleEntityLayer(name: ViewportName): void {
    const cam = this.vpm[name].camera;
    cam.layers.toggle(3);
    this.ui.setLayerVisible(name, cam.layers.isEnabled(3));
  }

  // ------------------------------------------------------------- ToolHost

  applyLasso(worldPts: readonly THREE.Vector3[]): void {
    const n = Math.min(worldPts.length, MAX_LASSO_VERTS);
    // Flat fence + its bbox. The bbox is the whole trick: a working area
    // covers a few percent of a scan, so two compares reject almost every
    // point before the O(verts) edge walk ever runs.
    const px = new Float32Array(n);
    const pz = new Float32Array(n);
    let bx0 = Infinity;
    let bx1 = -Infinity;
    let bz0 = Infinity;
    let bz1 = -Infinity;
    for (let i = 0; i < n; i++) {
      const p = worldPts[i];
      px[i] = p.x;
      pz[i] = p.z;
      if (p.x < bx0) bx0 = p.x;
      if (p.x > bx1) bx1 = p.x;
      if (p.z < bz0) bz0 = p.z;
      if (p.z > bz1) bz1 = p.z;
    }

    // One-time CPU pass: point-in-polygon → the isolated-point index used by
    // the snap grid, the tile builder and UCS picking. Sized exactly once
    // (a growing number[] of ~100k entries was its own stall).
    const pos = this.cloud.positions;
    const total = this.cloud.count;
    const hit = new Uint8Array(total);
    let kept = 0;
    for (let i = 0; i < total; i++) {
      const x = pos[i * 3];
      const z = pos[i * 3 + 2];
      if (x < bx0 || x > bx1 || z < bz0 || z > bz1) continue;
      if (pointInPolyFlat(x, z, px, pz, n)) {
        hit[i] = 1;
        kept++;
      }
    }
    const idx = new Uint32Array(kept);
    for (let i = 0, k = 0; i < total; i++) {
      if (hit[i]) idx[k++] = i;
    }
    this.isolated = idx;
    this.buildCompact(); // also (re)builds the snap grid when a UCS exists

    this.ui.setHint(`Выделено ${kept.toLocaleString('ru-RU')} точек — ШАГ 2/3: задайте ось двумя кликами (вдоль трассы или разбивки)`);
  }

  clearLasso(): void {
    this.isolated = null;
    this.useCompact(false);
    if (this.compactGeo) {
      this.compactGeo.dispose();
      this.compactGeo = null;
    }
  }

  /** Rebuild a dense buffer from the isolated indices — after isolation the
   *  vertex shader touches only the working area, not the whole scan. */
  private buildCompact(): void {
    if (this.compactGeo) this.compactGeo.dispose();
    this.compactGeo = null;
    this.tileStart = null;
    if (!this.isolated || !this.isolated.length) return;
    const n = this.isolated.length;
    const srcP = this.cloud.positions;
    const srcC = (this.cloud.geometry.getAttribute('aColor') as THREE.BufferAttribute).array as Float32Array;

    // --- TILING: bucket-sort the area by its own X (station along the axis)
    // so every clip this app uses — the cut slab, the cut window, the
    // visible plan — collapses to ONE contiguous drawRange instead of a
    // full 400k-vertex pass. The counting sort is stable, so the within-tile
    // order stays the pre-shuffled cloud order and aKey remains uniform.
    // Between the lasso and the UCS there is no axis yet — copy the points
    // straight through and index them once the UCS lands.
    const tiled = this.ucs.defined;
    const localX = new Float32Array(n);
    // UCS-local copy of the same points: the snap grid needs exactly this,
    // so computing it once here spares a second transform pass.
    let localAll: Float32Array | null = null;
    let minX = 0;
    let maxX = 1;
    let zLo = Infinity;
    let zHi = -Infinity;
    if (tiled) {
      // Multiply out the matrix ROWS instead of a full Vector3.applyMatrix4
      // per point — same numbers, a fraction of the work.
      const e = this.ucs.inverse.elements;
      localAll = new Float32Array(n * 3);
      minX = Infinity;
      maxX = -Infinity;
      for (let k = 0; k < n; k++) {
        const i = this.isolated[k] * 3;
        const wx = srcP[i];
        const wy = srcP[i + 1];
        const wz = srcP[i + 2];
        const x = e[0] * wx + e[4] * wy + e[8] * wz + e[12];
        const z = e[2] * wx + e[6] * wy + e[10] * wz + e[14];
        localAll[k * 3] = x;
        localAll[k * 3 + 1] = e[1] * wx + e[5] * wy + e[9] * wz + e[13];
        localAll[k * 3 + 2] = z;
        localX[k] = x;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (z < zLo) zLo = z;
        if (z > zHi) zHi = z;
      }
      // Elevation range of the area drives the height-slice slider.
      this.zMin = zLo;
      this.zMax = zHi;
      this.sliceZ = THREE.MathUtils.clamp(this.sliceZ, zLo, zHi);
      this.ui.setSliceRange(zLo, zHi);
      this.ui.setSlice(this.sliceOn, this.sliceZ, this.sliceThick);
    }
    const span = Math.max(1e-6, maxX - minX);
    const tiles = tiled ? Math.max(1, Math.min(4096, Math.ceil(span / TILE_M))) : 1;
    const inv = tiles / (span * (1 + 1e-6));
    const counts = new Int32Array(tiles + 1);
    const tileOf = new Int32Array(n);
    for (let k = 0; k < n; k++) {
      const t = Math.min(tiles - 1, Math.max(0, Math.floor((localX[k] - minX) * inv)));
      tileOf[k] = t;
      counts[t + 1]++;
    }
    for (let t = 0; t < tiles; t++) counts[t + 1] += counts[t]; // prefix sums

    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    const key = new Float32Array(n);
    const localSorted = localAll ? new Float32Array(n * 3) : null;
    const cursor = Int32Array.from(counts.subarray(0, tiles));
    for (let k = 0; k < n; k++) {
      const dst = cursor[tileOf[k]]++;
      const i = this.isolated[k] * 3;
      if (localAll && localSorted) {
        localSorted[dst * 3] = localAll[k * 3];
        localSorted[dst * 3 + 1] = localAll[k * 3 + 1];
        localSorted[dst * 3 + 2] = localAll[k * 3 + 2];
      }
      pos[dst * 3] = srcP[i];
      pos[dst * 3 + 1] = srcP[i + 1];
      pos[dst * 3 + 2] = srcP[i + 2];
      col[dst * 3] = srcC[i];
      col[dst * 3 + 1] = srcC[i + 1];
      col[dst * 3 + 2] = srcC[i + 2];
      key[dst] = k / n; // source order is shuffled → uniform decimation key
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    geo.setAttribute('aKey', new THREE.BufferAttribute(key, 1));
    // computeBoundingSphere() is another full pass and the cloud runs with
    // frustumCulled = false anyway — hand it the scan's own sphere.
    geo.boundingSphere = new THREE.Sphere(this.cloud.center.clone(), this.cloud.radius);
    this.compactGeo = geo;
    this.tileStart = tiled ? counts : null;
    this.tileMinX = minX;
    this.tileInv = inv;
    this.tileCount = tiles;
    if (localSorted) this.snap.buildLocal(localSorted, n);
    this.useCompact(true);
  }

  /** Buffer range covering the ground between local X = x0 and x1. Falls
   *  back to the whole buffer when there is no tile index (МСК overview). */
  private rangeForX(x0: number, x1: number): void {
    const ts = this.tileStart;
    if (!ts) {
      _range.start = 0;
      _range.count = this.renderCount;
      return;
    }
    const c0 = Math.min(this.tileCount - 1, Math.max(0, Math.floor((x0 - this.tileMinX) * this.tileInv)));
    const c1 = Math.min(this.tileCount - 1, Math.max(0, Math.floor((x1 - this.tileMinX) * this.tileInv)));
    _range.start = ts[c0];
    _range.count = Math.max(0, ts[c1 + 1] - ts[c0]);
  }

  /** Uniform decimation key for a whole-cloud buffer. The source order is
   *  pre-shuffled, so index/count is already a uniform random in [0,1). */
  private attachKeys(geo: THREE.BufferGeometry, count: number): void {
    const key = new Float32Array(count);
    for (let i = 0; i < count; i++) key[i] = i / count;
    geo.setAttribute('aKey', new THREE.BufferAttribute(key, 1));
  }

  /** Swap the rendered buffer: compact area ↔ full cloud (МСК overview). */
  private useCompact(on: boolean): void {
    if (on && this.compactGeo) {
      this.cloudPoints.geometry = this.compactGeo;
      this.renderCount = this.isolated ? this.isolated.length : this.cloud.count;
    } else {
      this.cloudPoints.geometry = this.cloud.geometry;
      this.renderCount = this.cloud.count;
    }
  }

  /** Nearest cloud point to a pick ray. Brute force over the isolated set
   *  (or a stride-3 subsample before isolation) — click-time only. */
  pickCloudPoint(ray: THREE.Ray, out: THREE.Vector3): boolean {
    const pos = this.cloud.positions;
    let bestD2 = 1.0; // ignore hits further than 1 m from the ray
    let best = -1;
    if (this.isolated) {
      for (let k = 0; k < this.isolated.length; k++) {
        const i = this.isolated[k];
        _p.fromArray(pos, i * 3);
        const d2 = ray.distanceSqToPoint(_p);
        if (d2 < bestD2) {
          bestD2 = d2;
          best = i;
        }
      }
    } else {
      for (let i = 0; i < this.cloud.count; i += 3) {
        _p.fromArray(pos, i * 3);
        const d2 = ray.distanceSqToPoint(_p);
        if (d2 < bestD2) {
          bestD2 = d2;
          best = i;
        }
      }
    }
    if (best < 0) return false;
    out.fromArray(pos, best * 3);
    return true;
  }

  /** Create a NEW named UCS from two axis points and make it active. */
  defineUcs(p1: THREE.Vector3, p2: THREE.Vector3): void {
    const rebase = this.ucs.defined && this.store.entities.length > 0;
    if (rebase) _oldUcs.copy(this.ucs.matrix);
    this.ucs.setFromPoints(p1, p2);
    if (rebase) this.store.rebase(_oldUcs, this.ucs.inverse);

    this.ucsList.push({ name: `Ось ${this.ucsList.length + 1}`, matrix: this.ucs.matrix.clone() });
    this.activeUcs = this.ucsList.length - 1;
    this.afterUcsChange();
    this.markDirty();
  }

  /** Dropdown: index 0 = МСК (overview), 1.. = saved axes. */
  private onUcsSelect(i: number): void {
    if (i === 0) this.enterWorldMode();
    else this.activateUcs(i - 1);
  }

  private activateUcs(i: number): void {
    if (i === this.activeUcs || i < 0 || i >= this.ucsList.length) return;
    const rebase = this.ucs.defined && this.store.entities.length > 0;
    if (rebase) _oldUcs.copy(this.ucs.matrix);
    this.ucs.setFromMatrix(this.ucsList[i].matrix);
    if (rebase) this.store.rebase(_oldUcs, this.ucs.inverse);
    this.activeUcs = i;
    this.afterUcsChange();
    this.markDirty();
  }

  /** МСК: whole cloud in plan + name labels at each saved axis. */
  private enterWorldMode(): void {
    this.activeUcs = -1;
    this.ucs.plane.normal.set(0, 1, 0);
    this.ucs.plane.constant = 0;
    this.useCompact(false); // show the whole cloud
    this.ucsLabels.visible = true;
    this.ui.showSectionPanels(false);
    this.refreshUcsUI();
    this.enterTopView();
    this.vpm.setIsoView(this.cloud.center, this.cloud.radius);
    this.tools.activate('select');
    this.ui.setHint('МСК — обзор всего облака. Выберите ось из списка, чтобы вернуться к черчению');
    this.markDirty();
  }

  private afterUcsChange(): void {
    this.cloudUniforms.uUcsInv.value.copy(this.ucs.inverse);
    this.buildCompact(); // tiles + snap grid, both indexed on the station axis
    this.ucsLabels.visible = false;
    this.refreshUcsUI();
    this.rebuildUcsLabels();
    this.ui.showSectionPanels(true);
    this.deviationRef = 0; // отметки считаются от нуля облака, пока не задан горизонт
    this.enterDraftView(true);
  }

  private refreshUcsUI(): void {
    this.ui.setUcsList(['МСК', ...this.ucsList.map((u) => u.name)], this.activeUcs + 1);
  }

  private renameUcs(): void {
    if (this.activeUcs < 0) return;
    const entry = this.ucsList[this.activeUcs];
    const name = window.prompt('Имя оси (ПСК):', entry.name);
    if (name && name.trim()) {
      entry.name = name.trim();
      this.refreshUcsUI();
      this.rebuildUcsLabels();
      this.markDirty();
    }
  }

  // -------------------------------------------------- import / export --

  /** Parsing runs in a Web Worker: the UI keeps painting and the progress
   *  counter moves even on 500 MB files. */
  private async importCloud(file: File): Promise<void> {
    this.ui.setProgress('Чтение файла… 0%');
    this.cloudName = file.name; // informational only, see topo_cad_sessions.cloud_name
    // The File object is structured-clonable: the worker reads it via
    // File.slice, so multi-GB clouds never allocate one giant buffer here.
    this.ensureWorker();
    if (this.workerReady) this.importWorker!.postMessage({ name: file.name, file });
    else this.pendingJob = { name: file.name, file }; // flushed on 'ready'
  }

  /** Demo scan is built in the worker — the main thread keeps painting. */
  private requestDemo(): void {
    this.ui.setProgress('Генерация демо-рельефа…');
    this.ensureWorker();
    if (this.workerReady) this.importWorker!.postMessage({ demo: true });
    else this.pendingDemo = true; // flushed on 'ready'
  }

  private ensureWorker(): void {
    if (this.importWorker) return;
    this.importWorker = new Worker(new URL('./cloud.worker.ts', import.meta.url), { type: 'module' });
    this.importWorker.onmessage = (e) => this.onWorkerMessage(e.data as WorkerMsg);
    this.importWorker.onerror = (e) => {
      this.ui.setProgress(null);
      this.ui.setHint(`Ошибка импорта: ${e.message || 'сбой парсера (см. консоль)'}`);
    };
  }

  private onWorkerMessage(m: WorkerMsg): void {
    if (m.type === 'ready') {
      this.workerReady = true;
      if (this.pendingJob) {
        this.importWorker!.postMessage(this.pendingJob);
        this.pendingJob = null;
      } else if (this.pendingDemo) {
        this.pendingDemo = false;
        this.importWorker!.postMessage({ demo: true });
      }
    } else if (m.type === 'progress') {
      this.ui.setProgress(m.phase ?? `Загрузка… ${Math.round((m.p ?? 0) * 100)}%`);
    } else if (m.type === 'error') {
      this.ui.setProgress(null);
      this.ui.setHint(`Ошибка импорта: ${m.message}`);
    } else if (m.type === 'done' && m.positions && m.colors) {
      this.ui.setProgress(null);
      this.ui.showStart(false);
      this.cloudOrigin = m.origin ?? null;
      this.applyCloud(m.positions, m.colors, m.count ?? m.positions.length / 3);
    }
  }

  private applyCloud(positions: Float32Array, colors: Float32Array, count: number): void {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    this.attachKeys(geo, count);
    geo.computeBoundingSphere();
    this.cloudPoints.geometry.dispose();
    this.cloudPoints.geometry = geo;
    this.cloud.geometry = geo;
    this.cloud.positions = positions;
    this.cloud.count = count;
    this.renderCount = count;

    // New cloud = new document: drop the drawing, undo history and the
    // previous cloud's axis list.
    this.store.clearSelection();
    for (const e of [...this.store.entities]) this.store.remove(e);
    this.undoStack.length = 0;
    this.redoStack.length = 0;
    this.ucsList.length = 0;
    this.activeUcs = -1;
    this.ucs.reset();
    this.cloudUniforms.uUcsInv.value.identity();
    this.refreshUcsUI();
    this.rebuildUcsLabels();
    this.ui.showSectionPanels(false);
    this.markDirty(); // persist the now-empty document, not the old one
    const s = geo.boundingSphere!;
    this.cloud.center.copy(s.center);
    this.cloud.radius = s.radius;
    let yMin = Infinity;
    let yMax = -Infinity;
    for (let i = 1; i < positions.length; i += 3) {
      if (positions[i] < yMin) yMin = positions[i];
      if (positions[i] > yMax) yMax = positions[i];
    }
    this.cloudUniforms.uMinY.value = yMin;
    this.cloudUniforms.uYRangeInv.value = 1 / Math.max(1e-3, yMax - yMin);
    this.zMin = yMin;
    this.zMax = yMax;
    this.clearLasso();
    this.snap.clear();
    this.sliceOn = false;
    this.sliceZ = (yMin + yMax) / 2;
    this.ui.setSliceRange(yMin, yMax);
    this.ui.setSlice(false, this.sliceZ, this.sliceThick);
    // A fresh scan gets a sane cloud window in 3D: metres, not the 2 m
    // detail box a facade wanted.
    this.cloudUniforms.uCurHalf.value = Math.max(10, this.cloud.radius * 0.15);
    this.ui.setCursorArea(this.cloudUniforms.uCurHalf.value * 2);
    this.vpm.setIsoView(this.cloud.center, this.cloud.radius);
    this.enterTopView();
    this.tools.activate('isolate');
    this.ui.setHint(`Импортировано ${count.toLocaleString('ru-RU')} точек — обведите участок контуром`);
  }

  /** THREE world → the scan's own survey coordinates. Import mapped
   *  (X, Y, Z_up) to (x, z, −y) and subtracted an origin; this undoes both,
   *  so a drawing can leave in МСК exactly where the scan lives. */
  private worldToSource(w: THREE.Vector3, out: THREE.Vector3): THREE.Vector3 {
    const o = this.cloudOrigin;
    // Undo the import shift in THREE axes, then swap back: three (x, up, z)
    // came from survey (E, N, H) as (E, H, −N).
    const fx = w.x + (o ? o.x : 0);
    const fy = w.y + (o ? o.y : 0);
    const fz = w.z + (o ? o.z : 0);
    out.set(fx, -fz, fy); // E, N, H
    return out;
  }

  /** True when the coordinate combo sits on МСК — the export then leaves in
   *  the scan's own system instead of the axis UCS. */
  private get exportInWorld(): boolean {
    return this.activeUcs < 0 && this.ucs.defined;
  }

  /** Entities carry UCS-local points; for a world export they are lifted to
   *  the scan system first. Returns a detached copy — the drawing itself is
   *  never moved. */
  private exportGeometry(list: readonly CadEntity[]): CadEntity[] {
    if (!this.exportInWorld) return [...list];
    const out: CadEntity[] = [];
    for (const e of list) {
      const c = e.makeCopy(_zeroVec);
      for (const p of c.points) {
        this.ucs.localToWorld(p, _p);
        this.worldToSource(_p, p);
      }
      c.rebuild();
      out.push(c);
    }
    return out;
  }

  private exportList(): CadEntity[] {
    return this.store.selection.size ? [...this.store.selection] : [...this.store.entities];
  }

  private exportDxf(): void {
    const list = this.exportList();
    if (!list.length) {
      this.ui.setHint('Нечего экспортировать — начертите что-нибудь');
      return;
    }
    const geo = this.exportGeometry(list);
    downloadText('topo.dxf', toDxf(geo, this.layers.layers));
    for (const g of geo) if (!list.includes(g)) g.dispose();
    this.ui.setHint(`DXF сохранён: ${list.length} об., координаты ${this.exportInWorld ? 'МСК облака' : 'активной ПСК (ось)'}`);
  }

  private async toCad(): Promise<void> {
    const list = this.exportList();
    if (!list.length) {
      this.ui.setHint('Нечего отправлять — выберите или начертите объекты');
      return;
    }
    const geo = this.exportGeometry(list);
    const script = toAcadScript(geo);
    for (const g of geo) if (!list.includes(g)) g.dispose();
    // Direct route: dev-server bridge pushes the script into the running
    // AutoCAD via COM. Falls back to the clipboard if unavailable.
    try {
      const r = await fetch('/api/tocad', { method: 'POST', body: script });
      if (r.ok) {
        this.ui.setHint(`Отправлено в AutoCAD: ${list.length} об. в ${this.exportInWorld ? 'МСК облака' : 'ПСК оси'}`);
        return;
      }
    } catch {
      /* no bridge (static hosting) — fall through */
    }
    try {
      await navigator.clipboard.writeText(script);
      this.ui.setHint('AutoCAD не запущен? Скрипт в буфере — Ctrl+V в командную строку AutoCAD');
    } catch {
      this.ui.setHint('Буфер обмена недоступен — используйте экспорт DXF');
    }
  }

  // ------------------------------------------------ UCS labels + storage

  private rebuildUcsLabels(): void {
    for (const c of [...this.ucsLabels.children]) {
      const s = c as THREE.Sprite;
      s.material.map?.dispose();
      s.material.dispose();
      this.ucsLabels.remove(s);
    }
    for (const u of this.ucsList) {
      const canvas = document.createElement('canvas');
      const font = '600 44px "Segoe UI", system-ui, sans-serif';
      let ctx = canvas.getContext('2d')!;
      ctx.font = font;
      canvas.width = Math.ceil(ctx.measureText(u.name).width) + 24;
      canvas.height = 64;
      ctx = canvas.getContext('2d')!;
      ctx.font = font;
      ctx.fillStyle = 'rgba(22, 21, 28, 0.8)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#f472b6';
      ctx.textBaseline = 'middle';
      ctx.fillText(u.name, 12, 34);
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
      const h = 4;
      sprite.scale.set((h * canvas.width) / canvas.height, h, 1);
      sprite.position.setFromMatrixPosition(u.matrix);
      sprite.position.y += 6;
      sprite.renderOrder = 5;
      this.ucsLabels.add(sprite);
    }
  }

  /** Axis lists are SESSION-scoped: an axis only means something for the
   *  cloud and the drawing it was built with, and both die with the tab.
   *  This call only purges legacy keys. */
  private loadUcsList(): void {
    this.ucsLabels.visible = false;
    try {
      localStorage.removeItem('topocad.ucs'); // legacy global list
      localStorage.removeItem('topocad.layers'); // legacy, see constructor
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith('topocad.ucs:')) localStorage.removeItem(k);
      }
    } catch {
      /* storage denied — nothing to purge */
    }
  }

  // ----------------------------------------------- server session (Postgres/PostGIS)

  private serializeUcsList(): string {
    return JSON.stringify({
      list: this.ucsList.map((u) => ({ name: u.name, matrix: u.matrix.toArray() })),
      active: this.activeUcs,
    });
  }

  /** Rebuild the named-axis registry and reactivate whichever one was active
   *  when the session was saved (or МСК overview if none was). Bypasses
   *  defineUcs/activateUcs on purpose — those also mark the session dirty
   *  and rebase the (still-empty, at this point) entity store, neither of
   *  which is wanted while restoring. */
  private restoreUcsList(json: string): void {
    interface Saved {
      list?: { name: string; matrix: number[] }[];
      active?: number;
    }
    let data: Saved;
    try {
      data = JSON.parse(json) as Saved;
    } catch {
      return;
    }
    if (!data.list || !data.list.length) return;
    this.ucsList.length = 0;
    for (const u of data.list) {
      if (!u.name || !Array.isArray(u.matrix) || u.matrix.length !== 16) continue;
      this.ucsList.push({ name: u.name, matrix: new THREE.Matrix4().fromArray(u.matrix) });
    }
    this.refreshUcsUI();
    this.rebuildUcsLabels();
    if (typeof data.active === 'number' && data.active >= 0 && data.active < this.ucsList.length) {
      this.ucs.setFromMatrix(this.ucsList[data.active].matrix);
      this.activeUcs = data.active;
      this.afterUcsChange();
    }
  }

  private markDirty(): void {
    this.dirty = true;
  }

  /** Debounced-by-interval autosave: a periodic timer (see constructor)
   *  calls this and it's a no-op unless something actually changed since
   *  the last successful save. `sync` (beforeunload) fires a best-effort
   *  keepalive request instead of waiting on the usual fetch promise.
   *  `entities` goes over as a parsed ARRAY (not a pre-stringified blob) —
   *  api/topo_cad_session.php fans each element out into a row with a
   *  real PostGIS `geometry` column (see sql/schema.sql::topo_cad_entities)
   *  instead of one opaque JSON text field. */
  private flushDirtySave(sync = false): void {
    if (!this.dirty || this.saving) return;
    const payload = JSON.stringify({
      action: 'save',
      layers: this.layers.serialize(),
      entities: JSON.parse(this.store.serialize()),
      ucs: this.serializeUcsList(),
      cloud_name: this.cloudName,
    });
    this.dirty = false;
    if (sync) {
      // Page is closing — fetch() may be cancelled mid-flight; keepalive
      // lets the browser finish sending it after the page unloads.
      void fetch(this.sessionApiUrl, { method: 'POST', body: payload, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {});
      return;
    }
    this.saving = true;
    fetch(this.sessionApiUrl, { method: 'POST', body: payload, headers: { 'Content-Type': 'application/json' } })
      .catch(() => {
        this.dirty = true; // retry on the next tick — network hiccup, not a data problem
      })
      .finally(() => {
        this.saving = false;
      });
  }

  /** Fired once at startup: pulls this admin's/user's last-saved
   *  layers/drawing/UCS list from Postgres (see api/topo_cad_session.php).
   *  Best-effort — a failed/empty response just leaves the tool at its
   *  built-in defaults, same as before this endpoint existed. `entities`
   *  comes back as a plain JSON array (reassembled server-side from PostGIS
   *  rows) — re-stringify it once here so EntityStore.restore() (a
   *  JSON-string API, shared with the undo/redo snapshot format) doesn't
   *  need its own array overload. */
  private async restoreSessionFromServer(): Promise<void> {
    try {
      const r = await fetch(this.sessionApiUrl);
      if (!r.ok) return;
      const data = (await r.json()) as { layers?: string; entities?: unknown[]; ucs?: string; cloud_name?: string };
      if (data.layers) this.layers.restore(data.layers);
      this.layers.applyMaterials();
      if (data.entities && data.entities.length) this.store.restore(JSON.stringify(data.entities));
      if (data.ucs) this.restoreUcsList(data.ucs);
      if (data.cloud_name) this.cloudName = data.cloud_name;
      this.syncLayerUI();
      this.ui.setWeightPill(this.layers.showWeight);
    } catch {
      /* offline/API down — start with defaults, exactly like before */
    }
  }

  /** Drafting is meaningless in МСК overview (entities live in axis UCS). */
  canDraft(): boolean {
    return !(this.ucs.defined && this.activeUcs < 0);
  }

  /** ToolHost: pick a scan point and make its elevation the datum. */
  setDeviationRef(ray: THREE.Ray): boolean {
    if (!this.ucs.defined || this.activeUcs < 0) {
      this.ui.setHint('Сначала задайте ось — отметки считаются в её системе координат');
      return false;
    }
    if (!this.pickCloudPoint(ray, _p)) {
      this.ui.setHint('Не удалось поймать точку скана — целься в облако');
      return false;
    }
    this.ucs.worldToLocal(_p, _dir);
    this.deviationRef = _dir.z;
    this.ui.setHint(`Горизонт задан на отметке ${_dir.z.toFixed(3)} м — кликайте точки, превышения появятся подписями`);
    return true;
  }

  // ToolHost: snapping honors the height slice when it is active.
  get snapZMin(): number {
    return this.sliceOn ? this.sliceZ - this.sliceThick / 2 : -Infinity;
  }

  get snapZMax(): number {
    return this.sliceOn ? this.sliceZ + this.sliceThick / 2 : Infinity;
  }

  enterTopView(): void {
    _center.copy(this.cloud.center);
    _center.y = 0;
    this.vpm.setTopView(_center, this.cloud.radius * 1.7);
    this.mainMode = 'top';
    this.ui.setPaneLabel('main', 'ПЛАН · МСК · ВИД СВЕРХУ');
  }

  /** Align the plan camera to the active axis and re-frame the cut and the
   *  3D view. Re-frames only when coming from the world view (or after an
   *  axis change) so tool switching never steals the user's zoom. */
  enterDraftView(force = false): void {
    if (!this.ucs.defined || this.activeUcs < 0) return; // МСК stays in world plan
    if (this.mainMode === 'draft' && !force) return;
    const b = this.snap.localBounds;
    const vp = this.vpm.main;
    const aspect = vp.css.w / Math.max(1, vp.css.h);
    let fH = 60;
    if (this.snap.ready && !b.isEmpty()) {
      b.getCenter(_p);
      _p.z = 0;
      this.ucs.localToWorld(_p, _center);
      fH = THREE.MathUtils.clamp(Math.max((b.max.y - b.min.y) * 1.2, ((b.max.x - b.min.x) * 1.2) / aspect), 5, 4000);
      this.cursorLocal.set((b.min.x + b.max.x) / 2, (b.min.y + b.max.y) / 2, (this.zMin + this.zMax) / 2);
    } else {
      _center.copy(this.ucs.origin);
      this.cursorLocal.set(0, 0, (this.zMin + this.zMax) / 2);
    }
    this.sectionAnchor.copy(this.cursorLocal);
    this.isoAnchor.copy(this.cursorLocal);
    // Plan: look straight down the elevation axis, station to the right.
    this.vpm.setOrthoView(vp, this.ucs.zAxis, this.ucs.yAxis, _center, fH);
    this.applySectionView();
    this.ucs.localToWorld(this.isoAnchor, _p);
    this.vpm.setIsoView(_p, Math.max(8, this.cloudUniforms.uCurHalf.value * 1.6));
    this.setFollow(true);
    this.mainMode = 'draft';
    this.ui.setPaneLabel('main', 'ПЛАН · ЧЕРЧЕНИЕ ПО ОСИ');
  }

  /** Eye direction of the cut camera.
   *  ПОПЕРЕЧНИК stands behind the station and looks ALONG the axis, so the
   *  right of the screen is the right-hand side of the route;
   *  ПРОДОЛЬНИК stands off to the right and looks ACROSS, so stations grow
   *  to the right and elevation is up. */
  private sectionEye(out: THREE.Vector3): THREE.Vector3 {
    return this.sectionMode === 'cross' ? out.copy(this.ucs.xAxis).negate() : out.copy(this.ucs.yAxis).negate();
  }

  /** Re-frame the cut around its anchor (after a mode/window change). */
  private applySectionView(): void {
    if (!this.ucs.defined || this.activeUcs < 0) return;
    const vp = this.vpm.section;
    const st = this.section;
    this.ucs.localToWorld(this.sectionAnchor, _center);
    _up.copy(this.ucs.zAxis);
    // The window runs HORIZONTALLY on screen in both cuts, so «охват» is
    // divided by the aspect to mean "this much ground fills the pane".
    const fH = (st.span * 1.05) / Math.max(0.2, vp.css.w / Math.max(1, vp.css.h));
    this.vpm.setOrthoView(vp, this.sectionEye(_dir), _up, _center, fH);
    this.vpm.setExaggeration(vp, st.exag);
    this.ui.setPaneLabel('section', this.sectionMode === 'cross' ? 'ПОПЕРЕЧНИК · РЕЗ ПОПЕРЁК ОСИ' : 'ПРОДОЛЬНИК · РЕЗ ВДОЛЬ ОСИ');
  }

  /** Push the active cut's numbers into its control strip. */
  private syncSectionUI(): void {
    const st = this.section;
    this.ui.setSectionMode(this.sectionMode);
    this.ui.setSectionThick(st.thick);
    this.ui.setSectionSpan(st.span);
    this.ui.setSectionExag(st.exag);
    this.vpm.setExaggeration(this.vpm.section, st.exag);
  }

  // ------------------------------------------------------------- settings

  private setSnap(v: boolean): void {
    this.snapOn = v;
    this.ui.setSnap(v);
  }

  private setOrtho(v: boolean): void {
    this.orthoOn = v;
    this.refreshOrthoUI();
  }

  /** Start/stop cursor tracking for BOTH dependent panes. Frozen panes keep
   *  their anchor, so the slab stays exactly where it was. */
  private setFollow(on: boolean): void {
    this.sectionFollow = on;
    this.isoFollow = on;
    this.ui.setPaneFrozen('section', !on);
    this.ui.setPaneFrozen('iso', !on);
  }

  /** Focus a pane. Focusing a view pane means "I drive this one by hand" —
   *  it freezes on the spot; focusing the plan resumes tracking. */
  private setActivePane(name: ViewportName): void {
    this.activePane = name;
    if (name === 'main') {
      this.setFollow(true);
    } else if (name === 'section') {
      this.sectionFollow = false;
      this.ui.setPaneFrozen('section', true);
    } else {
      this.isoFollow = false;
      this.ui.setPaneFrozen('iso', true);
    }
    this.ui.setActivePane(name, this.vpm[name].css);
  }

  private refreshOrthoUI(): void {
    this.ui.setOrtho(this.tools.orthoActive);
  }

  // ---------------------------------------------------------------- input

  private bindInput(canvas: HTMLCanvasElement): void {
    canvas.addEventListener('pointerdown', (e) => {
      const vp = this.vpm.viewportAt(e.clientX, e.clientY);
      if (!vp) return;
      // ANY button on a pane focuses it: grabbing a view with the middle
      // button is exactly the moment it must stop chasing the cursor.
      this.setActivePane(vp.name);
      if (e.button === 1) {
        if (vp.camera instanceof THREE.OrthographicCamera) {
          this.panning = vp;
          this.panX = e.clientX;
          this.panY = e.clientY;
          canvas.setPointerCapture(e.pointerId);
        }
        e.preventDefault();
        return;
      }
      if (vp.name === 'main' && e.button === 0) this.tools.pointerDown(e, vp);
    });

    canvas.addEventListener('pointermove', (e) => {
      if (this.panning) {
        this.vpm.pan(this.panning, e.clientX - this.panX, e.clientY - this.panY);
        this.panX = e.clientX;
        this.panY = e.clientY;
        return;
      }
      const vp = this.vpm.viewportAt(e.clientX, e.clientY);
      if (!vp) return;
      // CAD cursor: crosshair only while a drawing/editing command is armed.
      const drawing = this.tools.active !== null && this.tools.active.id !== 'select';
      canvas.style.cursor = vp.name === 'main' && drawing ? 'crosshair' : 'default';
      if (vp.name !== 'main') return;
      this.tools.pointerMove(e, vp);
      const p = this.tools.pointer;
      if (p.valid) {
        const h = this.groundElevation(p.local.x, p.local.y);
        if (this.exportInWorld) {
          this.worldToSource(p.world, _p);
          this.ui.setCoords(_p.x, _p.y, _p.z, true);
        } else {
          this.ui.setCoords(p.local.x, p.local.y, h, false);
        }
        this.cursorLocal.x = p.local.x;
        this.cursorLocal.y = p.local.y;
        // Ease the elevation: raw snap hits jump between ground and canopy.
        if (h !== null) this.cursorLocal.z += (h - this.cursorLocal.z) * 0.25;
        if (this.sectionFollow) this.sectionAnchor.copy(this.cursorLocal);
        if (this.isoFollow) this.isoAnchor.copy(this.cursorLocal);
      }
      this.refreshOrthoUI();
    });

    const pad = document.getElementById('orbit-pad') as HTMLElement;
    pad.addEventListener('pointerdown', (e) => {
      this.setActivePane('iso');
      // Drafting directly in the iso viewport (LMB while a command is armed).
      if (e.button === 0 && this.tools.active && this.tools.active.id !== 'select') this.tools.pointerDown(e, this.vpm.iso);
    });
    pad.addEventListener('pointermove', (e) => {
      const drawing = this.tools.active !== null && this.tools.active.id !== 'select';
      pad.style.cursor = drawing ? 'crosshair' : 'default';
      if (!drawing) return;
      this.tools.pointerMove(e, this.vpm.iso);
      const p = this.tools.pointer;
      if (p.valid) this.ui.setCoords(p.local.x, p.local.y, null, false);
    });
    pad.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.tools.finish();
    });
    pad.addEventListener(
      'wheel',
      () => {
        this.setActivePane('iso'); // scrolling the 3D view = driving it
      },
      { passive: true },
    );

    canvas.addEventListener('pointerup', (e) => {
      if (this.panning && e.button === 1) {
        this.panning = null;
        canvas.releasePointerCapture(e.pointerId);
        return;
      }
      const vp = this.vpm.viewportAt(e.clientX, e.clientY);
      if (vp && vp.name === 'main' && e.button === 0) this.tools.pointerUp(e, vp);
    });

    canvas.addEventListener(
      'wheel',
      (e) => {
        const vp = this.vpm.viewportAt(e.clientX, e.clientY);
        if (!vp || !(vp.camera instanceof THREE.OrthographicCamera)) return;
        e.preventDefault();
        // Zooming a cut is hands-on work — freeze it, or the next mouse
        // move in the plan would yank the view away again.
        if (vp.name !== this.activePane) this.setActivePane(vp.name);
        this.vpm.zoomAt(vp, e.clientX, e.clientY, e.deltaY > 0 ? 1.15 : 1 / 1.15);
      },
      { passive: false },
    );

    // Right click = Enter (finish the current gesture), like AutoCAD.
    canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.tools.finish();
    });

    window.addEventListener('keydown', (e) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) return;

      // 1 / 2 / 3 — focus a pane explicitly (see activePane). Typed distances
      // win: while a command is waiting for a number, "1" must start "1.5"
      // rather than jump to another pane.
      const typingNumber = this.tools.numBuffer !== '' || this.tools.active?.getDynamicAnchor() != null;
      if (!e.ctrlKey && !e.metaKey && !e.altKey && (e.key === '1' || e.key === '2' || e.key === '3') && !typingNumber) {
        e.preventDefault();
        this.setActivePane(e.key === '1' ? 'main' : e.key === '2' ? 'section' : 'iso');
        this.ui.setHint(
          e.key === '1'
            ? 'Активен ПЛАН — рез и 3D снова следуют за курсором'
            : `Активно окно ${e.key === '2' ? '«РЕЗ»' : '«3D»'} — изображение зафиксировано, ведите его мышью. Клавиша 1 вернёт слежение`,
        );
        return;
      }

      // Help: F1 opens it anywhere, Esc closes it before any tool gets a
      // chance to treat the key as "cancel current construction".
      if (e.key === 'F1') {
        e.preventDefault();
        this.ui.toggleHelp();
        return;
      }
      if (e.key === 'Escape' && this.ui.helpOpen) {
        this.ui.toggleHelp(false);
        return;
      }

      // Undo / redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z' || e.key === 'я' || e.key === 'Я')) {
        e.preventDefault();
        if (e.shiftKey) this.redo();
        else this.undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y' || e.key === 'н' || e.key === 'Н')) {
        e.preventDefault();
        this.redo();
        return;
      }

      // Space: Enter-equivalent; on idle Select repeats the last command.
      if (e.key === ' ') {
        e.preventDefault();
        if (this.tools.active && this.tools.active.id === 'select') this.tools.repeatLast();
        else this.tools.finish();
        return;
      }
      if (e.key === 'F8') {
        e.preventDefault();
        this.setOrtho(!this.orthoOn);
        return;
      }
      if (e.key === 'Shift') {
        this.tools.shiftHeld = true;
        this.refreshOrthoUI();
      }

      // Dynamic numeric input (digits, '.', ',', '-', editing keys)
      if (this.tools.handleNumKey(e)) {
        e.preventDefault();
        return;
      }

      // 's' toggles snapping ('ы' — same physical key on Russian layouts)
      if ((e.key === 's' || e.key === 'S' || e.key === 'ы' || e.key === 'Ы') && !e.ctrlKey && !e.metaKey) {
        this.setSnap(!this.snapOn);
        return;
      }
      if (this.tools.key(e)) return;
      if (e.key === 'Delete' || e.key === 'Backspace') this.eraseSelection();
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === 'Shift') {
        this.tools.shiftHeld = false;
        this.refreshOrthoUI();
      }
    });
  }

  /** Ground elevation (UCS-local z) under a plan position, or null when
   *  there is no scan point nearby. Drives the coordinate readout and the
   *  vertical centring of the cut. Deliberately ignores the height slice:
   *  the ground stays the ground even while the plan shows one slab. */
  private groundElevation(x: number, y: number): number | null {
    if (!this.snap.ready) return null;
    if (!this.snap.query(x, y, 2.5, _snapProbe)) return null;
    return _snapProbe.z;
  }
}
