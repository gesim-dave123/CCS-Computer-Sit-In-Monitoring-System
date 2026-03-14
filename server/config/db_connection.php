<?php
    $sName = "localhost"; 
    $uName = "root"; 
    $pass = ""; 
    $db_name = "ccs_sit_in_db";

    try {
        $pdo = new PDO("mysql:host=$sName;dbname=$db_name;charset=utf8mb4", $uName, $pass);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        echo "Connected successfully";
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Connection failed: " . $e->getMessage()]);
        exit();
    }
?>