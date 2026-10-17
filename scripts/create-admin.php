<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/api/_env.php';

$email = filter_var($argv[1] ?? '', FILTER_VALIDATE_EMAIL);
if ($email === false) {
    fwrite(STDERR, "Usage: php scripts/create-admin.php admin@example.com\n");
    exit(1);
}
$password = getenv('ADMIN_PASSWORD') ?: '';
if (strlen($password) < 12) {
    fwrite(STDERR, "Set ADMIN_PASSWORD to a value of at least 12 characters, then run this command again.\n");
    exit(1);
}

$host = getenv('DB_HOST') ?: '';
$name = getenv('DB_NAME') ?: '';
$user = getenv('DB_USER') ?: '';
$dbPassword = getenv('DB_PASSWORD');
if ($host === '' || $name === '' || $user === '' || $dbPassword === false) {
    fwrite(STDERR, "Set DB_HOST, DB_NAME, DB_USER, and DB_PASSWORD before running this command.\n");
    exit(1);
}
$port = getenv('DB_PORT') ?: '3306';
$pdo = new PDO(
    "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4",
    $user,
    $dbPassword,
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
);
$statement = $pdo->prepare(
    'INSERT INTO admins (email, password_hash) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)'
);
$statement->execute([$email, password_hash($password, PASSWORD_DEFAULT)]);
fwrite(STDOUT, "Administrator account created or updated for {$email}.\n");
