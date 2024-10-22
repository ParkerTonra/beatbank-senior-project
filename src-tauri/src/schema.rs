// @generated automatically by Diesel CLI.

diesel::table! {
    beat_collection (id) {
        id -> Integer,
        set_name -> Text,
        venue -> Nullable<Text>,
        city -> Nullable<Text>,
        state_name -> Nullable<Text>,
        date_played -> Nullable<Timestamp>,
        date_created -> Timestamp,
    }
}

diesel::table! {
    beats (id) {
        id -> Integer,
        title -> Text,
        artist -> Nullable<Text>,
        album -> Nullable<Text>,
        genre -> Nullable<Text>,
        year -> Nullable<Integer>,
        track_number -> Nullable<Integer>,
        duration -> Nullable<Integer>,
        composer -> Nullable<Text>,
        lyricist -> Nullable<Text>,
        cover_art -> Nullable<Text>,
        comments -> Nullable<Text>,
        file_path -> Text,
        bpm -> Nullable<Double>,
        musical_key -> Nullable<Text>,
        date_created -> Timestamp,
    }
}

diesel::table! {
    set_beat (beat_collection_id, beat_id) {
        beat_collection_id -> Integer,
        beat_id -> Integer,
    }
}

diesel::joinable!(set_beat -> beat_collection (beat_collection_id));
diesel::joinable!(set_beat -> beats (beat_id));

diesel::allow_tables_to_appear_in_same_query!(
    beat_collection,
    beats,
    set_beat,
);
