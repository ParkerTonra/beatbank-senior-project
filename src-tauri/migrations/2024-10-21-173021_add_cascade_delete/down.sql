-- This file should undo anything in `up.sql`
-- migrations/2024-10-21_add_cascade_delete/down.sql
PRAGMA foreign_keys = ON;

-- Drop the cascading table
DROP TABLE IF EXISTS set_beat;

-- Recreate original table without cascade
CREATE TABLE set_beat (
    beat_collection_id INTEGER NOT NULL,
    beat_id INTEGER NOT NULL,
    PRIMARY KEY (beat_collection_id, beat_id),
    FOREIGN KEY (beat_collection_id) REFERENCES beat_collection(id),
    FOREIGN KEY (beat_id) REFERENCES beats(id)
);