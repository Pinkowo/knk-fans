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
      id: "guide-sun-moon-star",
      title: "Sun, Moon, Star (해, 달, 별)",
      description: "2017 年《Gravity》主打歌，以憂鬱合成器與層疊和聲描寫無限思念，是感受 KNK 聲線最經典的一曲。",
      category: "song",
      link: "https://www.youtube.com/watch?v=VtqT-rRQj2A",
      thumbnail: "https://i.ytimg.com/vi/VtqT-rRQj2A/maxresdefault.jpg",
      tags: ["2017", "Ballad", "Live Vocal"],
    },
    {
      id: "guide-sunset",
      title: "Sunset",
      description: "2019 年由成員親自參與作詞，將城市夜景的孤獨拉成戲劇張力，舞台走位完全展現「長腿男團」優勢。",
      category: "song",
      link: "https://www.youtube.com/watch?v=R9mW6In2-FY",
      thumbnail: "https://i.ytimg.com/vi/R9mW6In2-FY/maxresdefault.jpg",
      tags: ["2019", "Self-produced", "Performance"],
    },
    {
      id: "guide-back-again",
      title: "Back Again",
      description: "出道作中的招牌舞曲，副歌爆炸力與刁鑽 Formation 讓人立刻記住 KNK 的存在感。",
      category: "song",
      link: "https://www.youtube.com/watch?v=tp34Lfv3OLc",
      thumbnail: "https://i.ytimg.com/vi/tp34Lfv3OLc/maxresdefault.jpg",
      tags: ["Debut", "Dance", "2016"],
    },
  ],
  shows: [
    {
      id: "guide-weekly-idol",
      title: "Weekly Idol EP.297 — Random Play Dance",
      description: "2017 年 4 月播出，KNK 用 187cm 平均身高重現招牌刀群舞，還臨場改編 Limbo 挑戰。",
      category: "stage",
      link: "https://www.youtube.com/watch?v=ylFw1rMjD0I",
      tags: ["Variety", "Random Play Dance"],
    },
    {
      id: "guide-idol-room",
      title: "Idol Room — Sunset 時期專訪",
      description: "2019 年宣傳《Sunset》時在 Idol Room 展示對位舞步與個人技，適合看團魂與默契任務。",
      category: "variety",
      link: "https://www.youtube.com/watch?v=8zwvxPucE7Q",
      tags: ["Interview", "2019"],
    },
    {
      id: "guide-idol-radio",
      title: "Idol Radio Live — Lonely Night Acoustic",
      description: "MBC Idol Radio 版本的《Lonely Night》改編，直接聽見 Inseong 與 Jihun 的聲音控制。",
      category: "variety",
      link: "https://www.youtube.com/watch?v=Yc5GlJ9KdKY",
      tags: ["Live", "Radio"],
    },
  ],
  charms: [
    {
      id: "charm-height",
      title: "187 公分的舞台排面",
      description: "成員身高皆在 180cm 以上，是少數以「高層次群舞」聞名的男團。",
      icon: "📏",
      category: "appearance",
    },
    {
      id: "charm-vocal",
      title: "厚實而立體的和聲",
      description: "Inseong 與 Jihun 領軍堆疊多軌聲線，雨季概念曲《Rain》《Lonely Night》都是最佳示範。",
      icon: "🎙️",
      category: "vocal",
    },
    {
      id: "charm-self",
      title: "自作曲與導演感",
      description: "從《Lonely Night》《Sunset》開始親自作詞作曲、規劃 MV，呈現 KNK 對城市夜景的獨特審美。",
      icon: "✍️",
      category: "creative",
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
