/**
 * Инструмент «Проёмы» — полуавтоматическая обводка окон и дверей.
 *
 * Модуль отделён от ядра намеренно: считает он в openings.ts (чистая функция,
 * которую можно унести на сервер), панелью управляет сам, в ленте живёт одной
 * кнопкой. Чтобы выключить модуль, достаточно не регистрировать инструмент —
 * ядро о нём не знает ничего.
 *
 * Сценарий. Инструмент включается после ПСК, когда стена уже выделена лассо.
 * Сразу показывает НАЙДЕННОЕ призраками — принимать их надо руками:
 *
 *   клик по призраку   — убрать лишнее (фура у стены выглядит как проём);
 *   клик в пустоту     — добавить пропущенный проём под курсором;
 *   ползунки           — пересчёт на лету;
 *   Enter              — обвести принятое;
 *   Esc                — уйти, ничего не начертив.
 *
 * Автомат никогда не будет прав всегда, поэтому подтверждение не «лишний шаг»,
 * а суть: человек отвечает за чертёж, машина экономит ему часы обводки.
 */
import * as THREE from 'three';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';

import { CadTool, DraftPointer, ToolHost, ToolManager } from '../CADTools';
import { PolylineEntity } from '../Entities';
import { token } from '../theme';
import {
  buildWallGrid,
  Consensus,
  consensusOf,
  DEFAULT_PARAMS,
  findOpenings,
  Grade,
  lastRejected,
  OpeningParams,
  OpeningRect,
  openingAt,
  snapToConsensus,
  WallGrid,
} from './openings';

const PANEL = 'openings-panel';

/** Захват при перетаскивании: за что взялись и где были края в тот момент. */
interface Grab {
  /** 'l' | 'r' | 'b' | 't' и их углы ('lb', 'rt', …), либо 'move'. */
  part: string;
  px: number;
  py: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export class OpeningsTool extends CadTool {
  readonly id = 'openings';
  readonly hint =
    'ПРОЁМЫ — клик по рамке убирает лишнее, клик в пустой проём добавляет его · ползунки пересчитывают · Enter обвести · Esc отмена';

  private readonly params: OpeningParams = { ...DEFAULT_PARAMS };
  private rects: OpeningRect[] = [];
  /** Выбранная рамка (индекс) и захват при перетаскивании. */
  private sel = -1;
  private grab: Grab | null = null;
  /** Срез стены держим между пересчётами: сбор точек дороже самого поиска. */
  private wall: { xy: Float32Array; n: number } | null = null;
  /** Сетка с метками областей — пересобирается только при смене ячейки. */
  private grid: WallGrid | null = null;
  private gridCell = -1;
  /** Что ищем: дырки (проёмы) или острова точек (рельеф) — см. openings.ts.
   *  Живёт между включениями: выбор «я обмеряю лепнину» — не настройка на раз. */
  private mode: 'holes' | 'islands' = 'holes';
  /** Ограничение поиска куском фасада (оси ПСК); null — весь фасад. */
  private region: { x0: number; y0: number; x1: number; y1: number } | null = null;
  /** Взведено кнопкой ОБЛАСТЬ: следующая протяжка рисует прямоугольник. */
  private regionArm = false;
  /** Взведена ПИПЕТКА: клики в окне 1 берут образцы цвета, а не рамки. */
  private pipetteArm = false;
  private regionDrag: { x: number; y: number } | null = null;
  private regionPreview: { x0: number; y0: number; x1: number; y1: number } | null = null;
  /** Кэш точек внутри области: фильтр стоит прохода по срезу, а сетка и так
   *  пересобирается реже, чем двигаются ползунки. */
  private cut: { xy: Float32Array; n: number } | null = null;
  /** Габарит всего среза — «ВЕСЬ ФАСАД» возвращает кадр без прохода по точкам. */
  private wallBounds: { x0: number; y0: number; x1: number; y1: number } | null = null;

  /**
   * Рамки рисуются ДВУМЯ наборами: обычным и утолщённым.
   *
   * Толщина линии в WebGL не задаётся на вершину — только на материал.
   * Поэтому «сомнительные чуть жирнее» это не свойство рамки, а отдельный
   * объект со своим материалом; какой рамке в каком быть, решает её оценка.
   */
  private readonly thin: LineSegments2;
  private readonly thick: LineSegments2;
  private readonly thinMat: LineMaterial;
  private readonly thickMat: LineMaterial;
  /** Рамка области поиска — акцентная, одна: это разметка, а не кандидат. */
  private readonly regionObj: LineSegments2;
  private readonly regionMat: LineMaterial;
  private readonly onSlider = () => this.readPanel(true);
  private readonly onModeBtn = () => this.toggleMode();
  private readonly onRegionBtn = () => this.armRegion();
  private readonly onRegionClearBtn = () => this.clearRegion();
  private readonly onPickBtn = () => this.togglePipette();
  private readonly onColorCtl = () => this.readColorPanel();
  private readonly onChipClick = () => this.clearSamples();

  /** Цвета качества — те же токены темы, что и везде в приложении. */
  private readonly gradeColor: Record<Grade, THREE.Color> = {
    good: new THREE.Color(token('--ok', 0x2deb8c)),
    fair: new THREE.Color(token('--accent-2', 0xffb03c)),
    poor: new THREE.Color(token('--bad', 0xf87171)),
  };

  constructor(host: ToolHost, mgr: ToolManager) {
    super(host, mgr);
    const make = (width: number): [LineSegments2, LineMaterial] => {
      const mat = new LineMaterial({
        vertexColors: true,
        linewidth: width,
        transparent: true,
        opacity: 0.95,
        depthTest: false,
      });
      const obj = new LineSegments2(new LineSegmentsGeometry(), mat);
      obj.renderOrder = 2;
      obj.frustumCulled = false;
      obj.layers.set(3); // как остальной чертёж — гасится глазом окна
      obj.visible = false;
      host.ucs.group.add(obj);
      return [obj, mat];
    };
    // 3.4 против 1.8 px: заметно, но не кричит. Жирная рамка здесь означает
    // «сюда посмотри», а не «ошибка».
    [this.thin, this.thinMat] = make(1.8);
    [this.thick, this.thickMat] = make(3.4);

    // Область поиска. Цвет один на весь прямоугольник, поэтому без
    // vertexColors — обычный uniform-цвет темы.
    this.regionMat = new LineMaterial({
      color: token('--accent', 0x66a8ff),
      linewidth: 2.2,
      transparent: true,
      opacity: 0.85,
      depthTest: false,
    });
    this.regionObj = new LineSegments2(new LineSegmentsGeometry(), this.regionMat);
    this.regionObj.renderOrder = 2;
    this.regionObj.frustumCulled = false;
    this.regionObj.layers.set(3);
    this.regionObj.visible = false;
    host.ucs.group.add(this.regionObj);
  }

  /**
   * Ширина линии Line2 считается от размера кадра, а окна разного размера —
   * без этого рамки худеют в маленьких. Вызывается ядром перед каждым
   * проходом; убрать модуль — убрать и этот вызов.
   */
  setResolution(w: number, h: number): void {
    this.thinMat.resolution.set(w, h);
    this.thickMat.resolution.set(w, h);
    this.regionMat.resolution.set(w, h);
  }

  // ------------------------------------------------------------- жизненный цикл

  override canArm(): string | null {
    return this.host.hasWall()
      ? null
      : 'Проёмы ищутся по выделенной стене: сначала ШАГ 1 — обведите стену лассо и задайте ПСК';
  }

  override activate(): void {
    this.wall = this.host.wallPointsXY();
    if (!this.wall) {
      // Сюда попадаем, только если в срезе по глубине не осталось точек —
      // hasWall() пропустил, а слой оказался пуст.
      this.host.ui.setHint('В срезе по глубине нет точек — расширьте срез или выключите его');
      return;
    }
    this.computeWallBounds();
    this.panel?.classList.remove('hidden');
    // Настройки стоят В ЛЕНТЕ и могут перенести её на лишний ряд — окна
    // обязаны съехать вместе с ней, иначе верх чертежа уедет под ленту.
    this.host.ui.refreshRibbonHeight();
    this.bindPanel(true);
    // Разметка панели статична, а режим и цветовой фильтр переживают
    // выключения — кнопкам надо догнать состояние.
    this.syncModeButton();
    this.setRegionButtons();
    this.syncColorUI();
    this.readPanel(false);
    this.recompute();
  }

  override deactivate(): void {
    this.panel?.classList.add('hidden');
    this.host.ui.refreshRibbonHeight();
    this.bindPanel(false);
    this.thin.visible = false;
    this.thick.visible = false;
    this.rects = [];
    // Сетку и срез не держим: на большом скане это десятки мегабайт, а при
    // следующем включении стена всё равно могла измениться (другой срез,
    // другое лассо). Область по той же причине не переживает выключение —
    // она обведена по конкретной стене.
    this.wall = null;
    this.grid = null;
    this.gridCell = -1;
    this.region = null;
    this.cut = null;
    this.wallBounds = null;
    this.regionArm = false;
    this.regionDrag = null;
    this.regionPreview = null;
    this.pipetteArm = false;
    this.host.setSearchRegion(null);
    this.drawRegion(null);
  }

  /**
   * Срез изменился под живым инструментом (ползунки ГЛУБ/Т панели СРЕЗ) —
   * перечитать точки и повторить поиск. Зовёт движок с задержкой, поэтому
   * дорогая часть не молотит на каждый пиксель ползунка.
   */
  refreshWall(): void {
    if (!this.panel || this.panel.classList.contains('hidden')) return;
    this.wall = this.host.wallPointsXY();
    this.cut = null;
    this.grid = null;
    this.gridCell = -1;
    if (!this.wall) {
      this.rects = [];
      this.sel = -1;
      this.redraw();
      this.host.ui.setHint('В срезе не осталось точек — раздвиньте границы ОТ/ДО или верните срез к стене');
      return;
    }
    this.computeWallBounds();
    this.recompute();
  }

  // ------------------------------------------------------------------ ввод

  override onDown(p: DraftPointer): void {
    if (this.pipetteArm) {
      // Пипетка ест клик целиком: рамки в этот момент не выбираются.
      const css = this.host.addColorSample(this.mgr.ray);
      if (css) {
        this.syncColorUI();
        const st = this.host.colorFilter();
        this.host.ui.setHint(`Образец взят (всего ${st.count}) — ещё клик добавит, Esc закончит` + (st.on ? '' : ' · не забудьте галочку ЦВЕТ'));
        if (st.on) this.refreshWall();
      } else {
        this.host.ui.setHint('Точка скана под курсором не нашлась — цельтесь в облако');
      }
      return;
    }
    if (this.regionArm) {
      // Взведена ОБЛАСТЬ: эта протяжка — прямоугольник ограничения, а не
      // работа с рамками.
      this.regionDrag = { x: p.local.x, y: p.local.y };
      this.regionPreview = null;
      return;
    }
    if (!this.grid) return;
    const hit = this.pick(p.local.x, p.local.y);
    if (hit >= 0) {
      // Клик по рамке ВЫБИРАЕТ её, а не удаляет. Раньше удалял — но правка
      // сомнительной рамки начинается с того, что её надо взять в руки, а
      // не потерять; удаление осталось за Del, как во всём остальном CAD.
      this.sel = hit;
      this.grab = this.grabPart(this.rects[hit], p.local.x, p.local.y);
      this.redraw();
      this.tellSelection();
      return;
    }
    // Ткнули мимо рамок: возможно, там проём, который автомат не счёл
    // достаточно прямоугольным. Ручному указанию доверяем без проверок.
    const found = openingAt(this.grid, p.local.x, p.local.y, this.params);
    if (found) {
      this.rects.push(found);
      this.sel = this.rects.length - 1;
      this.redraw();
      this.tellSelection();
    } else {
      this.sel = -1;
      this.redraw();
      this.host.ui.setHint('Здесь стена, а не проём — ткните внутрь окна или подвиньте «СЕТКА»');
    }
  }

  override onMove(p: DraftPointer): void {
    if (this.regionDrag) {
      const a = this.regionDrag;
      this.regionPreview = {
        x0: Math.min(a.x, p.local.x),
        y0: Math.min(a.y, p.local.y),
        x1: Math.max(a.x, p.local.x),
        y1: Math.max(a.y, p.local.y),
      };
      this.drawRegion(this.regionPreview);
      return;
    }
    if (!this.grab || this.sel < 0) return;
    const r = { ...this.rects[this.sel] };
    const g = this.grab;
    // Тянем ровно ту сторону, за которую взялись; за середину — всю рамку.
    if (g.part === 'move') {
      const dx = p.local.x - g.px;
      const dy = p.local.y - g.py;
      r.x0 = g.x0 + dx;
      r.x1 = g.x1 + dx;
      r.y0 = g.y0 + dy;
      r.y1 = g.y1 + dy;
    } else {
      if (g.part.includes('l')) r.x0 = p.local.x;
      if (g.part.includes('r')) r.x1 = p.local.x;
      if (g.part.includes('b')) r.y0 = p.local.y;
      if (g.part.includes('t')) r.y1 = p.local.y;
      if (r.x1 < r.x0) [r.x0, r.x1] = [r.x1, r.x0];
      if (r.y1 < r.y0) [r.y0, r.y1] = [r.y1, r.y0];
    }
    // Липнет к общим линиям набора: правя одну рамку, человек почти всегда
    // ставит её туда же, где стоят соседние.
    const c = this.consensus();
    const snapped = snapToConsensus(r, { ...c, typW: 0, typH: 0 }, 0.04);
    this.rects[this.sel] = { ...snapped, grade: 'good' };
    this.redraw();
    this.tellSelection();
  }

  override onUp(): void {
    if (this.regionDrag) {
      const r = this.regionPreview;
      this.regionDrag = null;
      this.regionArm = false;
      this.regionPreview = null;
      // Щелчок без протяжки (или еле заметная) — не команда: снимаем взвод
      // и оставляем всё как было.
      if (!r || r.x1 - r.x0 < 0.2 || r.y1 - r.y0 < 0.2) {
        this.drawRegion(this.region);
        this.setRegionButtons();
        this.host.ui.setHint('Область не задана — зажмите кнопку мыши и протяните прямоугольник побольше');
        return;
      }
      this.region = r;
      this.cut = null;
      this.grid = null;
      // Окно 1 показывает только кусок: остальной фасад скрывается до
      // кнопки «ВЕСЬ ФАСАД» — работа идёт по области, ничто не отвлекает.
      this.host.setSearchRegion(r);
      this.setRegionButtons();
      this.drawRegion(r);
      this.recompute();
      // Навести кадр на кусок: работа сейчас в нём. Обратно вернёт кнопка
      // «ВЕСЬ ФАСАД» — одним нажатием.
      this.host.focusLocal((r.x0 + r.x1) / 2, (r.y0 + r.y1) / 2, r.x1 - r.x0, r.y1 - r.y0);
      return;
    }
    this.grab = null;
  }

  override onFinish(): void {
    if (!this.rects.length) {
      this.mgr.activate('select');
      return;
    }
    this.host.snapshot();
    for (const r of this.rects) {
      this.host.store.add(
        new PolylineEntity(
          [
            new THREE.Vector3(r.x0, r.y0, 0),
            new THREE.Vector3(r.x1, r.y0, 0),
            new THREE.Vector3(r.x1, r.y1, 0),
            new THREE.Vector3(r.x0, r.y1, 0),
          ],
          true,
        ),
      );
    }
    this.host.ui.setHint(`Обведено проёмов: ${this.rects.length}`);
    this.mgr.activate('select');
  }

  override onKey(e: KeyboardEvent): boolean {
    if (e.key === 'Escape') {
      // Первый Esc гасит взведённый шаг (пипетку или обводку области),
      // второй выходит из инструмента — отмена шага, а не всей работы.
      if (this.pipetteArm) {
        this.pipetteArm = false;
        this.syncColorUI();
        this.tellSelection();
        return true;
      }
      if (this.regionArm || this.regionDrag) {
        this.regionArm = false;
        this.regionDrag = null;
        this.regionPreview = null;
        this.drawRegion(this.region);
        this.setRegionButtons();
        this.tellSelection();
        return true;
      }
      this.mgr.activate('select');
      return true;
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (this.sel < 0) return false;
      this.rects.splice(this.sel, 1);
      this.sel = Math.min(this.sel, this.rects.length - 1);
      this.redraw();
      this.tellSelection();
      return true;
    }
    // N — следующая сомнительная. На фасаде в полсотни окон искать глазами
    // янтарные рамки среди зелёных — это и есть основная трата времени.
    if (e.key === 'n' || e.key === 'т' || e.key === 'N' || e.key === 'Т') {
      const n = this.rects.length;
      for (let step = 1; step <= n; step++) {
        const i = (this.sel + step + n) % n;
        if (this.rects[i].grade !== 'good') {
          this.sel = i;
          this.focusSelected();
          this.redraw();
          this.tellSelection();
          return true;
        }
      }
      this.host.ui.setHint('Сомнительных рамок больше нет — Enter обвести');
      return true;
    }
    // T — привести к типовым: края на общие линии, размер к типовому.
    if (e.key === 't' || e.key === 'е' || e.key === 'T' || e.key === 'Е') {
      const c = this.consensus();
      if (!c.xs.length && !c.ys.length && !c.typW) {
        this.host.ui.setHint('Типовые размеры не из чего вывести — нужно хотя бы три надёжные рамки');
        return true;
      }
      const fix = (i: number) => {
        this.rects[i] = { ...snapToConsensus(this.rects[i], c, 0.12), grade: 'good' };
      };
      if (this.sel >= 0) fix(this.sel);
      else for (let i = 0; i < this.rects.length; i++) if (this.rects[i].grade !== 'good') fix(i);
      this.redraw();
      this.tellSelection();
      return true;
    }
    return false;
  }

  // ------------------------------------------------------------- правка

  /** Индекс рамки под точкой; из вложенных берём меньшую. */
  private pick(x: number, y: number): number {
    let best = -1;
    let bestArea = Infinity;
    for (let i = 0; i < this.rects.length; i++) {
      const r = this.rects[i];
      // Небольшой допуск наружу: за край надо уметь взяться, а он тонкий.
      const m = Math.min(0.12, Math.min(r.x1 - r.x0, r.y1 - r.y0) * 0.25);
      if (x < r.x0 - m || x > r.x1 + m || y < r.y0 - m || y > r.y1 + m) continue;
      const area = (r.x1 - r.x0) * (r.y1 - r.y0);
      if (area < bestArea) {
        bestArea = area;
        best = i;
      }
    }
    return best;
  }

  /** За что взялись: сторону, угол или середину. */
  private grabPart(r: OpeningRect, x: number, y: number): Grab {
    const w = r.x1 - r.x0;
    const h = r.y1 - r.y0;
    // Зона ручки — четверть стороны, но не больше 12 см: на мелком проёме
    // половина рамки не должна оказаться ручкой.
    const gx = Math.min(0.12, w * 0.25);
    const gy = Math.min(0.12, h * 0.25);
    let part = '';
    if (Math.abs(x - r.x0) <= gx) part += 'l';
    else if (Math.abs(x - r.x1) <= gx) part += 'r';
    if (Math.abs(y - r.y0) <= gy) part += 'b';
    else if (Math.abs(y - r.y1) <= gy) part += 't';
    return { part: part || 'move', px: x, py: y, x0: r.x0, y0: r.y0, x1: r.x1, y1: r.y1 };
  }

  private consensus(): Consensus {
    return consensusOf(this.rects);
  }

  /** Подвести окна к выбранной рамке — без этого переход по N вслепую. */
  private focusSelected(): void {
    const r = this.rects[this.sel];
    if (!r) return;
    this.host.focusLocal((r.x0 + r.x1) / 2, (r.y0 + r.y1) / 2, r.x1 - r.x0, r.y1 - r.y0);
  }

  private tellSelection(): void {
    if (this.sel < 0 || !this.rects[this.sel]) {
      this.host.ui.setHint(
        `Проёмов: ${this.rects.length} · клик выбирает, тяните за край · N следующая сомнительная · T привести к типовым · Del убрать · Enter обвести`,
      );
      return;
    }
    const r = this.rects[this.sel];
    const w = ((r.x1 - r.x0) * 1000) | 0;
    const h = ((r.y1 - r.y0) * 1000) | 0;
    const s = Math.round(Math.max(r.sigmaW, r.sigmaH) * 1000);
    this.host.ui.setHint(
      `Рамка ${w}×${h} мм ±${s} · тяните за край или угол · T привести к типовым · N следующая сомнительная · Del убрать · Enter обвести всё`,
    );
  }

  // ------------------------------------------------- цветовой фильтр слоя

  /** Пипетка вкл/выкл: пока взведена, клики в окне 1 берут образцы цвета. */
  private togglePipette(): void {
    this.pipetteArm = !this.pipetteArm;
    this.syncColorUI();
    if (this.pipetteArm) {
      this.host.ui.setHint('ПИПЕТКА: кликайте по точкам-образцам (кирпич на солнце, кирпич в тени…) · Esc или ПИПЕТКА — закончить');
    } else {
      this.tellSelection();
    }
  }

  /** Считать галочку и допуск, включить фильтр и пересчитать. */
  private readColorPanel(): void {
    const on = (document.getElementById('op-color-on') as HTMLInputElement | null)?.checked ?? false;
    const tolEl = document.getElementById('op-color-tol') as HTMLInputElement | null;
    const tol = tolEl ? Number(tolEl.value) : 0.2;
    this.host.setColorFilter(on, Number.isFinite(tol) ? tol : 0.2);
    this.syncColorUI();
    if (on && this.host.colorFilter().count === 0) {
      this.host.ui.setHint('Фильтр по цвету включён, но образцов нет — возьмите цвет ПИПЕТКОЙ с нужной точки');
      return;
    }
    this.refreshWall();
  }

  /** Сброс образцов кликом по квадратику. */
  private clearSamples(): void {
    this.host.clearColorSamples();
    this.syncColorUI();
    this.refreshWall();
    this.host.ui.setHint('Образцы цвета сброшены');
  }

  /** Панель ЦВЕТ догоняет состояние движка (фильтр живёт между включениями). */
  private syncColorUI(): void {
    const st = this.host.colorFilter();
    const on = document.getElementById('op-color-on') as HTMLInputElement | null;
    if (on) on.checked = st.on;
    const tol = document.getElementById('op-color-tol') as HTMLInputElement | null;
    if (tol) tol.value = String(st.tol);
    const tolVal = document.getElementById('op-color-tol-val');
    if (tolVal) tolVal.textContent = `${Math.round(st.tol * 100)} %`;
    const pick = document.getElementById('op-pick');
    if (pick) pick.dataset.on = String(this.pipetteArm);
    const chip = document.getElementById('op-color-chip') as HTMLElement | null;
    if (chip) {
      chip.classList.toggle('hidden', st.css === null);
      if (st.css) {
        chip.style.background = st.css;
        chip.title = `Образцов: ${st.count} (клик — сбросить все)`;
      }
    }
  }

  // ------------------------------------------------- режим и область поиска

  /** ПРОЁМЫ ⇄ РЕЛЬЕФ. Меняется разметка сетки и пресеты: лепнина мельче окон. */
  private toggleMode(): void {
    this.mode = this.mode === 'holes' ? 'islands' : 'holes';
    this.syncModeButton();
    // Пресеты под режим — только там, где умолчания окон заведомо не годятся.
    // Ползунок МИН перекидываем на разумный старт, дальше рука пользователя.
    const min = document.getElementById('op-min') as HTMLInputElement | null;
    if (min) min.value = this.mode === 'islands' ? '0.05' : String(DEFAULT_PARAMS.minArea);
    this.params.minSide = this.mode === 'islands' ? 0.12 : DEFAULT_PARAMS.minSide;
    this.grid = null; // разметка областей зависит от режима
    this.readPanel(true);
    this.host.ui.setHint(
      this.mode === 'islands'
        ? 'РЕЛЬЕФ: ищу прямоугольные пятна точек. Задайте срез по слою выступа — в окне 2 протяните диапазон глубины и подтяните голубые оси прямо по профилю'
        : 'ПРОЁМЫ: ищу прямоугольные дырки в срезе — окна и двери',
    );
  }

  private syncModeButton(): void {
    const btn = document.getElementById('op-mode');
    if (!btn) return;
    btn.textContent = this.mode === 'holes' ? 'ПРОЁМЫ' : 'РЕЛЬЕФ';
    btn.dataset.on = String(this.mode === 'islands');
  }

  /** Кнопка ОБЛАСТЬ: следующая протяжка мыши — прямоугольник ограничения. */
  private armRegion(): void {
    this.regionArm = true;
    this.regionDrag = null;
    this.setRegionButtons();
    this.host.ui.setHint('ОБЛАСТЬ: зажмите кнопку мыши и обведите кусок фасада — поиск пойдёт только в нём · Esc отмена');
  }

  /** Кнопка «ВЕСЬ ФАСАД»: снять ограничение и вернуть кадр на место. */
  private clearRegion(): void {
    const had = this.region !== null;
    this.region = null;
    this.cut = null;
    this.regionArm = false;
    this.regionDrag = null;
    this.regionPreview = null;
    this.host.setSearchRegion(null);
    this.drawRegion(null);
    this.setRegionButtons();
    if (!had) return;
    this.grid = null;
    this.recompute();
    const b = this.wallBounds;
    if (b) this.host.focusLocal((b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, b.x1 - b.x0, b.y1 - b.y0);
  }

  private setRegionButtons(): void {
    const arm = document.getElementById('op-region');
    if (arm) arm.dataset.on = String(this.regionArm);
    // «ВЕСЬ ФАСАД» существует, только пока есть что снимать: пустая кнопка
    // рядом с невзведённой ОБЛАСТЬЮ — просто шум.
    document.getElementById('op-region-clear')?.classList.toggle('hidden', this.region === null);
  }

  /** Рамка области (или её предпросмотр при протяжке) на чертеже. */
  private drawRegion(r: { x0: number; y0: number; x1: number; y1: number } | null): void {
    this.regionObj.visible = r !== null;
    if (!r) return;
    const geo = new LineSegmentsGeometry();
    geo.setPositions([
      r.x0, r.y0, 0, r.x1, r.y0, 0,
      r.x1, r.y0, 0, r.x1, r.y1, 0,
      r.x1, r.y1, 0, r.x0, r.y1, 0,
      r.x0, r.y1, 0, r.x0, r.y0, 0,
    ]);
    this.regionObj.geometry.dispose();
    this.regionObj.geometry = geo;
    this.regionObj.computeLineDistances();
  }

  /** Точки для сетки: весь срез или вырезка по области (с кэшем). */
  private cutPoints(): { xy: Float32Array; n: number } | null {
    if (!this.wall) return null;
    if (!this.region) return this.wall;
    if (this.cut) return this.cut;
    const { x0, y0, x1, y1 } = this.region;
    const src = this.wall.xy;
    const out = new Float32Array(this.wall.n * 2);
    let m = 0;
    for (let i = 0; i < this.wall.n; i++) {
      const x = src[i * 2];
      const y = src[i * 2 + 1];
      if (x < x0 || x > x1 || y < y0 || y > y1) continue;
      out[m * 2] = x;
      out[m * 2 + 1] = y;
      m++;
    }
    // slice: держать в кэше буфер на весь срез ради его куска — расточительно.
    this.cut = { xy: out.slice(0, m * 2), n: m };
    return this.cut;
  }

  private computeWallBounds(): void {
    if (!this.wall) {
      this.wallBounds = null;
      return;
    }
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    const a = this.wall.xy;
    for (let i = 0; i < this.wall.n; i++) {
      const x = a[i * 2];
      const y = a[i * 2 + 1];
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
    this.wallBounds = x1 > x0 && y1 > y0 ? { x0, y0, x1, y1 } : null;
  }

  // -------------------------------------------------------------- вычисление

  /**
   * Пересчёт. Сетку собираем ТОЛЬКО когда сменилась ячейка: она стоит прохода
   * по всем точкам среза, а «МИН» и «ФОРМА» — это фильтры по уже размеченным
   * областям, они дёшевы. Без такого разделения каждый сдвиг любого ползунка
   * перемалывал бы всё облако заново.
   */
  private recompute(): void {
    if (!this.wall) return;
    const t0 = performance.now();
    if (!this.grid || this.gridCell !== this.params.cell) {
      const src = this.cutPoints();
      this.grid = src ? buildWallGrid(src.xy, src.n, this.params, this.mode === 'islands') : null;
      this.gridCell = this.params.cell;
    }
    if (!this.grid) {
      this.host.ui.setHint(
        this.region
          ? 'В области слишком мало точек — обведите крупнее или нажмите «ВЕСЬ ФАСАД»'
          : 'В срезе слишком мало точек для поиска — расширьте срез по глубине',
      );
      return;
    }
    this.rects = findOpenings(this.grid, this.params);
    // Набор пересобран — прежний выбор указывал бы на чужую рамку.
    this.sel = -1;
    this.grab = null;
    const ms = Math.round(performance.now() - t0);
    this.redraw();

    // Худшая погрешность по набору — честная цифра для того, кто потом
    // подпишет этот размер на чертеже.
    let worst = 0;
    for (const r of this.rects) worst = Math.max(worst, r.sigmaW, r.sigmaH);
    const rejected = lastRejected;

    const cf = this.host.colorFilter();
    this.host.ui.setHint(
      `${this.mode === 'islands' ? 'Пятен рельефа' : 'Проёмов'}: ${this.rects.length}` +
        (this.region ? ' (в области)' : '') +
        (cf.on && cf.count > 0 ? ' (по цвету)' : '') +
        (worst > 0 ? ` · размер ±${Math.round(worst * 1000)} мм` : '') +
        (rejected > 0 ? ` · отброшено по рваным краям: ${rejected}` : '') +
        ` · сетка ${Math.round(this.grid.cell * 100)} см, шаг съёмки ${Math.round(this.grid.spacing * 1000)} мм, ${ms} мс · ` +
        'клик по рамке выбирает, клик в пропущенное добавляет · Enter обвести',
    );
  }

  private redraw(): void {
    // Два набора вершин: обычные рамки и утолщённые (сомнительные).
    const bins: Record<'thin' | 'thick', { pos: number[]; col: number[] }> = {
      thin: { pos: [], col: [] },
      thick: { pos: [], col: [] },
    };
    const tally: Record<Grade, number> = { good: 0, fair: 0, poor: 0 };

    for (let i = 0; i < this.rects.length; i++) {
      const r = this.rects[i];
      tally[r.grade]++;
      // Выбранная — белая: цвет качества у неё уже прочитан, сейчас важнее,
      // какая рамка в руках.
      const c = i === this.sel ? WHITE : this.gradeColor[r.grade];
      const b = bins[r.grade === 'good' ? 'thin' : 'thick'];
      const seg = (x1: number, y1: number, x2: number, y2: number) => {
        b.pos.push(x1, y1, 0, x2, y2, 0);
        b.col.push(c.r, c.g, c.b, c.r, c.g, c.b);
      };
      seg(r.x0, r.y0, r.x1, r.y0);
      seg(r.x1, r.y0, r.x1, r.y1);
      seg(r.x1, r.y1, r.x0, r.y1);
      seg(r.x0, r.y1, r.x0, r.y0);
    }

    const fill = (obj: LineSegments2, src: { pos: number[]; col: number[] }) => {
      obj.visible = src.pos.length > 0;
      if (!obj.visible) return;
      const geo = new LineSegmentsGeometry();
      geo.setPositions(src.pos);
      geo.setColors(src.col);
      obj.geometry.dispose();
      obj.geometry = geo;
      obj.computeLineDistances();
    };
    fill(this.thin, bins.thin);
    fill(this.thick, bins.thick);

    // Счётчики по качеству — сразу видно, сколько рамок стоит перепроверить.
    const put = (id: string, v: number) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(v);
    };
    put('op-good', tally.good);
    put('op-fair', tally.fair);
    put('op-poor', tally.poor);
  }

  // ------------------------------------------------------------------ панель

  private get panel(): HTMLElement | null {
    return document.getElementById(PANEL);
  }

  private bindPanel(on: boolean): void {
    for (const id of ['op-cell', 'op-min', 'op-fill']) {
      const el = document.getElementById(id);
      if (!el) continue;
      if (on) el.addEventListener('input', this.onSlider);
      else el.removeEventListener('input', this.onSlider);
    }
    const btns: [string, () => void][] = [
      ['op-mode', this.onModeBtn],
      ['op-region', this.onRegionBtn],
      ['op-region-clear', this.onRegionClearBtn],
      ['op-pick', this.onPickBtn],
      ['op-color-chip', this.onChipClick],
    ];
    for (const [id, fn] of btns) {
      const el = document.getElementById(id);
      if (!el) continue;
      if (on) el.addEventListener('click', fn);
      else el.removeEventListener('click', fn);
    }
    // Галочка — change, допуск — input: пересчёт на лету, как у ползунков.
    const colorOn = document.getElementById('op-color-on');
    const colorTol = document.getElementById('op-color-tol');
    if (colorOn) {
      if (on) colorOn.addEventListener('change', this.onColorCtl);
      else colorOn.removeEventListener('change', this.onColorCtl);
    }
    if (colorTol) {
      if (on) colorTol.addEventListener('input', this.onColorCtl);
      else colorTol.removeEventListener('input', this.onColorCtl);
    }
  }

  /** Считывает ползунки в параметры; `run` — пересчитать сразу. */
  private readPanel(run: boolean): void {
    const num = (id: string, def: number) => {
      const el = document.getElementById(id) as HTMLInputElement | null;
      const v = el ? Number(el.value) : NaN;
      return Number.isFinite(v) ? v : def;
    };
    this.params.cell = num('op-cell', DEFAULT_PARAMS.cell);
    this.params.minArea = num('op-min', DEFAULT_PARAMS.minArea);
    this.params.minFill = num('op-fill', DEFAULT_PARAMS.minFill);

    const put = (id: string, text: string) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };
    // Ноль — «подобрать от плотности»; какую именно выбрали, видно в подсказке.
    put(
      'op-cell-val',
      this.params.cell > 0
        ? `${Math.round(this.params.cell * 100)} см`
        : this.grid
          ? `авто ${Math.round(this.grid.cell * 100)} см`
          : 'авто',
    );
    put('op-min-val', `${this.params.minArea.toFixed(2)} м²`);
    put('op-fill-val', `${Math.round(this.params.minFill * 100)} %`);

    if (run) this.recompute();
  }
}

const WHITE = new THREE.Color(0xffffff);
