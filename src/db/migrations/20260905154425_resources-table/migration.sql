-- Custom SQL migration file, put your code below! --

CREATE SCHEMA IF NOT EXISTS core;
SET search_path TO core;

CREATE TABLE IF NOT EXISTS user_resource_limits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    runtime_hours INTERVAL NULL,
    max_memory INTEGER NULL,
    max_tasks INTEGER NOT NULL,
    max_projects INTEGER NULL
);