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
  /** units/сек — пока не используется (нет Fly/Walk), читается будущими PR2/PR5. */
  moveSpeed: number;
  pointSizePx: number;
  edlEnabled: boolean;
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
