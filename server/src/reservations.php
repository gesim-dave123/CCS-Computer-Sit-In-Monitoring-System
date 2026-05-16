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

$method = $_SERVER['REQUEST_METHOD'];

// ─── GET: seat availability for a lab+date, or student's own reservations ────
if ($method === 'GET') {
    $lab      = trim($_GET['lab']      ?? '');
    $date     = trim($_GET['date']     ?? '');
    $idNumber = trim($_GET['id_number'] ?? '');

    // ── Admin: return ALL reservations ────────────────────────────────────────
    $isAdmin = isset($_GET['admin']) && $_GET['admin'] === '1';
    if ($isAdmin) {
        try {
            $stmt = $pdo->query(
                "SELECT r.reservation_id, r.id_number,
                        COALESCE(CONCAT(u.first_name, ' ', u.last_name), r.student_name) AS student_name,
                        COALESCE(l.lab_name, r.lab) AS lab,
                        r.seat_number, r.purpose, r.reserved_date, r.time_slot, r.status, r.created_at
                 FROM reservations r
                 LEFT JOIN users u ON r.id_number = u.id_number
                 LEFT JOIN laboratories l ON r.lab_id = l.lab_id
                 ORDER BY r.created_at DESC
                 LIMIT 500"
            );
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['reservations' => $rows]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to load reservations', 'details' => $e->getMessage()]);
        }
        exit();
    }

    // Return this student's reservations list
    if ($idNumber !== '' && $lab === '') {
        try {
            $stmt = $pdo->prepare(
                "SELECT r.reservation_id, COALESCE(l.lab_name, r.lab) AS lab, r.seat_number, r.purpose,
                        r.reserved_date, r.time_slot, r.status, r.created_at
                 FROM reservations r
                 LEFT JOIN laboratories l ON r.lab_id = l.lab_id
                 WHERE r.id_number = ?
                 ORDER BY r.created_at DESC
                 LIMIT 50"
            );
            $stmt->execute([$idNumber]);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(['reservations' => $rows]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to load reservations', 'details' => $e->getMessage()]);
        }
        exit();
    }

    // Return seat availability for a lab + date
    if ($lab === '' || $date === '') {
        http_response_code(422);
        echo json_encode(['error' => 'lab and date are required']);
        exit();
    }

    try {
        // Resolve lab_id if lab text is provided
        $labId = null;
        if ($lab !== '') {
            $labLookup = $pdo->prepare("SELECT lab_id FROM laboratories WHERE lab_name = ? LIMIT 1");
            $labLookup->execute([$lab]);
            $labRow = $labLookup->fetch();
            if ($labRow) $labId = (int)$labRow['lab_id'];
        }

        // Seats that are reserved or occupied for this lab+date (any time slot)
        $stmt = $pdo->prepare(
            "SELECT seat_number, time_slot, status
             FROM reservations
             WHERE (lab_id = ? OR lab = ?) AND reserved_date = ? AND status IN ('pending','approved')
             ORDER BY seat_number"
        );
        $stmt->execute([$labId, $lab, $date]);
        $reserved = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Also check currently active sit-in sessions for this lab
        $sessionStmt = $pdo->prepare(
            "SELECT id_number FROM sit_in_sessions
             WHERE (lab_id = ? OR lab = ?) AND status = 'in_session'"
        );
        $sessionStmt->execute([$labId, $lab]);
        $activeSessions = $sessionStmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'reserved_seats' => $reserved,
            'active_sessions_count' => count($activeSessions),
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to load seat availability', 'details' => $e->getMessage()]);
    }
    exit();
}

// ─── POST: create or cancel a reservation ─────────────────────────────────────
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!is_array($data)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON payload']);
        exit();
    }

    $action   = trim($data['action']   ?? '');
    $idNumber = trim($data['id_number'] ?? '');

    // ── Approve ─────────────────────────────────────────────────────────────
    if ($action === 'approve' || $action === 'reject') {
        $reservationId = (int)($data['reservation_id'] ?? 0);
        $newStatus = $action === 'approve' ? 'approved' : 'rejected';

        if ($reservationId <= 0) {
            http_response_code(422);
            echo json_encode(['error' => 'reservation_id is required']);
            exit();
        }

        try {
            $pdo->beginTransaction();

            // Get reservation details for notification
            $resStmt = $pdo->prepare(
                "SELECT r.*, u.id as user_db_id FROM reservations r
                 LEFT JOIN users u ON u.id_number = r.id_number
                 WHERE r.reservation_id = ? AND r.status = 'pending' LIMIT 1"
            );
            $resStmt->execute([$reservationId]);
            $res = $resStmt->fetch();

            if (!$res) {
                $pdo->rollBack();
                http_response_code(409);
                echo json_encode(['error' => 'Reservation not found or already actioned']);
                exit();
            }

            // Update status
            $updStmt = $pdo->prepare("UPDATE reservations SET status = ? WHERE reservation_id = ?");
            $updStmt->execute([$newStatus, $reservationId]);

            // Always define $verb here (used in response message too)
            $verb = $action === 'approve' ? 'approved' : 'rejected';

            // Notify student if user record exists
            if (!empty($res['user_db_id'])) {
                $notifyStmt = $pdo->prepare(
                    "INSERT INTO notifications (user_id, title, message, category, is_read, action_url)
                     VALUES (?, ?, ?, 'reservation', 0, ?)"
                );
                $notifyStmt->execute([
                    (int)$res['user_db_id'],
                    'Reservation ' . ucfirst($verb),
                    "Your reservation for seat {$res['seat_number']} in {$res['lab']} on {$res['reserved_date']} ({$res['time_slot']}) has been {$verb}.",
                    '/dashboard/reservations',
                ]);
            }
            $pdo->commit();
            echo json_encode(['message' => "Reservation {$verb} successfully"]);
        } catch (PDOException $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update reservation', 'details' => $e->getMessage()]);
        }
        exit();
    }

    // ── Check-in: approved reservation → start sit-in session ────────────
    if ($action === 'checkin') {
        $reservationId = (int)($data['reservation_id'] ?? 0);

        if ($reservationId <= 0) {
            http_response_code(422);
            echo json_encode(['error' => 'reservation_id is required']);
            exit();
        }

        try {
            $pdo->beginTransaction();

            // Get the approved reservation
            $resStmt = $pdo->prepare(
                "SELECT r.*, u.id AS user_db_id, u.remaining_sessions, u.is_in_session, u.used_session
                 FROM reservations r
                 LEFT JOIN users u ON u.id_number = r.id_number
                 WHERE r.reservation_id = ? AND r.status = 'approved'
                 LIMIT 1 FOR UPDATE"
            );
            $resStmt->execute([$reservationId]);
            $res = $resStmt->fetch();

            if (!$res) {
                $pdo->rollBack();
                http_response_code(409);
                echo json_encode(['error' => 'Reservation not found or not in approved status']);
                exit();
            }

            if (empty($res['user_db_id'])) {
                $pdo->rollBack();
                http_response_code(404);
                echo json_encode(['error' => 'Student user record not found for this reservation']);
                exit();
            }

            // Verify the reserved date is today
            $today = date('Y-m-d');
            if ($res['reserved_date'] !== $today) {
                $pdo->rollBack();
                http_response_code(409);
                echo json_encode(['error' => 'Can only check in reservations scheduled for today']);
                exit();
            }

            // Check if student is already in session
            if ((int)$res['is_in_session'] === 1) {
                $pdo->rollBack();
                http_response_code(409);
                echo json_encode(['error' => 'Student is already in an active sit-in session']);
                exit();
            }

            // Check remaining sessions
            if ((int)$res['remaining_sessions'] <= 0) {
                $pdo->rollBack();
                http_response_code(409);
                echo json_encode(['error' => 'Student has no remaining sessions']);
                exit();
            }

            // Create sit-in session (mirrors adminStartSitIn.php)
            $insertSession = $pdo->prepare(
                "INSERT INTO sit_in_sessions (id_number, name, purpose, lab, lab_id, status)
                 VALUES (?, ?, ?, ?, ?, 'in_session')"
            );
            $insertSession->execute([
                $res['id_number'],
                $res['student_name'],
                $res['purpose'],
                $res['lab'],
                $res['lab_id'],
            ]);
            $sitInId = (int)$pdo->lastInsertId();

            // Mark student as in session
            $updateUser = $pdo->prepare("UPDATE users SET is_in_session = 1 WHERE id = ?");
            $updateUser->execute([(int)$res['user_db_id']]);

            // Mark reservation as completed
            $updRes = $pdo->prepare("UPDATE reservations SET status = 'completed' WHERE reservation_id = ?");
            $updRes->execute([$reservationId]);

            // Notify student
            if (!empty($res['user_db_id'])) {
                $notifyStmt = $pdo->prepare(
                    "INSERT INTO notifications (user_id, title, message, category, is_read, action_url)
                     VALUES (?, ?, ?, 'reservation', 0, ?)"
                );
                $notifyStmt->execute([
                    (int)$res['user_db_id'],
                    'Reservation Checked In',
                    "Your reservation for seat {$res['seat_number']} in {$res['lab']} has been checked in. Your sit-in session is now active.",
                    '/dashboard',
                ]);
            }

            $pdo->commit();
            echo json_encode([
                'message' => 'Reservation checked in — sit-in session started',
                'sitIn_id' => $sitInId,
            ]);
        } catch (PDOException $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['error' => 'Failed to check in reservation', 'details' => $e->getMessage()]);
        }
        exit();
    }

    // ── Admin Cancel ────────────────────────────────────────────────────────
    if ($action === 'admin_cancel') {
        $reservationId = (int)($data['reservation_id'] ?? 0);

        if ($reservationId <= 0) {
            http_response_code(422);
            echo json_encode(['error' => 'reservation_id is required']);
            exit();
        }

        try {
            $pdo->beginTransaction();

            // Get reservation (pending or approved can be cancelled by admin)
            $resStmt = $pdo->prepare(
                "SELECT r.*, u.id AS user_db_id FROM reservations r
                 LEFT JOIN users u ON u.id_number = r.id_number
                 WHERE r.reservation_id = ? AND r.status IN ('pending', 'approved')
                 LIMIT 1"
            );
            $resStmt->execute([$reservationId]);
            $res = $resStmt->fetch();

            if (!$res) {
                $pdo->rollBack();
                http_response_code(409);
                echo json_encode(['error' => 'Reservation not found or cannot be cancelled']);
                exit();
            }

            // Update status
            $updStmt = $pdo->prepare("UPDATE reservations SET status = 'cancelled' WHERE reservation_id = ?");
            $updStmt->execute([$reservationId]);

            // Notify student if user exists
            if (!empty($res['user_db_id'])) {
                $notifyStmt = $pdo->prepare(
                    "INSERT INTO notifications (user_id, title, message, category, is_read, action_url)
                     VALUES (?, ?, ?, 'reservation', 0, ?)"
                );
                $notifyStmt->execute([
                    (int)$res['user_db_id'],
                    'Reservation Cancelled by Admin',
                    "Your reservation for seat {$res['seat_number']} in {$res['lab']} on {$res['reserved_date']} ({$res['time_slot']}) has been cancelled by an administrator.",
                    '/dashboard/reservations',
                ]);
            }

            $pdo->commit();
            echo json_encode(['message' => 'Reservation cancelled successfully']);
        } catch (PDOException $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['error' => 'Failed to cancel reservation', 'details' => $e->getMessage()]);
        }
        exit();
    }

    // ── Cancel ──────────────────────────────────────────────────────────────
    if ($action === 'cancel') {
        $reservationId = (int)($data['reservation_id'] ?? 0);

        if ($idNumber === '' || $reservationId <= 0) {
            http_response_code(422);
            echo json_encode(['error' => 'id_number and reservation_id are required']);
            exit();
        }

        try {
            $stmt = $pdo->prepare(
                "UPDATE reservations
                 SET status = 'cancelled'
                 WHERE reservation_id = ? AND id_number = ? AND status = 'pending'"
            );
            $stmt->execute([$reservationId, $idNumber]);

            if ($stmt->rowCount() === 0) {
                http_response_code(409);
                echo json_encode(['error' => 'Reservation not found or cannot be cancelled']);
                exit();
            }

            echo json_encode(['message' => 'Reservation cancelled successfully']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to cancel reservation', 'details' => $e->getMessage()]);
        }
        exit();
    }

    // ── Create ───────────────────────────────────────────────────────────────
    if ($action === 'create') {
        $labText     = trim($data['lab']          ?? '');
        $labIdInput  = (int)($data['lab_id']      ?? 0);
        $seatNumber  = (int)($data['seat_number'] ?? 0);
        $purpose     = trim($data['purpose']      ?? '');
        $date        = trim($data['date']         ?? '');
        $timeSlot    = trim($data['time_slot']    ?? '');

        if ($idNumber === '' || ($labText === '' && $labIdInput <= 0) ||
            $seatNumber <= 0 || $purpose === '' || $date === '' || $timeSlot === '') {
            http_response_code(422);
            echo json_encode(['error' => 'All fields are required']);
            exit();
        }

        // Validate date is not in the past
        $today = date('Y-m-d');
        if ($date < $today) {
            http_response_code(422);
            echo json_encode(['error' => 'Cannot reserve a date in the past']);
            exit();
        }

        try {
            $pdo->beginTransaction();

            // Check student exists and has remaining sessions
            $userStmt = $pdo->prepare(
                "SELECT id, first_name, last_name, remaining_sessions, is_in_session FROM users
                 WHERE id_number = ? AND role = 'student' LIMIT 1 FOR UPDATE"
            );
            $userStmt->execute([$idNumber]);
            $user = $userStmt->fetch();

            if (!$user) {
                $pdo->rollBack();
                http_response_code(404);
                echo json_encode(['error' => 'Student not found']);
                exit();
            }

            $studentName = trim($user['first_name'] . ' ' . $user['last_name']);

            // Resolve lab
            if ($labIdInput > 0) {
                $labStmt = $pdo->prepare("SELECT lab_id, lab_name FROM laboratories WHERE lab_id = ? LIMIT 1");
                $labStmt->execute([$labIdInput]);
            } else {
                $labStmt = $pdo->prepare("SELECT lab_id, lab_name FROM laboratories WHERE lab_name = ? LIMIT 1");
                $labStmt->execute([$labText]);
            }
            $labRow = $labStmt->fetch();
            $resolvedLabId = $labRow ? (int)$labRow['lab_id'] : null;
            $lab = $labRow ? $labRow['lab_name'] : $labText;

            if ((int)$user['remaining_sessions'] <= 0) {
                $pdo->rollBack();
                http_response_code(409);
                echo json_encode(['error' => 'No remaining sessions available']);
                exit();
            }

            // Check if student already has a pending/approved reservation for same date+slot
            $dupStudentStmt = $pdo->prepare(
                "SELECT reservation_id FROM reservations
                 WHERE id_number = ? AND reserved_date = ? AND time_slot = ?
                   AND status IN ('pending','approved') LIMIT 1"
            );
            $dupStudentStmt->execute([$idNumber, $date, $timeSlot]);
            if ($dupStudentStmt->fetch()) {
                $pdo->rollBack();
                http_response_code(409);
                echo json_encode(['error' => 'You already have a reservation for this date and time slot']);
                exit();
            }

            // Check if seat is already taken
            $dupSeatStmt = $pdo->prepare(
                "SELECT reservation_id FROM reservations
                 WHERE (lab_id = ? OR lab = ?) AND seat_number = ? AND reserved_date = ? AND time_slot = ?
                   AND status IN ('pending','approved') LIMIT 1"
            );
            $dupSeatStmt->execute([$resolvedLabId, $lab, $seatNumber, $date, $timeSlot]);
            if ($dupSeatStmt->fetch()) {
                $pdo->rollBack();
                http_response_code(409);
                echo json_encode(['error' => 'This seat is already reserved for the selected time slot']);
                exit();
            }

            // Insert reservation
            $insertStmt = $pdo->prepare(
                "INSERT INTO reservations
                    (id_number, student_name, lab, lab_id, seat_number, purpose, reserved_date, time_slot, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')"
            );
            $insertStmt->execute([$idNumber, $studentName, $lab, $resolvedLabId, $seatNumber, $purpose, $date, $timeSlot]);
            $reservationId = (int)$pdo->lastInsertId();

            // Create a notification
            $notifyStmt = $pdo->prepare(
                "INSERT INTO notifications (user_id, title, message, category, is_read, action_url)
                 VALUES (?, ?, ?, 'reservation', 0, ?)"
            );
            $notifyStmt->execute([
                (int)$user['id'],
                'Reservation Submitted',
                "Your reservation for seat {$seatNumber} in {$lab} on {$date} ({$timeSlot}) is pending approval.",
                '/dashboard/reservations',
            ]);

            $pdo->commit();

            http_response_code(201);
            echo json_encode([
                'message' => 'Reservation submitted successfully',
                'reservation_id' => $reservationId,
            ]);
        } catch (PDOException $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            // Handle unique constraint violation
            if (str_contains($e->getMessage(), 'Duplicate') || $e->getCode() === '23000') {
                http_response_code(409);
                echo json_encode(['error' => 'This seat is already reserved for the selected time slot']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create reservation', 'details' => $e->getMessage()]);
            }
        }
        exit();
    }

    http_response_code(400);
    echo json_encode(['error' => 'Unknown action']);
    exit();
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
