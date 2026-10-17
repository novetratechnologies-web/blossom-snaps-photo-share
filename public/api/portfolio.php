<?php
declare(strict_types=1);

require dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'api' . DIRECTORY_SEPARATOR . '_bootstrap.php';

require_method('GET');
$rows = database()->query(
    'SELECT p.id AS project_id, p.showcase_title, p.showcase_description,
            a.id AS asset_id, a.mime_type
     FROM projects p JOIN assets a ON a.project_id = p.id
     WHERE a.is_showcase = 1
     ORDER BY p.created_at DESC, a.id'
)->fetchAll();
$projects = [];
foreach ($rows as $row) {
    $id = (int) $row['project_id'];
    if (!isset($projects[$id])) {
        $projects[$id] = [
            'id' => $id,
            'title' => $row['showcase_title'] !== '' ? $row['showcase_title'] : 'Selected moments',
            'description' => $row['showcase_description'] ?? '',
            'assets' => [],
        ];
    }
    $projects[$id]['assets'][] = [
        'id' => (int) $row['asset_id'],
        'name' => 'Selected photograph',
        'mimeType' => $row['mime_type'],
        'url' => '/api/media.php?id=' . (int) $row['asset_id'],
    ];
}
json_response(['projects' => array_values($projects)]);
