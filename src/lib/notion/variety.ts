import { notionClient } from "@/lib/notion/client";
import { getFirstFileUrl, getRichTextValue, getTitleValue, sanitizeUrl } from "@/lib/notion/utils";
import type {
  NotionFilesProperty,
  NotionPage,
  NotionQueryResponse,
  NotionRichTextProperty,
  NotionTitleProperty,
  NotionUrlProperty,
} from "@/types/notion";
import type { Episode, VarietySeries } from "@/types/variety";

const fallbackSeries: VarietySeries[] = [
  {
    id: "weekly-idol-2017",
    name: "Weekly Idol EP.297",
    description: "2017 年《Sun, Moon, Star》回歸期到 Weekly Idol 的經典集數，隊長 Jihun 還臨時改編 Random Play Dance 以符合長腿隊形。",
    cover: "https://i.ytimg.com/vi/ylFw1rMjD0I/hqdefault.jpg",
    episodes: [
      {
        id: "weekly-idol-rpd",
        title: "Random Play Dance & Limbo Mission",
        episodeNumber: 297,
        videoId: "ylFw1rMjD0I",
        description: "包含招牌 RPD 與搞笑的 90 度鞠躬懲罰，充分展現 KNK 的團魂。",
      },
    ],
  },
  {
    id: "idol-room-sunset",
    name: "Idol Room",
    description: "宣傳《Sunset》時出演 JTBC《Idol Room》，除了 Talk 之外也重現舞台走位與 1 秒 Ending Fairy 挑戰。",
    cover: "https://i.ytimg.com/vi/8zwvxPucE7Q/hqdefault.jpg",
    episodes: [
      {
        id: "idol-room-choreo",
        title: "Sunset Promotion Clip",
        videoId: "8zwvxPucE7Q",
        description: "以即興舞蹈與問答遊戲介紹單曲《Sunset》，適合快速了解成員性格。",
      },
    ],
  },
  {
    id: "idol-radio-lonely-night",
    name: "Idol Radio Live",
    description: "MBC FM4U 的 Idol Radio 現場表演，KNK 帶來不插電版本的《Lonely Night》以及日常分享。",
    cover: "https://i.ytimg.com/vi/Yc5GlJ9KdKY/hqdefault.jpg",
    episodes: [
      {
        id: "idol-radio-live",
        title: "Lonely Night Acoustic Stage",
        videoId: "Yc5GlJ9KdKY",
        description: "成員各自負責和聲與即興 ad-lib，展現穩定 Live 實力。",
      },
    ],
  },
];

interface SeriesProperties {
  Title: NotionTitleProperty;
  Description?: NotionRichTextProperty;
  Cover?: NotionFilesProperty;
  Episodes?: NotionRichTextProperty;
  Link?: NotionUrlProperty;
}

function parseEpisodes(raw?: string): Episode[] {
  if (!raw) {
    return [];
  }

  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [title, meta] = line.split("|").map((part) => part.trim());
      const [episodeNumber, videoId] = (meta || "").split(",").map((part) => part.trim());
      return {
        id: `${title}-${index}`,
        title,
        episodeNumber: Number(episodeNumber) || undefined,
        videoId,
      };
    });
}

function mapSeries(page: NotionPage<SeriesProperties>): VarietySeries {
  const { properties } = page;
  return {
    id: page.id,
    name: getTitleValue(properties.Title),
    description: getRichTextValue(properties.Description) || undefined,
    cover: getFirstFileUrl(properties.Cover) ?? sanitizeUrl(properties.Link?.url ?? undefined),
    episodes: parseEpisodes(getRichTextValue(properties.Episodes)),
  };
}

export async function fetchVarietySeries(): Promise<VarietySeries[]> {
  const databaseId = process.env.NOTION_VARIETY_DATABASE_ID;
  if (!databaseId || !process.env.NOTION_API_KEY) {
    return fallbackSeries;
  }

  try {
    const response = await notionClient.queryDatabase<NotionQueryResponse<SeriesProperties>>({
      database_id: databaseId,
      sorts: [{ property: "Order", direction: "ascending" }],
    });

    return response.results
      .map((page) => {
        try {
          return mapSeries(page);
        } catch (error) {
          console.warn("Failed to map variety series", error);
          return null;
        }
      })
      .filter((series): series is VarietySeries => Boolean(series));
  } catch (error) {
    console.error("Failed to fetch variety series", error);
    return fallbackSeries;
  }
}
