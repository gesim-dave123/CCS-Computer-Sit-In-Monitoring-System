<?php
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origins = ['http://localhost:5173','http://127.0.0.1:5173'];
if (in_array($origin, $allowed_origins, true)) header("Access-Control-Allow-Origin: $origin");
header('Vary: Origin');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 3600');
header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
require_once __DIR__ . '/../config/db_connection.php';
if ($_SERVER['REQUEST_METHOD'] !== 'GET') { http_response_code(405); echo json_encode(['error'=>'Method not allowed']); exit(); }

$weekStartInput = trim($_GET['week_start'] ?? '');
if ($weekStartInput !== '') {
    $ts = strtotime($weekStartInput);
    if ($ts === false) { http_response_code(422); echo json_encode(['error'=>'Invalid date']); exit(); }
    $dow = (int)date('N', $ts);
    $mondayTs = strtotime("-".($dow-1)." days", $ts);
} else {
    $dow = (int)date('N');
    $mondayTs = strtotime("-".($dow-1)." days", strtotime('today'));
}
$weekStart = date('Y-m-d', $mondayTs);
$weekEnd = date('Y-m-d', strtotime('+6 days', $mondayTs));
$dayNames = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
$byLab = isset($_GET['by_lab']) && $_GET['by_lab'] === '1';

try {
    if ($byLab) {
        $stmt = $pdo->prepare("SELECT DATE(s.started_at) AS session_date, COALESCE(l.lab_name, s.lab) AS lab, COUNT(*) AS session_count FROM sit_in_sessions s LEFT JOIN laboratories l ON s.lab_id = l.lab_id WHERE DATE(s.started_at) BETWEEN ? AND ? GROUP BY session_date, COALESCE(l.lab_name, s.lab) ORDER BY session_date ASC, lab ASC");
        $stmt->execute([$weekStart, $weekEnd]);
        $rows = $stmt->fetchAll();
        $data = [];
        for ($i=0;$i<7;$i++) { $date = date('Y-m-d', strtotime("+$i days", $mondayTs)); $data[$date] = ['date'=>$date,'day'=>$dayNames[$i],'labs'=>[]]; }
        foreach ($rows as $row) { $d=$row['session_date']; if (isset($data[$d])) $data[$d]['labs'][] = ['lab'=>$row['lab'],'session_count'=>(int)$row['session_count']]; }
        echo json_encode(['week_start'=>$weekStart,'week_end'=>$weekEnd,'data'=>array_values($data)]);
    } else {
        $stmt = $pdo->prepare("SELECT DATE(started_at) AS session_date, COUNT(*) AS session_count FROM sit_in_sessions WHERE DATE(started_at) BETWEEN ? AND ? GROUP BY session_date ORDER BY session_date ASC");
        $stmt->execute([$weekStart, $weekEnd]);
        $rows = $stmt->fetchAll();
        $countMap = [];
        foreach ($rows as $row) $countMap[$row['session_date']] = (int)$row['session_count'];
        $data = [];
        for ($i=0;$i<7;$i++) { $date = date('Y-m-d', strtotime("+$i days", $mondayTs)); $data[] = ['date'=>$date,'day'=>$dayNames[$i],'session_count'=>$countMap[$date]??0]; }
        echo json_encode(['week_start'=>$weekStart,'week_end'=>$weekEnd,'data'=>$data]);
    }
} catch (PDOException $e) { http_response_code(500); echo json_encode(['error'=>'Failed to load analytics','details'=>$e->getMessage()]); }
