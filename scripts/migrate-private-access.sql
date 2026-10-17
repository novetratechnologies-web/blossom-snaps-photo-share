-- Run once on existing installations to support gallery access code rotation.
ALTER TABLE projects
    ADD COLUMN access_code_version INT UNSIGNED NOT NULL DEFAULT 1;
