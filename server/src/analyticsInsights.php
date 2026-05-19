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
header('Access-Control-Allow-Methods: GET, OPTIONS');
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

$section = trim($_GET['section'] ?? 'all');
$range   = (int)($_GET['range'] ?? 30); // days

// Clamp range to sane values
if ($range < 7)   $range = 7;
if ($range > 365) $range = 365;

$dateFrom = date('Y-m-d', strtotime("-{$range} days"));

try {
    // ─── SECTION: kpis ───────────────────────────────────────────────────────
    if ($section === 'kpis' || $section === 'all') {
        $totalSessions = (int)$pdo->query("SELECT COUNT(*) FROM sit_in_sessions")->fetchColumn();

        $totalHours = (float)($pdo->query(
            "SELECT COALESCE(SUM(TIMESTAMPDIFF(SECOND, started_at, ended_at)), 0) / 3600
             FROM sit_in_sessions WHERE status = 'ended' AND ended_at IS NOT NULL"
        )->fetchColumn() ?? 0);

        $avgDuration = (float)($pdo->query(
            "SELECT COALESCE(AVG(TIMESTAMPDIFF(MINUTE, started_at, ended_at)), 0)
             FROM sit_in_sessions WHERE status = 'ended' AND ended_at IS NOT NULL"
        )->fetchColumn() ?? 0);

        $mostUsedLab = $pdo->query(
            "SELECT COALESCE(l.lab_name, s.lab) AS lab, COUNT(*) AS total
             FROM sit_in_sessions s
             LEFT JOIN laboratories l ON s.lab_id = l.lab_id
             GROUP BY COALESCE(l.lab_name, s.lab)
             ORDER BY total DESC LIMIT 1"
        )->fetch();

        $resTotal    = (int)$pdo->query("SELECT COUNT(*) FROM reservations")->fetchColumn();
        $resApproved = (int)$pdo->query("SELECT COUNT(*) FROM reservations WHERE status IN ('approved','completed')")->fetchColumn();
        $approvalRate = $resTotal > 0 ? round(($resApproved / $resTotal) * 100, 1) : 0;

        $totalAnnouncements = (int)$pdo->query("SELECT COUNT(*) FROM announcements")->fetchColumn();

        $avgRating = (float)($pdo->query(
            "SELECT COALESCE(ROUND(AVG(rating), 2), 0) FROM testimonials WHERE is_deleted = 0"
        )->fetchColumn() ?? 0);

        if ($section === 'kpis') {
            echo json_encode([
                'kpis' => [
                    'totalSessions'  => $totalSessions,
                    'totalHours'     => round($totalHours, 1),
                    'avgDuration'    => round($avgDuration, 0),
                    'mostUsedLab'    => $mostUsedLab['lab'] ?? '—',
                    'approvalRate'   => $approvalRate,
                    'totalAnnouncements' => $totalAnnouncements,
                    'avgRating'      => $avgRating,
                ],
            ]);
            exit();
        }
        $kpis = [
            'totalSessions' => $totalSessions,
            'totalHours'    => round($totalHours, 1),
            'avgDuration'   => round($avgDuration, 0),
            'mostUsedLab'   => $mostUsedLab['lab'] ?? '—',
            'approvalRate'  => $approvalRate,
            'totalAnnouncements' => $totalAnnouncements,
            'avgRating'     => $avgRating,
        ];
    }

    // ─── SECTION: trends ─────────────────────────────────────────────────────
    if ($section === 'trends' || $section === 'all') {
        $trendStmt = $pdo->prepare(
            "SELECT DATE(started_at) AS day, COUNT(*) AS total
             FROM sit_in_sessions
             WHERE started_at >= ?
             GROUP BY DATE(started_at)
             ORDER BY day ASC"
        );
        $trendStmt->execute([$dateFrom]);
        $trendRows = $trendStmt->fetchAll();

        if ($section === 'trends') {
            echo json_encode(['trends' => $trendRows]);
            exit();
        }
        $trends = $trendRows;
    }

    // ─── SECTION: heatmap ────────────────────────────────────────────────────
    if ($section === 'heatmap' || $section === 'all') {
        $heatStmt = $pdo->prepare(
            "SELECT DAYOFWEEK(started_at) AS dow, HOUR(started_at) AS hour, COUNT(*) AS total
             FROM sit_in_sessions
             WHERE started_at >= ?
             GROUP BY dow, hour"
        );
        $heatStmt->execute([$dateFrom]);
        $heatmap = $heatStmt->fetchAll();

        if ($section === 'heatmap') {
            echo json_encode(['heatmap' => $heatmap]);
            exit();
        }
    }

    // ─── SECTION: labs ───────────────────────────────────────────────────────
    if ($section === 'labs' || $section === 'all') {
        $labStmt = $pdo->prepare(
            "SELECT COALESCE(l.lab_name, s.lab) AS lab,
                    COUNT(*) AS total_sessions,
                    COALESCE(SUM(TIMESTAMPDIFF(MINUTE, s.started_at, s.ended_at)), 0) AS total_minutes,
                    COALESCE(AVG(TIMESTAMPDIFF(MINUTE, s.started_at, s.ended_at)), 0) AS avg_minutes,
                    MAX(l.seats) AS capacity
             FROM sit_in_sessions s
             LEFT JOIN laboratories l ON s.lab_id = l.lab_id
             WHERE s.status = 'ended' AND s.started_at >= ?
             GROUP BY COALESCE(l.lab_name, s.lab)
             ORDER BY total_sessions DESC"
        );
        $labStmt->execute([$dateFrom]);
        $labRows = $labStmt->fetchAll();

        $labs = array_map(fn($r) => [
            'lab'           => $r['lab'],
            'totalSessions' => (int)$r['total_sessions'],
            'totalHours'    => round((float)$r['total_minutes'] / 60, 1),
            'avgDuration'   => round((float)$r['avg_minutes'], 0),
            'capacity'      => (int)($r['capacity'] ?? 30),
        ], $labRows);

        if ($section === 'labs') {
            echo json_encode(['labs' => $labs]);
            exit();
        }
    }

    // ─── SECTION: purposes ───────────────────────────────────────────────────
    if ($section === 'purposes' || $section === 'all') {
        $purpStmt = $pdo->prepare(
            "SELECT purpose,
                    COUNT(*) AS total,
                    COALESCE(AVG(TIMESTAMPDIFF(MINUTE, started_at, ended_at)), 0) AS avg_duration
             FROM sit_in_sessions
             WHERE started_at >= ?
             GROUP BY purpose
             ORDER BY total DESC"
        );
        $purpStmt->execute([$dateFrom]);
        $purposeRows = $purpStmt->fetchAll();

        $purposeTotal = array_sum(array_column($purposeRows, 'total'));
        $palette = ['#6d28d9','#7c3aed','#8b5cf6','#a78bfa','#c4b5fd','#ddd6fe','#ede9fe','#5b21b6','#4c1d95'];

        $purposes = array_map(function($r, $idx) use ($purposeTotal, $palette) {
            $count = (int)$r['total'];
            return [
                'label'       => $r['purpose'] ?: 'Unspecified',
                'count'       => $count,
                'percent'     => $purposeTotal > 0 ? round(($count / $purposeTotal) * 100, 1) : 0,
                'avgDuration' => round((float)$r['avg_duration'], 0),
                'color'       => $palette[$idx % count($palette)],
            ];
        }, $purposeRows, array_keys($purposeRows));

        if ($section === 'purposes') {
            echo json_encode(['purposes' => $purposes]);
            exit();
        }
    }

    // ─── SECTION: students ───────────────────────────────────────────────────
    if ($section === 'students' || $section === 'all') {
        $courseStmt = $pdo->query(
            "SELECT course, year_level, COUNT(*) AS total
             FROM users
             WHERE role = 'student'
             GROUP BY course, year_level
             ORDER BY course, year_level"
        );
        $studentRows = $courseStmt->fetchAll();

        // Aggregate leaderboard: top students by total session hours
        $leaderStmt = $pdo->query(
            "SELECT u.id_number,
                    TRIM(CONCAT(u.first_name, ' ', COALESCE(u.middle_name,''), ' ', u.last_name)) AS full_name,
                    u.course,
                    COUNT(s.sitIn_id) AS session_count,
                    COALESCE(SUM(TIMESTAMPDIFF(MINUTE, s.started_at, s.ended_at)), 0) / 60 AS total_hours
             FROM users u
             LEFT JOIN sit_in_sessions s ON u.id_number = s.id_number AND s.status = 'ended'
             WHERE u.role = 'student'
             GROUP BY u.id_number
             ORDER BY total_hours DESC, session_count DESC
             LIMIT 10"
        );
        $leaderboard = $leaderStmt->fetchAll();

        if ($section === 'students') {
            echo json_encode([
                'studentBreakdown' => $studentRows,
                'leaderboard'      => $leaderboard,
            ]);
            exit();
        }
    }

    // ─── SECTION: reservations ───────────────────────────────────────────────
    if ($section === 'reservations' || $section === 'all') {
        $resStmt = $pdo->prepare(
            "SELECT status, COUNT(*) AS total
             FROM reservations
             WHERE created_at >= ?
             GROUP BY status"
        );
        $resStmt->execute([$dateFrom]);
        $reservationsByStatus = $resStmt->fetchAll();

        $resLabStmt = $pdo->prepare(
            "SELECT COALESCE(l.lab_name, r.lab) AS lab, COUNT(*) AS total
             FROM reservations r
             LEFT JOIN laboratories l ON r.lab_id = l.lab_id
             WHERE r.created_at >= ?
             GROUP BY COALESCE(l.lab_name, r.lab)
             ORDER BY total DESC"
        );
        $resLabStmt->execute([$dateFrom]);
        $reservationsByLab = $resLabStmt->fetchAll();

        if ($section === 'reservations') {
            echo json_encode([
                'reservationsByStatus' => $reservationsByStatus,
                'reservationsByLab'    => $reservationsByLab,
            ]);
            exit();
        }
    }

    // ─── SECTION: satisfaction ───────────────────────────────────────────────
    if ($section === 'satisfaction' || $section === 'all') {
        $ratingStmt = $pdo->query(
            "SELECT rating, COUNT(*) AS count
             FROM testimonials
             WHERE is_deleted = 0
             GROUP BY rating
             ORDER BY rating DESC"
        );
        $ratings = $ratingStmt->fetchAll();

        $catStmt = $pdo->query(
            "SELECT COALESCE(category, 'Uncategorized') AS category,
                    ROUND(AVG(rating), 2) AS avg_rating,
                    COUNT(*) AS count
             FROM testimonials
             WHERE is_deleted = 0
             GROUP BY category
             ORDER BY count DESC"
        );
        $satisfactionByCategory = $catStmt->fetchAll();

        $avgRatingStat = (float)($pdo->query(
            "SELECT COALESCE(ROUND(AVG(rating), 2), 0) FROM testimonials WHERE is_deleted = 0"
        )->fetchColumn() ?? 0);

        if ($section === 'satisfaction') {
            echo json_encode([
                'ratings'              => $ratings,
                'satisfactionByCategory' => $satisfactionByCategory,
                'avgRating'            => $avgRatingStat,
            ]);
            exit();
        }
    }

    // ─── SECTION: all ────────────────────────────────────────────────────────
    echo json_encode([
        'kpis'                 => $kpis ?? [],
        'trends'               => $trends ?? [],
        'heatmap'              => $heatmap ?? [],
        'labs'                 => $labs ?? [],
        'purposes'             => $purposes ?? [],
        'studentBreakdown'     => $studentRows ?? [],
        'leaderboard'          => $leaderboard ?? [],
        'reservationsByStatus' => $reservationsByStatus ?? [],
        'reservationsByLab'    => $reservationsByLab ?? [],
        'ratings'              => $ratings ?? [],
        'satisfactionByCategory' => $satisfactionByCategory ?? [],
        'avgRating'            => $avgRatingStat ?? 0,
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error'   => 'Failed to load analytics data',
        'details' => $e->getMessage(),
    ]);
}
