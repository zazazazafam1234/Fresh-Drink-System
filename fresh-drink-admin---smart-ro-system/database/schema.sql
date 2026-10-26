CREATE DATABASE IF NOT EXISTS fresh_drink
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE fresh_drink;

CREATE TABLE IF NOT EXISTS machines (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  location VARCHAR(255) NOT NULL DEFAULT '',
  filter_percent DECIMAL(5,2) NOT NULL DEFAULT 100,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alerts (
  id CHAR(36) PRIMARY KEY,
  machine_id VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  severity ENUM('critical','warning','normal') NOT NULL DEFAULT 'warning',
  status ENUM('new','in_progress','completed') NOT NULL DEFAULT 'new',
  assigned_technician VARCHAR(160) NULL,
  notes TEXT NULL,
  is_unread BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_alerts_machine_created (machine_id, created_at),
  INDEX idx_alerts_status (status),
  CONSTRAINT fk_alerts_machine FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS maintenance_logs (
  id CHAR(36) PRIMARY KEY,
  machine_id VARCHAR(64) NOT NULL,
  technician VARCHAR(160) NOT NULL,
  notes TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_maintenance_machine_created (machine_id, created_at),
  CONSTRAINT fk_maintenance_machine FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS flush_records (
  id CHAR(36) PRIMARY KEY,
  machine_id VARCHAR(64) NOT NULL,
  trigger_type VARCHAR(120) NOT NULL DEFAULT 'admin',
  status ENUM('requested','success','failed') NOT NULL DEFAULT 'requested',
  requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  INDEX idx_flush_machine_requested (machine_id, requested_at),
  CONSTRAINT fk_flush_machine FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS telemetry (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  machine_id VARCHAR(64) NOT NULL,
  pressure_bar DECIMAL(7,3) NOT NULL,
  purity_percent DECIMAL(5,2) NOT NULL,
  water_liters DECIMAL(10,2) NULL,
  recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_telemetry_machine_recorded (machine_id, recorded_at),
  CONSTRAINT fk_telemetry_machine FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS dispense_records (
  id CHAR(36) PRIMARY KEY,
  machine_id VARCHAR(64) NOT NULL,
  user_key VARCHAR(64) NOT NULL,
  requested_ml SMALLINT UNSIGNED NOT NULL,
  status ENUM('requested','completed','failed') NOT NULL DEFAULT 'requested',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  INDEX idx_dispense_machine_status_created (machine_id, status, created_at),
  INDEX idx_dispense_user_created (user_key, created_at),
  CONSTRAINT fk_dispense_machine FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_notification_reads (
  user_key VARCHAR(64) NOT NULL,
  notification_id CHAR(36) NOT NULL,
  read_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_key, notification_id)
);

CREATE TABLE IF NOT EXISTS app_users (
  id CHAR(36) PRIMARY KEY,
  google_sub VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(320) NOT NULL UNIQUE,
  name VARCHAR(160) NOT NULL,
  picture TEXT NULL,
  role ENUM('user','admin') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
