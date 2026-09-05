-- Custom SQL migration file, put your code below! --

CREATE SCHEMA IF NOT EXISTS core;
SET search_path TO core;

-- Without audit fields because this table is intended to be modified only with migrations and not by users
CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

INSERT INTO permissions (name, description)
VALUES
    ('GLOBAL_READ', 'Global permission to read data'),
    ('GLOBAL_ADD', 'Global permission to add data'),
    ('GLOBAL_EDIT', 'Global permission to edit data'),
    ('GLOBAL_DELETE', 'Global permission to delete data'),
    ('OWN_READ', 'Permission to read own data'),
    ('OWN_ADD', 'Permission to add own data'),
    ('OWN_EDIT', 'Permission to edit own data'),
    ('OWN_DELETE', 'Permission to delete own data'),
    ('TEAM_READ', 'Permission to read team data'),
    ('TEAM_ADD', 'Permission to add team data'),
    ('TEAM_EDIT', 'Permission to edit team data'),
    ('TEAM_DELETE', 'Permission to delete team data');