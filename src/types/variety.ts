export interface Episode {
  id: string;
  title: string;
  episodeNumber?: number;
  videoId?: string;
  description?: string;
}

export interface VarietySeries {
  id: string;
  name: string;
  description?: string;
  cover?: string;
  episodes: Episode[];
}
