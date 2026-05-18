-- Schema sync for ccs_sit_in_db
-- Safe to run multiple times.

CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_number VARCHAR(50) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100) NULL,
    last_name VARCHAR(100) NOT NULL,
    course VARCHAR(100) NOT NULL,
    year_level VARCHAR(50) NOT NULL,
    email VARCHAR(191) NOT NULL,
    address TEXT NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student',
    remaining_sessions INT NOT NULL DEFAULT 30,
    used_session INT NOT NULL DEFAULT 0,
    is_in_session TINYINT(1) NOT NULL DEFAULT 0,
    profilePicture VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_id_number (id_number),
    UNIQUE KEY uq_users_email (email),
    KEY idx_users_role (role),
    KEY idx_users_is_in_session (is_in_session)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sit_in_sessions (
    sitIn_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_number VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    lab VARCHAR(100) NOT NULL,
    pc_number VARCHAR(50) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'in_session',
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (sitIn_id),
    KEY idx_sit_in_status_started (status, started_at),
    KEY idx_sit_in_id_number (id_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add users columns if they are missing.
SET @sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = DATABASE()
              AND table_name = 'users'
              AND column_name = 'middle_name'
        ),
        'SELECT 1',
        'ALTER TABLE users ADD COLUMN middle_name VARCHAR(100) NULL AFTER first_name'
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = DATABASE()
              AND table_name = 'users'
              AND column_name = 'role'
        ),
        'SELECT 1',
        'ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT ''student'''
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = DATABASE()
              AND table_name = 'users'
              AND column_name = 'remaining_sessions'
        ),
        'SELECT 1',
        'ALTER TABLE users ADD COLUMN remaining_sessions INT NOT NULL DEFAULT 30'
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = DATABASE()
              AND table_name = 'users'
              AND column_name = 'used_session'
        ),
        'SELECT 1',
        'ALTER TABLE users ADD COLUMN used_session INT NOT NULL DEFAULT 0 AFTER remaining_sessions'
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = DATABASE()
              AND table_name = 'users'
              AND column_name = 'is_in_session'
        ),
        'SELECT 1',
        'ALTER TABLE users ADD COLUMN is_in_session TINYINT(1) NOT NULL DEFAULT 0'
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = DATABASE()
              AND table_name = 'users'
              AND column_name = 'profilePicture'
        ),
        'SELECT 1',
        'ALTER TABLE users ADD COLUMN profilePicture VARCHAR(255) NULL'
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = DATABASE()
              AND table_name = 'users'
              AND column_name = 'created_at'
        ),
        'SELECT 1',
        'ALTER TABLE users ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP'
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add sit_in_sessions columns if they are missing.
SET @sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = DATABASE()
              AND table_name = 'sit_in_sessions'
              AND column_name = 'status'
        ),
        'SELECT 1',
        'ALTER TABLE sit_in_sessions ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT ''in_session'''
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = DATABASE()
              AND table_name = 'sit_in_sessions'
              AND column_name = 'started_at'
        ),
        'SELECT 1',
        'ALTER TABLE sit_in_sessions ADD COLUMN started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP'
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = DATABASE()
              AND table_name = 'sit_in_sessions'
              AND column_name = 'used_session'
        ),
        'ALTER TABLE sit_in_sessions DROP COLUMN used_session',
        'SELECT 1'
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = DATABASE()
              AND table_name = 'sit_in_sessions'
              AND column_name = 'ended_at'
        ),
        'SELECT 1',
        'ALTER TABLE sit_in_sessions ADD COLUMN ended_at TIMESTAMP NULL DEFAULT NULL'
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add indexes if missing.
SET @sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM information_schema.statistics
            WHERE table_schema = DATABASE()
              AND table_name = 'users'
              AND column_name = 'id_number'
              AND non_unique = 0
        ),
        'SELECT 1',
        'ALTER TABLE users ADD UNIQUE INDEX uq_users_id_number (id_number)'
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM information_schema.statistics
            WHERE table_schema = DATABASE()
              AND table_name = 'users'
              AND column_name = 'email'
              AND non_unique = 0
        ),
        'SELECT 1',
        'ALTER TABLE users ADD UNIQUE INDEX uq_users_email (email)'
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM information_schema.statistics
            WHERE table_schema = DATABASE()
              AND table_name = 'users'
              AND column_name = 'role'
        ),
        'SELECT 1',
        'ALTER TABLE users ADD INDEX idx_users_role (role)'
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM information_schema.statistics
            WHERE table_schema = DATABASE()
              AND table_name = 'users'
              AND column_name = 'is_in_session'
        ),
        'SELECT 1',
        'ALTER TABLE users ADD INDEX idx_users_is_in_session (is_in_session)'
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM information_schema.statistics
            WHERE table_schema = DATABASE()
              AND table_name = 'sit_in_sessions'
              AND column_name = 'status'
        ),
        'SELECT 1',
        'ALTER TABLE sit_in_sessions ADD INDEX idx_sit_in_status_started (status, started_at)'
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM information_schema.statistics
            WHERE table_schema = DATABASE()
              AND table_name = 'sit_in_sessions'
              AND column_name = 'id_number'
        ),
        'SELECT 1',
        'ALTER TABLE sit_in_sessions ADD INDEX idx_sit_in_id_number (id_number)'
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = DATABASE()
              AND table_name = 'sit_in_sessions'
              AND column_name = 'pc_number'
        ),
        'SELECT 1',
        'ALTER TABLE sit_in_sessions ADD COLUMN pc_number VARCHAR(50) NULL AFTER lab'
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Backfill data for new nullable-to-required behavior used by API code.
UPDATE users
SET role = 'student'
WHERE role IS NULL OR TRIM(role) = '';

UPDATE users
SET remaining_sessions = 30
WHERE remaining_sessions IS NULL;

UPDATE users
SET used_session = 0
WHERE used_session IS NULL;

UPDATE users
SET is_in_session = 0
WHERE is_in_session IS NULL;

UPDATE sit_in_sessions
SET started_at = COALESCE(started_at, ended_at, NOW())
WHERE started_at IS NULL;

UPDATE sit_in_sessions
SET status = 'ended'
WHERE ended_at IS NOT NULL AND (status IS NULL OR status <> 'ended');

UPDATE sit_in_sessions
SET status = 'in_session'
WHERE ended_at IS NULL AND (status IS NULL OR status = '');

UPDATE users u
SET u.used_session = (
    SELECT COUNT(*)
    FROM sit_in_sessions s
    WHERE BINARY s.id_number = BINARY u.id_number
      AND s.status = 'ended'
)
WHERE u.role = 'student';
