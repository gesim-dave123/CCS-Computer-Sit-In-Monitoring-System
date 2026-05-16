-- ============================================================
-- Feature Expansion Migration
-- Safe to run multiple times (uses IF NOT EXISTS).
-- ============================================================

-- 1. Laboratories registry
CREATE TABLE IF NOT EXISTS laboratories (
    lab_id       INT UNSIGNED NOT NULL AUTO_INCREMENT,
    lab_name     VARCHAR(100) NOT NULL,
    room_number  VARCHAR(50)  NULL,
    description  TEXT         NULL,
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (lab_id),
    UNIQUE KEY uq_lab_name (lab_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Global software catalog
CREATE TABLE IF NOT EXISTS software (
    software_id   INT UNSIGNED NOT NULL AUTO_INCREMENT,
    software_name VARCHAR(100) NOT NULL,
    category      VARCHAR(50)  NULL,
    icon_url      VARCHAR(255) NULL,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (software_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Many-to-many pivot: laboratories <-> software
CREATE TABLE IF NOT EXISTS lab_software (
    lab_id      INT UNSIGNED NOT NULL,
    software_id INT UNSIGNED NOT NULL,
    PRIMARY KEY (lab_id, software_id),
    FOREIGN KEY (lab_id)      REFERENCES laboratories(lab_id)  ON DELETE CASCADE,
    FOREIGN KEY (software_id) REFERENCES software(software_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Student testimonials / feedback
CREATE TABLE IF NOT EXISTS testimonials (
    testimonial_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    student_id     VARCHAR(50)  NOT NULL,
    rating         TINYINT      NOT NULL,
    category       VARCHAR(50)  NULL,
    comment        TEXT         NOT NULL,
    is_visible     TINYINT(1)   NOT NULL DEFAULT 1,
    is_deleted     TINYINT(1)   NOT NULL DEFAULT 0,
    created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (testimonial_id),
    KEY idx_testimonials_student (student_id),
    KEY idx_testimonials_visible (is_visible, is_deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Seed: auto-import lab names from existing sit_in_sessions
-- ============================================================
INSERT IGNORE INTO laboratories (lab_name, room_number)
SELECT DISTINCT lab, lab
FROM sit_in_sessions
WHERE lab IS NOT NULL AND TRIM(lab) <> '';
