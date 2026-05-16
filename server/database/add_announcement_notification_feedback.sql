-- Create communication-related tables.
-- Safe to run multiple times due to IF NOT EXISTS guards.

CREATE TABLE IF NOT EXISTS announcements (
    announcement_id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(160) NOT NULL,
    content TEXT NOT NULL,
    type ENUM('maintenance', 'rules', 'event', 'general') NOT NULL DEFAULT 'general',
    priority ENUM('high', 'medium', 'low') NOT NULL DEFAULT 'low',
    author_name VARCHAR(120) NOT NULL,
    author_user_id INT NULL,
    target_role ENUM('all', 'student', 'admin') NOT NULL DEFAULT 'student',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    publish_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (announcement_id),
    KEY idx_ann_active_publish (is_active, publish_at),
    KEY idx_ann_priority (priority),
    KEY idx_ann_type (type),
    KEY idx_ann_target_role (target_role),
    KEY idx_ann_author_user (author_user_id),
    KEY idx_ann_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NULL,
    announcement_id INT NULL,
    title VARCHAR(160) NOT NULL,
    message TEXT NOT NULL,
    category ENUM('system', 'announcement', 'sit_in', 'account', 'reminder', 'reservation') NOT NULL DEFAULT 'system',
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    read_at DATETIME NULL,
    action_url VARCHAR(255) NULL,
    expires_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (notification_id),
    KEY idx_notif_user_read_created (user_id, is_read, created_at),
    KEY idx_notif_announcement (announcement_id),
    KEY idx_notif_category (category),
    KEY idx_notif_expires_at (expires_at),
    KEY idx_notif_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS feedback (
    feedback_id INT NOT NULL AUTO_INCREMENT,
    sit_in_id INT UNSIGNED NULL,
    user_id INT NULL,
    subject VARCHAR(160) NOT NULL,
    message TEXT NOT NULL,
    rating TINYINT UNSIGNED NULL,
    category ENUM('general', 'bug', 'feature', 'complaint', 'other') NOT NULL DEFAULT 'general',
    status ENUM('new', 'in_review', 'resolved', 'closed') NOT NULL DEFAULT 'new',
    admin_response TEXT NULL,
    responded_by INT NULL,
    responded_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (feedback_id),
    KEY idx_feedback_sit_in (sit_in_id),
    KEY idx_feedback_user (user_id),
    KEY idx_feedback_status (status),
    KEY idx_feedback_category (category),
    KEY idx_feedback_created_at (created_at),
    KEY idx_feedback_responded_by (responded_by),
    CONSTRAINT fk_feedback_sit_in
        FOREIGN KEY (sit_in_id)
        REFERENCES sit_in_sessions (sitIn_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ensure relation exists on already-created feedback tables.
SET @sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = DATABASE()
              AND table_name = 'feedback'
              AND column_name = 'sit_in_id'
        ),
        'SELECT 1',
        'ALTER TABLE feedback ADD COLUMN sit_in_id INT UNSIGNED NULL AFTER feedback_id'
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
              AND table_name = 'feedback'
              AND column_name = 'sit_in_id'
        ),
        'SELECT 1',
        'ALTER TABLE feedback ADD KEY idx_feedback_sit_in (sit_in_id)'
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM information_schema.table_constraints
            WHERE table_schema = DATABASE()
              AND table_name = 'feedback'
              AND constraint_name = 'fk_feedback_sit_in'
              AND constraint_type = 'FOREIGN KEY'
        ),
        'SELECT 1',
        'ALTER TABLE feedback ADD CONSTRAINT fk_feedback_sit_in FOREIGN KEY (sit_in_id) REFERENCES sit_in_sessions (sitIn_id) ON UPDATE CASCADE ON DELETE SET NULL'
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
