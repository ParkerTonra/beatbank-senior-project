-- Your SQL goes here

DROP TABLE beats;

CREATE TABLE beats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR NOT NULL,
    artist VARCHAR NOT NULL,
    album VARCHAR,
    genre VARCHAR,
    year INTEGER,
    track_number INTEGER,
    duration INTEGER,
    composer VARCHAR,
    lyricist VARCHAR,
    cover_art VARCHAR,
    comments TEXT,
    file_path VARCHAR NOT NULL,
    bpm INTEGER,
    musical_key VARCHAR
);
