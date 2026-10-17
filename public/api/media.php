<?php
declare(strict_types=1);

require dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'api' . DIRECTORY_SEPARATOR . '_bootstrap.php';

require_method('GET');
$id = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT);
if (!$id) {
    json_response(['error' => 'Media was not found.'], 404);
}
$statement = database()->prepare(
    'SELECT a.storage_name, a.original_name, a.mime_type, a.is_showcase, p.id AS project_id, p.slug, p.access_code_version
     FROM assets a JOIN projects p ON p.id = a.project_id WHERE a.id = ?'
);
$statement->execute([$id]);
$asset = $statement->fetch();
if (!$asset) {
    json_response(['error' => 'Media was not found.'], 404);
}
$isAdmin = isset($_SESSION['admin_id']);
$unlock = $_SESSION['unlocked_projects'][$asset['slug']] ?? null;
$unlocked = is_array($unlock)
    && (int) ($unlock['id'] ?? 0) === (int) $asset['project_id']
    && (int) ($unlock['version'] ?? 0) === (int) $asset['access_code_version'];
if (!$isAdmin && !$unlocked && !(bool) $asset['is_showcase']) {
    json_response(['error' => 'Enter the project access code to view this media.'], 403);
}
$path = storage_directory() . DIRECTORY_SEPARATOR . $asset['storage_name'];
if (!is_file($path)) {
    json_response(['error' => 'Media file is missing from storage.'], 404);
}
header_remove('Content-Type');
header('Content-Type: ' . $asset['mime_type']);
$downloadName = basename(str_replace(["\r", "\n", "\\", '"'], '', (string) $asset['original_name']));
$disposition = isset($_GET['download']) && $_GET['download'] === '1' ? 'attachment' : 'inline';
header("Content-Disposition: {$disposition}; filename=\"download\"; filename*=UTF-8''" . rawurlencode($downloadName));
header('X-Content-Type-Options: nosniff');
$fileSize = filesize($path);
$start = 0;
$end = $fileSize - 1;
$range = $_SERVER['HTTP_RANGE'] ?? '';
if ($range !== '') {
    if (!preg_match('/^bytes=(\d*)-(\d*)$/', $range, $matches) || $fileSize < 1) {
        http_response_code(416);
        header('Content-Range: bytes */' . $fileSize);
        exit;
    }
    if ($matches[1] === '') {
        $suffixLength = (int) $matches[2];
        if ($suffixLength < 1) {
            http_response_code(416);
            header('Content-Range: bytes */' . $fileSize);
            exit;
        }
        $start = max(0, $fileSize - $suffixLength);
    } else {
        $start = (int) $matches[1];
        $end = $matches[2] === '' ? $fileSize - 1 : min((int) $matches[2], $fileSize - 1);
    }
    if ($start >= $fileSize || $start > $end) {
        http_response_code(416);
        header('Content-Range: bytes */' . $fileSize);
        exit;
    }
    http_response_code(206);
    header("Content-Range: bytes {$start}-{$end}/{$fileSize}");
}
header('Accept-Ranges: bytes');
header('Content-Length: ' . ($end - $start + 1));
$stream = fopen($path, 'rb');
if ($stream === false || fseek($stream, $start) !== 0) {
    throw new RuntimeException('Unable to read stored media.');
}
$remaining = $end - $start + 1;
while ($remaining > 0 && !feof($stream)) {
    $chunk = fread($stream, min(1024 * 1024, $remaining));
    if ($chunk === false || $chunk === '') {
        break;
    }
    echo $chunk;
    $remaining -= strlen($chunk);
    flush();
}
fclose($stream);
