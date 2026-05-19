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
if ($_SERVER['REQUEST_METHOD'] !== 'GET') { http_response_code(405); header('Content-Type: application/json'); echo json_encode(['error'=>'Method not allowed']); exit(); }

require_once '../config/db_connection.php';

$type   = trim($_GET['type']   ?? 'sit_in');
$format = trim($_GET['format'] ?? 'json');
$start  = trim($_GET['start']  ?? '');
$end    = trim($_GET['end']    ?? '');
$lab    = trim($_GET['lab']    ?? '');
$course = trim($_GET['course'] ?? '');
$status = trim($_GET['status'] ?? '');
$purpose= trim($_GET['purpose']?? '');
$rating = trim($_GET['rating'] ?? '');
$limit  = (int)($_GET['limit'] ?? 0);

try {

// ─── 1. SIT-IN SESSIONS ──────────────────────────────────────────────────────
if ($type === 'sit_in') {
    $where = []; $params = [];
    if ($start   !== '') { $where[] = 'DATE(s.started_at) >= ?'; $params[] = $start; }
    if ($end     !== '') { $where[] = 'DATE(s.started_at) <= ?'; $params[] = $end; }
    if ($lab     !== '' && $lab !== 'all') { $where[] = 'COALESCE(l.lab_name, s.lab) = ?'; $params[] = $lab; }
    if ($purpose !== '' && $purpose !== 'all') { $where[] = 's.purpose = ?'; $params[] = $purpose; }
    if ($status  !== '' && $status !== 'all') { $where[] = 's.status = ?'; $params[] = $status; }
    $wc = $where ? 'WHERE '.implode(' AND ', $where) : '';

    $sql = "SELECT s.sitIn_id, s.id_number,
                   COALESCE(CONCAT(u.first_name,' ',u.last_name), s.name) AS student_name,
                   u.course, u.year_level,
                   COALESCE(l.lab_name, s.lab) AS lab,
                   s.purpose, s.status, s.started_at, s.ended_at,
                   CASE WHEN s.ended_at IS NOT NULL THEN TIMESTAMPDIFF(MINUTE,s.started_at,s.ended_at) ELSE NULL END AS duration_minutes
            FROM sit_in_sessions s
            LEFT JOIN users u ON s.id_number = u.id_number
            LEFT JOIN laboratories l ON s.lab_id = l.lab_id
            $wc ORDER BY s.started_at DESC";
    if ($limit > 0) $sql .= " LIMIT $limit";
    $stmt = $pdo->prepare($sql); $stmt->execute($params); $rows = $stmt->fetchAll();

    // Dropdown filters
    $labs = array_column($pdo->query("SELECT lab_name FROM laboratories ORDER BY lab_name")->fetchAll(), 'lab_name');
    $purposes = array_column($pdo->query("SELECT DISTINCT purpose FROM sit_in_sessions WHERE purpose IS NOT NULL AND purpose <> '' ORDER BY purpose")->fetchAll(), 'purpose');

    if ($format === 'csv') {
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="sit_in_sessions_'.date('Ymd_His').'.csv"');
        $out = fopen('php://output','w');
        fputcsv($out,['ID','Student ID','Student Name','Course','Year','Lab','Purpose','Status','Start','End','Duration (min)']);
        foreach ($rows as $r) fputcsv($out,[$r['sitIn_id'],$r['id_number'],$r['student_name'],$r['course']??'',$r['year_level']??'',$r['lab'],$r['purpose'],$r['status'],$r['started_at'],$r['ended_at']??'',$r['duration_minutes']??'']);
        fclose($out); exit();
    }
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(['records'=>$rows,'total'=>count($rows),'filters'=>['labs'=>$labs,'purposes'=>$purposes]]); exit();
}

// ─── 2. STUDENT ROSTER ───────────────────────────────────────────────────────
if ($type === 'students') {
    $where = ["role = 'student'"]; $params = [];
    if ($course !== '' && $course !== 'all') { $where[] = 'course = ?'; $params[] = $course; }
    if (isset($_GET['year']) && $_GET['year'] !== '' && $_GET['year'] !== 'all') { $where[] = 'year_level = ?'; $params[] = $_GET['year']; }
    if ($status === 'depleted') { $where[] = 'remaining_sessions <= 0'; }
    elseif ($status === 'active') { $where[] = 'remaining_sessions > 0'; }
    $wc = 'WHERE '.implode(' AND ', $where);

    $sql = "SELECT id_number, CONCAT(first_name,' ',COALESCE(middle_name,''),' ',last_name) AS full_name,
                   course, year_level, email, remaining_sessions, used_session,
                   DATE(created_at) AS registered_date
            FROM users $wc ORDER BY last_name, first_name";
    if ($limit > 0) $sql .= " LIMIT $limit";
    $stmt = $pdo->prepare($sql); $stmt->execute($params); $rows = $stmt->fetchAll();

    $courses  = array_column($pdo->query("SELECT DISTINCT course FROM users WHERE role='student' ORDER BY course")->fetchAll(),'course');
    $yearLvls = array_column($pdo->query("SELECT DISTINCT year_level FROM users WHERE role='student' ORDER BY year_level")->fetchAll(),'year_level');

    if ($format === 'csv') {
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="student_roster_'.date('Ymd_His').'.csv"');
        $out = fopen('php://output','w');
        fputcsv($out,['ID Number','Full Name','Course','Year Level','Email','Remaining Sessions','Used Sessions','Registered']);
        foreach ($rows as $r) fputcsv($out,[$r['id_number'],trim($r['full_name']),$r['course'],$r['year_level'],$r['email'],$r['remaining_sessions'],$r['used_session'],$r['registered_date']]);
        fclose($out); exit();
    }
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(['records'=>$rows,'total'=>count($rows),'filters'=>['courses'=>$courses,'yearLevels'=>$yearLvls]]); exit();
}

// ─── 3. LAB UTILIZATION ──────────────────────────────────────────────────────
if ($type === 'labs') {
    $where = ['s.status = \'ended\' AND s.ended_at IS NOT NULL']; $params = [];
    if ($start !== '') { $where[] = 'DATE(s.started_at) >= ?'; $params[] = $start; }
    if ($end   !== '') { $where[] = 'DATE(s.started_at) <= ?'; $params[] = $end; }
    if ($lab !== '' && $lab !== 'all') { $where[] = 'COALESCE(l.lab_name,s.lab) = ?'; $params[] = $lab; }
    $wc = 'WHERE '.implode(' AND ', $where);

    $stmt = $pdo->prepare(
        "SELECT COALESCE(l.lab_name,s.lab) AS lab,
                MAX(l.seats) AS capacity,
                COUNT(*) AS total_sessions,
                ROUND(SUM(TIMESTAMPDIFF(MINUTE,s.started_at,s.ended_at))/60,1) AS total_hours,
                ROUND(AVG(TIMESTAMPDIFF(MINUTE,s.started_at,s.ended_at)),0) AS avg_duration_min,
                COUNT(DISTINCT s.id_number) AS unique_students,
                (SELECT DAYNAME(started_at) FROM sit_in_sessions s2
                 LEFT JOIN laboratories l2 ON s2.lab_id=l2.lab_id
                 WHERE COALESCE(l2.lab_name,s2.lab)=COALESCE(l.lab_name,s.lab)
                 GROUP BY DAYNAME(started_at) ORDER BY COUNT(*) DESC LIMIT 1) AS peak_day
         FROM sit_in_sessions s
         LEFT JOIN laboratories l ON s.lab_id=l.lab_id
         $wc
         GROUP BY COALESCE(l.lab_name,s.lab)
         ORDER BY total_sessions DESC"
    );
    $stmt->execute($params); $rows = $stmt->fetchAll();

    if ($format === 'csv') {
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="lab_utilization_'.date('Ymd_His').'.csv"');
        $out = fopen('php://output','w');
        fputcsv($out,['Laboratory','Capacity','Total Sessions','Total Hours','Avg Duration (min)','Unique Students','Peak Day']);
        foreach ($rows as $r) fputcsv($out,[$r['lab'],$r['capacity']??'—',$r['total_sessions'],$r['total_hours'],$r['avg_duration_min'],$r['unique_students'],$r['peak_day']??'—']);
        fclose($out); exit();
    }
    $labs = array_column($pdo->query("SELECT lab_name FROM laboratories ORDER BY lab_name")->fetchAll(),'lab_name');
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(['records'=>$rows,'total'=>count($rows),'filters'=>['labs'=>$labs]]); exit();
}

// ─── 4. PURPOSE ANALYSIS ─────────────────────────────────────────────────────
if ($type === 'purposes') {
    $where = ['s.ended_at IS NOT NULL']; $params = [];
    if ($start !== '') { $where[] = 'DATE(s.started_at) >= ?'; $params[] = $start; }
    if ($end   !== '') { $where[] = 'DATE(s.started_at) <= ?'; $params[] = $end; }
    if ($lab !== '' && $lab !== 'all') { $where[] = 'COALESCE(l.lab_name,s.lab) = ?'; $params[] = $lab; }
    $wc = 'WHERE '.implode(' AND ', $where);

    $stmt = $pdo->prepare(
        "SELECT s.purpose,
                COUNT(*) AS total_sessions,
                ROUND(SUM(TIMESTAMPDIFF(MINUTE,s.started_at,s.ended_at))/60,1) AS total_hours,
                ROUND(AVG(TIMESTAMPDIFF(MINUTE,s.started_at,s.ended_at)),0) AS avg_duration_min,
                COUNT(DISTINCT s.id_number) AS unique_students,
                (SELECT COALESCE(l2.lab_name,s2.lab) FROM sit_in_sessions s2
                 LEFT JOIN laboratories l2 ON s2.lab_id=l2.lab_id
                 WHERE s2.purpose=s.purpose GROUP BY COALESCE(l2.lab_name,s2.lab) ORDER BY COUNT(*) DESC LIMIT 1) AS top_lab
         FROM sit_in_sessions s
         LEFT JOIN laboratories l ON s.lab_id=l.lab_id
         $wc
         GROUP BY s.purpose
         ORDER BY total_sessions DESC"
    );
    $stmt->execute($params); $rows = $stmt->fetchAll();
    $grandTotal = array_sum(array_column($rows,'total_sessions'));
    foreach ($rows as &$r) $r['percent'] = $grandTotal > 0 ? round($r['total_sessions']/$grandTotal*100,1) : 0;

    if ($format === 'csv') {
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="purpose_analysis_'.date('Ymd_His').'.csv"');
        $out = fopen('php://output','w');
        fputcsv($out,['Purpose/Subject','Sessions','% of Total','Total Hours','Avg Duration (min)','Unique Students','Top Lab']);
        foreach ($rows as $r) fputcsv($out,[$r['purpose'],$r['total_sessions'],$r['percent'].'%',$r['total_hours'],$r['avg_duration_min'],$r['unique_students'],$r['top_lab']??'—']);
        fclose($out); exit();
    }
    $labs = array_column($pdo->query("SELECT lab_name FROM laboratories ORDER BY lab_name")->fetchAll(),'lab_name');
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(['records'=>$rows,'total'=>count($rows),'filters'=>['labs'=>$labs]]); exit();
}

// ─── 5. RESERVATIONS ─────────────────────────────────────────────────────────
if ($type === 'reservations') {
    $where = []; $params = [];
    if ($start  !== '') { $where[] = 'DATE(r.created_at) >= ?'; $params[] = $start; }
    if ($end    !== '') { $where[] = 'DATE(r.created_at) <= ?'; $params[] = $end; }
    if ($lab    !== '' && $lab !== 'all') { $where[] = 'COALESCE(l.lab_name,r.lab) = ?'; $params[] = $lab; }
    if ($status !== '' && $status !== 'all') { $where[] = 'r.status = ?'; $params[] = $status; }
    $wc = $where ? 'WHERE '.implode(' AND ', $where) : '';

    $sql = "SELECT r.reservation_id, r.id_number,
                   COALESCE(CONCAT(u.first_name,' ',u.last_name),r.student_name) AS student_name,
                   u.course, COALESCE(l.lab_name,r.lab) AS lab,
                   r.seat_number, r.purpose, r.reserved_date, r.time_slot, r.status,
                   DATE(r.created_at) AS submitted_date
            FROM reservations r
            LEFT JOIN users u ON r.id_number=u.id_number
            LEFT JOIN laboratories l ON r.lab_id=l.lab_id
            $wc ORDER BY r.created_at DESC";
    if ($limit > 0) $sql .= " LIMIT $limit";
    $stmt = $pdo->prepare($sql); $stmt->execute($params); $rows = $stmt->fetchAll();

    if ($format === 'csv') {
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="reservations_'.date('Ymd_His').'.csv"');
        $out = fopen('php://output','w');
        fputcsv($out,['Reservation ID','Student ID','Student Name','Course','Lab','Seat','Purpose','Reserved Date','Time Slot','Status','Submitted']);
        foreach ($rows as $r) fputcsv($out,[$r['reservation_id'],$r['id_number'],$r['student_name'],$r['course']??'',$r['lab'],$r['seat_number'],$r['purpose'],$r['reserved_date'],$r['time_slot'],$r['status'],$r['submitted_date']]);
        fclose($out); exit();
    }
    $labs = array_column($pdo->query("SELECT lab_name FROM laboratories ORDER BY lab_name")->fetchAll(),'lab_name');
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(['records'=>$rows,'total'=>count($rows),'filters'=>['labs'=>$labs]]); exit();
}

// ─── 6. LEADERBOARD ──────────────────────────────────────────────────────────
if ($type === 'leaderboard') {
    $where = ["u.role='student'"]; $params = [];
    if ($start  !== '') { $where[] = 'DATE(s.started_at) >= ?'; $params[] = $start; }
    if ($end    !== '') { $where[] = 'DATE(s.started_at) <= ?'; $params[] = $end; }
    if ($course !== '' && $course !== 'all') { $where[] = 'u.course = ?'; $params[] = $course; }
    $wc = 'WHERE '.implode(' AND ', $where);
    $lim = $limit > 0 ? $limit : 25;

    $stmt = $pdo->prepare(
        "SELECT u.id_number,
                TRIM(CONCAT(u.first_name,' ',COALESCE(u.middle_name,''),' ',u.last_name)) AS full_name,
                u.course, u.year_level,
                COUNT(s.sitIn_id) AS total_sessions,
                ROUND(COALESCE(SUM(TIMESTAMPDIFF(MINUTE,s.started_at,s.ended_at)),0)/60,1) AS total_hours,
                ROUND(COALESCE(AVG(TIMESTAMPDIFF(MINUTE,s.started_at,s.ended_at)),0),0) AS avg_duration_min
         FROM users u
         LEFT JOIN sit_in_sessions s ON u.id_number=s.id_number AND s.status='ended'
         $wc
         GROUP BY u.id_number
         ORDER BY total_hours DESC, total_sessions DESC
         LIMIT $lim"
    );
    $stmt->execute($params); $rows = $stmt->fetchAll();
    foreach ($rows as $i => &$r) $r['rank'] = $i + 1;

    if ($format === 'csv') {
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="top_students_'.date('Ymd_His').'.csv"');
        $out = fopen('php://output','w');
        fputcsv($out,['Rank','Student ID','Full Name','Course','Year Level','Sessions','Total Hours','Avg Duration (min)']);
        foreach ($rows as $r) fputcsv($out,[$r['rank'],$r['id_number'],trim($r['full_name']),$r['course'],$r['year_level'],$r['total_sessions'],$r['total_hours'],$r['avg_duration_min']]);
        fclose($out); exit();
    }
    $courses = array_column($pdo->query("SELECT DISTINCT course FROM users WHERE role='student' ORDER BY course")->fetchAll(),'course');
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(['records'=>$rows,'total'=>count($rows),'filters'=>['courses'=>$courses]]); exit();
}

// ─── 7. FEEDBACK & TESTIMONIALS ──────────────────────────────────────────────
if ($type === 'feedback') {
    $where = ['t.is_deleted=0']; $params = [];
    if ($start  !== '') { $where[] = 'DATE(t.created_at) >= ?'; $params[] = $start; }
    if ($end    !== '') { $where[] = 'DATE(t.created_at) <= ?'; $params[] = $end; }
    if ($rating !== '' && $rating !== 'all') { $where[] = 't.rating = ?'; $params[] = (int)$rating; }
    if (isset($_GET['category']) && $_GET['category'] !== '' && $_GET['category'] !== 'all') { $where[] = 't.category = ?'; $params[] = $_GET['category']; }
    $wc = 'WHERE '.implode(' AND ', $where);
    $sql = "SELECT t.testimonial_id, t.student_id,
                   COALESCE(CONCAT(u.first_name,' ',u.last_name),t.student_id) AS student_name,
                   u.course, t.rating, t.category, t.comment, t.is_visible,
                   DATE(t.created_at) AS submitted_date
            FROM testimonials t
            LEFT JOIN users u ON t.student_id=u.id_number
            $wc ORDER BY t.created_at DESC";
    if ($limit > 0) $sql .= " LIMIT $limit";
    $stmt = $pdo->prepare($sql); $stmt->execute($params); $rows = $stmt->fetchAll();

    if ($format === 'csv') {
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="feedback_'.date('Ymd_His').'.csv"');
        $out = fopen('php://output','w');
        fputcsv($out,['ID','Student ID','Student Name','Course','Rating','Category','Comment','Visible','Submitted']);
        foreach ($rows as $r) fputcsv($out,[$r['testimonial_id'],$r['student_id'],$r['student_name'],$r['course']??'',$r['rating'],$r['category']??'',$r['comment'],$r['is_visible']?'Yes':'No',$r['submitted_date']]);
        fclose($out); exit();
    }
    $categories = array_column($pdo->query("SELECT DISTINCT COALESCE(category,'Uncategorized') AS cat FROM testimonials WHERE is_deleted=0 ORDER BY cat")->fetchAll(),'cat');
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(['records'=>$rows,'total'=>count($rows),'filters'=>['categories'=>$categories]]); exit();
}

// ─── 8. STUDENT HISTORY ──────────────────────────────────────────────────────
if ($type === 'student_history') {
    $student_id = trim($_GET['student'] ?? '');
    $where = []; $params = [];
    if ($student_id !== '') { $where[] = 's.id_number = ?'; $params[] = $student_id; }
    if ($start      !== '') { $where[] = 'DATE(s.started_at) >= ?'; $params[] = $start; }
    if ($end        !== '') { $where[] = 'DATE(s.started_at) <= ?'; $params[] = $end; }
    if ($lab        !== '' && $lab !== 'all') { $where[] = 'COALESCE(l.lab_name, s.lab) = ?'; $params[] = $lab; }
    $wc = $where ? 'WHERE '.implode(' AND ', $where) : '';

    $sql = "SELECT s.sitIn_id, s.id_number,
                   COALESCE(CONCAT(u.first_name,' ',u.last_name), s.name) AS student_name,
                   COALESCE(l.lab_name, s.lab) AS lab,
                   s.purpose, s.status, s.started_at, s.ended_at,
                   CASE WHEN s.ended_at IS NOT NULL THEN TIMESTAMPDIFF(MINUTE,s.started_at,s.ended_at) ELSE NULL END AS duration_minutes
            FROM sit_in_sessions s
            LEFT JOIN users u ON s.id_number = u.id_number
            LEFT JOIN laboratories l ON s.lab_id = l.lab_id
            $wc ORDER BY s.started_at DESC";
    if ($limit > 0) $sql .= " LIMIT $limit";
    $stmt = $pdo->prepare($sql); $stmt->execute($params); $rows = $stmt->fetchAll();

    $students = $pdo->query("SELECT id_number, CONCAT(first_name,' ',last_name) AS full_name FROM users WHERE role='student' ORDER BY last_name, first_name")->fetchAll();
    $labs = array_column($pdo->query("SELECT lab_name FROM laboratories ORDER BY lab_name")->fetchAll(), 'lab_name');

    if ($format === 'csv') {
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="student_history_'.date('Ymd_His').'.csv"');
        $out = fopen('php://output','w');
        fputcsv($out,['ID','Student ID','Student Name','Lab','Purpose','Status','Start','End','Duration (min)']);
        foreach ($rows as $r) fputcsv($out,[$r['sitIn_id'],$r['id_number'],$r['student_name'],$r['lab'],$r['purpose'],$r['status'],$r['started_at'],$r['ended_at']??'',$r['duration_minutes']??'']);
        fclose($out); exit();
    }
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(['records'=>$rows,'total'=>count($rows),'filters'=>['students'=>$students, 'labs'=>$labs]]); exit();
}

http_response_code(400);
header('Content-Type: application/json; charset=UTF-8');
echo json_encode(['error'=>'Unknown report type: '.$type]);

} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(['error'=>'Database error','details'=>$e->getMessage()]);
}
