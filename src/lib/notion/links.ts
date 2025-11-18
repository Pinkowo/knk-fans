import { notionClient } from "@/lib/notion/client";
import { getRichTextValue, getTitleValue, sanitizeUrl } from "@/lib/notion/utils";
import type { ExternalLink } from "@/types/links";
import type {
  NotionPage,
  NotionRichTextProperty,
  NotionTitleProperty,
  NotionUrlProperty,
} from "@/types/notion";

const fallbackLinks: ExternalLink[] = [
  {
    id: "facebook",
    platform: "Facebook",
    url: "https://www.facebook.com/knkofficial",
    description: "台灣粉絲團",
  },
  {
    id: "instagram",
    platform: "Instagram",
    url: "https://www.instagram.com/knkofficial",
    description: "官方 IG",
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
    const response = await notionClient.queryDatabase({
      database_id: databaseId,
      sorts: [{ property: "Order", direction: "ascending" }],
    });

    return response.results
      .map((page) => {
        try {
          return mapLink(page as NotionPage<LinkProperties>);
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
