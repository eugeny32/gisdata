import type { PcModule } from './types';

/**
 * Режимы раскраски (PR6, модуль 3) для LAS/COPC — переключаются uniform'ом
 * uColorMode, БЕЗ пересборки вершинного буфера: все варианты (реальный
 * RGB, высота, intensity, classification) считаются в фрагментном шейдере
 * из уже загруженных атрибутов (aColor — реальный RGB, aTexCoord0.x —
 * intensity 0..1, aTexCoord0.y — classification как есть; высота — из
 * самой позиции вершины). Для 3DGS высотный режим НЕ реализован в этом PR
 * — gsplat использует собственный генерируемый шейдер движка (work-buffer/
 * GPU-сортировка, см. gsplat-resource-base.js), и его патчинг ради одного
 * режима раскраски — отдельная, более рискованная задача, не сделанная
 * здесь сознательно (см. docs/CURRENT_STATE.md, раздел 12/13).
 */
export type ColorMode = 'rgb' | 'height' | 'intensity' | 'classification';

const COLOR_MODE_INDEX: Record<ColorMode, number> = {
  rgb: 0,
  height: 1,
  intensity: 2,
  classification: 3,
};

/**
 * Точечное облако (LAS/COPC) рисуется собственным шейдером — стандартный
 * материал PlayCanvas не выставляет gl_PointSize для PRIMITIVE_POINTS.
 * matrix_model/matrix_viewProjection — встроенные имена uniform'ов движка
 * (engine/src/scene/renderer/renderer.js, scope.resolve('matrix_model')),
 * не наша придумка. Общий и для полной загрузки (lasLoader.ts), и для
 * потоковой по octree (copcLoader.ts) — один и тот же визуальный результат.
 *
 * heightRange — диапазон Z ЭТОГО конкретного меша/узла (в локальных,
 * нероtированных координатах, до AXIS_FIX_ROTATION) для нормировки
 * height-режима; у каждого материала свой, в отличие от uColorMode
 * (общий, переключается из Settings Panel на все материалы сразу).
 */
export function createPointCloudMaterial(
  pc: PcModule,
  pointSizePx: number,
  heightRange: [number, number] = [0, 1]
) {
  const material = new pc.ShaderMaterial({
    uniqueName: 'GisdataLasPointCloudShader',
    attributes: {
      aPosition: pc.SEMANTIC_POSITION,
      aColor: pc.SEMANTIC_COLOR,
      aTexCoord0: pc.SEMANTIC_TEXCOORD0,
    },
    vertexGLSL: `
      attribute vec3 aPosition;
      attribute vec4 aColor;
      attribute vec2 aTexCoord0;
      uniform mat4 matrix_model;
      uniform mat4 matrix_viewProjection;
      uniform float uPointSize;
      varying vec4 vColor;
      varying vec2 vIntensityClass;
      varying float vHeight;
      void main(void) {
        vColor = aColor;
        vIntensityClass = aTexCoord0;
        vHeight = aPosition.z;
        vec4 worldPos = matrix_model * vec4(aPosition, 1.0);
        gl_Position = matrix_viewProjection * worldPos;
        gl_PointSize = uPointSize;
      }
    `,
    fragmentGLSL: `
      precision mediump float;
      varying vec4 vColor;
      varying vec2 vIntensityClass;
      varying float vHeight;
      uniform float uColorMode;
      uniform vec2 uHeightRange;

      vec3 hslToRgb(float h, float s, float l) {
        float k0 = mod(0.0 + h * 12.0, 12.0);
        float k8 = mod(8.0 + h * 12.0, 12.0);
        float k4 = mod(4.0 + h * 12.0, 12.0);
        float a = s * min(l, 1.0 - l);
        float r = l - a * max(-1.0, min(min(k0 - 3.0, 9.0 - k0), 1.0));
        float g = l - a * max(-1.0, min(min(k8 - 3.0, 9.0 - k8), 1.0));
        float b = l - a * max(-1.0, min(min(k4 - 3.0, 9.0 - k4), 1.0));
        return vec3(r, g, b);
      }

      // ASPRS LAS classification codes — упрощённая палитра под самые
      // частые классы; всё неперечисленное — серый (как "unclassified").
      vec3 classificationColor(float c) {
        int cls = int(c + 0.5);
        if (cls == 2) return vec3(0.55, 0.40, 0.20); // ground
        if (cls == 3) return vec3(0.55, 0.85, 0.35); // low vegetation
        if (cls == 4) return vec3(0.30, 0.65, 0.25); // medium vegetation
        if (cls == 5) return vec3(0.10, 0.45, 0.15); // high vegetation
        if (cls == 6) return vec3(0.90, 0.55, 0.20); // building
        if (cls == 7) return vec3(0.90, 0.10, 0.80); // noise
        if (cls == 9) return vec3(0.20, 0.50, 0.95); // water
        return vec3(0.6, 0.6, 0.6); // 0/1/unclassified/прочее
      }

      void main(void) {
        vec3 color;
        if (uColorMode < 0.5) {
          color = vColor.rgb;
        } else if (uColorMode < 1.5) {
          float extent = max(uHeightRange.y - uHeightRange.x, 0.0001);
          float t = clamp((vHeight - uHeightRange.x) / extent, 0.0, 1.0);
          color = hslToRgb((1.0 - t) * 0.66, 0.8, 0.5);
        } else if (uColorMode < 2.5) {
          color = vec3(clamp(vIntensityClass.x, 0.0, 1.0));
        } else {
          color = classificationColor(vIntensityClass.y);
        }
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
  material.setParameter('uPointSize', pointSizePx);
  material.setParameter('uColorMode', 0);
  material.setParameter('uHeightRange', new Float32Array(heightRange));
  material.update();
  return material;
}

export function setPointCloudColorMode(material: InstanceType<PcModule['ShaderMaterial']>, mode: ColorMode): void {
  material.setParameter('uColorMode', COLOR_MODE_INDEX[mode]);
  material.update();
}
