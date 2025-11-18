import { notionClient } from "@/lib/notion/client";
import { getFirstFileUrl, getRichTextValue, getTitleValue, sanitizeUrl } from "@/lib/notion/utils";
import type { Album, TrackSummary } from "@/types/music";
import type {
  NotionFilesProperty,
  NotionPage,
  NotionRichTextProperty,
  NotionTitleProperty,
  NotionUrlProperty,
} from "@/types/notion";

const fallbackAlbums: Album[] = [
  {
    id: "album-awaken",
    title: "AWAKE",
    releaseDate: "2016-05-25",
    cover: "https://images.unsplash.com/photo-1511376777868-611b54f68947?auto=format&fit=crop&w=700&q=80",
    description: "KNK 的首張迷你專輯，主打歌《Back Again》展現強烈聲線。",
    tracks: [
      { id: "track-back", title: "Back Again", duration: "3:42", songId: "song-back" },
      { id: "track-gone", title: "Gone", duration: "4:10", songId: "song-gone" },
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
    const response = await notionClient.queryDatabase({
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
