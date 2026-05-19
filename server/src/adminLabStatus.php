<?php
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
if (in_array($origin, $allowed_origins, true)) { header("Access-Control-Allow-Origin: $origin"); }
header('Vary: Origin');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(); }

require_once '../config/db_connection.php';

$lab_id = (int)($_GET['lab_id'] ?? 0);

if ($lab_id <= 0) {
    http_response_code(400);
    echo json_encode(["error" => "Valid Lab ID is required."]);
    exit();
}

try {
    // Get lab capacity
    $labStmt = $pdo->prepare("SELECT seats, lab_name FROM laboratories WHERE lab_id = ?");
    $labStmt->execute([$lab_id]);
    $lab = $labStmt->fetch(PDO::FETCH_ASSOC);

    if (!$lab) {
        http_response_code(404);
        echo json_encode(["error" => "Laboratory not found."]);
        exit();
    }

    // Get occupied seats
    $sessionStmt = $pdo->prepare(
        "SELECT pc_number, id_number, name 
         FROM sit_in_sessions 
         WHERE lab_id = ? AND status = 'in_session' 
         AND pc_number IS NOT NULL"
    );
    $sessionStmt->execute([$lab_id]);
    $occupied = $sessionStmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "lab_name" => $lab['lab_name'],
        "capacity" => (int)$lab['seats'],
        "occupied" => $occupied
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
