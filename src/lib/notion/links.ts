import { notionClient } from "@/lib/notion/client";
import { getRichTextValue, getTitleValue, sanitizeUrl } from "@/lib/notion/utils";
import type { ExternalLink } from "@/types/links";
import type {
  NotionPage,
  NotionQueryResponse,
  NotionRichTextProperty,
  NotionTitleProperty,
  NotionUrlProperty,
} from "@/types/notion";

const fallbackLinks: ExternalLink[] = [
  {
    id: "instagram",
    platform: "Instagram",
    url: "https://www.instagram.com/knk_official_knk/",
    description: "官方 IG，更新行程、概念照與 Hyunjong 入隊公告。",
    icon: "📸",
  },
  {
    id: "youtube",
    platform: "YouTube",
    url: "https://www.youtube.com/@knk_official",
    description: "크나큰 KNK 官方頻道，收看 MV、練習室與 vlog。",
    icon: "▶️",
  },
  {
    id: "twitter",
    platform: "X (Twitter)",
    url: "https://twitter.com/KNKOFFICIAL220",
    description: "即時公告、巡演行程與粉絲活動資訊。",
    icon: "🐦",
  },
  {
    id: "fancafe",
    platform: "Daum Fan Cafe",
    url: "https://cafe.daum.net/knkofficial",
    description: "韓國官方 Fan Cafe，可查閱公告、行程與成員手寫信。",
    icon: "💌",
  },
  {
    id: "spotify",
    platform: "Spotify",
    url: "https://open.spotify.com/artist/6tr0GrHnO8V9E1oSxYwJ8y",
    description: "串流 KNK 全部專輯與新單曲。",
    icon: "🎧",
  },
];

interface LinkProperties {
  Title: NotionTitleProperty;
  URL: NotionUrlProperty;
  Description?: NotionRichTextProperty;
  Icon?: NotionRichTextProperty;
}

function mapLink(page: NotionPage<LinkProperties>): ExternalLink {
  const { properties } = page;
  return {
    id: page.id,
    platform: getTitleValue(properties.Title),
    url: sanitizeUrl(properties.URL?.url ?? undefined) ?? "#",
    description: getRichTextValue(properties.Description) || undefined,
    icon: getRichTextValue(properties.Icon) || undefined,
  };
}

export async function fetchExternalLinks(): Promise<ExternalLink[]> {
  const databaseId = process.env.NOTION_LINKS_DATABASE_ID;
  if (!databaseId || !process.env.NOTION_API_KEY) {
    return fallbackLinks;
  }

  try {
    const response = await notionClient.queryDatabase<NotionQueryResponse<LinkProperties>>({
      database_id: databaseId,
      sorts: [{ property: "Order", direction: "ascending" }],
    });

    return response.results
      .map((page) => {
        try {
          return mapLink(page);
        } catch (error) {
          console.warn("Failed to map external link", error);
          return null;
        }
      })
      .filter((link): link is ExternalLink => Boolean(link));
  } catch (error) {
    console.error("Failed to fetch external links", error);
    return fallbackLinks;
  }
}
