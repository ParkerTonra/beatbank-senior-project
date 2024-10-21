-- migrations/2024-10-21_add_cascade_delete/up.sql
PRAGMA foreign_keys = ON;

-- First drop the existing set_beat table
DROP TABLE IF EXISTS set_beat;

-- Recreate set_beat table with ON DELETE CASCADE
CREATE TABLE set_beat (
    beat_collection_id INTEGER NOT NULL,
    beat_id INTEGER NOT NULL,
    PRIMARY KEY (beat_collection_id, beat_id),
    FOREIGN KEY (beat_collection_id) 
        REFERENCES beat_collection(id) 
        ON DELETE CASCADE,
    FOREIGN KEY (beat_id) 
        REFERENCES beats(id) 
        ON DELETE CASCADE
);