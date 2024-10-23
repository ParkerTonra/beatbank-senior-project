-- migrations/2024-10-21_add_cascade_delete/up.sql
PRAGMA foreign_keys = ON;

-- Create new table with desired structure
CREATE TABLE set_beat_new (
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

-- Copy data from old table to new table
INSERT INTO set_beat_new 
SELECT beat_collection_id, beat_id 
FROM set_beat;

-- Drop old table
DROP TABLE set_beat;

-- Rename new table to original name
ALTER TABLE set_beat_new RENAME TO set_beat;