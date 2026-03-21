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

$sitInId = (int)($data['sitIn_id'] ?? 0);
if ($sitInId <= 0) {
    http_response_code(422);
    echo json_encode(["error" => "sitIn_id is required"]);
    exit();
}

try {
    $pdo->beginTransaction();

    $sessionStmt = $pdo->prepare("SELECT sitIn_id, id_number, status FROM sit_in_sessions WHERE sitIn_id = ? LIMIT 1 FOR UPDATE");
    $sessionStmt->execute([$sitInId]);
    $session = $sessionStmt->fetch();

    if (!$session) {
        $pdo->rollBack();
        http_response_code(404);
        echo json_encode(["error" => "Sit-in record not found"]);
        exit();
    }

    if ($session['status'] === 'ended') {
        $pdo->rollBack();
        http_response_code(409);
        echo json_encode(["error" => "Session is already ended"]);
        exit();
    }

    $updateSession = $pdo->prepare("UPDATE sit_in_sessions SET status = 'ended', ended_at = NOW() WHERE sitIn_id = ?");
    $updateSession->execute([$sitInId]);

    $updateUser = $pdo->prepare("UPDATE users SET is_in_session = 0, remaining_sessions = CASE WHEN remaining_sessions > 0 THEN remaining_sessions - 1 ELSE 0 END WHERE id_number = ?");
    $updateUser->execute([$session['id_number']]);

    $pdo->commit();

    echo json_encode([
        "message" => "Sit-in ended",
        "sitIn_id" => $sitInId,
    ]);
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        "error" => "Failed to end sit-in",
        "details" => $e->getMessage(),
    ]);
}
