import { defaultLocale, type AppLocale } from "@/i18n";
import { getLocalizedValue } from "@/lib/localization";
import { notionClient } from "@/lib/notion/client";
import { getRichTextValue, getTitleValue } from "@/lib/notion/utils";
import type { GroupAchievement, GroupInfo } from "@/types/group";
import type {
  NotionPage,
  NotionProperties,
  NotionQueryResponse,
  NotionRichTextProperty,
  NotionTitleProperty,
} from "@/types/notion";

const groupDescription: Record<AppLocale, string> = {
  zh: "KNK（크나큰／Keunakeun，意為「要成為偉大的人」）來自首爾，由 220 Entertainment 管理，主打高挑身材與現場級和聲。2016 年以單曲專輯《Knock》出道後，靠《Sun, Moon, Star》《Lonely Night》《Sunset》等作品建立都會派抒情形象。",
  en: "KNK (크나큰, short for “Keunakeun” meaning “to be great”) is a Seoul-based group under 220 Entertainment known for tall silhouettes and stage-ready harmonies. Since debuting with the single album `Knock` in 2016 they have crafted an urbane, emotional image through songs like “Sun, Moon, Star,” “Lonely Night,” and “Sunset.”",
  ko: "KNK(크나큰, ‘위대한 사람이 되자’는 뜻의 Keunakeun)는 220엔터테인먼트 소속의 서울 기반 보이그룹으로, 큰 키와 라이브급 하모니로 사랑받는다. 2016년 싱글 앨범 `Knock`으로 데뷔한 뒤 ‘Sun, Moon, Star’, ‘Lonely Night’, ‘Sunset’ 등 곡으로 도시적인 감성을 쌓아 왔다.",
  ja: "KNK（크나큰／Keunakeun、直訳すると「偉大な人になる」）はソウルを拠点とする220 Entertainment所属のグループ。長身とライブさながらのハーモニーを武器に、2016年シングル『Knock』でデビューし、『Sun, Moon, Star』『Lonely Night』『Sunset』などで都会的な抒情イメージを築いた。",
};

const groupAchievements: Record<AppLocale, GroupAchievement[]> = {
  zh: [
    {
      title: "2016《Awake》",
      description: "迷你專輯在 Gaon Album Chart 攻上第 7 名，正式站上主流舞台。",
    },
    {
      title: "2017《Gravity, Completed》",
      description: "再版 EP 以主打〈Rain〉闖入 Billboard World Albums 前 15 名。",
    },
    {
      title: "2019〈Lonely Night〉·〈Sunset〉",
      description: "自作曲與原創編舞獲得評論界好評，奠定創作男團定位。",
    },
    {
      title: "2020《KNK Airline》",
      description: "多國 iTunes K-Pop Chart 奪冠，證明海外粉絲基盤。",
    },
  ],
  en: [
    {
      title: "2016 · Mini album `Awake`",
      description: "Peaked at No. 7 on the Gaon Album Chart and marked their mainstream breakthrough.",
    },
    {
      title: "2017 · `Gravity, Completed`",
      description: "The repackage with 'Rain' entered the Billboard World Albums Top 15.",
    },
    {
      title: "2019 · 'Lonely Night' & 'Sunset'",
      description: "Self-produced singles that showcased KNK's songwriting and choreography prowess.",
    },
    {
      title: "2020 · `KNK Airline`",
      description: "Topped iTunes K-Pop charts in multiple countries, proving their global fandom.",
    },
  ],
  ko: [
    {
      title: "2016 · 미니앨범 `Awake`",
      description: "가온 앨범 차트 7위로 주류 무대에 안착했다.",
    },
    {
      title: "2017 · `Gravity, Completed`",
      description: "타이틀곡 ‘Rain’과 함께 빌보드 월드 앨범 차트 Top 15에 진입했다.",
    },
    {
      title: "2019 · ‘Lonely Night’, ‘Sunset’",
      description: "자작곡과 안무 실력으로 호평을 받으며 크리에이티브 역량을 입증했다.",
    },
    {
      title: "2020 · `KNK Airline`",
      description: "여러 국가의 아이튠즈 K-Pop 차트 1위를 차지하며 글로벌 팬덤을 증명했다.",
    },
  ],
  ja: [
    {
      title: "2016『Awake』",
      description: "Gaon アルバムチャート 7 位を記録し、本格的な主流舞台へ。",
    },
    {
      title: "2017『Gravity, Completed』",
      description: "タイトル曲「Rain」で Billboard World Albums Top15 にランクイン。",
    },
    {
      title: "2019「Lonely Night」「Sunset」",
      description: "自作シングルで作曲力とパフォーマンス力が評価された。",
    },
    {
      title: "2020『KNK Airline』",
      description: "各国の iTunes K-Pop チャートで 1 位を獲得し、海外ファンダムを証明。",
    },
  ],
};

function getFallbackAchievements(locale: AppLocale): GroupAchievement[] {
  const localized = groupAchievements[locale] ?? groupAchievements[defaultLocale];
  return localized.map((item) => ({ ...item }));
}

function buildFallbackGroup(locale: AppLocale): GroupInfo {
  return {
    id: "knk",
    name: "KNK",
    debutDate: "2016.03.03",
    description: getLocalizedValue(groupDescription, locale),
    achievements: getFallbackAchievements(locale),
    membersCount: 4,
    cover: "/images/members/KNK.png",
  };
}

type AchievementLocalizedKey = `Achievements (${AppLocale})`;

interface MilestoneProperties extends NotionProperties {
  Title: NotionTitleProperty;
  Achievements?: NotionRichTextProperty;
  [key: string]: NotionRichTextProperty | NotionTitleProperty | undefined;
}

function getLocalizedAchievement(
  properties: MilestoneProperties,
  locale: AppLocale,
): string | undefined {
  const localizedKey = `Achievements (${locale})` as AchievementLocalizedKey;
  const defaultKey = `Achievements (${defaultLocale})` as AchievementLocalizedKey;
  const props = properties as Record<string, NotionRichTextProperty | undefined>;
  return (
    getRichTextValue(props[localizedKey]) ??
    getRichTextValue(props[defaultKey]) ??
    getRichTextValue(properties.Achievements)
  );
}

function mapMilestone(
  page: NotionPage<MilestoneProperties>,
  locale: AppLocale,
): GroupAchievement | null {
  const { properties } = page;
  const title = getTitleValue(properties.Title);
  const description = getLocalizedAchievement(properties, locale);
  if (!title || !description) {
    return null;
  }
  return { title, description };
}

export async function fetchGroupInfo(locale: AppLocale = defaultLocale): Promise<GroupInfo> {
  const fallback = buildFallbackGroup(locale);
  const databaseId = process.env.NOTION_ABOUT_DATABASE_ID;
  if (!databaseId || !process.env.NOTION_API_KEY) {
    return fallback;
  }

  try {
    const response = await notionClient.queryDatabase<NotionQueryResponse<MilestoneProperties>>({
      database_id: databaseId,
      page_size: 100,
      sorts: [{ property: "Title", direction: "descending" }],
    });
    const achievements = response.results
      .map((page) => mapMilestone(page as NotionPage<MilestoneProperties>, locale))
      .filter((item): item is GroupAchievement => Boolean(item));

    return {
      ...fallback,
      achievements: achievements.length > 0 ? achievements : fallback.achievements,
    };
  } catch (error) {
    console.error("Failed to fetch group info", error);
    return fallback;
  }
}
