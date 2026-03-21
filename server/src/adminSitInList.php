<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
];

if ($origin && in_array($origin, $allowed_origins, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
} else if (preg_match('/^http:\/\/localhost(:\d+)?$/', $origin)) {
    header("Access-Control-Allow-Origin: {$origin}");
}

header('Vary: Origin');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 3600');
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/db_connection.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit();
}

try {
    $currentStmt = $pdo->query(
        "SELECT sitIn_id, id_number, name, purpose, lab, status, started_at, ended_at
         FROM sit_in_sessions
         WHERE status = 'in_session'
         ORDER BY started_at DESC"
    );
    $currentSessions = $currentStmt->fetchAll();

    $endedStmt = $pdo->query(
        "SELECT sitIn_id, id_number, name, purpose, lab, status, started_at, ended_at
         FROM sit_in_sessions
         WHERE status = 'ended'
         ORDER BY ended_at DESC
         LIMIT 100"
    );
    $endedSessions = $endedStmt->fetchAll();

    echo json_encode([
        "currentSessions" => $currentSessions,
        "endedSessions" => $endedSessions,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "error" => "Failed to load sit-in sessions",
        "details" => $e->getMessage(),
    ]);
}
