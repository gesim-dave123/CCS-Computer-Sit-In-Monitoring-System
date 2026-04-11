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
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/db_connection.php';

$resolveUserByIdNumber = function (PDO $pdo, string $idNumber) {
    $stmt = $pdo->prepare('SELECT id, id_number, role FROM users WHERE id_number = ? LIMIT 1');
    $stmt->execute([$idNumber]);
    return $stmt->fetch();
};

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $idNumber = trim((string)($_GET['id_number'] ?? ''));
    if ($idNumber === '') {
        http_response_code(422);
        echo json_encode(['error' => 'id_number is required']);
        exit();
    }

    $limit = (int)($_GET['limit'] ?? 15);
    if ($limit < 1) {
        $limit = 15;
    }
    if ($limit > 100) {
        $limit = 100;
    }

    $unreadOnly = isset($_GET['unread_only']) && (int)$_GET['unread_only'] === 1;

    try {
        $user = $resolveUserByIdNumber($pdo, $idNumber);
        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            exit();
        }

        $userId = (int)$user['id'];

        $notificationSql = "SELECT
                notification_id,
                user_id,
                announcement_id,
                title,
                message,
                category,
                is_read,
                read_at,
                action_url,
                expires_at,
                created_at
            FROM notifications
            WHERE user_id = ?
              AND (expires_at IS NULL OR expires_at > NOW())";

        if ($unreadOnly) {
            $notificationSql .= ' AND is_read = 0';
        }

        $notificationSql .= ' ORDER BY created_at DESC, notification_id DESC LIMIT ?';

        $notificationStmt = $pdo->prepare($notificationSql);
        $notificationStmt->bindValue(1, $userId, PDO::PARAM_INT);
        $notificationStmt->bindValue(2, $limit, PDO::PARAM_INT);
        $notificationStmt->execute();

        $notifications = $notificationStmt->fetchAll();

        $countStmt = $pdo->prepare(
            "SELECT COUNT(*) AS unread_count
             FROM notifications
             WHERE user_id = ?
               AND is_read = 0
               AND (expires_at IS NULL OR expires_at > NOW())"
        );
        $countStmt->execute([$userId]);
        $countRow = $countStmt->fetch();
        $unreadCount = $countRow ? (int)$countRow['unread_count'] : 0;

        http_response_code(200);
        echo json_encode([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
            'total' => count($notifications),
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'error' => 'Failed to load notifications.',
            'details' => $e->getMessage(),
        ]);
    }

    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON payload']);
    exit();
}

$idNumber = trim((string)($data['id_number'] ?? ''));
$action = strtolower(trim((string)($data['action'] ?? '')));

if ($idNumber === '') {
    http_response_code(422);
    echo json_encode(['error' => 'id_number is required']);
    exit();
}

if (!in_array($action, ['mark_read', 'mark_all_read'], true)) {
    http_response_code(422);
    echo json_encode(['error' => 'Invalid action']);
    exit();
}

try {
    $user = $resolveUserByIdNumber($pdo, $idNumber);
    if (!$user) {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
        exit();
    }

    $userId = (int)$user['id'];

    if ($action === 'mark_read') {
        $notificationId = (int)($data['notification_id'] ?? 0);
        if ($notificationId <= 0) {
            http_response_code(422);
            echo json_encode(['error' => 'notification_id is required']);
            exit();
        }

        $stmt = $pdo->prepare(
            "UPDATE notifications
             SET is_read = 1,
                 read_at = COALESCE(read_at, NOW())
             WHERE notification_id = ?
               AND user_id = ?"
        );
        $stmt->execute([$notificationId, $userId]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Notification not found']);
            exit();
        }

        echo json_encode([
            'message' => 'Notification marked as read',
            'notification_id' => $notificationId,
        ]);
        exit();
    }

    $stmt = $pdo->prepare(
        "UPDATE notifications
         SET is_read = 1,
             read_at = COALESCE(read_at, NOW())
         WHERE user_id = ?
           AND is_read = 0
           AND (expires_at IS NULL OR expires_at > NOW())"
    );
    $stmt->execute([$userId]);

    echo json_encode([
        'message' => 'All notifications marked as read',
        'updated_count' => $stmt->rowCount(),
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to update notifications.',
        'details' => $e->getMessage(),
    ]);
}
