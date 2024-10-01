-- Your SQL goes here

CREATE TABLE beat_collection (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    title VARCHAR NOT NULL,
    set_name VARCHAR NOT NULL,
    venue VARCHAR,
    city VARCHAR,
    state_name VARCHAR,
    date_played DATETIME,
    date_created DATETIME DEFAULT current_timestamp
);

CREATE TABLE set_beat (
    beat_collection_id INTEGER NOT NULL,
    beat_id INTEGER NOT NULL,
    PRIMARY KEY (beat_collection_id, beat_id),
    FOREIGN KEY (beat_collection_id) REFERENCES beat_collection(id),
    FOREIGN KEY (beat_id) REFERENCES beats(id)
);
