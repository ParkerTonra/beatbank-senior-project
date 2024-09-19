// @generated automatically by Diesel CLI.

diesel::table! {
    tracks (id) {
        id -> Nullable<Integer>,
        title -> Text,
        artist -> Text,
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
    }
}
