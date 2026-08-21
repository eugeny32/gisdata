<?php

declare(strict_types=1);
require __DIR__ . '/app/lib/auth.php';
require_login();

/**
 * "Мои туры" — список и управление (изменить название/описание, удалить)
 * турами, которые ЗАГРУЗИЛ САМ текущий пользователь через быструю форму
 * на карте (tour_user_upload.php) — в отличие от tours.php (полноценное
 * админское управление ВСЕМИ турами), здесь видно и можно трогать ТОЛЬКО
 * свои. Доступно любой роли (admin/viewer/обычный пользователь mdb).
 *
 * Владелец хранится в одной из двух взаимоисключающих колонок (см.
 * миграцию created_by_user_id в sql/schema.sql и комментарий в
 * tour_user_upload.php) — created_by (admins.id) для admin/viewer-
 * аккаунтов, created_by_user_id (users_sync.id) для обычных
 * пользователей mdb, у которых нет совместимого id с admins.
 */

$pdo = db();
$uploadDir = __DIR__ . '/uploads/tours/';
$admin = current_admin();
$plainUser = current_user();

if ($admin) {
    $ownerSql = 'created_by = :owner';
    $ownerId = (int)$admin['id'];
} else {
    $ownerSql = 'created_by_user_id = :owner';
    $ownerId = (int)($plainUser['id'] ?? 0);
}

$error = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = (string)($_POST['action'] ?? '');
    $id = (int)($_POST['id'] ?? 0);

    // Ownership — проверяется в каждом запросе на сервере (а не только
    // скрытием кнопок в интерфейсе): без этого пользователь мог бы
    // подставить чужой id и изменить/удалить не свой тур.
    $checkStmt = $pdo->prepare("SELECT * FROM tours WHERE id = :id AND $ownerSql");
    $checkStmt->execute(['id' => $id, 'owner' => $ownerId]);
    $tour = $checkStmt->fetch();

    if (!$tour) {
        $error = 'Тур не найден или не принадлежит вам';
    } elseif ($action === 'update') {
        $name = trim((string)($_POST['name'] ?? ''));
        $description = trim((string)($_POST['description'] ?? ''));
        if ($name === '') {
            $error = 'Укажите название';
        } else {
            $pdo->prepare('UPDATE tours SET name = :name, description = :description WHERE id = :id')
                ->execute(['name' => $name, 'description' => $description ?: null, 'id' => $id]);
            header('Location: /my_tours.php');
            exit;
        }
    } elseif ($action === 'delete') {
        if ($tour['file_path'] && is_file($uploadDir . $tour['file_path'])) {
            unlink($uploadDir . $tour['file_path']);
        }
        $extraStmt = $pdo->prepare('SELECT file_path FROM tour_files WHERE tour_id = :id');
        $extraStmt->execute(['id' => $id]);
        foreach ($extraStmt->fetchAll() as $extra) {
            if ($extra['file_path'] && is_file($uploadDir . $extra['file_path'])) {
                unlink($uploadDir . $extra['file_path']);
            }
        }
        $pdo->prepare('DELETE FROM tours WHERE id = :id')->execute(['id' => $id]); // tour_files — каскадом
        header('Location: /my_tours.php');
        exit;
    }
}

$toursStmt = $pdo->prepare("SELECT * FROM tours WHERE $ownerSql ORDER BY created_at DESC");
$toursStmt->execute(['owner' => $ownerId]);
$tours = $toursStmt->fetchAll();

$pageTitle = 'Мои туры';
$pageIcon = 'bi-camera-reels';
require __DIR__ . '/app/views/_head.php';
?>
  <?php if ($error): ?>
    <div class="alert alert-danger"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
  <?php endif; ?>

  <div class="card surface-card">
    <div class="card-body">
      <p class="text-secondary small mb-3">
        Туры, загруженные вами через карту (правый клик → «Добавить объект»).
        Открыть тур в плеере можно с карты — здесь только название, описание и удаление.
      </p>
      <div class="table-responsive">
        <table class="table table-clean align-middle mb-0">
          <thead><tr><th>Название</th><th class="my-tours-desc-col">Описание</th><th>Файл</th><th>Создан</th><th></th></tr></thead>
          <tbody>
          <?php foreach ($tours as $t): ?>
            <tr>
              <td>
                <input type="text" name="name" form="updateForm<?= (int)$t['id'] ?>" class="form-control form-control-sm" value="<?= htmlspecialchars($t['name'], ENT_QUOTES, 'UTF-8') ?>" required>
              </td>
              <td class="my-tours-desc-col">
                <input type="text" name="description" form="updateForm<?= (int)$t['id'] ?>" class="form-control form-control-sm" value="<?= htmlspecialchars((string)$t['description'], ENT_QUOTES, 'UTF-8') ?>" placeholder="Без описания">
              </td>
              <td class="text-secondary small"><?= htmlspecialchars((string)$t['file_format'], ENT_QUOTES, 'UTF-8') ?></td>
              <td class="text-secondary small"><?= htmlspecialchars(substr((string)$t['created_at'], 0, 16), ENT_QUOTES, 'UTF-8') ?></td>
              <td class="text-end">
                <!-- Сами <form> — здесь (одна ячейка, валидный HTML), поля
                     name/description в других ячейках ссылаются на них
                     через form="..." (тот же приём, что и
                     form="syncPgForm..." в tours.php). -->
                <form id="updateForm<?= (int)$t['id'] ?>" method="post" action="/my_tours.php" class="d-inline">
                  <input type="hidden" name="action" value="update">
                  <input type="hidden" name="id" value="<?= (int)$t['id'] ?>">
                </form>
                <form id="deleteForm<?= (int)$t['id'] ?>" method="post" action="/my_tours.php" class="d-inline" onsubmit="return confirm('Удалить тур и файл модели?');">
                  <input type="hidden" name="action" value="delete">
                  <input type="hidden" name="id" value="<?= (int)$t['id'] ?>">
                </form>
                <button type="submit" form="updateForm<?= (int)$t['id'] ?>" class="btn btn-sm btn-outline-primary" title="Сохранить"><i class="bi bi-check-lg"></i></button>
                <button type="submit" form="deleteForm<?= (int)$t['id'] ?>" class="btn btn-sm btn-outline-danger" title="Удалить"><i class="bi bi-trash"></i></button>
              </td>
            </tr>
          <?php endforeach; ?>
          <?php if (!$tours): ?>
            <tr><td colspan="5" class="text-secondary text-center py-4">Вы пока не загрузили ни одного тура — добавьте на карте (правый клик → «Добавить объект»)</td></tr>
          <?php endif; ?>
          </tbody>
        </table>
      </div>
    </div>
  </div>
<?php require __DIR__ . '/app/views/_foot.php'; ?>
