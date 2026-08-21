/**
 * Поиск оконных и дверных проёмов в срезе стены.
 *
 * МОДУЛЬ НАМЕРЕННО ЧИСТЫЙ: на входе плоский массив координат, на выходе
 * прямоугольники. Ни three.js, ни DOM, ни состояния приложения. Это не
 * аккуратность ради аккуратности — счёт отсюда должен уметь переехать на
 * сервер (платный модуль), а переезд чистой функции стоит копирования файла.
 *
 * Идея. Стена в осях ПСК — это плоскость XY, а проём в ней — дырка: область,
 * где точек нет, окружённая точками со всех сторон. Значит:
 *
 *   1. кладём точки в сетку занятости;
 *   2. ЗАМЫКАЕМ маску стены, чтобы поры разрежённой съёмки не текли наружу;
 *   3. заливкой от края отделяем «наружу» от «дырок внутри стены» — небо над
 *      крышей и поле за углом дома заливаются с края и отпадают сами;
 *   4. оставшиеся дырки метим связными областями и отсеиваем по площади,
 *      стороне и ПРЯМОУГОЛЬНОСТИ — доле габарита, которую область занимает;
 *   5. края уточняем по самим точкам.
 *
 * РАЗРЕШЕНИЕ СЕТКИ И ТОЧНОСТЬ ОБМЕРА — РАЗНЫЕ ВЕЩИ. Сетка нужна только чтобы
 * понять, где дырка, а где стена; размер берётся не с неё, а с точек. Поэтому
 * ячейку выгодно держать крупной (втрое-вчетверо крупнее шага съёмки): мелкая
 * ячейка на разрежённом скане дырявит стену, и проём вытекает в неё.
 *
 * Чего эта затея НЕ умеет и уметь не будет: отличить настоящий проём от тени,
 * если тень прямоугольная (фура у стены). Поэтому результат — всегда
 * КАНДИДАТЫ, которые человек подтверждает, а не готовый чертёж.
 *
 * ДВА РЕЖИМА ОДНОЙ МАТЕМАТИКИ. Проём — прямоугольная ДЫРКА в занятости
 * среза. Но если срез сдвинуть по глубине на выступ (лепнина, руст,
 * филёнка), в нём остаются ТОЛЬКО точки рельефа — и тот же прямоугольник
 * теперь ОСТРОВ точек посреди пустоты. Сетка, замыкание, связные области,
 * фильтр прямоугольности и уточнение краёв по рядам работают одинаково,
 * меняется лишь что размечаем — пустоту или занятость — и в какую сторону
 * от края лежат измеряемые точки (знаки в rectOf).
 */

export interface OpeningParams {
  /** Сторона ячейки, м. 0 — подобрать от плотности точек. */
  cell: number;
  /** Площадь проёма, м² — окно меньше 0.2 м² и больше 15 м² не бывает. */
  minArea: number;
  maxArea: number;
  /** Минимальная сторона, м — отсекает щели и полосы пропусков сканера. */
  minSide: number;
  /** Доля габарита, которую занимает дырка: 1.0 — идеальный прямоугольник. */
  minFill: number;
}

export const DEFAULT_PARAMS: OpeningParams = {
  cell: 0,
  minArea: 0.25,
  maxArea: 15,
  minSide: 0.35,
  minFill: 0.8,
};

export interface OpeningRect {
  /** Границы в осях ПСК, м. */
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  /** Прямоугольность 0…1 — по ней сортируем: сначала самые «честные». */
  fill: number;
  /**
   * Оценка погрешности ширины и высоты, м. Не украшение: обмерный размер без
   * понимания, откуда он взялся, — это цифра, за которую нельзя отвечать.
   * Считается по разбросу рядов точек вдоль каждого края.
   */
  sigmaW: number;
  sigmaH: number;
  /** Качество вписания — им красятся рамки. */
  grade: Grade;
}

/**
 * Насколько можно верить рамке:
 *
 *   good — края ровные, размер снят с точностью самой съёмки;
 *   fair — края шумят, размер годится для прикидки, но не для чертежа;
 *   poor — область прямоугольная лишь в габарите: почти наверняка не проём,
 *          а тень или пятно пропусков сканирования.
 *
 * Оценка ОТНОСИТЕЛЬНАЯ — относительно шага съёмки, а не в миллиметрах. На
 * редком скане ±4 см это предел возможного, и красить такой обмер красным
 * было бы враньём: он ровно настолько хорош, насколько позволяют данные.
 * Абсолютная цифра всё равно показывается рядом.
 */
export type Grade = 'good' | 'fair' | 'poor';

interface Region {
  id: number;
  cx0: number;
  cy0: number;
  cx1: number;
  cy1: number;
  cells: number;
}

/**
 * Сетка со всем, что считается один раз: занятость, метки областей и индекс
 * точек по ячейкам. Пересобирается только при смене ячейки — фильтры по
 * площади и форме работают уже по готовым областям.
 */
export interface WallGrid {
  nx: number;
  ny: number;
  cell: number;
  minX: number;
  minY: number;
  /** Средний шаг съёмки, м — по нему уточняются края. */
  spacing: number;
  /** Режим разметки: false — дырки в стене (проёмы), true — острова точек
   *  (рельеф: лепнина, русты, филёнки в сдвинутом по глубине срезе). */
  islands: boolean;
  /** Дырки: 0 — стена, 1 — наружу, ≥2 — номер дырки.
   *  Острова: 0 — пусто, ≥2 — номер острова. */
  label: Int32Array;
  regions: Region[];
  /** Индекс точек по ячейкам (CSR): items[start[k] … start[k+1]) — точки ячейки k. */
  start: Int32Array;
  items: Int32Array;
  xy: Float32Array;
  n: number;
}

/** Потолок памяти: 4 млн ячеек — это Int32Array на 16 МБ под метки. */
const MAX_CELLS = 4_000_000;

/**
 * Сборка сетки. Дорогая часть (единственный проход по точкам) — здесь.
 * `islands` переключает разметку: дырки в занятости (проёмы) или связные
 * компоненты самой занятости (рельеф).
 */
export function buildWallGrid(xy: Float32Array, n: number, p: OpeningParams, islands = false): WallGrid | null {
  if (n < 200) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < n; i++) {
    const x = xy[i * 2];
    const y = xy[i * 2 + 1];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const w = maxX - minX;
  const h = maxY - minY;
  if (!(w > 0) || !(h > 0)) return null;

  // Шаг съёмки. Наивная оценка √(площадь/число) врёт, когда слой занимает
  // МАЛУЮ долю габарита: после фильтра цвета или тонкого среза остаются
  // одни кирпичи, «пустая» площадь завышает шаг вчетверо, ячейка грубеет,
  // и русты сливаются замыканием (поймано пользователем). Поэтому шаг
  // меряем по ЗАНЯТЫМ ячейкам пробной сетки: площадь берётся только та,
  // где точки действительно есть.
  const coarse = Math.sqrt((w * h) / n);
  let spacing = coarse;
  {
    const c0 = Math.min(0.5, Math.max(0.02, coarse * 3.5));
    const gx = Math.max(1, Math.min(2048, Math.ceil(w / c0)));
    const gy = Math.max(1, Math.min(2048, Math.ceil(h / c0)));
    const occ = new Uint8Array(gx * gy);
    for (let i = 0; i < n; i++) {
      const cx = Math.min(gx - 1, ((xy[i * 2] - minX) / (w / gx)) | 0);
      const cy = Math.min(gy - 1, ((xy[i * 2 + 1] - minY) / (h / gy)) | 0);
      occ[cy * gx + cx] = 1;
    }
    let occN = 0;
    for (let k = 0; k < occ.length; k++) occN += occ[k];
    if (occN > 0) spacing = Math.sqrt(((w / gx) * (h / gy) * occN) / n);
    // Пол в 0.3 наивной оценки: полосатость реального скана (строки
    // сканера) опустошает часть пробных ячеек и занижает шаг — ячейка
    // мельчает, стена дырявится. Слой из одних рустов честно даёт ~0.33.
    spacing = Math.max(spacing, coarse * 0.3);
  }

  // Ячейка: либо задана человеком, либо от плотности. Для ДЫРОК — 3.5 шага:
  // в такую ячейку попадает около десятка точек, и пустая ячейка внутри
  // стены редкость даже при случайной (пуассоновской) съёмке. Для ОСТРОВОВ
  // ячейка обязана быть МЕЛЬЧЕ: шов между соседними рустами разделяется,
  // только если в нём помещается целиком пустой ряд ячеек, то есть ячейка
  // ≤ полшва. 1.6 шага съёмки разрешает швы от ~3.2 шага (для съёмки
  // 15 мм — швы от 5 см); поры от мелкой ячейки лечит точечная заплатка
  // ниже, которая мост через шов построить не может.
  const kCell = islands ? 1.6 : 3.5;
  const kFloor = islands ? 1.6 : 2.2;
  let cell = p.cell > 0 ? p.cell : Math.min(0.25, Math.max(0.02, spacing * kCell));
  // Ручная ячейка МЕЛЬЧЕ шага съёмки физически бессмысленна: в неё не
  // попадает ни одной точки, стена дырявится, и все кандидаты гибнут «по
  // рваным краям» (дважды поймано пользователем на СЕТКА = 1 см). Нижний
  // предел; фактическая ячейка видна в подсказке результатов.
  if (p.cell > 0) cell = Math.max(p.cell, spacing * kFloor);
  while ((w / cell + 2) * (h / cell + 2) > MAX_CELLS) cell *= 1.5;

  const nx = Math.ceil(w / cell) + 2;
  const ny = Math.ceil(h / cell) + 2;
  // Поле шириной в ячейку по кругу: стена, доходящая до самого края сетки,
  // иначе сливается с «наружу», и проём у края стены пропадает.
  const ox = minX - cell;
  const oy = minY - cell;
  const cells = nx * ny;

  // Счётчики и одновременно основа CSR-индекса.
  const count = new Int32Array(cells);
  const cellOf = new Int32Array(n);
  for (let i = 0; i < n; i++) {
    const cx = ((xy[i * 2] - ox) / cell) | 0;
    const cy = ((xy[i * 2 + 1] - oy) / cell) | 0;
    const k = cx >= 0 && cy >= 0 && cx < nx && cy < ny ? cy * nx + cx : -1;
    cellOf[i] = k;
    if (k >= 0) count[k]++;
  }

  const start = new Int32Array(cells + 1);
  for (let k = 0; k < cells; k++) start[k + 1] = start[k] + count[k];
  const items = new Int32Array(start[cells]);
  const fill = new Int32Array(cells);
  for (let i = 0; i < n; i++) {
    const k = cellOf[i];
    if (k >= 0) items[start[k] + fill[k]++] = i;
  }

  // Ячейка со ЛЮБОЙ точкой — стена. Порог выше единицы кажется разумным
  // («одна точка это шум»), но разваливает случайную съёмку: у наземного
  // сканера точки ложатся не сеткой, число в ячейке пляшет, и требование
  // «хотя бы две» пробивает в стене дыры на ровном месте — проёмы вытекают
  // и сливаются в одну область. А одиночная точка ВНУТРИ проёма (отражение
  // в стекле) вреда не делает: она остаётся островком, заливка обходит его
  // кругом и дырка остаётся дыркой.
  //
  // У ОСТРОВОВ логика обратная: там опасен «мост» — ячейка поперёк шва,
  // зацепившая краешки ДВУХ соседних рустов. Точек в ней в разы меньше,
  // чем во внутренней, поэтому острова режутся ПОРОГОМ — треть медианной
  // заполненности. Кромочные ячейки самих рустов тоже худеют и частично
  // выпадают, но это безвредно: стороны рамок меряются по точкам полосы
  // (refineEdge), а не по ячейкам.
  let wall = new Uint8Array(cells);
  if (islands) {
    const hist = new Int32Array(1024);
    let nz = 0;
    for (let k = 0; k < cells; k++) {
      if (count[k] > 0) {
        hist[Math.min(1023, count[k])]++;
        nz++;
      }
    }
    let med = 1;
    for (let v = 1, acc = 0; v < 1024; v++) {
      acc += hist[v];
      if (acc >= nz / 2) {
        med = v;
        break;
      }
    }
    const thr = Math.max(1, Math.round(med * 0.3));
    for (let k = 0; k < cells; k++) wall[k] = count[k] >= thr ? 1 : 0;
  } else {
    for (let k = 0; k < cells; k++) wall[k] = count[k] > 0 ? 1 : 0;
  }

  // ЗАМЫКАНИЕ: расширить стену на ячейку и сжать обратно. Поры шириной в
  // одну ячейку (там, где точка просто не попала) затягиваются, а границы
  // настоящих проёмов возвращаются на место — в этом весь смысл операции.
  //
  // Для ОСТРОВОВ замыкание выключено: оно закрывает зазоры до двух ячеек,
  // а зазор между соседними рустами — как раз одна-две ячейки, и поле
  // рустов сшивалось в один мегаостров (поймано эталонным тестом). Поры
  // мелкой ячейки лечит точечная заплатка: пустая ячейка, у которой из
  // восьми соседей заняты минимум семь, — это пропуск съёмки внутри тела.
  // Ячейке в шве столько соседей не собрать (пустые продолжения шва сверху
  // и снизу), поэтому заплатка не мостит.
  if (!islands) wall = close1(wall, nx, ny);
  else fillPinholes(wall, nx, ny);

  const label = islands ? labelIslands(wall, nx, ny) : labelHoles(wall, nx, ny);
  const regions = collectRegions(label, nx, ny);

  return { nx, ny, cell, minX: ox, minY: oy, spacing, islands, label, regions, start, items, xy, n };
}

/** Точечная заплатка пор: пустая ячейка с ≥7 занятыми соседями считается
 *  пропуском съёмки и заполняется. В отличие от замыкания НЕ строит мостов
 *  через швы — там всегда пустует продолжение шва. */
function fillPinholes(wall: Uint8Array, nx: number, ny: number): void {
  const src = wall.slice();
  for (let y = 1; y < ny - 1; y++) {
    for (let x = 1; x < nx - 1; x++) {
      const k = y * nx + x;
      if (src[k]) continue;
      let n = 0;
      n += src[k - nx - 1] + src[k - nx] + src[k - nx + 1];
      n += src[k - 1] + src[k + 1];
      n += src[k + nx - 1] + src[k + nx] + src[k + nx + 1];
      if (n >= 7) wall[k] = 1;
    }
  }
}

/** Морфологическое замыкание радиусом в одну ячейку (8-связность). */
function close1(src: Uint8Array, nx: number, ny: number): Uint8Array<ArrayBuffer> {
  const dil = new Uint8Array(src.length);
  for (let y = 0; y < ny; y++) {
    for (let x = 0; x < nx; x++) {
      const k = y * nx + x;
      if (src[k]) {
        dil[k] = 1;
        continue;
      }
      let any = 0;
      for (let dy = -1; dy <= 1 && !any; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= ny) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= nx) continue;
          if (src[yy * nx + xx]) {
            any = 1;
            break;
          }
        }
      }
      dil[k] = any;
    }
  }
  const out = new Uint8Array(src.length);
  for (let y = 0; y < ny; y++) {
    for (let x = 0; x < nx; x++) {
      const k = y * nx + x;
      if (!dil[k]) continue;
      let all = 1;
      for (let dy = -1; dy <= 1 && all; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= ny) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= nx) continue;
          if (!dil[yy * nx + xx]) {
            all = 0;
            break;
          }
        }
      }
      out[k] = all;
    }
  }
  return out;
}

/** Метки областей: 0 — стена, 1 — «наружу», ≥2 — номер дырки. */
function labelHoles(wall: Uint8Array, nx: number, ny: number): Int32Array {
  const label = new Int32Array(wall.length);
  const stack = new Int32Array(wall.length);
  let sp = 0;

  const pushOut = (k: number) => {
    if (wall[k] === 0 && label[k] === 0) {
      label[k] = 1;
      stack[sp++] = k;
    }
  };
  for (let x = 0; x < nx; x++) {
    pushOut(x);
    pushOut((ny - 1) * nx + x);
  }
  for (let y = 0; y < ny; y++) {
    pushOut(y * nx);
    pushOut(y * nx + nx - 1);
  }
  while (sp > 0) {
    const k = stack[--sp];
    const x = k % nx;
    const y = (k / nx) | 0;
    if (x > 0) pushOut(k - 1);
    if (x < nx - 1) pushOut(k + 1);
    if (y > 0) pushOut(k - nx);
    if (y < ny - 1) pushOut(k + nx);
  }

  let next = 2;
  for (let seed = 0; seed < label.length; seed++) {
    if (wall[seed] !== 0 || label[seed] !== 0) continue;
    const id = next++;
    label[seed] = id;
    stack[sp++] = seed;
    while (sp > 0) {
      const k = stack[--sp];
      const x = k % nx;
      const y = (k / nx) | 0;
      const put = (j: number) => {
        if (wall[j] === 0 && label[j] === 0) {
          label[j] = id;
          stack[sp++] = j;
        }
      };
      if (x > 0) put(k - 1);
      if (x < nx - 1) put(k + 1);
      if (y > 0) put(k - nx);
      if (y < ny - 1) put(k + nx);
    }
  }
  return label;
}

/**
 * Метки ОСТРОВОВ: связные компоненты занятых ячеек. «Наружу» здесь не бывает —
 * каждый остров сам по себе кандидат, а решают фильтры площади и формы.
 * Нумерация с 2, как у дырок: collectRegions и openingAt едины для обоих
 * режимов.
 */
function labelIslands(wall: Uint8Array, nx: number, ny: number): Int32Array {
  const label = new Int32Array(wall.length);
  const stack = new Int32Array(wall.length);
  let sp = 0;
  let next = 2;
  for (let seed = 0; seed < label.length; seed++) {
    if (wall[seed] === 0 || label[seed] !== 0) continue;
    const id = next++;
    label[seed] = id;
    stack[sp++] = seed;
    while (sp > 0) {
      const k = stack[--sp];
      const x = k % nx;
      const y = (k / nx) | 0;
      const put = (j: number) => {
        if (wall[j] !== 0 && label[j] === 0) {
          label[j] = id;
          stack[sp++] = j;
        }
      };
      if (x > 0) put(k - 1);
      if (x < nx - 1) put(k + 1);
      if (y > 0) put(k - nx);
      if (y < ny - 1) put(k + nx);
    }
  }
  return label;
}

function collectRegions(label: Int32Array, nx: number, ny: number): Region[] {
  const by = new Map<number, Region>();
  for (let k = 0; k < label.length; k++) {
    const id = label[k];
    if (id < 2) continue;
    const x = k % nx;
    const y = (k / nx) | 0;
    const r = by.get(id);
    if (!r) by.set(id, { id, cx0: x, cy0: y, cx1: x, cy1: y, cells: 1 });
    else {
      if (x < r.cx0) r.cx0 = x;
      if (x > r.cx1) r.cx1 = x;
      if (y < r.cy0) r.cy0 = y;
      if (y > r.cy1) r.cy1 = y;
      r.cells++;
    }
  }
  void ny;
  return [...by.values()];
}

/** Оценка положения края и её погрешность, м. */
interface EdgeFit {
  value: number;
  sigma: number;
}

/**
 * Уточнение края по точкам стены рядом с ним.
 *
 * КЛЮЧЕВОЕ: край меряется НЕ одной крайней точкой на всю сторону, а по рядам.
 * У окна высотой полтора метра вертикальный край наблюдается десятками рядов
 * точек, и каждый ряд — независимое измерение: последняя точка ряда лежит на
 * случайном расстоянии от 0 до шага съёмки от настоящего края. Одно измерение
 * даёт ±полшага; медиана по N рядам — примерно в √N раз точнее. Для окна на
 * пятисантиметровом скане это разница между ±25 мм и ±5 мм.
 *
 * Работает это, потому что съёмка не выровнена по стене: у каждого ряда своя
 * фаза. На идеально выровненной сетке (синтетика) выигрыша нет, но и потери
 * тоже — оценка не хуже прежней.
 *
 * Смотрим только ячейки полосы — без индекса каждый край стоил бы прохода по
 * всему срезу, а краёв четыре на проём и проёмов десятки.
 *
 * `sign` = +1, когда стена ЛЕВЕЕ/НИЖЕ края, и −1, когда правее/выше.
 */
function refineEdge(
  g: WallGrid,
  axis: 0 | 1,
  edge: number,
  lo: number,
  hi: number,
  reach: number,
  sign: 1 | -1,
): EdgeFit {
  const { xy, start, items, cell, nx, ny, minX, minY } = g;
  const a0 = sign > 0 ? edge - reach : edge;
  const a1 = sign > 0 ? edge : edge + reach;
  const ax = axis === 0 ? minX : minY;
  const bx = axis === 0 ? minY : minX;
  const an = axis === 0 ? nx : ny;
  const bn = axis === 0 ? ny : nx;

  const caLo = clamp(((Math.min(a0, a1) - ax) / cell) | 0, 0, an - 1);
  const caHi = clamp(((Math.max(a0, a1) - ax) / cell) | 0, 0, an - 1);
  const cbLo = clamp(((lo - bx) / cell) | 0, 0, bn - 1);
  const cbHi = clamp(((hi - bx) / cell) | 0, 0, bn - 1);

  /*
   * Точки полосы, разложенные ПО РЯДАМ СЪЁМКИ — полосками толщиной в один
   * шаг, а не по строкам ячеек сетки.
   *
   * Это принципиально. Ячейка втрое-вчетверо крупнее шага, и в её строку
   * попадают три-четыре ряда точек сразу. Промежутки там мерились бы между
   * перемешанными рядами и выходили втрое меньше настоящих — а именно от
   * промежутка считается поправка на недобор.
   */
  const byRow = new Map<number, number[]>();
  let count = 0;
  const rowH = g.spacing > 0 ? g.spacing : cell;
  for (let cb = cbLo; cb <= cbHi; cb++) {
    for (let ca = caLo; ca <= caHi; ca++) {
      const k = axis === 0 ? cb * nx + ca : ca * nx + cb;
      for (let t = start[k]; t < start[k + 1]; t++) {
        const i = items[t];
        const a = xy[i * 2 + axis];
        const b = xy[i * 2 + (axis ^ 1)];
        if (b < lo || b > hi) continue;
        const d = (a - edge) * sign;
        if (d > 0 || d < -reach) continue;
        count++;
        const key = Math.floor(b / rowH);
        const row = byRow.get(key);
        if (row) row.push(a);
        else byRow.set(key, [a]);
      }
    }
  }
  if (count < 6) return { value: edge, sigma: g.spacing }; // верить нечему

  // Крайняя точка каждого ряда и промежутки между точками внутри ряда.
  const rims: number[] = [];
  const gaps: number[] = [];
  for (const row of byRow.values()) {
    row.sort((a, b) => a - b);
    rims.push(sign > 0 ? row[row.length - 1] : row[0]);
    for (let i = 1; i < row.length; i++) gaps.push(row[i] - row[i - 1]);
  }

  /*
   * ПОПРАВКА НА НЕДОБОР. Последняя точка ряда лежит не на краю проёма, а не
   * доходя до него — и насколько именно, зависит от того, как ложится съёмка:
   *
   *   регулярная сетка с шагом s : недобор равномерен на [0, s], в среднем s/2;
   *   случайные точки (Пуассон)  : в среднем ПОЛНЫЙ средний промежуток.
   *
   * Разница вдвое — это сантиметры на размер. Оба случая закрывает формула
   * теории восстановления: средний недобор от произвольно взятой границы
   * равен E[g²] / (2·E[g]) по промежуткам g. Для сетки она даёт s/2, для
   * Пуассона — полный промежуток, для реального скана — то, что заслужил его
   * узор. Считаем по наблюдённым промежуткам, ничего не предполагая.
   */
  gaps.sort((a, b) => a - b);
  const gMed = gaps.length ? gaps[gaps.length >> 1] : 0;
  const gCap = gMed > 0 ? gMed * 3 : Infinity; // дыра в ряду не должна перекосить
  let sumG = 0;
  let sumG2 = 0;
  let nG = 0;
  for (const gp of gaps) {
    if (gp <= 0 || gp > gCap) continue;
    sumG += gp;
    sumG2 += gp * gp;
    nG++;
  }
  const area = reach * (hi - lo);
  const step = area > 0 ? Math.sqrt(area / count) : g.spacing;
  const back = nG >= 4 ? sumG2 / (2 * sumG) : step * 0.5;

  rims.sort((a, b) => a - b);
  if (rims.length < 3) {
    // Ряды не набрались (короткий край) — по крайней точке, отбросив пару
    // выбросов, чтобы отражение в стекле не утащило сторону.
    const drop = Math.min(2, Math.floor(rims.length * 0.5));
    const one = sign > 0 ? rims[rims.length - 1 - drop] : rims[drop];
    return { value: one + sign * back, sigma: back };
  }

  // Медиана рядов, а не среднее: один ряд, испорченный отражением или краем
  // откоса, не должен двигать сторону.
  const med = rims[rims.length >> 1];
  let mad = 0;
  for (const v of rims) mad += Math.abs(v - med);
  mad /= rims.length;

  return {
    value: med + sign * back,
    // Погрешность медианы падает с числом рядов, но ниже половины недобора не
    // опускаем: обещать точность, которой нет, хуже, чем её недооценить.
    sigma: Math.max(back * 0.5, (1.25 * mad) / Math.sqrt(rims.length)),
  };
}

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

/** Сколько областей прошло по форме и площади, но отсеяно по рваности краёв. */
export let lastRejected = 0;

/** Все проёмы, прошедшие фильтры. Сетка уже собрана — это дёшево. */
export function findOpenings(g: WallGrid, p: OpeningParams): OpeningRect[] {
  const out: OpeningRect[] = [];
  lastRejected = 0;
  for (const r of g.regions) {
    if (!passesShape(g, r, p)) continue;
    const rect = rectOf(g, r, p, false);
    if (rect) out.push(rect);
    else lastRejected++;
  }
  // Сначала самые «прямоугольные»: если человек будет отсеивать вручную,
  // сомнительное должно лежать в конце списка, а не вперемешку.
  out.sort((a, b) => b.fill - a.fill);
  return out;
}

/** Один проём под точкой — для режима «ткнуть в окно». */
export function openingAt(g: WallGrid, x: number, y: number, p: OpeningParams): OpeningRect | null {
  const cx = ((x - g.minX) / g.cell) | 0;
  const cy = ((y - g.minY) / g.cell) | 0;
  if (cx < 0 || cy < 0 || cx >= g.nx || cy >= g.ny) return null;

  let id = g.label[cy * g.nx + cx];
  // Попасть мышью ровно в пустую ячейку — не работа человека: сквозь стекло
  // сканер ловит отражения, и в середине окна попадаются точки. Ищем дырку
  // рядом и берём ближайшую.
  if (id < 2) {
    const R = 4;
    let bestD2 = Infinity;
    for (let dy = -R; dy <= R; dy++) {
      const yy = cy + dy;
      if (yy < 0 || yy >= g.ny) continue;
      for (let dx = -R; dx <= R; dx++) {
        const xx = cx + dx;
        if (xx < 0 || xx >= g.nx) continue;
        const l = g.label[yy * g.nx + xx];
        if (l < 2) continue;
        const d2 = dx * dx + dy * dy;
        if (d2 < bestD2) {
          bestD2 = d2;
          id = l;
        }
      }
    }
  }
  if (id < 2) return null;

  const r = g.regions.find((q) => q.id === id);
  // Ручной тык — доверие человеку: фильтры площади и формы не применяем,
  // он видит, куда тычет.
  return r ? rectOf(g, r, p, true) : null;
}

/** Проходит ли область по площади, стороне и прямоугольности. */
function passesShape(g: WallGrid, r: Region, p: OpeningParams): boolean {
  const { cell } = g;
  const bw = (r.cx1 - r.cx0 + 1) * cell;
  const bh = (r.cy1 - r.cy0 + 1) * cell;
  const fill = r.cells / ((r.cx1 - r.cx0 + 1) * (r.cy1 - r.cy0 + 1));
  const area = r.cells * cell * cell;
  return area >= p.minArea && area <= p.maxArea && bw >= p.minSide && bh >= p.minSide && fill >= p.minFill;
}

/**
 * Согласие набора: общие линии и типовой размер.
 *
 * На фасаде окна одинаковые и стоят рядами — это знание есть у машины,
 * но применяет его обычно человек, руками подгоняя косые рамки. Здесь оно
 * считается явно: если четыре окна дали одну отметку низа, пятое почти
 * наверняка на той же отметке, а его расхождение — промах поиска, а не
 * особенность дома.
 *
 * Линию поддерживают только НЕСКОЛЬКО проёмов: одна рамка сама себе не
 * доказательство, иначе сомнительная рамка «подтвердила» бы собственный
 * промах.
 */
export interface Consensus {
  /** Общие вертикальные линии (значения x краёв), м. */
  xs: number[];
  /** Общие горизонтальные линии (значения y краёв), м. */
  ys: number[];
  /** Типовые размеры проёма, м; 0 — набор слишком мал. */
  typW: number;
  typH: number;
}

function cluster(values: number[], tol: number, minSupport: number): number[] {
  if (!values.length) return [];
  const v = [...values].sort((a, b) => a - b);
  const out: number[] = [];
  let group = [v[0]];
  const flush = () => {
    if (group.length >= minSupport) out.push(group[group.length >> 1]);
  };
  for (let i = 1; i < v.length; i++) {
    if (v[i] - v[i - 1] <= tol) group.push(v[i]);
    else {
      flush();
      group = [v[i]];
    }
  }
  flush();
  return out;
}

const median = (a: number[]): number => (a.length ? [...a].sort((x, y) => x - y)[a.length >> 1] : 0);

/** Согласие строится ТОЛЬКО по надёжным рамкам — иначе оно унаследует их промахи. */
export function consensusOf(rects: readonly OpeningRect[], tol = 0.06): Consensus {
  const good = rects.filter((r) => r.grade === 'good');
  const base = good.length >= 2 ? good : rects;
  const xs: number[] = [];
  const ys: number[] = [];
  const ws: number[] = [];
  const hs: number[] = [];
  for (const r of base) {
    xs.push(r.x0, r.x1);
    ys.push(r.y0, r.y1);
    ws.push(r.x1 - r.x0);
    hs.push(r.y1 - r.y0);
  }
  return {
    xs: cluster(xs, tol, 2),
    ys: cluster(ys, tol, 2),
    typW: base.length >= 3 ? median(ws) : 0,
    typH: base.length >= 3 ? median(hs) : 0,
  };
}

const nearest = (lines: number[], v: number, tol: number): number | null => {
  let best: number | null = null;
  let bd = tol;
  for (const l of lines) {
    const d = Math.abs(l - v);
    if (d <= bd) {
      bd = d;
      best = l;
    }
  }
  return best;
};

/**
 * Привести рамку к согласию набора: края — на общие линии, размер — к
 * типовому.
 *
 * Порядок важен. Сначала края, потому что попадание на общую линию —
 * сильное свидетельство; и только оставшийся свободным край подгоняется
 * под типовой размер. Если на линии сели оба края стороны, размер не
 * трогаем: у дома действительно может быть окно другой ширины, и придумывать
 * за него не наше дело.
 */
export function snapToConsensus(r: OpeningRect, c: Consensus, tol: number): OpeningRect {
  const out = { ...r };
  const lx0 = nearest(c.xs, r.x0, tol);
  const lx1 = nearest(c.xs, r.x1, tol);
  const ly0 = nearest(c.ys, r.y0, tol);
  const ly1 = nearest(c.ys, r.y1, tol);
  if (lx0 !== null) out.x0 = lx0;
  if (lx1 !== null) out.x1 = lx1;
  if (ly0 !== null) out.y0 = ly0;
  if (ly1 !== null) out.y1 = ly1;

  const fit = (a: number, b: number, la: number | null, lb: number | null, typ: number) => {
    if (!typ || (la !== null && lb !== null)) return [a, b];
    // Отклонение больше трети типового размера — это другой проём, а не
    // промах: подгонять нечего.
    if (Math.abs(b - a - typ) > typ * 0.33) return [a, b];
    if (la !== null) return [a, a + typ]; // левый край доказан — тянем правый
    if (lb !== null) return [b - typ, b];
    const mid = (a + b) / 2; // ни один не доказан — сохраняем середину
    return [mid - typ / 2, mid + typ / 2];
  };
  [out.x0, out.x1] = fit(out.x0, out.x1, lx0, lx1, c.typW);
  [out.y0, out.y1] = fit(out.y0, out.y1, ly0, ly1, c.typH);
  return out;
}

function rectOf(g: WallGrid, r: Region, p: OpeningParams, trusted: boolean): OpeningRect | null {
  const { cell, minX, minY } = g;
  const fill = r.cells / ((r.cx1 - r.cx0 + 1) * (r.cy1 - r.cy0 + 1));

  if (!trusted && !passesShape(g, r, p)) return null;

  let x0 = minX + r.cx0 * cell;
  let x1 = minX + (r.cx1 + 1) * cell;
  let y0 = minY + r.cy0 * cell;
  let y1 = minY + (r.cy1 + 1) * cell;

  // Полоса поиска — чуть больше ячейки: настоящий край лежит в соседней
  // ячейке стены, дальше искать вредно (на узком простенке поймаем соседнее
  // окно).
  const band = cell * 1.2;

  // Куда от края лежат измеряемые точки. У дырки стена СНАРУЖИ рамки:
  // у левого края — слева (sign +1). У острова точки — он сам — ВНУТРИ:
  // у левого края они справа (sign −1). Поправка на недобор при этом сама
  // меняет направление: край дырки доводится внутрь дырки, край острова —
  // наружу за крайнюю снятую точку. Ровно так и устроен настоящий край.
  const sLo: 1 | -1 = g.islands ? -1 : 1;
  const sHi: 1 | -1 = g.islands ? 1 : -1;

  // Два прохода. Первый уточняет стороны по грубым границам сетки, второй —
  // по уже уточнённым: вертикальные края ищутся в полосе, ограниченной
  // горизонтальными, и наоборот. После первого прохода эти ограничения
  // становятся точнее на ячейку, и края перестают цеплять откос сверху и
  // отлив снизу. Дальше третьего знака ничего не меняется — двух хватает.
  let sx0: EdgeFit = { value: x0, sigma: cell };
  let sx1: EdgeFit = { value: x1, sigma: cell };
  let sy0: EdgeFit = { value: y0, sigma: cell };
  let sy1: EdgeFit = { value: y1, sigma: cell };
  for (let pass = 0; pass < 2; pass++) {
    const inx = (x1 - x0) * 0.2;
    const iny = (y1 - y0) * 0.2;
    sx0 = refineEdge(g, 0, x0, y0 + iny, y1 - iny, band, sLo);
    x0 = sx0.value;
    sx1 = refineEdge(g, 0, x1, y0 + iny, y1 - iny, band, sHi);
    x1 = sx1.value;
    sy0 = refineEdge(g, 1, y0, x0 + inx, x1 - inx, band, sLo);
    y0 = sy0.value;
    sy1 = refineEdge(g, 1, y1, x0 + inx, x1 - inx, band, sHi);
    y1 = sy1.value;
    if (!(x1 > x0) || !(y1 > y0)) return null;
  }

  // Погрешность РАЗМЕРА складывается из двух независимых краёв.
  const hypot = (a: number, b: number) => Math.sqrt(a * a + b * b);
  const sigmaW = hypot(sx0.sigma, sx1.sigma);
  const sigmaH = hypot(sy0.sigma, sy1.sigma);

  /*
   * Предохранитель. Большой разброс рядов вдоль краёв означает, что края у
   * этой области рваные: съёмка неровная, или это вовсе не проём, а тень с
   * прямоугольным габаритом. Размер, посчитанный по такому краю, выглядит
   * как обмер, но им не является.
   *
   * Молча выдать неверную рамку хуже, чем не выдать никакой: человек
   * обведёт пропущенное сам, а неверную примет за измеренную. Сколько
   * отброшено — инструмент сообщает, чтобы это не выглядело как «не нашёл».
   */
  if (!trusted) {
    const w = x1 - x0;
    const h = y1 - y0;
    if ((sigmaW > w * 0.1 && sigmaW > 0.03) || (sigmaH > h * 0.1 && sigmaH > 0.03)) return null;
  }

  return { x0, y0, x1, y1, fill, sigmaW, sigmaH, grade: gradeOf(g, sigmaW, sigmaH, fill) };
}

/**
 * Качество складывается из двух независимых признаков, и берётся ХУДШИЙ:
 *
 *   разброс краёв  — насколько ровно легли точки вдоль сторон;
 *   прямоугольность — насколько область заполняет свой габарит.
 *
 * Одного мало. Тень от фуры даёт ровные края при рваной форме, а честное
 * окно за деревом — правильную форму при шумных краях. Плохо и то и другое.
 */
function gradeOf(g: WallGrid, sigmaW: number, sigmaH: number, fill: number): Grade {
  const rel = Math.max(sigmaW, sigmaH) / Math.max(g.spacing, 1e-4);
  const byEdge: Grade = rel <= 0.7 ? 'good' : rel <= 1.4 ? 'fair' : 'poor';
  const byForm: Grade = fill >= 0.93 ? 'good' : fill >= 0.86 ? 'fair' : 'poor';
  const rank = { good: 0, fair: 1, poor: 2 };
  return rank[byEdge] >= rank[byForm] ? byEdge : byForm;
}
