import { defaultLocale, type AppLocale } from "@/i18n";
import { getLocalizedList, getLocalizedValue } from "@/lib/localization";
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

const groupDescription: Record<AppLocale, string> = {
  zh: "KNK（크나큰／Keunakeun，意為「要成為偉大的人」）來自首爾，由 220 Entertainment 管理，主打高挑身材與現場級和聲。2016 年以單曲專輯《Knock》出道後，靠《Sun, Moon, Star》《Lonely Night》《Sunset》等作品建立都會派抒情形象。",
  en: "KNK (크나큰, short for “Keunakeun” meaning “to be great”) is a Seoul-based group under 220 Entertainment known for tall silhouettes and stage-ready harmonies. Since debuting with the single album `Knock` in 2016 they have crafted an urbane, emotional image through songs like “Sun, Moon, Star,” “Lonely Night,” and “Sunset.”",
  ko: "KNK(크나큰, ‘위대한 사람이 되자’는 뜻의 Keunakeun)는 220엔터테인먼트 소속의 서울 기반 보이그룹으로, 큰 키와 라이브급 하모니로 사랑받는다. 2016년 싱글 앨범 `Knock`으로 데뷔한 뒤 ‘Sun, Moon, Star’, ‘Lonely Night’, ‘Sunset’ 등 곡으로 도시적인 감성을 쌓아 왔다.",
  ja: "KNK（크나큰／Keunakeun、直訳すると「偉大な人になる」）はソウルを拠点とする220 Entertainment所属のグループ。長身とライブさながらのハーモニーを武器に、2016年シングル『Knock』でデビューし、『Sun, Moon, Star』『Lonely Night』『Sunset』などで都会的な抒情イメージを築いた。",
};

const groupAchievements: Record<AppLocale, string[]> = {
  zh: [
    "2016 年 6 月迷你專輯《Awake》在 Gaon Album Chart 最高達到第 7 名，宣告正式進入主流舞台。",
    "2017 年再版 EP《Gravity, Completed》憑藉主打〈Rain〉闖入 Billboard World Albums 前 15 名。",
    "2019 年自作曲單曲〈Lonely Night〉與〈Sunset〉展現創作與編舞能力，獲得評論界好評。",
    "2020 年迷你專輯《KNK Airline》在多國 iTunes K-Pop Chart 斬獲第一，證明海外粉絲基盤。",
  ],
  en: [
    "Mini album `Awake` (2016) peaked at No. 7 on the Gaon Album Chart, signaling their step onto major stages.",
    "Repackage EP `Gravity, Completed` (2017) entered the Billboard World Albums Top 15 thanks to title track “Rain.”",
    "Self-produced singles “Lonely Night” and “Sunset” (2019) highlighted their songwriting and choreography and drew critical praise.",
    "`KNK Airline` (2020) topped iTunes K-Pop charts in multiple countries, proving their overseas fandom.",
  ],
  ko: [
    "2016년 6월 미니앨범 `Awake`가 가온 앨범 차트 7위까지 올라 주류 무대에 안착했다.",
    "2017년 리패키지 EP `Gravity, Completed`가 타이틀곡 ‘Rain’을 앞세워 빌보드 월드 앨범 차트 Top 15에 진입했다.",
    "2019년 자작 싱글 ‘Lonely Night’, ‘Sunset’으로 작사·작곡과 안무 실력을 인정받았다.",
    "2020년 미니앨범 `KNK Airline`이 다수 국가의 아이튠즈 K-Pop 차트 1위를 차지하며 글로벌 팬층을 증명했다.",
  ],
  ja: [
    "2016年6月のミニアルバム『Awake』がGaonアルバムチャート7位を記録し、本格的な主流舞台に乗った。",
    "2017年の再版EP『Gravity, Completed』はタイトル曲「Rain」でBillboard World Albums Top15にランクイン。",
    "2019年の自作シングル「Lonely Night」「Sunset」で作詞・作曲と振付の実力が評価された。",
    "2020年のミニアルバム『KNK Airline』が各国のiTunes K-Popチャートで1位を獲得し、海外ファンダムを証明した。",
  ],
};

function buildFallbackGroup(locale: AppLocale): GroupInfo {
  return {
    id: "knk",
    name: "KNK",
    debutDate: "2016-03-03",
    description: getLocalizedValue(groupDescription, locale),
    achievements: getLocalizedList(groupAchievements, locale),
    membersCount: 4,
    cover: "https://upload.wikimedia.org/wikipedia/commons/3/3a/KNK-MusicBank-2019.jpg",
  };
}

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

export async function fetchGroupInfo(locale: AppLocale = defaultLocale): Promise<GroupInfo> {
  const databaseId = process.env.NOTION_ABOUT_DATABASE_ID;
  if (!databaseId || !process.env.NOTION_API_KEY) {
    return buildFallbackGroup(locale);
  }

  try {
    const response = await notionClient.queryDatabase<NotionQueryResponse<AboutProperties>>({
      database_id: databaseId,
      page_size: 1,
    });
    if (response.results.length === 0) {
      return buildFallbackGroup(locale);
    }

    return mapGroup(response.results[0] as NotionPage<AboutProperties>);
  } catch (error) {
    console.error("Failed to fetch group info", error);
    return buildFallbackGroup(locale);
  }
}
