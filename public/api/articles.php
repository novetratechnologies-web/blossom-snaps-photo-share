<?php
declare(strict_types=1);

require dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'api' . DIRECTORY_SEPARATOR . '_bootstrap.php';

require_method('GET', 'POST', 'PUT', 'DELETE');
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $isAdmin = isset($_SESSION['admin_id']) && ($_GET['admin'] ?? '') === '1';
    $sql = 'SELECT id, title, slug, excerpt, content, published_at, created_at FROM articles';
    if (!$isAdmin) {
        $sql .= ' WHERE published_at IS NOT NULL AND published_at <= NOW()';
    }
    $sql .= ' ORDER BY COALESCE(published_at, created_at) DESC';
    json_response(['articles' => database()->query($sql)->fetchAll()]);
}

require_admin();
require_csrf();

if ($method === 'DELETE') {
    $id = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT);
    if (!$id) {
        json_response(['error' => 'A valid article id is required.'], 422);
    }
    $statement = database()->prepare('DELETE FROM articles WHERE id = ?');
    $statement->execute([$id]);
    json_response(['deleted' => $statement->rowCount() > 0]);
}

if (!in_array($method, ['POST', 'PUT'], true)) {
    json_response(['error' => 'Method not allowed.'], 405);
}

$data = json_input();
$title = request_string($data, 'title', 200);
$excerpt = request_string($data, 'excerpt', 500, false);
$content = request_string($data, 'content', 20000);
$slug = strtolower(trim(preg_replace('/[^a-z0-9]+/i', '-', $title), '-'));
$slug .= '-' . bin2hex(random_bytes(3));
$publish = !empty($data['published']);

if ($method === 'POST') {
    $statement = database()->prepare(
        'INSERT INTO articles (title, slug, excerpt, content, published_at) VALUES (?, ?, ?, ?, ?)'
    );
    $statement->execute([$title, $slug, $excerpt, $content, $publish ? date('Y-m-d H:i:s') : null]);
    json_response(['id' => (int) database()->lastInsertId(), 'slug' => $slug], 201);
} else {
    $id = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
    if (!$id) {
        json_response(['error' => 'A valid article id is required.'], 422);
    }
    $statement = database()->prepare(
        'UPDATE articles SET title = ?, excerpt = ?, content = ?,
         published_at = CASE WHEN ? = 0 THEN NULL ELSE COALESCE(published_at, ?) END
         WHERE id = ?'
    );
    $statement->execute([
        $title,
        $excerpt,
        $content,
        $publish ? 1 : 0,
        $publish ? date('Y-m-d H:i:s') : null,
        $id,
    ]);
    json_response(['updated' => $statement->rowCount() > 0]);
}
