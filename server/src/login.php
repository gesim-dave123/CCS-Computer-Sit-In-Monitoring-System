<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Get the origin from the request
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// CORS headers (needed for both Apache and PHP built-in server)
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
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 3600');
header("Content-Type: application/json; charset=UTF-8");

function debug_log($message) {
    error_log("[" . date('Y-m-d H:i:s') . "] " . $message);
}

debug_log("Login request - Method: " . $_SERVER['REQUEST_METHOD']);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../vendor/autoload.php'; // for JWT and dotenv
require_once '../config/db_connection.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Dotenv\Dotenv;

// Load .env variables
$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

$SECRET_KEY = $_ENV['SECRET_KEY'] ?? 'default_secret_key';

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit();
}

// Get JSON input
$data = json_decode(file_get_contents("php://input"), true);

// Validate input
if (empty($data['id_number']) || empty($data['password'])) {
    http_response_code(422);
    echo json_encode(["error" => "ID number and password are required"]);
    exit();
}

$idNumber = $data['id_number'];
$password = $data['password'];

try {
    // Find user
    $stmt = $pdo->prepare("SELECT id_number, first_name, last_name, middle_name, course,year_level, address, email,role, profilePicture, remaining_sessions, password FROM users WHERE id_number = ?");
    $stmt->execute([$idNumber]);

    $user = $stmt->fetch();

    // Check if user exists
    if (!$user) {
        http_response_code(401);
        echo json_encode(["error" => "Invalid ID number or password"]);
        exit();
    }

    // Verify password
    if (!password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode(["error" => "Invalid ID number or password"]);
        exit();
    }

    // Remove password before sending
    unset($user['password']);

    // ── JWT Token generation ───────────────────────────────
    $issuedAt = time();
    $expirationTime = $issuedAt + 3600; // 1 hour

    $payload = [
        "iat" => $issuedAt,
        "exp" => $expirationTime,
        "user" => [
            "id_number" => $user['id_number'],
            "first_name" => $user['first_name'],
            "last_name" => $user['last_name'],
            "middle_name" => $user['middle_name'],
            "course" => $user['course'],
            "year_level" => $user['year_level'],
            "email" => $user['email'],
            "address" => $user['address'],
            "role" => $user['role'],
            "profilePicture" => $user['profilePicture'],
            "remaining_sessions" => $user['remaining_sessions']
        ]
    ];

    $jwt = JWT::encode($payload, $SECRET_KEY, 'HS256');

    // Success response
    http_response_code(200);
    echo json_encode([
        "message" => "Login successful",
        "token" => $jwt,
        "user" => $user
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "error" => "Server error",
        "details" => $e->getMessage()
    ]);
}