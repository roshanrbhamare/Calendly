CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    timezone VARCHAR(100) DEFAULT 'UTC',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS event_types (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT COMMENT 'event description and instructions',
    duration INT NOT NULL COMMENT 'duration in minutes',
    slug VARCHAR(255) NOT NULL,
    buffer_before INT DEFAULT 0 COMMENT 'buffer before in minutes',
    buffer_after INT DEFAULT 0 COMMENT 'buffer after in minutes',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_slug (user_id, slug)
);

CREATE TABLE IF NOT EXISTS availabilities (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    day_of_week INT NOT NULL COMMENT '0-6 where 0 is Sunday',
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(36) PRIMARY KEY,
    event_type_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    booker_name VARCHAR(255) NOT NULL,
    booker_email VARCHAR(255) NOT NULL,
    start_time DATETIME NOT NULL COMMENT 'Stored in UTC',
    end_time DATETIME NOT NULL COMMENT 'Stored in UTC',
    status ENUM('SCHEDULED', 'CANCELED') DEFAULT 'SCHEDULED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_type_id) REFERENCES event_types(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_event_start (event_type_id, start_time)
);

-- Performance Indexes
CREATE INDEX idx_user_id ON event_types(user_id);
CREATE INDEX idx_availability_user_id ON availabilities(user_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_event_type ON bookings(event_type_id);
CREATE INDEX idx_bookings_start_time ON bookings(start_time);
