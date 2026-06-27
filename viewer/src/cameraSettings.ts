/**
 * Настройки камеры (модуль 4 ТЗ) — общий мутируемый объект, который
 * читают и сцена (tourViewer.ts — применяет на живую камеру/материалы),
 * и UI панели настроек (map.php, через window.TourViewer.*Settings).
 * Persist в localStorage — простой способ "запомнить" между открытиями
 * тура/перезагрузками страницы без серверной части.
 *
 * `edlEnabled` — пока только флаг состояния, без реального шейдерного
 * эффекта (Eye-Dome Lighting — экранный постпроцесс по буферу глубины) —
 * сам эффект сознательно отложен на PR, где переписывается материал LAS
 * под переключаемые режимы раскраски (см. docs/CURRENT_STATE.md, PR6/PR4):
 * полноценный EDL не укладывается в "низкий риск" PR1.
 */
export interface CameraSettings {
  fov: number;
  nearClip: number;
  farClip: number;
  projection: 'perspective' | 'orthographic';
  orbitSensitivity: number;
  zoomSpeed: number;
  /** units/сек — скорость свободного полёта (FlyController, PR2); Walk
   * (PR5, с коллизиями через `-K`-коллайдер) использует то же поле. */
  moveSpeed: number;
  pointSizePx: number;
  edlEnabled: boolean;
  /** 'walk' — тот же FlyController, но с коллизиями по `-K`-коллайдеру
   * (PR5). Если для тура нет готового .collision.glb (не сплат-тур или
   * конвертация ещё не завершилась), молча работает как 'fly' — см.
   * tourViewer.ts/updateFlyCollision. */
  navigationMode: 'orbit' | 'fly' | 'walk';
  /** Режим раскраски LAS/COPC (PR6) — переключается без перезагрузки
   * файла (см. pointCloudMaterial.ts). Для 3DGS-сплатов не действует —
   * см. ограничение в pointCloudMaterial.ts. */
  colorMode: 'rgb' | 'height' | 'intensity' | 'classification';
  /** Сечения (PR7, модуль 5) — box-crop LAS/COPC. clipMin/clipMax — доли
   * (0..1) по каждой оси, ОБЩИЕ для всех материалов тура; каждый материал
   * переводит их в свои локальные единицы по собственному AABB (см.
   * pointCloudMaterial.ts/setPointCloudClip) — "обрезать нижние 30%"
   * означает нижние 30% КАЖДОГО облака, а не абсолютные координаты. Для
   * 3DGS не действует (та же причина, что height-режим, см. раздел 13). */
  clipEnabled: boolean;
  clipMin: [number, number, number];
  clipMax: [number, number, number];
  /** Индикатор FPS/VRAM/стриминга в углу канваса (PR8). */
  showStats: boolean;
  /** Бюджет точек для COPC-стриминга (см. copcLoader.ts) — регулировка в
   * духе Potree ("Point Budget"): чем выше, тем подробнее картинка и выше
   * нагрузка на GPU/память. Живой параметр — copcLoader.ts читает его
   * каждый тик обновления, перезагрузка тура не нужна. */
  pointBudget: number;
  /** Сечение по линии — задаётся 2 кликами по модели (см. map.php,
   * window.TourViewer.pickPoint), а не слайдерами как clipMin/Max выше.
   * normal/d — уравнение плоскости (dot(p, normal) <= d — видимая
   * сторона) в локальном пространстве модели, общем для ВСЕХ материалов
   * тура (см. setPointCloudSection). */
  sectionEnabled: boolean;
  sectionNormal: [number, number, number];
  sectionD: number;
}

export const DEFAULT_CAMERA_SETTINGS: CameraSettings = {
  fov: 45,
  nearClip: 0.05,
  farClip: 5000,
  projection: 'perspective',
  orbitSensitivity: 1,
  zoomSpeed: 1,
  moveSpeed: 5,
  pointSizePx: 2,
  edlEnabled: false,
  navigationMode: 'orbit',
  colorMode: 'rgb',
  clipEnabled: false,
  clipMin: [0, 0, 0],
  clipMax: [1, 1, 1],
  showStats: false,
  pointBudget: 10_000_000,
  sectionEnabled: false,
  sectionNormal: [1, 0, 0],
  sectionD: 0,
};

const STORAGE_KEY = 'gisdata.tourViewer.cameraSettings.v1';

function loadFromStorage(): CameraSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_CAMERA_SETTINGS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CAMERA_SETTINGS, ...parsed };
  } catch (e) {
    return { ...DEFAULT_CAMERA_SETTINGS };
  }
}

export const cameraSettings: CameraSettings = loadFromStorage();

type Listener = (settings: CameraSettings) => void;
const listeners: Listener[] = [];

/** Возвращает функцию отписки — вызывающий код (tourViewer.ts) обязан её
 * дёрнуть при disposeTourViewer(), иначе при повторных открытиях тура
 * накопятся "мёртвые" слушатели на уже уничтоженные камеры/материалы. */
export function onCameraSettingsChange(listener: Listener): () => void {
  listeners.push(listener);
  return () => {
    const i = listeners.indexOf(listener);
    if (i !== -1) listeners.splice(i, 1);
  };
}

export function setCameraSettings(partial: Partial<CameraSettings>): CameraSettings {
  Object.assign(cameraSettings, partial);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cameraSettings));
  } catch (e) {
    /* noop — приватный режим браузера и т.п., настройки просто не переживут перезагрузку */
  }
  for (const listener of listeners) listener(cameraSettings);
  return cameraSettings;
}

export function getCameraSettings(): CameraSettings {
  return cameraSettings;
}
