import type { PcModule } from './types';
import { AXIS_FIX_ROTATION } from './constants';

/**
 * Загрузка 3DGS-сплат-файлов (.ply) через нативный gsplat-пайплайн
 * PlayCanvas. Перенесено 1:1 из map.php (PR0) — порт без изменения
 * поведения; переход на SOG/streamed-LOD — отдельная задача (см.
 * docs/CURRENT_STATE.md, раздел 11, PR5).
 */
export async function loadSplatFiles(
  pc: PcModule,
  app: InstanceType<PcModule['Application']>,
  urls: string[],
  target: InstanceType<PcModule['Vec3']>,
  setDistance: (d: number) => void,
  updateCameraTransform: () => void,
  isCurrent: () => boolean,
  showProgress: (text: string, pct: number) => void
): Promise<void> {
  let fileIndex = 0;
  for (const url of urls) {
    if (!isCurrent()) return;
    fileIndex++;
    const filePrefix = urls.length > 1 ? `Файл ${fileIndex} из ${urls.length}: ` : '';
    showProgress(`${filePrefix}Загрузка модели...`, 0);

    await new Promise<void>((resolve, reject) => {
      const asset = new pc.Asset('splat-' + fileIndex, 'gsplat', { url, filename: url.split('/').pop() });
      app.assets.add(asset);
      asset.on('progress', (received: number, total: number) => {
        const pct = total ? (received / total) * 100 : 0;
        showProgress(`${filePrefix}Загрузка модели... ${Math.round(pct)}%`, pct);
      });
      asset.on('error', (err: unknown) => reject(new Error(String(err))));
      asset.on('load', () => {
        if (!isCurrent()) {
          resolve();
          return;
        }
        const resource: any = asset.resource;
        const entity = new pc.Entity('splat-' + fileIndex);
        entity.setLocalRotation(...(AXIS_FIX_ROTATION as [number, number, number, number]));
        entity.addComponent('gsplat', { asset });
        app.root.addChild(entity);

        // Центрирование/панорамирование — по точке "наибольшей плотности"
        // только первого файла: calcFocalPoint встроен в движок и
        // взвешивает каждый сплат по обратной величине его размера
        // (мелкие/плотные сплаты весят больше крупных фоновых/выбросов),
        // а не по геометрическому центру bounding box.
        if (fileIndex === 1) {
          const aabb = resource && resource.aabb;
          if (resource && resource.gsplatData && typeof resource.gsplatData.calcFocalPoint === 'function') {
            const focal = new pc.Vec3();
            resource.gsplatData.calcFocalPoint(focal);
            entity.getWorldTransform().transformPoint(focal, focal);
            target.copy(focal);
          } else if (aabb) {
            target.copy(aabb.center);
          }
          if (aabb) setDistance(Math.max(aabb.halfExtents.length() * 1.3, 0.5));
          updateCameraTransform();
        }
        resolve();
      });
      app.assets.load(asset);
    });
  }
}
