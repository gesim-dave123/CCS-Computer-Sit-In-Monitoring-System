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
$purpose = trim($data['purpose'] ?? '');
$labId = (int)($data['lab_id'] ?? 0);
$labText = trim($data['lab'] ?? ''); // legacy fallback

if ($idNumber === '' || $purpose === '') {
    http_response_code(422);
    echo json_encode(["error" => "ID number and purpose are required"]);
    exit();
}

if ($labId <= 0 && $labText === '') {
    http_response_code(422);
    echo json_encode(["error" => "Lab is required"]);
    exit();
}

try {
    $pdo->beginTransaction();

    $userStmt = $pdo->prepare("SELECT id, first_name, last_name, remaining_sessions, used_session, is_in_session FROM users WHERE id_number = ? AND role = 'student' LIMIT 1 FOR UPDATE");
    $userStmt->execute([$idNumber]);
    $user = $userStmt->fetch();

    if (!$user) {
        $pdo->rollBack();
        http_response_code(404);
        echo json_encode(["error" => "Student not found"]);
        exit();
    }

    $name = trim($user['first_name'] . ' ' . $user['last_name']);

    // Resolve lab
    if ($labId > 0) {
        $labStmt = $pdo->prepare("SELECT lab_id, lab_name FROM laboratories WHERE lab_id = ? LIMIT 1");
        $labStmt->execute([$labId]);
        $labRow = $labStmt->fetch();
    } else {
        $labStmt = $pdo->prepare("SELECT lab_id, lab_name FROM laboratories WHERE lab_name = ? LIMIT 1");
        $labStmt->execute([$labText]);
        $labRow = $labStmt->fetch();
    }
    $resolvedLabId = $labRow ? (int)$labRow['lab_id'] : null;
    $lab = $labRow ? $labRow['lab_name'] : ($labText ?: 'Unknown');

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

    $insertStmt = $pdo->prepare("INSERT INTO sit_in_sessions (id_number, name, purpose, lab, lab_id, status) VALUES (?, ?, ?, ?, ?, 'in_session')");
    $insertStmt->execute([$idNumber, $name, $purpose, $lab, $resolvedLabId]);
    $sitInId = (int)$pdo->lastInsertId();

    $updateStmt = $pdo->prepare("UPDATE users SET is_in_session = 1 WHERE id = ?");
    $updateStmt->execute([(int)$user['id']]);

    $notifyStmt = $pdo->prepare(
        "INSERT INTO notifications (user_id, title, message, category, is_read, action_url)
         VALUES (?, ?, ?, 'sit_in', 0, ?)"
    );
    $notifyStmt->execute([
        (int)$user['id'],
        'Sit-In Session Started',
        "Your sit-in session has started in {$lab} for {$purpose}.",
        '/dashboard',
    ]);

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
            "used_session" => (int)$user['used_session'],
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
