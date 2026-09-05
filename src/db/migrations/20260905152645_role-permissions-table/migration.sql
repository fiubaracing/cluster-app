-- Custom SQL migration file, put your code below! --

CREATE SCHEMA IF NOT EXISTS core;
SET search_path TO core;

-- Without audit fields because this table is intended to be modified only with migrations and not by users
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id, module_id)
);

INSERT INTO role_permissions (role_id, permission_id, module_id)
VALUES
    ((SELECT id FROM roles WHERE name = 'ADMIN'), (SELECT id FROM permissions WHERE name = 'GLOBAL_READ'), (SELECT id FROM modules WHERE name = 'USERS')),
    ((SELECT id FROM roles WHERE name = 'ADMIN'), (SELECT id FROM permissions WHERE name = 'GLOBAL_ADD'), (SELECT id FROM modules WHERE name = 'USERS')),
    ((SELECT id FROM roles WHERE name = 'ADMIN'), (SELECT id FROM permissions WHERE name = 'GLOBAL_EDIT'), (SELECT id FROM modules WHERE name = 'USERS')),
    ((SELECT id FROM roles WHERE name = 'ADMIN'), (SELECT id FROM permissions WHERE name = 'GLOBAL_DELETE'), (SELECT id FROM modules WHERE name = 'USERS')),
    ((SELECT id FROM roles WHERE name = 'ADMIN'), (SELECT id FROM permissions WHERE name = 'GLOBAL_READ'), (SELECT id FROM modules WHERE name = 'TEAMS')),
    ((SELECT id FROM roles WHERE name = 'ADMIN'), (SELECT id FROM permissions WHERE name = 'GLOBAL_ADD'), (SELECT id FROM modules WHERE name = 'TEAMS')),
    ((SELECT id FROM roles WHERE name = 'ADMIN'), (SELECT id FROM permissions WHERE name = 'GLOBAL_EDIT'), (SELECT id FROM modules WHERE name = 'TEAMS')),
    ((SELECT id FROM roles WHERE name = 'ADMIN'), (SELECT id FROM permissions WHERE name = 'GLOBAL_DELETE'), (SELECT id FROM modules WHERE name = 'TEAMS')),
    ((SELECT id FROM roles WHERE name = 'ADMIN'), (SELECT id FROM permissions WHERE name = 'GLOBAL_READ'), (SELECT id FROM modules WHERE name = 'HELYX')),
    ((SELECT id FROM roles WHERE name = 'ADMIN'), (SELECT id FROM permissions WHERE name = 'GLOBAL_ADD'), (SELECT id FROM modules WHERE name = 'HELYX')),
    ((SELECT id FROM roles WHERE name = 'ADMIN'), (SELECT id FROM permissions WHERE name = 'GLOBAL_EDIT'), (SELECT id FROM modules WHERE name = 'HELYX')),
    ((SELECT id FROM roles WHERE name = 'ADMIN'), (SELECT id FROM permissions WHERE name = 'GLOBAL_DELETE'), (SELECT id FROM modules WHERE name = 'HELYX')),

    ((SELECT id FROM roles WHERE name = 'MANAGER'), (SELECT id FROM permissions WHERE name = 'TEAM_READ'), (SELECT id FROM modules WHERE name = 'USERS')),
    ((SELECT id FROM roles WHERE name = 'MANAGER'), (SELECT id FROM permissions WHERE name = 'TEAM_ADD'), (SELECT id FROM modules WHERE name = 'USERS')),
    ((SELECT id FROM roles WHERE name = 'MANAGER'), (SELECT id FROM permissions WHERE name = 'TEAM_EDIT'), (SELECT id FROM modules WHERE name = 'USERS')),
    ((SELECT id FROM roles WHERE name = 'MANAGER'), (SELECT id FROM permissions WHERE name = 'TEAM_DELETE'), (SELECT id FROM modules WHERE name = 'USERS')),
    ((SELECT id FROM roles WHERE name = 'MANAGER'), (SELECT id FROM permissions WHERE name = 'OWN_READ'), (SELECT id FROM modules WHERE name = 'USERS')),
    ((SELECT id FROM roles WHERE name = 'MANAGER'), (SELECT id FROM permissions WHERE name = 'OWN_ADD'), (SELECT id FROM modules WHERE name = 'USERS')),
    ((SELECT id FROM roles WHERE name = 'MANAGER'), (SELECT id FROM permissions WHERE name = 'OWN_EDIT'), (SELECT id FROM modules WHERE name = 'USERS')),
    ((SELECT id FROM roles WHERE name = 'MANAGER'), (SELECT id FROM permissions WHERE name = 'OWN_DELETE'), (SELECT id FROM modules WHERE name = 'USERS')),
    ((SELECT id FROM roles WHERE name = 'MANAGER'), (SELECT id FROM permissions WHERE name = 'TEAM_READ'), (SELECT id FROM modules WHERE name = 'TEAMS')),
    ((SELECT id FROM roles WHERE name = 'MANAGER'), (SELECT id FROM permissions WHERE name = 'TEAM_ADD'), (SELECT id FROM modules WHERE name = 'TEAMS')),
    ((SELECT id FROM roles WHERE name = 'MANAGER'), (SELECT id FROM permissions WHERE name = 'TEAM_EDIT'), (SELECT id FROM modules WHERE name = 'TEAMS')),
    ((SELECT id FROM roles WHERE name = 'MANAGER'), (SELECT id FROM permissions WHERE name = 'TEAM_DELETE'), (SELECT id FROM modules WHERE name = 'TEAMS')),
    ((SELECT id FROM roles WHERE name = 'MANAGER'), (SELECT id FROM permissions WHERE name = 'OWN_READ'), (SELECT id FROM modules WHERE name = 'TEAMS')),
    ((SELECT id FROM roles WHERE name = 'MANAGER'), (SELECT id FROM permissions WHERE name = 'OWN_ADD'), (SELECT id FROM modules WHERE name = 'TEAMS')),
    ((SELECT id FROM roles WHERE name = 'MANAGER'), (SELECT id FROM permissions WHERE name = 'OWN_EDIT'), (SELECT id FROM modules WHERE name = 'TEAMS')),
    ((SELECT id FROM roles WHERE name = 'MANAGER'), (SELECT id FROM permissions WHERE name = 'OWN_DELETE'), (SELECT id FROM modules WHERE name = 'TEAMS')),

    ((SELECT id FROM roles WHERE name = 'GUEST'), (SELECT id FROM permissions WHERE name = 'OWN_READ'), (SELECT id FROM modules WHERE name = 'USERS')),
    ((SELECT id FROM roles WHERE name = 'GUEST'), (SELECT id FROM permissions WHERE name = 'TEAM_READ'), (SELECT id FROM modules WHERE name = 'USERS')),
    ((SELECT id FROM roles WHERE name = 'GUEST'), (SELECT id FROM permissions WHERE name = 'TEAM_READ'), (SELECT id FROM modules WHERE name = 'TEAMS')),
    -- No project modules at the time. We will start with the helyx module which is a FRT's sponsor and guests should not access.
    
    ((SELECT id FROM roles WHERE name = 'FRT'), (SELECT id FROM permissions WHERE name = 'TEAM_READ'), (SELECT id FROM modules WHERE name = 'USERS')),
    ((SELECT id FROM roles WHERE name = 'FRT'), (SELECT id FROM permissions WHERE name = 'TEAM_READ'), (SELECT id FROM modules WHERE name = 'TEAMS')),
    ((SELECT id FROM roles WHERE name = 'FRT'), (SELECT id FROM permissions WHERE name = 'TEAM_READ'), (SELECT id FROM modules WHERE name = 'HELYX')),
    ((SELECT id FROM roles WHERE name = 'FRT'), (SELECT id FROM permissions WHERE name = 'OWN_READ'), (SELECT id FROM modules WHERE name = 'HELYX')),
    ((SELECT id FROM roles WHERE name = 'FRT'), (SELECT id FROM permissions WHERE name = 'OWN_ADD'), (SELECT id FROM modules WHERE name = 'HELYX')),
    ((SELECT id FROM roles WHERE name = 'FRT'), (SELECT id FROM permissions WHERE name = 'OWN_EDIT'), (SELECT id FROM modules WHERE name = 'HELYX')),
    ((SELECT id FROM roles WHERE name = 'FRT'), (SELECT id FROM permissions WHERE name = 'OWN_DELETE'), (SELECT id FROM modules WHERE name = 'HELYX'));