<?php
declare(strict_types=1);

require dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'api' . DIRECTORY_SEPARATOR . '_bootstrap.php';

require_method('GET', 'POST');

$defaults = [
    'siteTitle' => 'Blossom Snaps — Photography & Stories',
    'siteDescription' => 'Blossom Snaps photography and private client galleries.',
    'contactEmail' => '',
    'navStoriesLabel' => 'Stories',
    'heroEyebrow' => 'PHOTOGRAPHY · PEOPLE · PLACES',
    'heroTitle' => 'Little moments.',
    'heroTitleAccent' => 'Forever yours.',
    'heroIntro' => 'A home for the stories we capture and the memories we make together.',
    'heroButtonLabel' => 'Explore our stories',
    'heroImageUrl' => '',
    'heroArtTitle' => "THE ART OF\nREMEMBERING",
    'heroArtCaption' => 'A LITTLE BIT OF MAGIC, EVERY DAY',
    'heroIndex' => 'EST. WITH LOVE · 2024',
    'storiesEyebrow' => 'FROM BEHIND THE LENS',
    'storiesTitle' => 'Notes &',
    'storiesTitleAccent' => 'stories',
    'storiesEmptyTitle' => 'Good things are on their way.',
    'storiesEmptyDescription' => 'Our latest stories will bloom here soon.',
    'bannerEyebrow' => 'YOUR MEMORIES, ALL IN ONE PLACE',
    'bannerTitle' => 'Have a gallery waiting?',
    'bannerButtonLabel' => 'Studio sign in',
    'footerTagline' => 'Stories worth keeping.',
];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $content = $defaults;
    $rows = database()->query('SELECT setting_key, setting_value FROM site_settings')->fetchAll();
    foreach ($rows as $row) {
        if (array_key_exists($row['setting_key'], $content)) {
            $content[$row['setting_key']] = $row['setting_value'];
        }
    }
    json_response(['content' => $content]);
}

require_admin();
require_csrf();
$data = json_input();
$unknownKeys = array_diff(array_keys($data), array_keys($defaults));
if ($unknownKeys) {
    json_response(['error' => 'The homepage content includes an unsupported field.'], 422);
}

$pdo = database();
$statement = $pdo->prepare(
    'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)'
);
foreach ($data as $key => $input) {
    $limit = in_array($key, ['heroIntro', 'heroArtTitle', 'siteDescription'], true) ? 1000 : 500;
    $value = request_string($data, $key, $limit, false);
    if ($key === 'contactEmail' && $value !== '' && filter_var($value, FILTER_VALIDATE_EMAIL) === false) {
        json_response(['error' => 'Enter a valid enquiries email address, or leave the field blank.'], 422);
    }
    if ($key === 'heroImageUrl' && $value !== '') {
        $url = filter_var($value, FILTER_VALIDATE_URL);
        if ($url === false || strtolower((string) parse_url($value, PHP_URL_SCHEME)) !== 'https') {
            json_response(['error' => 'The hero image must use a valid HTTPS URL, or be left blank.'], 422);
        }
    }
    $statement->execute([$key, $value]);
}

$content = $defaults;
$rows = $pdo->query('SELECT setting_key, setting_value FROM site_settings')->fetchAll();
foreach ($rows as $row) {
    if (array_key_exists($row['setting_key'], $content)) {
        $content[$row['setting_key']] = $row['setting_value'];
    }
}
json_response(['saved' => true, 'content' => $content]);
