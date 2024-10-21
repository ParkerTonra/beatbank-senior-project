use diesel::result::Error as DieselError;

use diesel::prelude::*;
use dotenvy::dotenv;
use std::{env, error::Error};
use chrono::Utc;


use crate::models::{Beat, NewBeat, BeatCollection, NewBeatCollection};

pub fn establish_connection() -> Result<SqliteConnection, Box<dyn Error>> {
    // Load environment variables from .env file if present
    dotenv().ok();

    // Get the database URL from the environment
    let database_url = env::var("SQLITE_DATABASE_URL")
        .or_else(|_| env::var("DATABASE_URL"))
        .map_err(|e| format!("DATABASE_URL must be set: {}", e))?;

    // Establish the database connection
    let conn = SqliteConnection::establish(&database_url)
        .map_err(|e| format!("Error connecting to {}: {}", database_url, e))?;

    Ok(conn)
}

pub fn add_beat(conn: &mut SqliteConnection, title: &str, file_path: &str) -> Result<Beat, DieselError> {
    use crate::schema::beats;

    let new_beat = NewBeat {
        title,
        file_path,
        artist: None,
        album: None,
        genre: None,
        year: None,
        track_number: None,
        duration: None,
        composer: None,
        lyricist: None,
        cover_art: None,
        comments: None,
        bpm: None,
        musical_key: None,
        date_created: &Utc::now().naive_utc().to_string()
    };

    diesel::insert_into(beats::table)
        .values(&new_beat)
        .returning(Beat::as_returning())
        .get_result(conn)
}

pub fn delete_beat(conn: &mut SqliteConnection, id: i32) -> Result<(), DieselError> {
    use crate::schema::beats;
    diesel::delete(beats::table.find(id))
        .execute(conn)
        .map(|_| ())
}

pub fn new_beat_collection(
    conn: &mut SqliteConnection,
    set_name: &str,
    venue: Option<&str>,
    city: Option<&str>,
    state_name: Option<&str>,
    date_played: Option<&str>,
    date_created: Option<&str>
) -> Result<BeatCollection, DieselError> {
    use crate::schema::beat_collection;

    let new_beat_collection = NewBeatCollection {
        set_name,
        venue,
        city,
        state_name,
        date_played,
        date_created,
    };

    diesel::insert_into(beat_collection::table)
        .values(&new_beat_collection)
        .returning(BeatCollection::as_returning())
        .get_result(conn)
}

pub fn delete_beat_collection(conn: &mut SqliteConnection, id: i32) -> Result<(), DieselError> {
    use crate::schema::beat_collection;
    diesel::delete(beat_collection::table.find(id))
        .execute(conn)
        .map(|_| ())
}


// pub fn get_all_beats(conn: &mut SqliteConnection) -> QueryResult<Vec<Beat>> {
//     use crate::schema::beats;
//     beats::table.load::<Beat>(conn)
// }