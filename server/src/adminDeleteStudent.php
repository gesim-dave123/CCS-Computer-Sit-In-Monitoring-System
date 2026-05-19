<?php
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
if (in_array($origin, $allowed_origins, true)) { header("Access-Control-Allow-Origin: $origin"); }
header('Vary: Origin');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(); }

require_once '../config/db_connection.php';

$data = json_decode(file_get_contents("php://input"), true);
$id_number = $data['id_number'] ?? '';

if (!$id_number) {
    http_response_code(400);
    echo json_encode(["error" => "Student ID is required."]);
    exit();
}

try {
    $stmt = $pdo->prepare("DELETE FROM users WHERE id_number = ? AND role = 'student'");
    $stmt->execute([$id_number]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(["message" => "Student deleted successfully."]);
    } else {
        http_response_code(404);
        echo json_encode(["error" => "Student not found or not a student."]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
