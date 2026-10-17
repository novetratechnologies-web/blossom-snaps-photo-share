<?php
declare(strict_types=1);

require dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'api' . DIRECTORY_SEPARATOR . '_bootstrap.php';

require_method('GET', 'POST', 'DELETE');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    json_response([
        'csrfToken' => $_SESSION['csrf_token'],
        'admin' => isset($_SESSION['admin_id'])
            ? ['email' => $_SESSION['admin_email']]
            : null,
    ]);
}

require_csrf();

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $_SESSION = [];
    session_regenerate_id(true);
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    $_SESSION['unlocked_projects'] = [];
    json_response(['csrfToken' => $_SESSION['csrf_token'], 'admin' => null]);
}

$data = json_input();
$email = filter_var(trim((string) ($data['email'] ?? '')), FILTER_VALIDATE_EMAIL);
$password = (string) ($data['password'] ?? '');
if ($email === false || $password === '') {
    json_response(['error' => 'Enter a valid email address and password.'], 422);
}

$statement = database()->prepare('SELECT id, email, password_hash FROM admins WHERE email = ?');
$statement->execute([$email]);
$admin = $statement->fetch();
if (!$admin || !password_verify($password, $admin['password_hash'])) {
    json_response(['error' => 'The email or password is incorrect.'], 401);
}

session_regenerate_id(true);
$_SESSION['admin_id'] = (int) $admin['id'];
$_SESSION['admin_email'] = $admin['email'];
$_SESSION['csrf_token'] = bin2hex(random_bytes(32));
$_SESSION['unlocked_projects'] = [];
json_response(['csrfToken' => $_SESSION['csrf_token'], 'admin' => ['email' => $admin['email']]]);
