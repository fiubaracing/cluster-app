-- Custom SQL migration file, put your code below! --

CREATE SCHEMA IF NOT EXISTS core;
SET search_path TO core;

CREATE TABLE IF NOT EXISTS user_roles (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    state VARCHAR(10) NOT NULL CHECK (state IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,
    deactivated_at TIMESTAMP NULL,
    deactivated_by INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,
    PRIMARY KEY (user_id, role_id)
);

INSERT INTO user_roles (user_id, role_id, state)
VALUES
    ((SELECT id FROM users WHERE email = 'admin@cluster.com'), (SELECT id FROM roles WHERE name = 'ADMIN'), 'ACTIVE');

CREATE SCHEMA IF NOT EXISTS aud;
SET search_path TO aud;

CREATE TABLE IF NOT EXISTS user_roles_aud (
    id SERIAL PRIMARY KEY,
    operation VARCHAR(10) NOT NULL,
    user_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    state VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER NULL,
    deactivated_at TIMESTAMP NULL,
    deactivated_by INTEGER NULL
);

CREATE OR REPLACE FUNCTION aud.fn_audit_user_roles()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO aud.user_roles_aud (operation, user_id, role_id, state, created_at, created_by, updated_at, updated_by, deactivated_at, deactivated_by)
        VALUES ('INSERT', NEW.user_id, NEW.role_id, NEW.state, NEW.created_at, NEW.created_by, NEW.updated_at, NEW.updated_by, NEW.deactivated_at, NEW.deactivated_by);
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO aud.user_roles_aud (operation, user_id, role_id, state, created_at, created_by, updated_at, updated_by, deactivated_at, deactivated_by)
        VALUES ('UPDATE', NEW.user_id, NEW.role_id, NEW.state, NEW.created_at, NEW.created_by, NEW.updated_at, NEW.updated_by, NEW.deactivated_at, NEW.deactivated_by);
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO aud.user_roles_aud (operation, user_id, role_id, state, created_at, created_by, updated_at, updated_by, deactivated_at, deactivated_by)
        VALUES ('DELETE', OLD.user_id, OLD.role_id, OLD.state, OLD.created_at, OLD.created_by, OLD.updated_at, OLD.updated_by, OLD.deactivated_at, OLD.deactivated_by);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_user_roles
AFTER INSERT OR UPDATE OR DELETE ON core.user_roles
FOR EACH ROW EXECUTE FUNCTION aud.fn_audit_user_roles();