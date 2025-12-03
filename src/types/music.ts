export interface TrackSummary {
  id: string;
  title: string;
  duration?: string;
  songId?: string;
}

export interface Album {
  id: string;
  title: string;
  releaseDate?: string;
  cover?: string;
  description?: string;
  tracks: TrackSummary[];
}

export interface LyricsContent {
  ko: string[];
  zh?: string[];
  ja?: string[];
  en?: string[];
  romanization?: string[];
  phonetic?: string[];
}

export interface SongDetail {
  id: string;
  slug?: string;
  title: string;
  videoUrl?: string;
  videoPlatform?: "youtube" | "spotify";
  album?: string;
  description?: string;
  lyrics: LyricsContent;
}
