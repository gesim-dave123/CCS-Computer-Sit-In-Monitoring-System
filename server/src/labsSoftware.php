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
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 3600');
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/db_connection.php';

// ─── GET ────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    // Admin: list all global software
    if (isset($_GET['admin']) && $_GET['admin'] === '1') {
        try {
            $stmt = $pdo->query("SELECT software_id, software_name, category, icon_url, created_at FROM software ORDER BY software_name ASC");
            $software = $stmt->fetchAll();
            echo json_encode(['software' => $software]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to load software', 'details' => $e->getMessage()]);
        }
        exit();
    }

    // Student: get software for a specific lab
    if (isset($_GET['lab_id'])) {
        $labId = (int) $_GET['lab_id'];
        try {
            $stmt = $pdo->prepare(
                "SELECT s.software_id, s.software_name, s.category, s.icon_url
                 FROM software s
                 JOIN lab_software ls ON s.software_id = ls.software_id
                 WHERE ls.lab_id = ?
                 ORDER BY s.software_name ASC"
            );
            $stmt->execute([$labId]);
            $software = $stmt->fetchAll();
            echo json_encode(['software' => $software]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to load lab software', 'details' => $e->getMessage()]);
        }
        exit();
    }

    // Default: list all labs with their software
    try {
        $labsStmt = $pdo->query("SELECT lab_id, lab_name, room_number, seats, building, description FROM laboratories ORDER BY lab_name ASC");
        $labs = $labsStmt->fetchAll();

        $swStmt = $pdo->query(
            "SELECT ls.lab_id, s.software_id, s.software_name, s.category, s.icon_url
             FROM lab_software ls
             JOIN software s ON ls.software_id = s.software_id
             ORDER BY s.software_name ASC"
        );
        $allSw = $swStmt->fetchAll();

        // Group software by lab_id
        $map = [];
        foreach ($allSw as $row) {
            $map[(int)$row['lab_id']][] = [
                'software_id'   => $row['software_id'],
                'software_name' => $row['software_name'],
                'category'      => $row['category'],
                'icon_url'      => $row['icon_url'],
            ];
        }

        foreach ($labs as &$lab) {
            $lab['software'] = $map[(int)$lab['lab_id']] ?? [];
        }
        unset($lab);

        echo json_encode(['labs' => $labs]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to load labs', 'details' => $e->getMessage()]);
    }
    exit();
}

// ─── POST ───────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $action = $data['action'] ?? '';

    // ── Add software ──
    if ($action === 'add_software') {
        $name     = trim($data['software_name'] ?? '');
        $category = trim($data['category'] ?? '');
        $iconUrl  = trim($data['icon_url'] ?? '');

        if ($name === '') {
            http_response_code(422);
            echo json_encode(['error' => 'Software name is required']);
            exit();
        }

        try {
            $stmt = $pdo->prepare("INSERT INTO software (software_name, category, icon_url) VALUES (?, ?, ?)");
            $stmt->execute([$name, $category, $iconUrl ?: null]);
            echo json_encode(['message' => 'Software added', 'software_id' => (int)$pdo->lastInsertId()]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to add software', 'details' => $e->getMessage()]);
        }
        exit();
    }

    // ── Update software ──
    if ($action === 'update_software') {
        $id       = (int)($data['software_id'] ?? 0);
        $name     = trim($data['software_name'] ?? '');
        $category = trim($data['category'] ?? '');
        $iconUrl  = trim($data['icon_url'] ?? '');

        if ($id <= 0 || $name === '') {
            http_response_code(422);
            echo json_encode(['error' => 'Software ID and name are required']);
            exit();
        }

        try {
            $stmt = $pdo->prepare("UPDATE software SET software_name = ?, category = ?, icon_url = ? WHERE software_id = ?");
            $stmt->execute([$name, $category, $iconUrl ?: null, $id]);
            echo json_encode(['message' => 'Software updated']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update software', 'details' => $e->getMessage()]);
        }
        exit();
    }

    // ── Delete software ──
    if ($action === 'delete_software') {
        $id = (int)($data['software_id'] ?? 0);
        if ($id <= 0) {
            http_response_code(422);
            echo json_encode(['error' => 'Software ID is required']);
            exit();
        }

        try {
            $stmt = $pdo->prepare("DELETE FROM software WHERE software_id = ?");
            $stmt->execute([$id]);
            echo json_encode(['message' => 'Software deleted']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete software', 'details' => $e->getMessage()]);
        }
        exit();
    }

    // ── Assign software to lab ──
    if ($action === 'assign_software') {
        $labId = (int)($data['lab_id'] ?? 0);
        $swId  = (int)($data['software_id'] ?? 0);

        if ($labId <= 0 || $swId <= 0) {
            http_response_code(422);
            echo json_encode(['error' => 'Lab ID and Software ID are required']);
            exit();
        }

        try {
            $stmt = $pdo->prepare("INSERT IGNORE INTO lab_software (lab_id, software_id) VALUES (?, ?)");
            $stmt->execute([$labId, $swId]);
            echo json_encode(['message' => 'Software assigned to lab']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to assign software', 'details' => $e->getMessage()]);
        }
        exit();
    }

    // ── Remove software from lab ──
    if ($action === 'remove_software') {
        $labId = (int)($data['lab_id'] ?? 0);
        $swId  = (int)($data['software_id'] ?? 0);

        if ($labId <= 0 || $swId <= 0) {
            http_response_code(422);
            echo json_encode(['error' => 'Lab ID and Software ID are required']);
            exit();
        }

        try {
            $stmt = $pdo->prepare("DELETE FROM lab_software WHERE lab_id = ? AND software_id = ?");
            $stmt->execute([$labId, $swId]);
            echo json_encode(['message' => 'Software removed from lab']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to remove software', 'details' => $e->getMessage()]);
        }
        exit();
    }

    // ── Add laboratory ──
    if ($action === 'add_lab') {
        $labName    = trim($data['lab_name'] ?? '');
        $roomNumber = trim($data['room_number'] ?? '');
        $seats      = (int)($data['seats'] ?? 30);
        $building   = trim($data['building'] ?? 'CCS Building');

        if ($labName === '') {
            http_response_code(422);
            echo json_encode(['error' => 'Lab name is required']);
            exit();
        }
        if ($seats <= 0) $seats = 30;

        try {
            $stmt = $pdo->prepare("INSERT INTO laboratories (lab_name, room_number, seats, building) VALUES (?, ?, ?, ?)");
            $stmt->execute([$labName, $roomNumber ?: null, $seats, $building]);
            echo json_encode(['message' => 'Laboratory added', 'lab_id' => (int)$pdo->lastInsertId()]);
        } catch (PDOException $e) {
            if (str_contains($e->getMessage(), 'Duplicate') || $e->getCode() === '23000') {
                http_response_code(409);
                echo json_encode(['error' => 'A laboratory with this name already exists']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to add laboratory', 'details' => $e->getMessage()]);
            }
        }
        exit();
    }

    // ── Update laboratory ──
    if ($action === 'update_lab') {
        $labId      = (int)($data['lab_id'] ?? 0);
        $labName    = trim($data['lab_name'] ?? '');
        $roomNumber = trim($data['room_number'] ?? '');
        $seats      = (int)($data['seats'] ?? 30);
        $building   = trim($data['building'] ?? 'CCS Building');

        if ($labId <= 0 || $labName === '') {
            http_response_code(422);
            echo json_encode(['error' => 'Lab ID and name are required']);
            exit();
        }
        if ($seats <= 0) $seats = 30;

        try {
            $stmt = $pdo->prepare("UPDATE laboratories SET lab_name = ?, room_number = ?, seats = ?, building = ? WHERE lab_id = ?");
            $stmt->execute([$labName, $roomNumber ?: null, $seats, $building, $labId]);
            echo json_encode(['message' => 'Laboratory updated']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update laboratory', 'details' => $e->getMessage()]);
        }
        exit();
    }

    // ── Delete laboratory ──
    if ($action === 'delete_lab') {
        $labId = (int)($data['lab_id'] ?? 0);
        if ($labId <= 0) {
            http_response_code(422);
            echo json_encode(['error' => 'Lab ID is required']);
            exit();
        }

        try {
            // Remove software assignments first
            $pdo->prepare("DELETE FROM lab_software WHERE lab_id = ?")->execute([$labId]);
            // Delete the lab
            $stmt = $pdo->prepare("DELETE FROM laboratories WHERE lab_id = ?");
            $stmt->execute([$labId]);
            echo json_encode(['message' => 'Laboratory deleted']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete laboratory', 'details' => $e->getMessage()]);
        }
        exit();
    }

    http_response_code(400);
    echo json_encode(['error' => 'Unknown action']);
    exit();
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
