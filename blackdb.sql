-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               10.4.32-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.21.0.7344
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for fresh_drink
CREATE DATABASE IF NOT EXISTS `fresh_drink` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `fresh_drink`;

-- Dumping structure for table fresh_drink.alerts
CREATE TABLE IF NOT EXISTS `alerts` (
  `id` char(36) NOT NULL,
  `machine_id` varchar(64) NOT NULL,
  `title` varchar(255) NOT NULL,
  `severity` enum('critical','warning','normal') NOT NULL DEFAULT 'warning',
  `status` enum('new','in_progress','completed') NOT NULL DEFAULT 'new',
  `assigned_technician` varchar(160) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `is_unread` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_alerts_machine_created` (`machine_id`,`created_at`),
  KEY `idx_alerts_status` (`status`),
  CONSTRAINT `fk_alerts_machine` FOREIGN KEY (`machine_id`) REFERENCES `machines` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table fresh_drink.app_users
CREATE TABLE IF NOT EXISTS `app_users` (
  `id` char(36) NOT NULL,
  `google_sub` varchar(255) NOT NULL,
  `email` varchar(320) NOT NULL,
  `name` varchar(160) NOT NULL,
  `picture` text DEFAULT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_login_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `google_sub` (`google_sub`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table fresh_drink.dispense_records
CREATE TABLE IF NOT EXISTS `dispense_records` (
  `id` char(36) NOT NULL,
  `machine_id` varchar(64) NOT NULL,
  `user_key` varchar(64) NOT NULL,
  `requested_ml` smallint(5) unsigned NOT NULL,
  `status` enum('requested','completed','failed') NOT NULL DEFAULT 'requested',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_dispense_machine_status_created` (`machine_id`,`status`,`created_at`),
  KEY `idx_dispense_user_created` (`user_key`,`created_at`),
  CONSTRAINT `fk_dispense_machine` FOREIGN KEY (`machine_id`) REFERENCES `machines` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table fresh_drink.flush_records
CREATE TABLE IF NOT EXISTS `flush_records` (
  `id` char(36) NOT NULL,
  `machine_id` varchar(64) NOT NULL,
  `trigger_type` varchar(120) NOT NULL DEFAULT 'admin',
  `status` enum('requested','success','failed') NOT NULL DEFAULT 'requested',
  `requested_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_flush_machine_requested` (`machine_id`,`requested_at`),
  CONSTRAINT `fk_flush_machine` FOREIGN KEY (`machine_id`) REFERENCES `machines` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table fresh_drink.machines
CREATE TABLE IF NOT EXISTS `machines` (
  `id` varchar(64) NOT NULL,
  `name` varchar(120) NOT NULL,
  `location` varchar(255) NOT NULL DEFAULT '',
  `filter_percent` decimal(5,2) NOT NULL DEFAULT 100.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table fresh_drink.maintenance_logs
CREATE TABLE IF NOT EXISTS `maintenance_logs` (
  `id` char(36) NOT NULL,
  `machine_id` varchar(64) NOT NULL,
  `technician` varchar(160) NOT NULL,
  `notes` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_maintenance_machine_created` (`machine_id`,`created_at`),
  CONSTRAINT `fk_maintenance_machine` FOREIGN KEY (`machine_id`) REFERENCES `machines` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table fresh_drink.telemetry
CREATE TABLE IF NOT EXISTS `telemetry` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `machine_id` varchar(64) NOT NULL,
  `pressure_bar` decimal(7,3) NOT NULL,
  `purity_percent` decimal(5,2) NOT NULL,
  `water_liters` decimal(10,2) DEFAULT NULL,
  `recorded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_telemetry_machine_recorded` (`machine_id`,`recorded_at`),
  CONSTRAINT `fk_telemetry_machine` FOREIGN KEY (`machine_id`) REFERENCES `machines` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table fresh_drink.user_notification_reads
CREATE TABLE IF NOT EXISTS `user_notification_reads` (
  `user_key` varchar(64) NOT NULL,
  `notification_id` char(36) NOT NULL,
  `read_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`user_key`,`notification_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
