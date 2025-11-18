import type { QueryDataSourceResponse } from "@notionhq/client/build/src/api-endpoints";

import { notionClient } from "@/lib/notion/client";
import { getFirstFileUrl, getRichTextValue, getTitleValue, sanitizeUrl } from "@/lib/notion/utils";
import type { GroupCharm, GuideCategory, GuideData, RecommendedItem } from "@/types/guide";
import type {
  NotionFilesProperty,
  NotionMultiSelectProperty,
  NotionNumberProperty,
  NotionPage,
  NotionProperties,
  NotionRichTextProperty,
  NotionSelectProperty,
  NotionTitleProperty,
  NotionUrlProperty,
} from "@/types/notion";

const fallbackGuideData: GuideData = {
  songs: [
    {
      id: "fallback-song-1",
      title: "Sunset In My Heart",
      description: "旋律細膩、聲線層次分明，展現 KNK 溫柔的一面。",
      category: "song",
      link: "https://www.youtube.com/watch?v=tG6Z6-k7VZg",
      thumbnail: "/images/fallback-song.jpg",
      tags: ["Ballad", "Vocal"],
    },
    {
      id: "fallback-song-2",
      title: "Rain",
      description: "律動與木吉他節奏交織，副歌爆發力強。",
      category: "song",
      link: "https://www.youtube.com/watch?v=Jh3OJbGdv8w",
      thumbnail: "/images/fallback-song-2.jpg",
      tags: ["Performance", "Stage"],
    },
  ],
  shows: [
    {
      id: "fallback-show-1",
      title: "Weekly Idol - Beam Me Up",
      description: "經典一鏡到底 Random Dance，展現 KNK 身高優勢與團魂。",
      category: "stage",
      link: "https://www.youtube.com/watch?v=E3jBbtkWxN4",
      tags: ["Random Dance"],
    },
    {
      id: "fallback-show-2",
      title: "Idol Radio",
      description: "聲音遊戲與清唱片段，適合想聽 live 的粉絲。",
      category: "variety",
      link: "https://www.youtube.com/watch?v=fn2k8oSUJ3A",
      tags: ["Live", "Radio"],
    },
  ],
  charms: [
    {
      id: "charm-1",
      title: "187cm 平均身高",
      description: "「肩膀男團」稱號不是玩笑，舞台排面直接拉滿。",
      icon: "📏",
      category: "appearance",
    },
    {
      id: "charm-2",
      title: "無可取代的聲線",
      description: "主唱 Inseong 與 Heejun 的互補聲線，讓抒情歌極具爆發力。",
      icon: "🎙️",
      category: "vocal",
    },
    {
      id: "charm-3",
      title: "團魂滿點",
      description: "從練習生時期一起長大的義氣，在綜藝裡完全展現。",
      icon: "🤝",
      category: "friendship",
    },
  ],
};

type GuideDatabaseProperties = {
  Title: NotionTitleProperty;
  Description: NotionRichTextProperty;
  Category: NotionSelectProperty;
  Link: NotionUrlProperty;
  Tags: NotionMultiSelectProperty;
  Thumbnail: NotionFilesProperty;
  Order: NotionNumberProperty;
};

type CharmDatabaseProperties = {
  Title: NotionTitleProperty;
  Description: NotionRichTextProperty;
  Category: NotionSelectProperty;
  Icon: NotionRichTextProperty;
};

function mapGuideItem(page: NotionPage<GuideDatabaseProperties>): RecommendedItem {
  const { properties } = page;
  const categoryValue = properties.Category.select?.name?.toLowerCase() as GuideCategory | undefined;
  const categories: GuideCategory[] = ["song", "stage", "variety"];
  const category = categoryValue && categories.includes(categoryValue) ? categoryValue : "song";

  return {
    id: page.id,
    title: getTitleValue(properties.Title),
    description: getRichTextValue(properties.Description),
    category,
    link: sanitizeUrl(properties.Link?.url ?? undefined),
    thumbnail: getFirstFileUrl(properties.Thumbnail),
    tags: properties.Tags?.multi_select?.map((tag) => tag.name) ?? [],
  };
}

function mapCharmItem(page: NotionPage<CharmDatabaseProperties>): GroupCharm {
  const { properties } = page;
  return {
    id: page.id,
    title: getTitleValue(properties.Title),
    description: getRichTextValue(properties.Description),
    icon: getRichTextValue(properties.Icon) || "✨",
    category: properties.Category.select?.name ?? "general",
  };
}

async function fetchCharmsFromNotion() {
  const databaseId = process.env.NOTION_CHARMS_DATABASE_ID;
  if (!databaseId) {
    return fallbackGuideData.charms;
  }

  const response = (await notionClient.queryDatabase<QueryDataSourceResponse>({
    database_id: databaseId,
    sorts: [{ property: "Order", direction: "ascending" }],
  })) as QueryDataSourceResponse;

  return response.results
    .map((page) => toNotionPage<CharmDatabaseProperties>(page))
    .filter((page): page is NotionPage<CharmDatabaseProperties> => Boolean(page))
    .map((page) => mapCharmItem(page));
}

export async function fetchGuideData(): Promise<GuideData> {
  const databaseId = process.env.NOTION_GUIDE_DATABASE_ID;
  if (!databaseId || !process.env.NOTION_API_KEY) {
    return fallbackGuideData;
  }

  try {
    const [guideResponse, charms] = await Promise.all([
      notionClient.queryDatabase<QueryDataSourceResponse>({
        database_id: databaseId,
        sorts: [{ property: "Order", direction: "ascending" }],
      }),
      fetchCharmsFromNotion(),
    ]);

    const items = guideResponse.results
      .map((page) => toNotionPage<GuideDatabaseProperties>(page))
      .filter((page): page is NotionPage<GuideDatabaseProperties> => Boolean(page))
      .map((page) => mapGuideItem(page));

    return {
      songs: items.filter((item) => item.category === "song"),
      shows: items.filter((item) => item.category !== "song"),
      charms,
    };
  } catch (error) {
    console.error("Failed to fetch guide data", error);
    return fallbackGuideData;
  }
}

function isNotionPage<T extends NotionProperties>(page: unknown): page is NotionPage<T> {
  return Boolean(page) && typeof page === "object" && "properties" in (page as Record<string, unknown>);
}

function toNotionPage<T extends NotionProperties>(page: unknown): NotionPage<T> | null {
  return isNotionPage<T>(page) ? (page as NotionPage<T>) : null;
}
