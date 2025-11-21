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
  description:
    "KNK（크나큰／Keunakeun，意為「要成為偉大的人」）來自首爾，由 220 Entertainment 管理，主打高挑身材與現場級和聲。2016 年以單曲專輯《Knock》出道後，靠《Sun, Moon, Star》《Lonely Night》《Sunset》等作品建立都會派抒情形象。",
  achievements: [
    "2016 年 6 月迷你專輯《Awake》在 Gaon Album Chart 最高達到第 7 名，宣告正式進入主流舞台。",
    "2017 年再版 EP《Gravity, Completed》憑藉主打〈Rain〉闖入 Billboard World Albums 前 15 名。",
    "2019 年自作曲單曲〈Lonely Night〉與〈Sunset〉展現創作與編舞能力，獲得評論界好評。",
    "2020 年迷你專輯《KNK Airline》在多國 iTunes K-Pop Chart 斬獲第一，證明海外粉絲基盤。",
  ],
  membersCount: 3,
  cover: "https://upload.wikimedia.org/wikipedia/commons/3/3a/KNK-MusicBank-2019.jpg",
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
