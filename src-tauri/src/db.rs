use diesel::result::Error as DieselError;

use diesel::prelude::*;
use dotenvy::dotenv;
use std::env;
use chrono::Utc;


use crate::models::{Beat, BeatCollection, NewBeat, NewBeatCollection};

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
        date_created: Utc::now().naive_utc(),
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

pub fn add_beat_to_collection(conn: &mut SqliteConnection, collection_id: i32, beat_id: i32) -> Result<(), DieselError> {
    use crate::schema::set_beat;
    diesel::insert_into(set_beat::table)
        .values((set_beat::dsl::beat_id.eq(beat_id), set_beat::dsl::beat_collection_id.eq(collection_id)))
        .execute(conn)
        .map(|_| ())
}

pub fn get_beat_collection(conn: &mut SqliteConnection, id: i32) -> Result<BeatCollection, diesel::result::Error> {
    use crate::schema::beat_collection;
    beat_collection::table
        .filter(beat_collection::dsl::id.eq(id))
        .select((
            beat_collection::dsl::id,
            beat_collection::dsl::set_name,
            beat_collection::dsl::venue,
            beat_collection::dsl::city,
            beat_collection::dsl::state_name,
            beat_collection::dsl::date_played,
            beat_collection::dsl::date_created,
        ))
        .first::<BeatCollection>(conn)
}

pub fn get_beats_in_collection(conn: &mut SqliteConnection, collection_id: i32) -> Result<Vec<Beat>, diesel::result::Error> {
    use crate::schema::set_beat;
    use crate::schema::beats;
    set_beat::table
        .filter(set_beat::dsl::beat_collection_id.eq(collection_id))
        .inner_join(beats::table)
        .select((
            beats::dsl::id,
            beats::dsl::title,
            beats::dsl::artist.nullable(),
            beats::dsl::album.nullable(),
            beats::dsl::genre.nullable(),
            beats::dsl::year.nullable(),
            beats::dsl::track_number.nullable(),
            beats::dsl::duration.nullable(),
            beats::dsl::composer.nullable(),
            beats::dsl::lyricist.nullable(),
            beats::dsl::cover_art.nullable(),
            beats::dsl::comments.nullable(),
            beats::dsl::file_path,
            beats::dsl::bpm.nullable(),
            beats::dsl::musical_key.nullable(),
            beats::dsl::date_created,
        ))
        .load::<Beat>(conn)
}

// pub fn get_all_beats(conn: &mut SqliteConnection) -> QueryResult<Vec<Beat>> {
//     use crate::schema::beats;
//     beats::table.load::<Beat>(conn)
// }