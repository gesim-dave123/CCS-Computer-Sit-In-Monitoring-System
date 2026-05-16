-- ============================================================
-- Database Normalization Migration
-- Safe to re-run (uses IF NOT EXISTS / conditional ALTER).
-- BACK UP YOUR DATABASE BEFORE RUNNING.
-- ============================================================

-- ── Step 1: Extend laboratories table with seats & building ──

SET @sql = (SELECT IF(
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'laboratories' AND column_name = 'seats'),
    'SELECT 1',
    'ALTER TABLE laboratories ADD COLUMN seats INT UNSIGNED NOT NULL DEFAULT 30'
)); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'laboratories' AND column_name = 'building'),
    'SELECT 1',
    'ALTER TABLE laboratories ADD COLUMN building VARCHAR(100) NULL DEFAULT ''CCS Building'''
)); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Seed the 6 standard labs if they don't exist yet
INSERT IGNORE INTO laboratories (lab_name, room_number, seats, building) VALUES
    ('Lab 519', '519', 30, 'CCS Building'),
    ('Lab 524', '524', 30, 'CCS Building'),
    ('Lab 526', '526', 40, 'CCS Building'),
    ('Lab 528', '528', 40, 'CCS Building'),
    ('Lab 530', '530', 30, 'CCS Building'),
    ('Lab 542', '542', 35, 'CCS Building');

-- Update existing rows that may have been seeded without seats/building
UPDATE laboratories SET seats = 30, building = 'CCS Building' WHERE lab_name = 'Lab 519' AND (seats IS NULL OR seats = 0 OR seats = 30);
UPDATE laboratories SET seats = 30, building = 'CCS Building' WHERE lab_name = 'Lab 524' AND (seats IS NULL OR seats = 0 OR seats = 30);
UPDATE laboratories SET seats = 40, building = 'CCS Building' WHERE lab_name = 'Lab 526' AND (seats IS NULL OR seats = 0);
UPDATE laboratories SET seats = 40, building = 'CCS Building' WHERE lab_name = 'Lab 528' AND (seats IS NULL OR seats = 0);
UPDATE laboratories SET seats = 30, building = 'CCS Building' WHERE lab_name = 'Lab 530' AND (seats IS NULL OR seats = 0 OR seats = 30);
UPDATE laboratories SET seats = 35, building = 'CCS Building' WHERE lab_name = 'Lab 542' AND (seats IS NULL OR seats = 0);

-- ── Step 2: Add lab_id FK to sit_in_sessions ──

SET @sql = (SELECT IF(
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'sit_in_sessions' AND column_name = 'lab_id'),
    'SELECT 1',
    'ALTER TABLE sit_in_sessions ADD COLUMN lab_id INT UNSIGNED NULL AFTER lab'
)); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Backfill lab_id from text lab column
UPDATE sit_in_sessions s
JOIN laboratories l ON s.lab = l.lab_name
SET s.lab_id = l.lab_id
WHERE s.lab_id IS NULL;

-- Also try matching by room number for any that didn't match
UPDATE sit_in_sessions s
JOIN laboratories l ON s.lab = l.room_number
SET s.lab_id = l.lab_id
WHERE s.lab_id IS NULL;

-- Add index on lab_id
SET @sql = (SELECT IF(
    EXISTS (SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'sit_in_sessions' AND column_name = 'lab_id'),
    'SELECT 1',
    'ALTER TABLE sit_in_sessions ADD INDEX idx_sit_in_lab_id (lab_id)'
)); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ── Step 3: Add lab_id FK to reservations ──

SET @sql = (SELECT IF(
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'reservations' AND column_name = 'lab_id'),
    'SELECT 1',
    'ALTER TABLE reservations ADD COLUMN lab_id INT UNSIGNED NULL AFTER lab'
)); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Backfill lab_id from text lab column
UPDATE reservations r
JOIN laboratories l ON r.lab = l.lab_name
SET r.lab_id = l.lab_id
WHERE r.lab_id IS NULL;

UPDATE reservations r
JOIN laboratories l ON r.lab = l.room_number
SET r.lab_id = l.lab_id
WHERE r.lab_id IS NULL;

-- Add index on lab_id
SET @sql = (SELECT IF(
    EXISTS (SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'reservations' AND column_name = 'lab_id'),
    'SELECT 1',
    'ALTER TABLE reservations ADD INDEX idx_res_lab_id (lab_id)'
)); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
