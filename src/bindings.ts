// TODO: update to new schema
export type Beat = {
    id: number;
    title: string;
    artist?: string;
    album?: string;
    genre?: string;
    year?: number;
    track_number?: number;
    duration?: number;
    composer?: string;
    lyricist?: string;
    cover_art?: string;
    comments?: string;
    file_path: string;
    bpm?: number | undefined;
    musical_key?: string;
  };

export type BeatSet = {
  id: number
  setName: string;
}

  export type ColumnVis = {
    id: boolean;
    title: boolean;
    bpm: boolean;
    key: boolean;
    duration: boolean;
    artist: boolean;
    date_added: boolean;
    file_path: boolean;
};

export type EditThisBeat = {
  id: number;
  title: string;
  bpm?: number; 
  musical_key?: string;
  duration?: number;
  artist?: string;
}