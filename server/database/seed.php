<?php
/**
 * ============================================================
 *  CCS Computer Sit-In Monitoring System — Database Seeder
 * ============================================================
 *
 *  Run this ONCE after cloning the repo on a fresh machine:
 *
 *      php server/database/seed.php
 *
 *  Or with custom credentials:
 *
 *      php server/database/seed.php --host=localhost --user=root --pass=secret
 *
 *  Options:
 *    --host   MySQL host          (default: localhost)
 *    --port   MySQL port          (default: 3306)
 *    --user   MySQL username      (default: root)
 *    --pass   MySQL password      (default: empty — XAMPP default)
 *
 *  The script will:
 *    1. Connect to MySQL (no database selected yet).
 *    2. Execute setup.sql which creates the DB, all tables, and seeds data:
 *         - 6 laboratories (5 active, 1 in maintenance)
 *         - 20 software titles with per-lab assignments
 *         - 1 admin + 8 sample student accounts
 *         - Sample sit-in session history
 *         - Sample testimonials
 *         - 3 starter announcements
 *    3. Print a success or error summary.
 * ============================================================
 */

declare(strict_types=1);

// ── Parse CLI arguments ───────────────────────────────────
$opts = getopt('', ['host::', 'port::', 'user::', 'pass::']);

$host = $opts['host'] ?? 'localhost';
$port = (int)($opts['port'] ?? 3306);
$user = $opts['user'] ?? 'root';
$pass = $opts['pass'] ?? '';

$sqlFile = __DIR__ . '/setup.sql';

// ── Helpers ───────────────────────────────────────────────
function println(string $msg, string $prefix = ''): void
{
    echo $prefix . $msg . PHP_EOL;
}

function ok(string $msg): void   { println("\033[32m✔  $msg\033[0m"); }
function info(string $msg): void { println("\033[36mℹ  $msg\033[0m"); }
function warn(string $msg): void { println("\033[33m⚠  $msg\033[0m"); }
function fail(string $msg): void { println("\033[31m✘  $msg\033[0m"); }

// ── Banner ────────────────────────────────────────────────
echo PHP_EOL;
println('╔══════════════════════════════════════════════════════╗');
println('║   CCS Computer Sit-In Monitoring System — Seeder    ║');
println('╚══════════════════════════════════════════════════════╝');
echo PHP_EOL;

// ── Verify setup.sql exists ───────────────────────────────
if (!file_exists($sqlFile)) {
    fail("setup.sql not found at: $sqlFile");
    exit(1);
}

info("Using setup file : $sqlFile");
info("MySQL host       : $host:$port");
info("MySQL user       : $user");
echo PHP_EOL;

// ── Connect (no dbname — setup.sql creates it) ────────────
try {
    $dsn = "mysql:host=$host;port=$port;charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    ok("Connected to MySQL at $host:$port");
} catch (PDOException $e) {
    fail('Could not connect to MySQL: ' . $e->getMessage());
    echo PHP_EOL;
    warn('Make sure XAMPP MySQL is running, and your credentials are correct.');
    warn('You can override them: php seed.php --user=root --pass=yourpassword');
    exit(1);
}

// ── Read and split SQL into individual statements ──────────
$rawSql = file_get_contents($sqlFile);

// Strip single-line comments (-- ...) and split on semicolons
// while preserving string literals.
$statements = array_filter(
    array_map(
        'trim',
        splitSqlStatements($rawSql)
    ),
    fn(string $s) => $s !== ''
);

// ── Execute each statement ────────────────────────────────
$success = 0;
$errors  = 0;

foreach ($statements as $sql) {
    try {
        $pdo->exec($sql);
        $success++;
    } catch (PDOException $e) {
        $errors++;
        $preview = mb_substr(preg_replace('/\s+/', ' ', $sql), 0, 80);
        warn("Skipped (non-fatal): {$e->getMessage()}");
        warn("Statement preview  : $preview …");
    }
}

echo PHP_EOL;

if ($errors === 0) {
    ok("All $success statements executed successfully.");
} else {
    warn("$success statements OK, $errors skipped (see warnings above).");
    info('Non-fatal skips usually mean a column/index already exists — that is fine.');
}

// ── Show seeded admin credentials ─────────────────────────
echo PHP_EOL;
println('┌──────────────────────────────────────────────────────────────┐');
println('│  Default Login Credentials                                   │');
println('├──────────────────────────────────────────────────────────────┤');
println('│  Admin   →  admin@ccs.edu.ph               / Admin@123       │');
println('├──────────────────────────────────────────────────────────────┤');
println('│  Students (all use password: Student@123)                    │');
println('│  juan.cruz@students.edu.ph        (2021-00001) BSIT 3rd      │');
println('│  maria.santos@students.edu.ph     (2021-00002) BSCS 2nd      │');
println('│  pedro.reyes@students.edu.ph      (2022-00003) BSIS 1st      │');
println('│  ana.lim@students.edu.ph          (2022-00004) BSIT 4th      │');
println('│  carlo.gomez@students.edu.ph      (2023-00005) BSCS 1st      │');
println('│  sofia.delatorre@students.edu.ph  (2023-00006) BSIT 2nd      │');
println('│  marco.villanueva@students.edu.ph (2020-00007) BSCS 4th      │');
println('│  lea.fernandez@students.edu.ph    (2021-00008) BSIS 3rd      │');
println('├──────────────────────────────────────────────────────────────┤');
println('│  ⚠  Change the admin password after first login!            │');
println('└──────────────────────────────────────────────────────────────┘');
echo PHP_EOL;

ok('Database setup complete! You can now start the application.');
echo PHP_EOL;
exit(0);

// ── SQL splitter (handles multi-line statements) ───────────
/**
 * Split a raw SQL dump into individual executable statements,
 * correctly handling semicolons inside quoted strings.
 *
 * @return string[]
 */
function splitSqlStatements(string $sql): array
{
    $statements = [];
    $current    = '';
    $inString   = false;
    $stringChar = '';
    $len        = strlen($sql);

    for ($i = 0; $i < $len; $i++) {
        $char = $sql[$i];

        // Toggle string context
        if (!$inString && ($char === "'" || $char === '"' || $char === '`')) {
            $inString   = true;
            $stringChar = $char;
            $current   .= $char;
            continue;
        }

        if ($inString) {
            $current .= $char;
            // Handle escaped quotes inside strings
            if ($char === '\\' && $i + 1 < $len) {
                $current .= $sql[++$i];
                continue;
            }
            if ($char === $stringChar) {
                // Check for doubled-quote escape ('')
                if ($i + 1 < $len && $sql[$i + 1] === $stringChar) {
                    $current .= $sql[++$i];
                    continue;
                }
                $inString = false;
            }
            continue;
        }

        // Outside string: strip single-line comments
        if ($char === '-' && isset($sql[$i + 1]) && $sql[$i + 1] === '-') {
            // Skip until end of line
            while ($i < $len && $sql[$i] !== "\n") {
                $i++;
            }
            $current .= "\n";
            continue;
        }

        // Statement terminator
        if ($char === ';') {
            $statements[] = trim($current);
            $current      = '';
            continue;
        }

        $current .= $char;
    }

    // Capture any trailing statement without semicolon
    if (trim($current) !== '') {
        $statements[] = trim($current);
    }

    return $statements;
}
