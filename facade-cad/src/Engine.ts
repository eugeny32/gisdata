/**
 * Engine — application root and ToolHost implementation.
 *
 * Owns the single WebGLRenderer + scene, wires input to the tool state
 * machine, and flips per-viewport uniforms so one immutable point buffer
 * serves three differently-clipped views.
 *
 * Also hosts the cross-cutting CAD services:
 *  - snapshot-based undo/redo over the entity store (Ctrl+Z / Ctrl+Y);
 *  - the named-UCS registry (create by two clicks, switch via the ribbon
 *    dropdown; linework keeps its WORLD position on switch via rebase).
 *
 * Performance contract:
 *  - the animation loop performs zero allocations (module temps only);
 *  - the cloud is filtered exclusively on the GPU (see ShaderFactory);
 *  - CPU passes over the cloud happen only on discrete user actions
 *    (lasso apply, UCS pick) — never per frame.
 */
import * as THREE from 'three';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { PaneLayout, SPLIT_X, SPLIT_Y, Viewport, ViewportManager, ViewportName } from './ViewportManager';
import { UCSManager } from './UCSManager';
import { SnapEngine } from './SnapEngine';
import { CadEntity, EntityStore, MAT_GHOST_LINE2, setLayerProvider } from './Entities';
import { LayerStore, Linetype } from './Layers';
import { ToolHost, ToolManager } from './CADTools';
import { CloudUniforms, createLeafMaterial, createPointCloudMaterial, MAX_LASSO_VERTS } from './ShaderFactory';
import { DemoCloud, emptyCloud } from './PointCloudFactory';
import { LEAF_STRIDE } from './CloudIndex';
import { downloadText, toAcadScript, toDxf } from './Export';
import { shade, token } from './theme';
import { UI } from './UI';
import { OpeningsTool } from './auto/OpeningsTool';

const _p = new THREE.Vector3();
const _center = new THREE.Vector3();
const _size = new THREE.Vector3();
const _eye = new THREE.Vector3();
const _upY = new THREE.Vector3(0, 1, 0);
const _fd = new THREE.Vector3();
const _pd = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _zeroVec = new THREE.Vector3();
const _box = new THREE.Box3();

/** Profile pane cut orientation. */
type ProfileMode = 'vert' | 'horiz';

const UNDO_CAP = 50;
/** Metre-scale steps for the side view, coarsest that still reads. */
const ELEV_STEPS = [0.1, 0.2, 0.25, 0.5, 1, 2, 5, 10, 20, 50];
/** Шаги мерной сетки глубины окна 2, м (подписи в мм). */
const DEPTH_STEPS = [0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5];
/** Привязка осей среза к мерной сетке: 5 мм — срез это обмер, а не жест. */
const snap5 = (v: number): number => Math.round(v / 0.005) * 0.005;

interface WorkerMsg {
  type: 'ready' | 'progress' | 'done' | 'error' | 'lasso';
  p?: number;
  phase?: string;
  message?: string;
  /** Позиции, квантованные в uint16 по коробкам листьев (см. CloudIndex). */
  qpos?: Uint16Array;
  colors?: Uint8Array;
  count?: number;
  origin?: { x: number; y: number; z: number } | null;
  /** Листовой индекс из CloudIndex: LEAF_STRIDE чисел на лист. */
  leaves?: Float64Array;
  // --- ответ 'lasso' (см. cloud.worker/runLasso) ---
  seq?: number;
  kept?: number;
  srcP?: Float32Array;
  wallLeaves?: Float64Array;
  idx?: Uint32Array;
  localAll?: Float32Array | null;
  bounds?: number[];
}

/** Лист облака: диапазон общего буфера + коробка + свой Points-объект.
 *  `want` — рабочее поле раздачи бюджета кадра (applyChunkLod).
 *  qm/qs — параметры деквантования: мир = qm + uint16 × qs, поось. */
interface Leaf {
  start: number;
  count: number;
  box: THREE.Box3;
  geo: THREE.BufferGeometry;
  points: THREE.Points;
  want: number;
  qmx: number;
  qmy: number;
  qmz: number;
  qsx: number;
  qsy: number;
  qsz: number;
}

// Потолок точек стены (COMPACT_CAP) живёт в cloud.worker — кап и шаффл
// выполняются там же, где вся математика лассо.

/** Жёсткие потолки точек НА ОКНО. Пиксельный бюджет честен на ноутбучном
 *  окне, но на развёрнутом 2К/4К-мониторе с dpr 1.5 арифметика «полтора на
 *  пиксель» раздувается до многих миллионов — и кадр возвращается к тем
 *  тормозам, ради которых всё затевалось. Целевой уровень — ~3 млн точек
 *  за кадр НА ВСЕ ТРИ ОКНА (на такой нагрузке машина пользователя держала
 *  100+ FPS); крупнее монитор — те же точки, просто крупнее пиксель.
 *  Главному окну — львиная доля: в нём чертят; боковые — вспомогательные. */
const PANE_CAP: Record<ViewportName, number> = { main: 2_000_000, profile: 800_000, iso: 800_000 };

const _frustum = new THREE.Frustum();
const _pm = new THREE.Matrix4();
const _lv = new THREE.Vector3();

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
  private sectionDepth = 0.4;
  /** Facade depth slice (main viewport): offset + thickness along local Z,
   *  each with its OWN slider — толщина не делится с резом окна 2, иначе
   *  настройка слоя поиска ломала бы сечение. Snapping follows the visible
   *  slab, and the openings search reads the same slab: срез — это и есть
   *  «в каком слое я ищу примитивы». */
  private facadeSliceOn = false;
  private facadeSliceZ = 0;
  private facadeSliceThick = 0.24;
  /** Отложенный пересчёт поиска проёмов вслед за ползунками среза. */
  private openingsTimer = 0;
  /** Правка среза ПРЯМО в окне 2 — всегда, без режимов и кнопок: ЛКМ у
   *  голубой оси тянет эту границу, внутри полосы — весь срез, в пустоте —
   *  новая протяжка. Границы прилипают к мерной сетке (шаг 5 мм). */
  private sliceGrab: 'new' | 'lo' | 'hi' | 'move' | null = null;
  private sliceGrabZ0 = 0;
  /** Срез до захвата: случайный щелчок не должен терять настроенный слой. */
  private sliceGrabPrev: { on: boolean; z: number; t: number } | null = null;
  /** Оси-границы среза в окне 2 — за них и тянут. */
  private facadeEdges!: LineSegments2;
  private facadeEdgeMat!: LineMaterial;
  /** Дроссель мерной сетки глубины (камера сечения ездит за курсором). */
  private depthRulerT = 0;
  private depthRulerSig = '';
  /** Цветовой фильтр слоя поиска: срез И цвет вместе. Образцы берутся
   *  пипеткой из панели проёмов; храним хроматичность + яркость. */
  private colorOn = false;
  private colorTol = 0.2;
  private colorSamples: { cr: number; cg: number; br: number; css: string }[] = [];
  /** Индекс точки, найденной последним pickCloudPoint, — для пипетки. */
  private lastPickIndex = -1;
  /** ОБЛАСТЬ поиска (оси ПСК): пока задана, окно 1 показывает только её —
   *  остальной фасад скрыт, работа идёт по куску. */
  private searchRegion: { x0: number; y0: number; x1: number; y1: number } | null = null;
  /** Полоса среза в окне сечения — границы слоя видны прямо на профиле. */
  private facadeBand!: THREE.Mesh;
  /** PLAN SLICE — the step between the lasso and the UCS. A top view of a
   *  whole wall is a soup of roof, ground and vegetation returns, and the
   *  wall line cannot be picked out of it. So the isolated area is first
   *  shown from the SIDE, where a horizontal slab (level + thickness) is
   *  set, and the top view then shows only that slab: two clicks land on a
   *  clean wall line. The clip is in WORLD height — there is no UCS yet. */
  private planSliceOn = false;
  private planSliceY = 0;
  private planSliceThick = 0.3;
  /** World bounds of the isolated points — drives the level slider and the
   *  side-view framing. */
  private readonly isoBounds = new THREE.Box3();
  /**
   * Центр окна облака в 3-м окне, в осях ПСК. Отдельно от tools.pointer:
   * сюда попадают только те положения курсора, которые действительно лежат
   * на стене (см. noteFollow) — иначе окно уносит косым лучом изометрии.
   */
  private readonly curFollow = new THREE.Vector3();
  /** Модуль «Автообмер» — см. конструктор. */
  private readonly openings: OpeningsTool;
  /** Translucent band drawn at the slab in the side view (main pane only). */
  private planSliceBand!: THREE.Mesh;
  /** Zero plane for facade deviations: UCS-local depth (z) of a picked scan
   *  point. Deviations are signed distances from it. */
  deviationRef: number | null = null;
  /** Origin removed from the scan on import, in SOURCE (survey) axes. World
   *  point → scan coordinates is one addition through worldToSource(). */
  private cloudOrigin: { x: number; y: number; z: number } | null = null;
  private panning: Viewport | null = null;
  private panX = 0;
  private panY = 0;
  private frames = 0;
  private fpsT = performance.now();
  /**
   * Адаптивный множитель точечного бюджета [0.25 … 1] — замкнутый контур
   * вместо веры в константы. Константные капы подобраны под конкретную
   * машину; у пользователя другой монитор, другой GPU, другой драйвер — и
   * любое «на глаз» однажды промахнётся (проверено). Регулятор смотрит на
   * НАСТОЯЩИЙ FPS: просел — бюджет ужимается на следующем же замере,
   * держится у потолка монитора — осторожно отрастает назад.
   */
  private lodScale = 1;
  /** Наблюдаемый потолок кадров (герцовка монитора): рост бюджета
   *  разрешён только у самого потолка, где машине заведомо легко. */
  private fpsCeiling = 60;
  private mainMode: 'top' | 'level' | 'draft' = 'top';
  /** Pane that owns the commands right now. Merely MOVING the mouse across
   *  another pane no longer changes it — only a click there or the 1/2/3
   *  keys do. Sweeping the cursor over the 3D view used to silently drop
   *  camera tracking mid-command; now nothing shifts under you. */
  private activePane: ViewportName = 'main';
  /** Iso camera follows the drafting cursor until the user grabs the 3D
   *  view himself (pointer enters the orbit pad). */
  private readonly followTarget = new THREE.Vector3();
  private followActive = false;
  /** Profile camera tracks the cursor the same way — a close-up side view
   *  for depth control; pauses while the user navigates the profile pane. */
  private profileFollow = false;
  /** Замороженное положение реза окна 2 (оси ПСК). Камеру слежения фокус
   *  и так ставил на паузу, но САМ РЕЗ ехал за курсором дальше — и мышь,
   *  проезжая окно 1 по пути в сечение, утаскивала картинку. Фокус не в
   *  окне 1 (клавиша 2, клик в сечение) — рез стоит; фокус вернулся —
   *  снова едет за курсором, как слежение 3-го окна. */
  private readonly profileFreeze = new THREE.Vector3();
  private profileFrozen = false;
  /** Profile = a MICROSCOPE at the cursor, not a whole-wall section:
   *  'vert' cuts a vertical plane across the wall (sill/lintel profiles),
   *  'horiz' cuts a horizontal one (window reveals in plan). `profileWindow`
   *  is how much of the wall the cut spans around the cursor. */
  private profileMode: ProfileMode = 'vert';
  private profileWindow = 2;

  private readonly cloudSettings: Record<'main' | 'profile' | 'iso', CloudViewSettings> = {
    main: { size: 2, opacity: 1, density: 1, mode: 0 },
    profile: { size: 2, opacity: 1, density: 1, mode: 0 }, // match the main pane
    iso: { size: 2, opacity: 1, density: 0.3, mode: 0 }, // same fine points as main
  };
  private readonly ucsList: UcsEntry[] = [];
  /** −1 = МСК (world overview, full cloud, wall labels visible). */
  private activeUcs = -1;
  private readonly ucsLabels = new THREE.Group();
  private cloudPoints!: THREE.Points;
  /** Материал стены (USE_AKEY, Float32) — общий для всех её листьев. */
  private readonly compactMaterial: THREE.ShaderMaterial;
  /** Полное облако — листья kd-индекса, каждый со своим drawRange-LOD.
   *  Живёт, пока не выделена стена; компакт стены — отдельный буфер. */
  private readonly chunkGroup = new THREE.Group();
  private readonly leaves: Leaf[] = [];
  /** Позиции полного облака: uint16-кванты по коробкам листьев. Мировая
   *  координата точки i — через её лист (leafOf/dq): 6 байт на точку
   *  вместо 12, и это ЕДИНСТВЕННОЕ хранение позиций. */
  private cloudQ: Uint16Array = new Uint16Array(0);
  /** Цвета полного облака (0..255) — источник для компакта стены. */
  private cloudColors: Uint8Array = new Uint8Array(0);
  /** true — рисуется компакт стены (cloudPoints), false — листья. */
  private compactOn = false;
  private importWorker: Worker | null = null;
  private workerReady = false;
  private pendingJob: { files: File[] } | null = null;
  private pendingDemo = false;
  /** Стена (компакт) — те же листья, что у облака, только Float32 и мельче:
   *  один LOD-механизм (applyChunkLod) обслуживает оба набора. */
  private readonly wallGroup = new THREE.Group();
  private readonly wallLeaves: Leaf[] = [];
  /** Мировые позиции стены (порядок листьев) — источник снап-грида при
   *  смене ПСК; это же — position-атрибут листьев стены. */
  private wallSrcP: Float32Array | null = null;
  /** Номер последней обводки: устаревший ответ воркера отбрасывается. */
  private lassoSeq = 0;
  private layerUiQueued = false;
  /** Cloud points submitted across ALL panes this frame (status readout). */
  private framePts = 0;
  private framePtsShown = 0;
  private readonly undoStack: string[] = [];
  private readonly redoStack: string[] = [];

  // --------------------------------------------------- server persistence
  // gisdata integration: layers + drawing + UCS list round-trip through
  // /api/facade_cad_session.php (Postgres/PostGIS, one row per admin/user)
  // instead of localStorage — see markDirty/flushDirtySave/
  // restoreSessionFromServer below and sql/schema.sql::facade_cad_sessions.
  private readonly sessionApiUrl = '/api/facade_cad_session.php';
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
    this.compactMaterial = material;
    // Легаси-носитель материала: сам объект больше не рисуется (стена — в
    // wallGroup), но хранит пустую геометрию и совместим со старыми путями.
    this.cloudPoints = new THREE.Points(this.cloud.geometry, material);
    this.cloudPoints.visible = false;
    this.scene.add(this.cloudPoints);
    this.scene.add(this.chunkGroup);
    this.scene.add(this.wallGroup);
    this.wallGroup.visible = false;
    this.scene.add(this.ucsLabels);

    // Диапазон высот для раскраски «по высоте» приходит с облаком
    // (applyCloud, из коробок листьев) — на старте облака нет.
    uniforms.uMinY.value = 0;
    uniforms.uYRangeInv.value = 1;

    // --- UCS + entities --------------------------------------------------
    this.scene.add(this.ucs.group);
    this.scene.add(this.ucs.axesHelper);
    this.store = new EntityStore(this.ucs.group);

    // Ground grid for spatial reference — isometric viewport only (layer 2).
    // Оттенки — от фона темы: сетка обязана быть чуть светлее своего окна и
    // не тянуть в сторону по цвету. Раньше здесь стояла зелень, оставшаяся
    // от мятной темы, и на угольном фоне она читалась как налёт.
    const bg = token('--bg', 0x0b0c0d);
    const grid = new THREE.GridHelper(60, 60, shade(bg, 0.22), shade(bg, 0.1));
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.5;
    grid.layers.set(2);
    this.scene.add(grid);

    // Band that shows WHERE the plan slab sits while its level is being set
    // from the side. Layer 1 = drafting pane only, no depth test: it has to
    // read over the cloud it is cutting.
    this.planSliceBand = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ color: token('--accent', 0x66a8ff), transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthTest: false, depthWrite: false }),
    );
    this.planSliceBand.layers.set(1);
    this.planSliceBand.renderOrder = 1;
    this.planSliceBand.frustumCulled = false;
    this.planSliceBand.visible = false;
    this.scene.add(this.planSliceBand);

    // Полоса среза фасада В ОКНЕ СЕЧЕНИЯ (слой 6 — только окно 2): глубина
    // там разложена по экрану, и границы среза должны читаться прямо на
    // профиле. Коробка в осях ПСК: широкая по x/y, толщиной в срез по z —
    // ортокамера сечения видит её ровно как полосу между границами.
    this.facadeBand = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({ color: token('--accent', 0x66a8ff), transparent: true, opacity: 0.14, side: THREE.DoubleSide, depthTest: false, depthWrite: false }),
    );
    this.facadeBand.layers.set(6);
    this.facadeBand.renderOrder = 1;
    this.facadeBand.frustumCulled = false;
    this.facadeBand.visible = false;
    this.ucs.group.add(this.facadeBand);

    // Оси-границы: по кресту длинных линий на каждой границе — какой бы
    // рез ни стоял (ВЕРТ или ГОРИЗ), одна из линий креста видна как чёткая
    // ось поперёк окна. За неё и тянут.
    this.facadeEdgeMat = new LineMaterial({
      color: token('--accent', 0x66a8ff),
      linewidth: 2,
      transparent: true,
      opacity: 0.9,
      depthTest: false,
    });
    this.facadeEdges = new LineSegments2(new LineSegmentsGeometry(), this.facadeEdgeMat);
    this.facadeEdges.layers.set(6);
    this.facadeEdges.renderOrder = 2;
    this.facadeEdges.frustumCulled = false;
    this.facadeEdges.visible = false;
    this.ucs.group.add(this.facadeEdges);

    // --- viewports -------------------------------------------------------
    this.vpm = new ViewportManager(this.renderer, this.scene, document.getElementById('orbit-pad') as HTMLElement);
    this.loadPaneLayout();
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
      onSectionDepth: (v) => this.setSectionDepth(v),
      onToggleProfileMode: () => {
        this.profileMode = this.profileMode === 'vert' ? 'horiz' : 'vert';
        this.ui.setProfileMode(this.profileMode === 'vert');
        this.refreshProfileView();
        this.ui.setHint(this.profileMode === 'vert' ? 'Окно 2: вертикальный рез поперёк стены — видно профиль подоконника, откоса, карниза' : 'Окно 2: горизонтальный рез — видно план проёма и глубину откосов на уровне курсора');
      },
      onProfileWindow: (v) => {
        this.profileWindow = v;
        this.ui.setProfileWindow(v);
        this.refreshProfileView();
      },
      onPlanSliceToggle: () => {
        this.planSliceOn = !this.planSliceOn;
        this.ui.setPlanSlice(this.planSliceOn, this.planSliceY, this.planSliceThick);
      },
      onPlanSliceLevel: (v) => {
        this.planSliceY = v;
        this.planSliceOn = true; // двинули ползунок — срез сразу виден
        this.ui.setPlanSlice(true, v, this.planSliceThick);
        this.updatePlanBand();
      },
      onPlanSliceThick: (v) => {
        this.planSliceThick = v;
        this.ui.setPlanSlice(this.planSliceOn, this.planSliceY, v);
        this.updatePlanBand();
      },
      onPlanSliceDone: () => this.tools.activate('ucs'),
      onToggleFacadeSlice: () => {
        this.facadeSliceOn = !this.facadeSliceOn;
        this.syncSliceUI();
        this.updateFacadeBand();
        this.openingsLive();
      },
      onFacadeSliceRange: (lo, hi) => this.setFacadeRange(lo, hi),
      onUcsSelect: (i) => this.onUcsSelect(i),
      onToggleLayer: (name) => this.toggleEntityLayer(name),
      onCursorArea: (v) => {
        this.cloudUniforms.uCurHalf.value = v / 2; // slider = full box size, m
      },
      onOpenCloudPanel: (name) => this.ui.openCloudPanel(name, this.cloudSettings[name]),
      onCloudSetting: (name, key, v) => {
        this.cloudSettings[name][key] = v;
      },
      onToggleCloud: (name) => {
        const cam = this.vpm[name].camera;
        cam.layers.toggle(4);
        this.ui.setCloudVisible(name, cam.layers.isEnabled(4));
      },
      onImportFiles: (files) => void this.importCloud(files),
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
    // Отделяемый модуль «Автообмер»: подключается здесь и только здесь.
    // Уберите эти строки — исчезнут и инструмент, и кнопка в ленте, а ядро
    // не заметит. Ссылка нужна ровно для одного: ширина линий Line2 живёт
    // от размера кадра, и её надо целить в каждое окно перед проходом.
    this.openings = new OpeningsTool(this, this.tools);
    this.tools.addTool(this.openings);

    this.bindInput(canvas);
    this.ui.setSnap(this.snapOn);
    this.ui.setOrtho(false);
    this.ui.setProfileMode(true);
    this.ui.setProfileWindow(this.profileWindow);
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

  // ------------------------------------------------------------ rendering

  /** requestAnimationFrame body — strictly allocation-free. */
  private loop(): void {
    // Smoothly re-center the iso camera on the cursor (pan, keep the
    // user's orbit angle and zoom).
    if (this.followActive) {
      _fd.subVectors(this.followTarget, this.vpm.orbit.target);
      if (_fd.lengthSq() > 1e-6) {
        _fd.multiplyScalar(0.12);
        this.vpm.orbit.target.add(_fd);
        this.vpm.iso.camera.position.add(_fd);
      }
    }
    // Profile pane: close-up cut glued to the drafting cursor, so the user
    // always sees WHERE in depth the next point will land.
    if (this.profileFollow && this.ucs.defined && this.activeUcs >= 0) {
      this.profileEye(_pd).multiplyScalar(120).add(this.followTarget);
      _fd.subVectors(_pd, this.vpm.profile.camera.position);
      if (_fd.lengthSq() > 1e-6) this.vpm.profile.camera.position.addScaledVector(_fd, 0.18);
    }
    // Мерная сетка глубины окна 2 — камера выше могла сдвинуться.
    this.refreshDepthRuler();
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
    this.openings.setResolution(vp.gl.w, vp.gl.h);
    this.facadeEdgeMat.resolution.set(vp.gl.w, vp.gl.h);
    const u = this.cloudUniforms;
    const s = this.cloudSettings[vp.name];
    u.uIsPersp.value = vp.name === 'iso' ? 1 : 0;
    u.uSize.value = s.size;
    u.uOpacity.value = s.opacity;
    u.uMode.value = s.mode;
    // uDensity выставляет ветка отрисовки: тайловый интервал режется
    // шейдерным ключом, префиксные пути складывают ползунок в длину
    // префикса и ставят 1 (см. applyTileRange / applyChunkLod).
    // Facade slice: depth slab clip for the drafting view. Окно 2 срез не
    // фильтрует никогда — там он ПОКАЗАН полосой с осями-границами, и весь
    // профиль должен оставаться видимым, чтобы было куда их тащить.
    u.uFacadeClip.value = vp.name === 'main' && this.facadeSliceOn && this.ucs.defined && this.activeUcs >= 0 ? 1 : 0;
    u.uFacadeMin.value = this.facadeSliceZ - this.facadeSliceThick / 2;
    u.uFacadeMax.value = this.facadeSliceZ + this.facadeSliceThick / 2;
    // ОБЛАСТЬ поиска: окно 1 показывает только выбранный кусок фасада.
    const rg = this.searchRegion;
    u.uRegionClip.value = vp.name === 'main' && rg && this.ucs.defined && this.activeUcs >= 0 ? 1 : 0;
    if (rg) {
      u.uRegionMin.value.set(rg.x0, rg.y0);
      u.uRegionMax.value.set(rg.x1, rg.y1);
    }
    u.uSectionEnabled.value = vp.name === 'profile' && this.ucs.defined && this.activeUcs >= 0 ? 1 : 0;
    // Profile = live cut AT the cursor, bounded on BOTH axes: the cut plane
    // is `sectionDepth` thick, and it spans only `profileWindow` around the
    // cursor — a sill or reveal reads on its own, not lost in the facade.
    if (u.uSectionEnabled.value === 1) {
      // Замороженный рез стоит на месте, пока фокус не в окне 1.
      const cx = this.profileFrozen ? this.profileFreeze.x : this.tools.pointer.local.x;
      const cy = this.profileFrozen ? this.profileFreeze.y : this.tools.pointer.local.y;
      const d = this.sectionDepth / 2;
      const w = this.profileWindow / 2;
      if (this.profileMode === 'vert') {
        u.uBoxMin.value.set(cx - d, cy - w, -1e6);
        u.uBoxMax.value.set(cx + d, cy + w, 1e6);
      } else {
        u.uBoxMin.value.set(cx - w, cy - d, -1e6);
        u.uBoxMax.value.set(cx + w, cy + d, 1e6);
      }
    }
    // Iso view economy: after the UCS is set, show only a 2×2 m window of
    // the cloud that follows the cursor.
    u.uCurClip.value = vp.name === 'iso' && this.ucs.defined && this.activeUcs >= 0 ? 1 : 0;
    // Окно следует за ПОСЛЕДНИМ ОСМЫСЛЕННЫМ положением курсора, а не за
    // сырым pointer.local. Разница видна в 3-м окне: луч из изометрической
    // камеры бьёт в плоскость черчения под острым углом, и пара пикселей
    // движения мышью уносит точку пересечения на десятки метров — окно
    // съезжало с облака, и оно «пропадало». См. noteFollow().
    u.uCurPos.value.copy(this.curFollow);
    // Plan slice: only in the top view, where the wall line is picked. The
    // side view must show the whole elevation — that is where the level is
    // chosen — and the band overlay marks the slab there instead.
    u.uPlanClip.value = vp.name === 'main' && this.planSliceOn && this.mainMode === 'top' ? 1 : 0;
    u.uPlanMin.value = this.planSliceY - this.planSliceThick / 2;
    u.uPlanMax.value = this.planSliceY + this.planSliceThick / 2;
    // Один LOD на всё: набором служат листья стены или листья облака.
    this.applyChunkLod(vp, this.compactOn ? this.wallLeaves : this.leaves);
  }

  /**
   * LOD полного облака: на этот проход каждому ЛИСТУ назначается префикс
   * его диапазона — сколько точек он покажет этому окну.
   *
   * Три отбора, все на CPU и все дешёвые (листьев — сотни):
   *  1) фрустум камеры окна против коробки листа — невидимое не рисуется
   *     вовсе (в т.ч. вершины: это отличает отбор от шейдерных клипов);
   *  2) срез плана по высоте, когда он включён, — тонкий срез выкидывает
   *     почти все листья ещё до фрустума;
   *  3) экранный размер листа: точек — не больше, чем пикселей займёт его
   *     коробка. Дальний лист рисуется тысячами точек, ближний — целиком.
   *  Сумма сверх бюджета окна ужимается пропорционально.
   */
  private applyChunkLod(vp: Viewport, leaves: Leaf[]): void {
    if (!leaves.length) return;
    const cam = vp.camera;
    _pm.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
    _frustum.setFromProjectionMatrix(_pm);
    const s = this.cloudSettings[vp.name];
    const ortho = cam instanceof THREE.OrthographicCamera;
    // Запас «точек на пиксель»: спрайты 2–3 px и перекрываются, ровно одна
    // точка на пиксель читается заметно жидко; перспективное окно получает
    // больше — его проекция складывает всю глубину в те же пиксели.
    const ppp = ortho ? 1.5 : 3;
    const cap = Math.min(vp.gl.w * vp.gl.h * ppp, PANE_CAP[vp.name]) * this.lodScale;
    const ppmOrtho = ortho ? vp.gl.h / Math.max(1e-3, vp.frustumHeight) : 0;
    const halfFovTan = ortho ? 1 : Math.tan(THREE.MathUtils.degToRad((cam as THREE.PerspectiveCamera).fov / 2));
    const planClip = vp.name === 'main' && this.planSliceOn && this.mainMode === 'top';
    const y0 = this.planSliceY - this.planSliceThick / 2;
    const y1 = this.planSliceY + this.planSliceThick / 2;
    // Прореживание — целиком в длине префикса (density уже в want ниже);
    // шейдерный ключ не должен резать сверх того.
    this.cloudUniforms.uDensity.value = 1;

    let sum = 0;
    for (const lf of leaves) {
      let want = 0;
      if (!(planClip && (lf.box.max.y < y0 || lf.box.min.y > y1)) && _frustum.intersectsBox(lf.box)) {
        lf.box.getSize(_lv);
        // Экранная площадь листа ≈ его наибольшая грань: точки скана лежат
        // на поверхностях, и именно грань, а не объём, видит камера.
        const face = Math.max(_lv.x * _lv.y, _lv.y * _lv.z, _lv.x * _lv.z, 1e-4);
        const ppm = ortho ? ppmOrtho : (vp.gl.h * 0.5) / (Math.max(0.5, lf.box.distanceToPoint(cam.position)) * halfFovTan);
        want = Math.min(lf.count, face * ppm * ppm * ppp) * s.density;
      }
      lf.want = want;
      sum += want;
    }
    const scale = sum > cap ? cap / sum : 1;
    for (const lf of leaves) {
      const k = Math.min(lf.count, Math.ceil(lf.want * scale));
      if (k > 0) {
        lf.points.visible = true;
        lf.geo.setDrawRange(lf.start, k);
        this.framePts += k;
      } else {
        lf.points.visible = false;
      }
    }
  }

  /** Лист, содержащий точку i: диапазоны листьев непрерывны и упорядочены,
   *  бинарный поиск по start. Для миллионных пробегов дешевле держать
   *  параметры листа в локальных переменных цикла (см. applyLasso). */
  private leafOf(i: number): Leaf {
    const ls = this.leaves;
    let lo = 0;
    let hi = ls.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (ls[mid].start <= i) lo = mid;
      else hi = mid - 1;
    }
    return ls[lo];
  }

  /** Мировая координата точки i, восстановленная из квантов её листа. */
  private dq(i: number, out: THREE.Vector3): THREE.Vector3 {
    const lf = this.leafOf(i);
    const q = this.cloudQ;
    return out.set(
      lf.qmx + q[i * 3] * lf.qsx,
      lf.qmy + q[i * 3 + 1] * lf.qsy,
      lf.qmz + q[i * 3 + 2] * lf.qsz,
    );
  }

  private tickFps(): void {
    // The metre scale rides the camera (zoom, pan) — refresh it a few times
    // a second instead of per frame; it is DOM work.
    if (this.mainMode === 'level' && (this.frames & 7) === 0) this.refreshElevationScale();
    this.frames++;
    const now = performance.now();
    if (now - this.fpsT >= 500) {
      const fps = Math.round((this.frames * 1000) / (now - this.fpsT));
      this.ui.setFps(fps, this.framePtsShown);
      this.frames = 0;
      this.fpsT = now;
      // Регулятор бюджета: вниз — решительно (тормоза видны сразу),
      // вверх — по 6 % и только у потолка монитора. Порог 45 не трогает
      // честные 60 Гц, но ловит любое настоящее проседание.
      if (fps > this.fpsCeiling) this.fpsCeiling = fps;
      if (fps < 45) this.lodScale = Math.max(0.25, this.lodScale * 0.8);
      else if (fps >= this.fpsCeiling * 0.92) this.lodScale = Math.min(1, this.lodScale * 1.06);
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
  private toggleEntityLayer(name: 'main' | 'profile' | 'iso'): void {
    const cam = this.vpm[name].camera;
    cam.layers.toggle(3);
    this.ui.setLayerVisible(name, cam.layers.isEnabled(3));
  }

  // ------------------------------------------------------------- ToolHost

  /**
   * Изоляция стены. Вся математика — в воркере (см. cloud.worker/runLasso):
   * на десятках миллионов точек это секунды CPU, и раньше они замораживали
   * интерфейс сразу после обводки. Здесь только контур и отправка; стена
   * появляется в onLassoResult, интерфейс всё это время живой.
   */
  applyLasso(worldPts: readonly THREE.Vector3[]): void {
    const n = Math.min(worldPts.length, MAX_LASSO_VERTS);
    const px = new Float32Array(n);
    const pz = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      px[i] = worldPts[i].x;
      pz[i] = worldPts[i].z;
    }
    this.ensureWorker();
    this.lassoSeq++;
    this.ui.setHint('Выделяю стену…');
    const ucsInverse = this.ucs.defined && this.activeUcs >= 0 ? Array.from(this.ucs.inverse.elements) : null;
    this.importWorker!.postMessage(
      { lasso: { px, pz, n, seq: this.lassoSeq, ucsInverse } },
      [px.buffer, pz.buffer],
    );
  }

  /** Стена пришла из воркера: собрать THREE-листья и включить шаги 2–4. */
  private onLassoResult(m: WorkerMsg): void {
    if (m.seq !== this.lassoSeq) return; // устаревший ответ — обвели заново
    if (!m.kept || !m.srcP || !m.wallLeaves || !m.idx || !m.bounds) {
      this.ui.setHint('В контуре нет точек — обведите стену заново');
      return;
    }
    this.isolated = m.idx;
    this.wallSrcP = m.srcP;

    // Цвета стены — gather по переставленному индексу: воркер цветов не
    // держит (это удвоило бы его копию облака ради одного прохода).
    const srcC = this.cloudColors;
    const wallN = m.idx.length;
    const col = new Uint8Array(wallN * 3);
    for (let k = 0; k < wallN; k++) {
      const i = m.idx[k] * 3;
      col[k * 3] = srcC[i];
      col[k * 3 + 1] = srcC[i + 1];
      col[k * 3 + 2] = srcC[i + 2];
    }
    this.buildWallLeaves(m.srcP, col, m.wallLeaves);
    this.useCompact(true);
    this.snap.clear(); // старый грид указывал на прошлую стену

    // Снап-грид — после первого кадра со стеной: он ещё ~сотни мс CPU, и
    // визуально важнее показать стену мгновенно.
    const localAll = m.localAll;
    const seq = this.lassoSeq;
    if (localAll) {
      setTimeout(() => {
        if (seq === this.lassoSeq) this.snap.buildLocal(localAll, wallN);
      }, 0);
    }

    this.isoBounds.makeEmpty();
    this.isoBounds.min.set(m.bounds[0], m.bounds[1], m.bounds[2]);
    this.isoBounds.max.set(m.bounds[3], m.bounds[4], m.bounds[5]);
    const lo = this.isoBounds.min.y;
    const hi = this.isoBounds.max.y;
    // Default to a builder's plan height (1.5 m over the lowest return),
    // clamped into the wall — that is where the wall line is cleanest.
    this.planSliceY = THREE.MathUtils.clamp(lo + 1.5, lo, hi);
    this.planSliceThick = THREE.MathUtils.clamp((hi - lo) * 0.04, 0.05, 1);
    this.planSliceOn = true;
    this.ui.setPlanSliceRange(lo, hi);
    this.ui.setPlanSlice(true, this.planSliceY, this.planSliceThick);
    // Инструмент «уровень» включается только теперь: его activate кадрирует
    // вид сбоку по isoBounds, которых до этого момента не существовало.
    this.tools.activate('level');

    this.ui.setHint(`Выделено ${m.kept.toLocaleString('ru-RU')} точек — ШАГ 2/4: на виде сбоку задайте уровень и толщину среза, затем «К ПЛАНУ»`);
  }

  clearLasso(): void {
    this.isolated = null;
    this.wallSrcP = null;
    this.lassoSeq++; // ответ на летящую обводку, если есть, будет отброшен
    this.isoBounds.makeEmpty();
    this.planSliceOn = false;
    this.planSliceBand.visible = false;
    this.ui.showPlanSlicePanel(false);
    this.useCompact(false);
    this.dropWallLeaves();
  }

  private dropWallLeaves(): void {
    for (const lf of this.wallLeaves) {
      this.wallGroup.remove(lf.points);
      lf.geo.dispose(); // материал у листьев стены общий — не трогаем
    }
    this.wallLeaves.length = 0;
  }

  /** Сборка THREE-листьев стены из ГОТОВЫХ массивов (посчитаны воркером:
   *  см. cloud.worker/runLasso). Стена — такие же kd-листья, что и облако
   *  (общий LOD в applyChunkLod), только Float32 и мельче: бюджет окна
   *  тратится лишь на ВИДИМЫЕ ячейки. */
  private buildWallLeaves(srcP: Float32Array, col: Uint8Array, leafData: Float64Array): void {
    this.dropWallLeaves();
    const n = srcP.length / 3;
    // aKey обязан существовать (материал с USE_AKEY), но прореживание стены
    // теперь целиком в длине префикса — нулевой ключ всегда «жив».
    const posAttr = new THREE.BufferAttribute(srcP, 3);
    const colAttr = new THREE.BufferAttribute(col, 3, true);
    const keyAttr = new THREE.BufferAttribute(new Float32Array(n), 1);
    for (let o = 0; o + LEAF_STRIDE <= leafData.length; o += LEAF_STRIDE) {
      const box = new THREE.Box3(
        new THREE.Vector3(leafData[o + 2], leafData[o + 3], leafData[o + 4]),
        new THREE.Vector3(leafData[o + 5], leafData[o + 6], leafData[o + 7]),
      );
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', posAttr);
      geo.setAttribute('aColor', colAttr);
      geo.setAttribute('aKey', keyAttr);
      geo.setDrawRange(leafData[o], leafData[o + 1]);
      geo.boundingSphere = box.getBoundingSphere(new THREE.Sphere());
      const points = new THREE.Points(geo, this.compactMaterial);
      points.frustumCulled = false; // отбор наш, в applyChunkLod
      points.layers.set(4);
      this.wallGroup.add(points);
      this.wallLeaves.push({
        start: leafData[o],
        count: leafData[o + 1],
        box,
        geo,
        points,
        want: 0,
        qmx: 0,
        qmy: 0,
        qmz: 0,
        qsx: 0,
        qsy: 0,
        qsz: 0, // стена не квантована — поля декванта не используются
      });
    }
  }

  /** Снап-грид стены в осях АКТИВНОЙ ПСК — из сохранённых мировых позиций
   *  (wallSrcP). Трансформация ~4 млн точек — десятки мс: терпимо в момент
   *  создания/смены ПСК, это и так «переключение вида». */
  private rebuildSnapGrid(): void {
    const srcP = this.wallSrcP;
    if (!srcP || !this.ucs.defined) return;
    const n = srcP.length / 3;
    const e = this.ucs.inverse.elements;
    const localAll = new Float32Array(srcP.length);
    for (let k = 0; k < n; k++) {
      const wx = srcP[k * 3];
      const wy = srcP[k * 3 + 1];
      const wz = srcP[k * 3 + 2];
      localAll[k * 3] = e[0] * wx + e[4] * wy + e[8] * wz + e[12];
      localAll[k * 3 + 1] = e[1] * wx + e[5] * wy + e[9] * wz + e[13];
      localAll[k * 3 + 2] = e[2] * wx + e[6] * wy + e[10] * wz + e[14];
    }
    this.snap.buildLocal(localAll, n);
  }

  /** Swap what renders: wall leaves ↔ full-cloud leaf chunks (МСК). */
  private useCompact(on: boolean): void {
    this.compactOn = on && this.wallLeaves.length > 0;
    this.wallGroup.visible = this.compactOn;
    this.chunkGroup.visible = !this.compactOn;
  }

  /** Nearest cloud point to a pick ray — click-time only.
   *  While the plan slice is up, only points INSIDE the visible slab can be
   *  picked: the UCS then lands on the wall line you actually see. */
  pickCloudPoint(ray: THREE.Ray, out: THREE.Vector3): boolean {
    this.lastPickIndex = -1;
    const q = this.cloudQ;
    let bestD2 = 1.0; // ignore hits further than 1 m from the ray
    let best: Leaf | null = null;
    let bestI = -1;
    const slab = this.planSliceOn && this.mainMode === 'top';
    const yLo = slab ? this.planSliceY - this.planSliceThick / 2 : -Infinity;
    const yHi = slab ? this.planSliceY + this.planSliceThick / 2 : Infinity;
    if (this.isolated) {
      for (let k = 0; k < this.isolated.length; k++) {
        const i = this.isolated[k];
        const lf = this.leafOf(i);
        const y = lf.qmy + q[i * 3 + 1] * lf.qsy;
        if (y < yLo || y > yHi) continue;
        _p.set(lf.qmx + q[i * 3] * lf.qsx, y, lf.qmz + q[i * 3 + 2] * lf.qsz);
        const d2 = ray.distanceSqToPoint(_p);
        if (d2 < bestD2) {
          bestD2 = d2;
          best = lf;
          bestI = i;
        }
      }
    } else {
      // До изоляции: только листья, чьи коробки задевает луч (расширенные
      // на радиус поиска), внутри — каждая третья точка, как и раньше.
      for (const lf of this.leaves) {
        _box.copy(lf.box).expandByScalar(1);
        if (!ray.intersectsBox(_box)) continue;
        for (let i = lf.start, e = lf.start + lf.count; i < e; i += 3) {
          const y = lf.qmy + q[i * 3 + 1] * lf.qsy;
          if (y < yLo || y > yHi) continue;
          _p.set(lf.qmx + q[i * 3] * lf.qsx, y, lf.qmz + q[i * 3 + 2] * lf.qsz);
          const d2 = ray.distanceSqToPoint(_p);
          if (d2 < bestD2) {
            bestD2 = d2;
            best = lf;
            bestI = i;
          }
        }
      }
    }
    if (!best || bestI < 0) return false;
    this.lastPickIndex = bestI;
    out.set(
      best.qmx + q[bestI * 3] * best.qsx,
      best.qmy + q[bestI * 3 + 1] * best.qsy,
      best.qmz + q[bestI * 3 + 2] * best.qsz,
    );
    return true;
  }

  // ------------------------------------------------- цветовой фильтр слоя

  /** ToolHost: состояние фильтра для панели (галочка, допуск, образец). */
  colorFilter(): { on: boolean; tol: number; count: number; css: string | null } {
    const last = this.colorSamples[this.colorSamples.length - 1];
    return { on: this.colorOn, tol: this.colorTol, count: this.colorSamples.length, css: last ? last.css : null };
  }

  /** ToolHost: галочка и допуск (0.05…0.6) — сам пересчёт зовёт инструмент. */
  setColorFilter(on: boolean, tol: number): void {
    this.colorOn = on;
    this.colorTol = tol;
  }

  /**
   * ToolHost: пипетка — цвет ближайшей к лучу точки скана становится
   * образцом. Возвращает css-цвет для квадратика в панели (null — промах).
   */
  addColorSample(ray: THREE.Ray): string | null {
    if (!this.pickCloudPoint(ray, _p) || this.lastPickIndex < 0) return null;
    const i = this.lastPickIndex * 3;
    const r = this.cloudColors[i];
    const g = this.cloudColors[i + 1];
    const b = this.cloudColors[i + 2];
    // Хроматичность отдельно от яркости: фасад освещён неровно, и кирпич в
    // тени — это тот же кирпич. Серые сканы (интенсивность) дают ровную
    // хроматичность, и фильтр сам вырождается в фильтр по яркости.
    const sum = r + g + b + 3;
    this.colorSamples.push({ cr: r / sum, cg: g / sum, br: sum / 768, css: `rgb(${r} ${g} ${b})` });
    return this.colorSamples[this.colorSamples.length - 1].css;
  }

  clearColorSamples(): void {
    this.colorSamples.length = 0;
  }

  /** ToolHost: ОБЛАСТЬ поиска — окно 1 показывает только её (null — всё). */
  setSearchRegion(r: { x0: number; y0: number; x1: number; y1: number } | null): void {
    this.searchRegion = r;
  }

  /** Похожа ли точка i на какой-нибудь из образцов. */
  private colorMatch(i: number): boolean {
    const c = this.cloudColors;
    const r = c[i * 3];
    const g = c[i * 3 + 1];
    const b = c[i * 3 + 2];
    const sum = r + g + b + 3;
    const cr = r / sum;
    const cg = g / sum;
    const br = sum / 768;
    // Оттенок держим строго, яркость — щедро (тени!). Коэффициенты — из
    // прогона на синтетике: белое от жёлтого отделяется уже на 10 %.
    const tC = this.colorTol * 0.3;
    const tB = this.colorTol * 1.2;
    for (const s of this.colorSamples) {
      if (Math.abs(cr - s.cr) <= tC && Math.abs(cg - s.cg) <= tC && Math.abs(br - s.br) <= tB) return true;
    }
    return false;
  }

  /**
   * Точки стены в осях ПСК, парами [x, y] — вход для поиска проёмов.
   *
   * Берём только выделенную лассо стену: искать дырки во всём скане
   * бессмысленно, «дыркой» окажется всё небо между домами.
   *
   * Глубину задаёт срез фасада. Если он выключен, слой ищется сам: строим
   * гистограмму глубин по выборке и берём самый плотный столбец — это и есть
   * плоскость стены. Без такого окна в один слой попадут и дальняя стена, и
   * откосы, и проём затянется точками, которых в его плоскости нет.
   */
  /**
   * Запомнить положение курсора как центр окна облака в 3-м окне — но только
   * если оно похоже на правду.
   *
   * Курсор всех окон живёт пересечением луча с плоскостью черчения. В окне
   * плана луч бьёт в неё почти перпендикулярно, и точка пересечения устойчива.
   * В изометрии луч идёт вдоль плоскости, пересечение уезжает за десятки
   * метров от стены — и окно облака, следуя за ним, оказывалось в пустоте:
   * пользователь видел, как облако в 3-м окне пропадает, стоило туда навести
   * мышь. Поэтому положения дальше метра от выделенной стены отбрасываем:
   * окно остаётся там, где было, а это ровно то место, на которое смотрят.
   */
  private noteFollow(): void {
    const p = this.tools.pointer;
    if (!p.valid) return;
    if (!this.isoBounds.isEmpty()) {
      _box.copy(this.isoBounds).expandByScalar(1);
      if (!_box.containsPoint(p.world)) return;
    }
    this.curFollow.copy(p.local);
  }

  /**
   * Навести окно черчения на область в осях ПСК.
   *
   * Направление взгляда и «верх» камеры сохраняются — двигается только
   * центр и, если надо, масштаб: перебирать сомнительные рамки, теряя при
   * каждом переходе ориентацию в чертеже, было бы хуже, чем не переходить
   * вовсе.
   *
   * Масштаб трогаем лишь тогда, когда область не влезает или наоборот стала
   * точкой. Человек выбирает удобное ему приближение сам, и менять его без
   * нужды — значит спорить с ним на каждом шаге.
   */
  focusLocal(x: number, y: number, w: number, h: number): void {
    if (!this.ucs.defined) return;
    const vp = this.vpm.main;
    const cam = vp.camera;
    if (!(cam instanceof THREE.OrthographicCamera)) return;

    _p.set(x, y, 0);
    this.ucs.localToWorld(_p, _p);

    const aspect = vp.css.w / Math.max(1, vp.css.h);
    // Область занимает примерно две пятых высоты кадра — видно и её саму,
    // и соседей, по которым понятно, туда ли смотришь.
    const want = THREE.MathUtils.clamp(Math.max(h, w / Math.max(0.1, aspect)) * 2.5, 0.4, 4000);
    const cur = vp.frustumHeight;
    const height = want > cur * 0.98 || want < cur * 0.35 ? want : cur;

    cam.getWorldDirection(_dir); // куда смотрит камера
    _eye.copy(_dir).negate(); // от центра к глазу
    this.vpm.setOrthoView(vp, _eye, cam.up, _p, height);

    // Соседние окна тянутся туда же: сечение и обзор обязаны показывать то,
    // на что человек сейчас смотрит, иначе переход теряет половину смысла.
    this.curFollow.set(x, y, 0);
    this.followTarget.copy(_p);
    this.followActive = true;
    this.profileFollow = true;
  }

  hasWall(): boolean {
    return !!this.isolated && this.isolated.length >= 500 && this.ucs.defined;
  }

  wallPointsXY(): { xy: Float32Array; n: number } | null {
    const idx = this.isolated;
    if (!idx || idx.length < 500) return null;

    let zLo = this.snapZMin;
    let zHi = this.snapZMax;

    // Цвет — второй фильтр слоя, вместе с глубиной: срез можно держать
    // щедрым, штукатурку той же глубины уберёт цвет.
    const byColor = this.colorOn && this.colorSamples.length > 0;

    if (!Number.isFinite(zLo) || !Number.isFinite(zHi)) {
      // Выборка ~20 тыс. точек: медиана и мода глубины по ней не отличаются
      // от полных в пределах сантиметра, а считается это мгновенно.
      // Гистограмма — по УЖЕ отфильтрованным цветом точкам: если образец —
      // кирпич, самый плотный слой это плоскость кирпичей, и рельеф
      // находится вообще без ручного среза.
      const step = Math.max(1, Math.floor(idx.length / 20000));
      const BINS = 240;
      let lo = Infinity;
      let hi = -Infinity;
      const zs: number[] = [];
      for (let k = 0; k < idx.length; k += step) {
        if (byColor && !this.colorMatch(idx[k])) continue;
        this.dq(idx[k], _p).applyMatrix4(this.ucs.inverse);
        zs.push(_p.z);
        if (_p.z < lo) lo = _p.z;
        if (_p.z > hi) hi = _p.z;
      }
      if (!(hi > lo)) return null;
      const bin = (hi - lo) / BINS;
      const hist = new Int32Array(BINS);
      for (const z of zs) hist[Math.min(BINS - 1, ((z - lo) / bin) | 0)]++;
      let best = 0;
      for (let b = 1; b < BINS; b++) if (hist[b] > hist[best]) best = b;
      const centre = lo + (best + 0.5) * bin;
      // ±12 см вокруг плоскости стены: толще — затянет откосы, тоньше —
      // выпадут неровности штукатурки, и стена «продырявится» сама.
      zLo = centre - 0.12;
      zHi = centre + 0.12;
    }

    const xy = new Float32Array(idx.length * 2);
    let n = 0;
    for (let k = 0; k < idx.length; k++) {
      if (byColor && !this.colorMatch(idx[k])) continue;
      this.dq(idx[k], _p).applyMatrix4(this.ucs.inverse);
      if (_p.z < zLo || _p.z > zHi) continue;
      xy[n * 2] = _p.x;
      xy[n * 2 + 1] = _p.y;
      n++;
    }
    return n >= 500 ? { xy, n } : null;
  }

  /** Create a NEW named UCS from two wall points and make it active. */
  defineUcs(p1: THREE.Vector3, p2: THREE.Vector3): void {
    this.ucs.setFromPoints(p1, p2);
    this.ucsList.push({ name: `ПСК ${this.ucsList.length + 1}`, matrix: this.ucs.matrix.clone() });
    this.activeUcs = this.ucsList.length - 1;
    this.afterUcsChange();
    this.markDirty();
  }

  /** Dropdown: index 0 = МСК (overview), 1.. = saved wall UCS. */
  private onUcsSelect(i: number): void {
    if (i === 0) this.enterWorldMode();
    else this.activateUcs(i - 1);
  }

  private activateUcs(i: number): void {
    if (i === this.activeUcs || i < 0 || i >= this.ucsList.length) return;
    // Смена ПСК меняет систему координат черчения ПОД взведённой командой:
    // недорисованная полилиния, пипетка цвета, обводка ОБЛАСТИ — вся их
    // локальная математика была в осях СТАРОЙ стены. Как в любом CAD, смена
    // рабочей плоскости отменяет команду, а не тащит её обрывки в новую
    // систему (пойман пользователем: «переключился на ПСК2, не смог
    // вернуться на ПСК1» — пипетка проёмов осталась взведена и съедала
    // клики). activate('select') — безопасный no-op, если уже «Выбор».
    this.tools.activate('select');
    this.ucs.setFromMatrix(this.ucsList[i].matrix);
    this.activeUcs = i;
    this.afterUcsChange();
    this.markDirty();
  }

  /** МСК: whole cloud in top view + name labels at each saved UCS. */
  private enterWorldMode(): void {
    this.activeUcs = -1;
    this.updateFacadeBand(); // в МСК срезу не по чему меряться — полоса гаснет
    // Drafting plane back to the ground: a top-down ray vs the (vertical)
    // wall plane is near-parallel → intersections at ±∞ → NaN camera
    // matrices and a renderer crash. activateUcs()/finalize() restores it.
    this.ucs.plane.normal.set(0, 1, 0);
    this.ucs.plane.constant = 0;
    // Фасад закончен — выделение стены сбрасывается: МСК это не только
    // обзор, это старт СЛЕДУЮЩЕГО фасада, и лассо должно быть уже в руке.
    // Чертёж и список ПСК остаются; вернуться к готовому фасаду — выбрать
    // его ПСК в списке.
    this.clearLasso();
    this.snap.clear();
    // МСК — обзор ОБЛАКА, не чертежа: чертёж каждой стены живёт в её
    // собственной ПСК (см. EntityStore.homeUcs), в МСК не видно ничего.
    this.store.refreshUcsVisibility(-1);
    this.ucsLabels.visible = true;
    this.ui.showSectionPanel(false);
    this.refreshUcsUI();
    this.enterTopView();
    this.tools.activate('isolate');
    this.ui.setHint('МСК — обведите СЛЕДУЮЩИЙ фасад лассо, или выберите готовую ПСК из списка, чтобы вернуться к черчению');
    this.markDirty();
  }

  private afterUcsChange(): void {
    this.cloudUniforms.uUcsInv.value.copy(this.ucs.inverse);
    // Каждая стена — свои сущности: показать «домашние» этой ПСК, спрятать
    // все остальные (иначе координаты другой стены читались бы через ЭТУ
    // матрицу и превращались в кашу — см. EntityStore.refreshUcsVisibility).
    this.store.refreshUcsVisibility(this.activeUcs);
    // Листья стены живут в мировых осях — от смены ПСК не зависят.
    // Пересчёта требует только снап-грид (он в локальных осях).
    this.rebuildSnapGrid();
    // Полоса среза в сечении — в локальных осях, ей смена ПСК не страшна,
    // но видимость зависит от activeUcs.
    this.updateFacadeBand();
    // The plan slice was scaffolding for picking the UCS; from here on the
    // facade depth slice is the tool that matters.
    this.planSliceOn = false;
    this.planSliceBand.visible = false;
    this.ui.showPlanSlicePanel(false);
    this.ucsLabels.visible = false;
    this.refreshUcsUI();
    this.rebuildUcsLabels();
    this.ui.showSectionPanel(true);
    this.enterDraftView(true);
  }

  private refreshUcsUI(): void {
    this.ui.setUcsList(['МСК', ...this.ucsList.map((u) => u.name)], this.activeUcs + 1);
  }

  private renameUcs(): void {
    if (this.activeUcs < 0) return;
    const entry = this.ucsList[this.activeUcs];
    const name = window.prompt('Имя ПСК:', entry.name);
    if (name && name.trim()) {
      entry.name = name.trim();
      this.refreshUcsUI();
      this.rebuildUcsLabels();
      this.markDirty();
    }
  }

  // -------------------------------------------------- import / export --

  /** Parsing runs in a Web Worker: the UI keeps painting and the progress
   *  counter moves even on 500 MB files. Файлов может быть несколько —
   *  куски съёмки склеиваются воркером в одно облако. */
  private async importCloud(files: File[]): Promise<void> {
    this.ui.setProgress('Чтение файла… 0%');
    // informational only, see facade_cad_sessions.cloud_name — multiple
    // files glue into one cloud, so just note the first name (+ count).
    this.cloudName = files.length ? files[0].name + (files.length > 1 ? ` +${files.length - 1}` : '') : null;
    // The File objects are structured-clonable: the worker reads them via
    // File.slice, so multi-GB clouds never allocate one giant buffer here.
    this.ensureWorker();
    if (this.workerReady) this.importWorker!.postMessage({ files });
    else this.pendingJob = { files }; // flushed on 'ready'
  }

  /** Demo cloud is built in the worker — the main thread keeps painting. */
  private requestDemo(): void {
    this.ui.setProgress('Генерация демо-облака…');
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
    } else if (m.type === 'lasso') {
      this.onLassoResult(m);
    } else if (m.type === 'done' && m.qpos && m.colors) {
      this.ui.setProgress(null);
      this.ui.showStart(false);
      this.cloudOrigin = m.origin ?? null;
      this.applyCloud(m.qpos, m.colors, m.count ?? m.qpos.length / 3, m.leaves ?? new Float64Array(0));
    }
  }

  private applyCloud(qpos: Uint16Array, colors: Uint8Array, count: number, leafData: Float64Array): void {
    // Старое облако: геометрии листьев долой — общий VBO уходит вместе с
    // последней из них. Материалы листьев свои (кванты) — тоже освобождаем.
    for (const lf of this.leaves) {
      this.chunkGroup.remove(lf.points);
      (lf.points.material as THREE.Material).dispose();
      lf.geo.dispose();
    }
    this.leaves.length = 0;

    // Один VBO позиций и один цветов на ВСЁ облако: геометрии листьев делят
    // те же атрибуты, различаясь только drawRange — память не дублируется,
    // а лист остаётся отдельным draw call'ом со своим LOD-префиксом.
    // Позиции — uint16-кванты; в мир их возвращает шейдер по uQMin/uQScale
    // своего листа (createLeafMaterial), CPU — через leafOf().
    const posAttr = new THREE.BufferAttribute(qpos, 3);
    const colAttr = new THREE.BufferAttribute(colors, 3, true);
    const bounds = new THREE.Box3();
    for (let o = 0; o + LEAF_STRIDE <= leafData.length; o += LEAF_STRIDE) {
      const box = new THREE.Box3(
        new THREE.Vector3(leafData[o + 2], leafData[o + 3], leafData[o + 4]),
        new THREE.Vector3(leafData[o + 5], leafData[o + 6], leafData[o + 7]),
      );
      bounds.union(box);
      const qMin = box.min.clone();
      const qScale = new THREE.Vector3(
        Math.max(1e-9, box.max.x - box.min.x) / 65535,
        Math.max(1e-9, box.max.y - box.min.y) / 65535,
        Math.max(1e-9, box.max.z - box.min.z) / 65535,
      );
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', posAttr);
      geo.setAttribute('aColor', colAttr);
      geo.setDrawRange(leafData[o], leafData[o + 1]);
      geo.boundingSphere = box.getBoundingSphere(new THREE.Sphere());
      const points = new THREE.Points(geo, createLeafMaterial(this.cloudUniforms, qMin, qScale));
      points.frustumCulled = false; // отбор наш, в applyChunkLod
      points.layers.set(4);
      this.chunkGroup.add(points);
      this.leaves.push({
        start: leafData[o],
        count: leafData[o + 1],
        box,
        geo,
        points,
        want: 0,
        qmx: qMin.x,
        qmy: qMin.y,
        qmz: qMin.z,
        qsx: qScale.x,
        qsy: qScale.y,
        qsz: qScale.z,
      });
    }

    this.cloudQ = qpos;
    this.cloud.count = count;
    this.cloudColors = colors;

    // New cloud = new document: drop the drawing, undo history and the
    // previous cloud's UCS list.
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
    this.ui.showSectionPanel(false);
    this.markDirty(); // persist the now-empty document, not the old one
    // Сфера и диапазон высот — из коробок листьев: ещё один полный проход
    // по десяткам миллионов точек здесь ничего бы не уточнил.
    const sphere = bounds.isEmpty() ? new THREE.Sphere(new THREE.Vector3(), 10) : bounds.getBoundingSphere(new THREE.Sphere());
    this.cloud.center.copy(sphere.center);
    this.cloud.radius = Math.max(1, sphere.radius);
    const yMin = bounds.isEmpty() ? 0 : bounds.min.y;
    const yMax = bounds.isEmpty() ? 1 : bounds.max.y;
    this.cloudUniforms.uMinY.value = yMin;
    this.cloudUniforms.uYRangeInv.value = 1 / Math.max(1e-3, yMax - yMin);
    this.clearLasso();
    this.snap.clear();
    this.facadeSliceOn = false;
    this.facadeSliceZ = 0;
    this.facadeSliceThick = 0.24;
    this.sliceGrab = null;
    this.sliceGrabPrev = null;
    this.syncSliceUI();
    this.updateFacadeBand();
    this.planSliceY = yMin + 1.5;
    this.planSliceThick = 0.3;
    this.ui.setPlanSliceRange(yMin, yMax);
    this.ui.setPlanSlice(false, this.planSliceY, this.planSliceThick);
    this.vpm.setIsoView(this.cloud.center, this.cloud.radius);
    this.enterTopView();
    this.tools.activate('isolate');
    this.ui.setHint(`Импортировано ${count.toLocaleString('ru-RU')} точек — обведите стену контуром`);
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
   *  the scan's own system instead of the wall UCS. */
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
    downloadText('facade.dxf', toDxf(geo, this.layers.layers));
    for (const g of geo) if (!list.includes(g)) g.dispose();
    this.ui.setHint(`DXF сохранён: ${list.length} об., координаты ${this.exportInWorld ? 'МСК облака' : 'активной ПСК'}`);
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
        this.ui.setHint(`Отправлено в AutoCAD: ${list.length} об. в ${this.exportInWorld ? 'МСК облака' : 'ПСК стены'}`);
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
      ctx.fillStyle = 'rgba(22, 25, 27, 0.8)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#86efac';
      ctx.textBaseline = 'middle';
      ctx.fillText(u.name, 12, 34);
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
      const h = 1.2;
      sprite.scale.set((h * canvas.width) / canvas.height, h, 1);
      sprite.position.setFromMatrixPosition(u.matrix);
      sprite.position.y += 2.5;
      sprite.renderOrder = 5;
      this.ucsLabels.add(sprite);
    }
  }

  /** UCS lists are SESSION-scoped: a wall UCS only means something for the
   *  cloud and the drawing it was built with, and both die with the tab.
   *  Persisting them just resurrected stale coordinate systems on reload —
   *  when the app moves to a server they belong in the project document,
   *  not in browser storage. This call only purges the legacy keys. */
  private loadUcsList(): void {
    this.ucsLabels.visible = false;
    try {
      localStorage.removeItem('facadecad.ucs'); // legacy global list
      localStorage.removeItem('facadecad.layers'); // legacy, see constructor
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith('facadecad.ucs:')) localStorage.removeItem(k);
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

  /** Rebuild the named-UCS registry and reactivate whichever one was active
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
   *  api/facade_cad_session.php fans each element out into a row with a
   *  real PostGIS `geometry` column (see sql/schema.sql::facade_cad_entities)
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

  /** Fired once at startup: pulls this admin's last-saved layers/drawing/UCS
   *  list from Postgres (see api/facade_cad_session.php). Best-effort — a
   *  failed/empty response just leaves the tool at its built-in defaults,
   *  same as before this endpoint existed. `entities` comes back as a plain
   *  JSON array (reassembled server-side from PostGIS rows) — re-stringify
   *  it once here so EntityStore.restore() (a JSON-string API, shared with
   *  the undo/redo snapshot format) doesn't need its own array overload. */
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

  /** Drafting is meaningless in МСК overview (entities live in wall UCS). */
  canDraft(): boolean {
    return !(this.ucs.defined && this.activeUcs < 0);
  }

  /** ToolHost: pick a scan point and make its depth the deviation zero. */
  setDeviationRef(ray: THREE.Ray): boolean {
    if (!this.ucs.defined || this.activeUcs < 0) {
      this.ui.setHint('Сначала задайте ПСК стены — отклонения считаются от её плоскости');
      return false;
    }
    if (!this.pickCloudPoint(ray, _p)) {
      this.ui.setHint('Не удалось поймать точку скана — целься в облако');
      return false;
    }
    this.ucs.worldToLocal(_p, _dir);
    this.deviationRef = _dir.z;
    this.ui.setHint('Нулевая плоскость задана (глубина ' + _dir.z.toFixed(3) + ' м) — кликайте точки, отклонения появятся подписями');
    return true;
  }

  // ToolHost: snapping honors the facade slice when it is active.
  get snapZMin(): number {
    return this.facadeSliceOn ? this.facadeSliceZ - this.facadeSliceThick / 2 : -Infinity;
  }

  get snapZMax(): number {
    return this.facadeSliceOn ? this.facadeSliceZ + this.facadeSliceThick / 2 : Infinity;
  }

  /**
   * Пересчёт поиска проёмов вслед за ползунками среза — но с задержкой:
   * тянущийся ползунок сыплет события на каждый пиксель, а пересчёт — это
   * проход по миллионам точек. Пока инструмент не активен, не делаем ничего.
   */
  private openingsLive(): void {
    if (this.tools.active !== this.openings) return;
    clearTimeout(this.openingsTimer);
    this.openingsTimer = window.setTimeout(() => {
      if (this.tools.active === this.openings) this.openings.refreshWall();
    }, 180);
  }

  /** Применить срез, заданный ГРАНИЦАМИ (метры): панель ОТ/ДО и протяжка
   *  в сечении говорят на языке границ, движок хранит середину и толщину. */
  private setFacadeRange(lo: number, hi: number): void {
    this.facadeSliceZ = (lo + hi) / 2;
    this.facadeSliceThick = Math.max(0.002, hi - lo);
    this.facadeSliceOn = true;
    this.syncSliceUI();
    this.updateFacadeBand();
    this.openingsLive();
  }

  private syncSliceUI(): void {
    this.ui.setFacadeSlice(
      this.facadeSliceOn,
      this.facadeSliceZ - this.facadeSliceThick / 2,
      this.facadeSliceZ + this.facadeSliceThick / 2,
    );
  }

  private updateFacadeBand(): void {
    const on = this.facadeSliceOn && this.ucs.defined && this.activeUcs >= 0;
    const b = this.facadeBand;
    b.visible = on;
    this.facadeEdges.visible = on;
    if (!on) return;
    b.position.set(0, 0, this.facadeSliceZ);
    b.scale.set(4000, 4000, Math.max(0.002, this.facadeSliceThick));
    // Оси-границы: крест длинных линий на каждой границе; setPositions на
    // живой геометрии Line2 ненадёжен — собираем заново (4 отрезка, дёшево).
    const lo = this.facadeSliceZ - this.facadeSliceThick / 2;
    const hi = this.facadeSliceZ + this.facadeSliceThick / 2;
    const L = 2000;
    const geo = new LineSegmentsGeometry();
    geo.setPositions([-L, 0, lo, L, 0, lo, 0, -L, lo, 0, L, lo, -L, 0, hi, L, 0, hi, 0, -L, hi, 0, L, hi]);
    this.facadeEdges.geometry.dispose();
    this.facadeEdges.geometry = geo;
    this.facadeEdges.computeLineDistances();
  }

  /** Допуск захвата границы: 8 px, пересчитанные в метры глубины по месту.
   *  Ось глубины на экране сечения то горизонтальна (ВЕРТ), то вертикальна
   *  (ГОРИЗ) — пробуем обе и берём живую. */
  private profileDepthTol(cx: number, cy: number): number {
    const dx = Math.abs(this.profileDepthAt(cx + 4, cy) - this.profileDepthAt(cx - 4, cy)) / 8;
    const dy = Math.abs(this.profileDepthAt(cx, cy + 4) - this.profileDepthAt(cx, cy - 4)) / 8;
    return Math.max(dx, dy) * 8;
  }

  /**
   * Мерная сетка глубины окна 2: подписи в мм от плоскости ПСК. Камера
   * сечения ездит за курсором, поэтому сетка живёт от кадра — с дросселем
   * и пропуском, когда ничего не изменилось.
   */
  private refreshDepthRuler(): void {
    const now = performance.now();
    if (now - this.depthRulerT < 150) return;
    this.depthRulerT = now;
    if (!this.ucs.defined || this.activeUcs < 0 || this.vpm.profile.css.w < 2) {
      if (this.depthRulerSig) {
        this.depthRulerSig = '';
        this.ui.hideDepthRuler();
      }
      return;
    }
    const vp = this.vpm.profile;
    const horizontal = this.profileMode === 'vert'; // ось глубины на экране
    const cx = vp.css.x + vp.css.w / 2;
    const cy = vp.css.y + vp.css.h / 2;
    const span = horizontal ? vp.css.w : vp.css.h;
    const z0 = horizontal ? this.profileDepthAt(vp.css.x, cy) : this.profileDepthAt(cx, vp.css.y);
    const z1 = horizontal ? this.profileDepthAt(vp.css.x + vp.css.w, cy) : this.profileDepthAt(cx, vp.css.y + vp.css.h);
    if (!isFinite(z0) || !isFinite(z1) || Math.abs(z1 - z0) < 1e-9 || span < 40) return;
    const sig = `${horizontal}|${z0.toFixed(4)}|${z1.toFixed(4)}|${vp.css.x}|${vp.css.y}|${span}`;
    if (sig === this.depthRulerSig) return;
    this.depthRulerSig = sig;
    const perPx = (z1 - z0) / span;
    const minStep = Math.abs(perPx) * 56;
    const step = DEPTH_STEPS.find((s) => s >= minStep) ?? DEPTH_STEPS[DEPTH_STEPS.length - 1];
    const lo = Math.min(z0, z1);
    const hi = Math.max(z0, z1);
    const ticks: { p: number; label: string; major: boolean }[] = [];
    for (let k = Math.ceil(lo / step); k * step <= hi && ticks.length < 80; k++) {
      const z = k * step;
      ticks.push({ p: Math.round((z - z0) / perPx), label: String(Math.round(z * 1000)), major: k % 5 === 0 });
    }
    this.ui.renderDepthRuler(ticks, horizontal, vp.css);
  }

  // ------------------------------------------------------ раскладка окон

  /** Раскладка окон живёт между сеансами — как и лента. */
  private loadPaneLayout(): void {
    try {
      const raw = localStorage.getItem('facadecad.panes');
      if (raw) this.vpm.setLayout(JSON.parse(raw) as Partial<PaneLayout>);
    } catch {
      // повреждённое хранилище — молча остаёмся на раскладке по умолчанию
    }
    this.syncPaneChips();
  }

  private savePaneLayout(): void {
    localStorage.setItem('facadecad.panes', JSON.stringify(this.vpm.layout()));
  }

  /** Убрать/вернуть окно 2 или 3. Окно 1 — командное, его не прячем:
   *  хотите «только окно 1» — уберите оба соседних. */
  private setPaneHidden(name: 'profile' | 'iso', hidden: boolean): void {
    this.vpm.setLayout(name === 'profile' ? { hideProfile: hidden } : { hideIso: hidden });
    this.syncPaneChips();
    this.savePaneLayout();
    if (hidden && this.activePane === name) this.setActivePane('main');
    if (name === 'profile' && hidden) this.ui.hideDepthRuler();
    // Рамка фокуса обязана пересесть на новую геометрию окон.
    this.ui.setActivePane(this.activePane, this.vpm[this.activePane].css);
  }

  private syncPaneChips(): void {
    const l = this.vpm.layout();
    document.getElementById('restore-profile')?.classList.toggle('hidden', !l.hideProfile);
    document.getElementById('restore-iso')?.classList.toggle('hidden', !l.hideIso);
  }

  /** Глубина (локальная z ПСК) под курсором в окне сечения: ортокамера
   *  смотрит вдоль стены, обратная проекция точки экрана даёт слой. */
  private profileDepthAt(clientX: number, clientY: number): number {
    const vp = this.vpm.profile;
    _p.set(((clientX - vp.css.x) / vp.css.w) * 2 - 1, -(((clientY - vp.css.y) / vp.css.h) * 2 - 1), 0).unproject(vp.camera);
    this.ucs.worldToLocal(_p, _p);
    return _p.z;
  }

  enterTopView(): void {
    // Back to the horizontal drafting plane: the side view tilted it so the
    // cursor had something to hit (see enterLevelView).
    this.ucs.plane.normal.set(0, 1, 0);
    this.ucs.plane.constant = 0;
    // Frame the isolated wall when there is one — after the lasso the whole
    // scan is no longer what you are working on.
    if (!this.isoBounds.isEmpty()) {
      this.isoBounds.getCenter(_center);
      this.isoBounds.getSize(_size);
      _center.y = 0;
      const aspect = this.vpm.main.css.w / Math.max(1, this.vpm.main.css.h);
      this.vpm.setTopView(_center, THREE.MathUtils.clamp(Math.max(_size.z * 1.4, (_size.x * 1.4) / aspect), 2, 4000));
    } else {
      _center.copy(this.cloud.center);
      _center.y = 0;
      this.vpm.setTopView(_center, this.cloud.radius * 1.7);
    }
    this.mainMode = 'top';
    this.planSliceBand.visible = false;
    this.ui.showElevationAids(false);
    this.ui.showPlanSlicePanel(this.isolated !== null);
    this.ui.setMainLabel(this.planSliceOn && this.isolated ? 'ПЛАН · СРЕЗ ПО ВЫСОТЕ' : 'ПЛАН · ВИД СВЕРХУ');
  }

  /** ToolHost: the step between the lasso and the UCS — the isolated wall
   *  seen from the SIDE, where the height of the plan slice is set. */
  enterLevelView(): void {
    if (this.isoBounds.isEmpty()) {
      this.ui.setHint('Сначала обведите стену контуром на виде сверху');
      this.tools.activate('isolate');
      return;
    }
    this.isoBounds.getCenter(_center);
    this.isoBounds.getSize(_size);
    // Look at the widest horizontal face, so the wall fills the pane.
    const alongX = _size.x >= _size.z;
    _eye.set(alongX ? 0 : 1, 0, alongX ? 1 : 0);
    const vp = this.vpm.main;
    const aspect = vp.css.w / Math.max(1, vp.css.h);
    const width = alongX ? _size.x : _size.z;
    this.vpm.setOrthoView(vp, _eye, _upY, _center, THREE.MathUtils.clamp(Math.max(_size.y * 1.3, (width * 1.15) / aspect), 1, 2000));
    // A side camera's rays are parallel to the ground plane and would never
    // intersect it — stand the drafting plane up to face the camera so the
    // cursor keeps producing a world point (its height IS the level).
    this.ucs.plane.setFromNormalAndCoplanarPoint(_eye, _center);
    this.mainMode = 'level';
    this.ui.showPlanSlicePanel(true);
    this.ui.setPlanSlice(this.planSliceOn, this.planSliceY, this.planSliceThick);
    this.updatePlanBand();
    this.ui.showElevationAids(true);
    this.refreshElevationScale();
    this.ui.setMainLabel('УРОВЕНЬ СРЕЗА · ВИД СБОКУ');
  }

  /** Metre ticks down the left edge of the side view. The Engine owns the
   *  camera, so it projects; the UI only paints what it is handed. */
  private refreshElevationScale(): void {
    if (this.mainMode !== 'level') return;
    const vp = this.vpm.main;
    const cam = vp.camera as THREE.OrthographicCamera;
    const fH = vp.frustumHeight;
    const yLo = cam.position.y - fH / 2; // camera looks horizontally, up = +Y
    const yHi = cam.position.y + fH / 2;
    // Coarsest step whose labels still land at least ~46 px apart.
    const minStep = (46 / Math.max(1, vp.css.h)) * fH;
    const step = ELEV_STEPS.find((s) => s >= minStep) ?? ELEV_STEPS[ELEV_STEPS.length - 1];
    const ticks: { y: number; label: string; major: boolean }[] = [];
    for (let k = Math.ceil(yLo / step); k * step <= yHi && ticks.length < 80; k++) {
      const y = k * step;
      ticks.push({
        y: Math.round(vp.css.y + vp.css.h * (1 - (y - yLo) / fH)),
        label: (Math.abs(y) < 1e-9 ? 0 : y).toFixed(step < 1 ? 2 : 1),
        major: k % 5 === 0,
      });
    }
    this.ui.renderElevationScale(ticks);
  }

  /** ToolHost: click in the side view = put the slice at that height. */
  setPlanSliceLevel(y: number): void {
    if (this.isoBounds.isEmpty()) return;
    this.planSliceY = THREE.MathUtils.clamp(y, this.isoBounds.min.y, this.isoBounds.max.y);
    this.planSliceOn = true;
    this.ui.setPlanSlice(true, this.planSliceY, this.planSliceThick);
    this.updatePlanBand();
  }

  /** Place the translucent slab marker in the side view. */
  private updatePlanBand(): void {
    const band = this.planSliceBand;
    band.visible = this.mainMode === 'level' && !this.isoBounds.isEmpty();
    if (!band.visible) return;
    this.isoBounds.getCenter(_center);
    this.isoBounds.getSize(_size);
    const alongX = _size.x >= _size.z;
    band.position.set(_center.x, this.planSliceY, _center.z);
    band.rotation.set(0, alongX ? 0 : Math.PI / 2, 0);
    band.scale.set((alongX ? _size.x : _size.z) * 1.08, Math.max(0.03, this.planSliceThick), 1);
  }

  /** Align main/profile cameras to the active UCS. Re-frames only when
   *  coming from the top view (or after a UCS change) so tool switching
   *  never steals the user's zoom. */
  enterDraftView(force = false): void {
    if (!this.ucs.defined || this.activeUcs < 0) return; // МСК stays in top view
    if (this.mainMode === 'draft' && !force) return;
    const b = this.snap.localBounds;
    let fH = 20;
    if (this.snap.ready && !b.isEmpty()) {
      b.getCenter(_p);
      this.ucs.localToWorld(_p, _center);
      fH = THREE.MathUtils.clamp((b.max.y - b.min.y) * 1.35, 4, 500);
    } else {
      _center.copy(this.ucs.origin);
    }
    this.vpm.setOrthoView(this.vpm.main, this.ucs.zAxis, this.ucs.yAxis, _center, fH);
    this.applyProfileView(_center);
    this.mainMode = 'draft';
    this.ui.showElevationAids(false);
    this.ui.setMainLabel('ФАСАД · ЧЕРЧЕНИЕ');
  }

  /** Eye direction of the profile camera for the current cut mode.
   *  'vert' looks along the wall (X); 'horiz' looks up at the horizontal
   *  cut so the facade still reads left→right on screen. */
  private profileEye(out: THREE.Vector3): THREE.Vector3 {
    return this.profileMode === 'vert' ? out.copy(this.ucs.xAxis) : out.copy(this.ucs.yAxis).negate();
  }

  private applyProfileView(centerWorld: THREE.Vector3): void {
    const vp = this.vpm.profile;
    const up = this.profileMode === 'vert' ? this.ucs.yAxis : this.ucs.zAxis;
    // The span runs vertically on screen for the vertical cut and
    // horizontally for the plan cut — divide by aspect so «Охват» always
    // means "this much of the wall fills the pane".
    const aspect = vp.css.w / Math.max(1, vp.css.h);
    const fH = this.profileMode === 'vert' ? this.profileWindow * 1.15 : (this.profileWindow * 1.15) / aspect;
    this.vpm.setOrthoView(vp, this.profileEye(_dir), up, centerWorld, fH);
  }

  /** Re-aim the profile pane after a mode/window change (around the cursor
   *  when there is one, else the UCS origin). */
  private refreshProfileView(): void {
    if (!this.ucs.defined || this.activeUcs < 0) return;
    _center.copy(this.tools.pointer.valid ? this.tools.pointer.world : this.ucs.origin);
    this.applyProfileView(_center);
    this.profileFollow = true;
    this.ui.setProfileLabel(this.profileMode === 'vert' ? 'СЕЧЕНИЕ · ВЕРТИКАЛЬНОЕ' : 'СЕЧЕНИЕ · ГОРИЗОНТАЛЬНОЕ');
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

  /** Focus a pane: camera tracking follows the focus, never the raw cursor
   *  position, so crossing a pane cannot disturb an armed command. */
  private setActivePane(name: ViewportName): void {
    const c = this.vpm[name].css;
    if (c.w < 2 || c.h < 2) return; // окно скрыто раскладкой — фокусу некуда
    this.activePane = name;
    // Only the drafting pane drives the tracking cameras; focusing a view
    // pane means the user wants to drive that view by hand.
    this.followActive = name === 'main' && this.followActive;
    this.profileFollow = name === 'main' && this.profileFollow;
    // Фокус в сечении замораживает и сам рез (см. profileFrozen), фокус в
    // окне 1 отпускает его обратно за курсором.
    if (name === 'profile' && !this.profileFrozen) {
      this.profileFreeze.copy(this.tools.pointer.local);
      this.profileFrozen = true;
    } else if (name === 'main') {
      this.profileFrozen = false;
    }
    this.ui.setActivePane(name, this.vpm[name].css);
  }

  private refreshOrthoUI(): void {
    this.ui.setOrtho(this.tools.orthoActive);
  }

  private setSectionDepth(v: number): void {
    this.sectionDepth = v;
    this.ui.setSectionValue(v);
  }

  // ---------------------------------------------------------------- input

  private bindInput(canvas: HTMLCanvasElement): void {
    canvas.addEventListener('pointerdown', (e) => {
      const vp = this.vpm.viewportAt(e.clientX, e.clientY);
      if (!vp) return;
      if (e.button === 1) {
        // MMB pan for the two orthographic viewports (CAD habit)
        if (vp.camera instanceof THREE.OrthographicCamera) {
          this.panning = vp;
          this.panX = e.clientX;
          this.panY = e.clientY;
          canvas.setPointerCapture(e.pointerId);
        }
        e.preventDefault();
        return;
      }
      if (e.button === 0) this.setActivePane(vp.name); // click = focus
      // ЛКМ в окне 2 ВСЕГДА правит срез: за ось — эту границу, внутри
      // полосы — весь срез, в пустоте — новая протяжка. Никаких режимов.
      if (e.button === 0 && vp.name === 'profile' && this.ucs.defined && this.activeUcs >= 0) {
        const z = this.profileDepthAt(e.clientX, e.clientY);
        const tol = this.profileDepthTol(e.clientX, e.clientY);
        const lo = this.facadeSliceZ - this.facadeSliceThick / 2;
        const hi = this.facadeSliceZ + this.facadeSliceThick / 2;
        this.sliceGrabPrev = { on: this.facadeSliceOn, z: this.facadeSliceZ, t: this.facadeSliceThick };
        if (this.facadeSliceOn && Math.abs(z - lo) <= tol) {
          this.sliceGrab = 'lo';
        } else if (this.facadeSliceOn && Math.abs(z - hi) <= tol) {
          this.sliceGrab = 'hi';
        } else if (this.facadeSliceOn && z > lo && z < hi) {
          this.sliceGrab = 'move';
          this.sliceGrabZ0 = z - this.facadeSliceZ; // смещение точки хвата от центра
        } else {
          this.sliceGrab = 'new';
          this.sliceGrabZ0 = snap5(z);
          this.setFacadeRange(this.sliceGrabZ0, this.sliceGrabZ0);
        }
        canvas.setPointerCapture(e.pointerId);
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
      if (this.sliceGrab) {
        // Оси прилипают к мерной сетке (5 мм): срез — обмер, а не жест.
        // Окно 1 фильтруется на лету, полоса и панель ОТ/ДО — тоже.
        const z = snap5(this.profileDepthAt(e.clientX, e.clientY));
        const lo = this.facadeSliceZ - this.facadeSliceThick / 2;
        const hi = this.facadeSliceZ + this.facadeSliceThick / 2;
        if (this.sliceGrab === 'new') {
          this.setFacadeRange(Math.min(this.sliceGrabZ0, z), Math.max(this.sliceGrabZ0, z));
        } else if (this.sliceGrab === 'lo') {
          this.setFacadeRange(Math.min(z, hi), hi);
        } else if (this.sliceGrab === 'hi') {
          this.setFacadeRange(lo, Math.max(z, lo));
        } else {
          const c = snap5(z - this.sliceGrabZ0);
          const half = this.facadeSliceThick / 2;
          this.setFacadeRange(c - half, c + half);
        }
        return;
      }
      const vp = this.vpm.viewportAt(e.clientX, e.clientY);
      if (!vp) return;
      // CAD cursor: crosshair only while a drawing/editing command is armed.
      const drawing = this.tools.active !== null && this.tools.active.id !== 'select';
      let cursor = vp.name === 'main' && drawing ? 'crosshair' : 'default';
      // Окно 2 — редактор среза: курсор подсказывает, что схватится.
      if (vp.name === 'profile' && this.ucs.defined && this.activeUcs >= 0) {
        cursor = 'crosshair';
        if (this.facadeSliceOn) {
          const z = this.profileDepthAt(e.clientX, e.clientY);
          const tol = this.profileDepthTol(e.clientX, e.clientY);
          const lo = this.facadeSliceZ - this.facadeSliceThick / 2;
          const hi = this.facadeSliceZ + this.facadeSliceThick / 2;
          if (Math.abs(z - lo) <= tol || Math.abs(z - hi) <= tol) {
            cursor = this.profileMode === 'vert' ? 'ew-resize' : 'ns-resize';
          } else if (z > lo && z < hi) {
            cursor = 'move';
          }
        }
      }
      canvas.style.cursor = cursor;
      if (vp.name === 'main') {
        this.tools.pointerMove(e, vp);
        const p = this.tools.pointer;
        // Side view: the only coordinate that means anything here is the
        // ELEVATION, so the readout and a guide line report exactly that.
        if (this.mainMode === 'level') {
          const lo = this.planSliceY - this.planSliceThick / 2;
          const hi = this.planSliceY + this.planSliceThick / 2;
          if (p.valid) {
            this.ui.setElevationCursor(e.clientY, `${p.world.y.toFixed(2)} м`, vp.css.x, vp.css.w);
            this.ui.setCoordsText(`ОТМЕТКА ${p.world.y.toFixed(3)}  ·  СРЕЗ ${lo.toFixed(2)}…${hi.toFixed(2)} м`);
          } else {
            this.ui.setElevationCursor(null, '', 0, 0);
          }
          this.refreshOrthoUI();
          return;
        }
        if (p.valid) {
          if (this.exportInWorld) {
            this.worldToSource(p.world, _p);
            this.ui.setCoords(_p.x, _p.y, _p.z);
          } else {
            this.ui.setCoords(p.local.x, p.local.y);
          }
          this.noteFollow();
          this.followTarget.copy(p.world);
          // Tracking re-engages only while the drafting pane holds focus.
          if (this.activePane === 'main') {
            this.followActive = true;
            this.profileFollow = true;
          }
        }
        this.refreshOrthoUI();
      }
    });

    const pad = document.getElementById('orbit-pad') as HTMLElement;
    pad.addEventListener('pointerdown', () => this.setActivePane('iso'));
    // Drafting directly in the iso viewport (LMB while a command is armed).
    pad.addEventListener('pointerdown', (e) => {
      if (e.button === 0 && this.tools.active && this.tools.active.id !== 'select') this.tools.pointerDown(e, this.vpm.iso);
    });
    pad.addEventListener('pointermove', (e) => {
      const drawing = this.tools.active !== null && this.tools.active.id !== 'select';
      pad.style.cursor = drawing ? 'crosshair' : 'default';
      if (!drawing) return;
      this.tools.pointerMove(e, this.vpm.iso);
      const p = this.tools.pointer;
      if (p.valid) {
        this.ui.setCoords(p.local.x, p.local.y);
        this.noteFollow();
      }
    });
    pad.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.tools.finish();
    });

    canvas.addEventListener('pointerup', (e) => {
      if (this.panning && e.button === 1) {
        this.panning = null;
        canvas.releasePointerCapture(e.pointerId);
        return;
      }
      if (this.sliceGrab && e.button === 0) {
        const grab = this.sliceGrab;
        const prev = this.sliceGrabPrev;
        this.sliceGrab = null;
        this.sliceGrabPrev = null;
        canvas.releasePointerCapture(e.pointerId);
        if (this.facadeSliceThick < 0.004) {
          if (grab === 'new' && prev && prev.on) {
            // Случайный щелчок в пустоте не должен терять настроенный слой.
            this.facadeSliceZ = prev.z;
            this.facadeSliceThick = prev.t;
            this.facadeSliceOn = true;
            this.ui.setHint('Щелчка мало — прежний срез оставлен; чтобы задать новый, ПРОТЯНИТЕ диапазон');
          } else {
            // Сомкнули границы (или щёлкнули без среза) — среза нет.
            this.facadeSliceOn = false;
            this.ui.setHint('Срез выключен — протяните диапазон глубины в окне 2, чтобы задать новый');
          }
          this.syncSliceUI();
          this.updateFacadeBand();
          this.openingsLive();
          return;
        }
        const lo = Math.round((this.facadeSliceZ - this.facadeSliceThick / 2) * 1000);
        const hi = Math.round((this.facadeSliceZ + this.facadeSliceThick / 2) * 1000);
        this.ui.setHint(`Срез ${lo}…${hi} мм — тяните голубые оси в окне 2, точные числа в панели СРЕЗ`);
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
        this.setActivePane(e.key === '1' ? 'main' : e.key === '2' ? 'profile' : 'iso');
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

    // --- раскладка окон: грипы границ + скрытие/возврат окон 2 и 3 -------
    const bindGrip = (id: string, apply: (e: PointerEvent) => void) => {
      const g = document.getElementById(id) as HTMLElement | null;
      if (!g) return;
      g.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        g.setPointerCapture(e.pointerId);
        g.dataset.drag = 'true';
        const move = (ev: PointerEvent) => apply(ev);
        const up = () => {
          g.removeEventListener('pointermove', move);
          g.removeEventListener('pointerup', up);
          g.dataset.drag = 'false';
          this.savePaneLayout();
        };
        g.addEventListener('pointermove', move);
        g.addEventListener('pointerup', up);
      });
      // Двойной клик по грипу — раскладка по умолчанию, как сброс.
      g.addEventListener('dblclick', () => {
        this.vpm.setLayout({ splitX: SPLIT_X, splitY: SPLIT_Y });
        this.savePaneLayout();
      });
    };
    bindGrip('split-v', (e) => this.vpm.setLayout({ splitX: e.clientX / Math.max(1, window.innerWidth) }));
    bindGrip('split-h', (e) => {
      const top = this.vpm.main.css.y;
      this.vpm.setLayout({ splitY: (e.clientY - top) / Math.max(1, window.innerHeight - top) });
    });
    document.getElementById('close-profile')?.addEventListener('click', () => this.setPaneHidden('profile', true));
    document.getElementById('close-iso')?.addEventListener('click', () => this.setPaneHidden('iso', true));
    document.getElementById('restore-profile')?.addEventListener('click', () => this.setPaneHidden('profile', false));
    document.getElementById('restore-iso')?.addEventListener('click', () => this.setPaneHidden('iso', false));
  }
}
