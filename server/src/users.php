<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/db_connection.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    case 'GET':
        $stmt = $pdo->query("SELECT id, id_number, first_name, middle_name, last_name,
                                    course, year_level, email, address, created_at
                             FROM users");
        echo json_encode($stmt->fetchAll());
        break;

    // ── POST: register a new user ────────────────────────────────────────────
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);

        // --- required fields validation ---
        $required = ['id_number', 'first_name', 'last_name', 'course',
                     'year_level', 'email', 'address', 'password'];

        foreach ($required as $field) {
            if (empty($data[$field])) {
                http_response_code(422);
                echo json_encode(["error" => "Field '$field' is required."]);
                exit();
            }
        }

        // --- duplicate email check ---
        $check = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $check->execute([$data['email']]);
        if ($check->fetch()) {
            http_response_code(409);
            echo json_encode(["error" => "Email is already registered."]);
            exit();
        }

        // --- duplicate id_number check ---
        $checkId = $pdo->prepare("SELECT id FROM users WHERE id_number = ?");
        $checkId->execute([$data['id_number']]);
        if ($checkId->fetch()) {
            http_response_code(409);
            echo json_encode(["error" => "ID number is already registered."]);
            exit();
        }

        // --- hash the password ---
        $hashedPassword = password_hash($data['password'], PASSWORD_BCRYPT);

        // --- insert user into database ---
        $stmt = $pdo->prepare("INSERT INTO users (id_number, first_name, middle_name, last_name, 
                                                   course, year_level, email, address, password)
                              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        try {
            $stmt->execute([
                $data['id_number'],
                $data['first_name'],
                $data['middle_name'] ?? null,
                $data['last_name'],
                $data['course'],
                $data['year_level'],
                $data['email'],
                $data['address'],
                $hashedPassword
            ]);

            http_response_code(201);
            echo json_encode([
                "message" => "User registered successfully!",
                "user_id" => $pdo->lastInsertId()
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Registration failed: " . $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        break;
}
?>
