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

$sitInId = (int)($data['sitIn_id'] ?? 0);
if ($sitInId <= 0) {
    http_response_code(422);
    echo json_encode(["error" => "sitIn_id is required"]);
    exit();
}

$feedback = $data['feedback'] ?? null;
if (!is_array($feedback)) {
    http_response_code(422);
    echo json_encode(["error" => "Feedback is required when ending a session"]);
    exit();
}

$feedbackSubject = trim((string)($feedback['subject'] ?? ''));
$feedbackMessage = trim((string)($feedback['message'] ?? ''));
$feedbackCategory = strtolower(trim((string)($feedback['category'] ?? 'general')));
$feedbackRatingRaw = $feedback['rating'] ?? null;
$adminIdNumber = trim((string)($data['admin_id_number'] ?? ''));

if ($feedbackSubject === '' || $feedbackMessage === '') {
    http_response_code(422);
    echo json_encode(["error" => "Feedback subject and message are required"]);
    exit();
}

$allowedCategories = ['general', 'bug', 'feature', 'complaint', 'other'];
if (!in_array($feedbackCategory, $allowedCategories, true)) {
    http_response_code(422);
    echo json_encode(["error" => "Invalid feedback category"]);
    exit();
}

$feedbackRating = null;
if ($feedbackRatingRaw !== null && $feedbackRatingRaw !== '') {
    $feedbackRating = (int)$feedbackRatingRaw;
    if ($feedbackRating < 1 || $feedbackRating > 5) {
        http_response_code(422);
        echo json_encode(["error" => "Feedback rating must be between 1 and 5"]);
        exit();
    }
}

try {
    $pdo->beginTransaction();

    $sessionStmt = $pdo->prepare("SELECT sitIn_id, id_number, purpose, lab, status FROM sit_in_sessions WHERE sitIn_id = ? LIMIT 1 FOR UPDATE");
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

    $updateUser = $pdo->prepare("UPDATE users SET is_in_session = 0, used_session = IFNULL(used_session, 0) + 1, remaining_sessions = CASE WHEN remaining_sessions > 0 THEN remaining_sessions - 1 ELSE 0 END WHERE id_number = ?");
    $updateUser->execute([$session['id_number']]);

    $studentStmt = $pdo->prepare("SELECT id, remaining_sessions, used_session FROM users WHERE id_number = ? LIMIT 1");
    $studentStmt->execute([$session['id_number']]);
    $student = $studentStmt->fetch();

    if (!$student) {
        $pdo->rollBack();
        http_response_code(404);
        echo json_encode(["error" => "Student record not found"]);
        exit();
    }

    $adminUserId = null;
    if ($adminIdNumber !== '') {
        $adminStmt = $pdo->prepare("SELECT id FROM users WHERE id_number = ? AND role = 'admin' LIMIT 1");
        $adminStmt->execute([$adminIdNumber]);
        $admin = $adminStmt->fetch();
        $adminUserId = $admin ? (int)$admin['id'] : null;
    }

    $insertFeedback = $pdo->prepare(
        "INSERT INTO feedback (
            sit_in_id,
            user_id,
            subject,
            message,
            rating,
            category,
            status,
            responded_by,
            responded_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'resolved', ?, NOW())"
    );
    $insertFeedback->execute([
        $sitInId,
        (int)$student['id'],
        $feedbackSubject,
        $feedbackMessage,
        $feedbackRating,
        $feedbackCategory,
        $adminUserId,
    ]);
    $feedbackId = (int)$pdo->lastInsertId();

    $notifyStmt = $pdo->prepare(
        "INSERT INTO notifications (user_id, title, message, category, is_read, action_url)
         VALUES (?, ?, ?, 'sit_in', 0, ?)"
    );
    $notifyStmt->execute([
        (int)$student['id'],
        'Sit-In Session Ended',
        "Your sit-in session #{$sitInId} in {$session['lab']} has ended. Remaining sessions: " . (int)$student['remaining_sessions'] . ".",
        '/dashboard/history',
    ]);

    $pdo->commit();

    echo json_encode([
        "message" => "Sit-in ended",
        "sitIn_id" => $sitInId,
        "used_session" => (int)$student['used_session'],
        "feedback_id" => $feedbackId,
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
