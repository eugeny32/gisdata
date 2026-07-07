<?php
declare(strict_types=1);
require __DIR__ . '/app/lib/auth.php';
$admin = require_admin_role('admin');

$pdo = db();
$error   = null;
$success = null;

// ---------------------------------------------------------------------------
// POST: добавить / переключить / удалить / синхронизировать из MDB
// ---------------------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = (string)($_POST['action'] ?? '');

    // --- Добавить нового пользователя ---
    if ($action === 'add') {
        $userName      = trim((string)($_POST['user_name'] ?? ''));
        $password      = trim((string)($_POST['user_password'] ?? ''));
        $glName        = trim((string)($_POST['gl_name'] ?? '')) ?: null;
        $email         = trim((string)($_POST['email'] ?? '')) ?: null;
        $telephone     = trim((string)($_POST['telephone'] ?? '')) ?: null;
        $contactPerson = trim((string)($_POST['contact_person'] ?? '')) ?: null;
        $isActive      = isset($_POST['is_active']) ? 1 : 0;

        if ($userName === '' || $password === '') {
            $error = 'Имя пользователя и пароль обязательны';
        } else {
            $dup = $pdo->prepare('SELECT COUNT(*) FROM users_sync WHERE user_name = :u');
            $dup->execute(['u' => $userName]);
            if ((int)$dup->fetchColumn() > 0) {
                $error = "Пользователь «{$userName}» уже существует";
            } else {
                // Пробуем записать в MDB — если удастся, пользователь будет
                // работать в NTRIP-сервере и is_manual = 0 (MDB — источник).
                $newId    = null;
                $isManual = 1;
                try {
                    $mdb = mdb();
                    $ins = $mdb->prepare(
                        'INSERT INTO NRS_SER_UserDB' .
                        ' (UserName, Glname, USERPASSWORD, PUSERTIME, USERTIME, EMAIL, Contact_person, Telephone)' .
                        ' VALUES (?, ?, ?, 0, ?, ?, ?, ?)'
                    );
                    $ins->execute([$userName, $glName, $password, $isActive ? 1 : 0, $email, $contactPerson, $telephone]);
                    // @@IDENTITY — стандарт ODBC Access для последнего auto-increment
                    $newId    = (int)$mdb->query('SELECT @@IDENTITY')->fetchColumn();
                    $isManual = 0; // успешно попал в MDB
                } catch (Throwable) {
                    // MDB недоступна — создаём только в платформе
                }

                if ($newId === null || $newId <= 0) {
                    // ID >= 1 000 000, чтобы не пересечься с реальными MDB ID
                    $maxManual = (int)$pdo->query(
                        'SELECT COALESCE(MAX(id), 999999) FROM users_sync WHERE id >= 1000000'
                    )->fetchColumn();
                    $newId    = max($maxManual + 1, 1000000);
                    $isManual = 1;
                }

                $pdo->prepare(
                    'INSERT INTO users_sync
                        (id, user_name, gl_name, user_password, user_time, puser_time, is_active, is_manual)
                     VALUES
                        (:id, :user_name, :gl_name, :user_password, :user_time, 0, :is_active, :is_manual)'
                )->execute([
                    'id'            => $newId,
                    'user_name'     => $userName,
                    'gl_name'       => $glName,
                    'user_password' => $password,
                    'user_time'     => $isActive ? 1 : 0,
                    'is_active'     => $isActive,
                    'is_manual'     => $isManual,
                ]);

                $success = $isManual === 0
                    ? "Пользователь «{$userName}» создан (ID {$newId}) — записан в MDB и базу данных"
                    : "Пользователь «{$userName}» создан (ID {$newId}) — только в платформе (MDB недоступна)";
            }
        }

    // --- Сменить пароль вручную-добавленного пользователя ---
    } elseif ($action === 'set_password') {
        $id       = (int)($_POST['id'] ?? 0);
        $password = trim((string)($_POST['user_password'] ?? ''));
        if ($password === '') {
            $error = 'Пароль не может быть пустым';
        } else {
            $row = $pdo->prepare('SELECT is_manual FROM users_sync WHERE id = :id');
            $row->execute(['id' => $id]);
            $u = $row->fetch();
            if (!$u || !(int)$u['is_manual']) {
                $error = 'Смена пароля доступна только для пользователей, добавленных вручную';
            } else {
                $pdo->prepare('UPDATE users_sync SET user_password = :p WHERE id = :id')
                    ->execute(['p' => $password, 'id' => $id]);
                $success = 'Пароль обновлён';
            }
        }

    // --- Переключить активность ---
    } elseif ($action === 'toggle') {
        $id = (int)($_POST['id'] ?? 0);
        // Переключаем is_active; user_time тоже правим для ручных пользователей,
        // чтобы следующая синхронизация MDB не затёрла изменение у MDB-юзеров.
        $pdo->prepare(
            'UPDATE users_sync SET
               is_active = 1 - is_active,
               user_time = CASE WHEN is_manual = 1
                                THEN CASE WHEN is_active = 1 THEN 0 ELSE 1 END
                                ELSE user_time END
             WHERE id = :id'
        )->execute(['id' => $id]);
        header('Location: /users.php' . ($_SERVER['QUERY_STRING'] ? '?' . $_SERVER['QUERY_STRING'] : ''));
        exit;

    // --- Удалить (только ручные) ---
    } elseif ($action === 'delete') {
        $id = (int)($_POST['id'] ?? 0);
        $row = $pdo->prepare('SELECT is_manual, user_name FROM users_sync WHERE id = :id');
        $row->execute(['id' => $id]);
        $u = $row->fetch();
        if (!$u || !(int)$u['is_manual']) {
            $error = 'Удалять можно только пользователей, добавленных вручную. MDB-пользователи управляются в источнике.';
        } else {
            $pdo->prepare('DELETE FROM users_sync WHERE id = :id')->execute(['id' => $id]);
            header('Location: /users.php');
            exit;
        }

    // --- Синхронизировать из MDB ---
    } elseif ($action === 'sync') {
        try {
            $source = mdb();
            $rows   = $source->query(
                'SELECT ID, UserName, Glname, USERPASSWORD, PUSERTIME, USERTIME,' .
                ' ScopeName, MountName, DeviceType, SN, EMAIL, Contact_person, Telephone' .
                ' FROM NRS_SER_UserDB'
            )->fetchAll(PDO::FETCH_ASSOC);

            // WHERE users_sync.is_manual = 0 — защищаем ручных пользователей
            // от перезатирания: если ID пересёкся — оставляем ручную запись.
            $upsert = $pdo->prepare(
                'INSERT INTO users_sync
                    (id, user_name, gl_name, user_password, user_time, puser_time,
                     scope_name, mount_name, device_type, sn, email, contact_person, telephone, is_active, is_manual)
                 VALUES
                    (:id, :user_name, :gl_name, :user_password, :user_time, :puser_time,
                     :scope_name, :mount_name, :device_type, :sn, :email, :contact_person, :telephone, :is_active, 0)
                 ON CONFLICT (id) DO UPDATE SET
                    user_name      = EXCLUDED.user_name,
                    gl_name        = EXCLUDED.gl_name,
                    user_password  = EXCLUDED.user_password,
                    user_time      = EXCLUDED.user_time,
                    puser_time     = EXCLUDED.puser_time,
                    scope_name     = EXCLUDED.scope_name,
                    mount_name     = EXCLUDED.mount_name,
                    device_type    = EXCLUDED.device_type,
                    sn             = EXCLUDED.sn,
                    email          = EXCLUDED.email,
                    contact_person = EXCLUDED.contact_person,
                    telephone      = EXCLUDED.telephone,
                    is_active      = EXCLUDED.is_active
                 WHERE users_sync.is_manual = 0'
            );

            $pdo->beginTransaction();
            $count = 0;
            foreach ($rows as $row) {
                $userTime = (int)($row['USERTIME'] ?? 0);
                $upsert->execute([
                    'id'             => (int)$row['ID'],
                    'user_name'      => (string)$row['UserName'],
                    'gl_name'        => $row['Glname'] ?? null,
                    'user_password'  => (string)$row['USERPASSWORD'],
                    'user_time'      => $userTime,
                    'puser_time'     => (int)($row['PUSERTIME'] ?? 0),
                    'scope_name'     => $row['ScopeName'] ?? null,
                    'mount_name'     => $row['MountName'] ?? null,
                    'device_type'    => $row['DeviceType'] ?? null,
                    'sn'             => $row['SN'] ?? null,
                    'email'          => $row['EMAIL'] ?? null,
                    'contact_person' => $row['Contact_person'] ?? null,
                    'telephone'      => $row['Telephone'] ?? null,
                    'is_active'      => $userTime > 0 ? 1 : 0,
                ]);
                $count++;
            }
            $pdo->commit();
            $success = "Синхронизация завершена — обновлено из MDB: {$count} пользователей";
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            $error = 'Ошибка синхронизации из MDB: ' . $e->getMessage();
        }
    }
}

// ---------------------------------------------------------------------------
// Список пользователей (с поиском и фильтром статуса)
// ---------------------------------------------------------------------------
$search       = trim((string)($_GET['q'] ?? ''));
$filterStatus = (string)($_GET['s'] ?? '');

$where  = [];
$params = [];
if ($search !== '') {
    $where[]      = "(user_name ILIKE :q OR COALESCE(gl_name,'') ILIKE :q OR COALESCE(email,'') ILIKE :q)";
    $params['q']  = '%' . $search . '%';
}
if ($filterStatus === '1') {
    $where[] = 'is_active = 1';
} elseif ($filterStatus === '0') {
    $where[] = 'is_active = 0';
}
$whereSql = $where ? 'WHERE ' . implode(' AND ', $where) : '';

$usersStmt = $pdo->prepare("SELECT * FROM users_sync {$whereSql} ORDER BY user_name");
$usersStmt->execute($params);
$users = $usersStmt->fetchAll();

$totalAll    = (int)$pdo->query('SELECT COUNT(*) FROM users_sync')->fetchColumn();
$totalActive = (int)$pdo->query('SELECT COUNT(*) FROM users_sync WHERE is_active = 1')->fetchColumn();
$totalManual = (int)$pdo->query('SELECT COUNT(*) FROM users_sync WHERE is_manual = 1')->fetchColumn();

$pageTitle = 'Пользователи NTRIP';
$pageIcon  = 'bi-people-fill';
require __DIR__ . '/app/views/_head.php';
?>

<?php if ($error): ?>
  <div class="alert alert-danger"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
<?php endif; ?>
<?php if ($success): ?>
  <div class="alert alert-success"><?= htmlspecialchars($success, ENT_QUOTES, 'UTF-8') ?></div>
<?php endif; ?>

<!-- Статистика + кнопки действий -->
<div class="d-flex flex-wrap align-items-center gap-3 mb-3">
  <div class="text-secondary small">
    Всего: <strong class="text-white"><?= $totalAll ?></strong>&ensp;
    Активных: <strong class="text-success"><?= $totalActive ?></strong>&ensp;
    Неактивных: <strong class="text-danger"><?= $totalAll - $totalActive ?></strong>&ensp;
    Добавлено вручную: <strong class="text-warning"><?= $totalManual ?></strong>
  </div>
  <div class="ms-auto d-flex gap-2 flex-wrap">
    <button class="btn btn-sm btn-primary" type="button"
            data-bs-toggle="collapse" data-bs-target="#addUserPanel" aria-expanded="false">
      <i class="bi bi-person-plus me-1"></i>Добавить пользователя
    </button>
    <form method="post" action="/users.php" class="d-inline"
          onsubmit="return confirm('Запустить синхронизацию из MDB-файла?');">
      <input type="hidden" name="action" value="sync">
      <button type="submit" class="btn btn-sm btn-outline-secondary">
        <i class="bi bi-arrow-repeat me-1"></i>Синхронизировать из MDB
      </button>
    </form>
  </div>
</div>

<!-- Форма добавления (сворачивается) -->
<div class="collapse mb-3" id="addUserPanel">
  <div class="card surface-card">
    <div class="card-body">
      <h2 class="h6 mb-3"><i class="bi bi-person-plus text-primary me-1"></i>Новый пользователь</h2>
      <form method="post" action="/users.php" class="row g-3">
        <input type="hidden" name="action" value="add">
        <div class="col-12 col-sm-6 col-md-3">
          <label class="form-label small">Имя пользователя (логин)*</label>
          <input type="text" name="user_name" class="form-control" required autocomplete="off">
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <label class="form-label small">Пароль*</label>
          <input type="text" name="user_password" class="form-control" required autocomplete="new-password">
          <div class="form-text">NTRIP-пароли хранятся в открытом виде</div>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <label class="form-label small">ФИО</label>
          <input type="text" name="gl_name" class="form-control">
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <label class="form-label small">Email</label>
          <input type="email" name="email" class="form-control">
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <label class="form-label small">Телефон</label>
          <input type="tel" name="telephone" class="form-control">
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <label class="form-label small">Контактное лицо</label>
          <input type="text" name="contact_person" class="form-control">
        </div>
        <div class="col-12 col-md-6 d-flex align-items-end gap-3">
          <div class="form-check">
            <input type="checkbox" name="is_active" class="form-check-input" id="newUserActive" checked>
            <label class="form-check-label" for="newUserActive">Активен сразу</label>
          </div>
          <button type="submit" class="btn btn-primary">
            <i class="bi bi-check-lg me-1"></i>Создать
          </button>
        </div>
      </form>
      <div class="text-secondary small mt-3">
        <i class="bi bi-info-circle me-1"></i>
        Если MDB-файл доступен серверу, пользователь будет создан и там (станет NTRIP-пользователем).
        Иначе — только в базе данных платформы (возможен вход в кабинет, но не подключение к NTRIP).
      </div>
    </div>
  </div>
</div>

<!-- Фильтр + поиск -->
<div class="card surface-card mb-3">
  <div class="card-body py-2">
    <form method="get" action="/users.php" class="row g-2 align-items-center">
      <div class="col-12 col-sm-5 col-md-4">
        <input type="text" name="q" class="form-control form-control-sm"
               placeholder="Поиск по логину, ФИО, email..."
               value="<?= htmlspecialchars($search, ENT_QUOTES, 'UTF-8') ?>">
      </div>
      <div class="col-6 col-sm-3 col-md-2">
        <select name="s" class="form-select form-select-sm">
          <option value="">Все</option>
          <option value="1" <?= $filterStatus === '1' ? 'selected' : '' ?>>Активные</option>
          <option value="0" <?= $filterStatus === '0' ? 'selected' : '' ?>>Неактивные</option>
        </select>
      </div>
      <div class="col-6 col-sm-auto">
        <button type="submit" class="btn btn-sm btn-outline-secondary w-100">Найти</button>
      </div>
      <?php if ($search !== '' || $filterStatus !== ''): ?>
      <div class="col-auto">
        <a href="/users.php" class="btn btn-sm btn-link text-secondary">Сбросить</a>
      </div>
      <?php endif; ?>
      <div class="col-12 col-md-auto ms-md-auto small text-secondary">
        Найдено: <?= count($users) ?>
      </div>
    </form>
  </div>
</div>

<!-- Таблица пользователей -->
<div class="card surface-card">
  <div class="table-responsive">
    <table class="table table-clean align-middle mb-0">
      <thead>
        <tr>
          <th>Логин</th>
          <th class="d-none d-md-table-cell">ФИО</th>
          <th class="d-none d-lg-table-cell">Email / Телефон</th>
          <th>Статус</th>
          <th>Источник</th>
          <th class="d-none d-xl-table-cell">Синхр.</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
      <?php foreach ($users as $u): ?>
        <tr>
          <td>
            <div class="fw-semibold"><?= htmlspecialchars($u['user_name'], ENT_QUOTES, 'UTF-8') ?></div>
            <?php if ($u['scope_name'] || $u['mount_name']): ?>
              <div class="text-secondary" style="font-size:11px">
                <?= htmlspecialchars(implode(' / ', array_filter([$u['scope_name'], $u['mount_name']])), ENT_QUOTES, 'UTF-8') ?>
              </div>
            <?php endif; ?>
          </td>
          <td class="text-secondary small d-none d-md-table-cell">
            <?= htmlspecialchars($u['gl_name'] ?: '—', ENT_QUOTES, 'UTF-8') ?>
          </td>
          <td class="text-secondary small d-none d-lg-table-cell">
            <div><?= htmlspecialchars($u['email'] ?: '—', ENT_QUOTES, 'UTF-8') ?></div>
            <?php if ($u['telephone']): ?>
              <div><?= htmlspecialchars($u['telephone'], ENT_QUOTES, 'UTF-8') ?></div>
            <?php endif; ?>
          </td>
          <td>
            <?php if ($u['is_active']): ?>
              <span class="badge text-bg-success">Активен</span>
            <?php else: ?>
              <span class="badge text-bg-secondary">Неактивен</span>
            <?php endif; ?>
          </td>
          <td>
            <?php if ($u['is_manual']): ?>
              <span class="badge text-bg-warning text-dark" title="Создан вручную через веб-форму">Вручную</span>
            <?php else: ?>
              <span class="badge text-bg-secondary" title="Импортирован из MDB (NTRIP-сервер)">MDB</span>
            <?php endif; ?>
          </td>
          <td class="text-secondary small d-none d-xl-table-cell">
            <?= htmlspecialchars(substr((string)($u['synced_at'] ?? ''), 0, 16), ENT_QUOTES, 'UTF-8') ?>
          </td>
          <td class="text-end text-nowrap">
            <!-- Переключить активность -->
            <form method="post" action="/users.php" class="d-inline">
              <input type="hidden" name="action" value="toggle">
              <input type="hidden" name="id" value="<?= (int)$u['id'] ?>">
              <?php if ($filterStatus !== ''): ?>
              <input type="hidden" name="s" value="<?= htmlspecialchars($filterStatus, ENT_QUOTES, 'UTF-8') ?>">
              <?php endif; ?>
              <button type="submit" class="btn btn-sm btn-outline-secondary"
                      title="<?= $u['is_active'] ? 'Деактивировать' : 'Активировать' ?>">
                <i class="bi <?= $u['is_active'] ? 'bi-toggle-on text-success' : 'bi-toggle-off' ?>"></i>
              </button>
            </form>

            <?php if ($u['is_manual']): ?>
            <!-- Сменить пароль (только для ручных) -->
            <button type="button" class="btn btn-sm btn-outline-secondary ms-1"
                    title="Сменить пароль"
                    data-bs-toggle="modal"
                    data-bs-target="#pwdModal"
                    data-uid="<?= (int)$u['id'] ?>"
                    data-uname="<?= htmlspecialchars($u['user_name'], ENT_QUOTES, 'UTF-8') ?>">
              <i class="bi bi-key"></i>
            </button>
            <!-- Удалить (только для ручных) -->
            <form method="post" action="/users.php" class="d-inline ms-1"
                  onsubmit="return confirm('Удалить пользователя «<?= htmlspecialchars($u['user_name'], ENT_QUOTES | ENT_COMPAT, 'UTF-8') ?>»?');">
              <input type="hidden" name="action" value="delete">
              <input type="hidden" name="id" value="<?= (int)$u['id'] ?>">
              <button type="submit" class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
            </form>
            <?php endif; ?>
          </td>
        </tr>
      <?php endforeach; ?>
      <?php if (!$users): ?>
        <tr>
          <td colspan="7" class="text-secondary text-center py-4">
            Пользователей не найдено
          </td>
        </tr>
      <?php endif; ?>
      </tbody>
    </table>
  </div>
  <div class="px-3 py-2 border-top border-secondary border-opacity-25 text-secondary small">
    <i class="bi bi-info-circle me-1"></i>
    <strong>MDB</strong> — пользователи из файла <em>E_Ser190905.mdb</em>; их данные перезаписываются при каждой синхронизации.
    <strong>Вручную</strong> — созданы через эту форму; синхронизация их не трогает.
    Переключение активности MDB-пользователей временно — сбросится на следующей синхронизации.
  </div>
</div>

<!-- Модалка смены пароля -->
<div class="modal fade" id="pwdModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Сменить пароль</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <form method="post" action="/users.php">
        <div class="modal-body">
          <input type="hidden" name="action" value="set_password">
          <input type="hidden" name="id" id="pwdUserId">
          <p class="text-secondary small mb-3">Пользователь: <strong id="pwdUserName"></strong></p>
          <label class="form-label small">Новый пароль</label>
          <input type="text" name="user_password" class="form-control" required autocomplete="new-password">
          <div class="form-text">NTRIP-пароли хранятся в открытом виде</div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Отмена</button>
          <button type="submit" class="btn btn-primary">Сохранить</button>
        </div>
      </form>
    </div>
  </div>
</div>

<?php
$extraScripts = <<<'HTML'
<script>
const pwdModal = document.getElementById('pwdModal');
if (pwdModal) {
  pwdModal.addEventListener('show.bs.modal', (e) => {
    const btn = e.relatedTarget;
    document.getElementById('pwdUserId').value   = btn.dataset.uid;
    document.getElementById('pwdUserName').textContent = btn.dataset.uname;
  });
}
</script>
HTML;
require __DIR__ . '/app/views/_foot.php';
