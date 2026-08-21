/**
 * Ribbon — data-driven ribbon layout with user customization.
 *
 * Every ribbon button is a registry entry (icon, caption, tool-or-action);
 * the panel layout is a plain JSON model the user can rearrange by drag &
 * drop in edit mode. Persistence goes through load/saveRibbonLayout — one
 * point to swap localStorage for a server API when the app moves online.
 *
 * Icons are inline SVG on a 24×24 grid, stroked with `currentColor` (see
 * .tool-btn svg in style.css) — no icon font, no sprite sheet, and the
 * accent colour of the active button flows straight into the artwork.
 * They are drawn for THIS domain: the survey area is a lasso over ground,
 * the UCS is a chainage axis, the datum is a levelling benchmark, and the
 * elevation tool is a height callout — not their facade counterparts.
 */

export interface RibbonButtonDef {
  id: string;
  /** Drafting tool id (ToolManager) — mutually exclusive with `action`. */
  tool?: string;
  /** UI action id routed by UI.runAction(). */
  action?: string;
  /** Stable DOM id (external automation / tests rely on these). */
  domId?: string;
  label: string;
  title: string;
  /** Inner SVG markup for the 24×24 viewBox icon. */
  icon: string;
}

export const RIBBON_BUTTONS: readonly RibbonButtonDef[] = [
  // ── подготовка ───────────────────────────────────────────────────────
  {
    id: 'isolate',
    tool: 'isolate',
    label: 'Участок',
    title: 'Шаг 1: обвести участок лассо на плане',
    icon: '<path d="M4.5 13.5 9 6l7.5-1.5 3.5 6.5-3 8-10 1.5z" stroke-dasharray="3 2.4" /><circle cx="4.5" cy="13.5" r="1.3" /><circle cx="9" cy="6" r="1.3" />',
  },
  {
    id: 'ucs',
    tool: 'ucs',
    label: 'Ось',
    title: 'Шаг 2: ось (ПСК) по двум точкам — вдоль трассы или разбивки',
    icon: '<path d="M3 19 21 7" /><path d="M17.4 5.6 21 7l-1.2 3.7" /><path d="M6.2 18.2 7.4 20.6M10.4 15.4l1.2 2.4M14.6 12.6l1.2 2.4" />',
  },
  // ── черчение ─────────────────────────────────────────────────────────
  {
    id: 'line',
    tool: 'line',
    label: 'Отрезок',
    title: 'Отрезок: две точки или длина цифрами',
    icon: '<path d="M5.5 18.5 18.5 5.5" /><circle cx="5.5" cy="18.5" r="1.6" /><circle cx="18.5" cy="5.5" r="1.6" />',
  },
  {
    id: 'polyline',
    tool: 'polyline',
    label: 'Плиния',
    title: 'Полилиния: бровка, кромка, горизонталь — Enter завершить, C замкнуть',
    icon: '<path d="M3 17.5 8 9l4.5 4.5L16 6.5 21 11" /><circle cx="8" cy="9" r="1.2" /><circle cx="12.5" cy="13.5" r="1.2" /><circle cx="16" cy="6.5" r="1.2" />',
  },
  {
    id: 'rect',
    tool: 'rect',
    label: 'Прямоуг',
    title: 'Прямоугольник по двум углам (или ширина,высота)',
    icon: '<rect x="4.5" y="7" width="15" height="10.5" rx="1" />',
  },
  { id: 'circle', tool: 'circle', label: 'Круг', title: 'Окружность: центр + радиус (или радиус цифрами)', icon: '<circle cx="12" cy="12" r="7.8" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />' },
  { id: 'arc', tool: 'arc', label: 'Дуга', title: 'Дуга по трём точкам', icon: '<path d="M4 17.5a8 8 0 0 1 16 0" /><circle cx="4" cy="17.5" r="1.3" /><circle cx="20" cy="17.5" r="1.3" />' },
  { id: 'ellipse', tool: 'ellipse', label: 'Эллипс', title: 'Эллипс: центр + угловая точка (или rx,ry)', icon: '<ellipse cx="12" cy="12" rx="8.5" ry="5.5" />' },
  { id: 'text', tool: 'text', label: 'Текст', title: 'Текстовая надпись', icon: '<path d="M5.5 6.5h13" /><path d="M12 6.5v12" /><path d="M9 18.5h6" />' },
  {
    id: 'point',
    tool: 'point',
    label: 'Точка',
    title: 'Съёмочная точка по клику (с привязкой к скану)',
    icon: '<path d="M12 5.8 18.2 12 12 18.2 5.8 12z" /><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />',
  },
  // ── отметки ──────────────────────────────────────────────────────────
  {
    id: 'refplane',
    tool: 'refplane',
    label: 'Горизонт',
    title: 'Нулевой горизонт для отметок: клик по точке земли',
    icon: '<path d="M2.5 15.5h19" stroke-dasharray="3 2.2" /><path d="M12 15.5 8.6 9.8h6.8z" fill="currentColor" stroke="none" /><path d="M12 15.5v4" /><path d="M4.5 19.5h4M15.5 19.5h4" opacity=".55" />',
  },
  {
    id: 'deviation',
    tool: 'deviation',
    label: 'Отметка',
    title: 'Отметка точки: превышение над горизонтом, + выше / − ниже',
    icon: '<path d="M2.5 18.5h19" stroke-dasharray="3 2.2" /><path d="M7 18.5V6.5" /><path d="M4.4 9.1 7 6.5l2.6 2.6" /><path d="M12.5 9.5h8M12.5 13h5.5" />',
  },
  // ── правка ───────────────────────────────────────────────────────────
  { id: 'select', tool: 'select', label: 'Выбор', title: 'Выбор: клик по объекту, Ctrl добавить, рамка', icon: '<path d="M7 3.6 18.5 14.2l-5.6.4 2.9 5.4-2.4 1.2-2.8-5.5L7 19.4z" />' },
  {
    id: 'move',
    tool: 'move',
    label: 'Перенос',
    title: 'Перенос: базовая → целевая (или расстояние цифрами)',
    icon: '<path d="M12 3v18M3 12h18" /><path d="M9.6 5.4 12 3l2.4 2.4M9.6 18.6 12 21l2.4-2.4M5.4 9.6 3 12l2.4 2.4M18.6 9.6 21 12l-2.4 2.4" />',
  },
  { id: 'copy', tool: 'copy', label: 'Копия', title: 'Мультикопия до Esc', icon: '<rect x="8.5" y="8.5" width="11" height="11" rx="1.5" /><path d="M15.5 5H5a.5.5 0 0 0-.5.5V16" />' },
  { id: 'rotate', tool: 'rotate', label: 'Поворот', title: 'Поворот вокруг базовой точки (угол цифрами в °)', icon: '<path d="M19.5 12a7.5 7.5 0 1 1-7.5-7.5" /><path d="M9 2.2 12 4.5 9 6.8" /><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />' },
  { id: 'scale', tool: 'scale', label: 'Масштаб', title: 'Масштаб от базовой точки (коэффициент цифрами)', icon: '<rect x="3.5" y="13" width="7.5" height="7.5" rx="1" /><path d="M11 13 20.5 3.5M14.5 3.5h6v6" />' },
  { id: 'mirror', tool: 'mirror', label: 'Зеркало', title: 'Зеркальная копия относительно оси из двух точек', icon: '<path d="M12 2.8v18.4" stroke-dasharray="3 2.4" /><path d="M8.6 7.5 4 15.5h4.6zM15.4 7.5 20 15.5h-4.6z" />' },
  { id: 'trim', tool: 'trim', label: 'Ножницы', title: 'Ножницы: вырезать участок до ближайших пересечений', icon: '<circle cx="6" cy="6.5" r="2.4" /><circle cx="6" cy="17.5" r="2.4" /><path d="M8.1 7.9 20.5 18M8.1 16.1 20.5 6" />' },
  {
    id: 'join',
    tool: 'join',
    label: 'Соедин',
    title: 'Соединить две линии с совпадающими концами',
    icon: '<path d="M9 12h6" /><path d="M3.5 12a4 4 0 0 1 4-4h2M3.5 12a4 4 0 0 0 4 4h2M20.5 12a4 4 0 0 0-4-4h-2M20.5 12a4 4 0 0 1-4 4h-2" />',
  },
  { id: 'erase', action: 'erase', domId: 'btn-erase', label: 'Удалить', title: 'Удалить выбранное (Del)', icon: '<path d="M4.5 7h15M10 7V4.8h4V7M6.8 7l1 12.2h8.4L17.2 7" /><path d="M10.3 10.5v5.5M13.7 10.5v5.5" opacity=".6" />' },
  // ── оформление ───────────────────────────────────────────────────────
  { id: 'layers', action: 'layers', domId: 'btn-layers', label: 'Слои', title: 'Слои: цвета, типы линий, толщины', icon: '<path d="m12 3.2 8.5 4.3-8.5 4.3-8.5-4.3z" /><path d="m3.5 12 8.5 4.3 8.5-4.3" /><path d="m3.5 16.3 8.5 4.3 8.5-4.3" />' },
  {
    id: 'help',
    action: 'help',
    domId: 'btn-help',
    label: 'Справка',
    title: 'Руководство пользователя (F1)',
    icon: '<circle cx="12" cy="12" r="9" /><path d="M9.3 9.2a2.8 2.8 0 1 1 3.2 3.3v1.6" /><circle cx="12.4" cy="17.2" r="1.05" fill="currentColor" stroke="none" />',
  },
  { id: 'undo', action: 'undo', domId: 'btn-undo', label: 'Отменить', title: 'Отменить (Ctrl+Z)', icon: '<path d="M4.5 9.5h10a4.8 4.8 0 0 1 0 9.6h-3.5" /><path d="M8 5.8 4.3 9.5 8 13.2" />' },
  { id: 'redo', action: 'redo', domId: 'btn-redo', label: 'Вернуть', title: 'Вернуть (Ctrl+Y)', icon: '<path d="M19.5 9.5h-10a4.8 4.8 0 0 0 0 9.6H13" /><path d="M16 5.8l3.7 3.7L16 13.2" />' },
  // ── обмен ────────────────────────────────────────────────────────────
  {
    id: 'import',
    action: 'import',
    domId: 'btn-import',
    label: 'Импорт',
    title: 'Импорт облака: LAS, LAZ, E57 или ASCII (x y z [r g b])',
    icon: '<path d="M12 3.5v9.5" /><path d="M8.4 9.6 12 13.2l3.6-3.6" /><path d="M4 15.5v4h16v-4" /><circle cx="7" cy="6" r=".9" fill="currentColor" stroke="none" /><circle cx="17" cy="7.5" r=".9" fill="currentColor" stroke="none" />',
  },
  { id: 'dxf', action: 'dxf', domId: 'btn-dxf', label: 'DXF', title: 'Экспорт чертежа в DXF (выбранное или всё)', icon: '<path d="M6.5 3h7l4.5 4.5V21h-11.5z" /><path d="M13.5 3v4.5H18" /><path d="M8.8 12.5h1.6a2 2 0 0 1 0 4H8.8zM14 12.5v4M14 12.5h2.6M14 14.5h2" />' },
  { id: 'tocad', action: 'tocad', domId: 'btn-tocad', label: 'ToCad', title: 'Отправить в AutoCAD (или скопировать скрипт)', icon: '<path d="M3 12h10.5" /><path d="M10 8.5 13.5 12 10 15.5" /><path d="M16 4.5h4.5v15H16" />' },
];

export const RIBBON_BUTTON_MAP: ReadonlyMap<string, RibbonButtonDef> = new Map(RIBBON_BUTTONS.map((b) => [b.id, b]));

export interface RibbonGroup {
  title: string;
  buttons: string[];
}

export const DEFAULT_RIBBON: readonly RibbonGroup[] = [
  { title: 'Подготовка', buttons: ['isolate', 'ucs'] },
  { title: 'Черчение', buttons: ['line', 'polyline', 'rect', 'circle', 'arc', 'ellipse', 'text', 'point'] },
  { title: 'Отметки', buttons: ['refplane', 'deviation'] },
  { title: 'Правка', buttons: ['select', 'move', 'copy', 'rotate', 'scale', 'mirror', 'trim', 'join', 'erase'] },
  { title: 'Оформление', buttons: ['layers', 'undo', 'redo', 'help'] },
  { title: 'Обмен', buttons: ['import', 'dxf', 'tocad'] },
];

const STORAGE_KEY = 'topocad.ribbon';

function cloneDefault(): RibbonGroup[] {
  return DEFAULT_RIBBON.map((g) => ({ title: g.title, buttons: [...g.buttons] }));
}

/** Load the saved layout; unknown ids are dropped, buttons ADDED to the app
 *  since the layout was saved are appended to their default panel so no
 *  feature ever silently disappears. */
export function loadRibbonLayout(): RibbonGroup[] {
  let groups: RibbonGroup[] | null = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as RibbonGroup[];
      if (Array.isArray(parsed) && parsed.length) {
        groups = parsed
          .filter((g) => g && typeof g.title === 'string' && Array.isArray(g.buttons))
          .map((g) => ({ title: g.title, buttons: g.buttons.filter((id) => RIBBON_BUTTON_MAP.has(id)) }));
      }
    }
  } catch {
    /* corrupted storage — fall through to default */
  }
  if (!groups || !groups.length) return cloneDefault();

  const present = new Set(groups.flatMap((g) => g.buttons));
  for (const def of DEFAULT_RIBBON) {
    for (const id of def.buttons) {
      if (present.has(id)) continue;
      const home = groups.find((g) => g.title === def.title) ?? groups[groups.length - 1];
      home.buttons.push(id);
      present.add(id);
    }
  }
  return groups;
}

/** Persist the layout (localStorage now, server API later — one call site). */
export function saveRibbonLayout(groups: readonly RibbonGroup[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  } catch {
    /* quota/denied — non-fatal */
  }
}

export function resetRibbonLayout(): RibbonGroup[] {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  return cloneDefault();
}
