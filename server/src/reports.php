<?php
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origins = ['http://localhost:5173','http://127.0.0.1:5173'];
if (in_array($origin, $allowed_origins, true)) header("Access-Control-Allow-Origin: $origin");
header('Vary: Origin');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 3600');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
require_once __DIR__ . '/../config/db_connection.php';
if ($_SERVER['REQUEST_METHOD'] !== 'GET') { http_response_code(405); header("Content-Type: application/json"); echo json_encode(['error'=>'Method not allowed']); exit(); }

$start   = trim($_GET['start'] ?? '');
$end     = trim($_GET['end'] ?? '');
$lab     = trim($_GET['lab'] ?? '');
$purpose = trim($_GET['purpose'] ?? '');
$student = trim($_GET['student'] ?? '');
$format  = trim($_GET['format'] ?? 'json');

$where = [];
$params = [];
if ($start !== '') { $where[] = "DATE(s.started_at) >= ?"; $params[] = $start; }
if ($end !== '')   { $where[] = "DATE(s.started_at) <= ?"; $params[] = $end; }
if ($lab !== '' && $lab !== 'all')     { $where[] = "COALESCE(l.lab_name, s.lab) = ?"; $params[] = $lab; }
if ($purpose !== '' && $purpose !== 'all') { $where[] = "s.purpose = ?"; $params[] = $purpose; }
if ($student !== '') { $where[] = "(s.id_number LIKE ? OR CONCAT(u.first_name, ' ', u.last_name) LIKE ?)"; $params[] = "%$student%"; $params[] = "%$student%"; }

$whereClause = count($where) > 0 ? 'WHERE ' . implode(' AND ', $where) : '';

try {
    $sql = "SELECT s.sitIn_id, s.id_number,
                   COALESCE(CONCAT(u.first_name, ' ', u.last_name), s.name) AS student_name,
                   COALESCE(l.lab_name, s.lab) AS lab,
                   s.purpose, s.status, s.started_at, s.ended_at,
                   CASE WHEN s.ended_at IS NOT NULL THEN TIMESTAMPDIFF(MINUTE, s.started_at, s.ended_at) ELSE NULL END AS duration_minutes
            FROM sit_in_sessions s
            LEFT JOIN users u ON s.id_number = u.id_number
            LEFT JOIN laboratories l ON s.lab_id = l.lab_id
            $whereClause ORDER BY s.started_at DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    if ($format === 'csv') {
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="sit_in_report_' . date('Ymd_His') . '.csv"');
        $out = fopen('php://output', 'w');
        fputcsv($out, ['Student ID','Student Name','Laboratory','Purpose','Status','Start Time','End Time','Duration (min)']);
        foreach ($rows as $row) {
            fputcsv($out, [$row['id_number'],$row['student_name'],$row['lab'],$row['purpose'],$row['status'],$row['started_at'],$row['ended_at'] ?? '',$row['duration_minutes'] ?? '']);
        }
        fclose($out);
        exit();
    }

    header("Content-Type: application/json; charset=UTF-8");
    $labsStmt = $pdo->query("SELECT lab_name FROM laboratories ORDER BY lab_name ASC");
    $labs = array_column($labsStmt->fetchAll(), 'lab_name');
    $purposesStmt = $pdo->query("SELECT DISTINCT purpose FROM sit_in_sessions WHERE purpose IS NOT NULL AND purpose <> '' ORDER BY purpose ASC");
    $purposes = array_column($purposesStmt->fetchAll(), 'purpose');

    echo json_encode(['records'=>$rows,'total'=>count($rows),'filters'=>['labs'=>$labs,'purposes'=>$purposes]]);
} catch (PDOException $e) {
    header("Content-Type: application/json; charset=UTF-8");
    http_response_code(500);
    echo json_encode(['error'=>'Failed to load report data','details'=>$e->getMessage()]);
}
