<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
	http_response_code(200);
	exit();
}

require_once '../config/db_connection.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	http_response_code(405);
	echo json_encode(["error" => "Method not allowed"]);
	exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (!is_array($data)) {
	http_response_code(400);
	echo json_encode(["error" => "Invalid JSON payload."]);
	exit();
}

// Match keys sent by frontend dashboard form.
$firstName = trim($data['firstName'] ?? '');
$lastName = trim($data['lastName'] ?? '');
$middleName = isset($data['MiddleName']) ? trim((string) $data['MiddleName']) : null;
$email = trim($data['email'] ?? '');
$course = trim($data['course'] ?? '');
$address = trim($data['address'] ?? '');
$yearLevel = trim($data['yearLevel'] ?? '');

// Optional lookup key if frontend later sends currentEmail for email-change support.
$currentEmail = trim($data['currentEmail'] ?? $email);

if (
	$firstName === '' ||
	$lastName === '' ||
	$email === '' ||
	$course === '' ||
	$address === '' ||
	$yearLevel === ''
) {
	http_response_code(422);
	echo json_encode(["error" => "All required profile fields must be provided."]);
	exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
	http_response_code(422);
	echo json_encode(["error" => "Invalid email format."]);
	exit();
}

try {
	$checkUserStmt = $pdo->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
	$checkUserStmt->execute([$currentEmail]);
	$existingUser = $checkUserStmt->fetch();

	if (!$existingUser) {
		http_response_code(404);
		echo json_encode(["error" => "User not found."]);
		exit();
	}

	if (strcasecmp($currentEmail, $email) !== 0) {
		$checkEmailStmt = $pdo->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
		$checkEmailStmt->execute([$email]);
		if ($checkEmailStmt->fetch()) {
			http_response_code(409);
			echo json_encode(["error" => "Email is already in use."]);
			exit();
		}
	}

	$updateStmt = $pdo->prepare(
		"UPDATE users
		 SET first_name = ?,
			 middle_name = ?,
			 last_name = ?,
			 course = ?,
			 year_level = ?,
			 email = ?,
			 address = ?
		 WHERE email = ?"
	);

	$updateStmt->execute([
		$firstName,
		$middleName,
		$lastName,
		$course,
		$yearLevel,
		$email,
		$address,
		$currentEmail,
	]);

	$userStmt = $pdo->prepare(
		"SELECT id_number, first_name, middle_name, last_name, course, year_level, email, address, role
		 FROM users
		 WHERE email = ?
		 LIMIT 1"
	);
	$userStmt->execute([$email]);
	$updatedUser = $userStmt->fetch();

	http_response_code(200);
	echo json_encode([
		"message" => "Profile updated successfully.",
		"user" => $updatedUser,
	]);
} catch (PDOException $e) {
	http_response_code(500);
	echo json_encode([
		"error" => "Failed to update profile.",
		"details" => $e->getMessage(),
	]);
}
?>
