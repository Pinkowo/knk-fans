import { notionClient } from "@/lib/notion/client";
import { getFirstFileUrl, getRichTextValue, getTitleValue, sanitizeUrl } from "@/lib/notion/utils";
import type {
  NotionFilesProperty,
  NotionPage,
  NotionRichTextProperty,
  NotionTitleProperty,
  NotionUrlProperty,
} from "@/types/notion";
import type { Episode, VarietySeries } from "@/types/variety";

const fallbackSeries: VarietySeries[] = [
  {
    id: "weekly-idol",
    name: "Weekly Idol",
    description: "KNK 參加 Weekly Idol 的經典集數，包含 Random Play Dance 等經典橋段。",
    cover: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=700&q=80",
    episodes: [
      {
        id: "weekly-idol-1",
        title: "Episode 1",
        episodeNumber: 1,
        videoId: "ZKpew5jvwjI",
        description: "KNK 的首次 Weekly Idol 出演，展示團魂與搞笑功力。",
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
    const response = await notionClient.queryDatabase({
      database_id: databaseId,
      sorts: [{ property: "Order", direction: "ascending" }],
    });

    return response.results
      .map((page) => {
        try {
          return mapSeries(page as NotionPage<SeriesProperties>);
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
