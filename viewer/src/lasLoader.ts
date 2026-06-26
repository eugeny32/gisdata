import type { PcModule } from './types';
import { AXIS_FIX_ROTATION } from './constants';

/** pc.Color не умеет HSL — конвертируем сами (стандартная формула), нужно
 * для окраски LAS-точек по высоте, когда в файле нет реального RGB. */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const k = (n: number) => (n + h * 12) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)];
}

/**
 * Точечное облако (LAS) рисуется собственным шейдером — стандартный
 * материал PlayCanvas не выставляет gl_PointSize для PRIMITIVE_POINTS.
 * matrix_model/matrix_viewProjection — встроенные имена uniform'ов движка
 * (engine/src/scene/renderer/renderer.js, scope.resolve('matrix_model')),
 * не наша придумка.
 */
function createPointCloudMaterial(pc: PcModule, pointSizePx: number) {
  const material = new pc.ShaderMaterial({
    uniqueName: 'GisdataLasPointCloudShader',
    attributes: { aPosition: pc.SEMANTIC_POSITION, aColor: pc.SEMANTIC_COLOR },
    vertexGLSL: `
      attribute vec3 aPosition;
      attribute vec4 aColor;
      uniform mat4 matrix_model;
      uniform mat4 matrix_viewProjection;
      uniform float uPointSize;
      varying vec4 vColor;
      void main(void) {
        vColor = aColor;
        vec4 worldPos = matrix_model * vec4(aPosition, 1.0);
        gl_Position = matrix_viewProjection * worldPos;
        gl_PointSize = uPointSize;
      }
    `,
    fragmentGLSL: `
      precision mediump float;
      varying vec4 vColor;
      void main(void) {
        gl_FragColor = vColor;
      }
    `,
  });
  material.setParameter('uPointSize', pointSizePx);
  material.update();
  return material;
}

/**
 * Скачивание с реальным прогрессом по байтам (Content-Length) — один
 * fetch, затем parse() из готового ArrayBuffer (не URL) — двойная закачка
 * той же урлы (один раз вручную для процента, второй раз внутри load())
 * была причиной нестабильности между открытиями одного тура.
 */
async function fetchWithProgress(url: string, onProgress: (received: number, total: number) => void): Promise<ArrayBuffer> {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error('HTTP ' + resp.status);
  const total = Number(resp.headers.get('content-length')) || 0;
  const reader = resp.body!.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    onProgress(received, total);
  }
  const buf = new Uint8Array(received);
  let offset = 0;
  for (const c of chunks) {
    buf.set(c, offset);
    offset += c.length;
  }
  return buf.buffer;
}

/**
 * Загрузка LAS-облаков точек через @loaders.gl/las. Перенесено 1:1 из
 * map.php (PR0) — порт без изменения поведения; переход на
 * пространственную индексацию (COPC/Potree-октодерево) — отдельная
 * задача (см. docs/CURRENT_STATE.md, раздел 11, PR4) — этот загрузчик
 * пока продолжает скачивать файл целиком, без частичной загрузки по
 * области видимости.
 */
export async function loadLasFiles(
  pc: PcModule,
  app: InstanceType<PcModule['Application']>,
  urls: string[],
  // Не используется: LAS-точки центрируются вычитанием centerOffset прямо
  // из позиций (камера ориентируется на мировой (0,0,0)), в отличие от
  // loadSplatFiles. Параметр оставлен ради одинаковой подписи у обоих
  // загрузчиков (tourViewer.ts вызывает их единообразно).
  _target: InstanceType<PcModule['Vec3']>,
  setDistance: (d: number) => void,
  updateCameraTransform: () => void,
  isCurrent: () => boolean,
  showProgress: (text: string, pct: number) => void,
  pointSizePx: number,
  /** Материалы складываются сюда, чтобы Settings Panel (PR1) могла менять
   * размер точки на лету (setParameter('uPointSize', ...)) без перезагрузки
   * файла — см. tourViewer.ts. */
  outMaterials: InstanceType<PcModule['ShaderMaterial']>[]
): Promise<void> {
  const { parse } = await import('@loaders.gl/core');
  const { LASLoader } = await import('@loaders.gl/las');

  let centerOffset: { x: number; y: number; z: number } | null = null;
  let extent = 1;
  let fileIndex = 0;

  for (const url of urls) {
    if (!isCurrent()) return;
    fileIndex++;
    const filePrefix = urls.length > 1 ? `Файл ${fileIndex} из ${urls.length}: ` : '';

    const buffer = await fetchWithProgress(url, (received, total) => {
      const pct = total ? (received / total) * 100 : 0;
      showProgress(`${filePrefix}Загрузка LAS... ${Math.round(pct)}%`, pct);
    });
    if (!isCurrent()) return;
    showProgress(`${filePrefix}Разбор LAS...`, 100);
    // worker:true (по умолчанию) — synchronous-режим разбора блокирует
    // requestAnimationFrame на десятки секунд на больших файлах.
    const data: any = await parse(buffer, LASLoader as any);
    if (!isCurrent()) return;

    const posAttr = data.attributes && data.attributes.POSITION;
    if (!posAttr) continue;
    const pos: Float32Array = posAttr.value;
    const count = pos.length / 3;

    if (!centerOffset) {
      // Среднее + 3σ, а не min/max — устойчиво к единичным выбросам
      // парсера (один и тот же файл давал extent от 15 до 1 000 000+ между
      // открытиями при расчёте по min/max).
      let sumX = 0;
      let sumY = 0;
      let sumZ = 0;
      for (let i = 0; i < count; i++) {
        sumX += pos[i * 3];
        sumY += pos[i * 3 + 1];
        sumZ += pos[i * 3 + 2];
      }
      const meanX = sumX / count;
      const meanY = sumY / count;
      const meanZ = sumZ / count;
      let varX = 0;
      let varY = 0;
      let varZ = 0;
      for (let i = 0; i < count; i++) {
        varX += (pos[i * 3] - meanX) ** 2;
        varY += (pos[i * 3 + 1] - meanY) ** 2;
        varZ += (pos[i * 3 + 2] - meanZ) ** 2;
      }
      const stdX = Math.sqrt(varX / count);
      const stdY = Math.sqrt(varY / count);
      const stdZ = Math.sqrt(varZ / count);
      centerOffset = { x: meanX, y: meanY, z: meanZ };
      extent = Math.max(stdX, stdY, stdZ, 1) * 3;
      setDistance(Math.max(extent * 1.8, 0.5));
      updateCameraTransform();
    }

    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = pos[i * 3] - centerOffset.x;
      positions[i * 3 + 1] = pos[i * 3 + 1] - centerOffset.y;
      positions[i * 3 + 2] = pos[i * 3 + 2] - centerOffset.z;
    }

    // Реальный цвет есть не у всех LAS (лазерные сканеры без встроенной
    // камеры дают R=G=B=0 везде, альфа всегда 255) — это не баг чтения, а
    // отсутствие цвета в самом файле; тогда красим по высоте (Z).
    const colorAttr = data.attributes.COLOR_0 && data.attributes.COLOR_0.value;
    const colors = new Uint8Array(count * 4);
    let hasRealColor = false;
    if (colorAttr) {
      const size = data.attributes.COLOR_0.size || 4;
      let maxRGB = 0;
      for (let i = 0; i < count; i++) {
        const r = colorAttr[i * size];
        const g = colorAttr[i * size + 1];
        const b = colorAttr[i * size + 2];
        if (r > maxRGB) maxRGB = r;
        if (g > maxRGB) maxRGB = g;
        if (b > maxRGB) maxRGB = b;
      }
      hasRealColor = maxRGB > 0;
    }
    if (hasRealColor) {
      const size = data.attributes.COLOR_0.size || 4;
      for (let i = 0; i < count; i++) {
        colors[i * 4] = colorAttr[i * size];
        colors[i * 4 + 1] = colorAttr[i * size + 1];
        colors[i * 4 + 2] = colorAttr[i * size + 2];
        colors[i * 4 + 3] = 255;
      }
    } else {
      for (let i = 0; i < count; i++) {
        const t = Math.max(0, Math.min(1, (positions[i * 3 + 2] + extent) / (2 * extent)));
        const [r, g, b] = hslToRgb((1 - t) * 0.66, 0.8, 0.5);
        colors[i * 4] = Math.round(r * 255);
        colors[i * 4 + 1] = Math.round(g * 255);
        colors[i * 4 + 2] = Math.round(b * 255);
        colors[i * 4 + 3] = 255;
      }
    }

    const mesh = new pc.Mesh(app.graphicsDevice);
    mesh.setPositions(positions);
    mesh.setColors32(colors);
    mesh.update(pc.PRIMITIVE_POINTS, true);
    const material = createPointCloudMaterial(pc, pointSizePx);
    outMaterials.push(material);
    const meshInstance = new pc.MeshInstance(mesh, material);
    const entity = new pc.Entity('las-' + fileIndex);
    entity.setLocalRotation(...(AXIS_FIX_ROTATION as [number, number, number, number]));
    entity.addComponent('render', { meshInstances: [meshInstance] });
    app.root.addChild(entity);
  }
}
