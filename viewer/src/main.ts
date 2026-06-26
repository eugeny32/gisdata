import { loadTourScene, disposeTourViewer, recenterTourCamera, showViewerError, hideViewerError } from './tourViewer';
import { getCameraSettings, setCameraSettings, type CameraSettings } from './cameraSettings';
import type { ModelType } from './types';

/**
 * Точка входа бандла — публичный API для map.php (и в будущем
 * playcanvas_test.php, после переноса той страницы на эту же сборку).
 * map.php подключает собранный файл как
 * `<script type="module" src="/assets/viewer/tour-viewer.js"></script>`
 * и обращается к window.TourViewer.* вместо прежних глобальных функций
 * (loadTourScenePlayCanvas/disposePcViewer/pcApp._gisdata.recenter()).
 */
export interface TourViewerApi {
  load(urls: string[], modelType: ModelType): Promise<void>;
  dispose(): void;
  recenter(): void;
  showError(message: string): void;
  hideError(): void;
  getSettings(): CameraSettings;
  setSettings(partial: Partial<CameraSettings>): CameraSettings;
}

const api: TourViewerApi = {
  load: loadTourScene,
  dispose: disposeTourViewer,
  recenter: recenterTourCamera,
  showError: showViewerError,
  hideError: hideViewerError,
  getSettings: getCameraSettings,
  setSettings: setCameraSettings,
};

declare global {
  interface Window {
    TourViewer: TourViewerApi;
  }
}

window.TourViewer = api;
