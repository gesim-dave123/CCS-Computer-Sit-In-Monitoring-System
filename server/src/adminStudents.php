<?php
// Get the origin from the request
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

$idQuery = trim($_GET['id'] ?? '');
$page = max(1, (int)($_GET['page'] ?? 1));
$limit = 10;
$offset = ($page - 1) * $limit;

try {
    $countStmt = $pdo->prepare(
        "SELECT COUNT(*) AS total
         FROM users
         WHERE role = 'student'
           AND id_number LIKE ?"
    );
    $countStmt->execute(["%{$idQuery}%"]);
    $total = (int)($countStmt->fetch()['total'] ?? 0);

    $stmt = $pdo->prepare(
        "SELECT
            id_number,
            TRIM(CONCAT(first_name, ' ', COALESCE(middle_name, ''), ' ', last_name)) AS full_name,
            year_level,
            course,
            IFNULL(remaining_sessions, 30) AS remainingSessions,
            IFNULL(used_session, 0) AS usedSessions,
            IFNULL(is_in_session, 0) AS isInSession,
            email
         FROM users
         WHERE role = 'student'
           AND id_number LIKE ?
         ORDER BY id_number ASC
         LIMIT ? OFFSET ?"
    );
    $stmt->bindValue(1, "%{$idQuery}%", PDO::PARAM_STR);
    $stmt->bindValue(2, $limit, PDO::PARAM_INT);
    $stmt->bindValue(3, $offset, PDO::PARAM_INT);
    $stmt->execute();

    $students = $stmt->fetchAll();
    $totalPages = max(1, (int)ceil($total / $limit));

    echo json_encode([
        "students" => $students,
        "pagination" => [
            "page" => $page,
            "limit" => $limit,
            "total" => $total,
            "totalPages" => $totalPages,
        ],
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "error" => "Failed to load students",
        "details" => $e->getMessage(),
    ]);
}
