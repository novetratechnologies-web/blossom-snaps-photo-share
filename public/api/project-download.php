<?php
declare(strict_types=1);

require dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'api' . DIRECTORY_SEPARATOR . '_bootstrap.php';
require_method('GET');

if (!class_exists(ZipArchive::class)) {
    json_response(['error' => 'Bulk downloads are not available on this server.'], 503);
}

$slug = (string) ($_GET['slug'] ?? '');
if (!preg_match('/^[a-f0-9]{32}$/', $slug)) {
    json_response(['error' => 'This project link is invalid.'], 404);
}

$statement = database()->prepare(
    'SELECT p.id, p.title, p.access_code_version FROM projects p WHERE p.slug = ?'
);
$statement->execute([$slug]);
$project = $statement->fetch();
if (!$project) {
    json_response(['error' => 'This project could not be found.'], 404);
}

$isAdmin = isset($_SESSION['admin_id']);
$unlock = $_SESSION['unlocked_projects'][$slug] ?? null;
$unlocked = is_array($unlock)
    && (int) ($unlock['id'] ?? 0) === (int) $project['id']
    && (int) ($unlock['version'] ?? 0) === (int) $project['access_code_version'];
if (!$isAdmin && !$unlocked) {
    json_response(['error' => 'Enter the project access code to download this album.'], 403);
}

$assetsQuery = database()->prepare(
    'SELECT storage_name, original_name FROM assets WHERE project_id = ? ORDER BY id'
);
$assetsQuery->execute([(int) $project['id']]);
$assets = $assetsQuery->fetchAll();
if (!$assets) {
    json_response(['error' => 'There are no files in this gallery yet.'], 404);
}

$tempPath = tempnam(sys_get_temp_dir(), 'blossom-album-');
if ($tempPath === false) {
    json_response(['error' => 'Could not prepare the album download.'], 500);
}
$zip = new ZipArchive();
if ($zip->open($tempPath, ZipArchive::OVERWRITE) !== true) {
    @unlink($tempPath);
    json_response(['error' => 'Could not prepare the album download.'], 500);
}

$storage = storage_directory();
$usedNames = [];
$addedCount = 0;
foreach ($assets as $index => $asset) {
    $path = $storage . DIRECTORY_SEPARATOR . $asset['storage_name'];
    if (!is_file($path)) {
        continue;
    }
    $name = basename(str_replace(["\r", "\n", "\\", '"'], '', (string) $asset['original_name']));
    $name = trim($name, ". \t\n\r\0\x0B");
    if ($name === '' || $name === '.' || $name === '..') {
        $name = 'file-' . ($index + 1);
    }
    $candidate = $name;
    $extension = pathinfo($name, PATHINFO_EXTENSION);
    $stem = $extension === '' ? $name : substr($name, 0, -(strlen($extension) + 1));
    $suffix = 2;
    while (isset($usedNames[mb_strtolower($candidate)])) {
        $candidate = $stem . ' (' . $suffix++ . ')' . ($extension === '' ? '' : '.' . $extension);
    }
    $usedNames[mb_strtolower($candidate)] = true;
    if ($zip->addFile($path, $candidate)) {
        $addedCount++;
    }
}
$zip->close();

if ($addedCount === 0 || filesize($tempPath) === 0) {
    @unlink($tempPath);
    json_response(['error' => 'No gallery files are available to download.'], 404);
}

$archiveName = trim(preg_replace('/[^\pL\pN _.-]+/u', '', (string) $project['title']) ?? '', ' .-_');
$archiveName = ($archiveName !== '' ? $archiveName : 'Blossom-Snaps-gallery') . '.zip';
header_remove('Content-Type');
header('Content-Type: application/zip');
header('Content-Disposition: attachment; filename="gallery.zip"; filename*=UTF-8\'\'' . rawurlencode($archiveName));
header('Content-Length: ' . filesize($tempPath));
header('Cache-Control: private, no-store');
readfile($tempPath);
@unlink($tempPath);
exit;
