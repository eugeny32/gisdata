<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

/**
 * Тур доступен БЕЗ логина по прямой ссылке (tour_view.php + читающие
 * действия api/tours.php, api/tour_annotations.php, tour_export.php) —
 * админ явно пометил его "опубликован" в tours.php (is_public). Требуем
 * ещё и is_enabled=1 — выключение тура на карте всегда отзывает и
 * публичный доступ по ссылке, даже если is_public остался включён:
 * "выключить тур" должно значить "выключить везде", а не только на карте.
 */
function tour_is_public(int $tourId): bool
{
    if ($tourId <= 0) {
        return false;
    }
    $stmt = db()->prepare('SELECT is_public FROM tours WHERE id = :id AND is_enabled = 1');
    $stmt->execute(['id' => $tourId]);
    return (bool)$stmt->fetchColumn();
}
