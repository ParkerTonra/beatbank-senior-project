use diesel::result::Error as DieselError;

use diesel::prelude::*;
use dotenvy::dotenv;
use std::env;


use crate::models::{Beat, NewBeat};

pub fn establish_connection() -> SqliteConnection {
    dotenv().ok();

    let database_url = env::var("SQLITE_DATABASE_URL")
        .or_else(|_| env::var("DATABASE_URL"))
        .expect("DATABASE_URL must be set");
    SqliteConnection::establish(&database_url)
        .unwrap_or_else(|_| panic!("Error connecting to {}", database_url))
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


// pub fn get_all_beats(conn: &mut SqliteConnection) -> QueryResult<Vec<Beat>> {
//     use crate::schema::beats;
//     beats::table.load::<Beat>(conn)
// }