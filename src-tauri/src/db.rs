use diesel::result::Error as DieselError;
use std::error::Error;
use chrono::Utc;
use diesel::prelude::*;
use dotenvy::dotenv;
use std::env;

use std::path::Path;
use std::fs::File;
use symphonia::core::formats::FormatOptions;
use symphonia::core::io::MediaSourceStream;
use symphonia::core::meta::MetadataOptions;
use symphonia::core::probe::Hint;

use crate::models::{Beat, BeatCollection, NewBeat, NewBeatCollection, BeatChangeset};


pub fn establish_connection() -> SqliteConnection {
    dotenv().ok();

    let database_url = env::var("SQLITE_DATABASE_URL")
        .or_else(|_| env::var("DATABASE_URL"))
        .expect("DATABASE_URL must be set");
    SqliteConnection::establish(&database_url)
        .unwrap_or_else(|_| panic!("Error connecting to {}", database_url))
}

pub fn add_beat(
    conn: &mut SqliteConnection,
    title: &str,
    file_path: &str,
) -> Result<Beat, DieselError> {
    use crate::schema::beats;

    let calculated_duration: Option<i32> = get_duration_from_file_path(&file_path).ok();

    let new_beat = NewBeat {
        title,
        file_path,
        artist: None,
        album: None,
        genre: None,
        year: None,
        track_number: None,
        // get the duration from the file path
        duration: calculated_duration,
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

fn get_duration_from_file_path(file_path: &str) -> Result<i32, Box<dyn Error>> {
    // Create a media source from the file
    let file = File::open(Path::new(file_path))?;
    let mss = MediaSourceStream::new(Box::new(file), Default::default());

    // Create a hint to help the format registry guess the format of the file
    let hint = Hint::new();

    // Use default options for format and metadata
    let format_opts = FormatOptions::default();
    let metadata_opts = MetadataOptions::default();

    // Probe the media source to get the format
    let probed = symphonia::default::get_probe()
        .format(&hint, mss, &format_opts, &metadata_opts)?;

    // Get the format reader
    let format = probed.format;

    // Get the duration from the first track (assuming there's at least one track)
    if let Some(track) = format.tracks().first() {
        // Access the codec parameters to calculate duration
        let duration_ts = track.codec_params.n_frames
            .unwrap_or(0); // In frames (samples for audio)

        // Get the time base (units for time calculations)
        let time_base = track.codec_params.time_base.unwrap_or_default();

        // Calculate the duration in seconds using the time base
        let duration_secs = time_base.calc_time(duration_ts).seconds;

        Ok(duration_secs as i32)
    } else {
        Err("No tracks found in the media file.".into())
    }
}

pub fn delete_beat(conn: &mut SqliteConnection, id: i32) -> Result<(), DieselError> {
    use crate::schema::beats;
    diesel::delete(beats::table.find(id))
        .execute(conn)
        .map(|_| ())
}

pub fn update_beat(conn: &mut SqliteConnection, beat: BeatChangeset) -> Result<(), DieselError> {
    use crate::schema::beats::dsl::*;

    diesel::update(beats.find(beat.id))
        .set(&beat)
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
    date_created: Option<&str>,
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

pub fn add_beat_to_collection(
    conn: &mut SqliteConnection,
    collection_id: i32,
    beat_id: i32,
) -> Result<(), DieselError> {
    use crate::schema::set_beat;
    diesel::insert_into(set_beat::table)
        .values((
            set_beat::dsl::beat_id.eq(beat_id),
            set_beat::dsl::beat_collection_id.eq(collection_id),
        ))
        .execute(conn)
        .map(|_| ())
}

pub fn get_beat_collection(
    conn: &mut SqliteConnection,
    id: i32,
) -> Result<BeatCollection, diesel::result::Error> {
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

pub fn get_beats_in_collection(
    conn: &mut SqliteConnection,
    collection_id: i32,
) -> Result<Vec<Beat>, diesel::result::Error> {
    use crate::schema::beats;
    use crate::schema::set_beat;
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
