export interface Track {
  id: string;
  title: string;
  artist?: string;
  videoId?: string;
}

export interface PlayerState {
  isOpen: boolean;
  isPlaying: boolean;
  queue: Track[];
  currentIndex: number;
}

export const defaultPlayerState: PlayerState = {
  isOpen: false,
  isPlaying: false,
  queue: [],
  currentIndex: 0,
};
