import type { PcModule } from './types';

/**
 * Точечное облако (LAS/COPC) рисуется собственным шейдером — стандартный
 * материал PlayCanvas не выставляет gl_PointSize для PRIMITIVE_POINTS.
 * matrix_model/matrix_viewProjection — встроенные имена uniform'ов движка
 * (engine/src/scene/renderer/renderer.js, scope.resolve('matrix_model')),
 * не наша придумка. Общий и для полной загрузки (lasLoader.ts), и для
 * потоковой по octree (copcLoader.ts) — один и тот же визуальный результат.
 */
export function createPointCloudMaterial(pc: PcModule, pointSizePx: number) {
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
