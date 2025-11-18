export type GuideCategory = "song" | "stage" | "variety";

export interface RecommendedItem {
  id: string;
  title: string;
  description: string;
  link?: string;
  thumbnail?: string;
  category: GuideCategory;
  tags: string[];
}

export interface GroupCharm {
  id: string;
  title: string;
  description: string;
  icon?: string;
  category: string;
}

export interface GuideData {
  songs: RecommendedItem[];
  shows: RecommendedItem[];
  charms: GroupCharm[];
}
