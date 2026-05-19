<?php
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

$allowed_origins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
];

if (in_array($origin, $allowed_origins, true)) {
    header("Access-Control-Allow-Origin: $origin");
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

$data = json_decode(file_get_contents("php://input"), true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid JSON payload."]);
    exit();
}

$idNumber = trim($data['id_number'] ?? '');
$currentPassword = $data['current_password'] ?? '';
$newPassword = $data['new_password'] ?? '';

if ($idNumber === '' || $currentPassword === '' || $newPassword === '') {
    http_response_code(422);
    echo json_encode(["error" => "All fields are required."]);
    exit();
}

if (strlen($newPassword) < 8) {
    http_response_code(422);
    echo json_encode(["error" => "New password must be at least 8 characters long."]);
    exit();
}

try {
    // Fetch current user
    $stmt = $pdo->prepare("SELECT password FROM users WHERE id_number = ? LIMIT 1");
    $stmt->execute([$idNumber]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(404);
        echo json_encode(["error" => "User not found."]);
        exit();
    }

    // Verify current password
    if (!password_verify($currentPassword, $user['password'])) {
        http_response_code(401);
        echo json_encode(["error" => "Incorrect current password."]);
        exit();
    }

    // Hash new password
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

    // Update password
    $updateStmt = $pdo->prepare("UPDATE users SET password = ? WHERE id_number = ?");
    $updateStmt->execute([$hashedPassword, $idNumber]);

    echo json_encode(["message" => "Password changed successfully."]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to change password.", "details" => $e->getMessage()]);
}
?>
