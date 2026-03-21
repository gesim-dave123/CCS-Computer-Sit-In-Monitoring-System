<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
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
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 3600');
header('Content-Type: application/json; charset=UTF-8');

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

    $purposesStmt = $pdo->query(
        "SELECT purpose, COUNT(*) AS total
         FROM sit_in_sessions
         GROUP BY purpose
         ORDER BY total DESC"
    );
    $purposeRows = $purposesStmt->fetchAll();

    $palette = [
        '#381872',
        '#5428a8',
        '#6b3fd0',
        '#8458e6',
        '#a07ff0',
        '#bda4f8',
        '#d8ccfc',
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

    echo json_encode([
        'stats' => [
            'registeredStudents' => $registeredStudents,
            'currentSitIns' => $currentSitIns,
            'totalSitIns' => $totalSitIns,
            'purposes' => $purposes,
        ],
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to load dashboard stats',
        'details' => $e->getMessage(),
    ]);
}
