<?php

declare(strict_types=1);
require __DIR__ . '/app/lib/auth.php';
require_admin_role('admin');

/**
 * Изолированная тестовая страница для LAS-вьювера — без модалки, без
 * Bootstrap, без остального приложения. Цель — разделить две гипотезы:
 * (1) проблема в самом Three.js/LASLoader пайплайне, (2) проблема
 * специфична для модального окна (раскладка/таймин CSS-анимации показа).
 * Если здесь тоже чёрный экран — дело точно не в модалке.
 */

$pdo = db();
$tours = $pdo->query(
    "SELECT id, name, file_path FROM tours WHERE file_format = 'las' AND is_enabled = 1 ORDER BY name"
)->fetchAll();

$selectedUrl = '';
if (isset($_GET['tour_id'])) {
    $stmt = $pdo->prepare("SELECT file_path FROM tours WHERE id = :id AND file_format = 'las'");
    $stmt->execute(['id' => (int)$_GET['tour_id']]);
    $path = $stmt->fetchColumn();
    if ($path) {
        $selectedUrl = '/uploads/tours/' . implode('/', array_map('rawurlencode', explode('/', $path)));
    }
}
?>
<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <title>LAS — изолированный тест</title>
  <style>
    body { margin: 0; background: #1a1d23; color: #ccc; font-family: sans-serif; }
    #ui { position: absolute; top: 0; left: 0; z-index: 10; padding: 10px; background: rgba(0,0,0,.6); }
    #ui a { color: #4ea1ff; margin-right: 12px; }
    #canvasHost { width: 100vw; height: 100vh; }
    #status { position: absolute; bottom: 0; left: 0; z-index: 10; padding: 10px; background: rgba(0,0,0,.6); white-space: pre; font-size: 12px; }
  </style>
  <script type="importmap">
  {
    "imports": {
      "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
      "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/",
      "@loaders.gl/core": "https://cdn.jsdelivr.net/npm/@loaders.gl/core@4.3.0/+esm",
      "@loaders.gl/las": "https://cdn.jsdelivr.net/npm/@loaders.gl/las@4.3.0/+esm"
    }
  }
  </script>
</head>
<body>
  <div id="ui">
    <?php foreach ($tours as $t): ?>
      <a href="?tour_id=<?= (int)$t['id'] ?>"><?= htmlspecialchars($t['name'], ENT_QUOTES, 'UTF-8') ?></a>
    <?php endforeach; ?>
    <?php if (!$tours): ?>Нет LAS-туров в базе.<?php endif; ?>
  </div>
  <div id="canvasHost"></div>
  <div id="status">Выберите тур выше.</div>
  <script type="module">
    const statusEl = document.getElementById('status');
    function log(...args) {
      console.log('[LAS-TEST]', ...args);
      statusEl.textContent += args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') + '\n';
    }

    const url = <?= json_encode($selectedUrl, JSON_UNESCAPED_SLASHES) ?>;

    const THREE = await import('three');
    const { OrbitControls } = await import('three/addons/controls/OrbitControls.js');
    const { load } = await import('@loaders.gl/core');
    const { LASLoader } = await import('@loaders.gl/las');

    const canvasHost = document.getElementById('canvasHost');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222233); // НЕ чёрный — чтобы отличить "пусто" от "чёрный фон"

    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.2));
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(1, 1, 1);
    scene.add(dirLight);

    // Тестовый освещённый объект — если ЕГО не видно или он чёрный, значит
    // дело не в LAS-данных вообще, а в самом рендере/свете/камере.
    const testSphere = new THREE.Mesh(
      new THREE.SphereGeometry(1, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0xff3333 })
    );
    testSphere.position.set(0, 0, 0);
    scene.add(testSphere);

    const width = canvasHost.clientWidth || window.innerWidth;
    const height = canvasHost.clientHeight || window.innerHeight;
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.01, 10000);
    camera.up.set(0, 0, 1); // Z вверх — как в основном вьювере (X=север, Y=восток)
    camera.position.set(5, -5, 5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    canvasHost.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    log('Канвас:', width, height, 'WebGL контекст:', !!renderer.getContext());

    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();
    log('Рендер-цикл запущен. Красная сфера должна быть видна сразу (тест освещения/рендера).');

    if (!url) {
      log('URL файла не задан — выберите тур выше.');
    } else {
      log('Загрузка:', url);
      const loadStart = performance.now();
      try {
        // worker: true (по умолчанию) — без него (worker:false) разбор
        // идёт синхронно в основном потоке: для 50 МБ/2 млн точек это может
        // занимать много секунд БЕЗ единого кадра рендера в это время
        // (visually выглядит как "зависание"/чёрный экран). Устойчивость к
        // выбросам теперь обеспечивает среднее+3σ при расчёте bbox, а не
        // отключение воркера.
        const data = await load(url, LASLoader);
        log('load() занял', Math.round(performance.now() - loadStart), 'мс');
        const posAttr = data.attributes && data.attributes.POSITION;
        if (!posAttr) {
          log('ОШИБКА: нет атрибута POSITION в распарсенных данных.');
        } else {
          const pos = posAttr.value;
          const count = pos.length / 3;
          log('Точек:', count);

          // Среднее + 3σ, а НЕ min/max — устойчиво к единичным выбросам.
          let sumX = 0, sumY = 0, sumZ = 0;
          for (let i = 0; i < count; i++) { sumX += pos[i*3]; sumY += pos[i*3+1]; sumZ += pos[i*3+2]; }
          const cx = sumX / count, cy = sumY / count, cz = sumZ / count;
          let varX = 0, varY = 0, varZ = 0;
          for (let i = 0; i < count; i++) {
            varX += (pos[i*3]-cx)**2; varY += (pos[i*3+1]-cy)**2; varZ += (pos[i*3+2]-cz)**2;
          }
          const stdX = Math.sqrt(varX/count), stdY = Math.sqrt(varY/count), stdZ = Math.sqrt(varZ/count);
          const extent = Math.max(stdX, stdY, stdZ, 1) * 3;
          log('center (mean):', [cx,cy,cz], 'std:', [stdX,stdY,stdZ], 'extent (3σ):', extent);

          const positions = new Float32Array(count * 3);
          for (let i = 0; i < count; i++) {
            positions[i*3] = pos[i*3] - cx;
            positions[i*3+1] = pos[i*3+1] - cy;
            positions[i*3+2] = pos[i*3+2] - cz;
          }
          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

          const colorAttr = data.attributes.COLOR_0 && data.attributes.COLOR_0.value;
          let hasRealColor = false;
          if (colorAttr) {
            const size = data.attributes.COLOR_0.size || 4;
            // Максимум ТОЛЬКО по R/G/B (пропускаем альфа-канал на +3,+7,...) —
            // у этого файла альфа всегда 255, а R=G=B=0 везде: реального
            // цвета в LAS просто нет (обычное дело для лазерных сканеров без
            // встроенной камеры), это не баг чтения.
            let maxRGB = 0;
            for (let i = 0; i < count; i++) {
              const r = colorAttr[i*size], g = colorAttr[i*size+1], b = colorAttr[i*size+2];
              if (r > maxRGB) maxRGB = r;
              if (g > maxRGB) maxRGB = g;
              if (b > maxRGB) maxRGB = b;
            }
            hasRealColor = maxRGB > 0;
            log('COLOR_0 есть, максимум R/G/B по всему файлу:', maxRGB, hasRealColor ? '(реальный цвет есть)' : '(R=G=B=0 везде — реального цвета в файле нет)');
          } else {
            log('COLOR_0 отсутствует вовсе.');
          }

          const colors = new Float32Array(count * 3);
          if (hasRealColor) {
            const size = data.attributes.COLOR_0.size || 4;
            for (let i = 0; i < count; i++) {
              colors[i*3] = colorAttr[i*size] / 255;
              colors[i*3+1] = colorAttr[i*size+1] / 255;
              colors[i*3+2] = colorAttr[i*size+2] / 255;
            }
          } else {
            // Реального цвета нет — окрашиваем по высоте (Z), это и полезнее
            // визуально, и избегает "все точки чёрные".
            log('Окрашиваю по высоте (Z) вместо отсутствующего RGB.');
            for (let i = 0; i < count; i++) {
              const t = Math.max(0, Math.min(1, (positions[i*3+2] + extent) / (2 * extent)));
              const color = new THREE.Color().setHSL((1 - t) * 0.66, 0.8, 0.5);
              colors[i*3] = color.r; colors[i*3+1] = color.g; colors[i*3+2] = color.b;
            }
          }
          geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
          const material = new THREE.PointsMaterial({ size: 3, sizeAttenuation: false, vertexColors: true });

          scene.add(new THREE.Points(geometry, material));

          camera.near = Math.max(extent / 1000, 0.01);
          camera.far = extent * 20;
          camera.updateProjectionMatrix();
          camera.position.set(-extent * 1.5, -extent * 1.5, extent * 1.5);
          controls.target.set(0, 0, 0);
          controls.update();
          testSphere.scale.setScalar(extent / 20); // сфера видна на масштабе облака

          log('Готово. extent=', extent, 'camera.position=', camera.position.toArray());
        }
      } catch (e) {
        log('ОШИБКА загрузки/разбора:', String(e));
      }
    }
  </script>
</body>
</html>
