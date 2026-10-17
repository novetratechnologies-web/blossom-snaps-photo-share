<?php
declare(strict_types=1);

require dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'api' . DIRECTORY_SEPARATOR . '_bootstrap.php';

require_method('POST', 'PUT', 'DELETE');
require_admin();
require_csrf();
// Release PHP's session lock before processing uploads so concurrent file
// requests from this admin can make progress instead of waiting in a queue.
session_write_close();

$pdo = database();
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_input();
    $id = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
    if (!$id || !array_key_exists('isShowcase', $data)) {
        json_response(['error' => 'A valid media id and showcase setting are required.'], 422);
    }
    $statement = $pdo->prepare('UPDATE assets SET is_showcase = ? WHERE id = ?');
    $statement->execute([filter_var($data['isShowcase'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0, $id]);
    json_response(['updated' => $statement->rowCount() > 0]);
}
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT);
    if (!$id) {
        json_response(['error' => 'A valid media id is required.'], 422);
    }
    $statement = $pdo->prepare('SELECT storage_name FROM assets WHERE id = ?');
    $statement->execute([$id]);
    $asset = $statement->fetch();
    if (!$asset) {
        json_response(['error' => 'Media was not found.'], 404);
    }
    $pdo->prepare('DELETE FROM assets WHERE id = ?')->execute([$id]);
    $path = storage_directory() . DIRECTORY_SEPARATOR . $asset['storage_name'];
    if (is_file($path) && !unlink($path)) {
        error_log('Unable to remove deleted asset: ' . $path);
        json_response(['error' => 'Media record was deleted, but its file could not be removed.'], 500);
    }
    json_response(['deleted' => true]);
}

$projectId = filter_var($_POST['projectId'] ?? null, FILTER_VALIDATE_INT);
if (!$projectId || empty($_FILES['files'])) {
    json_response(['error' => 'Choose a project and at least one file to upload.'], 422);
}
$projectCheck = $pdo->prepare('SELECT id FROM projects WHERE id = ?');
$projectCheck->execute([$projectId]);
if (!$projectCheck->fetch()) {
    json_response(['error' => 'Project was not found.'], 404);
}

$replaceAssetId = filter_var($_POST['replaceAssetId'] ?? null, FILTER_VALIDATE_INT);
if (isset($_POST['replaceAssetId']) && $replaceAssetId === false) {
    json_response(['error' => 'The media item to replace is invalid.'], 422);
}
$assetToReplace = null;
if ($replaceAssetId) {
    $replaceCheck = $pdo->prepare('SELECT id, storage_name FROM assets WHERE id = ? AND project_id = ?');
    $replaceCheck->execute([$replaceAssetId, $projectId]);
    $assetToReplace = $replaceCheck->fetch();
    if (!$assetToReplace) {
        json_response(['error' => 'The media item to replace was not found in this gallery.'], 404);
    }
    if (count(is_array($_FILES['files']['name'] ?? null) ? $_FILES['files']['name'] : []) !== 1) {
        json_response(['error' => 'Choose exactly one file to replace this media item.'], 422);
    }
}

$upload = $_FILES['files'];
$names = is_array($upload['name']) ? $upload['name'] : [$upload['name']];
$types = is_array($upload['type']) ? $upload['type'] : [$upload['type']];
$temporaryPaths = is_array($upload['tmp_name']) ? $upload['tmp_name'] : [$upload['tmp_name']];
$errors = is_array($upload['error']) ? $upload['error'] : [$upload['error']];
$sizes = is_array($upload['size']) ? $upload['size'] : [$upload['size']];
$maxBytes = (int) (getenv('MAX_UPLOAD_BYTES') ?: 52428800);
$allowedTypes = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
    'image/gif' => 'gif',
    'video/mp4' => 'mp4',
    'video/webm' => 'webm',
    'video/quicktime' => 'mov',
];
$directory = storage_directory();
$saved = [];
if (!class_exists('finfo')) {
    error_log('Gallery upload requires the PHP fileinfo extension, but finfo is unavailable.');
    json_response(['error' => 'The server is missing PHP’s fileinfo extension. Enable fileinfo for PHP 8.2, then retry the upload.'], 500);
}
$finfo = new finfo(FILEINFO_MIME_TYPE);

foreach ($names as $index => $originalName) {
    if ($errors[$index] !== UPLOAD_ERR_OK) {
        json_response(['error' => 'An upload failed. Check the server upload size limits and try again.'], 422);
    }
    if ($sizes[$index] < 1 || $sizes[$index] > $maxBytes || !is_uploaded_file($temporaryPaths[$index])) {
        json_response(['error' => 'Each image or video must be smaller than the configured upload limit.'], 422);
    }
    $mimeType = $finfo->file($temporaryPaths[$index]);
    if (!isset($allowedTypes[$mimeType])) {
        json_response(['error' => 'Only JPEG, PNG, WebP, GIF, MP4, WebM, and MOV files are supported.'], 415);
    }
    $storageName = bin2hex(random_bytes(24)) . '.' . $allowedTypes[$mimeType];
    if (!move_uploaded_file($temporaryPaths[$index], $directory . DIRECTORY_SEPARATOR . $storageName)) {
        throw new RuntimeException('Unable to move an uploaded file into private storage.');
    }
    $baseName = basename((string) $originalName);
    // Shared hosts sometimes omit mbstring. Keep the upload path usable while
    // still limiting the stored filename to the database column width.
    $safeName = function_exists('mb_substr')
        ? mb_substr($baseName, 0, 255, 'UTF-8')
        : substr($baseName, 0, 255);
    if ($assetToReplace) {
        $update = $pdo->prepare(
            'UPDATE assets SET storage_name = ?, original_name = ?, mime_type = ?, file_size = ?, is_showcase = 0 WHERE id = ?'
        );
        $update->execute([$storageName, $safeName, $mimeType, (int) $sizes[$index], $replaceAssetId]);
        $oldPath = $directory . DIRECTORY_SEPARATOR . $assetToReplace['storage_name'];
        if (is_file($oldPath) && !unlink($oldPath)) {
            error_log('Unable to remove replaced gallery asset: ' . $oldPath);
        }
        $saved[] = ['id' => (int) $replaceAssetId, 'name' => $safeName, 'replaced' => true];
    } else {
        $insert = $pdo->prepare(
            'INSERT INTO assets (project_id, storage_name, original_name, mime_type, file_size) VALUES (?, ?, ?, ?, ?)'
        );
        $insert->execute([$projectId, $storageName, $safeName, $mimeType, (int) $sizes[$index]]);
        $saved[] = ['id' => (int) $pdo->lastInsertId(), 'name' => $safeName];
    }
}
json_response(['assets' => $saved], 201);
