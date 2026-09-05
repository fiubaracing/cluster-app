-- Custom SQL migration file, put your code below! --

CREATE SCHEMA IF NOT EXISTS core;
SET search_path TO core;

-- Without audit fields because this table is intended to be modified only with migrations and not by users
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE
);

INSERT INTO roles (name, description)
VALUES
    ('ADMIN', 'Administrator role with full access'),
    ('MANAGER', 'Role for managing teams and users'),
    ('GUEST', 'Cluster guest user with limited access'),
    ('FRT', 'Default access for every fiuba racing team member');
