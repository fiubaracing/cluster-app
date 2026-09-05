-- Custom SQL migration file, put your code below! --

CREATE SCHEMA IF NOT EXISTS core;
SET search_path TO core;

-- Without audit fields because this table is intended to be modified only with migrations and not by users
CREATE TABLE IF NOT EXISTS modules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

INSERT INTO modules (name, description)
VALUES
    ('USERS', 'Module for managing users and their roles'),
    ('TEAMS', 'Module for managing teams and their members'),
    ('HELYX', 'Module for managing helyx projects and their resources');