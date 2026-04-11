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
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 3600');
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
	http_response_code(200);
	exit();
}

require_once '../config/db_connection.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
	$audience = strtolower(trim($_GET['audience'] ?? 'student'));
	$limit = (int)($_GET['limit'] ?? ($audience === 'admin' ? 100 : 20));

	if ($limit < 1) {
		$limit = 20;
	}
	if ($limit > 200) {
		$limit = 200;
	}

	try {
		if ($audience === 'admin') {
			$stmt = $pdo->prepare(
				"SELECT announcement_id, title, content, type, priority, author_name, author_user_id,
						target_role, is_active, publish_at, expires_at, created_at, updated_at
				 FROM announcements
				 ORDER BY publish_at DESC, announcement_id DESC
				 LIMIT ?"
			);
			$stmt->bindValue(1, $limit, PDO::PARAM_INT);
		} else {
			$stmt = $pdo->prepare(
				"SELECT announcement_id, title, content, type, priority, author_name, author_user_id,
						target_role, is_active, publish_at, expires_at, created_at, updated_at
				 FROM announcements
				 WHERE is_active = 1
				   AND publish_at <= NOW()
				   AND (expires_at IS NULL OR expires_at > NOW())
				   AND target_role IN ('all', 'student')
				 ORDER BY publish_at DESC, announcement_id DESC
				 LIMIT ?"
			);
			$stmt->bindValue(1, $limit, PDO::PARAM_INT);
		}

		$stmt->execute();
		$announcements = $stmt->fetchAll();

		http_response_code(200);
		echo json_encode([
			'announcements' => $announcements,
		]);
	} catch (PDOException $e) {
		http_response_code(500);
		echo json_encode([
			'error' => 'Failed to load announcements.',
			'details' => $e->getMessage(),
		]);
	}
	exit();
}

if (!in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT'], true)) {
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

$title = trim($data['title'] ?? '');
$content = trim($data['content'] ?? '');
$type = strtolower(trim($data['type'] ?? 'general'));
$priority = strtolower(trim($data['priority'] ?? 'low'));
$authorName = trim($data['author_name'] ?? '');
$targetRole = strtolower(trim($data['target_role'] ?? 'student'));
$isActive = isset($data['is_active']) && (int)$data['is_active'] === 0 ? 0 : 1;
$authorUserId = isset($data['author_user_id']) && $data['author_user_id'] !== ''
	? (int)$data['author_user_id']
	: null;
$publishAtRaw = trim((string)($data['publish_at'] ?? ''));
$expiresAtRaw = trim((string)($data['expires_at'] ?? ''));
$announcementId = (int)($data['announcement_id'] ?? 0);

if ($_SERVER['REQUEST_METHOD'] === 'PUT' && $announcementId <= 0) {
	http_response_code(422);
	echo json_encode(['error' => 'announcement_id is required for update.']);
	exit();
}

if ($title === '' || $content === '') {
	http_response_code(422);
	echo json_encode(['error' => 'Title and content are required.']);
	exit();
}

$allowedTypes = ['maintenance', 'rules', 'event', 'general'];
if (!in_array($type, $allowedTypes, true)) {
	http_response_code(422);
	echo json_encode(['error' => 'Invalid announcement type.']);
	exit();
}

$allowedPriorities = ['high', 'medium', 'low'];
if (!in_array($priority, $allowedPriorities, true)) {
	http_response_code(422);
	echo json_encode(['error' => 'Invalid announcement priority.']);
	exit();
}

$allowedTargetRoles = ['all', 'student', 'admin'];
if (!in_array($targetRole, $allowedTargetRoles, true)) {
	http_response_code(422);
	echo json_encode(['error' => 'Invalid target role.']);
	exit();
}

if ($authorName === '') {
	$authorName = 'CCS ADMIN';
}

$publishAt = null;
if ($publishAtRaw !== '') {
	$publishTimestamp = strtotime($publishAtRaw);
	if ($publishTimestamp === false) {
		http_response_code(422);
		echo json_encode(['error' => 'Invalid publish_at format.']);
		exit();
	}
	$publishAt = date('Y-m-d H:i:s', $publishTimestamp);
}

$expiresAt = null;
if ($expiresAtRaw !== '') {
	$expiresTimestamp = strtotime($expiresAtRaw);
	if ($expiresTimestamp === false) {
		http_response_code(422);
		echo json_encode(['error' => 'Invalid expires_at format.']);
		exit();
	}
	$expiresAt = date('Y-m-d H:i:s', $expiresTimestamp);
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
	try {
		$existingStmt = $pdo->prepare("SELECT announcement_id FROM announcements WHERE announcement_id = ? LIMIT 1");
		$existingStmt->execute([$announcementId]);
		if (!$existingStmt->fetch()) {
			http_response_code(404);
			echo json_encode(['error' => 'Announcement not found.']);
			exit();
		}

		$updateStmt = $pdo->prepare(
			"UPDATE announcements
			 SET title = ?,
				 content = ?,
				 type = ?,
				 priority = ?,
				 author_name = ?,
				 author_user_id = ?,
				 target_role = ?,
				 is_active = ?,
				 publish_at = COALESCE(?, publish_at),
				 expires_at = ?
			 WHERE announcement_id = ?"
		);
		$updateStmt->execute([
			$title,
			$content,
			$type,
			$priority,
			$authorName,
			$authorUserId,
			$targetRole,
			$isActive,
			$publishAt,
			$expiresAt,
			$announcementId,
		]);

		$fetchStmt = $pdo->prepare(
			"SELECT announcement_id, title, content, type, priority, author_name, author_user_id,
					target_role, is_active, publish_at, expires_at, created_at, updated_at
			 FROM announcements
			 WHERE announcement_id = ?
			 LIMIT 1"
		);
		$fetchStmt->execute([$announcementId]);
		$announcement = $fetchStmt->fetch();

		echo json_encode([
			'message' => 'Announcement updated successfully.',
			'announcement' => $announcement,
		]);
	} catch (PDOException $e) {
		http_response_code(500);
		echo json_encode([
			'error' => 'Failed to update announcement.',
			'details' => $e->getMessage(),
		]);
	}

	exit();
}

try {
	$pdo->beginTransaction();

	$insertStmt = $pdo->prepare(
		"INSERT INTO announcements (
			title, content, type, priority, author_name, author_user_id, target_role, is_active, publish_at, expires_at
		)
		VALUES (
			?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, NOW()), ?
		)"
	);

	$insertStmt->execute([
		$title,
		$content,
		$type,
		$priority,
		$authorName,
		$authorUserId,
		$targetRole,
		$isActive,
		$publishAt,
		$expiresAt,
	]);

	$announcementId = (int)$pdo->lastInsertId();

	$notificationsCreated = 0;
	$publishTimestamp = $publishAt !== null ? strtotime($publishAt) : false;
	$shouldCreateNotifications = $isActive === 1 && ($publishTimestamp === false || $publishTimestamp <= time());

	if ($shouldCreateNotifications) {
		$recipientSql = "";
		if ($targetRole === 'student') {
			$recipientSql = "SELECT id, role FROM users WHERE role = 'student'";
		} elseif ($targetRole === 'admin') {
			$recipientSql = "SELECT id, role FROM users WHERE role = 'admin'";
		} else {
			$recipientSql = "SELECT id, role FROM users";
		}

		$recipientStmt = $pdo->query($recipientSql);
		$recipients = $recipientStmt ? $recipientStmt->fetchAll() : [];

		if (!empty($recipients)) {
			$notificationInsert = $pdo->prepare(
				"INSERT INTO notifications (
					user_id,
					announcement_id,
					title,
					message,
					category,
					is_read,
					action_url,
					expires_at
				)
				VALUES (?, ?, ?, ?, 'announcement', 0, ?, ?)"
			);

			foreach ($recipients as $recipient) {
				$recipientRole = strtolower(trim((string)($recipient['role'] ?? 'student')));
				$actionUrl = $recipientRole === 'admin'
					? '/admin/announcements?announcement=' . $announcementId
					: '/dashboard/announcements?announcement=' . $announcementId;

				$notificationInsert->execute([
					(int)$recipient['id'],
					$announcementId,
					$title,
					$content,
					$actionUrl,
					$expiresAt,
				]);

				$notificationsCreated++;
			}
		}
	}

	$fetchStmt = $pdo->prepare(
		"SELECT announcement_id, title, content, type, priority, author_name, author_user_id,
				target_role, is_active, publish_at, expires_at, created_at, updated_at
		 FROM announcements
		 WHERE announcement_id = ?
		 LIMIT 1"
	);
	$fetchStmt->execute([$announcementId]);
	$announcement = $fetchStmt->fetch();

	$pdo->commit();

	http_response_code(201);
	echo json_encode([
		'message' => 'Announcement created successfully.',
		'announcement' => $announcement,
		'notifications_created' => $notificationsCreated,
	]);
} catch (PDOException $e) {
	if ($pdo->inTransaction()) {
		$pdo->rollBack();
	}

	http_response_code(500);
	echo json_encode([
		'error' => 'Failed to create announcement.',
		'details' => $e->getMessage(),
	]);
}
?>