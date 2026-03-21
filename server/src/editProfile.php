<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Get the origin from the request
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// CORS headers (needed for both Apache and PHP built-in server)
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
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 3600');
header("Content-Type: application/json; charset=UTF-8");

function debug_log($message) {
    error_log("[" . date('Y-m-d H:i:s') . "] " . $message);
}

debug_log("EditProfile request - Method: " . $_SERVER['REQUEST_METHOD']);

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

$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
$isMultipart = stripos($contentType, 'multipart/form-data') !== false;

if ($isMultipart) {
	$data = $_POST;
} else {
	$data = json_decode(file_get_contents("php://input"), true);

	if (!is_array($data)) {
		http_response_code(400);
		echo json_encode(["error" => "Invalid JSON payload."]);
		exit();
	}
}

// Match keys sent by frontend dashboard form.
$firstName = trim($data['firstName'] ?? '');
$lastName = trim($data['lastName'] ?? '');
$middleName = isset($data['MiddleName']) ? trim((string) $data['MiddleName']) : null;
$email = trim($data['email'] ?? '');
$course = trim($data['course'] ?? '');
$address = trim($data['address'] ?? '');
$yearLevel = trim($data['yearLevel'] ?? '');

$uploadedImageUrl = null;

if (isset($_FILES['profilePhoto']) && $_FILES['profilePhoto']['error'] !== UPLOAD_ERR_NO_FILE) {
	$file = $_FILES['profilePhoto'];

	if ($file['error'] !== UPLOAD_ERR_OK) {
		http_response_code(400);
		echo json_encode(["error" => "Failed to upload profile image."]);
		exit();
	}

	$maxSize = 5 * 1024 * 1024; // 5MB
	if (($file['size'] ?? 0) > $maxSize) {
		http_response_code(422);
		echo json_encode(["error" => "Profile image must be 5MB or smaller."]);
		exit();
	}

	$finfo = finfo_open(FILEINFO_MIME_TYPE);
	$mimeType = finfo_file($finfo, $file['tmp_name']);
	finfo_close($finfo);

	$allowedTypes = [
		'image/jpeg' => 'jpg',
		'image/png' => 'png',
		'image/webp' => 'webp',
	];

	if (!isset($allowedTypes[$mimeType])) {
		http_response_code(422);
		echo json_encode(["error" => "Only JPG, PNG, or WEBP images are allowed."]);
		exit();
	}

	$uploadDir = realpath(__DIR__ . '/../public');
	if ($uploadDir === false) {
		http_response_code(500);
		echo json_encode(["error" => "Upload directory not found."]);
		exit();
	}

	$profileDir = $uploadDir . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'profile';
	if (!is_dir($profileDir) && !mkdir($profileDir, 0777, true)) {
		http_response_code(500);
		echo json_encode(["error" => "Failed to create upload directory."]);
		exit();
	}

	$ext = $allowedTypes[$mimeType];
	$fileName = 'profile_' . time() . '_' . bin2hex(random_bytes(5)) . '.' . $ext;
	$targetPath = $profileDir . DIRECTORY_SEPARATOR . $fileName;

	if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
		http_response_code(500);
		echo json_encode(["error" => "Failed to save profile image."]);
		exit();
	}

	$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
	$host = $_SERVER['HTTP_HOST'] ?? 'localhost:8080';
	$uploadedImageUrl = $scheme . '://' . $host . '/CCS-Computer-Sit-In-Monitoring-System/server/public/uploads/profile/' . $fileName;
}

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

	$updateSql = "UPDATE users
		 SET first_name = ?,
			 middle_name = ?,
			 last_name = ?,
			 course = ?,
			 year_level = ?,
			 email = ?,
			 address = ?";

	$updateParams = [
		$firstName,
		$middleName,
		$lastName,
		$course,
		$yearLevel,
		$email,
		$address,
	];

	if ($uploadedImageUrl !== null) {
		$updateSql .= ",
			 profilePicture = ?";
		$updateParams[] = $uploadedImageUrl;
	}

	$updateSql .= "
		 WHERE email = ?";
	$updateParams[] = $currentEmail;

	$updateStmt = $pdo->prepare($updateSql);
	$updateStmt->execute($updateParams);

	$userStmt = $pdo->prepare(
		"SELECT id_number, first_name, middle_name, last_name, course, year_level, email, address, role, profilePicture
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
