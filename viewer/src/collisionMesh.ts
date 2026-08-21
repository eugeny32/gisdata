import type { PcModule } from './types';
import { AXIS_FIX_ROTATION } from './constants';

/**
 * Коллайдер для Walk-режима (PR5, модуль 2.3) — загружает .collision.glb
 * (сгенерирован splat-transform -K, см. bin/splat_transform_worker.ps1) и
 * даёт простой raycast по треугольникам средствами CPU, БЕЗ физического
 * движка (ammo.js в проект не подключён — добавлять его только под Walk-
 * коллизии означало бы новую WASM-зависимость и свой CDN-importmap-вход,
 * сравнимый по сложности с тем, что уже понадобилось для laz-perf в PR4,
 * непропорционально ради одной фичи). Брутфорс по всем треугольникам —
 * приемлемо для отдельного здания/объекта (тысячи-десятки тысяч
 * треугольников), для очень крупных сцен может быть медленно — известное
 * ограничение этой первой версии Walk-режима.
 */
export interface CollisionMesh {
  /** Расстояние до первого пересечения луча с треугольником, или null. */
  raycast(origin: [number, number, number], direction: [number, number, number], maxDistance: number): number | null;
  dispose(): void;
}

export async function loadCollisionMesh(
  pc: PcModule,
  app: InstanceType<PcModule['Application']>,
  url: string
): Promise<CollisionMesh | null> {
  const asset = new pc.Asset('collision-mesh', 'container', { url });
  app.assets.add(asset);
  await new Promise<void>((resolve, reject) => {
    asset.on('load', () => resolve());
    asset.on('error', (err: unknown) => reject(new Error(String(err))));
    app.assets.load(asset);
  });

  // Коллайдер сгенерирован из исходного .ply, в его "родной" системе
  // координат — той же, в которой живёт сама сплат-сущность ДО применения
  // AXIS_FIX_ROTATION. Камера (и raycast ниже) работает в мировых
  // координатах ПОСЛЕ этого поворота — поэтому поворачиваем вершины
  // коллайдера один раз здесь, при загрузке, а не на каждый луч.
  const rotQuat = new pc.Quat(...(AXIS_FIX_ROTATION as [number, number, number, number]));
  const rotated = new pc.Vec3();

  // Треугольники собираем напрямую из ресурса контейнера — рендер-сущность
  // не создаём (коллайдер не должен быть виден, см. комментарий у типа выше).
  const triangles: number[] = [];
  const resource: any = asset.resource;
  for (const renderAsset of resource.renders ?? []) {
    const meshes = renderAsset.resource?.meshes ?? [];
    for (const mesh of meshes) {
      const positions: number[] = [];
      const indices: number[] = [];
      mesh.getPositions(positions);
      mesh.getIndices(indices);
      for (let i = 0; i < indices.length; i += 3) {
        const a = indices[i] * 3;
        const b = indices[i + 1] * 3;
        const c = indices[i + 2] * 3;
        for (const idx of [a, b, c]) {
          rotated.set(positions[idx], positions[idx + 1], positions[idx + 2]);
          rotQuat.transformVector(rotated, rotated);
          triangles.push(rotated.x, rotated.y, rotated.z);
        }
      }
    }
  }
  asset.unload();
  app.assets.remove(asset);

  if (triangles.length === 0) return null;
  const tri = new Float32Array(triangles);

  // Möller–Trumbore ray-triangle intersection, без выделений в горячем пути.
  function raycast(origin: [number, number, number], direction: [number, number, number], maxDistance: number): number | null {
    const [ox, oy, oz] = origin;
    const [dx, dy, dz] = direction;
    const EPS = 1e-7;
    let nearest: number | null = null;
    for (let i = 0; i < tri.length; i += 9) {
      const ax = tri[i], ay = tri[i + 1], az = tri[i + 2];
      const bx = tri[i + 3], by = tri[i + 4], bz = tri[i + 5];
      const cx = tri[i + 6], cy = tri[i + 7], cz = tri[i + 8];
      const e1x = bx - ax, e1y = by - ay, e1z = bz - az;
      const e2x = cx - ax, e2y = cy - ay, e2z = cz - az;
      const px = dy * e2z - dz * e2y;
      const py = dz * e2x - dx * e2z;
      const pz = dx * e2y - dy * e2x;
      const det = e1x * px + e1y * py + e1z * pz;
      if (Math.abs(det) < EPS) continue;
      const invDet = 1 / det;
      const tx = ox - ax, ty = oy - ay, tz = oz - az;
      const u = (tx * px + ty * py + tz * pz) * invDet;
      if (u < 0 || u > 1) continue;
      const qx = ty * e1z - tz * e1y;
      const qy = tz * e1x - tx * e1z;
      const qz = tx * e1y - ty * e1x;
      const v = (dx * qx + dy * qy + dz * qz) * invDet;
      if (v < 0 || u + v > 1) continue;
      const t = (e2x * qx + e2y * qy + e2z * qz) * invDet;
      if (t < EPS || t > maxDistance) continue;
      if (nearest === null || t < nearest) nearest = t;
    }
    return nearest;
  }

  return {
    raycast,
    dispose() {
      tri.fill(0);
    },
  };
}
