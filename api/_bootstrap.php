<?php
declare(strict_types=1);

require_once __DIR__ . '/_env.php';

error_reporting(E_ALL);
ini_set('display_errors', '0');

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_set_cookie_params([
        'httponly' => true,
        'secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'samesite' => 'Lax',
        'path' => '/',
    ]);
    session_start();
}

$_SESSION['csrf_token'] ??= bin2hex(random_bytes(32));
$_SESSION['unlocked_projects'] ??= [];

set_exception_handler(static function (Throwable $error): void {
    error_log((string) $error);
    json_response(['error' => 'An unexpected server error occurred.'], 500);
});

function json_response(array $data, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function require_method(string ...$methods): void
{
    if (!in_array($_SERVER['REQUEST_METHOD'] ?? '', $methods, true)) {
        header('Allow: ' . implode(', ', $methods));
        json_response(['error' => 'Method not allowed.'], 405);
    }
}

function json_input(): array
{
    $data = json_decode(file_get_contents('php://input'), true);
    if (!is_array($data)) {
        json_response(['error' => 'A valid JSON request body is required.'], 400);
    }
    return $data;
}

function require_csrf(): void
{
    $provided = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!is_string($provided) || !hash_equals($_SESSION['csrf_token'], $provided)) {
        json_response(['error' => 'Your session expired. Refresh the page and try again.'], 403);
    }
}

function require_admin(): array
{
    if (!isset($_SESSION['admin_id'], $_SESSION['admin_email'])) {
        json_response(['error' => 'Administrator sign-in is required.'], 401);
    }
    return ['id' => (int) $_SESSION['admin_id'], 'email' => $_SESSION['admin_email']];
}

function database(): PDO
{
    static $connection;
    if ($connection instanceof PDO) {
        return $connection;
    }

    $host = getenv('DB_HOST') ?: '';
    $name = getenv('DB_NAME') ?: '';
    $user = getenv('DB_USER') ?: '';
    $password = getenv('DB_PASSWORD');
    if ($host === '' || $name === '' || $user === '' || $password === false) {
        throw new RuntimeException('Set DB_HOST, DB_NAME, DB_USER, and DB_PASSWORD in the server environment.');
    }

    $port = getenv('DB_PORT') ?: '3306';
    $connection = new PDO(
        "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4",
        $user,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
    return $connection;
}

function storage_directory(): string
{
    $path = getenv('STORAGE_PATH') ?: dirname(__DIR__) . DIRECTORY_SEPARATOR . 'storage';
    if (!is_dir($path) && !mkdir($path, 0750, true) && !is_dir($path)) {
        throw new RuntimeException('Could not create the private media storage directory.');
    }
    return rtrim($path, DIRECTORY_SEPARATOR);
}

function request_string(array $data, string $key, int $maxLength, bool $required = true): string
{
    $value = trim((string) ($data[$key] ?? ''));
    if (($required && $value === '') || mb_strlen($value) > $maxLength) {
        json_response(['error' => "{$key} is required and must not exceed {$maxLength} characters."], 422);
    }
    return $value;
}
