CREATE TABLE users (
	idusers INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(45) NOT NULL,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    role ENUM('ADMIN','VOLUNTEER','FAMILY','DRIVER') NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    is_confirmed TINYINT(1) DEFAULT '0',
    confirmation_token VARCHAR(255) DEFAULT NULL
);

CREATE TABLE user_profiles(
	iduser_profiles INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    idusers INT NOT NULL, 
    full_name VARCHAR(100) NOT NULL,
    FOREIGN KEY (idusers) REFERENCES users(idusers) ON DELETE CASCADE
);

CREATE TABLE families (
	idfamilies INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    idusers INT NOT NULL,
    household_size INT,
    notes TEXT,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
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

INSERT INTO users (email, password, username, role)
values ('A01635782@tec.mx', '$2a$12$ix3oROFt.RQHrQCqVIRUr.KlepovKbr7Tm4rZUwq9HaEub50kCgyi', 'Diego Vargas', 'ADMIN');

SELECT * FROM users;