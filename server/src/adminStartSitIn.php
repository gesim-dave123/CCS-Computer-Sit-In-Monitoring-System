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
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 3600');
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/db_connection.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid JSON payload"]);
    exit();
}

$idNumber = trim($data['id_number'] ?? '');
$name = trim($data['name'] ?? '');
$purpose = trim($data['purpose'] ?? '');
$lab = trim($data['lab'] ?? '');

if ($idNumber === '' || $name === '' || $purpose === '' || $lab === '') {
    http_response_code(422);
    echo json_encode(["error" => "ID number, name, purpose, and lab are required"]);
    exit();
}

try {
    $pdo->beginTransaction();

    $userStmt = $pdo->prepare("SELECT id, remaining_sessions, is_in_session FROM users WHERE id_number = ? AND role = 'student' LIMIT 1 FOR UPDATE");
    $userStmt->execute([$idNumber]);
    $user = $userStmt->fetch();

    if (!$user) {
        $pdo->rollBack();
        http_response_code(404);
        echo json_encode(["error" => "Student not found"]);
        exit();
    }

    if ((int)$user['is_in_session'] === 1) {
        $pdo->rollBack();
        http_response_code(409);
        echo json_encode(["error" => "Student is already in session"]);
        exit();
    }

    if ((int)$user['remaining_sessions'] <= 0) {
        $pdo->rollBack();
        http_response_code(409);
        echo json_encode(["error" => "Student has no remaining sessions"]);
        exit();
    }

    $insertStmt = $pdo->prepare("INSERT INTO sit_in_sessions (id_number, name, purpose, lab, status) VALUES (?, ?, ?, ?, 'in_session')");
    $insertStmt->execute([$idNumber, $name, $purpose, $lab]);
    $sitInId = (int)$pdo->lastInsertId();

    $updateStmt = $pdo->prepare("UPDATE users SET is_in_session = 1 WHERE id = ?");
    $updateStmt->execute([(int)$user['id']]);

    $pdo->commit();

    http_response_code(200);
    echo json_encode([
        "message" => "Sit-in started",
        "session" => [
            "sitIn_id" => $sitInId,
            "id_number" => $idNumber,
            "name" => $name,
            "purpose" => $purpose,
            "lab" => $lab,
            "status" => "in_session",
        ],
    ]);
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        "error" => "Failed to start sit-in",
        "details" => $e->getMessage(),
    ]);
}
