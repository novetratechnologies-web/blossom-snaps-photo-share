<?php
declare(strict_types=1);

require dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'api' . DIRECTORY_SEPARATOR . '_bootstrap.php';

require_method('GET', 'POST');
$slug = (string) ($_GET['slug'] ?? '');
if (!preg_match('/^[a-f0-9]{32}$/', $slug)) {
    json_response(['error' => 'This project link is invalid.'], 404);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    $data = json_input();
    $code = strtoupper(trim((string) ($data['accessCode'] ?? '')));
    $statement = database()->prepare('SELECT id, access_code_hash, access_code_version FROM projects WHERE slug = ?');
    $statement->execute([$slug]);
    $project = $statement->fetch();
    if (!$project || !password_verify($code, $project['access_code_hash'])) {
        json_response(['error' => 'The access code is incorrect.'], 403);
    }
    $_SESSION['unlocked_projects'][$slug] = [
        'id' => (int) $project['id'],
        'version' => (int) $project['access_code_version'],
    ];
}

$isAdmin = isset($_SESSION['admin_id']);
$currentProject = database()->prepare('SELECT id, access_code_version FROM projects WHERE slug = ?');
$currentProject->execute([$slug]);
$currentAccess = $currentProject->fetch();
if (!$currentAccess) {
    json_response(['error' => 'This project could not be found.'], 404);
}
$unlock = $_SESSION['unlocked_projects'][$slug] ?? null;
$unlocked = is_array($unlock)
    && (int) ($unlock['id'] ?? 0) === (int) $currentAccess['id']
    && (int) ($unlock['version'] ?? 0) === (int) $currentAccess['access_code_version'];
if (!$isAdmin && !$unlocked) {
    json_response(['error' => 'Enter this project’s access code to continue.'], 401);
}

$statement = database()->prepare(
    'SELECT p.id, p.slug, p.title, p.description, a.id AS asset_id, a.original_name, a.mime_type, a.file_size
     FROM projects p LEFT JOIN assets a ON a.project_id = p.id
     WHERE p.slug = ? ORDER BY a.id'
);
$statement->execute([$slug]);
$rows = $statement->fetchAll();
if (!$rows) {
    json_response(['error' => 'This project could not be found.'], 404);
}
$project = [
    'id' => (int) $rows[0]['id'],
    'slug' => $rows[0]['slug'],
    'title' => $rows[0]['title'],
    'description' => $rows[0]['description'],
    'assets' => [],
];
foreach ($rows as $row) {
    if ($row['asset_id'] !== null) {
        $project['assets'][] = [
            'id' => (int) $row['asset_id'],
            'name' => $row['original_name'],
            'mimeType' => $row['mime_type'],
            'fileSize' => (int) $row['file_size'],
            'url' => '/api/media.php?id=' . (int) $row['asset_id'],
        ];
    }
}
json_response(['project' => $project]);
