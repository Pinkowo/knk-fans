import { notionClient } from "@/lib/notion/client";
import { getFirstFileUrl, getRichTextValue, getTitleValue, sanitizeUrl } from "@/lib/notion/utils";
import type { Album, TrackSummary } from "@/types/music";
import type {
  NotionFilesProperty,
  NotionPage,
  NotionQueryResponse,
  NotionRichTextProperty,
  NotionTitleProperty,
  NotionUrlProperty,
} from "@/types/notion";

export const fallbackAlbums: Album[] = [
  {
    id: "album-awake",
    title: "Awake",
    releaseDate: "2016-06-02",
    cover: "https://upload.wikimedia.org/wikipedia/en/f/f9/KNK(%ED%81%AC%EB%82%98%ED%81%B0)-Awake_EP.jpg",
    description: "KNK 出道後第一張迷你專輯，由製作人 Kim Tae-joo 全權操刀，呈現既成熟又戲劇化的聲音敘事。",
    tracks: [
      { id: "track-gone", title: "Gone", duration: "1:45" },
      { id: "track-back-again", title: "Back Again", duration: "3:28", songId: "song-back-again" },
      { id: "track-i-remember", title: "I Remember", duration: "3:28" },
      { id: "track-day-night", title: "Day N Night", duration: "3:29" },
      { id: "track-angel-heart", title: "Angel Heart", duration: "3:28" },
    ],
  },
  {
    id: "album-gravity-completed",
    title: "Gravity, Completed",
    releaseDate: "2017-07-20",
    cover: "https://upload.wikimedia.org/wikipedia/en/7/73/KNK_-_Gravity%2C_Completed.jpg",
    description: "《Gravity》的再版 EP，以主打〈Rain〉延伸單戀與雨夜意象，並收錄粉絲最愛的〈Sun, Moon, Star〉。",
    tracks: [
      { id: "track-rain", title: "Rain", duration: "3:43" },
      { id: "track-think-about-you", title: "Think About You", duration: "3:33" },
      { id: "track-love-you", title: "Love You", duration: "3:12" },
      { id: "track-sun-moon-star", title: "Sun, Moon, Star", duration: "3:37", songId: "song-sun-moon-star" },
      { id: "track-good-night", title: "Good Night", duration: "2:30" },
    ],
  },
  {
    id: "album-airline",
    title: "KNK Airline",
    releaseDate: "2020-09-17",
    cover: "https://i.scdn.co/image/ab67616d0000b2732d0bbd10b473c6c14e2d26be",
    description: "以「搭乘專屬航空」為概念的 3.5 代迷你專輯，《Ride》與〈Highway〉體現團體成熟而都會的合成器音色。",
    tracks: [
      { id: "track-ride", title: "Ride", duration: "3:20" },
      { id: "track-what-do-you-think", title: "What Do You Think?", duration: "3:08" },
      { id: "track-highway", title: "Highway", duration: "3:14" },
      { id: "track-understand", title: "Understand", duration: "3:42" },
      { id: "track-ground", title: "Ground", duration: "3:41" },
    ],
  },
  {
    id: "album-lonely-night",
    title: "Lonely Night",
    releaseDate: "2019-01-07",
    cover: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    description: "KNK 加入 220 Entertainment 後的第一張單曲專輯，由成員親自參與作詞作曲，主打展現城市夜晚的孤寂。",
    tracks: [
      { id: "track-lonely-night", title: "Lonely Night", duration: "3:46", songId: "song-lonely-night" },
      { id: "track-day-by-day", title: "Day by Day", duration: "3:50" },
    ],
  },
  {
    id: "album-sunset",
    title: "KNK S/S Collection (Sunset)",
    releaseDate: "2019-07-15",
    cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80",
    description: "以夏夜霞光為靈感的單曲〈Sunset〉，由成員親自參與製作，搭配 cinematic MV 展現 KNK 成熟的城市感。",
    tracks: [
      { id: "track-sunset", title: "Sunset", duration: "3:20", songId: "song-sunset" },
      { id: "track-we-are-the-night", title: "We Are The Night", duration: "3:22" },
    ],
  },
];

interface AlbumProperties {
  Title: NotionTitleProperty;
  ReleaseDate?: NotionRichTextProperty;
  Cover?: NotionFilesProperty;
  Description?: NotionRichTextProperty;
  Tracks?: NotionRichTextProperty;
  Link?: NotionUrlProperty;
}

function mapTrackList(raw: string | undefined): TrackSummary[] {
  if (!raw) {
    return [];
  }

  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [title, duration] = line.split("|").map((part) => part.trim());
      return {
        id: `${title}-${index}`,
        title,
        duration,
      };
    });
}

function mapAlbum(page: NotionPage<AlbumProperties>): Album {
  const { properties } = page;
  return {
    id: page.id,
    title: getTitleValue(properties.Title),
    releaseDate: getRichTextValue(properties.ReleaseDate) || undefined,
    cover: getFirstFileUrl(properties.Cover) ?? sanitizeUrl(properties.Link?.url ?? undefined),
    description: getRichTextValue(properties.Description) || undefined,
    tracks: mapTrackList(getRichTextValue(properties.Tracks)),
  };
}

export async function fetchAlbums(): Promise<Album[]> {
  const databaseId = process.env.NOTION_ALBUMS_DATABASE_ID;
  if (!databaseId || !process.env.NOTION_API_KEY) {
    return fallbackAlbums;
  }

  try {
    const response = await notionClient.queryDatabase<NotionQueryResponse<AlbumProperties>>({
      database_id: databaseId,
      sorts: [{ property: "ReleaseDate", direction: "descending" }],
    });

    return response.results
      .map((page) => {
        try {
          return mapAlbum(page as NotionPage<AlbumProperties>);
        } catch (error) {
          console.warn("Failed to map album", error);
          return null;
        }
      })
      .filter((album): album is Album => Boolean(album));
  } catch (error) {
    console.error("Failed to fetch albums", error);
    return fallbackAlbums;
  }
}

export async function fetchSongIds(): Promise<string[]> {
  const albums = await fetchAlbums();
  const ids = albums
    .flatMap((album) => album.tracks)
    .map((track) => track.songId)
    .filter((id): id is string => Boolean(id));
  return ids.length ? ids : fallbackAlbums.flatMap((album) => album.tracks.map((track) => track.songId)).filter((id): id is string => Boolean(id));
}
