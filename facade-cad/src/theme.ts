/**
 * Цвета трёхмерной сцены берутся из тех же CSS-токенов, что и весь интерфейс.
 *
 * Иначе тема живёт в двух местах сразу: фон окон, сетка и подсветка среза
 * задавались числами прямо в коде — и при смене темы панели уходили в уголь,
 * а чертёж оставался сидеть на графите с зеленцой. Разницу видно сразу: сцена
 * занимает почти весь экран, и «почти тот же чёрный» читается как грязь.
 *
 * Токены объявлены в src/style.css, блоком `:root`. Читаются один раз при
 * сборке сцены: тема на ходу не меняется, слушать изменения незачем.
 */

const read = (name: string): string =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/**
 * Значение токена как 0xRRGGBB. Понимает обе записи, которые есть в теме:
 * `#0b0c0d` (фон) и `102 168 255` (акцент — он хранится тройкой, чтобы CSS
 * мог подмешивать альфу через `rgb(var(--accent) / 0.5)`).
 */
export function token(name: string, fallback: number): number {
  const v = read(name);
  if (!v) return fallback;

  if (v.startsWith('#')) {
    const h = v.slice(1);
    const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h;
    const n = Number.parseInt(full, 16);
    return Number.isFinite(n) && full.length === 6 ? n : fallback;
  }

  const p = v.split(/[\s,/]+/).map(Number);
  return p.length >= 3 && p.slice(0, 3).every((x) => Number.isFinite(x))
    ? ((p[0] & 255) << 16) | ((p[1] & 255) << 8) | (p[2] & 255)
    : fallback;
}

/** Тот же цвет темнее (k < 0) или светлее (k > 0), |k| ≤ 1. */
export function shade(hex: number, k: number): number {
  const f = (c: number) =>
    Math.max(0, Math.min(255, Math.round(k < 0 ? c * (1 + k) : c + (255 - c) * k)));
  return (f((hex >> 16) & 255) << 16) | (f((hex >> 8) & 255) << 8) | f(hex & 255);
}
