import { defineConfig } from 'vite';
import { resolve } from 'path';

// Собирается в отдельный статический .js, который map.php подключает
// как обычный <script type="module">. PlayCanvas/loaders.gl остаются
// внешними (external) — они и так резолвятся в браузере через
// <script type="importmap"> в app/views/_head.php (CDN jsdelivr), как и
// раньше, до перехода на эту сборку. Бандлить их сюда смысла нет —
// раздуло бы файл и сломало бы переиспользование между map.php и
// playcanvas_test.php (та страница пока не переведена на этот бандл).
export default defineConfig({
  // По умолчанию Vite генерирует URL воркеров/чанков как абсолютные от
  // корня сайта ("/assets/..."), но бандл реально лежит в подпапке
  // /assets/viewer/ — без base воркер COPC (PR4) грузился по неверному
  // пути и тихо падал (Worker.onerror без message/filename — типичный
  // признак ошибки загрузки, не ошибки выполнения). base делает все
  // относительные ссылки внутри бандла корректными для этой подпапки.
  base: '/assets/viewer/',
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      formats: ['es'],
      fileName: () => 'tour-viewer.js',
    },
    outDir: resolve(__dirname, '../assets/viewer'),
    emptyOutDir: false,
    minify: false, // непросто диагностировать на проде без минификации; включим в финальном PR
    rollupOptions: {
      external: ['playcanvas', '@loaders.gl/core', '@loaders.gl/las'],
    },
  },
});
