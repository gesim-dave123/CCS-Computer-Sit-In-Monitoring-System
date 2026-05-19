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
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/db_connection.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$idNumber = trim((string)($_GET['id_number'] ?? ''));
if ($idNumber === '') {
    http_response_code(422);
    echo json_encode(['error' => 'id_number is required']);
    exit();
}

try {
    $stmt = $pdo->prepare(
        "SELECT
            u.id_number,
            IFNULL(u.remaining_sessions, 30) AS remaining_sessions,
            IFNULL(u.used_session, 0) AS used_session,
            IFNULL(u.is_in_session, 0) AS is_in_session,
            (SELECT SUM(TIMESTAMPDIFF(MINUTE, started_at, ended_at)) 
             FROM sit_in_sessions 
             WHERE id_number = u.id_number AND ended_at IS NOT NULL) AS total_minutes
         FROM users u
         WHERE u.id_number = ?
           AND u.role = 'student'
         LIMIT 1"
    );
    $stmt->execute([$idNumber]);
    $row = $stmt->fetch();

    if (!$row) {
        http_response_code(404);
        echo json_encode(['error' => 'Student not found']);
        exit();
    }

    http_response_code(200);
    echo json_encode([
        'id_number' => $row['id_number'],
        'remaining_sessions' => (int)$row['remaining_sessions'],
        'is_in_session' => (int)$row['is_in_session'],
        'sessions_used' => (int)$row['used_session'],
        'total_duration_minutes' => (int)($row['total_minutes'] ?? 0),
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to load student session status',
        'details' => $e->getMessage(),
    ]);
}
