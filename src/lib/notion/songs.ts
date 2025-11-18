import { notionClient } from "@/lib/notion/client";
import { getRichTextValue, getTitleValue, sanitizeUrl } from "@/lib/notion/utils";
import type { LyricsContent, SongDetail } from "@/types/music";
import type {
  NotionPage,
  NotionRichTextProperty,
  NotionSelectProperty,
  NotionTitleProperty,
  NotionUrlProperty,
} from "@/types/notion";

const fallbackSongs: Record<string, SongDetail> = {
  "song-back": {
    id: "song-back",
    title: "Back Again",
    videoUrl: "https://www.youtube.com/watch?v=djV11Xbc914",
    videoPlatform: "youtube",
    album: "AWAKE",
    description: "強勁節奏與爆發副歌，是入坑 KNK 的經典舞曲。",
    lyrics: {
      ko: ["다시 한번", "돌아갈 수 있을까"],
      zh: ["是否還能再次回到過去"],
    },
  },
};

interface SongProperties {
  Title: NotionTitleProperty;
  Album?: NotionSelectProperty;
  Description?: NotionRichTextProperty;
  "Lyrics (ko)"?: NotionRichTextProperty;
  "Lyrics (zh)"?: NotionRichTextProperty;
  "Lyrics (ja)"?: NotionRichTextProperty;
  "Lyrics (en)"?: NotionRichTextProperty;
  Video?: NotionUrlProperty;
}

function mapLyricsValue(property?: NotionRichTextProperty): string[] | undefined {
  const value = getRichTextValue(property);
  return value ? value.split("\n").map((line) => line.trim()).filter(Boolean) : undefined;
}

function mapSong(page: NotionPage<SongProperties>): SongDetail {
  const { properties } = page;
  const videoUrl = sanitizeUrl(properties.Video?.url ?? undefined);

  const lyrics: LyricsContent = {
    ko: mapLyricsValue(properties["Lyrics (ko)"]) ?? [],
    zh: mapLyricsValue(properties["Lyrics (zh)"]),
    ja: mapLyricsValue(properties["Lyrics (ja)"]),
    en: mapLyricsValue(properties["Lyrics (en)"]),
  };

  return {
    id: page.id,
    title: getTitleValue(properties.Title),
    album: properties.Album?.select?.name,
    description: getRichTextValue(properties.Description) || undefined,
    videoUrl,
    videoPlatform: videoUrl?.includes("youtube") ? "youtube" : "spotify",
    lyrics,
  };
}

export async function fetchSongById(id: string): Promise<SongDetail | null> {
  const databaseId = process.env.NOTION_SONGS_DATABASE_ID;
  if (!databaseId || !process.env.NOTION_API_KEY) {
    return fallbackSongs[id] ?? null;
  }

  try {
    const response = await notionClient.queryDatabase({
      database_id: databaseId,
      filter: {
        property: "Slug",
        rich_text: { equals: id },
      },
    });

    if (response.results.length === 0) {
      return fallbackSongs[id] ?? null;
    }

    return mapSong(response.results[0] as NotionPage<SongProperties>);
  } catch (error) {
    console.error("Failed to fetch song", error);
    return fallbackSongs[id] ?? null;
  }
}
