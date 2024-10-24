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
            beats::dsl::row_order,
        ))
        .load::<Beat>(conn)
}

pub fn save_row_order(conn: &mut SqliteConnection, row_number: Vec<crate::models::RowOrder>) -> Result<(), DieselError> {
    use crate::schema::beats::dsl::*;
    
    for row in row_number {
        diesel::update(beats.find(row.row_id)) // Find the beat with the given ID
            .set(row_order.eq(row.row_number))
            .execute(conn)?;
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::RowOrder;
    use diesel::result::Error as DieselError;
    use diesel::connection::SimpleConnection;

    // Helper function to setup an in-memory test database
    fn setup_test_db() -> SqliteConnection {
        let mut conn = SqliteConnection::establish(":memory:").unwrap();
        
        // Run your migrations to set up the schema
        conn.batch_execute("
            CREATE TABLE beats (
                id INTEGER PRIMARY KEY NOT NULL,
                title VARCHAR NOT NULL,
                file_path VARCHAR NOT NULL,
                artist VARCHAR,
                album VARCHAR,
                genre VARCHAR,
                year INTEGER,
                track_number INTEGER,
                duration INTEGER,
                composer VARCHAR,
                lyricist VARCHAR,
                cover_art VARCHAR,
                comments VARCHAR,
                bpm DOUBLE,
                musical_key VARCHAR,
                date_created TIMESTAMP NOT NULL,
                row_order INTEGER NOT NULL DEFAULT 0
            );
        ").unwrap();
        
        conn
    }

    #[test]
    fn test_save_row_order_success() {
        let mut conn = setup_test_db();

        // First, let's add some test beats to work with
        let beat1 = add_beat(&mut conn, "Test Beat 1", "path/to/file1").unwrap();
        let beat2 = add_beat(&mut conn, "Test Beat 2", "path/to/file2").unwrap();
        let beat3 = add_beat(&mut conn, "Test Beat 3", "path/to/file3").unwrap();

        // Create our row orders
        let row_orders = vec![
            RowOrder { row_id: beat1.id, row_number: 3 },
            RowOrder { row_id: beat2.id, row_number: 1 },
            RowOrder { row_id: beat3.id, row_number: 2 },
        ];

        // Test saving the row orders
        let result = save_row_order(&mut conn, row_orders);
        assert!(result.is_ok());

        // Verify the orders were saved correctly
        use crate::schema::beats::dsl::*;
        let saved_beats: Vec<(i32, i32)> = beats
            .select((id, row_order))
            .order_by(id.asc())
            .load::<(i32, i32)>(&mut conn)
            .unwrap();

        assert_eq!(saved_beats[0].1, 3); // First beat should have order 3
        assert_eq!(saved_beats[1].1, 1); // Second beat should have order 1
        assert_eq!(saved_beats[2].1, 2); // Third beat should have order 2
    }

    #[test]
    fn test_save_row_order_invalid_id() {
        let mut conn = setup_test_db();
        
        // Add one valid beat so we have a real ID to work with
        let beat1 = add_beat(&mut conn, "Test Beat 1", "path/to/file1").unwrap();

        // Try to save a row order for a non-existent beat
        let row_orders = vec![
            RowOrder { row_id: 999999, row_number: 1 }, // Non-existent ID
        ];

        let result = save_row_order(&mut conn, row_orders);
        assert!(result.is_err());
    }

    #[test]
    fn test_save_row_order_empty_vec() {
        let mut conn = setup_test_db();

        // Test with empty vector
        let result = save_row_order(&mut conn, vec![]);
        assert!(result.is_ok());
    }
}