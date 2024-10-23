-- Your SQL goes here

DROP TABLE IF EXISTS beats;

CREATE TABLE beats (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    title VARCHAR NOT NULL,
    artist VARCHAR,
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
    bpm DOUBLE,
    musical_key VARCHAR,
    date_created DATETIME NOT NULL DEFAULT current_timestamp
);