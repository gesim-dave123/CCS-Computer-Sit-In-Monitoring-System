<?php
require_once __DIR__ . '/config/db_connection.php';

try {
    // Attempt to query the database to ensure connection is valid
    $stmt = $pdo->query("SELECT DATABASE() as db_name");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "\n\nDatabase Connection Test Passed!\n";
    echo "Currently connected to database: " . $result['db_name'] . "\n";
} catch (PDOException $e) {
    echo "\n\nDatabase Connection Test Failed!\n";
    echo "Error details: " . $e->getMessage() . "\n";
}
