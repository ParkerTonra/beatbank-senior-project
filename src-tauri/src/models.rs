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

use diesel::prelude::*;
use serde::Serialize;
use crate::schema::beats;
use chrono::NaiveDateTime;

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
    pub bpm: Option<i32>,
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
    pub bpm: Option<i32>,
    pub musical_key: Option<&'a str>,
    pub date_created: &'a NaiveDateTime,
}


#[derive(Queryable, Selectable, Serialize)]
#[diesel(table_name = crate::schema::beat_collection)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct BeatCollection {
    pub id: i32,
    pub set_name: String,
    pub venue: Option<String>,
    pub city: Option<String>,
    pub state_name: Option<String>,
    pub date: Option<NaiveDateTime>,
    pub date_created: NaiveDateTime,
}

#[derive(Insertable)]
#[diesel(table_name = beat_collection)]
pub struct NewBeatCollection<'a> {
    pub set_name: &'a str,
    pub venue: Option<&'a str>,
    pub city: Option<&'a str>,
    pub state_name: Option<&'a str>,
    pub date: Option<&'a NaiveDateTime>,
    pub date_created: &'a NaiveDateTime,
}



#[derive(Queryable, Selectable, Serialize)]
#[diesel(table_name = crate::schema::set_beat)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct SetBeat {
    pub id: i32,
    pub set_id: i32,
    pub beat_id: i32,
}

#[derive(Insertable)]
#[diesel(table_name = set_beat)]
pub struct NewSetBeat<'a> {
    pub set_id: #'a i32,
    pub beat_id: #'a i32,
}


diesel::joinable!(setbeat -> beats (beat_id));
diesel::joinable!(setbeat -> beat_collection (set_id));

diesel::allow_tables_to_appear_in_same_query!(
    set_beat,
    beats,
    beat_collection,
);