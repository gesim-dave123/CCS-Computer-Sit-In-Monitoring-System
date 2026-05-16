-- Reservations table for CCS Computer Sit-In Monitoring System
-- Run once to add reservation functionality.
-- Safe to run on an existing database.

CREATE TABLE IF NOT EXISTS reservations (
    reservation_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_number      VARCHAR(50)  NOT NULL,
    student_name   VARCHAR(255) NOT NULL,
    lab            VARCHAR(100) NOT NULL,
    seat_number    INT UNSIGNED NOT NULL,
    purpose        VARCHAR(255) NOT NULL,
    reserved_date  DATE         NOT NULL,
    time_slot      VARCHAR(50)  NOT NULL,
    status         VARCHAR(20)  NOT NULL DEFAULT 'pending',
    created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (reservation_id),
    KEY idx_res_id_number (id_number),
    KEY idx_res_lab_date  (lab, reserved_date),
    KEY idx_res_status    (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Unique constraint: one student per seat per lab per date per time_slot
-- (prevents double-booking the same seat)
ALTER TABLE reservations
    ADD UNIQUE INDEX IF NOT EXISTS uq_res_seat_slot (lab, seat_number, reserved_date, time_slot);
