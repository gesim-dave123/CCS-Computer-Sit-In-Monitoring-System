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

require_once '../config/db_connection.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit();
}

try {
    $studentsStmt = $pdo->query("SELECT COUNT(*) AS total FROM users WHERE role = 'student'");
    $registeredStudents = (int)($studentsStmt->fetch()['total'] ?? 0);

    $currentStmt = $pdo->query("SELECT COUNT(*) AS total FROM users WHERE role = 'student' AND IFNULL(is_in_session, 0) = 1");
    $currentSitIns = (int)($currentStmt->fetch()['total'] ?? 0);

    $totalSitInsStmt = $pdo->query("SELECT COUNT(*) AS total FROM sit_in_sessions");
    $totalSitIns = (int)($totalSitInsStmt->fetch()['total'] ?? 0);

    $labsStmt = $pdo->query("SELECT COUNT(*) AS total FROM laboratories");
    $totalLabs = (int)($labsStmt->fetch()['total'] ?? 0);

    $reservationsStmt = $pdo->query("SELECT COUNT(*) AS total FROM reservations");
    $totalReservations = (int)($reservationsStmt->fetch()['total'] ?? 0);

    $announcementStmt = $pdo->query("SELECT COUNT(*) AS total FROM announcements");
    $announcementCount = (int)($announcementStmt->fetch()['total'] ?? 0);

    $purposesStmt = $pdo->query(
        "SELECT purpose, COUNT(*) AS total
         FROM sit_in_sessions
         GROUP BY purpose
         ORDER BY total DESC"
    );
    $purposeRows = $purposesStmt->fetchAll();

    $palette = [
        '#381872', '#5428a8', '#6b3fd0', '#8458e6', '#a07ff0', '#bda4f8', '#d8ccfc',
    ];

    $purposeTotal = array_sum(array_map(fn($row) => (int)$row['total'], $purposeRows));
    $purposes = [];
    foreach ($purposeRows as $idx => $row) {
        $count = (int)$row['total'];
        $percent = $purposeTotal > 0 ? round(($count / $purposeTotal) * 100, 2) : 0;
        $purposes[] = [
            'label' => $row['purpose'] ?: 'Unspecified',
            'count' => $count,
            'percent' => $percent,
            'color' => $palette[$idx % count($palette)],
        ];
    }

    $labUsageStmt = $pdo->query(
        "SELECT 
            COALESCE(l.lab_name, s.lab) AS lab_name,
            COUNT(*) AS total_sessions
         FROM sit_in_sessions s
         LEFT JOIN laboratories l ON s.lab_id = l.lab_id
         GROUP BY lab_name
         ORDER BY total_sessions DESC
         LIMIT 6"
    );
    $labUsageRows = $labUsageStmt->fetchAll();
    $labUsage = array_map(fn($row) => [
        'label' => $row['lab_name'] ?: 'Unknown',
        'count' => (int)$row['total_sessions']
    ], $labUsageRows);

    $leaderboardStmt = $pdo->query(
        "SELECT
            u.id_number,
            TRIM(CONCAT(u.first_name, ' ', COALESCE(u.middle_name, ''), ' ', u.last_name)) AS full_name,
            IFNULL(SUM(TIMESTAMPDIFF(SECOND, s.started_at, s.ended_at)), 0) / 3600 AS total_hours
         FROM users u
         LEFT JOIN sit_in_sessions s ON u.id_number = s.id_number AND s.status = 'ended'
         WHERE u.role = 'student'
         GROUP BY u.id_number
         ORDER BY total_hours DESC, u.id_number ASC
         LIMIT 15"
    );
    $leaderboardRows = $leaderboardStmt->fetchAll();
    $leaderboard = array_map(
        fn($row) => [
            'id_number' => $row['id_number'],
            'full_name' => trim((string)$row['full_name']) !== '' ? $row['full_name'] : $row['id_number'],
            'total_hours' => round((float)$row['total_hours'], 1),
        ],
        $leaderboardRows
    );

    echo json_encode([
        'stats' => [
            'registeredStudents' => $registeredStudents,
            'currentSitIns' => $currentSitIns,
            'totalSitIns' => $totalSitIns,
            'totalLabs' => $totalLabs,
            'totalReservations' => $totalReservations,
            'announcementCount' => $announcementCount,
            'purposes' => $purposes,
            'labUsage' => $labUsage,
            'leaderboard' => $leaderboard,
        ],
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to load dashboard stats',
        'details' => $e->getMessage(),
    ]);
}
