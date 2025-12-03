export interface PlayerTrack {
  id: string;
  title: string;
  artist?: string;
  videoId?: string;
  durationSeconds?: number;
}

export interface PlayerAlbum {
  id: string;
  title: string;
  cover?: string;
  artist?: string;
  tracks: PlayerTrack[];
}

export interface PlayerState {
  isExpanded: boolean;
  isPlaying: boolean;
  currentAlbumId?: string;
  currentTrackId?: string;
}

export const defaultPlayerState: PlayerState = {
  isExpanded: false,
  isPlaying: false,
};
