import { notionClient } from "@/lib/notion/client";
import { getFirstFileUrl, getRichTextValue, getTitleValue } from "@/lib/notion/utils";
import type { GroupInfo } from "@/types/group";
import type {
  NotionFilesProperty,
  NotionNumberProperty,
  NotionPage,
  NotionProperties,
  NotionQueryResponse,
  NotionRichTextProperty,
  NotionTitleProperty,
} from "@/types/notion";

const fallbackGroup: GroupInfo = {
  id: "knk",
  name: "KNK",
  debutDate: "2016-03-03",
  description: "KNK（크나큰）是以長人身高與穩定 Live 聲線聞名的男子團體，擁有 Inspirits of Gravity 這個粉絲名稱。",
  achievements: [
    "2016 年以《Knock》出道",
    "連續三張迷你專輯進入韓國流行音樂排行榜",
    "在多個綜藝節目中展現幽默團魂",
  ],
  membersCount: 5,
  cover: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
};

interface AboutProperties extends NotionProperties {
  Title: NotionTitleProperty;
  DebutDate: NotionRichTextProperty;
  Description: NotionRichTextProperty;
  Achievements: NotionRichTextProperty;
  MembersCount: NotionNumberProperty;
  Cover: NotionFilesProperty;
}

function mapGroup(page: NotionPage<AboutProperties>): GroupInfo {
  const { properties } = page;
  return {
    id: page.id,
    name: getTitleValue(properties.Title),
    debutDate: getRichTextValue(properties.DebutDate) || undefined,
    description: getRichTextValue(properties.Description) || undefined,
    achievements: getRichTextValue(properties.Achievements)
      ?.split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    membersCount: properties.MembersCount?.number ?? undefined,
    cover: getFirstFileUrl(properties.Cover),
  };
}

export async function fetchGroupInfo(): Promise<GroupInfo> {
  const databaseId = process.env.NOTION_ABOUT_DATABASE_ID;
  if (!databaseId || !process.env.NOTION_API_KEY) {
    return fallbackGroup;
  }

  try {
    const response = await notionClient.queryDatabase<NotionQueryResponse<AboutProperties>>({
      database_id: databaseId,
      page_size: 1,
    });
    if (response.results.length === 0) {
      return fallbackGroup;
    }

    return mapGroup(response.results[0] as NotionPage<AboutProperties>);
  } catch (error) {
    console.error("Failed to fetch group info", error);
    return fallbackGroup;
  }
}
