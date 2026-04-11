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

$idNumber = trim((string)($_GET['id_number'] ?? ''));
if ($idNumber === '') {
    http_response_code(422);
    echo json_encode(["error" => "id_number is required"]);
    exit();
}

$limit = (int)($_GET['limit'] ?? 100);
if ($limit < 1) {
    $limit = 100;
}
if ($limit > 500) {
    $limit = 500;
}

try {
    $userStmt = $pdo->prepare("SELECT id FROM users WHERE id_number = ? LIMIT 1");
    $userStmt->execute([$idNumber]);
    $userRow = $userStmt->fetch();
    $userId = $userRow ? (int)$userRow['id'] : null;

    if ($userId !== null) {
        $stmt = $pdo->prepare(
            "SELECT
                s.sitIn_id,
                s.id_number,
                s.name,
                s.purpose,
                s.lab,
                s.status,
                s.started_at,
                s.ended_at,
                f.feedback_id,
                f.subject AS feedback_subject,
                f.message AS feedback_message,
                f.rating AS feedback_rating,
                f.category AS feedback_category,
                f.status AS feedback_status,
                f.responded_at AS feedback_responded_at,
                f.created_at AS feedback_created_at
             FROM sit_in_sessions s
             LEFT JOIN feedback f
                ON f.sit_in_id = s.sitIn_id
               AND f.user_id = ?
             WHERE s.id_number = ?
             ORDER BY s.started_at DESC, s.sitIn_id DESC
             LIMIT ?"
        );
        $stmt->bindValue(1, $userId, PDO::PARAM_INT);
        $stmt->bindValue(2, $idNumber, PDO::PARAM_STR);
        $stmt->bindValue(3, $limit, PDO::PARAM_INT);
    } else {
        $stmt = $pdo->prepare(
            "SELECT
                s.sitIn_id,
                s.id_number,
                s.name,
                s.purpose,
                s.lab,
                s.status,
                s.started_at,
                s.ended_at,
                f.feedback_id,
                f.subject AS feedback_subject,
                f.message AS feedback_message,
                f.rating AS feedback_rating,
                f.category AS feedback_category,
                f.status AS feedback_status,
                f.responded_at AS feedback_responded_at,
                f.created_at AS feedback_created_at
             FROM sit_in_sessions s
             LEFT JOIN feedback f
                ON f.sit_in_id = s.sitIn_id
             WHERE s.id_number = ?
             ORDER BY s.started_at DESC, s.sitIn_id DESC
             LIMIT ?"
        );
        $stmt->bindValue(1, $idNumber, PDO::PARAM_STR);
        $stmt->bindValue(2, $limit, PDO::PARAM_INT);
    }

    $stmt->execute();

    $rows = $stmt->fetchAll();
    $history = [];

    foreach ($rows as $row) {
        $history[] = [
            'sitIn_id' => (int)$row['sitIn_id'],
            'id_number' => $row['id_number'],
            'name' => $row['name'],
            'purpose' => $row['purpose'],
            'lab' => $row['lab'],
            'status' => $row['status'],
            'started_at' => $row['started_at'],
            'ended_at' => $row['ended_at'],
            'feedback' => $row['feedback_id']
                ? [
                    'feedback_id' => (int)$row['feedback_id'],
                    'subject' => $row['feedback_subject'],
                    'message' => $row['feedback_message'],
                    'rating' => $row['feedback_rating'] !== null ? (int)$row['feedback_rating'] : null,
                    'category' => $row['feedback_category'],
                    'status' => $row['feedback_status'],
                    'responded_at' => $row['feedback_responded_at'],
                    'created_at' => $row['feedback_created_at'],
                ]
                : null,
        ];
    }

    echo json_encode([
        'history' => $history,
        'total' => count($history),
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to load sit-in history',
        'details' => $e->getMessage(),
    ]);
}
