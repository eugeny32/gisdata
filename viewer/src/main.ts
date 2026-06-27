import {
  loadTourScene,
  disposeTourViewer,
  recenterTourCamera,
  showViewerError,
  hideViewerError,
  pickTourPoint,
  pickTourGroundPoint,
  pickTourAnnotationVertex,
  setTourAnnotationLayers,
  setTourDrawingPreview,
} from './tourViewer';
import { getCameraSettings, setCameraSettings, type CameraSettings } from './cameraSettings';
import type { ModelType } from './types';
import type { AnnotationLayerData, VertexHit } from './annotations';

/**
 * Точка входа бандла — публичный API для map.php (и в будущем
 * playcanvas_test.php, после переноса той страницы на эту же сборку).
 * map.php подключает собранный файл как
 * `<script type="module" src="/assets/viewer/tour-viewer.js"></script>`
 * и обращается к window.TourViewer.* вместо прежних глобальных функций
 * (loadTourScenePlayCanvas/disposePcViewer/pcApp._gisdata.recenter()).
 */
export interface TourViewerApi {
  load(
    urls: string[],
    modelType: ModelType,
    copcUrls?: (string | null)[],
    sogUrls?: (string | null)[],
    collisionUrl?: string | null
  ): Promise<void>;
  dispose(): void;
  recenter(): void;
  showError(message: string): void;
  hideError(): void;
  getSettings(): CameraSettings;
  setSettings(partial: Partial<CameraSettings>): CameraSettings;
  pickPoint(clientX: number, clientY: number): [number, number, number] | null;
  pickGroundPoint(clientX: number, clientY: number): [number, number, number] | null;
  pickAnnotationVertex(clientX: number, clientY: number): VertexHit | null;
  setAnnotationLayers(layers: AnnotationLayerData[]): void;
  setDrawingPreview(points: [number, number, number][] | null, color: string): void;
}

const api: TourViewerApi = {
  load: loadTourScene,
  dispose: disposeTourViewer,
  recenter: recenterTourCamera,
  showError: showViewerError,
  hideError: hideViewerError,
  getSettings: getCameraSettings,
  setSettings: setCameraSettings,
  pickPoint: pickTourPoint,
  pickGroundPoint: pickTourGroundPoint,
  pickAnnotationVertex: pickTourAnnotationVertex,
  setAnnotationLayers: setTourAnnotationLayers,
  setDrawingPreview: setTourDrawingPreview,
};

declare global {
  interface Window {
    TourViewer: TourViewerApi;
  }
}

window.TourViewer = api;
