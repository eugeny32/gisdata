/**
 * UI — thin DOM layer over the panel markup in index.html.
 * No framework: the Engine pushes state in, the UI pushes events out
 * through the handler bag.
 *
 * The ribbon is rendered from the data-driven layout in Ribbon.ts and is
 * user-customizable: the ⚙ pill toggles edit mode where buttons drag
 * between panels, panels can be added/renamed/removed, and the layout
 * persists (localStorage now, server later). All ribbon events ride on
 * ONE delegated listener, so re-rendering never re-binds anything.
 */
import { loadRibbonLayout, resetRibbonLayout, RIBBON_BUTTON_MAP, RibbonGroup, saveRibbonLayout } from './Ribbon';
import { GUIDE_HTML } from './Help';

export interface UIHandlers {
  /** Ribbon height in px after every (re)layout — the viewports dock under it. */
  onRibbonHeight(px: number): void;
  onTool(id: string): void;
  onErase(): void;
  onUndo(): void;
  onRedo(): void;
  onToggleSnap(): void;
  onToggleOrtho(): void;
  onSectionDepth(v: number): void;
  onToggleProfileMode(): void;
  onProfileWindow(v: number): void;
  onToggleFacadeSlice(): void;
  /** Границы среза фасада по глубине, МЕТРЫ (панель говорит в мм). */
  onFacadeSliceRange(lo: number, hi: number): void;
  /** Plan slice (between the lasso and the UCS): on/off, level, thickness,
   *  and "done — take me back to the plan". */
  onPlanSliceToggle(): void;
  onPlanSliceLevel(v: number): void;
  onPlanSliceThick(v: number): void;
  onPlanSliceDone(): void;
  onUcsSelect(index: number): void;
  onToggleLayer(name: 'main' | 'profile' | 'iso'): void;
  onCursorArea(v: number): void;
  onOpenCloudPanel(name: 'main' | 'profile' | 'iso'): void;
  onCloudSetting(name: 'main' | 'profile' | 'iso', key: 'size' | 'opacity' | 'density' | 'mode', v: number): void;
  onToggleCloud(name: 'main' | 'profile' | 'iso'): void;
  onImportFiles(files: File[]): void;
  onExportDxf(): void;
  onToCad(): void;
  onRenameUcs(): void;
  onDemoStart(): void;
  // CAD layers
  onLayerAdd(): void;
  onLayerDelete(name: string): void;
  onLayerRename(name: string): void;
  onLayerCurrent(name: string): void;
  onLayerColor(name: string, color: string): void;
  onLayerType(name: string, lt: string): void;
  onLayerWeight(name: string, w: number): void;
  onLayerToggleVisible(name: string): void;
  onAssignToLayer(): void;
  onToggleWeightDisplay(): void;
  /** Layer combo in the status bar: moves the selection when there is one,
   *  otherwise switches the layer new objects land on. */
  onLayerCombo(name: string): void;
}

/** View-model row for the layers panel. */
export interface LayerRowVM {
  name: string;
  color: string;
  linetype: string;
  weight: number;
  visible: boolean;
  current: boolean;
  /** How many entities live on this layer (shown as a count chip). */
  count: number;
}

interface CloudSettingsLike {
  size: number;
  opacity: number;
  density: number;
  mode: number;
}

function el<T extends HTMLElement = HTMLElement>(id: string): T {
  const n = document.getElementById(id);
  if (!n) throw new Error(`UI: missing #${id}`);
  return n as T;
}

/**
 * Приделывает каждому ползунку в HUD-полосках стрелки «◀ ▶».
 *
 * Полоска шириной 4.5 rem на диапазон в несколько метров — это два-три
 * сантиметра отметки на пиксель: попасть перетаскиванием в нужное значение
 * нельзя в принципе, а обмер требует именно нужного. Клик по стрелке двигает
 * ровно на шаг ползунка, удержание — повторяет.
 *
 * Делается разом для всех полосок, а не для каждой руками: панели добавляются
 * и перекраиваются, и забыть одну — вопрос времени.
 */
function addSliderArrows(): void {
  const strips = '.hud-strip input[type="range"], .op-row input[type="range"]';
  for (const input of document.querySelectorAll<HTMLInputElement>(strips)) {
    if (input.dataset.stepped === '1') continue;
    input.dataset.stepped = '1';

    const make = (dir: -1 | 1, glyph: string) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'hud-step';
      b.textContent = glyph;
      b.tabIndex = -1; // фокус здесь не нужен: Enter в CAD завершает команду
      b.title = dir < 0 ? 'На шаг меньше' : 'На шаг больше';
      const step = () => {
        const s = parseFloat(input.step) || 1;
        const v = parseFloat(input.value) + dir * s;
        const lo = input.min === '' ? -Infinity : parseFloat(input.min);
        const hi = input.max === '' ? Infinity : parseFloat(input.max);
        input.value = String(Math.min(hi, Math.max(lo, v)));
        input.dispatchEvent(new Event('input', { bubbles: true }));
      };
      // Удержание: первый шаг сразу, дальше повтор — как у обычного спиннера.
      let timer = 0;
      let repeat = 0;
      b.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        step();
        timer = window.setTimeout(() => {
          repeat = window.setInterval(step, 70);
        }, 380);
      });
      const stop = () => {
        clearTimeout(timer);
        clearInterval(repeat);
      };
      b.addEventListener('pointerup', stop);
      b.addEventListener('pointerleave', stop);
      b.addEventListener('pointercancel', stop);
      return b;
    };

    input.parentElement?.insertBefore(make(-1, '◀'), input);
    input.parentElement?.insertBefore(make(1, '▶'), input.nextSibling);
  }
}

const LINETYPES: [string, string][] = [
  ['solid', 'Сплошная'],
  ['dashed', 'Штриховая'],
  ['dotted', 'Пунктирная'],
  ['dashdot', 'Штрихпункт.'],
];

const WEIGHT_STEPS = [0.13, 0.18, 0.25, 0.35, 0.5, 0.7, 1.0, 1.4, 2.0];

export class UI {
  private readonly hint = el('hint');
  private readonly coords = el('coords');
  private readonly fps = el('fps');
  private readonly ptsOut = el('pts');
  private readonly pillSnap = el('pill-snap');
  private readonly pillOrtho = el('pill-ortho');
  private readonly pillWeight = el('pill-weight');
  private readonly layersPanel = el('layers-panel');
  private readonly layersList = el('layers-list');
  private readonly marquee = el('marquee');
  private readonly sectionPanel = el('section-panel');
  private readonly sectionVal = el('section-val');
  private readonly lblMain = el('lbl-main');
  private readonly ucsSelect = el<HTMLSelectElement>('ucs-select');
  private readonly layerSelect = el<HTMLSelectElement>('layer-select');
  private readonly dynInput = el('dyn-input');
  private readonly fileInput = el<HTMLInputElement>('import-file');
  private toolButtons: HTMLButtonElement[] = [];
  private ribbon: RibbonGroup[] = loadRibbonLayout();
  private ribbonEdit = false;
  private activeToolId = '';
  private dragId: string | null = null;
  /** Once the user drags the layers panel, stop auto-placing it. */
  private layersMoved = false;
  /** The guide DOM is built on first open, not at startup. */
  private helpFilled = false;

  constructor(private readonly handlers: UIHandlers) {
    this.renderRibbon();
    this.bindRibbon();
    addSliderArrows();
    el('btn-ribbon-edit').addEventListener('click', () => this.setRibbonEdit(!this.ribbonEdit));
    this.pillSnap.addEventListener('click', () => handlers.onToggleSnap());
    this.pillOrtho.addEventListener('click', () => handlers.onToggleOrtho());
    const range = el<HTMLInputElement>('section-depth');
    range.addEventListener('input', () => handlers.onSectionDepth(parseFloat(range.value)));
    el('profile-mode').addEventListener('click', () => handlers.onToggleProfileMode());
    const pwin = el<HTMLInputElement>('profile-window');
    pwin.addEventListener('input', () => handlers.onProfileWindow(parseFloat(pwin.value)));
    // Plan slice strip (lasso → level → UCS). Slider for feel, number box
    // for an exact elevation — a cut at "1.50" is a decision, not a drag.
    el('plan-slice-pill').addEventListener('click', () => handlers.onPlanSliceToggle());
    const planLevel = el<HTMLInputElement>('plan-level');
    planLevel.addEventListener('input', () => handlers.onPlanSliceLevel(parseFloat(planLevel.value)));
    const planThick = el<HTMLInputElement>('plan-thick');
    planThick.addEventListener('input', () => handlers.onPlanSliceThick(parseFloat(planThick.value)));
    const commit = (input: HTMLInputElement, fn: (v: number) => void) => {
      const apply = () => {
        const v = parseFloat(input.value.replace(',', '.'));
        if (isFinite(v)) fn(v);
      };
      input.addEventListener('change', apply);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          apply();
          input.blur();
        }
      });
    };
    commit(el<HTMLInputElement>('plan-level-val'), (v) => handlers.onPlanSliceLevel(v));
    commit(el<HTMLInputElement>('plan-thick-val'), (v) => handlers.onPlanSliceThick(v));
    // Facade slice: главный орган управления — оси в окне сечения, панель
    // оставляет только точные числа границ в мм. Границы толкают друг
    // друга, а не перескакивают: ползёшь одной — вторая уступает.
    el('slice-pill').addEventListener('click', () => handlers.onToggleFacadeSlice());
    const sliceLoNum = el<HTMLInputElement>('slice-lo-val');
    const sliceHiNum = el<HTMLInputElement>('slice-hi-val');
    const sliceSend = (from: 'lo' | 'hi') => {
      let a = parseFloat(sliceLoNum.value.replace(',', '.')); // мм
      let b = parseFloat(sliceHiNum.value.replace(',', '.'));
      if (!isFinite(a) || !isFinite(b)) return;
      if (a > b) {
        if (from === 'lo') b = a;
        else a = b;
      }
      handlers.onFacadeSliceRange(a / 1000, b / 1000);
    };
    commit(sliceLoNum, () => sliceSend('lo'));
    commit(sliceHiNum, () => sliceSend('hi'));
    el('btn-plan-done').addEventListener('click', (e) => {
      (e.currentTarget as HTMLElement).blur(); // see the ribbon click handler
      handlers.onPlanSliceDone();
    });
    const area = el<HTMLInputElement>('cursor-area');
    area.addEventListener('input', () => {
      const v = parseFloat(area.value);
      el('cursor-area-val').textContent = `${v.toFixed(1)} м`;
      handlers.onCursorArea(v);
    });
    this.ucsSelect.addEventListener('change', () => handlers.onUcsSelect(this.ucsSelect.selectedIndex));
    this.layerSelect.addEventListener('change', () => handlers.onLayerCombo(this.layerSelect.value));
    for (const name of ['main', 'profile', 'iso'] as const) {
      el(`eye-${name}`).addEventListener('click', () => handlers.onToggleLayer(name));
      el(`gear-${name}`).addEventListener('click', () => handlers.onOpenCloudPanel(name));
      el(`cloudeye-${name}`).addEventListener('click', () => handlers.onToggleCloud(name));
    }
    this.fileInput.addEventListener('change', () => {
      const fs = Array.from(this.fileInput.files ?? []);
      if (fs.length) handlers.onImportFiles(fs);
      this.fileInput.value = '';
    });
    el('btn-ucs-rename').addEventListener('click', () => handlers.onRenameUcs());
    // Cloud display panel: sliders forward to the viewport it was opened for.
    const bind = (id: string, key: 'size' | 'opacity' | 'density' | 'mode') => {
      const input = el<HTMLInputElement | HTMLSelectElement>(id);
      input.addEventListener('input', () => {
        if (this.cloudPanelFor) handlers.onCloudSetting(this.cloudPanelFor, key, parseFloat(input.value));
      });
    };
    bind('cp-size', 'size');
    bind('cp-opacity', 'opacity');
    bind('cp-density', 'density');
    bind('cp-mode', 'mode');
    el('cloud-panel-close').addEventListener('click', () => this.closeCloudPanel());
    el('btn-start-import').addEventListener('click', () => this.fileInput.click());
    el('btn-start-demo').addEventListener('click', () => handlers.onDemoStart());
    // Layers panel
    el('layers-close').addEventListener('click', () => this.toggleLayersPanel(false));
    this.bindLayersDrag();
    // The status-bar swatch is the second door into the layers panel.
    el('layer-swatch').addEventListener('click', () => this.toggleLayersPanel());
    el('btn-layer-add').addEventListener('click', () => handlers.onLayerAdd());
    el('btn-layer-assign').addEventListener('click', () => handlers.onAssignToLayer());
    this.pillWeight.addEventListener('click', () => handlers.onToggleWeightDisplay());
    el('help-close').addEventListener('click', () => this.toggleHelp(false));
    el('btn-start-help').addEventListener('click', () => this.toggleHelp(true));
    this.setUcsList([], -1);
  }

  // ---------------------------------------------------------------- ribbon

  /** Rebuild the ribbon DOM from the layout model. Cheap (a few dozen
   *  nodes) and safe: all events are delegated, nothing to re-bind. */
  private renderRibbon(): void {
    const host = el('ribbon-groups');
    host.innerHTML = '';
    this.ribbon.forEach((g, gi) => {
      if (gi > 0) {
        const sep = document.createElement('div');
        sep.className = 'rib-sep';
        host.appendChild(sep);
      }
      const grp = document.createElement('div');
      grp.className = 'rib-group';
      grp.dataset.gi = String(gi);

      const tools = document.createElement('div');
      tools.className = 'rib-tools';
      for (const id of g.buttons) {
        const def = RIBBON_BUTTON_MAP.get(id);
        if (!def) continue;
        const b = document.createElement('button');
        b.className = 'tool-btn';
        b.dataset.btnId = def.id;
        if (def.tool) b.dataset.tool = def.tool;
        if (def.action) b.dataset.action = def.action;
        if (def.domId) b.id = def.domId;
        // Имя команды ушло из-под значка в подсказку: подпись стоила 7 px
        // кегля (не читалась) и трети ширины ленты. Ставим её первой строкой,
        // чтобы при наведении сначала читалось «что это», а потом «зачем».
        b.title = def.label === def.title ? def.label : `${def.label} — ${def.title}`;
        b.draggable = this.ribbonEdit;
        // .fx — слой вращающейся кромки активного инструмента (см. style.css).
        b.innerHTML = `<span class="fx"></span><svg viewBox="0 0 24 24">${def.icon}</svg>`;
        tools.appendChild(b);
      }
      grp.appendChild(tools);

      const title = document.createElement('div');
      title.className = 'rib-title';
      title.textContent = g.title;
      if (this.ribbonEdit) {
        title.title = 'Двойной клик — переименовать панель';
        if (!g.buttons.length) {
          const del = document.createElement('span');
          del.className = 'rib-del';
          del.textContent = ' ✕';
          del.title = 'Удалить пустую панель';
          del.addEventListener('click', () => {
            this.ribbon.splice(gi, 1);
            this.ribbonLayoutChanged();
          });
          title.appendChild(del);
        }
        title.addEventListener('dblclick', () => {
          const name = window.prompt('Название панели:', g.title);
          if (name && name.trim()) {
            g.title = name.trim();
            this.ribbonLayoutChanged();
          }
        });
      }
      grp.appendChild(title);
      host.appendChild(grp);
    });

    if (this.ribbonEdit) {
      const ctl = document.createElement('div');
      ctl.className = 'rib-edit-controls';
      const mk = (label: string, title: string, fn: () => void) => {
        const b = document.createElement('button');
        b.className = 'mini-btn';
        b.textContent = label;
        b.title = title;
        b.addEventListener('click', fn);
        ctl.appendChild(b);
      };
      mk('+ Панель', 'Добавить пустую панель', () => {
        const name = window.prompt('Название панели:', `Панель ${this.ribbon.length + 1}`);
        if (name && name.trim()) {
          this.ribbon.push({ title: name.trim(), buttons: [] });
          this.ribbonLayoutChanged();
        }
      });
      mk('Сброс', 'Вернуть раскладку по умолчанию', () => {
        this.ribbon = resetRibbonLayout();
        this.renderRibbon();
      });
      mk('Готово', 'Выйти из настройки ленты', () => this.setRibbonEdit(false));
      host.appendChild(ctl);
    }

    el('ribbon').dataset.edit = String(this.ribbonEdit);
    this.toolButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-tool]'));
    this.setActiveTool(this.activeToolId);
    this.publishRibbonHeight();
  }

  /**
   * Пересчитать высоту ленты. Нужен всякому, кто добавляет или убирает в ней
   * содержимое: контекстные настройки инструментов могут перенести ленту на
   * лишний ряд, и окна обязаны съехать вместе с ней.
   */
  refreshRibbonHeight(): void {
    this.publishRibbonHeight();
  }

  /** The ribbon wraps to as many rows as it needs, so everything docked
   *  under it — CSS overlays through the variable, the viewports through
   *  the handler — reads its real height from here. */
  private publishRibbonHeight(): void {
    requestAnimationFrame(() => {
      const h = Math.round(el('ribbon').getBoundingClientRect().height);
      document.documentElement.style.setProperty('--ribbon-h', `${h}px`);
      this.handlers.onRibbonHeight(h);
    });
  }

  private ribbonLayoutChanged(): void {
    saveRibbonLayout(this.ribbon);
    this.renderRibbon();
  }

  /** One delegated listener set for clicks and drag & drop. */
  private bindRibbon(): void {
    const host = el('ribbon-groups');

    host.addEventListener('click', (e) => {
      if (this.ribbonEdit) return; // edit mode: dragging, not commanding
      const btn = (e.target as HTMLElement).closest<HTMLElement>('.tool-btn');
      if (!btn) return;
      // Drop focus: a focused ribbon button re-fires on Enter and Space,
      // and in CAD both of those mean "finish the current command".
      btn.blur();
      if (btn.dataset.tool) this.handlers.onTool(btn.dataset.tool);
      else if (btn.dataset.action) this.runAction(btn.dataset.action);
    });

    host.addEventListener('dragstart', (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>('.tool-btn');
      if (!this.ribbonEdit || !btn) return;
      this.dragId = btn.dataset.btnId ?? null;
      btn.classList.add('dragging');
      e.dataTransfer?.setData('text/plain', this.dragId ?? '');
      if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
    });
    host.addEventListener('dragover', (e) => {
      if (!this.ribbonEdit || !this.dragId) return;
      const grp = (e.target as HTMLElement).closest<HTMLElement>('.rib-group');
      if (!grp) return;
      e.preventDefault();
      for (const g of host.querySelectorAll('.rib-group')) g.classList.toggle('drop-target', g === grp);
    });
    host.addEventListener('drop', (e) => {
      if (!this.ribbonEdit || !this.dragId) return;
      const grp = (e.target as HTMLElement).closest<HTMLElement>('.rib-group');
      if (!grp) return;
      e.preventDefault();
      const id = this.dragId;
      this.dragId = null;
      const gi = Number(grp.dataset.gi);
      const from = this.ribbon.find((g) => g.buttons.includes(id));
      const to = this.ribbon[gi];
      if (!from || !to) return;
      from.buttons.splice(from.buttons.indexOf(id), 1);
      // Insert before the hovered button, else append to the panel.
      const overBtn = (e.target as HTMLElement).closest<HTMLElement>('.tool-btn');
      const overId = overBtn?.dataset.btnId;
      const at = overId && overId !== id ? to.buttons.indexOf(overId) : -1;
      if (at >= 0) to.buttons.splice(at, 0, id);
      else to.buttons.push(id);
      this.ribbonLayoutChanged();
    });
    host.addEventListener('dragend', () => {
      this.dragId = null;
      for (const g of host.querySelectorAll('.rib-group')) g.classList.remove('drop-target');
      for (const b of host.querySelectorAll('.tool-btn.dragging')) b.classList.remove('dragging');
    });
  }

  private setRibbonEdit(on: boolean): void {
    this.ribbonEdit = on;
    el('btn-ribbon-edit').dataset.on = String(on);
    this.renderRibbon();
    this.setHint(on ? 'НАСТРОЙКА ЛЕНТЫ — перетаскивайте кнопки между панелями · двойной клик по названию переименует панель · ⚙ или «Готово» для выхода' : '');
  }

  /** Route a non-tool ribbon action to its handler. */
  private runAction(action: string): void {
    switch (action) {
      case 'erase':
        this.handlers.onErase();
        break;
      case 'undo':
        this.handlers.onUndo();
        break;
      case 'redo':
        this.handlers.onRedo();
        break;
      case 'layers':
        this.toggleLayersPanel();
        break;
      case 'help':
        this.toggleHelp();
        break;
      case 'import':
        this.fileInput.click();
        break;
      case 'dxf':
        this.handlers.onExportDxf();
        break;
      case 'tocad':
        this.handlers.onToCad();
        break;
    }
  }

  // ------------------------------------------------------------------ help

  /** The guide is rendered from the very markdown file that ships in the
   *  repository, so the in-app help and the docs can never drift apart. */
  toggleHelp(show?: boolean): void {
    const panel = el('help-panel');
    const on = show ?? panel.classList.contains('hidden');
    if (on && !this.helpFilled) {
      el('help-body').innerHTML = GUIDE_HTML;
      this.helpFilled = true;
    }
    panel.classList.toggle('hidden', !on);
    panel.classList.toggle('flex', on);
    const btn = document.getElementById('btn-help');
    if (btn) btn.dataset.active = String(on);
  }

  get helpOpen(): boolean {
    return !el('help-panel').classList.contains('hidden');
  }

  // ---------------------------------------------------------------- layers

  toggleLayersPanel(show?: boolean): void {
    const on = show ?? this.layersPanel.classList.contains('hidden');
    this.layersPanel.classList.toggle('hidden', !on);
    this.layersPanel.classList.toggle('flex', on);
    // Flag the ribbon button so the panel never feels "lost" when open.
    const btn = document.getElementById('btn-layers');
    if (btn) btn.dataset.active = String(on);
    // Open under the button that summoned it (unless the user dragged the
    // panel somewhere himself — then keep his placement).
    if (on && !this.layersMoved && btn) {
      const r = btn.getBoundingClientRect();
      this.layersPanel.style.left = `${Math.max(8, r.left - 40)}px`;
      this.layersPanel.style.right = 'auto';
      this.layersPanel.style.top = `${r.bottom + 14}px`;
    }
  }

  /** Drag the layers panel by its header — it is the one panel users keep
   *  open while drafting, so it must get out of the way. */
  private bindLayersDrag(): void {
    const header = el('layers-header');
    let dx = 0;
    let dy = 0;
    const move = (e: PointerEvent) => {
      this.layersPanel.style.left = `${Math.max(4, Math.min(window.innerWidth - 60, e.clientX - dx))}px`;
      this.layersPanel.style.top = `${Math.max(4, Math.min(window.innerHeight - 40, e.clientY - dy))}px`;
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    header.addEventListener('pointerdown', (e) => {
      if ((e.target as HTMLElement).id === 'layers-close') return;
      const r = this.layersPanel.getBoundingClientRect();
      dx = e.clientX - r.left;
      dy = e.clientY - r.top;
      this.layersPanel.style.right = 'auto';
      this.layersMoved = true;
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      e.preventDefault();
    });
  }

  /** Rebuild the layers panel rows (a handful of rows — DOM churn is fine). */
  renderLayers(rows: readonly LayerRowVM[]): void {
    this.layersList.innerHTML = '';
    for (const r of rows) {
      const row = document.createElement('div');
      row.className = 'layer-row';
      row.dataset.current = String(r.current);

      const cur = document.createElement('button');
      cur.className = 'lr-cur';
      cur.title = 'Сделать текущим';
      cur.addEventListener('click', () => this.handlers.onLayerCurrent(r.name));
      row.appendChild(cur);

      const color = document.createElement('input');
      color.type = 'color';
      color.className = 'lr-color';
      color.value = r.color;
      color.title = 'Цвет слоя';
      color.addEventListener('input', () => this.handlers.onLayerColor(r.name, color.value));
      row.appendChild(color);

      const name = document.createElement('span');
      name.className = 'lr-name';
      name.textContent = r.name;
      name.title = 'Двойной клик — переименовать';
      name.addEventListener('dblclick', () => this.handlers.onLayerRename(r.name));
      row.appendChild(name);

      const type = document.createElement('select');
      type.className = 'lr-select';
      type.title = 'Тип линии';
      for (const [v, label] of LINETYPES) {
        const o = document.createElement('option');
        o.value = v;
        o.textContent = label;
        o.selected = v === r.linetype;
        type.appendChild(o);
      }
      type.addEventListener('change', () => this.handlers.onLayerType(r.name, type.value));
      row.appendChild(type);

      const weight = document.createElement('select');
      weight.className = 'lr-select lr-weight';
      weight.title = 'Толщина линии, мм';
      for (const w of WEIGHT_STEPS) {
        const o = document.createElement('option');
        o.value = String(w);
        o.textContent = w.toFixed(2);
        o.selected = Math.abs(w - r.weight) < 1e-6;
        weight.appendChild(o);
      }
      weight.addEventListener('change', () => this.handlers.onLayerWeight(r.name, parseFloat(weight.value)));
      row.appendChild(weight);

      const count = document.createElement('span');
      count.className = 'lr-count';
      count.textContent = String(r.count);
      count.title = `Объектов на слое: ${r.count}`;
      row.appendChild(count);

      const eye = document.createElement('button');
      eye.className = 'lr-eye';
      eye.dataset.on = String(r.visible);
      eye.title = r.visible ? 'Скрыть слой' : 'Показать слой';
      eye.textContent = r.visible ? '👁' : '—';
      eye.addEventListener('click', () => this.handlers.onLayerToggleVisible(r.name));
      row.appendChild(eye);

      const del = document.createElement('button');
      del.className = 'lr-del';
      del.title = r.name === '0' ? 'Слой «0» удалить нельзя' : 'Удалить слой (объекты уйдут на слой «0»)';
      del.textContent = '✕';
      del.disabled = r.name === '0';
      del.addEventListener('click', () => this.handlers.onLayerDelete(r.name));
      row.appendChild(del);

      this.layersList.appendChild(row);
    }
  }

  setWeightPill(on: boolean): void {
    this.pillWeight.dataset.on = String(on);
  }

  /** Status-bar layer combo. `selected` is the layer to display: the
   *  selection's layer when something is picked (null = mixed), else the
   *  current layer. `hasSelection` switches the combo into "move" mode. */
  setLayerCombo(names: readonly string[], selected: string | null, hasSelection: boolean, color: string): void {
    this.layerSelect.innerHTML = '';
    if (hasSelection && selected === null) {
      const mixed = document.createElement('option');
      mixed.value = '';
      mixed.textContent = '— разные —';
      this.layerSelect.appendChild(mixed);
    }
    for (const n of names) {
      const o = document.createElement('option');
      o.value = n;
      o.textContent = n;
      this.layerSelect.appendChild(o);
    }
    this.layerSelect.value = selected ?? '';
    this.layerSelect.dataset.selection = String(hasSelection);
    this.layerSelect.title = hasSelection ? 'Перенести выбранные объекты на слой (цвет и тип линии возьмутся от слоя)' : 'Текущий слой — на нём появляются новые объекты';
    el('layer-swatch').style.background = color;
  }

  private cloudPanelFor: 'main' | 'profile' | 'iso' | null = null;

  /** Startup overlay: import-first flow. */
  showStart(on: boolean): void {
    el('start-overlay').classList.toggle('hidden', !on);
  }

  /** Import progress ("Загрузка… 42%"); null hides the counter. */
  setProgress(text: string | null): void {
    const p = el('start-progress');
    if (text === null) {
      p.classList.add('hidden');
      return;
    }
    p.textContent = text;
    p.classList.remove('hidden');
    this.setHint(text);
  }

  openCloudPanel(name: 'main' | 'profile' | 'iso', s: CloudSettingsLike): void {
    if (this.cloudPanelFor === name) {
      this.closeCloudPanel();
      return;
    }
    this.cloudPanelFor = name;
    el<HTMLInputElement>('cp-size').value = String(s.size);
    el<HTMLInputElement>('cp-opacity').value = String(s.opacity);
    el<HTMLInputElement>('cp-density').value = String(s.density);
    el<HTMLSelectElement>('cp-mode').value = String(s.mode);
    const titles = { main: 'ОБЛАКО · ГЛАВНОЕ', profile: 'ОБЛАКО · ПРОФИЛЬ', iso: 'ОБЛАКО · 3D' } as const;
    el('cloud-panel-title').textContent = titles[name];
    const panel = el('cloud-panel');
    panel.classList.remove('hidden');
    panel.classList.add('flex');
    const r = el(`gear-${name}`).getBoundingClientRect();
    panel.style.left = `${Math.max(8, Math.min(r.right, window.innerWidth - 8) - panel.offsetWidth)}px`;
    panel.style.top = name === 'iso' ? `${r.top - panel.offsetHeight - 8}px` : `${r.bottom + 8}px`;
  }

  closeCloudPanel(): void {
    this.cloudPanelFor = null;
    const panel = el('cloud-panel');
    panel.classList.add('hidden');
    panel.classList.remove('flex');
  }

  /** Reflect the per-viewport linework toggle on its eye button. */
  setLayerVisible(name: 'main' | 'profile' | 'iso', on: boolean): void {
    el(`eye-${name}`).dataset.on = String(on);
  }

  setCloudVisible(name: 'main' | 'profile' | 'iso', on: boolean): void {
    el(`cloudeye-${name}`).dataset.on = String(on);
  }

  setActiveTool(id: string): void {
    this.activeToolId = id; // survives ribbon re-renders
    for (const b of this.toolButtons) b.dataset.active = String(b.dataset.tool === id);
  }

  setSnap(on: boolean): void {
    this.pillSnap.dataset.on = String(on);
  }

  setOrtho(on: boolean): void {
    this.pillOrtho.dataset.on = String(on);
  }

  /** Populate the UCS dropdown; an empty list shows the world CS stub. */
  setUcsList(names: readonly string[], active: number): void {
    this.ucsSelect.innerHTML = '';
    if (!names.length) {
      const opt = document.createElement('option');
      opt.textContent = 'МСК';
      this.ucsSelect.appendChild(opt);
      this.ucsSelect.disabled = true;
      return;
    }
    this.ucsSelect.disabled = false;
    for (const n of names) {
      const opt = document.createElement('option');
      opt.textContent = n;
      this.ucsSelect.appendChild(opt);
    }
    this.ucsSelect.selectedIndex = Math.max(0, active);
  }

  setHint(text: string): void {
    this.hint.textContent = text;
  }

  /** Two-argument form = UCS-local drafting coordinates; the third argument
   *  switches the readout to the scan's own survey coordinates (МСК). */
  setCoords(x: number, y: number, h?: number): void {
    this.coords.textContent = h === undefined ? `X ${x.toFixed(3)}  Y ${y.toFixed(3)}` : `E ${x.toFixed(3)}  N ${y.toFixed(3)}  H ${h.toFixed(3)}`;
  }

  /** FPS plus how many cloud points the drafting pane actually submitted —
   *  the tiling is invisible otherwise, and this is how you see it work. */
  setFps(v: number, pts = -1): void {
    this.fps.textContent = String(v);
    if (pts >= 0) this.ptsOut.textContent = pts >= 1000 ? `${Math.round(pts / 1000)}k` : String(pts);
  }

  /** Ring around the pane that owns the commands (see Engine.activePane). */
  setActivePane(name: string, css: { x: number; y: number; w: number; h: number }): void {
    const ring = el('pane-focus');
    ring.style.left = `${css.x + 1}px`;
    ring.style.top = `${css.y + 1}px`;
    ring.style.width = `${Math.max(0, css.w - 2)}px`;
    ring.style.height = `${Math.max(0, css.h - 2)}px`;
    ring.dataset.pane = name;
    // Light up the matching pane label too — the ring alone was easy to miss.
    const labels: Record<string, string> = { main: 'lbl-main', profile: 'lbl-profile', iso: 'lbl-iso' };
    for (const [pane, id] of Object.entries(labels)) {
      const lbl = document.getElementById(id);
      if (lbl) lbl.dataset.active = String(pane === name);
    }
  }

  setMainLabel(text: string): void {
    this.lblMain.textContent = text;
  }

  setProfileLabel(text: string): void {
    el('lbl-profile').textContent = text;
  }

  /** Profile cut orientation pill (true = vertical cut). */
  setProfileMode(vertical: boolean): void {
    const pill = el('profile-mode');
    pill.textContent = vertical ? 'ВЕРТ' : 'ГОРИЗ';
    pill.dataset.on = 'true';
  }

  setProfileWindow(v: number): void {
    el<HTMLInputElement>('profile-window').value = String(v);
    el('profile-window-val').textContent = `${v.toFixed(1)} м`;
  }

  showSectionPanel(on: boolean): void {
    this.sectionPanel.classList.toggle('hidden', !on);
    this.sectionPanel.classList.toggle('flex', on);
    const cur = el('cursor-panel'); // appears together with the UCS panels
    cur.classList.toggle('hidden', !on);
    cur.classList.toggle('flex', on);
    const slice = el('slice-panel'); // facade depth slice lives with them
    slice.classList.toggle('hidden', !on);
    slice.classList.toggle('flex', on);
  }

  // ---------------------------------------------------------- plan slice

  /** The level slider spans exactly the height of the isolated wall. */
  setPlanSliceRange(min: number, max: number): void {
    const s = el<HTMLInputElement>('plan-level');
    const lo = Math.floor(min * 100) / 100;
    const hi = Math.ceil(max * 100) / 100;
    s.min = String(lo);
    s.max = String(hi);
    s.step = String(Math.max(0.01, (hi - lo) / 500));
  }

  setPlanSlice(on: boolean, level: number, thick: number): void {
    el('plan-slice-pill').dataset.on = String(on);
    el<HTMLInputElement>('plan-level').value = String(level);
    el<HTMLInputElement>('plan-thick').value = String(thick);
    // Never fight the user's typing: skip the box that currently has focus.
    const lvl = el<HTMLInputElement>('plan-level-val');
    if (document.activeElement !== lvl) lvl.value = level.toFixed(2);
    const th = el<HTMLInputElement>('plan-thick-val');
    if (document.activeElement !== th) th.value = thick.toFixed(2);
    el('plan-range').textContent = `${(level - thick / 2).toFixed(2)}…${(level + thick / 2).toFixed(2)}`;
  }

  showPlanSlicePanel(on: boolean): void {
    const p = el('plan-slice-panel');
    p.classList.toggle('hidden', !on);
    p.classList.toggle('flex', on);
  }

  // ------------------------------------------------------ elevation aids

  showElevationAids(on: boolean): void {
    el('elev-scale').classList.toggle('hidden', !on);
    if (!on) el('elev-cursor').classList.add('hidden');
  }

  /** Metre scale of the side view: ticks are pre-projected by the Engine
   *  (it owns the camera), the UI only paints them. */
  renderElevationScale(ticks: readonly { y: number; label: string; major: boolean }[]): void {
    const host = el('elev-scale');
    host.innerHTML = '';
    for (const t of ticks) {
      const row = document.createElement('div');
      row.className = 'elev-tick';
      row.dataset.major = String(t.major);
      row.style.top = `${t.y}px`;
      const span = document.createElement('span');
      span.textContent = t.label;
      row.appendChild(span);
      host.appendChild(row);
    }
  }

  /** Guide line at the cursor height, with the elevation spelled out. */
  setElevationCursor(clientY: number | null, label: string, left: number, width: number): void {
    const line = el('elev-cursor');
    if (clientY === null) {
      line.classList.add('hidden');
      return;
    }
    line.classList.remove('hidden');
    line.style.top = `${clientY}px`;
    line.style.left = `${left}px`;
    line.style.width = `${width}px`;
    el('elev-cursor-val').textContent = label;
  }

  /** Raw coordinate readout (the side view speaks elevations, not X/Y). */
  setCoordsText(text: string): void {
    this.coords.textContent = text;
  }

  /** Facade slice widgets: pill + числа границ (мм) + толщина. */
  setFacadeSlice(on: boolean, lo: number, hi: number): void {
    el('slice-pill').dataset.on = String(on);
    const mmLo = Math.round(lo * 1000);
    const mmHi = Math.round(hi * 1000);
    el<HTMLInputElement>('slice-lo-val').value = String(mmLo);
    el<HTMLInputElement>('slice-hi-val').value = String(mmHi);
    el('slice-val').textContent = `Т ${Math.max(0, mmHi - mmLo)} мм`;
  }

  /** Мерная сетка глубины окна 2: горизонтальная лента по низу окна (ВЕРТ)
   *  или вертикальная по правому краю (ГОРИЗ), подписи — мм от плоскости
   *  ПСК. Движок проецирует, UI только красит. */
  renderDepthRuler(
    ticks: readonly { p: number; label: string; major: boolean }[],
    horizontal: boolean,
    rect: { x: number; y: number; w: number; h: number },
  ): void {
    const host = el('depth-ruler');
    host.classList.remove('hidden');
    host.dataset.horizontal = String(horizontal);
    const s = host.style;
    if (horizontal) {
      s.left = `${rect.x}px`;
      s.top = `${rect.y + rect.h - 22}px`;
      s.width = `${rect.w}px`;
      s.height = '22px';
    } else {
      s.left = `${rect.x + rect.w - 46}px`;
      s.top = `${rect.y}px`;
      s.width = '46px';
      s.height = `${rect.h}px`;
    }
    host.innerHTML = '';
    for (const t of ticks) {
      const tick = document.createElement('div');
      tick.className = 'dr-tick';
      tick.dataset.major = String(t.major);
      if (horizontal) tick.style.left = `${t.p}px`;
      else tick.style.top = `${t.p}px`;
      const span = document.createElement('span');
      span.textContent = t.label;
      tick.appendChild(span);
      host.appendChild(tick);
    }
  }

  hideDepthRuler(): void {
    el('depth-ruler').classList.add('hidden');
  }

  setSectionValue(v: number): void {
    this.sectionVal.textContent = `${v.toFixed(2)} м`;
  }

  showMarquee(x: number, y: number, w: number, h: number, crossing: boolean): void {
    const s = this.marquee.style;
    s.left = `${x}px`;
    s.top = `${y}px`;
    s.width = `${w}px`;
    s.height = `${h}px`;
    this.marquee.dataset.crossing = String(crossing);
    this.marquee.classList.remove('hidden');
  }

  hideMarquee(): void {
    this.marquee.classList.add('hidden');
  }

  /** Dynamic-input readout floating next to the cursor. */
  showDynInput(x: number, y: number, text: string, suffix: string): void {
    this.dynInput.textContent = suffix ? `${text} ${suffix}` : text;
    const s = this.dynInput.style;
    s.left = `${x}px`;
    s.top = `${y}px`;
    this.dynInput.classList.remove('hidden');
  }

  hideDynInput(): void {
    this.dynInput.classList.add('hidden');
  }
}
