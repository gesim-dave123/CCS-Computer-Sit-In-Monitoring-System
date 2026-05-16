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
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
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

    // ── Admin: aggregate summary ──
    if (isset($_GET['admin']) && $_GET['admin'] === '1' && isset($_GET['summary']) && $_GET['summary'] === '1') {
        try {
            $totalStmt = $pdo->query("SELECT COUNT(*) AS total FROM testimonials WHERE is_deleted = 0");
            $total = (int)($totalStmt->fetch()['total'] ?? 0);

            $avgStmt = $pdo->query("SELECT ROUND(AVG(rating), 2) AS avg_rating FROM testimonials WHERE is_deleted = 0");
            $avgRating = (float)($avgStmt->fetch()['avg_rating'] ?? 0);

            $catStmt = $pdo->query(
                "SELECT COALESCE(category, 'Uncategorized') AS category, COUNT(*) AS count
                 FROM testimonials
                 WHERE is_deleted = 0
                 GROUP BY category
                 ORDER BY count DESC"
            );
            $categories = $catStmt->fetchAll();

            $ratingStmt = $pdo->query(
                "SELECT rating, COUNT(*) AS count
                 FROM testimonials
                 WHERE is_deleted = 0
                 GROUP BY rating
                 ORDER BY rating DESC"
            );
            $ratings = $ratingStmt->fetchAll();

            echo json_encode([
                'total'      => $total,
                'avg_rating' => $avgRating,
                'by_category' => $categories,
                'by_rating'  => $ratings,
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to load summary', 'details' => $e->getMessage()]);
        }
        exit();
    }

    // ── Admin: paginated list with filters ──
    if (isset($_GET['admin']) && $_GET['admin'] === '1') {
        $page     = max(1, (int)($_GET['page'] ?? 1));
        $perPage  = 15;
        $offset   = ($page - 1) * $perPage;
        $rating   = $_GET['rating'] ?? '';
        $category = $_GET['category'] ?? '';
        $search   = trim($_GET['search'] ?? '');

        $where = ["t.is_deleted = 0"];
        $params = [];

        if ($rating !== '' && $rating !== 'all') {
            $where[] = "t.rating = ?";
            $params[] = (int)$rating;
        }
        if ($category !== '' && $category !== 'all') {
            $where[] = "t.category = ?";
            $params[] = $category;
        }
        if ($search !== '') {
            $where[] = "(u.first_name LIKE ? OR u.last_name LIKE ? OR t.comment LIKE ?)";
            $searchParam = "%$search%";
            $params[] = $searchParam;
            $params[] = $searchParam;
            $params[] = $searchParam;
        }

        $whereClause = implode(' AND ', $where);

        try {
            // Count
            $countSql = "SELECT COUNT(*) AS total
                         FROM testimonials t
                         LEFT JOIN users u ON t.student_id = u.id_number
                         WHERE $whereClause";
            $countStmt = $pdo->prepare($countSql);
            $countStmt->execute($params);
            $total = (int)($countStmt->fetch()['total'] ?? 0);

            // Rows
            $sql = "SELECT t.testimonial_id, t.student_id, t.rating, t.category, t.comment,
                           t.is_visible, t.created_at,
                           COALESCE(CONCAT(u.first_name, ' ', u.last_name), t.student_id) AS student_name
                    FROM testimonials t
                    LEFT JOIN users u ON t.student_id = u.id_number
                    WHERE $whereClause
                    ORDER BY t.created_at DESC
                    LIMIT $perPage OFFSET $offset";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $rows = $stmt->fetchAll();

            echo json_encode([
                'testimonials' => $rows,
                'total'        => $total,
                'page'         => $page,
                'per_page'     => $perPage,
                'total_pages'  => (int)ceil($total / $perPage),
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to load testimonials', 'details' => $e->getMessage()]);
        }
        exit();
    }

    // ── Student: retrieve own testimonials ──
    if (isset($_GET['my']) && $_GET['my'] === '1') {
        $studentId = $_GET['student_id'] ?? '';
        if ($studentId === '') {
            http_response_code(422);
            echo json_encode(['error' => 'Student ID is required']);
            exit();
        }

        try {
            $stmt = $pdo->prepare(
                "SELECT testimonial_id, rating, category, comment, is_visible, created_at
                 FROM testimonials
                 WHERE student_id = ? AND is_deleted = 0
                 ORDER BY created_at DESC"
            );
            $stmt->execute([$studentId]);
            $rows = $stmt->fetchAll();
            echo json_encode(['testimonials' => $rows]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to load testimonials', 'details' => $e->getMessage()]);
        }
        exit();
    }

    // ── Public: featured testimonials for landing page ──
    if (isset($_GET['featured']) && $_GET['featured'] === '1') {
        $limit = min(20, max(1, (int)($_GET['limit'] ?? 12)));
        try {
            $stmt = $pdo->prepare(
                "SELECT t.testimonial_id, t.rating, t.category, t.comment, t.created_at,
                        COALESCE(CONCAT(u.first_name, ' ', u.last_name), t.student_id) AS student_name,
                        COALESCE(u.course, '') AS course
                 FROM testimonials t
                 LEFT JOIN users u ON t.student_id = u.id_number
                 WHERE t.is_visible = 1 AND t.is_deleted = 0
                 ORDER BY t.created_at DESC
                 LIMIT ?"
            );
            $stmt->bindValue(1, $limit, PDO::PARAM_INT);
            $stmt->execute();
            $rows = $stmt->fetchAll();
            echo json_encode(['testimonials' => $rows]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to load testimonials', 'details' => $e->getMessage()]);
        }
        exit();
    }

    http_response_code(400);
    echo json_encode(['error' => 'Missing required query parameters']);
    exit();
}

// ─── POST ───────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data   = json_decode(file_get_contents("php://input"), true);
    $action = $data['action'] ?? '';

    // ── Student: submit testimonial ──
    if ($action === 'submit') {
        $studentId = trim($data['student_id'] ?? '');
        $rating    = (int)($data['rating'] ?? 0);
        $category  = trim($data['category'] ?? '');
        $comment   = trim($data['comment'] ?? '');

        if ($studentId === '' || $comment === '' || $rating < 1 || $rating > 5) {
            http_response_code(422);
            echo json_encode(['error' => 'Student ID, comment (non-empty), and rating (1-5) are required']);
            exit();
        }

        try {
            $stmt = $pdo->prepare(
                "INSERT INTO testimonials (student_id, rating, category, comment) VALUES (?, ?, ?, ?)"
            );
            $stmt->execute([$studentId, $rating, $category, $comment]);
            echo json_encode(['message' => 'Testimonial submitted successfully', 'testimonial_id' => (int)$pdo->lastInsertId()]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to submit testimonial', 'details' => $e->getMessage()]);
        }
        exit();
    }

    // ── Admin: toggle visibility ──
    if ($action === 'toggle_visibility') {
        $id = (int)($data['testimonial_id'] ?? 0);
        if ($id <= 0) {
            http_response_code(422);
            echo json_encode(['error' => 'Testimonial ID is required']);
            exit();
        }

        try {
            $stmt = $pdo->prepare("UPDATE testimonials SET is_visible = NOT is_visible WHERE testimonial_id = ?");
            $stmt->execute([$id]);
            echo json_encode(['message' => 'Visibility toggled']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to toggle visibility', 'details' => $e->getMessage()]);
        }
        exit();
    }

    // ── Admin: soft-delete ──
    if ($action === 'soft_delete') {
        $id = (int)($data['testimonial_id'] ?? 0);
        if ($id <= 0) {
            http_response_code(422);
            echo json_encode(['error' => 'Testimonial ID is required']);
            exit();
        }

        try {
            $stmt = $pdo->prepare("UPDATE testimonials SET is_deleted = 1 WHERE testimonial_id = ?");
            $stmt->execute([$id]);
            echo json_encode(['message' => 'Testimonial deleted']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete testimonial', 'details' => $e->getMessage()]);
        }
        exit();
    }

    http_response_code(400);
    echo json_encode(['error' => 'Unknown action']);
    exit();
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
