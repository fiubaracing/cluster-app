-- Custom SQL migration file, put your code below! --

CREATE SCHEMA IF NOT EXISTS core;
SET search_path TO core;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    state VARCHAR(10) NOT NULL CHECK (state IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,
    deactivated_at TIMESTAMP NULL,
    deactivated_by INTEGER NULL REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO users (uuid, email, name, state) 
VALUES (gen_random_uuid(), 'admin@cluster.com', 'Admin User', 'ACTIVE');

CREATE SCHEMA IF NOT EXISTS aud;
SET search_path TO aud;

CREATE TABLE IF NOT EXISTS users_aud (
    id SERIAL PRIMARY KEY,
    operation VARCHAR(10) NOT NULL,
    uuid UUID NOT NULL,
    user_id INTEGER NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    state VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER NULL,
    deactivated_at TIMESTAMP NULL,
    deactivated_by INTEGER NULL
);

CREATE OR REPLACE FUNCTION aud.fn_audit_users()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO aud.users_aud (operation, user_id, uuid, email, name, state, created_at, created_by, updated_at, updated_by, deactivated_at, deactivated_by)
        VALUES ('INSERT', NEW.id, NEW.uuid, NEW.email, NEW.name, NEW.state, NEW.created_at, NEW.created_by, NEW.updated_at, NEW.updated_by, NEW.deactivated_at, NEW.deactivated_by);
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO aud.users_aud (operation, user_id, uuid, email, name, state, created_at, created_by, updated_at, updated_by, deactivated_at, deactivated_by)
        VALUES ('UPDATE', NEW.id, NEW.uuid, NEW.email, NEW.name, NEW.state, NEW.created_at, NEW.created_by, NEW.updated_at, NEW.updated_by, NEW.deactivated_at, NEW.deactivated_by);
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO aud.users_aud (operation, user_id, uuid, email, name, state, created_at, created_by, updated_at, updated_by, deactivated_at, deactivated_by)
        VALUES ('DELETE', OLD.id, OLD.uuid, OLD.email, OLD.name, OLD.state, OLD.created_at, OLD.created_by, OLD.updated_at, OLD.updated_by, OLD.deactivated_at, OLD.deactivated_by);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_users
AFTER INSERT OR UPDATE OR DELETE ON core.users
FOR EACH ROW EXECUTE FUNCTION aud.fn_audit_users();