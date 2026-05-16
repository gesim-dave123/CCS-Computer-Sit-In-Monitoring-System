<?php
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';


$allowed_origins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    // 'https://future-production-domain.com' // Add this when deploying
];

if (in_array($origin, $allowed_origins, true)) {
    header("Access-Control-Allow-Origin: $origin");
}

header('Vary: Origin');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
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
        "SELECT s.sitIn_id, s.id_number,
                COALESCE(CONCAT(u.first_name, ' ', u.last_name), s.name) AS name,
                s.purpose,
                COALESCE(l.lab_name, s.lab) AS lab,
                s.status, s.started_at, s.ended_at
         FROM sit_in_sessions s
         LEFT JOIN users u ON s.id_number = u.id_number
         LEFT JOIN laboratories l ON s.lab_id = l.lab_id
         WHERE s.status = 'in_session'
         ORDER BY s.started_at DESC"
    );
    $currentSessions = $currentStmt->fetchAll();

    $endedStmt = $pdo->query(
        "SELECT s.sitIn_id, s.id_number,
                COALESCE(CONCAT(u.first_name, ' ', u.last_name), s.name) AS name,
                s.purpose,
                COALESCE(l.lab_name, s.lab) AS lab,
                s.status, s.started_at, s.ended_at
         FROM sit_in_sessions s
         LEFT JOIN users u ON s.id_number = u.id_number
         LEFT JOIN laboratories l ON s.lab_id = l.lab_id
         WHERE s.status = 'ended'
         ORDER BY s.ended_at DESC
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
