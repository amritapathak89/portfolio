-- Schema for the portfolio contact form.
-- Run once against your MySQL database:
--   mysql -u <user> -p <database> < backend/db/schema.sql

CREATE TABLE IF NOT EXISTS contact_form (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(254) NOT NULL,
  company VARCHAR(150) DEFAULT NULL,
  phone VARCHAR(30) DEFAULT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
