-- Run once on databases created before public portfolio selections were added.
ALTER TABLE assets
    ADD COLUMN is_showcase TINYINT(1) NOT NULL DEFAULT 0 AFTER file_size;

ALTER TABLE projects
    ADD COLUMN showcase_title VARCHAR(160) NOT NULL DEFAULT '' AFTER description,
    ADD COLUMN showcase_description TEXT NULL AFTER showcase_title;
clear
npm run dev
