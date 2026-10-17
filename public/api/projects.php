<?php
declare(strict_types=1);

require dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'api' . DIRECTORY_SEPARATOR . '_bootstrap.php';

require_method('GET', 'POST', 'PUT', 'DELETE');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    require_admin();
    $projects = database()->query(
        'SELECT p.id, p.slug, p.title, p.description, p.showcase_title, p.showcase_description,
                p.created_at, COUNT(a.id) AS asset_count,
                SUM(CASE WHEN a.is_showcase = 1 THEN 1 ELSE 0 END) AS showcase_count
         FROM projects p LEFT JOIN assets a ON a.project_id = p.id
         GROUP BY p.id ORDER BY p.created_at DESC'
    )->fetchAll();
    $assetQuery = database()->query(
        'SELECT id, project_id, original_name, mime_type, file_size, is_showcase
         FROM assets ORDER BY id'
    );
    $assetsByProject = [];
    foreach ($assetQuery->fetchAll() as $asset) {
        $assetsByProject[$asset['project_id']][] = [
            'id' => (int) $asset['id'],
            'name' => $asset['original_name'],
            'mimeType' => $asset['mime_type'],
            'fileSize' => (int) $asset['file_size'],
            'isShowcase' => (bool) $asset['is_showcase'],
        ];
    }
    foreach ($projects as &$project) {
        $project['assets'] = $assetsByProject[$project['id']] ?? [];
    }
    unset($project);
    json_response(['projects' => $projects]);
}

require_admin();
require_csrf();

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_input();
    $id = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
    if (!$id) {
        json_response(['error' => 'A valid project id is required.'], 422);
    }
    if (($data['action'] ?? '') === 'regenerateAccessCode') {
        $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        $accessCode = '';
        for ($i = 0; $i < 8; $i++) {
            $accessCode .= $alphabet[random_int(0, strlen($alphabet) - 1)];
        }
        $statement = database()->prepare(
            'UPDATE projects SET access_code_hash = ?, access_code_version = access_code_version + 1 WHERE id = ?'
        );
        $statement->execute([password_hash($accessCode, PASSWORD_DEFAULT), $id]);
        if ($statement->rowCount() === 0) {
            json_response(['error' => 'Project was not found.'], 404);
        }
        $project = database()->prepare('SELECT slug FROM projects WHERE id = ?');
        $project->execute([$id]);
        $slug = $project->fetchColumn();
        json_response(['accessCode' => $accessCode, 'link' => rtrim((string) getenv('APP_URL'), '/') . '/project/' . $slug]);
    }
    if (($data['action'] ?? '') === 'details') {
        $title = request_string($data, 'title', 160);
        $description = request_string($data, 'description', 5000, false);
        $statement = database()->prepare('UPDATE projects SET title = ?, description = ? WHERE id = ?');
        $statement->execute([$title, $description, $id]);
        json_response(['updated' => $statement->rowCount() > 0]);
    }
    $showcaseTitle = request_string($data, 'showcaseTitle', 160, false);
    $showcaseDescription = request_string($data, 'showcaseDescription', 5000, false);
    $statement = database()->prepare('UPDATE projects SET showcase_title = ?, showcase_description = ? WHERE id = ?');
    $statement->execute([$showcaseTitle, $showcaseDescription, $id]);
    json_response(['updated' => true]);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT);
    if (!$id) {
        json_response(['error' => 'A valid project id is required.'], 422);
    }
    $pdo = database();
    $statement = $pdo->prepare('SELECT storage_name FROM assets WHERE project_id = ?');
    $statement->execute([$id]);
    $files = $statement->fetchAll();
    $delete = $pdo->prepare('DELETE FROM projects WHERE id = ?');
    $delete->execute([$id]);
    foreach ($files as $file) {
        $path = storage_directory() . DIRECTORY_SEPARATOR . $file['storage_name'];
        if (is_file($path) && !unlink($path)) {
            error_log('Unable to remove deleted project asset: ' . $path);
        }
    }
    json_response(['deleted' => $delete->rowCount() > 0]);
}

$data = json_input();
$title = request_string($data, 'title', 160);
$description = request_string($data, 'description', 5000, false);
$showcaseTitle = request_string($data, 'showcaseTitle', 160, false);
$showcaseDescription = request_string($data, 'showcaseDescription', 5000, false);
$baseUrl = getenv('APP_URL') ?: '';
if (!filter_var($baseUrl, FILTER_VALIDATE_URL)) {
    throw new RuntimeException('Set APP_URL to the public site URL before creating project galleries.');
}
$alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
$accessCode = '';
for ($i = 0; $i < 8; $i++) {
    $accessCode .= $alphabet[random_int(0, strlen($alphabet) - 1)];
}
$slug = bin2hex(random_bytes(16));
$statement = database()->prepare(
    'INSERT INTO projects (slug, title, description, showcase_title, showcase_description, access_code_hash)
     VALUES (?, ?, ?, ?, ?, ?)'
);
$statement->execute([$slug, $title, $description, $showcaseTitle, $showcaseDescription, password_hash($accessCode, PASSWORD_DEFAULT)]);
$baseUrl = rtrim($baseUrl, '/');
$link = $baseUrl . '/project/' . $slug;
json_response([
    'project' => [
        'id' => (int) database()->lastInsertId(),
        'slug' => $slug,
        'title' => $title,
        'description' => $description,
    ],
    'accessCode' => $accessCode,
    'link' => $link,
], 201);
