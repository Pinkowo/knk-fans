import { notionClient } from "@/lib/notion/client";
import { getRichTextValue, getTitleValue, sanitizeUrl } from "@/lib/notion/utils";
import type { LyricsContent, SongDetail } from "@/types/music";
import type {
  NotionPage,
  NotionQueryResponse,
  NotionRichTextProperty,
  NotionSelectProperty,
  NotionTitleProperty,
  NotionUrlProperty,
} from "@/types/notion";

const fallbackSongs: Record<string, SongDetail> = {
  "song-back-again": {
    id: "song-back-again",
    title: "Back Again",
    videoUrl: "https://www.youtube.com/watch?v=tp34Lfv3OLc",
    videoPlatform: "youtube",
    album: "Awake",
    description: "以 EDM Drop 與厚實鼓點傳達「再一次回到你身邊」的決心，象徵 KNK 的正式出道。",
    lyrics: {
      ko: ["다시 한 번, 처음의 설렘으로 돌아가고 싶어", "멈춘 시계를 네게로 다시 돌려 놓을게"],
      en: [
        "Once again I rewind every second back to the first night we met.",
        "Even if time stopped, I'll drag the hands of the clock until you answer me.",
      ],
    },
  },
  "song-sun-moon-star": {
    id: "song-sun-moon-star",
    title: "Sun, Moon, Star",
    videoUrl: "https://www.youtube.com/watch?v=VtqT-rRQj2A",
    videoPlatform: "youtube",
    album: "Gravity",
    description: "以宇宙意象比喻無法忘懷的戀人，合成器鋪陳與高音副歌是 KNK 垂直式和聲的代表作。",
    lyrics: {
      ko: ["해와 달 그 사이에 남겨진 건 너의 기억뿐", "끝이 없는 우주라도 난 너를 찾아 헤맬 거야"],
      en: [
        "Only your memories are left between the sun and the moon.",
        "Even in an endless universe I wander until your light finds me again.",
      ],
    },
  },
  "song-sunset": {
    id: "song-sunset",
    title: "Sunset",
    videoUrl: "https://www.youtube.com/watch?v=R9mW6In2-FY",
    videoPlatform: "youtube",
    album: "KNK S/S Collection",
    description: "由成員主導的都會節奏歌曲，將日落前的橘紅天空寫成復古合成器與 City Pop 氛圍。",
    lyrics: {
      ko: ["저물어가는 노을 속에 우리 추억이 번져가", "마지막 한 줄기 빛도 너로 물들어 가는데"],
      en: [
        "Our memories bleed into the fading sunset.",
        "Even the final streak of light is tinted with your name.",
      ],
    },
  },
  "song-lonely-night": {
    id: "song-lonely-night",
    title: "Lonely Night",
    videoUrl: "https://www.youtube.com/watch?v=0EM-L3koV5o",
    videoPlatform: "youtube",
    album: "Lonely Night",
    description: "KNK 轉入 220 Entertainment 後的第一首自作曲，將空無一人的夜街聲響與心跳對比。",
    lyrics: {
      ko: ["조용한 새벽에 혼자 걷는 이 길 끝에서", "너의 이름만 입안에 맴돌다 사라져"],
      en: [
        "On this quiet dawn road I walk alone until it disappears.",
        "Only your name circles inside my mouth before it fades away.",
      ],
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
    const response = await notionClient.queryDatabase<NotionQueryResponse<SongProperties>>({
      database_id: databaseId,
      filter: {
        property: "Slug",
        rich_text: { equals: id },
      },
    });

    if (response.results.length === 0) {
      return fallbackSongs[id] ?? null;
    }

    return mapSong(response.results[0]);
  } catch (error) {
    console.error("Failed to fetch song", error);
    return fallbackSongs[id] ?? null;
  }
}
