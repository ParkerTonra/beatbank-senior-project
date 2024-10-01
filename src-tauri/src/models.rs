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
}
