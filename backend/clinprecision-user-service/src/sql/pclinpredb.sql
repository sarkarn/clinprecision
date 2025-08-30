CREATE USER 'clinprecadmin'@'localhost' IDENTIFIED BY 'passw0rd';
CREATE DATABASE clinprecisiondb;
GRANT ALL PRIVILEGES ON clinprecisiondb.* TO 'clinprecadmin'@'localhost';
USE clinprecisiondb;

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    user_id VARCHAR(255) NOT NULL UNIQUE,
    encrypted_password VARCHAR(255) NOT NULL UNIQUE
);


CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) NOT NULL
);

CREATE TABLE authorities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) NOT NULL
);

CREATE TABLE roles_authorities (
    roles_id BIGINT NOT NULL,
    authorities_id BIGINT NOT NULL,
    PRIMARY KEY (roles_id, authorities_id),
    FOREIGN KEY (roles_id) REFERENCES roles(id),
    FOREIGN KEY (authorities_id) REFERENCES authorities(id)
);

CREATE TABLE users_roles (
    users_id BIGINT NOT NULL,
    roles_id BIGINT NOT NULL,
    PRIMARY KEY (users_id, roles_id),
    FOREIGN KEY (users_id) REFERENCES users(id),
    FOREIGN KEY (roles_id) REFERENCES roles(id)
);
