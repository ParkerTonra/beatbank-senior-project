/*---------------------------------------------------
|\      /|
| \    / |
|  \  /  |
|   \/   | odels

Place Rust structs that map to a database table here.
Structs here will enable Diesel ORM to make efficient database operations.

Note: To create the database with current schema, models, and migrations,
use the following command in terminal: diesel migration run
-----------------------------------------------------*/

use chrono::NaiveDateTime;
use diesel::prelude::*;

#[derive(Queryable, Selectable, Debug)]
#[diesel(table_name = crate::schema::beats)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
#[derive(serde::Serialize)]
pub struct Beat {
    pub id: i32,
    pub title: String,
    pub artist: Option<String>,
    pub album: Option<String>,
    pub genre: Option<String>,
    pub year: Option<i32>,
    pub track_number: Option<i32>,
    pub duration: Option<i32>,
    pub composer: Option<String>,
    pub lyricist: Option<String>,
    pub cover_art: Option<String>,
    pub comments: Option<String>,
    pub file_path: String,
    pub bpm: Option<f64>,
    pub musical_key: Option<String>,
    pub date_created: NaiveDateTime,
}

#[derive(Insertable)]
#[diesel(table_name = crate::schema::beats)]
pub struct NewBeat<'a> {
    pub title: &'a str,
    pub artist: Option<&'a str>,
    pub album: Option<&'a str>,
    pub genre: Option<&'a str>,
    pub year: Option<i32>,
    pub track_number: Option<i32>,
    pub duration: Option<i32>,
    pub composer: Option<&'a str>,
    pub lyricist: Option<&'a str>,
    pub cover_art: Option<&'a str>,
    pub comments: Option<&'a str>,
    pub file_path: &'a str,
    pub bpm: Option<f64>,
    pub musical_key: Option<&'a str>,
    pub date_created: &'a str,
}

#[derive(Queryable, Selectable, Debug)]
#[diesel(table_name = crate::schema::beat_collection)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
#[derive(serde::Serialize)]
pub struct BeatCollection {
    pub id: i32,
    pub set_name: String,
    pub venue: Option<String>,
    pub city: Option<String>,
    pub state_name: Option<String>,
    pub date_played: Option<String>,
    pub date_created: NaiveDateTime,
}

#[derive(Insertable)]
#[diesel(table_name = crate::schema::beat_collection)]
pub struct NewBeatCollection<'a> {
    pub set_name: &'a str,
    pub venue: Option<&'a str>,
    pub city: Option<&'a str>,
    pub state_name: Option<&'a str>,
    pub date_played: Option<&'a str>,
    pub date_created: Option<&'a str>,
}


