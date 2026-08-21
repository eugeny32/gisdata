<?php
declare(strict_types=1);
require __DIR__ . '/app/lib/auth.php';
$admin = require_admin_role('admin');

$pdo = db();
$error = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = (string)($_POST['action'] ?? '');

    if ($action === 'save') {
        $id = (int)($_POST['id'] ?? 0);
        $name = trim((string)($_POST['name'] ?? ''));
        $targetCrsEpsgRaw = trim((string)($_POST['target_crs_epsg'] ?? ''));
        $targetCrsWkt = trim((string)($_POST['target_crs_wkt'] ?? ''));
        $targetCrsEpsg = $targetCrsEpsgRaw !== '' ? (int)$targetCrsEpsgRaw : null;

        if ($name === '') {
            $error = 'Укажите название проекта';
        } else {
            if ($id > 0) {
                $pdo->prepare(
                    'UPDATE slam_projects SET name=:name, target_crs_epsg=:epsg, target_crs_wkt=:wkt WHERE id=:id'
                )->execute(['name' => $name, 'epsg' => $targetCrsEpsg, 'wkt' => $targetCrsWkt ?: null, 'id' => $id]);
            } else {
                $pdo->prepare(
                    'INSERT INTO slam_projects (name, target_crs_epsg, target_crs_wkt, created_by)
                     VALUES (:name, :epsg, :wkt, :admin_id)'
                )->execute(['name' => $name, 'epsg' => $targetCrsEpsg, 'wkt' => $targetCrsWkt ?: null, 'admin_id' => $admin['id']]);
            }
            header('Location: /slam_projects.php');
            exit;
        }
    } elseif ($action === 'delete') {
        $id = (int)($_POST['id'] ?? 0);
        $pdo->prepare('DELETE FROM slam_projects WHERE id = :id')->execute(['id' => $id]);
        header('Location: /slam_projects.php');
        exit;
    }
}

$projects = $pdo->query(
    "SELECT p.*, (SELECT COUNT(*) FROM slam_scans s WHERE s.project_id = p.id) AS scan_count
     FROM slam_projects p ORDER BY p.created_at DESC"
)->fetchAll();

$modalData = [];
foreach ($projects as $p) {
    $modalData[$p['id']] = [
        'name' => $p['name'],
        'targetCrsEpsg' => $p['target_crs_epsg'] ?? '',
        'targetCrsWkt' => $p['target_crs_wkt'] ?? '',
    ];
}

$pageTitle = 'SLAM: проекты';
$pageIcon = 'bi-diagram-3';
require __DIR__ . '/app/views/_head.php';
?>
  <?php if ($error): ?>
    <div class="alert alert-danger"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
  <?php endif; ?>

  <div class="card surface-card">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="h6 mb-0">Проекты SLAM (SHARE S20)</h2>
        <button type="button" class="btn btn-sm btn-primary" id="addProjectBtn"><i class="bi bi-plus-lg"></i> Новый проект</button>
      </div>
      <div class="text-secondary small mb-2">Кликните по строке, чтобы изменить проект. Целевая CRS переопределяет автовычисление зоны UTM при георефренсинге (см. слева).</div>
      <div class="table-responsive">
        <table class="table table-clean align-middle">
          <thead>
            <tr><th>Название</th><th>Целевая CRS</th><th>Сканов</th><th></th></tr>
          </thead>
          <tbody>
          <?php foreach ($projects as $p): ?>
            <tr class="project-row" role="button" data-project-id="<?= (int)$p['id'] ?>" style="cursor: pointer">
              <td><?= htmlspecialchars($p['name'], ENT_QUOTES, 'UTF-8') ?></td>
              <td class="text-secondary small"><?= htmlspecialchars($p['target_crs_wkt'] ? 'WKT' : ($p['target_crs_epsg'] ? 'EPSG:' . $p['target_crs_epsg'] : 'авто (UTM по RTK)'), ENT_QUOTES, 'UTF-8') ?></td>
              <td><?= (int)$p['scan_count'] ?></td>
              <td class="text-end">
                <a href="/slam_scans.php?project_id=<?= (int)$p['id'] ?>" class="btn btn-sm btn-outline-secondary" onclick="event.stopPropagation()">Сканы <i class="bi bi-arrow-right"></i></a>
              </td>
            </tr>
          <?php endforeach; ?>
          <?php if (!$projects): ?>
            <tr><td colspan="4" class="text-muted">Нет проектов</td></tr>
          <?php endif; ?>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <div class="modal fade" id="projectModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <form method="post" action="/slam_projects.php">
          <input type="hidden" name="action" value="save">
          <input type="hidden" name="id" id="modalProjectId" value="0">
          <div class="modal-header">
            <h5 class="modal-title" id="modalProjectTitle">Новый проект</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body row g-3">
            <div class="col-12">
              <label class="form-label small">Название*</label>
              <input type="text" name="name" id="modalProjectName" class="form-control" required>
            </div>
            <div class="col-6">
              <label class="form-label small">Целевая EPSG (опционально)</label>
              <input type="number" name="target_crs_epsg" id="modalProjectEpsg" class="form-control" placeholder="напр. 32637">
            </div>
            <div class="col-12">
              <label class="form-label small">Целевая WKT (опционально, приоритетнее EPSG)</label>
              <textarea name="target_crs_wkt" id="modalProjectWkt" class="form-control" rows="3" placeholder="для проекций без кода EPSG (напр. вендорская FusionCRS_TM_87)"></textarea>
            </div>
            <div class="col-12 text-secondary small">Если ничего не указано — зона UTM вычисляется автоматически по медианной долготе RTK-точек скана.</div>
          </div>
          <div class="modal-footer">
            <button type="button" id="modalDeleteProject" class="btn btn-outline-danger me-auto d-none">Удалить</button>
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Закрыть</button>
            <button type="submit" class="btn btn-primary" id="modalSaveProjectBtn">Добавить</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <form method="post" action="/slam_projects.php" id="deleteProjectForm" class="d-none">
    <input type="hidden" name="action" value="delete">
    <input type="hidden" name="id" id="deleteProjectId">
  </form>
<?php
$modalDataJson = json_encode($modalData, JSON_UNESCAPED_UNICODE);
$extraScripts = <<<HTML
<script>
const projectsData = {$modalDataJson};
const projectModalEl = document.getElementById('projectModal');
const projectModal = new bootstrap.Modal(projectModalEl);

function fillProjectModal(id, data) {
  document.getElementById('modalProjectId').value = id;
  document.getElementById('modalProjectName').value = data.name || '';
  document.getElementById('modalProjectEpsg').value = data.targetCrsEpsg || '';
  document.getElementById('modalProjectWkt').value = data.targetCrsWkt || '';
}

document.querySelectorAll('.project-row').forEach(row => {
  row.addEventListener('click', () => {
    const id = row.dataset.projectId;
    const data = projectsData[id];
    if (!data) return;
    document.getElementById('modalProjectTitle').textContent = 'Проект: ' + data.name;
    document.getElementById('modalSaveProjectBtn').textContent = 'Сохранить';
    fillProjectModal(id, data);
    const deleteBtn = document.getElementById('modalDeleteProject');
    deleteBtn.classList.remove('d-none');
    deleteBtn.onclick = () => {
      if (!confirm('Удалить проект? Все его сканы тоже будут удалены.')) return;
      document.getElementById('deleteProjectId').value = id;
      document.getElementById('deleteProjectForm').submit();
    };
    projectModal.show();
  });
});

document.getElementById('addProjectBtn').addEventListener('click', () => {
  document.getElementById('modalProjectTitle').textContent = 'Новый проект';
  document.getElementById('modalSaveProjectBtn').textContent = 'Добавить';
  fillProjectModal(0, {});
  document.getElementById('modalDeleteProject').classList.add('d-none');
  projectModal.show();
});
</script>
HTML;
require __DIR__ . '/app/views/_foot.php';
