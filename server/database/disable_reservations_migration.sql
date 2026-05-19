ALTER TABLE `laboratories` ADD COLUMN `status` ENUM('active', 'maintenance') NOT NULL DEFAULT 'active' AFTER `building`;

CREATE TABLE IF NOT EXISTS `disabled_terminals` (
    `lab_id` INT UNSIGNED NOT NULL,
    `seat_number` INT UNSIGNED NOT NULL,
    `reason` VARCHAR(255) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`lab_id`, `seat_number`),
    FOREIGN KEY (`lab_id`) REFERENCES `laboratories`(`lab_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
