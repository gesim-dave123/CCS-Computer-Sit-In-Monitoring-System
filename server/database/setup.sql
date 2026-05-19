-- ============================================================
--  CCS Computer Sit-In Monitoring System
--  Master Setup Script  (v2 — synced with all migrations)
--  ─────────────────────────────────────────────────────────
--  HOW TO RUN (choose one):
--    Option A (PHP CLI, recommended):
--      php server/database/seed.php
--
--    Option B (MySQL CLI):
--      mysql -u root -p < server/database/setup.sql
--
--    Option C (phpMyAdmin):
--      Import this file via phpMyAdmin > Import tab.
--
--  SAFE TO RE-RUN: uses IF NOT EXISTS and INSERT IGNORE.
-- ============================================================

-- 1. Create the database if it doesn't exist and select it.
CREATE DATABASE IF NOT EXISTS `ccs_sit_in_db`
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE `ccs_sit_in_db`;

-- ============================================================
--  TABLE: users
-- ============================================================
CREATE TABLE IF NOT EXISTS `users` (
    `id`                 INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    `id_number`          VARCHAR(50)     NOT NULL,
    `first_name`         VARCHAR(100)    NOT NULL,
    `middle_name`        VARCHAR(100)    NULL,
    `last_name`          VARCHAR(100)    NOT NULL,
    `course`             VARCHAR(100)    NOT NULL,
    `year_level`         VARCHAR(50)     NOT NULL,
    `email`              VARCHAR(191)    NOT NULL,
    `address`            TEXT            NOT NULL,
    `password`           VARCHAR(255)    NOT NULL,
    `role`               VARCHAR(20)     NOT NULL DEFAULT 'student',
    `remaining_sessions` INT             NOT NULL DEFAULT 30,
    `used_session`       INT             NOT NULL DEFAULT 0,
    `is_in_session`      TINYINT(1)      NOT NULL DEFAULT 0,
    `profilePicture`     VARCHAR(255)    NULL,
    `created_at`         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_users_id_number` (`id_number`),
    UNIQUE KEY `uq_users_email`     (`email`),
    KEY `idx_users_role`            (`role`),
    KEY `idx_users_is_in_session`   (`is_in_session`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  TABLE: sit_in_sessions
--  NOTE: lab_id column links to laboratories table.
-- ============================================================
CREATE TABLE IF NOT EXISTS `sit_in_sessions` (
    `sitIn_id`   INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_number`  VARCHAR(50)  NOT NULL,
    `name`       VARCHAR(255) NOT NULL,
    `purpose`    VARCHAR(255) NOT NULL,
    `lab`        VARCHAR(100) NOT NULL,
    `lab_id`     INT UNSIGNED NULL,
    `pc_number`  VARCHAR(50)  NULL,
    `status`     VARCHAR(20)  NOT NULL DEFAULT 'in_session',
    `started_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `ended_at`   TIMESTAMP    NULL     DEFAULT NULL,
    PRIMARY KEY (`sitIn_id`),
    KEY `idx_sit_in_status_started` (`status`, `started_at`),
    KEY `idx_sit_in_id_number`      (`id_number`),
    KEY `idx_sit_in_lab_id`         (`lab_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  TABLE: laboratories
--  NOTE: `status` column added via disable_reservations_migration.
-- ============================================================
CREATE TABLE IF NOT EXISTS `laboratories` (
    `lab_id`      INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `lab_name`    VARCHAR(100) NOT NULL,
    `room_number` VARCHAR(50)  NULL,
    `description` TEXT         NULL,
    `seats`       INT UNSIGNED NOT NULL DEFAULT 30,
    `building`    VARCHAR(100) NULL     DEFAULT 'CCS Building',
    `status`      ENUM('active','maintenance') NOT NULL DEFAULT 'active',
    `created_at`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`lab_id`),
    UNIQUE KEY `uq_lab_name` (`lab_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  TABLE: software
-- ============================================================
CREATE TABLE IF NOT EXISTS `software` (
    `software_id`   INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `software_name` VARCHAR(100) NOT NULL,
    `category`      VARCHAR(50)  NULL,
    `icon_url`      VARCHAR(255) NULL,
    `created_at`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`software_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  TABLE: lab_software  (pivot: labs <-> software)
-- ============================================================
CREATE TABLE IF NOT EXISTS `lab_software` (
    `lab_id`      INT UNSIGNED NOT NULL,
    `software_id` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`lab_id`, `software_id`),
    FOREIGN KEY (`lab_id`)      REFERENCES `laboratories`(`lab_id`)  ON DELETE CASCADE,
    FOREIGN KEY (`software_id`) REFERENCES `software`(`software_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  TABLE: disabled_terminals
--  NOTE: Added via disable_reservations_migration.
-- ============================================================
CREATE TABLE IF NOT EXISTS `disabled_terminals` (
    `lab_id`      INT UNSIGNED NOT NULL,
    `seat_number` INT UNSIGNED NOT NULL,
    `reason`      VARCHAR(255) NULL,
    `created_at`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`lab_id`, `seat_number`),
    FOREIGN KEY (`lab_id`) REFERENCES `laboratories`(`lab_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  TABLE: testimonials
-- ============================================================
CREATE TABLE IF NOT EXISTS `testimonials` (
    `testimonial_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `student_id`     VARCHAR(50)  NOT NULL,
    `rating`         TINYINT      NOT NULL,
    `category`       VARCHAR(50)  NULL,
    `comment`        TEXT         NOT NULL,
    `is_visible`     TINYINT(1)   NOT NULL DEFAULT 1,
    `is_deleted`     TINYINT(1)   NOT NULL DEFAULT 0,
    `created_at`     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`testimonial_id`),
    KEY `idx_testimonials_student` (`student_id`),
    KEY `idx_testimonials_visible` (`is_visible`, `is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  TABLE: announcements
-- ============================================================
CREATE TABLE IF NOT EXISTS `announcements` (
    `announcement_id` INT          NOT NULL AUTO_INCREMENT,
    `title`           VARCHAR(160) NOT NULL,
    `content`         TEXT         NOT NULL,
    `type`            ENUM('maintenance','rules','event','general') NOT NULL DEFAULT 'general',
    `priority`        ENUM('high','medium','low')                   NOT NULL DEFAULT 'low',
    `author_name`     VARCHAR(120) NOT NULL,
    `author_user_id`  INT          NULL,
    `target_role`     ENUM('all','student','admin')                 NOT NULL DEFAULT 'student',
    `is_active`       TINYINT(1)   NOT NULL DEFAULT 1,
    `publish_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `expires_at`      DATETIME     NULL,
    `created_at`      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`announcement_id`),
    KEY `idx_ann_active_publish` (`is_active`, `publish_at`),
    KEY `idx_ann_priority`       (`priority`),
    KEY `idx_ann_type`           (`type`),
    KEY `idx_ann_target_role`    (`target_role`),
    KEY `idx_ann_author_user`    (`author_user_id`),
    KEY `idx_ann_created_at`     (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  TABLE: notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS `notifications` (
    `notification_id` INT          NOT NULL AUTO_INCREMENT,
    `user_id`         INT          NULL,
    `announcement_id` INT          NULL,
    `title`           VARCHAR(160) NOT NULL,
    `message`         TEXT         NOT NULL,
    `category`        ENUM('system','announcement','sit_in','account','reminder','reservation') NOT NULL DEFAULT 'system',
    `is_read`         TINYINT(1)   NOT NULL DEFAULT 0,
    `read_at`         DATETIME     NULL,
    `action_url`      VARCHAR(255) NULL,
    `expires_at`      DATETIME     NULL,
    `created_at`      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`notification_id`),
    KEY `idx_notif_user_read_created` (`user_id`, `is_read`, `created_at`),
    KEY `idx_notif_announcement`      (`announcement_id`),
    KEY `idx_notif_category`          (`category`),
    KEY `idx_notif_expires_at`        (`expires_at`),
    KEY `idx_notif_created_at`        (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  TABLE: feedback
-- ============================================================
CREATE TABLE IF NOT EXISTS `feedback` (
    `feedback_id`    INT          NOT NULL AUTO_INCREMENT,
    `sit_in_id`      INT UNSIGNED NULL,
    `user_id`        INT          NULL,
    `subject`        VARCHAR(160) NOT NULL,
    `message`        TEXT         NOT NULL,
    `rating`         TINYINT UNSIGNED NULL,
    `category`       ENUM('general','bug','feature','complaint','other') NOT NULL DEFAULT 'general',
    `status`         ENUM('new','in_review','resolved','closed')         NOT NULL DEFAULT 'new',
    `admin_response` TEXT         NULL,
    `responded_by`   INT          NULL,
    `responded_at`   DATETIME     NULL,
    `created_at`     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`feedback_id`),
    KEY `idx_feedback_sit_in`      (`sit_in_id`),
    KEY `idx_feedback_user`        (`user_id`),
    KEY `idx_feedback_status`      (`status`),
    KEY `idx_feedback_category`    (`category`),
    KEY `idx_feedback_created_at`  (`created_at`),
    KEY `idx_feedback_responded_by`(`responded_by`),
    CONSTRAINT `fk_feedback_sit_in`
        FOREIGN KEY (`sit_in_id`)
        REFERENCES `sit_in_sessions`(`sitIn_id`)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  TABLE: reservations
-- ============================================================
CREATE TABLE IF NOT EXISTS `reservations` (
    `reservation_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_number`      VARCHAR(50)  NOT NULL,
    `student_name`   VARCHAR(255) NOT NULL,
    `lab`            VARCHAR(100) NOT NULL,
    `lab_id`         INT UNSIGNED NULL,
    `seat_number`    INT UNSIGNED NOT NULL,
    `purpose`        VARCHAR(255) NOT NULL,
    `reserved_date`  DATE         NOT NULL,
    `time_slot`      VARCHAR(50)  NOT NULL,
    `status`         VARCHAR(20)  NOT NULL DEFAULT 'pending',
    `created_at`     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`reservation_id`),
    UNIQUE KEY `uq_res_seat_slot` (`lab`, `seat_number`, `reserved_date`, `time_slot`),
    KEY `idx_res_id_number` (`id_number`),
    KEY `idx_res_lab_date`  (`lab`, `reserved_date`),
    KEY `idx_res_status`    (`status`),
    KEY `idx_res_lab_id`    (`lab_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  SEED DATA
-- ============================================================

-- ── Admin account ─────────────────────────────────────────
-- Default password: Admin@123  (bcrypt hash)
-- CHANGE THIS PASSWORD immediately after first login!
INSERT IGNORE INTO `users`
    (`id_number`, `first_name`, `last_name`, `course`, `year_level`,
     `email`, `address`, `password`, `role`, `remaining_sessions`)
VALUES
    ('ADMIN-001', 'CCS', 'Administrator', 'N/A', 'N/A',
     'admin@ccs.edu.ph',
     'CCS Department, Main Building',
     '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
     'admin', 0);

-- ── Sample student accounts ───────────────────────────────
-- Default password for all sample students: Student@123
INSERT IGNORE INTO `users`
    (`id_number`, `first_name`, `middle_name`, `last_name`, `course`, `year_level`,
     `email`, `address`, `password`, `role`, `remaining_sessions`, `used_session`)
VALUES
    ('2021-00001', 'Juan',   'Dela',  'Cruz',       'BSIT', '3rd Year',
     'juan.cruz@students.edu.ph',      'Cebu City',      '$2y$10$TKh8H1.PyfcAZgZWutAnby', 'student', 25, 5),

    ('2021-00002', 'Maria',  NULL,    'Santos',     'BSCS', '2nd Year',
     'maria.santos@students.edu.ph',   'Mandaue City',   '$2y$10$TKh8H1.PyfcAZgZWutAnby', 'student', 22, 8),

    ('2022-00003', 'Pedro',  'B.',    'Reyes',      'BSIS', '1st Year',
     'pedro.reyes@students.edu.ph',    'Lapu-Lapu City', '$2y$10$TKh8H1.PyfcAZgZWutAnby', 'student', 30, 0),

    ('2022-00004', 'Ana',    NULL,    'Lim',        'BSIT', '4th Year',
     'ana.lim@students.edu.ph',        'Talisay City',   '$2y$10$TKh8H1.PyfcAZgZWutAnby', 'student', 18, 12),

    ('2023-00005', 'Carlo',  'M.',    'Gomez',      'BSCS', '1st Year',
     'carlo.gomez@students.edu.ph',    'Cebu City',      '$2y$10$TKh8H1.PyfcAZgZWutAnby', 'student', 30, 0),

    ('2023-00006', 'Sofia',  NULL,    'Dela Torre', 'BSIT', '2nd Year',
     'sofia.delatorre@students.edu.ph','Minglanilla',    '$2y$10$TKh8H1.PyfcAZgZWutAnby', 'student', 27, 3),

    ('2020-00007', 'Marco',  'L.',    'Villanueva', 'BSCS', '4th Year',
     'marco.villanueva@students.edu.ph','Consolacion',   '$2y$10$TKh8H1.PyfcAZgZWutAnby', 'student', 10, 20),

    ('2021-00008', 'Lea',    NULL,    'Fernandez',  'BSIS', '3rd Year',
     'lea.fernandez@students.edu.ph',  'Toledo City',    '$2y$10$TKh8H1.PyfcAZgZWutAnby', 'student', 29, 1);

-- ── Laboratories ──────────────────────────────────────────
INSERT IGNORE INTO `laboratories` (`lab_name`, `room_number`, `seats`, `building`, `status`) VALUES
    ('Lab 519', '519', 30, 'CCS Building', 'active'),
    ('Lab 524', '524', 30, 'CCS Building', 'active'),
    ('Lab 526', '526', 40, 'CCS Building', 'active'),
    ('Lab 528', '528', 40, 'CCS Building', 'active'),
    ('Lab 530', '530', 30, 'CCS Building', 'maintenance'),
    ('Lab 542', '542', 35, 'CCS Building', 'active');

-- ── Software catalog ──────────────────────────────────────
INSERT IGNORE INTO `software` (`software_name`, `category`) VALUES
    ('Microsoft Office 365', 'Office'),
    ('Visual Studio Code',   'IDE'),
    ('Eclipse IDE',          'IDE'),
    ('NetBeans',             'IDE'),
    ('XAMPP',                'Utility'),
    ('MySQL Workbench',      'Database'),
    ('Android Studio',       'IDE'),
    ('Google Chrome',        'Browser'),
    ('Mozilla Firefox',      'Browser'),
    ('Notepad++',            'Utility'),
    ('7-Zip',                'Utility'),
    ('Adobe Photoshop',      'Design'),
    ('Figma',                'Design'),
    ('Python 3',             'IDE'),
    ('Node.js',              'Utility'),
    ('IntelliJ IDEA',        'IDE'),
    ('DBeaver',              'Database'),
    ('Postman',              'Utility'),
    ('Git',                  'Utility'),
    ('VirtualBox',           'Utility');

-- ── Base software for ALL labs ────────────────────────────
INSERT IGNORE INTO `lab_software` (`lab_id`, `software_id`)
SELECT l.lab_id, s.software_id
FROM `laboratories` l
CROSS JOIN `software` s
WHERE s.software_name IN (
    'Microsoft Office 365', 'Google Chrome', 'Mozilla Firefox',
    'Notepad++', '7-Zip', 'Git'
);

-- ── Lab 519 — general programming lab ─────────────────────
INSERT IGNORE INTO `lab_software` (`lab_id`, `software_id`)
SELECT l.lab_id, s.software_id
FROM `laboratories` l, `software` s
WHERE l.lab_name = 'Lab 519'
  AND s.software_name IN (
      'Visual Studio Code', 'Python 3', 'Node.js', 'XAMPP', 'MySQL Workbench', 'Postman'
  );

-- ── Lab 524 — Java / enterprise lab ───────────────────────
INSERT IGNORE INTO `lab_software` (`lab_id`, `software_id`)
SELECT l.lab_id, s.software_id
FROM `laboratories` l, `software` s
WHERE l.lab_name = 'Lab 524'
  AND s.software_name IN (
      'Eclipse IDE', 'NetBeans', 'IntelliJ IDEA', 'MySQL Workbench', 'DBeaver'
  );

-- ── Lab 526 — full-stack / web lab ────────────────────────
INSERT IGNORE INTO `lab_software` (`lab_id`, `software_id`)
SELECT l.lab_id, s.software_id
FROM `laboratories` l, `software` s
WHERE l.lab_name = 'Lab 526'
  AND s.software_name IN (
      'Visual Studio Code', 'Node.js', 'XAMPP', 'MySQL Workbench', 'Postman', 'Python 3'
  );

-- ── Lab 528 — mobile & design lab ─────────────────────────
INSERT IGNORE INTO `lab_software` (`lab_id`, `software_id`)
SELECT l.lab_id, s.software_id
FROM `laboratories` l, `software` s
WHERE l.lab_name = 'Lab 528'
  AND s.software_name IN (
      'Android Studio', 'Figma', 'Adobe Photoshop', 'Visual Studio Code', 'VirtualBox'
  );

-- ── Lab 530 — maintenance (base set only) ─────────────────

-- ── Lab 542 — database & systems lab ──────────────────────
INSERT IGNORE INTO `lab_software` (`lab_id`, `software_id`)
SELECT l.lab_id, s.software_id
FROM `laboratories` l, `software` s
WHERE l.lab_name = 'Lab 542'
  AND s.software_name IN (
      'MySQL Workbench', 'DBeaver', 'XAMPP', 'VirtualBox', 'Python 3', 'Visual Studio Code'
  );

-- ── Sample sit-in history ─────────────────────────────────
INSERT IGNORE INTO `sit_in_sessions`
    (`id_number`, `name`, `purpose`, `lab`, `lab_id`, `pc_number`, `status`, `started_at`, `ended_at`)
VALUES
    ('2021-00001','Juan Dela Cruz',   'C Programming',       'Lab 519', 1, '3',  'ended',      NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 10 DAY + INTERVAL 90 MINUTE),
    ('2021-00001','Juan Dela Cruz',   'Web Development',     'Lab 526', 3, '7',  'ended',      NOW() - INTERVAL 7 DAY,  NOW() - INTERVAL 7 DAY  + INTERVAL 2 HOUR),
    ('2021-00001','Juan Dela Cruz',   'Java Programming',    'Lab 524', 2, '12', 'ended',      NOW() - INTERVAL 3 DAY,  NOW() - INTERVAL 3 DAY  + INTERVAL 75 MINUTE),
    ('2021-00001','Juan Dela Cruz',   'Database Management', 'Lab 542', 6, '5',  'ended',      NOW() - INTERVAL 1 DAY,  NOW() - INTERVAL 1 DAY  + INTERVAL 60 MINUTE),
    ('2021-00001','Juan Dela Cruz',   'Thesis / Research',   'Lab 519', 1, '8',  'in_session', NOW(),                   NULL),

    ('2021-00002','Maria Santos',     'Python Programming',  'Lab 519', 1, '15', 'ended',      NOW() - INTERVAL 8 DAY,  NOW() - INTERVAL 8 DAY  + INTERVAL 2 HOUR),
    ('2021-00002','Maria Santos',     'Web Development',     'Lab 526', 3, '2',  'ended',      NOW() - INTERVAL 5 DAY,  NOW() - INTERVAL 5 DAY  + INTERVAL 90 MINUTE),
    ('2021-00002','Maria Santos',     'Data Structures',     'Lab 524', 2, '9',  'ended',      NOW() - INTERVAL 2 DAY,  NOW() - INTERVAL 2 DAY  + INTERVAL 60 MINUTE),

    ('2022-00004','Ana Lim',          'Thesis / Research',   'Lab 542', 6, '1',  'ended',      NOW() - INTERVAL 6 DAY,  NOW() - INTERVAL 6 DAY  + INTERVAL 3 HOUR),
    ('2022-00004','Ana Lim',          'Database Management', 'Lab 542', 6, '4',  'ended',      NOW() - INTERVAL 4 DAY,  NOW() - INTERVAL 4 DAY  + INTERVAL 2 HOUR),

    ('2020-00007','Marco Villanueva', 'Web Development',     'Lab 526', 3, '20', 'ended',      NOW() - INTERVAL 9 DAY,  NOW() - INTERVAL 9 DAY  + INTERVAL 2 HOUR),
    ('2020-00007','Marco Villanueva', 'Java Programming',    'Lab 524', 2, '6',  'ended',      NOW() - INTERVAL 6 DAY,  NOW() - INTERVAL 6 DAY  + INTERVAL 90 MINUTE),

    ('2021-00008','Lea Fernandez',    'Python Programming',  'Lab 519', 1, '11', 'ended',      NOW() - INTERVAL 2 DAY,  NOW() - INTERVAL 2 DAY  + INTERVAL 60 MINUTE),

    ('2023-00006','Sofia Dela Torre', 'Web Development',     'Lab 526', 3, '14', 'ended',      NOW() - INTERVAL 3 DAY,  NOW() - INTERVAL 3 DAY  + INTERVAL 90 MINUTE);

-- Sync session counters from seeded history
UPDATE `users` u
SET
    u.`used_session` = (
        SELECT COUNT(*) FROM `sit_in_sessions` s
        WHERE BINARY s.`id_number` = BINARY u.`id_number`
          AND s.`status` = 'ended'
    ),
    u.`is_in_session` = (
        SELECT COUNT(*) FROM `sit_in_sessions` s
        WHERE BINARY s.`id_number` = BINARY u.`id_number`
          AND s.`status` = 'in_session'
    ) > 0,
    u.`remaining_sessions` = GREATEST(0, 30 - (
        SELECT COUNT(*) FROM `sit_in_sessions` s
        WHERE BINARY s.`id_number` = BINARY u.`id_number`
          AND s.`status` = 'ended'
    ))
WHERE u.`role` = 'student';

-- ── Sample testimonials ────────────────────────────────────
INSERT IGNORE INTO `testimonials`
    (`student_id`, `rating`, `category`, `comment`, `is_visible`)
VALUES
    ('2021-00001', 5, 'Service',    'The reservation system is super easy to use! I can book my lab slot in seconds.',                   1),
    ('2021-00002', 5, 'Facilities', 'Labs are well-maintained and the software covers everything I need for my subjects.',                1),
    ('2022-00004', 4, 'Service',    'Great system overall. Would love to see real-time seat availability updates.',                       1),
    ('2020-00007', 5, 'Experience', 'The sit-in monitoring system has made the lab experience much more organized and efficient.',        1),
    ('2021-00008', 4, 'Facilities', 'Clean and quiet labs. The monitoring system keeps things orderly. Highly recommend.',                1),
    ('2023-00006', 5, 'Service',    'Booking a lab seat is now effortless. The UI is modern and very intuitive.',                        1);

-- ── Announcements ─────────────────────────────────────────
INSERT IGNORE INTO `announcements`
    (`announcement_id`, `title`, `content`, `type`, `priority`, `author_name`, `target_role`, `is_active`)
VALUES
    (1,
     'Welcome to the CCS Computer Lab Monitoring System!',
     'Dear students, welcome to the new CCS Computer Sit-In Monitoring System. '
     'You can now reserve computer lab seats, track your remaining sessions, '
     'and view your sit-in history from this portal. '
     'Please observe proper lab etiquette at all times. '
     'Happy coding!',
     'general', 'high', 'CCS Administrator', 'all', 1),

    (2,
     'Lab 530 Scheduled Maintenance',
     'Lab 530 is temporarily unavailable for maintenance. '
     'Please use Labs 519, 524, 526, 528, or 542 for your sessions. '
     'We apologize for any inconvenience.',
     'maintenance', 'high', 'CCS Administrator', 'all', 1),

    (3,
     'Reminder: Lab Usage Rules',
     'All students are reminded to observe proper lab conduct: '
     '1) No food or drinks inside the laboratory. '
     '2) Log out of all accounts before leaving. '
     '3) Report any defective equipment to the lab administrator immediately. '
     '4) Sit-in sessions are limited to 30 sessions per semester.',
     'rules', 'medium', 'CCS Administrator', 'student', 1);

-- ============================================================
--  Done!
-- ============================================================
SELECT 'Database setup complete. Tables created and seed data inserted.' AS status;
