CREATE TABLE users (
	idusers INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(45) NOT NULL,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    role ENUM('ADMIN','VOLUNTEER','FAMILY','DRIVER') NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    password_reset_token VARCHAR(128) DEFAULT NULL,
    password_reset_expires DATETIME DEFAULT NULL,
    is_confirmed TINYINT(1) DEFAULT '0',
    confirmation_token VARCHAR(255) DEFAULT NULL,
    token_version int NOT NULL DEFAULT '0'
);

CREATE TABLE `refresh_tokens` (
  idtokens int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  idusers int NOT NULL,
  token_hash varchar(128) NOT NULL,
  expires_at datetime NOT NULL,
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, 
  FOREIGN KEY (idusers) REFERENCES users (idusers) ON DELETE CASCADE
);

CREATE TABLE families (
	idfamilies INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    idusers INT NOT NULL,
    status varchar(20) NOT NULL DEFAULT 'pending',
    form_data JSON,
    FOREIGN KEY (idusers) REFERENCES users(idusers) ON DELETE CASCADE
);

CREATE TABLE volunteers (
	idvolunteers INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    idusers INT NOT NULL,
    availability VARCHAR(50),
    FOREIGN KEY (idusers) REFERENCES users(idusers) ON DELETE CASCADE
);

CREATE TABLE events (
	idevents INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    location VARCHAR(255),
    event_date DATETIME NOT NULL,
    departed_at TIMESTAMP,
    started_at TIMESTAMP,
    qr_token VARCHAR(255) UNIQUE NOT NULL,
    created_by INT NOT NULL,
    FOREIGN KEY (created_by) REFERENCES users(idusers)
);

CREATE TABLE attendance (
	idattendance INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    idevents INT NOT NULL,
    idusers INT NOT NULL,
    check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('PRESENT', 'DUPLICATE_ATTEMPT') DEFAULT 'PRESENT',
    FOREIGN KEY (idevents) REFERENCES events(idevents),
    FOREIGN KEY (idusers) REFERENCES users(idusers)
);

CREATE TABLE media_files(
	idfiles INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    idusers INT NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_type ENUM('ID_PHOTO', 'ADDRESS_PHOTO') NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idusers) REFERENCES users(idusers) ON DELETE CASCADE
);

CREATE TABLE invites (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  role ENUM('ADMIN','VOLUNTEER','FAMILY','DRIVER') NOT NULL DEFAULT 'ADMIN',
  token VARCHAR(128) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  invited_by INT DEFAULT NULL,
  used BOOLEAN NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invited_by) REFERENCES users(idusers) ON DELETE SET NULL
);

CREATE INDEX idx_users_password_reset_token ON users (password_reset_token);

INSERT INTO users (email, password, username, role, is_confirmed)
values ('registroapp@bdalimentos.org', '$2b$12$3zKSsoESqiNDY90BJy4qo.MA1u12dnoj2Yy50U6budE6jMlujHckW', 'Main Admin', 'ADMIN', 1);

SELECT * FROM users;