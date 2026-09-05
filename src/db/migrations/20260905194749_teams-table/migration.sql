-- Custom SQL migration file, put your code below! --

CREATE SCHEMA IF NOT EXISTS core;
SET search_path TO core;

CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,
    deactivated_at TIMESTAMP NULL,
    deactivated_by INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,
    state VARCHAR(10) NOT NULL CHECK (state IN ('ACTIVE', 'INACTIVE'))
);

INSERT INTO teams (uuid, name, description, state)
VALUES
    (gen_random_uuid(), 'FRT', 'Fiuba Racing Team', 'ACTIVE');

CREATE SCHEMA IF NOT EXISTS aud;
SET search_path TO aud;

CREATE TABLE IF NOT EXISTS teams_aud (
    id SERIAL PRIMARY KEY,
    operation VARCHAR(10) NOT NULL,
    team_id INTEGER NOT NULL,
    uuid UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER NULL,
    deactivated_at TIMESTAMP NULL,
    deactivated_by INTEGER NULL,
    state VARCHAR(10) NOT NULL
);

CREATE OR REPLACE FUNCTION aud.fn_audit_teams()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO aud.teams_aud (operation, team_id, uuid, name, description, created_at, created_by, updated_at, updated_by, deactivated_at, deactivated_by, state)
        VALUES ('INSERT', NEW.id, NEW.uuid, NEW.name, NEW.description, NEW.created_at, NEW.created_by, NEW.updated_at, NEW.updated_by, NEW.deactivated_at, NEW.deactivated_by, NEW.state);
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO aud.teams_aud (operation, team_id, uuid, name, description, created_at, created_by, updated_at, updated_by, deactivated_at, deactivated_by, state)
        VALUES ('UPDATE', NEW.id, NEW.uuid, NEW.name, NEW.description, NEW.created_at, NEW.created_by, NEW.updated_at, NEW.updated_by, NEW.deactivated_at, NEW.deactivated_by, NEW.state);
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO aud.teams_aud (operation, team_id, uuid, name, description, created_at, created_by, updated_at, updated_by, deactivated_at, deactivated_by, state)
        VALUES ('DELETE', OLD.id, OLD.uuid, OLD.name, OLD.description, OLD.created_at, OLD.created_by, OLD.updated_at, OLD.updated_by, OLD.deactivated_at, OLD.deactivated_by, OLD.state);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_teams
AFTER INSERT OR UPDATE OR DELETE ON core.teams
FOR EACH ROW EXECUTE FUNCTION aud.fn_audit_teams();