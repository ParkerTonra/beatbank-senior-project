/*
Schemas!
Schemas define the structure of the database tables. This includes table names, attribute names, and data types.
Diesel uses schemas to generate SQL queries and map models to tables.
*/

table! {
    beats (id) {
        id -> Int4,
        title -> Varchar,
        artist -> Varchar,
        album -> Varchar,
        genre -> Varchar,
        year -> Int4,
        track_number -> Int4,
        duration -> Int4,
        composer -> Varchar,
        lyricist -> Varchar,
        cover_art -> Varchar,
        comments -> Text,
        file_path -> Varchar,
    }
}


